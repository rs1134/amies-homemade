import { toShiprocketCollection, getVisibleProducts, CATEGORY_ID } from '../../src/shiprocketCatalog.ts';

// Seller-hosted "Fetch Collections" API — maps our Category enum (only the
// categories that actually have a visible product) into Shiprocket's
// collections[] schema.
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const page = parseInt(String(req.query.page || '1'), 10);
  const limit = parseInt(String(req.query.limit || '100'), 10);

  const visibleCategories = [...new Set(getVisibleProducts().map(p => p.category))]
    .filter(c => CATEGORY_ID[c] !== undefined);
  const start = (page - 1) * limit;
  const pageItems = visibleCategories.slice(start, start + limit);

  return res.status(200).json({
    data: {
      total: visibleCategories.length,
      collections: pageItems.map(toShiprocketCollection),
    },
  });
}
