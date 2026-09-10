import React, { useEffect, useState } from 'react';
import { Truck, ChevronRight, Loader2 } from 'lucide-react';
import { CartItem } from '../types.ts';

declare global {
  interface Window {
    HeadlessCheckout?: {
      addToCart: (event: Event, token: string, opts: { fallbackUrl: string }) => void;
    };
  }
}

interface ShiprocketCheckoutViewProps {
  items: CartItem[];
  total: number;
  onShopClick?: () => void;
}

// Loads Shiprocket Checkout's hosted-iframe assets and hands off to them on
// click — per "4. Embedding Checkout Button in Website" in the integration
// guide. All the actual Address/Payment UI lives inside Shiprocket's own
// iframe from here on; this component's only job is getting a valid access
// token and triggering the button. If anything here fails, fallbackUrl
// sends the customer to the proven legacy checkout instead of a dead end.
const ShiprocketCheckoutView: React.FC<ShiprocketCheckoutViewProps> = ({ items, total, onShopClick }) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document.getElementById('shiprocket-checkout-css')) { setAssetsLoaded(true); return; }

    const link = document.createElement('link');
    link.id = 'shiprocket-checkout-css';
    link.rel = 'stylesheet';
    link.href = 'https://checkout-ui.shiprocket.com/assets/styles/shopify.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.id = 'shiprocket-checkout-js';
    script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js';
    script.onload = () => setAssetsLoaded(true);
    script.onerror = () => setError('Could not load the payment widget. Please try again.');
    document.body.appendChild(script);
  }, []);

  const handleCheckout = async (e: React.MouseEvent) => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/shiprocket-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            weight: item.selectedWeight || item.weight,
            quantity: item.quantity,
          })),
          redirectUrl: 'https://amieshomemade.com/order-confirmed',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Could not start checkout');
      }
      if (!window.HeadlessCheckout) {
        throw new Error('Payment widget not ready yet');
      }
      window.HeadlessCheckout.addToCart(e.nativeEvent, data.token, { fallbackUrl: 'https://amieshomemade.com/checkout' });
    } catch (err: any) {
      console.error('[ShiprocketCheckoutView] Checkout failed:', err.message);
      setError('Something went wrong starting checkout. Please try again, or continue on our regular checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-28 sm:pt-32 pb-16 px-4 bg-cream min-h-screen flex items-center justify-center text-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-[#4A3728]/5 p-8 sm:p-12">
          <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center text-coral mx-auto mb-6">
            <Truck size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mb-3">Your bag is empty</h2>
          <p className="text-sm text-[#4A3728]/60 brand-rounded leading-relaxed mb-8">
            Add a few of Amie's Homemade treats to your bag, then come back here to check out.
          </p>
          <button
            onClick={() => onShopClick?.()}
            className="w-full py-4 bg-coral text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] hover:bg-[#d43d3d] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Browse Products <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 pb-16 px-4 bg-cream min-h-screen flex items-center justify-center">
      <input type="hidden" value="amieshomemade.com" id="sellerDomain" />
      <div className="max-w-md w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-[#4A3728]/5 p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mb-3">Ready to Checkout</h2>
        <p className="text-sm text-[#4A3728]/60 brand-rounded leading-relaxed mb-2">
          {items.reduce((n, i) => n + i.quantity, 0)} item{items.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'} in your bag
        </p>
        <p className="text-3xl font-black text-coral mb-8">₹{total}</p>
        {error && <p className="text-red-600 text-xs font-bold mb-4">{error}</p>}
        <button
          id="buyNow"
          onClick={handleCheckout}
          disabled={!assetsLoaded || isSubmitting}
          className="w-full py-4 bg-coral text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] hover:bg-[#d43d3d] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting || !assetsLoaded ? <Loader2 size={18} className="animate-spin" /> : <>Checkout <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  );
};

export default ShiprocketCheckoutView;
