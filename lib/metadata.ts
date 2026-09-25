import type { Metadata } from "next";
import { site } from "@/content/site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = `${site.url}${path === "/" ? "/" : path.replace(/\/$/, "") + "/"}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      type: "website",
      images: [`${site.url}/assets/arjun-neupane-profile.webp`],
    },
    twitter: { card: "summary", title, description },
  };
}
