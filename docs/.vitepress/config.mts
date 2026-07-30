import { defineConfig } from 'vitepress'
import yaml from '@rollup/plugin-yaml'
import { sidebar } from './sidebar'

// ====== 站点配置 ======
// 注意：CNAME 文件中配置了自定义域名 allberry.cn
// 所有 SEO 链接必须使用该域名，不能用 github.io 后缀
const siteUrl = 'https://allberry.cn'
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
  titleTemplate: `:title | ${siteTitle}`,
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

  // ====== 每页自动添加 canonical URL ======
  transformPageData(pageData) {
    let rawPath = pageData.relativePath  // 例如 "index.md" 或 "docs/api-examples.md"
    // 处理首页: "index.md" -> ""，其他: "docs/foo.md" -> "docs/foo/"
    if (rawPath === 'index.md') {
      rawPath = ''
    } else {
      rawPath = rawPath.replace(/\.md$/, '/')
    }
    const canonicalUrl = rawPath === ''
      ? siteUrl
      : `${siteUrl}/${rawPath}`
    const canonicalLink = {
      rel: 'canonical',
      href: canonicalUrl,
    }
    // 插入到 head 最前面
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.unshift(['link', canonicalLink])
  },

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

    // 百度站点验证（用于百度搜索收录，请替换为实际验证码）
    // ['meta', { name: 'baidu-site-verification', content: '请替换为百度站长平台验证码' }],

    // Google Search Console 验证（用于 Google 搜索收录，请替换为实际验证码）
    // ['meta', { name: 'google-site-verification', content: '请替换为 Google Search Console 验证码' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/docs/markdown-examples' },
    ],

    sidebar,


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
