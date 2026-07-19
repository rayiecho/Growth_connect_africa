# Fixes Log — Phase 3 (Debugging)

Permanent record of bugs fixed during Phase 3. One entry per fix: what was broken, what changed, which files were touched. No refactoring, renaming, or restructuring is included in these fixes — each is scoped to the specific bug only.

---

## 1. OTP cross-datastore bug (ARCHITECTURE.md issue #1)

**What was broken:** `app/api/public/send-otp/route.ts` wrote the OTP code to the D1 table `email_otps` (`INSERT OR REPLACE INTO email_otps ...`), but `app/api/public/verify-otp/route.ts` read it back from a Firestore collection of the same name (`firestoreGetById("email_otps", ...)`). Since the write went to D1 and the read went to Firestore, verification would never find the code that was actually generated — this appeared to make the `verify-otp` endpoint permanently broken for any code issued after the app's Firestore→D1 migration.

**What changed:** `verify-otp/route.ts` now reads and updates the same D1 `email_otps` table that `send-otp` writes to, using the D1 binding directly (`db.prepare("SELECT ... WHERE email = ?")` / `db.prepare("UPDATE ... WHERE email = ?")`), matching the schema (`email` primary key, no `id` column — confirmed via `migrations/0001_initial_schema.sql:123-129`) and mirroring the same raw-binding pattern already used correctly elsewhere in the app (`app/api/public/verify-application-email/route.ts`, `app/api/public/send-otp/route.ts`).

Request/response shape, status codes, code format, and 10-minute expiry are all unchanged — only the datastore `verify-otp` reads/writes against changed.

**Verified before applying:** grepped the full codebase for `email_otps` — confirmed no other code path reads or writes this table via Firestore, so nothing downstream depended on the old (broken) Firestore read.

**Files touched:**
- `app/api/public/verify-otp/route.ts`

---

## 2. Certificate cross-datastore bug (ARCHITECTURE.md issue #2)

**What was broken:** `app/api/admin/mark-completed/route.ts` writes new certificates to the D1 table `certificates` (`d1Add("certificates", {...})`), but `app/api/public/verify/[code]/route.ts` (backing the public `/verify/[code]` certificate-verification page) read from a Firestore collection of the same name (`firestoreQuery("certificates", ...)`). Certificates issued after the app's Firestore→D1 migration would be unfindable by the public verification page, which would incorrectly report a genuine certificate as invalid.

**What changed:** `verify/[code]/route.ts` now queries the D1 `certificates` table via `d1Query("certificates", [{field: "code", op: "EQUAL", value: code}])` instead of `firestoreQuery`. Live D1 schema was confirmed by the user directly against production (`wrangler d1 execute --remote`) before the diff was written, and matches exactly the fields `mark-completed` writes and the fields the response reads (`code`, `applicant_id`, `lpx_id`, `first_name`, `last_name`, `cohort`, `issued_at`, plus a primary key `id`). `code` is `UNIQUE` in the schema, so taking `matches[0]` is correct.

Response shape and status codes to the public verify page are unchanged: `{valid: false}` on no match, `{valid: true, first_name, last_name, lpx_id, cohort, issued_at}` on match, 500 on error. `app/verify/[code]/page.tsx` required no changes.

**Verified before applying:** grepped the full codebase for `certificates` — confirmed only three references total (the D1 write in `mark-completed`, the D1 table listing in `backup-to-r2`, and the Firestore read in `verify/[code]` that was the bug). No other path reads or writes this table in either datastore.

**Note:** the `certificates` table exists in production D1 but is not captured in any migration file (`migrations/` only defines the base schema, no `certificates` table). This is untracked-schema debt, not part of this bug fix — logged separately in `NOTES_FOR_LATER.md`.

**Files touched:**
- `app/api/public/verify/[code]/route.ts`
- `NOTES_FOR_LATER.md` (new — untracked schema note, documentation only)

---

## 3a. Admin notes cross-datastore bug — SCHEMA CHANGE (ARCHITECTURE.md issue #3)

**What was broken:** `app/api/admin/applicants/route.ts` (the `ApplicantTable` "save" action for assigned reviewer / notes / next-action) wrote via `firestoreUpdateById("applicants", id, ...)` — Firestore — while the applicant's canonical record and `id` live in D1. Investigation (before any code change) confirmed the applicant `id` the frontend sends is a valid D1 UUID (`crypto.randomUUID()`, generated in `lib/db/d1-admin.ts:27`), so the bug was purely "writing to the wrong datastore," not an ID mismatch.

**Schema gap found:** the D1 `applicants` table did not have the columns this route needed (`assigned_reviewer`, `notes`, `next_action_required`, `last_updated`) — confirmed by querying production directly (`wrangler d1 execute launchpadx_db --remote --command "SELECT sql FROM sqlite_master WHERE name='applicants'"`) rather than trusting the tracked migration file, per the lesson learned from the certificates fix. A straight "switch to D1" code change was not possible without first adding these columns.

