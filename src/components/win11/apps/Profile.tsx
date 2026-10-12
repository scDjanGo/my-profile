"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tools } from "@/data/Tools";
import { CONTACTS, type IconKey } from "@/data/desktop";
import { PetProjects, PortfolioData } from "@/data/PorfolioData";
import { useWM, type WinState } from "../WindowManager";
import { AppIcon, IconChat, IconChevronRight, IconCode, IconCopy, IconDownload, IconExternal, IconSparkle, IconUser, UserAvatar } from "../icons";

const SECTIONS = [
  { id: "overview", Icon: IconUser },
  { id: "work", Icon: IconSparkle },
  { id: "skills", Icon: IconCode },
  { id: "contacts", Icon: IconChat },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const CONTACT_ROWS: { icon: IconKey; key: "email" | "whatsapp" | "telegram" | "linkedin" | "github"; value: string; href: string; copy?: string }[] = [
  { icon: "mail", key: "email", value: CONTACTS.email, href: `mailto:${CONTACTS.email}`, copy: CONTACTS.email },
  { icon: "whatsapp", key: "whatsapp", value: CONTACTS.phone, href: CONTACTS.whatsapp, copy: CONTACTS.phoneRaw },
  { icon: "telegram", key: "telegram", value: "@scDjanGo", href: CONTACTS.telegram, copy: "@scDjanGo" },
  { icon: "linkedin", key: "linkedin", value: "Asadbek Kasymov", href: CONTACTS.linkedin, copy: CONTACTS.linkedin },
  { icon: "github", key: "github", value: "github.com/scDjanGo", href: CONTACTS.github, copy: CONTACTS.github },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-md bg-(--card) ring-1 ring-(--divider) ${className}`}>{children}</div>;
}

function Overview({ go }: { go: (s: SectionId) => void }) {
  const { open } = useWM();
  const t = useTranslations("profile");
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-5 p-5 max-sm:flex-col max-sm:text-center">
        <UserAvatar size={112} />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">{t("name")}</h2>
          <p className="text-(--text-2)">{t("stack")}</p>
          <p className="mt-2 max-w-xl leading-relaxed">{t("intro")}</p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[
          { n: PortfolioData.length, l: t("statProjects") },
          { n: PetProjects.length, l: t("statPets") },
          { n: Tools.length, l: t("statTools") },
        ].map((s) => (
          <Card key={s.l} className="p-4 max-sm:p-3">
            <div className="text-3xl font-semibold text-(--accent-text) max-sm:text-2xl">{s.n}</div>
            <div className="text-(--text-2) max-sm:text-xs">{s.l}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-2 text-base font-semibold">{t("cvTitle")}</h3>
        <p className="leading-relaxed text-(--text-1)">{t("cvText")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/pdf/myResume.pdf" download className="win-btn win-btn-accent flex items-center gap-2">
            <IconDownload /> {t("downloadCv")}
          </a>
          <button className="win-btn" onClick={() => open("pdf")}>
            {t("viewResume")}
          </button>
          <button className="win-btn" onClick={() => open("explorer", { folder: "projects" })}>
            {t("browseProjects")}
          </button>
        </div>
      </Card>

      <div className="flex flex-col gap-1">
        {SECTIONS.slice(1).map((s) => (
          <button key={s.id} onClick={() => go(s.id)} className="win-row">
            <s.Icon size={18} />
            <span className="flex-1 text-left">{t(s.id)}</span>
            <IconChevronRight size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Work() {
  const t = useTranslations("profile");
  return (
    <div className="flex flex-col gap-3">
      <Card className="p-5">
        <p className="leading-relaxed">{t("workIntro")}</p>
      </Card>
      {(["workflow", "hobby", "interests"] as const).map((k) => (
        <Card key={k} className="border-l-4 border-l-(--accent) p-5">
          <h3 className="mb-1.5 text-base font-semibold">{t(`${k}Title`)}</h3>
          <p className="leading-relaxed text-(--text-1)">{t(`${k}Text`)}</p>
        </Card>
      ))}
    </div>
  );
}

function Skills() {
  const { open } = useWM();
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
      {Tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => open("browser", { url: `https://www.google.com/search?igu=1&q=${encodeURIComponent(tool.title)}` })}
          className="flex flex-col items-center gap-2 rounded-md bg-(--card) p-4 ring-1 ring-(--divider) transition hover:-translate-y-0.5 hover:ring-(--accent)"
        >
          <Image src={tool.img} alt="" width={44} height={44} className="size-11 object-contain" />
          <span className="text-xs">{tool.title}</span>
        </button>
      ))}
    </div>
  );
}

function Contacts() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1">
      {CONTACT_ROWS.map((c) => (
        <div key={c.key} className="win-row max-sm:flex-wrap">
          <AppIcon icon={c.icon} size={28} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span>{t(c.key)}</span>
            <span className="truncate text-xs text-(--text-2)">{c.value}</span>
          </div>
          {c.copy && (
            <button
              className="win-btn flex items-center gap-1.5"
              onClick={() => {
                navigator.clipboard?.writeText(c.copy!);
                setCopied(c.key);
              }}
            >
              <IconCopy /> {copied === c.key ? tc("copied") : tc("copy")}
            </button>
          )}
          <a className="win-btn flex items-center gap-1.5" href={c.href} target="_blank" rel="noreferrer">
            {tc("open")} <IconExternal size={12} />
          </a>
        </div>
      ))}
    </div>
  );
}

export default function Profile({ win }: { win: WinState }) {
  const t = useTranslations("profile");
  const [section, setSection] = useState<SectionId>((win.props.section as SectionId) ?? "overview");
  const [seenNonce, setSeenNonce] = useState(win.props.nonce);

  if (win.props.nonce !== seenNonce) {
    setSeenNonce(win.props.nonce);
    if (win.props.section) setSection(win.props.section as SectionId);
  }

  return (
    <div className="win-app flex h-full text-[13px] max-sm:flex-col">
      <aside className="flex w-64 shrink-0 flex-col gap-1 p-3 max-sm:w-full max-sm:flex-row max-sm:overflow-x-auto max-sm:p-2">
        <div className="mb-3 flex items-center gap-3 px-2 max-sm:hidden">
          <UserAvatar size={56} />
          <div className="min-w-0">
            <div className="font-semibold">{t("name")}</div>
            <div className="truncate text-xs text-(--text-2)">{t("role")}</div>
          </div>
        </div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`relative flex shrink-0 items-center gap-3 rounded px-3 py-2 text-left hover:bg-(--hover) ${
              section === s.id ? "bg-(--hover) font-medium" : ""
            }`}
          >
            {section === s.id && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-(--accent)" />}
            <s.Icon size={16} />
            {t(s.id)}
          </button>
        ))}
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-6 pb-6 pt-3 max-sm:px-3">
        <h1 className="mb-4 text-[28px] font-semibold max-sm:text-xl">{t(section)}</h1>
        {section === "overview" && <Overview go={setSection} />}
        {section === "work" && <Work />}
        {section === "skills" && <Skills />}
        {section === "contacts" && <Contacts />}
      </main>
    </div>
  );
}
