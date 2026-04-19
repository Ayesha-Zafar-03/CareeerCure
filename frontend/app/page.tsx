"use client";
import Link from "next/link";
import { BriefcaseIcon, FileTextIcon, MapIcon, MessageCircleIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

const FEATURES = [
  {
    icon: FileTextIcon,
    title: "AI CV Analysis",
    description: "Upload your CV and get instant AI-powered feedback — skills extracted, gaps identified, and improvements suggested.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MapIcon,
    title: "Career Roadmap",
    description: "Get a personalised, step-by-step learning path tailored to your skills and career goal.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: BriefcaseIcon,
    title: "Internship Matching",
    description: "Semantically matched internships based on your CV — ranked by how well they fit your profile.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: MessageCircleIcon,
    title: "AI Career Counselor",
    description: "Chat with an AI counselor powered by Groq LLaMA3 and RAG for real-time career guidance.",
    color: "bg-orange-50 text-orange-600",
  },
];

const BENEFITS = [
  "Free to use — no credit card required",
  "Powered by Groq LLaMA3 (ultra-fast AI)",
  "Semantic job matching via ChromaDB",
  "Personalised roadmaps for 20+ tech careers",
  "Real-time AI chatbot with career knowledge base",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">CareerCure</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>🎓</span>
          <span>Built for students & fresh graduates</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Your AI-Powered
          <br />
          <span className="text-primary-600">Career Companion</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          CareerCure analyses your CV, matches you with internships, generates personalised career roadmaps, and answers your career questions — all powered by AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg"
          >
            Start for Free
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything you need to launch your career
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Four powerful AI tools in one platform, designed specifically for CS students and fresh graduates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why CareerCure?
            </h2>
            <ul className="space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-3 h-3 text-green-600" />
                  </div>
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 mt-8 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Create Free Account
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8 text-white">
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm font-medium opacity-80 mb-1">CV Analysis</p>
                <p className="font-semibold">Skills extracted: Python, FastAPI, SQL, Docker</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm font-medium opacity-80 mb-1">Top Match</p>
                <p className="font-semibold">Backend Developer Intern @ StartupHub — 94% match</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm font-medium opacity-80 mb-1">AI Counselor</p>
                <p className="font-semibold">"Focus on building 2-3 portfolio projects to stand out..."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>CareerCure — FYP Project by Ayesha Zafar, Eman & Hira Jawaid</p>
      </footer>
    </div>
  );
}
