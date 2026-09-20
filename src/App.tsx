import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  ShieldAlert,
  SlidersHorizontal,
  Download,
  CheckCircle2,
  FolderCode,
  LayoutDashboard,
  Sparkles,
  Wifi,
  ExternalLink,
  Layers,
  X,
  Maximize2,
  Minimize2,
  Tv,
} from 'lucide-react';
import { Wallpaper, WallpaperCategory, UserSettings, AdminStats, SetWallpaperTarget } from './types';
import { CATEGORIES_LIST, INITIAL_WALLPAPERS } from './data/wallpapers';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { GalleryScreen } from './components/GalleryScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { NavigationBottomBar, ScreenTab } from './components/NavigationBottomBar';
import { WallpaperPreviewModal } from './components/WallpaperPreviewModal';
import { AndroidSystemDialog } from './components/AndroidSystemDialog';
import { AdminPortal } from './components/AdminPortal';
import { AndroidProjectExplorer } from './components/AndroidProjectExplorer';
import { ActiveWallpaperDeviceView } from './components/ActiveWallpaperDeviceView';
import { AdBanner } from './components/AdBanner';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [viewMode, setViewMode] = useState<'app' | 'admin' | 'android-project'>('app');
  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(INITIAL_WALLPAPERS);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Phone Frame toggle (flagship bezel vs maximized view)
  const [isFramed, setIsFramed] = useState(true);

  // Filter & Search
  const [activeCategory, setActiveCategory] = useState<WallpaperCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for Preview
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [showSetDialog, setShowSetDialog] = useState(false);

  // Active Live Wallpaper running on the device
  const [activeLiveWallpaper, setActiveLiveWallpaper] = useState<Wallpaper | null>(() => {
    return INITIAL_WALLPAPERS[0]; // Default active live wallpaper
  });
  const [activeLiveTarget, setActiveLiveTarget] = useState<SetWallpaperTarget>('both');
  const [isViewingDeviceLauncher, setIsViewingDeviceLauncher] = useState(false);

  // Favorites (persisted locally, simulating Room DB)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('livewall_room_favorites');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['wp-neon-cyberpunk', 'wp-anime-cherry-blossom']);
  });

  // Downloaded wallpapers cache
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('livewall_downloaded_cache');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['wp-neon-cyberpunk']);
  });

  // User Settings
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('livewall_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: 'dark',
      autoPlayPreview: true,
      wifiOnlyDownloads: false,
      notificationsEnabled: true,
      isPremiumAdFree: false,
      cachedStorageBytes: 48 * 1024 * 1024, // 48 MB default
    };
  });

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'info' | 'success' } | null>(null);

  const showToast = (text: string, type: 'info' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  };

  // Fetch wallpapers & stats from Express backend
  const fetchBackendData = useCallback(async () => {
    try {
      const [wpRes, statsRes] = await Promise.all([
        fetch('/api/wallpapers?limit=100'),
        fetch('/api/stats'),
      ]);

      if (wpRes.ok) {
        const data = await wpRes.json();
        if (data.wallpapers && data.wallpapers.length > 0) {
          setWallpapers(data.wallpapers);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAdminStats(statsData);
      }
    } catch (e) {
      console.warn('Backend API connection offline, using embedded database:', e);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('livewall_room_favorites', JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  // Persist downloaded cache
  useEffect(() => {
    try {
      localStorage.setItem('livewall_downloaded_cache', JSON.stringify(Array.from(downloadedIds)));
    } catch {}
  }, [downloadedIds]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('livewall_settings', JSON.stringify(userSettings));
    } catch {}
  }, [userSettings]);

  // Toggle Favorite
  const handleToggleFavorite = (wp: Wallpaper) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const isRemoving = next.has(wp.id);
      if (isRemoving) {
        next.delete(wp.id);
        showToast(`Removed "${wp.title}" from Room DB Favorites`);
      } else {
        next.add(wp.id);
        showToast(`Added "${wp.title}" to Room DB Favorites`, 'success');
      }

      // Notify backend
      fetch(`/api/wallpapers/${wp.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isRemoving ? 'remove' : 'add' }),
      }).catch(() => {});

      return next;
    });
  };

  // Download Wallpaper (Scoped storage simulation)
  const handleDownloadWallpaper = (wp: Wallpaper) => {
    if (downloadedIds.has(wp.id)) {
      showToast(`"${wp.title}" is already stored in Scoped Storage cache.`);
      return;
    }

    showToast(`Downloading "${wp.title}" (${wp.fileSizeMb} MB)...`);
    setTimeout(() => {
      setDownloadedIds((prev) => new Set([...prev, wp.id]));
      setUserSettings((prev) => ({
        ...prev,
        cachedStorageBytes: prev.cachedStorageBytes + wp.fileSizeMb * 1024 * 1024,
      }));
      showToast(`Saved to Android Scoped Storage: Pictures/LiveWallpapers/${wp.id}.mp4`, 'success');

      // Sync backend download counter
      fetch(`/api/wallpapers/${wp.id}/download`, { method: 'POST' }).catch(() => {});
    }, 1200);
  };

  // Confirm Set Live Wallpaper
  const handleConfirmSetLiveWallpaper = (target: SetWallpaperTarget) => {
    if (!selectedWallpaper) return;

    setActiveLiveWallpaper(selectedWallpaper);
    setActiveLiveTarget(target);
    setShowSetDialog(false);
    setSelectedWallpaper(null);

    // Increment backend active set counter
    fetch(`/api/wallpapers/${selectedWallpaper.id}/set-active`, { method: 'POST' }).catch(() => {});

    showToast(
      `LiveWallpaperService activated! Running on ${target === 'both' ? 'Home & Lock Screens' : target}.`,
      'success'
    );

    // Automatically transition to the live phone launcher preview
    setTimeout(() => {
      setIsViewingDeviceLauncher(true);
    }, 400);
  };

  // Admin Actions
  const handleAddWallpaper = async (newWp: Partial<Wallpaper>) => {
    const res = await fetch('/api/wallpapers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWp),
    });
    if (!res.ok) throw new Error('Failed to create wallpaper');
    await fetchBackendData();
    showToast('New live wallpaper published to Android catalog!', 'success');
  };

  const handleUpdateWallpaper = async (id: string, updates: Partial<Wallpaper>) => {
    const res = await fetch(`/api/wallpapers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update wallpaper');
    await fetchBackendData();
    showToast('Wallpaper metadata updated successfully.', 'success');
  };

  const handleDeleteWallpaper = async (id: string) => {
    const res = await fetch(`/api/wallpapers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete wallpaper');
    await fetchBackendData();
    showToast('Wallpaper deleted from database.', 'info');
  };

  const handleClearCache = () => {
    setDownloadedIds(new Set());
    setUserSettings((prev) => ({ ...prev, cachedStorageBytes: 0 }));
    showToast('Cached video files purged from device storage.', 'success');
  };

  // Filtered favorite list for FavoritesScreen
  const favoriteWallpapers = wallpapers.filter((w) => favorites.has(w.id));

  return (
    <div className="w-full h-screen bg-[#07070a] text-neutral-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Sleek Top Navigation Island */}
      <header className="h-14 bg-neutral-900/70 backdrop-blur-2xl border-b border-white/[0.07] px-4 sm:px-6 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-[1px] shadow-lg shadow-emerald-500/25">
              <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center font-black text-white text-xs">
                LW
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                LiveWall
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Play Store Ready • SDK 35
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium hidden sm:block">
              Jetpack Compose • Media3 ExoPlayer Engine • Room DB
            </p>
          </div>
        </div>

        {/* Global View Switcher Tabs with Modern Frosted Glass Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-950/70 backdrop-blur-xl p-1 rounded-2xl border border-white/[0.08] text-xs">
          <button
            onClick={() => {
              setViewMode('app');
              setIsViewingDeviceLauncher(false);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all duration-200 ${
              viewMode === 'app' && !isViewingDeviceLauncher
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">LiveWall App</span>
            <span className="md:hidden">App</span>
          </button>

          {activeLiveWallpaper && (
            <button
              onClick={() => {
                setViewMode('app');
                setIsViewingDeviceLauncher(true);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all duration-200 ${
                isViewingDeviceLauncher
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-extrabold shadow-md shadow-emerald-500/20'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
              title="See your active live wallpaper running on the phone launcher"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Launcher View</span>
              <span className="md:hidden">Launcher</span>
            </button>
          )}

          <button
            onClick={() => {
              setViewMode('admin');
              setIsViewingDeviceLauncher(false);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all duration-200 ${
              viewMode === 'admin'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin & API</span>
            <span className="md:hidden">Admin</span>
          </button>

          <button
            onClick={() => {
              setViewMode('android-project');
              setIsViewingDeviceLauncher(false);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all duration-200 ${
              viewMode === 'android-project'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FolderCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Kotlin Source</span>
            <span className="md:hidden">Source</span>
          </button>

          {/* Toggle Phone Frame Bezel */}
          {viewMode === 'app' && (
            <button
              onClick={() => setIsFramed(!isFramed)}
              className="p-1.5 ml-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title={isFramed ? 'Switch to Full Width Mode' : 'Switch to Phone Chassis Frame'}
            >
              {isFramed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Experience Canvas */}
      <main className="flex-1 flex items-center justify-center overflow-hidden relative bg-[#07070a] p-0 sm:p-3">
        {viewMode === 'admin' ? (
          <AdminPortal
            wallpapers={wallpapers}
            stats={adminStats}
            onAddWallpaper={handleAddWallpaper}
            onUpdateWallpaper={handleUpdateWallpaper}
            onDeleteWallpaper={handleDeleteWallpaper}
            onRefreshData={fetchBackendData}
          />
        ) : viewMode === 'android-project' ? (
          <AndroidProjectExplorer />
        ) : (
          /* Modern Flagship Smartphone Chassis or Edge-to-Edge Frame */
          <div
            className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
              isFramed
                ? 'w-full h-full max-w-[410px] sm:h-[95vh] sm:rounded-[48px] sm:border-[10px] sm:border-neutral-800/90 bg-neutral-950 titanium-frame ring-1 ring-white/10'
                : 'w-full h-full max-w-xl sm:h-[96vh] sm:rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl'
            }`}
          >
            {/* Flagship Hardware Accents: Camera Punch Hole & Earpiece */}
            {isFramed && (
              <div className="hidden sm:flex absolute top-2.5 inset-x-0 z-50 justify-center pointer-events-none">
                <div className="h-5 px-3 bg-neutral-900/95 backdrop-blur-md rounded-full flex items-center justify-center gap-2 border border-white/[0.08] shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full" />
                  </div>
                  <div className="w-8 h-1 bg-neutral-800 rounded-full" />
                </div>
              </div>
            )}

            {/* Splash Screen */}
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

            {/* Simulated Device Launcher View with Active Live Wallpaper */}
            {isViewingDeviceLauncher && activeLiveWallpaper ? (
              <ActiveWallpaperDeviceView
                activeWallpaper={activeLiveWallpaper}
                target={activeLiveTarget}
                onBackToApp={() => setIsViewingDeviceLauncher(false)}
                onChangeWallpaper={() => {
                  setIsViewingDeviceLauncher(false);
                  setCurrentTab('gallery');
                }}
              />
            ) : (
              /* LiveWall Android Application Screens */
              <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {currentTab === 'home' && (
                  <HomeScreen
                    wallpapers={wallpapers}
                    categories={CATEGORIES_LIST}
                    activeCategory={activeCategory}
                    onSelectCategory={(cat) => {
                      setActiveCategory(cat);
                      if (cat !== 'All') {
                        setCurrentTab('gallery');
                      }
                    }}
                    onOpenSearch={() => setCurrentTab('gallery')}
                    onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
                    onToggleFavorite={handleToggleFavorite}
                    favorites={favorites}
                    isPremium={userSettings.isPremiumAdFree}
                    onUpgradeToPremium={() =>
                      setUserSettings((prev) => ({ ...prev, isPremiumAdFree: true }))
                    }
                  />
                )}

                {currentTab === 'gallery' && (
                  <GalleryScreen
                    wallpapers={wallpapers}
                    categories={CATEGORIES_LIST}
                    initialCategory={activeCategory}
                    initialSearchQuery={searchQuery}
                    onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
                    onToggleFavorite={handleToggleFavorite}
                    onDownloadWallpaper={handleDownloadWallpaper}
                    favorites={favorites}
                  />
                )}

                {currentTab === 'favorites' && (
                  <FavoritesScreen
                    favoriteWallpapers={favoriteWallpapers}
                    onSelectWallpaper={(wp) => setSelectedWallpaper(wp)}
                    onRemoveFavorite={handleToggleFavorite}
                    onDownloadWallpaper={handleDownloadWallpaper}
                    onExploreClick={() => setCurrentTab('gallery')}
                  />
                )}

                {currentTab === 'settings' && (
                  <SettingsScreen
                    settings={userSettings}
                    onUpdateSettings={(newSettings) =>
                      setUserSettings((prev) => ({ ...prev, ...newSettings }))
                    }
                    onClearCache={handleClearCache}
                    cachedMb={Math.round(userSettings.cachedStorageBytes / (1024 * 1024))}
                  />
                )}

                {/* Persistent AdMob Banner at bottom of app */}
                <AdBanner
                  isPremium={userSettings.isPremiumAdFree}
                  onUpgradeToPremium={() =>
                    setUserSettings((prev) => ({ ...prev, isPremiumAdFree: true }))
                  }
                  type="banner"
                />

                {/* Material 3 Floating Bottom Navigation Bar */}
                <NavigationBottomBar
                  currentTab={currentTab}
                  onTabChange={(tab) => {
                    setCurrentTab(tab);
                    if (tab === 'home') setActiveCategory('All');
                  }}
                  favoritesCount={favorites.size}
                  hasActiveWallpaper={Boolean(activeLiveWallpaper)}
                  onOpenActiveWallpaper={() => setIsViewingDeviceLauncher(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Wallpaper Full-Screen Live Video Preview Modal */}
        {selectedWallpaper && (
          <WallpaperPreviewModal
            wallpaper={selectedWallpaper}
            isFavorite={favorites.has(selectedWallpaper.id)}
            isDownloaded={downloadedIds.has(selectedWallpaper.id)}
            onClose={() => setSelectedWallpaper(null)}
            onToggleFavorite={() => handleToggleFavorite(selectedWallpaper)}
            onDownload={() => handleDownloadWallpaper(selectedWallpaper)}
            onOpenSetWallpaperDialog={() => setShowSetDialog(true)}
          />
        )}

        {/* Android System ACTION_CHANGE_LIVE_WALLPAPER Dialog */}
        {selectedWallpaper && showSetDialog && (
          <AndroidSystemDialog
            wallpaper={selectedWallpaper}
            isOpen={showSetDialog}
            onClose={() => setShowSetDialog(false)}
            onConfirmSet={handleConfirmSetLiveWallpaper}
          />
        )}

        {/* Modern Toast Feedback Pill */}
        {toastMessage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-neutral-900/90 backdrop-blur-2xl border border-white/10 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            )}
            <span className="leading-tight">{toastMessage.text}</span>
          </div>
        )}
      </main>
    </div>
  );
}
