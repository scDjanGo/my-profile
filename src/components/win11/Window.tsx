"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { AppIcon, IconClose, IconMax, IconMin, IconRestore } from "./icons";
import { APPS, TASKBAR_H, useWM, useWindowInfo, type Rect, type WinState } from "./WindowManager";
import Explorer from "./apps/Explorer";
import Browser from "./apps/Browser";
import Profile from "./apps/Profile";
import Notepad from "./apps/Notepad";
import PdfViewer from "./apps/PdfViewer";
import Settings from "./apps/Settings";
import Calculator from "./apps/Calculator";
import Paint from "./apps/Paint";
import Solitaire from "./apps/Solitaire";

const MIN_W = 320;
const MIN_H = 240;

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Zone = { x: number; y: number; w: number; h: number };

const EDGES: { edge: Edge; className: string }[] = [
  { edge: "n", className: "top-0 left-2 right-2 h-1.5 cursor-ns-resize" },
  { edge: "s", className: "bottom-0 left-2 right-2 h-1.5 cursor-ns-resize" },
  { edge: "w", className: "left-0 top-2 bottom-2 w-1.5 cursor-ew-resize" },
  { edge: "e", className: "right-0 top-2 bottom-2 w-1.5 cursor-ew-resize" },
  { edge: "nw", className: "top-0 left-0 size-3 cursor-nwse-resize" },
  { edge: "se", className: "bottom-0 right-0 size-3 cursor-nwse-resize" },
  { edge: "ne", className: "top-0 right-0 size-3 cursor-nesw-resize" },
  { edge: "sw", className: "bottom-0 left-0 size-3 cursor-nesw-resize" },
];

