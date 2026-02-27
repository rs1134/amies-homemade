import React, { useState, useMemo, useRef } from 'react';
import { Truck, Wallet, ChevronRight, X, Copy, Check, QrCode, Smartphone, AlertCircle, Loader2, MessageCircle, CheckCircle, MapPin, Calendar, Building2, Minus, Plus, Trash2, Scale } from 'lucide-react';
import { CartItem } from '../types.ts';
import { STORE_UPI_ID, MERCHANT_NAME, WHATSAPP_NUMBER } from '../constants.ts';

interface CheckoutViewProps {
  items: CartItem[];
  onComplete: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  total: number; // Subtotal
}

type FieldName = 'name' | 'phone' | 'email' | 'city' | 'address';

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onComplete, onUpdateQuantity, onRemove, total }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');

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
        // Allow optional +91 or 91 prefix, and spaces/hyphens
        const sanitized = value.trim().replace(/[\s-]/g, '');
        if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(sanitized)) {
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

  const submitOrderSilently = async (razorpayPaymentId: string) => {
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
💳 METHOD: RAZORPAY
🆔 PAYMENT ID: ${razorpayPaymentId}
---------------------------
    `.trim();

    const whatsappMessage = encodeURIComponent(`
*New Order from Amie's Homemade*
---------------------------
*Order ID:* ${orderId}
*Payment ID:* ${razorpayPaymentId}
*Customer:* ${formData.name}
*Phone:* ${formData.phone}
*City:* ${formData.city}
*Address:* ${formData.address}

*Items:*
${itemsSummary}

*Total Amount:* ₹${grandTotal}
*Payment:* ONLINE (RAZORPAY)
---------------------------
_Please confirm my order and share delivery details._
    `.trim());

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${whatsappMessage}`;

    const sendNtfy = async (body: string) => {
      const res = await fetch('https://ntfy.sh/amies-homemade-9157537842', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Title': `New Order: ${formData.name} (Rs. ${grandTotal})`,
          'Priority': 'high',
          'Tags': 'shopping_cart,package,star'
        }
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown error');
        throw new Error(`ntfy returned ${res.status}: ${errText}`);
      }
      return res;
    };

    try {
      try {
        await sendNtfy(notificationMessage);
        console.log('[ntfy] Notification sent successfully');
      } catch (ntfyErr) {
        console.warn('[ntfy] First attempt failed, retrying with plain text:', ntfyErr);
        // Retry with emoji-free fallback message
        const fallback = [
          `NEW ORDER: ${orderId}`,
          `Customer: ${formData.name}`,
          `Phone: ${formData.phone}`,
          `City: ${formData.city}`,
          `Address: ${formData.address}`,
          ``,
          itemsSummary,
          ``,
          `Subtotal: Rs.${total} | Delivery: Rs.${shippingFee ?? 0} | TOTAL: Rs.${grandTotal}`,
          `Payment ID: ${razorpayPaymentId}`
        ].join('\n');
        await sendNtfy(fallback);
        console.log('[ntfy] Retry succeeded');
      }

      (window as any).lastOrderWhatsappUrl = whatsappUrl;
      setPaymentId(razorpayPaymentId);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('[ntfy] All notification attempts failed:', err);
      // Still mark order as complete so customer is not blocked
      (window as any).lastOrderWhatsappUrl = whatsappUrl;
      setPaymentId(razorpayPaymentId);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceed = async () => {
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
    setTouched(fieldNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}));

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorField) {
        const element = document.getElementById(`field-${firstErrorField}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'INR',
          receipt: `order_rcptid_${Date.now()}`
        })
      });

      if (!response.ok) throw new Error('Failed to create Razorpay order');
      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SJFLrXT62pYAGB',
        amount: order.amount,
        currency: order.currency,
        name: "Amie's Homemade",
        description: "Order Payment",
        image: "https://i.postimg.cc/8Cy68DD6/Whats-App-Image-2026-02-12-at-18-57-42-(1).jpg",
        order_id: order.id,
        handler: function (response: any) {
          submitOrderSilently(response.razorpay_payment_id);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: formData.address
        },
        theme: {
          color: "#F04E4E"
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong with the payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-cream min-h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-[#4A3728]/5 animate-in zoom-in fade-in duration-500">
          <div className="bg-[#F04E4E] p-16 text-center text-white relative">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#F04E4E] mb-6 shadow-xl">
                <CheckCircle size={44} strokeWidth={2.5} />
              </div>
              <h2 className="text-5xl font-bold serif mb-3">Order Placed!</h2>
              <p className="text-white/80 brand-rounded font-bold uppercase text-[11px] tracking-[0.3em]">
                Payment ID: {paymentId}
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
            <div className="flex flex-col gap-4">
              <a 
                href={(window as any).lastOrderWhatsappUrl || `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-6 bg-[#25D366] text-white rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.3em] text-[11px] hover:shadow-2xl hover:shadow-[#25D366]/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <MessageCircle size={20} /> Confirm on WhatsApp
              </a>
              <button 
                onClick={() => onComplete()}
                className="w-full py-6 bg-[#4A3728] text-white rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.3em] text-[11px] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
              >
                Continue Shopping
              </button>
            </div>
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

          {/* Payment Method Section */}
          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-[#F04E4E]/5">
            <h2 className="text-2xl font-bold serif mb-8 flex items-center gap-4 text-[#4A3728]">
              <Wallet className="text-[#F04E4E]" size={28} /> Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 rounded-[2rem] border-2 border-[#F04E4E] bg-[#F04E4E]/5 flex flex-col items-center gap-3 shadow-sm">
                <Smartphone size={28} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase brand-rounded tracking-widest text-center">Secure Online Payment (UPI, Cards, Netbanking)</span>
              </div>
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
    </div>
  );
};

export default CheckoutView;