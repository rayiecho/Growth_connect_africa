"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

export type Applicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  current_stage: string;
  current_status: string;
  date_applied: string;
  industry: string | null;
  other_industry: string | null;
  business_name: string | null;
  business_stage: string | null;
  business_description: string | null;
  problem_solved: string | null;
  target_customers: string | null;
  business_registered: string | null;
  generates_revenue: string | null;
  revenue_progress: string | null;
  growth_potential: string | null;
  long_term_vision: string | null;
  use_of_funds: string | null;
  biggest_challenges: string | null;
  attend_lagos_event: string | null;
  why_considered: string | null;
  commitment_confirmed: boolean | null;
  disclaimers_accepted: boolean | null;
  state_country: string | null;
  age_range: string | null;
  gender: string | null;
  linkedin: string | null;
  business_social: string | null;
  assigned_reviewer: string | null;
  notes: string | null;
  next_action_required: string | null;
  // Response scheduling fields
  admin_response: string | null;
  email_response_status: string | null;
  scheduled_send_date: string | null;
  // Video invite tracking
  video_invite_window: string | null;
};

export function ApplicantTable({ initialData }: { initialData: Applicant[] }) {
  const [applicants, setApplicants] = useState(initialData);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  const filtered = applicants.filter((a) =>
    `${a.first_name} ${a.last_name} ${a.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function updateAdminFields(
    id: string,
    fields: { assigned_reviewer?: string; notes?: string; next_action_required?: string }
  ) {
    setSavingNotesId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("applicants")
      .update({ ...fields, last_updated: new Date().toISOString() })
      .eq("id", id);

    setSavingNotesId(null);
    if (!error) {
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...fields } : a))
      );
    }
  }

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <TextInput
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-brand-line">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-brand-charcoal">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Video Invite</th>
              <th className="px-4 py-3 font-semibold">Response</th>
              <th className="px-4 py-3 font-semibold">Applied</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const isExpanded = expandedId === a.id;
              return (
                <>
                  <tr key={a.id} className="border-t border-brand-line">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                        className="text-brand-charcoal font-medium hover:text-brand-green text-left"
                      >
                        {isExpanded ? "▾ " : "▸ "}
                        {a.first_name} {a.last_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">{a.email}</td>
                    <td className="px-4 py-3">{a.current_stage}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${
                          a.current_status === "Active"
                            ? "bg-brand-green/10 text-brand-green-dark"
                            : a.current_status === "Rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-brand-slate"
                        }`}
                      >
                        {a.current_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <VideoInviteStatus window={a.video_invite_window} />
                    </td>
                    <td className="px-4 py-3">
                      <ResponseStatusBadge status={a.email_response_status} />
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {new Date(a.date_applied).toLocaleDateString()}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${a.id}-details`} className="border-t border-brand-line">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* LEFT: Application Details */}
                          <div>
                            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wide mb-4">
                              Application Details
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5 text-sm">
                              <Detail label="Phone" value={a.phone} />
                              <Detail label="State/Country" value={a.state_country} />
                              <Detail label="Age Range" value={a.age_range} />
                              <Detail label="Gender" value={a.gender} />
                              <Detail label="LinkedIn" value={a.linkedin} />
                              <Detail label="Business Social" value={a.business_social} />
                              <Detail label="Business Name" value={a.business_name} />
                              <Detail label="Business Stage" value={a.business_stage} />
                              <Detail label="Industry" value={a.industry} />
                              <Detail label="Target Customers" value={a.target_customers} />
                              <Detail label="Business Registered" value={a.business_registered} />
                              <Detail label="Generates Revenue" value={a.generates_revenue} />
                              <Detail label="Attend Lagos Event" value={a.attend_lagos_event} />
                              <Detail
                                label="Commitment Confirmed"
                                value={a.commitment_confirmed ? "Yes" : "No"}
                              />
                              <Detail
                                label="Disclaimers Accepted"
                                value={a.disclaimers_accepted ? "Yes" : "No"}
                              />
                            </div>

                            <LongField label="Business Description" value={a.business_description} />
                            <LongField label="Problem Solved" value={a.problem_solved} />
                            <LongField label="Revenue Progress" value={a.revenue_progress} />
                            <LongField label="Growth Potential" value={a.growth_potential} />
                            <LongField label="Long-Term Vision" value={a.long_term_vision} />
                            <LongField label="Use of Funds" value={a.use_of_funds} />
                            <LongField label="Biggest Challenges" value={a.biggest_challenges} />
                            <LongField label="Why Considered" value={a.why_considered} />

                            <AdminFieldsEditor
                              applicant={a}
                              saving={savingNotesId === a.id}
                              onSave={(fields) => updateAdminFields(a.id, fields)}
                            />
                          </div>

                          {/* RIGHT: Response Panel */}
                          <div className="border-l border-brand-line pl-8">
                            <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wide mb-4">
                              Applicant Response
                            </h3>
                            <ResponsePanel applicant={a} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-slate">
                  No applicants match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Status badges ─────────────────────────────────────────────────────────────

function VideoInviteStatus({ window }: { window: string | null }) {
  if (!window) {
    return <span className="text-xs text-gray-400">—</span>;
  }
  return (
    <span className="inline-block rounded-pill bg-blue-50 text-blue-600 px-2 py-0.5 text-xs font-medium">
      {window === "tue" ? "Tue invite" : "Fri invite"}
    </span>
  );
}

function ResponseStatusBadge({ status }: { status: string | null }) {
  if (!status || status === "pending") {
    return <span className="text-xs text-gray-400">—</span>;
  }
  if (status === "queued") {
    return (
      <span className="inline-block rounded-pill bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">
        Queued
      </span>
    );
  }
  if (status === "sent") {
    return (
      <span className="inline-block rounded-pill bg-brand-green/10 text-brand-green-dark px-2 py-0.5 text-xs font-medium">
        Sent
      </span>
    );
  }
  return null;
}

// ── Detail helpers ───────────────────────────────────────────────────────────

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">{label}</p>
      <p className="text-brand-slate">{value || "—"}</p>
    </div>
  );
}

function LongField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1 mb-5">
      <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">{label}</p>
      <p className="text-brand-slate whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

// ── Admin Notes Editor ────────────────────────────────────────────────────────

function AdminFieldsEditor({
  applicant,
  saving,
  onSave,
}: {
  applicant: Applicant;
  saving: boolean;
  onSave: (fields: { assigned_reviewer?: string; notes?: string; next_action_required?: string }) => void;
}) {
  const [reviewer, setReviewer] = useState(applicant.assigned_reviewer ?? "");
  const [notes, setNotes] = useState(applicant.notes ?? "");
  const [nextAction, setNextAction] = useState(applicant.next_action_required ?? "");

  return (
    <div className="border-t border-brand-line pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
          Assigned Reviewer
        </p>
        <TextInput value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
      </div>
      <div>
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
          Next Action Required
        </p>
        <TextInput value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
      </div>
      <div className="md:col-span-3">
        <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
          Notes
        </p>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
        />
      </div>
      <div>
        <Button
          variant="primary"
          className="!px-4 !py-2 text-xs"
          disabled={saving}
          onClick={() =>
            onSave({ assigned_reviewer: reviewer, notes, next_action_required: nextAction })
          }
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── Response Panel ─────────────────────────────────────────────────────────────

type ScheduleDay = "tuesday" | "friday";

function ResponsePanel({ applicant }: { applicant: Applicant }) {
  const [response, setResponse] = useState(applicant.admin_response ?? "");
  const [scheduleDay, setScheduleDay] = useState<ScheduleDay>("tuesday");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success"; msg: string } | { type: "error"; msg: string } | null>(null);

  async function saveAndQueue() {
    if (!response.trim()) {
      setFeedback({ type: "error", msg: "Write a response before queuing." });
      return;
    }
    if (!window.confirm(`Queue this response to send on ${scheduleDay === "tuesday" ? "Tuesday" : "Friday"}?`)) return;

    setSavingId(applicant.id);
    setFeedback(null);
    const supabase = createClient();
    const scheduledDate = getNextDateForDay(scheduleDay);

    const { error } = await supabase
      .from("applicants")
      .update({
        admin_response: response.trim(),
        email_response_status: "queued",
        scheduled_send_date: scheduledDate,
        last_updated: new Date().toISOString(),
      })
      .eq("id", applicant.id);

    setSavingId(null);

    if (error) {
      setFeedback({ type: "error", msg: "Failed to save. Try again." });
    } else {
      setFeedback({
        type: "success",
        msg: `Queued — will send on ${scheduleDay === "tuesday" ? "Tuesday" : "Friday"} (${new Date(scheduledDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}).`,
      });
    }
  }

  async function clearQueue() {
    if (!window.confirm("Remove this response from the queue?")) return;
    setSavingId(applicant.id);
    const supabase = createClient();
    await supabase
      .from("applicants")
      .update({ email_response_status: "pending", scheduled_send_date: null, last_updated: new Date().toISOString() })
      .eq("id", applicant.id);
    setSavingId(null);
    setFeedback({ type: "success", msg: "Removed from queue." });
  }

  const isSent = applicant.email_response_status === "sent";
  const isQueued = applicant.email_response_status === "queued";

  return (
    <div className="space-y-4">
      {isSent && (
        <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg px-4 py-2 text-sm text-brand-green-dark">
          ✅ Response sent on {applicant.scheduled_send_date ? new Date(applicant.scheduled_send_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
        </div>
      )}
      {isQueued && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700">
          🕐 Queued for {applicant.scheduled_send_date ? new Date(applicant.scheduled_send_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
          Your Response
        </label>
        <textarea
          rows={8}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write a personalised response to the applicant…"
          className="w-full rounded-lg border border-brand-line px-4 py-3 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-y"
        />
        <p className="text-xs text-brand-slate mt-1">
          {response.trim() ? `${response.trim().length} characters` : "No response written yet"}
        </p>
      </div>

      {!isSent && (
        <div>
          <p className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide mb-2">Send On</p>
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name={`schedule-${applicant.id}`} value="tuesday" checked={scheduleDay === "tuesday"} onChange={() => setScheduleDay("tuesday")} className="peer sr-only" />
              <div className={`border rounded-lg px-4 py-2 text-center text-sm font-medium transition-all peer-checked:border-brand-green peer-checked:bg-brand-green/5 peer-checked:text-brand-green-dark ${scheduleDay === "tuesday" ? "border-brand-green bg-brand-green/5 text-brand-green-dark" : "border-brand-line text-brand-slate"}`}>
                Tuesday
                <span className="block text-xs font-normal mt-0.5">{getNextDateForDayLabel("tuesday")}</span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name={`schedule-${applicant.id}`} value="friday" checked={scheduleDay === "friday"} onChange={() => setScheduleDay("friday")} className="peer sr-only" />
              <div className={`border rounded-lg px-4 py-2 text-center text-sm font-medium transition-all peer-checked:border-brand-green peer-checked:bg-brand-green/5 peer-checked:text-brand-green-dark ${scheduleDay === "friday" ? "border-brand-green bg-brand-green/5 text-brand-green-dark" : "border-brand-line text-brand-slate"}`}>
                Friday
                <span className="block text-xs font-normal mt-0.5">{getNextDateForDayLabel("friday")}</span>
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!isSent && (
          <Button variant="primary" disabled={savingId === applicant.id} onClick={saveAndQueue}>
            {savingId === applicant.id ? "Saving…" : isQueued ? "Update Queue" : "Save & Queue"}
          </Button>
        )}
        {isQueued && !isSent && (
          <Button variant="secondary" disabled={savingId === applicant.id} onClick={clearQueue}>
            Remove from Queue
          </Button>
        )}
      </div>

      {feedback && (
        <p className={`text-sm ${feedback.type === "error" ? "text-red-600" : "text-brand-green-dark"}`}>
          {feedback.msg}
        </p>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getNextDateForDay(day: ScheduleDay): string {
  const targetDay = day === "tuesday" ? 2 : 5;
  const today = new Date();
  const todayDay = today.getDay();
  let daysToAdd: number;

  if (todayDay === targetDay) {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }
  if (todayDay < targetDay) {
    daysToAdd = targetDay - todayDay;
  } else {
    daysToAdd = 7 - todayDay + targetDay;
  }
  const result = new Date(today);
  result.setDate(result.getDate() + daysToAdd);
  return result.toISOString().slice(0, 10);
}

function getNextDateForDayLabel(day: ScheduleDay): string {
  const dateStr = getNextDateForDay(day);
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
