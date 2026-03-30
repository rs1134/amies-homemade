import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Product, Category } from '../types.ts';
import { PRODUCTS } from '../constants.ts';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  [Category.MUKHWAS]:  'bg-amber-100 text-amber-800',
  [Category.SNACKS]:   'bg-orange-100 text-orange-800',
  [Category.SWEETS]:   'bg-pink-100 text-pink-800',
  [Category.WELLNESS]: 'bg-green-100 text-green-700',
  [Category.GIFTING]:  'bg-purple-100 text-purple-700',
};

const POPULAR_QUERIES = ['Amla Ginger', 'Granola', 'Chakri', 'Pista Ghugra', 'Gift Hampers', 'Cranberry Mix'];

function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  const scored = PRODUCTS.map(p => {
    let score = 0;
    const name = p.name.toLowerCase();
    const cat  = p.category.toLowerCase();
    const desc = p.description.toLowerCase();
    const ings = p.ingredients.map(i => i.toLowerCase()).join(' ');

    if (name === q)                    score += 100;
    else if (name.startsWith(q))       score += 60;
    else if (name.includes(q))         score += 40;
    if (cat.includes(q))               score += 30;
    if (desc.includes(q))              score += 15;
    if (ings.includes(q))              score += 10;

    // multi-word: each word that matches across all fields
    q.split(/\s+/).forEach(word => {
      if (word.length > 1) {
        if (name.includes(word))       score += 8;
        if (cat.includes(word))        score += 6;
        if (desc.includes(word))       score += 4;
        if (ings.includes(word))       score += 4;
      }
    });
    return { product: p, score };
  });

  const filtered = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  // If the query matches a category, show ALL products in that category — no cap
  const isCategorySearch = Object.values(Category).some(cat =>
    cat.toLowerCase().includes(q) || q.includes(cat.toLowerCase().split(' ')[0])
  );

  const limit = isCategorySearch ? filtered.length : 12;
  return filtered.slice(0, limit).map(s => s.product);
}

function getDisplayPrice(p: Product): string {
  if (p.prices) {
    const firstKey = Object.keys(p.prices)[0];
    return `from ₹${p.prices[firstKey]}`;
  }
  return `₹${p.price}`;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<Product[]>([]);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef   = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setHighlighted(-1);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Live search
  useEffect(() => {
    const res = searchProducts(query);
    setResults(res);
    setHighlighted(-1);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(results[highlighted]);
    }
  }, [results, highlighted]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-idx="${highlighted}"]`) as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted]);

  const handleSelect = useCallback((product: Product) => {
    onSelectProduct(product);
    onClose();
  }, [onSelectProduct, onClose]);

  const handlePopular = useCallback((q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  }, []);

  if (!isOpen) return null;

  const showPopular = query.trim() === '';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop — click outside to close */}
      <div className="absolute inset-0 bg-[#2A1A0E]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-[#FFF8EE] rounded-2xl shadow-2xl overflow-hidden animate-search-in">

        {/* ── Search Input Row ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F04E4E]/10">
          <Search size={20} className="text-[#F04E4E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, ingredients, categories…"
            className="flex-1 bg-transparent text-[#4A3728] text-[17px] font-medium placeholder-[#4A3728]/35 outline-none brand-rounded"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-full hover:bg-[#F04E4E]/10 transition-colors">
              <X size={16} className="text-[#4A3728]/60" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-1 px-2.5 py-1 text-[11px] font-bold text-[#4A3728]/50 border border-[#4A3728]/20 rounded-md hover:bg-[#4A3728]/5 transition-colors tracking-wide"
          >
            ESC
          </button>
        </div>

        {/* ── Results / Popular ── */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto overscroll-contain">

          {/* Popular searches (empty state) */}
          {showPopular && (
            <div className="px-5 pt-5 pb-6">
              <p className="text-[11px] font-bold tracking-widest text-[#4A3728]/40 mb-3 uppercase">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => handlePopular(q)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#F04E4E]/20 rounded-full text-sm font-medium text-[#4A3728] hover:border-[#F04E4E] hover:text-[#F04E4E] transition-all"
                  >
                    <Tag size={11} className="text-[#F04E4E]" />
                    {q}
                  </button>
                ))}
              </div>

              {/* Browse by category */}
              <p className="text-[11px] font-bold tracking-widest text-[#4A3728]/40 mt-6 mb-3 uppercase">Browse by Category</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(Category).map(cat => (
                  <button
                    key={cat}
                    onClick={() => handlePopular(cat)}
                    className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#4A3728]/10 rounded-xl text-sm font-semibold text-[#4A3728] hover:border-[#F04E4E] hover:text-[#F04E4E] transition-all text-left"
                  >
                    <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat]?.split(' ')[0] || 'bg-gray-200'}`} />
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!showPopular && results.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-[#4A3728] font-semibold">No products found for "<span className="text-[#F04E4E]">{query}</span>"</p>
              <p className="text-[#4A3728]/50 text-sm mt-1">Try searching by ingredient or category</p>
            </div>
          )}

          {/* Search results */}
          {!showPopular && results.length > 0 && (
            <div className="py-2">
              <p className="px-5 pt-3 pb-1 text-[11px] font-bold tracking-widest text-[#4A3728]/40 uppercase">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((product, idx) => {
                const isActive = idx === highlighted;
                return (
                  <button
                    key={product.id}
                    data-idx={idx}
                    onClick={() => handleSelect(product)}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left group ${
                      isActive ? 'bg-[#F04E4E]/5' : 'hover:bg-[#4A3728]/[0.03]'
                    }`}
                  >
                    {/* Product image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#4A3728]/10 shrink-0 bg-white">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56x56?text=🍱'; }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-semibold text-[15px] truncate ${isActive ? 'text-[#F04E4E]' : 'text-[#4A3728]'} brand-rounded`}>
                          {product.name}
                        </p>
                        <p className="text-[#F04E4E] font-bold text-sm shrink-0">{getDisplayPrice(product)}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-600'}`}>
                          {product.category}
                        </span>
                        <p className="text-[#4A3728]/50 text-xs truncate">{product.weight}</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight
                      size={16}
                      className={`shrink-0 transition-all ${isActive ? 'text-[#F04E4E] translate-x-0 opacity-100' : 'text-[#4A3728]/20 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchOverlay;
