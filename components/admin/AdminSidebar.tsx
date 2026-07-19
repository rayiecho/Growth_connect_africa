"use client";

import { useState } from "react";

const REVIEW_TABS = ["Applicants", "Video Submissions", "Verification", "Program Participants"];

export type Section = "review" | "analytics" | "users" | "support" | "emails" | "staged" | "details" | "calllog" | "callnotes" | "lookup" | "followups" | "funnel";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  function selectSection(s: Section) {
    onSectionChange(s);
    setMobileOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-white border border-brand-line rounded-lg p-2 shadow-sm"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav
        className={`w-64 shrink-0 bg-white border-r border-brand-line min-h-screen py-6 fixed md:static inset-y-0 left-0 z-50 overflow-y-auto transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-4">
          <div className="flex items-center justify-between mb-3 md:hidden">
            <span className="text-sm font-bold text-brand-charcoal">Menu</span>
            <button type="button" onClick={() => setMobileOpen(false)} className="p-1 text-brand-slate" aria-label="Close menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              selectSection("review");
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
                  onClick={() => {
                    onReviewTabChange(i);
                    setMobileOpen(false);
                  }}
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
            onClick={() => selectSection("analytics")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "analytics" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Analytics
          </button>

          <button
            type="button"
            onClick={() => selectSection("users")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "users" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Users
          </button>

          <button
            type="button"
            onClick={() => selectSection("support")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "support" ? "bg-red-50 text-red-600" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Support
          </button>

          <button
            type="button"
            onClick={() => selectSection("emails")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "emails" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Emails
          </button>

          <button
            type="button"
            onClick={() => selectSection("staged")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "staged" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Staged for Send
          </button>

          <button
            type="button"
            onClick={() => selectSection("details")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "details" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Additional Details
          </button>

          <button
            type="button"
            onClick={() => selectSection("calllog")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "calllog" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Reminders
          </button>

          <button
            type="button"
            onClick={() => selectSection("callnotes")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
              section === "callnotes" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Call Log
          </button>

          <button
            type="button"
            onClick={() => selectSection("lookup")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "lookup" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Compose Email
          </button>

          <button
            type="button"
            onClick={() => selectSection("followups")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm mb-1 transition-colors ${
              section === "followups" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Non-Applicant Follow-Ups
          </button>

          <button
            type="button"
            onClick={() => selectSection("funnel")}
            className={`w-full text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
              section === "funnel" ? "bg-brand-green/10 text-brand-green-dark" : "text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            Application Funnel
          </button>

          <a href="/admin/engine" className="block w-full text-left px-3 py-2 rounded-lg font-semibold text-sm text-brand-charcoal hover:bg-gray-50 transition-colors mt-1 border-t border-brand-line pt-3">
            ⚙ Engine Monitor
          </a>
        </div>
      </nav>
    </>
  );
}

