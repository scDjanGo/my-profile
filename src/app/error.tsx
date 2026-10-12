"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import BlueScreen, { failureText, toStopCode } from "@/components/BlueScreen";
import { useBlueScreenText } from "@/components/BlueScreenText";

/** Any crash inside the desktop ends in a blue screen, then a "restart" re-renders the UI */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const text = useBlueScreenText("crash");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <BlueScreen
      face=":("
      text={text}
      link="https://github.com/scDjanGo"
      stopCode={toStopCode(error)}
      whatFailed={error.digest ? `${failureText(error)} (${error.digest})` : failureText(error)}
      // the /bsod demo page would just crash again, so restart onto the desktop
      onDone={() => (pathname === "/bsod" ? router.replace("/") : reset())}
    />
  );
}
