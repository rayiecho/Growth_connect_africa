import { ApplicationForm } from "@/components/forms/ApplicationForm";

export default function ApplyPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <span className="brand-eyebrow-line" />
      <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
        Submit Your Idea and Use of Funds
      </h1>
      <p className="text-brand-slate max-w-2xl mb-2">
        LaunchPadX is a free qualification and business growth pipeline
        designed to help entrepreneurs move from ideas, to structure, to
        opportunities, to funding and scale.
      </p>
      <p className="text-sm text-brand-slate mb-12">
        Submitting this application does not automatically guarantee funding
        or selection.
      </p>
      <ApplicationForm />
    </main>
  );
}
