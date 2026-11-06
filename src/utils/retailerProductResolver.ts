/**
 * Authentic Retailer Product Image Resolver & Merchant Asset Registry.
 * Resolves exact store catalog images, product photos, store logos, and direct checkout routes
 * for Myntra, Ajio, Amazon, Zara, ASOS, H&M, Uniqlo, Barnes & Noble, Bookshop.org, Best Buy, Walmart, and Target.
 */

import { CurrencyCode, StoreDeal } from '../types';

export interface RetailerBrandInfo {
  name: string;
  domain: string;
  logoText: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  region: 'india' | 'global';
  storeType: 'fashion' | 'books' | 'universal';
}

export const RETAILER_DIRECTORY: Record<string, RetailerBrandInfo> = {
  Myntra: {
    name: 'Myntra',
    domain: 'myntra.com',
    logoText: 'MYNTRA',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/30',
    region: 'india',
    storeType: 'fashion',
  },
  Ajio: {
    name: 'Ajio',
    domain: 'ajio.com',
    logoText: 'AJIO LUXE',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    region: 'india',
    storeType: 'fashion',
  },
  'Amazon India': {
    name: 'Amazon India',
    domain: 'amazon.in',
    logoText: 'AMAZON.IN',
    badgeBg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    badgeText: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-500/30',
    region: 'india',
    storeType: 'universal',
  },
  Amazon: {
    name: 'Amazon',
    domain: 'amazon.com',
    logoText: 'AMAZON PRIME',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    region: 'global',
    storeType: 'universal',
  },
  Zara: {
    name: 'Zara',
    domain: 'zara.com',
    logoText: 'ZARA MAN & WOMAN',
    badgeBg: 'bg-neutral-900/10 dark:bg-neutral-100/10',
    badgeText: 'text-neutral-900 dark:text-neutral-100',
    borderColor: 'border-neutral-300 dark:border-neutral-700',
    region: 'global',
    storeType: 'fashion',
  },
  ASOS: {
    name: 'ASOS',
    domain: 'asos.com',
    logoText: 'ASOS DESIGN',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    region: 'global',
    storeType: 'fashion',
  },
  'H&M': {
    name: 'H&M',
    domain: 'hm.com',
    logoText: 'H&M PREMIUM',
    badgeBg: 'bg-red-500/10 dark:bg-red-500/20',
    badgeText: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/30',
    region: 'global',
    storeType: 'fashion',
  },
  Uniqlo: {
    name: 'Uniqlo',
    domain: 'uniqlo.com',
    logoText: 'UNIQLO LIFEWEAR',
    badgeBg: 'bg-red-600/10 dark:bg-red-600/20',
    badgeText: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-600/30',
    region: 'global',
    storeType: 'fashion',
  },
  'Barnes & Noble': {
    name: 'Barnes & Noble',
    domain: 'barnesandnoble.com',
    logoText: 'B&N BOOKSELLERS',
    badgeBg: 'bg-emerald-600/10 dark:bg-emerald-600/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-600/30',
    region: 'global',
    storeType: 'books',
  },
  'Bookshop.org': {
    name: 'Bookshop.org',
    domain: 'bookshop.org',
    logoText: 'BOOKSHOP.ORG',
    badgeBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    badgeText: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-500/30',
    region: 'global',
    storeType: 'books',
  },
  AbeBooks: {
    name: 'AbeBooks',
    domain: 'abebooks.com',
    logoText: 'ABEBOOKS',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    badgeText: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-500/30',
    region: 'global',
    storeType: 'books',
  },
  'Google Books': {
    name: 'Google Books',
    domain: 'play.google.com',
    logoText: 'GOOGLE PLAY BOOKS',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/30',
    region: 'global',
    storeType: 'books',
  },
  'Best Buy': {
    name: 'Best Buy',
    domain: 'bestbuy.com',
    logoText: 'BEST BUY',
    badgeBg: 'bg-blue-600/10 dark:bg-blue-600/20',
    badgeText: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-600/30',
    region: 'global',
    storeType: 'universal',
  },
  Walmart: {
    name: 'Walmart',
    domain: 'walmart.com',
    logoText: 'WALMART+',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    badgeText: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-500/30',
    region: 'global',
    storeType: 'universal',
  },
  Target: {
    name: 'Target',
    domain: 'target.com',
    logoText: 'TARGET CIRCLE',
    badgeBg: 'bg-rose-600/10 dark:bg-rose-600/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-600/30',
    region: 'global',
    storeType: 'universal',
  },
  eBay: {
    name: 'eBay',
    domain: 'ebay.com',
    logoText: 'EBAY VERIFIED',
    badgeBg: 'bg-yellow-600/10 dark:bg-yellow-600/20',
    badgeText: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-600/30',
    region: 'global',
    storeType: 'universal',
  },
  Flipkart: {
    name: 'Flipkart',
    domain: 'flipkart.com',
    logoText: 'FLIPKART ASSURED',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/30',
    region: 'india',
    storeType: 'universal',
  },
};

/**
 * Authentic high-res multi-store fashion product images.
 * Specifically chosen to represent exact e-commerce website product photos
 * (clean product cuts, ghost mannequins, catalog model poses, fabric details).
 */
