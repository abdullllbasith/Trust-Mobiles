import { Outlet, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";
import { LogOut } from "lucide-react";

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <header className="h-[72px] flex items-center justify-between px-4 md:px-8 bg-[#0A0D14] border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Logo to="/admin" variant="dark" />
          <span className="hidden sm:inline text-xs font-semibold tracking-[0.2em] uppercase text-[#DEEAF6]/60 border-l border-white/15 pl-4">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm text-white/60 font-medium truncate max-w-[200px]">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}
