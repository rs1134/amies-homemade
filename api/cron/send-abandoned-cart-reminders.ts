import { neon } from '@neondatabase/serverless';

// Runs once a day (see vercel.json crons — Vercel's free Hobby plan caps
// cron frequency at once/day; on Pro this could run every 15-30 min
// instead for a same-hour reminder). Finds carts that have sat untouched
// for 2+ hours with no reminder sent yet, emails a "you left something in
// your cart" nudge, and marks them so they're never emailed twice. Also
// sweeps out anything older than 3 days so the table doesn't grow
// unbounded with browsers that never come back.
const escapeHtml = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

function buildReminderEmailHtml(params: { name: string; itemsSummary: string; grandTotal: number }): string {
  const itemRows = params.itemsSummary.split('\n').filter(Boolean).map(line =>
    `<tr><td style="padding:6px 0;color:#4A3728;font-size:14px;">${escapeHtml(line)}</td></tr>`
  ).join('');
  const greetingName = params.name ? params.name.split(' ')[0] : 'there';

  return `
<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;background:#FFF8EE;">
  <div style="background:#F04E4E;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;font-size:22px;margin:0;">You left something behind!</h1>
  </div>
  <div style="padding:24px;">
    <p style="color:#4A3728;font-size:14px;">Hi ${escapeHtml(greetingName)},</p>
    <p style="color:#4A3728;font-size:14px;">Your cart at Amie's Homemade is still waiting for you:</p>
    <table width="100%" style="border-top:1px solid #4A372820;border-bottom:1px solid #4A372820;margin:16px 0;">
      ${itemRows}
    </table>
    <table width="100%" style="font-size:14px;color:#4A3728;">
      <tr><td style="font-weight:bold;padding-top:8px;">Total</td><td align="right" style="font-weight:bold;padding-top:8px;color:#F04E4E;">Rs.${params.grandTotal}</td></tr>
    </table>
    <div style="text-align:center;margin-top:28px;">
      <a href="https://amieshomemade.com/checkout" style="display:inline-block;background:#F04E4E;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Complete Your Order</a>
    </div>
    <p style="color:#4A3728;font-size:13px;margin-top:24px;">Questions? Message us on WhatsApp: <a href="https://wa.me/919054038876" style="color:#F04E4E;">+91 90540 38876</a></p>
  </div>
</div>`.trim();
}

// WhatsApp reminder via AiSensy — fires for every abandoned cart with a
// phone number (no separate opt-in checkbox; removed per owner's call to
// prioritize reach over the stricter consent Meta's policy recommends for
// proactive "Marketing" templates).
// AISENSY_CAMPAIGN_NAME must match a template you've created and had
// approved in the AiSensy dashboard — this code sends whatever params that
// template expects, in the order below (name, item summary, total). If the
// approved template's placeholder count/order differs, update templateParams
// to match. Silently no-ops if AiSensy isn't configured yet, same pattern
// as the email path when RESEND_API_KEY is missing.
async function sendReminderWhatsApp(phone: string, name: string, itemsSummary: string, grandTotal: number): Promise<boolean> {
  const API_KEY = process.env.AISENSY_API_KEY;
  const CAMPAIGN_NAME = process.env.AISENSY_CAMPAIGN_NAME;
  if (!API_KEY || !CAMPAIGN_NAME || !phone) return false;

  // Normalize to bare digits with a leading country code, same convention
  // used elsewhere in this codebase (api/meta-capi.ts normPhone) — AiSensy
  // expects destination numbers with country code, no '+' or spaces.
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  else if (digits.length === 11 && digits.startsWith('0')) digits = '91' + digits.slice(1);

  const greetingName = name ? name.split(' ')[0] : 'there';
  const itemsShort = itemsSummary.split('\n').filter(Boolean).join(', ').slice(0, 200);

  try {
    const res = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        campaignName: CAMPAIGN_NAME,
        destination: digits,
        userName: greetingName,
        templateParams: [greetingName, itemsShort, `Rs.${grandTotal}`],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[abandoned-cart-cron] AiSensy failed for ${digits}: ${res.status} ${text}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[abandoned-cart-cron] AiSensy error for ${digits}:`, err.message);
    return false;
  }
}

async function sendReminderEmail(to: string, name: string, itemsSummary: string, grandTotal: number): Promise<boolean> {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: "Amie's Homemade <hello@amieshomemade.com>",
        to,
        subject: "You left something in your cart! | Amie's Homemade",
        html: buildReminderEmailHtml({ name, itemsSummary, grandTotal }),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[abandoned-cart-cron] Resend failed for ${to}: ${res.status} ${text}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[abandoned-cart-cron] Resend error for ${to}:`, err.message);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  // Vercel signs cron-triggered requests with this header when CRON_SECRET
  // is set — rejects anyone else from hitting this endpoint and spamming
  // customers with reminder emails on demand.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('[abandoned-cart-cron] DATABASE_URL not set');
    return res.status(200).json({ ok: true, warning: 'no db configured' });
  }

  try {
    const sql = neon(dbUrl);

    const due = await sql`
      SELECT id, email, name, phone, items_summary, grand_total, whatsapp_opt_in
      FROM abandoned_carts
      WHERE reminder_sent_at IS NULL
        AND updated_at < now() - interval '2 hours'
    `;

    let sent = 0;
    let whatsappSent = 0;
    for (const cart of due) {
      const ok = await sendReminderEmail(cart.email, cart.name, cart.items_summary, cart.grand_total);
      if (ok) {
        await sql`UPDATE abandoned_carts SET reminder_sent_at = now() WHERE id = ${cart.id}`;
        sent++;
      }
      if (cart.whatsapp_opt_in) {
        const waOk = await sendReminderWhatsApp(cart.phone, cart.name, cart.items_summary, cart.grand_total);
        if (waOk) {
          await sql`UPDATE abandoned_carts SET whatsapp_sent_at = now() WHERE id = ${cart.id}`;
          whatsappSent++;
        }
      }
    }

    // Housekeeping — stale rows (reminded or not) past 3 days serve no
    // purpose and would otherwise accumulate forever.
    await sql`DELETE FROM abandoned_carts WHERE updated_at < now() - interval '3 days'`;

    // Records that this run actually happened — Vercel's Hobby plan log
    // retention is too short to check execution history after more than
    // ~30 minutes, so this is the only reliable way to confirm the cron
    // fired on a given day without paying for Pro's longer log retention.
    await sql`INSERT INTO cron_runs (job_name, checked, sent) VALUES ('send-abandoned-cart-reminders', ${due.length}, ${sent})`;

    return res.status(200).json({ ok: true, checked: due.length, sent, whatsappSent });
  } catch (err: any) {
    console.error('[abandoned-cart-cron] Failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
