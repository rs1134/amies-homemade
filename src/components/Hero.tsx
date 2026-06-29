import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onAboutClick: () => void;
}

// Two product hero shots — both on the same sage-green studio backdrop, so the
// whole stage is sage and the photography melts into the page.
const IMG_RANGE = 'https://ik.imagekit.io/amieshomemade/067A4322-1.jpg'; // full range: pouches, sweets box + jars
const IMG_JARS = 'https://ik.imagekit.io/amieshomemade/067A4323-1.jpg';  // the mukhwas jar pyramid
const tr = (url: string, w: number) => `${url}?tr=w-${w},q-80,f-auto`;

// ── Hand-drawn ingredient illustrations (original SVG, license-free) ──
type IconProps = { className?: string; style?: React.CSSProperties };
const Almond: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 40 56" className={className} style={style} aria-hidden>
    <path d="M20 2C30 9 35 24 31 41 28 51 12 51 9 41 5 24 10 9 20 2Z" fill="#E7C9A1" stroke="#C79B68" strokeWidth="1.4" />
    <path d="M20 9C22 22 22 38 20 49" fill="none" stroke="#C79B68" strokeWidth="1.1" opacity="0.7" />
  </svg>
);
const DateFruit: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 36 58" className={className} style={style} aria-hidden>
    <ellipse cx="18" cy="29" rx="13" ry="27" fill="#7C4A2A" />
    <path d="M13 9C19 28 14 40 16 50M24 10C19 30 24 40 22 50" fill="none" stroke="#5C3519" strokeWidth="1" opacity="0.45" />
    <ellipse cx="14" cy="17" rx="3" ry="6" fill="#A06B41" opacity="0.5" />
  </svg>
);
const Fennel: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 54 40" className={className} style={style} aria-hidden>
    <g fill="#AEBE74" stroke="#85974C" strokeWidth="0.9">
      <path d="M6 26C7 16 13 15 14 25 13 31 7 32 6 26Z" />
      <path d="M20 20C22 10 28 10 28 20 27 27 21 27 20 20Z" />
      <path d="M34 28C35 18 41 18 42 27 41 34 35 34 34 28Z" />
      <path d="M44 14C45 7 50 8 49 15 48 20 44 19 44 14Z" />
    </g>
  </svg>
);
const Petal: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 50 46" className={className} style={style} aria-hidden>
    <path d="M25 44C7 37 5 15 23 5 24 4 26 4 27 5 45 15 43 37 25 44Z" fill="#DDA0A8" stroke="#C57E88" strokeWidth="1.2" />
    <path d="M25 41C25 28 25 14 25 7" fill="none" stroke="#C57E88" strokeWidth="1" opacity="0.45" />
  </svg>
);
const Seed: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 34 48" className={className} style={style} aria-hidden>
    <path d="M17 4C27 9 28 37 17 44 6 37 7 9 17 4Z" fill="#D2E1A6" stroke="#A7B86A" strokeWidth="1.6" />
  </svg>
);

// Ambient ingredients scattered across the whole hero — positions in %, varied
// size / opacity / drift so they read as atmosphere, not clustered clutter.
const SCATTER: { C: React.FC<IconProps>; cls: string; delay: string }[] = [
  { C: Fennel,    cls: 'left-[3%] top-[10%] w-10 sm:w-14 opacity-30 -rotate-12 animate-float-soft', delay: '0s' },
  { C: Almond,    cls: 'left-[12%] top-[40%] w-7 sm:w-9 opacity-25 rotate-12 animate-float-rev', delay: '0.8s' },
  { C: Seed,      cls: 'left-[7%] top-[72%] w-6 sm:w-8 opacity-30 -rotate-6 animate-float', delay: '1.6s' },
  { C: Petal,     cls: 'left-[22%] top-[88%] w-9 sm:w-12 opacity-25 rotate-6 animate-float-soft', delay: '0.4s' },
  { C: DateFruit, cls: 'left-[44%] top-[6%] w-6 sm:w-8 opacity-25 rotate-6 animate-float-rev', delay: '1.1s' },
  { C: Almond,    cls: 'left-[55%] top-[80%] w-7 sm:w-10 opacity-25 -rotate-12 animate-float', delay: '0.6s' },
  { C: Seed,      cls: 'left-[38%] top-[58%] w-5 sm:w-7 opacity-20 rotate-12 animate-float-rev', delay: '1.9s' },
  { C: Fennel,    cls: 'right-[6%] top-[16%] w-9 sm:w-12 opacity-30 rotate-6 animate-float', delay: '0.3s' },
  { C: Petal,     cls: 'right-[14%] top-[46%] w-7 sm:w-10 opacity-25 -rotate-12 animate-float-soft', delay: '1.3s' },
  { C: DateFruit, cls: 'right-[4%] top-[68%] w-6 sm:w-9 opacity-30 -rotate-6 animate-float-rev', delay: '0.9s' },
  { C: Almond,    cls: 'right-[24%] top-[6%] w-6 sm:w-8 opacity-20 rotate-12 animate-float', delay: '1.5s' },
  { C: Seed,      cls: 'right-[2%] top-[40%] w-5 sm:w-7 opacity-25 rotate-6 animate-float-soft', delay: '0.5s' },
];

