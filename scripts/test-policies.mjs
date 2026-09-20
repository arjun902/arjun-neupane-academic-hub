import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
process.on("uncaughtException", (e) => {
  console.error("FAIL", e.message);
  process.exit(1);
});
const db = new PGlite();
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
).replace("create extension if not exists pgcrypto;", "");
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
console.log(
  "\n" +
    passed +
    " actual PostgreSQL policy checks passed. Auth service and Storage HTTP E2E require configured Supabase.",
);
await db.close();
