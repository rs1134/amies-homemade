/**
 * Diwali-only Meta catalog feed — just the 7 Diwali gift hampers (g6-g12),
 * with sale_price (mrp vs price) and video included so Commerce Manager
 * shows the strike-through discount and the hamper video. Written to
 * dist/diwali-gift-hampers-feed.csv, served live at
 * https://amieshomemade.com/diwali-gift-hampers-feed.csv — paste that URL
 * into Commerce Manager's "Use a URL" field for a Diwali-only catalog that
 * stays in sync automatically, no manual re-upload needed.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, isProductVisible } from '../src/constants.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const BASE = 'https://amieshomemade.com';
const DIWALI_HAMPER_IDS = ['g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12'];

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');

const csvEscape = (val: string): string => {
  const s = String(val ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const headers = [
  'id', 'title', 'description', 'availability', 'condition', 'link', 'image_link',
  'brand', 'price', 'google_product_category', 'fb_product_category',
  'quantity_to_sell_on_facebook', 'sale_price', 'sale_price_effective_date',
  'item_group_id', 'gender', 'color', 'size', 'age_group', 'material', 'pattern',
  'shipping', 'shipping_weight', 'offer_disclaimer', 'offer_disclaimer_url',
  'video[0].url', 'video[0].tag[0]', 'gtin', 'product_tags[0]', 'product_tags[1]', 'style[0]',
];

const warnings: string[] = [];
const included = PRODUCTS.filter(p => isProductVisible(p) && DIWALI_HAMPER_IDS.includes(p.id));

if (included.length !== DIWALI_HAMPER_IDS.length) {
  const foundIds = included.map(p => p.id);
  for (const id of DIWALI_HAMPER_IDS) {
    if (!foundIds.includes(id)) warnings.push(`MISSING OR HIDDEN: ${id}`);
  }
}

const lines = [headers.join(',')];
for (const p of included) {
  const slug = slugify(p.name);
  const link = `${BASE}/gifting/${slug}`;
  const description = stripHtml(p.description || '').trim();
  const availability = p.outOfStock ? 'out of stock' : 'in stock';
  const regularPrice = p.mrp ?? p.price;
  const video = (p.images || []).find(img => /\.(mp4|mov|m4v)(\?|$)/i.test(img)) || '';

  const row: Record<string, string> = {
    id: p.id,
    title: p.name,
    description,
    availability,
    condition: 'new',
    link,
    image_link: p.image,
    brand: "Amie's Homemade",
    price: `${regularPrice.toFixed(2)} INR`,
    google_product_category: 'Food, Beverages & Tobacco > Food Items > Gift Baskets',
    fb_product_category: 'Food, Beverages & Tobacco > Food Items > Gift Baskets',
    quantity_to_sell_on_facebook: availability === 'in stock' ? '20' : '0',
    sale_price: regularPrice !== p.price ? `${p.price.toFixed(2)} INR` : '',
    sale_price_effective_date: '',
    item_group_id: '',
    gender: '', color: '', size: '', age_group: '', material: '', pattern: '',
    shipping: '', shipping_weight: '', offer_disclaimer: '', offer_disclaimer_url: '',
    'video[0].url': video,
    'video[0].tag[0]': '',
    gtin: '',
    'product_tags[0]': 'Diwali',
    'product_tags[1]': 'Gift Hamper',
    'style[0]': '',
  };

  lines.push(headers.map(h => csvEscape(row[h])).join(','));
}

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'diwali-gift-hampers-feed.csv'), lines.join('\n') + '\n', 'utf-8');

console.log(`\n✅ Wrote dist/diwali-gift-hampers-feed.csv with ${included.length} rows\n`);
if (warnings.length) {
  console.log(`⚠️  ${warnings.length} warnings:`);
  for (const w of warnings) console.log('  - ' + w);
} else {
  console.log('No warnings.');
}
