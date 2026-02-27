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
      return res.status(502).json({ error: `ntfy error: ${ntfyRes.status}`, detail: errText });
    }

    console.log(`[notify-order] Sent successfully for order ${orderId}`);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[notify-order] fetch to ntfy failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