**What changed (this sub-step only — schema, no application code):** added `migrations/0002_add_applicant_review_fields.sql`:
```sql
ALTER TABLE applicants ADD COLUMN assigned_reviewer TEXT;
ALTER TABLE applicants ADD COLUMN notes TEXT;
ALTER TABLE applicants ADD COLUMN next_action_required TEXT;
ALTER TABLE applicants ADD COLUMN last_updated TEXT;
```
All four columns are nullable `TEXT` with no default, matching what the application code already expects.

**Rollout sequence:**
1. Ran `migrations/0001_initial_schema.sql` against local D1 first — discovered local dev D1 had no `applicants` table at all (never initialized). Succeeded, 29 commands, no errors.
2. Ran `migrations/0002_add_applicant_review_fields.sql` against local D1 — succeeded, 4 commands, no errors. Verified via `PRAGMA table_info(applicants)` that all four columns were present.
3. Ran `migrations/0002_add_applicant_review_fields.sql` against **production** D1 (`--remote`) only after explicit approval — succeeded, 4 queries in 5.89ms, no errors, no reported downtime. Verified via `PRAGMA table_info(applicants)` against production directly that all four columns exist live.

**Files touched:**
- `migrations/0002_add_applicant_review_fields.sql` (new)
- D1 schema itself (local dev DB and production DB), via the migration above — no application code changed in this sub-step.

**Note:** this is a schema-only change. The application code in `app/api/admin/applicants/route.ts` still writes to Firestore at this point — that is sub-step 3b, tracked separately, only to be done once this migration was confirmed live in production (confirmed above).

---

## 3b. Admin notes cross-datastore bug — CODE FIX (ARCHITECTURE.md issue #3)

**What was broken:** with the D1 columns now in place (3a), `app/api/admin/applicants/route.ts` still wrote via `firestoreUpdateById("applicants", id, ...)` — Firestore — while the applicant's canonical record lives in D1. The `ApplicantTable` "save" action (assigned reviewer / notes / next-action) was therefore updating an orphaned Firestore document, not the record admins were actually viewing.

**What changed:** replaced the Firestore write with `d1UpdateById("applicants", id, {...})` (`lib/db/d1-admin.ts:55-69`), the same helper already used for every other applicant-field update in the codebase (e.g. `app/api/admin/mark-completed/route.ts`, `app/api/public/lpx-id/route.ts`). `applicants.id` is a `TEXT PRIMARY KEY`, matching `d1UpdateById`'s `WHERE id = ?` shape exactly — no adaptation needed, unlike item 1's `email_otps` table which has no `id` column.

Response shape to the frontend is unchanged: `{success: true}` (200) on success, `{error: "id is required."}` (400), `{error: "Failed to save changes."}` (500) on failure — `d1UpdateById` throws on error the same way `firestoreUpdateById` did, so the existing try/catch behaves identically.

`components/admin/ApplicantTable.tsx` required no changes — it already reads `assigned_reviewer`/`notes`/`next_action_required` off the D1-sourced applicant prop (confirmed by grep during investigation), so this fix makes save → reload round-trip correctly for the first time, resolving the "always blank on reload" symptom.

**Files touched:**
- `app/api/admin/applicants/route.ts`

**Item 3 status: fully complete.** Both the schema (3a — four columns added to production D1) and the code path (3b — write redirected from Firestore to D1) are done. The admin notes/reviewer/next-action save feature now reads and writes the same table consistently.

---

## 4. H1 — full applicant record disclosed via `lpx-id` lookup (SECURITY_AUDIT.md)

**What was broken:** `app/api/public/lpx-id/route.ts`, `action: "lookup"`, returned the entire D1 `applicants` row (`data: applicantData` — all ~59 columns, including phone, business description, application answers, internal review/reviewer fields, cron/reminder timestamps, batch IDs, etc.) to anyone who submitted an email address, with no authentication, no OTP verification, and no rate limiting. This allowed scraping full applicant profiles via email enumeration.

**What changed:** the `lookup` response now returns only the fields the frontend actually consumes, confirmed by reading every call site before making the change:
- `app/id/page.tsx` uses: `hasId`, `isEligible` (top-level), and `data.lpx_id`, `data.first_name`, `data.last_name`, `data.email`, `data.business_name`.
- `app/id/success/page.tsx` uses: `data.cohort`, `data.preferred_name`, `data.alternate_phone`, `data.linkedin`, `data.photo_path`.

The response now explicitly lists exactly these 10 `data` fields plus `success`/`hasId`/`isEligible` at the top level, and drops `currentStage` (confirmed unread by both consumers) and everything else previously present on `applicantData`. `generate` and `update_profile` branches were not touched.

**Response shape confirmation:** every field either frontend page reads is present in the new shape — verified line-by-line against both files before applying, not assumed.

**Residual risk — logged, not fixed:** this endpoint still allows anyone who knows or guesses an applicant's email to retrieve their name, business name, cohort, and profile fields, since there's still no OTP gate or rate limiting on `lookup`. This is intentionally deferred to item 10 (SECURITY_AUDIT.md M4) per the Phase 3 plan, and noted in `NOTES_FOR_LATER.md`.

**Files touched:**
- `app/api/public/lpx-id/route.ts`
- `NOTES_FOR_LATER.md` (residual-risk note, documentation only)

---

## 5. H2 — OTP brute-forceable, no rate limiting (SECURITY_AUDIT.md)

