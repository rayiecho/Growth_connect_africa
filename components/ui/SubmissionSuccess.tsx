export function SubmissionSuccess({
  title,
  message,
  videoId = "hCl0ZSNAFB0",
}: {
  title: string;
  message: string;
  videoId?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-green text-white shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-brand-charcoal">{title}</h2>
      </div>

      <p className="text-brand-slate mb-8">{message}</p>

      <div className="mb-8">
        <p className="text-sm font-semibold text-brand-charcoal mb-3">
          While you wait, take a moment to watch this:
        </p>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="LaunchPadX"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <a href="/faq" className="font-semibold text-brand-green hover:text-brand-green-dark">
          Have questions? Visit our FAQs →
        </a>
        <span className="text-brand-slate">·</span>
        <span className="text-brand-slate italic">Live chat support coming soon</span>
      </div>
    </div>
  );
}
