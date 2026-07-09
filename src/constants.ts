import { Product, Category } from './types.ts';

// ── Catalog visibility (revamp / launch-reveal control) ──────────────────────
// Temporarily hides categories/products from the live site WITHOUT deleting any
// data. To bring something back, just remove it from these lists.
//   - HIDDEN_CATEGORIES: whole categories removed from shop, nav, search, sitemap
//   - HIDDEN_PRODUCT_IDS: individual products hidden (e.g. trimming a category)
//
// RELAUNCH PLAN: Snacks & Sweets are intentionally parked here while their new
// packaging is finalised. To relaunch them, empty HIDDEN_CATEGORIES (`= []`).
// Their product data, images, pages and sitemap entries are all preserved, so
// they come straight back — no rebuild needed. Before relaunch, give each
// snack/sweet its new photos + (if different) a `shelfLife` value, since the
// product page defaults to "6 months" best-before.
export const HIDDEN_CATEGORIES: Category[] = [Category.SNACKS, Category.SWEETS];
export const HIDDEN_PRODUCT_IDS: string[] = ['s13', 's14', 'hw2', 'g1', 'g2', 'g3', 'm11']; // Peri-Peri Makhana, Dry Fruit Makhana, Masala Protein Beans Mix; legacy hampers (replaced by Trio of Traditions & The Gourmet Discovery); Amla Ginger Beet (temporarily out of stock)

export const isProductVisible = (p: Product): boolean =>
  !HIDDEN_CATEGORIES.includes(p.category) && !HIDDEN_PRODUCT_IDS.includes(p.id);

export const isCategoryVisible = (c: Category): boolean =>
  !HIDDEN_CATEGORIES.includes(c);

