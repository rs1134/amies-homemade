/**
 * Manually pushes the current product/collection catalog to Shiprocket
 * Checkout's product/collection webhooks (POST .../wh/v1/custom/product and
 * .../wh/v1/custom/collection), per the integration guide's "Real-time
 * Catalog Sync Using Webhooks" section.
 *
 * There's no live admin panel here — the catalog is static in
 * src/constants.ts — so there's no natural "on save" trigger. Run this
 * manually (`npx tsx scripts/shiprocket-catalog-sync.ts`) any time a
 * price, stock status, or product is added/changed/removed, right after
 * pushing that change to production. Reads credentials from .env.local.
 */
import { readFileSync } from 'fs';
import { createHmac } from 'crypto';
import { toShiprocketProduct, toShiprocketCollection, getVisibleProducts, CATEGORY_ID } from '../src/shiprocketCatalog.ts';

function loadEnvLocal(): Record<string, string> {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  const env: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="([\s\S]*)"$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function sendWebhook(url: string, apiKey: string, secretKey: string, body: unknown) {
  const bodyStr = JSON.stringify(body);
  const hmac = createHmac('sha256', secretKey).update(bodyStr).digest('base64');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey, 'X-Api-HMAC-SHA256': hmac },
    body: bodyStr,
  });
  const text = await res.text().catch(() => '');
  return { ok: res.ok, status: res.status, text };
}

async function main() {
  const env = loadEnvLocal();
  const apiKey = env.SHIPROCKET_CHECKOUT_API_KEY;
  const secretKey = env.SHIPROCKET_CHECKOUT_SECRET_KEY;
  if (!apiKey || !secretKey) {
    console.error('SHIPROCKET_CHECKOUT_API_KEY / SHIPROCKET_CHECKOUT_SECRET_KEY not set in .env.local');
    process.exit(1);
  }

  const products = getVisibleProducts();
  console.log(`Syncing ${products.length} products...`);
  for (const p of products) {
    const result = await sendWebhook('https://checkout-api.shiprocket.com/wh/v1/custom/product', apiKey, secretKey, toShiprocketProduct(p));
    console.log(`  ${p.id} (${p.name}): ${result.ok ? 'OK' : `FAILED ${result.status} ${result.text}`}`);
  }

  const categories = [...new Set(products.map(p => p.category))].filter(c => CATEGORY_ID[c] !== undefined);
  console.log(`Syncing ${categories.length} collections...`);
  for (const c of categories) {
    const result = await sendWebhook('https://checkout-api.shiprocket.com/wh/v1/custom/collection', apiKey, secretKey, toShiprocketCollection(c));
    console.log(`  ${c}: ${result.ok ? 'OK' : `FAILED ${result.status} ${result.text}`}`);
  }

  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
