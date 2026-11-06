import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CurrencyCode,
  OutfitLook,
  EventCapsule,
  CommunityPost,
  UserProfile,
  ChecklistItem,
  PriceDropAlert,
  PriceHistoryPoint,
  BenchmarkSizes,
} from '../types';
import {
  INITIAL_USER,
  CURATED_LOOKS,
  INITIAL_CAPSULES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_PRICE_ALERTS,
  generateSamplePriceHistory,
} from '../utils/mockData';
import { safeStorage } from '../utils/safeStorage';

export type AppTab = 'fashion' | 'stylist' | 'books' | 'universal' | 'capsules' | 'community' | 'wardrobe';

interface AppContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: UserProfile | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  updateUserBenchmarkSizes: (sizes: BenchmarkSizes) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Looks & Wardrobe
  savedLooks: OutfitLook[];
  saveLook: (look: OutfitLook) => void;
  removeLook: (lookId: string) => void;
  toggleLikeLook: (lookId: string) => void;
  activeOutfitModalLook: OutfitLook | null;
  setActiveOutfitModalLook: (look: OutfitLook | null) => void;

  // Event Capsules & Checklists
  capsules: EventCapsule[];
  createCapsule: (capsule: Omit<EventCapsule, 'id' | 'checklist'>) => void;
  deleteCapsule: (capsuleId: string) => void;
  toggleChecklistItem: (capsuleId: string, itemId: string) => void;
  addPieceToCapsule: (capsuleId: string, item: Omit<ChecklistItem, 'id' | 'purchased' | 'priceHistory'>) => void;
  setTargetPriceAlert: (capsuleId: string, itemId: string, targetPrice: number) => void;

  // Price History & Deal Alerts
  priceAlerts: PriceDropAlert[];
  unreadAlertsCount: number;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  dismissAlert: (alertId: string) => void;
  checkLivePriceDrops: () => { newAlertsCount: number; affectedItems: string[] };
  activePriceHistoryItem: { capsule: EventCapsule; item: ChecklistItem } | null;
  setActivePriceHistoryItem: (payload: { capsule: EventCapsule; item: ChecklistItem } | null) => void;
  alertsDrawerOpen: boolean;
  setAlertsDrawerOpen: (open: boolean) => void;
  latestPriceDropToast: PriceDropAlert | null;
  setLatestPriceDropToast: (toast: PriceDropAlert | null) => void;

  // Community
  communityPosts: CommunityPost[];
  upvotePost: (postId: string) => void;
  addCommentToPost: (postId: string, text: string, altUrl?: string) => void;
  createCommunityPost: (look: OutfitLook, caption: string, tags: string[]) => void;

  // Global Omni-Search
  omniSearchText: string;
  setOmniSearchText: (text: string) => void;
  executeGlobalSearch: (query: string, preferredTab?: AppTab) => void;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  shareModalLook: OutfitLook | null;
  setShareModalLook: (look: OutfitLook | null) => void;
  ingestionModalOpen: boolean;
  setIngestionModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = safeStorage.getItem('aurastyle_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default majestic dark mode
  });

  // Sync theme class to documentElement
  useEffect(() => {
    safeStorage.setItem('aurastyle_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Currency
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = safeStorage.getItem('aurastyle_currency') as CurrencyCode;
    return saved || 'INR';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    safeStorage.setItem('aurastyle_currency', c);
  };

  // User auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = safeStorage.getItem('aurastyle_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const login = (name: string, email: string) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name || 'Fashion Connoisseur',
      handle: `@${(name || 'user').toLowerCase().replace(/\s+/g, '')}`,
      email: email || 'user@aurastyle.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      preferredCurrency: currency,
      favoriteAesthetic: 'Contemporary Luxury',
      savedLookIds: [],
    };
    setUser(newUser);
    safeStorage.setItem('aurastyle_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    safeStorage.removeItem('aurastyle_user');
  };

  const updateUserBenchmarkSizes = (sizes: BenchmarkSizes) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, benchmarkSizes: sizes };
      safeStorage.setItem('aurastyle_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AppTab>('stylist');

  // Global Omni-Search query state shared across navbar and views
  const [omniSearchText, setOmniSearchText] = useState<string>('');

  const executeGlobalSearch = (query: string, preferredTab?: AppTab) => {
    const q = query.trim();
    setOmniSearchText(q);
    if (preferredTab) {
      setActiveTab(preferredTab);
      return;
    }
    const lower = q.toLowerCase();
    if (
      lower.includes('book') ||
      lower.includes('novel') ||
      lower.includes('author') ||
      lower.includes('isbn') ||
      lower.includes('habits') ||
      lower.includes('potter') ||
      lower.includes('dune') ||
      lower.includes('weir') ||
      lower.includes('clear') ||
      lower.includes('money')
    ) {
      setActiveTab('books');
    } else if (
      lower.includes('saree') ||
      lower.includes('blazer') ||
      lower.includes('tuxedo') ||
      lower.includes('sherwani') ||
      lower.includes('gown') ||
      lower.includes('lehenga') ||
      lower.includes('wedding') ||
      lower.includes('cocktail') ||
      lower.includes('streetwear') ||
      lower.includes('gala')
    ) {
      setActiveTab('stylist');
    } else {
      setActiveTab('universal');
    }
  };

  // Saved looks
  const [savedLooks, setSavedLooks] = useState<OutfitLook[]>(() => {
    const saved = safeStorage.getItem('aurastyle_saved_looks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return CURATED_LOOKS;
      }
    }
    return CURATED_LOOKS;
  });

  useEffect(() => {
    safeStorage.setItem('aurastyle_saved_looks', JSON.stringify(savedLooks));
  }, [savedLooks]);

  const saveLook = (look: OutfitLook) => {
    setSavedLooks((prev) => {
      if (prev.some((l) => l.id === look.id)) return prev;
      return [look, ...prev];
    });
  };

  const removeLook = (lookId: string) => {
    setSavedLooks((prev) => prev.filter((l) => l.id !== lookId));
  };

  const toggleLikeLook = (lookId: string) => {
    setSavedLooks((prev) =>
      prev.map((l) => {
        if (l.id === lookId) {
          const hasLiked = !l.hasLiked;
          return {
            ...l,
            hasLiked,
            likesCount: hasLiked ? l.likesCount + 1 : Math.max(0, l.likesCount - 1),
          };
        }
        return l;
      })
    );
  };

  // Event capsules
  const [capsules, setCapsules] = useState<EventCapsule[]>(() => {
    const saved = safeStorage.getItem('aurastyle_capsules');
    if (saved) {
      try {
        const parsed: EventCapsule[] = JSON.parse(saved);
        return parsed.map((cap) => ({
          ...cap,
          checklist: (cap.checklist || []).map((item) => ({
            ...item,
            priceHistory:
              Array.isArray(item.priceHistory) && item.priceHistory.length > 0
                ? item.priceHistory
                : generateSamplePriceHistory(item.price, item.currency, item.storeName),
          })),
        }));
      } catch (e) {
        return INITIAL_CAPSULES;
      }
    }
    return INITIAL_CAPSULES;
  });

  useEffect(() => {
    safeStorage.setItem('aurastyle_capsules', JSON.stringify(capsules));
  }, [capsules]);

  const createCapsule = (newCap: Omit<EventCapsule, 'id' | 'checklist'>) => {
    const capsule: EventCapsule = {
      ...newCap,
      id: `cap-${Date.now()}`,
      checklist: [],
    };
    setCapsules((prev) => [capsule, ...prev]);
  };

  const deleteCapsule = (capsuleId: string) => {
    setCapsules((prev) => prev.filter((c) => c.id !== capsuleId));
  };

  const toggleChecklistItem = (capsuleId: string, itemId: string) => {
    setCapsules((prev) =>
      prev.map((c) => {
        if (c.id === capsuleId) {
          return {
            ...c,
            checklist: c.checklist.map((item) =>
              item.id === itemId ? { ...item, purchased: !item.purchased } : item
            ),
          };
        }
        return c;
      })
    );
  };

  const addPieceToCapsule = (
    capsuleId: string,
    item: Omit<ChecklistItem, 'id' | 'purchased' | 'priceHistory'>
  ) => {
    setCapsules((prev) =>
      prev.map((c) => {
        if (c.id === capsuleId) {
          const priceHistory = generateSamplePriceHistory(
            item.price,
            item.currency,
            item.storeName
          );

          const newItem: ChecklistItem = {
            ...item,
            id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            purchased: false,
            originalPrice: item.originalPrice || Math.round(item.price * 1.6),
            onSale: false,
            lowestPriceRecorded: item.price,
            targetPriceAlert: Math.round(item.price * 0.9),
            priceHistory,
            lastPriceCheck: 'Just added',
          };
          return {
            ...c,
            checklist: [...c.checklist, newItem],
          };
        }
        return c;
      })
    );
  };

  const setTargetPriceAlert = (
    capsuleId: string,
    itemId: string,
    targetPrice: number
  ) => {
    setCapsules((prev) =>
      prev.map((c) => {
        if (c.id === capsuleId) {
          return {
            ...c,
            checklist: c.checklist.map((it) =>
              it.id === itemId ? { ...it, targetPriceAlert: targetPrice } : it
            ),
          };
        }
        return c;
      })
    );
  };

  // Price Drop Alerts System
  const [priceAlerts, setPriceAlerts] = useState<PriceDropAlert[]>(() => {
    const saved = safeStorage.getItem('aurastyle_price_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRICE_ALERTS;
      }
    }
    return INITIAL_PRICE_ALERTS;
  });

  useEffect(() => {
    safeStorage.setItem('aurastyle_price_alerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const unreadAlertsCount = priceAlerts.filter((a) => !a.read).length;

  const markAlertAsRead = (alertId: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const markAllAlertsAsRead = () => {
    setPriceAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const dismissAlert = (alertId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const [latestPriceDropToast, setLatestPriceDropToast] = useState<PriceDropAlert | null>(null);

  // Proactive Live Price Drop Checker
  const checkLivePriceDrops = () => {
    const newAlerts: PriceDropAlert[] = [];
    const affectedNames: string[] = [];

    setCapsules((prevCapsules) => {
      return prevCapsules.map((capsule) => {
        const updatedChecklist = capsule.checklist.map((item) => {
          // Check items not yet purchased or eligible for discount drop
          if (!item.purchased && (!item.onSale || Math.random() > 0.4)) {
            // Apply a realistic flash sale discount of 15% - 35%
            const dropPercent = Math.floor(Math.random() * 20) + 15;
            const newPrice = Math.max(99, Math.round(item.price * (1 - dropPercent / 100)));
            const discountAmt = item.price - newPrice;

            if (discountAmt > 0) {
              const alert: PriceDropAlert = {
                id: `alert-${Date.now()}-${item.id}`,
                itemId: item.id,
                capsuleId: capsule.id,
                capsuleName: capsule.eventName,
                itemName: item.itemName,
                storeName: `${item.storeName} Flash Sale`,
                previousPrice: item.price,
                currentSalePrice: newPrice,
                discountPercent: dropPercent,
                currency: item.currency,
                timestamp: 'Just now',
                storeUrl: item.storeUrl,
                read: false,
              };

              newAlerts.push(alert);
              affectedNames.push(item.itemName);

              const prevHistory =
                Array.isArray(item.priceHistory) && item.priceHistory.length > 0
                  ? item.priceHistory
                  : generateSamplePriceHistory(item.price, item.currency, item.storeName);

              const updatedHistory: PriceHistoryPoint[] = [
                ...prevHistory,
                {
                  date: 'Just now',
                  price: newPrice,
                  currency: item.currency,
                  storeName: `${item.storeName} (Flash Deal)`,
                  isLowest: true,
                },
              ];

              return {
                ...item,
                price: newPrice,
                onSale: true,
                saleDiscountPercent: dropPercent,
                lowestPriceRecorded: Math.min(item.lowestPriceRecorded || item.price, newPrice),
                priceHistory: updatedHistory,
                lastPriceCheck: 'Just now',
              };
            }
          }
          return item;
        });

        return {
          ...capsule,
          checklist: updatedChecklist,
        };
      });
    });

    if (newAlerts.length > 0) {
      setPriceAlerts((prev) => [...newAlerts, ...prev]);
      setLatestPriceDropToast(newAlerts[0]);

      // Fire browser notification if allowed
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🎉 Price Drop Alert: ${newAlerts[0].itemName}`, {
            body: `Dropped ${newAlerts[0].discountPercent}% off to ${newAlerts[0].currentSalePrice} on ${newAlerts[0].storeName}!`,
            icon: '/icon.svg',
          });
        } catch (e) {
          // Ignore notification error
        }
      }
    }

    return {
      newAlertsCount: newAlerts.length,
      affectedItems: affectedNames,
    };
  };

  // Modals & Drawers state
  const [activePriceHistoryItem, setActivePriceHistoryItem] = useState<{
    capsule: EventCapsule;
    item: ChecklistItem;
  } | null>(null);

  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [shareModalLook, setShareModalLook] = useState<OutfitLook | null>(null);
  const [activeOutfitModalLook, setActiveOutfitModalLook] = useState<OutfitLook | null>(null);
  const [ingestionModalOpen, setIngestionModalOpen] = useState(false);

  // Community posts
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = safeStorage.getItem('aurastyle_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_COMMUNITY_POSTS;
      }
    }
    return INITIAL_COMMUNITY_POSTS;
  });

  useEffect(() => {
    safeStorage.setItem('aurastyle_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  const upvotePost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasUpvoted = !p.hasUpvoted;
          return {
            ...p,
            hasUpvoted,
            upvotes: hasUpvoted ? p.upvotes + 1 : Math.max(0, p.upvotes - 1),
          };
        }
        return p;
      })
    );
  };

  const addCommentToPost = (postId: string, text: string, altUrl?: string) => {
    if (!text.trim()) return;
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `comm-${Date.now()}`,
                authorName: user?.name || 'Guest Stylist',
                authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
                text,
                timestamp: 'Just now',
                suggestedAlternativeUrl: altUrl,
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const createCommunityPost = (look: OutfitLook, caption: string, tags: string[]) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      look,
      caption,
      upvotes: 1,
      hasUpvoted: true,
      tags: tags.length ? tags : ['CuratedAura', 'BudgetCouture'],
      comments: [],
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        theme,
        toggleTheme,
        user,
        login,
        logout,
        updateUserBenchmarkSizes,
        activeTab,
        setActiveTab,
        savedLooks,
        saveLook,
        removeLook,
        toggleLikeLook,
        activeOutfitModalLook,
        setActiveOutfitModalLook,
        capsules,
        createCapsule,
        deleteCapsule,
        toggleChecklistItem,
        addPieceToCapsule,
        setTargetPriceAlert,
        priceAlerts,
        unreadAlertsCount,
        markAlertAsRead,
        markAllAlertsAsRead,
        dismissAlert,
        checkLivePriceDrops,
        activePriceHistoryItem,
        setActivePriceHistoryItem,
        alertsDrawerOpen,
        setAlertsDrawerOpen,
        latestPriceDropToast,
        setLatestPriceDropToast,
        omniSearchText,
        setOmniSearchText,
        executeGlobalSearch,
        communityPosts,
        upvotePost,
        addCommentToPost,
        createCommunityPost,
        authModalOpen,
        setAuthModalOpen,
        shareModalLook,
        setShareModalLook,
        ingestionModalOpen,
        setIngestionModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
