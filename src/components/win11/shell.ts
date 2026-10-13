"use client";

import { createContext, useContext } from "react";

/** Power actions of the shell, for apps that can lock or shut down the PC (cmd's `shutdown`) */
export interface ShellActions {
  lock: () => void;
  shutdown: () => void;
  restart: () => void;
}

export const ShellContext = createContext<ShellActions | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside the desktop shell");
  return ctx;
}
