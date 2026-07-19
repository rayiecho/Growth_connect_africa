import { NextResponse } from "next/server";
import { d1GetAll } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

export const GET = withAdminAuth(async (req, session) => {
  try {
    const docs = await d1GetAll("application_funnel_events");
    const events = docs.map((d) => d.data()) as any[];

    const bySession: Record<string, any[]> = {};
    for (const e of events) {
      if (!bySession[e.session_id]) bySession[e.session_id] = [];
      bySession[e.session_id].push(e);
    }

    const sessions = Object.values(bySession);
    const totalVisits = sessions.length;

    let startedCount = 0;
    let submittedCount = 0;
    const dropOffByStep: Record<number, number> = {};
    const errorCounts: Record<string, number> = {};

    for (const sessionEvents of sessions) {
      const hasStepReached = sessionEvents.some((e) => e.event === "step_reached");
      const hasSubmitSuccess = sessionEvents.some((e) => e.event === "submit_success");

      if (hasStepReached) startedCount++;
      if (hasSubmitSuccess) submittedCount++;

      if (!hasSubmitSuccess) {
        const maxStep = Math.max(
          0,
          ...sessionEvents.filter((e) => e.step !== null && e.step !== undefined).map((e) => e.step)
        );
        dropOffByStep[maxStep] = (dropOffByStep[maxStep] || 0) + 1;
      }

      for (const e of sessionEvents) {
        if (["otp_verify_failed", "submit_error", "submit_blocked", "validation_blocked"].includes(e.event)) {
          const key = e.detail ? `${e.event}: ${e.detail}` : e.event;
          errorCounts[key] = (errorCounts[key] || 0) + 1;
        }
      }
    }

    const errorBreakdown = Object.entries(errorCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const dropOffBreakdown = Object.entries(dropOffByStep)
      .map(([step, count]) => ({ step: Number(step), count }))
      .sort((a, b) => a.step - b.step);

    return NextResponse.json({
      totalVisits,
      startedCount,
      submittedCount,
      completionRate: totalVisits > 0 ? Math.round((submittedCount / totalVisits) * 100) : 0,
      dropOffBreakdown,
      errorBreakdown,
    });
  } catch (err) {
    console.error("funnel-analytics failed:", err);
    return NextResponse.json({ error: "Failed to load funnel analytics." }, { status: 500 });
  }
});

