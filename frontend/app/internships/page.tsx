"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/ChatWidget";
import JobCard from "@/components/jobs/JobCard";
import { internshipsApi, applicationsApi } from "@/lib/api";
import { MOCK_JOBS, type MockJob } from "@/lib/mockData";
import { CompassIcon, BriefcaseIcon, SearchIcon } from "lucide-react";
import clsx from "clsx";

type FilterType = "all" | "pakistan" | "remote" | "entry-level" | "internship" | "applied";
type SortType = "match" | "company";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pakistan", label: "Pakistan" },
  { id: "remote", label: "Remote" },
  { id: "entry-level", label: "Entry-level" },
  { id: "internship", label: "Internship" },
  { id: "applied", label: "Applied" },
];

function normalizeJob(raw: Record<string, unknown>): MockJob {
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    company: String(raw.company ?? ""),
    description: String(raw.description ?? ""),
    location: raw.location ? String(raw.location) : undefined,
    duration: raw.duration ? String(raw.duration) : undefined,
    salary_range: raw.salary_range ? String(raw.salary_range) : undefined,
    remote_option: raw.remote_option ? String(raw.remote_option) : undefined,
    job_type: raw.job_type ? String(raw.job_type) : undefined,
    required_skills: Array.isArray(raw.required_skills)
      ? raw.required_skills.map(String)
      : undefined,
    skills_have: Array.isArray(raw.skills_have)
      ? raw.skills_have.map(String)
      : undefined,
    skills_missing: Array.isArray(raw.skills_missing)
      ? raw.skills_missing.map(String)
      : undefined,
    application_url: raw.application_url ? String(raw.application_url) : undefined,
    match_score:
      typeof raw.match_score === "number" ? raw.match_score : undefined,
  };
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

export default function InternshipsPage() {
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("match");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const listRes = await internshipsApi.list(0, 50);
        let items = (listRes.data as Record<string, unknown>[]).map(normalizeJob);
        try {
          const matchRes = await internshipsApi.getMatches();
          const matches = (matchRes.data.matches as Record<string, unknown>[]).map(
            (m) => normalizeJob(m)
          );
          const matchMap = new Map(matches.map((m) => [m.id, m.match_score]));
          items = items.map((j) => ({
            ...j,
            match_score: matchMap.get(j.id) ?? j.match_score,
            ...matches.find((m) => m.id === j.id),
          }));
        } catch {
          // matches optional
        }

        if (items.length === 0) {
          setJobs(MOCK_JOBS);
          setUsingMock(true);
        } else {
          setJobs(items);
        }

        try {
          const appsRes = await applicationsApi.list();
          const ids = new Set(
            (appsRes.data as Record<string, unknown>[]).map((a) => Number(a.job_id))
          );
          setAppliedIds(ids);
        } catch {
          // applications optional
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    const q = debouncedSearch.toLowerCase();
    if (q) {
      result = result.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.required_skills?.some((s) => s.toLowerCase().includes(q)) ||
        j.skills_have?.some((s) => s.toLowerCase().includes(q)) ||
        j.skills_missing?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filter === "pakistan") {
      result = result.filter((j) =>
        j.location?.toLowerCase().includes("pakistan")
      );
    } else if (filter === "remote") {
      result = result.filter(
        (j) => j.remote_option?.toLowerCase() === "remote"
      );
    } else if (filter === "entry-level") {
      result = result.filter(
        (j) =>
          j.job_type?.toLowerCase() === "entry-level" ||
          j.title.toLowerCase().includes("junior") ||
          j.title.toLowerCase().includes("entry")
      );
    } else if (filter === "internship") {
      result = result.filter(
        (j) =>
          j.job_type?.toLowerCase() === "internship" ||
          j.title.toLowerCase().includes("intern")
      );
    } else if (filter === "applied") {
      result = result.filter((j) => appliedIds.has(j.id));
    }

    if (sortBy === "match") {
      result.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    } else {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    return result;
  }, [jobs, filter, sortBy, debouncedSearch]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = async (id: number) => {
    const job = jobs.find((j) => j.id === id);
    try {
      await applicationsApi.apply(id);
      setAppliedIds((prev) => new Set(prev).add(id));
      if (job?.application_url && job.application_url !== "#") {
        window.open(job.application_url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // ignore apply errors in UI
    }
  };

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
              <path d="M-20 210 C 100 160, 220 260, 340 190 S 500 170, 560 220" stroke="#b2892e" strokeWidth="1.5" />
            </svg>

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <CompassIcon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-primary">
                  Matches &middot; {filteredJobs.length} opportunities found
                </p>
              </div>
              <h1 className="font-serif font-medium text-5xl sm:text-6xl text-primary tracking-tight mb-3">
                Jobs for you
              </h1>
              <p className="text-primary/60 max-w-md text-[15px] font-light leading-relaxed">
                Personalized opportunities matched to your skills and career goals.
              </p>
              {usingMock && (
                <p className="font-mono text-[11px] tracking-wide text-primary mt-4 border border-line px-3 py-1.5 inline-block transition-colors hover:border-primary/50">
                  Sample data — connect backend for live listings
                </p>
              )}
            </div>
          </div>

          <div className="mb-10 bg-surface border border-line px-5 sm:px-6 py-5 transition-shadow hover:shadow-sm">
            <div className="flex items-center gap-2 border-b border-primary/15 pb-3 mb-5 focus-within:border-primary transition-colors">
              <SearchIcon className="w-4 h-4 text-primary/40 shrink-0" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-primary placeholder:text-primary/35 focus:outline-none py-1 font-light"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.16em] uppercase text-primary/45 mb-2">
                  Show
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={clsx(
                        "font-mono text-[11px] tracking-[0.08em] uppercase px-3.5 py-1.5 border transition-all duration-200",
                        filter === f.id
                          ? "bg-primary border-primary text-white"
                          : "bg-transparent border-line text-primary/60 hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group">
                <label className="block font-mono text-[10px] tracking-[0.16em] uppercase text-primary/45 mb-1.5 transition-colors group-focus-within:text-primary">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="bg-transparent text-sm text-primary border-b border-primary/20 pb-1 pr-6 focus:outline-none focus:border-primary cursor-pointer transition-colors hover:border-primary/60"
                >
                  <option value="match">Best match</option>
                  <option value="company">Company, A–Z</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
              <p className="font-mono text-xs tracking-[0.14em] uppercase text-primary/50 mt-4">
                Scouting opportunities…
              </p>
            </div>
          ) : loadError ? (
            <div className="text-center py-20 border border-dashed border-line">
              <BriefcaseIcon className="w-9 h-9 text-primary/25 mx-auto mb-4" />
              <p className="text-primary/70 mb-2 font-light">Couldn&apos;t load jobs.</p>
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
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-line">
              <BriefcaseIcon className="w-9 h-9 text-primary/25 mx-auto mb-4" />
              <p className="text-primary/60 mb-1 font-light">No jobs match these filters.</p>
              <p className="font-mono text-xs tracking-wide text-primary/40">Try a broader filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="transition-transform duration-200 hover:-translate-y-1"
                >
                  <JobCard
                    job={job}
                    saved={savedIds.has(job.id)}
                    onSave={toggleSave}
                    applied={appliedIds.has(job.id)}
                    onApply={handleApply}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ChatWidget />
    </ProtectedRoute>
  );
}
