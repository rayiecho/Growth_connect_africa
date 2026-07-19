# Refactor Log — Phase 4 (Clean Architecture)

Permanent record of structural changes made during Phase 4: file moves, renames, splits, and deletions. Kept separate from `FIXES_LOG.md` (Phase 3's bug-fix record) since Phase 4 is explicitly no-behavior-change structural work, not bug fixing — mixing the two would blur what's actually a behavior fix versus a pure reorganization.

## STANDING RULE (adopted after the Tier 0 incident below, in effect for the rest of Phase 4 and beyond)

**Never hard-delete a file.** Whenever a step calls for removing something, it gets **moved to `_deleted/` at the project root instead, preserving its original relative path** (e.g. `lib/firebase/admin.ts` → `_deleted/lib/firebase/admin.ts`). Every move gets a one-line note here so it's clear what's sitting in `_deleted/` and why. A final cleanup pass to actually discard `_deleted/` happens only once we're confident nothing surfaces needing any of it — not automatically, and only with explicit go-ahead at that time.

This rule cannot be applied retroactively to `lib/firebase/admin.ts` itself (it was already gone before the rule existed — see the incident below) — but it applies to everything moved from this point forward, including within that same incident's resolution: the reconstructed `lib/firebase/admin.ts` is a normal tracked file going forward, not something pre-flagged for deletion.

---

## Tier 0 — Incident: `lib/firebase/admin.ts`

**1. What happened:** `lib/firebase/admin.ts` was deleted as part of Tier 0 cleanup, based on a pre-deletion check that grepped only `app/`, `lib/`, and `components/` for import sites. That check came back clean (zero references), so the file was deleted. The check was incomplete — it never searched `scripts/`.

**2. Consequence:** `npm run build` broke immediately after. `scripts/set-admin-claims.ts:11` imported `adminAuth` from the just-deleted file (`import { adminAuth } from "../lib/firebase/admin";`), and Next.js's build-time type-checking covers `.ts` files across the whole project, not just `app/`, so the missing module surfaced as a hard compile failure: `Cannot find module '../lib/firebase/admin'`.

**3. Original file not recoverable:** this repository has no git history (`Is a git repository: false`), and the deleted file was never imported by anything under `app/`, so it was never bundled into any Next.js build output or `.next`/`.wrangler` artifact that could have preserved a copy. The only source available afterward was a prior research subagent's *summary* of the file's shape (not its literal contents). The exact original source was confirmed unrecoverable before any reconstruction was attempted.

**4. Resolution:** reconstructed a minimal replacement, `lib/firebase/admin.ts`, covering only the two calls `scripts/set-admin-claims.ts` actually uses (`adminAuth.getUserByEmail`, `adminAuth.setCustomUserClaims`) — not a full recreation of whatever the original may have additionally exported (e.g. `adminDb`/`adminStorage`, per the research summary), since nothing in the repo currently depends on those. The file's own header comment states plainly that it is a reconstruction, not the original, written after an accidental deletion, so nobody later mistakes it for original/historical code. Two build failures were hit and fixed during reconstruction (a missing-module error, then a `cert()` type mismatch between the snake_case service-account JSON shape and the camelCase shape the `firebase-admin` SDK's types require) before the build passed clean.

**5. Process change adopted for the remainder of this project:**
- **No more hard deletes.** From this point on, anything previously destined for deletion is instead **moved to a `_deleted/` directory** (preserving its original relative path under `_deleted/`) rather than removed outright. This makes any future "turns out something depended on it" mistake trivially reversible — a move, not a permanent loss.
- **Deletion/move-away checks must grep the entire repo root going forward**, not just `app/`, `lib/`, `components/` — explicitly including `scripts/`, `migrations/`, and any other top-level directory, before anything is proposed for removal.

---

## Tier 1 — item 1: rename `lib/engine/ses.ts` → `lib/engine/email.ts`

