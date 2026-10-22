import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const SEEN_KEY = 'amies_diwali_offer_seen_v1';
const RESHOW_AFTER_MS = 24 * 60 * 60 * 1000;

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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-300"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Diwali special offer"
    >
      <div
        className="relative w-full max-w-sm rounded-[2rem] bg-[#FFF8EE] border border-[#D4AF37]/40 shadow-2xl px-7 pt-9 pb-7 text-center animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={close} aria-label="Close" className="absolute top-4 right-4 p-1.5 text-[#4A3728]/50 hover:text-[#4A3728]">
          <X size={20} />
        </button>
        <span className="brand-rounded text-[#B8892A] font-bold text-[11px] uppercase tracking-[0.3em]">Diwali Special</span>
        <h2 className="serif text-4xl font-bold text-[#4A3728] leading-tight mt-3">10% OFF<br />on all products</h2>
        <p className="mt-3 text-sm text-[#4A3728]/70 brand-rounded">Already applied to every price on the site — no code needed.</p>

        <button
          onClick={() => { close(); onShop(); }}
          className="mt-6 w-full bg-[#F04E4E] text-white font-bold brand-rounded text-sm uppercase tracking-wider py-4 rounded-full shadow-lg hover:scale-[1.02] transition-transform"
        >
          Shop Diwali Offers
        </button>
        <button onClick={close} className="mt-3 text-xs text-[#4A3728]/50 brand-rounded underline">No thanks</button>
      </div>
    </div>
  );
};

export default DiwaliOfferPopup;
