import { defineConfig } from 'vitepress'
import yaml from '@rollup/plugin-yaml'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [yaml()],
  },
  title: "Awesome",
  description: "A VitePress ",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
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
