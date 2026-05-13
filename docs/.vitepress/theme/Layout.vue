<script setup>
import DefaultTheme from 'vitepress/theme'
import NavMusic from './components/NavMusic.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <NavMusic />
    </template>
  </Layout>
</template>
