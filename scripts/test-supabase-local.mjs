#!/usr/bin/env node
// Real Auth, Edge Function, REST and Storage checks against a disposable local stack.
// This script never reads .env.local and never accepts a remote Supabase origin.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const usage = `Usage: node scripts/test-supabase-local.mjs

Apply the hub migration and serve portal-admin on a disposable local Supabase stack.
Set these environment variables, or put them in ignored .env.supabase-test.local:
  SUPABASE_TEST_URL=http://127.0.0.1:54321
  SUPABASE_TEST_ANON_KEY=<local anonymous key>
  SUPABASE_TEST_SERVICE_ROLE_KEY=<local service-role key>

Only localhost and 127.0.0.1 origins are accepted. Redirects are rejected.
Creates isolated synthetic fixtures and removes only this run's fixture IDs.
Exit codes: 0 passed; 1 failed (including cleanup); 2 blocked configuration.`;

if (process.argv.includes("--help")) {
  console.log(usage);
  process.exit(0);
}

async function config() {
  const values = {};
  try {
    const content = await readFile(
      fileURLToPath(new URL("../.env.supabase-test.local", import.meta.url)),
      "utf8",
    );
    for (const line of content.replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const match = line.match(
        /^\s*(?:export\s+)?(SUPABASE_TEST_[A-Z_]+)\s*=\s*(.*?)\s*$/,
      );
      if (!match) continue;
      let value = match[2];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, "").trim();
      }
      values[match[1]] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT")
      throw new Error("Cannot read .env.supabase-test.local.");
  }
  for (const key of [
    "SUPABASE_TEST_URL",
    "SUPABASE_TEST_ANON_KEY",
    "SUPABASE_TEST_SERVICE_ROLE_KEY",
  ])
    if (process.env[key] !== undefined) values[key] = process.env[key];
  if (
    !values.SUPABASE_TEST_URL ||
    !values.SUPABASE_TEST_ANON_KEY ||
    !values.SUPABASE_TEST_SERVICE_ROLE_KEY
  )
    throw new Error(
      "Local Supabase test configuration is missing. Run with --help for setup.",
    );
  let endpoint;
  try {
    endpoint = new URL(values.SUPABASE_TEST_URL);
  } catch {
    throw new Error("SUPABASE_TEST_URL must be a local HTTP(S) origin.");
  }
  if (
    !["localhost", "127.0.0.1"].includes(endpoint.hostname) ||
    !["http:", "https:"].includes(endpoint.protocol) ||
    endpoint.username ||
    endpoint.password ||
    endpoint.pathname !== "/" ||
    endpoint.search ||
    endpoint.hash
  )
    throw new Error(
      "Only localhost or 127.0.0.1 HTTP(S) origins are allowed; remote projects are blocked.",
    );
  return {
    origin: endpoint.origin,
    anonKey: values.SUPABASE_TEST_ANON_KEY,
    serviceKey: values.SUPABASE_TEST_SERVICE_ROLE_KEY,
  };
}

let settings;
try {
  settings = await config();
} catch (error) {
  console.error(`BLOCKED: ${error.message}`);
  process.exit(2);
}

const { origin, anonKey, serviceKey } = settings;
// Every SDK request uses this transport: no remote origins or HTTP redirects,
// even if an endpoint sends a redirect or an SDK changes the requested URL.
async function localFetch(input, init = {}) {
  const address = new URL(
    typeof input === "string" || input instanceof URL ? input : input.url,
  );
  assert.equal(
    address.origin,
    origin,
    "A request attempted to leave the configured local origin",
  );
  assert.ok(
    !address.username && !address.password,
    "URL credentials are not accepted",
  );
  try {
    return await fetch(input, {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // Never include transport errors or request headers, which may contain credentials.
    throw new Error(
      "Local HTTP request failed, timed out, or attempted a redirect.",
    );
  }
}

function client(key = anonKey, token) {
  return createClient(origin, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: localFetch,
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    },
  });
}
const service = client(serviceKey);
const anonymous = client();
const runId = randomUUID();
const adminEmail = `hub-e2e-${runId}-admin@example.invalid`;
const studentEmail = `hub-e2e-${runId}-student@example.invalid`;
const strongPassword = () => `Aa1!${randomBytes(24).toString("base64url")}`;
const adminPassword = strongPassword();
const studentPassword = strongPassword();
const finalPassword = strongPassword();
const fixtures = { users: [], courses: [], resources: [], paths: [] };
const past = new Date(Date.now() - 86_400_000).toISOString();
const future = new Date(Date.now() + 86_400_000).toISOString();
let passed = 0;
let stage = "initialization";

async function check(name, fn) {
  stage = name;
  await fn();
  passed++;
  console.log(`PASS ${name}`);
}
async function result(query, label) {
  const response = await query;
  assert.ok(!response.error, label);
  return response.data;
}
async function signIn(email, password) {
  const signed = await client().auth.signInWithPassword({ email, password });
  assert.ok(
    !signed.error && signed.data.session?.access_token,
    "Fixture sign-in failed",
  );
  const token = signed.data.session.access_token;
  // A fixed Authorization header intentionally retains the original JWT across
  // suspensions, expiry and resets; it cannot silently refresh into a new token.
  return { token, db: client(anonKey, token), userId: signed.data.user.id };
}
async function portal(session, body, expectedStatus = 200) {
  const response = await localFetch(`${origin}/functions/v1/portal-admin`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  assert.equal(
    response.status,
    expectedStatus,
    "portal-admin returned an unexpected HTTP status",
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("portal-admin did not return JSON");
  }
  if (expectedStatus === 200)
    assert.equal(data.ok, true, "portal-admin did not acknowledge success");
  else
    assert.equal(
      typeof data.error,
      "string",
      "Denied function call should include an error",
    );
  return data;
}
async function hidden(session, resource, label) {
  const rows = await result(
    session.db.from("hub_resources").select("id").eq("id", resource.id),
    `${label}: metadata query failed`,
  );
  assert.equal(rows.length, 0, `${label}: restricted metadata was visible`);
  const download = await session.db.storage
    .from("hub-materials")
    .download(resource.file_path);
  assert.ok(
    download.error && !download.data,
    `${label}: restricted file was downloadable`,
  );
}
async function accessible(session, resource, expectedText) {
  const rows = await result(
    session.db.from("hub_resources").select("id").eq("id", resource.id),
    "Allowed resource query failed",
  );
  assert.equal(
    rows.length,
    1,
    "Enrolled student could not see the published resource",
  );
  const blob = await result(
    session.db.storage.from("hub-materials").download(resource.file_path),
    "Allowed authenticated download failed",
  );
  assert.equal(
    await blob.text(),
    expectedText,
    "Downloaded file contents changed",
  );
}
async function activityBlocked(session, studentId, resourceId, label) {
  const rows = await result(
    session.db
      .from("hub_activity")
      .select("resource_id")
      .eq("resource_id", resourceId),
    `${label}: activity query failed`,
  );
  assert.equal(rows.length, 0, `${label}: activity remained visible`);
  const write = await session.db
    .from("hub_activity")
    .upsert({
      student_id: studentId,
      resource_id: resourceId,
      bookmarked: true,
    });
  assert.ok(write.error, `${label}: activity write was accepted`);
}

let admin, student, initial, createdStudentId, visible;
const courseId = `e2e-${runId}-enrolled`;
const wrongCourseId = `e2e-${runId}-other`;
const originalText = `Original local integration fixture ${runId}.\nThis synthetic teaching note has no private source material.\n`;

async function cleanup() {
  const errors = [];
  async function attempt(label, operation) {
    try {
      const response = await operation();
      if (response?.error) errors.push(label);
    } catch {
      errors.push(label);
    }
  }
  if (fixtures.paths.length)
    await attempt("storage fixtures", () =>
      service.storage.from("hub-materials").remove(fixtures.paths),
    );
  if (fixtures.resources.length)
    await attempt("resource fixtures", () =>
      service.from("hub_resources").delete().in("id", fixtures.resources),
    );
  // Deleting only known fixture Auth IDs cascades their hub accounts,
  // enrollments and activity; unrelated users are never enumerated or deleted.
  for (const id of fixtures.users)
    await attempt("auth fixture", () => service.auth.admin.deleteUser(id));
  if (fixtures.courses.length)
    await attempt("course fixtures", () =>
      service.from("hub_courses").delete().in("id", fixtures.courses),
    );
  if (fixtures.users.length) {
    await attempt("fixture rate limits", () =>
      service.from("hub_rate_limits").delete().in("actor_id", fixtures.users),
    );
    await attempt("fixture actor audit", () =>
      service.from("hub_audit").delete().in("actor_id", fixtures.users),
    );
  }
  const entityIds = [
    ...fixtures.users,
    ...fixtures.courses,
    ...fixtures.resources,
  ];
  if (entityIds.length)
    await attempt("fixture entity audit", () =>
      service.from("hub_audit").delete().in("entity_id", entityIds),
    );
  if (errors.length) {
    console.error(
      `FAIL cleanup: ${errors.join(", ")}. Inspect fixture run ${runId} on the local stack.`,
    );
    process.exitCode = 1;
  } else console.log("PASS removed this run's fixtures");
}

try {
  await check(
    "bootstrap synthetic administrator and sign in through Auth",
    async () => {
      const created = await result(
        service.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          app_metadata: { credential_version: 1 },
        }),
        "Local Auth administrator fixture creation failed",
      );
      assert.ok(created.user?.id, "Local Auth did not return the fixture ID");
      fixtures.users.push(created.user.id);
      await result(
        service.from("hub_accounts").insert({
          id: created.user.id,
          email: adminEmail,
          full_name: "Local E2E Administrator",
          role: "admin",
          status: "active",
          credential_version: 1,
          must_change_password: false,
        }),
        "Administrator account fixture creation failed",
      );
      admin = await signIn(adminEmail, adminPassword);
    },
  );

  await check(
    "administrator creates courses, uploads original files and publishes resources using authenticated anon client",
    async () => {
      const courses = await result(
        admin.db
          .from("hub_courses")
          .insert([
            {
              id: courseId,
              name: "Local E2E Enrolled Course",
              program: "Test",
              visible: false,
            },
            {
              id: wrongCourseId,
              name: "Local E2E Other Course",
              program: "Test",
              visible: false,
            },
          ])
          .select("id"),
        "Authenticated administrator course creation failed",
      );
      fixtures.courses.push(...courses.map((row) => row.id));
      const cases = [
        {
          title: "Published note",
          course_id: courseId,
          status: "published",
          release_at: null,
        },
        {
          title: "Wrong course",
          course_id: wrongCourseId,
          status: "published",
          release_at: null,
        },
        {
          title: "Draft solution",
          course_id: courseId,
          status: "draft",
          release_at: null,
        },
        {
          title: "Future solution",
          course_id: courseId,
          status: "published",
          release_at: future,
        },
      ];
      for (const [index, scenario] of cases.entries()) {
        const id = randomUUID();
        const path = `local-e2e/${runId}/${id}.txt`;
        const text =
          index === 0
            ? originalText
            : `Synthetic restricted fixture ${index} for ${runId}.\n`;
        await result(
          admin.db.storage
            .from("hub-materials")
            .upload(path, Buffer.from(text), {
              contentType: "text/plain",
              upsert: false,
            }),
          "Authenticated administrator storage upload failed",
        );
        fixtures.paths.push(path);
        const resource = {
          id,
          ...scenario,
          category: index > 1 ? "Solutions" : "Unit-wise Notes",
          file_path: path,
          filename: `${id}.txt`,
          mime: "text/plain",
          size: Buffer.byteLength(text),
        };
        await result(
          admin.db.from("hub_resources").insert(resource),
          "Authenticated administrator resource publication failed",
        );
        fixtures.resources.push(id);
        if (index === 0) visible = resource;
        cases[index] = resource;
      }
      visible.restricted = cases.slice(1);
    },
  );

  await check(
    "portal-admin creates and enrolls a student with mandatory password change",
    async () => {
      const created = await portal(admin, {
        action: "create-student",
        email: studentEmail,
        full_name: "Local E2E Student",
        expires_at: null,
      });
      assert.equal(
        typeof created.student_id,
        "string",
        "Function did not return the student ID",
      );
      createdStudentId = created.student_id;
      fixtures.users.push(createdStudentId);
      assert.ok(
        typeof created.temporary_password === "string" &&
          created.temporary_password.length >= 12,
        "Function did not return a strong temporary credential",
      );
      await portal(admin, {
        action: "enroll",
        student_id: createdStudentId,
        course_id: courseId,
        expires_at: null,
      });
      initial = await signIn(studentEmail, created.temporary_password);
      const account = await result(
        initial.db
          .from("hub_accounts")
          .select("must_change_password")
          .eq("id", createdStudentId)
          .single(),
        "Student could not read own account",
      );
      assert.equal(
        account.must_change_password,
        true,
        "Temporary account did not require a password change",
      );
      await hidden(initial, visible, "Temporary credential");
      await activityBlocked(
        initial,
        createdStudentId,
        visible.id,
        "Temporary credential",
      );
      await portal(initial, {
        action: "change-password",
        current_password: created.temporary_password,
        password: studentPassword,
      });
      await hidden(initial, visible, "Token issued before password change");
      student = await signIn(studentEmail, studentPassword);
    },
  );

  await check(
    "fresh student session reads published metadata and downloads exact original bytes",
    async () => {
      const account = await result(
        student.db
          .from("hub_accounts")
          .select("must_change_password,credential_version")
          .eq("id", createdStudentId)
          .single(),
        "Changed student account unavailable",
      );
      assert.equal(
        account.must_change_password,
        false,
        "Password change did not open account access",
      );
      assert.equal(
        account.credential_version,
        2,
        "Password change did not advance credential version",
      );
      await accessible(student, visible, originalText);
      const rows = await result(
        student.db
          .from("hub_resources")
          .select("id")
          .in("id", fixtures.resources),
        "Student resource catalogue query failed",
      );
      assert.deepEqual(
        rows.map((row) => row.id),
        [visible.id],
        "Student saw resources outside the published enrollment",
      );
      const enrollment = await result(
        student.db
          .from("hub_enrollments")
          .select("course_id")
          .eq("student_id", createdStudentId),
        "Student enrollment query failed",
      );
      assert.deepEqual(
        enrollment.map((row) => row.course_id),
        [courseId],
        "Student enrollment was not persisted",
      );
    },
  );

  await check(
    "wrong-course, draft and future-release metadata and storage stay private",
    async () => {
      for (const resource of visible.restricted)
        await hidden(student, resource, resource.title);
      const download = await anonymous.storage
        .from("hub-materials")
        .download(visible.file_path);
      assert.ok(
        download.error && !download.data,
        "Anonymous request downloaded a private file",
      );
    },
  );

  await check(
    "student bookmarks and completion persist with owner isolation",
    async () => {
      await result(
        admin.db
          .from("hub_activity")
          .upsert({
            student_id: admin.userId,
            resource_id: visible.id,
            bookmarked: true,
          }),
        "Other-owner activity fixture creation failed",
      );
      await result(
        student.db
          .from("hub_activity")
          .upsert({
            student_id: createdStudentId,
            resource_id: visible.id,
            bookmarked: true,
            completed: true,
            last_opened_at: new Date().toISOString(),
          }),
        "Student activity write failed",
      );
      const rows = await result(
        student.db
          .from("hub_activity")
          .select("student_id,bookmarked,completed")
          .eq("resource_id", visible.id),
        "Student activity read failed",
      );
      assert.equal(
        rows.length,
        1,
        "Student could read another owner's activity",
      );
      assert.equal(
        rows[0].student_id,
        createdStudentId,
        "Wrong activity owner returned",
      );
      assert.equal(rows[0].bookmarked, true, "Bookmark was not persisted");
      assert.equal(rows[0].completed, true, "Completion was not persisted");
      const forged = await student.db
        .from("hub_activity")
        .upsert({
          student_id: admin.userId,
          resource_id: visible.id,
          completed: true,
        });
      assert.ok(forged.error, "Student could write another owner's activity");
    },
  );

  await check("student cannot invoke administrator operations", async () => {
    await portal(
      student,
      { action: "reset-password", student_id: createdStudentId },
      403,
    );
    const changed = await student.db
      .from("hub_resources")
      .update({ title: "Unauthorized edit" })
      .eq("id", visible.id)
      .select("id");
    assert.ok(
      changed.error || changed.data.length === 0,
      "Student could update a resource",
    );
    const saved = await result(
      admin.db
        .from("hub_resources")
        .select("title")
        .eq("id", visible.id)
        .single(),
      "Administrator could not verify resource integrity",
    );
    assert.equal(
      saved.title,
      visible.title,
      "Unauthorized resource mutation persisted",
    );
  });

  async function updateStudent(status, expires_at) {
    await portal(admin, {
      action: "update-student",
      student_id: createdStudentId,
      full_name: "Local E2E Student",
      status,
      expires_at,
    });
  }
  await check(
    "suspension blocks retained JWT metadata, downloads, activity and function calls",
    async () => {
      await updateStudent("suspended", null);
      await hidden(student, visible, "Suspended retained JWT");
      await activityBlocked(
        student,
        createdStudentId,
        visible.id,
        "Suspended retained JWT",
      );
      await portal(
        student,
        { action: "reset-password", student_id: createdStudentId },
        403,
      );
      await updateStudent("active", null);
      await accessible(student, visible, originalText);
    },
  );

  await check(
    "account expiry immediately closes retained JWT access",
    async () => {
      await updateStudent("active", past);
      await hidden(student, visible, "Expired account retained JWT");
      await activityBlocked(
        student,
        createdStudentId,
        visible.id,
        "Expired account retained JWT",
      );
      await portal(
        student,
        { action: "reset-password", student_id: createdStudentId },
        403,
      );
      await updateStudent("active", null);
      await accessible(student, visible, originalText);
    },
  );

  await check(
    "enrollment expiry immediately closes retained JWT course access",
    async () => {
      await portal(admin, {
        action: "enroll",
        student_id: createdStudentId,
        course_id: courseId,
        expires_at: past,
      });
      await hidden(student, visible, "Expired enrollment retained JWT");
      await activityBlocked(
        student,
        createdStudentId,
        visible.id,
        "Expired enrollment retained JWT",
      );
      await portal(admin, {
        action: "enroll",
        student_id: createdStudentId,
        course_id: courseId,
        expires_at: null,
      });
      await accessible(student, visible, originalText);
    },
  );

  await check(
    "credential reset revokes old password and JWT, including after new password activation",
    async () => {
      const reset = await portal(admin, {
        action: "reset-password",
        student_id: createdStudentId,
      });
      assert.equal(
        typeof reset.temporary_password,
        "string",
        "Reset did not return a temporary credential",
      );
      await hidden(student, visible, "Pre-reset retained JWT");
      await activityBlocked(
        student,
        createdStudentId,
        visible.id,
        "Pre-reset retained JWT",
      );
      await portal(
        student,
        {
          action: "change-password",
          current_password: studentPassword,
          password: finalPassword,
        },
        403,
      );
      const obsolete = await client().auth.signInWithPassword({
        email: studentEmail,
        password: studentPassword,
      });
      assert.ok(
        obsolete.error && !obsolete.data.session,
        "The previous password still signed in after reset",
      );
      const temporary = await signIn(studentEmail, reset.temporary_password);
      await hidden(temporary, visible, "Reset temporary credential");
      await portal(temporary, {
        action: "change-password",
        current_password: reset.temporary_password,
        password: finalPassword,
      });
      const current = await signIn(studentEmail, finalPassword);
      await accessible(current, visible, originalText);
      await hidden(
        student,
        visible,
        "Old JWT after replacement password activation",
      );
      await hidden(
        temporary,
        visible,
        "Temporary JWT after replacement password activation",
      );
      await portal(
        student,
        { action: "reset-password", student_id: createdStudentId },
        403,
      );
    },
  );
} catch (error) {
  // Assert messages and our own transport messages contain no keys or passwords.
  // SDK error bodies are deliberately never printed.
  const message =
    error instanceof assert.AssertionError
      ? error.message.split("\n")[0]
      : error?.message ===
          "Local HTTP request failed, timed out, or attempted a redirect."
        ? error.message
        : "Unexpected local test failure; no credentials or server response bodies are logged.";
  console.error(`FAIL ${stage}: ${message}`);
  process.exitCode = 1;
} finally {
  await cleanup();
}
if (!process.exitCode)
  console.log(
    `PASS ${passed} real local Supabase integration scenarios, plus fixture cleanup.`,
  );
