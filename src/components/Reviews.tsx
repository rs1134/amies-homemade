import { useEffect, useState } from 'react';

interface Review {
  rating: number;
  text: string;
  relativeTime: string;
  googleMapsUri: string;
  author: {
    name: string;
    photoUri: string;
    uri: string;
  };
}

interface ReviewsData {
  rating: number;
  userRatingCount: number;
  googleMapsUri: string;
  reviews: Review[];
}

// Google "G" logo SVG
const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return (
    <div className={`flex gap-0.5 ${sizes[size]} text-[#F5A623]`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}>{i <= rating ? '★' : '☆'}</span>
      ))}
    </div>
  );
};

const AuthorAvatar = ({ name, photoUri }: { name: string; photoUri: string }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#F14E4E', '#4A90D9', '#7B68EE', '#50C878', '#FF8C00', '#DB7093'];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (imgError) {
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={photoUri}
      alt={name}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

export default function Reviews() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/google-reviews')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Don't render section at all if loading fails
  if (!loading && !data) return null;

  return (
    <section className="bg-[#FDF6EE] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] text-[#F14E4E] uppercase mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#4A3728] mb-4">
            Kind Words From Our Community
          </h2>
          <div className="w-12 h-0.5 bg-[#F14E4E] mx-auto mb-6" />

          {/* Google rating summary */}
          {data && data.rating != null && (
            <a
              href={data.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <GoogleLogo />
              <span className="text-sm font-bold text-[#4A3728]">{data.rating.toFixed(1)}</span>
              <StarRating rating={Math.round(data.rating)} size="sm" />
              <span className="text-sm text-[#4A3728]/60">
                {data.userRatingCount} reviews on Google
              </span>
            </a>
          )}

          {/* Loading skeleton for rating badge */}
          {loading && (
            <div className="inline-flex items-center gap-2.5 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-100">
              <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          )}
        </div>

        {/* Cards row */}
        {loading ? (
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-white rounded-3xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="w-24 h-3 bg-gray-200 rounded" />
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-gray-200 rounded" />
                  <div className="w-full h-3 bg-gray-200 rounded" />
                  <div className="w-3/4 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.reviews.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 sm:-mx-10 sm:px-10">
            {data.reviews.map((review, idx) => (
              <a
                key={idx}
                href={review.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[300px] sm:w-[340px] bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 group"
              >
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <AuthorAvatar name={review.author.name} photoUri={review.author.photoUri} />
                  <div>
                    <p className="font-bold text-[#4A3728] text-sm leading-tight">{review.author.name}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>

                {/* Review text */}
                <p className="text-[#4A3728]/80 text-sm leading-relaxed flex-1">
                  "{review.text}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <GoogleLogo />
                    <span className="text-xs text-[#4A3728]/50 font-medium">Posted on Google</span>
                  </div>
                  <span className="text-xs text-[#4A3728]/40">{review.relativeTime}</span>
                </div>
              </a>
            ))}
          </div>
        ) : null}

        {/* View all link */}
        {data && (
          <div className="text-center mt-8">
            <a
              href={data.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#F14E4E] hover:underline"
            >
              <GoogleLogo />
              View all {data.userRatingCount} reviews on Google
              <span>→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
