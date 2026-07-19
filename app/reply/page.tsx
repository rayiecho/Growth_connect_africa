"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";

function ReplyPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const context = searchParams.get("context") || "general";

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/public/email-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, context }),
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
          <h2 className="text-xl font-bold text-brand-charcoal mb-2">Message Sent</h2>
          <p className="text-sm text-brand-slate">
            Thank you - your message has been received. Our team will review it and get back to you by email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-brand-line p-8">
        <h2 className="text-xl font-bold text-brand-charcoal mb-2">Reply to GrowthConnect</h2>
        <p className="text-sm text-brand-slate mb-6">
          Have a question or something to share about your application? Type your message below and our team will respond by email.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Your Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-4 bg-gray-50 text-brand-slate"
          />
          <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Your Message</label>
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <Button type="submit" variant="primary" disabled={submitting || !message.trim()}>
            {submitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ReplyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-brand-slate">Loading...</div>}>
      <ReplyPageContent />
    </Suspense>
  );
}
