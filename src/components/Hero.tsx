import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onAboutClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopClick, onAboutClick }) => {
  return (
    <section className="relative min-h-[75vh] flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/15 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1589114115995-17a47545b778?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
          alt="Traditional Indian Sweets Background"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="max-w-2xl bg-[#FFF8EE]/90 backdrop-blur-xl p-10 sm:p-16 rounded-[4rem] border border-white/20 shadow-2xl relative animate-in fade-in slide-in-from-left duration-700">
          <div className="absolute -top-6 -right-6 bg-[#F6C94C] p-4 custom-curve animate-bounce shadow-xl">
            <Heart size={24} fill="#F04E4E" className="text-[#F04E4E]" />
          </div>

          <h2 className="text-[#F04E4E] brand-rounded uppercase tracking-[0.4em] font-black text-[10px] mb-6 flex items-center gap-2">
            Ami Shah's Secret Recipes
          </h2>
          <h1 className="text-5xl sm:text-7xl font-bold text-[#4A3728] mb-8 leading-[1.1] serif">
            Homemade with <span className="text-coral brand-script">Love.</span><br/>
            Packed with Tradition.
          </h1>
          <p className="text-[#4A3728]/70 text-lg mb-10 font-medium leading-relaxed max-w-md">
            Handcrafted Indian treats made in small batches with pure ingredients and the heartfelt care only a home kitchen can offer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onShopClick}
              className="px-12 py-5 bg-coral text-white rounded-full font-bold tracking-widest uppercase text-xs hover:scale-105 transition-all shadow-2xl shadow-coral/30 flex items-center gap-3 justify-center"
            >
              Shop Now <ArrowRight size={16} />
            </button>
            <button 
              onClick={onAboutClick}
              className="px-12 py-5 border-2 border-coral text-coral rounded-full font-bold tracking-widest uppercase text-xs hover:bg-coral hover:text-white transition-all"
            >
              Our Story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;