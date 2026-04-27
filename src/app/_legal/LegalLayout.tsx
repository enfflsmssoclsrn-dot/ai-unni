// 법적 고지 페이지 공용 레이아웃 (이용약관 / 개인정보처리방침 / 환불정책 공용)
// Next.js app router 에서 언더스코어(_) prefix 폴더는 라우트로 노출되지 않음.
import Link from "next/link";
import { ReactNode } from "react";

export default function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string; // 시행일(YYYY-MM-DD)
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-bg px-4 pb-16 pt-5">
      <div className="mx-auto max-w-[720px]">
        {/* 상단 네비 */}
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-ink hover:underline"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
            AI 냥이 홈으로
          </Link>
        </div>

        {/* Eyebrow */}
        <div className="mb-2 font-mono text-[10px] font-semibold tracking-[0.3em] text-sub">
          — LEGAL · NO.LG —
        </div>

        {/* 제목 */}
        <h1
          className="mb-1 text-[28px] font-medium tracking-[-0.02em] text-ink md:text-[32px]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h1>
        <p
          className="mb-7 text-[12px] italic text-sub"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          시행일: {updatedAt}
        </p>

        {/* 본문 카드 */}
        <article
          className="p-5 text-[14px] leading-[1.8] text-ink md:p-7"
          style={{
            background: "#FAF6EC",
            border: "1px solid var(--color-line)",
          }}
        >
          {children}
        </article>

        {/* 하단 링크 모음 */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] text-sub">
          <Link href="/terms" className="font-medium text-ink hover:underline">
            이용약관
          </Link>
          <span className="text-sub/40">·</span>
          <Link href="/privacy" className="font-medium text-ink hover:underline">
            개인정보처리방침
          </Link>
          <span className="text-sub/40">·</span>
          <Link href="/refund" className="font-medium text-ink hover:underline">
            환불정책
          </Link>
        </div>
      </div>
    </main>
  );
}
