"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, CheckboxField } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";

const STEPS = [
  "Personal & Contact Details",
  "Business & Idea Overview",
  "The Capital Readiness",
  "Commitment",
  "Disclaimers & Agreements",
];

const BUSINESS_STAGES = ["Just an idea", "Early stage business", "Existing business", "Scaling business"];
const INDUSTRIES = [
  "Fashion",
  "Food / Beverage",
  "Tech / Digital",
  "Agriculture",
  "Retail / Commerce",
  "Beauty & Lifestyle",
  "Education",
  "Creative / Media",
  "Health & Wellness",
  "Other (Please specify in next question)",
];
const REVENUE_OPTIONS = ["Yes, consistently", "Yes, but not stable yet", "Not yet", "I haven't started operations"];
const CHALLENGE_OPTIONS = [
  "Lack of business knowledge",
  "Product development",
  "Operations and systems",
  "Team challenges",
  "Market access",
  "Other",
];

const COMMITMENT_STATEMENTS = [
  "I understand that submitting this application does not guarantee admission into LaunchPadX or selection for funding opportunities.",
  "I understand that my application will be reviewed and only qualified applicants will proceed to the next stage.",
  "I understand that if selected, I will be required to submit a Founder Video Pitch within the specified timeline.",
  "I understand that progression into the program requires completion of the Funding Qualification Stage.",
  "I understand that founders who fail to complete required stages within the stated timelines may lose their place in the qualification process.",
  "I understand that participation in LaunchPadX requires active engagement and completion of program activities and assignments.",
  "I confirm that all information submitted in this application is accurate and truthful to the best of my knowledge.",
  "I am committed to completing the LaunchPadX qualification process and participating fully if selected to proceed.",
];

const DISCLAIMER_STATEMENTS = [
  "I confirm that all information provided is accurate.",
  "I understand the structure and expectations of this program.",
  "I understand that progression is competitive and performance-based.",
];

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  ageRange: string;
  gender: string;
  stateCountry: string;
  linkedin: string;
  businessSocial: string;

  businessName: string;
  businessStage: string;
  industry: string;
  otherIndustry: string;
  businessDescription: string;
  problemSolved: string;
  targetCustomers: string;
  businessRegistered: string;
  generatesRevenue: string;
  revenueProgress: string;
  growthPotential: string;
  longTermVision: string;

  useOfFunds: string;
  biggestChallenges: string[];
  attendLagosEvent: string;

  whyConsidered: string;
  commitmentChecks: boolean[];

  disclaimerChecks: boolean[];
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
  businessStage: "",
  industry: "",
  otherIndustry: "",
  businessDescription: "",
  problemSolved: "",
  targetCustomers: "",
  businessRegistered: "",
  generatesRevenue: "",
  revenueProgress: "",
  growthPotential: "",
  longTermVision: "",
  useOfFunds: "",
  biggestChallenges: [],
  attendLagosEvent: "",
  whyConsidered: "",
  commitmentChecks: Array(COMMITMENT_STATEMENTS.length).fill(false),
  disclaimerChecks: Array(DISCLAIMER_STATEMENTS.length).fill(false),
};

