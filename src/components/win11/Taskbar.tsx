"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FS, type AppId } from "@/data/desktop";
import { useClock } from "./hooks";
import {
  AppIcon,
  IconBatteryLevel,
  IconBell,
  IconBluetooth,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconGear,
  IconLeaf,
  IconLock,
  IconMoon,
  IconNightLight,
  IconPlane,
  IconPower,
  IconReload,
  IconSearch,
  IconSun,
  IconVolume,
  IconVolumeLow,
  IconVolumeMute,
  IconWifi,
  IconWifiOff,
  WinLogo,
} from "./icons";
import { APPS, TASKBAR_H, useWM, useWindowInfo, type AppProps } from "./WindowManager";
import { effectiveBrightness, isOnline, playDing, system, useBattery, useSystem } from "./system";
import { useAppLocale, useSwitchLocale } from "./i18n";
import Menu, { type MenuEntry } from "./Menu";
import { useShell } from "./shell";

export type Panel = "start" | "search" | "quick" | "calendar" | "hidden" | "lang" | "taskview" | null;

export interface Notice {
  id: string;
  kind: "welcome" | "cv";
}

const PINNED: { app: AppId; props?: AppProps }[] = [
  { app: "explorer", props: { folder: "root" } },
  { app: "browser" },
  { app: "profile" },
  { app: "notepad" },
  { app: "settings" },
];

export const flyout = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.1, 0.9, 0.2, 1] as const } },
  exit: { opacity: 0, y: 24, transition: { duration: 0.12 } },
};

function TaskViewIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden>
      <rect x="2.5" y="5" width="11" height="14" rx="2" fill="currentColor" opacity=".55" />
      <rect x="10.5" y="5" width="11" height="14" rx="2" fill="#4cc2ff" stroke="var(--taskbar-solid)" strokeWidth="1.2" />
    </svg>
  );
}

export function VolumeGlyph({ volume, muted, size }: { volume: number; muted: boolean; size?: number }) {
  if (muted || volume === 0) return <IconVolumeMute size={size} />;
  return volume < 40 ? <IconVolumeLow size={size} /> : <IconVolume size={size} />;
}

