"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import { parseUploadedFile } from "@/lib/engine/fileParser";
import type { Applicant } from "@/lib/db/types";

type PlatformUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  uploaded_at: string;
};

export function UsersPanel({ applicants }: { applicants: Applicant[] }) {
  const [localApplicants, setLocalApplicants] = useState(applicants);
  const [tab, setTab] = useState<"applicants" | "non-applicants">("applicants");
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [search, setSearch] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => setPlatformUsers(data.users || []))
      .catch(() => setPlatformUsers([]));
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploadResult(null);
    setUploadError(null);
    setParseError(null);

    try {
      const rows = await parseUploadedFile(file);
      const validRows = rows.filter((r) => r.email);
      if (validRows.length === 0) {
        setParseError("No rows with a recognizable email column were found in this file.");
        setParsedRows([]);
        return;
      }
      setParsedRows(validRows);
    } catch (err: any) {
      setParseError(`Failed to parse file: ${err.message}`);
      setParsedRows([]);
    }
  }

  async function handleUpload() {
    if (parsedRows.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    let rowsToSend = parsedRows;
    let batchId: string | undefined = undefined;
    const totals = { added: 0, skippedExistingApplicant: 0, skippedExistingUser: 0, skippedNoEmail: 0 };
    let round = 0;

    try {
      while (rowsToSend.length > 0) {
        round++;
        setUploadResult(`Uploading... round ${round}, ${rowsToSend.length} remaining in this round.`);

        const res = await fetch("/api/admin/users-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: rowsToSend, batchId }),
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          setUploadError(`Server error (status ${res.status}) partway through upload. ${totals.added} added so far.`);
          setUploading(false);
          return;
        }

        if (!res.ok) {
          setUploadError(data.error || "Upload failed partway through.");
          setUploading(false);
          return;
        }

        batchId = data.batchId;
        totals.added += data.added || 0;
        totals.skippedExistingApplicant += data.skippedExistingApplicant || 0;
        totals.skippedExistingUser += data.skippedExistingUser || 0;
        totals.skippedNoEmail += data.skippedNoEmail || 0;
        rowsToSend = data.remainingRows || [];
      }

      setUploadResult(
        `Added ${totals.added}. Skipped: ${totals.skippedExistingApplicant} already applicants, ${totals.skippedExistingUser} already uploaded, ${totals.skippedNoEmail} missing email.`
      );
      setParsedRows([]);
      setFileName("");

      const refreshed = await fetch("/api/admin/users");
      if (refreshed.ok) {
        const refreshedData = await refreshed.json();
        setPlatformUsers(refreshedData.users || []);
      }
    } catch {
      setUploadError(`Network error during upload. ${totals.added} added before the error.`);
    }
    setUploading(false);
  }

  const filteredApplicants = localApplicants.filter((a) =>
    `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = platformUsers.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Users</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-line p-6 mb-8">
        <h3 className="text-sm font-semibold text-brand-charcoal mb-2">Upload Non-Applicant Users</h3>
        <p className="text-sm text-brand-slate mb-4">
          Accepts CSV, TSV, XLSX, XLS, or JSON. Column order and naming don't matter -
          the system looks for name, email, and phone columns automatically. Existing
          applicants and previously uploaded users are skipped automatically.
        </p>
        <input
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls,.json"
          onChange={handleFile}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-pill file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-white file:font-medium hover:file:bg-brand-green-dark mb-4"
        />
        {fileName && parsedRows.length > 0 && (
          <p className="text-sm text-brand-slate mb-3">
            Parsed {parsedRows.length} rows with valid emails from {fileName}.
          </p>
        )}
        {parseError && <p className="text-sm text-red-500 mb-3">{parseError}</p>}
        {uploadError && <p className="text-sm text-red-500 mb-3">{uploadError}</p>}
        {uploadResult && <p className="text-sm text-brand-green-dark mb-3">{uploadResult}</p>}
        <Button variant="primary" disabled={parsedRows.length === 0 || uploading} onClick={handleUpload}>
          {uploading ? "Uploading..." : `Upload ${parsedRows.length || ""} Users`}
        </Button>
      </div>

      <div className="flex gap-6 border-b border-brand-line mb-6">
        <button
          type="button"
          onClick={() => setTab("applicants")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "applicants" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Applicants ({localApplicants.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("non-applicants")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "non-applicants" ? "border-brand-green text-brand-green-dark" : "border-transparent text-brand-slate"
          }`}
        >
          Non-Applicants ({platformUsers.length})
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <TextInput
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {tab === "applicants" ? (
        <UserTable
          collection="applicants"
          rows={filteredApplicants.map((a) => ({
            id: a.id,
            first_name: a.first_name,
            last_name: a.last_name,
            email: a.email,
            phone: a.phone || "-",
            date: a.date_applied,
          }))}
          onSaved={(id, fields) => {
            setLocalApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...fields } : a)));
          }}
        />
      ) : (
        <UserTable
          collection="platform_users"
          rows={filteredUsers.map((u) => ({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            phone: u.phone || "-",
            date: u.uploaded_at,
          }))}
          onSaved={(id, fields) => {
            setPlatformUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...fields } : u)));
          }}
          onDelete={async (id) => {
            if (!window.confirm("Permanently delete this non-applicant record?")) return;
            const res = await fetch("/api/admin/delete-platform-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: id }),
            });
            if (res.ok) {
              setPlatformUsers((prev) => prev.filter((u) => u.id !== id));
            }
          }}
        />
      )}
    </div>
  );
}

