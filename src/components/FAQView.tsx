import React, { useState } from 'react';
import { Plus, Minus, MessageCircle, HelpCircle, ShoppingBag, Truck, Gift } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants.ts';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  label: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    label: 'Products & Ingredients',
    icon: <HelpCircle size={20} />,
    color: 'text-[#F04E4E]',
    iconBg: 'bg-[#FFF1F1]',
    items: [
      {
        q: 'What ingredients do you use? Are there any preservatives?',
        a: 'Every product at Amie\'s Homemade is made with 100% natural ingredients — the same ones you would find in a traditional Indian kitchen. No artificial colors, no synthetic flavors, and absolutely no preservatives of any kind. Our mukhwas uses real fennel seeds, coriander seeds, sesame seeds, dried rose petals, cardamom, and carom seeds. If it is not a real ingredient with a real name, it is not in our products. The ingredient list on every jar is short, legible, and honest.',
      },
      {
        q: 'What makes Amie\'s mukhwas different from what you find in a supermarket?',
        a: 'Most commercial mukhwas is made months in advance, coated in sugar syrup and artificial dyes, and sits in a warehouse before reaching you. Amie\'s mukhwas is made fresh in small batches by Ami Shah personally, using the same family recipes that have been passed down through generations. No sugar coating on the seeds, no neon colors, no synthetic aromas. The flavor comes from the actual ingredients — and because the batches are small and made to order, the seeds are genuinely fresh when they arrive.',
      },
      {
        q: 'Do you offer sugar-free options for diabetics?',
        a: 'Yes — and this is something we feel strongly about. Traditional mukhwas ingredients (fennel, coriander, sesame, carom, cardamom) are naturally low-GI and do not contain sugar in their natural state. Our plain mukhwas blends have no added sugar, no sugar coating, and no glucose syrup. They are genuinely safe for diabetics. If you are gifting to a diabetic family member, please mention it when ordering — we will make sure the hamper contains only uncoated, sugar-free varieties.',
      },
      {
        q: 'Are your products suitable for vegans and vegetarians?',
        a: 'Yes, all of our products are 100% vegetarian. Our mukhwas, snacks, and most sweets contain no meat, eggs, or animal-derived gelatin. Many products are also vegan — if you have a specific dietary requirement, please ask us before ordering and we will confirm which products are suitable for you.',
      },
      {
        q: 'What is the shelf life of your products?',
        a: 'Because we use no preservatives, our products have a shorter shelf life than commercial alternatives — and that is exactly the point. Mukhwas stays fresh for 3 to 4 weeks when stored in an airtight container at room temperature, away from direct sunlight and moisture. Chakli and namkeen stay fresh for 2 to 3 weeks. Ladoo and barfi are best consumed within 10 to 14 days. We recommend ordering closer to when you need the product, rather than storing it for extended periods.',
      },
      {
        q: 'Are your products made in a licensed and hygienic kitchen?',
        a: 'Yes. Ami Shah\'s home kitchen operates with rigorous hygiene standards — small batches, clean equipment, and careful handling at every stage. Because we make in limited quantities, every batch receives the same personal attention. We do not run a factory floor. We run a kitchen where someone who cares about the food is present for every step of making it.',
      },
    ],
  },
  {
    label: 'Ordering',
    icon: <ShoppingBag size={20} />,
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFF8E7]',
    items: [
      {
        q: 'How do I place an order?',
        a: 'The easiest way is to WhatsApp us directly at +91 91575 37842. You can browse our products on this website, add items to your cart, and complete checkout — or simply message us and Ami Shah will guide you through the options personally. For custom or bulk orders, WhatsApp is the best channel since we can discuss your specific requirements and curate the right hamper for you.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'For online orders, we accept UPI payment (Google Pay, PhonePe, Paytm, and all UPI apps). We do not offer Cash on Delivery for orders outside Ahmedabad. For Ahmedabad-based deliveries, cash payment at the time of delivery is also accepted.',
      },
      {
        q: 'Can I customize the contents of a gift hamper?',
        a: 'Absolutely — and we encourage it. Customizing a hamper is what separates a thoughtful gift from a generic one. You can choose which mukhwas varieties go in, adjust quantities, add or remove specific products, and specify any dietary requirements (sugar-free, nut-free, etc.). Our Heritage Box is specifically designed to be built around the recipient. Just tell us who it is for and what they love, and we will put together something that feels made for them — because it is.',
      },
      {
        q: 'What is the minimum order quantity?',
        a: 'There is no minimum for regular orders — you can order a single jar if you like. For bulk and corporate orders, a minimum of 10 hampers is required to unlock wholesale pricing. For wedding favors, we typically recommend a minimum of 25 units to ensure consistent packaging and presentation.',
      },
      {
        q: 'Can I schedule delivery for a specific date — like Diwali or a birthday?',
        a: 'Yes. When you place your order, simply let us know the date you need the delivery by. For festival seasons (Diwali, Navratri, Raksha Bandhan), we strongly recommend ordering at least 7 to 10 days in advance — demand is high and we make in small batches, so early orders always get priority. For birthdays and anniversaries, 3 to 4 days advance notice is usually sufficient.',
      },
    ],
  },
  {
    label: 'Delivery',
    icon: <Truck size={20} />,
    color: 'text-[#059669]',
    iconBg: 'bg-[#F0FFF4]',
    items: [
      {
        q: 'Do you deliver across India?',
        a: 'Yes — we deliver pan-India. Ahmedabad and the surrounding areas of Gujarat receive orders fastest (typically 1 working day). For the rest of India, we ship via reliable courier and orders typically arrive within 3 to 5 business days. We have delivered to Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Pune, Kolkata, and hundreds of smaller cities across the country.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Within Ahmedabad: 1 working day after preparation. Across India: 3 to 5 business days after dispatch. Orders are freshly prepared and dispatched within 1 to 2 business days of payment confirmation. During peak festival seasons, preparation may take an additional day — please factor this in when ordering for a specific occasion.',
      },
      {
        q: 'What are the delivery charges?',
        a: 'Delivery within Ahmedabad is FREE. For orders outside Ahmedabad, shipping charges are calculated by weight: up to 500g — ₹60; 500g to 1kg — ₹100; 1kg to 2kg — ₹150; 2kg to 5kg — ₹200; above 5kg — ₹250. These rates apply to all courier deliveries across India.',
      },
      {
        q: 'How do you ensure the products stay fresh during shipping?',
        a: 'Our products are packed in airtight containers (glass jars for mukhwas, sealed pouches for snacks) and then wrapped carefully in bubble wrap or padded material before being placed in a sturdy outer box. The airtight packaging is the most important factor — it prevents moisture from reaching the products during transit. If you receive a damaged or compromised package, please contact us within 24 hours on WhatsApp with a photo and we will resolve it promptly.',
      },
    ],
  },
  {
    label: 'Corporate & Bulk Gifting',
    icon: <Gift size={20} />,
    color: 'text-[#7C3AED]',
    iconBg: 'bg-[#F5F3FF]',
    items: [
      {
        q: 'Do you handle corporate gifting orders?',
        a: 'Yes — corporate gifting is one of our most requested services, especially during Diwali and other major festivals. We have fulfilled corporate orders for companies across multiple industries, ranging from 20-piece hampers for a small office to 500+ piece orders for large enterprises. Every corporate hamper is made fresh and packed consistently, with the option to include a custom card or branding.',
      },
      {
        q: 'What is the minimum quantity for bulk or corporate orders?',
        a: 'Bulk pricing applies from 10 hampers onwards. The more units you order, the better the per-unit pricing. For corporate orders of 50+ hampers, we offer preferential rates and can discuss a fully custom presentation box with your company\'s branding. Please WhatsApp us with your requirement and timeline and we will send you a detailed quote.',
      },
      {
        q: 'Can you add custom branding or a personalized message to each hamper?',
        a: 'Yes. For corporate orders, we can include a custom printed card with your company\'s logo and message. For smaller personal orders, we include a handwritten note card with whatever message you want. Custom box printing with your company name or logo is available for bulk orders above 50 units — please inquire in advance as this requires additional lead time.',
      },
      {
        q: 'What are the most popular corporate gifting options?',
        a: 'Our most requested corporate hampers are: the Classic Mukhwas Set (3–5 glass jars in a wooden presentation box), the Wellness Hamper (sugar-free mukhwas varieties for health-conscious recipients), the Heritage Snack Box (mukhwas + chakli + namkeen in a premium wooden box), and the Grand Heritage Hamper (our most luxurious option, ideal for VIP clients and senior management). We can build any combination based on your budget and the impression you want to make.',
      },
      {
        q: 'How much advance notice do you need for a large corporate order?',
        a: 'For orders up to 50 hampers, 5 to 7 days is usually sufficient. For orders between 50 and 200 hampers, we recommend 10 to 14 days. For orders above 200 hampers — especially for Diwali — please contact us at least 3 to 4 weeks in advance. All hampers are made fresh, so we cannot rush production without compromising quality.',
      },
    ],
  },
];

