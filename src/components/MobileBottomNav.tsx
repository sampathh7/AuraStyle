import React from 'react';
import { Sparkles, BookOpen, Globe, Bookmark, Briefcase } from 'lucide-react';
import { useApp, AppTab } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, savedLooks } = useApp();

  const tabs: { id: AppTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'stylist', label: 'Fashion', icon: Sparkles },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'universal', label: 'Search', icon: Globe },
    { id: 'wardrobe', label: 'Wardrobe', icon: Bookmark, badge: savedLooks.length },
    { id: 'capsules', label: 'Capsules', icon: Briefcase },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090D14]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? 'text-amber-500 dark:text-amber-400 scale-110'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {tab.badge && tab.badge > 0 && tab.id === 'wardrobe' && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 min-w-[14px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
