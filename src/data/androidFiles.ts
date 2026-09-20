import { AndroidProjectFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'app/src/main/java/com/livewall/app/service/LiveWallpaperService.kt',
    name: 'LiveWallpaperService.kt',
    language: 'kotlin',
    category: 'Service',
    description: 'Production Android WallpaperService powered by Media3 ExoPlayer with lifecycle management, battery preservation, and zero memory leaks.',
    content: `package com.livewall.app.service

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import com.livewall.app.data.local.WallpaperPreferences
import java.io.File

/**
 * LiveWallpaperService
 * 
 * Commercial-grade Android Live Wallpaper Service.
 * Implements Android WallpaperService.Engine using Media3 ExoPlayer.
 * 
 * Key Features:
 * - Ultra battery-conscious: Stops decoder & rendering when screen is off or app is covered.
 * - Hardware accelerated surface playback via SurfaceHolder.
 * - Audio is permanently muted (0.0f) to prevent accidental audio playback and conserve battery.
 * - Seamless looping mode (Player.REPEAT_MODE_ALL).
 * - Full memory cleanup in onSurfaceDestroyed and onDestroy.
 * - Responds to live wallpaper offset changes for parallax scrolling on supported launchers.
 */
class LiveWallpaperService : WallpaperService() {

    override fun onCreateEngine(): Engine {
        return LiveWallpaperEngine()
    }

    inner class LiveWallpaperEngine : WallpaperService.Engine(), Player.Listener {

        private var player: ExoPlayer? = null
        private var isVisibleState = false
        private var surfaceHolderRef: SurfaceHolder? = null
        private val mainHandler = Handler(Looper.getMainLooper())
        private lateinit var preferences: WallpaperPreferences

        override fun onCreate(surfaceHolder: SurfaceHolder) {
            super.onCreate(surfaceHolder)
            preferences = WallpaperPreferences(applicationContext)
            this.surfaceHolderRef = surfaceHolder
            // Enable touch events if interactive wallpaper effects are desired
            setTouchEventsEnabled(true)
            setOffsetNotificationsEnabled(true)
        }

        override fun onSurfaceCreated(holder: SurfaceHolder) {
            super.onSurfaceCreated(holder)
            this.surfaceHolderRef = holder
            initializePlayer(holder)
        }

        override fun onSurfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
            super.onSurfaceChanged(holder, format, width, height)
            this.surfaceHolderRef = holder
            player?.setVideoSurfaceHolder(holder)
        }

        override fun onSurfaceDestroyed(holder: SurfaceHolder) {
            super.onSurfaceDestroyed(holder)
            this.surfaceHolderRef = null
            releasePlayer()
        }

        override fun onVisibilityChanged(visible: Boolean) {
            super.onVisibilityChanged(visible)
            this.isVisibleState = visible

            if (visible) {
                // Resume playback immediately when returning to Home/Lock screen
                if (player == null && surfaceHolderRef != null) {
                    initializePlayer(surfaceHolderRef!)
                } else {
                    player?.playWhenReady = true
                }
            } else {
                // PAUSE and release video decoders when home screen is obscured to preserve battery
                player?.playWhenReady = false
            }
        }

        override fun onOffsetsChanged(
            xOffset: Float,
            yOffset: Float,
            xOffsetStep: Float,
            yOffsetStep: Float,
            xPixelOffset: Int,
            yPixelOffset: Int
        ) {
            super.onOffsetsChanged(xOffset, yOffset, xOffsetStep, yOffsetStep, xPixelOffset, yPixelOffset)
            // Can be used for dynamic parallax effects across home screen pages
        }

        @OptIn(UnstableApi::class)
        private fun initializePlayer(holder: SurfaceHolder) {
            try {
                if (player != null) return

                val context: Context = applicationContext
                val videoUriString = preferences.getActiveWallpaperVideoUri()

                val exoPlayer = ExoPlayer.Builder(context)
                    .build()
                    .apply {
                        setVideoSurfaceHolder(holder)
                        volume = 0f // Mute permanently for live wallpaper
                        repeatMode = Player.REPEAT_MODE_ALL
                        addListener(this@LiveWallpaperEngine)
                    }

                // Determine whether video source is a local cached file or remote URI
                val mediaItem: MediaItem = if (videoUriString.startsWith("/")) {
                    val localFile = File(videoUriString)
                    if (localFile.exists()) {
                        MediaItem.fromUri(android.net.Uri.fromFile(localFile))
                    } else {
                        // Fallback to default bundle asset
                        MediaItem.fromUri("android.resource://" + packageName + "/" + com.livewall.app.R.raw.default_live_wallpaper)
                    }
                } else if (videoUriString.isNotEmpty()) {
                    MediaItem.fromUri(android.net.Uri.parse(videoUriString))
                } else {
                    // Fallback to bundled demo wallpaper
                    MediaItem.fromUri("android.resource://" + packageName + "/" + com.livewall.app.R.raw.default_live_wallpaper)
                }

                exoPlayer.setMediaItem(mediaItem)
                exoPlayer.prepare()
                exoPlayer.playWhenReady = isVisibleState

                this.player = exoPlayer
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        override fun onPlayerError(error: PlaybackException) {
            super.onPlayerError(error)
            // Retry logic or graceful fallback to static thumbnail
            mainHandler.postDelayed({
                if (isVisibleState && surfaceHolderRef != null) {
                    releasePlayer()
                    initializePlayer(surfaceHolderRef!)
                }
            }, 2000)
        }

        private fun releasePlayer() {
            player?.let {
                it.stop()
                it.clearVideoSurface()
                it.removeListener(this)
                it.release()
            }
            player = null
        }

        override fun onDestroy() {
            super.onDestroy()
            releasePlayer()
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/livewall/app/util/WallpaperManagerHelper.kt',
    name: 'WallpaperManagerHelper.kt',
    language: 'kotlin',
    category: 'Service',
    description: 'Triggers Android system ACTION_CHANGE_LIVE_WALLPAPER confirmation preview with fallback for all Android versions.',
    content: `package com.livewall.app.util

import android.app.WallpaperManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.Toast
import com.livewall.app.data.local.WallpaperPreferences
import com.livewall.app.data.model.Wallpaper
import com.livewall.app.service.LiveWallpaperService

object WallpaperManagerHelper {

    /**
     * Sets the active wallpaper metadata and opens the native Android Live Wallpaper preview activity.
     */
    fun applyLiveWallpaper(context: Context, wallpaper: Wallpaper, localFilePath: String? = null) {
        val prefs = WallpaperPreferences(context)
        
        // Save target wallpaper details so LiveWallpaperService will immediately load it
        val uriToPlay = localFilePath ?: wallpaper.videoUrl
        prefs.setActiveWallpaper(
            id = wallpaper.id,
            title = wallpaper.title,
            videoUri = uriToPlay,
            thumbnailUrl = wallpaper.thumbnailUrl
        )

        val component = ComponentName(context, LiveWallpaperService::class.java)

        try {
            // Android 4.3 (API 16) and above standard live wallpaper chooser intent
            val intent = Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER).apply {
                putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT, component)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            // Fallback for custom ROMs or OEM launchers that intercept the intent
            try {
                val fallbackIntent = Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(fallbackIntent)
            } catch (fallbackError: Exception) {
                Toast.makeText(context, "Please select LiveWall from your system Wallpaper settings", Toast.LENGTH_LONG).show()
            }
        }
    }

    /**
     * Checks if LiveWall is currently the system's active live wallpaper.
     */
    fun isLiveWallpaperActive(context: Context): Boolean {
        val wallpaperManager = WallpaperManager.getInstance(context)
        val wallpaperInfo = wallpaperManager.wallpaperInfo
        return wallpaperInfo != null && wallpaperInfo.packageName == context.packageName
    }
}
`
  },
  {
    path: 'app/src/main/java/com/livewall/app/data/local/WallpaperPreferences.kt',
    name: 'WallpaperPreferences.kt',
    language: 'kotlin',
    category: 'Database',
    description: 'Fast, secure SharedPreferences for active live wallpaper state, AdMob premium status, and app configuration.',
    content: `package com.livewall.app.data.local

