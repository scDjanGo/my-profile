"use client";

import BlueScreen, { failureText, toStopCode, type BlueScreenText } from "@/components/BlueScreen";
import "./globals.css";

// Replaces the root layout, so translations aren't available here
const TEXT: Record<"en" | "ru", BlueScreenText> = {
  en: {
    title: "Your device ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.",
    progress: (n) => `${n}% complete`,
    moreInfo: "For more information about this issue and possible fixes, visit",
    support: "If you call a support person, give them this info:",
    stopCodeLabel: "Stop code",
    whatFailedLabel: "What failed",
    action: "Restart now",
  },
  ru: {
    title: "На вашем устройстве возникла проблема, и его необходимо перезагрузить. Мы лишь собираем некоторые сведения об ошибке, а затем будет автоматически выполнена перезагрузка.",
    progress: (n) => `${n}% завершено`,
    moreInfo: "Дополнительные сведения об этой проблеме и возможных способах её решения см. на странице",
    support: "При обращении в службу поддержки предоставьте следующие сведения:",
    stopCodeLabel: "Код остановки",
    whatFailedLabel: "Что вызвало проблему",
    action: "Перезагрузить сейчас",
  },
};

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const lang = typeof navigator !== "undefined" && /^(ru|be|kk|ky|uz|tg)/i.test(navigator.language) ? "ru" : "en";
  return (
    <html lang={lang}>
      <body>
        <BlueScreen
          face=":("
          text={TEXT[lang]}
          link="https://github.com/scDjanGo"
          stopCode={toStopCode(error)}
          whatFailed={failureText(error)}
          onDone={reset}
        />
      </body>
    </html>
  );
}
