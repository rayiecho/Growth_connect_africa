import { NextResponse } from "next/server";
import { d1UpdateById } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const ALLOWED_FIELDS = ["first_name", "last_name", "email", "phone", "business_name"];

export const POST = withAdminAuth(async (req, session) => {
  const { collection, id, fields } = await req.json();
  if (!collection || !id || !fields || typeof fields !== "object") {
    return NextResponse.json({ error: "collection, id, and fields are required." }, { status: 400 });
  }
  if (!["applicants", "platform_users"].includes(collection)) {
    return NextResponse.json({ error: "Invalid collection." }, { status: 400 });
  }
  const updateFields: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (fields[key] !== undefined) updateFields[key] = String(fields[key]).trim();
  }
  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }
  try {
    await d1UpdateById(collection, id, updateFields);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("edit-user failed:", err);
    return NextResponse.json({ error: "Failed to update details." }, { status: 500 });
  }
});
