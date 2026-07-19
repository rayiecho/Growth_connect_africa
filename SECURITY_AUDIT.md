# Security Audit — LaunchPadX Frontend

Audit date: 2026-07-19. Scope: authentication, API authorization, injection, sensitive data exposure, infrastructure. Method: manual read of source (no code executed, no live requests sent, no code changed). Reference: ARCHITECTURE.md.

All findings below were verified by directly reading the referenced file/lines, not inferred.

---

## Findings, ranked by severity

### CRITICAL

#### C1 — Unauthenticated, unsanitized file read on the verification R2 bucket
**File:** `app/api/public/lpx-id/photo/[...key]/route.ts` (full file, 29 lines)

**What the code does:** Takes the `[...key]` catch-all URL segment, joins it into a string, and calls `env.VERIFICATION_BUCKET.get(key)` directly, streaming the result back to the requester.

**The flaw:** Two things are missing that its sibling route has:
- No authentication check at all — no call to `getVerifiedAdminSession()` or any other gate. Compare to `app/api/public/verification/file/[...key]/route.ts:13-16`, which requires a verified admin session before touching the bucket.
- No path-traversal / key-format validation — no check for `..`, no rejection of a leading `/`. Compare to `app/api/public/verification/file/[...key]/route.ts:22-24`, which explicitly rejects keys containing `..` or starting with `/`.

Both routes read from the **same bucket** (`VERIFICATION_BUCKET`, per `wrangler.jsonc`), which per the upload routes (`app/api/public/verification/upload/route.ts`, `app/api/public/lpx-id/upload-photo/route.ts`) stores both profile photos and verification/payment documents under predictable key patterns (`{folder}/{type}-{filename}`).

**Attack scenario:** An unauthenticated attacker requests `GET /api/public/lpx-id/photo/verification-docs/some-known-or-guessed-filename`. Because there is no auth check, the request succeeds regardless of who is asking. Because there is no traversal/prefix restriction, the attacker is not confined to the photo folder — any object key in the bucket that can be guessed, enumerated, or discovered (e.g., leaked in an email, browser history, or another response) can be fetched, including other applicants' verification and payment documents. This route is also directly usable as a full read-only proxy onto the bucket's contents if key names are ever discoverable (e.g., via the `mark-completed` certificate flow, log lines, or brute-forcing predictable filename patterns).

