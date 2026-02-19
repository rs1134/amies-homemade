import React, { useState, useMemo, useRef } from 'react';
import { Truck, Wallet, ChevronRight, X, Copy, Check, QrCode, Smartphone, AlertCircle, Loader2, MessageCircle, CheckCircle2, MapPin, Calendar, Building2, Minus, Plus, Trash2, Scale } from 'lucide-react';
import { CartItem } from '../types';
import { STORE_UPI_ID, MERCHANT_NAME, WHATSAPP_NUMBER } from '../constants';

interface CheckoutViewProps {
  items: CartItem[];
  onComplete: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  total: number; // Subtotal
}

type FieldName = 'name' | 'phone' | 'email' | 'city' | 'address';

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onComplete, onUpdateQuantity, onRemove, total }) => {
  const [method] = useState<'upi'>('upi');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const formRef = useRef<HTMLDivElement>(null);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        // Min 3 chars, letters and spaces only
        if (!value.trim() || value.trim().length < 3 || !/^[a-zA-Z\s]+$/.test(value)) {
          return "Please enter a valid full name";
        }
        return "";
      case 'phone':
        // Exactly 10 digits, start with 6-9
        if (!/^[6-9]\d{9}$/.test(value.trim())) {
          return "Please enter a valid 10-digit Indian mobile number";
        }
        return "";
      case 'city':
        // Min 3 chars, letters and spaces only
        if (value.trim().length < 3 || !/^[a-zA-Z\s]+$/.test(value)) {
          return "Please enter a valid city name";
        }
        return "";
      case 'email':
        // Optional, but must be valid if filled
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        return "";
      case 'address':
        // Required
        if (!value.trim()) return "Full address is required";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Once user starts correcting a field, clear that field's error in real time
    if (touched[name as FieldName]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  // Calculate total weight in grams based on CURRENT item quantities
  const totalWeight = useMemo(() => {
    return items.reduce((sum, item) => {
      let weightInGrams = 250; // Default fallback
      const weightStr = (item.selectedWeight || item.weight).toUpperCase();

      if (weightStr.includes('KG')) {
        weightInGrams = parseFloat(weightStr) * 1000;
      } else if (weightStr.includes('G')) {
        weightInGrams = parseFloat(weightStr);
      } else if (weightStr.includes('LARGE HAMPER')) {
        weightInGrams = 2500;
      } else if (weightStr.includes('MEDIUM BOX')) {
        weightInGrams = 1200;
      } else if (weightStr.includes('GIFT BOX')) {
        weightInGrams = 800;
      }
      
      return sum + (weightInGrams * item.quantity);
    }, 0);
  }, [items]);

  // Dynamic Shipping Fee Logic
  const shippingFee = useMemo(() => {
    // We only calculate shipping fee if the city is valid
    if (!formData.city || validateField('city', formData.city)) return null;
    
    if (formData.city.trim().toLowerCase() === 'ahmedabad') return 0;

    if (totalWeight <= 500) return 60;
    if (totalWeight <= 1000) return 100;
    if (totalWeight <= 2000) return 150;
    if (totalWeight <= 5000) return 200;
    return 250;
  }, [formData.city, totalWeight]);

  const grandTotal = total + (shippingFee || 0);

  const upiLink = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order from Amie\'s Homemade')}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiLink)}&bgcolor=FFFFFF&color=F04E4E&margin=2`;

  const submitOrderSilently = async () => {
    setIsSubmitting(true);
    const orderId = `AM-${Math.floor(Math.random() * 90000 + 10000)}`;
    
    const itemsSummary = items.map(i => {
      const basicInfo = `${i.quantity}x ${i.name} (${i.selectedWeight || i.weight})`;
      const choices = (i.ingredients && i.ingredients.length > 0) 
        ? `\n   └ Choices: ${i.ingredients.join(', ')}` 
        : '';
      return `${basicInfo}${choices}`;
    }).join('\n');
    
    const notificationMessage = `
