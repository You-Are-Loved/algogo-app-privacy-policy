// The Blind 75 — curated list of essential coding interview problems.
// Each problem has:
//   - statement: markdown-like problem text
//   - functionSignature: Python def line (must match starter)
//   - starter: Python starter code shown in the editor
//   - examples: visible test cases (shown to user)
//   - hiddenTests: graded test cases (not shown to user; live in IPA so not
//     cryptographically hidden, but invisible in the practice flow)
// Tests evaluate user_fn(...args) and compare equality with expected.
// Problems whose statement allows the answer in any order MUST set
// compare: 'unordered' — the grader then treats the top-level list as a
// multiset (element order ignored, nested order still enforced).

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** How the grader compares the returned value against `expected`. */
export type CompareMode = 'exact' | 'unordered';

export interface TestCase {
  input: any[]; // positional args for the function
  expected: any; // expected return value
  // Optional toleranceless equality is fine for numbers, strings, lists, dicts.
}

export interface Blind75Problem {
  id: string;
  number: number; // 1-200
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
  compare?: CompareMode; // default 'exact'; 'unordered' when the statement says any order is fine
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
    compare: 'unordered',
    examples: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
    ],
    hiddenTests: [
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
      { input: [[0, 4, 3, 0], 0], expected: [0, 3] },
      // Careful: inputs must have exactly ONE valid pair, per the statement.
      { input: [[1, 5, 7, -2, 4], 6], expected: [0, 1] },
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
    compare: 'unordered',
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
    compare: 'unordered',
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
      "Given a string `s`, return the longest contiguous substring of `s` that is a palindrome. If several substrings tie for the maximum length, return the one that starts earliest (leftmost) in `s`.",
    explanation:
      "**Expand-around-center** is the cleanest O(n²) solution.\n\nEvery palindrome has a center: either a single character (odd length) or a pair of identical characters (even length). For each index `i` from 0 to `n - 1`, run two expansions:\n\n1. Odd: `left = i`, `right = i`, expand outward while characters match.\n2. Even: `left = i`, `right = i + 1`, same.\n\nEach expansion returns a candidate substring; track the longest seen, replacing it only when the new candidate is strictly longer — scanning left to right, that naturally keeps the leftmost winner. There are 2n − 1 centers and each expansion is O(n) at worst, giving O(n²) overall, O(1) extra space.\n\nManacher's algorithm gets it to O(n) but is rarely required in an interview.",
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
    compare: 'unordered',
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
      "An alien language reuses the English alphabet but with an unknown letter ordering. You're given a list `words` that is sorted lexicographically according to the alien's rules. Derive a consistent letter ordering and return it as a string of letters in order. When more than one ordering is consistent, return the lexicographically smallest one (by normal English letter order). If the input contradicts itself (cycle, or an invalid prefix like `['ab', 'a']`), return an empty string.",
    explanation:
      "This is a topological sort. Each pair of adjacent words tells you which letter comes earlier than another.\n\n1. **Collect every unique letter** that appears in any word; these are your graph's nodes. Initialize an empty adjacency list and an indegree counter for each.\n2. **Compare adjacent word pairs**. Walk character by character until you hit the first differing position; add an edge from the earlier letter to the later one (skip if you already added that edge). If you reach the end of the shorter word and the longer word is a prefix of the shorter one (e.g. `'ab'` before `'a'`), that's invalid — return `''`.\n3. **Kahn's topological sort with a min-heap**: push every letter with indegree 0 onto a heap. Pop the alphabetically smallest, append it to the result, decrement indegrees of its neighbors, and push any that hit 0. The heap (instead of a plain queue) is what guarantees the lexicographically smallest valid ordering.\n4. If the result includes every letter, return it. Otherwise there's a cycle — return `''`.",
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
    compare: 'unordered',
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
      "Given an integer list `nums` sorted in strictly ascending order, build a height-balanced binary search tree containing those values, always choosing the *left-middle* element of the current slice as the root (`mid = (lo + hi) // 2`). Return the tree as a level-order array with `None` for missing nodes.",
    explanation:
      "Take the middle element as the root; everything to its left in the array forms the left subtree, everything to the right forms the right subtree. Recurse. Because each subtree gets exactly half the slice, the result is balanced.\n\nBuild the tree as Node objects first (or directly compute the level-order array via a queue traversal at the end). Stick to `mid = (lo + hi) // 2` as the statement requires — `mid = (lo + hi + 1) // 2` builds a mirror-image tree that is also balanced but serializes differently.\n\nO(n) time, O(log n) recursion depth.",
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
      "Given a list `nums` of distinct integers, return every subset (the power set), in any order. Within each subset, list the values in ascending order.",
    explanation:
      "The classic backtracking template: walk the index `i`, and for each value decide either *include* it or *skip* it.\n\nSort `nums` first so the lex order is deterministic. Recurse with `start` and `path`. At every entry, append a *copy* of `path` to the answer. Then for `i` from `start` to `n − 1`, push `nums[i]`, recurse with `start = i + 1`, pop.\n\nThe order you emit subsets in doesn't matter — the grader accepts any permutation — but sorting `nums` first keeps each individual subset ascending, as required.\n\nO(n · 2^n) time, O(n) recursion depth.",
    functionName: 'subsets',
    functionSignature: 'def subsets(nums: list[int]) -> list[list[int]]:',
    starter:
      STARTER_HEADER + 'def subsets(nums: list[int]) -> list[list[int]]:\n    pass\n',
    compare: 'unordered',
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

  // ===== Expansion pack: problems 151-200 =====
  {
    id: "roman-numeral-value",
    number: 151,
    title: "Roman Numeral Value",
    difficulty: 'Easy',
    topic: "Math",
    statement:
      "You are given a string `s` containing a valid Roman numeral, such as `\"XIV\"`. Convert it to its integer value. The symbols are `I=1`, `V=5`, `X=10`, `L=50`, `C=100`, `D=500`, `M=1000`, and the six subtractive pairs `IV`, `IX`, `XL`, `XC`, `CD`, `CM` follow the standard rules. Return the integer.",
    explanation:
      "Scan the numeral left to right while keeping a running total. The only trick is the subtractive pairs: whenever a symbol is immediately followed by a strictly larger symbol, that smaller symbol counts negatively (the `I` in `IV` contributes -1, not +1).\n\nSo for each character, look one position ahead. If the next symbol's value is larger, subtract the current value from your total; otherwise add it. A small dictionary mapping each letter to its value is all the state you need. This runs in O(n) time and O(1) space.",
    functionName: "roman_to_value",
    functionSignature: "def roman_to_value(s: str) -> int:",
    starter: STARTER_HEADER + "def roman_to_value(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["XIV"], expected: 14 },
      { input: ["MCMXCIV"], expected: 1994 },
    ],
    hiddenTests: [
      { input: ["III"], expected: 3 },
      { input: ["LVIII"], expected: 58 },
      { input: ["IX"], expected: 9 },
      { input: ["MMXXVI"], expected: 2026 },
    ],
  },
  {
    id: "sum-of-bit-strings",
    number: 152,
    title: "Sum of Bit Strings",
    difficulty: 'Easy',
    topic: "Binary",
    statement:
      "You are given two binary strings `a` and `b`, each containing only the characters `'0'` and `'1'`. Add them together and return the sum as a binary string. The result must not contain leading zeros unless it is exactly `\"0\"`.",
    explanation:
      "Think of how you add numbers by hand: line both strings up at their rightmost digit and add column by column, carrying a 1 whenever a column sums to 2 or 3. Walk two pointers from the ends of both strings toward the front, appending each result bit, then reverse what you built.\n\nAt every step the column sum is the two bits (or 0 if a string has run out) plus the carry; the output bit is `sum % 2` and the new carry is `sum // 2`. Do not forget a possible final carry after the loop. This runs in O(n + m) time and O(n + m) space for the output.",
    functionName: "add_bit_strings",
    functionSignature: "def add_bit_strings(a: str, b: str) -> str:",
    starter: STARTER_HEADER + "def add_bit_strings(a: str, b: str) -> str:\n    pass\n",
    examples: [
      { input: ["11", "1"], expected: "100" },
      { input: ["1010", "1011"], expected: "10101" },
    ],
    hiddenTests: [
      { input: ["0", "0"], expected: "0" },
      { input: ["1", "111"], expected: "1000" },
      { input: ["1101", "101"], expected: "10010" },
      { input: ["1", "0"], expected: "1" },
    ],
  },
  {
    id: "digit-square-cycle",
    number: 153,
    title: "Digit Square Cycle",
    difficulty: 'Easy',
    topic: "Math",
    statement:
      "Start with a positive integer `n` and repeatedly replace it with the sum of the squares of its digits. For some starting numbers this process eventually reaches `1` and stays there; for others it falls into a cycle that never includes `1`. Return `True` if the process reaches `1`, and `False` otherwise.",
    explanation:
      "The key observation is that the process is deterministic: from any value there is exactly one next value. So if you ever revisit a number you have seen before without hitting 1, you are trapped in a loop forever and can stop.\n\nKeep a set of every value seen so far. Loop: if `n` is 1, return True; if `n` is already in the set, return False; otherwise record it and replace `n` with the sum of squared digits. Because the digit-square map quickly drags any number below a few hundred, the set stays tiny. This runs in effectively O(log n) time per step with O(1) bounded space.",
    functionName: "ends_at_one",
    functionSignature: "def ends_at_one(n: int) -> bool:",
    starter: STARTER_HEADER + "def ends_at_one(n: int) -> bool:\n    pass\n",
    examples: [
      { input: [19], expected: true },
      { input: [2], expected: false },
    ],
    hiddenTests: [
      { input: [1], expected: true },
      { input: [7], expected: true },
      { input: [4], expected: false },
      { input: [100], expected: true },
    ],
  },
  {
    id: "letter-column-index",
    number: 154,
    title: "Letter Column Index",
    difficulty: 'Easy',
    topic: "Math",
    statement:
      "Spreadsheet columns are labeled `\"A\"`, `\"B\"`, ..., `\"Z\"`, then `\"AA\"`, `\"AB\"`, and so on. Given a column label `s` made of uppercase letters, return its 1-based column number, so `\"A\"` is `1` and `\"AB\"` is `28`.",
    explanation:
      "This is base-26 conversion with a twist: there is no zero digit. `A` through `Z` represent 1 through 26, so the label is a bijective base-26 numeral.\n\nProcess the string left to right keeping a running value: multiply the accumulator by 26, then add the current letter's value (`ord(ch) - ord('A') + 1`). This is exactly how you would parse a decimal string, just in base 26 with digits shifted by one. It runs in O(n) time and O(1) space.",
    functionName: "column_index",
    functionSignature: "def column_index(s: str) -> int:",
    starter: STARTER_HEADER + "def column_index(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["A"], expected: 1 },
      { input: ["AB"], expected: 28 },
    ],
    hiddenTests: [
      { input: ["Z"], expected: 26 },
      { input: ["AA"], expected: 27 },
      { input: ["ZY"], expected: 701 },
      { input: ["AAA"], expected: 703 },
    ],
  },
  {
    id: "pure-power-of-three",
    number: 155,
    title: "Pure Power of Three",
    difficulty: 'Easy',
    topic: "Math",
    statement:
      "Given an integer `n` (which may be zero or negative), return `True` if `n` is an exact power of three — that is, `n == 3**k` for some integer `k >= 0` — and `False` otherwise.",
    explanation:
      "A power of three has exactly one prime factor: 3. So if you keep dividing `n` by 3 while it divides evenly, a true power of three will eventually shrink all the way down to 1; anything else will get stuck on a leftover factor.\n\nFirst rule out `n < 1`, since no power of three is zero or negative. Then loop `n //= 3` while `n % 3 == 0` and finally check whether you reached exactly 1. The loop runs at most log base 3 of n times, so this is O(log n) time and O(1) space.",
    functionName: "is_pure_power_three",
    functionSignature: "def is_pure_power_three(n: int) -> bool:",
    starter: STARTER_HEADER + "def is_pure_power_three(n: int) -> bool:\n    pass\n",
    examples: [
      { input: [27], expected: true },
      { input: [45], expected: false },
    ],
    hiddenTests: [
      { input: [1], expected: true },
      { input: [0], expected: false },
      { input: [243], expected: true },
      { input: [-27], expected: false },
    ],
  },
  {
    id: "factorial-zero-tail",
    number: 156,
    title: "Factorial Zero Tail",
    difficulty: 'Easy',
    topic: "Math",
    statement:
      "Given a non-negative integer `n`, return the number of trailing zeros at the end of `n!` (n factorial). Your solution must not compute the factorial itself — for `n = 1000` the factorial has over 2,500 digits.",
    explanation:
      "Every trailing zero comes from a factor of 10, which is a 2 paired with a 5. In `n!` factors of 2 vastly outnumber factors of 5, so the answer is simply how many times 5 divides into the product `1 * 2 * ... * n`.\n\nCount the multiples of 5 up to `n` (each contributes one 5), then the multiples of 25 (each contributes an extra 5), then 125, and so on. That is the sum `n//5 + n//25 + n//125 + ...` until the divisor exceeds `n`. This runs in O(log n) time and O(1) space.",
    functionName: "trailing_zero_count",
    functionSignature: "def trailing_zero_count(n: int) -> int:",
    starter: STARTER_HEADER + "def trailing_zero_count(n: int) -> int:\n    pass\n",
    examples: [
      { input: [5], expected: 1 },
      { input: [25], expected: 6 },
    ],
    hiddenTests: [
      { input: [0], expected: 0 },
      { input: [10], expected: 2 },
      { input: [100], expected: 24 },
      { input: [1000], expected: 249 },
    ],
  },
  {
    id: "insertion-point",
    number: 157,
    title: "Insertion Point",
    difficulty: 'Easy',
    topic: "Binary Search",
    statement:
      "You are given a sorted list of distinct integers `nums` and a target value `target`. If the target is present, return its index; otherwise return the index where it would be inserted to keep the list sorted. Your solution should run in `O(log n)` time.",
    explanation:
      "Notice that both cases — found and not found — are answered by the same number: the count of elements strictly less than the target. That count is exactly where the target sits or belongs.\n\nBinary search for that boundary. Keep `lo` and `hi` pointers; when `nums[mid] < target` the answer lies to the right so move `lo = mid + 1`, otherwise move `hi = mid`. When the pointers meet you have the leftmost position whose value is at least the target. This runs in O(log n) time and O(1) space.",
    functionName: "insertion_point",
    functionSignature: "def insertion_point(nums: List[int], target: int) -> int:",
    starter: STARTER_HEADER + "def insertion_point(nums: List[int], target: int) -> int:\n    pass\n",
    examples: [
      { input: [[1, 3, 5, 6], 5], expected: 2 },
      { input: [[1, 3, 5, 6], 2], expected: 1 },
    ],
    hiddenTests: [
      { input: [[1, 3, 5, 6], 7], expected: 4 },
      { input: [[1, 3, 5, 6], 0], expected: 0 },
      { input: [[5], 5], expected: 0 },
      { input: [[2, 4], 3], expected: 1 },
    ],
  },
  {
    id: "consistent-letter-swap",
    number: 158,
    title: "Consistent Letter Swap",
    difficulty: 'Easy',
    topic: "Hash Table",
    statement:
      "Two strings `s` and `t` of equal length have the same shape if you can replace each distinct character of `s` with a distinct character to obtain `t`, applying the replacement consistently at every position. No two characters of `s` may map to the same character of `t`. Return `True` if `s` and `t` have the same shape.",
    explanation:
      "Walk both strings together and build the substitution as you go. Keep two maps: one from characters of `s` to characters of `t`, and one in the reverse direction — the reverse map is what enforces that two different letters never collapse onto the same target.\n\nAt each position, if either map already has an entry that disagrees with the current pair, the shape is broken and you can return False immediately. Otherwise record the pair in both maps. If you finish the scan without conflict, the mapping is a consistent one-to-one substitution. This runs in O(n) time and O(1) space (the alphabet is bounded).",
    functionName: "same_shape",
    functionSignature: "def same_shape(s: str, t: str) -> bool:",
    starter: STARTER_HEADER + "def same_shape(s: str, t: str) -> bool:\n    pass\n",
    examples: [
      { input: ["egg", "add"], expected: true },
      { input: ["foo", "bar"], expected: false },
    ],
    hiddenTests: [
      { input: ["paper", "title"], expected: true },
      { input: ["badc", "baba"], expected: false },
      { input: ["a", "a"], expected: true },
      { input: ["ab", "aa"], expected: false },
    ],
  },
  {
    id: "pattern-of-words",
    number: 159,
    title: "Pattern of Words",
    difficulty: 'Easy',
    topic: "Hash Table",
    statement:
      "You are given a `pattern` of lowercase letters and a string `s` of words separated by single spaces. Return `True` if the words follow the pattern exactly: there must be a one-to-one correspondence between letters in `pattern` and words in `s`, with the i-th letter always matching the i-th word.",
    explanation:
      "First split `s` into words — if the word count differs from the pattern length, the answer is immediately False. Then this becomes a pairing problem identical in spirit to checking isomorphic strings, just with words on one side.\n\nMaintain two dictionaries: letter to word and word to letter. For each aligned (letter, word) pair, verify any existing entries agree, then record the pair in both directions. The reverse map is essential: without it, pattern `\"ab\"` would wrongly match `\"dog dog\"`. This runs in O(n) time and O(n) space for the word list.",
    functionName: "follows_pattern",
    functionSignature: "def follows_pattern(pattern: str, s: str) -> bool:",
    starter: STARTER_HEADER + "def follows_pattern(pattern: str, s: str) -> bool:\n    pass\n",
    examples: [
      { input: ["abba", "dog cat cat dog"], expected: true },
      { input: ["abba", "dog cat cat fish"], expected: false },
    ],
    hiddenTests: [
      { input: ["aaaa", "dog cat cat dog"], expected: false },
      { input: ["abc", "b c a"], expected: true },
      { input: ["aa", "dog dog"], expected: true },
      { input: ["ab", "dog dog"], expected: false },
    ],
  },
  {
    id: "toll-staircase",
    number: 160,
    title: "Toll Staircase",
    difficulty: 'Easy',
    topic: "Dynamic Programming",
    statement:
      "A staircase has `len(cost)` steps, where `cost[i]` is the toll you pay the moment you stand on step `i`. You may start on step `0` or step `1`, and from any step you may climb up one or two steps. Return the minimum total toll to reach the landing just past the final step. The list has at least 2 steps.",
    explanation:
      "Define the subproblem from the destination's point of view: let `dp[i]` be the cheapest total toll to arrive at position `i`, where positions run from 0 up to `n` (the landing past the last step). You arrive at `i` either from `i-1` (having paid `cost[i-1]`) or from `i-2` (having paid `cost[i-2]`).\n\nThat gives `dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])` with `dp[0] = dp[1] = 0`, since starting on step 0 or 1 is free until you actually use it as a launch point. The answer is `dp[n]`. Since each state only needs the previous two values you can keep two variables instead of an array. This runs in O(n) time and O(1) space.",
    functionName: "min_toll",
    functionSignature: "def min_toll(cost: List[int]) -> int:",
    starter: STARTER_HEADER + "def min_toll(cost: List[int]) -> int:\n    pass\n",
    examples: [
      { input: [[10, 15, 20]], expected: 15 },
      { input: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
    ],
    hiddenTests: [
      { input: [[0, 0]], expected: 0 },
      { input: [[5, 10]], expected: 5 },
      { input: [[1, 2, 3]], expected: 2 },
      { input: [[9, 6, 2, 7, 4]], expected: 12 },
    ],
  },
  {
    id: "snack-stand-change",
    number: 161,
    title: "Snack Stand Change",
    difficulty: 'Easy',
    topic: "Greedy",
    statement:
      "You run a snack stand where every item costs `$5`. Customers line up and pay one at a time with a single bill of `$5`, `$10`, or `$20`, given to you in the order listed in `bills`. You start with no money and must give each customer exact change from the bills you have collected so far. Return `True` if you can serve every customer.",
    explanation:
      "Simulate the line while tracking only how many $5 and $10 bills you hold ($20 bills are useless for making change). A $5 payment needs no change; a $10 payment needs one $5; a $20 payment needs $15 back.\n\nThe one greedy decision is how to break $15: always prefer a $10 plus a $5 over three $5 bills. Five-dollar bills are strictly more flexible — they are the only way to change a $10 — so spending a $10 first preserves your options. If at any point you cannot make change, return False. This runs in O(n) time and O(1) space.",
    functionName: "can_serve_all",
    functionSignature: "def can_serve_all(bills: List[int]) -> bool:",
    starter: STARTER_HEADER + "def can_serve_all(bills: List[int]) -> bool:\n    pass\n",
    examples: [
      { input: [[5, 5, 5, 10, 20]], expected: true },
      { input: [[5, 5, 10, 10, 20]], expected: false },
    ],
    hiddenTests: [
      { input: [[5]], expected: true },
      { input: [[10]], expected: false },
      { input: [[5, 10, 5, 20]], expected: true },
      { input: [[5, 5, 20]], expected: false },
    ],
  },
  {
    id: "bucket-paint",
    number: 162,
    title: "Bucket Paint",
    difficulty: 'Easy',
    topic: "Matrix",
    statement:
      "You are given a grid of integers representing pixel values, a starting cell `(r, c)`, and a new value `color`. Repaint the starting pixel and every pixel reachable from it through side-adjacent pixels (up, down, left, right) that share the starting pixel's original value. Return the resulting grid.",
    explanation:
      "This is the classic paint-bucket tool: a connected-component traversal over cells of one value. Record the original value at `(r, c)`, then run a DFS or BFS from there, recoloring every in-bounds neighbor that still holds the original value.\n\nThere is one important guard: if the new color equals the original value, return the grid unchanged immediately — otherwise the traversal keeps finding 'unpainted' cells forever. Each cell is visited at most once, so this runs in O(rows * cols) time and O(rows * cols) space in the worst case for the traversal stack.",
    functionName: "bucket_paint",
    functionSignature: "def bucket_paint(grid: List[List[int]], r: int, c: int, color: int) -> List[List[int]]:",
    starter: STARTER_HEADER + "def bucket_paint(grid: List[List[int]], r: int, c: int, color: int) -> List[List[int]]:\n    pass\n",
    examples: [
      { input: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
      { input: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]] },
    ],
    hiddenTests: [
      { input: [[[5]], 0, 0, 3], expected: [[3]] },
      { input: [[[1, 1], [1, 0]], 0, 0, 1], expected: [[1, 1], [1, 0]] },
      { input: [[[1, 2, 1], [2, 1, 2]], 0, 0, 9], expected: [[9, 2, 1], [2, 1, 2]] },
      { input: [[[0, 0, 1], [0, 1, 1]], 1, 2, 7], expected: [[0, 0, 7], [0, 7, 7]] },
    ],
  },
  {
    id: "cancel-adjacent-twins",
    number: 163,
    title: "Cancel Adjacent Twins",
    difficulty: 'Easy',
    topic: "Stack",
    statement:
      "Given a string `s` of lowercase letters, repeatedly find any two equal letters that sit next to each other and delete both. Keep doing this until no two adjacent letters are equal. Return the final string — it is guaranteed to be unique regardless of the order of deletions.",
    explanation:
      "Rather than literally rescanning the string after each deletion, process the characters once with a stack. The stack holds the surviving prefix at all times.\n\nFor each incoming character, compare it with the top of the stack: if they match, pop the top (the pair annihilates, and crucially this may expose a new match for the next character); otherwise push it. Deletions that 'cascade', like the middle of `abba`, fall out naturally because popping reveals the older neighbor. Join the stack at the end. This runs in O(n) time and O(n) space.",
    functionName: "cancel_twins",
    functionSignature: "def cancel_twins(s: str) -> str:",
    starter: STARTER_HEADER + "def cancel_twins(s: str) -> str:\n    pass\n",
    examples: [
      { input: ["abbaca"], expected: "ca" },
      { input: ["azxxzy"], expected: "ay" },
    ],
    hiddenTests: [
      { input: ["aa"], expected: "" },
      { input: ["abc"], expected: "abc" },
      { input: ["aabbcc"], expected: "" },
      { input: ["mississippi"], expected: "m" },
    ],
  },
  {
    id: "quick-range-totals",
    number: 164,
    title: "Quick Range Totals",
    difficulty: 'Easy',
    topic: "Prefix Sum",
    statement:
      "You are given a list of integers `nums` and a list of `queries`, where each query is a pair `[l, r]` of indices with `0 <= l <= r < len(nums)`. For each query, compute the sum of `nums[l]` through `nums[r]` inclusive. Return the answers as a list, in the same order as the queries.",
    explanation:
      "Summing each range from scratch costs O(n) per query, which is wasteful when there are many queries over the same array. Precompute instead: build a prefix array where `prefix[i]` holds the sum of the first `i` elements, with `prefix[0] = 0`.\n\nThen any inclusive range sum collapses to a subtraction: `sum(l..r) = prefix[r + 1] - prefix[l]`. Build the prefix once in O(n), then answer every query in O(1). Overall this runs in O(n + q) time and O(n) space.",
    functionName: "range_totals",
    functionSignature: "def range_totals(nums: List[int], queries: List[List[int]]) -> List[int]:",
    starter: STARTER_HEADER + "def range_totals(nums: List[int], queries: List[List[int]]) -> List[int]:\n    pass\n",
    examples: [
      { input: [[-2, 0, 3, -5, 2, -1], [[0, 2], [2, 5], [0, 5]]], expected: [1, -1, -3] },
      { input: [[1, 2, 3, 4], [[1, 3]]], expected: [9] },
    ],
    hiddenTests: [
      { input: [[5], [[0, 0]]], expected: [5] },
      { input: [[1, 2, 3, 4, 5], [[0, 4], [1, 3], [2, 2]]], expected: [15, 9, 3] },
      { input: [[-1, -2, -3], [[0, 1]]], expected: [-3] },
      { input: [[0, 0, 0], [[0, 2], [1, 1]]], expected: [0, 0] },
    ],
  },
  {
    id: "town-celebrity-check",
    number: 165,
    title: "Town Celebrity Check",
    difficulty: 'Easy',
    topic: "Graph",
    statement:
      "In a town of `n` people labeled `1` through `n`, one person might be the town celebrity: everyone else trusts them, and they trust nobody. You are given `trust`, a list of pairs `[a, b]` meaning person `a` trusts person `b`. Return the label of the celebrity if one exists, otherwise return `-1`.",
    explanation:
      "Model trust as a directed graph and think about degrees. The celebrity must have in-degree `n - 1` (everyone else trusts them) and out-degree `0` (they trust no one). Those two conditions can be merged into a single score.\n\nFor each pair `[a, b]`, add 1 to `b`'s score and subtract 1 from `a`'s score. The celebrity is the unique person whose score is exactly `n - 1`: any outgoing trust would knock them below that, and only full incoming trust reaches it. Scan the scores and return the first match, or -1. This runs in O(n + len(trust)) time and O(n) space.",
    functionName: "trusted_person",
    functionSignature: "def trusted_person(n: int, trust: List[List[int]]) -> int:",
    starter: STARTER_HEADER + "def trusted_person(n: int, trust: List[List[int]]) -> int:\n    pass\n",
    examples: [
      { input: [2, [[1, 2]]], expected: 2 },
      { input: [3, [[1, 3], [2, 3], [3, 1]]], expected: -1 },
    ],
    hiddenTests: [
      { input: [1, []], expected: 1 },
      { input: [3, [[1, 3], [2, 3]]], expected: 3 },
      { input: [4, [[1, 2], [3, 2], [4, 2], [2, 1]]], expected: -1 },
      { input: [2, []], expected: -1 },
    ],
  },
  {
    id: "roman-numeral-builder",
    number: 166,
    title: "Roman Numeral Builder",
    difficulty: 'Medium',
    topic: "Math",
    statement:
      "Given an integer `n` with `1 <= n <= 3999`, return its Roman numeral representation as a string. Use the standard symbols `I, V, X, L, C, D, M` and the six subtractive forms `IV, IX, XL, XC, CD, CM` — for example `1994` becomes `\"MCMXCIV\"`.",
    explanation:
      "Roman numerals are built greedily: at every step you write the largest symbol (or subtractive pair) that fits into what remains. Treating the subtractive pairs as first-class 'symbols' with their own values makes the greedy rule airtight.\n\nKeep a table of thirteen value/symbol entries from `(1000, \"M\")` down to `(1, \"I\")`, including entries like `(900, \"CM\")` and `(40, \"XL\")`. Walk the table in descending order, and for each entry append the symbol while the value still fits, subtracting as you go. Because the table is fixed size and `n` only shrinks, this runs in O(1) time and O(1) space.",
    functionName: "to_roman",
    functionSignature: "def to_roman(n: int) -> str:",
    starter: STARTER_HEADER + "def to_roman(n: int) -> str:\n    pass\n",
    examples: [
      { input: [58], expected: "LVIII" },
      { input: [1994], expected: "MCMXCIV" },
    ],
    hiddenTests: [
      { input: [3], expected: "III" },
      { input: [9], expected: "IX" },
      { input: [3749], expected: "MMMDCCXLIX" },
      { input: [2026], expected: "MMXXVI" },
    ],
  },
  {
    id: "forgiving-integer-parser",
    number: 167,
    title: "Forgiving Integer Parser",
    difficulty: 'Medium',
    topic: "String",
    statement:
      "Parse a string `s` into an integer the way a lenient converter would: skip leading spaces, read one optional `'+'` or `'-'`, then read digits until the first non-digit character and ignore everything after. If no digits are read, return `0`. Clamp the result into the 32-bit signed range `[-2147483648, 2147483647]`.",
    explanation:
      "Resist the urge to use regex or built-in parsing — interviewers want the state machine. Track an index through three phases: whitespace skipping, an optional single sign character, then a digit-consuming loop that builds the value with `val = val * 10 + digit`.\n\nThe details that fail people are the edge cases: a sign with no digits after it returns 0, a sign appearing after spaces is fine but a second sign ends parsing, and clamping happens only at the end (Python integers never overflow, so a final `max`/`min` against the 32-bit bounds suffices). This runs in O(n) time and O(1) space.",
    functionName: "parse_lenient_int",
    functionSignature: "def parse_lenient_int(s: str) -> int:",
    starter: STARTER_HEADER + "def parse_lenient_int(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["   -42abc"], expected: -42 },
      { input: ["4193 with words"], expected: 4193 },
    ],
    hiddenTests: [
      { input: ["words 987"], expected: 0 },
      { input: ["-91283472332"], expected: -2147483648 },
      { input: ["+1"], expected: 1 },
      { input: ["  +-12"], expected: 0 },
    ],
  },
  {
    id: "release-version-compare",
    number: 168,
    title: "Release Version Compare",
    difficulty: 'Medium',
    topic: "String",
    statement:
      "Two release versions `v1` and `v2` are strings of numeric revisions separated by dots, like `\"1.01\"` or `\"7.5.2\"`. Compare them revision by revision as integers (so leading zeros are ignored), treating missing trailing revisions as `0`. Return `-1` if `v1 < v2`, `1` if `v1 > v2`, and `0` if they are equal.",
    explanation:
      "Split each version on dots and convert every chunk with `int()`, which handles leading zeros for free: `\"01\"` and `\"001\"` both become 1. The subtlety is that the two lists can have different lengths, and `\"1.0\"` must equal `\"1\"`.\n\nPad the shorter list with zeros until both have the same length, then compare element by element (or lean on Python's list comparison, which is already lexicographic over the integer lists once padded). Return -1, 1, or 0 accordingly. This runs in O(n + m) time and O(n + m) space for the split lists.",
    functionName: "compare_release_versions",
    functionSignature: "def compare_release_versions(v1: str, v2: str) -> int:",
    starter: STARTER_HEADER + "def compare_release_versions(v1: str, v2: str) -> int:\n    pass\n",
    examples: [
      { input: ["1.2", "1.10"], expected: -1 },
      { input: ["1.01", "1.001"], expected: 0 },
    ],
    hiddenTests: [
      { input: ["1.0", "1.0.0"], expected: 0 },
      { input: ["0.1", "1.1"], expected: -1 },
      { input: ["1.0.1", "1"], expected: 1 },
      { input: ["7.5.2.4", "7.5.3"], expected: -1 },
    ],
  },
  {
    id: "unpack-repeat-notation",
    number: 169,
    title: "Unpack Repeat Notation",
    difficulty: 'Medium',
    topic: "Stack",
    statement:
      "A compressed string uses the notation `k[inner]`, meaning the string `inner` is repeated exactly `k` times. Patterns can be nested, as in `\"3[a2[c]]\"` which expands to `\"accaccacc\"`. Given a well-formed compressed string `s` containing lowercase letters, digits, and square brackets (digits appear only as repeat counts), return the fully expanded string.",
    explanation:
      "Nesting screams stack. Keep a current string buffer and a current number; the stack stores the context you must return to when a bracket closes.\n\nScan character by character: digits accumulate into the number (counts can be multi-digit, like `10[a]`); on `'['` push the pair (current buffer, current number) and reset both; letters append to the buffer; on `']'` pop `(prev, k)` and set the buffer to `prev + buffer * k`. When the scan ends the buffer is the answer. Each output character is produced a constant number of times, so this runs in O(output length) time and space.",
    functionName: "unpack_repeats",
    functionSignature: "def unpack_repeats(s: str) -> str:",
    starter: STARTER_HEADER + "def unpack_repeats(s: str) -> str:\n    pass\n",
    examples: [
      { input: ["3[a]2[bc]"], expected: "aaabcbc" },
      { input: ["3[a2[c]]"], expected: "accaccacc" },
    ],
    hiddenTests: [
      { input: ["2[abc]3[cd]ef"], expected: "abcabccdcdcdef" },
      { input: ["abc"], expected: "abc" },
      { input: ["10[a]"], expected: "aaaaaaaaaa" },
      { input: ["2[b3[a]]"], expected: "baaabaaa" },
    ],
  },
  {
    id: "tidy-file-path",
    number: 170,
    title: "Tidy File Path",
    difficulty: 'Medium',
    topic: "Stack",
    statement:
      "Given an absolute Unix-style file path `path` (it always starts with `'/'`), simplify it to its canonical form: a single `'.'` means the current directory, `'..'` moves up one level (but not above the root), and repeated slashes collapse into one. Any other run of characters — including names like `'...'` — is a valid directory name. Return the canonical path, which starts with `'/'` and has no trailing slash unless it is exactly `\"/\"`.",
    explanation:
      "Split the path on `'/'` and process the pieces with a stack of confirmed directory names. The split conveniently turns runs of slashes into empty strings you can skip.\n\nFor each piece: skip empty strings and `'.'`; on `'..'` pop the stack if it is non-empty (popping an empty stack would climb above root, which is a no-op); anything else — including `'...'` or `'a.b'` — is a real name to push. Finally join with slashes and prefix a single `'/'`; an empty stack naturally yields `\"/\"`. This runs in O(n) time and O(n) space.",
    functionName: "canonical_folder_path",
    functionSignature: "def canonical_folder_path(path: str) -> str:",
    starter: STARTER_HEADER + "def canonical_folder_path(path: str) -> str:\n    pass\n",
    examples: [
      { input: ["/home//foo/"], expected: "/home/foo" },
      { input: ["/a/./b/../../c/"], expected: "/c" },
    ],
    hiddenTests: [
      { input: ["/../"], expected: "/" },
      { input: ["/"], expected: "/" },
      { input: ["/a/../../b/../c//.//"], expected: "/c" },
      { input: ["/...//b"], expected: "/.../b" },
    ],
  },
  {
    id: "boulder-collision-course",
    number: 171,
    title: "Boulder Collision Course",
    difficulty: 'Medium',
    topic: "Stack",
    statement:
      "Boulders roll along a narrow canyon, described by a list of non-zero integers: the absolute value is a boulder's size and the sign is its direction (positive rolls right, negative rolls left). All boulders move at the same speed. When two boulders meet, the smaller one shatters; if they are equal, both shatter; boulders moving the same direction never meet. Return the list of surviving boulders in their original order.",
    explanation:
      "Only one kind of meeting is possible: a right-mover that has a left-mover somewhere after it. That ordering constraint is exactly what a stack captures — the stack holds boulders whose fate is not yet sealed.\n\nPush right-movers freely. When a left-mover arrives, let it fight the stack top while the top is a smaller right-mover (pop the top and keep fighting). If it meets an equal right-mover, pop that one and the left-mover dies too; if it meets a bigger one, the left-mover dies alone; if the stack empties or its top moves left, the newcomer survives and is pushed. Each boulder is pushed and popped at most once, so this runs in O(n) time and O(n) space.",
    functionName: "boulder_collisions",
    functionSignature: "def boulder_collisions(boulders: List[int]) -> List[int]:",
    starter: STARTER_HEADER + "def boulder_collisions(boulders: List[int]) -> List[int]:\n    pass\n",
    examples: [
      { input: [[5, 10, -5]], expected: [5, 10] },
      { input: [[10, 2, -5]], expected: [10] },
    ],
    hiddenTests: [
      { input: [[8, -8]], expected: [] },
      { input: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2] },
      { input: [[1, -2, -2, -2]], expected: [-2, -2, -2] },
      { input: [[5, -5, 5, -5]], expected: [] },
    ],
  },
  {
    id: "highway-convoys",
    number: 172,
    title: "Highway Convoys",
    difficulty: 'Medium',
    topic: "Monotonic Stack",
    statement:
      "Cars drive toward a checkpoint at mile `target` on a one-lane highway. Car `i` starts at mile `positions[i]` (all distinct, all less than `target`) and drives at `speeds[i]` miles per hour. A car can never pass the car ahead of it: when it catches up, it slows down and they travel together as a single convoy. Return the number of convoys that arrive at the checkpoint.",
    explanation:
      "Ignore the catching-up mechanics and compute, for each car, the time it would reach the checkpoint driving alone: `(target - position) / speed`. A car merges into the car ahead exactly when its solo time is less than or equal to the leader's effective time.\n\nSort cars by starting position, closest to the checkpoint first, and sweep while tracking the slowest (largest) arrival time seen so far — the current convoy leader. If the next car's solo time is strictly greater, it can never catch the leader and starts a new convoy; otherwise it merges and is absorbed. Count the new leaders. Sorting dominates: O(n log n) time and O(n) space.",
    functionName: "convoy_count",
    functionSignature: "def convoy_count(target: int, positions: List[int], speeds: List[int]) -> int:",
    starter: STARTER_HEADER + "def convoy_count(target: int, positions: List[int], speeds: List[int]) -> int:\n    pass\n",
    examples: [
      { input: [12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], expected: 3 },
      { input: [10, [3], [3]], expected: 1 },
    ],
    hiddenTests: [
      { input: [100, [0, 2, 4], [4, 2, 1]], expected: 1 },
      { input: [10, [6, 8], [3, 2]], expected: 2 },
      { input: [10, [0, 4, 2], [2, 1, 3]], expected: 1 },
      { input: [12, [4, 8], [1, 1]], expected: 2 },
    ],
  },
  {
    id: "rescue-boat-count",
    number: 173,
    title: "Rescue Boat Count",
    difficulty: 'Medium',
    topic: "Two Pointers",
    statement:
      "People must be evacuated by boat. Person `i` weighs `weights[i]`, every boat carries at most two people, and a boat's total load cannot exceed `limit`. No single person weighs more than `limit`. Return the minimum number of boats needed to carry everyone.",
    explanation:
      "Sort the weights and think about the heaviest remaining person: they must board some boat, and the best possible partner for them is the lightest remaining person — if even that pairing exceeds the limit, the heavy person rides alone, and no other choice could do better.\n\nThat insight becomes a two-pointer sweep: `i` at the lightest, `j` at the heaviest. Each iteration launches one boat carrying person `j`, and also person `i` when `weights[i] + weights[j] <= limit` (advance `i`). Decrement `j` and repeat until the pointers cross. Sorting dominates, so this runs in O(n log n) time and O(1) extra space.",
    functionName: "min_rescue_boats",
    functionSignature: "def min_rescue_boats(weights: List[int], limit: int) -> int:",
    starter: STARTER_HEADER + "def min_rescue_boats(weights: List[int], limit: int) -> int:\n    pass\n",
    examples: [
      { input: [[1, 2], 3], expected: 1 },
      { input: [[3, 2, 2, 1], 3], expected: 3 },
    ],
    hiddenTests: [
      { input: [[3, 5, 3, 4], 5], expected: 4 },
      { input: [[1, 2, 3], 3], expected: 2 },
      { input: [[5, 1, 4, 2], 6], expected: 2 },
      { input: [[2, 2], 3], expected: 2 },
    ],
  },
  {
    id: "two-office-offsites",
    number: 174,
    title: "Two Office Offsites",
    difficulty: 'Medium',
    topic: "Greedy",
    statement:
      "Your company is flying `2n` employees to two offsite locations, A and B, with exactly `n` people attending each. Flying employee `i` to A costs `costs[i][0]` and to B costs `costs[i][1]`. Return the minimum total cost to fly everyone, with exactly half at each location.",
    explanation:
      "Imagine first sending everyone to A, then choosing `n` people to switch to B. Switching employee `i` changes the bill by `costs[i][1] - costs[i][0]`, so you want the `n` employees for whom that difference is smallest (most negative or least positive).\n\nEquivalently, sort all employees by `costs[i][0] - costs[i][1]`: those who favor A most strongly come first. Send the first `n` of the sorted list to A and the rest to B, summing the corresponding costs. The exchange argument shows no other split can beat this. Sorting dominates: O(n log n) time and O(n) space.",
    functionName: "min_offsite_cost",
    functionSignature: "def min_offsite_cost(costs: List[List[int]]) -> int:",
    starter: STARTER_HEADER + "def min_offsite_cost(costs: List[List[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[10, 20], [30, 200], [400, 50], [30, 20]]], expected: 110 },
      { input: [[[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]]], expected: 1859 },
    ],
    hiddenTests: [
      { input: [[[1, 2], [2, 1]]], expected: 2 },
      { input: [[[5, 5], [5, 5]]], expected: 10 },
      { input: [[[100, 1], [1, 100], [50, 50], [50, 50]]], expected: 102 },
      { input: [[[10, 1], [10, 1]]], expected: 11 },
    ],
  },
  {
    id: "rope-joining-cost",
    number: 175,
    title: "Rope Joining Cost",
    difficulty: 'Medium',
    topic: "Heap",
    statement:
      "You have a list of rope lengths and want to tie them all into one rope. Joining two ropes of lengths `x` and `y` costs `x + y` and produces a single rope of length `x + y`. Return the minimum total cost to join everything into one rope; if there is only one rope, the cost is `0`.",
    explanation:
      "Every join's cost gets baked into the new rope and paid again in every later join that includes it — so ropes joined early are paid for many times. That means short ropes should be merged first, and long ropes should enter the process as late as possible.\n\nA min-heap makes the greedy efficient: push all lengths, then repeatedly pop the two smallest, add their sum to the total, and push the sum back, until one rope remains. This is exactly Huffman tree construction, and the same exchange argument proves optimality. With n ropes and O(log n) per heap operation, this runs in O(n log n) time and O(n) space.",
    functionName: "min_rope_cost",
    functionSignature: "def min_rope_cost(ropes: List[int]) -> int:",
    starter: STARTER_HEADER + "def min_rope_cost(ropes: List[int]) -> int:\n    pass\n",
    examples: [
      { input: [[4, 3, 2, 6]], expected: 29 },
      { input: [[1, 2, 3]], expected: 9 },
    ],
    hiddenTests: [
      { input: [[5]], expected: 0 },
      { input: [[10, 20]], expected: 30 },
      { input: [[1, 2, 5, 10, 35, 89]], expected: 224 },
      { input: [[2, 2, 3, 3]], expected: 20 },
    ],
  },
  {
    id: "the-two-loners",
    number: 176,
    title: "The Two Loners",
    difficulty: 'Medium',
    topic: "Binary",
    statement:
      "In the list `nums`, every value appears exactly twice except for two distinct values that each appear exactly once. Find those two values and return them as a list in increasing order. Aim for linear time and constant extra space.",
    explanation:
      "XOR-ing the whole array cancels every paired value, leaving `a ^ b` where `a` and `b` are the two loners. That combined value is not the answer yet, but any set bit in it marks a position where `a` and `b` differ.\n\nPick one such bit — `x & (-x)` isolates the lowest set bit. Partition the numbers by whether they have that bit set: each partition contains exactly one loner plus only complete pairs, so XOR-ing each partition separately yields `a` and `b` individually. Sort the two results before returning. This runs in O(n) time and O(1) space.",
    functionName: "find_two_loners",
    functionSignature: "def find_two_loners(nums: List[int]) -> List[int]:",
    starter: STARTER_HEADER + "def find_two_loners(nums: List[int]) -> List[int]:\n    pass\n",
    examples: [
      { input: [[1, 2, 1, 3, 2, 5]], expected: [3, 5] },
      { input: [[-1, 0]], expected: [-1, 0] },
    ],
    hiddenTests: [
      { input: [[0, 1]], expected: [0, 1] },
      { input: [[1, 1, 2, 3]], expected: [2, 3] },
      { input: [[4, 4, 6, 2, 6, 9]], expected: [2, 9] },
      { input: [[7, 3, 7, 5, 3, 8, 8, 10]], expected: [5, 10] },
    ],
  },
  {
    id: "square-summand-minimum",
    number: 177,
    title: "Square Summand Minimum",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "Given a positive integer `n`, return the minimum number of perfect squares (`1, 4, 9, 16, ...`) that sum to exactly `n`. Squares may be reused any number of times — for example `12 = 4 + 4 + 4` uses three squares.",
    explanation:
      "This is an unbounded coin-change problem where the coins are the perfect squares up to `n`. Define `dp[i]` as the fewest squares summing to `i`, with `dp[0] = 0`.\n\nFor each amount `i` from 1 to `n`, try every square `j*j <= i` as the last summand: `dp[i] = min(dp[i - j*j] + 1)` over all valid `j`. The answer is `dp[n]`, which by Lagrange's four-square theorem is always at most 4 — a nice sanity check for your tests. This runs in O(n * sqrt(n)) time and O(n) space.",
    functionName: "fewest_squares",
    functionSignature: "def fewest_squares(n: int) -> int:",
    starter: STARTER_HEADER + "def fewest_squares(n: int) -> int:\n    pass\n",
    examples: [
      { input: [12], expected: 3 },
      { input: [13], expected: 2 },
    ],
    hiddenTests: [
      { input: [1], expected: 1 },
      { input: [7], expected: 4 },
      { input: [25], expected: 1 },
      { input: [9999], expected: 4 },
    ],
  },
  {
    id: "orchard-points",
    number: 178,
    title: "Orchard Points",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "You are picking numbered fruit from an orchard described by a list `nums` of positive integers. Picking any element with value `v` earns you `v` points, but then every element equal to `v - 1` and every element equal to `v + 1` vanishes from the orchard. You may keep picking remaining elements (including other copies of `v`). Return the maximum total points you can earn.",
    explanation:
      "First collapse the list with a counter: picking one copy of value `v` destroys all `v-1` and `v+1`, so once you commit to `v` you should take every copy, earning `v * count[v]` in one decision. Now the problem is over distinct values: take a value and you cannot take its immediate neighbors.\n\nThat is exactly the house-robber recurrence run over the sorted distinct values. Walk them in order tracking two states, the best total if you take the current value and the best if you skip it; when the previous distinct value is not exactly one less, there is no conflict and both states build on the best so far. This runs in O(n log n) time (for the sort) and O(n) space.",
    functionName: "max_orchard_points",
    functionSignature: "def max_orchard_points(nums: List[int]) -> int:",
    starter: STARTER_HEADER + "def max_orchard_points(nums: List[int]) -> int:\n    pass\n",
    examples: [
      { input: [[3, 4, 2]], expected: 6 },
      { input: [[2, 2, 3, 3, 3, 4]], expected: 9 },
    ],
    hiddenTests: [
      { input: [[1]], expected: 1 },
      { input: [[5, 5, 5]], expected: 15 },
      { input: [[2, 3, 4]], expected: 6 },
      { input: [[1, 1, 1, 2, 4, 5, 5, 5, 6]], expected: 18 },
    ],
  },
  {
    id: "break-and-multiply",
    number: 179,
    title: "Break and Multiply",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "Given an integer `n >= 2`, write it as a sum of at least two positive integers and maximize the product of those parts. Return the maximum product — for example `10 = 3 + 3 + 4` gives `36`.",
    explanation:
      "Let `dp[i]` be the best product obtainable by splitting `i` into at least two parts. For each first part `j` from 1 to `i - 1`, the rest is `i - j`, which you may either leave whole (product `j * (i - j)`) or split further (product `j * dp[i - j]`). Take the maximum over all choices.\n\nThe 'leave whole' option matters because `dp` values are forced to split — `dp[3] = 2` even though 3 itself is bigger. (If you want the closed-form shortcut: optimal splits use all 3s, swapping one 3 for a 4 when the remainder is 1.) The DP runs in O(n^2) time and O(n) space.",
    functionName: "best_split_product",
    functionSignature: "def best_split_product(n: int) -> int:",
    starter: STARTER_HEADER + "def best_split_product(n: int) -> int:\n    pass\n",
    examples: [
      { input: [2], expected: 1 },
      { input: [10], expected: 36 },
    ],
    hiddenTests: [
      { input: [3], expected: 2 },
      { input: [4], expected: 4 },
      { input: [8], expected: 18 },
      { input: [58], expected: 1549681956 },
    ],
  },
  {
    id: "nth-regular-number",
    number: 180,
    title: "Nth Regular Number",
    difficulty: 'Medium',
    topic: "Heap",
    statement:
      "A regular number is a positive integer whose only prime factors are `2`, `3`, or `5`. The sequence in increasing order begins `1, 2, 3, 4, 5, 6, 8, 9, 10, 12, ...`. Given an integer `n >= 1`, return the `n`-th regular number (1-indexed, so `n = 1` returns `1`).",
    explanation:
      "Every regular number after 1 is a previous regular number multiplied by 2, 3, or 5. So instead of testing integers one by one (hopeless — regular numbers thin out fast), generate the sequence directly from itself.\n\nKeep the list built so far and three pointers `i2, i3, i5`, where pointer `ix` marks the first list element whose product with `x` has not been used yet. The next regular number is the minimum of the three candidate products; append it, then advance every pointer whose candidate equals it (advancing all matching pointers is what prevents duplicates like 6 = 2*3 = 3*2). This runs in O(n) time and O(n) space.",
    functionName: "nth_regular_number",
    functionSignature: "def nth_regular_number(n: int) -> int:",
    starter: STARTER_HEADER + "def nth_regular_number(n: int) -> int:\n    pass\n",
    examples: [
      { input: [10], expected: 12 },
      { input: [1], expected: 1 },
    ],
    hiddenTests: [
      { input: [7], expected: 8 },
      { input: [11], expected: 15 },
      { input: [16], expected: 25 },
      { input: [20], expected: 36 },
    ],
  },
  {
    id: "colony-tick",
    number: 181,
    title: "Colony Tick",
    difficulty: 'Medium',
    topic: "Simulation",
    statement:
      "A bacterial colony lives on a finite grid where `1` is a live cell and `0` is dead; everything outside the grid is permanently dead. In one tick, all cells update simultaneously: a live cell survives only with 2 or 3 live neighbors (counting all 8 surrounding cells), and a dead cell becomes alive with exactly 3 live neighbors. Return the grid after one tick.",
    explanation:
      "The trap is updating in place while neighbors still need the old values — a cell you just killed would wrongly change its neighbor's count. The simplest correct approach is to build a fresh output grid and read only from the original.\n\nFor each cell, count live neighbors by looping over the eight `(di, dj)` offsets, skipping `(0, 0)` and anything out of bounds. Then apply the two rules: live stays live on a count of 2 or 3; dead becomes live on exactly 3; everything else is dead. This runs in O(rows * cols) time and O(rows * cols) space for the new grid.",
    functionName: "colony_tick",
    functionSignature: "def colony_tick(grid: List[List[int]]) -> List[List[int]]:",
    starter: STARTER_HEADER + "def colony_tick(grid: List[List[int]]) -> List[List[int]]:\n    pass\n",
    examples: [
      { input: [[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], expected: [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[1, 1], [1, 1]] },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: [[0]] },
      { input: [[[0]]], expected: [[0]] },
      { input: [[[1, 0], [0, 1]]], expected: [[0, 0], [0, 0]] },
      { input: [[[1, 1, 0], [0, 1, 0], [0, 0, 0]]], expected: [[1, 1, 0], [1, 1, 0], [0, 0, 0]] },
    ],
  },
  {
    id: "every-door-unlocked",
    number: 182,
    title: "Every Door Unlocked",
    difficulty: 'Medium',
    topic: "Graph",
    statement:
      "A building has rooms numbered `0` to `n - 1`. Room `0` is unlocked; every other room is locked. `rooms[i]` lists the keys lying in room `i`, where each key opens the room with that number. You may move freely between rooms you have unlocked. Return `True` if you can eventually enter every room.",
    explanation:
      "Model rooms as nodes and keys as directed edges: a key to room `k` found in room `i` is an edge from `i` to `k`. The question becomes pure reachability — can you reach every node starting from node 0?\n\nRun a DFS or BFS from room 0, keeping a visited set. Each time you enter a new room, push all its keys that lead to rooms you have not visited yet. When the traversal exhausts, compare the visited count with `n`. Keys to already-open rooms and duplicate keys are naturally ignored by the set. This runs in O(n + total keys) time and O(n) space.",
    functionName: "can_unlock_all",
    functionSignature: "def can_unlock_all(rooms: List[List[int]]) -> bool:",
    starter: STARTER_HEADER + "def can_unlock_all(rooms: List[List[int]]) -> bool:\n    pass\n",
    examples: [
      { input: [[[1], [2], [3], []]], expected: true },
      { input: [[[1, 3], [3, 0, 1], [2], [0]]], expected: false },
    ],
    hiddenTests: [
      { input: [[[]]], expected: true },
      { input: [[[2], [], [1]]], expected: true },
      { input: [[[1], [], [0]]], expected: false },
      { input: [[[1, 2], [3], [], []]], expected: true },
    ],
  },
  {
    id: "steps-to-the-nearest-zero",
    number: 183,
    title: "Steps to the Nearest Zero",
    difficulty: 'Medium',
    topic: "Matrix",
    statement:
      "You are given a grid containing only `0`s and `1`s, with at least one `0` present. For every cell, compute the minimum number of steps to reach a cell containing `0`, where a step moves up, down, left, or right. Return the grid of distances (cells holding `0` have distance `0`).",
    explanation:
      "Running a separate search from every `1` is quadratic in the worst case. Flip the perspective: start from all the zeros at once. A multi-source BFS seeded with every zero cell expands outward in rings, and the first ring to touch a cell is, by BFS's level-order guarantee, its true distance.\n\nInitialize a distance grid with 0 for zero-cells and a sentinel (say -1) elsewhere, and enqueue every zero. Pop cells in order; for each unvisited neighbor, set its distance to the popped cell's distance plus one and enqueue it. Every cell enters the queue exactly once. This runs in O(rows * cols) time and O(rows * cols) space.",
    functionName: "nearest_zero_steps",
    functionSignature: "def nearest_zero_steps(grid: List[List[int]]) -> List[List[int]]:",
    starter: STARTER_HEADER + "def nearest_zero_steps(grid: List[List[int]]) -> List[List[int]]:\n    pass\n",
    examples: [
      { input: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
      { input: [[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], expected: [[0, 0, 0], [0, 1, 0], [1, 2, 1]] },
    ],
    hiddenTests: [
      { input: [[[0]]], expected: [[0]] },
      { input: [[[0, 1], [1, 1]]], expected: [[0, 1], [1, 2]] },
      { input: [[[1, 0, 1, 1]]], expected: [[1, 0, 1, 2]] },
      { input: [[[0, 1, 1], [1, 1, 1]]], expected: [[0, 1, 2], [1, 2, 3]] },
    ],
  },
  {
    id: "windows-under-the-product-cap",
    number: 184,
    title: "Windows Under the Product Cap",
    difficulty: 'Medium',
    topic: "Sliding Window",
    statement:
      "Given a list `nums` of positive integers and an integer `k`, count how many contiguous subarrays have a product strictly less than `k`. Note that if `k <= 1` no subarray qualifies, since every product is at least `1`.",
    explanation:
      "Because every element is positive, extending a window can only grow the product and shrinking it can only reduce it — products are monotone in the window. That monotonicity is the license for a sliding window.\n\nGrow `right` one step at a time, multiplying the running product; while it is at least `k`, divide off `nums[left]` and advance `left`. After fixing things up, every subarray ending at `right` and starting at or after `left` is valid, and there are exactly `right - left + 1` of them — add that to the count. Handle `k <= 1` upfront. Each index enters and leaves the window once, so this runs in O(n) time and O(1) space.",
    functionName: "count_capped_product_windows",
    functionSignature: "def count_capped_product_windows(nums: List[int], k: int) -> int:",
    starter: STARTER_HEADER + "def count_capped_product_windows(nums: List[int], k: int) -> int:\n    pass\n",
    examples: [
      { input: [[10, 5, 2, 6], 100], expected: 8 },
      { input: [[1, 2, 3], 0], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1, 1, 1], 2], expected: 6 },
      { input: [[10], 10], expected: 0 },
      { input: [[10], 11], expected: 1 },
      { input: [[2, 3, 4], 13], expected: 5 },
    ],
  },
  {
    id: "longest-run-with-k-flips",
    number: 185,
    title: "Longest Run with K Flips",
    difficulty: 'Medium',
    topic: "Sliding Window",
    statement:
      "You are given a binary list `nums` (containing only `0`s and `1`s) and an integer `k >= 0`. You may flip at most `k` zeros into ones. Return the length of the longest contiguous run of `1`s you can produce.",
    explanation:
      "Rephrase the goal: find the longest window that contains at most `k` zeros, since exactly those windows can be turned all-ones with your flip budget. That 'at most k of something' constraint is the classic sliding-window shape.\n\nExpand `right` across the array, incrementing a zero counter when you absorb a 0. Whenever the counter exceeds `k`, advance `left` (decrementing the counter when a 0 exits) until the window is legal again. Track the maximum window size seen. The window never shrinks below its best, and each pointer moves at most n times. This runs in O(n) time and O(1) space.",
    functionName: "longest_run_with_flips",
    functionSignature: "def longest_run_with_flips(nums: List[int], k: int) -> int:",
    starter: STARTER_HEADER + "def longest_run_with_flips(nums: List[int], k: int) -> int:\n    pass\n",
    examples: [
      { input: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
      { input: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expected: 10 },
    ],
    hiddenTests: [
      { input: [[0, 0, 0], 0], expected: 0 },
      { input: [[1, 1], 0], expected: 2 },
      { input: [[0, 0, 1], 2], expected: 3 },
      { input: [[1, 0, 1, 0, 1], 1], expected: 3 },
    ],
  },
  {
    id: "prefix-beats-suffix",
    number: 186,
    title: "Prefix Beats Suffix",
    difficulty: 'Medium',
    topic: "Prefix Sum",
    statement:
      "Given a list of integers `nums` with at least two elements, count the number of valid split points. A split at index `i` (where `0 <= i < len(nums) - 1`) is valid when the sum of `nums[0..i]` is greater than or equal to the sum of `nums[i+1..]`. Both sides must be non-empty.",
    explanation:
      "Computing both side sums from scratch for each split is O(n^2). Instead, compute the total once; then as you sweep a running prefix sum from left to right, the right side is always `total - prefix` — no second pass needed.\n\nIterate `i` over every index except the last, adding `nums[i]` to the prefix and checking `prefix >= total - prefix`. Count the successes. Watch the boundary: the last index is not a valid split because the right side would be empty. This runs in O(n) time and O(1) space.",
    functionName: "count_prefix_wins",
    functionSignature: "def count_prefix_wins(nums: List[int]) -> int:",
    starter: STARTER_HEADER + "def count_prefix_wins(nums: List[int]) -> int:\n    pass\n",
    examples: [
      { input: [[10, 4, -8, 7]], expected: 2 },
      { input: [[2, 3, 1, 0]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[1, 1]], expected: 1 },
      { input: [[0, 0, 0]], expected: 2 },
      { input: [[-1, -2, -3]], expected: 2 },
      { input: [[5, -100, 1]], expected: 1 },
    ],
  },
  {
    id: "one-step-lexicographic",
    number: 187,
    title: "One Step Lexicographic",
    difficulty: 'Medium',
    topic: "Array",
    statement:
      "Given a list of integers `nums`, rearrange its elements into the next arrangement in lexicographic order — the smallest arrangement that is strictly greater than the current one. If `nums` is already the greatest possible arrangement, return its elements sorted in increasing order instead. Return the resulting list.",
    explanation:
      "Scan from the right to find the pivot: the last index `i` where `nums[i] < nums[i+1]`. Everything after the pivot is non-increasing — already the largest arrangement of that suffix — so the only way to grow the sequence minimally is to bump the pivot itself.\n\nSwap the pivot with the smallest element to its right that is still larger than it (found by scanning from the end), then reverse the suffix so it becomes the smallest arrangement of its values. If no pivot exists, the whole list is non-increasing and reversing it gives the sorted wrap-around case. This runs in O(n) time and O(1) extra space beyond the returned list.",
    functionName: "next_arrangement",
    functionSignature: "def next_arrangement(nums: List[int]) -> List[int]:",
    starter: STARTER_HEADER + "def next_arrangement(nums: List[int]) -> List[int]:\n    pass\n",
    examples: [
      { input: [[1, 2, 3]], expected: [1, 3, 2] },
      { input: [[3, 2, 1]], expected: [1, 2, 3] },
    ],
    hiddenTests: [
      { input: [[1, 1, 5]], expected: [1, 5, 1] },
      { input: [[1]], expected: [1] },
      { input: [[2, 3, 1]], expected: [3, 1, 2] },
      { input: [[1, 5, 8, 4, 7, 6, 5, 3, 1]], expected: [1, 5, 8, 5, 1, 3, 4, 6, 7] },
    ],
  },
  {
    id: "balloon-line-darts",
    number: 188,
    title: "Balloon Line Darts",
    difficulty: 'Medium',
    topic: "Interval",
    statement:
      "Balloons are taped along a wall, where balloon `i` covers the horizontal span `[points[i][0], points[i][1]]` (inclusive). A dart thrown at position `x` pops every balloon whose span contains `x`. Return the minimum number of darts needed to pop all balloons.",
    explanation:
      "Think about the balloon whose span ends first. Some dart must pop it, and throwing that dart exactly at this earliest right endpoint is never worse — moving the dart left can only lose balloons that start later, and it cannot be moved right without missing this balloon.\n\nSo sort balloons by right endpoint and sweep: throw a dart at the first balloon's end, then skip every balloon whose start is within that dart's position. When you meet a balloon that starts beyond the last dart, throw a new dart at its end. Count the darts. Sorting dominates, so this runs in O(n log n) time and O(1) extra space.",
    functionName: "min_dart_throws",
    functionSignature: "def min_dart_throws(points: List[List[int]]) -> int:",
    starter: STARTER_HEADER + "def min_dart_throws(points: List[List[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expected: 2 },
      { input: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: 4 },
    ],
    hiddenTests: [
      { input: [[[1, 2], [2, 3], [3, 4], [4, 5]]], expected: 2 },
      { input: [[[1, 5]]], expected: 1 },
      { input: [[[1, 10], [2, 3], [4, 5]]], expected: 2 },
      { input: [[[-5, 0], [-3, 2], [1, 4]]], expected: 2 },
    ],
  },
  {
    id: "first-and-last-hit",
    number: 189,
    title: "First and Last Hit",
    difficulty: 'Medium',
    topic: "Binary Search",
    statement:
      "Given a list of integers `nums` sorted in non-decreasing order (possibly empty) and a value `target`, return a two-element list `[first, last]` with the indices of the first and last occurrence of `target`. If the target does not appear, return `[-1, -1]`. Your solution should run in `O(log n)` time.",
    explanation:
      "A single binary search finds some occurrence, but not necessarily the boundary ones — and walking outward from it degrades to O(n) on arrays full of the target. Run two specialized binary searches instead.\n\nThe left search finds the first index whose value is at least `target` (bias the search left on equality); the right search finds the first index whose value exceeds `target`, then steps back one. If the left result is out of bounds or does not hold the target, the answer is `[-1, -1]`. These are exactly `bisect_left` and `bisect_right`. Two binary searches run in O(log n) time and O(1) space.",
    functionName: "target_span",
    functionSignature: "def target_span(nums: List[int], target: int) -> List[int]:",
    starter: STARTER_HEADER + "def target_span(nums: List[int], target: int) -> List[int]:\n    pass\n",
    examples: [
      { input: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
      { input: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
    ],
    hiddenTests: [
      { input: [[], 0], expected: [-1, -1] },
      { input: [[1], 1], expected: [0, 0] },
      { input: [[2, 2, 2, 2], 2], expected: [0, 3] },
      { input: [[1, 2, 3, 3, 3, 4], 4], expected: [5, 5] },
    ],
  },
  {
    id: "spread-the-antennas",
    number: 190,
    title: "Spread the Antennas",
    difficulty: 'Medium',
    topic: "Binary Search",
    statement:
      "You have `k` antennas to install along a street, and `positions` lists the distinct integer coordinates of the mounting points available (with `2 <= k <= len(positions)`). To minimize interference, you want the smallest distance between any two installed antennas to be as large as possible. Return that largest possible minimum distance.",
    explanation:
      "Flip the question into a yes/no check: for a candidate gap `d`, can you place `k` antennas so every pair is at least `d` apart? With sorted positions, a greedy answers this — install at the first point, then walk right installing at the next point at least `d` away, and count installs. The greedy is optimal because taking the earliest legal point never hurts later choices.\n\nThe check is monotone: if gap `d` is achievable, every smaller gap is too. So binary search `d` between 1 and the full span of positions, keeping the largest `d` whose check passes. With n points, each check is O(n) and the search is O(log range), giving O(n log n + n log range) time and O(1) extra space after sorting.",
    functionName: "max_min_antenna_gap",
    functionSignature: "def max_min_antenna_gap(positions: List[int], k: int) -> int:",
    starter: STARTER_HEADER + "def max_min_antenna_gap(positions: List[int], k: int) -> int:\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 4, 7], 3], expected: 3 },
      { input: [[5, 4, 3, 2, 1, 1000000000], 2], expected: 999999999 },
    ],
    hiddenTests: [
      { input: [[1, 2, 7, 11], 3], expected: 4 },
      { input: [[0, 100], 2], expected: 100 },
      { input: [[1, 2, 3], 3], expected: 1 },
      { input: [[10, 1, 2, 7, 5], 3], expected: 4 },
    ],
  },
  {
    id: "fair-chunk-split",
    number: 191,
    title: "Fair Chunk Split",
    difficulty: 'Hard',
    topic: "Binary Search",
    statement:
      "You must split the list `nums` of positive integers into exactly `k` non-empty contiguous chunks (`1 <= k <= len(nums)`), keeping the original order. The cost of a split is the largest chunk sum it produces. Return the minimum possible cost.",
    explanation:
      "Searching over actual splits explodes combinatorially, but checking a budget is easy: given a cap `m`, greedily pack elements left to right into the current chunk, starting a new chunk whenever adding the next element would exceed `m`. The greedy uses the fewest chunks possible for that cap, so the cap is feasible exactly when the chunk count comes out at most `k`.\n\nFeasibility is monotone in `m` — a bigger budget never needs more chunks — so binary search the answer between `max(nums)` (every element must fit somewhere) and `sum(nums)` (one chunk). Take the smallest feasible cap. With each check costing O(n), this runs in O(n log(sum)) time and O(1) space.",
    functionName: "min_largest_chunk",
    functionSignature: "def min_largest_chunk(nums: List[int], k: int) -> int:",
    starter: STARTER_HEADER + "def min_largest_chunk(nums: List[int], k: int) -> int:\n    pass\n",
    examples: [
      { input: [[7, 2, 5, 10, 8], 2], expected: 18 },
      { input: [[1, 2, 3, 4, 5], 2], expected: 9 },
    ],
    hiddenTests: [
      { input: [[1, 4, 4], 3], expected: 4 },
      { input: [[10], 1], expected: 10 },
      { input: [[1, 2, 3, 4, 5], 5], expected: 5 },
      { input: [[2, 3, 1, 2, 4, 3], 3], expected: 6 },
    ],
  },
  {
    id: "longest-balanced-run",
    number: 192,
    title: "Longest Balanced Run",
    difficulty: 'Hard',
    topic: "Stack",
    statement:
      "Given a string `s` containing only the characters `'('` and `')'`, return the length of the longest contiguous substring that is a well-formed sequence of parentheses (every opener closed, in valid order). Return `0` if no such substring exists.",
    explanation:
      "Validity checks usually push openers and pop on closers, but here you need lengths, so push indices instead. Keep a sentinel index at the bottom of the stack marking the position just before the current candidate run.\n\nOn `'('`, push the index. On `')'`, pop; if the stack becomes empty this closer is unmatched, so push its index as the new sentinel. Otherwise the substring from just after the new stack top through the current index is balanced — measure `i - stack[-1]` and keep the maximum. Start the stack with -1 so runs touching the string start measure correctly. Each index is pushed and popped once: O(n) time and O(n) space.",
    functionName: "longest_balanced_run",
    functionSignature: "def longest_balanced_run(s: str) -> int:",
    starter: STARTER_HEADER + "def longest_balanced_run(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["(()"], expected: 2 },
      { input: [")()())"], expected: 4 },
    ],
    hiddenTests: [
      { input: [""], expected: 0 },
      { input: ["()(())"], expected: 6 },
      { input: ["()(()"], expected: 2 },
      { input: ["((()))()"], expected: 8 },
    ],
  },
  {
    id: "pop-order-payoff",
    number: 193,
    title: "Pop Order Payoff",
    difficulty: 'Hard',
    topic: "Dynamic Programming",
    statement:
      "A row of balloons is labeled with the numbers in `nums`. When you pop balloon `i` you earn `left * nums[i] * right` coins, where `left` and `right` are the values on the nearest unpopped balloons on each side (treat a missing neighbor as `1`). You must pop every balloon, choosing the order. Return the maximum total coins you can earn.",
    explanation:
      "Thinking about which balloon to pop first is a dead end, because popping changes everyone's neighbors. Think about which balloon in a range is popped last: its neighbors at that moment are exactly the fixed boundaries of the range, untouched by anything inside.\n\nPad the array with virtual 1s on both ends and define `dp[l][r]` as the best score for popping everything strictly between indices `l` and `r`. Choosing `i` as the final pop in that window earns `vals[l] * vals[i] * vals[r]` plus the best scores of the two independent sub-windows `(l, i)` and `(i, r)`. Fill windows in increasing length; the answer is `dp[0][n-1]` over the padded array. This runs in O(n^3) time and O(n^2) space.",
    functionName: "max_pop_coins",
    functionSignature: "def max_pop_coins(nums: List[int]) -> int:",
    starter: STARTER_HEADER + "def max_pop_coins(nums: List[int]) -> int:\n    pass\n",
    examples: [
      { input: [[3, 1, 5, 8]], expected: 167 },
      { input: [[1, 5]], expected: 10 },
    ],
    hiddenTests: [
      { input: [[7]], expected: 7 },
      { input: [[1, 2, 3]], expected: 12 },
      { input: [[5, 10]], expected: 60 },
      { input: [[2, 4, 8]], expected: 88 },
    ],
  },
  {
    id: "smaller-numbers-behind",
    number: 194,
    title: "Smaller Numbers Behind",
    difficulty: 'Hard',
    topic: "Sorting",
    statement:
      "For each element of the integer list `nums`, count how many elements to its right are strictly smaller than it. Return the counts as a list aligned with the input — the last element's count is always `0`. Aim for better than quadratic time.",
    explanation:
      "The brute force compares every pair. To beat it, process the array from right to left while maintaining a structure that can answer 'how many values seen so far are smaller than x?' in logarithmic time.\n\nA Fenwick (binary indexed) tree over the ranks of the values does the job: compress the values to ranks 1..m, then for each element (right to left) query the prefix count of ranks strictly below it, record that, and add its own rank to the tree. Reverse the recorded answers at the end. A merge-sort that counts inversions per element works equally well. This runs in O(n log n) time and O(n) space.",
    functionName: "smaller_counts_behind",
    functionSignature: "def smaller_counts_behind(nums: List[int]) -> List[int]:",
    starter: STARTER_HEADER + "def smaller_counts_behind(nums: List[int]) -> List[int]:\n    pass\n",
    examples: [
      { input: [[5, 2, 6, 1]], expected: [2, 1, 1, 0] },
      { input: [[-1, -1]], expected: [0, 0] },
    ],
    hiddenTests: [
      { input: [[1]], expected: [0] },
      { input: [[1, 2, 3]], expected: [0, 0, 0] },
      { input: [[3, 2, 1]], expected: [2, 1, 0] },
      { input: [[2, 0, 1]], expected: [2, 0, 0] },
    ],
  },
  {
    id: "sliding-median-trail",
    number: 195,
    title: "Sliding Median Trail",
    difficulty: 'Hard',
    topic: "Heap",
    statement:
      "Given an integer list `nums` and a window size `k` (with `1 <= k <= len(nums)`), slide a window of size `k` across the list one step at a time and record the median of each window. For even `k` the median is the average of the two middle values. Return the medians in order, as floats.",
    explanation:
      "For each of the `n - k + 1` windows you need the middle of the sorted window. The production-grade approach keeps two heaps — a max-heap of the lower half and a min-heap of the upper half — rebalancing on every slide and lazily discarding elements that have left the window; the median is then read off the heap tops.\n\nA simpler route that still passes here is maintaining a sorted window: binary-insert the incoming element and binary-remove the outgoing one (`bisect.insort` and a `bisect_left` deletion), then index the middle. Remember the even-`k` averaging, and emit floats consistently. The sorted-list version runs in O(n * k) time worst case (O(n log k) comparisons but O(k) shifts) with O(k) space; the two-heap version achieves O(n log n).",
    functionName: "sliding_medians",
    functionSignature: "def sliding_medians(nums: List[int], k: int) -> List[float]:",
    starter: STARTER_HEADER + "def sliding_medians(nums: List[int], k: int) -> List[float]:\n    pass\n",
    examples: [
      { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [1.0, -1.0, -1.0, 3.0, 5.0, 6.0] },
      { input: [[1, 2, 3, 4], 2], expected: [1.5, 2.5, 3.5] },
    ],
    hiddenTests: [
      { input: [[1], 1], expected: [1.0] },
      { input: [[2, 2, 2, 2], 2], expected: [2.0, 2.0, 2.0] },
      { input: [[1, 4, 2, 3], 4], expected: [2.5] },
      { input: [[5, 2, 2, 7, 3, 7, 9, 0, 2, 3], 3], expected: [2.0, 2.0, 3.0, 7.0, 7.0, 7.0, 2.0, 2.0] },
    ],
  },
  {
    id: "river-stone-hops",
    number: 196,
    title: "River Stone Hops",
    difficulty: 'Hard',
    topic: "Dynamic Programming",
    statement:
      "A frog wants to cross a river by hopping across stones at the strictly increasing positions given in `stones`, where the first stone is always at position `0`. The frog starts on the first stone, and its first hop must be exactly `1` unit. After a hop of `j` units, the next hop must be `j - 1`, `j`, or `j + 1` units, always forward, and the frog must land exactly on a stone. Return `True` if the frog can reach the last stone.",
    explanation:
      "The frog's future depends on two things only: which stone it stands on and the size of the hop that got it there. That pair is the state, and there are at most O(n^2) distinct states since each hop size at a stone is bounded by the number of prior hops.\n\nSearch the state graph with memoized DFS (or BFS over states). From state `(position, j)`, try hop sizes `j - 1`, `j`, `j + 1` (skipping non-positive ones), and follow each that lands in the set of stone positions. Memoize failures so each state is explored once. Handle the openers directly: a single stone is trivially reached, and if the second stone is not at position 1 the first mandatory hop already fails. This runs in O(n^2) time and O(n^2) space.",
    functionName: "can_cross_river",
    functionSignature: "def can_cross_river(stones: List[int]) -> bool:",
    starter: STARTER_HEADER + "def can_cross_river(stones: List[int]) -> bool:\n    pass\n",
    examples: [
      { input: [[0, 1, 3, 5, 6, 8, 12, 17]], expected: true },
      { input: [[0, 1, 2, 3, 4, 8, 9, 11]], expected: false },
    ],
    hiddenTests: [
      { input: [[0, 1]], expected: true },
      { input: [[0, 2]], expected: false },
      { input: [[0, 1, 2, 4, 7, 11]], expected: true },
      { input: [[0, 1, 2, 3, 5, 9]], expected: false },
    ],
  },
  {
    id: "largest-solid-block",
    number: 197,
    title: "Largest Solid Block",
    difficulty: 'Hard',
    topic: "Matrix",
    statement:
      "Given a matrix `grid` containing only `0`s and `1`s, find the axis-aligned rectangle made up entirely of `1`s with the largest area. Return that area, or `0` if the grid contains no `1`s.",
    explanation:
      "Slice the matrix row by row and reuse the histogram trick: for each row, compute `heights[j]`, the number of consecutive `1`s ending at this row in column `j` (reset to 0 on a `0`). Any all-ones rectangle whose bottom edge lies on this row is exactly a rectangle under this histogram.\n\nSo the problem reduces to running 'largest rectangle in a histogram' once per row. Solve each histogram with a monotonic stack of (start index, height): when a shorter bar arrives, pop taller bars, scoring `height * width` for each, and let the new bar inherit the earliest popped start. Appending a sentinel 0 flushes the stack. Take the best over all rows. This runs in O(rows * cols) time and O(cols) space.",
    functionName: "largest_solid_block",
    functionSignature: "def largest_solid_block(grid: List[List[int]]) -> int:",
    starter: STARTER_HEADER + "def largest_solid_block(grid: List[List[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[1, 0, 1, 0, 0], [1, 0, 1, 1, 1], [1, 1, 1, 1, 1], [1, 0, 0, 1, 0]]], expected: 6 },
      { input: [[[0]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: 1 },
      { input: [[[1, 1], [1, 1]]], expected: 4 },
      { input: [[[0, 1], [1, 0]]], expected: 1 },
      { input: [[[1, 1, 0], [1, 1, 1], [0, 1, 1]]], expected: 4 },
    ],
  },
  {
    id: "cheapest-crew",
    number: 198,
    title: "Cheapest Crew",
    difficulty: 'Hard',
    topic: "Greedy",
    statement:
      "You are hiring exactly `k` of `n` workers. Worker `i` has skill `quality[i]` and demands at least `wage[i]` in total pay. Within the hired crew, pay must be proportional to quality (if one worker has double the quality, they earn double), and every worker must receive at least their demanded wage. Return the minimum total payroll as a float.",
    explanation:
      "Proportional pay means the whole crew shares one pay rate per unit of quality, and to satisfy everyone that rate must be at least each member's ratio `wage[i] / quality[i]`. So the crew's rate is its maximum ratio, and the payroll is `rate * (sum of crew qualities)`.\n\nSort workers by ratio and consider each as the rate-setter: every other crew member must come from the workers with smaller or equal ratio, and among those you want the `k - 1` smallest qualities. Sweep the sorted list while maintaining a max-heap of the qualities taken and their running sum, evicting the largest quality when the heap exceeds `k`; whenever the heap holds exactly `k`, candidate cost is `ratio * quality_sum`. Take the minimum. This runs in O(n log n) time and O(n) space.",
    functionName: "min_crew_payroll",
    functionSignature: "def min_crew_payroll(quality: List[int], wage: List[int], k: int) -> float:",
    starter: STARTER_HEADER + "def min_crew_payroll(quality: List[int], wage: List[int], k: int) -> float:\n    pass\n",
    examples: [
      { input: [[10, 20, 5], [70, 50, 30], 2], expected: 105.0 },
      { input: [[3, 1, 10, 10, 1], [4, 8, 2, 2, 7], 3], expected: 30.66666667 },
    ],
    hiddenTests: [
      { input: [[5, 10], [10, 10], 1], expected: 10.0 },
      { input: [[1, 2, 3], [5, 6, 7], 2], expected: 15.0 },
      { input: [[4, 2], [8, 2], 2], expected: 12.0 },
      { input: [[10], [100], 1], expected: 100.0 },
    ],
  },
  {
    id: "mutual-downtime",
    number: 199,
    title: "Mutual Downtime",
    difficulty: 'Hard',
    topic: "Interval",
    statement:
      "Each member of a team has a busy calendar: `schedules[i]` is a list of intervals `[start, end]`, sorted and non-overlapping, during which member `i` is unavailable. Return every bounded interval of positive length during which all members are free, as a list of `[start, end]` pairs in increasing order. Ignore the unbounded free time before the first event and after the last.",
    explanation:
      "Common free time is just the complement of anyone-is-busy time. So forget who owns which interval: pour every busy interval from every member into one list and sort it by start.\n\nSweep the sorted intervals while tracking the furthest busy end seen so far. When the next interval starts strictly after that furthest end, the span between them is a gap where nobody is busy — record it. Either way, extend the furthest end with the current interval. The recorded gaps are automatically sorted, positive-length, and bounded on both sides. Sorting dominates: O(m log m) time and O(m) space, where m is the total number of intervals.",
    functionName: "mutual_downtime",
    functionSignature: "def mutual_downtime(schedules: List[List[List[int]]]) -> List[List[int]]:",
    starter: STARTER_HEADER + "def mutual_downtime(schedules: List[List[List[int]]]) -> List[List[int]]:\n    pass\n",
    examples: [
      { input: [[[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]], expected: [[3, 4]] },
      { input: [[[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]], expected: [[5, 6], [7, 9]] },
    ],
    hiddenTests: [
      { input: [[[[1, 2]], [[3, 4]]]], expected: [[2, 3]] },
      { input: [[[[1, 10]]]], expected: [] },
      { input: [[[[1, 2], [4, 5]], [[1, 5]]]], expected: [] },
      { input: [[[[0, 1]], [[2, 3]], [[4, 5]]]], expected: [[1, 2], [3, 4]] },
    ],
  },
  {
    id: "bracketed-arithmetic",
    number: 200,
    title: "Bracketed Arithmetic",
    difficulty: 'Hard',
    topic: "Stack",
    statement:
      "Evaluate the arithmetic expression in the string `s` and return its integer value. The expression contains non-negative integers, `'+'`, `'-'`, parentheses, and spaces; a `'-'` may also appear as a unary minus at the start of the expression or immediately after `'('`, as in `\"-(2+3)\"`. Do not use any built-in expression evaluator.",
    explanation:
      "Without parentheses this is a single pass: keep a running result, a pending sign, and the number being read digit by digit; each operator flushes `sign * number` into the result and records the new sign. The unary minus needs no special case — flushing a zero-length number contributes nothing, then the minus sets the sign.\n\nParentheses introduce nesting, which a stack unwinds. On `'('`, push the running result and pending sign, then start fresh for the inside. On `')'`, flush the current number, then pop `(prev_result, prev_sign)` and combine: `result = prev_result + prev_sign * inner_result`. Flush once more after the loop for the trailing number. Each character is processed once: O(n) time and O(n) space for the stack.",
    functionName: "eval_bracketed",
    functionSignature: "def eval_bracketed(s: str) -> int:",
    starter: STARTER_HEADER + "def eval_bracketed(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["1 + 1"], expected: 2 },
      { input: ["(1+(4+5+2)-3)+(6+8)"], expected: 23 },
    ],
    hiddenTests: [
      { input: [" 2-1 + 2 "], expected: 3 },
      { input: ["-(2+3)"], expected: -5 },
      { input: ["1-(-2)"], expected: 3 },
      { input: ["2-(5-6)"], expected: 3 },
    ],
  },
  {
    id: 'rotate-left-in-place',
    number: 201,
    title: "Rotate Array Left In Place",
    difficulty: 'Medium',
    topic: "Array",
    statement:
      "Given a list of integers `nums` and a non-negative integer `k`, rotate the list to the **left** by `k` positions, so that each element moves `k` slots toward the front and elements that fall off the front wrap around to the back.\n\nModify the list in place and return it. Note `k` may be larger than the length of the list, and the list may be empty.\n\nExample: rotating `[1,2,3,4,5]` left by `2` gives `[3,4,5,1,2]`.",
    explanation:
      "Rotating left by `k` is the same as rotating left by `k % n` (rotating by a full length changes nothing). Handle the empty list up front to avoid dividing by zero.\n\nThe classic in-place trick is three reversals: reverse the first `k` elements, reverse the rest, then reverse the whole list. This lands every element in its rotated position using O(1) extra space and O(n) time.",
    functionName: 'rotate_left',
    functionSignature: "def rotate_left(nums: list[int], k: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def rotate_left(nums: list[int], k: int) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,2,3,4,5,6,7],3], expected: [4,5,6,7,1,2,3] },
      { input: [[1,2,3],1], expected: [2,3,1] },
      { input: [[1,2],3], expected: [2,1] },
    ],
    hiddenTests: [
      { input: [[1,2,3,4,5],0], expected: [1,2,3,4,5] },
      { input: [[],4], expected: [] },
      { input: [[9],100], expected: [9] },
    ],
  },
  {
    id: 'sort-three-way-flag',
    number: 202,
    title: "Three-Color Flag Sort",
    difficulty: 'Medium',
    topic: "Array",
    statement:
      "You're given a list `nums` containing only the integers `0`, `1`, and `2`. Sort the list in place in a single pass so that all `0`s come first, then all `1`s, then all `2`s, and return it.\n\nDo not simply count and rewrite — use a partitioning approach (the Dutch national flag technique) that swaps elements as it scans.",
    explanation:
      "Maintain three pointers: `low` (boundary of the 0s region), `mid` (the current element), and `high` (boundary of the 2s region). Scan with `mid` while `mid <= high`.\n\nIf `nums[mid]` is 0, swap it into the low region and advance both `low` and `mid`. If it's 1, it's already in the middle band, so just advance `mid`. If it's 2, swap it toward the high region and shrink `high` — but do NOT advance `mid`, because the swapped-in value still needs inspecting.\n\nOne pass, O(1) extra space.",
    functionName: 'sort_three_way',
    functionSignature: "def sort_three_way(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def sort_three_way(nums: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[2,0,2,1,1,0]], expected: [0,0,1,1,2,2] },
      { input: [[2,0,1]], expected: [0,1,2] },
      { input: [[0]], expected: [0] },
    ],
    hiddenTests: [
      { input: [[2,2,2,0,0,1]], expected: [0,0,1,2,2,2] },
      { input: [[1,1,1]], expected: [1,1,1] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: 'running-product-except-self',
    number: 203,
    title: "Running Product Except Self",
    difficulty: 'Medium',
    topic: "Array",
    statement:
      "Given a list of integers `nums`, return a new list `out` where `out[i]` equals the product of every element of `nums` **except** `nums[i]`.\n\nYou must solve it **without using the division operator**, and it should run in O(n) time. The input can contain zeros and negative numbers.\n\nExample: for `[1,2,3,4]` the answer is `[24,12,8,6]`.",
    explanation:
      "Division would break on zeros, so build the answer from prefix and suffix products instead.\n\nFirst pass, left to right: set `out[i]` to the product of all elements strictly before `i` (a running prefix product, starting at 1). Second pass, right to left: multiply `out[i]` by a running suffix product of all elements strictly after `i`.\n\nAfter both passes `out[i]` holds prefix × suffix = product of everything except index `i`. O(n) time, O(1) extra space beyond the output.",
    functionName: 'running_product_except_self',
    functionSignature: "def running_product_except_self(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def running_product_except_self(nums: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,2,3,4]], expected: [24,12,8,6] },
      { input: [[-1,1,0,-3,3]], expected: [0,0,9,0,0] },
      { input: [[2,3]], expected: [3,2] },
    ],
    hiddenTests: [
      { input: [[5,0,0]], expected: [0,0,0] },
      { input: [[1,1,1,1]], expected: [1,1,1,1] },
    ],
  },
  {
    id: 'equilibrium-indices',
    number: 204,
    title: "Equilibrium Indices",
    difficulty: 'Easy',
    topic: "Array",
    statement:
      "An index `i` of a list `nums` is an **equilibrium index** if the sum of all elements strictly to the left of `i` equals the sum of all elements strictly to the right of `i`. (For the first index the left sum is 0; for the last index the right sum is 0.)\n\nReturn a list of all equilibrium indices, in increasing order. If there are none, return an empty list.",
    explanation:
      "The brute-force approach recomputes left and right sums for each index — O(n²). Instead, use a prefix-sum sweep.\n\nCompute the total sum first. Then walk left to right keeping a running `left` sum of everything before the current index. At index `i` with value `v`, the right sum is `total - left - v`. Whenever `left == total - left - v`, record `i`. Then add `v` to `left` and continue.\n\nSingle pass after the total, O(n) time and O(1) extra space (besides the answer).",
    functionName: 'equilibrium_indices',
    functionSignature: "def equilibrium_indices(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def equilibrium_indices(nums: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,7,3,6,5,6]], expected: [3] },
      { input: [[1,2,3]], expected: [] },
      { input: [[2,1,-1]], expected: [0] },
    ],
    hiddenTests: [
      { input: [[0,0,0]], expected: [0,1,2] },
      { input: [[-1,-1,-1,0,1,1]], expected: [0] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: 'min-swaps-group-ones',
    number: 205,
    title: "Minimum Swaps to Group Ones",
    difficulty: 'Hard',
    topic: "Array",
    statement:
      "You're given a **circular** binary list `nums` (its last element is considered adjacent to its first). In one move you may swap the values at any two positions. Return the minimum number of swaps needed to bring all the `1`s together into one contiguous block (contiguity is allowed to wrap around the ends).\n\nIf there are no `1`s, or every element is a `1`, the answer is `0`.",
    explanation:
      "Let `t` be the total number of `1`s. In the final arrangement they occupy some window of length `t`. The number of swaps to fill a chosen window with all ones equals the number of `0`s currently inside that window (each such zero must be swapped out for a one from outside).\n\nSo the task reduces to: over all length-`t` windows, find the one containing the fewest zeros. Because the array is circular, conceptually double it (or use modular indexing) and slide a window of size `t`, maintaining the zero count incrementally. The minimum zero count over all windows is the answer.\n\nHandle the trivial cases (`t == 0` or `t == n`) by returning 0. O(n) time.",
    functionName: 'min_swaps_group_ones',
    functionSignature: "def min_swaps_group_ones(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def min_swaps_group_ones(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[1,0,1,0,1]], expected: 1 },
      { input: [[0,0,0,1,0]], expected: 0 },
      { input: [[1,1,0,0,1]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[0,1,1,1,0,0,1,1,0]], expected: 2 },
      { input: [[1,1,1]], expected: 0 },
      { input: [[0,0,0]], expected: 0 },
      { input: [[1,0,0,1,0,1,0,1]], expected: 1 },
    ],
  },
  {
    id: 'circular-maximum-subarray',
    number: 206,
    title: "Circular Maximum Subarray",
    difficulty: 'Medium',
    topic: "Array",
    statement:
      "Given an integer array `nums` arranged in a **circle** (so the element after the last one wraps around to the first), find the maximum possible sum of a non-empty subarray.\n\nA circular subarray may either be a normal contiguous run, or it may wrap around the end and continue from the front — but it can use each element **at most once** (so its length is at most `len(nums)`). Return that maximum sum.",
    explanation:
      "There are two cases. The best subarray is either fully inside the array (standard Kadane's maximum), or it wraps around the ends.\n\nA wrapping subarray is everything **except** some middle contiguous block. To maximize what's kept, minimize what's removed: that middle block is the **minimum** subarray. So the wrapping candidate is `total_sum − minimum_subarray_sum`.\n\nRun Kadane's forwards to get both the max and min subarray sums in one pass. The answer is `max(best_max, total − best_min)`. Edge case: if every number is negative, `total − best_min` would be 0 (an empty selection), which isn't allowed — in that case just return `best_max`.",
    functionName: 'max_circular_subarray',
    functionSignature: "def max_circular_subarray(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def max_circular_subarray(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[1,-2,3,-2]], expected: 3 },
      { input: [[5,-3,5]], expected: 10 },
      { input: [[-3,-2,-3]], expected: -2 },
    ],
    hiddenTests: [
      { input: [[3,-1,2,-1]], expected: 4 },
      { input: [[3,-2,2,-3]], expected: 3 },
      { input: [[-2,4,-5,4,-5,9,4]], expected: 15 },
      { input: [[8,-1,3,4]], expected: 15 },
    ],
  },
  {
    id: 'majority-over-third',
    number: 207,
    title: "Majority Over a Third",
    difficulty: 'Medium',
    topic: "Array",
    statement:
      "Given an integer array `nums`, return every element that appears **more than** `len(nums) // 3` times (strictly more, using integer floor division for the threshold).\n\nThere can be at most two such elements. Return them in a list sorted in **ascending order** (return an empty list if there are none).",
    explanation:
      "A value can exceed the `n//3` threshold only if it's one of at most two 'dominant' candidates — you can't have three distinct elements each appearing more than a third of the time.\n\nUse a two-slot Boyer-Moore voting pass. Track two candidates with two counters. For each number: if it matches a candidate, bump that counter; else if a counter is 0, adopt the number as that candidate; otherwise decrement both counters.\n\nThe survivors are only *potential* answers, so do a second pass to count their real frequencies and keep those strictly above `n//3`. Finally sort the result. O(n) time, O(1) extra space.",
    functionName: 'majority_over_third',
    functionSignature: "def majority_over_third(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def majority_over_third(nums: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[3,2,3]], expected: [3] },
      { input: [[1,1,1,3,3,2,2,2]], expected: [1,2] },
      { input: [[1]], expected: [1] },
    ],
    hiddenTests: [
      { input: [[1,2]], expected: [1,2] },
      { input: [[5,5,5,5]], expected: [5] },
      { input: [[1,2,3,4,5,6]], expected: [] },
    ],
  },
  {
    id: 'count-subarrays-with-sum',
    number: 208,
    title: "Count Subarrays With Sum",
    difficulty: 'Easy',
    topic: "Array",
    statement:
      "Given an integer array `nums` and an integer `target`, return the **number** of non-empty contiguous subarrays whose elements sum exactly to `target`.\n\nThe array may contain negative numbers and zeros, so different subarrays can have the same sum.",
    explanation:
      "A subarray sum equals `prefix[j] − prefix[i]`. If the running prefix sum up to the current index is `s`, then a subarray ending here sums to `target` exactly when some earlier prefix equalled `s − target`.\n\nSweep left to right keeping a running total `s`. Maintain a dictionary counting how many times each prefix sum has occurred (seed it with `{0: 1}` so subarrays starting at index 0 are counted). At each step add `count[s − target]` to the answer, then record the current prefix `s`.\n\nOne pass, O(n) time and O(n) space. Handles negatives and zeros naturally.",
    functionName: 'count_subarrays_with_sum',
    functionSignature: "def count_subarrays_with_sum(nums: list[int], target: int) -> int:",
    starter:
      STARTER_HEADER + "def count_subarrays_with_sum(nums: list[int], target: int) -> int:\n    pass\n",
    examples: [
      { input: [[1,1,1],2], expected: 2 },
      { input: [[1,2,3],3], expected: 2 },
      { input: [[1,-1,0],0], expected: 3 },
    ],
    hiddenTests: [
      { input: [[3,4,7,2,-3,1,4,2],7], expected: 4 },
      { input: [[0,0,0],0], expected: 6 },
      { input: [[1,2,3],7], expected: 0 },
    ],
  },
  {
    id: 'merge-sorted-arrays',
    number: 209,
    title: "Merge Two Sorted Arrays",
    difficulty: 'Easy',
    topic: "Array",
    statement:
      "Given two lists `a` and `b`, each already sorted in **non-decreasing** order, merge them into a single list sorted in non-decreasing order and return it.\n\nEither list may be empty. Duplicate values across the two lists are kept (the result contains every element from both).",
    explanation:
      "This is the merge step of merge sort. Walk two pointers `i` and `j` across `a` and `b`. Repeatedly compare `a[i]` and `b[j]`, append the smaller (append from `a` on ties to keep it simple), and advance that pointer.\n\nWhen one list is exhausted, append whatever remains in the other list — it's already sorted, so no more comparisons are needed.\n\nO(len(a) + len(b)) time, single linear pass, no sorting call required.",
    functionName: 'merge_sorted_arrays',
    functionSignature: "def merge_sorted_arrays(a: list[int], b: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def merge_sorted_arrays(a: list[int], b: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,3,5],[2,4,6]], expected: [1,2,3,4,5,6] },
      { input: [[],[1,2,3]], expected: [1,2,3] },
      { input: [[1,2,3],[]], expected: [1,2,3] },
    ],
    hiddenTests: [
      { input: [[1,1,2],[1,3]], expected: [1,1,1,2,3] },
      { input: [[-5,0,7],[-3,-1,10]], expected: [-5,-3,-1,0,7,10] },
    ],
  },
  {
    id: 'palindrome-permutation',
    number: 210,
    title: "Palindrome Rearrangement Check",
    difficulty: 'Easy',
    topic: "String",
    statement:
      "You're given a string `s` made of lowercase letters. Determine whether its characters can be rearranged to form a palindrome. Return `True` if some rearrangement reads the same forwards and backwards, otherwise `False`.\n\nThe empty string counts as a palindrome.",
    explanation:
      "A string can be permuted into a palindrome only if at most one distinct character appears an odd number of times — that lone character (if any) sits in the middle, and everything else pairs up around it.\n\nCount how often each character occurs, then count how many characters have an odd frequency. If that odd count is 0 or 1, a palindrome arrangement exists.\n\nO(n) time, O(1) extra space (only 26 letters).",
    functionName: 'can_form_palindrome',
    functionSignature: "def can_form_palindrome(s: str) -> bool:",
    starter:
      STARTER_HEADER + "def can_form_palindrome(s: str) -> bool:\n    pass\n",
    examples: [
      { input: ["aabb"], expected: true },
      { input: ["abc"], expected: false },
      { input: ["racecar"], expected: true },
    ],
    hiddenTests: [
      { input: [""], expected: true },
      { input: ["aab"], expected: true },
      { input: ["aaabbbb"], expected: true },
      { input: ["aaabbbbc"], expected: false },
    ],
  },
  {
    id: 'run-length-compress',
    number: 211,
    title: "Run-Length Compression",
    difficulty: 'Medium',
    topic: "String",
    statement:
      "Compress a string `s` using run-length encoding: replace each maximal run of a repeated character with that character followed by the run's length. For example the run `\"aaa\"` becomes `\"a3\"`.\n\nReturn the compressed string ONLY if it is strictly shorter than the original; otherwise return the original string unchanged. For the empty string, return the empty string.",
    explanation:
      "Walk through the string tracking the current character and how many times it has repeated consecutively. When the character changes, append `char + str(count)` to your output and reset the counter.\n\nAfter building the encoded form, compare its length to the original: return the encoded version only when it is strictly shorter, otherwise keep the original (encoding rarely helps for strings with few repeats).\n\nO(n) time, O(n) space.",
    functionName: 'compress_string',
    functionSignature: "def compress_string(s: str) -> str:",
    starter:
      STARTER_HEADER + "def compress_string(s: str) -> str:\n    pass\n",
    examples: [
      { input: ["aaabbccc"], expected: "a3b2c3" },
      { input: ["abcdef"], expected: "abcdef" },
      { input: ["wwwwwwwwww"], expected: "w10" },
    ],
    hiddenTests: [
      { input: ["aabbccdd"], expected: "aabbccdd" },
      { input: [""], expected: "" },
      { input: ["aaabaaa"], expected: "a3b1a3" },
    ],
  },
  {
    id: 'anagram-group-count',
    number: 212,
    title: "Count Anagram Groups",
    difficulty: 'Medium',
    topic: "String",
    statement:
      "You're given a list of lowercase words `words`. Two words belong to the same group if one is an anagram of the other (same letters, same counts, any order).\n\nReturn the number of distinct anagram groups. An empty list has `0` groups.",
    explanation:
      "Two words are anagrams exactly when their letters, sorted, produce the same string. So the sorted form of a word is a canonical signature shared by every word in its group.\n\nBuild a set of these signatures by inserting `''.join(sorted(word))` for each word. The size of the set is the number of distinct groups.\n\nO(n·k log k) time for n words of length up to k.",
    functionName: 'anagram_group_count',
    functionSignature: "def anagram_group_count(words: list[str]) -> int:",
    starter:
      STARTER_HEADER + "def anagram_group_count(words: list[str]) -> int:\n    pass\n",
    examples: [
      { input: [["eat","tea","tan","ate","nat","bat"]], expected: 3 },
      { input: [["abc","bca","cab"]], expected: 1 },
      { input: [["listen","silent","enlist","google"]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [["a","b","c"]], expected: 3 },
    ],
  },
  {
    id: 'decode-repeat-string',
    number: 213,
    title: "Decode Nested Repeats",
    difficulty: 'Medium',
    topic: "String",
    statement:
      "A string `s` is encoded with the rule `k[encoded]`, meaning the substring `encoded` is repeated exactly `k` times. Encodings may be nested, e.g. `3[a2[c]]`. The multiplier `k` is a positive integer and may have multiple digits. Plain letters can appear outside brackets.\n\nReturn the fully decoded string. You may assume the input is always well-formed (brackets balanced, every `[` preceded by a number).",
    explanation:
      "Use a stack to handle nesting. Scan left to right while building the current segment `cur` and current number `num`.\n\n- On a digit, extend `num` (multiply by 10 and add).\n- On `[`, push the pair `(cur, num)` and reset both.\n- On `]`, pop `(prev, k)` and set `cur = prev + cur * k`.\n- On a letter, append it to `cur`.\n\nWhen the scan ends, `cur` holds the decoded string. O(output length) time.",
    functionName: 'decode_message',
    functionSignature: "def decode_message(s: str) -> str:",
    starter:
      STARTER_HEADER + "def decode_message(s: str) -> str:\n    pass\n",
    examples: [
      { input: ["3[a]2[bc]"], expected: "aaabcbc" },
      { input: ["3[a2[c]]"], expected: "accaccacc" },
      { input: ["2[abc]3[cd]ef"], expected: "abcabccdcdcdef" },
    ],
    hiddenTests: [
      { input: ["abc"], expected: "abc" },
      { input: ["10[a]"], expected: "aaaaaaaaaa" },
    ],
  },
  {
    id: 'longest-palindromic-prefix',
    number: 214,
    title: "Longest Palindromic Prefix Length",
    difficulty: 'Hard',
    topic: "String",
    statement:
      "Given a string `s` of lowercase letters, return the length of the longest prefix of `s` that is itself a palindrome.\n\nA prefix is any leading portion of the string (from the first character). The empty string has answer `0`. A single character is always a palindrome of length 1.",
    explanation:
      "You want the largest `i` such that `s[:i]` reads the same forwards and backwards.\n\nA direct approach checks prefixes from longest to shortest and returns the first palindrome found. For an optimal solution, build the string `s + '#' + reverse(s)` and compute its KMP failure function; the final value equals the longest prefix of `s` that is also a suffix of `reverse(s)` — i.e. the longest palindromic prefix — giving O(n) time.",
    functionName: 'longest_palindrome_prefix',
    functionSignature: "def longest_palindrome_prefix(s: str) -> int:",
    starter:
      STARTER_HEADER + "def longest_palindrome_prefix(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["aacecaaa"], expected: 7 },
      { input: ["abcd"], expected: 1 },
      { input: ["racecarxyz"], expected: 7 },
    ],
    hiddenTests: [
      { input: ["aaaa"], expected: 4 },
      { input: [""], expected: 0 },
      { input: ["ba"], expected: 1 },
    ],
  },
  {
    id: 'run-length-encode',
    number: 215,
    title: "Run-Length Encode a String",
    difficulty: 'Easy',
    topic: "String",
    statement:
      "Compress a string using run-length encoding. Scan the string left to right and replace each *maximal run* of the same character with that character immediately followed by the run's length written in decimal.\n\nFor example, `\"aaabbc\"` becomes `\"a3b2c1\"` — three `a`s, two `b`s, one `c`. Every character in the output carries a count, even runs of length 1.\n\nThe input contains only printable characters and never contains digits, so the encoding is unambiguous. Return the encoded string. An empty input produces an empty string.",
    explanation:
      "Walk through the string tracking the current character and how many times it has repeated in a row. When the next character differs (or you reach the end), append the character together with its count to the result, then reset the run.\n\nThis is a single linear pass, O(n) time. The only edge cases are the empty string (return `\"\"`) and remembering to flush the final run after the loop ends.",
    functionName: 'run_length_encode',
    functionSignature: "def run_length_encode(s: str) -> str:",
    starter:
      STARTER_HEADER + "def run_length_encode(s: str) -> str:\n    pass\n",
    examples: [
      { input: ["aaabbc"], expected: "a3b2c1" },
      { input: ["abc"], expected: "a1b1c1" },
      { input: [""], expected: "" },
    ],
    hiddenTests: [
      { input: ["wwwwwwwwwww"], expected: "w11" },
      { input: ["aabbaa"], expected: "a2b2a2" },
      { input: ["x"], expected: "x1" },
    ],
  },
  {
    id: 'shift-cipher-match',
    number: 216,
    title: "Shift Cipher Match",
    difficulty: 'Easy',
    topic: "String",
    statement:
      "Two lowercase strings `a` and `b` are a *shift match* if you can turn `a` into `b` by shifting every letter forward around the alphabet by the same fixed amount (a Caesar shift). Shifting wraps: after `z` comes `a`. A shift of 0 is allowed, so a string always matches itself.\n\nFor example `\"abc\"` and `\"bcd\"` match with shift 1, and `\"az\"` and `\"ba\"` match with shift 1 (the `z` wraps to `a`). But `\"abc\"` and `\"abd\"` do not match with any single shift.\n\nStrings of different lengths never match. Two empty strings match. Return `true` if `a` and `b` are a shift match, otherwise `false`.",
    explanation:
      "If the lengths differ, they cannot match. Otherwise every position must be shifted by the *same* amount. Compute the required shift from the first character: `(b[0] - a[0]) mod 26`.\n\nThen verify every position: for each pair `(x, y)`, check that shifting `x` by that amount lands exactly on `y`, i.e. `(x - 'a' + shift) mod 26 == (y - 'a')`. If any position disagrees, return `false`. Empty strings trivially match.\n\nOne linear pass, O(n) time, O(1) space.",
    functionName: 'is_shifted_match',
    functionSignature: "def is_shifted_match(a: str, b: str) -> bool:",
    starter:
      STARTER_HEADER + "def is_shifted_match(a: str, b: str) -> bool:\n    pass\n",
    examples: [
      { input: ["abc","bcd"], expected: true },
      { input: ["az","ba"], expected: true },
      { input: ["abc","abd"], expected: false },
    ],
    hiddenTests: [
      { input: ["abc","abc"], expected: true },
      { input: ["abc","ab"], expected: false },
      { input: ["",""], expected: true },
      { input: ["hello","ifmmp"], expected: true },
    ],
  },
  {
    id: 'min-deletions-no-adjacent',
    number: 217,
    title: "Minimum Deletions for No Adjacent Duplicates",
    difficulty: 'Easy',
    topic: "String",
    statement:
      "Given a string `s`, you may delete characters to ensure that no two *adjacent* characters in the resulting string are equal. Return the minimum number of deletions required.\n\nWhen a run of identical characters appears (for example `\"aaa\"`), you must delete all but one of them so that only a single copy remains touching its neighbors. So `\"aaa\"` needs 2 deletions, `\"aab\"` needs 1, and `\"abab\"` needs 0.\n\nThe empty string needs 0 deletions.",
    explanation:
      "The only thing that forces a deletion is two equal characters sitting next to each other. For a run of length `k` of the same character, you must remove `k - 1` of them.\n\nSweep once, comparing each character with the previous kept character. Every time the current character equals the previous one, count one deletion (and effectively skip it). Summing these gives the answer.\n\nO(n) time, O(1) space.",
    functionName: 'min_deletions_no_adjacent',
    functionSignature: "def min_deletions_no_adjacent(s: str) -> int:",
    starter:
      STARTER_HEADER + "def min_deletions_no_adjacent(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["aab"], expected: 1 },
      { input: ["aaaa"], expected: 3 },
      { input: ["abab"], expected: 0 },
    ],
    hiddenTests: [
      { input: [""], expected: 0 },
      { input: ["aaabbbccc"], expected: 6 },
      { input: ["a"], expected: 0 },
    ],
  },
  {
    id: 'smallest-distinct-subsequence',
    number: 218,
    title: "Smallest Distinct Subsequence",
    difficulty: 'Hard',
    topic: "String",
    statement:
      "Given a lowercase string `s`, remove characters so that every distinct letter of `s` appears exactly once in the result, while keeping the *relative order* of the letters you keep. Among all such results, return the one that is lexicographically smallest.\n\nFor example, from `\"bcabc\"` the distinct letters are `a`, `b`, `c`, and the smallest valid ordering achievable as a subsequence is `\"abc\"`. From `\"cbacdcbc\"` the answer is `\"acdb\"`.\n\nThe empty string returns the empty string.",
    explanation:
      "This is the classic \"remove duplicate letters\" greedy problem solved with a monotonic stack.\n\nFirst record the last index at which each character occurs. Then scan left to right, maintaining a stack that stays as lexicographically small as possible. Skip any character already in the stack. Otherwise, while the top of the stack is greater than the current character AND that top character appears again later (its last index is beyond the current position), pop it — you can safely add it back later, and removing it now makes the prefix smaller. Push the current character and mark it present.\n\nEach character is pushed and popped at most once, so this runs in O(n) time.",
    functionName: 'smallest_distinct_subsequence',
    functionSignature: "def smallest_distinct_subsequence(s: str) -> str:",
    starter:
      STARTER_HEADER + "def smallest_distinct_subsequence(s: str) -> str:\n    pass\n",
    examples: [
      { input: ["bcabc"], expected: "abc" },
      { input: ["cbacdcbc"], expected: "acdb" },
      { input: ["bbcaac"], expected: "bac" },
    ],
    hiddenTests: [
      { input: [""], expected: "" },
      { input: ["aaaa"], expected: "a" },
      { input: ["edcba"], expected: "edcba" },
    ],
  },
  {
    id: 'closest-pair-sum',
    number: 219,
    title: "Closest Pair Sum",
    difficulty: 'Medium',
    topic: "Two Pointers",
    statement:
      "You're given a list of integers `nums` (length at least 2) and an integer `target`. Consider every pair of two distinct positions; each pair has a sum. Return the pair sum that is closest to `target` — that is, the sum whose absolute difference from `target` is smallest.\n\nIf two different pair sums are equally close to `target`, return the smaller of those two sums.",
    explanation:
      "Sort the array first, then sweep two pointers inward from both ends. At each step the pair sum tells you which direction to move: if the sum is below `target`, advancing the left pointer can only increase it; if above, retreating the right pointer can only decrease it.\n\nTrack the best sum seen so far, breaking ties toward the smaller sum. Sorting is O(n log n) and the sweep is O(n).",
    functionName: 'closest_pair_sum',
    functionSignature: "def closest_pair_sum(nums: list[int], target: int) -> int:",
    starter:
      STARTER_HEADER + "def closest_pair_sum(nums: list[int], target: int) -> int:\n    pass\n",
    examples: [
      { input: [[1,3,4,7,10],15], expected: 14 },
      { input: [[-1,2,1,-4],4], expected: 3 },
      { input: [[5,5,5],10], expected: 10 },
    ],
    hiddenTests: [
      { input: [[1,2,3,4],100], expected: 7 },
      { input: [[10,-10,0],1], expected: 0 },
      { input: [[2,2,2,2],3], expected: 4 },
    ],
  },
  {
    id: 'merge-two-sorted-arrays',
    number: 220,
    title: "Merge Two Sorted Arrays",
    difficulty: 'Easy',
    topic: "Two Pointers",
    statement:
      "You're given two lists of integers `a` and `b`, each already sorted in non-decreasing order (either may be empty). Merge them into a single new list that is also sorted in non-decreasing order, and return it.\n\nDuplicates are kept: if a value appears in both lists (or multiple times), it appears that many times in the result.",
    explanation:
      "Because both inputs are already sorted, you never need to re-sort. Keep one index into each list. Repeatedly compare the two front elements and append the smaller one, advancing that list's index.\n\nWhen one list runs out, append whatever remains of the other. This is a single linear pass, O(len(a) + len(b)) time.",
    functionName: 'merge_sorted',
    functionSignature: "def merge_sorted(a: list[int], b: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def merge_sorted(a: list[int], b: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,3,5],[2,4,6]], expected: [1,2,3,4,5,6] },
      { input: [[],[1,2]], expected: [1,2] },
      { input: [[0,0],[0]], expected: [0,0,0] },
    ],
    hiddenTests: [
      { input: [[1,2,3],[]], expected: [1,2,3] },
      { input: [[-3,-1,4],[-2,0,5]], expected: [-3,-2,-1,0,4,5] },
    ],
  },
  {
    id: 'count-pairs-below-threshold',
    number: 221,
    title: "Count Pairs Below Threshold",
    difficulty: 'Medium',
    topic: "Two Pointers",
    statement:
      "You're given a list of integers `nums` and an integer `limit`. Count how many unordered pairs of distinct positions `(i, j)` satisfy `nums[i] + nums[j] < limit`.\n\nEach unordered pair is counted once. Return the total count.",
    explanation:
      "Sort the array, then use two pointers from the two ends. If the smallest and largest current values already sum to less than `limit`, then pairing the left element with every element between the two pointers also stays under `limit` — so add `right - left` to the count in one shot and advance the left pointer.\n\nOtherwise the sum is too big, so move the right pointer inward. Sorting dominates at O(n log n).",
    functionName: 'count_pairs_below',
    functionSignature: "def count_pairs_below(nums: list[int], limit: int) -> int:",
    starter:
      STARTER_HEADER + "def count_pairs_below(nums: list[int], limit: int) -> int:\n    pass\n",
    examples: [
      { input: [[1,2,3,4],5], expected: 2 },
      { input: [[-2,0,1,3],2], expected: 4 },
      { input: [[5,5,5],20], expected: 3 },
    ],
    hiddenTests: [
      { input: [[1],10], expected: 0 },
      { input: [[1,1,1,1],3], expected: 6 },
    ],
  },
  {
    id: 'dedup-keep-at-most-two',
    number: 222,
    title: "Dedup Keeping At Most Two",
    difficulty: 'Medium',
    topic: "Two Pointers",
    statement:
      "You're given a list of integers `nums` sorted in non-decreasing order. Remove extra duplicates in place so that each distinct value appears at most twice, preserving order. Return the resulting list (the kept prefix).\n\nFor example `[1,1,1,2,2,3]` becomes `[1,1,2,2,3]` — the third `1` is dropped.",
    explanation:
      "Use a slow write pointer and a fast read pointer. The first two elements are always allowed to stay, so start the write pointer at index 2.\n\nFor each element under the read pointer, compare it against the value two slots behind the write pointer. If they differ, this element does not create a third copy, so write it and advance. This keeps each value to at most two occurrences in a single O(n) pass.",
    functionName: 'dedup_at_most_two',
    functionSignature: "def dedup_at_most_two(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def dedup_at_most_two(nums: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,1,1,2,2,3]], expected: [1,1,2,2,3] },
      { input: [[0,0,1,1,1,1,2,3,3]], expected: [0,0,1,1,2,3,3] },
      { input: [[1]], expected: [1] },
    ],
    hiddenTests: [
      { input: [[1,2]], expected: [1,2] },
      { input: [[5,5,5,5]], expected: [5,5] },
    ],
  },
  {
    id: 'three-sum-smaller-count',
    number: 223,
    title: "Three Sum Smaller Count",
    difficulty: 'Hard',
    topic: "Two Pointers",
    statement:
      "You're given a list of integers `nums` and an integer `target`. Count how many triples of distinct positions `(i, j, k)` with `i < j < k` satisfy `nums[i] + nums[j] + nums[k] < target`.\n\nReturn the total count. If `nums` has fewer than three elements, return `0`.",
    explanation:
      "Sort the array. Fix the leftmost element of the triple, then run a two-pointer sweep on the remaining suffix — exactly like counting pairs below a threshold, but the threshold becomes `target - nums[k]`.\n\nWhen the fixed value plus the two pointer values sums below `target`, every element between the two pointers also works, so add `right - left` and advance the left pointer; otherwise move the right pointer in. Overall O(n^2).",
    functionName: 'three_sum_smaller',
    functionSignature: "def three_sum_smaller(nums: list[int], target: int) -> int:",
    starter:
      STARTER_HEADER + "def three_sum_smaller(nums: list[int], target: int) -> int:\n    pass\n",
    examples: [
      { input: [[-2,0,1,3],2], expected: 2 },
      { input: [[],0], expected: 0 },
      { input: [[0],0], expected: 0 },
    ],
    hiddenTests: [
      { input: [[3,1,0,-2],4], expected: 3 },
      { input: [[-1,0,1,2],3], expected: 3 },
    ],
  },
  {
    id: 'max-vowels-in-window',
    number: 224,
    title: "Most Vowels in a Window",
    difficulty: 'Easy',
    topic: "Sliding Window",
    statement:
      "You're given a lowercase string `s` and an integer `k` (with `1 <= k <= len(s)`). Consider every contiguous substring of length exactly `k`. Return the maximum number of vowels (`a`, `e`, `i`, `o`, `u`) contained in any one of those windows.",
    explanation:
      "Recomputing the vowel count for each window from scratch is O(n*k). Instead, slide a fixed-size window across the string.\n\nCount the vowels in the first `k` characters. Then move the window one step at a time: add the incoming character (if it's a vowel) and subtract the outgoing character (if it's a vowel). Track the running maximum count.\n\nOne pass, O(n) time, O(1) extra space.",
    functionName: 'max_vowels_in_window',
    functionSignature: "def max_vowels_in_window(s: str, k: int) -> int:",
    starter:
      STARTER_HEADER + "def max_vowels_in_window(s: str, k: int) -> int:\n    pass\n",
    examples: [
      { input: ["abciiidef",3], expected: 3 },
      { input: ["aeiou",2], expected: 2 },
      { input: ["leetcode",3], expected: 2 },
    ],
    hiddenTests: [
      { input: ["rhythms",4], expected: 0 },
      { input: ["tryhard",1], expected: 1 },
      { input: ["a",1], expected: 1 },
    ],
  },
  {
    id: 'longest-at-most-k-odd',
    number: 225,
    title: "Longest Run with K Odd Numbers",
    difficulty: 'Medium',
    topic: "Sliding Window",
    statement:
      "You're given a list of integers `nums` and an integer `k` (with `k >= 0`). Return the length of the longest contiguous subarray that contains at most `k` odd numbers. If `nums` is empty, return `0`.",
    explanation:
      "This is a classic at-most-k variable-window problem.\n\nExpand a window with a `right` pointer, counting how many odd numbers are inside. Whenever the count of odds exceeds `k`, shrink from the left, decrementing the odd count as odd values leave, until the window is valid again.\n\nAt every step the window `[left, right]` is valid, so update the best length with `right - left + 1`.\n\nO(n) time, O(1) extra space.",
    functionName: 'longest_at_most_k_odd',
    functionSignature: "def longest_at_most_k_odd(nums: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER + "def longest_at_most_k_odd(nums: list[int], k: int) -> int:\n    pass\n",
    examples: [
      { input: [[1,2,3,4,5],2], expected: 4 },
      { input: [[2,4,6],0], expected: 3 },
      { input: [[1,3,5,7],1], expected: 1 },
    ],
    hiddenTests: [
      { input: [[2,2,1,2,2],1], expected: 5 },
      { input: [[1,1,1],0], expected: 0 },
      { input: [[],3], expected: 0 },
    ],
  },
  {
    id: 'min-swaps-group-ones-2',
    number: 226,
    title: "Minimum Swaps to Gather the Ones",
    difficulty: 'Medium',
    topic: "Sliding Window",
    statement:
      "You're given a binary list `nums` containing only `0`s and `1`s. In one swap you may exchange the values at any two positions. Return the minimum number of swaps needed so that all the `1`s end up in a single contiguous block. If there are no `1`s, return `0`.",
    explanation:
      "Let `t` be the total number of `1`s. In the final arrangement all `1`s occupy some window of length exactly `t`. The cheapest choice is the length-`t` window that already contains the most `1`s, because every missing `1` in that window costs exactly one swap to bring in.\n\nUse a fixed-size sliding window of width `t`: count the `1`s in the first window, then slide, adding the entering element and removing the leaving one, tracking the maximum ones-in-window `m`. The answer is `t - m`.\n\nO(n) time, O(1) extra space.",
    functionName: 'min_swaps_to_group_ones',
    functionSignature: "def min_swaps_to_group_ones(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def min_swaps_to_group_ones(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[1,0,1,0,1]], expected: 1 },
      { input: [[0,0,0,1,0]], expected: 0 },
      { input: [[1,1,0,0,1]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[0,0,0]], expected: 0 },
      { input: [[1,0,1,0,1,0,0,1,1,0,1]], expected: 3 },
      { input: [[1,1,1]], expected: 0 },
    ],
  },
  {
    id: 'count-substrings-all-abc',
    number: 227,
    title: "Substrings Covering a, b, and c",
    difficulty: 'Hard',
    topic: "Sliding Window",
    statement:
      "You're given a string `s` made up only of the characters `a`, `b`, and `c`. Return the number of contiguous substrings that contain at least one occurrence of each of the three characters `a`, `b`, and `c`.",
    explanation:
      "Fix the right end of the substring at index `i` and count how many valid substrings end there. A substring ending at `i` is valid once it reaches back far enough to include the most recent `a`, `b`, and `c`.\n\nTrack `last['a']`, `last['b']`, `last['c']` — the most recent index of each character (initialized to -1). For each `i`, the smallest of those three last-seen indices, call it `m`, is the latest start that still covers all three. Every start position `0..m` yields a valid substring ending at `i`, so add `m + 1` (which is `1 + min(...)`, and contributes nothing while any character is still missing).\n\nSumming over all `i` gives the total. O(n) time, O(1) extra space.",
    functionName: 'count_substrings_all_abc',
    functionSignature: "def count_substrings_all_abc(s: str) -> int:",
    starter:
      STARTER_HEADER + "def count_substrings_all_abc(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["abcabc"], expected: 10 },
      { input: ["aaacb"], expected: 3 },
      { input: ["abc"], expected: 1 },
    ],
    hiddenTests: [
      { input: ["ab"], expected: 0 },
      { input: ["cccabababc"], expected: 23 },
    ],
  },
  {
    id: 'longest-ones-after-deletion',
    number: 228,
    title: "Longest Ones After One Deletion",
    difficulty: 'Medium',
    topic: "Sliding Window",
    statement:
      "You're given a binary list `nums` of `0`s and `1`s. You must delete exactly one element from the list. After the deletion, return the length of the longest contiguous run of `1`s that remains. If no run of `1`s can be formed, return `0`.",
    explanation:
      "Because you must delete exactly one element, the answer is the longest window that contains at most one `0`, minus that one deleted slot.\n\nSlide a variable window that allows at most one `0` inside. Expand with `right`; when the window holds two `0`s, shrink from `left` until only one `0` remains. Since exactly one element is removed, the count of `1`s you can keep from a window `[left, right]` is `right - left` (the window length minus one).\n\nTake the maximum of `right - left` over all windows. This naturally handles the all-`1`s case (you're forced to delete one) and the all-`0`s case (result `0`). O(n) time, O(1) space.",
    functionName: 'longest_ones_after_deletion',
    functionSignature: "def longest_ones_after_deletion(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def longest_ones_after_deletion(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[1,1,0,1]], expected: 3 },
      { input: [[0,1,1,1,0,1,1,0,1]], expected: 5 },
      { input: [[1,1,1]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[0,0,0]], expected: 0 },
      { input: [[1,1,1,1]], expected: 3 },
      { input: [[1,0,1,1,0,1,1,1,1]], expected: 6 },
    ],
  },
  {
    id: 'rotated-search-with-dupes',
    number: 229,
    title: "Rotated Search With Repeats",
    difficulty: 'Medium',
    topic: "Binary Search",
    statement:
      "A sorted-ascending array `nums` was rotated at some unknown pivot (so `[0,1,2,4,4,5]` might become `[4,5,0,1,2,4]`). Unlike the classic version, `nums` may contain duplicate values. Given `nums` and a value `target`, return `true` if `target` appears anywhere in the array, otherwise `false`.\n\nAim for better than a full linear scan on average by exploiting the rotated-sorted structure.",
    explanation:
      "This extends binary search on a rotated array. At each step you inspect `mid`; if it matches the target you're done. Otherwise you decide which half is sorted and whether the target lies in it.\n\nThe wrinkle from duplicates: when `nums[lo] == nums[mid] == nums[hi]`, you can't tell which side is sorted, so you shrink the window by one on each end (`lo += 1`, `hi -= 1`) and continue. This gives O(log n) average time but O(n) worst case when the array is all equal values.",
    functionName: 'search_rotated_dupes',
    functionSignature: "def search_rotated_dupes(nums: list[int], target: int) -> bool:",
    starter:
      STARTER_HEADER + "def search_rotated_dupes(nums: list[int], target: int) -> bool:\n    pass\n",
    examples: [
      { input: [[2,5,6,0,0,1,2],0], expected: true },
      { input: [[2,5,6,0,0,1,2],3], expected: false },
      { input: [[1,0,1,1,1],0], expected: true },
    ],
    hiddenTests: [
      { input: [[1,1,1,1],2], expected: false },
      { input: [[4,5,6,7,0,1,2],5], expected: true },
      { input: [[1],1], expected: true },
    ],
  },
  {
    id: 'count-negatives-sorted-grid',
    number: 230,
    title: "Negatives in a Sorted Grid",
    difficulty: 'Easy',
    topic: "Binary Search",
    statement:
      "You're given an `m x n` matrix `grid`. Every row is sorted in non-increasing (descending) order from left to right, and every column is sorted in non-increasing order from top to bottom. Return the count of negative numbers in `grid`.\n\nUse the sorted structure of each row rather than checking every cell blindly.",
    explanation:
      "Within a single descending row, all negatives are clustered at the right end. Binary-search each row for the first index where the value drops below 0; every element from that index onward is negative, contributing `len(row) - index` to the total.\n\nProcessing each row with binary search gives O(m log n). (A staircase walk from the bottom-left achieves O(m + n), but the per-row binary search is the intended approach here.)",
    functionName: 'count_negatives',
    functionSignature: "def count_negatives(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def count_negatives(grid: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[4,3,2,-1],[3,2,1,-1],[1,1,-1,-2],[-1,-1,-2,-3]]], expected: 8 },
      { input: [[[3,2],[1,0]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[[5,1,0],[-5,-5,-5]]], expected: 3 },
      { input: [[[-1]]], expected: 1 },
      { input: [[[7,7,7],[7,7,7]]], expected: 0 },
    ],
  },
  {
    id: 'target-first-last-range',
    number: 231,
    title: "First and Last Position",
    difficulty: 'Medium',
    topic: "Binary Search",
    statement:
      "Given an array `nums` sorted in non-decreasing order and a value `target`, return the starting and ending indices of `target` as a two-element list `[first, last]`. If `target` is not present, return `[-1, -1]`.\n\nYour solution must run in O(log n) time.",
    explanation:
      "Two boundary binary searches solve this. The lower bound is the leftmost index where `target` could be inserted while keeping the array sorted (`bisect_left`); if that index is in range and the value there equals `target`, it's the first occurrence.\n\nThe upper bound is one before the leftmost index where a value greater than `target` would go (`bisect_right - 1`), giving the last occurrence. If the target isn't present at the lower bound, return `[-1, -1]`.",
    functionName: 'search_range',
    functionSignature: "def search_range(nums: list[int], target: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def search_range(nums: list[int], target: int) -> list[int]:\n    pass\n",
    examples: [
      { input: [[5,7,7,8,8,10],8], expected: [3,4] },
      { input: [[5,7,7,8,8,10],6], expected: [-1,-1] },
      { input: [[],0], expected: [-1,-1] },
    ],
    hiddenTests: [
      { input: [[1],1], expected: [0,0] },
      { input: [[2,2,2,2],2], expected: [0,3] },
    ],
  },
  {
    id: 'split-array-min-largest-sum',
    number: 232,
    title: "Split Array Smallest Largest Sum",
    difficulty: 'Hard',
    topic: "Binary Search",
    statement:
      "Given an array `nums` of non-negative integers and an integer `k`, split `nums` into exactly `k` non-empty contiguous subarrays. Among all valid splits, minimize the largest subarray sum, and return that minimized value.",
    explanation:
      "This is binary search on the answer. The answer (the largest subarray sum) lies between `max(nums)` (no group can be smaller than its biggest element) and `sum(nums)` (one group holds everything).\n\nFor a candidate cap, greedily walk the array counting how many groups you need if no group may exceed the cap: start a new group whenever adding the next element would overflow. If the required group count is at most `k`, the cap is feasible. Binary-search for the smallest feasible cap: O(n log(sum)).",
    functionName: 'split_array_min_largest',
    functionSignature: "def split_array_min_largest(nums: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER + "def split_array_min_largest(nums: list[int], k: int) -> int:\n    pass\n",
    examples: [
      { input: [[7,2,5,10,8],2], expected: 18 },
      { input: [[1,2,3,4,5],2], expected: 9 },
    ],
    hiddenTests: [
      { input: [[1,4,4],3], expected: 4 },
      { input: [[10],1], expected: 10 },
      { input: [[2,3,1,2,4,3],5], expected: 4 },
    ],
  },
  {
    id: 'min-days-bouquets',
    number: 233,
    title: "Minimum Days for Bouquets",
    difficulty: 'Medium',
    topic: "Binary Search",
    statement:
      "You have a garden of flowers; `bloom[i]` is the day flower `i` blooms. To make one bouquet you need `k` adjacent flowers (contiguous positions) that have all bloomed. You want to make `m` bouquets in total. Return the minimum number of days to wait so that `m` bouquets can be made, or `-1` if it is impossible.\n\nEach flower can be used in at most one bouquet.",
    explanation:
      "First, if `m * k > len(bloom)` it's impossible, so return `-1`. Otherwise binary-search on the answer: the number of days.\n\nFor a candidate day `d`, a flower is usable if `bloom[i] <= d`. Scan left to right counting consecutive usable flowers; each time the run reaches `k`, complete a bouquet and reset the run. If you can form at least `m` bouquets, `d` is feasible. Search between `min(bloom)` and `max(bloom)` for the smallest feasible day.",
    functionName: 'min_bloom_days',
    functionSignature: "def min_bloom_days(bloom: list[int], m: int, k: int) -> int:",
    starter:
      STARTER_HEADER + "def min_bloom_days(bloom: list[int], m: int, k: int) -> int:\n    pass\n",
    examples: [
      { input: [[1,10,3,10,2],3,1], expected: 3 },
      { input: [[1,10,3,10,2],3,2], expected: -1 },
    ],
    hiddenTests: [
      { input: [[7,7,7,7,12,7,7],2,3], expected: 12 },
      { input: [[1,10,2,9,3,8,4,7,5,6],4,2], expected: 9 },
      { input: [[5],1,1], expected: 5 },
    ],
  },
  {
    id: 'backspace-string-compare',
    number: 234,
    title: "Backspace Text Compare",
    difficulty: 'Easy',
    topic: "Stack",
    statement:
      "Two people typed text into editors, given as strings `s` and `t`. In each string the character `'#'` means a backspace: it deletes the character typed just before it. A backspace on an already-empty text does nothing. Return `true` if the two editors show the same final text after all backspaces are applied, and `false` otherwise.\n\nExample: `\"ab#c\"` becomes `\"ac\"` (the `b` is deleted), and `\"ad#c\"` also becomes `\"ac\"`, so they match.",
    explanation:
      "Each backspace removes the most recently typed surviving character — that last-in-first-out behavior is exactly a stack. Build the final text for each string independently, then compare.\n\nScan a string left to right with an empty stack: on a normal character, push it; on `'#'`, pop the stack only if it is non-empty (a backspace on empty text is a no-op). After the scan the stack holds the visible text. Do this for both `s` and `t` and check the two stacks are equal. Each character is handled once, so this runs in O(len(s) + len(t)) time and O(len(s) + len(t)) space.",
    functionName: 'backspace_compare',
    functionSignature: "def backspace_compare(s: str, t: str) -> bool:",
    starter:
      STARTER_HEADER + "def backspace_compare(s: str, t: str) -> bool:\n    pass\n",
    examples: [
      { input: ["ab#c","ad#c"], expected: true },
      { input: ["ab##","c#d#"], expected: true },
      { input: ["a#c","b"], expected: false },
    ],
    hiddenTests: [
      { input: ["#####a","a"], expected: true },
      { input: ["xywrrmp","xywrrmu#p"], expected: true },
      { input: ["bxj##tw","bxo#j##tw"], expected: true },
      { input: ["a##c","#a#c"], expected: true },
    ],
  },
  {
    id: 'max-frequency-stack-ops',
    number: 235,
    title: "Frequency Stack Replay",
    difficulty: 'Hard',
    topic: "Stack",
    statement:
      "Simulate a special stack and return the sequence of values popped from it. You are given a list `ops` of operations, each a list. `[\"push\", x]` pushes the integer `x`. `[\"pop\"]` removes and yields the most frequent value currently in the stack; if several values are tied for most frequent, it yields the one that was pushed most recently among them.\n\nReturn a list of the values yielded by the `pop` operations, in the order they were popped. There is always at least one value present when a `pop` occurs.",
    explanation:
      "A plain stack can't find the most frequent element quickly, so track counts explicitly. Keep a dictionary `freq` mapping each value to how many copies are currently present, and a dictionary `groups` mapping a frequency level `f` to a stack of the values that have reached count `f`. Also keep `maxf`, the highest active frequency.\n\nOn push of `x`: increment `freq[x]` to `f`, append `x` onto `groups[f]`, and raise `maxf` to `f` if larger. Because a value appears in `groups[1]`, `groups[2]`, ... up to its current count, the top of `groups[maxf]` is always the most-frequent, most-recently-pushed value. On pop: take `v = groups[maxf].pop()`, decrement `freq[v]`, and if `groups[maxf]` became empty drop `maxf` by one. Each operation is O(1) amortized, giving O(len(ops)) time and space overall.",
    functionName: 'freq_stack',
    functionSignature: "def freq_stack(ops: list[list]) -> list[int]:",
    starter:
      STARTER_HEADER + "def freq_stack(ops: list[list]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[["push",5],["push",7],["push",5],["push",7],["push",4],["push",5],["pop"],["pop"],["pop"],["pop"]]], expected: [5,7,5,4] },
      { input: [[["push",1],["push",1],["push",2],["pop"],["pop"],["pop"]]], expected: [1,2,1] },
    ],
    hiddenTests: [
      { input: [[["push",3],["pop"]]], expected: [3] },
      { input: [[["push",9],["push",9],["push",1],["push",1],["push",1],["pop"],["pop"]]], expected: [1,1] },
      { input: [[["push",2],["push",2],["push",3],["push",3],["pop"]]], expected: [3] },
    ],
  },
  {
    id: 'balanced-bracket-score',
    number: 236,
    title: "Balanced Bracket Score",
    difficulty: 'Medium',
    topic: "Stack",
    statement:
      "You are given a balanced string `s` made only of the characters `'('` and `')'`. Compute its score using these rules:\n\n- `\"()\"` has a score of `1`.\n- `AB` (two adjacent balanced parts) has score `score(A) + score(B)`.\n- `(A)` (a balanced part wrapped in one pair) has score `2 * score(A)`.\n\nFor example `\"(())\"` scores `2`, `\"()()\"` scores `2`, and `\"(()(()))\"` scores `6`. Return the total score as an integer. The input is always a valid balanced parenthesis string.",
    explanation:
      "The score of a group depends on what is directly inside it, so use a stack where each entry is the accumulated score of the group currently open at that depth. Start the stack with a single 0 representing the outermost group.\n\nScan the string: on `'('`, open a new group by pushing 0. On `')'`, close the current group — pop its inner score `inner`; the closed pair contributes `max(2 * inner, 1)` (that is `1` for an empty `\"()\"`, or double the inner score otherwise) and you add that contribution to the new top of the stack. When the scan finishes, the single remaining stack value is the answer. Every character is processed once with O(1) work, so the algorithm is O(n) time and O(n) space for the depth of nesting.",
    functionName: 'bracket_score',
    functionSignature: "def bracket_score(s: str) -> int:",
    starter:
      STARTER_HEADER + "def bracket_score(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["()"], expected: 1 },
      { input: ["(())"], expected: 2 },
      { input: ["(()(()))"], expected: 6 },
    ],
    hiddenTests: [
      { input: ["()()"], expected: 2 },
      { input: ["((()))"], expected: 4 },
      { input: ["(()())"], expected: 4 },
      { input: ["()(())"], expected: 3 },
    ],
  },
  {
    id: 'remove-k-adjacent-duplicates',
    number: 237,
    title: "Collapse K Adjacent Duplicates",
    difficulty: 'Medium',
    topic: "Stack",
    statement:
      "You are given a lowercase string `s` and an integer `k`. Repeatedly remove any group of `k` adjacent, equal characters. After a removal the two sides join together, which may create new groups of `k` equal characters that then also get removed. Keep going until no such group remains, and return the final string.\n\nFor example, with `k = 3`, `\"deeedbbcccbdaa\"` becomes `\"aa\"`: removing `eee` gives `\"ddbbcccbdaa\"`, removing `ccc` gives `\"ddbbbdaa\"`, removing `bbb` gives `\"dddaa\"`, and removing `ddd` gives `\"aa\"`. The final result is unique regardless of removal order.",
    explanation:
      "Instead of rescanning the whole string after each removal, carry a running count with a stack. Each stack entry is a pair `[character, count]` describing a maximal run of equal characters that is still present.\n\nScan `s` left to right. If the incoming character equals the character on top of the stack, increment that entry's count; if the count reaches `k`, pop the entry (the run is fully removed) — this naturally lets the previous run merge with whatever comes next on the following steps. Otherwise push a fresh `[character, 1]`. At the end, rebuild the answer by repeating each surviving character by its stored count. Every character is pushed and popped at most once, giving O(n) time and O(n) space.",
    functionName: 'remove_k_duplicates',
    functionSignature: "def remove_k_duplicates(s: str, k: int) -> str:",
    starter:
      STARTER_HEADER + "def remove_k_duplicates(s: str, k: int) -> str:\n    pass\n",
    examples: [
      { input: ["abcd",2], expected: "abcd" },
      { input: ["deeedbbcccbdaa",3], expected: "aa" },
      { input: ["pbbcggttciiippooaais",2], expected: "ps" },
    ],
    hiddenTests: [
      { input: ["aaabbbaaa",3], expected: "" },
      { input: ["yyxxyy",2], expected: "" },
      { input: ["aaa",4], expected: "aaa" },
      { input: ["aabbccddaa",2], expected: "" },
    ],
  },
  {
    id: 'stock-span-widths',
    number: 238,
    title: "Stock Span Widths",
    difficulty: 'Easy',
    topic: "Monotonic Stack",
    statement:
      "You're given a list `prices` where `prices[i]` is a stock's price on day `i`. The *span* of the stock on a given day is the number of consecutive days ending on that day (including the day itself) for which the price was less than or equal to the price on that day.\n\nFormally, the span on day `i` is the largest `k` such that `prices[i - k + 1] <= prices[i]`, `prices[i - k + 2] <= prices[i]`, ..., up through `prices[i]`. The moment you hit an earlier day whose price is strictly greater than `prices[i]`, the run stops.\n\nReturn a list of the same length where position `i` holds the span for day `i`.",
    explanation:
      "A brute-force scan backward from each day is O(n²). A monotonic stack fixes that.\n\nKeep a stack of day indices whose prices are strictly decreasing. For each new day `i`, pop every index on top whose price is `<= prices[i]` (those days are absorbed into the current span). After popping, if the stack is empty the span reaches all the way to the start (`i + 1`); otherwise it reaches back to just after the index now on top: `i - stack[-1]`. Push `i` and continue.\n\nEach index is pushed and popped at most once, so this is O(n) time.",
    functionName: 'stock_span',
    functionSignature: "def stock_span(prices: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def stock_span(prices: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[100,80,60,70,60,75,85]], expected: [1,1,1,2,1,4,6] },
      { input: [[10,4,5,90,120,80]], expected: [1,1,2,4,5,1] },
    ],
    hiddenTests: [
      { input: [[5,5,5]], expected: [1,2,3] },
      { input: [[1]], expected: [1] },
      { input: [[6,3,4,5,2]], expected: [1,1,2,3,1] },
      { input: [[1,2,3,4]], expected: [1,2,3,4] },
    ],
  },
  {
    id: 'smallest-after-k-removals',
    number: 239,
    title: "Smallest After K Removals",
    difficulty: 'Medium',
    topic: "Monotonic Stack",
    statement:
      "You're given `num`, a non-negative integer represented as a string of digits (no sign, may contain leading zeros only in edge cases), and an integer `k`. Remove exactly `k` digits from `num` so that the remaining digits, read left to right in their original order, form the smallest possible number.\n\nReturn the result as a string with no leading zeros. If removing digits leaves nothing (or the result would be all zeros), return `\"0\"`. You may assume `0 <= k <= len(num)`.",
    explanation:
      "To make the number as small as possible, you want smaller digits as far left as possible. Scan left to right maintaining a stack of kept digits.\n\nFor each incoming digit `d`, while you still have removals left (`k > 0`) and the digit on top of the stack is strictly greater than `d`, pop it (removing a larger digit that sits before a smaller one always helps). Then push `d`.\n\nIf you finish the scan with removals remaining (the string was non-decreasing), drop that many digits from the end. Finally, join the stack, strip leading zeros, and return `\"0\"` if the result is empty.\n\nThis greedy monotonic-stack approach runs in O(n).",
    functionName: 'remove_k_digits',
    functionSignature: "def remove_k_digits(num: str, k: int) -> str:",
    starter:
      STARTER_HEADER + "def remove_k_digits(num: str, k: int) -> str:\n    pass\n",
    examples: [
      { input: ["1432219",3], expected: "1219" },
      { input: ["10200",1], expected: "200" },
      { input: ["10",2], expected: "0" },
    ],
    hiddenTests: [
      { input: ["112",1], expected: "11" },
      { input: ["1234567890",9], expected: "0" },
      { input: ["9",1], expected: "0" },
      { input: ["100",1], expected: "0" },
    ],
  },
  {
    id: 'sum-of-subarray-minimums',
    number: 240,
    title: "Sum of Subarray Minimums",
    difficulty: 'Hard',
    topic: "Monotonic Stack",
    statement:
      "You're given a list of integers `arr`. Consider every contiguous subarray of `arr`. For each subarray, take its minimum element. Return the sum of all those minimums.\n\nBecause the total can be large, return the answer modulo `1000000007`.\n\nFor example, with `arr = [3, 1, 2, 4]`, the subarrays and their minimums are: `[3]`→3, `[1]`→1, `[2]`→2, `[4]`→4, `[3,1]`→1, `[1,2]`→1, `[2,4]`→2, `[3,1,2]`→1, `[1,2,4]`→1, `[3,1,2,4]`→1, summing to 17.",
    explanation:
      "Enumerating all O(n²) subarrays is too slow. Instead, count how many subarrays have each element as their minimum.\n\nFor index `i`, let `left` be the number of consecutive elements ending at `i` (including `i`) that are all strictly greater than `arr[i]` on the left side, and `right` the number on the right where elements are greater-than-or-equal. Element `arr[i]` is the minimum of exactly `left * right` subarrays, so its contribution is `arr[i] * left * right`.\n\nUse a monotonic stack to find, for each `i`, the previous strictly-smaller element and the next smaller-or-equal element (the strict/non-strict asymmetry avoids double-counting equal values). Sum all contributions modulo 1e9+7.\n\nThis runs in O(n) time.",
    functionName: 'sum_subarray_mins',
    functionSignature: "def sum_subarray_mins(arr: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def sum_subarray_mins(arr: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[3,1,2,4]], expected: 17 },
      { input: [[11,81,94,43,3]], expected: 444 },
    ],
    hiddenTests: [
      { input: [[1]], expected: 1 },
      { input: [[2,2,2]], expected: 12 },
      { input: [[71,55,82,55]], expected: 593 },
    ],
  },
  {
    id: 'reverse-linked-list-between',
    number: 241,
    title: "Reverse Linked List Between",
    difficulty: 'Medium',
    topic: "Linked List",
    statement:
      "You're given the values of a singly linked list (as a flat Python list) and two 1-indexed positions `left` and `right` with `1 <= left <= right <= n`. Reverse only the sublist of nodes from position `left` to position `right`, inclusive, leaving the rest of the list untouched. Return the resulting values as a Python list.",
    explanation:
      "The flat-list shortcut is a slice reversal: convert to 0-indexed bounds `lo = left - 1`, `hi = right - 1`, then reverse `vals[lo:hi+1]` in place.\n\nThe real linked-list version does this in one pass with O(1) space. Walk `left - 1` steps to the node just before the sublist (use a dummy head so `left == 1` is handled uniformly). Then repeatedly take the node right after your current position and splice it to the front of the reversed segment — the classic head-insertion trick. After `right - left` such splices the segment is reversed and correctly re-attached.\n\nO(n) time, O(1) extra space.",
    functionName: 'reverse_between',
    functionSignature: "def reverse_between(head: list[int], left: int, right: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def reverse_between(head: list[int], left: int, right: int) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,2,3,4,5],2,4], expected: [1,4,3,2,5] },
      { input: [[5],1,1], expected: [5] },
      { input: [[1,2,3],1,3], expected: [3,2,1] },
    ],
    hiddenTests: [
      { input: [[1,2,3,4,5],1,1], expected: [1,2,3,4,5] },
      { input: [[3,5],1,2], expected: [5,3] },
      { input: [[10,20,30,40],2,3], expected: [10,30,20,40] },
    ],
  },
  {
    id: 'palindrome-linked-list',
    number: 242,
    title: "Palindrome Linked List",
    difficulty: 'Easy',
    topic: "Linked List",
    statement:
      "Given the values of a singly linked list as a flat Python list, determine whether the sequence of values reads the same forwards and backwards. Return `True` if it is a palindrome, `False` otherwise. An empty list is considered a palindrome.",
    explanation:
      "With a flat list the check is simply `head == head[::-1]`.\n\nThe interesting O(1)-space linked-list technique: use slow/fast pointers to find the middle, reverse the second half in place, then walk the two halves inward comparing values node by node. If every pair matches, it's a palindrome. (Optionally restore the list by reversing the second half back.)\n\nComparing values inward is O(n) time; the in-place reverse keeps space at O(1), versus the naive O(n)-space approach of copying all values into an array.",
    functionName: 'is_palindrome_list',
    functionSignature: "def is_palindrome_list(head: list[int]) -> bool:",
    starter:
      STARTER_HEADER + "def is_palindrome_list(head: list[int]) -> bool:\n    pass\n",
    examples: [
      { input: [[1,2,2,1]], expected: true },
      { input: [[1,2]], expected: false },
      { input: [[1]], expected: true },
    ],
    hiddenTests: [
      { input: [[]], expected: true },
      { input: [[1,2,3,2,1]], expected: true },
      { input: [[1,0,1,0]], expected: false },
    ],
  },
  {
    id: 'linked-list-cycle-start',
    number: 243,
    title: "Linked List Cycle Start",
    difficulty: 'Medium',
    topic: "Linked List",
    statement:
      "You're given the node values of a singly linked list and an integer `pos`. If `pos >= 0`, the tail node is wired back to the node at index `pos`, forming a cycle that begins there. If `pos == -1`, the list has no cycle. Return the index at which the cycle begins, or `-1` if there is no cycle. An empty list has no cycle.",
    explanation:
      "Because `pos` is handed to you, the answer is just `pos` when a cycle exists (and the list is non-empty) and `-1` otherwise.\n\nThe algorithmic heart is Floyd's two-phase cycle detection. **Phase 1**: advance `slow` by one and `fast` by two until they meet inside the loop (if `fast` hits the end, return -1). **Phase 2**: reset one pointer to the head, then advance both one step at a time; they meet exactly at the cycle's entry node. This works because the distance from the head to the entry equals the distance from the meeting point to the entry (mod the cycle length).\n\nO(n) time, O(1) space — no hash set of visited nodes needed.",
    functionName: 'cycle_start',
    functionSignature: "def cycle_start(values: list[int], pos: int) -> int:",
    starter:
      STARTER_HEADER + "def cycle_start(values: list[int], pos: int) -> int:\n    pass\n",
    examples: [
      { input: [[3,2,0,-4],1], expected: 1 },
      { input: [[1,2],0], expected: 0 },
      { input: [[1],-1], expected: -1 },
    ],
    hiddenTests: [
      { input: [[],-1], expected: -1 },
      { input: [[1,2,3,4,5],4], expected: 4 },
      { input: [[7],0], expected: 0 },
    ],
  },
  {
    id: 'partition-list',
    number: 244,
    title: "Partition List",
    difficulty: 'Medium',
    topic: "Linked List",
    statement:
      "Given the values of a singly linked list as a flat Python list and an integer `x`, reorder the values so that every value strictly less than `x` comes before every value greater than or equal to `x`. The original relative order of the nodes within each of the two groups must be preserved (a stable partition). Return the reordered values as a Python list.",
    explanation:
      "The stability requirement is the crux: you can't sort or swap freely. Build two separate sequences in a single left-to-right pass — one collecting values `< x` in the order they appear, the other collecting values `>= x` in the order they appear — then concatenate the first followed by the second.\n\nWith real nodes you'd keep two dummy-headed sub-lists (`less` and `greater`), append each node to the appropriate tail, and finally splice the `less` chain in front of the `greater` chain (remember to null-terminate the greater tail).\n\nO(n) time, O(1) extra space beyond the output.",
    functionName: 'partition_list',
    functionSignature: "def partition_list(head: list[int], x: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def partition_list(head: list[int], x: int) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,4,3,2,5,2],3], expected: [1,2,2,4,3,5] },
      { input: [[2,1],2], expected: [1,2] },
      { input: [[5,4,3,2,1],3], expected: [2,1,5,4,3] },
    ],
    hiddenTests: [
      { input: [[],3], expected: [] },
      { input: [[1,1,1],0], expected: [1,1,1] },
    ],
  },
  {
    id: 'remove-all-duplicate-values',
    number: 245,
    title: "Remove All Duplicate Values",
    difficulty: 'Medium',
    topic: "Linked List",
    statement:
      "Given the values of a singly linked list as a flat Python list, remove every node whose value appears more than once anywhere in the list, keeping only the nodes whose value is unique. The relative order of the surviving values must be preserved. Return the resulting values as a Python list.",
    explanation:
      "Note this deletes duplicated values entirely — not just the extra copies. A value that appears twice contributes nothing to the output.\n\nCount how many times each value occurs (a single pass building a frequency dictionary), then do a second pass keeping only the values whose count equals 1, in their original order.\n\nThe classic linked-list form uses a dummy head and a `prev` pointer: when you spot a run of equal values, skip the entire run by pointing `prev.next` past it; otherwise advance `prev`. That variant assumes a sorted list and runs in O(n) time, O(1) space. The counting approach here handles unsorted input in O(n) time, O(n) space.",
    functionName: 'delete_duplicates_all',
    functionSignature: "def delete_duplicates_all(head: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def delete_duplicates_all(head: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,2,3,3,4,4,5]], expected: [1,2,5] },
      { input: [[1,1,1,2,3]], expected: [2,3] },
      { input: [[1,2,3]], expected: [1,2,3] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[2,2,2]], expected: [] },
      { input: [[1,2,2,1,3]], expected: [3] },
    ],
  },
  {
    id: 'count-leaf-nodes',
    number: 246,
    title: "Count Leaf Nodes",
    difficulty: 'Easy',
    topic: "Tree",
    statement:
      "A binary tree is encoded here as a level-order array with `None` for missing nodes (children of a missing node are omitted, as in the standard LeetCode encoding). A *leaf* is a node with no left child and no right child. Return the number of leaf nodes in the tree. An empty tree has 0 leaves.",
    explanation:
      "Build the actual node tree from the level-order array, then count nodes whose `left` and `right` are both `None`.\n\nRecursive view: `leaves(None) = 0`; `leaves(leaf) = 1`; otherwise `leaves(node) = leaves(node.left) + leaves(node.right)`.\n\nAn iterative DFS with a stack works too — pop each node, add 1 when it has no children, and push any children. O(n) time.",
    functionName: 'count_leaves',
    functionSignature: "def count_leaves(root: list) -> int:",
    starter:
      STARTER_HEADER + "def count_leaves(root: list) -> int:\n    # root is a level-order array; None marks missing nodes.\n    pass\n",
    examples: [
      { input: [[3,9,20,null,null,15,7]], expected: 3 },
      { input: [[1,null,2]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1]], expected: 1 },
      { input: [[1,2,3,4,5,6,7]], expected: 4 },
      { input: [[5,4,null,3,null,2]], expected: 1 },
    ],
  },
  {
    id: 'range-sum-of-bst',
    number: 247,
    title: "Range Sum of BST",
    difficulty: 'Medium',
    topic: "Tree",
    statement:
      "A binary search tree is encoded as a level-order array with `None` for missing nodes (standard LeetCode encoding; children of a missing node are omitted). Given integers `low` and `high`, return the sum of the values of all nodes whose value lies in the inclusive range `[low, high]`. Values are unique. Return 0 for an empty tree.",
    explanation:
      "You could sum every in-range node with a plain traversal, but the BST property lets you prune.\n\nDo a DFS from the root. At a node with value `v`:\n- if `v < low`, the entire left subtree is too small — only recurse right;\n- if `v > high`, the entire right subtree is too large — only recurse left;\n- otherwise add `v` and recurse into both children.\n\nEach node is visited at most once, so O(n) worst case but far fewer visits on typical trees.",
    functionName: 'range_sum_bst',
    functionSignature: "def range_sum_bst(root: list, low: int, high: int) -> int:",
    starter:
      STARTER_HEADER + "def range_sum_bst(root: list, low: int, high: int) -> int:\n    # root is a level-order array of a BST; None marks missing nodes.\n    pass\n",
    examples: [
      { input: [[10,5,15,3,7,null,18],7,15], expected: 32 },
      { input: [[10,5,15,3,7,13,18,1,null,6],6,10], expected: 23 },
      { input: [[],1,5], expected: 0 },
    ],
    hiddenTests: [
      { input: [[8],8,8], expected: 8 },
      { input: [[8,3,10,1,6,null,14],3,10], expected: 27 },
    ],
  },
  {
    id: 'minimum-absolute-difference-bst',
    number: 248,
    title: "Minimum Absolute Difference in BST",
    difficulty: 'Medium',
    topic: "Tree",
    statement:
      "A binary search tree is encoded as a level-order array with `None` for missing nodes (standard LeetCode encoding; children of a missing node are omitted). Return the minimum absolute difference between the values of any two different nodes in the tree. The tree has at least two nodes.",
    explanation:
      "In a BST, an in-order traversal visits values in strictly increasing order. The closest pair of values is therefore always two *consecutive* values in that in-order sequence.\n\nDo an in-order traversal collecting values into a list, then take the minimum difference between adjacent entries. Because the list is sorted, you never need to compare non-adjacent pairs.\n\nO(n) time; O(n) space for the list (or O(h) if you track only the previous value during traversal).",
    functionName: 'min_diff_bst',
    functionSignature: "def min_diff_bst(root: list) -> int:",
    starter:
      STARTER_HEADER + "def min_diff_bst(root: list) -> int:\n    # root is a level-order array of a BST; None marks missing nodes.\n    pass\n",
    examples: [
      { input: [[4,2,6,1,3]], expected: 1 },
      { input: [[1,0,48,null,null,12,49]], expected: 1 },
      { input: [[10,5,15]], expected: 5 },
    ],
    hiddenTests: [
      { input: [[27,null,34,null,58,50,null,44]], expected: 6 },
    ],
  },
  {
    id: 'average-of-levels',
    number: 249,
    title: "Average of Levels in Binary Tree",
    difficulty: 'Easy',
    topic: "Tree",
    statement:
      "A binary tree is encoded as a level-order array with `None` for missing nodes (standard LeetCode encoding; children of a missing node are omitted). Return a list giving the average value of the nodes on each level, from the root level downward.\n\nTo keep the result exact and unambiguous, each average must be an integer (Python `int`) when it divides evenly, and otherwise the exact `float` value of `sum / count`. Return an empty list for an empty tree.",
    explanation:
      "This is a breadth-first (level-order) traversal. Use a queue seeded with the root. Repeatedly process one full level at a time: record the current queue size `n`, pop exactly `n` nodes summing their values while enqueuing their children, then the level average is `sum / n`.\n\nTo match the required output format, emit `int(avg)` when `avg` is a whole number and the plain float otherwise. O(n) time.",
    functionName: 'level_averages',
    functionSignature: "def level_averages(root: list) -> list:",
    starter:
      STARTER_HEADER + "def level_averages(root: list) -> list:\n    # root is a level-order array; None marks missing nodes.\n    pass\n",
    examples: [
      { input: [[3,9,20,null,null,15,7]], expected: [3,14.5,11] },
      { input: [[1]], expected: [1] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[4,8,12]], expected: [4,10] },
      { input: [[1,2,3,4,5]], expected: [1,2.5,4.5] },
    ],
  },
  {
    id: 'maximum-width-of-binary-tree',
    number: 250,
    title: "Maximum Width of Binary Tree",
    difficulty: 'Hard',
    topic: "Tree",
    statement:
      "A binary tree is encoded as a level-order array with `None` for missing nodes (standard LeetCode encoding; children of a missing node are omitted). Return the maximum *width* of the tree.\n\nThe width of a level is the number of positions between its leftmost and rightmost non-`None` nodes **inclusive**, counting the `None` gap positions in between as if this were a complete binary tree. Formally, if the root sits at index 0, a node at index `i` has children at indices `2*i` and `2*i + 1`; a level's width is `rightmost_index - leftmost_index + 1`. Return 0 for an empty tree.",
    explanation:
      "Run a BFS where every queued node carries its positional index as in a complete binary tree: root index 0, and a node at index `i` gives children indices `2*i` and `2*i + 1`.\n\nProcess one level at a time. The first node dequeued on a level holds the leftmost index and the last holds the rightmost index; that level's width is `last - first + 1`. Track the maximum across all levels.\n\nTo avoid overflow in other languages you'd normalize indices per level by subtracting the level's first index, but Python's big integers make that optional. O(n) time.",
    functionName: 'max_width',
    functionSignature: "def max_width(root: list) -> int:",
    starter:
      STARTER_HEADER + "def max_width(root: list) -> int:\n    # root is a level-order array; None marks missing nodes.\n    pass\n",
    examples: [
      { input: [[1,3,2,5,3,null,9]], expected: 4 },
      { input: [[1,3,2,5,null,null,9,6,null,7]], expected: 7 },
      { input: [[1,3,2,5]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[1,1,1,1,1,1,1]], expected: 4 },
    ],
  },
  {
    id: 'count-root-to-leaf-with-sum',
    number: 251,
    title: "Count Root-to-Leaf Paths With Sum",
    difficulty: 'Easy',
    topic: "Tree",
    statement:
      "You're given a binary tree encoded as a level-order array `tree` (using `null` for missing children), and an integer `target`.\n\nA *root-to-leaf path* starts at the root and ends at a leaf (a node with no children). Count how many such paths have node values that add up exactly to `target`, and return that count.\n\nIf the tree is empty, return `0`. Node values may be negative.",
    explanation:
      "Walk from the root toward the leaves while carrying a running sum of the values along the current path.\n\nAt every leaf, check whether the accumulated sum equals `target`; if so, add one to your count. Use DFS (a stack or recursion) so each path's sum is tracked independently.\n\nThis visits each node once: O(n) time, O(h) extra space for the traversal, where h is the tree height.",
    functionName: 'count_root_to_leaf_with_sum',
    functionSignature: "def count_root_to_leaf_with_sum(tree: list, target: int) -> int:",
    starter:
      STARTER_HEADER + "def count_root_to_leaf_with_sum(tree: list, target: int) -> int:\n    pass\n",
    examples: [
      { input: [[5,4,8,11,null,13,4,7,2,null,null,null,1],22], expected: 1 },
      { input: [[1,2,3,4,null,null,3],7], expected: 2 },
      { input: [[],0], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1,2,3],3], expected: 1 },
      { input: [[1,2],1], expected: 0 },
      { input: [[-2,null,-3],-5], expected: 1 },
      { input: [[1,-2,-3,1,3,-2,null,-1],2], expected: 1 },
    ],
  },
  {
    id: 'tree-diameter-edges',
    number: 252,
    title: "Tree Diameter (Edge Count)",
    difficulty: 'Medium',
    topic: "Tree",
    statement:
      "You're given a binary tree encoded as a level-order array `tree` (using `null` for missing children).\n\nThe *diameter* of the tree is the length of the longest path between any two nodes, measured as the number of **edges** on that path. This path may or may not pass through the root.\n\nReturn the diameter. A tree with 0 or 1 node has diameter `0`.",
    explanation:
      "For any single node, the longest path that bends at that node equals (height of its left subtree) + (height of its right subtree), counted in edges.\n\nDo one post-order DFS that returns each subtree's height. While unwinding, update a running maximum with `leftHeight + rightHeight` at every node. The overall maximum is the diameter.\n\nComputing height and diameter together avoids recomputation: O(n) time, O(h) recursion depth.",
    functionName: 'tree_diameter',
    functionSignature: "def tree_diameter(tree: list) -> int:",
    starter:
      STARTER_HEADER + "def tree_diameter(tree: list) -> int:\n    pass\n",
    examples: [
      { input: [[1,2,3,4,5]], expected: 3 },
      { input: [[1,2]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1]], expected: 0 },
      { input: [[4,-7,-3,null,null,-9,-3,9,-7,-4,null,6,null,-6,-6,null,null,0,6,5,null,9,null,null,-1,-4,null,null,null,-2]], expected: 8 },
    ],
  },
  {
    id: 'lca-bst-value',
    number: 253,
    title: "Lowest Common Ancestor in a BST (Value)",
    difficulty: 'Medium',
    topic: "Tree",
    statement:
      "You're given a **binary search tree** encoded as a level-order array `tree` (using `null` for missing children), and two values `p` and `q` that are both present in the tree.\n\nReturn the **value** of the lowest common ancestor (LCA) of `p` and `q` — the deepest node that has both `p` and `q` somewhere in its subtree (a node can be an ancestor of itself).\n\nAssume the tree obeys the BST property: every value in a node's left subtree is smaller than the node, and every value in its right subtree is larger. All values are distinct.",
    explanation:
      "Because it's a BST, you don't need to search both subtrees. Start at the root and compare.\n\nIf both `p` and `q` are smaller than the current node, the LCA lies to the left. If both are larger, it lies to the right. The moment the current node sits between them (or equals one of them), that node is the split point — the LCA.\n\nThis walks a single path down the tree: O(h) time, O(1) extra space.",
    functionName: 'lca_bst',
    functionSignature: "def lca_bst(tree: list, p: int, q: int) -> int:",
    starter:
      STARTER_HEADER + "def lca_bst(tree: list, p: int, q: int) -> int:\n    pass\n",
    examples: [
      { input: [[6,2,8,0,4,7,9,null,null,3,5],2,8], expected: 6 },
      { input: [[6,2,8,0,4,7,9,null,null,3,5],2,4], expected: 2 },
      { input: [[2,1],2,1], expected: 2 },
    ],
    hiddenTests: [
      { input: [[5,3,8,2,4,7,9],7,9], expected: 8 },
      { input: [[5,3,8,2,4,7,9],2,4], expected: 3 },
    ],
  },
  {
    id: 'build-tree-preorder-inorder',
    number: 254,
    title: "Rebuild Tree From Preorder and Inorder",
    difficulty: 'Hard',
    topic: "Tree",
    statement:
      "You're given two integer lists, `preorder` and `inorder`, representing the preorder and inorder traversals of the same binary tree. All node values are distinct.\n\nReconstruct the tree and return it as a **level-order array** (breadth-first), using `null` for missing children, with any trailing `null` entries trimmed off.\n\nFor example, preorder `[3,9,20,15,7]` and inorder `[9,3,15,20,7]` rebuild to the level-order encoding `[3,9,20,null,null,15,7]`.",
    explanation:
      "The first element of `preorder` is always the root. Find that value in `inorder`: everything to its left belongs to the left subtree, everything to its right to the right subtree.\n\nRecurse, consuming preorder values in order (the next preorder value is the next subtree's root). A hash map from value to inorder index makes the split O(1) instead of scanning.\n\nAfter building the tree, run a BFS to emit the level-order array, appending `null` for absent children, then strip trailing `null`s. Construction is O(n).",
    functionName: 'build_tree_preorder_inorder',
    functionSignature: "def build_tree_preorder_inorder(preorder: list, inorder: list) -> list:",
    starter:
      STARTER_HEADER + "def build_tree_preorder_inorder(preorder: list, inorder: list) -> list:\n    pass\n",
    examples: [
      { input: [[3,9,20,15,7],[9,3,15,20,7]], expected: [3,9,20,null,null,15,7] },
      { input: [[-1],[-1]], expected: [-1] },
      { input: [[1,2,3],[2,1,3]], expected: [1,2,3] },
    ],
    hiddenTests: [
      { input: [[1,2],[2,1]], expected: [1,2] },
      { input: [[1,2],[1,2]], expected: [1,null,2] },
    ],
  },
  {
    id: 'largest-island-area',
    number: 255,
    title: "Largest Island Area",
    difficulty: 'Medium',
    topic: "Graph",
    statement:
      "You're given a 2D grid of `0`s (water) and `1`s (land). An island is a group of `1`s connected 4-directionally (up, down, left, right). Return the number of cells in the largest island, or `0` if the grid has no land.\n\nThe grid may be empty or contain empty rows.",
    explanation:
      "This is a connected-components sweep on a grid. Walk every cell; when you find unvisited land, flood-fill from it (DFS or BFS) counting how many land cells are reachable, marking each visited so you never recount it.\n\nTrack the maximum island size you find across the whole scan. Each cell is visited a constant number of times, so the algorithm runs in O(rows x cols).\n\nUse a stack/queue or recursion for the flood fill, and a visited matrix (or mutate the grid in place) to avoid revisiting cells.",
    functionName: 'largest_island',
    functionSignature: "def largest_island(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def largest_island(grid: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[1,1,0],[0,1,0],[0,0,1]]], expected: 3 },
      { input: [[[0,0],[0,0]]], expected: 0 },
      { input: [[[1,0,1],[0,0,0],[1,1,1]]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: 1 },
      { input: [[[1,1,1],[1,1,1]]], expected: 6 },
      { input: [[]], expected: 0 },
    ],
  },
  {
    id: 'is-graph-bipartite',
    number: 256,
    title: "Is Graph Bipartite",
    difficulty: 'Medium',
    topic: "Graph",
    statement:
      "You're given `n` nodes labeled `0..n-1` and a list of undirected `edges`. Return `true` if the graph is bipartite — meaning you can split the nodes into two groups such that every edge connects a node in one group to a node in the other — and `false` otherwise.\n\nThe graph may be disconnected. Nodes with no edges are always placeable.",
    explanation:
      "A graph is bipartite exactly when it has no odd-length cycle. Detect this with a 2-coloring: try to color every node one of two colors so that no edge connects two same-colored nodes.\n\nRun BFS (or DFS) from each uncolored node. Color the start, then color each neighbor the opposite color. If you ever reach a neighbor already colored the same as the current node, the graph is not bipartite.\n\nBecause the graph may be disconnected, loop over all nodes and start a fresh traversal from any that remain uncolored. Runs in O(n + e).",
    functionName: 'is_bipartite',
    functionSignature: "def is_bipartite(n: int, edges: list[list[int]]) -> bool:",
    starter:
      STARTER_HEADER + "def is_bipartite(n: int, edges: list[list[int]]) -> bool:\n    pass\n",
    examples: [
      { input: [4,[[0,1],[1,2],[2,3],[3,0]]], expected: true },
      { input: [3,[[0,1],[1,2],[2,0]]], expected: false },
      { input: [2,[[0,1]]], expected: true },
    ],
    hiddenTests: [
      { input: [3,[]], expected: true },
      { input: [5,[[0,1],[1,2],[0,2]]], expected: false },
      { input: [6,[[0,1],[2,3],[4,5]]], expected: true },
    ],
  },
  {
    id: 'minimum-semesters-courses',
    number: 257,
    title: "Minimum Semesters to Finish Courses",
    difficulty: 'Medium',
    topic: "Graph",
    statement:
      "There are `n` courses labeled `0..n-1`. `prerequisites[i] = [course, pre]` means you must finish `pre` before taking `course`. In one semester you may take any number of courses whose prerequisites are all already completed.\n\nReturn the minimum number of semesters needed to finish every course. If the prerequisites form a cycle (making it impossible), return `-1`.",
    explanation:
      "This is a layered topological sort (Kahn's algorithm), where each BFS layer corresponds to one semester.\n\nBuild an adjacency list from `pre -> course` and an indegree count for each course. Seed a queue with every course of indegree 0 — those can be taken in semester 1.\n\nProcess the queue layer by layer: for each course popped, decrement its neighbors' indegrees, enqueuing any that reach 0 (they become available next semester). Count how many layers you process and how many courses you complete.\n\nIf you complete all `n` courses, return the layer count; otherwise a cycle blocked some courses, so return `-1`.",
    functionName: 'min_semesters',
    functionSignature: "def min_semesters(n: int, prerequisites: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def min_semesters(n: int, prerequisites: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [3,[[1,0],[2,1]]], expected: 3 },
      { input: [3,[]], expected: 1 },
      { input: [2,[[0,1],[1,0]]], expected: -1 },
    ],
    hiddenTests: [
      { input: [4,[[1,0],[2,0],[3,1],[3,2]]], expected: 3 },
      { input: [1,[]], expected: 1 },
      { input: [5,[[1,0],[2,0],[3,0],[4,0]]], expected: 2 },
    ],
  },
  {
    id: 'shortest-path-unweighted',
    number: 258,
    title: "Shortest Path in Unweighted Graph",
    difficulty: 'Easy',
    topic: "Graph",
    statement:
      "You're given `n` nodes labeled `0..n-1`, a list of undirected `edges`, and two nodes `src` and `dst`. Return the number of edges on the shortest path from `src` to `dst`. If `dst` is unreachable from `src`, return `-1`. If `src == dst`, return `0`.",
    explanation:
      "In an unweighted graph, breadth-first search finds shortest paths because it explores nodes in increasing order of distance from the source.\n\nBuild an adjacency list. Start BFS from `src` with distance 0, tracking each node's distance as you first reach it. When you dequeue a node, relax each unvisited neighbor with `dist + 1` and enqueue it. The first time you reach `dst`, that distance is optimal.\n\nIf BFS finishes without ever reaching `dst`, it's disconnected from `src`, so return `-1`. Runs in O(n + e).",
    functionName: 'shortest_path',
    functionSignature: "def shortest_path(n: int, edges: list[list[int]], src: int, dst: int) -> int:",
    starter:
      STARTER_HEADER + "def shortest_path(n: int, edges: list[list[int]], src: int, dst: int) -> int:\n    pass\n",
    examples: [
      { input: [5,[[0,1],[1,2],[2,3],[3,4]],0,4], expected: 4 },
      { input: [4,[[0,1],[2,3]],0,3], expected: -1 },
      { input: [6,[[0,1],[0,2],[1,3],[2,3],[3,5]],0,5], expected: 3 },
    ],
    hiddenTests: [
      { input: [3,[[0,1],[1,2],[0,2]],0,2], expected: 1 },
      { input: [1,[],0,0], expected: 0 },
      { input: [4,[[0,1],[1,2],[2,3],[0,3]],0,3], expected: 1 },
    ],
  },
  {
    id: 'reach-all-nodes',
    number: 259,
    title: "Reach All Nodes",
    difficulty: 'Easy',
    topic: "Graph",
    statement:
      "You're given `n` nodes labeled `0..n-1` and a list of directed `roads`, where `roads[i] = [a, b]` means there is a one-way road from `a` to `b`. Starting only at node `0`, return `true` if you can reach every node in the graph by following roads, and `false` otherwise.",
    explanation:
      "This is a directed reachability check via a single traversal from the start node.\n\nBuild a directed adjacency list (only `a -> b`, not both ways). Run DFS or BFS from node `0`, marking every node you can reach in a visited set.\n\nAfter the traversal, if the visited set contains all `n` nodes, then every node is reachable from `0` — return `true`. Otherwise some node could never be reached, so return `false`. The traversal touches each node and edge once, giving O(n + e).",
    functionName: 'can_finish_all',
    functionSignature: "def can_finish_all(n: int, roads: list[list[int]]) -> bool:",
    starter:
      STARTER_HEADER + "def can_finish_all(n: int, roads: list[list[int]]) -> bool:\n    pass\n",
    examples: [
      { input: [4,[[0,1],[1,2],[2,3]]], expected: true },
      { input: [3,[[0,1]]], expected: false },
      { input: [1,[]], expected: true },
    ],
    hiddenTests: [
      { input: [4,[[0,1],[0,2],[0,3]]], expected: true },
      { input: [3,[[0,1],[2,0]]], expected: false },
      { input: [5,[[0,1],[1,2],[1,3],[3,4]]], expected: true },
    ],
  },
  {
    id: 'minimum-hops',
    number: 260,
    title: "Minimum Hops Between Cities",
    difficulty: 'Medium',
    topic: "Graph",
    statement:
      "You're given `n` cities numbered `0` to `n-1` and a list `edges` where each `[a, b]` is a two-way road connecting cities `a` and `b`. Starting at city `start`, return the fewest roads you must travel to reach city `target`.\n\nEvery road has the same cost (one hop). If `target` cannot be reached from `start`, return `-1`. If `start == target`, the answer is `0`.",
    explanation:
      "Since every edge costs the same, the shortest path is measured in number of edges, and breadth-first search finds it. BFS explores the graph in waves: all cities one hop away, then two hops, and so on. The first time you dequeue the target, its recorded distance is optimal.\n\nBuild an adjacency list (roads are undirected, so add both directions). Run BFS from `start`, tracking distance and a visited set so you never revisit a city. Return the distance when you reach `target`, or `-1` if the queue empties first.\n\nTime O(V + E), space O(V + E).",
    functionName: 'minimum_hops',
    functionSignature: "def minimum_hops(n: int, edges: list[list[int]], start: int, target: int) -> int:",
    starter:
      STARTER_HEADER + "def minimum_hops(n: int, edges: list[list[int]], start: int, target: int) -> int:\n    pass\n",
    examples: [
      { input: [6,[[0,1],[1,2],[2,3],[0,4],[4,3],[3,5]],0,5], expected: 3 },
      { input: [4,[[0,1],[2,3]],0,3], expected: -1 },
      { input: [1,[],0,0], expected: 0 },
    ],
    hiddenTests: [
      { input: [5,[[0,1],[1,2],[2,3],[3,4]],0,4], expected: 4 },
      { input: [5,[[0,1],[0,2],[1,3],[2,3],[3,4]],0,4], expected: 3 },
      { input: [3,[[0,1],[1,2],[0,2]],2,0], expected: 1 },
    ],
  },
  {
    id: 'count-redundant-bridges',
    number: 261,
    title: "Count Redundant Bridges",
    difficulty: 'Medium',
    topic: "Graph",
    statement:
      "A network has `n` nodes numbered `0` to `n-1`. Cables are installed one at a time, given as `connections` where each `[a, b]` links nodes `a` and `b`. A cable is **redundant** if, at the moment it is installed, its two endpoints are already connected (directly or indirectly) by cables installed earlier.\n\nProcess the cables in the given order and return how many of them are redundant.",
    explanation:
      "This is a classic union-find (disjoint set union) problem. Maintain a parent array where each node points toward a representative of its connected component. `find(x)` walks to the root (with path compression to keep it fast); two nodes are already connected exactly when they share a root.\n\nFor each cable `[a, b]`: find both roots. If they're equal, the endpoints were already connected, so this cable is redundant — increment the counter. Otherwise, union the two components by pointing one root at the other.\n\nTime O(E · α(n)) which is effectively linear, space O(n).",
    functionName: 'count_redundant_bridges',
    functionSignature: "def count_redundant_bridges(n: int, connections: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def count_redundant_bridges(n: int, connections: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [4,[[0,1],[1,2],[2,3]]], expected: 0 },
      { input: [3,[[0,1],[1,2],[0,2]]], expected: 1 },
      { input: [4,[[0,1],[0,1],[2,3],[2,3]]], expected: 2 },
    ],
    hiddenTests: [
      { input: [5,[[0,1],[1,2],[3,4]]], expected: 0 },
      { input: [3,[]], expected: 0 },
      { input: [6,[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3]]], expected: 2 },
    ],
  },
  {
    id: 'has-deadlock',
    number: 262,
    title: "Detect Task Deadlock",
    difficulty: 'Hard',
    topic: "Graph",
    statement:
      "You manage `n` tasks numbered `0` to `n-1`. The list `prerequisites` contains pairs `[a, b]` meaning task `a` must wait for task `b` to finish first (a directed dependency from `a` to `b`).\n\nA deadlock occurs when the dependencies form a cycle, so a group of tasks can never start. Return `true` if the dependency graph contains any cycle, otherwise `false`. A self-dependency `[a, a]` counts as a cycle.",
    explanation:
      "Cycle detection in a directed graph uses a three-color DFS. Each node is white (unvisited), gray (currently on the recursion stack), or black (fully explored). If DFS ever reaches a gray node, you've looped back onto the current path — that's a cycle.\n\nBuild an adjacency list from the directed edges. For every unvisited node, run DFS: mark it gray, recurse into neighbors, and if any neighbor is gray (or a deeper call reports a cycle), return true. When all neighbors are exhausted, mark the node black. A self-edge `[a, a]` is detected because `a` is gray when its own neighbor `a` is examined.\n\nTime O(V + E), space O(V + E).",
    functionName: 'has_deadlock',
    functionSignature: "def has_deadlock(n: int, prerequisites: list[list[int]]) -> bool:",
    starter:
      STARTER_HEADER + "def has_deadlock(n: int, prerequisites: list[list[int]]) -> bool:\n    pass\n",
    examples: [
      { input: [3,[[0,1],[1,2]]], expected: false },
      { input: [3,[[0,1],[1,2],[2,0]]], expected: true },
      { input: [1,[[0,0]]], expected: true },
    ],
    hiddenTests: [
      { input: [2,[]], expected: false },
      { input: [4,[[0,1],[1,2],[2,3],[3,1]]], expected: true },
      { input: [5,[[0,1],[0,2],[1,3],[2,3],[3,4]]], expected: false },
    ],
  },
  {
    id: 'min-jump-cost-climb',
    number: 263,
    title: "Triple-Step Climb Cost",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "You are climbing a staircase where `cost[i]` is the fee charged when you stand on step `i`. From any step you may jump forward `1`, `2`, or `3` steps. You may begin by standing on either step `0` or step `1` (paying that step's fee). The top of the staircase is the position just past the last step. Return the minimum total fee needed to reach the top.\n\nIf the list is empty, the top is already reached, so return `0`.",
    explanation:
      "Work from the top down. Let `dp[i]` be the minimum fee to reach the top starting from step `i`. From step `i` you pay `cost[i]` and then jump 1, 2, or 3 steps, so `dp[i] = cost[i] + min(dp[i+1], dp[i+2], dp[i+3])`, where any index at or beyond the top contributes `0`.\n\nFill `dp` from the last real step backward. Since you may start on step 0 or step 1, the answer is `min(dp[0], dp[1])` (or just `dp[0]` when there is only one step). This is O(n) time and O(n) space.",
    functionName: 'min_jump_cost',
    functionSignature: "def min_jump_cost(cost: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def min_jump_cost(cost: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[10,15,20]], expected: 10 },
      { input: [[1,100,1,1,1,100,1,1,100,1]], expected: 4 },
      { input: [[5]], expected: 5 },
    ],
    hiddenTests: [
      { input: [[0,0,0,0]], expected: 0 },
      { input: [[1,2,3,4,5,6]], expected: 5 },
      { input: [[10,15,20,17,2,5]], expected: 17 },
    ],
  },
  {
    id: 'rob-with-rest',
    number: 264,
    title: "Robber's Rest Days",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "A row of houses has loot values in `nums`. If you rob house `i`, the alarm forces you to skip the next two houses, so the earliest house you may rob afterward is house `i + 3`. Return the maximum total loot you can collect.\n\nReturn `0` for an empty list.",
    explanation:
      "This is the House Robber pattern with a larger cooldown gap. Let `dp[i]` be the best loot considering houses `0..i`.\n\nAt house `i` you either skip it (keeping `dp[i-1]`) or rob it, which forces the previous robbery to be at most house `i-3`: `nums[i] + dp[i-3]`. So `dp[i] = max(dp[i-1], nums[i] + dp[i-3])`, treating out-of-range indices as `0`. The answer is `dp[n-1]`. O(n) time, O(n) space.",
    functionName: 'rob_with_rest',
    functionSignature: "def rob_with_rest(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def rob_with_rest(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[2,7,9,3,1]], expected: 9 },
      { input: [[1,2,3,1]], expected: 3 },
      { input: [[10,1,1,10]], expected: 20 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[5,5,5,5,5,5]], expected: 10 },
    ],
  },
  {
    id: 'coin-change-ways',
    number: 265,
    title: "Coin Change Combinations",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "You have unlimited supplies of coins with the denominations listed in `coins`, and you want to make up exactly `amount`. Return the number of distinct combinations of coins that sum to `amount`. Two combinations are the same if they use the same multiset of coins, regardless of order (so `[1,2]` and `[2,1]` count once).\n\nIf `amount` is `0`, there is exactly one combination (use no coins).",
    explanation:
      "This is the classic unbounded-knapsack counting problem. Let `dp[a]` be the number of combinations that sum to `a`, and initialize `dp[0] = 1`.\n\nTo count combinations (not permutations), iterate coins in the outer loop and amounts in the inner loop: for each coin `c`, add `dp[a - c]` to `dp[a]` for every `a` from `c` to `amount`. Processing one coin fully before the next guarantees each multiset is counted a single time. The answer is `dp[amount]`. O(len(coins) * amount) time.",
    functionName: 'coin_ways',
    functionSignature: "def coin_ways(coins: list[int], amount: int) -> int:",
    starter:
      STARTER_HEADER + "def coin_ways(coins: list[int], amount: int) -> int:\n    pass\n",
    examples: [
      { input: [[1,2,5],5], expected: 4 },
      { input: [[2],3], expected: 0 },
      { input: [[10],10], expected: 1 },
    ],
    hiddenTests: [
      { input: [[1,2,3],4], expected: 4 },
      { input: [[3,5,7,8,9,10,11],0], expected: 1 },
    ],
  },
  {
    id: 'longest-non-decreasing-subseq',
    number: 266,
    title: "Longest Non-Decreasing Subsequence",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "Given an integer array `nums`, return the length of the longest subsequence whose values are non-decreasing (each chosen element is greater than or equal to the previous chosen element). Unlike the strictly increasing version, equal values may be kept together.\n\nA subsequence keeps the original order but may drop elements. Return `0` for an empty array.",
    explanation:
      "This is a variant of Longest Increasing Subsequence that allows equal values. The O(n log n) patience-sorting approach keeps a `tails` array where `tails[k]` is the smallest possible tail of a non-decreasing subsequence of length `k+1`.\n\nFor each value `x`, find the first tail strictly greater than `x` using an upper-bound binary search (`bisect_right`). If none exists, `x` extends the longest run so append it; otherwise replace that tail with `x`. Using upper-bound (rather than lower-bound) is what permits equal elements to accumulate. The answer is `len(tails)`.",
    functionName: 'longest_non_decreasing',
    functionSignature: "def longest_non_decreasing(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def longest_non_decreasing(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[1,3,2,3,4]], expected: 4 },
      { input: [[5,5,5,5]], expected: 4 },
      { input: [[10,9,8,7]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1,2,2,3,1,4]], expected: 5 },
    ],
  },
  {
    id: 'delete-and-earn-points',
    number: 267,
    title: "Delete and Earn Points",
    difficulty: 'Hard',
    topic: "Dynamic Programming",
    statement:
      "You are given an array `nums`. In one operation you pick any value `v` present in the array, earn `v` points for every copy of `v` (i.e. `v * count(v)`), and then must delete every element equal to `v - 1` and every element equal to `v + 1` from the array. You may repeat operations until the array is empty. Return the maximum total points you can earn.\n\nReturn `0` for an empty array. All values are non-negative integers.",
    explanation:
      "Choosing value `v` earns `v * count(v)` but forbids ever choosing `v-1` or `v+1`. If you total up points by value, this collapses to a House Robber problem over the number line: taking value `v` blocks its adjacent values.\n\nCount occurrences, then let `gain[v] = v * count(v)`. Over values `0..max`, set `dp[v] = max(dp[v-1], dp[v-2] + gain[v])` — either skip `v` or take it and add the best up to `v-2`. The answer is `dp[max]`. This runs in O(n + max) time.",
    functionName: 'delete_and_earn',
    functionSignature: "def delete_and_earn(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def delete_and_earn(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[3,4,2]], expected: 6 },
      { input: [[2,2,3,3,3,4]], expected: 9 },
      { input: [[1,1,1,2,4,5,5,5,6]], expected: 18 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[8]], expected: 8 },
    ],
  },
  {
    id: 'unique-paths-with-obstacles',
    number: 268,
    title: "Unique Paths With Obstacles",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "A robot sits in the top-left corner of an `m x n` grid and wants to reach the bottom-right corner. It can only move **right** or **down** one cell at a time.\n\nThe grid is given as a 2D list where `0` marks an open cell and `1` marks an obstacle the robot cannot enter. Return the number of distinct paths from the top-left to the bottom-right cell.\n\nIf the start or the destination cell is itself an obstacle, no path exists and the answer is `0`.",
    explanation:
      "This is the classic grid-path count with blockers. Let `dp[i][j]` be the number of ways to reach cell `(i, j)`.\n\nAn obstacle contributes `0` ways. Otherwise a cell is reachable only from the cell above and the cell to its left, so `dp[i][j] = dp[i-1][j] + dp[i][j-1]` (treating out-of-bounds neighbors as `0`). Seed the start cell with `1` when it is open.\n\nFill the table row by row for O(m·n) time. The answer is `dp[m-1][n-1]`.",
    functionName: 'unique_paths_grid',
    functionSignature: "def unique_paths_grid(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def unique_paths_grid(grid: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[0,0,0],[0,1,0],[0,0,0]]], expected: 2 },
      { input: [[[0,1],[0,0]]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[[0,0],[1,1],[0,0]]], expected: 0 },
      { input: [[[0]]], expected: 1 },
      { input: [[[1]]], expected: 0 },
      { input: [[[0,0,0],[0,0,0],[0,0,0]]], expected: 6 },
    ],
  },
  {
    id: 'minimum-path-sum',
    number: 269,
    title: "Minimum Path Sum",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "You're given an `m x n` grid of non-negative integers. Starting from the top-left cell and moving only **right** or **down**, reach the bottom-right cell.\n\nThe cost of a path is the sum of all values on the cells it visits (including both endpoints). Return the minimum possible path cost.",
    explanation:
      "Let `dp[i][j]` be the cheapest cost to arrive at cell `(i, j)`.\n\nThe first cell costs `grid[0][0]`. Cells in the first row can only be reached from the left, and cells in the first column only from above. Every other cell picks the cheaper of its top and left predecessor: `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`.\n\nFilling the grid takes O(m·n) time, and the answer is the bottom-right entry.",
    functionName: 'min_path_sum',
    functionSignature: "def min_path_sum(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def min_path_sum(grid: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[1,3,1],[1,5,1],[4,2,1]]], expected: 7 },
      { input: [[[1,2,3],[4,5,6]]], expected: 12 },
    ],
    hiddenTests: [
      { input: [[[5]]], expected: 5 },
      { input: [[[1,2],[1,1]]], expected: 3 },
      { input: [[[1,1,1,1]]], expected: 4 },
    ],
  },
  {
    id: 'knapsack-max-value',
    number: 270,
    title: "0/1 Knapsack Max Value",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "You have `n` items. Item `i` has weight `weights[i]` and value `values[i]` (both lists have the same length). You also have a knapsack that can carry a total weight of at most `capacity`.\n\nEach item can be taken **at most once** (0/1 choice). Return the maximum total value you can pack without exceeding the capacity.",
    explanation:
      "This is the textbook 0/1 knapsack. Think of a 2D table where `dp[i][c]` is the best value using the first `i` items with capacity budget `c`. For each item you either skip it or take it (if it fits): `dp[i][c] = max(dp[i-1][c], dp[i-1][c-w] + v)`.\n\nBecause each row only reads the row above, you can compress to a single array `dp[0..capacity]` and iterate capacity **downward** for each item so an item isn't reused within the same pass.\n\nRuntime is O(n·capacity).",
    functionName: 'knapsack_max_value',
    functionSignature: "def knapsack_max_value(weights: list[int], values: list[int], capacity: int) -> int:",
    starter:
      STARTER_HEADER + "def knapsack_max_value(weights: list[int], values: list[int], capacity: int) -> int:\n    pass\n",
    examples: [
      { input: [[1,3,4,5],[1,4,5,7],7], expected: 9 },
      { input: [[2,3,4],[3,4,5],5], expected: 7 },
    ],
    hiddenTests: [
      { input: [[1,2,3],[6,10,12],5], expected: 22 },
      { input: [[4,5,6],[10,20,30],3], expected: 0 },
      { input: [[1],[100],0], expected: 0 },
    ],
  },
  {
    id: 'longest-common-substring',
    number: 271,
    title: "Longest Common Substring",
    difficulty: 'Medium',
    topic: "Dynamic Programming",
    statement:
      "Given two strings `a` and `b`, return the length of the longest string that appears as a **contiguous** substring in both.\n\nUnlike a subsequence, the matched characters must be consecutive in each string. If the two strings share no common substring, return `0`.",
    explanation:
      "Be careful: this is a *substring* (contiguous), not a subsequence. Let `dp[i][j]` be the length of the longest common substring that **ends exactly at** `a[i-1]` and `b[j-1]`.\n\nIf `a[i-1] == b[j-1]`, then `dp[i][j] = dp[i-1][j-1] + 1`; otherwise the run breaks and `dp[i][j] = 0`. Track the maximum value seen anywhere in the table — that's the answer, since the best substring can end at any pair of positions.\n\nO(m·n) time and space.",
    functionName: 'longest_common_substring',
    functionSignature: "def longest_common_substring(a: str, b: str) -> int:",
    starter:
      STARTER_HEADER + "def longest_common_substring(a: str, b: str) -> int:\n    pass\n",
    examples: [
      { input: ["abcde","abfde"], expected: 2 },
      { input: ["ABABC","BABCA"], expected: 4 },
    ],
    hiddenTests: [
      { input: ["abc","xyz"], expected: 0 },
      { input: ["","abc"], expected: 0 },
      { input: ["aaaa","aa"], expected: 2 },
    ],
  },
  {
    id: 'min-deletions-to-equal',
    number: 272,
    title: "Minimum Deletions to Make Equal",
    difficulty: 'Hard',
    topic: "Dynamic Programming",
    statement:
      "Given two strings `a` and `b`, you may delete characters from either string. Return the **minimum total number of deletions** (counting deletions from both strings) required so that the two strings become identical.\n\nDeleting a character removes it and closes the gap; the relative order of the remaining characters is preserved.",
    explanation:
      "The characters that survive in both strings must form a common subsequence, and to minimize deletions you want to keep as many as possible — the **longest common subsequence** (LCS).\n\nCompute the LCS length with the standard 2D DP: if `a[i-1] == b[j-1]` then `dp[i][j] = dp[i-1][j-1] + 1`, else `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.\n\nEverything not in the LCS must be deleted, so the answer is `(len(a) - lcs) + (len(b) - lcs)`. Runtime O(m·n).",
    functionName: 'min_deletions_to_equal',
    functionSignature: "def min_deletions_to_equal(a: str, b: str) -> int:",
    starter:
      STARTER_HEADER + "def min_deletions_to_equal(a: str, b: str) -> int:\n    pass\n",
    examples: [
      { input: ["sea","eat"], expected: 2 },
      { input: ["leetcode","etco"], expected: 4 },
    ],
    hiddenTests: [
      { input: ["abc","abc"], expected: 0 },
      { input: ["","abc"], expected: 3 },
      { input: ["a","b"], expected: 2 },
    ],
  },
  {
    id: 'kth-largest-after-each',
    number: 273,
    title: "Kth Largest After Each Number",
    difficulty: 'Medium',
    topic: "Heap",
    statement:
      "You process a stream of integers `nums` one at a time. For a fixed integer `k`, after reading each number report the `k`-th largest value seen so far.\n\nReturn a list `out` of the same length as `nums`, where `out[i]` is the `k`-th largest value among `nums[0..i]` (inclusive). If fewer than `k` numbers have been seen at position `i`, use `null` for that entry.\n\nDuplicates count as distinct elements when ranking. For example, in `[5, 5, 5]` the 2nd largest is `5`.",
    explanation:
      "A min-heap of size `k` is the classic tool for tracking the k-th largest.\n\nPush every incoming number onto a min-heap. Whenever the heap grows past size `k`, pop the smallest — this keeps only the `k` largest values seen so far. Once the heap holds exactly `k` elements, its root (the smallest of those k) is precisely the k-th largest overall. Before the heap reaches size `k`, record `null`.\n\nEach step is O(log k), giving O(n log k) total time.",
    functionName: 'kth_largest_after_each',
    functionSignature: "def kth_largest_after_each(k: int, nums: list[int]) -> list:",
    starter:
      STARTER_HEADER + "def kth_largest_after_each(k: int, nums: list[int]) -> list:\n    pass\n",
    examples: [
      { input: [2,[4,5,8,2]], expected: [null,4,5,5] },
      { input: [1,[3,1,2]], expected: [3,3,3] },
      { input: [3,[1,2]], expected: [null,null] },
    ],
    hiddenTests: [
      { input: [2,[10,20,30,40,50]], expected: [null,10,20,30,40] },
      { input: [3,[5,5,5,5]], expected: [null,null,5,5] },
      { input: [1,[-1,-2,-3]], expected: [-1,-1,-1] },
      { input: [2,[7,7,3,9,9]], expected: [null,7,7,7,9] },
    ],
  },
  {
    id: 'k-way-merge-sorted-lists',
    number: 274,
    title: "K-Way Merge Into One Sorted List",
    difficulty: 'Medium',
    topic: "Heap",
    statement:
      "You're given `lists`, a list of individually sorted (non-decreasing) integer lists. Merge them all into a single non-decreasing list and return it.\n\nAny of the inner lists may be empty, and `lists` itself may be empty; in those cases return an empty list `[]`. The result must be fully sorted in non-decreasing order, and every value from every input list must appear (duplicates included).",
    explanation:
      "Concatenating and sorting works but ignores the fact that each list is already sorted. A k-way merge with a min-heap does better.\n\nSeed a min-heap with the first element of each non-empty list, tagged with which list it came from and its index. Repeatedly pop the smallest `(value, list_index, elem_index)`, append the value to the output, and push the next element from that same list (if any). Tagging with `list_index` keeps comparisons well-defined even when values tie.\n\nWith `N` total elements across `k` lists, this runs in O(N log k) time.",
    functionName: 'merge_sorted_lists',
    functionSignature: "def merge_sorted_lists(lists: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def merge_sorted_lists(lists: list[list[int]]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[[1,4,5],[1,3,4],[2,6]]], expected: [1,1,2,3,4,4,5,6] },
      { input: [[]], expected: [] },
      { input: [[[5],[1,2,3],[4]]], expected: [1,2,3,4,5] },
    ],
    hiddenTests: [
      { input: [[[],[]]], expected: [] },
      { input: [[[-3,-1],[-2,0,2]]], expected: [-3,-2,-1,0,2] },
      { input: [[[1,1,1],[1,1]]], expected: [1,1,1,1,1] },
      { input: [[[10],[],[5,15]]], expected: [5,10,15] },
    ],
  },
  {
    id: 'top-k-frequent-words',
    number: 275,
    title: "Top K Frequent Words",
    difficulty: 'Easy',
    topic: "Heap",
    statement:
      "Given a list of strings `words` and an integer `k`, return the `k` most frequently occurring words.\n\nThe answer must be ordered by frequency from highest to lowest. When two words have the same frequency, the one that is smaller in lexicographic (dictionary / alphabetical) order comes first. It is guaranteed that `k` is at most the number of distinct words.",
    explanation:
      "Count occurrences with a hash map, then select the top `k` by a two-part ranking.\n\nThe ranking key is `(-count, word)`: higher counts sort first (via the negation), and for equal counts the lexicographically smaller word wins. Sorting the distinct words by this key and taking the first `k` gives the answer. A bounded heap of size `k` using the same comparison achieves the same result in O(n log k).\n\nDefining the tie-break explicitly makes the output deterministic.",
    functionName: 'top_k_frequent_words',
    functionSignature: "def top_k_frequent_words(words: list[str], k: int) -> list[str]:",
    starter:
      STARTER_HEADER + "def top_k_frequent_words(words: list[str], k: int) -> list[str]:\n    pass\n",
    examples: [
      { input: [["i","love","leetcode","i","love","coding"],2], expected: ["i","love"] },
      { input: [["the","day","is","sunny","the","the","the","sunny","is","is"],4], expected: ["the","is","sunny","day"] },
      { input: [["a","b","c"],2], expected: ["a","b"] },
    ],
    hiddenTests: [
      { input: [["apple","apple","banana"],1], expected: ["apple"] },
      { input: [["z","z","a","a","m"],2], expected: ["a","z"] },
      { input: [["x"],1], expected: ["x"] },
      { input: [["b","a","c","a","b"],3], expected: ["a","b","c"] },
    ],
  },
  {
    id: 'sjf-total-waiting-time',
    number: 276,
    title: "Shortest-Job-First Total Waiting Time",
    difficulty: 'Hard',
    topic: "Heap",
    statement:
      "A single machine must run `jobs`, where each job is a pair `[arrival, duration]`. The machine runs one job at a time and, once started, runs it to completion (no preemption). At every moment the machine becomes free, it picks — among all jobs that have already arrived and are still unstarted — the one with the **shortest duration**; if several tie on duration, it picks the one that arrived earliest.\n\nThe machine starts at time `0`. If no job has arrived yet when the machine is free, it idles until the next arrival. A job's waiting time is `(time it starts) - (its arrival)`.\n\nReturn the total waiting time summed over all jobs.",
    explanation:
      "This is the classic shortest-job-first (non-preemptive) simulation, and a min-heap keyed by duration makes it efficient.\n\nSort jobs by arrival so you can release them into a ready set as the clock advances. Maintain a current `time`. At each free moment, push every job whose arrival is `<= time` into a min-heap ordered by `(duration, arrival)`. If the heap is non-empty, pop the best job, add `time - arrival` to the total, and advance `time` by its duration. If the heap is empty but jobs remain, jump `time` forward to the next arrival.\n\nEach job is pushed and popped once, so the simulation is O(n log n).",
    functionName: 'min_total_waiting',
    functionSignature: "def min_total_waiting(jobs: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def min_total_waiting(jobs: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[0,3],[1,9],[2,6]]], expected: 9 },
      { input: [[[0,1],[0,2],[0,3]]], expected: 4 },
      { input: [[[0,5]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[[0,4],[10,2]]], expected: 0 },
      { input: [[[0,10],[1,1],[2,1]]], expected: 18 },
      { input: [[[5,3],[5,3],[5,3]]], expected: 9 },
      { input: [[[0,2],[3,1],[3,4]]], expected: 1 },
    ],
  },
  {
    id: 'subsets-of-size-k',
    number: 277,
    title: "Subsets of a Fixed Size",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "Given a list of distinct integers `nums` and an integer `k`, return every subset of `nums` that contains exactly `k` elements.\n\nEach subset must list its elements in the same relative order they appear in `nums`. Return the list of subsets in lexicographic order by the index positions chosen — that is, generate them by picking indices in increasing order and never revisiting an earlier index. When `k` is `0`, return `[[]]` (a list containing the single empty subset).\n\nYou may assume `0 <= k <= len(nums)`.",
    explanation:
      "This is a classic combination-generation problem. Use backtracking: keep a `combo` buffer and a `start` index. At each step, if `combo` has reached size `k`, record a copy and return. Otherwise loop `i` from `start` to the end, append `nums[i]`, recurse with `i + 1` (so you never reuse an index and always move forward), then pop to undo.\n\nBecause you always advance the start index, elements stay in their original order and the subsets come out in a canonical, deterministic sequence.",
    functionName: 'subsets_of_size',
    functionSignature: "def subsets_of_size(nums: list[int], k: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def subsets_of_size(nums: list[int], k: int) -> list[list[int]]:\n    pass\n",
    examples: [
      { input: [[1,2,3,4],2], expected: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]] },
      { input: [[1,2,3],3], expected: [[1,2,3]] },
      { input: [[1,2,3],0], expected: [[]] },
    ],
    hiddenTests: [
      { input: [[5,6],1], expected: [[5],[6]] },
      { input: [[1,2,3,4,5],4], expected: [[1,2,3,4],[1,2,3,5],[1,2,4,5],[1,3,4,5],[2,3,4,5]] },
      { input: [[7],1], expected: [[7]] },
    ],
  },
  {
    id: 'unique-permutations',
    number: 278,
    title: "Unique Permutations",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "Given a list of integers `nums` that may contain duplicate values, return all of its distinct permutations — no permutation may appear twice.\n\nReturn the permutations in ascending lexicographic order (compare them element by element as if they were number sequences). For example, `[1,1,2]` comes before `[1,2,1]`, which comes before `[2,1,1]`.",
    explanation:
      "Plain permutation backtracking would emit duplicate arrangements when equal values are present. The fix is two-fold.\n\nFirst, sort `nums` so equal values are adjacent and output naturally lands in lexicographic order. Then backtrack with a `used` boolean array. At each level, iterate over all indices; skip any index already used. Crucially, skip index `i` when `nums[i] == nums[i-1]` and `nums[i-1]` is NOT currently used — this enforces that equal values are always consumed left-to-right, so each distinct multiset arrangement is produced exactly once.\n\nAppend, recurse, then undo (pop and mark unused).",
    functionName: 'unique_permutations',
    functionSignature: "def unique_permutations(nums: list[int]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def unique_permutations(nums: list[int]) -> list[list[int]]:\n    pass\n",
    examples: [
      { input: [[1,1,2]], expected: [[1,1,2],[1,2,1],[2,1,1]] },
      { input: [[1,2,3]], expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] },
      { input: [[2,2]], expected: [[2,2]] },
    ],
    hiddenTests: [
      { input: [[1]], expected: [[1]] },
      { input: [[3,3,0,3]], expected: [[0,3,3,3],[3,0,3,3],[3,3,0,3],[3,3,3,0]] },
    ],
  },
  {
    id: 'combination-sum-reuse',
    number: 279,
    title: "Combination Sum With Reuse",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "Given a list of distinct positive integers `candidates` and a positive integer `target`, return all unique combinations of candidates whose values sum to `target`. Each candidate may be used an unlimited number of times.\n\nTwo combinations are the same if they contain the same multiset of numbers, so do not return duplicates. Within each combination, list the numbers in non-decreasing order. Return the overall list of combinations in ascending lexicographic order (compare them element by element). If no combination sums to `target`, return an empty list.",
    explanation:
      "Sort `candidates` first. Backtrack with a `start` index and a `remaining` amount. When `remaining` hits `0`, record a copy of the current path.\n\nTo allow reuse while avoiding duplicate combinations, when you recurse after choosing `candidates[i]` pass `i` again (not `i + 1`) — you can pick the same value repeatedly, but never step back to a smaller index, so each multiset is generated once and stays sorted.\n\nBecause the array is sorted, once `candidates[i] > remaining` you can `break` the loop early — every later candidate is at least as large. This keeps output in lexicographic order and prunes dead branches.",
    functionName: 'combination_sum',
    functionSignature: "def combination_sum(candidates: list[int], target: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def combination_sum(candidates: list[int], target: int) -> list[list[int]]:\n    pass\n",
    examples: [
      { input: [[2,3,6,7],7], expected: [[2,2,3],[7]] },
      { input: [[2,3,5],8], expected: [[2,2,2,2],[2,3,3],[3,5]] },
      { input: [[2],1], expected: [] },
    ],
    hiddenTests: [
      { input: [[3,4,5],9], expected: [[3,3,3],[4,5]] },
      { input: [[5],10], expected: [[5,5]] },
    ],
  },
  {
    id: 'partition-k-equal-subsets',
    number: 280,
    title: "Partition Into K Equal Sum Subsets",
    difficulty: 'Hard',
    topic: "Backtracking",
    statement:
      "Given a list of positive integers `nums` and an integer `k`, decide whether you can split all of the numbers into exactly `k` non-empty groups such that every group has the same sum. Each number must belong to exactly one group.\n\nReturn `true` if such a partition exists, otherwise `false`.",
    explanation:
      "First reject the impossible cases: if the total is not divisible by `k`, no partition exists, so the per-group target is `total // k`. If any single number exceeds `target`, fail immediately.\n\nSort descending (large numbers first) so bad branches are pruned early, and use a `used` array. Fill one group at a time: keep a running `cur_sum` and a `count` of completed groups. When `cur_sum` reaches `target`, start a fresh group (reset sum, increment count, restart the index at 0). When `count == k`, everything fit — return true.\n\nTwo key optimizations make this tractable: pass a `start` index so a group's members are chosen in increasing index order (avoids permuted duplicates), and if placing an item into an empty group (`cur_sum == 0`) fails, break — that item can never be placed anywhere, so the whole attempt is doomed.",
    functionName: 'can_partition_k_subsets',
    functionSignature: "def can_partition_k_subsets(nums: list[int], k: int) -> bool:",
    starter:
      STARTER_HEADER + "def can_partition_k_subsets(nums: list[int], k: int) -> bool:\n    pass\n",
    examples: [
      { input: [[4,3,2,3,5,2,1],4], expected: true },
      { input: [[1,2,3,4],3], expected: false },
      { input: [[1,1,1,1],2], expected: true },
    ],
    hiddenTests: [
      { input: [[2,2,2,2,3,4,5],4], expected: false },
      { input: [[10,10,10,7,7,7,7,7,7,6,6,6],3], expected: true },
      { input: [[4,3,2,3,5,2,1],1], expected: true },
    ],
  },
  {
    id: 'max-events-attended',
    number: 281,
    title: "Conference Talk Attendance",
    difficulty: 'Medium',
    topic: "Greedy",
    statement:
      "You're given a list of `events`, where each event is a pair `[start, end]` meaning that event runs on every integer day from `start` through `end` (inclusive). To attend an event you must pick exactly one day within its `[start, end]` window, and you can attend at most one event per day.\n\nReturn the maximum number of events you can attend.",
    explanation:
      "This is a classic interval-scheduling problem solved with a greedy heap. Sort events by start day and sweep the calendar day by day.\n\nFor the current day, push the end days of all events whose window has started into a min-heap. Discard any event whose end day has already passed (it can never be attended now). Then greedily attend the available event with the earliest end day — it's the most 'urgent' one, so consuming today's slot on it wastes the least future flexibility.\n\nAdvance the day and repeat until no events remain. Using a min-heap keyed on end day gives O(n log n) time.",
    functionName: 'max_events_attended',
    functionSignature: "def max_events_attended(events: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def max_events_attended(events: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[1,2],[2,3],[3,4]]], expected: 3 },
      { input: [[[1,2],[2,3],[3,4],[1,2]]], expected: 4 },
    ],
    hiddenTests: [
      { input: [[[1,4],[4,4],[2,2],[3,4],[1,1]]], expected: 4 },
      { input: [[[1,1],[1,1],[1,1]]], expected: 1 },
      { input: [[[1,100000]]], expected: 1 },
      { input: [[[1,2],[1,2],[1,2]]], expected: 2 },
    ],
  },
  {
    id: 'can-finish-circuit',
    number: 282,
    title: "Complete the Fuel Loop",
    difficulty: 'Medium',
    topic: "Greedy",
    statement:
      "There are `n` fuel stations arranged in a circle. `gas[i]` is the amount of fuel available at station `i`, and `cost[i]` is the fuel needed to travel from station `i` to the next station (station `i+1`, wrapping around from the last back to the first).\n\nYou start with an empty tank at some station and drive clockwise, filling up at each station you visit. Return the smallest starting index from which you can drive all the way around the circuit exactly once without the tank ever going negative. If no such start exists, return `-1`.",
    explanation:
      "Two greedy facts make this O(n).\n\nFirst, feasibility: if the total fuel `sum(gas)` is at least the total cost `sum(cost)`, a valid start is guaranteed; otherwise return -1.\n\nSecond, finding it: sweep once tracking a running tank of `gas[i] - cost[i]`. Whenever the running tank drops below zero at station `i`, none of the stations from the current candidate start through `i` can be the answer (they all fail to reach past `i`), so reset the candidate start to `i + 1` and zero the tank.\n\nBecause a solution exists whenever the total is non-negative, the last candidate start you land on is the unique smallest valid start.",
    functionName: 'can_finish_circuit',
    functionSignature: "def can_finish_circuit(gas: list[int], cost: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def can_finish_circuit(gas: list[int], cost: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[1,2,3,4,5],[3,4,5,1,2]], expected: 3 },
      { input: [[2,3,4],[3,4,3]], expected: -1 },
    ],
    hiddenTests: [
      { input: [[5,1,2,3,4],[4,4,1,5,1]], expected: 4 },
      { input: [[3,3,4],[3,4,4]], expected: -1 },
      { input: [[4],[3]], expected: 0 },
      { input: [[2],[2]], expected: 0 },
    ],
  },
  {
    id: 'max-reachable-index',
    number: 283,
    title: "Farthest Stepping Stone",
    difficulty: 'Easy',
    topic: "Greedy",
    statement:
      "You're given a list of non-negative integers `nums`. You start on index `0`. From any index `i` you can jump forward to any index between `i+1` and `i + nums[i]` (a jump of `0` means you're stuck there).\n\nReturn the farthest index you can possibly reach starting from index `0`. If you can already reach the last index, return the last index.",
    explanation:
      "Greedily track the farthest index reachable so far. Scan left to right; at each index `i` that is itself reachable (`i <= farthest`), update `farthest = max(farthest, i + nums[i])`.\n\nIf `farthest` ever reaches or passes the last index, you're done — return the last index. If you advance past `farthest` without reaching the end, you're blocked, and `farthest` is the answer (clamped to the last index).\n\nOne pass, O(n) time, O(1) space.",
    functionName: 'max_reachable_index',
    functionSignature: "def max_reachable_index(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def max_reachable_index(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[2,3,1,1,4]], expected: 4 },
      { input: [[3,2,1,0,4]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[0,1,2]], expected: 0 },
      { input: [[1,1,0,1]], expected: 2 },
      { input: [[5]], expected: 0 },
      { input: [[2,0,0]], expected: 2 },
    ],
  },
  {
    id: 'max-tasks-assigned',
    number: 284,
    title: "Match Workers to Jobs",
    difficulty: 'Easy',
    topic: "Greedy",
    statement:
      "You have a list `workers`, where `workers[i]` is the strength of worker `i`, and a list `tasks`, where `tasks[j]` is the strength required to complete task `j`.\n\nEach worker can be assigned at most one task, each task to at most one worker, and a worker can complete a task only if their strength is greater than or equal to the task's requirement. Return the maximum number of tasks that can be assigned.",
    explanation:
      "Sort both lists ascending. Walk through workers from weakest to strongest, keeping a pointer at the smallest still-unassigned task.\n\nFor each worker, if their strength meets the current smallest remaining task, assign it and advance the task pointer. Handing the easiest available task to each capable worker never blocks a better matching — any stronger worker who could have taken that task can instead take a harder one later.\n\nThis two-pointer greedy runs in O(n log n) for the sorts plus O(n) for the sweep.",
    functionName: 'max_tasks_assigned',
    functionSignature: "def max_tasks_assigned(workers: list[int], tasks: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def max_tasks_assigned(workers: list[int], tasks: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[3,2,1],[1,1,3]], expected: 3 },
      { input: [[1,1,1],[2,2,2]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[5,5],[1,10]], expected: 1 },
      { input: [[10],[]], expected: 0 },
      { input: [[],[1,2]], expected: 0 },
      { input: [[4,2,8],[3,3,3]], expected: 2 },
    ],
  },
  {
    id: 'rotate-image-counterclockwise',
    number: 285,
    title: "Rotate Image Counterclockwise",
    difficulty: 'Medium',
    topic: "Matrix",
    statement:
      "You're given an `n x n` matrix of integers. Rotate the matrix by 90 degrees **counterclockwise** and return the resulting matrix.\n\nUnlike a clockwise rotation, the top row of the input becomes the rightmost column of the output. You may build and return a new matrix (an in-place solution is not required).\n\nFor example, the value originally at `matrix[i][j]` ends up at position `result[n-1-j][i]`.",
    explanation:
      "A counterclockwise rotation maps `result[i][j] = matrix[j][n-1-i]`.\n\nThe cleanest way to see it: rotating counterclockwise is the same as **transposing** the matrix and then **reversing the order of the rows** (i.e. flipping top-to-bottom). Equivalently, reverse each row first, then transpose.\n\nA direct index formula also works: for each output cell `(i, j)`, pull the value from `matrix[j][n-1-i]`. This runs in O(n^2) time.",
    functionName: 'rotate_ccw',
    functionSignature: "def rotate_ccw(matrix: list[list[int]]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def rotate_ccw(matrix: list[list[int]]) -> list[list[int]]:\n    pass\n",
    examples: [
      { input: [[[1,2],[3,4]]], expected: [[2,4],[1,3]] },
      { input: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [[3,6,9],[2,5,8],[1,4,7]] },
    ],
    hiddenTests: [
      { input: [[[5]]], expected: [[5]] },
      { input: [[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]], expected: [[4,8,12,16],[3,7,11,15],[2,6,10,14],[1,5,9,13]] },
    ],
  },
  {
    id: 'counterclockwise-spiral-order',
    number: 286,
    title: "Counterclockwise Spiral Order",
    difficulty: 'Medium',
    topic: "Matrix",
    statement:
      "Given an `m x n` matrix, return all of its elements in **counterclockwise spiral order**, as a flat list.\n\nStart at the top-left corner and move **down** the left column first. Then go **right** along the bottom row, **up** the right column, and **left** across the top row, spiraling inward until every element has been visited.",
    explanation:
      "This is the mirror image of the usual (clockwise) spiral. Maintain four boundaries: `top`, `bottom`, `left`, `right`.\n\nRepeat while the region is non-empty, in this order:\n1. Walk **down** the `left` column (top -> bottom), then `left += 1`.\n2. Walk **right** along the `bottom` row (left -> right), then `bottom -= 1`.\n3. If a column remains, walk **up** the `right` column (bottom -> top), then `right -= 1`.\n4. If a row remains, walk **left** along the `top` row (right -> left), then `top += 1`.\n\nThe two guards on steps 3 and 4 prevent re-visiting cells in thin (single-row or single-column) leftovers. O(m*n) time.",
    functionName: 'spiral_ccw',
    functionSignature: "def spiral_ccw(matrix: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def spiral_ccw(matrix: list[list[int]]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [1,4,7,8,9,6,3,2,5] },
      { input: [[[1,2],[3,4]]], expected: [1,3,4,2] },
      { input: [[[1,2,3,4]]], expected: [1,2,3,4] },
    ],
    hiddenTests: [
      { input: [[[1],[2],[3]]], expected: [1,2,3] },
      { input: [[[1,2,3,4],[5,6,7,8],[9,10,11,12]]], expected: [1,5,9,10,11,12,8,4,3,2,6,7] },
    ],
  },
  {
    id: 'flood-zero-cells',
    number: 287,
    title: "Flood Zero Cells",
    difficulty: 'Easy',
    topic: "Matrix",
    statement:
      "You're given an `m x n` matrix and an integer `fill`. For every cell that originally contains `0`, set that cell's entire row and entire column to the value `fill`. Return the modified matrix.\n\nImportant: the decision about which cells to flood must be based on the **original** matrix. A `fill` value written into a cell must not itself trigger further rows or columns to be flooded.",
    explanation:
      "This is a variation of \"Set Matrix Zeroes\". The trap is that if you overwrite cells as you go, freshly written `fill` values (or new zeros) could be misread as original markers.\n\nSafe two-pass approach:\n1. Scan the whole matrix once and record the set of row indices and the set of column indices that contain at least one original `0`.\n2. Scan again: for every cell whose row is marked or whose column is marked, write `fill`.\n\nThis uses O(m + n) extra space for the two index sets and runs in O(m*n) time.",
    functionName: 'flood_zero_cells',
    functionSignature: "def flood_zero_cells(matrix: list[list[int]], fill: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def flood_zero_cells(matrix: list[list[int]], fill: int) -> list[list[int]]:\n    pass\n",
    examples: [
      { input: [[[1,1,1],[1,0,1],[1,1,1]],9], expected: [[1,9,1],[9,9,9],[1,9,1]] },
      { input: [[[0,1,2,0],[3,4,5,2],[1,3,1,5]],-1], expected: [[-1,-1,-1,-1],[-1,4,5,-1],[-1,3,1,-1]] },
    ],
    hiddenTests: [
      { input: [[[1,2,3],[4,5,6]],7], expected: [[1,2,3],[4,5,6]] },
      { input: [[[0]],9], expected: [[9]] },
    ],
  },
  {
    id: 'search-sorted-matrix-staircase',
    number: 288,
    title: "Search a Row-and-Column Sorted Matrix",
    difficulty: 'Medium',
    topic: "Matrix",
    statement:
      "You're given an `m x n` matrix of **distinct** integers with two sorting guarantees:\n\n- each row is sorted in strictly increasing order from left to right, and\n- each column is sorted in strictly increasing order from top to bottom.\n\nNote that, unlike a fully row-major sorted matrix, the first element of a row is **not** necessarily larger than the last element of the previous row.\n\nGiven a `target`, return `[row, col]` of the cell containing it, or `[-1, -1]` if the target is not present. Because all values are distinct, at most one position matches.",
    explanation:
      "A brute-force scan is O(m*n). You can do better by exploiting both sort orders with a **staircase search**.\n\nStart at the top-right corner `(0, n-1)`:\n- If the current value equals `target`, return its coordinates.\n- If the current value is **greater** than `target`, everything below in this column is even larger, so move **left** (`col -= 1`).\n- If the current value is **less** than `target`, everything to the left in this row is even smaller, so move **down** (`row += 1`).\n\nEach step eliminates a full row or column, giving O(m + n) time. If you walk off the grid, the target is absent.",
    functionName: 'search_staircase',
    functionSignature: "def search_staircase(matrix: list[list[int]], target: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def search_staircase(matrix: list[list[int]], target: int) -> list[int]:\n    pass\n",
    examples: [
      { input: [[[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]],5], expected: [1,1] },
      { input: [[[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]],20], expected: [-1,-1] },
    ],
    hiddenTests: [
      { input: [[[1,3,5],[7,9,11],[13,15,17]],15], expected: [2,1] },
      { input: [[[5]],5], expected: [0,0] },
      { input: [[[1,2],[3,4]],3], expected: [1,0] },
    ],
  },
  {
    id: 'total-covered-length',
    number: 289,
    title: "Total Covered Length",
    difficulty: 'Easy',
    topic: "Interval",
    statement:
      "You're given a list of `intervals`, where each `intervals[i] = [start, end]` represents the closed segment `[start, end]` on a number line (with `start <= end`). Overlapping or touching segments cover the same ground.\n\nReturn the **total length of the number line covered** by at least one interval. Length is measured as `end - start` for a merged block; a single point like `[3, 3]` contributes length `0`.\n\nIf `intervals` is empty, return `0`.",
    explanation:
      "Overlapping segments must be counted once, not twice — so first sort the intervals by start.\n\nSweep through them keeping a running merged block `[cur_start, cur_end]`. For each next interval: if it starts at or before `cur_end`, extend the block with `cur_end = max(cur_end, e)`. Otherwise the block is finished — add `cur_end - cur_start` to the total and begin a new block. Add the final block at the end.\n\nSorting dominates at O(n log n) time, O(1) extra space beyond the sort.",
    functionName: 'total_covered_length',
    functionSignature: "def total_covered_length(intervals: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def total_covered_length(intervals: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[1,4],[2,6],[8,10]]], expected: 7 },
      { input: [[[1,3],[3,5]]], expected: 4 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[[1,10]]], expected: 9 },
      { input: [[[5,7],[1,3],[2,4]]], expected: 5 },
      { input: [[[0,0],[1,1]]], expected: 0 },
      { input: [[[1,5],[2,3],[4,8],[10,12]]], expected: 9 },
    ],
  },
  {
    id: 'interval-intersections',
    number: 290,
    title: "Interval List Intersections",
    difficulty: 'Medium',
    topic: "Interval",
    statement:
      "You're given two lists of closed intervals, `a` and `b`. Each list is **pairwise disjoint and sorted** in increasing order of start (so within one list no two intervals overlap). Each interval is `[start, end]` with `start <= end`, representing the closed range `[start, end]`.\n\nReturn the list of intervals formed by the **intersection** of `a` and `b`. Two closed intervals intersect if they share at least one point; touching at a single point counts (e.g. `[1, 3]` and `[3, 5]` intersect at `[3, 3]`).\n\nReturn the intersections as a list of `[start, end]` pairs in increasing order of start. If there are no intersections, return an empty list.",
    explanation:
      "Because both lists are sorted and internally disjoint, use two pointers `i` and `j`.\n\nFor the current `a[i]` and `b[j]`, their overlap is `[max(starts), min(ends)]`. If `max(starts) <= min(ends)` the overlap is non-empty — record it. Then advance the pointer whose interval **ends first**, since that interval can't intersect anything further right.\n\nEach step advances one pointer, so this is O(m + n) time and O(1) extra space (aside from the output).",
    functionName: 'interval_intersections',
    functionSignature: "def interval_intersections(a: list[list[int]], b: list[list[int]]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def interval_intersections(a: list[list[int]], b: list[list[int]]) -> list[list[int]]:\n    pass\n",
    examples: [
      { input: [[[0,2],[5,10],[13,23],[24,25]],[[1,5],[8,12],[15,24],[25,26]]], expected: [[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]] },
      { input: [[[1,7]],[[3,10]]], expected: [[3,7]] },
      { input: [[[0,5]],[[6,10]]], expected: [] },
    ],
    hiddenTests: [
      { input: [[[1,3],[5,9]],[]], expected: [] },
      { input: [[],[[4,8],[10,12]]], expected: [] },
      { input: [[[1,4],[6,9]],[[2,3],[7,8]]], expected: [[2,3],[7,8]] },
    ],
  },
  {
    id: 'max-simultaneous-events',
    number: 291,
    title: "Maximum Simultaneous Events",
    difficulty: 'Hard',
    topic: "Interval",
    statement:
      "You're given a list of `intervals`, where each `intervals[i] = [start, end]` is a **closed** time interval `[start, end]` (with `start <= end`) during which one event is running.\n\nAn event is considered active at every time `t` with `start <= t <= end`. Because the intervals are closed, two events touching at a single instant (one ending exactly when another starts) are both active at that instant and count as overlapping.\n\nReturn the **maximum number of events that are active at the same time** at any single instant. If `intervals` is empty, return `0`.",
    explanation:
      "This is the classic 'max concurrent intervals' / minimum-rooms count.\n\nSeparate all start times into one sorted array and all end times into another. Walk a two-pointer sweep: compare the next start with the next end. Because intervals are **closed**, a start at time `t` overlaps an end at time `t`, so use `starts[i] <= ends[j]`: when true, a new event begins — increment the active counter and update the best; otherwise an event has ended — decrement the counter and advance the end pointer.\n\nTrack the peak of the active counter. Sorting dominates at O(n log n) time, O(n) space.",
    functionName: 'max_simultaneous_events',
    functionSignature: "def max_simultaneous_events(intervals: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def max_simultaneous_events(intervals: list[list[int]]) -> int:\n    pass\n",
    examples: [
      { input: [[[1,4],[2,5],[9,12],[5,9],[5,12]]], expected: 3 },
      { input: [[[1,2],[3,4],[5,6]]], expected: 1 },
      { input: [[[1,5],[5,10]]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[[1,10],[2,9],[3,8]]], expected: 3 },
      { input: [[[0,30],[5,10],[15,20]]], expected: 2 },
      { input: [[[7,7]]], expected: 1 },
    ],
  },
  {
    id: 'count-words-with-prefix',
    number: 292,
    title: "Count Words With Prefix",
    difficulty: 'Medium',
    topic: "Trie",
    statement:
      "You're given a list of lowercase words `words` and a list of query strings `queries`. For each query, count how many words in `words` start with that query string as a prefix, and return the counts in a list, one per query (same order as the queries).\n\nA word counts if the query is a prefix of it. A word is always a prefix of itself. The empty string `\"\"` is a prefix of every word, so a `\"\"` query returns the total number of words. Words may repeat; count each occurrence.\n\nBuild a prefix tree (trie) where each node stores how many words pass through it, so each query is answered by walking down the tree in time proportional to the query length.",
    explanation:
      "Insert every word into a trie. As you walk each character during insertion, increment a `count` field on the node you land on — that count is exactly the number of inserted words that share the path (i.e. the prefix) up to that node. Also increment a count at the root itself for the empty prefix.\n\nTo answer a query, walk the trie following the query's characters. If you fall off the tree (a character is missing), the answer is 0. Otherwise the `count` stored on the final node is your answer.\n\nBuilding the trie is O(total characters in words); each query is O(length of query).",
    functionName: 'count_words_with_prefix',
    functionSignature: "def count_words_with_prefix(words: list[str], queries: list[str]) -> list[int]:",
    starter:
      STARTER_HEADER + "def count_words_with_prefix(words: list[str], queries: list[str]) -> list[int]:\n    pass\n",
    examples: [
      { input: [["apple","app","apricot","banana"],["ap","app","b","xyz"]], expected: [3,2,1,0] },
      { input: [["cat","car","card"],["ca","car","cart"]], expected: [3,2,0] },
    ],
    hiddenTests: [
      { input: [[],["a",""]], expected: [0,0] },
      { input: [["dog"],[""]], expected: [1] },
      { input: [["a","ab","abc"],["a","ab","abc","abcd"]], expected: [3,2,1,0] },
      { input: [["xyz","xy"],["x","xy","xyz","xyzz"]], expected: [2,2,1,0] },
    ],
  },
  {
    id: 'wildcard-word-dictionary',
    number: 293,
    title: "Wildcard Word Dictionary",
    difficulty: 'Hard',
    topic: "Trie",
    statement:
      "Design a word dictionary that supports adding words and searching with a wildcard. You're given a list of `operations`, each a two-element list. Process them in order and return a list with one result per operation.\n\nOperations:\n- `[\"add\", word]` — add `word` (lowercase letters) to the dictionary. Append `null` to the results for this operation.\n- `[\"search\", pattern]` — return `true` if any word already in the dictionary matches `pattern`, otherwise `false`. In a pattern, a `.` matches any single letter; every other character must match exactly. The pattern matches a word only if their lengths are equal.\n\nReturn the results list (with `null` entries for every add and a boolean for every search).",
    explanation:
      "Store the added words in a trie, marking the node at the end of each word as a word-ending.\n\nFor a plain letter in the search pattern, descend into that child if it exists, else fail. For a `.`, you must try every child of the current node — recurse into each and succeed if any branch matches the rest of the pattern. When you've consumed the whole pattern, the match succeeds only if the current node is marked as a word-ending (this enforces equal lengths automatically).\n\nUse depth-first search with backtracking for the wildcard branches. Each add is O(word length); a search with `w` wildcards can branch but is efficient in practice.",
    functionName: 'wildcard_word_search',
    functionSignature: "def wildcard_word_search(operations: list[list[str]]) -> list:",
    starter:
      STARTER_HEADER + "def wildcard_word_search(operations: list[list[str]]) -> list:\n    pass\n",
    examples: [
      { input: [[["add","bad"],["add","dad"],["add","mad"],["search","pad"],["search","bad"],["search",".ad"],["search","b.."]]], expected: [null,null,null,false,true,true,true] },
      { input: [[["add","a"],["search","a"],["search","."],["search","aa"]]], expected: [null,true,true,false] },
    ],
    hiddenTests: [
      { input: [[["search","x"]]], expected: [false] },
      { input: [[["add","word"],["search","w.rd"],["search","wor."],["search",".ord"],["search","word"],["search","...."],["search","....."]]], expected: [null,true,true,true,true,true,false] },
      { input: [[["add","ab"],["add","abc"],["search","ab"],["search","a.c"],["search","a."]]], expected: [null,null,true,true,true] },
    ],
  },
  {
    id: 'single-number-iii',
    number: 294,
    title: "Lone Number in Triples",
    difficulty: 'Medium',
    topic: "Binary",
    statement:
      "You're given a list of integers `nums` where every value appears exactly three times, except for one value that appears exactly once. Return that single value.\n\nYou must solve it with constant extra space (do not build a counting dictionary or sort — use bitwise logic).",
    explanation:
      "With a hash map this is trivial, but the constant-space bit trick is the point.\n\nTrack two bitmasks, `ones` and `twos`, representing bits that have been seen once and twice (mod 3). For each number update:\n\n- `ones = (ones ^ n) & ~twos`\n- `twos = (twos ^ n) & ~ones`\n\nAfter processing everything, bits belonging to a count that is a multiple of three cancel out, and `ones` holds exactly the bits of the unique number. This works for negatives too because Python's integers behave like the two's-complement pattern under these masks.\n\nO(n) time, O(1) space.",
    functionName: 'single_number_iii',
    functionSignature: "def single_number_iii(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def single_number_iii(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[2,2,3,2]], expected: 3 },
      { input: [[0,1,0,1,0,1,99]], expected: 99 },
      { input: [[5]], expected: 5 },
    ],
    hiddenTests: [
      { input: [[-2,-2,1,1,-3,1,-3,-3,9,-2]], expected: 9 },
      { input: [[30000,500,100,30000,100,30000,100]], expected: 500 },
      { input: [[7,7,7,-8]], expected: -8 },
    ],
  },
  {
    id: 'power-of-four',
    number: 295,
    title: "Is It a Power of Four",
    difficulty: 'Easy',
    topic: "Binary",
    statement:
      "Given an integer `n`, return `True` if `n` is a power of four (that is, `n == 4 ** k` for some non-negative integer `k`), and `False` otherwise.\n\nDo not use loops or recursion — solve it with bitwise reasoning.",
    explanation:
      "A power of four is a special power of two. First, a positive number is a power of two exactly when it has a single set bit, which you can test with `n > 0 and (n & (n - 1)) == 0`.\n\nAmong powers of two, the ones that are also powers of four have their single set bit at an even position (bit 0, 2, 4, ...). The hex mask `0x55555555` (binary `...0101 0101`) has 1s exactly at those even positions. So a power-of-two `n` is a power of four when `n & 0x55555555` is non-zero.\n\nCombine both checks. O(1) time and space.",
    functionName: 'is_power_of_four',
    functionSignature: "def is_power_of_four(n: int) -> bool:",
    starter:
      STARTER_HEADER + "def is_power_of_four(n: int) -> bool:\n    pass\n",
    examples: [
      { input: [16], expected: true },
      { input: [5], expected: false },
      { input: [1], expected: true },
    ],
    hiddenTests: [
      { input: [0], expected: false },
      { input: [8], expected: false },
      { input: [64], expected: true },
      { input: [-4], expected: false },
    ],
  },
  {
    id: 'max-xor-pair',
    number: 296,
    title: "Maximum XOR of Two Numbers",
    difficulty: 'Hard',
    topic: "Binary",
    statement:
      "Given a list of non-negative integers `nums`, return the maximum value of `nums[i] ^ nums[j]` (bitwise XOR) over all pairs of indices, where `i` and `j` may be equal.\n\nSince a pair may reuse an index, a single-element list yields `0`. Aim for better than the O(n²) brute force.",
    explanation:
      "Build the answer one bit at a time, from the most significant bit down. Maintain `max_xor`, the best prefix found so far, and a growing `mask` covering the bits considered.\n\nAt bit `i`, greedily assume the answer can have a 1 there: form `candidate = max_xor | (1 << i)`. Collect the masked prefixes `n & mask` of all numbers into a set. If there exist two prefixes `a`, `b` in the set with `a ^ b == candidate` (equivalently, for some prefix `p`, `candidate ^ p` is also in the set), then that bit is achievable — set `max_xor = candidate`.\n\nAfter scanning all bit positions, `max_xor` is the maximum. This is O(32 * n) time using the prefix-set idea (the same principle behind the bitwise-trie solution).",
    functionName: 'max_xor_pair',
    functionSignature: "def max_xor_pair(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def max_xor_pair(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[3,10,5,25,2,8]], expected: 28 },
      { input: [[0]], expected: 0 },
      { input: [[2,4]], expected: 6 },
    ],
    hiddenTests: [
      { input: [[8,10,2]], expected: 10 },
      { input: [[14,70,53,83,49,91,36,80,92,51,66,70]], expected: 127 },
      { input: [[1,2,3,4]], expected: 7 },
    ],
  },
  {
    id: 'first-non-repeating-character',
    number: 297,
    title: "First Non-Repeating Character",
    difficulty: 'Easy',
    topic: "Hash Table",
    statement:
      "Given a string `s` made of lowercase English letters, return the index of the first character that appears exactly once in the string. If no such character exists (or the string is empty), return `-1`.",
    explanation:
      "Count how many times each character appears using a dictionary (or `collections.Counter`) in one pass. Then scan the string left to right and return the index of the first character whose count is 1.\n\nBecause you walk the original string in order, the first count-1 character you hit is guaranteed to be the earliest unique one. Two passes total, O(n) time and O(1) extra space (at most 26 distinct letters).",
    functionName: 'first_unique_char_index',
    functionSignature: "def first_unique_char_index(s: str) -> int:",
    starter:
      STARTER_HEADER + "def first_unique_char_index(s: str) -> int:\n    pass\n",
    examples: [
      { input: ["leetcode"], expected: 0 },
      { input: ["loveleetcode"], expected: 2 },
      { input: ["aabb"], expected: -1 },
    ],
    hiddenTests: [
      { input: [""], expected: -1 },
      { input: ["z"], expected: 0 },
      { input: ["abcabd"], expected: 2 },
    ],
  },
  {
    id: 'group-by-letter-set',
    number: 298,
    title: "Group by Letter Set",
    difficulty: 'Medium',
    topic: "Hash Table",
    statement:
      "You are given a list of lowercase words. Group together all words that use the exact same **set of distinct letters** (ignoring how many times each letter appears and their order). For example `\"abc\"`, `\"cba\"`, and `\"bca\"` all share the letter set `{a, b, c}`, while `\"a\"`, `\"aa\"`, and `\"aaa\"` all share the letter set `{a}`.\n\nReturn a list of groups. Within each group, keep the words in the order they appeared in the input. The groups themselves must be ordered by the first appearance of any word belonging to that group.",
    explanation:
      "For each word, compute a canonical signature of its distinct letters: take `set(word)`, sort those characters, and join them into a string (e.g. `\"bca\"` -> `\"abc\"`). This signature is identical for all words sharing the same letter set.\n\nUse a dictionary mapping signature -> list of words, and separately track the order in which signatures first appear so the output group order is deterministic. Append each word to its signature's bucket, then emit the buckets in first-seen order.\n\nO(total characters) time.",
    functionName: 'group_by_signature',
    functionSignature: "def group_by_signature(words: list[str]) -> list[list[str]]:",
    starter:
      STARTER_HEADER + "def group_by_signature(words: list[str]) -> list[list[str]]:\n    pass\n",
    examples: [
      { input: [["abc","cba","bca","xyz"]], expected: [["abc","cba","bca"],["xyz"]] },
      { input: [["a","aa","aaa","b"]], expected: [["a","aa","aaa"],["b"]] },
      { input: [["dog","god","cat"]], expected: [["dog","god"],["cat"]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [["listen","silent","enlist","google"]], expected: [["listen","silent","enlist"],["google"]] },
    ],
  },
  {
    id: 'dedup-keep-order',
    number: 299,
    title: "Dedup Keep Order",
    difficulty: 'Easy',
    topic: "Hash Table",
    statement:
      "Given a list of integers `nums`, remove duplicate values while preserving the order of their **first** appearance. Return the resulting list.\n\nFor example, `[1, 2, 2, 3, 1, 4]` becomes `[1, 2, 3, 4]`: each value is kept the first time it is seen and skipped on any later occurrence.",
    explanation:
      "Maintain a `set` of values you have already emitted. Walk the list once; for each number, if it is not in the set, add it to the set and append it to the output. If it is already in the set, skip it.\n\nThe set gives O(1) membership checks, so the whole thing is O(n) time and O(n) space. Sorting or nested scanning is unnecessary and would lose the first-appearance ordering.",
    functionName: 'dedup_keep_order',
    functionSignature: "def dedup_keep_order(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def dedup_keep_order(nums: list[int]) -> list[int]:\n    pass\n",
    examples: [
      { input: [[1,2,2,3,1,4]], expected: [1,2,3,4] },
      { input: [[5,5,5,5]], expected: [5] },
      { input: [[1,2,3]], expected: [1,2,3] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[4,3,4,3,2,1]], expected: [4,3,2,1] },
    ],
  },
  {
    id: 'longest-balanced-binary-run',
    number: 300,
    title: "Longest Balanced Binary Run",
    difficulty: 'Hard',
    topic: "Hash Table",
    statement:
      "Given a list `nums` containing only `0`s and `1`s, return the length of the longest **contiguous** subarray that has an equal number of `0`s and `1`s. If no such subarray exists, return `0`.\n\nFor example, in `[0, 0, 1, 0, 0, 0, 1, 1]` the longest balanced run has length `6` (the subarray from index 2 through index 7 contains three `0`s and three `1`s).",
    explanation:
      "Turn each `0` into `-1` and each `1` into `+1`, then track a running sum (call it the balance). A subarray has equal numbers of `0`s and `1`s exactly when the balance is the same at its two endpoints.\n\nUse a dictionary mapping each balance value to the **earliest** index at which it occurred, seeded with `{0: -1}` so subarrays starting at index 0 are handled. As you scan, if the current balance was seen before at index `j`, the subarray `(j, i]` is balanced and has length `i - j`; keep the maximum. Otherwise record the current index as the first time you saw this balance.\n\nOne pass, O(n) time and O(n) space.",
    functionName: 'max_equal_subarray',
    functionSignature: "def max_equal_subarray(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def max_equal_subarray(nums: list[int]) -> int:\n    pass\n",
    examples: [
      { input: [[0,1]], expected: 2 },
      { input: [[0,1,0]], expected: 2 },
      { input: [[0,0,1,0,0,0,1,1]], expected: 6 },
    ],
    hiddenTests: [
      { input: [[1,1,1,1]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[0,1,1,0,1,1,1,0]], expected: 4 },
    ],
  },
];

// Group by topic for filter UI
export const blind75Topics: string[] = Array.from(
  new Set(blind75.map((p) => p.topic))
).sort();

export const getProblem = (id: string): Blind75Problem | undefined =>
  blind75.find((p) => p.id === id);
