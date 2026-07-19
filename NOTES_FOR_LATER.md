# Notes For Later

Items noticed while working in other phases, deliberately not acted on because they're out of scope for the task at hand. Revisit these separately.

---

## Untracked D1 schema — `certificates` table

The `certificates` table exists in live production D1 but has no corresponding `CREATE TABLE` statement in `migrations/` (confirmed: only `migrations/0001_initial_schema.sql` exists, and it does not define this table). Local dev D1 will not have this table unless someone creates it manually.

Confirmed live schema (via `wrangler d1 execute --remote`, 2026-07-19):
```sql
CREATE TABLE certificates (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  applicant_id TEXT,
  lpx_id TEXT,
  first_name TEXT,
  last_name TEXT,
  cohort TEXT,
  issued_at TEXT
)
```

**Recommendation:** add a migration file capturing this table so schema is reproducible for local dev / new environments, and so future schema changes are tracked like the rest of the database. Not fixed now — noted during Phase 3, item 2 (certificate cross-datastore bug fix).

---

## `lpx-id` lookup still allows email-guessing (residual risk after H1 fix)

`app/api/public/lpx-id/route.ts`, `action: "lookup"`, no longer returns the full applicant record (fixed — Phase 3, item 4 / SECURITY_AUDIT.md H1), but it still returns name, business name, cohort, and profile fields (`first_name`, `last_name`, `email`, `business_name`, `cohort`, `preferred_name`, `alternate_phone`, `linkedin`, `photo_path`) to anyone who submits a guessed or scraped email address — there is still no OTP gate or rate limiting on this endpoint.

**Recommendation:** this is exactly SECURITY_AUDIT.md finding M4 (repeated email/code-only lookup pattern across public endpoints) and ties into H2 (OTP brute force) / M2 (no rate limiting). Not fixed now — deliberately deferred per the Phase 3 plan (item 10/M4), which comes after items 5-9. Address with the rest of that batch, not in isolation.

---

## NEW — `additional-details` allows overwriting another applicant's profile with no ownership proof

**Discovered during Phase 3, item 8 (M2 rate-limiting pass) — not in the original SECURITY_AUDIT.md findings, flagged here so it isn't lost.**

`app/api/public/additional-details/route.ts` accepts `{email, first_name, last_name, phone, business_name, business_stage, industry, business_description, linkedin}` and, if an `applicants` row matches the given `email`, silently overwrites those fields on that applicant's record (`d1UpdateById("applicants", matches[0].id, updateFields)`) — with no authentication, no OTP verification, and no proof the requester owns that email address. Anyone who knows or guesses an applicant's email can submit this endpoint and rewrite their name, phone, business details, and LinkedIn URL.

