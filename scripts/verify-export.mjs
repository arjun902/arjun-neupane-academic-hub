import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const outputRoot = join(process.cwd(), "out");
const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ||
  (process.env.GITHUB_PAGES === "true" ? "/arjun-neupane-academic-hub" : "");

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

const outputFiles = filesWithin(outputRoot);
const htmlFiles = outputFiles.filter((file) => file.endsWith(".html"));
const refs = new Set();
const failures = [];
const publicResourceRoot = join(process.cwd(), "public", "resources");
const publicResourceFiles = existsSync(publicResourceRoot)
  ? filesWithin(publicResourceRoot).filter((file) => file.endsWith(".pdf"))
  : [];

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (html.includes('href="#"'))
    failures.push(`${relative(outputRoot, file)} contains href="#"`);
  if (html.includes("[ADD "))
    failures.push(
      `${relative(outputRoot, file)} contains an unfinished placeholder`,
    );
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g))
    refs.add(match[1]);
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
  const clean = decodeURIComponent(withoutBase.split(/[?#]/, 1)[0]).replace(
    /^\/+/,
    "",
  );
  const candidates = clean
    ? extname(clean)
      ? [join(outputRoot, clean)]
      : [
          join(outputRoot, clean, "index.html"),
          join(outputRoot, `${clean}.html`),
        ]
    : [join(outputRoot, "index.html")];
  if (!candidates.some(existsSync))
    failures.push(`Missing export target for ${ref}`);
}

for (const file of outputFiles) {
  const rel = relative(outputRoot, file).replaceAll("\\", "/");
  if (
    /\.(pdf|zip|docx?|pptx?|map)$/i.test(file) ||
    /(^|\/)(resources|private-migration|legacy-source)\//.test(rel)
  )
    failures.push(`Protected file or source map in export: ${rel}`);
  if (/\.(js|html|json|txt)$/.test(file)) {
    const body = readFileSync(file, "utf8");
    if (
      /\/resources\/bca|file-handling-questions-with-solutions\.pdf|SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'][^"']{15}|sb_secret_[A-Za-z0-9_-]+|\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[0-9a-f]{64}/.test(
        body,
      )
    )
      failures.push(`Private path or secret marker in export: ${rel}`);
    for (const token of body.match(
      /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    ) || []) {
      try {
        if (
          JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString())
            .role === "service_role"
        )
          failures.push(`Service-role JWT in export: ${rel}`);
      } catch {}
    }
  }
}
if (publicResourceFiles.length)
  failures.push("Teaching PDFs must not be stored in public/resources");
for (const route of [
  "",
  "courses",
  "login",
  "student",
  "admin",
  "instructor-login",
  ...[
    "bca-digital-logic",
    "bca-c-programming",
    "csit-compiler-design",
    "csit-cryptography",
    "csit-discrete-mathematics",
    "csit-numerical-methods",
  ].map((c) => "courses/" + c),
])
  if (!existsSync(join(outputRoot, route, "index.html")))
    failures.push(`Missing refresh-safe route: ${route}`);

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (
    /Receive your individual login|Sign in to find the courses assigned|Student Login/.test(
      html,
    )
  )
    failures.push(
      `Outdated student access instructions: ${relative(outputRoot, file)}`,
    );
}

if (failures.length) {
  console.error(`Export verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Verified ${htmlFiles.length} HTML files, ${refs.size} unique links/assets, refresh-safe portal routes, and no protected files/source maps or detected secret values in the export.`,
);
