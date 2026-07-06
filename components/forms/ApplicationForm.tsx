"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, CheckboxField } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";

// NOTE: only "Personal & Contact Details" fields are confirmed from the live
// site. The other four steps are placeholders — swap in the real fields
// once §0 of the build plan is closed (Ninja Forms export from Tunji).
const STEPS = [
  "Personal & Contact Details",
  "Business & Idea Overview",
  "The Capital Readiness",
  "Commitment",
  "Disclaimers & Agreements",
];

type FormState = {
  // Section 1 — confirmed live fields
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  ageRange: string;
  gender: string;
  stateCountry: string;
  linkedin: string;
  businessSocial: string;

  // Section 2 — Business & Idea Overview (drafted pending Tunji's confirmation)
  businessName: string;
  industry: string;
  businessStage: string;
  businessDescription: string;
  problemSolved: string;
  targetCustomers: string;
  monthlyRevenue: string;
  useOfFunds: string;

  // Section 3 — The Capital Readiness (drafted pending Tunji's confirmation)
  seekingFunding: string;
  fundingAmount: string;
  businessRegistered: string;
  registrationNumber: string;
  existingInvestors: string;

  // Section 4 — Commitment (drafted pending Tunji's confirmation)
  hoursPerWeek: string;
  availableForSessions: string;

  // Section 5 — Disclaimers & Agreements (drafted pending Tunji's confirmation)
  confirmAccurate: boolean;
  confirmNoGuarantee: boolean;
  consentDataUse: boolean;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  ageRange: "",
  gender: "",
  stateCountry: "",
  linkedin: "",
  businessSocial: "",
  businessName: "",
  industry: "",
  businessStage: "",
  businessDescription: "",
  problemSolved: "",
  targetCustomers: "",
  monthlyRevenue: "",
  useOfFunds: "",
  seekingFunding: "",
  fundingAmount: "",
  businessRegistered: "",
  registrationNumber: "",
  existingInvestors: "",
  hoursPerWeek: "",
  availableForSessions: "",
  confirmAccurate: false,
  confirmNoGuarantee: false,
  consentDataUse: false,
};

