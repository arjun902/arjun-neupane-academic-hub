# Arjun Neupane | Academic Hub

Next.js, TypeScript and Tailwind website with shared course-password access. GitHub Pages hosts the frontend; Supabase Postgres, private Storage and Edge Functions authorize protected content. Administrator authentication stays separate.

[Website](https://arjun902.github.io/arjun-neupane-academic-hub/) · [Repository](https://github.com/arjun902/arjun-neupane-academic-hub) · [Setup](docs/SETUP.md) · [Instructor guide](docs/COURSE_ACCESS.md) · [Verification](docs/VERIFICATION.md) · [Content migration](docs/MIGRATION.md)

**Supabase backend configuration is still required.** Publishing the frontend to GitHub Pages makes the password-only screens available; materials remain locked until the backend is configured. Check the repository's Pages workflow for the latest deployment status.

## Workflow

Exactly six courses: TU BCA Digital Logic and C Programming; TU BSc CSIT Compiler Design, Cryptography, Discrete Mathematics and Numerical Methods.

Students select a course and enter its instructor-provided password. No email, registration or personal account is required. Each course opens directly, with published/released materials, search, units/collections, announcements, previews/downloads and browser-local bookmarks/completion. Course cards show Continue Learning only after server validation. Legacy login/student links guide visitors to course access; Instructor Login remains separate.

Anyone receiving a shared password may use it. This does not identify individual students, prevent sharing or support blocking one person. Grades, personal records and submissions must not enter this library.

Admin controls set/generate/rotate passwords, enable/disable access, configure expiry/durations and revoke sessions. Existing account/role administration and material management remain. Legacy student accounts, enrollments and activity are preserved, but no longer authorize course materials.

Collections: Overview, Syllabus, Unit-wise Notes, Slides, Labs / Practical Work, Sample Code, Assignments, Question Bank, Past Questions, Solutions and References. No teaching files or fabricated official syllabus metadata are seeded.

## Development

Use Node.js 22 and PowerShell:

```powershell
npm.cmd ci --ignore-scripts
# Only copy if .env.local does not already exist:
Copy-Item .env.example .env.local
npm.cmd run dev
```

Set the public Supabase URL and publishable/anon key in ignored .env.local. Never put service-role credentials, database passwords or course passwords in frontend configuration. Missing configuration fails closed.

## Backend

For a new project, run in order:

1. supabase/migrations/202609190001_academic_hub.sql
2. supabase/seed.sql
3. supabase/migrations/202609200001_course_password_access.sql

Existing phase-one projects apply only the new migration. supabase/schema.sql is a fresh-install snapshot of both migrations and seed; do not run both methods.

Deploy both portal-admin and course-access when authorized. Both implement explicit handler authorization with verify_jwt=false: verified Supabase Auth/admin privileges for portal-admin, opaque course sessions for course-access. CORS is not authorization. See [SETUP.md](docs/SETUP.md).

## Security design

- Independently salted pgcrypto bcrypt hashes (cost 12), server-only. Passwords: 12+ characters, maximum 72 UTF-8 bytes.
- Random 256-bit course bearer secrets; database stores only SHA-256 token hashes.
- Every metadata/file request checks token hash, course scope, absolute expiry, course enabled status, revocation and access version.
- Browser clients cannot read secret/session/rate tables or invoke service-only RPCs. Direct resource/unit/Storage access remains admin-only; students use the gateway.
- Only published/released resources. Metadata omits file paths/external URLs; file authorization produces 60-second signed URLs.
- Default 8-hour standard and 7-day remembered sessions, configurable downward. Course expiry caps either. Rotation/config updates increment version and revoke sessions.
- GitHub Pages is cross-origin with Supabase: opaque bearer tokens use sessionStorage, or localStorage only when Remember is checked. Passwords, hashes and protected content never go into browser storage. The [guide](docs/COURSE_ACCESS.md) documents XSS/cookie trade-offs.
- Limits: 8 attempts per course/device per 15-minute window, plus 500 per course/network per hour. No global course lock. Trusted proxy IP behavior must be verified on deployment.
- No automatic password messages, analytics, service worker or secret logging. Gateway responses and browser file fetches request no-store.

## Checks and release

```powershell
npm.cmd run typecheck
npm.cmd run typecheck:edge
npm.cmd run test:policies
npm.cmd run build:pages
npm.cmd run verify:export
npm.cmd run doctor
npm.cmd run test:supabase:local -- --help
```

Policy tests execute actual migrations, pgcrypto and RPCs in PGlite, and actual Edge handler source through explicit SQL/Storage/Auth adapters. Hosted Auth/Storage HTTP and browser inspection remain separate checks.

Pages deployment uses manual workflow_dispatch. Configure public URL/key repository secrets and release only after backend setup, acceptance tests and authorization. All six course routes export with the project base path and refresh-safe trailing slashes.

Back up database and private Storage bytes separately outside Git. Restore in isolation, reapply settings and revoke/rotate restored sessions. Downloaded files cannot be recalled, and issued links may work until expiry. See [migration inventory](docs/MIGRATION.md) for previously public PDFs.
