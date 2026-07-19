import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdminSession } from "@/lib/firebase/session";

type AdminSession = NonNullable<Awaited<ReturnType<typeof getVerifiedAdminSession>>>;

type AdminRouteHandler<Context> = (
  req: NextRequest,
  session: AdminSession,
  context: Context
) => Promise<NextResponse> | NextResponse;

export function withAdminAuth<Context = unknown>(handler: AdminRouteHandler<Context>) {
  return async (req: NextRequest, context: Context): Promise<NextResponse> => {
    const session = await getVerifiedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, session, context);
  };
}
