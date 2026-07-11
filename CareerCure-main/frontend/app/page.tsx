"use client";
import Link from "next/link";
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
  CodeIcon,
  DatabaseIcon,
  BrainIcon,
  RocketIcon,
  TargetIcon,
  StarIcon,
  UsersIcon,
  BookOpenIcon
} from "lucide-react";


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
    icon: BookOpenIcon,
    title: "Course Recommendations",
    description: "Discover top courses from Udemy, Coursera, and edX — personalized to fill your skill gaps and advance your career.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: MessageCircleIcon,
    title: "AI Career Counselor",
    description: "Chat with an AI counselor powered by Groq LLaMA3 and RAG for real-time career guidance.",
    color: "bg-indigo-50 text-indigo-600",
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
    <div className="min-h-screen bg-gradient-to-br from-paper via-surface to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float opacity-20 ${
              i % 3 === 0 ? 'bg-primary/40' : i % 3 === 1 ? 'bg-primary' : 'bg-primary/20'
            } flex items-center justify-center`}
            style={{
              width: `${30 + Math.random() * 60}px`,
              height: `${30 + Math.random() * 60}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 8}s`
            }}
          >
            {i % 4 === 0 && <CodeIcon className="w-4 h-4 text-white opacity-60" />}
            {i % 4 === 1 && <DatabaseIcon className="w-4 h-4 text-white opacity-60" />}
            {i % 4 === 2 && <UsersIcon className="w-4 h-4 text-white opacity-60" />}
            {i % 4 === 3 && <StarIcon className="w-4 h-4 text-white opacity-60" />}
          </div>
        ))}
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse"></div>
      </div>
      {/* Navbar */}
      <nav className="border-b border-line/50 px-6 py-4 backdrop-blur-sm bg-surface/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-primary to-primary-d p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              CareerCure
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm text-ink/60 hover:text-primary font-medium transition-colors duration-200 hover:scale-105 transform"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-primary to-primary-d hover:from-primary-d hover:to-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-paper to-primary/5 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-bounce border border-line">
          <span className="animate-pulse">🎓</span>
          <span>Built for students & fresh graduates</span>
        </div>
        
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary-dark leading-tight mb-6">
            <span className="inline-block animate-fade-in-up">Your AI-Powered</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-d to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Career Companion
            </span>
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
        
        <p className="text-xl text-ink/50 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          CareerCure analyses your CV, matches you with internships and courses, generates personalised career roadmaps, and answers your career questions — all powered by AI.
        </p>
        
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
            { icon: TrendingUpIcon, label: "Success Rate", value: "95%", color: "text-green-500" },
            { icon: TargetIcon, label: "Job Matches", value: "1000+", color: "text-primary" },
            { icon: ZapIcon, label: "Fast Analysis", value: "< 30s", color: "text-yellow-500" }
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
        <div className="mt-20 animate-fade-in-up" style={{animationDelay: '2s'}}>
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
      <section className="bg-gradient-to-r from-paper to-primary/5 py-20 relative">
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
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6 group-hover:animate-bounce" />
                </div>
                <h3 className="font-semibold text-primary-dark mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
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
      <section className="max-w-7xl mx-auto px-6 py-20 relative">
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
                  <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
                    <ZapIcon className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </p>
                </div>
                
                <div className="bg-surface/10 backdrop-blur-sm rounded-xl p-4 hover:bg-surface/20 transition-colors duration-300 group">
                  <div className="flex items-center gap-3 mb-2">
                    <TargetIcon className="w-5 h-5 text-primary/60 group-hover:animate-bounce" />
                    <p className="text-sm font-medium opacity-80 group-hover:opacity-100">Top Match</p>
                  </div>
                  <p className="font-semibold flex items-center gap-2">
                    Backend Developer Intern @ StartupHub — 94% match
                    <StarIcon className="w-4 h-4 text-yellow-300 animate-pulse" />
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

      {/* Footer */}
      <footer className="border-t border-line/50 py-8 text-center text-sm text-ink/40 bg-gradient-to-r from-paper to-primary/5 relative">
        <div className="relative z-10">
          <p className="hover:text-primary transition-colors duration-300">
            CareerCure — FYP Project by 
            <span className="font-medium text-primary"> Ayesha Zafar, Eman & Hira Jawaid</span>
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <SparklesIcon className="w-4 h-4 text-yellow-500 animate-bounce" />
            <RocketIcon className="w-4 h-4 text-primary/40 animate-bounce" style={{animationDelay: '0.1s'}} />
            <BriefcaseIcon className="w-4 h-4 text-primary animate-bounce" style={{animationDelay: '0.2s'}} />
            <StarIcon className="w-4 h-4 text-primary/60 animate-bounce" style={{animationDelay: '0.3s'}} />
          </div>
        </div>
        
        {/* Subtle background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
      </footer>
      </div>
    );
}
