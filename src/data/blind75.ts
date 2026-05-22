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

  // ===== Two Pointers / Sliding Window =====
  {
    id: 'move-zeroes',
    number: 76,
    title: 'Move Zeroes',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    statement:
      "An integer list `nums` may contain zeros scattered among its non-zero values. Shift every zero to the back of the list while keeping the relative order of the non-zero values intact. Return the resulting list.",
    explanation:
      "Make one pass with a write index `k`. Every time you see a non-zero value, copy it into `nums[k]` and advance `k`. After the scan, every position from `k` to the end gets overwritten with `0`.\n\nThe non-zeros stay in their original order because you visit them left-to-right. Two passes total but both linear — O(n) time, O(1) extra space.",
    functionName: 'move_zeroes',
    functionSignature: 'def move_zeroes(nums: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def move_zeroes(nums: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { input: [[0]], expected: [0] },
    ],
    hiddenTests: [
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[4, 2, 4, 0, 0, 3, 0, 5, 1, 0]], expected: [4, 2, 4, 3, 5, 1, 0, 0, 0, 0] },
      { input: [[0, 0, 1]], expected: [1, 0, 0] },
    ],
  },
  {
    id: 'sort-colors',
    number: 77,
    title: 'Sort Colors',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    statement:
      "A list `nums` contains only the values `0`, `1`, and `2` — think of them as three colors of objects on a shelf. Reorder them so all the zeros come first, then ones, then twos. Solve it in one pass without sorting.",
    explanation:
      "This is the Dutch national flag problem. Keep three pointers: `lo` (the boundary for zeros), `hi` (the boundary for twos), and a roaming `mid`.\n\nWalk `mid` from left to right. On a `0`, swap with `nums[lo]` and advance both `lo` and `mid` — the swapped-in value is either a `0` (just placed) or a `1` (already partitioned). On a `2`, swap with `nums[hi]` and decrement `hi`; don't move `mid` because the swapped-in value hasn't been examined yet. On a `1`, just advance `mid`.\n\nStop when `mid > hi`. One pass, O(n) time, O(1) space.",
    functionName: 'sort_colors',
    functionSignature: 'def sort_colors(nums: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def sort_colors(nums: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
      { input: [[2, 0, 1]], expected: [0, 1, 2] },
    ],
    hiddenTests: [
      { input: [[0]], expected: [0] },
      { input: [[1, 2, 0]], expected: [0, 1, 2] },
      { input: [[2, 1, 1, 0, 0, 2]], expected: [0, 0, 1, 1, 2, 2] },
    ],
  },
  {
    id: 'trapping-rain-water',
    number: 78,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    statement:
      "An elevation map is given as a list of non-negative bar heights, each one unit wide. After it rains, water pools above the bars in the dips between taller pillars on either side. Return the total units of water trapped.",
    explanation:
      "At index `i`, the water trapped is `min(maxLeft[i], maxRight[i]) − height[i]`, where `maxLeft` and `maxRight` are the tallest bars up to and beyond `i` respectively. A precomputed two-array solution makes this O(n) time and O(n) space.\n\nThe two-pointer trick gets you to O(1) extra space. Walk pointers `l` from the left and `r` from the right toward each other, tracking running `lm` and `rm` (max seen so far on each side). Whichever side has the *smaller* running max determines the trapped water at that index — because the other side already has a taller bar guaranteed. Add `lm − height[l]` or `rm − height[r]` as appropriate, then move that pointer inward.\n\nOne pass, O(n) time, O(1) space.",
    functionName: 'trap',
    functionSignature: 'def trap(height: list[int]) -> int:',
    starter: STARTER_HEADER + 'def trap(height: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[3]], expected: 0 },
      { input: [[3, 0, 2, 0, 4]], expected: 7 },
    ],
  },
  {
    id: 'remove-duplicates-sorted',
    number: 79,
    title: 'Remove Duplicates from Sorted Array',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    statement:
      "A sorted list `nums` may have repeated values. Produce a list that keeps only the first occurrence of each value, preserving order. Return the deduplicated list.",
    explanation:
      "Because the input is sorted, duplicates sit adjacent to each other. Keep a write index `k` starting at 1; walk `i` from 1 to the end. Whenever `nums[i] != nums[i-1]`, copy `nums[i]` to `nums[k]` and bump `k`. The first `k` entries are the unique prefix.\n\nO(n) time, O(1) extra space (the canonical interview version mutates the array; here we just return the trimmed slice).",
    functionName: 'remove_duplicates',
    functionSignature: 'def remove_duplicates(nums: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def remove_duplicates(nums: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 1, 2]], expected: [1, 2] },
      { input: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [0, 1, 2, 3, 4] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[1, 1, 1, 1]], expected: [1] },
    ],
  },
  {
    id: 'squares-of-sorted-array',
    number: 80,
    title: 'Squares of a Sorted Array',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    statement:
      "A list `nums` is sorted in non-decreasing order but may contain negatives. Square every value and return them sorted in non-decreasing order. Aim for `O(n)` time.",
    explanation:
      "Squaring breaks the sort: large negatives become large positives. But the *largest absolute values* still sit at the two ends of the input — that's the key.\n\nUse two pointers `l = 0` and `r = n − 1`. At each step compare `abs(nums[l])` to `abs(nums[r])`; whichever is larger, square it and write it to the back of the output (filling right-to-left), then move that pointer inward. After `n` steps the output is fully populated in sorted order.\n\nO(n) time, O(n) space for the result.",
    functionName: 'sorted_squares',
    functionSignature: 'def sorted_squares(nums: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def sorted_squares(nums: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
      { input: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
    ],
    hiddenTests: [
      { input: [[-5, -3, -2, -1]], expected: [1, 4, 9, 25] },
      { input: [[1, 2, 3]], expected: [1, 4, 9] },
      { input: [[0]], expected: [0] },
    ],
  },
  {
    id: 'subarray-sum-k',
    number: 81,
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    topic: 'Hash Table',
    statement:
      "Given an integer list `nums` and an integer `k`, count how many contiguous slices of the list sum to exactly `k`. Subarrays starting and ending at any positions count, including length-1 slices.",
    explanation:
      "Brute-force enumerating every slice is O(n²). The hash-map prefix-sum trick gets you O(n).\n\nLet `P[i]` be the sum of `nums[0..i-1]`. The sum of `nums[i..j]` equals `P[j+1] − P[i]`. A slice sums to `k` exactly when `P[j+1] − P[i] = k`, i.e. `P[i] = P[j+1] − k`. So as you walk and compute running prefix `p`, the number of valid slices ending at the current position is the count of times the value `p − k` has appeared as a previous prefix.\n\nKeep a dictionary mapping each seen prefix sum to how many times you've seen it (seed with `{0: 1}` to handle slices starting at index 0). For each step, add `freq[p − k]` to the answer, then bump `freq[p]`. O(n) time, O(n) space.",
    functionName: 'subarray_sum',
    functionSignature: 'def subarray_sum(nums: list[int], k: int) -> int:',
    starter:
      STARTER_HEADER + 'def subarray_sum(nums: list[int], k: int) -> int:\n    pass\n',
    examples: [
      { input: [[1, 1, 1], 2], expected: 2 },
      { input: [[1, 2, 3], 3], expected: 2 },
    ],
    hiddenTests: [
      { input: [[-1, -1, 1], 0], expected: 1 },
      { input: [[1], 0], expected: 0 },
      { input: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4 },
    ],
  },
  {
    id: 'find-pivot-index',
    number: 82,
    title: 'Find Pivot Index',
    difficulty: 'Easy',
    topic: 'Array',
    statement:
      "An integer list `nums` has a *pivot index* if the sum of values strictly to its left equals the sum strictly to its right. Return the leftmost such index, or `-1` if no pivot exists. The edges count (a pivot at index 0 has left sum `0`).",
    explanation:
      "Compute `total = sum(nums)`. Walk left to right keeping a running `left` sum that includes everything strictly before the current index. The right-side sum is `total − left − nums[i]`. Return the first index where `left == total − left − nums[i]`.\n\nOne pass, O(n) time, O(1) extra space.",
    functionName: 'pivot_index',
    functionSignature: 'def pivot_index(nums: list[int]) -> int:',
    starter:
      STARTER_HEADER + 'def pivot_index(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[1, 7, 3, 6, 5, 6]], expected: 3 },
      { input: [[1, 2, 3]], expected: -1 },
    ],
    hiddenTests: [
      { input: [[2, 1, -1]], expected: 0 },
      { input: [[0, 0, 0]], expected: 0 },
      { input: [[-1, -1, -1, -1, -1, 0]], expected: 2 },
    ],
  },
  {
    id: 'continuous-subarray-sum',
    number: 83,
    title: 'Continuous Subarray Sum',
    difficulty: 'Medium',
    topic: 'Hash Table',
    statement:
      "Given a non-negative integer list `nums` and an integer `k`, decide whether some contiguous slice of length at least 2 has a sum that is a multiple of `k`. Return `True` or `False`.",
    explanation:
      "Two prefix sums `P[i]` and `P[j]` (with `j > i`) carve out the slice `nums[i..j-1]`, whose sum is `P[j] − P[i]`. That difference is a multiple of `k` exactly when `P[j] mod k == P[i] mod k`. So the question reduces to: *do two prefix sums share the same residue mod `k`, with positions at least 2 apart?*\n\nWalk left-to-right tracking the running sum's residue. Store each residue in a dictionary mapping `residue → earliest index where it appeared`. When you see a repeated residue, check if the gap to the earlier index is at least 2. Seed with `{0: -1}` so a slice that starts at index 0 and sums to a multiple of `k` is detected.\n\nO(n) time, O(min(n, k)) space.",
    functionName: 'check_subarray_sum',
    functionSignature: 'def check_subarray_sum(nums: list[int], k: int) -> bool:',
    starter:
      STARTER_HEADER + 'def check_subarray_sum(nums: list[int], k: int) -> bool:\n    pass\n',
    examples: [
      { input: [[23, 2, 4, 6, 7], 6], expected: true },
      { input: [[23, 2, 6, 4, 7], 6], expected: true },
    ],
    hiddenTests: [
      { input: [[23, 2, 6, 4, 7], 13], expected: false },
      { input: [[1, 2, 3], 6], expected: true },
      { input: [[1, 0], 2], expected: false },
    ],
  },
  {
    id: 'sliding-window-maximum',
    number: 84,
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    topic: 'Monotonic Stack',
    statement:
      "A window of size `k` slides one step at a time across an integer list `nums`, from left to right. For each window position, report the maximum value inside the window. Return the list of maxima.",
    explanation:
      "Recomputing the max from scratch for every window is O(n·k). A monotonic deque drops it to O(n).\n\nThe trick: maintain a deque of indices whose values form a *strictly decreasing* sequence from front to back. The front of the deque is always the index of the current window's maximum.\n\nFor each new index `i`:\n\n1. While the deque's back index has a value `<= nums[i]`, pop it — that smaller value can never be the max again.\n2. Push `i`.\n3. If the front index has fallen out of the window (`front <= i − k`), pop the front.\n4. Once `i >= k − 1`, record `nums[deque.front]` as the current window's max.\n\nEach index is pushed and popped at most once, so total work is O(n).",
    functionName: 'max_sliding_window',
    functionSignature: 'def max_sliding_window(nums: list[int], k: int) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def max_sliding_window(nums: list[int], k: int) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { input: [[1], 1], expected: [1] },
    ],
    hiddenTests: [
      { input: [[1, -1], 1], expected: [1, -1] },
      { input: [[7, 2, 4], 2], expected: [7, 4] },
      { input: [[4, 3, 2, 1], 2], expected: [4, 3, 2] },
    ],
  },
  {
    id: 'fruit-into-baskets',
    number: 85,
    title: 'Fruit Into Baskets',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    statement:
      "You walk past a row of fruit trees represented by the list `fruits`, where `fruits[i]` is the type of fruit at tree `i`. You may pick continuously starting at any tree, but you have only two baskets and each basket holds exactly one type of fruit. Stop at the first tree whose fruit doesn't fit. Return the maximum number of fruits you can pick.",
    explanation:
      "This is the classic *longest contiguous subarray with at most 2 distinct values* problem dressed up as a story.\n\nUse a sliding window with two pointers `l` and `r`. Keep a dict `count` tracking the frequency of each fruit type inside the window. Expand `r` one step at a time, adding to `count`. If `len(count) > 2`, shrink from the left until you're back to two types, decrementing `count[fruits[l]]` and removing the key when it hits zero. After each expansion, record `r − l + 1` as a candidate answer.\n\nO(n) time, O(1) space (at most 3 entries in the dict).",
    functionName: 'total_fruit',
    functionSignature: 'def total_fruit(fruits: list[int]) -> int:',
    starter:
      STARTER_HEADER + 'def total_fruit(fruits: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 1]], expected: 3 },
      { input: [[0, 1, 2, 2]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[1, 2, 3, 2, 2]], expected: 4 },
      { input: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expected: 5 },
      { input: [[1]], expected: 1 },
    ],
  },
  {
    id: 'permutation-in-string',
    number: 86,
    title: 'Permutation in String',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    statement:
      "Two strings `s1` and `s2` are given. Decide whether any rearrangement of `s1`'s characters appears as a contiguous substring of `s2`. Return `True` or `False`.",
    explanation:
      "A permutation of `s1` has the same multiset of characters as `s1`. So the question reduces to: *does any window of `s2` of length `len(s1)` have exactly the same character counts as `s1`?*\n\nBuild a length-26 frequency vector for `s1`. Slide a window of the same length across `s2`, maintaining the window's own frequency vector incrementally (add the entering character, drop the leaving character). Whenever the two vectors are equal, return `True`. If you exhaust `s2`, return `False`.\n\nO(n) time, O(1) space (constant alphabet).",
    functionName: 'check_inclusion',
    functionSignature: 'def check_inclusion(s1: str, s2: str) -> bool:',
    starter:
      STARTER_HEADER + 'def check_inclusion(s1: str, s2: str) -> bool:\n    pass\n',
    examples: [
      { input: ['ab', 'eidbaooo'], expected: true },
      { input: ['ab', 'eidboaoo'], expected: false },
    ],
    hiddenTests: [
      { input: ['adc', 'dcda'], expected: true },
      { input: ['hello', 'ooolleoooleh'], expected: false },
      { input: ['a', 'a'], expected: true },
    ],
  },
  {
    id: 'max-average-subarray',
    number: 87,
    title: 'Maximum Average Subarray I',
    difficulty: 'Easy',
    topic: 'Sliding Window',
    statement:
      "Given an integer list `nums` and an integer `k` no larger than `nums`'s length, find the contiguous slice of length exactly `k` with the largest average. Return that average as a float.",
    explanation:
      "Maximizing the average over a fixed-length window is the same as maximizing the sum. Compute the sum of the first `k` elements, then slide: as you advance the window by one, add the entering element and subtract the leaving element to get the new sum in O(1). Track the maximum sum and divide by `k` at the end.\n\nO(n) time, O(1) space.",
    functionName: 'find_max_average',
    functionSignature: 'def find_max_average(nums: list[int], k: int) -> float:',
    starter:
      STARTER_HEADER + 'def find_max_average(nums: list[int], k: int) -> float:\n    pass\n',
    examples: [
      { input: [[1, 12, -5, -6, 50, 3], 4], expected: 12.75 },
      { input: [[5], 1], expected: 5.0 },
    ],
    hiddenTests: [
      { input: [[0, 1, 1, 3, 3], 4], expected: 2.0 },
      { input: [[-1], 1], expected: -1.0 },
      { input: [[4, 4, 4, 4], 2], expected: 4.0 },
    ],
  },
  {
    id: 'find-all-anagrams',
    number: 88,
    title: 'Find All Anagrams in a String',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    statement:
      "Two strings `s` and `p` are given. Return a list of every starting index in `s` where a contiguous substring is an anagram of `p`. Output indices in increasing order.",
    explanation:
      "Same setup as *Permutation in String*: build `p`'s 26-letter frequency vector, then slide a window of length `len(p)` across `s`, maintaining its frequency incrementally. Whenever the two vectors match, record the current left index.\n\nA cute optimization: track a `matches` counter (how many letters currently have identical counts in both vectors). Update it in O(1) as letters enter and leave. When `matches == 26`, you have an anagram.\n\nO(n) time, O(1) space.",
    functionName: 'find_anagrams',
    functionSignature: 'def find_anagrams(s: str, p: str) -> list[int]:',
    starter:
      STARTER_HEADER + 'def find_anagrams(s: str, p: str) -> list[int]:\n    pass\n',
    examples: [
      { input: ['cbaebabacd', 'abc'], expected: [0, 6] },
      { input: ['abab', 'ab'], expected: [0, 1, 2] },
    ],
    hiddenTests: [
      { input: ['a', 'a'], expected: [0] },
      { input: ['aaaa', 'aa'], expected: [0, 1, 2] },
      { input: ['abc', 'xyz'], expected: [] },
    ],
  },
  {
    id: 'min-size-subarray-sum',
    number: 89,
    title: 'Minimum Size Subarray Sum',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    statement:
      "Given a positive-integer list `nums` and a positive integer `target`, find the length of the shortest contiguous slice whose sum is at least `target`. Return `0` if no such slice exists.",
    explanation:
      "Because every value is positive, growing the window strictly increases its sum and shrinking it strictly decreases. That's the structure that lets a single sliding window win.\n\nKeep a running `total` and a left pointer `l = 0`. Advance the right pointer `r` from `0` to `n − 1`, adding `nums[r]` to `total`. Whenever `total >= target`, record the candidate length `r − l + 1`, then *shrink* by subtracting `nums[l]` and advancing `l`. Repeat the shrink as long as `total` stays at or above `target`.\n\nO(n) time (each index enters and leaves the window once), O(1) space.",
    functionName: 'min_sub_array_len',
    functionSignature: 'def min_sub_array_len(target: int, nums: list[int]) -> int:',
    starter:
      STARTER_HEADER +
      'def min_sub_array_len(target: int, nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
      { input: [4, [1, 4, 4]], expected: 1 },
    ],
    hiddenTests: [
      { input: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
      { input: [15, [1, 2, 3, 4, 5]], expected: 5 },
      { input: [6, [10, 2, 3]], expected: 1 },
    ],
  },
  {
    id: 'subarrays-k-distinct',
    number: 90,
    title: 'Subarrays with K Different Integers',
    difficulty: 'Hard',
    topic: 'Sliding Window',
    statement:
      "Given an integer list `nums` and a positive integer `k`, count the contiguous slices that contain *exactly* `k` distinct values.",
    explanation:
      "Counting *exactly* k distinct values is awkward because the window doesn't have a clean monotonic property — adding an element can either keep or grow the distinct count, and shrinking has the same ambiguity.\n\nTrick: `exactly(k) = atMost(k) − atMost(k − 1)`. Build a helper `at_most(k)` that counts slices with **at most** `k` distinct values; that one has the monotonic shape sliding window needs. In `at_most`, keep a frequency dict and a left pointer; for each `r`, while the distinct count exceeds `k`, shrink from the left. Every position of `r` contributes `r − l + 1` valid windows ending at `r`.\n\nO(n) time, O(k) space.",
    functionName: 'subarrays_with_k_distinct',
    functionSignature: 'def subarrays_with_k_distinct(nums: list[int], k: int) -> int:',
    starter:
      STARTER_HEADER +
      'def subarrays_with_k_distinct(nums: list[int], k: int) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 1, 2, 3], 2], expected: 7 },
      { input: [[1, 2, 1, 3, 4], 3], expected: 3 },
    ],
    hiddenTests: [
      { input: [[1, 1, 1, 1], 1], expected: 10 },
      { input: [[2, 1, 2, 1, 2], 2], expected: 10 },
      { input: [[1], 1], expected: 1 },
    ],
  },

  // ===== Binary Search =====
  {
    id: 'koko-eating-bananas',
    number: 91,
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    topic: 'Binary Search',
    statement:
      "Koko has a list `piles` of banana piles and `h` hours to finish them. Each hour she picks any pile and eats up to `k` bananas from it; if the pile has fewer than `k`, she eats the whole pile and moves on the next hour. Find the smallest integer `k` that lets her finish every pile within `h` hours.",
    explanation:
      "This is binary search on the *answer*. The candidate speed `k` ranges from `1` (slowest) to `max(piles)` (fast enough to clear the largest pile in one hour).\n\nDefine `hours(k) = sum(ceil(p / k) for p in piles)`. `hours(k)` is monotonically non-increasing in `k`: a faster eater never needs more hours. So the set of speeds that work is a contiguous suffix of `[1..max(piles)]`. Binary search for the leftmost speed where `hours(k) <= h`.\n\nO(n · log(max(piles))) time. `ceil(p / k)` can be written `(p + k − 1) // k` to avoid floating point.",
    functionName: 'min_eating_speed',
    functionSignature: 'def min_eating_speed(piles: list[int], h: int) -> int:',
    starter:
      STARTER_HEADER + 'def min_eating_speed(piles: list[int], h: int) -> int:\n    pass\n',
    examples: [
      { input: [[3, 6, 7, 11], 8], expected: 4 },
      { input: [[30, 11, 23, 4, 20], 5], expected: 30 },
    ],
    hiddenTests: [
      { input: [[30, 11, 23, 4, 20], 6], expected: 23 },
      { input: [[1, 1, 1, 1], 4], expected: 1 },
      { input: [[4], 1], expected: 4 },
    ],
  },
  {
    id: 'capacity-ship-packages',
    number: 92,
    title: 'Capacity to Ship Packages Within D Days',
    difficulty: 'Medium',
    topic: 'Binary Search',
    statement:
      "Packages with given `weights` must be loaded onto a single ship that sails once per day, in the order they appear, for at most `days` days. Find the smallest ship capacity that lets you ship them all within the deadline.",
    explanation:
      "Binary search on the capacity. The lower bound is `max(weights)` — the ship has to hold the heaviest single package. The upper bound is `sum(weights)` — one trip for everything.\n\nDefine `days_needed(cap) = number of consecutive groups whose sum stays <= cap`. Walk the weights left to right, accumulating into the current group's load; when the next package would overflow, start a new day. Like before, `days_needed` is monotonically non-increasing in `cap`, so binary search for the smallest `cap` with `days_needed(cap) <= days`.\n\nO(n · log(sum)) time.",
    functionName: 'ship_within_days',
    functionSignature: 'def ship_within_days(weights: list[int], days: int) -> int:',
    starter:
      STARTER_HEADER +
      'def ship_within_days(weights: list[int], days: int) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
      { input: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
    ],
    hiddenTests: [
      { input: [[1, 2, 3, 1, 1], 4], expected: 3 },
      { input: [[10], 1], expected: 10 },
      { input: [[1, 2, 3, 4, 5], 1], expected: 15 },
    ],
  },
  {
    id: 'search-2d-matrix',
    number: 93,
    title: 'Search a 2D Matrix',
    difficulty: 'Medium',
    topic: 'Binary Search',
    statement:
      "An `m × n` matrix is sorted: each row is strictly ascending, and the first value of every row is greater than the last value of the previous row. Given a `target`, return `True` if it appears anywhere in the matrix and `False` otherwise.",
    explanation:
      "Because every row continues where the previous left off, the flattened matrix is just one big sorted array. Pretend `matrix` is the array `A[0..mn-1]` where `A[idx] = matrix[idx // n][idx % n]`, and run a standard binary search over `idx`.\n\nO(log(mn)) time, O(1) space. Guard against empty input (`m == 0` or `n == 0`) and you're done.",
    functionName: 'search_matrix',
    functionSignature: 'def search_matrix(matrix: list[list[int]], target: int) -> bool:',
    starter:
      STARTER_HEADER +
      'def search_matrix(matrix: list[list[int]], target: int) -> bool:\n    pass\n',
    examples: [
      {
        input: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          3,
        ],
        expected: true,
      },
      {
        input: [
          [
            [1, 3, 5, 7],
            [10, 11, 16, 20],
            [23, 30, 34, 60],
          ],
          13,
        ],
        expected: false,
      },
    ],
    hiddenTests: [
      { input: [[[1]], 1], expected: true },
      { input: [[[1]], 0], expected: false },
      { input: [[[1, 3], [5, 7]], 5], expected: true },
    ],
  },
  {
    id: 'find-peak-element',
    number: 94,
    title: 'Find Peak Element',
    difficulty: 'Medium',
    topic: 'Binary Search',
    statement:
      "A *peak* is a value that's strictly greater than both of its neighbors (out-of-bounds positions count as `-∞`). Given an integer list `nums` whose adjacent values are always different, return the index of any peak.",
    explanation:
      "Linear scan works but you can do it in O(log n) with binary search. The intuition: at any midpoint, look at `nums[mid]` vs `nums[mid + 1]`. If `nums[mid] < nums[mid + 1]`, the array is rising into the right half, so a peak must exist somewhere in `[mid + 1, hi]` (eventually the rise has to stop, and either it stops at a peak or hits the right wall — both are peaks). Otherwise the array is falling, and the same logic flips: a peak must exist in `[lo, mid]`.\n\nMove `lo` and `hi` accordingly until `lo == hi`. That index is a peak. O(log n) time, O(1) space.",
    functionName: 'find_peak_element',
    functionSignature: 'def find_peak_element(nums: list[int]) -> int:',
    starter:
      STARTER_HEADER + 'def find_peak_element(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 1]], expected: 2 },
      { input: [[1, 3, 2]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[5]], expected: 0 },
      { input: [[1, 2, 3, 4, 5]], expected: 4 },
      { input: [[5, 4, 3, 2, 1]], expected: 0 },
    ],
  },
  {
    id: 'median-two-sorted-arrays',
    number: 95,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    topic: 'Binary Search',
    statement:
      "Two sorted lists `nums1` and `nums2` are given. Return the median of the combined sequence as a float. For a combined even length, the median is the average of the two middle values.",
    explanation:
      "Merging then taking the middle is O(n + m). The signature O(log(min(n, m))) solution is a binary search on the partition point.\n\nLet `m = len(nums1) <= len(nums2) = n`. Pick a cut `i` in `nums1` (between 0 and `m`); the matching cut in `nums2` is `j = (m + n + 1) // 2 − i`. The two cuts divide the combined sequence into a left half of `(m + n + 1) // 2` values and a right half of the rest. A valid cut satisfies `nums1[i-1] <= nums2[j]` and `nums2[j-1] <= nums1[i]`.\n\nBinary search `i` over `[0, m]`, adjusting based on whether the left half has its largest element too big or the right too small. Once a valid cut is found, the median is `max(left)` if total length is odd, otherwise `(max(left) + min(right)) / 2`. Treat out-of-bounds slots as `+∞` and `−∞`.\n\nO(log(min(n, m))) time, O(1) space.",
    functionName: 'find_median_sorted_arrays',
    functionSignature:
      'def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:',
    starter:
      STARTER_HEADER +
      'def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:\n    pass\n',
    examples: [
      { input: [[1, 3], [2]], expected: 2.0 },
      { input: [[1, 2], [3, 4]], expected: 2.5 },
    ],
    hiddenTests: [
      { input: [[0, 0], [0, 0]], expected: 0.0 },
      { input: [[], [1]], expected: 1.0 },
      { input: [[1, 3], [2, 7]], expected: 2.5 },
    ],
  },

  // ===== Stack / Monotonic Stack =====
  {
    id: 'min-stack',
    number: 96,
    title: 'Min Stack',
    difficulty: 'Medium',
    topic: 'Stack',
    statement:
      "Design a stack that supports the usual `push`, `pop`, and `top` operations plus an O(1) `get_min` that returns the current minimum element. The grader drives it via `run_ops(ops)` where each op is a tuple like `('push', 5)`, `('pop',)`, `('top',)`, `('get_min',)`. Return a parallel list of results; mutating ops (`push`, `pop`) should produce `None`.",
    explanation:
      "Storing the running minimum in a single variable doesn't work because a `pop` can remove the current min and you'd have no way to recover the next-smallest in O(1).\n\nThe two-stack trick fixes it. Maintain two stacks: the main one for values, and a parallel *min stack* whose top always holds the minimum of the corresponding prefix. On `push(x)`, append `x` to the main stack and append `min(x, min_stack[-1])` (or `x` if empty) to the min stack. On `pop`, pop both. `top` returns the main stack's last element; `get_min` returns the min stack's last element.\n\nEvery op is O(1) time, O(n) total space.",
    functionName: 'run_ops',
    functionSignature: 'def run_ops(ops: list[tuple]) -> list:',
    starter:
      STARTER_HEADER +
      "class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.mins = []\n\n    def push(self, x):\n        self.stack.append(x)\n        self.mins.append(x if not self.mins else min(x, self.mins[-1]))\n\n    def pop(self):\n        self.stack.pop()\n        self.mins.pop()\n\n    def top(self):\n        return self.stack[-1]\n\n    def get_min(self):\n        return self.mins[-1]\n\n\ndef run_ops(ops: list[tuple]) -> list:\n    s = MinStack()\n    out = []\n    for op in ops:\n        name = op[0]\n        if name == 'push':\n            s.push(op[1]); out.append(None)\n        elif name == 'pop':\n            s.pop(); out.append(None)\n        elif name == 'top':\n            out.append(s.top())\n        elif name == 'get_min':\n            out.append(s.get_min())\n    return out\n",
    examples: [
      {
        input: [[['push', -2], ['push', 0], ['push', -3], ['get_min'], ['pop'], ['top'], ['get_min']]],
        expected: [null, null, null, -3, null, 0, -2],
      },
    ],
    hiddenTests: [
      {
        input: [[['push', 5], ['get_min'], ['push', 3], ['get_min'], ['pop'], ['get_min']]],
        expected: [null, 5, null, 3, null, 5],
      },
      {
        input: [[['push', 1], ['push', 1], ['get_min'], ['pop'], ['get_min']]],
        expected: [null, null, 1, null, 1],
      },
    ],
  },
  {
    id: 'eval-rpn',
    number: 97,
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'Medium',
    topic: 'Stack',
    statement:
      "A list `tokens` holds an arithmetic expression in postfix (Reverse Polish) form: numbers as strings, plus the operators `'+'`, `'-'`, `'*'`, `'/'`. Evaluate the expression and return the integer result. Division truncates toward zero.",
    explanation:
      "Postfix is built for stacks. Walk left to right with a stack of integers. For a number, push it. For an operator, pop the right operand, then the left operand, apply the operator, and push the result. After the walk, the stack's single remaining value is the answer.\n\nThe only subtlety is division: Python's `//` rounds toward negative infinity, not zero. Use `int(a / b)` or `int(operator.truediv(a, b))` to get truncation toward zero (which is what postfix calculators traditionally do).\n\nO(n) time, O(n) space.",
    functionName: 'eval_rpn',
    functionSignature: 'def eval_rpn(tokens: list[str]) -> int:',
    starter:
      STARTER_HEADER + 'def eval_rpn(tokens: list[str]) -> int:\n    pass\n',
    examples: [
      { input: [['2', '1', '+', '3', '*']], expected: 9 },
      { input: [['4', '13', '5', '/', '+']], expected: 6 },
    ],
    hiddenTests: [
      { input: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], expected: 22 },
      { input: [['3', '-4', '+']], expected: -1 },
      { input: [['7']], expected: 7 },
    ],
  },
  {
    id: 'daily-temperatures',
    number: 98,
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    topic: 'Monotonic Stack',
    statement:
      "A list `temperatures` records the day-by-day reading. For each day, return how many days you'd have to wait for a strictly warmer reading. If no warmer day exists, the answer for that index is `0`.",
    explanation:
      "Brute force checks every later day for each index — O(n²). A monotonic stack collapses it to O(n).\n\nKeep a stack of indices whose temperatures are strictly *decreasing* from bottom to top — the indices that haven't found a warmer day yet. For each new index `i`, while the stack's top index has a smaller temperature, pop it; the answer for that popped index is `i − popped_idx`. Then push `i`. At the end, anything still on the stack stays at `0` (no warmer day found).\n\nEach index is pushed and popped at most once, so total work is O(n).",
    functionName: 'daily_temperatures',
    functionSignature: 'def daily_temperatures(temperatures: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def daily_temperatures(temperatures: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
    ],
    hiddenTests: [
      { input: [[30, 60, 90]], expected: [1, 1, 0] },
      { input: [[90, 60, 30]], expected: [0, 0, 0] },
      { input: [[55]], expected: [0] },
    ],
  },
  {
    id: 'next-greater-element-ii',
    number: 99,
    title: 'Next Greater Element II',
    difficulty: 'Medium',
    topic: 'Monotonic Stack',
    statement:
      "An integer list `nums` is treated as *circular*: after the last element, indexing wraps back to the first. For each position, return the next strictly greater value encountered while moving forward (with wrap-around). If no greater value exists anywhere in the list, the answer for that position is `-1`.",
    explanation:
      "Same monotonic-stack pattern as Daily Temperatures, but the wrap forces a second pass. Walk the indices `0..2n − 1` and use `i % n` to access values; that simulates one full extra loop, which is enough for every element to see its next-greater across the circle.\n\nKeep a stack of indices into the *original* range `[0, n)` whose values haven't yet been answered. For each iteration, while the top index's value is less than `nums[i % n]`, pop it and set its answer to `nums[i % n]`. Push `i % n` if `i < n` (we only need each original index added once).\n\nO(n) time, O(n) space.",
    functionName: 'next_greater_elements',
    functionSignature: 'def next_greater_elements(nums: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def next_greater_elements(nums: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 1]], expected: [2, -1, 2] },
      { input: [[1, 2, 3, 4, 3]], expected: [2, 3, 4, -1, 4] },
    ],
    hiddenTests: [
      { input: [[5, 4, 3, 2, 1]], expected: [-1, 5, 5, 5, 5] },
      { input: [[1]], expected: [-1] },
      { input: [[1, 1, 1]], expected: [-1, -1, -1] },
    ],
  },
  {
    id: 'largest-rectangle-histogram',
    number: 100,
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    topic: 'Monotonic Stack',
    statement:
      "A list `heights` of non-negative integers represents the heights of consecutive bars in a histogram, each one unit wide. Find the largest rectangular area that fits entirely inside the histogram. Return that area.",
    explanation:
      "The largest rectangle is bounded by the *shortest* bar inside it. For each bar `i`, you'd like to know the widest stretch in which it remains the shortest — i.e. the nearest shorter bar to its left and right. Multiply that span by `heights[i]` and you have a candidate.\n\nA monotonic stack of indices (heights increasing from bottom to top) computes both nearest-shorter boundaries in one pass. Walk left to right: while the stack's top has a height strictly greater than `heights[i]`, pop it; the popped bar's right boundary is `i` and its left boundary is the new stack top (or `-1` if empty). Compute its candidate area. After the walk, drain the stack with a virtual right boundary at `n`.\n\nO(n) total, since every index enters and leaves the stack at most once.",
    functionName: 'largest_rectangle_area',
    functionSignature: 'def largest_rectangle_area(heights: list[int]) -> int:',
    starter:
      STARTER_HEADER +
      'def largest_rectangle_area(heights: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[2, 1, 5, 6, 2, 3]], expected: 10 },
      { input: [[2, 4]], expected: 4 },
    ],
    hiddenTests: [
      { input: [[1, 1, 1, 1]], expected: 4 },
      { input: [[5, 4, 1, 2]], expected: 8 },
      { input: [[6]], expected: 6 },
      { input: [[]], expected: 0 },
    ],
  },

  // ===== Linked List (additional) =====
  {
    id: 'add-two-numbers',
    number: 101,
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    topic: 'Linked List',
    statement:
      "Two non-negative integers are encoded as digit lists where the *least significant* digit comes first (so `342` is `[2, 4, 3]`). Add them and return the sum in the same reversed-digit format.\n\nNeither input list has leading zeros (except the number 0 itself).",
    explanation:
      "Reversed digits is the format you actually want for column addition — index 0 is the ones place, index 1 the tens, etc. Just walk both lists in lockstep adding the digits plus a running carry.\n\nLoop while either index is in range or the carry is non-zero. At each step compute `s = a + b + carry`, append `s % 10` to the result, set `carry = s // 10`, advance both indices. Empty positions count as 0.\n\nO(max(n, m)) time, O(max(n, m)) space.",
    functionName: 'add_two_numbers',
    functionSignature: 'def add_two_numbers(l1: list[int], l2: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def add_two_numbers(l1: list[int], l2: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
      { input: [[0], [0]], expected: [0] },
    ],
    hiddenTests: [
      { input: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expected: [8, 9, 9, 9, 0, 0, 0, 1] },
      { input: [[1], [9, 9, 9]], expected: [0, 0, 0, 1] },
      { input: [[5], [5]], expected: [0, 1] },
    ],
  },
  {
    id: 'swap-pairs',
    number: 102,
    title: 'Swap Nodes in Pairs',
    difficulty: 'Medium',
    topic: 'Linked List',
    statement:
      "Given the values of a singly linked list as a Python list, swap every two adjacent values. An odd-length list leaves the final value in place. Return the rearranged list.",
    explanation:
      "On the Python-list view, walk the list two indices at a time and swap `values[i]` with `values[i + 1]`. Stop when `i + 1` is out of bounds.\n\nThe interview answer on a real linked list re-routes pointers instead of touching values. Use a dummy node, walk with `prev` initially pointing at it; while `prev.next` and `prev.next.next` both exist, let `a = prev.next` and `b = a.next`, then splice `prev → b → a → b.next` and advance `prev = a` for the next pair. O(n) time, O(1) space.",
    functionName: 'swap_pairs',
    functionSignature: 'def swap_pairs(head: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def swap_pairs(head: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4]], expected: [2, 1, 4, 3] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[1]], expected: [1] },
      { input: [[1, 2, 3]], expected: [2, 1, 3] },
      { input: [[1, 2, 3, 4, 5]], expected: [2, 1, 4, 3, 5] },
    ],
  },
  {
    id: 'odd-even-linked-list',
    number: 103,
    title: 'Odd Even Linked List',
    difficulty: 'Medium',
    topic: 'Linked List',
    statement:
      "Given the values of a singly linked list as a Python list, rearrange them so that every value at an *odd* position (1-based: positions 1, 3, 5, ...) comes first, followed by every value at an *even* position, preserving their relative order. Return the rearranged list.",
    explanation:
      "Walk the values once collecting two parallel lists `odd` (indices 0, 2, 4, ...) and `even` (indices 1, 3, 5, ...). Concatenate `odd + even`.\n\nThe in-place version on a real linked list weaves two chains in parallel: pointers `odd` and `even` advance two nodes at a time, splicing `odd.next = odd.next.next` and `even.next = even.next.next`. After the walk, link the tail of the odd chain to the head of the even chain.\n\nO(n) time, O(n) for the Python-list version (O(1) for the in-place version).",
    functionName: 'odd_even_list',
    functionSignature: 'def odd_even_list(head: list[int]) -> list[int]:',
    starter:
      STARTER_HEADER + 'def odd_even_list(head: list[int]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5]], expected: [1, 3, 5, 2, 4] },
      { input: [[2, 1, 3, 5, 6, 4, 7]], expected: [2, 3, 6, 7, 1, 5, 4] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[1, 2]], expected: [1, 2] },
    ],
  },
  {
    id: 'rotate-list',
    number: 104,
    title: 'Rotate List',
    difficulty: 'Medium',
    topic: 'Linked List',
    statement:
      "Given the values of a singly linked list as a Python list and a non-negative integer `k`, rotate the list to the right by `k` positions. The last value wraps to the front, the second-to-last to second, and so on. Return the rotated list.",
    explanation:
      "Rotating by a multiple of `n` (the length) is a no-op, so first reduce `k = k % n`. The result is `values[-k:] + values[:-k]`, an O(n) slice.\n\nFor the linked-list version, find the length and the tail node in one pass. Make the list circular by linking the tail to the head. Then walk `n − k` steps from the head to find the new tail; sever after it and the node after is the new head. O(n) time, O(1) space.\n\nGuard against the empty list and the `n == 0` case before computing the modulo.",
    functionName: 'rotate_right',
    functionSignature: 'def rotate_right(head: list[int], k: int) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def rotate_right(head: list[int], k: int) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
      { input: [[0, 1, 2], 4], expected: [2, 0, 1] },
    ],
    hiddenTests: [
      { input: [[], 1], expected: [] },
      { input: [[1], 0], expected: [1] },
      { input: [[1, 2], 3], expected: [2, 1] },
    ],
  },
  {
    id: 'reverse-k-group',
    number: 105,
    title: 'Reverse Nodes in K-Group',
    difficulty: 'Hard',
    topic: 'Linked List',
    statement:
      "Given the values of a singly linked list as a Python list and a positive integer `k`, reverse every consecutive block of `k` values. A trailing block with fewer than `k` values is left as-is. Return the result.",
    explanation:
      "On the Python-list view, walk in steps of `k`: for each start index `i`, if `i + k <= n`, reverse `values[i:i+k]` in place; otherwise leave it. Two pointers swapping inward inside each block keep the work in O(n).\n\nThe linked-list version is the classic interview answer. Use a dummy head and a `group_prev` pointer initially pointing at the dummy. While there are at least `k` nodes ahead of `group_prev`, identify the `k`-th node (`kth`), remember `group_next = kth.next`, reverse the `k`-segment in place (standard three-pointer reverse but stop when you reach `group_next`), then splice the reversed head onto `group_prev` and advance `group_prev` to the new tail of the just-reversed block. O(n) time, O(1) space.",
    functionName: 'reverse_k_group',
    functionSignature: 'def reverse_k_group(head: list[int], k: int) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def reverse_k_group(head: list[int], k: int) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [2, 1, 4, 3, 5] },
      { input: [[1, 2, 3, 4, 5], 3], expected: [3, 2, 1, 4, 5] },
    ],
    hiddenTests: [
      { input: [[1, 2, 3, 4, 5, 6], 3], expected: [3, 2, 1, 6, 5, 4] },
      { input: [[1, 2, 3, 4, 5], 1], expected: [1, 2, 3, 4, 5] },
      { input: [[1], 2], expected: [1] },
    ],
  },

  // ===== Tree (additional) =====
  {
    id: 'balanced-binary-tree',
    number: 106,
    title: 'Balanced Binary Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "A binary tree is given as a level-order array with `None` marking missing nodes. The tree is *height-balanced* when, at every node, the heights of its two subtrees differ by at most 1. Return `True` if the input tree is balanced, `False` otherwise. An empty tree is balanced.",
    explanation:
      "The naive solution computes `height` recursively at every node and re-checks the balance condition — O(n²) on a skewed tree because heights get recomputed repeatedly.\n\nThe O(n) idiom is to fold the balance check into the height recursion. Write `height(node)` that returns the subtree height *or* a sentinel like `-1` to signal an imbalance found below. At each call: recurse left, bail if `-1`; recurse right, bail if `-1`; if `abs(left − right) > 1`, return `-1`; otherwise return `1 + max(left, right)`. The root is balanced iff the top-level call doesn't return `-1`.\n\nO(n) time, O(h) recursion depth.",
    functionName: 'is_balanced',
    functionSignature: 'def is_balanced(root: list) -> bool:',
    starter:
      STARTER_HEADER +
      'def is_balanced(root: list) -> bool:\n    # root is a level-order array; None marks missing nodes.\n    pass\n',
    examples: [
      { input: [[3, 9, 20, null, null, 15, 7]], expected: true },
      { input: [[1, 2, 2, 3, 3, null, null, 4, 4]], expected: false },
    ],
    hiddenTests: [
      { input: [[]], expected: true },
      { input: [[1]], expected: true },
      { input: [[1, 2, null, 3]], expected: false },
    ],
  },
  {
    id: 'diameter-binary-tree',
    number: 107,
    title: 'Diameter of Binary Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "A binary tree is given as a level-order array with `None` for missing nodes. The *diameter* is the number of edges on the longest path between any two nodes — that path doesn't have to pass through the root. Return the diameter.",
    explanation:
      "For any node, the longest path that *passes through* it is `depth(left) + depth(right)` edges, where `depth` counts edges down to the deepest leaf. The diameter is the maximum of that quantity over every node.\n\nDo one DFS that returns `depth` but also updates a global best. At each node: `l = depth(left)`, `r = depth(right)`, update `best = max(best, l + r)`, return `1 + max(l, r)`. Empty subtrees have depth `0` (zero edges).\n\nO(n) time, O(h) recursion depth.",
    functionName: 'diameter_of_binary_tree',
    functionSignature: 'def diameter_of_binary_tree(root: list) -> int:',
    starter:
      STARTER_HEADER +
      'def diameter_of_binary_tree(root: list) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5]], expected: 3 },
      { input: [[1, 2]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 0 },
      { input: [[1, 2, 3, 4, null, null, 5, 6, null, null, 7]], expected: 5 },
    ],
  },
  {
    id: 'path-sum',
    number: 108,
    title: 'Path Sum',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "A binary tree is given as a level-order array with `None` for missing nodes, plus an integer `target_sum`. Return `True` if some root-to-leaf path's node values add up to exactly `target_sum`. A *leaf* is a node with no children. An empty tree has no paths, so the answer is `False`.",
    explanation:
      "Walk the tree once with DFS, threading the remaining sum down the recursion. At a leaf, return whether the leaf's value equals the remaining target. At an internal node, return `True` if either child finds a valid path with `target − node.val`.\n\nThe corner case is the empty tree — return `False` without recursing. Single-node tree: `True` iff `root.val == target_sum`.\n\nO(n) time, O(h) recursion depth.",
    functionName: 'has_path_sum',
    functionSignature: 'def has_path_sum(root: list, target_sum: int) -> bool:',
    starter:
      STARTER_HEADER +
      'def has_path_sum(root: list, target_sum: int) -> bool:\n    pass\n',
    examples: [
      { input: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], expected: true },
      { input: [[1, 2, 3], 5], expected: false },
    ],
    hiddenTests: [
      { input: [[], 0], expected: false },
      { input: [[1, 2], 1], expected: false },
      { input: [[1, 2], 3], expected: true },
    ],
  },
  {
    id: 'path-sum-ii',
    number: 109,
    title: 'Path Sum II',
    difficulty: 'Medium',
    topic: 'Tree',
    statement:
      "Given a binary tree as a level-order array (with `None` for missing nodes) and an integer `target_sum`, return every root-to-leaf path whose values sum to `target_sum`. Each path is a list of node values from root to leaf. Order of paths in the output doesn't matter.",
    explanation:
      "DFS with a running `path` list and a running `remaining = target_sum − node.val`. At a leaf, if `remaining == 0`, append a *copy* of `path` to the results. Push `node.val` before recursing into the children; pop after — standard backtracking pattern so the same list can be reused.\n\nO(n²) worst-case time because copying complete paths into the output is O(path length) and there can be O(n) such paths; O(n) auxiliary space for the path stack.",
    functionName: 'path_sum',
    functionSignature: 'def path_sum(root: list, target_sum: int) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def path_sum(root: list, target_sum: int) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22],
        expected: [[5, 4, 11, 2], [5, 8, 4, 5]],
      },
      { input: [[1, 2, 3], 5], expected: [] },
    ],
    hiddenTests: [
      { input: [[], 0], expected: [] },
      { input: [[1, 2], 3], expected: [[1, 2]] },
      { input: [[1], 1], expected: [[1]] },
    ],
  },
  {
    id: 'right-side-view',
    number: 110,
    title: 'Binary Tree Right Side View',
    difficulty: 'Medium',
    topic: 'Tree',
    statement:
      "A binary tree is given as a level-order array with `None` for missing nodes. If you stand to the right of the tree and look at it, which nodes are visible at each depth? Return their values from top to bottom.",
    explanation:
      "The visible node at each depth is the rightmost real node on that level. Two clean implementations:\n\n**BFS, take the last on each level.** Walk level by level with a queue (built from the level-order array or a reconstructed node tree). After processing all nodes at the current depth, append the last one's value to the result.\n\n**DFS, right-child first.** Recurse right before left, threading the current depth. The first node you encounter at any new depth is the rightmost — append it and don't overwrite later.\n\nBoth are O(n) time, O(h) space.",
    functionName: 'right_side_view',
    functionSignature: 'def right_side_view(root: list) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def right_side_view(root: list) -> list[int]:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
      { input: [[1, null, 3]], expected: [1, 3] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[1, 2, 3, 4]], expected: [1, 3, 4] },
    ],
  },
  {
    id: 'sorted-array-to-bst',
    number: 111,
    title: 'Convert Sorted Array to Binary Search Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "Given an integer list `nums` sorted in strictly ascending order, build a height-balanced binary search tree containing those values. Return the tree as a level-order array with `None` for missing nodes. Multiple valid trees may exist — any height-balanced one is accepted.",
    explanation:
      "Take the middle element as the root; everything to its left in the array forms the left subtree, everything to the right forms the right subtree. Recurse. Because each subtree gets exactly half the slice, the result is balanced.\n\nBuild the tree as Node objects first (or directly compute the level-order array via a queue traversal at the end). The canonical solution picks `mid = (lo + hi) // 2`; picking `mid = (lo + hi + 1) // 2` produces a mirror-image valid tree.\n\nO(n) time, O(log n) recursion depth.",
    functionName: 'sorted_array_to_bst',
    functionSignature: 'def sorted_array_to_bst(nums: list[int]) -> list:',
    starter:
      STARTER_HEADER + 'def sorted_array_to_bst(nums: list[int]) -> list:\n    pass\n',
    examples: [
      { input: [[-10, -3, 0, 5, 9]], expected: [0, -10, 5, null, -3, null, 9] },
      { input: [[1, 3]], expected: [1, null, 3] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1]], expected: [1] },
      { input: [[1, 2, 3]], expected: [2, 1, 3] },
    ],
  },
  {
    id: 'lca-binary-tree',
    number: 112,
    title: 'Lowest Common Ancestor of Binary Tree',
    difficulty: 'Medium',
    topic: 'Tree',
    statement:
      "A binary tree is given as a level-order array (with `None` for missing nodes) plus two distinct values `p` and `q`, both guaranteed to appear in the tree. The *lowest common ancestor* (LCA) is the deepest node that has both `p` and `q` in its subtree. Return the LCA's value.",
    explanation:
      "Define `lca(node)` recursively. Base case: if `node` is `None` or `node.val == p` or `node.val == q`, return `node`.\n\nOtherwise recurse into both children. If both calls return a non-`None` result, this node is the split point — return it. Otherwise return whichever child's call was non-`None` (it propagates upward the single matching subtree).\n\nThis works because the first ancestor that sees `p` in one subtree and `q` in the other is exactly the LCA. The walk visits each node at most once.\n\nO(n) time, O(h) recursion depth.",
    functionName: 'lowest_common_ancestor',
    functionSignature:
      'def lowest_common_ancestor(root: list, p: int, q: int) -> int:',
    starter:
      STARTER_HEADER +
      'def lowest_common_ancestor(root: list, p: int, q: int) -> int:\n    pass\n',
    examples: [
      { input: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
      { input: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
    ],
    hiddenTests: [
      { input: [[1, 2], 1, 2], expected: 1 },
      { input: [[1, 2, 3], 2, 3], expected: 1 },
      { input: [[1, 2, 3, 4, 5], 4, 5], expected: 2 },
    ],
  },
  {
    id: 'symmetric-tree',
    number: 113,
    title: 'Symmetric Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    statement:
      "A binary tree is given as a level-order array with `None` for missing nodes. Return `True` if the tree is a mirror image of itself around the root (same shape and same values when reflected left-to-right). An empty tree is symmetric.",
    explanation:
      "Compare the tree against its mirror by running two pointers from the root, one going left and one going right.\n\nDefine `mirror(a, b)`: if both are `None`, return `True`. If exactly one is `None` or their values differ, return `False`. Otherwise return `mirror(a.left, b.right) and mirror(a.right, b.left)`. Start with `mirror(root.left, root.right)`.\n\nO(n) time, O(h) recursion depth. An iterative version pushes pairs onto a queue and checks them in lockstep.",
    functionName: 'is_symmetric',
    functionSignature: 'def is_symmetric(root: list) -> bool:',
    starter:
      STARTER_HEADER + 'def is_symmetric(root: list) -> bool:\n    pass\n',
    examples: [
      { input: [[1, 2, 2, 3, 4, 4, 3]], expected: true },
      { input: [[1, 2, 2, null, 3, null, 3]], expected: false },
    ],
    hiddenTests: [
      { input: [[]], expected: true },
      { input: [[1]], expected: true },
      { input: [[1, 2, 2]], expected: true },
    ],
  },

  // ===== Heap / Top K (additional) =====
  {
    id: 'kth-largest-element',
    number: 114,
    title: 'Kth Largest Element in Array',
    difficulty: 'Medium',
    topic: 'Heap',
    statement:
      "Given an integer list `nums` and a positive integer `k`, return the `k`-th *largest* value when `nums` is considered as a multiset (duplicates count). For example, in `[3, 2, 1, 5, 6, 4]` the 2nd largest is `5`.",
    explanation:
      "Three classic ways:\n\n**Sort.** `sorted(nums, reverse=True)[k - 1]` is O(n log n) and a one-liner. Good warm-up answer.\n\n**Min-heap of size k.** Push the first `k` values onto a min-heap. For each remaining value, if it beats the heap's root, replace the root with it (`heappushpop`). The heap always holds the top `k` seen so far; the root is the answer. O(n log k) time, O(k) space.\n\n**Quickselect.** Partition around a pivot just like in quicksort, then recurse into the side containing the target index. Expected O(n) time, worst O(n²). The mainstream interview-favorite when asked to beat O(n log n).",
    functionName: 'find_kth_largest',
    functionSignature: 'def find_kth_largest(nums: list[int], k: int) -> int:',
    starter:
      STARTER_HEADER +
      'def find_kth_largest(nums: list[int], k: int) -> int:\n    pass\n',
    examples: [
      { input: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
    ],
    hiddenTests: [
      { input: [[1], 1], expected: 1 },
      { input: [[7, 7, 7], 2], expected: 7 },
      { input: [[1, 2, 3, 4, 5], 5], expected: 1 },
    ],
  },
  {
    id: 'k-closest-points',
    number: 115,
    title: 'K Closest Points to Origin',
    difficulty: 'Medium',
    topic: 'Heap',
    statement:
      "A list `points` holds 2D coordinates as `[x, y]` pairs. Return the `k` points closest to the origin by Euclidean distance, sorted ascending by distance and breaking ties by their original index in `points` (stable). Distance is `sqrt(x² + y²)`, but you can compare on squared distance.",
    explanation:
      "Squared distance preserves the ordering of Euclidean distance, so always compare on `x² + y²` and skip the square root.\n\n**Sort.** Pair each point with its index and stable-sort by `(dist², idx)`. Take the first `k`. O(n log n) and gives the deterministic order the grader expects.\n\n**Max-heap of size k.** O(n log k) but you have to sort the final `k` to match the required order — push `(dist², idx, point)` so the comparator breaks ties by original index.\n\n**Quickselect.** O(n) expected to pick the `k` closest unordered, then a final sort gives the answer.",
    functionName: 'k_closest',
    functionSignature: 'def k_closest(points: list[list[int]], k: int) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def k_closest(points: list[list[int]], k: int) -> list[list[int]]:\n    pass\n',
    examples: [
      { input: [[[1, 3], [-2, 2]], 1], expected: [[-2, 2]] },
      { input: [[[3, 3], [5, -1], [-2, 4]], 2], expected: [[3, 3], [-2, 4]] },
    ],
    hiddenTests: [
      { input: [[[0, 0]], 1], expected: [[0, 0]] },
      { input: [[[1, 1], [2, 2], [3, 3]], 3], expected: [[1, 1], [2, 2], [3, 3]] },
      { input: [[[1, 0], [0, 1]], 2], expected: [[1, 0], [0, 1]] },
    ],
  },
  {
    id: 'last-stone-weight',
    number: 116,
    title: 'Last Stone Weight',
    difficulty: 'Easy',
    topic: 'Heap',
    statement:
      "A list `stones` represents stone weights. Each round, pick the two heaviest stones; if they weigh the same, both shatter, otherwise they merge into a single stone whose weight is the difference. Repeat until at most one stone remains. Return its weight, or `0` if everything shattered.",
    explanation:
      "The operation always touches the two largest values — exactly what a max-heap gives you in O(log n).\n\nLoad every weight into a max-heap (in Python, negate values to simulate a max-heap on top of `heapq`). While the heap has at least two stones, pop the two largest, push back the difference if non-zero, and loop. At the end, return whatever single stone is left, or `0` if the heap is empty.\n\nO(n log n) total — each round is O(log n) and there are at most `n − 1` rounds.",
    functionName: 'last_stone_weight',
    functionSignature: 'def last_stone_weight(stones: list[int]) -> int:',
    starter:
      STARTER_HEADER + 'def last_stone_weight(stones: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { input: [[1]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[1, 3]], expected: 2 },
      { input: [[2, 2]], expected: 0 },
      { input: [[10, 4, 2, 10]], expected: 2 },
    ],
  },
  {
    id: 'task-scheduler',
    number: 117,
    title: 'Task Scheduler',
    difficulty: 'Medium',
    topic: 'Heap',
    statement:
      "Given a list of `tasks` (each task is a single uppercase letter) and a non-negative cooldown `n`, schedule the tasks on a single CPU. Each unit of time, the CPU either runs a task or sits idle, but two runs of the same task must be at least `n` time units apart. Return the minimum total time needed to finish every task.",
    explanation:
      "The bottleneck is the most frequent task. If letter `X` appears `m` times, the schedule must contain `m − 1` gaps of length `n` between its runs, giving a length of at least `(m − 1) × (n + 1) + 1`.\n\nIf several letters tie for the maximum frequency `m`, each one occupies one slot at the tail of those `(m − 1)` blocks plus the final block — so the lower bound becomes `(m − 1) × (n + 1) + k`, where `k` is the count of letters with maximum frequency.\n\nThe answer is `max(len(tasks), (m − 1) × (n + 1) + k)`. The `len(tasks)` term covers the case when there's no idle time needed (the cooldown is small relative to the task variety).\n\nO(n) time, O(1) space (26 letters).",
    functionName: 'least_interval',
    functionSignature: 'def least_interval(tasks: list[str], n: int) -> int:',
    starter:
      STARTER_HEADER + 'def least_interval(tasks: list[str], n: int) -> int:\n    pass\n',
    examples: [
      { input: [['A', 'A', 'A', 'B', 'B', 'B'], 2], expected: 8 },
      { input: [['A', 'C', 'A', 'B', 'D', 'B'], 1], expected: 6 },
    ],
    hiddenTests: [
      { input: [['A', 'A', 'A', 'B', 'B', 'B'], 0], expected: 6 },
      { input: [['A'], 0], expected: 1 },
      { input: [['A', 'B', 'C'], 1], expected: 3 },
    ],
  },
  {
    id: 'furthest-building',
    number: 118,
    title: 'Furthest Building You Can Reach',
    difficulty: 'Medium',
    topic: 'Heap',
    statement:
      "An array `heights` lists building heights side by side. You start at building 0 and want to reach the furthest building you can. Going from `i` to `i + 1`: if the next building is shorter or the same, the move is free; if it's taller, you must either spend bricks equal to the height difference *or* use one ladder. You have `bricks` bricks and `ladders` ladders. Return the furthest building index you can reach.",
    explanation:
      "Greedy: ladders are precious, so spend them on the biggest climbs and pay bricks for the rest.\n\nWalk forward maintaining a min-heap of the climb costs you've spent ladders on so far. For each positive height jump, push it onto the heap. If the heap now holds more than `ladders` climbs, the smallest one is no longer ladder-worthy — pop it and pay its cost in bricks. If your bricks would go negative, stop at the current building. Otherwise the loop finishes at the last building.\n\nO(n log L) where L is the ladder count, O(L) extra space.",
    functionName: 'furthest_building',
    functionSignature:
      'def furthest_building(heights: list[int], bricks: int, ladders: int) -> int:',
    starter:
      STARTER_HEADER +
      'def furthest_building(heights: list[int], bricks: int, ladders: int) -> int:\n    pass\n',
    examples: [
      { input: [[4, 2, 7, 6, 9, 14, 12], 5, 1], expected: 4 },
      { input: [[4, 12, 2, 7, 3, 18, 20, 3, 19], 10, 2], expected: 7 },
    ],
    hiddenTests: [
      { input: [[14, 3, 19, 3], 17, 0], expected: 3 },
      { input: [[1, 2, 3, 4], 0, 0], expected: 0 },
      { input: [[1, 5, 1, 2, 3, 4, 100], 4, 1], expected: 6 },
    ],
  },

  // ===== Graph (additional) =====
  {
    id: 'course-schedule-ii',
    number: 119,
    title: 'Course Schedule II',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "There are `num_courses` numbered `0..num_courses − 1`. A list of `prerequisites` contains pairs `[a, b]` meaning you must take `b` before `a`. Return any order of courses that satisfies every prerequisite. If a cycle prevents a valid order, return an empty list.\n\nFor determinism, when multiple courses are ready at the same time, schedule the lowest-numbered one first.",
    explanation:
      "Kahn's algorithm — BFS topological sort.\n\n1. Build an adjacency list `next_courses[b]` and an `indegree` count for every course.\n2. Put every course with `indegree == 0` into a min-heap (the heap is what makes the output deterministic by always picking the lowest-numbered ready course next).\n3. Pop courses one at a time, append to the result. For each neighbor, decrement its indegree and push it onto the heap if it just hit zero.\n4. If the result has all `num_courses`, return it. Otherwise a cycle remained — return `[]`.\n\nO((V + E) log V) with the heap (without the determinism heap it's O(V + E)).",
    functionName: 'find_order',
    functionSignature:
      'def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:\n    pass\n',
    examples: [
      { input: [2, [[1, 0]]], expected: [0, 1] },
      { input: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3] },
    ],
    hiddenTests: [
      { input: [1, []], expected: [0] },
      { input: [2, [[1, 0], [0, 1]]], expected: [] },
      { input: [3, []], expected: [0, 1, 2] },
    ],
  },
  {
    id: 'redundant-connection',
    number: 120,
    title: 'Redundant Connection',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "A tree of `n` nodes (numbered `1..n`) has had one extra edge added, producing a graph with exactly one cycle. Given the edges in the order they were added (a list of `[u, v]` pairs), return the edge that closes the cycle. If multiple extra edges existed, return the one that appears last.",
    explanation:
      "Process edges in order using Union-Find. For each `[u, v]`:\n\n- If `u` and `v` are already in the same component, this edge would create a cycle — it's the redundant one. Return it.\n- Otherwise union the two components and continue.\n\nThe last edge that hits the same-component check is exactly the answer. O(n · α(n)) time with path compression + union by rank, effectively linear.",
    functionName: 'find_redundant_connection',
    functionSignature:
      'def find_redundant_connection(edges: list[list[int]]) -> list[int]:',
    starter:
      STARTER_HEADER +
      'def find_redundant_connection(edges: list[list[int]]) -> list[int]:\n    pass\n',
    examples: [
      { input: [[[1, 2], [1, 3], [2, 3]]], expected: [2, 3] },
      { input: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expected: [1, 4] },
    ],
    hiddenTests: [
      { input: [[[1, 2], [2, 3], [1, 3]]], expected: [1, 3] },
      { input: [[[1, 2], [2, 3], [3, 1], [4, 5], [1, 4]]], expected: [3, 1] },
    ],
  },
  {
    id: 'number-of-provinces',
    number: 121,
    title: 'Number of Provinces',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "An `n × n` matrix `is_connected` describes a friendship graph: `is_connected[i][j] == 1` means cities `i` and `j` are directly connected. Friendship is transitive — if A is connected to B and B to C, then A, B, and C belong to the same province. Return the number of provinces.",
    explanation:
      "Provinces are exactly the connected components of the graph. Two standard ways to count them:\n\n**DFS / BFS sweep.** Walk through each city `i` from `0` to `n − 1`. If you haven't visited it yet, increment your province counter and run DFS/BFS that marks every reachable city as visited. O(n²) total time because the adjacency matrix is `n × n`.\n\n**Union-Find.** Iterate over each pair `(i, j)` with `i < j`; if `is_connected[i][j]`, union them. The answer is the number of distinct roots at the end. Same big-O, slightly more code.",
    functionName: 'find_circle_num',
    functionSignature: 'def find_circle_num(is_connected: list[list[int]]) -> int:',
    starter:
      STARTER_HEADER +
      'def find_circle_num(is_connected: list[list[int]]) -> int:\n    pass\n',
    examples: [
      { input: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], expected: 2 },
      { input: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 1 },
      { input: [[[1]]], expected: 1 },
      { input: [[[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1], [0, 0, 1, 1]]], expected: 2 },
    ],
  },
  {
    id: 'network-delay-time',
    number: 122,
    title: 'Network Delay Time',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "A directed weighted graph has `n` nodes labeled `1..n` and a list of edges `times`, each `[u, v, w]` meaning a signal from `u` reaches `v` after `w` units. A signal is sent from node `k`; return the minimum time for it to reach *every* node. If some node is unreachable, return `-1`.",
    explanation:
      "Classic single-source shortest paths on a non-negative weighted graph — Dijkstra's algorithm.\n\nInitialize `dist[v] = ∞` for all `v` except `dist[k] = 0`. Use a min-heap of `(dist, node)` pairs. Pop the smallest; if its distance is stale (greater than `dist[node]`), skip. Otherwise relax every outgoing edge: if `dist[node] + w < dist[neighbor]`, update and push the new pair.\n\nAfter the heap empties, the answer is `max(dist)` — the time at which the *slowest* node receives the signal. If any `dist[v]` is still `∞`, return `-1`.\n\nO((V + E) log V) time, O(V + E) space.",
    functionName: 'network_delay_time',
    functionSignature:
      'def network_delay_time(times: list[list[int]], n: int, k: int) -> int:',
    starter:
      STARTER_HEADER +
      'def network_delay_time(times: list[list[int]], n: int, k: int) -> int:\n    pass\n',
    examples: [
      { input: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2 },
      { input: [[[1, 2, 1]], 2, 1], expected: 1 },
    ],
    hiddenTests: [
      { input: [[[1, 2, 1]], 2, 2], expected: -1 },
      { input: [[[1, 2, 1], [2, 1, 3]], 2, 2], expected: 3 },
      { input: [[[1, 2, 1], [2, 3, 2], [1, 3, 4]], 3, 1], expected: 3 },
    ],
  },
  {
    id: 'cheapest-flights-k-stops',
    number: 123,
    title: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    topic: 'Graph',
    statement:
      "A directed graph of `n` cities has weighted edges in `flights` (each `[from, to, price]`). Find the cheapest price to fly from `src` to `dst` using at most `k` intermediate stops (so up to `k + 1` flights total). Return `-1` if no such route exists.",
    explanation:
      "Standard Dijkstra doesn't capture the stop limit cleanly because the cheapest path through fewer stops might cost more than a longer one. Two clean fixes:\n\n**Bellman-Ford limited to k + 1 rounds.** Maintain a `dist` array. In each round, for every edge `(u, v, w)`, update a *new* copy `next_dist[v] = min(next_dist[v], dist[u] + w)`. Use a fresh copy so a single round can't propagate through multiple edges. After `k + 1` rounds, `dist[dst]` is the answer.\n\n**State-aware Dijkstra.** Push `(cost, node, stops_used)` onto a min-heap and skip states that exceed `k + 1` stops.\n\nO(k · E) time for Bellman-Ford, which is usually plenty fast.",
    functionName: 'find_cheapest_price',
    functionSignature:
      'def find_cheapest_price(n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:',
    starter:
      STARTER_HEADER +
      'def find_cheapest_price(n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:\n    pass\n',
    examples: [
      {
        input: [
          4,
          [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]],
          0,
          3,
          1,
        ],
        expected: 700,
      },
      {
        input: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1],
        expected: 200,
      },
    ],
    hiddenTests: [
      {
        input: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0],
        expected: 500,
      },
      { input: [2, [[0, 1, 50]], 0, 1, 0], expected: 50 },
      { input: [2, [[0, 1, 50]], 1, 0, 0], expected: -1 },
    ],
  },
  {
    id: 'rotting-oranges',
    number: 124,
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    topic: 'Matrix',
    statement:
      "A `grid` represents a fruit crate where `0` is empty, `1` is a fresh orange, `2` is rotten. Every minute, each rotten orange contaminates its four-directional neighbours that are fresh. Return the minimum number of minutes needed until no fresh orange remains, or `-1` if some fresh orange can never be reached.",
    explanation:
      "Multi-source BFS. Seed a queue with every initially rotten cell at distance `0`, plus a counter of remaining fresh oranges.\n\nStandard BFS: pop a `(r, c, t)`, look at the four neighbours; if a neighbour is fresh, rot it (set to `2`), enqueue with `t + 1`, and decrement the fresh counter. Track the maximum time seen.\n\nAt the end, if `fresh == 0` return the max time; otherwise some fresh orange was unreachable, return `-1`. Edge case: zero fresh oranges to begin with means `0` minutes.\n\nO(R · C) time, O(R · C) space.",
    functionName: 'oranges_rotting',
    functionSignature: 'def oranges_rotting(grid: list[list[int]]) -> int:',
    starter:
      STARTER_HEADER +
      'def oranges_rotting(grid: list[list[int]]) -> int:\n    pass\n',
    examples: [
      { input: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
      { input: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
    ],
    hiddenTests: [
      { input: [[[0, 2]]], expected: 0 },
      { input: [[[0]]], expected: 0 },
      { input: [[[2, 1], [1, 1]]], expected: 2 },
    ],
  },
  {
    id: 'walls-and-gates',
    number: 125,
    title: 'Walls and Gates',
    difficulty: 'Medium',
    topic: 'Matrix',
    statement:
      "A matrix `rooms` represents floors where `-1` is a wall, `0` is a gate, and `2147483647` (the int max constant) is an empty room. Fill every empty room with the distance to its nearest gate using four-directional moves. Walls stay `-1`; rooms that can't reach any gate stay as `2147483647`. Return the updated matrix.",
    explanation:
      "Single-source BFS from each gate is O(R²C²) worst-case. Multi-source BFS from every gate at once is O(R·C).\n\nInitialize a queue containing every gate (cells with value `0`). Run BFS: pop `(r, c)`, look at four neighbours; if a neighbour is `2147483647`, set it to `rooms[r][c] + 1` and enqueue it. Walls never enter the queue.\n\nEvery empty cell is updated at most once because the first time it gets a finite distance, it's by definition the shortest. O(R·C) time, O(R·C) space.",
    functionName: 'walls_and_gates',
    functionSignature: 'def walls_and_gates(rooms: list[list[int]]) -> list[list[int]]:',
    starter:
      STARTER_HEADER +
      'def walls_and_gates(rooms: list[list[int]]) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [
          [
            [2147483647, -1, 0, 2147483647],
            [2147483647, 2147483647, 2147483647, -1],
            [2147483647, -1, 2147483647, -1],
            [0, -1, 2147483647, 2147483647],
          ],
        ],
        expected: [
          [3, -1, 0, 1],
          [2, 2, 1, -1],
          [1, -1, 2, -1],
          [0, -1, 3, 4],
        ],
      },
      { input: [[[-1]]], expected: [[-1]] },
    ],
    hiddenTests: [
      { input: [[[0]]], expected: [[0]] },
      { input: [[[2147483647]]], expected: [[2147483647]] },
      { input: [[[0, 2147483647], [2147483647, 2147483647]]], expected: [[0, 1], [1, 2]] },
    ],
  },
  {
    id: 'surrounded-regions',
    number: 126,
    title: 'Surrounded Regions',
    difficulty: 'Medium',
    topic: 'Matrix',
    statement:
      "An `m × n` `board` contains the characters `'X'` and `'O'`. A region of `'O'` cells is *surrounded* if no cell in the region touches the border. Flip every surrounded region to `'X'` and leave border-touching regions alone. Return the modified board.",
    explanation:
      "Inverted approach: instead of finding surrounded regions, find the *un-surrounded* ones — they're the `'O'` cells reachable from the border.\n\n1. Walk the four borders. For each `'O'` you find, run DFS/BFS that marks every connected `'O'` with a temporary sentinel like `'#'`.\n2. After that sweep, every `'O'` left in the board is part of a surrounded region. Flip it to `'X'`.\n3. Flip every `'#'` back to `'O'`.\n\nO(m·n) time, O(m·n) recursion in the worst case.",
    functionName: 'solve_surrounded',
    functionSignature: 'def solve_surrounded(board: list[list[str]]) -> list[list[str]]:',
    starter:
      STARTER_HEADER +
      'def solve_surrounded(board: list[list[str]]) -> list[list[str]]:\n    pass\n',
    examples: [
      {
        input: [
          [
            ['X', 'X', 'X', 'X'],
            ['X', 'O', 'O', 'X'],
            ['X', 'X', 'O', 'X'],
            ['X', 'O', 'X', 'X'],
          ],
        ],
        expected: [
          ['X', 'X', 'X', 'X'],
          ['X', 'X', 'X', 'X'],
          ['X', 'X', 'X', 'X'],
          ['X', 'O', 'X', 'X'],
        ],
      },
      { input: [[['X']]], expected: [['X']] },
    ],
    hiddenTests: [
      { input: [[['O']]], expected: [['O']] },
      { input: [[['O', 'O'], ['O', 'O']]], expected: [['O', 'O'], ['O', 'O']] },
      {
        input: [[['X', 'X', 'X'], ['X', 'O', 'X'], ['X', 'X', 'X']]],
        expected: [['X', 'X', 'X'], ['X', 'X', 'X'], ['X', 'X', 'X']],
      },
    ],
  },

  // ===== Greedy =====
  {
    id: 'jump-game-ii',
    number: 127,
    title: 'Jump Game II',
    difficulty: 'Medium',
    topic: 'Greedy',
    statement:
      "A non-negative integer list `nums` represents max jump lengths from each position. You start at index 0 and want to reach the last index using the fewest jumps. You're guaranteed the last index is reachable. Return the minimum number of jumps.",
    explanation:
      "Greedy BFS-style sweep. Think of each jump as advancing to the *next layer* of indices reachable using one more jump.\n\nKeep three running values: `jumps` (answer so far), `current_end` (the rightmost index reachable with `jumps` jumps), and `farthest` (the rightmost index reachable with `jumps + 1` jumps). Walk `i` from `0` to `n − 2`. At each step, update `farthest = max(farthest, i + nums[i])`. When `i` hits `current_end`, you've exhausted the current layer — increment `jumps` and set `current_end = farthest`.\n\nO(n) time, O(1) space.",
    functionName: 'jump',
    functionSignature: 'def jump(nums: list[int]) -> int:',
    starter: STARTER_HEADER + 'def jump(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[2, 3, 1, 1, 4]], expected: 2 },
      { input: [[2, 3, 0, 1, 4]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[1, 1, 1, 1]], expected: 3 },
      { input: [[1]], expected: 0 },
      { input: [[5, 1, 1, 1, 1, 1]], expected: 1 },
    ],
  },
  {
    id: 'gas-station',
    number: 128,
    title: 'Gas Station',
    difficulty: 'Medium',
    topic: 'Greedy',
    statement:
      "A circular route has `n` gas stations. Station `i` has `gas[i]` fuel; driving from station `i` to `i + 1` costs `cost[i]` fuel. With an empty tank that starts at any station, return the starting index that lets you complete one full loop, or `-1` if it's impossible.\n\nIf a solution exists, it's unique.",
    explanation:
      "Two key observations:\n\n1. If `sum(gas) < sum(cost)`, no starting station works — there isn't enough fuel total. Return `-1`.\n2. If a solution exists, it's the first station after the last point where the running tank goes negative.\n\nWalk through stations tracking `tank += gas[i] − cost[i]`. If `tank` ever drops below zero, no station from the current `start..i` could have made it — reset `tank = 0` and tentatively set `start = i + 1`. After one pass, `start` is the answer (validated by check 1).\n\nO(n) time, O(1) space.",
    functionName: 'can_complete_circuit',
    functionSignature:
      'def can_complete_circuit(gas: list[int], cost: list[int]) -> int:',
    starter:
      STARTER_HEADER +
      'def can_complete_circuit(gas: list[int], cost: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
      { input: [[2, 3, 4], [3, 4, 3]], expected: -1 },
    ],
    hiddenTests: [
      { input: [[5], [4]], expected: 0 },
      { input: [[1, 1, 1], [2, 2, 2]], expected: -1 },
      { input: [[4, 5, 2, 6, 5, 3], [3, 2, 7, 3, 2, 9]], expected: -1 },
    ],
  },
  {
    id: 'partition-labels',
    number: 129,
    title: 'Partition Labels',
    difficulty: 'Medium',
    topic: 'Greedy',
    statement:
      "A string `s` should be split into the largest possible number of non-overlapping parts such that each letter appears in only one part. Return the lengths of the parts in left-to-right order.",
    explanation:
      "First, record the *last* index at which each character appears (one pass over `s`).\n\nThen walk a second pass with two pointers `start` and `end`. As you advance `i`, update `end = max(end, last[s[i]])` — the current partition can't close before every occurrence of every letter seen so far. When `i == end`, that partition is complete: append `end − start + 1` to the answer and set `start = i + 1`.\n\nO(n) time, O(1) space (26-letter alphabet).",
    functionName: 'partition_labels',
    functionSignature: 'def partition_labels(s: str) -> list[int]:',
    starter:
      STARTER_HEADER + 'def partition_labels(s: str) -> list[int]:\n    pass\n',
    examples: [
      { input: ['ababcbacadefegdehijhklij'], expected: [9, 7, 8] },
      { input: ['eccbbbbdec'], expected: [10] },
    ],
    hiddenTests: [
      { input: ['a'], expected: [1] },
      { input: ['abcd'], expected: [1, 1, 1, 1] },
      { input: ['aaaa'], expected: [4] },
    ],
  },
  {
    id: 'hand-of-straights',
    number: 130,
    title: 'Hand of Straights',
    difficulty: 'Medium',
    topic: 'Greedy',
    statement:
      "You're holding a `hand` of cards labeled by integer ranks. Decide whether the cards can be split into groups of exactly `group_size` consecutive integers each (e.g., `[3, 4, 5]` is a valid group of size 3). Return `True` if possible, `False` otherwise.",
    explanation:
      "Greedy plus a multiset/count map. The smallest remaining rank must start some group, because no smaller card exists to pair with it. So:\n\n1. Count each rank's frequency in a dict.\n2. Iterate over the *sorted unique ranks* (or use a min-heap of unique values).\n3. For each rank `r` whose count is still positive, try to consume `count[r]` groups starting at `r`: for each `j` in `[r, r + group_size − 1]`, subtract `count[r]` from `count[j]`. If any `count[j]` is missing or insufficient, return `False`.\n\nO(n log n) for sorting plus O(n · group_size) in the worst case for the inner subtraction.",
    functionName: 'is_n_straight_hand',
    functionSignature:
      'def is_n_straight_hand(hand: list[int], group_size: int) -> bool:',
    starter:
      STARTER_HEADER +
      'def is_n_straight_hand(hand: list[int], group_size: int) -> bool:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], expected: true },
      { input: [[1, 2, 3, 4, 5], 4], expected: false },
    ],
    hiddenTests: [
      { input: [[1, 2, 3, 4, 5, 6], 2], expected: true },
      { input: [[1], 1], expected: true },
      { input: [[1, 1, 2, 2, 3, 3], 3], expected: true },
    ],
  },

  // ===== Backtracking =====
  {
    id: 'permutations',
    number: 131,
    title: 'Permutations',
    difficulty: 'Medium',
    topic: 'Backtracking',
    statement:
      "Given a list `nums` of distinct integers, return every permutation of its values. Output the permutations sorted in ascending lexicographic order.",
    explanation:
      "Recursive backtracking. Maintain a running `path` and a `used` boolean array; pick the next position from the unused values one at a time.\n\nFor deterministic, lex-sorted output: sort `nums` once at the start and iterate candidates in that order at every recursion level. Each time the path reaches length `n`, copy it into the answer.\n\nO(n · n!) time, O(n) recursion depth.",
    functionName: 'permute',
    functionSignature: 'def permute(nums: list[int]) -> list[list[int]]:',
    starter:
      STARTER_HEADER + 'def permute(nums: list[int]) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [[1, 2, 3]],
        expected: [
          [1, 2, 3],
          [1, 3, 2],
          [2, 1, 3],
          [2, 3, 1],
          [3, 1, 2],
          [3, 2, 1],
        ],
      },
      { input: [[1]], expected: [[1]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [[]] },
      { input: [[0, 1]], expected: [[0, 1], [1, 0]] },
      {
        input: [[3, 1, 2]],
        expected: [
          [1, 2, 3],
          [1, 3, 2],
          [2, 1, 3],
          [2, 3, 1],
          [3, 1, 2],
          [3, 2, 1],
        ],
      },
    ],
  },
  {
    id: 'combinations',
    number: 132,
    title: 'Combinations',
    difficulty: 'Medium',
    topic: 'Backtracking',
    statement:
      "Given integers `n` and `k`, return every combination of `k` distinct numbers chosen from `[1, 2, ..., n]`. Each combination's values are listed in ascending order, and the outer list is sorted in ascending lex order.",
    explanation:
      "Standard subset-style backtracking with a size limit. Recurse with a `start` index and a `path`. At each call:\n\n- If `len(path) == k`, copy and append.\n- Otherwise, for `i` from `start` to `n`, push `i`, recurse with `start = i + 1`, then pop.\n\nIterating `i` upward gives ascending order inside each combination and lex order across them. A small pruning win: stop the loop when there aren't enough remaining numbers to fill the slot (`i > n − (k − len(path)) + 1`).\n\nO(k · C(n, k)) time.",
    functionName: 'combine',
    functionSignature: 'def combine(n: int, k: int) -> list[list[int]]:',
    starter:
      STARTER_HEADER + 'def combine(n: int, k: int) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [4, 2],
        expected: [
          [1, 2],
          [1, 3],
          [1, 4],
          [2, 3],
          [2, 4],
          [3, 4],
        ],
      },
      { input: [1, 1], expected: [[1]] },
    ],
    hiddenTests: [
      { input: [3, 3], expected: [[1, 2, 3]] },
      {
        input: [3, 2],
        expected: [
          [1, 2],
          [1, 3],
          [2, 3],
        ],
      },
      { input: [2, 1], expected: [[1], [2]] },
    ],
  },
  {
    id: 'subsets-all',
    number: 133,
    title: 'Subsets',
    difficulty: 'Medium',
    topic: 'Backtracking',
    statement:
      "Given a list `nums` of distinct integers, return every subset (the power set). Output subsets in ascending size order; within each size, sort in lex order based on the *sorted* values of `nums`.",
    explanation:
      "The classic backtracking template: walk the index `i`, and for each value decide either *include* it or *skip* it.\n\nSort `nums` first so the lex order is deterministic. Recurse with `start` and `path`. At every entry, append a *copy* of `path` to the answer. Then for `i` from `start` to `n − 1`, push `nums[i]`, recurse with `start = i + 1`, pop.\n\nThis emits subsets in increasing size and lex order — the same shape as expanding a binary representation of `2^n − 1` in ordered fashion.\n\nO(n · 2^n) time, O(n) recursion depth.",
    functionName: 'subsets',
    functionSignature: 'def subsets(nums: list[int]) -> list[list[int]]:',
    starter:
      STARTER_HEADER + 'def subsets(nums: list[int]) -> list[list[int]]:\n    pass\n',
    examples: [
      {
        input: [[1, 2, 3]],
        expected: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]],
      },
      { input: [[0]], expected: [[], [0]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [[]] },
      { input: [[1, 2]], expected: [[], [1], [1, 2], [2]] },
      { input: [[3, 1]], expected: [[], [1], [1, 3], [3]] },
    ],
  },
  {
    id: 'restore-ip-addresses',
    number: 134,
    title: 'Restore IP Addresses',
    difficulty: 'Medium',
    topic: 'Backtracking',
    statement:
      "An IPv4 address is four integers in `[0, 255]` separated by dots, with no leading zeros (except the value `0` itself). Given a digit string `s`, return every valid IP address that uses every character of `s` exactly once. Output the addresses sorted in ascending lex order.",
    explanation:
      "Backtracking with four slots. Recurse with `start` (current position in `s`) and `parts` (segments chosen so far).\n\n- When `len(parts) == 4`, accept iff `start == len(s)`; in that case `'.'.join(parts)` is a valid address.\n- Otherwise try each candidate segment of length 1, 2, or 3 starting at `start`. Accept the segment if it's non-empty, has no leading-zero issue (segments of length > 1 cannot start with `'0'`), and parses to a value `<= 255`.\n\nLength `n` is at most 12, so the search tree is tiny. Sorting at the end gives the required output order.",
    functionName: 'restore_ip_addresses',
    functionSignature: 'def restore_ip_addresses(s: str) -> list[str]:',
    starter:
      STARTER_HEADER + 'def restore_ip_addresses(s: str) -> list[str]:\n    pass\n',
    examples: [
      { input: ['25525511135'], expected: ['255.255.11.135', '255.255.111.35'] },
      { input: ['0000'], expected: ['0.0.0.0'] },
    ],
    hiddenTests: [
      { input: ['1111'], expected: ['1.1.1.1'] },
      {
        input: ['101023'],
        expected: ['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3'],
      },
      { input: ['00000'], expected: [] },
    ],
  },
  {
    id: 'palindrome-partitioning',
    number: 135,
    title: 'Palindrome Partitioning',
    difficulty: 'Medium',
    topic: 'Backtracking',
    statement:
      "Given a string `s`, partition it so that every substring in the partition is a palindrome. Return every such partition. Output the partitions in the order the backtracker discovers them when it always tries the shortest leading palindrome first (so partitions sorted by the first segment's length, then second segment, etc.).",
    explanation:
      "Backtrack with a `start` index. At each call, for `end` from `start + 1` to `len(s)`, test whether `s[start:end]` is a palindrome — if so, append it to `path`, recurse with `start = end`, then pop.\n\nWhen `start == len(s)`, append a copy of `path` to the answer. Iterating `end` upward (shortest leading slice first) gives the order described in the prompt.\n\nA two-pointer palindrome check is fine because `n` is small in practice. For longer inputs, precompute an `is_palindrome[i][j]` table in O(n²) before the search.\n\nO(n · 2ⁿ) worst-case time.",
    functionName: 'partition_palindrome',
    functionSignature: 'def partition_palindrome(s: str) -> list[list[str]]:',
    starter:
      STARTER_HEADER +
      'def partition_palindrome(s: str) -> list[list[str]]:\n    pass\n',
    examples: [
      {
        input: ['aab'],
        expected: [['a', 'a', 'b'], ['aa', 'b']],
      },
      { input: ['a'], expected: [['a']] },
    ],
    hiddenTests: [
      { input: ['ab'], expected: [['a', 'b']] },
      {
        input: ['aaa'],
        expected: [['a', 'a', 'a'], ['a', 'aa'], ['aa', 'a'], ['aaa']],
      },
      { input: ['cdd'], expected: [['c', 'd', 'd'], ['c', 'dd']] },
    ],
  },
  {
    id: 'n-queens-ii',
    number: 136,
    title: 'N-Queens II',
    difficulty: 'Hard',
    topic: 'Backtracking',
    statement:
      "Count the distinct ways to place `n` non-attacking queens on an `n × n` chessboard. Queens attack along rows, columns, and both diagonals. Return the count.",
    explanation:
      "Place one queen per row, top to bottom. Maintain three sets that record which columns, `/` diagonals (`r + c`), and `\\` diagonals (`r − c`) are currently under attack.\n\nRecurse with the current row index `r`. For each column `c` in `0..n − 1`, if `c` is not in `cols`, `r + c` not in `pos_diag`, and `r − c` not in `neg_diag`, place a queen: add to all three sets, recurse with `r + 1`, then remove from the sets. When `r == n`, increment the answer.\n\nO(n!) worst-case but extremely fast in practice for `n ≤ 12`. O(n) recursion depth and set storage.",
    functionName: 'total_n_queens',
    functionSignature: 'def total_n_queens(n: int) -> int:',
    starter:
      STARTER_HEADER + 'def total_n_queens(n: int) -> int:\n    pass\n',
    examples: [
      { input: [4], expected: 2 },
      { input: [1], expected: 1 },
    ],
    hiddenTests: [
      { input: [2], expected: 0 },
      { input: [3], expected: 0 },
      { input: [5], expected: 10 },
      { input: [8], expected: 92 },
    ],
  },

  // ===== Dynamic Programming (additional) =====
  {
    id: 'edit-distance',
    number: 137,
    title: 'Edit Distance',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    statement:
      "Given two strings `word1` and `word2`, return the minimum number of single-character operations to turn `word1` into `word2`. Each operation can insert one character, delete one character, or replace one character with another.",
    explanation:
      "Define `dp[i][j]` = the edit distance between the first `i` characters of `word1` and the first `j` characters of `word2`.\n\nBase cases: `dp[0][j] = j` (insert every character of `word2`) and `dp[i][0] = i` (delete every character of `word1`).\n\nTransition: if `word1[i − 1] == word2[j − 1]`, `dp[i][j] = dp[i − 1][j − 1]` — no operation needed. Otherwise `dp[i][j] = 1 + min(dp[i − 1][j], dp[i][j − 1], dp[i − 1][j − 1])` — delete, insert, or replace.\n\nO(m · n) time and space; trimmable to O(min(m, n)) by keeping just two rows.",
    functionName: 'min_distance',
    functionSignature: 'def min_distance(word1: str, word2: str) -> int:',
    starter:
      STARTER_HEADER + 'def min_distance(word1: str, word2: str) -> int:\n    pass\n',
    examples: [
      { input: ['horse', 'ros'], expected: 3 },
      { input: ['intention', 'execution'], expected: 5 },
    ],
    hiddenTests: [
      { input: ['', 'abc'], expected: 3 },
      { input: ['abc', ''], expected: 3 },
      { input: ['a', 'a'], expected: 0 },
      { input: ['kitten', 'sitting'], expected: 3 },
    ],
  },
  {
    id: 'longest-common-subsequence',
    number: 138,
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Given two strings `text1` and `text2`, return the length of their longest *common subsequence* — characters that appear in both strings in the same relative order, though not necessarily contiguously.",
    explanation:
      "Define `dp[i][j]` = the LCS length of the first `i` characters of `text1` and the first `j` characters of `text2`.\n\nBase: `dp[0][j] = dp[i][0] = 0`.\n\nTransition: if `text1[i − 1] == text2[j − 1]`, `dp[i][j] = 1 + dp[i − 1][j − 1]`. Otherwise `dp[i][j] = max(dp[i − 1][j], dp[i][j − 1])`.\n\nThe answer is `dp[m][n]`. O(m · n) time, O(m · n) space (or O(min(m, n)) with row rolling).",
    functionName: 'longest_common_subsequence',
    functionSignature:
      'def longest_common_subsequence(text1: str, text2: str) -> int:',
    starter:
      STARTER_HEADER +
      'def longest_common_subsequence(text1: str, text2: str) -> int:\n    pass\n',
    examples: [
      { input: ['abcde', 'ace'], expected: 3 },
      { input: ['abc', 'abc'], expected: 3 },
    ],
    hiddenTests: [
      { input: ['abc', 'def'], expected: 0 },
      { input: ['', 'abc'], expected: 0 },
      { input: ['ab', 'ba'], expected: 1 },
    ],
  },
  {
    id: 'distinct-subsequences',
    number: 139,
    title: 'Distinct Subsequences',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    statement:
      "Given two strings `s` and `t`, count the number of distinct subsequences of `s` that exactly equal `t`. Two subsequences are different if they pick different positions of `s`.",
    explanation:
      "Define `dp[i][j]` = the number of subsequences of `s[:i]` that equal `t[:j]`.\n\nBase: `dp[i][0] = 1` for every `i` — the empty target is matched once (by picking nothing). `dp[0][j] = 0` for `j > 0`.\n\nTransition: you always have the option to skip `s[i − 1]`, contributing `dp[i − 1][j]`. If `s[i − 1] == t[j − 1]`, you can additionally use this character to match `t[j − 1]`, contributing `dp[i − 1][j − 1]`.\n\nSo `dp[i][j] = dp[i − 1][j] + (dp[i − 1][j − 1] if s[i − 1] == t[j − 1] else 0)`. Answer is `dp[m][n]`. O(m · n) time.",
    functionName: 'num_distinct',
    functionSignature: 'def num_distinct(s: str, t: str) -> int:',
    starter:
      STARTER_HEADER + 'def num_distinct(s: str, t: str) -> int:\n    pass\n',
    examples: [
      { input: ['rabbbit', 'rabbit'], expected: 3 },
      { input: ['babgbag', 'bag'], expected: 5 },
    ],
    hiddenTests: [
      { input: ['', ''], expected: 1 },
      { input: ['abc', ''], expected: 1 },
      { input: ['ab', 'abc'], expected: 0 },
    ],
  },
  {
    id: 'wildcard-matching',
    number: 140,
    title: 'Wildcard Matching',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    statement:
      "Decide whether the pattern `p` matches the entire string `s`. In `p`, `'?'` matches any single character and `'*'` matches any sequence (possibly empty) of characters. Return `True` or `False`.",
    explanation:
      "Define `dp[i][j]` = whether `s[:i]` matches `p[:j]`.\n\nBase: `dp[0][0] = True`. `dp[0][j] = True` iff every character of `p[:j]` is `'*'` (a `'*'` can stand for the empty string).\n\nTransition for `dp[i][j]`: let `pc = p[j − 1]`.\n\n- If `pc` is a letter or `'?'`: `dp[i][j] = dp[i − 1][j − 1]` when the characters match (or `pc == '?'`).\n- If `pc == '*'`: `dp[i][j] = dp[i][j − 1]` (the `*` matches empty) OR `dp[i − 1][j]` (the `*` consumes one more character of `s`).\n\nO(m · n) time. Memo-recursive form works just as well.",
    functionName: 'is_match',
    functionSignature: 'def is_match(s: str, p: str) -> bool:',
    starter:
      STARTER_HEADER + 'def is_match(s: str, p: str) -> bool:\n    pass\n',
    examples: [
      { input: ['aa', 'a'], expected: false },
      { input: ['aa', '*'], expected: true },
    ],
    hiddenTests: [
      { input: ['cb', '?a'], expected: false },
      { input: ['adceb', '*a*b'], expected: true },
      { input: ['acdcb', 'a*c?b'], expected: false },
      { input: ['', '*'], expected: true },
    ],
  },
  {
    id: 'max-length-pair-chain',
    number: 141,
    title: 'Maximum Length of Pair Chain',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "A list of `pairs` contains `[a, b]` entries with `a < b`. A pair `[c, d]` can follow `[a, b]` in a chain iff `b < c`. Return the longest chain you can build using any subset of the pairs (in any order).",
    explanation:
      "Greedy beats DP here. Sort the pairs by their *second* element. Walk left to right, picking a pair whenever its first element is strictly greater than the previous picked pair's second element. Track the current chain length.\n\nThe correctness is the activity-selection argument: sorting by end time and always extending with the earliest-ending compatible pair is optimal.\n\nO(n log n) for the sort, O(1) extra space.",
    functionName: 'find_longest_chain',
    functionSignature: 'def find_longest_chain(pairs: list[list[int]]) -> int:',
    starter:
      STARTER_HEADER +
      'def find_longest_chain(pairs: list[list[int]]) -> int:\n    pass\n',
    examples: [
      { input: [[[1, 2], [2, 3], [3, 4]]], expected: 2 },
      { input: [[[1, 2], [7, 8], [4, 5]]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[[5, 6]]], expected: 1 },
      { input: [[[1, 10], [2, 3], [4, 5]]], expected: 2 },
      { input: [[[-10, -8], [8, 9], [-5, 0], [6, 10], [-6, -4], [1, 7], [9, 10], [-4, 7]]], expected: 4 },
    ],
  },
  {
    id: 'partition-equal-subset',
    number: 142,
    title: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Given a list of positive integers `nums`, decide whether you can partition them into two groups with the same sum. Return `True` or `False`.",
    explanation:
      "If `sum(nums)` is odd, it's impossible. Otherwise the goal reduces to *can we pick a subset summing to `sum(nums) // 2`?* — the classic 0/1 subset-sum problem.\n\nDefine `dp[s]` = whether some subset of the elements processed so far sums to `s`. Start with `dp[0] = True`, everything else `False`. For each `num`, iterate `s` from `target` down to `num` and update `dp[s] |= dp[s − num]`. Iterating in reverse prevents reusing the same number twice.\n\nO(n · target) time, O(target) space — pseudo-polynomial.",
    functionName: 'can_partition',
    functionSignature: 'def can_partition(nums: list[int]) -> bool:',
    starter:
      STARTER_HEADER + 'def can_partition(nums: list[int]) -> bool:\n    pass\n',
    examples: [
      { input: [[1, 5, 11, 5]], expected: true },
      { input: [[1, 2, 3, 5]], expected: false },
    ],
    hiddenTests: [
      { input: [[1, 1]], expected: true },
      { input: [[1]], expected: false },
      { input: [[2, 2, 1, 1]], expected: true },
      { input: [[100]], expected: false },
    ],
  },
  {
    id: 'target-sum',
    number: 143,
    title: 'Target Sum',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Given a list of non-negative integers `nums` and an integer `target`, you must choose a sign (`+` or `−`) for every number such that the signed total equals `target`. Return how many distinct sign assignments achieve this.",
    explanation:
      "Let `P` be the sum of numbers assigned `+` and `N` the sum of numbers assigned `−`. Then `P − N = target` and `P + N = sum(nums)`, so `P = (sum(nums) + target) / 2`.\n\nIf `sum(nums) + target` is negative or odd, the answer is `0`. Otherwise reduce to *count subsets of `nums` summing to `P`* — a 0/1 knapsack counting problem.\n\n`dp[s]` = number of ways to pick a subset summing to `s`. Initialize `dp[0] = 1`. For each `num`, iterate `s` from `P` down to `num` and add `dp[s − num]` into `dp[s]`. Answer is `dp[P]`.\n\nO(n · P) time, O(P) space.",
    functionName: 'find_target_sum_ways',
    functionSignature:
      'def find_target_sum_ways(nums: list[int], target: int) -> int:',
    starter:
      STARTER_HEADER +
      'def find_target_sum_ways(nums: list[int], target: int) -> int:\n    pass\n',
    examples: [
      { input: [[1, 1, 1, 1, 1], 3], expected: 5 },
      { input: [[1], 1], expected: 1 },
    ],
    hiddenTests: [
      { input: [[1], 2], expected: 0 },
      { input: [[1, 1], 0], expected: 2 },
      { input: [[1000], -1000], expected: 1 },
    ],
  },
  {
    id: 'stock-with-cooldown',
    number: 144,
    title: 'Best Time to Buy and Sell Stock with Cooldown',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Given daily `prices` for a single stock, design the most profitable sequence of buy/sell decisions. You may hold at most one share, and after every sale you must skip one full day before buying again. Return the maximum total profit.",
    explanation:
      "State-machine DP with three states per day:\n\n- `hold` — you currently own a share\n- `sold` — you just sold today (so tomorrow is cooldown)\n- `rest` — you're free to buy (not holding, not just-sold)\n\nTransitions: `hold = max(prev_hold, prev_rest − price)`; `sold = prev_hold + price`; `rest = max(prev_rest, prev_sold)`.\n\nInitialize `hold = −∞` (can't hold before day 0), `sold = 0`, `rest = 0`. Iterate through prices applying the transitions. The answer is `max(sold, rest)` after the last day.\n\nO(n) time, O(1) space.",
    functionName: 'max_profit_cooldown',
    functionSignature: 'def max_profit_cooldown(prices: list[int]) -> int:',
    starter:
      STARTER_HEADER +
      'def max_profit_cooldown(prices: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[1, 2, 3, 0, 2]], expected: 3 },
      { input: [[1]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1, 2]], expected: 1 },
      { input: [[2, 1]], expected: 0 },
      { input: [[1, 2, 3, 4, 5]], expected: 4 },
    ],
  },
  {
    id: 'stock-iv',
    number: 145,
    title: 'Best Time to Buy and Sell Stock IV',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    statement:
      "Given daily `prices` and an integer `k`, return the maximum profit achievable with at most `k` complete buy/sell transactions. A new buy cannot occur until the previous sale settles, and you can hold at most one share.",
    explanation:
      "If `k >= n // 2`, the cap is effectively unlimited (you can't do more than `n // 2` transactions on `n` days). Fall through to the unbounded variant: sum every positive day-over-day delta.\n\nOtherwise run a 2D DP. `dp[t][d]` = max profit after `d` days using at most `t` transactions. For each `t` from `1` to `k` and each `d` from `1` to `n − 1`:\n\n- `dp[t][d] = max(dp[t][d − 1], prices[d] + best_prev_buy)`, where `best_prev_buy = max(dp[t − 1][m] − prices[m])` for `m < d`.\n\nMaintain `best_prev_buy` as a running max while iterating `d` for fixed `t` — that's what keeps the inner loop O(n).\n\nO(k · n) time, O(k · n) space (or O(k) with rolling).",
    functionName: 'max_profit_k',
    functionSignature: 'def max_profit_k(k: int, prices: list[int]) -> int:',
    starter:
      STARTER_HEADER +
      'def max_profit_k(k: int, prices: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [2, [2, 4, 1]], expected: 2 },
      { input: [2, [3, 2, 6, 5, 0, 3]], expected: 7 },
    ],
    hiddenTests: [
      { input: [1, [1, 2, 3, 4, 5]], expected: 4 },
      { input: [2, [1, 2, 3, 4, 5]], expected: 4 },
      { input: [1, [7, 6, 4, 3, 1]], expected: 0 },
      { input: [0, [1, 2, 3]], expected: 0 },
    ],
  },
  {
    id: 'russian-doll-envelopes',
    number: 146,
    title: 'Russian Doll Envelopes',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    statement:
      "A list `envelopes` gives `[width, height]` pairs. Envelope A fits inside envelope B iff `A.width < B.width` and `A.height < B.height`. Return the maximum number of envelopes you can nest, each inside the next.",
    explanation:
      "Sort the envelopes by `width` ascending. When two envelopes share the same width, sort by `height` *descending* — this prevents them from being nested together because their heights then form a decreasing sequence and LIS can't pick more than one.\n\nNow run a longest-increasing-subsequence over the heights. The patience-sorting trick with `bisect_left` runs in O(n log n): keep an array `tails` where `tails[i]` is the smallest tail of any LIS of length `i + 1`; for each height, find its insertion point and overwrite. Return `len(tails)`.\n\nO(n log n) time, O(n) space.",
    functionName: 'max_envelopes',
    functionSignature: 'def max_envelopes(envelopes: list[list[int]]) -> int:',
    starter:
      STARTER_HEADER +
      'def max_envelopes(envelopes: list[list[int]]) -> int:\n    pass\n',
    examples: [
      { input: [[[5, 4], [6, 4], [6, 7], [2, 3]]], expected: 3 },
      { input: [[[1, 1], [1, 1], [1, 1]]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[[1, 2]]], expected: 1 },
      { input: [[[5, 4], [6, 7], [2, 3], [3, 4]]], expected: 3 },
      { input: [[[1, 5], [2, 4], [3, 3]]], expected: 1 },
    ],
  },
  {
    id: 'longest-arithmetic-subsequence',
    number: 147,
    title: 'Longest Arithmetic Subsequence',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    statement:
      "Given an integer list `nums`, return the length of the longest subsequence (not necessarily contiguous) whose consecutive differences are constant.",
    explanation:
      "DP indexed by (end position, common difference). `dp[i][d]` = length of the longest arithmetic subsequence ending at index `i` with common difference `d`.\n\nWalk pairs: for each `j < i`, let `d = nums[i] − nums[j]`. Then `dp[i][d] = max(2, dp[j][d] + 1)` — extending the chain ending at `j` with difference `d`, or starting a fresh pair.\n\nUse a dict-of-dicts (or `dp[i]: dict[int, int]`) since `d` can be any integer. Track the running maximum across all `dp[i][d]` and return it.\n\nO(n²) time, O(n²) space worst-case.",
    functionName: 'longest_arith_seq_length',
    functionSignature: 'def longest_arith_seq_length(nums: list[int]) -> int:',
    starter:
      STARTER_HEADER +
      'def longest_arith_seq_length(nums: list[int]) -> int:\n    pass\n',
    examples: [
      { input: [[3, 6, 9, 12]], expected: 4 },
      { input: [[9, 4, 7, 2, 10]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[20, 1, 15, 3, 10, 5, 8]], expected: 4 },
      { input: [[1, 2]], expected: 2 },
      { input: [[1]], expected: 1 },
    ],
  },
  {
    id: 'job-scheduling',
    number: 148,
    title: 'Maximum Profit in Job Scheduling',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    statement:
      "Three same-length lists `start_time`, `end_time`, `profit` describe `n` jobs — job `i` runs in the half-open interval `[start_time[i], end_time[i])` and pays `profit[i]`. You can't run overlapping jobs. Return the maximum total profit.",
    explanation:
      "Sort the jobs by `end_time` ascending. Define `dp[i]` = max profit using only jobs `0..i`.\n\nFor each job `i`: the choice is *skip* (carry `dp[i − 1]`) or *take* (collect `profit[i]` plus the best profit you could earn from non-overlapping prior jobs). Binary search for the latest job whose `end_time <= start_time[i]` — call that index `j` — then `take = profit[i] + (dp[j] if j is valid else 0)`. Transition: `dp[i] = max(dp[i − 1], take)`.\n\nO(n log n) for the sort and the per-step `bisect_right` over the sorted end times.",
    functionName: 'job_scheduling',
    functionSignature:
      'def job_scheduling(start_time: list[int], end_time: list[int], profit: list[int]) -> int:',
    starter:
      STARTER_HEADER +
      'def job_scheduling(start_time: list[int], end_time: list[int], profit: list[int]) -> int:\n    pass\n',
    examples: [
      {
        input: [[1, 2, 3, 3], [3, 4, 5, 6], [50, 10, 40, 70]],
        expected: 120,
      },
      {
        input: [[1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60]],
        expected: 150,
      },
    ],
    hiddenTests: [
      {
        input: [[1, 1, 1], [2, 3, 4], [5, 6, 4]],
        expected: 6,
      },
      { input: [[1], [2], [10]], expected: 10 },
      {
        input: [[1, 2, 3], [3, 4, 5], [1, 1, 1]],
        expected: 2,
      },
    ],
  },
  {
    id: 'lru-cache',
    number: 149,
    title: 'LRU Cache',
    difficulty: 'Medium',
    topic: 'Hash Table',
    statement:
      "Design a fixed-capacity Least Recently Used cache that supports two operations in O(1) average time:\n\n- `get(key)` — return the value if `key` is present (and mark `key` as most-recently used), otherwise return `-1`.\n- `put(key, value)` — insert or update the pair, marking `key` as most-recently used. If the cache is at capacity and the key is new, evict the least-recently used entry first.\n\nThe grader drives it with `run_ops(ops)`. The first op is always `('init', capacity)`; subsequent ops look like `('get', key)` or `('put', key, value)`. Return a parallel list of results, using `None` for `put` and `init`.",
    explanation:
      "Two ingredients: a hash map for O(1) lookup, and a doubly linked list for O(1) reordering on access.\n\nKeep dummy `head` and `tail` sentinels so every real node has well-defined prev/next pointers. The map stores `key → node`; the list is ordered front-to-back from most-recently used to least-recently used.\n\n- `get(key)`: if in map, unlink the node from its current spot and splice it right after `head`; return its value. Otherwise return `-1`.\n- `put(key, value)`: if existing, update value and move-to-front. Otherwise create a new node, splice after `head`, store in the map. If the map now exceeds capacity, unlink the node before `tail` and delete its key from the map.\n\nEvery operation is O(1).",
    functionName: 'run_ops',
    functionSignature: 'def run_ops(ops: list[tuple]) -> list:',
    starter:
      STARTER_HEADER +
      "class _Node:\n    __slots__ = ('key', 'val', 'prev', 'next')\n    def __init__(self, key=0, val=0):\n        self.key = key; self.val = val; self.prev = None; self.next = None\n\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.map = {}\n        self.head = _Node(); self.tail = _Node()\n        self.head.next = self.tail; self.tail.prev = self.head\n\n    def _unlink(self, node):\n        node.prev.next = node.next; node.next.prev = node.prev\n\n    def _push_front(self, node):\n        node.prev = self.head; node.next = self.head.next\n        self.head.next.prev = node; self.head.next = node\n\n    def get(self, key):\n        node = self.map.get(key)\n        if node is None:\n            return -1\n        self._unlink(node); self._push_front(node)\n        return node.val\n\n    def put(self, key, value):\n        node = self.map.get(key)\n        if node is not None:\n            node.val = value\n            self._unlink(node); self._push_front(node)\n            return\n        node = _Node(key, value)\n        self.map[key] = node\n        self._push_front(node)\n        if len(self.map) > self.cap:\n            lru = self.tail.prev\n            self._unlink(lru)\n            del self.map[lru.key]\n\n\ndef run_ops(ops: list[tuple]) -> list:\n    cache = None\n    out = []\n    for op in ops:\n        name = op[0]\n        if name == 'init':\n            cache = LRUCache(op[1]); out.append(None)\n        elif name == 'put':\n            cache.put(op[1], op[2]); out.append(None)\n        elif name == 'get':\n            out.append(cache.get(op[1]))\n    return out\n",
    examples: [
      {
        input: [[['init', 2], ['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
    ],
    hiddenTests: [
      {
        input: [[['init', 1], ['put', 1, 10], ['get', 1], ['put', 2, 20], ['get', 1], ['get', 2]]],
        expected: [null, null, 10, null, -1, 20],
      },
      {
        input: [[['init', 2], ['put', 1, 1], ['put', 2, 2], ['put', 1, 100], ['get', 1], ['get', 2]]],
        expected: [null, null, null, null, 100, 2],
      },
    ],
  },
  {
    id: 'pow-x-n',
    number: 150,
    title: 'Pow(x, n)',
    difficulty: 'Medium',
    topic: 'Binary',
    statement:
      "Implement `pow(x, n)` — compute `x` raised to the integer power `n`. `n` may be negative, in which case the answer is `1 / pow(x, |n|)`. Avoid the naive O(n) loop for large `n`.",
    explanation:
      "Fast exponentiation by squaring. The key identity: `x^n = (x²)^(n/2)` for even `n`, and `x^n = x · x^(n − 1)` for odd `n`. Iteratively, walk the bits of `n`: each step square `x` and multiply into the result whenever the current bit is set.\n\n```\nresult = 1.0\nbase = x\nm = abs(n)\nwhile m:\n    if m & 1:\n        result *= base\n    base *= base\n    m >>= 1\nreturn result if n >= 0 else 1 / result\n```\n\nO(log |n|) multiplications, O(1) space. Watch the corner case `n = 0` (return `1.0`) and `n = -2^31` (Python ints handle it natively, no overflow concerns).",
    functionName: 'my_pow',
    functionSignature: 'def my_pow(x: float, n: int) -> float:',
    starter:
      STARTER_HEADER + 'def my_pow(x: float, n: int) -> float:\n    pass\n',
    examples: [
      { input: [2.0, 10], expected: 1024.0 },
      { input: [2.0, -2], expected: 0.25 },
    ],
    hiddenTests: [
      { input: [2.0, 0], expected: 1.0 },
      { input: [1.0, 1000], expected: 1.0 },
      { input: [3.0, 3], expected: 27.0 },
      { input: [0.5, 4], expected: 0.0625 },
    ],
  },
];

// Group by topic for filter UI
export const blind75Topics: string[] = Array.from(
  new Set(blind75.map((p) => p.topic))
).sort();

export const getProblem = (id: string): Blind75Problem | undefined =>
  blind75.find((p) => p.id === id);
