import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Shield, ArrowLeft, Mail, KeyRound, AlertCircle } from "lucide-react";

type View = "login" | "forgot-email" | "forgot-reset";

export default function AdminLogin() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const inputClass =
    "w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 text-[#1C1C1C] font-medium placeholder:text-stone-400 transition-shadow";

  const showError = (message: string) => {
    setFormError(message);
    toast.error(message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      if (data.user?.role !== "admin") {
        throw new Error("Access denied");
      }

      setAuth(data.user, data.token);
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (error: any) {
      showError(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setFormError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const raw = await response.text();
      let data: { error?: string; message?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          response.status === 404
            ? "Reset API not available. Restart the server and try again."
            : "Failed to send reset code",
        );
      }
      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }
      toast.success(data.message || "Reset code sent to your email");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setView("forgot-reset");
    } catch (error: any) {
      showError(error?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (newPassword !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      toast.success(data.message || "Password updated");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setView("login");
    } catch (error: any) {
      showError(error?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const ErrorBanner = () =>
    formError ? (
      <div
        role="alert"
        className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{formError}</span>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col justify-center items-center py-16 px-4">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/TM-dark-potrait.png"
            alt="Trust Mobile"
            className="h-28 w-auto mx-auto mb-6 object-contain rounded-2xl"
          />
          <div className="inline-flex items-center gap-2 text-[#5C574F] text-sm font-medium">
            <Shield className="w-4 h-4 text-[#C5A059]" />
            Staff access only
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_-24px_rgba(28,28,28,0.25)]">
          {view === "login" && (
            <>
              <h1 className="text-2xl font-display font-semibold text-[#1C1C1C] mb-2 tracking-tight">
                Admin sign in
              </h1>
              <p className="text-[#5C574F] font-medium mb-8 text-sm">
                This area is for store operators. Customer accounts are not used
                on the shop.
              </p>

              <ErrorBanner />

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-[#5C574F] ml-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError("");
                    }}
                    className={inputClass}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 ml-1">
                    <label htmlFor="password" className="text-sm font-semibold text-[#5C574F]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError("");
                        setView("forgot-email");
                      }}
                      className="text-sm font-semibold text-[#996515] hover:text-[#C5A059] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError("");
                    }}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1C1C1C] text-white hover:bg-[#C5A059] hover:text-[#1C1C1C] py-3.5 rounded-full font-semibold transition-colors mt-2 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Sign in"}
                </button>
              </form>
            </>
          )}

          {view === "forgot-email" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setView("login");
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C574F] hover:text-[#1C1C1C] mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>
              <div className="w-12 h-12 rounded-2xl bg-[#F3EBD8] flex items-center justify-center text-[#996515] mb-5">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-display font-semibold text-[#1C1C1C] mb-2 tracking-tight">
                Forgot password
              </h1>
              <p className="text-[#5C574F] font-medium mb-8 text-sm leading-relaxed">
                Enter the email of your admin account. We’ll send a one-time code
                (OTP) to that inbox.
              </p>

              <ErrorBanner />

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-semibold text-[#5C574F] ml-1">
                    Admin email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError("");
                    }}
                    className={inputClass}
                    placeholder="admin@example.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1C1C1C] text-white hover:bg-[#C5A059] hover:text-[#1C1C1C] py-3.5 rounded-full font-semibold transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Sending code..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {view === "forgot-reset" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setView("forgot-email");
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C574F] hover:text-[#1C1C1C] mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Change email
              </button>
              <div className="w-12 h-12 rounded-2xl bg-[#F3EBD8] flex items-center justify-center text-[#996515] mb-5">
                <KeyRound className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-display font-semibold text-[#1C1C1C] mb-2 tracking-tight">
                Reset password
              </h1>
              <p className="text-[#5C574F] font-medium mb-8 text-sm leading-relaxed">
                Enter the 6-digit OTP sent to{" "}
                <span className="text-[#1C1C1C] font-semibold">{email}</span>, then
                choose a new password.
              </p>

              <ErrorBanner />

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-semibold text-[#5C574F] ml-1">
                    OTP code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setFormError("");
                    }}
                    className={`${inputClass} tracking-[0.35em] text-center text-lg`}
                    placeholder="000000"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-semibold text-[#5C574F] ml-1">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setFormError("");
                    }}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-semibold text-[#5C574F] ml-1">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFormError("");
                    }}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1C1C1C] text-white hover:bg-[#C5A059] hover:text-[#1C1C1C] py-3.5 rounded-full font-semibold transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => void sendOtp()}
                  disabled={loading}
                  className="w-full text-sm font-semibold text-[#996515] hover:text-[#C5A059] transition-colors py-1 disabled:opacity-60"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#5C574F]/80 mt-6 font-medium">
          <Link to="/" className="hover:text-[#C5A059] transition-colors">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
