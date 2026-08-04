import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Category, Product, CartItem } from './types.ts';
import { PRODUCTS, WHATSAPP_NUMBER, isProductVisible, isCategoryVisible } from './constants.ts';
import { AREA_MAP } from './deliveryAreas.ts';
import { CITY_MAP } from './cities.ts';
import { trackMetaEvent } from './metaTracking.ts';
import Navbar from './components/Navbar.tsx';
import SearchOverlay from './components/SearchOverlay.tsx';
import Hero from './components/Hero.tsx';
import ProductCard from './components/ProductCard.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import AboutUs from './components/AboutUs.tsx';
import GiftingView from './components/GiftingView.tsx';
import CheckoutView from './components/CheckoutView.tsx';
import Cart from './components/Cart.tsx';
import Footer from './components/Footer.tsx';
import Reviews from './components/Reviews.tsx';
import AreaDeliveryPage from './components/AreaDeliveryPage.tsx';
import CityDeliveryPage from './components/CityDeliveryPage.tsx';
import BlogView from './components/BlogView.tsx';
import BlogPostView from './components/BlogPostView.tsx';
import FAQView from './components/FAQView.tsx';
import { getPostBySlug } from './blogs.ts';
import { Sparkles, ArrowRight, MessageCircle, CheckCircle, Users, Mail, Building2 } from 'lucide-react';

const PAGE_SEO: Record<string, { title: string; description: string; canonical: string; ogTitle: string; ogDescription: string }> = {
  home: {
    title: "Amie's Homemade | Mukhwas & Homemade Delights in Ahmedabad",
    description: "Buy handmade mukhwas, granola, chai masala & dry fruit milk masala online from Ahmedabad. Made fresh in small batches with no preservatives. Pan-India delivery.",
    canonical: "https://amieshomemade.com",
    ogTitle: "Amie's Homemade | Mukhwas & Homemade Delights in Ahmedabad",
    ogDescription: "Handmade mukhwas, granola, chai masala & dry fruit milk masala from Ahmedabad. No preservatives. Pan-India delivery.",
  },
  shop: {
    title: "Buy Mukhwas & Wellness Treats Online Ahmedabad | Amie's Homemade",
    description: "Buy homemade mukhwas, granola & masalas online from Ahmedabad. Amla Ginger, Chatpati Mango, Kharek Coconut Almond & more. No preservatives. Pan-India delivery.",
    canonical: "https://amieshomemade.com/shop",
    ogTitle: "Buy Mukhwas & Wellness Treats Online | Amie's Homemade Ahmedabad",
    ogDescription: "Order authentic homemade mukhwas, granola & masalas online from Ahmedabad. Fresh, no preservatives. Pan-India delivery.",
  },
  about: {
    title: "Our Story | Amie's Homemade — Homemade Mukhwas Brand in Ahmedabad",
    description: "Meet Ami Shah, founder of Amie's Homemade — Ahmedabad's favourite homemade mukhwas & wellness brand. Authentic recipes, no preservatives, made with love.",
    canonical: "https://amieshomemade.com/about",
    ogTitle: "Our Story | Amie's Homemade — Ahmedabad's Mukhwas Brand",
    ogDescription: "Meet Ami Shah — the heart behind Ahmedabad's favourite homemade mukhwas & wellness brand. Authentic recipes made with love.",
  },
  gifting: {
    title: "Diwali & Wedding Gift Hampers Ahmedabad | Amie's Homemade",
    description: "Premium handmade gift hampers in Ahmedabad for Diwali, weddings & corporate events. Custom mukhwas gift boxes. Pan-India delivery.",
    canonical: "https://amieshomemade.com/gifting",
    ogTitle: "Diwali & Wedding Gift Hampers | Amie's Homemade Ahmedabad",
    ogDescription: "Best handmade Indian food gift hampers in Ahmedabad for Diwali, weddings & corporate gifting. Custom boxes with pan-India delivery.",
  },
  contact: {
    title: "Contact Amie's Homemade | Order Mukhwas & Wellness Treats in Ahmedabad",
    description: "Order mukhwas, granola, masalas & gift hampers from Ahmedabad. Chat on WhatsApp or email hello@amieshomemade.com. Bulk & wholesale inquiries welcome.",
    canonical: "https://amieshomemade.com/contact",
    ogTitle: "Contact Amie's Homemade — Ahmedabad Mukhwas & Wellness Treats",
    ogDescription: "Order mukhwas, granola, masalas & gift hampers in Ahmedabad. Chat on WhatsApp or email for bulk pricing and custom hampers.",
  },
  checkout: {
    title: "Checkout | Amie's Homemade",
    description: "Complete your order for fresh homemade mukhwas & wellness treats from Amie's Homemade.",
    canonical: "https://amieshomemade.com/checkout",
    ogTitle: "Checkout | Amie's Homemade",
    ogDescription: "Complete your order for fresh homemade Indian mukhwas & wellness treats.",
  },
  blog: {
    title: "The Journal | Amie's Homemade — Mukhwas, Gifting & Food Stories",
    description: "Gifting guides, mukhwas wisdom, health stories and Ayurvedic food traditions from Amie's home kitchen in Ahmedabad. New stories every week.",
    canonical: "https://amieshomemade.com/blog",
    ogTitle: "The Journal | Amie's Homemade Blog",
    ogDescription: "Gifting guides, mukhwas stories, and wellness food wisdom from Amie's home kitchen in Ahmedabad.",
  },
  faq: {
    title: "FAQs | Amie's Homemade — Mukhwas, Wellness & Gift Hampers",
    description: "Answers to your most common questions about Amie's Homemade — ingredients, preservatives, delivery, custom hampers, corporate gifting, and more.",
    canonical: "https://amieshomemade.com/faq",
    ogTitle: "Frequently Asked Questions | Amie's Homemade",
    ogDescription: "Everything you need to know about Amie's Homemade — ingredients, ordering, delivery, and corporate gifting.",
  },
};

const BREADCRUMBS: Record<string, Array<{ name: string; item: string }>> = {
  home:     [{ name: 'Home', item: 'https://amieshomemade.com' }],
  shop:     [{ name: 'Home', item: 'https://amieshomemade.com' }, { name: 'Shop Mukhwas & Wellness', item: 'https://amieshomemade.com/shop' }],
  about:    [{ name: 'Home', item: 'https://amieshomemade.com' }, { name: 'Our Story', item: 'https://amieshomemade.com/about' }],
  gifting:  [{ name: 'Home', item: 'https://amieshomemade.com' }, { name: 'Gift Hampers', item: 'https://amieshomemade.com/gifting' }],
  contact:  [{ name: 'Home', item: 'https://amieshomemade.com' }, { name: 'Contact Us', item: 'https://amieshomemade.com/contact' }],
  checkout: [{ name: 'Home', item: 'https://amieshomemade.com' }, { name: 'Checkout', item: 'https://amieshomemade.com/checkout' }],
  blog:     [{ name: 'Home', item: 'https://amieshomemade.com' }, { name: 'The Journal', item: 'https://amieshomemade.com/blog' }],
  faq:      [{ name: 'Home', item: 'https://amieshomemade.com' }, { name: 'FAQs', item: 'https://amieshomemade.com/faq' }],
};

const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  shop: '/shop',
  about: '/about',
  gifting: '/gifting',
  checkout: '/checkout',
  contact: '/contact',
  delivery: '/delivery',
  cities: '/cities',
  blog: '/blog',
  faq: '/faq',
};

const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page])
);

const ikImg = (url: string, w: number) => {
  if (!url || !url.includes('ik.imagekit.io')) return url;
  return `${url.split('?')[0]}?tr=w-${w},q-80,f-auto`;
};