// Variety names for the kinetic marquee.
const VARIETIES = [
  'Amla Ginger', 'Kharek Coconut Almond', 'Chatpati Mango', 'Cranberry Mix',
  'Dryfruit & Seeds', 'Tender Coconut Chips', 'Homemade Granola', 'Chai Masala',
  'Digestive Crunch', 'Date & Almond', 'Black Grape & Til Goli', 'Ginger Chaat',
];

const Hero: React.FC<HeroProps> = ({ onShopClick, onAboutClick }) => {
  return (
    <section className="relative overflow-hidden bg-[#DCE3D0] kitchen-pattern">
      {/* Atmospheric depth — soft light blooms behind the composition */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-[40rem] h-[40rem] rounded-full bg-[#EDF1E6]/70 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-[34rem] h-[34rem] rounded-full bg-[#F6C94C]/10 blur-3xl" />
      {/* Sage → cream wash so the section dissolves into the page below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#FFF8EE]" />

      {/* Ambient ingredients drifting across the whole hero */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden>
        {SCATTER.map((s, i) => (
          <s.C key={i} className={`absolute drop-shadow-sm ${s.cls}`} style={{ animationDelay: s.delay }} />
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32">

        {/* ── Editorial index bar ── */}
        <div className="hidden sm:flex items-center justify-between border-y border-[#4A3728]/15 py-3 text-[10px] font-bold brand-rounded uppercase tracking-[0.3em] text-[#4A3728]/55 animate-in fade-in duration-700">
          <span>Amie's Homemade</span>
          <span className="flex items-center gap-3">
            <span className="hidden lg:inline">Est. Ahmedabad · Small Batches</span>
            <span className="w-8 h-px bg-[#4A3728]/25 hidden lg:inline-block" />
            <span className="text-coral">15 Varieties</span>
          </span>
        </div>

        {/* ── Main composition ── */}
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center pt-6 sm:pt-10 pb-6">

          {/* Copy — 7 cols */}
          <div className="lg:col-span-7 relative z-20 text-center lg:text-left">
            <span
              className="inline-flex items-center gap-2.5 text-[#F04E4E] brand-rounded uppercase tracking-[0.35em] font-black text-[10px] sm:text-xs mb-5 sm:mb-7 animate-in fade-in slide-in-from-bottom-3 duration-700"
            >
              <span className="w-6 h-px bg-coral/50" /> Ami Shah's Secret Recipes <span className="w-6 h-px bg-coral/50" />
            </span>

            <h1 className="text-[#4A3728] serif font-bold leading-[0.92] tracking-[-0.01em] mb-6 sm:mb-8">
              <span className="block text-4xl sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '80ms' }}>
                Ahmedabad's Finest
              </span>
              <span className="block -mt-1 sm:-mt-2 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '180ms' }}>
                <span className="brand-script text-coral text-6xl sm:text-8xl lg:text-9xl leading-none pr-2 align-baseline">Mukhwas</span>
              </span>
              <span className="block text-4xl sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '260ms' }}>
                <span className="brand-script text-[#E0A93C] text-5xl sm:text-7xl lg:text-8xl">&amp;</span> Homemade Specialties
              </span>
            </h1>

            <p
              className="text-[#4A3728]/70 text-sm sm:text-lg font-medium leading-relaxed max-w-md mx-auto lg:mx-0 mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-3 duration-700"
              style={{ animationDelay: '340ms' }}
            >
              Traditional recipes, premium ingredients, and handcrafted goodness — from our signature mukhwas to wholesome granola and authentic masalas.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-3 duration-700"
              style={{ animationDelay: '420ms' }}
            >
              <button
                onClick={onShopClick}
                className="group px-9 sm:px-12 py-4 sm:py-5 bg-coral text-white rounded-full font-bold tracking-[0.2em] uppercase text-xs hover:scale-[1.04] hover:shadow-coral/40 transition-all duration-300 shadow-2xl shadow-coral/30 flex items-center gap-3 justify-center"
              >
                Shop the Collection
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button
                onClick={onAboutClick}
                className="px-9 sm:px-12 py-4 sm:py-5 bg-[#EFE5CF] text-[#4A3728] rounded-full font-bold tracking-[0.2em] uppercase text-xs hover:bg-[#E6D8B9] hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-[#4A3728]/5"
              >
                Our Story
              </button>
            </div>
          </div>

          {/* Imagery — one large lifestyle shot, 5 cols */}
          <div
            className="lg:col-span-5 relative z-10 animate-in fade-in zoom-in-95 duration-1000"
            style={{ animationDelay: '200ms' }}
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">

              {/* Floating group: photo + depth + seal drift together */}
              <div className="relative animate-float">
                {/* soft glow plate for depth */}
                <div className="pointer-events-none absolute -inset-5 rounded-[2.25rem] bg-gradient-to-br from-white/50 via-white/10 to-transparent blur-2xl" />

                <div className="relative rounded-[1.75rem] overflow-hidden shadow-[0_45px_90px_-25px_rgba(74,55,40,0.5)] ring-1 ring-white/60">
                  <img
                    src={tr(IMG_RANGE, 1200)}
                    srcSet={`${tr(IMG_RANGE, 700)} 700w, ${tr(IMG_RANGE, 1000)} 1000w, ${tr(IMG_RANGE, 1400)} 1400w`}
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    alt="Amie's Homemade full range — mukhwas, granola, masalas & gift box"
                    className="w-full h-auto block scale-[1.04]"
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                  />
                  {/* Depth vignette for richer lighting */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ boxShadow: 'inset 0 -50px 70px -35px rgba(74,55,40,0.4), inset 0 30px 50px -40px rgba(255,255,255,0.5)' }}
                  />
                </div>

                {/* Interactive artisanal seal — slows/grows on hover */}
                <div className="group absolute -bottom-7 -right-4 sm:-bottom-9 sm:-right-6 w-24 h-24 sm:w-32 sm:h-32 z-20 cursor-pointer">
                  <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_22s_linear_infinite] group-hover:[animation-duration:6s] drop-shadow-lg">
                      <defs>
                        <path id="seal-curve" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                      </defs>
                      <circle cx="50" cy="50" r="48" fill="#4A3728" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#F6C94C" strokeWidth="0.6" strokeDasharray="1 2" />
                      <text fill="#FFF8EE" className="brand-rounded" style={{ fontSize: '8.2px', fontWeight: 700, letterSpacing: '1.4px' }}>
                        <textPath href="#seal-curve" startOffset="0">
                          HANDMADE · NO PRESERVATIVES · AHMEDABAD ·
                        </textPath>
                      </text>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="brand-script text-[#F6C94C] text-xl sm:text-2xl leading-none">amie's</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kinetic marquee of varieties ── */}
      <div className="relative mt-6 sm:mt-10 border-y border-[#4A3728]/15 bg-[#4A3728] overflow-hidden pause-on-hover">
        <div className="flex whitespace-nowrap animate-marquee-left py-3 sm:py-4">
          {[0, 1].map(half => (
            <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
              {VARIETIES.map(name => (
                <span key={name} className="flex items-center text-[#FFF8EE] serif text-base sm:text-2xl px-5 sm:px-8">
                  {name}
                  <span className="text-[#F6C94C] ml-5 sm:ml-8 text-xs">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
