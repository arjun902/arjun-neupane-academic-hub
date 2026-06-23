import type { MetadataRoute } from "next";
import { subjects } from "@/lib/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arjunneupane.edu.np";
  const routes = [
    "",
    "/about",
    "/subjects",
    "/materials",
    "/grading",
    "/notices",
    "/research",
    "/workshops",
    "/blog",
    "/contact",
    "/login",
    "/admin",
    "/student",
    ...subjects.map((subject) => `/subjects/${subject.slug}`)
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-06-23"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
