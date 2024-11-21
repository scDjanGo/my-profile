import { transform } from "next/dist/build/swc/generated-native";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scroll: {
          "0": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" }
        }
      },
      animation: {
        scroll: "scroll 30s linear infinite"
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    screens: {
      1560: { "max": "1560px" },
      1490: { "max": "1490px" },
      1440: { "max": "1440px" },
      1280: { "max": "1280px" },
      1240: { "max": "1240px" },
      1040: { "max": "1040px" },
      995: { "max": "995px" },
      895: { "max": "895px" },
      795: { "max": "795px" },
      695: { "max": "695px" },
      595: { "max": "595px" },
      580: { "max": "580px" },
      495: { "max": "495px" },
      400: { "max": "400px" },
    },
  },
  plugins: [],
} satisfies Config;
