import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { normalizeImages } from "@/lib/productImages";

export type ProductCardProduct = {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  discount?: number;
  stock?: number;
  status?: "available" | "sold";
  images?: string[] | string;
  image?: string;
};

function formatLkr(amount: number) {
  return `LKR ${Math.round(amount).toLocaleString("en-US")}`;
}

function stockLabel(stock?: number, sold?: boolean) {
  if (sold) return { text: "Sold", className: "text-red-600" };
  if (stock === undefined || stock === null) return null;
  if (stock <= 0) return { text: "Out of stock", className: "text-red-600" };
  if (stock <= 5)
    return { text: `Only ${stock} left`, className: "text-amber-700" };
  return { text: "In stock", className: "text-emerald-700" };
}

type ProductCardProps = {
  product: ProductCardProduct;
  onAdd: (e: MouseEvent, product: ProductCardProduct) => void;
  badge?: "new" | "discount" | "auto";
  actions?: ReactNode;
  compactAction?: boolean;
};

export function ProductCard({
  product,
  onAdd,
  badge = "auto",
  actions,
  compactAction = true,
}: ProductCardProps) {
  const images = product.image
    ? [product.image]
    : normalizeImages(product.images);
  const discount = product.discount || 0;
  const salePrice = product.price * (1 - discount / 100);
  const isSold = product.status === "sold";
  const stock = stockLabel(product.stock, isSold);
  const unavailable = isSold || (product.stock ?? 1) <= 0;

  const showNew = !isSold && badge === "new";
  const showDiscount =
    !isSold &&
    (badge === "discount" || (badge === "auto" && discount > 0 && !showNew));

  return (
    <div className={`product-card group ${isSold ? "opacity-95" : ""}`}>
      {actions}
      <Link to={`/product/${product.id}`} className="flex flex-col">
        <div className="relative h-36 overflow-hidden bg-[#F8F6F1] sm:h-44 md:h-48">
          {showNew && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-[#C5A059] px-2 py-0.5 text-[9px] font-bold text-[#1C1C1C] sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
              NEW
            </span>
          )}
          {showDiscount && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-[#1C1C1C] px-2 py-0.5 text-[9px] font-semibold text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
              {discount}% OFF
            </span>
          )}
          <img
            src={images[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23F8F6F1' width='400' height='400'/%3E%3C/svg%3E"}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`product-card-image h-full w-full object-cover transition-transform duration-500 ${
              isSold ? "brightness-75 grayscale-[0.35]" : ""
            }`}
          />
          {isSold && (
            <span className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <span className="rotate-[-18deg] rounded-md bg-red-600 px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg sm:px-5 sm:py-2 sm:text-base">
                Sold
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 sm:text-[10px]">
            {product.brand}
          </div>
          <h4 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-[#1C1C1C] sm:text-base">
            {product.name}
          </h4>

          {stock && (
            <p className={`text-[11px] font-medium sm:text-xs ${stock.className}`}>
              {stock.text}
            </p>
          )}

          <div className="mt-1 flex items-end justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <div className="font-display text-base font-bold text-[#1C1C1C] sm:text-lg">
                {formatLkr(salePrice)}
              </div>
              {discount > 0 && (
                <div className="text-xs font-medium text-stone-400 line-through sm:text-sm">
                  {formatLkr(product.price)}
                </div>
              )}
            </div>

            {compactAction ? (
              <button
                type="button"
                disabled={unavailable}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!unavailable) onAdd(e, product);
                }}
                className="shrink-0 rounded-full bg-[#1C1C1C] p-2 text-white transition-all hover:bg-[#C5A059] hover:text-[#1C1C1C] disabled:cursor-not-allowed disabled:opacity-40 sm:p-2.5"
                aria-label={isSold ? "Sold" : "Add to cart"}
              >
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={unavailable}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!unavailable) onAdd(e, product);
                }}
                className="btn-primary shrink-0 rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {isSold ? "Sold" : "Add"}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