interface FAQViewProps {
  onNavigate?: (page: string) => void;
}

const FAQView: React.FC<FAQViewProps> = ({ onNavigate }) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number>(0);

  const toggle = (key: string) => setOpenKey(prev => prev === key ? null : key);

  const category = FAQ_DATA[activeCategory];

  return (
    <div className="pt-24 pb-20 sm:pt-32 sm:pb-32 px-4 min-h-screen">
      {/* Header */}
      <div className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
        <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">Everything You Need to Know</span>
        <h1 className="text-4xl sm:text-6xl font-bold serif text-[#4A3728] leading-tight mb-6">
          Frequently Asked<br />
          <span className="text-[#F04E4E]">Questions</span>
        </h1>
        <div className="w-16 h-1.5 bg-coral rounded-full mx-auto mb-6" />
        <p className="text-[#4A3728]/60 text-lg leading-relaxed">
          Can't find what you're looking for? Chat with us on WhatsApp and we'll answer within minutes.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FAQ_DATA.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveCategory(idx); setOpenKey(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 brand-rounded text-[10px] uppercase tracking-[0.2em] font-bold ${
                activeCategory === idx
                  ? 'bg-[#F04E4E] border-[#F04E4E] text-white shadow-xl shadow-[#F04E4E]/30 scale-105'
                  : 'border-[#F04E4E]/10 text-[#4A3728]/50 hover:text-coral hover:bg-[#F04E4E]/5'
              }`}
            >
              <span className={activeCategory === idx ? 'text-white' : cat.color}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {category.items.map((item, idx) => {
            const key = `${activeCategory}-${idx}`;
            const isOpen = openKey === key;
            return (
              <div
                key={key}
                className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-[#F04E4E]/20 shadow-xl shadow-[#F04E4E]/5' : 'border-[#4A3728]/5 hover:border-[#F04E4E]/10 hover:shadow-lg'
                }`}
              >
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-center justify-between gap-4 p-6 sm:p-8 text-left"
                >
                  <span className={`font-bold text-base sm:text-lg leading-snug transition-colors ${isOpen ? 'text-[#F04E4E]' : 'text-[#4A3728]'}`}>
                    {item.q}
                  </span>
                  <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-[#F04E4E] text-white rotate-0' : 'bg-[#F04E4E]/5 text-coral'
                  }`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 sm:px-8 pb-7">
                    <div className="w-12 h-0.5 bg-[#F04E4E]/20 rounded-full mb-5" />
                    <p className="text-[#4A3728]/70 text-base leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-16 bg-[#FFF1F1] rounded-[3rem] p-10 sm:p-14 text-center border border-[#F04E4E]/10">
          <div className="w-16 h-16 bg-[#F04E4E]/10 rounded-[1.5rem] flex items-center justify-center text-coral mx-auto mb-6">
            <MessageCircle size={32} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mb-3">Still have a question?</h3>
          <p className="text-[#4A3728]/60 mb-8 max-w-md mx-auto leading-relaxed">
            We typically respond on WhatsApp within minutes. Ami Shah answers every message personally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi%20Amie!%20I%20have%20a%20question%20that%20I%20couldn't%20find%20on%20your%20FAQ%20page.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#25D366] text-white rounded-full font-bold brand-rounded uppercase tracking-[0.2em] text-[10px] hover:shadow-2xl hover:shadow-[#25D366]/30 hover:scale-105 transition-all"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
            {onNavigate && (
              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-coral border-2 border-coral/20 rounded-full font-bold brand-rounded uppercase tracking-[0.2em] text-[10px] hover:border-coral hover:shadow-xl transition-all"
              >
                View Contact Page
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQView;
