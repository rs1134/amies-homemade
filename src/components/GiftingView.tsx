import React from 'react';
import { Sparkles, MessageCircle, Mail, Star, Heart, Building2, Sparkle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants.ts';
import { Product } from '../types.ts';

interface GiftingViewProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

const INQUIRY_OPTIONS = [
  {
    icon: <Star size={24} />,
    title: 'Personalized Gifting',
    desc: 'Curated hampers built around the recipient — their taste, dietary needs, and the occasion. No two boxes the same.',
    color: '#F04E4E',
    bg: '#FFF1F1',
    msg: "Hi! I'm interested in a Personalized Gift Hamper.",
  },
  {
    icon: <Building2 size={24} />,
    title: 'Corporate Gifting',
    desc: 'Bulk orders for Diwali, Navratri, and corporate milestones. Consistent quality, elegant presentation, custom branding available for 50+ units.',
    color: '#4A3728',
    bg: '#FFF8EE',
    msg: "Hi! I'd like to enquire about Corporate Gift Hampers.",
  },
  {
    icon: <Sparkles size={24} />,
    title: 'Festive Hampers',
    desc: 'Season-specific collections for Diwali, Navratri, Holi, Eid, and every celebration in between. Order early for festival seasons.',
    color: '#D4AF37',
    bg: '#FFFBEE',
    msg: "Hi! I'm interested in Festive Gift Hampers.",
  },
  {
    icon: <Heart size={24} />,
    title: 'Wedding & Events',
    desc: 'Wedding favors, return gifts, and our beloved live Mukhwas Bar — because every celebration deserves something truly special.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    msg: "Hi! I'd like to enquire about Wedding & Event Gifting.",
  },
];

const GiftingView: React.FC<GiftingViewProps> = () => {
  return (
    <div className="pt-24 sm:pt-20 bg-[#FFF8EE] min-h-screen">

      {/* Hero */}
      <section className="relative h-[35vh] sm:h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#2A1E14]/45 z-10" />
        <img
          src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
          alt="Gifting Hampers"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white brand-rounded text-xs font-black uppercase tracking-[0.4em] mb-8 animate-in slide-in-from-top duration-700 shadow-2xl">
            <Sparkles size={14} className="text-[#D4AF37]" /> The Art of Gifting
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-white serif mb-4 sm:mb-6 leading-tight drop-shadow-2xl animate-in fade-in zoom-in duration-1000">
            Share the <span className="text-[#D4AF37] brand-script">Magic.</span>
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

        {/* Intro */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">Handcrafted with Intention</span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold serif text-[#4A3728] mb-6">The Gift Gallery</h2>
          <div className="w-24 h-2 bg-[#D4AF37] mx-auto rounded-full mb-8" />
          <p className="text-[#4A3728]/60 max-w-2xl mx-auto text-base leading-relaxed">
            Every hamper is made fresh to order — no warehouse stock, no generic boxes. Tell us who it's for and we'll build something they'll remember.
          </p>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[220px] gap-3 sm:gap-4 mb-20 sm:mb-28">

          {/* Large: Heritage */}
          <div className="col-span-2 row-span-2 relative rounded-[2rem] overflow-hidden group">
            <img
              src="https://i.postimg.cc/1zLyVYrk/Whats-App-Image-2026-02-12-at-18-57-42.jpg"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Heritage Hamper"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-8">
              <span className="text-white text-sm font-black brand-rounded uppercase tracking-widest">Heritage Collection</span>
            </div>
          </div>


          {/* Small: Wedding */}
          <div className="relative rounded-[1.5rem] overflow-hidden group">
            <img src="https://i.postimg.cc/3xwTWHm9/amish-thakkar-7O422y-G-b80-unsplash.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Wedding Gifting" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-[10px] font-black brand-rounded uppercase tracking-widest">Wedding Gifting</span>
            </div>
          </div>

          {/* Small: Premium Hamper */}
          <div className="relative rounded-[1.5rem] overflow-hidden group">
            <img src="https://i.postimg.cc/RZm4Bt9q/p-regal-elephant-lacquered-dry-fruit-gift-box-435757-m.avif" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Premium Hamper" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-[10px] font-black brand-rounded uppercase tracking-widest">Premium Hamper</span>
            </div>
          </div>

          {/* Wide: Curated Gift Box */}
          <div className="col-span-2 relative rounded-[2rem] overflow-hidden group">
            <img src="https://i.postimg.cc/j2N28r64/p-golden-joys-446182-m.avif" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Curated Gift Box" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <span className="text-white text-[10px] font-black brand-rounded uppercase tracking-widest">Curated Gift Box</span>
            </div>
          </div>

          {/* Large: Sweet Platter */}
          <div className="col-span-2 relative rounded-[2rem] overflow-hidden group">
            <img src="https://i.postimg.cc/5tkDXYbB/Whats_App_Image_2026_02_12_at_18_57_59_(1).jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Sweet Memories Platter" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-8">
              <span className="text-white text-sm font-black brand-rounded uppercase tracking-widest">Sweet Memories Platter</span>
            </div>
          </div>

          {/* Small: Festive */}
          <div className="relative rounded-[1.5rem] overflow-hidden group">
            <img src="https://i.postimg.cc/cHcWr19P/bh6cmv93h5rmt0cwehc94w18rr.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Festive Hamper" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-[10px] font-black brand-rounded uppercase tracking-widest">Festive Gifting</span>
            </div>
          </div>

          {/* Small: Corporate */}
          <div className="relative rounded-[1.5rem] overflow-hidden group">
            <img src="https://i.postimg.cc/bYFML2t9/3mx66mz99srmr0cwehfssqfz10.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Corporate Gifting" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-[10px] font-black brand-rounded uppercase tracking-widest">Corporate Hamper</span>
            </div>
          </div>


          {/* Wide: Celebrations */}
          <div className="col-span-2 relative rounded-[2rem] overflow-hidden group">
            <img src="https://i.postimg.cc/4ytzzMcq/nescmvzyzhrmw0cweh988hsnk0.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Celebrations" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <span className="text-white text-[10px] font-black brand-rounded uppercase tracking-widest">Celebrations</span>
            </div>
          </div>

        </div>

        {/* Inquiry Cards */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center mb-12 sm:mb-16">
            <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">How Can We Help</span>
            <h2 className="text-3xl sm:text-5xl font-bold serif text-[#4A3728]">What Are You Looking For?</h2>
            <div className="w-16 h-1.5 bg-coral rounded-full mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {INQUIRY_OPTIONS.map(({ icon, title, desc, color, bg, msg }) => (
              <div key={title} className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-[#4A3728]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: bg, color }}
                >
                  {icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold serif text-[#4A3728] mb-3">{title}</h3>
                <p className="text-[#4A3728]/60 leading-relaxed text-sm sm:text-base mb-6">{desc}</p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black brand-rounded uppercase tracking-widest hover:gap-3 transition-all"
                  style={{ color }}
                >
                  <MessageCircle size={14} /> Enquire on WhatsApp →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Big CTA */}
        <div className="bg-[#FFF1F1] rounded-[3rem] p-10 sm:p-16 text-center border border-[#F04E4E]/10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#F04E4E]/10 rounded-full border border-[#F04E4E]/20 text-coral brand-rounded text-xs font-black uppercase tracking-[0.3em] mb-8">
            <Sparkle size={12} className="text-coral" /> Get in Touch
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#4A3728] serif mb-4">
            Ready to Create Something <span className="text-coral brand-script">Special?</span>
          </h2>
          <p className="text-[#4A3728]/60 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-10">
            Tell us about your occasion, your budget, and who it's for — we'll handle everything else. Every hamper is made fresh to order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent("Hi! I'd like to enquire about gifting hampers.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-[#F04E4E] text-white rounded-full font-black brand-rounded uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#F04E4E]/30"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
            <a
              href="mailto:hello@amieshomemade.com?subject=Gifting Inquiry"
              className="px-10 py-5 border-2 border-[#F04E4E]/30 text-coral rounded-full font-black brand-rounded uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:bg-[#F04E4E] hover:text-white transition-all"
            >
              <Mail size={18} /> Send an Email
            </a>
          </div>
        </div>
      </section>

      {/* Mukhwas Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="relative overflow-hidden bg-[#2A1E14] rounded-[4rem] flex flex-col lg:flex-row shadow-2xl">
          <div className="lg:w-1/2 flex flex-col overflow-hidden">
            <div className="relative overflow-hidden flex-1 border-b border-white/10" style={{ minHeight: '240px' }}>
              <img src="https://i.postimg.cc/9Mc9MPXM/Whats_App_Image_2026_03_10_at_23_09_28.jpg" className="w-full h-full object-cover object-center" alt="Mukhwas Bar at Mehndi" loading="lazy" />
            </div>
            <div className="relative overflow-hidden flex-1" style={{ minHeight: '240px' }}>
              <img src="https://i.postimg.cc/26CW6dj3/Whats_App_Image_2026_03_10_at_23_09_28_(1).jpg" className="w-full h-full object-cover object-center" alt="Mukhwas Bar setup" loading="lazy" />
            </div>
          </div>
          <div className="lg:w-1/2 p-8 sm:p-12 lg:p-20 flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 rounded-full mb-8 border border-white/20 w-fit">
              <Sparkles size={14} className="text-[#D4AF37]" />
              <span className="text-[10px] font-black brand-rounded text-white/80 uppercase tracking-widest">Live Experience</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold serif text-white mb-4 sm:mb-6 leading-tight">
              Book a <span className="text-[#D4AF37] brand-script">Mukhwas Bar</span><br />for Your Event
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-8 sm:mb-12 brand-rounded font-medium max-w-lg">
              We set up a beautiful live Mukhwas Bar at your wedding, mehndi, reception, or corporate event — a curated spread of our finest mukhwas for your guests to pick and enjoy. A unique touch that leaves a lasting impression.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              {['Weddings', 'Mehndi Functions', 'Receptions', 'Corporate Events', 'Festivals'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-white/10 text-white/70 text-[10px] font-bold brand-rounded rounded-full border border-white/10">{tag}</span>
              ))}
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-5 bg-[#25D366] text-white rounded-full font-black brand-rounded uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#25D366]/30 sm:self-start"
            >
              <MessageCircle size={18} /> Enquire on WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default GiftingView;
