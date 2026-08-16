"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/ChatWidget";
import CourseCard from "@/components/courses/CourseCard";
import { coursesApi } from "@/lib/api";
import { MOCK_COURSES, type MockCourse } from "@/lib/mockData";
import { SearchIcon, BookOpenIcon, CheckIcon, PlusIcon } from "lucide-react";

const DURATIONS = ["All", "Under 10 hours", "10–30 hours", "Over 30 hours"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

const LEVEL_DOT: Record<string, string> = {
  Beginner: "#5b7a9d",
  Intermediate: "#1a3c66",
  Advanced: "#b2892e",
};

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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<MockCourse[]>([]);
  const [roadmapCourses, setRoadmapCourses] = useState<MockCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [levelFilter, setLevelFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
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
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = debouncedSearch.toLowerCase();
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

  // Plan management handled internally by CourseCard via localStorage

  const activeFilterCount =
    (levelFilter !== "All" ? 1 : 0) +
    (durationFilter !== "All" ? 1 : 0) +
    (freeOnly ? 1 : 0);

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-paper">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">

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
              <path d="M-20 210 C 100 160, 220 260, 340 190 S 500 170, 560 220" stroke="#b2892e" strokeWidth="1.5" />
            </svg>

            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="block w-4 h-px bg-primary" aria-hidden="true" />
                  <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-primary">
                    Catalog &middot; {filteredCourses.length} routes charted
                  </p>
                </div>
                <h1 className="font-serif font-medium text-5xl sm:text-6xl text-primary tracking-tight mb-3">
                  Courses
                </h1>
                <p className="text-primary/60 max-w-md text-[15px] font-light leading-relaxed">
                  Chart a path through the skills you need next.
                </p>
                {usingMock && (
                  <p className="font-mono text-[11px] tracking-wide text-primary mt-4 border border-line px-3 py-1.5 inline-block transition-colors hover:border-primary/50">
                    Sample data — connect backend for live catalog
                  </p>
                )}
              </div>

              <div className="shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase text-primary/50">
                <p className="mb-2 text-primary/40">Difficulty key</p>
                <div className="flex lg:flex-col gap-3 lg:gap-2">
                  {Object.entries(LEVEL_DOT).map(([level, color]) => (
                    <span
                      key={level}
                      className="flex items-center gap-1.5 transition-colors hover:text-primary/80"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12 bg-surface border border-line px-5 sm:px-6 py-5 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 border-b border-primary/15 pb-3 mb-5 focus-within:border-primary transition-colors">
              <SearchIcon className="w-4 h-4 text-primary/40 shrink-0" />
              <input
                type="text"
                placeholder="Search courses, skills, or platforms…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-primary placeholder:text-primary/35 focus:outline-none py-1 font-light"
              />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
                <div className="group">
                  <label className="block font-mono text-[10px] tracking-[0.16em] uppercase text-primary/45 mb-1.5 transition-colors group-focus-within:text-primary">
                    Skill level
                  </label>
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="bg-transparent text-sm text-primary border-b border-primary/20 pb-1 pr-6 focus:outline-none focus:border-primary cursor-pointer transition-colors hover:border-primary/60"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l === "All" ? "All levels" : l}</option>
                    ))}
                  </select>
                </div>
                <div className="group">
                  <label className="block font-mono text-[10px] tracking-[0.16em] uppercase text-primary/45 mb-1.5 transition-colors group-focus-within:text-primary">
                    Duration
                  </label>
                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="bg-transparent text-sm text-primary border-b border-primary/20 pb-1 pr-6 focus:outline-none focus:border-primary cursor-pointer transition-colors hover:border-primary/60"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>{d === "All" ? "Any duration" : d}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-1.5 group">
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                    className="w-3.5 h-3.5 accent-primary cursor-pointer"
                  />
                  <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-primary/70 group-hover:text-primary transition-colors">
                    Free only
                  </span>
                </label>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setLevelFilter("All");
                    setDurationFilter("All");
                    setFreeOnly(false);
                  }}
                  className="font-mono text-[10px] tracking-[0.16em] uppercase text-primary hover:text-primary/85 underline underline-offset-4 decoration-primary/40 hover:decoration-primary/85 transition-all pb-1.5"
                >
                  Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
              <p className="font-mono text-xs tracking-[0.14em] uppercase text-primary/50 mt-4">
                Plotting course…
              </p>
            </div>
          ) : loadError ? (
            <div className="text-center py-20 border border-dashed border-line">
              <p className="text-primary/70 mb-2 font-light">Couldn&apos;t load courses.</p>
              <p className="font-mono text-xs tracking-wide text-primary/40 mb-5">
                The server may be unavailable. Please try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="font-mono text-[11px] tracking-[0.1em] uppercase px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {roadmapCourses.length > 0 && (
                <section className="mb-14">
                  <h2 className="font-serif font-medium text-2xl text-primary mb-1">
                    Your roadmap
                  </h2>
                  <p className="text-sm text-primary/50 mb-7 font-light">
                    Recommended next stops, in order.
                  </p>

                  <div className="relative">
                    <div
                      className="hidden md:block absolute top-[15px] left-0 right-0 h-px"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(to right, #b2892e 0, #b2892e 4px, transparent 4px, transparent 11px)",
                      }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {roadmapCourses.map((course, i) => (
                        <div key={course.id} className="relative h-full flex flex-col group/step">
                          <div className="hidden md:flex relative z-10 w-[30px] h-[30px] shrink-0 rounded-full bg-paper border-2 border-primary items-center justify-center font-mono text-[11px] text-primary mb-4 transition-transform duration-200 group-hover/step:scale-110 group-hover/step:bg-primary group-hover/step:text-paper">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="flex-1 transition-transform duration-200 group-hover/step:-translate-y-0.5">
                            <CourseCard
                              course={course}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-baseline justify-between border-b border-line pb-3 mb-7">
                  <h2 className="font-serif font-medium text-2xl text-primary">
                    All courses
                  </h2>
                  <span className="font-mono text-xs tracking-wide text-primary/45">
                    {filteredCourses.length} result{filteredCourses.length === 1 ? "" : "s"}
                  </span>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-line">
                    <BookOpenIcon className="w-9 h-9 text-primary/25 mx-auto mb-4" />
                    <p className="text-primary/60 mb-1 font-light">No courses match these filters.</p>
                    <p className="font-mono text-xs tracking-wide text-primary/40">Try widening duration or level.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="transition-transform duration-200 hover:-translate-y-1"
                      >
                        <CourseCard
                          course={course}
                        />
                      </div>
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
