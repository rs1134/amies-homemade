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
}

export type MetaEventName = 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';

const genEventId = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
      user_data: opts.userData || {},
    }),
    keepalive: true,
  }).catch(() => { /* non-fatal */ });

  return eventId;
}
