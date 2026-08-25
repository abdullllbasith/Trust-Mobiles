import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setAuth(data.user, data.token);
      toast.success("Logged in successfully");
      navigate(data.user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[var(--bg-color)] flex flex-col justify-center items-center py-20 px-4 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md relative">
        <div className="absolute -inset-4 bg-gradient-to-tr from-[#2E75B6]/20 to-transparent blur-2xl rounded-full opacity-50 pointer-events-none"></div>
        <div className="glass-panel rounded-xl p-10 md:p-12 relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 bg-white/40">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center bg-[#111] p-3 rounded-2xl mb-6 shadow-sm">
              <img src="/matrix.png" alt="Logo" className="w-8 h-8 invert" />
            </div>
            <h1 className="text-3xl font-display font-semibold text-[#111] mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 font-medium">
              Continue to your Matrix Mobiles account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 ml-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="hello@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] font-medium transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="#"
                  className="text-xs font-semibold text-gray-500 hover:text-[#111] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] font-medium transition-all shadow-sm tracking-widest"
              />
            </div>

            <div className="text-xs text-gray-500 font-medium p-4 bg-black/[0.03] rounded-2xl mt-4 border border-black/5 leading-relaxed">
              <strong>Admin Access:</strong> <br />
              Use{" "}
              <code className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-black/5 text-[#111]">
                admin@matrix.com
              </code>{" "}
              &{" "}
              <code className="bg-white px-1.5 py-0.5 rounded shadow-sm border border-black/5 text-[#111]">
                admin123
              </code>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#111] hover:bg-[#2E75B6] text-white py-4 rounded-full font-semibold transition-all shadow-md transform transition-colors"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Secure Login"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#111] hover:underline"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
