export interface DeliveryArea {
  name: string;
  slug: string;
  tagline: string;
}

export const DELIVERY_AREAS: DeliveryArea[] = [
  { name: 'Satellite',      slug: 'satellite',      tagline: "West Ahmedabad's favourite homemade snack destination" },
  { name: 'Navrangpura',    slug: 'navrangpura',    tagline: 'Fresh mukhwas at the heart of the city' },
  { name: 'Bopal',          slug: 'bopal',          tagline: 'Bringing authentic homemade flavours to New Bopal' },
  { name: 'Prahlad Nagar',  slug: 'prahlad-nagar',  tagline: 'Premium homemade snacks for Prahlad Nagar families' },
  { name: 'Vastrapur',      slug: 'vastrapur',      tagline: 'Home-style mukhwas near Vastrapur Lake' },
  { name: 'Thaltej',        slug: 'thaltej',        tagline: 'Handcrafted snacks delivered across Thaltej' },
  { name: 'Maninagar',      slug: 'maninagar',      tagline: "Old Ahmedabad's favourite homemade mukhwas" },
  { name: 'Paldi',          slug: 'paldi',          tagline: 'Authentic homemade treats for the Paldi community' },
  { name: 'Jodhpur',        slug: 'jodhpur',        tagline: 'Homemade mukhwas & snacks in Jodhpur, Ahmedabad' },
  { name: 'Ambawadi',       slug: 'ambawadi',       tagline: 'Fresh homemade snacks for Ambawadi households' },
  { name: 'Bodakdev',       slug: 'bodakdev',       tagline: 'Handmade mukhwas delivered to your Bodakdev door' },
  { name: 'Chandkheda',     slug: 'chandkheda',     tagline: "North Ahmedabad's homemade snack favourite" },
  { name: 'Gota',           slug: 'gota',           tagline: 'Pure, preservative-free snacks across Gota' },
  { name: 'SG Highway',     slug: 'sg-highway',     tagline: 'Quick delivery all along SG Highway' },
  { name: 'Motera',         slug: 'motera',         tagline: 'Homemade mukhwas delivered to Motera & Sabarmati' },
  { name: 'Naranpura',      slug: 'naranpura',      tagline: 'Authentic homemade snacks for Naranpura families' },
  { name: 'Memnagar',       slug: 'memnagar',       tagline: 'Fresh homemade treats in Memnagar, Ahmedabad' },
  { name: 'Isanpur',        slug: 'isanpur',        tagline: 'Homemade mukhwas & snacks delivered to Isanpur' },
  { name: 'Nikol',          slug: 'nikol',          tagline: 'Authentic snacks & mukhwas across Nikol & Naroda' },
  { name: 'Vastral',        slug: 'vastral',        tagline: 'Pure homemade mukhwas delivered to Vastral' },
  { name: 'Ghatlodia',      slug: 'ghatlodia',      tagline: 'Fresh homemade mukhwas & snacks delivered to Ghatlodia' },
  { name: 'Sola',           slug: 'sola',           tagline: 'Authentic homemade treats delivered across Sola, Ahmedabad' },
  { name: 'Ranip',          slug: 'ranip',          tagline: 'Homemade mukhwas & snacks delivered to Ranip' },
  { name: 'Ellisbridge',    slug: 'ellisbridge',    tagline: 'Pure homemade snacks & mukhwas for Ellisbridge households' },
  { name: 'Science City',   slug: 'science-city',   tagline: 'Handcrafted homemade mukhwas delivered near Science City' },
  { name: 'Shela',          slug: 'shela',          tagline: 'Fresh homemade mukhwas & snacks delivered to Shela' },
  { name: 'Anand Nagar',    slug: 'anand-nagar',    tagline: 'Homemade mukhwas & snacks for Anand Nagar families' },
  { name: 'Drive-In Road',  slug: 'drive-in-road',  tagline: 'Authentic homemade snacks delivered along Drive-In Road' },
  { name: 'Bapunagar',      slug: 'bapunagar',      tagline: 'Pure homemade mukhwas & snacks delivered to Bapunagar' },
  { name: 'Sabarmati',      slug: 'sabarmati',      tagline: 'Homemade mukhwas & snacks delivered to Sabarmati' },
  { name: 'Naroda',         slug: 'naroda',         tagline: 'Fresh homemade snacks & mukhwas across Naroda & Nikol' },
  { name: 'Odhav',          slug: 'odhav',          tagline: 'Handcrafted homemade mukhwas delivered to Odhav' },
];

export const AREA_MAP: Record<string, DeliveryArea> = Object.fromEntries(
  DELIVERY_AREAS.map(a => [a.slug, a])
);