**What was broken:** `send-otp` and `verify-otp` had no rate limiting and no attempt lockout. A 6-digit code (900,000 possibilities) with a 10-minute expiry was brute-forceable by scripting rapid requests to `verify-otp`. `lib/engine/rateLimit.ts` already implemented `checkRateLimit()`, but a repo-wide grep confirmed it had zero call sites anywhere — this fix is its first real usage.

**What changed:**
- `app/api/public/send-otp/route.ts` now checks two limits before generating/sending a code, using the `TOKEN_CACHE` KV binding: **5 requests per email per 60 minutes** (stops `send-otp` being used to email-bomb a victim's inbox, since it requires no proof of ownership) and **20 requests per IP per 60 minutes**, via `req.headers.get("cf-connecting-ip")` (stops one attacker cycling through many target emails; looser than the per-email cap to tolerate shared/office IPs). Both return `429 {error: "Too many requests. Please try again later."}` — same message for both limits, deliberately, so the response doesn't reveal which limit was tripped.
- `app/api/public/verify-otp/route.ts` now checks **5 attempts per email per 10 minutes** (window matched to the OTP's own 10-minute expiry so the lockout and the code's natural expiry age out together) before looking up the code. Returns `429 {error: "Too many attempts. Please request a new verification code."}` on lockout — actionable messaging telling the legitimate user what to do next.

Chose KV via the existing `checkRateLimit()` helper over adding a new `email_otps` column, to avoid a second schema-migration cycle in this session and because it's exactly the tool already built for this purpose.

**Known limitation carried over (already documented as M2):** `checkRateLimit()` fails open if the KV binding is unavailable or `kv.get`/`kv.put` throws — if `TOKEN_CACHE` is ever down, these limits silently stop applying rather than blocking requests. This fix starts using the helper as-is; it does not change its fail-open behavior, which remains tracked separately as SECURITY_AUDIT.md M2.

**Files touched:**
- `app/api/public/send-otp/route.ts`
- `app/api/public/verify-otp/route.ts`

---

## 6. H3 — unused Supabase service-role key (SECURITY_AUDIT.md)

**What was broken:** a live, full-privilege Supabase service-role key (bypasses Row Level Security) sat in `.env.local`, alongside `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, even though the entire Supabase integration (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/engine/supabaseAdmin.ts`) had zero import sites anywhere in `app/` or `components/` — confirmed again before this fix by grepping both directories for any import of those three files. This was an orphaned, unmonitored credential, not part of the app's live code path.

**Note: the key itself was already rotated/revoked at the Supabase dashboard by the user before this cleanup started.** This entry covers only the codebase/env cleanup that followed.

