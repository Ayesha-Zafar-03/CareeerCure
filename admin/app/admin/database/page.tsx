"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  DatabaseIcon, RefreshCwIcon, UsersIcon, BookOpenIcon, BriefcaseIcon,
  ServerIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, ShieldIcon,
  RouteIcon, ExternalLinkIcon,
} from "lucide-react";

interface DBStats {
  total_users: number; active_users: number; total_jobs: number;
  total_courses: number; total_profiles: number; total_roadmaps: number;
  db_status: string; db_version: string;
}
interface SyncResult {
  jobs_added: number; courses_added: number;
  total_jobs: number; total_courses: number; errors: string[];
}
interface SysInfo {
  database: { status: string; version: string };
  oauth: { google_configured: boolean; linkedin_configured: boolean };
  content: { user_profiles: number };
  admin_user: { id: number; email: string; name: string };
}

export default function DatabasePage() {
  const { token } = useAuth();
  const [db, setDb] = useState<DBStats | null>(null);
  const [sys, setSys] = useState<SysInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [toast, setToast] = useState<{ t: "s" | "e"; m: string } | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const load = async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        fetch(`${API}/api/admin/db/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/system/info`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (a.ok) setDb(await a.json());
      if (b.ok) setSys(await b.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toastFn = (t: "s" | "e", m: string) => { setToast({ t, m }); setTimeout(() => setToast(null), 2500); };

  const handleSync = async () => {
    setSyncing(true); setSyncResult(null);
    try {
      const r = await fetch(`${API}/api/admin/sync-data`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ update_jobs: true, update_courses: true }),
      });
      if (r.ok) { const d = await r.json(); setSyncResult(d); toastFn("s", `Synced: ${d.jobs_added} jobs, ${d.courses_added} courses`); load(); }
      else { const e = await r.json(); toastFn("e", e.detail || "Sync failed"); }
    } catch { toastFn("e", "Network error"); } finally { setSyncing(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white shadow-lg ${toast.t === "s" ? "bg-navy" : "bg-red-600"}`}>
          {toast.t === "s" ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
          {toast.m}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">Database</h1>
          <p className="text-xs text-navy/40 mt-0.5">Health, stats, and data sync</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-1.5"><RefreshCwIcon className="w-3.5 h-3.5" /> Refresh</button>
          <button onClick={handleSync} disabled={syncing} className="btn-primary flex items-center gap-1.5">
            <RefreshCwIcon className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Data"}
          </button>
        </div>
      </div>

      {/* Health */}
      {db && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="w-4 h-4 text-navy/30" />
              <h2 className="text-sm font-semibold text-navy">Health</h2>
            </div>
            {db.db_status === "Connected" ? (
              <span className="badge bg-green-50 text-green-700"><CheckCircleIcon className="w-3 h-3 mr-1" />Connected</span>
            ) : (
              <span className="badge bg-red-50 text-red-600"><XCircleIcon className="w-3 h-3 mr-1" />Error</span>
            )}
          </div>
          {db.db_status === "Connected" && (
            <p className="text-xs text-navy/30 font-mono">{db.db_version.split(" ").slice(0, 2).join(" ")}</p>
          )}
        </div>
      )}

      {/* Table Stats */}
      {db && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { l: "Users", v: db.total_users, i: UsersIcon },
            { l: "Active", v: db.active_users, i: CheckCircleIcon },
            { l: "Profiles", v: db.total_profiles, i: ShieldIcon },
            { l: "Courses", v: db.total_courses, i: BookOpenIcon },
            { l: "Jobs", v: db.total_jobs, i: BriefcaseIcon },
            { l: "Roadmaps", v: db.total_roadmaps, i: RouteIcon },
          ].map(s => {
            const Icon = s.i;
            return (
              <div key={s.l} className="stat-card text-center">
                <Icon className="w-4 h-4 text-navy/20 mx-auto mb-2" />
                <p className="text-xl font-bold text-navy">{s.v}</p>
                <p className="text-[11px] text-navy/30">{s.l}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Sync Results */}
      {syncResult && (
        <div className="card border-green-200">
          <h3 className="text-xs font-medium text-navy/40 uppercase tracking-wider mb-3">Last Sync</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: "Jobs Added", v: syncResult.jobs_added, c: "text-green-600" },
              { l: "Courses Added", v: syncResult.courses_added, c: "text-blue-600" },
              { l: "Total Jobs", v: syncResult.total_jobs, c: "text-navy" },
              { l: "Total Courses", v: syncResult.total_courses, c: "text-navy" },
            ].map(r => (
              <div key={r.l} className="text-center p-3 bg-cream-50 rounded-lg">
                <p className={`text-lg font-bold ${r.c}`}>{r.v}</p>
                <p className="text-[11px] text-navy/30">{r.l}</p>
              </div>
            ))}
          </div>
          {syncResult.errors.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1"><AlertCircleIcon className="w-3 h-3" /> Errors</p>
              {syncResult.errors.map((e, i) => <p key={i} className="text-[11px] text-red-600">{e}</p>)}
            </div>
          )}
        </div>
      )}

      {/* OAuth + Sources */}
      {sys && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <ShieldIcon className="w-4 h-4 text-navy/30" />
              <h3 className="text-sm font-semibold text-navy">OAuth</h3>
            </div>
            <div className="space-y-2">
              {[
                { l: "Google", ok: sys.oauth.google_configured },
                { l: "LinkedIn", ok: sys.oauth.linkedin_configured },
              ].map(o => (
                <div key={o.l} className="flex items-center justify-between py-1.5 border-b border-cream-100 last:border-0">
                  <span className="text-sm text-navy/50">{o.l}</span>
                  {o.ok ? <span className="badge bg-green-50 text-green-700 text-[11px]">OK</span> : <span className="badge bg-red-50 text-red-600 text-[11px]">Not set</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <ServerIcon className="w-4 h-4 text-navy/30" />
              <h3 className="text-sm font-semibold text-navy">Data Sources</h3>
            </div>
            <div className="space-y-2">
              <div className="px-3 py-2 bg-cream-50 rounded-lg">
                <p className="text-[11px] font-medium text-navy/50">Job APIs</p>
                <p className="text-[11px] text-navy/30">JSearch, Adzuna, LinkedIn, Indeed</p>
              </div>
              <div className="px-3 py-2 bg-cream-50 rounded-lg">
                <p className="text-[11px] font-medium text-navy/50">Course APIs</p>
                <p className="text-[11px] text-navy/30">Udemy, Coursera, edX</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Docs */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy">API Docs</h3>
            <p className="text-xs text-navy/30">Swagger documentation</p>
          </div>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-1.5">
            Open <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
