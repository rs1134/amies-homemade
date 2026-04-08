/**
 * Pre-renders each blog post as a static HTML file in dist/blog/[slug]/index.html.
 * This gives Google the correct title, description, canonical URL, OG image, and
 * BlogPosting schema immediately — without waiting for JavaScript to execute.
 *
 * Run automatically after `vite build` via the build script in package.json.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from '../src/blogs.ts';

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

for (const post of BLOG_POSTS) {
  const url = `https://amieshomemade.com/blog/${post.slug}`;
  const title = `${post.title} | Amie's Homemade`;
  const description = post.excerpt;
  const image = post.coverImage;

  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*"/, `$1${escapeHtml(description)}"`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${escapeHtml(title)}"`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${escapeHtml(description)}"`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*"/, `$1${image}"`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`);
  html = html.replace(/(<meta property="og:type" content=")[^"]*"/, `$1article"`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${escapeHtml(title)}"`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${escapeHtml(description)}"`);
  html = html.replace(/(<meta name="twitter:image" content=")[^"]*"/, `$1${image}"`);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: "Ami Shah", url: 'https://amieshomemade.com/about' },
    publisher: { '@type': 'Organization', name: "Amie's Homemade", url: 'https://amieshomemade.com' },
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.tags?.join(', '),
    articleSection: post.category,
  };

  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);

  const dir = join(distDir, 'blog', post.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');

  console.log(`  ✓ /blog/${post.slug}`);
}

console.log(`\n✅ Pre-rendered ${BLOG_POSTS.length} blog posts`);
