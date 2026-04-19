"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from "lucide-react";
import { authApi } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const e = searchParams.get("email");
    const o = searchParams.get("otp");
    if (e) setEmail(decodeURIComponent(e));
    if (o) setOtp(o);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required."); return; }
    if (!otp.trim() || otp.length < 6) { setError("Please enter the 6-digit reset code."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Reset failed. The code may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Password reset!</h2>
        <p className="text-gray-500 text-sm">Your password has been updated. Redirecting to login...</p>
        <Link href="/login" className="btn-primary inline-block">Go to Login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input id="email" type="email" className="input" placeholder="you@gmail.com"
          value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>

      <div>
        <label className="label" htmlFor="otp">6-digit reset code</label>
        <input id="otp" type="text" inputMode="numeric" maxLength={6}
          className="input font-mono tracking-widest text-center text-lg"
          placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required />
        <p className="text-xs text-gray-400 mt-1">
          Get your code from{" "}
          <Link href="/forgot-password" className="text-primary-600 hover:underline">forgot password</Link>
        </p>
      </div>

      <div>
        <label className="label" htmlFor="newPassword">New password</label>
        <div className="relative">
          <input id="newPassword" type={showPassword ? "text" : "password"} className="input pr-10"
            placeholder="Min. 8 characters" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="confirmPassword">Confirm new password</label>
        <input id="confirmPassword" type={showPassword ? "text" : "password"} className="input"
          placeholder="Repeat your new password" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Resetting password..." : "Reset Password"}
      </button>

      <div className="text-center">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Back to login</Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-xl">
              <BriefcaseIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">CareerCure</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-1 text-sm text-gray-500">Enter your reset code and choose a new password</p>
        </div>
        <div className="card">
          <Suspense fallback={<p className="text-center text-gray-500 py-4">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