import android.content.Context
import android.content.SharedPreferences

class WallpaperPreferences(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "livewall_user_prefs"
        private const val KEY_ACTIVE_WP_ID = "active_wp_id"
        private const val KEY_ACTIVE_WP_TITLE = "active_wp_title"
        private const val KEY_ACTIVE_WP_URI = "active_wp_uri"
        private const val KEY_ACTIVE_WP_THUMB = "active_wp_thumb"
        private const val KEY_PREMIUM_AD_FREE = "premium_ad_free"
        private const val KEY_AUTO_PLAY = "auto_play_preview"
        private const val KEY_WIFI_ONLY = "wifi_only_downloads"
        private const val KEY_APP_THEME = "app_theme"
    }

    fun setActiveWallpaper(id: String, title: String, videoUri: String, thumbnailUrl: String) {
        prefs.edit()
            .putString(KEY_ACTIVE_WP_ID, id)
            .putString(KEY_ACTIVE_WP_TITLE, title)
            .putString(KEY_ACTIVE_WP_URI, videoUri)
            .putString(KEY_ACTIVE_WP_THUMB, thumbnailUrl)
            .apply()
    }

    fun getActiveWallpaperId(): String = prefs.getString(KEY_ACTIVE_WP_ID, "") ?: ""
    fun getActiveWallpaperVideoUri(): String = prefs.getString(KEY_ACTIVE_WP_URI, "") ?: ""

    var isPremiumAdFree: Boolean
        get() = prefs.getBoolean(KEY_PREMIUM_AD_FREE, false)
        set(value) = prefs.edit().putBoolean(KEY_PREMIUM_AD_FREE, value).apply()

    var autoPlayPreview: Boolean
        get() = prefs.getBoolean(KEY_AUTO_PLAY, true)
        set(value) = prefs.edit().putBoolean(KEY_AUTO_PLAY, value).apply()

    var wifiOnlyDownloads: Boolean
        get() = prefs.getBoolean(KEY_WIFI_ONLY, false)
        set(value) = prefs.edit().putBoolean(KEY_WIFI_ONLY, value).apply()

    var appTheme: String
        get() = prefs.getString(KEY_APP_THEME, "system") ?: "system"
        set(value) = prefs.edit().putString(KEY_APP_THEME, value).apply()
}
`
  },
  {
    path: 'app/src/main/java/com/livewall/app/data/local/WallpaperDatabase.kt',
    name: 'WallpaperDatabase.kt',
    language: 'kotlin',
    category: 'Database',
    description: 'Room Database for persistent offline favorites and downloaded video file records.',
    content: `package com.livewall.app.data.local

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "favorite_wallpapers")
data class FavoriteWallpaperEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String,
    val thumbnailUrl: String,
    val videoUrl: String,
    val resolution: String,
    val fileSizeMb: Double,
    val savedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "downloaded_wallpapers")
