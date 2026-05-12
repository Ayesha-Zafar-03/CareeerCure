"use client";
import { useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cvApi } from "@/lib/api";
import {
  UploadCloudIcon, FileTextIcon, CheckCircleIcon,
  AlertCircleIcon, BriefcaseIcon, SparklesIcon, WrenchIcon,
  DownloadIcon,
} from "lucide-react";
import clsx from "clsx";

type Tab = "analyse" | "generate" | "rebuild";

// ── ATS Score ─────────────────────────────────────────────────────────────────
function ATSScore({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-500" : "text-red-500";
  const bg = score >= 80 ? "bg-green-50 border-green-200" : score >= 60 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  return (
    <div className={clsx("flex flex-col items-center justify-center p-6 rounded-xl border-2", bg)}>
      <span className={clsx("text-5xl font-bold", color)}>{score}</span>
      <span className="text-gray-500 text-sm mt-1">/ 100</span>
      <span className="text-gray-700 font-medium mt-2">{label}</span>
    </div>
  );
}

// ── CV Text Box — PDF download only ──────────────────────────────────────────
function CVTextBox({ text, fullName }: { text: string; fullName?: string }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await cvApi.downloadPdf(text, fullName || "CV");
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(fullName || "CV").replace(/\s+/g, "_")}_CV.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF generation failed. Please try again.");
    } finally { setPdfLoading(false); }
  };

  // Parse CV text into sections for clean display
  const lines = text.split("\n");
  const SECTION_KEYWORDS = ["EDUCATION", "EXPERIENCE", "WORK EXPERIENCE", "SKILLS", "PROJECTS",
    "CERTIFICATIONS", "ACHIEVEMENTS", "LANGUAGES", "SUMMARY", "OBJECTIVE", "PROFESSIONAL SUMMARY",
    "TECHNICAL SKILLS", "CONTACT", "PROFILE", "INTERNSHIP", "AWARDS"];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Your CV</h2>
        <button onClick={downloadPdf} disabled={pdfLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          <DownloadIcon className="w-4 h-4" />
          {pdfLoading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      {/* Clean CV preview — not monospace, looks like a real CV */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-h-[500px] overflow-y-auto">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-2" />;

          const upper = trimmed.toUpperCase();
          const isSection = SECTION_KEYWORDS.some(k => upper === k || upper.startsWith(k + ":") || upper.startsWith(k + " "));
          const isName = i === 0 || (i < 3 && !trimmed.includes("@") && !trimmed.includes("|") && trimmed.length < 50 && !trimmed.includes(":"));
          const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
          const isContact = trimmed.includes("|") && trimmed.length < 120;

          if (isName && i === 0) return <h1 key={i} className="text-2xl font-bold text-gray-900 text-center mb-1">{trimmed}</h1>;
          if (isContact) return <p key={i} className="text-sm text-gray-500 text-center mb-3">{trimmed}</p>;
          if (isSection || (trimmed.isupper && trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 40)) {
            return (
              <div key={i} className="mt-4 mb-2">
                <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest">{trimmed}</h3>
                <div className="h-px bg-primary-100 mt-1" />
              </div>
            );
          }
          if (isBullet) return <p key={i} className="text-sm text-gray-700 pl-3 mb-0.5">• {trimmed.replace(/^[•\-*]\s*/, "")}</p>;
          if (trimmed.length < 80 && !trimmed.endsWith(".") && !trimmed.includes(",") && i > 0) {
            return <p key={i} className="text-sm font-semibold text-gray-800 mt-2 mb-0.5">{trimmed}</p>;
          }
          return <p key={i} className="text-sm text-gray-600 leading-relaxed mb-0.5">{trimmed}</p>;
        })}
      </div>
    </div>
  );
}

