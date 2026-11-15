import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { Gowun_Batang } from "next/font/google";
import { WakeBanner } from "@/components/WakeBanner";
import { TextSizeInit } from "@/components/TextSizeInit";

// 제목용 부드러운 바탕체. 한글 글리프가 커서 미리 불러오지 않는다.
const gowun = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], preload: false, display: "swap", variable: "--font-gowun" });

export const metadata: Metadata = {
  title: "여운 — 그 사람의 실제 목소리로 남기는 추억",
  description: "소중한 사람의 실제 녹음을 모아 두고, 메시지를 보내면 녹음에 있는 말은 그대로 들려 드리고 없는 말은 ‘AI가 만든 말’로 표시해 답해요.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9f6f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={gowun.variable}>
      <body className="min-h-dvh antialiased">
        <TextSizeInit />
        <WakeBanner />
        {children}
      </body>
    </html>
  );
}
