import crypto from 'crypto';
import { variantShiprocketId } from '../src/shiprocketCatalog';

// Generates the checkout access token Shiprocket's hosted iframe needs to
// open — the one server-side hop in the flow, since it's the only place the
// secret key can be used safely (see "3. Checkout Initiation" in the
// integration guide). Frontend sends our own plain {productId, weight,
// quantity} — never the numeric Shiprocket ids directly — so the mapping
// table lives in exactly one place (src/shiprocketCatalog.ts) rather than
// being duplicated into client code too.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY;
  const SECRET_KEY = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;
  if (!API_KEY || !SECRET_KEY) {
    console.error('[shiprocket-access-token] API key/secret not configured');
    return res.status(500).json({ error: 'Shiprocket Checkout not configured' });
  }

  const { items, redirectUrl } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items are required' });
  }

  const mappedItems = items.map((item: any) => {
    const variantId = variantShiprocketId(item.productId, item.weight);
    return variantId !== undefined ? { variant_id: String(variantId), quantity: item.quantity } : null;
  });
  if (mappedItems.some((i: any) => i === null)) {
    console.error('[shiprocket-access-token] Could not map one or more cart items:', items);
    return res.status(400).json({ error: 'One or more items could not be mapped to Shiprocket catalog' });
  }

  const payload = {
    cart_data: { items: mappedItems },
    redirect_url: redirectUrl || 'https://amieshomemade.com/order-confirmed',
    timestamp: new Date().toISOString(),
  };
  const body = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(body).digest('base64');

  try {
    const shiprocketRes = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
        'X-Api-HMAC-SHA256': hmac,
      },
      body,
    });
    const data = await shiprocketRes.json();
    if (!shiprocketRes.ok) {
      console.error('[shiprocket-access-token] Shiprocket returned an error:', shiprocketRes.status, JSON.stringify(data));
      return res.status(502).json({ error: 'Shiprocket Checkout rejected the request', details: data });
    }
    return res.status(200).json({ token: data?.result?.token, orderId: data?.result?.order_id });
  } catch (err: any) {
    console.error('[shiprocket-access-token] Request failed:', err.message);
    return res.status(500).json({ error: 'Failed to reach Shiprocket Checkout' });
  }
}
