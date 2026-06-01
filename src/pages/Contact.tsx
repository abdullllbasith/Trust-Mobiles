import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send
    setTimeout(() => {
      toast.success(
        "Message sent successfully. Our team will get back to you soon!",
      );
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[var(--bg-color)] min-h-screen pt-12 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-display font-medium text-[#111] tracking-tight mb-6"
          >
            Get in touch.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg font-medium leading-relaxed"
          >
            Have a question about a device? Need support with an order? We are
            here to help you every step of the way.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info Cards */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex items-start gap-5">
              <div className="bg-[#f0f0f0] p-4 rounded-full text-[#111]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-[#111] mb-1">
                  Call Us
                </h3>
                <p className="text-gray-500 font-medium mb-3 text-sm">
                  Mon-Fri from 8am to 8pm.
                </p>
                <a
                  href="tel:+18001234567"
                  className="font-semibold text-[#111] hover:text-[#2FA84F] transition-colors"
                >
                  +1 (800) 123-4567
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex items-start gap-5">
              <div className="bg-[#f0f0f0] p-4 rounded-full text-[#111]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-[#111] mb-1">
                  Email Us
                </h3>
                <p className="text-gray-500 font-medium mb-3 text-sm">
                  We'll reply within 24 hours.
                </p>
                <a
                  href="mailto:support@matrixmobiles.com"
                  className="font-semibold text-[#111] hover:text-[#2FA84F] transition-colors"
                >
                  support@matrixmobiles.com
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 flex items-start gap-5">
              <div className="bg-[#f0f0f0] p-4 rounded-full text-[#111]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-[#111] mb-1">
                  Visit flagship
                </h3>
                <p className="text-gray-500 font-medium mb-3 text-sm">
                  Drop by our main store.
                </p>
                <p className="font-semibold text-[#111]">
                  1 Market St.
                  <br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="w-full lg:w-2/3 glass-panel bg-white/40 p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <h2 className="text-3xl font-display font-semibold text-[#111] mb-8">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700 ml-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    required
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] font-medium transition-all shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700 ml-1"
                  >
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] font-medium transition-all shadow-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-semibold text-gray-700 ml-1"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  required
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] font-medium transition-all shadow-sm"
                >
                  <option value="">Select a subject...</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Returns & Refunds">Returns & Refunds</option>
                  <option value="Trade-in Program">Trade-in Program</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-semibold text-gray-700 ml-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-black focus:ring-1 focus:ring-black text-[#111] font-medium transition-all shadow-sm resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="bg-[#111] text-white hover:bg-[#2FA84F] py-4 px-8 rounded-full font-semibold transition-all shadow-md transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
