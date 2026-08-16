"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  BriefcaseIcon, 
  FileTextIcon, 
  MapIcon, 
  MessageCircleIcon, 
  ArrowRightIcon, 
  CheckIcon,
  SparklesIcon,
  ZapIcon,
  TrendingUpIcon,
  BrainIcon,
  RocketIcon,
  TargetIcon,
  StarIcon,
  BookOpenIcon
} from "lucide-react";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import TypewriterText, { TypewriterSequence } from "@/components/TypewriterText";

const VantaBackground = dynamic(() => import("@/components/VantaBackground"), { ssr: false });


const FEATURES = [
  {
    icon: FileTextIcon,
    title: "AI CV Analysis",
    description: "Upload your CV and get instant AI-powered feedback — skills extracted, gaps identified, and improvements suggested.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapIcon,
    title: "Career Roadmap",
    description: "Get a personalised, step-by-step learning path tailored to your skills and career goal.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BriefcaseIcon,
    title: "Job Matching",
    description: "Semantically matched internships based on your CV — ranked by how well they fit your profile.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpenIcon,
    title: "Course Recommendations",
    description: "Discover top courses from Udemy, Coursera, and edX — personalized to fill your skill gaps and advance your career.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: MessageCircleIcon,
    title: "AI Career Counselor",
    description: "Chat with an AI counselor powered by Groq LLaMA3 and RAG for real-time career guidance.",
    color: "bg-primary/10 text-primary",
  },
];

