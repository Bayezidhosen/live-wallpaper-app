import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Monitor,
  PlaySquare,
  Wifi,
  Bell,
  Trash2,
  FileText,
  ShieldCheck,
  Info,
  Star,
  Share2,
  Mail,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearCache: () => void;
  cachedMb: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearCache,
  cachedMb,
}) => {
  const [modalContent, setModalContent] = useState<
    'privacy' | 'terms' | 'about' | 'rate' | 'share' | 'feedback' | null
  >(null);
  const [rateStars, setRateStars] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  const handleClearCacheClick = () => {
    onClearCache();
    setCacheClearedSuccess(true);
    setTimeout(() => setCacheClearedSuccess(false), 2000);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setModalContent(null);
      setFeedbackText('');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-neutral-100 select-none">
      {/* Header */}
      <div className="p-4 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 shrink-0">
        <h1 className="text-base font-bold text-white">App Settings</h1>
        <p className="text-[10px] text-neutral-400">LiveWall preferences & device configurations</p>
      </div>

      {/* Settings Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24 text-xs">
        {/* Premium Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-neutral-900 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{settings.isPremiumAdFree ? 'Premium Lifetime Active' : 'Go Ad-Free Premium'}</span>
              </div>
              <p className="text-[11px] text-neutral-300 max-w-[240px] leading-relaxed">
                {settings.isPremiumAdFree
                  ? 'All Google AdMob ads are permanently disabled. Unlimited 4K 60FPS video downloads.'
                  : 'Remove all banners, interstitial and native ads. Unlock ultra-high bitrate 4K video downloads.'}
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ isPremiumAdFree: !settings.isPremiumAdFree })}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
                settings.isPremiumAdFree
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20'
              }`}
            >
              {settings.isPremiumAdFree ? 'Deactivate' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Section: Appearance & Playback */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
            Display & Playback
          </h3>

          {/* Theme Selector */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">App Theme</div>
                <div className="text-[11px] text-neutral-400 capitalize">
                  Current: {settings.theme} Mode
                </div>
              </div>
            </div>

            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px]">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdateSettings({ theme: t })}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    settings.theme === t
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {t === 'dark' ? 'Dark' : t === 'light' ? 'Light' : 'Auto'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Play Preview Toggle */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                <PlaySquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Auto-Play Video Previews</div>
                <div className="text-[11px] text-neutral-400">Play animated loop on full preview</div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ autoPlayPreview: !settings.autoPlayPreview })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.autoPlayPreview ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoPlayPreview ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section: Data & Storage */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
            Data & Storage
          </h3>

          {/* Wi-Fi Only Downloads */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Wi-Fi Only Downloads</div>
                <div className="text-[11px] text-neutral-400">Conserve cellular mobile data</div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ wifiOnlyDownloads: !settings.wifiOnlyDownloads })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.wifiOnlyDownloads ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.wifiOnlyDownloads ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Push Notifications Toggle */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Push Notifications</div>
                <div className="text-[11px] text-neutral-400">Weekly featured wallpaper drops</div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Clear Cache */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Clear Cached Wallpapers</div>
                <div className="text-[11px] text-neutral-400">
                  Current Cache: <span className="text-emerald-400 font-semibold">{cachedMb} MB</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearCacheClick}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              {cacheClearedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Cleared!</span>
                </>
              ) : (
                <span>Clean</span>
              )}
            </button>
          </div>
        </div>

        {/* Section: Legal & Support */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
            Information & Support
          </h3>

          <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 divide-y divide-neutral-800 overflow-hidden">
            {/* Privacy Policy */}
            <button
              onClick={() => setModalContent('privacy')}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-neutral-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-white">Privacy Policy</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {/* Terms of Service */}
            <button
              onClick={() => setModalContent('terms')}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-neutral-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-white">Terms of Service</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {/* Rate Us on Google Play */}
            <button
              onClick={() => setModalContent('rate')}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-neutral-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-white">Rate Us on Google Play</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {/* Share App */}
            <button
              onClick={() => setModalContent('share')}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-neutral-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-teal-400" />
                <span className="font-medium text-white">Share LiveWall App</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {/* Contact & Feedback */}
            <button
              onClick={() => setModalContent('feedback')}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-neutral-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="font-medium text-white">Contact & Feedback</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {/* About App */}
            <button
              onClick={() => setModalContent('about')}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-neutral-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-neutral-400" />
                <span className="font-medium text-white">About LiveWall</span>
              </div>
              <span className="text-[11px] text-neutral-500">v1.0.0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Popups for Privacy, Terms, Rate, Share, Feedback, About */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white capitalize">
                {modalContent === 'privacy' && 'Privacy Policy'}
                {modalContent === 'terms' && 'Terms of Service'}
                {modalContent === 'rate' && 'Rate LiveWall on Google Play'}
                {modalContent === 'share' && 'Share with Friends'}
                {modalContent === 'feedback' && 'Contact & Bug Report'}
                {modalContent === 'about' && 'About LiveWall'}
              </h3>
              <button
                onClick={() => setModalContent(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-xs text-neutral-300 max-h-80 overflow-y-auto space-y-3 leading-relaxed">
              {modalContent === 'privacy' && (
                <>
                  <p><strong>LiveWall</strong> takes user privacy with utmost seriousness. In accordance with Google Play Developer Policies and GDPR:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                    <li>We do NOT collect, sell, or track personal identification details, contacts, or geolocation.</li>
                    <li>The LiveWallpaperService only requires standard <code className="text-emerald-400">SET_WALLPAPER</code> and network permissions to stream animated MP4 loops.</li>
                    <li>Downloads utilize modern Android Scoped Storage into app-specific media directories without broad storage access.</li>
                    <li>Analytics and AdMob identifiers are handled securely in compliance with the Google Families and Data Safety policy.</li>
                  </ul>
                </>
              )}

              {modalContent === 'terms' && (
                <>
                  <p>Welcome to <strong>LiveWall</strong>. By installing and using this application:</p>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                    <li>All live wallpaper animated loops provided are either public domain (CC0), creative commons licensed, or royalty-free community contributions.</li>
                    <li>LiveWall reserves the right to remove wallpapers infringing copyright upon valid DMCA notice.</li>
                    <li>Users are licensed to set these live wallpapers on their personal Android devices.</li>
                  </ul>
                </>
              )}

              {modalContent === 'rate' && (
                <div className="text-center py-2">
                  <p className="text-neutral-300 mb-3">
                    Enjoying LiveWall? Your rating helps us bring more free 4K 60FPS live wallpapers to the community!
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRateStars(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rateStars ? 'fill-amber-400' : 'text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      alert('Thank you for your ' + rateStars + '-star rating!');
                      setModalContent(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs"
                  >
                    Submit Review to Play Store
                  </button>
                </div>
              )}

              {modalContent === 'share' && (
                <div className="text-center py-2">
                  <p className="text-neutral-300 mb-3">
                    Share LiveWall with your friends and family so they can transform their phone home screens:
                  </p>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-emerald-400 select-all mb-4">
                    https://play.google.com/store/apps/details?id=com.livewall.app
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        'Check out LiveWall for incredible 4K live wallpapers: https://play.google.com/store/apps/details?id=com.livewall.app'
                      );
                      alert('Share link copied to clipboard!');
                      setModalContent(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs"
                  >
                    Copy Share Link
                  </button>
                </div>
              )}

              {modalContent === 'feedback' && (
                <form onSubmit={handleSendFeedback} className="space-y-3">
                  <p className="text-neutral-300">
                    Have a wallpaper request, battery feedback, or question for our Android engineers?
                  </p>
                  <textarea
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe your issue or suggestion..."
                    rows={4}
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    {feedbackSent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Message Sent!</span>
                      </>
                    ) : (
                      <span>Send Feedback</span>
                    )}
                  </button>
                </form>
              )}

              {modalContent === 'about' && (
                <div className="space-y-3 text-neutral-300">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                      LW
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">LiveWall – Live Wallpapers</h4>
                      <p className="text-neutral-400 text-[11px]">Version 1.0.0 (Release Build 100)</p>
                      <p className="text-emerald-400 text-[10px] font-semibold">Package: com.livewall.app</p>
                    </div>
                  </div>

                  <p>
                    Engineered with modern <strong>Android Jetpack Compose</strong>, <strong>Material 3</strong>, and the <strong>Media3 ExoPlayer</strong> architecture.
                  </p>

                  <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                    <div>• Media Engine: AndroidX Media3 ExoPlayer 1.5.1</div>
                    <div>• Local Cache: Room Database 2.6.1</div>
                    <div>• UI Framework: Jetpack Compose BOM 2025.02.00</div>
                    <div>• Target SDK: Android 15 (API 35)</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
