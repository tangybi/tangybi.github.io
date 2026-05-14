<template>
  <div class="merge-sort-viz">
    <div class="viz-header">
      <h3>归并排序可视化</h3>
      <p class="viz-desc">直观展示归并排序「分而治之」的完整过程</p>
    </div>

    <!-- 控制面板 -->
    <div class="controls">
      <div class="controls-left">
        <button class="btn" @click="resetAndPlay" :disabled="isPlaying">
          <span class="btn-icon">🔄</span> 随机生成
        </button>
        <button class="btn btn-primary" @click="togglePlay" :disabled="!steps.length">
          <span class="btn-icon">{{ isPlaying ? '⏸' : '▶' }}</span>
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <button class="btn" @click="stepBackward" :disabled="currentStep <= 0">
          <span class="btn-icon">⏮</span> 上一步
        </button>
        <button class="btn" @click="stepForward" :disabled="currentStep >= steps.length - 1">
          <span class="btn-icon">⏭</span> 下一步
        </button>
        <button class="btn" @click="resetToStart">
          <span class="btn-icon">⏪</span> 重置
        </button>
      </div>
      <div class="controls-right">
        <label class="speed-label">
          速度:
          <input type="range" min="1" max="10" v-model.number="speed" class="speed-slider" />
          <span class="speed-value">{{ speedText }}</span>
        </label>
        <label class="size-label">
          元素数:
          <select v-model.number="arraySize" class="size-select" :disabled="isPlaying">
            <option :value="8">8</option>
            <option :value="12">12</option>
            <option :value="16">16</option>
            <option :value="24">24</option>
            <option :value="32">32</option>
          </select>
        </label>
      </div>
    </div>

    <!-- 信息栏 -->
    <div class="info-bar">
      <span class="info-step">步骤: <strong>{{ currentStep }} / {{ steps.length - 1 }}</strong></span>
      <span class="info-desc">{{ currentDescription }}</span>
    </div>

    <!-- 可视化区域 -->
    <div class="visualization" ref="vizRef">
      <svg
        :width="svgWidth"
        :height="svgHeight"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="bars-svg"
      >
        <!-- 柱子 -->
        <g v-for="(item, index) in displayArray" :key="index">
          <!-- 阴影 -->
          <rect
            :x="barX(index) + 3"
            :y="barY(item) + 3"
            :width="barWidth"
            :height="barHeight(item)"
            fill="rgba(0,0,0,0.08)"
            rx="4"
          />
          <!-- 柱子主体 -->
          <rect
            :x="barX(index)"
            :y="barY(item)"
            :width="barWidth"
            :height="barHeight(item)"
            :fill="barColor(index)"
            :stroke="barStroke(index)"
            :stroke-width="isHighlighted(index) ? 2.5 : 1"
            rx="4"
            class="bar-rect"
            :class="{
              'bar-active': isActive(index),
              'bar-merging': isMerging(index),
              'bar-sorted': isSorted(index),
              'bar-comparing': isComparing(index),
            }"
          />
          <!-- 柱子上的数值 -->
          <text
            :x="barX(index) + barWidth / 2"
            :y="barY(item) - 6"
            text-anchor="middle"
            :font-size="barWidth > 20 ? 13 : 9"
            :fill="isActive(index) || isComparing(index) ? '#e74c3c' : '#555'"
            font-weight="600"
            class="bar-label"
          >
            {{ item }}
          </text>
        </g>

        <!-- 分界线标记 -->
        <line
          v-for="(line, idx) in dividerLines"
          :key="'div-' + idx"
          :x1="dividerX(line)"
          :y1="15"
          :x2="dividerX(line)"
          :y2="svgHeight - 10"
          stroke="#bbb"
          stroke-width="1.5"
          stroke-dasharray="4,3"
          opacity="0.6"
        />
      </svg>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <span class="legend-item"><span class="legend-color legend-default"></span> 未排序</span>
      <span class="legend-item"><span class="legend-color legend-comparing"></span> 比较中</span>
      <span class="legend-item"><span class="legend-color legend-active"></span> 当前处理</span>
      <span class="legend-item"><span class="legend-color legend-merging"></span> 合并中</span>
      <span class="legend-item"><span class="legend-color legend-sorted"></span> 已排序</span>
    </div>

    <!-- 算法说明 -->
    <details class="algo-details">
      <summary>📖 归并排序算法说明</summary>
      <div class="algo-content">
        <p><strong>核心思想：</strong>分而治之（Divide and Conquer）</p>
        <ol>
          <li><strong>分割（Divide）：</strong>将数组递归地分成两半，直到每个子数组只有一个元素</li>
          <li><strong>解决（Conquer）：</strong>单个元素天然有序</li>
          <li><strong>合并（Combine）：</strong>将两个有序子数组合并成一个有序数组</li>
        </ol>
        <table class="complexity-table">
          <tr>
            <th>时间复杂度</th>
            <td>平均/最坏/最好: O(n log n)</td>
          </tr>
          <tr>
            <th>空间复杂度</th>
            <td>O(n)</td>
          </tr>
          <tr>
            <th>稳定性</th>
            <td>稳定排序</td>
          </tr>
        </table>
      </div>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

