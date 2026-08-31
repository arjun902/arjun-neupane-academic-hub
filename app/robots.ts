import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://arjunneupane.edu.np").replace(/\/$/, "");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/student/", "/grading/", "/login/", ...["admin", "student", "grading", "login"].map((route) => `${basePath}/${route}/`)]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
