"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { FsNode } from "@/data/desktop";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

export function useAppLocale() {
  return useLocale() as Locale;
}

/** Remembers the choice in a cookie and re-renders the server tree in the new language */
export function useSwitchLocale() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const switchTo = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  };
  return { switchTo, pending };
}

/** Localized name / type label for a virtual file system node */
export function useFsLabels() {
  const tFs = useTranslations("fs");
  const tTypes = useTranslations("types");
  const locale = useAppLocale();
  return {
    name: (n: FsNode) => (tFs.has(n.id) ? tFs(n.id) : n.name),
    type: (n: FsNode) => {
      if (n.kind === "folder") return tTypes("folder");
      if (n.project) return n.project.tag[locale];
      return n.type ? tTypes(n.type) : "";
    },
  };
}
