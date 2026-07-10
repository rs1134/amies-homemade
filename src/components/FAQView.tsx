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
        q: 'Do you use any artificial colours, flavours, or preservatives?',
        a: 'No. Every product — mukhwas, masalas, granola, and wellness blends — is made with 100% natural ingredients. No artificial colours, no synthetic flavours, and no preservatives of any kind.',
      },
      {
        q: 'Are all your products made in-house?',
        a: 'Yes, everything is made in-house by hand in small batches. We do not source or resell products from outside our kitchen.',
      },
      {
        q: 'What is the shelf life of your products?',
        a: 'All mukhwas, granola, and dry fruit milk masala stay fresh for 6 months from the date of packaging. Chai Masala lasts up to 1 year. Store in a cool, dry place away from direct sunlight — the best before date is printed on every pack.',
      },
      {
        q: 'What are your best-selling products?',
        a: 'Our top six are: Dryfruit and Seeds, Chatpati Mango, Tender Coconut Vanilla Chips, Kharek Coconut Almond, Homemade Healthy Granola, and Dry Fruit Milk Masala. All six are marked with a Bestseller badge in our shop.',
      },
      {
        q: 'What sizes are available?',
        a: 'Mukhwas varieties are available in 200 g packs. Homemade Healthy Granola comes in 250 g. Dry Fruit Milk Masala is available in 100 g, and Chai Masala in 250 g. All sizes are clearly shown on the product page.',
      },
      {
        q: 'Are your products suitable for diabetics?',
        a: 'Several of our mukhwas blends are free from added sugar, coating, and glucose syrup — making them suitable for diabetics. Check the product description for each variety, or WhatsApp us and we will guide you to the right options.',
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
        a: 'Add products to your cart directly on this website and complete checkout — it takes under 2 minutes. For custom hampers, bulk orders, or any special requests, WhatsApp us at +91 90540 38876 and we will guide you personally.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI (Google Pay, PhonePe, Paytm), debit/credit cards, and net banking — all processed securely via Razorpay. We do not offer Cash on Delivery.',
      },
      {
        q: 'Can I get a custom gift hamper?',
        a: 'Yes. We offer two ready hampers — Trio of Traditions (₹999) and The Gourmet Discovery (₹1,499) — available directly on the Gifting page. For fully custom hampers with specific products, quantities, or sizes, WhatsApp us and we will build one around your budget.',
      },
      {
        q: 'Is there a minimum order quantity?',
        a: 'No minimum for regular orders. For wholesale or bulk pricing, a minimum order of 15 kg applies. For corporate hampers, bulk pricing starts from 50 units.',
      },
      {
        q: 'Can I schedule delivery for a specific date?',
        a: 'Yes. Mention your required delivery date at checkout or on WhatsApp. For Diwali and festival seasons, order at least 7–10 days in advance. For birthdays and events, 3–4 days is usually sufficient.',
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
        a: 'Yes, we deliver pan-India. Ahmedabad orders arrive within 2 working days. All other cities receive orders within 3–5 working days via courier.',
      },
      {
        q: 'What are the delivery charges?',
        a: 'Delivery within Ahmedabad is FREE. Outside Ahmedabad: up to 500g — ₹60 | 500g–1kg — ₹100 | 1–2kg — ₹150 | 2–5kg — ₹200 | above 5kg — ₹250. Pan-India shipping is FREE on orders above ₹1,499.',
      },
      {
        q: 'Do you offer same-day delivery in Ahmedabad?',
        a: 'Same-day delivery is available for Ahmedabad orders placed before 12 PM, subject to availability. WhatsApp us to confirm before placing your order.',
      },
      {
        q: 'How are products packed for shipping?',
        a: 'All products are sealed in airtight packaging, then bubble-wrapped and boxed to survive the journey safely. If your order arrives damaged, WhatsApp us within 24 hours with a photo and we will resolve it right away.',
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
        q: 'Do you offer corporate and bulk gifting?',
        a: 'Yes. We handle corporate gifting for Diwali, Navratri, and all major occasions — from 10-piece sets to 500+ unit orders. Every hamper is made fresh, with the option for a custom card or personalised message.',
      },
      {
        q: 'What hamper options are available for corporate gifting?',
        a: 'Our two signature hampers are Trio of Traditions (₹999 — Dryfruit & Seeds, Chatpati Mango, Tender Coconut Vanilla Chips) and The Gourmet Discovery (₹1,499 — Dryfruit & Seeds, Homemade Healthy Granola, Almond Motichoor Ladoo). For fully custom corporate hampers with your preferred products and packaging, contact us on WhatsApp.',
      },
      {
        q: 'What is the minimum order for bulk pricing?',
        a: 'For hampers, bulk pricing starts from 50 units. For wholesale loose products, the minimum is 15 kg. WhatsApp us with your requirement and we will send a quote within 24 hours.',
      },
      {
        q: 'Can you add a personalised message or company branding?',
        a: 'Yes. All orders can include a handwritten note card. Corporate orders can include a printed card with your logo and message. Custom box branding is available for orders of 50+ units — contact us to discuss.',
      },
      {
        q: 'How early should I place a large corporate order?',
        a: 'Up to 50 hampers — 5 to 7 days. 50 to 200 hampers — 10 to 14 days. Above 200 hampers — at least 3 to 4 weeks. For Diwali season, we recommend reaching out as early as possible.',
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
            We typically respond on WhatsApp within minutes and answer every message personally.
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
