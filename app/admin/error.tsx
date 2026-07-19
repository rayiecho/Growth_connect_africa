"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-brand-line shadow-sm p-8 text-center">
        <h2 className="text-xl font-bold text-brand-charcoal mb-2">Temporarily Unavailable</h2>
        <p className="text-sm text-brand-slate mb-6">
          We're having trouble loading this page right now. This is usually temporary
          - please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center font-medium text-sm rounded-lg px-6 py-3 bg-brand-green text-white hover:bg-brand-green-dark transition-colors"
        >
          Try Again
        </button>
        {error.digest && (
          <p className="text-xs text-brand-slate mt-4">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
