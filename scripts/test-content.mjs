import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import ts from "typescript";
const cache = new Map();
function load(file) {
  const path = resolve(file);
  if (cache.has(path)) return cache.get(path).exports;
  const module = { exports: {} };
  cache.set(path, module);
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  new Function("require", "module", "exports", code)(
    (id) =>
      load(
        (id.startsWith("@/") ? id.slice(2) : resolve(dirname(path), id)) +
          ".ts",
      ),
    module,
    module.exports,
  );
  return module.exports;
}
const { programmes } = load("content/programmes.ts");
const { courses } = load("content/courses.ts");
const { resources } = load("content/resources.ts");
const { offerings, searchCollections, courseResources } =
  load("lib/content.ts");
const { filterOfferings } = load("lib/search.ts");
const unique = (items, label) =>
  assert.equal(new Set(items).size, items.length, label + " must be unique");
unique(
  courses.map((c) => c.slug),
  "Subjects",
);
unique(
  programmes.map((p) => p.slug),
  "Programs",
);
unique(
  resources.map((r) => r.id),
  "Resources",
);
unique(
  offerings.map((o) => o.path),
  "Offering routes",
);
for (const p of programmes) {
  unique(
    p.semesters.map((s) => s.number),
    "Semesters",
  );
  for (const s of p.semesters) {
    assert(s.number >= 1 && s.number <= 8);
    unique(s.courseIds, "Semester subjects");
    for (const id of s.courseIds)
      assert(
        courses.some((c) => c.slug === id),
        "Missing subject: " + id,
      );
  }
}
const approved = JSON.parse(readFileSync("scripts/public-files.json", "utf8"));
for (const r of resources) {
  assert(
    searchCollections.some((o) => o.course.slug === r.subject),
    "Orphan resource: " + r.id,
  );
  assert(r.fileUrl || r.externalUrl, "Missing target: " + r.id);
  assert(!(r.fileUrl && r.externalUrl), "Ambiguous target: " + r.id);
  if (r.externalUrl) assert.equal(new URL(r.externalUrl).protocol, "https:");
  if (r.fileUrl?.startsWith("/resources/")) {
    assert(approved.includes(r.fileUrl), "File must be reviewed: " + r.fileUrl);
    assert(existsSync("public" + r.fileUrl), "Missing file: " + r.fileUrl);
  }
  if (r.unit)
    assert(
      courses
        .find((c) => c.slug === r.subject)
        ?.units.some((u) => u.id === r.unit),
      "Unknown topic",
    );
  for (const p of r.programs || [])
    assert(
      programmes.some((x) => x.slug === p),
      "Unknown program",
    );
}
for (const path of approved)
  assert(
    resources.some((r) => r.fileUrl === path && r.status === "published"),
    "Unlisted approved file",
  );
const blank = { query: "", program: "", semester: "", subject: "", type: "" };
const search = (f) => filterOfferings(searchCollections, { ...blank, ...f });
assert.equal(search({}).length, searchCollections.length);
assert(
  search({ query: "  POINTERS  " }).some(
    (o) => o.course.slug === "c-programming",
  ),
);
assert(
  search({ query: "code generation" }).some(
    (o) => o.course.slug === "compiler-design",
  ),
);
assert.equal(search({ program: "bca", semester: "2", type: "Lab" }).length, 1);
assert.equal(
  search({ program: "bsc-csit", type: "Lab" }).length,
  0,
  "BCA handout must not leak into unrelated collections",
);
assert.equal(search({ query: "nonexistent-xyz" }).length, 0);
assert.equal(
  search({ type: "Slides" }).length,
  0,
  "Do not invent slide resources",
);
assert.equal(
  search({ query: "discrete" }).length,
  1,
  "Supplementary collection must be searchable",
);
assert(
  search({ subject: "compiler-design" }).every(
    (o) => o.course.slug === "compiler-design",
  ),
);
assert.equal(
  courseResources("c-programming", "bca", 2).filter((r) => r.type === "Lab")
    .length,
  1,
);
console.log(
  "Content integrity and search checks passed: " +
    offerings.length +
    " program subject pages, " +
    resources.filter((r) => r.status === "published").length +
    " published resources, " +
    approved.length +
    " reviewed public document.",
);
