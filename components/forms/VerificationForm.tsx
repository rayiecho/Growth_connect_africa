"use client";

import { SubmissionSuccess } from "@/components/ui/SubmissionSuccess";
import { useState } from "react";
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

  async function uploadFile(
    file: File,
    folder: string,
    type: "verification-form" | "payment-receipt"
  ): Promise<string> {
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("type", type);
    formData.append("file", file);
    const res = await fetch("/api/public/verification/upload", {
      method: "POST",
      body: formData,
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      throw new Error(`Upload failed (server error ${res.status})`);
    }
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.key as string;
  }

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

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const folder = `${normalizedEmail}-${Date.now()}`;

      const verification_form_path = await uploadFile(verificationFile, folder, "verification-form");
      const payment_receipt_path = await uploadFile(receiptFile, folder, "payment-receipt");

      const res = await fetch("/api/public/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          lpx_id: lpxId.trim() || null,
          verification_form_path,
          payment_receipt_path,
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
        setError(data.error || "Something went wrong submitting your verification. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong uploading your files. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        <TextInput required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Field label="LaunchPadX ID">
        <TextInput value={lpxId} onChange={(e) => setLpxId(e.target.value)} />
      </Field>

      <Field
        label="Upload Verification Form (PDF)"
        required
      >
        <input
          type="file"
          accept="application/pdf"
          required
          onChange={(e) => setVerificationFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-pill file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-white file:font-medium hover:file:bg-brand-green-dark"
        />
        <p className="text-xs text-brand-slate mt-2 flex items-center gap-2">
          Download verification form{' '}
          <a 
            href="https://drive.google.com/file/d/1Tv0KHAbU8CHPXcY98UofbaRJjEKfm4Zc/view?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green-dark hover:bg-brand-green hover:text-white transition-colors rounded-pill px-3 py-1 text-xs font-semibold"
          >
            Download Form
          </a>
        </p>
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

      <Button type="submit" variant="formSubmit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}






