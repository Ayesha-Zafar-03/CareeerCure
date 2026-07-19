"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  SearchIcon, PlusIcon, Trash2Icon, EditIcon, XIcon,
  BookOpenIcon, ExternalLinkIcon, RefreshCwIcon, CheckCircleIcon, AlertCircleIcon,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  provider: string;
  instructor?: string;
  description: string;
  required_skills: string[];
  skills_gained: string[];
  difficulty_level?: string;
  duration?: string;
  price?: string;
  course_url: string;
  rating?: number;
  category?: string;
  created_at: string;
}

const EMPTY = {
  title: "", provider: "", instructor: "", description: "",
  required_skills: "", skills_gained: "", difficulty_level: "Beginner",
  duration: "", price: "", course_url: "", rating: "", category: "",
};

export default function CoursesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Course[]>([]);
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
      const r = await fetch(`${API}/api/admin/courses?${p}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setItems(d.courses || []); setTotal(d.total || 0); }
    } catch {} finally { setLoading(false); }
  }, [token, page, search, API]);

  useEffect(() => { load(); }, [load]);

  const showToast = (t: "s" | "e", m: string) => { setToast({ t, m }); setTimeout(() => setToast(null), 2500); };

  const openCreate = () => { setEditId(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (c: Course) => {
    setEditId(c.id);
    setForm({
      title: c.title, provider: c.provider, instructor: c.instructor || "",
      description: c.description,
      required_skills: (c.required_skills || []).join(", "),
      skills_gained: (c.skills_gained || []).join(", "),
      difficulty_level: c.difficulty_level || "Beginner",
      duration: c.duration || "", price: c.price || "",
      course_url: c.course_url, rating: c.rating?.toString() || "",
      category: c.category || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      required_skills: form.required_skills.split(",").map(s => s.trim()).filter(Boolean),
      skills_gained: form.skills_gained.split(",").map(s => s.trim()).filter(Boolean),
      rating: form.rating ? parseFloat(form.rating) : undefined,
    };
    try {
      const url = editId ? `${API}/api/admin/courses/${editId}` : `${API}/api/admin/courses`;
      const r = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) { showToast("s", editId ? "Updated" : "Created"); setShowForm(false); load(); }
      else { const e = await r.json(); showToast("e", e.detail || "Failed"); }
    } catch { showToast("e", "Network error"); } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    setDel(id);
    try {
      const r = await fetch(`${API}/api/admin/courses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { showToast("s", "Deleted"); load(); } else showToast("e", "Failed");
    } catch { showToast("e", "Network error"); } finally { setDel(null); }
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
          <h1 className="text-xl font-bold text-navy">Courses</h1>
          <p className="text-xs text-navy/40 mt-0.5">{total} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
          <PlusIcon className="w-3.5 h-3.5" /> Add Course
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
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider">Course</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden md:table-cell">Provider</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden lg:table-cell">Category</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden lg:table-cell">Level</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider hidden sm:table-cell">Price</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-navy/40 uppercase tracking-wider w-24"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-navy/30 text-xs">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-navy/30 text-xs">No courses found</td></tr>
              ) : items.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpenIcon className="w-3.5 h-3.5 text-navy/40" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-navy truncate max-w-[180px] sm:max-w-none text-[13px]">{c.title}</p>
                        <p className="text-[11px] text-navy/30">{c.provider}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="badge bg-cream-100 text-navy/50">{c.provider}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell">{c.category ? <span className="badge bg-navy/5 text-navy/50">{c.category}</span> : <span className="text-navy/20">—</span>}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{c.difficulty_level ? <span className="badge bg-cream-100 text-navy/50">{c.difficulty_level}</span> : <span className="text-navy/20">—</span>}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-navy/40 text-xs">{c.price || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <a href={c.course_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-navy/25 hover:text-navy hover:bg-cream-100 transition-colors"><ExternalLinkIcon className="w-3.5 h-3.5" /></a>
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-navy/25 hover:text-navy hover:bg-cream-100 transition-colors"><EditIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(c.id)} disabled={del === c.id} className="p-1.5 rounded-md text-navy/25 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"><Trash2Icon className="w-3.5 h-3.5" /></button>
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
              <h2 className="text-sm font-semibold text-navy">{editId ? "Edit Course" : "New Course"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-cream-100"><XIcon className="w-4 h-4 text-navy/30" /></button>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div><label className="label">Provider *</label><input className="input" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} /></div>
                <div><label className="label">Instructor</label><input className="input" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} /></div>
                <div><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
                <div><label className="label">Difficulty</label>
                  <select className="input" value={form.difficulty_level} onChange={e => setForm({ ...form, difficulty_level: e.target.value })}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div><label className="label">Duration</label><input className="input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="4 weeks" /></div>
                <div><label className="label">Price</label><input className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Free" /></div>
                <div><label className="label">Rating</label><input className="input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} /></div>
              </div>
              <div><label className="label">URL *</label><input className="input" value={form.course_url} onChange={e => setForm({ ...form, course_url: e.target.value })} /></div>
              <div><label className="label">Description *</label><textarea className="input min-h-[70px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Required Skills</label><input className="input" value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} placeholder="Python, SQL, ML" /></div>
              <div><label className="label">Skills Gained</label><input className="input" value={form.skills_gained} onChange={e => setForm({ ...form, skills_gained: e.target.value })} placeholder="Data Analysis, Visualization" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-cream-100">
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} disabled={saving || !form.title || !form.provider || !form.course_url || !form.description} className="btn-primary flex items-center gap-1.5 disabled:opacity-40">
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
