"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ServiceHealth = {
  name: string;
  ok: boolean;
  ms: number;
  detail: string;
};

type CronStatus = {
  key: string;
  label: string;
  schedule: string;
  endpoint: string;
  dueNow: number;
  lastRun: { ranAt: string; hadErrors: boolean; result: any } | null;
};

export function EngineMonitorShell() {
  const [crons, setCrons] = useState<CronStatus[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<Record<string, any>>({});

  function loadStatus() {
    setLoading(true);
    fetch("/api/admin/engine/cron-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCrons(data.crons || []);
        else setError("Failed to load engine status.");
      })
      .catch(() => setError("Network error loading engine status."))
      .finally(() => setLoading(false));
  }

  const [backupRunning, setBackupRunning] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);

  async function handleBackup() {
    setBackupRunning(true);
    setBackupResult(null);
    try {
      const res = await fetch("/api/admin/backup-to-r2", { method: "POST" });
      const data = await res.json();
      setBackupResult(data);
    } catch {
      setBackupResult({ error: "Network error running backup." });
    }
    setBackupRunning(false);
  }

  function loadHealth() {
    setHealthLoading(true);
    fetch("/api/admin/engine/health-check")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setServices(data.services || []);
      })
      .finally(() => setHealthLoading(false));
  }

  useEffect(() => {
    loadStatus();
    loadHealth();
  }, []);

  async function handleTrigger(endpoint: string) {
    setTriggering(endpoint);
    try {
      const res = await fetch("/api/admin/engine/trigger-cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      const data = await res.json();
      setTriggerResult((prev) => ({ ...prev, [endpoint]: data }));
      loadStatus();
    } catch {
      setTriggerResult((prev) => ({ ...prev, [endpoint]: { error: "Network error." } }));
    }
    setTriggering(null);
  }

  function timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="min-h-screen bg-[#1a1d21] text-[#c9d1d9] font-mono">
      <header className="border-b border-[#30363d] bg-[#22262b] px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">ENGINE MONITOR</h1>
          <p className="text-xs text-[#8b949e]">System control &amp; automated email pipeline status</p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={loadStatus}
            className="text-xs px-3 py-1.5 border border-[#30363d] rounded bg-[#2d333b] hover:bg-[#373e47] transition-colors"
          >
            ↻ Refresh
          </button>
          <Link href="/admin/dashboard" className="text-xs text-[#8b949e] hover:text-white transition-colors">
            &larr; Back to Admin
          </Link>
        </div>
      </header>

      <main className="px-8 py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-sm font-bold text-[#8b949e] uppercase tracking-widest mb-1">External Service Health</h2>
          <div className="h-px bg-[#30363d] mb-6" />
          {healthLoading ? (
            <p className="text-sm text-[#8b949e]">Checking services...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {services.map((s) => (
                <div key={s.name} className="bg-[#22262b] border border-[#30363d] rounded-md p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${s.ok ? "bg-emerald-500" : "bg-red-500"}`} />
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                  </div>
                  <p className="text-xs text-[#8b949e]">{s.detail} &middot; {s.ms}ms</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-[#8b949e] uppercase tracking-widest mb-1">Real Quota Dashboards</h2>
          <div className="h-px bg-[#30363d] mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="https://dash.cloudflare.com/362b67f9cbc69a8c2a6181138152cb3c/workers/d1/databases/9836bf5f-27ed-47e3-aeb9-ac93eb1c8123" target="_blank" rel="noopener noreferrer" className="bg-[#22262b] border border-[#30363d] rounded-md p-4 hover:border-emerald-600 transition-colors">
              <p className="text-sm font-semibold text-white mb-1">D1 Database (Primary) &rarr;</p>
              <p className="text-xs text-[#8b949e]">Real read/write usage for our actual database, live from Cloudflare.</p>
            </a>
            <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="bg-[#22262b] border border-[#30363d] rounded-md p-4 hover:border-emerald-600 transition-colors">
              <p className="text-sm font-semibold text-white mb-1">Firebase Console &rarr;</p>
              <p className="text-xs text-[#8b949e]">Firestore quota, now only used for Email Templates.</p>
            </a>
            <a href="https://dash.cloudflare.com/362b67f9cbc69a8c2a6181138152cb3c" target="_blank" rel="noopener noreferrer" className="bg-[#22262b] border border-[#30363d] rounded-md p-4 hover:border-emerald-600 transition-colors">
              <p className="text-sm font-semibold text-white mb-1">Cloudflare Dashboard &rarr;</p>
              <p className="text-xs text-[#8b949e]">Workers KV usage and Pages deployment status, live from Cloudflare.</p>
            </a>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-[#8b949e] uppercase tracking-widest mb-1">Data Backup</h2>
          <div className="h-px bg-[#30363d] mb-6" />
          <div className="bg-[#22262b] border border-[#30363d] rounded-md p-5">
            <p className="text-sm text-[#c9d1d9] mb-3">
              Exports every table in D1 to R2 as plain JSON files &mdash; a genuinely independent copy of all our data, separate from D1 itself.
            </p>
            <button
              type="button"
              onClick={handleBackup}
              disabled={backupRunning}
              className="text-xs font-semibold rounded px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
            >
              {backupRunning ? "Backing up..." : "Backup Now"}
            </button>
            {backupResult && (
              <div className="bg-[#1a1d21] border border-[#30363d] rounded p-3 text-xs text-[#8b949e] mt-3">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(backupResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-[#8b949e] uppercase tracking-widest mb-1">Email Pipeline</h2>
          <div className="h-px bg-[#30363d] mb-6" />
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-sm text-[#8b949e]">Loading system status...</p>
        ) : (
          <div className="space-y-3">
            {crons.map((c) => {
              const result = triggerResult[c.endpoint];
              const statusColor = c.lastRun?.hadErrors ? "bg-red-500" : c.dueNow > 0 ? "bg-amber-500" : "bg-emerald-500";
              return (
                <div key={c.key} className="bg-[#22262b] border border-[#30363d] rounded-md p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                      <div>
                        <p className="text-sm font-semibold text-white">{c.label}</p>
                        <p className="text-xs text-[#8b949e]">{c.schedule}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTrigger(c.endpoint)}
                      disabled={triggering === c.endpoint}
                      className="text-xs px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
                    >
                      {triggering === c.endpoint ? "Running..." : "Send Now"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                    <div>
                      <p className="text-[#8b949e] mb-0.5">Due Right Now</p>
                      <p className={`font-bold ${c.dueNow > 0 ? "text-amber-400" : "text-[#c9d1d9]"}`}>{c.dueNow}</p>
                    </div>
                    <div>
                      <p className="text-[#8b949e] mb-0.5">Last Run</p>
                      <p className="text-[#c9d1d9]">{c.lastRun ? timeAgo(c.lastRun.ranAt) : "Never recorded"}</p>
                    </div>
                    <div>
                      <p className="text-[#8b949e] mb-0.5">Last Run Status</p>
                      <p className={c.lastRun?.hadErrors ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        {c.lastRun ? (c.lastRun.hadErrors ? "Had Errors" : "Success") : "-"}
                      </p>
                    </div>
                  </div>

                  {c.lastRun && (
                    <div className="bg-[#1a1d21] border border-[#30363d] rounded p-3 text-xs text-[#8b949e] mb-2">
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(c.lastRun.result, null, 2)}</pre>
                    </div>
                  )}

                  {result && (
                    <div className="bg-[#1a1d21] border border-emerald-800 rounded p-3 text-xs text-emerald-300 mt-2">
                      <p className="font-semibold mb-1">Just triggered:</p>
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}





