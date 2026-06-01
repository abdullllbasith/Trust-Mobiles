import { motion } from "framer-motion";
import { ArrowRight, Smartphone, CheckCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function TradeIn() {
  return (
    <div className="flex-1 bg-[var(--bg-color)] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#111] text-white overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40 rounded-b-[4rem] px-4 md:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2FA84F]/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-white/10 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full inline-flex items-center gap-2 mb-8 backdrop-blur-md">
              <RefreshCw className="w-3.5 h-3.5" /> Fast & Easy Returns
            </span>
            <h1 className="text-5xl md:text-8xl font-display font-medium tracking-tight mb-8">
              Upgrade to
              <br />
              the future.
            </h1>
            <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto mb-12">
              Trade in your eligible smartphone, tablet, or smartwatch, and get
              up to LKR 800 credit toward the latest flagship devices.
            </p>
            <button className="bg-white text-[#111] hover:bg-[#2FA84F] hover:text-white px-10 py-5 rounded-full font-semibold text-lg transition-colors shadow-2xl transform hover:scale-105">
              Find Your Device Value
            </button>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-medium text-[#111]">
            How it works?
          </h2>
          <p className="text-gray-500 font-medium mt-4">
            Three simple steps to upgrade your tech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              step: "01",
              title: "Get an estimate",
              desc: "Select your device model and its condition to get an instant estimated trade-in value online.",
            },
            {
              step: "02",
              title: "Send it to us",
              desc: "We'll send you a free, pre-paid shipping kit. Just pack up your device and drop it off.",
            },
            {
              step: "03",
              title: "Receive credit",
              desc: "Once we inspect it, you get an instant credit towards your new purchase or a digital gift card.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-10 flex flex-col items-center text-center rounded-[3rem] shadow-sm border border-black/5 relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 text-[100px] font-display font-bold text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none select-none z-0">
                {item.step}
              </div>
              <div className="relative z-10 pb-4">
                <div className="text-sm font-bold text-[#2FA84F] mb-4 bg-[#2FA84F]/10 px-4 py-2 rounded-full inline-block">
                  Step {item.step}
                </div>
                <h3 className="text-2xl font-display font-semibold text-[#111] mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Trade-Ins */}
      <section className="bg-gray-50 py-24 border-y border-black/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-[#111]">
              Popular Trade-in Values
            </h2>
            <Link
              to="/shop"
              className="text-[#111] font-semibold flex items-center gap-2 hover:text-[#2FA84F] transition-colors"
            >
              Shop New Devices <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "iPhone 14 Pro Max", val: "Up to LKR 650" },
              { name: "Samsung Galaxy S23 Ultra", val: "Up to LKR 600" },
              { name: "Google Pixel 7 Pro", val: "Up to LKR 400" },
              { name: "iPhone 13", val: "Up to LKR 350" },
            ].map((device, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm text-center hover:shadow-md transition-shadow"
              >
                <Smartphone className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                <h4 className="font-semibold text-[#111] mb-2">
                  {device.name}
                </h4>
                <p className="text-[#2FA84F] font-bold text-lg">{device.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
