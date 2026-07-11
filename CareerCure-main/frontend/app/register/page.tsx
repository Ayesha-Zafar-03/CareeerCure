"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { BriefcaseIcon, EyeIcon, EyeOffIcon, MailIcon, CheckCircleIcon, LockIcon } from "lucide-react";

type Step = "form" | "verify";
type AgeRange = "16-18" | "19-24" | "25+";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Step 1 state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageRange, setAgeRange] = useState<AgeRange | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [noCvYet, setNoCvYet] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [showSocialLogin, setShowSocialLogin] = useState(true);

  // ── Step 1: Submit registration ──────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!ageRange) {
      setError("Please select your age range.");
      return;
    }
    
    setLoading(true);
    try {
      await authApi.register({ 
        email, 
        full_name: fullName, 
        password
      });
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
    <div className="min-h-screen bg-gradient-to-br from-paper via-primary/5 to-primary/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {step === "form" && (
          <div className="bg-surface rounded-2xl shadow-xl p-8 border border-line animate-fade-in-up">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="bg-primary p-2.5 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-primary-dark">CareerCure</span>
              </Link>
              <h1 className="text-2xl font-bold text-primary-dark mb-2">Create your account</h1>
              <p className="text-ink/60">Join CareerCure and take the next step in your career journey.</p>
            </div>

            {/* Social Login Buttons */}
            <div id="social-login-section">
              <SocialLoginButtons emailFallbackLabel="email registration" />
            </div>

            {/* Only show "or" divider if social login is potentially available */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface text-ink/50">or continue with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-ink mb-2" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-4 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="animate-fade-in-up">
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
                  />
                </div>
              </div>

              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-ink mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60"
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-ink mb-3">
                  What's your age range?
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "16-18" as AgeRange, label: "16-18" },
                    { value: "19-24" as AgeRange, label: "19-24" },
                    { value: "25+" as AgeRange, label: "25+" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="ageRange"
                        value={option.value}
                        checked={ageRange === option.value}
                        onChange={(e) => setAgeRange(e.target.value as AgeRange)}
                        className="w-4 h-4 text-primary border-line focus:ring-primary/40"
                      />
                      <span className="ml-2 text-sm text-ink">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-ink/60">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary-d font-medium">
                  Log in
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center">
              <input
                id="noCvYet"
                type="checkbox"
                checked={noCvYet}
                onChange={(e) => setNoCvYet(e.target.checked)}
                className="w-4 h-4 text-primary border-line rounded focus:ring-primary/40"
              />
              <label htmlFor="noCvYet" className="ml-2 text-sm text-ink/60">
                I don't have a CV yet -{" "}
                <Link 
                  href="/cv?tab=generate" 
                  className="text-primary hover:text-primary-d underline"
                  target="_blank"
                >
                  Start wizard
                </Link>
              </label>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="bg-surface rounded-2xl shadow-xl p-8 border border-line animate-fade-in-up">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="bg-primary p-2.5 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-primary-dark">CareerCure</span>
              </Link>
              <h1 className="text-2xl font-bold text-primary-dark mb-2">Verify your email</h1>
              <p className="text-ink/60">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-3 rounded-xl">
                <MailIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-primary-dark">
                  Check your Gmail inbox for the verification code. It expires in 10 minutes.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {resent && (
                <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-sm px-4 py-3 rounded-xl">
                  <CheckCircleIcon className="w-4 h-4" />
                  New code sent to your email!
                </div>
              )}

              <div className="animate-fade-in-up">
                <label className="block text-sm font-medium text-ink text-center mb-4">
                  Enter 6-digit verification code
                </label>
                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
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
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-line rounded-xl
                                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40
                                 transition"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Activate Account"}
              </button>

              <div className="text-center text-sm text-ink/50">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary hover:text-primary-d font-medium disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError("");
                    setOtp(["","","","","",""]);
                  }}
                  className="text-xs text-ink/40 hover:text-ink/60"
                >
                  ← Change email address
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
