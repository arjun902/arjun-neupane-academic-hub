import type { MetadataRoute } from "next";
import { academicPrograms, allOfferings } from "@/lib/academics";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://arjunneupane.edu.np").replace(/\/$/, "");
  const routes = [
    "",
    "/about",
    "/subjects",
    "/notices",
    "/research",
    "/workshops",
    "/blog",
    "/contact",
    ...academicPrograms.map((program) => `/subjects/${program.slug}`),
    ...allOfferings.map((offering) => offering.route)
  ];

  return routes.map((route) => ({
    url: route ? `${siteUrl}${route}/` : `${siteUrl}/`,
    lastModified: new Date("2026-08-31"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
