import React from 'react';
import { PRODUCTS, WHATSAPP_NUMBER } from '../constants.ts';
import { DELIVERY_AREAS, DeliveryArea } from '../deliveryAreas.ts';
import { Category } from '../types.ts';
import { MapPin, ShieldCheck, Heart, Package, MessageCircle, ArrowRight, CheckCircle, Truck } from 'lucide-react';

interface Props {
  area: DeliveryArea | null;
  onShopClick: () => void;
  onNavigateToArea: (slug: string) => void;
  onNavigate: (page: string) => void;
}

const SHOWCASE_PRODUCTS = PRODUCTS.filter(p => p.category !== Category.GIFTING).slice(0, 4);

const STEPS = [
  { step: '01', title: 'Browse & Pick',           desc: 'Choose your favourite mukhwas, snacks or sweets from our menu.' },
  { step: '02', title: 'Order Online or WhatsApp', desc: 'Place your order on the website or send us a quick WhatsApp message.' },
  { step: '03', title: 'Delivered Fresh',          desc: 'We pack and deliver fresh to your doorstep — no preservatives, ever.' },
];

const USPS = [
  { title: '100% Homemade',     desc: 'Made personally by Ami Shah — no factory, no shortcuts.',           color: 'bg-[#FFF1F1]', textColor: 'text-[#F04E4E]', icon: <Heart size={20} /> },
  { title: 'No Preservatives',  desc: 'Pure ingredients, zero artificial additives.',                     color: 'bg-[#FFF8E7]', textColor: 'text-[#D97706]', icon: <ShieldCheck size={20} /> },
  { title: 'Small Batches',     desc: 'Made fresh in limited quantities for maximum quality.',             color: 'bg-[#F0FFF4]', textColor: 'text-[#059669]', icon: <Package size={20} /> },
  { title: 'Pan-India Delivery',desc: 'We ship to every corner of India, not just Ahmedabad.',            color: 'bg-[#F0F4FF]', textColor: 'text-[#4F46E5]', icon: <Truck size={20} /> },
];

