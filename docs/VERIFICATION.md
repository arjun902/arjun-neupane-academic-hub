# Verification record

The redesigned public site is independent of Supabase. Validate it with:

| Check | Purpose |
| --- | --- |
| npm run typecheck | Strict application TypeScript |
| npm run typecheck:edge | Preserved private backend function types |
| npm run test:content | Referential integrity, scope, reviewed files and meaningful search cases |
| npm run test:policies | Private backend fresh/legacy migration and authorization regressions |
| npm run build:pages | Production static build with the GitHub project prefix |
| npm run verify:export | Local links/assets, direct route targets, public identity, no student gates, document allowlist and secret/private-file exclusion |
| npm audit --omit=dev --audit-level=high | Production dependency audit |

The pointer/structure handout was inspected using text extraction and a rendered full-page image. It contains exercise prompts, not actual student records.

Interactive browser testing, screen-reader testing and Lighthouse have not been performed: the connected computer-use inventory returned no apps or browsers. Do not interpret static checks as those tests. Responsive styles cover mobile/tablet/desktop, keyboard focus, menu Escape, reduced motion and print, but require a manual browser pass when available.

No Supabase project is connected. Backend policy tests use isolated local fixtures, not a live production service; actual private admin sign-in/upload is not represented as verified.

After deployment, confirm the successful Pages run's commit and HTTP responses for Home, Profile, Teaching, nested course pages, Resources, Publications, Students, the stylesheet/image assets and the approved PDF. Review the full change inventory in REDESIGN.md.
