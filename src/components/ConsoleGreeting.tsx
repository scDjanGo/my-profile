"use client";

import { useEffect } from "react";

let greeted = false;

/** A small easter egg for whoever opens DevTools */
export default function ConsoleGreeting() {
  useEffect(() => {
    if (greeted) return;
    greeted = true;
    const font = "font-family: 'Segoe UI', Selawik, system-ui, sans-serif;";
    console.log(
      "%cHello, world ;)",
      `${font} font-size: 44px; font-weight: 700; color: #fff; padding: 14px 30px; border-radius: 14px;
       background: linear-gradient(135deg, #0067c0 0%, #4cc2ff 55%, #a37bff 100%);
       text-shadow: 0 2px 10px rgba(0, 0, 0, .35);`,
    );
    console.log(
      "%cSo you like to look under the hood? Me too.%c\n\nBuilt with Next.js, React, three.js & a lot of Windows nostalgia.\nGitHub: https://github.com/scDjanGo · Telegram: @scDjanGo",
      `${font} font-size: 16px; font-weight: 600; color: #4cc2ff;`,
      `${font} font-size: 13px; color: #8a96a8; line-height: 1.6;`,
    );
    console.log(
      "%cPsst… visit /bsod to see what happens when things go really wrong.",
      `${font} font-size: 12px; color: #fff; background: #0078d7; padding: 4px 10px; border-radius: 6px;`,
    );
  }, []);
  return null;
}
