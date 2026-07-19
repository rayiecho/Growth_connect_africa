"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, CheckboxField } from "@/components/ui/Input";
import { OtpGate } from "@/components/forms/OtpGate";

type LookupResult = {
  found: boolean;
  notYetInvited?: boolean;
  canSubmit?: boolean;
  otpRequired?: boolean;
  mode?: "new" | "resubmit";
  existingSubmissionId?: string;
  previousFeedback?: string | null;
  existingStatus?: string;
  applicant?: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
};

function GuidelinesBlock() {
  return (
    <div className="mb-8">
      <p className="text-brand-slate mb-6">
        For this stage, our focus is primarily on commitment, participation,
        and your ability to clearly communicate your business. Take note of
        the following before submitting:
      </p>
      <h3 className="font-semibold text-brand-charcoal mb-2">Video Guidelines</h3>
      <p className="text-brand-slate mb-6">
        Record a simple video using your phone or computer. 2-3 minutes is
        sufficient. No editing or professional production is required.
        Clarity and authenticity matter more than presentation quality.
      </p>
      <h3 className="font-semibold text-brand-charcoal mb-2">Review Timeline</h3>
      <p className="text-brand-slate">
        Video submissions are reviewed every{" "}
        <strong className="text-brand-charcoal">Tuesday and Friday</strong>.
        You will receive feedback after the next review cycle.
      </p>
    </div>
  );
}

export function VideoPitchForm() {
  const [email, setEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<LookupResult | null>(null);

  const [videoLink, setVideoLink] = useState("");
  const [confirmRecorded, setConfirmRecorded] = useState(false);
  const [confirmAccessible, setConfirmAccessible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runLookup() {
    setLookupLoading(true);
    setLookupError(null);
    setLookup(null);

    try {
      const res = await fetch("/api/public/video-pitch/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setLookupError(`Server error (status ${res.status}). Please try again.`);
        setLookupLoading(false);
        return;
      }

      if (!res.ok) {
        setLookupError(data.error || "Something went wrong. Please try again.");
        setLookupLoading(false);
        return;
      }

      setLookup(data);
    } catch {
      setLookupError("Network error. Please try again.");
    }
    setLookupLoading(false);
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    await runLookup();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmRecorded || !confirmAccessible) {
      setError("Please confirm both checkboxes before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/public/video-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          video_link: videoLink,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setError(`Server error (status ${res.status}). Please try again.`);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Something went wrong submitting your video. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong submitting your video. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl">
        <span className="brand-eyebrow-line" />
        <h2 className="text-2xl font-bold text-brand-charcoal mb-3">
          Thank you for submitting your Founder Assessment
        </h2>
        <p className="text-brand-slate mb-4">
          Your video has been successfully received and is now awaiting review.
        </p>
        <p className="text-brand-slate mb-4">
          Founder Assessments are reviewed every Tuesday and Friday. Once
          reviewed, successful founders will be invited to proceed to the next
          stage: Founder Verification.
        </p>
        <p className="text-brand-slate font-medium">
          You are one step closer to joining the LaunchPadX Program.
        </p>
      </div>
    );
  }

  if (!lookup) {
    return (
      <div className="max-w-xl">
        <h2 className="text-2xl font-bold text-brand-charcoal mb-1">
          Founder Assessment Video Pitch Submission Form
        </h2>
        <p className="text-sm text-brand-slate mb-6">
          Fields marked with an <span className="text-red-500">*</span> are required
        </p>
        <GuidelinesBlock />
        <form onSubmit={handleLookup}>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Find Your Application</h3>
          <p className="text-brand-slate mb-6">
            Enter the email address you used to apply. We will pull up your details automatically.
          </p>
          <Field label="Email Address" required>
            <TextInput required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {lookupError && <p className="text-sm text-red-500 mb-4">{lookupError}</p>}
          <Button type="submit" variant="formSubmit" disabled={lookupLoading || !email}>
            {lookupLoading ? "Looking up..." : "Continue"}
          </Button>
        </form>
      </div>
    );
  }

  if (lookup.notYetInvited) {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">Not Yet Available</h3>
        <p className="text-brand-slate">
          Your application has not yet been reviewed and approved to proceed to
          the video pitch stage. Decisions are released every Tuesday and
          Friday - please check back after your application has been reviewed.
        </p>
      </div>
    );
  }

  if (!lookup.found) {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">No Application Found</h3>
        <p className="text-brand-slate mb-6">
          We could not find an application matching that email. You will need to
          apply to LaunchPadX before submitting a video pitch.
        </p>
        <a href="/apply" className="inline-flex items-center justify-center font-medium text-sm rounded-md px-5 py-2 bg-brand-green text-white hover:bg-brand-green-dark transition-colors">
          Go to Application Form
        </a>
      </div>
    );
  }

  if (!lookup.canSubmit) {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">Video Already Submitted</h3>
        <p className="text-brand-slate">
          A video pitch has already been submitted for this application
          (status: {lookup.existingStatus}). If you believe this is an error,
          please contact our team.
        </p>
      </div>
    );
  }

  if (lookup.otpRequired) {
    return (
      <div className="max-w-xl">
        <OtpGate email={email.trim().toLowerCase()} onVerified={runLookup} />
      </div>
    );
  }

  const applicant = lookup.applicant!;
  return (
    <div className="max-w-xl">
      <GuidelinesBlock />
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-brand-charcoal mb-4">Your Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="First Name">
            <TextInput value={applicant.first_name} disabled />
          </Field>
          <Field label="Last Name">
            <TextInput value={applicant.last_name} disabled />
          </Field>
          <Field label="Phone">
            <TextInput value={applicant.phone} disabled />
          </Field>
          <Field label="Email Address">
            <TextInput value={applicant.email} disabled />
          </Field>
        </div>

        <Field
          label="Link to your uploaded video pitch on YouTube"
          required
          hint="Make sure to upload your video to YouTube as an Unlisted video."
        >
          <TextInput
            required
            type="url"
            placeholder="https://youtu.be/..."
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
        </Field>

        <label className="block text-sm font-semibold text-brand-charcoal mb-2">
          Confirmation Checkbox <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3 mb-6">
          <CheckboxField
            label="I confirm that I recorded this video myself and the information provided is accurate."
            checked={confirmRecorded}
            onChange={(e) => setConfirmRecorded(e.target.checked)}
          />
          <CheckboxField
            label="I understand that inaccessible videos may disqualify me."
            checked={confirmAccessible}
            onChange={(e) => setConfirmAccessible(e.target.checked)}
          />
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <Button type="submit" variant="formSubmit" disabled={submitting}>
          {submitting ? "Submitting..." : lookup.mode === "resubmit" ? "Resubmit Video Pitch" : "Submit Video Pitch"}
        </Button>
      </form>
    </div>
  );
}


