import React from 'react';
import { MessageSquare, Send, Sparkles, X, Loader2, CheckCircle } from 'lucide-react';
import { getFlavorRecommendation } from '../geminiService';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface AIRecommendationProps {
  onSelectProduct: (product: Product) => void;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({ onSelectProduct }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [response, setResponse] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [matchedProduct, setMatchedProduct] = React.useState<Product | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim().toLowerCase();
    if (!query || loading) return;

    setLoading(true);
    setResponse(null);
    setMatchedProduct(null);

    // 1. Try Direct Matching first 
    // We only trigger direct match if the query isn't just a category name
    const categories = ['mukhwas', 'snack', 'sweet', 'masala', 'traditional sweets'];
    const isCategoryQuery = categories.some(cat => query.includes(cat));

    const directMatch = !isCategoryQuery ? PRODUCTS.find(p => 
      query === p.name.toLowerCase() || 
      (query.length > 3 && p.name.toLowerCase().includes(query))
    ) : null;

    if (directMatch) {
      setMatchedProduct(directMatch);
      setLoading(false);
      // Brief delay to show the match before opening
      setTimeout(() => {
        onSelectProduct(directMatch);
        setIsOpen(false);
        setInput('');
        setMatchedProduct(null);
      }, 800);
      return;
    }

    // 2. Fallback to AI Recommendation (e.g. for "Suggest some mukhwas")
    try {
      const result = await getFlavorRecommendation(input);
      setResponse(result || "I'm having trouble thinking of a treat right now. How about trying our famous Chatpati Mango?");
    } catch (error) {
      console.error("AI Error:", error);
      setResponse("I couldn't get a recommendation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-[2rem] shadow-2xl w-80 sm:w-96 flex flex-col border border-[#4A3728]/10 overflow-hidden animate-fade-in-up">
          <div className="bg-[#F14E4E] p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Flavor Assistant</h4>
                <p className="text-[10px] opacity-80 uppercase tracking-widest">ASK FOR TREATS!</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-6 min-h-[220px] max-h-[450px] overflow-y-auto space-y-4 flex flex-col">
            {!response && !loading && !matchedProduct && (
              <div className="text-center py-6 space-y-4 animate-fade-in my-auto">
                <p className="text-sm text-[#4A3728] font-bold leading-relaxed serif">
                  "Type any product name like 'Roasted Chevda' to go to it directly!"
                </p>
                <div className="h-px w-12 bg-coral/20 mx-auto"></div>
                <p className="text-[11px] text-[#4A3728]/60 leading-relaxed italic">
                  Or ask me to recommend at least 3 treats from your favorite category!
                </p>
              </div>
            )}
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-4 my-auto">
                <Loader2 size={32} className="animate-spin text-[#F14E4E]" />
                <p className="text-[10px] uppercase tracking-widest text-[#F14E4E] font-bold">Consulting with Amie...</p>
              </div>
            )}

            {matchedProduct && (
              <div className="flex flex-col items-center justify-center py-10 gap-4 animate-bounce my-auto">
                <CheckCircle size={40} className="text-green-500" />
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest font-black text-green-600 mb-1">Found a match!</p>
                  <p className="text-lg font-bold text-[#4A3728] serif">Opening {matchedProduct.name}...</p>
                </div>
              </div>
            )}
            
            {response && (
              <div className="bg-[#FDFBF7] p-5 rounded-2xl border-l-4 border-[#F14E4E] shadow-sm animate-fade-in">
                <div className="text-sm text-[#4A3728] leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-[#4A3728]/10 bg-white">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Product name or cravings..."
                className="w-full pl-4 pr-12 py-4 bg-[#4A3728]/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F14E4E]/20"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#F14E4E] text-white rounded-xl hover:bg-[#d43d3d] transition-colors shadow-lg disabled:opacity-50"
                disabled={loading || !!matchedProduct}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#F14E4E] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#F14E4E]/40 hover:scale-110 transition-transform duration-300 group"
        >
          <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 bg-[#FFEB3B] text-[#F14E4E] px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm border border-[#F14E4E]/10">AI</div>
        </button>
      )}
    </div>
  );
};

export default AIRecommendation;