export function Taskbar({ panel, setPanel, unread }: { panel: Panel; setPanel: (p: Panel) => void; unread: number }) {
  const { windows, activeId, dispatch, open } = useWM();
  const info = useWindowInfo();
  const t = useTranslations("taskbar");
  const ta = useTranslations("apps");
  const tc = useTranslations("common");
  const tset = useTranslations("settings");
  const tl = useTranslations("lock");
  const tf = useTranslations("fs");
  const shell = useShell();
  const now = useClock();
  const locale = useAppLocale();
  const sys = useSystem();
  const battery = useBattery();
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuEntry[] } | null>(null);

  const running = windows.reduce<AppId[]>((acc, w) => (acc.includes(w.app) ? acc : [...acc, w.app]), []);
  const items = [...PINNED, ...running.filter((a) => !PINNED.some((p) => p.app === a)).map((app) => ({ app }))];

  const toggle = (p: Panel) => setPanel(panel === p ? null : p);

  /** Right-click on Start — Windows' power-user (Win+X) menu */
  const startMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPanel(null);
    const entries: MenuEntry[] = [
      { label: ta("settings"), icon: <AppIcon icon="settings" size={16} />, onClick: () => open("settings") },
      { label: ta("explorer"), icon: <AppIcon icon="folder" size={16} />, onClick: () => open("explorer", { folder: "root" }) },
      { label: ta("terminal"), icon: <AppIcon icon="terminal" size={16} />, onClick: () => open("terminal") },
      { label: ta("run"), icon: <AppIcon icon="run" size={16} />, shortcut: "Ctrl+R", onClick: () => open("run") },
      "separator",
      {
        label: t("powerMenu"),
        icon: <IconPower />,
        submenu: [
          { label: tl("lock"), icon: <IconLock />, onClick: shell.lock },
          { label: tl("shutdown"), icon: <IconPower />, onClick: shell.shutdown },
          { label: tl("restart"), icon: <IconReload />, onClick: shell.restart },
        ],
      },
      { label: tf("desktop"), icon: <AppIcon icon="pc" size={16} />, onClick: () => dispatch({ type: "minimizeAll" }) },
    ];
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ x: r.left, y: r.top - 12 - 6 * 34 - 10, items: entries });
  };

  const clickApp = (item: (typeof PINNED)[number]) => {
    setPanel(null);
    const mine = windows.filter((w) => w.app === item.app);
    if (!mine.length) return open(item.app, item.props);
    const active = mine.find((w) => w.id === activeId);
    if (active) return dispatch({ type: "minimize", id: active.id });
    const top = mine.reduce((a, b) => (a.z > b.z ? a : b));
    dispatch({ type: "focus", id: top.id });
  };

  const appMenu = (e: React.MouseEvent, item: (typeof PINNED)[number]) => {
    e.preventDefault();
    e.stopPropagation();
    const mine = windows.filter((w) => w.app === item.app);
    const entries: MenuEntry[] = [
      ...mine.map((w) => ({
        label: info(w).title,
        icon: <AppIcon icon={info(w).icon} size={16} />,
        onClick: () => dispatch({ type: "focus", id: w.id }),
      })),
      ...(mine.length ? ["separator" as const] : []),
      { label: ta(item.app), icon: <AppIcon icon={APPS[item.app].icon} size={16} />, onClick: () => open(item.app, item.props) },
      ...(mine.length ? [{ label: tc("close"), icon: <IconClose />, onClick: () => mine.forEach((w) => dispatch({ type: "close", id: w.id })) }] : []),
    ];
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ x: r.left, y: r.top - 12 - entries.length * 34, items: entries });
  };

  const online = isOnline(sys);
  const netIcon = sys.airplane ? <IconPlane /> : online ? <IconWifi /> : <IconWifiOff />;

  return (
    <>
      <footer
        data-flyout
        className="win-taskbar fixed inset-x-0 bottom-0 z-[9000] flex items-center px-3 max-sm:px-1"
        style={{ height: TASKBAR_H }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({
            x: e.clientX,
            y: e.clientY - 90,
            items: [
              { label: tset("personalization"), icon: <IconGear />, onClick: () => open("settings", { section: "personalization" }) },
              { label: t("search"), icon: <IconSearch />, onClick: () => setPanel("search") },
            ],
          });
        }}
      >
        <div className="flex-1 max-sm:hidden" />

        <nav className="flex h-full items-center gap-1 max-sm:gap-0">
          <button aria-label={t("start")} title={t("start")} className={`win-tb-btn ${panel === "start" ? "is-on" : ""}`} onClick={() => toggle("start")} onContextMenu={startMenu}>
            <WinLogo size={22} />
          </button>
          <button
            aria-label={t("search")}
            title={t("search")}
            className={`win-tb-btn win-tb-search ${panel === "search" ? "is-on" : ""}`}
            onClick={() => toggle("search")}
          >
            <IconSearch size={16} />
            <span className="win-tb-search-label">{t("search")}</span>
          </button>
          <button
            aria-label={t("taskView")}
            title={t("taskView")}
            className={`win-tb-btn max-sm:hidden ${panel === "taskview" ? "is-on" : ""}`}
            onClick={() => toggle("taskview")}
          >
            <TaskViewIcon />
          </button>

          {items.map((item) => {
            const mine = windows.filter((w) => w.app === item.app);
            const isActive = mine.some((w) => w.id === activeId);
            return (
              <button
                key={item.app}
                aria-label={ta(item.app)}
                title={ta(item.app)}
                className={`win-tb-btn relative ${isActive ? "is-on" : ""}`}
                onClick={() => clickApp(item)}
                onContextMenu={(e) => appMenu(e, item)}
              >
                <AppIcon icon={APPS[item.app].icon} size={24} />
                {mine.length > 0 && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all ${
                      isActive ? "w-4 bg-(--accent)" : "w-1.5 bg-(--text-2)"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex h-full flex-1 items-center justify-end gap-0.5 max-sm:flex-none">
          <button
            className={`win-tb-btn w-7! max-md:hidden ${panel === "hidden" ? "is-on" : ""}`}
            aria-label={t("hidden")}
            title={t("hidden")}
            onClick={() => toggle("hidden")}
          >
            <IconChevronUp />
          </button>
          <button
            className={`win-tb-btn w-auto! px-2 text-[11px] max-md:hidden ${panel === "lang" ? "is-on" : ""}`}
            aria-label={locale === "ru" ? "Русский" : "English"}
            title={locale === "ru" ? "Русский" : "English"}
            onClick={() => toggle("lang")}
          >
            {locale === "ru" ? "РУС" : "ENG"}
          </button>
          <button
            aria-label={t("quick")}
            title={t("quick")}
            className={`win-tb-btn w-auto! gap-2.5 px-2.5 ${panel === "quick" ? "is-on" : ""}`}
            onClick={() => toggle("quick")}
          >
            {netIcon}
            <span className="flex max-sm:hidden">
              <VolumeGlyph volume={sys.volume} muted={sys.muted} />
            </span>
            <span className="flex max-sm:hidden">
              <IconBatteryLevel level={battery.level} charging={battery.charging} />
            </span>
          </button>
          <button
            aria-label={t("clock")}
            title={t("clock")}
            className={`win-tb-btn w-auto! flex-col items-end! px-2 text-[11px] leading-[1.35] ${panel === "calendar" ? "is-on" : ""}`}
            onClick={() => toggle("calendar")}
            suppressHydrationWarning
          >
            <span>{now ? now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span>
            <span className="max-sm:hidden">{now ? now.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}</span>
          </button>
          <button
            aria-label={t("notifications")}
            title={t("notifications")}
            className={`win-tb-btn relative w-9! max-sm:hidden ${panel === "calendar" ? "is-on" : ""}`}
            onClick={() => toggle("calendar")}
          >
            <IconBell />
            {unread > 0 && (
              <span className="absolute right-1 top-1.5 flex size-4 items-center justify-center rounded-full bg-(--accent) text-[9px] font-semibold text-(--on-accent)">
                {unread}
              </span>
            )}
          </button>
        </div>
      </footer>
      {menu && <Menu x={menu.x} y={Math.max(8, menu.y)} items={menu.items} onClose={() => setMenu(null)} />}
    </>
  );
}

export function HiddenIcons({ close }: { close: () => void }) {
  const t = useTranslations("tray");
  const { openNode } = useWM();
  const ids = ["github", "linkedin", "telegram", "whatsapp", "gmail"];
  return (
    <motion.div {...flyout} data-flyout className="win-flyout fixed bottom-[60px] right-[250px] z-[9100] p-2" role="dialog" aria-label={t("hiddenTitle")}>
      <div className="grid grid-cols-3 gap-1">
        {ids.map((id) => (
          <button
            key={id}
            title={FS[id].name}
            aria-label={FS[id].name}
            className="flex size-10 items-center justify-center rounded hover:bg-(--hover)"
            onClick={() => {
              close();
              openNode(FS[id]);
            }}
          >
            <AppIcon icon={FS[id].icon} size={22} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function LanguageFlyout({ close }: { close: () => void }) {
  const t = useTranslations("tray");
  const locale = useAppLocale();
  const { switchTo } = useSwitchLocale();
  const { open } = useWM();
  const langs = [
    { id: "en" as const, code: "ENG", name: t("enName"), kb: t("enKeyboard") },
    { id: "ru" as const, code: "РУС", name: t("ruName"), kb: t("ruKeyboard") },
  ];
  return (
    <motion.div {...flyout} data-flyout className="win-flyout fixed bottom-[60px] right-[190px] z-[9100] w-80 p-1.5" role="dialog" aria-label={t("languages")}>
      <div className="px-3 pb-1 pt-2 text-xs text-(--text-2)">{t("languages")}</div>
      {langs.map((l) => (
        <button
          key={l.id}
          onClick={() => {
            close();
            if (l.id !== locale) switchTo(l.id);
          }}
          className={`relative flex w-full items-center gap-4 rounded px-3 py-2.5 text-left hover:bg-(--hover) ${l.id === locale ? "bg-(--hover)" : ""}`}
        >
          {l.id === locale && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-(--accent)" />}
          <span className="w-9 text-sm font-semibold">{l.code}</span>
          <span className="flex flex-col">
            <span>{l.name}</span>
            <span className="text-xs text-(--text-2)">{l.kb}</span>
          </span>
        </button>
      ))}
      <div className="mx-2 my-1 h-px bg-(--divider)" />
      <button
        className="w-full rounded px-3 py-2 text-left text-(--accent-text) hover:bg-(--hover)"
        onClick={() => {
          close();
          open("settings", { section: "time" });
        }}
      >
        {t("moreKeyboard")}
      </button>
    </motion.div>
  );
}

export function QuickSettings({ close }: { close: () => void }) {
  const t = useTranslations("quick");
  const sys = useSystem();
  const battery = useBattery();
  const { open } = useWM();
  const online = isOnline(sys);

  const tiles = [
    { id: "wifi", label: online ? t("wifi") : t("notConnected"), Icon: online ? IconWifi : IconWifiOff, on: online, toggle: () => system.set({ wifi: !online }) },
    { id: "bt", label: t("bluetooth"), Icon: IconBluetooth, on: sys.bluetooth, toggle: () => system.set({ bluetooth: !sys.bluetooth }) },
    { id: "plane", label: t("airplane"), Icon: IconPlane, on: sys.airplane, toggle: () => system.set({ airplane: !sys.airplane }) },
    { id: "energy", label: t("energy"), Icon: IconLeaf, on: sys.energySaver, toggle: () => system.set({ energySaver: !sys.energySaver }) },
    { id: "night", label: t("nightLight"), Icon: IconNightLight, on: sys.nightLight, toggle: () => system.set({ nightLight: !sys.nightLight }) },
    {
      id: "dark",
      label: t("darkMode"),
      Icon: sys.theme === "dark" ? IconMoon : IconSun,
      on: sys.theme === "dark",
      toggle: () => system.set({ theme: sys.theme === "dark" ? "light" : "dark" }),
    },
  ];

  return (
    <motion.div {...flyout} data-flyout className="win-flyout fixed bottom-[60px] right-3 z-[9100] w-[360px] max-w-[calc(100vw-24px)]" role="dialog" aria-label={t("settings")}>
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 p-5">
        {tiles.map((x) => (
          <div key={x.id} className="flex flex-col items-center gap-1.5">
            <button className={`win-qs-tile ${x.on ? "is-on" : ""}`} onClick={x.toggle} aria-pressed={x.on} aria-label={x.label}>
              <x.Icon size={18} />
            </button>
            <span className="line-clamp-2 min-h-8 w-full text-center text-xs leading-4">{x.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6">
        <label className="flex items-center gap-4">
          <IconSun size={18} />
          <input
            type="range"
            min={30}
            max={100}
            value={effectiveBrightness(sys)}
            onChange={(e) => system.set({ brightness: +e.target.value, energySaver: false })}
            className="win-range flex-1"
            aria-label={t("brightness")}
          />
        </label>
        <div className="flex items-center gap-4">
          <button
            className="win-btn-icon -m-1.5"
            aria-label={sys.muted ? t("unmute") : t("mute")}
            title={sys.muted ? t("unmute") : t("mute")}
            onClick={() => system.set({ muted: !sys.muted })}
          >
            <VolumeGlyph volume={sys.volume} muted={sys.muted} size={18} />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={sys.muted ? 0 : sys.volume}
            onChange={(e) => system.set({ volume: +e.target.value, muted: false })}
            onPointerUp={() => playDing(system.get().volume)}
            className="win-range flex-1"
            aria-label={t("volume")}
          />
        </div>
      </div>

      <div className="win-flyout-footer flex items-center gap-2 px-4 py-2 text-xs">
        <IconBatteryLevel size={18} level={battery.level} charging={battery.charging} />
        <span className="flex-1">{battery.charging ? t("charging", { level: battery.level }) : t("battery", { level: battery.level })}</span>
        <button
          className="win-btn-icon"
          aria-label={t("settings")}
          title={t("settings")}
          onClick={() => {
            close();
            open("settings", { section: "system" });
          }}
        >
          <IconGear />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationCenter({
  notices,
  dismiss,
  clear,
  close,
}: {
  notices: Notice[];
  dismiss: (id: string) => void;
  clear: () => void;
  close: () => void;
}) {
  const t = useTranslations("notif");
  const locale = useAppLocale();
  const now = useClock() ?? new Date();
  const [offset, setOffset] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const startDay = (first.getDay() + 6) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  // 2024-01-01 was a Monday
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }).slice(0, 2));

  return (
    <motion.div {...flyout} data-flyout className="fixed bottom-[60px] right-3 z-[9100] flex w-[360px] max-w-[calc(100vw-24px)] flex-col gap-3">
      <div className="win-flyout flex max-h-[44vh] flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold">{t("title")}</span>
          {notices.length > 0 && (
            <button className="win-btn py-0.5! text-xs" onClick={clear}>
              {t("clearAll")}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto px-3 pb-3">
          <AnimatePresence initial={false}>
            {notices.map((n) => (
              <motion.div key={n.id} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="win-notice group">
                <NoticeBody notice={n} onAction={close} />
                <button
                  className="win-btn-icon absolute right-1.5 top-1.5 size-7! opacity-60 group-hover:opacity-100"
                  aria-label={t("dismiss")}
                  title={t("dismiss")}
                  onClick={() => dismiss(n.id)}
                >
                  <IconClose size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {notices.length === 0 && <p className="py-6 text-center text-(--text-2)">{t("empty")}</p>}
        </div>
      </div>

      <div className="win-flyout">
        <div className="flex items-center justify-between border-b border-(--divider) px-4 py-3">
          <button className="font-semibold first-letter:uppercase hover:text-(--accent-text)" onClick={() => setOffset(0)} title={t("today")} suppressHydrationWarning>
            {now.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
          </button>
          <button className="win-btn-icon" aria-label={t("today")} onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <IconChevronUp /> : <IconChevronDown />}
          </button>
        </div>
        {!collapsed && (
          <div className="p-4">
            <div className="mb-3 flex items-center">
              <span className="flex-1 pl-1 text-sm font-semibold first-letter:uppercase">{first.toLocaleDateString(locale, { month: "long", year: "numeric" })}</span>
              <button className="win-btn-icon" aria-label={t("prevMonth")} title={t("prevMonth")} onClick={() => setOffset((o) => o - 1)}>
                <IconChevronUp />
              </button>
              <button className="win-btn-icon" aria-label={t("nextMonth")} title={t("nextMonth")} onClick={() => setOffset((o) => o + 1)}>
                <IconChevronDown />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {weekdays.map((d) => (
                <span key={d} className="py-1 font-medium first-letter:uppercase">
                  {d}
                </span>
              ))}
              {cells.map((d, i) => (
                <span
                  key={i}
                  className={`mx-auto flex size-9 items-center justify-center rounded-full ${
                    offset === 0 && d === now.getDate() ? "bg-(--accent) font-semibold text-(--on-accent)" : d ? "hover:bg-(--hover)" : ""
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Content shared by the notification center and the toast */
export function NoticeBody({ notice, onAction }: { notice: Notice; onAction?: () => void }) {
  const t = useTranslations("notif");
  const { open } = useWM();
  const isWelcome = notice.kind === "welcome";
  return (
    <div className="flex flex-col gap-2 pr-6">
      <div className="flex items-center gap-2 text-xs text-(--text-2)">
        <AppIcon icon={isWelcome ? "notepad" : "pdf"} size={16} />
        <span>{isWelcome ? "readme.txt" : "Resume.pdf"}</span>
        <span>· {t("now")}</span>
      </div>
      <div className="font-semibold">{isWelcome ? t("welcomeTitle") : t("cvTitle")}</div>
      <div className="text-(--text-1)">{isWelcome ? t("welcomeBody") : t("cvBody")}</div>
      <div className="mt-1 flex gap-2">
        {isWelcome ? (
          <button
            className="win-btn flex-1"
            onClick={() => {
              onAction?.();
              open("notepad");
            }}
          >
            {t("welcomeAction")}
          </button>
        ) : (
          <>
            <button
              className="win-btn flex-1"
              onClick={() => {
                onAction?.();
                open("pdf");
              }}
            >
              {t("cvView")}
            </button>
            <a href="/pdf/myResume.pdf" download className="win-btn flex-1 text-center" onClick={onAction}>
              {t("cvDownload")}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
