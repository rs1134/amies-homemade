import React, { useMemo, useState } from 'react';
import { Gift, Sparkles, Heart, ChevronRight, MessageSquareText, PackageCheck, SendHorizontal, Image as ImageIcon, Home, ShieldCheck, Package, MessageCircle, Clock, Star, Users, Trophy, Mail, Sparkle } from 'lucide-react';
import { PRODUCTS, WHATSAPP_NUMBER, isProductVisible } from '../constants.ts';
import { Category, Product, CartItem } from '../types.ts';
import PersonalizationModal from './PersonalizationModal.tsx';
import WellnessPersonalizationModal from './WellnessPersonalizationModal.tsx';
import SweetMemoriesModal from './SweetMemoriesModal.tsx';
import ProductCard from './ProductCard.tsx';

interface HamperCardProps {
  item: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

interface GiftingViewProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  cart?: CartItem[];
  onUpdateQuantity?: (index: number, delta: number) => void;
}

const HamperCard: React.FC<HamperCardProps> = ({ item, onAddToCart, onSelectProduct }) => {
  const images = item.images && item.images.length > 0 ? item.images : [item.image];
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [currentTreats, setCurrentTreats] = useState<string[]>(item.ingredients);
  const [currentPrice, setCurrentPrice] = useState<number>(item.price);

  const isHeritageBox = item.id === 'g1';
  const isWellnessBox = item.id === 'g2';
  const isSweetMemories = item.id === 'g3';
  // Only the legacy hampers have a personalization flow; new hampers are fixed sets.
  const isPersonalizable = isHeritageBox || isWellnessBox || isSweetMemories;

  // Benefit Row Configs
  const benefits = useMemo(() => {
    if (isHeritageBox) return [
      { icon: <Star size={16} />, text: "Ami's Signature Recipes" },
      { icon: <ShieldCheck size={16} />, text: "No Artificial Preservatives" },
      { icon: <Package size={16} />, text: "Luxury Wooden Packaging" },
    ];
    if (isWellnessBox) return [
      { icon: <Heart size={16} />, text: "Health-Focused Ingredients" },
      { icon: <ShieldCheck size={16} />, text: "Sugar-Free Options Available" },
      { icon: <Clock size={16} />, text: "Prepared Fresh to Order" },
    ];
    return [
      { icon: <Home size={16} />, text: "Handcrafted Fresh Daily" },
      { icon: <ShieldCheck size={16} />, text: "Zero Artificial Colors" },
      { icon: <Package size={16} />, text: "Gift-Ready Presentation" },
    ];
  }, [isHeritageBox, isWellnessBox]);

  // Occasion Tags
  const occasions = useMemo(() => {
    if (isHeritageBox) return ['Weddings', 'Grand Festivals', 'Housewarming', 'Anniversaries'];
    if (isWellnessBox) return ['Self-Care', 'Birthdays', 'Get Well Soon', 'New Year'];
    return ['Tea Time', 'Small Gatherings', 'Corporate Gifts', 'Thank You'];
  }, [isHeritageBox, isWellnessBox]);

  const handlePersonalizeHeritage = (newTreats: string[]) => {
    setCurrentTreats(newTreats);
    setIsPersonalizing(false);
    // Directly add the personalized hamper to the cart
    onAddToCart({ ...item, ingredients: newTreats, price: currentPrice });
  };

  const handlePersonalizeWellness = (newTreats: string[], price: number) => {
    setCurrentTreats(newTreats);
    setCurrentPrice(price);
    setIsPersonalizing(false);
    // Directly add the personalized hamper to the cart with updated price
    onAddToCart({ ...item, ingredients: newTreats, price: price });
  };

  const handlePersonalizeSweetMemories = (newTreats: string[]) => {
    setCurrentTreats(newTreats);
    setIsPersonalizing(false);
    // Directly add the personalized hamper to the cart
    onAddToCart({ ...item, ingredients: newTreats, price: currentPrice });
  };

  return (
    <div id={`hamper-${item.id}`} className="bg-white rounded-[2rem] sm:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row group border border-coral/5 hover:border-coral/20 transition-all duration-500">
      {/* Gallery Section */}
      <div className="lg:w-2/5 flex flex-col bg-[#FDFBF7] relative">
        <div className="relative w-full h-52 sm:h-96 lg:h-full overflow-hidden bg-white">
          <img
            src={images[activeImgIdx]}
            alt={item.name}
            loading="lazy"
            className={`w-full h-full block transition-transform duration-1000 group-hover:scale-110 ${isHeritageBox ? 'object-contain' : 'object-cover object-center'}`}
          />
          <div className="absolute top-6 left-6 z-10">
            <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-[#D4AF37] uppercase tracking-widest shadow-lg border border-[#D4AF37]/10">
              {item.category === Category.GIFTING ? 'Premium Hamper' : item.category}
            </span>
          </div>
          
          {/* Internal Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 p-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImgIdx === idx ? 'border-[#D4AF37] scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${item.name} view ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="lg:w-3/5 p-5 sm:p-8 md:p-14 flex flex-col bg-white">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3 sm:mb-6">
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold serif text-[#4A3728] group-hover:text-coral transition-colors leading-tight">
              {item.name}
            </h3>
            {currentTreats !== item.ingredients && (
              <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[9px] font-black brand-rounded uppercase tracking-widest border border-green-100 shadow-sm whitespace-nowrap">
                Personalized
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-[#4A3728]/70 leading-relaxed mb-4 sm:mb-10 max-w-xl">
            {item.description}
          </p>

          <div className="space-y-6 sm:space-y-12">
            {/* The Collection Includes - Ingredient Pills */}
            <div className="space-y-4">
              <p className="text-[10px] brand-rounded text-coral font-black uppercase tracking-[0.2em]">The Collection Includes:</p>
              <div className="flex flex-wrap gap-2.5">
                {currentTreats.map((ing, idx) => (
                  <span key={idx} className="bg-coral/5 text-coral text-[9px] font-bold brand-rounded px-4 py-2 rounded-2xl uppercase tracking-wider border border-coral/10 animate-in fade-in slide-in-from-left duration-500 shadow-sm">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Why You'll Love It - Icon Grid */}
            <div className="space-y-4">
              <p className="text-[10px] brand-rounded text-coral font-black uppercase tracking-[0.2em]">Why You'll Love It</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-[#4A3728]/70 font-medium">
                    <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-[#D4AF37] shadow-sm">{b.icon}</div>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Perfect For - Occasion Tags */}
            <div className="space-y-4">
              <p className="text-[10px] brand-rounded text-coral font-black uppercase tracking-[0.2em]">Perfect For</p>
              <div className="flex flex-wrap gap-2">
                {occasions.map(occ => (
                  <span key={occ} className="px-4 py-2 bg-[#D4AF37]/5 text-[#D4AF37] text-[10px] font-bold brand-rounded rounded-full border border-[#D4AF37]/10">
                    {occ}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col gap-4 sm:gap-8 mt-6 sm:mt-16 pt-6 sm:pt-10 border-t border-coral/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-4xl font-black text-[#D4AF37]">₹{currentPrice}</span>
                <span className="text-sm font-bold text-[#D4AF37]/60">INR</span>
              </div>
              <span className="text-[10px] brand-rounded text-[#4A3728]/30 font-bold uppercase tracking-widest mt-1">Free Delivery Included</span>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              {isPersonalizable && (
                <button
                  onClick={() => {
                    setIsPersonalizing(true);
                    window.history.pushState(null, '', `/gifting#hamper-${item.id}`);
                  }}
                  className="flex-1 sm:flex-none px-10 py-5 border-2 border-[#D4AF37] text-[#D4AF37] rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-white transition-all flex items-center justify-center gap-3 brand-rounded shadow-lg shadow-[#D4AF37]/5 active:scale-95"
                >
                  <MessageSquareText size={16} /> Personalize Box
                </button>
              )}
              <button
                onClick={() => onAddToCart({ ...item, ingredients: currentTreats, price: currentPrice })}
                className={`${isPersonalizable ? '' : 'flex-1 px-10'} p-5 bg-coral text-white rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-coral/30 flex items-center justify-center gap-3`}
                title="Add to Cart"
              >
                <Gift size={26} /> {!isPersonalizable && <span className="text-[11px] font-black uppercase tracking-[0.2em] brand-rounded">Add to Cart</span>}
              </button>
            </div>
          </div>

          {/* Corporate / Bulk Callout */}
          <div className="bg-[#FDFBF7] p-6 rounded-[2.5rem] border border-[#D4AF37]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                  <PackageCheck size={20} />
                </div>
                <p className="text-xs font-bold text-[#4A3728]/70 brand-rounded">
                  <span className="text-[#4A3728] font-black">🏢 Need bulk corporate orders?</span><br/>
                  Contact us on WhatsApp for custom pricing.
                </p>
             </div>
             <a 
               href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
               target="_blank"
               rel="noopener noreferrer"
               className="px-6 py-3 bg-[#25D366] text-white rounded-xl text-[10px] font-black brand-rounded uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
             >
               <MessageCircle size={14} /> WhatsApp Inquiry
             </a>
          </div>
        </div>
      </div>

      {/* Specific Modals per Item */}
      {isPersonalizing && isHeritageBox && (
        <PersonalizationModal
          onClose={() => { setIsPersonalizing(false); window.history.replaceState(null, '', '/gifting'); }}
          onConfirm={handlePersonalizeHeritage}
        />
      )}

      {isPersonalizing && isWellnessBox && (
        <WellnessPersonalizationModal
          onClose={() => { setIsPersonalizing(false); window.history.replaceState(null, '', '/gifting'); }}
          onConfirm={handlePersonalizeWellness}
        />
      )}

      {isPersonalizing && isSweetMemories && (
        <SweetMemoriesModal
          onClose={() => { setIsPersonalizing(false); window.history.replaceState(null, '', '/gifting'); }}
          onConfirm={handlePersonalizeSweetMemories}
          maxVarieties={3}
        />
      )}
    </div>
  );
};

const GiftingView: React.FC<GiftingViewProps> = ({ onAddToCart, onSelectProduct, cart = [], onUpdateQuantity }) => {
  const giftItems = useMemo(() => PRODUCTS.filter(p => p.category === Category.GIFTING && isProductVisible(p)), []);
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customDetails, setCustomDetails] = useState('');

  const customizeWhatsAppUrl = useMemo(() => {
    const lines = [
      "Hey Amie's Homemade! I'd like a custom hamper.",
      customName ? `Name: ${customName}` : '',
      customPhone ? `Phone: ${customPhone}` : '',
      customDetails ? `What I'm looking for: ${customDetails}` : '',
    ].filter(Boolean).join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(lines)}`;
  }, [customName, customPhone, customDetails]);

  return (
    <div className="pt-24 sm:pt-20 bg-[#FFF8EE] min-h-screen">
      {/* Luxury Hero Section */}
      <section className="relative h-[35vh] sm:h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#2A1E14]/45 z-10"></div>
        <img 
          src="https://ik.imagekit.io/amieshomemade/067A4292.JPG?updatedAt=1782443782402"
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
          alt="Gifting Hampers"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-white serif mb-4 sm:mb-6 leading-tight drop-shadow-2xl animate-in fade-in zoom-in duration-1000">
            Celebrate Rakhi, <span className="text-[#D4AF37] brand-script">Beautifully.</span>
          </h1>
        </div>
      </section>

      {/* Main Gifting Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-32">
        <div className="text-center mb-10 sm:mb-32">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4 sm:mb-6">Rakhi Hampers</span>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold serif text-[#4A3728]">Hampers for Every Rakhi</h2>
          <div className="w-24 h-2 bg-[#D4AF37] mx-auto rounded-full mt-8 shadow-sm"></div>
          <p className="mt-10 text-[#4A3728]/50 max-w-2xl mx-auto brand-rounded font-bold uppercase text-[10px] tracking-[0.2em] leading-relaxed">
            Handpicked hampers for the sibling who means everything. <br/>Beautifully packaged, ready to gift.
          </p>
        </div>

        {/* Only 2 hampers exist right now — capped at 2 columns (instead of
            reusing the shop grid's 3/4-column breakpoints) so each card
            actually gets wider on desktop instead of sitting narrow with a
            large empty gap where a 3rd/4th card would've gone. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10 max-w-4xl mx-auto mb-10 sm:mb-32">
          {giftItems.map(item => {
            const cartIndex = cart.findIndex(ci => ci.id === item.id && ci.selectedWeight === item.weight && !ci.selectedSubOption);
            return (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={(p) => onAddToCart(p)}
                onOpen={(p) => onSelectProduct(p)}
                cartQuantity={cartIndex >= 0 ? cart[cartIndex].quantity : 0}
                onDecrement={() => cartIndex >= 0 && onUpdateQuantity?.(cartIndex, -1)}
              />
            );
          })}
        </div>

        {/* Custom hamper enquiry — a lightweight form instead of a big promo
            card; submits as a pre-filled WhatsApp message since that's the
            site's existing enquiry channel (no separate form backend). */}
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-[#D4AF37]/20 shadow-xl p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral/5 rounded-full mb-4 border border-coral/10">
              <Sparkle size={13} className="text-coral" />
              <span className="text-[9px] font-black brand-rounded text-coral uppercase tracking-widest">Bespoke Curation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold serif text-[#4A3728] mb-2">Want a Custom Hamper?</h2>
            <p className="text-xs sm:text-sm text-[#4A3728]/60 leading-relaxed max-w-md mx-auto">
              Tell us what you have in mind and we'll put together something bespoke for you.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-[#FDFBF7] rounded-xl border border-[#4A3728]/10 text-sm text-[#4A3728] placeholder:text-[#4A3728]/40 outline-none focus:border-coral transition-colors"
              />
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-4 py-3 bg-[#FDFBF7] rounded-xl border border-[#4A3728]/10 text-sm text-[#4A3728] placeholder:text-[#4A3728]/40 outline-none focus:border-coral transition-colors"
              />
            </div>
            <textarea
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="What are you looking for? (occasion, budget, quantity, any specific items)"
              rows={3}
              className="w-full px-4 py-3 bg-[#FDFBF7] rounded-xl border border-[#4A3728]/10 text-sm text-[#4A3728] placeholder:text-[#4A3728]/40 outline-none focus:border-coral transition-colors resize-none"
            />
            <a
              href={customizeWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-7 py-3.5 bg-[#25D366] text-white rounded-full font-black brand-rounded uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#25D366]/30"
            >
              <MessageCircle size={16} /> Send on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GiftingView;