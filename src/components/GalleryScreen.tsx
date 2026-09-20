import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Download,
  Play,
  X,
  Sparkles,
} from 'lucide-react';
import { Wallpaper, WallpaperCategory } from '../types';

interface GalleryScreenProps {
  wallpapers: Wallpaper[];
  categories: readonly WallpaperCategory[];
  initialCategory?: WallpaperCategory | 'All';
  initialSearchQuery?: string;
  onSelectWallpaper: (wp: Wallpaper) => void;
  onToggleFavorite: (wp: Wallpaper) => void;
  onDownloadWallpaper: (wp: Wallpaper) => void;
  favorites: Set<string>;
}

type SortOption = 'trending' | 'popular' | 'newest' | 'downloads';

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  wallpapers,
  categories,
  initialCategory = 'All',
  initialSearchQuery = '',
  onSelectWallpaper,
  onToggleFavorite,
  onDownloadWallpaper,
  favorites,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WallpaperCategory | 'All'>(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Filter and sort computation
  const filteredWallpapers = useMemo(() => {
    let result = [...wallpapers];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (w) => w.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'trending') {
      result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.downloadCount - a.downloadCount);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.favoriteCount - a.favoriteCount);
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [wallpapers, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-neutral-100 select-none">
      {/* Search Header */}
      <div className="p-4 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live wallpapers, tags..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector Button */}
          <button
            onClick={() => setShowFiltersModal(true)}
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-colors ${
              sortBy !== 'trending'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
            title="Sort and Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Category Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-3 pb-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-emerald-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80'
            }`}
          >
            All Wallpapers
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub-bar showing result count & active sort */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-neutral-400">
          <span>
            Showing <strong className="text-white">{filteredWallpapers.length}</strong> live wallpapers
          </span>
          <span className="capitalize text-emerald-400">
            Sorted by: {sortBy}
          </span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {filteredWallpapers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No wallpapers found</h3>
            <p className="text-xs text-neutral-400 max-w-xs mb-4">
              We couldn't find any live wallpapers matching "{searchQuery || selectedCategory}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredWallpapers.map((wp) => {
              const isFav = favorites.has(wp.id);
              return (
                <div
                  key={wp.id}
                  onClick={() => onSelectWallpaper(wp)}
                  className="group relative rounded-2xl overflow-hidden aspect-[9/15] bg-neutral-900 border border-neutral-800/80 shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  <img
                    src={wp.thumbnailUrl}
                    alt={wp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Top badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/90 text-neutral-950 text-[9px] font-bold uppercase tracking-wider">
                      Live
                    </span>
                    {wp.fps && (
                      <span className="px-1 py-0.5 rounded bg-black/60 text-white text-[8px] font-medium">
                        {wp.fps}fps
                      </span>
                    )}
                  </div>

                  {/* Top Right Action: Favorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(wp);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>

                  {/* Bottom details & Download/Use button */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent p-2.5 pt-8">
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {wp.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                      <span className="text-emerald-400 font-medium">{wp.category}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadWallpaper(wp);
                          }}
                          className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-200"
                          title="Download for offline"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Play className="w-3 h-3 fill-emerald-400" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sort Filter Dialog Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                Sort Wallpapers By
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { id: 'trending', label: 'Trending & Featured', desc: 'Hottest community picks' },
                { id: 'popular', label: 'Most Favorited', desc: 'Highest liked by users' },
                { id: 'downloads', label: 'Most Downloaded', desc: 'Highest offline downloads' },
                { id: 'newest', label: 'Fresh New Releases', desc: 'Recently added live wallpapers' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSortBy(opt.id as SortOption);
                    setShowFiltersModal(false);
                  }}
                  className={`w-full p-3 rounded-2xl text-left border transition-colors flex items-center justify-between ${
                    sortBy === opt.id
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-neutral-800/60 border-neutral-750 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{opt.label}</div>
                    <div className="text-[11px] text-neutral-400">{opt.desc}</div>
                  </div>
                  {sortBy === opt.id && (
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
