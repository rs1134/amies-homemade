import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Truck, Wallet, ChevronRight, Smartphone, Loader2, MessageCircle, CheckCircle, MapPin, Calendar, Building2, Minus, Plus, Trash2, Scale, Search } from 'lucide-react';
import { CartItem } from '../types.ts';
import { WHATSAPP_NUMBER } from '../constants.ts';

const COUPON_STORAGE_KEY = 'thanks10_used_phones';

interface CheckoutViewProps {
  items: CartItem[];
  onComplete: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  total: number;
  couponDiscount?: number;
}

type FieldName = 'name' | 'phone' | 'email' | 'city' | 'address' | 'flat';

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onComplete, onUpdateQuantity, onRemove, total, couponDiscount = 0 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    flat: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const formRef = useRef<HTMLDivElement>(null);
  const addressSearchRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Load Google Places Autocomplete
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return;

    const initAutocomplete = () => {
      if (!addressSearchRef.current || !(window as any).google) return;
      // Strong bias towards Ahmedabad (tighter circle around city center)
      const ahmedabadBounds = new (window as any).google.maps.LatLngBounds(
        new (window as any).google.maps.LatLng(22.95, 72.50),
        new (window as any).google.maps.LatLng(23.10, 72.65)
      );
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        addressSearchRef.current,
        {
          componentRestrictions: { country: 'in' },
          fields: ['address_components', 'formatted_address', 'name'],
          // No `types` restriction → finds apartments, societies, landmarks AND street addresses
          bounds: ahmedabadBounds,
          strictBounds: false,
        }
      );
      autocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;
        let streetNumber = '', route = '', sublocality = '', city = '';
        place.address_components.forEach((c: any) => {
          if (c.types.includes('street_number'))       streetNumber = c.long_name;
          if (c.types.includes('route'))               route = c.long_name;
          if (c.types.includes('sublocality_level_1')) sublocality = c.long_name;
          if (c.types.includes('locality'))            city = c.long_name;
        });
        // Build address: prefer apartment/establishment name + sublocality if present
        const namePart = place.name && !route.includes(place.name) ? place.name : '';
        const addressParts = [namePart, streetNumber, route, sublocality].filter(Boolean);
        const address = addressParts.length > 0 ? addressParts.join(', ') : (place.formatted_address || '');
        setFormData(prev => ({ ...prev, address, city: city || prev.city }));
        setTouched(prev => ({ ...prev, address: true, city: true }));
        setFieldErrors(prev => ({ ...prev, address: '', city: '' }));
      });
    };

    if ((window as any).google) {
      initAutocomplete();
    } else {
      const existing = document.getElementById('google-maps-script');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      } else {
        existing.addEventListener('load', initAutocomplete);
      }
    }
  }, []);

  const isAhmedabad = formData.city.trim().toLowerCase() === 'ahmedabad';

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim() || value.trim().length < 3 || !/^[a-zA-Z\s]+$/.test(value))
          return "Please enter a valid full name";
        return "";
      case 'phone': {
        const sanitized = value.trim().replace(/[\s-]/g, '');
        if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(sanitized))
          return "Please enter a valid 10-digit Indian mobile number";
        return "";
      }
      case 'city':
        if (value.trim().length < 3 || !/^[a-zA-Z\s]+$/.test(value))
          return "Please enter a valid city name";
        return "";
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return "";
      case 'address':
        if (!value.trim()) return "Full address is required";
        return "";
      case 'flat':
        if (!value.trim()) return "Flat / House number is required";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name as FieldName]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Calculate total weight in grams
  const totalWeight = useMemo(() => {
    return items.reduce((sum, item) => {
      let weightInGrams = 250;
      const weightStr = (item.selectedWeight || item.weight).toUpperCase();
      if (weightStr.includes('KG')) weightInGrams = parseFloat(weightStr) * 1000;
      else if (weightStr.includes('G')) weightInGrams = parseFloat(weightStr);
      else if (weightStr.includes('LARGE HAMPER')) weightInGrams = 2500;
      else if (weightStr.includes('MEDIUM BOX')) weightInGrams = 1200;
      else if (weightStr.includes('GIFT BOX')) weightInGrams = 800;
      return sum + (weightInGrams * item.quantity);
    }, 0);
  }, [items]);

  // Dynamic Shipping Fee
  const shippingFee = useMemo(() => {
    if (!formData.city || validateField('city', formData.city)) return null;
    if (formData.city.trim().toLowerCase() === 'ahmedabad') return 0;
    if (totalWeight <= 500) return 60;
    if (totalWeight <= 1000) return 100;
    if (totalWeight <= 2000) return 150;
    if (totalWeight <= 5000) return 200;
    return 250;
  }, [formData.city, totalWeight]);

  const grandTotal = total - couponDiscount + (shippingFee || 0);

  const submitOrderSilently = async (razorpayPaymentId: string) => {
    setIsSubmitting(true);
    const orderId = `AM-${Math.floor(Math.random() * 90000 + 10000)}`;

    const itemsSummary = items.map(i => {
      const basicInfo = `${i.quantity}x ${i.name} (${i.selectedWeight || i.weight})`;
      const choices = (i.ingredients && i.ingredients.length > 0)
        ? `\n   - Choices: ${i.ingredients.join(', ')}` : '';
      return `${basicInfo}${choices}`;
    }).join('\n');

    const whatsappMessage = encodeURIComponent(`
*New Order from Amie's Homemade*
---------------------------
*Order ID:* ${orderId}
*Payment ID:* ${razorpayPaymentId}
*Customer:* ${formData.name}
*Phone:* ${formData.phone}
*City:* ${formData.city}
*Address:* ${fullDeliveryAddress}

*Items:*
${itemsSummary}

*Total Amount:* Rs.${grandTotal}${couponDiscount > 0 ? `\n*Coupon Applied:* Thanks10 (− Rs.${couponDiscount})` : ''}
*Payment:* ONLINE (RAZORPAY)
---------------------------
_Please confirm my order and share delivery details._
    `.trim());

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${whatsappMessage}`;

    try {
      const res = await fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId, name: formData.name, phone: formData.phone,
          city: formData.city, address: fullDeliveryAddress, email: formData.email,
          itemsSummary, totalWeight, subtotal: total,
          shippingFee: shippingFee ?? 0, grandTotal, paymentId: razorpayPaymentId,
        }),
      });
      if (!res.ok) console.error('[notify-order] Failed:', await res.json().catch(() => ({})));
    } catch (err) {
      console.error('[notify-order] Request failed:', err);
    }

    if (couponDiscount > 0) {
      const usedPhones: string[] = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || '[]');
      const cleanPhone = formData.phone.trim().replace(/[\s\-+]/g, '').replace(/^91/, '');
      if (!usedPhones.includes(cleanPhone)) {
        usedPhones.push(cleanPhone);
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(usedPhones));
      }
    }

    (window as any).lastOrderWhatsappUrl = whatsappUrl;
    setPaymentId(razorpayPaymentId);
    setIsSuccess(true);
    window.history.pushState(null, '', '/order-confirmed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSubmitting(false);
  };

  // Combine flat + address for final delivery address
  const fullDeliveryAddress = formData.flat
    ? `${formData.flat}, ${formData.address}`
    : formData.address;

  const handleProceed = async () => {
    const fieldNames: FieldName[] = ['name', 'phone', 'city', 'email', 'address', 'flat'];
    const newErrors: Partial<Record<FieldName, string>> = {};
    let firstErrorField: FieldName | null = null;

    fieldNames.forEach(name => {
      const error = validateField(name, formData[name as keyof typeof formData]);
      if (error) { newErrors[name] = error; if (!firstErrorField) firstErrorField = name; }
    });

    setFieldErrors(newErrors);
    setTouched(fieldNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}));

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorField) document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (couponDiscount > 0) {
      const usedPhones: string[] = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || '[]');
      const cleanPhone = formData.phone.trim().replace(/[\s\-+]/g, '').replace(/^91/, '');
      if (usedPhones.includes(cleanPhone)) {
        setFieldErrors(prev => ({ ...prev, phone: 'This phone number has already used the THANKS10 coupon.' }));
        setTouched(prev => ({ ...prev, phone: true }));
        document.getElementById('field-phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal, currency: 'INR', receipt: `order_rcptid_${Date.now()}` })
      });
      if (!response.ok) throw new Error('Failed to create Razorpay order');
      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SpwBjfCMwqyOcJ',
        amount: order.amount, currency: order.currency,
        name: "Amie's Homemade", description: "Order Payment",
        image: "https://i.postimg.cc/8Cy68DD6/Whats-App-Image-2026-02-12-at-18-57-42-(1).jpg",
        order_id: order.id,
        handler: async function (response: any) {
          // Verify signature server-side before confirming order
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              alert('Payment verification failed. If money was deducted, please contact us on WhatsApp with your Payment ID: ' + response.razorpay_payment_id);
              setIsSubmitting(false);
              return;
            }
          } catch (err) {
            console.error('Signature verification request failed:', err);
            // Continue anyway so the order isn't lost — admin can verify manually
          }

          submitOrderSilently(response.razorpay_payment_id);
          (window as any).fbq?.('track', 'Purchase', {
            value: grandTotal, currency: 'INR',
            content_ids: items.map(i => i.id), content_type: 'product',
            num_items: items.reduce((sum, i) => sum + i.quantity, 0),
          });
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        notes: {
          customer_name: formData.name, phone: formData.phone,
          city: formData.city, address: fullDeliveryAddress, email: formData.email || 'N/A',
          items: items.map(i => `${i.quantity}x ${i.name} (${i.selectedWeight || i.weight})`).join(', ').slice(0, 250),
          subtotal: `Rs.${total}`, shipping: `Rs.${shippingFee ?? 0}`,
          grand_total: `Rs.${grandTotal}`, total_weight: `${totalWeight}g`,
        },
        theme: { color: "#F04E4E" },
        modal: { ondismiss: function() { setIsSubmitting(false); } }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong with the payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
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
                <p className="text-[13px] font-bold text-[#4A3728]">We have received your order details.</p>
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
                  <span>Subtotal</span><span>₹{total}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-green-600">
                    <span>Coupon Discount (Thanks10)</span><span>− ₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-[#4A3728]/50">
                  <span>Delivery Fee</span><span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee ?? 0}`}</span>
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
                  <p className="text-[12px] font-bold text-[#4A3728] leading-relaxed">{formData.city}, {fullDeliveryAddress}</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-[2rem] border border-[#4A3728]/5 flex items-start gap-4 shadow-sm">
                <Calendar className="text-[#F04E4E] flex-shrink-0" size={20} />
                <div>
                  <p className="text-[9px] font-black brand-rounded uppercase text-[#4A3728]/40 tracking-widest mb-1">Estimated Arrival</p>
                  <p className="text-[12px] font-bold text-[#4A3728]">{isAhmedabad ? '2 Working Days' : '3-5 Working Days'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={(window as any).lastOrderWhatsappUrl || `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
                target="_blank" rel="noopener noreferrer"
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

  // ── Checkout Form ───────────────────────────────────────────────────────────
  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6" ref={formRef}>
        <div className="space-y-5">
          {/* Delivery Details */}
          <div className="bg-white p-5 sm:p-7 rounded-[2rem] shadow-xl border border-[#F04E4E]/5">
            <h2 className="text-xl sm:text-2xl font-bold serif mb-5 flex items-center gap-3 text-[#4A3728]">
              <Truck className="text-[#F04E4E]" size={24} /> Delivery Details
            </h2>
            <div className="space-y-4">

              {/* Address Search Autocomplete */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Search Your Address</label>
                <div className="relative">
                  <input
                    ref={addressSearchRef}
                    type="text"
                    placeholder="Start typing your address..."
                    disabled={isSubmitting}
                    className="w-full p-3.5 pl-11 bg-[#F9F5EE] rounded-xl border-2 border-[#4A3728]/10 text-[#4A3728] font-medium placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 focus:border-[#F04E4E] outline-none text-sm transition-all disabled:opacity-50"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F04E4E]/60" size={16} />
                </div>
                <p className="text-[9px] text-[#4A3728]/40 ml-3 brand-rounded font-bold">Select from suggestions to auto-fill city & address</p>
              </div>

              <div className="border-t border-[#4A3728]/5" />

              {/* Full Name */}
              <div className="space-y-1.5" id="field-name">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Full Name</label>
                <input
                  name="name" disabled={isSubmitting} value={formData.name}
                  onChange={handleInputChange} onBlur={handleBlur} type="text" placeholder="e.g. Ami Shah"
                  className={`w-full p-3.5 bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-sm transition-all ${touched.name && fieldErrors.name ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                />
                {touched.name && fieldErrors.name && (
                  <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div className="space-y-1.5" id="field-phone">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Phone Number</label>
                  <input
                    name="phone" disabled={isSubmitting} value={formData.phone}
                    onChange={handleInputChange} onBlur={handleBlur} type="text" placeholder="e.g. 91575 37842"
                    className={`w-full p-3.5 bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-sm transition-all ${touched.phone && fieldErrors.phone ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.phone}</p>
                  )}
                </div>
                {/* City */}
                <div className="space-y-1.5" id="field-city">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">City</label>
                  <div className="relative">
                    <input
                      name="city" disabled={isSubmitting} value={formData.city}
                      onChange={handleInputChange} onBlur={handleBlur} type="text" placeholder="Ahmedabad"
                      className={`w-full p-3.5 pl-11 bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-sm transition-all ${touched.city && fieldErrors.city ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                    />
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3728]/20" size={16} />
                  </div>
                  {touched.city && fieldErrors.city && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.city}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5" id="field-email">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Email Address (Optional)</label>
                <input
                  name="email" disabled={isSubmitting} value={formData.email}
                  onChange={handleInputChange} onBlur={handleBlur} type="email" placeholder="yourname@gmail.com"
                  className={`w-full p-3.5 bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-sm transition-all ${touched.email && fieldErrors.email ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                />
                {touched.email && fieldErrors.email && (
                  <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Flat / House No */}
              <div className="space-y-1.5" id="field-flat">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Flat / House / Office No. <span className="text-[#F04E4E]">*</span></label>
                <input
                  name="flat" disabled={isSubmitting} value={formData.flat}
                  onChange={handleInputChange} onBlur={handleBlur}
                  type="text" placeholder="e.g. A-102, Floor 3"
                  className={`w-full p-3.5 bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-sm transition-all ${touched.flat && fieldErrors.flat ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                />
                {touched.flat && fieldErrors.flat && (
                  <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.flat}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5" id="field-address">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Building / Society / Street Address</label>
                <textarea
                  name="address" disabled={isSubmitting} value={formData.address}
                  onChange={handleInputChange} onBlur={handleBlur}
                  placeholder="Building name, street, landmark, pincode" rows={2}
                  className={`w-full p-3.5 bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-sm transition-all resize-none ${touched.address && fieldErrors.address ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                />
                {touched.address && fieldErrors.address && (
                  <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-5 sm:p-7 rounded-[2rem] shadow-xl border border-[#F04E4E]/5">
            <h2 className="text-lg font-bold serif mb-4 flex items-center gap-3 text-[#4A3728]">
              <Wallet className="text-[#F04E4E]" size={22} /> Payment Method
            </h2>
            <div className="p-4 rounded-2xl border-2 border-[#F04E4E] bg-[#F04E4E]/5 flex items-center gap-3 shadow-sm">
              <Smartphone size={22} className="text-blue-500 flex-shrink-0" />
              <span className="text-[10px] font-black uppercase brand-rounded tracking-widest">Secure Online Payment (UPI, Cards, Netbanking)</span>
            </div>
          </div>
        </div>

        {/* Sticky Summary Card */}
        <div className="bg-white p-5 sm:p-7 rounded-[2rem] shadow-xl border border-[#F04E4E]/5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold serif text-[#4A3728]">Order Summary</h2>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#4A3728]/10 shadow-sm">
              <Scale size={14} className="text-[#F04E4E]" />
              <span className="text-[10px] font-black uppercase brand-rounded tracking-[0.1em] text-[#F04E4E]">{totalWeight}G TOTAL</span>
            </div>
          </div>

          <div className="space-y-4 mb-5 max-h-[280px] overflow-y-auto no-scrollbar pr-2">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream shadow-sm flex-shrink-0 border border-[#4A3728]/5 relative">
                    <img src={item.image} className="w-full h-full object-cover" />
                    <button onClick={() => onRemove(item.id)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#4A3728] leading-tight">{item.name}</h4>
                    <p className="text-[11px] text-[#4A3728]/50 uppercase brand-rounded mt-0.5 font-bold tracking-wider">{item.selectedWeight || item.weight}</p>
                    <div className="flex items-center gap-2 mt-1.5 border border-coral/10 bg-white rounded-lg w-fit p-0.5">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-coral/5 rounded text-coral transition-colors"><Minus size={11} /></button>
                      <span className="text-sm font-black brand-rounded text-[#4A3728] min-w-[18px] text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-coral/5 rounded text-coral transition-colors"><Plus size={11} /></button>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-[#4A3728] text-sm">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-[#4A3728]/5 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Subtotal</span>
              <span className="font-bold text-[#4A3728] text-sm">₹{total}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Coupon (Thanks10)</span>
                <span className="font-bold text-green-600 text-sm">− ₹{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm items-center">
              <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Delivery Fee</span>
              {shippingFee === 0 && isAhmedabad ? (
                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest brand-rounded">FREE</span>
              ) : shippingFee !== null ? (
                <span className="font-bold text-[#4A3728] text-sm">₹{shippingFee}</span>
              ) : (
                <span className="text-[9px] text-coral font-black brand-rounded uppercase tracking-widest">Calculated on City</span>
              )}
            </div>
            {(!formData.city || fieldErrors.city) && (
              <p className="text-[9px] text-[#4A3728]/40 italic brand-rounded bg-[#4A3728]/5 p-2.5 rounded-lg border border-[#4A3728]/5">
                {fieldErrors.city ? "Correct city name to calculate shipping" : "Enter your city to calculate exact weight-based shipping."}
              </p>
            )}
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-bold serif text-[#4A3728]">Grand Total</span>
              <span className="text-2xl sm:text-3xl font-black text-[#F04E4E]">₹{grandTotal}</span>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleProceed}
            className={`w-full py-4 bg-[#F04E4E] shadow-[#F04E4E]/30 text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.25em] text-[11px] transition-all shadow-xl flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.97]'}`}
          >
            {isSubmitting ? <>Processing... <Loader2 className="animate-spin" size={20} /></> : <>Complete My Order <ChevronRight size={20} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
