import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DiwaliBannerProps {
  onClick: () => void;
}

const IMG = 'https://ik.imagekit.io/amieshomemade/067A8668.JPG?updatedAt=1790739362437';
const tr = (url: string, w: number) => `${url.split('?')[0]}?tr=w-${w},q-80,f-auto`;

/** Full-bleed clickable promo banner for the Diwali Gift Hampers collection — sits above the main Hero. */
const DiwaliBanner: React.FC<DiwaliBannerProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Shop the Diwali Gift Hampers collection"
      className="group relative block w-full h-[52vh] sm:h-[64vh] lg:h-[72vh] overflow-hidden text-left"
    >
      <img
        src={tr(IMG, 1600)}
        srcSet={`${tr(IMG, 800)} 800w, ${tr(IMG, 1200)} 1200w, ${tr(IMG, 1600)} 1600w, ${tr(IMG, 2000)} 2000w`}
        sizes="100vw"
        alt="Diwali Gift Hampers"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
      {/* Warm gradient for text legibility — coral/brown wash, not a flat dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E14]/80 via-[#2A1E14]/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2A1E14]/50 sm:from-[#2A1E14]/60 via-transparent to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end sm:justify-center px-6 sm:px-12 lg:px-20 pb-10 sm:pb-0 max-w-2xl">
        <span className="inline-flex items-center gap-2.5 text-[#F6C94C] brand-rounded uppercase tracking-[0.35em] font-black text-[10px] sm:text-xs mb-4 sm:mb-6">
          <span className="w-6 h-px bg-[#F6C94C]/60" /> This Diwali
        </span>
        <h2 className="text-white serif font-bold leading-[0.95] text-4xl sm:text-6xl lg:text-7xl mb-6 sm:mb-8 drop-shadow-lg">
          Diwali Gift<br />
          <span className="brand-script text-[#F6C94C] text-5xl sm:text-7xl lg:text-8xl">Hampers</span>
        </h2>
        <span className="inline-flex items-center gap-3 self-start px-8 sm:px-10 py-4 sm:py-5 bg-coral text-white rounded-full font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-coral/30 group-hover:scale-[1.04] group-hover:shadow-coral/40 transition-all duration-300">
          Shop Now
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
        </span>
      </div>
    </button>
  );
};

export default DiwaliBanner;
