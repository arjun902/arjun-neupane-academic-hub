import type { MetadataRoute } from "next";
import { site } from "@/content/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/instructor-login/",
        base + "/admin/",
        base + "/instructor-login/",
      ],
    },
    sitemap: site.url + "/sitemap.xml",
  };
}
