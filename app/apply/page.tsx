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
            <p className="text-xs uppercase tracking-widest font-semibold text-brand-green mb-3">
              Must Read Before Submitting<br className="sm:hidden" /> Your Application
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your Journey to The Capital Starts Here
            </h1>
            <p className="text-white/80 mb-5">
              <strong className="text-white">LaunchPadX</strong> is more than
              a funding opportunity. It&apos;s a structured founder
              development program that helps entrepreneurs build
              investment-ready businesses through practical learning,
              mentorship, and real business implementation.
            </p>
            <p className="text-white/80 mb-6">
              Those who successfully complete the journey become eligible for
              The Capital&mdash;where founders present their businesses and
              access opportunities including{" "}
              <strong className="text-white">
                ₦1,000,000 in founder support, up to ₦20 million in credit
                financing,
              </strong>{" "}
              and equity funding opportunities of up to $50,000.
            </p>
            <p className="text-sm font-semibold text-white mb-3">Your LaunchPadX Journey</p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {["Application", "Founder Assessment", "Business Verification", "Accelerator Program", "Funding"].map((stage, i, arr) => (
                <div key={stage} className="flex items-center gap-1.5">
                  <span className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">{stage}</span>
                  {i < arr.length - 1 && <span className="text-white/50">&rarr;</span>}
                </div>
              ))}
            </div>
            <p className="text-white/80 mb-5">
              Please note: Submitting an application does not guarantee
              admission into LaunchPadX, progression to The Capital, or
              funding opportunities.
            </p>
            <p className="text-white font-medium">
              Tell us about your business below. If selected, we&apos;ll help
              you build it into an investment-ready venture.
            </p>
          </div>
        </div>
      </section>
      <div id="apply-form" className="bg-gray-100 py-16"><div className="max-w-5xl mx-auto px-6 scroll-mt-24">
        <ApplicationForm />
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
