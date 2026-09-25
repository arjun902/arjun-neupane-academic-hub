# Verification and release checks

Final local checks completed 2026-09-25. A static build or password form alone does not prove backend security.

## Local evidence

- Frontend and both Edge Function TypeScript checks passed.
- Production npm dependency audit passed with zero reported vulnerabilities.
- GitHub Pages production export passed, including six course detail pages and Instructor Login.
- Final export verification passed: 63 HTML files and 33 unique links/assets checked, including all six refresh-safe course routes.
- 57 PostgreSQL/gateway checks passed on a fresh database and 57 on a legacy upgrade (114 executions). Real migrations, pgcrypto bcrypt and RPCs execute in PGlite.
- Tests exercise actual Edge handler source against SQL adapters. Storage signing and Auth identity responses are explicit test doubles, not hosted services.
- Coverage: correct/incorrect passwords, course isolation, forged tokens, publication/release, direct anonymous/legacy-account denial, rotation/version, disablement/expiry, remembered deadlines, lock/revoke, privileged RPC and admin denial, rate limits and data preservation.
- Export verification checks six refresh-safe course paths, legacy/instructor links, assets, outdated login copy, protected file/source-map exclusions, bcrypt hashes, session-token values and privileged credential markers.

## Concrete blockers

- No Supabase project configuration: doctor reports missing project URL/public key. No migration or function was deployed.
- Docker CLI exists but Docker engine pipe is unavailable. No local Supabase HTTP stack/test keys are configured.
- Browser inventory contains no browsers; in-app browser creation failed. No desktop/mobile screenshots or keyboard interactions are claimed as inspected.
- GitHub Pages publication was authorized on 2026-09-25. The Pages workflow records its deployment result; backend setup remains separate and incomplete.

## Repeat locally

```powershell
npm.cmd run typecheck
npm.cmd run typecheck:edge
npm.cmd run test:policies
npm.cmd run build:pages
npm.cmd run verify:export
npm.cmd run doctor
npm.cmd run test:supabase:local -- --help
```

The HTTP harness accepts only loopback origins and explicitly disposable test configuration. It uses real Auth/Edge/Storage endpoints with synthetic fixtures. Missing setup means blocked, not passed.

## Required hosted checks

| Case                                    | Expected result                                                                                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Correct/incorrect password              | Correct grants selected course; incorrect grants nothing.                                                                                       |
| A token with B course/resource          | No B metadata or signed URL.                                                                                                                    |
| No/forged token or edited localStorage  | No protected content.                                                                                                                           |
| Direct REST/Storage or service-only RPC | Anonymous and legacy students denied.                                                                                                           |
| Course token to portal-admin            | No administrative action.                                                                                                                       |
| Password rotation/version mismatch      | Old sessions fail subsequent protected requests.                                                                                                |
| Disablement, expiry, revoked session    | Metadata/files denied; UI returns to unlock.                                                                                                    |
| Draft/unreleased ID/path                | No metadata or signed URL.                                                                                                                      |
| Standard/remembered duration            | Absolute configured deadline, capped by course expiry.                                                                                          |
| Lock one / all                          | Relevant token/device sessions revoked; another device remains valid.                                                                           |
| Offline lock                            | View closes, retry shown, no false success.                                                                                                     |
| Attempts                                | Ninth device attempt gives 429/Retry-After; another campus device still works. Test network ceiling in isolated staging.                        |
| Forwarded IP spoofing                   | Client headers cannot choose the trusted network limiter key. Missing trusted metadata fails closed.                                            |
| Signed URLs                             | Authorized URL works then expires at 60 seconds; direct public/private URL fails. Rotation cannot mint another link with the old token.         |
| Caching/logging                         | Gateway no-store, no secrets/body/header capture, no service worker/public caching. Verify Storage response and existing-object cache metadata. |

Do not include passwords, bearer tokens or service keys in evidence. Storage signatures are expected in temporary signed URLs; course-session tokens must never be in URLs.

## Browser acceptance before release

Inspect catalogue, unlock, unlocked course and instructor controls at 1440×900 and 390×844, including empty/error states and long English/Nepali titles.

- Verify labels, show/hide, paste/password-manager support, unchecked Remember, shared-device guidance, loading/errors and working contact link.
- Keyboard-only navigation: visible focus, Enter submission, sensible tab order, dialog Escape/focus return and accessible close button.
- Unlock one course, reload, validate Continue Learning, confirm another course stays locked.
- Search only unlocked-course content; verify filters, browser-local progress and honest empty states.
- Preview PDF/image/code, download test file, revoke while open and check new requests fail.
- Refresh six course routes and old login/student paths under /arjun-neupane-academic-hub/. Check assets and horizontal overflow.
- Test instructor sign-in/first password, upload/publish, generated-password copy/dismiss, rotation warning, disable/expiry.
- Inspect signed-out traffic and out/ for protected metadata/files/secrets. Public Supabase keys are expected.

Shared passwords do not identify students. Browser bearer-token and signed-link limits are documented in [COURSE_ACCESS.md](COURSE_ACCESS.md). Configuration absence never enables fake authorization.
