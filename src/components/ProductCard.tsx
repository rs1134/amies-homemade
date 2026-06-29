import React, { useState } from 'react';
import { Plus, ImageOff, Images } from 'lucide-react';
import { Product } from '../types.ts';

const BESTSELLER_IDS = new Set(['m10', 'm2', 'm4', 'sf3', 'hw1', 'sm1']);

const ikImg = (url: string, w: number) => {
  if (!url.includes('ik.imagekit.io')) return url;
  const base = url.split('?')[0];
  return `${base}?tr=w-${w},q-80,f-auto`;
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpen: (product: Product) => void;
}

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onOpen }) => {
  const [imageError, setImageError] = useState(false);
  const availableWeights = product.weights || [product.weight];
  // Real href so search engines can crawl product pages from the grid
  const productPath = `/${product.category === 'Gifting & Hampers' ? 'gifting' : 'shop'}/${slugify(product.name)}`;

  // Display price: use the default weight's price
  const displayPrice = product.prices?.[product.weight] ?? product.price;
  // MRP = price before 10% discount, rounded to nearest ₹5
  const mrp = Math.ceil(displayPrice / 0.9 / 5) * 5;

  // Products with varieties need the modal so the customer can choose
  const needsOptions = !!product.subOptions;
  const handleAdd = () => (needsOptions ? onOpen(product) : onAddToCart(product));

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
  const hasMultiplePhotos = (product.images?.length ?? 0) > 1;

  return (
    <a href={productPath} onClick={(e) => { e.preventDefault(); onOpen(product); }} className="block group bg-white rounded-3xl overflow-hidden border border-[#4A3728]/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream/50">
        {!imageError ? (
          <>
            <img
              src={ikImg(product.image, 600)}
              srcSet={`${ikImg(product.image, 400)} 400w, ${ikImg(product.image, 700)} 700w`}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              alt={product.name}
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-300 ${isOOS ? 'grayscale' : 'group-hover:scale-105'}`}
            />
            {/* Second photo — preloaded eagerly so it's in cache on hover */}
            {hasMultiplePhotos && !isOOS && (
              <img
                src={ikImg(product.images![1], 700)}
                alt=""
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              />
            )}
          </>
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

        {/* Multiple-photos indicator */}
        {hasMultiplePhotos && !imageError && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold z-10">
            <Images size={11} /> {product.images!.length}
          </span>
        )}

        {!isOOS && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAdd();
              }}
              className="p-3 bg-[#F14E4E] text-white rounded-full shadow-lg hover:bg-[#d43d3d] transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        )}
        {BESTSELLER_IDS.has(product.id) && !isOOS && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 pl-2.5 pr-3 py-1.5 bg-[#2A1E14]/80 backdrop-blur-sm text-[#F6C94C] rounded-full text-[9px] font-bold brand-rounded uppercase tracking-[0.18em] shadow-lg">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="#F6C94C"><polygon points="5,0 6.2,3.8 10,3.8 7,6.1 8.1,10 5,7.6 1.9,10 3,6.1 0,3.8 3.8,3.8"/></svg>
              Bestseller
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-6">
        <h3 className="text-[15px] sm:text-xl font-bold text-[#4A3728] serif group-hover:text-[#F14E4E] transition-colors leading-tight mb-1.5">
          {product.name}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className="text-[15px] sm:text-base font-bold text-[#F14E4E]">₹{displayPrice}</span>
          <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
          <span className="text-[10px] font-bold bg-[#F14E4E] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">SAVE 10%</span>
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
            <span key={w} className={`px-2 py-0.5 text-[10px] font-bold brand-rounded rounded-md uppercase tracking-tight border ${w === product.weight ? 'bg-coral/5 text-coral border-coral/20' : 'bg-[#4A3728]/5 text-[#4A3728]/60 border-[#4A3728]/10'}`}>
              {w}
            </span>
          ))}
        </div>

        <p className="hidden sm:block text-sm text-[#4A3728]/70 line-clamp-2 leading-relaxed h-10 overflow-hidden mb-6">
          {product.description}
        </p>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isOOS) { onOpen(product); return; } // still let them read the product
            handleAdd();
          }}
          className={`w-full py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 border ${isOOS ? 'border-[#4A3728]/20 text-[#4A3728]/60 hover:bg-[#4A3728]/5' : 'border-[#F14E4E] text-[#F14E4E] hover:bg-[#F14E4E] hover:text-white'}`}
        >
          {isOOS ? 'Out of Stock · View Details' : needsOptions ? 'Choose Options' : '+ Add to Cart'}
        </button>
      </div>
    </a>
  );
};

export default ProductCard;
