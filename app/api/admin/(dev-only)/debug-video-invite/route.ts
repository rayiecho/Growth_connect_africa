import { NextRequest, NextResponse } from "next/server";
import { firestoreQuery, firestoreQueryOrdered } from "@/lib/firebase/firestore-rest";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const authedGET = withAdminAuth(async (req, session) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  try {
    const plainMatch = await firestoreQuery("applicants", [
      { field: "video_invite_sent_at", op: "EQUAL", value: null },
      { field: "video_invite_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
    ]);

    let orderedMatch: any[] = [];
    let orderedError: string | null = null;
    try {
      orderedMatch = await firestoreQueryOrdered(
        "applicants",
        [
          { field: "video_invite_sent_at", op: "EQUAL", value: null },
          { field: "video_invite_release_date", op: "LESS_THAN_OR_EQUAL", value: todayStr },
        ],
        "video_invite_release_date",
        "ASCENDING",
        500
      );
    } catch (err: any) {
      orderedError = err.message;
    }

    const sample = plainMatch.slice(0, 5).map((d) => {
      const a = d.data() as any;
      return {
        email: a.email,
        video_invite_sent_at: a.video_invite_sent_at,
        video_invite_release_date: a.video_invite_release_date,
        release_date_type: typeof a.video_invite_release_date,
      };
    });

    return NextResponse.json({
      todayStr,
      plainMatchCount: plainMatch.length,
      orderedMatchCount: orderedMatch.length,
      orderedError,
      sample,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Debug check failed." }, { status: 500 });
  }
});

export async function GET(req: NextRequest, context: unknown) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return authedGET(req, context);
}
