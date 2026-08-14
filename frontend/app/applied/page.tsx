"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatWidget from "@/components/ChatWidget";
import { applicationsApi } from "@/lib/api";
import { BriefcaseIcon, CheckIcon, ExternalLink, Trash2 } from "lucide-react";

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  application_url: string | null;
  status: string;
  cv_filename: string | null;
  applied_at: string;
}

export default function AppliedPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await applicationsApi.list();
      setApps(res.data as Application[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withdraw = async (id: number) => {
    try {
      await applicationsApi.withdraw(id);
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "withdrawn" } : a)));
    } catch {
      // ignore
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-paper">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
          <div className="mb-10 border-b border-line pb-8">
            <div className="flex items-center gap-2 mb-3">
              <BriefcaseIcon className="w-3.5 h-3.5 text-primary" />
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-primary">
                Applications
              </p>
            </div>
            <h1 className="font-serif font-medium text-4xl sm:text-5xl text-primary tracking-tight mb-3">
              Jobs you&apos;ve applied to
            </h1>
            <p className="text-primary/60 max-w-md text-[15px] font-light leading-relaxed">
              Every application you submit through CareerCure is tracked here, with your CV and
              profile attached automatically.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-line">
              <BriefcaseIcon className="w-9 h-9 text-primary/25 mx-auto mb-4" />
              <p className="text-primary/60 mb-1 font-light">You haven&apos;t applied to any jobs yet.</p>
              <Link
                href="/internships"
                className="inline-block mt-4 font-mono text-[11px] tracking-[0.1em] uppercase px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Browse jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="bg-surface border border-line/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-medium text-lg text-primary-dark">{app.job_title}</h3>
                      {app.status === "applied" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.1em] text-accent bg-accent/10 px-2 py-0.5">
                          <CheckIcon className="w-3 h-3" /> Applied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.1em] text-ink/40 bg-ink/5 px-2 py-0.5">
                          Withdrawn
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-primary-dark mt-1">
                      {app.company}
                    </p>
                    <p className="text-xs text-ink/50 mt-1">
                      Applied {new Date(app.applied_at).toLocaleDateString()} ·{" "}
                      {app.cv_filename ? `CV: ${app.cv_filename}` : "Profile CV attached"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.application_url && app.application_url !== "#" && (
                      <a
                        href={app.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-2 border border-line/60 text-primary hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        View on site <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {app.status === "applied" && (
                      <button
                        type="button"
                        onClick={() => withdraw(app.id)}
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-2 border border-line/60 text-ink/50 hover:border-red-300 hover:text-red-600 transition-colors"
                        aria-label="Withdraw application"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Withdraw
                      </button>
                    )}
                  </div>
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
