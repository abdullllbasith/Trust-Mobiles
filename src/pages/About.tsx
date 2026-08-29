import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Headphones,
  Award,
  Store,
} from "lucide-react";

export default function About() {
  return (
    <div className="flex-1 bg-[var(--bg-color)] min-h-screen pt-12 pb-24">
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-medium text-[#111] tracking-tight mb-6">
            We are <span className="text-[#C5A059]">Trust Mobile</span>.
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Your premier destination for authentic, world-class mobile
            technology. We partner with the globe's top tech giants to bring the
            latest innovations directly to you.
          </p>
        </motion.div>
      </section>

      {/* Grid Image Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">
          <div className="md:col-span-2 rounded-[2rem] overflow-hidden relative group">
            <img
              src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=1200"
              alt="Apple Store display"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex-1 rounded-[2rem] overflow-hidden relative group bg-[#f0f0f0]">
              <img
                src="https://images.unsplash.com/photo-1610945265064-3201021bc1e0?auto=format&fit=crop&q=80&w=600"
                alt="Phones"
                className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="h-48 bg-[#111] rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#C5A059] rounded-full blur-[40px] opacity-20"></div>
              <h3 className="text-white text-3xl font-display font-medium mb-2">
                10+ Years
              </h3>
              <p className="text-gray-400 font-medium">
                Of excellence in tech retail
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-24 mb-20 border-y border-black/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-[#111]">
              Our Commitment
            </h2>
            <p className="text-gray-500 font-medium mt-4 max-w-lg mx-auto">
              Why thousands of customers choose Trust Mobile as their trusted
              tech provider.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: <Award />,
                title: "Authorized Reseller",
                desc: "100% genuine products sourced directly from manufacturers like Apple, Samsung, and Google.",
              },
              {
                icon: <ShieldCheck />,
                title: "Official Warranty",
                desc: "Every device comes with full brand warranty and our own 30-day return guarantee.",
              },
              {
                icon: <Headphones />,
                title: "Expert Support",
                desc: "Our tech gurus are ready to help you set up, troubleshoot, or choose the perfect device.",
              },
              {
                icon: <Store />,
                title: "Physical Locations",
                desc: "Visit our premium retail spaces across the country to experience the tech before buying.",
              },
              {
                icon: <Truck />,
                title: "Express Delivery",
                desc: "Next-day delivery available on all flagship devices for orders placed before 4 PM.",
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center text-[#C5A059] shadow-sm mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-display font-semibold text-[#111] mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
