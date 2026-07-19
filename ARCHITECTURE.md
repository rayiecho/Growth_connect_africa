# LaunchPadX Frontend — Architecture Reference

This document is a snapshot of the codebase as understood on 2026-07-18. It is descriptive only — no behavior was changed to produce it. See the "Known Issues" section at the end for problems noted but not fixed.

Deployment target: Next.js App Router, deployed to Cloudflare Workers via OpenNext (`open-next.config.ts`, `wrangler.jsonc`).

---

## 1. App Purpose

LaunchPadX is an applicant-management platform for a business accelerator/program run by "GrowthConnect Africa." The public side lets founders apply, submit a video pitch, go through business/founder verification, get a digital "LaunchPadX ID," and (on program completion) download a certificate. The admin side is an internal review dashboard where staff move applicants through that pipeline, send templated emails, and monitor/trigger the automated "engine" — scheduled batch jobs that send reminders and release decisions on a fixed Tuesday/Friday cadence.

---

## 2. Folder Structure

- **`app/`** — Next.js App Router. Contains both pages and API routes.
  - `app/api/public/*` — unauthenticated, applicant-facing endpoints.
  - `app/api/admin/*` — staff-only endpoints, each independently checking the admin session.
  - `app/api/cron/*` — scheduled batch jobs, gated by a shared secret query param.
  - `app/api/auth/session/route.ts` — admin login/logout session cookie issuance.
  - `app/admin/*` — the staff dashboard pages (login, dashboard, engine monitor, logout).
  - `app/main-site/*` — a separate marketing site, served under a different domain via middleware rewrite.
  - Everything else at the top level (`apply`, `id`, `verify`, `verification`, `video-pitch`, `certificate`, `update-details`, `reply`, `faq`, `privacy`, `terms`) — the applicant-facing funnel pages.
- **`lib/`** — backend logic.
  - `lib/db/d1-admin.ts` — primary datastore access layer (Cloudflare D1 / SQLite).
  - `lib/firebase/` — Firebase Auth (session verification) + a legacy Firestore REST client, plus type definitions.
  - `lib/engine/` — email sending/templating, business-rule date math, rate limiting, CSV parsing.
  - `lib/supabase/` — a fully implemented but entirely unused data-access layer (see Known Issues).
  - `lib/data/` — static reference data (e.g. country dial codes).
- **`components/`** — React components (`forms/` for public forms, `admin/` for the dashboard shell, plus shared UI).
- **`middleware.ts`** — runs on almost every request (see §5).

---

## 3. Routes / Pages

