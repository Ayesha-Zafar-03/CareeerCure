"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthErrorInner() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-surface rounded-2xl shadow-xl p-8 border border-line text-center max-w-md w-full animate-fade-in-up">
        <Link href="/" className="inline-block mb-6">
          <img src="/logo.png" alt="CareerCure" className="h-8 w-auto mx-auto" />
        </Link>
        
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-primary-dark mb-2">Authentication Failed</h1>
        <p className="text-ink/60 mb-6">{message}</p>
        
        <div className="space-y-3">
          <Link 
            href="/login" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors block"
          >
            Try Again
          </Link>
          <Link 
            href="/register" 
            className="w-full bg-primary/10 hover:bg-primary/5 text-ink font-medium py-3 px-4 rounded-xl transition-colors block"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-paper via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthErrorInner />
    </Suspense>
  );
}
