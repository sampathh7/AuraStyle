import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AIStylistView } from './components/AIStylistView';
import { BookSearchView } from './components/BookSearchView';
import { UniversalSearchView } from './components/UniversalSearchView';
import { EventCapsulesView } from './components/EventCapsulesView';
import { CommunityBoardsView } from './components/CommunityBoardsView';
import { SavedWardrobeView } from './components/SavedWardrobeView';
import { MultimodalIngestionModal } from './components/MultimodalIngestionModal';
import { OutfitDetailModal } from './components/OutfitDetailModal';
import { SocialShareModal } from './components/SocialShareModal';
import { AuthModal } from './components/AuthModal';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { PriceDropAlertsDrawer } from './components/PriceDropAlertsDrawer';
import { PriceDropToast } from './components/PriceDropToast';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const {
    activeTab,
    activeOutfitModalLook,
    setActiveOutfitModalLook,
    shareModalLook,
    setShareModalLook,
    authModalOpen,
    setAuthModalOpen,
    ingestionModalOpen,
    setIngestionModalOpen,
    activePriceHistoryItem,
    setActivePriceHistoryItem,
  } = useApp();

  const [ingestionDefaultMode, setIngestionDefaultMode] = useState<'photo' | 'links'>('photo');

  const handleOpenPhotoStudio = () => {
    setIngestionDefaultMode('photo');
    setIngestionModalOpen(true);
  };

  const handleOpenLinkStudio = () => {
    setIngestionDefaultMode('links');
    setIngestionModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D14] text-slate-100 dark:bg-[#090D14] dark:text-slate-100 transition-colors pb-16 md:pb-0">
      {/* Top Navigation */}
      <Navbar />

      {/* Offline Connectivity Status Banner */}
      <OfflineBanner />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {(activeTab === 'stylist' || activeTab === 'fashion') && (
          <AIStylistView
            onOpenPhotoStudio={handleOpenPhotoStudio}
            onOpenLinkStudio={handleOpenLinkStudio}
          />
        )}

        {activeTab === 'books' && <BookSearchView />}

        {activeTab === 'universal' && <UniversalSearchView />}

        {activeTab === 'capsules' && <EventCapsulesView />}

        {activeTab === 'community' && <CommunityBoardsView />}

        {activeTab === 'wardrobe' && (
          <SavedWardrobeView onOpenStudio={handleOpenPhotoStudio} />
        )}
      </main>

      {/* Mobile Touch Ergonomic Bottom Bar */}
      <MobileBottomNav />

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-6 bg-[#090D14] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-white">
              AuraStyle
            </span>
            <span aria-hidden="true">·</span>
            <span>AI Fashion Deconstruction & Universal Deal Matrix</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Zara · Myntra · ASOS · Barnes & Noble · Amazon · Best Buy · Walmart</span>
            <span aria-hidden="true">·</span>
            <span>PWA & Offline Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <MultimodalIngestionModal
        isOpen={ingestionModalOpen}
        onClose={() => setIngestionModalOpen(false)}
        defaultMode={ingestionDefaultMode}
      />

      <OutfitDetailModal
        look={activeOutfitModalLook}
        onClose={() => setActiveOutfitModalLook(null)}
      />

      <SocialShareModal
        look={shareModalLook}
        onClose={() => setShareModalLook(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Proactive Price History Modal */}
      <PriceHistoryModal
        payload={activePriceHistoryItem}
        onClose={() => setActivePriceHistoryItem(null)}
      />

      {/* Price Drop Notifications Drawer */}
      <PriceDropAlertsDrawer />

      {/* Live Flash Price Drop Toast */}
      <PriceDropToast />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
