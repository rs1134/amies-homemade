/**
 * Precomputes the Shiprocket Checkout catalog into a static JSON file
 * colocated at api/_shiprocket-catalog.generated.json, so the serverless
 * function never needs to import across into src/ at runtime. Runs on every
 * build (see package.json), so the catalog never drifts and there's no
 * hand-duplicated product data to keep in sync.
 *
 * Why this exists: api/shiprocket-checkout.ts previously imported directly
 * from ../src/shiprocketCatalog.ts. That type-checked fine and even ran
 * correctly locally via tsx, but Vercel's serverless function bundler does
 * not reliably trace/inline imports that reach outside a function's own
 * directory tree -- in production this failed with
 * `Cannot find module '/var/task/src/shiprocketCatalog'`, since the file
 * was never copied into the function's deployment bundle. A same-directory
 * JSON import doesn't have that problem.
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  toShiprocketProduct, toShiprocketCollection, getVisibleProducts,
  getProductsByCollectionId, CATEGORY_ID, variantShiprocketId, resolveVariant,
} from '../src/shiprocketCatalog.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'api', '_shiprocket-catalog.generated.json');

const products = getVisibleProducts();

const productsByCollectionId: Record<string, unknown[]> = {};
for (const collectionId of Object.values(CATEGORY_ID)) {
  productsByCollectionId[String(collectionId)] = getProductsByCollectionId(collectionId).map(toShiprocketProduct);
}

const collections = [...new Set(products.map(p => p.category))]
  .filter(c => CATEGORY_ID[c] !== undefined)
  .map(toShiprocketCollection);

// Flatten the variant <-> {productId, weight} mapping so the function can do
// plain object lookups instead of re-deriving it from src/constants.ts.
const productVariantMap: Record<string, Record<string, number>> = {};
const variantIndex: Record<string, { productId: string; weight: string }> = {};
for (const p of products) {
  const weights = p.weights?.length ? p.weights : Object.keys(p.prices || {}).length ? Object.keys(p.prices || {}) : [p.weight];
  productVariantMap[p.id] = {};
  for (const w of weights) {
    const variantId = variantShiprocketId(p.id, w);
    if (variantId === undefined) continue;
    productVariantMap[p.id][w] = variantId;
    const resolved = resolveVariant(variantId);
    if (resolved) variantIndex[String(variantId)] = resolved;
  }
}

writeFileSync(outPath, JSON.stringify({
  products: products.map(toShiprocketProduct),
  collections,
  productsByCollectionId,
  productVariantMap,
  variantIndex,
}), 'utf-8');

console.log(`\n✅ Wrote api/_shiprocket-catalog.generated.json with ${products.length} products, ${collections.length} collections\n`);
