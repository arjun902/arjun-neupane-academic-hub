# Er. Arjun Neupane Academic Hub

Modern academic portfolio and student resource platform built with Next.js, Tailwind CSS, Supabase, and Vercel.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local`.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Vercel

Import this folder into Vercel, add the same environment variables, and deploy. The project uses the Next.js framework preset.
