import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// HTTP headers can only contain Latin-1 (ByteString) characters. Customer
// names/addresses can contain em-dashes, smart quotes, emoji, etc., which
// would otherwise throw and silently kill the whole notification.
const toHeaderSafe = (s: any) =>
  String(s ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\xFF]/g, '');

const NTFY_TOPIC = 'amies-homemade-9157537842';

// ── Order confirmation email (Resend) ───────────────────────────────────────
// Duplicated in api/razorpay-webhook.ts rather than imported — see the
// hashing-helper comment in api/meta-capi.ts for why (Vercel's per-function
// bundler doesn't reliably trace shared modules outside each function's own
// file for this project's build setup).
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
  const delivery = params.city.toLowerCase().includes('ahmedabad') ? '1 working day' : '3-5 working days';

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
      console.error(`[notify-order] Resend email failed: ${res.status} ${text}`);
    }
  } catch (err: any) {
    console.error('[notify-order] Resend email error:', err.message);
  }
}

// ── Meta Conversions API Purchase — COD server-side backstop ───────────────
// COD orders have no Razorpay webhook (no payment gateway involved), so the
// browser-fired Purchase event (in CheckoutView.tsx, event_id `cod-<orderId>`)
// is normally the only signal Meta ever gets for these. If that browser call
// is lost (ad-blocker, tab closed right after tapping "Place Order", flaky
// mobile connection), the purchase never reaches Meta at all — unlike online
// payments, which have the Razorpay webhook as a backstop. This closes that
// gap the same way: same deterministic event_id, so Meta dedupes the two if
// both arrive, and still gets a clean single event if only this one does.
// Hashing logic duplicated from api/meta-capi.ts (not imported — see the
// hashing-helper comment there for why Vercel's bundler needs this per-file).
const sha256Hex = (s: string) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const normEmail = (v: string) => v.trim().toLowerCase();
const normPhone = (v: string) => {
  let digits = v.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  else if (digits.length === 11 && digits.startsWith('0')) digits = '91' + digits.slice(1);
  return digits;
};
const normName = (v: string) => v.trim().toLowerCase();
const normLocation = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const hashField = (value: string | undefined, normalize: (v: string) => string): string | undefined => {
  if (!value) return undefined;
  const normalized = normalize(String(value));
  if (!normalized) return undefined;
  return sha256Hex(normalized);
};

