"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cvApi } from "@/lib/api";
import {
  UploadIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon, 
  BriefcaseIcon, SparklesIcon, WrenchIcon, DownloadIcon,
  TrendingUpIcon, UserIcon, BookOpenIcon, AwardIcon, 
  LanguagesIcon, TargetIcon, LightbulbIcon, KeyIcon
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

// ── ATS Score Component ──────────────────────────────────────────────────────
function ATSScore({ score, label }: { score: number; label: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (score >= 70) return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    if (score >= 55) return { text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const colors = getScoreColor(score);

  return (
    <div className={clsx("flex flex-col items-center justify-center p-6 rounded-xl border-2", colors.bg, colors.border)}>
      <div className="flex items-baseline gap-1">
        <span className={clsx("text-4xl font-bold", colors.text)}>{score}</span>
        <span className="text-gray-500 text-sm">/ 100</span>
      </div>
      <span className="text-gray-700 font-medium mt-2 text-sm">{label}</span>
    </div>
  );
}
// ── CV Display Component ──────────────────────────────────────────────────────
function CVDisplay({ text, fullName, showDownload = true }: { text: string; fullName?: string; showDownload?: boolean }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await cvApi.downloadPdf();
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(fullName || "CV").replace(/\s+/g, "_")}_CV.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error: any) {
      console.error("PDF download error:", error);
      alert("PDF generation failed. Please try again.");
    } finally { 
      setPdfLoading(false); 
    }
  };

  let cleanText = text || "";
  
  if (cleanText.includes('"cv_text"')) {
    try {
      const parsed = JSON.parse(cleanText);
      cleanText = parsed.cv_text || cleanText;
    } catch {
      const match = cleanText.match(/"cv_text":\s*"([^"]+(?:\\.[^"]+)*)"/);
      if (match && match[1]) {
        cleanText = match[1];
      }
    }
  }

  cleanText = cleanText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t').trim();

  const lines = cleanText.split("\n");
  const SECTION_KEYWORDS = [
    "EDUCATION", "EXPERIENCE", "WORK EXPERIENCE", "SKILLS", "PROJECTS",
    "CERTIFICATIONS", "ACHIEVEMENTS", "LANGUAGES", "SUMMARY", "PROFESSIONAL SUMMARY",
    "TECHNICAL SKILLS", "CONTACT", "PROFILE"
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FileTextIcon className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Your CV</h3>
        </div>
        {showDownload && (
          <button 
            onClick={downloadPdf} 
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            {pdfLoading ? "Generating..." : "Download PDF"}
          </button>
        )}
      </div>

      <div className="p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-2" />;

          const upper = trimmed.toUpperCase();
          const isSection = SECTION_KEYWORDS.some(k => upper === k || upper.startsWith(k + ":"));
          const isName = i === 0 && !trimmed.includes("@") && !trimmed.includes("|");
          const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-");
          const isContact = trimmed.includes("|") && trimmed.length < 120;

          if (isName) return <h1 key={i} className="text-2xl font-bold text-gray-900 text-center mb-2">{trimmed}</h1>;
          if (isContact) return <p key={i} className="text-sm text-gray-500 text-center mb-4">{trimmed}</p>;
          if (isSection || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 40)) {
            return (
              <div key={i} className="mt-6 mb-3">
                <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wide">{trimmed}</h3>
                <div className="h-px bg-primary-200 mt-1" />
              </div>
            );
          }
          if (isBullet) return <p key={i} className="text-sm text-gray-700 pl-4 mb-1 leading-relaxed">• {trimmed.replace(/^[•\-]\s*/, "")}</p>;
          
          return <p key={i} className="text-sm text-gray-600 mb-1 leading-relaxed">{trimmed}</p>;
        })}
      </div>
    </div>
  );
}
// ── Analysis Results Component ────────────────────────────────────────────────
function AnalysisResults({ analysis }: { analysis: CVAnalysis }) {
  if (!analysis?.analysis) return null;

  const { extracted_skills, skill_gaps, strengths, recommendations, summary } = analysis.analysis;

  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Professional Summary</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {extracted_skills?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Skills Found</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {extracted_skills.map((skill) => (
                <span key={`extracted-${skill}`} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {skill_gaps?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUpIcon className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Skills to Consider</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skill_gaps.map((skill) => (
                <span key={`gap-${skill}`} className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strengths?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AwardIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendations?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Improvement Tips</h3>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {analysis.job_matches && analysis.job_matches.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BriefcaseIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Top Internship Matches</h3>
          </div>
          <div className="space-y-3">
            {analysis.job_matches?.map((match: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-700 font-medium">Internship #{match.internship_id}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
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
// ── Analyse Tab with Persistence ────────────────────────────────────────────
function AnalyseTab() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing analysis on component mount
  useEffect(() => {
    const loadExistingAnalysis = async () => {
      try {
        const res = await cvApi.getAnalysis();
        setAnalysis(res.data);
      } catch (err) {
        // No existing analysis found
      }
    };
    loadExistingAnalysis();
  }, []);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    setFile(f);
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

  const resetUpload = () => {
    setFile(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UploadIcon className="w-5 h-5 text-primary-600" />
          Upload CV for Analysis
        </h2>
        
        <div
          className={clsx(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            dragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
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
          
          <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {file ? (
            <div>
              <p className="font-semibold text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-gray-700">Drop your CV here or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">PDF only, max 5 MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mt-4">
            <AlertCircleIcon className="w-4 h-4" />
            {error}
          </div>
        )}

        {file && !analysis && (
          <button 
            onClick={handleUpload} 
            disabled={loading}
            className="w-full mt-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Analyzing..." : "Analyze CV"}
          </button>
        )}
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">CV analyzed successfully!</span>
          </div>

          <AnalysisResults analysis={analysis} />

          <button 
            onClick={resetUpload}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Upload Another CV
          </button>
        </div>
      )}
    </div>
  );
}
// ── Generate Tab ─────────────────────────────────────────────────────────────
function GenerateTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  
  // Form fields
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
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-medium">CV generated successfully!</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ATSScore score={result.ats_score} label="ATS Score" />
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Summary</h3>
            </div>
            <p className="text-sm text-gray-700">{result.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Keywords Used</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywords_used?.map((keyword: string) => (
                <span key={keyword} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">ATS Tips</h3>
            </div>
            <ul className="space-y-2">
              {result.ats_tips?.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CVDisplay text={result.cv_text || ""} fullName={fullName} />

        <button 
          onClick={() => setResult(null)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Generate Another CV
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircleIcon className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Karachi, Pakistan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/johndoe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="text"
              value={expYears}
              onChange={(e) => setExpYears(e.target.value)}
              placeholder="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
      {/* Education & Experience */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Education & Experience</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="BS Computer Science, FAST NUCES, 2020-2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
            <textarea
              rows={4}
              value={workExp}
              onChange={(e) => setWorkExp(e.target.value)}
              placeholder="Software Intern at XYZ Company (2023)&#10;• Built REST APIs using Python and FastAPI&#10;• Collaborated with team of 5 developers"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
            <textarea
              rows={4}
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              placeholder="E-commerce Website&#10;• Built with React and Node.js&#10;• Implemented user authentication and payment processing"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Skills & Extras */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Skills & Qualifications</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, React, FastAPI, PostgreSQL, Docker, Git, JavaScript, HTML, CSS"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
            <textarea
              rows={2}
              value={certs}
              onChange={(e) => setCerts(e.target.value)}
              placeholder="AWS Certified Developer&#10;Google Data Analytics Certificate"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="English (Fluent), Urdu (Native)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
            <textarea
              rows={2}
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Dean's List 2023&#10;Hackathon Winner - Tech Innovation Challenge"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <SparklesIcon className="w-5 h-5" />
        {loading ? "Generating your CV..." : "Generate ATS-Optimized CV"}
      </button>
    </div>
  );
}
// ── Rebuild Tab ──────────────────────────────────────────────────────────────
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
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-medium">CV rebuilt successfully!</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ATSScore score={result.original_ats_score} label="Original Score" />
          <ATSScore score={result.improved_ats_score} label="Improved Score" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Changes Made</h3>
            </div>
            <ul className="space-y-2">
              {result.changes_made?.map((change: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="leading-relaxed">{change}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Keywords Added</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywords_added?.map((keyword: string) => (
                <span key={keyword} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <WrenchIcon className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Formatting Fixes</h3>
            </div>
            <ul className="space-y-2">
              {result.formatting_fixes?.map((fix: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="leading-relaxed">{fix}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">ATS Tips</h3>
            </div>
            <ul className="space-y-2">
              {result.ats_tips?.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CVDisplay text={result.improved_cv_text} fullName="Improved_CV" />

        <button 
          onClick={() => { setFile(null); setResult(null); }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Rebuild Another CV
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircleIcon className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Target Role */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TargetIcon className="w-5 h-5 text-primary-600" />
          Target Role (Optional)
        </h3>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Software Engineer, Data Analyst"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Providing a target role helps optimize keywords for that specific position.
        </p>
      </div>

      {/* CV Source Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">CV Source</h3>
        
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => { setUseSaved(true); setFile(null); setError(""); }}
            className={clsx(
              "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors",
              useSaved 
                ? "bg-primary-600 text-white border-primary-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Use Saved CV
          </button>
          <button
            onClick={() => { setUseSaved(false); }}
            className={clsx(
              "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors",
              !useSaved 
                ? "bg-primary-600 text-white border-primary-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Upload New PDF
          </button>
        </div>

        {useSaved ? (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
            <FileTextIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700">Your previously saved CV will be used for optimization.</span>
          </div>
        ) : (
          <div
            className={clsx(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              dragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
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
            
            <UploadIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            {file ? (
              <div>
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">Drop PDF here or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">PDF only, max 5 MB</p>
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handleRebuild} 
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <WrenchIcon className="w-5 h-5" />
        {loading ? "Rebuilding..." : "Rebuild & Optimize for ATS"}
      </button>
    </div>
  );
}
// ── Main CV Page Component ───────────────────────────────────────────────────
export default function CVPage() {
  const [tab, setTab] = useState<Tab>("analyse");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      id: "analyse", 
      label: "Analyze CV", 
      icon: <FileTextIcon className="w-5 h-5" />, 
      desc: "Upload PDF & get AI feedback" 
    },
    { 
      id: "generate", 
      label: "Generate CV", 
      icon: <SparklesIcon className="w-5 h-5" />, 
      desc: "Build from scratch with AI" 
    },
    { 
      id: "rebuild", 
      label: "Optimize for ATS", 
      icon: <WrenchIcon className="w-5 h-5" />, 
      desc: "Improve existing CV's ATS score" 
    },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">CV Analysis & Generation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Analyze your existing CV, generate a new one from scratch, or optimize for ATS systems. 
            Get professional feedback and improve your chances of landing interviews.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center",
                tab === t.id
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-gray-50"
              )}
            >
              {t.icon}
              <div>
                <div className="font-semibold text-sm">{t.label}</div>
                <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {tab === "analyse" && <AnalyseTab />}
          {tab === "generate" && <GenerateTab />}
          {tab === "rebuild" && <RebuildTab />}
        </div>
      </div>
    </ProtectedRoute>
  );
}