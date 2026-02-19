import React, { useMemo, useState } from 'react';
import { Gift, Sparkles, Heart, ChevronRight, MessageSquareText, PackageCheck, SendHorizontal, Image as ImageIcon, Home, ShieldCheck, Package, MessageCircle, Clock, Star, Users, Trophy, Mail, Sparkle } from 'lucide-react';
import { PRODUCTS, WHATSAPP_NUMBER } from '../constants';
import { Category, Product } from '../types';
import PersonalizationModal from './PersonalizationModal';
import WellnessPersonalizationModal from './WellnessPersonalizationModal';
import SweetMemoriesModal from './SweetMemoriesModal';

interface HamperCardProps {
  item: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

interface GiftingViewProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
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
    <div id={`hamper-${item.id}`} className="bg-white rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row group border border-coral/5 hover:border-coral/20 transition-all duration-500 min-h-[600px]">
      {/* Gallery Section */}
      <div className="lg:w-2/5 flex flex-col bg-[#FDFBF7] relative">
        <div className="relative w-full h-96 lg:h-full overflow-hidden bg-white">
          <img 
            src={images[activeImgIdx]} 
            alt={item.name} 
            className="w-full h-full block object-cover object-center transition-transform duration-1000 group-hover:scale-110" 
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
                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="lg:w-3/5 p-8 sm:p-12 md:p-14 flex flex-col bg-white">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-4xl sm:text-5xl font-bold serif text-[#4A3728] group-hover:text-coral transition-colors leading-tight">
              {item.name}
            </h3>
            {currentTreats !== item.ingredients && (
              <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[9px] font-black brand-rounded uppercase tracking-widest border border-green-100 shadow-sm whitespace-nowrap">
                Personalized
              </span>
            )}
          </div>
          <p className="text-base text-[#4A3728]/70 leading-relaxed mb-10 max-w-xl">
            {item.description}
          </p>
          
          <div className="space-y-12">
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
        <div className="flex flex-col gap-8 mt-16 pt-10 border-t border-coral/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#D4AF37]">₹{currentPrice}</span>
                <span className="text-sm font-bold text-[#D4AF37]/60">INR</span>
              </div>
              <span className="text-[10px] brand-rounded text-[#4A3728]/30 font-bold uppercase tracking-widest mt-1">Free Delivery Included</span>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={() => setIsPersonalizing(true)}
                className="flex-1 sm:flex-none px-10 py-5 border-2 border-[#D4AF37] text-[#D4AF37] rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-white transition-all flex items-center justify-center gap-3 brand-rounded shadow-lg shadow-[#D4AF37]/5 active:scale-95"
              >
                <MessageSquareText size={16} /> Personalize Box
              </button>
              <button 
                onClick={() => onAddToCart({ ...item, ingredients: currentTreats, price: currentPrice })}
                className="p-5 bg-coral text-white rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all shadow-coral/30 flex items-center justify-center"
                title="Add to Cart"
              >
                <Gift size={26} />
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
          onClose={() => setIsPersonalizing(false)}
          onConfirm={handlePersonalizeHeritage}
        />
      )}

      {isPersonalizing && isWellnessBox && (
        <WellnessPersonalizationModal
          onClose={() => setIsPersonalizing(false)}
          onConfirm={handlePersonalizeWellness}
        />
      )}

      {isPersonalizing && isSweetMemories && (
        <SweetMemoriesModal 
          onClose={() => setIsPersonalizing(false)}
          onConfirm={handlePersonalizeSweetMemories}
          maxVarieties={3}
        />
      )}
    </div>
  );
};

