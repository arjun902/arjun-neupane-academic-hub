# Open academic website redesign

The latest master prompt replaces the earlier student-account and course-password design. The public website is now a static academic profile, teaching library and student guidance site. No Supabase project is required to use it.

## Content inventory and migration decisions

The pre-redesign implementation is preserved in Git commit `f63bab9`. No database, account, grade or private Storage record was deleted or made public.

| Existing content                                           | New destination / decision                                                                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Home and profile, portrait, education, four teaching roles | `content/profile.ts`, Home and `/profile`; existing claims retained without inventing dates or credentials                                |
| Three program collections and 37 subject placements        | `content/programmes.ts`, `content/courses.ts`; retained existing URLs; unverified course codes, credits and update dates removed          |
| Six course access links                                    | Compatibility pages to public subject collections; Discrete Mathematics remains a supplementary collection without an unverified semester |
| Research interest descriptions                             | `content/research.ts`; interests are not represented as completed projects or publications                                                |
| Six workshop topics                                        | `content/activities.ts`; clearly labelled offerings, not confirmed events                                                                 |
| Blog topic cards                                           | General study guidance on `/students`; `/blog` remains a compatibility route                                                              |
| Old sample notices and deadlines                           | Removed from public rendering; preserved in Git history pending owner verification                                                        |
| Eight historical PDFs                                      | Originals retained in ignored `private-migration/`; see below                                                                             |
| Student grades and submissions                             | Remain behind existing backend policies; `/grading` now shows non-personal student guidance                                               |
| Admin tools and migrations                                 | Retained as optional private infrastructure; absent from public navigation and sitemap                                                    |

The pointer/structure lab handout was checked by text extraction and full-page rendering. It contains exercises, no actual student records, and was attributed to Arjun in the pre-existing resource inventory. Under the owner's open-material publication request it is republished at `public/resources/bca/semester-2/c-programming/labs/pointer-and-structure-lab-sheets.pdf`. It is explicitly allowlisted in `scripts/public-files.json`.

The other seven PDFs remain unpublished in the new export. Six have unconfirmed source/rights/version details. The author-attributed file-handling solutions document has historical branding and code-quality issues requiring editorial review. Do not publish it automatically. Existing public Git history may contain older copies.

## Architecture

`content/` holds typed public academic records. `lib/content.ts` resolves canonical subjects and offerings; `lib/search.ts` filters that same collection. Server-rendered reusable components in `components/academic.tsx` provide breadcrumbs, cards, page headings and structured data. Client code is limited to navigation, resource filters, publication controls and isolated admin tools.

Public routes: `/`, `/profile`, `/teaching`, `/subjects/{program}`, `/subjects/{program}/semester-{n}`, `/subjects/{program}/semester-{n}/{subject}`, `/resources`, `/research`, `/publications`, `/students`, `/activities`, `/notices`, `/contact`.

Compatibility routes: `/about`, `/subjects`, `/courses`, six `/courses/{id}` pages, `/student`, `/login`, `/grading`, `/workshops`, `/blog`, `/subjects/csit`, `/subjects/be`. Static compatibility pages use canonical metadata; they do not rely on server redirects.

## Owner verification still needed

- Current institutional titles, dates and education details beyond the existing profile statements.
- Official semester mappings and syllabus versions. Current groupings are explicitly independent collections, not an official curriculum.
- Publication records, research project evidence, CV, Scholar/ORCID and a public email address.
- Actual event dates, notices, more teaching materials and rights to held documents.

No invented publication, DOI, project, event, contact address, deadline or metric was added. Empty publication/notices collections are intentional. The IA reference `baburd.com.np` could not be retrieved (HTTP/HTTPS timeouts); the supplied master prompt guided the original structure. No reference-site assets or code were copied.

## Validation scope

Run `npm run typecheck`, `npm run typecheck:edge`, `npm run test:content`, `npm run test:policies`, `npm run build:pages`, `npm run verify:export` and the production dependency audit. Export checks validate local links/assets, route refresh targets, identity, public access and an explicit public-document allowlist while rejecting private artifacts and secret markers.

Responsive layouts, keyboard controls, semantic headings, focus styles, reduced motion and print styles are implemented. The connected browser inventory was empty in this environment; interactive browser, screen-reader and Lighthouse results must not be claimed. Supabase integration remains unconfigured and is not a dependency of the public site.

## File overview

- Created: `content/*.ts`, `lib/content.ts`, `lib/search.ts`, `lib/metadata.ts`, `components/academic.tsx`, `components/resource-search.tsx`, `components/publication-list.tsx`, new academic route pages, semester pages, 404, optimized portrait, public handout, public-file allowlist and content tests.
- Modified: existing public routes, header/footer, global CSS, Tailwind tokens, root metadata, sitemap/robots, export checks, workflows, environment example and documentation.
- Retired: unused public password/catalogue/dashboard UI, old duplicate academic/profile datasets, decorative hero/cards and unused contact/grading components. Their history remains in Git. Private admin authorization and backend policies remain in place.

See [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md) for editing examples and [SETUP.md](SETUP.md) for deployment.

## Concurrent GitHub uploads

Remote commits `c66c527` and `aff2996` arrived during implementation. They are retained through a normal merge, with no force push. Their open-access intent is implemented by the static redesign. `/admin/login` remains a compatibility alias for the existing guarded staff login. Uploaded design documents and preview images are retained and marked historical. Their Supabase public-learning SQL and tests are preserved in `supabase/optional-public-learning/` as explicit opt-in infrastructure; deploying this static site does not change existing private backend access. The optional policy tests run after both retained private migrations.
