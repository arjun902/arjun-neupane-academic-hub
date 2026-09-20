-- Production-oriented Supabase schema for the academic resource platform.
-- Run this in Supabase SQL Editor. It is safe to re-run after the starter schema.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role text not null default 'student' check (role in ('admin', 'teacher', 'student')),
  program text,
  semester text,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  program text not null,
  semester text,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(title) between 3 and 180),
  program text not null,
  semester text,
  material_type text not null,
  file_path text,
  downloads integer not null default 0 check (downloads >= 0),
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.materials alter column published set default false;

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  body text not null check (char_length(body) between 3 and 5000),
  notice_type text not null,
  urgent boolean not null default false,
  published boolean not null default false,
  published_at timestamptz not null default now()
);

alter table public.notices add column if not exists published boolean not null default false;

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  assessment text not null check (char_length(assessment) between 2 and 180),
  score numeric check (score is null or score >= 0),
  max_score numeric check (max_score is null or max_score > 0),
  status text not null default 'pending',
  feedback text check (feedback is null or char_length(feedback) <= 5000),
  updated_at timestamptz not null default now(),
  check (score is null or max_score is null or score <= max_score)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(title) between 3 and 180),
  file_path text not null,
  status text not null default 'submitted' check (status in ('submitted', 'in_review', 'changes_requested', 'reviewed')),
  feedback text check (feedback is null or char_length(feedback) <= 5000),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  program text check (program is null or char_length(program) <= 80),
  purpose text not null check (char_length(purpose) between 2 and 80),
  subject text not null check (char_length(subject) between 3 and 180),
  message text not null check (char_length(message) between 10 and 5000),
  website text,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists materials_published_idx on public.materials (published, updated_at desc);
create index if not exists notices_published_idx on public.notices (published, published_at desc);
create index if not exists grades_student_idx on public.grades (student_id, updated_at desc);
create index if not exists assignments_student_idx on public.assignments (student_id, submitted_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to anon, authenticated;

create or replace function public.can_submit_contact(candidate_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 3
  from public.contact_messages
  where lower(email) = lower(candidate_email)
    and created_at > now() - interval '1 hour';
$$;

revoke all on function public.can_submit_contact(text) from public;
grant execute on function public.can_submit_contact(text) to anon, authenticated;

create or replace function public.can_upload_assignment_file()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 50
  from storage.objects
  where bucket_id = 'assignments'
    and (storage.foldername(name))[1] = auth.uid()::text;
$$;

revoke all on function public.can_upload_assignment_file() from public;
grant execute on function public.can_upload_assignment_file() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    case
      when char_length(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1))) >= 2
        then left(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)), 120)
      else 'Student'
    end,
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.materials enable row level security;
alter table public.notices enable row level security;
alter table public.grades enable row level security;
alter table public.assignments enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "students read own profile" on public.profiles;
drop policy if exists "profiles are visible to owner and staff" on public.profiles;
create policy "profiles are visible to owner and staff" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "public can read published subjects" on public.subjects;
drop policy if exists "subjects are public" on public.subjects;
create policy "subjects are public" on public.subjects for select to anon, authenticated using (true);
drop policy if exists "staff manage subjects" on public.subjects;
create policy "staff manage subjects" on public.subjects
  for all to authenticated
  using (public.current_user_role() in ('admin', 'teacher'))
  with check (public.current_user_role() in ('admin', 'teacher'));