// Product URL helpers
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const PRODUCT_SLUG_MAP: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map(p => [slugify(p.name), p])
);

// A hidden product (see HIDDEN_CATEGORIES in constants.ts) has no static
// prerendered page any more, but the SPA shell still resolves — this keeps
// direct navigation to its old URL from client-rendering full product
// content, which would otherwise let it get re-indexed via Googlebot's JS
// rendering pass even after the static page and sitemap entry are gone.
const getVisibleProductFromSlug = (slug: string): Product | null => {
  const product = PRODUCT_SLUG_MAP[slug];
  return product && isProductVisible(product) ? product : null;
};

const getProductSlugFromPath = (path: string): string => {
  const m = path.match(/^\/(?:shop|gifting)\/(.+)$/);
  return m ? m[1] : '';
};

// Category ↔ URL slug mapping
const CATEGORY_SLUG: Partial<Record<Category | 'All', string>> = {
  [Category.MUKHWAS]:  'mukhwas',
  [Category.WELLNESS]: 'health-wellness',
  [Category.SNACKS]:   'snacks',
  [Category.SWEETS]:   'traditional-sweets',
  [Category.GIFTING]:  'hampers',
};
const SLUG_TO_CATEGORY: Record<string, Category | 'All'> = {
  'mukhwas':           Category.MUKHWAS,
  'health-wellness':   Category.WELLNESS,
  'snacks':            Category.SNACKS,
  'traditional-sweets': Category.SWEETS,
  'hampers':           Category.GIFTING,
};
// Display override for the Shop category tab only — the underlying
// Category value stays 'Gifting & Hampers' everywhere else (routing,
// SEO, schema), this just changes what shoppers see on the pill/dropdown.
const CATEGORY_DISPLAY_LABEL: Partial<Record<Category, string>> = {
  [Category.GIFTING]: 'Rakhi Hampers',
};
const getCategoryFromPath = (path: string): Category | 'All' => {
  const m = path.match(/^\/shop\/([^/]+)$/);
  if (!m) return 'All';
  return SLUG_TO_CATEGORY[m[1]] ?? 'All';
};

const getAreaFromPath = (path: string): string => {
  const m = path.match(/^\/delivery\/(.+)$/);
  return m ? m[1] : '';
};

const getCityFromPath = (path: string): string => {
  const m = path.match(/^\/cities\/(.+)$/);
  return m ? m[1] : '';
};

const getBlogSlugFromPath = (path: string): string => {
  const m = path.match(/^\/blog\/(.+)$/);
  return m ? m[1] : '';
};

const getPageFromPath = (path: string): string => {
  if (path.startsWith('/delivery')) return 'delivery';
  if (path.startsWith('/cities')) return 'cities';
  if (path.startsWith('/shop')) return 'shop';
  if (path.startsWith('/gifting')) return 'gifting';
  if (path.startsWith('/blog')) return 'blog';
  if (path.startsWith('/faq')) return 'faq';
  if (path === '/order-confirmed') return 'checkout';
  return PATH_TO_PAGE[path] || 'home';
};

// ── CategoryFilterBar ────────────────────────────────────────────────────────
interface CategoryFilterBarProps {
  activeCategory: Category | 'All';
  onSelect: (cat: Category | 'All') => void;
  onSelectProduct: (product: Product) => void;
}

