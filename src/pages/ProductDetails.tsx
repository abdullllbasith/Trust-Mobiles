import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  ShoppingBag,
  Heart,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCartStore, Product } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { normalizeImages } from "@/lib/productImages";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCartStore();
  const {
    addItem: addWishlist,
    isInWishlist,
    removeItem: removeWishlist,
  } = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setActiveImage(0);
        return fetch(`/api/products?category=${data.category}`);
      })
      .then((res) => res.json())
      .then((relatedData) => {
        setRelatedProducts(relatedData.filter((p: Product) => String(p.id) !== String(id)).slice(0, 4));
      })
      .catch(() => {
        toast.error("Product not found");
        navigate("/shop");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    }
  };

  const toggleWishlist = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeWishlist(product.id);
        toast.info(`Removed from wishlist`);
      } else {
        addWishlist({
          ...product,
          images: normalizeImages(product.images),
          specs:
            typeof product.specs === "string"
              ? JSON.parse(product.specs)
              : product.specs,
        });
        toast.success(`Added to wishlist`);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-xl"></div>
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-4 bg-gray-100 w-24 rounded"></div>
            <div className="h-12 bg-gray-100 w-3/4 rounded-lg"></div>
            <div className="h-8 bg-gray-100 w-1/4 rounded"></div>
            <div className="h-32 bg-gray-100 w-full rounded-xl"></div>
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
      : product.specs;
  const price = product.price * (1 - product.discount / 100);
  const isWishlisted = isInWishlist(product.id);
  const hasMultipleImages = images.length > 1;

  const showPrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex-1 bg-[var(--bg-color)] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm md:text-base font-semibold text-gray-500 hover:text-[#111] transition-colors mb-4 md:mb-6 w-fit group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center shadow-sm group-hover:bg-[#111] group-hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 bg-white rounded-xl lg:rounded-xl shadow-sm border border-black/[0.03] p-4 sm:p-6 lg:p-10 overflow-hidden relative">
          {/* Images Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 lg:gap-6 relative z-10">
            <div className="aspect-square bg-[#F7FAFC] rounded-xl lg:rounded-xl relative overflow-hidden group">
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-20 bg-[#111] text-white text-[10px] lg:text-xs font-semibold tracking-wider px-3 lg:px-4 py-1.5 lg:py-2 rounded-full shadow-sm border border-white/10">
                  {product.discount}% OFF
                </div>
              )}
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={showPrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-lg flex items-center justify-center text-[#111] hover:bg-white transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-lg flex items-center justify-center text-[#111] hover:bg-white transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              )}
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={images[activeImage] || images[0]}
                alt={`${product.name} - image ${activeImage + 1}`}
                className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            {images.length > 0 && (
              <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 lg:pb-4 hide-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl border-2 flex-shrink-0 bg-[#F7FAFC] flex items-center justify-center overflow-hidden transition-all ${activeImage === idx ? "border-[#111] shadow-md ring-4 ring-[#111]/10" : "border-transparent hover:border-black/10"}`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-contain p-2 lg:p-4 mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col relative z-10">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                {product.brand}
              </div>
              <button
                onClick={toggleWishlist}
                className={`p-2.5 md:p-3 rounded-full transition-colors ${isWishlisted ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900"}`}
              >
                <Heart
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            <h1 className="text-2xl md:text-[1.75rem] lg:text-6xl font-display font-semibold tracking-tight text-[#111] mb-3 md:mb-5 leading-[1.1]">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
              <div className="flex items-center text-[#111]">
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-current text-gray-200" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-500 hover:text-[#111] underline cursor-pointer transition-colors">
                124 Reviews
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 md:gap-2 mb-6 md:mb-10">
              <span className="text-2xl md:text-3xl font-display font-semibold text-[#111]">
                LKR {Math.round(price).toLocaleString("en-US")}
              </span>
              {product.discount > 0 && (
                <span className="text-base font-medium text-gray-400 line-through">
                  LKR {Math.round(product.price).toLocaleString("en-US")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-10 text-xs md:text-sm flex-wrap">
              <div
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-semibold ${product.stock > 0 ? "bg-[#2E75B6]/10 text-[#0D162B]" : "bg-red-50 text-red-600"}`}
              >
                {product.stock > 0 ? (
                  <>
                    <Check className="h-3 w-3 md:h-4 md:w-4" /> In Stock
                  </>
                ) : (
                  "Out of Stock"
                )}
              </div>
              <span className="text-gray-500 font-medium ml-1 md:ml-2">
                Ships by{" "}
                {new Date(
                  new Date().getTime() + 2 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString()}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
              <button
                className={`flex-1 h-12 md:h-14 rounded-xl text-base md:text-lg font-semibold transition-all flex items-center justify-center gap-2 md:gap-3 ${product.stock > 0 ? "bg-[#111] text-white hover:bg-[#2E75B6] hover:shadow-xl transition-colors" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? (
                  <>
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" /> Add to Bag
                  </>
                ) : (
                  "Unavailable"
                )}
              </button>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12 py-6 md:py-10 border-y border-black/5">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-[#f0f0f0] p-2 md:p-3 rounded-full">
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-[#111]" />
                </div>
                <div className="mt-1">
                  <h4 className="font-semibold text-[#111] mb-1 text-sm md:text-base">
                    1 Year Warranty
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500">
                    Official manufacturer guarantee included
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-[#f0f0f0] p-2 md:p-3 rounded-full">
                  <Truck className="h-4 w-4 md:h-5 md:w-5 text-[#111]" />
                </div>
                <div className="mt-1">
                  <h4 className="font-semibold text-[#111] mb-1 text-sm md:text-base">
                    Free Delivery
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500">
                    Complimentary priority shipping
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-[#f0f0f0] p-2 md:p-3 rounded-full">
                  <RotateCcw className="h-4 w-4 md:h-5 md:w-5 text-[#111]" />
                </div>
                <div className="mt-1">
                  <h4 className="font-semibold text-[#111] mb-1 text-sm md:text-base">
                    30-Day Returns
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500">
                    No questions asked return policy
                  </p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="bg-gray-50/50 p-6 md:p-8 rounded-xl md:rounded-xl border border-black/5">
                <h3 className="text-lg md:text-xl font-display font-semibold text-[#111] mb-4 md:mb-6">
                  Technical Specifications
                </h3>
                <div className="space-y-1">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-3 py-3 md:py-4 border-b last:border-0 border-black/5 items-center gap-4"
                    >
                      <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px] md:text-xs">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="col-span-2 font-medium text-[#111] text-right sm:text-left text-sm md:text-base break-words">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-24 mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-[#111] mb-8">
              You might also like
            </h2>
            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 hide-scrollbar snap-x">
              {relatedProducts.map((relatedProduct) => {
                const rpImages = normalizeImages(relatedProduct.images);
                const isRpWishlisted = isInWishlist(relatedProduct.id);
                const currentPrice = relatedProduct.price * (1 - relatedProduct.discount / 100);

                return (
                  <motion.div
                    key={relatedProduct.id}
                    className="min-w-[220px] md:min-w-[280px] w-[220px] md:w-[280px] snap-start bg-white rounded-xl md:rounded-xl shadow-sm border border-black/[0.03] hover:shadow-md hover:border-black/5 transition-all duration-300 h-[320px] md:h-[360px] flex flex-col group relative overflow-hidden flex-shrink-0"
                    whileHover={{ y: -5 }}
                  >
                    {/* Action Icons */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col gap-2 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity lg:translate-x-2 lg:group-hover:translate-x-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isRpWishlisted) {
                            removeWishlist(relatedProduct.id);
                            toast.info(`Removed from wishlist`);
                          } else {
                            addWishlist(relatedProduct);
                            toast.success(`Added ${relatedProduct.name} to wishlist`);
                          }
                        }}
                        className="bg-white/90 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-lg hover:bg-white text-gray-600 hover:text-red-500 transition-all"
                      >
                        <Heart className="w-4 h-4 md:w-4 md:h-4" fill={isRpWishlisted ? "currentColor" : "none"} color={isRpWishlisted ? "red" : "currentColor"} />
                      </button>
                      <Link to={`/product/${relatedProduct.id}`} onClick={() => window.scrollTo(0, 0)} className="bg-white/90 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-lg hover:bg-white text-gray-600 hover:text-[#111] transition-all hidden md:block">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Discount Tag */}
                    {relatedProduct.discount > 0 && (
                      <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-[#111] text-white text-[10px] md:text-xs font-semibold tracking-wider px-2 py-1 md:px-3 md:py-1.5 rounded-full z-20 shadow-sm border border-white/10">
                        {relatedProduct.discount}% OFF
                      </span>
                    )}

                    <Link to={`/product/${relatedProduct.id}`} onClick={() => window.scrollTo(0, 0)} className="flex-1 flex flex-col h-full">
                      {/* Edge-to-edge Image Container */}
                      <div className="w-full h-36 md:h-44 bg-[#F7FAFC] relative overflow-hidden group-hover:bg-[#F0F2F1] transition-colors">
                        <img
                          src={rpImages[0]}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
                        />
                      </div>

                      {/* Content Area */}
                      <div className="p-3.5 md:p-4 flex-1 flex flex-col">
                        <div className="text-[9px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                          {relatedProduct.brand}
                        </div>
                        <h4 className="font-semibold text-sm md:text-[15px] mt-0.5 md:mt-1 line-clamp-1 text-[#111]">
                          {relatedProduct.name}
                        </h4>

                        <div className="flex items-center gap-0.5 md:gap-1 mt-1 md:mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-[#121212] text-[#121212]" />
                          ))}
                        </div>

                        <div className="flex items-end justify-between mt-auto pt-4 md:pt-5 border-t border-black/5">
                          <div>
                            <div className="text-[#121212] text-base md:text-xl font-display font-bold">
                              LKR {currentPrice.toFixed(2)}
                            </div>
                            {relatedProduct.discount > 0 && (
                              <div className="text-[10px] md:text-xs text-gray-400 font-medium line-through">
                                LKR {relatedProduct.price}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addItem(relatedProduct);
                              toast.success(`${relatedProduct.name} added to cart`);
                            }}
                            className="bg-[#111] text-white p-2.5 md:p-3.5 rounded-full hover:bg-[#2E75B6] transition-colors transition-all shadow-md"
                          >
                            <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
