import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const SEEN_KEY = 'amies_diwali_offer_seen_v2';

interface Props {
  // Don't show over the cart/checkout, or while something else is blocking the page.
  suppressed: boolean;
}

// First-visit Diwali offer pop-up. Listed prices on the site are already ~10%
// below MRP, so no code is needed. Shows once per visit (browser session), after
// a short delay. The only control is the close (×) button.
const DiwaliOfferPopup: React.FC<Props> = ({ suppressed }) => {
  const [open, setOpen] = useState(false);

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

  // Freeze the page behind the pop-up so it can't scroll (or jump) while open.
  useEffect(() => {
    if (!open || suppressed) return;
    document.body.style.overflow = 'hidden';
    // 'unset' (not the previous value) matches the other modals and can never
    // leave the page stuck if another overlay opened/closed meanwhile.
    return () => { document.body.style.overflow = 'unset'; };
  }, [open, suppressed]);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  };

  if (!open || suppressed) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6 sm:p-4 bg-black/55 animate-in fade-in duration-300"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Diwali special offer"
    >
      <div
        className="relative w-full max-w-[19rem] sm:max-w-md rounded-[1.25rem] sm:rounded-[1.5rem] bg-[#F04E4E] shadow-2xl px-4 sm:px-7 pt-6 sm:pt-8 pb-5 sm:pb-7 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Close — the only control on the pop-up */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#4A3728] shadow-lg flex items-center justify-center"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <span className="inline-block rounded-full bg-[#FFF8EE] text-[#F04E4E] brand-rounded font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] px-3 sm:px-4 py-1.5 sm:py-2">
          Diwali Special
        </span>

        <h2 className="brand-rounded font-black leading-[0.95] tracking-tight mt-3 sm:mt-5 text-[2.1rem] sm:text-[3.2rem]">
          <span className="block text-white">Festive offer.</span>
          <span className="block text-[#FFE9B8]">Save more.</span>
        </h2>

        {/* Ticket-style offer card */}
        <div className="relative mt-4 sm:mt-6 flex items-stretch rounded-xl sm:rounded-2xl bg-[#FFF8EE] overflow-hidden">
          <div className="flex-1 flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3.5 sm:py-5">
            <div className="leading-none text-[#4A3728]">
              <p className="brand-rounded font-black text-[9px] sm:text-[11px] uppercase tracking-[0.2em] mb-0.5">Minimum</p>
              <p className="brand-rounded font-black text-[2.6rem] sm:text-[4rem] tracking-tighter">10%</p>
              <p className="brand-rounded font-black text-sm sm:text-xl tracking-[0.15em] mt-0.5">OFF</p>
            </div>
            <p className="brand-rounded font-bold text-[#4A3728] text-sm sm:text-lg leading-tight">
              on all<br />products
            </p>
          </div>
          <div className="relative w-[34%] flex flex-col items-center justify-center text-center border-l-2 border-dashed border-[#4A3728]/25 px-2 py-3">
            <span className="absolute -top-2 left-[-9px] w-4 h-4 rounded-full bg-[#F04E4E]" />
            <span className="absolute -bottom-2 left-[-9px] w-4 h-4 rounded-full bg-[#F04E4E]" />
            <p className="brand-rounded font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[#4A3728]/70">Happy</p>
            <p className="brand-rounded font-black text-base sm:text-2xl text-[#F04E4E] leading-none mt-0.5">Diwali</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiwaliOfferPopup;
