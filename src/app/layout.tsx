import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asadbek's Portfolio",
  description:
    "Asadbek's portfolio showcasing projects in web development and software engineering.",
  keywords: [
    "portfolio",
    "web development",
    "projects",
    "React",
    "Next.js",
    "JavaScript",
    "TypeScript",
  ],
  icons: {
    icon: "/svg/logo.svg",
  },
  authors: [{ name: "Asadbek", url: "https://asadbek-kasymov.vercel.app/" }],
  openGraph: {
    title: "Asadbek's Portfolio",
    description:
      "Explore Asadbek's projects including web apps, e-commerce, and educational platforms.",
    url: "https://asadbek-kasymov.vercel.app/",
    siteName: "Asadbek Portfolio",
    images: [
      {
        url: "/img/me_3.png",
        width: 1200,
        height: 630,
        alt: "Asadbek Portfolio Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asadbek's Portfolio",
    description:
      "A showcase of projects by Asadbek in frontend and fullstack development.",
    images: ["/img/me_3.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-white`}>{children}</body>
    </html>
  );
}
