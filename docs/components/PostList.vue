<template>
  <div class="post-list">
    <article
      v-for="(post, index) in posts"
      :key="index"
      class="post-card"
      @click="goToPost(post.link)"
    >
      <div class="post-card-inner">
        <div class="post-header">
          <h3 class="post-title">{{ post.title }}</h3>
          <span v-if="post.category" class="post-category">{{ post.category }}</span>
        </div>
        <p v-if="post.description" class="post-desc">{{ post.description }}</p>
        <div class="post-meta">
          <span>{{ post.date }}</span>
          <span class="meta-sep">·</span>
          <span>{{ post.readingTime }} min read</span>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { useRouter } from 'vitepress'

const router = useRouter()

const props = defineProps({
  posts: {
    type: Array,
    default: () => [],
  },
})

function goToPost(link) {
  if (link) {
    router.go(link)
  }
}
</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.post-card {
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.2s;
  padding: 0;
}
.post-card:hover {
  background: var(--card-bg);
}
.post-card-inner {
  position: relative;
  padding: 16px 20px;
  border-left: 2px solid transparent;
  transition: border-color 0.2s;
}
.post-card:hover .post-card-inner {
  border-left-color: var(--accent);
}
.post-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
}
.post-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  transition: color 0.15s;
}
.post-card:hover .post-title {
  color: var(--accent);
}
.post-category {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 1px 8px;
  border-radius: 10px;
  white-space: nowrap;
  line-height: 1.6;
  flex-shrink: 0;
}
.post-desc {
  margin: 0 0 6px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-meta {
  font-size: 0.75rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 4px;
}
.meta-sep {
  color: var(--text-dim);
  opacity: 0.5;
}
</style>
