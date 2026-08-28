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
  X,
  Truck,
  MessageCircle,
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
import { ProductCard } from "@/components/ProductCard";

const CATEGORIES = ["Phones", "Accessories", "Tablets", "Wearables"];
const BRANDS = ["Apple", "Samsung", "Google", "Xiaomi", "Sony"];
const PRICE_PRESETS = [
  { label: "Under 50k", min: "", max: "50000" },
  { label: "50k – 150k", min: "50000", max: "150000" },
  { label: "150k+", min: "150000", max: "" },
];

function formatLkr(amount: number) {
  return `LKR ${Math.round(amount).toLocaleString("en-US")}`;
}

function productImages(product: Product) {
  return typeof product.images === "string"
    ? JSON.parse(product.images as string)
    : product.images;
}

function productSpecs(product: Product) {
  return typeof product.specs === "string"
    ? JSON.parse(product.specs as string)
    : product.specs;
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sort, setSort] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
    setLoadError(null);
    let cancelled = false;

    fetch(`/api/products`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (data && (data.error || data.detail)) ||
              `Failed to load products (${res.status})`,
          );
        }
        return Array.isArray(data) ? data : [];
      })
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setProducts([]);
          setLoadError(err?.message || "Failed to load products");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[(p as any).category] = (counts[(p as any).category] || 0) + 1;
    }
    return counts;
  }, [products]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[(p as any).brand] = (counts[(p as any).brand] || 0) + 1;
    }
    return counts;
  }, [products]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      ...product,
      images: productImages(product),
      specs: productSpecs(product),
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
        images: productImages(product),
        specs: productSpecs(product),
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
    if (trimmed) newParams.set("q", trimmed);
    else newParams.delete("q");
    setSearchParams(newParams);
  };

  const setPriceRange = (min: string, max: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set("priceMin", min);
    else newParams.delete("priceMin");
    if (max) newParams.set("priceMax", max);
    else newParams.delete("priceMax");
    setSearchParams(newParams);
  };

  const hasFilters = Boolean(
    categoryParam ||
      brandParam ||
      priceMinParam ||
      priceMaxParam ||
      searchQuery,
  );

  const sortLabel =
    sort === "popular"
      ? "Popular"
      : sort === "price-asc"
        ? "Price: Low to High"
        : sort === "price-desc"
          ? "Price: High to Low"
          : "Newest";

  const FilterCheck = ({
    label,
    selected,
    count,
    onClick,
  }: {
    label: string;
    selected: boolean;
    count?: number;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        selected
          ? "bg-[#1C1C1C] text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          selected
            ? "border-white bg-white text-[#1C1C1C]"
            : "border-slate-300 bg-white"
        }`}
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
      {typeof count === "number" && (
        <span className={selected ? "text-white/70" : "text-slate-400"}>
          {count}
        </span>
      )}
    </button>
  );

  const Sidebar = () => (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Categories
        </h3>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <FilterCheck
                label={cat}
                selected={categoryParam === cat}
                count={categoryCounts[cat] || 0}
                onClick={() => updateParam("category", cat)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-slate-200" />

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Brands
        </h3>
        <ul className="space-y-1">
          {BRANDS.map((brand) => (
            <li key={brand}>
              <FilterCheck
                label={brand}
                selected={brandParam === brand}
                count={brandCounts[brand] || 0}
                onClick={() => updateParam("brand", brand)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-slate-200" />

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Price range
        </h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => {
            const active =
              (priceMinParam || "") === preset.min &&
              (priceMaxParam || "") === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  active
                    ? setPriceRange("", "")
                    : setPriceRange(preset.min, preset.max)
                }
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#C5A059] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMinParam || ""}
            onChange={(e) => setPriceRange(e.target.value, priceMaxParam || "")}
            className="field-input py-2 text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMaxParam || ""}
            onChange={(e) => setPriceRange(priceMinParam || "", e.target.value)}
            className="field-input py-2 text-sm"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="btn-secondary w-full"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 bg-[var(--bg-color)] min-h-[calc(100vh-75px)]">
      <div className="flex w-full">
        <aside className="sticky top-[75px] hidden h-[calc(100vh-75px)] w-[280px] shrink-0 flex-col self-start border-r border-slate-200 bg-white lg:flex">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-display font-semibold text-[#1C1C1C]">
              Filters
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[#C5A059] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5 hide-scrollbar">
            <Sidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C1C1C] md:text-4xl">
                Shop
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                {loading
                  ? "Loading products…"
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} available`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1 sm:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, brand, or category"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="field-input pl-10 py-3"
                />
              </div>

              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger className="btn-secondary h-12 rounded-xl px-4 lg:hidden">
                    <Filter className="h-4 w-4" /> Filters
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] bg-white p-0">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <SheetTitle className="text-base font-semibold">
                        Filters
                      </SheetTitle>
                    </div>
                    <div className="px-3 py-5">
                      <Sidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger className="btn-secondary h-12 rounded-xl px-4 whitespace-nowrap">
                    <SlidersHorizontal className="h-4 w-4" />
                    {sortLabel}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-xl border-slate-200 bg-white p-1"
                  >
                    {[
                      ["popular", "Popular"],
                      ["newest", "New Arrivals"],
                      ["price-asc", "Price: Low to High"],
                      ["price-desc", "Price: High to Low"],
                    ].map(([value, label]) => (
                      <DropdownMenuItem
                        key={value}
                        className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${
                          sort === value ? "bg-[#1C1C1C] text-white" : ""
                        }`}
                        onClick={() => setSort(value)}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white px-4 py-3">
              <MessageCircle className="h-5 w-5 shrink-0 text-[#C5A059]" />
              <p className="text-sm font-medium text-slate-600">
                Checkout is free — we confirm every order on WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white px-4 py-3">
              <Truck className="h-5 w-5 shrink-0 text-[#C5A059]" />
              <p className="text-sm font-medium text-slate-600">
                Genuine devices with support after you buy.
              </p>
            </div>
          </div>

          {hasFilters && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {categoryParam && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium">
                  {categoryParam}
                  <X
                    className="h-3.5 w-3.5 cursor-pointer hover:text-red-500"
                    onClick={() => updateParam("category", categoryParam)}
                  />
                </span>
              )}
              {brandParam && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium">
                  {brandParam}
                  <X
                    className="h-3.5 w-3.5 cursor-pointer hover:text-red-500"
                    onClick={() => updateParam("brand", brandParam)}
                  />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium">
                  “{searchQuery}”
                  <X
                    className="h-3.5 w-3.5 cursor-pointer hover:text-red-500"
                    onClick={() => handleSearchChange("")}
                  />
                </span>
              )}
              {(priceMinParam || priceMaxParam) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium">
                  {priceMinParam || "0"} – {priceMaxParam || "∞"}
                  <X
                    className="h-3.5 w-3.5 cursor-pointer hover:text-red-500"
                    onClick={() => setPriceRange("", "")}
                  />
                </span>
              )}
              <button
                onClick={clearFilters}
                className="ml-1 text-sm font-semibold text-[#C5A059] hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="surface-card h-[420px] p-4">
                  <div className="mb-4 h-52 animate-pulse rounded-xl bg-slate-100" />
                  <div className="mb-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="surface-card py-20 text-center px-6">
              <h2 className="mb-2 font-display text-xl font-semibold text-[#1C1C1C]">
                Couldn’t load products
              </h2>
              <p className="mb-3 text-sm text-slate-500 max-w-lg mx-auto">
                {loadError}
              </p>
              <p className="mb-5 text-xs text-slate-400 max-w-lg mx-auto">
                If this keeps happening, open MongoDB Atlas → Network Access and
                allow <span className="font-semibold">0.0.0.0/0</span> so Vercel
                can reach the database.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, idx) => {
                const isWishlisted = isInWishlist(product.id);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: (idx % 9) * 0.03 }}
                  >
                    <ProductCard
                      product={product}
                      onAdd={(e, p) => handleAddToCart(e, p as Product)}
                      actions={
                        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(e, product)}
                            className="rounded-full bg-white p-2.5 text-slate-500 shadow-md hover:text-red-500"
                            aria-label="Toggle wishlist"
                          >
                            <Heart
                              className="h-4 w-4"
                              fill={isWishlisted ? "currentColor" : "none"}
                              color={isWishlisted ? "red" : "currentColor"}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickViewProduct(product);
                            }}
                            className="hidden rounded-full bg-white p-2.5 text-slate-500 shadow-md hover:text-[#1C1C1C] md:block"
                            aria-label="Quick view"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="surface-card py-20 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <h2 className="mb-2 font-display text-xl font-semibold text-[#1C1C1C]">
                No products match
              </h2>
              <p className="mb-5 text-sm text-slate-500">
                Try a different category, brand, or search term.
              </p>
              <button onClick={clearFilters} className="btn-secondary">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setQuickViewProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute right-3 top-3 z-20 rounded-md bg-slate-100 p-1.5 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex w-full items-center justify-center bg-slate-50 p-6 md:w-1/2">
                <img
                  src={productImages(quickViewProduct)[0]}
                  alt={quickViewProduct.name}
                  className="max-h-[280px] object-contain"
                />
              </div>
              <div className="flex w-full flex-col p-6 md:w-1/2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {quickViewProduct.brand}
                </span>
                <h2 className="mt-1 mb-2 font-display text-2xl font-semibold text-[#1C1C1C]">
                  {quickViewProduct.name}
                </h2>
                <div className="mb-6 font-display text-2xl font-bold text-[#1C1C1C]">
                  {formatLkr(
                    quickViewProduct.price *
                      (1 - quickViewProduct.discount / 100),
                  )}
                </div>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={(e) => handleAddToCart(e, quickViewProduct)}
                    className="btn-primary flex-1"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to cart
                  </button>
                  <button
                    onClick={(e) => toggleWishlist(e, quickViewProduct)}
                    className={`rounded-full border p-3 ${
                      isInWishlist(quickViewProduct.id)
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200"
                    }`}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={isInWishlist(quickViewProduct.id) ? "red" : "none"}
                      color={
                        isInWishlist(quickViewProduct.id)
                          ? "red"
                          : "currentColor"
                      }
                    />
                  </button>
                </div>
                <Link
                  to={`/product/${quickViewProduct.id}`}
                  className="mt-4 border-t border-slate-100 pt-4 text-center text-sm font-semibold text-slate-500 hover:text-[#1C1C1C]"
                >
                  View full details →
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
