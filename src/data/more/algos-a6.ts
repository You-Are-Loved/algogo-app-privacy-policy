import type { Blind75Problem } from '../blind75';

const STARTER_HEADER = '# Write your solution below. Do not rename the function.\n';

export const problems: Blind75Problem[] = [
  {
    id: "count-matching-pairs",
    number: 495,
    title: "Count Matching Pairs",
    difficulty: "Easy",
    topic: "Hash Table",
    statement:
      "Given a list of integers `nums`, count the pairs of positions `(i, j)` with `i < j` that hold the same value (`nums[i] == nums[j]`). Every pair of positions counts separately, so a value that appears three times contributes three pairs. Return `0` for an empty list.",
    explanation:
      "Checking every pair of positions works but costs O(n^2). The useful observation is that when you arrive at a new element, the number of pairs it completes is exactly the number of earlier elements with the same value.\n\nKeep a dict mapping `value -> how many times seen so far`. Walk the list once; for each `x`, add `seen[x]` (or 0) to the answer, then increment `seen[x]`.\n\nEquivalently, count everything first and add `c * (c - 1) // 2` for each count `c`: a value seen `c` times forms that many pairs. A common slip is adding `c // 2` or `c - 1`, which undercounts once a value appears three or more times.\n\nO(n) time, O(n) space.",
    functionName: "count_equal_pairs",
    functionSignature: "def count_equal_pairs(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def count_equal_pairs(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 1, 1, 3]], expected: 4 },
      { input: [[4, 4, 4, 4]], expected: 6 },
      { input: [[1, 2, 3]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[5]], expected: 0 },
      { input: [[7, 7]], expected: 1 },
      { input: [[2, 2, 2, 3, 3, -1, -1, -1, -1]], expected: 10 },
      { input: [[0, 0, 0, 0, 0]], expected: 10 },
      { input: [[9, 8, 9, 8, 9, 8, 7]], expected: 6 },
    ],
  },
  {
    id: "self-counting-value",
    number: 496,
    title: "Self-Counting Value",
    difficulty: "Easy",
    topic: "Hash Table",
    statement:
      "A value `x` in a list of positive integers is called self-counting if it appears in the list exactly `x` times. Given `nums`, return the largest self-counting value, or `-1` if there is none (including when the list is empty).",
    explanation:
      "You need the frequency of every value, which is exactly what a hash map gives you in one pass. Rescanning the list for each value (`nums.count(x)` in a loop) is O(n^2).\n\n1. Build `counts = Counter(nums)`.\n2. Look at each `(value, count)` pair; when `value == count` it is a candidate.\n3. Return the largest candidate, or `-1` if you found none.\n\nTwo traps: the count must match exactly (a `3` that appears four times does not qualify), and when several values qualify you want the largest one, not the first you meet or the most frequent.\n\nO(n) time, O(n) space.",
    functionName: "largest_self_count_value",
    functionSignature: "def largest_self_count_value(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def largest_self_count_value(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[2, 2, 3, 4]], expected: 2 },
      { input: [[1, 2, 2, 3, 3, 3]], expected: 3 },
      { input: [[2, 2, 2, 3, 3]], expected: -1 },
    ],
    hiddenTests: [
      { input: [[]], expected: -1 },
      { input: [[1]], expected: 1 },
      { input: [[5, 5, 5, 5, 5, 1, 7]], expected: 5 },
      { input: [[3, 3, 3, 3]], expected: -1 },
      { input: [[4, 4, 4, 4, 2, 2, 6]], expected: 4 },
      { input: [[2, 2, 1, 3, 3, 3, 3]], expected: 2 },
    ],
  },
  {
    id: "repeat-within-reach",
    number: 497,
    title: "Repeat Within Reach",
    difficulty: "Easy",
    topic: "Hash Table",
    statement:
      "Given a list of integers `nums` and an integer `k >= 0`, return `True` if some value appears at two different positions `i` and `j` whose distance `abs(i - j)` is at most `k`. Otherwise return `False`. An empty list gives `False`.",
    explanation:
      "Comparing each element with the `k` elements after it is O(n * k). A dict of `value -> most recent index` does it in one pass.\n\nWalk the list with index `i`. If `nums[i]` is already in the dict and `i - last[nums[i]] <= k`, return `True`. Either way, store `last[nums[i]] = i`.\n\nWhy overwrite with the newest index? For any later position, the nearest earlier copy of the value is the most recent one, so older positions can never give a smaller gap. Keeping only the first occurrence is the classic bug: in `[1, 2, 3, 4, 1, 9, 1]` with `k = 2` the two copies that are close together are the second and third.\n\nMind the boundary: the gap may equal `k`, and with `k = 0` the answer is always `False` because the positions must differ.\n\nO(n) time, O(n) space.",
    functionName: "has_repeat_within",
    functionSignature: "def has_repeat_within(nums: list[int], k: int) -> bool:",
    starter:
      STARTER_HEADER +
      "def has_repeat_within(nums: list[int], k: int) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 1], 3], expected: true },
      { input: [[1, 2, 3, 1], 2], expected: false },
      { input: [[1, 0, 1, 1], 1], expected: true },
    ],
    hiddenTests: [
      { input: [[], 0], expected: false },
      { input: [[1, 1], 0], expected: false },
      { input: [[1, 2, 3, 4, 1, 9, 1], 2], expected: true },
      { input: [[4, 5, 6, 4, 7, 5, 4], 2], expected: false },
      { input: [[4, 5, 6, 4, 7, 5, 4], 3], expected: true },
      { input: [[8, 8], 1], expected: true },
    ],
  },
  {
    id: "smallest-upright-rectangle",
    number: 498,
    title: "Smallest Upright Rectangle",
    difficulty: "Medium",
    topic: "Hash Table",
    statement:
      "You are given a list of distinct `points` on a grid, each as `[x, y]` with integer coordinates. Find a rectangle whose sides are parallel to the x and y axes and whose four corners are all in the list, and return the smallest area such a rectangle can have. The rectangle must have positive area. If no rectangle can be formed, return `0`.",
    explanation:
      "Trying every set of four points is O(n^4). The trick is that an upright rectangle is fully determined by one diagonal: if `(x1, y1)` and `(x2, y2)` are opposite corners, the other two corners must be `(x1, y2)` and `(x2, y1)`.\n\n1. Put every point into a set of tuples for O(1) lookups.\n2. For every pair of points with `x1 != x2` and `y1 != y2` (otherwise they cannot be a diagonal of a rectangle with positive area), check whether both `(x1, y2)` and `(x2, y1)` are in the set.\n3. If so, the area is `abs(x1 - x2) * abs(y1 - y2)`; keep the minimum.\n4. Return `0` if nothing was found.\n\nSkipping the `x1 != x2 and y1 != y2` check is the usual bug: two points on the same vertical line pass the lookup trivially and report an area of 0.\n\nO(n^2) time, O(n) space.",
    functionName: "smallest_axis_rectangle",
    functionSignature: "def smallest_axis_rectangle(points: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def smallest_axis_rectangle(points: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 1], [1, 3], [3, 1], [3, 3], [2, 2]]], expected: 4 },
      { input: [[[1, 1], [1, 3], [3, 1], [3, 3], [4, 1], [4, 3]]], expected: 2 },
      { input: [[[0, 0], [1, 0], [2, 0]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[[0, 0], [0, 5], [7, 0]]], expected: 0 },
      { input: [[[0, 0], [0, 1], [5, 0], [5, 1], [9, 0], [9, 1], [0, 4], [5, 4]]], expected: 4 },
      { input: [[[-2, -1], [-2, 3], [4, -1], [4, 3]]], expected: 24 },
      { input: [[[0, 0], [2, 2], [0, 2], [3, 0], [3, 2], [1, 1]]], expected: 6 },
      { input: [[[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]]], expected: 2 },
    ],
  },
  {
    id: "cleanest-wall-cut",
    number: 499,
    title: "Cleanest Wall Cut",
    difficulty: "Medium",
    topic: "Hash Table",
    statement:
      "A brick wall is described by `wall`, a non-empty list of rows; each row lists the widths of its bricks from left to right, and every row has the same total width. You will saw straight down through the wall along one vertical line, from the top row to the bottom row. The line must be strictly inside the wall (not along its left or right edge). Where the line passes exactly along the joint between two bricks, no brick in that row is cut; otherwise one brick in that row is cut. Return the smallest number of bricks you have to cut.",
    explanation:
      "Testing every possible x position against every row is wasteful, and the wall can be very wide. Flip the question: a line at position `x` cuts a row unless that row has a joint at `x`. So the best line is the one that passes through the most joints.\n\n1. For each row, walk the bricks keeping a running sum; every running sum except the last one (which is the right edge of the wall) is a joint position. Count it in a dict `position -> number of rows with a joint here`.\n2. The answer is `number_of_rows - max(count)`, or simply `number_of_rows` when no row has an interior joint.\n\nThe classic mistake is counting the final running sum too: every row ends at the wall's right edge, so the answer would always come out as 0.\n\nO(total bricks) time and space.",
    functionName: "fewest_bricks_cut",
    functionSignature: "def fewest_bricks_cut(wall: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def fewest_bricks_cut(wall: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 2, 2, 1], [3, 1, 2], [1, 3, 2], [2, 4], [3, 1, 2], [1, 3, 1, 1]]], expected: 2 },
      { input: [[[1], [1], [1]]], expected: 3 },
      { input: [[[3], [1, 2]]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[[5]]], expected: 1 },
      { input: [[[2, 2], [2, 2], [2, 2]]], expected: 0 },
      { input: [[[1, 1, 1], [3], [2, 1], [1, 2]]], expected: 2 },
      { input: [[[4, 2], [1, 5], [3, 3], [2, 4]]], expected: 3 },
      { input: [[[1, 1, 2], [2, 2], [1, 3], [2, 1, 1], [4]]], expected: 2 },
    ],
  },
  {
    id: "pairs-summing-to-a-multiple",
    number: 500,
    title: "Pairs Summing to a Multiple",
    difficulty: "Medium",
    topic: "Hash Table",
    statement:
      "Given a list of integers `nums` (values may be negative) and an integer `k >= 1`, count the pairs of positions `(i, j)` with `i < j` for which `nums[i] + nums[j]` is divisible by `k`. Return `0` when there are fewer than two numbers.",
    explanation:
      "Only remainders matter: `a + b` is divisible by `k` exactly when `(a % k + b % k) % k == 0`. So instead of comparing every pair (O(n^2)), bucket the numbers by remainder.\n\nOne-pass version: keep a dict `seen[r]` = how many earlier numbers have remainder `r`. For each `x`, let `r = x % k`; the partners it needs have remainder `(k - r) % k`. Add `seen[(k - r) % k]` to the answer, then increment `seen[r]`.\n\nThe outer `% k` is what handles remainder 0, whose partner is 0 again rather than `k`. Counting first and multiplying buckets also works, but then remainder 0 and remainder `k / 2` (for even `k`) pair with themselves and need `c * (c - 1) // 2` instead of `c * c`; forgetting that is the usual bug.\n\nPython's `%` already returns a value in `0..k-1` for negative numbers, so negatives need no special handling.\n\nO(n) time, O(min(n, k)) space.",
    functionName: "count_pairs_divisible_sum",
    functionSignature: "def count_pairs_divisible_sum(nums: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def count_pairs_divisible_sum(nums: list[int], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[30, 20, 150, 100, 40], 60], expected: 3 },
      { input: [[60, 60, 60], 60], expected: 3 },
      { input: [[1, 2, 3, 4, 5], 3], expected: 4 },
    ],
    hiddenTests: [
      { input: [[], 5], expected: 0 },
      { input: [[7], 7], expected: 0 },
      { input: [[3, 8, -2, 14], 1], expected: 6 },
      { input: [[5, 15, 25, 10, 20], 10], expected: 4 },
      { input: [[-1, 1, -4, 4, 6, -6, 0, 5], 5], expected: 10 },
      { input: [[2, 2, 2, 2], 4], expected: 6 },
    ],
  },
  {
    id: "row-meets-column",
    number: 501,
    title: "Row Meets Column",
    difficulty: "Medium",
    topic: "Hash Table",
    statement:
      "You are given a square `n x n` grid of integers (`n >= 1`). Count the pairs `(r, c)` such that row `r`, read left to right, is identical to column `c`, read top to bottom. Every matching pair of a row index and a column index counts, so duplicate rows or duplicate columns each contribute.",
    explanation:
      "Comparing every row with every column element by element is O(n^3). Hashing whole rows cuts that to O(n^2).\n\n1. Turn each row into a tuple (lists are not hashable) and count them: `rows = Counter(tuple(row) for row in grid)`.\n2. Build each column as a tuple, top to bottom; `zip(*grid)` yields exactly those.\n3. For each column add `rows[column]` to the answer.\n\nUsing a counter rather than a set matters: if two rows are identical and one column matches them, that is two pairs. Likewise two identical columns each add their own matches. Also note that row `r` is compared with every column, not just column `r`.\n\nO(n^2) time and space.",
    functionName: "count_equal_row_column",
    functionSignature: "def count_equal_row_column(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def count_equal_row_column(grid: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[3, 2, 1], [1, 7, 6], [2, 7, 7]]], expected: 1 },
      { input: [[[3, 1, 2, 2], [1, 4, 4, 5], [2, 4, 2, 2], [2, 4, 2, 2]]], expected: 3 },
      { input: [[[1, 2], [3, 4]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[[5]]], expected: 1 },
      { input: [[[1, 1], [1, 1]]], expected: 4 },
      { input: [[[1, 2], [2, 1]]], expected: 2 },
      { input: [[[1, 2, 3], [2, 4, 5], [3, 5, 6]]], expected: 3 },
      { input: [[[0, 1, 0], [0, 1, 0], [0, 1, 0]]], expected: 0 },
      { input: [[[2, 2, 9], [2, 2, 9], [2, 2, 3]]], expected: 0 },
    ],
  },
  {
    id: "equidistant-triples",
    number: 502,
    title: "Equidistant Triples",
    difficulty: "Medium",
    topic: "Hash Table",
    statement:
      "You are given a list of distinct `points` in the plane, each as `[x, y]` with integer coordinates. Count the ordered triples of three different points `(a, b, c)` in which `a` is exactly as far from `b` as it is from `c` (straight-line distance). The order of `b` and `c` matters: `(a, b, c)` and `(a, c, b)` are two different triples. Return `0` if there are fewer than three points.",
    explanation:
      "Trying all triples is O(n^3). Fix the middle point `a` instead and ask: how do the other points group by distance from `a`?\n\nFor each point `a`:\n1. Build a dict `distance -> number of other points at that distance`. Use the squared distance `dx*dx + dy*dy` as the key so everything stays an exact integer (no square roots, no float comparison).\n2. A group of `c` points at the same distance gives `c * (c - 1)` ordered choices of `(b, c)`.\n\nSum that over every choice of `a`.\n\nTwo things to watch: the pairs are ordered, so the factor is `c * (c - 1)` rather than `c * (c - 1) // 2`; and the dict must be rebuilt for each `a`, since distances are measured from that point.\n\nO(n^2) time, O(n) space.",
    functionName: "count_boomerangs",
    functionSignature: "def count_boomerangs(points: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def count_boomerangs(points: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[0, 0], [1, 0], [2, 0]]], expected: 2 },
      { input: [[[0, 0], [1, 0], [0, 1], [1, 1]]], expected: 8 },
      { input: [[[1, 1], [5, 5]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[[3, 4]]], expected: 0 },
      { input: [[[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]], expected: 20 },
      { input: [[[0, 0], [3, 4], [5, 0], [4, 3], [-5, 0]]], expected: 12 },
      { input: [[[0, 0], [2, 0], [1, 1], [1, -1], [1, 5]]], expected: 10 },
      { input: [[[1, 1], [2, 2], [3, 3], [4, 4]]], expected: 4 },
    ],
  },
  {
    id: "almost-even-letter-counts",
    number: 503,
    title: "Almost Even Letter Counts",
    difficulty: "Hard",
    topic: "Hash Table",
    statement:
      "Given a string `s` of lowercase English letters, count its non-empty contiguous substrings in which at most one letter occurs an odd number of times (these are exactly the substrings whose letters could be rearranged into a palindrome). Substrings are counted by position, so equal text at different positions counts each time. Return `0` for an empty string.",
    explanation:
      "There are O(n^2) substrings, and checking each one directly is too slow for long strings. Only the parity of each letter's count matters, so describe a prefix by a 26-bit mask: bit `b` is 1 when letter `b` has appeared an odd number of times so far.\n\nThe parity mask of the substring between two prefixes is the XOR of their masks. So the substring is\n- all-even when the two prefix masks are equal, and\n- odd in exactly one letter when the masks differ in exactly one bit.\n\nWalk the string keeping the current mask and a dict `seen[mask]` = how many earlier prefixes had that mask (start with `seen[0] = 1` for the empty prefix). After toggling the bit for the current letter:\n1. add `seen[mask]` (substrings with every count even), and\n2. for each of the 26 bits add `seen[mask ^ (1 << b)]` (substrings with one odd letter),\n3. then increment `seen[mask]`.\n\nForgetting the empty prefix loses every substring that starts at index 0; forgetting step 2 counts only the all-even ones (and so misses every single character).\n\nO(26 * n) time, O(n) space.",
    functionName: "count_near_even_substrings",
    functionSignature: "def count_near_even_substrings(s: str) -> int:",
    starter:
      STARTER_HEADER +
      "def count_near_even_substrings(s: str) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["aba"], expected: 4 },
      { input: ["aabb"], expected: 9 },
      { input: ["abc"], expected: 3 },
    ],
    hiddenTests: [
      { input: [""], expected: 0 },
      { input: ["z"], expected: 1 },
      { input: ["abab"], expected: 7 },
      { input: ["racecar"], expected: 10 },
      { input: ["aaaaa"], expected: 15 },
      { input: ["abcabcabc"], expected: 21 },
    ],
  },
  {
    id: "word-tiles-in-a-row",
    number: 504,
    title: "Word Tiles in a Row",
    difficulty: "Hard",
    topic: "Hash Table",
    statement:
      "You are given a string `s` and a non-empty list `words` of tiles. All tiles have the same length (at least 1), and the list may contain the same tile more than once. Find every index `i` such that the substring of `s` starting at `i` is made by laying all the tiles end to end, using each entry of `words` exactly once, in some arrangement. Return the indices in ascending order (an empty list if there are none).",
    explanation:
      "Trying every arrangement of the tiles is factorial. Because every tile has the same length `L`, a candidate substring splits into fixed chunks of `L` characters, and all that matters is whether the multiset of chunks equals the multiset of tiles.\n\nSimple version: let `need = Counter(words)`. For each start `i`, cut the next `len(words) * L` characters into chunks, count them, and compare with `need`. That is O(n * m) chunk operations for `m` tiles.\n\nFaster sliding-window version: handle each alignment `offset` in `0..L-1` separately. Slide over `s` one chunk at a time, keeping a `have` counter and a `left` edge:\n- if the chunk is not a tile, clear the window and restart after it;\n- otherwise add it, and while `have[chunk] > need[chunk]` drop chunks from the left;\n- when the window holds exactly `m` chunks, record `left`.\n\nEach chunk enters and leaves a window once per alignment, giving O(n * L) character work overall. Collect the starts and sort them at the end.\n\nCommon mistakes: using a set instead of a counter (duplicate tiles must be matched the right number of times), and only testing starts that are multiples of `L` (a match can begin at any index).",
    functionName: "find_concatenation_starts",
    functionSignature: "def find_concatenation_starts(s: str, words: list[str]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def find_concatenation_starts(s: str, words: list[str]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["barfoothefoobarman", ["foo", "bar"]], expected: [0, 9] },
      { input: ["xfoobarfoo", ["bar", "foo"]], expected: [1, 4] },
      { input: ["foofoobar", ["foo", "bar"]], expected: [3] },
    ],
    hiddenTests: [
      { input: ["wordgoodgoodgoodbestword", ["word", "good", "best", "word"]], expected: [] },
      { input: ["barfoofoobarthefoobarman", ["bar", "foo", "the"]], expected: [6, 9, 12] },
      { input: ["aaaaaa", ["aa", "aa"]], expected: [0, 1, 2] },
      { input: ["ab", ["abc"]], expected: [] },
      { input: ["abababab", ["ab", "ba"]], expected: [] },
      { input: ["catdogcatcatdog", ["cat", "dog", "cat"]], expected: [0, 3, 6] },
    ],
  },
  {
    id: "first-failing-build",
    number: 505,
    title: "First Failing Build",
    difficulty: "Easy",
    topic: "Binary Search",
    statement:
      "A nightly build worked for a while, then a bad commit landed and every build after it failed. You are given `broken`, a list of booleans in build order where `broken[i]` is `True` if build `i` failed; once a `True` appears, every later entry is also `True`. Return the index of the first failing build, or `-1` if no build failed (including when the list is empty).",
    explanation:
      "A left-to-right scan is O(n). Because the list is all `False` followed by all `True`, you can binary search for the boundary instead.\n\nKeep a half-open range `[lo, hi)` that must contain the first `True` (or end at `len(broken)` if there is none). Start with `lo = 0`, `hi = len(broken)`.\n\n- Look at `mid = (lo + hi) // 2`.\n- If `broken[mid]` is `True`, the first failure is at `mid` or earlier: `hi = mid`.\n- Otherwise it is strictly after `mid`: `lo = mid + 1`.\n\nWhen `lo == hi`, that index is the first `True`. If it equals `len(broken)`, nothing failed, so return `-1`.\n\nThe typical bugs are setting `hi = mid - 1` (which can skip the answer) and forgetting the all-`False` case.\n\nO(log n) time, O(1) space.",
    functionName: "first_failing_build",
    functionSignature: "def first_failing_build(broken: list[bool]) -> int:",
    starter:
      STARTER_HEADER +
      "def first_failing_build(broken: list[bool]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[false, false, true, true, true]], expected: 2 },
      { input: [[false, false, false]], expected: -1 },
      { input: [[true, true]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: -1 },
      { input: [[false]], expected: -1 },
      { input: [[true]], expected: 0 },
      { input: [[false, false, false, false, false, false, true]], expected: 6 },
      { input: [[false, true, true, true, true, true, true, true]], expected: 1 },
      { input: [[false, false, false, false, true, true]], expected: 4 },
    ],
  },
  {
    id: "complete-staircase-rows",
    number: 506,
    title: "Complete Staircase Rows",
    difficulty: "Easy",
    topic: "Binary Search",
    statement:
      "You are stacking `n` blocks (`n >= 0`) into a staircase: the first row uses 1 block, the second row uses 2, the third uses 3, and so on. Rows are built in that order and a row only counts once it is completely filled. Return the number of complete rows you can build with `n` blocks.",
    explanation:
      "`r` complete rows need `1 + 2 + ... + r = r * (r + 1) // 2` blocks. That total grows as `r` grows, so the question is: what is the largest `r` with `r * (r + 1) // 2 <= n`? A monotonic yes/no condition like that is a binary search over the answer.\n\nSearch `r` in `[0, n]`:\n- `mid = (lo + hi + 1) // 2` (round up, because the update below is `lo = mid`).\n- If `mid * (mid + 1) // 2 <= n`, `mid` rows fit: `lo = mid`.\n- Otherwise `hi = mid - 1`.\n\nReturn `lo`.\n\nRounding `mid` down with `lo = mid` loops forever when `hi == lo + 1`; that is the classic bug in \"find the last value that works\" searches. Subtracting rows one at a time also works but is O(sqrt(n)); the binary search is O(log n) and stays in exact integer arithmetic (a floating-point square-root formula can be off by one for large `n`).",
    functionName: "full_staircase_rows",
    functionSignature: "def full_staircase_rows(n: int) -> int:",
    starter:
      STARTER_HEADER +
      "def full_staircase_rows(n: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5], expected: 2 },
      { input: [8], expected: 3 },
      { input: [6], expected: 3 },
    ],
    hiddenTests: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [10], expected: 4 },
      { input: [9], expected: 3 },
      { input: [999961560], expected: 44720 },
      { input: [999961559], expected: 44719 },
    ],
  },
  {
    id: "next-letter-around-the-ring",
    number: 507,
    title: "Next Letter Around the Ring",
    difficulty: "Easy",
    topic: "Binary Search",
    statement:
      "You are given a non-empty list `letters` of lowercase letters sorted in non-decreasing order (repeats allowed) and a lowercase letter `target`. Return the smallest letter in the list that is strictly greater than `target`. If no letter in the list is greater, wrap around and return the first letter of the list.",
    explanation:
      "The list is sorted, so the letters greater than `target` form a suffix. Binary search for where that suffix begins.\n\nUse a half-open range `[lo, hi)` starting at `[0, len(letters))`:\n- `mid = (lo + hi) // 2`.\n- If `letters[mid] > target`, the answer is at `mid` or to its left: `hi = mid`.\n- Otherwise (`<=`), move right: `lo = mid + 1`.\n\nAt the end `lo` is the index of the first letter greater than `target`. If `lo == len(letters)` nothing is greater, so return `letters[0]`.\n\nThe comparison must be strict. Treating an equal letter as a match is the common mistake: with `letters = ['c', 'f', 'j']` and `target = 'c'` the answer is `'f'`, not `'c'`. In Python this is `bisect_right(letters, target)`.\n\nO(log n) time, O(1) space.",
    functionName: "next_letter_after",
    functionSignature: "def next_letter_after(letters: list[str], target: str) -> str:",
    starter:
      STARTER_HEADER +
      "def next_letter_after(letters: list[str], target: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["c", "f", "j"], "a"], expected: "c" },
      { input: [["c", "f", "j"], "c"], expected: "f" },
      { input: [["c", "f", "j"], "j"], expected: "c" },
    ],
    hiddenTests: [
      { input: [["a"], "a"], expected: "a" },
      { input: [["a", "a", "b", "b"], "a"], expected: "b" },
      { input: [["a", "a", "b", "b"], "b"], expected: "a" },
      { input: [["c", "f", "j"], "z"], expected: "c" },
      { input: [["b", "d", "d", "k", "x", "x"], "e"], expected: "k" },
      { input: [["b", "d", "d", "k", "x", "x"], "w"], expected: "x" },
    ],
  },
  {
    id: "odd-one-in-sorted-pairs",
    number: 508,
    title: "Odd One in Sorted Pairs",
    difficulty: "Medium",
    topic: "Binary Search",
    statement:
      "You are given a list `nums` sorted in ascending order in which every value appears exactly twice, except for one value that appears exactly once (so the length is odd and at least 1). Return the value that appears once. Aim for O(log n) time.",
    explanation:
      "A linear scan (or XOR of everything) is O(n). The sorted order lets you do better by looking at how pairs line up with indices.\n\nBefore the single value, every pair occupies indices `(even, odd)`: positions 0-1, 2-3, and so on. After the single value, everything is shifted by one, so pairs sit at `(odd, even)`. So at any even index `m`:\n- if `nums[m] == nums[m + 1]`, the pairing is still intact, so the single value is to the right of this pair;\n- otherwise the single value is at `m` or to its left.\n\nBinary search with `lo = 0`, `hi = len(nums) - 1`:\n1. `mid = (lo + hi) // 2`; if `mid` is odd, subtract 1 so it is even.\n2. If `nums[mid] == nums[mid + 1]`: `lo = mid + 2`.\n3. Else: `hi = mid`.\n\nWhen `lo == hi`, return `nums[lo]`. Because `mid` is even and less than `hi`, `mid + 1` is always in range.\n\nForgetting to force `mid` even (or mixing up which side to keep) sends the search the wrong way when the single value is near either end.\n\nO(log n) time, O(1) space.",
    functionName: "lone_in_sorted_pairs",
    functionSignature: "def lone_in_sorted_pairs(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def lone_in_sorted_pairs(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 1, 2, 3, 3, 4, 4, 8, 8]], expected: 2 },
      { input: [[3, 3, 7, 7, 10, 11, 11]], expected: 10 },
      { input: [[5]], expected: 5 },
    ],
    hiddenTests: [
      { input: [[1, 2, 2]], expected: 1 },
      { input: [[1, 1, 2]], expected: 2 },
      { input: [[0, 4, 4, 6, 6, 9, 9]], expected: 0 },
      { input: [[-5, -5, -2, -2, 0, 0, 7]], expected: 7 },
      { input: [[1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]], expected: 3 },
      { input: [[2, 2, 3, 5, 5]], expected: 3 },
    ],
  },
  {
    id: "kth-skipped-number",
    number: 509,
    title: "K-th Skipped Number",
    difficulty: "Medium",
    topic: "Binary Search",
    statement:
      "You are given a list `nums` of positive integers in strictly increasing order (possibly empty) and an integer `k >= 1`. Counting upward from 1, some positive integers are skipped by the list. Return the `k`-th skipped positive integer. For example, with `nums = [2, 3, 7]` the skipped numbers are 1, 4, 5, 6, 8, 9, ...",
    explanation:
      "Counting up from 1 and checking membership works but takes time proportional to the answer. The sorted list lets you compute directly how many numbers are skipped before each element.\n\nIf nothing were skipped, `nums[i]` would equal `i + 1`. So the number of skipped integers smaller than `nums[i]` is `nums[i] - (i + 1)`, and that quantity never decreases as `i` grows. Binary search for the first index whose skipped count is at least `k`:\n\n- `lo = 0`, `hi = len(nums)`.\n- `mid = (lo + hi) // 2`; if `nums[mid] - (mid + 1) < k`, the answer lies beyond `nums[mid]`: `lo = mid + 1`; else `hi = mid`.\n\nAfter the loop, exactly `lo` list elements are smaller than the answer, so the answer is `lo + k` (the `k`-th skipped number is pushed up by one for every list element below it).\n\nThis formula also covers the edge cases with no special code: an empty list gives `k`, and a `k` beyond the last element gives `len(nums) + k`. Off-by-one slips usually come from using `<=` in the comparison.\n\nO(log n) time, O(1) space.",
    functionName: "kth_missing_positive",
    functionSignature: "def kth_missing_positive(nums: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def kth_missing_positive(nums: list[int], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[2, 3, 4, 7, 11], 5], expected: 9 },
      { input: [[1, 2, 3, 4], 2], expected: 6 },
      { input: [[2, 3, 7], 4], expected: 6 },
    ],
    hiddenTests: [
      { input: [[], 3], expected: 3 },
      { input: [[5], 4], expected: 4 },
      { input: [[5], 5], expected: 6 },
      { input: [[1, 3], 1], expected: 2 },
      { input: [[2], 1], expected: 1 },
      { input: [[1, 2, 3, 10, 20, 30], 6], expected: 9 },
    ],
  },
  {
    id: "k-nearest-readings",
    number: 510,
    title: "K Nearest Readings",
    difficulty: "Medium",
    topic: "Binary Search",
    statement:
      "You are given a list `nums` sorted in non-decreasing order, an integer `k` with `1 <= k <= len(nums)`, and a target `x`. Pick the `k` entries of `nums` that are closest to `x` and return them in ascending order. Entry `a` is closer than entry `b` when `abs(a - x) < abs(b - x)`, or when the distances are equal and `a < b` (on a tie the smaller value wins).",
    explanation:
      "Sorting everything by distance is O(n log n) and ignores the fact that the list is already sorted. In a sorted list the `k` closest entries always form one contiguous window, so you only need its left edge, which is somewhere in `0..n-k`.\n\nBinary search on that left edge `i`. Compare the element that would be dropped on the left, `nums[i]`, with the element that would be gained on the right, `nums[i + k]`:\n- if `x - nums[i] > nums[i + k] - x`, the right element is strictly closer, so the window should move right: `lo = mid + 1`;\n- otherwise keep the window here or further left: `hi = mid`.\n\nReturn `nums[lo:lo + k]`.\n\nThe strict `>` is what implements the tie rule: on equal distance the smaller (left) value is kept. Note the comparison uses signed differences rather than `abs`; that keeps it correct when `x` is outside the window or the list has duplicates.\n\nO(log(n - k) + k) time. A two-pointer shrink from both ends is a fine O(n) alternative.",
    functionName: "k_nearest_values",
    functionSignature: "def k_nearest_values(nums: list[int], k: int, x: int) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def k_nearest_values(nums: list[int], k: int, x: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 4, 5], 4, 3], expected: [1, 2, 3, 4] },
      { input: [[1, 5, 9], 1, 7], expected: [5] },
      { input: [[1, 3, 5, 7], 2, 4], expected: [3, 5] },
    ],
    hiddenTests: [
      { input: [[1, 2, 3, 4, 5], 4, -1], expected: [1, 2, 3, 4] },
      { input: [[1, 2, 3, 4, 5], 2, 99], expected: [4, 5] },
      { input: [[7], 1, 0], expected: [7] },
      { input: [[1, 5, 9], 2, 7], expected: [5, 9] },
      { input: [[1, 1, 2, 2, 2, 3], 3, 2], expected: [2, 2, 2] },
      { input: [[0, 0, 1, 2, 3, 3, 4, 7, 7, 8], 3, 5], expected: [3, 3, 4] },
    ],
  },
  {
    id: "warm-every-house",
    number: 511,
    title: "Warm Every House",
    difficulty: "Medium",
    topic: "Binary Search",
    statement:
      "Houses and heaters stand along a straight street. `houses` and `heaters` list their integer positions; neither list is necessarily sorted, and `heaters` has at least one entry. Every heater warms everything within the same radius `r` of its position (a house at distance exactly `r` is warm). Return the smallest integer `r` for which every house is warm. If there are no houses, return `0`.",
    explanation:
      "Each house only cares about its nearest heater, and the answer is the largest of those nearest distances. Scanning all heaters for each house is O(houses * heaters); sorting the heaters lets you find the nearest one with a binary search.\n\n1. Sort `heaters`.\n2. For each house `h`, find `i = bisect_left(heaters, h)`, the first heater at or to the right of `h`.\n   - The candidate on the right is `heaters[i]` (if `i < len(heaters)`).\n   - The candidate on the left is `heaters[i - 1]` (if `i > 0`).\n   - The house's distance is the smaller of the two gaps.\n3. The answer is the maximum distance over all houses (0 when there are none).\n\nThe usual bugs are forgetting to sort the heaters (the input is not guaranteed sorted), and checking only one side: a house can sit left of every heater or right of every heater, so both neighbours must be guarded with bounds checks.\n\nO((h + t) log t) time for `h` houses and `t` heaters, O(1) extra space beyond the sort.",
    functionName: "min_heater_radius",
    functionSignature: "def min_heater_radius(houses: list[int], heaters: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def min_heater_radius(houses: list[int], heaters: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3], [2]], expected: 1 },
      { input: [[1, 2, 3, 4], [1, 4]], expected: 1 },
      { input: [[1, 5], [10, 2]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[], [3]], expected: 0 },
      { input: [[7], [7]], expected: 0 },
      { input: [[1, 100], [50]], expected: 50 },
      { input: [[20, 4, 12, 9], [15, 1, 8]], expected: 5 },
      { input: [[-5, 0, 30], [25, -1]], expected: 5 },
      { input: [[1, 2, 3, 4, 5, 6], [6]], expected: 5 },
    ],
  },
  {
    id: "kth-entry-of-the-times-table",
    number: 512,
    title: "K-th Entry of the Times Table",
    difficulty: "Hard",
    topic: "Binary Search",
    statement:
      "Picture a multiplication table with `m` rows and `n` columns (`m, n >= 1`), where the cell in row `i` and column `j` (both counted from 1) holds `i * j`. If you wrote out all `m * n` cells in non-decreasing order, repeats included, which number would be in position `k` (counted from 1, with `1 <= k <= m * n`)? Return that number.",
    explanation:
      "Building and sorting the table is O(mn log(mn)), which is hopeless for large tables. Instead, binary search on the answer's value.\n\nKey helper: how many cells are `<= x`? In row `i` the cells are `i, 2i, 3i, ...`, so `min(x // i, n)` of them are `<= x`. Summing over the `m` rows takes O(m).\n\nThat count never decreases as `x` grows, and the answer is the smallest `x` for which `count(x) >= k`:\n- `lo = 1`, `hi = m * n`.\n- `mid = (lo + hi) // 2`; if `count(mid) >= k` then `hi = mid`, else `lo = mid + 1`.\n- Return `lo`.\n\nWhy is the result always a number that really appears in the table? If `x` is the smallest value with `count(x) >= k`, then `count(x - 1) < k`, so at least one cell equals exactly `x`.\n\nPitfalls: forgetting the `min(..., n)` cap (a row has only `n` cells), and searching for `count == k`, which fails when the k-th value is repeated and the count jumps past `k`.\n\nO(m log(mn)) time, O(1) space.",
    functionName: "kth_in_times_table",
    functionSignature: "def kth_in_times_table(m: int, n: int, k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def kth_in_times_table(m: int, n: int, k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [3, 3, 5], expected: 3 },
      { input: [2, 3, 6], expected: 6 },
      { input: [3, 3, 7], expected: 6 },
    ],
    hiddenTests: [
      { input: [1, 1, 1], expected: 1 },
      { input: [3, 3, 1], expected: 1 },
      { input: [9, 9, 81], expected: 81 },
      { input: [1, 10, 7], expected: 7 },
      { input: [10, 1, 7], expected: 7 },
      { input: [45, 12, 471], expected: 312 },
    ],
  },
  {
    id: "keep-n-laptops-running",
    number: 513,
    title: "Keep N Laptops Running",
    difficulty: "Hard",
    topic: "Binary Search",
    statement:
      "You have `n` laptops and a pile of batteries, where `batteries[i]` is how many whole minutes battery `i` can power one laptop (`1 <= n <= len(batteries)`, every value at least 1). A laptop draws from one battery at a time and a battery powers one laptop at a time, but at the start of any minute you may swap batteries around freely and instantly; batteries cannot be recharged. Return the largest number of whole minutes for which all `n` laptops can be running at the same time.",
    explanation:
      "Simulating the swaps is hard to get right and slow when the charges are large. Ask the yes/no question instead: can all `n` laptops run for `T` minutes?\n\nOver `T` minutes a single battery can contribute at most `min(charge, T)` minutes, because it can only be in one laptop at a time (a huge battery cannot be in two places). The laptops need `n * T` battery-minutes in total. It turns out that\n\n`sum(min(b, T) for b in batteries) >= n * T`\n\nis not only necessary but sufficient: whenever the capped total is large enough, a schedule exists (each minute, use the `n` batteries with the most charge left).\n\nIf `T` minutes are feasible then so is anything smaller, so binary search for the largest feasible `T`:\n- `lo = 0`, `hi = sum(batteries) // n` (cannot beat the plain average).\n- `mid = (lo + hi + 1) // 2` (round up since we set `lo = mid`).\n- Feasible: `lo = mid`; otherwise `hi = mid - 1`.\n\nThe two tempting shortcuts are both wrong. `sum // n` ignores the cap: with 2 laptops and batteries `[100, 1]` it says 50, but the big battery can only run one laptop, so the answer is 1. Taking the `n`-th largest battery ignores swapping: with 2 laptops and `[3, 3, 3]` you can rotate to get 4 minutes, not 3.\n\nO(len(batteries) * log(sum / n)) time, O(1) space.",
    functionName: "max_shared_runtime",
    functionSignature: "def max_shared_runtime(n: int, batteries: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def max_shared_runtime(n: int, batteries: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [2, [3, 3, 3]], expected: 4 },
      { input: [2, [100, 1]], expected: 1 },
      { input: [2, [1, 1, 1, 1]], expected: 2 },
    ],
    hiddenTests: [
      { input: [1, [5, 2]], expected: 7 },
      { input: [3, [10, 10, 3, 5]], expected: 8 },
      { input: [3, [8, 8, 8]], expected: 8 },
      { input: [1, [4]], expected: 4 },
      { input: [2, [6, 1, 1, 1]], expected: 3 },
      { input: [4, [9, 2, 7, 4, 4, 1]], expected: 5 },
    ],
  },
  {
    id: "windows-meeting-the-average",
    number: 514,
    title: "Windows Meeting the Average",
    difficulty: "Easy",
    topic: "Sliding Window",
    statement:
      "Given a list of integers `nums` (values may be negative), a window size `k >= 1` and an integer `threshold`, count the contiguous windows of exactly `k` elements whose average is greater than or equal to `threshold`. If `k` is larger than the list, return `0`.",
    explanation:
      "Summing each window from scratch costs O(n * k). Adjacent windows share all but two elements, so keep a running sum: add the element entering on the right and subtract the one leaving on the left.\n\nAvoid division entirely: `average >= threshold` is the same as `window_sum >= k * threshold`, which keeps everything in integers.\n\n1. If `k > len(nums)`, return 0.\n2. Compute the sum of the first `k` elements and test it.\n3. For each `i` from `k` to the end: `window += nums[i] - nums[i - k]`, then test again.\n\nOff-by-one errors are the main risk: there are `len(nums) - k + 1` windows, and both the first and the last one must be tested. The comparison is `>=`, so a window whose average equals the threshold counts.\n\nO(n) time, O(1) space.",
    functionName: "count_windows_meeting_average",
    functionSignature: "def count_windows_meeting_average(nums: list[int], k: int, threshold: int) -> int:",
    starter:
      STARTER_HEADER +
      "def count_windows_meeting_average(nums: list[int], k: int, threshold: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[2, 2, 2, 2, 5, 5, 5, 8], 3, 4], expected: 3 },
      { input: [[11, 13, 17, 23, 29, 31, 7, 5, 2, 3], 3, 5], expected: 6 },
      { input: [[4, 4, 1], 2, 4], expected: 1 },
    ],
    hiddenTests: [
      { input: [[1], 1, 1], expected: 1 },
      { input: [[1, 2], 3, 0], expected: 0 },
      { input: [[-1, -2, -3], 2, -2], expected: 1 },
      { input: [[5, 1, 1, 1, 6], 5, 3], expected: 0 },
      { input: [[0, 0, 0, 9], 2, 4], expected: 1 },
      { input: [[3, 3, 3], 1, 4], expected: 0 },
    ],
  },
  {
    id: "all-different-windows",
    number: 515,
    title: "All-Different Windows",
    difficulty: "Easy",
    topic: "Sliding Window",
    statement:
      "Given a string `s` and an integer `k >= 1`, count the contiguous substrings of length exactly `k` in which no character appears more than once. Substrings are counted by position, so the same text at two different positions counts twice. If `k` is larger than the string, return `0`.",
    explanation:
      "Building a set for every window is O(n * k). A fixed-size sliding window with character counts does it in one pass.\n\nKeep a dict `counts` for the characters in the current window and a number `repeated` = how many distinct characters currently have a count of 2 or more.\n\nFor each index `i`:\n1. Add `s[i]`: increment its count; if the count just became 2, `repeated += 1`.\n2. If the window is now longer than `k`, remove `s[i - k]`: decrement its count; if the count just dropped to 1, `repeated -= 1`.\n3. If the window holds exactly `k` characters (`i >= k - 1`) and `repeated == 0`, count it.\n\nTracking `repeated` is what keeps each step O(1); checking `len(counts) == k` also works if you delete keys that fall to zero (forgetting to delete them is a common bug, since stale zero entries inflate the length).\n\nO(n) time, O(min(n, alphabet)) space.",
    functionName: "count_distinct_windows",
    functionSignature: "def count_distinct_windows(s: str, k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def count_distinct_windows(s: str, k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["xyzzaz", 3], expected: 1 },
      { input: ["aababcabc", 3], expected: 4 },
      { input: ["abc", 1], expected: 3 },
    ],
    hiddenTests: [
      { input: ["ab", 3], expected: 0 },
      { input: ["abcdef", 6], expected: 1 },
      { input: ["aaaa", 2], expected: 0 },
      { input: ["", 1], expected: 0 },
      { input: ["abcabcd", 4], expected: 1 },
      { input: ["abab", 2], expected: 3 },
    ],
  },
  {
    id: "ring-neighbor-sums",
    number: 516,
    title: "Ring Neighbor Sums",
    difficulty: "Easy",
    topic: "Sliding Window",
    statement:
      "The numbers in `nums` (length `n >= 1`) sit around a ring, so the element after the last one is the first, and the element before the first is the last. Given an integer `k` with `abs(k) < n`, build a new list `out` of the same length:\n\n- if `k > 0`, `out[i]` is the sum of the `k` elements that come right after position `i`;\n- if `k < 0`, `out[i]` is the sum of the `abs(k)` elements that come right before position `i`;\n- if `k == 0`, `out[i]` is `0`.\n\nPosition `i` itself is never part of its own sum. All sums use the original values. Return `out`.",
    explanation:
      "Recomputing each sum is O(n * |k|). The window for position `i + 1` is the window for position `i` shifted one step around the ring, so slide it: add the element that enters, subtract the one that leaves.\n\n1. If `k == 0`, return a list of zeros.\n2. Let `size = abs(k)`. The window for position 0 starts at index `1` when `k > 0` (the next elements) or at index `n - size` when `k < 0` (the previous elements). Sum those `size` elements, using `% n` to wrap.\n3. For each position `i`: record the current sum, then slide by one: `window += nums[(start + i + size) % n] - nums[(start + i) % n]`.\n\nThe modulo is what makes the ring work; without it the indices run off the end. The other frequent error is including `nums[i]` itself, or getting the direction backwards for negative `k`.\n\nO(n) time, O(1) extra space besides the output.",
    functionName: "circular_window_sums",
    functionSignature: "def circular_window_sums(nums: list[int], k: int) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def circular_window_sums(nums: list[int], k: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[5, 7, 1, 4], 3], expected: [12, 10, 16, 13] },
      { input: [[2, 4, 9, 3], -2], expected: [12, 5, 6, 13] },
      { input: [[1, 2, 3, 4], 0], expected: [0, 0, 0, 0] },
    ],
    hiddenTests: [
      { input: [[7], 0], expected: [0] },
      { input: [[1, 2, 3], 1], expected: [2, 3, 1] },
      { input: [[1, 2, 3], -1], expected: [3, 1, 2] },
      { input: [[10, 5, 2, 7, 8, 7], -3], expected: [22, 25, 22, 17, 14, 17] },
      { input: [[10, 5, 2, 7, 8, 7], 5], expected: [29, 34, 37, 32, 31, 32] },
      { input: [[-4, 6, 0, 3, -1], 2], expected: [6, 3, 2, -5, 2] },
    ],
  },
  {
    id: "draw-from-both-ends",
    number: 517,
    title: "Draw From Both Ends",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement:
      "A row of cards lies face up; `cards[i]` is the value of card `i` (values may be negative). You must take exactly `k` cards (`0 <= k <= len(cards)`), and each card you take has to be the current leftmost or the current rightmost card of the row. Return the largest total value you can collect. With `k = 0` the total is `0`.",
    explanation:
      "Greedily taking the bigger end each time fails, because a small card can be hiding a big one behind it. Look at the outcome instead: whatever order you draw in, you end up with some number `L` of cards from the left end and `k - L` from the right end. There are only `k + 1` such splits.\n\nEquivalently, the cards you leave behind form one contiguous window of length `n - k` in the middle, and you want that window's sum to be as small as possible.\n\nSliding version over the splits:\n1. Start with all `k` cards from the left: `current = sum(cards[:k])`.\n2. For `t = 1..k`, trade one left card for one right card: `current += cards[n - t] - cards[k - t]`.\n3. Track the maximum of `current` over all `k + 1` states.\n\nEach trade is O(1), so the whole thing is O(k) time and O(1) space. Remember to include both extremes (all from the left, all from the right); skipping one of them is the usual off-by-one.",
    functionName: "best_ends_total",
    functionSignature: "def best_ends_total(cards: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def best_ends_total(cards: list[int], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 4, 5, 6, 1], 3], expected: 12 },
      { input: [[1, 79, 80, 1, 1, 1, 200, 1], 3], expected: 202 },
      { input: [[2, 2, 2], 2], expected: 4 },
    ],
    hiddenTests: [
      { input: [[9, 7, 7, 9, 7, 7, 9], 7], expected: 55 },
      { input: [[4, 8], 0], expected: 0 },
      { input: [[5], 1], expected: 5 },
      { input: [[-1, 10, -5, 3], 2], expected: 9 },
      { input: [[100, 40, 17, 9, 73, 75], 3], expected: 248 },
      { input: [[1, 1000, 1], 1], expected: 1 },
    ],
  },
  {
    id: "the-calm-technique",
    number: 518,
    title: "The Calm Technique",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement:
      "A shop is open for `n` minutes (`n >= 1`). `customers[i]` people visit during minute `i`, and `grumpy[i]` is `1` if the owner is grumpy during that minute and `0` otherwise. Customers who visit during a grumpy minute leave unsatisfied; the others leave satisfied. Once per day the owner can use a calming technique that keeps them not grumpy for `minutes` consecutive minutes (`1 <= minutes <= n`). Return the largest number of customers that can leave satisfied.",
    explanation:
      "Split the total into two parts. Customers in non-grumpy minutes are satisfied no matter what; call that `base`. The technique only helps with customers in grumpy minutes inside the chosen window, so the question becomes: which window of length `minutes` contains the most customers from grumpy minutes?\n\n1. `base` = sum of `customers[i]` where `grumpy[i] == 0`.\n2. Slide a window of length `minutes`, keeping `window` = sum of `customers[i]` over grumpy minutes inside it. When index `i` enters, add `customers[i]` if `grumpy[i] == 1`; when index `i - minutes` leaves, subtract it if that minute was grumpy.\n3. Track the largest `window` seen. Answer: `base + best`.\n\nThe tempting mistake is choosing the window with the most customers overall. Customers in minutes that were already calm are counted in `base`, so they add nothing; only the grumpy minutes inside the window are a gain.\n\nO(n) time, O(1) space.",
    functionName: "max_satisfied_customers",
    functionSignature: "def max_satisfied_customers(customers: list[int], grumpy: list[int], minutes: int) -> int:",
    starter:
      STARTER_HEADER +
      "def max_satisfied_customers(customers: list[int], grumpy: list[int], minutes: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 0, 1, 2, 1, 1, 7, 5], [0, 1, 0, 1, 0, 1, 0, 1], 3], expected: 16 },
      { input: [[9, 9, 1, 1, 5], [0, 0, 1, 1, 1], 2], expected: 24 },
      { input: [[1], [0], 1], expected: 1 },
    ],
    hiddenTests: [
      { input: [[4, 10, 10], [1, 1, 0], 2], expected: 24 },
      { input: [[5, 5], [1, 1], 1], expected: 5 },
      { input: [[3, 8, 2], [1, 1, 1], 3], expected: 13 },
      { input: [[2, 6, 6, 9], [0, 0, 0, 0], 2], expected: 23 },
      { input: [[7, 1, 1, 1, 6, 6], [1, 0, 1, 0, 1, 1], 2], expected: 14 },
      { input: [[0, 3, 0, 4, 0, 5], [1, 1, 1, 1, 1, 1], 4], expected: 9 },
    ],
  },
  {
    id: "longest-steady-stretch",
    number: 519,
    title: "Longest Steady Stretch",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement:
      "Given a list of integer sensor readings `nums` and an integer `limit >= 0`, find the longest contiguous stretch in which the largest reading minus the smallest reading is at most `limit`. Return its length (`0` for an empty list).",
    explanation:
      "Checking every stretch is O(n^2) or worse. Use a variable-size window `[left, right]`: grow it on the right, and whenever the spread `max - min` exceeds `limit`, shrink it from the left until it is valid again. This works because shrinking a window can only reduce its spread.\n\nThe hard part is knowing the window's max and min as elements leave. Keep two monotonic deques of indices:\n- `highs`: values decreasing from front to back, so the front is the window maximum;\n- `lows`: values increasing from front to back, so the front is the window minimum.\n\nFor each `right`:\n1. Pop from the back of `highs` while those values are `<=` the new value, then append `right`. Do the mirror image for `lows`.\n2. While `nums[highs[0]] - nums[lows[0]] > limit`: advance `left`, and pop the front of either deque if its index is now left of the window.\n3. Update the best length with `right - left + 1`.\n\nEvery index is pushed and popped at most once per deque, so the total is O(n) time and O(n) space. Tracking only a running max and min without the deques breaks as soon as the max or min leaves the window, because you no longer know the next-best value.",
    functionName: "longest_steady_stretch",
    functionSignature: "def longest_steady_stretch(nums: list[int], limit: int) -> int:",
    starter:
      STARTER_HEADER +
      "def longest_steady_stretch(nums: list[int], limit: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[8, 2, 4, 7], 4], expected: 2 },
      { input: [[10, 1, 2, 4, 7, 2], 5], expected: 4 },
      { input: [[4, 2, 2, 2, 4, 4, 2, 2], 0], expected: 3 },
    ],
    hiddenTests: [
      { input: [[], 3], expected: 0 },
      { input: [[5], 0], expected: 1 },
      { input: [[1, 5, 9], 3], expected: 1 },
      { input: [[-3, -1, 2, 0, 1], 3], expected: 4 },
      { input: [[1, 2, 3, 4, 5, 6], 100], expected: 6 },
      { input: [[7, 1, 7, 1, 7, 2, 2, 3], 1], expected: 3 },
    ],
  },
  {
    id: "raise-to-match",
    number: 520,
    title: "Raise to Match",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement:
      "You are given a non-empty list of integers `nums` and a budget `k >= 0`. One operation picks a single element and increases it by 1 (values can only go up); you may perform at most `k` operations in total. Afterwards, the frequency of a value is the number of elements equal to it. Return the highest frequency you can make any one value reach.",
    explanation:
      "Since values can only be raised, the target value might as well be one that is already in the list, and the cheapest elements to raise to it are the ones just below it. After sorting, those are the elements immediately to its left, so the candidates are contiguous windows of the sorted list ending at the target.\n\nFor a window `[left, right]` in sorted order with target `nums[right]`, the cost of lifting everything to the target is `nums[right] * window_length - window_sum`.\n\n1. Sort `nums`.\n2. Extend `right` one step at a time, adding `nums[right]` to `window_sum`.\n3. While the cost exceeds `k`, subtract `nums[left]` and advance `left`.\n4. Record `right - left + 1`.\n\nThe window is valid to slide because moving `right` forward only makes the cost of a fixed `left` larger, so `left` never needs to move back.\n\nForgetting to sort is the main bug (the input order is arbitrary), followed by computing the cost against the wrong target, such as the window's average.\n\nO(n log n) time for the sort, O(n) for the scan.",
    functionName: "max_frequency_after_bumps",
    functionSignature: "def max_frequency_after_bumps(nums: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def max_frequency_after_bumps(nums: list[int], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 4], 5], expected: 3 },
      { input: [[1, 4, 8, 13], 5], expected: 2 },
      { input: [[9, 1, 8, 2, 8], 3], expected: 3 },
    ],
    hiddenTests: [
      { input: [[5], 0], expected: 1 },
      { input: [[1, 1, 1], 0], expected: 3 },
      { input: [[3, 9, 6], 2], expected: 1 },
      { input: [[1, 2, 2, 10], 1], expected: 3 },
      { input: [[4, 1, 3, 2], 6], expected: 4 },
      { input: [[4, 1, 3, 2], 5], expected: 3 },
    ],
  },
  {
    id: "narrowest-range-touching-every-list",
    number: 521,
    title: "Narrowest Range Touching Every List",
    difficulty: "Hard",
    topic: "Sliding Window",
    statement:
      "You are given `lists`, one or more non-empty lists of integers, each sorted in non-decreasing order. Find a range `[lo, hi]` (inclusive, `lo <= hi`) that contains at least one number from every list. Among all such ranges choose the one with the smallest width `hi - lo`; if several have that width, choose the one with the smallest `lo`. Return it as the two-element list `[lo, hi]`.",
    explanation:
      "Trying every pair of values as endpoints is far too slow. Two equivalent efficient views:\n\n**Pointers plus a min-heap.** Hold one current element from each list. The range covering the current picks is `[min pick, max pick]`. To have any hope of a narrower range you must raise the minimum, so advance the list that owns the minimum.\n1. Push the first element of every list into a min-heap as `(value, list_index, position)` and track `high`, the largest value currently held.\n2. Pop the smallest `low`. If `high - low` is strictly smaller than the best width so far, record `[low, high]`.\n3. If that list has no next element, stop: every later range would miss this list. Otherwise push its next element and update `high`.\n\nBecause `low` only grows during the process and you update only on a strictly smaller width, ties automatically keep the smallest `lo`.\n\n**Sliding window.** Merge all values into one sorted list of `(value, list_index)` and find the shortest window containing every list index at least once, exactly like a minimum-window-substring scan with a count per list.\n\nCommon mistakes: updating on `<=` (which returns a later range on ties), and continuing after one list runs out.\n\nO(N log m) time for `N` total numbers in `m` lists, O(m) space for the heap.",
    functionName: "smallest_covering_range",
    functionSignature: "def smallest_covering_range(lists: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def smallest_covering_range(lists: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]], expected: [20, 24] },
      { input: [[[1, 10], [2, 9]]], expected: [1, 2] },
      { input: [[[1, 2, 3], [1, 2, 3], [1, 2, 3]]], expected: [1, 1] },
    ],
    hiddenTests: [
      { input: [[[1], [5]]], expected: [1, 5] },
      { input: [[[4, 9]]], expected: [4, 4] },
      { input: [[[1, 5, 8], [4, 12], [7, 8, 10]]], expected: [4, 7] },
      { input: [[[-10, -3, 6], [-4, 20], [-5, -5, 7]]], expected: [-5, -3] },
      { input: [[[1, 3, 5], [2, 4, 6]]], expected: [1, 2] },
      { input: [[[10, 10], [11], [1, 2, 30]]], expected: [2, 11] },
    ],
  },
  {
    id: "flip-k-in-a-row",
    number: 522,
    title: "Flip K in a Row",
    difficulty: "Hard",
    topic: "Sliding Window",
    statement:
      "You are given a non-empty list `bits` of `0`s and `1`s and an integer `k` with `1 <= k <= len(bits)`. One move chooses exactly `k` consecutive positions and flips each of them (0 becomes 1, 1 becomes 0). Return the smallest number of moves needed to make every element `1`, or `-1` if it cannot be done.",
    explanation:
      "Two observations make this greedy. Flipping the same window twice cancels out, and the order of moves does not change the result, so each window is used at most once. Now look at the leftmost `0`: the only way to fix it without disturbing positions to its left is the window that starts exactly there. So scan left to right, and whenever the current position is effectively `0`, you are forced to flip the window starting at it.\n\nDoing each flip literally costs O(k) per move, O(n * k) overall. The sliding-window idea is to track only how many active flips cover the current position:\n\n- `active` = number of flips started within the last `k` positions.\n- `ends[i]` = number of flips whose window stops just before index `i`.\n\nFor each index `i`:\n1. `active -= ends[i]` (those windows no longer reach `i`).\n2. The effective bit is `(bits[i] + active) % 2`. If it is `0`:\n   - if `i + k > n`, a window does not fit, so return `-1`;\n   - otherwise count a move, `active += 1`, and `ends[i + k] += 1`.\n\nReturn the move count. The typical mistakes are forgetting to expire old flips (so parity is wrong after `k` steps) and flipping when a window would run past the end instead of returning `-1`.\n\nO(n) time, O(n) space (a queue of at most `k` start positions also works).",
    functionName: "min_k_bit_flips",
    functionSignature: "def min_k_bit_flips(bits: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def min_k_bit_flips(bits: list[int], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[0, 1, 0], 1], expected: 2 },
      { input: [[1, 1, 0], 2], expected: -1 },
      { input: [[0, 0, 0, 1, 0, 1, 1, 0], 3], expected: 3 },
    ],
    hiddenTests: [
      { input: [[1, 1, 1], 2], expected: 0 },
      { input: [[0, 0, 0, 0], 4], expected: 1 },
      { input: [[0, 1, 1, 0], 2], expected: 3 },
      { input: [[1, 0, 0, 1, 0, 1, 1, 0, 1, 1], 2], expected: 4 },
      { input: [[0, 0, 1, 0, 0, 1], 3], expected: 2 },
      { input: [[1, 0, 1, 1, 0, 1], 4], expected: -1 },
    ],
  },
];
