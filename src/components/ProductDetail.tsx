
import React, { useState, useMemo } from 'react';
import { X, Heart, ShieldCheck, Clock, Truck, ImageOff } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, weight: string, subOption?: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedWeight, setSelectedWeight] = useState(product.weights?.[0] || product.weight);
  const [selectedSubOption, setSelectedSubOption] = useState(product.subOptions?.[0]?.name || '');
  const [imageError, setImageError] = useState(false);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Find the currently selected sub-option prices if they exist
  const activePrices = useMemo(() => {
    if (!product.subOptions) return product.prices || { [product.weight]: product.price };
    const option = product.subOptions.find(o => o.name === selectedSubOption);
    return option ? option.prices : product.prices || { [product.weight]: product.price };
  }, [product.subOptions, product.prices, product.weight, product.price, selectedSubOption]);

  // Dynamic price calculation
  const currentPrice = activePrices[selectedWeight] || product.price;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#FFF8EE] w-full max-w-4xl rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[92vh] overflow-y-auto md:overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-coral transition-colors">
          <X size={20} />
        </button>

        {/* Image — constrained height on mobile so it doesn't eat the whole screen */}
        <div className="md:w-1/2 relative h-72 sm:h-80 md:h-auto md:aspect-square bg-cream/50 flex-shrink-0">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-coral/5 text-coral/30 p-12 text-center">
              <ImageOff size={48} strokeWidth={1} className="mb-4" />
              <p className="brand-script text-3xl opacity-60">amie's</p>
              <p className="brand-rounded text-xs font-bold uppercase tracking-widest mt-2">Homemade With Love</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="bg-[#F6C94C] text-[#4A3728] px-3 py-1.5 rounded-full text-xs font-bold brand-rounded flex items-center gap-1.5 shadow-lg">
              <Clock size={12} /> Made Fresh
            </span>
          </div>
        </div>

        {/* Content — tighter padding on mobile */}
        <div className="md:w-1/2 p-5 sm:p-8 md:p-12 md:overflow-y-auto flex-1">
          <span className="text-coral font-bold brand-rounded text-xs uppercase tracking-widest">{product.category}</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4A3728] serif mt-1 mb-3">{product.name}</h2>
          <p className="text-sm sm:text-base text-[#4A3728]/70 leading-relaxed mb-5 sm:mb-8">{product.description}</p>

          {/* Sub Options */}
          {product.subOptions && (
            <div className="mb-5 sm:mb-8">
              <h4 className="text-xs font-bold brand-rounded mb-3 uppercase tracking-wider">Select Variety</h4>
              <div className="flex flex-col gap-2">
                {product.subOptions.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => setSelectedSubOption(opt.name)}
                    className={`px-4 py-3 rounded-2xl font-bold brand-rounded text-sm transition-all border-2 flex justify-between items-center ${
                      selectedSubOption === opt.name ? 'bg-coral/5 border-coral text-coral shadow-sm' : 'border-coral/10 text-[#4A3728]/70 hover:bg-coral/5'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {selectedSubOption === opt.name && <div className="w-3 h-3 rounded-full bg-coral"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weight options */}
          <div className="mb-5 sm:mb-8">
            <h4 className="text-xs font-bold brand-rounded mb-3 uppercase tracking-wider">Weight Options</h4>
            <div className="flex flex-wrap gap-2">
              {(product.weights || [product.weight]).map(w => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={`px-5 py-2 rounded-full font-bold brand-rounded text-xs transition-all border-2 ${
                    selectedWeight === w ? 'bg-coral border-coral text-white shadow-lg' : 'border-coral/20 text-coral hover:bg-coral/5'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients — variant-specific if available, else product default */}
          {(() => {
            const variantIngredients = product.subOptions?.find(o => o.name === selectedSubOption)?.ingredients;
            const displayIngredients = variantIngredients ?? product.ingredients;
            return (
              <div className="mb-5 sm:mb-8 p-4 sm:p-6 bg-white/50 rounded-3xl border border-coral/5">
                <h4 className="text-xs font-bold brand-rounded mb-2 text-coral uppercase tracking-widest">Pure Ingredients</h4>
                <div className="flex flex-wrap gap-1.5">
                  {displayIngredients.map(i => (
                    <span key={i} className="text-xs text-[#4A3728]/80 bg-[#F6C94C]/10 px-2.5 py-1 rounded-full">• {i}</span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Price + heart */}
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-coral">₹{currentPrice}</span>
                <span className="text-sm text-gray-400 line-through">₹{Math.ceil(currentPrice / 0.9 / 5) * 5}</span>
                <span className="text-[10px] font-bold bg-[#F14E4E] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">SAVE 10%</span>
              </div>
              {product.rating && product.reviewCount && (
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => {
                      const filled = i <= Math.floor(product.rating!);
                      const half = !filled && i === Math.ceil(product.rating!) && product.rating! % 1 !== 0;
                      return (
                        <span key={i} style={{ position: 'relative', display: 'inline-block', fontSize: '14px', lineHeight: 1 }}>
                          <span style={{ color: '#e5e7eb' }}>★</span>
                          {(filled || half) && (
                            <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: filled ? '100%' : '50%', color: '#fbbf24' }}>★</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-500">{product.reviewCount} reviews</span>
                </div>
              )}
            </div>
            <button className="p-2.5 bg-pink-100 text-coral rounded-full hover:scale-110 transition-transform">
              <Heart size={18} fill="#F04E4E" />
            </button>
          </div>

          <button
            disabled={product.outOfStock}
            onClick={() => {
              if (product.outOfStock) return;
              onAddToCart(product, selectedWeight, selectedSubOption);
              (window as any).fbq?.('track', 'AddToCart', {
                value: currentPrice,
                currency: 'INR',
                content_name: product.name,
                content_ids: [product.id],
                content_type: 'product',
              });
            }}
            className={`group/btn w-full py-4 px-5 rounded-2xl font-bold brand-rounded uppercase tracking-widest text-sm transition-all flex items-center justify-between gap-3 ${product.outOfStock ? 'bg-[#4A3728]/10 text-[#4A3728]/40 cursor-not-allowed' : 'bg-coral text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-coral/30'}`}
          >
            {product.outOfStock ? (
              <span className="w-full text-center">Out of Stock</span>
            ) : (
              <>
                <span>Add to Bag</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {/* Paytm */}
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5 overflow-hidden">
                      <img src="https://ik.imagekit.io/amieshomemade/paytm-logo.svg" alt="Paytm" className="w-4 h-auto" />
                    </div>
                    {/* PhonePe */}
                    <div className="w-6 h-6 rounded-full bg-[#5F259F] flex items-center justify-center shadow-sm ring-1 ring-black/5">
                      <span className="text-white text-[10px] font-black italic leading-none">पे</span>
                    </div>
                    {/* Google Pay */}
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5">
                      <svg width="12" height="12" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                        <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                        <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                        <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            )}
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold brand-rounded uppercase text-[#4A3728]/50">
              <ShieldCheck size={13} className="text-green-500" /> Hygienic Prep
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold brand-rounded uppercase text-[#4A3728]/50">
              <Truck size={13} className="text-blue-500" /> Pan India Shipping
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
