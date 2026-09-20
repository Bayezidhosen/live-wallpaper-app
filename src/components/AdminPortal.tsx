import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Flame,
  Download,
  Heart,
  Search,
  CheckCircle2,
  X,
  UploadCloud,
  Film,
  Layers,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Wallpaper, WallpaperCategory, AdminStats } from '../types';
import { CATEGORIES_LIST } from '../data/wallpapers';

interface AdminPortalProps {
  wallpapers: Wallpaper[];
  stats: AdminStats | null;
  onAddWallpaper: (newWp: Partial<Wallpaper>) => Promise<void>;
  onUpdateWallpaper: (id: string, updates: Partial<Wallpaper>) => Promise<void>;
  onDeleteWallpaper: (id: string) => Promise<void>;
  onRefreshData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  wallpapers,
  stats,
  onAddWallpaper,
  onUpdateWallpaper,
  onDeleteWallpaper,
  onRefreshData,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallpaper, setEditingWallpaper] = useState<Wallpaper | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<WallpaperCategory>('Neon');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formResolution, setFormResolution] = useState('1080x2400 (FHD+)');
  const [formFileSize, setFormFileSize] = useState('7.2');
  const [formDuration, setFormDuration] = useState('12');
  const [formFps, setFormFps] = useState('60');
  const [formTags, setFormTags] = useState('4k, animated, loop');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Neon');
    setFormThumbnailUrl('');
    setFormVideoUrl('');
    setFormResolution('1080x2400 (FHD+)');
    setFormFileSize('7.2');
    setFormDuration('12');
    setFormFps('60');
    setFormTags('4k, animated, loop');
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setEditingWallpaper(null);
  };

  const openEditModal = (wp: Wallpaper) => {
    setEditingWallpaper(wp);
    setFormTitle(wp.title);
    setFormDescription(wp.description);
    setFormCategory(wp.category);
    setFormThumbnailUrl(wp.thumbnailUrl);
    setFormVideoUrl(wp.videoUrl);
    setFormResolution(wp.resolution);
    setFormFileSize(String(wp.fileSizeMb));
    setFormDuration(String(wp.durationSeconds));
    setFormFps(String(wp.fps));
    setFormTags(wp.tags.join(', '));
    setFormIsFeatured(wp.isFeatured);
    setFormIsTrending(wp.isTrending);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Partial<Wallpaper> = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        thumbnailUrl: formThumbnailUrl,
        videoUrl: formVideoUrl,
        resolution: formResolution,
        fileSizeMb: parseFloat(formFileSize) || 6.5,
        durationSeconds: parseInt(formDuration) || 12,
        fps: parseInt(formFps) || 60,
        tags: formTags.split(',').map((s) => s.trim()).filter(Boolean),
        isFeatured: formIsFeatured,
        isTrending: formIsTrending,
      };

      if (editingWallpaper) {
        await onUpdateWallpaper(editingWallpaper.id, payload);
      } else {
        await onAddWallpaper(payload);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to save wallpaper: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = wallpapers.filter((wp) => {
    const matchesSearch =
      wp.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      wp.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase())) ||
      wp.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || wp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-neutral-100 bg-neutral-950 select-none">
      {/* Top Admin Header */}
      <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
              LW
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">LiveWall Admin Management Portal</h2>
              <p className="text-[11px] text-neutral-400">Content repository & remote wallpaper distribution server</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Wallpaper</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Stats Overview */}
      <div className="p-4 pb-0 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Wallpapers</span>
            <Film className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {stats?.totalWallpapers ?? wallpapers.length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Active in Android feed</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Downloads</span>
            <Download className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {stats?.totalDownloads.toLocaleString() ?? '320,000+'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Scoped storage saved</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Favorites Saved</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {stats?.totalFavorites.toLocaleString() ?? '145,000+'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Room DB bookmarks</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Active Live Sets</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {stats?.totalActiveSets.toLocaleString() ?? '3,840'}
          </div>
          <div className="text-[10px] text-teal-400 mt-0.5">Running in WallpaperService</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 pb-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by title, tags, or ID..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-neutral-400">
          Showing <strong className="text-white">{filtered.length}</strong> wallpapers
        </span>
      </div>

      {/* Wallpapers Table */}
      <div className="flex-1 overflow-y-auto p-4 pt-1">
        <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Wallpaper</th>
                <th className="p-3 hidden sm:table-cell">Category</th>
                <th className="p-3 hidden md:table-cell">Quality</th>
                <th className="p-3">Flags</th>
                <th className="p-3 hidden sm:table-cell">Stats</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filtered.map((wp) => (
                <tr key={wp.id} className="hover:bg-neutral-850/60 transition-colors">
                  {/* Thumbnail & Title */}
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={wp.thumbnailUrl}
                        alt={wp.title}
                        className="w-10 h-14 rounded-lg object-cover shrink-0 bg-neutral-800"
                      />
                      <div className="min-w-0 max-w-[200px]">
                        <div className="font-bold text-white truncate">{wp.title}</div>
                        <div className="text-[10px] text-neutral-400 truncate">ID: {wp.id}</div>
                        <div className="text-[10px] text-emerald-400 font-medium sm:hidden">
                          {wp.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[11px] font-medium border border-neutral-700">
                      {wp.category}
                    </span>
                  </td>

                  {/* Quality Specs */}
                  <td className="p-3 hidden md:table-cell text-[11px]">
                    <div className="text-neutral-200">{wp.resolution.split(' ')[0]}</div>
                    <div className="text-neutral-400">{wp.fps} FPS • {wp.fileSizeMb} MB</div>
                  </td>

                  {/* Featured / Trending Toggles */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateWallpaper(wp.id, { isFeatured: !wp.isFeatured })}
                        className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          wp.isFeatured
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300'
                        }`}
                        title="Toggle Featured"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden lg:inline">Featured</span>
                      </button>

                      <button
                        onClick={() => onUpdateWallpaper(wp.id, { isTrending: !wp.isTrending })}
                        className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          wp.isTrending
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300'
                        }`}
                        title="Toggle Trending"
                      >
                        <Flame className="w-3 h-3" />
                        <span className="hidden lg:inline">Trending</span>
                      </button>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="p-3 hidden sm:table-cell text-[11px]">
                    <div className="flex items-center gap-1 text-teal-400">
                      <Download className="w-3 h-3" />
                      <span>{wp.downloadCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-400 mt-0.5">
                      <Heart className="w-3 h-3" />
                      <span>{wp.favoriteCount.toLocaleString()}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(wp)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                        title="Edit metadata"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete wallpaper "${wp.title}"?`)) {
                            onDeleteWallpaper(wp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/60 text-neutral-300 hover:text-rose-300 transition-colors"
                        title="Delete wallpaper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Wallpaper Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>{editingWallpaper ? 'Edit Live Wallpaper' : 'Upload New Live Wallpaper'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Wallpaper Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Cyber Tokyo Rain Loop"
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Detailed aesthetic description for the wallpaper preview..."
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as WallpaperCategory)}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Resolution Specs</label>
                  <input
                    type="text"
                    value={formResolution}
                    onChange={(e) => setFormResolution(e.target.value)}
                    placeholder="1080x2400 (FHD+)"
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Live Video Stream URL (MP4 / WebM) *</label>
                <input
                  type="url"
                  required
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://cdn.example.com/videos/wallpaper.mp4"
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Thumbnail Preview Image URL *</label>
                <input
                  type="url"
                  required
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">File Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Duration (s)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Target FPS</label>
                  <input
                    type="number"
                    value={formFps}
                    onChange={(e) => setFormFps(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="neon, tokyo, 4k, cyberpunk"
                  className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-950 border-neutral-800"
                  />
                  <span className="font-semibold text-white">Featured Carousel</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsTrending}
                    onChange={(e) => setFormIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-950 border-neutral-800"
                  />
                  <span className="font-semibold text-white">Trending Section</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingWallpaper ? 'Save Updates' : 'Publish Live Wallpaper'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
