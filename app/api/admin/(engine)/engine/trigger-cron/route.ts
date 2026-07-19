import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const VALID_ENDPOINTS = [
  "video-invite-batch",
  "video-outcome-batch",
  "verification-outcome-batch",
  "video-reminder-batch",
  "verification-reminder-batch",
  "non-applicant-followup",
  "legacy-batch-send",
];

export const POST = withAdminAuth(async (req, session) => {
  const { endpoint } = await req.json();
  if (!VALID_ENDPOINTS.includes(endpoint)) {
    return NextResponse.json({ error: "Invalid cron endpoint." }, { status: 400 });
  }

  const secret = process.env.CRON_SECRET;
  const url = `${req.nextUrl.origin}/api/cron/${endpoint}?secret=${secret}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json({ success: res.ok, result: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to trigger cron." }, { status: 500 });
  }
});
