"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { PetProjects, PortfolioData } from "@/data/PorfolioData";
import { CONTACTS } from "@/data/desktop";
import { useWM, type WinState } from "../WindowManager";
import { useWindowFrame } from "../Window";
import { isOnline, useSystem } from "../system";
import Menu, { useDropdown, type MenuEntry } from "../Menu";
import {
  AppIcon,
  IconBack,
  IconClose,
  IconDotsV,
  IconExternal,
  IconForward,
  IconInfo,
  IconPlus,
  IconReload,
  IconSearch,
  IconStar,
  IconTabs,
  IconTune,
  IconZoomIn,
  IconZoomOut,
  UserAvatar,
} from "../icons";
import { hostOf, toUrl } from "../utils";

interface Tab {
  id: number;
  history: string[];
  index: number;
  reload: number;
  /** User dismissed the "may refuse to load" bar on this tab */
  hideInfo?: boolean;
}

let tabSeq = 0;
const newTab = (url = ""): Tab => ({ id: ++tabSeq, history: [url], index: 0, reload: 0 });

const SHORTCUTS = [...PortfolioData, ...PetProjects].slice(0, 10);
const DEFAULT_BOOKMARKS = [
  { title: "GitHub", url: CONTACTS.github },
  ...PortfolioData.slice(0, 5).map((p) => ({ title: p.title, url: p.link })),
];
const ZOOMS = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];

function Favicon({ url, size = 16 }: { url: string; size?: number }) {
  if (!url) return <AppIcon icon="browser" size={size} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`https://www.google.com/s2/favicons?sz=64&domain=${hostOf(url)}`} alt="" width={size} height={size} style={{ width: size, height: size }} />
  );
}

function TabSpinner() {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} className="animate-spin text-(--chrome-accent)" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="22 40" strokeLinecap="round" />
    </svg>
  );
}

function GoogleLogo() {
  const colors = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];
  return (
    <div className="select-none text-[64px] font-medium leading-none tracking-[-0.04em] max-sm:text-5xl" aria-label="Google">
      {"Google".split("").map((ch, i) => (
        <span key={i} style={{ color: colors[i] }}>
          {ch}
        </span>
      ))}
    </div>
  );
}

