"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { internshipsApi } from "@/lib/api";
import { BriefcaseIcon, MapPinIcon, ClockIcon, StarIcon } from "lucide-react";

export default function InternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [tab, setTab] = useState<"all" | "matches">("all");
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  useEffect(() => {
    internshipsApi.list().then((res) => {
      setInternships(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadMatches = async () => {
    setMatchLoading(true);
    setMatchError("");
    try {
      const res = await internshipsApi.getMatches();
      setMatches(res.data.matches);
    } catch (err: any) {
      setMatchError(err.response?.data?.detail || "Could not load matches. Please upload your CV first.");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleTabChange = (t: "all" | "matches") => {
    setTab(t);
    if (t === "matches" && matches.length === 0) loadMatches();
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Internships</h1>
        <p className="text-gray-500 mb-6">Browse opportunities or see your personalised matches</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(["all", "matches"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "all" ? "All Internships" : "My Matches"}
            </button>
          ))}
        </div>

        {tab === "all" && (
          loading ? (
            <p className="text-gray-500 text-center py-12">Loading internships...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internships.map((i) => (
                <InternshipCard key={i.id} internship={i} />
              ))}
            </div>
          )
        )}

        {tab === "matches" && (
          matchLoading ? (
            <p className="text-gray-500 text-center py-12">Finding your matches...</p>
          ) : matchError ? (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm px-4 py-3 rounded-lg">{matchError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m) => (
                <InternshipCard key={m.id} internship={m} matchScore={m.match_score} />
              ))}
            </div>
          )
        )}
      </div>
    </ProtectedRoute>
  );
}

function InternshipCard({ internship, matchScore }: { internship: any; matchScore?: number }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{internship.title}</h3>
          <p className="text-sm text-primary-600 font-medium">{internship.company}</p>
        </div>
        {matchScore !== undefined && (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <StarIcon className="w-3 h-3" />
            {(matchScore * 100).toFixed(0)}%
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{internship.description}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        {internship.location && (
          <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" />{internship.location}</span>
        )}
        {internship.duration && (
          <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{internship.duration}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {internship.required_skills?.slice(0, 4).map((s: string) => (
          <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
        ))}
        {internship.required_skills?.length > 4 && (
          <span className="badge bg-gray-100 text-gray-500">+{internship.required_skills.length - 4}</span>
        )}
      </div>
    </div>
  );
}
