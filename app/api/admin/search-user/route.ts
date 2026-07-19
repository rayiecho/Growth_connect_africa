import { NextResponse } from "next/server";
import { d1Query, d1QueryOrdered, normalizeApplicant } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const SEARCH_SCAN_LIMIT = 300;

export const GET = withAdminAuth(async (req, session) => {
  const query = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (!query) return NextResponse.json({ results: [] });
  try {
    if (query.includes("@") && query.includes(".")) {
      const exactMatch = await d1Query("applicants", [{ field: "email", op: "EQUAL", value: query }]);
      if (exactMatch.length > 0) {
        return NextResponse.json({ results: exactMatch.map((d) => normalizeApplicant({ id: d.id, ...d.data() })) });
      }
    }
    const docs = await d1QueryOrdered("applicants", [], "date_applied", "DESCENDING", SEARCH_SCAN_LIMIT);
    const applicants = docs.map((d) => normalizeApplicant({ id: d.id, ...d.data() })) as any[];
    const results = applicants.filter((a) => {
      const haystack = `${a.first_name || ""} ${a.last_name || ""} ${a.email || ""} ${a.phone || ""} ${a.lpx_id || ""}`.toLowerCase();
      return haystack.includes(query);
    });
    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (err) {
    console.error("search-user failed:", err);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
});

