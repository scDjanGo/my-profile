"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Menu, { useDropdown } from "../Menu";
import { IconChevronDown, IconFile, IconSave, IconZoomIn, IconZoomOut } from "../icons";

const W = 1000;
const H = 640;
const PALETTE = [
  "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4",
  "#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7",
];

type Tool = "pencil" | "brush" | "eraser" | "fill" | "picker" | "line" | "rect" | "ellipse";
type Pt = { x: number; y: number };

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Ic = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 20 20" width={20} height={20} aria-hidden {...s}>
    {children}
  </svg>
);
const TOOL_ICONS: Record<Tool, React.ReactNode> = {
  pencil: <Ic><path d="M4 16l1-4 8.5-8.5a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2L8 15Z" /><path d="M12 5l3 3" /></Ic>,
  brush: <Ic><path d="M16.5 3.5 9 11l-1.5-.5L7 9l7.5-7.5Z" transform="translate(0 1)" /><path d="M6.5 11c-2 0-3 1.3-3 3 0 1-.5 1.6-1.2 2 4.2 1.2 7.2-.6 7.2-3Z" /></Ic>,
  eraser: <Ic><path d="M8 16h9M3.5 11.5l7-7a1.5 1.5 0 0 1 2 0l3 3a1.5 1.5 0 0 1 0 2L10 15H7Z" /><path d="m7 8 5 5" /></Ic>,
  fill: <Ic><path d="M3.5 9.5 9 4l6 6-5.5 5.5a1.5 1.5 0 0 1-2 0l-4-4a1.5 1.5 0 0 1 0-2Z" /><path d="M3.5 10h11.5M17 13s-1.5 2-1.5 3a1.5 1.5 0 0 0 3 0c0-1-1.5-3-1.5-3Z" /></Ic>,
  picker: <Ic><path d="M12.5 4.5 15.5 7.5M14 3a1.8 1.8 0 0 1 3 3l-2 2-3-3Z" /><path d="M12 6 4 14v2h2l8-8" /></Ic>,
  line: <Ic><path d="M4 16 16 4" /></Ic>,
  rect: <Ic><rect x="3.5" y="5" width="13" height="10" rx="1" /></Ic>,
  ellipse: <Ic><ellipse cx="10" cy="10" rx="7" ry="5" /></Ic>,
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Scanline flood fill on device pixels, with a little tolerance for antialiased edges */
function floodFill(ctx: CanvasRenderingContext2D, sx: number, sy: number, color: string) {
  const { width, height } = ctx.canvas;
  const img = ctx.getImageData(0, 0, width, height);
  const d = img.data;
  const start = (sy * width + sx) * 4;
  const target = [d[start], d[start + 1], d[start + 2], d[start + 3]];
  const [r, g, b] = hexToRgb(color);
  if (target[0] === r && target[1] === g && target[2] === b && target[3] === 255) return;
  const tol = 40;
  const match = (i: number) =>
    Math.abs(d[i] - target[0]) <= tol && Math.abs(d[i + 1] - target[1]) <= tol && Math.abs(d[i + 2] - target[2]) <= tol && Math.abs(d[i + 3] - target[3]) <= tol;
  const seen = new Uint8Array(width * height);
  const stack = [sx, sy];
  while (stack.length) {
    const y = stack.pop()!;
    let x = stack.pop()!;
    while (x > 0 && !seen[y * width + x - 1] && match((y * width + x - 1) * 4)) x--;
    let up = false;
    let down = false;
    for (; x < width; x++) {
      const p = y * width + x;
      if (seen[p] || !match(p * 4)) break;
      seen[p] = 1;
      d[p * 4] = r;
      d[p * 4 + 1] = g;
      d[p * 4 + 2] = b;
      d[p * 4 + 3] = 255;
      if (y > 0) {
        const m = !seen[p - width] && match((p - width) * 4);
        if (m && !up) stack.push(x, y - 1);
        up = m;
      }
      if (y < height - 1) {
        const m = !seen[p + width] && match((p + width) * 4);
        if (m && !down) stack.push(x, y + 1);
        down = m;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export default function Paint() {
  const t = useTranslations("paint");
  const canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [size, setSize] = useState(6);
  const [colors, setColors] = useState({ primary: "#000000", secondary: "#ffffff" });
  const [fillShapes, setFillShapes] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [pos, setPos] = useState<Pt | null>(null);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const stroke = useRef<{ start: Pt; last: Pt; prevMid: Pt; color: string; secondary: string } | null>(null);
  const prevTool = useRef<Tool>("brush");
  const dpr = useRef(1);
  const dd = useDropdown();

  const ctx = () => canvas.current!.getContext("2d", { willReadFrequently: true })!;

  useEffect(() => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    dpr.current = ratio;
    for (const c of [canvas.current!, overlay.current!]) {
      c.width = W * ratio;
      c.height = H * ratio;
      c.getContext("2d")!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    const c = ctx();
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
  }, []);

  const syncHistory = () => setHistory({ undo: undoStack.current.length, redo: redoStack.current.length });
  const snapshot = () => {
    const c = canvas.current!;
    undoStack.current.push(ctx().getImageData(0, 0, c.width, c.height));
    if (undoStack.current.length > 30) undoStack.current.shift();
    redoStack.current = [];
    syncHistory();
  };
  const restore = (from: React.RefObject<ImageData[]>, to: React.RefObject<ImageData[]>) => {
    const img = from.current.pop();
    if (!img) return;
    const c = canvas.current!;
    to.current.push(ctx().getImageData(0, 0, c.width, c.height));
    ctx().putImageData(img, 0, 0);
    syncHistory();
  };
  const undo = () => restore(undoStack, redoStack);
  const redo = () => restore(redoStack, undoStack);

  const clear = () => {
    snapshot();
    const c = ctx();
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
  };

  const save = () => {
    canvas.current!.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "untitled.png";
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  };

  const point = (e: React.PointerEvent): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const setupStroke = (c: CanvasRenderingContext2D, color: string) => {
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineCap = tool === "pencil" ? "square" : "round";
    c.lineJoin = "round";
    c.lineWidth = tool === "pencil" ? Math.max(1, Math.round(size / 3)) : tool === "eraser" ? size * 2 : size;
  };

  const drawShape = (c: CanvasRenderingContext2D, a: Pt, b: Pt, color: string, secondary: string) => {
    setupStroke(c, color);
    c.beginPath();
    if (tool === "line") {
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
    } else if (tool === "rect") {
      c.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    } else {
      c.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
    }
    if (fillShapes && tool !== "line") {
      c.fillStyle = secondary;
      c.fill();
    }
    c.stroke();
  };

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    const p = point(e);
    const useSecondary = e.button === 2;
    const color = useSecondary ? colors.secondary : colors.primary;
    const other = useSecondary ? colors.primary : colors.secondary;

    if (tool === "picker") {
      const [r, g, b] = ctx().getImageData(Math.floor(p.x * dpr.current), Math.floor(p.y * dpr.current), 1, 1).data;
      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      setColors((cs) => (useSecondary ? { ...cs, secondary: hex } : { ...cs, primary: hex }));
      setTool(prevTool.current);
      return;
    }
    snapshot();
    if (tool === "fill") {
      floodFill(ctx(), Math.floor(p.x * dpr.current), Math.floor(p.y * dpr.current), color);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    stroke.current = { start: p, last: p, prevMid: p, color: tool === "eraser" ? "#ffffff" : color, secondary: other };
    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      const c = ctx();
      setupStroke(c, stroke.current.color);
      c.beginPath();
      c.arc(p.x, p.y, c.lineWidth / 2, 0, Math.PI * 2);
      c.fill();
    }
  };

  const move = (e: React.PointerEvent) => {
    const p = point(e);
    setPos({ x: Math.round(p.x), y: Math.round(p.y) });
    const st = stroke.current;
    if (!st) return;
    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      // smooth strokes: quadratic curves through midpoints
      const c = ctx();
      setupStroke(c, st.color);
      const mid = { x: (st.last.x + p.x) / 2, y: (st.last.y + p.y) / 2 };
      c.beginPath();
      c.moveTo(st.prevMid.x, st.prevMid.y);
      c.quadraticCurveTo(st.last.x, st.last.y, mid.x, mid.y);
      c.stroke();
      st.prevMid = mid;
      st.last = p;
    } else {
      const o = overlay.current!.getContext("2d")!;
      o.clearRect(0, 0, W, H);
      drawShape(o, st.start, p, st.color, st.secondary);
      st.last = p;
    }
  };

  const up = () => {
    const st = stroke.current;
    if (!st) return;
    if (tool === "line" || tool === "rect" || tool === "ellipse") {
      overlay.current!.getContext("2d")!.clearRect(0, 0, W, H);
      drawShape(ctx(), st.start, st.last, st.color, st.secondary);
    } else {
      const c = ctx();
      setupStroke(c, st.color);
      c.beginPath();
      c.moveTo(st.prevMid.x, st.prevMid.y);
      c.lineTo(st.last.x, st.last.y);
      c.stroke();
    }
    stroke.current = null;
  };

  const pickTool = (next: Tool) => {
    if (next === "picker" && tool !== "picker") prevTool.current = tool;
    setTool(next);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) undo();
    else if (k === "y" || (k === "z" && e.shiftKey)) redo();
    else if (k === "s") save();
    else return;
    e.preventDefault();
  };

  const toolBtn = (id: Tool) => (
    <button key={id} aria-label={t(id)} title={t(id)} aria-pressed={tool === id} onClick={() => pickTool(id)} className={`win-paint-tool ${tool === id ? "is-on" : ""}`}>
      {TOOL_ICONS[id]}
    </button>
  );

  return (
    <div className="win-app flex h-full flex-col text-[13px] outline-none" tabIndex={-1} onKeyDown={onKey}>
      {/* Ribbon */}
      <div className="flex shrink-0 items-stretch gap-1 overflow-x-auto border-b border-(--divider) px-2 py-1.5">
        <div className="flex flex-col justify-center gap-1 pr-2">
          <button className="win-cmd h-7!" onClick={dd.toggle("file")}>
            {t("file")} <IconChevronDown size={10} />
          </button>
          <div className="flex gap-0.5">
            <button className="win-btn-icon size-7!" aria-label={t("undo")} title={`${t("undo")} (Ctrl+Z)`} disabled={!history.undo} onClick={undo}>
              <svg viewBox="0 0 16 16" width={14} height={14} {...s} aria-hidden><path d="M5 3 2 6l3 3M2 6h7.5a4 4 0 0 1 0 8H7" /></svg>
            </button>
            <button className="win-btn-icon size-7!" aria-label={t("redo")} title={`${t("redo")} (Ctrl+Y)`} disabled={!history.redo} onClick={redo}>
              <svg viewBox="0 0 16 16" width={14} height={14} {...s} aria-hidden><path d="m11 3 3 3-3 3M14 6H6.5a4 4 0 0 0 0 8H9" /></svg>
            </button>
          </div>
        </div>
        <div className="win-paint-group">
          <div className="grid grid-cols-3 gap-0.5">{(["pencil", "fill", "picker", "brush", "eraser"] as Tool[]).map(toolBtn)}</div>
          <span>{t("tools")}</span>
        </div>
        <div className="win-paint-group">
          <div className="flex items-center gap-0.5">
            {(["line", "rect", "ellipse"] as Tool[]).map(toolBtn)}
            <button
              className={`win-paint-tool ${fillShapes ? "is-on" : ""}`}
              aria-pressed={fillShapes}
              aria-label={t("fillShape")}
              title={t("fillShape")}
              onClick={() => setFillShapes((f) => !f)}
            >
              <svg viewBox="0 0 20 20" width={20} height={20} aria-hidden>
                <rect x="3.5" y="5" width="13" height="10" rx="1" fill={colors.secondary} stroke={colors.primary} strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          <span>{t("shapes")}</span>
        </div>
        <div className="win-paint-group min-w-36">
          <div className="flex w-full items-center gap-2">
            <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(+e.target.value)} className="win-range flex-1" aria-label={t("size")} />
            <span className="w-6 text-right tabular-nums">{size}</span>
          </div>
          <span>{t("size")}</span>
        </div>
        <div className="win-paint-group">
          <div className="flex items-center gap-2">
            <div className="relative size-10" title={`${t("primary")} / ${t("secondary")}`}>
              <button
                aria-label={t("swap")}
                title={t("swap")}
                onClick={() => setColors((c) => ({ primary: c.secondary, secondary: c.primary }))}
                className="absolute bottom-0 right-0 size-6 rounded-full ring-2 ring-(--card)"
                style={{ background: colors.secondary }}
              />
              <span className="absolute left-0 top-0 size-7 rounded-full ring-2 ring-(--card)" style={{ background: colors.primary }} />
            </div>
            <div className="grid grid-cols-10 gap-0.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  aria-label={c}
                  title={c}
                  onClick={() => setColors((cs) => ({ ...cs, primary: c }))}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setColors((cs) => ({ ...cs, secondary: c }));
                  }}
                  className="size-[18px] rounded-full ring-1 ring-black/15 transition hover:scale-110"
                  style={{ background: c }}
                />
              ))}
            </div>
            <label className="win-paint-tool relative cursor-pointer overflow-hidden" title={t("custom")}>
              <span className="size-5 rounded-full" style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }} />
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors((cs) => ({ ...cs, primary: e.target.value }))}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label={t("custom")}
              />
            </label>
          </div>
          <span>{t("colors")}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="min-h-0 flex-1 overflow-auto bg-(--paint-bg) p-6">
        <div className="relative shadow-lg" style={{ width: (W * zoom) / 100, height: (H * zoom) / 100 }}>
          <canvas ref={canvas} className="absolute inset-0 size-full bg-white" />
          <canvas
            ref={overlay}
            className="absolute inset-0 size-full touch-none"
            style={{ cursor: tool === "picker" || tool === "fill" ? "cell" : "crosshair" }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={() => setPos(null)}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>

      <footer className="flex h-7 shrink-0 items-center gap-6 border-t border-(--divider) px-3 text-[11px] text-(--text-2)">
        <span className="w-24 tabular-nums">{pos ? `${pos.x}, ${pos.y}px` : ""}</span>
        <span className="max-sm:hidden">
          {W} × {H}px
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button className="win-btn-icon size-6!" aria-label={t("zoomOut")} title={t("zoomOut")} onClick={() => setZoom((z) => Math.max(25, z - 25))}>
            <IconZoomOut size={14} />
          </button>
          <span className="w-10 text-center tabular-nums">{zoom}%</span>
          <button className="win-btn-icon size-6!" aria-label={t("zoomIn")} title={t("zoomIn")} onClick={() => setZoom((z) => Math.min(300, z + 25))}>
            <IconZoomIn size={14} />
          </button>
        </div>
      </footer>

      {dd.menu && (
        <Menu
          x={dd.menu.x}
          y={dd.menu.y}
          onClose={dd.close}
          items={[
            { label: t("new"), icon: <IconFile />, onClick: clear },
            { label: t("save"), icon: <IconSave />, shortcut: "Ctrl+S", onClick: save },
          ]}
        />
      )}
    </div>
  );
}
