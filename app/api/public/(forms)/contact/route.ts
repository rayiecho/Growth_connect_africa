import { NextResponse } from "next/server";
import { d1Add } from "@/lib/db/d1-admin";
import { withRateLimit } from "@/lib/engine/withRateLimit";

export const POST = withRateLimit({ key: "contact", maxRequests: 10, windowSeconds: 3600 })(async (req) => {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const message = (body.message || "").trim();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    await d1Add("contact_messages", {
      name,
      email,
      message,
      status: "new",
      submitted_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("contact submission failed:", err);
    return NextResponse.json({ error: "Something went wrong sending your message. Please try again." }, { status: 500 });
  }
});
