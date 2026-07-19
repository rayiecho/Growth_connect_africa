"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6 text-brand-charcoal text-sm">
      <div className="max-w-3xl mx-auto bg-white border border-brand-line rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal">Privacy Policy</h1>
          <Link href="/" className="text-xs text-brand-green hover:underline font-medium">Back to Home</Link>
        </div>
        <p className="text-brand-slate text-xs">Last Updated: July 2026</p>

        <span className="block h-px w-full bg-brand-line my-4" />

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. Who We Are</h2>
          <p className="text-brand-slate leading-relaxed">
            This Privacy Policy applies to the LaunchPadX programme, operated by Growth Connect Africa
            ("GrowthConnect", "we", "us"). It explains what information we collect when you apply to
            or participate in LaunchPadX, how we use it, and the choices you have.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Information We Collect</h2>
          <p className="text-brand-slate leading-relaxed">
            Depending on which stage of the programme you interact with, we may collect:
          </p>
          <ul className="list-disc list-inside text-brand-slate leading-relaxed space-y-1">
            <li>Personal details you provide on application: name, phone number, email address, age range, gender, and location.</li>
            <li>Business information: business name, stage, industry, description, revenue status, and related answers.</li>
            <li>A one-time verification code sent to your email address to confirm you own it, used only during the application process.</li>
            <li>Your video pitch link (hosted on YouTube as an unlisted video, not uploaded to our servers directly).</li>
            <li>Verification documents you upload: your completed Founder &amp; Business Verification Form and payment receipt, stored securely as files.</li>
            <li>Any messages you send us through the Contact Team or SOS forms, including your name, email, and message content.</li>
            <li>If you are an admin user, a secure session cookie used solely to keep you signed in to the admin dashboard.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. How We Use Your Information</h2>
          <p className="text-brand-slate leading-relaxed">
            We use the information above to: process and review your application, video pitch, and
            verification submissions; communicate with you at each stage (including automated
            confirmation emails, deadline reminders, and outcome notifications); verify your identity
            and business details during the Founder &amp; Business Verification process; generate and
            manage your LaunchPadX ID; and respond to messages sent through Contact Team or SOS.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Where Your Data Is Stored</h2>
          <p className="text-brand-slate leading-relaxed">
            Application, video pitch, and verification records are stored in Google Firestore. Uploaded
            files (verification forms and payment receipts) are stored in Cloudflare R2 object storage.
            Automated emails are sent through our email delivery provider. We use industry-standard
            access controls, including cryptographically signed admin sessions, to restrict who can view
            this data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Third Parties Involved in Verification</h2>
          <p className="text-brand-slate leading-relaxed">
            As part of Founder &amp; Business Verification, your identity and business details (including
            BVN and NIN where applicable) are shared with independent third-party verification partners
            who carry out these checks on our behalf. Payment for verification is processed through
            Paystack; we do not store your card or payment details ourselves.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. Data Retention</h2>
          <p className="text-brand-slate leading-relaxed">
            We retain your application and programme data for as long as you remain an active
            applicant, participant, or programme graduate, and for a reasonable period afterward to
            meet our record-keeping and reporting obligations. You may request deletion of your data
            at any time through the Contact Team form; we will action this unless we are required to
            retain certain records by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. Your Rights</h2>
          <p className="text-brand-slate leading-relaxed">
            You may request a copy of the personal data we hold about you, ask us to correct
            inaccurate information, or request deletion of your data, by reaching out through the
            Contact Team form found across the site. We will respond to reasonable requests in a
            timely manner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">8. Changes to This Policy</h2>
          <p className="text-brand-slate leading-relaxed">
            We may update this Privacy Policy from time to time as the programme evolves. The "Last
            Updated" date at the top of this page reflects the most recent revision. Continued use of
            the platform after changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">9. Contact Us</h2>
          <p className="text-brand-slate leading-relaxed">
            Questions about this policy or your data can be sent through the Contact Team form,
            or by email to hello@growthconnect.africa.
          </p>
        </section>
      </div>
    </div>
  );
}
