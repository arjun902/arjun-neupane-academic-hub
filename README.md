# September 2026: Open Academic Hub update

Student login has been removed from public learning routes. **Start with [Open-access deployment](docs/OPEN_ACCESS_DEPLOYMENT.md)** for the required Supabase migration and GitHub Pages steps. See [Design blueprint](docs/ACADEMIC_DESIGN_BLUEPRINT.md) and [Verification](docs/OPEN_ACCESS_VERIFICATION.md). The earlier documentation below describes the previous account-based portal.

---

﻿# Arjun Neupane | Academic Hub

Phase-one academic website and private learning portal for Er. Arjun Neupane. The existing Next.js, TypeScript and Tailwind frontend is retained. Supabase Auth, Postgres row-level security (RLS), private Storage and a server-side Edge Function enforce access. GitHub Pages hosts only the static frontend.

Repository: [arjun902/arjun-neupane-academic-hub](https://github.com/arjun902/arjun-neupane-academic-hub). Intended Pages address: [Academic Hub](https://arjun902.github.io/arjun-neupane-academic-hub/). These changes have not been deployed; the live site may still show the earlier version.

## Scope

The initial catalogue contains exactly six courses:

| Programme | Courses |
| --- | --- |
| TU BCA | Digital Logic; C Programming |
| TU BSc CSIT | Compiler Design; Cryptography; Discrete Mathematics; Numerical Methods |

Official codes, semesters, credit hours, syllabus versions and unit names remain unassigned until the instructor verifies them. The admin can edit these fields and add future courses. This independent teaching website does not claim TU endorsement.

Public visitors see course summaries and explicitly public, published announcements. Students see their active enrollments, released published materials, course announcements and their own bookmarks/completion activity. The admin manages accounts, expiry, enrollments, courses, units, uploads, publication and a minimal audit trail. Assignments are downloadable resources; submissions, grading, payments and discussion are outside phase one.

No production materials or accounts are seeded. See [migration inventory](docs/MIGRATION.md) and [verification status](docs/VERIFICATION.md).

**Creating your first Supabase project?** Follow [the ordered setup guide](docs/SETUP.md), then run `npm.cmd run doctor` to check local configuration without displaying keys. `supabase/bootstrap-admin.sql` contains the one-time trusted admin setup script.

## Local frontend

Use Node.js 22 LTS and npm. From the repository root, in PowerShell:

```powershell
npm.cmd ci --ignore-scripts
Copy-Item .env.example .env.local
npm.cmd run dev
```

Open `http://localhost:3000`. Set these values in the ignored `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_CONTACT_PHONE=
```

Contact fields are optional. Without the Supabase URL/key, the public catalogue remains available and protected routes show an unavailable state. There is no development authentication bypass. Browser-visible Supabase keys rely on RLS; never put a service-role key, database password or student credentials in `NEXT_PUBLIC_*`, source code or GitHub Pages.

## Supabase setup

Use a project you control; setup does not require purchasing a service. Back up an existing deployment before changing it.

1. In Supabase SQL Editor, execute `supabase/migrations/202609190001_academic_hub.sql` once. `supabase/schema.sql` is a copy for manual setup: choose one, not both. The migration creates `hub_*` tables, authorization functions, policies, audit triggers and a private `hub-materials` bucket. It retains legacy table data while revoking old browser API grants and closes the old `materials` and `assignments` buckets.
2. Execute `supabase/seed.sql`. Its six course inserts are safe to repeat. It creates no users, units, resources or fabricated official metadata.
3. In Authentication settings, keep email/password sign-in enabled, turn **Allow new users to sign up** off, and disable anonymous sign-ins and unused providers. Hiding the signup UI alone is insufficient. See [Supabase Auth configuration](https://supabase.com/docs/guides/auth/general-configuration).
4. Keep automatic security email notifications disabled, including password-change notifications. Do not use invitation, magic-link or emailed recovery flows for this portal. Accounts use the Admin API with email already confirmed; the instructor manually provides credentials and resets. Optional security notifications are project settings: [email configuration](https://supabase.com/docs/guides/auth/auth-email-templates).
5. Set the Auth Site URL to `https://arjun902.github.io/arjun-neupane-academic-hub/` for production; allow the intended local URL during development. Password sign-in itself does not use emailed redirect links.
6. Review Authentication > Rate Limits. Password sign-in uses the provider's `/auth/v1/token` limit, shared with refresh requests. Choose a limit suitable for students sharing campus IP addresses, then verify 429 responses in staging. Current settings and configurable limits are documented in [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).

The repository's `supabase/config.toml` configures the Edge Function only; it does not apply hosted Auth dashboard settings. No Docker-backed local Supabase stack was available during implementation.

### Deploy the privileged function

With the Supabase CLI installed and authenticated, run these commands when backend deployment is authorized. Substitute your project reference:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ALLOWED_ORIGIN=https://arjun902.github.io --project-ref YOUR_PROJECT_REF
supabase functions deploy portal-admin --project-ref YOUR_PROJECT_REF
```

`ALLOWED_ORIGIN` is an origin, with no project path or trailing slash. For a separate development project use `http://localhost:3000`. The function accepts one browser origin. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in the hosted function environment; the service-role key stays there.

Gateway JWT verification is disabled for this function in `supabase/config.toml`; the handler verifies the bearer token with Auth, checks active account status/expiry and the token's credential version, and requires an admin for account-management operations. The password-change action is available to the authenticated account that needs it. CORS is not an authorization boundary.

Password changes and resets increment the credential version before changing Auth and use a per-account credential-operation lock. Old tokens fail authorization. A failed/interrupted operation remains closed. For recovery, a trusted operator must first confirm no credential function is still running, then clear only that account's credential_operation in SQL Editor while leaving must_change_password=true and never decreasing credential_version. Issue a new reset afterwards; an interrupted first-admin change requires trusted Dashboard password rotation and matching app metadata before another sign-in.

Privileged requests have a database-backed limit of 20 requests per account per minute, including password-change attempts. Rate-limit rows can be pruned by an operator after their minute has elapsed; they contain no passwords. Login rate limiting remains the Supabase Auth service's responsibility.

CAPTCHA is optional and **not integrated in this frontend**. Do not enable Supabase CAPTCHA until a Turnstile or hCaptcha widget and `captchaToken` handling are implemented and tested for both sign-in and password-change reauthentication. Keep the CAPTCHA secret on the provider. Enabling only the dashboard switch would break those flows. See [Supabase CAPTCHA setup](https://supabase.com/docs/guides/auth/auth-captcha).

### Provision the first administrator

Use the trusted Supabase Dashboard, not a browser-facing role selector. In Authentication > Users, **create** a user with the instructor email and a strong temporary password, confirming the email during creation. Do not send an invitation. Then run this once in SQL Editor after replacing the email and display name:

```sql
do $$
declare
  instructor_id uuid;
begin
  select id into instructor_id
  from auth.users
  where lower(email) = lower('instructor@example.com');

  if instructor_id is null then
    raise exception 'Create the instructor Auth user first';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                         || '{"credential_version":1}'::jsonb
  where id = instructor_id;

  insert into public.hub_accounts
    (id, full_name, email, role, status, must_change_password, credential_version)
  select id, 'Er. Arjun Neupane', email, 'admin', 'active', true, 1
  from auth.users where id = instructor_id;
end $$;
```

This bootstrap intentionally fails if the portal account already exists; the SQL block is atomic. Do not reset an existing account's credential version to 1. The `app_metadata.credential_version` claim must match `hub_accounts.credential_version`; user-editable metadata is not accepted for authorization. Start a fresh sign-in after provisioning, change the temporary password, then sign in with the new password. Until that change succeeds, database/storage policies deny protected resources and admin actions.

Both password changes and instructor resets advance the database credential version before changing Auth credentials. If an Auth update fails partway through, access stays closed rather than accepting an old token. Follow the credential-operation recovery procedure above before retrying. An interrupted first-admin change may require trusted dashboard/Admin API recovery; reconcile Auth metadata and account state without lowering the version or bypassing the required password change.

## Instructor workflow

1. Sign in at `/login/` and open `/admin/`. Under **Students**, enter a student's name/email and optional account expiry. Creation generates a temporary password and displays it once in the current session. Provide it manually, then dismiss it. It cannot be retrieved later; Reset generates a new one if needed.
2. Assign one or more courses and optional enrollment expiry. Students must change their temporary password before accessing materials. Account and enrollment expiry are independent; either can deny access.
3. Edit a student to suspend/reactivate access or extend account expiry. Revoke an enrollment to remove one course. Resetting credentials increments the credential version and requires another password change; earlier tokens stop satisfying portal authorization.
4. Under **Courses & units**, manage course metadata and unit order. Keep official fields blank until verified. Enter teaching content in English or Nepali as needed.
5. Under **Materials**, choose a course, optional unit and category. Drop/select a file or enter an HTTPS external reference, add metadata, and save a draft. Review before publishing; a future release time hides even published solutions until that time.
6. Edit/replace to keep a material's resource ID, bookmarks and completion history. Set display order, preview/download availability, tags and release time. Unpublish to return to draft, or archive with confirmation. Announcements appear publicly only when both published and explicitly public.

Uploads accept PDF, text/source code (`.txt`, `.c`, `.h`, `.cpp`, `.py`, `.java`), ZIP, PNG/JPEG, DOCX and PPTX, up to 20 MiB per file. Browser validation and bucket MIME/size limits are present; there is no malware scanning service. Upload only reviewed teaching files. Code is displayed as escaped text with basic highlighting/copy support and is never executed.

Upload progress measures transfer, followed by saving metadata. If a metadata response fails, the client checks the resource ID/path to reconcile the outcome. When the outcome cannot be confirmed, it retains the new object privately rather than deleting a file that may already be referenced. Replacements switch metadata only after a successful upload and then remove the previous file. Interrupted uploads or cleanup failures may leave unlinked private objects for an operator to reconcile; verify references before removing any object.

Students search only metadata their RLS permissions returned, filter by course/unit/category/type, sort by date or unit, preview supported files, download, bookmark and mark resources complete. These are activity markers, not evidence of mastery. PDF/image/text previews use authenticated downloads followed by temporary browser blob URLs. No signed URLs are created by the app. Downloaded or previewed files can be copied; hiding the download action cannot prevent this. HTTPS external references are hosted elsewhere and are not private portal assets.

## Build and manual GitHub Pages deployment

Run local checks:

```powershell
npm.cmd run typecheck
npm.cmd run check
npm.cmd run test:policies
npm.cmd run typecheck:edge
$env:GITHUB_PAGES = 'true'
$env:NEXT_OUTPUT = 'export'
$env:NEXT_PUBLIC_BASE_PATH = '/arjun-neupane-academic-hub'
$env:NEXT_PUBLIC_SITE_URL = 'https://arjun902.github.io/arjun-neupane-academic-hub'
npm.cmd run build
npm.cmd run verify:export
# Or use npm.cmd run build:pages to set Pages build values automatically.
```

Restart the terminal or clear those build-specific environment values before returning to local development. The export is in `out/`. `next.config.mjs` uses the project base path and trailing-slash HTML routes; the resource explorer uses the already-exported student page. Exported routes do not require a catch-all rewrite.

`.github/workflows/pages.yml` runs only by manual `workflow_dispatch`, not on pushes. In Repository settings > Pages, select GitHub Actions. Add repository secrets `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus optional contact repository variables. After backend configuration, verification and explicit release approval, manually run **Deploy to GitHub Pages**. Never add the service-role key to this workflow.

The separate Verify academic portal workflow runs type checks, fresh/legacy SQL policy tests and export checks on pushes and pull requests without deploying.

GitHub Pages does not apply the HTTP security headers configured for a Next.js server. Authorization relies on Supabase regardless of host; if strict response-header controls are needed, use a host or proxy that supports them. Keep source maps, private files and secrets out of deployment artifacts. Deployment has not been run as part of this work.

## Backup and restore

Maintain encrypted backups outside this repository. Record the migration revision, Auth/function configuration and a private object inventory with sizes/checksums. Database backups do **not** include Storage file bytes: back up `hub-materials` separately using a trusted administrative Storage/S3 client. See [database backup scope](https://supabase.com/docs/guides/platform/backups) and [Storage downloads](https://supabase.com/docs/guides/storage/management/download-objects).

Back up the database including relevant Auth identities and `hub_*` rows, preserving UUID relationships. Never commit database dumps, credential material or private files. A catalogue seed is not a backup. Follow [Supabase's backup/restore procedure](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) for a full database transfer.

Restore first into an isolated project: restore the database and private objects under their original keys, verify `hub-materials.public = false`, reapply configuration and deploy the Edge Function. Check missing files/orphan objects against `hub_resources.file_path`. Re-provision server secrets separately, disable public registration/automatic emails again, and test the access matrix before changing frontend connection settings. Keep the old backup until the restore is proven. Restoring older account/credential-version data can revive older permissions; review access and rotate/reset affected credentials before releasing a restored service.

## Remaining release work

Configure the real Supabase project, apply migration/seed, deploy the function, provision the instructor, and perform the hosted end-to-end and browser checks in [VERIFICATION.md](docs/VERIFICATION.md). Review rights for the eight quarantined PDFs in [MIGRATION.md](docs/MIGRATION.md) before uploading any. Supply verified syllabi, your own notes/slides, lab sheets, sample programs, assignments and practice questions first; keep solutions scheduled or unpublished until intended release.
