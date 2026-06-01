import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-[var(--bg-color)] flex flex-col items-center justify-center py-12 md:py-24 min-h-[calc(100vh-80px)] px-4">
        <div className="glass-panel p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/60 flex flex-col items-center justify-center text-center max-w-lg w-full mx-auto shadow-sm bg-white/40">
          <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm mb-4 md:mb-6 border border-black/5">
            <ShoppingBag className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#111] mb-2 md:mb-4">
            Your bag is empty
          </h1>
          <p className="text-gray-500 font-medium mb-6 md:mb-10 text-sm md:text-lg">
            Looks like you haven't added anything to your cart yet. Discover our
            premium collections.
          </p>
          <Link to="/shop">
            <button className="bg-[#111] text-white hover:bg-[#2FA84F] transition-colors py-3 md:py-4 px-8 md:px-10 rounded-full text-sm md:text-base font-semibold shadow-md transform hover:-translate-y-1">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-color)] py-6 md:py-12 min-h-[calc(100vh-80px)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-display font-semibold text-[#111] mb-6 md:mb-10 tracking-tight">
          Shopping Bag.
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          <div className="w-full lg:w-2/3">
            <div className="glass-panel rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 overflow-hidden bg-white/40">
              <ScrollArea className="max-h-[70vh] w-full px-4 py-6 md:px-6 md:py-8 lg:px-10 hide-scrollbar flex flex-col">
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="relative border-b border-black/10 pb-6 mb-2 last:border-0 last:pb-0 last:mb-0"
                    >
                      <button
                        className="absolute top-0 right-0 text-gray-400 hover:text-[#111] transition-colors p-1 z-10"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      
                      <div className="flex gap-4 sm:gap-6 pr-8">
                        <Link
                          to={`/product/${item.id}`}
                          className="w-20 h-20 sm:w-28 sm:h-28 bg-[#F5F7F6] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden group border border-black/[0.03]"
                        >
                          <img
                            src={
                              typeof item.images === "string"
                                ? JSON.parse(item.images)[0]
                                : item.images[0]
                            }
                            alt={item.name}
                            className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                          />
                        </Link>

                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <Link to={`/product/${item.id}`}>
                              <h3 className="font-display font-semibold text-sm sm:text-lg text-[#111] line-clamp-1 hover:text-[#2FA84F] transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
                              {item.category || item.brand}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden shadow-sm h-8 w-24">
                              <button
                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#111] hover:bg-gray-100 transition-colors disabled:opacity-50"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <div className="flex-1 text-center text-xs font-semibold text-[#111]">
                                {item.quantity}
                              </div>
                              <button
                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-[#111] hover:bg-gray-100 transition-colors"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <div className="font-display font-semibold text-[#111] text-sm sm:text-xl">
                              LKR {(item.price * (1 - item.discount / 100)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-[#121212] text-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl sticky top-24 md:top-32 relative overflow-hidden border border-white/10">
              <div className="absolute -top-10 -right-10 w-48 h-48 md:w-64 md:h-64 bg-[#2FA84F] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

              <h2 className="text-2xl md:text-3xl font-display font-semibold mb-6 md:mb-8 relative z-10 text-white">
                Summary
              </h2>

              <div className="space-y-4 md:space-y-6 relative z-10">
                <div className="flex justify-between text-sm md:text-base font-medium">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-semibold text-white">
                    LKR {totalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm md:text-base font-medium">
                  <span className="text-gray-400">Shipping</span>
                  <span className="font-semibold text-[#2FA84F]">
                    {totalPrice() > 50 ? "Free Delivery" : "LKR 10.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm md:text-base font-medium">
                  <span className="text-gray-400">Tax</span>
                  <span className="font-semibold text-white/80">
                    Calculated at checkout
                  </span>
                </div>

                <div className="h-px bg-white/10 w-full my-6 md:my-8"></div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 md:gap-0">
                  <span className="font-semibold text-lg md:text-xl text-white">
                    Total
                  </span>
                  <span className="font-display font-semibold text-3xl md:text-5xl text-white tracking-tight break-all md:break-normal">
                    LKR {(totalPrice() + (totalPrice() > 50 ? 0 : 10)).toFixed(2)}
                  </span>
                </div>

                <div className="pt-6 md:pt-8">
                  <button
                    className="w-full bg-white hover:bg-[#2FA84F] hover:text-[#111] h-14 md:h-16 rounded-full flex items-center justify-center gap-2 md:gap-3 font-semibold text-lg md:text-xl transition-all shadow-lg transform hover:-translate-y-1 text-[#111]"
                    onClick={() => navigate("/checkout")}
                  >
                    Checkout <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button
                    className="w-full mt-3 md:mt-4 text-gray-400 hover:text-white font-medium transition-colors py-2 text-sm md:text-base"
                    onClick={() => navigate("/shop")}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
