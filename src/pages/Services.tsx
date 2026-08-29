import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  MessageCircle,
  Smartphone,
  Wrench,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { WHATSAPP_NUMBER } from "@/constants";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const SERVICES = [
  {
    icon: <BadgeCheck className="w-6 h-6" />,
    title: "Genuine devices",
    desc: "Phones and accessories sold as authentic products, with stock and condition confirmed before you pay.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Warranty support",
    desc: "Brand warranty guidance and help starting a claim if something goes wrong with your device.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Setup & transfer",
    desc: "Need help moving contacts, apps, or data to a new phone? Ask us in-store or on WhatsApp.",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Accessory fitting",
    desc: "Screen protectors, cases, and chargers matched to your model — fitted carefully when you visit.",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Island-wide delivery",
    desc: "Order online, confirm on WhatsApp, and we arrange delivery to your address across Sri Lanka.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "WhatsApp care",
    desc: "Questions on stock, pricing, or the right model for you? Message us — real humans, fast replies.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Browse or visit",
    desc: "Shop online or drop by our store in Aluthgama to see devices in person.",
  },
  {
    step: "02",
    title: "Confirm on WhatsApp",
    desc: "We verify stock, price, and delivery details with you before you commit.",
  },
  {
    step: "03",
    title: "Receive & settle",
    desc: "Get your order delivered or collect in-store, then settle payment as agreed.",
  },
];

export default function Services() {
  return (
    <div className="flex-1 bg-[var(--bg-color)] min-h-screen pt-12 pb-24">
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-display font-medium text-[#111] tracking-tight mb-6">
            Our <span className="text-[#C5A059]">services</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            More than a phone store — from genuine devices and warranty help to
            setup, accessories, and WhatsApp support.
          </p>
        </motion.div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 md:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="bg-[#f0f0f0] w-14 h-14 rounded-full flex items-center justify-center text-[#C5A059] mb-6">
                {service.icon}
              </div>
              <h3 className="text-xl font-display font-semibold text-[#111] mb-3">
                {service.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20 mb-20 border-y border-black/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-[#111]">
              How it works
            </h2>
            <p className="text-gray-500 font-medium mt-4 max-w-lg mx-auto">
              A simple path from browsing to receiving your device.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center md:text-left">
                <span className="text-[#C5A059] font-display text-4xl font-medium">
                  {item.step}
                </span>
                <h3 className="text-xl font-display font-semibold text-[#111] mt-4 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="bg-[#121212] text-white rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-display font-medium mb-4">
              Need help choosing?
            </h2>
            <p className="text-white/60 font-medium text-lg leading-relaxed">
              Message us on WhatsApp or visit No.74, Seenawatta, Aluthgama —
              Monday to Sunday, 9am to 9pm.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#C5A059] text-[#1C1C1C] px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Contact us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#C5A059]/25 rounded-full blur-[80px]" />
        </div>
      </section>
    </div>
  );
}
