"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Input";

function UpdateDetailsContent() {
  const searchParams = useSearchParams();
  const emailFromLink = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromLink);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessStage, setBusinessStage] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/public/additional-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          phone,
          business_name: businessName,
          business_stage: businessStage,
          industry,
          business_description: businessDescription,
          linkedin,
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
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-brand-line p-8 text-center">
          <h2 className="text-xl font-bold text-brand-charcoal mb-2">Details Received</h2>
          <p className="text-sm text-brand-slate">
            Thank you - your details have been submitted and our team will update your records shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-brand-line rounded-2xl p-8 shadow-sm">
          <span className="brand-eyebrow-line" />
          <h1 className="text-2xl font-bold text-brand-charcoal mb-2">Update Your Details</h1>
          <p className="text-sm text-brand-slate mb-6">
            Please fill in your details so we can update your LaunchPadX record correctly.
          </p>

          <form onSubmit={handleSubmit}>
            <Field label="Email Address" required>
              <TextInput required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="First Name" required>
              <TextInput required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field label="Last Name" required>
              <TextInput required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
            <Field label="Phone Number" required>
              <TextInput required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Business Name" required>
              <TextInput required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </Field>
            <Field label="Business Stage">
              <Select value={businessStage} onChange={(e) => setBusinessStage(e.target.value)}>
                <option value="">Select</option>
                <option>Just an idea</option>
                <option>Early stage business</option>
                <option>Existing business</option>
                <option>Scaling business</option>
              </Select>
            </Field>
            <Field label="Industry">
              <TextInput value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </Field>
            <Field label="Describe Your Business">
              <textarea
                rows={4}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </Field>
            <Field label="LinkedIn Profile (Optional)">
              <TextInput value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            </Field>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit My Details"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UpdateDetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-brand-slate">Loading...</div>}>
      <UpdateDetailsContent />
    </Suspense>
  );
}
