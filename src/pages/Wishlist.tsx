import { Link } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { Star, ShoppingBag, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    <div className="flex-1 bg-[#F7FAFC] py-12 min-h-screen">
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
              <button className="bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#2E75B6] transition-colors shadow-md">
                Explore Store
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => {
              const images =
                typeof product.images === "string"
                  ? JSON.parse(product.images as string)
                  : product.images;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-transparent hover:border-[#2E75B6]/30 hover:shadow-xl transition-all h-[400px] flex flex-col group relative">
                    <button
                      onClick={() => {
                        removeItem(product.id);
                        toast.info("Removed from wishlist");
                      }}
                      className="absolute top-6 right-6 bg-white p-2.5 rounded-full shadow-md text-red-500 hover:bg-red-50 hover:scale-110 transition-all z-20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/product/${product.id}`}
                      className="flex-1 flex flex-col h-full mt-2"
                    >
                      <div className="w-full h-44 bg-[#F7FAFC] rounded-2xl mb-4 flex items-center justify-center p-6 relative overflow-hidden">
                        {product.discount > 0 && (
                          <span className="absolute top-3 left-3 bg-[#0D162B] text-white text-xs font-black tracking-wider px-3 py-1 rounded-full z-10 shadow-sm">
                            -{product.discount}%
                          </span>
                        )}
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                        />
                      </div>

                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {product.brand}
                      </div>
                      <h4 className="font-extrabold text-base mt-1 line-clamp-1 text-gray-900">
                        {product.name}
                      </h4>

                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      <div className="flex items-end justify-between mt-auto pt-4">
                        <div>
                          <div className="text-[#2E75B6] text-xl font-black">
                            LKR{" "}
                            {(
                              product.price *
                              (1 - product.discount / 100)
                            ).toFixed(2)}
                          </div>
                          {product.discount > 0 && (
                            <div className="text-xs text-gray-400 font-bold line-through">
                              LKR {product.price}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="bg-black text-white p-3 rounded-xl hover:bg-[#2E75B6] hover:shadow-lg hover:shadow-[#2E75B6]/30 transition-all transform transition-colors"
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
