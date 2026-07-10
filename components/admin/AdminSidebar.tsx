"use client";

import { useState } from "react";

const REVIEW_TABS = ["Applicants", "Video Submissions", "Verification", "Program Participants"];

export type Section = "review" | "analytics" | "users";

export function AdminSidebar({
  section,
  onSectionChange,
  reviewTab,
  onReviewTabChange,
}: {
  section: Section;
  onSectionChange: (s: Section) => void;
  reviewTab: number;
  onReviewTabChange: (i: number) => void;
}) {
  const [reviewOpen, setReviewOpen] = useState(true);

  return (
    <nav className="w-64 shrink-0 bg-white border-r border-brand-line min-h-screen py-6">
      <div className="px-4">
        <button
          type="button"
          onClick={() => {
            onSectionChange("review");
            setReviewOpen(true);
          }}
          className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
            section === "review" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
          }`}
        >
          Review
        </button>

        {section === "review" && reviewOpen && (
          <div className="ml-3 mb-2 border-l border-brand-line pl-3 space-y-1">
            {REVIEW_TABS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => onReviewTabChange(i)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                  reviewTab === i ? "text-brand-green-dark font-semibold" : "text-brand-slate hover:text-brand-charcoal"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onSectionChange("analytics")}
          className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
            section === "analytics" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
          }`}
        >
          Analytics
        </button>

        <button
          type="button"
          onClick={() => onSectionChange("users")}
          className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
            section === "users" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
          }`}
        >
          Users
        </button>
      </div>
    </nav>
  );
}
