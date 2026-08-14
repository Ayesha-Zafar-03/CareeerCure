"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/ChatWidget";
import { cvApi } from "@/lib/api";
import {
  UploadIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon,
  BriefcaseIcon, SparklesIcon, WrenchIcon, DownloadIcon,
  TrendingUpIcon, UserIcon, AwardIcon,
  TargetIcon, LightbulbIcon, KeyIcon,
  CompassIcon, FileDownIcon, ArrowRightIcon
} from "lucide-react";
import clsx from "clsx";

type Tab = "analyse" | "generate" | "rebuild";

interface CVAnalysis {
  filename?: string;
  analysis?: {
    extracted_skills: string[];
    skill_gaps: string[];
    strengths: string[];
    recommendations: string[];
    summary: string;
  };
  job_matches?: any[];
}

const KNOWN_SECTIONS = [
  "SUMMARY", "PROFESSIONAL SUMMARY", "CAREER OBJECTIVE", "OBJECTIVE",
  "EDUCATION", "ACADEMIC BACKGROUND",
  "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "RELEVANT EXPERIENCE",
  "SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES", "KEY SKILLS",
  "PROJECTS", "KEY PROJECTS", "ACADEMIC PROJECTS",
  "CERTIFICATIONS", "CERTIFICATES", "LICENSES",
  "ACHIEVEMENTS", "HONORS", "AWARDS",
  "LANGUAGES",
  "CONTACT", "PERSONAL INFORMATION",
  "PROFILE", "PERSONAL PROFILE",
  "PUBLICATIONS", "RESEARCH",
  "LEADERSHIP", "VOLUNTEERING", "VOLUNTEER EXPERIENCE",
  "REFERENCES", "ADDITIONAL INFORMATION"
];

function isSectionLine(line: string): boolean {
  const u = line.toUpperCase().trim();
  if (u.length < 3 || u.length > 50) return false;
  const exact = KNOWN_SECTIONS.includes(u);
  if (exact) return true;
  const startsWith = KNOWN_SECTIONS.some(k => u.startsWith(k + ":") || u.startsWith(k + " ") || u.startsWith(k + "\t"));
  if (startsWith) return true;
  if (u === u && line.trim() === u && u.length >= 4 && u.length <= 45 && !line.includes("@") && !line.includes("|") && !line.includes("http") && !line.includes("•") && !line.startsWith("-") && !line.startsWith("*") && !line.match(/^\d/) && !line.includes("(") && !line.includes(")") && !line.includes(";") && !line.includes(",")) {
    const lower = line.trim().toLowerCase();
    if (["the", "and", "for", "with", "from", "this", "that", "have", "been", "will", "ltd", "inc", "corp", "pvt", "llc", "tel", "phone", "email", "web", "www"].includes(lower)) return false;
    if (lower.includes("university") || lower.includes("college") || lower.includes("institute") || lower.includes("school") || lower.includes("company")) return false;
    if (lower.length >= 8) return false;
    return true;
  }
  return false;
}

function extractNameFromText(text: string): string | null {
  if (!text) return null;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const knownSections = new Set(KNOWN_SECTIONS.map(s => s.toUpperCase()));
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 &&
        !line.includes("@") && !line.includes("|") &&
        !line.includes("http") && !line.includes("•") &&
        !line.includes("/") && !line.match(/^\d/) &&
        !knownSections.has(line.toUpperCase().trim()) &&
        words.every(w => /^[A-Za-z]/.test(w))) {
      return line;
    }
  }
  return null;
}

function sanitizeFilename(name: string): string {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
}

function cleanCvText(raw: string): string {
  let t = raw || "";
  if (typeof t === 'object' && (t as any).cv_text) {
    t = (t as any).cv_text;
  } else if (typeof t === 'string' && t.includes('"cv_text"')) {
    try {
      const parsed = JSON.parse(t);
      t = parsed.cv_text || t;
    } catch {
      const m = t.match(/"cv_text":\s*"([^"]*(?:\\.[^"]*)*)"/);
      if (m && m[1]) t = m[1];
    }
  }
  return t
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\t/g, '    ')
    .replace(/\\\\/g, '\\')
    .replace(/\\r/g, '')
    .trim();
}

interface ParsedLine {
  type: "name" | "contact" | "section" | "bullet" | "important" | "normal" | "empty";
  text: string;
  section?: string;
}

