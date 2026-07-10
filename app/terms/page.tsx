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
          <h2 className="text-lg font-bold">1. Ecosystem Allocation Eligibility</h2>
          <p className="text-brand-slate leading-relaxed">
            By accessing and generating structural identifier assets via the LaunchPadX interface portal, you warrant that all submitted criteria variables are strictly accurate and belong explicitly to your active enterprise channel node.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Digital Asset Identification Usage</h2>
          <p className="text-brand-slate leading-relaxed">
            The downloadable visual profile asset identity card prints serving as validation proof remain the intellectual variable property of GrowthConnect Africa network channels. Modification of underlying vector tags or systemic misrepresentation will revoke active allocation states immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. Account Limitation Metrics</h2>
          <p className="text-brand-slate leading-relaxed">
            GrowthConnect maintains exclusive parameters authority over application approvals, status transitions, review queue indexing adjustments, and programmatic platform revocation loops without context constraints.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. User Platform Conduct</h2>
          <p className="text-brand-slate leading-relaxed">
            Participants are prohibited from attempting system bypass actions, manipulating API payloads, or uploading automated malicious scripts. Any disruption to the performance of the cloud interface infrastructure will cause immediate termination of application processing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Limitation of Liability</h2>
          <p className="text-brand-slate leading-relaxed">
            GrowthConnect Africa does not guarantee program selection or direct funding upon application submission. The ecosystem services platform functions on an "as-is" basis, and we assume no liability for indirect network interruptions or operational data connection latency.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. Modifications to Terms</h2>
          <p className="text-brand-slate leading-relaxed">
            We reserve the right to append or change these functional rules to accommodate platform updates or changing security compliance policies. Continued navigation within the interface site after terms updates constitute official acknowledgment of the new operational guidelines.
          </p>
        </section>
      </div>
    </div>
  );
}
