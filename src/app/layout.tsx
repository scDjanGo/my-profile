import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crafting Digital Experiences: My Portfolio",
  description: "Explore a collection of projects showcasing my expertise in creating modern, functional, and visually appealing web solutions.",
  keywords: "asadbek-kasymov, asadbek kasymov, portfolio, касымов асадбек, асадбек касымов, Асадбек Касымов портфолио ",
  icons: {
    icon: "/svg/logo.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <canvas></canvas>
      </body>
    </html>
  );
}
