import Link from "next/link";
import { CheckIcon, SparklesIcon } from "lucide-react";

const HIGHLIGHTS = [
  "AI CV analysis with instant, actionable feedback",
  "Personalised career roadmaps built for you",
  "Matched internships & courses from top platforms",
];

export default function AuthBrandPanel({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-primary-dark relative overflow-hidden items-center justify-center">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full border border-white/10" />

      <div className="relative z-10 px-16 max-w-lg">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <img src="/logo.png" alt="CareerCure" className="h-10 w-auto bg-transparent" />
        </Link>
        <div className="inline-flex items-center gap-2 text-accent text-sm font-medium mb-4">
          <SparklesIcon className="w-4 h-4" />
          AI-powered career guidance
        </div>
        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
          {title}
        </h1>
        <p className="text-white/60 text-base leading-relaxed mb-8">
          {subtitle}
        </p>
        <ul className="space-y-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-3 text-white/80">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="w-3 h-3 text-accent" />
              </span>
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
