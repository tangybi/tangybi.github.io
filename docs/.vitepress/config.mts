import { defineConfig } from 'vitepress'
import yaml from '@rollup/plugin-yaml'

const siteUrl = 'https://tangybi.github.io'
const siteTitle = 'tyb 的博客'
const siteDescription = '个人技术博客，分享 Python、算法、数据结构、TypeScript 等编程知识，记录学习与成长。'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 站点基础 URL（GitHub Pages 场景）
  base: '/',

  vite: {
    plugins: [yaml()],
  },

  // ====== 核心 SEO ======
  title: siteTitle,
  description: siteDescription,
  lang: 'zh-CN',

  // ====== 生成 sitemap ======
  sitemap: {
    hostname: siteUrl,
  },

  // ====== 清理 URL（去掉 .html 后缀） ======
  cleanUrls: true,

  // ====== 每个页面自动使用 lastUpdated ======
  lastUpdated: true,

  head: [
    // 基础
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'author', content: 'tyb' }],
    ['meta', { name: 'keywords', content: 'Python,算法,数据结构,TypeScript,编程,技术博客,VitePress' }],
    ['meta', { name: 'robots', content: 'index, follow' }],

    // Open Graph (Facebook / LinkedIn / 社交分享)
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:title', content: siteTitle }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: siteTitle }],
    ['meta', { property: 'og:image', content: `${siteUrl}/og-image.png` }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: siteTitle }],
    ['meta', { name: 'twitter:description', content: siteDescription }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/og-image.png` }],

    // 结构化数据 - 网站 (JSON-LD)
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteTitle,
        url: siteUrl,
        description: siteDescription,
        author: { '@type': 'Person', name: 'tyb' },
        inLanguage: 'zh-CN',
      }),
    ],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs/markdown-examples' },
      { text: '算法', link: '/docs/merge-sort' },
    ],

    sidebar: [
      {
        text: '文档',
        items: [
          { text: 'Markdown 示例', link: '/docs/markdown-examples' },
          { text: 'Runtime API 示例', link: '/docs/api-examples' },
          { text: '实用小工具', link: '/docs/tools' },
        ]
      },
      {
        text: '算法与数据结构',
        items: [
          { text: '归并排序', link: '/docs/merge-sort' },
        ]
      },
    ],

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tangybi' }
    ],

    // 本地搜索
    search: {
      provider: 'local',
    },

    // 最后更新
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },

    // 编辑链接（指向 GitHub 仓库）
    editLink: {
      pattern: 'https://github.com/tangybi/tangybi.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    // 页脚
    footer: {
      message: 'Powered By <a href="https://vitepress.dev/zh/">VitePress</a>.',
      copyright: 'Copyright © 2026-present tyb',
    },
  },

  markdown: {
    math: true,
  },
})
