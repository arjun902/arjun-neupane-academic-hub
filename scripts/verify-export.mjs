import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const outputRoot = join(process.cwd(), "out");
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_PAGES === "true" ? "/arjun-neupane-academic-hub" : "");

if (!existsSync(outputRoot)) {
  console.error("Export verification failed: out/ does not exist.");
  process.exit(1);
}

function filesWithin(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesWithin(path) : [path];
  });
}

const htmlFiles = filesWithin(outputRoot).filter((file) => file.endsWith(".html"));
const refs = new Set();
const failures = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (html.includes('href="#"')) failures.push(`${relative(outputRoot, file)} contains href="#"`);
  if (html.includes("[ADD ")) failures.push(`${relative(outputRoot, file)} contains an unfinished placeholder`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) refs.add(match[1]);
}

// A locally inspected GitHub Pages export may no longer have the build-time
// environment variables that created it. Infer the prefix from Next assets so
// the same verification command remains reproducible after the build.
const inferredBasePath = [...refs]
  .map((ref) => ref.match(/^(.*)\/_next\//)?.[1])
  .find((prefix) => prefix !== undefined);
const basePath = configuredBasePath || inferredBasePath || "";

for (const ref of refs) {
  if (!ref.startsWith("/") || (basePath && !ref.startsWith(basePath))) continue;
  const withoutBase = basePath ? ref.slice(basePath.length) : ref;
  const clean = decodeURIComponent(withoutBase.split(/[?#]/, 1)[0]).replace(/^\/+/, "");
  const candidates = clean
    ? extname(clean)
      ? [join(outputRoot, clean)]
      : [join(outputRoot, clean, "index.html"), join(outputRoot, `${clean}.html`)]
    : [join(outputRoot, "index.html")];
  if (!candidates.some(existsSync)) failures.push(`Missing export target for ${ref}`);
}

if (failures.length) {
  console.error(`Export verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML files and ${refs.size} unique links/assets.`);
