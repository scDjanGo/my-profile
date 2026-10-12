import { getTranslations } from "next-intl/server";
import Desktop from "@/components/win11/Desktop";
import ConsoleGreeting from "@/components/ConsoleGreeting";

export default async function Home() {
  const t = await getTranslations("meta");
  return (
    <main>
      <h1 className="sr-only">{t("h1")}</h1>
      <Desktop />
      <ConsoleGreeting />
    </main>
  );
}
