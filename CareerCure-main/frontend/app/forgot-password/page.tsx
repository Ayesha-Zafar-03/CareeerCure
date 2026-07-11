"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseIcon, ArrowLeftIcon, MailIcon, CheckCircleIcon } from "lucide-react";
import { authApi } from "@/lib/api";

type Step = "email" | "otp";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  // ── Step 1: Send OTP to email ────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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

  // ── Step 2: Verify OTP → go to reset page ───────────────────────────────
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    // Pass email + otp to reset page via query params
    router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${code}`);
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    setError("");
    try {
      await authApi.resendOtp(email, "password_reset");
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <BriefcaseIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-primary-dark">CareerCure</span>
          </Link>
          {step === "email" ? (
            <>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Forgot your password?</h1>
              <p className="mt-1 text-sm text-gray-500">Enter your email and we&apos;ll send a reset code</p>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-1 text-sm text-gray-500">
                We sent a 6-digit reset code to <strong>{email}</strong>
              </p>
            </>
          )}
        </div>

        <div className="card">
          {/* ── Step 1: Email input ── */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input id="email" type="email" className="input" placeholder="you@gmail.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Sending reset code..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP input ── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 px-4 py-3 rounded-lg">
                <MailIcon className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <p className="text-sm text-orange-700">
                  Check your Gmail inbox for the reset code. It expires in 10 minutes.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              {resent && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4" />
                  New code sent to your email!
                </div>
              )}

              <div>
                <label className="label text-center block mb-3">Enter 6-digit reset code</label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg
                                 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Continue to Reset Password →
              </button>

              <div className="text-center text-sm text-gray-500">
                Didn&apos;t receive the code?{" "}
                <button type="button" onClick={handleResend} disabled={resending}
                  className="text-primary-600 hover:underline font-medium disabled:opacity-50">
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <div className="text-center">
                <button type="button" onClick={() => { setStep("email"); setError(""); setOtp(["","","","","",""]); }}
                  className="text-xs text-gray-400 hover:text-gray-600">
                  ← Change email address
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="w-3 h-3" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
