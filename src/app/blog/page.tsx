import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "./posts";

export const metadata: Metadata = {
  title: "연애 상담 블로그 | AI 냥이",
  description:
    "카톡 호감 신호, 읽씹 심리, 연애 초기 전략까지 — 관계심리학 기반 연애 꿀팁 블로그.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <div style={{ background: "#FFF5F7", minHeight: "100vh" }}>
      <div className="max-w-[600px] mx-auto px-4 py-10">
        {/* 헤더 */}
        <Link
          href="/"
          className="inline-block mb-6 text-[13px] font-bold"
          style={{ color: "#FF6B8A" }}
        >
          ← AI 냥이 홈으로
        </Link>
        <h1
          className="text-[22px] font-extrabold mb-2"
          style={{ color: "#2D2B3D" }}
        >
          연애 상담 블로그
        </h1>
        <p className="text-[13px] mb-8" style={{ color: "#8E8A9D" }}>
          관계심리학 기반 연애 꿀팁
        </p>

        {/* 글 목록 */}
        <div className="space-y-4">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-[16px] p-5 border border-[#FFD6E0] hover:shadow-md transition-shadow"
            >
              <div
                className="text-[11px] font-bold mb-1"
                style={{ color: "#FF6B8A" }}
              >
                {post.date}
              </div>
              <h2
                className="text-[16px] font-bold mb-1.5 leading-[1.4]"
                style={{ color: "#2D2B3D" }}
              >
                {post.title}
              </h2>
              <p
                className="text-[13px] leading-[1.5]"
                style={{ color: "#8E8A9D" }}
              >
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
