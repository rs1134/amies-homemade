import React from 'react';
import { PRODUCTS, WHATSAPP_NUMBER } from '../constants.ts';
import { CITIES, City } from '../cities.ts';
import { Category } from '../types.ts';
import { MapPin, ShieldCheck, Heart, Package, MessageCircle, ArrowRight, CheckCircle, Truck, Globe } from 'lucide-react';

interface Props {
  city: City | null;
  onShopClick: () => void;
  onNavigateToCity: (slug: string) => void;
  onNavigate: (page: string) => void;
}

const SHOWCASE_PRODUCTS = PRODUCTS.filter(p => p.category !== Category.GIFTING).slice(0, 4);

const STEPS = [
  { step: '01', title: 'Browse & Pick',            desc: 'Choose your favourite mukhwas, snacks or sweets from our full menu.' },
  { step: '02', title: 'Order via WhatsApp or Web', desc: 'Place your order on the website or message us on WhatsApp — we\'ll confirm and dispatch fast.' },
  { step: '03', title: 'Delivered to Your City',   desc: 'We pack securely and ship pan-India via trusted courier. No preservatives — always fresh.' },
];

const USPS = [
  { title: '100% Homemade',      desc: 'Made personally by Ami Shah — no factory, no shortcuts.',                      color: 'bg-[#FFF1F1]', textColor: 'text-[#F04E4E]', icon: <Heart size={20} /> },
  { title: 'No Preservatives',   desc: 'Pure ingredients, zero artificial additives — safe for the whole family.',      color: 'bg-[#FFF8E7]', textColor: 'text-[#D97706]', icon: <ShieldCheck size={20} /> },
  { title: 'Small Batches',      desc: 'Made fresh in limited quantities for maximum quality and freshness.',           color: 'bg-[#F0FFF4]', textColor: 'text-[#059669]', icon: <Package size={20} /> },
  { title: 'Pan-India Shipping', desc: 'We ship to every corner of India via trusted couriers — securely packed.',     color: 'bg-[#F0F4FF]', textColor: 'text-[#4F46E5]', icon: <Globe size={20} /> },
];

