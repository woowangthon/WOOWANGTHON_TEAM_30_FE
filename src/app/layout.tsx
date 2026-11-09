import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { WakeBanner } from "@/components/WakeBanner";
import { TextSizeInit } from "@/components/TextSizeInit";

export const metadata: Metadata = {
  title: "여운 — 그 사람의 실제 목소리로 남기는 추억",
  description: "소중한 사람의 실제 녹음을 모아 두고, 말을 걸면 그 사람이 실제로 했던 말을 찾아 들려드려요.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf7f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh antialiased">
        <TextSizeInit />
        <WakeBanner />
        {children}
      </body>
    </html>
  );
}