function NewTabPage({ onGo }: { onGo: (url: string) => void }) {
  const t = useTranslations("browser");
  return (
    <div className="chrome-ntp flex h-full flex-col items-center overflow-y-auto px-4 pb-10 pt-[12vh]">
      <GoogleLogo />
      <form
        className="chrome-ntp-search mt-8 flex h-12 w-full max-w-[584px] items-center gap-3 rounded-full px-5"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q")?.toString() ?? "";
          if (q.trim()) onGo(toUrl(q));
        }}
      >
        <IconSearch size={18} className="opacity-60" />
        <input name="q" autoFocus placeholder={t("omnibox")} className="min-w-0 flex-1 bg-transparent text-base outline-none" />
      </form>

      <h2 className="sr-only">{t("shortcuts")}</h2>
      <div className="mt-8 grid w-full max-w-[560px] grid-cols-5 gap-y-2 max-sm:grid-cols-4">
        {SHORTCUTS.map((p) => (
          <button key={p.title} onClick={() => onGo(p.link)} className="chrome-shortcut flex flex-col items-center gap-2 rounded-lg px-1 py-3" title={p.title}>
            <span className="chrome-shortcut-icon flex size-12 items-center justify-center rounded-full">
              <Favicon url={p.link} size={24} />
            </span>
            <span className="w-full truncate text-center text-xs">{p.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Chrome's "No internet" page, with its little dinosaur */
function OfflinePage() {
  const t = useTranslations("browser");
  const { open } = useWM();
  const dino = [
    "....######",
    "...##.####",
    "...#######",
    "...####...",
    "#..######.",
    "##.####...",
    "#######...",
    ".######...",
    "..#####...",
    "...##.##..",
    "...#...#..",
  ];
  return (
    <div className="h-full overflow-y-auto bg-(--chrome-toolbar) px-8 pt-[14vh] text-(--chrome-text-2)">
      <div className="mx-auto max-w-xl">
        <svg viewBox="0 0 10 11" width={56} height={62} className="text-(--chrome-text-2)" aria-hidden>
          {dino.flatMap((row, y) => row.split("").map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null)))}
        </svg>
        <h1 className="mt-8 text-2xl text-(--chrome-text)">{t("offlineTitle")}</h1>
        <p className="mt-4">{t("offlineTry")}</p>
        <ul className="mt-2 list-disc pl-6">
          <li>{t("offlineWifi")}</li>
          <li>{t("offlinePlane")}</li>
        </ul>
        <p className="mt-6 text-xs uppercase">{t("offlineCode")}</p>
        <button
          className="mt-8 rounded-full bg-(--chrome-accent) px-5 py-2 text-sm font-medium text-(--chrome-on-accent)"
          onClick={() => open("settings", { section: "network" })}
        >
          {t("openSettings")}
        </button>
      </div>
    </div>
  );
}

export default function Browser({ win }: { win: WinState }) {
  const t = useTranslations("browser");
  const { dispatch, open } = useWM();
  const frame = useWindowFrame();
  const sys = useSystem();
  const online = isOnline(sys);
  const [tabs, setTabs] = useState<Tab[]>(() => [newTab(win.props.url)]);
  const [activeTab, setActiveTab] = useState(() => tabs[0].id);
  const [seenNonce, setSeenNonce] = useState(win.props.nonce);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState(DEFAULT_BOOKMARKS);
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [zoom, setZoom] = useState(100);
  const dd = useDropdown();

  // Opening another link while Chrome is already open adds a tab
  if (win.props.nonce !== seenNonce) {
    setSeenNonce(win.props.nonce);
    if (win.props.url) {
      const tab = newTab(win.props.url);
      setTabs((prev) => [...prev, tab]);
      setActiveTab(tab.id);
    }
  }

  const tab = tabs.find((x) => x.id === activeTab) ?? tabs[0];
  const url = tab.history[tab.index];
  const frameKey = `${tab.id}-${tab.index}-${tab.reload}`;
  const loading = !!url && online && !loaded[frameKey];
  const bookmarked = bookmarks.some((b) => b.url === url);

  const update = (fn: (x: Tab) => Tab) => setTabs((prev) => prev.map((x) => (x.id === tab.id ? fn(x) : x)));
  const navigate = (next: string) =>
    update((x) => {
      const history = [...x.history.slice(0, x.index + 1), next];
      return { ...x, history, index: history.length - 1, hideInfo: false };
    });
  const addTab = () => {
    const x = newTab();
    setTabs((prev) => [...prev, x]);
    setActiveTab(x.id);
  };
  const closeTab = (id: number) => {
    const idx = tabs.findIndex((x) => x.id === id);
    const rest = tabs.filter((x) => x.id !== id);
    if (!rest.length) return dispatch({ type: "close", id: win.id });
    setTabs(rest);
    if (id === activeTab) setActiveTab(rest[Math.max(0, idx - 1)].id);
  };
  const toggleBookmark = () =>
    setBookmarks((b) => (bookmarked ? b.filter((x) => x.url !== url) : [...b, { title: hostOf(url), url }]));
  const zoomBy = (dir: 1 | -1) => setZoom((z) => ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, ZOOMS.indexOf(z) + dir))]);

  const menu: MenuEntry[] = [
    { label: t("menuNewTab"), icon: <IconPlus />, shortcut: "Ctrl+T", onClick: addTab },
    "separator",
    { label: t("menuBookmarks"), checked: showBookmarks, onClick: () => setShowBookmarks((s) => !s) },
    { label: `${t("menuZoom")}: ${zoom}%`, icon: <IconZoomIn />, submenu: [
      { label: t("zoomIn"), icon: <IconZoomIn />, onClick: () => zoomBy(1) },
      { label: t("zoomOut"), icon: <IconZoomOut />, onClick: () => zoomBy(-1) },
      { label: "100%", checked: zoom === 100, onClick: () => setZoom(100) },
    ] },
    ...(url ? [{ label: t("menuExternal"), icon: <IconExternal />, href: url } as MenuEntry] : []),
    "separator",
    { label: t("menuClose"), icon: <IconClose />, onClick: () => closeTab(tab.id) },
    { label: t("menuExit"), onClick: () => dispatch({ type: "close", id: win.id }) },
  ];

  const tabList: MenuEntry[] = tabs.map((x) => {
    const u = x.history[x.index];
    return { label: u ? hostOf(u) : t("newTab"), checked: x.id === tab.id, radio: true, onClick: () => setActiveTab(x.id) };
  });

  return (
    <div className="chrome flex h-full flex-col text-[13px]">
      {/* Tab strip doubles as the title bar */}
      <div className="chrome-frame flex h-[42px] shrink-0 items-end select-none" {...frame.drag}>
        <button className="chrome-icon-btn mb-[5px] ml-2 shrink-0" aria-label={t("tabSearch")} title={t("tabSearch")} onClick={dd.toggle("tabs")}>
          <IconTabs size={14} />
        </button>
        <div className="flex min-w-0 flex-1 items-end pl-2">
          {tabs.map((x) => {
            const u = x.history[x.index];
            const isActive = x.id === tab.id;
            const isLoading = isActive && loading;
            return (
              <div
                key={x.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (e.button === 0) setActiveTab(x.id);
                }}
                onAuxClick={(e) => e.button === 1 && closeTab(x.id)}
                className={`chrome-tab group ${isActive ? "is-active" : ""}`}
                title={u || t("newTab")}
              >
                {isLoading ? <TabSpinner /> : <Favicon url={u} />}
                <span className="min-w-0 flex-1 truncate">{u ? hostOf(u) : t("newTab")}</span>
                <button
                  aria-label={t("closeTab")}
                  className="chrome-tab-close"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => closeTab(x.id)}
                >
                  <IconClose size={10} strokeWidth={1.6} />
                </button>
              </div>
            );
          })}
          <button className="chrome-icon-btn mb-[5px] ml-1 shrink-0" aria-label={t("menuNewTab")} title={t("menuNewTab")} onClick={addTab}>
            <IconPlus size={14} />
          </button>
        </div>
        <div className="h-full self-start">{frame.captions}</div>
      </div>

      {/* Toolbar */}
      <div className="chrome-toolbar flex h-[46px] shrink-0 items-center gap-1 px-2">
        <button
          className="chrome-icon-btn"
          aria-label={t("back")}
          title={t("back")}
          disabled={tab.index === 0}
          onClick={() => update((x) => ({ ...x, index: x.index - 1 }))}
        >
          <IconBack />
        </button>
        <button
          className="chrome-icon-btn"
          aria-label={t("forward")}
          title={t("forward")}
          disabled={tab.index >= tab.history.length - 1}
          onClick={() => update((x) => ({ ...x, index: x.index + 1 }))}
        >
          <IconForward />
        </button>
        {loading ? (
          <button className="chrome-icon-btn" aria-label={t("stop")} title={t("stop")} onClick={() => setLoaded((l) => ({ ...l, [frameKey]: true }))}>
            <IconClose />
          </button>
        ) : (
          <button className="chrome-icon-btn" aria-label={t("reload")} title={t("reload")} onClick={() => update((x) => ({ ...x, reload: x.reload + 1 }))}>
            <IconReload />
          </button>
        )}

        <form
          key={frameKey}
          className="chrome-omnibox mx-1 flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full pl-1.5 pr-1"
          onSubmit={(e) => {
            e.preventDefault();
            const next = toUrl(new FormData(e.currentTarget).get("address")?.toString() ?? "");
            if (next) navigate(next);
          }}
        >
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="chrome-icon-btn size-7!"
              aria-label={t("siteInfo")}
              title={url.startsWith("https://") ? t("secure") : t("siteInfo")}
            >
              <IconTune size={14} />
            </a>
          ) : (
            <span className="flex size-7 items-center justify-center">
              <IconSearch size={14} className="opacity-70" />
            </span>
          )}
          <input
            name="address"
            defaultValue={url ? url.replace(/^https:\/\/(www\.)?/, "") : ""}
            placeholder={t("omnibox")}
            onFocus={(e) => {
              e.currentTarget.value = url;
              e.currentTarget.select();
            }}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--chrome-text-2)"
          />
          {zoom !== 100 && (
            <button type="button" className="chrome-icon-btn size-7!" title={`${zoom}%`} onClick={() => setZoom(100)}>
              <IconZoomIn size={14} />
            </button>
          )}
          {url && (
            <button
              type="button"
              className={`chrome-icon-btn size-7! ${bookmarked ? "text-(--chrome-accent)" : ""}`}
              aria-label={bookmarked ? t("unbookmark") : t("bookmark")}
              title={bookmarked ? t("unbookmark") : t("bookmark")}
              onClick={toggleBookmark}
            >
              <IconStar size={15} filled={bookmarked} />
            </button>
          )}
        </form>

        <button className="chrome-icon-btn p-0.5!" aria-label={t("profile")} title={t("profile")} onClick={() => open("profile")}>
          <UserAvatar size={24} />
        </button>
        <button className="chrome-icon-btn" aria-label={t("menu")} title={t("menu")} onClick={dd.toggle("menu")}>
          <IconDotsV />
        </button>
      </div>

      {showBookmarks && (
        <div className="chrome-toolbar flex h-8 shrink-0 items-center gap-0.5 overflow-hidden border-b border-(--chrome-divider) px-2">
          {bookmarks.map((b) => (
            <button key={b.url} className="chrome-bookmark" onClick={() => navigate(b.url)} title={b.url}>
              <Favicon url={b.url} />
              <span className="max-w-36 truncate">{b.title}</span>
            </button>
          ))}
        </div>
      )}
      {!showBookmarks && <div className="h-px shrink-0 bg-(--chrome-divider)" />}

      {url && online && !tab.hideInfo && (
        <div className="chrome-toolbar flex shrink-0 items-center gap-3 border-b border-(--chrome-divider) px-4 py-1.5 text-xs">
          <IconInfo size={16} className="shrink-0 text-(--chrome-accent)" />
          <span className="min-w-0 flex-1 truncate">{t("infobar", { host: hostOf(url) })}</span>
          <a href={url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-(--chrome-divider) px-3 py-1 font-medium text-(--chrome-accent) hover:bg-(--chrome-hover)">
            {t("infobarAction")}
          </a>
          <button className="chrome-icon-btn size-6!" aria-label={t("closeTab")} onClick={() => update((x) => ({ ...x, hideInfo: true }))}>
            <IconClose size={12} />
          </button>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        {!online ? (
          <OfflinePage />
        ) : url ? (
          <iframe
            key={frameKey}
            src={url}
            title={hostOf(url)}
            onLoad={() => setLoaded((l) => ({ ...l, [frameKey]: true }))}
            referrerPolicy="no-referrer-when-downgrade"
            allow="clipboard-write; fullscreen"
            className="origin-top-left border-0"
            style={{ zoom: zoom / 100, width: "100%", height: "100%" }}
          />
        ) : (
          <div className="h-full" style={{ zoom: zoom / 100 }}>
            <NewTabPage onGo={navigate} />
          </div>
        )}
      </div>

      {dd.menu?.id === "menu" && <Menu x={dd.menu.x - 220} y={dd.menu.y} onClose={dd.close} items={menu} />}
      {dd.menu?.id === "tabs" && <Menu x={dd.menu.x} y={dd.menu.y} onClose={dd.close} items={tabList} />}
    </div>
  );
}
