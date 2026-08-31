# Er. Arjun Neupane Academic Hub

Modern academic portfolio and student resource platform built with Next.js, Tailwind CSS, Supabase, and Vercel.

## Academic Resource Flow

The public academic catalog follows one consistent hierarchy:

```text
BSc CSIT / BCA / BE Computer Engineering
  -> Semester 1-8
    -> Program-specific subject
      -> Notes / Assignments / Lab Reports / Old Questions
```

Resources now live inside their subject pages; there is no separate public Materials section. The existing Supabase
`materials` table and storage bucket keep their legacy names for backward compatibility, while the dashboards present
them as course resources.

Live site: https://arjun902.github.io/arjun-neupane-academic-hub/

LinkedIn: https://www.linkedin.com/in/er-arjun-neupane/

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Run `supabase/seed.sql` to load the subject catalog.
4. Copy `.env.example` to `.env.local`.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

The schema creates role-based RLS policies, private material and assignment buckets, secure contact-message storage,
and a signup trigger that always provisions new accounts as students. Promote trusted staff by changing their
`profiles.role` in the Supabase dashboard; the login form never accepts a client-selected role.

Create or invite accounts from **Authentication → Users**. To provision the first admin from the SQL Editor, replace
the email below with the trusted account:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

## GitHub Pages

In **Repository settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.

In **Repository settings → Secrets and variables → Actions**, add these repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optionally add `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_CONTACT_PHONE` as repository variables. Never add the
Supabase service-role key to GitHub Pages. Pushes to `main` run dependency auditing, TypeScript checks, a static build,
and exported-link verification before deployment.

## Verification

```bash
npm run check
npm run build
npm run verify:export
```

## Vercel

Import this folder into Vercel, add the same environment variables, and deploy. The project uses the Next.js framework preset.
