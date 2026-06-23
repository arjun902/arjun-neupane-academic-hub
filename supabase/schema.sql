-- Supabase starter schema for the academic resource platform.
-- Run this in Supabase SQL Editor, then connect the app with .env.local.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'teacher', 'student')),
  program text,
  semester text,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  program text not null,
  semester text,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  program text not null,
  semester text,
  material_type text not null,
  file_path text,
  downloads integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  notice_type text not null,
  urgent boolean not null default false,
  published_at timestamptz not null default now()
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  assessment text not null,
  score numeric,
  max_score numeric,
  status text not null default 'pending',
  feedback text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.materials enable row level security;
alter table public.notices enable row level security;
alter table public.grades enable row level security;

create policy "public can read published subjects" on public.subjects for select using (true);
create policy "public can read published materials" on public.materials for select using (published = true);
create policy "public can read notices" on public.notices for select using (true);
create policy "students read own profile" on public.profiles for select using (auth.uid() = id);
create policy "students read own grades" on public.grades for select using (auth.uid() = student_id);
