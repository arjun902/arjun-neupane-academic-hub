# Instructor guide: course passwords

## Set and distribute

1. Complete [SETUP.md](SETUP.md), open **Instructor Login**, and sign in with the administrator account.
2. Open **Course passwords**, choose the course, and either **Generate strong password** or enter at least 12 characters (maximum 72 UTF-8 bytes) and **Set password**.
3. Generation uses 20 random base32 characters grouped for readability: 100 bits of randomness. Copy the new password before dismissing it or leaving the panel. Only its bcrypt hash is saved.
4. Enable access, optionally set expiry, and save settings. All courses initially have no password and are disabled.
5. Distribute the password yourself through your class channel. No email/message is sent automatically.

Existing passwords cannot be retrieved. Replace forgotten passwords. Never place them in Git, environment variables, URLs or public announcements.

## Rotate and revoke

Password replacement/generation asks for confirmation: **all students will need the new password and existing sessions will be revoked**.

Revoke all sessions invalidates current sessions, but the current password can unlock new ones. Rotate the password when only recipients of a replacement should regain access.

Disablement/expiry stops both new and existing access. Every settings save increments the access version and revokes sessions; re-enabling does not revive them.

Shared access does not identify people, prevent password sharing or exclude one named student. No unique-student metric is inferred from sessions. Do not upload grades, personal submissions or student records.

## Durations and browser behavior

- Standard: default 480 minutes, configurable 15–480.
- Remembered: default 10080 minutes, configurable 60–10080.
- Course expiry caps either; reading never extends the absolute deadline.
- Remember is unchecked by default. Leave it unchecked on shared devices.
- Lock this course revokes the current token. Lock all courses revokes sessions associated with the browser's random device ID, including other tabs.
- Offline lock closes the view and offers retry. The token is retained until server revocation succeeds; the UI does not claim success prematurely.
- Clearing/changing browser storage may remove a token needed to revoke an older session. Instructor revocation remains available.
- Bookmarks/completion store only resource IDs and flags, labelled saved on this browser. They do not sync or verify learning.

## Materials and links

Upload reviewed files under Materials; select a course, optional unit and collection. Keep drafts unpublished and solutions future-released as appropriate. Source code is displayed as escaped text and never executed. Announcements are public only if explicitly marked public and published.

Keep hub-materials private. The gateway authorizes each file request before issuing a 60-second signed URL. Already issued links may remain usable until expiry after revocation; previously downloaded files cannot be withdrawn. Download/preview controls cannot prevent copying content already received.

New uploads request no-store metadata. Review cache-control metadata on existing objects before release. External HTTPS references follow the destination's own access/caching rules and should contain no credentials.

## Session and hosting trade-off

GitHub Pages cannot issue server-managed HttpOnly cookies; Supabase is cross-origin and cross-site cookies vary by browser. This implementation deliberately uses opaque bearer tokens: sessionStorage by default, localStorage only with Remember.

A copied token grants its scoped access until expiry/revocation. Same-origin JavaScript could read browser storage, giving this design more XSS exposure than same-origin HttpOnly cookies. React escapes text; the app uses no third-party scripts/analytics/service worker, uses TLS in production, omits cookies and avoids course tokens in URLs. Static Pages has a meta CSP, but Next hydration still requires unsafe-inline; that is not a complete XSS defense.

For stronger token isolation, move frontend/gateway behind a same-origin server supporting Secure/HttpOnly/SameSite cookies and a nonce-based CSP. Do not silently add cross-site cookies to Pages and assume universal support.

## Limits, proxy and maintenance

Limits are 8 attempts per course/device in 15 minutes and 500 per course/network per hour. Normal device lockouts do not block a whole classroom. The higher network ceiling limits device-ID cycling; sustained abuse from the same NAT can still exhaust it. Retry-After and readable guidance are returned. Successful unlocks also count.

Only HMAC network identifiers are stored, not raw IPs. The deployment must provide the trusted rightmost client address in X-Forwarded-For, correctly stripping/appending untrusted values. Verify spoofing behavior on the actual gateway. Missing metadata fails closed with 503. Different proxy topologies need reviewed extraction rules and retesting.

Use a trusted scheduled job to prune attempt windows older than 48 hours and sessions more than 30 days past expiry. Never prune active limiter windows. Audit events contain action/entity/actor IDs, not secrets. Disable body/header/SQL parameter capture in any custom logging integration.

Service-role credentials stay in Edge Function secrets. Browser keys cannot read secret/session tables or invoke privileged RPCs. See [pgcrypto password hashing](https://www.postgresql.org/docs/current/pgcrypto.html), [Supabase secrets](https://supabase.com/docs/guides/functions/secrets) and [signed URL API](https://supabase.com/docs/reference/javascript/file-buckets-createsignedurl).

## Instructor recovery

Instructor authentication remains separate through Supabase Auth. Existing first-password change and credential-version controls remain. An interrupted change fails closed; a trusted operator must reconcile Auth app_metadata.credential_version with hub_accounts without decreasing versions, verify no operation is running, and recover the affected credential_operation/must_change_password state. Never bypass version checks or use a course password as administrator authentication.
