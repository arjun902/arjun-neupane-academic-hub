import { existsSync } from "node:fs";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

// Do not print keys, responses, credentials, or detailed network errors.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const remote = process.argv.includes("--remote");
let failures = 0;
function check(ok, label, fix) {
  console.log(
    `${ok ? "PASS" : "TODO"} ${label}${!ok && fix ? ": " + fix : ""}`,
  );
  if (!ok) failures++;
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
let endpoint;
try {
  endpoint = new URL(url);
} catch {}
const validUrl =
  endpoint &&
  !endpoint.username &&
  !endpoint.password &&
  !endpoint.search &&
  !endpoint.hash &&
  endpoint.pathname === "/" &&
  (endpoint.protocol === "https:" ||
    (endpoint.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(endpoint.hostname)));
let publicKey = key.startsWith("sb_publishable_");
if (key.startsWith("eyJ")) {
  try {
    publicKey =
      JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString())
        .role === "anon";
  } catch {}
}
check(
  existsSync(".env.local"),
  ".env.local exists",
  "Copy .env.example to .env.local.",
);
check(
  Boolean(validUrl),
  "Supabase project URL",
  "Set NEXT_PUBLIC_SUPABASE_URL to the project URL from Connect.",
);
check(
  Boolean(key && publicKey),
  "Browser-safe Supabase key",
  "Set NEXT_PUBLIC_SUPABASE_ANON_KEY to a publishable key or legacy anon key, never a secret/service-role key.",
);
check(
  existsSync("supabase/migrations/202609190001_academic_hub.sql") &&
    existsSync("supabase/migrations/202609200001_course_password_access.sql") &&
    existsSync("supabase/seed.sql"),
  "Migration and seed files exist",
);
if (failures) {
  console.log(
    "\nConfiguration is incomplete. Follow docs/SETUP.md. Protected access stays closed.",
  );
  process.exit(2);
}
if (!remote) {
  console.log(
    "\nLocal configuration format is ready. Run npm run doctor -- --remote to check the project without changing it.",
  );
  process.exit(0);
}

const request = (input, init = {}) =>
  fetch(input, {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: request },
});
try {
  const courses = await client
    .from("hub_courses")
    .select("id")
    .eq("visible", true);
  check(
    !courses.error && courses.data?.length === 6,
    "Six initial public courses available",
    "Run the phase-one migration and seed in SQL Editor; review catalogue visibility.",
  );
  const protectedRows = await client
    .from("hub_resources")
    .select("id")
    .limit(1);
  check(
    [401, 403].includes(protectedRows.status) &&
      protectedRows.error?.code === "42501",
    "Anonymous protected-metadata request is denied",
    "Apply/review the migration grants and RLS before release.",
  );
  const settings = await request(new URL("/auth/v1/settings", url), {
    headers: { apikey: key },
  });
  const config = settings.ok ? await settings.json() : null;
  check(
    config?.disable_signup === true,
    "Public registration disabled",
    "Authentication settings: disable Allow new users to sign up.",
  );
  const edge = await request(new URL("/functions/v1/portal-admin", url), {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: "{}",
  });
  const edgeBody = await edge.json().catch(() => null);
  check(
    edge.status === 401 && edgeBody?.error === "Sign in required",
    "Admin function deployed and rejects anonymous requests",
    "Deploy portal-admin with its supplied config.toml.",
  );
  const courseEdge = await request(
    new URL("/functions/v1/course-access", url),
    {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "content",
        course_id: "bca-c-programming",
      }),
    },
  );
  const courseBody = await courseEdge.json().catch(() => null);
  check(
    courseEdge.status === 401 && courseBody?.code === "session_invalid",
    "Course gateway rejects requests without a course session",
    "Deploy course-access and apply the course-password migration.",
  );
  const secretTable = await client
    .from("hub_course_access_config")
    .select("course_id")
    .limit(1);
  check(
    [401, 403].includes(secretTable.status) &&
      secretTable.error?.code === "42501",
    "Course configuration is inaccessible to browser clients",
    "Apply the course-password migration grants and RLS.",
  );
} catch {
  check(
    false,
    "Project connection",
    "Check the URL/key, project availability and network connection; no data was changed.",
  );
}
console.log(
  "\nThese are read-only setup checks, not authenticated end-to-end verification. Admin provisioning, private Storage, CORS and student flows still need testing.",
);
process.exit(failures ? 1 : 0);
