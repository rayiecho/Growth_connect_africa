"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { RichEmailEditor } from "@/components/admin/RichEmailEditor";

type Template = {
  id: string;
  name: string;
  variables: string[];
  subject: string;
  body_html: string;
  customized: boolean;
};

export function EmailTemplatesPanel() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [bodyDraft, setBodyDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadTemplates() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const data = res.ok ? await res.json() : { templates: [] };
      setTemplates(data.templates || []);
    } catch {
      setError("Failed to load templates.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  function selectTemplate(t: Template) {
    setSelectedId(t.id);
    setSubjectDraft(t.subject);
    setBodyDraft(t.body_html);
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/email-templates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedId, subject: subjectDraft, body_html: bodyDraft }),
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
      setMessage("Saved. This template will now be used for future emails.");
      await loadTemplates();
    } catch {
      setError("Network error. Please try again.");
    }
    setSaving(false);
  }

  async function handleReset() {
    if (!selectedId) return;
    if (!window.confirm("Reset this template back to the default content? Your customization will be lost.")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/email-templates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedId, reset: true }),
      });
      if (res.ok) {
        setMessage("Reset to default.");
        await loadTemplates();
        const refreshed = await fetch("/api/admin/email-templates").then((r) => r.json());
        const updated = refreshed.templates.find((t: Template) => t.id === selectedId);
        if (updated) {
          setSubjectDraft(updated.subject);
          setBodyDraft(updated.body_html);
        }
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSaving(false);
  }

  const selected = templates.find((t) => t.id === selectedId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="brand-eyebrow-line" />
          <h2 className="text-xl font-bold text-brand-charcoal">Email Templates</h2>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-brand-slate">Loading...</p>
      ) : !selected ? (
        <div className="space-y-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTemplate(t)}
              className="w-full text-left bg-white border border-brand-line rounded-xl p-5 hover:border-brand-green transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-brand-charcoal">{t.name}</p>
                <p className="text-xs text-brand-slate mt-1">{t.subject}</p>
              </div>
              {t.customized && (
                <span className="text-xs bg-brand-green/10 text-brand-green-dark rounded-pill px-3 py-1 font-medium">
                  Customized
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-sm text-brand-green font-medium hover:underline mb-4"
          >
            &larr; Back to all templates
          </button>

          <div className="bg-white border border-brand-line rounded-xl p-6">
            <h3 className="text-lg font-bold text-brand-charcoal mb-1">{selected.name}</h3>
            {selected.variables.length > 0 && (
              <p className="text-xs text-brand-slate mb-4">
                Available placeholders: {selected.variables.map((v) => `{{${v}}}`).join(", ")}
              </p>
            )}

            <label className="block text-xs font-semibold text-brand-charcoal mb-1 mt-4">Subject Line</label>
            <input
              type="text"
              value={subjectDraft}
              onChange={(e) => setSubjectDraft(e.target.value)}
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />

            <label className="block text-xs font-semibold text-brand-charcoal mb-1">Email Body</label>
            <p className="text-xs text-brand-slate mb-2">
              Use the toolbar to format your email visually - no HTML knowledge needed.
            </p>
            <div className="mb-4">
              <RichEmailEditor value={bodyDraft} onChange={setBodyDraft} />
            </div>

            {message && <p className="text-sm text-brand-green-dark mb-3">{message}</p>}
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <div className="flex gap-3">
              <Button variant="primary" disabled={saving} onClick={handleSave}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {selected.customized && (
                <Button variant="secondary" disabled={saving} onClick={handleReset} className="!border-red-300 !text-red-600">
                  Reset to Default
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

