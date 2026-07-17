import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "欧派AI灵感家｜视觉偏好选择器",
  description: "基于视觉选择实时理解客户需求，形成可落地的家居偏好画像。",
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
