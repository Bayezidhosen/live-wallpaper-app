import React from 'react';
import { Sparkles } from 'lucide-react';

interface AdBannerProps {
  isPremium: boolean;
  onUpgradeToPremium?: () => void;
  type?: 'banner' | 'native';
}

export const AdBanner: React.FC<AdBannerProps> = ({ isPremium, onUpgradeToPremium, type = 'banner' }) => {
  if (isPremium) {
    return null; // Ad-Free Premium user
  }

  if (type === 'native') {
    return (
      <div className="my-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
            Ad • Sponsored
          </span>
          <button
            onClick={onUpgradeToPremium}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Remove Ads
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-lg">
            LW
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">LiveWall Ultra 4K Collection</h4>
            <p className="text-xs text-neutral-400 line-clamp-1">Experience 120 FPS battery-optimized OLED live animations.</p>
          </div>
          <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-colors">
            Install
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-900/95 border-t border-neutral-800 px-3 py-1.5 flex items-center justify-between text-xs text-neutral-400">
      <div className="flex items-center gap-2">
        <span className="bg-neutral-800 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700">
          Ad
        </span>
        <span className="text-[11px] text-neutral-300 font-medium truncate">
          Google AdMob • LiveWall Display Network
        </span>
      </div>
      <button
        onClick={onUpgradeToPremium}
        className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20"
      >
        <Sparkles className="w-2.5 h-2.5" />
        Go Premium
      </button>
    </div>
  );
};
