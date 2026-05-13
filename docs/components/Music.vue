<template>
  <div class="music-widget">
    <div class="music-title">音乐</div>

    <div class="track-area">
      <img class="cover" :src="currentTrack.cover" alt="cover" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 从 config.yml 中读取音乐配置，按 "Artist - Title.ext" 格式解析
// 如果文件名不含 " - "，则视为仅有歌名，艺术家默认为 "Unknown"
import configYaml from './config.yml'


function buildPlaylist() {
  const music = configYaml.music || configYaml
  const base_url = music.base_url || ''
  const suffix = music.suffix || 'mp3'
  const files = music.files || []

  return files.map((item) => {
    // 支持对象格式 { file, title, artist } 和旧版纯字符串格式
    const filename = typeof item === 'string' ? item : (item.file || '')
    const src = `${base_url}${filename}.${suffix}`
    let title, artist
    if (typeof item === 'object' && item.title) {
      title = item.title
      artist = item.artist || 'Unknown'
    } else {
      title = filename
      artist = 'Unknown'
    }
    return {
      title,
      artist,
      cover: `https://picsum.photos/seed/${encodeURIComponent(filename)}/200/200`,
      src,
      lyrics: [],
    }
  })
}

const playlist = ref(buildPlaylist())

const currentIndex = ref(0)
const currentTrack = computed(() => playlist.value[currentIndex.value])
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const showPlaylist = ref(false)
const showLyrics = ref(false)
const loopMode = ref('all') // 'one' | 'all' | 'shuffle'

const loopTitle = computed(() => {
  switch (loopMode.value) {
    case 'one': return '单曲循环'
    case 'shuffle': return '随机播放'
    default: return '列表循环'
  }
})

const audioCache = new Map()
let audio = null

function onLoadedMetadata() {
  duration.value = audio?.duration || 0
}
function onTimeUpdate() {
  currentTime.value = audio?.currentTime || 0
}
function initAudio() {
  if (audio) {
    audio.pause()
    audio.removeEventListener('loadedmetadata', onLoadedMetadata)
    audio.removeEventListener('timeupdate', onTimeUpdate)
    audio.removeEventListener('ended', onTrackEnded)
  }
  const src = currentTrack.value.src
  if (audioCache.has(src)) {
    audio = audioCache.get(src)
    audio.currentTime = 0
  } else {
    audio = new Audio(src)
    audioCache.set(src, audio)
  }
  audio.volume = volume.value
  audio.addEventListener('loadedmetadata', onLoadedMetadata)
  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('ended', onTrackEnded)
}

function togglePlay() {
  if (!audio) initAudio()
  if (audio.paused) { audio.play().then(() => { isPlaying.value = true }).catch(() => {}) }
  else { audio.pause(); isPlaying.value = false }
}

function onTrackEnded() {
  if (loopMode.value === 'one') {
    resetPlayer()
  } else if (loopMode.value === 'shuffle') {
    shuffleNext()
  } else {
    // 'all' — 列表循环
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    resetPlayer()
  }
}

function toggleLoopMode() {
  if (loopMode.value === 'one') loopMode.value = 'all'
  else if (loopMode.value === 'all') loopMode.value = 'shuffle'
  else loopMode.value = 'one'
}

function shuffleNext() {
  let nextIndex
  do {
    nextIndex = Math.floor(Math.random() * playlist.value.length)
  } while (nextIndex === currentIndex.value && playlist.value.length > 1)
  currentIndex.value = nextIndex
  resetPlayer()
}

function prev() { currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length; resetPlayer() }
function next() {
  if (loopMode.value === 'shuffle') { shuffleNext(); return }
  currentIndex.value = (currentIndex.value + 1) % playlist.value.length
  resetPlayer()
}
function playFromList(index) { currentIndex.value = index; resetPlayer() }

function resetPlayer() {
  currentTime.value = 0; duration.value = 0; isPlaying.value = false
  if (audio) { audio.pause() }
  initAudio(); togglePlay()
}

const progressPercent = computed(() => duration.value === 0 ? 0 : (currentTime.value / duration.value) * 100)

function seek(e) {
  if (!audio || duration.value === 0) return
  const rect = e.currentTarget.getBoundingClientRect()
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration.value
}

function updateVolume() { if (audio) audio.volume = volume.value }

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00'
  const m = Math.floor(t / 60); const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const currentLyrics = computed(() => currentTrack.value.lyrics || [])

function isActiveLyric(index) {
  const line = currentLyrics.value[index]; const nextLine = currentLyrics.value[index + 1]
  if (!line) return false
  const t = currentTime.value
  return t >= line.time && (!nextLine || t < nextLine.time)
}

function toggleMute() {
  volume.value = volume.value === 0 ? 0.8 : 0
  updateVolume()
}

function togglePlaylist() { showPlaylist.value = !showPlaylist.value; if (showPlaylist.value) showLyrics.value = false }
function toggleLyrics() { showLyrics.value = !showLyrics.value; if (showLyrics.value) showPlaylist.value = false }

onMounted(() => { initAudio() })
onUnmounted(() => {
  audioCache.forEach(a => a.pause())
  audioCache.clear()
  if (audio) { audio.pause(); audio = null }
})
</script>

<style scoped>
.music-widget {
  /* margin: 10px auto; */
  background: #f7f5eb;
  border-radius: 16px;
  padding: 20px;
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.music-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #222;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.info {
  flex: 1;
  min-width: 0;
}
.info .title {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
  color: #222;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info .artist {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: #888;
}
.time-volume-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.time {
  font-size: 0.75rem;
  color: #999;
}
.volume-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  transition: color 0.15s;
}
.volume-btn:hover { color: #555; }
.progress-bar {
  height: 4px;
  background: #e5e3d9;
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 12px;
}
.progress {
  height: 100%;
  background: #7bc67e;
  border-radius: 2px;
  transition: width 0.1s linear;
}
.divider {
  height: 1px;
  background: #e5e3d9;
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
  color: #666;
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.ctrl-btn:hover { color: #222; }
.ctrl-btn.active { color: #7bc67e; }
.play-btn {
  background: #7bc67e;
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
  box-shadow: 0 2px 8px rgba(123,198,126,0.3);
}
.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 14px rgba(123,198,126,0.4);
}
.playlist, .lyrics-panel {
  background: #efede3;
  border-radius: 10px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 12px;
}
.playlist h4 {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: #888;
  font-weight: 600;
}
.playlist ul { list-style: none; margin: 0; padding: 0; }
.playlist li {
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  color: #444;
  transition: background 0.15s;
}
.playlist li:hover { background: #e3e1d7; }
.playlist li.active { background: #7bc67e; color: #fff; font-weight: 500; }
.lyrics-content p {
  margin: 6px 0;
  font-size: 0.82rem;
  color: #888;
  transition: all 0.2s;
}
.lyrics-content p.active {
  color: #7bc67e;
  font-weight: 600;
  font-size: 0.92rem;
}
</style>
