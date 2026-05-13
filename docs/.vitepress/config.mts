import { defineConfig } from 'vitepress'
import yaml from '@rollup/plugin-yaml'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [yaml()],
  },
  title: "Awesome",
  description: "A VitePress ",
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Docs',
        items: [
          { text: 'Markdown Docs', link: '/docs/markdown-examples' },
          { text: 'Runtime API Examples', link: '/docs/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tangybi' }
    ],

    search: {
      provider: 'local' // 启用本地搜索
    }
  },
  markdown: {
      math: true
    }
})
