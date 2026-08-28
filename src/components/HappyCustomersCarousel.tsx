import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type HappyCustomer = {
  id: string;
  name?: string;
  caption?: string;
  image: string;
};

export function HappyCustomersCarousel() {
  const [items, setItems] = useState<HappyCustomer[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/happy-customers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + items.length) % items.length);
  };

  // Show a window of cards on desktop; single focus on mobile
  const visibleCount = Math.min(items.length, 3);

  return (
    <section className="mb-24">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059] mb-2">
          Real shoppers
        </p>
        <h2 className="text-3xl lg:text-4xl font-display font-semibold text-[#111] tracking-tight">
          Happy customers
        </h2>
        <p className="text-gray-500 mt-3 font-medium max-w-xl mx-auto">
          Moments from people who shopped with Trust Mobile.
        </p>
      </div>

      <div className="relative">
        {/* Desktop strip */}
        <div className="hidden md:grid md:grid-cols-3 gap-5">
          {Array.from({ length: visibleCount }).map((_, offset) => {
            const item = items[(index + offset) % items.length];
            return (
              <motion.div
                key={`${item.id}-${offset}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="group relative overflow-hidden rounded-2xl bg-[#1C1C1C] aspect-[4/5]"
              >
                <img
                  src={item.image}
                  alt={item.name || "Happy customer"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {(item.name || item.caption) && (
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {item.name && (
                      <p className="font-display text-lg font-semibold">
                        {item.name}
                      </p>
                    )}
                    {item.caption && (
                      <p className="mt-1 text-sm text-white/80">{item.caption}</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile single slide */}
        <div className="md:hidden relative overflow-hidden rounded-2xl aspect-[4/5] bg-[#1C1C1C]">
          <AnimatePresence mode="wait">
            <motion.div
              key={items[index].id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <img
                src={items[index].image}
                alt={items[index].name || "Happy customer"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {(items[index].name || items[index].caption) && (
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  {items[index].name && (
                    <p className="font-display text-lg font-semibold">
                      {items[index].name}
                    </p>
                  )}
                  {items[index].caption && (
                    <p className="mt-1 text-sm text-white/80">
                      {items[index].caption}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              className="rounded-full border border-black/10 bg-white p-2.5 text-[#1C1C1C] hover:border-[#C5A059] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-[#C5A059]"
                      : "w-1.5 bg-stone-300 hover:bg-stone-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              className="rounded-full border border-black/10 bg-white p-2.5 text-[#1C1C1C] hover:border-[#C5A059] transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
