import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Phone,
  MessageCircle,
  Camera,
  Settings,
  Chrome,
  Mic,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Wallpaper, SetWallpaperTarget } from '../types';

interface ActiveWallpaperDeviceViewProps {
  activeWallpaper: Wallpaper;
  target: SetWallpaperTarget;
  onBackToApp: () => void;
  onChangeWallpaper: () => void;
}

export const ActiveWallpaperDeviceView: React.FC<ActiveWallpaperDeviceViewProps> = ({
  activeWallpaper,
  target,
  onBackToApp,
  onChangeWallpaper,
}) => {
  const [showStatus, setShowStatus] = useState(true);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* Background Live Wallpaper Video Engine running 60 FPS */}
      <video
        src={activeWallpaper.videoUrl}
        poster={activeWallpaper.thumbnailUrl}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Optical Android Gradient Tint for Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-10 pointer-events-none" />

      {/* Android 15 Status Bar */}
      <div className="relative z-20 pt-3 px-6 flex items-center justify-between text-[11px] font-semibold text-white/90">
        <span className="font-mono tracking-tight">{currentTime}</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
            5G
          </span>
          <div className="w-4 h-2 rounded-xs border border-white/80 p-[1px] flex items-center">
            <div className="w-full h-full bg-emerald-400 rounded-2xs" />
          </div>
          <span className="text-[10px] font-mono">100%</span>
        </div>
      </div>

      {/* Top Floating Pill: Live Wallpaper Engine Status */}
      {showStatus && (
        <div className="relative z-20 mx-4 mt-2 p-2 px-3 rounded-2xl bg-neutral-950/80 backdrop-blur-2xl border border-emerald-500/30 flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute inset-0 opacity-75" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span>Media3 Live Engine Active</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                  60 FPS
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 truncate max-w-[180px]">
                {activeWallpaper.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onBackToApp}
              className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] transition-colors shadow-sm"
            >
              Open App
            </button>
            <button
              onClick={() => setShowStatus(false)}
              className="p-1 text-neutral-500 hover:text-white"
              title="Hide banner"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Android 15 Material You Lock / Home Screen Clock Widget */}
      <div className="relative z-20 px-6 pt-8 text-center text-white select-none">
        <h1 className="text-7xl font-light tracking-tighter text-white/95 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] font-sans">
          {currentTime}
        </h1>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90 drop-shadow">
          <span>{currentDate}</span>
          <span className="text-white/40">•</span>
          <span className="text-emerald-300 font-semibold">74°F Mostly Clear</span>
        </div>
      </div>

      {/* Android Launcher Dock & App Grid */}
      <div className="relative z-20 pb-7 px-5 space-y-4">
        {/* App Icons Row */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <button
            onClick={onBackToApp}
            className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 p-2.5 border border-white/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] text-white/90 font-medium drop-shadow">LiveWall</span>
          </button>

          <button
            onClick={onChangeWallpaper}
            className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
          >
            <div className="w-13 h-13 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl p-2.5 text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-white/90 font-medium drop-shadow">Catalog</span>
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-13 h-13 rounded-2xl bg-blue-600/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl p-2.5 text-white">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-white/90 font-medium drop-shadow">Chrome</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-13 h-13 rounded-2xl bg-neutral-800/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl p-2.5 text-white">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-white/90 font-medium drop-shadow">Settings</span>
          </div>
        </div>

        {/* Android Material You Google Search Capsule */}
        <div className="p-2.5 px-4 rounded-full bg-neutral-900/70 backdrop-blur-2xl border border-white/10 flex items-center justify-between text-neutral-300 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-blue-500">
              G
            </span>
            <span className="text-xs text-neutral-400">Search phone & web...</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <Mic className="w-4 h-4 hover:text-white cursor-pointer" />
            <Camera className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Bottom Phone Dock */}
        <div className="p-2.5 px-5 rounded-3xl bg-neutral-950/60 backdrop-blur-2xl border border-white/10 flex items-center justify-around shadow-2xl">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600/90 flex items-center justify-center text-white shadow-md">
            <Phone className="w-5 h-5" />
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/90 flex items-center justify-center text-white shadow-md">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="w-11 h-11 rounded-2xl bg-neutral-800/90 flex items-center justify-center text-white shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <button
            onClick={onBackToApp}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black shadow-md hover:scale-105 active:scale-95 transition-transform"
            title="Open LiveWall app"
          >
            LW
          </button>
        </div>

        {/* Android Gesture Navigation Bar */}
        <div className="w-28 h-1 bg-white/70 rounded-full mx-auto" />
      </div>
    </div>
  );
};
