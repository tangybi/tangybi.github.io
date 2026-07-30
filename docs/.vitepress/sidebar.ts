import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '算法与数据结构',
    items: [
      { text: '归并排序', link: '/docs/DSA/merge-sort' },
      { text: 'H100', link: '/docs/DSA/H100' },
    ]
  },
]
