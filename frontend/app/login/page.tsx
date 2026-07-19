"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, ArrowRightIcon } from "lucide-react";

function LoginPageInner() {
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
        setOtpStep(true);
        setOtpEmail(result.email);
      } else if (result.user.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Login failed. Please check your credentials.";
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
      <div className="hidden lg:flex lg:w-1/2 bg-primary-dark relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 px-16 max-w-lg">
          <Link href="/" className="flex items-center mb-8">
            <img src="/logo.jpeg" alt="CareerCure" className="h-10 w-auto" />
          </Link>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome<br />back
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Sign in to continue building your career with personalized roadmaps, internships, and courses.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden block mb-10">
            <img src="/logo.jpeg" alt="CareerCure" className="h-8 w-auto" />
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary-dark mb-1">
              {otpStep ? "Verification" : "Sign in"}
            </h2>
            <p className="text-sm text-ink/50">
              {otpStep ? `Enter the code sent to ${otpEmail}` : "Welcome back to your CareerCure account"}
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {otpStep ? (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-2" htmlFor="otp">Verification code</label>
                <input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full text-center tracking-[0.5em] text-lg border border-line rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & sign in
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setOtpStep(false); setOtp(""); setError(""); }}
                className="w-full text-sm text-ink/50 hover:text-ink"
              >
                Back to login
              </button>
            </form>
          ) : (
            <>
              <SocialLoginButtons emailFallbackLabel="email login" googleOnly />

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-paper text-ink/50">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-ink" htmlFor="password">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-sm text-accent hover:text-accent-d">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-d text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-ink/60">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary-d font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}