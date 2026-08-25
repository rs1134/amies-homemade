import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Truck, Wallet, ChevronRight, ChevronLeft, Smartphone, Loader2, MessageCircle, CheckCircle, MapPin, Calendar, Building2, Minus, Plus, Trash2, Scale, Search, Banknote, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types.ts';
import { WHATSAPP_NUMBER } from '../constants.ts';
import { trackMetaEvent } from '../metaTracking.ts';

const COUPON_STORAGE_KEY = 'thanks10_used_phones';

// Persists in-progress checkout details across reloads/tab-restarts — mobile
// browsers routinely discard and reload a backgrounded tab under memory
// pressure, which was silently wiping everything a customer had typed.
// Expires after a day so a stale draft doesn't linger on a shared device.
const DRAFT_STORAGE_KEY = 'amie_checkout_draft_v1';
// Long-lived on purpose: this draft also prefills a repeat customer's next
// order (name/address/phone/email), not just an in-progress checkout, so it
// needs to survive weeks between orders, not just a same-day reload.
const DRAFT_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

interface CheckoutDraft {
  formData: { name: string; phone: string; email: string; city: string; state: string; address: string; flat: string; pincode: string };
  addressQuery: string;
  addressConfirmed: boolean;
  checkoutStep: 'address' | 'details' | 'summary';
  pinLocation: { lat: number; lng: number } | null;
  savedAt: number;
}

const loadCheckoutDraft = (): CheckoutDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft: CheckoutDraft = JSON.parse(raw);
    if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
};

// Identifies one checkout attempt for the abandoned-cart reminder emails
// (api/save-abandoned-cart.ts / api/cron/send-abandoned-cart-reminders.ts).
// Reset after a successful order so the next cart this browser starts is a
// fresh attempt, not treated as a continuation of one that already
// converted.
const CART_SESSION_KEY = 'amie_cart_session_id';
const getOrCreateCartSessionId = (): string => {
  try {
    const existing = localStorage.getItem(CART_SESSION_KEY);
    if (existing) return existing;
    const fresh = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CART_SESSION_KEY, fresh);
    return fresh;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};
const resetCartSessionId = () => {
  try { localStorage.removeItem(CART_SESSION_KEY); } catch { /* non-fatal */ }
};

interface CheckoutViewProps {
  items: CartItem[];
  onComplete: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  total: number;
  couponApplied?: boolean;
  onShopClick?: () => void;
  onOrderPlaced?: () => void;
}

type FieldName = 'name' | 'phone' | 'email' | 'city' | 'state' | 'address' | 'flat' | 'pincode';

