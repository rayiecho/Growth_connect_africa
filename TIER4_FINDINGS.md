# Tier 4 Findings — Orphaned Routes & Single/Bulk Pair Investigation

Status: **investigation only. No files moved, edited, or deleted.** Every route below was read in full; every caller check searched `app/`, `components/`, `scripts/`, `README.md`, `package.json` scripts, and the repo for `.http`/`.rest`/Postman files (none exist) and in-code comments explaining manual/curl usage (none found on any of the 15 routes).

---

## Summary table

| Route | Category | One-line reason |
|---|---|---|
| `list-legacy-sent` | Likely manual/intentional tool | Read-only audit view of sent legacy emails; harmless, no UI wired |
| `schedule-legacy-batch` | Unclear — needs your input | Real bulk-create capability not covered elsewhere; no evidence of use either way |
| `send-single-legacy` | Likely manual/intentional tool | Confirmed: manual "send now" override of the `legacy-batch-send` cron |
| `staged-legacy/edit` | Likely dead | `staged-legacy/add` already upserts by email; panel only ever calls `add`/`remove` |
| `bulk-import-participants` | Likely manual/intentional tool (already used) | Hardcoded one-time list of real people + past dates, embedded in source |
| `bulk-import-approved` | Likely manual/intentional tool (already used) | Same pattern — hardcoded one-time people list with past dates |
| `cancel-bulk-import` | Likely manual/intentional tool | Companion "undo" for `bulk-import-approved`, same one-time workflow |
| `promote-to-participants` | Likely manual/intentional tool | Companion promotion step for the same legacy-import workflow |
| `send-single-verification-decision` | Likely manual/intentional tool | Confirmed: manual override of `verification-outcome-batch` cron |
| `send-verification-email` | Likely manual/intentional tool | Admin's own Firebase email-verification resend tool |
| `force-release-date` | Likely manual/intentional tool | Whitelisted (4 targets) date-override tool, testing/emergency use |
| `force-release-date-by-id` | Unclear — needs your input | Unrestricted generalized version of the above, no field/table allowlist |
| `force-invite-age` | Likely manual/intentional tool | Backdates invite timestamps — QA/testing tool for the reminder cadence |
| `send-single-video-decision` | Likely manual/intentional tool | Confirmed: manual override of `video-outcome-batch` cron |
| `send-single-video-invite` | Likely manual/intentional tool | Manual override of `video-invite-batch` cron, same confirmed pattern |

**Tally: 12 likely intentional, 1 likely dead, 2 unclear.**

---

## The single/bulk pairs — do they share logic, or have they drifted?

### `send-single-verification-decision` vs. `bulk-verification-decision` — **drifted, genuinely different operations**

`send-single-verification-decision` looks up a verification by email, sends the actual outcome email (`verification_approved`/`verification_rejected`) immediately, sets `outcome_sent_at`, and — if approved — promotes the applicant (`current_stage: "Program Participant"`, `verified_at`) right away.

`bulk-verification-decision` takes an array of verification IDs and only writes `review_status`/`decision_at` on the `verifications` table. **It sends no email and touches no applicant record.**

This isn't a naive single/bulk split of one operation — I confirmed why by reading `app/api/cron/verification-outcome-batch/route.ts`: that cron job queries `verifications` for rows where `review_status` is `Approved`/`Rejected` (exactly what `bulk-verification-decision` sets), `outcome_sent_at` is null, and `outcome_release_date` has passed — then it's the cron that sends the batch email and promotes applicants, on the normal Tue/Fri schedule. **The real production flow is: admin bulk-marks decisions → cron sends them out later, in bulk, on schedule.** `send-single-verification-decision` is a legitimate escape hatch — "notify and promote this one applicant right now, don't make them wait for the next cron run" — not a redundant duplicate of the bulk route. Not safe to naively consolidate; they serve different points in the same workflow.

### `send-single-video-decision` vs. `bulk-video-decision` — **same relationship, confirmed the same way**

Identical structure: `send-single-video-decision` emails immediately and updates the applicant's stage/verification-invite fields; `bulk-video-decision` only writes `review_status`/`approved_at`/`rejected_at` on `video_submissions`. Confirmed by reading `app/api/cron/video-outcome-batch/route.ts`, which queries the exact same fields `bulk-video-decision` sets (`review_status: "rejected"` etc., `outcome_sent_at: null`, `outcome_release_date <= today`) and sends the batch email + applicant updates from there. Same conclusion: not a duplicate, a manual override of the scheduled path.

### `force-release-date` vs. `force-release-date-by-id` — **not really a single/bulk pair at all; different safety posture**

`force-release-date` looks up a record by `email`, restricted to a hardcoded allowlist of exactly 4 `{collection, lookupField, targetField}` configs (`applicant_video_invite`, `applicant_verification_deadline`, `video_submission_outcome`, `verification_outcome`) — it can only ever touch one of those four specific fields.

