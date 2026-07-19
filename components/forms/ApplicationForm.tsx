"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, CheckboxField } from "@/components/ui/Input";
import { COUNTRY_CODES } from "@/lib/data/countryCodes";

const BUSINESS_CATEGORIES = [
  "Agriculture", "Technology", "Fashion", "Education", "Manufacturing",
  "Food & Beverage", "Health", "Retail", "Creative", "Logistics",
  "Professional Services", "Other",
];

const BUSINESS_STAGES = ["Idea Stage", "Early Stage", "Operating Business", "Growing Business"];

const COMMITMENT_STATEMENTS = [
  "I understand that submitting this application does not guarantee admission into LaunchPadX or progression to future stages.",
  "I understand that LaunchPadX is a structured multi-stage founder development program requiring active participation and timely completion of each stage.",
  "I understand that only participants who successfully complete each stage become eligible to participate in The Capital and future founder support opportunities.",
  "I confirm that all information provided in this application is accurate and truthful.",
];

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneDial: string;
  phoneNumber: string;
  country: string;
  stateProvince: string;

  businessName: string;
  businessCategory: string;
  businessStage: string;
  businessDescription: string;

  goalQuestion: string;
  commitmentQuestion: string;
  commitmentChecks: boolean[];
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneDial: "+234",
  phoneNumber: "",
  country: "",
  stateProvince: "",
  businessName: "",
  businessCategory: "",
  businessStage: "",
  businessDescription: "",
  goalQuestion: "",
  commitmentQuestion: "",
  commitmentChecks: Array(COMMITMENT_STATEMENTS.length).fill(false),
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhoneNumber(number: string): boolean {
  return number.length >= 6 && number.length <= 12;
}