interface OrderSnapshot {
  items: CartItem[];
  total: number;
  couponDiscount: number;
  shippingFee: number;
  codFee: number;
  grandTotal: number;
  city: string;
  address: string;
  isAhmedabad: boolean;
  paymentMethod: 'online' | 'cod';
  email: string;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ items, onComplete, onUpdateQuantity, onRemove, total, couponApplied = false, onShopClick, onOrderPlaced }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  // Snapshot of the order taken the instant payment succeeds, so the success
  // screen can render correct details even after the live cart is cleared.
  const [orderSnapshot, setOrderSnapshot] = useState<OrderSnapshot | null>(null);

  // Discount is always 10% of the CURRENT cart — recomputed live, so changing
  // quantities at checkout can never desync it from the items shown.
  const couponDiscount = couponApplied ? Math.round(total * 0.1) : 0;

  // Loaded once and reused for every field below, rather than re-reading
  // localStorage per-field, so they all hydrate from the exact same draft.
  const initialDraft = useRef(loadCheckoutDraft()).current;

  const [formData, setFormData] = useState(initialDraft?.formData || {
    name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    address: '',
    flat: '',
    pincode: '',
    gender: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const formRef = useRef<HTMLDivElement>(null);

  // Fire once when the checkout page is actually reached with items in cart.
  useEffect(() => {
    if (items.length === 0) return;
    trackMetaEvent('InitiateCheckout', {
      customData: {
        value: total,
        currency: 'INR',
        content_ids: items.map(i => i.id),
        content_type: 'product',
        num_items: items.reduce((sum, i) => sum + i.quantity, 0),
      },
      userData: { country: 'in' },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removing the last item mid-checkout swaps this whole view for the much
  // shorter "empty bag" card below. If the customer was scrolled down into
  // the form, the browser clamps that same scroll position to the new
  // (shorter) page height instead of resetting it — visually landing on the
  // footer instead of the empty-bag message. Snap back to the top whenever
  // the cart empties out from here.
  useEffect(() => {
    if (items.length === 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [items.length]);

  // ── Address autocomplete (new Places API — the legacy Autocomplete widget is
  //    not available to API keys created after March 2025, so we fetch
  //    suggestions ourselves and render a custom branded dropdown) ────────────
  const [addressQuery, setAddressQuery] = useState(initialDraft?.addressQuery || '');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; main: string; secondary: string; prediction: any }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Collapses the address field to a compact confirmed summary right after
  // autocomplete fills it in, instead of showing the same address twice.
  const [addressConfirmed, setAddressConfirmed] = useState(initialDraft?.addressConfirmed || false);
  // Mobile-only step wizard (Address -> Details -> Payment & Summary) so the
  // whole form isn't one long scroll on a small screen. Desktop keeps the
  // existing single-page layout unchanged — every step's content is always
  // visible there via `lg:block` overriding the mobile step-gated `hidden`,
  // so this never removes anything from the desktop DOM/behavior.
  type CheckoutStep = 'address' | 'details' | 'summary';
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(initialDraft?.checkoutStep || 'address');
  const placesLibRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Exact delivery pin — set from the geocoded location of whatever address
  // suggestion was picked. Shown as a fixed confirmation pin (not draggable)
  // so it reads as "this is where you'll be delivered", not something
  // uncertain the customer needs to fix themselves. Threaded through to the
  // delivery team as extra precision alongside the text address.
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(initialDraft?.pinLocation || null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Save the in-progress draft on every change so a reload/tab-restart
  // restores it (see loadCheckoutDraft above). Refreshed (not cleared) on
  // successful order placement further down, so it also prefills next time.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        formData, addressQuery, addressConfirmed, checkoutStep, pinLocation, savedAt: Date.now(),
      }));
    } catch { /* storage full or blocked — non-fatal, just won't persist */ }
  }, [formData, addressQuery, addressConfirmed, checkoutStep, pinLocation]);

  // iOS Safari doesn't reposition `fixed` elements above the on-screen
  // keyboard — the sticky mobile pay bar ends up floating in the middle of
  // the screen instead of sitting below the keyboard. Hiding it while a text
  // field is focused (debounced so tabbing between fields doesn't flicker
  // it) sidesteps the issue entirely.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const keyboardCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTextEntryElement = (el: EventTarget | null) => {
    const tag = (el as HTMLElement)?.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA';
  };
  // This whole compact-layout-for-keyboard behavior only makes sense on
  // touch devices with an actual on-screen keyboard to make room for —
  // on desktop (mouse/trackpad, no keyboard overlay) it was firing on
  // every click into any field, shrinking and re-expanding the whole form
  // for no reason and making the page visibly jiggle.
  const isTouchDevice = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const handleFormFocus = (e: React.FocusEvent) => {
    if (!isTextEntryElement(e.target) || !isTouchDevice()) return;
    if (keyboardCloseTimer.current) clearTimeout(keyboardCloseTimer.current);
    setKeyboardOpen(true);
    // Give the on-screen keyboard's slide-up animation time to finish before
    // scrolling — doing it immediately measures the pre-keyboard layout and
    // ends up positioning the field wrong. Centering (instead of the
    // browser's default "nearest edge") keeps the field comfortably clear
    // of both the header above and the keyboard below.
    const target = e.target as HTMLElement;
    setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  };
  const handleFormBlur = (e: React.FocusEvent) => {
    if (!isTextEntryElement(e.target) || !isTouchDevice()) return;
    keyboardCloseTimer.current = setTimeout(() => setKeyboardOpen(false), 100);
  };

  // Enter-to-advance — the mobile keyboard shows "Next" (via enterKeyHint)
  // instead of "Return", and this actually moves focus forward, so
  // customers can fill the whole form without ever tapping a field
  // directly. Addresses here are a single line in practice, so Enter
  // advances there too rather than inserting a newline.
  const FIELD_ADVANCE_ORDER: FieldName[] = ['address', 'city', 'state', 'flat', 'pincode', 'name', 'phone', 'email'];
  const handleAdvanceOnEnter = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const idx = FIELD_ADVANCE_ORDER.indexOf(e.currentTarget.name as FieldName);
    const nextName = idx >= 0 ? FIELD_ADVANCE_ORDER[idx + 1] : undefined;
    if (nextName) {
      document.querySelector<HTMLElement>(`[name="${nextName}"]`)?.focus();
    } else {
      e.currentTarget.blur(); // last field — dismiss the keyboard
    }
  };

  // Real layout shrink (not a CSS zoom/transform trick, which breaks touch
  // hit-testing) while the on-screen keyboard is up — smaller field padding
  // and tighter spacing between fields means more of the form stays visible
  // above the keyboard instead of being pushed below the fold.
  // Tighter by default on mobile (where each step needs to fit on one
  // screen without scrolling), full spacing restored at lg.
  const fieldPad = keyboardOpen ? 'p-2.5' : 'p-3 lg:p-3.5';
  const fieldGap = keyboardOpen ? 'space-y-2' : 'space-y-2 lg:space-y-4';

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return;

    const init = async () => {
      try {
        const lib = await (window as any).google.maps.importLibrary('places');
        placesLibRef.current = lib;
        sessionTokenRef.current = new lib.AutocompleteSessionToken();
      } catch (e) {
        console.error('Google Places failed to initialise:', e);
      }
    };

    if ((window as any).google?.maps?.importLibrary) {
      init();
      return;
    }
    // With loading=async the API isn't ready at script.onload — Google calls
    // the global callback once importLibrary is actually available.
    (window as any).__amiePlacesReady = init;
    const existing = document.getElementById('google-maps-script');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async&callback=__amiePlacesReady`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Guards against a slower, older search response landing after a newer
  // one — without this, a customer who types, pauses, then keeps typing
  // before the first search finishes could see a stale suggestion list
  // that doesn't match what's currently in the box, and tap the wrong
  // (older) result without realizing it.
  const latestRequestIdRef = useRef(0);

  const fetchSuggestions = (input: string) => {
    const lib = placesLibRef.current;
    if (!lib?.AutocompleteSuggestion || input.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const requestId = ++latestRequestIdRef.current;
    lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken: sessionTokenRef.current,
      includedRegionCodes: ['in'],
      // Bias towards Ahmedabad without excluding the rest of India
      locationBias: { north: 23.15, south: 22.90, east: 72.75, west: 72.45 },
    }).then(({ suggestions: sugs }: any) => {
      if (requestId !== latestRequestIdRef.current) return; // a newer search has since fired — discard this stale response
      setSuggestions((sugs || []).slice(0, 5).map((s: any) => ({
        id: s.placePrediction.placeId,
        main: s.placePrediction.mainText?.text ?? s.placePrediction.text?.text ?? '',
        secondary: s.placePrediction.secondaryText?.text ?? '',
        prediction: s.placePrediction,
      })));
      setShowSuggestions(true);
    }).catch((e: any) => {
      if (requestId !== latestRequestIdRef.current) return;
      console.error('Address suggestions failed:', e);
      setSuggestions([]);
    });
  };

  const selectSuggestion = async (sug: { id: string; main: string; secondary: string; prediction: any }) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setAddressQuery(sug.main);
    // Selecting a suggestion uses onMouseDown+preventDefault (so the tap
    // registers before the input's own blur closes the dropdown first) —
    // but that same preventDefault also stops the browser's default blur,
    // so the on-screen keyboard was staying open after a pick. Blur it
    // explicitly instead.
    addressInputRef.current?.blur();
    try {
      const place = sug.prediction.toPlace();
      await place.fetchFields({ fields: ['addressComponents', 'formattedAddress', 'displayName', 'location'] });
      if (place.location) {
        setPinLocation({ lat: place.location.lat(), lng: place.location.lng() });
      }
      let streetNumber = '', route = '', sublocality = '', city = '', pincode = '', state = '';
      (place.addressComponents || []).forEach((c: any) => {
        const types: string[] = c.types || [];
        if (types.includes('street_number'))              streetNumber = c.longText;
        if (types.includes('route'))                      route = c.longText;
        if (types.includes('sublocality_level_1'))         sublocality = c.longText;
        if (types.includes('locality'))                    city = c.longText;
        if (types.includes('postal_code'))                 pincode = c.longText;
        if (types.includes('administrative_area_level_1')) state = c.longText;
      });
      const namePart = place.displayName && !route.includes(place.displayName) ? place.displayName : '';
      const addressParts = [namePart, streetNumber, route, sublocality].filter(Boolean);
      const address = addressParts.length > 0 ? addressParts.join(', ') : (place.formattedAddress || sug.main);
      setFormData(prev => ({ ...prev, address, city: city || prev.city, state: state || prev.state, pincode: pincode || prev.pincode }));
      setTouched(prev => ({ ...prev, address: true, city: true, ...(state ? { state: true } : {}), ...(pincode ? { pincode: true } : {}) }));
      setFieldErrors(prev => ({ ...prev, address: '', city: '', ...(state ? { state: '' } : {}), ...(pincode ? { pincode: '' } : {}) }));
      setAddressConfirmed(true);
    } catch {
      // Place details unavailable — still fill in what the suggestion showed
      const fallback = sug.secondary ? `${sug.main}, ${sug.secondary}` : sug.main;
      setFormData(prev => ({ ...prev, address: fallback }));
      setTouched(prev => ({ ...prev, address: true }));
      setAddressConfirmed(true);
    }
    // New session token for the next search (billing best practice)
    if (placesLibRef.current) sessionTokenRef.current = new placesLibRef.current.AutocompleteSessionToken();
  };

  // Renders (or re-centers) the pin-confirmation map once a location is
  // known and its container is mounted. Classic Marker (not Advanced
  // Marker) deliberately — it doesn't need a Map ID, and the base Maps JS
  // script is already loaded for Places above.
  useEffect(() => {
    if (!pinLocation || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google?.maps?.importLibrary) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(pinLocation);
      markerRef.current?.setPosition(pinLocation);
      return;
    }

    // loading=async only bootstraps the loader — google.maps.Map/Marker
    // aren't guaranteed to exist until their library is explicitly imported.
    google.maps.importLibrary('maps').then(({ Map }: any) => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      mapInstanceRef.current = new Map(mapContainerRef.current, {
        center: pinLocation,
        zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      });
      markerRef.current = new google.maps.Marker({
        position: pinLocation,
        map: mapInstanceRef.current,
      });
    }).catch((e: any) => console.error('Failed to load Maps library:', e));
  }, [pinLocation]);

  // Accept common spellings/variants of Ahmedabad (Gujarati: Amdavad)
  const AHMEDABAD_VARIANTS = ['ahmedabad', 'amdavad', 'amdaavad', 'ahmadabad', 'ahemdabad', 'ahembdabad'];
  const isAhmedabad = AHMEDABAD_VARIANTS.includes(formData.city.trim().toLowerCase());

  // COD is strictly Ahmedabad-only — if the customer edits the city away
  // from Ahmedabad after selecting COD, silently fall back to online
  // payment rather than letting a non-Ahmedabad COD order slip through.
  useEffect(() => {
    if (!isAhmedabad && paymentMethod === 'cod') setPaymentMethod('online');
  }, [isAhmedabad, paymentMethod]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim() || value.trim().length < 3 || !/^[a-zA-Z\s]+$/.test(value))
          return "Please enter a valid full name";
        return "";
      case 'phone': {
        const sanitized = value.trim().replace(/[\s-]/g, '');
        if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(sanitized))
          return "Please enter a valid 10-digit Indian mobile number";
        return "";
      }
      case 'city':
        if (value.trim().length < 3 || !/^[a-zA-Z\s]+$/.test(value))
          return "Please enter a valid city name";
        return "";
      case 'state':
        if (value.trim().length < 3 || !/^[a-zA-Z\s]+$/.test(value))
          return "Please enter a valid state name";
        return "";
      case 'email':
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return "";
      case 'address':
        if (!value.trim()) return "Full address is required";
        return "";
      case 'flat':
        if (!value.trim()) return "Flat / House number is required";
        return "";
      case 'pincode':
        if (!/^[1-9]\d{5}$/.test(value.trim())) return "Please enter a valid 6-digit pincode";
        return "";
      default:
        return "";
    }
  };

  // Validates just the fields relevant to the mobile step being left,
  // blocking advance (and scrolling to the first error) if any fail.
  // handleProceed still re-validates everything at final submit regardless
  // — this is purely a step-local UX gate, not the source of truth.
  const validateStepFields = (fields: FieldName[]): boolean => {
    const newErrors: Partial<Record<FieldName, string>> = {};
    let firstErrorField: FieldName | null = null;
    fields.forEach(name => {
      const error = validateField(name, formData[name as keyof typeof formData]);
      if (error) { newErrors[name] = error; if (!firstErrorField) firstErrorField = name; }
    });
    setFieldErrors(prev => ({ ...prev, ...newErrors }));
    setTouched(prev => ({ ...prev, ...fields.reduce((acc, name) => ({ ...acc, [name]: true }), {}) }));
    if (firstErrorField) {
      document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const goToDetailsStep = () => {
    if (!validateStepFields(['address'])) return;
    setCheckoutStep('details');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  };

  const goToSummaryStep = () => {
    if (!validateStepFields(['name', 'phone', 'city', 'state', 'flat', 'pincode'])) return;
    setCheckoutStep('summary');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  };

  const goToPreviousStep = () => {
    setCheckoutStep(prev => prev === 'summary' ? 'details' : 'address');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name as FieldName]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Calculate total weight in grams
  const totalWeight = useMemo(() => {
    return items.reduce((sum, item) => {
      let weightInGrams = 250;
      const weightStr = (item.selectedWeight || item.weight).toUpperCase();
      if (weightStr.includes('KG')) weightInGrams = parseFloat(weightStr) * 1000;
      else if (weightStr.includes('G')) weightInGrams = parseFloat(weightStr);
      else if (weightStr.includes('LARGE HAMPER')) weightInGrams = 2500;
      else if (weightStr.includes('MEDIUM BOX')) weightInGrams = 1200;
      else if (weightStr.includes('GIFT BOX')) weightInGrams = 800;
      return sum + (weightInGrams * item.quantity);
    }, 0);
  }, [items]);

  // Shipping Fee — Ahmedabad: always FREE
  // Pan-India: under 300g total → ₹60 flat (cheap to pack & ship, and based
  // on actual weight rather than item count so it can't be gamed by
  // splitting one order into several single-item ones) | otherwise ₹999+
  // (after coupon) → FREE | else ₹100
  const subtotalAfterDiscount = total - couponDiscount;
  const isLightOrder = totalWeight < 300;
  const shippingFee = useMemo(() => {
    if (!formData.city || validateField('city', formData.city)) return null;
    if (AHMEDABAD_VARIANTS.includes(formData.city.trim().toLowerCase())) return 0;
    if (isLightOrder) return 60;
    if (subtotalAfterDiscount >= 999) return 0;
    return 100;
  }, [formData.city, isLightOrder, subtotalAfterDiscount]);

  // Amount needed to unlock free shipping (pan-India). Deliberately not
  // gated on isLightOrder — customers just see "add ₹X for free shipping"
  // regardless of which fee tier they're currently in; the weight-based
  // ₹60 rate is an internal pricing detail, not something to explain in
  // the UI.
  const amountToFreeShipping = useMemo(() => {
    if (isAhmedabad) return 0;
    return Math.max(0, 999 - subtotalAfterDiscount);
  }, [isAhmedabad, subtotalAfterDiscount]);

  // Flat convenience fee for Cash on Delivery — covers the extra handling
  // cost of collecting cash at the doorstep vs. prepaid online orders.
  const codFee = paymentMethod === 'cod' ? 50 : 0;

  const grandTotal = total - couponDiscount + (shippingFee || 0) + codFee;
  // MRP = price before the site-wide 10% discount, backed out the same way
  // ProductCard/Cart compute it, so the "You saved" figure here matches.
  const mrpTotal = items.reduce((sum, item) => sum + (Math.ceil(item.price / 0.9 / 5) * 5) * item.quantity, 0);

  // Abandoned-cart reminder: once there's a valid email and items in the
  // cart, keep the server's record of "what to remind them about" in sync
  // as they keep editing — debounced so it's one save per pause in typing,
  // not one per keystroke. If they complete the order, this row gets
  // deleted via clearAbandonedCart() instead of ever being emailed.
  const abandonedCartDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isSuccess || items.length === 0 || !formData.email || validateField('email', formData.email)) return;
    if (abandonedCartDebounceRef.current) clearTimeout(abandonedCartDebounceRef.current);
    abandonedCartDebounceRef.current = setTimeout(() => {
      const itemsSummary = items.map(i => `${i.quantity}x ${i.name} (${i.selectedWeight || i.weight})`).join('\n');
      fetch('/api/save-abandoned-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getOrCreateCartSessionId(),
          email: formData.email, name: formData.name, phone: formData.phone, city: formData.city,
          itemsSummary, grandTotal, whatsappOptIn: true,
        }),
      }).catch(() => { /* non-fatal — background nicety, never blocks checkout */ });
    }, 2000);
    return () => { if (abandonedCartDebounceRef.current) clearTimeout(abandonedCartDebounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, formData.name, formData.phone, formData.city, items, grandTotal, isSuccess]);

  // `paymentId` is the Razorpay payment id for online orders, or a synthetic
  // `COD-<orderId>` marker for cash-on-delivery orders (the orders table
  // has a UNIQUE constraint on payment_id for de-duplication, so COD orders
  // still need a unique value there even though no real payment happened).
  const submitOrderSilently = async (id: string, method: 'online' | 'cod'): Promise<string> => {
    setIsSubmitting(true);
    const orderId = `AM-${Math.floor(Math.random() * 90000 + 10000)}`;
    const isCod = method === 'cod';
    // Timestamp suffix guarantees uniqueness against the orders.payment_id
    // UNIQUE constraint — orderId alone is only a 5-digit random number, so
    // two different COD orders could otherwise collide and the second would
    // silently get dropped as a "duplicate" by the ON CONFLICT DO NOTHING.
    const paymentIdForOrder = isCod ? `COD-${orderId}-${Date.now()}` : id;

    const itemsSummary = items.map(i =>
      `${i.quantity}x ${i.name} (${i.selectedWeight || i.weight})`
    ).join('\n');

    const whatsappMessage = encodeURIComponent(`
