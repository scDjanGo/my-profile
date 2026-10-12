"use client";

import { useTranslations } from "next-intl";
import type { BlueScreenText } from "./BlueScreen";

export function useBlueScreenText(kind: "crash" | "notFound"): BlueScreenText {
  const t = useTranslations("bsod");
  return {
    title: t(kind === "crash" ? "crashTitle" : "notFoundTitle"),
    progress: (percent) => t("progress", { percent }),
    moreInfo: t("moreInfo"),
    support: t("support"),
    stopCodeLabel: t("stopCode"),
    whatFailedLabel: t("whatFailed"),
    action: t(kind === "crash" ? "restart" : "home"),
  };
}
