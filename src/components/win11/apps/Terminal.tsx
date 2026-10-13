"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { FS, type AppId, type FsNode } from "@/data/desktop";
import { useWM, type WinState } from "../WindowManager";
import { childrenOf, nodeOf, useFs } from "../fs";
import { useAppLocale, useFsLabels } from "../i18n";
import { useLauncher } from "../launcher";
import { useShell } from "../shell";
import { isOnline, system } from "../system";
import { collectDeviceInfo, collectNetInfo, flushNetInfo, httpPing, resolveHost } from "./network";
import { HOSTNAME, TERMINAL_TEXT, USERNAME, WIN_VERSION } from "./terminal-text";

/** The 16 console colors of Windows Terminal's "Campbell" scheme, indexed like COLOR's hex digits */
const PALETTE = [
  "#0C0C0C", "#0037DA", "#13A10E", "#3A96DD", "#C50F1F", "#881798", "#C19C00", "#CCCCCC",
  "#767676", "#3B78FF", "#16C60C", "#61D6D6", "#E74856", "#B4009E", "#F9F1A5", "#F2F2F2",
];
const DEFAULT_COLOR = { bg: 0, fg: 7 };

const EXE: Record<AppId, string> = {
  explorer: "explorer.exe",
  browser: "chrome.exe",
  profile: "AboutMe.exe",
  notepad: "notepad.exe",
  pdf: "msedge.exe",
  settings: "SystemSettings.exe",
  calculator: "CalculatorApp.exe",
  paint: "mspaint.exe",
  solitaire: "Solitaire.exe",
  terminal: "cmd.exe",
  run: "rundll32.exe",
};

/** Shell processes that are always "running" and refuse to die */
const SYSTEM_PROCS = [
  { name: "System Idle Process", pid: 0, services: true, mem: 8 },
  { name: "System", pid: 4, services: true, mem: 7_412 },
  { name: "dwm.exe", pid: 1388, services: false, mem: 98_204 },
  { name: "explorer.exe", pid: 4120, services: false, mem: 142_516 },
];

const COMMANDS = [
  "cd", "cls", "color", "date", "dir", "echo", "exit", "help", "hostname", "ipconfig", "nslookup",
  "ping", "shutdown", "start", "systeminfo", "taskkill", "tasklist", "time", "tree", "type", "ver", "whoami",
] as const;
type Command = (typeof COMMANDS)[number];

const bootTime = new Date();
let pendingShutdown: ReturnType<typeof setTimeout> | null = null;

const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (clearTimeout(t), resolve()), { once: true });
  });

const pidOf = (w: WinState) => 2000 + Number(w.id.split("-").pop()) * 1176;

/** `ipconfig`-style "Label . . . . . : value" row; dots sit on fixed columns so they line up */
const row = (label: string, value: string) => {
  let out = `   ${label}`;
  while (out.length < 38) out += out.length % 2 ? " " : ".";
  return `${out}: ${value}`;
};

