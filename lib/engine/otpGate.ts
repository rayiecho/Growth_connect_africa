import { d1Query } from "@/lib/db/d1-admin";

export async function hasRecentOtpVerification(email: string): Promise<boolean> {
  const now = new Date().toISOString();
  const rows = await d1Query("email_otps", [
    { field: "email", op: "EQUAL", value: email },
    { field: "verified", op: "EQUAL", value: true },
    { field: "expires_at", op: "GREATER_THAN", value: now },
  ]);
  return rows.length > 0;
}
