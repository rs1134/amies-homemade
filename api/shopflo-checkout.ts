import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// Single dispatcher for the whole Shopflo Checkout integration (token
// creation + order webhook), matching the same pattern already proven for
// Shiprocket Checkout in this codebase — see api/shiprocket-checkout.ts for
// the full reasoning. Short version: this project sits at Vercel Hobby's
// 12-serverless-function cap, so this stays ONE file, and the clean URLs
// below are vercel.json rewrites (not separate files or a [bracket] route,
// which silently doesn't work on Vercel's generic function convention):
//   POST /api/shopflo-checkout/token          -> Create Checkout Token (called by our own frontend)
//   POST /api/shopflo-checkout/order-webhook  -> Order Webhook (called by Shopflo)
//
// Reference: https://documenter.getpostman.com/view/24352092/2sB3dWsSPH
// ("Steps to Integrate Shopflo on Custom Websites" + "Create Checkout Token V2"),
// and the "Order Webhook" section of the Shopflo Checkout: Custom Platform guide.

async function createToken(req: any, res: any) {
  const API_KEY = process.env.SHOPFLO_API_KEY;
  if (!API_KEY) {
    console.error('[shopflo-checkout/token] SHOPFLO_API_KEY not configured');
    return res.status(500).json({ error: 'Shopflo Checkout not configured' });
  }

  const { sessionId, items, backUrl, successUrl } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items are required' });
  }

  // Our cart items already carry the correct per-unit price (resolved at
  // add-to-cart time from weight/variant selection) — no catalog lookup
  // needed here, since a custom-platform Token API call passes full item
  // details inline rather than referencing a pre-synced Shopflo catalog ID.
  const shopfloItems = items.map((item: any) => ({
    id: String(item.id),
    quantity: item.quantity,
    name: item.name,
    product_name: item.name,
    variant_name: String(item.variantName || ''),
    price: item.price,
    sku: String(item.id),
    product_id: String(item.productId),
    image: item.image,
    line_price: { sub_total: (item.price * item.quantity).toFixed(2) },
  }));

  const payload = {
    sf_session_id: sessionId,
    items: shopfloItems,
    // is_flash_redirect (per the integration setup doc's explicit note):
    // without it, Shopflo won't automatically send the browser to our
    // success_url after payment. Nested under layout.metadata since that's
    // the only "metadata" key shown in the doc's ui_config example — TODO:
    // confirm this placement with a real test order once Shopflo whitelists
    // this endpoint, in case it actually belongs one level up.
    ui_config: {
      layout: {
        available_elements: ['HEADER', 'ORDER_SUMMARY', 'COUPON_INPUT', 'COUPON_LIST'],
        metadata: { is_order_summary_open: true, is_flash_redirect: true },
      },
    },
    back_url: backUrl || 'https://amieshomemade.com/checkout',
    success_url: successUrl || 'https://amieshomemade.com/order-confirmed?checkout_id={checkout_id}&platform_order_id={platform_order_id}',
  };

  try {
    const shopfloRes = await fetch('https://api.shopflo.co/kratos/api/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
      body: JSON.stringify(payload),
    });
    const data = await shopfloRes.json();
    if (!shopfloRes.ok || !data?.success) {
      console.error('[shopflo-checkout/token] Shopflo returned an error:', shopfloRes.status, JSON.stringify(data));
      return res.status(502).json({ error: 'Shopflo Checkout rejected the request', details: data });
    }
    return res.status(200).json({ checkoutUrl: data?.data?.checkout_url, tokenId: data?.data?.token_id });
  } catch (err: any) {
    console.error('[shopflo-checkout/token] Request failed:', err.message);
    return res.status(500).json({ error: 'Failed to reach Shopflo Checkout' });
  }
}

// --- Order webhook helpers (mirrors api/notify-order.ts's pattern exactly) ---

const toHeaderSafe = (s: any) =>
  String(s ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\xFF]/g, '');

const NTFY_TOPIC = 'amies-homemade-9157537842';

const escapeHtml = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

