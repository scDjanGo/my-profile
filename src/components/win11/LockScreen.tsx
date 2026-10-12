"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useClock } from "./hooks";
import { IconBatteryLevel, IconChevronRight, IconPower, IconReload, IconWifi, IconWifiOff, WinLogo, WinSpinner, UserAvatar } from "./icons";
import { useAppLocale, useSwitchLocale } from "./i18n";
import { isOnline, useBattery, useSystem } from "./system";
import Menu from "./Menu";

export default function LockScreen({ onUnlock, onShutdown, onRestart }: { onUnlock: () => void; onShutdown: () => void; onRestart: () => void }) {
  const t = useTranslations("lock");
  const now = useClock();
  const locale = useAppLocale();
  const { switchTo } = useSwitchLocale();
  const sys = useSystem();
  const battery = useBattery();
  const [stage, setStage] = useState<"lock" | "login" | "welcome">("lock");
  const [power, setPower] = useState<{ x: number; y: number } | null>(null);

  const signIn = () => {
    setStage("welcome");
    setTimeout(onUnlock, 900);
  };

  // Any key wakes the lock screen; Enter signs in, like on a PC without a password
  useEffect(() => {
    if (stage === "welcome") return;
    const onKey = (e: KeyboardEvent) => {
      if (stage === "lock") setStage("login");
      else if (e.key === "Enter" && !(e.target as HTMLElement).closest("button")) {
        setStage("welcome");
        setTimeout(onUnlock, 900);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, onUnlock]);

  const status = (
    <span className="flex items-center gap-3">
      {isOnline(sys) ? <IconWifi size={18} aria-label={t("network")} /> : <IconWifiOff size={18} />}
      <IconBatteryLevel size={18} level={battery.level} charging={battery.charging} aria-label={t("battery", { level: battery.level })} />
    </span>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[10000] cursor-default select-none overflow-hidden text-white"
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      onClick={() => stage === "lock" && setStage("login")}
      role="dialog"
      aria-label={t("hint")}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          backdropFilter: stage === "lock" ? "blur(0px)" : "blur(36px)",
          backgroundColor: stage === "lock" ? "rgba(0,0,0,.08)" : "rgba(0,0,0,.32)",
        }}
        transition={{ duration: 0.35 }}
      />

      <AnimatePresence mode="wait">
        {stage === "lock" && (
          <motion.div
            key="lock"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -80, transition: { duration: 0.25 } }}
          >
            <div className="absolute inset-x-0 top-[11vh] flex flex-col items-center [text-shadow:0_2px_12px_rgba(0,0,0,.25)]">
              <div className="win-display text-[min(24vw,120px)] font-semibold leading-none" suppressHydrationWarning>
                {now ? now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : " "}
              </div>
              <div className="win-display mt-2 text-[22px] font-semibold first-letter:uppercase" suppressHydrationWarning>
                {now ? now.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" }) : " "}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-10 text-center text-sm opacity-85">{t("hint")}</div>
            <div className="absolute bottom-6 right-6">{status}</div>
          </motion.div>
        )}

        {stage === "login" && (
          <motion.div key="login" className="absolute inset-0" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <UserAvatar size={192} />
              <div className="win-display text-[28px] font-semibold">Asadbek Kasymov</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  signIn();
                }}
                className="win-login-btn mt-2 flex items-center gap-2"
              >
                {t("signIn")} <IconChevronRight size={12} />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-md bg-white/15 px-3 py-2 backdrop-blur-sm max-sm:hidden">
              <UserAvatar size={32} />
              <span className="text-sm">Asadbek Kasymov</span>
            </div>

            <div className="absolute bottom-5 right-5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                className="win-lock-btn text-xs font-semibold"
                aria-label={t("language")}
                title={t("language")}
                onClick={() => switchTo(locale === "ru" ? "en" : "ru")}
              >
                {locale === "ru" ? "РУС" : "ENG"}
              </button>
              <span className="win-lock-btn pointer-events-none" title={t("network")}>
                {isOnline(sys) ? <IconWifi size={18} /> : <IconWifiOff size={18} />}
              </span>
              <button
                className="win-lock-btn"
                aria-label={t("power")}
                title={t("power")}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setPower(power ? null : { x: r.right - 220, y: r.top - 92 });
                }}
              >
                <IconPower size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {stage === "welcome" && (
          <motion.div key="welcome" className="absolute inset-0 flex flex-col items-center justify-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <UserAvatar size={192} />
            <div className="flex items-center gap-4">
              <WinSpinner size={28} />
              <span className="win-display text-2xl">{t("welcome")}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {power && (
        <Menu
          x={power.x}
          y={power.y}
          onClose={() => setPower(null)}
          items={[
            { label: t("shutdown"), icon: <IconPower />, onClick: onShutdown },
            { label: t("restart"), icon: <IconReload />, onClick: onRestart },
          ]}
        />
      )}
    </motion.div>
  );
}

/** Black boot / shutdown screens with the Windows logo and dot spinner */
export function PowerScreen({ mode, onDone, onPowerOn }: { mode: "boot" | "shutdown" | "restart" | "off"; onDone: () => void; onPowerOn: () => void }) {
  const t = useTranslations("lock");

  useEffect(() => {
    if (mode === "off") return;
    const id = setTimeout(onDone, mode === "boot" ? 2200 : 1600);
    return () => clearTimeout(id);
  }, [mode, onDone]);

  if (mode === "off") {
    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black">
        <button className="flex flex-col items-center gap-3 rounded-lg p-6 text-sm text-white/50 hover:text-white/90" onClick={onPowerOn}>
          <IconPower size={44} strokeWidth={1} />
          {t("powerOn")}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center gap-16 bg-black text-white">
      {mode === "boot" ? (
        <>
          <WinLogo size={96} />
          <WinSpinner size={40} />
        </>
      ) : (
        <div className="flex items-center gap-5">
          <WinSpinner size={32} />
          <span className="win-display text-2xl">{mode === "restart" ? t("restarting") : t("shuttingDown")}</span>
        </div>
      )}
    </div>
  );
}
