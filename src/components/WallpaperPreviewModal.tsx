import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  CheckCircle2,
  Eye,
  EyeOff,
  BatteryCharging,
  Maximize2,
  Layers,
  ChevronUp,
} from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperPreviewModalProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  isDownloaded: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onOpenSetWallpaperDialog: () => void;
}

export const WallpaperPreviewModal: React.FC<WallpaperPreviewModalProps> = ({
  wallpaper,
  isFavorite,
  isDownloaded,
  onClose,
  onToggleFavorite,
  onDownload,
  onOpenSetWallpaperDialog,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [hideUi, setHideUi] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
        setIsPlaying(false);
      });
    }
  }, [wallpaper]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-in fade-in duration-300">
      {/* Immersive Video Layer */}
      <div
        onClick={() => setHideUi((prev) => !prev)}
        className="relative w-full h-full max-w-md sm:h-[94vh] sm:rounded-[38px] overflow-hidden flex flex-col justify-between cursor-pointer"
      >
        <video
          ref={videoRef}
          src={wallpaper.videoUrl}
          poster={wallpaper.thumbnailUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Ambient Top & Bottom Gradients for Text Contrast */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            hideUi
              ? 'opacity-0'
              : 'bg-gradient-to-b from-black/70 via-transparent to-black/90 opacity-100'
          }`}
        />

        {/* Floating Top Header Bar */}
        <div
          className={`relative z-20 p-4 transition-all duration-300 flex items-center justify-between ${
            hideUi ? '-translate-y-16 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-900/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="px-3.5 py-1.5 rounded-full bg-neutral-900/70 backdrop-blur-xl border border-white/10 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white max-w-[150px] truncate">
              {wallpaper.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-neutral-900/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onToggleFavorite}
              className="w-10 h-10 rounded-full bg-neutral-900/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Center Screen Hint on First Tap */}
        {hideUi && (
          <div className="relative z-20 m-auto px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 text-xs font-medium animate-pulse pointer-events-none">
            Tap anywhere to restore controls
          </div>
        )}

        {/* Bottom Floating Glass Action Deck */}
        <div
          className={`relative z-20 p-5 space-y-3 transition-all duration-300 ${
            hideUi ? 'translate-y-32 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Specs Pill Row */}
          <div className="flex items-center justify-between bg-neutral-950/70 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 px-4 text-[11px] shadow-xl">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{wallpaper.resolution.split(' ')[0]}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="text-emerald-400 font-bold">{wallpaper.fps} FPS Looping</div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1 text-teal-300">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>A+ Battery</span>
            </div>
            <span className="text-white/20">•</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-neutral-400 hover:text-white flex items-center gap-0.5 text-[11px] font-medium"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Info</span>
            </button>
          </div>

          {/* Expanded Specs Details Sheet */}
          {showDetails && (
            <div className="p-4 rounded-3xl bg-neutral-950/90 backdrop-blur-2xl border border-white/10 text-xs text-neutral-300 space-y-2 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="font-bold text-white">Live Wallpaper Engine Specs</span>
                <span className="text-[10px] text-emerald-400 font-mono">Media3 ExoPlayer</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Category: <strong className="text-white">{wallpaper.category}</strong></div>
                <div>File Size: <strong className="text-white">{wallpaper.fileSizeMb} MB</strong></div>
                <div>Duration: <strong className="text-white">{wallpaper.durationSeconds}s loop</strong></div>
                <div>Author: <strong className="text-white">{wallpaper.author}</strong></div>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
                {wallpaper.description}
              </p>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Download Button */}
            <button
              onClick={onDownload}
              className="w-13 h-13 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 hover:border-white/20 text-neutral-200 flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
              title="Save to Scoped Storage"
            >
              {isDownloaded ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>

            {/* Set Live Wallpaper Button */}
            <button
              onClick={onOpenSetWallpaperDialog}
              className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-transform active:scale-98 group"
            >
              <Layers className="w-4 h-4 text-neutral-950 transition-transform group-hover:rotate-12" />
              <span>Set Live Wallpaper</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
