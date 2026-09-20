import React, { useEffect, useState } from 'react';
import { Sparkles, Layers } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeState, setFadeState] = useState<'entering' | 'pulsing' | 'exiting'>('entering');

  useEffect(() => {
    const pulseTimer = setTimeout(() => {
      setFadeState('pulsing');
    }, 400);

    const exitTimer = setTimeout(() => {
      setFadeState('exiting');
    }, 1600);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white transition-opacity duration-500 select-none ${
        fadeState === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glow effects */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -top-10 -left-10" />
      <div className="absolute w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none -bottom-10 -right-10" />

      {/* Main Logo Icon Container */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 p-0.5 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <div className="w-full h-full bg-neutral-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent animate-pulse" />
            <Layers className="w-12 h-12 text-emerald-400 drop-shadow-md" />
            <Sparkles className="w-5 h-5 text-teal-300 absolute top-2 right-2 animate-bounce" />
          </div>
        </div>
      </div>

      {/* App Branding */}
      <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-150 to-neutral-300 bg-clip-text text-transparent">
        LiveWall
      </h1>
      <p className="text-xs tracking-widest text-emerald-400/90 uppercase font-semibold mt-1">
        Live Wallpapers • 4K 60FPS
      </p>

      {/* Modern Loader Pill */}
      <div className="mt-12 flex flex-col items-center gap-2">
        <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-indigo-500 origin-left animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
        <span className="text-[11px] text-neutral-500 font-medium">Starting Media3 Wallpaper Service...</span>
      </div>

      {/* Version badge */}
      <div className="absolute bottom-6 text-[11px] text-neutral-600">
        v1.0.0 (Build 100) • Google Play Release
      </div>
    </div>
  );
};
