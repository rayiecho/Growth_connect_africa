"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, CheckboxField } from "@/components/ui/Input";

export function VideoPitchForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) {
      setError("Please confirm both checkboxes before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    // Look up the applicant by email — this form assumes they already applied.
    const { data: applicant, error: lookupError } = await supabase
      .from("applicants")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (lookupError || !applicant) {
      setSubmitting(false);
      setError(
        "We couldn't find an application matching this email. Please use the same email you applied with."
      );
      return;
    }

    const { error: insertError } = await supabase.from("video_submissions").insert({
      applicant_id: applicant.id,
      video_link: videoLink,
      submitted_at: new Date().toISOString(),
      review_status: "pending",
    });

    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong submitting your video. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl">
        <span className="brand-eyebrow-line" />
        <h2 className="text-2xl font-bold text-brand-charcoal mb-3">
          Video pitch received
        </h2>
        <p className="text-brand-slate">
          Your submission has been added to the review queue. Assessments are
          reviewed every Tuesday and Friday — you&apos;ll hear from us after
          the next review cycle.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <Field label="First Name" required>
        <TextInput required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </Field>
      <Field label="Last Name" required>
        <TextInput required value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </Field>
      <Field label="Phone" required>
        <TextInput required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="Email Address" required>
        <TextInput required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
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

      <div className="space-y-3 mb-6">
        <CheckboxField
          label="I confirm that I recorded this video myself and the information provided is accurate."
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <CheckboxField
          label="I understand that inaccessible videos may disqualify me."
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Video Pitch"}
      </Button>
    </form>
  );
}
