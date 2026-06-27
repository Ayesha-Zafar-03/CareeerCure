"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/ChatWidget";
import CourseCard from "@/components/courses/CourseCard";
import { coursesApi } from "@/lib/api";
import { MOCK_COURSES, type MockCourse } from "@/lib/mockData";
import { SearchIcon, BookOpenIcon } from "lucide-react";

const DURATIONS = ["All", "Under 10 hours", "10–30 hours", "Over 30 hours"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

function normalizeCourse(raw: Record<string, unknown>): MockCourse {
  const price = raw.price ? String(raw.price) : undefined;
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    provider: String(raw.provider ?? ""),
    instructor: raw.instructor ? String(raw.instructor) : undefined,
    description: String(raw.description ?? ""),
    difficulty_level: raw.difficulty_level ? String(raw.difficulty_level) : undefined,
    duration: raw.duration ? String(raw.duration) : undefined,
    price,
    is_free: price?.toLowerCase().includes("free") ?? false,
    course_url: String(raw.course_url ?? "#"),
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    category: raw.category ? String(raw.category) : undefined,
    skills_gained: Array.isArray(raw.skills_gained)
      ? raw.skills_gained.map(String)
      : undefined,
    match_score:
      typeof raw.match_score === "number" ? raw.match_score : undefined,
  };
}

function matchesDuration(course: MockCourse, durationFilter: string): boolean {
  if (durationFilter === "All") return true;
  const d = course.duration?.toLowerCase() ?? "";
  const hours = parseInt(d, 10);
  if (durationFilter === "Under 10 hours") return hours > 0 && hours < 10;
  if (durationFilter === "10–30 hours") return hours >= 10 && hours <= 30;
  if (durationFilter === "Over 30 hours") return hours > 30 || d.includes("month") || d.includes("week");
  return true;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<MockCourse[]>([]);
  const [roadmapCourses, setRoadmapCourses] = useState<MockCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [planIds, setPlanIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const coursesRes = await coursesApi.list(0, 50);
        let items = (coursesRes.data as Record<string, unknown>[]).map(normalizeCourse);

        let roadmap: MockCourse[] = [];

        try {
          const matchRes = await coursesApi.getMatches();
          const matches = (matchRes.data.matches as Record<string, unknown>[]).map(
            normalizeCourse
          );
          roadmap = matches.slice(0, 4);
          const matchMap = new Map(matches.map((m) => [m.id, m]));
          items = items.map((c) => ({
            ...c,
            ...matchMap.get(c.id),
            match_score: matchMap.get(c.id)?.match_score ?? c.match_score,
          }));
        } catch {
          roadmap = MOCK_COURSES
            .filter((c) => c.match_score && c.match_score >= 0.75)
            .slice(0, 4);
        }

        if (items.length === 0) {
          setCourses(MOCK_COURSES);
          setRoadmapCourses(
            MOCK_COURSES.filter((c) => c.match_score && c.match_score >= 0.75).slice(0, 4)
          );
          setUsingMock(true);
        } else {
          setCourses(items);
          setRoadmapCourses(
            roadmap.length > 0
              ? roadmap
              : items.filter((c) => c.match_score && c.match_score >= 0.7).slice(0, 4)
          );
        }
      } catch {
        setCourses(MOCK_COURSES);
        setRoadmapCourses(MOCK_COURSES.filter((c) => c.match_score && c.match_score >= 0.75).slice(0, 4));
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.skills_gained?.some((s) => s.toLowerCase().includes(q));

      const matchesLevel =
        levelFilter === "All" ||
        c.difficulty_level?.toLowerCase() === levelFilter.toLowerCase();

      const matchesFree = !freeOnly || c.is_free || c.price?.toLowerCase().includes("free");

      const matchesDur = matchesDuration(c, durationFilter);

      return matchesSearch && matchesLevel && matchesFree && matchesDur;
    });
  }, [courses, search, levelFilter, durationFilter, freeOnly]);

  const togglePlan = (id: number) => {
    setPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
            <p className="text-gray-500">
              Discover courses to advance your skills and career
            </p>
            {usingMock && (
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                Showing sample data — connect backend for live catalog
              </p>
            )}
          </div>

          {/* Search & filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-8 shadow-sm">
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, skills, or platforms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Skill Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="input"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Duration</label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="input"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d === "All" ? "Any Duration" : d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer py-2.5">
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Free only</span>
                </label>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mx-auto" />
              <p className="text-gray-500 mt-4">Loading courses...</p>
            </div>
          ) : (
            <>
              {/* For your roadmap */}
              {roadmapCourses.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5 text-primary-600" />
                    For your roadmap
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {roadmapCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        inPlan={planIds.has(course.id)}
                        onAddToPlan={togglePlan}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All courses */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  All courses
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filteredCourses.length})
                  </span>
                </h2>

                {filteredCourses.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No courses match your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        inPlan={planIds.has(course.id)}
                        onAddToPlan={togglePlan}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      <ChatWidget />
    </ProtectedRoute>
  );
}
