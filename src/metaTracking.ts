/**
 * Fires a Meta event on both the browser Pixel and server-side Conversions
 * API in parallel, sharing the same event_id so Meta deduplicates the pair
 * into a single event instead of double-counting.
 *
 * Raw PII (email/phone/name/etc) is sent to our own /api/meta-capi endpoint
 * over HTTPS — hashing happens server-side there, never in the browser and
 * never logged. This file never computes or sends a hash itself.
 */

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string;
}

export type MetaEventName = 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';

const genEventId = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// A persistent per-browser ID, generated once and reused for every event
// this visitor ever fires (PageView through Purchase). Meta flagged
// external_id coverage as low across the board — without this, there was
// no way for Meta to stitch together a visitor's PageView → AddToCart →
// Purchase journey except through the identifiers we happen to have at
// each individual step (which is sparse early in the funnel, before a
// customer has entered any contact info). Stored in localStorage, not a
// cookie, since it only needs to survive within this browser/device, not
// travel to the server on every request.
const EXTERNAL_ID_STORAGE_KEY = 'amie_ext_id';
const getOrCreateExternalId = (): string => {
  try {
    const existing = localStorage.getItem(EXTERNAL_ID_STORAGE_KEY);
    if (existing) return existing;
    const fresh = genEventId();
    localStorage.setItem(EXTERNAL_ID_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // localStorage blocked (private browsing, etc.) — fall back to a
    // per-call id rather than crashing; won't persist across events, but
    // degrades gracefully instead of breaking tracking entirely.
    return genEventId();
  }
};

/**
 * @param explicitEventId Pass a deterministic id (e.g. `purchase-${paymentId}`)
 * for events that may also be sent from a server-side backstop (Purchase, via
 * the Razorpay webhook) — so all sources of the same real-world event
 * dedupe into one on Meta's side. Omit for events with a single client-only
 * trigger (PageView, ViewContent, AddToCart, InitiateCheckout).
 */
export function trackMetaEvent(
  eventName: MetaEventName,
  opts: { customData?: Record<string, unknown>; userData?: MetaUserData } = {},
  explicitEventId?: string,
): string {
  const eventId = explicitEventId || genEventId();

  const fbq = (window as any).fbq;
  if (typeof fbq === 'function') {
    fbq('track', eventName, opts.customData || {}, { eventID: eventId });
  }

  // Fire-and-forget — analytics must never block or break the UX.
  fetch('/api/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      custom_data: opts.customData || {},
      user_data: { ...opts.userData, externalId: opts.userData?.externalId || getOrCreateExternalId() },
    }),
    keepalive: true,
  }).catch(() => { /* non-fatal */ });

  return eventId;
}
