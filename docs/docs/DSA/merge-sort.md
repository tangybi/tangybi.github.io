---
title: 归并排序 (Merge Sort)
description: 归并排序算法详解，包含 Python 和 TypeScript 代码实现、可视化动画演示、复杂度分析和分治思想讲解。
date: 2026-05-14
category: algorithms
outline: deep
---

# 归并排序 (Merge Sort)

归并排序是一种高效的、稳定的排序算法，采用 **分而治之（Divide and Conquer）** 的策略。

<script setup>
import MergeSortVisualization from '../../components/MergeSortVisualization.vue'
</script>

## 🎮 可视化演示

交互式归并排序可视化，可以直观地看到「分割→排序→合并」的完整过程。

<MergeSortVisualization />

## 📝 算法思想

1. **分割（Divide）**：将数组递归地分成两半，直到每个子数组只有一个元素
2. **解决（Conquer）**：单个元素天然有序
3. **合并（Combine）**：将两个有序子数组合并成一个有序数组

### 复杂度分析

| 指标 | 值 |
|------|-----|
| 最坏时间复杂度 | O(n log n) |
| 平均时间复杂度 | O(n log n) |
| 最好时间复杂度 | O(n log n) |
| 空间复杂度 | O(n) |
| 稳定性 | 稳定 |

## 🐍 代码实现

::: details

::: code-group

<<< @/code/merge_sort.py

<<< @/code/merge_sort.ts

:::


## 🔍 运行测试

### Python

```bash
python docs/code/merge_sort.py
```

### TypeScript

```bash
npx ts-node docs/code/merge_sort.ts
# 或
npx tsx docs/code/merge_sort.ts
```

## 📊 归并排序过程图解

以数组 `[38, 27, 43, 3, 9, 82, 10]` 为例：

```
初始: [38, 27, 43, 3, 9, 82, 10]
                          │
          ┌───────────────┴───────────────┐
       [38, 27, 43, 3]               [9, 82, 10]
          │                               │
    ┌─────┴─────┐                   ┌─────┴─────┐
  [38, 27]    [43, 3]             [9, 82]     [10]
    │            │                   │
  ┌─┴─┐        ┌─┴─┐              ┌─┴─┐
 [38] [27]    [43] [3]           [9] [82]
    │            │                   │
  └─┬─┘        └─┬─┘              └─┬─┘
  [27, 38]     [3, 43]            [9, 82]     [10]
    │            │                   │
    └─────┬─────┘                   └─────┬─────┘
       [3, 27, 38, 43]               [9, 10, 82]
          │                               │
          └───────────────┬───────────────┘
                    [3, 9, 10, 27, 38, 43, 82]
```

## 🎯 要点总结

| 特性 | 说明 |
|------|------|
| **分治思想** | 将大问题分解为小问题，解决后合并 |
| **递归实现** | 自然地表达分割与合并过程 |
| **稳定排序** | 相等元素的相对顺序不会改变 |
| **额外空间** | 需要 O(n) 的辅助空间 |
| **适合大数据** | O(n log n) 保证了处理大规模数据的高效性 |