function UserTable({
  rows,
  collection,
  onSaved,
  onDelete,
}: {
  rows: { id: string; first_name: string; last_name: string; email: string; phone: string; date: string }[];
  collection: "applicants" | "platform_users";
  onSaved: (id: string, fields: Record<string, string>) => void;
  onDelete?: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ first_name: "", last_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(row: { id: string; first_name: string; last_name: string; phone: string }) {
    setEditingId(row.id);
    setDraft({ first_name: row.first_name, last_name: row.last_name, phone: row.phone === "-" ? "" : row.phone });
    setError(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/edit-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, id, fields: draft }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {
        setError(`Server error (status ${res.status}).`);
        setSaving(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to save.");
        setSaving(false);
        return;
      }
      onSaved(id, draft);
      setEditingId(null);
    } catch {
      setError("Network error saving details.");
    }
    setSaving(false);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-brand-line">
      {error && <p className="text-sm text-red-500 px-4 pt-3">{error}</p>}
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-brand-charcoal">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Phone</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isEditing = editingId === r.id;
            return (
              <tr key={r.id} className="border-t border-brand-line">
                {isEditing ? (
                  <>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <input className="w-20 rounded border border-brand-line px-2 py-1 text-sm" value={draft.first_name} onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))} placeholder="First" />
                        <input className="w-20 rounded border border-brand-line px-2 py-1 text-sm" value={draft.last_name} onChange={(e) => setDraft((d) => ({ ...d, last_name: e.target.value }))} placeholder="Last" />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-brand-slate">{r.email}</td>
                    <td className="px-4 py-2">
                      <input className="w-28 rounded border border-brand-line px-2 py-1 text-sm" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="Phone" />
                    </td>
                    <td className="px-4 py-2 text-brand-slate">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => saveEdit(r.id)} disabled={saving} className="text-xs text-brand-green font-medium hover:underline">
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="text-xs text-brand-slate hover:underline">
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-brand-charcoal font-medium">{r.first_name} {r.last_name}</td>
                    <td className="px-4 py-3 text-brand-slate">{r.email}</td>
                    <td className="px-4 py-3 text-brand-slate">{r.phone}</td>
                    <td className="px-4 py-3 text-brand-slate">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button type="button" onClick={() => startEdit(r)} className="text-xs text-brand-green font-medium hover:underline">
                          Edit
                        </button>
                        {onDelete && (
                          <button type="button" onClick={() => onDelete(r.id)} className="text-xs text-red-600 font-medium hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-brand-slate">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

