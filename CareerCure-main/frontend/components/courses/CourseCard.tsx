"use client";

import { useEffect, useState } from "react";
import { BookmarkIcon, ClockIcon, StarIcon, ExternalLinkIcon, PlusIcon, CheckIcon, ChevronDown } from "lucide-react";
import type { MockCourse } from "@/lib/mockData";
import { planApi } from "@/lib/api";

interface CourseCardProps {
  course: MockCourse;
}

const LEVEL_STYLES: Record<string, string> = {
  beginner: "text-primary-dark border-line/50",
  intermediate: "text-primary-dark border-accent",
  advanced: "text-primary-dark border-primary",
};

const MAX_VISIBLE_TAGS = 3;
const ROADMAP_LIST_KEY = "roadmap-titles";

export default function CourseCard({ course }: CourseCardProps) {
  const [inPlan, setInPlan] = useState(false);
  const [courseRoadmap, setCourseRoadmap] = useState("");
  const [roadmapTitles, setRoadmapTitles] = useState<string[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState("General");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try {
      const titles = localStorage.getItem(ROADMAP_LIST_KEY);
      if (titles) {
        const parsed = JSON.parse(titles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRoadmapTitles(parsed);
          setSelectedRoadmap(parsed[0]);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    planApi.list().then((res) => {
      if (cancelled) return;
      const found = (res.data.courses || []).find((c: any) => c.id === course.id);
      if (found) {
        setInPlan(true);
        if (found.roadmap) setCourseRoadmap(found.roadmap);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [course.id]);

  const addToPlan = async (roadmap: string) => {
    const entry = {
      id: course.id,
      title: course.title,
      provider: course.provider,
      course_url: course.course_url,
      duration: course.duration ?? "",
      difficulty_level: course.difficulty_level ?? "",
      description: course.description ?? "",
      roadmap,
    };
    try {
      const res = await planApi.add(entry);
      if (res.data?.course?.roadmap) setCourseRoadmap(res.data.course.roadmap);
    } catch {}
    setInPlan(true);
    setCourseRoadmap(roadmap);
    setPickerOpen(false);
  };

  const removeFromPlan = async () => {
    try {
      await planApi.remove(course.id);
    } catch {}
    setInPlan(false);
    setCourseRoadmap("");
  };

  const handleClick = () => {
    if (inPlan) {
      removeFromPlan();
    } else if (roadmapTitles.length === 0) {
      addToPlan("General");
    } else {
      setPickerOpen(true);
    }
  };

  const levelKey = course.difficulty_level?.toLowerCase() ?? "beginner";
  const levelStyle = LEVEL_STYLES[levelKey] ?? LEVEL_STYLES.beginner;
  const tags = course.skills_gained ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <div
      className="group relative h-full flex flex-col bg-surface border border-line/50 p-5
                 transition-all duration-300 ease-out
                 hover:border-primary hover:-translate-y-1
                 hover:shadow-[0_12px_28px_-12px_rgba(11,36,67,0.28)]"
    >
      <span
        className="absolute left-0 top-0 h-[2px] w-0 bg-primary transition-all duration-300 ease-out
                   group-hover:w-full"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between mb-3">
        {course.difficulty_level && (
          <span
            className={`font-mono text-[10px] tracking-[0.12em] uppercase border px-2 py-0.5 ${levelStyle}`}
          >
            {course.difficulty_level}
          </span>
        )}
        <button
          type="button"
          aria-label="Save course"
          className="text-ink/60 transition-all duration-200 shrink-0
                     hover:text-primary hover:scale-110 active:scale-95
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>
      </div>

      <h3
        className="font-serif font-medium text-lg leading-snug text-primary-dark line-clamp-2 min-h-[2.75rem] mb-1.5
                   transition-opacity duration-200 group-hover:opacity-80"
      >
        {course.title}
      </h3>

      <p className="font-mono text-[11px] tracking-wide uppercase text-primary-dark mb-2.5">
        {course.provider}
      </p>

      <p className="text-sm text-ink/60 line-clamp-2 min-h-[2.6rem] mb-4 font-light">
        {course.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink/50 mb-3">
        {course.duration && (
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            {course.duration}
          </span>
        )}
        {typeof course.rating === "number" && (
          <span className="flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5 fill-primary text-primary" />
            {course.rating.toFixed(1)}
          </span>
        )}
        {(course.is_free || course.price?.toLowerCase().includes("free")) && (
          <span className="text-accent font-semibold">Free</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] tracking-wide uppercase border border-line/50 text-ink/60 px-2 py-0.5
                       transition-colors duration-200
                       group-hover:border-accent group-hover:text-primary-dark"
          >
            {tag}
          </span>
        ))}
        {extraTagCount > 0 && (
          <span className="font-mono text-[10px] tracking-wide text-ink/50 px-1 py-0.5">
            +{extraTagCount} more
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* Roadmap picker dropdown */}
      {pickerOpen && (
        <div className="mb-3 bg-paper border border-line/50 p-2 animate-fade-in">
          <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/50 mb-1.5 px-1">
            Add to which roadmap?
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => addToPlan("General")}
              className="w-full text-left px-2 py-1.5 font-mono text-[11px] text-ink/70 hover:bg-primary/5 hover:text-primary transition-colors rounded"
            >
              General
            </button>
            {roadmapTitles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => addToPlan(title)}
                className="w-full text-left px-2 py-1.5 font-mono text-[11px] text-ink/70 hover:bg-primary/5 hover:text-primary transition-colors rounded"
              >
                {title}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="w-full text-center font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 hover:text-primary mt-1 pt-1 border-t border-line/50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClick}
          className={`flex-1 flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase py-2.5
                      transition-all duration-200 ease-out
                      active:scale-[0.98]
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            inPlan
              ? "bg-accent text-white hover:bg-accent/85"
              : "bg-primary text-white hover:bg-primary/85 hover:shadow-[0_6px_16px_-6px_rgba(11,36,67,0.55)]"
          }`}
        >
          {inPlan ? (
            <CheckIcon className="w-3.5 h-3.5" />
          ) : (
            <PlusIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
          )}
          {inPlan ? "In your plan" : roadmapTitles.length > 0 ? "Add to plan" : "Add to plan"}
        </button>
        <a
          href={course.course_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open course"
          className="w-10 h-10 shrink-0 flex items-center justify-center border border-line/50 text-ink/60
                     transition-all duration-200
                     hover:border-primary hover:text-primary hover:bg-paper
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ExternalLinkIcon className="w-4 h-4 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
        </a>
      </div>

      {inPlan && courseRoadmap && (
        <div className="mt-2 text-center">
          <span className="inline-block font-mono text-[9px] tracking-[0.08em] uppercase bg-primary/10 text-primary-dark px-2 py-0.5">
            {courseRoadmap}
          </span>
        </div>
      )}
    </div>
  );
}
