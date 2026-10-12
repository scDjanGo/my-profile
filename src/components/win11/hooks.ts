"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};

/** Current time with minute precision; null during server render */
export function useClock(): Date | null {
  const minute = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60000),
    () => null,
  );
  return minute === null ? null : new Date(minute * 60000);
}
