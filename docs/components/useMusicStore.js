import { ref, computed, watch } from 'vue'
import configYaml from './config.yml'

// ===== 播放列表构建 =====
function buildPlaylist() {
  const music = configYaml.music || configYaml
  const base_url = music.base_url || ''
  const suffix = music.suffix || 'mp3'
  const files = music.files || []

  return files.map((item) => {
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

// ===== 模块级共享状态（单例） =====
const playlist = ref(buildPlaylist())
const currentIndex = ref(0)
const currentTrack = computed(() => playlist.value[currentIndex.value])
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const loopMode = ref('all') // 'one' | 'all' | 'shuffle'

const loopTitle = computed(() => {
  switch (loopMode.value) {
    case 'one': return '单曲循环'
    case 'shuffle': return '随机播放'
    default: return '列表循环'
  }
})

const progressPercent = computed(() =>
  duration.value === 0 ? 0 : (currentTime.value / duration.value) * 100
)

const currentLyrics = computed(() => currentTrack.value.lyrics || [])

// ===== 音频管理 =====
const audioCache = new Map()
let audio = null
let initGuard = false

// ===== 旋转角度（共享同步） =====
const rotationAngle = ref(0)
const ROTATION_SPEED = 4.5 // deg per 100ms ≈ 8s 一圈
let rotationTimer = null

function startRotationTimer() {
  if (rotationTimer) return
  rotationTimer = setInterval(() => {
    rotationAngle.value = (rotationAngle.value + ROTATION_SPEED) % 360
  }, 100)
}

function stopRotationTimer() {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = null
  }
}

// 跟随 isPlaying 自动启停
watch(isPlaying, (v) => {
  if (v) startRotationTimer()
  else stopRotationTimer()
})

function onLoadedMetadata() {
  duration.value = audio?.duration || 0
}
function onTimeUpdate() {
  currentTime.value = audio?.currentTime || 0
}
function onTrackEnded() {
  if (loopMode.value === 'one') {
    resetPlayer()
  } else if (loopMode.value === 'shuffle') {
    shuffleNext()
  } else {
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    resetPlayer()
  }
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
  if (audio.paused) {
    audio.play().then(() => { isPlaying.value = true }).catch(() => {})
  } else {
    audio.pause()
    isPlaying.value = false
  }
}

function shuffleNext() {
  let nextIndex
  do {
    nextIndex = Math.floor(Math.random() * playlist.value.length)
  } while (nextIndex === currentIndex.value && playlist.value.length > 1)
  currentIndex.value = nextIndex
  resetPlayer()
}

function resetPlayer() {
  currentTime.value = 0
  duration.value = 0
  isPlaying.value = false
  if (audio) { audio.pause() }
  initAudio()
  togglePlay()
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
  resetPlayer()
}

function next() {
  if (loopMode.value === 'shuffle') { shuffleNext(); return }
  currentIndex.value = (currentIndex.value + 1) % playlist.value.length
  resetPlayer()
}

function playFromList(index) {
  currentIndex.value = index
  resetPlayer()
}

function seek(e) {
  if (!audio || duration.value === 0) return
  const rect = e.currentTarget.getBoundingClientRect()
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration.value
}

function updateVolume() {
  if (audio) audio.volume = volume.value
}

function toggleLoopMode() {
  if (loopMode.value === 'one') loopMode.value = 'all'
  else if (loopMode.value === 'all') loopMode.value = 'shuffle'
  else loopMode.value = 'one'
}

function toggleMute() {
  volume.value = volume.value === 0 ? 0.8 : 0
  updateVolume()
}

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function isActiveLyric(index) {
  const line = currentLyrics.value[index]
  const nextLine = currentLyrics.value[index + 1]
  if (!line) return false
  const t = currentTime.value
  return t >= line.time && (!nextLine || t < nextLine.time)
}

/** 仅首次调用时初始化音频 */
function mountAudio() {
  if (!initGuard) {
    initGuard = true
    initAudio()
  }
}

/** 释放音频资源 */
function unmountAudio() {
  stopRotationTimer()
  rotationAngle.value = 0
  audioCache.forEach(a => a.pause())
  audioCache.clear()
  if (audio) {
    audio.pause()
    audio = null
  }
  initGuard = false
}

// ===== 导出 composable =====
export function useMusicStore() {
  return {
    // 状态
    playlist,
    rotationAngle,
    currentIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    loopMode,
    // 计算属性
    loopTitle,
    progressPercent,
    currentLyrics,
    // 方法
    togglePlay,
    prev,
    next,
    seek,
    toggleMute,
    toggleLoopMode,
    playFromList,
    formatTime,
    isActiveLyric,
    // 生命周期辅助
    mountAudio,
    unmountAudio,
  }
}
