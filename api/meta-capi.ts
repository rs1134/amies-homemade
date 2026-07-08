import crypto from 'crypto';

// ── Meta Conversions API — PII hashing per Meta's official spec ────────────
// https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
// Every customer-info field is lowercased + trimmed, then SHA-256 hashed
// before it ever leaves this function. Raw PII is never sent to Meta and
// never logged.
const sha256Hex = (s: string) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

const normEmail = (v: string) => v.trim().toLowerCase();

// Phone: strip everything but digits, keep the country code. Our numbers are
// Indian and stored inconsistently ("9925004388", "+91 91575 37842",
// "091575..."), so normalize to bare digits with a leading "91".
const normPhone = (v: string) => {
  let digits = v.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  else if (digits.length === 11 && digits.startsWith('0')) digits = '91' + digits.slice(1);
  return digits;
};

const normName = (v: string) => v.trim().toLowerCase();

// City/state/zip: lowercase, trim, strip whitespace and punctuation per
// Meta's normalization guidance for these fields.
const normLocation = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const hashField = (value: string | undefined, normalize: (v: string) => string): string | undefined => {
  if (!value) return undefined;
  const normalized = normalize(String(value));
  if (!normalized) return undefined;
  return sha256Hex(normalized);
};

export interface RawUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
}

function buildHashedUserData(raw: RawUserData): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const em = hashField(raw.email, normEmail);
  const ph = hashField(raw.phone, normPhone);
  const fn = hashField(raw.firstName, normName);
  const ln = hashField(raw.lastName, normName);
  const ct = hashField(raw.city, normLocation);
  const st = hashField(raw.state, normLocation);
  const zp = hashField(raw.zip, normLocation);
  if (em) out.em = [em];
  if (ph) out.ph = [ph];
  if (fn) out.fn = [fn];
  if (ln) out.ln = [ln];
  if (ct) out.ct = [ct];
  if (st) out.st = [st];
  if (zp) out.zp = [zp];
  return out;
}

/**
 * Sends one event to Meta's Conversions API. Reusable across endpoints —
 * duplicated (not imported) in notify-order.ts and razorpay-webhook.ts
 * because Vercel's per-function bundler doesn't reliably trace shared
 * modules outside each function's own file for this project's build setup.
 */
export async function sendMetaCapiEvent(params: {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  userData?: RawUserData;
  cookieHeader?: string;
  clientIp?: string;
  clientUserAgent?: string;
}): Promise<boolean> {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error('[meta-capi] META_PIXEL_ID / META_CAPI_ACCESS_TOKEN not configured');
    return false;
  }

  const cookieHeader = params.cookieHeader || '';
  const fbp = /(?:^|;\s*)_fbp=([^;]+)/.exec(cookieHeader)?.[1];
  const fbc = /(?:^|;\s*)_fbc=([^;]+)/.exec(cookieHeader)?.[1];

  const userData: Record<string, unknown> = buildHashedUserData(params.userData || {});
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent;

  // TEMPORARY — remove META_TEST_EVENT_CODE from Vercel env once events are
  // confirmed landing correctly in Meta's Test Events tab. Leaving this set
  // routes every event to the test stream instead of counting toward real
  // ad reporting.
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  const payload = {
    data: [{
      event_name: params.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      event_source_url: params.eventSourceUrl,
      action_source: 'website',
      user_data: userData,
      custom_data: params.customData || undefined,
    }],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[meta-capi] send failed for ${params.eventName}: ${res.status} ${text}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error(`[meta-capi] send error for ${params.eventName}:`, err.message);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event_name, event_id, event_source_url, custom_data, user_data } = req.body || {};
  if (!event_name || !event_id) {
    return res.status(400).json({ error: 'event_name and event_id are required' });
  }

  const clientIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress;

  const ok = await sendMetaCapiEvent({
    eventName: event_name,
    eventId: event_id,
    eventSourceUrl: event_source_url,
    customData: custom_data,
    userData: user_data,
    cookieHeader: req.headers['cookie'],
    clientIp,
    clientUserAgent: req.headers['user-agent'],
  });

  // Never let an analytics failure surface as an error to the client.
  return res.status(200).json({ ok });
}
