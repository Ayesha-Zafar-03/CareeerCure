"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { BriefcaseIcon, EyeIcon, EyeOffIcon, MailIcon, CheckCircleIcon } from "lucide-react";

type Step = "form" | "verify";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Step 1 state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // ── Step 1: Submit registration ──────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ email, full_name: fullName, password });
      setStep("verify");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ───────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.verifyEmail(email, code);
      const { access_token, user } = res.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      // Log in via context then redirect
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    setResent(false);
    setError("");
    try {
      await authApi.resendOtp(email, "email_verification");
      setResent(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-xl">
              <BriefcaseIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">CareerCure</span>
          </Link>
          {step === "form" ? (
            <>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="mt-1 text-sm text-gray-500">Start your career journey today — it&apos;s free</p>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Verify your email</h1>
              <p className="mt-1 text-sm text-gray-500">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </>
          )}
        </div>

        <div className="card">
          {/* ── Step 1: Registration form ── */}
          {step === "form" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="label" htmlFor="fullName">Full name</label>
                <input id="fullName" type="text" className="input" placeholder="Ayesha Zafar"
                  value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input id="email" type="email" className="input" placeholder="you@gmail.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} className="input pr-10"
                    placeholder="Min. 8 characters" value={password}
                    onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Sending verification code..." : "Create Account"}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP verification ── */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
                <MailIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Check your Gmail inbox for the verification code. It expires in 10 minutes.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {resent && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4" />
                  New code sent to your email!
                </div>
              )}

              {/* 6-digit OTP boxes */}
              <div>
                <label className="label text-center block mb-3">Enter 6-digit verification code</label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg
                                 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                                 transition"
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Activate Account"}
              </button>

              <div className="text-center text-sm text-gray-500">
                Didn&apos;t receive the code?{" "}
                <button type="button" onClick={handleResend} disabled={resending}
                  className="text-primary-600 hover:underline font-medium disabled:opacity-50">
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <div className="text-center">
                <button type="button" onClick={() => { setStep("form"); setError(""); setOtp(["","","","","",""]); }}
                  className="text-xs text-gray-400 hover:text-gray-600">
                  ← Change email address
                </button>
              </div>
            </form>
          )}

          {step === "form" && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
