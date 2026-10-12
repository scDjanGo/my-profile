"use client";

import { useTranslations } from "next-intl";
import { IconDownload, IconExternal } from "../icons";

const SRC = "/pdf/myResume.pdf";

export default function PdfViewer() {
  const t = useTranslations("pdf");
  return (
    <div className="win-app flex h-full flex-col text-[13px]">
      <div className="flex shrink-0 items-center gap-2 border-b border-(--divider) px-3 py-1.5">
        <span className="mr-auto font-medium">Resume.pdf</span>
        <a href={SRC} download className="win-btn flex items-center gap-1.5">
          <IconDownload /> {t("download")}
        </a>
        <a href={SRC} target="_blank" rel="noreferrer" className="win-btn flex items-center gap-1.5 max-sm:hidden">
          {t("open")} <IconExternal size={12} />
        </a>
      </div>
      <iframe src={SRC} title="Resume" className="min-h-0 flex-1 border-0 bg-[#525659]" />
    </div>
  );
}
