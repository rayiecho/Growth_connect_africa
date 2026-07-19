"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type VerifyResult = {
  valid: boolean;
  first_name?: string;
  last_name?: string;
  lpx_id?: string;
  cohort?: string;
  issued_at?: string;
};

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/verify/${encodeURIComponent(code)}`)
      .then((res) => (res.ok ? res.json() : { valid: false }))
      .then((data) => setResult(data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen bg-brand-charcoal flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 350" className="h-7 w-auto">
            <g fill="#111827">
              <circle cx="70" cy="275" r="40"/>
              <circle cx="190" cy="275" r="40"/>
              <circle cx="190" cy="155" r="40"/>
              <circle cx="310" cy="155" r="40"/>
              <circle cx="310" cy="35" r="40"/>
            </g>
            <circle cx="310" cy="275" r="40" fill="#16A34A"/>
            <g stroke="#111827" strokeWidth="8">
              <line x1="110" y1="275" x2="150" y2="275"/>
              <line x1="230" y1="275" x2="270" y2="275"/>
              <line x1="190" y1="195" x2="190" y2="235"/>
              <line x1="230" y1="155" x2="270" y2="155"/>
              <line x1="310" y1="75" x2="310" y2="115"/>
              <line x1="310" y1="195" x2="310" y2="235"/>
            </g>
            <text x="430" y="165" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="140" fill="#111827" letterSpacing="-4">Growth</text>
            <text x="430" y="295" fontFamily="Arial, sans-serif" fontSize="140" fill="#111827" letterSpacing="-2">Connect</text>
          </svg>
        </div>

        {loading ? (
          <p className="text-sm text-brand-slate">Verifying...</p>
        ) : result?.valid ? (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-green text-3xl">&#10003;</span>
            </div>
            <h1 className="text-xl font-bold text-brand-charcoal mb-1">Certificate Verified</h1>
            <p className="text-sm text-brand-slate mb-6">This is a genuine LaunchPadX certificate.</p>
            <div className="text-left bg-gray-50 rounded-xl p-5 space-y-2 text-sm">
              <p><strong className="text-brand-slate">Name:</strong> {result.first_name} {result.last_name}</p>
              <p><strong className="text-brand-slate">LaunchPadX ID:</strong> {result.lpx_id}</p>
              <p><strong className="text-brand-slate">Cohort:</strong> {result.cohort}</p>
              <p><strong className="text-brand-slate">Issued:</strong> {result.issued_at ? new Date(result.issued_at).toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "long", year: "numeric" }) : "-"}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-3xl">&#10007;</span>
            </div>
            <h1 className="text-xl font-bold text-brand-charcoal mb-1">Certificate Not Found</h1>
            <p className="text-sm text-brand-slate">
              We could not verify this certificate. The code may be invalid or the certificate may not exist in our records.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
