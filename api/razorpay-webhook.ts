import crypto from 'crypto';
import { logAndNotifyOrder } from '../lib/orderLogger.ts';

// Disable Vercel's automatic JSON body parsing — webhook signature
// verification needs the exact raw bytes Razorpay signed, not a re-serialized
// JSON.stringify of a parsed object (which can differ in whitespace/key order).
export const config = {
  api: { bodyParser: false },
};

function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Server-side backstop for order logging. Razorpay calls this directly from
 * its own servers when a payment captures, independent of whether the
 * customer's browser stays open long enough to report the order itself
 * (see the 3 AM order that captured payment but never reached ntfy/DB because
 * the client-side call never ran). Configure this URL + secret once under
 * Razorpay Dashboard → Settings → Webhooks, subscribed to "payment.captured".
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers['x-razorpay-signature'];

  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    console.error('[razorpay-webhook] Invalid signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Only act on captured payments — that's the only event that means money
  // actually landed in the account.
  if (payload.event !== 'payment.captured') {
    return res.status(200).json({ ok: true, skipped: payload.event });
  }

  const payment = payload.payload?.payment?.entity;
  if (!payment) {
    return res.status(200).json({ ok: true, skipped: 'no payment entity' });
  }

  const notes = payment.notes || {};
  const orderId = `AM-WH${String(payment.id).slice(-5)}`;

  try {
    const { isNew } = await logAndNotifyOrder({
      orderId,
      name: notes.customer_name || 'Unknown',
      phone: notes.phone || payment.contact || '',
      email: notes.email && notes.email !== 'N/A' ? notes.email : (payment.email || ''),
      city: notes.city || '',
      address: notes.address || '',
      itemsSummary: notes.items || '',
      totalWeight: parseInt(String(notes.total_weight || '0').replace(/[^\d]/g, ''), 10) || 0,
      subtotal: parseFloat(String(notes.subtotal || '0').replace(/[^\d.]/g, '')) || (payment.amount / 100),
      shippingFee: parseFloat(String(notes.shipping || '0').replace(/[^\d.]/g, '')) || 0,
      grandTotal: parseFloat(String(notes.grand_total || '0').replace(/[^\d.]/g, '')) || (payment.amount / 100),
      paymentId: payment.id,
    });
    console.log(`[razorpay-webhook] payment ${payment.id}: ${isNew ? 'logged + notified' : 'already logged'}`);
    return res.status(200).json({ ok: true, isNew });
  } catch (err: any) {
    console.error('[razorpay-webhook] Failed to log order:', err.message);
    // Return 500 so Razorpay retries this webhook delivery.
    return res.status(500).json({ error: err.message });
  }
}
