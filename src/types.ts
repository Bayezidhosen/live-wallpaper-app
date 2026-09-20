export type WallpaperCategory =
  | 'Nature'
  | 'Anime'
  | 'Space'
  | 'Cars'
  | 'Gaming'
  | 'Abstract'
  | 'Neon'
  | 'Minimal'
  | 'Animals'
  | 'Technology';

export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  category: WallpaperCategory;
  thumbnailUrl: string;
  videoUrl: string;
  resolution: string; // e.g. "1080x2400 (FHD+)"
  fileSizeMb: number;
  durationSeconds: number;
  fps: number;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  downloadCount: number;
  favoriteCount: number;
  author: string;
  license: string;
  createdAt: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  autoPlayPreview: boolean;
  wifiOnlyDownloads: boolean;
  notificationsEnabled: boolean;
  isPremiumAdFree: boolean;
  cachedStorageBytes: number;
}

export interface AdminStats {
  totalWallpapers: number;
  totalDownloads: number;
  totalFavorites: number;
  totalActiveSets: number;
  categoryBreakdown: Record<string, number>;
}

export interface DownloadProgress {
  wallpaperId: string;
  progressPercent: number;
  status: 'idle' | 'downloading' | 'completed' | 'error';
  localUri?: string;
  error?: string;
}

export type SetWallpaperTarget = 'home' | 'lock' | 'both';

export interface AndroidProjectFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'properties' | 'pro' | 'markdown' | 'json';
  category: 'Service' | 'UI / Compose' | 'Database' | 'Network' | 'Manifest & Config' | 'Gradle';
  content: string;
  description: string;
}
