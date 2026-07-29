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

// ── Meta Conversions API — same hashing rules as api/meta-capi.ts, ─────────
// duplicated here (not imported) because Vercel's per-function bundler does
// not reliably trace shared modules outside each function's own file for
// this project. See api/meta-capi.ts for the canonical, documented version.
const sha256Hex = (s: string) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const normEmail = (v: string) => v.trim().toLowerCase();
const normPhone = (v: string) => {
  let digits = v.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  else if (digits.length === 11 && digits.startsWith('0')) digits = '91' + digits.slice(1);
  return digits;
};
const normName = (v: string) => v.trim().toLowerCase();
const hashField = (value: string | undefined, normalize: (v: string) => string): string | undefined => {
  if (!value) return undefined;
  const normalized = normalize(String(value));
  return normalized ? sha256Hex(normalized) : undefined;
};

// ── Order confirmation email (Resend) — duplicated from api/notify-order.ts,
// same reason as the Meta CAPI helpers above (no cross-file module tracing).
const escapeHtml = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

function buildOrderEmailHtml(params: {
  orderId: string; name: string; itemsSummary: string; address: string; city: string;
  subtotal: number; couponDiscount: number; shippingFee: number; codFee: number;
  grandTotal: number; isCod: boolean;
}): string {
  const itemRows = params.itemsSummary.split('\n').filter(Boolean).map(line =>
    `<tr><td style="padding:6px 0;color:#4A3728;font-size:14px;">${escapeHtml(line)}</td></tr>`
  ).join('');
  const delivery = params.city.toLowerCase().includes('ahmedabad') ? '1-2 working days' : '3-5 working days';

  return `
<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;background:#FFF8EE;">
  <div style="background:#F04E4E;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;font-size:24px;margin:0;">Order Confirmed!</h1>
    <p style="color:#fff;opacity:0.85;font-size:13px;margin:8px 0 0;">Order ID: ${escapeHtml(params.orderId)}</p>
  </div>
  <div style="padding:24px;">
    <p style="color:#4A3728;font-size:14px;">Hi ${escapeHtml(params.name)},</p>
    <p style="color:#4A3728;font-size:14px;">Thank you for your order! Here's a summary of what you ordered:</p>
    <table width="100%" style="border-top:1px solid #4A372820;border-bottom:1px solid #4A372820;margin:16px 0;">
      ${itemRows}
    </table>
    <table width="100%" style="font-size:14px;color:#4A3728;">
      <tr><td>Subtotal</td><td align="right">Rs.${params.subtotal}</td></tr>
      ${params.couponDiscount > 0 ? `<tr><td>Coupon Discount</td><td align="right">-Rs.${params.couponDiscount}</td></tr>` : ''}
      <tr><td>Delivery Fee</td><td align="right">${params.shippingFee === 0 ? 'FREE' : `Rs.${params.shippingFee}`}</td></tr>
      ${params.codFee > 0 ? `<tr><td>COD Convenience Fee</td><td align="right">Rs.${params.codFee}</td></tr>` : ''}
      <tr><td style="font-weight:bold;padding-top:8px;">${params.isCod ? 'Grand Total (Pay on Delivery)' : 'Grand Total Paid'}</td><td align="right" style="font-weight:bold;padding-top:8px;color:#F04E4E;">Rs.${params.grandTotal}</td></tr>
    </table>
    <p style="color:#4A3728;font-size:13px;margin-top:20px;"><strong>Delivering to:</strong><br/>${escapeHtml(params.address)}, ${escapeHtml(params.city)}</p>
    <p style="color:#4A3728;font-size:13px;">Estimated delivery: ${delivery}</p>
    <p style="color:#4A3728;font-size:13px;margin-top:20px;">Questions? Message us on WhatsApp: <a href="https://wa.me/919054038876" style="color:#F04E4E;">+91 90540 38876</a></p>
  </div>
</div>`.trim();
}

