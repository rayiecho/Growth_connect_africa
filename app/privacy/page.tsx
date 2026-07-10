"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6 text-brand-charcoal text-sm">
      <div className="max-w-3xl mx-auto bg-white border border-brand-line rounded-2xl p-8 space-y-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal mb-2">Privacy Policy</h1>
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
      </div>
    </div>
  );
}