// ── Analyse Tab ───────────────────────────────────────────────────────────────
function AnalyseTab() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) { setError("Only PDF files are accepted."); return; }
    setFile(f); setError(""); setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try { const res = await cvApi.upload(file); setResult(res.data); }
    catch (err: any) { setError(err.response?.data?.detail || "Upload failed."); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div
        className={clsx("border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-6",
          dragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 hover:bg-gray-50")}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        role="button" aria-label="Upload CV PDF"
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <UploadCloudIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        {file
          ? <div><p className="font-semibold text-gray-900">{file.name}</p><p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p></div>
          : <div><p className="font-semibold text-gray-700">Drop your CV here or click to browse</p><p className="text-sm text-gray-400 mt-1">PDF only, max 5 MB</p></div>}
      </div>
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4"><AlertCircleIcon className="w-4 h-4" />{error}</div>}
      {file && !result && <button onClick={handleUpload} disabled={loading} className="btn-primary w-full mb-8">{loading ? "Analysing..." : "Analyse CV"}</button>}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg"><CheckCircleIcon className="w-5 h-5" /><span className="font-medium">CV analysed successfully!</span></div>
          {result.analysis?.summary && <div className="card"><h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileTextIcon className="w-5 h-5 text-primary-600" /> Summary</h2><p className="text-gray-700 text-sm leading-relaxed">{result.analysis.summary}</p></div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card"><h2 className="font-semibold text-gray-900 mb-3">✅ Extracted Skills</h2><div className="flex flex-wrap gap-2">{result.analysis?.extracted_skills?.map((s: string) => <span key={s} className="badge bg-blue-100 text-blue-700">{s}</span>)}</div></div>
            <div className="card"><h2 className="font-semibold text-gray-900 mb-3">⚠️ Skill Gaps</h2><div className="flex flex-wrap gap-2">{result.analysis?.skill_gaps?.map((s: string) => <span key={s} className="badge bg-orange-100 text-orange-700">{s}</span>)}</div></div>
            <div className="card"><h2 className="font-semibold text-gray-900 mb-3">💪 Strengths</h2><ul className="space-y-1 text-sm text-gray-700">{result.analysis?.strengths?.map((s: string) => <li key={s} className="flex items-start gap-2"><span className="text-green-500">•</span>{s}</li>)}</ul></div>
            <div className="card"><h2 className="font-semibold text-gray-900 mb-3">💡 Recommendations</h2><ul className="space-y-1 text-sm text-gray-700">{result.analysis?.recommendations?.map((r: string) => <li key={r} className="flex items-start gap-2"><span className="text-primary-500">•</span>{r}</li>)}</ul></div>
          </div>
          {result.job_matches?.length > 0 && (
            <div className="card"><h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BriefcaseIcon className="w-5 h-5 text-green-600" /> Top Internship Matches</h2>
              <div className="space-y-3">{result.job_matches.map((m: any, i: number) => <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-700">Internship #{m.internship_id}</span><span className="badge bg-green-100 text-green-700">{(m.score * 100).toFixed(0)}% match</span></div>)}</div>
            </div>
          )}
          <button onClick={() => { setFile(null); setResult(null); }} className="btn-secondary w-full">Upload Another CV</button>
        </div>
      )}
    </div>
  );
}

// ── Generate Tab — fixed: no inline components to prevent re-mount ─────────────
function GenerateTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [expYears, setExpYears] = useState("0");
  const [education, setEducation] = useState("");
  const [workExp, setWorkExp] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [certs, setCerts] = useState("");
  const [languages, setLanguages] = useState("");
  const [achievements, setAchievements] = useState("");

  const handleGenerate = async () => {
    if (!fullName || !email || !targetRole || !education || !skills) {
      setError("Please fill in required fields: Full Name, Email, Target Role, Education, Skills.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await cvApi.generate({ full_name: fullName, email, phone, location, linkedin, target_role: targetRole, experience_years: expYears, education, work_experience: workExp, skills, projects, certifications: certs, languages, achievements });
      setResult(res.data);
    } catch (err: any) { setError(err.response?.data?.detail || "CV generation failed."); }
    finally { setLoading(false); }
  };

  if (result) return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg"><CheckCircleIcon className="w-5 h-5" /><span className="font-medium">CV generated successfully!</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ATSScore score={result.ats_score} label="ATS Score" />
        <div className="card"><h2 className="font-semibold text-gray-900 mb-2">📝 Summary</h2><p className="text-sm text-gray-700">{result.summary}</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card"><h2 className="font-semibold text-gray-900 mb-3">🔑 Keywords Used</h2><div className="flex flex-wrap gap-2">{result.keywords_used?.map((k: string) => <span key={k} className="badge bg-blue-100 text-blue-700">{k}</span>)}</div></div>
        <div className="card"><h2 className="font-semibold text-gray-900 mb-3">💡 ATS Tips</h2><ul className="space-y-1 text-sm text-gray-700">{result.ats_tips?.map((t: string) => <li key={t} className="flex items-start gap-2"><span className="text-primary-500">•</span>{t}</li>)}</ul></div>
      </div>
      <CVTextBox text={result.cv_text} fullName={fullName} />
      <button onClick={() => setResult(null)} className="btn-secondary w-full">Generate Another CV</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"><AlertCircleIcon className="w-4 h-4" />{error}</div>}

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label><input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 1234567" className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Karachi, Pakistan" className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label><input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/johndoe" className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Target Role <span className="text-red-500">*</span></label><input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Software Engineer" className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label><input type="text" value={expYears} onChange={e => setExpYears(e.target.value)} placeholder="2" className="input-field" /></div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Education & Experience</h2>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Education <span className="text-red-500">*</span></label><textarea rows={3} value={education} onChange={e => setEducation(e.target.value)} placeholder="BS Computer Science, FAST NUCES, 2020-2024" className="input-field resize-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Work Experience</label><textarea rows={3} value={workExp} onChange={e => setWorkExp(e.target.value)} placeholder="Software Intern at XYZ (2023): Built REST APIs..." className="input-field resize-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Projects</label><textarea rows={3} value={projects} onChange={e => setProjects(e.target.value)} placeholder="E-commerce App: Built with React & Node.js..." className="input-field resize-none" /></div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Skills & Extras</h2>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Skills <span className="text-red-500">*</span></label><textarea rows={2} value={skills} onChange={e => setSkills(e.target.value)} placeholder="Python, React, FastAPI, PostgreSQL, Docker, Git" className="input-field resize-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label><textarea rows={2} value={certs} onChange={e => setCerts(e.target.value)} placeholder="AWS Certified Developer, Google Data Analytics" className="input-field resize-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Languages</label><input type="text" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="English (Fluent), Urdu (Native)" className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label><textarea rows={2} value={achievements} onChange={e => setAchievements(e.target.value)} placeholder="Dean's List 2023, Hackathon Winner..." className="input-field resize-none" /></div>
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
        {loading ? "Generating your CV..." : "✨ Generate ATS-Optimized CV"}
      </button>
    </div>
  );
}

// ── Rebuild Tab ───────────────────────────────────────────────────────────────
function RebuildTab() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [useSaved, setUseSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) { setError("Only PDF files are accepted."); return; }
    setFile(f); setError("");
  };

  const handleRebuild = async () => {
    if (!file && !useSaved) { setError("Please upload a PDF or use your saved CV."); return; }
    setLoading(true); setError("");
    try { const res = await cvApi.rebuild(targetRole, file || undefined); setResult(res.data); }
    catch (err: any) { setError(err.response?.data?.detail || "CV rebuild failed."); }
    finally { setLoading(false); }
  };

  if (result) return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg"><CheckCircleIcon className="w-5 h-5" /><span className="font-medium">CV rebuilt successfully!</span></div>
      <div className="grid grid-cols-2 gap-4">
        <ATSScore score={result.original_ats_score} label="Original Score" />
        <ATSScore score={result.improved_ats_score} label="Improved Score" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card"><h2 className="font-semibold text-gray-900 mb-3">✅ Changes Made</h2><ul className="space-y-1 text-sm text-gray-700">{result.changes_made?.map((c: string) => <li key={c} className="flex items-start gap-2"><span className="text-green-500">•</span>{c}</li>)}</ul></div>
        <div className="card"><h2 className="font-semibold text-gray-900 mb-3">🔑 Keywords Added</h2><div className="flex flex-wrap gap-2">{result.keywords_added?.map((k: string) => <span key={k} className="badge bg-blue-100 text-blue-700">{k}</span>)}</div></div>
        <div className="card"><h2 className="font-semibold text-gray-900 mb-3">🔧 Formatting Fixes</h2><ul className="space-y-1 text-sm text-gray-700">{result.formatting_fixes?.map((f: string) => <li key={f} className="flex items-start gap-2"><span className="text-orange-500">•</span>{f}</li>)}</ul></div>
        <div className="card"><h2 className="font-semibold text-gray-900 mb-3">💡 ATS Tips</h2><ul className="space-y-1 text-sm text-gray-700">{result.ats_tips?.map((t: string) => <li key={t} className="flex items-start gap-2"><span className="text-primary-500">•</span>{t}</li>)}</ul></div>
      </div>
      <CVTextBox text={result.improved_cv_text} fullName="Improved_CV" />
      <button onClick={() => { setFile(null); setResult(null); }} className="btn-secondary w-full">Rebuild Another CV</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"><AlertCircleIcon className="w-4 h-4" />{error}</div>}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Target Role (Optional)</h2>
        <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer, Data Analyst" className="input-field" />
        <p className="text-xs text-gray-400">Providing a target role helps optimize keywords for that specific position.</p>
      </div>
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">CV Source</h2>
        <div className="flex gap-3">
          <button onClick={() => setUseSaved(false)} className={clsx("flex-1 py-2 rounded-lg border text-sm font-medium transition-colors", !useSaved ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-700 border-gray-300")}>Upload PDF</button>
          <button onClick={() => { setUseSaved(true); setFile(null); }} className={clsx("flex-1 py-2 rounded-lg border text-sm font-medium transition-colors", useSaved ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-700 border-gray-300")}>Use Saved CV</button>
        </div>
        {!useSaved && (
          <div
            className={clsx("border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors", dragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 hover:bg-gray-50")}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()} role="button"
          >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <UploadCloudIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            {file ? <p className="font-semibold text-gray-900">{file.name}</p> : <p className="text-gray-600 text-sm">Drop PDF here or click to browse</p>}
          </div>
        )}
        {useSaved && <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg"><FileTextIcon className="w-5 h-5 text-blue-600" /><span className="text-sm text-blue-700">Your previously saved CV will be used.</span></div>}
      </div>
      <button onClick={handleRebuild} disabled={loading} className="btn-primary w-full">{loading ? "Rebuilding..." : "🔧 Rebuild & Optimize for ATS"}</button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CVPage() {
  const [tab, setTab] = useState<Tab>("analyse");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "analyse", label: "Analyse CV", icon: <FileTextIcon className="w-5 h-5" />, desc: "Upload PDF & get AI feedback" },
    { id: "generate", label: "Generate CV", icon: <SparklesIcon className="w-5 h-5" />, desc: "Build from scratch with AI" },
    { id: "rebuild", label: "Rebuild for ATS", icon: <WrenchIcon className="w-5 h-5" />, desc: "Improve existing CV's ATS score" },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Tools</h1>
        <p className="text-gray-500 mb-8">Analyse, generate, or rebuild your CV with AI-powered ATS optimization</p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={clsx("flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all text-center",
                tab === t.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-gray-50")}>
              {t.icon}
              <span className="font-semibold text-sm">{t.label}</span>
              <span className="text-xs text-gray-400 hidden sm:block">{t.desc}</span>
            </button>
          ))}
        </div>
        {tab === "analyse" && <AnalyseTab />}
        {tab === "generate" && <GenerateTab />}
        {tab === "rebuild" && <RebuildTab />}
      </div>
    </ProtectedRoute>
  );
}
