"use client";

import { useState } from "react";
import {
  ClockIcon,
  StarIcon,
  BookmarkIcon,
  GraduationCapIcon,
  ExternalLinkIcon,
  PlusIcon,
} from "lucide-react";
import clsx from "clsx";
import type { MockCourse } from "@/lib/mockData";

interface CourseCardProps {
  course: MockCourse;
  onAddToPlan?: (id: number) => void;
  inPlan?: boolean;
  variant?: "grid" | "compact";
}

export default function CourseCard({
  course,
  onAddToPlan,
  inPlan = false,
  variant = "grid",
}: CourseCardProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-amber-100 text-amber-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const isFree =
    course.is_free || course.price?.toLowerCase().includes("free");

  if (variant === "compact") {
    return (
      <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <GraduationCapIcon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 line-clamp-1">{course.title}</p>
          <p className="text-xs text-gray-500">{course.provider} · {course.duration}</p>
        </div>
        {course.rating && (
          <span className="text-xs text-amber-600 flex items-center gap-0.5 shrink-0">
            <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-200 group relative">
      <div className="absolute top-4 right-4 flex gap-1">
        <button
          type="button"
          onClick={() => setBookmarked(!bookmarked)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Bookmark course"
        >
          <BookmarkIcon
            className={clsx(
              "w-4 h-4",
              bookmarked ? "fill-primary-600 text-primary-600" : "text-gray-400"
            )}
          />
        </button>
      </div>

      {course.difficulty_level && (
        <span
          className={clsx(
            "badge mb-3",
            getDifficultyColor(course.difficulty_level)
          )}
        >
          {course.difficulty_level}
        </span>
      )}

      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 line-clamp-2 pr-8">
        {course.title}
      </h3>

      <div className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-3">
        <GraduationCapIcon className="w-4 h-4" />
        {course.provider}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
        {course.duration && (
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            {course.duration}
          </span>
        )}
        {course.rating && (
          <span className="flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
        )}
        {isFree && (
          <span className="badge bg-green-50 text-green-700">Free</span>
        )}
        {course.match_score !== undefined && (
          <span className="badge bg-primary-50 text-primary-700">
            {Math.round(course.match_score * 100)}% match
          </span>
        )}
      </div>

      {course.skills_gained && course.skills_gained.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {course.skills_gained.slice(0, 3).map((skill) => (
            <span key={skill} className="badge bg-gray-50 text-gray-600 border border-gray-100">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onAddToPlan?.(course.id)}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors",
            inPlan
              ? "bg-primary-100 text-primary-700 border border-primary-200"
              : "bg-primary-600 hover:bg-primary-700 text-white"
          )}
        >
          <PlusIcon className="w-4 h-4" />
          {inPlan ? "In your plan" : "Add to plan"}
        </button>
        <a
          href={course.course_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="View course"
        >
          <ExternalLinkIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
