/**
 * Pre-renders the main section pages as static HTML files so each has its own
 * correct canonical URL (not the homepage canonical from the SPA shell).
 *
 * Without this, Vercel's catch-all rewrite serves dist/index.html for /shop,
 * /gifting, /blog, /about, etc. — all with canonical https://amieshomemade.com —
 * causing Google Search Console to flag them as "Alternate page with proper
 * canonical tag."
 *
 * Run automatically after vite build via the build script in package.json.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf-8');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PAGES = [
  {
    path: 'shop',
    url: 'https://amieshomemade.com/shop',
    title: "Shop All Products | Amie's Homemade",
    description: "Browse all of Amie's Homemade handcrafted products — mukhwas, traditional sweets, snacks, and health & wellness items. Made fresh in small batches, no preservatives.",
  },
  {
    path: 'gifting',
    url: 'https://amieshomemade.com/gifting',
    title: "Gift Hampers & Corporate Gifting | Amie's Homemade",
    description: "Thoughtfully curated gift hampers for every occasion. Corporate gifting, festive hampers, and personalised artisanal gift boxes — all handmade with love.",
  },
  {
    path: 'blog',
    url: 'https://amieshomemade.com/blog',
    title: "Blog | Amie's Homemade",
    description: "Recipes, gifting ideas, health tips, and stories about traditional Indian snacks and sweets. Explore the Amie's Homemade blog.",
  },
  {
    path: 'about',
    url: 'https://amieshomemade.com/about',
    title: "About Us | Amie's Homemade",
    description: "Learn the story behind Amie's Homemade — a small-batch kitchen in Ahmedabad crafting authentic Indian mukhwas, snacks, and sweets with no preservatives.",
  },
  {
    path: 'faq',
    url: 'https://amieshomemade.com/faq',
    title: "FAQ | Amie's Homemade",
    description: "Frequently asked questions about ordering, delivery, ingredients, shelf life, and gifting at Amie's Homemade.",
  },
  {
    path: 'contact',
    url: 'https://amieshomemade.com/contact',
    title: "Contact Us | Amie's Homemade",
    description: "Get in touch with Amie's Homemade for orders, bulk inquiries, corporate gifting, or any questions. We'd love to hear from you.",
  },
  {
    path: 'delivery',
    url: 'https://amieshomemade.com/delivery',
    title: "Delivery Areas | Amie's Homemade",
    description: "Amie's Homemade delivers across Ahmedabad and pan-India. Check your delivery area and estimated delivery time.",
  },
  {
    path: 'cities',
    url: 'https://amieshomemade.com/cities',
    title: "Cities We Deliver To | Amie's Homemade",
    description: "Amie's Homemade delivers homemade mukhwas, sweets, snacks, and gift hampers across India. Check if we deliver to your city.",
  },
];

for (const page of PAGES) {
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*"/, `$1${page.url}"`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${escapeHtml(page.title)}"`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*"/, `$1${page.url}"`);

  const dir = join(distDir, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');

  console.log(`  ✓ /${page.path}`);
}

console.log(`\n✅ Pre-rendered ${PAGES.length} section pages`);
