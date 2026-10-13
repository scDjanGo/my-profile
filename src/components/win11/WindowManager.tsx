"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { useTranslations } from "next-intl";
import type { AppId, FsNode, IconKey } from "@/data/desktop";
import { nodeOf, useFs } from "./fs";
import { useFsLabels } from "./i18n";

export interface AppProps {
  folder?: string;
  url?: string;
  /** Changes every time the same window is asked to open something new */
  nonce?: number;
  section?: string;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WinState extends Rect {
  id: string;
  app: AppId;
  props: AppProps;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

interface AppMeta {
  icon: IconKey;
  w: number;
  h: number;
  /** One window per app: reopening focuses and updates the existing one */
  single?: boolean;
  /** The app draws its own title bar (Chrome puts tabs there) */
  frameless?: boolean;
  /** Fixed-size window without resize handles */
  fixed?: boolean;
  /** Dialog box: only a close button, opens above the Start button like Win+R */
  dialog?: boolean;
}

export const APPS: Record<AppId, AppMeta> = {
  explorer: { icon: "folder", w: 920, h: 580 },
  browser: { icon: "browser", w: 1120, h: 700, single: true, frameless: true },
  profile: { icon: "profile", w: 960, h: 640, single: true },
  notepad: { icon: "notepad", w: 760, h: 540, single: true },
  pdf: { icon: "pdf", w: 820, h: 700, single: true },
  settings: { icon: "settings", w: 1000, h: 680, single: true },
  calculator: { icon: "calculator", w: 330, h: 520, single: true },
  paint: { icon: "paint", w: 1100, h: 760 },
  solitaire: { icon: "solitaire", w: 1000, h: 720, single: true },
  terminal: { icon: "terminal", w: 880, h: 520 },
  run: { icon: "run", w: 420, h: 214, single: true, fixed: true, dialog: true },
};

type Action =
  | { type: "open"; app: AppId; props: AppProps }
  | { type: "close"; id: string }
  | { type: "focus"; id: string }
  | { type: "minimize"; id: string }
  | { type: "minimizeAll" }
  | { type: "toggleMax"; id: string; value?: boolean }
  | { type: "rect"; id: string; rect: Partial<Rect> }
  | { type: "props"; id: string; props: AppProps }
  | { type: "closeAll" };

interface State {
  windows: WinState[];
  zTop: number;
  seq: number;
}

export const TASKBAR_H = 48;

function initialRect(meta: AppMeta, count: number): Rect & { maximized: boolean } {
  if (typeof window === "undefined") return { x: 80, y: 40, w: meta.w, h: meta.h, maximized: false };
  const vw = window.innerWidth;
  const vh = window.innerHeight - TASKBAR_H;
  const w = Math.min(meta.w, vw - 24);
  const h = Math.min(meta.h, vh - 24);
  const offset = (count % 6) * 28;
  if (meta.dialog) return { x: 12, y: Math.max(12, vh - h - 12), w, h, maximized: false };
  return {
    x: Math.max(12, Math.round((vw - w) / 2) - 70 + offset),
    y: Math.max(12, Math.round((vh - h) / 2) - 40 + offset),
    w,
    h,
    maximized: vw < 640 && !meta.fixed,
  };
}

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "open": {
      const meta = APPS[a.app];
      const zTop = state.zTop + 1;
      if (meta.single) {
        const existing = state.windows.find((w) => w.app === a.app);
        if (existing) {
          return {
            ...state,
            zTop,
            windows: state.windows.map((w) =>
              w.id === existing.id ? { ...w, z: zTop, minimized: false, props: { ...w.props, ...a.props } } : w,
            ),
          };
        }
      }
      const seq = state.seq + 1;
      const { maximized, ...rect } = initialRect(meta, state.windows.length);
      return {
        zTop,
        seq,
        windows: [
          ...state.windows,
          { id: `${a.app}-${seq}`, app: a.app, props: a.props, z: zTop, minimized: false, maximized, ...rect },
        ],
      };
    }
    case "close":
      return { ...state, windows: state.windows.filter((w) => w.id !== a.id) };
    case "closeAll":
      return { ...state, windows: [] };
    case "focus": {
      const target = state.windows.find((w) => w.id === a.id);
      if (!target) return state;
      if (target.z === state.zTop && !target.minimized) return state;
      const zTop = state.zTop + 1;
      return { ...state, zTop, windows: state.windows.map((w) => (w.id === a.id ? { ...w, z: zTop, minimized: false } : w)) };
    }
    case "minimize":
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, minimized: true } : w)) };
    case "minimizeAll":
      return { ...state, windows: state.windows.map((w) => ({ ...w, minimized: true })) };
    case "toggleMax":
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === a.id ? { ...w, maximized: a.value ?? !w.maximized } : w)),
      };
    case "rect":
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, ...a.rect } : w)) };
    case "props":
      return { ...state, windows: state.windows.map((w) => (w.id === a.id ? { ...w, props: { ...w.props, ...a.props } } : w)) };
  }
}

interface Ctx {
  windows: WinState[];
  activeId: string | null;
  dispatch: React.Dispatch<Action>;
  open: (app: AppId, props?: AppProps) => void;
  openNode: (node: FsNode) => void;
}

const WMContext = createContext<Ctx | null>(null);

export function useWM() {
  const ctx = useContext(WMContext);
  if (!ctx) throw new Error("useWM must be used inside <WindowManager>");
  return ctx;
}

/** Localized title and icon of a window (Explorer follows the open folder) */
export function useWindowInfo() {
  const t = useTranslations("apps");
  const labels = useFsLabels();
  const fsState = useFs();
  return (w: WinState): { title: string; icon: IconKey } => {
    if (w.app === "explorer") {
      const node = nodeOf(fsState, w.props.folder ?? "root");
      if (node) return { title: labels.name(node), icon: node.id === "root" ? "pc" : node.icon };
    }
    if (w.app === "notepad") return { title: `readme.txt - ${t("notepad")}`, icon: "notepad" };
    return { title: t(w.app), icon: APPS[w.app].icon };
  };
}

export function WindowManager({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { windows: [], zTop: 10, seq: 0 });

  const open = useCallback<Ctx["open"]>((app, props = {}) => {
    dispatch({ type: "open", app, props: { ...props, nonce: Date.now() } });
  }, []);

  const openNode = useCallback(
    (node: FsNode) => {
      if (node.kind === "folder") return open("explorer", { folder: node.id });
      if (node.kind === "link" && node.url) {
        if (node.navigate) {
          window.location.assign(node.url);
          return;
        }
        if (node.external) {
          window.open(node.url, "_blank", "noopener,noreferrer");
          return;
        }
        return open("browser", { url: node.url });
      }
      if (node.app) open(node.app);
    },
    [open],
  );

  const activeId = useMemo(() => {
    const visible = state.windows.filter((w) => !w.minimized);
    if (!visible.length) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
  }, [state.windows]);

  const value = useMemo(
    () => ({ windows: state.windows, activeId, dispatch, open, openNode }),
    [state.windows, activeId, open, openNode],
  );

  return <WMContext.Provider value={value}>{children}</WMContext.Provider>;
}
