"use client";

/**
 * Debug page for the blue screen: it crashes on purpose so the error boundary can be checked.
 * The stop screen then "restarts" onto the desktop.
 */
export default function CrashOnPurpose(): never {
  throw new Error("MANUALLY_INITIATED_CRASH: the crash was triggered on purpose from /bsod. You asked for it ;)");
}
