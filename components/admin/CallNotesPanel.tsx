"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { formatShortDate } from "@/lib/engine/dates";

type Person = {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
};

type Note = {
  id: string;
  note: string;
  outcome: string;
  author: string;
  created_at: string;
};

const OUTCOME_LABELS: Record<string, string> = {
  called_answered: "Called - Answered",
  called_no_answer: "Called - No Answer",
  left_message: "Left Message",
  called: "Called",
};

export function CallNotesPanel() {
  const [tab, setTab] = useState<"video" | "verification">("video");
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [notesByEmail, setNotesByEmail] = useState<Record<string, Note[]>>({});
  const [noteDraft, setNoteDraft] = useState("");
  const [outcomeDraft, setOutcomeDraft] = useState("called_answered");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/call-log")
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) => {
        const seen = new Set<string>();
        const list: Person[] = [];
        for (const e of data.entries || []) {
          if (!seen.has(e.email)) {
            seen.add(e.email);
            list.push({ id: e.id, name: e.name, email: e.email, phone: e.phone, stage: e.stage });
          }
        }
        setPeople(list);
      })
      .catch(() => setError("Failed to load call list."))
      .finally(() => setLoading(false));
  }, []);

  async function loadNotes(email: string) {
    try {
      const res = await fetch(`/api/admin/call-notes?email=${encodeURIComponent(email)}`);
      const data = res.ok ? await res.json() : { notes: [] };
      setNotesByEmail((prev) => ({ ...prev, [email]: data.notes || [] }));
    } catch {
      setError("Failed to load notes.");
    }
  }

  function toggleExpand(email: string) {
    if (expandedEmail === email) {
      setExpandedEmail(null);
    } else {
      setExpandedEmail(email);
      setNoteDraft("");
      if (!notesByEmail[email]) loadNotes(email);
    }
  }

  async function handleAddNote(email: string) {
    if (!noteDraft.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/call-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, note: noteDraft.trim(), outcome: outcomeDraft }),
      });
      if (res.ok) {
        setNoteDraft("");
        await loadNotes(email);
      } else {
        setError("Failed to save note.");
      }
    } catch {
      setError("Network error saving note.");
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Call Log</h2>
        </div>
      </div>
      <p className="text-sm text-brand-slate mb-6">
        Log calls and outcomes here so any admin can see who has already been contacted and what happened.
      </p>

      <div className="flex gap-6 border-b border-brand-line mb-6">
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "video" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Video Pitch ({people.filter((p) => p.stage === "Video Pitch").length})
        </button>
        <button
          type="button"
          onClick={() => setTab("verification")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "verification" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Verification ({people.filter((p) => p.stage === "Verification").length})
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : people.filter((p) => (tab === "video" ? p.stage === "Video Pitch" : p.stage === "Verification")).length === 0 ? (
        <p className="text-sm text-brand-slate">Nobody currently waiting on a call in this stage.</p>
      ) : (
        <div className="space-y-3">
          {people.filter((p) => (tab === "video" ? p.stage === "Video Pitch" : p.stage === "Verification")).map((p) => {
            const isExpanded = expandedEmail === p.email;
            const notes = notesByEmail[p.email] || [];
            return (
              <div key={p.email} className="bg-white rounded-xl border border-brand-line overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpand(p.email)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">{p.name}</p>
                    <p className="text-xs text-brand-slate">{p.email} - {p.phone} - {p.stage}</p>
                  </div>
                  <span className="text-xs text-brand-slate">
                    {notes.length > 0 ? `${notes.length} note(s)` : ""} {isExpanded ? "-" : "+"}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-brand-line pt-4">
                    <div className="space-y-2 mb-4">
                      {notes.length === 0 ? (
                        <p className="text-xs text-brand-slate">No call notes yet.</p>
                      ) : (
                        notes.map((n) => (
                          <div key={n.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <p className="text-brand-charcoal">{n.note}</p>
                            <p className="text-xs text-brand-slate mt-1">
                              {OUTCOME_LABELS[n.outcome] || n.outcome} - {n.author} - {formatShortDate(n.created_at)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <select
                      value={outcomeDraft}
                      onChange={(e) => setOutcomeDraft(e.target.value)}
                      className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-2"
                    >
                      <option value="called_answered">Called - Answered</option>
                      <option value="called_no_answer">Called - No Answer</option>
                      <option value="left_message">Left Message</option>
                    </select>
                    <textarea
                      rows={2}
                      placeholder="What happened on the call?"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-2"
                    />
                    <Button
                      variant="primary"
                      className="!px-4 !py-2 text-xs"
                      disabled={saving || !noteDraft.trim()}
                      onClick={() => handleAddNote(p.email)}
                    >
                      {saving ? "Saving..." : "Add Note"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