`force-release-date-by-id` takes raw `{collection, id, field}` directly from the request body with **no allowlist at all** — it can write today's date into any field, on any D1 table, by row ID. It's not a "by-id variant" of the same operation so much as a strictly more general, unrestricted tool that happens to overlap in purpose. They share zero code. Worth a security-conscious note (flagging only, not fixing): `force-release-date-by-id` has no validation on `collection`/`field` at all, unlike its sibling.

---

## Per-route detail

### `list-legacy-sent`
**What it does:** `GET`, admin-session gated. Queries `video_submissions` where `imported_legacy = true`, filters to rows with `outcome_sent_at` set, returns `{count, sentTo: [{email, sent_at}]}`. Pure read, no side effects.
**Callers:** none found anywhere (`app/`, `components/`, `scripts/`, README, package.json scripts).
**Category: Likely manual/intentional tool.** Read-only, zero risk either way, and this exact shape (a GET endpoint returning a status list with no matching UI panel) matches the debug/reporting tools we already know are intentional (`engine/health-check`, `engine/cron-status`). Plausibly a "check what went out" tool an admin curls or visits directly, or a panel that was planned but never built.

### `schedule-legacy-batch`
**What it does:** `POST`, admin-gated. Accepts `{emails: string[], template, scheduledDate, stage}`. For each email: if an applicant already exists, tags them with `pending_legacy_email`/`legacy_email_scheduled_date` (same fields `staged-legacy/add` sets); if not, **creates a brand-new applicant record** pre-populated with that stage/cohort/tag. This is a genuine bulk capability `staged-legacy/add` doesn't have — `add` requires an existing applicant match and 404s otherwise.
**Callers:** none found. `StagedBatchesPanel.tsx` only ever adds one applicant at a time via `staged-legacy/add`.
**Category: Unclear — needs your input.** It has real, distinct capability (bulk creation of new legacy applicant records) not replicated anywhere else in the active UI. I can't tell from the code alone whether this was a planned bulk-CSV feature that never got a frontend, or a one-off tool used via curl for a specific past campaign (similar in shape to `bulk-import-participants`, but this one takes its list from the request body rather than a hardcoded array, which argues against "one-time script" and toward "reusable manual tool"). Genuinely ambiguous.

### `send-single-legacy`
**What it does:** `POST`, admin-gated. Looks up an applicant by email, requires `pending_legacy_email` already tagged, renders and sends that template immediately, sets `legacy_email_sent_at`.
**Callers:** none found.
**Category: Likely manual/intentional tool.** Confirmed by reading `app/api/cron/legacy-batch-send/route.ts`: that cron queries applicants with `pending_legacy_email` set, `legacy_email_scheduled_date <= today`, and `legacy_email_sent_at` null, then sends the actual batch email automatically. `send-single-legacy` is the "send this one now, don't wait for the scheduled batch" override — the third confirmed instance of the exact same pattern as the verification/video single-decision routes.

### `staged-legacy/edit`
**What it does:** `POST`, admin-gated. Takes `{applicantId, template, scheduledDate}` and updates whichever fields are provided directly by ID. Does **not** reset `legacy_email_sent_at` to null (unlike `add`, which always does).
**Callers:** none found. `StagedBatchesPanel.tsx` calls `staged-legacy/add` and `staged-legacy/remove`, never `edit`.
**Category: Likely dead.** `staged-legacy/add` already behaves as an upsert (creates the tag if absent, updates it if present, keyed by email) — so the panel achieves "edit an existing staged entry" by simply calling `add` again with the same email, making a dedicated ID-keyed `edit` endpoint redundant. This is the one route in the set with a clear, code-verifiable reason to suspect it's simply superseded, not just unwired.

### `bulk-import-participants`
**What it does:** `POST`, admin-gated. Contains a **hardcoded array of 6 real-looking email addresses and specific past dates** (`completedAt: "2026-06-22"` etc.) directly in the source file. For each, if not already an applicant, creates one already marked `current_stage: "Program Participant"` and sends a `legacy_participant_welcome` email.
**Callers:** none found.
**Category: Likely manual/intentional tool — and already used.** This is unmistakably a one-time migration script written to backfill six specific already-completed participants into the system, run once (the dates are all in the past relative to today), and left in place afterward. Its own "already exists → skip" check means re-running it today is a safe no-op for those six people, but it's not a general-purpose tool — it's frozen to that specific list. **Worth flagging separately: this embeds real people's email addresses directly in a source file**, which is a minor data-handling smell independent of the orphaned-route question (not a security vulnerability by itself, but not great practice) — noted here, not actioned.

