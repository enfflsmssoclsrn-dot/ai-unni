import type { MetadataRoute } from "next";
import { POSTS } from "./blog/posts";

const BASE = "https://ai-unni.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries = POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogEntries,
    {
      url: `${BASE}/privacy`,
      lastModified: "2026-04-10",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: "2026-04-10",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
