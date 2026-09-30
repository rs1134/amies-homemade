import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface DiwaliBannerProps {
  /** Navigate to the gifting page, optionally scrolling to a specific hamper's card. */
  onClick: (hamperId?: string) => void;
}

const tr = (url: string, w: number) => `${url.split('?')[0]}?tr=w-${w},q-80,f-auto`;

// Four real hampers, four real photos — no stock-photo feel, no generic
// "This Diwali ✨" filler copy. Each slide just says what it is and what
// it costs, like a person writing a caption rather than an ad template.
const SLIDES: { hamperId: string; image: string; name: string; price: number }[] = [
  {
    hamperId: 'g6',
    image: 'https://ik.imagekit.io/amieshomemade/067A8538.JPG',
    name: 'The Ultimate Diwali Luxury Hamper',
    price: 2249,
  },
  {
    hamperId: 'g7',
    image: 'https://ik.imagekit.io/amieshomemade/067A8560.JPG',
    name: 'The Royal Diwali Hamper',
    price: 1450,
  },
  {
    hamperId: 'g9',
    image: 'https://ik.imagekit.io/amieshomemade/067A8608.JPG?updatedAt=1790662993420',
    name: 'The Diwali Sweet Celebrations Hamper',
    price: 1100,
  },
  {
    hamperId: 'g12',
    image: 'https://ik.imagekit.io/amieshomemade/067A8682.JPG?updatedAt=1790662989973',
    name: 'The Diwali Elegance Hamper',
    price: 799,
  },
];

const SLIDE_DURATION_MS = 4500;

const DiwaliBanner: React.FC<DiwaliBannerProps> = ({ onClick }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive(i => (i + 1) % SLIDES.length), SLIDE_DURATION_MS);
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
          key={s.hamperId}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? 'auto' : 'none' }}
          aria-hidden={i !== active}
        >
          <img
            src={tr(s.image, 1600)}
            srcSet={`${tr(s.image, 800)} 800w, ${tr(s.image, 1200)} 1200w, ${tr(s.image, 1600)} 1600w, ${tr(s.image, 2000)} 2000w`}
            sizes="100vw"
            alt={s.name}
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E14]/85 via-[#2A1E14]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1E14]/55 sm:from-[#2A1E14]/65 via-transparent to-transparent" />

          <button
            onClick={() => onClick(s.hamperId)}
            aria-label={`Shop ${s.name}`}
            className="group absolute inset-0 flex flex-col justify-end sm:justify-center text-left px-6 sm:px-12 lg:px-20 pb-16 sm:pb-0 max-w-2xl"
          >
            <h2 className="brand-devanagari text-[#F6C94C] leading-none text-5xl sm:text-7xl lg:text-8xl mb-3 sm:mb-4 drop-shadow-lg">
              शुभ दिवाली
            </h2>
            <p className="text-white serif font-bold text-xl sm:text-3xl lg:text-4xl mb-1.5 sm:mb-2 drop-shadow-lg">
              Celebrate the Art of Gifting
            </p>
            <p className="text-white/75 text-xs sm:text-base font-medium mb-6 sm:mb-8">
              Homemade with love. Packed with tradition.
            </p>
            <span className="inline-flex items-center gap-3 self-start px-7 sm:px-9 py-3.5 sm:py-4 bg-coral text-white rounded-full font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-coral/30 group-hover:scale-[1.04] group-hover:shadow-coral/40 transition-all duration-300">
              {s.name} · ₹{s.price.toLocaleString('en-IN')}
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
            </span>
          </button>
        </div>
      ))}

      {/* Slide dots */}
      <div className="absolute bottom-5 sm:bottom-8 right-6 sm:right-12 z-10 flex gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.hamperId}
            onClick={() => setActive(i)}
            aria-label={`Show ${s.name}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-7 bg-coral' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default DiwaliBanner;
