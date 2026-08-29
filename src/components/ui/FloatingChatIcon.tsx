import { MessageCircle, Send, X } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function linkLabelFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("softora")) return "Softora";
    if (host.includes("wa.me") || host.includes("whatsapp")) return "WhatsApp";
    return host;
  } catch {
    return "Link";
  }
}

function normalizeAssistantLinks(content: string): string {
  let text = content;
  text = text.replace(
    /Softora\s*\(\s*https?:\/\/(?:www\.)?softora\.lk\/?\s*\)/gi,
    "[Softora](https://softora.lk)",
  );
  text = text.replace(
    /(?<!\]\()https?:\/\/(?:www\.)?softora\.lk\/?/gi,
    "[Softora](https://softora.lk)",
  );
  text = text.replace(
    /(?<!\]\()(https?:\/\/[^\s<>"'\)\]]+)/g,
    (url) => `[${linkLabelFromUrl(url)}](${url.replace(/[.,;:!?)]+$/, "")})`,
  );
  return text;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const mdLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdLink) {
      const [, label, href] = mdLink;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#996515] underline decoration-[#C5A059]/50 underline-offset-2 transition-colors hover:text-[#C5A059]"
        >
          {label}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[#1C1C1C]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type ChatProduct = {
  name: string;
  brand?: string;
  price?: string;
  stock?: string;
  category?: string;
  discount?: string;
  specs?: string;
};

function parsePipeProduct(line: string): ChatProduct | null {
  if (!line.includes("|")) return null;
  const body = line.replace(/^([-*•]|\d+\.)\s+/, "").trim();
  const parts = body.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const product: ChatProduct = { name: parts[0].replace(/\*\*/g, "").trim() };
  if (!product.name) return null;

  for (let i = 1; i < parts.length; i++) {
    const labeled = parts[i].match(/^([A-Za-z]+)\s*:\s*(.+)$/);
    if (!labeled) {
      if (/^LKR\s+/i.test(parts[i])) product.price = parts[i];
      continue;
    }
    const key = labeled[1].toLowerCase();
    const value = labeled[2].trim();
    if (key === "id" || key === "_id") continue;
    if (key === "brand") product.brand = value;
    else if (key === "price") product.price = value;
    else if (key === "stock") product.stock = value;
    else if (key === "category") product.category = value;
    else if (key === "discount") product.discount = value;
    else if (key === "specs") product.specs = value;
  }

  return product.brand || product.price || product.stock ? product : null;
}

function parseFieldBullet(line: string): { key: string; value: string } | null {
  const m = line.match(/^[-*•]\s*(Brand|Price|Stock|Category|Discount|Specs)\s*:\s*(.+)$/i);
  if (!m) return null;
  return { key: m[1].toLowerCase(), value: m[2].trim() };
}

function extractProductsFromContent(content: string): {
  intro: string[];
  products: ChatProduct[];
  outro: string[];
} {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const intro: string[] = [];
  const products: ChatProduct[] = [];
  const outro: string[] = [];
  let mode: "intro" | "products" | "outro" = "intro";
  let current: ChatProduct | null = null;

  const pushCurrent = () => {
    if (current?.name) products.push(current);
    current = null;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      if (mode === "intro") intro.push("");
      continue;
    }

    const pipeProduct = parsePipeProduct(trimmed);
    if (pipeProduct) {
      pushCurrent();
      mode = "products";
      products.push(pipeProduct);
      continue;
    }

    const numberedTitle = trimmed.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*$/);
    const boldTitle = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
    const numberedPlain = trimmed.match(/^(\d+)\.\s+(.+)$/);

    if (numberedTitle || (mode === "products" && boldTitle)) {
      pushCurrent();
      mode = "products";
      current = { name: (numberedTitle?.[2] || boldTitle?.[1] || "").trim() };
      continue;
    }

    if (numberedPlain && !parseFieldBullet(numberedPlain[2])) {
      const maybePipe = parsePipeProduct(numberedPlain[2]);
      if (maybePipe) {
        pushCurrent();
        mode = "products";
        products.push(maybePipe);
        continue;
      }
      // "1. Product Name" without bold
      if (!numberedPlain[2].includes(":")) {
        pushCurrent();
        mode = "products";
        current = { name: numberedPlain[2].replace(/\*\*/g, "").trim() };
        continue;
      }
    }

    const field = parseFieldBullet(trimmed);
    if (field && (current || mode === "products")) {
      if (!current) {
        // orphan field — skip
        continue;
      }
      if (field.key === "brand") current.brand = field.value;
      else if (field.key === "price") current.price = field.value;
      else if (field.key === "stock") current.stock = field.value;
      else if (field.key === "category") current.category = field.value;
      else if (field.key === "discount") current.discount = field.value;
      else if (field.key === "specs") current.specs = field.value;
      continue;
    }

    if (mode === "products") {
      pushCurrent();
      mode = "outro";
      outro.push(trimmed);
    } else if (mode === "outro") {
      outro.push(trimmed);
    } else {
      intro.push(trimmed);
    }
  }
  pushCurrent();

  return { intro, products, outro };
}

function ProductCards({ products }: { products: ChatProduct[] }) {
  return (
    <div className="mt-1.5 space-y-2">
      {products.map((p, i) => (
        <div
          key={`${p.name}-${i}`}
          className="rounded-xl border border-black/[0.06] bg-[#FAF9F7] px-3 py-2.5"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1C1C1C] text-[10px] font-semibold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#1C1C1C] leading-snug">{p.name}</p>
              {p.brand && (
                <p className="mt-0.5 text-[12px] font-medium text-[#5C574F]">{p.brand}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.price && (
                  <span className="rounded-full bg-[#F3EBD8] px-2 py-0.5 text-[11px] font-semibold text-[#996515]">
                    {/lkr/i.test(p.price) ? p.price : `LKR ${p.price}`}
                  </span>
                )}
                {p.stock != null && p.stock !== "" && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#5C574F] ring-1 ring-black/[0.06]">
                    Stock: {p.stock}
                  </span>
                )}
                {p.category && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#5C574F] ring-1 ring-black/[0.06]">
                    {p.category}
                  </span>
                )}
                {p.discount && p.discount !== "0" && p.discount !== "0%" && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#5C574F] ring-1 ring-black/[0.06]">
                    {p.discount.includes("%") ? p.discount : `${p.discount}% off`}
                  </span>
                )}
              </div>
              {p.specs && (
                <p className="mt-1.5 text-[11px] leading-snug text-[#5C574F]/90">{p.specs}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TextLines({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <div className="space-y-1.5 text-left">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" aria-hidden />;
        }
        return (
          <div key={i} className="leading-relaxed">
            {renderInlineMarkdown(line)}
          </div>
        );
      })}
    </div>
  );
}

function ChatMessageContent({ content }: { content: string }) {
  const normalized = normalizeAssistantLinks(content);
  const { intro, products, outro } = extractProductsFromContent(normalized);

  if (products.length > 0) {
    return (
      <div className="space-y-2 text-left">
        <TextLines lines={intro} />
        <ProductCards products={products} />
        <TextLines lines={outro} />
      </div>
    );
  }

  const lines = normalized.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className="space-y-1.5 text-left">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" aria-hidden />;
        }

        const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numbered) {
          return (
            <div key={i} className="pt-0.5 first:pt-0">
              <span className="font-semibold text-[#1C1C1C]">{numbered[1]}.</span>{" "}
              {renderInlineMarkdown(numbered[2])}
            </div>
          );
        }

        const bullet = trimmed.match(/^[-•*]\s+(.*)$/);
        if (bullet) {
          return (
            <div key={i} className="flex gap-2 pl-0.5 text-[13px] leading-snug text-[#3F3A34]">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#C5A059]" />
              <span>{renderInlineMarkdown(bullet[1])}</span>
            </div>
          );
        }

        return (
          <div key={i} className="leading-relaxed">
            {renderInlineMarkdown(line)}
          </div>
        );
      })}
    </div>
  );
}

