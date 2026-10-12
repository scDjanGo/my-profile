"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { WinState } from "../WindowManager";
import { ACCENTS, playDing, system, useSystem, type AccentId } from "../system";
import { useAppLocale, useSwitchLocale } from "../i18n";
import { Segmented, Toggle } from "../controls";
import { useClock } from "../hooks";
import {
  IconBluetooth,
  IconBrush,
  IconCheck,
  IconCopy,
  IconGlobe,
  IconInfo,
  IconLeaf,
  IconMonitor,
  IconNightLight,
  IconPlane,
  IconSearch,
  IconSparkle,
  IconSun,
  IconVolume,
  IconVolumeMute,
  IconWifi,
  UserAvatar,
} from "../icons";

const SECTIONS = [
  { id: "system", Icon: IconMonitor, color: "#0078d4" },
  { id: "network", Icon: IconWifi, color: "#0063b1" },
  { id: "personalization", Icon: IconBrush, color: "#c239b3" },
  { id: "time", Icon: IconGlobe, color: "#00a35a" },
  { id: "about", Icon: IconInfo, color: "#5c6670" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function Row({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="win-setting-row">
      <span className="flex w-5 shrink-0 justify-center">{icon}</span>
      <div className="min-w-0 flex-1">
        <div>{title}</div>
        {hint && <div className="text-xs text-(--text-2)">{hint}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-3 max-sm:w-full max-sm:justify-end">{children}</div>
    </div>
  );
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[3px]">
      {title && <h3 className="mb-1 mt-4 text-sm font-semibold first:mt-0">{title}</h3>}
      {children}
    </section>
  );
}

export default function Settings({ win }: { win: WinState }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const sys = useSystem();
  const locale = useAppLocale();
  const { switchTo } = useSwitchLocale();
  const now = useClock();
  const [section, setSection] = useState<SectionId>((win.props.section as SectionId) ?? "system");
  const [seenNonce, setSeenNonce] = useState(win.props.nonce);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  if (win.props.nonce !== seenNonce) {
    setSeenNonce(win.props.nonce);
    if (win.props.section) setSection(win.props.section as SectionId);
  }

  const q = query.trim().toLowerCase();
  const nav = SECTIONS.filter((s) => !q || t(s.id).toLowerCase().includes(q));

  const specs = [
    [t("deviceName"), "ASADBEK-PC"],
    [t("processor"), "React 19 @ Next.js 16"],
    [t("ram"), "TypeScript 6 · Tailwind CSS 4"],
    [t("systemType"), t("systemTypeValue")],
    [t("edition"), t("editionValue")],
    [t("version"), "2026"],
  ];

  return (
    <div className="win-app flex h-full text-[13px] max-sm:flex-col">
      <aside className="flex w-72 shrink-0 flex-col gap-1 p-3 max-sm:w-full max-sm:flex-row max-sm:overflow-x-auto max-sm:p-2">
        <div className="mb-2 flex items-center gap-3 px-2 py-1 max-sm:hidden">
          <UserAvatar size={60} />
          <div className="min-w-0">
            <div className="font-semibold">Asadbek Kasymov</div>
            <div className="truncate text-xs text-(--text-2)">{t("account")}</div>
          </div>
        </div>
        <label className="win-field mb-2 flex h-8 items-center gap-2 px-2.5 max-sm:hidden">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("find")} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--text-2)" />
          <IconSearch className="opacity-70" />
        </label>
        {nav.length === 0 && <p className="px-3 py-2 text-(--text-2)">{t("noResults")}</p>}
        {nav.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`relative flex shrink-0 items-center gap-3 rounded px-3 py-2 text-left hover:bg-(--hover) ${section === s.id ? "bg-(--hover)" : ""}`}
          >
            {section === s.id && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-(--accent)" />}
            <s.Icon size={16} style={{ color: s.color }} />
            {t(s.id)}
          </button>
        ))}
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-8 pb-8 pt-3 max-sm:px-3">
        <h1 className="mb-5 text-[28px] font-semibold max-sm:text-xl">{t(section)}</h1>

        {section === "system" && (
          <>
            <Group title={t("display")}>
              <Row icon={<IconSun />} title={t("brightness")} hint={t("brightnessHint")}>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={sys.brightness}
                  aria-label={t("brightness")}
                  onChange={(e) => system.set({ brightness: +e.target.value })}
                  className="win-range w-48"
                />
              </Row>
              <Row icon={<IconNightLight />} title={t("nightLight")} hint={t("nightLightHint")}>
                <span className="text-(--text-2)">{sys.nightLight ? tc("on") : tc("off")}</span>
                <Toggle on={sys.nightLight} label={t("nightLight")} onChange={(v) => system.set({ nightLight: v })} />
              </Row>
              <Row icon={<IconLeaf />} title={t("energy")} hint={t("energyHint")}>
                <span className="text-(--text-2)">{sys.energySaver ? tc("on") : tc("off")}</span>
                <Toggle on={sys.energySaver} label={t("energy")} onChange={(v) => system.set({ energySaver: v })} />
              </Row>
            </Group>
            <Group title={t("sound")}>
              <Row icon={sys.muted ? <IconVolumeMute /> : <IconVolume />} title={t("volume")}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sys.volume}
                  aria-label={t("volume")}
                  onChange={(e) => system.set({ volume: +e.target.value, muted: false })}
                  onPointerUp={() => playDing(sys.volume)}
                  className="win-range w-48"
                />
                <span className="w-8 text-right tabular-nums">{sys.volume}</span>
              </Row>
              <Row icon={<IconVolumeMute />} title={t("mute")}>
                <Toggle on={sys.muted} label={t("mute")} onChange={(v) => system.set({ muted: v })} />
              </Row>
            </Group>
            <Group>
              <button className="win-setting-row text-left hover:bg-(--hover)" onClick={() => setSection("about")}>
                <span className="flex w-5 justify-center">
                  <IconInfo />
                </span>
                <span className="flex-1">{t("about")}</span>
              </button>
            </Group>
          </>
        )}

        {section === "network" && (
          <Group>
            <Row icon={<IconWifi />} title={t("wifi")} hint={sys.wifi ? t("wifiHint") : undefined}>
              <Toggle on={sys.wifi} label={t("wifi")} onChange={(v) => system.set({ wifi: v })} />
            </Row>
            <Row icon={<IconPlane />} title={t("airplane")} hint={t("airplaneHint")}>
              <Toggle on={sys.airplane} label={t("airplane")} onChange={(v) => system.set({ airplane: v })} />
            </Row>
            <Row icon={<IconBluetooth />} title={t("bluetooth")} hint={sys.bluetooth ? t("bluetoothHint") : undefined}>
              <Toggle on={sys.bluetooth} label={t("bluetooth")} onChange={(v) => system.set({ bluetooth: v })} />
            </Row>
          </Group>
        )}

        {section === "personalization" && (
          <>
            <Group>
              <Row icon={<IconBrush />} title={t("mode")} hint={t("modeHint")}>
                <Segmented
                  value={sys.theme}
                  onChange={(v) => system.set({ theme: v })}
                  options={[
                    { value: "light", label: t("light") },
                    { value: "dark", label: t("dark") },
                  ]}
                />
              </Row>
              <div className="win-setting-row flex-col items-stretch!">
                <div>{t("accent")}</div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ACCENTS) as AccentId[]).map((a) => (
                    <button
                      key={a}
                      aria-label={a}
                      aria-pressed={sys.accent === a}
                      onClick={() => system.set({ accent: a })}
                      className="flex size-10 items-center justify-center rounded-md text-white ring-offset-2 ring-offset-(--card) transition hover:scale-105"
                      style={{ background: ACCENTS[a][sys.theme], boxShadow: sys.accent === a ? `0 0 0 2px ${ACCENTS[a][sys.theme]}` : undefined }}
                    >
                      {sys.accent === a && <IconCheck className={sys.theme === "dark" ? "text-black" : ""} />}
                    </button>
                  ))}
                </div>
              </div>
              <Row icon={<IconSparkle />} title={t("wallpaper3d")} hint={t("wallpaper3dHint")}>
                <span className="text-(--text-2)">{sys.wallpaper3d ? tc("on") : tc("off")}</span>
                <Toggle on={sys.wallpaper3d} label={t("wallpaper3d")} onChange={(v) => system.set({ wallpaper3d: v })} />
              </Row>
              <Row icon={<IconMonitor />} title={t("iconSize")}>
                <Segmented
                  value={sys.iconSize}
                  onChange={(v) => system.set({ iconSize: v })}
                  options={(["small", "medium", "large"] as const).map((v) => ({ value: v, label: v === "small" ? "S" : v === "medium" ? "M" : "L" }))}
                />
              </Row>
            </Group>
          </>
        )}

        {section === "time" && (
          <Group>
            <Row icon={<IconGlobe />} title={t("language")} hint={t("languageHint")}>
              <Segmented
                value={locale}
                onChange={(v) => switchTo(v)}
                options={[
                  { value: "en", label: "English" },
                  { value: "ru", label: "Русский" },
                ]}
              />
            </Row>
            <Row icon={<IconGlobe />} title={t("clock")}>
              <span className="tabular-nums" suppressHydrationWarning>
                {now?.toLocaleString(locale, { dateStyle: "full", timeStyle: "short" })}
              </span>
            </Row>
            <Row icon={<IconGlobe />} title={t("region")}>
              <span suppressHydrationWarning>{now ? Intl.DateTimeFormat().resolvedOptions().timeZone : ""}</span>
            </Row>
          </Group>
        )}

        {section === "about" && (
          <Group>
            <div className="win-setting-row items-start!">
              <IconMonitor size={20} />
              <div className="flex-1">
                <div className="mb-2 font-semibold">{t("deviceSpecs")}</div>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-1.5">
                  {specs.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-(--text-2)">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <button
                className="win-btn flex items-center gap-1.5"
                onClick={() => {
                  navigator.clipboard?.writeText(specs.map(([k, v]) => `${k}\t${v}`).join("\n"));
                  setCopied(true);
                }}
              >
                <IconCopy /> {copied ? tc("copied") : tc("copy")}
              </button>
            </div>
          </Group>
        )}
      </main>
    </div>
  );
}
