# Setup and deployment

## Public website

No Supabase project, student account or course password is required. Install Node.js 22, run npm ci and npm run dev. The public content comes from content/*.ts.

For the production-shaped export run npm run build:pages, then npm run verify:export. This sets NEXT_OUTPUT=export, GITHUB_PAGES=true, NEXT_PUBLIC_BASE_PATH=/arjun-neupane-academic-hub and the production site URL. Next handles internal Link prefixes; static asset/file links use the shared asset helper. Do not hard-code a second copy of the base path.

## GitHub Pages

1. Commit and push reviewed changes to arjun902/arjun-neupane-academic-hub, branch main.
2. Repository Settings → Pages must use GitHub Actions (already configured).
3. Run the Deploy to GitHub Pages workflow, or gh workflow run pages.yml --ref main.
4. Wait for both build and deploy jobs to succeed. Check the run uses your intended commit.
5. Open https://arjun902.github.io/arjun-neupane-academic-hub/ and a nested subject path directly, then verify the linked document and static assets load.

The workflow is manually triggered to keep publication intentional. Ordinary pushes also run verification. No backend secrets are necessary for the public website.

## Optional private administration

/admin and /instructor-login retain the previous admin authorization. They are absent from public navigation and search indexing. Without Supabase settings the admin interface fails closed. Public browsing remains fully functional.

If private backend administration is needed later, create a Supabase project, apply the existing migrations in timestamp order, configure the public project URL/publishable key and deploy the Edge Functions according to the archived COURSE_ACCESS.md. Store privileged secrets only in the backend. Review that older deployment guide before enabling any backend feature; it describes the previous course-password system, which is not used by the public website now.

Admin uploads do not automatically publish to GitHub Pages. Promote material into content/resources.ts and public/ only after content, rights and privacy review. Do not make existing private buckets public.

## Rollback

Revert the relevant content/redesign commit, run the same verification and dispatch Pages again. Do not force-push or rewrite history. Existing private-migration files and remote database records are not part of static deployment.
