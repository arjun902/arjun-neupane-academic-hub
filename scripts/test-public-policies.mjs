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

await db.exec(
  readFileSync("supabase/migrations/202609250001_public_learning.sql", "utf8"),
);
await role(null);
await check(
  "Anonymous users read published resources across courses",
  async () =>
    assert.deepEqual(
      (await rows("select title from hub_resources order by title")).map(
        (r) => r.title,
      ),
      ["Other course", "Visible"],
    ),
);
await check(
  "Anonymous storage reads exclude draft and scheduled files",
  async () =>
    assert.deepEqual(
      (await rows("select name from storage.objects order by name")).map(
        (r) => r.name,
      ),
      ["other.pdf", "own.pdf"],
    ),
);
await check(
  "Account, enrollment and activity tables stay private",
  async () => {
    for (const t of [
      "hub_accounts",
      "hub_enrollments",
      "hub_activity",
      "hub_audit",
    ])
      await denied("select * from " + t);
  },
);
await check("Anonymous publishing is denied", () =>
  denied("update hub_resources set status='published'"),
);
await check("Anonymous uploads are denied", () =>
  denied(
    "insert into storage.objects(bucket_id,name) values ('hub-materials','evil.pdf')",
  ),
);
await check("Anonymous deletes cannot remove files", async () =>
  assert.equal(
    (
      await rows(
        "delete from storage.objects where bucket_id='hub-materials' returning name",
      )
    ).length,
    0,
  ),
);
await db.exec(
  "reset role; update hub_courses set visible=false where id='csit-cryptography'",
);
await role(null);
await check("Hidden course resources and files remain private", async () => {
  assert.equal((await rows("select * from hub_resources")).length, 1);
  assert.equal((await rows("select * from storage.objects")).length, 1);
});
await db.exec(
  "reset role; update hub_resources set preview_enabled=false,download_enabled=false where file_path='own.pdf'",
);
await role(null);
await check("Disabled file actions deny file reads", async () =>
  assert.equal((await rows("select * from storage.objects")).length, 0),
);
await role(other);
await check("Unenrolled signed-in visitor can read public metadata", async () =>
  assert.equal(
    (await rows("select * from hub_resources where title='Visible'")).length,
    1,
  ),
);
await role(admin);
await check("Staff retain draft access", async () =>
  assert.equal((await rows("select * from hub_resources")).length, 4),
);
await check("Staff retain file management access", async () =>
  assert.equal(
    (
      await rows(
        "select * from storage.objects where bucket_id='hub-materials'",
      )
    ).length,
    4,
  ),
);
console.log(passed + " public-learning database policy checks passed.");
await db.close();
