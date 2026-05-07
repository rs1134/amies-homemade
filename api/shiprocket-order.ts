export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    return res.status(500).json({ error: 'Shiprocket credentials not configured' });
  }

  try {
    // ── Step 1: Authenticate ─────────────────────────────────────────────────
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const auth = await authRes.json();
    if (!auth.token) {
      console.error('[shiprocket] Auth failed:', auth);
      return res.status(500).json({ error: 'Shiprocket authentication failed', details: auth });
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    };

    // ── Step 2: Create the COD order ─────────────────────────────────────────
    const {
      orderId, name, phone, email: custEmail,
      address, city, pincode, state,
      items, grandTotal, totalWeight,
    } = req.body;

    const weightKg = Math.max(0.5, totalWeight / 1000);

    const orderPayload = {
      order_id:               orderId,
      order_date:             new Date().toISOString().split('T')[0],
      pickup_location:        process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name:  name.split(' ')[0],
      billing_last_name:      name.split(' ').slice(1).join(' ') || '.',
      billing_address:        address,
      billing_city:           city,
      billing_pincode:        pincode,
      billing_state:          state || 'Gujarat',
      billing_country:        'India',
      billing_email:          custEmail || 'orders@amieshomemade.com',
      billing_phone:          phone.replace(/\D/g, '').slice(-10),
      shipping_is_billing:    true,
      order_items: items.map((item: any) => ({
        name:          `${item.name} (${item.selectedWeight || item.weight})`,
        sku:           item.id,
        units:         item.quantity,
        selling_price: item.price,
        discount:      0,
        tax:           0,
        hsn:           2106,
      })),
      payment_method: 'COD',
      sub_total:      grandTotal,
      length:         20,
      breadth:        15,
      height:         10,
      weight:         weightKg,
    };

    const orderRes  = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload),
    });
    const order = await orderRes.json();

    if (!order.order_id) {
      console.error('[shiprocket] Order creation failed:', order);
      return res.status(500).json({ error: 'Failed to create Shiprocket order', details: order });
    }

    const shipmentId = order.shipment_id;

    // ── Step 3: Auto-assign best courier ─────────────────────────────────────
    const pickupPin = process.env.SHIPROCKET_PICKUP_PINCODE || '380015';
    const svcRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPin}&delivery_postcode=${pincode}&weight=${weightKg}&cod=1`,
      { headers }
    );
    const svc = await svcRes.json();
    const courierId = svc.data?.available_courier_companies?.[0]?.courier_company_id;

    let awb: string | null = null;
    if (courierId && shipmentId) {
      const awbRes  = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
        method: 'POST',
        headers,
        body: JSON.stringify({ shipment_id: [shipmentId], courier_id: courierId }),
      });
      const awbData = await awbRes.json();
      if (awbData?.response?.data?.awb_assign_status === 1) {
        awb = awbData.response.data.awb_code;
      }
    }

    // ── Step 4: Schedule pickup ───────────────────────────────────────────────
    if (shipmentId) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pickupDate = tomorrow.toISOString().split('T')[0];
      await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', {
        method: 'POST',
        headers,
        body: JSON.stringify({ shipment_id: [shipmentId], pickup_date: [pickupDate] }),
      });
    }

    return res.status(200).json({
      success:          true,
      shiprocketOrderId: order.order_id,
      shipmentId,
      awb,
    });

  } catch (error: any) {
    console.error('[shiprocket-order] Unexpected error:', error);
    return res.status(500).json({ error: error.message || 'Shiprocket integration failed' });
  }
}
