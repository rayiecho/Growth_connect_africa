"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";

export type VideoSubmission = {
  id: string;
  applicant_id: string;
  video_link: string;
  submitted_at: string;
  review_status: string;
  applicants: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

export function VideoSubmissionsTable({
  initialData,
}: {
  initialData: VideoSubmission[];
}) {
  const [submissions, setSubmissions] = useState(initialData);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = submissions.filter((s) => {
    const name = s.applicants
      ? `${s.applicants.first_name} ${s.applicants.last_name} ${s.applicants.email}`
      : "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Marks the video reviewed. Note: this does NOT yet trigger the verification
  // invite or the 5-day hold logic — that's the Phase 2 automation engine
  // (pg_cron), separate from this dashboard action. This just records the
  // reviewer's decision, same as approving in the old spreadsheet's
  // Video Submissions tab.
  async function updateStatus(id: string, status: "approved" | "rejected") {
    setUpdatingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("video_submissions")
      .update({
        review_status: status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    setUpdatingId(null);
    if (!error) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, review_status: status } : s))
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
              <th className="px-4 py-3 font-semibold">Video</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-brand-line">
                <td className="px-4 py-3">
                  {s.applicants
                    ? `${s.applicants.first_name} ${s.applicants.last_name}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-brand-slate">
                  {s.applicants?.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={s.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green font-medium hover:underline"
                  >
                    Watch
                  </a>
                </td>
                <td className="px-4 py-3 text-brand-slate">
                  {new Date(s.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${
                      s.review_status === "approved"
                        ? "bg-brand-green/10 text-brand-green-dark"
                        : s.review_status === "rejected"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-brand-slate"
                    }`}
                  >
                    {s.review_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      className="!px-4 !py-2 text-xs"
                      disabled={updatingId === s.id}
                      onClick={() => updateStatus(s.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      className="!px-4 !py-2 text-xs"
                      disabled={updatingId === s.id}
                      onClick={() => updateStatus(s.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-slate">
                  No video submissions match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