const GiftingView: React.FC<GiftingViewProps> = ({ onAddToCart, onSelectProduct }) => {
  const giftItems = useMemo(() => PRODUCTS.filter(p => p.category === Category.GIFTING), []);

  return (
    <div className="pt-20 bg-[#FFF8EE] min-h-screen">
      {/* Luxury Hero Section */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#2A1E14]/45 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
          alt="Gifting Hampers"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white brand-rounded text-xs font-black uppercase tracking-[0.4em] mb-8 animate-in slide-in-from-top duration-700 shadow-2xl">
            <Sparkles size={14} className="text-[#D4AF37]" /> The Art of Gifting
          </div>
          <h1 className="text-6xl sm:text-8xl font-bold text-white serif mb-6 leading-tight drop-shadow-2xl animate-in fade-in zoom-in duration-1000">
            Share the <span className="text-[#D4AF37] brand-script">Magic.</span>
          </h1>
        </div>
      </section>

      {/* Main Gifting Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-32">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-6">Handpicked Collections</span>
          <h2 className="text-5xl sm:text-7xl font-bold serif text-[#4A3728]">The Gift Gallery</h2>
          <div className="w-24 h-2 bg-[#D4AF37] mx-auto rounded-full mt-8 shadow-sm"></div>
          <p className="mt-10 text-[#4A3728]/50 max-w-2xl mx-auto brand-rounded font-bold uppercase text-[10px] tracking-[0.2em] leading-relaxed">
            Beautifully crafted hampers for every occasion. <br/>Customized for your unique taste.
          </p>
        </div>

        <div className="space-y-32">
          {giftItems.map(item => (
            <HamperCard 
              key={item.id} 
              item={item} 
              onAddToCart={onAddToCart} 
              onSelectProduct={onSelectProduct} 
            />
          ))}

          {/* HIGH-APPEAL CUSTOM HAMPER CALLOUT CARD */}
          <div className="relative overflow-hidden bg-white rounded-[4rem] flex flex-col lg:flex-row border-2 border-[#D4AF37]/20 shadow-2xl group transition-all duration-700 hover:shadow-[#D4AF37]/25">
            {/* Rich Image Collage Section */}
            <div className="lg:w-1/2 grid grid-cols-2 grid-rows-2 h-[500px] lg:h-auto overflow-hidden">
               {/* WEDDINGS */}
               <div className="relative overflow-hidden group/img border-r border-b border-[#D4AF37]/10">
                  <img 
                    src="https://i.postimg.cc/3xwTWHm9/amish-thakkar-7O422y-G-b80-unsplash.jpg" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" 
                    alt="Weddings at Amie's" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <span className="text-white text-[11px] font-black brand-rounded uppercase tracking-[0.3em]">Weddings</span>
                  </div>
               </div>
               {/* FESTIVALS */}
               <div className="relative overflow-hidden group/img border-b border-[#D4AF37]/10">
                  <img 
                    src="https://i.postimg.cc/cHcWr19P/bh6cmv93h5rmt0cwehc94w18rr.png" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" 
                    alt="Festivals at Amie's" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <span className="text-white text-[11px] font-black brand-rounded uppercase tracking-[0.3em]">Festivals</span>
                  </div>
               </div>
               {/* CORPORATE GIFTS */}
               <div className="relative overflow-hidden group/img border-r border-[#D4AF37]/10">
                  <img 
                    src="https://i.postimg.cc/bYFML2t9/3mx66mz99srmr0cwehfssqfz10.png" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" 
                    alt="Corporate Gifting" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <span className="text-white text-[11px] font-black brand-rounded uppercase tracking-[0.3em]">Corporate</span>
                  </div>
               </div>
               {/* CELEBRATIONS */}
               <div className="relative overflow-hidden group/img">
                  <img 
                    src="https://i.postimg.cc/4ytzzMcq/nescmvzyzhrmw0cweh988hsnk0.png" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" 
                    alt="Celebrations" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <span className="text-white text-[11px] font-black brand-rounded uppercase tracking-[0.3em]">Celebrations</span>
                  </div>
               </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 p-12 sm:p-20 relative flex flex-col justify-center bg-white">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-coral/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-coral/5 rounded-full mb-8 border border-coral/10">
                  <Sparkle size={16} className="text-coral animate-spin-slow" />
                  <span className="text-[10px] font-black brand-rounded text-coral uppercase tracking-widest">Bespoke Curation</span>
                </div>
                
                <h2 className="text-4xl sm:text-6xl font-bold serif text-[#4A3728] mb-8 leading-[1.15]">
                  Want Something Truly <br/><span className="text-coral brand-script">One-of-a-Kind?</span>
                </h2>
                
                <p className="text-lg text-[#4A3728]/60 leading-relaxed mb-12 brand-rounded font-medium max-w-lg">
                  Beyond our signature collections, we specialize in fully bespoke hampers tailored precisely to your vision. Whether you wish to combine our finest mukhwas with external luxury goods or curate a box of specific artisanal favorites for a grand wedding, we are here to help you gift something unforgettable.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <a 
                    href={`https://wa.me/919157537842`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-12 py-6 bg-[#25D366] text-white rounded-full font-black brand-rounded uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#25D366]/30"
                  >
                    <MessageCircle size={20} /> WhatsApp Ami Shah
                  </a>
                  <a 
                    href="mailto:hello@amieshomemade.com?subject=Custom Hamper Inquiry"
                    className="w-full sm:w-auto px-12 py-6 border-2 border-[#D4AF37]/30 text-[#D4AF37] rounded-full font-black brand-rounded uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:bg-[#D4AF37] hover:text-white transition-all shadow-lg"
                  >
                    <Mail size={20} /> Send an Email
                  </a>
                </div>
                
                <div className="mt-12 pt-10 border-t border-[#4A3728]/5">
                   <div className="flex items-center gap-6">
                      <div className="flex -space-x-4">
                         {[
                           "https://i.postimg.cc/Z0bx4HBT/2g677zy48hrmw0cwehk808vn7m.png",
                           "https://i.postimg.cc/xqf3n5J9/jym5s927c1rmw0cwehks58zfc0.png",
                           "https://i.postimg.cc/5j4SbgYb/sqck0krbvnrmw0cwehkr80gmqm.png"
                         ].map((url, i) => (
                           <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-cream shadow-lg relative z-[5]">
                              <img src={url} className="w-full h-full object-cover" alt="Happy Indian Customer" />
                           </div>
                         ))}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold brand-rounded text-[#4A3728]/40 uppercase tracking-widest leading-tight">
                          TRUSTED BY 500+ HAPPY FAMILIES FOR THEIR <br className="hidden sm:block"/>MOST PRECIOUS CELEBRATIONS.
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GiftingView;