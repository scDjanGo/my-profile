"use client";

import { useEffect, useRef, useState } from "react";
import { encode } from "uqr";

export interface BlueScreenText {
  title: string;
  progress: (percent: number) => string;
  moreInfo: string;
  support: string;
  stopCodeLabel: string;
  whatFailedLabel: string;
  action: string;
}

/** Scannable QR code drawn as one SVG path, white modules on the blue screen */
function QrCode({ value, size = 104 }: { value: string; size?: number }) {
  const { data, size: n } = encode(value, { border: 0 });
  let d = "";
  data.forEach((row, y) => row.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)));
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} className="shrink-0" role="img" aria-label={value}>
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      <path d={d} fill="#0078d7" shapeRendering="crispEdges" />
    </svg>
  );
}

/**
 * Windows "stop error" screen. Counts up like the real one while "collecting error info",
 * then runs `onDone` (retry the render, or go back to the desktop). Enter skips the wait.
 */
export default function BlueScreen({
  face,
  text,
  link,
  stopCode,
  whatFailed,
  onDone,
}: {
  face: string;
  text: BlueScreenText;
  link: string;
  stopCode: string;
  whatFailed?: string;
  onDone: () => void;
}) {
  const [percent, setPercent] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const id = setInterval(() => {
      setPercent((p) => {
        if (p >= 100) return p;
        // irregular steps, like a real dump being written
        return Math.min(100, p + Math.ceil(Math.random() * 9));
      });
    }, 300);
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && done.current();
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (percent < 100) return;
    const id = setTimeout(() => done.current(), 900);
    return () => clearTimeout(id);
  }, [percent]);

  return (
    <div
      role="alert"
      className="fixed inset-0 z-[20000] overflow-y-auto bg-[#0078d7] text-white select-none"
      style={{ fontFamily: "'Segoe UI Light', 'Segoe UI', Selawik, 'Open Sans', system-ui, sans-serif" }}
    >
      <div className="mx-auto flex min-h-full max-w-[1100px] flex-col justify-center gap-8 px-[8vw] py-16 font-light max-sm:gap-6 max-sm:px-6">
        <div className={`leading-none ${face.length > 2 ? "text-[clamp(96px,18vw,200px)]" : "text-[clamp(96px,14vw,160px)]"}`}>{face}</div>
        <p className="max-w-[900px] text-[clamp(20px,2.4vw,28px)] leading-snug">{text.title}</p>
        <p className="text-[clamp(20px,2.4vw,28px)] tabular-nums" aria-live="polite">
          {text.progress(percent)}
        </p>

        <div className="mt-2 flex items-start gap-5 max-sm:flex-col">
          <QrCode value={link} />
          <div className="flex flex-col gap-3 text-[15px] leading-snug">
            <p>
              {text.moreInfo}{" "}
              <a href={link} className="underline decoration-white/50 underline-offset-2 hover:decoration-white">
                {link.replace(/^https?:\/\//, "")}
              </a>
            </p>
            <p className="text-[13px] opacity-90">{text.support}</p>
            <p className="text-[13px]">
              {text.stopCodeLabel}: <span className="font-normal tracking-wide">{stopCode}</span>
            </p>
            {whatFailed && (
              <p className="text-[13px] wrap-break-word">
                {text.whatFailedLabel}: <span className="font-normal">{whatFailed}</span>
              </p>
            )}
            <button
              onClick={() => done.current()}
              className="mt-2 self-start rounded border border-white/60 px-4 py-1.5 text-[13px] font-normal hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {text.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CODE_PREFIX = /^([A-Z][A-Z0-9_]{3,}):\s*/;

/**
 * Windows-style stop code: an UPPER_SNAKE prefix in the message wins
 * ("MANUALLY_INITIATED_CRASH: …"), otherwise it's derived from the error type.
 */
export function toStopCode(error: Error) {
  const own = error.message?.match(CODE_PREFIX)?.[1];
  if (own) return own;
  const name = (error.name || "Error").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
  return name === "ERROR" ? "UI_COMPONENT_EXCEPTION" : `UI_${name.replace(/_ERROR$/, "")}_EXCEPTION`;
}

/** The message without its stop-code prefix */
export const failureText = (error: Error) => error.message?.replace(CODE_PREFIX, "") ?? "";
