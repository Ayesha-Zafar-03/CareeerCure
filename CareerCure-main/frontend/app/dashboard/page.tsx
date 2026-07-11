"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { profileApi } from "@/lib/api";
import {
  FileTextIcon, MapIcon, BriefcaseIcon, MessageCircleIcon,
  ArrowRightIcon, BookOpenIcon, CompassIcon, BarChart3, PieChart,
  BookCheck, Plus, Trash2
} from "lucide-react";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import clsx from "clsx";

const QUICK_ACTIONS = [
  { icon: FileTextIcon, title: "CV Analysis", desc: "Upload and analyze your CV", href: "/cv" },
  { icon: MapIcon, title: "Career Roadmap", desc: "Plan your career path", href: "/roadmap" },
  { icon: BriefcaseIcon, title: "Internships", desc: "Browse opportunities", href: "/internships" },
  { icon: BookOpenIcon, title: "Courses", desc: "Learn new skills", href: "/courses" },
  { icon: MessageCircleIcon, title: "Career Coach", desc: "Get AI career advice", href: "/chat" },
];

const SKILL_CATEGORIES = [
  { label: "Programming", value: 80 },
  { label: "Frontend", value: 65 },
  { label: "Backend", value: 55 },
  { label: "Database", value: 45 },
  { label: "Cloud", value: 35 },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [plannedCourses, setPlannedCourses] = useState<any[]>([]);
  const [barHeights, setBarHeights] = useState(SKILL_CATEGORIES.map(() => 0));
  const [donutOffset, setDonutOffset] = useState(283);

  useEffect(() => {
    profileApi.getMe().then((res) => {
      setProfile(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("planned-courses");
    if (stored) {
      try { setPlannedCourses(JSON.parse(stored)); } catch { setPlannedCourses([]); }
    }
  }, []);

  const hasCv = !!profile?.profile?.has_cv;
  const hasGoal = !!profile?.profile?.career_goal;
  const skillCount = profile?.profile?.skills?.length || 0;
  const completion = hasCv && hasGoal ? 100 : hasCv || hasGoal ? 60 : 25;

  useEffect(() => {
    if (!loading) {
      const barTimer = setTimeout(() => {
        setBarHeights(SKILL_CATEGORIES.map((c) => c.value));
      }, 300);
      const circumference = 2 * Math.PI * 45;
      const donutTimer = setTimeout(() => {
        setDonutOffset(circumference - (completion / 100) * circumference);
      }, 500);
      return () => {
        clearTimeout(barTimer);
        clearTimeout(donutTimer);
      };
    }
  }, [loading]);

  const removeFromPlan = (id: number) => {
    const updated = plannedCourses.filter((c: any) => c.id !== id);
    setPlannedCourses(updated);
    localStorage.setItem("planned-courses", JSON.stringify(updated));
  };

  const nextSteps = [
    !hasCv && {
      title: "Upload your CV",
      desc: "Get AI-powered analysis and job matches",
      href: "/cv",
      cta: "Upload now",
    },
    !hasGoal && {
      title: "Set a career goal",
      desc: "Generate a personalized roadmap",
      href: "/roadmap",
      cta: "Create roadmap",
    },
    {
      title: "Browse internships",
      desc: "Find opportunities that match your skills",
      href: "/internships",
      cta: "Explore",
    },
    {
      title: "Take a course",
      desc: "Upskill with recommended courses",
      href: "/courses",
      cta: "View courses",
    },
  ].filter(Boolean) as { title: string; desc: string; href: string; cta: string }[];

  const circumference = 2 * Math.PI * 45;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
          {loading ? (
            <div className="text-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
              <p className="font-mono text-xs tracking-wide uppercase text-ink/50 mt-4">
                Loading your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-10 border-b border-line pb-8 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3">
                  <CompassIcon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary">
                    Dashboard - {completion}% complete
                  </p>
                </div>
                <h1 className="font-serif text-5xl sm:text-6xl text-primary-dark tracking-tight mb-3">
                  Welcome back{profile?.full_name ? ", " + profile.full_name : ""}
                </h1>
                <p className="text-ink/60 max-w-md text-[15px]">
                  Here&apos;s where things stand with your career development.
                </p>
              </div>

              {/* Stats strip */}
              <div className="mb-10 bg-surface border border-line grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line">
                <div className="px-5 py-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-2">
                    Profile
                  </p>
                  <p className="font-serif text-3xl text-primary-dark">{completion}%</p>
                  <p className="text-[12px] text-ink/50 mt-1">
                    {hasCv ? "Good progress" : "Upload CV to improve"}
                  </p>
                </div>
                <div className="px-5 py-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-2">
                    Skills
                  </p>
                  <p className="font-serif text-3xl text-primary-dark">{skillCount}</p>
                  <p className="text-[12px] text-ink/50 mt-1">Technical &amp; soft skills</p>
                </div>
                <div className="px-5 py-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-2">
                    CV status
                  </p>
                  <p className={clsx("font-serif text-3xl", hasCv ? "text-accent" : "text-ink/40")}>
                    {hasCv ? "Uploaded" : "None"}
                  </p>
                  <p className="text-[12px] text-ink/50 mt-1">
                    {hasCv ? "Analyzed" : "Not uploaded yet"}
                  </p>
                </div>
                <div className="px-5 py-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-2">
                    Career goal
                  </p>
                  <p className="font-serif text-xl text-primary-dark truncate">
                    {profile?.profile?.career_goal || "Not set"}
                  </p>
                  <p className="text-[12px] text-ink/50 mt-1">Target role</p>
                </div>
              </div>

              {/* Stats Graph */}
              <div className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-surface border border-line px-5 sm:px-6 py-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40">
                      Skills Distribution
                    </p>
                  </div>
                  <div className="flex items-end gap-3" style={{ height: 140 }}>
                    {SKILL_CATEGORIES.map((cat, i) => (
                      <div key={cat.label} className="flex flex-col items-center gap-2 flex-1">
                        <div
                          className="w-full max-w-10 bg-primary rounded-t transition-all duration-1000 ease-out"
                          style={{ height: `${barHeights[i]}px` }}
                        />
                        <span className="font-mono text-[9px] tracking-[0.05em] text-ink/40 text-center">
                          {cat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-surface border border-line px-5 sm:px-6 py-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 mb-6">
                    <PieChart className="w-4 h-4 text-primary" />
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40">
                      Profile Completion
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <svg width="140" height="140" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          className="text-line"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          className="text-primary"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={donutOffset}
                          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                          transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="font-serif text-3xl text-primary-dark">{completion}%</p>
                          <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink/40 mt-0.5">
                            Complete
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mb-10">
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-3">
                  Quick actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {QUICK_ACTIONS.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group bg-surface border border-line hover:border-primary px-5 py-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <action.icon className="w-5 h-5 text-primary mb-4" />
                      <h3 className="font-serif text-lg text-primary-dark mb-1">{action.title}</h3>
                      <p className="text-[13px] text-ink/60 mb-4">{action.desc}</p>
                      <div className="flex items-center font-mono text-[11px] tracking-[0.08em] uppercase text-ink/50 hover:text-primary transition-all duration-200">
                        Start now
                        <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* My Learning Plan */}
              <div className="mb-10 bg-surface border border-line px-5 sm:px-6 py-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <BookCheck className="w-4 h-4 text-primary" />
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40">
                      My Learning Plan
                    </p>
                  </div>
                  {plannedCourses.length > 0 && (
                    <span className="font-mono text-[11px] tracking-[0.08em] text-ink/40">
                      {plannedCourses.length} course{plannedCourses.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {plannedCourses.length === 0 ? (
                  <div className="text-center py-10">
                    <BookOpenIcon className="w-10 h-10 text-ink/40 mx-auto mb-3" />
                    <p className="font-serif text-lg text-primary-dark mb-1">No courses planned yet</p>
                    <p className="text-[13px] text-ink/60 mb-5">
                      Browse courses and add them to your learning plan
                    </p>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase text-primary border border-primary px-4 py-2 transition-all duration-200 hover:bg-primary/5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Browse courses
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plannedCourses.map((course: any) => (
                      <div
                        key={course.id}
                        className="group relative bg-paper border border-line/50 px-4 py-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <a
                          href={course.course_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-serif text-[15px] text-primary-dark leading-snug pr-8 group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                          </div>
                          {course.provider && (
                            <p className="font-mono text-[11px] text-ink/50 mb-1">{course.provider}</p>
                          )}
                          {course.duration && (
                            <p className="font-mono text-[10px] tracking-[0.05em] uppercase text-ink/40">
                              {course.duration}
                            </p>
                          )}
                          {course.roadmap && (
                            <span className="inline-block font-mono text-[9px] tracking-[0.08em] uppercase bg-primary/10 text-primary-dark px-1.5 py-0.5 mt-1.5">
                              {course.roadmap}
                            </span>
                          )}
                        </a>
                        <button
                          onClick={() => removeFromPlan(course.id)}
                          className="absolute top-4 right-4 p-1 text-ink/40 hover:text-primary transition-all duration-200 z-10"
                          aria-label="Remove from plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Profile details */}
                <div className="lg:col-span-2 bg-surface border border-line px-5 sm:px-6 py-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-4">
                    Profile information
                  </p>
                  <div className="divide-y divide-line">
                    <div className="flex items-start justify-between py-4 first:pt-0">
                      <div>
                        <p className="text-[13px] text-ink/50">Email address</p>
                        <p className="text-primary-dark mt-1">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between py-4">
                      <div>
                        <p className="text-[13px] text-ink/50">Skills</p>
                        <p className="text-primary-dark mt-1">{skillCount} skills added</p>
                      </div>
                      <Link href="/profile" className="font-mono text-[11px] tracking-[0.08em] uppercase text-primary hover:underline underline-offset-2 transition-all duration-200">
                        Edit
                      </Link>
                    </div>
                    <div className="flex items-start justify-between py-4">
                      <div>
                        <p className="text-[13px] text-ink/50">CV status</p>
                        <p className="text-primary-dark mt-1">
                          {hasCv ? "Uploaded and analyzed" : "Not uploaded yet"}
                        </p>
                      </div>
                      <Link href="/cv" className="font-mono text-[11px] tracking-[0.08em] uppercase text-primary hover:underline underline-offset-2 transition-all duration-200">
                        {hasCv ? "View" : "Upload"}
                      </Link>
                    </div>
                    <div className="flex items-start justify-between py-4 last:pb-0">
                      <div>
                        <p className="text-[13px] text-ink/50">Career goal</p>
                        <p className="text-primary-dark mt-1">
                          {profile?.profile?.career_goal || "Not set yet"}
                        </p>
                      </div>
                      <Link href="/roadmap" className="font-mono text-[11px] tracking-[0.08em] uppercase text-primary hover:underline underline-offset-2 transition-all duration-200">
                        Set goal
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Next steps */}
                <div className="bg-surface border border-line px-5 sm:px-6 py-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-4">
                    Next steps
                  </p>
                  <div className="space-y-5">
                    {nextSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 border border-primary flex items-center justify-center">
                          <span className="font-mono text-[11px] text-primary">{i + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-primary-dark text-[14px]">{step.title}</p>
                          <p className="text-[12px] text-ink/60 mt-0.5">{step.desc}</p>
                          <Link
                            href={step.href}
                            className="font-mono text-[11px] tracking-[0.05em] uppercase text-primary hover:underline underline-offset-2 mt-2 inline-block transition-all duration-200"
                          >
                            {step.cta} {"->"}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="bg-surface border border-line px-5 sm:px-6 py-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 mb-4">
                  Resources
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
                  <Link href="/courses" className="group pr-0 md:pr-6 py-4 md:py-0 first:pl-0 transition-all duration-200">
                    <BookOpenIcon className="w-5 h-5 text-primary mb-3" />
                    <h3 className="font-serif text-lg text-primary-dark mb-1 group-hover:text-primary transition-all duration-200">
                      Learning courses
                    </h3>
                    <p className="text-[13px] text-ink/60">Curated courses for your career path</p>
                  </Link>
                  <Link href="/roadmap" className="group px-0 md:px-6 py-4 md:py-0 transition-all duration-200">
                    <MapIcon className="w-5 h-5 text-primary mb-3" />
                    <h3 className="font-serif text-lg text-primary-dark mb-1 group-hover:text-primary transition-all duration-200">
                      Career roadmaps
                    </h3>
                    <p className="text-[13px] text-ink/60">Step-by-step career guidance</p>
                  </Link>
                  <Link href="/chat" className="group pl-0 md:pl-6 py-4 md:py-0 transition-all duration-200">
                    <MessageCircleIcon className="w-5 h-5 text-primary mb-3" />
                    <h3 className="font-serif text-lg text-primary-dark mb-1 group-hover:text-primary transition-all duration-200">
                      AI career counselor
                    </h3>
                    <p className="text-[13px] text-ink/60">Get personalized career advice</p>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ChatWidget />
    </ProtectedRoute>
  );
}
