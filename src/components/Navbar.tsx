import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Moon, User, ChevronDown, Check, Bell, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../utils/currencies';
import { CurrencyCode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currency,
    setCurrency,
    theme,
    toggleTheme,
    user,
    setAuthModalOpen,
    unreadAlertsCount,
    setAlertsDrawerOpen,
    omniSearchText,
    setOmniSearchText,
    executeGlobalSearch,
  } = useApp();

  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [navQuery, setNavQuery] = useState(omniSearchText || '');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (omniSearchText && omniSearchText !== navQuery) {
      setNavQuery(omniSearchText);
    }
  }, [omniSearchText]);

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navQuery.trim()) return;
    executeGlobalSearch(navQuery);
    setMobileSearchOpen(false);
  };

  const handleClearNavQuery = () => {
    setNavQuery('');
    setOmniSearchText('');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#090D14]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('stylist')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
            </div>
            <span className="font-editorial text-xl font-bold tracking-tight text-white whitespace-nowrap">
              AuraStyle
            </span>
          </button>
        </div>

        {/* Global Omni-Search Input in Navbar */}
        <form onSubmit={handleNavSearchSubmit} className="hidden sm:flex items-center relative flex-1 max-w-xs md:max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            placeholder="Search fashion, books, tech deals..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500/50 transition"
          />
          {navQuery && (
            <button
              type="button"
              onClick={handleClearNavQuery}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Zone 2: Dedicated Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('stylist')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'stylist' || activeTab === 'fashion'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Fashion
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'books'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setActiveTab('universal')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'universal'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Universal Search
          </button>
          <button
            onClick={() => setActiveTab('capsules')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'capsules'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Capsules
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'wardrobe'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'community'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Community
          </button>
        </nav>

        {/* Zone 3: Primary Actions Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Change shopping currency"
            >
              <span>{CURRENCIES[currency].symbol}</span>
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {currencyDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCurrencyDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-36 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyDropdownOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <span className="text-slate-700 dark:text-slate-200">
                        {CURRENCIES[c].symbol} {c}
                      </span>
                      {currency === c && <Check className="w-3 h-3 text-amber-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Price Drop Alerts Bell */}
          <button
            onClick={() => setAlertsDrawerOpen(true)}
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Price Drop Alerts"
            aria-label="View Price Drop Alerts"
          >
            <Bell className="w-4 h-4 text-amber-500" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-slate-950">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors"
            title="Search"
            aria-label="Open mobile search"
          >
            <Search className="w-4 h-4 text-amber-400" />
          </button>

          {/* User Account Button */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 p-1 pl-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 transition-colors"
            title={user ? `Signed in as ${user.name}` : 'Sign In'}
          >
            {user ? (
              <>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-500/30"
                />
                <span className="hidden sm:inline text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[90px]">
                  {user.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="hidden sm:inline text-slate-700 dark:text-slate-300">Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Row */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-slate-800/80 bg-[#090D14]/98 animate-fadeIn">
          <form onSubmit={handleNavSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                placeholder="Search fashion, books, tech deals..."
                className="w-full pl-8 pr-7 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {navQuery && (
                <button
                  type="button"
                  onClick={handleClearNavQuery}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
