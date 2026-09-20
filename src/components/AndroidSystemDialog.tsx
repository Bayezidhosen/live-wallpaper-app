import React, { useState } from 'react';
import {
  Smartphone,
  Lock,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { Wallpaper, SetWallpaperTarget } from '../types';

interface AndroidSystemDialogProps {
  wallpaper: Wallpaper;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSet: (target: SetWallpaperTarget) => void;
}

export const AndroidSystemDialog: React.FC<AndroidSystemDialogProps> = ({
  wallpaper,
  isOpen,
  onClose,
  onConfirmSet,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<SetWallpaperTarget>('both');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        onConfirmSet(selectedTarget);
      }, 1000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-250">
        {/* System Header Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">Android WallpaperManager</div>
              <div className="text-[10px] text-neutral-400">ACTION_CHANGE_LIVE_WALLPAPER</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallpaper Preview Slice */}
        <div className="relative h-36 bg-black overflow-hidden flex items-center justify-center">
          <img
            src={wallpaper.thumbnailUrl}
            alt={wallpaper.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/30" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Live Service Engine</span>
              <h4 className="text-sm font-bold truncate drop-shadow">{wallpaper.title}</h4>
            </div>
            <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
              60 FPS Media3
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <p className="text-xs text-neutral-300 font-medium mb-3">
            Where would you like to set this animated live wallpaper?
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'home',
                title: 'Home Screen',
                desc: 'Animate continuously while browsing your home screen apps',
                icon: Smartphone,
              },
              {
                id: 'lock',
                title: 'Lock Screen',
                desc: 'Play smoothly whenever you wake your phone display',
                icon: Lock,
              },
              {
                id: 'both',
                title: 'Home & Lock Screens',
                desc: 'Recommended • Seamless synchronized animation everywhere',
                icon: Sparkles,
                badge: 'Popular',
              },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = selectedTarget === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedTarget(option.id as SetWallpaperTarget)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                      : 'bg-neutral-850/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{option.title}</span>
                      {option.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{option.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Low Battery Note */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>ExoPlayer hardware decoding pauses automatically when screen is off to conserve battery.</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              disabled={isApplying || appliedSuccess}
              className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-75"
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                  <span>Wallpaper Applied!</span>
                </>
              ) : isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Configuring Service...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm & Apply Live</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
