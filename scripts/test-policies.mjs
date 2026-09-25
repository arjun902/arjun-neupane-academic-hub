import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
process.on("uncaughtException", (e) => {
  console.error("FAIL", e.message);
  process.exit(1);
});
const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(`
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create schema storage;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
create function storage.foldername(path text) returns text[] language sql as $$ select string_to_array(path,'/') $$;
alter table storage.objects enable row level security;
grant usage on schema public,auth,storage to anon,authenticated,service_role;
grant select,insert,update,delete on storage.objects to anon,authenticated;
`);
if (process.argv.includes("--legacy"))
  await db.exec(
    readFileSync("legacy-source/legacy-schema.sql.txt", "utf8")
      .replace(/^\uFEFF/, "")
      .replace("create extension if not exists pgcrypto;", ""),
  );
// PGlite supplies gen_random_uuid natively; only the unused pgcrypto extension declaration differs.
const migration = readFileSync(
  "supabase/migrations/202609190001_academic_hub.sql",
  "utf8",
);
await db.exec(migration);
await db.exec(readFileSync("supabase/seed.sql", "utf8"));
const student = "00000000-0000-0000-0000-000000000001",
  other = "00000000-0000-0000-0000-000000000002",
  admin = "00000000-0000-0000-0000-000000000003";
