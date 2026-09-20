import React from 'react';
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  Heart,
  Download,
  Play,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { Wallpaper, WallpaperCategory } from '../types';
import { AdBanner } from './AdBanner';

interface HomeScreenProps {
  wallpapers: Wallpaper[];
  categories: readonly WallpaperCategory[];
  activeCategory: WallpaperCategory | 'All';
  onSelectCategory: (cat: WallpaperCategory | 'All') => void;
  onOpenSearch: () => void;
  onSelectWallpaper: (wp: Wallpaper) => void;
  onToggleFavorite: (wp: Wallpaper) => void;
  favorites: Set<string>;
  isPremium: boolean;
  onUpgradeToPremium: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  wallpapers,
  categories,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onSelectWallpaper,
  onToggleFavorite,
  favorites,
  isPremium,
  onUpgradeToPremium,
}) => {
  const featured = wallpapers.filter((w) => w.isFeatured);
  const trending = wallpapers.filter((w) => w.isTrending);
  const newReleases = wallpapers.filter((w) => w.isNew);
  const popular = [...wallpapers].sort((a, b) => b.favoriteCount - a.favoriteCount).slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto pb-28 text-neutral-100 select-none scroll-smooth">
      {/* Sleek Floating Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[15px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-neutral-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white font-sans">LiveWall</h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 uppercase tracking-wider">
                Ultra 4K
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium tracking-wide">
              Battery-Optimized Live Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/[0.08] transition-all text-xs"
            title="Search Wallpapers"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] text-neutral-400 hidden sm:inline">Search...</span>
          </button>
        </div>
      </div>

      {/* Category Pills with Frosted Glass Finish */}
      <div className="px-5 pt-3.5 pb-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => onSelectCategory('All')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeCategory === 'All'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 shadow-md shadow-emerald-500/25 scale-[1.02]'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-neutral-200 border border-white/[0.06]'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-bold shadow-md shadow-emerald-500/25 scale-[1.02]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-neutral-200 border border-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Wallpapers Hero Carousel */}
      {featured.length > 0 && (
        <section className="mt-4">
          <div className="px-5 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">Curated Masterpieces</h2>
            </div>
            <span className="text-[11px] text-neutral-500 font-semibold tracking-wider uppercase">
              60 FPS HDR
            </span>
          </div>

          <div className="px-5 flex gap-3.5 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory">
            {featured.map((wp) => {
              const isFav = favorites.has(wp.id);
              return (
                <div
                  key={wp.id}
                  onClick={() => onSelectWallpaper(wp)}
                  className="relative shrink-0 w-64 h-84 rounded-[26px] overflow-hidden cursor-pointer group shadow-2xl border border-white/[0.1] bg-neutral-900 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10 active:scale-[0.98] snap-start"
                >
                  <img
                    src={wp.thumbnailUrl}
                    alt={wp.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Top Glass Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-[10px] font-black text-neutral-950 uppercase tracking-widest shadow-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 animate-ping" />
                      Live
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-white font-medium border border-white/10">
                      {wp.fps} FPS
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(wp);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-md"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>

                  {/* Bottom Vignette & Title */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent p-4 pt-12">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold tracking-wider uppercase mb-1">
                      <span>{wp.category}</span>
                      <span>•</span>
                      <span className="text-neutral-400 font-medium">{wp.resolution.split(' ')[0]}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                      {wp.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.08] text-[11px] text-neutral-400">
                      <span className="text-neutral-400 truncate max-w-[140px]">By {wp.author}</span>
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        <Play className="w-3 h-3 fill-emerald-400" />
                        Preview
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Native Ad Placement with Ultra-Modern Styling */}
      <div className="px-5">
        <AdBanner isPremium={isPremium} onUpgradeToPremium={onUpgradeToPremium} type="native" />
      </div>

      {/* Trending Section */}
      <section className="mt-4 px-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">Trending Animations</h2>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold cursor-pointer flex items-center hover:underline">
            {trending.length} videos <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {trending.map((wp) => {
            const isFav = favorites.has(wp.id);
            return (
              <div
                key={wp.id}
                onClick={() => onSelectWallpaper(wp)}
                className="relative rounded-2xl overflow-hidden aspect-[9/14] cursor-pointer group bg-neutral-900 border border-white/[0.08] shadow-lg transition-all duration-300 hover:border-emerald-500/40 active:scale-[0.98]"
              >
                <img
                  src={wp.thumbnailUrl}
                  alt={wp.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[9px] font-black uppercase tracking-wider shadow">
                    HOT
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(wp);
                  }}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent p-3 pt-8">
                  <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {wp.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span className="text-emerald-400 font-medium">{wp.category}</span>
                    <span className="flex items-center gap-1 text-neutral-300 font-medium">
                      <Download className="w-2.5 h-2.5 text-teal-400" />
                      {(wp.downloadCount / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fresh New Releases */}
      {newReleases.length > 0 && (
        <section className="mt-6 px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">Fresh New Drops</h2>
            </div>
            <span className="text-[11px] text-neutral-500 font-semibold">Updated Today</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {newReleases.map((wp) => {
              const isFav = favorites.has(wp.id);
              return (
                <div
                  key={wp.id}
                  onClick={() => onSelectWallpaper(wp)}
                  className="relative rounded-2xl overflow-hidden aspect-[9/14] cursor-pointer group bg-neutral-900 border border-white/[0.08] shadow-lg transition-all duration-300 hover:border-emerald-500/40 active:scale-[0.98]"
                >
                  <img
                    src={wp.thumbnailUrl}
                    alt={wp.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-teal-400 text-neutral-950 text-[9px] font-black uppercase tracking-wider shadow">
                      NEW
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(wp);
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent p-3 pt-8">
                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {wp.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                      <span className="text-emerald-400 font-medium">{wp.category}</span>
                      <span className="text-neutral-400">{wp.fileSizeMb} MB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Community Most Loved Leaderboard */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">Community Most Loved</h2>
          </div>
          <span className="text-[11px] text-neutral-500 font-semibold">Global Ranks</span>
        </div>

        <div className="space-y-2.5">
          {popular.map((wp, idx) => (
            <div
              key={wp.id}
              onClick={() => onSelectWallpaper(wp)}
              className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-neutral-900/60 border border-white/[0.06] hover:bg-neutral-850 hover:border-white/[0.12] cursor-pointer transition-all duration-200"
            >
              <div
                className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                  idx === 0
                    ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                    : idx === 1
                    ? 'bg-neutral-300 text-neutral-950'
                    : idx === 2
                    ? 'bg-amber-700/80 text-white'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {idx + 1}
              </div>
              <img
                src={wp.thumbnailUrl}
                alt={wp.title}
                className="w-12 h-14 rounded-xl object-cover shrink-0 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{wp.title}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {wp.category} • <span className="text-emerald-400 font-semibold">{wp.fps} FPS</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-rose-400 font-bold">
                  <Heart className="w-3 h-3 fill-rose-400" />
                  {wp.favoriteCount.toLocaleString()}
                </div>
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                  {wp.resolution.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
