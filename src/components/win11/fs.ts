"use client";

import { useSyncExternalStore } from "react";
import { FS, type FsNode } from "@/data/desktop";

/**
 * Mutable layer over the static file system from data/desktop.ts:
 * visitors can create folders, rename items, delete to the Recycle Bin and restore.
 * Only the changes are stored, so new projects in PorfolioData still show up.
 */
interface FsState {
  children: Record<string, string[]>;
  created: Record<string, FsNode>;
  renamed: Record<string, string>;
  /** item id -> folder it was deleted from */
  origin: Record<string, string>;
  /** Desktop grid cells the visitor dragged icons to */
  positions: Record<string, Cell>;
}

export interface Cell {
  c: number;
  r: number;
}

// v2: the desktop was slimmed down and content moved onto drives C: and D:
const KEY = "win11-fs-v2";
const PROTECTED = new Set(["root", "desktop", "bin", "c", "d"]);

const initial: FsState = { children: {}, created: {}, renamed: {}, origin: {}, positions: {} };
let state = initial;
let loaded = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function commit(next: FsState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as FsState | null;
    localStorage.removeItem("win11-fs");
    if (saved?.children) {
      state = { ...initial, ...saved };
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
  } catch {}
}

export function nodeOf(s: FsState, id: string): FsNode | undefined {
  const base = FS[id] ?? s.created[id];
  if (!base) return undefined;
  return s.renamed[id] ? { ...base, name: s.renamed[id] } : base;
}

export function childrenOf(s: FsState, id: string): string[] {
  const list = s.children[id] ?? nodeOf(s, id)?.children ?? [];
  return list.filter((c) => nodeOf(s, c));
}

/**
 * Folder that "owns" an item, preferring its place on a drive over the desktop shortcut,
 * so Projects opened from the desktop still shows "This PC > C: > Projects".
 */
export function parentOf(s: FsState, id: string): string | null {
  if (id === "root") return null;
  if (s.origin[id] && childrenOf(s, "bin").includes(id)) return "bin";
  const folders = ["root", ...Object.keys(FS).filter((f) => f !== "desktop" && f !== "root"), ...Object.keys(s.created), "desktop"];
  for (const f of folders) {
    const n = nodeOf(s, f);
    if (n?.kind === "folder" && childrenOf(s, f).includes(id)) return f;
  }
  return "root";
}

/** True when `target` is `id` itself or sits somewhere inside it */
function isInside(s: FsState, target: string, id: string): boolean {
  if (target === id) return true;
  return childrenOf(s, id).some((c) => nodeOf(s, c)?.kind === "folder" && isInside(s, target, c));
}

const setChildren = (s: FsState, id: string, list: string[]) => ({ ...s.children, [id]: list });

export const fs = {
  get: () => state,
  subscribe(cb: () => void) {
    listeners.add(cb);
    load();
    return () => listeners.delete(cb);
  },
  canDelete: (id: string) => !PROTECTED.has(id),
  createFolder(parent: string, name: string) {
    const existing = new Set(childrenOf(state, parent).map((c) => nodeOf(state, c)?.name));
    let unique = name;
    for (let i = 2; existing.has(unique); i++) unique = `${name} (${i})`;
    const id = `custom-${Date.now().toString(36)}`;
    const node: FsNode = { id, name: unique, icon: "folder", kind: "folder", children: [], custom: true };
    commit({
      ...state,
      created: { ...state.created, [id]: node },
      children: setChildren(state, parent, [...childrenOf(state, parent), id]),
    });
    return id;
  },
  rename(id: string, name: string) {
    const clean = name.trim();
    if (!clean) return;
    commit({ ...state, renamed: { ...state.renamed, [id]: clean } });
  },
  remove(ids: string[], from: string) {
    const del = ids.filter((id) => fs.canDelete(id) && from !== "bin");
    if (!del.length) return;
    commit({
      ...state,
      origin: { ...state.origin, ...Object.fromEntries(del.map((id) => [id, from])) },
      children: {
        ...setChildren(state, from, childrenOf(state, from).filter((c) => !del.includes(c))),
        bin: [...childrenOf(state, "bin"), ...del.filter((d) => !childrenOf(state, "bin").includes(d))],
      },
    });
  },
  restore(ids: string[]) {
    const next = { ...state, children: { ...state.children }, origin: { ...state.origin } };
    for (const id of ids) {
      const to = next.origin[id] ?? "desktop";
      next.children[to] = [...childrenOf(next, to), id];
      delete next.origin[id];
    }
    next.children.bin = childrenOf(next, "bin").filter((c) => !ids.includes(c));
    commit(next);
  },
  /** Moves items into another folder (drag-and-drop onto a folder icon) */
  move(ids: string[], from: string, to: string) {
    if (from === to || to === "root") return;
    const moving = ids.filter((id) => !isInside(state, to, id) && fs.canDelete(id) && nodeOf(state, to)?.kind === "folder");
    if (!moving.length) return;
    const positions = { ...state.positions };
    moving.forEach((id) => delete positions[id]);
    commit({
      ...state,
      positions,
      children: {
        ...setChildren(state, from, childrenOf(state, from).filter((c) => !moving.includes(c))),
        [to]: [...childrenOf(state, to), ...moving.filter((m) => !childrenOf(state, to).includes(m))],
      },
    });
  },
  setPositions(positions: Record<string, Cell>) {
    commit({ ...state, positions });
  },
  clearPositions() {
    commit({ ...state, positions: {} });
  },
  emptyBin() {
    const gone = childrenOf(state, "bin");
    const created = { ...state.created };
    gone.forEach((id) => delete created[id]);
    const origin = { ...state.origin };
    gone.forEach((id) => delete origin[id]);
    commit({ ...state, created, origin, children: { ...state.children, bin: [] } });
  },
};

/** Items being dragged out of an Explorer window (HTML drag and drop) */
export interface DragPayload {
  ids: string[];
  from: string;
}

export const dnd: { current: DragPayload | null } = { current: null };

export function setDragPayload(payload: DragPayload | null) {
  dnd.current = payload;
}

/** Drops dragged items onto a folder; the Recycle Bin deletes them, like in Windows */
export function dropInto(target: string, payload: DragPayload) {
  if (target === "bin") return fs.remove(payload.ids, payload.from);
  fs.move(payload.ids, payload.from, target);
}

/** Whether a folder can take the items being dragged right now */
export function canDrop(target: string) {
  const d = dnd.current;
  if (!d || target === d.from || target === "root") return false;
  if (target === "bin") return d.from !== "bin";
  return nodeOf(state, target)?.kind === "folder" && !d.ids.some((id) => isInside(state, target, id));
}

export function useFs() {
  return useSyncExternalStore(fs.subscribe, fs.get, () => initial);
}
