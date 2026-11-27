import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

const SEEN_KEY = 'amies_firsttime_offer_seen_v1';
const CODE = 'FIRSTTIME';

interface Props {
  // Don't show over the cart/checkout, or while something else is blocking the page.
  suppressed: boolean;
  onShop: () => void;
}

// First-visit pop-up for the FIRSTTIME coupon (flat ₹50 off above ₹500, set up in Shopflo).
// Shows once per browser session, after a short delay.
const FirstOrderOfferPopup: React.FC<Props> = ({ suppressed, onShop }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // "?offer=1" always shows it (handy for checking it on any device).
    let force = false;
    try { force = new URLSearchParams(window.location.search).get('offer') === '1'; } catch { /* ignore */ }
    if (!force) {
      try { if (sessionStorage.getItem(SEEN_KEY) === '1') return; } catch { /* ignore */ }
    }
    const t = setTimeout(() => setOpen(true), force ? 800 : 3000);
    return () => clearTimeout(t);
  }, []);

  // Freeze the page behind the pop-up so it can't scroll while open.
  useEffect(() => {
    if (!open || suppressed) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open, suppressed]);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(CODE); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open || suppressed) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-5 sm:p-4 bg-black/60 animate-in fade-in duration-300"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="First order offer"
    >
      <div
        className="relative w-full max-w-[19rem] sm:max-w-sm rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden bg-[#FFF8EC] shadow-2xl animate-in zoom-in-95 duration-300 text-center px-6 sm:px-8 pt-9 sm:pt-11 pb-6 sm:pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#F04E4E]/15 to-transparent pointer-events-none" />
        <button onClick={close} aria-label="Close" className="absolute top-4 right-4 p-1.5 text-[#4A3728]/50 hover:text-[#4A3728] z-10">
          <X size={20} />
        </button>

        <div className="relative z-10">
          <span className="brand-rounded text-[#F04E4E] font-bold text-[11px] uppercase tracking-[0.3em]">Welcome gift</span>
          <h2 className="serif text-3xl sm:text-4xl font-bold text-[#4A3728] leading-tight mt-2">
            Flat <span className="text-[#F04E4E]">₹50 off</span><br />your first order
          </h2>
          <p className="mt-2 text-sm text-[#4A3728]/70 brand-rounded">On orders above ₹500</p>

          <button
            onClick={copy}
            aria-label={`Copy coupon code ${CODE}`}
            className="mt-5 mx-auto flex items-center justify-center gap-2.5 w-full rounded-2xl border-2 border-dashed border-[#F04E4E]/60 bg-white px-4 py-3 hover:border-[#F04E4E] transition-colors"
          >
            <span className="brand-rounded font-extrabold text-xl tracking-[0.2em] text-[#4A3728]">{CODE}</span>
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-[#4A3728]/50" />}
          </button>
          <p className="mt-1.5 text-[11px] text-[#4A3728]/55 brand-rounded">{copied ? 'Copied! Apply it at checkout' : 'Tap to copy · apply at checkout'}</p>

          <button
            onClick={() => { close(); onShop(); }}
            className="mt-5 w-full bg-[#F04E4E] text-white font-bold brand-rounded text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-full shadow-lg hover:scale-[1.02] transition-transform"
          >
            Start Shopping
          </button>
          <p className="mt-3 text-[10px] text-[#4A3728]/45 brand-rounded">Can be combined with all other discounts</p>
          <button onClick={close} className="mt-2 text-xs text-[#4A3728]/60 brand-rounded underline">No thanks</button>
        </div>
      </div>
    </div>
  );
};

export default FirstOrderOfferPopup;