const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({ activeCategory, onSelect, onSelectProduct }) => {
  const [openCat, setOpenCat] = React.useState<Category | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (cat: Category) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenCat(cat);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenCat(null), 150);
  };
  const toggleMenu = (cat: Category) => {
    setOpenCat(prev => prev === cat ? null : cat);
  };

  const productsFor = (cat: Category) =>
    PRODUCTS.filter(p => p.category === cat && !p.outOfStock && (cat === Category.GIFTING || !p.isGift) && isProductVisible(p));

  const categories: Array<Category | 'All'> = ['All', ...Object.values(Category).filter(c => isCategoryVisible(c))];

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {categories.map(cat => {
          const isAll = cat === 'All';
          const isActive = activeCategory === cat;
          const isOpen = !isAll && openCat === cat;
          const catLabel = isAll ? 'All' : (CATEGORY_DISPLAY_LABEL[cat as Category] ?? cat);

          return (
            <div
              key={cat}
              className="relative"
              onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !isAll) openMenu(cat as Category); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse' && !isAll) scheduleClose(); }}
            >
              <div
                className={`brand-rounded transition-all rounded-full border-2 flex items-center ${
                  isActive
                    ? 'bg-[#F04E4E] border-[#F04E4E] text-white shadow-xl shadow-[#F04E4E]/30 scale-105'
                    : isOpen
                    ? 'border-[#F04E4E] text-coral bg-[#F04E4E]/5'
                    : 'border-[#F04E4E]/10 text-[#4A3728]/50 hover:text-coral hover:bg-[#F04E4E]/5'
                }`}
              >
                {/* Tapping the label navigates straight to that category's full listing */}
                <a
                  href={isAll ? '/shop' : `/shop/${CATEGORY_SLUG[cat as Category]}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(cat);
                    setOpenCat(null);
                  }}
                  className={`text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold cursor-pointer ${
                    isAll ? 'px-4 sm:px-8 py-2.5 sm:py-3' : 'pl-4 sm:pl-8 py-2.5 sm:py-3 pr-1'
                  }`}
                >
                  {catLabel}
                </a>
                {/* Chevron opens the product-preview dropdown without navigating */}
                {!isAll && (
                  <button
                    type="button"
                    onClick={() => toggleMenu(cat as Category)}
                    aria-label={`Preview ${catLabel} products`}
                    className="pl-1 pr-4 sm:pr-8 py-2.5 sm:py-3 cursor-pointer flex items-center"
                  >
                    <svg
                      width="10" height="10" viewBox="0 0 10 10"
                      className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                      fill="currentColor"
                    >
                      <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Desktop floating dropdown */}
              {isOpen && (
                <div
                  className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
                  onMouseEnter={() => openMenu(cat as Category)}
                  onMouseLeave={scheduleClose}
                >
                  <div className="bg-white rounded-2xl shadow-2xl border border-[#4A3728]/8 overflow-hidden min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => { onSelect(cat); setOpenCat(null); }}
                      className="w-full text-left px-4 py-3 text-[10px] font-black brand-rounded uppercase tracking-widest text-[#F04E4E] bg-[#F04E4E]/5 hover:bg-[#F04E4E]/10 transition-colors border-b border-[#F04E4E]/10 flex items-center justify-between"
                    >
                      <span>View All {catLabel}</span>
                      <span>→</span>
                    </button>
                    <div className="py-1.5">
                      {productsFor(cat as Category).map(product => (
                        <a
                          key={product.id}
                          href={`/${product.category === Category.GIFTING ? 'gifting' : 'shop'}/${slugify(product.name)}`}
                          onClick={(e) => { e.preventDefault(); onSelectProduct(product); setOpenCat(null); }}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-[#4A3728]/80 hover:text-[#F04E4E] hover:bg-[#F04E4E]/5 transition-colors font-medium flex items-center gap-2 group/item"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4A3728]/15 group-hover/item:bg-[#F04E4E] transition-colors flex-shrink-0" />
                          {product.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile bottom sheet — shown when any category is open */}
      {openCat && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-[100]"
            onClick={() => setOpenCat(null)}
          />
          {/* Sheet */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[75vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-[#4A3728]/20 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#4A3728]/8 flex-shrink-0">
              <span className="text-sm font-black brand-rounded uppercase tracking-widest text-[#4A3728]">{openCat ? (CATEGORY_DISPLAY_LABEL[openCat] ?? openCat) : ''}</span>
              <button onClick={() => setOpenCat(null)} className="p-1 text-[#4A3728]/40">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {/* View All */}
            <button
              onClick={() => { onSelect(openCat); setOpenCat(null); }}
              className="mx-4 mt-3 mb-1 py-3 rounded-2xl bg-[#F04E4E] text-white font-black brand-rounded text-xs uppercase tracking-widest flex-shrink-0"
            >
              View All {openCat ? (CATEGORY_DISPLAY_LABEL[openCat] ?? openCat) : ''} →
            </button>
            {/* Product list */}
            <div className="overflow-y-auto flex-1 px-4 pb-8 pt-2">
              {productsFor(openCat).map(product => (
                <a
                  key={product.id}
                  href={`/${product.category === Category.GIFTING ? 'gifting' : 'shop'}/${slugify(product.name)}`}
                  onClick={(e) => { e.preventDefault(); onSelectProduct(product); setOpenCat(null); }}
                  className="w-full text-left py-3.5 border-b border-[#4A3728]/6 text-[15px] text-[#4A3728]/80 font-medium flex items-center gap-3 active:text-[#F04E4E]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F04E4E]/40 flex-shrink-0" />
                  {product.name}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const CART_STORAGE_KEY = 'amies_cart_v1';
const COUPON_APPLIED_KEY = 'amies_coupon_applied_v1';

const loadSavedCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];
    const items: CartItem[] = JSON.parse(saved);
    // Drop items for products that no longer exist on the site
    return items.filter(i => PRODUCTS.some(p => p.id === i.id));
  } catch {
    return [];
  }
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(() => getPageFromPath(window.location.pathname));
  const [currentArea, setCurrentArea] = useState(() => getAreaFromPath(window.location.pathname));
  const [currentCity, setCurrentCity] = useState(() => getCityFromPath(window.location.pathname));
  const [currentBlogSlug, setCurrentBlogSlug] = useState(() => getBlogSlugFromPath(window.location.pathname));
  const [cart, setCart] = useState<CartItem[]>(loadSavedCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Coupon is stored as a boolean flag (not a frozen amount) so the discount is
  // always recomputed live from the current cart — quantity changes & refreshes
  // can never desync it. Persisted so a checkout-page refresh keeps the coupon.
  const [couponApplied, setCouponApplied] = useState<boolean>(() => {
    try { return localStorage.getItem(COUPON_APPLIED_KEY) === '1'; } catch { return false; }
  });
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>(() => getCategoryFromPath(window.location.pathname));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const slug = getProductSlugFromPath(window.location.pathname);
    return slug ? getVisibleProductFromSlug(slug) : null;
  });
  // Remembers which page/category a product was opened from, so closing it
  // (or hitting back) returns there — e.g. Shop's Gifting & Hampers tab —
  // instead of always falling back to the product's own category page.
  const productOriginRef = useRef<{ page: string; category: Category | 'All' } | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  // Persist cart so it survives refresh / accidental tab close
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch { /* storage full or blocked — non-fatal */ }
  }, [cart]);

  // Persist the coupon flag so a checkout-page refresh keeps the discount
  useEffect(() => {
    try {
      if (couponApplied) localStorage.setItem(COUPON_APPLIED_KEY, '1');
      else localStorage.removeItem(COUPON_APPLIED_KEY);
    } catch { /* non-fatal */ }
  }, [couponApplied]);

  // A coupon with no items is meaningless — drop it when the cart empties
  useEffect(() => {
    if (cart.length === 0 && couponApplied) setCouponApplied(false);
  }, [cart.length, couponApplied]);

  // Delivery announcement bar
  const DELIVERY_BANNER = {
    primary: 'Free delivery across Ahmedabad',
    secondary: 'Delivery within 2 days',
  };

  const navigate = useCallback((page: string) => {
    const path = PAGE_TO_PATH[page] || '/';
    window.history.pushState(null, '', path);
    setCurrentPage(page);
    setCurrentArea('');
    setCurrentCity('');
    setCurrentBlogSlug('');
    setSelectedProduct(null);
    if (page === 'shop') setActiveCategory('All');
  }, []);

  const navigateToCategory = useCallback((cat: Category) => {
    const slug = CATEGORY_SLUG[cat];
    window.history.pushState(null, '', slug ? `/shop/${slug}` : '/shop');
    setCurrentPage('shop');
    setActiveCategory(cat);
    setCurrentArea('');
    setCurrentCity('');
    setCurrentBlogSlug('');
  }, []);

  const navigateToBlog = useCallback((slug?: string) => {
    const path = slug ? `/blog/${slug}` : '/blog';
    window.history.pushState(null, '', path);
    setCurrentPage('blog');
    setCurrentBlogSlug(slug || '');
    setCurrentArea('');
    setCurrentCity('');
  }, []);

  const navigateToArea = useCallback((slug: string) => {
    const path = slug ? `/delivery/${slug}` : '/delivery';
    window.history.pushState(null, '', path);
    setCurrentPage('delivery');
    setCurrentArea(slug);
    setCurrentCity('');
  }, []);

  const navigateToCity = useCallback((slug: string) => {
    const path = slug ? `/cities/${slug}` : '/cities';
    window.history.pushState(null, '', path);
    setCurrentPage('cities');
    setCurrentCity(slug);
    setCurrentArea('');
  }, []);

  const openProduct = useCallback((product: Product) => {
    // Remember where we're opening this from, so closing it returns to the
    // same tab/category instead of guessing from the product's own category
    // (e.g. a hamper opened from Shop's Gifting & Hampers tab should return
    // there, not to the separate /gifting marketing page).
    productOriginRef.current = { page: currentPage, category: activeCategory };
    const slug = slugify(product.name);
    const isGifting = product.category === Category.GIFTING;
    const basePath = isGifting ? '/gifting' : '/shop';
    window.history.pushState(null, '', `${basePath}/${slug}`);
    setSelectedProduct(product);
    setCurrentPage(isGifting ? 'gifting' : 'shop');
  }, [currentPage, activeCategory]);

  const closeProduct = useCallback(() => {
    const origin = productOriginRef.current;
    productOriginRef.current = null;
    if (origin && origin.page === 'shop') {
      const cat = origin.category;
      const slug = cat !== 'All' ? CATEGORY_SLUG[cat as Category] : undefined;
      window.history.pushState(null, '', slug ? `/shop/${slug}` : '/shop');
      setActiveCategory(cat);
      setCurrentPage('shop');
    } else if (origin && origin.page === 'gifting') {
      window.history.pushState(null, '', '/gifting');
      setCurrentPage('gifting');
    } else {
      // No known origin (e.g. product opened via a direct deep link) —
      // fall back to the product's own category, same as before.
      const isGifting = selectedProduct?.category === Category.GIFTING;
      window.history.pushState(null, '', isGifting ? '/gifting' : '/shop');
      if (!isGifting) setActiveCategory('All');
      setCurrentPage(isGifting ? 'gifting' : 'shop');
    }
    setSelectedProduct(null);
  }, [selectedProduct]);

  // Sync page state with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setCurrentPage(getPageFromPath(path));
      setCurrentArea(getAreaFromPath(path));
      setCurrentCity(getCityFromPath(path));
      setCurrentBlogSlug(getBlogSlugFromPath(path));
      const slug = getProductSlugFromPath(path);
      setSelectedProduct(slug ? getVisibleProductFromSlug(slug) : null);
      setActiveCategory(getCategoryFromPath(path));
      // Reset order confirmation if navigating away from /order-confirmed
      if (path !== '/order-confirmed') setOrderComplete(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // ⌘K / Ctrl+K global shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update page title, meta tags, canonical, OG image, and all structured data per page
  useEffect(() => {
    let seo = PAGE_SEO[currentPage] || PAGE_SEO.home;
    let ogImage: string | null = null;
    const DEFAULT_OG_IMAGE = 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-42-1.jpg';

    if (currentPage === 'blog' && currentBlogSlug) {
      const post = getPostBySlug(currentBlogSlug);
      if (post) {
        seo = {
          title: `${post.title} | Amie's Homemade`,
          description: post.excerpt,
          canonical: `https://amieshomemade.com/blog/${currentBlogSlug}`,
          ogTitle: post.title,
          ogDescription: post.excerpt,
        };
        ogImage = post.coverImage;
      }
    }

    if (currentPage === 'delivery') {
      const areaData = currentArea ? AREA_MAP[currentArea] : null;
      if (areaData) {
        seo = {
          title: `Homemade Mukhwas & Wellness Treats Delivery in ${areaData.name}, Ahmedabad | Amie's Homemade`,
          description: `Order fresh homemade mukhwas, granola & masalas delivered to ${areaData.name}, Ahmedabad. No preservatives. Made in small batches by Ami Shah.`,
          canonical: `https://amieshomemade.com/delivery/${currentArea}`,
          ogTitle: `Mukhwas & Wellness Treats Delivered to ${areaData.name} | Amie's Homemade`,
          ogDescription: `Get fresh homemade mukhwas & wellness treats delivered to ${areaData.name}, Ahmedabad. Small batches, no preservatives, made with love.`,
        };
      } else {
        seo = {
          title: "Homemade Mukhwas & Wellness Treats Delivery Across Ahmedabad | Amie's Homemade",
          description: "Amie's Homemade delivers fresh mukhwas, granola & masalas across Ahmedabad — Satellite, Navrangpura, Bopal, Vastrapur, Bodakdev & more. No preservatives.",
          canonical: "https://amieshomemade.com/delivery",
          ogTitle: "Homemade Mukhwas & Wellness Delivery Across Ahmedabad | Amie's Homemade",
          ogDescription: "Fresh homemade mukhwas & wellness treats delivered to every area of Ahmedabad. No preservatives, made with love.",
        };
      }
    }

    if (currentPage === 'cities') {
      const cityData = currentCity ? CITY_MAP[currentCity] : null;
      if (cityData) {
        seo = {
          title: `Buy Homemade Mukhwas & Wellness Treats Online, Delivered to ${cityData.name} | Amie's Homemade`,
          description: `Order authentic homemade mukhwas, granola & masalas from Ahmedabad delivered to ${cityData.name}, ${cityData.state}. No preservatives. Pan-India shipping.`,
          canonical: `https://amieshomemade.com/cities/${currentCity}`,
          ogTitle: `Homemade Mukhwas & Wellness Treats Delivered to ${cityData.name} | Amie's Homemade`,
          ogDescription: `Fresh homemade mukhwas & wellness treats shipped from Ahmedabad to ${cityData.name}. Small batches, no preservatives, made with love by Ami Shah.`,
        };
      } else {
        seo = {
          title: "Homemade Mukhwas & Wellness Treats Pan-India Delivery | Amie's Homemade",
          description: "Amie's Homemade ships authentic homemade mukhwas, granola & masalas from Ahmedabad to Mumbai, Delhi, Bengaluru, Chennai, Hyderabad & all major Indian cities.",
          canonical: "https://amieshomemade.com/cities",
          ogTitle: "Pan-India Homemade Mukhwas & Wellness Delivery | Amie's Homemade",
          ogDescription: "Authentic homemade mukhwas & wellness treats delivered pan-India from Ahmedabad. No preservatives, made with love.",
        };
      }
    }

    // ── Product page meta tags ───────────────────────────────────────────────
    if (selectedProduct) {
      const isGifting = selectedProduct.category === Category.GIFTING;
      const productUrl = `https://amieshomemade.com/${isGifting ? 'gifting' : 'shop'}/${slugify(selectedProduct.name)}`;
      const productTitle = `${selectedProduct.name} | Amie's Homemade`;
      const productDesc = `${selectedProduct.description} Handcrafted in Ahmedabad by Ami Shah. No preservatives, made fresh in small batches.`;
      seo = {
        title: productTitle,
        description: productDesc,
        canonical: productUrl,
        ogTitle: productTitle,
        ogDescription: productDesc,
      };
      ogImage = selectedProduct.image;
    }

    // ── Core meta tags ──────────────────────────────────────────────────────
    document.title = seo.title;
    const setMeta = (sel: string, val: string) => document.querySelector(sel)?.setAttribute('content', val);
    const setHref = (sel: string, val: string) => document.querySelector(sel)?.setAttribute('href', val);
    setMeta('meta[name="description"]', seo.description);
    setHref('link[rel="canonical"]', seo.canonical);
    setMeta('meta[property="og:title"]', seo.ogTitle);
    setMeta('meta[property="og:description"]', seo.ogDescription);
    setMeta('meta[property="og:url"]', seo.canonical);
    setMeta('meta[name="twitter:title"]', seo.ogTitle);
    setMeta('meta[name="twitter:description"]', seo.ogDescription);
    // Per-page OG / Twitter image — use post cover image on blog posts, default elsewhere
    setMeta('meta[property="og:image"]', ogImage || DEFAULT_OG_IMAGE);
    setMeta('meta[name="twitter:image"]', ogImage || DEFAULT_OG_IMAGE);

    // ── BreadcrumbList schema ────────────────────────────────────────────────
    const areaData = currentArea ? AREA_MAP[currentArea] : null;
    const cityData = currentCity ? CITY_MAP[currentCity] : null;
    let crumbs: Array<{ name: string; item: string }>;
    if (currentPage === 'delivery') {
      crumbs = areaData
        ? [
            { name: 'Home', item: 'https://amieshomemade.com' },
            { name: 'Delivery in Ahmedabad', item: 'https://amieshomemade.com/delivery' },
            { name: areaData.name, item: `https://amieshomemade.com/delivery/${currentArea}` },
          ]
        : [
            { name: 'Home', item: 'https://amieshomemade.com' },
            { name: 'Delivery in Ahmedabad', item: 'https://amieshomemade.com/delivery' },
          ];
    } else if (currentPage === 'cities') {
      crumbs = cityData
        ? [
            { name: 'Home', item: 'https://amieshomemade.com' },
            { name: 'Delivery Across India', item: 'https://amieshomemade.com/cities' },
            { name: cityData.name, item: `https://amieshomemade.com/cities/${currentCity}` },
          ]
        : [
            { name: 'Home', item: 'https://amieshomemade.com' },
            { name: 'Delivery Across India', item: 'https://amieshomemade.com/cities' },
          ];
    } else {
      crumbs = BREADCRUMBS[currentPage] || BREADCRUMBS.home;
    }
    const injectSchema = (id: string, data: object | null) => {
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!data) { el?.remove(); return; }
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    };
    injectSchema('breadcrumb-schema', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: b.item,
      })),
    });

    // ── FAQPage schema ───────────────────────────────────────────────────────
    if (currentPage === 'faq') {
      injectSchema('faqpage-schema', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What ingredients do you use? Are there any preservatives?', acceptedAnswer: { '@type': 'Answer', text: "Every product at Amie's Homemade is made with 100% natural ingredients — fennel seeds, coriander seeds, sesame seeds, dried rose petals, cardamom, and carom seeds. No artificial colors, no synthetic flavors, and absolutely no preservatives of any kind." } },
          { '@type': 'Question', name: "Do you offer sugar-free options for diabetics?", acceptedAnswer: { '@type': 'Answer', text: 'Yes. Our plain mukhwas blends have no added sugar, no sugar coating, and no glucose syrup. They are genuinely safe for diabetics. Traditional mukhwas ingredients (fennel, coriander, sesame, carom, cardamom) are naturally low-GI.' } },
          { '@type': 'Question', name: 'How do I place an order?', acceptedAnswer: { '@type': 'Answer', text: 'The easiest way is to WhatsApp us at +91 90540 38876. You can also browse products on the website, add items to your cart, and complete checkout online.' } },
          { '@type': 'Question', name: 'Do you deliver pan-India?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — we deliver pan-India. Ahmedabad orders arrive in 1 working day. For the rest of India, orders typically arrive within 3 to 5 working days via courier.' } },
          { '@type': 'Question', name: 'What are the delivery charges?', acceptedAnswer: { '@type': 'Answer', text: 'Delivery within Ahmedabad is free. For orders outside Ahmedabad: up to 500g — ₹60; 500g to 1kg — ₹100; 1kg to 2kg — ₹150; 2kg to 5kg — ₹200; above 5kg — ₹250.' } },
          { '@type': 'Question', name: 'What is the shelf life of your products?', acceptedAnswer: { '@type': 'Answer', text: 'Mukhwas, granola, and dry fruit milk masala stay fresh for 6 months from the date of packaging, and chai masala for up to 1 year.' } },
          { '@type': 'Question', name: 'Can I customize the contents of a gift hamper?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. You can choose which mukhwas varieties go in, adjust quantities, add or remove products, and specify dietary requirements. Just tell us who it is for and what they love.' } },
          { '@type': 'Question', name: 'Do you handle corporate gifting orders?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We handle corporate gifting for Diwali and all major festivals, from 10-piece hamper sets to 500+ unit orders. Bulk pricing, custom cards, and branded packaging are available.' } },
          { '@type': 'Question', name: 'What is the minimum quantity for bulk orders?', acceptedAnswer: { '@type': 'Answer', text: 'Bulk pricing applies from 10 hampers onwards. For 50+ hampers we offer preferential rates and custom branding. WhatsApp us with your requirement for a detailed quote.' } },
          { '@type': 'Question', name: 'What payment methods do you accept?', acceptedAnswer: { '@type': 'Answer', text: 'For online orders, we accept UPI payment (Google Pay, PhonePe, Paytm, and all UPI apps). For Ahmedabad deliveries, cash at delivery is also accepted. We do not offer Cash on Delivery outside Ahmedabad.' } },
        ],
      });
    } else {
      injectSchema('faqpage-schema', null);
    }

    // ── BlogPosting schema ───────────────────────────────────────────────────
    if (currentPage === 'blog' && currentBlogSlug) {
      const post = getPostBySlug(currentBlogSlug);
      injectSchema('blogposting-schema', post ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: { '@type': 'Person', name: 'Ami Shah', url: 'https://amieshomemade.com/about' },
        publisher: { '@id': 'https://amieshomemade.com/#business' },
        url: `https://amieshomemade.com/blog/${currentBlogSlug}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://amieshomemade.com/blog/${currentBlogSlug}` },
        keywords: post.tags?.join(', '),
        articleSection: post.category,
      } : null);
    } else {
      injectSchema('blogposting-schema', null);
    }

    // ── Product schema ───────────────────────────────────────────────────────
    if (selectedProduct) {
      const isGifting = selectedProduct.category === Category.GIFTING;
      const productUrl = `https://amieshomemade.com/${isGifting ? 'gifting' : 'shop'}/${slugify(selectedProduct.name)}`;
      injectSchema('product-schema', {
        '@context': 'https://schema.org',
        '@type': 'Product',
        sku: selectedProduct.id,
        name: selectedProduct.name,
        description: selectedProduct.description,
        image: selectedProduct.image,
        url: productUrl,
        brand: { '@type': 'Brand', name: "Amie's Homemade" },
        ...(selectedProduct.rating && selectedProduct.reviewCount ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: selectedProduct.rating,
            reviewCount: selectedProduct.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        } : {}),
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: selectedProduct.price,
          availability: selectedProduct.outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': 'https://amieshomemade.com/#business' },
        },
      });
    } else {
      injectSchema('product-schema', null);
    }

    // ── WebSite schema (enables Sitelinks Searchbox + tells Google site identity) ──
    // Injected once — always present regardless of page
    injectSchema('website-schema', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://amieshomemade.com/#website',
      name: "Amie's Homemade",
      alternateName: ["Amies Homemade", "Amie's Homemade Ahmedabad"],
      url: 'https://amieshomemade.com',
      description: "Ahmedabad's finest handmade mukhwas, granola, masalas & gift hampers. Made fresh in small batches by Ami Shah. No preservatives. Pan-India delivery.",
      inLanguage: 'en-IN',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://amieshomemade.com/shop?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: { '@id': 'https://amieshomemade.com/#business' },
    });

    // ── Organization schema (business identity for Google Knowledge Panel) ─────
    injectSchema('organization-schema', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://amieshomemade.com/#business',
      name: "Amie's Homemade",
      url: 'https://amieshomemade.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://amieshomemade.com/favicon.png',
        width: 512,
        height: 512,
      },
      image: 'https://ik.imagekit.io/amieshomemade/Whats-App-Image-2026-02-12-at-18-57-42-1.jpg',
      description: "Family-run artisan food brand crafting authentic Indian mukhwas, granola, masalas & gift hampers in Ahmedabad, Gujarat. Handmade by Ami Shah with pure ingredients and no preservatives.",
      founder: {
        '@type': 'Person',
        name: 'Ami Shah',
        jobTitle: 'Founder & Head Chef',
        url: 'https://amieshomemade.com/about',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ahmedabad',
        addressRegion: 'Gujarat',
        postalCode: '380001',
        addressCountry: 'IN',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+91-90540-38876',
          contactType: 'customer service',
          availableLanguage: ['English', 'Hindi', 'Gujarati'],
          contactOption: 'TollFree',
        },
      ],
      sameAs: [
        'https://www.instagram.com/amies_homemadefoods',
      ],
      email: 'hello@amieshomemade.com',
      priceRange: '₹₹',
      areaServed: [
        { '@type': 'City', name: 'Ahmedabad' },
        { '@type': 'State', name: 'Gujarat' },
        { '@type': 'Country', name: 'India' },
      ],
      knowsAbout: [
        'Mukhwas',
        'Homemade granola',
        'Chai masala',
        'Dry fruit milk masala',
        'Indian gift hampers',
        'Corporate gifting',
        'Sugar-free mukhwas',
      ],
    });

    // ── SiteNavigationElement schema (explicitly tells Google your main nav links) ─
    // This is the key schema for triggering sitelinks in search results
    injectSchema('sitenav-schema', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: "Amie's Homemade — Main Navigation",
      itemListElement: [
        {
          '@type': 'SiteLinksSearchBox',
          target: 'https://amieshomemade.com/shop',
        },
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Shop All Products',
          description: 'Browse all homemade mukhwas, granola, masalas and wellness products',
          url: 'https://amieshomemade.com/shop',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Gifting & Hampers',
          description: 'Curated gift hampers for Diwali, weddings and corporate events',
          url: 'https://amieshomemade.com/gifting',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Our Story',
          description: "Meet Ami Shah, the founder and heart of Amie's Homemade",
          url: 'https://amieshomemade.com/about',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Blog',
          description: 'Mukhwas guides, gifting ideas and traditional food stories',
          url: 'https://amieshomemade.com/blog',
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: 'Contact Us',
          description: 'Order on WhatsApp or email hello@amieshomemade.com',
          url: 'https://amieshomemade.com/contact',
        },
        {
          '@type': 'ListItem',
          position: 6,
          name: 'FAQs',
          description: 'Answers about ingredients, delivery, gifting and ordering',
          url: 'https://amieshomemade.com/faq',
        },
      ],
    });

  }, [currentPage, currentArea, currentCity, currentBlogSlug, selectedProduct]);

  // Scroll to top on every page/area/city/blog/product change (instant to
  // avoid smooth-scroll delay). Includes selectedProduct because opening or
  // closing a product view often doesn't change currentPage on its own
  // (e.g. closing a hamper opened from /gifting returns to 'gifting' ->
  // 'gifting', no page transition) -- without it, the page would land
  // wherever the product detail happened to be scrolled instead of the top.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage, currentArea, currentCity, currentBlogSlug, selectedProduct]);

  // Fire GA4 page_view on every SPA route change (incl. initial load — this is
  // the sole page_view source since send_page_view:false in index.html).
  // page_location carries the full URL so UTM params survive.
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    }
  }, [currentPage, currentArea, currentCity, currentBlogSlug]);

  // Fire Meta Pixel PageView (browser + server-side Conversions API) on every
  // SPA route change, sharing one event_id between both so Meta dedupes them.
  useEffect(() => {
    // country is safe to send even before we know anything else about the
    // visitor — the site only serves India, so it's true for every event
    // regardless of identity.
    trackMetaEvent('PageView', { userData: { country: 'in' } });
  }, [currentPage, currentArea, currentCity, currentBlogSlug]);

  useEffect(() => {
  }, [currentPage]);

  const filteredProducts = useMemo(() => {
    // Gifting hampers only show up in the "All" grid when the Gifting tab
    // itself is active — kept out of the general listing otherwise.
    const availableProducts = PRODUCTS.filter(p => (p.category !== Category.GIFTING || activeCategory === Category.GIFTING) && isProductVisible(p));
    const inCategory = activeCategory === 'All' ? availableProducts : availableProducts.filter(p => p.category === activeCategory);
    // Out-of-stock items sink to the bottom of the listing automatically —
    // Array.sort is stable, so everything else keeps its normal order, and
    // an item snaps back to its original spot the moment outOfStock clears.
    return [...inCategory].sort((a, b) => (a.outOfStock ? 1 : 0) - (b.outOfStock ? 1 : 0));
  }, [activeCategory]);

  const addToCart = useCallback((product: Product, weight?: string, subOptionName?: string, openCart: boolean = false) => {
    const finalWeight = weight || product.weight;
    
    // Determine the active price based on variety selection or defaults
    let finalPrice = product.price;
    let displayName = product.name;

    if (product.subOptions && subOptionName) {
      const option = product.subOptions.find(o => o.name === subOptionName);
      if (option) {
        finalPrice = option.prices[finalWeight] || option.prices[product.weight] || product.price;
        displayName = option.name;
      }
    } else if (product.prices) {
      finalPrice = product.prices[finalWeight] || product.price;
    }

    setCart(prev => {
      // Uniqueness is based on product ID + weight + variety name + ingredients (crucial for personalized hampers)
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedWeight === finalWeight && 
        item.selectedSubOption === subOptionName &&
        JSON.stringify(item.ingredients) === JSON.stringify(product.ingredients)
      );
      
      if (existing) {
        return prev.map(item => (
          item.id === product.id && 
          item.selectedWeight === finalWeight && 
          item.selectedSubOption === subOptionName &&
          JSON.stringify(item.ingredients) === JSON.stringify(product.ingredients)
        )
          ? { ...item, quantity: item.quantity + 1, price: finalPrice } 
          : item
        );
      }
      return [...prev, { 
        ...product, 
        name: displayName, // Use variety name if available
        quantity: 1, 
        selectedWeight: finalWeight, 
        selectedSubOption: subOptionName,
        price: finalPrice 
      }];
    });
    // Fire AddToCart (browser + server) here — the single place where an item is truly added
    trackMetaEvent('AddToCart', {
      customData: {
        value: finalPrice,
        currency: 'INR',
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
      },
      userData: { country: 'in' },
    });

    if (openCart) {
      const curPath = window.location.pathname;
      if (curPath.startsWith('/shop/')) window.history.pushState(null, '', '/shop');
      else if (curPath.startsWith('/gifting/')) window.history.pushState(null, '', '/gifting');
      setSelectedProduct(null);
      setIsCartOpen(true);
    } else {
      setAddedToast(`${displayName} (${finalWeight}) added to bag`);
    }
  }, [setSelectedProduct, setIsCartOpen]);

  // Auto-dismiss the "added to bag" toast
  useEffect(() => {
    if (!addedToast) return;
    const t = setTimeout(() => setAddedToast(null), 2500);
    return () => clearTimeout(t);
  }, [addedToast]);

  // Index-based so two line items of the same product (different weights) update independently
  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => (
      i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )));
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderPage = () => {
    // Full-page product view takes priority whenever a product is selected.
    if (selectedProduct) {
      const sameCategory = PRODUCTS.filter(p =>
        p.id !== selectedProduct.id &&
        isProductVisible(p) &&
        p.category === selectedProduct.category
      );
      // Everyday Mukhwas Trio: surface both gift hampers alongside other
      // mukhwas, since customers browsing the trio are a natural fit for
      // gifting upsells too.
      const related = selectedProduct.id === 'm14'
        ? [
            ...PRODUCTS.filter(p => (p.id === 'g4' || p.id === 'g5') && isProductVisible(p)),
            ...sameCategory,
          ].slice(0, 4)
        : sameCategory.slice(0, 4);
      return (
        <ProductDetail
          product={selectedProduct}
          onAddToCart={addToCart}
          onClose={closeProduct}
          onNavigateHome={() => navigate('home')}
          related={related}
          onSelectProduct={(p) => openProduct(p)}
        />
      );
    }

    if (orderComplete) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div className="max-w-md bg-white p-7 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border border-coral/5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 sm:mb-8 animate-bounce">
              <CheckCircle size={36} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold serif text-[#4A3728] mb-4">Order Received!</h2>
            <p className="text-[#4A3728]/60 mb-8 brand-rounded font-bold uppercase text-xs tracking-widest">We're preparing your treats right now with love.</p>
            <button 
              onClick={() => { setOrderComplete(false); navigate('home'); setCart([]); }}
              className="px-10 py-4 bg-coral text-white rounded-full font-bold uppercase brand-rounded text-xs tracking-widest hover:scale-105 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'delivery': return (
        <AreaDeliveryPage
          area={currentArea ? (AREA_MAP[currentArea] ?? null) : null}
          onShopClick={() => navigate('shop')}
          onNavigateToArea={navigateToArea}
          onNavigate={navigate}
        />
      );
      case 'cities': return (
        <CityDeliveryPage
          city={currentCity ? (CITY_MAP[currentCity] ?? null) : null}
          onShopClick={() => navigate('shop')}
          onNavigateToCity={navigateToCity}
          onNavigate={navigate}
        />
      );
      case 'blog':
        return currentBlogSlug
          ? <BlogPostView slug={currentBlogSlug} onBack={() => navigateToBlog()} onSelectPost={(s) => navigateToBlog(s)} onNavigate={navigate} />
          : <BlogView onSelectPost={(s) => navigateToBlog(s)} />;
      case 'faq': return <FAQView onNavigate={navigate} />;
      case 'about': return <AboutUs onNavigate={navigate} />;
      case 'gifting': return <GiftingView onAddToCart={(p) => addToCart(p)} onSelectProduct={(p) => openProduct(p)} />;
      case 'shop': return (
        <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-32 relative z-10">

          {/* Free Delivery popup */}

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 text-center md:text-left">
            <div>
              <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em]">Fresh from Our Kitchen</span>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[#4A3728] serif mt-4 leading-tight">Handcrafted Treats</h2>
              <div className="w-20 h-1.5 bg-coral rounded-full mx-auto md:mx-0 mt-4"></div>
            </div>
            <CategoryFilterBar
              activeCategory={activeCategory}
              onSelect={(c) => {
                setActiveCategory(c);
                const slug = CATEGORY_SLUG[c as Category];
                window.history.pushState(null, '', slug ? `/shop/${slug}` : '/shop');
              }}
              onSelectProduct={(p) => openProduct(p)}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-10">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => addToCart(p, undefined, undefined, false)}
                onOpen={(p) => openProduct(p)}
              />
            ))}
          </div>
        </section>
      );
      case 'checkout': return (
        <CheckoutView
          items={cart}
          total={cartTotal}
          couponApplied={couponApplied}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onShopClick={() => navigate('shop')}
          onOrderPlaced={() => { setCart([]); setCouponApplied(false); }}
          onComplete={() => { setOrderComplete(true); setCouponApplied(false); }}
        />
      );
      case 'contact': return (
        <div className="pt-24 pb-14 sm:pt-32 sm:pb-24 px-4 text-center min-h-screen">
          <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] block mb-4">Homemade Mukhwas &amp; Wellness Treats · Ahmedabad, Gujarat</span>
          <h1 className="text-4xl sm:text-6xl font-bold serif mb-6 text-[#4A3728]">Contact Amie's Homemade</h1>
          <p className="max-w-2xl mx-auto text-[#4A3728]/60 mb-16 text-lg">
            Order mukhwas, granola, masalas &amp; gift hampers from Ahmedabad. Whether you're looking for a small treat or planning a grand celebration, we're here to help.
          </p>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* General Inquiry Card */}
            <div className="bg-white p-7 sm:p-14 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl border border-coral/5 flex flex-col items-center group hover:-translate-y-2 transition-all duration-500">
              <div className="w-20 h-20 bg-coral/5 rounded-[2rem] flex items-center justify-center text-coral mb-8 group-hover:scale-110 group-hover:bg-coral group-hover:text-white transition-all duration-500">
                <MessageCircle size={36} />
              </div>
              <h3 className="text-3xl font-bold serif mb-4 text-[#4A3728]">General Inquiry</h3>
              <p className="text-[#4A3728]/60 mb-10 font-medium leading-relaxed max-w-xs">
                Have a question about our products, orders, or just want to say hello?
              </p>
              <div className="w-full space-y-4">
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi%20Amie!%20I%20have%20a%20question%20about%20my%20order%20from%20Amie's%20Homemade.%20Could%20you%20please%20help%20me?`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.2em] text-[10px] hover:shadow-2xl hover:shadow-[#25D366]/30 transition-all active:scale-95"
                >
                  <MessageCircle size={20} /> Chat on WhatsApp
                </a>
                <div className="py-5 px-8 bg-cream rounded-[1.5rem] border border-coral/10 text-coral font-bold text-xs brand-rounded break-all flex items-center justify-center gap-3">
                  <Mail size={16} /> hello@amieshomemade.com
                </div>
              </div>
            </div>

            {/* Bulk & Wholesale Card */}
            <div className="bg-white p-7 sm:p-14 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl border border-[#F6C94C]/20 flex flex-col items-center group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F6C94C]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="w-20 h-20 bg-[#F6C94C]/10 rounded-[2rem] flex items-center justify-center text-[#D97706] mb-8 group-hover:scale-110 group-hover:bg-[#F6C94C] group-hover:text-[#4A3728] transition-all duration-500">
                <Building2 size={36} />
              </div>
              <h3 className="text-3xl font-bold serif mb-4 text-[#4A3728]">Bulk & Wholesale</h3>
              <p className="text-[#4A3728]/60 mb-10 font-medium leading-relaxed max-w-xs">
                Perfect for Wedding Favors, Corporate Gifting, or stocking in your premium retail store.
              </p>
              <div className="w-full space-y-6">
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi!%20I%20would%20like%20to%20inquire%20about%20Bulk%20Orders%20and%20Wholesale%20Pricing%20for%20Amie's%20Homemade.%20Could%20you%20please%20share%20your%20catalog%20and%20wholesale%20price%20list?%20Thank%20you!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-[#F04E4E] text-white rounded-[1.5rem] font-bold brand-rounded uppercase tracking-[0.2em] text-[10px] hover:shadow-2xl hover:shadow-coral/30 transition-all active:scale-95"
                >
                  <Sparkles size={20} /> Get Wholesale Prices
                </a>
                
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Custom Brand Labeling Available",
                    "Special Wedding Favor Packs",
                    "Tiered Wholesale Pricing",
                    "Pan-India Bulk Shipping"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-[#4A3728]/70 brand-rounded uppercase tracking-widest bg-[#F6C94C]/5 py-2 px-4 rounded-xl border border-[#F6C94C]/10">
                      <CheckCircle size={14} className="text-[#D97706]" /> {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* NAP block — crawlable address for local SEO */}
          <div className="max-w-xl mx-auto mt-16 p-8 bg-white/60 rounded-[3rem] border border-coral/10 text-center">
            <h2 className="text-2xl font-bold serif text-[#4A3728] mb-4">Find Us</h2>
            <address className="not-italic text-[#4A3728]/70 leading-relaxed text-sm">
              <strong className="text-[#4A3728] font-bold">Amie's Homemade</strong><br/>
              Ahmedabad, Gujarat 380015, India<br/>
              <a href="tel:+919054038876" className="text-coral hover:underline">+91 90540 38876</a><br/>
              <a href="mailto:hello@amieshomemade.com" className="text-coral hover:underline">hello@amieshomemade.com</a>
            </address>
            <p className="text-xs text-[#4A3728]/60 mt-4 leading-relaxed max-w-md mx-auto">
              From our kitchen in Ahmedabad, we deliver fresh homemade mukhwas & wellness treats across Ahmedabad and every corner of India.
            </p>
          </div>
        </div>
      );
      default: return (
        <>
          <Hero 
            onShopClick={() => navigate('shop')}
            onAboutClick={() => navigate('about')}
          />
          {/* ── Featured Products ───────────────────────────────────────────── */}
          <section className="py-16 sm:py-24 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 sm:mb-16 gap-4">
                <div>
                  <span className="brand-rounded text-coral font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Customer Favourites</span>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold serif text-[#4A3728] leading-[0.95]">
                    Our <span className="brand-script text-coral text-5xl sm:text-7xl lg:text-8xl">Bestsellers</span>
                  </h2>
                  <div className="w-16 h-1 bg-coral rounded-full mt-6"></div>
                </div>
                <button
                  onClick={() => navigate('shop')}
                  className="flex items-center gap-2 text-coral font-bold brand-rounded uppercase tracking-[0.2em] text-xs hover:gap-4 transition-all duration-300 group whitespace-nowrap"
                >
                  Shop All Products <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {(['m10', 'm2', 'm4', 'sf3', 'hw1', 'sm1'] as const).map(id => {
                  const product = PRODUCTS.find(p => p.id === id);
                  if (!product || !isProductVisible(product)) return null;
                  return (
                    <a
                      key={product.id}
                      href={`/${product.category === Category.GIFTING ? 'gifting' : 'shop'}/${slugify(product.name)}`}
                      onClick={(e) => { e.preventDefault(); openProduct(product); }}
                      className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#4A3728]/8 flex flex-col"
                    >
                      <div className="relative overflow-hidden bg-[#FFF9F0] aspect-square">
                        <img
                          src={ikImg(product.image, 500)}
                          srcSet={`${ikImg(product.image, 350)} 350w, ${ikImg(product.image, 600)} 600w`}
                          sizes="(max-width: 640px) 45vw, 30vw"
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
                        <h3 className="font-bold serif text-[#4A3728] text-sm sm:text-base leading-tight">{product.name}</h3>
                        <p className="text-coral font-black text-base">₹{product.price} <span className="text-[#4A3728]/40 font-medium text-xs">/ {product.weight}</span></p>
                        <button
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            product.subOptions ? openProduct(product) : addToCart(product, undefined, undefined, false);
                          }}
                          className="mt-auto w-full py-3 border border-[#F14E4E] bg-[#F14E4E] text-white text-[10px] sm:text-[11px] font-bold rounded-full shadow-md shadow-[#F14E4E]/30 hover:bg-[#d43d3d] hover:border-[#d43d3d] hover:shadow-lg hover:shadow-[#F14E4E]/40 transition-all duration-300 active:scale-95"
                        >
                          {product.subOptions ? 'Choose Options' : '+ Add to Cart'}
                        </button>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Meet the Maker — founder trust section ──────────────────────── */}
          <section className="relative bg-gradient-to-b from-[#FFF8EE] via-[#E5EBDB] to-[#FFF8EE] py-16 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="pointer-events-none absolute top-1/4 -left-24 w-[34rem] h-[34rem] rounded-full bg-[#F6C94C]/8 blur-3xl" />
            <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Photos */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none order-1">
                <div className="relative rounded-[1.75rem] overflow-hidden shadow-[0_40px_80px_-25px_rgba(74,55,40,0.45)] ring-1 ring-white/60">
                  <img
                    src="https://ik.imagekit.io/amieshomemade/067A4339-1.jpg?tr=w-1000,q-80,f-auto"
                    srcSet="https://ik.imagekit.io/amieshomemade/067A4339-1.jpg?tr=w-600,q-80,f-auto 600w, https://ik.imagekit.io/amieshomemade/067A4339-1.jpg?tr=w-1000,q-80,f-auto 1000w"
                    sizes="(max-width: 1024px) 90vw, 44vw"
                    alt="Ami Shah, founder of Amie's Homemade, with the full product range"
                    className="w-full h-auto block"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Founder badge — bottom left of photo, styled like a handwritten kitchen label */}
                  <div className="absolute bottom-4 left-4 rotate-[-2deg]">
                    <div
                      className="flex items-center gap-3 rounded-lg pl-2.5 pr-4 py-2 shadow-xl ring-1 ring-[#4A3728]/10"
                      style={{ background: 'linear-gradient(135deg, #FFF9EE 0%, #FBEFD9 100%)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/70 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #F14E4E 0%, #C93A3A 100%)' }}
                      >
                        <span className="brand-script text-white text-lg leading-none">A</span>
                      </div>
                      <div>
                        <p className="brand-script text-[#4A3728] text-xl leading-none">Ami Shah</p>
                        <p className="text-[#8A6A2E] text-[9px] font-bold brand-rounded uppercase tracking-[0.15em] leading-tight mt-1">✦ Founder &amp; Maker</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Tilted candid inset */}
                <div className="hidden sm:block absolute -bottom-6 -right-3 lg:-right-7 w-[38%] rounded-xl overflow-hidden shadow-2xl ring-[6px] ring-[#FFF8EE] rotate-[4deg]">
                  <img
                    src="https://ik.imagekit.io/amieshomemade/067A4315-1.jpg?tr=w-560,q-80,f-auto"
                    alt="Ami Shah with Amie's Homemade mukhwas and treats"
                    className="w-full h-auto block"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              {/* Story */}
              <div className="text-center lg:text-left order-2">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold serif text-[#4A3728] leading-[0.98] mb-6">
                  The Heart Behind<br /> <span className="brand-script text-coral text-5xl sm:text-7xl lg:text-8xl">Amie's Homemade</span>
                </h2>
                <p className="text-[#4A3728]/70 text-sm sm:text-lg font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 mb-6">
                  Every jar is handcrafted by <span className="text-[#4A3728] font-bold">Ami Shah</span> using treasured family recipes and carefully selected ingredients. No mass production. No shortcuts. Just homemade goodness in every bite.
                </p>
                <div className="mb-8">
                  <p className="brand-script text-coral text-3xl sm:text-4xl leading-none">Ami Shah</p>
                  <p className="brand-rounded text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#4A3728]/50 mt-1.5">Founder · Amie's Homemade</p>
                </div>
                <button
                  onClick={() => navigate('about')}
                  className="group inline-flex items-center gap-3 px-9 sm:px-11 py-4 sm:py-5 bg-[#4A3728] text-[#FFF8EE] rounded-full font-bold tracking-[0.2em] uppercase text-xs hover:bg-[#3D2D1F] hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-[#4A3728]/20"
                >
                  Read Our Story
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </section>

          <Reviews />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen pt-10">
      {/* Top scrolling announcement banner — Cinnamon Kitchen style (serif + pipes), Amie's coral */}
      <div className="fixed top-0 left-0 right-0 z-[60] w-full overflow-hidden" style={{ height: '40px', background: '#F04E4E' }}>
        <div className="h-full flex items-center">
          <div className="flex animate-marquee-left whitespace-nowrap">
            {[0, 1].map(i => (
              <div
                key={i}
                className="flex items-center shrink-0 text-white text-[13px] sm:text-[14px] font-normal whitespace-nowrap"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.01em' }}
                aria-hidden={i === 1}
              >
                <span className="px-10">✦ Special Offer: 10% OFF on All Products · Limited Time</span>
                <span className="text-white/50">|</span>
                <span className="px-10">Cash on Delivery Now Available in Ahmedabad</span>
                <span className="text-white/50">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onNavigate={navigate}
        onSearchOpen={() => setIsSearchOpen(true)}
        currentPage={currentPage}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(product) => {
          setIsSearchOpen(false);
          openProduct(product);
        }}
      />
      
      <main className="relative z-10">
        {renderPage()}
      </main>

      <Footer onNavigate={navigate} />

      {/* Fixed floating buttons live outside <main> so the footer's z-40 stacking context can't cover them.
          Hidden on mobile checkout — the sticky pay bar occupies that same bottom-of-screen
          strip there, and the two would visually collide. */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] text-white p-3.5 sm:p-5 sm:px-8 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 group brand-rounded font-bold ${currentPage === 'checkout' ? 'hidden sm:flex' : ''}`}
      >
        <MessageCircle size={22} className="sm:hidden" />
        <MessageCircle size={24} className="hidden sm:block" />
        <span className="text-xs uppercase tracking-wider hidden sm:block">Chat with us</span>
      </a>


      {/* "Added to bag" toast — confirms one-click adds without yanking the cart open */}
      {addedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[130] bg-[#4A3728] text-white pl-5 pr-3 py-3 rounded-full shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[92vw]">
          <CheckCircle size={16} className="text-[#F6C94C] flex-shrink-0" />
          <span className="text-xs font-bold brand-rounded truncate">{addedToast}</span>
          <button
            onClick={() => { setAddedToast(null); setIsCartOpen(true); }}
            className="ml-1 px-3.5 py-1.5 bg-[#F04E4E] rounded-full text-[10px] font-black brand-rounded uppercase tracking-widest flex-shrink-0 hover:bg-[#d43d3d] transition-colors"
          >
            View Bag
          </button>
        </div>
      )}

      <Cart
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={(applied) => { setCouponApplied(applied); setIsCartOpen(false); navigate('checkout'); }}
      />
    </div>
  );
};

export default App;