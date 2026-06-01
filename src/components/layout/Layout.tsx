import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import { FloatingChatIcon } from "@/components/ui/FloatingChatIcon";
import Home from "@/pages/Home";

export default function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col relative">
        <div style={{ display: isHome ? 'block' : 'none', width: '100%' }}>
          <Home />
        </div>
        {!isHome && <Outlet />}
      </main>
      {!isAdmin && <Footer />}
      <Toaster position="top-center" richColors />
      {!isAdmin && <FloatingChatIcon />}
    </div>
  );
}
