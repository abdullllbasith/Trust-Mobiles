import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import { FloatingChatIcon } from "@/components/ui/FloatingChatIcon";

export default function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      <Toaster position="top-center" richColors />
      {!isAdmin && <FloatingChatIcon />}
    </div>
  );
}
