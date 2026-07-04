import { logAndNotifyOrder } from '../lib/orderLogger.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    orderId, name, phone, city, address, email, itemsSummary,
    totalWeight, subtotal, shippingFee, grandTotal, paymentId, couponDiscount,
  } = req.body;

  try {
    await logAndNotifyOrder({
      orderId, name, phone, email, city, address, itemsSummary,
      totalWeight, subtotal, couponDiscount, shippingFee, grandTotal, paymentId,
    });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    // Never block the order confirmation screen on this — the Razorpay
    // webhook is the durable fallback if this call fails for any reason
    // (customer closes the tab, network drops, etc).
    console.error('[notify-order] Failed:', err.message);
    return res.status(200).json({ ok: true, warning: 'log may be delayed, webhook will backfill' });
  }
}
