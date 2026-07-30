<template>
  <div class="radar-card">
    <div class="card-header">
      <span class="accent-bar"></span>
      <h3 class="card-title">博客统计</h3>
    </div>
    <div class="radar-wrapper">
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        class="radar-svg"
      >
        <!-- 网格层 -->
        <g v-for="level in levels" :key="level">
          <polygon
            :points="gridPoints(level / levels)"
            fill="none"
            :stroke="radarGridColor"
            stroke-width="1"
            class="grid-polygon"
          />
        </g>
        <!-- 轴线（视觉）- 彩色流动动画 -->
        <line
          v-for="(dim, i) in dimensions"
          :key="'axis-' + i"
          :x1="cx"
          :y1="cy"
          :x2="pointOnAxis(i, 1).x"
          :y2="pointOnAxis(i, 1).y"
          :stroke="axisColors[i]"
          stroke-width="2"
          stroke-linecap="round"
          class="axis-line"
          :style="{ '--i': i }"
        />
        <!-- 轴标签（实际值/最大值） -->
        <text
          v-for="(dim, i) in dimensions"
          :key="'label-' + i"
          :x="axisLabelPos(i).x"
          :y="axisLabelPos(i).y"
          :text-anchor="'middle'"
          font-size="10"
          :fill="radarLabelColor"
          dy="2.5"
        >{{ dim.label }}: {{ dim.value }}{{ dim.weights }}</text>
        <!-- 数据多边形 -->
        <polygon
          :points="dataPoints"
          fill="rgba(167, 139, 250, 0.25)"
          stroke="#a78bfa"
          stroke-width="2"
          class="data-polygon"
        />
        <!-- 数据点 -->
        <g
          v-for="(pt, i) in dataPointCoords"
          :key="'dot-' + i"
          class="data-point-group"
        >
          <circle
            :cx="pt.x"
            :cy="pt.y"
            r="5"
            fill="transparent"
            class="data-point-hit"
          />
          <circle
            :cx="pt.x"
            :cy="pt.y"
            r="3.5"
            fill="#a78bfa"
            stroke="#fff"
            stroke-width="1.5"
            class="data-point-dot"
          />
          <title>{{ dimensions[i].label }}: {{ dimensions[i].value }}</title>
        </g>
      </svg>
    </div>

    <!-- 指标列表 + 悬停说明 -->
    <ul class="dimension-list">
      <li v-for="(dim, i) in dimensions" :key="i" class="dim-item">
        <span class="dim-label">
          {{ dim.label }}
          <span class="i-tip-wrapper">
            <span class="i-tip">ⓘ</span>
            <span class="i-tip-text">{{ dim.desc }}</span>
          </span>
        </span>
        <span class="dim-value">{{ dim.value }}<span class="dim-max"> / {{ dim.max }}</span></span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dimensions: {
    type: Array,
    required: true,
    // [{ label, value, max, desc }, ...]
  },
  size: {
    type: Number,
    default: 250,
  },
})

const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const radius = computed(() => props.size / 2 - 20)
const levels = 5 // 5 层网格

// 从 CSS 变量读取颜色（兼容 SSR，提供 fallback）
function getCSSVar(name, fallback) {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
const radarGridColor = computed(() => getCSSVar('--radar-grid', '#ddd'))
const radarLabelColor = computed(() => getCSSVar('--radar-label', '#666'))

function pointOnAxis(index, ratio) {
  const angle = (Math.PI * 2 * index) / props.dimensions.length - Math.PI / 2
  return {
    x: cx.value + radius.value * ratio * Math.cos(angle),
    y: cy.value + radius.value * ratio * Math.sin(angle),
  }
}

function gridPoints(ratio) {
  return props.dimensions
    .map((_, i) => {
      const pt = pointOnAxis(i, ratio)
      return `${pt.x},${pt.y}`
    })
    .join(' ')
}

const dataPointCoords = computed(() =>
  props.dimensions.map((dim, i) => {
    const ratio = Math.min(dim.value / dim.max, 1)
    return pointOnAxis(i, ratio)
  })
)

const dataPoints = computed(() =>
  dataPointCoords.value.map((pt) => `${pt.x},${pt.y}`).join(' ')
)

// 轴线颜色配置（浅紫色系为主）
const axisColors = ['#a78bfa', '#c4b5fd', '#8b5cf6', '#b39ddb', '#e0b0ff', '#d8b4fe', '#a29bfe', '#f0abfc']

// 轴标签位置（沿轴线放在数据点与外网格之间）
function axisLabelPos(index) {
  const dim = props.dimensions[index]
  const dataRatio = Math.min(dim.value / dim.max, 1)
  // 标签放在数据点和外网格的中间位置
  const labelRatio = dataRatio + (1 - dataRatio) * 0.5
  const pt = pointOnAxis(index, labelRatio)
  const angle = (Math.PI * 2 * index) / props.dimensions.length - Math.PI / 2
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const offset = 10
  return {
    x: pt.x + cos * offset,
    y: pt.y + sin * offset,
    anchor: cos > 0.1 ? 'start' : cos < -0.1 ? 'end' : 'middle',
  }
}
</script>

<style scoped>
.radar-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 10px;
  margin-top: 10px;
  box-shadow: 0 2px 8px var(--card-shadow);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.accent-bar {
  width: 4px;
  height: 18px;
  background: var(--accent);
  border-radius: 2px;
  flex-shrink: 0;
}
.card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}
.radar-wrapper {
  display: flex;
  justify-content: center;
  margin: 4px 0;
}
.radar-svg {
  display: block;
}
.grid-polygon {
  pointer-events: none;
}
.data-polygon {
  transition: d 0.3s;
}
.axis-line {
  stroke-dasharray: 6 4;
  animation: axisFlow 0.8s linear infinite;
}
.data-point-group {
  cursor: pointer;
}
.data-point-hit {
  cursor: pointer;
}
.data-point-dot {
  transition: r 0.15s;
}
.data-point-group:hover .data-point-dot {
  r: 5;
}

@keyframes axisFlow {
  to {
    stroke-dashoffset: -10;
  }
}

.dimension-list {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
}
.dim-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-primary);
  border-bottom: 1px dashed var(--border-subtle);
}
.dim-item:last-child {
  border-bottom: none;
}
.dim-label {
  display: flex;
  align-items: center;
  gap: 3px;
}
.i-tip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.i-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  border-radius: 50%;
  background: var(--border-color);
  color: var(--text-primary);
  cursor: help;
  flex-shrink: 0;
  transition: background 0.15s;
}
.i-tip-wrapper:hover .i-tip {
  background: var(--accent);
}
.i-tip-text {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: calc(100% + 10px);
  left: 100%;
  transform: translateX(-10%);
  background: var(--card-bg-light);
  color: var(--text-primary);
  font-size: 0.78rem;
  padding: 8px 12px;
  border-radius: 6px;
  width: 280px;
  line-height: 1.5;
  pointer-events: none;
  z-index: 100;
  transition: opacity 0.15s, visibility 0.15s;
  font-weight: 400;
  text-align: left;
  box-shadow: 0 2px 8px var(--card-shadow);
}
.i-tip-text::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 8%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--card-bg-light);
}
.i-tip-wrapper:hover .i-tip-text {
  visibility: visible;
  opacity: 1;
}
.dim-value {
  font-weight: 600;
  color: var(--text-primary);
}
.dim-max {
  font-weight: 400;
  color: var(--text-dim);
  font-size: 0.75rem;
}
</style>