🛍️ NEW ORDER: ${orderId}
---------------------------
👤 Customer: ${formData.name}
📞 Phone: ${formData.phone}
🏘️ City: ${formData.city}
📍 Address: ${formData.address}
📧 Email: ${formData.email || 'N/A'}

⚖️ Weight: ${totalWeight}g
📦 ITEMS:
${itemsSummary}

💰 SUB-TOTAL: ₹${total}
🚚 DELIVERY: ₹${shippingFee ?? 0}
💵 GRAND TOTAL: ₹${grandTotal}
💳 METHOD: ${method.toUpperCase()}
---------------------------
    `.trim();

    try {
      await fetch('https://ntfy.sh/amies-homemade-9157537842', {
        method: 'POST',
        body: notificationMessage,
        headers: {
          'Title': `New Order: ${formData.name} (Rs. ${grandTotal})`,
          'Priority': 'high',
          'Tags': 'shopping_cart,package,star'
        }
      });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Notification Error:", err);
      setIsSuccess(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceed = () => {
    const newErrors: Partial<Record<FieldName, string>> = {};
    const fieldNames: FieldName[] = ['name', 'phone', 'city', 'email', 'address'];
    
    let firstErrorField: FieldName | null = null;

    fieldNames.forEach(name => {
      const error = validateField(name, formData[name]);
      if (error) {
        newErrors[name] = error;
        if (!firstErrorField) firstErrorField = name;
      }
    });

    setFieldErrors(newErrors);
    // Mark all as touched on submit to show errors
    setTouched(fieldNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}));

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorField) {
        const element = document.getElementById(`field-${firstErrorField}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setShowPaymentModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(STORE_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-cream min-h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-[#4A3728]/5 animate-in zoom-in fade-in duration-500">
          <div className="bg-[#F04E4E] p-16 text-center text-white relative">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#F04E4E] mb-6 shadow-xl">
                <CheckCircle2 size={44} strokeWidth={2.5} />
              </div>
              <h2 className="text-5xl font-bold serif mb-3">Order Placed!</h2>
              <p className="text-white/80 brand-rounded font-bold uppercase text-[11px] tracking-[0.3em]">
                Transaction ID: #AM-{Math.floor(Math.random() * 90000 + 10000)}
              </p>
            </div>
          </div>
          <div className="p-10 sm:p-14 space-y-12">
            <div className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border border-[#4A3728]/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#F04E4E] shadow-sm border border-[#F04E4E]/10 flex-shrink-0">
                <MessageCircle size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-[#4A3728]">Ami Shah has received your order details.</p>
                <p className="text-[13px] font-bold text-[#F04E4E]">We'll confirm your order shortly via WhatsApp.</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black brand-rounded uppercase tracking-widest text-[#4A3728]/40 border-b border-[#4A3728]/5 pb-4">Order Summary</h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-cream flex-shrink-0 border border-[#4A3728]/5">
                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#4A3728]">{item.name}</p>
                        <p className="text-[10px] text-[#4A3728]/50 brand-rounded uppercase mt-0.5">{item.quantity} x {item.selectedWeight || item.weight}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#4A3728]">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-[#4A3728]/5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-bold text-[#4A3728]/50">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#4A3728]/50">
                  <span>Delivery Fee</span>
                  <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee ?? 0}`}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#4A3728]/5">
                  <span className="text-2xl font-bold serif text-[#4A3728]">Grand Total Paid</span>
                  <span className="text-3xl font-black text-[#F04E4E]">₹{grandTotal}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 bg-white rounded-[2rem] border border-[#4A3728]/5 flex items-start gap-4 shadow-sm">
                 <MapPin className="text-[#F04E4E] flex-shrink-0" size={20} />
                 <div>
                   <p className="text-[9px] font-black brand-rounded uppercase text-[#4A3728]/40 tracking-widest mb-1">Delivering To</p>
                   <p className="text-[12px] font-bold text-[#4A3728] leading-relaxed">{formData.city}, {formData.address}</p>
                 </div>
              </div>
              <div className="p-6 bg-white rounded-[2rem] border border-[#4A3728]/5 flex items-start gap-4 shadow-sm">
                 <Calendar className="text-[#F04E4E] flex-shrink-0" size={20} />
                 <div>
                   <p className="text-[9px] font-black brand-rounded uppercase text-[#4A3728]/40 tracking-widest mb-1">Estimated Arrival</p>
                   <p className="text-[12px] font-bold text-[#4A3728]">{formData.city.toLowerCase() === 'ahmedabad' ? '1 Working Day' : '3-5 Business Days'}</p>
                 </div>
              </div>
            </div>
            <button 
              onClick={() => onComplete()}
              className="w-full py-6 bg-[#4A3728] text-white rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.3em] text-[11px] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12" ref={formRef}>
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-[#F04E4E]/5">
            <h2 className="text-3xl font-bold serif mb-10 flex items-center gap-4 text-[#4A3728]">
              <Truck className="text-[#F04E4E]" size={32} /> Delivery Details
            </h2>
            <div className="space-y-6">
              {/* Full Name Field */}
              <div className="space-y-2" id="field-name">
                <label className="text-[10px] font-black uppercase brand-rounded text-[#4A3728]/40 ml-4 tracking-widest">Full Name</label>
                <input 
                  name="name" 
                  disabled={isSubmitting} 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  onBlur={handleBlur}
                  type="text" 
                  placeholder="e.g. Ami Shah" 
                  className={`w-full p-5 bg-white rounded-2xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/20 focus:ring-4 focus:ring-[#F04E4E]/10 outline-none brand-rounded text-sm transition-all ${touched.name && fieldErrors.name ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`} 
                />
                {touched.name && fieldErrors.name && (
                  <p className="text-red-500 text-[10px] font-bold ml-4 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number Field */}
                <div className="space-y-2" id="field-phone">
                  <label className="text-[10px] font-black uppercase brand-rounded text-[#4A3728]/40 ml-4 tracking-widest">Phone Number</label>
                  <input 
                    name="phone" 
                    disabled={isSubmitting} 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    onBlur={handleBlur}
                    type="text" 
                    placeholder="e.g. 91575 37842" 
                    className={`w-full p-5 bg-white rounded-2xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/20 focus:ring-4 focus:ring-[#F04E4E]/10 outline-none brand-rounded text-sm transition-all ${touched.phone && fieldErrors.phone ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`} 
                  />
                  {touched.phone && fieldErrors.phone && (
                    <p className="text-red-500 text-[10px] font-bold ml-4 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.phone}</p>
                  )}
                </div>
                {/* City Field */}
                <div className="space-y-2" id="field-city">
                  <label className="text-[10px] font-black uppercase brand-rounded text-[#4A3728]/40 ml-4 tracking-widest">City</label>
                  <div className="relative">
                    <input 
                      name="city" 
                      disabled={isSubmitting} 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      onBlur={handleBlur}
                      type="text" 
                      placeholder="Ahmedabad" 
                      className={`w-full p-5 pl-12 bg-white rounded-2xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/20 focus:ring-4 focus:ring-[#F04E4E]/10 outline-none brand-rounded text-sm transition-all ${touched.city && fieldErrors.city ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`} 
                    />
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3728]/20" size={18} />
                  </div>
                  {touched.city && fieldErrors.city && (
                    <p className="text-red-500 text-[10px] font-bold ml-4 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.city}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2" id="field-email">
                <label className="text-[10px] font-black uppercase brand-rounded text-[#4A3728]/40 ml-4 tracking-widest">Email Address (Optional)</label>
                <input 
                  name="email" 
                  disabled={isSubmitting} 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  onBlur={handleBlur}
                  type="email" 
                  placeholder="yourname@gmail.com" 
                  className={`w-full p-5 bg-white rounded-2xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/20 focus:ring-4 focus:ring-[#F04E4E]/10 outline-none brand-rounded text-sm transition-all ${touched.email && fieldErrors.email ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`} 
                />
                {touched.email && fieldErrors.email && (
                  <p className="text-red-500 text-[10px] font-bold ml-4 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Address Field */}
              <div className="space-y-2" id="field-address">
                <label className="text-[10px] font-black uppercase brand-rounded text-[#4A3728]/40 ml-4 tracking-widest">Full Address</label>
                <textarea 
                  name="address" 
                  disabled={isSubmitting} 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  onBlur={handleBlur}
                  placeholder="House/Flat No, Apartment, Landmark & Pin Code" 
                  rows={4} 
                  className={`w-full p-5 bg-white rounded-2xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/20 focus:ring-4 focus:ring-[#F04E4E]/10 outline-none brand-rounded text-sm transition-all resize-none ${touched.address && fieldErrors.address ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                ></textarea>
                {touched.address && fieldErrors.address && (
                  <p className="text-red-500 text-[10px] font-bold ml-4 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Section (Fixed to UPI) */}
          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-[#F04E4E]/5">
            <h2 className="text-2xl font-bold serif mb-8 flex items-center gap-4 text-[#4A3728]">
              <Wallet className="text-[#F04E4E]" size={28} /> Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <button disabled={isSubmitting} className="p-6 rounded-[2rem] border-2 border-[#F04E4E] bg-[#F04E4E]/5 transition-all flex flex-col items-center gap-3 shadow-sm">
                <Smartphone size={28} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase brand-rounded tracking-widest">UPI Scan</span>
              </button>
              
              <p className="text-[10px] text-center text-[#4A3728]/40 font-bold uppercase brand-rounded mt-4">
                Cards and COD are currently unavailable
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Summary Card */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-[#F04E4E]/5 h-fit sticky top-32">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold serif text-[#4A3728]">Order Summary</h2>
            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-[#4A3728]/10 shadow-sm">
              <Scale size={16} className="text-[#F04E4E]" />
              <span className="text-[11px] font-black uppercase brand-rounded tracking-[0.1em] text-[#F04E4E]">{totalWeight}G TOTAL</span>
            </div>
          </div>
          
          <div className="space-y-8 mb-10 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex justify-between items-center group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-cream shadow-sm flex-shrink-0 border border-[#4A3728]/5 relative">
                    <img src={item.image} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#4A3728] leading-tight">{item.name}</h4>
                    <p className="text-sm text-[#4A3728]/50 uppercase brand-rounded mt-1 font-bold tracking-wider">{item.selectedWeight || item.weight}</p>
                    
                    <div className="flex items-center gap-3 mt-2 border border-coral/10 bg-white rounded-xl w-fit p-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 hover:bg-coral/5 rounded-lg text-coral transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-lg font-black brand-rounded text-[#4A3728] min-w-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 hover:bg-coral/5 rounded-lg text-coral transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-[#4A3728] text-lg">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-8 border-t border-[#4A3728]/5 mb-10">
            <div className="flex justify-between text-sm">
              <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Subtotal</span>
              <span className="font-bold text-[#4A3728]">₹{total}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Delivery Fee</span>
              {shippingFee === 0 && formData.city.trim().toLowerCase() === 'ahmedabad' ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest brand-rounded">FREE</span>
              ) : shippingFee !== null ? (
                <span className="font-bold text-[#4A3728]">₹{shippingFee}</span>
              ) : (
                <span className="text-[9px] text-coral font-black brand-rounded uppercase tracking-widest">Calculated on City</span>
              )}
            </div>
            {(!formData.city || fieldErrors.city) && (
              <p className="text-[9px] text-[#4A3728]/40 italic brand-rounded bg-[#4A3728]/5 p-3 rounded-xl border border-[#4A3728]/5">
                {fieldErrors.city ? "Correct city name to calculate shipping" : "Enter your city to calculate exact weight-based shipping."}
              </p>
            )}
            <div className="flex justify-between pt-8">
              <span className="text-2xl font-bold serif text-[#4A3728]">Grand Total</span>
              <span className="text-4xl font-black text-[#F04E4E]">₹{grandTotal}</span>
            </div>
          </div>

          <button 
            disabled={isSubmitting} 
            onClick={handleProceed} 
            className={`w-full py-6 bg-[#F04E4E] text-white rounded-[2rem] font-bold brand-rounded uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl shadow-[#F04E4E]/30 flex items-center justify-center gap-4 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.03] active:scale-[0.97]'}`}
          >
            {isSubmitting ? <>Submitting... <Loader2 className="animate-spin" size={25} /></> : <>Complete My Order <ChevronRight size={25} /></>}
          </button>
        </div>
      </div>

      {/* UPI Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={() => !isSubmitting && setShowPaymentModal(false)} />
          <div className="relative bg-[#FFF8EE] w-full max-w-md rounded-[4rem] p-10 shadow-[0_0_120px_rgba(0,0,0,0.6)] animate-in zoom-in fade-in duration-300 border border-white/20">
            {!isSubmitting && (
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-10 right-10 p-4 hover:bg-[#F04E4E]/10 rounded-full text-[#F04E4E] transition-colors z-[210] shadow-sm bg-white"><X size={24} /></button>
            )}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/10"><QrCode size={40} /></div>
              <h2 className="text-4xl font-bold serif text-[#4A3728]">Scan & Pay</h2>
              <p className="text-[11px] brand-rounded text-[#4A3728]/40 font-black uppercase tracking-[0.3em] mt-3">Verified Merchant Transaction</p>
            </div>
            <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl mb-10 flex flex-col items-center border border-[#F04E4E]/5 relative overflow-hidden">
              <div className="p-5 bg-white rounded-3xl border-4 border-[#F04E4E]/5 mb-6 relative min-h-[220px] min-w-[220px] flex items-center justify-center">
                {!qrLoaded && <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl z-10"><Loader2 className="animate-spin text-[#F04E4E] mb-3" size={40} /></div>}
                <img src={qrImageUrl} alt="UPI QR Code" className={`w-52 h-52 transition-opacity duration-500 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setQrLoaded(true)} />
              </div>
              <p className="text-4xl font-black text-[#F04E4E] mb-2 tracking-tight">₹{grandTotal.toFixed(2)}</p>
            </div>
            <div className="space-y-6 mb-10">
              <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-[#4A3728]/5 shadow-sm">
                <div className="overflow-hidden"><p className="text-[9px] brand-rounded text-[#4A3728]/30 font-bold uppercase tracking-widest mb-1">Store UPI ID</p><p className="text-sm font-bold text-[#4A3728] truncate">{STORE_UPI_ID}</p></div>
                <button onClick={copyToClipboard} className={`p-4 rounded-2xl transition-all flex items-center gap-3 text-[11px] font-black uppercase brand-rounded flex-shrink-0 ${copied ? 'bg-green-500 text-white' : 'bg-[#F04E4E]/5 text-[#F04E4E] hover:bg-[#F04E4E] hover:text-white'}`}>{copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}{copied ? 'Done' : 'Copy'}</button>
              </div>
            </div>
            <button disabled={isSubmitting} onClick={() => { setShowPaymentModal(false); submitOrderSilently(); }} className={`w-full py-7 bg-[#F04E4E] text-white rounded-[2.5rem] font-bold brand-rounded uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl shadow-[#F04E4E]/30 flex items-center justify-center gap-4 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.03] active:scale-[0.97]'}`}>
              {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Verifying...</> : <>Confirm I have Paid <CheckCircle2 size={20} /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutView;