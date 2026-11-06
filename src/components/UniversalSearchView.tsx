import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Camera,
  Upload,
  Globe,
  Star,
  ExternalLink,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
  RefreshCw,
  ShoppingBag,
  Layers,
  ShieldCheck,
  Truck,
  DollarSign,
  ChevronRight,
  X,
} from 'lucide-react';
import { UniversalProduct, UniversalCategory, UniversalStoreDeal } from '../types';
import { useApp } from '../context/AppContext';
import {
  searchUniversalProducts,
  scanUniversalProductPhoto,
  CURATED_UNIVERSAL_PRODUCTS,
} from '../services/universalSearchService';
import { formatPrice } from '../utils/currencies';

export const UniversalSearchView: React.FC = () => {
  const { currency, omniSearchText, setOmniSearchText } = useApp();

  const [searchQuery, setSearchQuery] = useState(omniSearchText || '');
  const [selectedCategory, setSelectedCategory] = useState<UniversalCategory>('All');
  const [sortBy, setSortBy] = useState<'best-deal' | 'rating' | 'price-asc'>('best-deal');
  const [products, setProducts] = useState<UniversalProduct[]>(CURATED_UNIVERSAL_PRODUCTS);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (omniSearchText && omniSearchText !== searchQuery) {
      setSearchQuery(omniSearchText);
    }
  }, [omniSearchText]);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [activeModalProduct, setActiveModalProduct] = useState<UniversalProduct | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: UniversalCategory[] = [
    'All',
    'Electronics',
    'Fashion',
    'Home & Living',
    'Books',
    'Beauty',
    'Sports',
  ];

  // Fetch search results
  useEffect(() => {
    let active = true;
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const results = await searchUniversalProducts(searchQuery, selectedCategory, currency);
        if (active) {
          // Sort results
          let sorted = [...results];
          if (sortBy === 'rating') {
            sorted.sort((a, b) => b.rating - a.rating);
          } else if (sortBy === 'price-asc') {
            sorted.sort((a, b) => {
              const minA = a.deals[0]?.price || 0;
              const minB = b.deals[0]?.price || 0;
              return minA - minB;
            });
          }
          setProducts(sorted);
        }
      } catch (err) {
        console.error('Universal product search error:', err);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory, sortBy, currency]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedPreview(base64);
      setIsScanningPhoto(true);

      try {
        const scanned = await scanUniversalProductPhoto({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg',
          currency,
        });

        if (scanned) {
          setProducts((prev) => [scanned, ...prev.filter(p => p.id !== scanned.id)]);
          setActiveModalProduct(scanned);
        }
      } catch (err) {
        console.error('Universal photo scan error:', err);
      } finally {
        setIsScanningPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const results = await searchUniversalProducts(searchQuery, selectedCategory, currency);
      let sorted = [...results];
      if (sortBy === 'rating') {
        sorted.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'price-asc') {
        sorted.sort((a, b) => {
          const minA = a.deals[0]?.price || 0;
          const minB = b.deals[0]?.price || 0;
          return minA - minB;
        });
      }
      setProducts(sorted);
    } catch (err) {
      console.error('Search submit error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setOmniSearchText('');
  };

  const trendingUniversalSearches = [
    'Sony WH-1000XM5',
    'AirPods Pro',
    'Nike Air Force 1',
    'Dyson Supersonic',
    'Kindle Paperwhite',
    'Nespresso Vertuo',
    'MacBook Air',
    'Zara Linen Blazer',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400">
            <Globe className="w-4 h-4" />
            <span>Cross-Retailer Omni Discovery</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Universal Cross-Store Internet Search
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
            Find any product across the internet at one place. Search by keyword or drop an image to aggregate authentic live prices from Amazon, Walmart, Best Buy, Target, and eBay.
          </p>
        </div>

        {/* Upload Button */}
        <div className="shrink-0 flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanningPhoto}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isScanningPhoto ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Image...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Visual Product Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Omni-Search Box with Dedicated Submit */}
      <div className="bg-[#101724] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any product across Amazon, Walmart, Target, Best Buy, eBay (e.g. Sony XM5, Dyson, Nike Air Force, MacBook)..."
              className="w-full pl-12 pr-10 py-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">Search Stores</span>
            <span className="sm:hidden">Go</span>
          </button>
        </form>

        {/* Trending Search Suggestions Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 shrink-0 font-medium mr-1">Trending Searches:</span>
          {trendingUniversalSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                searchUniversalProducts(term, selectedCategory, currency).then(res => setProducts(res));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700 transition shrink-0 whitespace-nowrap cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Category Pills & Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="best-deal">Lowest Price (Best Deal)</option>
              <option value="rating">Top Customer Rating</option>
              <option value="price-asc">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scanning Feedback Bar */}
      {isScanningPhoto && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {uploadedPreview && (
              <img
                src={uploadedPreview}
                alt="Product preview"
                className="w-14 h-14 object-cover rounded-xl border border-amber-500/40"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                Identifying item across global merchant indices...
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                Matching visual features with Amazon, Best Buy, Walmart, and Target catalogs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Trending Verified Deals'}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {products.length} product{products.length !== 1 ? 's' : ''} indexed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const bestDeal = product.deals.find(d => d.isBestDeal) || product.deals[0];
            const maxPriceDeal = product.deals.reduce((max, d) => (d.price > max.price ? d : max), product.deals[0]);
            const savings = maxPriceDeal ? Math.max(0, maxPriceDeal.price - bestDeal.price) : 0;

            return (
              <div
                key={product.id}
                className="bg-[#101724] border border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col transition hover:shadow-md hover:border-slate-700 group"
              >
                {/* Product Image Frame */}
                <div
                  onClick={() => setActiveModalProduct(product)}
                  className="aspect-[4/3] w-full bg-slate-900 overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Lowest Price Callout Badge */}
                  <div className="absolute top-3 left-3 bg-[#FFFC00] text-slate-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                    <span>Lowest Price:</span>
                    <span className="font-mono">{formatPrice(bestDeal.price, currency)}</span>
                  </div>

                  {/* Best Deal Retailer Tag */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-lg border border-white/10">
                    on {bestDeal.storeName}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    {/* Brand & Category */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{product.brand}</span>
                      <span>{product.category}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => setActiveModalProduct(product)}
                      className="text-base font-bold text-white line-clamp-2 cursor-pointer hover:text-amber-400 transition"
                    >
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                        <span>{product.rating}</span>
                      </div>
                      <span>({product.reviewCount.toLocaleString()} reviews)</span>
                    </div>
                  </div>

                  {/* Multi-Store Comparison Snippet */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Store Price Range:</span>
                      {savings > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Save up to {formatPrice(savings, currency)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.deals.map((d, dIdx) => (
                        <a
                          key={`${d.storeName}-${dIdx}`}
                          href={d.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${
                            d.isBestDeal
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <span>{d.storeName}:</span>
                          <span className="font-mono">{formatPrice(d.price, currency)}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Primary Direct CTA */}
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={bestDeal.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <span>Buy Best Deal on {bestDeal.storeName}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setActiveModalProduct(product)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Compare All Stores"
                    >
                      <Layers className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Store Price Comparison Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#0E1420] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {activeModalProduct.brand}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeModalProduct.category}
                </span>
              </div>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Product Top Brief */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={activeModalProduct.mainImage}
                    alt={activeModalProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="sm:col-span-7 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeModalProduct.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeModalProduct.description}
                  </p>
                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Key Specifications:
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {activeModalProduct.keySpecs.map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Multi-Store Comparison Matrix */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Store Live Price Comparison
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {activeModalProduct.deals.map((deal, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-4 transition ${
                        deal.isBestDeal ? 'bg-amber-500/[0.05] dark:bg-amber-500/[0.08]' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {deal.storeName}
                          </span>
                          {deal.isBestDeal && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFC00] text-slate-950">
                              ★ Lowest Price
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {deal.shippingNote}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                            {formatPrice(deal.price, currency)}
                          </div>
                          {deal.originalPrice && (
                            <div className="text-[11px] text-slate-400 line-through font-mono">
                              {formatPrice(deal.originalPrice, currency)}
                            </div>
                          )}
                        </div>

                        <a
                          href={deal.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            deal.isBestDeal
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>Buy Now</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
