"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useAppLocale } from "../i18n";

type Op = "+" | "-" | "*" | "/";

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Glyph = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden {...s}>
    {children}
  </svg>
);
const G = {
  "+": <Glyph><path d="M8 3v10M3 8h10" /></Glyph>,
  "-": <Glyph><path d="M3 8h10" /></Glyph>,
  "*": <Glyph><path d="m4 4 8 8m0-8-8 8" /></Glyph>,
  "/": (
    <Glyph>
      <path d="M3 8h10" />
      <circle cx="8" cy="4.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="8" cy="11.5" r=".9" fill="currentColor" stroke="none" />
    </Glyph>
  ),
  "=": <Glyph><path d="M3 6h10M3 10h10" /></Glyph>,
  back: <Glyph><path d="M6 3.5h7.5v9H6L2 8Z" /><path d="m7.5 6 3.5 4m0-4-3.5 4" /></Glyph>,
  neg: <Glyph><path d="M3 5.5h5M5.5 3v5M8.5 10.5h5" /><path d="M11 3 5 13" /></Glyph>,
  sqrt: <Glyph><path d="M1.5 9 3.5 8l2 5L9 3h5.5" /><path d="m10 7 3 4m0-4-3 4" /></Glyph>,
};

const OP_SYMBOL: Record<Op, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function compute(a: number, b: number, op: Op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? NaN : a / b;
  }
}

const tidy = (n: number) => (Number.isFinite(n) ? String(parseFloat(n.toPrecision(15))) : "NaN");

