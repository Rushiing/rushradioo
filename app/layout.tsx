import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import "./globals.css";

const sans = Noto_Sans_SC({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Noto_Serif_SC({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "个人门户",
    template: "%s · 个人门户",
  },
  description: "关于我、博客与知识卡片",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans">
        <SiteNav />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:px-6 md:pt-14">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