const ids = [
  "10000000-0000-0000-0000-000000000001",
  "10000000-0000-0000-0000-000000000002",
  "10000000-0000-0000-0000-000000000003",
  "10000000-0000-0000-0000-000000000004",
];
await db.exec(`
insert into auth.users(id) values ('${student}'),('${other}'),('${admin}');
insert into public.hub_accounts(id,full_name,email,role,must_change_password) values
('${student}','Test Student','student@example.invalid','student',false),
('${other}','Other Student','other@example.invalid','student',false),
('${admin}','Test Admin','admin@example.invalid','admin',false);
insert into public.hub_enrollments(student_id,course_id) values ('${student}','bca-c-programming'),('${other}','csit-cryptography');
insert into public.hub_resources(id,course_id,title,category,file_path,status,release_at) values
('${ids[0]}','bca-c-programming','Visible','Unit-wise Notes','own.pdf','published',null),
('${ids[1]}','csit-cryptography','Other course','Unit-wise Notes','other.pdf','published',null),
('${ids[2]}','bca-c-programming','Draft','Solutions','draft.pdf','draft',null),
('${ids[3]}','bca-c-programming','Future','Solutions','future.pdf','published',now()+interval '1 day');
insert into storage.objects(bucket_id,name) values ('hub-materials','own.pdf'),('hub-materials','other.pdf'),('hub-materials','draft.pdf'),('hub-materials','future.pdf'),('materials','legacy.pdf');
-- Simulate an overly broad historical storage policy to verify restrictive isolation.
create policy old_permissive on storage.objects for select using(true);
create policy old_delete_permissive on storage.objects for delete using(true);
`);
let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log("PASS " + name);
}
async function role(id, version = 1) {
  await db.exec("reset role");
  await db.query(
    "select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",
    [
      id || "",
      JSON.stringify({ app_metadata: { credential_version: version } }),
    ],
  );
  await db.exec("set role " + (id ? "authenticated" : "anon"));
}
async function rows(sql) {
  return (await db.query(sql)).rows;
}
async function denied(sql) {
  try {
    await db.exec(sql);
  } catch {
    return;
  }
  throw Error("Expected denial: " + sql);
}
await role(null);
await check("Anonymous metadata denied", () =>
  denied("select * from hub_resources"),
);
await check(
  "Anonymous file access denied even with legacy permissive policy",
  async () =>
    assert.equal((await rows("select * from storage.objects")).length, 0),
);
await check(
  "Exactly six public courses, no assigned official metadata",
  async () => {
    const r = await rows("select * from hub_courses");
    assert.equal(r.length, 6);
    assert(
      r.every(
        (x) => !x.code && !x.semester && !x.credits && !x.syllabus_version,
      ),
    );
  },
);
await role(student);
await check(
  "Student sees only assigned, published, released resource",
  async () =>
    assert.deepEqual(
      (await rows("select id from hub_resources")).map((x) => x.id),
      [ids[0]],
    ),
);
await check("Resource ID tampering is denied", async () =>
  assert.equal(
    (await rows("select * from hub_resources where id='" + ids[1] + "'"))
      .length,
    0,
  ),
);
await check("Storage path tampering and drafts are denied", async () =>
  assert.deepEqual(
    (await rows("select name from storage.objects")).map((x) => x.name),
    ["own.pdf"],
  ),
);
await check(
  "Historical permissive delete cannot delete protected objects",
  async () => {
    await db.exec("delete from storage.objects where name='own.pdf'");
    assert.equal(
      (await rows("select name from storage.objects where name='own.pdf'"))
        .length,
      1,
    );
  },
);
await check("Student cannot elevate role", () =>
  denied("update hub_accounts set role='admin' where id='" + student + "'"),
);
await check("Student cannot assign enrollment", () =>
  denied(
    "insert into hub_enrollments values('" +
      student +
      "','csit-cryptography',null)",
  ),
);
await check("Student cannot publish resources", () =>
  denied(
    "insert into hub_resources(course_id,title,category,file_path) values('bca-c-programming','Injected','Solutions','injected.pdf')",
  ),
);
await check("Student cannot invoke privileged limiter", () =>
  denied("select hub_limit('" + student + "')"),
);
await check("Own bookmark and completion can be saved", async () => {
  await db.exec(
    "insert into hub_activity(student_id,resource_id,bookmarked,completed) values('" +
      student +
      "','" +
      ids[0] +
      "',true,true)",
  );
  assert.equal((await rows("select * from hub_activity")).length, 1);
});
await check("Other student activity cannot be written", () =>
  denied(
    "insert into hub_activity(student_id,resource_id) values('" +
      other +
      "','" +
      ids[0] +
      "')",
  ),
);
await role(other);
await check("Activity remains private", async () =>
  assert.equal((await rows("select * from hub_activity")).length, 0),
);
for (const [label, change] of [
  ["Suspended account", "status='suspended'"],
  ["Expired account", "status='active',expires_at=now()-interval '1 second'"],
  [
    "Initial password change required",
    "expires_at=null,must_change_password=true",
  ],
  [
    "Credential reset rejects stale JWT",
    "must_change_password=false,credential_version=2",
  ],
]) {
  await db.exec("reset role");
  await db.exec(
    "update hub_accounts set " + change + " where id='" + student + "'",
  );
  await role(student);
  await check(label + " denies metadata and files", async () => {
    assert.equal((await rows("select * from hub_resources")).length, 0);
    assert.equal((await rows("select * from storage.objects")).length, 0);
  });
}
await db.exec("reset role");
await db.exec(
  "update hub_accounts set credential_version=1 where id='" +
    student +
    "';update hub_enrollments set expires_at=now()-interval '1 second' where student_id='" +
    student +
    "'",
);
await role(student);
await check("Expired enrollment denies material access", async () =>
  assert.equal((await rows("select * from hub_resources")).length, 0),
);
await role(admin);
await check("Active admin can manage courses and see drafts", async () => {
  assert.equal((await rows("select * from hub_resources")).length, 4);
  await db.exec(
    "update hub_resources set status='published' where id='" + ids[2] + "'",
  );
});
await check(
  "Audit contains events without credential or file URL fields",
  async () => {
    const r = await rows("select * from hub_audit");
    assert(r.length > 0);
    assert(!Object.keys(r[0]).some((k) => /password|file|url/.test(k)));
  },
);
await db.exec("reset role");
await db.exec(
  "update hub_enrollments set expires_at=null where student_id='" +
    student +
    "'",
);
await role(student);
await check(
  "Publishing makes a draft available to enrolled student",
  async () =>
    assert.equal((await rows("select * from hub_resources")).length, 2),
);
await db.exec("reset role");
await check("Credential operations cannot overlap", async () => {
  const first = await rows(
    "update hub_accounts set credential_operation='20000000-0000-0000-0000-000000000001' where id='" +
      student +
      "' and credential_operation is null returning id",
  );
  const second = await rows(
    "update hub_accounts set credential_operation='20000000-0000-0000-0000-000000000002' where id='" +
      student +
      "' and credential_operation is null returning id",
  );
  assert.equal(first.length, 1);
  assert.equal(second.length, 0);
  await role(student);
  assert.equal((await rows("select * from hub_resources")).length, 0);
  await db.exec("reset role");
  await db.exec(
    "update hub_accounts set credential_operation=null where id='" +
      student +
      "'",
  );
});
await db.exec(
  "insert into hub_announcements(title,body,published,is_public,course_id) values('Private','Internal announcement',true,false,'bca-c-programming'),('Public','Public announcement',true,true,null),('Unpublished','Draft announcement',false,true,null)",
);
await role(null);
await check(
  "Only explicitly public published announcements are exposed",
  async () =>
    assert.deepEqual(
      (await rows("select title from hub_announcements")).map((r) => r.title),
      ["Public"],
    ),
);
// Upgrade to course-password access after exercising legacy protections.
await db.exec("reset role");
await db.exec(
  readFileSync(
    "supabase/migrations/202609200001_course_password_access.sql",
    "utf8",
  ),
);
const cid = "bca-c-programming",
  otherCid = "csit-cryptography",
  pass = randomBytes(24).toString("hex"),
  device = randomUUID();
