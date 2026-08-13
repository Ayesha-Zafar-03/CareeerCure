"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { EyeIcon, EyeOffIcon, MailIcon, CheckCircleIcon, LockIcon } from "lucide-react";

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
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Step 2 state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    setSocialLoading(provider);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/oauth/status`);
      const status = await response.json();
      
      const isConfigured = provider === 'google' ? status.google_configured : status.linkedin_configured;
      
      if (!isConfigured) {
        alert(`${provider === 'google' ? 'Google' : 'LinkedIn'} OAuth is not configured yet. Please use email registration.`);
        return;
      }
      
      const authUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/${provider}`;
      window.location.href = authUrl;
      
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setError(`${provider} login failed. Please try email registration.`);
    } finally {
      setSocialLoading(null);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-paper via-primary/10 to-primary/5 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {step === "form" && (
          <div className="bg-surface rounded-2xl shadow-xl p-8 border border-line animate-fade-in-up">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6">
                <img src="/logo.png" alt="CareerCure" className="h-8 w-auto mx-auto" />
              </Link>
              <h1 className="text-2xl font-bold text-primary-dark mb-2">Create your account</h1>
              <p className="text-ink/60">Join CareerCure and take the next step in your career journey.</p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button 
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-line rounded-xl hover:bg-paper transition-colors font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === 'google' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-line border-t-ink/60 rounded-full animate-spin"></div>
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => handleSocialLogin('linkedin')}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-line rounded-xl hover:bg-paper transition-colors font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === 'linkedin' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    Connecting to LinkedIn...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Continue with LinkedIn
                  </>
                )}
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface text-ink/50">or</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-2" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-4 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors bg-surface"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors bg-surface"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors bg-surface"
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

              <div>
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
                className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-ink/60">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
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
                  className="text-primary hover:text-primary-dark underline"
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
              <Link href="/" className="inline-block mb-6">
                <img src="/logo.png" alt="CareerCure" className="h-8 w-auto mx-auto" />
              </Link>
              <h1 className="text-2xl font-bold text-primary-dark mb-2">Verify your email</h1>
              <p className="text-ink/60">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl">
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

              <div>
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
                                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                                 transition bg-surface"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
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
                  className="text-primary hover:text-primary-dark font-medium disabled:opacity-50"
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
