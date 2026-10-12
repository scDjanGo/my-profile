"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import Menu, { useDropdown, type MenuEntry } from "../Menu";
import { IconClock, IconCopy, IconFile, IconReload, IconSave, IconSelectAll, IconZoomIn, IconZoomOut } from "../icons";
import { useAppLocale } from "../i18n";

export default function Notepad() {
  const t = useTranslations("notepad");
  const locale = useAppLocale();
  const readme = t("readme");
  // null = still showing the original readme, so switching language re-translates it
  const [edited, setEdited] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ ln: 1, col: 1 });
  const [wrap, setWrap] = useState(true);
  const [status, setStatus] = useState(true);
  const [zoom, setZoom] = useState(100);
  const area = useRef<HTMLTextAreaElement>(null);
  const dd = useDropdown();
  const text = edited ?? readme;

  const track = (el: HTMLTextAreaElement) => {
    const lines = el.value.slice(0, el.selectionStart).split("\n");
    setCursor({ ln: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const insert = (snippet: string) => {
    const el = area.current;
    if (!el) return;
    const next = el.value.slice(0, el.selectionStart) + snippet + el.value.slice(el.selectionEnd);
    const pos = el.selectionStart + snippet.length;
    setEdited(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
      track(el);
    });
  };

  const save = () => {
    const blob = new Blob([text.replace(/\n/g, "\r\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "readme.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const menus: Record<string, MenuEntry[]> = {
    file: [
      { label: t("new"), icon: <IconFile />, shortcut: "Ctrl+N", onClick: () => setEdited("") },
      { label: t("save"), icon: <IconSave />, shortcut: "Ctrl+S", onClick: save },
      "separator",
      { label: t("restore"), icon: <IconReload />, onClick: () => setEdited(null) },
    ],
    edit: [
      {
        label: t("copy"),
        icon: <IconCopy />,
        shortcut: "Ctrl+C",
        onClick: () => {
          const el = area.current;
          const sel = el ? el.value.slice(el.selectionStart, el.selectionEnd) : "";
          navigator.clipboard?.writeText(sel || text);
        },
      },
      {
        label: t("selectAll"),
        icon: <IconSelectAll />,
        shortcut: "Ctrl+A",
        onClick: () => requestAnimationFrame(() => area.current?.select()),
      },
      "separator",
      {
        label: t("timeDate"),
        icon: <IconClock />,
        shortcut: "F5",
        onClick: () => insert(new Date().toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })),
      },
    ],
    view: [
      { label: t("zoomIn"), icon: <IconZoomIn />, shortcut: "Ctrl+Plus", onClick: () => setZoom((z) => Math.min(300, z + 10)) },
      { label: t("zoomOut"), icon: <IconZoomOut />, shortcut: "Ctrl+Minus", onClick: () => setZoom((z) => Math.max(50, z - 10)) },
      { label: t("zoomReset"), onClick: () => setZoom(100) },
      "separator",
      { label: t("statusBar"), checked: status, onClick: () => setStatus((s) => !s) },
      { label: t("wordWrap"), checked: wrap, onClick: () => setWrap((w) => !w) },
    ],
  };

  return (
    <div className="win-app flex h-full flex-col text-[13px]">
      <div className="flex items-center gap-0.5 px-1 py-1">
        {(["file", "edit", "view"] as const).map((m) => (
          <button key={m} className={`rounded px-3 py-1 hover:bg-(--hover) ${dd.menu?.id === m ? "bg-(--hover)" : ""}`} onClick={dd.toggle(m)}>
            {t(m)}
          </button>
        ))}
      </div>
      <textarea
        ref={area}
        value={text}
        spellCheck={false}
        onChange={(e) => {
          setEdited(e.target.value);
          track(e.target);
        }}
        onSelect={(e) => track(e.currentTarget)}
        onKeyDown={(e) => {
          const mod = e.ctrlKey || e.metaKey;
          if (e.key === "F5") {
            e.preventDefault();
            insert(new Date().toLocaleString(locale, { dateStyle: "short", timeStyle: "short" }));
          } else if (mod && e.key.toLowerCase() === "s") {
            e.preventDefault();
            save();
          } else if (mod && (e.key === "=" || e.key === "+")) {
            e.preventDefault();
            setZoom((z) => Math.min(300, z + 10));
          } else if (mod && e.key === "-") {
            e.preventDefault();
            setZoom((z) => Math.max(50, z - 10));
          }
        }}
        style={{ fontSize: `${(14 * zoom) / 100}px` }}
        className={`min-h-0 flex-1 resize-none border-y border-(--divider) bg-(--card) p-3 font-mono leading-relaxed outline-none ${
          wrap ? "whitespace-pre-wrap" : "overflow-x-auto whitespace-pre"
        }`}
      />
      {status && (
        <footer className="flex h-7 shrink-0 items-center gap-6 px-3 text-[11px] text-(--text-2)">
          <span>{t("position", cursor)}</span>
          <span className="ml-auto max-sm:hidden">{t("chars", { count: text.length })}</span>
          <span>{zoom}%</span>
          <span className="max-sm:hidden">Windows (CRLF)</span>
          <span>UTF-8</span>
        </footer>
      )}
      {dd.menu && <Menu x={dd.menu.x} y={dd.menu.y} onClose={dd.close} items={menus[dd.menu.id]} />}
    </div>
  );
}
