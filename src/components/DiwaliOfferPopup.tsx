import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const SEEN_KEY = 'amies_diwali_offer_seen_v1';
const RESHOW_AFTER_MS = 24 * 60 * 60 * 1000;

const BG = 'https://ik.imagekit.io/amieshomemade/6ada5f3b63d6d582f1ff4983af8c5593.jpg?updatedAt=1790747813640&tr=w-800,q-75,f-auto';

interface Props {
  // Don't show over the cart/checkout, or while something else is blocking the page.
  suppressed: boolean;
  onShop: () => void;
}

// First-visit Diwali offer pop-up. Listed prices on the site are already ~10%
// below MRP, so no code is needed. Shows once per visitor per day, after a short delay.
const DiwaliOfferPopup: React.FC<Props> = ({ suppressed, onShop }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const last = Number(localStorage.getItem(SEEN_KEY) || 0);
      if (last && Date.now() - last < RESHOW_AFTER_MS) return;
    } catch { /* ignore */ }
    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* ignore */ }
  };

  if (!open || suppressed) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-300"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Diwali special offer"
    >
      <div
        className="relative w-full max-w-sm min-h-[30rem] rounded-[2rem] overflow-hidden border border-[#F5C86A]/50 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center text-center px-7 py-10"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark wash so the text stays readable over the artwork */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1030]/80 via-[#0B1030]/55 to-[#0B1030]/85" />

        <button onClick={close} aria-label="Close" className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white z-10">
          <X size={20} />
        </button>

        <div className="relative z-10">
          <span className="brand-rounded text-[#F5C86A] font-bold text-[11px] uppercase tracking-[0.35em]">✦ Happy Diwali ✦</span>
          <p className="mt-3 brand-rounded text-white/90 text-sm font-bold uppercase tracking-[0.25em]">Diwali Special</p>
          <h2 className="serif text-4xl font-bold text-white leading-tight mt-2 drop-shadow-lg">
            Minimum <span className="text-[#F5C86A]">10% OFF</span><br />on all products
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#F5C86A]" />

          <button
            onClick={() => { close(); onShop(); }}
            className="mt-8 w-full bg-[#F04E4E] text-white font-bold brand-rounded text-sm uppercase tracking-wider py-4 rounded-full shadow-lg hover:scale-[1.02] transition-transform"
          >
            Shop Diwali Offers
          </button>
          <button onClick={close} className="mt-3 text-xs text-white/70 brand-rounded underline">No thanks</button>
        </div>
      </div>
    </div>
  );
};

export default DiwaliOfferPopup;
