# Existing content migration

## Course-password revision (2026-09-24)

Apply `202609200001_course_password_access.sql` after the phase-one migration and seed. Existing accounts, enrollments, activity, units, resources and files are retained. Direct student resource/Storage policies are replaced by the server-verified course-session gateway. Each of the six courses starts disabled without a password; the instructor must set one and enable access. The new Sample Code collection brings the current collection count to eleven.

The historical inventory below remains relevant for the quarantined PDFs. References to an authorized test student or distributing credentials now mean testing and distributing the shared course password; see [COURSE_ACCESS.md](COURSE_ACCESS.md). No personal accounts are needed for course access.

Status: local code migration prepared; no production storage upload, remote deletion, Git history rewrite or live deployment has been performed by this work.

## Public material exposure found

Eight PDFs were present under `public/resources/bca/semester-2/c-programming/`. In a static site, files in `public/` are downloadable without authentication and copied into the exported build. Any committed copies also remain available in earlier public Git commits. A login screen cannot protect those URLs.

The working copies are now quarantined under the ignored local directory `private-migration/resources/bca/semester-2/c-programming/`. They are excluded from future source commits/builds, but that directory is **not encrypted storage or a backup**. Keep it on a controlled device and back it up privately. A fresh clone will not contain these files. Do not force-add the directory to Git.

The old public site, published artifacts, caches, forks and earlier commits may retain copies until their respective owners replace or remove them. Moving files cannot undo prior downloads, screenshots or redistribution. No history rewrite has been attempted; rewriting published history requires a separately approved plan and coordination.

## Inventory

All paths below are relative to `private-migration/resources/bca/semester-2/c-programming/`. Sizes are from local inventory; categories are suggested by filenames, not verified contents or licensing.

| File | Bytes | Suggested category | Import status |
| --- | ---: | --- | --- |
| `c-programming-course-notes.pdf` | 1,272,395 | Unit-wise Notes | Held; rights unknown |
| `c-programming-midterm-2082-mcqs.pdf` | 91,225 | Question Bank | Held; rights unknown |
| `c-programming-midterm-2082-theory-questions.pdf` | 92,633 | Past Questions | Held; rights unknown |
| `c-programming-syllabus-cacs151.pdf` | 689,546 | Syllabus | Held; rights/version unverified |
| `c-programming-vacation-homework.pdf` | 88,781 | Assignments | Held; rights unknown |
| `features-of-a-good-program.pdf` | 329,934 | Unit-wise Notes | Held; rights unknown |
| `file-handling-questions-with-solutions.pdf` | 119,665 | Solutions | Held; rights unknown; review release date |
| `pointer-and-structure-lab-sheets.pdf` | 100,584 | Labs / Practical Work | Held; rights unknown |

**Imported into the new backend: zero.** The `cacs151` filename and legacy semester directory are historical labels, not confirmation of the current official course code or semester. No official metadata is inferred from them.

## Migration checklist

- [ ] Privately back up the eight local files and current database/storage before a production change.
- [ ] Confirm authorship, license or permission for each file. Inspect for student/personal information and remove it when unnecessary. Record source attribution and the instructor's decision in a private content register.
- [ ] Verify each syllabus against the applicable official TU programme/version before filling course metadata or unit names.
- [ ] Inspect hosted `materials`/`assignments` buckets and other public URLs. Their remote contents were unavailable for inventory during this work.
- [ ] Apply the migration once and seed the six courses. Legacy tables remain, while browser API grants are revoked. Legacy buckets become private, with restrictive policies denying old browser access.
- [ ] Check actual project views, RPCs, Storage policies and other integrations for additional legacy exposure. The migration retires known legacy tables/buckets; it cannot inventory an unseen project.
- [ ] Preserve other historical course content privately until reviewed. Phase-one public routes expose the intended catalogue; hiding a course does not require deleting its records.
- [ ] Create verified units through the admin dashboard. Upload approved files into private `hub-materials` as drafts using the admin UI, one course/unit/category at a time.
- [ ] Confirm previews, readable filenames, metadata and private downloads with an authorized test student. Keep solutions draft or future-released until appropriate.
- [ ] Publish reviewed resources. Record resource IDs/object keys privately, with original filenames, checksums, source/rights, category and import date. Do not include storage URLs or student credentials in the public repository.
- [ ] Approve and run the replacement static deployment. Confirm old `resources/...pdf` routes return no content, including direct signed-out requests. Remove stale hosted artifacts/caches where possible and request index removal where applicable.
- [ ] Assess public Git history separately. If removal is required, prepare a history-cleanup and collaborator recovery plan for explicit approval; do not silently force-push rewritten history.
- [ ] Retest anonymous access, course isolation, expiry/suspension, reset-token invalidation and draft/release restrictions before distributing student credentials.

## Content still needed

Each of the six courses starts with no published resources. Supply a verified syllabus and authorized teaching notes first, then slides, worked examples, lab sheets, sample programs, assignments, practice questions, authorized past papers and references. Supply solutions separately so release can be controlled. The ten resource categories are ready to use; empty states are intentional and there is no fabricated library.

Fixtures in `scripts/test-policies.mjs` exist only in a temporary test database, use `example.invalid` addresses and are not production seed data. Never load those test identities/resources or the simplified test infrastructure into a production project.