// ==================== 归并排序核心算法 ====================

/** 生成排序过程的步骤 */
function generateSteps(arr) {
  const steps = []
  const working = [...arr]

  // 记录初始状态
  steps.push({
    array: [...working],
    activeIndices: [],
    mergeIndices: [],
    sortedIndices: [],
    dividerLines: [],
    description: '初始数组，等待排序',
  })

  function mergeSortRecursive(left, right, depth = 0) {
    if (left >= right) {
      if (left === right) {
        steps.push({
          array: [...working],
          activeIndices: [],
          mergeIndices: [],
          sortedIndices: [left],
          dividerLines: getDividers(left, right, depth),
          description: `归至单元素: arr[${left}] = ${working[left]}`,
        })
      }
      return
    }

    const mid = Math.floor((left + right) / 2)

    // 标记分割
    steps.push({
      array: [...working],
      activeIndices: [left, right],
      mergeIndices: [],
      sortedIndices: [],
      dividerLines: getDividers(left, right, depth),
      description: `分割区间 [${left}..${right}]，中点 = ${mid}`,
    })

    mergeSortRecursive(left, mid, depth + 1)
    mergeSortRecursive(mid + 1, right, depth + 1)

    // 开始合并
    steps.push({
      array: [...working],
      activeIndices: [],
      mergeIndices: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      sortedIndices: [],
      dividerLines: getDividers(left, right, depth),
      description: `合并区间 [${left}..${mid}] 和 [${mid + 1}..${right}]`,
    })

    mergeInPlace(left, mid, right, depth)
  }

  function mergeInPlace(left, mid, right, depth) {
    const leftArr = working.slice(left, mid + 1)
    const rightArr = working.slice(mid + 1, right + 1)

    let i = 0
    let j = 0
    let k = left

    while (i < leftArr.length && j < rightArr.length) {
      // 比较步骤
      steps.push({
        array: [...working],
        activeIndices: [],
        mergeIndices: Array.from({ length: k - left }, (_, idx) => left + idx),
        sortedIndices: [],
        dividerLines: getDividers(left, right, depth),
        activeIndices: [],  // reset
        comparingIndices: [left + i, mid + 1 + j],
        description: `比较 ${leftArr[i]} 和 ${rightArr[j]}`,
      })

      if (leftArr[i] <= rightArr[j]) {
        working[k] = leftArr[i]
        i++
      } else {
        working[k] = rightArr[j]
        j++
      }
      k++
    }

    while (i < leftArr.length) {
      working[k] = leftArr[i]
      i++
      k++
    }
    while (j < rightArr.length) {
      working[k] = rightArr[j]
      j++
      k++
    }

    // 合并完成
    const sortedIndices = []
    for (let idx = left; idx <= right; idx++) {
      sortedIndices.push(idx)
    }
    steps.push({
      array: [...working],
      activeIndices: [],
      mergeIndices: [],
      sortedIndices,
      dividerLines: [],
      description: `区间 [${left}..${right}] 已排序`,
    })
  }

  function getDividers(left, right, depth) {
    if (depth === 0) return []
    const lines = []
    const total = working.length
    const step = total / Math.pow(2, depth)
    for (let i = step; i < total; i += step) {
      lines.push(Math.floor(i))
    }
    return lines
  }

  mergeSortRecursive(0, working.length - 1)

  // 最终状态
  steps.push({
    array: [...working],
    activeIndices: [],
    mergeIndices: [],
    sortedIndices: working.map((_, i) => i),
    dividerLines: [],
    description: '🎉 排序完成！',
  })

  return steps
}