**What changed:**
- Deleted `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/engine/supabaseAdmin.ts`, and the now-empty `lib/supabase/` directory.
- Removed `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and their associated comments from both `.env.example` and `.env.local`.
- Removed `"@supabase/ssr"` and `"@supabase/supabase-js"` from `package.json` dependencies.

**Verified before deleting:** a repo-wide grep (excluding `node_modules`) for "supabase" found only documentation references (`ARCHITECTURE.md`, `SECURITY_AUDIT.md`), lockfile/package.json entries, the three files deleted here, the two `.env*` files, and four standalone Python scripts at the repo root (`patch_form.py`, `inspect_form.py`, `update_dashboard_query.py`, `add_industry_field2.py`) that are historical, not imported by the app, and were left untouched as out of scope for this item.

**Lockfile sync (follow-up, same item):** ran `npm install` to sync `package-lock.json` and `node_modules` with the `package.json` change. Completed with no errors — 11 packages removed (the two `@supabase/*` packages plus transitive dependencies), `package-lock.json` confirmed to have zero remaining "supabase" references, and a leftover empty `node_modules/@supabase/` directory was removed. (Unrelated, pre-existing `npm audit` findings and `allow-scripts` warnings surfaced during install — not caused by this change, not actioned, noted here only for visibility.)

**Not done (flagged, not actioned):** `new_package.json` and `old_package.json` (unused backup files, not the active `package.json`) still reference the deps; left untouched as out of scope.

**Files touched:**
- Deleted: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/engine/supabaseAdmin.ts`
- Edited: `.env.example`, `.env.local`, `package.json`, `package-lock.json` (via `npm install`)

---

## 7. M1 — `NEXT_PUBLIC_CRON_SECRET` pattern in `.env.example` (SECURITY_AUDIT.md)

**What was broken:** `.env.example` documented a `NEXT_PUBLIC_CRON_SECRET` variable, with a comment instructing a future developer to duplicate `CRON_SECRET` (the single shared secret gating every `app/api/cron/*` batch job) into a `NEXT_PUBLIC_`-prefixed variable "so the admin dashboard can call video-action API routes." Next.js bakes any `NEXT_PUBLIC_`-prefixed variable into the client-side JS bundle at build time — if anyone had followed this instruction, the one secret protecting all cron/batch endpoints (mass email sends, decision releases) would become extractable by any website visitor via the browser bundle.

**Confirmed not currently exploited:** grepped `app/`, `components/`, and `lib/` for `NEXT_PUBLIC_CRON_SECRET` — zero references anywhere. It was also unset in `.env.local`. This was a documented landmine, not a live leak.

**Confirmed the pattern it was justifying isn't actually needed:** the only frontend code that triggers cron-adjacent actions is `components/admin/EngineMonitorShell.tsx:74-89` (`handleTrigger`), which calls `POST /api/admin/engine/trigger-cron` — already gated by `getVerifiedAdminSession()` server-side (`app/api/admin/engine/trigger-cron/route.ts`), which then does its own server-side fetch to the real `/api/cron/{endpoint}?secret=...` using `process.env.CRON_SECRET`. The secret never leaves the server today; `NEXT_PUBLIC_CRON_SECRET` was redundant with a pattern that already exists and is already correct.

**What changed:** removed the `NEXT_PUBLIC_CRON_SECRET` variable and its comment block from `.env.example`. `CRON_SECRET` itself (the real, server-only secret) was left untouched. Nothing removed from `.env.local` since the variable was never set there.

**Files touched:**
- `.env.example`

---

## 8. M2 — no rate limiting on public endpoints (SECURITY_AUDIT.md)

**What was broken:** `checkRateLimit()` (`lib/engine/rateLimit.ts`) had zero call sites outside the two routes fixed in item 5 (`send-otp`, `verify-otp`). Every other route under `app/api/public/*` — 20 routes — accepted unlimited requests, exposing form-spam, storage-cost abuse, AI-inference-cost abuse, and email-enumeration risks documented in SECURITY_AUDIT.md.

**Scope decisions made before implementation (confirmed with user):**
- `verification/file/[...key]` **excluded** — already gated by `getVerifiedAdminSession()`, not part of the unauthenticated public-abuse surface M2 covers.
- `verify-application-email` **bundled in using the item-5 attempt-lockout pattern** (5 attempts/email/10min), not a generic per-IP counter, since it checks a stored OTP code against user input — the same brute-force class as H2, not a spam-prone form.
- A newly-discovered authorization gap in `additional-details` (unauthenticated overwrite of another applicant's profile fields by email) was logged to `NOTES_FOR_LATER.md` as a new, unrated finding — explicitly out of scope for this item (M2 is rate-limiting only), not fixed here.

**What changed:** added the `checkRateLimit()` pattern established in item 5 to all 18 remaining routes (per-IP, keyed by `req.headers.get("cf-connecting-ip")`) plus `verify-application-email` (per-email attempt lockout). All use the identical `429 {error: "Too many requests. Please try again later."}` response, except `verify-application-email` (matches `verify-otp`'s actionable lockout message) and `rejection-followup` (plain-text 429 body, matching that route's existing non-JSON response convention).

| Route | Limit | Reasoning |
|---|---|---|
| `apply` | 10/hour/IP | Fake applications + wasted Elastic Email sends |
| `verification` (submit) | 10/hour/IP | Submission spam, despite invite/payment preconditions |
| `video-pitch` (submit) | 10/hour/IP | Submission spam, despite invite precondition |
| `additional-details` | 10/hour/IP | Spam + partial mitigation for the authz gap noted above |
| `email-reply` | 10/hour/IP | Admin-inbox thread spam |
| `contact` | 10/hour/IP | Admin-inbox spam |
| `sos` | **5/hour/IP** | Sends a real alert email to staff every submission — tightest limit, avoids paging-fatigue |
| `chatbot` | 20/hour/IP | Real Workers AI inference cost per message; generous enough for a real multi-turn conversation |
| `funnel-event` | **60/hour/IP** | Legitimately high-frequency (fires per form step in one session) |
| `verification/lookup` | 10/hour/IP | Email-enumeration (M4 family) |
| `video-pitch/lookup` | 10/hour/IP | Email-enumeration (M4 family) |
| `certificate/lookup` | 10/hour/IP | Email-enumeration (M4 family) |
| `lpx-id` (lookup/generate/update_profile) | 10/hour/IP | Email-enumeration (M4 family); one key covers all three actions |
| `verification/upload` | 10/hour/IP | R2 storage-cost abuse, no ownership proof |
| `lpx-id/upload-photo` | 10/hour/IP | R2 storage-cost abuse, no ownership proof |
| `rejection-followup` | 20/hour/IP | Looser — tolerates email-scanner link pre-fetching |
| `verify/[code]` | 20/hour/IP | Scripted scraping of certificate codes |
| `lpx-id/photo/[...key]` | 30/hour/IP | Loosest GET — loads as `<img>`/feeds ID-card generation, already ownership-checked (item 4) |
| `verify-application-email` | **5 attempts/email/10min** (not per-IP) | Brute-forceable OTP-code check — same class as H2, uses item 5's exact lockout pattern |

**Structural note:** three routes (`verification/upload`, `lpx-id/upload-photo`, `lpx-id/photo/[...key]`) already called `getCloudflareContext()` later in their handler for R2 access; the rate-limit check now calls it once at the top and the original later call was removed to avoid a duplicate-declaration compile error, reusing the same `cfContext` for both purposes.

**Files touched:**
- `app/api/public/apply/route.ts`
- `app/api/public/verification/route.ts`
- `app/api/public/video-pitch/route.ts`
- `app/api/public/additional-details/route.ts`
- `app/api/public/email-reply/route.ts`
- `app/api/public/contact/route.ts`
- `app/api/public/sos/route.ts`
- `app/api/public/chatbot/route.ts`
- `app/api/public/funnel-event/route.ts`
- `app/api/public/verification/lookup/route.ts`
- `app/api/public/video-pitch/lookup/route.ts`
- `app/api/public/certificate/lookup/route.ts`
- `app/api/public/lpx-id/route.ts`
- `app/api/public/verification/upload/route.ts`
- `app/api/public/lpx-id/upload-photo/route.ts`
- `app/api/public/rejection-followup/route.ts`
- `app/api/public/verify/[code]/route.ts`
- `app/api/public/lpx-id/photo/[...key]/route.ts`
- `app/api/public/verify-application-email/route.ts`
- `NOTES_FOR_LATER.md` (new authz-gap note, documentation only)

---

## 9. M3 — non-constant-time secret comparison on cron routes (SECURITY_AUDIT.md)

**What was broken:** every `app/api/cron/*/route.ts` (10 batch/debug routes) plus `app/api/cron/debug-query/route.ts` compared the incoming `?secret=` query param against `process.env.CRON_SECRET` with plain `!==` string inequality — not constant-time, a theoretical (though hard-to-exploit-in-practice) timing side-channel. Confirmed by grep: 11 files total. (`app/api/cron/video/action-required/route.ts` was confirmed to use `getVerifiedAdminSession()` instead — a different auth mechanism, correctly excluded from this fix.)

**What changed:** added `lib/engine/timingSafeEqual.ts` — a constant-time string comparison built on plain Web Crypto (`crypto.subtle.digest("SHA-256", ...)`, no Node-compat dependency): both inputs are hashed to a fixed 32-byte digest first (so the comparison always runs the same number of iterations regardless of input length, avoiding both a length-based early-exit and Node's `crypto.timingSafeEqual`'s throw-on-length-mismatch footgun), then compared byte-by-byte with a non-short-circuiting XOR accumulator.

All 11 files were updated identically:
```ts
const expected = process.env.CRON_SECRET;
if (!secret || !expected || !(await timingSafeEqual(secret, expected))) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```
The explicit `!secret || !expected` guard preserves original behavior (reject unless both a secret was provided and `CRON_SECRET` is set) — without it, hashing two empty/missing values would incorrectly "match."

**Verified:** `npm run build` completed successfully (`✓ Compiled successfully`, `✓ Generating static pages (125/125)`) with all 11 routes present in the route manifest as dynamic (`ƒ`), confirming no compile errors across the change set.

**Files touched:**
- `lib/engine/timingSafeEqual.ts` (new)
- `app/api/cron/legacy-batch-send/route.ts`
- `app/api/cron/verification-outcome-batch/route.ts`
- `app/api/cron/video-reminder-batch/route.ts`
- `app/api/cron/non-applicant-followup/route.ts`
- `app/api/cron/verification-reminder-batch/route.ts`
- `app/api/cron/video-invite-batch/route.ts`
- `app/api/cron/debug-query/route.ts`
- `app/api/cron/send-responses/route.ts`
- `app/api/cron/video-outcome-batch/route.ts`
- `app/api/cron/video/approved/route.ts`
- `app/api/cron/video/rejected/route.ts`

---

## 10a. M4 — OTP-gate `certificate/lookup` and `video-pitch/lookup` (SECURITY_AUDIT.md, NOTES_FOR_LATER.md)

**What was broken:** `certificate/lookup` and `video-pitch/lookup` disclosed applicant-specific data (name, LaunchPadX ID, cohort, certificate code; and separately name, phone, email) to anyone who supplied a matching email — no proof of ownership. Rate limiting (item 8) slowed scraping but didn't stop a single targeted lookup against one specific person's email.

**What changed:** both routes now require a recent OTP verification for the email before returning the sensitive branches of their response (the flags-only branches — `not-found`, `not-eligible`, `notYetInvited`, `canSubmit: false` — are unchanged and still require no verification, since they carry no PII). "Recent" reuses the existing `email_otps.verified` + `expires_at` columns (no schema change) via a new helper, `lib/engine/otpGate.ts` → `hasRecentOtpVerification(email)`, matching the OTP code's own 10-minute window.

When verification is missing, both routes return `{..., otpRequired: true}` (200, not an error) instead of the real data. On the frontend, a new shared component `components/forms/OtpGate.tsx` handles the send-code/enter-code UI: auto-sends a code on mount (guarded by a `useRef` sentinel so React Strict Mode's dev-mode double-effect-invocation can't send a duplicate code), shows a code-entry form with resend, and calls a caller-supplied `onVerified()` once `verify-otp` succeeds.

Both consumers (`app/certificate/page.tsx`, `components/forms/VideoPitchForm.tsx`) had their lookup logic extracted from `handleLookup(e)` into a standalone `runLookup()`, so it can be re-invoked by `OtpGate`'s `onVerified` callback (re-running the lookup, which now succeeds since `email_otps.verified` is fresh) as well as by the original form submit. One new render branch was added to each, gated on `otpRequired`/`data.otpRequired`; every other existing branch (not-found, not-eligible, not-yet-invited, already-submitted, success states) is untouched.

**Design decisions made with the user before implementation:**
- OTP verification is remembered for the full 10-minute `email_otps.expires_at` window, not re-prompted on every lookup within that window — avoids forcing a fresh code entry on a page that calls its own lookup twice in quick succession (not applicable to these two routes specifically, but is by design for future 10b/10c reuse).
- `OtpGate` auto-sends on mount rather than requiring an extra "Send Code" click, since the user already submitted their email once to reach this point.
- The `useRef` mount-guard was specifically reviewed and confirmed necessary — an empty-dependency-array `useEffect` alone does not protect against Strict Mode's double-invocation in dev.

**Files touched:**
- `lib/engine/otpGate.ts` (new)
- `components/forms/OtpGate.tsx` (new)
- `app/api/public/certificate/lookup/route.ts`
- `app/api/public/video-pitch/lookup/route.ts`
- `app/certificate/page.tsx`
- `components/forms/VideoPitchForm.tsx`

---

## 10b. M4 — OTP-gate `verification/lookup` (SECURITY_AUDIT.md, NOTES_FOR_LATER.md)

**What was broken:** `verification/lookup` disclosed applicant PII (`applicant: {first_name, last_name, email, lpx_id}`) to anyone who supplied a matching email, in its final response branch — same unproven-ownership issue as 10a's two routes.

**Design decision (scoped with the user before implementation):** only the branch that actually returns `applicant: {...}` is gated — the earlier `notYetInvited` branch (which returns only `hasId`/`lpx_id` flags, no `applicant` object) is untouched, consistent with 10a's precedent of only gating PII-bearing branches. `components/forms/VerificationForm.tsx` calls this same endpoint from two places — `handleCheckStatus` (status flags only, no PII read) and `handleFormLookup` (the one that reads `data.applicant`) — and only the latter needed to react to the new gate. `handleCheckStatus` required zero changes: it never reads `applicant` or `otpRequired`, and the route still returns all the flags it does check (`hasId`, `lpx_id`, `alreadySubmitted`, `canResubmit`, `previousFeedback`) even when `otpRequired: true`, so its step-transition logic behaves identically either way.

**What changed:** reused the exact same `lib/engine/otpGate.ts` (`hasRecentOtpVerification`) and `components/forms/OtpGate.tsx` built in 10a — no new versions created. The route's final branch now checks OTP recency immediately before returning `applicant`, returning `{..., otpRequired: true}` (with all the status flags `handleCheckStatus` needs, but no `applicant`) if not verified.

On the frontend, `handleFormLookup`'s logic was extracted into `runFormLookup()` (distinct name from the file's pre-existing `runLookup(email)` raw-fetch helper, to avoid collision), gaining a new `otpRequired` branch that sets a new `needsOtp` state flag. A new render check (`if (needsOtp) return <OtpGate .../>`) was inserted before the existing `if (!applicant)` check within the `step === "form"` block. `runFormLookup` resets `needsOtp` to `false` at its own top (not just on success) — this file keeps `applicant` and the OTP-needed flag as separate state slots (unlike 10a's single unified `status`/`lookup` object), so the reset has to be explicit to ensure the gate correctly disappears once the retry succeeds.

**Files touched:**
- `app/api/public/verification/lookup/route.ts`
- `components/forms/VerificationForm.tsx`

(No new files — `lib/engine/otpGate.ts` and `components/forms/OtpGate.tsx` from 10a were reused unchanged.)

---

## 10c. M4 — OTP-gate `lpx-id` (`action: "lookup"`), both consumer pages (SECURITY_AUDIT.md, NOTES_FOR_LATER.md)

**What was broken:** `app/api/public/lpx-id/route.ts`'s `action: "lookup"` branch (already narrowed to a 10-field response in item 4) still returned that data to anyone who supplied a matching email, no proof of ownership — the last of the three M4 lookup endpoints.

**Design decisions made with the user before implementation:**
- `lpx_id` itself stays **ungated**, while the rest of the profile (`first_name`, `last_name`, `email`, `business_name`, `cohort`, `preferred_name`, `alternate_phone`, `linkedin`, `photo_path`) is gated. Reason: `app/id/page.tsx`'s `hasId` redirect branch needs `data.data.lpx_id` to build the `/id/success` URL, and this needs to keep working even before any OTP step has happened on that visit; an opaque generated ID string is also far less sensitive than the rest of the profile.
- `app/id/success/page.tsx`'s auto-firing `useEffect` lookup was **not** replaced with a separate pre-flight "check" call — the existing single lookup call already has to run `hasRecentOtpVerification` server-side, so the frontend just reacts differently to that same call's result (`otpRequired` vs. real data) instead of making an extra round-trip. This also means "already verified within the window" (e.g., arriving here seconds after completing the gate on `/id`) is handled automatically by the shared server-side check, with no special-casing needed on the frontend.
- Network/fetch failures on `/id/success` keep the page's original silent-fallback behavior (render with defaults, no error shown) rather than hard-blocking the ID-card success screen over a transient error.

**What changed:**
- `app/api/public/lpx-id/route.ts`: the `lookup` branch now checks `hasRecentOtpVerification(normalizedEmail)` (reusing 10a's helper); if not verified, returns `{success, hasId, isEligible, otpRequired: true, data: {lpx_id}}` — `lpx_id` present, everything else withheld. A `normalizedEmail` constant was introduced (small necessary refactor, not gratuitous) since both the existing D1 query and the new OTP check needed the same normalized value.
- `app/id/page.tsx`: `handleEmailLookup` extracted into `runLookup()` (standard 10a/10b-style extraction); a new `"otp"` step value renders `<OtpGate>` when `data.otpRequired`; the `hasId` redirect branch required no change.
- `app/id/success/page.tsx`: new `loadStatus` state (`"loading" | "otp-required" | "loaded"`, initialized to `"loaded"` immediately if there's no `email` query param, preserving today's no-op behavior for that edge case). The existing lookup logic was extracted into `runLookup()` (called from both the mount `useEffect` and `OtpGate`'s `onVerified`); its response handler now branches on `data.otpRequired` before falling through to the existing data-population logic. Two new early-return render branches show a loading indicator or `<OtpGate>`; the existing full-card UI is otherwise completely unchanged.

**Verified before applying:** confirmed `app/id/success/page.tsx` sends its email raw (not trimmed/lowercased) to the lookup call, unlike every other consumer — flagged as a new, separate `NOTES_FOR_LATER.md` entry (not fixed, out of scope for this item, doesn't currently cause a bug since the backend normalizes server-side).

**Item 10 (M4) status: fully complete — 10a, 10b, and 10c all done.**

**Files touched:**
- `app/api/public/lpx-id/route.ts`
- `app/id/page.tsx`
- `app/id/success/page.tsx`
- `NOTES_FOR_LATER.md` (marks item 10 fully done; adds the new raw-email note)

(No new files — `lib/engine/otpGate.ts` and `components/forms/OtpGate.tsx` from 10a were reused unchanged.)

---

## 11. L1 — debug routes shipped in production (SECURITY_AUDIT.md)

**What was broken (attack-surface reduction, not a live bug):** three diagnostic routes — `app/api/admin/debug-reminders/route.ts`, `app/api/admin/debug-video-invite/route.ts`, `app/api/cron/debug-query/route.ts` — were reachable in production. All three were already confirmed properly gated (admin session or `CRON_SECRET`) with no injection surface, so this wasn't exploitable as-is; the concern was purely that debug/inspection tooling shouldn't ship to production at all, regardless of how well it's currently gated, since it's extra surface that could be weakened by a future unrelated change.

**Options considered:** (a) a `NODE_ENV === "production"` runtime guard returning 404 — simplest, code still ships in the bundle but becomes unreachable; (b) physically excluding the files from the production build via a custom pre-build script — rejected as disproportionately fragile for a Low-severity, already-gated finding, since Next.js App Router has no built-in mechanism to exclude specific route files from a build, and a file-move script risks leaving the working tree in a bad state if it fails partway; (c) relocating the files out of `app/api/` into non-route dev scripts — rejected as a workflow disruption not justified by the finding's severity.

**What changed:** option (a) applied to all three files — a `NODE_ENV === "production"` check as the very first statement in each `GET` handler, before any auth/secret check, returning a flat `404 {error: "Not found"}` in production. This means production responses reveal nothing about whether the subsequent auth would have succeeded — indistinguishable from a route that doesn't exist. In development (`next dev`), all three continue to work exactly as before.

**Noted, not fixed:** while reading all three files in full to confirm their purpose (a required step before deciding what "attack surface" was actually being traded off), it was confirmed all three query Firestore, not D1 — but the real cron jobs they diagnose now read from D1. This means the tools may already be of limited diagnostic value against current production behavior. Logged to `NOTES_FOR_LATER.md`, not fixed — out of scope for this item.

**Item 11 status: complete. This was the last item in the Phase 3 plan (items 1-11, SECURITY_AUDIT.md findings resolved in order).**

**Files touched:**
- `app/api/admin/debug-reminders/route.ts`
- `app/api/admin/debug-video-invite/route.ts`
- `app/api/cron/debug-query/route.ts`
- `NOTES_FOR_LATER.md` (new Firestore/D1 mismatch note, documentation only)

---

## 12. Tier 4 finding — `force-release-date-by-id` had no field/table allowlist (unlike its sibling `force-release-date`)

**What was broken:** `app/api/admin/(verification-review)/force-release-date-by-id/route.ts` accepted raw `{collection, id, field}` from the request body with no validation, and would write today's date into any field on any D1 table by row ID. Its sibling, `force-release-date/route.ts`, restricts writes to exactly 4 known-safe `{collection, field}` combinations via a hardcoded `CONFIGS` allowlist. Discovered during Phase 4 Tier 4's investigation of orphaned routes (`TIER4_FINDINGS.md`) — flagged there as "Unclear — needs your input" given the risk difference between the two sibling routes, then confirmed as a fix to make in this session.

**What changed:** added an `ALLOWED_TARGETS` allowlist to `force-release-date-by-id/route.ts`, restricting `{collection, field}` combinations to the exact same 4 pairs `force-release-date`'s `CONFIGS` already permits (`applicants.video_invite_release_date`, `applicants.verification_deadline_date`, `video_submissions.outcome_release_date`, `verifications.outcome_release_date`). Requests targeting any other collection/field now get a `400 {error: "collection/field combination is not allowed.", validTargets: ALLOWED_TARGETS}` instead of silently succeeding. The by-id lookup mechanism itself (this route's distinguishing purpose vs. its sibling, which looks up by email) is unchanged.

**Confirmed no legitimate behavior lost:** `TIER4_FINDINGS.md`'s investigation found zero callers anywhere for this route (no frontend, no other route, no script), so nothing currently depends on it writing to any field/table outside the new allowlist. The allowlist itself is not a new, narrower policy — it's the same one its sibling route already establishes as "the valid things a force-release-date tool should touch."

**Verified:** `npm run build` completed with `✓ Compiled successfully`, no errors. URL (`/api/admin/force-release-date-by-id`) unchanged in the manifest.

**Files touched:**
- `app/api/admin/(verification-review)/force-release-date-by-id/route.ts`

---

## 13. Admin frontend Step 3, Fix 1 — legacy `video_submissions` rows with placeholder name and orphaned `applicant_id`

**What was broken:** diagnosed during the admin-frontend audit (Step 2) as the root cause of "video submissions contains wrong data" — 17 of 20 `video_submissions` rows had `applicant_id = NULL` and `applicant_first_name = "Founder"` (a literal placeholder), left behind by the one-off `bulk-import-approved` legacy-import script. `VideoSubmissionsTable.tsx` displays these denormalized name columns directly (no join), so admins saw "Founder" instead of the real name even where the linked `applicants` record had it correct.

**Verified via read-only `wrangler d1 execute --remote` queries before any write**: a `LEFT JOIN` against `applicants` by email confirmed all 17 rows had a matching applicant record (zero unmatched/orphaned), and previewed the exact before/after for each row.

**What changed (live D1, `--remote`):**
```sql
UPDATE video_submissions
SET applicant_id = (SELECT id FROM applicants WHERE applicants.email = video_submissions.applicant_email),
    applicant_first_name = (SELECT first_name FROM applicants WHERE applicants.email = video_submissions.applicant_email),
    applicant_last_name = (SELECT last_name FROM applicants WHERE applicants.email = video_submissions.applicant_email)
