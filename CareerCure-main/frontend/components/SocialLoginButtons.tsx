"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Provider = "google" | "linkedin";

interface SocialLoginButtonsProps {
  emailFallbackLabel?: string;
}

export default function SocialLoginButtons({
  emailFallbackLabel = "email login",
}: SocialLoginButtonsProps) {
  const [statusLoading, setStatusLoading] = useState(true);
  const [backendUnreachable, setBackendUnreachable] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [linkedinConfigured, setLinkedinConfigured] = useState(false);
  const [redirecting, setRedirecting] = useState<Provider | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    authApi
      .getOAuthStatus()
      .then((res) => {
        if (cancelled) return;
        setGoogleConfigured(res.data.google_configured);
        setLinkedinConfigured(res.data.linkedin_configured);
        setBackendUnreachable(false);
      })
      .catch(() => {
        if (cancelled) return;
        setBackendUnreachable(true);
        setGoogleConfigured(false);
        setLinkedinConfigured(false);
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSocialLogin = (provider: Provider) => {
    setMessage("");

    if (backendUnreachable) {
      setMessage(
        "Cannot reach the API server. Start the backend on port 8000, then refresh this page."
      );
      return;
    }

    const isConfigured = provider === "google" ? googleConfigured : linkedinConfigured;
    if (!isConfigured) {
      setMessage(
        `${provider === "google" ? "Google" : "LinkedIn"} sign-in is not configured. Use ${emailFallbackLabel} instead.`
      );
      return;
    }

    setRedirecting(provider);
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  const socialUnavailable =
    !statusLoading &&
    (backendUnreachable || (!googleConfigured && !linkedinConfigured));

  const providerDisabled = (provider: Provider) => {
    if (statusLoading || redirecting !== null) return true;
    if (backendUnreachable) return true;
    return provider === "google" ? !googleConfigured : !linkedinConfigured;
  };

  if (!statusLoading && !googleConfigured && !linkedinConfigured && !backendUnreachable) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {statusLoading && (
        <p className="text-sm text-ink/50 text-center">Checking social login availability...</p>
      )}

      {message && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      )}

      {socialUnavailable && !message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl">
          {backendUnreachable
            ? "Social login requires the backend API. Start it on port 8000, then refresh."
            : `Social login is not configured yet. Use ${emailFallbackLabel} below.`}
        </div>
      )}

      {!socialUnavailable && (
        <>
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={providerDisabled("google")}
            title={
              providerDisabled("google") && !statusLoading
                ? backendUnreachable
                  ? "Backend API is not reachable"
                  : "Google OAuth is not configured"
                : undefined
            }
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-line rounded-xl hover:bg-primary/5 transition-colors font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {redirecting === "google" ? (
              <>
                <div className="w-5 h-5 border-2 border-line border-t-gray-600 rounded-full animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("linkedin")}
            disabled={providerDisabled("linkedin")}
            title={
              providerDisabled("linkedin") && !statusLoading
                ? backendUnreachable
                  ? "Backend API is not reachable"
                  : "LinkedIn OAuth is not configured"
                : undefined
            }
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-line rounded-xl hover:bg-primary/5 transition-colors font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {redirecting === "linkedin" ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                Connecting to LinkedIn...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Continue with LinkedIn
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
