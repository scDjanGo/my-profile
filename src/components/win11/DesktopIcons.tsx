"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { FsNode } from "@/data/desktop";
import { TASKBAR_H, useWM } from "./WindowManager";
import { childrenOf, fs, nodeOf, useFs, type Cell } from "./fs";
import { useAppLocale, useFsLabels } from "./i18n";
import { useSystem, type IconSize } from "./system";
import { NodeThumb, RenameField } from "./apps/Explorer";
import { isTouch } from "./utils";

const ICON_PX = { small: 28, medium: 44, large: 64 } as const;
const CELL: Record<IconSize, { w: number; h: number }> = {
  small: { w: 76, h: 76 },
  medium: { w: 84, h: 100 },
  large: { w: 104, h: 126 },
};
const PAD = 8;
const DRAG_THRESHOLD = 5;

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};

/** Viewport size as a stable string snapshot; a desktop-sized default on the server */
function useViewport() {
  const size = useSyncExternalStore(
    subscribeResize,
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => "1440x900",
  );
  const [w, h] = size.split("x").map(Number);
  return { w, h };
}

const key = (p: Cell) => `${p.c}:${p.r}`;

/** Windows fills the desktop column by column, top to bottom */
function firstFree(taken: Set<string>, rows: number): Cell {
  for (let i = 0; ; i++) {
    const cell = { c: Math.floor(i / rows), r: i % rows };
    if (!taken.has(key(cell))) return cell;
  }
}

/** Closest free cell to a target, searched in growing rings */
function nearestFree(target: Cell, taken: Set<string>, rows: number, cols: number): Cell {
  if (!taken.has(key(target))) return target;
  for (let d = 1; d < rows + cols; d++) {
    let best: Cell | null = null;
    let bestDist = Infinity;
    for (let dc = -d; dc <= d; dc++) {
      for (let dr = -d; dr <= d; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue;
        const cell = { c: target.c + dc, r: target.r + dr };
        if (cell.c < 0 || cell.r < 0 || cell.c >= cols || cell.r >= rows || taken.has(key(cell))) continue;
        const dist = dc * dc + dr * dr;
        if (dist < bestDist) {
          best = cell;
          bestDist = dist;
        }
      }
    }
    if (best) return best;
  }
  return firstFree(taken, rows);
}

/** Items with a home of their own until the visitor moves them */
const PINNED_HOME: Record<string, (rows: number, cols: number) => Cell> = {
  bin: (rows, cols) => ({ c: cols - 1, r: rows - 1 }),
};

function computeLayout(ids: string[], saved: Record<string, Cell>, rows: number, cols: number, auto: boolean) {
  const taken = new Set<string>();
  const out: Record<string, Cell> = {};
  for (const id of ids) {
    const home = PINNED_HOME[id];
    if (home && (auto || !saved[id])) {
      const cell = home(rows, cols);
      out[id] = cell;
      taken.add(key(cell));
    }
  }
  if (!auto) {
    for (const id of ids) {
      const p = saved[id];
      if (p && p.c < cols && p.r < rows && !taken.has(key(p))) {
        out[id] = p;
        taken.add(key(p));
      }
    }
  }
  for (const id of ids) {
    if (out[id]) continue;
    const cell = firstFree(taken, rows);
    out[id] = cell;
    taken.add(key(cell));
  }
  return out;
}

interface Drag {
  id: string;
  ids: string[];
  x0: number;
  y0: number;
  active: boolean;
  over: string | null;
}

