"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  UsersIcon,
  BookOpenIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  UserCheckIcon,
  CrownIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  RefreshCwIcon,
  ArrowRightIcon,
} from "lucide-react";

interface Stats {
  total_users: number;
  active_users: number;
  verified_users: number;
  admin_users: number;
  oauth_users: number;
  recent_registrations: number;
  total_jobs: number;
  total_courses: number;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    fetch(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (r.status === 403) { setError("Admin access required."); return; } return r.json(); })
      .then((d) => d && setStats(d))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, [token, router, API]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/api/admin/sync-data`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ update_jobs: true, update_courses: true }),
      });
      if (res.ok) {
        const r = await fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) setStats(await r.json());
      }
    } catch {} finally { setSyncing(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <ShieldCheckIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-navy/60 text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-navy/40 uppercase tracking-wider font-medium mb-1">Welcome back</p>
          <h1 className="text-2xl font-bold text-navy">{user?.full_name || "Admin"}</h1>
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn-primary flex items-center gap-2">
          <RefreshCwIcon className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync External Data"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Users", value: stats.total_users, sub: `${stats.active_users} active`, icon: UsersIcon },
            { label: "Courses", value: stats.total_courses, sub: null, icon: BookOpenIcon },
            { label: "Internships", value: stats.total_jobs, sub: null, icon: BriefcaseIcon },
            { label: "New (7d)", value: stats.recent_registrations, sub: "registrations", icon: TrendingUpIcon },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-navy/30" />
                </div>
                <p className="text-2xl font-bold text-navy">{s.value}</p>
                <p className="text-xs text-navy/40 mt-0.5">{s.label}</p>
                {s.sub && <p className="text-[11px] text-navy/30">{s.sub}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Nav */}
      <div>
        <h2 className="text-xs font-medium text-navy/40 uppercase tracking-wider mb-3">Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/admin/courses", label: "Courses", desc: "Add, edit, remove", icon: BookOpenIcon },
            { href: "/admin/internships", label: "Internships", desc: "Job listings", icon: BriefcaseIcon },
            { href: "/admin/users", label: "Users", desc: "Accounts & roles", icon: UsersIcon },
            { href: "/admin/database", label: "Database", desc: "Sync & health", icon: DatabaseIcon },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group">
                <div className="card flex items-center gap-3 group-hover:border-navy/20 transition-colors">
                  <Icon className="w-5 h-5 text-navy/30 group-hover:text-navy transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy">{item.label}</p>
                    <p className="text-[11px] text-navy/30">{item.desc}</p>
                  </div>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-navy/20 group-hover:text-navy/50 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Overview */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-xs font-medium text-navy/40 uppercase tracking-wider mb-4">User Overview</h3>
            <div className="space-y-3">
              {[
                { label: "Admin accounts", value: stats.admin_users, icon: CrownIcon },
                { label: "Verified users", value: stats.verified_users, icon: UserCheckIcon },
                { label: "OAuth users", value: stats.oauth_users, icon: ShieldCheckIcon },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-navy/25" />
                      <span className="text-sm text-navy/60">{r.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-navy">{r.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xs font-medium text-navy/40 uppercase tracking-wider mb-4">Content</h3>
            <div className="space-y-3">
              {[
                { label: "Total courses", value: stats.total_courses },
                { label: "Total internships", value: stats.total_jobs },
                { label: "Active rate", value: stats.total_users > 0 ? `${Math.round((stats.active_users / stats.total_users) * 100)}%` : "0%" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                  <span className="text-sm text-navy/60">{r.label}</span>
                  <span className="text-sm font-semibold text-navy">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