/** The four layouts Windows 11 offers when hovering the maximize button */
const LAYOUTS: Zone[][] = [
  [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 2 / 3, h: 1 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
  [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
];

const workArea = () => ({ w: window.innerWidth, h: window.innerHeight - TASKBAR_H });
const zoneRect = (z: Zone): Rect => {
  const a = workArea();
  return { x: Math.round(z.x * a.w), y: Math.round(z.y * a.h), w: Math.round(z.w * a.w), h: Math.round(z.h * a.h) };
};

interface Frame {
  drag: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
  };
  captions: React.ReactNode;
}

const FrameContext = createContext<Frame | null>(null);

/** Frameless apps (Chrome) use this to make their own tab strip draggable */
export function useWindowFrame() {
  const ctx = useContext(FrameContext);
  if (!ctx) throw new Error("useWindowFrame must be used inside a window");
  return ctx;
}

function AppContent({ win }: { win: WinState }) {
  switch (win.app) {
    case "explorer":
      return <Explorer win={win} />;
    case "browser":
      return <Browser win={win} />;
    case "profile":
      return <Profile win={win} />;
    case "notepad":
      return <Notepad />;
    case "pdf":
      return <PdfViewer />;
    case "settings":
      return <Settings win={win} />;
    case "calculator":
      return <Calculator />;
    case "paint":
      return <Paint />;
    case "solitaire":
      return <Solitaire />;
  }
}

function Captions({ win }: { win: WinState }) {
  const { dispatch } = useWM();
  const t = useTranslations("common");
  const tw = useTranslations("window");
  const [snap, setSnap] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fixed = APPS[win.app].fixed;

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSnap(true), 350);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSnap(false), 250);
  };

  return (
    <div className="relative flex h-full shrink-0" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <button aria-label={t("minimize")} title={t("minimize")} className="win-caption" onClick={() => dispatch({ type: "minimize", id: win.id })}>
        <IconMin size={14} strokeWidth={1} />
      </button>
      {!fixed && (
        <div className="relative h-full max-sm:hidden" onPointerEnter={show} onPointerLeave={hide}>
          <button
            aria-label={win.maximized ? t("restore") : t("maximize")}
            title={win.maximized ? t("restore") : t("maximize")}
            className="win-caption"
            onClick={() => {
              setSnap(false);
              dispatch({ type: "toggleMax", id: win.id });
            }}
          >
            {win.maximized ? <IconRestore size={14} strokeWidth={1} /> : <IconMax size={14} strokeWidth={1} />}
          </button>
          <AnimatePresence>
            {snap && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="win-flyout absolute right-0 top-full z-50 grid w-[300px] grid-cols-2 gap-3 p-3"
                aria-label={tw("snap")}
              >
                {LAYOUTS.map((layout, li) => (
                  <div key={li} className="relative h-14 rounded-md bg-(--field) ring-1 ring-(--divider)">
                    {layout.map((z, zi) => (
                      <button
                        key={zi}
                        aria-label={`${tw("snap")} ${li + 1}.${zi + 1}`}
                        className="win-snap-zone absolute"
                        style={{
                          left: `calc(${z.x * 100}% + 3px)`,
                          top: `calc(${z.y * 100}% + 3px)`,
                          width: `calc(${z.w * 100}% - 5px)`,
                          height: `calc(${z.h * 100}% - 5px)`,
                        }}
                        onClick={() => {
                          setSnap(false);
                          dispatch({ type: "toggleMax", id: win.id, value: false });
                          dispatch({ type: "rect", id: win.id, rect: zoneRect(z) });
                        }}
                      />
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <button
        aria-label={t("close")}
        title={t("close")}
        className="win-caption win-caption-close"
        onClick={() => dispatch({ type: "close", id: win.id })}
      >
        <IconClose size={14} strokeWidth={1} />
      </button>
    </div>
  );
}

export default function Window({ win }: { win: WinState }) {
  const { dispatch, activeId } = useWM();
  const info = useWindowInfo()(win);
  const meta = APPS[win.app];
  const active = activeId === win.id;
  const drag = useRef<{ px: number; py: number; rect: Rect; edge?: Edge; last?: Rect; snap?: string } | null>(null);
  const section = useRef<HTMLElement>(null);
  const frameReq = useRef(0);
  const [preview, setPreview] = useState<Rect | null>(null);

  // A drag moves the window with the GPU-friendly `translate` property and only
  // commits the final rect to state; clear the offset before the committed rect paints.
  useLayoutEffect(() => {
    const el = section.current;
    if (el && !drag.current) el.style.translate = "";
  }, [win.x, win.y, win.w, win.h, win.maximized]);

  const focus = () => dispatch({ type: "focus", id: win.id });

  const snapTarget = (x: number, y: number): Rect | null => {
    const a = workArea();
    if (y <= 2) return { x: 0, y: 0, w: a.w, h: a.h };
    if (x <= 2) return { x: 0, y: 0, w: a.w / 2, h: a.h };
    if (x >= a.w - 3) return { x: a.w / 2, y: 0, w: a.w / 2, h: a.h };
    return null;
  };

  const begin = (e: React.PointerEvent, edge?: Edge) => {
    if (e.button !== 0 || window.innerWidth < 640) return;
    if (!edge && (e.target as HTMLElement).closest("button, a, input")) return;
    if (win.maximized && edge) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    let rect: Rect = { x: win.x, y: win.y, w: win.w, h: win.h };
    if (win.maximized && !edge) {
      // Pull a maximized window off the top: restore it under the cursor
      const ratio = e.clientX / window.innerWidth;
      rect = { ...rect, x: Math.round(e.clientX - rect.w * ratio), y: 0 };
      dispatch({ type: "toggleMax", id: win.id, value: false });
      dispatch({ type: "rect", id: win.id, rect });
    }
    drag.current = { px: e.clientX, py: e.clientY, rect, edge };
    document.body.classList.add("win-dragging");
  };

  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    const r = { ...d.rect };
    if (!d.edge) {
      r.x += dx;
      r.y = Math.max(0, r.y + dy);
      if (!meta.fixed) {
        const target = snapTarget(e.clientX, e.clientY);
        const key = target ? `${target.x},${target.w}` : "";
        if (key !== d.snap) {
          d.snap = key;
          setPreview(target);
        }
      }
    } else {
      if (d.edge.includes("e")) r.w = Math.max(MIN_W, d.rect.w + dx);
      if (d.edge.includes("s")) r.h = Math.max(MIN_H, d.rect.h + dy);
      if (d.edge.includes("w")) {
        r.w = Math.max(MIN_W, d.rect.w - dx);
        r.x = d.rect.x + d.rect.w - r.w;
      }
      if (d.edge.includes("n")) {
        r.h = Math.max(MIN_H, d.rect.h - dy);
        r.y = Math.max(0, d.rect.y + d.rect.h - r.h);
      }
    }
    d.last = r;
    cancelAnimationFrame(frameReq.current);
    frameReq.current = requestAnimationFrame(() => {
      const el = section.current;
      if (!el) return;
      if (!d.edge) {
        el.style.translate = `${r.x - d.rect.x}px ${r.y - d.rect.y}px`;
      } else {
        el.style.left = `${r.x}px`;
        el.style.top = `${r.y}px`;
        el.style.width = `${r.w}px`;
        el.style.height = `${r.h}px`;
      }
    });
  };

  const end = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    cancelAnimationFrame(frameReq.current);
    drag.current = null;
    document.body.classList.remove("win-dragging");
    setPreview(null);
    const target = !d.edge && !meta.fixed ? snapTarget(e.clientX, e.clientY) : null;
    if (target && e.clientY <= 2) dispatch({ type: "toggleMax", id: win.id, value: true });
    else if (target) dispatch({ type: "rect", id: win.id, rect: target });
    else if (d.last) dispatch({ type: "rect", id: win.id, rect: d.last });
    // nothing moved: drop the offset right away
    if (!d.last && section.current) section.current.style.translate = "";
  };

  const frame: Frame = {
    drag: {
      onPointerDown: (e) => begin(e),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
      onDoubleClick: (e) => {
        if ((e.target as HTMLElement).closest("button, a, input")) return;
        if (!meta.fixed) dispatch({ type: "toggleMax", id: win.id });
      },
    },
    captions: <Captions win={win} />,
  };

  const style: React.CSSProperties = win.maximized
    ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR_H}px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <FrameContext.Provider value={frame}>
      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="win-snap-preview pointer-events-none fixed"
          style={{ left: preview.x + 8, top: preview.y + 8, width: preview.w - 16, height: preview.h - 16, zIndex: win.z - 1 }}
        />
      )}
      <motion.section
        ref={section}
        role="dialog"
        aria-label={info.title}
        data-window={win.id}
        onPointerDownCapture={focus}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={win.minimized ? { opacity: 0, scale: 0.85, y: 160 } : { opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
        transition={{ duration: 0.18, ease: [0.1, 0.9, 0.2, 1] }}
        style={style}
        className={`win-window fixed flex flex-col overflow-hidden ${win.maximized ? "rounded-none" : "rounded-lg"} ${
          win.minimized ? "pointer-events-none" : ""
        } ${active ? "is-active" : ""}`}
      >
        {!meta.frameless && (
          <header className="win-titlebar flex h-8 shrink-0 select-none items-center touch-none" {...frame.drag}>
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-3 text-xs">
              <AppIcon icon={info.icon} size={16} />
              <span className="truncate">{info.title}</span>
            </div>
            {frame.captions}
          </header>
        )}

        <div className="relative min-h-0 flex-1">
          <AppContent win={win} />
        </div>

        {!win.maximized &&
          !meta.fixed &&
          EDGES.map(({ edge, className }) => (
            <div
              key={edge}
              className={`absolute z-10 touch-none max-sm:hidden ${className}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                begin(e, edge);
              }}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            />
          ))}
      </motion.section>
    </FrameContext.Provider>
  );
}
