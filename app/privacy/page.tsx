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
          <h2 className="text-lg font-bold">1. Data Architecture Collection</h2>
          <p className="text-brand-slate leading-relaxed">
            GrowthConnect Africa collects specific personal metrics identifiers including full structural name records, valid email routing data, active contact channel coordinates, digital entity assignments, and user-provided graphic profile assets to initialize secure ecosystem operations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Use of Structural Parameters</h2>
          <p className="text-brand-slate leading-relaxed">
            The collection of metrics remains strictly scoped within the validation context of the LaunchPadX cohort framework, automatic electronic certification proof generation, programmatic platform navigation controls, and identity string mapping procedures.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. Technical Security Protocols</h2>
          <p className="text-brand-slate leading-relaxed">
            Data configurations are written directly to encrypted Firestore infrastructure node shards. Access controls are constrained through strict server-side cryptographic sessions layer checking, preventing unauthorized network data leaks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Tracking Technologies and Cookies</h2>
          <p className="text-brand-slate leading-relaxed">
            We employ lightweight browser tokens and analytical scripts to monitor entry funnel routing performance. These components save state values locally to eliminate redundant layout loads and securely cache valid authentication sessions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Third-Party Data Disclosures</h2>
          <p className="text-brand-slate leading-relaxed">
            Your metrics coordinates are never sold or rented. Data records are only shared programmatically with authenticated operational sub-processors (such as automated secure hosting arrays or delivery channels) strictly required to fulfill your evaluation pipeline actions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. Data Retention and Deletion Rights</h2>
          <p className="text-brand-slate leading-relaxed">
            We preserve profile identifiers for the duration of the active cohort cycle. Users possess full authority to request a formal copy of held fields or initiate account data purge scripts by contacting the GrowthConnect system administrator team.
          </p>
        </section>
      </div>
    </div>
  );
}
