import React, { useRef } from 'react';
import { Instagram, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const REELS = [
  { image: '/instagram-reels/reel-1.jpg', url: 'https://www.instagram.com/p/DahwpBCv2mH/' },
  { image: '/instagram-reels/reel-2.jpg', url: 'https://www.instagram.com/p/DaQILIYzDVi/' },
  { image: '/instagram-reels/reel-3.jpg', url: 'https://www.instagram.com/reel/DadDp7WTiX5/' },
  { image: '/instagram-reels/reel-4.jpg', url: 'https://www.instagram.com/reel/DafmFJbScOR/' },
];

const InstagramReels: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('a')?.clientWidth || 280;
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + 16) : cardWidth + 16, behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
            Behind The Scenes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold serif text-[#4A3728] mb-3">
            Follow Us on Instagram
          </h2>
          <p className="text-[#4A3728]/60 text-sm sm:text-base">
            Join our community for daily inspiration and a closer look at our kitchen
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous"
            className="hidden sm:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg text-[#4A3728] hover:bg-coral hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Next"
            className="hidden sm:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg text-[#4A3728] hover:bg-coral hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {REELS.map((reel, i) => (
              <a
                key={i}
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex-shrink-0 w-[45%] sm:w-[30%] lg:w-[23%] aspect-[9/16] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 snap-start"
              >
                <img
                  src={reel.image}
                  alt="Amie's Homemade on Instagram"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                  <Play size={13} fill="white" />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <a
            href="https://www.instagram.com/amies_homemadefoods/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-9 py-4 bg-[#4A3728] text-[#FFF8EE] rounded-full font-bold tracking-[0.2em] uppercase text-xs hover:bg-[#3D2D1F] hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-[#4A3728]/20"
          >
            <Instagram size={16} />
            Visit Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramReels;
