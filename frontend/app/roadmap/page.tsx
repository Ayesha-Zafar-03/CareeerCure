"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { roadmapApi } from "@/lib/api";
import { MapIcon, ClockIcon, TargetIcon, BookOpenIcon, CheckCircleIcon } from "lucide-react";

export default function RoadmapPage() {
  const [careerGoal, setCareerGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [pastRoadmaps, setPastRoadmaps] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    roadmapApi.list().then((res) => setPastRoadmaps(res.data)).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!careerGoal.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await roadmapApi.generate(careerGoal);
      setRoadmap(res.data);
      setPastRoadmaps((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Roadmap Generator</h1>
        <p className="text-gray-500 mb-8">Get a personalised, step-by-step learning path powered by AI</p>

        {/* Input */}
        <div className="card mb-8">
          <label className="label" htmlFor="goal">What career do you want to pursue?</label>
          <input
            id="goal"
            type="text"
            className="input mb-4"
            placeholder="e.g. Data Scientist, Backend Developer, DevOps Engineer"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <button onClick={handleGenerate} disabled={loading || !careerGoal.trim()} className="btn-primary w-full">
            {loading ? "Generating your roadmap..." : "Generate Roadmap"}
          </button>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        {/* Roadmap Display */}
        {roadmap && (
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-primary-600 to-accent-600 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TargetIcon className="w-5 h-5" />
                <h2 className="font-semibold text-lg">{roadmap.roadmap?.title || roadmap.career_goal}</h2>
              </div>
              <p className="text-sm opacity-90 mb-3">{roadmap.roadmap?.goal}</p>
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="w-4 h-4" />
                <span>Estimated Duration: {roadmap.roadmap?.estimated_duration || "6-12 months"}</span>
              </div>
            </div>

            {/* Phases */}
            {roadmap.roadmap?.phases?.map((phase: any, i: number) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {phase.phase_number || i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                    <p className="text-sm text-gray-500">{phase.duration}</p>
                  </div>
                </div>

                {phase.objectives?.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" /> Objectives
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {phase.objectives.map((obj: string, j: number) => (
                        <li key={j} className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {phase.resources?.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <BookOpenIcon className="w-4 h-4 text-blue-600" /> Resources
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {phase.resources.map((res: any, j: number) => (
                        <li key={j}>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                            {res.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {phase.milestones?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">🎯 Milestones</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {phase.milestones.map((m: string, j: number) => (
                        <li key={j} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {roadmap.roadmap?.final_outcome && (
              <div className="card bg-green-50 border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">🎉 Final Outcome</h3>
                <p className="text-sm text-green-800">{roadmap.roadmap.final_outcome}</p>
              </div>
            )}
          </div>
        )}

        {/* Past Roadmaps */}
        {pastRoadmaps.length > 0 && !roadmap && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Your Past Roadmaps</h2>
            <div className="space-y-3">
              {pastRoadmaps.map((r) => (
                <div key={r.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setRoadmap(r)}>
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-900">{r.career_goal}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Created {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
