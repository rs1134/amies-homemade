import { Product, Category } from './types';

export const PRODUCTS: Product[] = [
  // --- GIFTING ---
  {
    id: 'g1',
    name: 'The Royal Heritage Box',
    category: Category.GIFTING,
    price: 1850,
    weight: 'Large Hamper',
    description: 'A curated masterpiece of artisanal flavors, designed for those who appreciate the finer things in life. This heritage collection brings together the best of our kitchen: four signature mukhwas, the indulgent Almond Motichoor Ladoo, and our most-loved crunchy snacks. Elegantly presented.',
    image: 'https://i.postimg.cc/8Cy68DD6/Whats-App-Image-2026-02-12-at-18-57-42-(1).jpg',
    images: [
      'https://i.postimg.cc/1zLyVYrk/Whats-App-Image-2026-02-12-at-18-57-42.jpg',
      'https://i.postimg.cc/8Cy68DD6/Whats-App-Image-2026-02-12-at-18-57-42-(1).jpg'
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
    image: 'https://i.postimg.cc/CKVgFfM5/Whats_App_Image_2026_02_12_at_18_57_44.jpg',
    images: [
      'https://i.postimg.cc/CKVgFfM5/Whats_App_Image_2026_02_12_at_18_57_44.jpg',
      'https://i.postimg.cc/rpLk8tym/Whats_App_Image_2026_02_12_at_18_57_44_(1).jpg'
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
    image: 'https://i.postimg.cc/5tkDXYbB/Whats_App_Image_2026_02_12_at_18_57_59_(1).jpg',
    images: [
      'https://i.postimg.cc/5tkDXYbB/Whats_App_Image_2026_02_12_at_18_57_59_(1).jpg',
      'https://i.postimg.cc/R0b2W64f/Whats_App_Image_2026_02_15_at_20_10_16_(2).jpg'
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
    image: 'https://i.postimg.cc/RVMF1NsY/Whats-App-Image-2026-02-12-at-18-57-58-(2).jpg',
    ingredients: ['Amla', 'Ginger', 'Black Salt'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 }
  },
  {
    id: 'm11',
    name: 'Amla Ginger Beet',
    category: Category.MUKHWAS,
    price: 350,
    weight: '250 G',
    description: 'Vibrant digestive blend combining amla, ginger, and earthy beetroot.',
    image: 'https://i.postimg.cc/YqCTkHDJ/Whats-App-Image-2026-02-15-at-17-53-58.jpg',
    ingredients: ['Amla', 'Ginger', 'Beetroot'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 350, '500 G': 700, '1 KG': 1400 }
  },
  {
    id: 'm2',
    name: 'Chatpati Mango',
    category: Category.MUKHWAS,
    price: 300,
    weight: '250 G',
    description: 'Tangy dried raw mango pieces seasoned with a special homemade spice blend.',
    image: 'https://i.postimg.cc/7hPkzTHJ/Whats-App-Image-2026-02-12-at-18-57-57-(2).jpg',
    ingredients: ['Raw Mango', 'Secret Churan'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 }
  },
  {
    id: 'm3',
    name: 'Black Grape & Til Goli',
    category: Category.MUKHWAS,
    price: 300,
    weight: '250 G',
    description: 'Digestive balls made with nutrient-rich black grapes and toasted black sesame.',
    image: 'https://i.postimg.cc/fLT2j7dX/Whats-App-Image-2026-02-12-at-18-57-55-(2).jpg',
    ingredients: ['Black Grapes', 'Black Til'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 }
  },
  {
    id: 'm4',
    name: 'Tender Coconut Chips',
    category: Category.MUKHWAS,
    price: 375,
    weight: '250 G',
    description: 'Crispy, natural slices of fresh tender coconut. Light and tropical.',
    image: 'https://i.postimg.cc/YjczVQvF/Whats-App-Image-2026-02-12-at-18-57-57-(1).jpg',
    ingredients: ['Coconut', 'Natural Sugar'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 375, '500 G': 750, '1 KG': 1500 }
  },
  {
    id: 'm9',
    name: 'Chocolate Coconut Chips',
    category: Category.MUKHWAS,
    price: 450,
    weight: '250 G',
    description: 'Premium coconut slices coated in rich dark chocolate. A perfect fusion.',
    image: 'https://i.postimg.cc/Y0qqNP2K/Whats-App-Image-2026-02-15-at-17-30-02.jpg',
    ingredients: ['Coconut', 'Cocoa', 'Sugar'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 450, '500 G': 900, '1 KG': 1800 }
  },
  {
    id: 'm10',
    name: 'Dryfruit and Seeds',
    category: Category.MUKHWAS,
    price: 350,
    weight: '250 G',
    description: 'Nutrient-dense mix of roasted almonds, cashews, and super-seeds.',
    image: 'https://i.postimg.cc/j2yMR80k/Whats_App_Image_2026_02_12_at_18_57_55.jpg',
    ingredients: ['Almonds', 'Cashews', 'Pumpkin Seeds'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 350, '500 G': 700, '1 KG': 1400 }
  },
  {
    id: 'm5',
    name: 'Cranberry Mix',
    category: Category.MUKHWAS,
    price: 400,
    weight: '250 G',
    description: 'Vibrant sweet-and-sour mix of premium cranberries and digestive nuts.',
    image: 'https://i.postimg.cc/7Ldv6Qdy/Whats-App-Image-2026-02-15-at-16-57-49.jpg',
    ingredients: ['Cranberries', 'Roasted Nuts'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 400, '500 G': 800, '1 KG': 1600 }
  },
  {
    id: 'm8',
    name: 'Date & Almond',
    category: Category.MUKHWAS,
    price: 350,
    weight: '250 G',
    description: 'Chopped premium dates paired with crunchy almond slivers.',
    image: 'https://i.postimg.cc/qMPpbqjq/Whats-App-Image-2026-02-12-at-18-57-40-(1).jpg',
    ingredients: ['Dates', 'Almonds'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 350, '500 G': 700, '1 KG': 1400 }
  },
  {
    id: 'sf3',
    name: 'Kharek Coconut Almond (Sugarfree)',
    category: Category.MUKHWAS,
    price: 375,
    weight: '250 G',
    description: 'Sugar-free blend of dried dates, coconut, and almond slivers.',
    image: 'https://i.postimg.cc/TYprj74M/Whats-App-Image-2026-02-15-at-17-06-18.jpg',
    ingredients: ['Dried Dates', 'Coconut', 'Almonds'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 375, '500 G': 750, '1 KG': 1500 }
  },

  // --- SWEETS ---
  {
    id: 'sw1',
    name: 'Pista Ghugra / Rava Dryfruit Ghugra',
    category: Category.SWEETS,
    price: 450,
    weight: '250 G',
    description: 'Decadent sweet dumplings. Choose between premium Pista-filled or classic Rava Dryfruit filling.',
    image: 'https://i.postimg.cc/zXPQYwXw/Whats_App_Image_2026_02_15_at_20_10_12.jpg',
    ingredients: ['Pistachios', 'Elaichi', 'Pure Ghee', 'White Flour'],
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
    image: 'https://i.postimg.cc/gk9YN01F/vj17zw61fxrmr0cwejfr4h0s5w.png',
    ingredients: ['Cashews', 'Almonds', 'Pure Ghee', 'Pistachios', 'Elaichi','Saffron'],
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
    image: 'https://i.postimg.cc/FzMwp7Kg/Kajupuri2PS-(5-of-7).jpg',
    ingredients: ['Almonds', 'Cashews', 'Saffron', 'Pure Ghee', 'Pistachios', 'Elaichi'],
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
    image: 'https://i.postimg.cc/5NkrW5NB/Whats_App_Image_2026_02_15_at_20_10_14_(2).jpg',
    ingredients: ['Besan', 'Pure Ghee', 'Almonds', 'Elaichi'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 400, '500 G': 800, '1 KG': 1600 }
  },
  {
    id: 'sw10',
    name: 'Magaz',
    category: Category.SWEETS,
    price: 250,
    weight: '250 G',
    description: 'Beloved Gujarati classic made with coarse gram flour and pure ghee.',
    image: 'https://i.postimg.cc/HkY1h82Q/magas-recipe-2.jpg',
    ingredients: ['Gram Flour', 'Pure Ghee', 'Nuts', 'Elaichi'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 250, '500 G': 500, '1 KG': 1000 }
  },
  {
    id: 'sw11',
    name: 'Dryfruit Mathdi',
    category: Category.SWEETS,
    price: 300,
    weight: '250 G',
    description: 'Sweet, crunchy flaky biscuits enriched with chopped nuts.',
    image: 'https://i.postimg.cc/W1FHNDhx/Whats_App_Image_2026_02_15_at_20_10_16.jpg',
    ingredients: ['White Flour', 'Mixed Nuts', 'Pure Ghee'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 300, '500 G': 600, '1 KG': 1200 }
  },

  // --- SNACKS ---
  {
    id: 's1',
    name: 'Chakri',
    category: Category.SNACKS,
    price: 175,
    weight: '250 G',
    description: 'Classic crunchy spiral snack made with rice flour and spices.',
    image: 'https://i.postimg.cc/5NwjcDyS/wmremove_transformed_(1).jpg',
    ingredients: ['Rice Flour', 'Sesame', 'Mixed Spices', 'Butter', 'Curd'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 175, '500 G': 350, '1 KG': 700 }
  },
  {
    id: 's3',
    name: 'Farsi Puri',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Flaky crispy puri flavored with black pepper and cumin.',
    image: 'https://i.postimg.cc/76RvWPSq/gujarati_farsi_puri_diwali_recipe.jpg',
    ingredients: ['White Flour', 'Black Pepper', 'Cumin Seeds', 'Pure Ghee'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 }
  },
  {
    id: 's4',
    name: 'Masala Puri / Kothmir Marcha Puri',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Spicy crunchy wheat discs, a perfect tea-time companion. Pick your favorite blend.',
    image: 'https://i.postimg.cc/mgK8Jcnz/મસલ_કડક_પર_masala_kadak_puri_recipe_in_gujarati_રસપ_મખય_ફટ.jpg',
    ingredients: ['Wheat Flour', 'Spices', 'Coriander', 'Green Chilli'],
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
    image: 'https://i.postimg.cc/bwPQtQ41/istockphoto_1149101234_1024x1024.jpg',
    ingredients: ['Raw Banana', 'Oil', 'Salt Pepper'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 165, '500 G': 325, '1 KG': 650 }
  },
  {
    id: 's7',
    name: 'Ratalu Chips',
    category: Category.SNACKS,
    price: 215,
    weight: '250 G',
    description: 'Crispy premium purple yam chips, a traditional favorite.',
    image: 'https://i.postimg.cc/X7jjBqxP/રતળ_ચપસ_ratalu_chips_recipe_in_gujarati_રસપ_મખય_ફટ.jpg',
    ingredients: ['Purple Yam', 'Oil', 'Salt and Pepper'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 215, '500 G': 425, '1 KG': 850 }
  },
  {
    id: 's8',
    name: 'Sweet Sakarpara',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Sweet crunchy diamond biscuits made with flour and sugar.',
    image: 'https://i.postimg.cc/2SH7N1X8/cjpjdzmbyhrmw0cwc6783pqgdg.png',
    ingredients: ['Wheat Flour', 'Jaggery', 'Seasame seeds'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 }
  },
  {
    id: 's9',
    name: 'Thiki Sev',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Spicy thin gram flour noodles with a kick of heat.',
    image: 'https://i.postimg.cc/x17NPM4H/istockphoto-2196882416-1024x1024.jpg',
    ingredients: ['Gram Flour', 'Red Chilli', 'Carrum Seeds'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 }
  },
  {
    id: 's10',
    name: 'Khasta Kachori',
    category: Category.SNACKS,
    price: 210,
    weight: '250 G',
    description: 'Flaky deep-fried pastry filled with spiced moong dal.',
    image: 'https://i.postimg.cc/9MX2RNYd/istockphoto-1080623274-1024x1024.jpg',
    ingredients: ['White Flour', 'Spices'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 210, '500 G': 420, '1 KG': 840 }
  },
  {
    id: 's2',
    name: 'Roasted Chevdo',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Traditional savory mix with roasted poha and peanuts.',
    image: 'https://i.postimg.cc/7LrVHFnL/bv8arqx6axrmw0cwc5hbxzzzy0.png',
    ingredients: ['Poha', 'Peanuts', 'Mixed Spices'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 }
  },
  {
    id: 's12',
    name: 'Methi Masala Stick',
    category: Category.SNACKS,
    price: 150,
    weight: '250 G',
    description: 'Crunchy wheat sticks flavored with dried fenugreek leaves.',
    image: 'https://i.postimg.cc/FFybHYyJ/Whats-App-Image-2026-02-19-at-11-57-05.jpg',
    ingredients: ['Wheat Flour', 'Methi Leaves', 'Mixed Spices'],
    weights: ['250 G', '500 G', '1 KG'],
    prices: { '250 G': 150, '500 G': 300, '1 KG': 600 }
  },

  // --- MASALAS ---
  {
    id: 'sm1',
    name: 'Dry Fruit Milk Masala',
    category: Category.MASALA,
    price: 400,
    weight: '100 G',
    description: 'Rich aromatic blend of nuts and saffron for milk.',
    image: 'https://i.postimg.cc/7h7Jcd8w/Whats-App-Image-2026-02-15-at-17-09-52.jpg',
    ingredients: ['Saffron', 'Pistachios', 'Almonds'],
    weights: ['100 G', '250 G'],
    prices: { '100 G': 400, '250 G': 800 }
  },
  {
    id: 'sm2',
    name: 'Chai Masala',
    category: Category.MASALA,
    price: 160,
    weight: '100 G',
    description: 'Hand-ground spices for the perfect authentic Indian chai.',
    image: 'https://i.postimg.cc/tgZq2PHs/Whats-App-Image-2026-02-15-at-17-15-19.jpg',
    ingredients: ['Cardamom', 'Ginger', 'Cinnamon'],
    weights: ['100 G', '250 G'],
    prices: { '100 G': 160, '250 G': 320 }
  }
];

export const WHATSAPP_NUMBER = '+919157537842';
export const STORE_UPI_ID = "bhadreshshah2311-2@okaxis";
export const MERCHANT_NAME = "Amie's Homemade";