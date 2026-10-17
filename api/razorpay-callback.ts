import crypto from 'crypto';

// Razorpay POSTs the customer here when checkout runs in redirect mode instead
// of the popup (common in phone in-app browsers such as Instagram/Facebook,
// and after UPI app hand-offs). Without a callback_url those customers end up
// stranded on a Razorpay page. The order itself is created from the payment
// notes by api/razorpay-webhook.ts, so this only verifies and sends the
// customer back to the site.
export default async function handler(req: any, res: any) {
  const site = 'https://amieshomemade.com';
  const body = req.body || {};
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  let ok = false;
  if (secret && orderId && paymentId && signature) {
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature));
    ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(303, ok ? `${site}/order-confirmed` : `${site}/shop?cart=open`);
}
