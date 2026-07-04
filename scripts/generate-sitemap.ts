/**
 * Generates sitemap.xml from the live site data (products, blog posts,
 * delivery areas, cities, static pages) so it can never drift out of sync.
 *
 * - Removed products drop out automatically (no more soft-404s in the sitemap)
 * - New products/blog posts are included automatically
 * - Only PUBLISHED blog posts are listed (future-dated posts excluded)
 *
 * Writes to dist/sitemap.xml (served) and public/sitemap.xml (repo copy).
 * Run automatically after vite build via the build script in package.json.
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, isProductVisible, HIDDEN_CATEGORIES } from '../src/constants.ts';
import { getPublishedPosts } from '../src/blogs.ts';
import { DELIVERY_AREAS } from '../src/deliveryAreas.ts';
import { CITIES } from '../src/cities.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://amieshomemade.com';
const today = new Date().toISOString().split('T')[0];

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const entries: Entry[] = [];

// ── Static pages ──────────────────────────────────────────────────────────
entries.push(
  { loc: `${BASE}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
  { loc: `${BASE}/shop`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
  { loc: `${BASE}/gifting`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
  { loc: `${BASE}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE}/about`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
  { loc: `${BASE}/faq`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
  { loc: `${BASE}/contact`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
  { loc: `${BASE}/delivery`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
  { loc: `${BASE}/cities`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
);

// ── Category pages (prerendered) ──────────────────────────────────────────
// traditional-sweets (Sweets) and gujarati-snacks (Snacks) are excluded
// while HIDDEN_CATEGORIES hides them from the shop — don't feed Google a
// category page for something that's been pulled from sale.
const CATEGORY_SLUG_TO_CATEGORY: Record<string, string> = {
  'mukhwas': 'Mukhwas',
  'traditional-sweets': 'Traditional Sweets',
  'gujarati-snacks': 'Gujarati Snacks',
  'health-wellness': 'Health & Wellness',
};
for (const [slug, category] of Object.entries(CATEGORY_SLUG_TO_CATEGORY)) {
  if (HIDDEN_CATEGORIES.includes(category as any)) continue;
  entries.push({ loc: `${BASE}/shop/${slug}`, lastmod: today, changefreq: 'weekly', priority: '0.8' });
}

// ── Product pages ─────────────────────────────────────────────────────────
// Hidden products drop out of the sitemap the same way they're excluded
// from prerendering — no static page, no sitemap entry, nothing for Google
// to crawl or keep indexed.
const GIFTING_CATEGORY = 'Gifting & Hampers';
for (const product of PRODUCTS.filter(isProductVisible)) {
  const section = product.category === GIFTING_CATEGORY ? 'gifting' : 'shop';
  entries.push({
    loc: `${BASE}/${section}/${slugify(product.name)}`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.8',
  });
}

// ── Blog posts (published only) ───────────────────────────────────────────
for (const post of getPublishedPosts()) {
  entries.push({
    loc: `${BASE}/blog/${post.slug}`,
    lastmod: post.publishedAt,
    changefreq: 'monthly',
    priority: '0.7',
  });
}

// ── Delivery area pages ───────────────────────────────────────────────────
for (const area of DELIVERY_AREAS) {
  entries.push({ loc: `${BASE}/delivery/${area.slug}`, lastmod: today, changefreq: 'monthly', priority: '0.5' });
}

// ── City pages ────────────────────────────────────────────────────────────
for (const city of CITIES) {
  entries.push({ loc: `${BASE}/cities/${city.slug}`, lastmod: today, changefreq: 'monthly', priority: '0.5' });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${e.loc}</loc>
${e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : ''}${e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>\n` : ''}${e.priority ? `    <priority>${e.priority}</priority>\n` : ''}  </url>`).join('\n')}
</urlset>
`;

writeFileSync(join(__dirname, '..', 'dist', 'sitemap.xml'), xml, 'utf-8');
writeFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), xml, 'utf-8');

console.log(`✅ Generated sitemap.xml with ${entries.length} URLs`);
