/**
 * Generates a Google Merchant Center product feed CSV from live site data.
 * Run: npx tsx scripts/generate-merchant-feed.ts
 */
import { writeFileSync } from 'fs';
import { PRODUCTS, isProductVisible } from '../src/constants.ts';
import { Category } from '../src/types.ts';

const BASE = 'https://amieshomemade.com';

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');

const csvEscape = (val: string): string => {
  const s = String(val ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// Rough manual mapping to Google's product taxonomy — flagged for review.
const GOOGLE_CATEGORY: Record<string, string> = {
  [Category.MUKHWAS]: 'Food, Beverages & Tobacco > Food Items > Snack Foods',
  [Category.WELLNESS]: 'Food, Beverages & Tobacco > Food Items > Snack Foods',
  [Category.SNACKS]: 'Food, Beverages & Tobacco > Food Items > Snack Foods',
  [Category.SWEETS]: 'Food, Beverages & Tobacco > Food Items > Candy & Chocolate',
  [Category.GIFTING]: 'Food, Beverages & Tobacco > Food Items > Gift Baskets',
};

const PRODUCT_TYPE: Record<string, string> = {
  [Category.MUKHWAS]: 'Mukhwas',
  [Category.WELLNESS]: 'Health & Wellness',
  [Category.SNACKS]: 'Gujarati Snacks',
  [Category.SWEETS]: 'Traditional Sweets',
  [Category.GIFTING]: 'Gift Hampers',
};

interface Row {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  availability: string;
  price: string;
  condition: string;
  brand: string;
  google_product_category: string;
  product_type: string;
}

const rows: Row[] = [];
const warnings: string[] = [];
const seenIds = new Set<string>();

for (const p of PRODUCTS) {
  if (!isProductVisible(p)) continue; // hidden products excluded — not live on site

  if (seenIds.has(p.id)) warnings.push(`DUPLICATE ID: ${p.id} (${p.name})`);
  seenIds.add(p.id);

  const isGifting = p.category === Category.GIFTING;
  const section = isGifting ? 'gifting' : 'shop';
  const slug = slugify(p.name);
  const link = `${BASE}/${section}/${slug}`;

  const title = p.name;
  if (title.length > 150) warnings.push(`TITLE TOO LONG (${title.length}): ${p.id}`);

  const description = stripHtml(p.description || '').trim();
  if (!description) warnings.push(`EMPTY DESCRIPTION: ${p.id} (${p.name})`);
  if (description.length > 5000) warnings.push(`DESCRIPTION TOO LONG (${description.length}): ${p.id}`);

  const imageLink = p.image;
  if (!imageLink || !/^https?:\/\//.test(imageLink)) {
    warnings.push(`IMAGE NOT A FULL PUBLIC URL: ${p.id} (${p.name}) -> "${imageLink}"`);
  }

  const availability = p.outOfStock ? 'out of stock' : 'in stock';

  // Default/base price for the product (subOptions & multi-weight variants
  // are flagged separately — Merchant Center needs one price per feed row;
  // a multi-variant product ideally becomes a variant group, which this
  // single-row feed does not attempt).
  const price = `${p.price.toFixed(2)} INR`;
  if (p.subOptions) {
    warnings.push(`HAS SUB-OPTIONS (multiple variants with own prices) — feed uses base price only: ${p.id} (${p.name})`);
  }
  if (p.weights && p.weights.length > 1) {
    warnings.push(`HAS MULTIPLE WEIGHTS/PRICES (${p.weights.join(', ')}) — feed uses base weight "${p.weight}" price only: ${p.id} (${p.name})`);
  }

  const googleCategory = GOOGLE_CATEGORY[p.category] || '';
  if (!googleCategory) warnings.push(`NO GOOGLE CATEGORY MAPPING: ${p.id} (${p.category})`);

  const productType = PRODUCT_TYPE[p.category] || p.category;

  rows.push({
    id: p.id,
    title,
    description,
    link,
    image_link: imageLink,
    availability,
    price,
    condition: 'new',
    brand: "Amie's Homemade",
    google_product_category: googleCategory,
    product_type: productType,
  });
}

const headers = ['id', 'title', 'description', 'link', 'image_link', 'availability', 'price', 'condition', 'brand', 'google_product_category', 'product_type'];
const lines = [headers.join(',')];
for (const r of rows) {
  lines.push(headers.map(h => csvEscape((r as any)[h])).join(','));
}

writeFileSync('merchant-feed.csv', lines.join('\n') + '\n', 'utf-8');

console.log(`\n✅ Wrote merchant-feed.csv with ${rows.length} products\n`);
if (warnings.length) {
  console.log(`⚠️  ${warnings.length} warnings:`);
  for (const w of warnings) console.log('  - ' + w);
} else {
  console.log('No warnings.');
}
