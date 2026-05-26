import React from 'react';
import { ShoppingCart, Menu, X, Gift, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Category, Product } from '../types.ts';
import { PRODUCTS } from '../constants.ts';
import Logo from './Logo.tsx';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onNavigate: (page: string) => void;
  onSearchOpen: () => void;
  currentPage: string;
  onNavigateToCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
}

const MEGA_CATEGORIES = [
  { label: 'Mukhwas',            category: Category.MUKHWAS  },
  { label: 'Gujarati Snacks',    category: Category.SNACKS   },
  { label: 'Traditional Sweets', category: Category.SWEETS   },
  { label: 'Health & Wellness',  category: Category.WELLNESS },
];

const Navbar: React.FC<NavbarProps> = ({
  cartCount, onCartClick, onNavigate, onSearchOpen, currentPage,
  onNavigateToCategory, onSelectProduct,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<Category | null>(null);
  const [mobileExpanded, setMobileExpanded] = React.useState<Category | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = (cat: Category) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(cat);
  };
  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const productsFor = (cat: Category) =>
    PRODUCTS.filter(p => p.category === cat && !p.outOfStock && !p.isGift);

  return (
    <nav className="fixed w-full bg-[#FFF8EE]/90 backdrop-blur-md z-50 border-b border-[#F04E4E]/10 top-[40px]">

      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo + hamburger */}
          <div className="flex items-center gap-6">
            <button className="md:hidden p-2 text-[#4A3728]" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button onClick={() => onNavigate('home')} className="flex items-center transition-transform hover:scale-105 active:scale-95">
              <Logo manualHeight="h-16" />
            </button>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8 uppercase text-[15px] tracking-widest font-bold brand-rounded">
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
              className={`transition-colors ${currentPage === 'home' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              Home
            </a>
            <a href="/shop" onClick={(e) => { e.preventDefault(); onNavigate('shop'); }}
              className={`transition-colors ${currentPage === 'shop' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              Shop All
            </a>
            <a href="/gifting" onClick={(e) => { e.preventDefault(); onNavigate('gifting'); }}
              className={`transition-colors flex items-center gap-2 ${currentPage === 'gifting' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              <Gift size={14} className={currentPage === 'gifting' ? 'text-[#F04E4E]' : ''} /> Gifting
            </a>
            <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}
              className={`transition-colors ${currentPage === 'about' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              Our Story
            </a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}
              className={`transition-colors ${currentPage === 'contact' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              Contact
            </a>
            <a href="/blog" onClick={(e) => { e.preventDefault(); onNavigate('blog'); }}
              className={`transition-colors ${currentPage === 'blog' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              Blog
            </a>
            <a href="/faq" onClick={(e) => { e.preventDefault(); onNavigate('faq'); }}
              className={`transition-colors ${currentPage === 'faq' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              FAQ
            </a>
          </div>

          {/* Search + Cart */}
          <div className="flex items-center space-x-1">
            <button onClick={onSearchOpen} className="p-2 text-[#4A3728] hover:text-[#F04E4E] transition-colors" title="Search (⌘K)">
              <Search size={22} />
            </button>
            <button onClick={onCartClick} className="relative p-2 text-[#4A3728] hover:text-[#F04E4E] transition-colors flex items-center gap-2">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F04E4E] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-[#FFF8EE]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category strip (desktop only) ────────────────────────── */}
      <div className="hidden md:block border-t border-[#F04E4E]/10 bg-[#FFF8EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          {MEGA_CATEGORIES.map(({ label, category }) => {
            const products = productsFor(category);
            const isActive = activeDropdown === category;
            return (
              <div
                key={category}
                className="relative"
                onMouseEnter={() => openDropdown(category)}
                onMouseLeave={closeDropdown}
              >
                {/* Category tab */}
                <button
                  onClick={() => { onNavigateToCategory(category); setActiveDropdown(null); }}
                  className={`flex items-center gap-1.5 px-5 py-2.5 text-[11px] font-bold brand-rounded uppercase tracking-widest transition-all border-b-2 ${
                    isActive
                      ? 'text-[#F04E4E] border-[#F04E4E]'
                      : 'text-[#4A3728]/60 border-transparent hover:text-[#F04E4E] hover:border-[#F04E4E]/40'
                  }`}
                >
                  {label}
                  <ChevronDown size={11} className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown panel */}
                {isActive && (
                  <div
                    className="absolute left-0 top-full pt-1 z-50"
                    onMouseEnter={() => openDropdown(category)}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-[#4A3728]/8 overflow-hidden min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* View all header */}
                      <button
                        onClick={() => { onNavigateToCategory(category); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-3 text-[10px] font-black brand-rounded uppercase tracking-widest text-[#F04E4E] bg-[#F04E4E]/5 hover:bg-[#F04E4E]/10 transition-colors flex items-center justify-between"
                      >
                        <span>View All {label}</span>
                        <ChevronRight size={12} />
                      </button>

                      {/* Individual products */}
                      <div className="py-1.5">
                        {products.map(product => (
                          <button
                            key={product.id}
                            onClick={() => { onSelectProduct(product); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-2.5 text-[13px] text-[#4A3728]/80 hover:text-[#F04E4E] hover:bg-[#F04E4E]/5 transition-colors font-medium flex items-center gap-2 group/item"
                          >
                            <span className="w-1 h-1 rounded-full bg-[#4A3728]/20 group-hover/item:bg-[#F04E4E] transition-colors flex-shrink-0" />
                            {product.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {isOpen && (
        <div className="md:hidden bg-[#FFF8EE] border-b border-[#F04E4E]/10 shadow-xl brand-rounded font-bold text-center py-4">
          <a href="/"       onClick={(e) => { e.preventDefault(); onNavigate('home');    setIsOpen(false); }} className="block w-full py-3">Home</a>
          <a href="/shop"   onClick={(e) => { e.preventDefault(); onNavigate('shop');    setIsOpen(false); }} className="block w-full py-3">Shop All</a>
          <a href="/gifting" onClick={(e) => { e.preventDefault(); onNavigate('gifting'); setIsOpen(false); }} className="block w-full py-3">Gifting</a>
          <a href="/about"  onClick={(e) => { e.preventDefault(); onNavigate('about');   setIsOpen(false); }} className="block w-full py-3">Our Story</a>
          <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); setIsOpen(false); }} className="block w-full py-3">Contact</a>
          <a href="/blog"   onClick={(e) => { e.preventDefault(); onNavigate('blog');    setIsOpen(false); }} className="block w-full py-3">Blog</a>
          <a href="/faq"    onClick={(e) => { e.preventDefault(); onNavigate('faq');     setIsOpen(false); }} className="block w-full py-3">FAQ</a>

          {/* Mobile category expanders */}
          <div className="mt-3 border-t border-[#F04E4E]/10 pt-3 text-left px-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#4A3728]/40 mb-2 px-1">Browse By Category</p>
            {MEGA_CATEGORIES.map(({ label, category }) => (
              <div key={category}>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === category ? null : category)}
                  className="w-full flex items-center justify-between py-2.5 px-1 text-[13px] text-[#4A3728] font-bold"
                >
                  <span>{label}</span>
                  <ChevronDown size={14} className={`transition-transform ${mobileExpanded === category ? 'rotate-180' : ''}`} />
                </button>
                {mobileExpanded === category && (
                  <div className="pb-2 pl-3">
                    <button
                      onClick={() => { onNavigateToCategory(category); setIsOpen(false); setMobileExpanded(null); }}
                      className="block w-full text-left py-2 text-[11px] font-black uppercase tracking-widest text-[#F04E4E]"
                    >
                      View All →
                    </button>
                    {productsFor(category).map(p => (
                      <button
                        key={p.id}
                        onClick={() => { onSelectProduct(p); setIsOpen(false); setMobileExpanded(null); }}
                        className="block w-full text-left py-2 text-[13px] text-[#4A3728]/70 font-medium"
                      >
                        • {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
