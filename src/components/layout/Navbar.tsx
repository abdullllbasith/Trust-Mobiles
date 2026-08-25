import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import {
  ShoppingBag,
  Menu,
  Search,
  Heart,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const { totalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      navigate("/shop");
      return;
    }
    navigate(`/shop?q=${encodeURIComponent(query)}`);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[15px] font-semibold transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:bg-[#2E75B6] after:transition-all after:duration-300 ${
      isActive
        ? "text-[#0D162B] after:w-full"
        : "text-[#5A6577] hover:text-[#0D162B] after:w-0 hover:after:w-full"
    }`;

  return (
    <header
      style={{ height: "75px" }}
      className="flex items-center justify-between glass-panel sticky top-0 z-50 px-6 md:px-12 transition-all duration-300 bg-white/90"
    >
      <div className="flex items-center gap-10">
        <Logo size="sm" />
        <nav className="hidden lg:flex items-center gap-7">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>

          <div className="group relative py-8">
            <NavLink to="/shop" className={({ isActive }) => `${linkClass({ isActive })} flex items-center gap-1`}>
              Store
              <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            <div className="absolute top-[80px] left-[-20px] w-[500px] bg-white/95 backdrop-blur-2xl border border-[#0D162B]/10 shadow-[0_30px_60px_-15px_rgba(13,22,43,0.12)] rounded-[2rem] p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display font-semibold text-[#0D162B] mb-5 text-lg">
                    Shop
                  </h3>
                  <ul className="space-y-3.5 text-[#5A6577] font-medium">
                    <li>
                      <Link to="/shop?category=Phones" className="hover:text-[#2E75B6] transition-colors block">
                        Smartphones
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop?category=Tablets" className="hover:text-[#2E75B6] transition-colors block">
                        Tablets
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop?category=Accessories" className="hover:text-[#2E75B6] transition-colors block">
                        Accessories
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop?category=Audio" className="hover:text-[#2E75B6] transition-colors block">
                        Audio
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#0D162B] mb-5 text-lg">
                    Featured Brands
                  </h3>
                  <ul className="space-y-3.5 text-[#5A6577] font-medium">
                    <li>
                      <Link to="/shop?brand=Apple" className="hover:text-[#2E75B6] transition-colors block">
                        Apple
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop?brand=Samsung" className="hover:text-[#2E75B6] transition-colors block">
                        Samsung
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop?brand=Google" className="hover:text-[#2E75B6] transition-colors block">
                        Google
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <NavLink to="/trade-in" className={linkClass}>
            Trade-In
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phones & accessories"
            className="bg-[#DEEAF6]/50 text-[#0D162B] border border-transparent rounded-full py-2.5 pl-11 pr-5 text-sm w-72 focus:ring-2 focus:ring-[#2E75B6]/30 focus:bg-white focus:shadow-sm outline-none transition-all focus:w-80 font-medium placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="absolute left-4 text-gray-400 group-focus-within:text-[#2E75B6] transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            to="/wishlist"
            className="relative group p-2 hover:bg-[#DEEAF6] rounded-full transition-colors hidden sm:block"
          >
            <Heart className="h-5 w-5 text-[#5A6577] group-hover:text-[#0D162B] transition-colors" />
            {wishlistItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#0D162B] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative group p-2 hover:bg-[#DEEAF6] rounded-full transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-[#5A6577] group-hover:text-[#0D162B] transition-colors" />
            {totalItems() > 0 && (
              <span className="absolute top-0 right-0 bg-[#2E75B6] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {totalItems()}
              </span>
            )}
          </Link>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className="lg:hidden p-2 hover:bg-[#DEEAF6] rounded-full ml-1 transition-colors">
              <Menu className="h-6 w-6 text-[#0D162B]" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md rounded-l-[3rem] p-8 border-l bg-white/95 backdrop-blur-3xl shadow-2xl"
            >
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main site navigation links
              </SheetDescription>
              <div className="flex flex-col gap-6 mt-10">
                <form
                  onSubmit={(e) => {
                    handleSearch(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search devices..."
                    className="w-full bg-[#DEEAF6]/60 text-[#0D162B] border border-transparent rounded-full py-3 pl-11 pr-5 text-base font-medium placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-[#2E75B6] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>
                {[
                  ["/", "Home"],
                  ["/shop", "Store"],
                  ["/about", "About"],
                  ["/trade-in", "Trade-In"],
                  ["/contact", "Contact"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-display font-medium text-[#0D162B] hover:text-[#2E75B6] transition-colors flex justify-between items-center border-b border-black/5 pb-6"
                  >
                    {label} <ArrowRight className="w-5 h-5 text-gray-300" />
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
