
export enum Category {
  MUKHWAS = 'Mukhwas',
  MASALA = 'Masala',
  SNACKS = 'Snacks',
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
  ingredients: string[];
  weights?: string[];
  prices?: Record<string, number>; // Mapping weight string to price
  isGift?: boolean;
  subOptions?: {
    name: string;
    prices: Record<string, number>;
  }[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedWeight?: string;
  selectedSubOption?: string;
  giftNote?: string;
}