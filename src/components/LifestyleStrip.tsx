import React from 'react';

const PHOTOS = [
  'https://ik.imagekit.io/amieshomemade/067A1624.JPG',
  'https://ik.imagekit.io/amieshomemade/067A1644.JPG',
  'https://ik.imagekit.io/amieshomemade/067A1703.JPG',
  'https://ik.imagekit.io/amieshomemade/067A1730.JPG',
];

const ikImg = (url: string, w: number) => `${url}?tr=w-${w},q-80,f-auto`;

const LifestyleStrip: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF8EE]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
            Real Moments
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold serif text-[#4A3728]">
            Loved, Shared, Enjoyed
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {PHOTOS.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={ikImg(src, 500)}
                srcSet={`${ikImg(src, 350)} 350w, ${ikImg(src, 600)} 600w`}
                sizes="(max-width: 640px) 45vw, 22vw"
                alt="A customer enjoying Amie's Homemade mukhwas"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LifestyleStrip;
