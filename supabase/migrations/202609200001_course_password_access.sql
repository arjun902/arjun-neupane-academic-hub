-- Course-password access gateway. Existing accounts and data are preserved.
begin;

update storage.buckets set public=false where id='hub-materials';

alter table public.hub_resources drop constraint hub_resources_category_check;
alter table public.hub_resources add constraint hub_resources_category_check
check(category in ('Overview','Syllabus','Unit-wise Notes','Slides','Labs / Practical Work','Sample Code','Assignments','Question Bank','Past Questions','Solutions','References'));

create table public.hub_course_access_config (
  course_id text primary key references public.hub_courses(id) on delete cascade,
  password_hash text,
  enabled boolean not null default false,
  expires_at timestamptz,
  standard_minutes integer not null default 480 check (standard_minutes between 15 and 480),
  remembered_minutes integer not null default 10080 check (remembered_minutes between 60 and 10080),
  access_version bigint not null default 1 check (access_version > 0),
  updated_at timestamptz not null default now()
);

create table public.hub_course_sessions (
  id uuid primary key,
  course_id text not null references public.hub_courses(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  device_id uuid not null,
  access_version bigint not null,
  remembered boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create table public.hub_course_attempts (
  course_id text not null references public.hub_courses(id) on delete cascade,
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  window_seconds integer not null check (window_seconds in (900,3600)),
  window_start timestamptz not null,
  hits integer not null default 1 check (hits > 0),
  primary key (course_id,key_hash,window_seconds,window_start)
);

insert into public.hub_course_access_config(course_id)
select id from public.hub_courses
on conflict(course_id) do nothing;

create function public.hub_create_course_config() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.hub_course_access_config(course_id) values(new.id) on conflict do nothing;
  return new;
end;
$$;
revoke all on function public.hub_create_course_config() from public,anon,authenticated;
create trigger create_course_access_config after insert on public.hub_courses
for each row execute function public.hub_create_course_config();

-- Supabase may install pgcrypto in extensions rather than public. Resolve its
-- actual namespace once; every security-definer call stays schema-qualified.
do $migration$
declare crypto_schema text;
begin
  select n.nspname into crypto_schema from pg_extension e
  join pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto';
  execute format('create function public.hub_hash_password(value text) returns text language sql strict security definer set search_path='''' as %L',
    format('select %I.crypt(value,%I.gen_salt(''bf'',12))',crypto_schema,crypto_schema));
  execute format('create function public.hub_password_matches(value text,hash text) returns boolean language sql strict security definer set search_path='''' as %L',
    format('select %I.crypt(value,hash)=hash',crypto_schema));
end;
$migration$;

create or replace function public.hub_set_course_password(
  course_id_input text,
  password_input text
) returns bigint
language plpgsql security definer set search_path=''
as $$
declare next_version bigint;
begin
  if password_input is null or length(password_input) < 12 or octet_length(password_input) > 72 then
    raise exception 'Use at least 12 characters and no more than 72 UTF-8 bytes';
  end if;
  update public.hub_course_access_config
  set password_hash=public.hub_hash_password(password_input),
      access_version=access_version+1,
      updated_at=now()
  where course_id=course_id_input
  returning access_version into next_version;
  if next_version is null then raise exception 'Unknown course'; end if;
  update public.hub_course_sessions set revoked_at=coalesce(revoked_at,now())
  where course_id=course_id_input and revoked_at is null;
  return next_version;
end;
$$;

create or replace function public.hub_check_course_password(
  course_id_input text,
  password_input text
) returns boolean
language sql security definer set search_path=''
as $$
  select coalesce((
    select password_hash is not null
      and public.hub_password_matches(password_input,password_hash)
    from public.hub_course_access_config
    where course_id=course_id_input
  ),false);
$$;

create or replace function public.hub_validate_course_session(
  session_id_input uuid,
  token_hash_input text
) returns table(course_id text,expires_at timestamptz)
language sql security definer set search_path=''
as $$
  update public.hub_course_sessions s
  set last_used_at=now()
  from public.hub_course_access_config c
  where s.id=session_id_input
    and s.token_hash=token_hash_input
    and s.course_id=c.course_id
    and s.revoked_at is null
    and s.expires_at>now()
    and s.access_version=c.access_version
    and c.enabled
    and (c.expires_at is null or c.expires_at>now())
  returning s.course_id,s.expires_at;
$$;

create or replace function public.hub_take_course_attempt(
  course_id_input text,
  key_hash_input text,
  window_seconds_input integer,
  maximum_input integer
) returns table(allowed boolean,retry_after integer)
language plpgsql security definer set search_path=''
as $$
declare bucket timestamptz;
declare count_now integer;
begin
  if window_seconds_input not in (900,3600) or maximum_input not between 1 and 500 then
    raise exception 'Invalid rate limit';
  end if;
  bucket := to_timestamp(floor(extract(epoch from now())/window_seconds_input)*window_seconds_input);
  insert into public.hub_course_attempts(course_id,key_hash,window_seconds,window_start,hits)
  values(course_id_input,key_hash_input,window_seconds_input,bucket,1)
  on conflict(course_id,key_hash,window_seconds,window_start)
  do update set hits=public.hub_course_attempts.hits+1
  returning hits into count_now;
  return query select count_now<=maximum_input,
    greatest(1,ceil(extract(epoch from bucket + make_interval(secs=>window_seconds_input) - now()))::integer);
end;
$$;

create or replace function public.hub_revoke_course_sessions(course_id_input text)
returns bigint language plpgsql security definer set search_path=''
as $$
declare next_version bigint;
begin
  update public.hub_course_access_config
  set access_version=access_version+1,updated_at=now()
  where course_id=course_id_input
  returning access_version into next_version;
  if next_version is null then raise exception 'Unknown course'; end if;
  update public.hub_course_sessions set revoked_at=coalesce(revoked_at,now())
  where course_id=course_id_input and revoked_at is null;
  return next_version;
end;
$$;

-- Course materials now flow only through the course-access gateway. The
-- service role used by that gateway bypasses RLS; browsers cannot select them.
drop policy if exists unit_read on public.hub_units;
drop policy if exists resource_read on public.hub_resources;
drop policy if exists activity_owner on public.hub_activity;
drop policy if exists announcement_read on public.hub_announcements;
drop policy if exists course_read on public.hub_courses;
drop policy if exists hub_storage_read on storage.objects;

create or replace function public.hub_resource_access(rid uuid) returns boolean
language sql stable security definer set search_path=''
as $$ select public.hub_admin(); $$;
create or replace function public.hub_file_access(path text) returns boolean
language sql stable security definer set search_path=''
as $$ select public.hub_admin(); $$;

create policy course_read on public.hub_courses for select
using(visible or public.hub_admin());
create policy unit_read on public.hub_units for select to authenticated
using(public.hub_admin());
create policy resource_read on public.hub_resources for select to authenticated
using(public.hub_admin());
create policy activity_owner on public.hub_activity for select to authenticated
using(student_id=auth.uid());
create policy announcement_read on public.hub_announcements for select
using((published and is_public) or public.hub_admin());
create policy hub_storage_read on storage.objects for select to authenticated
using(bucket_id='hub-materials' and public.hub_admin());

alter table public.hub_course_access_config enable row level security;
alter table public.hub_course_sessions enable row level security;
alter table public.hub_course_attempts enable row level security;
revoke all on public.hub_course_access_config,public.hub_course_sessions,public.hub_course_attempts from public,anon,authenticated;
grant all on public.hub_course_access_config,public.hub_course_sessions,public.hub_course_attempts to service_role;

revoke all on function public.hub_set_course_password(text,text),
  public.hub_hash_password(text),public.hub_password_matches(text,text),
  public.hub_check_course_password(text,text),
  public.hub_validate_course_session(uuid,text),
  public.hub_take_course_attempt(text,text,integer,integer),
  public.hub_revoke_course_sessions(text) from public,anon,authenticated;
grant execute on function public.hub_set_course_password(text,text),
  public.hub_hash_password(text),public.hub_password_matches(text,text),
  public.hub_check_course_password(text,text),
  public.hub_validate_course_session(uuid,text),
  public.hub_take_course_attempt(text,text,integer,integer),
  public.hub_revoke_course_sessions(text) to service_role;

-- The config row lock makes password verification and session issuance atomic
-- with rotation, disablement and changes to the access policy.
create function public.hub_unlock_course(cid text,pass text,sid uuid,hashed_token text,remember boolean,device uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare cfg public.hub_course_access_config;
declare deadline timestamptz;
begin
  select * into cfg from public.hub_course_access_config where course_id=cid for share;
  if not found or not cfg.enabled or cfg.password_hash is null then
    return jsonb_build_object('error','Course access is not enabled. Contact your instructor.','code','unavailable');
  end if;
  if cfg.expires_at<=now() then
    return jsonb_build_object('error','Course access has expired. Contact your instructor.','code','expired');
  end if;
  if pass is null or octet_length(pass)>72 or not public.hub_password_matches(pass,cfg.password_hash) then
    return jsonb_build_object('error','Incorrect course password. Please try again.','code','invalid_password');
  end if;
  deadline := least(now()+make_interval(mins=>case when remember then cfg.remembered_minutes else cfg.standard_minutes end),cfg.expires_at);
  insert into public.hub_course_sessions(id,course_id,token_hash,device_id,access_version,remembered,expires_at)
  values(sid,cid,hashed_token,device,cfg.access_version,remember,deadline);
  return jsonb_build_object('expires_at',deadline);
end;
$$;

create function public.hub_course_content(sid uuid,hashed_token text,cid text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare grant_row record;
begin
  select * into grant_row from public.hub_validate_course_session(sid,hashed_token);
  if not found or grant_row.course_id<>cid then return null; end if;
  return jsonb_build_object(
    'expires_at',grant_row.expires_at,
    'course',(select to_jsonb(c) from public.hub_courses c where id=cid),
    'units',coalesce((select jsonb_agg(u order by u.display_order) from public.hub_units u where course_id=cid),'[]'::jsonb),
    'resources',coalesce((select jsonb_agg(to_jsonb(r)-'file_path'-'external_url' order by r.display_order,r.updated_at desc)
      from public.hub_resources r where course_id=cid and status='published' and (release_at is null or release_at<=now())),'[]'::jsonb),
    'announcements',coalesce((select jsonb_agg(jsonb_build_object('id',id,'title',title,'body',body) order by created_at desc)
      from public.hub_announcements where course_id=cid and published),'[]'::jsonb)
  );
end;
$$;

create function public.hub_course_file(sid uuid,hashed_token text,cid text,rid uuid,download boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare grant_row record;
begin
  select * into grant_row from public.hub_validate_course_session(sid,hashed_token);
  if not found or grant_row.course_id<>cid then return null; end if;
  return (select jsonb_build_object('file_path',file_path,'external_url',external_url,'filename',filename,'mime',mime)
    from public.hub_resources where id=rid and course_id=cid and status='published'
    and (release_at is null or release_at<=now())
    and (case when download then download_enabled else preview_enabled end));
end;
$$;

create function public.hub_update_course_access(cid text,access_enabled boolean,deadline timestamptz,standard integer,remembered integer)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.hub_course_access_config set enabled=access_enabled,expires_at=deadline,
    standard_minutes=standard,remembered_minutes=remembered,access_version=access_version+1,updated_at=now()
  where course_id=cid;
  if not found then raise exception 'Unknown course'; end if;
  update public.hub_course_sessions set revoked_at=now() where course_id=cid and revoked_at is null;
end;
$$;

create function public.hub_lock_course_device(sid uuid,hashed_token text) returns void
language sql security definer set search_path='' as $$
  update public.hub_course_sessions set revoked_at=now()
  where device_id=(select device_id from public.hub_course_sessions where id=sid and token_hash=hashed_token)
  and revoked_at is null;
$$;

revoke all on function public.hub_unlock_course(text,text,uuid,text,boolean,uuid),public.hub_lock_course_device(uuid,text),
  public.hub_course_content(uuid,text,text),public.hub_course_file(uuid,text,text,uuid,boolean),
  public.hub_update_course_access(text,boolean,timestamptz,integer,integer) from public,anon,authenticated;
grant execute on function public.hub_unlock_course(text,text,uuid,text,boolean,uuid),public.hub_lock_course_device(uuid,text),
  public.hub_course_content(uuid,text,text),public.hub_course_file(uuid,text,text,uuid,boolean),
  public.hub_update_course_access(text,boolean,timestamptz,integer,integer) to service_role;

create index hub_course_sessions_course_active_idx
  on public.hub_course_sessions(course_id,expires_at) where revoked_at is null;
create index hub_course_attempts_cleanup_idx on public.hub_course_attempts(window_start);

commit;