| Route | Type | Purpose |
|---|---|---|
| `app/page.tsx` | server | Redirects immediately to `/apply`. |
| `app/apply/page.tsx` | server (mounts client `ApplicationForm`) | Application intake page. |
| `app/id/page.tsx` | client | LaunchPadX ID lookup/eligibility check → redirects to success. |
| `app/id/success/page.tsx` | client | ID generation, profile completion, photo upload, ID card display. |
| `app/verification/page.tsx` | server (mounts client `VerificationForm`) | Founder/business verification submission. |
| `app/verification-guide/page.tsx` | server | Static guide content. |
| `app/video-pitch/page.tsx` | server (mounts client `VideoPitchForm`) | Video pitch submission. |
| `app/update-details/page.tsx` | client (`Suspense`) | Applicant updates previously submitted details. |
| `app/reply/page.tsx` | client (`Suspense`) | Applicant replies to admin email correspondence via emailed link. |
| `app/certificate/page.tsx` | client | Certificate lookup by email; client-side PDF/QR generation. |
| `app/verify/[code]/page.tsx` | client, dynamic `[code]` | Public certificate verification by code. |
| `app/faq/page.tsx`, `privacy/page.tsx`, `terms/page.tsx` | client | Static content (privacy/terms don't need to be client components — see Known Issues). |
| `app/admin/login/page.tsx` | client | Firebase sign-in, posts ID token to `/api/auth/session`. |
| `app/admin/dashboard/page.tsx` | server | Session-gated; fetches applicants/video_submissions/verifications from D1 directly; renders client `AdminShell`. |
| `app/admin/engine/page.tsx` | server | Session-gated; renders client `EngineMonitorShell` (cron/engine health). |
| `app/admin/logout/route.ts` | route handler | Clears session cookie, redirects. |
| `app/main-site/*` (home, about-us, blog, domin8, programs, scaleup-initiative, startwith50k, the-capital, weinspire) | server | Static marketing content, no data fetching. |
| `app/verificafication/page.txs` | — | **Dead file** — typo'd path and wrong extension, not routable. See Known Issues. |

---

## 4. API Routes (grouped by purpose)

**Auth / OTP**
- `POST /api/auth/session` — admin login (mints session cookie) / logout.
- `/api/public/send-otp`, `/api/public/verify-otp` — email OTP for identity confirmation flows.

**Applicant lifecycle (public)**
- `/api/public/apply` — application submission (see §6 for full trace).
- `/api/public/video-pitch`, `/api/public/video-pitch/lookup` — video pitch submission and status lookup.
- `/api/public/verification`, `/api/public/verification/lookup`, `/api/public/verification/upload`, `/api/public/verification/file/[...key]` — founder verification submission, status, file upload/serve (R2-backed).
- `/api/public/lpx-id`, `/api/public/lpx-id/upload-photo`, `/api/public/lpx-id/photo/[...key]` — ID lookup/generation/profile update, photo upload/serve.
- `/api/public/additional-details`, `/api/public/rejection-followup`, `/api/public/verify-application-email` — supplementary applicant flows.
- `/api/public/certificate/lookup`, `/api/public/verify/[code]` — certificate lookup by email / by code.

**Support & engagement (public + admin pairs)**
- Chatbot: `/api/public/chatbot` ↔ `/api/admin/chatbot-conversations`
- Contact form: `/api/public/contact` ↔ `/api/admin/contact-messages`, `/api/admin/mark-resolved`
- SOS/urgent help: `/api/public/sos` ↔ `/api/admin/sos-reports`
- Email threads: `/api/public/email-reply` ↔ `/api/admin/email-conversations`, `/api/admin/email-conversations/reply`
- Funnel analytics: `/api/public/funnel-event` ↔ `/api/admin/funnel-analytics`

**Applicant management (admin)**
- `/api/admin/applicants`, `/api/admin/applicants-more` — record update, paginated listing.
- `/api/admin/search-user`, `edit-user`, `delete-applicant`, `delete-platform-user`, `clear-for-reapply`, `reconcile-details`, `reconcile-pending-applications`, `additional-details`, `message-user` — record-level admin tools.
- `/api/admin/users`, `/api/admin/users-upload` — bulk platform-user (non-applicant lead) listing/CSV upload.
- `/api/admin/bulk-import-participants`, `bulk-import-approved`, `cancel-bulk-import`, `promote-to-participants`, `program-participants` — cohort/participant tooling.

**Verification & video-pitch review workflow (admin)**
- `/api/admin/verifications`, `/api/admin/video-submissions` — review queues.
- `bulk-verification-decision`, `bulk-video-decision`, `send-single-verification-decision`, `send-single-video-decision`, `send-single-video-invite` — decision/invite actions (single + bulk variants).
- `force-release-date`, `force-release-date-by-id`, `force-invite-age` — manual overrides of the review-window logic.
- `backfill-awaiting-flags`, `backfill-batch-ids` — one-off data-repair endpoints.
- `mark-completed` — marks program complete, issues a certificate.

**Email / notification sending**
- `compose-email`, `upload-email-attachment` — ad hoc admin-composed sends.
- `email-templates`, `email-templates/save` — template CRUD.
- `send-verification-email` — legacy Firestore-backed send.
- Legacy/batch outreach subsystem: `schedule-legacy-batch`, `send-single-legacy`, `list-legacy-sent`, `staged-legacy/{add,edit,remove}`, `staged-batches`, `followup-batches`, `batch-link`, `rejection-followups`.

**Analytics / reporting**
- `analytics-data` (Firestore-backed), `funnel-analytics` (D1-backed) — two separate analytics endpoints on two different backends.
- `call-log`, `call-notes` — CRM-style call logging.

**Engine / cron control plane (admin)**
- `engine/health-check`, `engine/cron-status`, `engine/trigger-cron` — manual monitoring/triggering of cron jobs.
- `debug-reminders`, `debug-video-invite`, `/api/cron/debug-query` — development debug endpoints.
- `migrate-to-d1` — the Firestore→D1 migration tool.
- `backup-to-r2` — dumps D1 tables to R2 for backup.

**Cron / batch jobs** (`/api/cron/*`, all GET, gated by `?secret=CRON_SECRET`)
- `video-invite-batch`, `video-reminder-batch`, `video-outcome-batch` — video pitch stage automation.
- `verification-reminder-batch`, `verification-outcome-batch` — verification stage automation.
- `video/approved`, `video/rejected`, `video/action-required` — per-outcome video dispatch (nested inconsistently under `cron/video/`, see Known Issues).
- `non-applicant-followup` — follow-up campaign for leads who never applied.
- `legacy-batch-send` — sends admin-staged legacy batches.
- `send-responses` — sends queued admin email responses (Firestore-backed).

No Cloudflare Cron Trigger is declared in `wrangler.jsonc` — these jobs must be invoked by an external scheduler or manually via the admin UI.

---

## 5. Auth Flow

1. **Login (client):** `app/admin/login/page.tsx` uses the Firebase client SDK (`signInWithEmailAndPassword`, via `lib/firebase/client.ts`) to authenticate, then calls `cred.user.getIdToken()` and POSTs `{ idToken }` to `/api/auth/session`.
2. **Session creation (server):** `app/api/auth/session/route.ts` verifies the ID token via `verifyIdTokenRest()` (`lib/firebase/rest-admin.ts`) — a REST call to Google's Identity Toolkit, used instead of the `firebase-admin` Node SDK because the app runs on Cloudflare Workers, which can't run `firebase-admin`'s gRPC dependencies. It requires the Firebase custom claim `admin === true` and `emailVerified === true`, then exchanges the ID token for a Firebase session cookie (`createSessionCookieRest`, 5-day expiry) via another REST call, and sets it as an httpOnly, `sameSite=lax` cookie named `session`. `DELETE` on the same route clears it (logout).
3. **Session verification (per request):** `lib/firebase/session.ts` → `getVerifiedAdminSession()` reads the `session` cookie, then `verifySessionCookieRest()` (`lib/firebase/rest-admin.ts`) — a hand-written, dependency-free JWT verifier: parses the JWT, checks `exp`/`iat`/`aud`/`iss`, fetches and caches Google's public certs, hand-parses the DER/X.509 cert to extract the public key, and verifies the RSA signature via Web Crypto. Returns `{uid, admin, raw}` or `null`.
4. **Where it's enforced:** Called directly by `app/admin/dashboard/page.tsx`, `app/admin/engine/page.tsx`, and individually by nearly every `app/api/admin/*` route handler — there is no centralized enforcement for API routes.
5. **Middleware's role:** `middleware.ts` only checks that *a* `session` cookie is present before allowing `/admin/dashboard` to render (redirects to `/admin/login` if absent) — it explicitly does not verify the cookie's validity. Real verification happens later, server-side, in the page/route itself.

A second, unused auth path exists: `lib/firebase/admin.ts` implements the same capabilities using the real `firebase-admin` Node package, but is not imported anywhere in `app/` — dead code, presumably superseded by the Workers-compatible REST client.

---

## 6. Data Layer

**Primary datastore — Cloudflare D1** (`lib/db/d1-admin.ts`, binding `launchpadx_db`): a hand-written data-access layer (`d1Add`, `d1GetById`, `d1UpdateById`, `d1Delete`, `d1Query`, `d1QueryOrdered`, `d1BatchUpdate`, `d1GetAll`) deliberately shaped to mimic the Firestore document API it replaced. Used by the large majority (~75) of routes. Known tables: `applicants`, `video_submissions`, `verifications`, `email_otps`, `email_templates`, `certificates`, `cron_run_log`, `batch_links`, `platform_users`, `additional_details`.

**Legacy datastore — Firestore over raw REST** (`lib/firebase/rest-admin.ts`): a from-scratch Firestore REST client (query/get/add/update/delete), built because `firebase-admin`'s gRPC transport can't run on Cloudflare Workers. Handles its own OAuth2 token exchange, caches tokens and full collection reads in the `TOKEN_CACHE` KV namespace. Still actively used by: `verify-otp`, `verify/[code]` (certificates), `send-verification-email`, `analytics-data`, `applicants` (notes/reviewer save), several debug routes, and the token/session-verification functions used by the auth flow itself.

**Supabase — present, fully implemented, unused.** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/engine/supabaseAdmin.ts` exist with no import sites anywhere in the app. Leftover from an earlier or abandoned architecture.

**R2 object storage** — `VERIFICATION_BUCKET` binding, bucket `launchpadx-verifications`. Used for verification document/payment uploads, ID profile photos, and D1 table backups.

**KV** — `TOKEN_CACHE` namespace: OAuth token cache, Firestore collection-read cache, and general-purpose rate limiting (`lib/engine/rateLimit.ts`).

**Email sending** — `lib/engine/ses.ts` (named for AWS SES, but actually calls Elastic Email's HTTP API). Exposes `sendEmail` and `sendBulkEmail`.

**Email templating** — `lib/engine/templateStore.ts`: starts from `DEFAULT_TEMPLATES`, overlays any admin-saved override from D1 `email_templates`, does `{{var}}` substitution, wraps in a shared branded HTML shell.

**Business rules** — `lib/engine/dates.ts`: single source of truth for the Tuesday/Friday review-window cadence, working-day math (7-day verification SLA), and cohort assignment (cutoff-date based). Used identically by public submission routes and cron batch jobs.

---

## 7. End-to-End Example: Application Submission

1. `app/apply/page.tsx` (server) renders the marketing page and mounts `<ApplicationForm />` (client component).
2. The user fills out the form; each meaningful step fires a non-blocking analytics beacon to `/api/public/funnel-event`.
3. On submit, the form POSTs to `/api/public/apply`.
4. `app/api/public/apply/route.ts`:
   - Normalizes the email, computes the next Tue/Fri review-window date via `nextReviewWindow()`.
   - Checks D1 `applicants` for an existing row with that email.
   - Builds a full lifecycle-state object (`current_stage: "Application Submitted"`, cohort assignment, and every downstream flag — video invite, verification, ID, certificate — pre-seeded to falsy/null).
   - If a matching row exists and isn't cleared for reapply, returns 409. If cleared for reapply, updates the row. Otherwise inserts a new row into D1.
   - Best-effort (non-blocking, wrapped in try/catch): deletes any matching Firestore `platform_users` lead doc for that email, and sends a confirmation email via Elastic Email.
   - Returns `{ success: true, id }`.
5. Next admin dashboard load: `app/admin/dashboard/page.tsx` (server) calls `getVerifiedAdminSession()`, then queries the same D1 `applicants` table directly (`d1QueryOrdered`, ordered by `date_applied` descending, first 100 rows) — no API round-trip. The new row appears at the top. Further pages load via `/api/admin/applicants-more`.
6. From there, staff or cron jobs advance the applicant through video pitch → verification → ID → program completion → certificate, all keyed off the flags seeded in step 4, using the same `lib/engine/dates.ts` logic throughout.

---

## 8. Server vs. Client Pattern

Two coexisting patterns:
- **Server-fetches-directly:** the admin dashboard's initial load (`app/admin/dashboard/page.tsx`, `app/admin/engine/page.tsx`) — async server components query D1 directly at render time, then pass data as props into a client shell.
- **Client-calls-API-route:** everything else — every public form and every subsequent admin-dashboard interaction is a `"use client"` component doing raw inline `fetch()` calls with local `useState` for loading/error. No SWR/React Query or shared data-fetching hook was found.
- No React Server Actions (`"use server"`) are used anywhere — all mutations go through explicit `app/api/*` route handlers.
- Every mutating admin API route re-implements its own `getVerifiedAdminSession()` check rather than relying on middleware.

---

## 9. Known Issues (documented, not fixed)

These are observations only — no code was changed to produce this list. Ordered roughly by likely impact.

1. **Cross-datastore bug — OTP verification.** `app/api/public/send-otp/route.ts` writes the OTP code directly to D1 (raw binding, bypassing `d1-admin.ts`). `app/api/public/verify-otp/route.ts` reads it back from **Firestore**. Any OTP generated after the Firestore→D1 migration should be unfindable by the verify step unless there's an undiscovered dual-write — this would break OTP-gated flows (`update-details`, `reply`). Highest-impact of the datastore-mismatch issues since it's directly user-facing and blocking.

2. **Cross-datastore bug — certificate verification.** New certificates are written to **D1** (`app/api/admin/mark-completed/route.ts`, and `app/api/admin/backup-to-r2/route.ts` treats `certificates` as a D1 table), but the public "verify this certificate" page (`app/verify/[code]/page.tsx` → `app/api/public/verify/[code]/route.ts`) queries **Firestore**. Certificates issued post-migration likely can't be found by their own verification page.

3. **Cross-datastore bug — applicant notes.** The admin `ApplicantTable` "save" action (assigned reviewer / notes / next-action) hits `app/api/admin/applicants/route.ts`, which writes via `firestoreUpdateById` (**Firestore**) — but the applicant's canonical record and `id` come from **D1**. Saved notes likely don't durably attach to the record the admin is viewing.

4. **Entirely unused Supabase layer.** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/engine/supabaseAdmin.ts` are fully implemented with zero import sites anywhere in the codebase. Leftover from an earlier or abandoned architecture.

5. **Unused `firebase-admin` (Node SDK) path.** `lib/firebase/admin.ts` duplicates capability already provided by `lib/firebase/rest-admin.ts` (the actually-used, Workers-compatible client) and is not imported anywhere in `app/`.

6. **Dead route file.** `app/verificafication/page.txs` — typo'd directory name and wrong file extension, so Next.js never registers it as a route. Near-duplicate of `app/verification/page.tsx` without the header/footer wrapper.

7. **Two analytics endpoints on two different backends.** `app/api/admin/analytics-data/route.ts` (Firestore) and `app/api/admin/funnel-analytics/route.ts` (D1) — unclear from naming alone whether one is stale/legacy or they intentionally answer different questions.

8. **Misleading module name.** `lib/engine/ses.ts` is named for AWS SES but actually calls Elastic Email's HTTP API. No AWS SES code is present.

9. **Types namespaced under the wrong backend.** `lib/firebase/types.ts` defines `Applicant`, `VideoSubmission`, `Verification`, etc. — these describe rows that now live in D1, not Firestore. Purely a navigation/organization smell, not a runtime bug.

10. **Unnecessary client components.** `app/privacy/page.tsx` and `app/terms/page.tsx` are marked `"use client"` with no client-only hooks in use (unlike `app/faq/page.tsx`, which legitimately needs it for an accordion). Minor unnecessary client-bundle bloat.

11. **Large family of near-duplicate admin decision routes.** `send-single-verification-decision` / `send-single-video-decision` / `bulk-verification-decision` / `bulk-video-decision` / `force-release-date` / `force-release-date-by-id` suggest parallel single-record and bulk-record code paths that may have drifted from each other over time — not verified line-by-line.

12. **Inconsistent cron route nesting.** `app/api/cron/video/{approved,rejected,action-required}` sit nested one level deeper than the flatter `video-outcome-batch` / `video-invite-batch` / `video-reminder-batch` siblings, despite appearing to belong to the same subsystem.

13. **No centralized API auth.** Every admin API route independently calls `getVerifiedAdminSession()`; there is no shared middleware-level or wrapper-level enforcement, so a route that forgets the check would be silently unprotected. Not confirmed that any route currently has this gap — flagged as a structural risk, not a confirmed vulnerability.
