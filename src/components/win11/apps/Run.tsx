"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useWM, type WinState } from "../WindowManager";
import { useLauncher } from "../launcher";
import { AppIcon, IconChevronDown } from "../icons";

const HISTORY_KEY = "win11-run-history";

function loadHistory(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function ErrorGlyph() {
  return (
    <svg viewBox="0 0 32 32" width={32} height={32} aria-hidden className="shrink-0">
      <circle cx="16" cy="16" r="14" fill="#C42B1C" />
      <path d="m11 11 10 10m0-10-10 10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Win+R — opens programs, folders, drives and web addresses by name */
export default function Run({ win }: { win: WinState }) {
  const t = useTranslations("run");
  const { dispatch, open } = useWM();
  const launch = useLauncher();
  const [history, setHistory] = useState(loadHistory);
  // Windows pre-fills the last command, selected, so Enter repeats it
  const [value, setValue] = useState(() => history[0] ?? "");
  const [listOpen, setListOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const close = () => dispatch({ type: "close", id: win.id });

  const submit = () => {
    const cmd = value.trim();
    if (!cmd) return input.current?.focus();
    if (!launch(cmd)) return setError(cmd);
    const next = [cmd, ...history.filter((h) => h.toLowerCase() !== cmd.toLowerCase())].slice(0, 12);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
    close();
  };

  const dismissError = () => {
    setError(null);
    requestAnimationFrame(() => input.current?.select());
  };

  return (
    <form
      className="win-app relative flex h-full flex-col bg-(--card) text-[13px] outline-none"
      tabIndex={-1}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        if (error) dismissError();
        else if (listOpen) setListOpen(false);
        else close();
      }}
    >
      <div className="flex flex-1 flex-col gap-4 px-5 pt-5">
        <div className="flex items-start gap-4">
          <AppIcon icon="run" size={32} />
          <p className="leading-snug">{t("prompt")}</p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor={`${win.id}-cmd`} className="w-14 shrink-0">
            {t("open")}
          </label>
          <div className="relative flex-1">
            <div className="win-field flex h-8 items-center pl-2">
              <input
                id={`${win.id}-cmd`}
                ref={input}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                value={value}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.altKey && e.key === "ArrowDown") setListOpen(true);
                }}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
              {history.length > 0 && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={t("history")}
                  title={t("history")}
                  className="flex h-full w-8 items-center justify-center rounded-r hover:bg-(--hover)"
                  onClick={() => setListOpen((o) => !o)}
                >
                  <IconChevronDown size={10} />
                </button>
              )}
            </div>
            {listOpen && (
              <ul role="listbox" aria-label={t("history")} className="win-menu absolute inset-x-0 top-full z-10 mt-1 max-h-40 overflow-y-auto p-1!">
                {history.map((h) => (
                  <li key={h}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={h === value}
                      className="w-full truncate rounded px-2 py-1 text-left hover:bg-(--hover)"
                      onClick={() => {
                        setValue(h);
                        setListOpen(false);
                        input.current?.focus();
                      }}
                    >
                      {h}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-(--divider) bg-(--mica) px-5 py-3">
        <button type="submit" className="win-btn win-btn-accent min-w-20">
          {t("ok")}
        </button>
        <button type="button" className="win-btn min-w-20" onClick={close}>
          {t("cancel")}
        </button>
        <button
          type="button"
          className="win-btn min-w-20"
          onClick={() => {
            open("explorer", { folder: "root" });
            close();
          }}
        >
          {t("browse")}
        </button>
      </div>

      {error && (
        <div role="alertdialog" aria-label={error} className="win-fade-in absolute inset-0 z-20 flex flex-col bg-(--card)">
          <div className="flex flex-1 items-start gap-4 px-5 pt-5">
            <ErrorGlyph />
            <p className="leading-snug">{t("notFound", { name: error })}</p>
          </div>
          <div className="flex justify-end border-t border-(--divider) bg-(--mica) px-5 py-3">
            <button type="button" autoFocus className="win-btn win-btn-accent min-w-20" onClick={dismissError}>
              {t("ok")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