WHERE applicant_id IS NULL AND applicant_first_name = 'Founder'
  AND EXISTS (SELECT 1 FROM applicants WHERE applicants.email = video_submissions.applicant_email);
```
17 rows updated (confirmed via `changes: 17` in the query result). 5 of the 17 got a real name (the applicant's real name was captured elsewhere); the other 12 still show "Founder" post-fix because that's genuinely what's stored on their linked `applicants` record too — their real names were never captured anywhere in the system, applicant-side included. `lpx_id` was explicitly not touched anywhere, per instruction.

**Verified after:** re-ran the same `SELECT` — 0 rows remain matching the broken pattern. Spot-checked the 5 name-corrected rows individually; all show the expected real names.

**Data-only fix — no code changed.**

---

## 14. Admin frontend Step 3, Fix 2 — `AdminShell.tsx` program-participants silent-failure

**What was broken:** diagnosed during Step 2 as a secondary, real (if unconfirmed-as-primary) contributor to "participants not loading" reports — the `program-participants` fetch in `AdminShell.tsx` used a single `participantsLoaded` boolean set to `true` on both success and failure/`.catch()`. A failed first attempt (transient network issue, cold start, etc.) left the tab permanently empty for the rest of the session with no visible error and no retry.

**What changed:** replaced the boolean with a `"idle" | "loading" | "loaded" | "error"` status enum; `loadParticipants()` is now an independently callable function (not just an inline effect body). On `error`, the Program Participants tab renders "Failed to load program participants." with a **Retry** button that re-runs the same fetch — no full page reload needed. Mirrors the existing `text-red-500` error-message pattern already used elsewhere in the admin frontend; no new shared component introduced (that's deferred to the Step 4 design-system pass). Scope: `AdminShell.tsx` only, `program-participants` fetch only — no other panel touched.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`.

**Files touched:**
- `components/admin/AdminShell.tsx`

---

## 15. Admin frontend Step 3, Fix 3 — `backfill-awaiting-flags` investigated, confirmed no-op, skipped

**What was checked:** Step 2 flagged `awaiting_verification_submission = 0` across all applicants as a *possible* data problem (stale flags), noting `(maintenance)/backfill-awaiting-flags/route.ts` exists specifically to recompute these two flags but has no dry-run mode — it always writes if anything's out of sync.

**Verified via a read-only `SELECT` that mirrors the route's exact recompute logic** (`invite_sent_at IS NOT NULL AND submitted_at IS NULL` → should be awaiting) run against live D1: all four counts (`would_set_video_true`, `would_set_video_false`, `would_set_verification_true`, `would_set_verification_false`) were **0** across all 166 applicants.

**Conclusion: this route would currently be a complete no-op.** The `awaiting_verification_submission = 0` finding from Step 2 is genuinely correct data (nobody is currently in that window), not staleness. **Decision: skip running it** — nothing to backfill. No D1 write made, no code changed. This closes out the "possible data problem" flagged in Step 2 with evidence, so it shouldn't need re-investigating later without a reason to suspect the flags have drifted since this check.
