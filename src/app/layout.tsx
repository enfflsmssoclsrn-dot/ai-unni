import type { Metadata } from "next";
import "./globals.css";
import { ScrollToTop } from "./scroll-to-top";

export const metadata: Metadata = {
  title: "AI언니 - 걔한테 너는 지금 몇 점일까",
  description: "썸·연애·재회·부부관계까지 대신 봐주는 연애 AI 💌 카톡·DM 캡처만 올리면 가트만 관계심리학 기반으로 호감도를 분석해줘",
  openGraph: {
    title: "AI언니 - 걔한테 너는 지금 몇 점일까",
    description: "썸·연애·재회·부부관계까지 대신 봐주는 연애 AI 💌 가트만 관계심리학 · 애착이론 기반",
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
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
