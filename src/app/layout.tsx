import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";

const SITE = "https://asadbek-kasymov.vercel.app/";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const locale = await getLocale();
  return {
    metadataBase: new URL(SITE),
    title: t("title"),
    description: t("description"),
    keywords: ["portfolio", "web development", "projects", "React", "Next.js", "JavaScript", "TypeScript"],
    icons: { icon: "/svg/logo.svg" },
    authors: [{ name: "Asadbek", url: SITE }],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: SITE,
      siteName: t("title"),
      locale: locale === "ru" ? "ru_RU" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
    robots: { index: true, follow: true, nocache: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0c1b36",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
