import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user?.role !== "admin") {
        throw new Error("Access denied");
      }

      setAuth(data.user, data.token);
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center items-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={encodeURI("/Artboard 1.png")}
            alt="Trust Mobile"
            className="h-20 w-auto mx-auto mb-6 object-contain"
          />
          <div className="inline-flex items-center gap-2 text-[#F3EBD8]/70 text-sm font-medium">
            <Shield className="w-4 h-4" />
            Staff access only
          </div>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          <h1 className="text-2xl font-display font-semibold text-white mb-2 tracking-tight">
            Admin sign in
          </h1>
          <p className="text-white/50 font-medium mb-8 text-sm">
            This area is for store operators. Customer accounts are not used on the shop.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-white/70 ml-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#C5A059] text-white font-medium"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-white/70 ml-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0D14] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#C5A059] text-white font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1C1C1C] text-white hover:bg-[#C5A059] hover:text-[#1C1C1C] py-3.5 rounded-full font-semibold transition-colors mt-2"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
