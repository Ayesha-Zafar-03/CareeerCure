"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  SearchIcon, PlusIcon, Trash2Icon, EditIcon, XIcon,
  BriefcaseIcon, ExternalLinkIcon, RefreshCwIcon, CheckCircleIcon, AlertCircleIcon,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  required_skills: string[];
  location?: string;
  duration?: string;
  application_url?: string;
  salary_range?: string;
  remote_option?: string;
  created_at: string;
}

const EMPTY = {
  title: "", company: "", description: "", required_skills: "",
  location: "", duration: "", application_url: "", salary_range: "", remote_option: "On-site",
};

export default function InternshipsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ t: "s" | "e"; m: string } | null>(null);
  const [del, setDel] = useState<number | null>(null);
  const limit = 10;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) p.append("search", search);
      const r = await fetch(`${API}/api/admin/jobs?${p}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setItems(d.jobs || []); setTotal(d.total || 0); }
    } catch {} finally { setLoading(false); }
  }, [token, page, search, API]);

  useEffect(() => { load(); }, [load]);

  const toastFn = (t: "s" | "e", m: string) => { setToast({ t, m }); setTimeout(() => setToast(null), 2500); };

  const openCreate = () => { setEditId(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (j: Job) => {
    setEditId(j.id);
    setForm({
      title: j.title, company: j.company, description: j.description,
      required_skills: (j.required_skills || []).join(", "),
      location: j.location || "", duration: j.duration || "",
      application_url: j.application_url || "", salary_range: j.salary_range || "",
      remote_option: j.remote_option || "On-site",
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...form, required_skills: form.required_skills.split(",").map(s => s.trim()).filter(Boolean) };
    try {
      const url = editId ? `${API}/api/admin/jobs/${editId}` : `${API}/api/admin/jobs`;
      const r = await fetch(url, { method: editId ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) { toastFn("s", editId ? "Updated" : "Created"); setShowForm(false); load(); }
      else { const e = await r.json(); toastFn("e", e.detail || "Failed"); }
    } catch { toastFn("e", "Network error"); } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this listing?")) return;
    setDel(id);
    try {
      const r = await fetch(`${API}/api/admin/jobs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { toastFn("s", "Deleted"); load(); } else toastFn("e", "Failed");
    } catch { toastFn("e", "Network error"); } finally { setDel(null); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white shadow-lg ${toast.t === "s" ? "bg-navy" : "bg-red-600"}`}>
          {toast.t === "s" ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
          {toast.m}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">Internships</h1>
          <p className="text-xs text-navy/40 mt-0.5">{total} listings</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
          <PlusIcon className="w-3.5 h-3.5" /> Add Listing
        </button>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy/30" />
        <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input pl-9" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider">Job</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden lg:table-cell">Type</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden lg:table-cell">Salary</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden sm:table-cell">Duration</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider w-24"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-navy/30 text-xs">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-navy/30 text-xs">No listings found</td></tr>
              ) : items.map(j => (
                <tr key={j.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-3.5 h-3.5 text-navy/40" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-navy truncate max-w-[180px] sm:max-w-none text-[13px]">{j.title}</p>
                        <p className="text-[11px] text-navy/30">{j.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-navy/40 text-xs">{j.location || "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{j.remote_option ? <span className="badge bg-cream-100 text-navy/50">{j.remote_option}</span> : <span className="text-navy/20">—</span>}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-navy/40 text-xs">{j.salary_range || "—"}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-navy/40 text-xs">{j.duration || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {j.application_url && <a href={j.application_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-navy/25 hover:text-navy hover:bg-cream-100 transition-colors"><ExternalLinkIcon className="w-3.5 h-3.5" /></a>}
                      <button onClick={() => openEdit(j)} className="p-1.5 rounded-md text-navy/25 hover:text-navy hover:bg-cream-100 transition-colors"><EditIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(j.id)} disabled={del === j.id} className="p-1.5 rounded-md text-navy/25 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"><Trash2Icon className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-cream-100">
            <span className="text-[11px] text-navy/30">{page} / {pages}</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs py-1 px-2.5 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost text-xs py-1 px-2.5 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto border border-cream-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-cream-100">
              <h2 className="text-sm font-semibold text-navy">{editId ? "Edit Listing" : "New Listing"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-cream-100"><XIcon className="w-4 h-4 text-navy/30" /></button>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div><label className="label">Company *</label><input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div><label className="label">Duration</label><input className="input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="3 months" /></div>
                <div><label className="label">Type</label>
                  <select className="input" value={form.remote_option} onChange={e => setForm({ ...form, remote_option: e.target.value })}>
                    <option>On-site</option><option>Remote</option><option>Hybrid</option>
                  </select>
                </div>
                <div><label className="label">Salary</label><input className="input" value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} placeholder="$1000/mo" /></div>
              </div>
              <div><label className="label">Application URL</label><input className="input" value={form.application_url} onChange={e => setForm({ ...form, application_url: e.target.value })} /></div>
              <div><label className="label">Description *</label><textarea className="input min-h-[70px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Required Skills</label><input className="input" value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} placeholder="React, Node.js, Python" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-cream-100">
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} disabled={saving || !form.title || !form.company || !form.description} className="btn-primary flex items-center gap-1.5 disabled:opacity-40">
                {saving && <RefreshCwIcon className="w-3.5 h-3.5 animate-spin" />}
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
