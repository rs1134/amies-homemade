/**
 * Same as generate-meta-catalog-feed.ts, but filtered to just the Mukhwas
 * category plus the Trio of Traditions hamper (an all-mukhwas gift box).
 * Written to dist/meta-catalog-mukhwas-feed.csv, served live at
 * https://amieshomemade.com/meta-catalog-mukhwas-feed.csv — paste that URL
 * into Commerce Manager's scheduled data feed fetch for a Mukhwas-only
 * catalog/product set. Runs on every build, so it stays in sync
 * automatically.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, isProductVisible } from '../src/constants.ts';
import { Category } from '../src/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const BASE = 'https://amieshomemade.com';
const TRIO_OF_TRADITIONS_ID = 'g4';

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');

const csvEscape = (val: string): string => {
  const s = String(val ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const GOOGLE_CATEGORY: Record<string, string> = {
  [Category.MUKHWAS]: 'Food, Beverages & Tobacco > Food Items > Snack Foods',
  [Category.GIFTING]: 'Food, Beverages & Tobacco > Food Items > Gift Baskets',
};
const FB_CATEGORY: Record<string, string> = {
  [Category.MUKHWAS]: 'Food, Beverages & Tobacco > Food Items',
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

const included = PRODUCTS.filter(p =>
  isProductVisible(p) && (p.category === Category.MUKHWAS || p.id === TRIO_OF_TRADITIONS_ID)
);

for (const p of included) {
  const isGifting = p.category === Category.GIFTING;
  const section = isGifting ? 'gifting' : 'shop';
  const slug = slugify(p.name);
  const link = `${BASE}/${section}/${slug}`;

  const description = stripHtml(p.description || '').trim();
  const imageLink = p.image;
  const availability = p.outOfStock ? 'out of stock' : 'in stock';
  const googleCategory = GOOGLE_CATEGORY[p.category] || '';
  const fbCategory = FB_CATEGORY[p.category] || '';

  const variantWeights = p.weights && p.weights.length > 0 ? p.weights : [p.weight];
  const isMultiVariant = variantWeights.length > 1;

  for (const weight of variantWeights) {
    const variantPrice = p.prices?.[weight] ?? p.price;
    const variantId = isMultiVariant ? `${p.id}-${slugify(weight)}` : p.id;

    if (seenIds.has(variantId)) warnings.push(`DUPLICATE ID: ${variantId} (${p.name})`);
    seenIds.add(variantId);

    const title = isMultiVariant ? `${p.name} (${weight})` : p.name;

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
writeFileSync(join(distDir, 'meta-catalog-mukhwas-feed.csv'), lines.join('\n') + '\n', 'utf-8');

console.log(`\n✅ Wrote dist/meta-catalog-mukhwas-feed.csv with ${rows.length} rows (from ${seenIds.size} unique IDs, ${included.length} products)\n`);
if (warnings.length) {
  console.log(`⚠️  ${warnings.length} warnings:`);
  for (const w of warnings) console.log('  - ' + w);
} else {
  console.log('No warnings.');
}
