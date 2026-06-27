"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/ChatWidget";
import JobCard from "@/components/jobs/JobCard";
import { internshipsApi } from "@/lib/api";
import { MOCK_JOBS, type MockJob } from "@/lib/mockData";
import { SlidersHorizontalIcon, ArrowUpDownIcon } from "lucide-react";
import clsx from "clsx";

type FilterType = "all" | "remote" | "entry-level" | "internship";
type SortType = "match" | "company";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "remote", label: "Remote" },
  { id: "entry-level", label: "Entry-level" },
  { id: "internship", label: "Internship" },
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

export default function InternshipsPage() {
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("match");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

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
      } catch {
        setJobs(MOCK_JOBS);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (filter === "remote") {
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
    }

    if (sortBy === "match") {
      result.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    } else {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    return result;
  }, [jobs, filter, sortBy]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs for you</h1>
            <p className="text-gray-500">
              Personalized opportunities matched to your skills and career goals
            </p>
            {usingMock && (
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                Showing sample data — connect backend for live listings
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    filter === f.id
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontalIcon className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="match">Sort by Match</option>
                <option value="company">Sort by Company</option>
              </select>
              <ArrowUpDownIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mx-auto" />
              <p className="text-gray-500 mt-4">Finding your best matches...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">No jobs match your filters. Try adjusting them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={savedIds.has(job.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ChatWidget />
    </ProtectedRoute>
  );
}
