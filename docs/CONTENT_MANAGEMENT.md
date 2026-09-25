# Managing academic content

Edit one record in `content/`; pages, cards and search read the same records. Run the checks below and deploy the main branch. Public content does not need a database.

## Profile and images

The profile now includes structured degree/institution/period records, dated teaching and engineering roles, skills, awards and certifications. Shared thesis/project records live in `content/projects.ts`; edit them there to update all related pages. Source reconciliation and the owner's confirmed institution/award names are documented in [PROFILE_SOURCES.md](PROFILE_SOURCES.md).

Update name, summary, education, experience and verified external links in `content/profile.ts`. Do not infer dates, degree affiliations or current appointments. Update `content/site.ts` for navigation and the production URL. The optimized photo is `public/assets/arjun-neupane-profile.webp`; keep its original aspect ratio. The original PNG is retained as a source asset. Add a CV or academic profile only when a real file/link is supplied and reviewed.

## Program and semester

Add an `AcademicProgram` record to `content/programmes.ts`. Each semester contains canonical course slugs, not copied course descriptions:

```ts
{ slug: 'new-program', name: 'Verified program name', shortName: 'Program',
  description: 'Describe this teaching collection.',
  semesters: [{ number: 1, courseIds: ['new-subject'] }] }
```

Add semester records 1–8 where appropriate. Do not call the collection an official curriculum without evidence. Routes, sitemap and search are generated from these records.

## Subject and topics

Add one `Course` to `content/courses.ts` and reference its slug from the appropriate semester records:

```ts
{ slug: 'new-subject', name: 'Subject title',
  summary: 'What the learner will study.', practical: true,
  units: [{ id: 'topic-1', title: 'Foundations', topics: ['First topic', 'Second topic'] }] }
```

Study topics are independent guidance. Verify official unit titles, placement, codes and credits before publishing them as institutional requirements. Reuse the same subject across programs; scope program-specific resources separately.

## Notes, slides, PDFs, labs, assignments and past questions

1. Confirm that the owner may publish the document. Review every page for personal data, credentials, unpublished answers and third-party attribution. Never copy a whole private folder into `public/`.
2. Put the approved document in `public/resources/{program}/semester-{n}/{subject}/{type}/readable-file-name.pdf`.
3. Add its exact `/resources/...` path to `scripts/public-files.json`. This explicit allowlist is checked by the export verifier.
4. Add a `Resource` record to `content/resources.ts`:

```ts
{ id: 'new-subject-intro-notes', subject: 'new-subject',
  programs: ['new-program'], semesters: [1], unit: 'topic-1',
  title: 'Introduction notes', description: 'Describe the actual file, format and pages.',
  type: 'Notes', fileUrl: '/resources/new-program/semester-1/new-subject/notes/introduction.pdf',
  tags: ['foundations'], credit: 'Verified author', status: 'published' }
```

Supported types: `Reference`, `Notes`, `Slides`, `Lab`, `Assignment`, `Past questions`, `Syllabus`, `Sample code`. Use `externalUrl` for an HTTPS publisher link instead of rehosting third-party material. Use only one target field. Optional `date` is an actual publication/update date, never a fabricated timestamp. Optional program/semester restrictions prevent course-specific material appearing in unrelated collections.

`status: 'draft'` hides a resource record, **but does not protect a file stored in public/**. Keep all drafts/private files outside public and outside Git until approved. Once published on GitHub Pages, a file is publicly downloadable. A public repository also exposes its Git history.

## Publications and research projects

Add verified `Publication` records to `content/publications.ts` with `id`, `title`, `authors`, `venue`, `year`, `type` and `topics`. Optional fields are `volume`, `issue`, `pages`, `doi` (identifier without the resolver prefix), `url` and `pdfUrl`. Only link PDFs that can legally be shared. Year/type/topic filters and citation copy controls appear automatically when records exist. Local publication PDFs also need the public-file allowlist.

Edit research interests and verified project records in `content/research.ts`. Include a truthful status and a real project URL if available. Interests do not imply completed projects or published results.

## Notices and activities

Add to `content/notices.ts`:

```ts
{ id: 'confirmed-notice', title: 'Verified announcement',
  date: 'YYYY-MM-DD', category: 'Teaching',
  body: 'Owner-confirmed details.', link: '/teaching' }
```

Use a real ISO date. The homepage shows the latest notices and `/notices` groups the archive by year. Remove cancelled notices or update the text explicitly.

Workshop offerings live in `content/activities.ts`. Use `status: 'offering'` for a topic without a confirmed date. Use `scheduled` or `completed` only with verified event information. Do not turn offerings into an invented event history.

General student guidance and FAQ records live in `content/students.ts`. Clearly distinguish guidance from institutional rules.

## Check and publish

```powershell
npm.cmd run typecheck
npm.cmd run typecheck:edge
npm.cmd run test:content
npm.cmd run test:policies
npm.cmd run build:pages
npm.cmd run verify:export
npm.cmd audit --omit=dev --audit-level=high
git add <reviewed-files>
git commit -m "Update verified academic content"
git push origin main
gh workflow run pages.yml --ref main
```

The Pages workflow is manually triggered, runs checks and publishes the static `out/` artifact. Watch its Actions run, then open the live nested route and file URL. Do not publish `.env.local`, service-role keys, private documents, student records, build output or test fixtures.

## Architecture and backend boundary

`lib/content.ts` resolves subject paths and resource scopes; `lib/search.ts` handles search filters. `components/academic.tsx` contains shared server-rendered presentation. Public pages import no Supabase client or student-session code. The optional `/admin` interface manages a separate private backend; its records do not automatically publish into the static public content layer. See [SETUP.md](SETUP.md).
