import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreAdd } from "@/lib/firebase/rest-admin";

export async function POST(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows array is required." }, { status: 400 });
  }

  const results = { added: 0, skipped: 0, errors: [] as string[] };

  for (const row of rows) {
    const email = (row.email || "").trim().toLowerCase();
    if (!email) {
      results.skipped++;
      continue;
    }
    try {
      await firestoreAdd("platform_users", {
        first_name: row.first_name || row.firstname || row.name || "",
        last_name: row.last_name || row.lastname || "",
        email,
        phone: row.phone || row.phone_number || "",
        source: "csv_upload",
        is_applicant: false,
        uploaded_at: new Date().toISOString(),
      });
      results.added++;
    } catch (err: any) {
      results.errors.push(`${email}: ${err.message}`);
    }
  }

  return NextResponse.json({ success: true, ...results });
}