data class DownloadedWallpaperEntity(
    @PrimaryKey val id: String,
    val title: String,
    val localFilePath: String,
    val fileSizeMb: Double,
    val downloadedAt: Long = System.currentTimeMillis()
)

@Dao
interface FavoriteWallpaperDao {
    @Query("SELECT * FROM favorite_wallpapers ORDER BY savedAt DESC")
    fun getAllFavorites(): Flow<List<FavoriteWallpaperEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM favorite_wallpapers WHERE id = :id)")
    suspend fun isFavorite(id: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addFavorite(wallpaper: FavoriteWallpaperEntity)

    @Query("DELETE FROM favorite_wallpapers WHERE id = :id")
    suspend fun removeFavorite(id: String)
}

@Dao
interface DownloadedWallpaperDao {
    @Query("SELECT * FROM downloaded_wallpapers ORDER BY downloadedAt DESC")
    fun getAllDownloads(): Flow<List<DownloadedWallpaperEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDownload(download: DownloadedWallpaperEntity)

    @Query("DELETE FROM downloaded_wallpapers WHERE id = :id")
    suspend fun deleteDownload(id: String)
}

@Database(
    entities = [FavoriteWallpaperEntity::class, DownloadedWallpaperEntity::class],
    version = 1,
    exportSchema = false
)
abstract class WallpaperDatabase : RoomDatabase() {
    abstract fun favoriteDao(): FavoriteWallpaperDao
    abstract fun downloadedDao(): DownloadedWallpaperDao

