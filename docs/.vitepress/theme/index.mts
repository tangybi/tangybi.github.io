/// <reference types="vite/client" />
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Layout from './Layout.vue'
import Music from '../../components/Music.vue'
import CategoryCard from '../../components/CategoryCard.vue'
import TagCard from '../../components/TagCard.vue'
import PostList from '../../components/PostList.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Music', Music)
    app.component('CategoryCard', CategoryCard)
    app.component('TagCard', TagCard)
    app.component('PostList', PostList)
  }
} satisfies Theme