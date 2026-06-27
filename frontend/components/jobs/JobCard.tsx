"use client";

import Link from "next/link";
import {
  MapPinIcon,
  ClockIcon,
  DollarSignIcon,
  ExternalLinkIcon,
  HeartIcon,
  SparklesIcon,
} from "lucide-react";
import clsx from "clsx";
import type { MockJob } from "@/lib/mockData";

interface JobCardProps {
  job: MockJob;
  onSave?: (id: number) => void;
  saved?: boolean;
}

function CompanyLogo({ company }: { company: string }) {
  const initials = company
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
      {initials}
    </div>
  );
}

export default function JobCard({ job, onSave, saved = false }: JobCardProps) {
  const matchPct =
    job.match_score !== undefined ? Math.round(job.match_score * 100) : null;

  const coachQuery = encodeURIComponent(
    `Tell me about the ${job.title} position at ${job.company} and how I can improve my match.`
  );

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start gap-4 mb-4">
        <CompanyLogo company={job.company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-primary-600 font-medium">{job.company}</p>
            </div>
            {matchPct !== null && (
              <div
                className={clsx(
                  "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0",
                  matchPct >= 80
                    ? "bg-green-100 text-green-700"
                    : matchPct >= 60
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                )}
              >
                {matchPct}% match
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="w-3.5 h-3.5" />
            {job.location}
          </span>
        )}
        {job.duration && (
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            {job.duration}
          </span>
        )}
        {job.salary_range && (
          <span className="flex items-center gap-1">
            <DollarSignIcon className="w-3.5 h-3.5" />
            {job.salary_range}
          </span>
        )}
        {job.remote_option && (
          <span className="badge bg-primary-50 text-primary-700 capitalize">
            {job.remote_option}
          </span>
        )}
      </div>

      {(job.skills_have?.length || job.skills_missing?.length) && (
        <div className="mb-4 space-y-2">
          {job.skills_have && job.skills_have.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Skills you have</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_have.map((s) => (
                  <span key={s} className="badge bg-green-50 text-green-700 border border-green-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {job.skills_missing && job.skills_missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Skills to develop</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_missing.map((s) => (
                  <span key={s} className="badge bg-orange-50 text-orange-700 border border-orange-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!job.skills_have?.length && job.required_skills?.length && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.required_skills.slice(0, 4).map((s) => (
            <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        {job.application_url && (
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            View Job
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onSave?.(job.id)}
          className={clsx(
            "flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-sm font-medium transition-colors",
            saved
              ? "border-primary-300 bg-primary-50 text-primary-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
          aria-label="Save job"
        >
          <HeartIcon className={clsx("w-4 h-4", saved && "fill-primary-600 text-primary-600")} />
          Save
        </button>
        <Link
          href={`/chat?q=${coachQuery}`}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-accent-200 bg-accent-50 text-accent-600 hover:bg-accent-100 text-sm font-medium transition-colors"
        >
          <SparklesIcon className="w-4 h-4" />
          Ask Coach
        </Link>
      </div>
    </div>
  );
}
