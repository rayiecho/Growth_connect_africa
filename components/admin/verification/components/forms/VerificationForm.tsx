"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, CheckboxField } from "@/components/ui/Input";

export function VerificationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [lpxId, setLpxId] = useState("");
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!confirmAccurate) {
      setError("Please confirm the accuracy checkbox before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    // Look up the applicant by email — same pattern as the video-pitch form.
    const { data: applicant, error: lookupError } = await supabase
      .from("applicants")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError || !applicant) {
      setSubmitting(false);
      setError(
        "We couldn't find an application matching that email. Please check it matches your original application, or contact support."
      );
      return;
    }

    const { error: insertError } = await supabase.from("verifications").insert({
      applicant_id: applicant.id,
      email: normalizedEmail,
      lpx_id: lpxId.trim(),
      form_submitted: true,
      submitted_at: new Date().toISOString(),
      review_status: "Pending",
    });

    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong submitting your verification. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl">
        <span className="brand-eyebrow-line" />
        <h2 className="text-2xl font-bold text-brand-charcoal mb-3">
          Verification submitted successfully
        </h2>
        <p className="text-brand-slate">
          Your verification has been received. Our team reviews submissions
          within 7 working days, and you&apos;ll receive an email once your
          review is complete.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <Field label="Full Name" required>
        <TextInput required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Field>

      <Field label="Email" required>
        <TextInput
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="LaunchPadX ID" required>
        <TextInput required value={lpxId} onChange={(e) => setLpxId(e.target.value)} />
      </Field>

      <div className="rounded-lg border border-dashed border-brand-line p-6 text-center text-brand-slate mb-6">
        <p className="font-medium text-brand-charcoal mb-1">File uploads coming soon</p>
        <p className="text-sm">
          Verification form PDF and payment receipt upload will be added once
          Supabase Storage is wired in. For now, submitting this form records
          your LaunchPadX ID and marks your verification as received.
        </p>
      </div>

      <CheckboxField
        label="I confirm that all information provided is accurate to the best of my knowledge."
        checked={confirmAccurate}
        onChange={(e) => setConfirmAccurate(e.target.checked)}
      />

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      <div className="mt-8">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Verification"}
        </Button>
      </div>
    </form>
  );
}