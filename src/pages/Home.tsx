import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FlashSaleTimer = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endDate) return;
    const interval = setInterval(() => {
      const distance = new Date(endDate).getTime() - new Date().getTime();
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("EXPIRED");
      } else {
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

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
  Truck,
  Clock,
  Shield,
  CheckCircle,
  Heart,
  Eye,
  ShoppingBag,
  Sparkles,
  Mail,
  Quote
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import Phone3D from "@/components/Phone3D";

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
  const { addItem } = useCartStore();
  const {
    addItem: addWishlist,
    isInWishlist,
    removeItem: removeWishlist,
  } = useWishlistStore();

  useEffect(() => {
    fetch(`/api/products`)
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data))
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

  const handleAddToCart = (e: any, product: any) => {
    e.preventDefault();
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
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#2FA84F]/10 blur-[120px] pointer-events-none mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#121212]/5 blur-[100px] pointer-events-none mix-blend-multiply opacity-50"></div>

        <div style={{ paddingTop: '43px', paddingBottom: '35px' }} className="max-w-[1400px] w-full relative z-10 glass-panel rounded-[2rem] md:rounded-[3rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center border border-white/60 px-8 md:px-12 lg:px-16 xl:px-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] bg-white/40 gap-8 xl:gap-12">
          <div className="z-10 w-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-start"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-6 w-full">
                <span className="bg-[#121212] text-white text-[10px] sm:text-xs font-semibold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" /> Premium Reseller
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[60px] xl:text-[90px] font-display font-medium leading-[1.05] text-[#111] tracking-tighter">
                Your Next{" "}
                <span className="text-[#2FA84F] font-bold">Device</span>
                <br />
                Awaits.
              </h1>
              <p className="text-gray-500 mt-4 sm:mt-6 xl:mt-8 text-base sm:text-lg md:text-xl font-medium max-w-lg leading-relaxed mx-auto lg:mx-0">
                The latest flagships from Apple, Samsung, Google, and more.
                Unlocked, authentic, and ready for you.
              </p>
              <div className="mt-6 sm:mt-8 xl:mt-12 flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 w-full">
                <Link to="/product/1">
                  <button className="bg-[#121212] hover:bg-[#2FA84F] text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-[#2FA84F]/40 hover:shadow-2xl flex gap-2 items-center group transform hover:-translate-y-1">
                    Pre-Order Now{" "}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/shop">
                  <button className="bg-transparent border border-gray-300 hover:border-[#121212] text-[#121212] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full font-semibold transition-colors">
                    Explore Store
                  </button>
                </Link>
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
              <div className="absolute w-[80%] h-[95%] bg-gradient-to-tr from-[#121212] to-[#2FA84F] rounded-[3rem] opacity-10 rotate-6 blur-2xl pointer-events-none"></div>
              <Phone3D />
            </div>
          </motion.div>
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
                Upgrade Program
              </h3>
              <p className="text-white/60 mb-8 font-medium text-lg leading-relaxed max-w-sm">
                Trade in your old device and get up to LKR 500 towards the
                latest flagship smartphones.
              </p>
              <button className="text-[#121212] bg-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#2FA84F] hover:text-white transition-all">
                Value Your Device
              </button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#2FA84F]/30 rounded-full blur-[80px] group-hover:scale-125 group-hover:bg-[#2FA84F]/40 transition-all duration-700"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#ebeceb] to-[#dfe1e0] text-[#121212] rounded-[2rem] p-10 md:p-14 group shadow-md border border-white relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="bg-white/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white">
                  <Truck className="w-7 h-7 text-[#2FA84F]" />
                </div>
                <h3 className="text-3xl font-display font-medium">
                  Free Global Delivery
                </h3>
                <p className="text-[#121212]/60 font-medium text-lg mt-3 max-w-sm">
                  On all premium orders above LKR 199. Experience hyper-fast
                  shipping.
                </p>
              </div>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl lg:text-5xl font-display font-bold">
                  Express
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[50%] h-full bg-white/40 skew-x-12 translate-x-32 group-hover:translate-x-full transition-transform duration-1000"></div>
          </motion.div>
        </div>
      </section>

      {/* ADS PROMOTIONS (Carousel) */}
      {ads.filter(ad => ad.position === 'carousel').length > 0 && (
        <section className="px-4 md:px-8 mb-12 flex justify-center">
          <div className="max-w-[1400px] w-full relative rounded-2xl overflow-hidden glass-panel">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              {ads.filter(ad => ad.position === 'carousel').map((ad, idx) => (
                <a
                  key={idx}
                  href={ad.link || "#"}
                  target={ad.link ? "_blank" : undefined}
                  className="min-w-full snap-start relative group block"
                >
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-[150px] md:h-[250px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-6 text-white text-xl md:text-3xl font-display font-bold drop-shadow-md">
                    {ad.title}
                  </div>
                </a>
              ))}
            </div>
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
                  <div className="relative z-10 text-[#121212] opacity-80 group-hover:opacity-100 group-hover:text-[#2FA84F] transition-colors">
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

        {/* TRENDING PRODUCTS (Horizontal Scroll) */}
        <div className="mb-24 relative">
          <div className="flex items-end justify-between mb-10 px-2 flex-col sm:flex-row gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
                Trending Now
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                The most sought-after devices this week.
              </p>
            </div>
            <Link
              to="/shop"
              className="text-[#121212] font-semibold flex items-center gap-2 hover:text-[#2FA84F] transition-colors whitespace-nowrap"
            >
              View Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory pt-2 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {featuredProducts.length > 0
              ? featuredProducts.map((product, idx) => {
                  const images =
                    typeof product.images === "string"
                      ? JSON.parse(product.images)
                      : product.images;
                  const isWishlisted = isInWishlist(product.id);

                  return (
                    <motion.div
                      key={`${product.id}-${idx}`}
                      className="min-w-[220px] md:min-w-[320px] w-[220px] md:w-[320px] snap-start"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5, delay: (idx % 4) * 0.1 }}
                    >
                      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-black/[0.03] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-black/5 transition-all duration-300 h-[360px] md:h-[460px] flex flex-col group relative overflow-hidden">
                        {/* Action Icons */}
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col gap-2 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity lg:translate-x-2 lg:group-hover:translate-x-0">
                          <button
                            onClick={(e) => toggleWishlist(e, product)}
                            className="bg-white/90 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-lg hover:bg-white text-gray-600 hover:text-red-500 transition-all"
                          >
                            <Heart
                              className="w-4 h-4 md:w-4 md:h-4"
                              fill={isWishlisted ? "currentColor" : "none"}
                              color={isWishlisted ? "red" : "currentColor"}
                            />
                          </button>
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-white/90 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-lg hover:bg-white text-gray-600 hover:text-[#121212] transition-all hidden md:block"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>

                        {/* Discount Tag */}
                        {product.discount > 0 && (
                          <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-[#111] text-white text-[10px] md:text-xs font-semibold tracking-wider px-2 py-1 md:px-3 md:py-1.5 rounded-full z-20 shadow-sm border border-white/10">
                            {product.discount}% OFF
                          </span>
                        )}

                        <Link
                          to={`/product/${product.id}`}
                          className="flex-1 flex flex-col h-full"
                        >
                          {/* Edge-to-edge Image Container */}
                          <div className="w-full h-44 md:h-64 bg-[#F5F7F6] relative overflow-hidden group-hover:bg-[#F0F2F1] transition-colors">
                            <img
                              src={images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
                            />
                          </div>

                          {/* Content Area */}
                          <div className="p-4 md:p-6 flex-1 flex flex-col">
                            <div className="text-[9px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                              {product.brand}
                            </div>
                            <h4 className="font-display font-semibold text-sm md:text-lg mt-0.5 md:mt-1 line-clamp-1 text-[#111]">
                              {product.name}
                            </h4>

                            <div className="flex items-center gap-0.5 md:gap-1 mt-1 md:mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-[#121212] text-[#121212]"
                                />
                              ))}
                            </div>

                            <div className="flex items-end justify-between mt-auto pt-4 md:pt-5 border-t border-black/5">
                              <div>
                                <div className="text-[#121212] text-base md:text-xl font-display font-bold">
                                  LKR{" "}
                                  {(
                                    product.price *
                                    (1 - product.discount / 100)
                                  ).toFixed(2)}
                                </div>
                                {product.discount > 0 && (
                                  <div className="text-[10px] md:text-xs text-gray-400 font-medium line-through">
                                    LKR {product.price}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => handleAddToCart(e, product)}
                                className="bg-[#111] text-white p-2.5 md:p-3.5 rounded-full hover:bg-[#2FA84F] hover:-translate-y-1 transition-all shadow-md"
                              >
                                <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              : [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="min-w-[300px] bg-white p-5 rounded-[2rem] border border-transparent h-[420px] flex flex-col"
                  >
                    <div className="w-full h-52 bg-gray-100 animate-pulse rounded-2xl mb-5"></div>
                    <div className="h-3 bg-gray-100 animate-pulse w-1/3 mb-3 rounded"></div>
                    <div className="h-6 bg-gray-100 animate-pulse w-3/4 mb-auto rounded"></div>
                    <div className="h-12 bg-gray-100 animate-pulse w-full mt-4 rounded-xl"></div>
                  </div>
                ))}
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
        {ads.filter(ad => ad.position === 'flash_sale').map((ad, idx) => (
          <div key={idx} className="mb-24">
            <div className="bg-[#121212] rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 shadow-2xl">
              <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#2FA84F] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

              <div className="flex-1 z-10 w-full text-center lg:text-left">
                <span className="bg-red-500 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full inline-block mb-6 shadow-sm border border-red-400/50">
                  Flash Sale • {ad.endDate ? <FlashSaleTimer endDate={ad.endDate} /> : "Limited Time"}
                </span>
                <h2 className="text-4xl md:text-6xl font-display font-medium mb-6 leading-[1.1] whitespace-pre-line text-[#2FA84F]">
                  {ad.title}
                </h2>
                {ad.description && (
                  <p className="text-white/60 font-medium text-lg lg:text-xl max-w-md mb-10 leading-relaxed mx-auto lg:mx-0">
                    {ad.description}
                  </p>
                )}

                <a href={ad.link || "#"} target={ad.link ? "_blank" : undefined} className="inline-block mt-2 bg-white text-[#121212] px-8 py-4 rounded-full font-semibold hover:bg-[#2FA84F] hover:text-white transform hover:scale-105 transition-all outline-none">
                  Claim Deal Now
                </a>
              </div>

              <div className="w-full lg:w-1/2 relative z-10 flex justify-center mt-10 lg:mt-0">
                <div className="w-72 h-72 md:w-96 md:h-96 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)] relative pointer-events-none">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-[85%] h-[85%] object-cover rounded-full mix-blend-screen shadow-2xl hover:scale-110 transition-transform duration-1000"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* CUSTOMER TESTIMONIALS */}
        <section className="mb-24 px-4 md:px-0">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-display font-semibold text-[#111] tracking-tight">
              Loved by Thousands
            </h2>
            <p className="text-gray-500 mt-4 text-lg font-medium max-w-2xl">
              See why our customers trust us for their premium tech upgrades.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Kavindi D.", role: "Tech Enthusiast", text: "The fastest delivery for my new Pixel 8 Pro. Highly recommended! The unboxing experience was just flawless.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
              { name: "Kasun P.", role: "Photographer", text: "Traded in my old iPhone seamlessly. Best prices and genuine products. I won't buy tech anywhere else now.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
              { name: "Nethmi W.", role: "Designer", text: "Their customer support is unmatched. Helped me pick the perfect MacBook for my design workflow.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" }
            ].map((review, i) => (
              <div key={i} className="glass-panel p-8 rounded-[2rem] bg-white/60 hover:bg-white transition-colors duration-300 shadow-sm border border-black/5 hover:shadow-xl group">
                <div className="flex gap-1 mb-6 text-[#121212]">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-[#111] font-medium text-lg leading-relaxed mb-8">"{review.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h4 className="font-display font-bold text-[#111]">{review.name}</h4>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
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
            <a href="https://www.wired.com/category/gear/" target="_blank" rel="noopener noreferrer" className="text-[#121212] font-semibold flex items-center gap-2 hover:text-[#2FA84F] transition-colors whitespace-nowrap">
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
                  <h3 className="font-display font-semibold text-xl text-[#111] leading-snug mb-4 group-hover:text-[#2FA84F] transition-colors">{post.title}</h3>
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
            <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-[#2FA84F] rounded-full mix-blend-screen filter blur-[200px] opacity-20 pointer-events-none"></div>
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
                  className="flex-1 bg-white/5 border border-white/10 text-white rounded-full px-6 py-4 focus:outline-none focus:border-[#2FA84F] transition-colors placeholder:text-white/30"
                  required
                />
                <button type="submit" className="bg-[#2FA84F] text-white font-semibold rounded-full px-8 py-4 hover:bg-white hover:text-[#121212] transition-colors shadow-[0_0_20px_rgba(47,168,79,0.3)] hover:shadow-white/20 whitespace-nowrap">
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
                icon: <Truck className="w-6 h-6" />,
                title: "Swift Dispatch",
                desc: "Same day fast shipping",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Full Warranty",
                desc: "1-year official guarantee",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Price Match",
                desc: "Best prices promised",
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Authentic",
                desc: "100% genuine products",
              },
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="bg-[#f0f0f0] text-[#121212] p-4 rounded-full mb-5 group-hover:bg-[#2FA84F] group-hover:text-white transition-colors duration-300">
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