export default function Calculator() {
  const t = useTranslations("calc");
  const locale = useAppLocale();
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [expr, setExpr] = useState("");
  const [fresh, setFresh] = useState(true);
  const [memory, setMemory] = useState<number | null>(null);
  const focused = useRef(false);

  const value = parseFloat(display);
  const error = display === "NaN";
  const shown = error
    ? t("divZero")
    : Number(display).toLocaleString(locale, { maximumFractionDigits: 15 }) + (display.endsWith(".") ? (locale === "ru" ? "," : ".") : "");

  const digit = (d: string) => {
    if (error || fresh) {
      setDisplay(d === "." ? "0." : d);
      setFresh(false);
      return;
    }
    if (d === "." && display.includes(".")) return;
    if (display.replace(/[-.]/g, "").length >= 16) return;
    setDisplay(display === "0" && d !== "." ? d : display + d);
  };

  const operator = (next: Op) => {
    if (error) return;
    if (acc !== null && op && !fresh) {
      const r = compute(acc, value, op);
      setAcc(r);
      setDisplay(tidy(r));
      setExpr(`${tidy(r)} ${OP_SYMBOL[next]}`);
    } else {
      setAcc(value);
      setExpr(`${tidy(value)} ${OP_SYMBOL[next]}`);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (acc === null || !op || error) return;
    const r = compute(acc, value, op);
    setExpr(`${tidy(acc)} ${OP_SYMBOL[op]} ${tidy(value)} =`);
    setDisplay(tidy(r));
    setAcc(null);
    setOp(null);
    setFresh(true);
  };

  const unary = (fn: (n: number) => number, label: (n: string) => string) => {
    if (error) return;
    setExpr(label(tidy(value)));
    setDisplay(tidy(fn(value)));
    setFresh(true);
  };

  const clearAll = () => {
    setDisplay("0");
    setAcc(null);
    setOp(null);
    setExpr("");
    setFresh(true);
  };

  const back = () => {
    if (fresh || error) return;
    setDisplay(display.length > 1 && !(display.length === 2 && display.startsWith("-")) ? display.slice(0, -1) : "0");
  };

  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) digit(k);
    else if (k === "." || k === ",") digit(".");
    else if (k === "+" || k === "-" || k === "*" || k === "/") operator(k);
    else if (k === "Enter" || k === "=") equals();
    else if (k === "Backspace") back();
    else if (k === "Escape") clearAll();
    else if (k === "Delete") setDisplay("0");
    else return;
    e.preventDefault();
  };

  type Key = { label: React.ReactNode; aria: string; onClick: () => void; kind?: "num" | "accent" };
  const keys: Key[] = [
    { label: "%", aria: "Percent", onClick: () => unary((n) => ((acc ?? 0) * n) / 100, (n) => `${n}%`) },
    { label: "CE", aria: "Clear entry", onClick: () => setDisplay("0") },
    { label: "C", aria: "Clear", onClick: clearAll },
    { label: G.back, aria: "Backspace", onClick: back },
    { label: <span>1/<i>x</i></span>, aria: "Reciprocal", onClick: () => unary((n) => (n === 0 ? NaN : 1 / n), (n) => `1/(${n})`) },
    { label: <span><i>x</i><sup>2</sup></span>, aria: "Square", onClick: () => unary((n) => n * n, (n) => `sqr(${n})`) },
    { label: G.sqrt, aria: "Square root", onClick: () => unary((n) => (n < 0 ? NaN : Math.sqrt(n)), (n) => `√(${n})`) },
    { label: G["/"], aria: "Divide", onClick: () => operator("/") },
    ...["7", "8", "9"].map((d) => ({ label: d, aria: d, onClick: () => digit(d), kind: "num" as const })),
    { label: G["*"], aria: "Multiply", onClick: () => operator("*") },
    ...["4", "5", "6"].map((d) => ({ label: d, aria: d, onClick: () => digit(d), kind: "num" as const })),
    { label: G["-"], aria: "Minus", onClick: () => operator("-") },
    ...["1", "2", "3"].map((d) => ({ label: d, aria: d, onClick: () => digit(d), kind: "num" as const })),
    { label: G["+"], aria: "Plus", onClick: () => operator("+") },
    { label: G.neg, aria: "Positive negative", onClick: () => !error && setDisplay(tidy(-value)), kind: "num" },
    { label: "0", aria: "0", onClick: () => digit("0"), kind: "num" },
    { label: locale === "ru" ? "," : ".", aria: "Decimal", onClick: () => digit("."), kind: "num" },
    { label: G["="], aria: "Equals", onClick: equals, kind: "accent" },
  ];

  const mem: { label: string; onClick: () => void; needs?: boolean }[] = [
    { label: "MC", onClick: () => setMemory(null), needs: true },
    { label: "MR", onClick: () => memory !== null && (setDisplay(tidy(memory)), setFresh(true)), needs: true },
    { label: "M+", onClick: () => setMemory((m) => (m ?? 0) + value) },
    { label: "M−", onClick: () => setMemory((m) => (m ?? 0) - value) },
    { label: "MS", onClick: () => setMemory(value) },
  ];

  return (
    <div
      className="win-app win-calc flex h-full flex-col gap-1 p-1.5 outline-none select-none"
      tabIndex={0}
      ref={(el) => {
        // Focus once on open so typing works right away, like the real app
        if (el && !focused.current) {
          focused.current = true;
          el.focus();
        }
      }}
      onKeyDown={onKey}
      onPointerDown={(e) => e.currentTarget.focus()}
    >
      <div className="px-3 pt-2 text-sm font-semibold">{t("standard")}</div>
      <div className="flex flex-1 flex-col items-end justify-end px-3 pb-2">
        <div className="min-h-5 truncate text-sm text-(--text-2)">{expr}</div>
        <div className={`max-w-full truncate font-semibold tabular-nums ${error ? "text-2xl" : display.length > 11 ? "text-3xl" : "text-5xl"}`} aria-live="polite">
          {shown}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 text-xs" role="group" aria-label={t("memory")}>
        {mem.map((m) => (
          <button key={m.label} className="rounded py-1.5 hover:bg-(--hover)" disabled={m.needs && memory === null} onClick={m.onClick}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-[3px]">
        {keys.map((k) => (
          <button key={k.aria} aria-label={k.aria} onClick={k.onClick} className={`win-calc-key ${k.kind === "num" ? "is-num" : ""} ${k.kind === "accent" ? "is-accent" : ""}`}>
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