**What changed:** `lib/engine/ses.ts` (misleadingly named for AWS SES, but actually calls Elastic Email's HTTP API — `ARCHITECTURE.md` issue #7) was renamed to `lib/engine/email.ts`. Zero logic changes — `sendEmail`, `mergeTags`, and `sendBulkEmail` are byte-for-byte identical to the original.

**Import sites updated:** a full-repo grep (per the new discipline adopted after the Tier 0 incident above — `app/`, `lib/`, `components/`, `scripts/`, `migrations/`, plus root-level config/doc files) found 24 real import sites, all under `app/api/`, none anywhere else. All 24 were updated from `@/lib/engine/ses` to `@/lib/engine/email`:
`cron/legacy-batch-send`, `cron/video-invite-batch`, `cron/verification-reminder-batch`, `public/video-pitch`, `cron/video-reminder-batch`, `cron/video-outcome-batch`, `cron/verification-outcome-batch`, `cron/video/action-required`, `public/sos`, `public/apply`, `cron/non-applicant-followup`, `cron/send-responses`, `admin/bulk-import-participants`, `public/send-otp`, `admin/message-user`, `public/verification`, `admin/compose-email`, `admin/send-single-legacy`, `admin/send-single-verification-decision`, `admin/send-single-video-invite`, `admin/send-single-video-decision`, `admin/send-verification-email`, `admin/email-conversations/reply`, `admin/video-submissions`, `admin/verifications`.

**Old file:** moved to `_deleted/lib/engine/ses.ts` (not deleted), per the new process rule.

**Verified:** post-update grep confirmed zero remaining references to `lib/engine/ses` anywhere under `app/`. `npm run build` completed with `✓ Compiled successfully`, no errors.

**Files touched:**
- New: `lib/engine/email.ts`
- Moved: `lib/engine/ses.ts` → `_deleted/lib/engine/ses.ts`
- Edited (import path only): the 24 files listed above

---

## Tier 1 — item 2: move `lib/firebase/types.ts` → `lib/db/types.ts`

**What changed:** `lib/firebase/types.ts` — a pure type-definitions file (`Applicant`, `VideoSubmission`, `Verification`, `Template`, `SendLogEntry`, `VerificationBatch`, `EngineRunLog`; no runtime logic, confirmed by reading it in full before moving) — was moved to `lib/db/types.ts`. `ARCHITECTURE.md` issue #8: `Applicant`/`VideoSubmission`/`Verification` describe D1 row shapes, not Firestore documents, so `lib/firebase/` was the wrong home. Zero content changes — byte-for-byte identical.

**Import sites updated:** full-repo grep (`app/`, `lib/`, `components/`, `scripts/`, `migrations/`, plus root docs) found 8 real import sites, all updated from `@/lib/firebase/types` to `@/lib/db/types`:
`app/admin/dashboard/page.tsx`, `components/admin/AdminShell.tsx`, `components/admin/AnalyticsPanel.tsx`, `components/admin/VideoSubmissionsTable.tsx`, `components/admin/ApplicantTable.tsx`, `components/admin/VerificationsTable.tsx`, `components/admin/DashboardTabs.tsx`, `components/admin/UsersPanel.tsx`.

**Old file:** moved to `_deleted/lib/firebase/types.ts`, per the standing rule.

**Verified:** post-update grep confirmed zero remaining references to `lib/firebase/types` in `app/` or `components/`. `npm run build` completed with `✓ Compiled successfully`, no errors.

**Files touched:**
- New: `lib/db/types.ts`
- Moved: `lib/firebase/types.ts` → `_deleted/lib/firebase/types.ts`
- Edited (import path only): the 8 files listed above

---

## Tier 1 — item 3: split `lib/firebase/rest-admin.ts` into three files

**What was split:** `lib/firebase/rest-admin.ts` (743 lines) bundled two unrelated concerns — Firebase Auth token/session verification, and a full Firestore REST CRUD client — plus a set of low-level credential/OAuth helpers used by both. Read in full before moving anything. Split into three files, zero logic changes (every function body moved byte-for-byte):

- **`lib/firebase/rest-shared.ts`** (new) — `getServiceAccount()`, `getAccessToken()` (+ its private helpers `base64url()`, `pemToArrayBuffer()`, and the module-level `cachedToken` state).
- **`lib/firebase/auth-rest.ts`** (new) — `verifyIdTokenRest()`, `createSessionCookieRest()`, `verifySessionCookieRest()`, and the auth-only private helpers (`base64urlToBytes()`, `getSessionCookieCerts()`/`cachedCerts`, `readDerLength()`, `readDerTLV()`, `extractSpkiFromCert()`).
- **`lib/firebase/firestore-rest.ts`** (new) — `firestoreQuery`, `firestoreQueryOrdered`, `firestoreGetAll`, `firestoreAdd`, `firestoreUpdate`, `firestoreUpdateById`, `firestoreGetById`, `firestoreDeleteById`, `firestoreBatchUpdate`, `getBatchLink`, `setBatchLink`, `logCronRun`, `generateEmailVerificationLinkRest`, and their private helpers (`toFirestoreValue`/`fromFirestoreValue`/`fromFirestoreFields`, `FirestoreDoc` interface, both query caches, `fetchWithRetry`, `rawDocsToFirestoreDocs`, `getKvNamespace`).

**Why the third shared file, over a straight two-file split:** `getServiceAccount()` and `getAccessToken()` are genuinely used by functions destined for *both* new files — not just Firestore. `createSessionCookieRest` (auth) needs both to call Identity Toolkit's `createSessionCookie` endpoint; `verifySessionCookieRest` (auth) needs `getServiceAccount` to check the cookie's `aud`/`iss` claims. Putting them only in `firestore-rest.ts` (the original two-file sketch) would have forced `auth-rest.ts` to import its own core credential-loading logic from the Firestore file — a one-directional dependency that would build fine (not circular) but was conceptually backwards: "auth" depending on "Firestore" just to authenticate itself to Google at all. The third file makes both `auth-rest.ts` and `firestore-rest.ts` depend only on a neutral shared module, with neither depending on the other. `generateEmailVerificationLinkRest` was kept in `firestore-rest.ts` per explicit instruction despite technically calling an Identity Toolkit endpoint, not Firestore — it only needs `getAccessToken`, and one function wasn't judged worth its own file.

**Import sites updated:** full-repo grep (`app/`, `lib/`, `components/`, `scripts/`, `migrations/`, plus root docs) found 15 real import sites — 2 pointing at what's now `auth-rest.ts` (`lib/firebase/session.ts`, `app/api/auth/session/route.ts`), 13 pointing at what's now `firestore-rest.ts` (`app/api/public/apply`, `app/api/cron/video/{rejected,approved,action-required}`, `app/api/cron/send-responses`, `app/api/cron/debug-query`, `app/api/admin/send-verification-email`, `app/api/admin/reconcile-pending-applications`, `app/api/admin/migrate-to-d1`, `app/api/admin/engine/health-check`, `app/api/admin/debug-video-invite`, `app/api/admin/debug-reminders`, `app/api/admin/analytics-data`). All 15 updated; only the module specifier changed in each, named imports untouched.

**Old file:** moved to `_deleted/lib/firebase/rest-admin.ts`, per the standing rule.

**Verified:** post-update Grep-tool scan (not raw `grep -r`) across the whole repo confirmed zero remaining `import` statements referencing `lib/firebase/rest-admin` — the only 5 remaining string matches anywhere were descriptive doc references (`ARCHITECTURE.md`, `SECURITY_AUDIT.md`, `NOTES_FOR_LATER.md`), the reconstruction's own header comment in `lib/firebase/admin.ts`, and the moved file's self-reference in `_deleted/`. `npm run build` completed with `✓ Compiled successfully`, `✓ Generating static pages (125/125)`, no errors.

**Also noted (not fixed, logged separately to `NOTES_FOR_LATER.md`):** while reading the full file before splitting it, found that `firestoreQueryOrdered` computes `kv`/`kvKey` but never uses them — vestigial/incomplete caching logic, unlike `firestoreGetAll`'s working version. Moved as-is; fixing it would be a logic change outside this phase's scope.

**Files touched:**
- New: `lib/firebase/rest-shared.ts`, `lib/firebase/auth-rest.ts`, `lib/firebase/firestore-rest.ts`
- Moved: `lib/firebase/rest-admin.ts` → `_deleted/lib/firebase/rest-admin.ts`
- Edited (import path only): the 15 files listed above
- `NOTES_FOR_LATER.md` (new vestigial-caching note, documentation only)

---

## Tier 2 — first route-group: `app/api/admin/(legacy-outreach)/`

**What changed:** 10 route files grouped under a new Next.js route group `app/api/admin/(legacy-outreach)/` for readability, per `REFACTOR_PLAN.md` §1a. Since `(folderName)` segments are stripped from the URL by Next.js's App Router, **every route's URL is unchanged** — only its on-disk location moved:

```
schedule-legacy-batch/route.ts, send-single-legacy/route.ts, list-legacy-sent/route.ts,
staged-legacy/{add,edit,remove}/route.ts, staged-batches/route.ts, followup-batches/route.ts,
batch-link/route.ts, rejection-followups/route.ts
```

**Verified before moving:** every one of the 10 files was checked for its import style — all use `@/lib/...` alias imports exclusively, zero relative (`../`) imports, so no import statements needed any adjustment despite the folder becoming one level deeper.

**Verified before moving (URL callers):** full-repo grep for each route's URL across `app/`, `components/`, `scripts/`, and root docs found every caller uses the URL path via `fetch()`, never a file-system reference — confirming nothing depends on where these files physically live. In the process, found that 4 of the 10 (`list-legacy-sent`, `schedule-legacy-batch`, `send-single-legacy`, `staged-legacy/edit`) have **zero callers anywhere** in `app/` or `components/`, unlike their 6 siblings which are all actively called from admin panel components. Logged to `NOTES_FOR_LATER.md` as a flagged-only observation (possibly orphaned routes) — not investigated further, since confirming a route is truly dead vs. called by something outside this codebase's visibility is a behavioral investigation, not a structural move.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, `✓ Generating static pages (125/125)`, no errors. Confirmed all 10 URLs appear identically in the route manifest with no `(legacy-outreach)` segment visible anywhere (`/api/admin/schedule-legacy-batch`, `/api/admin/send-single-legacy`, `/api/admin/list-legacy-sent`, `/api/admin/staged-legacy/add`, `/api/admin/staged-legacy/edit`, `/api/admin/staged-legacy/remove`, `/api/admin/staged-batches`, `/api/admin/followup-batches`, `/api/admin/batch-link`, `/api/admin/rejection-followups`) — zero-diff on URLs, the one thing this move had to get exactly right.

**Files touched:**
- Moved (10 files, all `route.ts` files relocated one folder deeper, no content changes): see list above
- `NOTES_FOR_LATER.md` (new possibly-orphaned-routes note, documentation only)

---

## Tier 2 — second route-group: `app/api/admin/(email)/`

**What changed:** 6 route files grouped under `app/api/admin/(email)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged (route group segment stripped from URL):

```
compose-email/route.ts, upload-email-attachment/route.ts, email-templates/route.ts,
email-templates/save/route.ts, email-conversations/route.ts, email-conversations/reply/route.ts
```

**Verified before moving:** all 6 files use `@/lib/...` alias imports exclusively — zero relative imports, no adjustments needed. Full-repo grep for each route's URL across `app/`, `components/`, `scripts/`, and root docs found every one of the 6 has an active caller (`components/admin/ComposeEmailPanel.tsx`, `EmailTemplatesPanel.tsx`, `RichEmailEditor.tsx`, `SupportPanel.tsx`) — **no orphaned routes in this group**, unlike `(legacy-outreach)`.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. Confirmed all 6 URLs appear identically in the route manifest with no `(email)` segment visible (`/api/admin/compose-email`, `/api/admin/upload-email-attachment`, `/api/admin/email-templates`, `/api/admin/email-templates/save`, `/api/admin/email-conversations`, `/api/admin/email-conversations/reply`) — zero-diff on URLs.

**Files touched:**
- Moved (6 files, relocated one folder deeper, no content changes): see list above

---

## Tier 2 — third route-group: `app/api/admin/(users)/`

**What changed:** 2 route files grouped under `app/api/admin/(users)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
users/route.ts, users-upload/route.ts
```

**Verified before moving:** both files use `@/lib/...` alias imports exclusively — zero relative imports, no adjustments needed. Full-repo grep found both routes have active callers (`components/admin/UsersPanel.tsx`) — **no orphaned routes in this group**.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. Confirmed both URLs (`/api/admin/users`, `/api/admin/users-upload`) appear identically in the route manifest with no `(users)` segment visible — zero-diff.

**Files touched:**
- Moved (2 files, relocated one folder deeper, no content changes): see list above

---

## Tier 2 — fourth route-group: `app/api/admin/(participants)/`

**What changed:** 5 route files grouped under `app/api/admin/(participants)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
bulk-import-participants/route.ts, bulk-import-approved/route.ts, cancel-bulk-import/route.ts,
promote-to-participants/route.ts, program-participants/route.ts
```

**Verified before moving:** all 5 files use `@/lib/...` alias imports exclusively — zero relative imports, no adjustments needed. Full-repo grep (including a broader term search beyond exact URL matches) found **4 of the 5 have zero callers anywhere** in `app/`, `components/`, or `scripts/` (`bulk-import-participants`, `bulk-import-approved`, `cancel-bulk-import`, `promote-to-participants`) — only `program-participants` is actively called (`components/admin/AdminShell.tsx:39`). Logged to `NOTES_FOR_LATER.md` as a flagged-only observation — the largest orphaned cluster found so far across the route-group moves.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. Confirmed all 5 URLs appear identically in the route manifest with no `(participants)` segment visible — zero-diff.

**Files touched:**
- Moved (5 files, relocated one folder deeper, no content changes): see list above
- `NOTES_FOR_LATER.md` (new possibly-orphaned-routes note, documentation only)

---

## Tier 2 — fifth route-group: `app/api/admin/(verification-review)/`

**What changed:** 7 route files grouped under `app/api/admin/(verification-review)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
verifications/route.ts, bulk-verification-decision/route.ts, send-single-verification-decision/route.ts,
send-verification-email/route.ts, force-release-date/route.ts, force-release-date-by-id/route.ts,
force-invite-age/route.ts
```

**Verified before moving:** all 7 files use `@/lib/...` alias imports exclusively — zero relative imports, no adjustments needed. Full-repo grep found **5 of the 7 have zero callers anywhere** in `app/`, `components/`, or `scripts/` (`send-single-verification-decision`, `send-verification-email`, `force-release-date`, `force-release-date-by-id`, `force-invite-age`) — only `verifications` and `bulk-verification-decision` are actively called (`components/admin/VerificationsTable.tsx`). Logged to `NOTES_FOR_LATER.md` — now the third and largest orphaned cluster found across the Tier 2 moves so far, with a noted recurring pattern (single-item/"force override" actions consistently orphaned, list/bulk endpoints consistently wired up) flagged as possibly worth a dedicated investigation once Tier 2 completes.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. Confirmed all 7 URLs appear identically in the route manifest with no `(verification-review)` segment visible — zero-diff.

**Files touched:**
- Moved (7 files, relocated one folder deeper, no content changes): see list above
- `NOTES_FOR_LATER.md` (new possibly-orphaned-routes note, documentation only)

---

## Tier 2 — sixth route-group: `app/api/admin/(video-review)/`

**What changed:** 4 route files grouped under `app/api/admin/(video-review)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
video-submissions/route.ts, bulk-video-decision/route.ts, send-single-video-decision/route.ts,
send-single-video-invite/route.ts
```

**Verified before moving:** all 4 files use `@/lib/...` alias imports exclusively — zero relative imports. Full-repo grep found `send-single-video-decision` and `send-single-video-invite` have zero callers; `video-submissions` and `bulk-video-decision` are actively called (`components/admin/VideoSubmissionsTable.tsx`). Logged to `NOTES_FOR_LATER.md`.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. All 4 URLs identical in the manifest, no `(video-review)` segment visible — zero-diff.

**Files touched:**
- Moved (4 files, relocated one folder deeper, no content changes): see list above
- `NOTES_FOR_LATER.md` (new possibly-orphaned-routes note, documentation only)

---

## Tier 2 — seventh route-group: `app/api/admin/(support)/`

**What changed:** 4 route files grouped under `app/api/admin/(support)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
chatbot-conversations/route.ts, contact-messages/route.ts, mark-resolved/route.ts, sos-reports/route.ts
```

**Verified before moving:** all 4 files use `@/lib/...` alias imports exclusively — zero relative imports. Full-repo grep found all 4 have active callers (`components/admin/SupportPanel.tsx`) — **no orphaned routes in this group**.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. All 4 URLs identical in the manifest, no `(support)` segment visible — zero-diff.

**Files touched:**
- Moved (4 files, relocated one folder deeper, no content changes): see list above

---

## Tier 2 — eighth route-group: `app/api/admin/(analytics)/`

**What changed:** 4 route files grouped under `app/api/admin/(analytics)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
analytics-data/route.ts, funnel-analytics/route.ts, call-log/route.ts, call-notes/route.ts
```

**Verified before moving:** all 4 files use `@/lib/...` alias imports exclusively — zero relative imports. Full-repo grep found all 4 have active callers (`components/admin/AnalyticsPanel.tsx`, `FunnelAnalyticsPanel.tsx`, `CallLogPanel.tsx`, `CallNotesPanel.tsx`) — **no orphaned routes in this group**.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. All 4 URLs identical in the manifest, no `(analytics)` segment visible — zero-diff.

**Files touched:**
- Moved (4 files, relocated one folder deeper, no content changes): see list above

---

## Tier 2 — ninth route-group: `app/api/admin/(engine)/`

**What changed:** 3 route files grouped under `app/api/admin/(engine)/`, per `REFACTOR_PLAN.md` §1a. These were already nested under an `engine/` folder — the route group wraps *around* that existing folder (`(engine)/engine/...`) rather than replacing it, since removing the `engine` path segment would have changed the URLs from `/api/admin/engine/*` to `/api/admin/*`, violating the zero-URL-diff requirement. URLs unchanged:

```
engine/health-check/route.ts, engine/cron-status/route.ts, engine/trigger-cron/route.ts
```

**Verified before moving:** all 3 files use `@/lib/...` alias imports exclusively — zero relative imports. Full-repo grep found all 3 have active callers (`components/admin/EngineMonitorShell.tsx`) — **no orphaned routes in this group**.

**Verified after moving:** confirmed the moved `engine/` folder contains exactly the 3 expected files, nothing extra swept in unintentionally. `npm run build` completed with `✓ Compiled successfully`, no errors. All 3 URLs identical in the manifest (`engine` segment correctly preserved) — zero-diff.

**Files touched:**
- Moved (3 files, relocated one folder deeper, no content changes): see list above

---

## Tier 2 — tenth route-group: `app/api/admin/(maintenance)/`

**What changed:** 4 route files grouped under `app/api/admin/(maintenance)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
backfill-awaiting-flags/route.ts, backfill-batch-ids/route.ts, migrate-to-d1/route.ts, backup-to-r2/route.ts
```

**Verified before moving:** all 4 files use `@/lib/...` alias imports exclusively — zero relative imports. Full-repo grep found `backfill-awaiting-flags`, `backfill-batch-ids`, `migrate-to-d1` have zero callers; only `backup-to-r2` is actively called (`components/admin/EngineMonitorShell.tsx`). Logged to `NOTES_FOR_LATER.md` — noted these plausibly are intentionally uncalled maintenance/migration tools, not evidence of a wiring gap like the other orphaned clusters found this session.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. All 4 URLs identical in the manifest, no `(maintenance)` segment visible — zero-diff.

**Files touched:**
- Moved (4 files, relocated one folder deeper, no content changes): see list above
- `NOTES_FOR_LATER.md` (new possibly-orphaned-routes note, documentation only)

---

## Tier 2 — eleventh route-group: `app/api/admin/(dev-only)/`

**What changed:** 2 route files grouped under `app/api/admin/(dev-only)/`, per `REFACTOR_PLAN.md` §1a. URLs unchanged:

```
debug-reminders/route.ts, debug-video-invite/route.ts
```

**Verified before moving:** both files use `@/lib/...` alias imports exclusively — zero relative imports. Full-repo grep found zero callers for both — expected and not a new finding, since these are the Phase 3 item 11 dev-only debug tools (already gated behind a `NODE_ENV === "production"` guard, meant for manual invocation, already documented in `NOTES_FOR_LATER.md`).

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors. Both URLs identical in the manifest (shown as static `○`, consistent with the item-11 guard's build-time dead-code effect noted earlier), no `(dev-only)` segment visible — zero-diff.

**Files touched:**
- Moved (2 files, relocated one folder deeper, no content changes): see list above

---

## Tier 2 — twelfth (final) route-group batch: `app/api/public/(forms)/`, `(otp)/`, `(analytics)/`

**What changed:** 10 route files grouped into three new route groups under `app/api/public/`, per `REFACTOR_PLAN.md` §1b. URLs unchanged:

- `(forms)/`: `apply/route.ts`, `contact/route.ts`, `sos/route.ts`, `additional-details/route.ts`, `rejection-followup/route.ts`, `email-reply/route.ts`
- `(otp)/`: `send-otp/route.ts`, `verify-otp/route.ts`, `verify-application-email/route.ts`
- `(analytics)/`: `funnel-event/route.ts`

(Note: `app/api/public/(analytics)/` is a separate route group from the earlier `app/api/admin/(analytics)/` — same name, different directory tree, no collision since route groups are scoped per-parent-directory.)

**Verified before moving:** all 10 files use `@/lib/...` alias imports exclusively — zero relative imports. Full-repo grep found active callers for all 10 — **zero orphaned routes in this batch**, the first fully-wired group of the session. `rejection-followup` initially appeared to have no caller in a `fetch()`-pattern grep, but further checking found it's linked via `<a href>` in email templates (`lib/engine/defaultTemplates.ts:271,273,358,360`), not called via `fetch()` — confirmed as a genuine caller, not orphaned, avoiding a false flag.

**Verified after moving:** `npm run build` completed with `✓ Compiled successfully`, no errors (only the same pre-existing benign `rejection-followup` static-probing log seen throughout this session, unrelated to this move). All 10 URLs identical in the manifest, no `(forms)`/`(otp)`/`(analytics)` segments visible — zero-diff.

**Files touched:**
- Moved (10 files, relocated one folder deeper, no content changes): see list above

---

## Tier 3 — item 1 (PILOT ONLY): `withAdminAuth` wrapper

**Status: PILOT ONLY.** This entry covers a 2-route pilot, not a rollout. Full migration of the remaining ~61 admin routes that still inline the `getVerifiedAdminSession()` + 401-check boilerplate is a **separate, later step**, pending explicit review of this pilot and a further go-ahead. Nothing else was touched.

**What changed:** added a new higher-order function, `lib/auth/withAdminAuth.ts`, that wraps a route handler and performs the admin-session check before calling it:

```ts
export function withAdminAuth<Context = unknown>(handler: AdminRouteHandler<Context>) {
  return async (req: NextRequest, context: Context): Promise<NextResponse> => {
    const session = await getVerifiedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, session, context);
  };
}
```

The 401 response is byte-for-byte identical to what every route already returned inline (`{ error: "Unauthorized" }`, status 401). The session type (`AdminSession`) is derived directly from `getVerifiedAdminSession`'s own return type via `NonNullable<Awaited<ReturnType<typeof getVerifiedAdminSession>>>`, rather than hand-duplicated, so it can't drift out of sync if that function's shape ever changes. A generic `Context` parameter (default `unknown`) was included so the wrapper would still work correctly if a dynamic admin route (`[id]`-style) is added later — confirmed via `find` that **zero admin routes are dynamic today**, so no current route needs it.

**Why these two routes were chosen as the pilot:** `app/api/admin/(analytics)/call-log/route.ts` and `app/api/admin/(analytics)/call-notes/route.ts` — both low-traffic internal call-tracking tooling, low blast radius if anything were subtly wrong. Between them they cover every shape the wrapper needs to handle:
- `call-log`: a single `GET()` handler that never used `req` at all — tests the wrapper doesn't break handlers with no request dependency.
- `call-notes`: both `GET` and `POST` in the same file (tests multi-method wrapping in one file), `GET` reads `req.nextUrl.searchParams`, and `POST` reads a field off the session object itself (`(session as any).email`) — the only file found so far that uses session data beyond the auth check, so it verifies the wrapper passes through the real session object, not a stub.

**Change per file:** removed the two boilerplate lines (`const session = await getVerifiedAdminSession(); if (!session) return ...401...;`) and the now-unused `getVerifiedAdminSession` import; wrapped the remaining handler body in `withAdminAuth(async (req, session) => { ... })`. Zero changes inside either handler body — same D1 queries, same error messages, same response shapes, same `(session as any).email` usage.

**Verified after applying:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. Both routes appear in the route manifest with URLs unchanged: `/api/admin/call-log`, `/api/admin/call-notes` (the `(analytics)` route-group segment correctly stripped, as before). Re-read both files in full after editing — confirmed nothing beyond the intended diff was touched (helper functions `addDays`/`daysBetween`/`fmt` in `call-log`, and every line of business logic in both files, are unchanged).

**Files touched:**
- New: `lib/auth/withAdminAuth.ts`
- Edited: `app/api/admin/(analytics)/call-log/route.ts`, `app/api/admin/(analytics)/call-notes/route.ts`

**Explicitly not done:** no other admin route was touched. Rolling `withAdminAuth` out to the remaining ~61 admin routes is deferred pending review of this pilot.

---

## Tier 3 — item 1, rollout batch 1/7 (10 files)

**Pre-rollout audit:** a full-repo scan of all 61 remaining files with the inline `getVerifiedAdminSession()` boilerplate confirmed the count matches expectations (~63 total admin routes minus the 2 pilot routes). Audit findings for all 61: zero files use `session` for anything beyond the initial null-check, zero relative imports anywhere, zero dynamic route params/context. Flagged for extra care in later batches: 6 files use a multi-line `if (!session) { ... }` block instead of single-line, 1 file (`batch-link`) has both GET and POST needing separate wrapping, 2 files (`debug-reminders`, `debug-video-invite`) have a pre-auth `NODE_ENV` guard that must stay outside the wrapper.

**This batch (all standard single-line pattern, no anomalies):**
- `(verification-review)/force-release-date-by-id/route.ts`
- `(engine)/engine/health-check/route.ts`
- `(maintenance)/migrate-to-d1/route.ts`
- `reconcile-pending-applications/route.ts`
- `(verification-review)/send-verification-email/route.ts`
- `(email)/email-conversations/reply/route.ts`
- `(video-review)/send-single-video-decision/route.ts`
- `(video-review)/send-single-video-invite/route.ts`
- `(verification-review)/send-single-verification-decision/route.ts`
- `(legacy-outreach)/send-single-legacy/route.ts`

**Change applied (identical to the pilot):** removed the two boilerplate lines and the `getVerifiedAdminSession` import from each file, wrapped the existing handler in `withAdminAuth(async (req, session) => { ... })`. Zero changes to any handler body logic, error messages, or response shapes.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 10 URLs confirmed present in the route manifest, unchanged: `/api/admin/force-release-date-by-id`, `/api/admin/engine/health-check`, `/api/admin/migrate-to-d1`, `/api/admin/reconcile-pending-applications`, `/api/admin/send-verification-email`, `/api/admin/email-conversations/reply`, `/api/admin/send-single-video-decision`, `/api/admin/send-single-video-invite`, `/api/admin/send-single-verification-decision`, `/api/admin/send-single-legacy`.

**Files touched:** the 10 files listed above (edited only).

**Remaining:** 51 admin routes still on the inline pattern. 6 batches to go.

---

## Tier 3 — item 1, rollout batch 2/7 (10 files)

**This batch (deliberately front-loaded the flagged anomalies):**
- `(analytics)/analytics-data/route.ts` — multi-line `if (!session) { ... }` block
- `(verification-review)/verifications/route.ts` — multi-line `if (!session) { ... }` block
- `(dev-only)/debug-reminders/route.ts` — pre-auth `NODE_ENV === "production"` guard
- `(dev-only)/debug-video-invite/route.ts` — pre-auth `NODE_ENV === "production"` guard
- `(legacy-outreach)/batch-link/route.ts` — dual GET + POST handlers, both wrapped independently
- `(email)/compose-email/route.ts` — standard
- `message-user/route.ts` — standard
- `(participants)/bulk-import-participants/route.ts` — standard
- `(participants)/program-participants/route.ts` — standard
- `(maintenance)/backup-to-r2/route.ts` — standard

**Multi-line files:** the 4-line `if (!session) { ... }` block (instead of the single-line form) was removed the same way as the 2-line form — zero remaining trace, closing brace correctly changed from `}` to `});`. Verified by re-reading both files in full after editing.

**`debug-reminders` / `debug-video-invite` (NODE_ENV guard):** restructured so the `NODE_ENV === "production"` check remains a plain, unwrapped guard that runs first and returns its flat 404 before `withAdminAuth` is ever invoked. Only the session-dependent body moved into a `withAdminAuth`-wrapped inner function (`authedGET`), called from the exported `GET` only after the guard passes:
```ts
const authedGET = withAdminAuth(async (req, session) => { ...unchanged body... });

export async function GET(req: NextRequest, context: unknown) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return authedGET(req, context);
}
```
This preserves the exact original ordering: `NODE_ENV` check → (if passed) session check → body. Confirmed via full re-read after editing.

**`batch-link`:** both `GET` and `POST` converted to independent `withAdminAuth(...)` calls in the same file, same pattern as the `call-notes` pilot. Confirmed via full re-read.

**Change applied to the 4 standard files:** identical mechanical transform as batch 1 — boilerplate lines and `getVerifiedAdminSession` import removed, handler wrapped in `withAdminAuth(async (req, session) => { ... })`, zero logic changes.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 10 URLs confirmed present in the route manifest, unchanged: `/api/admin/analytics-data`, `/api/admin/verifications`, `/api/admin/debug-reminders` (still static `○`, consistent with the build-time dead-code effect of the `NODE_ENV` guard noted in Tier 2), `/api/admin/debug-video-invite` (same), `/api/admin/batch-link`, `/api/admin/compose-email`, `/api/admin/message-user`, `/api/admin/bulk-import-participants`, `/api/admin/program-participants`, `/api/admin/backup-to-r2`.

**Files touched:** the 10 files listed above (edited only).

**Remaining:** 41 admin routes still on the inline pattern. 5 batches to go. All flagged anomaly categories (multi-line block, dual-handler, pre-auth guard) are now validated in production code — the remaining 4 multi-line files (`video-submissions`, `applicants`, `users-upload`, `users`) can proceed with the same confirmed-working transform.

---

## Tier 3 — item 1, rollout batch 3/7 (10 files)

**This batch (prioritized the remaining 4 flagged multi-line files while the pattern was fresh):**
- `(video-review)/video-submissions/route.ts` — multi-line `if (!session) { ... }` block
- `applicants/route.ts` — multi-line `if (!session) { ... }` block
- `(users)/users-upload/route.ts` — multi-line `if (!session) { ... }` block
- `(users)/users/route.ts` — multi-line `if (!session) { ... }` block
- `search-user/route.ts` — standard
- `applicants-more/route.ts` — standard
- `(email)/email-templates/save/route.ts` — standard
- `(email)/email-templates/route.ts` — standard
- `(maintenance)/backfill-awaiting-flags/route.ts` — standard
- `(maintenance)/backfill-batch-ids/route.ts` — standard

**Multi-line files:** same transform validated in batch 2 — the 4-line `if (!session) { ... }` block and the `getVerifiedAdminSession` import removed, handler wrapped in `withAdminAuth(async (req, session) => { ... })`, closing brace changed from `}` to `});`. All 4 files (plus the other 6 in this batch) were fully re-read after editing — not just diff-trusted — to confirm the closing brace and full body were correct in every file.

**Change applied to the 6 standard files:** identical mechanical transform as batches 1-2. Zero logic changes.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 10 URLs confirmed present in the route manifest, unchanged: `/api/admin/video-submissions`, `/api/admin/applicants`, `/api/admin/users-upload`, `/api/admin/users`, `/api/admin/search-user`, `/api/admin/applicants-more`, `/api/admin/email-templates/save`, `/api/admin/email-templates`, `/api/admin/backfill-awaiting-flags`, `/api/admin/backfill-batch-ids`.

**Files touched:** the 10 files listed above (edited only).

**Remaining:** 31 admin routes still on the inline pattern. 4 batches to go. All 6 flagged multi-line files and the 1 dual-handler file from the original audit are now converted — every remaining file uses the standard single-line pattern with no anomalies.

---

## Tier 3 — item 1, rollout batch 4/7 (8 files)

**This batch (all standard single-line pattern, no anomalies):**
- `(legacy-outreach)/schedule-legacy-batch/route.ts`
- `(participants)/bulk-import-approved/route.ts`
- `(participants)/cancel-bulk-import/route.ts`
- `(legacy-outreach)/list-legacy-sent/route.ts`
- `(legacy-outreach)/rejection-followups/route.ts`
- `(legacy-outreach)/staged-legacy/remove/route.ts`
- `(legacy-outreach)/staged-legacy/edit/route.ts`
- `(legacy-outreach)/staged-legacy/add/route.ts`

**Change applied:** identical mechanical transform as prior batches. Zero logic changes. All 8 files re-read in full after editing to confirm correctness.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 8 URLs confirmed present in the route manifest, unchanged: `/api/admin/schedule-legacy-batch`, `/api/admin/bulk-import-approved`, `/api/admin/cancel-bulk-import`, `/api/admin/list-legacy-sent`, `/api/admin/rejection-followups`, `/api/admin/staged-legacy/remove`, `/api/admin/staged-legacy/edit`, `/api/admin/staged-legacy/add`.

**Files touched:** the 8 files listed above (edited only).

**Remaining:** 23 admin routes still on the inline pattern. 3 batches to go.

---

## Tier 3 — item 1, rollout batch 5/7 (8 files)

**This batch (all standard single-line pattern, no anomalies):**
- `(participants)/promote-to-participants/route.ts`
- `(verification-review)/force-invite-age/route.ts`
- `(verification-review)/force-release-date/route.ts`
- `reconcile-details/route.ts`
- `additional-details/route.ts`
- `(engine)/engine/cron-status/route.ts`
- `(analytics)/funnel-analytics/route.ts`
- `(legacy-outreach)/followup-batches/route.ts`

**Change applied:** identical mechanical transform as prior batches. Zero logic changes. All 8 files re-read in full after editing to confirm correctness.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 8 URLs confirmed present in the route manifest, unchanged: `/api/admin/promote-to-participants`, `/api/admin/force-invite-age`, `/api/admin/force-release-date`, `/api/admin/reconcile-details`, `/api/admin/additional-details`, `/api/admin/engine/cron-status`, `/api/admin/funnel-analytics`, `/api/admin/followup-batches`.

**Files touched:** the 8 files listed above (edited only).

**Remaining:** 15 admin routes still on the inline pattern. 2 batches to go.

---

## Tier 3 — item 1, rollout batch 6/7 (8 files)

**This batch (all standard single-line pattern, no anomalies):**
- `(legacy-outreach)/staged-batches/route.ts`
- `(email)/email-conversations/route.ts`
- `(support)/chatbot-conversations/route.ts`
- `(support)/mark-resolved/route.ts`
- `(support)/sos-reports/route.ts`
- `(support)/contact-messages/route.ts`
- `mark-completed/route.ts`
- `clear-for-reapply/route.ts`

**Change applied:** identical mechanical transform as prior batches. Zero logic changes. All 8 files re-read in full after editing to confirm correctness.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 8 URLs confirmed present in the route manifest, unchanged: `/api/admin/staged-batches`, `/api/admin/email-conversations`, `/api/admin/chatbot-conversations`, `/api/admin/mark-resolved`, `/api/admin/sos-reports`, `/api/admin/contact-messages`, `/api/admin/mark-completed`, `/api/admin/clear-for-reapply`.

**Files touched:** the 8 files listed above (edited only).

**Remaining:** 7 admin routes still on the inline pattern. 1 final batch to go.

---

## Tier 3 — item 1, rollout batch 7/7 (7 files, FINAL BATCH)

**This batch (all standard single-line pattern, no anomalies):**
- `delete-platform-user/route.ts`
- `delete-applicant/route.ts`
- `edit-user/route.ts`
- `(verification-review)/bulk-verification-decision/route.ts`
- `(video-review)/bulk-video-decision/route.ts`
- `(engine)/engine/trigger-cron/route.ts`
- `(email)/upload-email-attachment/route.ts`

**Change applied:** identical mechanical transform as prior batches. Zero logic changes. All 7 files re-read in full after editing to confirm correctness.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 7 URLs confirmed present in the route manifest, unchanged: `/api/admin/delete-platform-user`, `/api/admin/delete-applicant`, `/api/admin/edit-user`, `/api/admin/bulk-verification-decision`, `/api/admin/bulk-video-decision`, `/api/admin/engine/trigger-cron`, `/api/admin/upload-email-attachment`.

**Files touched:** the 7 files listed above (edited only).

**Rollout complete.** This was the final batch — all 61 remaining admin routes from the original audit (plus the 2 pilot routes from earlier) have now been converted to `withAdminAuth`.

---

## Tier 3 — item 2 (PILOT ONLY): `withRateLimit` wrapper

**Status: PILOT ONLY.** Full rollout to the remaining 18 of 21 rate-limited public routes is a separate, later step pending review of this pilot.

**What changed:** added `lib/engine/withRateLimit.ts`, a higher-order function mirroring `withAdminAuth`'s shape but more flexible, since the 21 existing rate-limited routes are not as uniform as the admin-auth boilerplate was:

```ts
export function withRateLimit<Context = unknown>(config: RateLimitConfig) {
  return function (handler: RouteHandler<Context>): RouteHandler<Context> {
    return async (req: NextRequest, context: Context): Promise<NextResponse> => {
      ...same checkRateLimit call and default 429 JSON response as every route already had...
    };
  };
}
```

`config.key` accepts either a plain string (IP-suffixed automatically, matching the common `` `{name}:${ip}` `` pattern used by 17 of the 21 routes) or a function `(req) => string` for the two email-keyed routes (`verify-otp`, `verify-application-email`). `config.message` and `config.buildResponse` allow the two routes with non-default 429 bodies (`rejection-followup`'s plain-text response, `verify-otp`/`verify-application-email`'s custom message) to preserve their exact current behavior once converted — not part of this pilot, but designed in from the start so later batches don't need a second wrapper revision.

**Audited all 21 existing `checkRateLimit` call sites before designing the wrapper** (not the 19 originally estimated — 2 dynamic routes, `verify/[code]` and `lpx-id/photo/[...key]`, were previously uncounted). Confirmed: none of the 21 limits, keys, or windows would be normalized by this wrapper — every value stays exactly as configured per-route. Confirmed via grep that **zero routes currently combine rate limiting with admin-session auth** (the one route with both `getVerifiedAdminSession` and public-path placement, `app/api/public/verification/file/[...key]/route.ts`, has no rate limit at all) — so `withRateLimit` and `withAdminAuth` are not exercised together today, though they compose naturally (`withRateLimit(...)(withAdminAuth(...)(handler))`) if that ever changes.

**Pilot routes chosen:** `(forms)/contact`, `(forms)/additional-details`, `certificate/lookup` — all three are the simplest case: single IP-keyed check, standard 10/3600 limit, standard JSON 429 response, no dynamic route params. Deliberately excludes the harder cases (dual-check `send-otp`, email-keyed `verify-otp`/`verify-application-email`, plain-text-response `rejection-followup`, and the two dynamic routes) until the base wrapper is proven, mirroring the `withAdminAuth` rollout's own front-loaded-anomalies approach.

**Change per file:** removed the inline `getCloudflareContext()` + `kv` + `ip` + `checkRateLimit()` + 429-check block, removed the `checkRateLimit` import, wrapped the handler in `withRateLimit({ key: "...", maxRequests: N, windowSeconds: N })(async (req) => { ... })`. Zero changes to any handler body logic beyond that boilerplate removal.

**Verified:** `npm run build` completed with exit code 0, `✓ Compiled successfully`. All 3 routes confirmed present in the route manifest, unchanged: `/api/public/contact`, `/api/public/additional-details`, `/api/public/certificate/lookup`.

**Files touched:**
- New: `lib/engine/withRateLimit.ts`
- Edited: `app/api/public/(forms)/contact/route.ts`, `app/api/public/(forms)/additional-details/route.ts`, `app/api/public/certificate/lookup/route.ts`

**Explicitly not done:** no other rate-limited route was touched. Rolling out to the remaining 18 routes — including the 5 flagged anomalies (dual-check, 2 email-keyed, plain-text response, 2 dynamic routes) — is deferred pending review of this pilot.
