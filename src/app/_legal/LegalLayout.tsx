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
    <main
      className="min-h-screen px-4 pt-5 pb-16"
      style={{ background: "linear-gradient(180deg, #FFF0F3 0%, #FFF5F7 30%, #FFFFFF 100%)" }}>
      <div className="max-w-[720px] mx-auto">
        {/* 상단 네비 */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-[13px] text-[#FF6B8A] font-semibold hover:underline">
            ← AI 냥이 홈으로
          </Link>
        </div>

        {/* 제목 */}
        <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#2D2B3D] tracking-tight mb-1">
          {title}
        </h1>
        <p className="text-[12px] text-[#8E8A9D] mb-6">시행일: {updatedAt}</p>

        {/* 본문 카드 */}
        <article
          className="rounded-[18px] bg-white p-5 md:p-7 text-[14px] leading-[1.8] text-[#2D2B3D]"
          style={{
            border: "1px solid #FFD6E0",
            boxShadow: "0 2px 14px rgba(255,107,138,0.06)",
          }}>
          {children}
        </article>

        {/* 하단 링크 모음 */}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-[#6E6A80] justify-center">
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <span className="text-[#D8D4E0]">·</span>
          <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
          <span className="text-[#D8D4E0]">·</span>
          <Link href="/refund" className="hover:underline">환불정책</Link>
        </div>
      </div>
    </main>
  );
}
