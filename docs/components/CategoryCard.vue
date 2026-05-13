<template>
  <div class="category-card">
    <div class="card-header">
      <span class="accent-bar"></span>
      <h3 class="card-title">分类</h3>
    </div>
    <ul class="category-list">
      <li v-for="cat in visibleCategories" :key="cat.name" class="category-item">
        <span class="cat-name">{{ cat.name }}</span>
        <span class="cat-count">{{ cat.count }}</span>
      </li>
    </ul>
    <button v-if="categories.length > maxVisible" class="more-btn" @click="$emit('more')">
      ... 更多
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  maxVisible: {
    type: Number,
    default: 5,
  },
})

defineEmits(['more'])

const visibleCategories = computed(() =>
  props.categories.slice(0, props.maxVisible)
)
</script>

<style scoped>
.category-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 10px;
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
.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
  transition: color 0.15s;
}
.category-item:hover .cat-name {
  color: var(--accent);
}
.category-item + .category-item {
  border-top: 1px solid var(--border-color);
}
.cat-name {
  font-size: 0.88rem;
  color: var(--text-secondary);
  transition: color 0.15s;
}
.cat-count {
  background: var(--accent-soft);
  color: var(--accent-dark);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  line-height: 1.4;
}
.more-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.82rem;
  cursor: pointer;
  padding: 8px 0 0;
  display: block;
  transition: opacity 0.15s;
}
.more-btn:hover {
  opacity: 0.7;
}
</style>
