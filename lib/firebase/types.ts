/**
 * Realtime DB schema types.
 *
 * Source-of-truth for every record we store in RTDB. Every Firebase Admin
 * or Web SDK call should type-check against these so that field renames
 * surface at compile time instead of at runtime.
 *
 * Notes on the RTDB shape:
 *   - Collection paths mirror the old Postgres table names so the migration
 *     script and the app talk about the same domain language.
 *   - IDs at every collection level are preserved as the original Supabase
 *     UUIDs — keeps the data migration idempotent.
 *   - Denormalized index collections (byEmail, byApplicant) live alongside
 *     the canonical record so we can satisfy equality lookups without
 *     shipping all records to the client.
 */

export type ApplicantId = string; // UUID v4 from Supabase
export type VideoSubmissionId = string; // UUID v4
export type VerificationId = string; // UUID v4

/** Email key for `applicantsByEmail/{key}/...` lookup index.
 *  sha256 hex of lowercased, trimmed email — emails contain `@` and `.`,
 *  which are not allowed as RTDB keys. */
export type EmailLookupKey = string;

export type EmailResponseStatus = "pending" | "queued" | "sent";
export type VideoInviteWindow = "tue" | "fri";
export type VideoReviewStatus = "pending" | "approved" | "rejected";
export type VerificationReviewStatus = "Pending" | "Approved" | "Rejected";
export type ApplicantStatus = "Active" | "Rejected" | "Inactive";

export type Applicant = {
  id: ApplicantId;

  // Personal & Contact (step 1)
  firstName: string;
  lastName: string;
  phone: string;
  email: string;          // lowercased, trimmed
  ageRange: string;
  gender: string;
  stateCountry: string;
  linkedin: string | null;
  businessSocial: string | null;

  // Business & Idea (step 2)
  businessName: string;
  businessStage: string;
  industry: string;
  otherIndustry: string | null;
  businessDescription: string;
  problemSolved: string;
  targetCustomers: string;
  businessRegistered: string;
  generatesRevenue: string;
  revenueProgress: string | null;
  growthPotential: string;
  longTermVision: string;

  // Capital (step 3)
  useOfFunds: string;
  biggestChallenges: string;   // comma-separated string (matches existing schema)
  attendLagosEvent: string;

  // Commitment (step 4)
  whyConsidered: string;
  commitmentConfirmed: boolean;
  disclaimersAccepted: boolean;

  // Pipeline metadata
  dateApplied: string;        // ISO timestamp
  currentStage: string;
  currentStatus: ApplicantStatus;
  lastUpdated: string | null;

  // Admin-only fields
  assignedReviewer: string | null;
  notes: string | null;
  nextActionRequired: string | null;

  // Response scheduling (cron-driven)
  adminResponse: string | null;
  emailResponseStatus: EmailResponseStatus;
  scheduledSendDate: string | null;   // YYYY-MM-DD

  // Video invite window — derived from dateApplied on first insert
  videoInviteWindow: VideoInviteWindow | null;
};

export type VideoSubmission = {
  id: VideoSubmissionId;
  applicantId: ApplicantId;
  videoLink: string;
  submittedAt: string;           // ISO timestamp
  reviewStatus: VideoReviewStatus;
  feedback: string | null;
  approvedAt: string | null;     // ISO timestamp
  rejectedAt: string | null;
  inviteEmailSentAt: string | null;
};

export type Verification = {
  id: VerificationId;
  applicantId: ApplicantId;
  email: string;
  lpxId: string | null;
  formSubmitted: boolean;
  submittedAt: string;
  reviewStatus: VerificationReviewStatus;
  verificationFormPath: string | null;
  paymentReceiptPath: string | null;
};

export type EngineRunLog = {
  id: string;                    // RTDB push id
  ranAt: string;
  videoInvitesSent: number;
  verificationInvitesSent: number;
  errorCount: number;
  errors: Array<{ stage: string; message: string; applicantId?: string }>;
};

/** Convenience type for admin list views — what `getApplicantList` returns. */
export type ApplicantSummary = Pick<
  Applicant,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "currentStage"
  | "currentStatus"
  | "dateApplied"
  | "industry"
  | "businessName"
  | "businessStage"
  | "adminResponse"
  | "emailResponseStatus"
  | "scheduledSendDate"
  | "videoInviteWindow"
  | "assignedReviewer"
>;
