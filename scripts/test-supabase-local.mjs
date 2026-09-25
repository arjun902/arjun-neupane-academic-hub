#!/usr/bin/env node
// Real local Supabase Auth, Edge, REST and Storage integration.
// Never reads .env.local, accepts cloud endpoints, logs secrets or sends emails.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
const help = `Run only against a PRISTINE DISPOSABLE local Supabase stack.
Apply both migrations and seed, serve portal-admin and course-access.
Set in the environment or ignored .env.supabase-test.local:
SUPABASE_TEST_URL=http://127.0.0.1:54321
SUPABASE_TEST_ANON_KEY=<local public key>
SUPABASE_TEST_SERVICE_ROLE_KEY=<local service key>
SUPABASE_TEST_DISPOSABLE=YES
No real data, configured course passwords or active sessions may exist.
The script creates synthetic admin/files, tests access, and removes its fixtures.
Exit 2 = setup blocked; 1 = failure; 0 = tests and cleanup passed.`;
if (process.argv.includes("--help")) {
  console.log(help);
  process.exit(0);
}
const cfg = {};
try {
  const content = await readFile(
    new URL("../.env.supabase-test.local", import.meta.url),
    "utf8",
  );
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*(SUPABASE_TEST_[A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) cfg[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch (e) {
  if (e.code !== "ENOENT") {
    console.error("BLOCKED: Cannot read local test configuration.");
    process.exit(2);
  }
}
for (const key of [
  "SUPABASE_TEST_URL",
  "SUPABASE_TEST_ANON_KEY",
  "SUPABASE_TEST_SERVICE_ROLE_KEY",
  "SUPABASE_TEST_DISPOSABLE",
])
  if (process.env[key]) cfg[key] = process.env[key];
let endpoint;
try {
  endpoint = new URL(cfg.SUPABASE_TEST_URL);
} catch {}
if (
  !endpoint ||
  !["localhost", "127.0.0.1"].includes(endpoint.hostname) ||
  !["http:", "https:"].includes(endpoint.protocol) ||
  endpoint.pathname !== "/" ||
  endpoint.username ||
  endpoint.password ||
  endpoint.search ||
  endpoint.hash ||
  !cfg.SUPABASE_TEST_ANON_KEY ||
  !cfg.SUPABASE_TEST_SERVICE_ROLE_KEY ||
  cfg.SUPABASE_TEST_DISPOSABLE !== "YES"
) {
  console.error(
    "BLOCKED: Configure an explicitly disposable loopback Supabase stack; use --help.",
  );
  process.exit(2);
}
const origin = endpoint.origin,
  anonKey = cfg.SUPABASE_TEST_ANON_KEY;
const transport = async (input, init = {}) => {
  const url = new URL(
    typeof input === "string" || input instanceof URL ? input : input.url,
  );
  assert.equal(
    url.origin,
    origin,
    "Only the configured loopback origin is permitted",
  );
  try {
    return await fetch(input, {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw Error("Local transport failed");
  }
};
const client = (key) =>
  createClient(origin, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: transport },
  });
const service = client(cfg.SUPABASE_TEST_SERVICE_ROLE_KEY),
  anonymous = client(anonKey);
const cid = "bca-c-programming",
  other = "csit-cryptography",
  run = randomUUID(),
  device = randomUUID();
const password = () => randomBytes(24).toString("base64url");
let coursePassword = password(),
  adminId,
  adminToken,
  ready = false,
  stage = "setup",
  passed = 0;
const paths = [],
  resources = [],
  sessionIds = [],
  originalConfigs = [];
async function ok(query) {
  const r = await query;
  assert.ok(!r.error, "Supabase operation failed");
  return r.data;
}
async function check(name, fn) {
  stage = name;
  await fn();
  passed++;
  console.log("PASS " + name);
}
async function request(functionName, body, token, status = 200) {
  const response = await transport(origin + "/functions/v1/" + functionName, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
      ...(token
        ? functionName === "portal-admin"
          ? { Authorization: "Bearer " + token }
          : { "x-course-session": token }
        : {}),
    },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, status, "Unexpected function status");
  const data = await response.json();
  if (functionName === "course-access")
    assert.match(
      response.headers.get("Cache-Control") || "",
      /no-store/,
      "Missing no-store",
    );
  return { data, response };
}
const admin = (body, status = 200) =>
  request("portal-admin", body, adminToken, status);
const course = (body, token, status = 200) =>
  request("course-access", { course_id: cid, ...body }, token, status);
async function unlock(courseId = cid, remember = false, clientId = device) {
  const r = await course({
    action: "unlock",
    course_id: courseId,
    password: coursePassword,
    remember,
    client_id: clientId,
  });
  assert.match(
    r.data.token,
    /^[a-f0-9-]{36}\.[a-f0-9]{64}$/,
    "Missing random course token",
  );
  sessionIds.push(r.data.token.split(".")[0]);
  return r.data;
}
async function config(courseId, patch = {}) {
  await admin({
    action: "course-access-update",
    course_id: courseId,
    enabled: true,
    expires_at: null,
    standard_minutes: 480,
    remembered_minutes: 10080,
    ...patch,
  });
}
try {
  // Reject populated test stacks before any mutation.
  assert.equal(
    (await ok(service.from("hub_resources").select("id").limit(1))).length,
    0,
    "Use a pristine disposable database",
  );
  assert.equal(
    (await ok(service.from("hub_course_sessions").select("id").limit(1)))
      .length,
    0,
    "Use a pristine disposable database",
  );
  assert.equal(
    (await ok(service.from("hub_course_attempts").select("course_id").limit(1)))
      .length,
    0,
    "Use a pristine disposable database",
  );
  originalConfigs.push(
    ...(await ok(
      service
        .from("hub_course_access_config")
        .select("*")
        .in("course_id", [cid, other]),
    )),
  );
  assert.equal(originalConfigs.length, 2, "Apply both migrations and seed");
  assert(
    originalConfigs.every((c) => !c.password_hash && !c.enabled),
    "Use unconfigured disposable courses",
  );
  ready = true;
  const adminPassword = password();
  const created = await service.auth.admin.createUser({
    email: "hub-test-" + run + "@example.invalid",
    password: adminPassword,
    email_confirm: true,
    app_metadata: { credential_version: 1 },
  });
  assert.ok(
    !created.error && created.data.user,
    "Fixture account creation failed",
  );
  adminId = created.data.user.id;
  await ok(
    service
      .from("hub_accounts")
      .insert({
        id: adminId,
        email: created.data.user.email,
        full_name: "Test instructor",
        role: "admin",
        must_change_password: false,
      }),
  );
  const signed = await anonymous.auth.signInWithPassword({
    email: created.data.user.email,
    password: adminPassword,
  });
  assert.ok(!signed.error && signed.data.session, "Fixture sign-in failed");
  adminToken = signed.data.session.access_token;
  for (const c of [cid, other]) {
    await admin({
      action: "course-password",
      course_id: c,
      password: coursePassword,
    });
    await config(c);
  }
  for (const [c, status, release] of [
    [cid, "published", null],
    [other, "published", null],
    [cid, "draft", null],
    [cid, "published", new Date(Date.now() + 86400000).toISOString()],
  ]) {
    const id = randomUUID(),
      path = run + "/" + id + ".txt";
    paths.push(path);
    resources.push(id);
    const upload = await transport(
      origin + "/storage/v1/object/hub-materials/" + path,
      {
        method: "POST",
        headers: {
          apikey: cfg.SUPABASE_TEST_SERVICE_ROLE_KEY,
          Authorization: "Bearer " + cfg.SUPABASE_TEST_SERVICE_ROLE_KEY,
          "Content-Type": "text/plain",
          "cache-control": "no-store",
        },
        body: "Synthetic course integration fixture.",
      },
    );
    assert(upload.ok, "Fixture upload failed");
    await ok(
      service
        .from("hub_resources")
        .insert({
          id,
          course_id: c,
          title: "Synthetic test resource",
          category: "Sample Code",
          file_path: path,
          filename: "fixture.txt",
          mime: "text/plain",
          size: 37,
          status,
          release_at: release,
        }),
    );
  }
  let one, remembered;
  await check(
    "correct password and standard/remembered deadlines",
    async () => {
      one = await unlock();
      remembered = await unlock(cid, true);
      assert(
        Date.parse(one.expires_at) - Date.now() <= 28802000,
        "Standard exceeds 8 hours",
      );
      assert(
        Date.parse(remembered.expires_at) - Date.now() <= 604802000,
        "Remember exceeds 7 days",
      );
      const r = await course({ action: "content" }, one.token);
      assert.equal(
        r.data.resources.length,
        1,
        "Only released content should be returned",
      );
      assert(!("file_path" in r.data.resources[0]), "Metadata leaks file path");
    },
  );
  await check(
    "incorrect password and invented browser token denied",
    async () => {
      await course(
        {
          action: "unlock",
          password: "incorrect-password",
          remember: false,
          client_id: randomUUID(),
        },
        null,
        401,
      );
      await course({ action: "content" }, "unlocked=true", 401);
    },
  );
  await check("course scope and unpublished file boundaries", async () => {
    await course({ action: "content", course_id: other }, one.token, 401);
    for (const id of resources.slice(1))
      await course(
        { action: "file", resource_id: id, download: false },
        one.token,
        404,
      );
  });
  await check(
    "direct anonymous REST, private/public Storage and RPC denied",
    async () => {
      const metadata = await anonymous.from("hub_resources").select("id");
      assert(metadata.error, "Anonymous metadata was readable");
      const privateFile = await anonymous.storage
        .from("hub-materials")
        .download(paths[0]);
      assert(privateFile.error, "Private file was readable");
      const publicFile = await transport(
        origin + "/storage/v1/object/public/hub-materials/" + paths[0],
      );
      assert(!publicFile.ok, "Public URL was readable");
      const rpc = await anonymous.rpc("hub_course_content", {
        sid: one.token.split(".")[0],
        hashed_token: "a".repeat(64),
        cid,
      });
      assert(rpc.error, "Privileged RPC was executable");
      const secrets = await anonymous
        .from("hub_course_access_config")
        .select("*");
      assert(secrets.error, "Course secrets were readable");
    },
  );
  await check("file signing returns a working 60-second link", async () => {
    const r = await course(
      { action: "file", resource_id: resources[0], download: true },
      one.token,
    );
    assert.equal(r.data.expires_in, 60, "Unexpected signed lifetime");
    const file = await transport(r.data.url);
    assert(file.ok, "Signed download failed");
    assert.equal(
      await file.text(),
      "Synthetic course integration fixture.",
      "Wrong file content",
    );
  });
  await check("course session cannot invoke admin operations", async () => {
    await request(
      "portal-admin",
      { action: "course-revoke", course_id: cid },
      one.token,
      401,
    );
  });
  await check("lock one and lock all course/device sessions", async () => {
    await course({ action: "lock" }, one.token);
    await course({ action: "content" }, one.token, 401);
    const second = await unlock(other);
    await course({ action: "lock-all" }, remembered.token);
    await course({ action: "content" }, remembered.token, 401);
    await course({ action: "content", course_id: other }, second.token, 401);
  });
  await check("password rotation revokes prior sessions", async () => {
    const old = await unlock();
    coursePassword = password();
    await admin({
      action: "course-password",
      course_id: cid,
      password: coursePassword,
    });
    await course({ action: "content" }, old.token, 401);
  });
  await check(
    "disablement, expiry and explicit course revocation",
    async () => {
      const old = await unlock();
      await config(cid, { enabled: false });
      await course({ action: "content" }, old.token, 401);
      await course(
        {
          action: "unlock",
          password: coursePassword,
          remember: false,
          client_id: randomUUID(),
        },
        null,
        403,
      );
      await config(cid, {
        expires_at: new Date(Date.now() - 1000).toISOString(),
      });
      await course(
        {
          action: "unlock",
          password: coursePassword,
          remember: false,
          client_id: randomUUID(),
        },
        null,
        403,
      );
      await config(cid);
      const active = await unlock(cid, false, randomUUID());
      await admin({ action: "course-revoke", course_id: cid });
      await course({ action: "content" }, active.token, 401);
    },
  );
  await check("remembered session expiry checked server-side", async () => {
    const s = await unlock(cid, true, randomUUID());
    await ok(
      service
        .from("hub_course_sessions")
        .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
        .eq("id", s.token.split(".")[0]),
    );
    await course({ action: "content" }, s.token, 401);
  });
  await check("attempt limits spare another classroom device", async () => {
    const d = randomUUID();
    for (let i = 0; i < 8; i++)
      await course(
        {
          action: "unlock",
          password: "incorrect-password",
          remember: false,
          client_id: d,
        },
        null,
        401,
      );
    const r = await course(
      {
        action: "unlock",
        password: coursePassword,
        remember: false,
        client_id: d,
      },
      null,
      429,
    );
    assert(
      Number(r.response.headers.get("Retry-After")) > 0,
      "Missing retry guidance",
    );
    await unlock(cid, false, randomUUID());
  });
  await check(
    "generated password is returned once and never retrievable",
    async () => {
      const r = await admin({
        action: "course-password",
        course_id: cid,
        generate: true,
      });
      assert.match(
        r.data.generated_password,
        /^[A-Z2-9]{4}(-[A-Z2-9]{4}){4}$/,
        "Invalid generated format",
      );
      const list = await admin({ action: "course-access-list" });
      assert(
        list.data.courses.every(
          (c) => !("password_hash" in c) && !("password" in c),
        ),
        "Configuration exposes secrets",
      );
    },
  );
} catch {
  console.error(
    "FAIL " +
      stage +
      ": local integration assertion/operation failed; response bodies and secrets are withheld.",
  );
  process.exitCode = 1;
} finally {
  if (ready)
    try {
      if (paths.length)
        await ok(service.storage.from("hub-materials").remove(paths));
      if (resources.length)
        await ok(service.from("hub_resources").delete().in("id", resources));
      if (sessionIds.length)
        await ok(
          service.from("hub_course_sessions").delete().in("id", sessionIds),
        );
      // These course limiter tables were verified empty before this isolated run.
      await ok(
        service
          .from("hub_course_attempts")
          .delete()
          .in("course_id", [cid, other]),
      );
      for (const c of originalConfigs)
        await ok(
          service
            .from("hub_course_access_config")
            .update(c)
            .eq("course_id", c.course_id),
        );
      if (adminId) {
        await ok(service.from("hub_audit").delete().eq("actor_id", adminId));
        await ok(
          service.from("hub_rate_limits").delete().eq("actor_id", adminId),
        );
        const deleted = await service.auth.admin.deleteUser(adminId);
        assert(!deleted.error);
      }
    } catch {
      console.error(
        "FAIL fixture cleanup; inspect the disposable stack before reuse.",
      );
      process.exitCode = 1;
    }
}
if (!process.exitCode)
  console.log(
    "PASS " +
      passed +
      " real local HTTP scenarios plus cleanup. Hosted proxy/CDN and visual acceptance remain separate.",
  );
