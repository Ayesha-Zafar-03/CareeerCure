"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cvApi } from "@/lib/api";
import {
  UploadIcon, FileTextIcon, CheckCircle2Icon, AlertCircleIcon, 
  BriefcaseIcon, SparklesIcon, WrenchIcon, DownloadIcon,
  UserIcon, MailIcon, PhoneIcon, MapPinIcon, LinkedinIcon,
  GraduationCapIcon, TrendingUpIcon, AwardIcon, MessageCircleIcon,
  BarChart3Icon, LightbulbIcon, TargetIcon, BookOpenIcon
} from "lucide-react";
import clsx from "clsx";

type Tab = "analyse" | "generate" | "rebuild";

interface CVAnalysis {
  extracted_skills: string[];
  skill_gaps: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

interface UploadResult {
  filename: string;
  analysis: CVAnalysis;
  job_matches: Array<{internship_id: number; score: number}>;
}

// ── Components ────────────────────────────────────────────────────────────────

function ATSScoreCard({ score, label }: { score: number; label: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className={clsx("rounded-xl border-2 p-6", getScoreColor(score))}>
      <div className="text-center">
        <BarChart3Icon className="w-8 h-8 mx-auto mb-2 opacity-70" />
        <div className="text-4xl font-bold">{score}</div>
        <div className="text-sm opacity-70 mb-1">/ 100</div>
        <div className="font-medium">{label}</div>
      </div>
    </div>
  );
}

function InfoCard({ title, children, icon }: { title: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SkillBadge({ skill, variant = "blue" }: { skill: string; variant?: "blue" | "orange" | "green" }) {
  const variants = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200", 
    green: "bg-green-50 text-green-700 border-green-200"
  };
  
  return (
    <span className={clsx("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border", variants[variant])}>
      {skill}
    </span>
  );
}

function RecommendationItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <LightbulbIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <span className="text-sm text-gray-700">{text}</span>
    </div>
  );
}

function CVPreviewCard({ text, fullName }: { text: string; fullName?: string }) {
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
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("PDF download failed:", error);
      alert("PDF download failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const lines = text.split("\n");
  const SECTION_KEYWORDS = [
    "EDUCATION", "EXPERIENCE", "WORK EXPERIENCE", "SKILLS", "PROJECTS",
    "CERTIFICATIONS", "ACHIEVEMENTS", "LANGUAGES", "SUMMARY", "OBJECTIVE",
    "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "CONTACT", "PROFILE"
  ];

  return (
    <InfoCard 
      title="Your CV" 
      icon={<FileTextIcon className="w-5 h-5 text-blue-600" />}
    >
      <div className="mb-4">
        <button 
          onClick={downloadPdf} 
          disabled={pdfLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <DownloadIcon className="w-4 h-4" />
          {pdfLoading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-[400px] overflow-y-auto">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-2" />;

          const upper = trimmed.toUpperCase();
          const isSection = SECTION_KEYWORDS.some(k => upper === k || upper.startsWith(k + ":"));
          const isName = i === 0 && !trimmed.includes("@") && !trimmed.includes("|");
          const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-");
          const isContact = trimmed.includes("|") && trimmed.length < 120;

          if (isName) return <h2 key={i} className="text-xl font-bold text-gray-900 text-center mb-2">{trimmed}</h2>;
          if (isContact) return <p key={i} className="text-sm text-gray-500 text-center mb-4">{trimmed}</p>;
          if (isSection) {
            return (
              <div key={i} className="mt-4 mb-2">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide">{trimmed}</h3>
                <div className="h-px bg-blue-200 mt-1" />
              </div>
            );
          }
          if (isBullet) return <p key={i} className="text-sm text-gray-700 ml-4 mb-1">• {trimmed.replace(/^[•\-]\s*/, "")}</p>;
          return <p key={i} className="text-sm text-gray-600 mb-1">{trimmed}</p>;
        })}
      </div>
    </InfoCard>
  );
}

