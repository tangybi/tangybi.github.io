<template>
  <div
    class="nav-music-wrapper"
    @mouseenter="show = true"
    @mouseleave="show = false"
  >
    <button
      class="nav-music-btn"
      :class="{ active: show, playing: isPlaying }"
      @click="show = !show"
      :title="isPlaying ? '正在播放' : '音乐播放器'"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" :class="{ 'icon-playing': isPlaying }">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </button>

    <Transition name="popup">
      <div v-show="show" class="nav-music-popup">
        <Music ref="musicRef" from="nav"/>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const show = ref(false)
const musicRef = ref(null)

const isPlaying = computed(() => musicRef.value?.isPlaying ?? false)

</script>

<style scoped>
.nav-music-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.nav-music-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-1);
  padding: 0 10px;
  display: flex;
  align-items: center;
  height: var(--vp-nav-height);
  opacity: 0.7;
  transition: opacity 0.2s;
}
.nav-music-btn:hover,
.nav-music-btn.active {
  opacity: 1;
}
.nav-music-popup {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 200;
  margin-top: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  padding: 16px;
  min-width: 300px;
}
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 播放状态动画 */
.nav-music-btn.playing {
  opacity: 1;
  color: var(--vp-c-brand-1, #7bc67e);
}
.icon-playing {
  animation: icon-beat 1.2s ease-in-out infinite;
}
@keyframes icon-beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}


</style>
