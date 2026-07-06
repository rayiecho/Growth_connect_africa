import { VideoPitchForm } from "@/components/forms/VideoPitchForm";

export default function VideoPitchPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <span className="brand-eyebrow-line" />
      <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4">
        Founder Assessment — Video Pitch Submission
      </h1>
      <p className="text-brand-slate max-w-2xl mb-12">
        Record a short video (3–5 minutes recommended) introducing yourself
        and your business, upload it to YouTube as an Unlisted video, and
        submit the link below.
      </p>
      <VideoPitchForm />
    </main>
  );
}
