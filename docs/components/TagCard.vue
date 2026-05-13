<template>
  <div class="tag-card">
    <div class="card-header">
      <span class="accent-bar"></span>
      <h3 class="card-title">标签</h3>
    </div>
    <div class="tag-list">
      <span
        v-for="tag in visibleTags"
        :key="tag"
        class="tag-pill"
      >{{ tag }}</span>
    </div>
    <button v-if="tags.length > maxVisible" class="more-btn" @click="$emit('more')">
      ... 更多
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  maxVisible: {
    type: Number,
    default: 10,
  },
})

defineEmits(['more'])

const visibleTags = computed(() =>
  props.tags.slice(0, props.maxVisible)
)
</script>

<style scoped>
.tag-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 10px;
  margin: 10px 0;
  box-shadow: 0 2px 8px var(--card-shadow);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.accent-bar {
  width: 4px;
  height: 18px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
}
.card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-pill {
  background: var(--accent-soft);
  color: var(--accent-deep);
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1.4;
}
.tag-pill:hover {
  background: var(--accent);
  color: #fff;
}
.more-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.82rem;
  cursor: pointer;
  padding: 10px 0 0;
  display: block;
  transition: opacity 0.15s;
}
.more-btn:hover {
  opacity: 0.7;
}
</style>
