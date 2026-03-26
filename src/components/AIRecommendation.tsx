import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';
import { getFlavorRecommendation, ChatMessage } from '../geminiService.ts';
import { PRODUCTS } from '../constants.ts';
import { Product } from '../types.ts';

interface AIRecommendationProps {
  onSelectProduct: (product: Product) => void;
}

const QUICK_CHIPS = [
  "Suggest some mukhwas 🌿",
  "Best for gifting 🎁",
  "Healthy snack options 💚",
  "Something sweet 🍬",
  "What's your bestseller? ⭐",
];

// Extract product names mentioned in AI response and match to real products
const extractProducts = (text: string): Product[] => {
  const found: Product[] = [];
  PRODUCTS.forEach(p => {
    // Match exact product name (case-insensitive)
    if (text.toLowerCase().includes(p.name.toLowerCase())) {
      if (!found.find(f => f.id === p.id)) found.push(p);
    }
  });
  return found.slice(0, 4);
};

// Strip markdown bold markers for display
const formatText = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, '$1');

const AIRecommendation: React.FC<AIRecommendationProps> = ({ onSelectProduct }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [history, setHistory] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleSend = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setInput('');

    // Check for direct product match first
    const directMatch = PRODUCTS.find(p =>
      trimmed.toLowerCase() === p.name.toLowerCase() ||
      (trimmed.length > 3 && p.name.toLowerCase().includes(trimmed.toLowerCase()))
    );

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setHistory(prev => [...prev, userMsg]);
    setLoading(true);

    if (directMatch) {
      // Short pause then open product
      await new Promise(r => setTimeout(r, 400));
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: `Found it! Opening **${directMatch.name}** for you right now ✨`
      };
      setHistory(prev => [...prev, assistantMsg]);
      setLoading(false);
      setTimeout(() => {
        onSelectProduct(directMatch);
      }, 600);
      return;
    }

    try {
      const prevHistory = [...history, userMsg];
      const result = await getFlavorRecommendation(trimmed, prevHistory);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: result || "I'm having a moment! How about trying our famous Chatpati Mango? 🥭"
      };
      setHistory(prev => [...prev, assistantMsg]);
    } catch {
      setHistory(prev => [...prev, {
        role: 'assistant',
        text: "Oops, something went wrong! Try asking again 🙏"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHistory([{
      role: 'assistant',
      text: "Namaste! 🙏 I'm Amie's Flavor Assistant. Tell me what you're craving, ask for gifting ideas, or tap a suggestion below!"
    }]);
  };

  const handleClose = () => {
    setIsOpen(false);
    setHistory([]);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-[2rem] shadow-2xl w-[22rem] sm:w-[26rem] flex flex-col border border-[#4A3728]/10 overflow-hidden"
          style={{ maxHeight: '80vh' }}>

          {/* Header */}
          <div className="bg-[#F14E4E] px-5 py-4 flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Flavor Assistant</h4>
                <p className="text-[9px] opacity-70 uppercase tracking-widest">Powered by Gemini AI</p>
              </div>
            </div>
            <button onClick={handleClose} className="hover:bg-black/10 p-1.5 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[200px]">
            {history.map((msg, i) => {
              const isUser = msg.role === 'user';
              const matchedProducts = !isUser ? extractProducts(msg.text) : [];
              return (
                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] space-y-2`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#F14E4E] text-white rounded-br-sm'
                        : 'bg-[#FFF8EE] text-[#4A3728] rounded-bl-sm border border-[#4A3728]/8'
                    }`}>
                      {formatText(msg.text)}
                    </div>
                    {/* Product chips from AI response */}
                    {matchedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {matchedProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { onSelectProduct(p); handleClose(); }}
                            className="text-[10px] font-bold brand-rounded uppercase tracking-wide px-3 py-1.5 bg-white border-2 border-[#F14E4E]/30 text-[#F14E4E] rounded-full hover:bg-[#F14E4E] hover:text-white transition-all shadow-sm"
                          >
                            {p.name} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#FFF8EE] border border-[#4A3728]/8 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#F14E4E]" />
                  <span className="text-[11px] text-[#4A3728]/60 italic">Amie is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips — only show when only greeting visible */}
          {history.length <= 1 && !loading && (
            <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="text-[10px] font-bold brand-rounded px-3 py-1.5 bg-[#FFF8EE] border border-[#F14E4E]/20 text-[#4A3728]/70 rounded-full hover:border-[#F14E4E]/60 hover:text-[#F14E4E] transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-[#4A3728]/8 bg-white flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything about our treats..."
                className="w-full pl-4 pr-12 py-3 bg-[#4A3728]/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F14E4E]/20 text-[#4A3728]"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#F14E4E] text-white rounded-xl hover:bg-[#d43d3d] transition-colors shadow disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={handleOpen}
          className="w-16 h-16 bg-[#F14E4E] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#F14E4E]/40 hover:scale-110 transition-transform duration-300 group relative"
        >
          <Sparkles size={26} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 bg-[#FFEB3B] text-[#F14E4E] px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm border border-[#F14E4E]/10">
            AI
          </div>
        </button>
      )}
    </div>
  );
};

export default AIRecommendation;
