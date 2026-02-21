import React, { useState, useMemo } from 'react';
import { X, Check, RotateCcw, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Category } from '../types';

interface SweetMemoriesModalProps {
  onClose: () => void;
  onConfirm: (finalNames: string[]) => void;
  maxVarieties: number;
}

const SweetMemoriesModal: React.FC<SweetMemoriesModalProps> = ({ onClose, onConfirm, maxVarieties }) => {
  // Lock body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Extract all traditional sweets from the products list, flattening varieties
  const sweetOptions = useMemo(() => {
    const flattened: any[] = [];
    PRODUCTS.filter(p => p.category === Category.SWEETS).forEach(p => {
      if (p.subOptions) {
        p.subOptions.forEach((opt, idx) => {
          flattened.push({
            id: `${p.id}-${idx}`,
            name: opt.name,
            description: p.description,
            image: p.image,
            ingredients: p.ingredients
          });
        });
      } else {
        flattened.push({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image,
          ingredients: p.ingredients
        });
      }
    });
    return flattened;
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else if (selectedIds.length < maxVarieties) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleReset = () => {
    setSelectedIds([]);
  };

  const handleConfirm = () => {
    const selectedNames = sweetOptions
      .filter(o => selectedIds.includes(o.id))
      .map(o => o.name);
    onConfirm(selectedNames);
  };

  const isComplete = selectedIds.length > 0;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#2A1E14]/85 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-[#FFF8EE] w-full max-w-5xl h-[95vh] sm:h-[92vh] rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="p-6 sm:p-10 flex items-center justify-between border-b border-[#C9A84C]/10 bg-white/60 backdrop-blur-md z-30 shrink-0">
          <div className="pr-4">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles size={20} className="text-[#C9A84C]" />
              <h2 className="text-xl sm:text-3xl font-bold serif text-[#4A3728]">Build Your Platter</h2>
            </div>
            <p className="text-[10px] sm:text-xs font-black brand-rounded text-coral uppercase tracking-widest">
              Select up to {maxVarieties} varieties for your box
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/50 rounded-full hover:bg-coral/10 text-[#4A3728] transition-colors border border-coral/5 flex-shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-10 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
             <h3 className="text-xl font-bold serif text-[#4A3728]">Our Finest Traditional Bites</h3>
             <div className={`px-4 py-2 rounded-xl text-[10px] font-black brand-rounded uppercase tracking-widest border-2 w-fit ${selectedIds.length === maxVarieties ? 'bg-green-50 border-green-100 text-green-600' : 'bg-coral/5 border-coral/10 text-coral'}`}>
                {selectedIds.length} of {maxVarieties} Selected
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-4">
            {sweetOptions.map(sweet => {
              const isSelected = selectedIds.includes(sweet.id);
              const isDisabled = !isSelected && selectedIds.length >= maxVarieties;
              return (
                <button
                  key={sweet.id}
                  disabled={isDisabled}
                  onClick={() => toggleSelection(sweet.id)}
                  className={`text-left flex flex-col bg-white rounded-[2.5rem] overflow-hidden border-2 transition-all duration-300 relative group h-full ${isSelected ? 'border-[#C9A84C] shadow-xl ring-4 ring-[#C9A84C]/5' : 'border-coral/5 hover:border-coral/20 hover:shadow-lg'} ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-cream p-2">
                    <img src={sweet.image} alt={sweet.name} className={`w-full h-full object-cover rounded-2xl transition-transform duration-700 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className={`text-[10px] font-bold brand-rounded uppercase mb-2 ${isSelected ? 'text-[#C9A84C]' : 'text-[#4A3728]'}`}>{sweet.name}</h4>
                    <p className="text-[9px] text-[#4A3728]/50 leading-relaxed mb-4 flex-1 line-clamp-3">{sweet.description}</p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                       {sweet.ingredients.slice(0, 2).map((ing: string, i: number) => (
                         <span key={i} className="text-[7px] bg-[#F6C94C]/10 text-[#4A3728]/70 px-2 py-0.5 rounded-full">• {ing}</span>
                       ))}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-[#C9A84C] text-white p-1.5 rounded-full shadow-lg z-10 border-2 border-white">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-10 bg-white/95 backdrop-blur-2xl border-t border-coral/5 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] flex flex-row items-center justify-between gap-4 z-30 shrink-0">
           <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-black brand-rounded uppercase text-[#4A3728]/40 hover:text-coral transition-colors">
              <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
           </button>
           <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button onClick={onClose} className="hidden sm:block px-8 py-4 border-2 border-coral/10 text-[#4A3728]/60 rounded-2xl text-[10px] font-black uppercase brand-rounded tracking-widest hover:bg-coral/5">
                 Cancel
              </button>
              <button 
                onClick={handleConfirm}
                disabled={!isComplete}
                className={`flex-1 sm:flex-none px-6 sm:px-10 py-4 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase brand-rounded tracking-widest shadow-2xl transition-all flex items-center gap-2 justify-center ${isComplete ? 'bg-coral text-white shadow-coral/30 hover:scale-105' : 'bg-[#4A3728]/10 text-[#4A3728]/30 cursor-not-allowed'}`}
              >
                {isComplete ? 'Confirm' : 'Select'} <Check size={16} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SweetMemoriesModal;