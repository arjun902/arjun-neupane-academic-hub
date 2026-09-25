import type { SiteConfig } from "./types";
export const site: SiteConfig = {
  name: "Arjun Neupane",
  description:
    "Teaching resources, research interests and academic guidance for students of computer science and engineering.",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://arjun902.github.io/arjun-neupane-academic-hub"
  ).replace(/\/$/, ""),
  navigation: [
    ["Home", "/"],
    ["Profile", "/profile"],
    ["Teaching", "/teaching"],
    ["Research", "/research"],
    ["Publications", "/publications"],
    ["Students", "/students"],
    ["Activities", "/activities"],
    ["Contact", "/contact"],
  ],
};
export const asset = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
