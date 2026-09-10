import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { resolveVariant } from '../../src/shiprocketCatalog';

// Receives the order-placed webhook from Shiprocket Checkout once a customer
// completes payment in the hosted iframe. This is the ONLY place a
// Shiprocket-Checkout Purchase can be recorded/tracked from — we don't
// control JS inside their iframe, unlike the legacy checkout where the
// browser fires Meta's Purchase event directly. Mirrors the exact
// notification pattern already proven in api/notify-order.ts (ntfy, SMS,
// email, Meta CAPI backstop with the same internal-test-phone exclusion).
//
// NOTE: the integration guide's sample payload only shows
// {order_id, cart_data, status, phone, email, payment_type,
// total_amount_payable} — no shipping address fields, and no auth headers
// on the *incoming* request (unlike the catalog webhooks we send TO
// Shiprocket, which do carry X-Api-Key/HMAC). Until a real webhook is
// observed, this logs the full raw payload on every call so field names
// can be corrected quickly without guessing blind.

const toHeaderSafe = (s: any) =>
  String(s ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\xFF]/g, '');

const NTFY_TOPIC = 'amies-homemade-9157537842';

const escapeHtml = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

function buildOrderEmailHtml(params: { orderId: string; name: string; itemsSummary: string; address: string; city: string; grandTotal: number; isCod: boolean }): string {
  const itemRows = params.itemsSummary.split('\n').filter(Boolean).map(line =>
    `<tr><td style="padding:6px 0;color:#4A3728;font-size:14px;">${escapeHtml(line)}</td></tr>`
  ).join('');
  return `
<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;background:#FFF8EE;">
  <div style="background:#F04E4E;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;font-size:24px;margin:0;">Order Confirmed!</h1>
    <p style="color:#fff;opacity:0.85;font-size:13px;margin:8px 0 0;">Order ID: ${escapeHtml(params.orderId)}</p>
  </div>
  <div style="padding:24px;">
    <p style="color:#4A3728;font-size:14px;">Hi ${escapeHtml(params.name)},</p>
    <p style="color:#4A3728;font-size:14px;">Thank you for your order! Here's a summary of what you ordered:</p>
    <table width="100%" style="border-top:1px solid #4A372820;border-bottom:1px solid #4A372820;margin:16px 0;">${itemRows}</table>
    <table width="100%" style="font-size:14px;color:#4A3728;">
      <tr><td style="font-weight:bold;padding-top:8px;">${params.isCod ? 'Grand Total (Pay on Delivery)' : 'Grand Total Paid'}</td><td align="right" style="font-weight:bold;padding-top:8px;color:#F04E4E;">Rs.${params.grandTotal}</td></tr>
    </table>
    <p style="color:#4A3728;font-size:13px;margin-top:20px;"><strong>Delivering to:</strong><br/>${escapeHtml(params.address)}, ${escapeHtml(params.city)}</p>
    <p style="color:#4A3728;font-size:13px;margin-top:20px;">Questions? Message us on WhatsApp: <a href="https://wa.me/919054038876" style="color:#F04E4E;">+91 90540 38876</a></p>
  </div>
</div>`.trim();
}

async function sendOrderConfirmationEmail(params: { to: string; orderId: string; name: string; itemsSummary: string; address: string; city: string; grandTotal: number; isCod: boolean }) {
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
    if (!res.ok) console.error(`[shiprocket-order-webhook] Resend failed: ${res.status} ${await res.text().catch(() => '')}`);
  } catch (err: any) {
    console.error('[shiprocket-order-webhook] Resend error:', err.message);
  }
}

const sha256Hex = (s: string) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const normEmail = (v: string) => v.trim().toLowerCase();
const normPhone = (v: string) => {
  let digits = v.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  else if (digits.length === 11 && digits.startsWith('0')) digits = '91' + digits.slice(1);
  return digits;
};
const normLocation = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const hashField = (value: string | undefined, normalize: (v: string) => string): string | undefined => {
  if (!value) return undefined;
  const normalized = normalize(String(value));
  return normalized ? sha256Hex(normalized) : undefined;
};

// Same exact set as api/notify-order.ts / api/razorpay-webhook.ts / src/metaTracking.ts.
const INTERNAL_TEST_PHONES = new Set(['9054038876', '9909942126']);
const isInternalTestPhone = (phone?: string): boolean =>
  !!phone && INTERNAL_TEST_PHONES.has(String(phone).replace(/\D/g, '').slice(-10));

