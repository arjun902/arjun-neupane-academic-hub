import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://arjun902.github.io/arjun-neupane-academic-hub"
  ).replace(/\/$/, "");
  return ["", "/courses", "/about"].map((path) => ({
    url: base + path + "/",
    changeFrequency: "weekly",
    priority: path ? 0.7 : 1,
  }));
}
