"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { profileApi } from "@/lib/api";
import { FileTextIcon, MapIcon, BriefcaseIcon, MessageCircleIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

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
    { icon: FileTextIcon, title: "Upload CV", desc: "Get AI analysis & job matches", href: "/cv", color: "bg-blue-50 text-blue-600" },
    { icon: MapIcon, title: "Generate Roadmap", desc: "Personalised career path", href: "/roadmap", color: "bg-purple-50 text-purple-600" },
    { icon: BriefcaseIcon, title: "Browse Internships", desc: "Find your next opportunity", href: "/internships", color: "bg-green-50 text-green-600" },
    { icon: MessageCircleIcon, title: "Ask AI Counselor", desc: "Get career guidance", href: "/chat", color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20"><p className="text-gray-500">Loading...</p></div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name}!</h1>
              <p className="text-gray-500 mt-1">Here&apos;s what you can do today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.title} href={action.href} className="card hover:shadow-md transition-shadow group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{action.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{action.desc}</p>
                  <div className="flex items-center text-sm text-primary-600 font-medium">
                    Get started <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card lg:col-span-2">
                <h2 className="font-semibold text-gray-900 mb-4">Your Profile</h2>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{profile?.email}</span></div>
                  <div><span className="text-gray-500">Skills:</span> <span className="font-medium">{profile?.profile?.skills?.length || 0} skills</span></div>
                  <div><span className="text-gray-500">CV Uploaded:</span> <span className="font-medium">{profile?.profile?.has_cv ? "Yes" : "Not yet"}</span></div>
                  <div><span className="text-gray-500">Career Goal:</span> <span className="font-medium">{profile?.profile?.career_goal || "Not set"}</span></div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-primary-600 to-accent-600 text-white">
                <h3 className="font-semibold mb-2">💡 Quick Tip</h3>
                <p className="text-sm opacity-90">Upload your CV first to unlock personalised internship matches and get AI-powered feedback on your skills.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
