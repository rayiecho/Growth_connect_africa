"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, CheckboxField } from "@/components/ui/Input";
import { SubmissionSuccess } from "@/components/ui/SubmissionSuccess";

export function VideoPitchForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [confirmRecorded, setConfirmRecorded] = useState(false);
  const [confirmAccessible, setConfirmAccessible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmRecorded || !confirmAccessible) {
      setError("Please confirm both checkboxes before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const res = await fetch("/api/public/video-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
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
    } catch (err) {
      setError("Something went wrong submitting your video. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SubmissionSuccess
        title="Video pitch received"
        message="Your submission has been added to our review queue. We'll follow up by email with your next steps."
      />
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
        <p className="text-sm text-brand-slate mb-2">
          Your pitch video must be between{" "}
          <strong className="text-brand-charcoal">3 to 5 minutes</strong>,
          clear and authentic. This is your opportunity to communicate the
          strength of your idea.
        </p>
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
        {submitting ? "Submitting..." : "Submit Video Pitch"}
      </Button>
    </form>
  );
}
