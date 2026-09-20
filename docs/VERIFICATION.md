# Verification and release checks

This document separates code-level verification from hosted-service and browser verification. A successful static build does not prove Supabase Auth, HTTP Storage behavior or a configured deployment.

## Current status

| Check | Status |
| --- | --- |
| TypeScript | Local `npm run typecheck` passed. |
| Production Pages export | Local production build with the Pages project path passed. |
| PostgreSQL policy harness | `node scripts/test-policies.mjs`: 24 checks passed on each of a fresh schema and the legacy upgrade path (48 executions total) on 2026-09-20. |
| Export verification | 56 HTML files and 33 unique links/assets checked; refresh-safe portal routes present; no protected files/source maps or detected secret values. |
| Edge Function typecheck | Local TypeScript check passed against the installed SDK with a Deno type adapter; hosted Deno execution not tested. |
| Dependency audit | Full npm audit: zero vulnerabilities after compatible updates. |
| Setup checker | `npm run doctor` correctly reports missing project URL/key. Five local acceptance checks covered public/anon keys, service-role/secret rejection and missing keys without disclosing values. |
| Local HTTP integration harness | `scripts/test-supabase-local.mjs` syntax and missing/nonlocal-configuration guards passed. Its eleven Auth/Storage/Edge scenarios were not executed: no local stack was configured. |
| Hosted Supabase migration, Auth, Edge Function and Storage HTTP | Not run: project credentials/configuration were unavailable. |
| Docker-backed Supabase integration | Not run: Docker was unavailable. |
| Desktop/mobile browser screenshots and interaction checks | Not run: browser automation was unavailable. No screenshots are represented as inspected. |
| Live GitHub Pages release | Not run; deployment is a separate authorized action. |

The PostgreSQL harness uses PGlite to execute the actual migration and seed with minimal `auth`/`storage` schemas and injected JWT claims. It excludes only the unused `pgcrypto` extension declaration because `gen_random_uuid()` is already available. This exercises SQL permissions and RLS, not a mocked JavaScript authorization function. Passing checks cover anonymous denial; course, resource and storage-path isolation; overly broad historical storage SELECT/DELETE policies; suspension; account/enrollment expiry; required password change; stale credential versions; draft/scheduled material restrictions; denied role/enrollment writes; private activity; serialization of credential operations; and explicit public-announcement marking. It does not run Supabase Auth, the Edge Function, JWT signature verification, actual Storage uploads/downloads or browser interactions.

For first-time project setup, follow [SETUP.md](SETUP.md). Once connected, `npm.cmd run doctor -- --remote` makes read-only checks; it does not replace authenticated tests. For a disposable local Supabase stack, run `npm.cmd run test:supabase:local -- --help`. That harness reads only explicit local-test configuration, refuses cloud endpoints, creates synthetic fixtures, and cleans up only the fixture IDs from that run. Its setup-blocked result is not a passing integration test.

## Repeat local checks

```powershell
npm ci --ignore-scripts
npm run typecheck
npm run check
npm run test:policies
npm run typecheck:edge
$env:GITHUB_PAGES = 'true'
$env:NEXT_OUTPUT = 'export'
$env:NEXT_PUBLIC_BASE_PATH = '/arjun-neupane-academic-hub'
$env:NEXT_PUBLIC_SITE_URL = 'https://arjun902.github.io/arjun-neupane-academic-hub'
npm run build
npm run verify:export
```

`npm run check` includes an npm production dependency audit and needs registry access. Use an isolated test project for the following checks and original disposable teaching files. Keep service-role keys out of browser requests and student test clients; they bypass policies.

## Hosted authorization matrix

Prepare one instructor, two students assigned different courses, a published file, a draft file and a published solution with a future release time. Keep a second browser session/token for testing stale sessions. Record results and dates in a private log without passwords or bearer tokens.

