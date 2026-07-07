import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { VideoHero } from "@/components/marketing/VideoHero";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <section className="relative bg-brand-charcoal overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-110"
          style={{ backgroundImage: `url(https://img.youtube.com/vi/hCl0ZSNAFB0/maxresdefault.jpg)` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-brand-charcoal/70" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <VideoHero />
          <div>
            <span className="brand-eyebrow-line" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Submit Your Idea and Use of Funds
            </h1>
            <p className="text-white/80 mb-5">
              <strong className="text-white">LaunchPadX</strong> is a free
              qualification and business growth pipeline designed to help
              entrepreneurs move from ideas, to structure, to opportunities,
              to funding and scale.
            </p>
            <p className="text-white/80 mb-5">
              Participants who successfully progress through the
              qualification process may gain access to: Entrepreneurial
              training, Mentorship and business guidance, Community and
              growth opportunities, The Capital Online Pitch,{" "}
              <strong className="text-white">
                ₦1,000,000 support opportunities, Up to ₦20 million in credit
                financing,
              </strong>{" "}
              and Potential access to equity funding opportunities of up to
              $50,000.
            </p>
            <p className="text-white/80 mb-5">
              Please note: Submitting this application does not automatically
              guarantee funding or selection.
            </p>
            <p className="text-white font-medium">
              Start by telling us about your idea and your vision. If you
              qualify, we&apos;ll help you bring it to life.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="font-semibold text-brand-charcoal mb-8">
          Fill out the form below to get started.
        </p>
        <ApplicationForm />
      </div>
      <SiteFooter />
    </>
  );
}