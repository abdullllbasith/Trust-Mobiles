import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          totalPrice: totalPrice() + (totalPrice() > 50 ? 0 : 10),
          address: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-display font-semibold mb-6">
          Cannot checkout with an empty cart
        </h2>
        <button
          className="bg-[#111] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#2FA84F] transition-colors"
          onClick={() => navigate("/shop")}
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-color)] py-6 md:py-12 min-h-[calc(100vh-80px)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#111] mb-6 md:mb-8 tracking-tight">
          Secure Checkout.
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:items-start">
          <div className="w-full lg:w-2/3">
            <div className="glass-panel bg-white/40 rounded-[2rem] shadow-sm border border-white/60 p-6 md:p-8 mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-display font-semibold text-[#111] mb-6">
                Shipping Information
              </h2>
              <form
                id="checkout-form"
                onSubmit={handleCheckout}
                className="space-y-4 md:space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                    >
                      First Name
                    </Label>
                    <input
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                    >
                      Last Name
                    </Label>
                    <input
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                  >
                    Email Address
                  </Label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                  >
                    Street Address
                  </Label>
                  <input
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                    >
                      City
                    </Label>
                    <input
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                    >
                      Country
                    </Label>
                    <input
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="zipCode"
                      className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                    >
                      ZIP Code
                    </Label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="glass-panel bg-white/40 rounded-[2rem] shadow-sm border border-white/60 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-display font-semibold text-[#111] mb-6">
                Payment Details
              </h2>
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="cardNumber"
                    className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                  >
                    Card Number
                  </Label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    required
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    form="checkout-form"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all font-mono shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="expiryDate"
                      className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                    >
                      Expiry Date
                    </Label>
                    <input
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      required
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      form="checkout-form"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cvv"
                      className="text-xs md:text-sm font-semibold text-gray-700 ml-1"
                    >
                      CVV
                    </Label>
                    <input
                      id="cvv"
                      type="password"
                      name="cvv"
                      placeholder="•••"
                      required
                      value={formData.cvv}
                      onChange={handleInputChange}
                      form="checkout-form"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] text-sm md:text-base font-medium transition-all shadow-sm tracking-widest"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 sticky top-24 md:top-32">
            <div className="bg-[#121212] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 md:w-64 md:h-64 bg-[#2FA84F] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

              <h2 className="text-2xl md:text-3xl font-display font-semibold mb-6 md:mb-8 relative z-10">
                Order Summary
              </h2>

              <div className="space-y-5 mb-8 relative z-10 max-h-[350px] overflow-y-auto hide-scrollbar">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center bg-white/5 py-3 px-4 rounded-2xl border border-white/5"
                  >
                    <div className="w-16 h-16 bg-white rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={
                          typeof item.images === "string"
                            ? JSON.parse(item.images)[0]
                            : item.images[0]
                        }
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-semibold line-clamp-1 text-white">
                        {item.name}
                      </h4>
                      <div className="text-xs font-medium text-gray-400 mt-1">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-base font-semibold text-[#2FA84F]">
                      LKR 
                      {(
                        item.price *
                        (1 - item.discount / 100) *
                        item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/10 w-full my-6 relative z-10"></div>

              <div className="space-y-4 mb-6 relative z-10">
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
              </div>

              <div className="h-px bg-white/10 w-full my-6 relative z-10"></div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 md:gap-0 mb-8 relative z-10">
                <span className="font-semibold text-lg md:text-xl text-white">
                  Total
                </span>
                <span className="font-display font-semibold text-3xl md:text-5xl text-white tracking-tight break-all md:break-normal">
                  LKR {(totalPrice() + (totalPrice() > 50 ? 0 : 10)).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full bg-white hover:bg-[#2FA84F] hover:text-white text-[#111] h-14 md:h-16 rounded-full flex items-center justify-center gap-2 md:gap-3 font-semibold text-lg md:text-xl transition-all shadow-xl hover:-translate-y-1 transform relative z-10"
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Secure Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
