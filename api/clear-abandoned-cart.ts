import { neon } from '@neondatabase/serverless';

// Called right after a successful order (COD or online) so the customer
// doesn't get an abandoned-cart reminder for something they already bought.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body || {};
  if (!sessionId) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return res.status(200).json({ ok: true, warning: 'no db configured' });

    const sql = neon(dbUrl);
    await sql`DELETE FROM abandoned_carts WHERE session_id = ${sessionId}`;

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[clear-abandoned-cart] Failed:', err.message);
    return res.status(200).json({ ok: false });
  }
}
