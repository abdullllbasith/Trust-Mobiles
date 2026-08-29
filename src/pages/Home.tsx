import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FlashSaleTimer = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const distance = new Date(endDate).getTime() - new Date().getTime();
      if (distance < 0) {
        setTimeLeft("");
        return false;
      }
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(
        d > 0
          ? `${d}d ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
          : `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
      return true;
    };
    if (!tick()) return;
    const interval = setInterval(() => {
      if (!tick()) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;
  return <span>Ends in {timeLeft}</span>;
};

import {
  ArrowRight,
  Star,
  ShieldCheck,
  Zap,
  Smartphone,
  Headphones,
  Watch,
  BatteryCharging,
  Speaker,
  Shield,
  CheckCircle,
  Heart,
  Mail,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  BadgeCheck,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import Phone3D from "@/components/Phone3D";
import { ProductCard } from "@/components/ProductCard";
import { HappyCustomersCarousel } from "@/components/HappyCustomersCarousel";
import { WHATSAPP_NUMBER } from "@/constants";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const HOME_FAQS = [
  {
    q: "How does WhatsApp checkout work?",
    a: "Add items to your bag, fill in your details at checkout, then tap confirm. We open WhatsApp with your order summary so our team can confirm everything with you.",
  },
  {
    q: "Do I need an account to order?",
    a: "No. Trust Mobile is guest checkout only — no registration required.",
  },
  {
    q: "Are your products genuine?",
    a: "Yes. We sell authentic phones and accessories, and we confirm stock and condition with you on WhatsApp before you pay.",
  },
  {
    q: "How can I get help picking a device?",
    a: "Use the AI assistant on the site, or message us on WhatsApp — we’ll help you compare options from live stock.",
  },
];

const HOME_TESTIMONIALS = [
  {
    name: "Kavindi D.",
    role: "Tech Enthusiast",
    text: "WhatsApp confirmation made ordering so easy. Genuine Pixel, fair price, and the team replied within minutes.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  },
  {
    name: "Kasun P.",
    role: "Photographer",
    text: "Traded in my old iPhone seamlessly. Best prices and genuine products. I won't buy tech anywhere else now.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
  },
  {
    name: "Nethmi W.",
    role: "Designer",
    text: "Their support helped me pick the right device for work. Clear answers, no pressure — exactly what I wanted.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
  },
  {
    name: "Dilshan R.",
    role: "Student",
    text: "Asked the AI assistant a few questions, then confirmed on WhatsApp. Smooth from start to finish.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
  },
  {
    name: "Ishara M.",
    role: "Business Owner",
    text: "Clear LKR pricing and authentic stock. Ordering for my team was straightforward.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
  },
];

const TECH_NEWS_RSS =
  "https://www.wired.com/feed/category/gear/latest/rss";

const TECH_KEYWORDS = [
  "phone",
  "smartphone",
  "iphone",
  "android",
  "samsung",
  "apple",
  "google",
  "pixel",
  "laptop",
  "macbook",
  "tablet",
  "gadget",
  "gear",
  "tech",
  "ai",
  "software",
  "hardware",
  "review",
  "gaming",
  "wireless",
  "earbuds",
  "headphone",
  "camera",
  "watch",
  "keyboard",
  "monitor",
  "router",
  "wifi",
  "charger",
  "console",
  "computer",
  "device",
];

const EXCLUDE_KEYWORDS = [
  "health",
  "covid",
  "medicine",
  "fda",
  "romance",
  "scam",
  "quilt",
  "sleeping bag",
  "father's day",
  "backpacking",
];

function isTechArticle(item: { title?: string; categories?: string[]; description?: string }) {
  const haystack = [
    item.title ?? "",
    ...(item.categories ?? []),
    item.description ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (EXCLUDE_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return false;
  }

  return TECH_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function formatNewsCategory(categories?: string[]) {
  const primary = categories?.[0] ?? "Tech";
  const normalized = primary.toLowerCase();

  if (normalized.includes("review")) return "Review";
  if (normalized.includes("buying guide") || normalized.includes("how to")) return "Guide";
  if (normalized.includes("news") || normalized.includes("events")) return "News";
  if (normalized.includes("gear")) return "Tech";

  return "Tech";
}

const FALLBACK_TECH_NEWS = [
  {
    title: "Apple Event 2024: Everything announced in 5 minutes",
    category: "News",
    date: "Oct 24, 2024",
    img: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=600",
    link: "https://www.wired.com/category/gear/",
  },
  {
    title: "Samsung Galaxy S24 Ultra Camera Test: Is it the best?",
    category: "Review",
    date: "Oct 22, 2024",
    img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=600",
    link: "https://www.wired.com/category/gear/",
  },
  {
    title: "How to maximize your smartphone's battery life",
    category: "Guide",
    date: "Oct 18, 2024",
    img: "https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&q=80&w=600",
    link: "https://www.wired.com/category/gear/",
  },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { addItem } = useCartStore();
  const {
    addItem: addWishlist,
    isInWishlist,
    removeItem: removeWishlist,
  } = useWishlistStore();

  const carouselAds = useMemo(
    () => ads.filter((ad) => ad.position === "carousel"),
    [ads],
  );

  useEffect(() => {
    if (carouselAds.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselAds.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselAds.length]);

  useEffect(() => {
    if (carouselIndex >= carouselAds.length) setCarouselIndex(0);
  }, [carouselAds.length, carouselIndex]);

  useEffect(() => {
    fetch(`/api/products`)
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`/api/ads`)
      .then((res) => res.json())
      .then((data) => setAds(data.filter((ad: any) => ad.active)))
      .catch(console.error);

    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(TECH_NEWS_RSS)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          const articles = data.items
            .filter(isTechArticle)
            .slice(0, 3)
            .map((item: any) => {
             let imgUrl = item.thumbnail || item.enclosure?.thumbnail || item.enclosure?.link;
             if (!imgUrl && item.description) {
                const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imgUrl = imgMatch[1];
             }
             return {
               title: item.title,
               category: formatNewsCategory(item.categories),
               date: new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
               img: imgUrl || "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=600",
               link: item.link
             };
          });
          setNews(articles);
        }
      })
      .catch(console.error);
  }, []);

  const bestSellers = [...featuredProducts]
    .sort((a, b) => (b.discount || 0) - (a.discount || 0) || (b.stock || 0) - (a.stock || 0))
    .slice(0, 4);

  const newArrivals = [...featuredProducts]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 4);

  // If createdAt is missing, fall back to last items from API order
  const newArrivalsSafe =
    newArrivals.length > 0 && newArrivals.some((p) => p.createdAt)
      ? newArrivals
      : [...featuredProducts].slice(-4).reverse();

  const handleAddToCart = (e: any, product: any) => {
    e.preventDefault();
    if (product.status === "sold" || (product.stock ?? 1) <= 0) {
      toast.error("This product is sold");
      return;
    }
    addItem({
      ...product,
      images:
        typeof product.images === "string"
          ? JSON.parse(product.images)
          : product.images,
      specs:
        typeof product.specs === "string"
          ? JSON.parse(product.specs)
          : product.specs,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const toggleWishlist = (e: any, product: any) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeWishlist(product.id);
      toast.info(`Removed from wishlist`);
    } else {
      addWishlist({
        ...product,
        images:
          typeof product.images === "string"
            ? JSON.parse(product.images)
            : product.images,
        specs:
          typeof product.specs === "string"
            ? JSON.parse(product.specs)
            : product.specs,
      });
      toast.success(`Added to wishlist`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-color)]">
      {/* HERO SECTION */}
      <section className="relative w-full pt-[32px] pb-[90px] px-4 md:px-8 overflow-hidden flex justify-center">
        {/* Abstract animated blurred blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#C5A059]/10 blur-[120px] pointer-events-none mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#121212]/5 blur-[100px] pointer-events-none mix-blend-multiply opacity-50"></div>

        <div style={{ paddingTop: '43px', paddingBottom: '35px' }} className="max-w-[1400px] w-full relative z-10 glass-panel rounded-[2rem] md:rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center border border-white/60 px-8 md:px-12 lg:px-16 xl:px-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] bg-white/40 gap-8 xl:gap-12">
          <div className="z-10 w-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-start"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[56px] xl:text-[72px] font-display font-semibold leading-[1.05] text-[#1C1C1C] tracking-tight">
                Phones &amp; accessories
                <br />
                <span className="text-[#C5A059]">you can trust.</span>
              </h1>
              <p className="text-[#5C574F] mt-4 sm:mt-6 xl:mt-8 text-base sm:text-lg md:text-xl font-medium max-w-lg leading-relaxed mx-auto lg:mx-0">
                Genuine phones and accessories in LKR. Add to bag, then confirm your order with us on WhatsApp — no account needed.
              </p>
              <div className="mt-6 sm:mt-8 xl:mt-12 flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 w-full">
                <Link to="/shop">
                  <button className="bg-[#1C1C1C] text-white hover:bg-[#C5A059] hover:text-[#1C1C1C] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-[#C5A059]/40 hover:shadow-2xl flex gap-2 items-center group transform hover:-translate-y-1">
                    Shop now{" "}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <button className="bg-transparent border border-[#1C1C1C]/20 hover:border-[#C5A059] text-[#1C1C1C] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full font-semibold transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </button>
                </a>
              </div>
            </motion.div>
          </div>


          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex w-full aspect-square max-h-[600px] justify-center items-center relative"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute w-[80%] h-[95%] bg-gradient-to-tr from-[#121212] to-[#C5A059] rounded-[3rem] opacity-10 rotate-6 blur-2xl pointer-events-none"></div>
              <Phone3D />
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP — no delivery claims */}
      <section className="max-w-[1400px] mx-auto w-full px-4 md:px-8 -mt-10 mb-14 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: <BadgeCheck className="w-5 h-5" />, title: "Genuine products", desc: "Authentic devices only" },
            { icon: <MessageCircle className="w-5 h-5" />, title: "WhatsApp care", desc: "Real humans, fast replies" },
            { icon: <ShieldCheck className="w-5 h-5" />, title: "Warranty support", desc: "Covered after you buy" },
            { icon: <CheckCircle className="w-5 h-5" />, title: "Guest checkout", desc: "No account required" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-4 shadow-sm"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3EBD8] text-[#996515]">
                {item.icon}
              </div>
              <div>
                <div className="font-display font-semibold text-sm text-[#1C1C1C]">{item.title}</div>
                <div className="text-xs text-[#5C574F] font-medium mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROMO GRIDS & HIGHLIGHTS */}
      <section className="max-w-[1400px] mx-auto w-full px-4 md:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#121212] text-white rounded-[2rem] p-10 md:p-14 relative overflow-hidden group shadow-xl"
          >
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-medium mb-3 text-white">
                Our services
              </h3>
              <p className="text-white/60 mb-8 font-medium text-lg leading-relaxed max-w-sm">
                Warranty help, device setup, accessory fitting, and island-wide
                delivery — all backed by WhatsApp care.
              </p>
              <Link to="/services">
                <button className="text-[#121212] bg-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-all">
                  Explore services
                </button>
              </Link>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#C5A059]/30 rounded-full blur-[80px] group-hover:scale-125 group-hover:bg-[#C5A059]/40 transition-all duration-700"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#F3EBD8] to-[#ebe5d6] text-[#121212] rounded-[2rem] p-10 md:p-14 group shadow-md border border-white relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="bg-white/70 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white">
                  <MessageCircle className="w-7 h-7 text-[#C5A059]" />
                </div>
                <h3 className="text-3xl font-display font-medium">
                  WhatsApp checkout
                </h3>
                <p className="text-[#121212]/60 font-medium text-lg mt-3 max-w-sm">
                  Confirm stock, price, and payment with our team — simple and
                  personal, every order.
                </p>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-[#1C1C1C] hover:text-[#996515] transition-colors"
              >
                Message us now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="absolute top-0 right-0 w-[50%] h-full bg-white/40 skew-x-12 translate-x-32 group-hover:translate-x-full transition-transform duration-1000"></div>
          </motion.div>
        </div>
      </section>

      {/* ADS PROMOTIONS (Carousel) */}
      {carouselAds.length > 0 && (
        <section className="px-4 md:px-8 mb-12 flex justify-center">
          <div className="max-w-[1400px] w-full relative rounded-2xl overflow-hidden glass-panel">
            <div className="relative w-full h-[150px] md:h-[250px]">
              <AnimatePresence mode="wait" initial={false}>
                {(() => {
                  const ad = carouselAds[carouselIndex % carouselAds.length];
                  return (
                    <motion.a
                      key={`${ad._id || ad.id || ad.title}-${carouselIndex}`}
                      href={ad.link || "#"}
                      target={ad.link ? "_blank" : undefined}
                      rel={ad.link ? "noopener noreferrer" : undefined}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="absolute inset-0 block group"
                    >
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-4 left-6 text-white text-xl md:text-3xl font-display font-bold drop-shadow-md">
                        {ad.title}
                      </div>
                    </motion.a>
                  );
                })()}
              </AnimatePresence>
            </div>
            {carouselAds.length > 1 && (
              <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
                {carouselAds.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to ad ${idx + 1}`}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === carouselIndex % carouselAds.length
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TICKER / LOGOS */}
      <div className="w-full border-y border-black/5 bg-white overflow-hidden py-8 mb-20 flex">
        <div className="flex gap-20 items-center whitespace-nowrap opacity-40 grayscale font-display text-2xl font-bold tracking-widest text-[#111] animate-marquee">
          <div className="flex gap-20 items-center shrink-0">
            <span>APPLE</span>
            <span>SAMSUNG</span>
            <span>GOOGLE</span>
            <span>SONY</span>
            <span>XIAOMI</span>
            <span>NOTHING</span>
            <span>ONEPLUS</span>
            <span>MOTOROLA</span>
            <span>HUAWEI</span>
          </div>
          <div className="flex gap-20 items-center shrink-0">
            <span>APPLE</span>
            <span>SAMSUNG</span>
            <span>GOOGLE</span>
            <span>SONY</span>
            <span>XIAOMI</span>
            <span>NOTHING</span>
            <span>ONEPLUS</span>
            <span>MOTOROLA</span>
            <span>HUAWEI</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
        {/* QUICK CATEGORY GRID */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10 px-2 flex-col sm:flex-row gap-4 items-start sm:items-center">
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
              Curated Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Phones", icon: <Smartphone className="w-7 h-7" /> },
              { name: "Earbuds", icon: <Headphones className="w-7 h-7" /> },
              { name: "Watches", icon: <Watch className="w-7 h-7" /> },
              { name: "Power", icon: <BatteryCharging className="w-7 h-7" /> },
              { name: "Audio", icon: <Speaker className="w-7 h-7" /> },
              { name: "Gear", icon: <Zap className="w-7 h-7" /> },
            ].map((cat) => (
              <Link to={`/shop?category=${cat.name}`} key={cat.name}>
                <div className="glass-panel p-8 rounded-[2rem] flex flex-col items-center justify-center gap-5 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer relative overflow-hidden bg-white/40">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative z-10 text-[#121212] opacity-80 group-hover:opacity-100 group-hover:text-[#C5A059] transition-colors">
                    {cat.icon}
                  </div>
                  <span className="font-semibold text-sm text-[#111] text-center relative z-10">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BEST SELLERS */}
        <div className="mb-20">
          <div className="mb-8 px-2 flex flex-col items-center text-center gap-3 sm:flex-row sm:items-end sm:justify-between sm:text-left sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059] mb-2">
                Most popular
              </p>
              <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
                Best sellers
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                Devices shoppers pick again and again.
              </p>
            </div>
            <Link
              to="/shop"
              className="text-[#121212] font-semibold flex items-center gap-2 hover:text-[#C5A059] transition-colors whitespace-nowrap"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {(bestSellers.length > 0 ? bestSellers : [1, 2, 3, 4]).map((product: any, idx: number) => {
              if (typeof product === "number") {
                return (
                  <div key={product} className="bg-white rounded-2xl border border-black/[0.04] h-[320px] p-4">
                    <div className="w-full h-44 bg-gray-100 animate-pulse rounded-xl mb-4" />
                    <div className="h-3 bg-gray-100 animate-pulse w-1/3 mb-2 rounded" />
                    <div className="h-5 bg-gray-100 animate-pulse w-3/4 rounded" />
                  </div>
                );
              }
              const isWishlisted = isInWishlist(product.id);
              return (
                <motion.div
                  key={`best-${product.id}-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onAdd={handleAddToCart}
                    actions={
                      <div className="absolute top-3 right-3 z-20">
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(e, product)}
                          className="bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-red-500"
                          aria-label="Toggle wishlist"
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={isWishlisted ? "currentColor" : "none"}
                            color={isWishlisted ? "red" : "currentColor"}
                          />
                        </button>
                      </div>
                    }
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* NEW ARRIVALS */}
        <div className="mb-24">
          <div className="mb-8 px-2 flex flex-col items-center text-center gap-3 sm:flex-row sm:items-end sm:justify-between sm:text-left sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059] mb-2">
                Just landed
              </p>
              <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
                New arrivals
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                Fresh stock added to the store.
              </p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="text-[#121212] font-semibold flex items-center gap-2 hover:text-[#C5A059] transition-colors whitespace-nowrap"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {(newArrivalsSafe.length > 0 ? newArrivalsSafe : [1, 2, 3, 4]).map(
              (product: any, idx: number) => {
                if (typeof product === "number") {
                  return (
                    <div key={`new-skel-${product}`} className="bg-white rounded-2xl border border-black/[0.04] h-[320px] p-4">
                      <div className="w-full h-44 bg-gray-100 animate-pulse rounded-xl mb-4" />
                      <div className="h-3 bg-gray-100 animate-pulse w-1/3 mb-2 rounded" />
                      <div className="h-5 bg-gray-100 animate-pulse w-3/4 rounded" />
                    </div>
                  );
                }
                return (
                  <motion.div
                    key={`new-${product.id}-${idx}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      onAdd={handleAddToCart}
                      badge="new"
                    />
                  </motion.div>
                );
              },
            )}
          </div>
        </div>

        {/* PROMINENT BANNER ADS */}
        {ads.filter(ad => ad.position === 'banner').map((ad, idx) => (
          <div key={idx} className="mb-24">
            <a href={ad.link || "#"} target={ad.link ? "_blank" : undefined} className="block rounded-[3rem] relative overflow-hidden group shadow-md hover:shadow-xl transition-all h-[300px] md:h-[400px]">
               <img src={ad.image} alt={ad.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-10 md:p-14 text-white w-full">
                 <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4 drop-shadow-sm text-white">{ad.title}</h2>
                 {ad.link && <span className="inline-flex items-center gap-2 font-semibold border-b border-white/40 pb-1 hover:border-white transition-colors">Explore <ArrowRight className="w-4 h-4"/></span>}
               </div>
            </a>
          </div>
        ))}

        {/* DEALS OF THE DAY / FLASH SALE */}
        {ads.filter((ad) => ad.position === "flash_sale").map((ad, idx) => (
          <div key={idx} className="mb-24">
            <a
              href={ad.link || "#"}
              target={ad.link ? "_blank" : undefined}
              rel={ad.link ? "noopener noreferrer" : undefined}
              className="group relative block h-[340px] overflow-hidden rounded-[1.75rem] md:h-[400px]"
            >
              <img
                src={ad.image}
                alt={ad.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-105"
              />
              {/* Soft brand wash — readable without heavy dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#F8F6F1] via-[#F8F6F1]/92 to-[#F8F6F1]/15 md:via-[#F8F6F1]/85 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6F1]/80 via-transparent to-transparent md:hidden" />

              <div className="relative z-10 flex h-full max-w-xl flex-col justify-end p-7 sm:p-10 md:justify-center md:p-12 lg:p-14">
                <div className="mb-5 h-px w-12 bg-[#C5A059]" />

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#996515]">
                  Today&apos;s deal
                  {ad.endDate ? (
                    <>
                      <span className="mx-2 text-[#C5A059]/50">·</span>
                      <span className="tracking-normal text-[#5C574F] normal-case font-medium">
                        <FlashSaleTimer endDate={ad.endDate} />
                      </span>
                    </>
                  ) : null}
                </p>

                <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-[#1C1C1C] sm:text-4xl md:text-5xl whitespace-pre-line">
                  {ad.title}
                </h2>

                {ad.description ? (
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#5C574F] sm:text-base">
                    {ad.description}
                  </p>
                ) : null}

                <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#1C1C1C]">
                  <span className="border-b border-[#1C1C1C]/35 pb-0.5 transition-colors group-hover:border-[#C5A059]">
                    Shop this deal
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          </div>
        ))}

        {/* HOW WHATSAPP ORDERING WORKS */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059] mb-2">
              Simple as 1-2-3-4
            </p>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
              How ordering works
            </h2>
            <p className="text-gray-500 mt-3 font-medium max-w-xl mx-auto">
              From bag to confirmation on WhatsApp — clear steps, no surprises.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: "01",
                title: "Choose your product",
                desc: "Browse the store or ask our AI assistant for help.",
              },
              {
                step: "02",
                title: "Add to bag",
                desc: "Build your order — guest checkout, no account needed.",
              },
              {
                step: "03",
                title: "Confirm on WhatsApp",
                desc: "We open WhatsApp with your order summary for our team.",
              },
              {
                step: "04",
                title: "We finalize with you",
                desc: "Stock, price, and payment are confirmed personally.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm"
              >
                <div className="font-display text-3xl font-bold text-[#C5A059] mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-lg text-[#1C1C1C] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#5C574F] font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/shop">
              <button className="bg-[#1C1C1C] text-white hover:bg-[#C5A059] hover:text-[#1C1C1C] px-7 py-3 rounded-full text-sm font-semibold transition-all">
                Start shopping
              </button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <button className="border border-[#1C1C1C]/15 bg-white text-[#1C1C1C] hover:border-[#C5A059] px-7 py-3 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Order on WhatsApp
              </button>
            </a>
          </div>
        </section>

        <HappyCustomersCarousel />

        {/* FAQ */}
        <section className="mb-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059] mb-2">
                FAQ
              </p>
              <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
                Frequently asked questions
              </h2>
              <p className="text-gray-500 mt-3 font-medium">
                Still wondering?{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#996515] font-semibold hover:underline"
                >
                  Reach us on WhatsApp
                </a>
                .
              </p>
            </div>
            <div className="space-y-3">
              {HOME_FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-display font-semibold text-[#1C1C1C] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#C5A059] shrink-0" />
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#5C574F] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <div className="px-5 pb-5 text-sm text-[#5C574F] font-medium leading-relaxed border-t border-black/[0.04] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CUSTOMER TESTIMONIALS */}
        <section className="mb-24 px-0">
          <div className="flex flex-col items-center text-center mb-12 px-4 md:px-0">
            <h2 className="text-3xl lg:text-5xl font-display font-semibold text-[#111] tracking-tight">
              Loved by customers
            </h2>
            <p className="text-gray-500 mt-4 text-lg font-medium max-w-2xl">
              See why people trust us for phones and accessories.
            </p>
          </div>

          <div className="testimonials-marquee relative overflow-hidden">
            <div className="testimonials-marquee-track flex w-max gap-6 py-2">
              {[...HOME_TESTIMONIALS, ...HOME_TESTIMONIALS].map((review, i) => (
                  <div
                    key={`${review.name}-${i}`}
                    className="glass-panel w-[min(85vw,360px)] shrink-0 p-8 rounded-[2rem] bg-white/80 shadow-sm border border-black/5"
                  >
                    <div className="flex gap-1 mb-6 text-[#121212]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-[#111] font-medium text-lg leading-relaxed mb-8">
                      "{review.text}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <img
                        src={review.img}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <h4 className="font-display font-bold text-[#111]">
                          {review.name}
                        </h4>
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                          {review.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* LATEST TECH NEWS */}
        <section className="mb-24 px-4 md:px-0">
          <div className="flex items-end justify-between mb-10 flex-col sm:flex-row gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
                Tech Insights
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                Latest news, reviews, and guides from the tech world.
              </p>
            </div>
            <a href="https://www.wired.com/category/gear/" target="_blank" rel="noopener noreferrer" className="text-[#121212] font-semibold flex items-center gap-2 hover:text-[#C5A059] transition-colors whitespace-nowrap">
              Read All Articles <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(news.length > 0 ? news : FALLBACK_TECH_NEWS).map((post, i) => (
              <a href={post.link || "#"} target="_blank" rel="noopener noreferrer" key={i} className="group rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#111] tracking-widest uppercase">
                    {post.category}
                  </div>
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <span className="text-sm text-gray-400 font-medium mb-3">{post.date}</span>
                  <h3 className="font-display font-semibold text-xl text-[#111] leading-snug mb-4 group-hover:text-[#C5A059] transition-colors">{post.title}</h3>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-[#121212]">
                    Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="mb-24">
          <div className="bg-[#121212] rounded-[3rem] p-10 md:p-20 relative overflow-hidden flex justify-center text-center">
            <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-[#C5A059] rounded-full mix-blend-screen filter blur-[200px] opacity-20 pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-white mb-6">
                Join the Community
              </h2>
              <p className="text-white/60 text-lg md:text-xl font-medium mb-10">
                Subscribe to get exclusive early access to major flagship drops, unmissable flash sales, and top tech news.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 bg-white/5 border border-white/10 text-white rounded-full px-6 py-4 focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-white/30"
                  required
                />
                <button type="submit" className="bg-[#C5A059] text-white font-semibold rounded-full px-8 py-4 hover:bg-white hover:text-[#1C1C1C] transition-colors shadow-[0_0_20px_rgba(46,117,182,0.35)] hover:shadow-white/20 whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="py-10 border-t border-black/5 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 text-center">
            {[
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: "WhatsApp care",
                desc: "Confirm every order with us",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Full Warranty",
                desc: "Support after you buy",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Fair prices",
                desc: "Clear LKR pricing",
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Authentic",
                desc: "100% genuine products",
              },
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="bg-[#f0f0f0] text-[#121212] p-4 rounded-full mb-5 group-hover:bg-[#C5A059] group-hover:text-[#1C1C1C] transition-colors duration-300">
                  {feat.icon}
                </div>
                <h3 className="font-display font-medium text-[#111] text-lg mb-2">
                  {feat.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
