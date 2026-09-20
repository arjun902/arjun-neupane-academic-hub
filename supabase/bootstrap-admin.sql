-- Trusted SQL Editor only, after the migration and seed.
-- First CREATE (do not invite) the instructor in Authentication > Users.
-- Replace the email below. No password belongs in this file or SQL script.
do $$
declare
  instructor_email text := 'REPLACE_WITH_YOUR_EMAIL';
  instructor_id uuid;
begin
  if instructor_email = 'REPLACE_WITH_YOUR_EMAIL' then
    raise exception 'Replace instructor_email before running this script';
  end if;
  select id into instructor_id from auth.users where lower(email)=lower(instructor_email);
  if instructor_id is null then
    raise exception 'Create the instructor Auth user first';
  end if;
  if exists(select 1 from public.hub_accounts where id=instructor_id) then
    raise exception 'Portal account already exists; bootstrap must not reset an existing account';
  end if;
  update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"credential_version":1}'::jsonb where id=instructor_id;
  insert into public.hub_accounts(id,full_name,email,role,status,must_change_password,credential_version)
  select id,'Er. Arjun Neupane',email,'admin','active',true,1 from auth.users where id=instructor_id;
end $$;