| Scenario | Required result |
| --- | --- |
| No session: query protected metadata/activity and private file paths | No protected rows or file bytes. Public course summaries and explicitly public, published announcements remain readable. |
| Student A changes course/resource ID or Storage path to B's course | No metadata or file access for the other course's private material. |
| Student reads own active course | Only published resources whose release time has arrived, plus permitted course announcements. |
| Account suspended or expired, using an existing JWT | New protected metadata and file requests denied by policies. |
| Enrollment revoked or expired | That course's protected requests denied; other valid enrollments remain usable. |
| Student changes role/status/expiry, adds an enrollment, publishes a file or invokes an admin action | Rejected server-side; no elevation or data change. |
| Temporary password, before required change | Sign-in may succeed, but protected resources/admin actions remain blocked. Current-password verification and a different password of at least 12 characters are required. |
| Instructor resets student credentials | Temporary credential shown once; old password fails; earlier token version is rejected; new sign-in must change the password. |
| Missing/forged/malformed bearer token to `portal-admin` | Identity validation fails; no service-role operation executes. |
| More than 20 verified account requests to `portal-admin` per minute | Additional requests return HTTP 429; access resumes in a later window. |
| Draft or unreleased solution, guessed ID/path | No student metadata or bytes before release; active instructor can manage it. |
| Student A bookmarks/completes an allowed resource | Saved and reloadable only as A; B cannot read/change A's activity. |
| Announcement is private or unpublished | No anonymous announcement content. |
| Old file URLs and legacy Storage buckets | No unauthenticated content after migration and approved redeployment. |

A blocked student can read their own minimal account row so the UI can explain the account state. This does not grant access to materials. Course summaries intentionally remain public.

## Authentication and content workflow

1. Bootstrap the instructor as documented in the README. Complete first-password change and fresh sign-in. Create a student without sending email; confirm the temporary credential disappears after dismissal/reload.
2. Assign a course/expiry, sign in as the student, change the initial password, then sign in again. Reject an incorrect current password and a weak/same new password.
3. Upload a small original PDF as draft. Reject oversized and unsupported files. Observe real progress and readable retry errors during interrupted network access.
4. Publish, search title/tags, filter course/unit/category/type, preview and download. Repeat with text/code, images, ZIP and Office files; unsupported previews should offer downloads when enabled. Check Unicode text.
5. Replace a resource and confirm its ID/activity remain stable. Simulate upload/metadata failure: the previous published record must remain usable; reconcile unlinked private objects. Archive and verify students lose subsequent access.
6. Verify bookmarks, completion counts and recent/continue activity across reloads and separate users. Opening a file must not automatically assert mastery/completion.
7. Reset credentials, suspend access and revoke enrollment with an already-open student tab. Test backend requests directly as well as the UI. Downloaded bytes cannot be recalled.
8. Sign out, refresh, use browser back and ensure protected components do not reopen with a usable session. Test sign-out failure messaging. Supabase access JWTs can remain valid until expiry after ordinary sign-out; do not claim immediate cryptographic revocation. Portal suspension, expiry and credential-reset checks provide separate database-side denial. See [Supabase sign-out behavior](https://supabase.com/docs/guides/auth/signout).

The app generates no signed URLs; previews use authenticated downloads and local blob URLs. If signed links are added later, authorization must precede signing, expiry must be short, and copied links can remain usable until expiry.

## Browser and export checks before release

- Capture and inspect home, login, student dashboard/resource explorer and admin Materials at desktop (1440 x 900) and mobile (390 x 844) sizes using authorized test data. Check empty/error states too.
- Test keyboard navigation, visible focus, labels, preview close behavior, reduced motion, long Nepali/English titles and overflow. Check contrast and touch targets.
- Open and refresh home, `/courses/`, `/login/`, `/student/` and `/admin/` under the `/arjun-neupane-academic-hub/` prefix on a static server. Confirm links/assets retain the prefix and role redirects avoid 404s.
- Inspect `out/` for protected files, stale private metadata, credential-shaped values, unexpected source maps and private migration content. Watch signed-out network traffic: no protected records, file locations or private announcements should appear. Public Supabase URL/anon key values are expected.
- Verify public registration/anonymous sign-ins are off, automatic security email notifications are off, and provider rate limits work. Confirm the tested workflow sends no invitation, recovery or credential email.
- Review actual project RPCs/views and legacy integrations for exposure beyond the retired tables/buckets. Rerun the matrix after restoring the database or changing policies.

## Operational limits

CAPTCHA widget/token integration is not present; enabling provider CAPTCHA first would break sign-in/password reauthentication. File validation covers extension/MIME/size, not malware scanning. Previews/downloads can be copied, and external URLs are not secured by the portal. GitHub Pages cannot apply server-only response headers. Hosted authorization and visual behavior still require the checks above; missing configuration never activates fake production authentication.