const BENEFITS = [
  "Free to use — no credit card required",
  "Powered by Groq LLaMA3 (ultra-fast AI)",
  "Semantic job matching via ChromaDB",
  "Curated courses from top platforms (Udemy, Coursera, edX)",
  "Personalised roadmaps for 20+ tech careers",
  "Real-time AI chatbot with career knowledge base",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <VantaBackground />
      <div className="fixed inset-0 bg-gradient-to-br from-paper/90 via-surface/60 to-primary/10 -z-10" />
      <div className="relative z-10">
      <LandingHeader />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-paper to-primary/5 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-bounce border border-line">
          <span className="animate-pulse">🎓</span>
          <span>Built for students & fresh graduates</span>
        </div>
        
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary-dark leading-tight mb-6">
            <TypewriterSequence
              lines={[
                "Your AI-Powered",
                "Career Companion",
              ]}
              speed={40}
              lineDelay={800}
              className="flex flex-col items-center"
            />
          </h1>
          
          {/* Animated decorative elements */}
          <div className="absolute -top-8 left-1/4 w-8 h-8 bg-primary/40 rounded-full flex items-center justify-center animate-bounce opacity-60 shadow-lg" style={{animationDelay: '0s'}}>
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-4 right-1/4 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce opacity-60 shadow-lg" style={{animationDelay: '1s'}}>
            <ZapIcon className="w-3 h-3 text-white" />
          </div>
          <div className="absolute -bottom-4 left-1/3 w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center animate-bounce opacity-60 shadow-lg" style={{animationDelay: '2s'}}>
            <RocketIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <TypewriterText
          text="Upload your CV → Get matched with internships, courses & a personalised roadmap → Land your dream role."
          speed={25}
          startDelay={1800}
          className="text-xl text-ink/50 max-w-2xl mx-auto mb-10 block"
        />
        
        {/* Live feature highlights */}
        <div className="max-w-3xl mx-auto mb-10" style={{ minHeight: '60px' }}>
          <TypewriterSequence
            lines={[
              "✨  AI CV Analysis — Skills extracted, gaps identified, improvements suggested",
              "🗺️  Career Roadmap — Step-by-step path tailored to your goals",
              "💼  Job Matching — Semantically ranked internships from your CV",
              "📚  Course Recommendations — Curated from Udemy, Coursera, edX",
              "🤖  AI Career Counselor — Real-time guidance powered by Groq LLaMA3",
            ]}
            speed={18}
            lineDelay={1200}
            className="text-left text-base text-ink/60 font-light leading-relaxed"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: '1s'}}>
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-gradient-to-r from-primary to-primary-d hover:from-primary-d hover:to-primary-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start for Free
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 border-2 border-line hover:bg-primary/5 text-ink font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 text-lg hover:border-primary/40 hover:shadow-md"
          >
            Sign In
          </Link>
          </div>
            
        {/* Animated Stats/Features Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up" style={{animationDelay: '1.5s'}}>
          {[
            { icon: BrainIcon, label: "AI-Powered", value: "100%", color: "text-primary" },
            { icon: TrendingUpIcon, label: "Success Rate", value: "95%", color: "text-accent" },
            { icon: TargetIcon, label: "Job Matches", value: "1000+", color: "text-primary" },
            { icon: ZapIcon, label: "Fast Analysis", value: "< 30s", color: "text-accent" }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center p-4 bg-surface/60 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-surface/80 transition-all duration-300 group">
              <div className="flex justify-center mb-3">
                <stat.icon className={`w-8 h-8 ${stat.color} group-hover:animate-bounce transition-all duration-300`} />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-ink/60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Professional Animation Placeholder */}
        <div className="mt-20 animate-fade-in-up scroll-mt-20" style={{animationDelay: '2s'}}>
          <div className="bg-gradient-to-br from-primary/5 to-paper rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <RocketIcon className="w-16 h-16 text-primary animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-primary-dark mb-2">AI-Powered Career Growth</h3>
            <p className="text-ink/60">Experience the future of career development with our intelligent platform</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gradient-to-r from-paper to-primary/5 py-20 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-dark mb-4 animate-fade-in-up">
              Everything you need to launch your career
            </h2>
            <p className="text-center text-ink/50 max-w-xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Five powerful AI tools in one platform, designed specifically for CS students and fresh graduates.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {FEATURES.map((f, index) => (
              <div 
                key={f.title} 
                className="group bg-surface/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/40 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-up hover:bg-surface"
                style={{animationDelay: `${index * 0.15}s`}}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6 group-hover:animate-bounce" />
                </div>
                <TypewriterText
                  text={f.title}
                  speed={30}
                  startDelay={index * 200}
                  className="font-semibold text-primary-dark mb-2"
                />
                <p className="text-sm text-ink/50 leading-relaxed">{f.description}</p>
                
                {/* Animated accent */}
                <div className="mt-4 h-1 bg-gradient-to-r from-primary/40 to-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-primary/40 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-primary rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </section>

      {/* Benefits */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 relative scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-primary-dark mb-6">
              Why CareerCure?
            </h2>
            <ul className="space-y-4">
              {BENEFITS.map((b, index) => (
                <li 
                  key={b} 
                  className="flex items-center gap-3 text-ink animate-fade-in-up group"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-primary to-primary-d rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="group-hover:text-primary-dark transition-colors">{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-primary to-primary-d hover:from-primary-d hover:to-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
            >
              Create Free Account
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="relative animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="bg-gradient-to-br from-primary via-primary-d to-primary-dark rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-shadow duration-300 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-surface/5 to-transparent animate-pulse"></div>
              
              <div className="space-y-4 relative z-10">
                <div className="bg-surface/10 backdrop-blur-sm rounded-xl p-4 hover:bg-surface/20 transition-colors duration-300 group">
                  <div className="flex items-center gap-3 mb-2">
                    <FileTextIcon className="w-5 h-5 text-primary/60 group-hover:animate-bounce" />
                    <p className="text-sm font-medium opacity-80 group-hover:opacity-100">CV Analysis</p>
                  </div>
                  <p className="font-semibold flex items-center gap-2">
                    Skills extracted: Python, FastAPI, SQL, Docker
                    <ZapIcon className="w-4 h-4 text-accent/80 animate-pulse" />
                  </p>
                </div>
                
                <div className="bg-surface/10 backdrop-blur-sm rounded-xl p-4 hover:bg-surface/20 transition-colors duration-300 group">
                  <div className="flex items-center gap-3 mb-2">
                    <TargetIcon className="w-5 h-5 text-primary/60 group-hover:animate-bounce" />
                    <p className="text-sm font-medium opacity-80 group-hover:opacity-100">Top Match</p>
                  </div>
                  <p className="font-semibold flex items-center gap-2">
                    Backend Developer Intern @ StartupHub — 94% match
                    <StarIcon className="w-4 h-4 text-accent/80 animate-pulse" />
                  </p>
                </div>
                
                <div className="bg-surface/10 backdrop-blur-sm rounded-xl p-4 hover:bg-surface/20 transition-colors duration-300 group">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircleIcon className="w-5 h-5 text-primary/60 group-hover:animate-bounce" />
                    <p className="text-sm font-medium opacity-80 group-hover:opacity-100">AI Counselor</p>
                  </div>
                  <p className="font-semibold flex items-center gap-2">
                    "Focus on building 2-3 portfolio projects to stand out..."
                    <BrainIcon className="w-4 h-4 text-primary/20 animate-pulse" />
                  </p>
                </div>
              </div>
              
              {/* Floating decorative elements */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-surface/30 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-6 w-2 h-2 bg-surface/40 rounded-full animate-pulse"></div>
            </div>
            
            {/* External floating elements with Lucide icons */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-primary/40 to-primary/60 rounded-full flex items-center justify-center animate-bounce opacity-80 shadow-lg" style={{animationDelay: '1s'}}>
              <RocketIcon className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center animate-bounce opacity-80 shadow-lg" style={{animationDelay: '2s'}}>
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-1/4 right-0 w-32 h-32 bg-gradient-to-br from-primary/40 to-primary rounded-full opacity-10 animate-float blur-3xl"></div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gradient-to-r from-paper to-primary/5 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-dark mb-4">
              Loved by students & graduates
            </h2>
            <p className="text-center text-ink/50 max-w-xl mx-auto">
              See how CareerCure is helping the next generation launch their careers with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "CareerCure's CV analysis showed me exactly which skills to build. I landed a backend internship within a month!",
                name: "Ayesha Zafar",
                role: "CS Student",
              },
              {
                quote:
                  "The personalised roadmap kept me on track. The internship matches were scarily accurate to my profile.",
                name: "Eman Abdul Khaliq",
                role: "Fresh Graduate",
              },
              {
                quote:
                  "The AI career coach answered every doubt I had about switching fields. Genuinely felt like having a mentor.",
                name: "Hira Jawaid",
                role: "Career Switcher",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-surface rounded-xl p-6 shadow-sm border border-line hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 text-accent mb-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} className="w-4 h-4 fill-accent" />
                  ))}
                </div>
                <p className="text-ink/80 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-dark">{t.name}</p>
                    <p className="text-xs text-ink/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Team */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary-dark mb-4">About CareerCure</h2>
            <p className="text-ink/60 leading-relaxed mb-4">
              CareerCure is an AI-powered career development platform built for students and fresh
              graduates. We combine CV analysis, semantic internship matching, and personalised
              roadmaps to help you take the guesswork out of launching your career.
            </p>
            <p className="text-ink/60 leading-relaxed">
              Our mission is to make expert career guidance accessible to everyone — free, fast, and
              tailored to your goals.
            </p>
          </div>
          <div id="team" className="scroll-mt-20">
            <h3 className="text-xl font-semibold text-primary-dark mb-6">Meet the team</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Ayesha Zafar", role: "Co-Founder" },
                { name: "Eman Abdul Khaliq", role: "Co-Founder" },
                { name: "Hira Jawaid", role: "Co-Founder" },
              ].map((m) => (
                <div
                  key={m.name}
                  className="bg-surface rounded-xl p-5 shadow-sm border border-line text-center"
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg mb-3">
                    {m.name.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-primary-dark">{m.name}</p>
                  <p className="text-xs text-ink/50">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="border-t border-line/50 bg-gradient-to-r from-paper to-primary/5 py-20 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-dark mb-4">
            Ready to launch your career?
          </h2>
          <p className="text-ink/60 mb-8">
            Join CareerCure today and get personalised AI guidance — free for students and fresh graduates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-primary hover:bg-primary-d text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200 text-lg shadow-md"
            >
              Get Started Free
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 border-2 border-line hover:bg-primary/5 text-ink font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200 text-lg"
            >
              Contact Us
            </Link>
          </div>

          <div id="careers" className="mt-12 pt-10 border-t border-line/50">
            <p className="text-sm font-medium text-primary-dark mb-2">Careers</p>
            <p className="text-sm text-ink/60">
              We're a student-built team passionate about career development. Reach
              out via our{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact page
              </a>{" "}
              to collaborate or learn more.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      </div>
      </div>
  );
}
