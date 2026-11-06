import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Upload,
  Camera,
  Star,
  ExternalLink,
  Tag,
  Check,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  RefreshCw,
  ShoppingBag,
  Info,
  X,
} from 'lucide-react';
import { BookProduct, BookFormat, BookStoreDeal } from '../types';
import { useApp } from '../context/AppContext';
import { searchBooks, scanBookCoverPhoto, CURATED_BOOKS_CATALOG } from '../services/bookService';
import { formatPrice } from '../utils/currencies';
import { safeStorage } from '../utils/safeStorage';

export const BookSearchView: React.FC = () => {
  const { currency, omniSearchText, setOmniSearchText } = useApp();

  const [searchQuery, setSearchQuery] = useState(omniSearchText || '');
  const [selectedFormat, setSelectedFormat] = useState<BookFormat | 'all'>('all');
  const [selectedBook, setSelectedBook] = useState<BookProduct | null>(CURATED_BOOKS_CATALOG[0]);
  const [bookResults, setBookResults] = useState<BookProduct[]>(CURATED_BOOKS_CATALOG);
  const [isSearching, setIsSearching] = useState(false);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [savedBookIds, setSavedBookIds] = useState<string[]>(() => {
    const saved = safeStorage.getItem('aurastyle_saved_books');
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (omniSearchText && omniSearchText !== searchQuery) {
      setSearchQuery(omniSearchText);
    }
  }, [omniSearchText]);

  // Sync books with search query
  useEffect(() => {
    let active = true;
    const fetchBooks = async () => {
      setIsSearching(true);
      try {
        const results = await searchBooks(searchQuery, currency);
        if (active) {
          setBookResults(results);
          if (results.length > 0 && (!selectedBook || !results.some(b => b.id === selectedBook.id))) {
            setSelectedBook(results[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchBooks, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, currency]);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const results = await searchBooks(searchQuery, currency);
      setBookResults(results);
      if (results.length > 0) {
        setSelectedBook(results[0]);
      }
    } catch (err) {
      console.error('Submit book search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setOmniSearchText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedImagePreview(base64);
      setIsScanningPhoto(true);

      try {
        const scannedBook = await scanBookCoverPhoto({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg',
          currency,
        });

        if (scannedBook) {
          // Prepend to results
          setBookResults((prev) => [scannedBook, ...prev.filter(b => b.id !== scannedBook.id)]);
          setSelectedBook(scannedBook);
        }
      } catch (err) {
        console.error('Book photo scan error:', err);
      } finally {
        setIsScanningPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSaveBook = (bookId: string) => {
    setSavedBookIds((prev) => {
      const updated = prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId];
      safeStorage.setItem('aurastyle_saved_books', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCopyShare = () => {
    if (!selectedBook) return;
    const shareText = `${selectedBook.title} by ${selectedBook.author} - Lowest price comparison on AuraStyle Books`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredDeals = selectedBook
    ? selectedBook.deals.filter(deal => selectedFormat === 'all' || deal.format === selectedFormat)
    : [];

  const lowestDeal = selectedBook?.deals.find(d => d.isLowestPrice) || selectedBook?.deals[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400">
            <BookOpen className="w-4 h-4" />
            <span>Multi-Store Literary Discovery</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Visual Book Search & Deal Matrix
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
            Upload any book cover, spine, or search by title and ISBN. Compare live prices across Amazon, Barnes & Noble, Bookshop.org, and AbeBooks with guaranteed lowest-price routing.
          </p>
        </div>

        {/* Upload Trigger Button */}
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
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isScanningPhoto ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Cover...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Upload Book Photo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search & Ingestion Bar with Form Submission */}
      <div className="bg-[#101724] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by book title, author, or 13-digit ISBN (e.g. Atomic Habits, Dune, Harry Potter, 1984)..."
              className="w-full pl-12 pr-10 py-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800 cursor-pointer"
                title="Clear book search"
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
            <span className="hidden sm:inline">Find Deals</span>
            <span className="sm:hidden">Go</span>
          </button>
        </form>

        {/* Quick Sample Book Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 shrink-0 font-medium mr-1">Trending Books:</span>
          {['Atomic Habits', 'Project Hail Mary', 'Harry Potter', 'The Hobbit', 'Dune', '1984', 'Sapiens', 'Clean Code'].map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => {
                setSearchQuery(title);
                searchBooks(title, currency).then((res) => {
                  setBookResults(res);
                  if (res.length > 0) setSelectedBook(res[0]);
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700 transition shrink-0 whitespace-nowrap cursor-pointer"
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Scanning Banner if Image Upload in Progress */}
      {isScanningPhoto && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {uploadedImagePreview && (
              <img
                src={uploadedImagePreview}
                alt="Uploaded book preview"
                className="w-12 h-16 object-cover rounded-lg border border-amber-500/40"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                Analyzing book cover with Gemini 3.8 Flash Vision...
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                Extracting typography, author, ISBN metadata, and fetching authentic publisher cover.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Selected Book Showcase & Price Matrix */}
      {selectedBook && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Authentic High-Resolution Book Cover */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#101724] border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center">
              <div className="relative group w-48 sm:w-60 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to Open Library clean default if image load fails
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Lowest Price Callout Tag on Cover */}
                {lowestDeal && (
                  <div className="absolute top-3 left-3 bg-[#FFFC00] text-slate-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                    <span>Best Deal:</span>
                    <span className="font-mono">{formatPrice(lowestDeal.price, currency)}</span>
                  </div>
                )}

                {/* Action Floating Buttons */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSaveBook(selectedBook.id)}
                    className={`p-2.5 rounded-xl backdrop-blur-md transition shadow-md ${
                      savedBookIds.includes(selectedBook.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/60 hover:bg-black/80 text-white'
                    }`}
                    title="Save to Reading List"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={handleCopyShare}
                    className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md"
                    title="Share Book"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Unboxed Metadata (Zero-Pill Discipline) */}
              <div className="mt-6 text-center space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 flex-wrap">
                  <span>ISBN: {selectedBook.isbn}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedBook.publishedYear || 2021}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedBook.pageCount ? `${selectedBook.pageCount} pages` : 'Standard Edition'}</span>
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {selectedBook.genre.join(' · ')}
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-50 dark:bg-[#101724]/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Editorial Synopsis</span>
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedBook.synopsis}
              </p>
            </div>
          </div>

          {/* Right Column: Multi-Store Comparison Matrix & Deals */}
          <div className="lg:col-span-7 space-y-6">
            {/* Book Title & Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>By {selectedBook.author}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedBook.publisher || 'Major Publisher'}</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {selectedBook.title}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 stroke-none" />
                  <span>{selectedBook.rating}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({selectedBook.reviewCount.toLocaleString()} global verified reviews)
                </span>
                {selectedBook.detectedVia === 'photo' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Verified from Photo
                  </span>
                )}
              </div>
            </div>

            {/* Format Filter Bar (Paperback, Hardcover, Kindle, Audiobook) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 mr-1">
                Edition:
              </span>
              {(['all', 'Paperback', 'Hardcover', 'Kindle / eBook', 'Audiobook'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                    selectedFormat === fmt
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {fmt === 'all' ? 'All Formats' : fmt}
                </button>
              ))}
            </div>

            {/* Multi-Store Price Comparison Matrix */}
            <div className="bg-[#101724] border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    Live Multi-Store Price Index
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct buy links with verified stock availability and estimated delivery
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-slate-400">
                  Currency: {currency}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredDeals.map((deal, idx) => (
                  <div
                    key={`${deal.storeName}-${deal.format}-${idx}`}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                      deal.isLowestPrice ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]' : ''
                    }`}
                  >
                    {/* Store Info & Format */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {deal.storeName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {deal.format}
                        </span>
                        {deal.isLowestPrice && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFFC00] text-slate-950">
                            ★ Lowest Price
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span>{deal.editionNote || 'Standard Publisher Edition'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {deal.deliveryEstimate}
                        </span>
                      </p>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white">
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
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                          deal.isLowestPrice
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>Buy on {deal.storeName}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Books Carousel / Grid */}
      <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Explore More Books Across Retailers
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {bookResults.length} title{bookResults.length !== 1 ? 's' : ''} available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {bookResults.map((book) => {
            const minDeal = book.deals.find(d => d.isLowestPrice) || book.deals[0];
            const isSelected = selectedBook?.id === book.id;

            return (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`text-left rounded-2xl border p-2.5 transition flex flex-col group ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101724] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 relative">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {minDeal && (
                    <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                      {formatPrice(minDeal.price, currency)}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {book.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {book.author}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
