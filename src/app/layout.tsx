import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI언니 - 연애 조언 AI",
  description: "썸, 연애, 재회까지 대신 봐주는 연애 조언 AI 💌 카톡 캡쳐만 올리면 호감도를 분석해드려요",
  openGraph: {
    title: "AI언니 - 걔가 널 좋아하는지 AI한테 물어봐",
    description: "썸, 연애, 재회까지 대신 봐주는 연애 조언 AI 💌",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
