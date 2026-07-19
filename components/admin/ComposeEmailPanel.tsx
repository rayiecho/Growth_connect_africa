"use client";

import { useState } from "react";

type SearchResult = {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
};

type Attachment = { name: string; url: string };

export function ComposeEmailPanel() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<Map<string, SearchResult>>(new Map());

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/search-user?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  function toggleSelect(person: SearchResult) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(person.id)) next.delete(person.id);
      else next.set(person.id, person);
      return next;
    });
  }

  function removeSelected(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-email-attachment", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAttachments((prev) => [...prev, { name: file.name, url: data.url }]);
      } else {
        setError(data.error || "Failed to upload attachment.");
      }
    } catch {
      setError("Network error uploading attachment.");
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSend() {
    setError(null);
    setMessage(null);

    const recipients = Array.from(selected.values()).map((p) => p.email);
    if (recipients.length === 0) {
      setError("Select at least one recipient.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setError("Subject and message body are required.");
      return;
    }

    setSending(true);
    try {
      const bodyHtml = body
        .split("\n")
        .map((line) => `<p style="margin:0 0 12px;">${line || "&nbsp;"}</p>`)
        .join("");

      const res = await fetch("/api/admin/compose-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, subject: subject.trim(), bodyHtml, attachments }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send email.");
      } else {
        setMessage(`Sent successfully to ${data.sentTo} recipient(s).`);
        setSelected(new Map());
        setSubject("");
        setBody("");
        setAttachments([]);
        setResults([]);
        setQuery("");
      }
    } catch {
      setError("Network error sending email.");
    }
    setSending(false);
  }

  const selectedList = Array.from(selected.values());

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-bold text-brand-charcoal mb-1">Compose Email</h2>
      <p className="text-sm text-brand-slate mb-6">Search for applicants or users, select one or more, then compose and send a custom email.</p>

      <div className="bg-white rounded-xl border border-brand-line p-5 mb-6">
        <h3 className="text-sm font-semibold text-brand-charcoal mb-3">1. Select Recipients</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 rounded-lg border border-brand-line px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="text-sm font-semibold rounded-lg px-4 py-2 bg-brand-green text-white hover:bg-brand-green-dark transition-colors disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="border border-brand-line rounded-lg divide-y divide-brand-line mb-4 max-h-64 overflow-y-auto">
            {results.map((r) => (
              <label key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggleSelect(r)}
                  className="rounded"
                />
                <span className="text-brand-charcoal">{r.first_name} {r.last_name}</span>
                <span className="text-brand-slate">{r.email}</span>
              </label>
            ))}
          </div>
        )}

        {selectedList.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-brand-charcoal mb-2">Selected ({selectedList.length}):</p>
            <div className="flex flex-wrap gap-2">
              {selectedList.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green-dark text-xs font-medium px-2.5 py-1 rounded-pill">
                  {p.email}
                  <button type="button" onClick={() => removeSelected(p.id)} className="ml-1 hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-brand-line p-5 mb-6">
        <h3 className="text-sm font-semibold text-brand-charcoal mb-3">2. Compose</h3>
        <input
          type="text"
          placeholder="Subject line"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-3"
        />
        <textarea
          placeholder="Write your message here..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-3"
        />

        <div className="mb-3">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-brand-green-dark cursor-pointer">
            <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            {uploading ? "Uploading..." : "+ Attach File"}
          </label>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-1 mb-3">
            {attachments.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 text-xs">
                <span className="text-brand-charcoal truncate">{a.name}</span>
                <button type="button" onClick={() => removeAttachment(i)} className="text-red-500 hover:underline shrink-0 ml-2">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {message && <p className="text-sm text-brand-green-dark mb-4">{message}</p>}

      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        className="text-sm font-semibold rounded-pill px-6 py-2.5 bg-brand-green text-white hover:bg-brand-green-dark transition-colors disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send Email"}
      </button>
    </div>
  );
}
