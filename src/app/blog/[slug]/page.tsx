import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "../posts";

// ─── 정적 경로 생성 (SSG) ───
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

// ─── 동적 메타데이터 ───
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | AI언니`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div style={{ background: "#FFF5F7", minHeight: "100vh" }}>
      <div className="max-w-[600px] mx-auto px-4 py-10">
        <Link
          href="/blog"
          className="inline-block mb-6 text-[13px] font-bold"
          style={{ color: "#FF6B8A" }}
        >
          ← 블로그 목록
        </Link>

        <article>
          <div
            className="text-[11px] font-bold mb-2"
            style={{ color: "#FF6B8A" }}
          >
            {post.date}
          </div>
          <h1
            className="text-[20px] font-extrabold mb-6 leading-[1.4]"
            style={{ color: "#2D2B3D" }}
          >
            {post.title}
          </h1>

          <div
            className="bg-white rounded-[16px] p-6 border border-[#FFD6E0] blog-content"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-full text-white text-[14px] font-bold"
              style={{
                background: "linear-gradient(135deg, #FF6B8A, #E8456A)",
              }}
            >
              무료로 카톡 분석해보기
            </Link>
          </div>
        </article>
      </div>

      <style>{`
        .blog-content h2 {
          font-size: 16px;
          font-weight: 700;
          color: #2D2B3D;
          margin: 24px 0 8px;
          line-height: 1.4;
        }
        .blog-content h2:first-child {
          margin-top: 0;
        }
        .blog-content p {
          font-size: 14px;
          color: #4A4660;
          line-height: 1.75;
          margin: 0 0 12px;
        }
        .blog-content strong {
          color: #E8456A;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
