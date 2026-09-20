import React from 'react';
import {
  Heart,
  Download,
  Trash2,
  Play,
  Sparkles,
  Layers,
  HardDrive,
} from 'lucide-react';
import { Wallpaper } from '../types';

interface FavoritesScreenProps {
  favoriteWallpapers: Wallpaper[];
  onSelectWallpaper: (wp: Wallpaper) => void;
  onRemoveFavorite: (wp: Wallpaper) => void;
  onDownloadWallpaper: (wp: Wallpaper) => void;
  onExploreClick: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  favoriteWallpapers,
  onSelectWallpaper,
  onRemoveFavorite,
  onDownloadWallpaper,
  onExploreClick,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-neutral-100 select-none">
      {/* Header */}
      <div className="p-4 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">My Favorites</h1>
              <p className="text-[10px] text-neutral-400">Stored locally in Room Database</p>
            </div>
          </div>
          <span className="text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full text-neutral-300 font-semibold">
            {favoriteWallpapers.length} saved
          </span>
        </div>
      </div>

      {/* List / Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {favoriteWallpapers.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No favorites saved yet</h3>
            <p className="text-xs text-neutral-400 max-w-xs mb-5 leading-relaxed">
              Tap the heart icon on any live wallpaper to bookmark it for quick access and offline caching.
            </p>
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-neutral-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Live Wallpapers</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favoriteWallpapers.map((wp) => (
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

                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider">
                    FAV
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(wp);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-black/80 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent p-2.5 pt-8">
                  <h3 className="text-xs font-bold text-white truncate">{wp.title}</h3>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span className="text-emerald-400 font-medium">{wp.category}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadWallpaper(wp);
                        }}
                        className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300"
                        title="Download for offline playback"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
