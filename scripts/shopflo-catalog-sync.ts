/**
 * Pushes the current product catalog (src/constants.ts) into Shopflo's
 * Catalog Engine — Product, Product Image, and Variant, per the
 * `catalog_engine_collection.json` Postman collection Shopflo shared.
 *
 * Why this exists: Shopflo's hosted checkout renders the order-summary
 * product name/image by looking them up in its own Catalog Engine, not from
 * the item details our Token API call already sends inline. Without this
 * sync, checkout showed "undefined" for the name and no image at all.
 *
 * There's no live admin panel here — the catalog is static in
 * src/constants.ts — so there's no natural "on save" trigger. Run this
 * manually (`npx tsx scripts/shopflo-catalog-sync.ts`) any time a product,
 * price, weight, or image changes, right after pushing that change to
 * production. Reads credentials from .env.local.
 *
 * Auth: confirmed live (2026-09-29) that the Catalog Engine's `SF_API_KEY`
 * header accepts the same SHOPFLO_API_KEY already used for the Token API —
 * no separate "SF Channel ID" needed. `ISSUER_ID` below is a fixed value
 * from the Postman collection (not merchant-specific).
 *
 * Scope: only Product / Image / Variant are synced. Collections are
 * deliberately skipped — the checkout's order-summary display (the actual
 * bug this fixes) only needs Products+Variants to resolve; Collections only
 * matter for browsing Shopflo's own storefront UI, which we don't use since
 * customers still shop on our own site and only land in Shopflo for the
 * hosted checkout itself.
 */
import { readFileSync } from 'fs';
import { PRODUCTS, isProductVisible } from '../src/constants.ts';
import type { Product } from '../src/types.ts';

const HOST = 'https://api.shopflo.co';
const ISSUER_ID = '8d593cf0-99a5-4c0b-8988-0069fff0c197';

function loadEnvLocal(): Record<string, string> {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const env: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="([\s\S]*)"$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

// Mirrors the same "which weights does this product have" logic already
// established in src/shiprocketCatalog.ts, so the two catalogs never drift
// apart on what counts as a variant.
const weightList = (p: Product): string[] => {
  if (p.weights?.length) return p.weights;
  const priceKeys = Object.keys(p.prices || {});
  if (priceKeys.length) return priceKeys;
  return [p.weight];
};

const priceFor = (p: Product, weight: string): number => p.prices?.[weight] ?? p.price;

// Confirmed live (2026-09-29) against a real variant: the Catalog Engine
// stores current_price/original_price in paise (smallest currency unit),
// same convention as Razorpay — sending a plain rupee amount (e.g. 355)
// silently gets stored as ₹3.55. Every price sent to this API must be
// multiplied by 100 first.
const toPaise = (rupees: number) => Math.round(rupees * 100);

// Matches the id ShopfloCheckoutView.tsx already sends as each cart item's
// `id` at checkout time (`${item.id}-${item.selectedWeight || item.weight}`)
// — keeping the catalog's variant_id identical to that is what lets
// Shopflo's checkout resolve the right variant for display.
const variantId = (productId: string, weight: string) => `${productId}-${weight}`;

async function call(method: string, path: string, apiKey: string, body?: unknown) {
  const res = await fetch(`${HOST}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
      // Cloudflare in front of api.shopflo.co blocks bare/non-browser
      // requests outright (403) — a real UA is required, not just auth.
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text().catch(() => '');
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* non-JSON error body, keep text */ }
  return { ok: res.ok, status: res.status, json, text };
}

async function syncProduct(apiKey: string, merchantId: string, p: Product) {
  const base = `/ce/api/v1/issuer/${ISSUER_ID}/merchant/${merchantId}`;

  // Product — try create; if it already exists, fall back to update so
  // re-running this script is always safe (idempotent) rather than erroring
  // on every product after the first sync.
  const productBody = {
    product_id: p.id,
    name: p.name,
    description: p.description,
    product_type: p.category,
    status: p.outOfStock ? 'INACTIVE' : 'ACTIVE',
    tags: [p.category],
  };
  let result = await call('POST', `${base}/product`, apiKey, productBody);
  if (!result.ok) {
    result = await call('PATCH', `${base}/product/${p.id}`, apiKey, productBody);
  }
  if (!result.ok) {
    console.log(`  ${p.id} (${p.name}): PRODUCT FAILED ${result.status} ${result.text.slice(0, 200)}`);
    return;
  }

  // Image — cover photo only (the checkout order-summary only ever shows
  // one thumbnail per line item, so the full gallery isn't needed here).
  const imgResult = await call('POST', `${base}/product/${p.id}/image`, apiKey, {
    image_source: p.image,
    alt_text: p.name,
    width: 800,
    height: 800,
  });

  // Variants — one per weight, using the same id we already send at
  // checkout time (see variantId() above).
  const weights = weightList(p);
  let variantsOk = 0;
  for (const weight of weights) {
    const price = priceFor(p, weight);
    const vResult = await call('POST', `${base}/product/${p.id}/variant`, apiKey, {
      variant_id: variantId(p.id, weight),
      name: weight,
      description: p.name,
      sku: `${p.id}-${weight}`.replace(/\s+/g, ''),
      original_price: toPaise(p.mrp ?? Math.ceil(price / 0.9 / 5) * 5),
      current_price: toPaise(price),
      currency: 'INR',
      inventory_quantity: p.outOfStock ? 0 : 999,
      position: 1,
      requires_shipping: true,
      taxable: false,
      weight: weight.replace(/[^\d.]/g, '') || '0',
      weight_unit: /kg/i.test(weight) ? 'KG' : 'G',
    });
    if (vResult.ok) {
      variantsOk++;
    } else {
      // Not-yet-existing update case: retry as PATCH, same reasoning as the product above.
      const retry = await call('PATCH', `${base}/product/${p.id}/variant/${variantId(p.id, weight)}`, apiKey, {
        current_price: toPaise(price),
        original_price: toPaise(p.mrp ?? Math.ceil(price / 0.9 / 5) * 5),
        inventory_quantity: p.outOfStock ? 0 : 999,
      });
      if (retry.ok) variantsOk++;
      else console.log(`    variant ${weight}: FAILED ${vResult.status} ${vResult.text.slice(0, 150)}`);
    }
  }

  console.log(`  ${p.id} (${p.name}): product OK, image ${imgResult.ok ? 'OK' : `FAILED ${imgResult.status}`}, variants ${variantsOk}/${weights.length} OK`);
}

async function main() {
  const env = loadEnvLocal();
  const apiKey = env.SHOPFLO_API_KEY;
  const merchantId = env.SHOPFLO_MID;
  if (!apiKey || !merchantId) {
    console.error('SHOPFLO_API_KEY / SHOPFLO_MID not set in .env.local');
    process.exit(1);
  }

  const products = PRODUCTS.filter(isProductVisible);
  console.log(`Syncing ${products.length} products to Shopflo Catalog Engine...`);
  for (const p of products) {
    await syncProduct(apiKey, merchantId, p);
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
