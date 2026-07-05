import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { POPULAR_SUBJECT_LINKS } from "@/lib/seo-keywords";

const staticEntries: {
  path: string;
  changefreq: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/tutors", changefreq: "daily", priority: 0.95 },
  { path: "/online-tutors", changefreq: "daily", priority: 0.9 },
  { path: "/home-tutors", changefreq: "daily", priority: 0.9 },
  { path: "/courses", changefreq: "daily", priority: 0.9 },
  { path: "/tutor-jobs", changefreq: "daily", priority: 0.85 },
  { path: "/teaching-jobs", changefreq: "daily", priority: 0.85 },
  { path: "/online-teaching", changefreq: "daily", priority: 0.85 },
  { path: "/home-teaching", changefreq: "daily", priority: 0.85 },
  { path: "/assignment-help", changefreq: "weekly", priority: 0.8 },
  { path: "/assignment-jobs", changefreq: "weekly", priority: 0.8 },
  { path: "/marketplace", changefreq: "hourly", priority: 0.9 },
  { path: "/workshops", changefreq: "weekly", priority: 0.75 },
  { path: "/post-requirement", changefreq: "monthly", priority: 0.7 },
  { path: "/accommodation", changefreq: "weekly", priority: 0.75 },
  { path: "/pricing", changefreq: "monthly", priority: 0.7 },
  { path: "/reviews", changefreq: "weekly", priority: 0.65 },
  { path: "/faq", changefreq: "monthly", priority: 0.6 },
  { path: "/about", changefreq: "monthly", priority: 0.6 },
  { path: "/contact", changefreq: "monthly", priority: 0.55 },
  { path: "/support", changefreq: "monthly", priority: 0.5 },
  { path: "/privacy", changefreq: "yearly", priority: 0.4 },
  { path: "/terms", changefreq: "yearly", priority: 0.4 },
  { path: "/refund", changefreq: "yearly", priority: 0.4 },
  { path: "/register", changefreq: "yearly", priority: 0.35 },
  { path: "/login", changefreq: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls = staticEntries.map((e) => ({
    url: `${SITE_URL}${e.path}`,
    changeFrequency: e.changefreq,
    priority: e.priority,
  }));

  const subjectUrls = POPULAR_SUBJECT_LINKS.map((item) => ({
    url: `${SITE_URL}/tutors?subject=${encodeURIComponent(item.subject)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...subjectUrls];
}
