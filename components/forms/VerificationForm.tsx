"use client";

import { useState } from "react";
import { clientStorage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const folder = `${normalizedEmail}-${Date.now()}`;

      const verificationRef = ref(
        clientStorage,
        `verification-uploads/${folder}/verification-form-${verificationFile.name}`
      );
      await uploadBytes(verificationRef, verificationFile);
      const verification_form_path = await getDownloadURL(verificationRef);

      const receiptRef = ref(
        clientStorage,
        `verification-uploads/${folder}/payment-receipt-${receiptFile.name}`
      );
      await uploadBytes(receiptRef, receiptFile);
      const payment_receipt_path = await getDownloadURL(receiptRef);

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

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong submitting your verification. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong uploading your files. Please try again.");
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

      <Button type="submit" variant="formSubmit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}