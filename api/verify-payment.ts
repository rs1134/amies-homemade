import crypto from 'crypto';

export default async function handler(req: any, res: any) {
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
