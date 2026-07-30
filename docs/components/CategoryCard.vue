<template>
  <div class="category-bar">
    <div class="category-header">
      <h3 class="category-title">分类</h3>
      <span class="category-count">{{ total }} 篇 · 持续更新</span>
    </div>
    <div class="category-filters">
      <button
        class="filter-pill"
        :class="{ active: selectedCategory === '' }"
        @click="$emit('update:selectedCategory', '')"
      >全部</button>
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="filter-pill"
        :class="{ active: selectedCategory === cat.name }"
        @click="$emit('update:selectedCategory', cat.name)"
      >
        {{ cat.name }}
        <span class="pill-count">{{ cat.count }}</span>
      </button>
    </div>
    <div class="category-divider"></div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  selectedCategory: {
    type: String,
    default: '',
  },
})

defineEmits(['update:selectedCategory'])
</script>

<style scoped>
.category-bar {
  margin-bottom: 8px;
}
.category-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}
.category-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}
.category-count {
  font-size: 0.82rem;
  color: var(--text-dim);
}
.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 20px;
  border: none;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-secondary);
  background: transparent;
  font-family: inherit;
}
.filter-pill:hover {
  color: var(--accent);
  background: var(--accent-soft);
}
.filter-pill.active {
  color: var(--accent-dark);
  background: var(--accent-soft);
}
.pill-count {
  font-size: 0.72rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.6;
}
.filter-pill.active .pill-count {
  opacity: 0.8;
}
.category-divider {
  height: 1px;
  background: var(--border-color);
  margin-bottom: 4px;
}
</style>
