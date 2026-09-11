import { neon } from '@neondatabase/serverless';

// Two unrelated-but-tiny abandoned-cart operations sharing one file rather
// than a new function file — this project sits at Vercel Hobby's 12
// serverless-function cap (see git history for what happens past it).
//
// POST: called right after a successful order (COD or online) so the
// customer doesn't get an abandoned-cart reminder for something they
// already bought.
//
// GET: powers a manually-sent "you left this in your cart" recovery link
// (e.g. a WhatsApp message to a customer whose cart the reminder cron
// caught). Looked up by session_id (an unguessable UUID, not the row's
// sequential integer id) and returns ONLY items_summary — deliberately
// omitting name/phone/email/city, since this endpoint has no auth and a
// leaked/forwarded link should never expose another customer's PII.
export default async function handler(req: any, res: any) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(200).json({ ok: true, warning: 'no db configured' });
  const sql = neon(dbUrl);

  if (req.method === 'GET') {
    const sessionId = String(req.query.session || '');
    if (!sessionId) return res.status(400).json({ error: 'session is required' });
    try {
      const rows = await sql`SELECT items_summary FROM abandoned_carts WHERE session_id = ${sessionId} LIMIT 1`;
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ itemsSummary: rows[0].items_summary });
    } catch (err: any) {
      console.error('[abandoned-cart] GET failed:', err.message);
      return res.status(500).json({ error: 'Failed to look up cart' });
    }
  }

  if (req.method === 'POST') {
    const { sessionId } = req.body || {};
    if (!sessionId) {
      return res.status(200).json({ ok: true, skipped: true });
    }
    try {
      await sql`DELETE FROM abandoned_carts WHERE session_id = ${sessionId}`;
      return res.status(200).json({ ok: true });
    } catch (err: any) {
      console.error('[abandoned-cart] POST failed:', err.message);
      return res.status(200).json({ ok: false });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
