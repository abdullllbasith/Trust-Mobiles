import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter,
  Check,
  SlidersHorizontal,
  Search,
  Heart,
  ShoppingBag,
  Eye,
  Star,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore, Product } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  const { addItem } = useCartStore();
  const {
    addItem: addWishlist,
    isInWishlist,
    removeItem: removeWishlist,
  } = useWishlistStore();

  const categoryParam = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const qParam = searchParams.get("q") || "";

  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (categoryParam) {
      filtered = filtered.filter((p: any) => p.category === categoryParam);
    }
    if (brandParam) {
      filtered = filtered.filter((p: any) => p.brand === brandParam);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.brand.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery),
      );
    }
    if (priceMinParam) {
      filtered = filtered.filter(
        (p) => p.price * (1 - p.discount / 100) >= Number(priceMinParam),
      );
    }
    if (priceMaxParam) {
      filtered = filtered.filter(
        (p) => p.price * (1 - p.discount / 100) <= Number(priceMaxParam),
      );
    }

    switch (sort) {
      case "price-asc":
        filtered.sort(
          (a: any, b: any) =>
            a.price * (1 - a.discount / 100) - b.price * (1 - b.discount / 100),
        );
        break;
      case "price-desc":
        filtered.sort(
          (a: any, b: any) =>
            b.price * (1 - b.discount / 100) - a.price * (1 - a.discount / 100),
        );
        break;
      case "newest":
        filtered.sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        break;
    }

    return filtered;
  }, [
    products,
    categoryParam,
    brandParam,
    sort,
    searchQuery,
    priceMinParam,
    priceMaxParam,
  ]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      ...product,
      images:
        typeof product.images === "string"
          ? JSON.parse(product.images as string)
          : product.images,
      specs:
        typeof product.specs === "string"
          ? JSON.parse(product.specs as string)
          : product.specs,
    });
    toast.success(`${product.name} added to cart!`);
    setQuickViewProduct(null);
  };

  const toggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeWishlist(product.id);
      toast.info(`Removed from wishlist`);
    } else {
      addWishlist({
        ...product,
        images:
          typeof product.images === "string"
            ? JSON.parse(product.images as string)
            : product.images,
        specs:
          typeof product.specs === "string"
            ? JSON.parse(product.specs as string)
            : product.specs,
      });
      toast.success(`Added to wishlist`);
    }
  };

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newParams.get(key) === value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery("");
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const newParams = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) {
      newParams.set("q", trimmed);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const Sidebar = () => (
    <div className="space-y-10 pr-4 h-full overflow-y-auto hide-scrollbar pb-20">
      <div>
        <h3 className="font-display font-semibold text-[#111] mb-5 text-lg">
          Categories
        </h3>
        <ul className="space-y-1.5">
          {["Phones", "Accessories", "Tablets", "Wearables"].map((cat) => (
            <li key={cat}>
              <button
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${categoryParam === cat ? "bg-[#111] text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-[#111]"}`}
                onClick={() => updateParam("category", cat)}
              >
                {cat}
                {categoryParam === cat && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-black/5 w-full" />

      <div>
        <h3 className="font-display font-semibold text-[#111] mb-5 text-lg">
          Brands
        </h3>
        <ul className="space-y-1.5">
          {["Apple", "Samsung", "Google", "Xiaomi", "Sony"].map((brand) => (
            <li key={brand}>
              <button
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${brandParam === brand ? "bg-[#111] text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-[#111]"}`}
                onClick={() => updateParam("brand", brand)}
              >
                {brand}
                {brandParam === brand && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-black/5 w-full" />

      <div>
        <h3 className="font-display font-semibold text-[#111] mb-5 text-lg">
          Price Range
        </h3>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            placeholder="Min LKR"
            value={priceMinParam || ""}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) newParams.set("priceMin", e.target.value);
              else newParams.delete("priceMin");
              setSearchParams(newParams);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
          />
          <span className="text-gray-400 font-medium">-</span>
          <input
            type="number"
            placeholder="Max LKR"
            value={priceMaxParam || ""}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) newParams.set("priceMax", e.target.value);
              else newParams.delete("priceMax");
              setSearchParams(newParams);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[var(--bg-color)] py-6 md:py-12 min-h-[calc(100vh-80px)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* HEADER / TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 md:gap-6 glass-panel p-5 sm:p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden bg-white/60">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2FA84F]/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-display font-semibold text-[#111] tracking-tight">
              Tech Collection.
            </h1>
            <p className="text-gray-500 font-medium text-xs md:text-base mt-1 md:mt-2 flex justify-center md:justify-start items-center gap-2">
              <span>Showing {filteredProducts.length} Premium Products</span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0 relative z-10 justify-center md:justify-start">
            {/* Search */}
            <div className="relative flex-1 md:w-72 shrink-0">
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-white/70 backdrop-blur-md border border-white/50 rounded-full py-2.5 md:py-3.5 pl-10 md:pl-12 pr-4 md:pr-5 text-xs md:text-sm font-medium focus:border-black/20 focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-sm"
              />
              <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 absolute left-4 md:left-5 top-1/2 -translate-y-1/2" />
            </div>

            <Sheet>
              <SheetTrigger className="lg:hidden shrink-0 flex items-center gap-1.5 md:gap-2 bg-white/70 backdrop-blur-md border border-white/50 px-4 md:px-5 py-2.5 md:py-3.5 rounded-full text-xs md:text-sm font-semibold hover:bg-white text-[#111] transition-colors whitespace-nowrap shadow-sm">
                <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" /> Filters
              </SheetTrigger>
              <SheetContent
                side="left"
                className="rounded-r-[2.5rem] p-8 border-none shadow-2xl glass-panel bg-white/90"
              >
                <SheetTitle className="text-3xl font-display font-semibold mb-8 text-[#111] tracking-tight">
                  Refine
                </SheetTitle>
                <Sidebar />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger className="shrink-0 flex items-center gap-1.5 md:gap-2 bg-white/70 backdrop-blur-md border border-white/50 px-4 md:px-5 py-2.5 md:py-3.5 rounded-full text-xs md:text-sm font-semibold hover:bg-white text-[#111] transition-colors whitespace-nowrap shadow-sm">
                <SlidersHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {sort === "popular"
                  ? "Popular"
                  : sort === "price-asc"
                    ? "Lowest Price"
                    : sort === "price-desc"
                      ? "Highest Price"
                      : "Newest"}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-2xl p-2 w-56 shadow-2xl border-white/40 bg-white/90 backdrop-blur-xl"
              >
                {["popular", "newest", "price-asc", "price-desc"].map((s) => (
                  <DropdownMenuItem
                    key={s}
                    className={`rounded-xl cursor-pointer font-medium py-3 px-4 ${sort === s ? "bg-[#111] text-white" : "hover:bg-gray-100"}`}
                    onClick={() => setSort(s)}
                  >
                    {s === "popular"
                      ? "Trending"
                      : s === "newest"
                        ? "New Arrivals"
                        : s === "price-asc"
                          ? "Price: Low to High"
                          : "Price: High to Low"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ACTIVE FILTERS BAR */}
        {(categoryParam ||
          brandParam ||
          searchParams.get("priceMin") ||
          searchParams.get("priceMax") ||
          searchQuery) && (
          <div className="flex flex-wrap gap-3 mb-8 items-center">
            <span className="text-sm font-medium text-gray-500">
              Active Filters:
            </span>
            {categoryParam && (
              <span className="bg-white border border-black/5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#111] flex items-center gap-2 shadow-sm">
                {categoryParam}{" "}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => updateParam("category", categoryParam)}
                />
              </span>
            )}
            {brandParam && (
              <span className="bg-white border border-black/5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#111] flex items-center gap-2 shadow-sm">
                {brandParam}{" "}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => updateParam("brand", brandParam)}
                />
              </span>
            )}
            {searchParams.get("priceMin") && (
              <span className="bg-white border border-black/5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#111] flex items-center gap-2 shadow-sm">
                Min: LKR {searchParams.get("priceMin")}{" "}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete("priceMin");
                    setSearchParams(p);
                  }}
                />
              </span>
            )}
            {searchParams.get("priceMax") && (
              <span className="bg-white border border-black/5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#111] flex items-center gap-2 shadow-sm">
                Max: LKR {searchParams.get("priceMax")}{" "}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete("priceMax");
                    setSearchParams(p);
                  }}
                />
              </span>
            )}
            {searchQuery && (
              <span className="bg-white border border-black/5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#111] flex items-center gap-2 shadow-sm">
                Search: {searchQuery}{" "}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => handleSearchChange("")}
                />
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-[#111] hover:text-red-500 underline ml-2 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="flex gap-10">
          {/* SIDEBAR DESKTOP */}
          <aside className="w-[300px] hidden lg:block shrink-0">
            <div className="bg-white/40 glass-panel rounded-[2.5rem] p-8 shadow-sm border border-white/60 sticky top-28">
              <Sidebar />
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white/40 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-transparent h-[300px] md:h-[440px] flex flex-col glass-panel shadow-sm"
                  >
                    <div className="w-full h-32 md:h-56 bg-white/50 animate-pulse rounded-xl md:rounded-2xl mb-3 md:mb-5"></div>
                    <div className="h-3 bg-white/50 animate-pulse w-1/3 mb-2 md:mb-3 rounded"></div>
                    <div className="h-4 md:h-5 bg-white/50 animate-pulse w-3/4 mb-auto rounded"></div>
                    <div className="h-10 md:h-12 bg-white/50 animate-pulse w-full mt-3 md:mt-4 rounded-[1rem]"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {filteredProducts.map((product, idx) => {
                  const isWishlisted = isInWishlist(product.id);
                  const currentPrice =
                    product.price * (1 - product.discount / 100);
                  const images =
                    typeof product.images === "string"
                      ? JSON.parse(product.images as string)
                      : product.images;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
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
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickViewProduct(product);
                            }}
                            className="bg-white/90 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-lg hover:bg-white text-gray-600 hover:text-[#111] transition-all hidden md:block"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                                  LKR {currentPrice.toFixed(2)}
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
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 text-center bg-white/40 glass-panel rounded-[3rem] border border-white/60 shadow-sm"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 inline-flex">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-3xl font-display font-semibold text-[#111] mb-4">
                  No results found
                </h2>
                <p className="text-gray-500 font-medium max-w-md text-lg">
                  Modify your filters or search term to discover the perfect
                  device.
                </p>
                <button
                  className="mt-8 bg-white border border-gray-200 text-[#111] hover:bg-gray-50 transition-colors px-8 py-3.5 rounded-full font-semibold outline-none focus:ring-2 focus:ring-black/10"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setQuickViewProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.1 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]  border border-white/50"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-6 right-6 bg-gray-100 p-2.5 rounded-full hover:bg-gray-200 text-gray-600 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Images side */}
              <div className="w-full md:w-1/2 p-8 md:p-12 bg-[#F5F7F6] flex items-center justify-center relative overlow-hidden">
                <img
                  src={
                    typeof quickViewProduct.images === "string"
                      ? JSON.parse(quickViewProduct.images as string)[0]
                      : quickViewProduct.images[0]
                  }
                  alt={quickViewProduct.name}
                  className="w-full h-full object-contain max-h-[350px] md:max-h-[450px] mix-blend-multiply drop-shadow-2xl"
                />
              </div>

              {/* Content side */}
              <div className="w-full md:w-1/2 p-8 lg:p-12 overflow-y-auto hide-scrollbar flex flex-col relative bg-white">
                <div className="mb-6 flex space-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full">
                    {quickViewProduct.brand}
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] mb-4 leading-[1.1]">
                  {quickViewProduct.name}
                </h2>
                <div className="flex items-center gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-[#111] text-[#111]"
                    />
                  ))}
                  <span className="text-sm text-gray-500 font-medium ml-2 underline cursor-pointer hover:text-[#111] transition-colors">
                    124 Reviews
                  </span>
                </div>

                <div className="flex items-end gap-4 mb-8">
                  <span className="text-5xl font-display font-semibold text-[#111]">
                    LKR 
                    {(
                      quickViewProduct.price *
                      (1 - quickViewProduct.discount / 100)
                    ).toFixed(2)}
                  </span>
                  {quickViewProduct.discount > 0 && (
                    <span className="text-xl text-gray-400 font-medium line-through mb-1">
                      LKR {quickViewProduct.price}
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-black/5">
                  <h4 className="font-semibold text-[#111] mb-4 text-sm uppercase tracking-wider">
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm font-medium text-gray-700">
                    {Object.entries(
                      typeof quickViewProduct.specs === "string"
                        ? JSON.parse(quickViewProduct.specs as string) || {}
                        : quickViewProduct.specs || {},
                    )
                      .slice(0, 4)
                      .map(([k, v]) => (
                        <div key={k} className="flex flex-col">
                          <span className="text-gray-400 text-xs uppercase mb-1">
                            {k.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="truncate text-[#111]">
                            {v as string}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-auto pt-4">
                  <button
                    onClick={(e) => handleAddToCart(e, quickViewProduct)}
                    className="flex-1 bg-[#111] text-white py-4 px-6 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#2FA84F] transition-colors shadow-md transform hover:-translate-y-1"
                  >
                    <ShoppingBag className="w-5 h-5" /> Add to Cart
                  </button>
                  <button
                    onClick={(e) => toggleWishlist(e, quickViewProduct)}
                    className={`p-4 rounded-full border-2 transition-all flex items-center justify-center ${isInWishlist(quickViewProduct.id) ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-[#111] bg-white"}`}
                  >
                    <Heart
                      className="w-6 h-6"
                      fill={isInWishlist(quickViewProduct.id) ? "red" : "none"}
                      color={
                        isInWishlist(quickViewProduct.id)
                          ? "red"
                          : "currentColor"
                      }
                    />
                  </button>
                </div>
                <div className="mt-8 text-center pt-6 border-t border-black/5">
                  <Link
                    to={`/product/${quickViewProduct.id}`}
                    className="text-center w-full block text-sm font-semibold text-gray-500 hover:text-[#111] transition-colors"
                  >
                    View Full Details &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
