import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  Link2,
  Search,
  X,
  ExternalLink,
  Star,
  ShoppingBag,
  BookOpen,
  Globe,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HeroSection } from './HeroSection';
import { OutfitCard } from './OutfitCard';
import { UniversalProduct, BookProduct } from '../types';
import { searchUniversalProducts } from '../services/universalSearchService';
import { searchBooks } from '../services/bookService';
import { formatPrice } from '../utils/currencies';

interface AIStylistViewProps {
  onOpenPhotoStudio: () => void;
  onOpenLinkStudio: () => void;
}

export const AIStylistView: React.FC<AIStylistViewProps> = ({
  onOpenPhotoStudio,
  onOpenLinkStudio,
}) => {
  const {
    savedLooks,
    setActiveOutfitModalLook,
    setActiveTab,
    currency,
    omniSearchText,
    setOmniSearchText,
    executeGlobalSearch,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fashionSearchQuery, setFashionSearchQuery] = useState<string>(omniSearchText || '');
  const [universalMatches, setUniversalMatches] = useState<UniversalProduct[]>([]);
  const [bookMatches, setBookMatches] = useState<BookProduct[]>([]);
  const [isSearchingDeals, setIsSearchingDeals] = useState<boolean>(false);
  const [activeResultFilter, setActiveResultFilter] = useState<'all' | 'ensembles' | 'products' | 'books'>('all');

  // Sync if omniSearchText was set externally
  useEffect(() => {
    if (omniSearchText && omniSearchText !== fashionSearchQuery) {
      setFashionSearchQuery(omniSearchText);
    }
  }, [omniSearchText]);

  // Load matching universal products and books whenever user types
  useEffect(() => {
    const q = fashionSearchQuery.trim();
    if (!q) {
      setUniversalMatches([]);
      setBookMatches([]);
      return;
    }

    let active = true;
    setIsSearchingDeals(true);

    const timer = setTimeout(async () => {
      try {
        const [uProds, bProds] = await Promise.all([
          searchUniversalProducts(q, 'All', currency),
          searchBooks(q, currency),
        ]);
        if (active) {
          setUniversalMatches(uProds.slice(0, 6));
          setBookMatches(bProds.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching cross-store search matches:', err);
      } finally {
        if (active) setIsSearchingDeals(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fashionSearchQuery, currency]);

  const categories = [
    { id: 'all', label: 'All Occasions' },
    { id: 'Celebrations & Weddings', label: 'Celebrations & Weddings' },
    { id: 'Galas & Evening Soirées', label: 'Galas & Black Tie' },
    { id: 'Daily Wear & Campus', label: 'Daily & Streetwear' },
  ];

  const cleanQuery = fashionSearchQuery.trim().toLowerCase();
  const searchTerms = cleanQuery.split(/\s+/).filter(Boolean);

  const filteredLooks = savedLooks.filter((look) => {
    // 1. Occasion filter
    if (selectedCategory !== 'all' && look.occasion !== selectedCategory) {
      return false;
    }

    // 2. Text search filter
    if (searchTerms.length > 0) {
      const garmentsText = look.items
        ? look.items.map((i) => `${i.name} ${i.category} ${i.color || ''} ${i.brand || ''}`).join(' ')
        : '';
      const fullText = `${look.title} ${look.occasion} ${look.vibe} ${look.styleBreakdown} ${garmentsText}`.toLowerCase();
      return searchTerms.some((term) => fullText.includes(term));
    }

    return true;
  });

  const handleFashionSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fashionSearchQuery.trim()) return;

    // If query has no local looks but has universal/book matches, route smartly
    if (filteredLooks.length === 0) {
      executeGlobalSearch(fashionSearchQuery);
    } else {
      setOmniSearchText(fashionSearchQuery);
    }
  };

  const handleClearFashionSearch = () => {
    setFashionSearchQuery('');
    setOmniSearchText('');
    setUniversalMatches([]);
    setBookMatches([]);
    setActiveResultFilter('all');
  };

  const trendingFashionTags = [
    'Wedding Sangeet',
    'Black Tie Tuxedo',
    'Zara Linen Blazer',
    'Streetwear',
    'Nike Air Force 1',
    'Atomic Habits',
    'Sony XM5',
    'Silk Trousers',
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Editorial Hero */}
      <HeroSection
        onOpenPhotoStudio={onOpenPhotoStudio}
        onOpenLinkStudio={onOpenLinkStudio}
      />

      {/* Curated Ensembles & Deal Engine Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Main Fashion & Cross-Retailer Search Bar */}
        <div className="bg-[#101724] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
          <form onSubmit={handleFashionSearchSubmit} className="relative flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                value={fashionSearchQuery}
                onChange={(e) => setFashionSearchQuery(e.target.value)}
                placeholder="Search outfits, garments, books, tech, brands (e.g. Wedding, Blazer, Zara, Nike, Dune)..."
                className="w-full pl-12 pr-10 py-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-slate-400"
              />
              {fashionSearchQuery && (
                <button
                  type="button"
                  onClick={handleClearFashionSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search Deals</span>
              <span className="sm:hidden">Go</span>
            </button>
          </form>

          {/* Quick Trending Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 shrink-0 font-medium mr-1">Trending Searches:</span>
            {trendingFashionTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setFashionSearchQuery(tag);
                  setOmniSearchText(tag);
                }}
                className={`px-2.5 py-1 rounded-lg border transition shrink-0 whitespace-nowrap cursor-pointer ${
                  fashionSearchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header & View Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              <span>Haute Deconstructions & Deal Matrix</span>
              <span aria-hidden="true">·</span>
              <span>Sorted by Lowest Deal Price</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-white">
              {fashionSearchQuery
                ? `Results for "${fashionSearchQuery}"`
                : 'Trending Event Capsules & Dupes'}
            </h2>
          </div>

          {/* Search Result Categorization Tabs */}
          {cleanQuery ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
              <button
                onClick={() => setActiveResultFilter('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeResultFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'bg-[#121826] border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                All Results ({filteredLooks.length + universalMatches.length + bookMatches.length})
              </button>
              {filteredLooks.length > 0 && (
                <button
                  onClick={() => setActiveResultFilter('ensembles')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activeResultFilter === 'ensembles'
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-[#121826] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Outfits ({filteredLooks.length})
                </button>
              )}
              {universalMatches.length > 0 && (
                <button
                  onClick={() => setActiveResultFilter('products')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activeResultFilter === 'products'
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-[#121826] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Store Products ({universalMatches.length})
                </button>
              )}
              {bookMatches.length > 0 && (
                <button
                  onClick={() => setActiveResultFilter('books')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activeResultFilter === 'books'
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-[#121826] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Books ({bookMatches.length})
                </button>
              )}
            </div>
          ) : (
            /* Standard Occasion Filters when not searching */
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-[#121826] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 1. Outfits Section */}
        {(activeResultFilter === 'all' || activeResultFilter === 'ensembles') && filteredLooks.length > 0 && (
          <div className="space-y-4">
            {cleanQuery && (
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-semibold text-white">Full Outfit Ensembles & Curated Dupes</span>
                <span>{filteredLooks.length} look{filteredLooks.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLooks.map((look) => (
                <OutfitCard
                  key={look.id}
                  look={look}
                  onOpenDetails={(l) => setActiveOutfitModalLook(l)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. Direct Web Store Products Section */}
        {(activeResultFilter === 'all' || activeResultFilter === 'products') && universalMatches.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">
                  Multi-Store Price Matches across Amazon, Walmart, Target, Best Buy, Zara & Myntra
                </span>
              </div>
              <button
                onClick={() => {
                  setOmniSearchText(fashionSearchQuery);
                  setActiveTab('universal');
                }}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>View in Universal Search</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {universalMatches.map((product) => {
                const bestDeal = product.deals.find((d) => d.isBestDeal) || product.deals[0];
                return (
                  <div
                    key={product.id}
                    className="bg-[#101724] border border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col transition hover:border-slate-700 group"
                  >
                    <div className="aspect-[4/3] w-full bg-slate-900 overflow-hidden relative">
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-[#FFFC00] text-slate-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                        Lowest: {formatPrice(bestDeal.price, currency)}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-lg border border-white/10">
                        on {bestDeal.storeName}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span className="font-semibold text-amber-400">{product.brand}</span>
                          <span>{product.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-2">{product.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                          <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                          <span>{product.rating}</span>
                          <span className="text-slate-500">({product.reviewCount.toLocaleString()})</span>
                        </div>
                      </div>

                      {/* Store Deal Links */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.deals.slice(0, 3).map((d, idx) => (
                            <a
                              key={`${d.storeName}-${idx}`}
                              href={d.storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${
                                d.isBestDeal
                                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{d.storeName}:</span>
                              <span className="font-mono">{formatPrice(d.price, currency)}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          ))}
                        </div>

                        <a
                          href={bestDeal.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                          <span>Buy Best Deal on {bestDeal.storeName}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Literary Books Deals Section */}
        {(activeResultFilter === 'all' || activeResultFilter === 'books') && bookMatches.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">Book Price Index (Amazon, Barnes & Noble, Bookshop.org)</span>
              </div>
              <button
                onClick={() => {
                  setOmniSearchText(fashionSearchQuery);
                  setActiveTab('books');
                }}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>View in Books Finder</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bookMatches.map((book) => {
                const bestDeal = book.deals.find((d) => d.isLowestPrice) || book.deals[0];
                return (
                  <div
                    key={book.id}
                    className="bg-[#101724] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex gap-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-16 h-22 object-cover rounded-lg shadow-md shrink-0 bg-slate-900"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-400 font-semibold">{book.author}</span>
                        <h4 className="text-xs font-bold text-white line-clamp-2">{book.title}</h4>
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {formatPrice(bestDeal.price, currency)}
                        </div>
                      </div>
                    </div>

                    <a
                      href={bestDeal.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-[11px] font-semibold text-center flex items-center justify-center gap-1 transition"
                    >
                      <span>Buy on {bestDeal.storeName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Zero Results State (Only if NO outfits, NO products, and NO books match at all) */}
        {cleanQuery && filteredLooks.length === 0 && universalMatches.length === 0 && bookMatches.length === 0 && !isSearchingDeals && (
          <div className="bg-[#101724] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-white">
              No results found for "{fashionSearchQuery}"
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Try searching by product brand (e.g. Sony, Nike, Apple, Zara, Dyson) or book title (e.g. Atomic Habits, Dune).
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleClearFashionSearch}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Clear Search
              </button>
              <button
                onClick={onOpenPhotoStudio}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Upload & Scan Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Quick Ingestion Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-900/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white">
              Have a specific event outfit in mind?
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload a picture from your camera roll or paste item URLs. Gemini AI breaks down the textiles, cuts, and finds budget duplicates in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-center">
            <button
              onClick={onOpenPhotoStudio}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={onOpenLinkStudio}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-amber-400" />
              <span>Paste Links</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
