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
];

export const AREA_MAP: Record<string, DeliveryArea> = Object.fromEntries(
  DELIVERY_AREAS.map(a => [a.slug, a])
);
