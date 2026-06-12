<template>
  <div ref="container" class="mermaid-wrapper">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const container = ref(null)

onMounted(async () => {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
  })

  const el = container.value
  if (!el) return

  // 从 slot 中提取纯净的图表文本（优先从 <code> 取，否则 fallback 到 textContent）
  const codeEl = el.querySelector('code')
  const diagramText = (codeEl || el).textContent?.trim()
  if (!diagramText) return

  try {
    const id = 'mermaid-' + Math.random().toString(36).slice(2, 8)
    const { svg } = await mermaid.render(id, diagramText)
    el.innerHTML = svg
  } catch (e) {
    el.textContent = '⚠️ Mermaid 图表渲染失败: ' + e.message
  }
})
</script>

<style scoped>
.mermaid-wrapper {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
  overflow-x: auto;
}
.mermaid-wrapper :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
