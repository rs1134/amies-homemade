import { PRODUCTS, isProductVisible } from './constants.ts';
import { Category, Product } from './types.ts';

// Shiprocket Checkout's catalog API requires numeric ("long") ids for both
// products[].id and variants[].id, but every product in this codebase has a
// short string id ('m10', 'g4', ...). This file is the single source of
// truth mapping our string ids to stable numeric ones — hand-assigned once,
// never reused or reshuffled, so a product's Shiprocket id never changes
// even if products are added/removed/reordered in constants.ts elsewhere.
//
// Scheme: each product gets a fixed base id below. Each of its weight
// variants gets `base * 100 + variantIndex` (variantIndex is the position of
// that weight in `weights` / `Object.keys(prices)`, so a product with one
// weight always has variantIndex 0 → variant id `base * 100`).
//
// No secrets live here, so this file is safe to import directly from
// frontend code. It's also safe to duplicate into api/*.ts files per this
// repo's existing convention (see comments in api/meta-capi.ts /
// api/notify-order.ts) since Vercel's per-function bundler doesn't reliably
// trace shared imports outside each function's own file.
const PRODUCT_BASE_ID: Record<string, number> = {
  g4: 101, g5: 102, g1: 103, g2: 104, g3: 105,
  m5: 201, m2: 202, m10: 203, m4: 204, m3: 205, m1: 206, m8: 207, m12: 208,
  sf3: 209, m13: 210, m11: 211, m9: 212, m14: 213,
  sw1: 301, sw3: 302, sw4: 303, sw5: 304, sw10: 305, sw11: 306,
  s1: 401, s3: 402, s4: 403, s6: 404, s8: 405, s9: 406, s10: 407, s2: 408, s12: 409, s13: 410, s14: 411, s15: 412,
  hw2: 501, hw1: 502,
  sm1: 601, sm2: 602,
};

export const CATEGORY_ID: Record<Category, number> = {
  [Category.GIFTING]: 1,
  [Category.MUKHWAS]: 2,
  [Category.WELLNESS]: 3,
  [Category.SNACKS]: 4,
  [Category.SWEETS]: 5,
};
const ID_TO_CATEGORY: Record<number, Category> = Object.fromEntries(
  Object.entries(CATEGORY_ID).map(([cat, id]) => [id, cat as Category])
) as Record<number, Category>;

// Note: an empty array is truthy in JS, so `Object.keys(p.prices || {}) || [p.weight]`
// would silently return [] for products with neither `weights` nor `prices`
// (e.g. the gift hampers, which only have a flat `price` field) — checking
// `.length` explicitly at each step avoids that trap.
const weightList = (p: Product): string[] => {
  if (p.weights?.length) return p.weights;
  const priceKeys = Object.keys(p.prices || {});
  if (priceKeys.length) return priceKeys;
  return [p.weight];
};

export const productShiprocketId = (productId: string): number | undefined => PRODUCT_BASE_ID[productId];

export const variantShiprocketId = (productId: string, weight: string): number | undefined => {
  const base = PRODUCT_BASE_ID[productId];
  if (base === undefined) return undefined;
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return undefined;
  const idx = Math.max(0, weightList(product).indexOf(weight));
  return base * 100 + idx;
};

/** Reverse lookup: a Shiprocket variant id -> our {productId, weight}. */
export const resolveVariant = (variantId: number | string): { productId: string; weight: string } | undefined => {
  const id = Number(variantId);
  const base = Math.floor(id / 100);
  const idx = id % 100;
  const productId = Object.entries(PRODUCT_BASE_ID).find(([, b]) => b === base)?.[0];
  if (!productId) return undefined;
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return undefined;
  const weight = weightList(product)[idx] || product.weight;
  return { productId, weight };
};

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Maps one of our Products into Shiprocket's Shopify-like catalog schema. */
export const toShiprocketProduct = (p: Product) => {
  const base = productShiprocketId(p.id);
  const weights = weightList(p);
  return {
    id: base,
    title: p.name,
    body_html: `<p>${p.description}</p>`,
    vendor: "Amie's Homemade",
    product_type: p.category,
    created_at: new Date().toISOString(),
    handle: slugify(p.name),
    updated_at: new Date().toISOString(),
    tags: p.ingredients.join(', '),
    status: p.outOfStock ? 'draft' : 'active',
    variants: weights.map((w, idx) => ({
      id: (base as number) * 100 + idx,
      title: w,
      price: String((p.prices?.[w] ?? p.price).toFixed(2)),
      compare_at_price: null,
      sku: `${p.id}-${w}`.replace(/\s+/g, ''),
      quantity: p.outOfStock ? 0 : 999,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      taxable: true,
      option_values: { Weight: w },
      grams: parseInt(w, 10) || 0,
      image: { src: p.image },
      weight: parseInt(w, 10) || 0,
      weight_unit: 'g',
    })),
    image: { src: p.image },
    options: [{ name: 'Weight', values: weights }],
  };
};

export const toShiprocketCollection = (category: Category) => ({
  id: CATEGORY_ID[category],
  updated_at: new Date().toISOString(),
  body_html: `<p>${category}</p>`,
  handle: slugify(category),
  image: { src: PRODUCTS.find(p => p.category === category)?.image || '' },
  title: category,
  created_at: new Date().toISOString(),
});

export const getVisibleProducts = () => PRODUCTS.filter(isProductVisible);
export const getProductsByCollectionId = (collectionId: number) => {
  const category = ID_TO_CATEGORY[collectionId];
  if (!category) return [];
  return getVisibleProducts().filter(p => p.category === category);
};
