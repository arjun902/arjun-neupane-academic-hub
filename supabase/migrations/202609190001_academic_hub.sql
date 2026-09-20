-- Phase one: isolated schema; legacy data is retained but its API access is revoked.
begin;
create extension if not exists pgcrypto;
create table public.hub_accounts (
 id uuid primary key references auth.users on delete cascade,
 full_name text not null check(length(full_name) between 2 and 120),
 email text not null check(length(email)<=254),
 role text not null default 'student' check(role in ('student','admin')),
 status text not null default 'active' check(status in ('active','suspended')),
 expires_at timestamptz, must_change_password boolean not null default true,
 credential_version integer not null default 1,
 credential_operation uuid,
 created_at timestamptz not null default now()
);
create table public.hub_courses (
 id text primary key check(id ~ '^[a-z0-9-]+$'), name text not null,
 program text not null, summary text not null default '', visible boolean not null default false,
 code text, semester text, credits text, syllabus_version text,
 display_order integer not null default 0
);
create table public.hub_enrollments (
 student_id uuid references public.hub_accounts on delete cascade,
 course_id text references public.hub_courses, expires_at timestamptz,
 primary key(student_id,course_id)
);
create table public.hub_units (
 id uuid primary key default gen_random_uuid(), course_id text not null references public.hub_courses,
 title text not null check(length(title) between 1 and 200), display_order integer not null default 0,
 unique(id,course_id)
);
create table public.hub_resources (
 id uuid primary key default gen_random_uuid(), course_id text not null references public.hub_courses,
 unit_id uuid, title text not null check(length(title) between 1 and 180),
 description text not null default '' check(length(description)<=5000),
 category text not null check(category in ('Overview','Syllabus','Unit-wise Notes','Slides','Labs / Practical Work','Assignments','Question Bank','Past Questions','Solutions','References')),
 file_path text unique, filename text, mime text, size bigint check(size between 1 and 20971520),
 external_url text check(external_url is null or external_url ~ '^https://'),
 tags text[] not null default '{}', status text not null default 'draft' check(status in ('draft','published','archived')),
 release_at timestamptz, display_order integer not null default 0,
 preview_enabled boolean not null default true, download_enabled boolean not null default true,
 updated_at timestamptz not null default now(),
 foreign key(unit_id,course_id) references public.hub_units(id,course_id),
 check ((file_path is not null)::int + (external_url is not null)::int = 1)
);
create table public.hub_activity (
 student_id uuid not null references public.hub_accounts on delete cascade,
 resource_id uuid not null references public.hub_resources on delete cascade,
 bookmarked boolean not null default false, completed boolean not null default false,
 last_opened_at timestamptz, primary key(student_id,resource_id)
);
create table public.hub_announcements (
 id uuid primary key default gen_random_uuid(), course_id text references public.hub_courses,
 title text not null check(length(title) between 1 and 180), body text not null check(length(body) between 1 and 5000),
 is_public boolean not null default false, published boolean not null default false, created_at timestamptz not null default now()
);
create table public.hub_audit (
 id bigint generated always as identity primary key, actor_id uuid, action text not null,
 entity text not null, entity_id text, created_at timestamptz not null default now()
);
create table public.hub_rate_limits (actor_id uuid, window_start timestamptz, hits integer not null, primary key(actor_id,window_start));
create or replace function public.hub_active() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.hub_accounts a where a.id=auth.uid() and a.status='active'
 and (a.expires_at is null or a.expires_at>now()) and not a.must_change_password and a.credential_operation is null
 and a.credential_version::text=auth.jwt()->'app_metadata'->>'credential_version');
$$;
create or replace function public.hub_admin() returns boolean language sql stable security definer set search_path='' as $$
 select public.hub_active() and exists(select 1 from public.hub_accounts where id=auth.uid() and role='admin');
$$;
create or replace function public.hub_enrolled(cid text) returns boolean language sql stable security definer set search_path='' as $$
 select public.hub_active() and exists(select 1 from public.hub_enrollments where student_id=auth.uid() and course_id=cid and (expires_at is null or expires_at>now()));
$$;
create or replace function public.hub_resource_access(rid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.hub_resources r where r.id=rid and
 (public.hub_admin() or (public.hub_enrolled(r.course_id) and r.status='published' and (r.release_at is null or r.release_at<=now()))));
$$;
create or replace function public.hub_file_access(path text) returns boolean language sql stable security definer set search_path='' as $$
 select public.hub_admin() or exists(select 1 from public.hub_resources r where r.file_path=path and public.hub_resource_access(r.id) and (r.preview_enabled or r.download_enabled));
$$;
create or replace function public.hub_limit(actor uuid) returns boolean language plpgsql security definer set search_path='' as $$
 declare n integer;
 begin
 insert into public.hub_rate_limits values(actor,date_trunc('minute',now()),1)
 on conflict(actor_id,window_start) do update set hits=public.hub_rate_limits.hits+1 returning hits into n;
 return n<=20;
 end;
