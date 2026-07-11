"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { BriefcaseIcon, CrownIcon, ShieldCheckIcon } from "lucide-react";

export default function AdminHomePage() {
  const router = useRouter();
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
      router.push("/admin");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center bg-surface rounded-2xl shadow-xl p-8 border border-line max-w-md w-full animate-fade-in-up">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CrownIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-primary-dark mb-2">CareerCure Admin Portal</h1>
        <p className="text-ink/60 mb-6">Administrative access for system management</p>
        
        <div className="space-y-3">
          <Link 
            href="/login" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors block"
          >
            Admin Login
          </Link>
          <Link 
            href="http://localhost:3000" 
            className="w-full bg-primary/10 hover:bg-primary/20 text-ink font-medium py-3 px-4 rounded-xl transition-colors block"
          >
            User Dashboard (Port 3000)
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-line">
          <p className="text-xs text-ink/50">
            Admin Portal runs on <strong>Port 3001</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
