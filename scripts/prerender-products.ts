/**
 * Pre-renders each product page as a static HTML file.
 * Gifting products → dist/gifting/[slug]/index.html
 * All other products → dist/shop/[slug]/index.html
 *
 * Injects a Product JSON-LD schema in <head> so Google Merchant Center
 * can read structured data without executing JavaScript.
 *
 * Run automatically after `vite build` via the build script in package.json.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS } from '../src/constants.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf-8');

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const GIFTING_CATEGORY = 'Gifting & Hampers';

for (const product of PRODUCTS) {
  const isGifting = product.category === GIFTING_CATEGORY;
  const slug = slugify(product.name);
  const section = isGifting ? 'gifting' : 'shop';
  const productUrl = `https://amieshomemade.com/${section}/${slug}`;
  const title = `${product.name} | Amie's Homemade`;
  const description = product.description;

  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*"/, `$1${escapeHtml(description)}"`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*"/, `$1${productUrl}"`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${escapeHtml(title)}"`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${escapeHtml(description)}"`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*"/, `$1${product.image}"`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*"/, `$1${productUrl}"`);
  html = html.replace(/(<meta property="og:type" content=")[^"]*"/, `$1product"`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${escapeHtml(title)}"`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${escapeHtml(description)}"`);
  html = html.replace(/(<meta name="twitter:image" content=")[^"]*"/, `$1${product.image}"`);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    sku: product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    url: productUrl,
    brand: { '@type': 'Brand', name: "Amie's Homemade" },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: "Amie's Homemade", url: 'https://amieshomemade.com' },
    },
  };

  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);

  const dir = join(distDir, section, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');

  console.log(`  ✓ /${section}/${slug}`);
}

console.log(`\n✅ Pre-rendered ${PRODUCTS.length} product pages`);
