import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#1A1A1B] pt-10 md:pt-20 pb-6 md:pb-10 mt-auto text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16 text-center md:text-left">
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6">
              <img
                src={encodeURI("/Artboard 1.png")}
                alt="Trust Mobile"
                className="h-20 md:h-24 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-sm mb-6 md:mb-8 leading-relaxed mx-auto md:mx-0">
              Clean, trusted shopping for mobile phones and accessories. Order
              in a few taps — we confirm everything on WhatsApp.
            </p>
            <div className="flex justify-center md:justify-start gap-3 md:gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base md:text-lg mb-4 md:mb-6 tracking-wide">
              Shop
            </h4>
            <ul className="space-y-3 md:space-y-4 font-medium text-sm md:text-base text-gray-400">
              <li>
                <Link to="/shop?category=Phones" className="hover:text-white transition-colors">
                  Phones
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/trade-in" className="hover:text-white transition-colors">
                  Trade-in
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
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
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-white transition-colors">
                  WhatsApp checkout
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[10px] md:text-xs font-semibold text-gray-500 tracking-widest gap-4 text-center">
          <div>&copy; {new Date().getFullYear()} TRUST MOBILE</div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 uppercase">
            <Link to="/contact" className="hover:text-white transition-colors">
              Help
            </Link>
            <a
              href="https://softora.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="normal-case tracking-wide hover:text-[#C5A059] transition-colors"
            >
              Powered by Softora
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
