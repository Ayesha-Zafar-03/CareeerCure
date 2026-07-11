"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          email: payload.sub,
        };
        
        setToken(token);
        setUser(user);
        
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing token:', error);
        router.push('/login?error=Invalid token');
      }
    } else {
      router.push('/login?error=No token received');
    }
  }, [searchParams, router, setUser, setToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-surface rounded-2xl shadow-xl p-8 border border-line text-center max-w-md w-full animate-fade-in-up">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary-dark mb-2">Authentication Successful!</h1>
        <p className="text-ink/60 mb-6">You've been successfully logged in. Redirecting to your dashboard...</p>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
