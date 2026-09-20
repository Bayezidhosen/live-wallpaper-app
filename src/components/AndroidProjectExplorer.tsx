import React, { useState } from 'react';
import {
  FolderCode,
  FileCode,
  Download,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidFiles';
import { AndroidProjectFile } from '../types';

export const AndroidProjectExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'playstore'>('files');

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Root Gradle & Settings
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "LiveWall"
include(":app")
`
      );

      zip.file(
        'build.gradle.kts',
        `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`
      );

      zip.file(
        'gradle/wrapper/gradle-wrapper.properties',
        `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
      );

      // Add all native project files
      for (const file of ANDROID_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }

      // Add strings.xml and themes.xml
      zip.file(
        'app/src/main/res/values/strings.xml',
        `<resources>
    <string name="app_name">LiveWall</string>
    <string name="wallpaper_service_label">LiveWall Animated Engine</string>
    <string name="wallpaper_service_description">High-performance battery-optimized 4K 60FPS live wallpapers powered by Media3 ExoPlayer.</string>
</resources>`
      );

      zip.file(
        'app/src/main/res/values/colors.xml',
        `<resources>
    <color name="primary">#10B981</color>
    <color name="background">#0A0A0A</color>
    <color name="surface">#171717</color>
</resources>`
      );

      // Add README with build instructions
      zip.file(
        'README.md',
        `# LiveWall – Live Wallpapers (Native Android App)

Production-ready Android Live Wallpaper Application built with:
- Kotlin 2.0 & Android Studio Ladybug
- Jetpack Compose & Material 3
- Android WallpaperService with Media3 / ExoPlayer 1.5.1
- Room Database 2.6.1 for offline favorites & downloads
- Google Mobile Ads (AdMob)
- Target SDK 35 (Android 15)

## How to build signed Release AAB for Google Play:
1. Open this directory in Android Studio.
2. Ensure JDK 17+ is configured in Project Structure.
3. Build release bundle:
   \`\`\`bash
   ./gradlew bundleRelease
   \`\`\`
4. The generated App Bundle (.aab) will be created at:
   \`app/build/outputs/bundle/release/app-release.aab\`
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'LiveWall-Android-Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error generating zip archive');
    } finally {
      setIsZipping(false);
    }
  };

  const categories = Array.from(new Set(ANDROID_PROJECT_FILES.map((f) => f.category)));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-neutral-100 bg-neutral-950 select-none">
      {/* Top Header */}
      <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <FolderCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">
              Android Studio Project & Play Store Build Engine
            </h2>
            <p className="text-[11px] text-neutral-400">
              Native Kotlin, Media3 WallpaperService, Room Database, & Manifest
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'files'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kotlin Code Explorer
            </button>
            <button
              onClick={() => setActiveTab('playstore')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'playstore'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Play Store Submission Guide
            </button>
          </div>

          {/* Download Full Project ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 disabled:opacity-75"
            title="Download full Android Studio project ZIP"
          >
            {zipSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                <span>Downloaded ZIP!</span>
              </>
            ) : isZipping ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Zipping Android Project...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Android Studio ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'files' ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-72 bg-neutral-900/60 border-b md:border-b-0 md:border-r border-neutral-800 p-3 overflow-y-auto shrink-0 space-y-4">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>{cat}</span>
                </div>
                <div className="space-y-1">
                  {ANDROID_PROJECT_FILES.filter((f) => f.category === cat).map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                            : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
            {/* Viewer Header */}
            <div className="p-3.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate font-mono">
                  {selectedFile.path}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                  {selectedFile.description}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-neutral-300 bg-neutral-950 select-text">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* Play Store Submission Guide View */
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 text-xs text-neutral-300">
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Google Play Store Production Submission Checklist</span>
            </h3>
            <p className="text-neutral-400 leading-relaxed mb-4">
              LiveWall is architected to comply with 100% of Google Play developer policies, target SDK 35 (Android 15), and modern scoped storage mandates.
            </p>

            <div className="space-y-3">
              {[
                {
                  title: '1. Package Identity & Versioning',
                  desc: 'Configured as com.livewall.app with versionCode 100 and versionName 1.0.0 in app/build.gradle.kts.',
                  done: true,
                },
                {
                  title: '2. Live Wallpaper Service Declaration',
                  desc: 'Declared in AndroidManifest.xml with android.permission.BIND_WALLPAPER and meta-data pointing to res/xml/live_wallpaper.xml.',
                  done: true,
                },
                {
                  title: '3. Media3 ExoPlayer Surface Management',
                  desc: 'LiveWallpaperService pauses video decoding when screen is turned off or launcher is covered, guaranteeing zero battery drain.',
                  done: true,
                },
                {
                  title: '4. Modern Scoped Storage Compliance',
                  desc: 'Does not request dangerous READ_EXTERNAL_STORAGE or WRITE_EXTERNAL_STORAGE permissions; downloads directly to app media directory.',
                  done: true,
                },
                {
                  title: '5. Google AdMob Preparation',
                  desc: 'AdMob application ID configured with test units; pre-wired with Ad-Free Premium toggle for in-app purchases.',
                  done: true,
                },
                {
                  title: '6. Privacy Policy & Terms of Service',
                  desc: 'Comprehensive Privacy Policy & Terms screens included in-app ready for Google Play Console URL fields.',
                  done: true,
                },
                {
                  title: '7. ProGuard / R8 Obfuscation Rules',
                  desc: 'Full proguard-rules.pro keeping ExoPlayer, Room DAOs, and LiveWallpaperService from runtime reflection crashes.',
                  done: true,
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-850">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Build Terminal Commands */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Generate Signed Android App Bundle (.aab)</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-neutral-950 font-mono text-[11px] text-emerald-400 border border-neutral-800">
              # Step 1: Open project in Android Studio or run from terminal<br />
              ./gradlew clean<br />
              <br />
              # Step 2: Build release Android App Bundle (.aab)<br />
              ./gradlew bundleRelease<br />
              <br />
              # Generated output file:<br />
              app/build/outputs/bundle/release/app-release.aab
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
