CREATE TABLE applicants (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  email_verified INTEGER DEFAULT 0,
  phone TEXT,
  country TEXT,
  state_province TEXT,
  business_name TEXT,
  business_category TEXT,
  business_stage TEXT,
  business_description TEXT,
  goal_question TEXT,
  commitment_question TEXT,
  commitment_confirmed INTEGER DEFAULT 0,
  disclaimers_accepted INTEGER DEFAULT 0,
  submitted_at TEXT,
  date_applied TEXT,
  current_stage TEXT,
  current_status TEXT,
  cohort TEXT,
  trial_number INTEGER DEFAULT 1,
  cleared_for_reapply INTEGER DEFAULT 0,
  trial_history TEXT,
  video_invite_release_date TEXT,
  video_invite_sent_at TEXT,
  video_deadline_date TEXT,
  video_submitted_at TEXT,
  video_reminder_2_sent INTEGER DEFAULT 0,
  video_reminder_4_sent INTEGER DEFAULT 0,
  video_reminder_deadline_sent INTEGER DEFAULT 0,
  awaiting_video_submission INTEGER DEFAULT 0,
  verification_invite_sent_at TEXT,
  verification_deadline_date TEXT,
  verification_submitted_at TEXT,
  verification_reminder_2_sent INTEGER DEFAULT 0,
  verification_reminder_4_sent INTEGER DEFAULT 0,
  verification_reminder_6_sent INTEGER DEFAULT 0,
  verification_reminder_8_sent INTEGER DEFAULT 0,
  verification_reminder_10_sent INTEGER DEFAULT 0,
  awaiting_verification_submission INTEGER DEFAULT 0,
  verified_at TEXT,
  lpx_id TEXT,
  lpx_id_generated_at TEXT,
  photo_path TEXT,
  program_completed INTEGER DEFAULT 0,
  program_completed_at TEXT,
  certificate_code TEXT,
  legacy_email_sent_at TEXT,
  pending_legacy_email TEXT,
  legacy_email_scheduled_date TEXT,
  batch_id TEXT,
  linkedin TEXT,
  business_social TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_date_applied ON applicants(date_applied);
CREATE INDEX idx_applicants_video_invite ON applicants(video_invite_sent_at, video_invite_release_date);
CREATE INDEX idx_applicants_awaiting_video ON applicants(awaiting_video_submission);
CREATE INDEX idx_applicants_awaiting_verification ON applicants(awaiting_verification_submission);

CREATE TABLE video_submissions (
  id TEXT PRIMARY KEY,
  applicant_id TEXT,
  applicant_first_name TEXT,
  applicant_last_name TEXT,
  applicant_email TEXT,
  video_link TEXT,
  review_status TEXT DEFAULT 'pending',
  feedback TEXT,
  submitted_at TEXT,
  outcome_release_date TEXT,
  outcome_sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_video_submissions_applicant ON video_submissions(applicant_id);
CREATE INDEX idx_video_submissions_status ON video_submissions(review_status, outcome_sent_at, outcome_release_date);

CREATE TABLE verifications (
  id TEXT PRIMARY KEY,
  applicant_id TEXT,
  applicant_first_name TEXT,
  applicant_last_name TEXT,
  email TEXT,
  lpx_id TEXT,
  verification_form_path TEXT,
  payment_receipt_path TEXT,
  review_status TEXT DEFAULT 'Pending',
  feedback TEXT,
  submitted_at TEXT,
  outcome_release_date TEXT,
  outcome_sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_verifications_applicant ON verifications(applicant_id);
CREATE INDEX idx_verifications_status ON verifications(review_status, outcome_sent_at, outcome_release_date);

CREATE TABLE platform_users (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  source TEXT,
  is_applicant INTEGER DEFAULT 0,
  uploaded_at TEXT,
  batch_id TEXT,
  last_followup_sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_platform_users_email ON platform_users(email);
CREATE INDEX idx_platform_users_is_applicant ON platform_users(is_applicant);

CREATE TABLE email_templates (
  id TEXT PRIMARY KEY,
  subject TEXT,
  body_html TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE email_otps (
  email TEXT PRIMARY KEY,
  code TEXT,
  expires_at TEXT,
  verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE cron_run_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cron_name TEXT,
  ran_at TEXT,
  result TEXT,
  had_errors INTEGER DEFAULT 0
);
CREATE INDEX idx_cron_run_log_name ON cron_run_log(cron_name, ran_at);

CREATE TABLE application_funnel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  event TEXT,
  step INTEGER,
  detail TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_funnel_events_session ON application_funnel_events(session_id);

CREATE TABLE call_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  note TEXT,
  outcome TEXT,
  author TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_call_notes_email ON call_notes(email);

CREATE TABLE contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT,
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sos_reports (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE chatbot_conversations (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  messages TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE email_conversations (
  id TEXT PRIMARY KEY,
  applicant_email TEXT,
  thread TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE additional_details_submissions (
  id TEXT PRIMARY KEY,
  applicant_id TEXT,
  email TEXT,
  details TEXT,
  reconciled INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE batch_links (
  release_date TEXT PRIMARY KEY,
  link TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