async function sendOrderConfirmationEmail(params: {
  to: string; orderId: string; name: string; itemsSummary: string; address: string; city: string;
  subtotal: number; couponDiscount: number; shippingFee: number; codFee: number;
  grandTotal: number; isCod: boolean;
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: "Amie's Homemade <hello@amieshomemade.com>",
        to: params.to,
        subject: `Order Confirmed - ${params.orderId} | Amie's Homemade`,
        html: buildOrderEmailHtml(params),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[razorpay-webhook] Resend email failed: ${res.status} ${text}`);
    }
  } catch (err: any) {
    console.error('[razorpay-webhook] Resend email error:', err.message);
  }
}

async function sendMetaPurchaseBackstop(params: {
  eventId: string;
  value: number;
  contentIds: string[];
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zip: string;
}) {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const [firstName, ...lastNameParts] = params.name.trim().split(/\s+/);
  const userData: Record<string, unknown> = {};
  const normLocation = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const em = hashField(params.email, normEmail);
  const ph = hashField(params.phone, normPhone);
  const fn = hashField(firstName, normName);
  const ln = hashField(lastNameParts.join(' '), normName);
  const ct = hashField(params.city, normLocation);
  const st = hashField(params.state, normLocation);
  const zp = hashField(params.zip, normLocation);
  const country = hashField('in', normName); // site is India-only right now
  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];
  if (ct) userData.ct = [ct];
  if (st) userData.st = [st];
  if (zp) userData.zp = [zp];
  if (country) userData.country = [country];
  // Phone doubles as external_id here — this backstop has no access to the
  // persistent per-browser id the client-side path uses (that only exists
  // in the customer's own browser storage), so phone is the only stable
  // identifier available server-to-server.
  const externalId = hashField(params.phone, normPhone);
  if (externalId) userData.external_id = [externalId];
  // No fbp/fbc/client IP here — this call originates from Razorpay's server,
  // not the customer's browser, so those signals genuinely don't exist for
  // this path. Weaker match quality than the client-fired event is expected;
  // this only fires at all when the client-fired one never reached us.

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId, // matches the client-fired event_id so Meta dedupes
      action_source: 'website',
      user_data: userData,
      custom_data: {
        value: params.value,
        currency: 'INR',
        content_ids: params.contentIds,
        content_type: 'product',
      },
    }],
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[razorpay-webhook] Meta CAPI Purchase send failed: ${res.status} ${text}`);
    }
  } catch (err: any) {
    console.error('[razorpay-webhook] Meta CAPI Purchase send error:', err.message);
  }
}

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

  // Notes store amounts as "Rs.1020" — strip the "Rs." prefix (not just any
  // non-digit char) before parsing, since a blanket [^\d.] strip leaves the
  // period in "Rs." dangling in front of the real number (e.g. "Rs.100" ->
  // ".100" -> parseFloat gives 0.1, not 100).
  const parseRs = (v: any): number => {
    const cleaned = String(v ?? '').replace(/^\s*Rs\.?\s*/i, '').replace(/[^\d.]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const notes = payment.notes || {};
  const orderId = `AM-WH${String(payment.id).slice(-5)}`;
  const name = notes.customer_name || 'Unknown';
  const phone = notes.phone || payment.contact || '';
  // Razorpay returns "void@razorpay.com" as a system placeholder for UPI
  // payments where no real email was captured -- treat it the same as a
  // genuinely missing email rather than storing/sending it as if it were
  // real customer data (a hashed junk email sent to Meta CAPI just wastes
  // the field instead of improving match quality).
  const razorpayEmail = payment.email && payment.email !== 'void@razorpay.com' ? payment.email : '';
  const email = notes.email && notes.email !== 'N/A' ? notes.email : razorpayEmail;
  const city = notes.city || '';
  const state = notes.state || '';
  const pincode = notes.pincode || '';
  const address = notes.address || '';
  const itemsSummary = notes.items || '';
  const totalWeight = parseInt(String(notes.total_weight || '0').replace(/[^\d]/g, ''), 10) || 0;
  const subtotal = parseRs(notes.subtotal) || (payment.amount / 100);
  const shippingFee = parseRs(notes.shipping);
  const grandTotal = parseRs(notes.grand_total) || (payment.amount / 100);
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
        total_weight, subtotal, coupon_discount, shipping_fee, grand_total, payment_id, payment_method
      ) VALUES (
        ${orderId}, ${name}, ${phone}, ${email}, ${city}, ${address}, ${itemsSummary},
        ${totalWeight}, ${subtotal}, 0, ${shippingFee}, ${grandTotal}, ${paymentId}, 'RAZORPAY'
      )
      ON CONFLICT (payment_id) DO NOTHING
      RETURNING id
    `;

    if (inserted.length === 0) {
      console.log(`[razorpay-webhook] payment ${paymentId} already logged`);
      // Note: deliberately NOT re-sending the Meta Purchase event here — if
      // the order was already logged, the client-fired Purchase (which
      // shares this same event_id) almost certainly already reached Meta,
      // so sending again would just be a duplicate delivery of the same
      // event_id (harmless, since Meta dedupes on event_id, but pointless).
      return res.status(200).json({ ok: true, isNew: false });
    }

    const message = [
      `NEW ORDER: ${orderId}`,
      `---------------------------`,
      `Customer: ${name}`,
      `Phone: ${phone}`,
      `City: ${city}`,
      `Address: ${address}`,
      `Pincode: ${pincode || 'N/A'}`,
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
          `Questions? WhatsApp +91 90540 38876`;

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

    // ── Customer order confirmation email via Resend ──────────────────────
    if (email && email !== 'N/A') {
      await sendOrderConfirmationEmail({
        to: email, orderId, name, itemsSummary, address, city,
        subtotal, couponDiscount: 0, shippingFee, codFee: 0,
        grandTotal, isCod: false,
      });
    }

    // ── Meta Conversions API Purchase — server-side backstop ──────────────
    // Shares the deterministic event_id `purchase-${paymentId}` with the
    // client-fired Purchase in CheckoutView.tsx, so this only adds a second
    // counted purchase on Meta's side if the client one never landed.
    await sendMetaPurchaseBackstop({
      eventId: `purchase-${paymentId}`,
      value: grandTotal,
      contentIds: [],
      name, phone, email, city, state, zip: pincode,
    });

    console.log(`[razorpay-webhook] payment ${paymentId}: logged + notified`);
    return res.status(200).json({ ok: true, isNew: true });
  } catch (err: any) {
    console.error('[razorpay-webhook] Failed to log order:', err.message);
    // Return 500 so Razorpay retries this webhook delivery.
    return res.status(500).json({ error: err.message });
  }
}
