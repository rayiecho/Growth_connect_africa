"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, CheckboxField } from "@/components/ui/Input";
import { OtpGate } from "@/components/forms/OtpGate";

const VERIFICATION_FORM_URL =
  "https://drive.google.com/file/d/1Tv0KHAbU8CHPXcY98UofbaRJjEKfm4Zc/view?usp=sharing";

type Step = "check" | "no-app" | "no-id" | "not-yet-invited" | "already-submitted" | "form";

type ApplicantInfo = {
  first_name: string;
  last_name: string;
  email: string;
  lpx_id: string | null;
};

export function VerificationForm() {
  const [step, setStep] = useState<Step>("check");

  const [checkEmail, setCheckEmail] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [formEmail, setFormEmail] = useState("");
  const [formLookupLoading, setFormLookupLoading] = useState(false);
  const [formLookupError, setFormLookupError] = useState<string | null>(null);
  const [applicant, setApplicant] = useState<ApplicantInfo | null>(null);
  const [previousFeedback, setPreviousFeedback] = useState<string | null>(null);
  const [needsOtp, setNeedsOtp] = useState(false);

  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<"yes" | "no" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runLookup(email: string) {
    const res = await fetch("/api/public/verification/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server error (status ${res.status}).`);
    }
    if (!res.ok) throw new Error(data.error || "Lookup failed.");
    return data;
  }

  async function handleCheckStatus(e: React.FormEvent) {
    e.preventDefault();
    setCheckLoading(true);
    setCheckError(null);
    try {
      const data = await runLookup(checkEmail);
      if (!data.found) {
        setStep("no-app");
      } else if (!data.hasId) {
        setStep("no-id");
      } else if (data.notYetInvited) {
        setStep("not-yet-invited");
      } else if (data.alreadySubmitted) {
        setStep("already-submitted");
      } else {
        if (data.canResubmit) setPreviousFeedback(data.previousFeedback ?? null);
        setFormEmail(checkEmail);
        setStep("form");
      }
    } catch (err: any) {
      setCheckError(err.message || "Something went wrong. Please try again.");
    }
    setCheckLoading(false);
  }

  async function runFormLookup() {
    setFormLookupLoading(true);
    setFormLookupError(null);
    setNeedsOtp(false);
    try {
      const data = await runLookup(formEmail);
      if (!data.found) {
        setFormLookupError("No application found for this email.");
        setFormLookupLoading(false);
        return;
      }
      if (!data.hasId) {
        setFormLookupError("This email has no LaunchPadX ID yet. Please generate one first.");
        setFormLookupLoading(false);
        return;
      }
      if (data.notYetInvited) {
        setFormLookupError("You have not yet received your verification invitation email.");
        setFormLookupLoading(false);
        return;
      }
      if (data.alreadySubmitted) {
        setFormLookupError("A verification has already been submitted for this email.");
        setFormLookupLoading(false);
        return;
      }
      if (data.otpRequired) {
        setNeedsOtp(true);
        setFormLookupLoading(false);
        return;
      }
      if (data.canResubmit) setPreviousFeedback(data.previousFeedback ?? null);
      setApplicant(data.applicant);
    } catch (err: any) {
      setFormLookupError(err.message || "Something went wrong. Please try again.");
    }
    setFormLookupLoading(false);
  }

  async function handleFormLookup(e: React.FormEvent) {
    e.preventDefault();
    await runFormLookup();
  }

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
    if (paymentConfirmed !== "yes") {
      setError("You must confirm you have completed the verification payment to submit.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const normalizedEmail = formEmail.trim().toLowerCase();
      const folder = `${normalizedEmail}-${Date.now()}`;

      const verification_form_path = await uploadFile(verificationFile, folder, "verification-form");
      const payment_receipt_path = await uploadFile(receiptFile, folder, "payment-receipt");

      const res = await fetch("/api/public/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          verification_form_path,
          payment_receipt_path,
          payment_confirmed: true,
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

  if (step === "check") {
    return (
      <form onSubmit={handleCheckStatus} className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Check Your Status</h3>
        <p className="text-brand-slate mb-6">
          Enter your email to check whether you already have a LaunchPadX ID before proceeding to verification.
        </p>
        <Field label="Email Address" required>
          <TextInput required type="email" value={checkEmail} onChange={(e) => setCheckEmail(e.target.value)} />
        </Field>
        {checkError && <p className="text-sm text-red-500 mb-4">{checkError}</p>}
        <Button type="submit" variant="formSubmit" disabled={checkLoading || !checkEmail}>
          {checkLoading ? "Checking..." : "Check My Status"}
        </Button>
      </form>
    );
  }

  if (step === "no-app") {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">No Application Found</h3>
        <p className="text-brand-slate mb-6">
          We couldn't find an application matching that email. Please apply to LaunchPadX first.
        </p>
        <a href="/apply" className="inline-flex items-center justify-center font-medium text-sm rounded-md px-5 py-2 bg-brand-green text-white hover:bg-brand-green-dark transition-colors">
          Go to Application Form
        </a>
      </div>
    );
  }

  if (step === "no-id") {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">You Need Your LaunchPadX ID First</h3>
        <p className="text-brand-slate mb-6">
          You haven't generated a LaunchPadX ID yet. Please create one before proceeding to verification.
        </p>
        <a href="/id" className="inline-flex items-center justify-center font-medium text-sm rounded-md px-5 py-2 bg-brand-green text-white hover:bg-brand-green-dark transition-colors">
          Get Your LaunchPadX ID
        </a>
      </div>
    );
  }

  if (step === "not-yet-invited") {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">Not Yet Available</h3>
        <p className="text-brand-slate">
          You have not yet received your invitation to the Founder Verification
          stage. This is sent once your video pitch has been approved. Please
          check back after your video pitch decision has been released.
        </p>
      </div>
    );
  }

  if (step === "already-submitted") {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-3">Verification Already Submitted</h3>
        <p className="text-brand-slate">
          A verification has already been submitted for this email. If you believe this is an error, please contact our team.
        </p>
      </div>
    );
  }

  // step === "form"
  if (needsOtp) {
    return (
      <div className="max-w-xl">
        <OtpGate email={formEmail.trim().toLowerCase()} onVerified={runFormLookup} />
      </div>
    );
  }
  if (!applicant) {
    return (
      <form onSubmit={handleFormLookup} className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Confirm Your Email</h3>
        <p className="text-brand-slate mb-6">
          Please re-enter your email to load your details for verification.
        </p>
        <Field label="Email Address" required>
          <TextInput required type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
        </Field>
        {formLookupError && <p className="text-sm text-red-500 mb-4">{formLookupError}</p>}
        <Button type="submit" variant="formSubmit" disabled={formLookupLoading || !formEmail}>
          {formLookupLoading ? "Loading..." : "Continue"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      {previousFeedback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-brand-charcoal font-semibold mb-1">Action Required - Previous Feedback</p>
          <p className="text-sm text-brand-slate">{previousFeedback}</p>
        </div>
      )}

      <h3 className="text-lg font-semibold text-brand-charcoal mb-4">Your Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field label="First Name">
          <TextInput value={applicant.first_name} disabled />
        </Field>
        <Field label="Last Name">
          <TextInput value={applicant.last_name} disabled />
        </Field>
        <Field label="Email Address">
          <TextInput value={applicant.email} disabled />
        </Field>
        <Field label="LaunchPadX ID">
          <TextInput value={applicant.lpx_id ?? ""} disabled />
        </Field>
      </div>

      <Field
        label="Upload Verification Form (PDF)"
        required
        hint={
          <span>
            Download verification form{" "}
            <a href={VERIFICATION_FORM_URL} target="_blank" rel="noopener noreferrer" className="text-brand-green font-medium hover:underline">here</a>
          </span>
        }
      >
        <input
          type="file"
          accept="application/pdf"
          required
          onChange={(e) => setVerificationFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-pill file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-white file:font-medium hover:file:bg-brand-green-dark"
        />
      </Field>

      <Field label="Upload Payment Receipt" required hint="Upload the Paystack receipt sent to your email">
        <input
          type="file"
          required
          onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-pill file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-white file:font-medium hover:file:bg-brand-green-dark"
        />
      </Field>

      <div className="mb-6">
        <label className="block font-semibold text-brand-charcoal mb-2">
          Have you completed your verification payment? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-brand-slate">
            <input type="radio" name="paymentConfirmed" checked={paymentConfirmed === "yes"} onChange={() => setPaymentConfirmed("yes")} />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-slate">
            <input type="radio" name="paymentConfirmed" checked={paymentConfirmed === "no"} onChange={() => setPaymentConfirmed("no")} />
            No
          </label>
        </div>
        {paymentConfirmed === "no" && (
          <p className="text-sm text-red-500 mt-2">
            You must complete your verification payment before submitting.
          </p>
        )}
      </div>

      <div className="mb-6">
        <CheckboxField
          label="I confirm that the information provided is accurate."
          checked={confirmAccurate}
          onChange={(e) => setConfirmAccurate(e.target.checked)}
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <Button type="submit" variant="formSubmit" disabled={submitting || paymentConfirmed !== "yes"}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}