/* ─── Hub Page ────────────────────────────────────────────────────────────── */
const HubPage: React.FC<{ onNavigateToArea: (s: string) => void; onShopClick: () => void }> = ({ onNavigateToArea, onShopClick }) => (
  <div className="pt-24 pb-20 sm:pt-32 sm:pb-28 px-4 min-h-screen" style={{ background: '#FFF8EE' }}>
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">
          Homemade · Ahmedabad
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold serif text-[#4A3728] mb-6 leading-tight">
          We Deliver Across<br />
          <span className="text-coral brand-script">Ahmedabad</span>
        </h1>
        <div className="w-16 h-1.5 bg-coral rounded-full mx-auto mb-6" />
        <p className="max-w-2xl mx-auto text-[#4A3728]/70 text-lg leading-relaxed">
          Fresh homemade mukhwas, snacks &amp; sweets delivered to your doorstep across every neighbourhood in Ahmedabad. Select your area below.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {DELIVERY_AREAS.map(a => (
          <button
            key={a.slug}
            onClick={() => onNavigateToArea(a.slug)}
            className="group bg-white p-6 rounded-[2rem] border border-coral/10 hover:border-coral/40 hover:shadow-xl hover:shadow-coral/10 hover:-translate-y-1 transition-all text-left"
          >
            <MapPin size={20} className="text-coral mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold serif text-[#4A3728] text-lg mb-1">{a.name}</h2>
            <p className="text-xs text-[#4A3728]/50 brand-rounded font-bold uppercase tracking-wide leading-snug line-clamp-2">{a.tagline}</p>
            <div className="flex items-center gap-1 mt-3 text-coral text-xs font-bold brand-rounded uppercase tracking-wide group-hover:gap-2 transition-all">
              See page <ArrowRight size={12} />
            </div>
          </button>
        ))}
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

/* ─── Individual Area Page ────────────────────────────────────────────────── */
const AreaPage: React.FC<{ area: DeliveryArea; onShopClick: () => void; onNavigateToArea: (s: string) => void; onNavigate: (p: string) => void }> =
  ({ area, onShopClick, onNavigateToArea, onNavigate }) => {
  const otherAreas = DELIVERY_AREAS.filter(a => a.slug !== area.slug).slice(0, 8);
  const waText = encodeURIComponent(`Hi Ami! I'd like to order mukhwas & snacks for delivery to ${area.name}, Ahmedabad.`);

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="pt-24 pb-14 sm:pt-32 sm:pb-20 px-4" style={{ background: '#FFF8EE' }}>
        <div className="max-w-5xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center justify-center gap-2 text-xs text-[#4A3728]/50 brand-rounded font-bold uppercase tracking-widest mb-8">
            <button onClick={() => onNavigate('home')} className="hover:text-coral transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => onNavigateToArea('')} className="hover:text-coral transition-colors">Delivery in Ahmedabad</button>
            <span>/</span>
            <span className="text-coral">{area.name}</span>
          </nav>

          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">
            Delivery in {area.name} · Ahmedabad
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold serif text-[#4A3728] mb-6 leading-tight">
            Homemade Mukhwas &amp; Snacks<br />
            Delivered to <span className="text-coral">{area.name}</span>
          </h1>
          <div className="w-16 h-1.5 bg-coral rounded-full mx-auto mb-6" />
          <p className="max-w-2xl mx-auto text-[#4A3728]/70 text-lg leading-relaxed mb-10">
            {area.tagline}. Order fresh homemade mukhwas, chakli, ladoo, snacks &amp; sweets made by Ami Shah —
            delivered right to your door in {area.name}, Ahmedabad.
            No preservatives. Made in small batches with love.
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

      {/* ── Popular Products ── */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">Most Loved</span>
            <h2 className="text-3xl sm:text-4xl font-bold serif text-[#4A3728]">Popular in {area.name}</h2>
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
                      alt={`${product.name} delivery ${area.name} Ahmedabad`}
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
            <h2 className="text-3xl sm:text-4xl font-bold serif text-[#4A3728]">How to Order in {area.name}</h2>
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
            <h2 className="text-3xl font-bold serif text-[#4A3728]">FAQs — {area.name} Delivery</h2>
            <div className="w-12 h-1 bg-coral rounded-full mx-auto mt-4" />
          </div>
          <div className="space-y-4">
            {[
              { q: `Do you deliver to ${area.name}, Ahmedabad?`,   a: `Yes! We deliver fresh homemade mukhwas, snacks, and sweets directly to ${area.name} and nearby areas in Ahmedabad.` },
              { q: 'How long does delivery take?',                  a: `Orders to ${area.name} are typically delivered within 1–2 business days. WhatsApp us at ${WHATSAPP_NUMBER} to check same-day availability.` },
              { q: 'What products can I order?',                    a: 'We offer a wide range of mukhwas, snacks, chakli, ladoo, masalas and festive gift hampers — all made fresh with zero preservatives.' },
              { q: 'Is there a minimum order amount?',              a: 'No strict minimum, but orders above ₹299 qualify for free delivery. WhatsApp us for details.' },
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

      {/* ── Other Areas ── */}
      <section className="py-14 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold serif text-[#4A3728] mb-8">We Also Deliver To</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {otherAreas.map(a => (
              <button
                key={a.slug}
                onClick={() => onNavigateToArea(a.slug)}
                className="px-6 py-3 rounded-full border-2 border-coral/15 text-[#4A3728]/70 brand-rounded text-xs font-bold uppercase tracking-wider hover:border-coral hover:text-coral hover:bg-coral/5 transition-all flex items-center gap-2"
              >
                <MapPin size={12} /> {a.name}
              </button>
            ))}
            <button
              onClick={() => onNavigateToArea('')}
              className="px-6 py-3 rounded-full border-2 border-[#4A3728]/10 text-[#4A3728]/50 brand-rounded text-xs font-bold uppercase tracking-wider hover:border-[#4A3728]/30 hover:text-[#4A3728]/80 transition-all flex items-center gap-2"
            >
              View all areas <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 sm:py-20 px-4 bg-coral">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold serif text-white mb-4">
            Order Mukhwas &amp; Snacks in {area.name} Today
          </h2>
          <p className="text-white/80 mb-8 text-lg">Fresh. Homemade. Delivered to your door.</p>
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
const AreaDeliveryPage: React.FC<Props> = ({ area, onShopClick, onNavigateToArea, onNavigate }) => {
  if (!area) return <HubPage onNavigateToArea={onNavigateToArea} onShopClick={onShopClick} />;
  return <AreaPage area={area} onShopClick={onShopClick} onNavigateToArea={onNavigateToArea} onNavigate={onNavigate} />;
};

export default AreaDeliveryPage;
