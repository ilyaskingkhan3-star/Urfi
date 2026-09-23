import React from 'react';

interface OfflineStatusBannerProps {
  isOnline: boolean;
  cachedCount?: number;
  onRetry?: () => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({
  isOnline,
  cachedCount = 0,
  onRetry
}) => {
  if (isOnline) return null;

  return (
    <div 
      id="offline-status-banner"
      className="w-full bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-amber-950/90 border-b border-amber-500/40 px-4 py-2 text-amber-200 text-xs backdrop-blur-md flex items-center justify-between gap-3 shadow-lg z-30 transition-all duration-300 animate-in slide-in-from-top-2"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="15" 
          height="15" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-amber-400 shrink-0"
        >
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight">
          <span className="font-bold tracking-wide text-amber-300">
            Offline Mode Active
          </span>
          <span className="text-[11px] text-amber-200/80">
            • Internet munqata hai. {cachedCount > 0 ? `${cachedCount} mefooz shuda (cached) messages dekh rahe hain.` : 'Purani baatcheet mefooz hai.'}
          </span>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] uppercase font-bold tracking-wider text-amber-200 transition-colors active:scale-95"
        >
          Check Rabta
        </button>
      )}
    </div>
  );
};

export default OfflineStatusBanner;
