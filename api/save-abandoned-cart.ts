import { neon } from '@neondatabase/serverless';

// Called from the checkout page as the customer fills in their email and
// cart contents — lets the abandoned-cart cron (api/cron/send-abandoned-cart-reminders.ts)
// know what to remind them about if they leave without completing the order.
// Upserts on sessionId so repeated saves during one checkout attempt update
// the same row instead of creating duplicates.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, email, name, phone, city, itemsSummary, grandTotal, whatsappOptIn } = req.body || {};

  // Nothing worth reminding about without an email to send to or items in
  // the cart — silently no-op rather than erroring, since this fires
  // automatically as a side effect of normal typing.
  if (!sessionId || !email || !itemsSummary) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[save-abandoned-cart] DATABASE_URL not set');
      return res.status(200).json({ ok: true, warning: 'no db configured' });
    }

    const sql = neon(dbUrl);
    await sql`
      INSERT INTO abandoned_carts (session_id, email, name, phone, city, items_summary, grand_total, whatsapp_opt_in, updated_at)
      VALUES (${sessionId}, ${email}, ${name || ''}, ${phone || ''}, ${city || ''}, ${itemsSummary}, ${grandTotal || 0}, ${!!whatsappOptIn}, now())
      ON CONFLICT (session_id) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        phone = excluded.phone,
        city = excluded.city,
        items_summary = excluded.items_summary,
        grand_total = excluded.grand_total,
        whatsapp_opt_in = excluded.whatsapp_opt_in,
        updated_at = now(),
        reminder_sent_at = NULL,
        whatsapp_sent_at = NULL
    `;

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[save-abandoned-cart] Failed:', err.message);
    // Never let this block or break checkout — it's a background nicety.
    return res.status(200).json({ ok: false });
  }
}
