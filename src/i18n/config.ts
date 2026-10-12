export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Languages whose speakers usually read Russian better than English */
const RU_FRIENDLY = ["ru", "be", "kk", "ky", "uz", "tg"];

/** Picks a locale from an Accept-Language header, respecting q-weights */
export function negotiate(header: string | null): Locale {
  if (!header) return defaultLocale;
  const prefs = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of prefs) {
    if (lang === "en") return "en";
    if (RU_FRIENDLY.includes(lang)) return "ru";
  }
  return defaultLocale;
}

export const isLocale = (v: unknown): v is Locale => locales.includes(v as Locale);
