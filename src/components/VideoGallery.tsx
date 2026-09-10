import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface ReelVideo {
  id: string;
  url: string;
  title: string;
}

// Add more entries here as videos come in — each just needs a hosted URL
// and a title. Self-hosted (not embedded from Instagram) so playback stays
// entirely on-site and never redirects visitors away.
const REELS: ReelVideo[] = [
  {
    id: 'reel-1',
    url: 'https://ik.imagekit.io/amieshomemade/IMG_4009.MP4?updatedAt=1783521371269',
    title: 'Made for Those Who Love Authentic Mukhwas',
  },
  {
    id: 'reel-2',
    url: 'https://ik.imagekit.io/amieshomemade/0A3E902E-498B-4FA2-9191-E882D1649588%20(1)%20(1).mp4',
    title: 'Freshly Made, Straight From Ahmedabad',
  },
  {
    id: 'reel-3',
    url: 'https://ik.imagekit.io/amieshomemade/Amies%20homemade%20hamper%20(1)%20(1)%20(1).mp4',
    title: 'Beautifully Packed, Ready to Gift',
  },
  {
    id: 'reel-4',
    url: 'https://ik.imagekit.io/amieshomemade/8ec7a427f345417689013b4078d6e88b.mp4',
    title: 'Handcrafted With Love, Every Batch',
  },
  {
    id: 'reel-5',
    url: 'https://ik.imagekit.io/amieshomemade/7a211d6446bc4f6bbc29512093ce6f74.mp4',
    title: 'Real Ingredients, No Shortcuts',
  },
];

const ReelCard: React.FC<{ reel: ReelVideo }> = ({ reel }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex-shrink-0 w-[220px] sm:w-[260px] snap-start">
      <div className="relative aspect-[9/16] rounded-[1.75rem] overflow-hidden bg-[#2A1E14] shadow-lg">
        <video
          src={reel.url}
          className="w-full h-full object-cover"
          preload="metadata"
          playsInline
          controls={playing}
          autoPlay={playing}
          onEnded={() => setPlaying(false)}
        />
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${reel.title}`}
            className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/25 transition-colors group"
          >
            <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play size={22} className="text-coral ml-0.5" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <p className="mt-3 text-sm font-bold serif text-[#4A3728] leading-snug">{reel.title}</p>
    </div>
  );
};

const VideoGallery: React.FC = () => {
  if (REELS.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 px-4 bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold serif text-[#4A3728] text-center mb-10 sm:mb-14">
          The Buzz Around Amie's Homemade
        </h2>
        <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {REELS.map(reel => <ReelCard key={reel.id} reel={reel} />)}
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
