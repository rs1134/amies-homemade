import React from 'react';
import { ArrowRight } from 'lucide-react';
import { JarHeart, Sprout, GrainStalk, Droplet } from './HandIcons.tsx';

interface AboutUsProps {
  onNavigate?: (page: string) => void;
}

// ── Founder photography (new shoot, sage studio backdrop) ──
const FOUNDER_MAIN = 'https://ik.imagekit.io/amieshomemade/067A4315-1.jpg';
const FOUNDER_CANDID = 'https://ik.imagekit.io/amieshomemade/067A4339-1.jpg';
const img = (u: string, w: number) => `${u}?tr=w-${w},q-80,f-auto`;

// ── Hand-drawn ingredient illustrations (original SVG, license-free) ──
type IconProps = { className?: string; style?: React.CSSProperties };
const Almond: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 40 56" className={className} style={style} aria-hidden>
    <path d="M20 2C30 9 35 24 31 41 28 51 12 51 9 41 5 24 10 9 20 2Z" fill="#E7C9A1" stroke="#C79B68" strokeWidth="1.4" />
    <path d="M20 9C22 22 22 38 20 49" fill="none" stroke="#C79B68" strokeWidth="1.1" opacity="0.7" />
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

// Small ornamental divider
const Ornament: React.FC<{ tone?: string }> = ({ tone = '#C79B68' }) => (
  <div className="flex items-center justify-center gap-3 my-2" aria-hidden>
    <span className="h-px w-10 sm:w-16" style={{ background: `${tone}66` }} />
    <span className="text-sm" style={{ color: tone }}>✦</span>
    <span className="h-px w-10 sm:w-16" style={{ background: `${tone}66` }} />
  </div>
);

const JOURNEY = [
  { year: '2019', title: 'It began at home', desc: 'A family recipe box, a small kitchen in Ahmedabad, and Ami\'s quiet belief that the food she grew up on deserved to be shared beyond her own table.' },
  { year: 'Then', title: 'Word began to spread', desc: 'Neighbours knocked. Friends called. The way it always does in Ahmedabad — quietly, genuinely, one household at a time.' },
  { year: 'Every season', title: 'Packed by hand', desc: 'Festive boxes, everyday jars, special requests — each one filled fresh, by the same hands, with the same care.' },
  { year: 'Today', title: 'Known by heart', desc: 'A name hundreds of Ahmedabad homes now keep on their shelves. And through it all, nothing has changed.' },
];

const VALUES = [
  { Icon: JarHeart, bg: '#F3D9B1', title: '100% Homemade', desc: 'No factories. Just our kitchen.' },
  { Icon: Sprout, bg: '#DCE6C4', title: 'No Preservatives', desc: 'Always fresh, always natural.' },
  { Icon: GrainStalk, bg: '#EEDDBE', title: 'Premium Ingredients', desc: 'Only the finest make the jar.' },
  { Icon: Droplet, bg: '#D6E7F0', title: 'Hygienically Prepared', desc: 'Your health, our first priority.' },
];

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
  return (
    <div className="overflow-hidden bg-[#FFF8EE]">

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <section className="relative kitchen-pattern bg-gradient-to-b from-[#DCE3D0] via-[#E9EEE0] to-[#FFF8EE] pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 text-center overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/4 w-[34rem] h-[34rem] rounded-full bg-[#F6C94C]/10 blur-3xl" />
        <Almond className="absolute left-[6%] top-[28%] w-9 sm:w-12 opacity-30 -rotate-12 animate-float-soft" />
        <Fennel className="absolute right-[8%] top-[22%] w-12 sm:w-16 opacity-30 rotate-6 animate-float-rev" />
        <Petal className="absolute right-[16%] bottom-[14%] w-9 sm:w-12 opacity-25 rotate-12 animate-float" />

        <div className="relative max-w-3xl mx-auto">
          <p className="brand-rounded text-[#4A3728]/55 font-black text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-5">
            Est. 2019 · Ahmedabad · Handmade
          </p>
          <span className="inline-flex items-center gap-2.5 text-coral brand-rounded uppercase tracking-[0.35em] font-black text-[10px] sm:text-xs mb-5">
            <span className="w-6 h-px bg-coral/50" /> The Story of Amie's Homemade <span className="w-6 h-px bg-coral/50" />
          </span>
          <h1 className="serif font-bold text-[#4A3728] leading-[0.95] text-4xl sm:text-6xl lg:text-7xl">
            From Ahmedabad's Kitchen,<br />
            <span className="brand-script text-coral text-5xl sm:text-7xl lg:text-8xl">to Yours</span>
          </h1>
          <Ornament />
          <p className="text-[#4A3728]/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mt-4">
            A small home kitchen, a handful of treasured recipes, and a belief that food made with love simply tastes better.
          </p>
        </div>
      </section>

      {/* ── The heart: founder + narrative ───────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Portrait */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 bg-coral/10 custom-curve -rotate-6 scale-110" />
            <img
              src={img(FOUNDER_MAIN, 900)}
              srcSet={`${img(FOUNDER_MAIN, 600)} 600w, ${img(FOUNDER_MAIN, 900)} 900w`}
              sizes="(max-width: 1024px) 90vw, 45vw"
              alt="Ami Shah, founder of Amie's Homemade, with the full product range"
              className="relative z-10 w-full aspect-square object-cover rounded-[3rem] border-[12px] border-white shadow-2xl"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute -bottom-6 -right-2 sm:-bottom-7 sm:-right-6 z-20 bg-[#F6C94C] px-6 py-4 sm:px-8 sm:py-5 rounded-[2rem] shadow-2xl border-4 border-white text-center rotate-[-3deg]">
              <p className="brand-script text-[#F04E4E] text-2xl sm:text-3xl leading-none">Ami Shah</p>
              <p className="brand-rounded text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#4A3728] mt-1">Founder</p>
            </div>
            <Almond className="absolute -top-5 -left-4 w-10 opacity-50 -rotate-12 animate-float-soft z-20" />
          </div>

          {/* Narrative */}
          <div>
            <span className="brand-rounded text-coral font-black text-[10px] sm:text-xs uppercase tracking-[0.35em]">A Legacy of Flavour</span>
            <h2 className="serif font-bold text-[#4A3728] text-3xl sm:text-5xl mt-3 mb-7 leading-[1.02]">
              It started with<br /><span className="brand-script text-coral text-4xl sm:text-6xl">a mother's hands</span>
            </h2>
            <p className="text-[#4A3728]/75 text-lg leading-relaxed mb-5 first-letter:float-left first-letter:serif first-letter:font-bold first-letter:text-coral first-letter:text-6xl sm:first-letter:text-7xl first-letter:leading-[0.7] first-letter:mr-3 first-letter:mt-1">
              In 2019, in a small kitchen in Ahmedabad, Ami began making the mukhwas and snacks she'd grown up on — recipes passed down through her family, made exactly the way they always had been. What started as something she made for her own home soon became something she couldn't stop making.
            </p>
            <p className="text-[#4A3728]/75 text-lg leading-relaxed mb-5">
              Neighbours began knocking. Friends started calling. Word spread the way it always does in Ahmedabad — quietly, genuinely, one household at a time.
            </p>
            <p className="text-[#4A3728]/75 text-lg leading-relaxed">
              All these years later, Amie's is a name hundreds of Ahmedabad homes now know by heart. Through every batch, every season, every festive box — nothing has changed.
            </p>

            <div className="mt-8 pt-6 border-t border-[#4A3728]/10">
              <p className="brand-script text-coral text-3xl sm:text-4xl leading-none">Ami Shah</p>
              <p className="brand-rounded text-[10px] font-bold uppercase tracking-[0.25em] text-[#4A3728]/50 mt-1.5">Founder · Amie's Homemade</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pull-quote band with the candid photo ────────────────── */}
      <section className="relative bg-[#3D2D1F] text-[#FFF8EE] overflow-hidden py-12 sm:py-20">
        <div className="pointer-events-none absolute top-0 right-1/4 w-[34rem] h-[34rem] rounded-full bg-[#F6C94C]/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 items-center gap-8 lg:gap-14 px-4 sm:px-6 lg:px-12">
          <div className="relative">
            <img
              src={img(FOUNDER_CANDID, 1000)}
              srcSet={`${img(FOUNDER_CANDID, 600)} 600w, ${img(FOUNDER_CANDID, 1000)} 1000w`}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt="Ami Shah with the Amie's Homemade range"
              className="w-full h-auto block rounded-[1.5rem] shadow-2xl ring-1 ring-white/10"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="text-center lg:text-left">
            <span className="serif text-7xl sm:text-8xl text-[#F6C94C] leading-[0.5] block mb-4">&ldquo;</span>
            <p className="serif text-2xl sm:text-4xl lg:text-[2.6rem] leading-[1.2] text-[#FFF8EE]">
              No shortcuts. No compromises. Food made the way it always should be —
              <span className="text-[#F6C94C]"> the same hands, the same recipes, the same love.</span>
            </p>
            <p className="brand-rounded text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#FFF8EE]/50 mt-8">
              The Amie's Promise
            </p>
          </div>
        </div>
      </section>

      {/* ── The journey (heritage timeline) ──────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28">
        <div className="text-center mb-12 sm:mb-20">
          <span className="brand-rounded text-coral font-black text-[10px] sm:text-xs uppercase tracking-[0.35em]">Our Journey</span>
          <h2 className="serif font-bold text-[#4A3728] text-3xl sm:text-5xl mt-3">How a kitchen became a name</h2>
          <Ornament />
        </div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-[1.15rem] sm:left-1/2 sm:-translate-x-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-coral/40 via-[#C79B68]/40 to-coral/40" />
          <div className="space-y-10 sm:space-y-16">
            {JOURNEY.map((m, i) => (
              <div key={m.year} className={`relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-12 ${i % 2 ? 'sm:[&>*:first-child]:order-2' : ''}`}>
                {/* dot */}
                <span className="absolute left-[0.7rem] sm:left-1/2 sm:-translate-x-1/2 top-1.5 w-4 h-4 rounded-full bg-coral ring-4 ring-[#FFF8EE] shadow" />
                <div className={`${i % 2 ? 'sm:text-left sm:pl-12' : 'sm:text-right sm:pr-12'}`}>
                  <span className="brand-script text-coral text-3xl sm:text-5xl leading-none">{m.year}</span>
                </div>
                <div className={`${i % 2 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'}`}>
                  <h3 className="serif font-bold text-[#4A3728] text-xl sm:text-2xl mb-2">{m.title}</h3>
                  <p className="text-[#4A3728]/65 leading-relaxed text-sm sm:text-base">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#FFF8EE] to-[#F3EEE2] py-16 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Fennel className="absolute left-[5%] top-[18%] w-12 opacity-25 -rotate-12 animate-float-soft" />
        <Petal className="absolute right-[6%] bottom-[16%] w-11 opacity-25 rotate-6 animate-float-rev" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="brand-rounded text-coral font-black text-[10px] sm:text-xs uppercase tracking-[0.35em]">The Amie's Difference</span>
            <h2 className="serif font-bold text-[#4A3728] text-3xl sm:text-5xl mt-3">Why families choose <span className="brand-script text-coral whitespace-nowrap">Amie's Homemade</span></h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-7">
            {VALUES.map((v, i) => (
              <div key={v.title} className="group bg-white rounded-[1.75rem] p-6 sm:p-8 text-center shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#4A3728]/5">
                {/* Hand-drawn illustration in a soft rounded blob, each on a
                    slight alternating tilt — a still, perfectly centered
                    icon-in-a-square is the thing that reads as generic/
                    AI-template; a little asymmetry reads as made, not generated. */}
                <div
                  className="mx-auto mb-5 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                  style={{
                    background: v.bg,
                    borderRadius: i % 2 === 0 ? '42% 58% 63% 37% / 41% 44% 56% 59%' : '58% 42% 37% 63% / 55% 60% 40% 45%',
                    transform: `rotate(${i % 2 === 0 ? -4 : 4}deg)`,
                  }}
                >
                  <v.Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ transform: `rotate(${i % 2 === 0 ? 4 : -4}deg)` }} />
                </div>
                <h4 className="serif font-bold text-[#4A3728] text-base sm:text-lg mb-2">{v.title}</h4>
                <p className="text-[12px] sm:text-sm text-[#4A3728]/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing signature ────────────────────────────────────── */}
      <section className="relative bg-[#DCE3D0] kitchen-pattern py-16 sm:py-24 px-4 text-center overflow-hidden">
        <Almond className="absolute left-[10%] top-[30%] w-9 opacity-30 -rotate-12 animate-float" />
        <Petal className="absolute right-[12%] top-[24%] w-9 opacity-30 rotate-12 animate-float-soft" />
        <div className="relative max-w-2xl mx-auto">
          <Ornament />
          <p className="serif text-2xl sm:text-4xl text-[#4A3728] leading-tight mb-3">Made with love in Ahmedabad.</p>
          <p className="brand-script text-coral text-4xl sm:text-6xl leading-[1.05] mb-8">Amie's Homemade</p>
          <button
            onClick={() => onNavigate?.('shop')}
            className="group inline-flex items-center gap-3 px-10 sm:px-12 py-4 sm:py-5 bg-coral text-white rounded-full font-bold tracking-[0.2em] uppercase text-xs hover:scale-[1.03] transition-all duration-300 shadow-2xl shadow-coral/30"
          >
            Explore the Collection
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
