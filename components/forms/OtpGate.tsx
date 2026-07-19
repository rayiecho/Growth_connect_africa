"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

type Props = {
  email: string;
  onVerified: () => void;
};

export function OtpGate({ email, onVerified }: Props) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSentRef = useRef(false);

  async function sendCode() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/public/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send verification code. Please try again.");
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setSending(false);
  }

  useEffect(() => {
    if (hasAutoSentRef.current) return;
    hasAutoSentRef.current = true;
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/public/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Incorrect code. Please check and try again.");
        setVerifying(false);
        return;
      }
      onVerified();
    } catch {
      setError("Network error. Please try again.");
    }
    setVerifying(false);
  }

  if (!sent) {
    return (
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Verify Your Email</h3>
        <p className="text-brand-slate mb-4">
          For your security, we need to verify this is your email before showing your details.
          {sending ? " Sending your code..." : ` We'll send a 6-digit code to ${email}.`}
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <Button type="button" variant="formSubmit" disabled={sending} onClick={sendCode}>
          {sending ? "Sending..." : "Send Verification Code"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={verifyCode} className="max-w-xl">
      <h3 className="text-lg font-semibold text-brand-charcoal mb-2">Enter Verification Code</h3>
      <p className="text-brand-slate mb-4">Enter the 6-digit code sent to {email}.</p>
      <TextInput
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
      />
      {error && <p className="text-sm text-red-500 mt-3 mb-1">{error}</p>}
      <div className="flex items-center gap-4 mt-4">
        <Button type="submit" variant="formSubmit" disabled={verifying || !code}>
          {verifying ? "Verifying..." : "Verify"}
        </Button>
        <button
          type="button"
          onClick={sendCode}
          disabled={sending}
          className="text-sm text-brand-green-dark hover:underline disabled:opacity-50"
        >
          {sending ? "Resending..." : "Resend code"}
        </button>
      </div>
    </form>
  );
}
