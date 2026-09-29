
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export enum Category {
  MUKHWAS = 'Mukhwas',
  WELLNESS = 'Health & Wellness',
  SNACKS = 'Gujarati Snacks',
  SWEETS = 'Traditional Sweets',
  GIFTING = 'Gifting & Hampers'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // Base price for default weight
  weight: string; // Default weight
  description: string;
  image: string;
  images?: string[];
  /** Poster frame for a video URL included in `images` (e.g. a .mp4 from Vercel Blob, which has no auto-thumbnail like ImageKit does). */
  videoPoster?: string;
  ingredients: string[];
  weights?: string[];
  prices?: Record<string, number>; // Mapping weight string to price
  /** Explicit MRP override. Default (unset): auto-derived as price / 0.9 rounded up to nearest ₹5 (10% off). */
  mrp?: number;
  rating?: number;
  reviewCount?: number;
  /** Shelf life shown in Additional Information, e.g. '6 months' (default) or '1 year'. */
  shelfLife?: string;
  isGift?: boolean;
  isNew?: boolean;
  outOfStock?: boolean;
  subOptions?: {
    name: string;
    prices: Record<string, number>;
    ingredients?: string[];
  }[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedWeight?: string;
  selectedSubOption?: string;
  giftNote?: string;
}