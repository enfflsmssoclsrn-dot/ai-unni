import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ScrollToTop } from "./scroll-to-top";

const GA_ID = "G-9FMVRBCF2R";

export const metadata: Metadata = {
  title: "AI 연애 상담 · 카톡 호감도 분석 | AI언니",
  description:
    "카톡 캡처만 올리면 AI가 호감도를 분석해줘. 썸남 호감 신호, 읽씹 심리, 애착 유형까지 가트만 관계심리학 기반 무료 연애 상담. 썸·연애·재회·부부관계 AI 분석.",
  keywords: [
    "AI 연애 상담",
    "카톡 호감도 분석",
    "썸남 호감 신호",
    "카톡 읽씹 심리",
    "애착 유형 테스트",
    "연애 상담 AI",
    "호감도 테스트",
    "카톡 분석",
    "연애 초기 매력",
    "AI언니",
  ],
  metadataBase: new URL("https://ai-unni.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI 연애 상담 · 카톡 호감도 분석 | AI언니",
    description:
      "카톡 캡처만 올리면 AI가 호감도를 분석해줘. 가트만 관계심리학 · 애착이론 기반 무료 연애 상담.",
    type: "website",
    url: "https://ai-unni.vercel.app",
    siteName: "AI언니",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 연애 상담 · 카톡 호감도 분석 | AI언니",
    description:
      "카톡 캡처만 올리면 AI가 호감도를 분석해줘. 무료 연애 상담 AI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "JfLST-kS5joOXpZ42_PwdlMwfcFwVfwW6TZ1jWcV0Is",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
      </head>
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
