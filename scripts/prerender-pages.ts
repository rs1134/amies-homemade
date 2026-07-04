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
import { HIDDEN_CATEGORIES } from '../src/constants.ts';
import { Category } from '../src/types.ts';

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

interface PageEntry {
  path: string;
  url: string;
  title: string;
  description: string;
  ogImage?: string;
}

const PAGES: PageEntry[] = [
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
  {
    path: 'shop/mukhwas',
    url: 'https://amieshomemade.com/shop/mukhwas',
    title: "Mukhwas | Amie's Homemade",
    description: "Shop our full range of handmade mukhwas — Amla Ginger, Chatpati Mango, Digestive Crunch, and more. Made fresh in small batches with no preservatives.",
    ogImage: 'https://ik.imagekit.io/amieshomemade/067A4467.JPG?tr=w-1200,h-630,fo-auto',
  },
  {
    path: 'shop/traditional-sweets',
    url: 'https://amieshomemade.com/shop/traditional-sweets',
    title: "Traditional Sweets | Amie's Homemade",
    description: "Authentic homemade Indian sweets — Pista Ghugra, Kaju Rotla, Badam Puri, Almond Motichoor Ladoo and more. Made fresh with pure ghee and no preservatives.",
    ogImage: 'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_15_at_20_10_14_2.jpg?tr=w-1200,h-630,fo-auto',
  },
  {
    path: 'shop/gujarati-snacks',
    url: 'https://amieshomemade.com/shop/gujarati-snacks',
    title: "Gujarati Snacks | Amie's Homemade",
    description: "Classic homemade Gujarati namkeen — Chakri, Farsi Puri, Masala Puri, Thiki Sev, Roasted Chevdo and more. Made fresh with no preservatives.",
    ogImage: 'https://ik.imagekit.io/amieshomemade/IMG_8015.JPG?tr=w-1200,h-630,fo-auto',
  },
  {
    path: 'shop/health-wellness',
    url: 'https://amieshomemade.com/shop/health-wellness',
    title: "Health & Wellness | Amie's Homemade",
    description: "Healthy homemade snacks — Makhana, Granola, Masala Protein Beans Mix and more. No preservatives, no artificial additives.",
    ogImage: 'https://ik.imagekit.io/amieshomemade/Granola-jar-with-colorful-label-and-hand.png?tr=w-1200,h-630,fo-auto',
  },
];

// Skip static category pages for hidden categories (see HIDDEN_CATEGORIES
// in constants.ts) — a delisted category shouldn't get a crawlable page
// with full title/description/og-image any more than a delisted product.
const HIDDEN_PAGE_PATHS = new Set<string>();
if (HIDDEN_CATEGORIES.includes(Category.SWEETS)) HIDDEN_PAGE_PATHS.add('shop/traditional-sweets');
if (HIDDEN_CATEGORIES.includes(Category.SNACKS)) HIDDEN_PAGE_PATHS.add('shop/gujarati-snacks');

for (const page of PAGES.filter(p => !HIDDEN_PAGE_PATHS.has(p.path))) {
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*"/, `$1${page.url}"`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${escapeHtml(page.title)}"`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*"/, `$1${page.url}"`);
  if (page.ogImage) {
    html = html.replace(/(<meta property="og:image" content=")[^"]*"/, `$1${page.ogImage}"`);
    html = html.replace(/(<meta name="twitter:image" content=")[^"]*"/, `$1${page.ogImage}"`);
    // Ensure width/height tags exist (Instagram/Facebook use these for validation)
    if (/<meta property="og:image:width"/.test(html)) {
      html = html.replace(/(<meta property="og:image:width" content=")[^"]*"/, `$11200"`);
      html = html.replace(/(<meta property="og:image:height" content=")[^"]*"/, `$1630"`);
    } else {
      html = html.replace(
        /(<meta property="og:image" content="[^"]*" \/>)/,
        `$1\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`
      );
    }
  }

  const dir = join(distDir, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');

  console.log(`  ✓ /${page.path}`);
}

console.log(`\n✅ Pre-rendered ${PAGES.length - HIDDEN_PAGE_PATHS.size} section pages (${HIDDEN_PAGE_PATHS.size} hidden, skipped)`);
