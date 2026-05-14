/**
 * 归并排序 (Merge Sort) 实现
 * 时间复杂度: O(n log n)
 * 空间复杂度: O(n)
 */

/**
 * 归并排序主函数
 * 采用自顶向下的递归方式实现
 */
export function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr;
  }

  // 分割阶段: 将数组分成两半
  const mid = Math.floor(arr.length / 2);
  const leftHalf = arr.slice(0, mid);
  const rightHalf = arr.slice(mid);

  // 递归排序左右两半
  const leftSorted = mergeSort(leftHalf);
  const rightSorted = mergeSort(rightHalf);

  // 合并阶段: 合并两个有序数组
  return merge(leftSorted, rightSorted);
}

/**
 * 合并两个有序数组
 * 使用双指针技术
 */
function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  // 比较两个数组的头部元素，将较小的放入结果
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // 将剩余元素追加到结果中
  while (i < left.length) {
    result.push(left[i]);
    i++;
  }
  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

/**
 * 归并排序（返回排序过程中的所有状态）
 * 用于可视化展示
 */
export interface SortStep {
  array: number[];
  activeIndices: number[];
  mergeIndices: number[];
  sortedIndices: number[];
  description: string;
}

export function mergeSortWithSteps(originalArr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...originalArr];

  // 记录初始状态
  steps.push({
    array: [...arr],
    activeIndices: [],
    mergeIndices: [],
    sortedIndices: [],
    description: '初始数组',
  });

  function mergeSortRecursive(left: number, right: number): void {
    if (left >= right) {
      if (left === right) {
        steps.push({
          array: [...arr],
          activeIndices: [],
          mergeIndices: [],
          sortedIndices: [left],
          description: `单个元素 arr[${left}] = ${arr[left]}`,
        });
      }
      return;
    }

    const mid = Math.floor((left + right) / 2);

    mergeSortRecursive(left, mid);
    mergeSortRecursive(mid + 1, right);

    mergeInPlace(left, mid, right);
  }

  function mergeInPlace(left: number, mid: number, right: number): void {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        array: [...arr],
        activeIndices: [left + i, mid + 1 + j],
        mergeIndices: Array.from({ length: k - left }, (_, idx) => left + idx),
        sortedIndices: [],
        description: `比较 ${leftArr[i]} 和 ${rightArr[j]}`,
      });

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      j++;
      k++;
    }

    // 标记已排序的范围
    const sortedIndices: number[] = [];
    for (let idx = left; idx <= right; idx++) {
      sortedIndices.push(idx);
    }

    steps.push({
      array: [...arr],
      activeIndices: [],
      mergeIndices: [],
      sortedIndices,
      description: `合并区间 [${left}..${right}]`,
    });
  }

  mergeSortRecursive(0, arr.length - 1);

  // 最终状态
  steps.push({
    array: [...arr],
    activeIndices: [],
    mergeIndices: [],
    sortedIndices: arr.map((_, i) => i),
    description: '排序完成! 🎉',
  });

  return steps;
}

// ============ 测试代码 ============
function test() {
  const testCases = [
    [38, 27, 43, 3, 9, 82, 10],
    [5, 2, 8, 1, 9],
    [1],
    [],
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
  ];

  console.log('=== 归并排序测试 ===');
  for (const arr of testCases) {
    const original = [...arr];
    const sorted = mergeSort(arr);
    console.log(`原始: ${JSON.stringify(original)} -> 排序后: ${JSON.stringify(sorted)}`);
  }

  console.log('\n=== 归并排序步骤（前 10 步） ===');
  const steps = mergeSortWithSteps([38, 27, 43, 3, 9, 82, 10]);
  for (let i = 0; i < Math.min(10, steps.length); i++) {
    const s = steps[i];
    console.log(`Step ${i}: ${s.description} => [${s.array}]`);
  }
  console.log(`... 共 ${steps.length} 步`);
}

test();
