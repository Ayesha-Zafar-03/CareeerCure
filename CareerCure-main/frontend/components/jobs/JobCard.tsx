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

function matchStyle(pct: number): string {
  if (pct >= 80) return "text-primary-dark border-primary font-semibold";
  if (pct >= 60) return "text-primary-dark/80 border-accent";
  return "text-primary-dark/50 border-line/50";
}

function CompanyMark({ company }: { company: string }) {
  const initials = company
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-12 h-12 shrink-0 border border-line/50 bg-paper flex items-center justify-center font-mono font-semibold text-sm text-primary-dark/80 transition-colors duration-200 group-hover:border-accent">
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
    <div
      className="group relative h-full flex flex-col bg-surface border border-line/50 p-5
                 transition-all duration-300 ease-out
                 hover:border-primary hover:-translate-y-1 hover:shadow-md
                 hover:shadow-[0_12px_28px_-12px_rgba(101,146,135,0.28)]"
    >
      <span
        className="absolute left-0 top-0 h-[2px] w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full"
        aria-hidden="true"
      />

      <div className="flex items-start gap-4 mb-4">
        <CompanyMark company={job.company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-medium text-lg leading-snug text-primary-dark transition-opacity duration-200 group-hover:opacity-80">
                {job.title}
              </h3>
              <p className="font-mono text-[11px] tracking-wide uppercase text-primary-dark mt-1">
                {job.company}
              </p>
            </div>
            {matchPct !== null && (
              <span
                className={clsx(
                  "font-mono text-[10px] tracking-[0.1em] uppercase border px-2 py-0.5 shrink-0 whitespace-nowrap",
                  matchStyle(matchPct)
                )}
              >
                {matchPct}% match
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-ink/60 line-clamp-2 mb-4 font-light">{job.description}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-ink/50 mb-4">
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
          <span className="border border-line/50 text-ink/60 px-2 py-0.5 capitalize">
            {job.remote_option}
          </span>
        )}
      </div>

      {(job.skills_have?.length || job.skills_missing?.length) && (
        <div className="mb-4 space-y-2.5">
          {job.skills_have && job.skills_have.length > 0 && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/50 mb-1.5">
                Skills you have
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_have.map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[10px] tracking-wide uppercase border border-accent/40 text-accent px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {job.skills_missing && job.skills_missing.length > 0 && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/50 mb-1.5">
                Skills to develop
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_missing.map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[10px] tracking-wide uppercase border border-primary/40 text-primary px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!job.skills_have?.length && job.required_skills && job.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.required_skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="font-mono text-[10px] tracking-wide uppercase border border-line/50 text-ink/60 px-2 py-0.5"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      <div className="flex flex-wrap gap-2 pt-4 mt-1 border-t border-line/50">
        {job.application_url && (
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase py-2.5 bg-primary text-white transition-all duration-200 hover:bg-primary/85 hover:shadow-[0_6px_16px_-6px_rgba(101,146,135,0.55)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View job
            <ExternalLinkIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onSave?.(job.id)}
          className={clsx(
            "flex items-center justify-center gap-1.5 py-2.5 px-3 border font-mono text-[11px] tracking-[0.08em] uppercase transition-all duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            saved
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-line/50 text-ink/60 hover:border-primary/40 hover:text-primary"
          )}
          aria-label="Save job"
        >
          <HeartIcon className={clsx("w-3.5 h-3.5", saved && "fill-primary text-primary")} />
          Save
        </button>
        <Link
          href={`/chat?q=${coachQuery}`}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-accent/40 bg-accent/10 text-accent font-mono text-[11px] tracking-[0.08em] uppercase transition-all duration-200 hover:bg-accent/20 hover:border-accent/60 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          Ask coach
        </Link>
      </div>
    </div>
  );
}
