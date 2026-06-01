import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./cartStore";

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        if (!items.find((item) => item.id === product.id)) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      isInWishlist: (productId) => {
        return !!get().items.find((item) => item.id === productId);
      },
    }),
    {
      name: "matrix-wishlist-storage",
    },
  ),
);
