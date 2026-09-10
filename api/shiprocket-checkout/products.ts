import { toShiprocketProduct, getVisibleProducts, getProductsByCollectionId } from '../../src/shiprocketCatalog.ts';

// Seller-hosted catalog API Shiprocket Checkout calls to sync our product
// list. Handles both "Fetch Products" and "Fetch Products by Collection"
// (branches on ?collection_id= presence) since they return the same shape,
// per the integration guide (SR Checkout Integration Guide for Custom
// Websites.pdf, section "Catalog Sync").
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const page = parseInt(String(req.query.page || '1'), 10);
  const limit = parseInt(String(req.query.limit || '100'), 10);
  const collectionId = req.query.collection_id ? parseInt(String(req.query.collection_id), 10) : undefined;

  const source = collectionId !== undefined ? getProductsByCollectionId(collectionId) : getVisibleProducts();
  const start = (page - 1) * limit;
  const pageItems = source.slice(start, start + limit);

  return res.status(200).json({
    data: {
      total: source.length,
      products: pageItems.map(toShiprocketProduct),
    },
  });
}
