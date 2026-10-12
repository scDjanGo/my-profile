"use client";

import { usePathname, useRouter } from "next/navigation";
import BlueScreen from "./BlueScreen";
import { useBlueScreenText } from "./BlueScreenText";

export default function NotFoundScreen() {
  const text = useBlueScreenText("notFound");
  const pathname = usePathname();
  const router = useRouter();
  return (
    <BlueScreen
      face="404"
      text={text}
      link="https://asadbek-kasymov.vercel.app"
      stopCode="PAGE_NOT_FOUND"
      whatFailed={pathname}
      onDone={() => router.replace("/")}
    />
  );
}