async function call(name, args) {
  const placeholders = args.map((_, i) => `$${i + 1}`).join(",");
  if (name === "hub_take_course_attempt")
    return (
      await db.query(`select * from public.${name}(${placeholders})`, args)
    ).rows[0];
  return (
    await db.query(`select public.${name}(${placeholders}) as value`, args)
  ).rows[0]?.value;
}
async function session(
  course = cid,
  remember = false,
  password = pass,
  deviceId = device,
) {
  const sid = randomUUID(),
    hash = createHash("sha256").update(randomBytes(32)).digest("hex");
  const result = await call("hub_unlock_course", [
    course,
    password,
    sid,
    hash,
    remember,
    deviceId,
  ]);
  return { sid, hash, result };
}
await call("hub_set_course_password", [cid, pass]);
await call("hub_set_course_password", [otherCid, pass]);
await call("hub_update_course_access", [cid, true, null, 480, 10080]);
await call("hub_update_course_access", [otherCid, true, null, 480, 10080]);
await db.exec(`update hub_resources set status='draft' where id='${ids[2]}'`);
await check(
  "Migration preserves all student accounts and enrollments",
  async () => {
    assert.equal((await rows("select * from hub_accounts")).length, 3);
    assert.equal((await rows("select * from hub_enrollments")).length, 2);
  },
);
await check("Passwords are salted bcrypt hashes, never plaintext", async () => {
  const configs = await rows(
    "select password_hash from hub_course_access_config where password_hash is not null",
  );
  assert(
    configs.every(
      (c) => c.password_hash.startsWith("$2a$12$") && c.password_hash !== pass,
    ),
  );
  assert.notEqual(configs[0].password_hash, configs[1].password_hash);
});
await check("Wrong password grants no session", async () => {
  const before = (await rows("select * from hub_course_sessions")).length;
  assert.equal(
    (await session(cid, false, "wrong-password")).result.code,
    "invalid_password",
  );
  assert.equal(
    (await rows("select * from hub_course_sessions")).length,
    before,
  );
});
const standard = await session(),
  remembered = await session(cid, true);
