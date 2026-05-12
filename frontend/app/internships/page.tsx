"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { internshipsApi, profileApi } from "@/lib/api";
import {
  BriefcaseIcon, MapPinIcon, ClockIcon, StarIcon,
  SearchIcon, FilterIcon, BuildingIcon, ExternalLinkIcon,
} from "lucide-react";
import clsx from "clsx";

type ViewTab = "search" | "matches";

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, matchScore }: { job: any; matchScore?: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{job.title}</h3>
          <p className="text-primary-600 text-sm font-medium mt-0.5 flex items-center gap-1">
            <BuildingIcon className="w-3.5 h-3.5" />{job.company}
          </p>
        </div>
        {matchScore !== undefined && (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full ml-2 flex-shrink-0">
            <StarIcon className="w-3 h-3 fill-green-500" />{(matchScore * 100).toFixed(0)}% match
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        {job.location && <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" />{job.location}</span>}
        {job.duration && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{job.duration}</span>}
        {job.type && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{job.type}</span>}
        {job.is_remote && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">Remote</span>}
      </div>

      <p className={clsx("text-xs text-gray-600 mb-3 leading-relaxed", !expanded && "line-clamp-2")}>
        {job.description}
      </p>
      {job.description?.length > 120 && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary-600 hover:underline mb-2 text-left">
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.required_skills?.slice(0, 5).map((s: string) => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
        ))}
        {job.required_skills?.length > 5 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{job.required_skills.length - 5} more</span>
        )}
      </div>

      {job.apply_url && (
        <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors">
          Apply Now <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-3 bg-gray-200 rounded w-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-4/5 mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-5 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="h-8 bg-gray-200 rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InternshipsPage() {
  const [tab, setTab] = useState<ViewTab>("search");
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  // Load user skills for skill-based filter
  useEffect(() => {
    profileApi.getMe().then(res => {
      setUserSkills(res.data.skills || []);
    }).catch(() => {});
  }, []);

  // Load all internships on mount
  useEffect(() => {
    setLoading(true);
    internshipsApi.list(0, 50).then(res => {
      setAllJobs(res.data);
      setSearched(true);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMatches = async () => {
    setMatchLoading(true); setMatchError("");
    try {
      const res = await internshipsApi.getMatches();
      setMatches(res.data.matches || []);
    } catch (err: any) {
      setMatchError(err.response?.data?.detail || "Upload your CV first to get matches.");
    } finally { setMatchLoading(false); }
  };

  const handleTabChange = (t: ViewTab) => {
    setTab(t);
    if (t === "matches" && matches.length === 0) loadMatches();
  };

  // Filter logic
  const filtered = allJobs.filter(j => {
    const q = query.toLowerCase();
    const matchesQuery = !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q) || j.required_skills?.some((s: string) => s.toLowerCase().includes(q));
    const matchesLocation = !locationFilter || j.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === "all" || j.type === typeFilter || (typeFilter === "remote" && j.is_remote);
    return matchesQuery && matchesLocation && matchesType;
  });

  // Skill-matched jobs (from all jobs, based on profile skills)
  const skillMatched = allJobs.filter(j =>
    userSkills.length > 0 && j.required_skills?.some((s: string) =>
      userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
    )
  );

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Internships & Jobs</h1>
        <p className="text-gray-500 mb-6">Search opportunities or get matches based on your CV and skills</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {([
            { id: "search", label: "Browse All" },
            { id: "matches", label: `CV Matches${matches.length ? ` (${matches.length})` : ""}` },
          ] as const).map(t => (
            <button key={t.id} onClick={() => handleTabChange(t.id)}
              className={clsx("px-5 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t.id ? "bg-white text-primary-700 shadow-sm" : "text-gray-600 hover:text-gray-900")}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Search Tab ── */}
        {tab === "search" && (
          <div>
            {/* Search & Filters */}
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search by title, company, or skill..."
                    className="input-field pl-9" />
                </div>
                <input type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                  placeholder="Location..." className="input-field sm:w-40" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field sm:w-36">
                  <option value="all">All Types</option>
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{filtered.length} results</span>
                {query || locationFilter || typeFilter !== "all" ? (
                  <button onClick={() => { setQuery(""); setLocationFilter(""); setTypeFilter("all"); }} className="text-primary-600 hover:underline text-xs">Clear filters</button>
                ) : null}
              </div>
            </div>

            {/* Skill-based section */}
            {userSkills.length > 0 && skillMatched.length > 0 && !query && (
              <div className="mb-8">
                <h2 className="font-semibold text-gray-900 mb-1">Matched to your skills</h2>
                <p className="text-xs text-gray-500 mb-3">Based on: {userSkills.slice(0, 5).join(", ")}{userSkills.length > 5 ? "..." : ""}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillMatched.slice(0, 6).map(j => <JobCard key={j.id} job={j} />)}
                </div>
                {skillMatched.length > 6 && <p className="text-xs text-gray-400 mt-2 text-center">+{skillMatched.length - 6} more skill-matched jobs below</p>}
                <hr className="my-6 border-gray-200" />
              </div>
            )}

            {loading ? <Skeleton /> : (
              filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(j => <JobCard key={j.id} job={j} />)}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <BriefcaseIcon className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">No results found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )
            )}
          </div>
        )}

        {/* ── Matches Tab ── */}
        {tab === "matches" && (
          <div>
            {matchLoading ? <Skeleton /> : matchError ? (
              <div className="card text-center py-12">
                <BriefcaseIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-700 mb-1">No CV found</p>
                <p className="text-sm text-gray-500 mb-4">{matchError}</p>
                <a href="/cv" className="btn-primary inline-block">Upload CV</a>
              </div>
            ) : matches.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-4">Ranked by how well they match your CV and skills</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.map((m, i) => <JobCard key={i} job={m} matchScore={m.match_score} />)}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <BriefcaseIcon className="w-14 h-14 mx-auto mb-3 text-gray-200" />
                <p className="font-medium text-gray-600">Loading your matches...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
