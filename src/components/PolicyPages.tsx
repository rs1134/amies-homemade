import React from 'react';
import { ShieldCheck, CheckCircle, Mail, XCircle, FileText } from 'lucide-react';
import { WHATSAPP_NUMBER, FSSAI_LICENSE } from '../constants.ts';

interface PolicyPageProps {
  onNavigate?: (page: string) => void;
  onShopClick?: () => void;
}

// Shared shell — real, crawlable pages (not JS modals) so third-party
// compliance checks (e.g. Razorpay's page verification) can actually read
// the content, instead of a client-side-only hash route they never see.
const PolicyShell: React.FC<{ title: string; icon: React.ReactNode; updated: string; children: React.ReactNode }> = ({ title, icon, updated, children }) => (
  <div className="pt-24 pb-20 sm:pt-32 sm:pb-28 px-4 min-h-screen" style={{ background: '#FFF8EE' }}>
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-coral shadow-sm mx-auto mb-5 border border-coral/10">
          {icon}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold serif text-[#4A3728] mb-3">{title}</h1>
        <p className="text-xs text-[#4A3728]/40 brand-rounded font-bold uppercase tracking-widest">Last updated: {updated}</p>
      </div>
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 border border-coral/10 shadow-sm space-y-8 text-[#4A3728]/80 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg sm:text-xl font-bold serif text-[#4A3728] mb-3">{children}</h2>
);

/* ─── Terms and Conditions ──────────────────────────────────────────────── */
export const TermsPage: React.FC<PolicyPageProps> = () => (
  <PolicyShell title="Terms & Conditions" icon={<FileText size={24} />} updated="21 August 2026">
    <div>
      <H2>1. About Us</H2>
      <p>Amie's Homemade ("we", "us", "our") is a home-based food business operating from Ahmedabad, Gujarat, India, selling handcrafted mukhwas, wellness snacks, granola, and gift hampers through amieshomemade.com. FSSAI Licence No. {FSSAI_LICENSE}.</p>
    </div>
    <div>
      <H2>2. Using Our Website</H2>
      <p>By placing an order or otherwise using this website, you agree to these Terms & Conditions. We may update this page from time to time; continued use of the site after changes means you accept the updated terms.</p>
    </div>
    <div>
      <H2>3. Products & Pricing</H2>
      <p>All products are handcrafted in small batches and quantities may vary slightly. We reserve the right to change prices, weights, or discontinue any product listed on the site at any time, without prior notice. Prices shown are inclusive of applicable taxes unless stated otherwise.</p>
    </div>
    <div>
      <H2>4. Orders & Payment</H2>
      <p>An order is confirmed once payment is successfully processed via our payment partner Razorpay (UPI, cards, netbanking, and wallets), or, for eligible Ahmedabad addresses, via Cash on Delivery. We do not store your card or banking details on our servers, this is handled entirely by Razorpay under its own security standards.</p>
    </div>
    <div>
      <H2>5. Delivery</H2>
      <p>Delivery timelines, areas served, and shipping charges are described on our <a href="/delivery" className="text-coral font-bold hover:underline">Delivery in Ahmedabad</a> and <a href="/cities" className="text-coral font-bold hover:underline">Cities We Deliver To</a> pages. Delivery estimates are indicative and may vary due to courier delays outside our control.</p>
    </div>
    <div>
      <H2>6. Cancellations & Refunds</H2>
      <p>See our separate <a href="/cancellation-policy" className="text-coral font-bold hover:underline">Cancellation Policy</a> and <a href="/refund-policy" className="text-coral font-bold hover:underline">Refund Policy</a> for full details.</p>
    </div>
    <div>
      <H2>7. Intellectual Property</H2>
      <p>All content on this website, including recipes, photography, logos, and text, is the property of Amie's Homemade and may not be reproduced without our written permission.</p>
    </div>
    <div>
      <H2>8. Limitation of Liability</H2>
      <p>Amie's Homemade is not liable for delays or failures caused by circumstances beyond our reasonable control, including courier delays, payment gateway downtime, or incorrect delivery information provided by the customer.</p>
    </div>
    <div>
      <H2>9. Governing Law</H2>
      <p>These terms are governed by the laws of India, and any disputes are subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.</p>
    </div>
    <div>
      <H2>10. Contact Us</H2>
      <p>For any questions about these terms, reach us at <a href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`} className="text-coral font-bold hover:underline">WhatsApp {WHATSAPP_NUMBER}</a> or <a href="mailto:hello@amieshomemade.com" className="text-coral font-bold hover:underline">hello@amieshomemade.com</a>.</p>
    </div>
  </PolicyShell>
);

/* ─── Privacy Policy ────────────────────────────────────────────────────── */
export const PrivacyPolicyPage: React.FC<PolicyPageProps> = () => (
  <PolicyShell title="Privacy Policy" icon={<ShieldCheck size={24} />} updated="21 August 2026">
    <div>
      <H2>Information We Collect</H2>
      <p>When you place an order, we collect your name, phone number, delivery address, and (optionally) email address, solely to process, deliver, and communicate with you about your order.</p>
    </div>
    <div>
      <H2>How We Use It</H2>
      <ul className="space-y-3 list-none p-0">
        <li className="flex gap-3 items-start"><CheckCircle className="text-coral shrink-0 mt-0.5" size={18} /><span>To confirm your order and send delivery updates via WhatsApp, SMS, or email.</span></li>
        <li className="flex gap-3 items-start"><CheckCircle className="text-coral shrink-0 mt-0.5" size={18} /><span>To process payment securely through our payment partner, Razorpay, which handles your card/bank details directly, we never see or store them.</span></li>
        <li className="flex gap-3 items-start"><CheckCircle className="text-coral shrink-0 mt-0.5" size={18} /><span>To hand your address and phone number to our delivery partners solely for fulfilling your delivery.</span></li>
      </ul>
    </div>
    <div>
      <H2>Analytics & Advertising</H2>
      <p>We use Google Analytics and the Meta (Facebook/Instagram) Pixel to understand site traffic and measure the performance of our ads. These tools may receive limited, often hashed, information such as your device type or a hashed version of your email or phone number. We do not sell your personal data to anyone.</p>
    </div>
    <div>
      <H2>Your Rights</H2>
      <p>You can ask us to review, correct, or delete the personal data we hold about you at any time by writing to us.</p>
    </div>
    <div>
      <H2>Contact Us</H2>
      <p className="flex items-center gap-2"><Mail size={16} className="text-coral" /> For any data or privacy concerns, contact <a href="mailto:hello@amieshomemade.com" className="text-coral font-bold hover:underline ml-1">hello@amieshomemade.com</a></p>
    </div>
  </PolicyShell>
);

/* ─── Refund Policy ─────────────────────────────────────────────────────── */
export const RefundPolicyPage: React.FC<PolicyPageProps> = () => (
  <PolicyShell title="Refund Policy" icon={<CheckCircle size={24} />} updated="21 August 2026">
    <div>
      <H2>When We Offer a Refund</H2>
      <p>Since all our products are freshly prepared, perishable food items, we do not accept returns or refunds for change of mind, incorrect selection, or personal taste preference. We <span className="font-bold text-[#4A3728]">do</span> offer a refund or replacement (at our discretion) if your order arrives:</p>
      <ul className="space-y-2 mt-3">
        <li>Damaged in transit</li>
        <li>Incorrect (wrong item or quantity from what you ordered)</li>
        <li>Spoiled or with a manufacturing defect</li>
      </ul>
    </div>
    <div>
      <H2>How to Request One</H2>
      <p>Message us on <a href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`} className="text-coral font-bold hover:underline">WhatsApp at {WHATSAPP_NUMBER}</a> within <span className="font-bold text-[#4A3728]">24 hours of delivery</span>, with your Order ID and clear photos of the issue. We will review and respond within 1 business day.</p>
    </div>
    <div>
      <H2>Refund Timeline</H2>
      <p>Once a refund is approved, it is processed back to your original payment method via Razorpay within 5-7 business days. For Cash on Delivery orders, we will coordinate the refund directly with you.</p>
    </div>
  </PolicyShell>
);

/* ─── Cancellation Policy ───────────────────────────────────────────────── */
export const CancellationPolicyPage: React.FC<PolicyPageProps> = () => (
  <PolicyShell title="Cancellation Policy" icon={<XCircle size={24} />} updated="21 August 2026">
    <div>
      <H2>Before Dispatch</H2>
      <p>You can cancel your order for a full refund any time before it has been prepared and dispatched. Message us on <a href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`} className="text-coral font-bold hover:underline">WhatsApp at {WHATSAPP_NUMBER}</a> with your Order ID as soon as possible, since orders are typically dispatched within 1-2 business days of confirmation.</p>
    </div>
    <div>
      <H2>After Dispatch</H2>
      <p>Once your order has been dispatched, it cannot be cancelled, our products are freshly prepared in small batches specifically for your order and cannot be re-stocked. If there's a genuine issue with what arrives, see our <a href="/refund-policy" className="text-coral font-bold hover:underline">Refund Policy</a> instead.</p>
    </div>
    <div>
      <H2>Cash on Delivery Orders</H2>
      <p>If a Cash on Delivery order is refused at the doorstep without a valid reason (damaged/incorrect item), we reserve the right to decline future Cash on Delivery orders from that account.</p>
    </div>
  </PolicyShell>
);
