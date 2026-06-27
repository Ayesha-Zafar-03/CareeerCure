"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { profileApi } from "@/lib/api";
import { 
  FileTextIcon, MapIcon, BriefcaseIcon, MessageCircleIcon, 
  ArrowRightIcon, TrendingUpIcon, CheckCircleIcon, BookOpenIcon
} from "lucide-react";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi.getMe().then((res) => {
      setProfile(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const QUICK_ACTIONS = [
    { 
      icon: FileTextIcon, 
      title: "CV Analysis", 
      desc: "Upload and analyze your CV", 
      href: "/cv", 
      color: "primary"
    },
    { 
      icon: MapIcon, 
      title: "Career Roadmap", 
      desc: "Plan your career path", 
      href: "/roadmap", 
      color: "accent"
    },
    { 
      icon: BriefcaseIcon, 
      title: "Internships", 
      desc: "Browse opportunities", 
      href: "/internships", 
      color: "green"
    },
    { 
      icon: BookOpenIcon, 
      title: "Courses", 
      desc: "Learn new skills", 
      href: "/courses", 
      color: "orange"
    },
    { 
      icon: MessageCircleIcon, 
      title: "Career Coach", 
      desc: "Get AI career advice", 
      href: "/chat", 
      color: "accent"
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: "bg-primary-500 hover:bg-primary-600",
      accent: "bg-accent-500 hover:bg-accent-600",
      green: "bg-green-600 hover:bg-green-700",
      orange: "bg-orange-600 hover:bg-orange-700",
      blue: "bg-blue-600 hover:bg-blue-700",
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"></div>
              <p className="text-gray-500 mt-4">Loading...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {profile?.full_name}
                </h1>
                <p className="text-gray-600">
                  Here's your career development overview
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.profile?.has_cv ? "75%" : "25%"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile?.profile?.has_cv ? "Good progress" : "Upload CV to improve"}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Skills Added</p>
                    <TrendingUpIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.profile?.skills?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Technical & soft skills</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">CV Status</p>
                    <FileTextIcon className="w-5 h-5 text-accent-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.profile?.has_cv ? "✓" : "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile?.profile?.has_cv ? "Uploaded" : "Not uploaded"}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Career Goal</p>
                    <MapIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {profile?.profile?.career_goal || "Not set"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Target role</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {QUICK_ACTIONS.map((action) => (
                    <Link 
                      key={action.title} 
                      href={action.href} 
                      className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(action.color)} text-white`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{action.desc}</p>
                      <div className="flex items-center text-sm text-primary-600 font-medium">
                        Start now
                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Details */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email Address</p>
                        <p className="text-gray-900 mt-1">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Skills</p>
                        <p className="text-gray-900 mt-1">
                          {profile?.profile?.skills?.length || 0} skills added
                        </p>
                      </div>
                      <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Edit
                      </Link>
                    </div>
                    <div className="flex items-start justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-600">CV Status</p>
                        <p className="text-gray-900 mt-1">
                          {profile?.profile?.has_cv ? "Uploaded and analyzed" : "Not uploaded yet"}
                        </p>
                      </div>
                      <Link href="/cv" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        {profile?.profile?.has_cv ? "View" : "Upload"}
                      </Link>
                    </div>
                    <div className="flex items-start justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Career Goal</p>
                        <p className="text-gray-900 mt-1">
                          {profile?.profile?.career_goal || "Not set yet"}
                        </p>
                      </div>
                      <Link href="/roadmap" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Set Goal
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h2>
                  <div className="space-y-4">
                    {!profile?.profile?.has_cv && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Upload Your CV</p>
                          <p className="text-xs text-gray-600 mt-1">Get AI-powered analysis and job matches</p>
                          <Link href="/cv" className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                            Upload now →
                          </Link>
                        </div>
                      </div>
                    )}
                    
                    {!profile?.profile?.career_goal && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-accent-600">
                            {profile?.profile?.has_cv ? "2" : "2"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Set Career Goal</p>
                          <p className="text-xs text-gray-600 mt-1">Generate a personalized roadmap</p>
                          <Link href="/roadmap" className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                            Create roadmap →
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Browse Internships</p>
                        <p className="text-xs text-gray-600 mt-1">Find opportunities that match your skills</p>
                        <Link href="/internships" className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                          Explore →
                        </Link>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Take Courses</p>
                        <p className="text-xs text-gray-600 mt-1">Upskill with recommended courses</p>
                        <Link href="/courses" className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                          View courses →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources Section */}
              <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/courses" className="group p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-all">
                    <BookOpenIcon className="w-8 h-8 text-primary-600 mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Learning Courses</h3>
                    <p className="text-sm text-gray-600">Curated courses for your career path</p>
                  </Link>
                  <Link href="/roadmap" className="group p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-all">
                    <MapIcon className="w-8 h-8 text-accent-600 mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Career Roadmaps</h3>
                    <p className="text-sm text-gray-600">Step-by-step career guidance</p>
                  </Link>
                  <Link href="/chat" className="group p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-all">
                    <MessageCircleIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">AI Career Counselor</h3>
                    <p className="text-sm text-gray-600">Get personalized career advice</p>
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
