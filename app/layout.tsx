import type { Metadata } from "next";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RUSHING",
    template: "%s · RUSHING",
  },
  description: "RUSHING — 博客与知识卡片",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
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
