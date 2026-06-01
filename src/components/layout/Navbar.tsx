import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import {
  ShoppingBag,
  User,
  LogOut,
  Menu,
  UserCircle,
  Search,
  Heart,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuthStore();
  const { totalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header style={{ height: '75px' }} className="flex items-center justify-between glass-panel sticky top-0 z-50 px-6 md:px-12 transition-all duration-300 border-b border-black/[0.05]">
      <div className="flex items-center gap-12">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#555]">
          <Link
            to="/"
            className="hover:text-[#121212] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#121212] hover:after:w-full after:transition-all after:duration-300"
          >
            Home
          </Link>

          <div className="group relative py-8">
            <Link
              to="/shop"
              className="hover:text-[#121212] transition-colors flex items-center gap-1 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#121212] hover:after:w-full after:transition-all after:duration-300"
            >
              Store{" "}
              <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
            {/* Mega Menu Placeholder */}
            <div className="absolute top-[80px] left-[-20px] w-[500px] bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display font-semibold text-[#111] mb-5 text-lg">
                    Categories
                  </h3>
                  <ul className="space-y-3.5 text-[#555] font-medium">
                    <li>
                      <Link
                        to="/shop?category=Phones"
                        className="hover:text-[#2FA84F] transition-colors block"
                      >
                        Smartphones
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/shop?category=Tablets"
                        className="hover:text-[#2FA84F] transition-colors block"
                      >
                        Tablets & iPads
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/shop?category=Accessories"
                        className="hover:text-[#2FA84F] transition-colors block"
                      >
                        Wearables
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/shop?category=Accessories"
                        className="hover:text-[#2FA84F] transition-colors block"
                      >
                        Audio
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#111] mb-5 text-lg">
                    Featured Brands
                  </h3>
                  <ul className="space-y-3.5 text-[#555] font-medium">
                    <li>
                      <Link
                        to="/shop?brand=Apple"
                        className="hover:text-[#2FA84F] transition-colors block"
                      >
                        Apple
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/shop?brand=Samsung"
                        className="hover:text-[#2FA84F] transition-colors block"
                      >
                        Samsung
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/shop?brand=Google"
                        className="hover:text-[#2FA84F] transition-colors block"
                      >
                        Google
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/about"
            className="hover:text-[#121212] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#121212] hover:after:w-full after:transition-all after:duration-300"
          >
            About
          </Link>
          <Link
            to="/trade-in"
            className="hover:text-[#121212] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#121212] hover:after:w-full after:transition-all after:duration-300"
          >
            Trade-In
          </Link>
          <Link
            to="/contact"
            className="hover:text-[#121212] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#121212] hover:after:w-full after:transition-all after:duration-300"
          >
            Contact
          </Link>
          {isAdmin() && (
            <Link
              to="/admin"
              className="text-[#2FA84F] hover:text-[#0E5F3A] transition-colors font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#2FA84F] hover:after:w-full after:transition-all after:duration-300"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex items-center relative group">
          <input
            type="text"
            placeholder="Search devices..."
            className="bg-black/5 text-[#111] border border-transparent rounded-full py-2.5 pl-11 pr-5 text-sm w-64 focus:ring-1 focus:ring-black/20 focus:bg-white focus:shadow-sm outline-none transition-all focus:w-72 font-medium placeholder:text-gray-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-[#111] transition-colors" />
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="relative group p-2 hover:bg-black/5 rounded-full transition-colors hidden sm:block"
          >
            <Heart className="h-5 w-5 text-gray-600 group-hover:text-[#111] transition-colors" />
            {wishlistItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#111] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative group p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-[#111] transition-colors" />
            {totalItems() > 0 && (
              <span className="absolute top-0 right-0 bg-[#2FA84F] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {totalItems()}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 ml-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer">
                <UserCircle className="h-[22px] w-[22px] text-gray-800" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-3 rounded-[1.5rem] shadow-2xl mt-4 border-black/5 bg-white/90 backdrop-blur-2xl"
              >
                <div className="p-4 bg-[#F5F7F6] rounded-2xl mb-3">
                  <p className="font-display font-semibold text-[#111]">
                    {user.name}
                  </p>
                  <p className="text-sm font-medium text-gray-500 truncate mt-1">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer p-3 focus:bg-black/5"
                  onClick={() => navigate("/dashboard")}
                >
                  <div className="flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    <span className="font-semibold text-[#111]">
                      My Account
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-black/5" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl cursor-pointer p-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-semibold">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-3 ml-3 border-l border-black/5 pl-5">
              <Link to="/login">
                <button className="text-sm font-bold text-gray-600 hover:text-[#111] transition-colors py-2 px-1">
                  Log In
                </button>
              </Link>
              <Link to="/register">
                <button className="text-sm font-bold bg-[#121212] text-white hover:bg-[#2FA84F] transition-colors px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-300">
                  Sign Up
                </button>
              </Link>
            </div>
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className="lg:hidden p-2 hover:bg-black/5 rounded-full ml-1 transition-colors">
              <Menu className="h-6 w-6 text-[#111]" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md rounded-l-[3rem] p-8 border-l border-white/20 bg-white/90 backdrop-blur-3xl shadow-2xl"
            >
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main site navigation links
              </SheetDescription>
              <div className="flex flex-col gap-6 mt-10">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-[#111] hover:text-[#2FA84F] transition-colors flex justify-between items-center border-b border-black/5 pb-6"
                >
                  Home <ArrowRight className="w-5 h-5 text-gray-300" />
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-[#111] hover:text-[#2FA84F] transition-colors flex justify-between items-center border-b border-black/5 pb-6"
                >
                  Store <ArrowRight className="w-5 h-5 text-gray-300" />
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-[#111] hover:text-[#2FA84F] transition-colors flex justify-between items-center border-b border-black/5 pb-6"
                >
                  About <ArrowRight className="w-5 h-5 text-gray-300" />
                </Link>
                <Link
                  to="/trade-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-[#111] hover:text-[#2FA84F] transition-colors flex justify-between items-center border-b border-black/5 pb-6"
                >
                  Trade-In <ArrowRight className="w-5 h-5 text-gray-300" />
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-[#111] hover:text-[#2FA84F] transition-colors flex justify-between items-center border-b border-black/5 pb-6"
                >
                  Contact <ArrowRight className="w-5 h-5 text-gray-300" />
                </Link>
                {!user && (
                  <div className="flex flex-col gap-4 mt-8">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full bg-[#F5F7F6] text-[#111] font-bold py-4 rounded-full text-lg shadow-inner">
                        Log In
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full bg-[#121212] text-white font-bold py-4 rounded-full text-lg shadow-xl shadow-black/20">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
