"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FS, type FsNode } from "@/data/desktop";
import { useWM } from "./WindowManager";
import { NodeThumb } from "./apps/Explorer";
import { nodeOf, useFs } from "./fs";
import { useAppLocale, useFsLabels } from "./i18n";
import Menu from "./Menu";
import { IconChevronLeft, IconChevronRight, IconLock, IconPower, IconReload, IconSearch, UserAvatar } from "./icons";

const PINNED = ["root", "browser", "about", "readme", "resume", "settings", "calculator", "paint", "solitaire", "projects", "pets", "github"];
const RECOMMENDED = ["project-9", "project-11", "project-1", "project-3", "pet-3", "pet-1"];
const ALL_APPS = ["about", "calculator", "root", "browser", "readme", "resume", "settings", "paint", "solitaire", "github", "linkedin", "telegram", "whatsapp", "gmail"];

export default function StartMenu({
  searchFirst,
  close,
  onLock,
  onShutdown,
  onRestart,
}: {
  searchFirst: boolean;
  close: () => void;
  onLock: () => void;
  onShutdown: () => void;
  onRestart: () => void;
}) {
  const t = useTranslations("start");
  const tl = useTranslations("lock");
  const ta = useTranslations("apps");
  const { openNode, open } = useWM();
  const labels = useFsLabels();
  const locale = useAppLocale();
  const fsState = useFs();
  const [query, setQuery] = useState("");
  const [allApps, setAllApps] = useState(false);
  const [power, setPower] = useState<{ x: number; y: number } | null>(null);

  const launch = (node: FsNode) => {
    close();
    openNode(node);
  };
  const searchWeb = () => {
    close();
    open("browser", { url: `https://www.google.com/search?igu=1&q=${encodeURIComponent(query)}` });
  };

  const q = query.trim().toLowerCase();
  const searchable = [...Object.values(FS), ...Object.values(fsState.created)]
    .map((n) => nodeOf(fsState, n.id)!)
    .filter((n) => n && n.id !== "desktop");
  const results = q
    ? searchable
        .filter(
          (n) =>
            labels.name(n).toLowerCase().includes(q) ||
            labels.type(n).toLowerCase().includes(q) ||
            n.project?.description[locale].toLowerCase().includes(q),
        )
        .slice(0, 8)
    : [];

  const apps = ALL_APPS.map((id) => FS[id]).sort((a, b) => labels.name(a).localeCompare(labels.name(b), locale));

  return (
    <motion.div
      data-flyout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.1, 0.9, 0.2, 1] } }}
      exit={{ opacity: 0, y: 40, transition: { duration: 0.14 } }}
      className="win-flyout fixed bottom-[60px] left-1/2 z-[9100] flex h-[min(720px,calc(100dvh-72px))] w-[640px] max-w-[calc(100vw-16px)] flex-col text-[13px]"
      style={{ x: "-50%" }}
      role="dialog"
      aria-label={t("pinned")}
    >
      <div className="px-8 pb-2 pt-7 max-sm:px-4 max-sm:pt-4">
        <form
          className="win-field flex h-9 items-center gap-3 rounded-full! px-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (results[0]) launch(results[0]);
            else if (q) searchWeb();
          }}
        >
          <IconSearch className="opacity-70" />
          <input
            autoFocus={searchFirst}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--text-2)"
          />
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-6 max-sm:px-4">
        {q ? (
          <section className="pt-3">
            <h3 className="mb-2 px-2 font-semibold">{results.length ? t("bestMatch") : t("nothing")}</h3>
            {results.map((n) => (
              <button key={n.id} onClick={() => launch(n)} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-(--hover)">
                <div className="flex w-10 justify-center">
                  <NodeThumb node={n} size={n.project ? 22 : 28} />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{labels.name(n)}</span>
                  <span className="text-xs text-(--text-2) first-letter:uppercase">{labels.type(n)}</span>
                </div>
              </button>
            ))}
            <button onClick={searchWeb} className="mt-2 flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-(--hover)">
              <div className="flex w-10 justify-center">
                <IconSearch size={18} />
              </div>
              <span className="truncate">{t("searchWeb", { q: query })}</span>
            </button>
          </section>
        ) : allApps ? (
          <section className="pt-3">
            <div className="mb-3 flex items-center justify-between px-2">
              <h3 className="font-semibold">{t("allApps")}</h3>
              <button className="win-btn flex items-center gap-1 py-0.5! text-xs" onClick={() => setAllApps(false)}>
                <IconChevronLeft size={10} /> {t("back")}
              </button>
            </div>
            {apps.map((n, i) => {
              const letter = labels.name(n)[0].toUpperCase();
              const showLetter = i === 0 || labels.name(apps[i - 1])[0].toUpperCase() !== letter;
              return (
                <div key={n.id}>
                  {showLetter && <div className="px-3 pb-1 pt-3 text-xs font-semibold text-(--text-2)">{letter}</div>}
                  <button onClick={() => launch(n)} className="flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left hover:bg-(--hover)">
                    <NodeThumb node={n} size={24} />
                    <span className="truncate">{n.id === "root" ? ta("explorer") : labels.name(n)}</span>
                  </button>
                </div>
              );
            })}
          </section>
        ) : (
          <>
            <section className="pt-3">
              <div className="mb-3 flex items-center justify-between px-2">
                <h3 className="font-semibold">{t("pinned")}</h3>
                <button className="win-btn flex items-center gap-1 py-0.5! text-xs" onClick={() => setAllApps(true)}>
                  {t("allApps")} <IconChevronRight size={10} />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-y-1 max-sm:grid-cols-4">
                {PINNED.map((id) => {
                  const n = nodeOf(fsState, id) ?? FS[id];
                  return (
                    <button key={id} onClick={() => launch(n)} className="flex flex-col items-center gap-2 rounded-md px-1 py-3 hover:bg-(--hover)">
                      <NodeThumb node={n} size={32} />
                      <span className="w-full truncate text-center text-xs">{labels.name(n)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="pt-5">
              <div className="mb-2 flex items-center justify-between px-2">
                <h3 className="font-semibold">{t("recommended")}</h3>
                <button
                  className="win-btn flex items-center gap-1 py-0.5! text-xs"
                  onClick={() => {
                    close();
                    open("explorer", { folder: "projects" });
                  }}
                >
                  {t("more")} <IconChevronRight size={10} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 max-sm:grid-cols-1">
                {RECOMMENDED.map((id) => {
                  const n = FS[id];
                  return (
                    <button key={id} onClick={() => launch(n)} className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-(--hover)">
                      <Image src={n.thumb!} alt="" width={40} height={40} className="size-10 rounded object-cover object-top ring-1 ring-black/10" />
                      <div className="min-w-0">
                        <div className="truncate">{n.name}</div>
                        <div className="truncate text-xs text-(--text-2) first-letter:uppercase">{labels.type(n)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      <div className="win-flyout-footer flex items-center justify-between px-8 py-3 max-sm:px-4">
        <button
          className="flex items-center gap-3 rounded-md px-3 py-1.5 hover:bg-(--hover)"
          title={t("profile")}
          onClick={() => {
            close();
            open("profile");
          }}
        >
          <UserAvatar size={32} />
          <span>Asadbek Kasymov</span>
        </button>
        <button
          className="win-btn-icon size-9!"
          aria-label={tl("power")}
          title={tl("power")}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setPower(power ? null : { x: r.right - 200, y: r.top - 128 });
          }}
        >
          <IconPower size={18} />
        </button>
      </div>

      {power && (
        <Menu
          x={power.x}
          y={power.y}
          onClose={() => setPower(null)}
          items={[
            { label: tl("lock"), icon: <IconLock />, onClick: onLock },
            { label: tl("shutdown"), icon: <IconPower />, onClick: onShutdown },
            { label: tl("restart"), icon: <IconReload />, onClick: onRestart },
          ]}
        />
      )}
    </motion.div>
  );
}
