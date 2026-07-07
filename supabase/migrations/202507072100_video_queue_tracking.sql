-- Migration: Video stage queue tracking
-- Supports the Tue/Fri video invite pipeline and the 10-day
-- approved/rejected email pipelines.

BEGIN;

-- 1. Video submissions: feedback, timestamps for 10-day gap, email sent flag
ALTER TABLE video_submissions
  ADD COLUMN IF NOT EXISTS feedback              TEXT,
  ADD COLUMN IF NOT EXISTS approved_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invite_email_sent_at TIMESTAMPTZ;

-- 2. Applicants: which invite-window this app belongs to
-- 'tue' = submitted Sat/Mon → video email goes Tuesday
-- 'fri' = submitted Tue/Thu → video email goes Friday
ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS video_invite_window TEXT
    CHECK (video_invite_window IN ('tue', 'fri'));

-- 3. Indexes for the cron job's primary queries
CREATE INDEX IF NOT EXISTS idx_applicants_video_invite
  ON applicants (video_invite_window, email_response_status)
  WHERE video_invite_window IS NOT NULL
    AND email_response_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_video_approved_pending
  ON video_submissions (review_status)
  WHERE review_status = 'approved';

CREATE INDEX IF NOT EXISTS idx_video_rejected_pending
  ON video_submissions (review_status)
  WHERE review_status = 'rejected';

COMMIT;
