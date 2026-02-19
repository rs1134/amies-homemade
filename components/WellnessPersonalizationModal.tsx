import React, { useState, useMemo } from 'react';
import { X, Check, RotateCcw, Package as JarIcon, Sparkles, TrendingUp } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Category } from '../types';

export interface WellnessFlavor {
  id: string;
  name: string;
  tagline: string;
  image: string;
}

interface Tier {
  id: number;
  label: string;
  description: string;
  price: number;
  popular?: boolean;
}

const TIERS: Tier[] = [
  { id: 2, label: '2 Jar Hamper', description: 'A petite, intimate collection. Perfect for personal gifting.', price: 650 },
  { id: 4, label: '4 Jar Hamper', description: 'Our most popular pick. A well-rounded artisanal selection.', price: 1250, popular: true },
  { id: 6, label: '6 Jar Hamper', description: 'The grand collection. A luxurious gift for special celebrations.', price: 1850 },
];

interface WellnessPersonalizationModalProps {
  onClose: () => void;
  onConfirm: (finalNames: string[], totalPrice: number) => void;
}

const WellnessPersonalizationModal: React.FC<WellnessPersonalizationModalProps> = ({ onClose, onConfirm }) => {
  const [selectedTier, setSelectedTier] = useState<Tier>(TIERS[1]); // Default to 4 jars
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const mukhwasFlavors = useMemo(() => {
    const flattened: WellnessFlavor[] = [];
    PRODUCTS.filter(p => p.category === Category.MUKHWAS).forEach(p => {
      if (p.subOptions) {
        p.subOptions.forEach((opt, idx) => {
          flattened.push({
            id: `${p.id}-${idx}`,
            name: opt.name,
            tagline: p.description,
            image: p.image
          });
        });
      } else {
        flattened.push({
          id: p.id,
          name: p.name,
          tagline: p.description,
          image: p.image
        });
      }
    });
    return flattened;
  }, []);

  const toggleFlavor = (id: string) => {
    if (selectedFlavors.includes(id)) {
      setSelectedFlavors(prev => prev.filter(f => f !== id));
    } else if (selectedFlavors.length < selectedTier.id) {
      setSelectedFlavors(prev => [...prev, id]);
    }
  };

  const handleTierChange = (tier: Tier) => {
    setSelectedTier(tier);
    if (selectedFlavors.length > tier.id) {
      setSelectedFlavors(prev => prev.slice(0, tier.id));
    }
  };

  const handleReset = () => {
    setSelectedTier(TIERS[1]);
    setSelectedFlavors([]);
  };

  const isComplete = selectedFlavors.length === selectedTier.id;

  const handleConfirm = () => {
    const names = mukhwasFlavors.filter(f => selectedFlavors.includes(f.id)).map(f => f.name);
    onConfirm(names, selectedTier.price);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#2A1E14]/85 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-[#FFF8EE] w-full max-w-5xl h-[95vh] sm:h-[92vh] rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="p-6 sm:p-10 flex items-center justify-between border-b border-[#C9A84C]/10 bg-white/40 backdrop-blur-md z-30 shrink-0">
          <div className="pr-4">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles size={20} className="text-[#C9A84C]" />
              <h2 className="text-xl sm:text-3xl font-bold serif text-[#4A3728]">Curate Your Collection</h2>
            </div>
            <p className="text-[10px] sm:text-xs font-black brand-rounded text-coral uppercase tracking-widest">Handpick your jars for a perfect Wellness Hamper</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/50 rounded-full hover:bg-coral/10 text-[#4A3728] transition-colors border border-coral/5 flex-shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-16 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* STEP 1: Tier Selection */}
          <section>
            <div className="mb-8">
              <span className="text-[10px] font-black brand-rounded text-[#C9A84C] uppercase tracking-[0.2em] mb-2 block">Step 01</span>
              <h3 className="text-xl sm:text-2xl font-bold serif text-[#4A3728]">Select Hamper Size</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => handleTierChange(tier)}
                  className={`relative text-left p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col h-full group ${selectedTier.id === tier.id ? 'bg-[#C9A84C]/5 border-[#C9A84C] ring-4 ring-[#C9A84C]/5 shadow-xl' : 'bg-white border-coral/5 hover:border-coral/20 hover:shadow-lg'}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-8 px-4 py-1.5 bg-[#C9A84C] text-white text-[9px] font-black brand-rounded uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                      <TrendingUp size={12} /> Popular
                    </div>
                  )}
                  <h4 className={`text-lg font-bold brand-rounded uppercase mb-3 ${selectedTier.id === tier.id ? 'text-[#C9A84C]' : 'text-[#4A3728]'}`}>
                    {tier.label}
                  </h4>
                  <p className="text-xs text-[#4A3728]/60 leading-relaxed mb-6 flex-1">
                    {tier.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black text-[#4A3728]">₹{tier.price}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${selectedTier.id === tier.id ? 'bg-[#C9A84C] border-[#C9A84C] text-white scale-110 shadow-lg' : 'border-[#4A3728]/10 text-[#4A3728]/10 group-hover:border-coral/20'}`}>
                      <Check size={18} strokeWidth={3} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* STEP 2: Flavor Picking */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
              <div>
                <span className="text-[10px] font-black brand-rounded text-[#C9A84C] uppercase tracking-[0.2em] mb-2 block">Step 02</span>
                <h3 className="text-xl sm:text-2xl font-bold serif text-[#4A3728]">Pick Your Flavors</h3>
                <p className="text-xs text-[#4A3728]/40 brand-rounded mt-1">Select {selectedTier.id} exotic glass jars</p>
              </div>
              <div className={`px-6 py-3 rounded-2xl border-2 brand-rounded text-xs font-bold uppercase transition-all flex items-center gap-3 w-fit ${isComplete ? 'bg-green-50 border-green-200 text-green-600' : 'bg-coral/5 border-coral/10 text-coral'}`}>
                <JarIcon size={16} />
                {selectedFlavors.length} of {selectedTier.id} jars filled
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {mukhwasFlavors.map(flavor => {
                const isSelected = selectedFlavors.includes(flavor.id);
                const disabled = !isSelected && isComplete;
                return (
                  <button
                    key={flavor.id}
                    disabled={disabled}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={`text-left flex flex-col bg-white rounded-[2rem] overflow-hidden border-2 transition-all duration-300 relative group h-full ${isSelected ? 'border-[#C9A84C] shadow-2xl shadow-[#C9A84C]/10 ring-4 ring-[#C9A84C]/5' : 'border-transparent shadow-sm hover:border-coral/20'} ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-cream p-2">
                      <img src={flavor.image} alt={flavor.name} className={`w-full h-full object-cover rounded-2xl transition-transform duration-700 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className={`text-[11px] font-bold brand-rounded uppercase mb-1 leading-tight ${isSelected ? 'text-[#C9A84C]' : 'text-[#4A3728]'}`}>{flavor.name}</h4>
                      <p className="text-[9px] text-[#4A3728]/50 italic leading-snug line-clamp-2">{flavor.tagline}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-[#C9A84C] text-white p-1.5 rounded-full shadow-lg z-10 border-2 border-white">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Summary Footer */}
        <div className="p-6 sm:p-10 bg-white/95 backdrop-blur-2xl border-t border-coral/5 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row items-center gap-6 sm:gap-10 z-30 shrink-0">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left w-full lg:w-auto">
            <div className="flex items-center gap-4 p-4 bg-[#C9A84C]/10 rounded-[2rem] border border-[#C9A84C]/10 min-w-[150px] sm:min-w-[180px] justify-center sm:justify-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center text-[#C9A84C] shadow-sm flex-shrink-0">
                <JarIcon size={24} />
              </div>
              <div>
                <span className="text-[9px] font-black brand-rounded uppercase text-[#4A3728]/40 tracking-widest">Selection</span>
                <p className="text-xs font-bold text-[#4A3728] whitespace-nowrap">{selectedTier.label}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-wrap justify-center sm:justify-start gap-1.5 max-h-20 overflow-y-auto px-2">
              {selectedFlavors.length > 0 ? (
                selectedFlavors.map(id => {
                  const f = mukhwasFlavors.find(x => x.id === id);
                  return f ? (
                    <span key={id} className="px-3 py-1.5 bg-coral/5 text-coral rounded-full text-[8px] font-bold uppercase brand-rounded border border-coral/10 animate-in fade-in zoom-in duration-300">
                      {f.name}
                    </span>
                  ) : null;
                })
              ) : (
                <p className="text-[9px] font-black brand-rounded text-[#4A3728]/30 uppercase tracking-[0.1em]">Pick your flavors above</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="text-center sm:text-right">
              <span className="text-[9px] font-black brand-rounded text-[#4A3728]/30 uppercase tracking-widest">Grand Total</span>
              <p className="text-3xl font-black text-coral">₹{selectedTier.price}</p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={handleReset} className="p-5 border-2 border-coral/10 text-[#4A3728]/40 rounded-[1.5rem] hover:text-coral hover:bg-coral/5 transition-all">
                <RotateCcw size={18} />
              </button>
              <button
                disabled={!isComplete}
                onClick={handleConfirm}
                className={`flex-1 sm:flex-none px-10 py-5 rounded-[1.5rem] text-[11px] font-black uppercase brand-rounded tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${isComplete ? 'bg-coral text-white shadow-coral/30 hover:scale-105 active:scale-95' : 'bg-[#4A3728]/10 text-[#4A3728]/30 cursor-not-allowed shadow-none'}`}
              >
                {isComplete ? 'Add to Bag' : `Fill ${selectedTier.id - selectedFlavors.length} jars`} <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessPersonalizationModal;