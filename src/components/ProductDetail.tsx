
import React, { useState, useMemo } from 'react';
import { Heart, ShieldCheck, Clock, Truck, ImageOff, ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, ChevronRight as Crumb } from 'lucide-react';
import { Product } from '../types.ts';
import { FSSAI_LICENSE } from '../constants.ts';
import ProductCard from './ProductCard.tsx';

// Resize ImageKit images on the fly so the gallery loads fast (some source
// files are 20MB+ raw uploads). Leaves non-ImageKit URLs untouched.
const ikImg = (url: string, w: number) => {
  if (!url || !url.includes('ik.imagekit.io')) return url;
  return `${url.split('?')[0]}?tr=w-${w},q-80,f-auto`;
};

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, weight: string, subOption?: string) => void;
  /** Back to the listing (also used for the breadcrumb crumb). */
  onClose: () => void;
  /** Navigate to the home page (breadcrumb "Home"). */
  onNavigateHome?: () => void;
  /** Products shown in the "You may also like" row. */
  related?: Product[];
  /** Open another product (from the related row). */
  onSelectProduct?: (product: Product) => void;
}

/** Small collapsible section used for Ingredients / Usage Info / Additional Information. */
const Accordion: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#4A3728]/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-bold brand-rounded text-sm text-[#4A3728]">{title}</span>
        <ChevronDown size={18} className={`text-[#4A3728]/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5 text-sm text-[#4A3728]/75 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onAddToCart, onClose, onNavigateHome, related = [], onSelectProduct }) => {
  const [selectedWeight, setSelectedWeight] = useState(product.weights?.[0] || product.weight);
  const [selectedSubOption, setSelectedSubOption] = useState(product.subOptions?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Gallery: use product.images if provided, otherwise fall back to the single image
  const gallery = (product.images && product.images.length > 0) ? product.images : [product.image];
  const [activeImg, setActiveImg] = useState(0);

  // Reset state whenever a different product opens, and scroll to top.
  React.useEffect(() => {
    setActiveImg(0);
    setImageError(false);
    setQuantity(1);
    setSelectedWeight(product.weights?.[0] || product.weight);
    setSelectedSubOption(product.subOptions?.[0]?.name || '');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [product.id]);

  // Find the currently selected sub-option prices if they exist
  const activePrices = useMemo(() => {
    if (!product.subOptions) return product.prices || { [product.weight]: product.price };
    const option = product.subOptions.find(o => o.name === selectedSubOption);
    return option ? option.prices : product.prices || { [product.weight]: product.price };
  }, [product.subOptions, product.prices, product.weight, product.price, selectedSubOption]);

  // Dynamic price calculation
  const currentPrice = activePrices[selectedWeight] || product.price;
  const originalPrice = Math.ceil(currentPrice / 0.9 / 5) * 5;

  // Ingredients are variant-specific when a sub-option supplies them.
  const displayIngredients = product.subOptions?.find(o => o.name === selectedSubOption)?.ingredients ?? product.ingredients;

  // Swipe support for mobile gallery
  const touchStartX = React.useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setActiveImg(i => (i + 1) % gallery.length);
      else setActiveImg(i => (i - 1 + gallery.length) % gallery.length);
    }
    touchStartX.current = null;
  };

  const handleAddToCart = () => {
    if (product.outOfStock) return;
    for (let i = 0; i < quantity; i++) onAddToCart(product, selectedWeight, selectedSubOption);
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-[#4A3728]/50 brand-rounded mb-6 sm:mb-8">
          <button onClick={() => onNavigateHome?.()} className="hover:text-coral transition-colors">Home</button>
          <Crumb size={14} className="opacity-50" />
          <button onClick={onClose} className="hover:text-coral transition-colors">{product.category}</button>
          <Crumb size={14} className="opacity-50" />
          <span className="text-[#4A3728] font-semibold truncate">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          {/* ── Left: image gallery (natural ratio, no gaps) + thumbnail row ── */}
          <div className="min-w-0 flex flex-col gap-3 md:sticky md:top-28 md:self-start">
            <div className="relative w-full">
              {/* Fixed aspect-ratio container prevents height jump when switching images */}
              <div
                className="relative rounded-2xl overflow-hidden bg-[#F5EFE6] aspect-square"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {!imageError ? (
                  <img
                    src={ikImg(gallery[activeImg], 800)}
                    alt={`${product.name} — photo ${activeImg + 1}`}
                    onError={() => setImageError(true)}
                    decoding="async"
                    fetchPriority="high"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-coral/5 text-coral/30 p-12 text-center">
                    <ImageOff size={48} strokeWidth={1} className="mb-4" />
                    <p className="brand-script text-3xl opacity-60">amie's</p>
                    <p className="brand-rounded text-xs font-bold uppercase tracking-widest mt-2">Homemade With Love</p>
                  </div>
                )}
                {/* Preload all gallery images so switching is instant */}
                <div aria-hidden className="hidden">
                  {gallery.map((img, i) => i !== activeImg && (
                    <img key={img} src={ikImg(img, 800)} alt="" loading="lazy" decoding="async" />
                  ))}
                </div>
              </div>

              {gallery.length > 1 && !imageError && (
                <div className="absolute inset-0 hidden md:flex items-center justify-between px-3 pointer-events-none z-10">
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + gallery.length) % gallery.length)}
                    aria-label="Previous photo"
                    className="pointer-events-auto flex w-9 h-9 items-center justify-center rounded-full bg-white/85 hover:bg-white text-[#4A3728] shadow-lg transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % gallery.length)}
                    aria-label="Next photo"
                    className="pointer-events-auto flex w-9 h-9 items-center justify-center rounded-full bg-white/85 hover:bg-white text-[#4A3728] shadow-lg transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile swipe dots */}
            {gallery.length > 1 && !imageError && (
              <div className="flex md:hidden justify-center gap-1.5 -mt-1">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`rounded-full transition-all duration-200 ${i === activeImg ? 'w-4 h-1.5 bg-coral' : 'w-1.5 h-1.5 bg-[#4A3728]/20'}`}
                  />
                ))}
              </div>
            )}

            {gallery.length > 1 && !imageError && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {gallery.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View photo ${i + 1}`}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all bg-[#F5EFE6] ${i === activeImg ? 'border-coral' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={ikImg(img, 120)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: product info ── */}
          <div className="min-w-0">
            <span className="text-coral font-bold brand-rounded text-xs uppercase tracking-widest">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4A3728] serif mt-1 mb-4">{product.name}</h1>

            {/* Price block (JoySpoon style) */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-coral">MRP ₹{currentPrice}</span>
              <span className="text-sm text-gray-400 line-through">MRP ₹{originalPrice}</span>
              <span className="text-[10px] font-bold bg-[#F14E4E] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">SAVE 10%</span>
            </div>
            <p className="text-xs text-[#4A3728]/50 brand-rounded mb-3">Inclusive of taxes</p>

            {product.rating && product.reviewCount && (
              <div className="flex items-center gap-1.5 mb-5">
                <div className="flex">
                  {[1,2,3,4,5].map(i => {
                    const filled = i <= Math.floor(product.rating!);
                    const half = !filled && i === Math.ceil(product.rating!) && product.rating! % 1 !== 0;
                    return (
                      <span key={i} style={{ position: 'relative', display: 'inline-block', fontSize: '15px', lineHeight: 1 }}>
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

            <div className="border-t border-[#4A3728]/10 my-5" />

            {/* Sub options */}
            {product.subOptions && (
              <div className="mb-6">
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

            {/* Size / weight options */}
            <div className="mb-6">
              <h4 className="text-xs font-bold brand-rounded mb-3 uppercase tracking-wider">Size: <span className="text-[#4A3728]/60">{selectedWeight}</span></h4>
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

            {/* Quantity stepper */}
            <div className="mb-6">
              <h4 className="text-xs font-bold brand-rounded mb-3 uppercase tracking-wider">Quantity</h4>
              <div className="inline-flex items-center border-2 border-coral/20 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-4 py-2.5 text-coral hover:bg-coral/5 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 font-bold brand-rounded text-sm text-[#4A3728] tabular-nums min-w-[2.5rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Increase quantity"
                  className="px-4 py-2.5 text-coral hover:bg-coral/5 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to cart + wishlist */}
            <div className="flex items-stretch gap-3 mb-6">
              <button
                disabled={product.outOfStock}
                onClick={handleAddToCart}
                className={`group/btn flex-1 py-4 px-5 rounded-2xl font-bold brand-rounded uppercase tracking-widest text-sm transition-all flex items-center justify-between gap-3 ${product.outOfStock ? 'bg-[#4A3728]/10 text-[#4A3728]/40 cursor-not-allowed' : 'bg-coral text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-coral/30'}`}
              >
                {product.outOfStock ? (
                  <span className="w-full text-center">Out of Stock</span>
                ) : (
                  <>
                    <span>Add to Bag</span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5 overflow-hidden">
                        <img src="https://ik.imagekit.io/amieshomemade/paytm-logo.svg" alt="Paytm" className="w-4 h-auto" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#5F259F] flex items-center justify-center shadow-sm ring-1 ring-black/5">
                        <span className="text-white text-[10px] font-black italic leading-none">पे</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5">
                        <svg width="12" height="12" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                          <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                          <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                          <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </button>
              <button aria-label="Add to wishlist" className="p-4 bg-pink-100 text-coral rounded-2xl hover:scale-105 transition-transform flex-shrink-0">
                <Heart size={20} fill="#F04E4E" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-1.5 text-[10px] font-bold brand-rounded uppercase text-[#4A3728]/50">
                <ShieldCheck size={13} className="text-green-500" /> Hygienic Prep
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold brand-rounded uppercase text-[#4A3728]/50">
                <Truck size={13} className="text-blue-500" /> Pan India Shipping
              </div>
            </div>

            {/* Accordions */}
            <div className="mt-6">
              <Accordion title="Product Description" defaultOpen>
                <p className="leading-relaxed">{product.description}</p>
              </Accordion>
              <Accordion title="Ingredients">
                <div className="flex flex-wrap gap-1.5">
                  {displayIngredients.map(i => (
                    <span key={i} className="text-xs text-[#4A3728]/80 bg-[#F6C94C]/15 px-2.5 py-1 rounded-full">• {i}</span>
                  ))}
                </div>
              </Accordion>
              <Accordion title="Additional Information">
                <ul className="space-y-1.5">
                  <li><span className="font-semibold text-[#4A3728]">Available sizes:</span> {(product.weights || [product.weight]).join(', ')}</li>
                  <li><span className="font-semibold text-[#4A3728]">Category:</span> {product.category}</li>
                  <li><span className="font-semibold text-[#4A3728]">Best before:</span> {product.shelfLife || '6 months'} from the date of packaging.</li>
                  <li>Handcrafted in small batches in Ahmedabad.</li>
                  <li>No artificial colours, flavours, or preservatives.</li>
                  {FSSAI_LICENSE && (
                    <li><span className="font-semibold text-[#4A3728]">FSSAI Lic. No.:</span> {FSSAI_LICENSE}</li>
                  )}
                </ul>
              </Accordion>
            </div>
          </div>
        </div>

        {/* ── You may also like ── */}
        {related.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4A3728] serif mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.slice(0, 4).map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={(prod) => onAddToCart(prod, prod.weights?.[0] || prod.weight)}
                  onOpen={(prod) => onSelectProduct?.(prod)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