export default function DesktopIcons({
  selected,
  setSelected,
  renaming,
  setRenaming,
  onContextMenu,
}: {
  selected: string[];
  setSelected: (ids: string[]) => void;
  renaming: string | null;
  setRenaming: (id: string | null) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}) {
  const { openNode } = useWM();
  const fsState = useFs();
  const labels = useFsLabels();
  const locale = useAppLocale();
  const { iconSize, sortBy, autoArrange } = useSystem();
  const vp = useViewport();
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const frameReq = useRef(0);
  const justDragged = useRef(false);

  const startDrag = (d: Drag | null) => {
    dragRef.current = d;
    setDrag(d);
  };
  /** Moves the dragged icons with `translate` — no React render per pointer move */
  const offsetIcons = (ids: string[], dx: number, dy: number) => {
    cancelAnimationFrame(frameReq.current);
    frameReq.current = requestAnimationFrame(() => {
      ids.forEach((id) => {
        const li = listRef.current?.querySelector<HTMLElement>(`[data-cell="${id}"]`);
        if (li) li.style.translate = dx || dy ? `${dx}px ${dy}px` : "";
      });
    });
  };

  let nodes = childrenOf(fsState, "desktop").map((id) => nodeOf(fsState, id)!);
  if (sortBy === "name") nodes = [...nodes].sort((a, b) => labels.name(a).localeCompare(labels.name(b), locale));
  if (sortBy === "type") nodes = [...nodes].sort((a, b) => labels.type(a).localeCompare(labels.type(b), locale));

  const mobile = vp.w < 640;
  const cell = CELL[iconSize];
  const rows = Math.max(1, Math.floor((vp.h - TASKBAR_H - PAD * 2) / cell.h));
  const cols = Math.max(1, Math.floor((vp.w - PAD * 2) / cell.w));
  const layout = computeLayout(
    nodes.map((n) => n.id),
    fsState.positions,
    rows,
    cols,
    autoArrange,
  );

  const cellAt = (x: number, y: number): Cell => ({
    c: Math.min(cols - 1, Math.max(0, Math.floor((x - PAD) / cell.w))),
    r: Math.min(rows - 1, Math.max(0, Math.floor((y - PAD) / cell.h))),
  });

  /** Icon under the cursor that can take a drop (Recycle Bin or a folder) */
  const dropTargetAt = (x: number, y: number, ids: string[]) => {
    for (const el of document.elementsFromPoint(x, y)) {
      const id = (el as HTMLElement).closest<HTMLElement>("[data-icon-id]")?.dataset.iconId;
      if (!id || ids.includes(id)) continue;
      return nodeOf(fsState, id)?.kind === "folder" ? id : null;
    }
    return null;
  };

  const finishDrag = (d: Drag, x: number, y: number) => {
    if (d.over === "bin") return fs.remove(d.ids, "desktop");
    if (d.over) return fs.move(d.ids, "desktop", d.over);

    const origin = layout[d.id];
    const target = cellAt(x, y);
    const delta = { c: target.c - origin.c, r: target.r - origin.r };
    if (!delta.c && !delta.r) return;

    const next: Record<string, Cell> = { ...layout };
    const taken = new Set(Object.entries(layout).filter(([id]) => !d.ids.includes(id)).map(([, p]) => key(p)));
    for (const id of d.ids) {
      const p = layout[id];
      const want = {
        c: Math.min(cols - 1, Math.max(0, p.c + delta.c)),
        r: Math.min(rows - 1, Math.max(0, p.r + delta.r)),
      };
      const placed = nearestFree(want, taken, rows, cols);
      next[id] = placed;
      taken.add(key(placed));
    }
    fs.setPositions(next);
  };

  const onPointerDown = (e: React.PointerEvent, n: FsNode) => {
    e.stopPropagation();
    if (e.pointerType === "touch" || e.button !== 0 || renaming || mobile) return;
    const isSel = selected.includes(n.id);
    // Windows selects on press, so a drag picks up what you grabbed
    if (e.ctrlKey || e.metaKey) setSelected(isSel ? selected.filter((x) => x !== n.id) : [...selected, n.id]);
    else if (!isSel) setSelected([n.id]);
    if (autoArrange) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ids = isSel ? selected : [n.id];
    startDrag({ id: n.id, ids, x0: e.clientX, y0: e.clientY, active: false, over: null });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.active && Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
    offsetIcons(d.ids, dx, dy);
    const over = dropTargetAt(e.clientX, e.clientY, d.ids);
    // re-render only when something visible changes (drag starts, drop target changes)
    if (!d.active || over !== d.over) startDrag({ ...d, active: true, over });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    cancelAnimationFrame(frameReq.current);
    if (d.active) {
      justDragged.current = true;
      finishDrag(d, e.clientX, e.clientY);
    }
    // icons glide from the drop point into their cell
    d.ids.forEach((id) => {
      const li = listRef.current?.querySelector<HTMLElement>(`[data-cell="${id}"]`);
      if (li) li.style.translate = "";
    });
    startDrag(null);
  };

  return (
    <ul
      ref={listRef}
      className={mobile ? "win-desktop-grid absolute inset-0 grid gap-1 p-2" : "absolute inset-0"}
      data-size={iconSize}
      style={mobile ? undefined : { padding: PAD }}
    >
      {nodes.map((n) => {
        const isSel = selected.includes(n.id);
        const p = layout[n.id];
        const dragging = drag?.active && drag.ids.includes(n.id);
        return (
          <li
            key={n.id}
            data-cell={n.id}
            className={mobile ? "flex" : "absolute flex"}
            style={
              mobile
                ? undefined
                : {
                    left: PAD + p.c * cell.w,
                    top: PAD + p.r * cell.h,
                    width: cell.w,
                    height: cell.h - 4,
                    zIndex: dragging ? 20 : undefined,
                    transition: dragging ? "none" : "left .2s cubic-bezier(.2,.8,.2,1), top .2s cubic-bezier(.2,.8,.2,1), translate .2s cubic-bezier(.2,.8,.2,1)",
                    willChange: dragging ? "translate" : undefined,
                  }
            }
          >
            <button
              data-icon-id={n.id}
              onPointerDown={(e) => onPointerDown(e, n)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => startDrag(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (justDragged.current) {
                  justDragged.current = false;
                  return;
                }
                if (isTouch(e)) return openNode(n);
                if (!(e.ctrlKey || e.metaKey) && !mobile) setSelected([n.id]);
                if (mobile) setSelected([n.id]);
              }}
              onDoubleClick={() => openNode(n)}
              onKeyDown={(e) => {
                if (renaming) return;
                if (e.key === "Enter") openNode(n);
                if (e.key === "F2") setRenaming(n.id);
                if (e.key === "Delete") fs.remove(isSel ? selected : [n.id], "desktop");
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSel) setSelected([n.id]);
                onContextMenu(e, n.id);
              }}
              className={`win-desktop-icon ${isSel ? "is-selected" : ""} ${dragging ? "is-dragging" : ""} ${
                drag?.over === n.id ? "is-drop-target" : ""
              }`}
            >
              <NodeThumb node={n} size={n.project ? Math.round(ICON_PX[iconSize] * 0.7) : ICON_PX[iconSize]} />
              {renaming === n.id ? (
                <RenameField
                  initial={labels.name(n)}
                  onDone={(name) => {
                    if (name !== null && name !== labels.name(n)) fs.rename(n.id, name);
                    setRenaming(null);
                  }}
                />
              ) : (
                <span className={`text-center text-xs leading-tight ${isSel ? "line-clamp-3" : "line-clamp-2"}`}>{labels.name(n)}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
