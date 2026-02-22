import React, { useState } from 'react';
import { Plus, ShoppingCart, ImageOff } from 'lucide-react';
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

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#4A3728]/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream/50">
        {!imageError ? (
          <img 
            src={product.image} 
            alt={product.name}
            onError={() => setImageError(true)}
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
            onClick={() => onAddToCart(product)}
            className="p-3 bg-[#F14E4E] text-white rounded-full shadow-lg hover:bg-[#d43d3d] transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4A3728]">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[#4A3728] serif group-hover:text-[#F14E4E] transition-colors">
            {product.name}
          </h3>
          <div className="text-right">
            <span className="text-sm font-bold text-[#F14E4E]">
              ₹{displayPrice}
            </span>
          </div>
        </div>
        
        {/* Available Weights Section */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {availableWeights.map((w) => (
            <span key={w} className={`px-2 py-0.5 text-[9px] font-bold brand-rounded rounded-md uppercase tracking-tighter border ${w === '250 G' ? 'bg-coral/5 text-coral border-coral/20' : 'bg-[#4A3728]/5 text-[#4A3728]/60 border-[#4A3728]/10'}`}>
              {w}
            </span>
          ))}
        </div>

        <p className="text-sm text-[#4A3728]/70 line-clamp-2 leading-relaxed h-10 overflow-hidden mb-6">
          {product.description}
        </p>
        
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full py-4 border-2 border-[#F14E4E] text-[#F14E4E] rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#F14E4E] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={14} />
          View Details & Weights
        </button>
      </div>
    </div>
  );
};

export default ProductCard;