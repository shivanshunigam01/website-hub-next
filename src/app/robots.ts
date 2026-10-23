import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

/** Paths that must not be indexed (dashboards, auth flows, account data). */
const DISALLOW = [
  "/admin",
  "/staff-console",
  "/student",
  "/teacher",
  "/parent",
  "/lms",
  "/payments",
  "/messages",
  "/my-posts",
  "/profile",
  "/role-select",
  "/verify-email",
  "/offline",
  "/forgot-password",
  "/reset-password",
  "/login",
  "/register",
  "/marketing",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
