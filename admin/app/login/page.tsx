"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from "lucide-react";

export default function LoginPage() {
  const { login, verifyAdminLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.status === "admin_otp_required") {
        setOtpEmail(result.email);
        setOtpStep(true);
      } else if (result.user.is_admin) {
        router.push("/admin");
      } else {
        setError("This account does not have admin access.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Invalid credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await verifyAdminLogin(otpEmail, otp.trim());
      if (user.is_admin) router.push("/admin");
      else setError("This account does not have admin access.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Invalid or expired code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cream rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cream rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 px-16 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.jpeg" alt="CareerCure" className="h-10 w-auto" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-cream/40">Admin</span>
          </div>
          <h1 className="text-4xl font-bold text-cream leading-tight mb-4">
            Administration<br />Panel
          </h1>
          <p className="text-cream/50 text-base leading-relaxed">
            Manage users, courses, internships, and monitor system health for the CareerCure platform.
          </p>
          <div className="mt-12 pt-8 border-t border-cream/10 flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-cream">3001</p>
              <p className="text-xs text-cream/40 uppercase tracking-wider">Port</p>
            </div>
            <div className="w-px h-10 bg-cream/10" />
            <div>
              <p className="text-2xl font-bold text-cream">v1.0</p>
              <p className="text-xs text-cream/40 uppercase tracking-wider">Version</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-cream-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <img src="/logo.jpeg" alt="CareerCure" className="h-8 w-auto" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-navy/40 ml-1">Admin</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-1">
              {otpStep ? "Verification" : "Sign in"}
            </h2>
            <p className="text-sm text-navy/40">
              {otpStep ? `Enter the code sent to ${otpEmail}` : "Enter your admin credentials"}
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {otpStep ? (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="otp">Verification code</label>
                <input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  className="input text-center tracking-[0.5em] text-lg"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-navy hover:bg-navy-50 text-cream font-medium py-2.5 px-4 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & sign in
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setOtp("");
                  setError("");
                }}
                className="w-full text-sm text-navy/40 hover:text-navy"
              >
                Back to login
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="admin@careercure.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/30 hover:text-navy/60"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-navy hover:bg-navy-50 text-cream font-medium py-2.5 px-4 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          )}

          <p className="mt-8 text-center text-xs text-navy/30">
            <Link href="http://localhost:3000" className="text-navy/50 hover:text-navy underline underline-offset-2">
              User Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
