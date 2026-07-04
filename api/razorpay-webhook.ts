import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

// HTTP headers can only contain Latin-1 (ByteString) characters.
const toHeaderSafe = (s: any) =>
  String(s ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\xFF]/g, '');

const NTFY_TOPIC = 'amies-homemade-9157537842';

// Disable Vercel's automatic JSON body parsing — webhook signature
// verification needs the exact raw bytes Razorpay signed, not a
// re-serialized JSON.stringify of a parsed object.
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
 * (see the 3 AM order that captured payment but never reached ntfy/DB
 * because the client-side call never ran). Configure this under Razorpay
 * Dashboard → Settings → Webhooks, subscribed to "payment.captured".
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
  const name = notes.customer_name || 'Unknown';
  const phone = notes.phone || payment.contact || '';
  const email = notes.email && notes.email !== 'N/A' ? notes.email : (payment.email || '');
  const city = notes.city || '';
  const address = notes.address || '';
  const itemsSummary = notes.items || '';
  const totalWeight = parseInt(String(notes.total_weight || '0').replace(/[^\d]/g, ''), 10) || 0;
  const subtotal = parseFloat(String(notes.subtotal || '0').replace(/[^\d.]/g, '')) || (payment.amount / 100);
  const shippingFee = parseFloat(String(notes.shipping || '0').replace(/[^\d.]/g, '')) || 0;
  const grandTotal = parseFloat(String(notes.grand_total || '0').replace(/[^\d.]/g, '')) || (payment.amount / 100);
  const paymentId = payment.id;

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[razorpay-webhook] DATABASE_URL not set');
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    // Idempotent on payment_id: whichever of this webhook / the client-side
    // notify-order call reaches a payment first sends the notification;
    // the other is a silent no-op.
    const sql = neon(dbUrl);
    const inserted = await sql`
      INSERT INTO orders (
        order_id, name, phone, email, city, address, items_summary,
        total_weight, subtotal, coupon_discount, shipping_fee, grand_total, payment_id
      ) VALUES (
        ${orderId}, ${name}, ${phone}, ${email}, ${city}, ${address}, ${itemsSummary},
        ${totalWeight}, ${subtotal}, 0, ${shippingFee}, ${grandTotal}, ${paymentId}
      )
      ON CONFLICT (payment_id) DO NOTHING
      RETURNING id
    `;

    if (inserted.length === 0) {
      console.log(`[razorpay-webhook] payment ${paymentId} already logged`);
      return res.status(200).json({ ok: true, isNew: false });
    }

    const message = [
      `NEW ORDER: ${orderId}`,
      `---------------------------`,
      `Customer: ${name}`,
      `Phone: ${phone}`,
      `City: ${city}`,
      `Address: ${address}`,
      `Email: ${email || 'N/A'}`,
      ``,
      `Weight: ${totalWeight}g`,
      `ITEMS:`,
      itemsSummary,
      ``,
      `Subtotal: Rs.${subtotal}`,
      `Delivery: Rs.${shippingFee}`,
      `GRAND TOTAL: Rs.${grandTotal}`,
      `Payment Method: RAZORPAY (via webhook — client-side call likely failed)`,
      `Payment ID: ${paymentId}`,
      `---------------------------`,
    ].join('\n');

    try {
      const ntfyRes = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        body: message,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Title': toHeaderSafe(`New Order: ${name} (Rs. ${grandTotal})`),
          'Priority': 'high',
          'Tags': 'shopping_cart,package,star',
        },
      });
      if (!ntfyRes.ok) {
        const errText = await ntfyRes.text().catch(() => 'unknown');
        console.error(`[razorpay-webhook] ntfy failed: ${ntfyRes.status} - ${errText}`);
      }
    } catch (err: any) {
      console.error('[razorpay-webhook] ntfy request failed:', err.message);
    }

    // ── Customer SMS via Fast2SMS ─────────────────────────────────────────
    const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;
    if (FAST2SMS_KEY && phone) {
      try {
        const mobile = String(phone).replace(/[\s\-\(\)]/g, '').replace(/^\+?91/, '').slice(-10);
        const itemsShort = String(itemsSummary)
          .split('\n').map((l: string) => l.trim()).filter(Boolean).join(', ').slice(0, 80);
        const delivery = String(city).toLowerCase() === 'ahmedabad' ? '1 working day' : '3-5 business days';
        const smsText =
          `Amie's Homemade: Order ${orderId} confirmed! ` +
          `Amount: Rs.${grandTotal}. ` +
          `Items: ${itemsShort}. ` +
          `Est. delivery: ${delivery}. ` +
          `Questions? WhatsApp +91 91575 37842`;

        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: { 'authorization': FAST2SMS_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: 'q', message: smsText, language: 'english', flash: 0, numbers: mobile }),
        });
        const smsResult = await smsRes.json() as any;
        if (smsResult.return !== true) {
          console.error('[razorpay-webhook] SMS failed:', JSON.stringify(smsResult));
        }
      } catch (smsErr: any) {
        console.error('[razorpay-webhook] SMS error:', smsErr.message);
      }
    }

    console.log(`[razorpay-webhook] payment ${paymentId}: logged + notified`);
    return res.status(200).json({ ok: true, isNew: true });
  } catch (err: any) {
    console.error('[razorpay-webhook] Failed to log order:', err.message);
    // Return 500 so Razorpay retries this webhook delivery.
    return res.status(500).json({ error: err.message });
  }
}
