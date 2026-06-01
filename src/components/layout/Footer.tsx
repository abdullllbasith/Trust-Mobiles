import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[#121212] pt-10 md:pt-20 pb-6 md:pb-10 mt-auto text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16 text-center md:text-left">
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6">
              <img
                src="/matrix.png"
                alt="Matrix Logo"
                className="h-10 w-auto invert"
              />
              <span className="font-display font-bold text-lg md:text-xl tracking-tight">
                MATRIX MOBILES
              </span>
            </div>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-sm mb-6 md:mb-8 leading-relaxed mx-auto md:mx-0">
              Your trusted destination for premium mobile devices, accessories,
              and wearables from top global brands.
            </p>
            <div className="flex justify-center md:justify-start gap-3 md:gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2FA84F] hover:text-white transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2FA84F] hover:text-white transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2FA84F] hover:text-white transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2FA84F] hover:text-white transition-colors duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base md:text-lg mb-4 md:mb-6 tracking-wide">
              Company
            </h4>
            <ul className="space-y-3 md:space-y-4 font-medium text-sm md:text-base text-gray-400">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/trade-in"
                  className="hover:text-white transition-colors"
                >
                  Trade-in Program
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Locations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base md:text-lg mb-4 md:mb-6 tracking-wide">
              Support
            </h4>
            <ul className="space-y-3 md:space-y-4 font-medium text-sm md:text-base text-gray-400">
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Order Status
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[10px] md:text-xs font-semibold text-gray-500 tracking-widest gap-4 text-center">
          <div>&copy; {new Date().getFullYear()} MATRIX MOBILES INC.</div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 uppercase">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