await check("Correct password grants an 8-hour course session", async () => {
  assert(standard.result.expires_at);
  const delta = Date.parse(standard.result.expires_at) - Date.now();
  assert(delta > 7.9 * 3600000 && delta <= 8 * 3600000 + 2000);
});
await check("Remembered session lasts at most 7 days", async () => {
  const delta = Date.parse(remembered.result.expires_at) - Date.now();
  assert(delta > 6.9 * 86400000 && delta <= 7 * 86400000 + 2000);
});
await check(
  "Gateway returns only published/released course metadata",
  async () => {
    const content = await call("hub_course_content", [
      standard.sid,
      standard.hash,
      cid,
    ]);
    assert.deepEqual(
      content.resources.map((r) => r.id),
      [ids[0]],
    );
    assert(
      content.resources.every(
        (r) => !("file_path" in r) && !("external_url" in r),
      ),
    );
    assert.equal(content.announcements.length, 1);
  },
);
await check("Course A cannot request Course B metadata or files", async () => {
  assert.equal(
    await call("hub_course_content", [standard.sid, standard.hash, otherCid]),
    null,
  );
  assert.equal(
    await call("hub_course_file", [
      standard.sid,
      standard.hash,
      cid,
      ids[1],
      false,
    ]),
    null,
  );
  assert.equal(
    await call("hub_course_file", [
      standard.sid,
      standard.hash,
      otherCid,
      ids[1],
      false,
    ]),
    null,
  );
});
await check(
  "Invented browser token and tampered hash grant nothing",
  async () => {
    assert.equal(
      await call("hub_course_content", [randomUUID(), standard.hash, cid]),
      null,
    );
    assert.equal(
      await call("hub_course_content", [standard.sid, "a".repeat(64), cid]),
      null,
    );
  },
);
await check("Draft and unreleased file requests are denied", async () => {
  for (const rid of ids.slice(2))
    assert.equal(
      await call("hub_course_file", [
        standard.sid,
        standard.hash,
        cid,
        rid,
        false,
      ]),
      null,
    );
  assert.equal(
    (
      await call("hub_course_file", [
        standard.sid,
        standard.hash,
        cid,
        ids[0],
        false,
      ])
    ).file_path,
    "own.pdf",
  );
});
await role(null);
await check(
  "Anonymous cannot read password hashes, sessions or rate limits",
  async () => {
    for (const table of [
      "hub_course_access_config",
      "hub_course_sessions",
      "hub_course_attempts",
    ])
      await denied(`select * from ${table}`);
  },
);
await check("Anonymous cannot call gateway-only functions", async () => {
  await denied(
    `select hub_course_content('${standard.sid}','${standard.hash}','${cid}')`,
  );
  await denied(
    `select hub_unlock_course('${cid}','fake','${randomUUID()}','${"a".repeat(64)}',false,'${device}')`,
  );
  await denied(`select hub_set_course_password('${cid}','fake')`);
});
await check("Direct anonymous file access remains denied", async () =>
  assert.equal((await rows("select * from storage.objects")).length, 0),
);
await role(student);
await check(
  "Legacy student credentials cannot bypass the course gateway",
  async () => {
    assert.equal((await rows("select * from hub_resources")).length, 0);
    assert.equal((await rows("select * from hub_units")).length, 0);
    assert.equal((await rows("select * from storage.objects")).length, 0);
    await denied("select * from hub_course_access_config");
  },
);
await role(admin);
await check(
  "Administrator can still manage resources but cannot read course secrets directly",
  async () => {
    assert.equal((await rows("select * from hub_resources")).length, 4);
    await denied("select * from hub_course_access_config");
  },
);
await db.exec("reset role");
await check(
  "Password rotation invalidates every existing course session",
  async () => {
    await call("hub_set_course_password", [cid, pass]);
    assert.equal(
      await call("hub_course_content", [standard.sid, standard.hash, cid]),
      null,
    );
    assert.equal(
      await call("hub_course_content", [remembered.sid, remembered.hash, cid]),
      null,
    );
  },
);
await check(
  "Server checks access version even if revoked_at was cleared",
  async () => {
    await db.query(
      "update hub_course_sessions set revoked_at=null where id=$1",
      [standard.sid],
    );
    assert.equal(
      await call("hub_course_content", [standard.sid, standard.hash, cid]),
      null,
    );
  },
);
await check(
  "Server enforces disablement and course expiry independently",
  async () => {
    const s = await session();
    await db.query(
      "update hub_course_access_config set enabled=false where course_id=$1",
      [cid],
    );
    assert.equal(await call("hub_course_content", [s.sid, s.hash, cid]), null);
    assert.equal((await session()).result.code, "unavailable");
    await db.query(
      "update hub_course_access_config set enabled=true,expires_at=now()-interval '1 second' where course_id=$1",
      [cid],
    );
    assert.equal(await call("hub_course_content", [s.sid, s.hash, cid]), null);
    assert.equal((await session()).result.code, "expired");
    await db.query(
      "update hub_course_access_config set expires_at=null where course_id=$1",
      [cid],
    );
  },
);
await check("Course expiry caps remembered-session duration", async () => {
  await db.query(
    "update hub_course_access_config set expires_at=now()+interval '1 hour' where course_id=$1",
    [cid],
  );
  const s = await session(cid, true);
  assert(Date.parse(s.result.expires_at) - Date.now() <= 3602000);
  await db.query(
    "update hub_course_access_config set expires_at=null where course_id=$1",
    [cid],
  );
});
await check("Expired remembered sessions cannot read materials", async () => {
  const s = await session(cid, true);
  await db.query(
    "update hub_course_sessions set expires_at=now()-interval '1 second' where id=$1",
    [s.sid],
  );
  assert.equal(await call("hub_course_content", [s.sid, s.hash, cid]), null);
});
await check("Lock one session leaves another session usable", async () => {
  const one = await session(),
    two = await session();
  await db.query(
    "update hub_course_sessions set revoked_at=now() where id=$1",
    [one.sid],
  );
  assert.equal(
    await call("hub_course_content", [one.sid, one.hash, cid]),
    null,
  );
  assert(await call("hub_course_content", [two.sid, two.hash, cid]));
});
await check(
  "Lock all courses revokes the device across courses and tabs only",
  async () => {
    const one = await session(),
      two = await session(otherCid),
      different = await session(cid, false, pass, randomUUID());
    await call("hub_lock_course_device", [one.sid, one.hash]);
    assert.equal(
      await call("hub_course_content", [one.sid, one.hash, cid]),
      null,
    );
    assert.equal(
      await call("hub_course_content", [two.sid, two.hash, otherCid]),
      null,
    );
    assert(
      await call("hub_course_content", [different.sid, different.hash, cid]),
    );
  },
);
await check("Manual course revocation invalidates sessions", async () => {
  const s = await session();
  await call("hub_revoke_course_sessions", [cid]);
  assert.equal(await call("hub_course_content", [s.sid, s.hash, cid]), null);
});
await check(
  "Rate limits are per device/course, not a single classroom lock",
  async () => {
    const key = "b".repeat(64);
    for (let i = 0; i < 8; i++)
      assert(
        (await call("hub_take_course_attempt", [cid, key, 900, 8])).allowed,
      );
    const blocked = await call("hub_take_course_attempt", [cid, key, 900, 8]);
    assert.equal(blocked.allowed, false);
    assert(blocked.retry_after > 0 && blocked.retry_after <= 900);
    assert(
      (await call("hub_take_course_attempt", [cid, "c".repeat(64), 900, 8]))
        .allowed,
    );
    assert(
      (await call("hub_take_course_attempt", [otherCid, key, 900, 8])).allowed,
    );
  },
);
await check("Duration bounds are enforced by the database", async () => {
  await denied(
    `update hub_course_access_config set standard_minutes=481 where course_id='${cid}'`,
  );
  await denied(
    `update hub_course_access_config set remembered_minutes=10081 where course_id='${cid}'`,
  );
});
// Execute the real Edge handler against the real SQL functions. The Storage
// signer is an explicit test double; hosted Storage/Auth HTTP still need E2E.
const tableFunctions = new Set([
  "hub_take_course_attempt",
  "hub_validate_course_session",
]);
const signingCalls = [];
const adapter = {
  async rpc(name, args) {
    try {
      assert.match(name, /^hub_[a-z_]+$/);
      const entries = Object.entries(args);
      for (const [key] of entries) assert.match(key, /^[a-z_]+$/);
      const params = entries.map(([key], i) => `${key}=>$${i + 1}`).join(",");
      const data = tableFunctions.has(name)
        ? (
            await db.query(
              `select * from public.${name}(${params})`,
              entries.map((x) => x[1]),
            )
          ).rows
        : (
            await db.query(
              `select public.${name}(${params}) as value`,
              entries.map((x) => x[1]),
            )
          ).rows[0]?.value;
      return { data, error: null };
    } catch {
      return {
        data: null,
        error: { message: "Test adapter database failure" },
      };
    }
  },
  from(table) {
    assert.equal(table, "hub_course_sessions");
    const filters = [];
    let patch;
    const builder = {
      update(value) {
        patch = value;
        return builder;
      },
      eq(key, value) {
        assert(["id", "course_id", "token_hash"].includes(key));
        filters.push([key, value]);
        return builder;
      },
      async then(resolve, reject) {
        try {
          await db.query(
            `update hub_course_sessions set revoked_at=$1 where ${filters.map(([k], i) => `${k}=$${i + 2}`).join(" and ")}`,
            [patch.revoked_at, ...filters.map((x) => x[1])],
          );
          return resolve({ error: null });
        } catch (e) {
          return reject(e);
        }
      },
    };
    return builder;
  },
  storage: {
    from(bucket) {
      assert.equal(bucket, "hub-materials");
      return {
        async createSignedUrl(path, seconds) {
          signingCalls.push({ path, seconds });
          return {
            data: {
              signedUrl: "https://storage.example.invalid/test-only-signed-url",
            },
            error: null,
          };
        },
      };
    },
  },
  auth: {
    async getUser() {
      return {
        data: { user: null },
        error: { message: "No Auth identity for a course token" },
      };
    },
  },
};
let handler, adminHandler;
function loadHandler(file, setHandler) {
  const source = readFileSync(file, "utf8").replace(
    /import \{ createClient \} from "npm:@supabase\/supabase-js@2.108.2";/,
    "",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  }).outputText;
  new Function("createClient", "Deno", js)(() => adapter, {
    env: {
      get: (name) =>
        name === "SUPABASE_URL"
          ? "https://project.example.invalid"
          : name === "ALLOWED_ORIGIN"
            ? "https://arjun902.github.io"
            : "test-only-service-key",
    },
    serve: setHandler,
  });
}
loadHandler("supabase/functions/course-access/index.ts", (h) => {
  handler = h;
});
loadHandler("supabase/functions/portal-admin/index.ts", (h) => {
  adminHandler = h;
});
async function request(body, token, expected = 200, extra = {}) {
  const response = await handler(
    new Request("https://edge.example.invalid/course-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.0.2.1",
        ...(token ? { "x-course-session": token } : {}),
        ...extra,
      },
      body: JSON.stringify({ course_id: cid, ...body }),
    }),
  );
  assert.equal(response.status, expected, "Unexpected Edge status");
  assert.match(response.headers.get("Cache-Control"), /no-store/);
  return { data: await response.json(), response };
}
const edgeDevice = randomUUID();
const edgeUnlock = async (
  course = cid,
  remember = false,
  clientId = edgeDevice,
) =>
  (
    await request({
      action: "unlock",
      course_id: course,
      password: pass,
      remember,
      client_id: clientId,
    })
  ).data;
