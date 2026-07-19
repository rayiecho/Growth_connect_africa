# Phase 4 Refactor Plan — Clean Architecture Pass

Status: **PLANNING ONLY. No files have been moved, renamed, or restructured.** This document is for review. Execution happens in separate, small, individually-approved steps after this plan (or parts of it) is signed off.

Ground rule for all of Phase 4: **no product behavior changes.** Every fix landed in Phase 3 (see `FIXES_LOG.md`, items 1–11 plus this session's `next.config.js` dev fix) must keep working identically. Anything in this plan that risks behavior change is explicitly flagged as such, not silently included.

Sources used to build this plan: `ARCHITECTURE.md` (original structure + Known Issues #1–13), `SECURITY_AUDIT.md`, `FIXES_LOG.md` (everything already fixed, so this plan doesn't re-propose fixing something twice), `NOTES_FOR_LATER.md`, plus a fresh directory listing taken today of `app/api/admin/`, `lib/engine/`, `lib/firebase/`, `lib/db/` to make sure this plan reflects the codebase as it exists now, not just the original audit snapshot.

---

## A critical constraint that shapes this whole plan

**In Next.js App Router, a route's folder path *is* its URL path.** Moving `app/api/admin/foo/route.ts` to `app/api/admin/bar/foo/route.ts` changes the live URL from `/api/admin/foo` to `/api/admin/bar/foo`. This matters enormously here because:
- The cron routes are invoked by an **external scheduler hitting a URL directly** (confirmed in `ARCHITECTURE.md`: no Cloudflare Cron Trigger is declared, so something outside this codebase — a scheduler service — is configured with these exact paths).
- Frontend code (`fetch("/api/admin/...")`, `fetch("/api/public/...")`) hardcodes these paths throughout `components/` and `app/`.

So: **any reorganization that changes a route's importable folder path also changes its URL**, and URL changes for `app/api/cron/*` specifically require coordinating with whatever external system calls them — that's not a "pure" refactor, it's a deploy-coordination task. Next.js App Router does have a mechanism for organizing files into folders *without* affecting the URL — **route groups**, written as `(folderName)` — segments in parentheses are stripped from the URL. This plan uses route groups wherever reorganization is proposed for API routes, and explicitly flags the one place (cron nesting) where true URL-changing consolidation would be needed to fully "fix" the inconsistency, recommending against doing that as part of this phase.

---

## 1. Proposed folder structure and what it fixes

### 1a. `app/api/admin/*` — group by domain using route groups (no URL change)

Today, all ~63 admin routes sit flat in `app/api/admin/`. Proposed grouping (folder-only, URLs unchanged):

```
app/api/admin/
  (applicants)/
    applicants/, applicants-more/, search-user/, edit-user/, delete-applicant/,
    delete-platform-user/, clear-for-reapply/, reconcile-details/,
    reconcile-pending-applications/, additional-details/, message-user/
  (users)/
    users/, users-upload/
  (participants)/
    bulk-import-participants/, bulk-import-approved/, cancel-bulk-import/,
    promote-to-participants/, program-participants/
  (verification-review)/
    verifications/, bulk-verification-decision/, send-single-verification-decision/,
    send-verification-email/, force-release-date/, force-release-date-by-id/, force-invite-age/
  (video-review)/
    video-submissions/, bulk-video-decision/, send-single-video-decision/,
    send-single-video-invite/
  (legacy-outreach)/
    schedule-legacy-batch/, send-single-legacy/, list-legacy-sent/,
    staged-legacy/{add,edit,remove}/, staged-batches/, followup-batches/,
    batch-link/, rejection-followups/
  (email)/
    compose-email/, upload-email-attachment/, email-templates/,
    email-templates/save/, email-conversations/, email-conversations/reply/
  (support)/
    chatbot-conversations/, contact-messages/, mark-resolved/, sos-reports/
  (analytics)/
    analytics-data/, funnel-analytics/, call-log/, call-notes/
  (engine)/
    engine/health-check/, engine/cron-status/, engine/trigger-cron/
  (maintenance)/
    backfill-awaiting-flags/, backfill-batch-ids/, migrate-to-d1/, backup-to-r2/
  (dev-only)/
    debug-reminders/, debug-video-invite/
  mark-completed/route.ts   (stays top-level — certificate issuance is its own concern, doesn't fit neatly elsewhere)
```

**What this fixes:** right now, finding "everything related to the video-pitch review workflow" means scanning 63 flat filenames. Grouped, a new contributor (or future-you) can see the domain boundaries at a glance. This directly addresses the *readability* half of `ARCHITECTURE.md` issue #11 (the near-duplicate decision routes become visually adjacent, making the duplication obvious and the eventual consolidation — see §2 — easier to scope correctly).

**Risk: low, if done with route groups.** Zero URL changes, so nothing external (frontend fetches, admin-triggered actions) needs to change. The only risk is import-path updates inside each moved file (relative imports like `../../../lib/...` become one segment deeper) — mechanical, verifiable by a full build.

### 1b. `app/api/public/*` — lighter grouping, same route-group mechanism

Public routes are already fairly well-organized (`verification/`, `video-pitch/`, `lpx-id/` already exist as real subfolders — those already affect URLs and are already live, so they're untouched). The only proposed addition: group the flatter miscellaneous ones for readability:
```
app/api/public/
  (forms)/
    apply/, contact/, sos/, additional-details/, rejection-followup/, email-reply/
  (otp)/
    send-otp/, verify-otp/, verify-application-email/
  (analytics)/
    funnel-event/
  chatbot/, certificate/, verify/[code]/, lpx-id/, verification/, video-pitch/  (unchanged, already reasonably organized)
```
**Risk: low**, same reasoning as 1a.

### 1c. `app/api/cron/*` — the one place true consolidation is flagged, not proposed for this phase

`ARCHITECTURE.md` issue #12 flags `cron/video/{approved,rejected,action-required}` sitting nested one level deeper than the flatter `video-outcome-batch`/`video-invite-batch`/`video-reminder-batch` siblings. A fully consistent structure would put all six under `cron/video/`. **I'm not proposing that move in this plan** — per the constraint above, it changes the URLs of whichever three currently live flat, and those are (probably) configured in an external scheduler this codebase has no visibility into. Recommendation: **leave cron route paths exactly as they are** for this refactor phase. If the team wants this fixed later, it needs to be its own coordinated task (update scheduler config + move files + verify + cutover), not bundled into a "no behavior change" cleanup.

### 1d. `lib/` — fixing the "wrong backend" naming and misplaced files

- **`lib/firebase/types.ts`** defines `Applicant`, `VideoSubmission`, `Verification`, `EngineRunLog` — these describe **D1** rows, not Firestore documents (`ARCHITECTURE.md` issue #8). Proposed move: `lib/firebase/types.ts` → `lib/db/types.ts`. Pure file move + import-path updates (it's imported by `app/admin/dashboard/page.tsx` and a handful of others per earlier research) — no logic change, just where the file lives.
- **`lib/firebase/admin.ts`** — confirmed dead code (the unused `firebase-admin` Node SDK path, zero imports anywhere in `app/`, per `ARCHITECTURE.md` issue #9). Proposed: **delete**, not move. Zero risk — nothing references it.
- **`lib/engine/ses.ts`** — misleadingly named for AWS SES but calls Elastic Email's HTTP API (`ARCHITECTURE.md` issue #7). Proposed rename: `lib/engine/ses.ts` → `lib/engine/email.ts`. Pure rename + import updates across the ~10 files that import `sendEmail`/`sendBulkEmail`/`mergeTags` from it.
- **`lib/firebase/rest-admin.ts`** (743 lines) currently bundles two unrelated concerns in one file: (1) Firebase Auth token/session verification (`verifyIdTokenRest`, `verifySessionCookieRest`, `createSessionCookieRest`, used by the admin login flow) and (2) a full Firestore REST CRUD client (`firestoreQuery`, `firestoreAdd`, etc., used by the handful of routes still on Firestore). Proposed split: `lib/firebase/auth-rest.ts` (the token/session functions) + `lib/firebase/firestore-rest.ts` (the Firestore CRUD functions). Pure file split — no function bodies change, just which file they live in — but touches every one of the ~15+ files that currently import from `rest-admin.ts`, so it needs careful, verified import-path updates (see §4, this is Tier 2/3, not Tier 0/1).

### 1e. Dead file cleanup
- `app/verificafication/page.txs` — confirmed not a routable page (typo'd folder name + wrong extension, `ARCHITECTURE.md` issue #6). Propose: **delete**. Zero risk — it's not reachable, not imported, not linked to anywhere.

---

## 2. Duplicate logic worth consolidating (logic only, not behavior)

1. **Admin session-check boilerplate**, repeated verbatim in ~63 route files:
   ```ts
   const session = await getVerifiedAdminSession();
   if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   ```
   Candidate for a small wrapper (see §3) — this is boilerplate duplication, not logic duplication with drift risk, so it's a good, low-risk consolidation target.

2. **Rate-limit boilerplate**, introduced consistently in Phase 3 item 8 across 18 routes:
   ```ts
   const cfContext = await getCloudflareContext();
   const kv = (cfContext?.env as any)?.TOKEN_CACHE;
   const ip = req.headers.get("cf-connecting-ip") || "unknown";
   const limit = await checkRateLimit(kv, `<key>:${ip}`, N, 3600);
   if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
   ```
   Only the route-specific key string and the two numbers (`N`, window) differ per call site — a strong, low-risk consolidation candidate (see §3).

3. **"Look up applicant by email" D1 query**, repeated near-identically in at least 10 routes (`d1Query("applicants", [{field: "email", op: "EQUAL", value: email}])`) — candidate for a `getApplicantByEmail(email)` helper in `lib/db/`. Low risk, purely additive (existing call sites can be migrated one at a time, or left alone — this doesn't require a big-bang change).

4. **The near-duplicate single/bulk decision routes** (`ARCHITECTURE.md` issue #11): `send-single-verification-decision` / `bulk-verification-decision`, `send-single-video-decision` / `bulk-video-decision`, `force-release-date` / `force-release-date-by-id`. **I have not yet read these six files in this session** — the original audit explicitly noted their internals were "not verified line-by-line against each pair." Before proposing any extraction here, the correct next step is a dedicated read-and-diff pass to confirm whether the single/bulk pairs actually share identical logic (in which case extracting a shared `applyVerificationDecision()`/`applyVideoDecision()` core is safe) or have already drifted (in which case "consolidating" them would silently change behavior — exactly what this phase forbids). **Flagging this as a required investigation step before any action, not something to execute yet.**

5. **CRON_SECRET check** — already reasonably DRY after item 9 (`timingSafeEqual` shared, but the 3-line guard block is still repeated in 11 files). Minor candidate for a `requireCronSecret(req)` helper, lower priority than #1/#2 since it's already been through one consolidation pass this session.

---

## 3. Tight coupling worth reducing

1. **Every admin route re-implementing its own auth check individually**, rather than one shared enforcement point. `SECURITY_AUDIT.md` confirmed this is *not* a security bug (every route does correctly call `getVerifiedAdminSession()`), but it is a maintainability risk: a future route that forgets the check would be silently unprotected, and nothing would catch it except manual review.

   **Recommendation: a per-route wrapper function, not middleware.** `middleware.ts` today deliberately does *only* a cheap cookie-presence check for page routes, explicitly *not* full verification (documented in its own comment, confirmed in the security audit). Moving real enforcement into middleware would be a genuine architecture change — it changes *where* and *how* a 401 gets produced (edge middleware vs. route handler), which is exactly the kind of thing that could subtly change behavior (e.g., error response shape, timing, what request data is available at that point) even if unintentionally. Instead, propose a **higher-order function called explicitly inside each route file**, e.g.:
   ```ts
   export const POST = withAdminAuth(async (req, session) => {
     // existing handler body, unchanged, minus the two boilerplate lines
   });
   ```
   This is behaviorally identical to today (same check, same order, same 401 response) — it's a pure mechanical extraction, not a new enforcement layer. Low risk, but touches every admin route file, so it should be piloted on a handful of routes first (see §4) before wider rollout.

2. **`lib/db/d1-admin.ts`'s `D1Doc` shape deliberately mimics Firestore's `{id, ref, data()}` document shape** (`ARCHITECTURE.md`, `d1-admin.ts` design note) — a historical migration-compatibility artifact. This is real coupling (every D1 call site is written against a Firestore-shaped API rather than plain rows), but changing it means touching the calling convention (`.data()` vs. direct field access) at every one of the ~75 call sites across the app. **This is high blast-radius and high risk relative to its benefit — recommend leaving this alone for this phase.** It's a legitimate future cleanup, but not one that fits "no behavior change, small reviewable steps."

3. **Frontend components make raw inline `fetch()` calls with local `useState` for loading/error**, no shared data-fetching hook or library (`ARCHITECTURE.md`, confirmed no SWR/React Query anywhere). This is real duplication (the same fetch-try-catch-setState pattern appears in dozens of components, including the ones touched in Phase 3's OTP-gate work), but introducing a shared fetching abstraction is a much bigger change with real behavior-risk (subtly different error/loading/retry semantics, race-condition handling, etc.) — **explicitly out of scope for a "no behavior change" phase.** Not recommending this now.

---

## 4. Proposed order of operations — safest first

**Tier 0 — zero risk, do first, can be done in one sitting:**
1. Delete `app/verificafication/page.txs` (confirmed dead, not a route, not imported).
2. Delete `lib/firebase/admin.ts` (confirmed zero imports anywhere).

**Tier 1 — pure rename/move + import-path updates, one concern at a time, verified by full build after each:**
3. Rename `lib/engine/ses.ts` → `lib/engine/email.ts`. Update ~10 import sites. Build + spot-check that email-sending routes still compile and reference the right module.
4. Move `lib/firebase/types.ts` → `lib/db/types.ts`. Update import sites (dashboard page and others). Build.
5. Split `lib/firebase/rest-admin.ts` → `lib/firebase/auth-rest.ts` + `lib/firebase/firestore-rest.ts`. Higher file-count impact than 3/4 (more import sites to touch), but each individual change (function body relocation) is mechanical. Build + grep to confirm no import still points at the old combined file.

**Tier 2 — route-group folder reorganization, one domain group at a time, URL-verified after each:**
6. Apply the `app/api/admin/(...)` route groups from §1a **one group at a time** (e.g. do `(legacy-outreach)` first since it's the most self-contained cluster, verify via build + a manual hit against a couple of the moved routes' unchanged URLs, then move to the next group). Same for `app/api/public/(...)` groups from §1b.
   - After each group move: confirm via `npm run build` that route URLs in the manifest are unchanged (this is directly checkable — the build output lists every route path, so a diff of the manifest before/after should show zero path changes, only file-location changes under the hood).

**Tier 3 — shared-code extraction, piloted before full rollout:**
7. Build the `withAdminAuth` wrapper (§3.1). Pilot on **2-3 low-traffic admin routes first** (e.g. `call-log`, `call-notes` — low usage, low blast radius if something's subtly off), verify behavior is identical (401 on no session, handler runs unchanged on valid session), then roll out to the rest in a few batches, not all 63 at once.
8. Build the rate-limit wrapper (§3... /§2.2). Pilot on 2-3 of the 18 rate-limited routes, verify 429 behavior and headers are identical, then roll out in batches.
9. Build `getApplicantByEmail()` helper (§2.3). Purely additive — new call sites can adopt it gradually; existing `d1Query(...)` call sites don't need to change unless convenient to do so alongside other work.

**Tier 4 — requires investigation before any action:**
10. Read and diff the six single/bulk decision routes (§2.4) line-by-line. Produce a findings note (shared logic vs. already-drifted) **before** proposing any extraction. This might conclude "don't consolidate, they've diverged" — that's a valid outcome of this step, not a failure.

**Explicitly deferred / recommended against for this phase (not sequenced, not scheduled):**
- Cron route URL consolidation (§1c) — needs external scheduler coordination, not a pure refactor.
- `D1Doc`/Firestore-shape decoupling (§3.2) — too high blast-radius for the benefit.
- Frontend shared data-fetching adoption (§3.3) — real behavior-risk, out of scope.
- Deleting `migrate-to-d1`/backfill one-off routes — these look like they've served their purpose, but deleting them is a product decision (are we certain the migration is fully done and will never need re-running?), not a pure refactor call — flagging for your explicit decision, not proposing deletion here.
- Merging the two analytics endpoints (`analytics-data` Firestore vs `funnel-analytics` D1) — this would be a behavior change (they may answer different questions today), not a refactor.

---

## Summary

- **Do first, no discussion needed:** Tier 0 (2 deletions) and Tier 1 (3 mechanical renames/moves).
- **Do next, verify URLs unchanged each time:** Tier 2 (route-group reorganization), one folder group at a time.
- **Do carefully, pilot before full rollout:** Tier 3 (shared wrappers/helpers).
- **Investigate before deciding:** Tier 4 (the decision-route duplication — read first, don't assume).
- **Not part of this phase:** cron URL changes, D1/Firestore shape decoupling, frontend fetching-library adoption, and any deletion of maintenance/migration tooling — all flagged for separate, explicit decisions.

Waiting for your review — approve all of it, part of it, or redirect before any execution begins.
