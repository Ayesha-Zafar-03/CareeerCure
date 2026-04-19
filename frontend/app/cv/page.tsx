"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { cvApi } from "@/lib/api";
import { UploadCloudIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon, BriefcaseIcon } from "lucide-react";
import clsx from "clsx";

export default function CVPage() {
  const [file, setFile] = useState<File | null>(null);
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
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await cvApi.upload(file);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Analysis</h1>
        <p className="text-gray-500 mb-8">Upload your PDF CV and get instant AI-powered feedback</p>

        {/* Upload area */}
        <div
          className={clsx(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-6",
            dragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Upload CV PDF"
        >
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <UploadCloudIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          {file ? (
            <div>
              <p className="font-semibold text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB — Click to change</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-gray-700">Drop your CV here or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">PDF only, max 5 MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {file && !result && (
          <button onClick={handleUpload} disabled={loading} className="btn-primary w-full mb-8">
            {loading ? "Analysing your CV..." : "Analyse CV"}
          </button>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">CV analysed successfully!</span>
            </div>

            {/* Summary */}
            {result.analysis?.summary && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileTextIcon className="w-5 h-5 text-primary-600" /> Summary</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{result.analysis.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-3">✅ Extracted Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {result.analysis?.extracted_skills?.map((s: string) => (
                    <span key={s} className="badge bg-blue-100 text-blue-700">{s}</span>
                  ))}
                </div>
              </div>

              {/* Gaps */}
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-3">⚠️ Skill Gaps</h2>
                <div className="flex flex-wrap gap-2">
                  {result.analysis?.skill_gaps?.map((s: string) => (
                    <span key={s} className="badge bg-orange-100 text-orange-700">{s}</span>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-3">💪 Strengths</h2>
                <ul className="space-y-1 text-sm text-gray-700">
                  {result.analysis?.strengths?.map((s: string) => (
                    <li key={s} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-3">💡 Recommendations</h2>
                <ul className="space-y-1 text-sm text-gray-700">
                  {result.analysis?.recommendations?.map((r: string) => (
                    <li key={r} className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Job Matches */}
            {result.job_matches?.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BriefcaseIcon className="w-5 h-5 text-green-600" /> Top Internship Matches</h2>
                <div className="space-y-3">
                  {result.job_matches.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Internship #{m.internship_id}</span>
                      <span className="badge bg-green-100 text-green-700">{(m.score * 100).toFixed(0)}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setFile(null); setResult(null); }} className="btn-secondary w-full">
              Upload Another CV
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