let edgeSession;
await check(
  "Edge handler verifies real bcrypt password and issues a random session",
  async () => {
    edgeSession = await edgeUnlock();
    assert.match(edgeSession.token, /^[a-f0-9-]{36}\.[a-f0-9]{64}$/);
    const two = await edgeUnlock();
    assert.notEqual(edgeSession.token, two.token);
    const content = await request({ action: "content" }, edgeSession.token);
    assert.equal(content.data.resources.length, 1);
  },
);
await check(
  "Edge rejects wrong passwords and invented localStorage tokens",
  async () => {
    assert.equal(
      (
        await request(
          {
            action: "unlock",
            password: "incorrect-password",
            remember: false,
            client_id: randomUUID(),
          },
          null,
          401,
        )
      ).data.code,
      "invalid_password",
    );
    await request({ action: "content" }, "unlocked=true", 401);
    await request(
      { action: "content" },
      `${randomUUID()}.${"a".repeat(64)}`,
      401,
    );
  },
);
await check("Edge enforces scope for metadata and file signing", async () => {
  await request(
    { action: "content", course_id: otherCid },
    edgeSession.token,
    401,
  );
  await request(
    { action: "file", resource_id: ids[1], download: false },
    edgeSession.token,
    404,
  );
  assert.equal(signingCalls.length, 0);
});
await check(
  "Edge signs only released files for exactly 60 seconds",
  async () => {
    await request(
      { action: "file", resource_id: ids[0], download: false },
      edgeSession.token,
    );
    assert.deepEqual(signingCalls[0], { path: "own.pdf", seconds: 60 });
    for (const id of ids.slice(2))
      await request(
        { action: "file", resource_id: id, download: false },
        edgeSession.token,
        404,
      );
    assert.equal(signingCalls.length, 1);
  },
);
await check(
  "Course bearer token cannot invoke administrator operations",
  async () => {
    const r = await adminHandler(
      new Request("https://edge.example.invalid/portal-admin", {
        method: "POST",
        headers: { Authorization: `Bearer ${edgeSession.token}` },
        body: JSON.stringify({
          action: "course-password",
          course_id: cid,
          generate: true,
        }),
      }),
    );
    assert.equal(r.status, 401);
  },
);
await check("Edge Lock this course revokes the token", async () => {
  await request({ action: "lock" }, edgeSession.token);
  await request({ action: "content" }, edgeSession.token, 401);
});
await check("Edge device-wide lock revokes multiple courses", async () => {
  const a = await edgeUnlock(),
    b = await edgeUnlock(otherCid);
  await request({ action: "lock-all" }, a.token);
  await request({ action: "content" }, a.token, 401);
  await request({ action: "content", course_id: otherCid }, b.token, 401);
});
await check(
  "Edge rate limiting gives Retry-After without locking another classroom device",
  async () => {
    const clientId = randomUUID();
    for (let n = 0; n < 8; n++)
      await request(
        {
          action: "unlock",
          password: "wrong-password",
          remember: false,
          client_id: clientId,
        },
        null,
        401,
      );
    const r = await request(
      {
        action: "unlock",
        password: pass,
        remember: false,
        client_id: clientId,
      },
      null,
      429,
    );
    assert(Number(r.response.headers.get("Retry-After")) > 0);
    await edgeUnlock(cid, false, randomUUID());
  },
);
await check("Missing trusted network metadata fails closed", async () => {
  await request(
    {
      action: "unlock",
      password: pass,
      remember: false,
      client_id: randomUUID(),
    },
    null,
    503,
    { "x-forwarded-for": "" },
  );
});
console.log(
  "\n" +
    passed +
    " PostgreSQL/gateway checks passed. Auth service and Storage HTTP E2E require configured Supabase.",
);
await db.close();
