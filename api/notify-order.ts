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
    `Delivery: Rs.${shippingFee}`,
    `GRAND TOTAL: Rs.${grandTotal}`,
    `Payment Method: RAZORPAY`,
    `Payment ID: ${paymentId}`,
    `---------------------------`,
  ].join('\n');

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #F04E4E; margin-bottom: 4px;">New Order Received!</h2>
      <p style="color: #888; margin-top: 0;">Order ID: <strong>${orderId}</strong></p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px 0; color: #555; width: 130px;">Customer</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;">Phone</td><td style="padding: 8px 0; font-weight: bold;">${phone}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;">City</td><td style="padding: 8px 0; font-weight: bold;">${city}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;">Address</td><td style="padding: 8px 0; font-weight: bold;">${address}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;">Email</td><td style="padding: 8px 0; font-weight: bold;">${email || 'N/A'}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;">Total Weight</td><td style="padding: 8px 0; font-weight: bold;">${totalWeight}g</td></tr>
      </table>

      <h3 style="color: #4A3728; border-top: 1px solid #eee; padding-top: 16px;">Items Ordered</h3>
      <pre style="background: #f9f9f9; padding: 16px; border-radius: 8px; font-size: 13px; line-height: 1.6;">${itemsSummary}</pre>

      <table style="width: 100%; margin-top: 16px;">
        <tr><td style="padding: 6px 0; color: #555;">Subtotal</td><td style="text-align: right;">Rs. ${subtotal}</td></tr>
        <tr><td style="padding: 6px 0; color: #555;">Delivery</td><td style="text-align: right;">Rs. ${shippingFee}</td></tr>
        <tr style="font-size: 18px; font-weight: bold; color: #F04E4E;">
          <td style="padding: 10px 0; border-top: 2px solid #eee;">Grand Total</td>
          <td style="text-align: right; border-top: 2px solid #eee;">Rs. ${grandTotal}</td>
        </tr>
      </table>

      <p style="color: #888; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
        Payment Method: Razorpay &nbsp;|&nbsp; Payment ID: ${paymentId}
      </p>
    </div>
  `;

  const results: Record<string, string> = {};

  // --- ntfy notification ---
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
      results.ntfy = `failed: ${ntfyRes.status}`;
    } else {
      console.log(`[notify-order] ntfy sent for order ${orderId}`);
      results.ntfy = 'ok';
    }
  } catch (err: any) {
    console.error('[notify-order] ntfy fetch error:', err.message);
    results.ntfy = `error: ${err.message}`;
  }

  // --- email via Resend ---
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: "Amie's Homemade Orders <orders@amieshomemade.com>",
          to: ['hello@amieshomemade.com'],
          subject: `New Order: ${name} — Rs.${grandTotal} (${orderId})`,
          text: message,
          html: emailHtml,
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.json().catch(() => ({}));
        console.error('[notify-order] Email failed:', err);
        results.email = `failed: ${JSON.stringify(err)}`;
      } else {
        console.log(`[notify-order] Email sent for order ${orderId}`);
        results.email = 'ok';
      }
    } catch (emailErr: any) {
      console.error('[notify-order] Email fetch error:', emailErr.message);
      results.email = `error: ${emailErr.message}`;
    }
  } else {
    console.warn('[notify-order] RESEND_API_KEY not set — email skipped');
    results.email = 'skipped: no api key';
  }

  return res.status(200).json({ ok: true, results });
}
