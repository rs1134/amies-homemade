/**
 * Generates a Meta (Facebook/Instagram) Commerce Manager product catalog CSV
 * from live site data, written to dist/meta-catalog-feed.csv so it deploys
 * and is publicly reachable at https://amieshomemade.com/meta-catalog-feed.csv
 * — that's the URL to paste into Commerce Manager's "Data feed" scheduled
 * fetch, so the catalog keeps itself in sync automatically instead of
 * needing a manual re-upload every time a product changes. Runs on every
 * build (see package.json), matching the existing Google Merchant feed setup.
 *
 * Column set follows Meta's catalog_products.csv template exactly (id, title,
 * description, availability, condition, price, link, image_link, brand,
 * google_product_category, fb_product_category, quantity_to_sell_on_facebook,
 * item_group_id) — one row per weight/price variant, grouped under
 * item_group_id so Meta shows them as a single product with size options
 * instead of duplicate listings.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, isProductVisible } from '../src/constants.ts';
import { Category } from '../src/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const BASE = 'https://amieshomemade.com';

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');

const csvEscape = (val: string): string => {
  const s = String(val ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// Same taxonomy mapping as the Google Merchant feed — Meta accepts Google's
// product taxonomy for google_product_category too.
const GOOGLE_CATEGORY: Record<string, string> = {
  [Category.MUKHWAS]: 'Food, Beverages & Tobacco > Food Items > Snack Foods',
  [Category.WELLNESS]: 'Food, Beverages & Tobacco > Food Items > Snack Foods',
  [Category.SNACKS]: 'Food, Beverages & Tobacco > Food Items > Snack Foods',
  [Category.SWEETS]: 'Food, Beverages & Tobacco > Food Items > Candy & Chocolate',
  [Category.GIFTING]: 'Food, Beverages & Tobacco > Food Items > Gift Baskets',
};

// Meta's own product taxonomy (fb_product_category) — coarser than Google's,
// using Meta's published category tree.
const FB_CATEGORY: Record<string, string> = {
  [Category.MUKHWAS]: 'Food, Beverages & Tobacco > Food Items',
  [Category.WELLNESS]: 'Food, Beverages & Tobacco > Food Items',
  [Category.SNACKS]: 'Food, Beverages & Tobacco > Food Items',
  [Category.SWEETS]: 'Food, Beverages & Tobacco > Food Items',
  [Category.GIFTING]: 'Food, Beverages & Tobacco > Food Items > Gift Baskets',
};

interface Row {
  id: string;
  title: string;
  description: string;
  availability: string;
  condition: string;
  price: string;
  link: string;
  image_link: string;
  brand: string;
  google_product_category: string;
  fb_product_category: string;
  quantity_to_sell_on_facebook: string;
  item_group_id: string;
}

const rows: Row[] = [];
const warnings: string[] = [];
const seenIds = new Set<string>();

for (const p of PRODUCTS) {
  if (!isProductVisible(p)) continue; // hidden products excluded — not live on site

  const isGifting = p.category === Category.GIFTING;
  const section = isGifting ? 'gifting' : 'shop';
  const slug = slugify(p.name);
  const link = `${BASE}/${section}/${slug}`;

  const description = stripHtml(p.description || '').trim();
  if (!description) warnings.push(`EMPTY DESCRIPTION: ${p.id} (${p.name})`);

  const imageLink = p.image;
  if (!imageLink || !/^https?:\/\//.test(imageLink)) {
    warnings.push(`IMAGE NOT A FULL PUBLIC URL: ${p.id} (${p.name}) -> "${imageLink}"`);
  }

  const availability = p.outOfStock ? 'out of stock' : 'in stock';
  const googleCategory = GOOGLE_CATEGORY[p.category] || '';
  const fbCategory = FB_CATEGORY[p.category] || '';
  if (!googleCategory) warnings.push(`NO GOOGLE CATEGORY MAPPING: ${p.id} (${p.category})`);

  // Build one row per weight/price variant so Meta groups them under a
  // single product with size options via item_group_id, rather than the
  // Google feed's current single-row-per-product limitation.
  const variantWeights = p.weights && p.weights.length > 0 ? p.weights : [p.weight];
  const isMultiVariant = variantWeights.length > 1;

  for (const weight of variantWeights) {
    const variantPrice = p.prices?.[weight] ?? p.price;
    const variantId = isMultiVariant ? `${p.id}-${slugify(weight)}` : p.id;

    if (seenIds.has(variantId)) warnings.push(`DUPLICATE ID: ${variantId} (${p.name})`);
    seenIds.add(variantId);

    const title = isMultiVariant ? `${p.name} (${weight})` : p.name;
    if (title.length > 150) warnings.push(`TITLE TOO LONG (${title.length}): ${variantId}`);

    rows.push({
      id: variantId,
      title,
      description,
      availability,
      condition: 'new',
      price: `${variantPrice.toFixed(2)} INR`,
      link,
      image_link: imageLink,
      brand: "Amie's Homemade",
      google_product_category: googleCategory,
      fb_product_category: fbCategory,
      quantity_to_sell_on_facebook: availability === 'in stock' ? '50' : '0',
      item_group_id: isMultiVariant ? p.id : '',
    });
  }

  if (p.subOptions) {
    warnings.push(`HAS SUB-OPTIONS (e.g. flavor variants with own prices) — feed only covers weight variants, not sub-options: ${p.id} (${p.name})`);
  }
}

const headers = [
  'id', 'title', 'description', 'availability', 'condition', 'price', 'link',
  'image_link', 'brand', 'google_product_category', 'fb_product_category',
  'quantity_to_sell_on_facebook', 'item_group_id',
];
const lines = [headers.join(',')];
for (const r of rows) {
  lines.push(headers.map(h => csvEscape((r as any)[h])).join(','));
}

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'meta-catalog-feed.csv'), lines.join('\n') + '\n', 'utf-8');

console.log(`\n✅ Wrote dist/meta-catalog-feed.csv with ${rows.length} rows (from ${seenIds.size} unique IDs)\n`);
if (warnings.length) {
  console.log(`⚠️  ${warnings.length} warnings:`);
  for (const w of warnings) console.log('  - ' + w);
} else {
  console.log('No warnings.');
}
