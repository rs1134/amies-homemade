import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  product: string;
  text: string;
  initials: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Hetal Patel",
    product: "Amla Ginger Mukhwas",
    text: "Honestly ordered just to try once but now it's a monthly thing. The amla ginger is so good after lunch. No artificial taste at all. My mother in law also approves 😄",
    initials: "HP"
  },
  {
    id: 2,
    name: "Maulik Shah",
    product: "Royal Heritage Box",
    text: "Gifted this to my boss for diwali. The presentation was very premium, he was genuinely impressed. Worth every rupee. Will order again for sure",
    initials: "MS"
  },
  {
    id: 3,
    name: "Riddhi Desai",
    product: "Tender Coconut Chips",
    text: "These chips finished in 2 days in my house lol. Kids loved it. Nice that there's no heavy masala, just natural flavor. Packaging was also very neat",
    initials: "RD"
  },
  {
    id: 4,
    name: "Foram Mehta",
    product: "Chatpati Mango Mukhwas",
    text: "The mango mukhwas is exactly how it should be — tangy, little spicy, not too sweet. Reminds me of what my nani used to make. Delivery was quick too",
    initials: "FM"
  },
  {
    id: 5,
    name: "Nirav Gandhi",
    product: "Chakri",
    text: "Chakri is perfectly crunchy, not too oily. Ordered 500g and it was gone in a week 😅 family se bachana mushkil hai. Will order 1kg next time",
    initials: "NG"
  },
  {
    id: 6,
    name: "Bansari Joshi",
    product: "Wellness Mukhwas Collection",
    text: "Got this as a gift and the glass jars are so pretty I kept them after finishing. The dryfruit mix was my favourite. Very thoughtful gifting option",
    initials: "BJ"
  },
  {
    id: 7,
    name: "Dhruv Trivedi",
    product: "Almond Motichoor Ladoo",
    text: "I'm very particular about mithai and these ladoos are genuinely good. You can taste the ghee quality. Not overly sweet which I appreciate. Highly recommend",
    initials: "DT"
  },
  {
    id: 8,
    name: "Prachi Shah",
    product: "Roasted Chevda",
    text: "Simple, clean, homemade taste. No extra colour or strong smell like the packaged ones. My evening chai is incomplete without this now honestly",
    initials: "PS"
  },
  {
    id: 9,
    name: "Kiran Modi",
    product: "Cranberry Mix",
    text: "Ordered for the first time after seeing on instagram. Was a little skeptical but it's really good. The cranberry and black grape combo works so well. Packaging is cute too",
    initials: "KM"
  },
  {
    id: 10,
    name: "Jayesh Kapadia",
    product: "Sweet Memories Platter",
    text: "Ordered for a small family function. Everyone kept asking where I got it from. The ghugra was the star. Already recommended to 3 people. Great quality",
    initials: "JK"
  }
];

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="flex-shrink-0 w-[350px] bg-white p-8 rounded-[3rem] border border-coral/5 shadow-xl hover:shadow-2xl transition-all duration-500 mx-4">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-coral/10 rounded-2xl flex items-center justify-center text-coral font-bold brand-rounded">
          {review.initials}
        </div>
        <div>
          <h4 className="font-bold text-[#4A3728] text-sm serif">{review.name}</h4>
          <div className="flex items-center gap-1 text-[#F6C94C] mt-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
          </div>
        </div>
      </div>
    </div>
    
    <div className="mb-6">
      <span className="bg-coral/5 text-coral px-3 py-1 rounded-full text-[8px] font-black brand-rounded uppercase tracking-widest border border-coral/10">
        Loves {review.product}
      </span>
    </div>

    <p className="text-[#4A3728]/70 text-[13px] leading-relaxed italic">
      "{review.text}"
    </p>
    
    <div className="mt-8 flex items-center gap-2 text-[9px] font-black brand-rounded text-green-600 uppercase tracking-widest">
      <CheckCircle size={14} /> Verified Buyer
    </div>
  </div>
);

const Reviews: React.FC = () => {
  return (
    <section className="py-16 bg-[#FFF8EE] overflow-hidden">
      <div className="text-center mb-16">
        <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Testimonials</span>
        <h2 className="text-4xl sm:text-5xl font-bold serif text-[#4A3728]">Kind Words From Our Community</h2>
        <div className="w-16 h-1 bg-coral mx-auto rounded-full mt-6"></div>
      </div>

      <div>
        {/* Constant motion marquee */}
        <div className="flex animate-marquee-left">
          {[...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, idx) => (
            <ReviewCard key={`${review.id}-${idx}`} review={review} />
          ))}
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="brand-rounded text-[#4A3728]/40 font-bold uppercase text-[10px] tracking-[0.4em]">
          Join 5000+ Happy Foodies Across the Nation
        </p>
      </div>
    </section>
  );
};

export default Reviews;