export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUSD: number;
}

export interface StoreDeal {
  storeName: string;
  region: 'india' | 'global';
  estimatedPrice: number;
  originalPrice?: number;
  currency: CurrencyCode;
  productTitle: string;
  searchUrl: string;
  isBestDeal?: boolean;
  imageUrl?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  fabricDetails?: string;
  deliveryEstimate?: string;
}

export interface ClothingItem {
  id: string;
  category: 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory' | 'full-body';
  name: string;
  description: string;
  color: string;
  silhouette: string;
  stylingNote: string;
  deals: StoreDeal[];
  imageUrl?: string;
  galleryImages?: string[];
  brand?: string;
}

export interface OutfitLook {
  id: string;
  title: string;
  occasion: string;
  vibe: string;
  imageVisualUrl?: string;
  colorPalette: { name: string; hex: string }[];
  styleBreakdown: string;
  items: ClothingItem[];
  expertStylingTips: string[];
  budgetSummary: {
    totalOriginalEstimate: number;
    budgetDupeTotal: number;
    potentialSavingsPercentage: number;
    currency: CurrencyCode;
  };
  createdAt: string;
  likesCount: number;
  hasLiked?: boolean;
  authorName: string;
  authorAvatar: string;
  commentsCount?: number;
  sourceType: 'photo' | 'links' | 'curated';
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  currency: CurrencyCode;
  storeName: string;
  isLowest?: boolean;
}

export interface ChecklistItem {
  id: string;
  itemName: string;
  category: ClothingItem['category'];
  price: number;
  originalPrice?: number;
  currency: CurrencyCode;
  purchased: boolean;
  storeName: string;
  storeUrl: string;
  imageUrl?: string;
  onSale?: boolean;
  saleDiscountPercent?: number;
  lowestPriceRecorded?: number;
  targetPriceAlert?: number;
  priceHistory: PriceHistoryPoint[];
  lastPriceCheck?: string;
}

export interface PriceDropAlert {
  id: string;
  itemId: string;
  capsuleId: string;
  capsuleName: string;
  itemName: string;
  storeName: string;
  previousPrice: number;
  currentSalePrice: number;
  discountPercent: number;
  currency: CurrencyCode;
  timestamp: string;
  storeUrl: string;
  read: boolean;
}

export interface EventCapsule {
  id: string;
  eventName: string;
  eventDate: string;
  dressCode: string;
  budgetCeiling: number;
  currency: CurrencyCode;
  notes: string;
  savedLookIds: string[];
  checklist: ChecklistItem[];
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  suggestedAlternativeUrl?: string;
}

export interface CommunityPost {
  id: string;
  look: OutfitLook;
  caption: string;
  upvotes: number;
  hasUpvoted?: boolean;
  comments: CommunityComment[];
  tags: string[];
}

export interface BenchmarkSizes {
  topBrand: string;
  topSize: string;
  bottomBrand: string;
  bottomSize: string;
  fitPreference: 'slim' | 'regular' | 'oversized';
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  preferredCurrency: CurrencyCode;
  favoriteAesthetic: string;
  savedLookIds: string[];
  benchmarkSizes?: BenchmarkSizes;
}

// ==========================================
// BOOKS SEARCH & PRICE COMPARISON TYPES
// ==========================================

export type BookFormat = 'Paperback' | 'Hardcover' | 'Kindle / eBook' | 'Audiobook';

export interface BookStoreDeal {
  storeName: 'Amazon' | 'Barnes & Noble' | 'Bookshop.org' | 'AbeBooks' | 'Google Books' | 'Flipkart' | string;
  format: BookFormat;
  price: number;
  originalPrice?: number;
  currency: CurrencyCode;
  storeUrl: string;
  isLowestPrice: boolean;
  inStock: boolean;
  deliveryEstimate: string;
  editionNote?: string;
}

export interface BookProduct {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  isbn: string;
  genre: string[];
  publishedYear?: number;
  publisher?: string;
  synopsis: string;
  rating: number;
  reviewCount: number;
  pageCount?: number;
  deals: BookStoreDeal[];
  language?: string;
  detectedVia?: 'photo' | 'isbn' | 'search';
}

// ==========================================
// UNIVERSAL INTERNET PRODUCT OMNI-SEARCH TYPES
// ==========================================

export type UniversalCategory =
  | 'All'
  | 'Electronics'
  | 'Fashion'
  | 'Home & Living'
  | 'Books'
  | 'Beauty'
  | 'Sports';

export interface UniversalStoreDeal {
  storeName: string;
  price: number;
  originalPrice?: number;
  currency: CurrencyCode;
  storeUrl: string;
  isBestDeal: boolean;
  inStock: boolean;
  shippingNote: string;
  rating?: number;
}

export interface UniversalProduct {
  id: string;
  name: string;
  category: UniversalCategory;
  brand: string;
  mainImage: string;
  galleryImages: string[];
  rating: number;
  reviewCount: number;
  deals: UniversalStoreDeal[];
  keySpecs: string[];
  description: string;
  detectedVia?: 'photo' | 'search';
}

