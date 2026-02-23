import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return res.status(500).json({ error: 'Razorpay keys not configured on server' });
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const { amount, currency, receipt } = req.body;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    });

    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create order' });
  }
}