$$;
revoke all on function public.hub_limit(uuid) from public,anon,authenticated;
grant execute on function public.hub_limit(uuid) to service_role;
create or replace function public.hub_audit_change() returns trigger language plpgsql security definer set search_path='' as $$
 begin
 insert into public.hub_audit(actor_id,action,entity,entity_id)
 values(auth.uid(),TG_OP,TG_TABLE_NAME,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id',to_jsonb(new)->>'student_id',to_jsonb(old)->>'student_id'));
 if TG_OP='DELETE' then return old; end if;
 return new;
 end;
$$;
do $$
declare t text;
begin
 foreach t in array array['hub_accounts','hub_courses','hub_units','hub_enrollments','hub_resources','hub_announcements','hub_activity','hub_audit','hub_rate_limits'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 if t not in ('hub_activity','hub_audit','hub_rate_limits') then
 execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function public.hub_audit_change()',t);
 end if;
 end loop;
 -- Retire old permissive APIs without deleting their data.
 foreach t in array array['profiles','subjects','materials','notices','grades','assignments','contact_messages'] loop
 if to_regclass('public.'||t) is not null then execute format('revoke all on public.%I from anon,authenticated',t); end if;
 end loop;
end $$;
grant usage, select on sequence public.hub_audit_id_seq to service_role;
grant select on public.hub_courses, public.hub_announcements to anon,authenticated;
grant select on public.hub_accounts,public.hub_enrollments,public.hub_units,public.hub_resources,public.hub_activity,public.hub_audit to authenticated;
grant insert,update,delete on public.hub_courses,public.hub_units,public.hub_resources,public.hub_announcements,public.hub_activity to authenticated;
create policy account_read on public.hub_accounts for select to authenticated using(id=auth.uid() or public.hub_admin());
create policy enrollment_read on public.hub_enrollments for select to authenticated using(public.hub_admin() or (student_id=auth.uid() and public.hub_enrolled(course_id)));
create policy course_read on public.hub_courses for select using(visible or public.hub_admin() or public.hub_enrolled(id));
create policy course_admin on public.hub_courses for all to authenticated using(public.hub_admin()) with check(public.hub_admin());
create policy unit_read on public.hub_units for select to authenticated using(public.hub_admin() or public.hub_enrolled(course_id));
create policy unit_admin on public.hub_units for all to authenticated using(public.hub_admin()) with check(public.hub_admin());
create policy resource_read on public.hub_resources for select to authenticated using(public.hub_resource_access(id));
create policy resource_admin on public.hub_resources for all to authenticated using(public.hub_admin()) with check(public.hub_admin());
create policy activity_owner on public.hub_activity for all to authenticated using(student_id=auth.uid() and public.hub_resource_access(resource_id)) with check(student_id=auth.uid() and public.hub_resource_access(resource_id));
create policy announcement_read on public.hub_announcements for select using((published and is_public) or public.hub_admin() or (published and public.hub_enrolled(course_id)));
create policy announcement_admin on public.hub_announcements for all to authenticated using(public.hub_admin()) with check(public.hub_admin());
create policy audit_admin on public.hub_audit for select to authenticated using(public.hub_admin());
-- Restrictive policies close historical policies on old buckets as well.
-- Retire legacy policies that reference tables whose privileges were revoked.
drop policy if exists "published material files are readable" on storage.objects;
drop policy if exists "staff upload material files" on storage.objects;
drop policy if exists "staff update material files" on storage.objects;
drop policy if exists "staff delete material files" on storage.objects;
drop policy if exists "assignment owners and staff read files" on storage.objects;
drop policy if exists "students upload assignment files" on storage.objects;
drop policy if exists "assignment owners update files" on storage.objects;
drop policy if exists "assignment owners delete files" on storage.objects;
create policy retire_legacy_storage on storage.objects as restrictive for all to anon,authenticated
 using(bucket_id not in ('materials','assignments')) with check(bucket_id not in ('materials','assignments'));
update storage.buckets set public=false where id in ('materials','assignments');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('hub-materials','hub-materials',false,20971520,array['application/pdf','text/plain','application/zip','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation']);
create policy hub_storage_read_boundary on storage.objects as restrictive for select to anon,authenticated
 using(bucket_id<>'hub-materials' or public.hub_file_access(name));
create policy hub_storage_insert_boundary on storage.objects as restrictive for insert to anon,authenticated
 with check(bucket_id<>'hub-materials' or public.hub_admin());
create policy hub_storage_update_boundary on storage.objects as restrictive for update to anon,authenticated
 using(bucket_id<>'hub-materials' or public.hub_admin())
 with check(bucket_id<>'hub-materials' or public.hub_admin());
create policy hub_storage_delete_boundary on storage.objects as restrictive for delete to anon,authenticated
 using(bucket_id<>'hub-materials' or public.hub_admin());
create policy hub_storage_read on storage.objects for select to authenticated
 using(bucket_id='hub-materials' and public.hub_file_access(name));
create policy hub_storage_admin on storage.objects for all to authenticated
 using(bucket_id='hub-materials' and public.hub_admin()) with check(bucket_id='hub-materials' and public.hub_admin());
revoke all on function public.hub_active(),public.hub_admin(),public.hub_enrolled(text),public.hub_resource_access(uuid),public.hub_audit_change() from public;
revoke all on function public.hub_file_access(text) from public;
grant execute on function public.hub_file_access(text) to anon,authenticated,service_role;
grant execute on function public.hub_active(),public.hub_admin(),public.hub_enrolled(text),public.hub_resource_access(uuid) to anon,authenticated,service_role;
create index on public.hub_resources(course_id,status,release_at);
create index on public.hub_units(course_id,display_order);
commit;
