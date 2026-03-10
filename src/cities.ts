export interface City {
  name: string;
  slug: string;
  state: string;
  tagline: string;
}

export const CITIES: City[] = [
  { name: 'Mumbai',         slug: 'mumbai',         state: 'Maharashtra',    tagline: "Bringing Ahmedabad's homemade mukhwas to Mumbai's doorstep" },
  { name: 'Delhi',          slug: 'delhi',          state: 'Delhi NCR',      tagline: 'Authentic Gujarati mukhwas & snacks delivered to Delhi NCR' },
  { name: 'Bengaluru',      slug: 'bengaluru',      state: 'Karnataka',      tagline: "Homemade mukhwas & snacks for Bengaluru's discerning palate" },
  { name: 'Chennai',        slug: 'chennai',        state: 'Tamil Nadu',     tagline: 'Fresh homemade Gujarati snacks shipped straight to Chennai' },
  { name: 'Hyderabad',      slug: 'hyderabad',      state: 'Telangana',      tagline: 'Authentic homemade mukhwas delivered to the City of Pearls' },
  { name: 'Kolkata',        slug: 'kolkata',        state: 'West Bengal',    tagline: 'Homemade mukhwas & snacks from Ahmedabad to the City of Joy' },
  { name: 'Pune',           slug: 'pune',           state: 'Maharashtra',    tagline: 'Pure homemade Gujarati treats delivered across Pune' },
  { name: 'Jaipur',         slug: 'jaipur',         state: 'Rajasthan',      tagline: 'Authentic homemade mukhwas & snacks for Jaipur households' },
  { name: 'Surat',          slug: 'surat',          state: 'Gujarat',        tagline: 'Freshly made mukhwas & snacks from Ahmedabad delivered to Surat' },
  { name: 'Lucknow',        slug: 'lucknow',        state: 'Uttar Pradesh',  tagline: 'Homemade snacks & mukhwas delivered to the City of Nawabs' },
  { name: 'Chandigarh',     slug: 'chandigarh',     state: 'Punjab',         tagline: 'Handcrafted mukhwas & homemade snacks delivered to Chandigarh' },
  { name: 'Kochi',          slug: 'kochi',          state: 'Kerala',         tagline: 'Fresh homemade Gujarati mukhwas shipped to the Queen of the Sea' },
  { name: 'Nagpur',         slug: 'nagpur',         state: 'Maharashtra',    tagline: 'Homemade mukhwas & snacks from Ahmedabad to the Orange City' },
  { name: 'Indore',         slug: 'indore',         state: 'Madhya Pradesh', tagline: "Authentic homemade treats delivered to India's food capital" },
  { name: 'Vadodara',       slug: 'vadodara',       state: 'Gujarat',        tagline: 'Fresh homemade mukhwas & snacks for Vadodara households' },
  { name: 'Bhopal',         slug: 'bhopal',         state: 'Madhya Pradesh', tagline: 'Homemade mukhwas & snacks delivered to the City of Lakes' },
  { name: 'Coimbatore',     slug: 'coimbatore',     state: 'Tamil Nadu',     tagline: 'Homemade Gujarati snacks & mukhwas delivered to Coimbatore' },
  { name: 'Visakhapatnam',  slug: 'visakhapatnam',  state: 'Andhra Pradesh', tagline: 'Authentic homemade mukhwas shipped to the City of Destiny' },
  { name: 'Rajkot',         slug: 'rajkot',         state: 'Gujarat',        tagline: 'Freshly made homemade treats from Ahmedabad to Rajkot' },
  { name: 'Patna',          slug: 'patna',          state: 'Bihar',          tagline: 'Homemade mukhwas & snacks delivered to the ancient capital' },
];

export const CITY_MAP: Record<string, City> = Object.fromEntries(
  CITIES.map(c => [c.slug, c])
);
