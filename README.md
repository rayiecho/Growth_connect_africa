# LaunchPadX Frontend

Next.js (App Router) + TypeScript + Tailwind + Supabase. This is the
foundation phase from the build plan (§8, Phase 1): public forms, the core
admin dashboard, and the Supabase plumbing.

## What's actually working right now

- **`/apply`** — application form. Only the "Personal & Contact Details"
  step is wired to real fields (the only section confirmed off the live
  site so far). The other four steps are visible as placeholders — swap
  them for real fields once the Ninja Forms export comes through.
- **`/video-pitch`** — fully wired, all fields confirmed. Looks up the
  applicant by email first (this form assumes they already applied).
- **`/admin/login`** — Supabase Auth email/password sign-in.
- **`/admin/dashboard`** — pulls every applicant from Postgres, shows
  live counts, and lets a reviewer Approve/Reject with one click. This is
  the direct replacement for the spreadsheet's Master Database + Review
  Queue + Dashboard tabs.

## What's intentionally not built yet

- The Tuesday/Friday and daily automation logic (Phase 2) — that's
  `pg_cron` + Supabase Edge Functions, not frontend work, and belongs in a
  separate backend repo/folder.
- The Paystack webhook and verification workflow (Phase 3).
- Reviewer role-gating (right now any authenticated user is treated as a
  reviewer — add a `role` column and check it before this goes live).
- The `/admin/logout` route referenced in the dashboard header — wire this
  to `supabase.auth.signOut()` in a route handler.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL and anon key
npm run dev
```

You'll need these tables to exist in your Supabase project before the
forms/dashboard will work — see §2 of `LaunchPadX_Final_Build_Plan.md` for
the full schema. At minimum, for what's built so far:

```sql
create table applicants (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text, last_name text, phone text,
  age_range text, gender text, state_country text,
  linkedin text, business_social text,
  date_applied timestamptz, current_stage text, current_status text,
  last_updated timestamptz
);

create table video_submissions (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references applicants(id),
  video_link text, submitted_at timestamptz,
  review_status text default 'pending'
);
```

Remember to enable Row Level Security on both tables once you move past
local testing, and write policies scoped to authenticated reviewers for
anything the dashboard reads/writes.

## Design tokens

Pulled directly from the live growthconnect.africa site — see the comments
in `tailwind.config.ts`. Primary green `#2FA36B`, charcoal text, Poppins-
style rounded sans, pill-shaped buttons, circular icon buttons, and the
green underline mark above section headings are all intentional matches,
not defaults.
