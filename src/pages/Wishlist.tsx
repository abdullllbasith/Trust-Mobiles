import { Link } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";

export default function Wishlist() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (e: any, product: any) => {
    e.preventDefault();
    addItem({
      ...product,
      quantity: 1,
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

  return (
    <div className="flex-1 bg-[#F8F6F1] py-12 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
          My Wishlist
        </h1>
        <p className="text-gray-500 font-medium mb-10">
          You have {items.length} items in your wishlist.
        </p>

        {items.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="bg-red-50 p-6 rounded-full mb-6">
              <Heart className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 max-w-sm mb-8">
              Looks like you haven't added any products to your wishlist yet.
            </p>
            <Link to="/shop">
              <button className="bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#C5A059] transition-colors shadow-md">
                Explore Store
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <ProductCard
                  product={product}
                  onAdd={handleAddToCart}
                  actions={
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(product.id);
                        toast.info("Removed from wishlist");
                      }}
                      className="absolute top-3 right-3 z-20 bg-white p-2.5 rounded-full shadow-md text-red-500 hover:bg-red-50"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
