<template>
  <div class="music-widget" :class="{ playing: isPlaying }">

    <div class="track-area">
      <img class="cover"  :src="currentTrack.cover" alt="cover" :style="{ transform: 'rotate(' + rotationAngle + 'deg)' }" />
      <div class="info">
        <p class="title" :title="currentTrack.title">{{ currentTrack.title }}</p>
        <p class="artist">{{ currentTrack.artist }}</p>
        <div class="time-volume-row">
          <span class="time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          <button @click="toggleMute" class="volume-btn" title="音量">
            <svg v-if="volume === 0" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3c0-1.38-.56-2.63-1.46-3.54l-1.06 1.06c.32.71.52 1.52.52 2.48s-.2 1.77-.52 2.48l1.06 1.06c.9-.91 1.46-2.16 1.46-3.54z"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="progress-bar" @click="seek">
      <div class="progress" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div class="divider"></div>

    <div class="controls">
      <button @click="toggleLoopMode" :title="loopTitle" class="ctrl-btn">
        <svg v-if="loopMode === 'one'" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          <text x="12" y="17" font-size="10" font-weight="bold" text-anchor="middle" fill="currentColor">1</text>
        </svg>
        <svg v-else-if="loopMode === 'all'" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
        </svg>
      </button>
      <button @click="prev" title="上一首" class="ctrl-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>
      </button>
      <button @click="togglePlay" class="play-btn" :title="isPlaying ? '暂停' : '播放'">
        <svg v-if="isPlaying" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
        <svg v-else viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button @click="next" title="下一首" class="ctrl-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
      <button @click="togglePlaylist" :class="{ active: showPlaylist }" title="播放列表" class="ctrl-btn">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
      </button>
    </div>

    <div v-if="showPlaylist" class="playlist">
      <h4>播放列表</h4>
      <ul>
        <li v-for="(track, index) in playlist" :key="index" :class="{ active: index === currentIndex }" @click="playFromList(index)">
          {{ track.title }} - {{ track.artist }}
        </li>
      </ul>
    </div>

    <div v-if="showLyrics" class="lyrics-panel">
      <div class="lyrics-content">
        <p v-for="(line, i) in currentLyrics" :key="i" :class="{ active: isActiveLyric(i) }">
          {{ line.text }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from './useMusicStore'

const props = defineProps({
  from: {
    type: String,
    default: '',
  },
})

const {
  playlist,
  currentIndex,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  loopMode,
  rotationAngle,
  loopTitle,
  progressPercent,
  currentLyrics,
  togglePlay,
  prev,
  next,
  seek,
  toggleMute,
  toggleLoopMode,
  playFromList,
  formatTime,
  isActiveLyric,
  mountAudio,
  unmountAudio,
} = useMusicStore()

const showPlaylist = ref(false)
const showLyrics = ref(false)

function togglePlaylist() { showPlaylist.value = !showPlaylist.value; if (showPlaylist.value) showLyrics.value = false }
function toggleLyrics() { showLyrics.value = !showLyrics.value; if (showLyrics.value) showPlaylist.value = false }

onMounted(() => { mountAudio() })
onUnmounted(() => { unmountAudio() })

// nav 小图标动态
defineExpose({ isPlaying })
</script>

<style scoped>
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes border-flow {
  to { --angle: 360deg; }
}
.music-widget {
  border: 3px solid transparent;
  box-shadow: 0 2px 12px var(--card-shadow);
  position: relative;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  transition: box-shadow 0.3s;
  z-index: 0;
}
.music-widget.playing {
  border: 3px solid transparent;
  background: linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
              conic-gradient(from var(--angle, 0deg), var(--accent), transparent 30%, transparent 70%, var(--accent)) border-box;
  animation: border-flow 3s linear infinite;
  box-shadow: 0 2px 16px var(--accent-shadow);
}
.music-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: 0.02em;
}
.track-area {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 12px;
}
.cover {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px var(--cover-shadow);
  transition: box-shadow 0.3s;
}
.cover.playing {
  box-shadow: 0 2px 12px var(--accent-shadow);
}
.info {
  flex: 1;
  min-width: 0;
}
.info .title {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info .artist {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: var(--text-muted);
}
.time-volume-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.time {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.volume-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-dim);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  transition: color 0.15s;
}
.volume-btn:hover { color: var(--control-hover); }
.progress-bar {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 12px;
}
.progress {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.1s linear;
}
.divider {
  height: 1px;
  background: var(--border-color);
  margin-bottom: 12px;
}
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ctrl-btn {
  background: none;
  border: none;
  color: var(--control-color);
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.ctrl-btn:hover { color: var(--control-hover); }
.ctrl-btn.active { color: var(--accent); }
.play-btn {
  background: var(--accent);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px var(--accent-shadow);
}
.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 14px var(--accent-shadow);
}
.playlist, .lyrics-panel {
  background: var(--card-bg-light);
  border-radius: 10px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 12px;
}
.playlist h4 {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}
.playlist ul { list-style: none; margin: 0; padding: 0; }
.playlist li {
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--text-secondary);
  transition: background 0.15s;
}
.playlist li:hover { background: var(--border-color); }
.playlist li.active { background: var(--accent); color: #fff; font-weight: 500; }
.lyrics-content p {
  margin: 6px 0;
  font-size: 0.82rem;
  color: var(--text-muted);
  transition: all 0.2s;
}
.lyrics-content p.active {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.92rem;
}
</style>
