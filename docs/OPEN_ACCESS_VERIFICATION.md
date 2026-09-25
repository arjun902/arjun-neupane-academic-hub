# Verification report — 25 September 2026

## Passed

- Production GitHub Pages export (`npm run build:pages`), including Next.js TypeScript checking.
- Supabase Edge Function type checking.
- Export integrity: 63 HTML files and 35 unique links/assets checked; refresh-safe course and staff routes present; no detected privileged keys or source maps in the export.
- Production dependency audit: 0 reported vulnerabilities at verification time.
- 70 PostgreSQL policy assertions: 48 original-migration baseline checks and 22 public-learning checks, including clean and legacy setups.
- Public policy checks: anonymous published metadata and file reads, hidden-course denial, draft/future-release denial, no anonymous publishing/uploads/deletes, account data remains private, and staff management retained.
- Chromium browser checks against the production static export: public navigation, programme filtering, no-results search, direct course refresh, `/login/` redirect, old `/student/#course` deep links, staff gate, mobile menu, and no horizontal overflow on Home, Courses, Course, Research, About and Contact at 390px. No page JavaScript errors observed.
- Chromium browser checks against a development instance with an intercepted test API: unit filtering; online text reader contents; Escape dismissal; downloaded filename and exact bytes; clear-filter recovery; failed API state and successful Retry. This validates frontend interactions, not live Supabase connectivity.
- Desktop (1440px) and mobile (390px) screenshots visually inspected. See `docs/previews/`.

## Not performed

- No GitHub commit or Pages deployment was made to the user's account.
- No live Supabase migration was executed. The ZIP provides the required SQL.
- Real Storage/Auth HTTP end-to-end testing needs the user's configured Supabase project. The supplied archive contains no teaching PDFs or live credentials.
- No full WCAG certification, cross-browser matrix, or load test is claimed.

The delivered ZIP contains source and screenshots, not node_modules or environment-specific build output. Deploy with the existing workflow so the user's real public Supabase settings are compiled into the site.
