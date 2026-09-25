> Historical uploaded proposal, preserved for reference. The final static redesign in [REDESIGN.md](REDESIGN.md) and [SETUP.md](SETUP.md) takes precedence. Screenshots in docs/previews show the prior uploaded version, not the final deployed redesign. The optional public-learning SQL now lives in supabase/optional-public-learning and is NOT applied automatically.

# Open Academic Hub — deployment guide

This update changes the student experience from assigned accounts to public learning resources. The source has been updated; your live GitHub Pages site and Supabase project have not been changed by this ZIP.

## 1. Update the existing GitHub repository

Extract this archive. Copy the contents of `arjun-neupane-academic-hub-main/` into the root of the existing repository, replacing matching files. Do not upload the enclosing folder as a new nested website. Commit the changes. Preserve your existing GitHub repository secrets.

## 2. Enable public reads in Supabase

For the existing portal schema, open Supabase SQL Editor and run:

`supabase/migrations/202609250001_public_learning.sql`

This is an additive, repeatable migration. It exposes released, published teaching resources from visible courses to anonymous readers, including existing published files. It does not expose drafts, scheduled future releases, hidden-course resources, accounts, grades, submissions, enrollment records, audit data, or personal activity. Staff editing continues to require an active admin account.

The `hub-materials` bucket must remain private. Anonymous downloads work through Storage SELECT policies, not a public bucket URL. Never solve missing access by making the whole bucket public or exposing a service-role key.

For a new database only, apply `202609190001_academic_hub.sql`, then `supabase/seed.sql`, then the public-learning migration. Do not rerun the initial schema against an already configured database.

## 3. Check GitHub Actions configuration

The existing workflow remains `.github/workflows/pages.yml` and uses manual dispatch.

Required repository secrets for online course materials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public/publishable key only)

Optional repository variables:
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_CONTACT_PHONE`

In GitHub: Actions → Deploy to GitHub Pages → Run workflow. GitHub Pages should use GitHub Actions as its source. The build keeps the `/arjun-neupane-academic-hub` base path and refresh-safe static pages.

## 4. Acceptance check after deployment

Open a private/incognito window:
1. Home → Explore courses → any subject, without a login.
2. Open `/login/`: it should move to Courses.
3. Open an existing `/student/#bca-c-programming` link: C Programming opens publicly.
4. Read and download a known published resource. Verify a draft/future file remains unavailable anonymously.
5. Refresh a direct course URL.
6. Use search, programme filters and the mobile menu.
7. `/admin/` still asks for staff sign-in at `/admin/login/`.

## Important content limitation

The supplied ZIP contains no actual teaching PDFs. Old bundled-PDF metadata refers to files absent from the archive; those legacy components are not used by the new public browser. Materials already uploaded to `hub-materials` are read through Supabase once the migration and existing build secrets are present. Empty courses display an honest empty state. No sample PDFs, fabricated unit outlines, or fake publication counts were added.

Without Supabase configuration, the six initial course descriptions still display and material pages show an empty state. If Supabase is configured but its API rejects the request, the page displays a retryable error. A successful site build does not prove the remote database migration has run.

## Course URLs

- `/courses/bca-digital-logic/`
- `/courses/bca-c-programming/`
- `/courses/csit-compiler-design/`
- `/courses/csit-cryptography/`
- `/courses/csit-discrete-mathematics/`
- `/courses/csit-numerical-methods/`

Additional database-created courses use `/student/#<course-id>` so they remain accessible without rebuilding static route definitions. Legacy subject URLs resolve to a matching initial course, or the catalogue when no equivalent exists. Semester-specific legacy addresses map to the current programme/subject collection; old semester distinctions are not invented.

## Local development and verification

```bash
npm ci --ignore-scripts
npm run dev
npm run typecheck
npm run typecheck:edge
npm run test:policies
npm run build:pages
npm run verify:export
```

`test:policies` tests both the original migration boundary and the new public-access migration, with clean and legacy database fixtures. Test output about anonymous denial in the original migration suite refers to the pre-update baseline; the public suite confirms the new behavior.

The older README/setup files document the prior account-based system. This guide takes precedence for the open-access update. The legacy student dashboard source is retained but is no longer mounted at `/student/`.

## Rollback

Revert the frontend commit. To revoke the newly added public database access, run the following in Supabase SQL Editor:

```sql
begin;
drop policy if exists hub_public_storage_read on storage.objects;
drop policy if exists public_resource_read on public.hub_resources;
drop policy if exists public_unit_read on public.hub_units;
revoke select on public.hub_units, public.hub_resources from anon;
create or replace function public.hub_file_access(path text) returns boolean language sql stable security definer set search_path='' as $$
 select public.hub_admin() or exists(select 1 from public.hub_resources r where r.file_path=path and public.hub_resource_access(r.id) and (r.preview_enabled or r.download_enabled));
$$;
drop function if exists public.hub_public_resource(uuid);
commit;
```

Previously downloaded public files cannot be recalled. Frontend and database rollbacks should be coordinated.
