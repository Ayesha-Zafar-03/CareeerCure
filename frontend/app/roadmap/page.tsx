"use client";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { roadmapApi, planApi } from "@/lib/api";
import ChatWidget from "@/components/ChatWidget";
import {
  CompassIcon, ClockIcon, BookOpenIcon, Check, ExternalLinkIcon,
  X, Trash2, BookCheck
} from "lucide-react";
import clsx from "clsx";

const STORAGE_KEY = "roadmap-progress";
const ROADMAP_LIST_KEY = "roadmap-titles";

interface PlannedCourse {
  id: number;
  title: string;
  provider: string;
  course_url: string;
  duration?: string;
  difficulty_level?: string;
  description?: string;
  roadmap?: string;
}

function syncRoadmapTitles(roadmaps: any[]) {
  const titles = roadmaps
    .filter((r) => r.career_goal)
    .map((r) => r.career_goal.trim());
  const unique = Array.from(new Set(titles));
  localStorage.setItem(ROADMAP_LIST_KEY, JSON.stringify(unique));
}

export default function RoadmapPage() {
  const [careerGoal, setCareerGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [pastRoadmaps, setPastRoadmaps] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);

  useEffect(() => {
    roadmapApi.list()
      .then((res) => {
        setPastRoadmaps(res.data);
        syncRoadmapTitles(res.data);
      })
      .catch(() => {});
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompleted(JSON.parse(saved));
    } catch {}
    planApi.list().then((res) => {
      setPlannedCourses(res.data.courses || []);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!careerGoal.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await roadmapApi.generate(careerGoal);
      setActiveRoadmap(res.data);
      const updated = [res.data, ...pastRoadmaps];
      setPastRoadmaps(updated);
      syncRoadmapTitles(updated);
    } catch (err: any) {
      const status = err.response?.status;
      let msg = err.response?.data?.detail || "Couldn't generate that roadmap - try again.";
      
      if (status === 0 || err.message?.includes("Network Error")) {
        msg = "Cannot reach backend API. Check that NEXT_PUBLIC_API_URL is set correctly in Vercel.";
      } else if (status === 500) {
        msg = "Backend error: " + (err.response?.data?.detail || "Check GROQ_API_KEY and database connection");
      } else if (status === 401) {
        msg = "Session expired. Please log in again.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const openRoadmap = (r: any) => setActiveRoadmap(r);
  const closeRoadmap = useCallback(() => setActiveRoadmap(null), []);

  const deleteRoadmap = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await roadmapApi.delete(id);
      const updated = pastRoadmaps.filter((r) => r.id !== id);
      setPastRoadmaps(updated);
      syncRoadmapTitles(updated);
      if (activeRoadmap?.id === id) setActiveRoadmap(null);
    } catch {}
  };

  const roadmapId = activeRoadmap?.id ?? "draft";
  const goalKey = activeRoadmap?.career_goal || "";

  const itemKey = (phaseIndex: number, type: "objective" | "milestone", itemIndex: number) =>
    roadmapId + "-" + phaseIndex + "-" + type + "-" + itemIndex;

  const toggleItem = (phaseIndex: number, type: "objective" | "milestone", itemIndex: number) => {
    const key = itemKey(phaseIndex, type, itemIndex);
    setCompleted((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const phaseProgress = (phase: any, phaseIndex: number) => {
    const objectives = phase.objectives ?? [];
    const milestones = phase.milestones ?? [];
    const total = objectives.length + milestones.length;
    if (total === 0) return { done: 0, total: 0 };
    let done = 0;
    objectives.forEach((_: string, j: number) => {
      if (completed[itemKey(phaseIndex, "objective", j)]) done++;
    });
    milestones.forEach((_: string, j: number) => {
      if (completed[itemKey(phaseIndex, "milestone", j)]) done++;
    });
    return { done, total };
  };

  const overallProgress = () => {
    const phases = activeRoadmap?.roadmap?.phases ?? [];
    let done = 0;
    let total = 0;
    phases.forEach((phase: any, i: number) => {
      const p = phaseProgress(phase, i);
      done += p.done;
      total += p.total;
    });
    return { done, total };
  };

  const overall = activeRoadmap ? overallProgress() : { done: 0, total: 0 };

  const roadmapCourses = plannedCourses.filter(
    (c) => c.roadmap === goalKey || !c.roadmap || c.roadmap === "General"
  );

  const removeFromPlan = (id: number) => {
    const updated = plannedCourses.filter((c) => c.id !== id);
    setPlannedCourses(updated);
    planApi.remove(id).catch(() => {});
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <ChatWidget />
      <div className="min-h-screen bg-paper">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">

          {/* Header */}
          <div className="mb-10 border-b border-line pb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <CompassIcon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary">
                Plan - AI-generated learning path
              </p>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl text-primary-dark tracking-tight mb-3">
              Build your roadmap
            </h1>
            <p className="text-ink/60 max-w-md text-[15px]">
              Tell us the role you&apos;re aiming for and we&apos;ll lay out the path to get there.
            </p>
          </div>

          {/* Input */}
          <div className="mb-10 bg-surface border border-line px-5 sm:px-6 py-6 animate-fade-in-up">
            <label
              htmlFor="goal"
              className="block font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50 mb-2"
            >
              Target role
            </label>
            <input
              id="goal"
              type="text"
              className="w-full bg-transparent text-[15px] text-primary-dark border-b border-line pb-2 mb-4 focus:outline-none focus:border-primary transition-colors placeholder:text-ink/40"
              placeholder="Data Scientist, Backend Developer, DevOps Engineer..."
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !careerGoal.trim()}
              className="font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-2.5 bg-primary text-white disabled:bg-line disabled:text-ink/50 transition-colors hover:bg-primary-d"
            >
              {loading ? "Generating..." : "Generate roadmap"}
            </button>
            {error && (
              <p className="font-mono text-[11px] text-accent mt-3">{error}</p>
            )}
          </div>

          {/* Past roadmaps */}
          {pastRoadmaps.length > 0 && (
            <div className="mb-10 animate-fade-in-up">
              <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/45 mb-3">
                Past roadmaps
              </p>
              <div className="space-y-2">
                {pastRoadmaps.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openRoadmap(r)}
                    className="w-full flex items-center justify-between gap-4 text-left bg-surface border border-line hover:border-primary/50 px-5 py-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-[15px] text-primary-dark">{r.career_goal}</span>
                      <p className="font-mono text-[11px] text-ink/40 mt-1">
                        Created {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteRoadmap(r.id, e)}
                      className="shrink-0 p-2 text-ink/30 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete roadmap"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!pastRoadmaps.length && (
            <div className="mb-10 text-center py-12 bg-surface border border-line animate-fade-in-up">
              <CompassIcon className="w-10 h-10 text-ink/30 mx-auto mb-3" />
              <p className="font-serif text-lg text-primary-dark mb-1">No roadmaps yet</p>
              <p className="text-[13px] text-ink/60">Enter a target role above to generate your first roadmap.</p>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Dialog */}
      {activeRoadmap && (
        <>
          {/* Fixed backdrop - does not scroll */}
          <div
            className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm"
            onClick={closeRoadmap}
          />

          {/* Scrollable content */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-start justify-center min-h-full px-4 py-8">
              <div
                className="relative w-full max-w-3xl bg-paper border border-line shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close bar - sticky */}
                <div className="sticky top-0 z-10 flex items-center justify-between bg-surface border-b border-line px-5 sm:px-6 py-3">
                  <div className="flex items-center gap-2">
                    <CompassIcon className="w-4 h-4 text-primary" />
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary">Roadmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeRoadmap.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoadmap(activeRoadmap.id, e as any);
                        }}
                        className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-ink/40 hover:text-primary transition-colors px-2 py-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                    <button
                      onClick={closeRoadmap}
                      className="p-1.5 text-ink/40 hover:text-primary transition-colors"
                      aria-label="Close roadmap"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Roadmap content */}
                <div className="px-5 sm:px-8 py-8 space-y-8">
                  {/* Title + progress */}
                  <div className="border-l-2 border-primary pl-5 py-1">
                    <h2 className="font-serif text-3xl sm:text-4xl text-primary-dark mb-1">
                      {activeRoadmap.roadmap?.title || activeRoadmap.career_goal}
                    </h2>
                    <p className="text-ink/60 text-sm mb-3">{activeRoadmap.roadmap?.goal}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase text-ink/50">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {activeRoadmap.roadmap?.estimated_duration || "6-12 months"}
                      </div>
                      {overall.total > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-line/60 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: (overall.done / overall.total) * 100 + "%" }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-ink/50">
                            {overall.done}/{overall.total} done
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phases */}
                  {activeRoadmap.roadmap?.phases?.map((phase: any, i: number) => {
                    const progress = phaseProgress(phase, i);
                    return (
                      <div key={i} className="bg-surface border border-line/60 px-5 sm:px-6 py-6 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-line/50">
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary mb-1">
                              Phase {String(phase.phase_number || i + 1).padStart(2, "0")}
                            </p>
                            <h3 className="font-serif text-xl text-primary-dark">{phase.title}</h3>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono text-[11px] text-ink/45">{phase.duration}</p>
                            {progress.total > 0 && (
                              <div className="flex items-center gap-1.5 mt-1 justify-end">
                                <div className="w-12 h-1 bg-line/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent rounded-full transition-all"
                                    style={{ width: (progress.done / progress.total) * 100 + "%" }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-accent">
                                  {progress.done}/{progress.total}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {phase.objectives?.length > 0 && (
                          <div className="mb-5">
                            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/45 mb-2">Objectives</p>
                            <ul className="space-y-1.5">
                              {phase.objectives.map((obj: string, j: number) => {
                                const done = !!completed[itemKey(i, "objective", j)];
                                return (
                                  <li key={j}>
                                    <button type="button" onClick={() => toggleItem(i, "objective", j)} className="w-full flex items-start gap-2.5 text-left group">
                                      <span className={clsx("mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors rounded-sm", done ? "bg-accent border-accent" : "border-ink/25 group-hover:border-primary")}>
                                        {done && <Check className="w-3 h-3 text-paper" strokeWidth={3} />}
                                      </span>
                                      <span className={clsx("text-[14px] leading-snug transition-colors", done ? "text-ink/40 line-through" : "text-ink/80")}>{obj}</span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {phase.milestones?.length > 0 && (
                          <div className="mb-5">
                            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/45 mb-2">Milestones</p>
                            <ul className="space-y-1.5">
                              {phase.milestones.map((m: string, j: number) => {
                                const done = !!completed[itemKey(i, "milestone", j)];
                                return (
                                  <li key={j}>
                                    <button type="button" onClick={() => toggleItem(i, "milestone", j)} className="w-full flex items-start gap-2.5 text-left group">
                                      <span className={clsx("mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors rounded-sm", done ? "bg-accent border-accent" : "border-ink/25 group-hover:border-primary")}>
                                        {done && <Check className="w-3 h-3 text-paper" strokeWidth={3} />}
                                      </span>
                                      <span className={clsx("text-[14px] leading-snug transition-colors", done ? "text-ink/40 line-through" : "text-ink/80")}>{m}</span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {phase.resources?.length > 0 && (
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/45 mb-2 flex items-center gap-1.5">
                              <BookOpenIcon className="w-3.5 h-3.5" /> Resources
                            </p>
                            <ul className="space-y-1">
                              {phase.resources.map((res: any, j: number) => (
                                <li key={j}>
                                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-[14px] text-primary hover:underline underline-offset-2">{res.name}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {activeRoadmap.roadmap?.final_outcome && (
                    <div className="border border-accent/30 bg-accent/[0.06] px-5 sm:px-6 py-5">
                      <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-accent mb-2">Final outcome</p>
                      <p className="text-[14px] text-ink/80 leading-relaxed">{activeRoadmap.roadmap.final_outcome}</p>
                    </div>
                  )}

                  {/* Courses tagged for this roadmap */}
                  {roadmapCourses.length > 0 && (
                    <div className="border-t border-line/50 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookCheck className="w-4 h-4 text-primary" />
                        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/45">
                          Courses ({roadmapCourses.length})
                        </p>
                      </div>
                      <div className="space-y-2">
                        {roadmapCourses.map((course) => (
                          <div key={course.id} className="flex items-center justify-between gap-3 bg-surface border border-line/50 px-4 py-2.5">
                            <div className="min-w-0">
                              <p className="font-serif text-[14px] text-primary-dark truncate">{course.title}</p>
                              <p className="font-mono text-[10px] text-ink/50">{course.provider}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a href={course.course_url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] tracking-[0.1em] uppercase text-primary hover:text-primary-d transition-colors flex items-center gap-1">
                                Open <ExternalLinkIcon className="w-3 h-3" />
                              </a>
                              <button onClick={() => removeFromPlan(course.id)} className="p-1 text-ink/30 hover:text-primary transition-colors" aria-label="Remove">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {roadmapCourses.length === 0 && (
                    <div className="border-t border-line/50 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookCheck className="w-4 h-4 text-primary" />
                        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/45">Courses</p>
                      </div>
                      <p className="text-[13px] text-ink/50">
                        No courses added for this roadmap yet.{" "}
                        <a href="/courses" className="text-primary hover:underline">Browse courses</a> and add them to &ldquo;{goalKey}&rdquo;.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </ProtectedRoute>
  );
}