async function sendMetaPurchaseBackstop(params: { eventId: string; value: number; name: string; phone: string; email: string; city: string }): Promise<void> {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const [firstName, ...lastNameParts] = params.name.trim().split(/\s+/);
  const userData: Record<string, string[]> = {};
  const em = hashField(params.email, normEmail); if (em) userData.em = [em];
  const ph = hashField(params.phone, normPhone); if (ph) userData.ph = [ph];
  const fn = hashField(firstName, normLocation); if (fn) userData.fn = [fn];
  const ln = hashField(lastNameParts.join(' '), normLocation); if (ln) userData.ln = [ln];
  const ct = hashField(params.city, normLocation); if (ct) userData.ct = [ct];
  const country = hashField('in', normLocation); if (country) userData.country = [country];

  const testEventCode = process.env.META_TEST_EVENT_CODE;
  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      event_source_url: 'https://amieshomemade.com/checkout',
      action_source: 'website',
      user_data: userData,
      custom_data: { value: params.value, currency: 'INR' },
    }],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error(`[shiprocket-order-webhook] Meta CAPI failed: ${res.status} ${await res.text().catch(() => '')}`);
  } catch (err: any) {
    console.error('[shiprocket-order-webhook] Meta CAPI error:', err.message);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log every raw payload until we've confirmed the real field names against
  // a live order — cheap insurance against silently losing shipping details.
  console.log('[shiprocket-order-webhook] raw payload:', JSON.stringify(req.body));

  const body = req.body || {};
  const orderId = String(body.order_id || `SR-${Date.now()}`);
  const phone = body.phone || body.customer?.phone || '';
  const email = body.email || body.customer?.email || '';
  const name = body.name || body.customer?.name || body.billing_address?.name || 'Customer';
  const address = body.address || body.shipping_address?.address || body.billing_address?.address || '';
  const city = body.city || body.shipping_address?.city || body.billing_address?.city || '';
  const pincode = body.pincode || body.shipping_address?.pincode || body.billing_address?.pincode || '';
  const grandTotal = Number(body.total_amount_payable || body.grand_total || 0);
  const isCod = String(body.payment_type || '').toUpperCase().includes('COD');
  const cartItems = body.cart_data?.items || [];

  if (!address || !city) {
    console.error('[shiprocket-order-webhook] Missing shipping address fields in payload — check field names against a real webhook and adjust this handler.');
  }

  const itemsSummary = cartItems.map((item: any) => {
    const resolved = resolveVariant(item.variant_id);
    const label = resolved ? `${resolved.productId} (${resolved.weight})` : `variant ${item.variant_id}`;
    return `${item.quantity}x ${label}`;
  }).join('\n');
  const totalWeight = cartItems.reduce((sum: number, item: any) => {
    const resolved = resolveVariant(item.variant_id);
    const grams = resolved ? parseInt(resolved.weight, 10) || 0 : 0;
    return sum + grams * (item.quantity || 1);
  }, 0);

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[shiprocket-order-webhook] DATABASE_URL not set');
      return res.status(200).json({ ok: true, warning: 'no db configured' });
    }

    const sql = neon(dbUrl);
    const inserted = await sql`
      INSERT INTO orders (
        order_id, name, phone, email, city, address, items_summary,
        total_weight, subtotal, coupon_discount, shipping_fee, grand_total, payment_id, payment_method
      ) VALUES (
        ${orderId}, ${name}, ${phone}, ${email}, ${city}, ${address}, ${itemsSummary},
        ${totalWeight}, ${grandTotal}, 0, 0, ${grandTotal}, ${orderId}, 'SHIPROCKET'
      )
      ON CONFLICT (payment_id) DO NOTHING
      RETURNING id
    `;

    if (inserted.length === 0) {
      console.log(`[shiprocket-order-webhook] order ${orderId} already logged`);
      return res.status(200).json({ ok: true, isNew: false });
    }

    if (!isInternalTestPhone(phone)) {
      await sendMetaPurchaseBackstop({ eventId: `shiprocket-${orderId}`, value: grandTotal, name, phone, email, city });
    }

    try {
      const message = [
        `NEW ORDER (Shiprocket Checkout): ${orderId}`,
        `---------------------------`,
        `Customer: ${name}`,
        `Phone: ${phone}`,
        `City: ${city}`,
        `Address: ${address}`,
        `Pincode: ${pincode || 'N/A'}`,
        `Email: ${email || 'N/A'}`,
        ``,
        `ITEMS:`,
        itemsSummary,
        ``,
        `GRAND TOTAL: Rs.${grandTotal}`,
        `Payment: ${isCod ? 'COD' : 'PREPAID'}`,
        `---------------------------`,
      ].join('\n');
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
      if (!ntfyRes.ok) console.error(`[shiprocket-order-webhook] ntfy failed: ${ntfyRes.status}`);
    } catch (err: any) {
      console.error('[shiprocket-order-webhook] ntfy error:', err.message);
    }

    const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;
    if (FAST2SMS_KEY && phone) {
      try {
        const mobile = String(phone).replace(/[\s\-\(\)]/g, '').replace(/^\+?91/, '').slice(-10);
        const smsText = `Amie's Homemade: Order ${orderId} confirmed! Amount: Rs.${grandTotal}. Questions? WhatsApp +91 90540 38876`;
        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: { 'authorization': FAST2SMS_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: 'q', message: smsText, language: 'english', flash: 0, numbers: mobile }),
        });
        const smsResult = await smsRes.json() as any;
        if (smsResult.return !== true) console.error('[shiprocket-order-webhook] SMS failed:', JSON.stringify(smsResult));
      } catch (err: any) {
        console.error('[shiprocket-order-webhook] SMS error:', err.message);
      }
    }

    if (email) {
      await sendOrderConfirmationEmail({ to: email, orderId, name, itemsSummary, address, city, grandTotal, isCod });
    }

    return res.status(200).json({ ok: true, isNew: true });
  } catch (err: any) {
    console.error('[shiprocket-order-webhook] Failed:', err.message);
    // Still 200 — Shiprocket may retry/disable the webhook on non-2xx.
    return res.status(200).json({ ok: false, error: err.message });
  }
}