This is an **authorization gap** (unauthenticated mutation of another person's data), not just a rate-limiting or data-exposure issue like the M4 family above — it's a different, more serious class of bug. Rate limiting (added in item 8) provides partial mitigation against automated abuse but does not close the underlying gap: a single deliberate request from a knowledgeable attacker still succeeds.

**Recommendation:** require the same proof-of-ownership fix being planned for the M4/lookup family (OTP-verified email, or equivalent) before allowing this endpoint to mutate an existing applicant record. Not fixed now — out of scope for item 8 (M2 is rate-limiting only). Should likely be triaged as its own severity-rated finding rather than folded into an existing one, since it wasn't in the original audit.

---

## DONE — item 10 (M4) fully complete: 10a, 10b, and 10c

Phase 3 item 10 (M4) was split into three parts, all now done:
- 10a: `certificate/lookup` and `video-pitch/lookup` (FIXES_LOG.md entry 10a).
- 10b: `verification/lookup` (FIXES_LOG.md entry 10b) — only the PII-bearing branch of `VerificationForm.tsx`'s `handleFormLookup` was gated; `handleCheckStatus` needed no changes.
- 10c: `lpx-id` (`action: "lookup"`), both `app/id/page.tsx` (standard submit-triggered gate) and `app/id/success/page.tsx` (status-based render reacting to its existing auto-fire lookup — no extra round-trip needed) (FIXES_LOG.md entry 10c). `lpx_id` itself was kept ungated (needed for the `/id` → `/id/success` redirect and low sensitivity as an opaque identifier); the rest of the profile fields are gated.

All five gated call sites reuse the same `lib/engine/otpGate.ts` (`hasRecentOtpVerification`, 10-minute window matching `email_otps.expires_at`) and `components/forms/OtpGate.tsx`, both built once in 10a — no duplicated OTP logic anywhere in the set.

---

## `app/id/success/page.tsx` sends `emailValue` to `lpx-id` lookup raw, unlike every other consumer

Discovered during Phase 3, item 10c. Every other frontend caller of `/api/public/lpx-id` (and its sibling lookup endpoints) normalizes the email client-side before sending (`.trim().toLowerCase()`) — e.g. `app/id/page.tsx`'s `runLookup()`. `app/id/success/page.tsx`'s `runLookup()` sends `emailValue` (the raw `email` query-string param) as-is, untrimmed and not lowercased.

**Why this hasn't caused a visible bug:** the backend route itself normalizes the email server-side (`normalizedEmail = email.trim().toLowerCase()`, added in item 10c) before querying D1, so a case/whitespace mismatch doesn't currently break the lookup. But the raw value is still used client-side to build the `lpx-id/photo/[...key]` URL (`?email=${encodeURIComponent(emailValue)}`) and passed to `OtpGate` — if the query param ever arrives with different casing or stray whitespace (e.g., a manually-edited or copy-pasted URL), the photo-ownership check (item C1, which does its own server-side `.trim().toLowerCase()` before comparing) would still work, but it's inconsistent with the rest of the codebase's convention and worth normalizing for consistency's sake.

**Recommendation:** normalize `emailValue` once near the top of `SuccessCardContent` (e.g. `const normalizedEmail = emailValue.trim().toLowerCase();`) and use it everywhere the raw value is currently used. Not fixed now — flagged during item 10c, out of scope for that item.

---

## Debug tools (`debug-reminders`, `debug-video-invite`, `cron/debug-query`) query Firestore, not D1

Discovered during Phase 3, item 11 (L1). All three debug/diagnostic routes — now disabled in production via a `NODE_ENV` guard, see FIXES_LOG.md entry 11 — query **Firestore** (`firestoreQuery`/`firestoreQueryOrdered`) exclusively. But the real cron jobs they were built to diagnose (`video-invite-batch` and the reminder batch jobs) now read from **D1** (`d1QueryOrdered`), per ARCHITECTURE.md's known Firestore→D1 migration.

This means these tools are likely already of limited diagnostic value against current production behavior — they're inspecting a datastore that may no longer reflect what the live invite/reminder logic is actually doing. Not fixed now — flag only. If these tools are ever needed again (e.g., to debug a live invite/reminder issue), they'll likely need to be rewritten against D1 first, or they'll report on stale/irrelevant data.

---

## Local dev (`npm run dev`) was missing `initOpenNextCloudflareForDev()` — likely broken for a long time

Discovered outside the Phase 3 plan, while debugging a local dev failure. `next.config.js` never called `initOpenNextCloudflareForDev()` (now fixed). Without it, `getCloudflareContext()` has no Cloudflare bindings (D1, KV, R2, AI) to read under plain `next dev` — it throws instead.

This function is called, directly or indirectly, by a very large share of the app: `lib/db/d1-admin.ts`'s internal `getDb()` helper (used by ~75 routes per `ARCHITECTURE.md`), plus every route that touches R2 or KV directly (`send-otp`, `verify-otp`, uploads, rate-limited routes from Phase 3 item 8, etc.). Since this predates all of Phase 1-3's changes (confirmed: `send-otp/route.ts` and `lib/db/d1-admin.ts` already contained unedited `getCloudflareContext()` calls the first time either was read in this session), **any route depending on it has likely never worked correctly under `npm run dev`, for as long as this gap existed** — not just the routes touched in this session.

**Worth confirming with the rest of the team (if any):** whether this means local dev has been effectively unusable/untested via `next dev` for a meaningful period, and if so, how functionality was being verified locally before now (e.g., always via `wrangler dev`/`opennextjs-cloudflare preview` instead, which wouldn't have hit this gap — worth checking which workflow was actually in use). Not something to guess at or fix further here — a team/process question, not a code question.

---

## `firestoreQueryOrdered` computes `kv`/`kvKey` but never uses them

Discovered during Phase 4 Tier 1 item 3 (splitting `lib/firebase/rest-admin.ts`), while reading the full file before moving it. `firestoreQueryOrdered` calls `const kv = await getKvNamespace();` and builds a `kvKey`, but neither is ever referenced again in the function body — unlike `firestoreGetAll`, which has full working KV staleness-caching logic. This looks like incomplete/vestigial caching that was never finished for the ordered-query path. Moved as-is during the Tier 1 item 3 file split, not fixed — fixing it would be a logic change, out of scope for a no-behavior-change refactor phase.

---

## Possibly orphaned routes: `list-legacy-sent`, `schedule-legacy-batch`, `send-single-legacy`, `staged-legacy/edit`

Discovered during Phase 4 Tier 2's `(legacy-outreach)` route-group move. A full-repo grep for these four routes' URLs found **zero callers anywhere in `app/` or `components/`** — no `fetch()` references them from any frontend component or any other server-side route, unlike their siblings in the same group (`batch-link`, `rejection-followups`, `followup-batches`, `staged-batches`, `staged-legacy/add`, `staged-legacy/remove`), which are all actively called from `components/admin/*Panel.tsx` files.

Not investigated further — flagged only. Determining whether a route is truly dead (versus called by something outside this codebase's visibility, the same way the cron routes are hit by an external scheduler per `ARCHITECTURE.md`) is a Phase-3-style behavioral investigation, not something to resolve during a structural move.

---

## Possibly orphaned routes: `bulk-import-participants`, `bulk-import-approved`, `cancel-bulk-import`, `promote-to-participants`

Discovered during Phase 4 Tier 2's `(participants)` route-group move. A full-repo grep (including broader term searches, not just exact URL matches) found **zero callers anywhere in `app/`, `components/`, or `scripts/`** for these four routes — no frontend component or other server-side route references them. Only their sibling in the same group, `program-participants`, has an active caller (`components/admin/AdminShell.tsx:39`).

This is a larger orphaned cluster than the `(legacy-outreach)` group's four — worth noting these two findings together might indicate a pattern (e.g., an admin bulk-import/participant-promotion UI flow that was built server-side but never wired up on the frontend, or was wired up and later removed). Not investigated further — flagged only, same reasoning as the `(legacy-outreach)` note above.

---

## Possibly orphaned routes: `send-single-verification-decision`, `send-verification-email`, `force-release-date`, `force-release-date-by-id`, `force-invite-age`

Discovered during Phase 4 Tier 2's `(verification-review)` route-group move. Full-repo grep found **zero callers anywhere in `app/`, `components/`, or `scripts/`** for these five routes. Only two siblings in the same group — `verifications` and `bulk-verification-decision` — have active callers (both from `components/admin/VerificationsTable.tsx`).

This is now the **third and largest orphaned cluster found across the Tier 2 route-group moves** (5 of 7 routes in this group), following similar findings in `(legacy-outreach)` (4 of 10) and `(participants)` (4 of 5). The recurring pattern — single-item admin actions and "force override" endpoints consistently lacking frontend callers, while list/bulk-action endpoints are consistently wired up — may be worth a dedicated investigation once Tier 2 is complete, rather than continuing to accumulate individual notes. Not investigated further now — flagged only, same reasoning as prior notes.

---

## Possibly orphaned routes: `send-single-video-decision`, `send-single-video-invite`

Discovered during Phase 4 Tier 2's `(video-review)` route-group move. Zero callers anywhere in `app/`, `components/`, or `scripts/` for these two routes. Siblings `video-submissions` and `bulk-video-decision` (same group) both have active callers (`components/admin/VideoSubmissionsTable.tsx`). Same recurring pattern as prior groups — single-item decision/invite actions orphaned, list/bulk endpoints wired up. Not investigated further — flagged only.

---

## Possibly orphaned routes: `backfill-awaiting-flags`, `backfill-batch-ids`, `migrate-to-d1`

Discovered during Phase 4 Tier 2's `(maintenance)` route-group move. Zero callers anywhere in `app/`, `components/`, or `scripts/` for these three routes. Sibling `backup-to-r2` (same group) has an active caller (`components/admin/EngineMonitorShell.tsx`). Unlike the other orphaned clusters found in this session, these three plausibly ARE meant to be uncalled by the frontend — they read as one-off maintenance/migration tools (`migrate-to-d1` in particular is the Firestore→D1 migration tool itself, per `ARCHITECTURE.md`) likely intended for manual/curl invocation by an admin, not routine UI-triggered actions. Not investigated further — flagged only, consistent with the standing "flag, don't investigate" rule for this phase.
