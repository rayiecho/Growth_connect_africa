"use client";

import { useRef, useState } from "react";

export function RichEmailEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [uploading, setUploading] = useState(false);

  function exec(command: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function handleInput() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function insertHeading() {
    exec("formatBlock", "<h3>");
  }

  function insertParagraph() {
    exec("formatBlock", "<p>");
  }

  function insertBulletList() {
    exec("insertUnorderedList");
  }

  function insertHighlight() {
    exec("hiliteColor", "#FEF08A");
  }

  function insertButton() {
    const url = window.prompt("Enter the link URL:");
    if (!url) return;
    const label = window.prompt("Enter the button text:", "Click Here") || "Click Here";
    const html = `<table cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td style="background:#31ad7c;border-radius:8px;"><a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${label}</a></td></tr></table>`;
    document.execCommand("insertHTML", false, html);
    handleInput();
  }

  function insertLink() {
    const url = window.prompt("Enter the link URL:");
    if (!url) return;
    exec("createLink", url);
  }

  async function handleAttachFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-email-attachment", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const html = `<p style="margin:0 0 16px;"><a href="${data.url}" style="color:#31ad7c;font-weight:bold;">${file.name}</a></p>`;
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, html);
        handleInput();
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch {
      alert("Upload failed.");
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="border border-brand-line rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 bg-gray-50 border-b border-brand-line p-2">
        <button type="button" onClick={insertHeading} className="px-3 py-1.5 text-xs font-bold rounded hover:bg-gray-200" title="Heading">H</button>
        <button type="button" onClick={insertParagraph} className="px-3 py-1.5 text-xs font-medium rounded hover:bg-gray-200" title="Paragraph">P</button>
        <div className="w-px bg-brand-line mx-1" />
        <button type="button" onClick={() => exec("bold")} className="px-3 py-1.5 text-xs font-bold rounded hover:bg-gray-200" title="Bold">B</button>
        <button type="button" onClick={() => exec("italic")} className="px-3 py-1.5 text-xs italic rounded hover:bg-gray-200" title="Italic">I</button>
        <button type="button" onClick={insertHighlight} className="px-3 py-1.5 text-xs rounded hover:bg-gray-200 bg-yellow-100" title="Highlight">Highlight</button>
        <div className="w-px bg-brand-line mx-1" />
        <button type="button" onClick={insertBulletList} className="px-3 py-1.5 text-xs rounded hover:bg-gray-200" title="Bullet List">List</button>
        <button type="button" onClick={insertLink} className="px-3 py-1.5 text-xs rounded hover:bg-gray-200" title="Insert Link">Link</button>
        <button type="button" onClick={insertButton} className="px-3 py-1.5 text-xs rounded hover:bg-gray-200 bg-brand-green/10 text-brand-green-dark font-medium" title="Insert Button">+ Button</button>
        <div className="w-px bg-brand-line mx-1" />
        <label className="px-3 py-1.5 text-xs rounded hover:bg-gray-200 cursor-pointer font-medium">
          {uploading ? "Uploading..." : "+ Attach File"}
          <input type="file" onChange={handleAttachFile} className="hidden" disabled={uploading} />
        </label>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 text-sm text-brand-charcoal focus:outline-none"
      />
    </div>
  );
}
