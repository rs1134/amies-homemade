import { Product, Category } from './types.ts';

export const PRODUCTS: Product[] = [
  // --- GIFTING ---
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
    id: 'm1',
    name: 'Amla Ginger',
    category: Category.MUKHWAS,
    price: 300,
    weight: '250 G',
    description: 'A refreshing and digestive blend of dried amla and zesty ginger. Prepared with traditional methods.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-58-2.jpg',
    ingredients: ['Amla', 'Ginger', 'Salt', 'Sugar', 'Black Pepper', 'Black Salt'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 },
    rating: 4.5, reviewCount: 38
  },
  {
    id: 'm11',
    name: 'Amla Ginger Beet',
    category: Category.MUKHWAS,
    price: 350,
    weight: '250 G',
    description: 'Vibrant digestive blend combining amla, ginger, and earthy beetroot.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-15-at-17-53-58.jpg',
    ingredients: ['Amla', 'Beet', 'Ginger', 'Salt', 'Sugar', 'Black Pepper', 'Black Salt'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 350, '500 G': 700, '1 KG': 1400 },
    rating: 4.5, reviewCount: 28
  },
  {
    id: 'm2',
    name: 'Chatpati Mango',
    category: Category.MUKHWAS,
    price: 300,
    weight: '250 G',
    description: 'Tangy dried raw mango pieces seasoned with a special homemade spice blend.',
    image: 'https://ik.imagekit.io/amieshomemade/Chat-GPT-Image-May-18-2026-09-44-23-AM.png',
    ingredients: ['Raw Mango', 'Homemade Anardana Churan'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 },
    rating: 5, reviewCount: 39
  },
  {
    id: 'm3',
    name: 'Black Grape & Til Goli',
    category: Category.MUKHWAS,
    price: 300,
    weight: '250 G',
    description: 'Digestive balls made with nutrient-rich black grapes and toasted black sesame.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-55-2.jpg',
    ingredients: ['Black Grapes', 'Black Sesame Seeds', 'Homemade Anardana Churan'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 },
    rating: 4.5, reviewCount: 35
  },
  {
    id: 'm4',
    name: 'Tender Coconut Vanilla Chips',
    category: Category.MUKHWAS,
    price: 375,
    weight: '250 G',
    description: 'Crispy, natural slices of fresh tender coconut. Light and tropical.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-57-1.jpg',
    ingredients: ['Coconut', 'Vanilla Extract', 'Salt', 'Sugar'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 375, '500 G': 750, '1 KG': 1500 },
    rating: 5, reviewCount: 37
  },
  {
    id: 'm9',
    name: 'Tender Coconut Chocolate Chips',
    category: Category.MUKHWAS,
    price: 450,
    weight: '250 G',
    description: 'Premium coconut slices coated in rich dark chocolate. A perfect fusion.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-15-at-17-30-02.jpg',
    ingredients: ['Coconut', 'Cocoa Powder', 'Salt', 'Sugar'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 450, '500 G': 900, '1 KG': 1800 },
    rating: 4.5, reviewCount: 31
  },
  {
    id: 'm10',
    name: 'Dryfruit and Seeds',
    category: Category.MUKHWAS,
    price: 350,
    weight: '250 G',
    description: 'Nutrient-dense mix of roasted almonds, cashews, and super-seeds.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats_App_Image_2026_02_12_at_18_57_55.jpg',
    ingredients: ['Almond', 'Cashews', 'Dry Dates', 'Coconut', 'Pumpkin Seeds', 'Sunflower Seeds', 'Saunf', 'Dhana Dal', 'Rose Petals', 'Natural Flavouring Substance'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 350, '500 G': 700, '1 KG': 1400 },
    rating: 4.5, reviewCount: 24
  },
  {
    id: 'm5',
    name: 'Cranberry Mix',
    category: Category.MUKHWAS,
    price: 400,
    weight: '250 G',
    description: 'Vibrant sweet-and-sour mix of premium cranberries and digestive nuts.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-15-at-16-57-49.jpg',
    ingredients: ['Cranberries', 'Black Grapes', 'Kismis', 'Almonds', 'Anardana Churan'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 400, '500 G': 800, '1 KG': 1600 },
    rating: 4.5, reviewCount: 19
  },
  {
    id: 'm8',
    name: 'Date & Almond',
    category: Category.MUKHWAS,
    price: 350,
    weight: '250 G',
    description: 'Chopped premium dates paired with crunchy almond slivers.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-40-1.jpg',
    ingredients: ['Dates', 'Almond', 'Anardana Churan'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 350, '500 G': 700, '1 KG': 1400 },
    rating: 4, reviewCount: 22
  },
  {
    id: 'm12',
    name: 'Ginger Chat',
    category: Category.MUKHWAS,
    price: 300,
    weight: '250 G',
    description: 'A bold and tangy mukhwas with the zesty punch of ginger and chaat masala. A unique twist on a classic digestive.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-03-14-at-21-37-48.jpg',
    ingredients: ['Ginger', 'Chaat Masala', 'Black Salt'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 },
    rating: 4.5, reviewCount: 37
  },
  {
    id: 'sf3',
    name: 'Kharek Coconut Almond (Sugarfree)',
    category: Category.MUKHWAS,
    price: 375,
    weight: '250 G',
    description: 'Sugar-free blend of dried dates, coconut, and almond slivers.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-15-at-17-06-18.jpg',
    ingredients: ['Kharek', 'Coconut', 'Almond', 'Natural Flavouring Substance'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 375, '500 G': 750, '1 KG': 1500 },
    rating: 5, reviewCount: 29
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
    image: 'https://ik.imagekit.io/amieshomemade/Chat-GPT-Image-Apr-29-2026-05-33-06-PM.png',
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
    id: 's7',
    name: 'Ratalu Chips',
    category: Category.SNACKS,
    price: 215,
    weight: '250 G',
    description: 'Crispy premium purple yam chips, a traditional favorite.',
    image: 'https://ik.imagekit.io/amieshomemade/istockphoto-1360236832-612x612.jpg',
    ingredients: ['Purple Yam', 'Oil', 'Salt and Pepper'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 215, '500 G': 425, '1 KG': 850 },
    rating: 4, reviewCount: 17,
    outOfStock: true
  },
  {
    id: 's8',
    name: 'Sweet Sakarpara',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Sweet crunchy diamond biscuits made with flour and sugar.',
    image: 'https://ik.imagekit.io/amieshomemade/Namakpare-or-Salty-Shakarpara.jpg',
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
    price: 250,
    weight: '100 G',
    description: 'Light and crispy fox nuts tossed in a bold peri-peri spice blend. A guilt-free snack with a fiery kick.',
    image: 'https://ik.imagekit.io/amieshomemade/Crunchy-crispy-and-full-of-flavor-Healthy-Cravings-Gourav-Ojha.jpg',
    ingredients: ['Fox Nuts (Makhana)', 'Peri-Peri Spice', 'Oil', 'Salt'],
    weights: ['100 G'],
    prices: { '100 G': 250 },
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

  // --- HEALTH & WELLNESS ---
  {
    id: 'hw1',
    name: 'Homemade Healthy Granola',
    category: Category.WELLNESS,
    price: 450,
    weight: '250 G',
    description: 'A wholesome blend of rolled oats, mixed nuts, seeds, dried cranberries, and dates — baked fresh with no preservatives. The perfect nutritious breakfast or snack, crafted the Amie\'s way.',
    image: 'https://ik.imagekit.io/amieshomemade/Granola-jar-with-colorful-label-and-hand.png',
    images: [
      'https://ik.imagekit.io/amieshomemade/Granola-jar-with-colorful-label-and-hand.png'
    ],
    ingredients: ['Pumpkin Seeds', 'Sunflower Seeds', 'White Sesame Seeds', 'Black Sesame Seeds', 'Walnut', 'Cashew', 'Almond', 'Pistachios', 'Medjool Dates', 'Peanut Butter', 'Vanilla Extract', 'Oats'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 450, '500 G': 900, '1 KG': 1800 },
    rating: 5, reviewCount: 38
  },
  {
    id: 'sm1',
    name: 'Dry Fruit Milk Masala',
    category: Category.WELLNESS,
    price: 400,
    weight: '100 G',
    description: 'Rich aromatic blend of nuts and saffron for milk.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-15-at-17-09-52.jpg',
    ingredients: ['Almonds', 'Cashews', 'Pistachios', 'Cardamom (Elaichi)', 'Saffron (Kesar)', 'Nutmeg'],
    weights: ['100 G', '250 G'],
    prices: { '100 G': 400, '250 G': 1000 },
    rating: 4.5, reviewCount: 22
  },
  {
    id: 'sm2',
    name: 'Chai Masala',
    category: Category.WELLNESS,
    price: 320,
    weight: '250 G',
    description: 'Hand-ground spices for the perfect authentic Indian chai.',
    image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-15-at-17-15-19.jpg',
    ingredients: ['Dry Ginger', 'Cinnamon', 'Clove', 'Cardamom (Elaichi)', 'Black Pepper'],
    weights: ['250 G'],
    prices: { '250 G': 320 },
    rating: 4.5, reviewCount: 31
  }
];

export const WHATSAPP_NUMBER = '+919157537842';
export const STORE_UPI_ID = "bhadreshshah2311-2@okaxis";
export const MERCHANT_NAME = "Amie's Homemade";