"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  SearchIcon, MailIcon, CalendarIcon, ShieldIcon, CrownIcon,
  CheckCircleIcon, XCircleIcon, RefreshCwIcon, Trash2Icon,
} from "lucide-react";

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  oauth_provider?: string;
  created_at: string;
}

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [toast, setToast] = useState<{ t: "s" | "e"; m: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => { if (token) load(); }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setUsers(await r.json());
    } catch {} finally { setLoading(false); }
  };

  const toastFn = (t: "s" | "e", m: string) => { setToast({ t, m }); setTimeout(() => setToast(null), 2500); };

  const toggleActive = async (u: User) => {
    setUpdating(u.id);
    try {
      const r = await fetch(`${API}/api/admin/users/${u.id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      if (r.ok) { toastFn("s", u.is_active ? "Deactivated" : "Activated"); load(); }
      else toastFn("e", "Failed");
    } catch { toastFn("e", "Error"); } finally { setUpdating(null); }
  };

  const makeAdmin = async (u: User) => {
    setUpdating(u.id);
    try {
      const r = await fetch(`${API}/api/admin/users/${u.id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: true }),
      });
      if (r.ok) { toastFn("s", "Made admin"); load(); }
      else toastFn("e", "Failed");
    } catch { toastFn("e", "Error"); } finally { setUpdating(null); }
  };

  const hardDelete = async (u: User) => {
    if (!confirm(`Permanently delete ${u.full_name}? This cannot be undone.`)) return;
    setUpdating(u.id);
    try {
      const r = await fetch(`${API}/api/admin/users/${u.id}?hard=true`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) { toastFn("s", "Deleted permanently"); load(); }
      else toastFn("e", "Failed");
    } catch { toastFn("e", "Error"); } finally { setUpdating(null); }
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(q.toLowerCase()) || u.full_name.toLowerCase().includes(q.toLowerCase())
  );

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white shadow-lg ${toast.t === "s" ? "bg-navy" : "bg-red-600"}`}>
          {toast.t === "s" ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
          {toast.m}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">Users</h1>
          <p className="text-xs text-navy/40 mt-0.5">{users.length} accounts</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5">
          <RefreshCwIcon className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy/30" />
        <input type="text" placeholder="Search users..." value={q} onChange={e => setQ(e.target.value)} className="input pl-9" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider">User</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-navy/30 text-xs">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-navy/30 text-xs">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-navy/40 font-medium text-[10px]">
                          {u.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-navy truncate text-[13px]">{u.full_name}</p>
                        <p className="text-[11px] text-navy/30 flex items-center gap-1 truncate">
                          <MailIcon className="w-3 h-3 flex-shrink-0" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {u.is_active ? (
                        <span className="badge bg-green-50 text-green-700 w-fit"><CheckCircleIcon className="w-3 h-3 mr-1" />Active</span>
                      ) : (
                        <span className="badge bg-red-50 text-red-600 w-fit"><XCircleIcon className="w-3 h-3 mr-1" />Inactive</span>
                      )}
                      {u.is_verified ? (
                        <span className="badge bg-blue-50 text-blue-600 w-fit"><ShieldIcon className="w-3 h-3 mr-1" />Verified</span>
                      ) : (
                        <span className="badge bg-yellow-50 text-yellow-600 w-fit">Unverified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.is_admin ? (
                      <span className="badge bg-red-50 text-red-600 w-fit"><CrownIcon className="w-3 h-3 mr-1" />Admin</span>
                    ) : (
                      <span className="badge bg-cream-100 text-navy/40 w-fit">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1 text-[11px] text-navy/30">
                      <CalendarIcon className="w-3 h-3" /> {fmt(u.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {updating === u.id ? (
                      <div className="w-4 h-4 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={() => toggleActive(u)} className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        {!u.is_admin && (
                          <button onClick={() => makeAdmin(u)} className="text-[11px] font-medium px-2 py-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                            Make Admin
                          </button>
                        )}
                        <button onClick={() => hardDelete(u)} className="text-[11px] font-medium px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete permanently">
                          <Trash2Icon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
