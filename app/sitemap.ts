import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { programmes } from "@/content/programmes";
import { offerings } from "@/lib/content";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...site.navigation.map((n) => n[1]),
    "/resources",
    "/notices",
    "/teaching/discrete-mathematics",
    ...programmes.flatMap((p) => [
      "/subjects/" + p.slug,
      ...p.semesters.map(
        (s) => "/subjects/" + p.slug + "/semester-" + s.number,
      ),
    ]),
    ...offerings.map((o) => o.path),
  ];
  return paths.map((p) => ({
    url: site.url + (p === "/" ? "/" : p + "/"),
    changeFrequency: "monthly",
    priority: p === "/" ? 1 : 0.7,
  }));
}
