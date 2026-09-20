import React from 'react';
import { Home, Compass, Heart, Settings, Wallpaper, Sparkles } from 'lucide-react';

export type ScreenTab = 'home' | 'gallery' | 'favorites' | 'settings';

interface NavigationBottomBarProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  favoritesCount: number;
  hasActiveWallpaper: boolean;
  onOpenActiveWallpaper?: () => void;
}

export const NavigationBottomBar: React.FC<NavigationBottomBarProps> = ({
  currentTab,
  onTabChange,
  favoritesCount,
  hasActiveWallpaper,
  onOpenActiveWallpaper,
}) => {
  interface NavTabItem {
    id: ScreenTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
  }

  const tabs: NavTabItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gallery', label: 'Explore', icon: Compass },
    { id: 'favorites', label: 'Saved', icon: Heart, badge: favoritesCount > 0 ? favoritesCount : null },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="absolute bottom-3 inset-x-3 z-30 pointer-events-none">
      <nav className="pointer-events-auto max-w-sm mx-auto bg-neutral-900/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.7)] rounded-full px-2 py-1.5 flex items-center justify-around select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 py-2 px-3.5 rounded-full transition-all duration-300 group ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold shadow-inner'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'scale-110 text-emerald-400' : ''
                  }`}
                />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-neutral-900 shadow-sm animate-pulse">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-xs tracking-tight transition-all duration-200 ${
                  isActive ? 'block font-semibold' : 'hidden sm:block'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}
            </button>
          );
        })}

        {hasActiveWallpaper && onOpenActiveWallpaper && (
          <button
            onClick={onOpenActiveWallpaper}
            title="Live Wallpaper Active on Launcher"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all border border-emerald-500/30 group"
          >
            <div className="relative flex items-center justify-center">
              <Wallpaper className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[11px] font-bold hidden sm:inline">Active</span>
          </button>
        )}
      </nav>
    </div>
  );
};
