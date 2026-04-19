import React, { useState } from 'react';
import { Plus, ImageOff } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const availableWeights = product.weights || [product.weight];

  // Calculate display price: Prefer 250g price for the ticker, fallback to base product.price
  const displayPrice = product.prices?.['250 G'] ?? product.price;
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

  return (
    <div onClick={() => onAddToCart(product)} className="group bg-white rounded-3xl overflow-hidden border border-[#4A3728]/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream/50">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-coral/5 text-coral/30 p-8 text-center">
            <ImageOff size={48} strokeWidth={1} className="mb-4" />
            <p className="brand-script text-xl opacity-60">amie's</p>
            <p className="brand-rounded text-[10px] font-bold uppercase tracking-widest mt-1">Handmade With Love</p>
          </div>
        )}
        
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
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4A3728]">
            {product.category}
          </span>
          {product.id === 'm2' && (
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

        {product.rating && product.reviewCount && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-[10px] text-gray-500">{product.reviewCount} reviews</span>
          </div>
        )}

        {/* Available Weights Section */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-4">
          {availableWeights.map((w) => (
            <span key={w} className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold brand-rounded rounded-md uppercase tracking-tighter border ${w === '250 G' ? 'bg-coral/5 text-coral border-coral/20' : 'bg-[#4A3728]/5 text-[#4A3728]/60 border-[#4A3728]/10'}`}>
              {w}
            </span>
          ))}
        </div>

        <p className="hidden sm:block text-sm text-[#4A3728]/70 line-clamp-2 leading-relaxed h-10 overflow-hidden mb-6">
          {product.description}
        </p>

        <button
          onClick={() => {
            onAddToCart(product);
            (window as any).fbq?.('track', 'AddToCart', {
              value: displayPrice,
              currency: 'INR',
              content_name: product.name,
              content_ids: [product.id],
              content_type: 'product',
            });
          }}
          className="w-full py-2.5 sm:py-3.5 border border-[#F14E4E] text-[#F14E4E] rounded-full text-[11px] sm:text-sm font-medium hover:bg-[#F14E4E] hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5"
        >
          + Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;