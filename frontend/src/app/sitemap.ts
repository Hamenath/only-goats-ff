import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://onlygoats-ff.com";
  const pages = [
    { url: "/", priority: 1.0 },
    { url: "/tournament", priority: 0.9 },
    { url: "/register", priority: 0.9 },
    { url: "/leaderboard", priority: 0.8 },
    { url: "/rules", priority: 0.8 },
    { url: "/schedule", priority: 0.8 },
    { url: "/prize-pool", priority: 0.8 },
    { url: "/gallery", priority: 0.6 },
    { url: "/faq", priority: 0.7 },
    { url: "/contact", priority: 0.6 },
  ];

  return pages.map(({ url, priority }) => ({
    url: `${baseUrl}${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));
}