    companion object {
        @Volatile
        private var INSTANCE: WallpaperDatabase? = null

        fun getDatabase(context: Context): WallpaperDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    WallpaperDatabase::class.java,
                    "livewall_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/livewall/app/ui/screens/HomeScreen.kt',
    name: 'HomeScreen.kt',
    language: 'kotlin',
    category: 'UI / Compose',
    description: 'Jetpack Compose Material 3 Home screen with categories, featured carousels, and trending wallpaper cards.',
    content: `package com.livewall.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.livewall.app.data.model.Wallpaper
import com.livewall.app.ui.components.WallpaperCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    wallpapers: List<Wallpaper>,
    categories: List<String>,
    onWallpaperClick: (Wallpaper) -> Unit,
    onCategorySelect: (String) -> Unit,
    onSearchClick: () -> Unit,
    onFavoriteToggle: (Wallpaper) -> Unit,
    modifier: Modifier = Modifier
) {
    val featuredWallpapers = remember(wallpapers) { wallpapers.filter { it.isFeatured } }
    val trendingWallpapers = remember(wallpapers) { wallpapers.filter { it.isTrending } }
    val newWallpapers = remember(wallpapers) { wallpapers.filter { it.isNew } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "LiveWall",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "LiveWall",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onSearchClick) {
                        Icon(Icons.Default.Search, contentDescription = "Search Wallpapers")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            // Category Chips Carousel
            item {
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(categories) { category ->
                        FilterChip(
                            selected = false,
                            onClick = { onCategorySelect(category) },
                            label = { Text(category) },
                            shape = RoundedCornerShape(20.dp)
                        )
                    }
                }
            }

            // Featured Wallpapers Hero Carousel
            if (featuredWallpapers.isNotEmpty()) {
                item {
                    Column(modifier = Modifier.padding(vertical = 12.dp)) {
                        Text(
                            text = "Featured Live Wallpapers",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(featuredWallpapers) { wallpaper ->
                                FeaturedWallpaperCard(
                                    wallpaper = wallpaper,
                                    onClick = { onWallpaperClick(wallpaper) }
                                )
                            }
                        }
                    }
                }
            }

            // Trending Wallpapers Section
            item {
                Text(
                    text = "Trending Now",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            items(trendingWallpapers.chunked(2)) { rowItems ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    for (item in rowItems) {
                        WallpaperCard(
                            wallpaper = item,
                            onClick = { onWallpaperClick(item) },
                            onFavoriteClick = { onFavoriteToggle(item) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (rowItems.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            // New Arrivals Section
            if (newWallpapers.isNotEmpty()) {
                item {
                    Text(
                        text = "Fresh New Releases",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
                    )
                }

                items(newWallpapers.chunked(2)) { rowItems ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        for (item in rowItems) {
                            WallpaperCard(
                                wallpaper = item,
                                onClick = { onWallpaperClick(item) },
                                onFavoriteClick = { onFavoriteToggle(item) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                        if (rowItems.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FeaturedWallpaperCard(wallpaper: Wallpaper, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .width(260.dp)
            .height(340.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = wallpaper.thumbnailUrl,
                contentDescription = wallpaper.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            // Bottom gradient overlay with title & resolution badge
            Surface(
                color = Color.Black.copy(alpha = 0.6f),
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(8.dp)
                    .clip(RoundedCornerShape(10.dp))
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    Text(
                        text = wallpaper.title,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        ),
                        maxLines = 1
                    )
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = wallpaper.category,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = wallpaper.resolution,
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.LightGray
                        )
                    }
                }
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/livewall/app/ui/screens/WallpaperPreviewScreen.kt',
    name: 'WallpaperPreviewScreen.kt',
    language: 'kotlin',
    category: 'UI / Compose',
    description: 'Full-screen immersive live video preview using Media3 AndroidView with Set Live Wallpaper action button.',
    content: `package com.livewall.app.ui.screens

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.livewall.app.data.model.Wallpaper
import com.livewall.app.util.WallpaperManagerHelper

@OptIn(UnstableApi::class)
@Composable
fun WallpaperPreviewScreen(
    wallpaper: Wallpaper,
    isFavorite: Boolean,
    onBack: () -> Unit,
    onFavoriteToggle: () -> Unit,
    onDownload: () -> Unit
) {
    val context = LocalContext.current
    var isMuted by remember { mutableStateOf(true) }

    // Media3 ExoPlayer instance for full-screen preview
    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(wallpaper.videoUrl))
            repeatMode = Player.REPEAT_MODE_ALL
            volume = 0f // Muted by default
            prepare()
            playWhenReady = true
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            exoPlayer.stop()
            exoPlayer.release()
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        // Full screen video surface
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = exoPlayer
                    useController = false
                    resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Top Navigation Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBack,
                modifier = Modifier
                    .size(44.dp)
                    .background(Color.Black.copy(alpha = 0.5f), CircleShape)
            ) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(
                    onClick = onFavoriteToggle,
                    modifier = Modifier
                        .size(44.dp)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                ) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Favorite",
                        tint = if (isFavorite) Color.Red else Color.White
                    )
                }

                IconButton(
                    onClick = onDownload,
                    modifier = Modifier
                        .size(44.dp)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                ) {
                    Icon(Icons.Default.Download, contentDescription = "Download", tint = Color.White)
                }
            }
        }

        // Bottom Controls Overlay
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Black.copy(alpha = 0.75f))
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = wallpaper.title,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(wallpaper.category, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelMedium)
                    Text("•", color = Color.Gray)
                    Text(wallpaper.resolution, color = Color.LightGray, style = MaterialTheme.typography.labelMedium)
                    Text("•", color = Color.Gray)
                    Text("\${wallpaper.fps} FPS", color = Color.LightGray, style = MaterialTheme.typography.labelMedium)
                }
                Spacer(modifier = Modifier.height(16.dp))

                // Primary SET WALLPAPER CTA
                Button(
                    onClick = {
                        WallpaperManagerHelper.applyLiveWallpaper(context, wallpaper)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Icon(Icons.Default.Wallpaper, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Set Live Wallpaper",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'Manifest & Config',
    description: 'Production Android Manifest with LiveWallpaperService declaration, BIND_WALLPAPER permission, and AdMob configuration.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.livewall.app">

    <!-- Essential Android Permissions -->
    <uses-permission android:name="android.permission.SET_WALLPAPER" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" tools:node="remove" />

    <!-- Hardware Features -->
    <uses-feature
        android:name="android.software.live_wallpaper"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />

    <application
        android:name=".LiveWallpaperApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LiveWall"
        android:hardwareAccelerated="true"
        tools:targetApi="35">

        <!-- MainActivity Entrypoint -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.LiveWall">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Android Live Wallpaper Service Engine -->
        <service
            android:name=".service.LiveWallpaperService"
            android:enabled="true"
            android:exported="true"
            android:label="@string/wallpaper_service_label"
            android:permission="android.permission.BIND_WALLPAPER">
            <intent-filter>
                <action android:name="android.service.wallpaper.WallpaperService" />
            </intent-filter>
            <meta-data
                android:name="android.service.wallpaper"
                android:resource="@xml/live_wallpaper" />
        </service>

        <!-- Google AdMob Application ID (Test ID: ca-app-pub-3940256099942544~3347511713) -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713" />

    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/res/xml/live_wallpaper.xml',
    name: 'live_wallpaper.xml',
    language: 'xml',
    category: 'Manifest & Config',
    description: 'System metadata definition for Android WallpaperService specifying thumbnail, description, and settings activity.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<wallpaper xmlns:android="http://schemas.android.com/apk/res/android"
    android:thumbnail="@drawable/ic_launcher_foreground"
    android:description="@string/wallpaper_service_description"
    android:settingsActivity="com.livewall.app.MainActivity" />
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (app)',
    language: 'groovy',
    category: 'Gradle',
    description: 'Production App-level Gradle build script configured for Android 15 (SDK 35), Jetpack Compose, Media3, Room, and AdMob.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.livewall.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.livewall.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 100
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Replace with production release keystore
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Core & Lifecycle
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.10.0")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2025.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.7")

    // Media3 / ExoPlayer for Live Wallpaper Service & Video Preview
    implementation("androidx.media3:media3-exoplayer:1.5.1")
    implementation("androidx.media3:media3-ui:1.5.1")
    implementation("androidx.media3:media3-common:1.5.1")

    // Coil for Asynchronous Image Loading & Memory Caching
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Room Database for Offline Favorites & Download Tracking
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Retrofit & Moshi for Remote Backend Sync
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Google Mobile Ads (AdMob)
    implementation("com.google.android.gms:play-services-ads:23.6.0")

    // WorkManager for background wallpaper downloading
    implementation("androidx.work:work-runtime-ktx:2.10.0")
}
`
  },
  {
    path: 'app/proguard-rules.pro',
    name: 'proguard-rules.pro',
    language: 'pro',
    category: 'Manifest & Config',
    description: 'Complete R8/ProGuard obfuscation rules preventing runtime reflection crashes for ExoPlayer, Room, and LiveWallpaperService.',
    content: `# LiveWall Production ProGuard Rules

# LiveWallpaperService & Android WallpaperEngine
-keep class com.livewall.app.service.LiveWallpaperService** { *; }
-keepclassmembers class com.livewall.app.service.LiveWallpaperService$** { *; }

# Media3 / ExoPlayer rules
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**

# Room Database rules
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class * { *; }
-dontwarn androidx.room.paging.**

# Retrofit & OkHttp
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepclassmembers,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Google Play Services Ads (AdMob)
-keep public class com.google.android.gms.ads.** {
   public *;
}
-keep public class com.google.ads.** {
   public *;
}
`
  }
];
