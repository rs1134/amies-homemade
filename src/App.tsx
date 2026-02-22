import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, Product, CartItem } from './types.ts';
import { PRODUCTS, WHATSAPP_NUMBER } from './constants.ts';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ProductCard from './components/ProductCard.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import AboutUs from './components/AboutUs.tsx';
import GiftingView from './components/GiftingView.tsx';
import CheckoutView from './components/CheckoutView.tsx';
import Cart from './components/Cart.tsx';
import Footer from './components/Footer.tsx';
import AIRecommendation from './components/AIRecommendation.tsx';
import Reviews from './components/Reviews.tsx';
import { Sparkles, ArrowRight, MessageCircle, CheckCircle, Heart, ShieldCheck, History, Package, Users, Mail, Building2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  // Scroll to top on every page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const filteredProducts = useMemo(() => {
    // Exclude gifting from the standard shop list to keep it exclusive
    const availableProducts = PRODUCTS.filter(p => p.category !== Category.GIFTING);
    if (activeCategory === 'All') return availableProducts;
    return availableProducts.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const addToCart = useCallback((product: Product, weight?: string, subOptionName?: string) => {
    const finalWeight = weight || product.weight;
    
    // Determine the active price based on variety selection or defaults
    let finalPrice = product.price;
    let displayName = product.name;

    if (product.subOptions && subOptionName) {
      const option = product.subOptions.find(o => o.name === subOptionName);
      if (option) {
        finalPrice = option.prices[finalWeight] || option.prices[product.weight] || product.price;
        displayName = option.name;
      }
    } else if (product.prices) {
      finalPrice = product.prices[finalWeight] || product.price;
    }

    setCart(prev => {
      // Uniqueness is based on product ID + weight + variety name + ingredients (crucial for personalized hampers)
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedWeight === finalWeight && 
        item.selectedSubOption === subOptionName &&
        JSON.stringify(item.ingredients) === JSON.stringify(product.ingredients)
      );
      
      if (existing) {
        return prev.map(item => (
          item.id === product.id && 
          item.selectedWeight === finalWeight && 
          item.selectedSubOption === subOptionName &&
          JSON.stringify(item.ingredients) === JSON.stringify(product.ingredients)
        )
          ? { ...item, quantity: item.quantity + 1, price: finalPrice } 
          : item
        );
      }
      return [...prev, { 
        ...product, 
        name: displayName, // Use variety name if available
        quantity: 1, 
        selectedWeight: finalWeight, 
        selectedSubOption: subOptionName,
        price: finalPrice 
      }];
    });
    setSelectedProduct(null);
    setIsCartOpen(true);
  }, [setSelectedProduct, setIsCartOpen]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderPage = () => {
    if (orderComplete) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div className="max-w-md bg-white p-12 rounded-[4rem] shadow-2xl border border-coral/5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8 animate-bounce">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-4xl font-bold serif text-[#4A3728] mb-4">Order Received!</h2>
            <p className="text-[#4A3728]/60 mb-8 brand-rounded font-bold uppercase text-xs tracking-widest">Ami Shah is preparing your treats right now with love.</p>
            <button 
              onClick={() => { setOrderComplete(false); setCurrentPage('home'); setCart([]); }}
              className="px-10 py-4 bg-coral text-white rounded-full font-bold uppercase brand-rounded text-xs tracking-widest hover:scale-105 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'about': return <AboutUs />;
      case 'gifting': return <GiftingView onAddToCart={(p) => addToCart(p)} onSelectProduct={(p) => setSelectedProduct(p)} />;
      case 'shop': return (
        <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 text-center md:text-left">
            <div>
              <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em]">Fresh from Our Kitchen</span>
              <h2 className="text-4xl sm:text-6xl font-bold text-[#4A3728] serif mt-4 leading-tight">Handcrafted Treats</h2>
              <div className="w-20 h-1.5 bg-coral rounded-full mx-auto md:mx-0 mt-4"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {['All', ...Object.values(Category).filter(c => c !== Category.GIFTING)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`brand-rounded text-[10px] uppercase tracking-[0.2em] font-bold transition-all px-8 py-3 rounded-full border-2 ${
                    activeCategory === cat 
                      ? 'bg-[#F04E4E] border-[#F04E4E] text-white shadow-xl shadow-[#F04E4E]/30 scale-105' 
                      : 'border-[#F04E4E]/10 text-[#4A3728]/50 hover:text-coral hover:bg-[#F04E4E]/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={(p) => setSelectedProduct(p)} 
              />
            ))}
          </div>
        </section>
      );
      case 'checkout': return (
        <CheckoutView 
          items={cart} 
          total={cartTotal} 
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onComplete={() => setOrderComplete(true)} 
        />
      );
      case 'contact': return (
        <div className="pt-32 pb-24 px-4 text-center min-h-screen">
          <h1 className="text-5xl sm:text-7xl font-bold serif mb-8 text-[#4A3728]">Let's Talk</h1>
          <p className="max-w-2xl mx-auto text-[#4A3728]/60 mb-16 text-lg">
            Whether you're looking for a small treat or planning a grand celebration, we're here to help you share the taste of tradition.
          </p>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* General Inquiry Card */}
            <div className="bg-white p-10 sm:p-14 rounded-[3.5rem] shadow-2xl border border-coral/5 flex flex-col items-center group hover:-translate-y-2 transition-all duration-500">
              <div className="w-20 h-20 bg-coral/5 rounded-[2rem] flex items-center justify-center text-coral mb-8 group-hover:scale-110 group-hover:bg-coral group-hover:text-white transition-all duration-500">
                <MessageCircle size={36} />
              </div>
              <h3 className="text-3xl font-bold serif mb-4 text-[#4A3728]">General Inquiry</h3>
              <p className="text-[#4A3728]/60 mb-10 font-medium leading-relaxed max-w-xs">
                Have a question about our products, orders, or just want to say hello?
              </p>
              <div className="w-full space-y-4">
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi%20Amie!%20I%20have%20a%20question%20about%20my%20order%20from%20Amie's%20Homemade.%20Could%20you%20please%20help%20me?`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.2em] text-[10px] hover:shadow-2xl hover:shadow-[#25D366]/30 transition-all active:scale-95"
                >
                  <MessageCircle size={20} /> Chat on WhatsApp
                </a>
                <div className="py-5 px-8 bg-cream rounded-[1.5rem] border border-coral/10 text-coral font-bold text-xs brand-rounded break-all flex items-center justify-center gap-3">
                  <Mail size={16} /> hello@amieshomemade.com
                </div>
              </div>
            </div>

            {/* Bulk & Wholesale Card */}
            <div className="bg-white p-10 sm:p-14 rounded-[3.5rem] shadow-2xl border border-[#F6C94C]/20 flex flex-col items-center group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6C94C]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="w-20 h-20 bg-[#F6C94C]/10 rounded-[2rem] flex items-center justify-center text-[#D97706] mb-8 group-hover:scale-110 group-hover:bg-[#F6C94C] group-hover:text-[#4A3728] transition-all duration-500">
                <Building2 size={36} />
              </div>
              <h3 className="text-3xl font-bold serif mb-4 text-[#4A3728]">Bulk & Wholesale</h3>
              <p className="text-[#4A3728]/60 mb-10 font-medium leading-relaxed max-w-xs">
                Perfect for Wedding Favors, Corporate Gifting, or stocking in your premium retail store.
              </p>
              <div className="w-full space-y-6">
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi%20Ami!%20I%20would%20like%20to%20inquire%20about%20Bulk%20Orders%20and%20Wholesale%20Pricing%20for%20Amie's%20Homemade.%20Could%20you%20please%20share%20your%20catalog%20and%20wholesale%20price%20list?%20Thank%20you!`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-[#F04E4E] text-white rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.2em] text-[10px] hover:shadow-2xl hover:shadow-coral/30 transition-all active:scale-95"
                >
                  <Sparkles size={20} /> Get Wholesale Prices
                </a>
                
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Custom Brand Labeling Available",
                    "Special Wedding Favor Packs",
                    "Tiered Wholesale Pricing",
                    "Pan-India Bulk Shipping"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-[#4A3728]/70 brand-rounded uppercase tracking-widest bg-[#F6C94C]/5 py-2 px-4 rounded-xl border border-[#F6C94C]/10">
                      <CheckCircle size={14} className="text-[#D97706]" /> {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      default: return (
        <>
          <Hero 
            onShopClick={() => setCurrentPage('shop')} 
            onAboutClick={() => setCurrentPage('about')}
          />
          {/* Restored padding to pt-20 for better alignment as pt-0 was too tight */}
          <section className="pt-20 pb-24 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] mb-4 block">The Amie's Difference</span>
              <h2 className="text-4xl sm:text-5xl font-bold serif text-[#4A3728]">Why Everyone Loves amie's</h2>
              <div className="w-16 h-1 bg-coral mx-auto rounded-full mt-6"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  title: "100% Homemade", 
                  desc: "Every treat is personally crafted by Ami Shah in her home kitchen, ensuring the same authentic warmth and care you'd find in a mother's cooking.", 
                  color: "bg-[#FFF1F1]",
                  textColor: "text-[#F04E4E]",
                  icon: <Heart size={20} />
                },
                { 
                  title: "No Preservatives", 
                  desc: "We believe in the purity of nature. Our products contain zero artificial colors or chemicals, preserving the genuine goodness of real ingredients.", 
                  color: "bg-[#FFF8E7]",
                  textColor: "text-[#D97706]",
                  icon: <ShieldCheck size={20} />
                },
                { 
                  title: "Family Recipes", 
                  desc: "Rooted in generations of culinary wisdom, our recipes are kept secret to preserve the nostalgic flavors of traditional Indian households.", 
                  color: "bg-[#FFF0F7]",
                  textColor: "text-[#DB2777]",
                  icon: <History size={20} />
                },
                { 
                  title: "Small Batches", 
                  desc: "By cooking in limited quantities, we maintain rigorous hygiene standards and ensure that every single jar delivers the highest level of freshness.", 
                  color: "bg-[#F0FFF4]",
                  textColor: "text-[#059669]",
                  icon: <Package size={20} />
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`${item.color} p-12 rounded-[4rem] text-center hover:shadow-2xl hover:shadow-[#4A3728]/5 hover:-translate-y-2 transition-all duration-500 flex flex-col items-center group`}
                >
                  <div className={`mb-6 p-4 rounded-3xl bg-white shadow-sm ${item.textColor} group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h4 className={`font-bold brand-rounded text-sm uppercase mb-6 tracking-[0.15em] ${item.textColor}`}>
                    {item.title}
                  </h4>
                  <p className="text-[13px] text-[#4A3728]/70 leading-[1.8] font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
          
          <Reviews />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)} 
        onNavigate={setCurrentPage} 
        currentPage={currentPage}
      />
      
      <main className="relative z-10">
        {renderPage()}
        
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 group px-8 brand-rounded font-bold"
        >
          <MessageCircle size={24} />
          <span className="text-xs uppercase tracking-wider hidden sm:block">Chat with us</span>
        </a>

        <AIRecommendation onSelectProduct={(p) => setSelectedProduct(p)} />
      </main>

      <Footer onNavigate={setCurrentPage} />

      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={addToCart} 
        />
      )}

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => { setIsCartOpen(false); setCurrentPage('checkout'); }}
      />
    </div>
  );
};

export default App;