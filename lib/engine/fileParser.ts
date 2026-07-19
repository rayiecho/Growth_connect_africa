// lib/engine/fileParser.ts
// Parses CSV, TSV, XLSX, XLS, or JSON files client-side and normalizes
// whatever column names are used into { first_name, last_name, email, phone }.

const FIELD_PATTERNS: Record<string, RegExp> = {
  email: /^(e[-_ ]?mail|email[-_ ]?address)$/i,
  first_name: /^(first[-_ ]?name|fname|given[-_ ]?name|name)$/i,
  last_name: /^(last[-_ ]?name|lname|surname|family[-_ ]?name)$/i,
  phone: /^(phone|phone[-_ ]?number|mobile|tel|telephone|contact[-_ ]?number)$/i,
};

function normalizeRow(raw: Record<string, any>): { first_name: string; last_name: string; email: string; phone: string } {
  const out = { first_name: "", last_name: "", email: "", phone: "" };
  for (const key in raw) {
    const trimmedKey = key.trim();
    for (const field in FIELD_PATTERNS) {
      if (FIELD_PATTERNS[field].test(trimmedKey)) {
        (out as any)[field] = String(raw[key] ?? "").trim();
        break;
      }
    }
  }
  // "name" pattern above may have matched full name into first_name if no explicit first/last columns exist.
  // If first_name looks like a full name (has a space) and last_name is empty, split it.
  if (out.first_name.includes(" ") && !out.last_name) {
    const parts = out.first_name.split(" ");
    out.first_name = parts[0];
    out.last_name = parts.slice(1).join(" ");
  }
  return out;
}

export async function parseUploadedFile(file: File): Promise<Record<string, any>[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "json") {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : parsed.rows || parsed.data || [];
    return rows.map((r: any) => normalizeRow(r));
  }

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
    return (rows as any[]).map((r) => normalizeRow(r));
  }

  // Default: CSV, TSV, TXT - parsed with Papa (auto-detects delimiter)
  const Papa = (await import("papaparse")).default;
  const text = await file.text();
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  return (result.data as any[]).map((r) => normalizeRow(r));
}