function parseCvLines(cleanText: string): ParsedLine[] {
  const lines = cleanText.split("\n").map(l => l.trim());
  const result: ParsedLine[] = [];
  const seenSections = new Set<string>();
  let nameFound = false;
  let contactLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.length === 0) {
      result.push({ type: "empty", text: "" });
      continue;
    }
    if (line.match(/^-{3,}$/) && line.length > 3) {
      continue;
    }
    if (!nameFound && !line.includes("@") && !line.includes("|") && !line.startsWith("•") && !line.startsWith("-") && !line.startsWith("*") && !line.startsWith("▪") && line.length >= 2 && line.length <= 80) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 5 && !isSectionLine(line) && words.every(w => /^[A-Za-z]/.test(w))) {
        if (i <= Math.min(5, lines.length - 1)) {
          result.push({ type: "name", text: line });
          nameFound = true;
          continue;
        }
      }
    }
    if (!nameFound && i < 5) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 5 && !line.includes("@") && !line.includes("|") && !line.includes("http") && !line.startsWith("•") && !line.startsWith("-") && !isSectionLine(line) && words.every(w => /^[A-Za-z]/.test(w))) {
        result.push({ type: "name", text: line });
        nameFound = true;
        continue;
      }
    }
    const isContactMatch = (line.includes("|") || line.includes("@") || line.toLowerCase().includes("linkedin")) && line.length < 150;
    if (isContactMatch && contactLines < 2) {
      result.push({ type: "contact", text: line });
      contactLines++;
      continue;
    }
    if (line.includes("|") && contactLines < 2) {
      result.push({ type: "contact", text: line });
      contactLines++;
      continue;
    }
    if (isSectionLine(line)) {
      const sectionKey = line.toUpperCase().trim();
      const matchedKeyword = KNOWN_SECTIONS.find(k => {
        const u = sectionKey;
        return u === k || u.startsWith(k + ":") || u.startsWith(k + " ") || u.startsWith(k + "\t");
      });
      const dedupKey = matchedKeyword || sectionKey;
      if (!seenSections.has(dedupKey)) {
        seenSections.add(dedupKey);
        result.push({ type: "section", text: line, section: sectionKey });
      } else {
        result.push({ type: "normal", text: line });
      }
      continue;
    }
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("▪") || /^\d+[.)]\s/.test(line);
    if (isBullet) {
      result.push({ type: "bullet", text: line });
      continue;
    }
    const isImportant = (
      line.length < 120 &&
      !line.includes("@") &&
      !line.includes("|") &&
      (
        /\b(engineer|developer|analyst|manager|intern|associate|specialist|bachelor|master|phd|degree|university|college|institute)\b/i.test(line) ||
        /\b(company|corp|inc|ltd|technologies|systems|solutions|group)\b/i.test(line)
      )
    );
    if (isImportant) {
      result.push({ type: "important", text: line });
      continue;
    }
    result.push({ type: "normal", text: line });
  }
  return result;
}

function ATSScore({ score, label }: { score: number; label: string }) {
  const getScoreColors = (score: number) => {
    if (score >= 85) return { text: "text-accent", border: "border-accent/40" };
    if (score >= 70) return { text: "text-primary", border: "border-primary/40" };
    if (score >= 55) return { text: "text-primary/70", border: "border-line" };
    return { text: "text-primary/40", border: "border-line" };
  };
  const colors = getScoreColors(score);
  return (
    <div className={clsx(
      "flex flex-col items-center justify-center p-6 rounded-lg border-2 bg-surface transition-shadow hover:shadow-sm",
      colors.border
    )}>
      <div className="flex items-baseline gap-1">
        <span className={clsx("text-4xl font-serif font-medium", colors.text)}>{score}</span>
        <span className="text-primary/40 text-sm font-mono">/ 100</span>
      </div>
      <span className="text-primary/70 font-medium mt-2 text-sm">{label}</span>
    </div>
  );
}

