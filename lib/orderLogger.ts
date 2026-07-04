import { neon } from '@neondatabase/serverless';

// HTTP headers can only contain Latin-1 (ByteString) characters. Customer
// names/addresses can contain em-dashes, smart quotes, emoji, etc., which
// would otherwise throw and silently kill the whole notification.
const toHeaderSafe = (s: any) =>
  String(s ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x00-\xFF]/g, '');

export interface OrderDetails {
  orderId: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  itemsSummary: string;
  totalWeight: number;
  subtotal: number;
  couponDiscount?: number;
  shippingFee: number;
  grandTotal: number;
  paymentId: string;
}

const NTFY_TOPIC = 'amies-homemade-9157537842';

/**
 * Single source of truth for recording an order. Callable from both the
 * client-triggered checkout flow and the Razorpay webhook — whichever
 * reaches this first "wins" and sends the notification; the other is a
 * silent no-op thanks to the UNIQUE(payment_id) constraint. This makes
 * order notification independent of whether the customer's browser stays
 * open long enough to report the order itself.
 */
export async function logAndNotifyOrder(order: OrderDetails): Promise<{ isNew: boolean }> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('[orderLogger] DATABASE_URL not set — cannot dedupe, skipping');
    return { isNew: false };
  }

  const sql = neon(dbUrl);
  const inserted = await sql`
    INSERT INTO orders (
      order_id, name, phone, email, city, address, items_summary,
      total_weight, subtotal, coupon_discount, shipping_fee, grand_total, payment_id
    ) VALUES (
      ${order.orderId}, ${order.name}, ${order.phone}, ${order.email || ''}, ${order.city}, ${order.address}, ${order.itemsSummary},
      ${order.totalWeight}, ${order.subtotal}, ${order.couponDiscount || 0}, ${order.shippingFee}, ${order.grandTotal}, ${order.paymentId}
    )
    ON CONFLICT (payment_id) DO NOTHING
    RETURNING id
  `;

  const isNew = inserted.length > 0;
  if (!isNew) {
    console.log(`[orderLogger] payment ${order.paymentId} already logged — skipping duplicate notification`);
    return { isNew: false };
  }

  const message = [
    `NEW ORDER: ${order.orderId}`,
    `---------------------------`,
    `Customer: ${order.name}`,
    `Phone: ${order.phone}`,
    `City: ${order.city}`,
    `Address: ${order.address}`,
    `Email: ${order.email || 'N/A'}`,
    ``,
    `Weight: ${order.totalWeight}g`,
    `ITEMS:`,
    order.itemsSummary,
    ``,
    `Subtotal: Rs.${order.subtotal}`,
    ...(order.couponDiscount && order.couponDiscount > 0 ? [`Coupon (Thanks10): -Rs.${order.couponDiscount}`] : []),
    `Delivery: Rs.${order.shippingFee}`,
    `GRAND TOTAL: Rs.${order.grandTotal}`,
    `Payment Method: RAZORPAY`,
    `Payment ID: ${order.paymentId}`,
    `---------------------------`,
  ].join('\n');

  try {
    const ntfyRes = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: message,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Title': toHeaderSafe(`New Order: ${order.name} (Rs. ${order.grandTotal})`),
        'Priority': 'high',
        'Tags': 'shopping_cart,package,star',
      },
    });
    if (!ntfyRes.ok) {
      const errText = await ntfyRes.text().catch(() => 'unknown');
      console.error(`[orderLogger] ntfy failed: ${ntfyRes.status} - ${errText}`);
    }
  } catch (err: any) {
    console.error('[orderLogger] ntfy request failed:', err.message);
  }

  // ── Customer SMS via Fast2SMS ─────────────────────────────────────────────
  const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;
  if (FAST2SMS_KEY && order.phone) {
    try {
      const mobile = String(order.phone).replace(/[\s\-\(\)]/g, '').replace(/^\+?91/, '').slice(-10);
      const itemsShort = String(order.itemsSummary)
        .split('\n').map((l: string) => l.trim()).filter(Boolean).join(', ').slice(0, 80);
      const delivery = String(order.city).toLowerCase() === 'ahmedabad' ? '1 working day' : '3-5 business days';
      const smsText =
        `Amie's Homemade: Order ${order.orderId} confirmed! ` +
        `Amount: Rs.${order.grandTotal}. ` +
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
        console.error('[orderLogger] SMS failed:', JSON.stringify(smsResult));
      }
    } catch (smsErr: any) {
      console.error('[orderLogger] SMS error:', smsErr.message);
    }
  }

  return { isNew: true };
}