// ==================== 组件状态 ====================

const vizRef = ref(null)
const steps = ref([])
const currentStep = ref(0)
const isPlaying = ref(false)
const speed = ref(5)
const arraySize = ref(16)
const svgWidth = ref(700)
const svgHeight = ref(360)

let timer = null

const speedText = computed(() => {
  const map = { 1: '极慢', 2: '很慢', 3: '慢', 4: '较慢', 5: '适中', 6: '较快', 7: '快', 8: '很快', 9: '极快', 10: '闪电' }
  return map[speed.value] || '适中'
})

const delayMs = computed(() => {
  // 速度 1 -> 1500ms, 5 -> 400ms, 10 -> 50ms
  return Math.max(50, 1600 - speed.value * 155)
})

const currentDescription = computed(() => {
  if (steps.value.length === 0) return '请先生成数据'
  return steps.value[currentStep.value]?.description || ''
})

const displayArray = computed(() => {
  if (steps.value.length === 0) return []
  return steps.value[currentStep.value]?.array || []
})

const dividerLines = computed(() => {
  if (steps.value.length === 0) return []
  return steps.value[currentStep.value]?.dividerLines || []
})

function isActive(index) {
  const step = steps.value[currentStep.value]
  if (!step) return false
  return step.activeIndices?.includes(index) || false
}

function isMerging(index) {
  const step = steps.value[currentStep.value]
  if (!step) return false
  return step.mergeIndices?.includes(index) || false
}

function isSorted(index) {
  const step = steps.value[currentStep.value]
  if (!step) return false
  return step.sortedIndices?.includes(index) || false
}

function isComparing(index) {
  const step = steps.value[currentStep.value]
  if (!step) return false
  return step.comparingIndices?.includes(index) || false
}

function isHighlighted(index) {
  return isActive(index) || isMerging(index) || isSorted(index) || isComparing(index)
}

function barColor(index) {
  if (isComparing(index)) return '#e74c3c'
  if (isActive(index)) return '#f39c12'
  if (isMerging(index)) return '#3498db'
  if (isSorted(index)) return '#2ecc71'
  return '#95a5a6'
}

function barStroke(index) {
  if (isHighlighted(index)) return '#2c3e50'
  return '#7f8c8d'
}

// 计算柱子尺寸
const barCount = computed(() => displayArray.value.length || 1)
const barWidth = computed(() => {
  return Math.max(8, Math.min(40, (svgWidth.value - 40) / barCount.value - 4))
})
const maxValue = computed(() => Math.max(...displayArray.value, 1))

function barX(index) {
  const totalWidth = barCount.value * (barWidth.value + 4)
  const offset = (svgWidth.value - totalWidth) / 2
  return offset + index * (barWidth.value + 4)
}

function barY(value) {
  return svgHeight.value - barHeight(value) - 30
}

function barHeight(value) {
  return (value / maxValue.value) * (svgHeight.value - 60)
}

function dividerX(index) {
  return barX(index) - 2
}

// ==================== 控制方法 ====================

function generateRandomArray(size) {
  const arr = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10)
  }
  return arr
}

function resetToStart() {
  stopPlay()
  currentStep.value = 0
}

function stepForward() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

function stepBackward() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function togglePlay() {
  if (isPlaying.value) {
    stopPlay()
  } else {
    startPlay()
  }
}