function CVDisplay({ text, fullName, showDownload = true }: { text: string; fullName?: string; showDownload?: boolean }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const cleanText = cleanCvText(text);
  const parsedLines = parseCvLines(cleanText);
  const displayName = fullName || extractNameFromText(cleanText) || "";

  const downloadPdf = useCallback(async () => {
    setPdfLoading(true);
    try {
      const caption = displayName || extractNameFromText(cleanCvText(text)) || "CV";
      const filename = sanitizeFilename(caption) + "_CV.pdf";
      const res = await cvApi.generatePdf(cleanText, caption);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("PDF download error:", error);
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [text, displayName, cleanText]);

  return (
    <div className="bg-surface border border-line rounded-lg shadow-sm transition-shadow hover:shadow">
      <div className="flex items-center justify-between p-6 border-b border-line">
        <div className="flex items-center gap-2">
          <FileTextIcon className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-medium text-primary">Your CV</h3>
        </div>
        {showDownload && (
          <button
            onClick={downloadPdf}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-d disabled:bg-primary/50 text-white text-sm font-medium rounded-lg transition-all hover:shadow-sm"
          >
            <FileDownIcon className="w-4 h-4" />
            {pdfLoading ? "Preparing..." : "Download PDF"}
          </button>
        )}
      </div>

      <div className="p-6 bg-paper max-h-[600px] overflow-y-auto">
        {parsedLines.length === 0 ? (
          <div className="text-center py-8 text-primary/50">
            <FileTextIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No CV content to display</p>
          </div>
        ) : (
          parsedLines.map((pl, i) => {
            if (pl.type === "empty") return <div key={i} className="h-1.5" />;
            if (pl.type === "name") return (
              <h1 key={i} className="text-2xl font-serif font-semibold text-primary text-center mb-1 mt-0.5">
                {pl.text}
              </h1>
            );
            if (pl.type === "contact") return (
              <p key={i} className="text-sm text-primary/60 text-center mb-2 font-light">
                {pl.text}
              </p>
            );
            if (pl.type === "section") return (
              <div key={i} className="mt-4 mb-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                  {pl.text}
                </h3>
                <div className="h-0.5 bg-primary/20 mt-1 rounded" />
              </div>
            );
            if (pl.type === "bullet") {
              const cleaned = pl.text.replace(/^[•\-\*▪\d.)]\s*/, "");
              return (
                <p key={i} className="text-sm text-primary/80 pl-4 mb-1.5 leading-relaxed">
                  <span className="text-primary mr-1">•</span>
                  {cleaned}
                </p>
              );
            }
            if (pl.type === "important") return (
              <p key={i} className="text-sm text-primary font-semibold mb-1.5 leading-relaxed">
                {pl.text}
              </p>
            );
            return (
              <p key={i} className="text-sm text-primary/70 mb-0.5 leading-relaxed">
                {pl.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}

function AnalysisResults({ analysis }: { analysis: CVAnalysis }) {
  if (!analysis?.analysis) return null;
  const { extracted_skills, skill_gaps, strengths, recommendations, summary } = analysis.analysis;
  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="w-5 h-5 text-accent" />
            <h3 className="font-serif font-medium text-primary">Professional Summary</h3>
          </div>
          <p className="text-primary/80 leading-relaxed">{summary}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {extracted_skills?.length > 0 && (
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="w-5 h-5 text-accent" />
              <h3 className="font-serif font-medium text-primary">Skills Found</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {extracted_skills.map((skill, index) => (
                <span key={`extracted-skill-${index}`} className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-sm font-medium transition-colors hover:bg-accent/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skill_gaps?.length > 0 && (
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUpIcon className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-medium text-primary">Skills to Consider</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skill_gaps.map((skill, index) => (
                <span key={`gap-skill-${index}`} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium transition-colors hover:bg-primary/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strengths?.length > 0 && (
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AwardIcon className="w-5 h-5 text-accent" />
              <h3 className="font-serif font-medium text-primary">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-primary/80">
                  <span className="text-accent mt-1">•</span>
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {recommendations?.length > 0 && (
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-medium text-primary">Improvement Tips</h3>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-primary/80">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {analysis.job_matches && analysis.job_matches.length > 0 && (
        <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BriefcaseIcon className="w-5 h-5 text-accent" />
            <h3 className="font-serif font-medium text-primary">Top Job Matches</h3>
          </div>
          <div className="space-y-3">
            {analysis.job_matches?.map((match: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-paper rounded-lg border border-line transition-colors hover:border-primary/40">
                <span className="text-sm text-primary/80 font-medium">Job #{match.internship_id}</span>
                <span className="px-2 py-1 bg-accent/15 text-accent text-xs font-semibold rounded-full">
                  {(match.score * 100).toFixed(0)}% match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyseTab() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadExistingAnalysis = async () => {
      try {
        const res = await cvApi.getAnalysis();
        setAnalysis(res.data);
      } catch (err) {}
    };
    loadExistingAnalysis();
  }, []);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setAnalysis(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await cvApi.upload(file);
      setAnalysis(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => { setFile(null); setAnalysis(null); setError(""); };

  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPdf = useCallback(async () => {
    setPdfLoading(true);
    try {
      const res = await cvApi.downloadPdf();
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = analysis?.filename ? analysis.filename.replace(/\.(txt|pdf)$/i, "") + "_CV.pdf" : "CV.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF download error:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [analysis?.filename]);

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-line rounded-lg p-6">
        <h2 className="font-serif font-medium text-primary mb-4 flex items-center gap-2">
          <UploadIcon className="w-5 h-5 text-primary" />
          Upload CV for Analysis
        </h2>
        <div
          className={clsx(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            dragging ? "border-primary bg-primary/10" : "border-line hover:border-primary/50 hover:bg-primary/5"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <UploadIcon className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          {file ? (
            <div>
              <p className="font-semibold text-primary">{file.name}</p>
              <p className="text-sm text-primary/60 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-primary/80">Drop your CV here or click to browse</p>
              <p className="text-sm text-primary/50 mt-1 font-mono tracking-wide">PDF only, max 5 MB</p>
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm px-4 py-3 rounded-lg mt-4">
            <AlertCircleIcon className="w-4 h-4" />
            {error}
          </div>
        )}
        {file && !analysis && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-4 bg-primary hover:bg-primary-d disabled:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-all hover:shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? "Analyzing..." : "Analyze CV"}
          </button>
        )}
      </div>
      {analysis && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-accent bg-accent/10 border border-accent/20 px-4 py-3 rounded-lg">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">CV analyzed successfully!</span>
          </div>
          <AnalysisResults analysis={analysis} />
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-lg transition-all hover:shadow-sm flex items-center justify-center gap-2"
            >
              Continue to Dashboard
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="flex-1 bg-paper hover:bg-line/60 text-primary font-medium py-3 px-4 rounded-lg transition-colors border border-line flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileDownIcon className="w-4 h-4" />
              {pdfLoading ? "Preparing..." : "Download PDF"}
            </button>
            <button
              onClick={resetUpload}
              className="flex-1 bg-paper hover:bg-line/60 text-primary font-medium py-3 px-4 rounded-lg transition-colors border border-line"
            >
              Upload Another CV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
      setError("Please fill required fields: Full Name, Email, Target Role, Education, Skills");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await cvApi.generate({
        full_name: fullName,
        email,
        phone,
        location,
        linkedin,
        target_role: targetRole,
        experience_years: expYears,
        education,
        work_experience: workExp,
        skills,
        projects,
        certifications: certs,
        languages,
        achievements
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "CV generation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-accent bg-accent/10 border border-accent/20 px-4 py-3 rounded-lg">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-medium">CV generated successfully!</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ATSScore score={result.ats_score} label="ATS Score" />
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="w-5 h-5 text-accent" />
              <h3 className="font-serif font-medium text-primary">Summary</h3>
            </div>
            <p className="text-sm text-primary/80">{result.summary}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <KeyIcon className="w-5 h-5 text-accent" />
              <h3 className="font-serif font-medium text-primary">Keywords Used</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywords_used?.map((keyword: string, index: number) => (
                <span key={`keyword-${index}`} className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-sm font-medium transition-colors hover:bg-accent/20">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-medium text-primary">ATS Tips</h3>
            </div>
            <ul className="space-y-2">
              {result.ats_tips?.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-primary/80">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <CVDisplay text={result.cv_text || ""} fullName={fullName || extractNameFromText(result.cv_text) || undefined} />
        <button
          onClick={() => setResult(null)}
          className="w-full bg-paper hover:bg-line/60 text-primary font-medium py-2 px-4 rounded-lg transition-colors border border-line"
        >
          Generate Another CV
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm px-4 py-3 rounded-lg">
          <AlertCircleIcon className="w-4 h-4" />
          {error}
        </div>
      )}
      <div className="bg-surface border border-line rounded-lg p-6">
        <h3 className="font-serif font-medium text-primary mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Full Name <span className="text-primary">*</span>
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Email <span className="text-primary">*</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lahore, Pakistan" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">LinkedIn</label>
            <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/johndoe" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Target Role <span className="text-primary">*</span>
            </label>
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Software Engineer" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Years of Experience</label>
            <input type="text" value={expYears} onChange={(e) => setExpYears(e.target.value)} placeholder="2" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
        </div>
      </div>
      <div className="bg-surface border border-line rounded-lg p-6">
        <h3 className="font-serif font-medium text-primary mb-4">Education & Experience</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Education <span className="text-primary">*</span>
            </label>
            <textarea rows={3} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="BS Computer Science, FAST NUCES, 2020-2024" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink resize-none transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Work Experience</label>
            <textarea rows={4} value={workExp} onChange={(e) => setWorkExp(e.target.value)} placeholder="Software Intern at XYZ Company (2023)&#10;• Built REST APIs using Python and FastAPI&#10;• Collaborated with team of 5 developers" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink resize-none transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Projects</label>
            <textarea rows={4} value={projects} onChange={(e) => setProjects(e.target.value)} placeholder="E-commerce Website&#10;• Built with React and Node.js&#10;• Implemented user authentication and payment processing" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink resize-none transition-colors hover:border-primary/40" />
          </div>
        </div>
      </div>
      <div className="bg-surface border border-line rounded-lg p-6">
        <h3 className="font-serif font-medium text-primary mb-4">Skills & Qualifications</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">
              Skills <span className="text-primary">*</span>
            </label>
            <textarea rows={3} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, React, FastAPI, PostgreSQL, Docker, Git, JavaScript, HTML, CSS" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink resize-none transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Certifications</label>
            <textarea rows={2} value={certs} onChange={(e) => setCerts(e.target.value)} placeholder="AWS Certified Developer&#10;Google Data Analytics Certificate" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink resize-none transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Languages</label>
            <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English (Fluent), Urdu (Native)" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 mb-2">Achievements</label>
            <textarea rows={2} value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="Dean's List 2023&#10;Hackathon Winner - Tech Innovation Challenge" className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40" />
          </div>
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-d disabled:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-all hover:shadow-sm flex items-center justify-center gap-2"
      >
        <SparklesIcon className="w-5 h-5" />
        {loading ? "Generating your CV..." : "Generate ATS-Optimized CV"}
      </button>
    </div>
  );
}

function RebuildTab() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [useSaved, setUseSaved] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleRebuild = async () => {
    if (!useSaved && !file) {
      setError("Please upload a PDF or use your saved CV.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await cvApi.rebuild(targetRole, useSaved ? undefined : file || undefined);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "CV rebuild failed.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-accent bg-accent/10 border border-accent/20 px-4 py-3 rounded-lg">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-medium">CV rebuilt successfully!</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ATSScore score={result.original_ats_score} label="Original Score" />
          <ATSScore score={result.improved_ats_score} label="Improved Score" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="w-5 h-5 text-accent" />
              <h3 className="font-serif font-medium text-primary">Changes Made</h3>
            </div>
            <ul className="space-y-2">
              {result.changes_made?.map((change: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-primary/80">
                  <span className="text-accent mt-1">•</span>
                  <span className="leading-relaxed">{change}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <KeyIcon className="w-5 h-5 text-accent" />
              <h3 className="font-serif font-medium text-primary">Keywords Added</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywords_added?.map((keyword: string, index: number) => (
                <span key={`added-keyword-${index}`} className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-sm font-medium transition-colors hover:bg-accent/20">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <WrenchIcon className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-medium text-primary">Formatting Fixes</h3>
            </div>
            <ul className="space-y-2">
              {result.formatting_fixes?.map((fix: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-primary/80">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">{fix}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface border border-line rounded-lg p-6 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-medium text-primary">ATS Tips</h3>
            </div>
            <ul className="space-y-2">
              {result.ats_tips?.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-primary/80">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <CVDisplay text={result.improved_cv_text || result.cv_text || ""} fullName={extractNameFromText(result.improved_cv_text || result.cv_text || "") || undefined} />
        <button
          onClick={() => { setFile(null); setResult(null); }}
          className="w-full bg-paper hover:bg-line/60 text-primary font-medium py-2 px-4 rounded-lg transition-colors border border-line"
        >
          Rebuild Another CV
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm px-4 py-3 rounded-lg">
          <AlertCircleIcon className="w-4 h-4" />
          {error}
        </div>
      )}
      <div className="bg-surface border border-line rounded-lg p-6">
        <h3 className="font-serif font-medium text-primary mb-4 flex items-center gap-2">
          <TargetIcon className="w-5 h-5 text-primary" />
          Target Role (Optional)
        </h3>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Software Engineer, Data Analyst"
          className="w-full px-3 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface text-ink transition-colors hover:border-primary/40"
        />
        <p className="text-xs text-primary/50 mt-2 font-mono tracking-wide">
          Providing a target role helps optimize keywords for that specific position.
        </p>
      </div>
      <div className="bg-surface border border-line rounded-lg p-6">
        <h3 className="font-serif font-medium text-primary mb-4">CV Source</h3>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => { setUseSaved(true); setFile(null); setError(""); }}
            className={clsx(
              "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all",
              useSaved
                ? "bg-primary text-white border-primary hover:bg-primary-d"
                : "bg-surface text-ink/70 border-line hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            Use Saved CV
          </button>
          <button
            onClick={() => { setUseSaved(false); }}
            className={clsx(
              "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all",
              !useSaved
                ? "bg-primary text-white border-primary hover:bg-primary-d"
                : "bg-surface text-ink/70 border-line hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            Upload New PDF
          </button>
        </div>
        {useSaved ? (
          <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-3 rounded-lg">
            <FileTextIcon className="w-5 h-5 text-accent" />
            <span className="text-sm text-accent">Your previously saved CV will be used for optimization.</span>
          </div>
        ) : (
          <div
            className={clsx(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
              dragging ? "border-primary bg-primary/10" : "border-line hover:border-primary/50 hover:bg-primary/5"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <UploadIcon className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            {file ? (
              <div>
                <p className="font-semibold text-primary">{file.name}</p>
                <p className="text-sm text-primary/60 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-primary/80">Drop PDF here or click to browse</p>
                <p className="text-sm text-primary/50 mt-1 font-mono tracking-wide">PDF only, max 5 MB</p>
              </div>
            )}
          </div>
        )}
      </div>
      <button
        onClick={handleRebuild}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-d disabled:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-all hover:shadow-sm flex items-center justify-center gap-2"
      >
        <WrenchIcon className="w-5 h-5" />
        {loading ? "Rebuilding..." : "Rebuild & Optimize for ATS"}
      </button>
    </div>
  );
}

export default function CVPage() {
  const [tab, setTab] = useState<Tab>("analyse");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "analyse", label: "Analyze CV", icon: <FileTextIcon className="w-5 h-5" />, desc: "Upload PDF & get AI feedback" },
    { id: "generate", label: "Generate CV", icon: <SparklesIcon className="w-5 h-5" />, desc: "Build from scratch with AI" },
    { id: "rebuild", label: "Optimize for ATS", icon: <WrenchIcon className="w-5 h-5" />, desc: "Improve existing CV's ATS score" },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
          <div className="relative mb-10 border-b border-line pb-8 overflow-hidden">
            <svg
              className="pointer-events-none absolute -right-10 -top-16 w-[420px] h-[280px] opacity-[0.06]"
              viewBox="0 0 420 280"
              fill="none"
              aria-hidden="true"
            >
              <path d="M-20 60 C 100 10, 220 110, 340 40 S 500 20, 560 70" stroke="#b2892e" strokeWidth="1.5" />
              <path d="M-20 110 C 100 60, 220 160, 340 90 S 500 70, 560 120" stroke="#b2892e" strokeWidth="1.5" />
              <path d="M-20 160 C 100 110, 220 210, 340 140 S 500 120, 560 170" stroke="#b2892e" strokeWidth="1.5" />
              <path d="M-20 210 C 100 110, 220 260, 340 190 S 500 120, 560 220" stroke="#b2892e" strokeWidth="1.5" />
            </svg>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <CompassIcon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-primary">
                  CV Analysis &amp; Generation
                </p>
              </div>
              <h1 className="font-serif font-medium text-5xl sm:text-6xl text-primary tracking-tight mb-3">
                Build Your Perfect CV
              </h1>
              <p className="text-primary/60 max-w-md text-[15px] font-light leading-relaxed">
                Analyze your existing CV, generate a new one from scratch, or optimize for
                ATS systems. Get professional feedback and improve your chances of landing
                interviews.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "flex flex-col items-center gap-3 p-6 rounded-lg border transition-all duration-200 text-center bg-surface",
                  tab === t.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-line text-primary/70 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5"
                )}
              >
                {t.icon}
                <div>
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs text-primary/50 mt-1 font-mono tracking-wide">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="min-h-[600px]">
            {tab === "analyse" && <AnalyseTab />}
            {tab === "generate" && <GenerateTab />}
            {tab === "rebuild" && <RebuildTab />}
          </div>
        </div>
      </div>
      <ChatWidget />
    </ProtectedRoute>
  );
}
