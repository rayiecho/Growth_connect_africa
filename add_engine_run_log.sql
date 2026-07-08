-- Records every engine run that had at least one error, so failures are
-- visible in a table you can check (or later alert on), not buried in a
-- JSON response nobody's watching. Only adds a new table.

create table if not exists engine_run_log (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz default now(),
  video_invites_sent int,
  verification_invites_sent int,
  error_count int,
  errors jsonb
);

alter table engine_run_log enable row level security;

create policy "Allow authenticated read" on engine_run_log
  for select to authenticated using (true);

-- The engine itself runs with the service role key, which bypasses RLS
-- entirely, so no insert policy is needed for it to write here.
