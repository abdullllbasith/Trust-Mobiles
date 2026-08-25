import { MessageCircle, X } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function ChatMessageContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');

  return (
    <div className="space-y-1.5 text-left">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1.5" aria-hidden />;
        }

        const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numbered) {
          return (
            <div key={i} className="pt-1 first:pt-0">
              <span className="font-semibold text-[#111]">{numbered[1]}.</span>{' '}
              {renderInlineMarkdown(numbered[2])}
            </div>
          );
        }

        const bullet = trimmed.match(/^[-•*]\s+(.*)$/);
        if (bullet) {
          return (
            <div key={i} className="pl-3 text-[13px] leading-snug text-[#333]">
              <span className="mr-1.5 text-[#888]">•</span>
              {renderInlineMarkdown(bullet[1])}
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
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AI shopping assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const payload = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'API Error');
      }

      const data = await response.json();
      if (data.message) {
        const content =
          typeof data.message.content === 'string'
            ? data.message.content
            : data.message.content?.toString?.() || 'No response from assistant.';
        setMessages(prev => [...prev, { role: 'assistant', content }]);
      }
      
      if (
        data.action &&
        data.action.type === 'navigate' &&
        typeof data.action.url === 'string' &&
        data.action.url.startsWith('/product/') &&
        userMsg.content.trim().length >= 3
      ) {
        setTimeout(() => {
          navigate(data.action.url);
          setIsOpen(false);
        }, 1500);
      }

    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error?.message || 'Sorry, I am having trouble connecting to the AI server right now.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 w-11 h-11 md:w-12 md:h-12 bg-[#111] hover:bg-[#2E75B6] text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 z-50 ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Chat Box Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-[calc(100vw-3rem)] md:w-96 h-[500px] max-h-[80vh] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-black/5 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">AI Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-[#2E75B6] rounded-full animate-pulse"></span>
                    <span className="text-white/60 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 bg-[#F7FAFC] p-6 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm shadow-sm max-w-[85%] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#111] text-white rounded-tr-sm whitespace-pre-wrap' 
                        : 'bg-white text-[#111] rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <ChatMessageContent content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-5 py-3.5 rounded-2xl rounded-tl-sm text-sm text-[#111] shadow-sm max-w-[85%] flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-black/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-[#F7FAFC] border border-transparent rounded-full px-5 py-3 text-base focus:outline-none focus:border-black/10 focus:bg-white transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-11 h-11 bg-[#111] hover:bg-[#2E75B6] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <span className="transform rotate-45 -ml-0.5 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