export function FloatingChatIcon() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Trust Mobile shopping assistant. Ask me about phones, prices, or stock.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 120);
    el.style.height = `${Math.max(next, 44)}px`;
  }, [input]);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 220);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user" as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const payload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || "API Error");
      }

      const data = await response.json();
      if (data.message) {
        const content =
          typeof data.message.content === "string"
            ? data.message.content
            : data.message.content?.toString?.() ||
              "No response from assistant.";
        setMessages((prev) => [...prev, { role: "assistant", content }]);
      }

      if (
        data.action &&
        data.action.type === "navigate" &&
        typeof data.action.url === "string" &&
        data.action.url.startsWith("/product/") &&
        userMsg.content.trim().length >= 3
      ) {
        setTimeout(() => {
          navigate(data.action.url);
          setIsOpen(false);
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.message ||
            "Sorry, I am having trouble connecting to the AI server right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI assistant"
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1C1C] text-white shadow-[0_12px_32px_-12px_rgba(28,28,28,0.55)] transition-all duration-300 hover:bg-[#C5A059] hover:text-[#1C1C1C] md:bottom-10 md:right-10 ${
          isOpen
            ? "pointer-events-none scale-75 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 flex h-[min(560px,78vh)] w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_64px_-24px_rgba(28,28,28,0.35)] md:bottom-10 md:right-10"
          >
            {/* Header */}
            <div className="relative border-b border-black/[0.04] bg-[#1C1C1C] px-4 py-3.5">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/10">
                    <MessageCircle className="h-4 w-4 text-[#C5A059]" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[15px] font-semibold tracking-tight text-white">
                      Shopping Assistant
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C5A059] opacity-40" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
                      </span>
                      <span className="text-[11px] font-medium text-white/55">
                        Online · Trust Mobile
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#FAF9F7] px-3.5 py-4 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/10">
              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={`${msg.role}-${i}-${msg.content.slice(0, 24)}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-[0_1px_2px_rgba(28,28,28,0.04)] ${
                          msg.role === "user"
                            ? "rounded-2xl rounded-br-md bg-[#1C1C1C] text-white whitespace-pre-wrap"
                            : "rounded-2xl rounded-bl-md border border-black/[0.04] bg-white text-[#2A2621]"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <ChatMessageContent content={msg.content} />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-black/[0.04] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(28,28,28,0.04)]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C5A059]" />
                      <span
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C5A059]"
                        style={{ animationDelay: "160ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C5A059]"
                        style={{ animationDelay: "320ms" }}
                      />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-black/[0.05] bg-white px-3 pb-3 pt-2.5">
              <div className="flex items-end gap-2 rounded-2xl border border-black/[0.08] bg-[#FAF9F7] p-1.5 transition-colors focus-within:border-[#C5A059]/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#C5A059]/15">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about a phone, brand, or price…"
                  className="max-h-[120px] min-h-[40px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-[14px] leading-snug text-[#1C1C1C] outline-none placeholder:text-stone-400 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1C1C1C] text-white transition-all hover:bg-[#C5A059] hover:text-[#1C1C1C] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] tracking-wide text-stone-400">
                Powered by{" "}
                <a
                  href="https://softora.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#C5A059] transition-colors hover:text-[#996515]"
                >
                  Softora
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
