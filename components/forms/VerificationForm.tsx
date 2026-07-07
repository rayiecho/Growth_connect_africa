"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, CheckboxField } from "@/components/ui/Input";

export function VerificationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [lpxId, setLpxId] = useState("");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!verificationFile || !receiptFile) {
      setError("Please upload both the verification form PDF and your payment receipt.");
      return;
    }
    if (!confirmAccurate) {
      setError("Please confirm the checkbox before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

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

    // Upload both files to Storage, under a folder named for this applicant.
    const folder = applicant.id;
    const verificationPath = `${folder}/verification-form-${Date.now()}-${verificationFile.name}`;
    const receiptPath = `${folder}/payment-receipt-${Date.now()}-${receiptFile.name}`;

    const { error: uploadError1 } = await supabase.storage
      .from("verification-uploads")
      .upload(verificationPath, verificationFile);

    const { error: uploadError2 } = await supabase.storage
      .from("verification-uploads")
      .upload(receiptPath, receiptFile);

    if (uploadError1 || uploadError2) {
      setSubmitting(false);
      setError("Something went wrong uploading your files. Please try again.");
      return;
    }

    const { error: insertError } = await supabase.from("verifications").insert({
      applicant_id: applicant.id,
      email: normalizedEmail,
      lpx_id: lpxId.trim() || null,
      form_submitted: true,
      submitted_at: new Date().toISOString(),
      review_status: "Pending",
      verification_form_path: verificationPath,
      payment_receipt_path: receiptPath,
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
      <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Before You Submit</h3>
      <p className="text-brand-slate mb-2">Please ensure that:</p>
      <ul className="list-disc list-inside text-brand-slate mb-8 space-y-1">
        <li>You have obtained your LaunchPadX ID</li>
        <li>You have completed your verification payment</li>
        <li>You have filled the Founder &amp; Business Verification Form accurately</li>
        <li>Your completed form has been saved as a PDF</li>
      </ul>

      <Field label="Full Name" required>
        <TextInput required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Field>

      <Field label="Email Address" required>
        <TextInput
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="LaunchPadX ID">
        <TextInput value={lpxId} onChange={(e) => setLpxId(e.target.value)} />
      </Field>

      <Field
        label="Upload Verification Form (PDF)"
        required
        hint="Download verification form here"
      >
        <input
          type="file"
          accept="application/pdf"
          required
          onChange={(e) => setVerificationFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-pill file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-white file:font-medium hover:file:bg-brand-green-dark"
        />
      </Field>

      <Field
        label="Upload Payment Receipt"
        required
        hint="Upload the Paystack receipt sent to your email"
      >
        <input
          type="file"
          required
          onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-pill file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-white file:font-medium hover:file:bg-brand-green-dark"
        />
      </Field>

      <div className="mb-6">
        <CheckboxField
          label="I confirm that the information provided is accurate and that I have completed the required verification payment."
          checked={confirmAccurate}
          onChange={(e) => setConfirmAccurate(e.target.checked)}
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}