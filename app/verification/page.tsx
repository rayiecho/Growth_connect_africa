import { VerificationForm } from "@/components/forms/VerificationForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function VerificationPage() {
  return (
    <>
      <SiteHeader />
      <section className="relative bg-brand-charcoal overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url(https://img.youtube.com/vi/hCl0ZSNAFB0/maxresdefault.jpg)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-brand-charcoal/70" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Founder &amp; Business Verification Submission
          </h1>
          <span className="brand-eyebrow-line mx-auto" />
          <p className="text-white/90 max-w-2xl mx-auto mt-6 mb-4">
            Congratulations on your acceptance into the LaunchPadX Program.
          </p>
          <p className="text-white/80 max-w-2xl mx-auto">
            This form is for participants who have completed their Founder
            &amp; Business Verification payment and have filled their
            Verification Form.
          </p>
        </div>
      </section>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <VerificationForm />
      </main>
      <SiteFooter />
    </>
  );
}
