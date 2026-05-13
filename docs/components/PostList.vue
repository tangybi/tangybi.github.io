<template>
  <div class="post-list">
    <article
      v-for="(post, index) in posts"
      :key="index"
      class="post-card"
      @click="goToPost(post.link)"
    >
      <div class="post-body">
        <h3 class="post-title">{{ post.title }}</h3>

        <div class="post-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
            <span>{{ post.date }}</span>
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg>
            <span>{{ post.category }}</span>
          </span>
          <span v-if="post.readingTime" class="meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            <span>{{ post.readingTime }} 分钟</span>
          </span>
        </div>

        <p v-if="post.description" class="post-desc">{{ post.description }}</p>

        <div class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>
      </div>

      <div v-if="post.thumbnail" class="post-thumb">
        <div class="thumb-placeholder">
          <span class="thumb-text">{{ post.thumbnail }}</span>
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
  gap: 16px;
}
.post-card {
  background: var(--vp-c-bg-soft);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.post-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
.post-body {
  flex: 1;
  min-width: 0;
}
.post-title {
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
  font-size: 0.78rem;
  color: var(--text-dim);
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.post-desc {
  margin: 0 0 10px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  font-size: 0.78rem;
  color: var(--accent);
  font-weight: 500;
}
.post-thumb {
  flex-shrink: 0;
  width: 90px;
}
.thumb-placeholder {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, var(--accent-soft), var(--border-color));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent-dark);
  text-align: center;
  line-height: 1.3;
  padding: 4px;
  word-break: break-all;
}
</style>