export function ApplicationForm() {
  const formContainerRef = useRef<HTMLFormElement>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  function logFunnelEvent(event: string, detail?: string) {
    try {
      fetch("/api/public/funnel-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, event, step: 0, detail: detail ?? null }),
      }).catch(() => {});
    } catch {
      // logging must never break the actual form
    }
  }

  useEffect(() => {
    logFunnelEvent("page_view");
    function handleLeave() {
      const payload = JSON.stringify({ sessionId, event: "left_page", step: 0, detail: null });
      navigator.sendBeacon?.("/api/public/funnel-event", new Blob([payload], { type: "application/json" }));
    }
    window.addEventListener("pagehide", handleLeave);
    return () => window.removeEventListener("pagehide", handleLeave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState<FormState>(initialState);
  const [customDial, setCustomDial] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string | boolean | boolean[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const effectiveDial = form.phoneDial === "OTHER" ? customDial : form.phoneDial;

  function handlePhoneNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = e.target.value.replace(/[^\d]/g, "");
    update("phoneNumber", cleaned);
    if (phoneError) setPhoneError(null);
  }

  function handleCustomDialChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = e.target.value.replace(/[^\d+]/g, "");
    setCustomDial(cleaned);
    if (phoneError) setPhoneError(null);
  }

  function handlePhoneBlur() {
    if (form.phoneDial === "OTHER" && !customDial) {
      setPhoneError("Please enter your country's calling code.");
      return;
    }
    if (form.phoneNumber && !isValidPhoneNumber(form.phoneNumber)) {
      setPhoneError(`Invalid phone number. Example: ${effectiveDial || "+234"}791887609`);
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    update("email", e.target.value);
    if (emailError) setEmailError(null);
  }

  function handleEmailBlur() {
    if (form.email && !isValidEmail(form.email)) {
      setEmailError("Invalid email address.");
    }
  }

  async function handleSendOtp() {
    if (!isValidEmail(form.email)) return;
    setOtpSending(true);
    setOtpError(null);
    setOtpMessage(null);
    try {
      const res = await fetch("/api/public/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setOtpError(`Server error (status ${res.status}). Please try again.`);
        setOtpSending(false);
        return;
      }
      if (!res.ok) {
        setOtpError(data.error || "Failed to send verification code.");
        setOtpSending(false);
        return;
      }
      setOtpSent(true);
      setOtpMessage("A verification code has been sent to your email.");
    } catch {
      setOtpError("Network error sending code. Please try again.");
    }
    setOtpSending(false);
  }

  async function handleVerifyOtp() {
    if (!otpCode.trim()) {
      setOtpError("Please enter the code sent to your email.");
      return;
    }
    setOtpVerifying(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/public/verify-application-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), code: otpCode.trim() }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setOtpError(`Server error (status ${res.status}). Please try again.`);
        setOtpVerifying(false);
        return;
      }
      if (!res.ok) {
        setOtpError(data.error || "Incorrect or expired code.");
        setOtpVerifying(false);
        return;
      }
      setEmailVerified(true);
      setOtpMessage("Email verified successfully.");
      logFunnelEvent("otp_verify_success");
    } catch {
      setOtpError("Network error verifying code. Please try again.");
    }
    setOtpVerifying(false);
  }

  const toggleCommitment = (i: number) => {
    setForm((prev) => {
      const next = [...prev.commitmentChecks];
      next[i] = !next[i];
      return { ...prev, commitmentChecks: next };
    });
  };

  function validateAllFields(): boolean {
    if (!formContainerRef.current) return true;
    const fields = formContainerRef.current.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]");
    for (const el of Array.from(fields)) {
      if (!el.checkValidity()) {
        el.reportValidity();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.phoneDial === "OTHER" && !customDial) {
      setPhoneError("Please enter your country's calling code.");
      return;
    }
    if (!isValidPhoneNumber(form.phoneNumber)) {
      setPhoneError(`Invalid phone number. Example: ${effectiveDial || "+234"}791887609`);
      return;
    }
    if (!isValidEmail(form.email)) {
      setEmailError("Invalid email address.");
      return;
    }

    if (!validateAllFields()) {
      logFunnelEvent("validation_blocked");
      return;
    }

    if (form.commitmentChecks.some((c) => !c)) {
      setError("Please confirm every statement below before submitting.");
      logFunnelEvent("submit_blocked", "commitment_checks_incomplete");
      return;
    }

    logFunnelEvent("submit_attempt");
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/public/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email.trim().toLowerCase(),
        phone: `${effectiveDial}${form.phoneNumber}`,
        country: form.country,
        state_province: form.stateProvince,
        business_name: form.businessName,
        business_category: form.businessCategory,
        business_stage: form.businessStage,
        business_description: form.businessDescription,
        goal_question: form.goalQuestion,
        commitment_question: form.commitmentQuestion,
        commitment_confirmed: true,
      }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      setSubmitting(false);
      setError(`Server error (status ${res.status}). Please try again.`);
      logFunnelEvent("submit_error", `server_error_${res.status}`);
      return;
    }

    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong submitting your application. Please try again.");
      logFunnelEvent("submit_error", data.error || "unknown_server_error");
      return;
    }

    logFunnelEvent("submit_success");
    handleSendOtp();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-brand-line/60 shadow-sm p-6 md:p-8">
          <span className="brand-eyebrow-line" />
          <h2 className="text-2xl font-bold text-brand-charcoal mb-3">
            Application submitted successfully
          </h2>
          <p className="text-brand-slate mb-6">
            Your application has been received and is now with our review team.
            We&apos;ll reach out by email with your next steps.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
            <h3 className="text-sm font-bold text-brand-charcoal mb-2">One More Step: Verify Your Email</h3>
            <p className="text-sm text-brand-slate mb-4">
              To complete your application process, please verify your email address using the code we just sent to{" "}
              <strong>{form.email}</strong>.
            </p>
            {!emailVerified ? (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <TextInput
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, ""))}
                  />
                </div>
                <Button type="button" variant="secondary" disabled={otpVerifying} onClick={handleVerifyOtp} className="!px-4 !py-2 text-xs">
                  {otpVerifying ? "Verifying..." : "Verify"}
                </Button>
                <Button type="button" variant="secondary" disabled={otpSending} onClick={handleSendOtp} className="!px-3 !py-2 text-xs">
                  Resend
                </Button>
              </div>
            ) : (
              <p className="text-sm text-brand-green-dark font-semibold">Email verified. You&apos;re all set.</p>
            )}
            {otpMessage && <p className="text-sm text-brand-green-dark mt-2">{otpMessage}</p>}
            {otpError && <p className="text-sm text-red-500 mt-2">{otpError}</p>}
          </div>

          <a href="https://whatsapp.com/channel/0029VaDTbXUCcW4nag3FKI2i" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center font-medium text-sm rounded-md px-5 py-2 bg-brand-green text-white hover:bg-brand-green-dark transition-colors">
            Join the Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto" ref={formContainerRef}>

      <div className="bg-white rounded-2xl border border-brand-line/60 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-7 h-7 rounded-full bg-brand-green/10 text-brand-green-dark flex items-center justify-center text-xs font-bold">1</span>
          <h3 className="text-lg font-semibold text-brand-charcoal">Personal Details</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-x-4">
          <Field label="First Name" required>
            <TextInput required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </Field>
          <Field label="Last Name" required>
            <TextInput required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </Field>
        </div>

        <Field label="Email Address" required error={emailError ?? undefined}>
          <TextInput required type="email" value={form.email} onChange={handleEmailChange} onBlur={handleEmailBlur} />
          <p className="text-xs text-brand-slate mt-1">This will automatically become your primary LaunchPadX account email.</p>
        </Field>

        <Field label="Phone Number" required error={phoneError ?? undefined}>
          <div className="flex gap-2">
            <select
              value={form.phoneDial}
              onChange={(e) => update("phoneDial", e.target.value)}
              className="rounded-lg border border-brand-line px-2 py-2.5 text-brand-charcoal bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              style={{ maxWidth: "160px" }}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={`${c.name}-${c.dial}`} value={c.dial}>
                  {c.name}{c.dial !== "OTHER" ? ` (${c.dial})` : ""}
                </option>
              ))}
            </select>
            {form.phoneDial === "OTHER" && (
              <TextInput placeholder="+xxx" value={customDial} onChange={handleCustomDialChange} className="!w-20" />
            )}
            <TextInput
              required
              type="tel"
              inputMode="tel"
              placeholder="791887609"
              value={form.phoneNumber}
              onChange={handlePhoneNumberChange}
              onBlur={handlePhoneBlur}
              className="flex-1"
            />
          </div>
        </Field>

        <div className="grid md:grid-cols-2 gap-x-4">
          <Field label="Country" required>
            <TextInput required value={form.country} onChange={(e) => update("country", e.target.value)} />
          </Field>
          <Field label="State / Province of Residence" required>
            <TextInput required value={form.stateProvince} onChange={(e) => update("stateProvince", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-brand-line/60 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-7 h-7 rounded-full bg-brand-green/10 text-brand-green-dark flex items-center justify-center text-xs font-bold">2</span>
          <h3 className="text-lg font-semibold text-brand-charcoal">Business Overview</h3>
        </div>

        <Field label="Business Name" required>
          <TextInput required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
        </Field>

        <div className="grid md:grid-cols-2 gap-x-4">
          <Field label="Business Category" required>
            <Select required value={form.businessCategory} onChange={(e) => update("businessCategory", e.target.value)}>
              <option value="">Select</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Business Stage" required>
            <Select required value={form.businessStage} onChange={(e) => update("businessStage", e.target.value)}>
              <option value="">Select</option>
              {BUSINESS_STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Business Description" required>
          <textarea
            required
            rows={4}
            maxLength={500}
            value={form.businessDescription}
            onChange={(e) => update("businessDescription", e.target.value)}
            className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
          <p className="text-xs text-brand-slate mt-1">{form.businessDescription.length}/500 characters</p>
        </Field>
      </div>

      <div className="bg-white rounded-2xl border border-brand-line/60 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-7 h-7 rounded-full bg-brand-green/10 text-brand-green-dark flex items-center justify-center text-xs font-bold">3</span>
          <h3 className="text-lg font-semibold text-brand-charcoal">Tell us about you</h3>
        </div>

        <Field label="If selected into LaunchPadX, what do you hope to achieve through the program?" required>
          <textarea
            required
            rows={4}
            maxLength={500}
            value={form.goalQuestion}
            onChange={(e) => update("goalQuestion", e.target.value)}
            className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
          <p className="text-xs text-brand-slate mt-1">{form.goalQuestion.length}/500 characters</p>
        </Field>

        <Field label="What makes you committed to building your business over the long term?" required>
          <textarea
            required
            rows={4}
            maxLength={500}
            value={form.commitmentQuestion}
            onChange={(e) => update("commitmentQuestion", e.target.value)}
            className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
          <p className="text-xs text-brand-slate mt-1">{form.commitmentQuestion.length}/500 characters</p>
        </Field>
      </div>

      <div className="bg-white rounded-2xl border border-brand-line/60 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-brand-green/10 text-brand-green-dark flex items-center justify-center text-xs font-bold">4</span>
          <h3 className="text-base font-bold text-brand-charcoal">Before you submit</h3>
        </div>
        <div className="space-y-3">
          {COMMITMENT_STATEMENTS.map((s, i) => (
            <CheckboxField key={i} label={s} checked={form.commitmentChecks[i]} onChange={() => toggleCommitment(i)} />
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
