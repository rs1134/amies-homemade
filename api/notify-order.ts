import { neon } from '@neondatabase/serverless';

// HTTP headers can only contain Latin-1 (ByteString) characters. Customer
// names/addresses can contain em-dashes, smart quotes, emoji, etc., which
// would otherwise throw and silently kill the whole notification + DB log.
const toHeaderSafe = (s: any) =>
  String(s ?? '')
    .replace(/[–—]/g, '-')   // en/em dash → hyphen
    .replace(/[‘’]/g, "'")   // smart single quotes
    .replace(/[“”]/g, '"')   // smart double quotes
    .replace(/[^\x00-\xFF]/g, '');     // strip anything else non-Latin-1

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    orderId,
    name,
    phone,
    city,
    address,
    email,
    itemsSummary,
    totalWeight,
    subtotal,
    shippingFee,
    grandTotal,
    paymentId,
    couponDiscount,
  } = req.body;

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
    ...(couponDiscount > 0 ? [`Coupon (Thanks10): -Rs.${couponDiscount}`] : []),
    `Delivery: Rs.${shippingFee}`,
    `GRAND TOTAL: Rs.${grandTotal}`,
    `Payment Method: RAZORPAY`,
    `Payment ID: ${paymentId}`,
    `---------------------------`,
  ].join('\n');

  const NTFY_TOPIC = 'amies-homemade-9157537842';

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
      console.error(`[notify-order] ntfy failed: ${ntfyRes.status} - ${errText}`);
      return res.status(502).json({ error: `ntfy error: ${ntfyRes.status}` });
    }

    console.log(`[notify-order] Sent successfully for order ${orderId}`);

    // ── Log to Postgres (permanent order history, viewable on /admin) ──────────
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const sql = neon(dbUrl);
        await sql`
          INSERT INTO orders (
            order_id, name, phone, email, city, address, items_summary,
            total_weight, subtotal, coupon_discount, shipping_fee, grand_total, payment_id
          ) VALUES (
            ${orderId}, ${name}, ${phone}, ${email || ''}, ${city}, ${address}, ${itemsSummary},
            ${totalWeight}, ${subtotal}, ${couponDiscount || 0}, ${shippingFee}, ${grandTotal}, ${paymentId}
          )
        `;
        console.log(`[notify-order] Logged to database for order ${orderId}`);
      } else {
        console.log('[notify-order] DATABASE_URL not set — skipping order log');
      }
    } catch (dbErr: any) {
      // Never let a DB failure block the order confirmation
      console.error('[notify-order] Database log failed:', dbErr.message);
    }

    // ── Customer SMS via Fast2SMS ─────────────────────────────────────────────
    const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;
    if (FAST2SMS_KEY && phone) {
      try {
        // Normalise to 10-digit Indian mobile number
        const mobile = String(phone).replace(/[\s\-\(\)]/g, '').replace(/^\+?91/, '').slice(-10);

        // Keep items line short for SMS (≤160 chars total is ideal)
        const itemsShort = String(itemsSummary)
          .split('\n')
          .map((l: string) => l.trim())
          .filter(Boolean)
          .join(', ')
          .slice(0, 80);

        const delivery = String(city).toLowerCase() === 'ahmedabad' ? '1 working day' : '3-5 business days';

        const smsText =
          `Amie's Homemade: Order ${orderId} confirmed! ` +
          `Amount: Rs.${grandTotal}. ` +
          `Items: ${itemsShort}. ` +
          `Est. delivery: ${delivery}. ` +
          `Questions? WhatsApp +91 91575 37842`;

        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': FAST2SMS_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',          // Quick SMS — no DLT registration required
            message: smsText,
            language: 'english',
            flash: 0,
            numbers: mobile,
          }),
        });

        const smsResult = await smsRes.json() as any;
        if (smsResult.return === true) {
          console.log(`[notify-order] SMS sent to ${mobile} for order ${orderId}`);
        } else {
          console.error('[notify-order] SMS failed:', JSON.stringify(smsResult));
        }
      } catch (smsErr: any) {
        // Never let SMS failure affect the order response
        console.error('[notify-order] SMS error:', smsErr.message);
      }
    } else if (!FAST2SMS_KEY) {
      console.log('[notify-order] FAST2SMS_API_KEY not set — skipping SMS');
    }
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[notify-order] fetch to ntfy failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
