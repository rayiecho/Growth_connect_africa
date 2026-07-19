export type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  current_stage: string;
  current_status: string;
  date_applied: string;
  submitted_at?: string;
  industry: string | null;
  other_industry: string | null;
  business_name: string | null;
  business_stage: string | null;
  business_description: string | null;
  problem_solved: string | null;
  target_customers: string | null;
  business_registered: string | null;
  generates_revenue: string | null;
  revenue_progress: string | null;
  growth_potential: string | null;
  long_term_vision: string | null;
  use_of_funds: string | null;
  biggest_challenges: string | null;
  attend_lagos_event: string | null;
  why_considered: string | null;
  commitment_confirmed: boolean | null;
  disclaimers_accepted: boolean | null;
  state_country: string | null;
  age_range: string | null;
  gender: string | null;
  linkedin: string | null;
  business_social: string | null;
  assigned_reviewer: string | null;
  notes: string | null;
  next_action_required: string | null;
  admin_response: string | null;
  email_response_status: string | null;
  scheduled_send_date: string | null;
  video_invite_window: string | null;
  video_invite_sent_at: string | null;
  last_updated: string | null;
  lpx_id?: string | null;
  preferred_name?: string | null;
};

export type VideoSubmission = {
  id: string;
  applicant_id: string;
  video_link: string;
  submitted_at: string;
  review_status: string;
  approved_at: string | null;
  rejected_at: string | null;
  feedback: string | null;
  verification_invite_sent_at: string | null;
  training_email_sent_at: string | null;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
};

export type Verification = {
  id: string;
  applicant_id: string;
  email: string;
  lpx_id: string | null;
  invited_at: string | null;
  deadline_date: string | null;
  review_status: string;
  form_submitted: boolean;
  submitted_at: string | null;
  verification_form_path: string | null;
  payment_receipt_path: string | null;
  review_completed_at: string | null;
  applicant_first_name: string;
  applicant_last_name: string;
};

export type Template = {
  key: string;
  subject: string;
  html_body: string;
  preheader?: string;
};

export type SendLogEntry = {
  applicant_id: string;
  template_key: string;
  sent_at: string;
};

export type VerificationBatch = {
  batch_date: string;
  whatsapp_link: string;
};

export type EngineRunLog = {
  ran_at: string;
  video_invites_sent: number;
  verification_invites_sent: number;
  error_count: number;
  errors: string[];
};
