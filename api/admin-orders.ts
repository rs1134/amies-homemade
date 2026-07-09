import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_ORDERS_PASSWORD;
  const providedPassword = req.headers['x-admin-password'];

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_ORDERS_PASSWORD not configured on server' });
  }
  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: 'DATABASE_URL not configured on server' });
  }

  try {
    const sql = neon(dbUrl);
    const orders = await sql`
      SELECT id, created_at, order_id, name, phone, email, city, address,
             items_summary, total_weight, subtotal, coupon_discount,
             shipping_fee, grand_total, payment_id, payment_method
      FROM orders
      ORDER BY created_at DESC
      LIMIT 500
    `;
    return res.status(200).json({ orders });
  } catch (err: any) {
    console.error('[admin-orders] Query failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
