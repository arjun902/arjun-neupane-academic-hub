# Arjun Neupane — Academic Website

Open teaching resources, academic profile, research interests and student guidance built with Next.js, React, TypeScript and Tailwind CSS.

- Live: https://arjun902.github.io/arjun-neupane-academic-hub/
- Repository: https://github.com/arjun902/arjun-neupane-academic-hub

Students browse Home → Teaching → Program → Semester → Subject without an account, email verification or password. Public pages and search work without Supabase. Research and publication records are factual: unverified outputs are not invented.

## Local development

Use Node.js 22 and npm. Run `npm ci`, then `npm run dev`. On PowerShell use `npm.cmd` if script execution policy blocks npm.ps1. No environment file is needed for public development. Optional settings are documented in .env.example.

## Content and architecture

- `content/`: typed profile, programs, courses, resources, research, publications, notices, activities and student guidance.
- `lib/content.ts` and `lib/search.ts`: canonical relationships and filtering.
- `components/academic.tsx`: shared academic components; navigation/search/publication controls are small client components.
- `app/`: statically generated public routes; isolated optional admin routes retain authorization.
- `public/resources/`: only reviewed public documents explicitly listed in `scripts/public-files.json`.

[Content editing guide](docs/CONTENT_MANAGEMENT.md) · [Setup and deployment](docs/SETUP.md) · [Redesign inventory and limitations](docs/REDESIGN.md) · [Verification](docs/VERIFICATION.md)

## Validation

Run `npm run typecheck`, `npm run typecheck:edge`, `npm run test:content`, `npm run test:policies`, `npm run build:pages`, `npm run verify:export`, and `npm audit --omit=dev --audit-level=high`.

## Deploy

Push reviewed source to main and run the **Deploy to GitHub Pages** workflow in GitHub Actions, or `gh workflow run pages.yml --ref main`. The workflow tests, exports and deploys with the project base path and trailing-slash routes. Confirm the Actions run succeeded before sharing the live site.

## Content integrity and privacy

Semester groupings are independent teaching collections, not an official university curriculum. Owner verification is still needed for official syllabus versions, publication records, CV, events and additional materials. The public site contains no student grades or private submissions. Never put private files or credentials in public/, a NEXT_PUBLIC variable or Git history.

The prior private backend and migrations are preserved for optional administration; they are not required for the public site and are not configured by this redesign. Historical course-password documentation describes a superseded public-access model.
