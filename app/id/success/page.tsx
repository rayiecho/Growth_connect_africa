"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/Button";

function SuccessCardContent() {
  const searchParams = useSearchParams();
  const idValue = searchParams.get("id") || "LPX-PENDING";
  const emailValue = searchParams.get("email") || "";
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(idValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gray-50 min-h-screen text-brand-charcoal py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="bg-brand-green/10 border border-brand-green/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center mx-auto mb-3 text-xl font-bold">✓</div>
          <h2 className="text-2xl font-bold text-brand-green-dark mb-1">Congratulations!</h2>
          <p className="text-sm text-brand-slate max-w-lg mx-auto">
            Your LaunchPadX ID has been successfully created. This is your official permanent identity within the ecosystem.
          </p>
        </div>

        <div className="bg-white border border-brand-line rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-brand-charcoal text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Official Ecosystem Identifier</p>
              <p className="text-xl font-mono font-bold text-brand-green">{idValue}</p>
            </div>
            <Button variant="secondary" onClick={copyToClipboard} className="!bg-white/10 !text-white !border-transparent hover:!bg-white/20 px-4 py-1 text-xs">
              {copied ? "Copied! ✓" : "Copy ID"}
            </Button>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-brand-line">
            <div>
              <p className="text-xs text-gray-400 font-medium">Linked Email Channel</p>
              <p className="font-medium text-brand-charcoal">{emailValue || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Program Assignment</p>
              <p className="font-medium text-brand-charcoal">LaunchPadX Cohort A</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-line rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-brand-charcoal">Your LaunchPadX Milestones</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-medium text-brand-green-dark">
              <span className="text-brand-green font-bold">☑</span>
              <span>Application Submitted</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-brand-green-dark">
              <span className="text-brand-green font-bold">☑</span>
              <span>Founder Assessment Completed</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-brand-green-dark">
              <span className="text-brand-green font-bold">☑</span>
              <span>LaunchPadX ID Generated</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="font-bold">○</span>
              <span>Founder Verification Block (Pending)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="font-bold">○</span>
              <span>Program Activation & Training Loop</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <button onClick={() => window.print()} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-brand-charcoal rounded-lg text-sm font-medium transition-colors">
            Download Profile Sheet
          </button>
          <a href="/verification" className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-sm font-medium transition-colors text-center">
            Proceed to Founder Verification
          </a>
        </div>

      </div>
    </div>
  );
}

export default function LaunchpadIDSuccess() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-brand-slate">Loading Profile Node...</div>}>
      <SuccessCardContent />
    </Suspense>
  );
}