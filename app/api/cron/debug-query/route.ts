import { NextRequest, NextResponse } from "next/server";
import { firestoreQueryOrdered } from "@/lib/firebase/rest-admin";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const out: any = {};

  try {
    const onlyNull = await firestoreQueryOrdered(
      "applicants",
      [{ field: "video_invite_sent_at", op: "EQUAL", value: null }],
      "video_invite_release_date",
      "ASCENDING",
      100
    );
    out.onlyNullFilter = { count: onlyNull.length, ids: onlyNull.map(d => d.id) };
  } catch (err: any) {
    out.onlyNullFilter = { error: err.message };
  }

  try {
    const onlyDate = await firestoreQueryOrdered(
      "applicants",
      [{ field: "video_invite_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr }],
      "video_invite_release_date",
      "ASCENDING",
      100
    );
    out.onlyDateFilter = { count: onlyDate.length, ids: onlyDate.map(d => d.id) };
  } catch (err: any) {
    out.onlyDateFilter = { error: err.message };
  }

  try {
    const both = await firestoreQueryOrdered(
      "applicants",
      [
        { field: "video_invite_sent_at", op: "EQUAL", value: null },
        { field: "video_invite_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
      ],
      "video_invite_release_date",
      "ASCENDING",
      100
    );
    out.bothFilters = { count: both.length, ids: both.map(d => d.id) };
  } catch (err: any) {
    out.bothFilters = { error: err.message };
  }

  return NextResponse.json(out);
}
