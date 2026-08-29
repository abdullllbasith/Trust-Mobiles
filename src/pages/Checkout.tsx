import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { openWhatsAppCheckout } from "@/lib/whatsapp";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
  });

  const grandTotal = totalPrice();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const phone = formData.phone.replace(/\D/g, "");
    if (phone.length < 9) {
      toast.error("Please enter a valid WhatsApp / mobile number");
      return;
    }

    setLoading(true);
    try {
      const address = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        note: formData.note.trim(),
      };

      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalPrice: grandTotal,
          address,
          channel: "whatsapp",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not save your order");
      }

      openWhatsAppCheckout(
        {
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          email: address.email,
          address: address.address,
          city: address.city,
          note: address.note,
        },
        items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
        grandTotal,
      );

      toast.success("Opening WhatsApp to complete your order");
      clearCart();
      navigate("/shop");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-[#1C1C1C]/10 rounded-xl px-4 py-3 outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-[#1C1C1C] text-sm md:text-base font-medium transition-all shadow-sm";

  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-display font-semibold mb-6">
          Your bag is empty
        </h2>
        <button
          className="bg-[#1C1C1C] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors"
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
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#1C1C1C] mb-2 tracking-tight">
          Checkout
        </h1>
        <p className="text-[#5C574F] font-medium mb-6 md:mb-8">
          No account needed. Confirm on WhatsApp and we will arrange delivery.
        </p>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:items-start">
          <div className="w-full lg:w-2/3">
            <div className="glass-panel bg-white rounded-[2rem] shadow-sm p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-display font-semibold text-[#1C1C1C] mb-6">
                Delivery details
              </h2>
              <form
                id="checkout-form"
                onSubmit={handleCheckout}
                className="space-y-4 md:space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-[#5C574F] ml-1">
                      First Name
                    </Label>
                    <input
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-[#5C574F] ml-1">
                      Last Name
                    </Label>
                    <input
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-[#5C574F] ml-1">
                      WhatsApp / Mobile
                    </Label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="07X XXX XXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-[#5C574F] ml-1">
                      Email (optional)
                    </Label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-[#5C574F] ml-1">
                    Street Address
                  </Label>
                  <input
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold text-[#5C574F] ml-1">
                    City
                  </Label>
                  <input
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-sm font-semibold text-[#5C574F] ml-1">
                    Order note (optional)
                  </Label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={formData.note}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="w-full lg:w-1/3 sticky top-24 md:top-32">
            <div className="bg-[#1C1C1C] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 md:w-64 md:h-64 bg-[#C5A059] rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none"></div>

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
                    <div className="text-base font-semibold text-[#F3EBD8]">
                      LKR{" "}
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
              </div>

              <div className="h-px bg-white/10 w-full my-6 relative z-10"></div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 mb-8 relative z-10">
                <span className="font-semibold text-lg md:text-xl text-white">
                  Total
                </span>
                <span className="font-display font-semibold text-3xl md:text-4xl text-white tracking-tight">
                  LKR {grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white h-14 md:h-16 rounded-full flex items-center justify-center gap-2 md:gap-3 font-semibold text-lg transition-all shadow-xl hover:-translate-y-1 transform relative z-10"
                disabled={loading}
              >
                <MessageCircle className="h-5 w-5" />
                {loading ? "Opening WhatsApp..." : "Order via WhatsApp"}
              </button>
              <p className="text-xs text-white/50 text-center mt-4 relative z-10">
                We confirm price, stock, and delivery on WhatsApp. No card details are collected on this site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
