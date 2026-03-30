import React from 'react';
import { ShoppingCart, Menu, X, Gift, Search } from 'lucide-react';
import { CartItem } from '../types.ts';
import Logo from './Logo.tsx';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onNavigate: (page: string) => void;
  onSearchOpen: () => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, onNavigate, onSearchOpen, currentPage }) => {
  const [isOpen, setIsOpen] = React.useState(false);


  return (
    <nav className="fixed w-full bg-[#FFF8EE]/90 backdrop-blur-md z-50 border-b border-[#F04E4E]/10">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-6">
            <button className="md:hidden p-2 text-[#4A3728]" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button onClick={() => onNavigate('home')} className="flex items-center transition-transform hover:scale-105 active:scale-95">
              {/* CHANGE LOGO SIZE HERE: Change "h-16" to your preferred height (e.g., h-16, h-20, h-[100px]) */}
              <Logo manualHeight="h-16" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8 uppercase text-[15px] tracking-widest font-bold brand-rounded">
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className={`transition-colors ${currentPage === 'home' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>Home</a>
            <a href="/shop" onClick={(e) => { e.preventDefault(); onNavigate('shop'); }} className={`transition-colors ${currentPage === 'shop' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>Shop All</a>
            <a href="/gifting" onClick={(e) => { e.preventDefault(); onNavigate('gifting'); }} className={`transition-colors flex items-center gap-2 ${currentPage === 'gifting' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>
              <Gift size={14} className={currentPage === 'gifting' ? 'text-[#F04E4E]' : ''} /> Gifting
            </a>
            <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className={`transition-colors ${currentPage === 'about' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>Our Story</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className={`transition-colors ${currentPage === 'contact' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>Contact</a>
            <a href="/blog" onClick={(e) => { e.preventDefault(); onNavigate('blog'); }} className={`transition-colors ${currentPage === 'blog' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>Blog</a>
            <a href="/faq" onClick={(e) => { e.preventDefault(); onNavigate('faq'); }} className={`transition-colors ${currentPage === 'faq' ? 'text-[#F04E4E]' : 'text-[#4A3728]/80 hover:text-[#F04E4E]'}`}>FAQ</a>
          </div>

          <div className="flex items-center space-x-1">
            {/* Search icon */}
            <button
              onClick={onSearchOpen}
              className="p-2 text-[#4A3728] hover:text-[#F04E4E] transition-colors"
              title="Search (⌘K)"
            >
              <Search size={22} />
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-[#4A3728] hover:text-[#F04E4E] transition-colors flex items-center gap-2"
            >
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

      {isOpen && (
        <div className="md:hidden bg-[#FFF8EE] border-b border-[#F04E4E]/10 animate-fade-in-down shadow-xl brand-rounded font-bold text-center py-8">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); setIsOpen(false); }} className="block w-full py-3">Home</a>
          <a href="/shop" onClick={(e) => { e.preventDefault(); onNavigate('shop'); setIsOpen(false); }} className="block w-full py-3">Shop All</a>
          <a href="/gifting" onClick={(e) => { e.preventDefault(); onNavigate('gifting'); setIsOpen(false); }} className="block w-full py-3">Gifting</a>
          <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); setIsOpen(false); }} className="block w-full py-3">Our Story</a>
          <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); setIsOpen(false); }} className="block w-full py-3">Contact</a>
          <a href="/blog" onClick={(e) => { e.preventDefault(); onNavigate('blog'); setIsOpen(false); }} className="block w-full py-3">Blog</a>
          <a href="/faq" onClick={(e) => { e.preventDefault(); onNavigate('faq'); setIsOpen(false); }} className="block w-full py-3">FAQ</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;