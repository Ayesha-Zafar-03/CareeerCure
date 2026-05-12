"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { coursesApi, roadmapApi } from "@/lib/api";
import {
  BookOpenIcon, ExternalLinkIcon, StarIcon, ClockIcon,
  SearchIcon, FilterIcon, CheckCircleIcon, AlertCircleIcon,
} from "lucide-react";
import clsx from "clsx";

// ── Platform colors ───────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Coursera: "#0056D2",
  Udemy: "#A435F0",
  edX: "#02262B",
  YouTube: "#FF0000",
  freeCodeCamp: "#0A0A23",
  "Khan Academy": "#14BF96",
  "LinkedIn Learning": "#0A66C2",
  Pluralsight: "#F15B2A",
  "MIT OpenCourseWare": "#A31F34",
  Codecademy: "#1F4056",
};

function getPlatformColor(platform: string, fallback?: string): string {
  return PLATFORM_COLORS[platform] || fallback || "#6B7280";
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: any }) {
  const color = getPlatformColor(course.platform, course.platform_color);
  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col">
      {/* Platform badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
          {course.platform}
        </span>
        <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full", course.is_free ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
          {course.is_free ? "Free" : "Paid"}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 flex-1">{course.title}</h3>
      <p className="text-xs text-gray-500 mb-2">{course.instructor}</p>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{course.duration}</span>
        <span className="flex items-center gap-1"><StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />{course.rating}</span>
        <span className={clsx("px-1.5 py-0.5 rounded text-xs font-medium",
          course.level === "Beginner" ? "bg-green-50 text-green-700" :
          course.level === "Intermediate" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700")}>
          {course.level}
        </span>
      </div>

      {/* Skills */}
      {course.skills_covered?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {course.skills_covered.slice(0, 4).map((s: string) => (
            <span key={s} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{s}</span>
          ))}
        </div>
      )}

      {/* CTA */}
      <a href={course.url} target="_blank" rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: color }}>
        View Course <ExternalLinkIcon className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const [careerGoal, setCareerGoal] = useState("");
  const [phase, setPhase] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [levelFilter, setLevelFilter] = useState<"all" | "Beginner" | "Intermediate" | "Advanced">("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [pastRoadmaps, setPastRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    roadmapApi.list().then(res => setPastRoadmaps(res.data)).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!careerGoal.trim()) return;
    setLoading(true); setError(""); setSearched(true);
    try {
      const res = await coursesApi.recommend(careerGoal, selectedRoadmap?.id, phase);
      setCourses(res.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch courses.");
    } finally { setLoading(false); }
  };

  const handleRoadmapSelect = async (roadmap: any) => {
    setSelectedRoadmap(roadmap);
    setCareerGoal(roadmap.career_goal);
    setLoading(true); setError(""); setSearched(true);
    try {
      const res = await coursesApi.forRoadmap(roadmap.id);
      setCourses(res.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch courses.");
    } finally { setLoading(false); }
  };

  // Filtered courses
  const platforms = ["all", ...Array.from(new Set(courses.map((c: any) => c.platform)))];
  const filtered = courses.filter(c => {
    if (filter === "free" && !c.is_free) return false;
    if (filter === "paid" && c.is_free) return false;
    if (levelFilter !== "all" && c.level !== levelFilter) return false;
    if (platformFilter !== "all" && c.platform !== platformFilter) return false;
    return true;
  });

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Recommendations</h1>
        <p className="text-gray-500 mb-8">AI-curated courses from Coursera, Udemy, edX, YouTube & more — matched to your career goal</p>

        {/* Search */}
        <div className="card mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Career Goal</label>
              <input
                type="text"
                value={careerGoal}
                onChange={e => setCareerGoal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Data Scientist, Backend Developer, DevOps Engineer"
                className="input-field"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Focus Phase (Optional)</label>
              <input
                type="text"
                value={phase}
                onChange={e => setPhase(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="input-field"
              />
            </div>
          </div>
          <button onClick={handleSearch} disabled={loading || !careerGoal.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
            <SearchIcon className="w-4 h-4" />
            {loading ? "Finding best courses..." : "Find Courses"}
          </button>
        </div>

        {/* Roadmap Quick Select */}
        {pastRoadmaps.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Or load courses from your saved roadmaps:</p>
            <div className="flex flex-wrap gap-2">
              {pastRoadmaps.map(r => (
                <button key={r.id} onClick={() => handleRoadmapSelect(r)}
                  className={clsx("text-sm px-3 py-1.5 rounded-lg border transition-colors",
                    selectedRoadmap?.id === r.id ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-700 border-gray-300 hover:border-primary-400")}>
                  {r.career_goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6"><AlertCircleIcon className="w-4 h-4" />{error}</div>}

        {/* Filters */}
        {courses.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
              {(["all", "free", "paid"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={clsx("px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize",
                    filter === f ? "bg-primary-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:border-primary-400")}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(["all", "Beginner", "Intermediate", "Advanced"] as const).map(l => (
                <button key={l} onClick={() => setLevelFilter(l)}
                  className={clsx("px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                    levelFilter === l ? "bg-primary-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:border-primary-400")}>
                  {l}
                </button>
              ))}
            </div>
            <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
              className="input-field py-1 text-sm w-auto">
              {platforms.map(p => <option key={p} value={p}>{p === "all" ? "All Platforms" : p}</option>)}
            </select>
            <span className="text-sm text-gray-500 ml-auto">{filtered.length} courses</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-4/5 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Course Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => <CourseCard key={i} course={course} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && filtered.length === 0 && courses.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            <FilterIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No courses match your filters</p>
            <button onClick={() => { setFilter("all"); setLevelFilter("all"); setPlatformFilter("all"); }} className="btn-secondary mt-3">Clear Filters</button>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16 text-gray-400">
            <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium text-gray-500">Enter a career goal to find courses</p>
            <p className="text-sm mt-1">We'll recommend the best courses from top platforms</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
