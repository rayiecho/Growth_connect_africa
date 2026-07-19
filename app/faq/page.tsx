"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "How long does it take to hear back after I apply?",
    a: "Applications are reviewed on a rolling basis. Decisions are released every Tuesday and Friday. If you applied Friday through Monday, you'll hear back the following Tuesday. If you applied Tuesday through Thursday, you'll hear back that Friday.",
  },
  {
    q: "I submitted my application - can I submit again if I made a mistake?",
    a: "No, applications can only be submitted once per email address. If you need to correct something, please use the Contact Team option below and our team will assist you.",
  },
  {
    q: "How long do I have to submit my video pitch after being invited?",
    a: "You have 5 days from the date of your invitation email. You'll receive reminder emails if you haven't submitted yet, including a final reminder on the deadline day.",
  },
  {
    q: "I submitted my video, but I want to change the link - can I?",
    a: "Video pitches can only be submitted once, unless our review team marks your submission as 'Action Required' with feedback. In that case, you'll be able to resubmit using the same email.",
  },
  {
    q: "What happens after my video pitch is reviewed?",
    a: "Video decisions are released every Tuesday and Friday, 10 days after submission. If approved, you'll receive a detailed email with your next steps, including how to get your LaunchPadX ID and complete verification.",
  },
  {
    q: "How do I get my LaunchPadX ID?",
    a: "Once your video pitch is approved, you'll receive a link to generate your LaunchPadX ID. You'll need to look up your application by email, confirm your details, and accept the consent terms.",
  },
  {
    q: "How long does verification take?",
    a: "Verification decisions are made within 7 working days of submission, and are not tied to the Tuesday/Friday schedule - your countdown starts the moment you submit.",
  },
  {
    q: "I haven't gotten my LaunchPadX ID yet - can I still submit verification?",
    a: "No, you'll need to generate your LaunchPadX ID first. If you go to the verification page without one, you'll be directed to the ID page automatically.",
  },
  {
    q: "Do I need to pay before submitting verification?",
    a: "Yes. The verification form asks you to confirm you've completed your verification payment before you can submit. Make sure you've completed payment and have your receipt ready to upload.",
  },
  {
    q: "Who do I contact if something's not working?",
    a: "Use the Contact Team button found across the site for general questions, or the SOS button in the footer for urgent issues that need immediate attention.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6 text-brand-charcoal">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <Link href="/" className="text-xs text-brand-green hover:underline font-medium">Back to Home</Link>
        </div>
        <p className="text-brand-slate text-sm mb-8">
          Answers to the most common questions about the LaunchPadX application process.
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-brand-line rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-sm">{faq.q}</span>
                <span className="text-brand-slate text-lg shrink-0">{openIndex === i ? "-" : "+"}</span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-brand-slate leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white border border-brand-line rounded-xl p-6 text-center">
          <p className="text-sm text-brand-slate mb-3">Still have questions?</p>
          <p className="text-sm text-brand-charcoal">
            Use the Contact Team button available across the site to reach out to us directly.
          </p>
        </div>
      </div>
    </div>
  );
}
