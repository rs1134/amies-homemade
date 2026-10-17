import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  // Redirect-mode return (?cb=1): Razorpay POSTs the customer here when
  // checkout runs in redirect mode instead of the popup (phone in-app
  // browsers such as Instagram/Facebook, UPI app hand-offs). Without a
  // callback_url they end up stranded on a Razorpay page. The order itself is
  // created from the payment notes by api/razorpay-webhook.ts, so this only
  // verifies the signature and sends the customer back to the site. Kept in
  // this file because the plan caps the number of api/ functions.
  if (req.query?.cb === '1') {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const b = req.body || {};
    let ok = false;
    if (secret && b.razorpay_order_id && b.razorpay_payment_id && b.razorpay_signature) {
      const exp = crypto.createHmac('sha256', secret).update(`${b.razorpay_order_id}|${b.razorpay_payment_id}`).digest('hex');
      const x = Buffer.from(exp);
      const y = Buffer.from(String(b.razorpay_signature));
      ok = x.length === y.length && crypto.timingSafeEqual(x, y);
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(303, ok ? 'https://amieshomemade.com/order-confirmed' : 'https://amieshomemade.com/shop?cart=open');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    return res.status(500).json({ error: 'Razorpay secret not configured on server' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const expected = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    const valid =
      a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!valid) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    return res.status(200).json({ success: true, verified: true });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || 'Verification failed' });
  }
}
