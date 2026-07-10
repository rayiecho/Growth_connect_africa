import { NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { firestoreGetAll } from "@/lib/firebase/rest-admin";

export async function GET() {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const docs = await firestoreGetAll("platform_users");
    return NextResponse.json({
      users: docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    console.error("users fetch failed:", err);
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}
