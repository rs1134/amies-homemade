import React from 'react';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingCart, Tag, CheckCircle } from 'lucide-react';
import { CartItem } from '../types.ts';

const COUPON_CODE = 'Thanks10';
const COUPON_STORAGE_KEY = 'thanks10_used_phones';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (couponDiscount: number) => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [couponInput, setCouponInput] = React.useState('');
  const [couponApplied, setCouponApplied] = React.useState(false);
  const [couponError, setCouponError] = React.useState('');

  const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const orderTotal = subtotal - couponDiscount;

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    if (code !== COUPON_CODE) {
      setCouponError('Invalid coupon code.');
      return;
    }
    const usedPhones: string[] = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || '[]');
    // We check at checkout time if the phone was already used; here just validate the code
    setCouponApplied(true);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponInput('');
    setCouponError('');
  };

  // Lock body scroll when cart is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#FFF8EE] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-8 flex items-center justify-between border-b border-[#F04E4E]/10">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold serif text-[#4A3728]">Your Bag</h2>
            <span className="bg-coral/10 text-coral px-4 py-1 rounded-full text-[10px] font-black uppercase brand-rounded">
              {items.length} Items
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#4A3728]/5 rounded-full transition-colors text-coral">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-coral/5 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="text-coral/30" size={40} />
              </div>
              <h3 className="text-xl font-bold text-[#4A3728] serif mb-2">Empty Bag</h3>
              <p className="text-xs text-[#4A3728]/60 mb-8 brand-rounded font-bold uppercase tracking-widest">Ami's treats are waiting for you!</p>
              <button 
                onClick={onClose}
                className="text-coral font-bold text-[10px] uppercase tracking-[0.2em] hover:underline brand-rounded"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-6 group animate-in slide-in-from-right delay-75 duration-300">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-coral/5 flex-shrink-0 shadow-lg">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-bold text-[#4A3728] text-lg serif leading-tight">{item.name}</h4>
                    <button onClick={() => onRemove(item.id)} className="text-[#4A3728]/20 hover:text-coral transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-coral/60 font-black brand-rounded uppercase tracking-widest mb-4">
                    {item.selectedWeight || item.weight}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border-2 border-coral/10 rounded-2xl bg-white p-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1.5 hover:text-coral hover:bg-coral/5 rounded-xl transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold brand-rounded">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1.5 hover:text-coral hover:bg-coral/5 rounded-xl transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-coral text-lg">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 bg-white rounded-t-[4rem] border-t border-[#F04E4E]/10 space-y-6 shadow-[0_-20px_50px_rgba(240,78,78,0.05)]">
            {/* Coupon input */}
            {!couponApplied ? (
              <div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border-2 border-[#4A3728]/10 rounded-2xl px-4 py-3 bg-[#FFF8EE] focus-within:border-coral/40 transition-colors">
                    <Tag size={14} className="text-coral/50 flex-shrink-0" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Have a coupon code?"
                      className="flex-1 bg-transparent text-xs font-bold brand-rounded tracking-widest outline-none text-[#4A3728] placeholder-[#4A3728]/30"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-3 bg-[#4A3728] text-white rounded-2xl text-[10px] font-black brand-rounded uppercase tracking-widest hover:bg-coral transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold brand-rounded mt-1.5 pl-1">{couponError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-xs font-black brand-rounded uppercase tracking-widest text-green-700">THANKS10 Applied!</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-[10px] text-green-600 hover:text-red-500 font-bold transition-colors">Remove</button>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#4A3728]/50 brand-rounded uppercase font-bold text-[10px] tracking-widest">Subtotal</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 brand-rounded uppercase font-bold text-[10px] tracking-widest">Coupon Discount (10%)</span>
                  <span className="font-bold text-green-600">− ₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm items-center">
                <span className="text-[#4A3728]/50 brand-rounded uppercase font-bold text-[10px] tracking-widest">Delivery</span>
                <span className="text-[9px] text-coral font-black brand-rounded uppercase tracking-widest">Calculated at Checkout</span>
              </div>
              <div className="pt-4 border-t border-[#4A3728]/5 flex justify-between items-center">
                <span className="text-xl font-bold serif">Order Value</span>
                <span className="text-4xl font-black text-[#4A3728]">₹{orderTotal}</span>
              </div>
            </div>

            <button
              onClick={() => onCheckout(couponDiscount)}
              className="w-full py-6 bg-coral text-white rounded-[2rem] font-bold tracking-[0.2em] uppercase text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-coral/30"
            >
              Set Delivery Info <ArrowRight size={18} />
            </button>
            <p className="text-[10px] text-center text-[#4A3728]/40 uppercase tracking-widest font-black brand-rounded">
              Homemade with Love ❤️
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;