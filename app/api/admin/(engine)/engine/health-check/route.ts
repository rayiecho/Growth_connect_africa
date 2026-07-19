import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { firestoreQuery } from "@/lib/firebase/firestore-rest";
import { d1Query } from "@/lib/db/d1-admin";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

async function checkElasticEmail(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const start = Date.now();
  try {
    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    if (!apiKey) return { ok: false, ms: 0, detail: "API key not configured" };
    const res = await fetch("https://api.elasticemail.com/v4/account", {
      headers: { "X-ElasticEmail-ApiKey": apiKey },
    });
    return { ok: res.ok, ms: Date.now() - start, detail: res.ok ? "Reachable" : `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, ms: Date.now() - start, detail: err.message || "Unreachable" };
  }
}

async function checkFirestore(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const start = Date.now();
  try {
    await firestoreQuery("email_templates", []);
    return { ok: true, ms: Date.now() - start, detail: "Reachable (email templates only)" };
  } catch (err: any) {
    return { ok: false, ms: Date.now() - start, detail: err.message || "Unreachable" };
  }
}

async function checkD1(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const start = Date.now();
  try {
    await d1Query("cron_run_log", []);
    return { ok: true, ms: Date.now() - start, detail: "Reachable (primary database)" };
  } catch (err: any) {
    return { ok: false, ms: Date.now() - start, detail: err.message || "Unreachable" };
  }
}

async function checkR2(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const start = Date.now();
  try {
    const cfContext = await getCloudflareContext();
    const env = (cfContext?.env || {}) as any;
    if (!env.VERIFICATION_BUCKET) return { ok: false, ms: 0, detail: "Bucket binding missing" };
    await env.VERIFICATION_BUCKET.list({ limit: 1 });
    return { ok: true, ms: Date.now() - start, detail: "Reachable" };
  } catch (err: any) {
    return { ok: false, ms: Date.now() - start, detail: err.message || "Unreachable" };
  }
}

export const GET = withAdminAuth(async (req, session) => {
  const [elasticEmail, d1, firestore, r2] = await Promise.all([
    checkElasticEmail(),
    checkD1(),
    checkFirestore(),
    checkR2(),
  ]);
  return NextResponse.json({
    services: [
      { name: "Cloudflare D1 (Primary Database)", ...d1 },
      { name: "Elastic Email", ...elasticEmail },
      { name: "Cloudflare R2", ...r2 },
      { name: "Firestore (Email Templates only)", ...firestore },
    ],
    checkedAt: new Date().toISOString(),
  });
});
