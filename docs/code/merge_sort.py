"""
归并排序 (Merge Sort) 实现
时间复杂度: O(n log n)
空间复杂度: O(n)
"""

def merge_sort(arr: list[int]) -> list[int]:
    """
    归并排序主函数
    采用自顶向下的递归方式实现
    """
    if len(arr) <= 1:
        return arr

    # 分割阶段: 将数组分成两半
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]

    # 递归排序左右两半
    left_sorted = merge_sort(left_half)
    right_sorted = merge_sort(right_half)

    # 合并阶段: 合并两个有序数组
    return merge(left_sorted, right_sorted)


def merge(left: list[int], right: list[int]) -> list[int]:
    """
    合并两个有序数组
    使用双指针技术
    """
    result = []
    i = j = 0

    # 比较两个数组的头部元素，将较小的放入结果
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # 将剩余元素追加到结果中
    result.extend(left[i:])
    result.extend(right[j:])

    return result


def merge_sort_in_place(arr: list[int], left: int = 0, right: int | None = None) -> None:
    """
    原地归并排序 (优化空间版本)
    直接修改原数组，使用临时数组辅助合并
    """
    if right is None:
        right = len(arr) - 1

    if left < right:
        mid = (left + right) // 2

        merge_sort_in_place(arr, left, mid)
        merge_sort_in_place(arr, mid + 1, right)

        merge_in_place(arr, left, mid, right)


def merge_in_place(arr: list[int], left: int, mid: int, right: int) -> None:
    """
    原地合并两个有序子数组 [left..mid] 和 [mid+1..right]
    """
    # 创建临时数组
    left_arr = arr[left:mid + 1]
    right_arr = arr[mid + 1:right + 1]

    i = j = 0
    k = left

    while i < len(left_arr) and j < len(right_arr):
        if left_arr[i] <= right_arr[j]:
            arr[k] = left_arr[i]
            i += 1
        else:
            arr[k] = right_arr[j]
            j += 1
        k += 1

    while i < len(left_arr):
        arr[k] = left_arr[i]
        i += 1
        k += 1

    while j < len(right_arr):
        arr[k] = right_arr[j]
        j += 1
        k += 1


# ============ 测试代码 ============
if __name__ == "__main__":
    test_cases = [
        [38, 27, 43, 3, 9, 82, 10],
        [5, 2, 8, 1, 9],
        [1],
        [],
        [1, 2, 3, 4, 5],
        [5, 4, 3, 2, 1],
    ]

    print("=== 归并排序测试 ===")
    for arr in test_cases:
        original = arr.copy()
        sorted_arr = merge_sort(arr)
        print(f"原始: {original} -> 排序后: {sorted_arr}")

    # 测试原地排序
    print("\n=== 原地归并排序测试 ===")
    for arr in test_cases:
        original = arr.copy()
        merge_sort_in_place(arr)
        print(f"原始: {original} -> 排序后: {arr}")
