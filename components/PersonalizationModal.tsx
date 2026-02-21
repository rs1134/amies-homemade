import React, { useState, useMemo } from 'react';
import { X, Check, RotateCcw, Box, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Category } from '../types';

export interface GiftingOption {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface PersonalizationModalProps {
  onClose: () => void;
  onConfirm: (finalNames: string[]) => void;
}

const PersonalizationModal: React.FC<PersonalizationModalProps> = ({ onClose, onConfirm }) => {
  // Lock body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Helper to flatten products into individual selectable varieties
  const getFlattenedOptions = (category: Category) => {
    const categoryProducts = PRODUCTS.filter(p => p.category === category);
    const flattened: GiftingOption[] = [];
    
    categoryProducts.forEach(p => {
      if (p.subOptions) {
        p.subOptions.forEach((opt, idx) => {
          flattened.push({
            id: `${p.id}-${idx}`,
            name: opt.name,
            description: p.description,
            image: p.image
          });
        });
      } else {
        flattened.push({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image
        });
      }
    });
    return flattened;
  };

  const mukhwasOptions = useMemo(() => getFlattenedOptions(Category.MUKHWAS), []);
  const mithaiOptions = useMemo(() => getFlattenedOptions(Category.SWEETS), []);
  const snackOptions = useMemo(() => getFlattenedOptions(Category.SNACKS), []);

  const [selectedMukhwas, setSelectedMukhwas] = useState<string[]>([]);
  const [selectedMithai, setSelectedMithai] = useState<string[]>([]);
  const [selectedSnacks, setSelectedSnacks] = useState<string[]>([]);

  const toggleSelection = (id: string, current: string[], setter: (val: string[]) => void, limit: number) => {
    if (current.includes(id)) {
      setter(current.filter(i => i !== id));
    } else if (current.length < limit) {
      setter([...current, id]);
    }
  };

  const isFull = (current: string[], limit: number) => current.length === limit;

  const handleReset = () => {
    setSelectedMukhwas([]);
    setSelectedMithai([]);
    setSelectedSnacks([]);
  };

  const handleConfirm = () => {
    const allSelectedNames = [
      ...mukhwasOptions.filter(o => selectedMukhwas.includes(o.id)).map(o => o.name),
      ...mithaiOptions.filter(o => selectedMithai.includes(o.id)).map(o => o.name),
      ...snackOptions.filter(o => selectedSnacks.includes(o.id)).map(o => o.name)
    ];
    onConfirm(allSelectedNames);
  };

  const canConfirm = isFull(selectedMukhwas, 4) && isFull(selectedMithai, 1) && isFull(selectedSnacks, 2);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#2A1E14]/85 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-[#FFF8EE] w-full max-w-6xl h-[95vh] sm:h-[92vh] rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header */}
        <div className="p-6 sm:p-10 flex items-center justify-between border-b border-[#C9A84C]/10 bg-white/80 backdrop-blur-md z-30 shrink-0">
          <div className="pr-4">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles size={20} className="text-[#C9A84C]" />
              <h2 className="text-xl sm:text-3xl font-bold serif text-[#4A3728]">Personalize Your Heritage Box</h2>
            </div>
            <p className="text-[10px] sm:text-xs font-black brand-rounded text-coral uppercase tracking-widest">Select your signature treats for each slot</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/50 rounded-full hover:bg-coral/10 text-[#4A3728] transition-colors border border-coral/5 flex-shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-16 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Mukhwas Category */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-[10px] font-black brand-rounded text-[#C9A84C] uppercase tracking-[0.2em] mb-2 block">Part 01</span>
                <h3 className="text-xl sm:text-2xl font-bold serif text-[#4A3728]">Signature Mukhwas</h3>
                <p className="text-xs text-[#4A3728]/50 brand-rounded">Choose exactly 4 jars for your digestive delight</p>
              </div>
              <div className={`px-6 py-3 rounded-2xl border-2 brand-rounded text-xs font-bold uppercase transition-all flex items-center gap-3 w-fit ${isFull(selectedMukhwas, 4) ? 'bg-green-50 border-green-200 text-green-600' : 'bg-coral/5 border-coral/10 text-coral'}`}>
                {selectedMukhwas.length}/4 Jars Filled
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {mukhwasOptions.map(opt => {
                const isSelected = selectedMukhwas.includes(opt.id);
                const disabled = !isSelected && isFull(selectedMukhwas, 4);
                return (
                  <button
                    key={opt.id}
                    disabled={disabled}
                    onClick={() => toggleSelection(opt.id, selectedMukhwas, setSelectedMukhwas, 4)}
                    className={`text-left flex flex-col bg-white rounded-[2rem] overflow-hidden border-2 transition-all duration-300 relative group h-full ${isSelected ? 'border-[#C9A84C] shadow-2xl ring-4 ring-[#C9A84C]/5' : 'border-transparent hover:border-coral/20'} ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-cream/30 p-2">
                      <img src={opt.image} alt={opt.name} className={`w-full h-full object-cover rounded-2xl transition-transform duration-700 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className={`text-[11px] font-bold brand-rounded uppercase mb-1 ${isSelected ? 'text-[#C9A84C]' : 'text-[#4A3728]'}`}>{opt.name}</h4>
                      <p className="text-[9px] text-[#4A3728]/50 leading-tight italic line-clamp-2">{opt.description}</p>
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

          {/* Mithai Category */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-[10px] font-black brand-rounded text-[#C9A84C] uppercase tracking-[0.2em] mb-2 block">Part 02</span>
                <h3 className="text-xl sm:text-2xl font-bold serif text-[#4A3728]">Traditional Mithai</h3>
                <p className="text-xs text-[#4A3728]/50 brand-rounded">Choose 1 sweet centerpiece</p>
              </div>
              <div className={`px-6 py-3 rounded-2xl border-2 brand-rounded text-xs font-bold uppercase transition-all flex items-center gap-3 w-fit ${isFull(selectedMithai, 1) ? 'bg-green-50 border-green-200 text-green-600' : 'bg-coral/5 border-coral/10 text-coral'}`}>
                {selectedMithai.length}/1 Mithai Selected
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {mithaiOptions.map(opt => {
                const isSelected = selectedMithai.includes(opt.id);
                const disabled = !isSelected && isFull(selectedMithai, 1);
                return (
                  <button
                    key={opt.id}
                    disabled={disabled}
                    onClick={() => toggleSelection(opt.id, selectedMithai, setSelectedMithai, 1)}
                    className={`text-left flex flex-col bg-white rounded-[2rem] overflow-hidden border-2 transition-all duration-300 relative group h-full ${isSelected ? 'border-[#C9A84C] shadow-2xl ring-4 ring-[#C9A84C]/5' : 'border-transparent hover:border-coral/20'} ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-cream/30 p-2">
                      <img src={opt.image} alt={opt.name} className={`w-full h-full object-cover rounded-2xl transition-transform duration-700 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className={`text-[11px] font-bold brand-rounded uppercase mb-1 ${isSelected ? 'text-[#C9A84C]' : 'text-[#4A3728]'}`}>{opt.name}</h4>
                      <p className="text-[9px] text-[#4A3728]/50 leading-tight italic line-clamp-2">{opt.description}</p>
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

          {/* Snacks Category */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-[10px] font-black brand-rounded text-[#C9A84C] uppercase tracking-[0.2em] mb-2 block">Part 03</span>
                <h3 className="text-xl sm:text-2xl font-bold serif text-[#4A3728]">Savory Snacks</h3>
                <p className="text-xs text-[#4A3728]/50 brand-rounded">Choose 2 crunchy delights</p>
              </div>
              <div className={`px-6 py-3 rounded-2xl border-2 brand-rounded text-xs font-bold uppercase transition-all flex items-center gap-3 w-fit ${isFull(selectedSnacks, 2) ? 'bg-green-50 border-green-200 text-green-600' : 'bg-coral/5 border-coral/10 text-coral'}`}>
                {selectedSnacks.length}/2 Snacks Selected
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {snackOptions.map(opt => {
                const isSelected = selectedSnacks.includes(opt.id);
                const disabled = !isSelected && isFull(selectedSnacks, 2);
                return (
                  <button
                    key={opt.id}
                    disabled={disabled}
                    onClick={() => toggleSelection(opt.id, selectedSnacks, setSelectedSnacks, 2)}
                    className={`text-left flex flex-col bg-white rounded-[2rem] overflow-hidden border-2 transition-all duration-300 relative group h-full ${isSelected ? 'border-[#C9A84C] shadow-2xl ring-4 ring-[#C9A84C]/5' : 'border-transparent hover:border-coral/20'} ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-cream/30 p-2">
                      <img src={opt.image} alt={opt.name} className={`w-full h-full object-cover rounded-2xl transition-transform duration-700 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className={`text-[11px] font-bold brand-rounded uppercase mb-1 ${isSelected ? 'text-[#C9A84C]' : 'text-[#4A3728]'}`}>{opt.name}</h4>
                      <p className="text-[9px] text-[#4A3728]/50 leading-tight italic line-clamp-2">{opt.description}</p>
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

        {/* Footer Summary Bar */}
        <div className="p-4 sm:p-10 bg-white/95 backdrop-blur-2xl border-t border-coral/5 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row items-center gap-4 sm:gap-10 z-30 shrink-0">
          <div className="flex-1 flex flex-row items-center gap-4 sm:gap-8 text-left w-full lg:w-auto">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#C9A84C]/10 rounded-2xl sm:rounded-[2rem] border border-[#C9A84C]/10 min-w-fit sm:min-w-[180px] justify-start">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-[#C9A84C] shadow-sm flex-shrink-0">
                <Box size={18} className="sm:hidden" />
                <Box size={24} className="hidden sm:block" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] font-black brand-rounded uppercase text-[#4A3728]/40 tracking-widest block">Slots Filled</span>
                <p className="text-[10px] sm:text-xs font-bold text-[#4A3728] whitespace-nowrap">{selectedMukhwas.length + selectedMithai.length + selectedSnacks.length} / 7 items</p>
              </div>
            </div>

            <div className="hidden sm:flex flex-1 flex-wrap justify-start gap-1.5 max-h-20 overflow-y-auto px-2">
              {[...selectedMukhwas, ...selectedMithai, ...selectedSnacks].length === 0 && (
                <p className="text-[9px] font-black brand-rounded uppercase text-coral/30">Select your items to build your box</p>
              )}
              {[...selectedMukhwas, ...selectedMithai, ...selectedSnacks].map((id, idx) => {
                const opt = [...mukhwasOptions, ...mithaiOptions, ...snackOptions].find(o => o.id === id);
                return opt ? (
                  <span key={idx} className="px-3 py-1.5 bg-coral/5 text-coral rounded-full text-[8px] font-bold uppercase brand-rounded border border-coral/10 animate-in fade-in zoom-in duration-300">
                    {opt.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
             <button onClick={handleReset} className="p-4 sm:p-5 border-2 border-coral/10 text-[#4A3728]/40 rounded-xl sm:rounded-[1.5rem] hover:text-coral hover:bg-coral/5 transition-all">
                <RotateCcw size={18} />
             </button>
             <button
               disabled={!canConfirm}
               onClick={handleConfirm}
               className={`flex-1 sm:flex-none px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] text-[10px] sm:text-[11px] font-black uppercase brand-rounded tracking-[0.1em] sm:tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 ${canConfirm ? 'bg-coral text-white shadow-coral/30 hover:scale-105 active:scale-95' : 'bg-[#4A3728]/10 text-[#4A3728]/30 cursor-not-allowed shadow-none'}`}
             >
               {canConfirm ? 'Confirm' : 'Fill Slots'} <Check size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationModal;