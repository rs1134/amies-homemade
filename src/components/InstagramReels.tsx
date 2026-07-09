import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface Reel {
  image: string;
  /** Self-hosted mp4 — plays inline on click. Falls back to linking out to
   * `url` when not provided (e.g. before the source video file is on hand). */
  video?: string;
  url: string;
}

// No ?tr= transform param — ImageKit's free-plan video transformation quota
// is exhausted, which made every transformed video 403 account-wide
// (confirmed via ImageKit dashboard: "Video transformation usage exceeded
// free plan limits"). Plain URLs serve ImageKit's default-optimized upload
// instead (a few MB, moov atom at front, delivered at ~18MB/s) and don't
// touch that quota.
const REELS: Reel[] = [
  { image: '/instagram-reels/reel-1.jpg', video: 'https://ik.imagekit.io/amieshomemade/IMG_4009.MP4', url: 'https://www.instagram.com/p/DahwpBCv2mH/' },
  { image: '/instagram-reels/reel-2.jpg', video: 'https://ik.imagekit.io/amieshomemade/REEL%2004%20(2).mp4', url: 'https://www.instagram.com/p/DaQILIYzDVi/' },
  { image: '/instagram-reels/reel-3.jpg', video: 'https://ik.imagekit.io/amieshomemade/REEL%2002%20(5).mp4', url: 'https://www.instagram.com/reel/DadDp7WTiX5/' },
  { image: '/instagram-reels/reel-4.jpg', video: 'https://ik.imagekit.io/amieshomemade/REEL%2003%20(2).mp4', url: 'https://www.instagram.com/reel/DafmFJbScOR/' },
];

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  onActivate: () => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, isActive, onActivate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  // When a different card is tapped, pause (and rewind) this one so only one
  // reel ever plays / buffers at a time.
  useEffect(() => {
    if (!isActive && videoRef.current && started) {
      videoRef.current.pause();
    }
  }, [isActive, started]);

  // No source video yet — thumbnail links out to the real Instagram post.
  const cardClasses = 'group relative flex-shrink-0 w-[45%] sm:w-[30%] lg:w-[23%] aspect-[9/16] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 snap-start bg-black';

  if (!reel.video) {
    return (
      <a href={reel.url} target="_blank" rel="noopener noreferrer" className={cardClasses}>
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
    );
  }

  // CRITICAL: play() is called synchronously here, inside the click handler,
  // so the browser's user-gesture activation carries through and unmuted
  // playback is allowed. (Calling play() later — e.g. in a useEffect after a
  // state change and video remount — loses that activation, so the browser
  // silently blocks playback and the video sits at 0:00. That was the bug.)
  const handlePlay = () => {
    onActivate();
    setStarted(true);
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Some strict mobile/low-power contexts still refuse unmuted autoplay
      // even from a gesture — retry muted as a last resort.
      v.muted = true;
      v.play().catch(() => { /* native controls still let them press play */ });
    });
  };

  return (
    <div className={cardClasses}>
      {/* preload="none": the element is always mounted (so play() has a live
          ref to call synchronously on click) but fetches nothing until then,
          keeping page load unaffected. */}
      <video
        ref={videoRef}
        src={reel.video}
        poster={reel.image}
        controls={started}
        playsInline
        preload="none"
        className="w-full h-full object-cover"
      />
      {!started && (
        <button
          onClick={handlePlay}
          aria-label="Play reel"
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play size={22} fill="#4A3728" className="text-[#4A3728] ml-0.5" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

const InstagramReels: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(':scope > *')?.clientWidth || 280;
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + 16) : cardWidth + 16, behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block">
            Behind The Scenes
          </span>
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
              <ReelCard
                key={i}
                reel={reel}
                isActive={activeIndex === i}
                onActivate={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramReels;