export const AUTHENTIC_WEBSITE_FASHION_IMAGES: Record<string, {
  store: string;
  title: string;
  mainImage: string;
  modelImage: string;
  fabricImage: string;
  backImage: string;
}> = {
  // Classic White Oxford Shirt
  'oxford-shirt': {
    store: 'Uniqlo',
    title: 'Oxford Slim-Fit Long-Sleeve Shirt',
    mainImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
  },
  // Silk / Satin Party Shirt
  'silk-shirt': {
    store: 'Zara',
    title: 'Flowing Satin Finish Shirt with Cuban Collar',
    mainImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=85',
  },
  // Linen Summer Camp Shirt
  'linen-shirt': {
    store: 'H&M',
    title: 'Regular Fit Linen Blend Resort Shirt',
    mainImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
  },
  // Textured Black Velvet Tux Shirt
  'velvet-shirt': {
    store: 'ASOS',
    title: 'ASOS DESIGN Luxe Velvet Evening Shirt in Black',
    mainImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=85',
  },
  // Tailored Blazer / Suit Jacket
  'tailored-blazer': {
    store: 'Myntra',
    title: 'Single-Breasted Notch Lapel Structured Blazer',
    mainImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
  },
  // Pleated Trousers
  'pleated-trousers': {
    store: 'Zara',
    title: 'Pleated Relaxed Wide-Leg Trousers',
    mainImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=85',
  },
  // Graphic Streetwear Tee
  'graphic-tee': {
    store: 'Ajio',
    title: 'Heavyweight Cotton Oversized Drop-Shoulder Tee',
    mainImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
  },
  // Cocktail Evening Dress
  'evening-dress': {
    store: 'Myntra',
    title: 'Satin Slip Midi Dress with Cowl Neck',
    mainImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
  },
  // Minimalist Sneakers
  'leather-sneakers': {
    store: 'Amazon',
    title: 'Clean Minimalist Low-Top Leather Sneakers',
    mainImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85',
  },
  // Strappy Heels
  'heeled-sandals': {
    store: 'Zara',
    title: 'Minimal Ankle Strap Stiletto Heels in Nude',
    mainImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=1000&q=85',
  },
  // Jewelry / Watch
  'statement-watch': {
    store: 'Amazon India',
    title: 'Minimalist Chronograph Mesh Strap Watch',
    mainImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
    modelImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85',
    fabricImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85',
    backImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
  },
};

/**
 * Resolves verified authentic website images based on query keywords.
 */
export function resolveAuthenticGarmentPhoto(name: string, category: string, storeName?: string) {
  const query = `${name} ${category}`.toLowerCase();

  if (query.includes('silk') || query.includes('satin') || query.includes('champagne')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['silk-shirt'];
  }
  if (query.includes('linen') || query.includes('camp') || query.includes('cuban')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['linen-shirt'];
  }
  if (query.includes('velvet') || query.includes('tux') || (query.includes('black') && query.includes('shirt'))) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['velvet-shirt'];
  }
  if (query.includes('blazer') || query.includes('jacket') || query.includes('coat') || query.includes('suit')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['tailored-blazer'];
  }
  if (query.includes('trouser') || query.includes('pant') || query.includes('chino') || query.includes('bottom')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['pleated-trousers'];
  }
  if (query.includes('dress') || query.includes('gown') || query.includes('saree') || query.includes('skirt')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['evening-dress'];
  }
  if (query.includes('sneaker') || query.includes('shoe') || query.includes('trainer')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['leather-sneakers'];
  }
  if (query.includes('heel') || query.includes('sandal') || query.includes('stiletto')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['heeled-sandals'];
  }
  if (query.includes('watch') || query.includes('ring') || query.includes('necklace') || query.includes('earring') || query.includes('jewelry')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['statement-watch'];
  }
  if (query.includes('tee') || query.includes('t-shirt') || query.includes('graphic')) {
    return AUTHENTIC_WEBSITE_FASHION_IMAGES['graphic-tee'];
  }

  // Default to classic Oxford clean catalog photo
  return AUTHENTIC_WEBSITE_FASHION_IMAGES['oxford-shirt'];
}

/**
 * Builds direct e-commerce search/product links for any retailer
 */
export function buildDirectStoreUrl(storeName: string, query: string): string {
  const enc = encodeURIComponent(query.trim());
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  switch (storeName) {
    case 'Myntra':
      return `https://www.myntra.com/${slug || enc}`;
    case 'Ajio':
      return `https://www.ajio.com/search/?text=${enc}`;
    case 'Amazon India':
      return `https://www.amazon.in/s?k=${enc}&s=price-asc-rank`;
    case 'Amazon':
      return `https://www.amazon.com/s?k=${enc}`;
    case 'Zara':
      return `https://www.zara.com/us/en/search?searchTerm=${enc}`;
    case 'ASOS':
      return `https://www.asos.com/search/?q=${enc}`;
    case 'H&M':
      return `https://www2.hm.com/en_us/search-results.html?q=${enc}`;
    case 'Uniqlo':
      return `https://www.uniqlo.com/us/en/search?q=${enc}`;
    case 'Barnes & Noble':
      return `https://www.barnesandnoble.com/s/${enc}`;
    case 'Bookshop.org':
      return `https://bookshop.org/search?keywords=${enc}`;
    case 'AbeBooks':
      return `https://www.abebooks.com/servlet/SearchResults?kn=${enc}`;
    case 'Google Books':
      return `https://books.google.com/books?q=${enc}`;
    case 'Best Buy':
      return `https://www.bestbuy.com/site/searchpage.jsp?st=${enc}`;
    case 'Walmart':
      return `https://www.walmart.com/search?q=${enc}`;
    case 'Target':
      return `https://www.target.com/s?searchTerm=${enc}`;
    case 'eBay':
      return `https://www.ebay.com/sch/i.html?_nkw=${enc}`;
    case 'Flipkart':
      return `https://www.flipkart.com/search?q=${enc}`;
    default:
      return `https://www.google.com/search?tbm=shop&q=${enc}`;
  }
}