export function ApplicationForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string | boolean | string[] | boolean[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleChallenge = (option: string) => {
    setForm((prev) => ({
      ...prev,
      biggestChallenges: prev.biggestChallenges.includes(option)
        ? prev.biggestChallenges.filter((c) => c !== option)
        : [...prev.biggestChallenges, option],
    }));
  };

  const toggleCommitment = (i: number) => {
    setForm((prev) => {
      const next = [...prev.commitmentChecks];
      next[i] = !next[i];
      return { ...prev, commitmentChecks: next };
    });
  };

  const toggleDisclaimer = (i: number) => {
    setForm((prev) => {
      const next = [...prev.disclaimerChecks];
      next[i] = !next[i];
      return { ...prev, disclaimerChecks: next };
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.commitmentChecks.some((c) => !c)) {
      setError("Please confirm every Commitment Confirmation statement before submitting.");
      return;
    }
    if (form.disclaimerChecks.some((c) => !c)) {
      setError("Please confirm every Disclaimers & Agreements statement before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("applicants").insert({
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.phone,
      email: form.email.trim().toLowerCase(),
      age_range: form.ageRange,
      gender: form.gender,
      state_country: form.stateCountry,
      linkedin: form.linkedin || null,
      business_social: form.businessSocial || null,
      business_name: form.businessName,
      business_stage: form.businessStage,
      industry: form.industry,
      other_industry: form.otherIndustry || null,
      business_description: form.businessDescription,
      problem_solved: form.problemSolved,
      target_customers: form.targetCustomers,
      business_registered: form.businessRegistered,
      generates_revenue: form.generatesRevenue,
      revenue_progress: form.revenueProgress || null,
      growth_potential: form.growthPotential,
      long_term_vision: form.longTermVision,
      use_of_funds: form.useOfFunds,
      biggest_challenges: form.biggestChallenges.join(", "),
      attend_lagos_event: form.attendLagosEvent,
      why_considered: form.whyConsidered,
      commitment_confirmed: true,
      disclaimers_accepted: true,
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
          <p className="text-brand-slate mb-4">
            This section helps us identify and communicate with you properly
            throughout the LaunchPadX qualification process. Please confirm:
          </p>
          <ul className="list-disc list-inside text-brand-slate mb-4 space-y-1">
            <li>Your details are accurate</li>
            <li>Your contact information is active</li>
            <li>Your WhatsApp number is correct</li>
          </ul>
          <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
            <span aria-hidden="true">⚠️</span>
            <p className="text-sm text-brand-slate">
              <strong className="text-brand-charcoal">Important:</strong>{" "}
              Most communication and updates regarding the program will
              happen through email and community channels.
            </p>
          </div>

          <Field label="First Name" required>
            <TextInput required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </Field>
          <Field label="Last Name" required>
            <TextInput required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </Field>
          <Field label="Phone Number (WhatsApp Active)" required>
            <TextInput required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="Email" required>
            <TextInput required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Age Range" required>
            <Select required value={form.ageRange} onChange={(e) => update("ageRange", e.target.value)}>
              <option value="">Select</option>
              <option>Under 18</option>
              <option>18–24</option>
              <option>25–34</option>
              <option>35–44</option>
              <option>45+</option>
            </Select>
          </Field>
          <Field label="Gender" required>
            <Select required value={form.gender} onChange={(e) => update("gender", e.target.value)}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </Select>
          </Field>
          <Field label="State/Country" required>
            <TextInput required value={form.stateCountry} onChange={(e) => update("stateCountry", e.target.value)} />
          </Field>
          <Field label="LinkedIn Profile (Optional)">
            <TextInput value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
          </Field>
          <Field label="Business Social Media Handle (Optional)">
            <TextInput value={form.businessSocial} onChange={(e) => update("businessSocial", e.target.value)} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
            Tell Us About Your Business or Idea
          </h3>
          <p className="text-brand-slate mb-6">
            LaunchPadX is designed for entrepreneurs at different stages —
            early-stage ideas, existing businesses, growing ventures, and
            scalable startups. You do not need to have everything figured out
            yet. What matters most is clarity, potential, willingness to
            learn, and readiness to build properly.
          </p>

          <Field label="Business Name (If you don't have one, write a working name)" required>
            <TextInput required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
          </Field>

          <Field label="Which best describes your current stage?" required>
            <Select required value={form.businessStage} onChange={(e) => update("businessStage", e.target.value)}>
              <option value="">Select</option>
              {BUSINESS_STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <Field label="What industry is your business in?" required>
            <Select required value={form.industry} onChange={(e) => update("industry", e.target.value)}>
              <option value="">Select</option>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </Select>
          </Field>

          <Field label='If you chose "other" above, please specify here'>
            <TextInput value={form.otherIndustry} onChange={(e) => update("otherIndustry", e.target.value)} />
          </Field>

          <Field label="Describe your business or idea in one paragraph (What you do, how it works, and for whom)" required>
            <textarea
              required
              rows={4}
              value={form.businessDescription}
              onChange={(e) => update("businessDescription", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>

          <Field label="What problem does your business solve?" required>
            <TextInput required value={form.problemSolved} onChange={(e) => update("problemSolved", e.target.value)} />
          </Field>

          <Field label="Who is your target customer or audience?" required>
            <TextInput required value={form.targetCustomers} onChange={(e) => update("targetCustomers", e.target.value)} />
          </Field>

          <Field label="Is your business registered?" required>
            <Select required value={form.businessRegistered} onChange={(e) => update("businessRegistered", e.target.value)}>
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </Field>
          <p className="text-sm text-brand-slate -mt-4 mb-6">
            If no, kindly note that, to qualify for the funding stage of the
            program, you&apos;ll be required to register your business within
            the program structure with our business registration partner.
          </p>

          <Field label="Do you currently generate revenue from this business?" required>
            <Select required value={form.generatesRevenue} onChange={(e) => update("generatesRevenue", e.target.value)}>
              <option value="">Select</option>
              {REVENUE_OPTIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>

          <Field label="If Yes, Briefly Describe Your Revenue or Progress So Far">
            <textarea
              rows={4}
              value={form.revenueProgress}
              onChange={(e) => update("revenueProgress", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>

          <Field label="Why Do You Believe Your Business Has Growth Potential?" required>
            <textarea
              required
              rows={4}
              value={form.growthPotential}
              onChange={(e) => update("growthPotential", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>

          <Field label="What Is Your Long-Term Vision for This Business?" required>
            <textarea
              required
              rows={4}
              value={form.longTermVision}
              onChange={(e) => update("longTermVision", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
            Understanding The Capital
          </h3>
          <p className="text-brand-slate mb-6">
            The Capital is the final pitch and funding stage within the
            LaunchPadX pipeline. Participants who complete the qualification
            process may be shortlisted to pitch their business, present their
            vision, and compete for support and funding opportunities.
            Selected businesses may receive ₦1,000,000 in support (₦500,000
            cash support + ₦500,000 business growth packages). Businesses
            that demonstrate strong performance and accountability may later
            qualify for up to ₦20 million in credit financing and potential
            equity funding opportunities of up to $50,000. This stage is
            highly competitive, and progression is based on evaluation and
            qualification performance.
          </p>

          <Field label="If Selected for Funding, What Would You Use the Support For?" required>
            <textarea
              required
              rows={5}
              value={form.useOfFunds}
              onChange={(e) => update("useOfFunds", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-charcoal mb-2">
              What is your biggest challenge currently? <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-brand-slate italic mb-3">You can select more than one</p>
            <div className="space-y-2 border border-brand-line rounded-lg p-4">
              {CHALLENGE_OPTIONS.map((c) => (
                <CheckboxField
                  key={c}
                  label={c}
                  checked={form.biggestChallenges.includes(c)}
                  onChange={() => toggleChallenge(c)}
                />
              ))}
            </div>
          </div>

          <Field label="If Selected for The Capital Live Event, Would You Be Able to Attend Physically in Lagos?" required>
            <Select required value={form.attendLagosEvent} onChange={(e) => update("attendLagosEvent", e.target.value)}>
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Why We Ask This</h3>
          <p className="text-brand-slate mb-6">
            LaunchPadX is designed for founders who are serious about building
            and growing their businesses. The qualification process involves
            multiple stages, including application review, founder
            assessment, funding qualification, and participation in the
            Investment Readiness Program. By continuing, you acknowledge that
            progression through the program requires commitment, timely
            action, and active participation. Please review the statements
            below carefully before proceeding.
          </p>

          <Field label="Why Should You Be Considered for This Opportunity?" required>
            <textarea
              required
              rows={5}
              value={form.whyConsidered}
              onChange={(e) => update("whyConsidered", e.target.value)}
              className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
          </Field>

          <label className="block text-sm font-semibold text-brand-charcoal mb-2">
            Commitment Confirmation <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {COMMITMENT_STATEMENTS.map((s, i) => (
              <CheckboxField
                key={i}
                label={s}
                checked={form.commitmentChecks[i]}
                onChange={() => toggleCommitment(i)}
              />
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Important Information</h3>
          <p className="text-brand-slate mb-4">Please read carefully before submitting your application.</p>
          <p className="text-brand-slate mb-2">By applying to LaunchPadX, you understand and agree that:</p>
          <ul className="list-disc list-inside text-brand-slate mb-6 space-y-1">
            <li>LaunchPadX is a qualification and growth pipeline</li>
            <li>Application does not guarantee funding or selection</li>
            <li>Progression is based on qualification performance and evaluation</li>
            <li>Funding decisions are made through structured selection processes</li>
            <li>Growth Connect reserves the right to determine qualification and selection outcomes</li>
            <li>Participants may be required to complete verification and compliance processes at different stages</li>
            <li>Deadlines and program requirements must be adhered to</li>
          </ul>
          <p className="text-brand-slate mb-4">By proceeding, you confirm that:</p>

          <div className="space-y-3">
            {DISCLAIMER_STATEMENTS.map((s, i) => (
              <CheckboxField
                key={i}
                label={s}
                checked={form.disclaimerChecks[i]}
                onChange={() => toggleDisclaimer(i)}
              />
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      <div className="flex justify-between mt-8">
        <div>
          {step > 0 && (
            <Button type="button" variant="formNav" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
        </div>
        <div>
          {step < STEPS.length - 1 ? (
            <Button type="button" variant="formNav" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
