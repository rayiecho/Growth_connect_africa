-- Migration: Add admin response & scheduled-send fields to applicants table
-- Safe to run multiple times — uses DROP IF EXISTS for the constraint.

BEGIN;

-- 1. New columns on applicants
ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS admin_response        TEXT,
  ADD COLUMN IF NOT EXISTS email_response_status TEXT
    DEFAULT 'pending'
    CHECK (email_response_status IN ('pending', 'queued', 'sent')),
  ADD COLUMN IF NOT EXISTS scheduled_send_date   DATE;

-- 2. Index for the cron job's primary query: find all queued records due today
CREATE INDEX IF NOT EXISTS idx_applicants_response_send
  ON applicants (email_response_status, scheduled_send_date)
  WHERE email_response_status = 'queued';

-- 3. Send log key for this workflow
-- (The table may already have rows from video_invite / verification_invite.
--  This just ensures the key is documentable; no unique constraint needed.)
COMMENT ON COLUMN send_log.template_key IS
  'Values: video_invite | verification_invite | application_response';

COMMIT;
