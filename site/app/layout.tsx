import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "欧派AI灵感家｜需求洞察与全案推荐",
  description: "从匿名需求输入到视觉画像、案例推荐与模拟交付的本地演示系统。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
