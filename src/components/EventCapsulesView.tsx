import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, convertAmount } from '../utils/currencies';
import { EventCapsule, ClothingItem } from '../types';

export const EventCapsulesView: React.FC = () => {
  const {
    capsules,
    createCapsule,
    deleteCapsule,
    toggleChecklistItem,
    addPieceToCapsule,
    currency,
    savedLooks,
    setActiveOutfitModalLook,
    setActivePriceHistoryItem,
    checkLivePriceDrops,
    setAlertsDrawerOpen,
  } = useApp();

  const [activeCapsuleId, setActiveCapsuleId] = useState<string>(
    capsules[0]?.id || ''
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New capsule form state
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-11-28');
  const [newDressCode, setNewDressCode] = useState('Cocktail Formal');
  const [newBudgetCeiling, setNewBudgetCeiling] = useState('10000');
  const [newNotes, setNewNotes] = useState('');

  // Add piece to active checklist form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ClothingItem['category']>('top');
  const [newItemStore, setNewItemStore] = useState('Myntra');

  const activeCapsule =
    capsules.find((c) => c.id === activeCapsuleId) || capsules[0];

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;

    createCapsule({
      eventName: newEventName,
      eventDate: newEventDate,
      dressCode: newDressCode,
      budgetCeiling: parseFloat(newBudgetCeiling) || 10000,
      currency,
      notes: newNotes,
      savedLookIds: [],
    });

    setNewEventName('');
    setShowCreateModal(false);
  };

  const handleAddPiece = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCapsule || !newItemName.trim()) return;

    const priceNum = parseFloat(newItemPrice) || 999;
    addPieceToCapsule(activeCapsule.id, {
      itemName: newItemName,
      category: newItemCategory,
      price: priceNum,
      currency,
      storeName: newItemStore,
      storeUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(newItemName)}`,
    });

    setNewItemName('');
    setNewItemPrice('');
  };

  if (capsules.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 mx-auto flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-editorial text-slate-950 dark:text-white">
          No Event Capsules Created Yet
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Keep upcoming wedding invitations, gala dinners, and daily wardrobes organized with budget tracking and direct store checklists.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-6 px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition hover:bg-amber-300"
        >
          Create First Event Capsule
        </button>
      </div>
    );
  }

  // Calculate totals for active capsule
  const totalSpent = (activeCapsule?.checklist || [])
    .filter((i) => i.purchased)
    .reduce(
      (sum, item) => sum + convertAmount(item.price, item.currency, currency),
      0
    );

  const totalEstimated = (activeCapsule?.checklist || []).reduce(
    (sum, item) => sum + convertAmount(item.price, item.currency, currency),
    0
  );

  const budgetCeilingConverted = activeCapsule
    ? convertAmount(activeCapsule.budgetCeiling, activeCapsule.currency, currency)
    : 10000;

  const budgetProgressPercent = Math.min(
    100,
    Math.round((totalEstimated / (budgetCeilingConverted || 1)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Capsule Creator Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>Invitation & Capsule Manager</span>
            <span aria-hidden="true">·</span>
            <span>Offline Synced</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-slate-950 dark:text-white">
            Upcoming Event Wardrobes
          </h2>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Event Capsule</span>
        </button>
      </div>

      {/* Main Grid: Capsule Selector Left + Active Capsule Workspace Right */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Capsule Cards Carousel / List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
            Your Invitations & Boards ({capsules.length})
          </span>

          {capsules.map((cap) => {
            const isActive = cap.id === activeCapsule?.id;
            const capEstimated = cap.checklist.reduce(
              (sum, i) => sum + convertAmount(i.price, i.currency, currency),
              0
            );

            return (
              <div
                key={cap.id}
                onClick={() => setActiveCapsuleId(cap.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-white dark:bg-[#131A28] border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {new Date(cap.eventDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <h3 className="text-base font-bold font-editorial text-slate-950 dark:text-white mt-1 line-clamp-1">
                      {cap.eventName}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatPrice(capEstimated, currency)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="truncate max-w-[140px] font-medium text-amber-600 dark:text-amber-400">
                    {cap.dressCode}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cap.checklist.filter((i) => i.purchased).length}/
                    {cap.checklist.length} acquired
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Capsule Detailed Workspace */}
        {activeCapsule && (
          <div className="lg:col-span-8 space-y-6">
            {/* Active Capsule Banner & Budget Meter */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{activeCapsule.dressCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Date:{' '}
                      {new Date(activeCapsule.eventDate).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold font-editorial text-slate-950 dark:text-white mt-0.5">
                    {activeCapsule.eventName}
                  </h3>
                  {activeCapsule.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {activeCapsule.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteCapsule(activeCapsule.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition"
                    title="Delete Capsule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Capsule Spend: {formatPrice(totalEstimated, currency)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    Ceiling: {formatPrice(budgetCeilingConverted, currency)}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetProgressPercent > 90
                        ? 'bg-rose-500'
                        : budgetProgressPercent > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  <span>Purchased so far: {formatPrice(totalSpent, currency)}</span>
                  <span>{budgetProgressPercent}% of total event budget used</span>
                </div>
              </div>
            </div>

            {/* Shopping Checklist Items */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  Wardrobe Checklist ({activeCapsule.checklist.length} items)
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const res = checkLivePriceDrops();
                      if (res.newAlertsCount === 0) {
                        setAlertsDrawerOpen(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition active:scale-95 shadow-sm"
                    title="Check current deals across all stores"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Scan for Live Drops</span>
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tap item to check off
                  </span>
                </div>
              </div>

              {/* Proactive Live Deals Status Bar */}
              <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/15 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    <strong>Proactive Price Tracking Active</strong> — Continuous monitoring across Indian & foreign retailers.
                  </span>
                </div>
                <button
                  onClick={() => setAlertsDrawerOpen(true)}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline shrink-0"
                >
                  View Alert Center →
                </button>
              </div>

              <div className="space-y-2.5">
                {activeCapsule.checklist.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No items in this checklist yet. Browse AI Stylist looks and tap "Add to List", or add pieces below.
                  </div>
                ) : (
                  activeCapsule.checklist.map((item) => {
                    const convertedPrice = convertAmount(
                      item.price,
                      item.currency,
                      currency
                    );
                    const convertedOrig = item.originalPrice
                      ? convertAmount(item.originalPrice, item.currency, currency)
                      : null;

                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          toggleChecklistItem(activeCapsule.id, item.id)
                        }
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer gap-2 ${
                          item.purchased
                            ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                            : item.onSale
                            ? 'bg-amber-500/5 dark:bg-amber-400/5 border-amber-500/40 shadow-sm'
                            : 'bg-white dark:bg-[#151D2C] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.purchased ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                          )}
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.itemName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold text-slate-900 dark:text-white ${
                                  item.purchased ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {item.itemName}
                              </span>
                              {item.onSale && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white animate-pulse">
                                  {item.saleDiscountPercent}% OFF SALE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="capitalize">{item.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{item.storeName}</span>
                              {item.lastPriceCheck && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>Checked: {item.lastPriceCheck}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0">
                          <div className="text-left sm:text-right">
                            {convertedOrig && convertedOrig > convertedPrice && (
                              <span className="text-[10px] text-slate-400 line-through tabular-nums block">
                                {formatPrice(convertedOrig, currency)}
                              </span>
                            )}
                            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                              {formatPrice(convertedPrice, currency)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Price History & Deal Alert Trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePriceHistoryItem({
                                  capsule: activeCapsule,
                                  item,
                                });
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                              title="View Price History Chart & Set Alerts"
                            >
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Price Trend</span>
                            </button>

                            {item.storeUrl && (
                              <a
                                href={item.storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition"
                                title="Open Store Deal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Custom Piece Inline Form */}
              <form
                onSubmit={handleAddPiece}
                className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Add item (e.g. Silk Pocket Square)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />

                <input
                  type="number"
                  placeholder={`Price (${currency})`}
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full sm:w-28 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none tabular-nums"
                />

                <select
                  value={newItemCategory}
                  onChange={(e) =>
                    setNewItemCategory(e.target.value as ClothingItem['category'])
                  }
                  className="w-full sm:w-28 px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="footwear">Footwear</option>
                  <option value="accessory">Accessory</option>
                </select>

                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-800 disabled:opacity-40 transition whitespace-nowrap"
                >
                  Add Piece
                </button>
              </form>
            </div>

            {/* Saved Looks attached to this capsule */}
            {savedLooks.length > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  Associated Style Ensembles
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedLooks.slice(0, 2).map((look) => (
                    <div
                      key={look.id}
                      onClick={() => setActiveOutfitModalLook(look)}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {look.occasion}
                        </span>
                        <h5 className="text-sm font-bold font-editorial text-slate-900 dark:text-white">
                          {look.title}
                        </h5>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create New Capsule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold font-editorial text-slate-950 dark:text-white mb-4">
              Create New Event Capsule Board
            </h3>

            <form onSubmit={handleCreateCapsule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya’s Destination Wedding"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dress Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Champagne"
                    value={newDressCode}
                    onChange={(e) => setNewDressCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Budget Limit ({currency})
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={newBudgetCeiling}
                  onChange={(e) => setNewBudgetCeiling(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Venue
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Outdoor lawn setting, avoid stiletto heels on grass"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
