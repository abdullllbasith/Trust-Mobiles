import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Star,
  Check,
  ShoppingBag,
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  BadgeCheck,
  X,
} from "lucide-react";
import { useCartStore, Product } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeImages } from "@/lib/productImages";
import {
  getRecentlyViewed,
  trackRecentlyViewed,
  type RecentProduct,
} from "@/lib/recentlyViewed";
import { WHATSAPP_NUMBER } from "@/constants";
import { ProductCard } from "@/components/ProductCard";

type RecProduct = Product & { id: string };

function formatLkr(amount: number) {
  return `LKR ${Math.round(amount).toLocaleString("en-US")}`;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"description" | "specs">("description");
  const [fullscreen, setFullscreen] = useState(false);
  const [recent, setRecent] = useState<RecentProduct[]>([]);
  const [aiRecs, setAiRecs] = useState<RecProduct[]>([]);
  const [aiReason, setAiReason] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Hover zoom — desktop only (fine pointer + real hover)
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [hoverZoomEnabled, setHoverZoomEnabled] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartStore();
  const {
    addItem: addWishlist,
    isInWishlist,
    removeItem: removeWishlist,
  } = useWishlistStore();

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setHoverZoomEnabled(mq.matches);
      if (!mq.matches) setZooming(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQuantity(1);
    setActiveImage(0);
    setAiRecs([]);
    setAiReason("");

    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        trackRecentlyViewed(data);
        setRecent(getRecentlyViewed(String(data.id)));
      })
      .catch(() => {
        toast.error("Product not found");
        navigate("/shop");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!id || !product) return;
    let cancelled = false;
    setAiLoading(true);

    fetch(`/api/products/${id}/recommendations`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAiRecs(Array.isArray(data.products) ? data.products : []);
        setAiReason(data.reason || "");
      })
      .catch(() => {
        if (!cancelled) {
          setAiRecs([]);
          setAiReason("");
        }
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, product?.id]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverZoomEnabled) return;
    const el = imageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }, [hoverZoomEnabled]);

  const handleMouseEnter = useCallback(() => {
    if (hoverZoomEnabled) setZooming(true);
  }, [hoverZoomEnabled]);

  const handleMouseLeave = useCallback(() => {
    setZooming(false);
  }, []);

  const handleAddToCart = (qty = quantity) => {
    if (!product || product.status === "sold" || product.stock <= 0) return;
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(
      qty > 1
        ? `${qty}× ${product.name} added to cart`
        : `${product.name} added to cart`,
    );
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeWishlist(product.id);
      toast.info("Removed from wishlist");
    } else {
      addWishlist({
        ...product,
        images: normalizeImages(product.images),
        specs:
          typeof product.specs === "string"
            ? JSON.parse(product.specs)
            : product.specs,
      });
      toast.success("Added to wishlist");
    }
  };

  const openWhatsApp = () => {
    if (!product) return;
    const price = product.price * (1 - product.discount / 100);
    const text = encodeURIComponent(
      [
        `Hi Trust Mobile, I'd like to order:`,
        ``,
        `Product: ${product.name}`,
        `Brand: ${product.brand}`,
        `Price: ${formatLkr(price)}`,
        `Qty: ${quantity}`,
        `Link: ${window.location.href}`,
      ].join("\n"),
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[var(--bg-color)] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-1/2 aspect-square bg-stone-200 rounded-2xl" />
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="h-4 bg-stone-200 w-24 rounded" />
              <div className="h-10 bg-stone-200 w-3/4 rounded-lg" />
              <div className="h-8 bg-stone-200 w-1/3 rounded" />
              <div className="h-32 bg-stone-200 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = normalizeImages(product.images);
  const specs =
    typeof product.specs === "string"
      ? JSON.parse(product.specs)
      : product.specs || {};
  const price = product.price * (1 - product.discount / 100);
  const savings = product.price - price;
  const isWishlisted = isInWishlist(product.id);
  const hasMultipleImages = images.length > 1;
  const mainImage = images[activeImage] || images[0];
  const isSold = product.status === "sold";
  const canPurchase = !isSold && product.stock > 0;

  return (
    <div className="flex-1 bg-[var(--bg-color)] min-h-screen pb-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[#5C574F]">
          <Link to="/" className="hover:text-[#1C1C1C] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1C1C1C] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#1C1C1C] font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5C574F] hover:text-[#1C1C1C] transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </span>
          Back
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 rounded-2xl border border-black/[0.04] bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
          {/* Gallery + zoom */}
          <div className="flex flex-col gap-4">
            <div
              ref={imageRef}
              className={`relative aspect-square overflow-hidden rounded-2xl bg-[#F8F6F1] ${hoverZoomEnabled ? "cursor-zoom-in" : "cursor-pointer"}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setZooming(false)}
              onClick={() => setFullscreen(true)}
            >
              {product.discount > 0 && !isSold && (
                <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#1C1C1C] px-3 py-1.5 text-xs font-semibold text-white">
                    -{product.discount}% OFF
                  </span>
                  <span className="rounded-full bg-[#C5A059] px-3 py-1.5 text-xs font-semibold text-[#1C1C1C]">
                    Offer
                  </span>
                </div>
              )}

              {isSold && (
                <span className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  <span className="rotate-[-18deg] rounded-md bg-red-600 px-8 py-2.5 text-2xl font-black uppercase tracking-[0.25em] text-white shadow-xl md:text-3xl">
                    Sold
                  </span>
                </span>
              )}

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((p) =>
                        p === 0 ? images.length - 1 : p - 1,
                      );
                    }}
                    className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((p) =>
                        p === images.length - 1 ? 0 : p + 1,
                      );
                    }}
                    className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <img
                src={mainImage}
                alt={product.name}
                className={`h-full w-full object-contain p-4 transition-opacity duration-200 ${
                  isSold ? "brightness-75 grayscale-[0.35]" : ""
                }`}
                style={{
                  opacity: zooming ? 0 : 1,
                }}
              />

              {/* Zoomed layer follows cursor */}
              <div
                className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${zooming ? "opacity-100" : "opacity-0"}`}
                style={{
                  backgroundImage: `url(${mainImage})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "200%",
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />

              {hoverZoomEnabled && (
                <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white">
                  Hover to zoom · Click for fullscreen
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F8F6F1] transition-all ${
                      activeImage === idx
                        ? "border-[#1C1C1C] ring-2 ring-[#C5A059]/30"
                        : "border-transparent hover:border-black/10"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5C574F]">
                <Link
                  to={`/shop?brand=${encodeURIComponent(product.brand)}`}
                  className="rounded-full bg-[#F3EBD8] px-3 py-1 text-[#996515] hover:bg-[#C5A059]/30 transition-colors"
                >
                  {product.brand}
                </Link>
                <span>·</span>
                <Link
                  to={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-[#1C1C1C] transition-colors"
                >
                  {product.category}
                </Link>
              </div>
              <button
                type="button"
                onClick={toggleWishlist}
                className={`rounded-full p-2.5 transition-colors ${
                  isWishlisted
                    ? "bg-red-50 text-red-500"
                    : "bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-[#1C1C1C]"
                }`}
                aria-label="Wishlist"
              >
                <Heart
                  className="h-5 w-5"
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-[#1C1C1C] md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex text-[#C5A059]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= 4 ? "fill-current" : "text-stone-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#5C574F]">Trusted by shoppers</span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="font-display text-3xl font-bold text-[#1C1C1C]">
                {formatLkr(price)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-stone-400 line-through">
                    {formatLkr(product.price)}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Save {formatLkr(savings)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-[#5C574F]">Prices in LKR</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {isSold ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                  Sold
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    product.stock > 0
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {product.stock > 0 ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> In stock
                      {product.stock > 5
                        ? " — ready to order"
                        : ` · ${product.stock} left`}
                    </>
                  ) : (
                    "Out of stock"
                  )}
                </span>
              )}
            </div>

            {/* Trust chips — no delivery */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { icon: <BadgeCheck className="h-4 w-4" />, label: "100% Genuine" },
                { icon: <ShieldCheck className="h-4 w-4" />, label: "Warranty support" },
                { icon: <MessageCircle className="h-4 w-4" />, label: "WhatsApp care" },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-center gap-2 rounded-xl border border-black/[0.05] bg-[#F8F6F1] px-3 py-2.5 text-xs font-semibold text-[#1C1C1C]"
                >
                  <span className="text-[#C5A059]">{chip.icon}</span>
                  {chip.label}
                </div>
              ))}
            </div>

            {/* Qty + actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-black/10 bg-white">
                <button
                  type="button"
                  className="px-3 py-3 text-lg font-semibold text-[#1C1C1C] disabled:opacity-40"
                  disabled={!canPurchase || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="min-w-[2.5rem] text-center font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="px-3 py-3 text-lg font-semibold text-[#1C1C1C] disabled:opacity-40"
                  disabled={!canPurchase || quantity >= Math.max(1, product.stock)}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(Math.max(1, product.stock), q + 1),
                    )
                  }
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={!canPurchase}
                onClick={() => handleAddToCart()}
                className="btn-primary flex-1 min-w-[140px] rounded-xl disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />{" "}
                {isSold ? "Sold out" : "Add to cart"}
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                disabled={!canPurchase}
                onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}
                className="w-full rounded-xl bg-[#C5A059] px-5 py-3 text-sm font-semibold text-[#1C1C1C] transition-colors hover:bg-[#D4AF37] disabled:opacity-50"
              >
                {isSold ? "Sold out" : "Buy now"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-[#C5A059]/25 bg-[#F3EBD8]/50 p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#996515]" />
                <div>
                  <h4 className="font-display font-semibold text-[#1C1C1C]">
                    Need help choosing?
                  </h4>
                  <p className="mt-1 text-sm text-[#5C574F]">
                    Not sure if this fits your needs? Chat with our team on
                    WhatsApp — we’ll help you decide.
                  </p>
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="mt-3 text-sm font-semibold text-[#996515] hover:underline"
                  >
                    Chat with an expert →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: description / specs */}
        <div className="mt-10 rounded-2xl border border-black/[0.04] bg-white p-5 md:p-8 shadow-sm">
          <div className="mb-6 flex gap-2 border-b border-black/5 pb-3">
            {(
              [
                ["description", "Description"],
                ["specs", "Specifications"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === key
                    ? "bg-[#1C1C1C] text-white"
                    : "text-[#5C574F] hover:bg-stone-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "description" ? (
            <div className="prose-sm max-w-none space-y-4 text-[#5C574F]">
              <p className="text-base leading-relaxed whitespace-pre-line">
                {product.description?.trim() ? (
                  product.description
                ) : (
                  <>
                    The <strong className="text-[#1C1C1C]">{product.name}</strong> from{" "}
                    {product.brand} is available at Trust Mobile — The Phone Store.
                    Confirm stock and complete your order with us on WhatsApp for a
                    simple, personal checkout.
                  </>
                )}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {(
                  Array.isArray(product.highlights) && product.highlights.length > 0
                    ? product.highlights
                    : [
                        "100% authentic product",
                        "Clear LKR pricing",
                        "WhatsApp order confirmation",
                        "Warranty support after purchase",
                        "Guest checkout — no account needed",
                        "Help choosing via AI assistant or WhatsApp",
                      ]
                ).map((line: string) => (
                  <li key={line} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              {specs && Object.keys(specs).length > 0 ? (
                <div className="divide-y divide-black/5">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-2 gap-4 py-3.5 md:grid-cols-3"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="col-span-1 md:col-span-2 font-medium text-[#1C1C1C]">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5C574F]">
                  Specs will appear here when available for this product.
                </p>
              )}
            </div>
          )}
        </div>

        {/* You may also like */}
        <section className="mt-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#C5A059]">
                Recommended
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#1C1C1C] md:text-3xl">
                You may also like
              </h2>
              {aiReason && (
                <p className="mt-2 max-w-2xl text-sm text-[#5C574F]">
                  {aiReason}
                </p>
              )}
            </div>
          </div>

          {aiLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-[340px] animate-pulse rounded-2xl bg-white border border-black/[0.04]"
                />
              ))}
            </div>
          ) : aiRecs.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {aiRecs.map((rec) => (
                <ProductCard
                  key={String(rec.id)}
                  product={rec}
                  onAdd={() => {
                    addItem(rec as Product);
                    toast.success(`${rec.name} added to cart`);
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#5C574F]">
              More recommendations will appear as inventory grows.
            </p>
          )}
        </section>

        {/* Recently viewed */}
        {recent.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-semibold text-[#1C1C1C] md:text-3xl">
              Recently viewed
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {recent.slice(0, 4).map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onAdd={() => {
                    addItem({
                      id: item.id as any,
                      name: item.name,
                      brand: item.brand,
                      category: item.category,
                      price: item.price,
                      discount: item.discount,
                      stock: 1,
                      images: [item.image],
                      specs: {},
                      createdAt: "",
                    });
                    toast.success(`${item.name} added to cart`);
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setFullscreen(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={mainImage}
              alt={product.name}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
