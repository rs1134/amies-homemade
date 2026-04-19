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
        'Title': `New Order: ${name} (Rs. ${grandTotal})`,
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
