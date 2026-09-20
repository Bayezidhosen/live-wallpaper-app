import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_WALLPAPERS } from './src/data/wallpapers';
import { Wallpaper } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory backend storage with initial production dataset
  let wallpapers: Wallpaper[] = [...INITIAL_WALLPAPERS];
  let totalActiveSetsCount = 3840;

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'LiveWall Backend API', version: '1.0.0' });
  });

  // Get wallpapers with query, category, sort, and pagination
  app.get('/api/wallpapers', (req, res) => {
    const { category, query, sort, limit, page } = req.query;

    let filtered = [...wallpapers];

    if (category && category !== 'All') {
      filtered = filtered.filter(
        (w) => w.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (query) {
      const q = String(query).toLowerCase().trim();
      filtered = filtered.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'popular') {
      filtered.sort((a, b) => b.favoriteCount - a.favoriteCount);
    } else if (sort === 'trending') {
      filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.downloadCount - a.downloadCount);
    } else if (sort === 'downloads') {
      filtered.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (sort === 'newest') {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const pageNum = parseInt(String(page)) || 1;
    const limitNum = parseInt(String(limit)) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      wallpapers: paginated,
    });
  });

  // Get single wallpaper
  app.get('/api/wallpapers/:id', (req, res) => {
    const item = wallpapers.find((w) => w.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }
    res.json(item);
  });

  // Admin: Create wallpaper
  app.post('/api/wallpapers', (req, res) => {
    const body = req.body;
    if (!body.title || !body.videoUrl || !body.thumbnailUrl) {
      return res.status(400).json({ error: 'Title, videoUrl, and thumbnailUrl are required' });
    }

    const newWallpaper: Wallpaper = {
      id: 'wp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      title: body.title,
      description: body.description || '',
      category: body.category || 'Abstract',
      thumbnailUrl: body.thumbnailUrl,
      videoUrl: body.videoUrl,
      resolution: body.resolution || '1080x2400 (FHD+)',
      fileSizeMb: Number(body.fileSizeMb) || 6.5,
      durationSeconds: Number(body.durationSeconds) || 12,
      fps: Number(body.fps) || 60,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map((s: string) => s.trim()) : []),
      isFeatured: Boolean(body.isFeatured),
      isTrending: Boolean(body.isTrending),
      isNew: true,
      downloadCount: 0,
      favoriteCount: 0,
      author: body.author || 'LiveWall Creator',
      license: body.license || 'Commercial Free',
      createdAt: new Date().toISOString(),
    };

    wallpapers.unshift(newWallpaper);
    res.status(201).json(newWallpaper);
  });

  // Admin: Update wallpaper
  app.put('/api/wallpapers/:id', (req, res) => {
    const idx = wallpapers.findIndex((w) => w.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }

    const updated = {
      ...wallpapers[idx],
      ...req.body,
      id: wallpapers[idx].id, // protect ID
    };

    wallpapers[idx] = updated;
    res.json(updated);
  });

  // Admin: Delete wallpaper
  app.delete('/api/wallpapers/:id', (req, res) => {
    const prevLen = wallpapers.length;
    wallpapers = wallpapers.filter((w) => w.id !== req.params.id);
    if (wallpapers.length === prevLen) {
      return res.status(404).json({ error: 'Wallpaper not found' });
    }
    res.json({ success: true, message: 'Wallpaper deleted successfully' });
  });

  // Increment download count
  app.post('/api/wallpapers/:id/download', (req, res) => {
    const item = wallpapers.find((w) => w.id === req.params.id);
    if (item) {
      item.downloadCount += 1;
      return res.json({ downloadCount: item.downloadCount });
    }
    res.status(404).json({ error: 'Wallpaper not found' });
  });

  // Toggle/increment favorite count
  app.post('/api/wallpapers/:id/favorite', (req, res) => {
    const { action } = req.body; // 'add' or 'remove'
    const item = wallpapers.find((w) => w.id === req.params.id);
    if (item) {
      if (action === 'remove') {
        item.favoriteCount = Math.max(0, item.favoriteCount - 1);
      } else {
        item.favoriteCount += 1;
      }
      return res.json({ favoriteCount: item.favoriteCount });
    }
    res.status(404).json({ error: 'Wallpaper not found' });
  });

  // Increment active live set count
  app.post('/api/wallpapers/:id/set-active', (req, res) => {
    totalActiveSetsCount += 1;
    res.json({ totalActiveSets: totalActiveSetsCount });
  });

  // Admin Statistics
  app.get('/api/stats', (req, res) => {
    const totalDownloads = wallpapers.reduce((acc, w) => acc + w.downloadCount, 0);
    const totalFavorites = wallpapers.reduce((acc, w) => acc + w.favoriteCount, 0);
    const categoryBreakdown: Record<string, number> = {};

    for (const w of wallpapers) {
      categoryBreakdown[w.category] = (categoryBreakdown[w.category] || 0) + 1;
    }

    res.json({
      totalWallpapers: wallpapers.length,
      totalDownloads,
      totalFavorites,
      totalActiveSets: totalActiveSetsCount,
      categoryBreakdown,
    });
  });

  // Reset to sample defaults
  app.post('/api/admin/reset-samples', (req, res) => {
    wallpapers = [...INITIAL_WALLPAPERS];
    res.json({ success: true, count: wallpapers.length });
  });

  // --- Vite Middleware & Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LiveWall Server running on http://localhost:${PORT}`);
  });
}

startServer();
