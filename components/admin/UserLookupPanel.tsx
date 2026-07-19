"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import { formatShortDate } from "@/lib/engine/dates";

type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  lpx_id: string | null;
  current_stage: string;
  current_status: string;
  cohort: string;
  date_applied: string;
  video_submitted_at: string | null;
  verification_submitted_at: string | null;
  program_completed: boolean;
  photo_path: string | null;
};

export function UserLookupPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Applicant[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/admin/search-user?q=${encodeURIComponent(query.trim())}`);
      const data = res.ok ? await res.json() : { results: [] };
      setResults(data.results || []);
    } catch {
      setError("Search failed.");
    }
    setSearching(false);
  }

  async function handleSendMessage() {
    if (!selected || !message.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/message-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected.email, message: message.trim() }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setSendResult(`Server error (status ${res.status}).`);
        setSending(false);
        return;
      }
      if (!res.ok) {
        setSendResult(data.error || "Failed to send message.");
        setSending(false);
        return;
      }
      setSendResult("Message sent successfully.");
      setMessage("");
    } catch {
      setSendResult("Network error sending message.");
    }
    setSending(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">User Lookup</h2>
        </div>
      </div>
      <p className="text-sm text-brand-slate mb-6">
        Search by name, email, phone, or LaunchPadX ID to view a user's status and message them directly.
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-lg">
        <TextInput placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="submit" variant="primary" disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {!selected && (
        <div className="space-y-3">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r)}
              className="w-full text-left bg-white border border-brand-line rounded-xl p-4 hover:border-brand-green transition-colors"
            >
              <p className="text-sm font-semibold text-brand-charcoal">{r.first_name} {r.last_name}</p>
              <p className="text-xs text-brand-slate">{r.email} - {r.current_stage || "Application Submitted"}</p>
            </button>
          ))}
          {results.length === 0 && query && !searching && (
            <p className="text-sm text-brand-slate">No matching users found.</p>
          )}
        </div>
      )}

      {selected && (
        <div className="bg-white border border-brand-line rounded-2xl p-6">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-sm text-brand-green font-medium hover:underline mb-4"
          >
            &larr; Back to results
          </button>

          <div className="flex items-center gap-4 mb-4">
            {selected.photo_path ? (
              <img
                src={`/api/public/lpx-id/photo/${selected.photo_path}`}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border border-brand-line"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xs text-brand-slate border border-brand-line">
                No photo
              </div>
            )}
            <h3 className="text-lg font-bold text-brand-charcoal">{selected.first_name} {selected.last_name}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
            <p><strong className="text-brand-slate">Email:</strong> {selected.email}</p>
            <p><strong className="text-brand-slate">Phone:</strong> {selected.phone || "-"}</p>
            <p><strong className="text-brand-slate">LaunchPadX ID:</strong> {selected.lpx_id || "Not generated"}</p>
            <p><strong className="text-brand-slate">Cohort:</strong> {selected.cohort || "-"}</p>
            <p><strong className="text-brand-slate">Current Stage:</strong> {selected.current_stage || "Application Submitted"}</p>
            <p><strong className="text-brand-slate">Status:</strong> {selected.current_status || "Active"}</p>
            <p><strong className="text-brand-slate">Applied:</strong> {selected.date_applied ? formatShortDate(selected.date_applied) : "-"}</p>
            <p><strong className="text-brand-slate">Video Submitted:</strong> {selected.video_submitted_at ? formatShortDate(selected.video_submitted_at) : "Not yet"}</p>
            <p><strong className="text-brand-slate">Verification Submitted:</strong> {selected.verification_submitted_at ? formatShortDate(selected.verification_submitted_at) : "Not yet"}</p>
            <p><strong className="text-brand-slate">Program Completed:</strong> {selected.program_completed ? "Yes" : "No"}</p>
          </div>

          <div className="border-t border-brand-line pt-4">
            <label className="block text-sm font-semibold text-brand-charcoal mb-2">Send a Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-3"
              placeholder="Type your message..."
            />
            {sendResult && <p className="text-sm text-brand-slate mb-3">{sendResult}</p>}
            <Button variant="primary" disabled={sending || !message.trim()} onClick={handleSendMessage}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