### `bulk-import-approved`
**What it does:** `POST`, admin-gated. Same pattern as above — a **hardcoded array of 38 real-looking email addresses with specific past submission dates**, creating applicants pre-set to `"Video Pitch Approved"` plus a matching `video_submissions` row per person.
**Callers:** none found.
**Category: Likely manual/intentional tool — already used.** Same conclusion as `bulk-import-participants`: a one-time backfill script for a specific list of real people, already run (dates are all in the past, most within the last few weeks of today's date). Same embedded-PII note applies, at larger scale (38 people).

### `cancel-bulk-import`
**What it does:** `POST`, admin-gated. Finds `video_submissions` rows tagged `imported_legacy: true` with no `outcome_sent_at` yet, and deletes them.
**Callers:** none found.
**Category: Likely manual/intentional tool.** The companion "undo" to `bulk-import-approved` — exists to let whoever ran that script roll it back if the wrong list was imported, before any outcome email went out. Its very existence alongside the two hardcoded-list scripts above confirms this whole cluster was built as a matched one-time-use toolkit, not routine admin functionality.

### `promote-to-participants`
**What it does:** `POST`, admin-gated. Finds applicants tagged `pending_legacy_email: "legacy_welcome_accepted"` who already have `legacy_email_sent_at` set, and promotes them to `current_stage: "Program Participant"`.
**Callers:** none found.
**Category: Likely manual/intentional tool.** The final step of the same legacy-import workflow as the three routes above — send a "welcome, do you accept?" email (via `send-single-legacy`/`legacy-batch-send`), then run this to promote whoever's accepted. Consistent with the rest of this cluster being a deliberate, matched toolkit for a specific past onboarding campaign.

### `send-single-verification-decision`
See pair analysis above. **Category: Likely manual/intentional tool** — confirmed manual override of `verification-outcome-batch`.

### `send-verification-email`
**What it does:** `POST`, admin-gated. Generates a Firebase email-verification link (`generateEmailVerificationLinkRest`, an Identity Toolkit call) for a given email and sends it via the `admin_email_verification` template.
**Callers:** none found.
**Category: Likely manual/intentional tool.** Given the admin login flow requires `emailVerified === true` on the Firebase user (confirmed in `ARCHITECTURE.md`'s auth-flow writeup), this reads as a self-service "resend my verification link" tool for onboarding a new admin account — used rarely, only when a new admin is set up, which would explain zero UI wiring (it's not something you'd want a routine button for).

### `force-release-date`
See pair analysis above. **Category: Likely manual/intentional tool** — whitelisted, narrow-scope override.

### `force-release-date-by-id`
See pair analysis above. **Category: Unclear — needs your input.** Functionally plausible as an intentional "power user" testing tool (same family as its sibling), but its complete lack of an allowlist is different enough in risk profile from every other route in this cluster that I'd rather you confirm it's meant to be this unrestricted than assume it.

### `force-invite-age`
**What it does:** `POST`, admin-gated. Given `{email, stage, daysAgo}`, backdates an applicant's `video_invite_sent_at` or `verification_invite_sent_at` (and recomputes the matching deadline) as if the invite had gone out `daysAgo` days ago, resetting all reminder-sent flags to false.
**Callers:** none found.
**Category: Likely manual/intentional tool.** This is unambiguously a QA/testing tool — its entire purpose is to simulate "this invite was sent N days ago" so someone can manually trigger and verify the reminder-cadence cron jobs without waiting real days for them to become due. Exactly the kind of tool you'd want callable via curl during development/testing, not exposed in a staff-facing panel.

### `send-single-video-decision`
See pair analysis above. **Category: Likely manual/intentional tool** — confirmed manual override of `video-outcome-batch`.

### `send-single-video-invite`
**What it does:** `POST`, admin-gated. Looks up an applicant by email, sends the `video_invite` email immediately, sets `video_invite_sent_at`/`video_deadline_date`/`current_stage`/`awaiting_video_submission`.
**Callers:** none found.
**Category: Likely manual/intentional tool.** Same confirmed family as `send-single-legacy`/`send-single-verification-decision`/`send-single-video-decision` — the normal path is the `video-invite-batch` cron inviting everyone whose `video_invite_release_date` has arrived, in bulk, on schedule; this route is the "invite this one applicant right now" manual override.

---

## What this means, at a glance

Of the 15, **12 have a concrete, code-verified or strongly-inferred reason to exist as intentional manual tools** — mostly a consistent "cron does it in bulk on schedule; this route does it for one record right now" override pattern (confirmed for 4 of them by directly cross-referencing the corresponding cron job's query logic), plus a matched one-time migration toolkit (4 routes) that already appears to have been used. **Only `staged-legacy/edit` has a clear, verifiable reason to suspect it's simply dead** (superseded by `staged-legacy/add`'s upsert behavior). **2 remain genuinely ambiguous** (`schedule-legacy-batch`, `force-release-date-by-id`) and need your confirmation rather than my inference.

No deletions, consolidations, or other changes are proposed here — this is the findings only, per scope.