*New Order from Amie's Homemade*
---------------------------
*Order ID:* ${orderId}
${isCod ? '' : `*Payment ID:* ${id}\n`}*Customer:* ${formData.name}${formData.gender ? ` (${formData.gender})` : ''}
*Phone:* ${formData.phone}
*City:* ${formData.city}
*Address:* ${fullDeliveryAddress}
*Pincode:* ${formData.pincode}

*Items:*
${itemsSummary}

*Total Amount:* Rs.${grandTotal}${couponDiscount > 0 ? `\n*Coupon Applied:* Thanks10 (− Rs.${couponDiscount})` : ''}${isCod ? `\n*COD Convenience Fee:* Rs.${codFee}` : ''}
*Payment:* ${isCod ? 'CASH ON DELIVERY' : 'ONLINE (RAZORPAY)'}
---------------------------
_Please confirm my order and share delivery details._
    `.trim());

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${whatsappMessage}`;

    try {
      const res = await fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId, name: formData.name, phone: formData.phone,
          city: formData.city, address: fullDeliveryAddress, pincode: formData.pincode, email: formData.email,
          itemsSummary, totalWeight, subtotal: total,
          shippingFee: shippingFee ?? 0, codFee, grandTotal, paymentId: paymentIdForOrder,
          paymentMethod: isCod ? 'COD' : 'RAZORPAY',
          mapPin: pinLocation ? `${pinLocation.lat},${pinLocation.lng}` : '',
          gender: formData.gender || '',
        }),
        // Survives the page navigating/backgrounding right after this call
        // fires — the same protection already used on the Meta CAPI Purchase
        // fetch, since this request faces the exact same risk (customer
        // switches to their UPI app to confirm payment, or closes the tab,
        // in the instant right after this fires).
        keepalive: true,
      });
      if (!res.ok) console.error('[notify-order] Failed:', await res.json().catch(() => ({})));
    } catch (err) {
      console.error('[notify-order] Request failed:', err);
    }

    if (couponDiscount > 0) {
      const usedPhones: string[] = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || '[]');
      const cleanPhone = formData.phone.trim().replace(/[\s\-+]/g, '').replace(/^91/, '');
      if (!usedPhones.includes(cleanPhone)) {
        usedPhones.push(cleanPhone);
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(usedPhones));
      }
    }

    (window as any).lastOrderWhatsappUrl = whatsappUrl;
    // Freeze the order details before clearing the cart, so the success screen
    // still shows everything correctly.
    setOrderSnapshot({
      items, total, couponDiscount,
      shippingFee: shippingFee ?? 0, codFee, grandTotal,
      city: formData.city, address: fullDeliveryAddress, isAhmedabad,
      paymentMethod: method, email: formData.email,
    });
    setPaymentId(paymentIdForOrder);
    setIsSuccess(true);
    // Keep the draft (name/address/phone/email) so this customer's next order
    // starts pre-filled instead of blank — just reset it back to the address
    // step and refresh the timestamp so the retention window restarts from
    // this order rather than whenever they first typed it in.
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        formData, addressQuery, addressConfirmed, checkoutStep: 'address', pinLocation, savedAt: Date.now(),
      }));
    } catch { /* non-fatal */ }
    // Order completed — don't let the abandoned-cart reminder cron email
    // them about something they already bought, and start the next cart
    // this browser builds as a fresh attempt rather than a continuation.
    fetch('/api/clear-abandoned-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: getOrCreateCartSessionId() }),
      keepalive: true,
    }).catch(() => { /* non-fatal */ });
    resetCartSessionId();
    onOrderPlaced?.(); // clears the live cart + coupon so paid items can't linger
    window.history.pushState(null, '', '/order-confirmed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSubmitting(false);
    return paymentIdForOrder;
  };

  // Combine flat + address for final delivery address
  const fullDeliveryAddress = formData.flat
    ? `${formData.flat}, ${formData.address}`
    : formData.address;

  const handleProceed = async () => {
    if (items.length === 0) return; // nothing to pay for
    const fieldNames: FieldName[] = ['name', 'phone', 'city', 'state', 'email', 'address', 'flat', 'pincode'];
    const newErrors: Partial<Record<FieldName, string>> = {};
    let firstErrorField: FieldName | null = null;

    fieldNames.forEach(name => {
      const error = validateField(name, formData[name as keyof typeof formData]);
      if (error) { newErrors[name] = error; if (!firstErrorField) firstErrorField = name; }
    });

    setFieldErrors(newErrors);
    setTouched(fieldNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}));

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorField) document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (couponDiscount > 0) {
      const usedPhones: string[] = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || '[]');
      const cleanPhone = formData.phone.trim().replace(/[\s\-+]/g, '').replace(/^91/, '');
      if (usedPhones.includes(cleanPhone)) {
        setFieldErrors(prev => ({ ...prev, phone: 'This phone number has already used the THANKS10 coupon.' }));
        setTouched(prev => ({ ...prev, phone: true }));
        document.getElementById('field-phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    // Cash on Delivery — Ahmedabad only, hard-enforced here regardless of UI
    // state (the payment-method selector is already hidden for other
    // cities, and paymentMethod auto-resets if the city field changes away
    // from Ahmedabad, but this is the last line of defence before an order
    // is actually placed).
    if (paymentMethod === 'cod') {
      if (!isAhmedabad) {
        setPaymentMethod('online');
        alert('Cash on Delivery is only available for Ahmedabad. Please pay online.');
        return;
      }
      setIsSubmitting(true);
      const codOrderId = await submitOrderSilently('', 'cod');
      const [firstName, ...lastNameParts] = formData.name.trim().split(/\s+/);
      trackMetaEvent('Purchase', {
        customData: {
          value: grandTotal, currency: 'INR',
          content_ids: items.map(i => i.id), content_type: 'product',
          num_items: items.reduce((sum, i) => sum + i.quantity, 0),
        },
        userData: {
          email: formData.email,
          phone: formData.phone,
          firstName,
          lastName: lastNameParts.join(' '),
          city: formData.city,
          state: formData.state,
          zip: formData.pincode,
          country: 'in', // site is India-only right now
        },
      }, `cod-${codOrderId}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal, currency: 'INR', receipt: `order_rcptid_${Date.now()}` })
      });
      if (!response.ok) throw new Error('Failed to create Razorpay order');
      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SpwPwC9cvjewrn',
        amount: order.amount, currency: order.currency,
        name: "Amie's Homemade", description: "Order Payment",
        image: "https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-42-1.jpg",
        order_id: order.id,
        handler: async function (response: any) {
          // Fire Meta Purchase tracking first, before anything else in this
          // handler. Razorpay only invokes this callback after the payment
          // already succeeded on its own side, so this doesn't need to wait
          // on our own signature check below — and every millisecond this
          // is delayed is a millisecond closer to the customer's tab
          // backgrounding or closing right after paying (e.g. returning
          // from their UPI app), which can kill this fetch entirely even
          // with keepalive. Firing it as early as possible in the handler
          // gives it the best chance of completing with full browser
          // signals (IP/user agent/fbp) before that happens, rather than
          // relying solely on the Razorpay webhook backstop, which has no
          // browser context to supply those from.
          //
          // Deterministic event_id (not random) — the webhook backstop
          // shares this same id, so Meta dedupes the two into one counted
          // purchase instead of two.
          const [firstName, ...lastNameParts] = formData.name.trim().split(/\s+/);
          trackMetaEvent('Purchase', {
            customData: {
              value: grandTotal, currency: 'INR',
              content_ids: items.map(i => i.id), content_type: 'product',
              num_items: items.reduce((sum, i) => sum + i.quantity, 0),
            },
            userData: {
              email: formData.email,
              phone: formData.phone,
              firstName,
              lastName: lastNameParts.join(' '),
              city: formData.city,
              state: formData.state,
              zip: formData.pincode,
              country: 'in', // site is India-only right now
            },
          }, `purchase-${response.razorpay_payment_id}`);

          // Verify signature server-side before confirming order
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              alert('Payment verification failed. If money was deducted, please contact us on WhatsApp with your Payment ID: ' + response.razorpay_payment_id);
              setIsSubmitting(false);
              return;
            }
          } catch (err) {
            console.error('Signature verification request failed:', err);
            // Continue anyway so the order isn't lost — admin can verify manually
          }

          await submitOrderSilently(response.razorpay_payment_id, 'online');
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        notes: {
          // Razorpay allows at most 15 key-value pairs in `notes` — gender is
          // dropped here to stay under that cap (it's still sent via the
          // WhatsApp order message and admin notification).
          customer_name: formData.name, phone: formData.phone,
          city: formData.city, state: formData.state, address: fullDeliveryAddress, email: formData.email || 'N/A',
          pincode: formData.pincode,
          map_pin: pinLocation ? `${pinLocation.lat},${pinLocation.lng}` : '',
          // Meta's _fbp/_fbc cookies only exist in the browser — the
          // Razorpay webhook backstop below fires server-to-server with no
          // access to them at all, so if it wins the race against the
          // client-fired Purchase event (common on slow mobile connections
          // right as the customer returns from their UPI app), those two
          // match-quality signals are lost for that event. Stashing them in
          // notes here means the webhook has them either way.
          fbp: (/(?:^|;\s*)_fbp=([^;]+)/.exec(document.cookie)?.[1]) || '',
          fbc: (/(?:^|;\s*)_fbc=([^;]+)/.exec(document.cookie)?.[1]) || '',
          items: items.map(i => `${i.quantity}x ${i.name} (${i.selectedWeight || i.weight})`).join(', ').slice(0, 250),
          subtotal: `Rs.${total}`, shipping: `Rs.${shippingFee ?? 0}`,
          grand_total: `Rs.${grandTotal}`, total_weight: `${totalWeight}g`,
        },
        theme: { color: "#F04E4E" },
        modal: { ondismiss: function() { setIsSubmitting(false); } }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong with the payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (isSuccess && orderSnapshot) {
    const snap = orderSnapshot;
    return (
      <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-cream min-h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-[2rem] sm:rounded-[4rem] shadow-2xl overflow-hidden border border-[#4A3728]/5 animate-in zoom-in fade-in duration-500">
          <div className="bg-[#F04E4E] p-8 sm:p-16 text-center text-white relative">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-[#F04E4E] mb-4 sm:mb-6 shadow-xl">
                <CheckCircle size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold serif mb-2 sm:mb-3">Order Placed!</h2>
              <p className="text-white/80 brand-rounded font-bold uppercase text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] break-all px-2">
                {snap.paymentMethod === 'cod' ? 'Pay Cash on Delivery' : `Payment ID: ${paymentId}`}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-14 space-y-7 sm:space-y-12">
            <div className="flex items-center gap-4 sm:gap-6 p-5 sm:p-8 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#4A3728]/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#F04E4E] shadow-sm border border-[#F04E4E]/10 flex-shrink-0">
                <MessageCircle size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-[#4A3728]">We have received your order details.</p>
                <p className="text-[13px] font-bold text-[#F04E4E]">We'll confirm your order shortly via WhatsApp.</p>
                {snap.email && (
                  <p className="text-[13px] font-bold text-[#4A3728]/60">You'll receive your order confirmation at {snap.email}.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black brand-rounded uppercase tracking-widest text-[#4A3728]/40 border-b border-[#4A3728]/5 pb-4">Order Summary</h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {snap.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-cream flex-shrink-0 border border-[#4A3728]/5">
                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#4A3728]">{item.name}</p>
                        <p className="text-[10px] text-[#4A3728]/50 brand-rounded uppercase mt-0.5">{item.quantity} x {item.selectedWeight || item.weight}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#4A3728]/30 line-through">₹{Math.ceil(item.price / 0.9 / 5) * 5 * item.quantity}</span>
                        <p className="text-sm font-bold text-[#4A3728]">₹{item.price * item.quantity}</p>
                      </div>
                      <span className="text-[8px] font-black text-green-600 uppercase tracking-wide">Saved ₹{(Math.ceil(item.price / 0.9 / 5) * 5 - item.price) * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-[#4A3728]/5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm font-bold text-[#4A3728]/50">
                  <span>Subtotal</span><span>₹{snap.total}</span>
                </div>
                {snap.couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-green-600">
                    <span>Coupon Discount (Thanks10)</span><span>− ₹{snap.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-[#4A3728]/50">
                  <span>Delivery Fee</span><span>{snap.shippingFee === 0 ? 'FREE' : `₹${snap.shippingFee}`}</span>
                </div>
                {snap.codFee > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-[#4A3728]/50">
                    <span>COD Convenience Fee</span><span>₹{snap.codFee}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-[#4A3728]/5">
                  <span className="text-lg sm:text-2xl font-bold serif text-[#4A3728]">{snap.paymentMethod === 'cod' ? 'Grand Total (Pay on Delivery)' : 'Grand Total Paid'}</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#F04E4E]">₹{snap.grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 bg-white rounded-[2rem] border border-[#4A3728]/5 flex items-start gap-4 shadow-sm">
                <MapPin className="text-[#F04E4E] flex-shrink-0" size={20} />
                <div>
                  <p className="text-[9px] font-black brand-rounded uppercase text-[#4A3728]/40 tracking-widest mb-1">Delivering To</p>
                  <p className="text-[12px] font-bold text-[#4A3728] leading-relaxed">{snap.city}, {snap.address}</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-[2rem] border border-[#4A3728]/5 flex items-start gap-4 shadow-sm">
                <Calendar className="text-[#F04E4E] flex-shrink-0" size={20} />
                <div>
                  <p className="text-[9px] font-black brand-rounded uppercase text-[#4A3728]/40 tracking-widest mb-1">Estimated Arrival</p>
                  <p className="text-[12px] font-bold text-[#4A3728]">{snap.isAhmedabad ? '1 Working Day' : '3-5 Working Days'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => onComplete()}
                className="w-full py-4 sm:py-6 bg-[#4A3728] text-white rounded-2xl sm:rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[11px] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Order-confirmed URL refreshed (snapshot gone) ───────────────────────────
  // Someone reloaded /order-confirmed after paying — show a friendly note rather
  // than silently bouncing them to an empty cart.
  if (typeof window !== 'undefined' && window.location.pathname === '/order-confirmed') {
    return (
      <div className="pt-28 sm:pt-32 pb-16 px-4 bg-cream min-h-screen flex items-center justify-center text-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-[#4A3728]/5 p-8 sm:p-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mb-3">Your order was received</h2>
          <p className="text-sm text-[#4A3728]/60 brand-rounded leading-relaxed mb-8">
            Thank you! We'll confirm the details with you on WhatsApp shortly. If you have any questions, just message us.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <MessageCircle size={18} /> Message us on WhatsApp
            </a>
            <button
              onClick={() => { window.history.pushState(null, '', '/shop'); onShopClick?.(); }}
              className="w-full py-4 bg-[#4A3728] text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart guard ────────────────────────────────────────────────────────
  // No items → there's nothing to check out. Block the whole flow (and the pay
  // button) instead of showing a ₹0 order.
  if (items.length === 0) {
    return (
      <div className="pt-28 sm:pt-32 pb-16 px-4 bg-cream min-h-screen flex items-center justify-center text-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-[#4A3728]/5 p-8 sm:p-12">
          <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center text-coral mx-auto mb-6">
            <Truck size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mb-3">Your bag is empty</h2>
          <p className="text-sm text-[#4A3728]/60 brand-rounded leading-relaxed mb-8">
            Add a few of Amie's Homemade treats to your bag, then come back here to check out.
          </p>
          <button
            onClick={() => onShopClick?.()}
            className="w-full py-4 bg-coral text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] hover:bg-[#d43d3d] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Browse Products <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── Checkout Form ───────────────────────────────────────────────────────────
  return (
    <div className="pt-[86px] lg:pt-24 pb-28 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-cream min-h-screen" onFocus={handleFormFocus} onBlur={handleFormBlur}>
      {/* Mobile-only step progress indicator — sits outside the reorderable
          grid below so it always stays at the top regardless of which
          grid item (form vs summary) is visually first for the current step. */}
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 mb-3 lg:hidden">
        {(['address', 'details', 'summary'] as const).map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && (
              <div className={`h-0.5 w-8 rounded-full transition-colors ${
                (['address', 'details', 'summary'].indexOf(checkoutStep) >= i) ? 'bg-[#F04E4E]' : 'bg-[#4A3728]/10'
              }`} />
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest brand-rounded transition-colors ${
              checkoutStep === s
                ? 'bg-[#F04E4E] text-white'
                : (['address', 'details', 'summary'].indexOf(checkoutStep) > i)
                ? 'bg-[#F04E4E]/10 text-[#F04E4E]'
                : 'bg-[#4A3728]/5 text-[#4A3728]/30'
            }`}>
              {s === 'address' ? '1. Address' : s === 'details' ? '2. Details' : '3. Payment'}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6" ref={formRef}>
        {/* On step 3 (mobile only) the Order Summary card should read first,
            above Payment Method — order-2 pushes this column (which only
            has Payment Method visible by then) below the summary card. */}
        <div className={`space-y-5 ${checkoutStep === 'summary' ? 'order-2' : ''} lg:order-none`}>
          {/* Delivery Details — every field inside is step-gated, so on the
              payment step this card would otherwise render as an empty
              heading-only shell, pushing Payment Method below the fold. */}
          <div className={`bg-white p-4 sm:p-7 rounded-[2rem] shadow-xl border border-[#F04E4E]/5 ${checkoutStep === 'summary' ? 'hidden' : ''} lg:block`}>
            <h2 className="text-lg lg:text-2xl font-bold serif mb-3 lg:mb-5 flex items-center gap-2.5 text-[#4A3728]">
              <Truck className="text-[#F04E4E]" size={22} /> Delivery Details
            </h2>
            {/* A real <form> (not just a <div> of inputs) — mobile browsers,
                Chrome on Android especially, only offer the address/contact
                autofill suggestion bar for inputs grouped inside an actual
                form element. onSubmit is a no-op preventDefault since actual
                submission is handled by the Proceed/Pay buttons below, which
                live outside this form and are already type="button". */}
            <form className={fieldGap} onSubmit={(e) => e.preventDefault()}>

              {/* ── STEP 1: Address (mobile) — always visible on desktop ── */}
              <div className={`space-y-1.5 ${checkoutStep === 'address' ? '' : 'hidden'} lg:block`}>
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Search Your Address</label>
                <div className="relative">
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={addressQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAddressQuery(v);
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
                    }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Type your society, street or landmark…"
                    disabled={isSubmitting}
                    autoComplete="off"
                    className={`w-full ${fieldPad} pl-11 pr-11 bg-[#F9F5EE] rounded-xl border-2 border-[#4A3728]/10 text-[#4A3728] font-medium placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 focus:border-[#F04E4E] outline-none text-base transition-all disabled:opacity-50`}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F04E4E]/60" size={16} />
                  {/* Google "G" mark — signals this is real Google Places
                      search, not a generic text field, for customer trust. */}
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.3C40.9 36 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z"/>
                  </svg>

                  {/* Custom branded suggestion dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-[#4A3728]/10 z-30 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      {suggestions.map(s => (
                        <button
                          type="button"
                          key={s.id}
                          onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                          className="w-full text-left px-4 py-3 hover:bg-[#F04E4E]/5 active:bg-[#F04E4E]/10 transition-colors flex items-start gap-3 border-b border-[#4A3728]/5 last:border-b-0"
                        >
                          <MapPin size={15} className="text-[#F04E4E]/70 mt-0.5 flex-shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-[#4A3728] truncate">{s.main}</span>
                            {s.secondary && <span className="block text-xs text-[#4A3728]/50 truncate">{s.secondary}</span>}
                          </span>
                        </button>
                      ))}
                      <p className="px-4 py-1.5 text-right text-[9px] text-[#4A3728]/30 bg-[#F9F5EE]/60">powered by Google</p>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-[#4A3728]/40 ml-3 brand-rounded font-bold">Pick a suggestion to auto-fill your address &amp; city</p>
              </div>

              {/* Address — collapses to a confirmed summary right after autocomplete
                  fills it in, instead of showing the same address twice (once in
                  the search suggestion, once in a big editable textarea). Anyone
                  who types their address manually (no autocomplete used) still
                  sees the plain editable field, unchanged. Sits right under the
                  search box (both mobile step 1 and desktop) since they're the
                  same logical task. */}
              <div className={`space-y-1.5 ${checkoutStep === 'address' ? '' : 'hidden'} lg:block`} id="field-address">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Building / Society / Street Address</label>
                {addressConfirmed && formData.address ? (
                  <>
                    <div className={`w-full ${fieldPad} bg-[#F9F5EE] rounded-xl border-2 border-[#4A3728]/10 flex items-start justify-between gap-3`}>
                      <div className="flex items-start gap-2.5 min-w-0">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-bold text-[#4A3728] leading-snug">{formData.address}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setAddressConfirmed(false); setPinLocation(null); mapInstanceRef.current = null; markerRef.current = null; }}
                        className="text-[10px] font-black uppercase brand-rounded text-[#F04E4E] tracking-widest flex-shrink-0 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    {/* Pin-confirmation map — shows the precise geocoded drop
                        location for delivery, independent of the text address
                        above. Fixed pin, no drag affordance shown — reads as
                        a confirmation, not something uncertain the customer
                        has to fix. Still pannable/zoomable to look around. */}
                    {pinLocation && (
                      <div className="rounded-xl overflow-hidden border-2 border-[#4A3728]/10">
                        <div ref={mapContainerRef} className="w-full h-40" />
                      </div>
                    )}
                  </>
                ) : (
                  <textarea
                    name="address" disabled={isSubmitting} value={formData.address}
                    onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="next"
                    autoComplete="address-line1"
                    placeholder="Building name, street, landmark" rows={2}
                    className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all resize-none ${touched.address && fieldErrors.address ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                  />
                )}
                {touched.address && fieldErrors.address && (
                  <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.address}</p>
                )}
              </div>

              {/* Mobile-only: advance to the Details step */}
              <button
                type="button"
                onClick={goToDetailsStep}
                className={`w-full py-4 bg-[#F04E4E] text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all lg:hidden ${checkoutStep === 'address' ? '' : 'hidden'}`}
              >
                Continue <ChevronRight size={18} />
              </button>

              <div className="border-t border-[#4A3728]/5 hidden lg:block" />

              {/* ── STEP 2: Details (mobile) — always visible on desktop ── */}
              {/* Mobile-only recap of the address confirmed in step 1 —
                  otherwise it's invisible for the rest of checkout once you
                  move past that step. Desktop doesn't need this since the
                  real address field is already right there in view. */}
              {formData.address && (
                <div className={`${checkoutStep === 'details' ? '' : 'hidden'} lg:hidden`}>
                  {/* Single truncated line — the full address was already
                      shown and confirmed on step 1, so this only needs to
                      be a recognisable reminder, not the whole thing. */}
                  <div className={`w-full ${fieldPad} bg-[#F9F5EE] rounded-xl border-2 border-[#4A3728]/10 flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                      <span className="text-[13px] font-bold text-[#4A3728] truncate">{formData.address}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('address')}
                      className="text-[10px] font-black uppercase brand-rounded text-[#F04E4E] tracking-widest flex-shrink-0 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* City + State — grouped right after the confirmed address
                  above (both auto-fill from the address search) rather than
                  being split apart by the contact fields further down, so
                  every address-completion field reads as one continuous
                  block before switching to "who is this for". */}
              <div className={`grid grid-cols-2 gap-3 ${checkoutStep === 'details' ? '' : 'hidden'} lg:grid`}>
                {/* City */}
                <div className="space-y-1.5" id="field-city">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">City</label>
                  <div className="relative">
                    <input
                      name="city" disabled={isSubmitting} value={formData.city}
                      onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="next" type="text" autoComplete="address-level2" placeholder="Ahmedabad"
                      className={`w-full ${fieldPad} pl-11 bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all ${touched.city && fieldErrors.city ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                    />
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3728]/20" size={16} />
                  </div>
                  {touched.city && fieldErrors.city && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.city}</p>
                  )}
                </div>
                {/* State — auto-fills from the address search above when
                    available, otherwise typed in directly like City. */}
                <div className="space-y-1.5" id="field-state">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">State</label>
                  <input
                    name="state" disabled={isSubmitting} value={formData.state}
                    onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="next" type="text" autoComplete="address-level1" placeholder="Gujarat"
                    className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all ${touched.state && fieldErrors.state ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                  />
                  {touched.state && fieldErrors.state && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Flat/House + Pincode — the two required fields that finish
                  the address, kept in the same address block instead of
                  trailing after the contact fields. */}
              <div className={`grid grid-cols-2 gap-3 ${checkoutStep === 'details' ? '' : 'hidden'} lg:grid`}>
                {/* Flat / House No */}
                <div className="space-y-1.5" id="field-flat">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Flat / House No. <span className="text-[#F04E4E]">*</span></label>
                  <input
                    name="flat" disabled={isSubmitting} value={formData.flat}
                    onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="next"
                    type="text" autoComplete="address-line2" placeholder="e.g. A-102, Floor 3"
                    className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all ${touched.flat && fieldErrors.flat ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                  />
                  {touched.flat && fieldErrors.flat && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.flat}</p>
                  )}
                </div>

                {/* Pincode — required */}
                <div className="space-y-1.5" id="field-pincode">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Pincode <span className="text-[#F04E4E]">*</span></label>
                  <input
                    name="pincode" disabled={isSubmitting} value={formData.pincode}
                    onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="next"
                    type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="e.g. 380015"
                    className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all ${touched.pincode && fieldErrors.pincode ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                  />
                  {touched.pincode && fieldErrors.pincode && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div className={`space-y-1.5 ${checkoutStep === 'details' ? '' : 'hidden'} lg:block`} id="field-name">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Full Name</label>
                <input
                  name="name" disabled={isSubmitting} value={formData.name}
                  onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="next" type="text" autoComplete="name" placeholder="e.g. Ami Shah"
                  className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all ${touched.name && fieldErrors.name ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                />
                {touched.name && fieldErrors.name && (
                  <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Gender — optional, not part of the required-field validation
                  chain (FieldName) since it doesn't block checkout. */}
              <div className={`space-y-1.5 ${checkoutStep === 'details' ? '' : 'hidden'} lg:block`} id="field-gender">
                <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Gender (Optional)</label>
                <select
                  name="gender" disabled={isSubmitting} value={formData.gender || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all border-[#4A3728]/10 focus:border-[#F04E4E] disabled:opacity-50`}
                >
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone + Email — contact fields, now grouped together after
                  the address block instead of being split across two rows
                  with City/State in between. */}
              <div className={`grid grid-cols-2 gap-3 ${checkoutStep === 'details' ? '' : 'hidden'} lg:grid`}>
                {/* Phone */}
                <div className="space-y-1.5" id="field-phone">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Phone Number</label>
                  <input
                    name="phone" disabled={isSubmitting} value={formData.phone}
                    onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="next" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 90540 38876"
                    className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all ${touched.phone && fieldErrors.phone ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5" id="field-email">
                  <label className="text-[11px] font-black uppercase brand-rounded text-[#4A3728]/50 ml-1 tracking-widest">Email <span className="text-[#F04E4E]">*</span></label>
                  <input
                    name="email" disabled={isSubmitting} value={formData.email}
                    onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleAdvanceOnEnter} enterKeyHint="done" type="email" autoComplete="email" placeholder="yourname@gmail.com"
                    className={`w-full ${fieldPad} bg-white rounded-xl border-2 text-[#4A3728] font-bold placeholder:text-[#4A3728]/40 focus:ring-2 focus:ring-[#F04E4E]/10 outline-none text-base transition-all ${touched.email && fieldErrors.email ? 'border-red-500' : 'border-[#4A3728]/10 focus:border-[#F04E4E]'} disabled:opacity-50`}
                  />
                  {touched.email && fieldErrors.email && (
                    <p className="text-red-500 text-[10px] font-bold ml-3 mt-1 brand-rounded animate-in fade-in slide-in-from-top-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Mobile-only: back to Address, or advance to Payment & Summary */}
              <div className={`flex gap-3 lg:hidden ${checkoutStep === 'details' ? '' : 'hidden'}`}>
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="px-6 py-4 bg-[#4A3728]/5 text-[#4A3728] rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goToSummaryStep}
                  className="flex-1 py-4 bg-[#F04E4E] text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  Continue to Payment <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* ── STEP 3: Payment & Summary (mobile) — always visible on desktop ── */}
          {/* Payment Method */}
          <div className={`bg-white p-4 sm:p-7 rounded-[2rem] shadow-xl border border-[#F04E4E]/5 ${checkoutStep === 'summary' ? '' : 'hidden'} lg:block`}>
            <h2 className="text-base lg:text-lg font-bold serif mb-3 lg:mb-4 flex items-center gap-3 text-[#4A3728]">
              <Wallet className="text-[#F04E4E]" size={22} /> Payment Method
            </h2>
            <div className="flex flex-col gap-2.5 lg:gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                disabled={isSubmitting}
                className={`w-full p-3 lg:p-4 rounded-2xl border-2 flex items-center gap-3 shadow-sm transition-all text-left disabled:opacity-50 ${paymentMethod === 'online' ? 'border-[#F04E4E] bg-[#F04E4E]/5' : 'border-[#4A3728]/10 hover:border-[#4A3728]/20'}`}
              >
                <Smartphone size={22} className="text-blue-500 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase brand-rounded tracking-widest">Secure Online Payment (UPI, Cards, Netbanking)</span>
              </button>

              {isAhmedabad ? (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  disabled={isSubmitting}
                  className={`w-full p-3 lg:p-4 rounded-2xl border-2 flex items-center gap-3 shadow-sm transition-all text-left disabled:opacity-50 ${paymentMethod === 'cod' ? 'border-[#F04E4E] bg-[#F04E4E]/5' : 'border-[#4A3728]/10 hover:border-[#4A3728]/20'}`}
                >
                  <Banknote size={22} className="text-green-600 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase brand-rounded tracking-widest flex-1">Cash on Delivery (Ahmedabad Only)</span>
                  <span className="text-[9px] font-black uppercase brand-rounded tracking-widest text-[#4A3728]/40 flex-shrink-0">+₹50 fee</span>
                </button>
              ) : null}

              {isAhmedabad && paymentMethod === 'cod' && (
                <p className="text-[11px] font-bold text-[#4A3728]/80 brand-rounded bg-[#4A3728]/5 p-2.5 rounded-lg border border-[#4A3728]/5">
                  Please note: Cash on Delivery orders have a ₹50 convenience fee and may take up to 1 extra day to be delivered compared to prepaid orders.
                </p>
              )}

              {!isAhmedabad && (
                touched.city && !fieldErrors.city && formData.city && (
                  <p className="text-[9px] text-[#4A3728]/40 italic brand-rounded bg-[#4A3728]/5 p-2.5 rounded-lg border border-[#4A3728]/5">
                    Cash on Delivery is available only for orders delivered within Ahmedabad.
                  </p>
                )
              )}

              {/* Trust row — online payment goes through Razorpay's own
                  hosted checkout (not our servers), but first-time visitors
                  don't know that; naming the processor + showing familiar
                  payment-method marks reduces "is this safe" hesitation
                  right where they're about to tap Pay Now. */}
              <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-[#4A3728]/5">
                <div className="flex items-center gap-1.5 text-[#4A3728]/50">
                  <ShieldCheck size={14} className="text-green-600 flex-shrink-0" />
                  <span className="text-[9px] font-bold uppercase brand-rounded tracking-wider">100% Secure · Powered by Razorpay</span>
                </div>
                <div className="flex -space-x-1.5 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5 overflow-hidden">
                    <img src="https://ik.imagekit.io/amieshomemade/paytm-logo.svg" alt="Paytm" className="w-4 h-auto" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#5F259F] flex items-center justify-center shadow-sm ring-1 ring-black/5">
                    <span className="text-white text-[10px] font-black italic leading-none">पे</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5">
                    <svg width="12" height="12" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-only: back to Details — placed after Payment Method so it
              doesn't push the payment options below the fold. */}
          <button
            type="button"
            onClick={goToPreviousStep}
            className={`px-5 py-2.5 bg-[#4A3728]/5 text-[#4A3728] rounded-2xl font-bold brand-rounded uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 active:scale-[0.98] transition-all w-fit lg:hidden ${checkoutStep === 'summary' ? '' : 'hidden'}`}
          >
            <ChevronLeft size={15} /> Back to Details
          </button>
        </div>

        {/* Sticky Summary Card */}
        <div className={`bg-white p-4 sm:p-7 rounded-[2rem] shadow-xl border border-[#F04E4E]/5 h-fit lg:sticky lg:top-24 ${checkoutStep === 'summary' ? 'order-1' : 'hidden'} lg:order-none lg:block`}>
          <div className="flex items-center justify-between mb-3 lg:mb-5">
            <h2 className="text-lg lg:text-xl font-bold serif text-[#4A3728]">Order Summary</h2>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#4A3728]/10 shadow-sm">
              <Scale size={14} className="text-[#F04E4E]" />
              <span className="text-[10px] font-black uppercase brand-rounded tracking-[0.1em] text-[#F04E4E]">{totalWeight}G TOTAL</span>
            </div>
          </div>

          {/* Capped shorter on mobile so a large cart scrolls inside this
              list instead of pushing Payment Method below the fold. Kept
              scrollable (not no-scrollbar) with a bottom fade cue below when
              there's more than fits — a hidden scrollbar with no other hint
              left customers unaware there were more items to see. */}
          <div className="relative mb-2.5 lg:mb-5">
            <div className="space-y-2.5 lg:space-y-4 max-h-[148px] lg:max-h-[280px] overflow-y-auto pr-2">
              {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-cream shadow-sm flex-shrink-0 border border-[#4A3728]/5 relative">
                    <img src={item.image} className="w-full h-full object-cover" />
                    {/* Desktop: hover-reveal overlay on the thumbnail */}
                    <button onClick={() => onRemove(idx)} aria-label={`Remove ${item.name}`} className="hidden sm:flex absolute inset-0 bg-red-600/80 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#4A3728] leading-tight">{item.name}</h4>
                    <p className="text-[11px] text-[#4A3728]/50 uppercase brand-rounded mt-0.5 font-bold tracking-wider">{item.selectedWeight || item.weight}</p>
                    <div className="flex items-center gap-2 mt-1.5 border border-coral/10 bg-white rounded-lg w-fit p-0.5">
                      <button onClick={() => onUpdateQuantity(idx, -1)} className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center hover:bg-coral/5 rounded text-coral transition-colors"><Minus size={11} /></button>
                      <span className="text-sm font-black brand-rounded text-[#4A3728] min-w-[18px] text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(idx, 1)} className="p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center hover:bg-coral/5 rounded text-coral transition-colors"><Plus size={11} /></button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {/* MRP = price before the site-wide 10% discount, backed out
                      the same way ProductCard computes it, so line items match
                      the strikethrough shown on product pages. */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#4A3728]/30 line-through">₹{Math.ceil(item.price / 0.9 / 5) * 5 * item.quantity}</span>
                      <span className="font-bold text-[#4A3728] text-sm">₹{item.price * item.quantity}</span>
                    </div>
                    <span className="text-[8px] font-black text-green-600 uppercase tracking-wide">Saved ₹{(Math.ceil(item.price / 0.9 / 5) * 5 - item.price) * item.quantity}</span>
                  </div>
                  {/* Mobile: always-visible remove button (no hover on touch) */}
                  <button onClick={() => onRemove(idx)} aria-label={`Remove ${item.name}`} className="sm:hidden p-2.5 -m-1 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#4A3728]/30 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              ))}
            </div>
            {items.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none lg:hidden" />
            )}
          </div>

          {/* Free shipping unlock nudge — only after city is fully entered
              (blurred) and not Ahmedabad. Shown regardless of which fee tier
              the order is actually in; the weight-based ₹60 rate is internal
              pricing logic, not something surfaced to the customer. */}
          {touched.city && !fieldErrors.city && !isAhmedabad && amountToFreeShipping > 0 && shippingFee !== null && (
            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-[#FFF1E5] to-[#FFE5D0] border border-[#F04E4E]/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#4A3728] brand-rounded">
                  🚚 Add <span className="text-[#F04E4E] font-black">₹{amountToFreeShipping}</span> more for FREE shipping
                </span>
                <span className="text-[10px] font-black text-[#4A3728]/50 brand-rounded">₹{subtotalAfterDiscount}/₹999</span>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F04E4E] to-[#F6C94C] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotalAfterDiscount / 999) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {touched.city && !fieldErrors.city && !isAhmedabad && amountToFreeShipping === 0 && shippingFee === 0 && formData.city && (
            <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2">
              <span className="text-base">🎉</span>
              <span className="text-[12px] font-bold text-green-700 brand-rounded">You've unlocked FREE shipping!</span>
            </div>
          )}

          <div className="space-y-1.5 lg:space-y-2 pt-3 lg:pt-4 border-t border-[#4A3728]/5 mb-3 lg:mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Subtotal</span>
              <span className="font-bold text-[#4A3728] text-sm">₹{total}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Coupon (Thanks10)</span>
                <span className="font-bold text-green-600 text-sm">− ₹{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm items-center">
              <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">Delivery Fee</span>
              {shippingFee === 0 && isAhmedabad ? (
                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest brand-rounded">FREE</span>
              ) : shippingFee !== null ? (
                <span className="font-bold text-[#4A3728] text-sm">₹{shippingFee}</span>
              ) : (
                <span className="text-[9px] text-coral font-black brand-rounded uppercase tracking-widest">Calculated on City</span>
              )}
            </div>
            {(!formData.city || fieldErrors.city) && (
              <p className="text-[9px] text-[#4A3728]/40 italic brand-rounded bg-[#4A3728]/5 p-2.5 rounded-lg border border-[#4A3728]/5">
                {fieldErrors.city ? "Correct city name to calculate shipping" : "Enter your city to calculate shipping fee."}
              </p>
            )}
            {codFee > 0 && (
              <div className="flex justify-between text-sm items-center">
                <span className="text-[#4A3728]/40 brand-rounded uppercase font-black text-[10px] tracking-widest">COD Convenience Fee</span>
                <span className="font-bold text-[#4A3728] text-sm">₹{codFee}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 lg:pt-4">
              <span className="text-base lg:text-lg font-bold serif text-[#4A3728]">Grand Total</span>
              <div className="flex flex-col items-end">
                <span className="text-xl lg:text-3xl font-black text-[#F04E4E]">₹{grandTotal}</span>
                {mrpTotal > total && (
                  <span className="text-[10px] font-bold text-green-600 brand-rounded">You saved ₹{mrpTotal - total + couponDiscount}!</span>
                )}
              </div>
            </div>
          </div>

          {/* Hidden on mobile — the sticky "Pay Now" bar below already covers
              this role there, always visible regardless of scroll. Showing
              both meant two differently-labeled buttons for the same action
              on screen at once. Desktop has no sticky bar, so it keeps this
              one. */}
          <button
            disabled={isSubmitting}
            onClick={handleProceed}
            className={`hidden sm:flex w-full py-4 bg-[#F04E4E] shadow-[#F04E4E]/30 text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.25em] text-[11px] transition-all shadow-xl items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.97]'}`}
          >
            {isSubmitting ? <>Processing... <Loader2 className="animate-spin" size={20} /></> : paymentMethod === 'cod' ? <>Place Order (Cash on Delivery) <ChevronRight size={20} /></> : <>Complete My Order <ChevronRight size={20} /></>}
          </button>
        </div>
      </div>

      {/* Sticky mobile pay bar — the delivery-details form runs long on
          mobile, so the total and submit action stay visible the whole time
          instead of only existing once you've scrolled all the way past the
          form to the summary card. Hidden while the keyboard is open (see
          keyboardOpen above) since iOS Safari renders fixed elements above
          the keyboard rather than below it, making the bar float mid-screen.

          Portaled straight to <body> rather than rendered in place: this
          component sits inside <main className="relative z-10">, which is
          its own stacking context, so no z-index here could ever out-rank
          the site <footer> (z-40) once scrolled that far -- a child's
          z-index only competes within its own stacking context, not its
          ancestor's. The footer was painting completely over this bar.
          Escaping to <body> (same trick already used for the floating
          WhatsApp button) sidesteps the whole problem. */}
      {!keyboardOpen && checkoutStep === 'summary' && createPortal(
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#4A3728]/10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between gap-3"
          // iOS Safari repaints `position: fixed` elements against a stale
          // viewport size while its address bar collapses/expands mid-scroll,
          // which reads as the bar jittering up and down. Forcing it onto its
          // own GPU compositing layer stops Safari from doing that repaint.
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)', willChange: 'transform' }}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase brand-rounded text-[#4A3728]/40 tracking-widest">Grand Total</p>
            <p className="text-xl font-black text-[#F04E4E] truncate">₹{grandTotal}</p>
          </div>
          <button
            disabled={isSubmitting}
            onClick={handleProceed}
            className={`flex-1 max-w-[220px] py-3.5 bg-[#F04E4E] text-white rounded-2xl font-bold brand-rounded uppercase tracking-[0.15em] text-[11px] transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : 'active:scale-[0.97]'}`}
          >
            {isSubmitting ? <>Processing <Loader2 className="animate-spin" size={16} /></> : paymentMethod === 'cod' ? <>Place Order <ChevronRight size={16} /></> : <>Pay Now <ChevronRight size={16} /></>}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CheckoutView;
