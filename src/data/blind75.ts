// The Blind 75 — curated list of essential coding interview problems.
// Each problem has:
//   - statement: markdown-like problem text
//   - functionSignature: Python def line (must match starter)
//   - starter: Python starter code shown in the editor
//   - examples: visible test cases (shown to user)
//   - hiddenTests: graded test cases (not shown to user; live in IPA so not
//     cryptographically hidden, but invisible in the practice flow)
// Tests evaluate user_fn(...args) and compare equality with expected.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  input: any[]; // positional args for the function
  expected: any; // expected return value
  // Optional toleranceless equality is fine for numbers, strings, lists, dicts.
}

export interface Blind75Problem {
  id: string;
  number: number; // 1-75
  title: string;
  difficulty: Difficulty;
  topic: string;
  statement: string;
  explanation?: string; // optional algorithm hint shown in overlay; markdown-light
  functionName: string;
  functionSignature: string; // first line of starter, kept here for display
  starter: string;
  examples: TestCase[]; // visible
  hiddenTests: TestCase[]; // graded
}

const STARTER_HEADER = '# Write your solution below. Do not rename the function.\n';

export const blind75: Blind75Problem[] = [
  // ===== Array =====
  {
    id: 'two-sum',
    number: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Array',
    statement:
      "You're given a list of integers `nums` and a value `target`. Find the two positions whose values add to `target`, and return those positions in a list.\n\nEvery input has exactly one valid pair, and you can't reuse the same position twice. The order of the two indices in your answer doesn't matter.",
    explanation:
      "Brute force checks every pair — that's O(n²). The trick is to scan once and remember what you've seen.\n\nKeep a dictionary mapping value → index. For each number, ask: 'what value would complete this pair?' That's `target - current`. If the complement is already in the dictionary, you've found your answer. Otherwise, record the current value before moving on.\n\nThis runs in O(n) time and uses O(n) extra space.",
    functionName: 'two_sum',
    functionSignature: 'def two_sum(nums: list[int], target: int) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your code here\n    pass\n',
    examples: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
    ],
    hiddenTests: [
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
      { input: [[0, 4, 3, 0], 0], expected: [0, 3] },
      { input: [[1, 5, 7, -1, 5], 6], expected: [0, 1] },
    ],
  },
  {
    id: 'best-time-stock',
    number: 2,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: 'Array',
    statement:
      'An array `prices` holds the closing value of a stock on each consecutive day. You may buy on one day and sell on a strictly later day, at most once. Return the largest profit possible, or `0` if no profitable trade exists.',
    explanation:
      "You want the biggest gap between a cheap day and any later expensive day. Tracking every pair is O(n²) — instead, sweep left to right while remembering the cheapest day seen so far.\n\nAt each day, the best sale-today profit is `today's price − cheapest day so far`. Keep the running maximum of those values; that's your answer.\n\nOne pass, O(n) time, O(1) memory.",
    functionName: 'max_profit',
    functionSignature: 'def max_profit(prices: list[int]) -> int:',
    starter: STARTER_HEADER + 'def max_profit(prices: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1, 2, 3, 4, 5]], expected: 4 },
      { input: [[2, 4, 1]], expected: 2 },
      { input: [[1]], expected: 0 },
      { input: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 4 },
    ],
  },
  {
    id: 'contains-duplicate',
    number: 3,
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    topic: 'Array',
    statement:
      'Decide whether an integer list `nums` contains any repeated value. Return `True` if at least one element appears more than once; return `False` if every element is unique.',
    explanation:
      "Comparing every pair is O(n²) and wasteful. A set gives you O(1) membership checks.\n\nWalk the list. For each element, return `True` immediately if it's already in your set; otherwise add it. If you finish the loop, return `False`.\n\nThe one-line cheat `len(set(nums)) != len(nums)` is the same big-O but always reads the whole input, even when a duplicate appears at index 1. Streaming with early exit is friendlier on long inputs.",
    functionName: 'contains_duplicate',
    functionSignature: 'def contains_duplicate(nums: list[int]) -> bool:',
    starter: STARTER_HEADER + 'def contains_duplicate(nums: list[int]) -> bool:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 1]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
    ],
    hiddenTests: [
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
      { input: [[]], expected: false },
      { input: [[5]], expected: false },
      { input: [[-1, -1]], expected: true },
    ],
  },
  {
    id: 'product-except-self',
    number: 4,
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    topic: 'Array',
    statement:
      'Given an integer array `nums`, build a new array `answer` of the same length where `answer[i]` equals the product of every value in `nums` *other than* `nums[i]`.\n\nYour solution must run in `O(n)` time and must not use division.',
    explanation:
      "No division means you can't compute the total product and divide it out. The trick is two sweeps.\n\nFirst sweep left to right, filling `answer[i]` with the product of everything strictly to its left. Second sweep right to left, multiplying each `answer[i]` by a running product of everything strictly to its right.\n\nAt the end, each cell holds `(left product) × (right product)`, which is exactly the product of all elements except itself. O(n) time, O(1) extra space beyond the output array.",
    functionName: 'product_except_self',
    functionSignature: 'def product_except_self(nums: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def product_except_self(nums: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { input: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
    ],
    hiddenTests: [
      { input: [[2, 3, 4, 5]], expected: [60, 40, 30, 24] },
      { input: [[1, 1]], expected: [1, 1] },
      { input: [[5, 0, 5]], expected: [0, 25, 0] },
    ],
  },
  {
    id: 'max-subarray',
    number: 5,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    topic: 'Array',
    statement:
      'Given an array of integers, find the contiguous slice with the largest sum and return that sum. The slice must contain at least one element.',
    explanation:
      "Classic Kadane's algorithm. Walk left to right and track the best sum of any subarray *ending exactly at the current index*.\n\nFor each new element, you have two choices: extend the previous best slice by adding the new element, or start a fresh slice from this element alone. Pick whichever is larger — that's `best_ending_here`. The overall answer is the maximum of those values across the walk.\n\nO(n) time, O(1) space. The subtle case is all-negative input: returning 0 would be wrong; you must return the largest single element.",
    functionName: 'max_sub_array',
    functionSignature: 'def max_sub_array(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def max_sub_array(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
    ],
    hiddenTests: [
      { input: [[-1]], expected: -1 },
      { input: [[-2, -1]], expected: -1 },
      { input: [[-1, -2, -3]], expected: -1 },
      { input: [[3, -2, 5, -1]], expected: 6 },
    ],
  },
  {
    id: 'max-product-subarray',
    number: 6,
    title: 'Maximum Product Subarray',
    difficulty: 'Medium',
    topic: 'Array',
    statement:
      'From an integer array `nums`, find the contiguous, non-empty slice whose elements multiply to the largest value. Return that product.',
    explanation:
      "Like maximum-sum subarray, but multiplication has a twist: two negatives make a positive, so the *minimum* product so far can flip to become the new *maximum*. You have to carry both.\n\nWalk left to right with two running values: `cur_max` and `cur_min`, both starting at `nums[0]`. For each new number, the new `cur_max` is `max(num, num * cur_max, num * cur_min)`. Compute the new `cur_min` symmetrically with `min`. Keep a global best alongside.\n\nO(n) time, O(1) space.",
    functionName: 'max_product',
    functionSignature: 'def max_product(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def max_product(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[2, 3, -2, 4]], expected: 6 },
      { input: [[-2, 0, -1]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[-2, 3, -4]], expected: 24 },
      { input: [[0, 2]], expected: 2 },
      { input: [[-2]], expected: -2 },
      { input: [[2, -5, -2, -4, 3]], expected: 24 },
    ],
  },
  {
    id: 'find-min-rotated',
    number: 7,
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    topic: 'Binary Search',
    statement:
      'A list of distinct integers was originally sorted in ascending order, then rotated some number of times (the tail wrapped around to the front). Given the rotated list, return its smallest element.\n\nRequired runtime: `O(log n)`.',
    explanation:
      "The minimum sits at the rotation point — the only place where the array dips downward. Binary search lets you home in on that pivot in O(log n).\n\nKeep pointers `lo` and `hi`. Look at the middle. If `nums[mid] > nums[hi]`, the dip must be to the right of `mid`, so move `lo = mid + 1`. Otherwise the minimum is at `mid` or to its left, so move `hi = mid`. When `lo == hi`, you're standing on the minimum.\n\nIf the array isn't rotated at all, the first element is already the answer — but the same loop handles that case naturally.",
    functionName: 'find_min',
    functionSignature: 'def find_min(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def find_min(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[3, 4, 5, 1, 2]], expected: 1 },
      { input: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { input: [[11, 13, 15, 17]], expected: 11 },
    ],
    hiddenTests: [
      { input: [[2, 1]], expected: 1 },
      { input: [[1]], expected: 1 },
      { input: [[5, 1, 2, 3, 4]], expected: 1 },
    ],
  },
  {
    id: 'search-rotated',
    number: 8,
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    topic: 'Binary Search',
    statement:
      "You're given an array `nums` of distinct integers that started out sorted in ascending order, then was rotated at some unknown pivot. Given a value `target`, return its index in the array, or `-1` if it isn't present.\n\nThe runtime must be `O(log n)`.",
    explanation:
      "Plain binary search would break because the array isn't fully sorted — but here's the key observation: one half of any midpoint split is *always* sorted. Use that.\n\nLook at the middle. Compare `nums[lo]` with `nums[mid]`. If `nums[lo] <= nums[mid]`, the left half is sorted; otherwise the right half is. Check whether `target` lies inside the sorted half's value range — if yes, discard the unsorted side; if no, discard the sorted side. Recurse on the surviving half.\n\nEach step halves the window, giving O(log n).",
    functionName: 'search',
    functionSignature: 'def search(nums: list[int], target: int) -> int:',
    starter: STARTER_HEADER + 'def search(nums: list[int], target: int) -> int:\n    pass\n',
    examples: [
      { input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { input: [[1], 0], expected: -1 },
    ],
    hiddenTests: [
      { input: [[1, 3], 3], expected: 1 },
      { input: [[5, 1, 3], 5], expected: 0 },
      { input: [[1, 2, 3, 4, 5], 5], expected: 4 },
    ],
  },
  {
    id: '3sum',
    number: 9,
    title: '3Sum',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    statement:
      'Given an integer array `nums`, find every unique triplet of values from the array that sums to zero. Return the triplets as a list of lists.\n\nEach inner triplet must be sorted in ascending order. The outer order does not matter, but no triplet may appear twice in the result.',
    explanation:
      "Sort the array first. Sorting makes duplicate-skipping trivial and unlocks the two-pointer trick.\n\nLoop over each index `i`, treating `nums[i]` as the smallest of the three. For each `i`, set `left = i + 1` and `right = n - 1`. Compute the three-sum. If it's less than zero, advance `left`; if greater, retreat `right`; if exactly zero, record the triplet and advance both pointers past any duplicates.\n\nAlso skip duplicate values of `nums[i]` itself in the outer loop. Total: O(n²) — one outer loop times a linear two-pointer sweep.",
    functionName: 'three_sum',
    functionSignature: 'def three_sum(nums: list[int]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def three_sum(nums: list[int]) -> list[list[int]]:\n    # Tip: sort the array first.\n    pass\n',
    examples: [
      {
        input: [[-1, 0, 1, 2, -1, -4]],
        expected: [
          [-1, -1, 2],
          [-1, 0, 1],
        ],
      },
      { input: [[0, 1, 1]], expected: [] },
      { input: [[0, 0, 0]], expected: [[0, 0, 0]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1, 2, -2, -1]], expected: [] },
      { input: [[-2, 0, 0, 2, 2]], expected: [[-2, 0, 2]] },
    ],
  },
  {
    id: 'container-most-water',
    number: 10,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    statement:
      'An array `height` describes `n` vertical lines: the `i`-th line rises from `(i, 0)` to `(i, height[i])`. Pick any two lines and pair them with the x-axis to form a container. Return the largest amount of water any such container can hold.',
    explanation:
      "The water volume between two lines is `min(left_height, right_height) × distance_between`. You want to maximize that, but checking every pair is O(n²) and too slow.\n\nStart with the widest possible container: `left = 0`, `right = n - 1`. Compute its area, then move the *shorter* side inward by one step. That's the only move that could ever increase the area — shrinking the wider side guarantees a worse or equal result, because the height was already capped by the shorter side.\n\nKeep the running max as the window shrinks. O(n) time, O(1) space.",
    functionName: 'max_area',
    functionSignature: 'def max_area(height: list[int]) -> int:',
    starter: STARTER_HEADER + 'def max_area(height: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
      { input: [[1, 2, 1]], expected: 2 },
      { input: [[2, 3, 4, 5, 18, 17, 6]], expected: 17 },
    ],
  },

  // ===== Binary =====
  {
    id: 'sum-two-integers',
    number: 11,
    title: 'Sum of Two Integers',
    difficulty: 'Medium',
    topic: 'Binary',
    statement:
      'Return the sum of two integers `a` and `b` without using the arithmetic operators `+` or `-`.',
    explanation:
      "Addition in binary breaks into two parts: the bit-by-bit sum (XOR) and the carry (AND shifted left by one). Loop until the carry is zero.\n\nAt each step, set `a = a ^ b` (the sum without carrying) and `b = (a & b) << 1` (the carry to add next iteration). When `b` becomes zero, `a` holds the result.\n\nIn Python you also need to mask to 32 bits and handle negative numbers explicitly, since Python integers are arbitrary precision. Mask with `0xFFFFFFFF` each step, then convert back to signed at the end.",
    functionName: 'get_sum',
    functionSignature: 'def get_sum(a: int, b: int) -> int:',
    starter: STARTER_HEADER + 'def get_sum(a: int, b: int) -> int:\n    pass\n',
    examples: [
      { input: [1, 2], expected: 3 },
      { input: [2, 3], expected: 5 },
    ],
    hiddenTests: [
      { input: [0, 0], expected: 0 },
      { input: [-1, 1], expected: 0 },
      { input: [-2, 3], expected: 1 },
      { input: [10, 20], expected: 30 },
    ],
  },
  {
    id: 'number-of-1-bits',
    number: 12,
    title: 'Number of 1 Bits',
    difficulty: 'Easy',
    topic: 'Binary',
    statement:
      "Count how many bits are set to `1` in the binary representation of an unsigned integer `n`. This count is the integer's Hamming weight.",
    explanation:
      "Two clean approaches:\n\n1. **Loop and shift**: while `n > 0`, add `n & 1` to your counter and shift `n >>= 1`. O(bits) — 32 iterations for a 32-bit int.\n\n2. **Brian Kernighan's trick**: `n & (n - 1)` clears the lowest set bit. Loop `while n: n &= n - 1; count += 1`. This runs once per set bit, so it's fast on sparse numbers.\n\nPython's `bin(n).count('1')` is the one-liner cheat, but the bit tricks are what's being tested.",
    functionName: 'hamming_weight',
    functionSignature: 'def hamming_weight(n: int) -> int:',
    starter: STARTER_HEADER + 'def hamming_weight(n: int) -> int:\n    pass\n',
    examples: [
      { input: [11], expected: 3 },
      { input: [128], expected: 1 },
    ],
    hiddenTests: [
      { input: [0], expected: 0 },
      { input: [4294967293], expected: 31 },
      { input: [255], expected: 8 },
    ],
  },
  {
    id: 'counting-bits',
    number: 13,
    title: 'Counting Bits',
    difficulty: 'Easy',
    topic: 'Binary',
    statement:
      'Given a non-negative integer `n`, return a list of length `n + 1` where the element at index `i` is the number of `1` bits in the binary representation of `i`.',
    explanation:
      "You could call `hamming_weight` on every value, but that's O(n log n). A DP recurrence brings it down to O(n).\n\nKey observation: `bits(i) = bits(i >> 1) + (i & 1)`. Dropping the lowest bit (a right-shift by one) gives a smaller number whose count you've already computed; whether you added a `1` depends on the bit you dropped.\n\nBuild the answer left to right with `ans[i] = ans[i >> 1] + (i & 1)`. One pass, O(n) time and space.",
    functionName: 'count_bits',
    functionSignature: 'def count_bits(n: int) -> list[int]:',
    starter: STARTER_HEADER + 'def count_bits(n: int) -> list[int]:\n    pass\n',
    examples: [
      { input: [2], expected: [0, 1, 1] },
      { input: [5], expected: [0, 1, 1, 2, 1, 2] },
    ],
    hiddenTests: [
      { input: [0], expected: [0] },
      { input: [8], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
    ],
  },
  {
    id: 'missing-number',
    number: 14,
    title: 'Missing Number',
    difficulty: 'Easy',
    topic: 'Binary',
    statement:
      'A list `nums` contains `n` distinct integers drawn from the range `[0, n]` — that range has `n + 1` values, so exactly one is absent. Return the missing value.',
    explanation:
      "Three clean approaches:\n\n1. **Sum trick**: the sum of `0..n` is `n*(n+1)/2`. Subtract the sum of `nums` from it; the difference is the missing number. O(n) time, O(1) space.\n\n2. **XOR trick**: XOR every index `0..n` with every value in `nums`. Identical pairs cancel (`x ^ x = 0`), leaving the missing number. Also O(n) but avoids the sum overflow concern in languages without arbitrary-precision ints.\n\n3. **Sort and scan**: O(n log n), works but slower.\n\nThe sum or XOR approaches are what's expected.",
    functionName: 'missing_number',
    functionSignature: 'def missing_number(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def missing_number(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[3, 0, 1]], expected: 2 },
      { input: [[0, 1]], expected: 2 },
      { input: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
    ],
    hiddenTests: [
      { input: [[0]], expected: 1 },
      { input: [[1]], expected: 0 },
      { input: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 10]], expected: 9 },
    ],
  },
  {
    id: 'reverse-bits',
    number: 15,
    title: 'Reverse Bits',
    difficulty: 'Easy',
    topic: 'Binary',
    statement:
      'Reverse the bit order of a 32-bit unsigned integer. The input should be treated as a 32-bit binary value: bit 0 swaps with bit 31, bit 1 with bit 30, and so on.',
    explanation:
      "Walk the 32 bit positions and shift them into place.\n\nInitialize `result = 0`. For each of 32 iterations: shift `result` left by one (`result <<= 1`), then OR in the lowest bit of `n` (`result |= n & 1`), then shift `n` right by one. After 32 passes, `result` holds the reversed bits.\n\nWatch for two Python gotchas: integers aren't bounded to 32 bits, so always run exactly 32 iterations rather than `while n`. And the input may already exceed 32 bits in pathological tests — mask `n &= 0xFFFFFFFF` defensively if needed.",
    functionName: 'reverse_bits',
    functionSignature: 'def reverse_bits(n: int) -> int:',
    starter: STARTER_HEADER + 'def reverse_bits(n: int) -> int:\n    pass\n',
    examples: [
      { input: [43261596], expected: 964176192 },
      { input: [4294967293], expected: 3221225471 },
    ],
    hiddenTests: [
      { input: [0], expected: 0 },
      { input: [1], expected: 2147483648 },
      { input: [2147483648], expected: 1 },
    ],
  },

  // ===== Dynamic Programming =====
  {
    id: 'climbing-stairs',
    number: 16,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    statement:
      'A staircase has `n` steps. From any step you may move up by either 1 or 2 steps. Return how many different sequences of moves bring you from the ground to the top.',
    explanation:
      "To reach step `n`, your final move came from either step `n - 1` (a 1-step) or step `n - 2` (a 2-step). So `ways(n) = ways(n - 1) + ways(n - 2)`. That's Fibonacci.\n\nBase cases: `ways(1) = 1`, `ways(2) = 2`. Iterate up from there, only keeping the last two values — you don't need an array.\n\nO(n) time, O(1) space.",
    functionName: 'climb_stairs',
    functionSignature: 'def climb_stairs(n: int) -> int:',
    starter: STARTER_HEADER + 'def climb_stairs(n: int) -> int:\n    pass\n',
    examples: [
      { input: [2], expected: 2 },
      { input: [3], expected: 3 },
    ],
    hiddenTests: [
      { input: [1], expected: 1 },
      { input: [5], expected: 8 },
      { input: [10], expected: 89 },
      { input: [20], expected: 10946 },
    ],
  },
  {
    id: 'coin-change',
    number: 17,
    title: 'Coin Change',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "You're given a list of coin denominations `coins` and a target `amount`. Using each coin as many times as you like, return the smallest number of coins whose values sum to `amount`. Return `-1` if no combination works.",
    explanation:
      "Bottom-up DP over the amount. Let `dp[x]` = the minimum coins to make amount `x`. Initialize `dp[0] = 0` and every other `dp[x] = infinity`.\n\nFor each `x` from 1 to `amount`, try every coin `c`. If `c <= x`, then `dp[x] = min(dp[x], dp[x - c] + 1)`. After the table is filled, return `dp[amount]` — or `-1` if it's still infinity.\n\nO(amount × len(coins)) time, O(amount) space. Greedy (always take the largest coin) does not work here — `[1, 3, 4]` for amount 6 needs 2 coins (3+3), but greedy would pick 4+1+1.",
    functionName: 'coin_change',
    functionSignature: 'def coin_change(coins: list[int], amount: int) -> int:',
    starter:
      STARTER_HEADER + 'def coin_change(coins: list[int], amount: int) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 5], 11], expected: 3 },
      { input: [[2], 3], expected: -1 },
      { input: [[1], 0], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1], 1], expected: 1 },
      { input: [[1, 5, 10, 25], 30], expected: 2 },
      { input: [[2, 5, 10, 1], 27], expected: 4 },
    ],
  },
  {
    id: 'longest-increasing-subsequence',
    number: 18,
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "From an integer array `nums`, find the longest subsequence (elements kept in original order, not necessarily adjacent) that is strictly increasing, and return its length.",
    explanation:
      "Two common approaches:\n\n**O(n²) DP**: Let `dp[i]` = length of the longest increasing subsequence ending at index `i`. For each `i`, scan all `j < i`; if `nums[j] < nums[i]`, then `dp[i] = max(dp[i], dp[j] + 1)`. Answer is `max(dp)`. Simple and clear.\n\n**O(n log n) patience sort**: Maintain a list `tails` where `tails[k]` is the smallest possible tail of an increasing subsequence of length `k + 1`. For each new number, binary-search the leftmost tail that's `>= num` and replace it (or append if larger than all). Final length of `tails` is the answer. The list is not the actual subsequence, but its length is correct.",
    functionName: 'length_of_lis',
    functionSignature: 'def length_of_lis(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def length_of_lis(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { input: [[0, 1, 0, 3, 2, 3]], expected: 4 },
      { input: [[7, 7, 7, 7, 7, 7, 7]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[4, 10, 4, 3, 8, 9]], expected: 3 },
    ],
  },
  {
    id: 'word-break',
    number: 19,
    title: 'Word Break',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      'Given a string `s` and a dictionary `word_dict` of allowed words, decide whether `s` can be split into a sequence of one or more dictionary words (reuse allowed). Return `True` or `False`.',
    explanation:
      "DP on prefixes. Let `dp[i]` = whether `s[:i]` is splittable into dictionary words. `dp[0] = True` (empty prefix), and every other `dp[i]` starts `False`.\n\nFor each `i` from 1 to `len(s)`, check every `j < i`: if `dp[j]` is `True` and `s[j:i]` is in the dictionary, set `dp[i] = True` and break.\n\nO(n² × m) where `m` is the average word length (the slice + set lookup). Convert `word_dict` to a `set` first for O(1) membership checks — this is the difference between fast and TLE.",
    functionName: 'word_break',
    functionSignature: 'def word_break(s: str, word_dict: list[str]) -> bool:',
    starter:
      STARTER_HEADER + 'def word_break(s: str, word_dict: list[str]) -> bool:\n    pass\n',
    examples: [
      { input: ['leetcode', ['leet', 'code']], expected: true },
      { input: ['applepenapple', ['apple', 'pen']], expected: true },
      { input: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: false },
    ],
    hiddenTests: [
      { input: ['a', ['a']], expected: true },
      { input: ['ab', ['a', 'b']], expected: true },
      { input: ['cars', ['car', 'ca', 'rs']], expected: true },
    ],
  },
  {
    id: 'combination-sum-4',
    number: 20,
    title: 'Combination Sum IV',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Given a list `nums` of distinct positive integers and a target value `target`, count the number of ordered sequences (permutations matter) whose elements sum to `target`. Each value in `nums` can be reused any number of times.",
    explanation:
      "Because order matters, this is permutations-with-repetition, and the recurrence is straightforward.\n\nLet `dp[t]` = number of ordered sequences summing to `t`. Base case: `dp[0] = 1` (one way: the empty sequence). For each `t` from 1 to `target`, sum `dp[t - num]` over every `num` in `nums` where `num <= t`.\n\nO(target × len(nums)) time, O(target) space. If you swapped the loops (outer over `num`, inner over `t`), you'd be counting unordered combinations instead — be deliberate about loop order.",
    functionName: 'combination_sum4',
    functionSignature: 'def combination_sum4(nums: list[int], target: int) -> int:',
    starter:
      STARTER_HEADER + 'def combination_sum4(nums: list[int], target: int) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3], 4], expected: 7 },
      { input: [[9], 3], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1, 2], 4], expected: 5 },
      { input: [[2, 1, 3], 35], expected: 1132436852 },
    ],
  },
  {
    id: 'house-robber',
    number: 21,
    title: 'House Robber',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      'Houses sit in a row, each holding some non-negative amount of cash given by `nums[i]`. You cannot take from two adjacent houses on the same night. Return the maximum total you can collect.',
    explanation:
      "Classic 1D DP. At each house you choose: take it (and skip the previous) or skip it (and inherit the previous best).\n\nRecurrence: `dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])`. Base cases: `dp[0] = nums[0]`, `dp[1] = max(nums[0], nums[1])`.\n\nYou only ever look back two steps, so collapse to two rolling variables: `prev2` and `prev1`. Walk left to right, updating `new = max(prev1, prev2 + num)`, then shift. O(n) time, O(1) space.",
    functionName: 'rob',
    functionSignature: 'def rob(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def rob(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 1]], expected: 4 },
      { input: [[2, 7, 9, 3, 1]], expected: 12 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[5]], expected: 5 },
      { input: [[2, 1, 1, 2]], expected: 4 },
    ],
  },
  {
    id: 'house-robber-ii',
    number: 22,
    title: 'House Robber II',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Same setup as House Robber, but the houses are arranged in a ring: house `0` and house `n - 1` are neighbors, so you can't take from both. Return the largest amount you can collect.",
    explanation:
      "The circular adjacency only matters between the first and last house. If you rob house 0, you can't rob the last; if you skip house 0, the last is free. That splits the problem into two linear cases.\n\nRun the standard House Robber DP twice: once on `nums[0 : n - 1]` (excluding the last) and once on `nums[1 : n]` (excluding the first). The answer is the max of those two results.\n\nHandle the trivial cases: empty array → 0; single house → `nums[0]`.",
    functionName: 'rob',
    functionSignature: 'def rob(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def rob(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[2, 3, 2]], expected: 3 },
      { input: [[1, 2, 3, 1]], expected: 4 },
      { input: [[1, 2, 3]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[1]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[6, 6, 4, 8, 4, 3, 3, 10]], expected: 27 },
    ],
  },
  {
    id: 'decode-ways',
    number: 23,
    title: 'Decode Ways',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Letters `A..Z` map to the codes `'1'..'26'`. Given a digit string `s`, count how many distinct letter messages encode to exactly that string. Leading-zero codes like `'06'` are invalid.",
    explanation:
      "1D DP over the prefix length. Let `dp[i]` = number of ways to decode `s[:i]`. Set `dp[0] = 1`.\n\nFor each `i` from 1 to `len(s)`:\n- If `s[i - 1] != '0'`, the single-digit decode is valid, so add `dp[i - 1]`.\n- If `i >= 2` and the two-digit value `int(s[i - 2 : i])` is between 10 and 26, the two-digit decode is valid, so add `dp[i - 2]`.\n\nReturn `dp[len(s)]`. The `'0'` cases are the traps: `'0'` alone is undecodable, and `'30'`, `'40'`, etc. have no valid two-digit decode.\n\nO(n) time, collapsible to O(1) space.",
    functionName: 'num_decodings',
    functionSignature: 'def num_decodings(s: str) -> int:',
    starter: STARTER_HEADER + 'def num_decodings(s: str) -> int:\n    pass\n',
    examples: [
      { input: ['12'], expected: 2 },
      { input: ['226'], expected: 3 },
      { input: ['06'], expected: 0 },
    ],
    hiddenTests: [
      { input: ['10'], expected: 1 },
      { input: ['0'], expected: 0 },
      { input: ['11106'], expected: 2 },
    ],
  },
  {
    id: 'unique-paths',
    number: 24,
    title: 'Unique Paths',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "A robot starts in the top-left cell of an `m × n` grid and wants to reach the bottom-right cell. At each step it can move only one cell right or one cell down. Return the number of distinct paths it can take.",
    explanation:
      "Two approaches:\n\n**DP**: Let `dp[r][c]` = paths to reach cell `(r, c)`. The top row and left column are all `1` (only one way: straight). Every other cell: `dp[r][c] = dp[r - 1][c] + dp[r][c - 1]`. Answer is `dp[m - 1][n - 1]`. O(mn) time, O(mn) space (or O(n) with a rolling row).\n\n**Combinatorics**: any path consists of exactly `m - 1` downs and `n - 1` rights, in some order. The count is the binomial coefficient `C(m + n - 2, m - 1)`. O(min(m, n)) time, O(1) space.",
    functionName: 'unique_paths',
    functionSignature: 'def unique_paths(m: int, n: int) -> int:',
    starter: STARTER_HEADER + 'def unique_paths(m: int, n: int) -> int:\n    pass\n',
    examples: [
      { input: [3, 7], expected: 28 },
      { input: [3, 2], expected: 3 },
    ],
    hiddenTests: [
      { input: [1, 1], expected: 1 },
      { input: [7, 3], expected: 28 },
      { input: [10, 10], expected: 48620 },
    ],
  },
  {
    id: 'jump-game',
    number: 25,
    title: 'Jump Game',
    difficulty: 'Medium',
    topic: 'Greedy',
    statement:
      "You start at index 0 of an integer array `nums`. From any index `i` you can jump forward up to `nums[i]` steps. Return `True` if it's possible to reach the final index, `False` otherwise.",
    explanation:
      "Greedy beats DP here. Track the farthest index you've proven reachable so far, call it `reach`.\n\nWalk the array left to right. At each index `i`, if `i > reach` you've hit a wall and can't proceed — return `False`. Otherwise update `reach = max(reach, i + nums[i])`. If you ever reach an index `>= len(nums) - 1`, return `True`.\n\nO(n) time, O(1) space. The intuition: you don't care *how* you got somewhere, only that you could have. A single rolling `reach` captures that.",
    functionName: 'can_jump',
    functionSignature: 'def can_jump(nums: list[int]) -> bool:',
    starter: STARTER_HEADER + 'def can_jump(nums: list[int]) -> bool:\n    pass\n',
    examples: [
      { input: [[2, 3, 1, 1, 4]], expected: true },
      { input: [[3, 2, 1, 0, 4]], expected: false },
    ],
    hiddenTests: [
      { input: [[0]], expected: true },
      { input: [[1]], expected: true },
      { input: [[2, 0, 0]], expected: true },
      { input: [[1, 0, 1, 0]], expected: false },
    ],
  },

  // ===== Graph =====
  {
    id: 'clone-graph',
    number: 26,
    title: 'Clone Graph',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "You're given a connected undirected graph as an adjacency list: `adj[i]` lists the 1-indexed neighbor labels of node `i + 1`. Build and return a fully independent copy — every node and edge duplicated, no shared references with the input.\n\nReturn the new adjacency list in the same format.",
    explanation:
      "In this list-of-lists format, a 'deep copy' just means producing new inner lists that aren't aliased to the originals.\n\nThe simplest correct answer is `[neighbors[:] for neighbors in adj]` (or `copy.deepcopy(adj)`). Each slice makes a new neighbor list independent of the original.\n\nThe deeper learning point is the *real* clone-graph problem: given an actual `Node` object, you must walk the graph (DFS or BFS), creating a new `Node` for every old one and stitching neighbor references together using a `visited` dict mapping `old → new`. That's where the technique shines.",
    functionName: 'clone_graph',
    functionSignature:
      'def clone_graph(adj: list[list[int]]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def clone_graph(adj: list[list[int]]) -> list[list[int]]:\n    # Return a deep copy.\n    pass\n',
    examples: [
      {
        input: [[[2, 4], [1, 3], [2, 4], [1, 3]]],
        expected: [[2, 4], [1, 3], [2, 4], [1, 3]],
      },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[[]]], expected: [[]] },
      { input: [[[2], [1]]], expected: [[2], [1]] },
    ],
  },
  {
    id: 'course-schedule',
    number: 27,
    title: 'Course Schedule',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "There are `num_courses` courses labeled `0` through `num_courses - 1`. Each entry `[a, b]` in `prerequisites` means course `b` must be completed before course `a` can be started.\n\nReturn `True` if some ordering finishes every course, `False` if a cycle makes that impossible.",
    explanation:
      "This is cycle detection on a directed graph. If the prerequisite graph has a cycle, no schedule works. Otherwise it's a DAG, and a valid order exists.\n\n**Kahn's algorithm (BFS topological sort)**: build an indegree count per node. Push every node with indegree 0 into a queue. Pop a node, decrement indegree of its successors; if a successor hits 0, enqueue it. Count the nodes you popped — if it equals `num_courses`, return `True`.\n\n**DFS coloring**: mark each node `unvisited`, `visiting`, or `done`. DFS into `unvisited` nodes; if you hit a `visiting` node, you've found a back-edge (cycle). When DFS completes a node, mark it `done`.",
    functionName: 'can_finish',
    functionSignature:
      'def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:',
    starter:
      STARTER_HEADER +
      'def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:\n    pass\n',
    examples: [
      { input: [2, [[1, 0]]], expected: true },
      { input: [2, [[1, 0], [0, 1]]], expected: false },
    ],
    hiddenTests: [
      { input: [1, []], expected: true },
      { input: [3, [[1, 0], [2, 1]]], expected: true },
      { input: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true },
    ],
  },
  {
    id: 'pacific-atlantic',
    number: 28,
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "An `m × n` grid of integer heights represents an island. The top and left edges touch the Pacific; the bottom and right edges touch the Atlantic. Water flows from a cell to any neighbor at equal or lower height.\n\nReturn every cell `[r, c]` from which water can drain to *both* oceans. Order does not matter.",
    explanation:
      "Don't simulate downhill flow from every cell — flip the problem. Start at the ocean edges and walk *uphill* into the interior. Any cell you can reach is a cell whose water could have flowed *down* to that ocean.\n\nRun two searches:\n\n1. DFS or BFS from every cell on the Pacific border (top row + left column), only stepping to neighbors with height `>=` the current cell. Mark all reachable cells in a `pacific` set.\n2. Same from the Atlantic border (bottom row + right column) into an `atlantic` set.\n\nThe answer is the intersection: cells in both sets. O(mn) time, O(mn) space.",
    functionName: 'pacific_atlantic',
    functionSignature:
      'def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:\n    # Return coordinates in any order; grader accepts any permutation.\n    pass\n',
    examples: [
      {
        input: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]],
        expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]],
      },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: [[0, 0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]] },
    ],
  },
  {
    id: 'num-islands',
    number: 29,
    title: 'Number of Islands',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "An `m × n` grid uses the character `'1'` for land and `'0'` for water. An island is a maximal group of land cells connected horizontally or vertically (no diagonals). Anything off the grid is water.\n\nReturn the number of islands.",
    explanation:
      "A flood-fill problem. Walk the grid; every time you encounter unvisited land, that's a new island — flood-fill from it to mark every connected land cell as visited, then keep scanning.\n\n**DFS implementation**: define `visit(r, c)` that returns if out of bounds or non-land or already visited, then marks the cell (you can mutate the grid to `'0'` in place to avoid a visited set), then recurses into the four neighbors.\n\nLoop over every cell. If it's `'1'`, increment your counter and call `visit`. O(mn) time, O(mn) recursion depth in the worst case (mutating in place saves the visited-set memory).",
    functionName: 'num_islands',
    functionSignature: 'def num_islands(grid: list[list[str]]) -> int:',
    starter:
      STARTER_HEADER + 'def num_islands(grid: list[list[str]]) -> int:\n    pass\n',
    examples: [
      {
        input: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]],
        expected: 1,
      },
      {
        input: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]],
        expected: 3,
      },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[['0']]], expected: 0 },
      { input: [[['1']]], expected: 1 },
    ],
  },
  {
    id: 'longest-consecutive',
    number: 30,
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    topic: 'Array',
    statement:
      "Given an unsorted list of integers `nums`, find the length of the longest run of consecutive integers that appear (ignoring duplicates). The runtime must be `O(n)`.",
    explanation:
      "Sorting would be O(n log n), so use a set instead.\n\nDrop all numbers into a `set`. Now walk every number `x` in the set, but only start counting from a number that is the *beginning* of a run — i.e. `x - 1` is not in the set. From such a start, walk forward: `x, x + 1, x + 2, ...` while each next value is in the set, tallying the length. Track the overall max.\n\nThe 'only start from a run beginning' check is what makes this O(n) instead of O(n²): every value is visited at most twice — once in the outer loop, once during a run walk.",
    functionName: 'longest_consecutive',
    functionSignature: 'def longest_consecutive(nums: list[int]) -> int:',
    starter:
      STARTER_HEADER + 'def longest_consecutive(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { input: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]], expected: 7 },
    ],
  },

  // ===== Interval =====
  {
    id: 'insert-interval',
    number: 31,
    title: 'Insert Interval',
    difficulty: 'Medium',
    topic: 'Interval',
    statement:
      'You are given `intervals`, a list of non-overlapping `[start, end]` pairs sorted by `start`, and a new pair `new_interval`. Add `new_interval` into the list, merging it with any intervals it touches or overlaps, and return the resulting list (still sorted by `start`).',
    explanation:
      "Walk the existing intervals once and place each into one of three buckets:\n\n1. **Ends before `new_interval` starts** → keep it as-is (it's entirely to the left).\n2. **Starts after `new_interval` ends** → keep it as-is (entirely to the right).\n3. **Overlaps** → swallow it into `new_interval` by updating `new_interval = [min(starts), max(ends)]`.\n\nAfter the walk, append the (possibly grown) `new_interval` in its correct position between the left-bucket and right-bucket. O(n) time, single pass.",
    functionName: 'insert',
    functionSignature:
      'def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:\n    pass\n',
    examples: [
      { input: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] },
      {
        input: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]],
        expected: [[1, 2], [3, 10], [12, 16]],
      },
    ],
    hiddenTests: [
      { input: [[], [5, 7]], expected: [[5, 7]] },
      { input: [[[1, 5]], [2, 3]], expected: [[1, 5]] },
      { input: [[[1, 5]], [6, 8]], expected: [[1, 5], [6, 8]] },
    ],
  },
  {
    id: 'merge-intervals',
    number: 32,
    title: 'Merge Intervals',
    difficulty: 'Medium',
    topic: 'Interval',
    statement:
      'Given a list of `[start, end]` intervals in any order, merge every group of intervals that overlap or touch, and return the merged set of non-overlapping intervals.',
    explanation:
      "Sort the intervals by `start`. After sorting, overlapping intervals are guaranteed to be adjacent.\n\nWalk the sorted list with a `merged` accumulator. For each interval, peek at `merged[-1]`. If its end is `>=` the current interval's start, the two overlap — extend the previous's end to `max(prev_end, cur_end)`. Otherwise the current interval is disjoint — append it as a new entry.\n\nO(n log n) total, dominated by the sort.",
    functionName: 'merge_intervals',
    functionSignature:
      'def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
      },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
    ],
    hiddenTests: [
      { input: [[[1, 4], [0, 4]]], expected: [[0, 4]] },
      { input: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: 'non-overlapping-intervals',
    number: 33,
    title: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    topic: 'Interval',
    statement:
      'Given a list of `[start, end]` intervals, return the smallest number of intervals you must remove so that the survivors are all pairwise non-overlapping. Two intervals that merely touch at an endpoint (e.g. `[1,2]` and `[2,3]`) are not considered to overlap.',
    explanation:
      "Classic interval-scheduling: maximize the number of compatible intervals you keep, then the deletions follow.\n\nSort the intervals by their `end` value. Walk through; greedily keep an interval whenever its `start` is `>=` the end of the last kept interval. Every interval not kept must be removed.\n\nSorting by end (not start) is what makes the greedy optimal: at each step you free up the most future room. Total time: O(n log n) for the sort, plus O(n) for the scan.",
    functionName: 'erase_overlap_intervals',
    functionSignature:
      'def erase_overlap_intervals(intervals: list[list[int]]) -> int:',
    starter:
      STARTER_HEADER +
      'def erase_overlap_intervals(intervals: list[list[int]]) -> int:\n    pass\n',
    examples: [
      { input: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
      { input: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
      { input: [[[1, 2], [2, 3]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2 },
    ],
  },

  // ===== Linked List =====
  // (Linked lists are represented as Python lists in this exec environment;
  // problems convert internally where needed.)
  {
    id: 'reverse-linked-list',
    number: 34,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    statement:
      "Given the values of a singly linked list (represented here as a regular Python list), produce the values in reverse order. Return the result as a Python list.",
    explanation:
      "Since the input is a flat list, the trivial answer is `list(reversed(head))` or `head[::-1]`. The interesting version of this problem assumes a real linked-list of `Node` objects.\n\nFor the real version, use the three-pointer iterative pattern:\n\n1. Keep `prev = None`, `cur = head`.\n2. While `cur` is not `None`: save `next_node = cur.next`, point `cur.next = prev`, advance `prev = cur`, then `cur = next_node`.\n3. When the loop ends, `prev` is the new head.\n\nO(n) time, O(1) space. The recursive form also exists but burns stack proportional to list length.",
    functionName: 'reverse_list',
    functionSignature: 'def reverse_list(head: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def reverse_list(head: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { input: [[1, 2]], expected: [2, 1] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[1]], expected: [1] },
      { input: [[1, 1, 1]], expected: [1, 1, 1] },
    ],
  },
  {
    id: 'linked-list-cycle',
    number: 35,
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    topic: 'Linked List',
    statement:
      "You're given the node values of a singly linked list and an integer `pos`. If `pos >= 0`, the list's tail node is wired back to the node at index `pos`, forming a cycle. If `pos == -1`, the list has no cycle. Return `True` if a cycle exists, `False` otherwise.",
    explanation:
      "Since you're given `pos` directly, you could just return `pos != -1`. But the algorithmic point is Floyd's tortoise-and-hare for an actual linked structure.\n\n**Floyd's cycle detection**: keep two pointers, `slow` and `fast`, both starting at the head. Each step, advance `slow` by one node and `fast` by two. If `fast` ever reaches `None`, there's no cycle. If `slow` and `fast` ever land on the same node, you've detected a cycle (the fast pointer eventually laps the slow one inside the loop).\n\nO(n) time, O(1) space. The alternative — hashing every visited node — works but uses O(n) memory.",
    functionName: 'has_cycle',
    functionSignature: 'def has_cycle(values: list[int], pos: int) -> bool:',
    starter:
      STARTER_HEADER +
      'def has_cycle(values: list[int], pos: int) -> bool:\n    pass\n',
    examples: [
      { input: [[3, 2, 0, -4], 1], expected: true },
      { input: [[1, 2], 0], expected: true },
      { input: [[1], -1], expected: false },
    ],
    hiddenTests: [
      { input: [[], -1], expected: false },
      { input: [[1], 0], expected: true },
      { input: [[1, 2, 3], -1], expected: false },
    ],
  },
  {
    id: 'merge-two-sorted-lists',
    number: 36,
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: 'Linked List',
    statement:
      'Two non-decreasing lists `l1` and `l2` are given as Python lists. Combine them into a single non-decreasing list and return it.',
    explanation:
      "Two-pointer merge — the same step used inside merge sort.\n\nKeep `i = 0` for `l1` and `j = 0` for `l2`. While both indices are in range, compare `l1[i]` and `l2[j]`. Append the smaller to your result and advance that pointer. Once one list is exhausted, append the remainder of the other.\n\nO(n + m) time, O(n + m) for the result. With real linked-list nodes, the same logic works with a dummy head node and a `tail` pointer, splicing nodes one at a time without allocating new ones.",
    functionName: 'merge_two_lists',
    functionSignature:
      'def merge_two_lists(l1: list[int], l2: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def merge_two_lists(l1: list[int], l2: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
      { input: [[], []], expected: [] },
      { input: [[], [0]], expected: [0] },
    ],
    hiddenTests: [
      { input: [[5], [1, 2, 4]], expected: [1, 2, 4, 5] },
      { input: [[1, 2, 3], [4, 5, 6]], expected: [1, 2, 3, 4, 5, 6] },
    ],
  },
  {
    id: 'remove-nth-node',
    number: 37,
    title: 'Remove Nth Node From End of List',
    difficulty: 'Medium',
    topic: 'Linked List',
    statement:
      "Given the values of a singly linked list `head` (as a Python list) and a positive integer `n`, delete the node that sits `n` positions before the end and return the resulting list. `n` is always valid for the given input.",
    explanation:
      "For the Python-list version, the index of the node to remove is `len(head) - n`; slice it out.\n\nThe technique being taught is the **two-pointer gap trick** for real linked lists:\n\n1. Use a dummy node before `head` so removing the first node is uniform.\n2. Place `fast` at the dummy and advance it `n + 1` steps.\n3. Place `slow` at the dummy. Move both pointers together until `fast` falls off the end.\n4. At that point `slow.next` is the node to remove. Reroute `slow.next = slow.next.next`.\n\nOne pass, O(n) time, O(1) space — no need to first compute the length.",
    functionName: 'remove_nth_from_end',
    functionSignature:
      'def remove_nth_from_end(head: list[int], n: int) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def remove_nth_from_end(head: list[int], n: int) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { input: [[1], 1], expected: [] },
      { input: [[1, 2], 1], expected: [1] },
    ],
    hiddenTests: [
      { input: [[1, 2], 2], expected: [2] },
      { input: [[1, 2, 3], 3], expected: [2, 3] },
    ],
  },
  {
    id: 'reorder-list',
    number: 38,
    title: 'Reorder List',
    difficulty: 'Medium',
    topic: 'Linked List',
    statement:
      'Given the values of a singly linked list, weave them so the result alternates from the outside in: first value, last value, second value, second-to-last value, and so on. Return the woven sequence as a Python list.',
    explanation:
      "Three-step pattern, both for the Python-list version and the real linked-list version:\n\n1. **Find the middle**: use slow/fast pointers (slow steps one, fast steps two). When fast falls off, slow is at (or just past) the middle.\n2. **Reverse the back half**: standard iterative reverse on the slice starting at slow.\n3. **Interleave**: walk the front half and the reversed back half in lockstep, appending one node from each alternately until both run out.\n\nO(n) time, O(1) space if you do it in place. The cute Python-only version just uses two indices walking inward from both ends.",
    functionName: 'reorder_list',
    functionSignature: 'def reorder_list(head: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def reorder_list(head: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
      { input: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[1, 2]], expected: [1, 2] },
    ],
  },

  // ===== Matrix =====
  {
    id: 'set-matrix-zeroes',
    number: 39,
    title: 'Set Matrix Zeroes',
    difficulty: 'Medium',
    topic: 'Matrix',
    statement:
      "Given an `m × n` integer matrix, for every cell that equals `0`, set every other cell in that cell's row and column to `0`. Return the resulting matrix.",
    explanation:
      "The naive trap: zeroing out cells as you find them turns the rest of your scan into garbage. Two clean approaches:\n\n**O(m + n) extra space**: pre-scan to collect which rows and which columns contain a zero (two sets). Then do a second pass — set a cell to zero if its row or column is in either set.\n\n**O(1) extra space**: use the first row and first column themselves as zero flags. Pre-record whether the first row / first column originally contained any zero. Then scan the interior — when you see a `0`, also zero `matrix[i][0]` and `matrix[0][j]`. In a second pass, zero any interior cell whose row-flag or column-flag is set. Finally, zero the first row and column if their original flag was set.",
    functionName: 'set_zeroes',
    functionSignature:
      'def set_zeroes(matrix: list[list[int]]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def set_zeroes(matrix: list[list[int]]) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]],
        expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
      },
      {
        input: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]],
        expected: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]],
      },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: [[1]] },
      { input: [[[0]]], expected: [[0]] },
      { input: [[[1, 2, 3]]], expected: [[1, 2, 3]] },
    ],
  },
  {
    id: 'spiral-matrix',
    number: 40,
    title: 'Spiral Matrix',
    difficulty: 'Medium',
    topic: 'Matrix',
    statement:
      'Read every value in an `m × n` matrix in clockwise spiral order, starting from the top-left corner and tightening inward. Return the values as a single list.',
    explanation:
      "Maintain four boundaries: `top`, `bottom`, `left`, `right`. Each pass of the spiral peels one layer:\n\n1. Walk left → right along `top`, then `top += 1`.\n2. Walk top → bottom along `right`, then `right -= 1`.\n3. If `top <= bottom`, walk right → left along `bottom`, then `bottom -= 1`.\n4. If `left <= right`, walk bottom → top along `left`, then `left += 1`.\n\nLoop until `top > bottom` or `left > right`. The two guarded passes are crucial — without them, a non-square matrix re-visits cells. O(mn) time.",
    functionName: 'spiral_order',
    functionSignature: 'def spiral_order(matrix: list[list[int]]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def spiral_order(matrix: list[list[int]]) -> list[int]:\n    pass\n',
    examples: [
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [1, 2, 3, 6, 9, 8, 7, 4, 5],
      },
      {
        input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]],
        expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7],
      },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: [1] },
      { input: [[[1, 2], [3, 4]]], expected: [1, 2, 4, 3] },
    ],
  },
  {
    id: 'rotate-image',
    number: 41,
    title: 'Rotate Image',
    difficulty: 'Medium',
    topic: 'Matrix',
    statement:
      'An `n × n` integer matrix represents an image. Rotate the matrix 90° clockwise, in place, and return it. (For grading purposes the returned matrix is what counts.)',
    explanation:
      "The cleanest 90° clockwise rotation: **transpose, then reverse each row.**\n\nTranspose swaps rows and columns: for `i in range(n)` and `j in range(i + 1, n)`, swap `matrix[i][j]` with `matrix[j][i]`. After this step, the image is flipped over its main diagonal.\n\nThen reverse each row in place: `row.reverse()`. That delivers the clockwise rotation.\n\nWalking it on a 3×3 example by hand makes this click. O(n²) time, O(1) extra space.",
    functionName: 'rotate',
    functionSignature: 'def rotate(matrix: list[list[int]]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def rotate(matrix: list[list[int]]) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]],
      },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: [[1]] },
      { input: [[[1, 2], [3, 4]]], expected: [[3, 1], [4, 2]] },
    ],
  },
  {
    id: 'word-search',
    number: 42,
    title: 'Word Search',
    difficulty: 'Medium',
    topic: 'Matrix',
    statement:
      "Given a 2D `board` of single characters and a target `word`, return `True` if the word can be spelled by walking from cell to cell. Each step must go to a horizontally or vertically adjacent cell, and no cell may be reused within one path.",
    explanation:
      "Backtracking DFS. Try starting from every cell whose letter matches `word[0]`; from each candidate, explore the grid letter by letter.\n\nWrite a recursive helper `dfs(r, c, i)` that returns `True` if `word[i:]` can be matched starting at `(r, c)`. Base case: if `i == len(word)`, return `True`. Otherwise check bounds and that the cell matches `word[i]`. To prevent reuse, temporarily mutate the cell (e.g. set it to `'#'`), recurse into the four neighbors, then restore the original letter on the way out.\n\nWorst case O(m × n × 4^L) where L is the word length, but pruning makes it practical.",
    functionName: 'exist',
    functionSignature: 'def exist(board: list[list[str]], word: str) -> bool:',
    starter:
      STARTER_HEADER + 'def exist(board: list[list[str]], word: str) -> bool:\n    pass\n',
    examples: [
      {
        input: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'],
        expected: true,
      },
      {
        input: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'],
        expected: true,
      },
      {
        input: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'],
        expected: false,
      },
    ],
    hiddenTests: [
      { input: [[['A']], 'A'], expected: true },
      { input: [[['A']], 'B'], expected: false },
    ],
  },

  // ===== String =====
  {
    id: 'longest-substring-no-repeat',
    number: 43,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    statement:
      "Given a string `s`, find the longest contiguous substring whose characters are all distinct, and return its length.",
    explanation:
      "Sliding window with a hash map.\n\nKeep two indices, `left` and `right`, both starting at 0, plus a dict mapping `character → last seen index`. Walk `right` forward across the string. When you see `s[right]`:\n\n- If the character is already in the dict with index `>= left`, jump `left` to `dict[char] + 1` (anything to the left is now stale).\n- Record `dict[s[right]] = right`.\n- Update the answer with `right - left + 1`.\n\nO(n) time, O(min(n, alphabet)) space. Each character enters and leaves the window at most once.",
    functionName: 'length_of_longest_substring',
    functionSignature: 'def length_of_longest_substring(s: str) -> int:',
    starter:
      STARTER_HEADER + 'def length_of_longest_substring(s: str) -> int:\n    pass\n',
    examples: [
      { input: ['abcabcbb'], expected: 3 },
      { input: ['bbbbb'], expected: 1 },
      { input: ['pwwkew'], expected: 3 },
    ],
    hiddenTests: [
      { input: [''], expected: 0 },
      { input: [' '], expected: 1 },
      { input: ['au'], expected: 2 },
      { input: ['dvdf'], expected: 3 },
    ],
  },
  {
    id: 'longest-repeating-char-replacement',
    number: 44,
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    statement:
      "You're given an uppercase string `s` and an integer `k`. You may replace up to `k` characters with any other uppercase letters. Return the length of the longest contiguous run of one repeating letter you can produce.",
    explanation:
      "Sliding window. A window of length `L` can be made uniform if and only if `L - (most frequent letter's count in the window) <= k` — those are the slots that need to be replaced.\n\nKeep counts per letter as a dict, plus `left = 0` and a running `max_freq` for the most common letter in the current window. Slide `right` forward, incrementing `counts[s[right]]` and possibly bumping `max_freq`.\n\nIf `(right - left + 1) - max_freq > k`, the window can't be made uniform — shrink from the left: `counts[s[left]] -= 1`, `left += 1`. Track the best `right - left + 1` seen.\n\nO(n) time, O(26) space. Note: you don't need to lower `max_freq` when shrinking — the answer doesn't depend on a perfectly fresh max, just the historical one.",
    functionName: 'character_replacement',
    functionSignature: 'def character_replacement(s: str, k: int) -> int:',
    starter:
      STARTER_HEADER +
      'def character_replacement(s: str, k: int) -> int:\n    pass\n',
    examples: [
      { input: ['ABAB', 2], expected: 4 },
      { input: ['AABABBA', 1], expected: 4 },
    ],
    hiddenTests: [
      { input: ['A', 0], expected: 1 },
      { input: ['ABBB', 2], expected: 4 },
      { input: ['ABCDE', 1], expected: 2 },
    ],
  },
  {
    id: 'minimum-window-substring',
    number: 45,
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    topic: 'Sliding Window',
    statement:
      "Given strings `s` and `t`, find the shortest contiguous substring of `s` that contains every character of `t`, respecting multiplicity (if `t = 'aab'`, the window must include at least two `a`s and one `b`). Return that substring, or an empty string if `s` doesn't have enough characters.",
    explanation:
      "Two-pointer sliding window with character counts.\n\nBuild `need = Counter(t)` and `missing = len(t)` (how many characters from `t` are still unsatisfied). Walk `right` across `s`. For each character: if `need[c] > 0`, decrement `missing`; either way decrement `need[c]` (it can go negative, meaning surplus).\n\nWhen `missing == 0`, the window covers `t`. Now shrink from the left to find the tightest window. Move `left` forward, incrementing `need[s[left]]` as you leave each character; when `need[c]` goes back above 0, that character is again required — record the window and break out of the inner loop. Continue scanning `right`.\n\nKeep the smallest window seen. O(n) time.",
    functionName: 'min_window',
    functionSignature: 'def min_window(s: str, t: str) -> str:',
    starter: STARTER_HEADER + 'def min_window(s: str, t: str) -> str:\n    pass\n',
    examples: [
      { input: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
      { input: ['a', 'a'], expected: 'a' },
      { input: ['a', 'aa'], expected: '' },
    ],
    hiddenTests: [
      { input: ['', 'a'], expected: '' },
      { input: ['abc', 'b'], expected: 'b' },
      { input: ['cabwefgewcwaefgcf', 'cae'], expected: 'cwae' },
    ],
  },
  {
    id: 'valid-anagram',
    number: 46,
    title: 'Valid Anagram',
    difficulty: 'Easy',
    topic: 'String',
    statement:
      'Return `True` if string `t` is a rearrangement of the characters of string `s` (an anagram), `False` otherwise.',
    explanation:
      "Two clean approaches:\n\n1. **Sort both**: `sorted(s) == sorted(t)`. O(n log n) time, O(n) space. Compact one-liner.\n\n2. **Character counts**: build `Counter(s)` and `Counter(t)`; compare. Or use a single dict — increment for each character in `s`, decrement for each in `t`. If any count ends non-zero, return `False`. O(n) time, O(alphabet) space.\n\nFor pure ASCII, a fixed-size array of length 26 (or 128) is fastest. For unicode, use a dict.",
    functionName: 'is_anagram',
    functionSignature: 'def is_anagram(s: str, t: str) -> bool:',
    starter: STARTER_HEADER + 'def is_anagram(s: str, t: str) -> bool:\n    pass\n',
    examples: [
      { input: ['anagram', 'nagaram'], expected: true },
      { input: ['rat', 'car'], expected: false },
    ],
    hiddenTests: [
      { input: ['', ''], expected: true },
      { input: ['a', 'a'], expected: true },
      { input: ['ab', 'a'], expected: false },
      { input: ['aa', 'bb'], expected: false },
    ],
  },
  {
    id: 'group-anagrams',
    number: 47,
    title: 'Group Anagrams',
    difficulty: 'Medium',
    topic: 'String',
    statement:
      "Given a list of strings `strs`, cluster strings that are anagrams of each other into groups. Inside each group, sort the strings alphabetically. Then sort the overall list of groups by each group's first string.",
    explanation:
      "Use a fingerprint that all anagrams of one word share. Two common choices:\n\n- **Sorted string**: `''.join(sorted(word))`. Anagrams always produce the same sorted spelling. Easy to write, O(L log L) per word.\n- **Character count tuple**: a 26-int tuple counting each letter, used as a dict key. O(L) per word, faster but slightly more code.\n\nWalk the input once, grouping words by fingerprint in a `defaultdict(list)`. Then sort each bucket and emit the buckets sorted by `bucket[0]`.\n\nO(N · L log L) total time with the sorted-string fingerprint, where N is word count and L is average length.",
    functionName: 'group_anagrams',
    functionSignature:
      'def group_anagrams(strs: list[str]) -> list[list[str]]:',
    starter:
      STARTER_HEADER +
      "def group_anagrams(strs: list[str]) -> list[list[str]]:\n    # Tip: sort each inner group and then sort the outer list by group[0].\n    pass\n",
    examples: [
      {
        input: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']],
        expected: [['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']],
      },
      { input: [['']], expected: [['']] },
      { input: [['a']], expected: [['a']] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [['ab', 'ba']], expected: [['ab', 'ba']] },
    ],
  },
  {
    id: 'valid-parentheses',
    number: 48,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    statement:
      "A string `s` contains only the six bracket characters `()[]{}`. Return `True` if every open bracket is closed by a matching bracket of the same type, and brackets close in the proper nested order. Return `False` otherwise. An empty string counts as valid.",
    explanation:
      "Classic stack problem.\n\nMaintain a stack of expected closers. Walk `s` character by character. If the character is an opener (`(`, `[`, `{`), push the corresponding closer (`)`, `]`, `}`). If it's a closer, peek at the top of the stack — if the stack is empty or the top doesn't match, return `False`; otherwise pop.\n\nAt the end, return `True` only if the stack is empty (no unclosed openers left). O(n) time, O(n) space.\n\nA clean way to express the pair lookup is a dict like `pairs = {')': '(', ']': '[', '}': '{'}`.",
    functionName: 'is_valid',
    functionSignature: 'def is_valid(s: str) -> bool:',
    starter: STARTER_HEADER + 'def is_valid(s: str) -> bool:\n    pass\n',
    examples: [
      { input: ['()'], expected: true },
      { input: ['()[]{}'], expected: true },
      { input: ['(]'], expected: false },
    ],
    hiddenTests: [
      { input: [''], expected: true },
      { input: ['['], expected: false },
      { input: [']'], expected: false },
      { input: ['([{}])'], expected: true },
    ],
  },
  {
    id: 'valid-palindrome',
    number: 49,
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    topic: 'String',
    statement:
      "Treat letters case-insensitively and ignore anything that isn't a letter or digit. After that filtering, return `True` if the string reads identically forwards and backwards; otherwise `False`. An empty (or all-non-alphanumeric) input counts as a palindrome.",
    explanation:
      "Two equally valid approaches:\n\n1. **Filter then compare**: build `filtered = [c.lower() for c in s if c.isalnum()]` and check `filtered == filtered[::-1]`. Crisp two-liner, O(n) time and space.\n\n2. **Two pointers in place**: keep `left = 0`, `right = len(s) - 1`. Skip non-alphanumeric characters from either side. When both point at valid characters, compare lowercased; mismatch → return `False`. Move both inward. When `left >= right`, return `True`. O(n) time, O(1) space — preferred in an interview.",
    functionName: 'is_palindrome',
    functionSignature: 'def is_palindrome(s: str) -> bool:',
    starter: STARTER_HEADER + 'def is_palindrome(s: str) -> bool:\n    pass\n',
    examples: [
      { input: ['A man, a plan, a canal: Panama'], expected: true },
      { input: ['race a car'], expected: false },
      { input: [' '], expected: true },
    ],
    hiddenTests: [
      { input: [''], expected: true },
      { input: ['a'], expected: true },
      { input: ['0P'], expected: false },
    ],
  },
  {
    id: 'longest-palindromic-substring',
    number: 50,
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    topic: 'String',
    statement:
      "Given a string `s`, return any longest contiguous substring of `s` that is a palindrome. If several substrings tie for the maximum length, any one of them is accepted.",
    explanation:
      "**Expand-around-center** is the cleanest O(n²) solution.\n\nEvery palindrome has a center: either a single character (odd length) or a pair of identical characters (even length). For each index `i` from 0 to `n - 1`, run two expansions:\n\n1. Odd: `left = i`, `right = i`, expand outward while characters match.\n2. Even: `left = i`, `right = i + 1`, same.\n\nEach expansion returns a candidate substring; track the longest seen. There are 2n − 1 centers and each expansion is O(n) at worst, giving O(n²) overall, O(1) extra space.\n\nManacher's algorithm gets it to O(n) but is rarely required in an interview.",
    functionName: 'longest_palindrome',
    functionSignature: 'def longest_palindrome(s: str) -> str:',
    starter:
      STARTER_HEADER + 'def longest_palindrome(s: str) -> str:\n    pass\n',
    examples: [
      { input: ['babad'], expected: 'bab' },
      { input: ['cbbd'], expected: 'bb' },
    ],
    hiddenTests: [
      { input: ['a'], expected: 'a' },
      { input: ['ac'], expected: 'a' },
      { input: ['racecar'], expected: 'racecar' },
    ],
  },
  {
    id: 'palindromic-substrings',
    number: 51,
    title: 'Palindromic Substrings',
    difficulty: 'Medium',
    topic: 'String',
    statement:
      "Given a string `s`, count how many of its contiguous substrings are palindromes. Substrings at different positions count separately, even if they spell the same word.",
    explanation:
      "Same expand-around-center technique used by *longest palindromic substring*, but here you count instead of measure.\n\nFor each center (every index for odd-length palindromes, every gap between indices for even-length), expand outward while characters match. Each successful expansion contributes one palindromic substring to the total. Stop when characters disagree or you run off either end.\n\n2n − 1 centers × up to O(n) expansion each = O(n²) time, O(1) extra space. The naive 'check every substring' is also O(n²) substrings but each check is O(n), giving O(n³); the center expansion is a strict improvement.",
    functionName: 'count_substrings',
    functionSignature: 'def count_substrings(s: str) -> int:',
    starter:
      STARTER_HEADER + 'def count_substrings(s: str) -> int:\n    pass\n',
    examples: [
      { input: ['abc'], expected: 3 },
      { input: ['aaa'], expected: 6 },
    ],
    hiddenTests: [
      { input: ['a'], expected: 1 },
      { input: ['aa'], expected: 3 },
      { input: ['abba'], expected: 6 },
    ],
  },
  {
    id: 'encode-decode-strings',
    number: 52,
    title: 'Encode and Decode Strings',
    difficulty: 'Medium',
    topic: 'String',
    statement:
      "Design two functions, `encode(strs)` and `decode(s)`, that round-trip a list of arbitrary strings through a single string. The challenge: any character (including delimiters you might pick) could appear inside the inputs. The graded wrapper `round_trip(strs)` simply returns `decode(encode(strs))` and must equal `strs`.",
    explanation:
      "Length-prefix every string. That way the encoded form is unambiguous regardless of what characters live inside the inputs.\n\n**Encode**: for each `s`, emit `f'{len(s)}#{s}'` (or use any unambiguous terminator like a colon). Concatenate all of those into one string.\n\n**Decode**: maintain a cursor `i`. Find the next `#` starting at `i` — the digits between `i` and `#` give the length `n`. Read exactly `n` characters after the `#` as the next string, advance `i` past them, repeat.\n\nDelimiter-only schemes (e.g. comma-separated) break the moment a comma appears in the data. The length prefix sidesteps that completely. O(total_length) time and space.",
    functionName: 'round_trip',
    functionSignature: 'def round_trip(strs: list[str]) -> list[str]:',
    starter:
      STARTER_HEADER +
      "def encode(strs):\n    # length-prefix each string\n    return ''.join(f'{len(s)}#{s}' for s in strs)\n\ndef decode(s):\n    out, i = [], 0\n    while i < len(s):\n        j = s.find('#', i)\n        n = int(s[i:j])\n        out.append(s[j+1:j+1+n])\n        i = j + 1 + n\n    return out\n\ndef round_trip(strs: list[str]) -> list[str]:\n    return decode(encode(strs))\n",
    examples: [
      { input: [['lint', 'code', 'love', 'you']], expected: ['lint', 'code', 'love', 'you'] },
      { input: [['we', 'say', ':', 'yes']], expected: ['we', 'say', ':', 'yes'] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [['']], expected: [''] },
      { input: [['', 'a', '']], expected: ['', 'a', ''] },
    ],
  },

  // ===== Tree =====
  // Trees use level-order (BFS) array representation with null for missing nodes.
  {
    id: 'max-depth-binary-tree',
    number: 53,
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "A binary tree is encoded here as a level-order array with `None` for missing nodes. Return the tree's maximum depth — the number of nodes on the longest root-to-leaf path. An empty tree has depth 0.",
    explanation:
      "Two angles:\n\n**Reasoning on the encoded array**: in level-order, the deepest non-`None` slot at index `k` lives on level `floor(log2(k + 1))`. Walk the array, track the highest such level among real nodes, and return `level + 1`. Watch the corner case of an empty array.\n\n**Convert and recurse (cleaner if you build a node tree)**: build actual `Node` objects from the level-order array, then `depth(node) = 1 + max(depth(left), depth(right))`, with `depth(None) = 0`. Iterative BFS counting levels also works.\n\nO(n) time either way.",
    functionName: 'max_depth',
    functionSignature: 'def max_depth(root: list) -> int:',
    starter:
      STARTER_HEADER +
      'def max_depth(root: list) -> int:\n    # root is a level-order array; None marks missing nodes.\n    pass\n',
    examples: [
      { input: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { input: [[1, null, 2]], expected: 2 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1]], expected: 1 },
      { input: [[1, 2, 3, 4, 5, 6, 7]], expected: 3 },
    ],
  },
  {
    id: 'same-tree',
    number: 54,
    title: 'Same Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      'Two binary trees are passed as level-order arrays with `None` for missing nodes. Return `True` if the trees have the same shape *and* the same value at every corresponding position, otherwise `False`.',
    explanation:
      "Two angles:\n\n**Direct array compare** (works because the encoding includes `None` for missing nodes): `return p == q`. Two trees with the same structure and values produce the same level-order array under this scheme.\n\n**Recursive on a real tree** (the underlying interview answer): write `same(a, b)` that returns `True` if both `None`; `False` if exactly one is `None` or `a.val != b.val`; otherwise `same(a.left, b.left) and same(a.right, b.right)`.\n\nO(n) time, O(h) recursion depth.",
    functionName: 'is_same_tree',
    functionSignature: 'def is_same_tree(p: list, q: list) -> bool:',
    starter:
      STARTER_HEADER +
      'def is_same_tree(p: list, q: list) -> bool:\n    pass\n',
    examples: [
      { input: [[1, 2, 3], [1, 2, 3]], expected: true },
      { input: [[1, 2], [1, null, 2]], expected: false },
      { input: [[1, 2, 1], [1, 1, 2]], expected: false },
    ],
    hiddenTests: [
      { input: [[], []], expected: true },
      { input: [[1], [1]], expected: true },
      { input: [[1], [2]], expected: false },
    ],
  },
  {
    id: 'invert-binary-tree',
    number: 55,
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "Given a binary tree as a level-order array (with `None` for missing nodes), swap the left and right child of every node so the tree becomes the mirror image of itself. Return the inverted tree as a level-order array.",
    explanation:
      "The interview-style recursive answer on a node tree: swap children, then recurse.\n\n```\ndef invert(node):\n    if node is None:\n        return None\n    node.left, node.right = invert(node.right), invert(node.left)\n    return node\n```\n\nFor this problem's level-order array encoding, the cleanest path is: rebuild the node tree from the array, invert it recursively, then re-serialize back to level-order using BFS (skipping over `None` parents but emitting `None` for their slots).\n\nO(n) time, O(h) recursion depth.",
    functionName: 'invert_tree',
    functionSignature: 'def invert_tree(root: list) -> list:',
    starter:
      STARTER_HEADER + 'def invert_tree(root: list) -> list:\n    pass\n',
    examples: [
      { input: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
      { input: [[2, 1, 3]], expected: [2, 3, 1] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[1]], expected: [1] },
      { input: [[1, null, 2]], expected: [1, 2] },
    ],
  },
  {
    id: 'binary-tree-max-path-sum',
    number: 56,
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    topic: 'Tree',
    statement:
      "Given a binary tree (encoded as a level-order array with `None` for missing nodes), find the largest possible sum along any path connecting two nodes through the tree. A path is a sequence of nodes connected by edges, doesn't have to pass through the root, and must have at least one node.",
    explanation:
      "Recursive DFS with a twist: at each node, distinguish between *what you contribute upward* and *what the answer could be if this node is the path's apex*.\n\nDefine `gain(node)` = the best path sum starting at `node` and extending into exactly one child (or none). That's what a caller can chain onto. Inside `gain`:\n\n1. Recurse to get `left_gain = max(gain(node.left), 0)` and `right_gain = max(gain(node.right), 0)` — clamping negatives to zero (drop unhelpful subtrees).\n2. Compute `apex = node.val + left_gain + right_gain` — best path with this node as the peak — and update a global best.\n3. Return `node.val + max(left_gain, right_gain)` to the parent.\n\nO(n) time, O(h) recursion depth.",
    functionName: 'max_path_sum',
    functionSignature: 'def max_path_sum(root: list) -> int:',
    starter:
      STARTER_HEADER + 'def max_path_sum(root: list) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[-10, 9, 20, null, null, 15, 7]], expected: 42 },
    ],
    hiddenTests: [
      { input: [[1]], expected: 1 },
      { input: [[-3]], expected: -3 },
      { input: [[2, -1]], expected: 2 },
    ],
  },
  {
    id: 'level-order-traversal',
    number: 57,
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    topic: 'Tree',
    statement:
      "Given a binary tree as a level-order array (with `None` marking absent nodes), return its values grouped by depth. The result is a list of lists: the outer list is ordered top-down by level, each inner list is left-to-right across that level.",
    explanation:
      "Classic BFS over an actual node tree.\n\n1. Build a queue starting with the root. Skip work entirely if the tree is empty.\n2. While the queue isn't empty, snapshot its current length — that's the size of one full level. Repeat that many times: pop the front node, append its value to the current level's list, push its non-`None` children to the queue.\n3. After draining the snapshot's worth, append the level list to the result and continue with the next level.\n\nO(n) time, O(n) space for the result. If you're working directly off the input level-order array, you can also slice it by level boundaries (positions `1`, `1+2`, `1+2+4`, ...), filtering out `None`s.",
    functionName: 'level_order',
    functionSignature: 'def level_order(root: list) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def level_order(root: list) -> list[list[int]]:\n    pass\n',
    examples: [
      { input: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
      { input: [[1]], expected: [[1]] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[1, 2]], expected: [[1], [2]] },
      { input: [[1, null, 2, 3]], expected: [[1], [2], [3]] },
    ],
  },
  {
    id: 'serialize-deserialize',
    number: 58,
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    topic: 'Tree',
    statement:
      "Design `serialize(root)` and `deserialize(data)` that round-trip a binary tree to and from a single string. The tree is provided as a level-order array (with `None` marking missing nodes). The graded wrapper `round_trip(root)` calls both in sequence and must return an array equal to `root`.",
    explanation:
      "Two common encodings:\n\n**Level-order with sentinels** (matches this input shape): JSON-encode the array directly with `json.dumps`; `json.loads` is the inverse. `None`s are preserved by JSON. Simple and correct for this representation.\n\n**Preorder with sentinels** (the canonical interview answer on real `Node` trees): recursively emit `node.val,` then recurse left, then right; a missing node emits a sentinel like `'#,'`. To deserialize, split by comma and consume tokens with a recursive helper that returns `None` on the sentinel and otherwise builds a node, recursing for left then right.\n\nO(n) time and space for either approach.",
    functionName: 'round_trip',
    functionSignature: 'def round_trip(root: list) -> list:',
    starter:
      STARTER_HEADER +
      "import json\n\ndef serialize(root):\n    return json.dumps(root)\n\ndef deserialize(data):\n    return json.loads(data)\n\ndef round_trip(root: list) -> list:\n    return deserialize(serialize(root))\n",
    examples: [
      { input: [[1, 2, 3, null, null, 4, 5]], expected: [1, 2, 3, null, null, 4, 5] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[1]], expected: [1] },
      { input: [[5, 4, 7, 3, null, 2, null, -1, null, 9]], expected: [5, 4, 7, 3, null, 2, null, -1, null, 9] },
    ],
  },
  {
    id: 'subtree-of-another',
    number: 59,
    title: 'Subtree of Another Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "Both `root` and `sub_root` are level-order arrays describing binary trees. Decide whether `sub_root` appears as an entire subtree somewhere inside `root` — meaning some node in `root` and everything below it is structurally and value-wise identical to `sub_root`.",
    explanation:
      "Two layers of comparison:\n\n1. **Helper `same(a, b)`**: a recursive `is_same_tree`-style check that returns `True` only when both trees have identical shape and values.\n2. **Walk `root` looking for a match**: a separate recursion `contains(node, sub)` returning `True` if `same(node, sub)`, otherwise recurses into `node.left` or `node.right`. An empty `sub` matches any node (including `None`); an empty `root` only matches an empty `sub`.\n\nO(m × n) worst case, where `m` and `n` are tree sizes. A more advanced trick: serialize both trees with sentinels and substring-search — O(m + n) with a hash-based string matcher.",
    functionName: 'is_subtree',
    functionSignature: 'def is_subtree(root: list, sub_root: list) -> bool:',
    starter:
      STARTER_HEADER +
      'def is_subtree(root: list, sub_root: list) -> bool:\n    pass\n',
    examples: [
      { input: [[3, 4, 5, 1, 2], [4, 1, 2]], expected: true },
      { input: [[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]], expected: false },
    ],
    hiddenTests: [
      { input: [[1], [1]], expected: true },
      { input: [[], []], expected: true },
      { input: [[1, 2], [2]], expected: true },
    ],
  },
  {
    id: 'construct-tree-pre-in',
    number: 60,
    title: 'Construct Binary Tree from Preorder and Inorder',
    difficulty: 'Medium',
    topic: 'Tree',
    statement:
      "You are given two arrays: `preorder` (the values produced by a preorder traversal) and `inorder` (the values from an inorder traversal of the same binary tree). Values are unique. Reconstruct the tree and return it as a level-order array, using `None` for absent nodes.",
    explanation:
      "Two facts power this:\n\n- The first element of `preorder` is always the current root.\n- In `inorder`, every value to the left of the root belongs to its left subtree; everything to the right belongs to its right subtree.\n\nRecurse: pop the next value from the front of `preorder` (or keep a moving cursor) — that's the root. Find it in `inorder` to determine the size of the left subtree. Recurse on the corresponding prefix of `inorder` for the left child, then on the suffix for the right child.\n\nA dictionary mapping `value → index in inorder` makes the lookup O(1), bringing the whole reconstruction to O(n) time. After building the node tree, serialize it back to level-order with BFS.",
    functionName: 'build_tree',
    functionSignature:
      'def build_tree(preorder: list[int], inorder: list[int]) -> list:',
    starter:
      STARTER_HEADER +
      'def build_tree(preorder: list[int], inorder: list[int]) -> list:\n    pass\n',
    examples: [
      {
        input: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]],
        expected: [3, 9, 20, null, null, 15, 7],
      },
      { input: [[-1], [-1]], expected: [-1] },
    ],
    hiddenTests: [
      { input: [[], []], expected: [] },
      { input: [[1, 2], [2, 1]], expected: [1, 2] },
      { input: [[1, 2], [1, 2]], expected: [1, null, 2] },
    ],
  },
  {
    id: 'validate-bst',
    number: 61,
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    topic: 'Tree',
    statement:
      "A binary tree is given as a level-order array (with `None` marking missing nodes). Return `True` if it satisfies the BST property: every value in a node's left subtree is strictly smaller than the node, every value in its right subtree is strictly larger, and both subtrees are themselves valid BSTs. An empty tree counts as valid.",
    explanation:
      "The trap: it isn't enough to compare each node to its immediate children. The BST property is about all *descendants*, not just children.\n\n**Approach 1 — Range check**: recurse with an allowed value range `(lo, hi)`. Initially the root must lie in `(-inf, inf)`. When descending into a left child, tighten `hi` to the parent's value; when descending right, tighten `lo`. If any node falls outside its range, return `False`.\n\n**Approach 2 — Inorder traversal**: a BST's inorder walk produces a strictly increasing sequence. Run inorder and check every consecutive pair; the moment a value isn't strictly greater than the previous one, return `False`.\n\nBoth are O(n) time, O(h) space.",
    functionName: 'is_valid_bst',
    functionSignature: 'def is_valid_bst(root: list) -> bool:',
    starter:
      STARTER_HEADER + 'def is_valid_bst(root: list) -> bool:\n    pass\n',
    examples: [
      { input: [[2, 1, 3]], expected: true },
      { input: [[5, 1, 4, null, null, 3, 6]], expected: false },
    ],
    hiddenTests: [
      { input: [[]], expected: true },
      { input: [[1]], expected: true },
      { input: [[1, 1]], expected: false },
    ],
  },
  {
    id: 'kth-smallest-bst',
    number: 62,
    title: 'Kth Smallest Element in a BST',
    difficulty: 'Medium',
    topic: 'Tree',
    statement:
      "A BST is given as a level-order array (with `None` marking absent nodes), plus an integer `k`. Return the `k`-th smallest value in the tree, treating `k = 1` as the smallest element. `k` is always valid for the input.",
    explanation:
      "Inorder traversal of a BST visits values in ascending order — that's the lever.\n\n**Recursive inorder with a counter**: walk inorder, decrementing `k` at each visit. When `k` hits 0, the current node's value is the answer; return it and short-circuit the recursion.\n\n**Iterative inorder with a stack** (often preferred in interviews): repeatedly walk to the leftmost unvisited node, pushing onto a stack as you go. Pop a node, count it; if it's the `k`-th, return its value. Otherwise step into its right subtree and repeat.\n\nO(h + k) time, O(h) space. If the BST changes frequently and `kth_smallest` is called often, augmenting each node with a subtree-size count lets you answer in O(h) per query.",
    functionName: 'kth_smallest',
    functionSignature: 'def kth_smallest(root: list, k: int) -> int:',
    starter:
      STARTER_HEADER + 'def kth_smallest(root: list, k: int) -> int:\n    pass\n',
    examples: [
      { input: [[3, 1, 4, null, 2], 1], expected: 1 },
      { input: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
    ],
    hiddenTests: [
      { input: [[1], 1], expected: 1 },
      { input: [[2, 1, 3], 2], expected: 2 },
      { input: [[2, 1, 3], 3], expected: 3 },
    ],
  },
  {
    id: 'lca-bst',
    number: 63,
    title: 'Lowest Common Ancestor of a BST',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "Given a BST (encoded as a level-order array with `None` for missing nodes) and two values `p` and `q` that both exist in the tree, return the value of their lowest common ancestor. A node counts as an ancestor of itself.",
    explanation:
      "BST ordering makes this O(h) and elegant — no full search needed.\n\nStart at the root and compare the current value to both `p` and `q`:\n\n- If both `p` and `q` are *smaller* than the current value, the LCA lies in the left subtree — descend left.\n- If both are *larger*, descend right.\n- Otherwise (the values straddle the current node, or one equals it), the current node is the LCA.\n\nO(h) time, O(1) iterative space. This is strictly easier than the general-binary-tree LCA problem because the BST property tells you which side to descend without exploring both.",
    functionName: 'lowest_common_ancestor',
    functionSignature:
      'def lowest_common_ancestor(root: list, p: int, q: int) -> int:',
    starter:
      STARTER_HEADER +
      'def lowest_common_ancestor(root: list, p: int, q: int) -> int:\n    pass\n',
    examples: [
      {
        input: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8],
        expected: 6,
      },
      {
        input: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4],
        expected: 2,
      },
    ],
    hiddenTests: [
      { input: [[2, 1], 2, 1], expected: 2 },
      { input: [[1, null, 2], 1, 2], expected: 1 },
    ],
  },

  // ===== Trie =====
  {
    id: 'implement-trie',
    number: 64,
    title: 'Implement Trie',
    difficulty: 'Medium',
    topic: 'Trie',
    statement:
      "Build a prefix tree (trie) that supports three operations:\n\n- `insert(word)` — add a word to the trie. Returns nothing.\n- `search(word)` — return `True` if the exact word has been inserted.\n- `starts_with(prefix)` — return `True` if some inserted word starts with the given prefix.\n\nThe grader calls `run_ops(ops)` with a list of operations like `[('insert','apple'), ('search','apple'), ('starts_with','app')]`. Return a parallel list of results (use `None` for `insert`).",
    explanation:
      "A trie is a tree where each edge is labeled with a character. Common structure: each node has a `children` dict (or 26-slot array for lowercase letters) and an `end` flag marking that a complete word ends at this node.\n\n- **insert**: walk from the root one character at a time, creating child nodes as needed. After consuming every character, mark the final node's `end = True`.\n- **search**: walk the same path; if any character is missing, return `False`. After the walk, return whether the final node's `end` is set.\n- **starts_with**: same walk as search, but return `True` as soon as the path exists, regardless of `end`.\n\nEach operation is O(L) where L is the word/prefix length. Memory is roughly O(total characters inserted).",
    functionName: 'run_ops',
    functionSignature: 'def run_ops(ops: list[tuple]) -> list:',
    starter:
      STARTER_HEADER +
      'class Trie:\n    def __init__(self):\n        self.children = {}\n        self.end = False\n\n    def insert(self, word):\n        node = self\n        for ch in word:\n            node = node.children.setdefault(ch, Trie())\n        node.end = True\n\n    def _node(self, prefix):\n        node = self\n        for ch in prefix:\n            if ch not in node.children:\n                return None\n            node = node.children[ch]\n        return node\n\n    def search(self, word):\n        node = self._node(word)\n        return node is not None and node.end\n\n    def starts_with(self, prefix):\n        return self._node(prefix) is not None\n\n\ndef run_ops(ops: list[tuple]) -> list:\n    t = Trie()\n    out = []\n    for op, arg in ops:\n        if op == "insert":\n            t.insert(arg)\n            out.append(None)\n        elif op == "search":\n            out.append(t.search(arg))\n        elif op == "starts_with":\n            out.append(t.starts_with(arg))\n    return out\n',
    examples: [
      {
        input: [[['insert', 'apple'], ['search', 'apple'], ['search', 'app'], ['starts_with', 'app'], ['insert', 'app'], ['search', 'app']]],
        expected: [null, true, false, true, null, true],
      },
    ],
    hiddenTests: [
      { input: [[['search', 'a']]], expected: [false] },
      {
        input: [[['insert', 'abc'], ['starts_with', 'ab'], ['starts_with', 'abd']]],
        expected: [null, true, false],
      },
    ],
  },
  {
    id: 'word-dictionary',
    number: 65,
    title: 'Design Add and Search Word',
    difficulty: 'Medium',
    topic: 'Trie',
    statement:
      "Design a data structure that supports two operations:\n\n- `add(word)` — store a word.\n- `search(query)` — return `True` if any previously added word matches `query`. The character `'.'` in `query` is a wildcard that matches any single letter.\n\nThe grader drives it with `run_ops(ops)`, where each op is a tuple like `('add', 'bad')` or `('search', '.ad')`. Return a list of results; `add` should produce `None`.",
    explanation:
      "Build a trie just like in *Implement Trie*. Insertion is unchanged.\n\nSearch becomes a DFS to handle the wildcard. Define a recursive helper `dfs(node, i)`:\n\n- If `i == len(query)`, return whether `node.end` is set.\n- Let `c = query[i]`. If `c == '.'`, recurse into every child; return `True` if any recursion returns `True`.\n- Otherwise return `c in node.children and dfs(node.children[c], i + 1)`.\n\nExact-character searches stay O(L). A query that starts with many wildcards can fan out, so worst case is O(N · L) for `N` words total — but typical inputs explore a small fraction.",
    functionName: 'run_ops',
    functionSignature: 'def run_ops(ops: list[tuple]) -> list:',
    starter:
      STARTER_HEADER +
      "class WordDictionary:\n    def __init__(self):\n        self.children = {}\n        self.end = False\n\n    def add(self, word):\n        node = self\n        for ch in word:\n            node = node.children.setdefault(ch, WordDictionary())\n        node.end = True\n\n    def search(self, word):\n        def dfs(node, i):\n            if i == len(word):\n                return node.end\n            ch = word[i]\n            if ch == '.':\n                return any(dfs(child, i + 1) for child in node.children.values())\n            return ch in node.children and dfs(node.children[ch], i + 1)\n        return dfs(self, 0)\n\n\ndef run_ops(ops: list[tuple]) -> list:\n    d = WordDictionary()\n    out = []\n    for op, arg in ops:\n        if op == 'add':\n            d.add(arg)\n            out.append(None)\n        else:\n            out.append(d.search(arg))\n    return out\n",
    examples: [
      {
        input: [[['add', 'bad'], ['add', 'dad'], ['add', 'mad'], ['search', 'pad'], ['search', 'bad'], ['search', '.ad'], ['search', 'b..']]],
        expected: [null, null, null, false, true, true, true],
      },
    ],
    hiddenTests: [
      {
        input: [[['search', 'a']]],
        expected: [false],
      },
      {
        input: [[['add', 'a'], ['search', '.']]],
        expected: [null, true],
      },
    ],
  },
  {
    id: 'word-search-ii',
    number: 66,
    title: 'Word Search II',
    difficulty: 'Hard',
    topic: 'Trie',
    statement:
      "You're given a 2D grid `board` of characters and a list of target `words`. A word is *on* the board if you can spell it by walking from cell to neighboring cell (up/down/left/right), never reusing a cell within one path. Return all matching words from the list, sorted alphabetically.",
    explanation:
      "Searching each word individually with the Word Search backtracker is O(words × cells × 4^L). For large word lists you want to search for *all* words at once — that's where a trie shines.\n\nBuild a trie containing every target word, where each terminal node stores the word it completes. Then DFS from every cell as before, but at every step also descend into the trie. If the trie has no edge for the next character, prune the branch immediately. If you hit a terminal node, record that word and clear its terminal flag so you don't re-add duplicates.\n\nThis lets one grid walk discover every match. Time roughly O(cells × 4^max_L). Optionally prune trie leaves that no longer hold any words to keep the search tight.",
    functionName: 'find_words',
    functionSignature:
      'def find_words(board: list[list[str]], words: list[str]) -> list[str]:',
    starter:
      STARTER_HEADER +
      'def find_words(board: list[list[str]], words: list[str]) -> list[str]:\n    pass\n',
    examples: [
      {
        input: [
          [['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']],
          ['oath', 'pea', 'eat', 'rain'],
        ],
        expected: ['eat', 'oath'],
      },
      { input: [[['a', 'b'], ['c', 'd']], ['abcb']], expected: [] },
    ],
    hiddenTests: [
      { input: [[['a']], ['a']], expected: ['a'] },
      { input: [[['a']], ['b']], expected: [] },
    ],
  },

  // ===== Heap =====
  {
    id: 'merge-k-sorted-lists',
    number: 67,
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    topic: 'Heap',
    statement:
      'You are given `k` lists, each sorted in non-decreasing order. Combine them into a single non-decreasing list and return it.',
    explanation:
      "Three approaches with different trade-offs:\n\n**Min-heap of (value, list_index, position)**: push the first element from each list onto a min-heap. Pop the smallest, append to the result, push the next element from the same list. Repeat until empty. O(N log k) total time, where N is the grand total of elements.\n\n**Pairwise merge**: repeatedly merge two sorted lists at a time. Naively merging in order is O(kN); doing it tournament-style (merge pairs, then merge those pairs, etc.) gives O(N log k) and is straightforward to implement on top of *Merge Two Sorted Lists*.\n\n**Flatten and sort**: concatenate everything and call `sorted`. O(N log N), simplest one-liner. Not what the question is testing but works for small inputs.",
    functionName: 'merge_k_lists',
    functionSignature:
      'def merge_k_lists(lists: list[list[int]]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def merge_k_lists(lists: list[list[int]]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6] },
      { input: [[]], expected: [] },
      { input: [[[]]], expected: [] },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: [1] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[[5, 6, 7], [1, 2, 3]]], expected: [1, 2, 3, 5, 6, 7] },
    ],
  },
  {
    id: 'top-k-frequent',
    number: 68,
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    topic: 'Heap',
    statement:
      'From an integer array `nums` and a positive integer `k`, return the `k` values that appear most often, in any order. Ties may be broken arbitrarily.',
    explanation:
      "Three viable approaches:\n\n**Heap (O(n log k))**: build a frequency map with `Counter(nums)`. Push items into a min-heap of size `k` keyed by count; whenever the heap exceeds size `k`, pop the smallest. At the end, the heap holds the top `k`.\n\n**Sort by count (O(n log n))**: count frequencies, then sort the unique values by count descending and take the first `k`. The one-liner `Counter(nums).most_common(k)` does this. Simple but worse asymptotically when `k << n`.\n\n**Bucket sort (O(n))**: counts are bounded by `n`, so make an array `buckets[i]` listing values that appear exactly `i` times. Walk from index `n` down to `1`, collecting values until you have `k`. Linear in the input size, ideal when `k` is small relative to `n`.",
    functionName: 'top_k_frequent',
    functionSignature:
      'def top_k_frequent(nums: list[int], k: int) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def top_k_frequent(nums: list[int], k: int) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { input: [[1], 1], expected: [1] },
    ],
    hiddenTests: [
      { input: [[1, 2, 3], 3], expected: [1, 2, 3] },
      { input: [[4, 1, -1, 2, -1, 2, 3], 2], expected: [-1, 2] },
    ],
  },
  {
    id: 'find-median-data-stream',
    number: 69,
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    topic: 'Heap',
    statement:
      "Design a structure that ingests numbers from a stream and can report the running median at any point. Provide `add_num(x)` (returns nothing) and `find_median()` (returns a float — the average of the two middle values when the count is even).\n\nThe grader drives it with `run_ops(ops)`, where each op is `('add', x)` or `('median', None)`. Return a result list parallel to `ops`; `add` produces `None`.",
    explanation:
      "The classic two-heaps trick gets you `O(log n)` per add and `O(1)` per median query.\n\nMaintain two heaps:\n\n- `lo`: a **max-heap** holding the smaller half of values seen so far.\n- `hi`: a **min-heap** holding the larger half.\n\nKeep an invariant: `lo` has the same number of elements as `hi`, or exactly one more.\n\n**add_num(x)**: push `x` into `lo`, then immediately pop the top of `lo` and push it into `hi`. That keeps the values sorted across the two heaps. If `hi` is now larger, pop its smallest back to `lo` to restore the size invariant.\n\n**find_median**: if `lo` is larger, return its top. Otherwise return the average of the two heap tops.\n\nPython's `heapq` is a min-heap; for `lo`, negate values on push and negate again on pop.",
    functionName: 'run_ops',
    functionSignature: 'def run_ops(ops: list[tuple]) -> list:',
    starter:
      STARTER_HEADER +
      'import heapq\n\nclass MedianFinder:\n    def __init__(self):\n        self.lo = []  # max-heap (negate)\n        self.hi = []  # min-heap\n\n    def add_num(self, x):\n        heapq.heappush(self.lo, -x)\n        heapq.heappush(self.hi, -heapq.heappop(self.lo))\n        if len(self.hi) > len(self.lo):\n            heapq.heappush(self.lo, -heapq.heappop(self.hi))\n\n    def find_median(self):\n        if len(self.lo) > len(self.hi):\n            return float(-self.lo[0])\n        return (-self.lo[0] + self.hi[0]) / 2.0\n\n\ndef run_ops(ops: list[tuple]) -> list:\n    m = MedianFinder()\n    out = []\n    for op, arg in ops:\n        if op == "add":\n            m.add_num(arg)\n            out.append(None)\n        else:\n            out.append(m.find_median())\n    return out\n',
    examples: [
      {
        input: [[['add', 1], ['add', 2], ['median', null], ['add', 3], ['median', null]]],
        expected: [null, null, 1.5, null, 2.0],
      },
    ],
    hiddenTests: [
      { input: [[['add', 5], ['median', null]]], expected: [null, 5.0] },
      {
        input: [[['add', 4], ['add', 4], ['median', null]]],
        expected: [null, null, 4.0],
      },
    ],
  },

  // ===== More Sliding Window / Misc =====
  {
    id: 'meeting-rooms',
    number: 70,
    title: 'Meeting Rooms',
    difficulty: 'Easy',
    topic: 'Interval',
    statement:
      "Given a list of meetings as `[start, end]` pairs, decide whether one person can attend every meeting without conflict. Meetings whose times only touch at an endpoint (e.g. `[1, 2]` and `[2, 3]`) are not considered overlapping.",
    explanation:
      "Sort the meetings by start time, then sweep.\n\nAfter sorting, walk consecutive pairs. The moment `meetings[i].start < meetings[i - 1].end`, you've found an overlap — return `False`. If you make it through the whole list, return `True`.\n\nO(n log n) due to the sort, O(1) extra space if you sort in place. The 'touching endpoints don't overlap' rule is why the comparison uses `<`, not `<=`.",
    functionName: 'can_attend_meetings',
    functionSignature:
      'def can_attend_meetings(intervals: list[list[int]]) -> bool:',
    starter:
      STARTER_HEADER +
      'def can_attend_meetings(intervals: list[list[int]]) -> bool:\n    pass\n',
    examples: [
      { input: [[[0, 30], [5, 10], [15, 20]]], expected: false },
      { input: [[[7, 10], [2, 4]]], expected: true },
    ],
    hiddenTests: [
      { input: [[]], expected: true },
      { input: [[[1, 2]]], expected: true },
      { input: [[[1, 2], [2, 3]]], expected: true },
    ],
  },
  {
    id: 'meeting-rooms-ii',
    number: 71,
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    topic: 'Interval',
    statement:
      "Given meetings as `[start, end]` pairs, find the minimum number of rooms needed so every meeting has somewhere to happen at its scheduled time. Two meetings can share a room only if one ends no later than the other begins.",
    explanation:
      "The answer equals the maximum number of meetings that are simultaneously in progress at any moment.\n\n**Min-heap of end times**: sort meetings by start time. Use a heap whose elements are the end times of currently-active meetings. For each meeting, if the heap's smallest end time is `<=` the new meeting's start time, pop it (that room frees up just in time). Then push the new meeting's end time. The heap's size after processing all meetings is the answer (or track the max size along the way).\n\n**Two-pointer events**: build a sorted `starts` array and a sorted `ends` array. Walk a pointer through each; for every start that comes before the next end, open a new room (`rooms += 1`), otherwise the next end frees a room and you advance the end pointer. The maximum `rooms` seen is the answer.\n\nBoth are O(n log n).",
    functionName: 'min_meeting_rooms',
    functionSignature:
      'def min_meeting_rooms(intervals: list[list[int]]) -> int:',
    starter:
      STARTER_HEADER +
      'def min_meeting_rooms(intervals: list[list[int]]) -> int:\n    pass\n',
    examples: [
      { input: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { input: [[[7, 10], [2, 4]]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[[1, 5], [2, 3], [3, 6]]], expected: 2 },
      { input: [[[1, 10], [2, 7], [3, 19], [8, 12], [10, 20], [11, 30]]], expected: 4 },
    ],
  },
  {
    id: 'graph-valid-tree',
    number: 72,
    title: 'Graph Valid Tree',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "You're given `n` nodes labeled `0` through `n - 1` and a list of undirected `[a, b]` edges. Return `True` if the graph is a tree — meaning it's connected and contains no cycles. Otherwise return `False`.",
    explanation:
      "A graph is a tree iff:\n\n1. It has exactly `n - 1` edges.\n2. It is connected.\n3. It is acyclic.\n\nGiven (1), (2) and (3) are equivalent — so the check simplifies to: **exactly `n - 1` edges AND the graph is connected.**\n\n- Quick reject: if `len(edges) != n - 1`, return `False`.\n- Otherwise, build an adjacency list, BFS or DFS from node 0, and count the visited nodes. If you reach all `n`, it's a tree; otherwise it isn't connected.\n\nUnion-find is another clean fit: process edges one at a time; if any edge connects two nodes already in the same component, you've found a cycle — return `False`. After processing, verify there's only one component.\n\nO(n + e) time.",
    functionName: 'valid_tree',
    functionSignature:
      'def valid_tree(n: int, edges: list[list[int]]) -> bool:',
    starter:
      STARTER_HEADER +
      'def valid_tree(n: int, edges: list[list[int]]) -> bool:\n    pass\n',
    examples: [
      { input: [5, [[0, 1], [0, 2], [0, 3], [1, 4]]], expected: true },
      { input: [5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]], expected: false },
    ],
    hiddenTests: [
      { input: [1, []], expected: true },
      { input: [2, []], expected: false },
      { input: [3, [[0, 1]]], expected: false },
    ],
  },
  {
    id: 'number-connected-components',
    number: 73,
    title: 'Number of Connected Components',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "Given `n` nodes labeled `0..n - 1` and a list of undirected edges, count how many connected components the graph has. Isolated nodes count as components of size 1.",
    explanation:
      "Two natural approaches:\n\n**DFS / BFS sweep**: build an adjacency list. Walk every node; if it hasn't been visited, run a DFS/BFS from it (marking everything reachable as visited) and increment your component counter. Each node and edge is touched a constant number of times, giving O(n + e).\n\n**Union-find** (disjoint set union): initialize each node as its own parent. For every edge `(a, b)`, union the two sets. After processing all edges, count distinct roots — that's your component count. With union-by-rank and path compression, each operation is effectively O(α(n)), making the whole algorithm essentially linear.\n\nBoth are textbook patterns. Union-find generalizes nicely if you also need to answer 'are these two nodes connected?' queries later.",
    functionName: 'count_components',
    functionSignature:
      'def count_components(n: int, edges: list[list[int]]) -> int:',
    starter:
      STARTER_HEADER +
      'def count_components(n: int, edges: list[list[int]]) -> int:\n    pass\n',
    examples: [
      { input: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
    ],
    hiddenTests: [
      { input: [1, []], expected: 1 },
      { input: [4, []], expected: 4 },
    ],
  },
  {
    id: 'alien-dictionary',
    number: 74,
    title: 'Alien Dictionary',
    difficulty: 'Hard',
    topic: 'Graph',
    statement:
      "An alien language reuses the English alphabet but with an unknown letter ordering. You're given a list `words` that is sorted lexicographically according to the alien's rules. Derive any consistent letter ordering and return it as a string of letters in order. If the input contradicts itself (cycle, or an invalid prefix like `['ab', 'a']`), return an empty string.",
    explanation:
      "This is a topological sort. Each pair of adjacent words tells you which letter comes earlier than another.\n\n1. **Collect every unique letter** that appears in any word; these are your graph's nodes. Initialize an empty adjacency list and an indegree counter for each.\n2. **Compare adjacent word pairs**. Walk character by character until you hit the first differing position; add an edge from the earlier letter to the later one (skip if you already added that edge). If you reach the end of the shorter word and the longer word is a prefix of the shorter one (e.g. `'ab'` before `'a'`), that's invalid — return `''`.\n3. **Kahn's topological sort**: queue every letter with indegree 0. Pop, append to the result, decrement indegrees of neighbors, enqueue any that hit 0.\n4. If the result includes every letter, return it. Otherwise there's a cycle — return `''`.",
    functionName: 'alien_order',
    functionSignature: 'def alien_order(words: list[str]) -> str:',
    starter:
      STARTER_HEADER + 'def alien_order(words: list[str]) -> str:\n    pass\n',
    examples: [
      { input: [['wrt', 'wrf', 'er', 'ett', 'rftt']], expected: 'wertf' },
      { input: [['z', 'x']], expected: 'zx' },
      { input: [['z', 'x', 'z']], expected: '' },
    ],
    hiddenTests: [
      { input: [['ab', 'a']], expected: '' },
      { input: [['abc', 'abd']], expected: 'abcd' },
    ],
  },
  {
    id: 'word-ladder',
    number: 75,
    title: 'Word Ladder',
    difficulty: 'Hard',
    topic: 'Graph',
    statement:
      "You're given a starting word `begin_word`, a target word `end_word`, and a dictionary `word_list` of allowed words. At each step you may change one letter to produce a new word, but every intermediate word must be in the dictionary. Return the length of the shortest chain (number of words in the chain, including both endpoints) that transforms the start into the target, or `0` if no chain exists.",
    explanation:
      "Treat words as graph nodes and connect two words with an edge if they differ in exactly one letter. The answer is the BFS distance from `begin_word` to `end_word`, plus one.\n\nNaively building the edge list is O(N² · L). The trick: for each word, generate its `L` 'wildcard patterns' by replacing each position with `*` (e.g. `'hot'` → `'*ot', 'h*t', 'ho*'`). Bucket every dictionary word under each of its wildcards. Two words share a bucket iff they're one letter apart.\n\nRun BFS from `begin_word`. For each popped word, expand it by computing its wildcards and pulling neighbors from the buckets; mark visited so you don't revisit. Stop when you pop `end_word` — its BFS depth + 1 is the answer.\n\nO(N · L²) time, dominated by wildcard generation. Bidirectional BFS roughly halves the work in practice. Return 0 if `end_word` isn't in `word_list` (no possible final step).",
    functionName: 'ladder_length',
    functionSignature:
      'def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:',
    starter:
      STARTER_HEADER +
      'def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:\n    pass\n',
    examples: [
      {
        input: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']],
        expected: 5,
      },
      {
        input: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']],
        expected: 0,
      },
    ],
    hiddenTests: [
      { input: ['a', 'c', ['a', 'b', 'c']], expected: 2 },
      { input: ['hot', 'dog', ['hot', 'dog']], expected: 0 },
    ],
  },
];

// Group by topic for filter UI
export const blind75Topics: string[] = Array.from(
  new Set(blind75.map((p) => p.topic))
).sort();

export const getProblem = (id: string): Blind75Problem | undefined =>
  blind75.find((p) => p.id === id);
