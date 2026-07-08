# Migration: Supabase → Firebase / Render

This document tracks the migration of LaunchPadX from Supabase + Vercel to Firebase (Realtime DB + Auth) + Render. Each phase ends with a verifiable checkpoint.

## Target architecture

| Layer | From | To |
|---|---|---|
| Auth | Supabase Auth | Firebase Auth (email/password) + custom claims `admin: true` |
| Database | Supabase Postgres | Firebase **Realtime Database** (denormalized) |
| Hosting | Vercel | **Render** Web Service (Next.js) |
| Cron | Vercel Cron | **Render Cron Jobs** (HTTP-curl into Next.js API routes) |
| Email | AWS SES | **AWS SES** (unchanged — pending) |
| Admin claims | `authenticated` role | Firebase custom claims |
| File uploads | Supabase Storage (`verification-uploads`) | **Pending** — flag for Phase 6 review |

## Phases

### Phase 1 — Scaffold (in progress)
**Deliverables**
- `lib/firebase/{config,client,admin,types}.ts`
- `database.rules.json` + `firebase.json` + `.firebaserc`
- `package.json` deps swapped to `firebase` + `firebase-admin`
- `.env.example` updated
- `.gitignore` updated (secrets/, etc.)
- `render.yaml` (web service + cron jobs)
- `docs/MIGRATION_TO_FIREBASE.md` (this file)

**Checkpoint:** `npm install && npm run build` succeeds.

### Phase 2 — Auth (next)
**Deliverables**
- `/admin/login` rewritten against Firebase Auth
- Session cookie middleware via `firebase-admin`
- `scripts/set-admin-claims.ts` (bootstrap script)
- `middleware.ts` to protect `/admin/*`

**Checkpoint:** Type-check + auth flow logic review.

### Phase 3 — Data layer
### Phase 4 — Forms + Admin components
### Phase 5 — Cron handlers
### Phase 6 — Data migration script (Supabase → RTDB)
### Phase 7 — Deployment runbook (this doc, expanded)
### Phase 8 — Independent review

## Cutover checklist (full version lives at end of Phase 7)

1. Pause new writes on Supabase (turn on maintenance mode)
2. Snapshot Postgres
3. Run `scripts/migrate-supabase-to-rtdb.ts --execute`
4. Verify RTDB counts match
5. Deploy RTDB rules: `npm run rules:deploy`
6. Point domain at Render
7. Smoke-test all flows against Firebase
8. Turn off Supabase

## Rollback plan

- Keep Supabase project active for 30 days post-cutover
- Render can be flipped back to Vercel in <5 min (env vars + DNS)
- Migration script is idempotent — safe to re-run
