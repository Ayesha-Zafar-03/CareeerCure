"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  DatabaseIcon, ShieldIcon, ServerIcon, UserIcon,
  CheckCircleIcon, XCircleIcon, ExternalLinkIcon,
} from "lucide-react";

interface Info {
  database: { status: string; version: string };
  oauth: { google_configured: boolean; linkedin_configured: boolean };
  content: { user_profiles: number };
  admin_user: { id: number; email: string; name: string };
}

export default function SystemPage() {
  const { token } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/admin/system/info`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setInfo).catch(() => {}).finally(() => setLoading(false));
  }, [token, API]);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy">System</h1>
        <p className="text-xs text-navy/40 mt-0.5">Configuration and health</p>
      </div>

      {info && (
        <>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <DatabaseIcon className="w-4 h-4 text-navy/30" />
              <h2 className="text-sm font-semibold text-navy">Database</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between py-1.5 border-b border-cream-100">
                <span className="text-sm text-navy/50">Status</span>
                {info.database.status === "Connected" ? (
                  <span className="badge bg-green-50 text-green-700 text-[11px]"><CheckCircleIcon className="w-3 h-3 mr-1" />Connected</span>
                ) : (
                  <span className="badge bg-red-50 text-red-600 text-[11px]"><XCircleIcon className="w-3 h-3 mr-1" />Error</span>
                )}
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-cream-100">
                <span className="text-sm text-navy/50">Version</span>
                <span className="text-xs font-mono text-navy/40">{info.database.status === "Connected" ? info.database.version.split(" ").slice(0, 2).join(" ") : "—"}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <ShieldIcon className="w-4 h-4 text-navy/30" />
              <h2 className="text-sm font-semibold text-navy">OAuth</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Google", ok: info.oauth.google_configured },
                { l: "LinkedIn", ok: info.oauth.linkedin_configured },
              ].map(o => (
                <div key={o.l} className="flex items-center justify-between py-1.5 border-b border-cream-100">
                  <span className="text-sm text-navy/50">{o.l}</span>
                  {o.ok ? <span className="badge bg-green-50 text-green-700 text-[11px]">OK</span> : <span className="badge bg-red-50 text-red-600 text-[11px]">Not set</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <ServerIcon className="w-4 h-4 text-navy/30" />
                <h2 className="text-sm font-semibold text-navy">Content</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 border-b border-cream-100">
                  <span className="text-sm text-navy/50">Profiles</span>
                  <span className="text-lg font-bold text-navy">{info.content.user_profiles}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-navy/50">API</span>
                  <span className="badge bg-green-50 text-green-700 text-[11px]"><CheckCircleIcon className="w-3 h-3 mr-1" />Online</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-navy/30" />
                <h2 className="text-sm font-semibold text-navy">Session</h2>
              </div>
              <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                <div className="w-9 h-9 bg-cream-200 rounded-full flex items-center justify-center">
                  <span className="text-navy/50 font-medium text-xs">{info.admin_user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">{info.admin_user.name}</p>
                  <p className="text-[11px] text-navy/30">{info.admin_user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-navy">API Documentation</h3>
                <p className="text-xs text-navy/30">Interactive Swagger docs</p>
              </div>
              <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-1.5">
                Open <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
