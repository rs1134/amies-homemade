import React, { useState } from 'react';
import { Instagram, Facebook, Phone, MapPin, Mail, X, ShieldCheck, Truck, CheckCircle, Clock, Scale } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants.ts';
import Logo from './Logo.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const PolicyModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, icon }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#2A1E14]/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-[#FFF8EE] w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in fade-in duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 sm:p-10 border-b border-[#F04E4E]/10 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-coral/5 rounded-2xl flex items-center justify-center text-coral shadow-sm">
              {icon}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728]">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F04E4E]/5 rounded-full text-coral transition-colors">
            <X size={28} />
          </button>
        </div>
        <div className="p-8 sm:p-12 overflow-y-auto no-scrollbar">
          <div className="prose prose-sm text-[#4A3728]/80 leading-relaxed font-medium">
            {children}
          </div>
        </div>
        <div className="p-8 bg-white border-t border-[#F04E4E]/10 text-center shrink-0">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-coral text-white rounded-full font-bold tracking-widest uppercase text-[10px] hover:scale-105 transition-all shadow-xl shadow-coral/20"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'shipping' | null>(null);

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#2A1E14] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-40">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-8 cursor-pointer inline-block" onClick={() => handleNav('home')}>
              <Logo manualHeight="h-16" />
            </div>
            <div className="space-y-4 mb-8">
              <p className="text-white/60 text-lg leading-relaxed max-w-md font-light">
                We bring you the authentic taste of Indian heritage, crafted with traditional recipes and premium ingredients to make every bite memorable.
              </p>
              <p className="text-white/40 text-sm leading-relaxed max-w-md font-light">
                What started as treats for family and neighbors has grown into something special but the recipe hasn't changed. Every batch is still made by hand, the old way, because some flavors are worth preserving.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/amies_homemadefoods/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full hover:bg-[#F14E4E] transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://www.facebook.com/ami.shah.7161953/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full hover:bg-[#F14E4E] transition-colors"
                >
                  <Facebook size={20} />
                </a>
              </div>
              <div className="select-none pointer-events-none">
                <span className="brand-script text-[#F14E4E] text-3xl opacity-80 block">Homemade with Love</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-[#F14E4E]">Quick Links</h4>
            <ul className="space-y-4 text-white/60 text-lg font-medium">
              <li><button onClick={() => handleNav('shop')} className="hover:text-white transition-colors text-left">Shop Collection</button></li>
              <li><button onClick={() => handleNav('shop')} className="hover:text-white transition-colors text-left">Best Sellers</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-white transition-colors text-left">Our Story</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-white transition-colors text-left">Wholesale Inquiry</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-[#F14E4E]">Get in Touch</h4>
            <ul className="space-y-6 text-white/60 text-lg font-medium">
              <li className="flex gap-4">
                <Phone size={18} className="text-[#F14E4E] flex-shrink-0" />
                <a href={`tel:${WHATSAPP_NUMBER}`} className="hover:text-white transition-colors">{WHATSAPP_NUMBER}</a>
              </li>
              <li className="flex gap-4">
                <MapPin size={18} className="text-[#F14E4E] flex-shrink-0" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
              <li className="flex gap-4">
                <Mail size={18} className="text-[#F14E4E] flex-shrink-0" />
                <a href="mailto:hello@amieshomemade.com" className="hover:text-white transition-colors">hello@amieshomemade.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs uppercase tracking-widest text-white/40 font-semibold text-center md:text-left">
          <p>© 2026 Amie's Homemade. All rights reserved.</p>
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setActiveModal('shipping')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Shipping Terms
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Terms Modal */}
      <PolicyModal 
        isOpen={activeModal === 'shipping'} 
        onClose={() => setActiveModal(null)} 
        title="Shipping & Delivery"
        icon={<Truck size={24} />}
      >
        <div className="space-y-8">
          <div className="flex items-start gap-4 p-6 bg-green-50 rounded-3xl border border-green-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm flex-shrink-0">
               <MapPin size={20} />
            </div>
            <div>
              <h4 className="font-bold text-green-800 text-sm brand-rounded uppercase tracking-widest mb-1">Ahmedabad Delivery</h4>
              <p className="text-green-700/80 text-xs">Enjoy <span className="font-bold">FREE Home Delivery</span> within Ahmedabad city limits. Typical arrival: 1 working day.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Scale size={18} className="text-coral" />
              <h4 className="text-[10px] brand-rounded font-black uppercase tracking-widest text-[#4A3728]/40">National Tiered Rates (Outside Ahmedabad)</h4>
            </div>
            
            <div className="bg-white rounded-3xl border border-coral/5 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF8EE] text-[#4A3728]/40 uppercase tracking-widest font-black text-[9px] border-b border-coral/5">
                  <tr>
                    <th className="p-4">Weight Slot</th>
                    <th className="p-4 text-right">Courier Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coral/5 font-bold text-[#4A3728]">
                  <tr><td className="p-4">Up to 500g</td><td className="p-4 text-right">₹60</td></tr>
                  <tr><td className="p-4">500g to 1000g</td><td className="p-4 text-right">₹100</td></tr>
                  <tr><td className="p-4">1000g to 2000g</td><td className="p-4 text-right">₹150</td></tr>
                  <tr><td className="p-4">2000g to 5000g</td><td className="p-4 text-right">₹200</td></tr>
                  <tr className="bg-coral/5"><td className="p-4">Above 5000g</td><td className="p-4 text-right text-coral">₹250</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-4 list-none p-0 text-xs text-[#4A3728]/70">
            <li className="flex gap-3">
              <Clock className="text-coral shrink-0 mt-0.5" size={16} />
              <span>Orders outside Ahmedabad typically take <span className="font-bold">3-5 business days</span> to arrive.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="text-coral shrink-0 mt-0.5" size={16} />
              <span>Orders are freshly prepared and dispatched within <span className="font-bold">1-2 business days</span> of confirmation.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="text-coral shrink-0 mt-0.5" size={16} />
              <span>For online orders, only <span className="font-bold">UPI payment</span> is accepted — no Cash on Delivery.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="text-coral shrink-0 mt-0.5" size={16} />
              <span>If you receive a damaged order, contact us within <span className="font-bold">24 hours</span> on WhatsApp with a photo for resolution.</span>
            </li>
          </ul>
        </div>
      </PolicyModal>

      {/* Privacy Policy Modal */}
      <PolicyModal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="Privacy Policy"
        icon={<ShieldCheck size={24} />}
      >
        <div className="space-y-8">
          <div className="p-8 bg-coral/5 rounded-[2.5rem] border border-coral/10">
            <h4 className="text-[10px] brand-rounded font-black uppercase tracking-widest text-coral mb-4">Information We Collect</h4>
            <p className="text-base text-[#4A3728] font-bold leading-relaxed">
              We collect only your name, phone, address and email for the sole purpose of order fulfillment.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-[10px] brand-rounded font-black uppercase tracking-widest text-[#4A3728]/40 px-4">Our Commitment</h4>
            <ul className="space-y-4">
              <li className="flex gap-4 items-center p-4 bg-white rounded-2xl border border-coral/5">
                <ShieldCheck className="text-green-600" size={20} />
                <span>We do not share your data with any third parties.</span>
              </li>
              <li className="flex gap-4 items-center p-4 bg-white rounded-2xl border border-coral/5">
                <CheckCircle className="text-coral" size={20} />
                <span>Your WhatsApp number may be used to confirm your order and send delivery updates only.</span>
              </li>
              <li className="flex gap-4 items-center p-4 bg-white rounded-2xl border border-coral/5">
                <Mail className="text-[#C9A84C]" size={20} />
                <span>For any data concerns, contact <span className="font-bold">hello@amieshomemade.com</span></span>
              </li>
            </ul>
          </div>
        </div>
      </PolicyModal>
    </footer>
  );
};

export default Footer;