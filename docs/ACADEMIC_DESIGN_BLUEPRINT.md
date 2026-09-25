# Academic design blueprint

## Goal and audiences

A professor's academic website with an open learning collection. Students find course materials without accounts; researchers can explore interests and academic background; staff publish through a protected administration interface.

## Information architecture

Home → Teaching → programme/search → course → unit/category → read/download.
Home also connects to Research, About and Contact. Teaching is the main navigation label for `/courses/`. Staff administration is a secondary footer link. No student login action appears in public navigation.

## Design progression

1. Low fidelity: establish header, introductory content, course collection, research, learning guidance, and footer. Course layout uses a unit sidebar and material list.
2. Mid fidelity: use six real course names and existing resource metadata. Validate search, filtering, route changes, direct links, missing content, loading and retry behavior.
3. High fidelity: warm paper background, navy/teal typography, serif headings, restrained borders, generous spacing, real supplied portrait, and responsive components. Screenshots in `docs/previews/` show the implemented design with no backend configuration.
4. Working implementation: actual static Next.js routes and a read-only public Supabase client; no mocked live content.

## Components and visual rules

- Header: monogram, name, academic descriptor, five navigation links, course action; accessible mobile toggle.
- Hero: teaching/research headline, brief purpose, two actions, supplied portrait and academic-profile link.
- Catalogue: search, programme buttons, grouped course cards, open-access labels, no-results message.
- Resources: breadcrumb, course description, course/unit selectors, keyword search, category filter buttons, metadata-rich resource rows, online reader/download controls, loading/empty/error states.
- Footer: student resources, research/about, staff administration, original contact links and independence notice.
- Navy: #14283F design direction; existing theme navy #12263F retained for compatibility.
- Paper: #F8F7F3; primary actions: #176B65; serif: Georgia; body: system sans-serif. No external font request is required.
- Main content width: 1180px; buttons at least 44px tall; desktop navigation becomes mobile navigation below the large breakpoint.
- Focus indicators, skip link, explicit form labels, reduced-motion support, native modal focus containment and Escape dismissal.

## Requirements mapped to checks

| Requirement | Implementation | Verification |
|---|---|---|
| No student authentication | PublicResources, public routes | Incognito-style browser context and route checks |
| Published files readable | Anonymous SELECT policies, private bucket | PostgreSQL policy tests; remote acceptance after migration |
| Editing remains staff-only | Existing AuthGate, admin policies | Anonymous write denial and admin policy checks |
| Direct links remain useful | Static course routes, login redirect, legacy hash support | Export-link checks and browser refresh/navigation |
| Find relevant materials | Programme, course, unit, category, keyword filters | Browser filter and no-results checks |
| Honest unavailable states | No synthetic resources, retry/empty messages | Unconfigured and failed API cases |
| Readable on mobile | Responsive grids/menu | Browser overflow checks and screenshots |
| Maintainable changes | Reusable client/components, additive migration | Type checks and production build |

## Scope boundaries

No grades, private submissions, per-student bookmarks or completion tracking are exposed. Public pages deliberately use a separate anonymous client even when the same browser has a staff session. Existing staff publishing controls remain available; publishing now means public access when the course is visible and the release date has arrived.

No external publications, academic titles, course syllabus metadata or statistics were invented. Existing biography/research content was preserved; the new home introduces the teaching/research focus without claiming publications or appointments.

## Next content tasks

Verify actual syllabus versions before entering course units; upload original notes and slides; add verified publication records and a current CV when available; test with 5–8 students on their own devices. These are content/usability tasks, not prerequisites for removing student login.