/* ─── Hub Page ────────────────────────────────────────────────────────────── */
const HubPage: React.FC<{ onNavigateToCity: (s: string) => void; onShopClick: () => void }> = ({ onNavigateToCity, onShopClick }) => (
  <div className="pt-24 pb-20 sm:pt-32 sm:pb-28 px-4 min-h-screen" style={{ background: '#FFF8EE' }}>
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">
          Pan-India Delivery · From Ahmedabad
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold serif text-[#4A3728] mb-6 leading-tight">
          Delivered to Your City,<br />
          <span className="text-coral">Anywhere in India</span>
        </h1>
        <div className="w-16 h-1.5 bg-coral rounded-full mx-auto mb-6" />
        <p className="max-w-2xl mx-auto text-[#4A3728]/70 text-lg leading-relaxed">
          Amie's Homemade ships authentic homemade mukhwas, snacks &amp; sweets from Ahmedabad to every major city across India.
          Select your city below to learn more.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {CITIES.map(c => (
          <button
            key={c.slug}
            onClick={() => onNavigateToCity(c.slug)}
            className="group bg-white p-6 rounded-[2rem] border border-coral/10 hover:border-coral/40 hover:shadow-xl hover:shadow-coral/10 hover:-translate-y-1 transition-all text-left"
          >
            <MapPin size={20} className="text-coral mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold serif text-[#4A3728] text-lg mb-1">{c.name}</h2>
            <p className="text-[10px] text-coral/70 brand-rounded font-bold uppercase tracking-widest mb-1">{c.state}</p>
            <p className="text-xs text-[#4A3728]/50 brand-rounded font-bold uppercase tracking-wide leading-snug line-clamp-2">{c.tagline}</p>
            <div className="flex items-center gap-1 mt-3 text-coral text-xs font-bold brand-rounded uppercase tracking-wide group-hover:gap-2 transition-all">
              See page <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] p-10 sm:p-16 text-center border border-coral/10 mb-10">
        <Truck size={36} className="text-coral mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mb-4">Don't see your city?</h2>
        <p className="text-[#4A3728]/60 mb-8 max-w-lg mx-auto">
          We ship to every pin code in India. WhatsApp us with your location and we'll arrange delivery right to your door.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent("Hi Ami! I'd like to order mukhwas & snacks for delivery to my city. Can you help?")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-5 bg-[#25D366] text-white rounded-full font-bold brand-rounded text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-[#25D366]/30 hover:scale-105 transition-all"
        >
          <MessageCircle size={18} /> WhatsApp Us
        </a>
      </div>

      <div className="text-center">
        <button
          onClick={onShopClick}
          className="px-12 py-5 bg-coral text-white rounded-full font-bold brand-rounded text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-coral/30 hover:scale-105 transition-all"
        >
          Shop All Products
        </button>
      </div>
    </div>
  </div>
);

/* ─── Individual City Page ────────────────────────────────────────────────── */
const CityPage: React.FC<{ city: City; onShopClick: () => void; onNavigateToCity: (s: string) => void; onNavigate: (p: string) => void }> =
  ({ city, onShopClick, onNavigateToCity, onNavigate }) => {
  const otherCities = CITIES.filter(c => c.slug !== city.slug).slice(0, 8);
  const waText = encodeURIComponent(`Hi Ami! I'd like to order mukhwas & snacks for delivery to ${city.name}, ${city.state}.`);

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="pt-24 pb-14 sm:pt-32 sm:pb-20 px-4" style={{ background: '#FFF8EE' }}>
        <div className="max-w-5xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center justify-center gap-2 text-xs text-[#4A3728]/50 brand-rounded font-bold uppercase tracking-widest mb-8">
            <button onClick={() => onNavigate('home')} className="hover:text-coral transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => onNavigateToCity('')} className="hover:text-coral transition-colors">Delivery Across India</button>
            <span>/</span>
            <span className="text-coral">{city.name}</span>
          </nav>

          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">
            Pan-India Delivery · {city.name}, {city.state}
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold serif text-[#4A3728] mb-6 leading-tight">
            Homemade Mukhwas &amp; Snacks<br />
            Delivered to <span className="text-coral">{city.name}</span>
          </h1>
          <div className="w-16 h-1.5 bg-coral rounded-full mx-auto mb-6" />
          <p className="max-w-2xl mx-auto text-[#4A3728]/70 text-lg leading-relaxed mb-10">
            {city.tagline}. Order fresh homemade mukhwas, chakli, ladoo, snacks &amp; sweets made by Ami Shah in Ahmedabad —
            shipped directly to your door in {city.name}. No preservatives. Made in small batches with love.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShopClick}
              className="px-10 py-5 bg-coral text-white rounded-full font-bold brand-rounded text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-coral/30 hover:scale-105 transition-all flex items-center gap-2 justify-center"
            >
              Order Now <ArrowRight size={16} />
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-[#25D366] text-white rounded-full font-bold brand-rounded text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-[#25D366]/30 hover:scale-105 transition-all flex items-center gap-2 justify-center"
            >
              <MessageCircle size={16} /> WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {/* ── Shipping Note ── */}
      <section className="py-8 px-4 bg-white border-b border-coral/5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          {[
            { icon: <Truck size={20} />, label: 'Pan-India Shipping', sub: 'Delivered to ' + city.name },
            { icon: <Package size={20} />, label: 'Secure Packaging', sub: 'Travel-safe & fresh' },
            { icon: <CheckCircle size={20} />, label: '2–5 Business Days', sub: 'Estimated delivery time' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-coral/10 text-coral flex items-center justify-center shrink-0">{item.icon}</div>
              <div className="text-left">
                <p className="font-bold brand-rounded text-xs uppercase tracking-widest text-[#4A3728]">{item.label}</p>
                <p className="text-xs text-[#4A3728]/50">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular Products ── */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">Most Loved</span>
            <h2 className="text-3xl sm:text-4xl font-bold serif text-[#4A3728]">Popular Picks for {city.name}</h2>
            <div className="w-12 h-1 bg-coral rounded-full mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOWCASE_PRODUCTS.map(product => (
              <button
                key={product.id}
                onClick={onShopClick}
                className="group bg-[#FFF8EE] rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all text-left border border-transparent hover:border-coral/10"
              >
                {product.image && (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={`${product.name} delivery ${city.name} ${city.state}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-[#4A3728] serif text-sm sm:text-base">{product.name}</h3>
                  <p className="text-coral font-bold brand-rounded text-xs mt-1">from ₹{product.price}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={onShopClick} className="text-coral font-bold brand-rounded text-xs uppercase tracking-[0.2em] hover:underline flex items-center gap-2 mx-auto">
              View All Products <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-16 sm:py-24 px-4" style={{ background: '#FFF8EE' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold serif text-[#4A3728]">The Amie's Promise</h2>
            <div className="w-12 h-1 bg-coral rounded-full mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {USPS.map((u, i) => (
              <div key={i} className={`${u.color} p-6 sm:p-10 rounded-[2.5rem] text-center hover:shadow-xl hover:-translate-y-1 transition-all`}>
                <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center ${u.textColor} mb-4 mx-auto`}>
                  {u.icon}
                </div>
                <h3 className={`font-bold brand-rounded text-xs uppercase tracking-widest ${u.textColor} mb-3`}>{u.title}</h3>
                <p className="text-[#4A3728]/70 text-sm leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Order ── */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">Simple &amp; Easy</span>
            <h2 className="text-3xl sm:text-4xl font-bold serif text-[#4A3728]">How to Order in {city.name}</h2>
            <div className="w-12 h-1 bg-coral rounded-full mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="text-center p-8 rounded-[2.5rem] border border-coral/10" style={{ background: '#FFF8EE' }}>
                <div className="w-14 h-14 rounded-full bg-coral text-white flex items-center justify-center font-bold brand-rounded text-sm mx-auto mb-6">
                  {s.step}
                </div>
                <h3 className="font-bold serif text-[#4A3728] text-xl mb-3">{s.title}</h3>
                <p className="text-[#4A3728]/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 px-4" style={{ background: '#FFF8EE' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold serif text-[#4A3728]">FAQs — Delivery to {city.name}</h2>
            <div className="w-12 h-1 bg-coral rounded-full mx-auto mt-4" />
          </div>
          <div className="space-y-4">
            {[
              {
                q: `Do you deliver homemade mukhwas to ${city.name}?`,
                a: `Yes! We ship our fresh homemade mukhwas, snacks and sweets from Ahmedabad to ${city.name}, ${city.state} via trusted courier partners across India.`,
              },
              {
                q: `How long does shipping to ${city.name} take?`,
                a: `Orders to ${city.name} typically arrive within 2–5 business days. WhatsApp us at ${WHATSAPP_NUMBER} and we'll give you a more precise estimate based on your pin code.`,
              },
              {
                q: 'Is the packaging secure for long-distance shipping?',
                a: 'Absolutely. Every order is packed with care to survive transit and stay fresh. Our airtight jars and tamper-evident packaging ensure your mukhwas arrive in perfect condition.',
              },
              {
                q: 'What products can I order for delivery to my city?',
                a: 'You can order our full range — mukhwas, chakli, ladoo, masalas, snacks and festive gift hampers — all made fresh with zero preservatives by Ami Shah in Ahmedabad.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-coral/10">
                <div className="flex items-start gap-4">
                  <CheckCircle size={18} className="text-coral mt-1 shrink-0" />
                  <div>
                    <h3 className="font-bold text-[#4A3728] serif text-lg mb-2">{faq.q}</h3>
                    <p className="text-[#4A3728]/65 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Cities ── */}
      <section className="py-14 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold serif text-[#4A3728] mb-8">We Also Deliver To</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {otherCities.map(c => (
              <button
                key={c.slug}
                onClick={() => onNavigateToCity(c.slug)}
                className="px-6 py-3 rounded-full border-2 border-coral/15 text-[#4A3728]/70 brand-rounded text-xs font-bold uppercase tracking-wider hover:border-coral hover:text-coral hover:bg-coral/5 transition-all flex items-center gap-2"
              >
                <MapPin size={12} /> {c.name}
              </button>
            ))}
            <button
              onClick={() => onNavigateToCity('')}
              className="px-6 py-3 rounded-full border-2 border-[#4A3728]/10 text-[#4A3728]/50 brand-rounded text-xs font-bold uppercase tracking-wider hover:border-[#4A3728]/30 hover:text-[#4A3728]/80 transition-all flex items-center gap-2"
            >
              View all cities <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 sm:py-20 px-4 bg-coral">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold serif text-white mb-4">
            Order Mukhwas &amp; Snacks in {city.name} Today
          </h2>
          <p className="text-white/80 mb-8 text-lg">Fresh. Homemade. Shipped from Ahmedabad to your door.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onShopClick}
              className="px-10 py-5 bg-white text-coral rounded-full font-bold brand-rounded text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all flex items-center gap-2 justify-center"
            >
              Shop Now <ArrowRight size={16} />
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-white/10 border-2 border-white/40 text-white rounded-full font-bold brand-rounded text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center gap-2 justify-center"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ─── Main Export ─────────────────────────────────────────────────────────── */
const CityDeliveryPage: React.FC<Props> = ({ city, onShopClick, onNavigateToCity, onNavigate }) => {
  if (!city) return <HubPage onNavigateToCity={onNavigateToCity} onShopClick={onShopClick} />;
  return <CityPage city={city} onShopClick={onShopClick} onNavigateToCity={onNavigateToCity} onNavigate={onNavigate} />;
};

export default CityDeliveryPage;
