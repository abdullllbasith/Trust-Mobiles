const STORAGE_KEY = "trust-mobile-recently-viewed";
const MAX_ITEMS = 8;

export type RecentProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount: number;
  image: string;
};

export function getRecentlyViewed(excludeId?: string): RecentProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as RecentProduct[];
    if (!Array.isArray(items)) return [];
    return items.filter((p) => String(p.id) !== String(excludeId)).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(product: {
  id: string | number;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount: number;
  images?: unknown;
}) {
  try {
    const images = Array.isArray(product.images)
      ? product.images
      : typeof product.images === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(product.images);
              return Array.isArray(parsed) ? parsed : [product.images];
            } catch {
              return [product.images];
            }
          })()
        : [];

    const entry: RecentProduct = {
      id: String(product.id),
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      discount: product.discount || 0,
      image: String(images[0] || ""),
    };

    const existing = getRecentlyViewed().filter((p) => p.id !== entry.id);
    const next = [entry, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}
