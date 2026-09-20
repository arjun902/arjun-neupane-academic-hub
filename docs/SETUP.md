# First Supabase setup

The frontend and database code are ready. A Supabase project has not yet been created or deployed for this workspace. Follow these steps in order. Keep passwords and service-role keys out of chat and Git.

## 1. Create your project

Open [Supabase Dashboard](https://supabase.com/dashboard) and sign in. Create an organisation/project named `arjun-academic-hub`. Select the Free option if offered, choose a nearby region and save the database password privately. Do not purchase or upgrade a plan for this setup. Wait for the project to become ready. See the [official project quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).

## 2. Create the database and private bucket

In the project's SQL Editor, run these files separately and in this order:

1. `supabase/migrations/202609190001_academic_hub.sql` — once only. Do not also run `schema.sql`, which is the same migration.
2. `supabase/seed.sql` — creates the six initial courses without sample teaching materials.

Check Storage: `hub-materials` must be private. This setup does not import the eight quarantined PDFs. Ensure the Data API is enabled for the `public` schema; keep the migration's grants and RLS policies intact.

## 3. Set authentication options

- Keep email/password sign-in enabled.
- Turn **Allow new users to sign up** off. Disable anonymous sign-ins and unused providers.
- Keep automatic security email notifications off. This portal distributes credentials manually.
- Set the Site URL to `http://localhost:3000` for the first local check. The eventual production URL is `https://arjun902.github.io/arjun-neupane-academic-hub/`.
- Retain provider login rate limits. Do not enable CAPTCHA until its UI/token integration is added; it is not currently integrated.

See [Auth settings](https://supabase.com/docs/guides/auth/general-configuration). These dashboard settings are not applied by the SQL migration.

## 4. Fill the local configuration

In the project's **Connect** panel, copy the Project URL and a **publishable key** (`sb_publishable_...`) or legacy **anon** key. Both public key types work in the existing environment variable. See [API key types](https://supabase.com/docs/guides/getting-started/api-keys).

Open the ignored `.env.local` in this repository and set:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Never use a `sb_secret_...` key or service-role JWT here. Keep `.env.example` free of real project values. From the repository's PowerShell terminal:

```powershell
npm.cmd run doctor
```

The command reports missing/invalid configuration without printing key values. It does not create a project or deploy anything.

## 5. Deploy the administrative function

This step changes the Supabase backend, so run it only for the project you just created. With Node.js installed, use the official Supabase CLI through npx:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase secrets set ALLOWED_ORIGIN=http://localhost:3000 --project-ref YOUR_PROJECT_REF
npx.cmd supabase functions deploy portal-admin --project-ref YOUR_PROJECT_REF
```

Complete the CLI login yourself. Do not paste an access token into chat. The hosted function receives its server-side Supabase keys from the platform. Its supplied `config.toml` disables gateway JWT verification because the handler verifies the caller itself and checks administrator permissions. See [official function deployment](https://supabase.com/docs/guides/functions/deploy).

Then run:

```powershell
npm.cmd run doctor -- --remote
```

This makes read-only checks for the catalogue, anonymous metadata denial, disabled signup and the deployed function's anonymous rejection. It does not create accounts, send email or upload files. It does not replace authenticated tests.

## 6. Create your instructor account

In Authentication > Users, create a user with your email and a strong temporary password; confirm the email during creation. Use **create**, not an emailed invitation. Then copy `supabase/bootstrap-admin.sql` into SQL Editor, replace `REPLACE_WITH_YOUR_EMAIL` and run it once. The script rejects an existing portal account rather than resetting its permissions or credential version.

```powershell
npm.cmd run dev
```

Open `http://localhost:3000/login/`, sign in, replace the temporary password, then sign in again with the new password. You should reach the admin dashboard. Create one test student manually, assign a course, and verify its first-password and resource access workflows before adding real students.

## 7. Finish verification before a public release

Use `docs/VERIFICATION.md` for authenticated access tests and desktop/mobile screenshots. If you have a disposable local Supabase stack, `npm.cmd run test:supabase:local` runs HTTP integration checks against loopback addresses only; it refuses cloud URLs. Never use service-role keys in frontend configuration.

GitHub Pages deployment remains separate. When ready to release, change `ALLOWED_ORIGIN` to `https://arjun902.github.io`, set the production Auth Site URL, add the public URL/key to the repository's configured Pages secrets, and manually run the Pages workflow. The function currently accepts one browser origin; change it back when testing locally. No GitHub Pages release was performed by these setup preparations.