export function ApplicationForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.confirmAccurate || !form.confirmNoGuarantee || !form.consentDataUse) {
      setError("Please confirm all three disclaimer checkboxes before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("applicants").insert({
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      email: form.email.trim().toLowerCase(), // normalize — the whole system joins on this
      age_range: form.ageRange,
      gender: form.gender,
      state_country: form.stateCountry,
      linkedin: form.linkedin || null,
      business_social: form.businessSocial || null,
      // NOTE: these columns need adding to the applicants table — see the
      // ALTER TABLE statement noted in the README update accompanying this file.
      business_name: form.businessName,
      industry: form.industry,
      business_stage: form.businessStage,
      business_description: form.businessDescription,
      problem_solved: form.problemSolved,
      target_customers: form.targetCustomers,
      monthly_revenue: form.monthlyRevenue || null,
      use_of_funds: form.useOfFunds,
      seeking_funding: form.seekingFunding,
      funding_amount: form.fundingAmount || null,
      business_registered: form.businessRegistered,
      registration_number: form.registrationNumber || null,
      existing_investors: form.existingInvestors || null,
      hours_per_week: form.hoursPerWeek,
      available_for_sessions: form.availableForSessions,
      date_applied: new Date().toISOString(),
      current_stage: "Application Submitted",
      current_status: "Active",
    });

    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong submitting your application. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl">
        <span className="brand-eyebrow-line" />
        <h2 className="text-2xl font-bold text-brand-charcoal mb-3">
          Idea submitted successfully
        </h2>
        <p className="text-brand-slate">
          Your application has been received. Our review team assesses
          applications every Tuesday and Friday — we&apos;ll be in touch by
          email if you&apos;re selected for the next stage.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Tabs steps={STEPS} activeIndex={step} onStepClick={setStep} />

      {step === 0 && (
        <div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
            Tell Us About Yourself
          </h3>
          <p className="text-brand-slate mb-6">
            This section helps us identify and communicate with you properly
            throughout the LaunchPadX qualification process.
          </p>

          <Field label="First Name" required>
            <TextInput
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </Field>

          <Field label="Last Name" required>
            <TextInput
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </Field>

          <Field label="Phone Number (WhatsApp Active)" required>
            <TextInput
              required
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>

          <Field label="Email" required>
            <TextInput
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>

          <Field label="Age Range" required>
            <Select
              required
              value={form.ageRange}
              onChange={(e) => update("ageRange", e.target.value)}
            >
              <option value="">Select</option>
              <option>Under 18</option>
              <option>18–24</option>
              <option>25–34</option>
              <option>35–44</option>
              <option>45+</option>
            </Select>
          </Field>

          <Field label="Gender" required>
            <Select
              required
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </Select>
          </Field>

          <Field label="State/Country" required>
            <TextInput
              required
              value={form.stateCountry}
              onChange={(e) => update("stateCountry", e.target.value)}
            />
          </Field>

          <Field label="LinkedIn Profile (Optional)">
            <TextInput
              value={form.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
            />
          </Field>

          <Field label="Business Social Media Handle (Optional)">
            <TextInput
              value={form.businessSocial}
              onChange={(e) => update("businessSocial", e.target.value)}
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="text-sm text-brand-slate italic mb-6">
            Draft fields — pending Tunji&apos;s confirmation against the live
            Ninja Forms export. Functional now so the form is testable end to
            end; adjust once confirmed.
          </p>

          <Field label="Business Name" required>
            <TextInput
              required
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
            />
          </Field>

          <Field label="Industry" required>
            <TextInput
              required
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
            />
          </Field>

          <Field label="Business Stage" required>
            <Select
              required
              value={form.businessStage}
              onChange={(e) => update("businessStage", e.target.value)}
            >
              <option value="">Select</option>
              <option>Idea stage</option>
              <option>MVP / Prototype</option>
              <option>Registered, pre-revenue</option>
              <option>Revenue-generating</option>
            </Select>
          </Field>

          <Field label="Briefly describe your business or idea" required>
            <textarea
              required
              rows={4}
              value={form.businessDescription}
              onChange={(e) => update("businessDescription", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>

          <Field label="What problem are you solving?" required>
            <textarea
              required
              rows={3}
              value={form.problemSolved}
              onChange={(e) => update("problemSolved", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>

          <Field label="Who are your target customers?" required>
            <TextInput
              required
              value={form.targetCustomers}
              onChange={(e) => update("targetCustomers", e.target.value)}
            />
          </Field>

          <Field label="Current monthly revenue (if any)">
            <TextInput
              value={form.monthlyRevenue}
              onChange={(e) => update("monthlyRevenue", e.target.value)}
            />
          </Field>

          <Field
            label="If selected, how would you use the funding/support?"
            required
            hint="This matches the program's 'Submit Your Idea and Use of Funds' framing."
          >
            <textarea
              required
              rows={3}
              value={form.useOfFunds}
              onChange={(e) => update("useOfFunds", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm text-brand-slate italic mb-6">
            Draft fields — pending Tunji&apos;s confirmation.
          </p>

          <Field label="Are you currently seeking funding?" required>
            <Select
              required
              value={form.seekingFunding}
              onChange={(e) => update("seekingFunding", e.target.value)}
            >
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </Field>

          <Field label="How much funding are you seeking?">
            <TextInput
              value={form.fundingAmount}
              onChange={(e) => update("fundingAmount", e.target.value)}
            />
          </Field>

          <Field label="Is your business formally registered?" required>
            <Select
              required
              value={form.businessRegistered}
              onChange={(e) => update("businessRegistered", e.target.value)}
            >
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
              <option>In progress</option>
            </Select>
          </Field>

          <Field label="Business registration number (if applicable)">
            <TextInput
              value={form.registrationNumber}
              onChange={(e) => update("registrationNumber", e.target.value)}
            />
          </Field>

          <Field label="Do you have existing investors or partners?">
            <TextInput
              value={form.existingInvestors}
              onChange={(e) => update("existingInvestors", e.target.value)}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-sm text-brand-slate italic mb-6">
            Draft fields — pending Tunji&apos;s confirmation.
          </p>

          <Field label="How many hours per week can you commit to this program?" required>
            <Select
              required
              value={form.hoursPerWeek}
              onChange={(e) => update("hoursPerWeek", e.target.value)}
            >
              <option value="">Select</option>
              <option>Under 5 hours</option>
              <option>5–10 hours</option>
              <option>10–20 hours</option>
              <option>20+ hours</option>
            </Select>
          </Field>

          <Field label="Are you available for scheduled review sessions and program dates?" required>
            <Select
              required
              value={form.availableForSessions}
              onChange={(e) => update("availableForSessions", e.target.value)}
            >
              <option value="">Select</option>
              <option>Yes, fully available</option>
              <option>Mostly, with some conflicts</option>
              <option>Unsure</option>
            </Select>
          </Field>
        </div>
      )}

      {step === 4 && (
        <div>
          <p className="text-sm text-brand-slate italic mb-6">
            Draft fields — pending Tunji&apos;s confirmation, particularly the
            data-consent wording (should be reviewed against actual NDPR
            practice, not just this placeholder).
          </p>

          <div className="space-y-4">
            <CheckboxField
              label="I confirm that all information provided in this application is accurate to the best of my knowledge."
              checked={form.confirmAccurate}
              onChange={(e) => update("confirmAccurate", e.target.checked)}
            />
            <CheckboxField
              label="I understand that submitting this application does not automatically guarantee funding or selection."
              checked={form.confirmNoGuarantee}
              onChange={(e) => update("confirmNoGuarantee", e.target.checked)}
            />
            <CheckboxField
              label="I consent to GrowthConnect storing and processing my information for the purposes of this program."
              checked={form.consentDataUse}
              onChange={(e) => update("consentDataUse", e.target.checked)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        )}
      </div>
    </form>
  );
}
