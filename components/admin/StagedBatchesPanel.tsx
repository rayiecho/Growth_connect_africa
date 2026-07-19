"use client";

import { useState, useEffect } from "react";

type Person = { id: string; name: string; email: string };
type Batch = {
  batchNumber: number;
  releaseDate: string;
  outcome?: string;
  template: string;
  whatsappLink?: string | null;
  people: Person[];
};
type LegacyBatch = {
  releaseDate: string;
  template: string;
  people: Person[];
};

const TEMPLATE_LABELS: Record<string, string> = {
  video_invite: "Video Pitch Invitation",
  video_approved: "Video Approved - Verification Invite",
  video_rejected: "Video Rejected",
  verification_approved: "Welcome to the Accelerator",
  verification_rejected: "Verification Rejected",
  legacy_welcome_accepted: "Legacy Batch - Welcome to the Program",
  legacy_update_id: "Legacy Batch - Update Your ID",
};

export function StagedBatchesPanel() {
  const [tab, setTab] = useState<"video_invites" | "video_decisions" | "verification_decisions" | "legacy">("video_invites");
  const [videoInvites, setVideoInvites] = useState<Batch[]>([]);
  const [videoDecisions, setVideoDecisions] = useState<Batch[]>([]);
  const [verificationDecisions, setVerificationDecisions] = useState<Batch[]>([]);
  const [legacyBatches, setLegacyBatches] = useState<LegacyBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/staged-batches");
      const data = res.ok ? await res.json() : null;
      if (!data) {
        setError("Failed to load staged batches.");
        setLoading(false);
        return;
      }
      setVideoInvites(data.videoInvites || []);
      setVideoDecisions(data.videoDecisions || []);
      setVerificationDecisions(data.verificationDecisions || []);
      setLegacyBatches(data.legacyBatches || []);
    } catch {
      setError("Network error loading staged batches.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const [addEmail, setAddEmail] = useState("");
  const [addTemplate, setAddTemplate] = useState("legacy_welcome_accepted");
  const [addDate, setAddDate] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addMessage, setAddMessage] = useState<string | null>(null);

  async function handleRemoveFromLegacy(applicantId: string) {
    if (!window.confirm("Remove this person from the staged batch?")) return;
    try {
      const res = await fetch("/api/admin/staged-legacy/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId }),
      });
      if (res.ok) loadData();
      else setError("Failed to remove from staged batch.");
    } catch {
      setError("Network error removing from staged batch.");
    }
  }

  async function handleAddToLegacy() {
    if (!addEmail.trim() || !addDate) {
      setAddMessage("Email and scheduled date are required.");
      return;
    }
    setAddSaving(true);
    setAddMessage(null);
    try {
      const res = await fetch("/api/admin/staged-legacy/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail.trim().toLowerCase(), template: addTemplate, scheduledDate: addDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddMessage(data.error || "Failed to add to staged batch.");
      } else {
        setAddMessage("Added successfully.");
        setAddEmail("");
        setAddDate("");
        loadData();
      }
    } catch {
      setAddMessage("Network error.");
    }
    setAddSaving(false);
  }

  const activeBatches =
    tab === "video_invites" ? videoInvites : tab === "video_decisions" ? videoDecisions : tab === "verification_decisions" ? verificationDecisions : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Staged for Send</h2>
        </div>
        <button type="button" onClick={loadData} className="text-xs text-brand-green font-medium hover:underline">
          Refresh
        </button>
      </div>

      <p className="text-sm text-brand-slate mb-6">
        Decisions and invites waiting for their scheduled email date. Once sent automatically, they disappear from here.
      </p>

      <div className="flex gap-6 border-b border-brand-line mb-6 flex-wrap">
        <button
          type="button"
          onClick={() => setTab("video_invites")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "video_invites" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Video Invites ({videoInvites.reduce((sum, b) => sum + b.people.length, 0)})
        </button>
        <button
          type="button"
          onClick={() => setTab("video_decisions")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "video_decisions" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Video Decisions ({videoDecisions.reduce((sum, b) => sum + b.people.length, 0)})
        </button>
        <button
          type="button"
          onClick={() => setTab("verification_decisions")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "verification_decisions" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Verification Decisions ({verificationDecisions.reduce((sum, b) => sum + b.people.length, 0)})
        </button>
        <button
          type="button"
          onClick={() => setTab("legacy")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "legacy" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Legacy Batch ({legacyBatches.reduce((sum, b) => sum + b.people.length, 0)})
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {tab === "legacy" && (
        <div className="bg-white rounded-xl border border-brand-line p-5 mb-6">
          <h3 className="text-sm font-semibold text-brand-charcoal mb-3">Add Person to Staged Batch</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
            <input
              type="email"
              placeholder="applicant@email.com"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              className="rounded-lg border border-brand-line px-3 py-2 text-sm sm:col-span-2"
            />
            <select
              value={addTemplate}
              onChange={(e) => setAddTemplate(e.target.value)}
              className="rounded-lg border border-brand-line px-3 py-2 text-sm"
            >
              <option value="legacy_welcome_accepted">Welcome to the Program</option>
              <option value="legacy_update_id">Update Your ID</option>
            </select>
            <input
              type="date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="rounded-lg border border-brand-line px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleAddToLegacy}
            disabled={addSaving}
            className="text-xs font-semibold rounded-pill px-4 py-2 bg-brand-green text-white hover:bg-brand-green-dark transition-colors disabled:opacity-50"
          >
            {addSaving ? "Adding..." : "Add to Batch"}
          </button>
          {addMessage && <p className="text-xs text-brand-slate mt-2">{addMessage}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : tab === "legacy" ? (
        legacyBatches.length === 0 ? (
          <p className="text-sm text-brand-slate">Nothing staged right now.</p>
        ) : (
          <div className="space-y-4">
            {legacyBatches.map((batch) => {
              const key = `legacy-${batch.releaseDate}-${batch.template}`;
              const isExpanded = expandedBatch === key;
              return (
                <div key={key} className="bg-white rounded-xl border border-brand-line overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedBatch(isExpanded ? null : key)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal">
                        Sending on <strong>{batch.releaseDate}</strong> - {batch.people.length} {batch.people.length === 1 ? "person" : "people"}
                      </p>
                      <p className="text-xs text-brand-slate mt-1">Template: {TEMPLATE_LABELS[batch.template] || batch.template}</p>
                    </div>
                    <span className="text-brand-slate text-lg">{isExpanded ? "-" : "+"}</span>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-brand-line pt-4">
                      <ul className="text-sm text-brand-slate space-y-2">
                        {batch.people.map((p) => (
                          <li key={p.id} className="flex items-center justify-between gap-2">
                            <span>{p.name} - {p.email}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromLegacy(p.id)}
                              className="text-xs text-red-500 hover:underline shrink-0"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : activeBatches.length === 0 ? (
        <p className="text-sm text-brand-slate">Nothing staged right now.</p>
      ) : (
        <div className="space-y-4">
          {activeBatches.map((batch) => {
            const key = `${tab}-${batch.batchNumber}-${batch.outcome ?? ""}`;
            const isExpanded = expandedBatch === key;
            return (
              <div key={key} className="bg-white rounded-xl border border-brand-line overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedBatch(isExpanded ? null : key)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">
                      Batch {batch.batchNumber}
                      {batch.outcome && (
                        <span className={`ml-2 text-xs rounded-pill px-2 py-0.5 ${
                          batch.outcome.toLowerCase() === "approved" ? "bg-brand-green/10 text-brand-green-dark" : "bg-red-50 text-red-600"
                        }`}>
                          {batch.outcome}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-brand-slate mt-1">
                      Sending on <strong>{batch.releaseDate}</strong> - {batch.people.length} {batch.people.length === 1 ? "person" : "people"} - Template: {TEMPLATE_LABELS[batch.template] || batch.template}
                    </p>
                  </div>
                  <span className="text-brand-slate text-lg">{isExpanded ? "-" : "+"}</span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-brand-line pt-4">
                    {batch.whatsappLink !== undefined && (
                      <p className="text-xs text-brand-slate mb-3">
                        WhatsApp link: {batch.whatsappLink ? (
                          <a href={batch.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">{batch.whatsappLink}</a>
                        ) : (
                          <span className="text-amber-600">Not set yet - set it in Video Submissions before this batch sends</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-brand-charcoal mb-2">People in this batch:</p>
                    <ul className="text-sm text-brand-slate space-y-1">
                      {batch.people.map((p) => (
                        <li key={p.id}>{p.name} - {p.email}</li>
                      ))}
                    </ul>
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



