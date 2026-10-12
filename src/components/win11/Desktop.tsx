"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import DesktopIcons from "./DesktopIcons";
import LockScreen, { PowerScreen } from "./LockScreen";
import StartMenu from "./StartMenu";
import { HiddenIcons, LanguageFlyout, NoticeBody, NotificationCenter, QuickSettings, Taskbar, type Notice, type Panel } from "./Taskbar";
import Window from "./Window";
import Wallpaper3D, { setWallpaperCovered } from "./Wallpaper3D";
import { TASKBAR_H, WindowManager, useWM, useWindowInfo } from "./WindowManager";
import { fs, nodeOf, useFs } from "./fs";
import { useAppLocale, useSwitchLocale } from "./i18n";
import { effectiveBrightness, system, useSystem } from "./system";
import Menu, { type MenuEntry } from "./Menu";
import {
  AppIcon,
  IconBrush,
  IconClose,
  IconCopy,
  IconExternal,
  IconEye,
  IconGear,
  IconGlobe,
  IconInfo,
  IconPlus,
  IconRefresh,
  IconSort,
} from "./icons";

type Power = "boot" | "locked" | "on" | "shutdown" | "restart" | "off";
type Band = { x0: number; y0: number; x1: number; y1: number } | null;

const INITIAL_NOTICES: Notice[] = [
  { id: "welcome", kind: "welcome" },
  { id: "cv", kind: "cv" },
];

