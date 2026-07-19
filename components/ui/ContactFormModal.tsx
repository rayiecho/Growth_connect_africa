"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

export function ContactFormModal({
  variant,
  onClose,
}: {
  variant: "contact" | "sos";
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSos = variant === "sos";
  const endpoint = isSos ? "/api/public/sos" : "/api/public/contact";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 mx-auto my-8 relative text-brand-charcoal"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div>
            <h3 className={`text-lg font-bold mb-2 ${isSos ? "text-red-600" : "text-brand-charcoal"}`}>
              {isSos ? "SOS Report Sent" : "Message Sent"}
            </h3>
            <p className="text-sm text-brand-slate mb-4">
              {isSos
                ? "Your report has been sent to our team and they've been alerted immediately."
                : "Thank you for reaching out. Our team will get back to you soon."}
            </p>
            <Button variant="primary" onClick={onClose} className="w-full">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className={`text-lg font-bold mb-1 ${isSos ? "text-red-600" : "text-brand-charcoal"}`}>
              {isSos ? "Emergency / SOS Report" : "Contact Our Team"}
            </h3>
            <p className="text-sm text-brand-slate mb-4">
              {isSos
                ? "Use this for urgent issues, errors, or anything requiring immediate attention."
                : "Send us a message and we'll get back to you as soon as we can."}
            </p>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">Name</label>
              <TextInput required autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} className="!text-brand-charcoal" />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">Email</label>
              <TextInput required autoComplete="off" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="!text-brand-charcoal" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                type="submit"
                variant={isSos ? "primary" : "primary"}
                disabled={submitting}
                className={`flex-1 ${isSos ? "!bg-red-600 hover:!bg-red-700" : ""}`}
              >
                {submitting ? "Sending..." : isSos ? "Send SOS" : "Send Message"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

