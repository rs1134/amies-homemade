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

const NTFY_TOPIC = 'amies-homemade-9157537842';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    orderId, name, phone, city, address, email, itemsSummary,
    totalWeight, subtotal, shippingFee, grandTotal, paymentId, couponDiscount,
    paymentMethod,
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
    const message = [
      isCod ? `💰 CASH ON DELIVERY — COLLECT Rs.${grandTotal}` : `NEW ORDER: ${orderId}`,
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
      ...(couponDiscount > 0 ? [`Coupon (Thanks10): -Rs.${couponDiscount}`] : []),
      `Delivery: Rs.${shippingFee}`,
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
        const delivery = String(city).toLowerCase() === 'ahmedabad' ? '1 working day' : '3-5 business days';
        const smsText =
          `Amie's Homemade: Order ${orderId} confirmed! ` +
          `Amount: Rs.${grandTotal}${isCod ? ' (Cash on Delivery)' : ''}. ` +
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
          console.error('[notify-order] SMS failed:', JSON.stringify(smsResult));
        }
      } catch (smsErr: any) {
        console.error('[notify-order] SMS error:', smsErr.message);
      }
    }

    return res.status(200).json({ ok: true, isNew: true });
  } catch (err: any) {
    // Never block the order confirmation screen — the Razorpay webhook is
    // the durable fallback if this call fails for any reason.
    console.error('[notify-order] Failed:', err.message);
    return res.status(200).json({ ok: true, warning: 'log may be delayed, webhook will backfill' });
  }
}
