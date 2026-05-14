---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

title: tyb 的博客 - Python / 算法 / TypeScript
description: 个人技术博客，分享 Python 编程、数据结构与算法、TypeScript 开发等原创内容，记录学习成长之路。

hero:
  name: "tyb 的博客"
  text: "古法编程 · 持续学习"
  tagline: 分享 Python、算法、数据结构、TypeScript 等编程知识与实践经验
  actions:
    - theme: brand
      text: 📖 最新文章
      link: /docs/markdown-examples
    - theme: alt
      text: 🗂️ 算法合集
      link: /docs/merge-sort


---

<script setup>
import { computed } from 'vue'

// 动态加载 docs 目录下所有 markdown 文件
const filesPrefix = 'docs'
const postModules = import.meta.glob('/docs/*.md', { eager: true })

// 同时加载原始 markdown 内容用于计算阅读时长
const rawModules = import.meta.glob('/docs/*.md', { eager: true, query: '?raw', import: 'default' })

// 计算阅读时长（分钟）
function calcReadingTime(text) {
  // 中文字数统计
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length
  // 英文单词数统计
  const words = (text.match(/[a-zA-Z]+/g) || []).length
  // 阅读速度：中文 ~300 字/分钟，英文 ~200 词/分钟
  const minutes = cjkChars / 300 + words / 200
  return Math.max(1, Math.ceil(minutes))
}

const posts = computed(() => {
  return Object.entries(postModules).map(([path, module]) => {
    const filename = path.split('/').pop().replace(/\.md$/, '')
    const fm = module.__pageData.frontmatter || {}
    // 计算阅读时长
    const rawContent = rawModules[path] || ''
    const readingTime = calcReadingTime(rawContent)
    return {
      title: fm.title || filename,
      date: fm.date ? fm.date.slice(0, 10) : '',
      category: fm.category || '',
      tags: fm.tags || [],
      description: fm.description || '',
      link: `/${filesPrefix}/${filename}`,
      readingTime,
    }
  }).sort((a, b) => {
    // 按日期排序，最新的在前
    if (a.date && b.date) return b.date.localeCompare(a.date)
    return 0
  })
})

// 从所有文章中提取分类并统计数量
const categories = computed(() => {
  const map = new Map()
  for (const post of posts.value) {
    if (post.category) {
      map.set(post.category, (map.get(post.category) || 0) + 1)
    }
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
})

// 从所有文章中提取所有标签（去重）
const tags = computed(() => {
  const set = new Set()
  for (const post of posts.value) {
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => set.add(tag))
    }
  }
  return Array.from(set)
})

// 雷达图指标数据
const radarDimensions = computed(() => {
  const total = posts.value.length
  if (total === 0) return []

  // 1. 月均更新
  const dates = posts.value.map(p => p.date).filter(Boolean).sort()
  let monthlyPosts = 0
  if (dates.length > 0) {
    const first = new Date(dates[0])
    const last = new Date(dates[dates.length - 1])
    const monthDiff = (last.getFullYear() - first.getFullYear()) * 12 + (last.getMonth() - first.getMonth()) + 1
    monthlyPosts = Math.round((total / Math.max(monthDiff, 1)) * 10) / 10
  }

  // 2. 平均字数（中文字数 + 英文单词数）
  const rawContents = Object.values(rawModules).filter(Boolean)
  let totalChars = 0
  for (const content of rawContents) {
    const cjk = (content.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length
    const words = (content.match(/[a-zA-Z]+/g) || []).length
    totalChars += cjk + words
  }
  const avgChars = Math.round(totalChars / total)

  // 3. 平均阅读时长
  const avgReadingTime = Math.round(posts.value.reduce((s, p) => s + p.readingTime, 0) / total * 10) / 10

  // 4. 分类数
  const catCount = categories.value.length

  // 5. 标签数
  const tagCount = tags.value.length

  return [
    {
      label: '月均更新',
      value: monthlyPosts,
      max: 10,
      weights: '篇/月',
      desc: '月均更新 = 总文章数 ÷ 月份跨度（首篇文章到最新文章之间的月数），最大 10 篇/月',
    },
    {
      label: '平均字数',
      value: avgChars,
      max: 2000,
      weights: '字',
      desc: '平均字数 = 总字符数（中文 + 英文单词）÷ 文章总数，最大 2000 字',
    },
    {
      label: '平均阅读',
      value: avgReadingTime,
      max: 15,
      weights: '分钟',
      desc: '平均阅读时长 = 总阅读时长 ÷ 文章总数，中文按 300 字/分钟、英文按 200 词/分钟估算，最大 15 分钟',
    },
    {
      label: '分类覆盖',
      value: catCount,
      max: 10,
      weights: '个',
      desc: '文章所涉及的不同分类数量，最大 10 个分类',
    },
    {
      label: '标签丰富度',
      value: tagCount,
      max: 20,
      weights: '个',
      desc: '文章所使用的不同标签数量，最大 20 个标签',
    },
  ]
})
</script>

<div class="home-layout">
  <div class="home-left">
    <CategoryCard :categories="categories" />
    <TagCard :tags="tags" />
    <Music ref="musicRef"/>
    <RadarChart :dimensions="radarDimensions" />
  </div>
  <div class="home-right">
    <PostList :posts="posts" />
  </div>
</div>

<style>
.home-layout {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.home-left {
  width: 280px;
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.home-right {
  flex: 1;
  min-width: 0;
}
@media (max-width: 768px) {
  .home-layout {
    flex-direction: column;
  }
  .home-left {
    display: none;
  }
  .home-right {
    width: 100%;
    min-width: none;
  }
}
</style>