// ── Analyse Tab ───────────────────────────────────────────────────────────────
function AnalyseTab() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [savedAnalysis, setSavedAnalysis] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved analysis on component mount
  useEffect(() => {
    loadSavedAnalysis();
  }, []);

  const loadSavedAnalysis = async () => {
    try {
      const response = await cvApi.getAnalysis();
      setSavedAnalysis(response.data);
    } catch (error) {
      // No saved analysis - that's fine
    }
  };

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
      const response = await cvApi.upload(file);
      setResult(response.data);
      setSavedAnalysis(response.data); // Update saved analysis
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const currentData = result || savedAnalysis;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <InfoCard
        title="Upload CV for Analysis"
        icon={<UploadIcon className="w-5 h-5 text-blue-600" />}
      >
        <div
          className={clsx(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
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
          
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-gray-100 rounded-full">
              <FileTextIcon className="w-8 h-8 text-gray-600" />
            </div>
            {file ? (
              <div>
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{Math.round(file.size / 1024)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-700">Drop your CV here or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">PDF only, max 5 MB</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mt-4">
            <AlertCircleIcon className="w-4 h-4" />
            {error}
          </div>
        )}

        {file && !result && (
          <button 
            onClick={handleUpload} 
            disabled={loading}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Analysing CV...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Analyse CV
              </>
            )}
          </button>
        )}
      </InfoCard>

      {/* Results Section */}
      {currentData && (
        <>
          {result && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
              <CheckCircle2Icon className="w-5 h-5" />
              <span className="font-medium">CV analysed successfully!</span>
            </div>
          )}

          {/* Analysis Summary */}
          {currentData.analysis?.summary && (
            <InfoCard
              title="Professional Summary"
              icon={<UserIcon className="w-5 h-5 text-blue-600" />}
            >
              <p className="text-gray-700 leading-relaxed">{currentData.analysis.summary}</p>
            </InfoCard>
          )}

          {/* Skills Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Skills */}
            <InfoCard
              title="Skills Found"
              icon={<TargetIcon className="w-5 h-5 text-green-600" />}
            >
              {currentData.analysis?.extracted_skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentData.analysis.extracted_skills.map((skill: string) => (
                    <SkillBadge key={skill} skill={skill} variant="green" />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No technical skills identified</p>
              )}
            </InfoCard>

            {/* Skill Gaps */}
            <InfoCard
              title="Skills to Improve"
              icon={<TrendingUpIcon className="w-5 h-5 text-orange-600" />}
            >
              {currentData.analysis?.skill_gaps?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentData.analysis.skill_gaps.map((skill: string) => (
                    <SkillBadge key={skill} skill={skill} variant="orange" />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No specific skill gaps identified</p>
              )}
            </InfoCard>
          </div>

          {/* Strengths & Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <InfoCard
              title="Key Strengths"
              icon={<AwardIcon className="w-5 h-5 text-blue-600" />}
            >
              {currentData.analysis?.strengths?.length > 0 ? (
                <div className="space-y-2">
                  {currentData.analysis.strengths.map((strength: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2Icon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No specific strengths identified</p>
              )}
            </InfoCard>

            {/* Recommendations */}
            <InfoCard
              title="Improvement Suggestions"
              icon={<LightbulbIcon className="w-5 h-5 text-yellow-600" />}
            >
              {currentData.analysis?.recommendations?.length > 0 ? (
                <div className="space-y-2">
                  {currentData.analysis.recommendations.map((rec: string, index: number) => (
                    <RecommendationItem key={index} text={rec} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No specific recommendations available</p>
              )}
            </InfoCard>
          </div>

          {/* Job Matches */}
          {currentData.job_matches?.length > 0 && (
            <InfoCard
              title="Top Internship Matches"
              icon={<BriefcaseIcon className="w-5 h-5 text-purple-600" />}
            >
              <div className="space-y-3">
                {currentData.job_matches.map((match: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BriefcaseIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Internship #{match.internship_id}</span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                      {Math.round(match.score * 100)}% match
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {/* Upload Another Button */}
          <div className="pt-4">
            <button 
              onClick={() => { setFile(null); setResult(null); setError(""); }} 
              className="w-full px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Upload Another CV
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Generate Tab ──────────────────────────────────────────────────────────────
function GenerateTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  
  // Form fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    targetRole: "",
    expYears: "0",
    summary: "",
    education: "",
    workExp: "",
    skills: "",
    projects: "",
    certs: "",
    languages: "",
    achievements: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.fullName || !formData.email || !formData.targetRole || !formData.education || !formData.skills) {
      setError("Please fill in required fields: Full Name, Email, Target Role, Education, and Skills.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await cvApi.generate({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        linkedin: formData.linkedin,
        target_role: formData.targetRole,
        experience_years: formData.expYears,
        summary: formData.summary,
        education: formData.education,
        work_experience: formData.workExp,
        skills: formData.skills,
        projects: formData.projects,
        certifications: formData.certs,
        languages: formData.languages,
        achievements: formData.achievements,
        use_ai_enhancement: false // Keep it natural
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "CV generation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
          <CheckCircle2Icon className="w-5 h-5" />
          <span className="font-medium">CV generated successfully!</span>
        </div>

        {/* ATS Score & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ATSScoreCard score={result.ats_score} label="ATS Score" />
          
          <InfoCard
            title="Professional Summary"
            icon={<MessageCircleIcon className="w-5 h-5 text-blue-600" />}
          >
            <p className="text-sm text-gray-700">{result.summary}</p>
          </InfoCard>
        </div>

        {/* Keywords & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard
            title="Keywords Used"
            icon={<TargetIcon className="w-5 h-5 text-green-600" />}
          >
            {result.keywords_used?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.keywords_used.map((keyword: string) => (
                  <SkillBadge key={keyword} skill={keyword} variant="blue" />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No keywords identified</p>
            )}
          </InfoCard>

          <InfoCard
            title="ATS Optimization Tips"
            icon={<LightbulbIcon className="w-5 h-5 text-yellow-600" />}
          >
            {result.ats_tips?.length > 0 ? (
              <div className="space-y-2">
                {result.ats_tips.map((tip: string, index: number) => (
                  <RecommendationItem key={index} text={tip} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No specific tips available</p>
            )}
          </InfoCard>
        </div>

        {/* CV Preview */}
        <CVPreviewCard text={result.cv_text || ""} fullName={formData.fullName} />

        {/* Generate Another Button */}
        <button 
          onClick={() => setResult(null)} 
          className="w-full px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
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
      <InfoCard
        title="Personal Information"
        icon={<UserIcon className="w-5 h-5 text-blue-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Karachi, Pakistan"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <div className="relative">
              <LinkedinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => updateField('targetRole', e.target.value)}
                placeholder="Software Engineer"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
          <select
            value={formData.expYears}
            onChange={(e) => updateField('expYears', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0">Fresh Graduate</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="4">4 years</option>
            <option value="5+">5+ years</option>
          </select>
        </div>
      </InfoCard>

      {/* Professional Summary */}
      <InfoCard
        title="Professional Summary"
        icon={<MessageCircleIcon className="w-5 h-5 text-purple-600" />}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          placeholder="Brief professional summary highlighting your key strengths and career objectives..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to auto-generate based on your target role and experience
        </p>
      </InfoCard>

      {/* Education & Experience */}
      <InfoCard
        title="Education & Experience"
        icon={<GraduationCapIcon className="w-5 h-5 text-green-600" />}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.education}
              onChange={(e) => updateField('education', e.target.value)}
              placeholder="BS Computer Science, FAST NUCES, 2020-2024&#10;Relevant coursework: Data Structures, Algorithms, Database Systems"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Experience
            </label>
            <textarea
              rows={4}
              value={formData.workExp}
              onChange={(e) => updateField('workExp', e.target.value)}
              placeholder="Software Development Intern | XYZ Company | Summer 2023&#10;• Developed REST APIs using Python and FastAPI&#10;• Collaborated with team of 5 developers on web applications&#10;• Implemented automated testing reducing bugs by 30%"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
            <textarea
              rows={3}
              value={formData.projects}
              onChange={(e) => updateField('projects', e.target.value)}
              placeholder="E-commerce Web App | React, Node.js, MongoDB&#10;• Built full-stack application with user authentication&#10;• Implemented payment gateway integration&#10;• Deployed on AWS with 99% uptime"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      </InfoCard>

      {/* Skills & Additional Info */}
      <InfoCard
        title="Skills & Additional Information"
        icon={<BookOpenIcon className="w-5 h-5 text-orange-600" />}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Skills <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.skills}
              onChange={(e) => updateField('skills', e.target.value)}
              placeholder="Python, JavaScript, React, Node.js, FastAPI, PostgreSQL, MongoDB, Docker, Git, AWS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
            <textarea
              rows={2}
              value={formData.certs}
              onChange={(e) => updateField('certs', e.target.value)}
              placeholder="AWS Certified Developer Associate&#10;Google Data Analytics Professional Certificate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <input
                type="text"
                value={formData.languages}
                onChange={(e) => updateField('languages', e.target.value)}
                placeholder="English (Fluent), Urdu (Native), Arabic (Conversational)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
              <input
                type="text"
                value={formData.achievements}
                onChange={(e) => updateField('achievements', e.target.value)}
                placeholder="Dean's List 2023, Hackathon Winner, Published Research"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Generate Button */}
      <button 
        onClick={handleGenerate} 
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Generating your CV...
          </>
        ) : (
          <>
            <SparklesIcon className="w-4 h-4" />
            Generate Professional CV
          </>
        )}
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
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleRebuild = async () => {
    if (!file && !useSaved) {
      setError("Please upload a PDF or use your saved CV.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await cvApi.rebuild(targetRole, file || undefined);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "CV rebuild failed.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
          <CheckCircle2Icon className="w-5 h-5" />
          <span className="font-medium">CV rebuilt successfully!</span>
        </div>

        {/* ATS Score Comparison */}
        <div className="grid grid-cols-2 gap-6">
          <ATSScoreCard score={result.original_ats_score || 0} label="Original Score" />
          <ATSScoreCard score={result.improved_ats_score || 0} label="Improved Score" />
        </div>

        {/* Improvement Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Changes Made */}
          <InfoCard
            title="Changes Made"
            icon={<WrenchIcon className="w-5 h-5 text-green-600" />}
          >
            {result.changes_made?.length > 0 ? (
              <div className="space-y-2">
                {result.changes_made.map((change: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2Icon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{change}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No specific changes recorded</p>
            )}
          </InfoCard>

          {/* Keywords Added */}
          <InfoCard
            title="Keywords Added"
            icon={<TargetIcon className="w-5 h-5 text-blue-600" />}
          >
            {result.keywords_added?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.keywords_added.map((keyword: string) => (
                  <SkillBadge key={keyword} skill={keyword} variant="blue" />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No keywords added</p>
            )}
          </InfoCard>

          {/* Formatting Fixes */}
          <InfoCard
            title="Formatting Improvements"
            icon={<FileTextIcon className="w-5 h-5 text-orange-600" />}
          >
            {result.formatting_fixes?.length > 0 ? (
              <div className="space-y-2">
                {result.formatting_fixes.map((fix: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <WrenchIcon className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{fix}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No formatting fixes applied</p>
            )}
          </InfoCard>

          {/* ATS Tips */}
          <InfoCard
            title="ATS Optimization Tips"
            icon={<LightbulbIcon className="w-5 h-5 text-yellow-600" />}
          >
            {result.ats_tips?.length > 0 ? (
              <div className="space-y-2">
                {result.ats_tips.map((tip: string, index: number) => (
                  <RecommendationItem key={index} text={tip} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No additional tips available</p>
            )}
          </InfoCard>
        </div>

        {/* Improved CV Preview */}
        <CVPreviewCard text={result.improved_cv_text} fullName="Improved_CV" />

        {/* Rebuild Another Button */}
        <button 
          onClick={() => { setFile(null); setResult(null); setError(""); }} 
          className="w-full px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
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
      <InfoCard
        title="Target Role (Optional)"
        icon={<BriefcaseIcon className="w-5 h-5 text-purple-600" />}
      >
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Software Engineer, Data Analyst, Product Manager"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Providing a target role helps optimize keywords for that specific position.
        </p>
      </InfoCard>

      {/* CV Source Selection */}
      <InfoCard
        title="Choose CV Source"
        icon={<FileTextIcon className="w-5 h-5 text-blue-600" />}
      >
        <div className="space-y-4">
          {/* Toggle Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setUseSaved(false)}
              className={clsx(
                "flex-1 py-3 px-4 rounded-lg border font-medium transition-colors",
                !useSaved 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              )}
            >
              Upload New PDF
            </button>
            <button
              onClick={() => { setUseSaved(true); setFile(null); setError(""); }}
              className={clsx(
                "flex-1 py-3 px-4 rounded-lg border font-medium transition-colors",
                useSaved 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              )}
            >
              Use Saved CV
            </button>
          </div>

          {/* Upload Section */}
          {!useSaved && (
            <div
              className={clsx(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
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
              
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-gray-100 rounded-full">
                  <UploadIcon className="w-8 h-8 text-gray-600" />
                </div>
                {file ? (
                  <div>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-700">Drop PDF here or click to browse</p>
                    <p className="text-sm text-gray-500">PDF only, max 5 MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Saved CV Indicator */}
          {useSaved && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
              <FileTextIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Your previously saved CV will be used for optimization.
              </span>
            </div>
          )}
        </div>
      </InfoCard>

      {/* Rebuild Button */}
      <button 
        onClick={handleRebuild} 
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Rebuilding CV...
          </>
        ) : (
          <>
            <WrenchIcon className="w-4 h-4" />
            Rebuild & Optimize for ATS
          </>
        )}
      </button>
    </div>
  );
}

// ── Main CV Page ──────────────────────────────────────────────────────────────
export default function CVPage() {
  const [tab, setTab] = useState<Tab>("analyse");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      id: "analyse", 
      label: "Analyse CV", 
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
      label: "Rebuild for ATS", 
      icon: <WrenchIcon className="w-5 h-5" />, 
      desc: "Improve existing CV's ATS score" 
    },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">CV Analysis & Generation</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Analyze your current CV, generate a new one from scratch, or rebuild an existing CV 
            with AI-powered ATS optimization to improve your job application success rate.
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
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50 shadow-sm"
              )}
            >
              <div className={clsx(
                "p-3 rounded-full",
                tab === t.id ? "bg-blue-100" : "bg-gray-100"
              )}>
                {t.icon}
              </div>
              <div>
                <span className="font-semibold text-lg block">{t.label}</span>
                <span className="text-sm opacity-80 mt-1 block">{t.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            {tab === "analyse" && <AnalyseTab />}
            {tab === "generate" && <GenerateTab />}
            {tab === "rebuild" && <RebuildTab />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
