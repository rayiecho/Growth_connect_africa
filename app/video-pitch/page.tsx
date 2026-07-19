import { VideoPitchForm } from "@/components/forms/VideoPitchForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function VideoPitchPage() {
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
            Founder Assessment - Video Pitch Submission
          </h1>
          <span className="brand-eyebrow-line mx-auto" />
          <p className="text-white/90 max-w-3xl mx-auto mt-6 mb-6">
            As part of the qualification process, we require a short founder
            video submission. This stage helps us verify commitment,
            understand your business at a high level, and assess your
            readiness to continue through the program.
          </p>
          <p className="text-white font-semibold mb-2">Your Video Should Cover:</p>
          <p className="text-white/80 max-w-3xl mx-auto mb-6">
            Your name and business name | What your business does | The
            problem you are solving | Who your customers are | Why you want
            to participate in LaunchPadX
          </p>
          <p className="text-white/80 max-w-3xl mx-auto mb-2">
            Your assessment will be based primarily on your video pitch and
            the information you provide below.
          </p>
          <p className="text-white/80 max-w-3xl mx-auto mb-2">
            Record a short video (3-5 minutes recommended) introducing
            yourself and your business.
          </p>
          <p className="text-white/80 max-w-3xl mx-auto mb-2">
            Upload the video to YouTube as an <strong className="text-white">Unlisted Video</strong> and submit the link below.
          </p>
          <p className="text-amber-300 mb-2">Do not submit a Private video.</p>
          <p className="text-white/80 max-w-3xl mx-auto">
            The video must be accessible through the link you provide.
          </p>
        </div>
      </section>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <VideoPitchForm />
      </main>
      <SiteFooter />
    </>
  );
}
