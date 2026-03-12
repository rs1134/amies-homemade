// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD NEW POSTS:
//   1. Add a new BlogPost object to BLOG_POSTS below.
//   2. Set publishedAt to a future YYYY-MM-DD date. The post will automatically
//      appear on the website on that date — no code changes needed.
//   3. Recommended cadence: one post every 3–4 days.
// ─────────────────────────────────────────────────────────────────────────────

export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'tip'; heading: string; text: string }
  | { type: 'divider' };

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string; // YYYY-MM-DD — auto-publishes on this date
  readTime: number;    // estimated minutes
  category: string;
  categoryColor: string; // Tailwind bg class
  tags: string[];
  content: ContentBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  // ── POST 1 ───────────────────────────────────────────────────────────────
  {
    id: 'post-1',
    slug: 'top-10-diwali-gift-ideas-gujarati-families',
    title: 'Top 10 Diwali Gift Ideas for Gujarati Families',
    excerpt: 'Diwali is the festival where relationships are renewed through thoughtful gifts. We\'ve curated 10 ideas that strike the perfect balance between tradition and meaning — for every budget.',
    coverImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-03',
    readTime: 5,
    category: 'Gifting',
    categoryColor: 'bg-coral/10 text-coral',
    tags: ['diwali', 'gifting', 'gujarati', 'festival'],
    content: [
      { type: 'p', text: 'Diwali is not just a festival of lights — it is a festival of relationships. In Gujarat especially, the act of gifting during Diwali carries deep meaning. It is a gesture of gratitude, a token of affection, and a way of saying "you matter to me." But with markets overflowing with options, choosing something truly meaningful can feel overwhelming. We have put together this list to help you find something that will be remembered long after the diyas have been extinguished.' },
      { type: 'h2', text: 'Why Traditional Food Gifts Win Every Time' },
      { type: 'p', text: 'Diwali is, at its core, a festival of flavors. From chakli to the delicate crunch of fennel seeds — food is deeply woven into this celebration. When you gift someone a handcrafted food hamper, you are not just giving a product; you are giving an experience that gets shared at the dining table with family. That is why food gifts consistently rank as the most appreciated Diwali presents.' },
      { type: 'h2', text: '1. A Handcrafted Mukhwas Hamper' },
      { type: 'p', text: 'The quintessential Gujarati gift. A beautifully curated mukhwas hamper — especially one made fresh at home with no artificial preservatives — signals both tradition and care. Think five different varieties of mukhwas in airtight glass jars, presented in a handmade wooden box. This is the gift that gets displayed before it gets opened.' },
      { type: 'h2', text: '2. A Personalized Snack Box' },
      { type: 'p', text: 'When you can personalize what goes inside — choosing specific mukhwas varieties, masalas or snacks that you know the recipient will love — the gift transforms from generic to genuinely thoughtful. At Amie\'s, you can choose exactly which traditional treats go into the Heritage Box, making every hamper one-of-a-kind.' },
      { type: 'h2', text: '3. Sugar-Free Options for Health-Conscious Elders' },
      { type: 'p', text: 'With diabetes affecting nearly 77 million Indians, many families have at least one elder who must watch their sugar intake. A sugar-free mukhwas hamper — made with plain fennel seeds, coriander, and sesame — is the gift that says "I thought about your health, not just your taste buds." This is one of the most loving things you can gift to a diabetic grandparent or parent.' },
      { type: 'h2', text: '4. The Wellness Gift Box' },
      { type: 'p', text: 'For the health-first family, a wellness-focused hamper featuring natural seeds, no added sugar, and functional ingredients — ajwain for digestion, fennel for cooling, sesame for nutrients — is a truly thoughtful choice. It says "I care about you" in a language that goes beyond the festival.' },
      { type: 'h2', text: '5. The Corporate Gifting Hamper' },
      { type: 'p', text: 'If you are gifting clients, vendors or business partners this Diwali, a premium Indian food hamper stands out from the sea of standard corporate gifts. It is personal, culturally relevant, and memorable. A wooden presentation box of artisanal mukhwas will be talked about in the office.' },
      { type: 'h2', text: 'The Complete Top 10 List' },
      { type: 'ol', items: [
        'Handcrafted Mukhwas Hamper — traditional and deeply Gujarati',
        'Personalized Heritage Snack Box — choose what goes inside',
        'Sugar-Free Gift Set — for diabetic elders and health-conscious recipients',
        'Wellness Box — functional seeds and no added sugar',
        'Corporate Gifting Hamper — for clients and business relationships',
        'Premium Dry Fruit & Mukhwas Combo — the classic pairing',
        'Artisan Tea + Mukhwas Set — perfect for the chai lover in your life',
        'Children\'s Snack Box — fun-sized treats kids will love',
        'Eco-Friendly Hamper in a Reusable Wooden Box — sustainable gifting',
        'The Grand Heritage Hamper — for your most important relationships',
      ]},
      { type: 'tip', heading: 'Pro Tip: Order Early', text: 'Diwali hampers at Amie\'s are made fresh in small batches and sell out every year. Place your order at least 7–10 days in advance to guarantee delivery before the festival.' },
      { type: 'p', text: 'This Diwali, gift something that will be remembered. Whether you choose a classic mukhwas set or a personalized hamper, the thought behind the gift is what truly makes it shine.' },
    ],
  },

  // ── POST 2 ───────────────────────────────────────────────────────────────
  {
    id: 'post-2',
    slug: 'why-homemade-mukhwas-beats-store-bought',
    title: 'Why Homemade Mukhwas Beats Store-Bought Every Time',
    excerpt: 'Walk into a supermarket and you\'ll find shelves of colorful mukhwas. But turn any packet over and look at the ingredients. Here\'s why homemade always wins — and how to tell the difference.',
    coverImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-06',
    readTime: 4,
    category: 'Food & Lifestyle',
    categoryColor: 'bg-amber-100 text-amber-700',
    tags: ['mukhwas', 'homemade', 'quality', 'natural'],
    content: [
      { type: 'p', text: 'If you have ever bought mukhwas from a supermarket and compared it to something made at home — you know the difference. It is not just taste; it is color, aroma, texture, and the peace of mind that comes from knowing exactly what went into it. Here is why homemade mukhwas will always win.' },
      { type: 'h2', text: 'The Problem with Commercial Mukhwas' },
      { type: 'p', text: 'Walk into any supermarket and you\'ll find shelves lined with colorful mukhwas packets. But turn any of them over and look at the ingredients list. Artificial food colors, refined sugar coatings, synthetic flavor enhancers, and preservatives with names you can\'t pronounce. Many of those neon-green fennel seeds have been dyed with artificial colors. Those candy-coated seeds contain refined sugar that offers no nutritional value and masks the natural flavor of the seed entirely.' },
      { type: 'h2', text: 'What Changes When It Is Made at Home' },
      { type: 'p', text: 'Homemade mukhwas uses only real ingredients. The fennel seeds are raw or lightly roasted. The coriander seeds are natural. The coconut is dried — not processed. The flavors come from genuine spices like dried rose petals, ajwain, and elaichi — not from synthetic "natural flavor" additives. When Ami Shah makes a batch of mukhwas at Amie\'s Homemade, the ingredient list is short and completely legible.' },
      { type: 'h2', text: 'The Freshness Factor' },
      { type: 'p', text: 'Commercial mukhwas sits in warehouses, then distribution centers, then on supermarket shelves for weeks or months. Homemade mukhwas, made in small batches, is typically consumed within weeks of being made. This is not just a taste difference — it is a nutritional one. Fresher fennel seeds retain more of their volatile oils, which are responsible for their genuine digestive and breath-freshening properties.' },
      { type: 'h2', text: 'How to Tell Real Mukhwas from the Processed' },
      { type: 'ul', items: [
        'Color: Natural mukhwas has muted, earthy tones. Unnaturally bright colors suggest artificial dye.',
        'Smell: Genuine mukhwas smells herbaceous and spiced. Synthetic mukhwas often has a candy-like artificial scent.',
        'Texture: Homemade mukhwas is softer and more natural. Heavily processed mukhwas is often crunchy from sugar coating.',
        'Ingredients: If the list is long and includes chemical names, it is probably not real.',
      ]},
      { type: 'tip', heading: 'The Simple Test', text: 'Pour a bit of mukhwas into water. Natural mukhwas will release oils and light sediment. Artificially colored mukhwas will immediately start to bleed dye into the water.' },
      { type: 'p', text: 'The next time you reach for a packet of commercial mukhwas, pause and ask: does this have real ingredients? Is it made fresh? If you are not sure, it is worth choosing something homemade — your body and your taste buds will both thank you.' },
    ],
  },

  // ── POST 3 ───────────────────────────────────────────────────────────────
  {
    id: 'post-3',
    slug: 'best-mukhwas-for-diabetics',
    title: 'Best Mukhwas for Diabetics: Enjoying Tradition Without the Sugar',
    excerpt: 'Managing diabetes during Indian festivals can feel restrictive. But traditional mukhwas ingredients — saunf, dhana, til, ajwain — are naturally low-GI and often beneficial for blood sugar. Here\'s what to look for.',
    coverImage: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-10',
    readTime: 4,
    category: 'Health & Wellness',
    categoryColor: 'bg-green-100 text-green-700',
    tags: ['diabetic', 'sugar-free', 'health', 'mukhwas'],
    content: [
      { type: 'p', text: 'Managing diabetes during Indian festivals can feel like navigating a minefield. The sweets are out. The mithai is off-limits. Even many commercial mukhwas varieties are loaded with refined sugar coatings. But here is the good news: traditional Indian mouth fresheners, in their natural form, are actually among the most diabetic-friendly treats you can enjoy.' },
      { type: 'h2', text: 'Many Traditional Mukhwas Ingredients Are Naturally Low-GI' },
      { type: 'p', text: 'The real ingredients in traditional mukhwas — fennel seeds, coriander seeds, sesame seeds, ajwain, and cardamom — have naturally low glycemic indices. They do not cause the blood sugar spike that refined sugars do. In fact, many of these ingredients have been studied for their ability to support better blood sugar management. This is ancient Ayurvedic wisdom being confirmed by modern research.' },
      { type: 'h2', text: 'The Best Mukhwas Ingredients for Diabetics' },
      { type: 'ul', items: [
        'Saunf (Fennel Seeds): Rich in magnesium, which plays a role in insulin regulation. Studies suggest fennel may help lower blood glucose levels.',
        'Dhana (Coriander Seeds): Traditionally used in Ayurveda to stimulate insulin secretion and support healthy blood sugar. Naturally low in sugar.',
        'Til (Sesame Seeds): Contain pinoresinol, a compound that may help regulate blood sugar by inhibiting the enzyme maltase.',
        'Ajwain (Carom Seeds): Known to support digestive health and reduce blood sugar spikes after meals.',
        'Elaichi (Cardamom): A powerful antioxidant that has shown promise in reducing blood glucose levels in clinical studies.',
      ]},
      { type: 'h2', text: 'What Diabetics Should Avoid in Commercial Mukhwas' },
      { type: 'ul', items: [
        'Sugar-coated fennel seeds — especially the brightly colored variety',
        'Candy-style mukhwas with hard sugar shells',
        'Any mukhwas listing glucose syrup, maltose, or dextrose in the ingredients',
        'Varieties with artificial sweeteners if your doctor has advised against those',
      ]},
      { type: 'h2', text: 'Gifting Tips for Diabetic Family Members' },
      { type: 'p', text: 'When gifting mukhwas to a diabetic elder, look for plain, uncoated varieties with no added sugar. Amie\'s Homemade offers mukhwas made purely from natural seeds with no sugar coating — ideal for diabetics who still want to enjoy the traditional post-meal ritual without the guilt.' },
      { type: 'tip', heading: 'Ask Before You Gift', text: 'If you are unsure whether a family member\'s doctor has specific restrictions, err on the side of caution and gift a plain saunf-only or dhana-til mix. These are among the safest and most universally enjoyed varieties for diabetics.' },
      { type: 'p', text: 'Diabetes does not have to mean sitting out the Diwali mukhwas tradition. With the right choices, your diabetic family members can enjoy the flavors of the season without compromising their health.' },
    ],
  },

  // ── POST 4 ───────────────────────────────────────────────────────────────
  {
    id: 'post-4',
    slug: 'gujarati-snacks-for-corporate-gifting',
    title: 'Gujarati Snacks for Corporate Gifting: Why Authenticity Wins',
    excerpt: 'Every Diwali, offices across India struggle with the same question: what do we give clients that doesn\'t feel generic? The answer is sitting right in Gujarati culinary tradition.',
    coverImage: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-14',
    readTime: 4,
    category: 'Corporate Gifting',
    categoryColor: 'bg-blue-100 text-blue-700',
    tags: ['corporate', 'gifting', 'gujarati', 'snacks'],
    content: [
      { type: 'p', text: 'Every October-November, offices across India grapple with the same question: what do we give our clients this Diwali that does not feel generic, forgettable, or wasteful? The answer, more often than people realize, is sitting right in Gujarati culinary tradition.' },
      { type: 'h2', text: 'Why Generic Corporate Gifts Fall Short' },
      { type: 'p', text: 'Branded mugs. Desk organizers. Diary sets. These gifts check the "we gave something" box, but they rarely create a meaningful impression. Food gifts are consistently ranked among the most appreciated corporate gifts — precisely because they create an experience, not just an object. They get shared at home. They get talked about. And they leave a residual warmth that a branded pen simply cannot.' },
      { type: 'h2', text: 'The Case for Authentic Gujarati Snacks' },
      { type: 'p', text: 'Gujarati food culture is widely respected across India. When you gift someone a hamper of handmade mukhwas, chakli, or premium snacks made in small batches by a home kitchen — you are giving them a piece of a culinary tradition with centuries of history behind it. It signals discernment. It shows you value authenticity over convenience. That message lands with clients.' },
      { type: 'h2', text: 'Gift Hamper Options by Budget' },
      { type: 'ul', items: [
        'Under ₹600: A curated selection of 2–3 mukhwas varieties in premium glass jars — compact, elegant, and impactful.',
        '₹600–₹1,500: The Wellness Box or similar mid-range hamper with 4–5 products in a handcrafted presentation.',
        '₹1,500 and above: The Heritage Box — a full luxury hamper in a wooden presentation case with custom contents. Ideal for senior clients or VIP relationships.',
      ]},
      { type: 'h2', text: 'The Bulk Order Advantage' },
      { type: 'p', text: 'When you order 20+ corporate gift hampers from Amie\'s, you get custom pricing, a consistent look and feel, and the assurance that every hamper is made fresh — not pulled from warehouse stock. Each hamper is made to order, which means no two-year-old nuts hidden inside a shiny box.' },
      { type: 'tip', heading: 'Add a Personal Touch', text: 'Ask for a custom card to be included with each hamper. Even a simple "Wishing you a warm Diwali from [Company Name]" makes the gift feel curated rather than mass-ordered. This small gesture dramatically increases how the recipient perceives the gift.' },
      { type: 'p', text: 'In a world of forgettable gifts, a handcrafted food hamper stands out. And in a culture where food is hospitality, gifting authentic homemade snacks is one of the most thoughtful things a business can do for the people who matter most.' },
    ],
  },

  // ── POST 5 ───────────────────────────────────────────────────────────────
  {
    id: 'post-5',
    slug: 'what-is-mukhwas-complete-guide',
    title: 'What is Mukhwas? A Complete Guide to India\'s Favourite After-Meal Tradition',
    excerpt: 'If you\'ve ever reached into a silver bowl at the end of a Gujarati meal and taken a pinch of fennel and coriander — you\'ve had mukhwas. But what is it, where does it come from, and why has it lasted thousands of years?',
    coverImage: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-18',
    readTime: 5,
    category: 'Culture & Tradition',
    categoryColor: 'bg-purple-100 text-purple-700',
    tags: ['mukhwas', 'tradition', 'ayurveda', 'guide'],
    content: [
      { type: 'p', text: 'If you have ever been to a Gujarati home and noticed a small ornate bowl of colorful seeds near the dining table — you have seen mukhwas. If you have ever reached into a silver dish at the end of a thali meal and taken a pinch of fennel and coriander seeds — you have had mukhwas. But what exactly is it, where does it come from, and why has it been a staple of Indian households for centuries?' },
      { type: 'h2', text: 'The Meaning of the Word' },
      { type: 'p', text: 'The word "mukhwas" comes from Sanskrit: mukh (मुख) meaning mouth, and vas (वास) meaning fragrance or dwelling. Literally, it means "that which dwells in the mouth" — or more poetically, "the fragrance of the mouth." It is the perfect name for something designed to freshen breath, aid digestion, and leave a pleasant lingering flavor after a meal.' },
      { type: 'h2', text: 'Ancient Roots' },
      { type: 'p', text: 'Mukhwas is not a modern invention. References to mouth fresheners using fennel, cardamom, and betel leaves appear in ancient Ayurvedic texts like the Charaka Samhita, written thousands of years ago. Ayurveda considered certain seeds — particularly fennel and cardamom — as essential aids to digestion and balancing of the body\'s doshas, especially pitta. What started as medicine became tradition, and tradition became culture.' },
      { type: 'h2', text: 'The Main Ingredients and Their Traditional Roles' },
      { type: 'ul', items: [
        'Saunf (Fennel): The anchor of most mukhwas. Cooling, digestive, and known to freshen breath naturally.',
        'Dhana (Coriander Seeds): Liver-supporting and cooling. Often paired with saunf for a milder, gentler flavor.',
        'Elaichi (Cardamom): The aromatic luxury of mukhwas. Powerfully digestive and known to neutralize bad breath at the source.',
        'Til (Sesame Seeds): Nutritious and slightly nutty. Added for texture and meaningful calcium content.',
        'Ajwain (Carom Seeds): The functional star — excellent for gas relief and post-meal indigestion.',
        'Dried Rose Petals: A signature Gujarati touch that adds floral fragrance and visual beauty.',
        'Amchur (Dried Mango Powder): Sometimes added for a tangy note that balances richer spices.',
      ]},
      { type: 'h2', text: 'The Gujarati Tradition' },
      { type: 'p', text: 'In Gujarat, offering mukhwas at the end of a meal is considered mandatory hospitality. Restaurants serve it automatically at checkout. Homes keep a dedicated silver or copper bowl of mukhwas on the dining table year-round. At weddings, specially curated mukhwas is given as a wedding favor. It is a gesture of completion — a graceful way to close the meal and send guests on their way with sweetness.' },
      { type: 'h2', text: 'Traditional vs. Modern Mukhwas' },
      { type: 'p', text: 'Traditional mukhwas is uncoated, made from natural seeds, and relies entirely on the inherent flavors of its ingredients. Modern commercial mukhwas often involves sugar coating, artificial colors, and synthetic flavor enhancers that mask the actual seed. The best mukhwas — like what is made at Amie\'s Homemade — remains close to its roots: simple, natural, and deeply flavorful.' },
      { type: 'tip', heading: 'How to Serve Mukhwas', text: 'Store mukhwas in an airtight glass jar at room temperature, away from direct sunlight. Serve in a small bowl at the end of meals. A teaspoon is typically enough — mukhwas is meant to be savored slowly, not consumed in handfuls.' },
      { type: 'p', text: 'Mukhwas is more than a mouth freshener. It is an ancient ritual, a cultural marker, and a daily practice of mindful eating. Every time you take a pinch after a meal, you are participating in a tradition that stretches back thousands of years — and has been perfected ever since.' },
    ],
  },

  // ── POST 6 ───────────────────────────────────────────────────────────────
  {
    id: 'post-6',
    slug: 'how-to-build-perfect-indian-gift-hamper',
    title: 'How to Build the Perfect Indian Gift Hamper: A Step-by-Step Guide',
    excerpt: 'A gift hamper is only as good as the thought that went into building it. Anyone can fill a basket with random items. Here\'s how to build one that will actually be remembered.',
    coverImage: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-22',
    readTime: 5,
    category: 'Gifting',
    categoryColor: 'bg-coral/10 text-coral',
    tags: ['hamper', 'gifting', 'guide', 'tips'],
    content: [
      { type: 'p', text: 'A gift hamper is only as good as the thought that went into building it. Anyone can fill a basket with random items and wrap it in cellophane. But a truly memorable hamper tells a story — about the recipient, the occasion, and the care the giver put in. Here is how to build one that will be remembered long after it is opened.' },
      { type: 'h2', text: 'Step 1 — Define the Occasion' },
      { type: 'p', text: 'The occasion sets the tone for everything else. A Diwali hamper should feel festive and abundant. A birthday hamper should feel personal and celebratory. A corporate hamper should feel polished and professional. A get-well-soon hamper should feel gentle and nurturing. Know your occasion before you pick a single item — it will make every other decision easier.' },
      { type: 'h2', text: 'Step 2 — Know Your Recipient' },
      { type: 'p', text: 'This is where most people get hampers wrong. They build hampers they would want to receive, not what the recipient would love. Ask yourself:' },
      { type: 'ul', items: [
        'Do they have any dietary restrictions? (diabetic, vegan, gluten-free)',
        'What flavors do they prefer? (spicy, tangy, sweet, mild)',
        'What is their lifestyle? (health-first? traditional? adventurous?)',
        'What is the relationship? (close family, acquaintance, business partner)',
      ]},
      { type: 'h2', text: 'Step 3 — Choose a Theme' },
      { type: 'p', text: 'The best hampers have a coherent theme, not a random assortment. Consider:' },
      { type: 'ul', items: [
        'The Traditional Gujarati Hamper: Mukhwas, chakli, masala, and perhaps a small jar of gur.',
        'The Wellness Hamper: Sugar-free mukhwas, herbal seeds, and functional snacks.',
        'The Festive Hamper: Everything seasonal and celebratory — for Diwali, Navratri, or weddings.',
        'The Corporate Hamper: Premium, minimal, and polished — appropriate for professional relationships.',
      ]},
      { type: 'h2', text: 'Step 4 — Select Contents That Complement Each Other' },
      { type: 'p', text: 'The items in a hamper should have a natural flow. If you start with a spicy snack, balance it with something cooling. If you include a rich treat, pair it with a digestive mukhwas. Variety is good — redundancy is not. Three different mukhwas varieties is variety. Ten items that all taste the same is not a hamper, it is a bag of the same thing.' },
      { type: 'h2', text: 'Step 5 — Presentation is Part of the Gift' },
      { type: 'p', text: 'The box, the wrapping, the ribbon — these are not extras. They are the first thing the recipient sees. A beautiful wooden box filled with artisanal products communicates premium quality before a single item is tasted. If you are doing a corporate order, consider custom branding on the box lid or a handwritten tag for each recipient.' },
      { type: 'h2', text: 'Common Mistakes to Avoid' },
      { type: 'ul', items: [
        'Including items you like but the recipient does not enjoy',
        'Mixing products of wildly different quality levels',
        'Skimping on presentation because "it is what is inside that counts"',
        'Ordering at the last minute and missing the delivery window',
        'Forgetting to check for dietary restrictions',
      ]},
      { type: 'tip', heading: 'The Handwritten Note Makes the Difference', text: 'In a world of WhatsApp messages and email, a handwritten card inside a gift hamper stands out dramatically. Even three lines — "I was thinking of you and wanted to share something made with love" — transforms the hamper from a product into a memory.' },
      { type: 'p', text: 'The best gift hamper is one that makes the recipient feel truly seen. It does not need to be the most expensive one. It needs to show that you listened, you observed, and you cared enough to put something together just for them.' },
    ],
  },

  // ── POST 7 ───────────────────────────────────────────────────────────────
  {
    id: 'post-7',
    slug: 'health-benefits-of-saunf-fennel-seeds',
    title: 'Health Benefits of Saunf (Fennel Seeds): India\'s Ancient Digestive Superfood',
    excerpt: 'You\'ve been eating saunf after meals your whole life. But do you know what it\'s actually doing for your body? The science behind this tiny seed is remarkable.',
    coverImage: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-26',
    readTime: 5,
    category: 'Health & Wellness',
    categoryColor: 'bg-green-100 text-green-700',
    tags: ['fennel', 'saunf', 'health', 'ayurveda'],
    content: [
      { type: 'p', text: 'Chances are you have eaten saunf without giving it much thought — a quick handful after a meal at a restaurant, or a few seeds from the bowl at your grandmother\'s dining table. But fennel seeds are far more than a simple mouth freshener. They are one of the most nutritionally dense seeds in the Indian pantry, and Ayurveda has known this for millennia.' },
      { type: 'h2', text: 'What\'s Actually in a Fennel Seed?' },
      { type: 'p', text: 'Despite being tiny, fennel seeds pack a meaningful nutritional punch. One tablespoon (about 6 grams) contains 20 calories, 1 gram of fiber, meaningful amounts of calcium, iron, and magnesium, vitamin C, potassium, and manganese. But the real magic is in the volatile aromatic oils — anethole, fenchone, and estragole — which are responsible for both the distinctive flavor and most of the health benefits.' },
      { type: 'h2', text: 'The Top 7 Health Benefits of Saunf' },
      { type: 'h3', text: '1. Aids Digestion' },
      { type: 'p', text: 'Fennel has powerful antispasmodic properties. Its volatile oils relax the smooth muscles of the digestive tract, reducing bloating, gas, and cramping. This is precisely why it is served after meals — it is not just tradition, it is functional medicine that Ayurveda understood long before modern gastroenterology confirmed it.' },
      { type: 'h3', text: '2. Freshens Breath Naturally' },
      { type: 'p', text: 'The antimicrobial properties of fennel seeds inhibit bacterial growth in the mouth — bacteria being the primary cause of bad breath. Chewing a few seeds releases essential oils that neutralize odor at the source, unlike mint candies which simply mask it temporarily.' },
      { type: 'h3', text: '3. Supports Heart Health' },
      { type: 'p', text: 'Fennel is rich in nitrites, compounds known to help dilate blood vessels and support healthy blood pressure. Its high potassium content further supports cardiovascular function. Regular moderate consumption as part of a balanced diet may contribute to long-term heart health.' },
      { type: 'h3', text: '4. Rich in Antioxidants' },
      { type: 'p', text: 'Fennel seeds contain quercetin, kaempferol, and several flavonoids — antioxidants that help neutralize free radicals and reduce oxidative stress. This is one reason traditional mukhwas was considered a daily health practice, not merely a flavor preference.' },
      { type: 'h3', text: '5. May Help Regulate Blood Sugar' },
      { type: 'p', text: 'The fiber and anethole in fennel seeds may help slow the absorption of glucose in the bloodstream, contributing to more stable blood sugar levels. This makes plain saunf one of the more diabetic-friendly post-meal treats available.' },
      { type: 'h3', text: '6. Supports Eye Health' },
      { type: 'p', text: 'The vitamin C content, combined with flavonoids, supports collagen synthesis in the cornea and may protect against oxidative damage to the eyes. Ancient Ayurvedic texts recommended fennel water for improving eyesight — a practice that continues in many traditional households today.' },
      { type: 'h3', text: '7. Anti-Inflammatory Properties' },
      { type: 'p', text: 'Anethole, the primary active compound in fennel, has been shown in multiple studies to have significant anti-inflammatory effects. This may be beneficial in reducing the risk of chronic inflammatory conditions when fennel is consumed regularly as part of a balanced diet.' },
      { type: 'h2', text: 'How Much Saunf Is Enough?' },
      { type: 'p', text: 'Half a teaspoon to one teaspoon of fennel seeds after meals is a well-tolerated daily amount for most adults. The traditional practice of a small handful after meals has always been intuitively calibrated for this range. As with anything, moderation is key.' },
      { type: 'tip', heading: 'Make Saunf Water', text: 'Soak one teaspoon of fennel seeds in a glass of water overnight. Strain and drink it first thing in the morning. It is a traditional Ayurvedic practice for gentle digestive support, hydration, and a mild anti-inflammatory boost to start the day.' },
      { type: 'p', text: 'The next time you take a pinch of mukhwas after dinner, know that you are not just freshening your breath — you are feeding your body one of nature\'s most versatile functional foods. That little seed has more going on inside it than most trendy superfoods combined.' },
    ],
  },

  // ── POST 8 ───────────────────────────────────────────────────────────────
  {
    id: 'post-8',
    slug: 'best-mukhwas-in-ahmedabad-local-guide',
    title: 'The Best Mukhwas in Ahmedabad: A Local\'s Honest Guide',
    excerpt: 'Ahmedabad takes its mukhwas seriously. From the old city\'s traditional shops to the rise of home kitchens making it fresh — here\'s everything you need to know about finding the real thing.',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop',
    publishedAt: '2026-03-30',
    readTime: 4,
    category: 'Ahmedabad',
    categoryColor: 'bg-teal-100 text-teal-700',
    tags: ['ahmedabad', 'mukhwas', 'local', 'guide'],
    content: [
      { type: 'p', text: 'Ahmedabad has always been a city of food obsessives. From the legendary Manek Chowk to the iconic snack shops of Navrangpura, this city takes its culinary heritage seriously. And mukhwas — that colorful, fragrant ritual of seeds and spices that ends every Gujarati meal — is no exception. Here is everything you need to know about finding genuinely good mukhwas in Ahmedabad.' },
      { type: 'h2', text: 'What Makes Ahmedabad\'s Mukhwas Culture Unique' },
      { type: 'p', text: 'Ahmedabad\'s mukhwas culture is distinct for a few reasons. First, the sheer variety — you will find everything from plain saunf to elaborate 15-ingredient mixes with dried coconut, colored sugar pearls, and silver-coated cardamom. Second, the presentation: Ahmedabad mukhwas shops are a visual experience, with gleaming silver trays and ornate displays. Third, and most importantly, the ritual: mukhwas is not an afterthought here. It is the expected, graceful conclusion to any meal.' },
      { type: 'h2', text: 'The Old City vs. The New City Mukhwas Scene' },
      { type: 'p', text: 'The old city — Manek Chowk, Kalupur, Raipur Darwaja — is home to the most traditional mukhwas sellers. These are shops that have been around for decades, with glass jars of saunf, fennel, dhana, and pan masala sitting on worn wooden counters. The new city — Vastrapur, Satellite, Prahlad Nagar, Thaltej — has seen the rise of modern gifting stores and home-based businesses that bring the same traditional recipes with better packaging and hygiene standards.' },
      { type: 'h2', text: 'What to Look For When Buying Mukhwas in Ahmedabad' },
      { type: 'ul', items: [
        'Freshness: Does the seller know when it was made? Good mukhwas should be fresh, not sitting for months in a warehouse.',
        'Color: Natural, muted tones — light green for saunf, beige for coriander. Not neon artificial hues.',
        'Storage: Is it kept in airtight containers away from direct sunlight and moisture? This matters enormously for shelf life and quality.',
        'Ingredients: If it is pre-packaged, read the label. Avoid long lists with chemical names you cannot pronounce.',
        'Taste: Good mukhwas tastes clean, fresh, and genuinely fragrant. If it tastes artificial or excessively sweet, it has been commercially over-processed.',
      ]},
      { type: 'h2', text: 'Why Home Kitchens Are the Future of Mukhwas' },
      { type: 'p', text: 'The best mukhwas in Ahmedabad today is no longer coming from big commercial brands. It is coming from home kitchens — where recipes have not been compromised for shelf life, where ingredients are sourced fresh, and where the person making it has a genuine relationship with what they are producing. This is a quiet but meaningful shift in how the city\'s food culture is evolving.' },
      { type: 'h2', text: 'Amie\'s Homemade: Ahmedabad\'s Home-Kitchen Standard' },
      { type: 'p', text: 'Ami Shah began making mukhwas the way her mother taught her — with real ingredients, no shortcuts, and an obsessive eye toward getting the flavor exactly right. Today, Amie\'s ships fresh mukhwas across Ahmedabad and pan-India. Every batch is still made by hand, in small quantities, with nothing artificial added. The ingredient list fits on a single line.' },
      { type: 'tip', heading: 'Ordering in Ahmedabad', text: 'Amie\'s offers free home delivery across Ahmedabad, typically within 1 business day of your order. Message directly on WhatsApp to place your order and know exactly when your batch was made.' },
      { type: 'p', text: 'Ahmedabad\'s mukhwas culture is one of the city\'s great quiet pleasures. Whether you are a lifelong resident or visiting for the first time, finding genuinely fresh, fragrant mukhwas — made with honest ingredients by someone who cares — is one of the best culinary experiences this city has to offer.' },
    ],
  },
];

// Returns only posts whose publishedAt date has passed (auto-scheduling)
export const getPublishedPosts = (): BlogPost[] => {
  const today = new Date().toISOString().split('T')[0];
  return BLOG_POSTS.filter(p => p.publishedAt <= today);
};

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find(p => p.slug === slug);

export const getRelatedPosts = (post: BlogPost, limit = 3): BlogPost[] => {
  const today = new Date().toISOString().split('T')[0];
  return BLOG_POSTS
    .filter(p => p.id !== post.id && p.publishedAt <= today && p.category === post.category)
    .slice(0, limit);
};
