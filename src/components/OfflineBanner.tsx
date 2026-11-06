import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-amber-500/95 dark:bg-amber-600/95 text-slate-950 font-medium text-xs py-2 px-4 shadow-md backdrop-blur-sm flex items-center justify-center gap-2 transition-all">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        <strong>Offline Mode Active</strong> — Your saved event wardrobe capsules and shopping lists are cached and fully accessible.
      </span>
    </div>
  );
};
