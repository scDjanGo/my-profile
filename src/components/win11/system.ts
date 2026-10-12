"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export const ACCENTS = {
  blue: { light: "#005fb8", dark: "#60cdff" },
  violet: { light: "#7a3fd1", dark: "#c6a4ff" },
  pink: { light: "#bf0077", dark: "#ff8fd0" },
  red: { light: "#c42b1c", dark: "#ff99a4" },
  orange: { light: "#c24e00", dark: "#ffb27a" },
  green: { light: "#107c10", dark: "#6ccb5f" },
  teal: { light: "#00787d", dark: "#5fd6d9" },
} as const;

export type AccentId = keyof typeof ACCENTS;
export type IconSize = "large" | "medium" | "small";
export type SortBy = "default" | "name" | "type";

export interface SystemState {
  theme: "light" | "dark";
  accent: AccentId;
  brightness: number;
  nightLight: boolean;
  energySaver: boolean;
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  volume: number;
  muted: boolean;
  iconSize: IconSize;
  sortBy: SortBy;
  /** Interactive three.js bloom instead of the flat picture */
  wallpaper3d: boolean;
  /** Windows' "Auto arrange icons": ignore positions the user dragged icons to */
  autoArrange: boolean;
}

const DEFAULTS: SystemState = {
  theme: "light",
  accent: "blue",
  brightness: 100,
  nightLight: false,
  energySaver: false,
  wifi: true,
  bluetooth: true,
  airplane: false,
  volume: 60,
  muted: false,
  iconSize: "medium",
  sortBy: "default",
  wallpaper3d: true,
  autoArrange: false,
};

const PERSISTED: (keyof SystemState)[] = ["theme", "accent", "nightLight", "iconSize", "sortBy", "volume", "muted", "wallpaper3d", "autoArrange"];
const KEY = "win11-system";

let state = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function apply(s: SystemState) {
  const root = document.documentElement;
  root.dataset.theme = s.theme;
  root.style.setProperty("--accent-l", ACCENTS[s.accent].light);
  root.style.setProperty("--accent-d", ACCENTS[s.accent].dark);
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<SystemState>;
    const picked = Object.fromEntries(PERSISTED.filter((k) => k in saved).map((k) => [k, saved[k]]));
    state = { ...state, ...picked };
  } catch {}
  apply(state);
}

function emit() {
  listeners.forEach((l) => l());
}

export const system = {
  get: () => state,
  set(patch: Partial<SystemState>) {
    state = { ...state, ...patch };
    // Airplane mode switches radios off, like on a real laptop
    if (patch.airplane === true) state = { ...state, wifi: false, bluetooth: false };
    if (patch.wifi === true || patch.bluetooth === true) state = { ...state, airplane: false };
    apply(state);
    try {
      localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(PERSISTED.map((k) => [k, state[k]]))));
    } catch {}
    emit();
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    if (!loaded) {
      load();
      if (state !== DEFAULTS) queueMicrotask(emit);
    }
    return () => listeners.delete(cb);
  },
};

export function useSystem() {
  return useSyncExternalStore(system.subscribe, system.get, () => DEFAULTS);
}

/** Effective screen brightness: energy saver caps it like Windows does */
export const effectiveBrightness = (s: SystemState) => (s.energySaver ? Math.min(s.brightness, 70) : s.brightness);
export const isOnline = (s: SystemState) => s.wifi && !s.airplane;

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

/** Real battery level where the browser exposes it (Chromium), 100% otherwise */
export function useBattery() {
  const [battery, setBattery] = useState({ level: 100, charging: true });
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (!nav.getBattery) return;
    let mgr: BatteryManager | null = null;
    const update = () => mgr && setBattery({ level: Math.round(mgr.level * 100), charging: mgr.charging });
    nav.getBattery().then((m) => {
      mgr = m;
      update();
      m.addEventListener("levelchange", update);
      m.addEventListener("chargingchange", update);
    });
    return () => {
      mgr?.removeEventListener("levelchange", update);
      mgr?.removeEventListener("chargingchange", update);
    };
  }, []);
  return battery;
}

let audio: AudioContext | null = null;

/** Short "ding" played when the volume changes — the way Windows confirms it */
export function playDing(volume: number) {
  if (volume <= 0) return;
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, audio.currentTime + 0.15);
    gain.gain.setValueAtTime((volume / 100) * 0.2, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.25);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.26);
  } catch {}
}