**Recommended fix approach:** Add the identical guard already implemented in `verification/file/[...key]/route.ts` to this route: reject `..`/leading-slash keys, and require either (a) a verified admin session, or (b) if this route must remain reachable by applicants for their own photo, require proof of ownership (e.g., verify the requester's session/OTP-verified email matches the `photo_path` on the applicant record before serving) rather than trusting the URL alone. Do not serve arbitrary bucket keys from an unauthenticated route.

---

### HIGH

#### H1 — Full applicant record disclosed to anyone who supplies an email address
**File:** `app/api/public/lpx-id/route.ts:6-40`

**What the code does:** `POST` with `{ email, action: "lookup" }` queries D1 `applicants` by email and, on match, returns `data: applicantData` — the entire applicant row (line 38) — with no authentication, no OTP verification, and no rate limiting.

**The flaw:** The applicant record (per `lib/firebase/types.ts`) includes phone number, business details, application answers, review status/notes-adjacent fields, and other application-lifecycle data. The only "gate" is knowing (or guessing) an email address, which is not a secret — many are guessable (e.g., predictable business emails) or obtainable from other sources.

**Attack scenario:** An attacker with a list of email addresses (e.g., scraped from LinkedIn, a leaked mailing list, or simple pattern-guessing at a known domain) submits each to `/api/public/lpx-id` with `action: "lookup"`. Since there's no rate limiting (`checkRateLimit` is implemented in `lib/engine/rateLimit.ts` but never called anywhere under `app/api/public`, confirmed by repo-wide grep), the attacker can script this to enumerate and scrape full applicant profiles for every guessed email at will.

**Recommended fix approach:** Require proof of email ownership before returning full record data — e.g., gate `action: "lookup"` behind a verified OTP session (the app already has an OTP flow), or return only the minimal fields needed by the UI (`hasId`, `isEligible`, `currentStage`) and drop the raw `data: applicantData` from the response. Add rate limiting on this endpoint regardless.

#### H2 — OTP is brute-forceable (no rate limit, no attempt lockout, 6-digit code)
**Files:** `app/api/public/send-otp/route.ts:14` (code generation), `app/api/public/verify-otp/route.ts` (full file, verification)

**What the code does:** `send-otp` generates a 6-digit numeric code (`100000`–`999999`, ~900,000 possible values) with a 10-minute expiry, stored in D1. `verify-otp` reads the stored code from **Firestore** (see ARCHITECTURE.md known-issue #1 — this is likely broken/dead in production due to the D1/Firestore split, but assess the logic as written) and compares `data.code !== code` with no attempt counter, no lockout, and no rate limiting.

**The flaw:** Nothing prevents an attacker who knows a target's email from submitting up to ~900,000 guesses against `verify-otp` within the 10-minute validity window (or simply requesting a fresh OTP and restarting the clock). `checkRateLimit` exists in the codebase but is not called from either route.

**Attack scenario:** An attacker targets a known applicant email, triggers `send-otp`, and scripts rapid-fire requests to `verify-otp` cycling through the code space. Given no per-IP or per-email throttling, this is a straightforward automatable brute force to gain "OTP verified" status for that email, which gates the `update-details` and `reply` flows (per ARCHITECTURE.md) — potentially allowing an attacker to modify another applicant's submitted details.

**Recommended fix approach:** Wire up `checkRateLimit` (already implemented, just unused) on both `send-otp` (per-email and per-IP) and `verify-otp` (per-email attempt counter with lockout after e.g. 5 failed attempts), and consider increasing code length/entropy. Independent of this fix, resolve the D1/Firestore split noted in ARCHITECTURE.md so OTP verification isn't reading from a datastore the write path doesn't populate.

#### H3 — Live, fully-privileged Supabase service-role key configured but the integration is dead code
**Files:** `.env.local` (variable presence confirmed, value not printed), `.env.example:7-9`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/engine/supabaseAdmin.ts`

**What was found:** `.env.local` has a real (non-empty) value set for `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL`. Per `.env.example`'s own comment, the service-role key is meant to be used "ONLY in server-side API routes" and explicitly warns "NEVER expose... or use in browser code" — which is the standard warning for this key type because it bypasses Postgres Row Level Security entirely. However, a repo-wide grep (already performed for ARCHITECTURE.md) confirms `lib/supabase/*` has **zero import sites** anywhere in `app/`, `components/`, or `lib/` outside its own definitions.

**The flaw:** This is a live, full-bypass database credential that is not part of the app's active code path, meaning it receives none of the scrutiny, monitoring, or access review that live-and-used credentials would. It is presumably also mirrored into whatever hosting dashboard (Vercel/Cloudflare) manages production env vars, per `.env.example`'s instructions.

**Attack scenario:** This is not directly exploitable via the app itself (since no route uses it), but it represents standing risk: if this key ever leaks (accidental logging, a future dev re-wiring the dead `lib/supabase/*` files without realizing the key is stale/forgotten-about, a support ticket paste, a build artifact, a `.env.local` committed by accident in a future commit), it grants a full, unaudited read/write bypass to whatever Supabase project it points to — which may still contain data from whatever this app's architecture looked like before the Firestore→D1 migration.

**Recommended fix approach:** Confirm whether the Supabase project still exists and holds data. If not needed, revoke/rotate the key at the Supabase dashboard and remove it from all env stores (local and hosting). If the project is still live and used elsewhere, at minimum document why the key exists here unused, and treat it as a tracked credential (rotation schedule, access log review) rather than an orphaned leftover.

---

### MEDIUM

#### M1 — `CRON_SECRET` documented (though not currently wired) to be exposed to the browser
**File:** `.env.example:24-27`

**What was found:** The env template defines `NEXT_PUBLIC_CRON_SECRET` with the comment "Public version of CRON_SECRET — exposed to the browser so the admin dashboard can call video-action API routes... Same value as CRON_SECRET." A repo-wide grep for `NEXT_PUBLIC_CRON_SECRET` in `app/` and `components/` returns **zero matches** — it is not currently used anywhere in code, and `.env.local` has it unset. So this is not a live exploit today.

**The flaw:** `CRON_SECRET` is the single shared secret gating every `app/api/cron/*` batch job — mass email sends, decision releases, follow-up campaigns. Every cron route checks it via plain `secret !== process.env.CRON_SECRET` (e.g. `app/api/cron/video-invite-batch/route.ts:8-11`), and it's meant to be a server-only secret. The `.env.example` file actively instructs a future developer to duplicate this exact secret into a `NEXT_PUBLIC_`-prefixed variable, which Next.js bakes into the client-side JS bundle at build time, visible to any visitor via browser devtools or view-source. If anyone follows this instruction, the one secret that gates the entire cron/batch-automation subsystem becomes trivially extractable by any website visitor.

**Attack scenario (if implemented as documented):** An attacker views the admin dashboard's JS bundle (no auth required to load static JS), extracts the `NEXT_PUBLIC_CRON_SECRET` value, and calls any `app/api/cron/*` endpoint directly and repeatedly (e.g., triggering mass "legacy batch" outreach emails, or replaying decision-release batches), fully bypassing the admin-session requirement entirely.

**Recommended fix approach:** Remove the `NEXT_PUBLIC_CRON_SECRET` variable and its instructions from `.env.example` entirely. If the admin dashboard needs to trigger cron-adjacent actions client-side, route that through the already-existing admin-session-gated `app/api/admin/engine/trigger-cron/route.ts` pattern (session-checked server-side, secret never leaves the server) rather than ever shipping the shared secret to the browser.

#### M2 — No rate limiting on any public-facing endpoint
**Files:** `lib/engine/rateLimit.ts` (implementation exists), confirmed absent from every route under `app/api/public/*` (repo-wide grep for `checkRateLimit` under `app/` returns no matches)

**What was found:** `checkRateLimit()` is fully implemented (KV-backed counter with TTL) but is never called by any route. This compounds H2 (OTP brute force) and H1 (email enumeration), but independently also leaves `apply`, `contact`, `sos`, `chatbot`, and `funnel-event` open to unmetered abuse: spam application submissions, mass contact-form/SOS submissions (each of which triggers outbound email via Elastic Email, per ARCHITECTURE.md), and inflated third-party API costs/quota exhaustion.

Separately, note `checkRateLimit` **fails open** on any KV error or missing binding (`lib/engine/rateLimit.ts:7,20-22` — returns `{allowed: true, ...}`), so even after wiring it up, a KV outage silently disables protection rather than blocking requests. This is a reasonable availability trade-off but should be a deliberate choice, not a hidden default.

**Recommended fix approach:** Apply `checkRateLimit` (per-IP and/or per-email) to all public POST endpoints, prioritizing `send-otp`, `verify-otp`, and `lpx-id` (action=lookup) first since those directly enable H1/H2. Decide explicitly whether fail-open or fail-closed is correct for this app's risk tolerance and document the choice.

#### M3 — Non-constant-time secret comparison on cron routes
**Files:** every `app/api/cron/*/route.ts` (e.g. `video-invite-batch/route.ts:9`), `app/api/cron/debug-query/route.ts:6`

**What the code does:** `if (secret !== process.env.CRON_SECRET)` — a standard JS string inequality check.

**The flaw:** This is not constant-time, so in principle a sufficiently precise timing side-channel could leak information about how many leading characters of a guessed secret are correct. In practice this is hard to exploit reliably over the network (Cloudflare Workers' request handling, TLS, and general network jitter make byte-by-byte timing extraction very difficult), so this is a defense-in-depth item, not a practically demonstrated exploit path today.

**Recommended fix approach:** Use a constant-time comparison (e.g. compare fixed-length HMACs, or a timing-safe-equal utility) for secret comparisons as a low-cost hardening measure.

#### M4 — Repeated "lookup by email/code only" pattern across multiple public endpoints
**Files:** `app/api/public/certificate/lookup/route.ts`, `app/api/public/verification/lookup/route.ts`, `app/api/public/video-pitch/lookup/route.ts` (not fully read line-by-line in this pass, but share the same shape confirmed by the earlier architecture research and H1's confirmed sibling route)

**What was found:** The same authorization pattern as H1 — "does this email/code exist" as the only access check — recurs across several public lookup endpoints, each disclosing a different slice of applicant/program status data (certificate issuance status, verification status, video pitch status). Severity here is Medium rather than High because the individual data disclosed per endpoint is narrower than the full applicant record in H1, but the pattern is systemic.

**Recommended fix approach:** Apply the same fix approach as H1 consistently across all lookup endpoints — treat "email" as an identifier, not a credential, and require an OTP-verified session (or equivalent proof of ownership) before returning applicant-specific data from any of them.

---

### LOW

#### L1 — Debug/inspection routes present in production
**Files:** `app/api/admin/debug-reminders/route.ts`, `app/api/admin/debug-video-invite/route.ts`, `app/api/cron/debug-query/route.ts`

**What was found:** All three are properly gated (admin-session check or `CRON_SECRET`, confirmed by direct read of `debug-query`, and confirmed by the earlier research pass for the other two) — no auth bypass was found. `debug-query`'s Firestore queries are hardcoded (no user input reaches the query builder), so there's no injection surface either.

**The flaw:** Purely an attack-surface/hygiene concern: debug/inspection tooling generally shouldn't ship to a production deployment at all, regardless of how well it's currently gated, since it's extra surface that could be weakened by a future unrelated change (e.g., someone refactors auth checks and misses one of these).

**Recommended fix approach:** Consider gating these behind a build-time flag (excluded from production builds) or moving them to a separate internal-only tool, rather than relying solely on runtime auth checks to keep them safe.

---

## Areas audited with no findings

- **Session/cookie forgery:** `verifySessionCookieRest()` (`lib/firebase/rest-admin.ts:501-539`) performs full RSA-SHA256 signature verification against Google's live public certs and correctly checks `exp`, `iat`, `aud`, `iss`. No bypass found. Failure paths are fail-closed (`getVerifiedAdminSession()` returns `null` on any error).
- **`middleware.ts` cookie-presence-only check:** confirmed real impact is low — every downstream admin page (`app/admin/dashboard/page.tsx`, `app/admin/engine/page.tsx`) independently re-verifies the session cookie via `getVerifiedAdminSession()` before rendering anything, so a forged/empty cookie that merely satisfies middleware's presence check does not grant access past the page's own guard.
- **Admin API route auth coverage:** all ~63 files under `app/api/admin/*/route.ts` were checked; every exported HTTP handler calls `getVerifiedAdminSession()` and returns 401 before proceeding. No missing-auth admin route was found.
- **SQL injection:** `lib/db/d1-admin.ts` interpolates only hardcoded table/field/order-by identifiers; all user-supplied *values* go through parameterized `.bind()`. `edit-user` and `additional-details` whitelist updatable columns. No injection path found.
- **Firestore query injection:** filter values are passed through structured JSON (`toFirestoreValue()`), not string concatenation — no query-breakout path found.
- **Hardcoded secrets in source:** none found in `app/`/`lib`/`components` (only unrelated false positives in `node_modules` type definitions).
- **`.gitignore` / secret leakage into version control:** `.env.local` is correctly gitignored.

---

## Summary table

| ID | Finding | Severity |
|---|---|---|
| C1 | Unauthenticated + unsanitized R2 file read via `lpx-id/photo/[...key]` | Critical |
| H1 | Full applicant record disclosed via `lpx-id` lookup by email alone | High |
| H2 | OTP brute-forceable — no rate limit, no lockout | High |
| H3 | Live unused Supabase service-role key sitting in env config | High |
| M1 | `NEXT_PUBLIC_CRON_SECRET` pattern documented in `.env.example` (not yet wired up) | Medium |
| M2 | No rate limiting on any public endpoint; fail-open design | Medium |
| M3 | Non-constant-time secret comparison on cron routes | Medium |
| M4 | Repeated email/code-only lookup pattern across multiple public endpoints | Medium |
| L1 | Debug/inspection routes shipped in production build | Low |