export default function Terminal({ win }: { win: WinState }) {
  const locale = useAppLocale();
  const T = TERMINAL_TEXT[locale];
  const readme = useTranslations("notepad")("readme");
  const labels = useFsLabels();
  const fsState = useFs();
  const { windows, dispatch, open, openNode } = useWM();
  const launch = useLauncher();
  const shell = useShell();

  const [lines, setLines] = useState<string[]>(() => [...T.banner, ""]);
  const [cwd, setCwd] = useState<string[]>(["c"]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const history = useRef<string[]>([]);
  const histPos = useRef(-1);
  const abort = useRef<AbortController | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // warm up the network lookups so the first `ipconfig` answers instantly
  useEffect(() => {
    collectNetInfo().catch(() => {});
    return () => abort.current?.abort();
  }, []);

  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, running]);

  const print = (...out: (string | string[])[]) => setLines((l) => [...l, ...out.flat()].slice(-2000));
  const nf = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US");

  /* ---------- Virtual paths: C:\Projects\… mapped onto the fs nodes ---------- */

  const driveOf = (id: string) => FS[id]?.drive;
  const volumeLabel = (id: string) => labels.name(FS[id]).replace(/\s*\([A-Z]:\)$/, "");
  const fileName = (n: FsNode) => {
    const base = labels.name(n);
    if (n.kind === "folder" || n.kind === "file" || /\.\w{2,4}$/.test(base)) return base;
    return n.kind === "link" ? `${base}.url` : `${base}.lnk`;
  };
  const pathOf = (p: string[]) => `${driveOf(p[0])!.letter}:\\${p.slice(1).map((id) => labels.name(nodeOf(fsState, id)!)).join("\\")}`;
  const prompt = `${pathOf(cwd)}>`;
  const listOf = (folder: string) => childrenOf(fsState, folder).map((id) => nodeOf(fsState, id)!);
  const findChild = (folder: string, name: string) => {
    const q = name.toLowerCase();
    return listOf(folder).find((n) => labels.name(n).toLowerCase() === q || n.name.toLowerCase() === q || fileName(n).toLowerCase() === q);
  };

  const resolve = (arg: string): { path: string[]; node?: FsNode } | null => {
    let path = [...cwd];
    let rest = arg.replace(/\//g, "\\");
    const drive = /^([a-z]):/i.exec(rest);
    if (drive) {
      const id = drive[1].toLowerCase();
      if (!driveOf(id)) return null;
      path = [id];
      rest = rest.slice(2);
    }
    if (rest.startsWith("\\")) path = [path[0]];
    const parts = rest.split("\\").filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === ".") continue;
      if (parts[i] === "..") {
        if (path.length > 1) path.pop();
        continue;
      }
      const child = findChild(path[path.length - 1], parts[i]);
      if (!child) return null;
      if (child.kind === "folder") path.push(child.id);
      else if (i === parts.length - 1) return { path, node: child };
      else return null;
    }
    return { path };
  };

  const sizeOf = (n: FsNode) => {
    if (n.id === "readme") return new TextEncoder().encode(readme).length;
    if (n.navigate) return 66_048;
    if (n.kind === "link") return `[InternetShortcut]\r\nURL=${n.url}\r\n`.length;
    if (n.type === "pdf") return 182_917;
    return 1_024 + (hash(n.id) % 3_000);
  };

  const stamp = () => {
    const tag = locale === "ru" ? "ru-RU" : "en-US";
    const d = bootTime.toLocaleDateString(tag, { day: "2-digit", month: "2-digit", year: "numeric" });
    const t = bootTime.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" });
    return `${d}  ${t.padStart(8)}`;
  };

  /* ---------- Commands ---------- */

  const dir = (arg: string) => {
    const target = arg ? resolve(arg) : { path: cwd };
    if (!target || target.node) return print(T.fileNotFound);
    const drive = driveOf(target.path[0])!;
    const when = stamp();
    const rows: string[] = [];
    const dirRow = (name: string) => `${when}    <DIR>          ${name}`;
    if (target.path.length > 1) rows.push(dirRow("."), dirRow(".."));
    let files = 0;
    let bytes = 0;
    let dirs = rows.length;
    for (const n of listOf(target.path[target.path.length - 1])) {
      if (n.kind === "folder") {
        rows.push(dirRow(fileName(n)));
        dirs++;
      } else {
        const size = sizeOf(n);
        files++;
        bytes += size;
        rows.push(`${when}    ${nf.format(size).padStart(14)} ${fileName(n)}`);
      }
    }
    print(
      T.dir.volume(drive.letter, volumeLabel(target.path[0])),
      T.dir.serial,
      "",
      T.dir.of(pathOf(target.path)),
      "",
      ...rows,
      `${" ".repeat(15)}${T.dir.files(String(files), nf.format(bytes).padStart(14))}`,
      `${" ".repeat(15)}${T.dir.dirs(String(dirs), nf.format(Math.round(drive.free * 1024 ** 3)))}`,
    );
  };

  const tree = (arg: string) => {
    const withFiles = /\/f/i.test(arg);
    const target = resolve(arg.replace(/\/f/gi, "").trim()) ?? null;
    if (!target || target.node) return print(T.pathNotFound);
    const walk = (id: string, prefix: string, depth: number): string[] => {
      if (depth > 8) return [];
      const kids = listOf(id);
      const folders = kids.filter((n) => n.kind === "folder");
      const out: string[] = [];
      if (withFiles) {
        const files = kids.filter((n) => n.kind !== "folder");
        files.forEach((n) => out.push(`${prefix}${folders.length ? "│   " : "    "}${fileName(n)}`));
        if (files.length) out.push(`${prefix}${folders.length ? "│" : ""}`);
      }
      folders.forEach((f, i) => {
        const last = i === folders.length - 1;
        out.push(`${prefix}${last ? "└───" : "├───"}${fileName(f)}`);
        out.push(...walk(f.id, prefix + (last ? "    " : "│   "), depth + 1));
      });
      return out;
    };
    const top = target.path[target.path.length - 1];
    print(...T.tree(volumeLabel(target.path[0])), target.path.length > 1 ? pathOf(target.path) : `${driveOf(top)!.letter}:.`, ...walk(top, "", 0));
  };

  const type = (arg: string) => {
    if (!arg) return print(T.syntax);
    const target = resolve(arg);
    if (!target) return print(T.fileNotFound);
    const n = target.node;
    if (!n) return print(T.accessDenied);
    if (n.id === "readme") return print(...readme.split("\n"));
    if (n.kind === "link" && !n.navigate) return print("[InternetShortcut]", `URL=${n.url}`);
    if (n.type === "pdf") return print("%PDF-1.7", "%âãÏÓ", "1 0 obj", `<< /Type /Catalog /Pages 2 0 R /Lang (${locale}) >>`, "endobj");
    return print("MZ\u0090\u0003\u0004ÿÿ¸@\u000e\u001fº\u000e´\tÍ!¸\u0001LÍ!This program cannot be run in DOS mode.");
  };

  const ipconfig = async (args: string[], signal: AbortSignal) => {
    const I = T.ipconfig;
    const flag = args[0]?.toLowerCase();
    if (flag === "/?" || (flag && !["/all", "/release", "/renew", "/flushdns"].includes(flag))) return print(...I.usage);
    if (flag === "/release") {
      system.set({ wifi: false });
      return print("", I.title, "", I.released);
    }
    if (flag === "/flushdns") {
      flushNetInfo();
      return print("", I.title, "", I.flushed);
    }
    if (flag === "/renew") {
      system.set({ wifi: true });
      flushNetInfo();
    }
    const all = flag === "/all";
    const out = ["", I.title, ""];
    if (all) out.push(row(I.hostName, HOSTNAME), row(I.online, navigator.onLine ? I.yes : I.no), "");

    if (!isOnline(system.get()) || !navigator.onLine) {
      return print(...out, I.wifi, "", row(I.mediaState, I.disconnected), row(I.dnsSuffix, ""));
    }

    const [info, device] = await Promise.all([collectNetInfo(), all ? collectDeviceInfo() : null]);
    if (signal.aborted) return;
    out.push(info.type === "ethernet" ? I.ethernet : info.type === "cellular" ? I.cellular : I.wifi, "");
    out.push(row(I.dnsSuffix, info.geo?.domain ?? ""));
    if (all && device) {
      out.push(row(I.description, I.descriptionValue(device.browser)));
      out.push(row(I.connType, info.type ?? I.unknown));
      if (info.effectiveType) out.push(row(I.effective, info.effectiveType));
      if (info.downlink !== undefined) out.push(row(I.downlink, `${info.downlink} ${I.mbps}`));
      if (info.rtt !== undefined) out.push(row(I.rtt, `${info.rtt} ${I.ms}`));
      if (info.saveData !== undefined) out.push(row(I.saveData, info.saveData ? I.yes : I.no));
    }
    info.hosts.filter((h) => !h.endsWith(".local")).forEach((ip) => out.push(row(I.localIp, ip)));
    if (all) info.hosts.filter((h) => h.endsWith(".local")).forEach((h) => out.push(row(I.mdns, h)));
    if (info.ipv6) out.push(row(I.publicV6, info.ipv6));
    if (info.ipv4) out.push(row(I.publicV4, info.ipv4));
    if (all) {
      info.reflexive.filter((r) => r !== info.ipv4 && r !== info.ipv6).forEach((r) => out.push(row(I.stun, r)));
      const g = info.geo;
      if (g) {
        if (g.isp) out.push(row(I.isp, g.isp));
        if (g.org && g.org !== g.isp) out.push(row(I.org, g.org));
        if (g.asn) out.push(row(I.asn, g.asn));
        const place = [g.city, g.region, g.country].filter(Boolean).join(", ");
        if (place) out.push(row(I.location, g.countryCode ? `${place} (${g.countryCode})` : place));
        if (g.postal) out.push(row(I.postal, g.postal));
        if (g.lat !== undefined && g.lon !== undefined) out.push(row(I.coords, `${g.lat.toFixed(2)}, ${g.lon.toFixed(2)}`));
        if (g.timezone) out.push(row(I.timezone, g.utc ? `${g.timezone} (UTC${g.utc})` : g.timezone));
      }
    }
    if (!info.ipv4 && !info.ipv6 && !info.geo) out.push("", `   ${I.lookupFailed}`);
    print(...out);
  };

  const ping = async (args: string[], signal: AbortSignal) => {
    const P = T.ping;
    let count = 4;
    let forever = false;
    let host = "";
    for (let i = 0; i < args.length; i++) {
      const a = args[i].toLowerCase();
      if (a === "-t" || a === "/t") forever = true;
      else if ((a === "-n" || a === "/n") && args[i + 1]) count = Math.max(1, Math.min(100, Number(args[++i]) || 4));
      else if (!a.startsWith("-") && !a.startsWith("/")) host = args[i].replace(/^https?:\/\//, "").split("/")[0];
    }
    if (!host) return print(...P.usage);
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    const ip = isIp ? host : (await resolveHost(host))[0];
    if (signal.aborted) return;
    if (!ip) return print(P.noHost(host));
    print("", P.header(host, ip));
    const times: number[] = [];
    let sent = 0;
    while ((forever || sent < count) && !signal.aborted) {
      const started = performance.now();
      if (!isOnline(system.get())) {
        sent++;
        print(P.failure);
      } else {
        const ms = await httpPing(host, signal);
        if (signal.aborted) break;
        sent++;
        if (ms === null) print(P.timeout);
        else {
          times.push(ms);
          print(P.reply(ip, ms));
        }
      }
      if (forever || sent < count) await sleep(Math.max(0, 1000 - (performance.now() - started)), signal);
    }
    print(...P.stats(ip, sent, times.length));
    if (times.length) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      print(...P.times(Math.min(...times), Math.max(...times), avg));
    }
    if (signal.aborted) print(P.control);
  };

  const nslookup = async (args: string[], signal: AbortSignal) => {
    const N = T.nslookup;
    const host = args[0];
    if (!host) return print(N.usage);
    const [a, aaaa] = await Promise.all([resolveHost(host, "A"), resolveHost(host, "AAAA")]);
    if (signal.aborted) return;
    print(N.server, N.address, "");
    const found = [...aaaa, ...a];
    if (!found.length) return print(N.notFound(host));
    print(
      N.answer,
      `${N.name.padEnd(9)}${host}`,
      found.length > 1 ? `${N.addresses}  ${found[0]}` : `Address:  ${found[0]}`,
      ...found.slice(1).map((x) => `          ${x}`),
    );
  };

  const systeminfo = async (signal: AbortSignal) => {
    const S = T.systeminfo;
    const d = await collectDeviceInfo();
    if (signal.aborted) return;
    const col = (label: string, value: string) => `${`${label}:`.padEnd(32)}${value}`;
    const major = Number(d.platformVersion?.split(".")[0] ?? 0);
    let platform = d.platform;
    if (/windows/i.test(d.platform) && major) platform = major >= 13 ? "Windows 11" : "Windows 10";
    else if (d.platformVersion) platform = `${d.platform} ${d.platformVersion}`;
    if (d.model) platform += ` (${d.model})`;
    const arch = d.architecture === "arm" ? "ARM64-based PC" : d.bitness === "32" ? "X86-based PC" : "x64-based PC";
    const offset = -new Date().getTimezoneOffset();
    const utc = `UTC${offset >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0")}:${String(Math.abs(offset) % 60).padStart(2, "0")}`;
    print(
      "",
      col(S.host, HOSTNAME),
      col(S.os, S.osValue),
      col(S.version, `${WIN_VERSION.split(".").slice(0, 3).join(".")} N/A Build ${WIN_VERSION.split(".")[2]}`),
      col(S.type, arch),
      col(S.cpu, S.cpuValue(d.cores ?? 1)),
      ...(d.memory ? [col(S.memory, S.memoryValue(d.memory))] : []),
      col(S.device, platform),
      col(S.browser, d.browser),
      col(S.display, `${d.screen} @${d.pixelRatio}x`),
      col(S.locale, d.languages.join(", ")),
      col(S.zone, `(${utc}) ${d.timezone}`),
      col(S.boot, bootTime.toLocaleString(locale === "ru" ? "ru-RU" : "en-US")),
    );
  };

  const tasklist = () => {
    const procRow = (name: string, pid: number, services: boolean, mem: number) =>
      `${name.padEnd(25).slice(0, 25)} ${String(pid).padStart(8)} ${(services ? T.tasklist.services : "Console").padEnd(16)} ${String(services ? 0 : 1).padStart(11)} ${`${nf.format(mem)} ${T.tasklist.kb}`.padStart(12)}`;
    print(
      "",
      ...T.tasklist.header,
      ...SYSTEM_PROCS.map((p) => procRow(p.name, p.pid, p.services, p.mem)),
      ...windows.map((w) => procRow(EXE[w.app], pidOf(w), false, 18_000 + (hash(w.id) % 160_000))),
    );
  };

  const taskkill = (args: string[]) => {
    const K = T.taskkill;
    const after = (flag: string) => {
      const i = args.findIndex((a) => a.toLowerCase() === flag);
      return i >= 0 ? args[i + 1] : undefined;
    };
    const im = after("/im");
    const pid = after("/pid");
    if (!im && !pid) return print(K.usage);
    const sys = SYSTEM_PROCS.find((p) => (im ? p.name.toLowerCase() === im.toLowerCase() : p.pid === Number(pid)));
    if (sys) return print(...K.critical(sys.name, sys.pid));
    const victims = windows.filter((w) => (im ? EXE[w.app].toLowerCase() === im.toLowerCase() : pidOf(w) === Number(pid)));
    if (!victims.length) return print(K.notFound((im ?? pid)!));
    victims.forEach((w) => print(K.ok(EXE[w.app], pidOf(w))));
    // the visitor may well kill this very cmd.exe — let the output render first
    setTimeout(() => victims.forEach((w) => dispatch({ type: "close", id: w.id })), 400);
  };

  const shutdown = (args: string[]) => {
    const S = T.shutdown;
    const flag = args[0]?.toLowerCase().replace("-", "/");
    if (flag === "/a") {
      if (!pendingShutdown) return print(S.nothing);
      clearTimeout(pendingShutdown);
      pendingShutdown = null;
      return print(S.aborted);
    }
    if (flag === "/l") return shell.lock();
    if (flag !== "/s" && flag !== "/r") return print(...S.usage);
    print(S.scheduled);
    if (pendingShutdown) clearTimeout(pendingShutdown);
    pendingShutdown = setTimeout(() => {
      pendingShutdown = null;
      if (flag === "/s") shell.shutdown();
      else shell.restart();
    }, 5000);
  };

  const start = (arg: string) => {
    if (!arg) return open("terminal");
    if (arg === ".") return open("explorer", { folder: cwd[cwd.length - 1] });
    const target = resolve(arg);
    if (target?.node) return openNode(target.node);
    if (target) return open("explorer", { folder: target.path[target.path.length - 1] });
    if (!launch(arg)) print(T.fileNotFound);
  };

  const help = (arg: string) => {
    const cmd = arg.toLowerCase() as Command;
    if (arg) {
      if (!COMMANDS.includes(cmd)) return print(T.noHelp(arg.toUpperCase()));
      print(T.commands[cmd]);
      if (cmd === "ipconfig") print("", ...T.ipconfig.usage);
      if (cmd === "ping") print("", ...T.ping.usage);
      if (cmd === "shutdown") print("", ...T.shutdown.usage);
      return;
    }
    print(T.helpHeader, ...COMMANDS.map((c) => `${c.toUpperCase().padEnd(15)}${T.commands[c]}`));
  };

  /* ---------- Interpreter ---------- */

  const exec = async (raw: string, signal: AbortSignal) => {
    const tag = locale === "ru" ? "ru-RU" : "en-US";
    const now = new Date();
    const env: Record<string, string> = {
      USERNAME,
      COMPUTERNAME: HOSTNAME,
      USERDOMAIN: HOSTNAME,
      OS: "Windows_NT",
      PROCESSOR_ARCHITECTURE: "AMD64",
      CD: pathOf(cwd),
      DATE: now.toLocaleDateString(tag),
      TIME: now.toLocaleTimeString(tag),
      RANDOM: String(Math.floor(Math.random() * 32768)),
    };
    const line = raw.replace(/%(\w+)%/g, (m, k: string) => env[k.toUpperCase()] ?? m).trim();

    const drive = /^([a-z]):\\?$/i.exec(line);
    if (drive) {
      const id = drive[1].toLowerCase();
      return driveOf(id) ? setCwd([id]) : print(T.driveNotFound);
    }

    const match = /^([^\s./\\]+)(.*)$/.exec(line);
    const name = (match?.[1] ?? "").toLowerCase();
    const tail = (match?.[2] ?? "").replace(/^\.exe\b/i, "");
    const rest = tail.trim().replace(/^"(.*)"$/, "$1");
    const args = (rest.match(/"[^"]*"|\S+/g) ?? []).map((a) => a.replace(/^"|"$/g, ""));

    if (COMMANDS.includes(name as Command) && rest === "/?") return help(name);

    switch (name) {
      case "cls":
        return setLines([]);
      case "echo":
        if (tail.startsWith(".")) return print(tail.slice(1));
        return print(rest ? tail.replace(/^\s/, "") : T.echoOn);
      case "ver":
        return print("", `Microsoft Windows [Version ${WIN_VERSION}]`);
      case "whoami":
        return print(`${HOSTNAME.toLowerCase()}\\${USERNAME}`);
      case "hostname":
        return print(HOSTNAME);
      case "date":
        return print(rest.toLowerCase() === "/t" ? now.toLocaleDateString(tag) : T.date(now.toLocaleDateString(tag, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })));
      case "time":
        return print(rest.toLowerCase() === "/t" ? now.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" }) : T.time(now.toLocaleTimeString(tag)));
      case "cd": {
        if (!rest) return print(pathOf(cwd));
        const target = resolve(rest.replace(/^\/d\s+/i, ""));
        if (!target || target.node) return print(T.pathNotFound);
        return setCwd(target.path);
      }
      case "dir":
        return dir(rest);
      case "tree":
        return tree(rest);
      case "type":
        return type(rest);
      case "start":
        return start(rest);
      case "help":
        return help(rest);
      case "exit":
        return dispatch({ type: "close", id: win.id });
      case "color": {
        if (!rest) return setColor(DEFAULT_COLOR);
        if (!/^[0-9a-f]{1,2}$/i.test(rest)) return print(T.color);
        const v = rest.padStart(2, "0");
        const next = { bg: parseInt(v[0], 16), fg: parseInt(v[1], 16) };
        if (next.bg !== next.fg) setColor(next);
        return;
      }
      case "ipconfig":
        return ipconfig(args, signal);
      case "ping":
        return ping(args, signal);
      case "nslookup":
        return nslookup(args, signal);
      case "systeminfo":
        return systeminfo(signal);
      case "tasklist":
        return tasklist();
      case "taskkill":
        return taskkill(args);
      case "shutdown":
        return shutdown(args);
    }

    // Not a built-in: run a file from the current folder, then a program by name
    const token = line.match(/^"[^"]*"|^\S+/)?.[0].replace(/"/g, "") ?? line;
    const local = findChild(cwd[cwd.length - 1], token) ?? findChild(cwd[cwd.length - 1], line);
    if (local && local.kind !== "folder") return openNode(local);
    if (launch(token, { urls: false })) return;
    print(...T.notRecognized(token));
  };

  const submit = async () => {
    const line = input;
    print(`${prompt}${line}`);
    setInput("");
    histPos.current = -1;
    if (!line.trim()) return;
    history.current = [line, ...history.current.filter((h) => h !== line)].slice(0, 50);
    const ctrl = new AbortController();
    abort.current = ctrl;
    setRunning(true);
    try {
      await exec(line, ctrl.signal);
    } finally {
      abort.current = null;
      setRunning(false);
      // cmd separates a command's output from the next prompt with a blank line
      if (!/^\s*cls\s*$/i.test(line)) setLines((l) => (l.length && l[l.length - 1] !== "" ? [...l, ""] : l));
      requestAnimationFrame(() => field.current?.focus());
    }
  };

  const complete = () => {
    const m = /^(.*?)("?)([^"\s\\]*)$/.exec(input);
    if (!m) return;
    const [, head, , partial] = m;
    const q = partial.toLowerCase();
    const pool = head.trim() ? listOf(cwd[cwd.length - 1]).map(fileName) : [...COMMANDS, ...listOf(cwd[cwd.length - 1]).map(fileName)];
    const hit = pool.find((p) => p.toLowerCase().startsWith(q) && p.toLowerCase() !== q);
    if (hit) setInput(`${head}${hit.includes(" ") ? `"${hit}"` : hit}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key.toLowerCase();
    if (e.ctrlKey && key === "c") {
      const el = e.currentTarget;
      if (el.selectionStart !== el.selectionEnd || window.getSelection()?.toString()) return;
      e.preventDefault();
      if (abort.current) {
        abort.current.abort();
        print("^C");
      } else {
        print(`${prompt}${input}^C`);
        setInput("");
      }
      return;
    }
    if (e.ctrlKey && key === "l") {
      e.preventDefault();
      return setLines([]);
    }
    if (running) return;
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      const next = e.key === "ArrowUp" ? Math.min(h.length - 1, histPos.current + 1) : Math.max(-1, histPos.current - 1);
      histPos.current = next;
      setInput(next < 0 ? "" : h[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setInput("");
    }
  };

  return (
    <div
      className="win-app h-full outline-none"
      style={{ background: PALETTE[color.bg], color: PALETTE[color.fg] }}
      onClick={() => {
        if (!window.getSelection()?.toString()) field.current?.focus();
      }}
    >
      <div ref={screen} className="win-terminal h-full overflow-y-auto px-2.5 py-2">
        {lines.map((l, i) => (
          <div key={i}>{l || "\u00a0"}</div>
        ))}
        <div className="flex">
          {!running && <span>{prompt}</span>}
          <input
            ref={field}
            autoFocus
            aria-label={prompt}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            readOnly={running}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className={running ? "w-0 opacity-0" : "min-w-0 flex-1 bg-transparent p-0 outline-none"}
            style={{ caretColor: PALETTE[color.fg], font: "inherit", color: "inherit" }}
          />
        </div>
      </div>
    </div>
  );
}
