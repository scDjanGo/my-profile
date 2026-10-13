"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SIDEBAR, type FsNode } from "@/data/desktop";
import { useWM, type WinState } from "../WindowManager";
import { canDrop, childrenOf, dnd, dropInto, fs, setDragPayload, nodeOf, parentOf, useFs } from "../fs";
import { useAppLocale, useFsLabels } from "../i18n";
import Menu, { useDropdown, type MenuEntry } from "../Menu";
import {
  AppIcon,
  IconBack,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconCopy,
  IconExternal,
  IconEye,
  IconForward,
  IconGrid,
  IconInfo,
  IconList,
  IconPlus,
  IconRefresh,
  IconReload,
  IconSearch,
  IconSort,
  IconUp,
  ShortcutBadge,
} from "../icons";
import { isTouch } from "../utils";

export function NodeThumb({ node, size }: { node: FsNode; size: number }) {
  if (node.thumb && node.project) {
    return (
      <Image
        src={node.thumb}
        alt=""
        width={Math.round(size * 1.6)}
        height={size}
        className="rounded object-cover object-top shadow-sm ring-1 ring-black/10"
        style={{ width: size * 1.6, height: size }}
      />
    );
  }
  if (node.thumb) {
    return <Image src={node.thumb} alt="" width={size} height={size} className="object-contain" style={{ width: size * 0.8, height: size * 0.8 }} />;
  }
  return (
    <span className="relative inline-flex">
      <AppIcon icon={node.icon} size={size} />
      {node.kind === "link" && node.external && (
        <span className="absolute -bottom-0.5 -left-0.5">
          <ShortcutBadge size={Math.max(10, Math.round(size / 3.4))} />
        </span>
      )}
    </span>
  );
}

/** Inline rename field used by Explorer and the desktop */
export function RenameField({ initial, onDone }: { initial: string; onDone: (name: string | null) => void }) {
  return (
    <input
      autoFocus
      defaultValue={initial}
      onFocus={(e) => e.currentTarget.select()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onDone(e.currentTarget.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") onDone(e.currentTarget.value);
        if (e.key === "Escape") onDone(null);
      }}
      className="w-full rounded-sm border border-(--accent) bg-(--card) px-1 text-center text-xs text-(--text) outline-none [text-shadow:none]"
    />
  );
}

/** Windows' capacity bar: blue, turning red when the disk is almost full */
function DriveBar({ total, free }: { total: number; free: number }) {
  const used = (total - free) / total;
  return (
    <div className="win-drive-bar" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.round(total - free)}>
      <span className={used > 0.9 ? "is-full" : ""} style={{ width: `${used * 100}%` }} />
    </div>
  );
}

type SortBy = "default" | "name" | "type";
const SORTS: SortBy[] = ["default", "name", "type"];
const SORT_KEY = { default: "byDefault", name: "byName", type: "byType" } as const;