function buildOrderEmailHtml(params: { orderId: string; name: string; itemsSummary: string; address: string; city: string; grandTotal: number }): string {
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
      <tr><td style="font-weight:bold;padding-top:8px;">Grand Total Paid</td><td align="right" style="font-weight:bold;padding-top:8px;color:#F04E4E;">Rs.${params.grandTotal}</td></tr>
    </table>
    <p style="color:#4A3728;font-size:13px;margin-top:20px;"><strong>Delivering to:</strong><br/>${escapeHtml(params.address)}, ${escapeHtml(params.city)}</p>
    <p style="color:#4A3728;font-size:13px;margin-top:20px;">Questions? Message us on WhatsApp: <a href="https://wa.me/919054038876" style="color:#F04E4E;">+91 90540 38876</a></p>
  </div>
</div>`.trim();
}

async function sendOrderConfirmationEmail(params: { to: string; orderId: string; name: string; itemsSummary: string; address: string; city: string; grandTotal: number }) {
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
    if (!res.ok) console.error(`[shopflo-checkout/order-webhook] Resend failed: ${res.status} ${await res.text().catch(() => '')}`);
  } catch (err: any) {
    console.error('[shopflo-checkout/order-webhook] Resend error:', err.message);
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
    if (!res.ok) console.error(`[shopflo-checkout/order-webhook] Meta CAPI failed: ${res.status} ${await res.text().catch(() => '')}`);
  } catch (err: any) {
    console.error('[shopflo-checkout/order-webhook] Meta CAPI error:', err.message);
  }
}

async function orderWebhook(req: any, res: any) {
  // Log every raw payload until we've confirmed the real field names against
  // a live order — Shopflo's own doc admits its sample is "a standard
  // example" and defers to a per-merchant orderapi.json we don't have
  // access to, so this is the same defensive posture used for Shiprocket's
  // webhook when its sample payload was similarly incomplete.
  console.log('[shopflo-checkout/order-webhook] raw payload:', JSON.stringify(req.body));

  const body = req.body || {};
  const shopfloOrderId = String(body.order_id || body.order_number || '');
  const orderId = `AM-SF${Date.now().toString().slice(-8)}`;
  const phone = body.customer?.phone || body.phone || '';
  const email = body.customer?.email || body.email || '';
  const name = body.customer?.name || body.name || 'Customer';
  const address = body.customer?.address || body.shipping_address?.address || body.address || '';
  const city = body.customer?.city || body.shipping_address?.city || body.city || '';
  const pincode = body.customer?.pincode || body.shipping_address?.pincode || body.pincode || '';
  const grandTotal = Number(body.amount || body.total || 0);
  const lineItems = body.line_items || [];

  if (!address || !city) {
    console.error('[shopflo-checkout/order-webhook] Missing shipping address fields in payload — check field names against a real webhook and adjust this handler.');
  }

  const itemsSummary = lineItems.map((item: any) =>
    `${item.quantity}x ${item.variant_id || item.name || 'item'}`
  ).join('\n');

  const successUrl = `https://amieshomemade.com/order-confirmed`;

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[shopflo-checkout/order-webhook] DATABASE_URL not set');
      // Still must return the required shape even when we can't log the order.
      return res.status(200).json({ success_url: successUrl, platform_order_id: orderId });
    }

    const sql = neon(dbUrl);
    const inserted = await sql`
      INSERT INTO orders (
        order_id, name, phone, email, city, address, items_summary,
        total_weight, subtotal, coupon_discount, shipping_fee, grand_total, payment_id, payment_method
      ) VALUES (
        ${orderId}, ${name}, ${phone}, ${email}, ${city}, ${address}, ${itemsSummary},
        0, ${grandTotal}, 0, 0, ${grandTotal}, ${shopfloOrderId || orderId}, 'SHOPFLO'
      )
      ON CONFLICT (payment_id) DO NOTHING
      RETURNING id
    `;

    if (inserted.length === 0) {
      console.log(`[shopflo-checkout/order-webhook] order ${shopfloOrderId} already logged`);
      return res.status(200).json({ success_url: successUrl, platform_order_id: orderId });
    }

    if (!isInternalTestPhone(phone)) {
      await sendMetaPurchaseBackstop({ eventId: `shopflo-${shopfloOrderId || orderId}`, value: grandTotal, name, phone, email, city });
    }

    try {
      const message = [
        `NEW ORDER (Shopflo Checkout): ${orderId}`,
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
      if (!ntfyRes.ok) console.error(`[shopflo-checkout/order-webhook] ntfy failed: ${ntfyRes.status}`);
    } catch (err: any) {
      console.error('[shopflo-checkout/order-webhook] ntfy error:', err.message);
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
        if (smsResult.return !== true) console.error('[shopflo-checkout/order-webhook] SMS failed:', JSON.stringify(smsResult));
      } catch (err: any) {
        console.error('[shopflo-checkout/order-webhook] SMS error:', err.message);
      }
    }

    if (email) {
      await sendOrderConfirmationEmail({ to: email, orderId, name, itemsSummary, address, city, grandTotal });
    }

    return res.status(200).json({ success_url: successUrl, platform_order_id: orderId });
  } catch (err: any) {
    console.error('[shopflo-checkout/order-webhook] Failed:', err.message);
    // Still return the required 200 shape — Shopflo needs success_url +
    // platform_order_id to finalize the order regardless of our own logging.
    return res.status(200).json({ success_url: successUrl, platform_order_id: orderId });
  }
}

export default async function handler(req: any, res: any) {
  const endpoint = String(req.query.endpoint || '');

  if (req.method === 'POST') {
    if (endpoint === 'token') return createToken(req, res);
    if (endpoint === 'order-webhook') return orderWebhook(req, res);
    return res.status(404).json({ error: 'Unknown endpoint' });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
