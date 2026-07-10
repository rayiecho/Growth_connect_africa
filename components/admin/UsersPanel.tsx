"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Input";
import type { Applicant } from "@/lib/firebase/types";

type PlatformUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_applicant: boolean;
  source: string;
  uploaded_at: string;
};

export function UsersPanel({ applicants }: { applicants: Applicant[] }) {
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [search, setSearch] = useState("");
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => setPlatformUsers(data.users || []))
      .catch(() => setPlatformUsers([]));
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploadResult(null);
    setUploadError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvRows(results.data as any[]);
      },
      error: (err) => {
        setUploadError(`Failed to parse CSV: ${err.message}`);
      },
    });
  }

  async function handleUpload() {
    if (csvRows.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const res = await fetch("/api/admin/users-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: csvRows }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setUploadError(`Server error (status ${res.status}).`);
        setUploading(false);
        return;
      }

      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
        setUploading(false);
        return;
      }

      setUploadResult(`Added ${data.added}, skipped ${data.skipped}${data.errors?.length ? `, ${data.errors.length} errors` : ""}.`);
      setCsvRows([]);
      setFileName("");

      const refreshed = await fetch("/api/admin/users");
      if (refreshed.ok) {
        const refreshedData = await refreshed.json();
        setPlatformUsers(refreshedData.users || []);
      }
    } catch (err) {
      setUploadError("Network error during upload.");
    }
    setUploading(false);
  }

  const combined = [
    ...applicants.map((a) => ({
      id: a.id,
      first_name: a.first_name,
      last_name: a.last_name,
      email: a.email,
      phone: a.phone || "-",
      type: "Applicant",
      date: a.date_applied,
    })),
    ...platformUsers.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone || "-",
      type: "Non-Applicant",
      date: u.uploaded_at,
    })),
  ];

  const filtered = combined.filter((u) =>
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
        <h3 className="text-sm font-semibold text-brand-charcoal mb-2">Upload Non-Applicant Users (CSV)</h3>
        <p className="text-sm text-brand-slate mb-4">
          CSV should include columns like: first_name, last_name, email, phone.
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-sm text-brand-slate file:mr-4 file:rounded-pill file:border-0 file:bg-brand-green file:px-4 file:py-2 file:text-white file:font-medium hover:file:bg-brand-green-dark mb-4"
        />
        {fileName && csvRows.length > 0 && (
          <p className="text-sm text-brand-slate mb-3">
            Parsed {csvRows.length} rows from {fileName}.
          </p>
        )}
        {uploadError && <p className="text-sm text-red-500 mb-3">{uploadError}</p>}
        {uploadResult && <p className="text-sm text-brand-green-dark mb-3">{uploadResult}</p>}
        <Button variant="primary" disabled={csvRows.length === 0 || uploading} onClick={handleUpload}>
          {uploading ? "Uploading..." : `Upload ${csvRows.length || ""} Users`}
        </Button>
      </div>

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
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={`${u.type}-${u.id}`} className="border-t border-brand-line">
                <td className="px-4 py-3 text-brand-charcoal font-medium">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-brand-slate">{u.email}</td>
                <td className="px-4 py-3 text-brand-slate">{u.phone}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-pill px-3 py-1 text-xs font-medium ${
                      u.type === "Applicant" ? "bg-brand-green/10 text-brand-green-dark" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {u.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-slate">
                  {u.date ? new Date(u.date).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-slate">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


