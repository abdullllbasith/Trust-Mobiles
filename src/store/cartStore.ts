import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description?: string;
  highlights?: string[];
  price: number;
  discount: number;
  stock: number;
  status?: "available" | "sold";
  soldAt?: string | null;
  images: string[];
  specs: any;
  createdAt: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce(
          (total, item) =>
            total + item.price * (1 - item.discount / 100) * item.quantity,
          0,
        ),
    }),
    {
      name: "matrix-cart-storage",
    },
  ),
);