async function sendMetaCodPurchaseBackstop(params: {
  eventId: string; value: number; name: string; phone: string; email: string;
  city: string; state: string; zip: string; cookieHeader?: string; clientIp?: string; clientUserAgent?: string;
}): Promise<void> {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const [firstName, ...lastNameParts] = params.name.trim().split(/\s+/);
  const userData: Record<string, string[] | string> = {};
  const em = hashField(params.email, normEmail); if (em) userData.em = [em];
  const ph = hashField(params.phone, normPhone); if (ph) userData.ph = [ph];
  const fn = hashField(firstName, normName); if (fn) userData.fn = [fn];
  const ln = hashField(lastNameParts.join(' '), normName); if (ln) userData.ln = [ln];
  const ct = hashField(params.city, normLocation); if (ct) userData.ct = [ct];
  const st = hashField(params.state, normLocation); if (st) userData.st = [st];
  const zp = hashField(params.zip, normLocation); if (zp) userData.zp = [zp];
  const country = hashField('in', normLocation); if (country) userData.country = [country];

  const cookieHeader = params.cookieHeader || '';
  const fbp = /(?:^|;\s*)_fbp=([^;]+)/.exec(cookieHeader)?.[1];
  const fbc = /(?:^|;\s*)_fbc=([^;]+)/.exec(cookieHeader)?.[1];
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent;

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
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[notify-order] Meta CAPI COD Purchase send failed: ${res.status} ${text}`);
    }
  } catch (err: any) {
    console.error('[notify-order] Meta CAPI COD Purchase send error:', err.message);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    orderId, name, phone, city, state, address, pincode, email, itemsSummary,
    totalWeight, subtotal, shippingFee, codFee, grandTotal, paymentId, couponDiscount,
    paymentMethod, mapPin, gender,
  } = req.body;
  // Backward-compatible default — older client builds don't send this field.
  const method = paymentMethod || 'RAZORPAY';

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[notify-order] DATABASE_URL not set — cannot dedupe, skipping');
      return res.status(200).json({ ok: true, warning: 'no db configured' });
    }

    // Idempotent on payment_id: whichever of this endpoint / the Razorpay
    // webhook reaches a payment first sends the notification; the other is
    // a silent no-op. Protects against the customer's browser closing
    // right after payment (this endpoint never running) as well as the
    // webhook and this client call both firing for the same payment.
    const sql = neon(dbUrl);
    const inserted = await sql`
      INSERT INTO orders (
        order_id, name, phone, email, city, address, items_summary,
        total_weight, subtotal, coupon_discount, shipping_fee, grand_total, payment_id, payment_method
      ) VALUES (
        ${orderId}, ${name}, ${phone}, ${email || ''}, ${city}, ${address}, ${itemsSummary},
        ${totalWeight}, ${subtotal}, ${couponDiscount || 0}, ${shippingFee}, ${grandTotal}, ${paymentId}, ${method}
      )
      ON CONFLICT (payment_id) DO NOTHING
      RETURNING id
    `;

    if (inserted.length === 0) {
      console.log(`[notify-order] payment ${paymentId} already logged — skipping duplicate notification`);
      return res.status(200).json({ ok: true, isNew: false });
    }

    const isCod = method === 'COD';

    if (isCod) {
      // Awaited (not fire-and-forget) — Vercel can freeze/kill an unawaited
      // promise the instant the handler returns, so this needs to finish
      // before the function does, same as the ntfy/SMS/email sends below.
      // Failure here never blocks order confirmation — sendMetaCodPurchaseBackstop
      // catches its own errors internally and just logs them.
      // event_id `cod-<orderId>` matches the browser's own
      // trackMetaEvent('Purchase', ..., `cod-${orderId}`) call exactly.
      await sendMetaCodPurchaseBackstop({
        eventId: `cod-${orderId}`,
        value: grandTotal,
        name, phone, email: email || '', city, state: state || '', zip: pincode || '',
        cookieHeader: req.headers['cookie'],
        clientIp: String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress,
        clientUserAgent: req.headers['user-agent'],
      });
    }

    const message = [
      isCod ? `💰 CASH ON DELIVERY — COLLECT Rs.${grandTotal}` : `NEW ORDER: ${orderId}`,
      `---------------------------`,
      `Customer: ${name}${gender ? ` (${gender})` : ''}`,
      `Phone: ${phone}`,
      `City: ${city}`,
      `Address: ${address}`,
      `Pincode: ${pincode || 'N/A'}`,
      ...(mapPin ? [`Pin: https://maps.google.com/?q=${mapPin}`] : []),
      `Email: ${email || 'N/A'}`,
      ``,
      `Weight: ${totalWeight}g`,
      `ITEMS:`,
      itemsSummary,
      ``,
      `Subtotal: Rs.${subtotal}`,
      ...(couponDiscount > 0 ? [`Coupon (Thanks10): -Rs.${couponDiscount}`] : []),
      `Delivery: Rs.${shippingFee}`,
      ...(codFee > 0 ? [`COD Convenience Fee: Rs.${codFee}`] : []),
      `GRAND TOTAL: Rs.${grandTotal}`,
      `Payment Method: ${method}`,
      isCod ? `Order ID: ${orderId}` : `Payment ID: ${paymentId}`,
      `---------------------------`,
    ].join('\n');

    try {
      const ntfyRes = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        body: message,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Title': toHeaderSafe(isCod ? `COD Order: ${name} (Rs. ${grandTotal})` : `New Order: ${name} (Rs. ${grandTotal})`),
          'Priority': 'high',
          'Tags': isCod ? 'moneybag,package,star' : 'shopping_cart,package,star',
        },
      });
      if (!ntfyRes.ok) {
        const errText = await ntfyRes.text().catch(() => 'unknown');
        console.error(`[notify-order] ntfy failed: ${ntfyRes.status} - ${errText}`);
      }
    } catch (err: any) {
      console.error('[notify-order] ntfy request failed:', err.message);
    }

    // ── Customer SMS via Fast2SMS ─────────────────────────────────────────
    const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;
    if (FAST2SMS_KEY && phone) {
      try {
        const mobile = String(phone).replace(/[\s\-\(\)]/g, '').replace(/^\+?91/, '').slice(-10);
        const itemsShort = String(itemsSummary)
          .split('\n').map((l: string) => l.trim()).filter(Boolean).join(', ').slice(0, 80);
        const delivery = String(city).toLowerCase() === 'ahmedabad' ? '1 working day' : '3-5 working days';
        const smsText =
          `Amie's Homemade: Order ${orderId} confirmed! ` +
          `Amount: Rs.${grandTotal}${isCod ? ' (Cash on Delivery)' : ''}. ` +
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
          console.error('[notify-order] SMS failed:', JSON.stringify(smsResult));
        }
      } catch (smsErr: any) {
        console.error('[notify-order] SMS error:', smsErr.message);
      }
    }

    // ── Customer order confirmation email via Resend ──────────────────────
    if (email && email !== 'N/A') {
      await sendOrderConfirmationEmail({
        to: email, orderId, name, itemsSummary, address, city,
        subtotal, couponDiscount: couponDiscount || 0, shippingFee, codFee: codFee || 0,
        grandTotal, isCod,
      });
    }

    return res.status(200).json({ ok: true, isNew: true });
  } catch (err: any) {
    // Never block the order confirmation screen — the Razorpay webhook is
    // the durable fallback if this call fails for any reason.
    console.error('[notify-order] Failed:', err.message);
    return res.status(200).json({ ok: true, warning: 'log may be delayed, webhook will backfill' });
  }
}
