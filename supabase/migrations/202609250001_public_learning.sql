-- Public learning: only released, published resources in visible courses.
-- Apply after 202609190001_academic_hub.sql. No account data is made public.
begin;
create or replace function public.hub_public_resource(rid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.hub_resources r join public.hub_courses c on c.id=r.course_id
 where r.id=rid and c.visible and r.status='published' and (r.release_at is null or r.release_at<=now()));
$$;
revoke all on function public.hub_public_resource(uuid) from public;
grant execute on function public.hub_public_resource(uuid) to anon,authenticated,service_role;
create or replace function public.hub_file_access(path text) returns boolean language sql stable security definer set search_path='' as $$
 select public.hub_admin() or exists(select 1 from public.hub_resources r where r.file_path=path
 and (public.hub_public_resource(r.id) or public.hub_resource_access(r.id))
 and (r.preview_enabled or r.download_enabled));
$$;
grant select on public.hub_units,public.hub_resources to anon;
drop policy if exists public_unit_read on public.hub_units;
create policy public_unit_read on public.hub_units for select to anon,authenticated
 using(exists(select 1 from public.hub_courses c where c.id=course_id and c.visible));
drop policy if exists public_resource_read on public.hub_resources;
create policy public_resource_read on public.hub_resources for select to anon,authenticated
 using(public.hub_public_resource(id));
drop policy if exists hub_public_storage_read on storage.objects;
create policy hub_public_storage_read on storage.objects for select to anon,authenticated
 using(bucket_id='hub-materials' and exists(select 1 from public.hub_resources r
 where r.file_path=name and public.hub_public_resource(r.id) and (r.preview_enabled or r.download_enabled)));
-- Keep the bucket private; object SELECT policies govern public downloads.
-- Do not expose drafts, scheduled releases, grades, accounts, or submissions.
commit;