function TaskView({ close }: { close: () => void }) {
  const { windows, dispatch } = useWM();
  const info = useWindowInfo();
  const t = useTranslations("taskbar");
  return (
    <motion.div
      data-flyout
      className="fixed inset-x-0 top-0 z-[8900] flex items-center justify-center overflow-y-auto bg-black/30 p-10 backdrop-blur-xl"
      style={{ bottom: TASKBAR_H }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={close}
    >
      {windows.length === 0 ? (
        <p className="text-lg text-white/80">{t("noWindows")}</p>
      ) : (
        <div className="flex max-w-6xl flex-wrap justify-center gap-6">
          {windows.map((w, i) => {
            const { title, icon } = info(w);
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03 } }}
                className="group flex w-64 flex-col gap-2"
              >
                <div className="flex items-center gap-2 px-1 text-sm text-white">
                  <AppIcon icon={icon} size={16} />
                  <span className="flex-1 truncate">{title}</span>
                  <button
                    className="rounded p-1 opacity-0 hover:bg-[#c42b1c] group-hover:opacity-100"
                    aria-label={title}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "close", id: w.id });
                    }}
                  >
                    <IconClose size={12} />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "focus", id: w.id });
                    close();
                  }}
                  className="flex h-40 items-center justify-center rounded-lg bg-(--mica) ring-1 ring-white/20 transition hover:ring-4 hover:ring-white/60"
                >
                  <AppIcon icon={icon} size={64} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function Shell({ power, setPower }: { power: Power; setPower: (p: Power) => void }) {
  const { windows, openNode, open, dispatch } = useWM();
  const t = useTranslations("desktop");
  const tc = useTranslations("common");
  const tf = useTranslations("fs");
  const sys = useSystem();
  const locale = useAppLocale();
  const { switchTo } = useSwitchLocale();
  const fsState = useFs();
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; target: string | null } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [band, setBand] = useState<Band>(null);
  const bandEl = useRef<HTMLDivElement>(null);
  const bandFrame = useRef(0);
  const bandHits = useRef("");
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [toast, setToast] = useState<Notice | null>(null);
  const [unread, setUnread] = useState(INITIAL_NOTICES.length);
  const toastShown = useRef(false);

  // Close flyouts when clicking anywhere outside of them; Esc closes too
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest("[data-flyout]") && !el.closest("[data-menu]")) setPanel(null);
    };
    let metaAlone = false;
    const onKeyDown = (e: KeyboardEvent) => {
      metaAlone = e.key === "Meta";
      if (e.key === "Escape") setPanel(null);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta" && metaAlone) setPanel((p) => (p === "start" ? null : "start"));
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Nothing to render behind a maximized window or a black power screen
  const covered = (power === "on" && windows.some((w) => w.maximized && !w.minimized)) || power === "off" || power === "shutdown" || power === "boot" || power === "restart";
  useEffect(() => {
    setWallpaperCovered(covered);
  }, [covered]);

  // Windows greets you with a toast right after sign-in
  useEffect(() => {
    if (power !== "on" || toastShown.current) return;
    toastShown.current = true;
    const show = setTimeout(() => setToast(INITIAL_NOTICES[0]), 900);
    const hide = setTimeout(() => setToast(null), 8000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [power]);

  const openPanel = (p: Panel) => {
    if (p === "calendar") setUnread(0);
    setPanel(p);
  };

  const closePanel = useCallback(() => setPanel(null), []);

  /* ---------- Rubber-band selection ---------- */
  const startBand = (e: React.PointerEvent) => {
    if (e.button !== 0 || e.pointerType === "touch") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected([]);
    setBand({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY });
  };
  // the band rectangle is drawn straight into the DOM once per frame;
  // React only hears about it when the set of selected icons changes
  const moveBand = (e: React.PointerEvent) => {
    if (!band) return;
    const next = { ...band, x1: e.clientX, y1: e.clientY };
    cancelAnimationFrame(bandFrame.current);
    bandFrame.current = requestAnimationFrame(() => {
      const [l, r] = [Math.min(next.x0, next.x1), Math.max(next.x0, next.x1)];
      const [tp, b] = [Math.min(next.y0, next.y1), Math.max(next.y0, next.y1)];
      const el = bandEl.current;
      if (el) el.style.cssText = `left:${l}px;top:${tp}px;width:${r - l}px;height:${b - tp}px`;
      const hits: string[] = [];
      document.querySelectorAll<HTMLElement>("[data-icon-id]").forEach((icon) => {
        const rc = icon.getBoundingClientRect();
        if (rc.left < r && rc.right > l && rc.top < b && rc.bottom > tp) hits.push(icon.dataset.iconId!);
      });
      const joined = hits.join("|");
      if (joined !== bandHits.current) {
        bandHits.current = joined;
        setSelected(hits);
      }
    });
  };
  const endBand = () => {
    cancelAnimationFrame(bandFrame.current);
    bandHits.current = "";
    setBand(null);
  };

  /* ---------- Context menus ---------- */
  const openMenu = (e: React.MouseEvent, target: string | null) => {
    e.preventDefault();
    setPanel(null);
    setMenu({ x: e.clientX, y: e.clientY, target });
  };

  const newFolder = () => {
    const id = fs.createFolder("desktop", tf("newFolder"));
    setSelected([id]);
    setRenaming(id);
  };

  const backgroundMenu: MenuEntry[] = [
    {
      label: t("view"),
      icon: <IconEye />,
      submenu: [
        ...(["large", "medium", "small"] as const).map((size) => ({
          label: t(size),
          checked: sys.iconSize === size,
          radio: true,
          onClick: () => system.set({ iconSize: size }),
        })),
        "separator" as const,
        { label: t("autoArrange"), checked: sys.autoArrange, onClick: () => system.set({ autoArrange: !sys.autoArrange }) },
      ],
    },
    {
      label: t("sortBy"),
      icon: <IconSort />,
      submenu: (["default", "name", "type"] as const).map((s) => ({
        label: t(s === "default" ? "byDefault" : s === "name" ? "byName" : "byType"),
        checked: sys.sortBy === s,
        radio: true,
        onClick: () => {
          // Sorting rearranges the grid, dropping the hand-placed positions
          fs.clearPositions();
          system.set({ sortBy: s });
        },
      })),
    },
    { label: t("refresh"), icon: <IconRefresh />, onClick: () => setRefreshKey((k) => k + 1) },
    "separator",
    { label: t("newFolder"), icon: <IconPlus />, onClick: newFolder },
    "separator",
    { label: t("settings"), icon: <IconGear />, onClick: () => open("settings", { section: "system" }) },
    {
      label: t("personalize"),
      icon: <IconBrush />,
      submenu: [
        { label: t("light"), checked: sys.theme === "light", radio: true, onClick: () => system.set({ theme: "light" }) },
        { label: t("dark"), checked: sys.theme === "dark", radio: true, onClick: () => system.set({ theme: "dark" }) },
        "separator",
        { label: t("settings"), icon: <IconGear />, onClick: () => open("settings", { section: "personalization" }) },
      ],
    },
    {
      label: t("language"),
      icon: <IconGlobe />,
      submenu: [
        { label: "English", checked: locale === "en", radio: true, onClick: () => switchTo("en") },
        { label: "Русский", checked: locale === "ru", radio: true, onClick: () => switchTo("ru") },
      ],
    },
    "separator",
    { label: t("openExplorer"), icon: <AppIcon icon="folder" size={16} />, onClick: () => open("explorer", { folder: "root" }) },
    { label: t("about"), icon: <IconInfo />, onClick: () => open("notepad") },
  ];

  const itemMenu = (id: string): MenuEntry[] => {
    const n = nodeOf(fsState, id);
    if (!n) return [];
    const targets = selected.includes(id) ? selected : [id];
    const entries: MenuEntry[] = [{ label: tc("open"), bold: true, icon: <AppIcon icon={n.icon} size={16} />, onClick: () => openNode(n) }];
    if (n.url) entries.push({ label: tc("openNewTab"), icon: <IconExternal />, href: n.url });
    if (n.url) entries.push({ label: t("copyLink"), icon: <IconCopy />, onClick: () => navigator.clipboard?.writeText(n.url!) });
    if (n.id === "bin") entries.push({ label: t("emptyBin"), icon: <IconClose />, onClick: () => fs.emptyBin() });
    entries.push("separator", { label: t("rename"), shortcut: "F2", onClick: () => setRenaming(id) });
    if (fs.canDelete(id)) entries.push({ label: t("delete"), shortcut: "Del", onClick: () => fs.remove(targets, "desktop") });
    entries.push("separator", {
      label: t("showInExplorer"),
      icon: <AppIcon icon="folder" size={16} />,
      onClick: () => open("explorer", { folder: "desktop" }),
    });
    return entries;
  };

  const brightness = effectiveBrightness(sys);

  return (
    <div className="win-root fixed inset-0 overflow-hidden">
      {sys.wallpaper3d ? <Wallpaper3D /> : <div className="win-wallpaper absolute inset-0" />}

      {/* The shell stays mounted while locked (windows survive a lock), just hidden */}
      <div className={power === "on" ? "" : "invisible"} aria-hidden={power !== "on"}>
        <div
          className="absolute inset-0"
          onPointerDown={startBand}
          onPointerMove={moveBand}
          onPointerUp={endBand}
          onPointerCancel={endBand}
          onContextMenu={(e) => openMenu(e, null)}
        >
          <motion.div
            key={refreshKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bottom-12"
          >
            <DesktopIcons
              selected={selected}
              setSelected={setSelected}
              renaming={renaming}
              setRenaming={setRenaming}
              onContextMenu={openMenu}
            />
          </motion.div>
          {band && <div ref={bandEl} className="win-band pointer-events-none fixed" style={{ left: band.x0, top: band.y0, width: 0, height: 0 }} />}
        </div>

        <AnimatePresence>
          {windows.map((w) => (
            <Window key={w.id} win={w} />
          ))}
        </AnimatePresence>

        <AnimatePresence>{panel === "taskview" && <TaskView key="tv" close={closePanel} />}</AnimatePresence>

        <Taskbar panel={panel} setPanel={openPanel} unread={unread} />

        <AnimatePresence>
          {(panel === "start" || panel === "search") && (
            <StartMenu
              key="start"
              searchFirst={panel === "search"}
              close={closePanel}
              onLock={() => {
                setPanel(null);
                setPower("locked");
              }}
              onShutdown={() => {
                setPanel(null);
                dispatch({ type: "closeAll" });
                setPower("shutdown");
              }}
              onRestart={() => {
                setPanel(null);
                dispatch({ type: "closeAll" });
                setPower("restart");
              }}
            />
          )}
          {panel === "quick" && <QuickSettings key="quick" close={closePanel} />}
          {panel === "hidden" && <HiddenIcons key="hidden" close={closePanel} />}
          {panel === "lang" && <LanguageFlyout key="lang" close={closePanel} />}
          {panel === "calendar" && (
            <NotificationCenter
              key="calendar"
              notices={notices}
              close={closePanel}
              dismiss={(id) => setNotices((n) => n.filter((x) => x.id !== id))}
              clear={() => setNotices([])}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && power === "on" && !panel && (
            <motion.div
              key="toast"
              data-flyout
              initial={{ opacity: 0, x: 120 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 120 }}
              transition={{ duration: 0.3, ease: [0.1, 0.9, 0.2, 1] }}
              className="win-flyout win-notice fixed bottom-[60px] right-3 z-[9200] w-[360px] max-w-[calc(100vw-24px)] p-4!"
            >
              <NoticeBody notice={toast} onAction={() => setToast(null)} />
              <button
                className="win-btn-icon absolute right-2 top-2 size-7!"
                aria-label={tc("close")}
                title={tc("close")}
                onClick={() => setToast(null)}
              >
                <IconClose size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screen filters as overlays: a CSS filter on an ancestor would break the acrylic blur */}
      {sys.nightLight && <div className="pointer-events-none fixed inset-0 z-[9990] bg-[#ff9a3c] opacity-25 mix-blend-multiply" />}
      {brightness < 100 && (
        <div className="pointer-events-none fixed inset-0 z-[9991] bg-black" style={{ opacity: (100 - brightness) / 100 }} />
      )}

      {menu && <Menu x={menu.x} y={menu.y} onClose={() => setMenu(null)} items={menu.target ? itemMenu(menu.target) : backgroundMenu} />}

      <AnimatePresence>
        {power === "locked" && (
          <LockScreen
            key="lock"
            onUnlock={() => setPower("on")}
            onShutdown={() => setPower("shutdown")}
            onRestart={() => setPower("restart")}
          />
        )}
      </AnimatePresence>

      {(power === "boot" || power === "shutdown" || power === "restart" || power === "off") && (
        <PowerScreen
          mode={power}
          onDone={() => setPower(power === "shutdown" ? "off" : power === "restart" ? "boot" : "locked")}
          onPowerOn={() => setPower("boot")}
        />
      )}
    </div>
  );
}

export default function Desktop() {
  const [power, setPower] = useState<Power>("locked");
  return (
    <WindowManager>
      <Shell power={power} setPower={setPower} />
    </WindowManager>
  );
}