drop policy if exists "public can read published materials" on public.materials;
drop policy if exists "published materials are public" on public.materials;
create policy "published materials are public" on public.materials
  for select to anon, authenticated
  using (published or public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "staff manage materials" on public.materials;
create policy "staff manage materials" on public.materials
  for all to authenticated
  using (public.current_user_role() in ('admin', 'teacher'))
  with check (public.current_user_role() in ('admin', 'teacher'));

drop policy if exists "public can read notices" on public.notices;
drop policy if exists "published notices are public" on public.notices;
create policy "published notices are public" on public.notices
  for select to anon, authenticated
  using ((published and published_at <= now()) or public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "staff manage notices" on public.notices;
create policy "staff manage notices" on public.notices
  for all to authenticated
  using (public.current_user_role() in ('admin', 'teacher'))
  with check (public.current_user_role() in ('admin', 'teacher'));

drop policy if exists "students read own grades" on public.grades;
drop policy if exists "grade access follows role" on public.grades;
create policy "grade access follows role" on public.grades
  for select to authenticated
  using (auth.uid() = student_id or public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "staff manage grades" on public.grades;
create policy "staff manage grades" on public.grades
  for all to authenticated
  using (public.current_user_role() in ('admin', 'teacher'))
  with check (public.current_user_role() in ('admin', 'teacher'));

drop policy if exists "students read own assignments" on public.assignments;
create policy "students read own assignments" on public.assignments
  for select to authenticated
  using (auth.uid() = student_id or public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "students submit assignments" on public.assignments;
create policy "students submit assignments" on public.assignments
  for insert to authenticated
  with check (auth.uid() = student_id and status = 'submitted');
drop policy if exists "students edit pending assignments" on public.assignments;
drop policy if exists "students delete pending assignments" on public.assignments;
create policy "students delete pending assignments" on public.assignments
  for delete to authenticated
  using (auth.uid() = student_id and status = 'submitted');
drop policy if exists "staff manage assignments" on public.assignments;
create policy "staff manage assignments" on public.assignments
  for all to authenticated
  using (public.current_user_role() in ('admin', 'teacher'))
  with check (public.current_user_role() in ('admin', 'teacher'));

drop policy if exists "visitors submit contact messages" on public.contact_messages;
create policy "visitors submit contact messages" on public.contact_messages
  for insert to anon, authenticated
  with check (
    char_length(name) between 2 and 120
    and char_length(email) between 5 and 254
    and char_length(subject) between 3 and 180
    and char_length(message) between 10 and 5000
    and coalesce(website, '') = ''
    and status = 'new'
    and public.can_submit_contact(email)
  );
drop policy if exists "admins manage contact messages" on public.contact_messages;
create policy "admins manage contact messages" on public.contact_messages
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

revoke all on public.profiles, public.subjects, public.materials, public.notices, public.grades, public.assignments, public.contact_messages from anon, authenticated;
grant select on public.subjects, public.materials, public.notices to anon, authenticated;
grant select on public.profiles, public.grades, public.assignments, public.contact_messages to authenticated;
grant insert (name, email, program, purpose, subject, message, website) on public.contact_messages to anon, authenticated;
grant insert, update, delete on public.subjects, public.materials, public.notices, public.grades, public.assignments to authenticated;
grant insert, update, delete on public.profiles, public.contact_messages to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materials', 'materials', false, 20971520,
  array['application/pdf', 'text/plain', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assignments', 'assignments', false, 10485760,
  array['application/pdf', 'text/plain', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "published material files are readable" on storage.objects;
create policy "published material files are readable" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'materials'
    and (exists (select 1 from public.materials where file_path = name and published) or public.current_user_role() in ('admin', 'teacher'))
  );
drop policy if exists "staff upload material files" on storage.objects;
create policy "staff upload material files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'materials' and public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "staff update material files" on storage.objects;
create policy "staff update material files" on storage.objects
  for update to authenticated
  using (bucket_id = 'materials' and public.current_user_role() in ('admin', 'teacher'))
  with check (bucket_id = 'materials' and public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "staff delete material files" on storage.objects;
create policy "staff delete material files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'materials' and public.current_user_role() in ('admin', 'teacher'));

drop policy if exists "assignment owners and staff read files" on storage.objects;
create policy "assignment owners and staff read files" on storage.objects
  for select to authenticated
  using (bucket_id = 'assignments' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_role() in ('admin', 'teacher')));
drop policy if exists "students upload assignment files" on storage.objects;
create policy "students upload assignment files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text and public.can_upload_assignment_file());
drop policy if exists "assignment owners update files" on storage.objects;
create policy "assignment owners update files" on storage.objects
  for update to authenticated
  using (bucket_id = 'assignments' and public.current_user_role() in ('admin', 'teacher'))
  with check (bucket_id = 'assignments' and public.current_user_role() in ('admin', 'teacher'));
drop policy if exists "assignment owners delete files" on storage.objects;
create policy "assignment owners delete files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'assignments'
    and (
      public.current_user_role() in ('admin', 'teacher')
      or (
        (storage.foldername(name))[1] = auth.uid()::text
        and (
          not exists (select 1 from public.assignments where file_path = name)
          or exists (
            select 1 from public.assignments
            where file_path = name and student_id = auth.uid() and status = 'submitted'
          )
        )
      )
    )
  );
