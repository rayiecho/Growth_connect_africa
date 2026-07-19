"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
            <p className="text-sm text-gray-500 mb-6">
              We're experiencing a temporary issue. Please try again in a moment,
              or come back shortly if the problem continues.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center font-medium text-sm rounded-lg px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-4">Reference: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
