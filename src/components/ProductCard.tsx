import React, { useState } from 'react';
import { Plus, ImageOff, ChevronRight } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const availableWeights = product.weights || [product.weight];

  // Display price: use the default weight's price
  const displayPrice = product.prices?.[product.weight] ?? product.price;
  // MRP = price before 10% discount, rounded to nearest ₹5
  const mrp = Math.ceil(displayPrice / 0.9 / 5) * 5;

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(i => {
      const filled = i <= Math.floor(rating);
      const half = !filled && i === Math.ceil(rating) && rating % 1 !== 0;
      return (
        <span key={i} style={{ position: 'relative', display: 'inline-block', fontSize: '12px', lineHeight: 1 }}>
          <span style={{ color: '#e5e7eb' }}>★</span>
          {(filled || half) && (
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              overflow: 'hidden',
              width: filled ? '100%' : '50%',
              color: '#fbbf24'
            }}>★</span>
          )}
        </span>
      );
    });
  };

  const isOOS = product.outOfStock;

  return (
    <div onClick={() => !isOOS && onAddToCart(product)} className={`group bg-white rounded-3xl overflow-hidden border border-[#4A3728]/5 transition-all duration-500 ${isOOS ? 'cursor-not-allowed opacity-90' : 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer'}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-cream/50">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-transform duration-700 ${isOOS ? 'grayscale' : 'group-hover:scale-110'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-coral/5 text-coral/30 p-8 text-center">
            <ImageOff size={48} strokeWidth={1} className="mb-4" />
            <p className="brand-script text-xl opacity-60">amie's</p>
            <p className="brand-rounded text-[10px] font-bold uppercase tracking-widest mt-1">Handmade With Love</p>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOOS && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="px-5 py-2 bg-white text-[#4A3728] rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg border-2 border-[#4A3728]/10">
              Out of Stock
            </span>
          </div>
        )}

        {!isOOS && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
                (window as any).fbq?.('track', 'AddToCart', {
                  value: displayPrice,
                  currency: 'INR',
                  content_name: product.name,
                  content_ids: [product.id],
                  content_type: 'product',
                });
              }}
              className="p-3 bg-[#F14E4E] text-white rounded-full shadow-lg hover:bg-[#d43d3d] transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          {product.isNew && !isOOS && (
            <span className="px-2.5 py-1 bg-white/80 backdrop-blur-sm border border-emerald-400/40 rounded-full text-[9px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm">
              ✦ Newly Launched
            </span>
          )}
          {product.id === 'm2' && !isOOS && (
            <span className="px-3 py-1 bg-[#F04E4E] rounded-full text-[9px] font-black uppercase tracking-widest text-white animate-pulse shadow-lg">
              🥭 Limited Stock
            </span>
          )}
        </div>
      </div>
      
      <div className="p-3 sm:p-6">
        <h3 className="text-sm sm:text-xl font-bold text-[#4A3728] serif group-hover:text-[#F14E4E] transition-colors leading-tight mb-1.5">
          {product.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className="text-sm sm:text-base font-bold text-[#F14E4E]">₹{displayPrice}</span>
          <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
          <span className="text-[9px] sm:text-[10px] font-bold bg-[#F14E4E] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">SAVE 10%</span>
        </div>

        {!product.isNew && product.rating && product.reviewCount && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-[10px] text-gray-500">{product.reviewCount} reviews</span>
          </div>
        )}

        {/* Available Weights Section */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-4">
          {availableWeights.map((w) => (
            <span key={w} className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold brand-rounded rounded-md uppercase tracking-tighter border ${w === product.weight ? 'bg-coral/5 text-coral border-coral/20' : 'bg-[#4A3728]/5 text-[#4A3728]/60 border-[#4A3728]/10'}`}>
              {w}
            </span>
          ))}
        </div>

        <p className="hidden sm:block text-sm text-[#4A3728]/70 line-clamp-2 leading-relaxed h-10 overflow-hidden mb-6">
          {product.description}
        </p>

        <button
          disabled={isOOS}
          onClick={(e) => {
            if (isOOS) return;
            e.stopPropagation();
            onAddToCart(product);
            (window as any).fbq?.('track', 'AddToCart', {
              value: displayPrice,
              currency: 'INR',
              content_name: product.name,
              content_ids: [product.id],
              content_type: 'product',
            });
          }}
          className={`group/btn w-full py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-black tracking-[0.18em] uppercase transition-all duration-300 flex items-center justify-between gap-2 px-3 sm:px-4 ${isOOS ? 'bg-[#4A3728]/10 text-[#4A3728]/40 cursor-not-allowed' : 'bg-[#4A3728] text-white hover:bg-black active:scale-[0.98] shadow-md hover:shadow-lg'}`}
        >
          {isOOS ? (
            <span className="w-full text-center">Out of Stock</span>
          ) : (
            <>
              <span>Buy Now</span>
              <div className="flex items-center gap-1.5">
                {/* Payment icons — inline SVG for fast loading */}
                <div className="flex -space-x-1.5">
                  {/* Paytm */}
                  <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5">
                    <span className="text-[6px] sm:text-[7px] font-black tracking-tight leading-none">
                      <span className="text-[#00BAF2]">pay</span><span className="text-[#012E5B]">tm</span>
                    </span>
                  </div>
                  {/* PhonePe */}
                  <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-[#5F259F] flex items-center justify-center shadow-sm ring-1 ring-black/5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.27 5.43c.74 0 1.36.62 1.36 1.36v10.42c0 .74-.62 1.36-1.36 1.36H4.73c-.74 0-1.36-.62-1.36-1.36V6.79c0-.74.62-1.36 1.36-1.36h14.54zm-7.84 7.06l1.42 1.42c.18.18.36.27.55.27.46 0 .82-.36.82-.82V8.07c0-.18-.09-.36-.27-.45-.18-.09-.36-.09-.55 0L8.34 9.97c-.18.09-.27.27-.27.45 0 .46.36.82.82.82h2.18v.36c0 .27-.18.45-.45.45h-.91c-.27 0-.45.18-.45.45v.55c0 .27.18.45.45.45h1.36c.27 0 .45.09.36.18z"/>
                    </svg>
                  </div>
                  {/* Google Pay (Google "G") */}
                  <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5">
                    <svg width="11" height="11" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                    </svg>
                  </div>
                </div>
                <ChevronRight size={14} className="ml-0.5 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;