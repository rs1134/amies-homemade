import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface DiwaliBannerProps {
  onShopClick: () => void;
}

const tr = (url: string, w: number) => `${url.split('?')[0]}?tr=w-${w},q-80,f-auto`;

// Three real hamper photos rotating behind one fixed headline.
const SLIDES: { id: string; image: string; alt: string }[] = [
  { id: 'g6', image: 'https://ik.imagekit.io/amieshomemade/067A8538.JPG', alt: 'The Ultimate Diwali Luxury Hamper' },
  { id: 'g7', image: 'https://ik.imagekit.io/amieshomemade/067A8560.JPG', alt: 'The Royal Diwali Hamper' },
  { id: 'g9', image: 'https://ik.imagekit.io/amieshomemade/067A8608.JPG?updatedAt=1790662993420', alt: 'The Diwali Sweet Celebrations Hamper' },
];

const SLIDE_DURATION_MS = 3000;

const DiwaliBanner: React.FC<DiwaliBannerProps> = ({ onShopClick }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Only slides that have actually been shown get their <img> mounted — an absolutely
  // positioned img inside the viewport downloads immediately regardless of opacity:0 or
  // loading="lazy", so mounting all 3 up front was silently fetching two full-size hero
  // photos (~1.5MB) nobody was looking at yet.
  const [shown, setShown] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive(i => {
        const next = (i + 1) % SLIDES.length;
        setShown(prev => (prev.has(next) ? prev : new Set(prev).add(next)));
        return next;
      });
    }, SLIDE_DURATION_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative w-full h-[56vh] sm:h-[64vh] lg:h-[72vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
          aria-hidden={i !== active}
        >
          {shown.has(i) && (
            <img
              src={tr(s.image, 1600)}
              srcSet={`${tr(s.image, 800)} 800w, ${tr(s.image, 1200)} 1200w, ${tr(s.image, 1600)} 1600w, ${tr(s.image, 2000)} 2000w`}
              sizes="100vw"
              alt={s.alt}
              className="absolute inset-0 w-full h-full object-cover"
              fetchPriority={i === 0 ? 'high' : 'low'}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          )}
          {/* Light wash, just enough for text contrast — the photo should still read clearly */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E14]/45 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1E14]/40 sm:from-[#2A1E14]/45 via-[#2A1E14]/5 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 z-10 flex flex-col justify-end sm:justify-center text-left px-6 sm:px-12 lg:px-20 pb-16 sm:pb-0 max-w-2xl">
        <h2 className="brand-devanagari text-[#F6C94C] leading-none text-5xl sm:text-7xl lg:text-8xl mb-3 sm:mb-4 drop-shadow-lg">
          शुभ दिवाली
        </h2>
        <p className="text-white serif font-bold text-xl sm:text-3xl lg:text-4xl mb-1.5 sm:mb-2 drop-shadow-lg">
          Celebrate the Art of Gifting
        </p>
        <p className="text-white/85 text-xs sm:text-base font-medium mb-6 sm:mb-8 drop-shadow">
          Homemade with love. Packed with tradition.
        </p>
        <button
          onClick={onShopClick}
          className="group inline-flex items-center gap-3 self-start px-8 sm:px-10 py-4 sm:py-5 bg-coral text-white rounded-full font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-coral/30 hover:scale-[1.04] hover:shadow-coral/40 transition-all duration-300"
        >
          Shop Now
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-5 sm:bottom-8 right-6 sm:right-12 z-10 flex gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-7 bg-coral' : 'w-1.5 bg-white/60 hover:bg-white/90'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default DiwaliBanner;