export const PRODUCTS: Product[] = [
  // --- GIFTING ---
  {
    id: 'g4',
    name: 'Trio of Traditions',
    category: Category.GIFTING,
    price: 999,
    weight: 'Gift Hamper',
    description: 'Three of our most-loved blends in one elegant box — nutrient-rich Dryfruit & Seeds, tangy-sweet Chatpati Mango, and delicate Tender Coconut Vanilla Chips. A perfect introduction to Amie\'s handcrafted mukhwas, beautifully presented for gifting.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4269.JPG?updatedAt=1782443782848',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4269.JPG?updatedAt=1782443782848',
      'https://ik.imagekit.io/amieshomemade/067A4280.JPG?updatedAt=1782443779558',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jul%204,%202026,%2011_56_22%20AM.png',
    ],
    ingredients: ['Dryfruit & Seeds (200g)', 'Chatpati Mango (200g)', 'Tender Coconut Vanilla Chips (125g)'],
    isGift: true
  },
  {
    id: 'g5',
    name: 'The Gourmet Discovery',
    category: Category.GIFTING,
    price: 1499,
    weight: 'Premium Hamper',
    description: 'A premium trio for the discerning palate — wholesome Dryfruit & Seeds, our 12-ingredient Homemade Granola, and the indulgent Almond Motichoor Ladoo. A thoughtfully curated hamper that balances everyday nourishment with a touch of celebration.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4292.JPG?updatedAt=1782443782402',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4292.JPG?updatedAt=1782443782402',
      'https://ik.imagekit.io/amieshomemade/067A4296.JPG?updatedAt=1782443781977',
    ],
    ingredients: ['Dryfruit & Seeds (200g)', 'Homemade Granola (250g)', 'Almond Motichoor Ladoo (250g)'],
    isGift: true
  },
  {
    id: 'g1',
    name: 'The Royal Heritage Box',
    category: Category.GIFTING,
    price: 1850,
    weight: 'Large Hamper',
    description: 'A curated masterpiece of artisanal flavors, designed for those who appreciate the finer things in life. This heritage collection brings together the best of our kitchen: four signature mukhwas, the indulgent Almond Motichoor Ladoo, and our most-loved crunchy snacks. Elegantly presented.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-42-1.jpg',
    images: [
      'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-42.jpg',
      'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-42-1.jpg'
    ],
    ingredients: [
      'Amla Ginger Mukhwas', 
      'Chatpati Mango Mukhwas', 
      'Black Grape Goli', 
      'Tender Coconut Chips', 
      'Almond Motichoor Ladoo', 
      'Traditional Chakri', 
      'Roasted Chevda'
    ],
    isGift: true
  },
  {
    id: 'g2',
    name: 'Wellness Mukhwas Collection',
    category: Category.GIFTING,
    price: 1250,
    weight: 'Medium Box',
    description: 'A thoughtful gift for the health-conscious. Features our signature Amla Ginger, Tender Coconut Chips, and Dryfruit & Seeds mix in elegant glass jars.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_12_at_18_57_44.jpg',
    images: [
      'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_12_at_18_57_44.jpg',
      'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_12_at_18_57_44_1.jpg'
    ],
    ingredients: ['Amla Ginger', 'Coconut Chips', 'Dryfruit Mix'],
    isGift: true
  },
  {
    id: 'g3',
    name: 'Sweet Memories Platter',
    category: Category.GIFTING,
    price: 950,
    weight: 'Gift Box',
    description: 'A sweet selection of our finest traditional bites. Ideal for corporate gifting or small family gatherings.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_12_at_18_57_59_1.jpg',
    images: [
      'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_12_at_18_57_59_1.jpg',
      'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_15_at_20_10_16_2.jpg'
    ],
    ingredients: ['Pista Ghugra', 'Badam Puri', 'Kaju Rotla'],
    isGift: true
  },

  // --- MUKHWAS ---
  {
    id: 'm14',
    name: 'Mukhwas Combo',
    category: Category.MUKHWAS,
    price: 761,
    weight: '530 G',
    description: 'Three of our best-loved mukhwas in one combo — the sweet-crunchy Kharek Coconut Almond, the tangy nutrient-rich Cranberry Mix, and the light, tropical Tender Coconut Vanilla Chips. A perfect way to try our range, at a special combo price.',
    image: 'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jul%209,%202026,%2003_20_50%20PM.png',
    images: [
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jul%209,%202026,%2003_20_50%20PM.png',
      'https://ik.imagekit.io/amieshomemade/067A3029.JPG',
      'https://ik.imagekit.io/amieshomemade/067A3136.JPG?updatedAt=1782443779492',
      'https://ik.imagekit.io/amieshomemade/067A3234.JPG?updatedAt=1782443781375',
    ],
    ingredients: ['Kharek', 'Coconut', 'Almond', 'Natural Flavouring Substance', 'Cranberries', 'Black Grapes', 'Kismis', 'Anardana Churan', 'Vanilla Extract', 'Salt', 'Sugar'],
    prices: { '530 G': 761 },
    rating: 5, reviewCount: 41
  },
  {
    id: 'm5',
    name: 'Cranberry Mix',
    category: Category.MUKHWAS,
    price: 355,
    weight: '215 G',
    description: 'Tart cranberries and crunchy almonds come together in this nutrient-rich blend for a naturally energizing snack. A perfect balance of wholesome goodness and refreshing flavour.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4439.JPG?updatedAt=1782443772420',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4439.JPG?updatedAt=1782443772420',
      'https://ik.imagekit.io/amieshomemade/067A3136.JPG?updatedAt=1782443779492',
      'https://ik.imagekit.io/amieshomemade/067A3179.JPG?updatedAt=1782443778784',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2010_56_04%20AM.png?updatedAt=1782444349678',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.21.10%E2%80%AFPM.png',
    ],
    ingredients: ['Cranberries', 'Black Grapes', 'Kismis', 'Almonds', 'Anardana Churan'],
    prices: { '215 G': 355 },
    rating: 4.5, reviewCount: 34
  },
  {
    id: 'm2',
    name: 'Chatpati Mango',
    category: Category.MUKHWAS,
    price: 264,
    weight: '200 G',
    description: 'Raw mango and anardana come together in this bold, chatpata mukhwas. Combining the tang of raw mango with the zesty kick of traditional churan, it delivers a refreshing, mouth-watering finish to every meal—packed with classic flavour, without the guilt.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4430.JPG?updatedAt=1782443773810',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4430.JPG?updatedAt=1782443773810',
      'https://ik.imagekit.io/amieshomemade/067A3101.JPG?updatedAt=1782443781660',
      'https://ik.imagekit.io/amieshomemade/067A3128.JPG?updatedAt=1782443778827',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2009_27_57%20AM.png?updatedAt=1782444349541',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.26.43%E2%80%AFPM.png',
    ],
    ingredients: ['Raw Mango', 'Homemade Anardana Churan'],
    prices: { '200 G': 264 },
    rating: 5, reviewCount: 64
  },
  {
    id: 'm3',
    name: 'Black Grape & Til Goli',
    category: Category.MUKHWAS,
    price: 264,
    weight: '200 G',
    description: 'Rooted in tradition, this unique blend of black grapes, black sesame, and anardana delivers a delicious balance of sweet, tangy, and nutty flavours. A wholesome mukhwas that makes every meal end on a satisfying note.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4455.JPG?updatedAt=1782443778588',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4455.JPG?updatedAt=1782443778588',
      'https://ik.imagekit.io/amieshomemade/067A3436.JPG?updatedAt=1782443782864',
      'https://ik.imagekit.io/amieshomemade/067A3461.JPG?updatedAt=1782443783639',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2010_41_48%20AM.png?updatedAt=1782444349735',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.20.50%E2%80%AFPM.png?updatedAt=1782463855011',
    ],
    ingredients: ['Black Grapes', 'Black Sesame Seeds', 'Homemade Anardana Churan'],
    prices: { '200 G': 264 },
    rating: 4.5, reviewCount: 39
  },
  {
    id: 'm4',
    name: 'Tender Coconut Vanilla Chips',
    category: Category.MUKHWAS,
    price: 206,
    weight: '125 G',
    description: 'Sourced from the sun-drenched groves of Kerala, our tender coconuts are picked at peak freshness for a light, satisfying crunch. Naturally wholesome and irresistibly delicious, every bite is a tropical escape and the perfect post-meal treat.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4421.JPG?updatedAt=1782443772884',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4421.JPG?updatedAt=1782443772884',
      'https://ik.imagekit.io/amieshomemade/067A3234.JPG?updatedAt=1782443781375',
      'https://ik.imagekit.io/amieshomemade/067A3259.JPG?updatedAt=1782443779904',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2009_32_32%20AM.png?updatedAt=1782444349692',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.43.00%E2%80%AFPM.png',
    ],
    ingredients: ['Coconut', 'Vanilla Extract', 'Salt', 'Sugar'],
    prices: { '125 G': 206 },
    rating: 5, reviewCount: 60
  },
  {
    id: 'm10',
    name: 'Dryfruit and Seeds',
    category: Category.MUKHWAS,
    price: 299,
    weight: '200 G',
    description: 'More than just a mukhwas, this premium blend combines roasted almonds, cashews, dates, rose petals, and wholesome seeds for the perfect balance of crunch and natural sweetness. Rich, satisfying, and crafted to keep you energized throughout the day.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4467.JPG',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4467.JPG',
      'https://ik.imagekit.io/amieshomemade/067A2972.JPG',
      'https://ik.imagekit.io/amieshomemade/067A3012.JPG',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2027,%202026,%2009_47_04%20AM.png',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%209.00.41%E2%80%AFAM.png',
    ],
    ingredients: ['Almond', 'Cashews', 'Dry Dates', 'Coconut', 'Pumpkin Seeds', 'Sunflower Seeds', 'Saunf', 'Dhana Dal', 'Rose Petals', 'Natural Flavouring Substance'],
    prices: { '200 G': 299 },
    rating: 4.5, reviewCount: 56
  },
  {
    id: 'm1',
    name: 'Amla Ginger',
    category: Category.MUKHWAS,
    price: 165,
    weight: '125 G',
    description: 'Inspired by traditional Indian home remedies, our Amla Ginger mukhwas is a light, functional blend designed to refresh your taste and aid digestion naturally.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4410.JPG?updatedAt=1782443772730',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4410.JPG?updatedAt=1782443772730',
      'https://ik.imagekit.io/amieshomemade/067A3367.JPG?updatedAt=1782443777244',
      'https://ik.imagekit.io/amieshomemade/067A3381.JPG?updatedAt=1782443776839',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2010_34_20%20AM.png?updatedAt=1782444349670',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.20.22%E2%80%AFPM.png',
    ],
    ingredients: ['Amla', 'Ginger', 'Salt', 'Sugar', 'Black Pepper', 'Black Salt'],
    prices: { '125 G': 165 },
    rating: 4.5, reviewCount: 39
  },
  {
    id: 'm8',
    name: 'Date & Almond',
    category: Category.MUKHWAS,
    price: 285,
    weight: '215 G',
    description: 'A perfect pairing of naturally sweet dates and crunchy almonds, this wholesome blend delivers rich flavour, satisfying texture, and lasting energy. More than just a mukhwas, it\'s a delicious snack and the perfect light finish to every meal.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4401.JPG?updatedAt=1782443774215',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4401.JPG?updatedAt=1782443774215',
      'https://ik.imagekit.io/amieshomemade/067A3196.JPG?updatedAt=1782443783668',
      'https://ik.imagekit.io/amieshomemade/067A3219.JPG?updatedAt=1782443779319',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2010_29_32%20AM.png?updatedAt=1782444349684',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.19.47%E2%80%AFPM.png',
    ],
    ingredients: ['Dates', 'Almond', 'Anardana Churan'],
    prices: { '215 G': 285 },
    rating: 4.5, reviewCount: 32
  },
  {
    id: 'm12',
    name: 'Ginger Chat',
    category: Category.MUKHWAS,
    price: 225,
    weight: '170 G',
    description: 'Experience the authentic taste of a traditional Indian digestive. Made with real ginger, kala namak, and roasted spices, this premium blend delivers bold flavour in every bite. With zero added sugar and no artificial ingredients, it\'s the perfect clean finish to every meal.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4389.JPG?updatedAt=1782443771109',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4389.JPG?updatedAt=1782443771109',
      'https://ik.imagekit.io/amieshomemade/067A3396.JPG?updatedAt=1782443776831',
      'https://ik.imagekit.io/amieshomemade/067A3381.JPG?updatedAt=1782443776839',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2009_07_21%20AM.png?updatedAt=1782444349137',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.22.03%E2%80%AFPM.png',
    ],
    ingredients: ['Ginger', 'Chaat Masala', 'Black Salt'],
    prices: { '170 G': 225 },
    rating: 4.5, reviewCount: 29
  },
  {
    id: 'sf3',
    name: 'Kharek Coconut Almond',
    category: Category.MUKHWAS,
    price: 285,
    weight: '190 G',
    description: 'Rooted in Gujarati tradition, this premium blend combines sun-dried kharek, toasted coconut flakes, and whole almonds for the perfect balance of sweetness and crunch. Naturally sweetened with zero added sugar, it\'s a wholesome mukhwas crafted for a satisfying finish to every meal.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4479.JPG',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4479.JPG',
      'https://ik.imagekit.io/amieshomemade/067A3029.JPG',
      'https://ik.imagekit.io/amieshomemade/067A3069.JPG',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2011_10_28%20AM.png',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%209.04.09%E2%80%AFAM.png?updatedAt=1782444865788',
    ],
    ingredients: ['Kharek', 'Coconut', 'Almond', 'Natural Flavouring Substance'],
    prices: { '190 G': 285 },
    rating: 5, reviewCount: 52
  },
  {
    id: 'm13',
    name: 'Digestive Crunch',
    category: Category.MUKHWAS,
    price: 264,
    weight: '200 G',
    description: 'Crafted with functional ingredients for freshness and digestive comfort, every ingredient in this mukhwas is carefully chosen to support better digestion. With zero added sugar, it\'s a simple, delicious post-meal ritual that leaves you feeling light and balanced.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4444.JPG?updatedAt=1782443771334',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4444.JPG?updatedAt=1782443771334',
      'https://ik.imagekit.io/amieshomemade/067A3474.JPG?updatedAt=1782443781964',
      'https://ik.imagekit.io/amieshomemade/067A3507.JPG?updatedAt=1782443778909',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2011_24_07%20AM.png?updatedAt=1782444349689',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.21.42%E2%80%AFPM.png',
    ],
    ingredients: ['Black Sesame', 'White Sesame', 'Ajwain', 'Suva (Dill Seeds)', 'Saunf', 'Dhana Dal', 'Amla', 'Turmeric'],
    prices: { '200 G': 264 },
    rating: 4.5, reviewCount: 41
  },
  {
    id: 'm11',
    name: 'Amla Ginger Beet',
    category: Category.MUKHWAS,
    price: 154,
    weight: '100 G',
    description: 'Bold, zesty, and naturally sweet, this premium traditional mukhwas blends three wholesome ingredients into a delicious snack. Rich in fibre, it adds the perfect finishing touch to every meal while making healthy eating more enjoyable.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4449.JPG?updatedAt=1782443771436',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4449.JPG?updatedAt=1782443771436',
      'https://ik.imagekit.io/amieshomemade/067A3311.JPG?updatedAt=1782443783626',
      'https://ik.imagekit.io/amieshomemade/067A3341.JPG?updatedAt=1782443779684',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2009_21_11%20AM.png?updatedAt=1782444349584',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.36.04%E2%80%AFPM.png',
    ],
    ingredients: ['Amla', 'Beet', 'Ginger', 'Salt', 'Sugar', 'Black Pepper', 'Black Salt'],
    prices: { '100 G': 154 },
    rating: 4.5, reviewCount: 38,
    outOfStock: true
  },
  {
    id: 'm9',
    name: 'Tender Coconut Chocolate Chips',
    category: Category.MUKHWAS,
    price: 206,
    weight: '125 G',
    description: 'Handpicked from Kerala\'s sun-drenched groves, our tender coconuts are blended with real cocoa for a rich, chocolatey crunch. High in fibre and naturally satisfying, it\'s the perfect post-meal treat or an energizing snack on the go.',
    image: 'https://ik.imagekit.io/amieshomemade/067A4473.JPG?updatedAt=1782443770088',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A4473.JPG?updatedAt=1782443770088',
      'https://ik.imagekit.io/amieshomemade/067A3270.JPG?updatedAt=1782443783649',
      'https://ik.imagekit.io/amieshomemade/067A3296.JPG',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2009_35_49%20AM.png?updatedAt=1782444349713',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2028,%202026,%2009_58_40%20AM.png',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%202.18.46%E2%80%AFPM.png',
    ],
    ingredients: ['Coconut', 'Cocoa Powder', 'Salt', 'Sugar'],
    prices: { '125 G': 206 },
    rating: 4.5, reviewCount: 48,
    outOfStock: true
  },

  // --- SWEETS ---
  {
    id: 'sw1',
    name: 'Pista Ghugra / Rava Dryfruit Ghugra',
    category: Category.SWEETS,
    price: 450,
    weight: '250 G',
    description: 'Decadent sweet dumplings. Choose between premium Pista-filled or classic Rava Dryfruit filling.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_15_at_20_10_12.jpg',
    ingredients: ['Pistachios', 'Elaichi', 'Pure Ghee', 'White Flour'],
    rating: 5, reviewCount: 36,
    weights: ['250 G', '500 G', '1 KG'],
    subOptions: [
      { 
        name: 'Pista Ghugra', 
        prices: { '250 G': 450, '500 G': 900, '1 KG': 1800 } 
      },
      { 
        name: 'Rava Dryfruit Ghugra', 
        prices: { '250 G': 350, '500 G': 700, '1 KG': 1400 } 
      }
    ]
  },
  {
    id: 'sw3',
    name: 'Kaju/Badam/Pista Badam Rotla',
    category: Category.SWEETS,
    price: 470,
    weight: '250 G',
    description: 'Rich, fudge-like traditional sweet prepared with your choice of Cashews, Almonds or Pistachios.',
    image: 'https://ik.imagekit.io/amieshomemade/vj17zw61fxrmr0cwejfr4h0s5w.png',
    ingredients: ['Cashews', 'Almonds', 'Pure Ghee', 'Pistachios', 'Elaichi','Saffron'],
    rating: 4.5, reviewCount: 33,
    weights: ['250 G', '500 G', '1 KG'],
    subOptions: [
      {
        name: 'Kaju Rotla', 
        prices: { '250 G': 470, '500 G': 940, '1 KG': 1875 } 
      },
      { 
        name: 'Badam Rotla', 
        prices: { '250 G': 470, '500 G': 940, '1 KG': 1875 } 
      },
      { 
        name: 'Pista Badam Rotla', 
        prices: { '250 G': 545, '500 G': 1090, '1 KG': 2175 } 
      }
    ]
  },
  {
    id: 'sw4',
    name: 'Kaju / Badam / Pista Badam Puri',
    category: Category.SWEETS,
    price: 400,
    weight: '250 G',
    description: 'Delicate flaky discs soaked in saffron syrup. Pick your favorite base of Cashews, Almonds, or Pistachios.',
    image: 'https://ik.imagekit.io/amieshomemade/Kajupuri2PS-5-of-7.jpg',
    ingredients: ['Almonds', 'Cashews', 'Saffron', 'Pure Ghee', 'Pistachios', 'Elaichi'],
    rating: 4.5, reviewCount: 26,
    weights: ['250 G', '500 G', '1 KG'],
    subOptions: [
      {
        name: 'Kaju Puri', 
        prices: { '250 G': 400, '500 G': 800, '1 KG': 1600 } 
      },
      { 
        name: 'Badam Puri', 
        prices: { '250 G': 400, '500 G': 800, '1 KG': 1600 } 
      },
      { 
        name: 'Pista Badam Puri', 
        prices: { '250 G': 500, '500 G': 1000, '1 KG': 2000 } 
      }
    ]
  },
  {
    id: 'sw5',
    name: 'Almond Motichoor Ladoo',
    category: Category.SWEETS,
    price: 400,
    weight: '250 G',
    description: 'Premium twist on motichoor with toasted almond slivers.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_15_at_20_10_14_2.jpg',
    ingredients: ['Besan', 'Pure Ghee', 'Almonds', 'Elaichi'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 400, '500 G': 800, '1 KG': 1600 },
    rating: 5, reviewCount: 40
  },
  {
    id: 'sw10',
    name: 'Magaz',
    category: Category.SWEETS,
    price: 250,
    weight: '250 G',
    description: 'Beloved Gujarati classic made with coarse gram flour and pure ghee.',
    image: 'https://ik.imagekit.io/amieshomemade/Chat-GPT-Image-Apr-29-2026-05-37-54-PM.png',
    ingredients: ['Gram Flour', 'Pure Ghee', 'Nuts', 'Elaichi'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 250, '500 G': 500, '1 KG': 1000 },
    rating: 4.5, reviewCount: 18
  },
  {
    id: 'sw11',
    name: 'Dryfruit Mathdi',
    category: Category.SWEETS,
    price: 300,
    weight: '250 G',
    description: 'Sweet, crunchy flaky biscuits enriched with chopped nuts.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_15_at_20_10_16.jpg',
    ingredients: ['White Flour', 'Mixed Nuts', 'Pure Ghee'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 },
    rating: 4, reviewCount: 21
  },

  // --- SNACKS ---
  {
    id: 's1',
    name: 'Chakri',
    category: Category.SNACKS,
    price: 175,
    weight: '250 G',
    description: 'Classic crunchy spiral snack made with rice flour and spices.',
    image: 'https://ik.imagekit.io/amieshomemade/IMG_8015.JPG',
    ingredients: ['Rice Flour', 'Sesame', 'Mixed Spices', 'Butter', 'Curd'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 175, '500 G': 350, '1 KG': 700 },
    rating: 4.5, reviewCount: 34
  },
  {
    id: 's3',
    name: 'Farsi Puri',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Flaky crispy puri flavored with black pepper and cumin.',
    image: 'https://ik.imagekit.io/amieshomemade/4540cc6d6d0f0a3f4c9e1f612e7f0b73.jpg',
    ingredients: ['White Flour', 'Black Pepper', 'Cumin Seeds', 'Pure Ghee'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 },
    rating: 4.5, reviewCount: 38
  },
  {
    id: 's4',
    name: 'Masala Puri / Kothmir Marcha Puri',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Spicy crunchy wheat discs, a perfect tea-time companion. Pick your favorite blend.',
    image: 'https://ik.imagekit.io/amieshomemade/Chat-GPT-Image-May-15-2026-12-41-02-PM.png',
    ingredients: ['Wheat Flour', 'Spices', 'Coriander', 'Green Chilli'],
    rating: 4.5, reviewCount: 33,
    weights: ['250 G', '500 G', '1 KG'],
    subOptions: [
      { 
        name: 'Masala Puri', 
        prices: { '250 G': 150, '500 G': 300, '1 KG': 600 } 
      },
      { 
        name: 'Kothmir Marcha Puri', 
        prices: { '250 G': 165, '500 G': 325, '1 KG': 650 } 
      }
    ]
  },
  {
    id: 's6',
    name: 'Banana Chips',
    category: Category.SNACKS,
    price: 165,
    weight: '250 G',
    description: 'Thinly sliced raw bananas fried to perfection.',
    image: 'https://ik.imagekit.io/amieshomemade/istockphoto_1149101234_1024x1024.jpg',
    ingredients: ['Raw Banana', 'Oil', 'Salt Pepper'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 165, '500 G': 325, '1 KG': 650 },
    rating: 5, reviewCount: 32
  },
  {
    id: 's8',
    name: 'Sweet Sakarpara',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Sweet crunchy diamond biscuits made with flour and sugar.',
    image: 'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20May%2024,%202026,%2011_57_29%20AM.png?tr=w-800,ar-1-1,fo-auto',
    ingredients: ['Wheat Flour', 'Jaggery', 'Seasame seeds'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 },
    rating: 4.5, reviewCount: 23
  },
  {
    id: 's9',
    name: 'Thiki Sev',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Spicy thin gram flour noodles with a kick of heat.',
    image: 'https://ik.imagekit.io/amieshomemade/istockphoto-2196882416-1024x1024.jpg',
    ingredients: ['Gram Flour', 'Red Chilli', 'Carrum Seeds'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 },
    rating: 4.5, reviewCount: 29
  },
  {
    id: 's10',
    name: 'Mini Khasta Kachori',
    category: Category.SNACKS,
    price: 210,
    weight: '250 G',
    description: 'Flaky deep-fried mini pastry bites filled with spiced moong dal.',
    image: 'https://ik.imagekit.io/amieshomemade/Chat-GPT-Image-May-3-2026-01-34-45-PM.png',
    ingredients: ['White Flour', 'Spices'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 210, '500 G': 420, '1 KG': 840 },
    rating: 4.5, reviewCount: 35
  },
  {
    id: 's2',
    name: 'Roasted Chevdo',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Traditional savory mix with roasted poha and peanuts.',
    image: 'https://ik.imagekit.io/amieshomemade/bv8arqx6axrmw0cwc5hbxzzzy0.png',
    ingredients: ['Poha', 'Peanuts', 'Mixed Spices'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 },
    rating: 4.5, reviewCount: 31
  },
  {
    id: 's12',
    name: 'Methi Masala Stick',
    category: Category.SNACKS,
    price: 175,
    weight: '250 G',
    description: 'Crunchy wheat sticks tossed with classic dried fenugreek and a punchy masala blend. A perfect tea-time crunch.',
    image: 'https://ik.imagekit.io/amieshomemade/Chat-GPT-Image-May-15-2026-12-33-47-PM.png',
    ingredients: ['Wheat Flour', 'Methi Leaves', 'Mixed Spices', 'Oil', 'Salt'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 175, '500 G': 350, '1 KG': 700 },
    rating: 4.5, reviewCount: 27
  },

  {
    id: 's13',
    name: 'Peri-Peri Makhana',
    category: Category.WELLNESS,
    price: 225,
    weight: '100 G',
    description: 'Light and crispy fox nuts tossed in a bold peri-peri spice blend. A guilt-free snack with a fiery kick.',
    image: 'https://ik.imagekit.io/amieshomemade/Crunchy-crispy-and-full-of-flavor-Healthy-Cravings-Gourav-Ojha.jpg',
    ingredients: ['Fox Nuts (Makhana)', 'Peri-Peri Spice', 'Oil', 'Salt'],
    weights: ['100 G'],
    prices: { '100 G': 225 },
    isNew: true
  },

  {
    id: 's14',
    name: 'Dry Fruit Makhana',
    category: Category.WELLNESS,
    price: 275,
    weight: '100 G',
    description: 'Light and nutritious fox nuts slow-roasted with premium almonds and cashews. A wholesome, guilt-free snack packed with protein and crunch.',
    image: 'https://ik.imagekit.io/amieshomemade/Chat-GPT-Image-May-14-2026-10-00-18-AM.png',
    ingredients: ['Fox Nuts (Makhana)', 'Almonds', 'Cashews'],
    weights: ['100 G'],
    prices: { '100 G': 275 },
    isNew: true
  },

  {
    id: 's15',
    name: 'Cheese Herb Sticks',
    category: Category.SNACKS,
    price: 175,
    weight: '250 G',
    description: 'Crispy baked sticks packed with rich cheese and fragrant herbs. A savory tea-time snack made fresh with no preservatives — the perfect cheesy crunch in every bite.',
    image: 'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20May%2025,%202026,%2001_45_47%20PM.png',
    ingredients: ['White Flour', 'Cheese', 'Herbs', 'Mixed Spices'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 175, '500 G': 350, '1 KG': 700 },
    isNew: true
  },

  // --- HEALTH & WELLNESS ---
  {
    id: 'hw2',
    name: 'Masala Protein Beans Mix',
    category: Category.WELLNESS,
    price: 275,
    weight: '250 G',
    description: 'Protein-rich blend of soybeans, edamame and black seeds, slow-roasted in pure ghee with aromatic spices. A wholesome, guilt-free snack packed with plant protein.',
    image: 'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20May%2020,%202026,%2012_31_30%20PM.png',
    ingredients: ['Soybeans', 'Edamame Seeds', 'Black Seeds', 'Pure Ghee', 'Mixed Spices'],
    weights: ['250 G', '500 G'],
    prices: { '250 G': 275, '500 G': 550 },
    isNew: true
  },
  {
    id: 'hw1',
    name: 'Homemade Healthy Granola',
    category: Category.WELLNESS,
    price: 450,
    weight: '250 G',
    description: 'Crafted with 12 real ingredients, our granola combines hearty rolled oats, premium walnuts, cashews, pistachios, wholesome seeds, pure peanut butter, and naturally sweet Medjool dates. With zero added sugar and no artificial ingredients, it delivers clean, wholesome nutrition to keep you energized and satisfied throughout the day. Every 100g provides 13.3g of naturally sourced plant-based protein from nuts and seeds, making it a delicious and nourishing way to start your morning.',
    image: 'https://ik.imagekit.io/amieshomemade/067A3622%20(1).jpg',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A3622%20(1).jpg',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jul%204,%202026,%2005_59_49%20PM.png',
      'https://ik.imagekit.io/amieshomemade/067A3625%20(1).JPG',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2011_38_47%20AM.png?updatedAt=1782444349716',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%203.01.54%E2%80%AFPM.png',
    ],
    ingredients: ['Pumpkin Seeds', 'Sunflower Seeds', 'White Sesame Seeds', 'Black Sesame Seeds', 'Walnut', 'Cashew', 'Almond', 'Pistachios', 'Medjool Dates', 'Peanut Butter', 'Vanilla Extract', 'Oats'],
    prices: { '250 G': 450 },
    rating: 5, reviewCount: 38
  },
  {
    id: 'sm1',
    name: 'Dry Fruit Milk Masala',
    category: Category.WELLNESS,
    price: 400,
    weight: '100 G',
    description: 'Bring a luxurious touch of traditional warmth to your everyday routine. This premium, nutrient-rich blend pairs rich nuts with pure saffron to turn a simple glass of warm milk into a deeply comforting treat. Made with zero added sugar and packed with natural protein, it is the perfect wholesome ritual to help your body relax at the end of a busy day.',
    image: 'https://ik.imagekit.io/amieshomemade/067A3596%20(1).JPG?updatedAt=1782826370420',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A3596%20(1).JPG?updatedAt=1782826370420',
      'https://ik.imagekit.io/amieshomemade/067A3606.JPG?updatedAt=1782443775172',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jul%204,%202026,%2006_08_13%20PM.png',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2011_45_06%20AM.png?updatedAt=1782444349708',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%203.05.18%E2%80%AFPM.png',
    ],
    ingredients: ['Almonds', 'Cashews', 'Pistachios', 'Cardamom (Elaichi)', 'Saffron (Kesar)', 'Nutmeg'],
    prices: { '100 G': 400 },
    rating: 4.5, reviewCount: 22
  },
  {
    id: 'sm2',
    name: 'Chai Masala',
    category: Category.WELLNESS,
    price: 320,
    weight: '250 G',
    description: 'Turn your ordinary daily tea into a rich and comforting ritual. This special homemade recipe focuses entirely on real freshness, deep spice flavor, and true authenticity. It is crafted to be completely different from regular, mass-market chai masalas, offering a unique and special way to elevate your morning cup and leave you feeling warm and refreshed.',
    image: 'https://ik.imagekit.io/amieshomemade/067A3534.JPG?updatedAt=1782443783661',
    images: [
      'https://ik.imagekit.io/amieshomemade/067A3534.JPG?updatedAt=1782443783661',
      'https://ik.imagekit.io/amieshomemade/067A3574.JPG?updatedAt=1782443777558',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jul%204,%202026,%2006_27_02%20PM.png',
      'https://ik.imagekit.io/amieshomemade/ChatGPT%20Image%20Jun%2023,%202026,%2011_50_21%20AM.png?updatedAt=1782444349748',
      'https://ik.imagekit.io/amieshomemade/Screenshot%202026-06-26%20at%203.03.42%E2%80%AFPM.png',
    ],
    ingredients: ['Dry Ginger', 'Cinnamon', 'Clove', 'Cardamom (Elaichi)', 'Black Pepper'],
    weights: ['250 G'],
    prices: { '250 G': 320 },
    shelfLife: '1 year',
    rating: 4.5, reviewCount: 31
  }
];

// FSSAI license number shown in each product's Additional Information.
export const FSSAI_LICENSE = '20726034001023';

export const WHATSAPP_NUMBER = '+919157537842';
export const STORE_UPI_ID = "bhadreshshah2311-2@okaxis";
export const MERCHANT_NAME = "Amie's Homemade";