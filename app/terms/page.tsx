"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6 text-brand-charcoal text-sm">
      <div className="max-w-3xl mx-auto bg-white border border-brand-line rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal">Terms of Service</h1>
          <Link href="/" className="text-xs text-brand-green hover:underline font-medium">Back to Home</Link>
        </div>
        <p className="text-brand-slate text-xs">Last Updated: July 2026</p>

        <span className="block h-px w-full bg-brand-line my-4" />

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. About These Terms</h2>
          <p className="text-brand-slate leading-relaxed">
            These Terms of Service govern your use of the LaunchPadX application platform operated
            by Growth Connect Africa ("GrowthConnect", "we", "us"). By submitting an application,
            video pitch, or verification through this platform, you agree to these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Eligibility and Accuracy of Information</h2>
          <p className="text-brand-slate leading-relaxed">
            You confirm that all information you submit at every stage of the process (application,
            video pitch, LaunchPadX ID, and verification) is accurate, truthful, and belongs to you or
            your business. Providing false or misleading information may result in disqualification
            from the programme at any stage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. One Submission Per Stage</h2>
          <p className="text-brand-slate leading-relaxed">
            Each stage of the qualification process (application, video pitch, and verification) can
            only be submitted once per email address. If your video pitch is marked "Action Required"
            by our review team, you will be permitted to resubmit using the same email; all other
            resubmission attempts will be rejected. If you believe a mistake was made, use the Contact
            Team form to reach us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Review Timelines and Deadlines</h2>
          <p className="text-brand-slate leading-relaxed">
            Application decisions are released every Tuesday and Friday. Video pitch decisions are
            released every Tuesday and Friday, ten days after submission. Verification decisions are
            made within seven working days of submission. Submission deadlines communicated by
            email are firm; late submissions are not accepted and may result in disqualification from
            further stages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Verification Fees</h2>
          <p className="text-brand-slate leading-relaxed">
            The Founder &amp; Business Verification stage requires a processing fee, payable to our
            independent verification partners and processed through Paystack. This fee is not paid to
            GrowthConnect and is non-refundable once verification processing has begun.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. No Guarantee of Funding or Selection</h2>
          <p className="text-brand-slate leading-relaxed">
            Submitting an application, video pitch, or verification does not guarantee admission into
            LaunchPadX, progression to any subsequent stage, or access to funding, credit financing,
            or equity opportunities referenced on this platform. All decisions are made at
            GrowthConnect's discretion based on qualification performance and evaluation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. Acceptable Use</h2>
          <p className="text-brand-slate leading-relaxed">
            You agree not to attempt to bypass the platform's intended process, submit content on
            behalf of someone else without authorization, upload malicious files, or interfere with the
            normal operation of the site. Use of the SOS reporting feature for non-urgent matters may
            delay our ability to respond to genuine emergencies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">8. Program Materials</h2>
          <p className="text-brand-slate leading-relaxed">
            Your LaunchPadX ID card, program materials, and any content provided to you as part of the
            programme remain the property of GrowthConnect Africa and are provided solely for your
            use as a verified programme participant.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">9. Limitation of Liability</h2>
          <p className="text-brand-slate leading-relaxed">
            The platform is provided on an "as-is" basis. GrowthConnect is not liable for indirect
            losses, missed deadlines due to technical issues outside our reasonable control, or
            decisions made by independent verification or payment partners.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">10. Changes to These Terms</h2>
          <p className="text-brand-slate leading-relaxed">
            We may update these terms as the programme evolves. Continued use of the platform after
            changes are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">11. Contact Us</h2>
          <p className="text-brand-slate leading-relaxed">
            Questions about these terms can be sent through the Contact Team form, or by email to
            hello@growthconnect.africa.
          </p>
        </section>
      </div>
    </div>
  );
}
