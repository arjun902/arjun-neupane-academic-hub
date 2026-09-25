# First Supabase setup

The course-password implementation is ready locally. The project URL/public key are not configured. Protected access fails closed. Keep passwords and service-role credentials out of chat and Git.

## 1. Create your project

Open [Supabase Dashboard](https://supabase.com/dashboard), create your own project, choose a nearby region and save its database password privately. Use an available free plan; no purchase is required by this code. Do not accept account terms or enter credentials through chat.

## 2. Apply database setup

In SQL Editor run these files in order, once:

1. supabase/migrations/202609190001_academic_hub.sql
2. supabase/seed.sql
3. supabase/migrations/202609200001_course_password_access.sql

An existing phase-one database needs only step 3. Back it up first. The new migration preserves accounts, enrollments, activity and teaching content, while moving student material access to the gateway.

For a fresh project, supabase/schema.sql is an alternative combined snapshot with seed. Do not run both methods.

Check that hub-materials, materials and assignments buckets are private. Do not upload protected files to public/ or GitHub. No teaching resources are seeded. Keep migration grants/RLS unchanged.

## 3. Configure administrator Auth

Keep email/password sign-in enabled for the instructor. Disable public signup, anonymous sign-in and unused providers. Keep provider rate limits. Do not use invitations or automatic credential email delivery.

Use the Auth Site URL http://localhost:3000 for local setup, and https://arjun902.github.io/arjun-neupane-academic-hub/ for production. Course students do not use Supabase Auth.

CAPTCHA is not integrated; enabling it before adding its UI/token handling would break instructor sign-in/reauthentication.

## 4. Configure the frontend

Copy .env.example to .env.local only if it does not already exist. Set:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_LEGACY_ANON_KEY
```

Use the project's publishable key (sb_publishable_...) or legacy anon key from Connect. Never use sb_secret_... or a service-role JWT. Contact email is optional; the existing LinkedIn contact remains available.

```powershell
npm.cmd run doctor
```

Doctor checks configuration without printing keys.

## 5. Deploy both functions when authorized

These commands modify the selected backend. Run them yourself when ready, using your project reference:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase secrets set ALLOWED_ORIGIN=http://localhost:3000 --project-ref YOUR_PROJECT_REF
npx.cmd supabase functions deploy portal-admin --project-ref YOUR_PROJECT_REF
npx.cmd supabase functions deploy course-access --project-ref YOUR_PROJECT_REF
```

Supabase supplies SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in the function environment. Service credentials stay server-side. ALLOWED_ORIGIN is one exact browser origin, without a path/trailing slash.

Both functions use the included verify_jwt=false configuration and implement their own authorization. portal-admin verifies Auth identity, role, active status and credential version. course-access verifies passwords/session grants; an anon key alone grants no course content.

Confirm the actual gateway supplies trusted client metadata in X-Forwarded-For and that caller-supplied values cannot bypass network limits. Missing metadata fails closed. Do not enable body/header/SQL parameter logging for secret-bearing requests.

```powershell
npm.cmd run doctor -- --remote
```

Remote doctor performs read-only checks; it does not create accounts, upload files or replace end-to-end testing.

## 6. Provision the instructor

In Authentication > Users, create an instructor user with a strong temporary password and confirmed email; do not send an invitation. Run supabase/bootstrap-admin.sql after replacing its email placeholder. It rejects an existing hub account rather than overwriting permissions/version.

Start npm.cmd run dev and open http://localhost:3000/instructor-login/. Sign in, change the temporary administrator password, and sign in again. In Course passwords, set/generate passwords, enable access and configure expiry. Follow [the instructor guide](COURSE_ACCESS.md). No student accounts are needed.

## 7. Verify and release

Use [VERIFICATION.md](VERIFICATION.md) for hosted and mobile/desktop checks. The local HTTP harness requires a pristine disposable loopback Supabase stack; see npm.cmd run test:supabase:local -- --help.

For production set ALLOWED_ORIGIN=https://arjun902.github.io, update Auth Site URL, and add NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY as Pages repository secrets. Optional contact fields are repository variables. Never add service-role credentials to Pages.

After backend/visual verification and release authorization, manually run Deploy to GitHub Pages. Pushes do not deploy. A frontend-only release can show the course-password screens while backend setup is pending; it cannot unlock materials until the Supabase configuration is supplied.
