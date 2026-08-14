"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, MailIcon, CheckCircleIcon } from "lucide-react";
import { authApi } from "@/lib/api";
import AuthBrandPanel from "@/components/AuthBrandPanel";

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
    <div className="min-h-screen flex lg:h-screen lg:overflow-hidden">
      <AuthBrandPanel
        title={<>Recover your<br />account</>}
        subtitle="No worries — we'll help you reset your password and get back to building your career."
      />

      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-paper lg:h-screen lg:overflow-y-auto no-scrollbar">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden block mb-10">
            <img src="/logo.png" alt="CareerCure" className="h-8 w-auto bg-transparent" />
          </Link>
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 mb-8 text-sm text-ink/50 hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary-dark mb-1">
              {step === "email" ? "Forgot your password?" : "Check your email"}
            </h2>
            <p className="text-sm text-ink/50">
              {step === "email"
                ? "Enter your email and we'll send a reset code."
                : `We sent a 6-digit reset code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-2" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sending reset code..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3 rounded-xl">
                <MailIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-primary-dark">
                  Check your Gmail inbox for the reset code. It expires in 10 minutes.
                </p>
              </div>

              {resent && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 text-primary-dark text-sm px-4 py-3 rounded-xl">
                  <CheckCircleIcon className="w-4 h-4 text-primary" />
                  New code sent to your email!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink text-center mb-4">
                  Enter 6-digit reset code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 sm:w-12 text-center text-xl font-bold border-2 border-line rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                Continue to Reset Password
              </button>

              <div className="text-center text-sm text-ink/50">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError("");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="text-xs text-ink/40 hover:text-ink/60"
                >
                  ← Change email address
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
