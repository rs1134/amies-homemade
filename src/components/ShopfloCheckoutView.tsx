import React, { useEffect, useState } from 'react';
import { Truck, ChevronRight, Loader2 } from 'lucide-react';
import { CartItem } from '../types.ts';

declare global {
  interface Window {
    Shopflo?: {
      getSessionId: () => string;
      openFloCheckout: (checkoutUrl: string) => void;
    };
  }
}

interface ShopfloCheckoutViewProps {
  items: CartItem[];
  total: number;
  onShopClick?: () => void;
}

// Loads the Shopflo SDK script and hands off to it on click — per "Steps to
// Integrate Shopflo on Custom Websites" in the Postman integration guide.
// The SDK opens Shopflo's own hosted checkout (iframe, or a redirect if the
// browser blocks third-party cookies); everything from address through
// payment happens inside that, not on this page. This component's only job
// is fetching a valid checkout token and invoking the SDK.
const SHOPFLO_MERCHANT_ID = '5f263146-6556-4071-a0ec-a0577ea274d7';

const ShopfloCheckoutView: React.FC<ShopfloCheckoutViewProps> = ({ items, total, onShopClick }) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.Shopflo) { setSdkReady(true); return; }
    if (document.getElementById('shopflo-sdk')) return;

    (function (f: any, l: Document, o: string, j: string, s: string) {
      f[o] = f[o] || { m_id: s };
      const d = l.createElement(j) as HTMLScriptElement;
      d.id = 'shopflo-sdk';
      d.async = true;
      d.src = 'https://bridge.shopflo.com/v2/shopflo.js';
      d.onload = () => setSdkReady(true);
      d.onerror = () => setError('Could not load the payment widget. Please try again.');
      const k = l.getElementsByTagName(j)[0];
      k.parentNode?.insertBefore(d, k);
    })(window, document, 'Shopflo', 'script', SHOPFLO_MERCHANT_ID);
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (!window.Shopflo) throw new Error('Payment widget not ready yet');
      const sessionId = window.Shopflo.getSessionId();

      const res = await fetch('/api/shopflo-checkout/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          items: items.map(item => ({
            id: `${item.id}-${item.selectedWeight || item.weight}`,
            productId: item.id,
            name: item.name,
            variantName: item.selectedWeight || item.weight,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          backUrl: 'https://amieshomemade.com/checkout',
          successUrl: 'https://amieshomemade.com/order-confirmed?checkout_id={checkout_id}&platform_order_id={platform_order_id}',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Could not start checkout');
      }
      window.Shopflo.openFloCheckout(data.checkoutUrl);
    } catch (err: any) {
      console.error('[ShopfloCheckoutView] Checkout failed:', err.message);
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
      <div className="max-w-md w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-[#4A3728]/5 p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mb-3">Ready to Checkout</h2>
        <p className="text-sm text-[#4A3728]/60 brand-rounded leading-relaxed mb-2">
          {items.reduce((n, i) => n + i.quantity, 0)} item{items.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'} in your bag
        </p>
        <p className="text-3xl font-black text-coral mb-8">₹{total}</p>
        {error && <p className="text-red-600 text-xs font-bold mb-4">{error}</p>}
        <button
          onClick={handleCheckout}
          disabled={!sdkReady || isSubmitting}
          className="w-full py-4 bg-coral text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] hover:bg-[#d43d3d] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting || !sdkReady ? <Loader2 size={18} className="animate-spin" /> : <>Checkout <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  );
};

export default ShopfloCheckoutView;