function startPlay() {
  if (currentStep.value >= steps.value.length - 1) {
    currentStep.value = 0
  }
  isPlaying.value = true
  runTimer()
}

function stopPlay() {
  isPlaying.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function runTimer() {
  if (!isPlaying.value) return

  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
    timer = setTimeout(runTimer, delayMs.value)
  } else {
    stopPlay()
  }
}

function resetAndPlay() {
  stopPlay()
  const arr = generateRandomArray(arraySize.value)
  steps.value = generateSteps(arr)
  currentStep.value = 0
  // 自动播放
  isPlaying.value = true
  runTimer()
}

// 监听 speed 变化以更新定时器
watch(speed, () => {
  if (isPlaying.value) {
    if (timer) {
      clearTimeout(timer)
    }
    runTimer()
  }
})

// 监听 arraySize 变化
watch(arraySize, () => {
  if (!isPlaying.value) {
    const arr = generateRandomArray(arraySize.value)
    steps.value = generateSteps(arr)
    currentStep.value = 0
  }
})

// 响应式尺寸
function updateSize() {
  if (vizRef.value) {
    svgWidth.value = Math.max(400, vizRef.value.clientWidth - 40)
  }
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
  // 初始数据
  const arr = generateRandomArray(arraySize.value)
  steps.value = generateSteps(arr)
  currentStep.value = 0
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.merge-sort-viz {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.viz-header {
  margin-bottom: 16px;
}

.viz-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.viz-desc {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 控制面板 */
.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.controls-left {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 0.85rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  color: #495057;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #ced4da;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  border-color: #3498db;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
  border-color: #2980b9;
}

.btn-icon {
  font-size: 1rem;
}

.speed-label,
.size-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #555;
}

.speed-slider {
  width: 100px;
  accent-color: #3498db;
}

.speed-value {
  min-width: 36px;
  font-weight: 600;
  color: #2c3e50;
}

.size-select {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.85rem;
  background: #fff;
  cursor: pointer;
}

/* 信息栏 */
.info-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.info-step {
  white-space: nowrap;
  color: #555;
}

.info-desc {
  color: #2c3e50;
  font-weight: 500;
}

/* 可视化区域 */
.visualization {
  width: 100%;
  overflow: hidden;
  background: #fafbfc;
  border: 1px solid #eee;
  border-radius: 8px;
  min-height: 200px;
}

.bars-svg {
  display: block;
  margin: 0 auto;
}

.bar-rect {
  transition: fill 0.25s ease, y 0.3s ease, height 0.3s ease;
}

.bar-active {
  filter: brightness(1.15);
}

.bar-merging {
  filter: brightness(1.1);
}

.bar-sorted {
  filter: brightness(1.05);
}

.bar-comparing {
  filter: brightness(1.2);
  animation: pulse 0.4s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

.bar-label {
  user-select: none;
}

/* 图例 */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  font-size: 0.8rem;
  color: #555;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0,0,0,0.1);
}

.legend-default { background: #95a5a6; }
.legend-comparing { background: #e74c3c; }
.legend-active { background: #f39c12; }
.legend-merging { background: #3498db; }
.legend-sorted { background: #2ecc71; }

/* 算法说明 */
.algo-details {
  margin-top: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.algo-details summary {
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
  color: #2c3e50;
  background: #f8f9fa;
  user-select: none;
}

.algo-details summary:hover {
  background: #eef0f2;
}

.algo-content {
  padding: 14px;
  font-size: 0.9rem;
  line-height: 1.7;
}

.algo-content ol {
  padding-left: 20px;
  margin: 8px 0;
}

.algo-content li {
  margin: 4px 0;
}

.complexity-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 0.85rem;
}

.complexity-table th,
.complexity-table td {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

.complexity-table th {
  background: #f8f9fa;
  font-weight: 600;
  width: 120px;
}

@media (max-width: 640px) {
  .merge-sort-viz {
    padding: 12px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .controls-left {
    justify-content: center;
  }

  .controls-right {
    justify-content: center;
  }

  .info-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