export default function Explorer({ win }: { win: WinState }) {
  const { dispatch, openNode } = useWM();
  const t = useTranslations("explorer");
  const tc = useTranslations("common");
  const tf = useTranslations("fs");
  const td = useTranslations("desktop");
  const labels = useFsLabels();
  const locale = useAppLocale();
  const fsState = useFs();

  const start = win.props.folder ?? "root";
  const [history, setHistory] = useState({ stack: [start], index: 0 });
  const [selected, setSelected] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [details, setDetails] = useState(true);
  const [ctx, setCtx] = useState<{ x: number; y: number; target: string | null } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dropOver, setDropOver] = useState<string | null>(null);
  const dd = useDropdown();

  const current = history.stack[history.index];
  const folder = nodeOf(fsState, current) ?? nodeOf(fsState, "root")!;
  const q = query.trim().toLowerCase();
  let items = childrenOf(fsState, folder.id)
    .map((id) => nodeOf(fsState, id)!)
    .filter((n) => labels.name(n).toLowerCase().includes(q));
  if (sortBy === "name") items = [...items].sort((a, b) => labels.name(a).localeCompare(labels.name(b), locale));
  if (sortBy === "type") items = [...items].sort((a, b) => labels.type(a).localeCompare(labels.type(b), locale));
  const sel = selected.length === 1 ? nodeOf(fsState, selected[0]) : undefined;
  const inBin = folder.id === "bin";
  const up = parentOf(fsState, current);
  const gb = (n: number) => t("gb", { n: Math.round(n) });

  const go = (id: string, mode: "push" | "back" | "forward" = "push") => {
    setSelected([]);
    setQuery("");
    let target = id;
    if (mode === "back") target = history.stack[history.index - 1];
    if (mode === "forward") target = history.stack[history.index + 1];
    setHistory((h) => {
      if (mode === "back") return { ...h, index: Math.max(0, h.index - 1) };
      if (mode === "forward") return { ...h, index: Math.min(h.stack.length - 1, h.index + 1) };
      if (h.stack[h.index] === id) return h;
      const stack = [...h.stack.slice(0, h.index + 1), id];
      return { stack, index: stack.length - 1 };
    });
    if (target) dispatch({ type: "props", id: win.id, props: { folder: target } });
  };

  const activate = (node: FsNode) => (node.kind === "folder" ? go(node.id) : openNode(node));

  const newFolder = () => {
    const id = fs.createFolder(folder.id, tf("newFolder"));
    setSelected([id]);
    setRenaming(id);
  };
  const remove = (ids: string[]) => {
    fs.remove(ids, folder.id);
    setSelected([]);
  };
  const targets = (id: string) => (selected.includes(id) ? selected : [id]);
  const restore = (ids: string[]) => {
    fs.restore(ids);
    setSelected([]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (renaming || (e.target as HTMLElement).tagName === "INPUT") return;
    if (e.key === "Delete" && selected.length && !inBin) remove(selected);
    if (e.key === "F2" && sel) setRenaming(sel.id);
    if (e.key === "Enter" && sel) activate(sel);
    if (e.key === "Backspace" && up) go(up);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setSelected(items.map((i) => i.id));
    }
  };

  const sortItems: MenuEntry[] = SORTS.map((s) => ({
    label: t(SORT_KEY[s]),
    checked: sortBy === s,
    radio: true,
    onClick: () => setSortBy(s),
  }));
  const viewItems: MenuEntry[] = [
    { label: t("large"), checked: view === "grid", radio: true, onClick: () => setView("grid") },
    { label: t("details"), checked: view === "list", radio: true, onClick: () => setView("list") },
  ];

  const itemMenu = (n: FsNode): MenuEntry[] => {
    if (inBin)
      return [
        { label: tc("restore"), icon: <IconReload />, bold: true, onClick: () => restore(targets(n.id)) },
        "separator",
        { label: td("emptyBin"), icon: <IconClose />, onClick: () => fs.emptyBin() },
      ];
    const entries: MenuEntry[] = [{ label: tc("open"), bold: true, icon: <AppIcon icon={n.icon} size={16} />, onClick: () => activate(n) }];
    if (n.url) entries.push({ label: tc("openNewTab"), icon: <IconExternal />, href: n.url });
    if (n.url) entries.push({ label: td("copyLink"), icon: <IconCopy />, onClick: () => navigator.clipboard?.writeText(n.url!) });
    entries.push("separator", { label: td("rename"), shortcut: "F2", onClick: () => setRenaming(n.id) });
    if (fs.canDelete(n.id)) entries.push({ label: td("delete"), shortcut: "Del", onClick: () => remove(targets(n.id)) });
    return entries;
  };

  const backgroundMenu: MenuEntry[] = [
    { label: t("view"), icon: <IconEye />, submenu: viewItems },
    { label: t("sort"), icon: <IconSort />, submenu: sortItems },
    { label: t("refresh"), icon: <IconRefresh />, onClick: () => setRefreshKey((k) => k + 1) },
    "separator",
    inBin
      ? { label: td("emptyBin"), icon: <IconClose />, onClick: () => fs.emptyBin() }
      : { label: td("newFolder"), icon: <IconPlus />, onClick: newFolder },
  ];

  const clickItem = (e: React.MouseEvent, n: FsNode) => {
    e.stopPropagation();
    if (isTouch(e)) return activate(n);
    if (e.ctrlKey || e.metaKey) setSelected((s) => (s.includes(n.id) ? s.filter((x) => x !== n.id) : [...s, n.id]));
    else setSelected([n.id]);
  };
  const contextItem = (e: React.MouseEvent, n: FsNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selected.includes(n.id)) setSelected([n.id]);
    setCtx({ x: e.clientX, y: e.clientY, target: n.id });
  };

  /* ---------- Drag and drop: out to the desktop, other windows, folders and the Recycle Bin ---------- */
  const dragProps = (n: FsNode) => ({
    draggable: !inBin && renaming !== n.id && fs.canDelete(n.id),
    onDragStart: (e: React.DragEvent) => {
      const ids = (selected.includes(n.id) ? selected : [n.id]).filter(fs.canDelete);
      if (!selected.includes(n.id)) setSelected([n.id]);
      setDragPayload({ ids, from: folder.id });
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", ids.map((id) => labels.name(nodeOf(fsState, id)!)).join("\n"));
    },
    onDragEnd: () => {
      setDragPayload(null);
      setDropOver(null);
    },
  });
  const dropProps = (target: string) => ({
    "data-drop-folder": target,
    onDragOver: (e: React.DragEvent) => {
      if (!canDrop(target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      if (dropOver !== target) setDropOver(target);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropOver((o) => (o === target ? null : o));
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const payload = dnd.current;
      if (payload && canDrop(target)) dropInto(target, payload);
      setDragPayload(null);
      setDropOver(null);
    },
  });
  const folderDrop = (n: FsNode) => (n.kind === "folder" ? dropProps(n.id) : {});
  const dropRing = (id: string) => (dropOver === id ? "ring-2 ring-(--accent)" : "");

  const rename = (n: FsNode) => (
    <RenameField
      initial={labels.name(n)}
      onDone={(name) => {
        if (name !== null && name !== labels.name(n)) fs.rename(n.id, name);
        setRenaming(null);
      }}
    />
  );

  const chain: FsNode[] = [];
  for (let c: string | null = current; c; c = parentOf(fsState, c)) chain.unshift(nodeOf(fsState, c)!);

  return (
    <div className="win-app flex h-full flex-col text-[13px] outline-none" tabIndex={-1} onKeyDown={onKeyDown}>
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button className="win-btn-icon" aria-label={t("back")} title={t("back")} disabled={history.index === 0} onClick={() => go("", "back")}>
          <IconBack />
        </button>
        <button
          className="win-btn-icon"
          aria-label={t("forward")}
          title={t("forward")}
          disabled={history.index >= history.stack.length - 1}
          onClick={() => go("", "forward")}
        >
          <IconForward />
        </button>
        <button className="win-btn-icon" aria-label={t("up")} title={t("up")} disabled={!up} onClick={() => up && go(up)}>
          <IconUp />
        </button>
        <button className="win-btn-icon max-sm:hidden" aria-label={t("refresh")} title={t("refresh")} onClick={() => setRefreshKey((k) => k + 1)}>
          <IconRefresh />
        </button>

        <nav className="win-field ml-1 flex h-8 min-w-0 flex-1 items-center gap-0.5 overflow-hidden px-2">
          <AppIcon icon={folder.icon} size={16} />
          {chain.map((c, i, arr) => (
            <span key={c.id} className="flex shrink-0 items-center">
              <IconChevronRight size={12} className="mx-0.5 opacity-60" />
              <button
                className={`rounded px-1.5 py-0.5 hover:bg-(--hover) ${i === arr.length - 1 ? "" : "max-sm:hidden"}`}
                onClick={() => go(c.id)}
              >
                {labels.name(c)}
              </button>
            </span>
          ))}
        </nav>

        <label className="win-field flex h-8 w-56 items-center gap-2 px-2 max-md:hidden">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchIn", { folder: labels.name(folder) })}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--text-2)"
          />
          <IconSearch className="opacity-70" />
        </label>
      </div>

      <div className="flex items-center gap-1 border-y border-(--divider) px-2 py-1">
        {inBin ? (
          <button className="win-cmd" onClick={() => fs.emptyBin()} disabled={!items.length}>
            <IconClose /> {td("emptyBin")}
          </button>
        ) : (
          <button className="win-cmd" onClick={newFolder}>
            <IconPlus /> {td("newFolder")}
          </button>
        )}
        {inBin && selected.length > 0 && (
          <button className="win-cmd" onClick={() => restore(selected)}>
            <IconReload /> {tc("restore")}
          </button>
        )}
        <span className="mx-1 h-5 w-px bg-(--divider)" />
        <button className="win-cmd" onClick={dd.toggle("sort")}>
          <IconSort /> <span className="max-sm:hidden">{t("sort")}</span> <IconChevronDown size={10} />
        </button>
        <button className="win-cmd" onClick={dd.toggle("view")}>
          {view === "grid" ? <IconGrid /> : <IconList />} <span className="max-sm:hidden">{t("view")}</span> <IconChevronDown size={10} />
        </button>
        <button className={`win-cmd ml-auto max-md:hidden ${details ? "is-on" : ""}`} aria-pressed={details} onClick={() => setDetails((d) => !d)}>
          <IconInfo /> {t("detailsPane")}
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-(--divider) p-1.5 max-md:hidden">
          {[...SIDEBAR.quick, "root", ...SIDEBAR.drives, "bin"].map((id) => {
            const n = nodeOf(fsState, id)!;
            const drive = SIDEBAR.drives.includes(id);
            return (
              <button
                key={id}
                onClick={() => go(id)}
                {...dropProps(id)}
                className={`flex w-full items-center gap-2.5 rounded py-1.5 pr-2.5 text-left hover:bg-(--hover) ${drive ? "pl-7" : "pl-2.5"} ${
                  current === id ? "bg-(--selected)" : ""
                } ${id === "root" || id === "bin" ? "mt-3" : ""} ${dropRing(id)}`}
              >
                <AppIcon icon={n.icon} size={18} />
                <span className="truncate">{labels.name(n)}</span>
              </button>
            );
          })}
        </aside>

        <main
          key={refreshKey}
          {...dropProps(folder.id)}
          className={`win-fade-in min-w-0 flex-1 overflow-auto p-2 ${dropOver === folder.id ? "bg-(--selected)" : ""}`}
          onClick={() => setSelected([])}
          onContextMenu={(e) => {
            e.preventDefault();
            setCtx({ x: e.clientX, y: e.clientY, target: null });
          }}
        >
          {items.length === 0 && <p className="mt-10 text-center text-(--text-2)">{q ? t("noMatch") : t("empty")}</p>}

          {view === "grid" && folder.id === "root" ? (
            <section>
              <h3 className="px-2 pb-2 pt-1 text-xs font-semibold text-(--text-2)">{t("drives", { count: items.length })}</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-1">
                {items.map((n) => (
                  <button
                    key={n.id}
                    onClick={(e) => clickItem(e, n)}
                    onDoubleClick={() => activate(n)}
                    onContextMenu={(e) => contextItem(e, n)}
                    {...folderDrop(n)}
                    className={`flex items-center gap-3 rounded border p-2 text-left ${
                      selected.includes(n.id) ? "border-(--selected-border) bg-(--selected)" : "border-transparent hover:bg-(--hover)"
                    } ${dropRing(n.id)}`}
                  >
                    <AppIcon icon={n.icon} size={52} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      {renaming === n.id ? rename(n) : <span className="truncate">{labels.name(n)}</span>}
                      {n.drive && (
                        <>
                          <DriveBar total={n.drive.total} free={n.drive.free} />
                          <span className="text-xs text-(--text-2)">{t("free", { free: gb(n.drive.free), total: gb(n.drive.total) })}</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : view === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-1">
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={(e) => clickItem(e, n)}
                  onDoubleClick={() => activate(n)}
                  onContextMenu={(e) => contextItem(e, n)}
                  {...dragProps(n)}
                  {...folderDrop(n)}
                  className={`flex flex-col items-center gap-1.5 rounded border p-2 text-center ${
                    selected.includes(n.id) ? "border-(--selected-border) bg-(--selected)" : "border-transparent hover:bg-(--hover)"
                  } ${dropRing(n.id)}`}
                >
                  <div className="flex h-16 items-center justify-center">
                    <NodeThumb node={n} size={n.project ? 56 : 52} />
                  </div>
                  {renaming === n.id ? rename(n) : <span className="line-clamp-2 break-words text-xs leading-tight">{labels.name(n)}</span>}
                </button>
              ))}
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="text-xs text-(--text-2)">
                <tr>
                  <th className="px-2 py-1 font-normal">
                    <button className="hover:text-(--text)" onClick={() => setSortBy("name")}>
                      {t("name")}
                    </button>
                  </th>
                  <th className="px-2 py-1 font-normal max-sm:hidden">
                    <button className="hover:text-(--text)" onClick={() => setSortBy("type")}>
                      {t("type")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr
                    key={n.id}
                    onClick={(e) => clickItem(e, n)}
                    onDoubleClick={() => activate(n)}
                    onContextMenu={(e) => contextItem(e, n)}
                    {...dragProps(n)}
                    {...folderDrop(n)}
                    className={`cursor-default ${selected.includes(n.id) ? "bg-(--selected)" : "hover:bg-(--hover)"} ${dropRing(n.id)}`}
                  >
                    <td className="flex items-center gap-2 px-2 py-1">
                      {n.thumb ? (
                        <Image src={n.thumb} alt="" width={18} height={18} className="size-[18px] rounded-sm object-cover" />
                      ) : (
                        <AppIcon icon={n.icon} size={18} />
                      )}
                      {renaming === n.id ? rename(n) : labels.name(n)}
                    </td>
                    <td className="px-2 py-1 text-(--text-2) first-letter:uppercase max-sm:hidden">{labels.type(n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>

        {details && (
          <aside className="w-64 shrink-0 overflow-y-auto border-l border-(--divider) p-4 max-md:hidden">
            {sel ? (
              <div className="flex flex-col gap-3">
                <div className="flex justify-center">
                  {sel.project ? (
                    <Image src={sel.project.img} alt={sel.name} width={424} height={248} className="w-full rounded-md object-cover object-top ring-1 ring-black/10" />
                  ) : (
                    <NodeThumb node={sel} size={72} />
                  )}
                </div>
                <h3 className="text-base font-semibold">{labels.name(sel)}</h3>
                <p className="text-xs text-(--text-2) first-letter:uppercase">{labels.type(sel)}</p>
                {sel.project && <p className="leading-relaxed text-(--text-1)">{sel.project.description[locale]}</p>}
                {sel.drive && (
                  <dl className="flex flex-col gap-2">
                    <DriveBar total={sel.drive.total} free={sel.drive.free} />
                    {[
                      [t("used"), gb(sel.drive.total - sel.drive.free)],
                      [t("freeSpace"), gb(sel.drive.free)],
                      [t("capacity"), gb(sel.drive.total)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <dt className="text-(--text-2)">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="flex flex-wrap gap-2">
                  {inBin ? (
                    <button className="win-btn win-btn-accent" onClick={() => restore([sel.id])}>
                      {tc("restore")}
                    </button>
                  ) : (
                    <button className="win-btn win-btn-accent" onClick={() => activate(sel)}>
                      {tc("open")}
                    </button>
                  )}
                  {sel.url && (
                    <a className="win-btn flex items-center gap-1.5" href={sel.url} target="_blank" rel="noreferrer">
                      {t("newTab")} <IconExternal size={12} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-(--text-2)">
                <AppIcon icon={folder.icon} size={64} />
                <p>{selected.length > 1 ? tc("selected", { count: selected.length }) : t("hint")}</p>
              </div>
            )}
          </aside>
        )}
      </div>

      <footer className="flex h-6 shrink-0 items-center gap-4 border-t border-(--divider) px-3 text-[11px] text-(--text-2)">
        <span>{tc("items", { count: items.length })}</span>
        {selected.length > 0 && <span>{tc("selected", { count: selected.length })}</span>}
      </footer>

      {dd.menu?.id === "sort" && <Menu x={dd.menu.x} y={dd.menu.y} onClose={dd.close} items={sortItems} />}
      {dd.menu?.id === "view" && (
        <Menu
          x={dd.menu.x}
          y={dd.menu.y}
          onClose={dd.close}
          items={[...viewItems, "separator", { label: t("detailsPane"), checked: details, onClick: () => setDetails((d) => !d) }]}
        />
      )}
      {ctx && (
        <Menu x={ctx.x} y={ctx.y} onClose={() => setCtx(null)} items={ctx.target ? itemMenu(nodeOf(fsState, ctx.target)!) : backgroundMenu} />
      )}
    </div>
  );
}
