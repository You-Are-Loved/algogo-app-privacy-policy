import type { Blind75Problem } from '../blind75';

const STARTER_HEADER = '# Write your solution below. Do not rename the function.\n';

export const problems: Blind75Problem[] = [
  {
    id: "nearest-smaller-to-the-left",
    number: 466,
    title: "Nearest Smaller To The Left",
    difficulty: "Easy",
    topic: "Monotonic Stack",
    statement:
      "You're given a list of integers `nums`. For every position `i`, find the closest position `j` to its left (`j < i`) whose value is **strictly smaller** than `nums[i]`.\n\nReturn a list of the same length where entry `i` is that index `j`, or `-1` if no earlier value is strictly smaller. Equal values do not count as smaller. An empty input returns an empty list.\n\nFor example, in `[4, 7, 5, 2, 6]` the value `5` at index 2 skips over the `7` and stops at the `4` at index 0, so its answer is `0`.",
    explanation:
      "Scanning backwards from every position is O(n²) in the worst case (think of a long non-increasing list).\n\nThe key idea: once you meet a value `x`, any earlier value that is `>= x` can never again be the answer for a later position, because `x` is both closer and at least as small. So keep a stack of indices whose values are strictly increasing from bottom to top.\n\nFor each index `i`:\n1. Pop while the value on top is `>= nums[i]`.\n2. If the stack is now empty the answer is `-1`, otherwise it is the index on top.\n3. Push `i`.\n\nEvery index is pushed once and popped at most once, so the whole scan is O(n) time and O(n) space. Popping on `>=` (not just `>`) is what makes equal values not count.",
    functionName: "nearest_smaller_left",
    functionSignature: "def nearest_smaller_left(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def nearest_smaller_left(nums: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[4, 7, 5, 2, 6]], expected: [-1, 0, 0, -1, 3] },
      { input: [[3, 3, 3]], expected: [-1, -1, -1] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1]], expected: [-1] },
      { input: [[1, 2, 3, 4]], expected: [-1, 0, 1, 2] },
      { input: [[4, 3, 2, 1]], expected: [-1, -1, -1, -1] },
      { input: [[2, 5, 5, 1, 3, 3, 4]], expected: [-1, 0, 0, -1, 3, 3, 5] },
      { input: [[0, -2, -1, -3, -1]], expected: [-1, -1, 1, -1, 3] },
    ],
  },
  {
    id: "steps-to-a-taller-neighbor",
    number: 467,
    title: "Steps To A Taller Neighbor",
    difficulty: "Medium",
    topic: "Monotonic Stack",
    statement:
      "People stand in a row; `heights[i]` is the height of the person at position `i`. Each person wants to know how far away the nearest **strictly taller** person is, looking in both directions.\n\nReturn a list where entry `i` is the smallest distance `|i - j|` over all positions `j` with `heights[j] > heights[i]`. If nobody in the row is strictly taller than person `i`, entry `i` is `0`. An empty input returns an empty list.\n\nFor example, in `[3, 1, 4, 1, 5]` the person of height 3 has a taller person two steps to the right, so their answer is `2`; the person of height 5 has no one taller, so their answer is `0`.",
    explanation:
      "Checking outward from each person costs O(n²) when heights are flat or sorted.\n\nSplit the question in two: the nearest taller person on the left, and the nearest taller person on the right. Each half is a classic monotonic-stack pass.\n\nLeft pass: walk left to right with a stack of indices whose heights strictly decrease. Before handling `i`, pop every index whose height is `<= heights[i]` (they are hidden behind `i` for everyone further right). If something remains, the top is the nearest taller person on the left, at distance `i - top`.\n\nRight pass: do the same walking right to left, giving distance `top - i`.\n\nTake the smaller of the two distances that exist; if neither exists, the answer is `0`. Two linear passes, O(n) time and O(n) space. Be careful to pop on `<=` so that equal heights are not treated as taller.",
    functionName: "nearest_taller_distance",
    functionSignature: "def nearest_taller_distance(heights: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def nearest_taller_distance(heights: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[3, 1, 4, 1, 5]], expected: [2, 1, 2, 1, 0] },
      { input: [[2, 2, 2]], expected: [0, 0, 0] },
      { input: [[6, 2, 3, 1, 5]], expected: [0, 1, 2, 1, 4] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1, 2, 3, 4, 5]], expected: [1, 1, 1, 1, 0] },
      { input: [[5, 4, 3, 2, 1]], expected: [0, 1, 1, 1, 1] },
      { input: [[9, 1, 1, 1, 1, 1, 9, 2]], expected: [0, 1, 2, 3, 2, 1, 0, 1] },
      { input: [[4, 4, 5, 4, 4, 1, 4]], expected: [2, 1, 0, 1, 2, 1, 4] },
      { input: [[1, 3, 2, 5, 2, 2, 2, 2, 6]], expected: [1, 2, 1, 5, 1, 2, 2, 1, 0] },
    ],
  },
  {
    id: "skyline-height-limits",
    number: 468,
    title: "Skyline Height Limits",
    difficulty: "Medium",
    topic: "Monotonic Stack",
    statement:
      "A row of towers is being planned. Tower `i` may be built to any whole-number height from `1` up to `limits[i]` (every limit is at least 1). The city wants a single-peaked skyline: there must be some tower `p` such that heights never decrease from the first tower up to tower `p`, and never increase from tower `p` to the last tower. Neighbouring towers may have equal heights, and the peak may be the first or the last tower.\n\nReturn the largest possible sum of all tower heights. An empty list returns `0`.\n\nFor example, with `limits = [6, 5, 3, 9, 2, 7]` the best plan is `[3, 3, 3, 9, 2, 2]` with total `22`. Building the first tower to 6 would force everything after the 3 down to at most 3, which is worse.",
    explanation:
      "Once the peak `p` is chosen, the best heights are forced: walking away from the peak in each direction, every tower is built as tall as it can be without exceeding its own limit or the tower before it (a running minimum). Trying every peak this way is O(n²), which is a fine first solution. Picking the tower with the largest limit as the peak is not always right.\n\nA monotonic stack removes the inner loop. Define `left[i]` as the best total for towers `0..i` when heights never decrease and tower `i` stands at its full limit. Let `j` be the nearest index to the left with `limits[j] <= limits[i]`. Every tower between `j` and `i` has a larger limit, so it is capped at `limits[i]`, and from `j` leftwards the plan is exactly the one behind `left[j]`:\n\n`left[i] = left[j] + limits[i] * (i - j)` (with `left[j] = 0` and `j = -1` when no such index exists).\n\nFinding `j` is a previous-smaller-or-equal query: keep a stack of indices with non-decreasing limits, pop while the top's limit is greater than `limits[i]`, and read the top.\n\nCompute `right[i]` the same way on the reversed list. With the peak at `i` the total is `left[i] + right[i] - limits[i]` (the peak is counted twice), and the answer is the maximum over all `i`. Some optimal plan always has its peak at its full limit, so nothing is missed.\n\nTwo linear passes: O(n) time and O(n) space.",
    functionName: "max_mountain_total",
    functionSignature: "def max_mountain_total(limits: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def max_mountain_total(limits: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[6, 5, 3, 9, 2, 7]], expected: 22 },
      { input: [[5, 3, 4, 1, 1]], expected: 13 },
      { input: [[3, 2, 5, 5, 2, 3]], expected: 18 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[4]], expected: 4 },
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[5, 1, 1, 1, 4, 4, 4]], expected: 16 },
      { input: [[9, 1, 9]], expected: 11 },
      { input: [[4, 7, 1, 7, 4, 8, 2]], expected: 21 },
    ],
  },
  {
    id: "price-floor-stretches",
    number: 469,
    title: "Price Floor Stretches",
    difficulty: "Medium",
    topic: "Monotonic Stack",
    statement:
      "`prices[i]` is the price of an item on day `i`. A *stretch* is one or more consecutive days. A stretch **holds its floor** if no day in it has a price strictly lower than the price on the stretch's first day (later days may be equal or higher).\n\nReturn the number of stretches that hold their floor. Stretches are counted by position, so two stretches covering different days are different even if their prices look the same. An empty list has `0` stretches.\n\nFor example, `[3, 5, 4, 2]` has 6 such stretches: `[3]`, `[3, 5]`, `[3, 5, 4]`, `[5]`, `[4]` and `[2]`. The stretch `[5, 4]` does not count because 4 is lower than its first day.",
    explanation:
      "A stretch starting on day `i` holds its floor exactly until the first later day with a strictly lower price. If that day is `j` (or `j = n` when there is none), day `i` contributes `j - i` valid stretches. So the task is really \"find the next strictly smaller element for every index\" and add up the gaps.\n\nDoing that search separately for each day is O(n²). With a monotonic stack it is one pass:\n\n1. Keep a stack of days still waiting for a lower price; their prices are non-decreasing from bottom to top.\n2. On day `i`, pop every waiting day whose price is strictly greater than `prices[i]`; for each popped day `j` add `i - j`.\n3. Push `i`.\n4. At the end, every day `j` still on the stack never saw a lower price, so add `n - j`.\n\nEach day is pushed and popped once: O(n) time, O(n) space. Popping only on strictly greater is essential, since an equal price does not break the floor.",
    functionName: "count_floor_stretches",
    functionSignature: "def count_floor_stretches(prices: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def count_floor_stretches(prices: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[3, 5, 4, 2]], expected: 6 },
      { input: [[2, 2, 2]], expected: 6 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[7]], expected: 1 },
      { input: [[1, 2, 3, 4]], expected: 10 },
      { input: [[4, 3, 2, 1]], expected: 4 },
      { input: [[3, 1, 3, 1, 3]], expected: 9 },
      { input: [[5, 6, 5, 7, 4, 4, 8]], expected: 14 },
    ],
  },
  {
    id: "crystal-fusion-cost",
    number: 470,
    title: "Crystal Fusion Cost",
    difficulty: "Medium",
    topic: "Monotonic Stack",
    statement:
      "A row of crystals has positive integer sizes given by the non-empty list `sizes`. In one step you may fuse two crystals that are **next to each other**. Fusing crystals of sizes `a` and `b` costs `a * b` energy and leaves a single crystal of size `max(a, b)` in their place (so its neighbours are the neighbours the pair had).\n\nKeep fusing until one crystal is left. Return the minimum total energy needed. A row with a single crystal needs `0`.\n\nFor example, with `[6, 2, 4]` it is best to fuse `2` and `4` first (cost 8, leaving `[6, 4]`), then `6` and `4` (cost 24), for a total of `32`. Fusing `6` and `2` first would cost 12 + 24 = `36`.",
    explanation:
      "Every fusion removes the smaller crystal of the pair and charges `smaller * larger`. So each crystal except the overall largest is removed exactly once, and the only choice is which larger neighbour it is paired with at that moment. A small crystal should be removed while its partner is as small as possible, before big crystals have absorbed its neighbours.\n\nGreedy rule: a crystal that is no larger than both of its neighbours (a local minimum) should be fused with the smaller of those two neighbours. Nothing cheaper will ever be available to it, and removing it does not hurt anyone else.\n\nA monotonic stack applies this rule in one pass. Keep a stack of sizes that strictly decreases from bottom to top:\n1. For each new size `x`, while the top is `<= x`, pop it as `mid`; it is a local minimum between the new top and `x`, so add `mid * min(new_top, x)` (if the stack is empty below it, the only neighbour is `x`).\n2. Push `x`.\n3. At the end the stack is strictly decreasing; pop from the top, each time adding `top * the value beneath it`.\n\nThis is O(n) time and O(n) space. The interval DP over every split point also works but costs O(n³); always fusing left to right, or sorting first, gives wrong answers because only neighbours can fuse.",
    functionName: "min_fusion_cost",
    functionSignature: "def min_fusion_cost(sizes: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def min_fusion_cost(sizes: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[6, 2, 4]], expected: 32 },
      { input: [[5]], expected: 0 },
      { input: [[4, 11]], expected: 44 },
    ],
    hiddenTests: [
      { input: [[4, 3, 2, 1]], expected: 20 },
      { input: [[3, 3, 3]], expected: 18 },
      { input: [[7, 1, 9, 2, 8, 3]], expected: 182 },
      { input: [[15, 13, 5, 3, 15]], expected: 500 },
      { input: [[2, 9, 1, 9, 2]], expected: 126 },
      { input: [[6, 5, 4, 7, 1, 8]], expected: 155 },
    ],
  },
  {
    id: "rounds-of-elimination",
    number: 471,
    title: "Rounds Of Elimination",
    difficulty: "Hard",
    topic: "Monotonic Stack",
    statement:
      "A list of integers `nums` is cleaned up in rounds. In one round, every element that is **strictly smaller than the element immediately to its left** is removed. All removals in a round happen at the same moment, based on the list as it stood at the start of that round. The survivors close ranks and the next round begins.\n\nReturn the number of rounds in which at least one element is removed (that is, how many rounds it takes until the list is non-decreasing). A list that is already non-decreasing, including an empty list, needs `0` rounds.\n\nFor example, `[5, 3, 4, 4, 7, 3, 6, 11, 8, 5, 11]` becomes `[5, 4, 4, 7, 6, 11, 11]` after round 1, `[5, 4, 7, 11, 11]` after round 2 and `[5, 7, 11, 11]` after round 3, so the answer is `3`.",
    explanation:
      "Simulating the rounds directly can take O(n²): `[10, 1, 2, 3, ..., 9]` loses only one element per round.\n\nInstead, compute for every element the round in which it is removed (`0` means it survives). An element `x` is eventually removed by the nearest element to its left that is strictly greater than it (its *blocker*). But `x` cannot be removed until every element between the blocker and `x` is gone, and those are all `<= x`. So:\n\n`round(x) = 1 + max(round of the elements between blocker and x)`, or `1` if there are none, and `0` if `x` has no blocker.\n\nA monotonic stack gives both the blocker and that maximum. Keep a stack of `(value, round)` pairs with strictly decreasing values:\n1. For a new value `x`, start with `t = 0`. While the top value is `<= x`, pop it and set `t = max(t, its round)`.\n2. If the stack is now empty, `x` survives: its round is `0`. Otherwise its round is `t + 1`.\n3. Push `(x, round)` and keep the largest round seen.\n\nThe popped elements are exactly the ones between `x` and its blocker that matter (anything they popped earlier is already folded into their own rounds). Each element is pushed and popped once, so this is O(n) time and O(n) space.",
    functionName: "rounds_until_sorted",
    functionSignature: "def rounds_until_sorted(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def rounds_until_sorted(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[5, 3, 4, 4, 7, 3, 6, 11, 8, 5, 11]], expected: 3 },
      { input: [[4, 5, 7, 7, 13]], expected: 0 },
      { input: [[10, 1, 2, 3]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[5, 4, 3, 2, 1]], expected: 1 },
      { input: [[10, 1, 2, 3, 4, 5, 6, 1, 2, 3]], expected: 6 },
      { input: [[7, 14, 4, 14, 13, 2, 6, 13]], expected: 3 },
      { input: [[6, 5, 7, 1, 2, 3]], expected: 3 },
      { input: [[9, 2, 8, 3, 7, 4]], expected: 2 },
    ],
  },
  {
    id: "strongest-weak-link",
    number: 472,
    title: "Strongest Weak Link",
    difficulty: "Hard",
    topic: "Monotonic Stack",
    statement:
      "A chain is only as strong as its weakest link. Given a list of integers `nums` of length `n`, the *strength* of a window (a run of consecutive elements) is its minimum value.\n\nFor every window length `k` from `1` to `n`, find the largest strength among all windows of exactly `k` consecutive elements. Return these `n` values as a list, where entry `k - 1` is the answer for length `k`. An empty input returns an empty list.\n\nFor example, for `[1, 5, 1]` the answer is `[5, 1, 1]`: the best single element is 5, and every window of length 2 or 3 contains a 1.",
    explanation:
      "Computing the minimum of every window of every length is O(n²) at best. Flip the question around: instead of asking each window for its minimum, ask each element for the widest window in which it is the minimum.\n\n1. With a monotonic stack, find for each index `i` the previous index holding a strictly smaller value (`left`) and the next index holding a smaller-or-equal value (`right`). Then `nums[i]` is the minimum of a window of length `span = right - left - 1`, and of no longer window.\n2. Record `best[span] = max(best[span], nums[i])`.\n3. An element that is the minimum of a window of length `span` is also the minimum of some shorter window inside it, so a value achievable at length `k + 1` is achievable at length `k`. Sweep from long to short: `best[k] = max(best[k], best[k + 1])`. This sweep also fills lengths that no element claimed directly.\n\nForgetting step 3 is the usual bug: in `[1, 5, 1]` no element has span exactly 2. The stack pass and the sweep are both linear, so the whole thing is O(n) time and O(n) space.",
    functionName: "best_minimum_per_window",
    functionSignature: "def best_minimum_per_window(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def best_minimum_per_window(nums: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[10, 20, 30, 50, 10, 70, 30]], expected: [70, 30, 20, 10, 10, 10, 10] },
      { input: [[1, 5, 1]], expected: [5, 1, 1] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[3, 3, 3]], expected: [3, 3, 3] },
      { input: [[4, 3, 2, 1]], expected: [4, 3, 2, 1] },
      { input: [[2, 7, 7, 2, 9, 1]], expected: [9, 7, 2, 2, 2, 1] },
      { input: [[-3, -1, -2]], expected: [-1, -2, -3] },
      { input: [[6, 1, 6, 6, 1, 6, 6, 6]], expected: [6, 6, 6, 1, 1, 1, 1, 1] },
    ],
  },
  {
    id: "search-tree-visit-log",
    number: 473,
    title: "Search Tree Visit Log",
    difficulty: "Medium",
    topic: "Monotonic Stack",
    statement:
      "A binary search tree stores distinct integers so that everything in a node's left subtree is smaller than the node and everything in its right subtree is larger. A *preorder* walk visits a node first, then its whole left subtree, then its whole right subtree.\n\nYou're given a list `order` of distinct integers. Return `True` if some binary search tree has exactly this list as its preorder walk, and `False` otherwise. An empty list is valid (it is the walk of the empty tree).\n\nFor example, `[8, 5, 1, 7, 10, 12]` is valid: 8 is the root, `5, 1, 7` form its left subtree and `10, 12` its right. `[8, 5, 10, 6]` is not: once the walk has moved on to 10 it is inside 8's right subtree, so a 6 can no longer appear.",
    explanation:
      "You never need to build the tree. Think about what the walk implies: as long as values keep getting smaller, we are going down left children. The moment a value `x` is larger than the previous one, we have stepped into the right subtree of some ancestor, namely the last ancestor smaller than `x`. From then on, nothing smaller than that ancestor may ever appear.\n\nSo keep a stack of ancestors whose right subtree has not been entered yet (it is strictly decreasing from bottom to top) and a lower bound `low`:\n1. If `x < low`, the list is invalid.\n2. While the top of the stack is smaller than `x`, pop it and set `low` to the popped value; `x` lives in that node's right subtree.\n3. Push `x`.\n\nIf the scan finishes, the list is valid. Each value is pushed and popped at most once: O(n) time, O(n) space. A recursive check that splits each range into a smaller part and a larger part is also correct but O(n²) on skewed input; only checking the split at the top level is a common mistake.",
    functionName: "is_bst_preorder",
    functionSignature: "def is_bst_preorder(order: list[int]) -> bool:",
    starter:
      STARTER_HEADER + "def is_bst_preorder(order: list[int]) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[8, 5, 1, 7, 10, 12]], expected: true },
      { input: [[8, 5, 10, 6]], expected: false },
      { input: [[2, 1, 3]], expected: true },
    ],
    hiddenTests: [
      { input: [[]], expected: true },
      { input: [[3, 2, 1]], expected: true },
      { input: [[8, 3, 1, 6, 4, 2, 10]], expected: false },
      { input: [[8, 3, 1, 6, 4, 7, 10, 14, 13]], expected: true },
      { input: [[5, 2, 6, 1]], expected: false },
      { input: [[10, 5, 12, 11, 15, 9]], expected: false },
    ],
  },
  {
    id: "scoreboard-corrections",
    number: 474,
    title: "Scoreboard Corrections",
    difficulty: "Easy",
    topic: "Stack",
    statement:
      "A scorekeeper works through a list of string `entries` in order, maintaining a record of scores that starts empty. Each entry is one of:\n\n- an integer written as a string (it may be negative, e.g. `\"-2\"`): add that score to the end of the record;\n- `\"undo\"`: remove the most recent score from the record;\n- `\"double\"`: add a new score equal to twice the most recent score (the most recent score stays);\n- `\"sum\"`: add a new score equal to the sum of the two most recent scores (both stay).\n\nEvery entry is guaranteed to be valid when it is reached (`\"undo\"` and `\"double\"` always have at least one score to look at, `\"sum\"` at least two). Return the sum of all scores left on the record at the end; an empty record totals `0`.\n\nFor example, `[\"5\", \"2\", \"undo\", \"double\", \"sum\"]` builds the record `[5]`, `[5, 2]`, `[5]`, `[5, 10]`, `[5, 10, 15]`, so the answer is `30`.",
    explanation:
      "Every command only looks at or removes the most recent scores, which is exactly what a stack is for. Use a Python list as the stack:\n\n- number: `append(int(entry))`\n- `\"undo\"`: `pop()`\n- `\"double\"`: `append(2 * stack[-1])`\n- `\"sum\"`: `append(stack[-1] + stack[-2])`\n\nThen return `sum(stack)`.\n\nThe traps are small but real: `\"double\"` and `\"sum\"` add a new score and leave the old ones in place, `\"undo\"` can remove a score that was itself created by `\"double\"` or `\"sum\"`, and negative numbers must be parsed with `int()` rather than checked with `isdigit()`. One pass, O(n) time and O(n) space.",
    functionName: "scoreboard_total",
    functionSignature: "def scoreboard_total(entries: list[str]) -> int:",
    starter:
      STARTER_HEADER + "def scoreboard_total(entries: list[str]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["5", "2", "undo", "double", "sum"]], expected: 30 },
      { input: [["5", "-2", "4", "undo", "double", "9", "sum", "sum"]], expected: 27 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [["1", "undo"]], expected: 0 },
      { input: [["3", "double", "double", "double"]], expected: 45 },
      { input: [["1", "1", "sum", "sum", "sum", "sum"]], expected: 20 },
      { input: [["-5", "double", "undo", "undo", "8"]], expected: 8 },
      { input: [["10", "20", "sum", "undo", "undo", "double"]], expected: 30 },
    ],
  },
  {
    id: "fewest-bracket-insertions",
    number: 475,
    title: "Fewest Bracket Insertions",
    difficulty: "Easy",
    topic: "Stack",
    statement:
      "A string `s` contains only the characters `'('` and `')'`. You may insert extra brackets anywhere in the string (you may not delete or move anything).\n\nReturn the minimum number of insertions needed to make the string balanced, meaning every `'('` is closed by a later `')'` and every `')'` closes an earlier `'('`. An empty string is already balanced.\n\nFor example, `\"())\"` needs `1` insertion (an opening bracket for the last character), and `\")(\"` needs `2`: one opener before the first character and one closer after the last.",
    explanation:
      "Simply comparing how many `'('` and `')'` there are is not enough: `\")(\"` has one of each but needs two insertions, because order matters.\n\nWalk the string as if you were matching brackets with a stack. Since the stack would only ever hold `'('` characters, a counter `open_count` is enough:\n\n- on `'('`: `open_count += 1`;\n- on `')'`: if `open_count > 0`, it closes one, so `open_count -= 1`; otherwise this closer has nothing to match, so one opener must be inserted: `insertions += 1`.\n\nAt the end, `open_count` openers were never closed and each needs one inserted closer. The answer is `insertions + open_count`.\n\nOne pass, O(n) time and O(1) extra space.",
    functionName: "min_bracket_insertions",
    functionSignature: "def min_bracket_insertions(s: str) -> int:",
    starter:
      STARTER_HEADER + "def min_bracket_insertions(s: str) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["())"], expected: 1 },
      { input: ["((("], expected: 3 },
      { input: [")("], expected: 2 },
    ],
    hiddenTests: [
      { input: [""], expected: 0 },
      { input: ["()))(("], expected: 4 },
      { input: ["(()())"], expected: 0 },
      { input: ["))))"], expected: 4 },
      { input: [")()("], expected: 2 },
      { input: ["(()))(()"], expected: 2 },
    ],
  },
  {
    id: "peel-the-outer-brackets",
    number: 476,
    title: "Peel The Outer Brackets",
    difficulty: "Easy",
    topic: "Stack",
    statement:
      "A balanced bracket string `s` (only `'('` and `')'`) can be cut into *groups*: the shortest possible balanced pieces that follow one another. For example `\"(()())(())\"` is made of the two groups `\"(()())\"` and `\"(())\"`.\n\nRemove the outermost pair of brackets from every group and return what is left, joined back together in the same order. An empty string returns an empty string.\n\nFor `\"(()())(())\"` the groups become `\"()()\"` and `\"()\"`, so the answer is `\"()()()\"`. For `\"()()\"` both groups become empty, so the answer is `\"\"`.",
    explanation:
      "A group starts whenever the nesting depth goes from 0 to 1 and ends when it returns to 0. Those two brackets are exactly the ones to drop; every other bracket sits at depth 2 or deeper and is kept.\n\nTrack the depth (the size a matching stack would have) while scanning:\n- on `'('`: if the depth is already greater than 0, keep the character; then increase the depth;\n- on `')'`: decrease the depth first; if it is still greater than 0, keep the character.\n\nJoin the kept characters. This is O(n) time and O(n) space for the output.\n\nThe common mistake is slicing off just the first and last characters of the whole string, which is only right when the string is a single group.",
    functionName: "strip_outer_layers",
    functionSignature: "def strip_outer_layers(s: str) -> str:",
    starter:
      STARTER_HEADER + "def strip_outer_layers(s: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["(()())(())"], expected: "()()()" },
      { input: ["()()"], expected: "" },
      { input: ["(()())(())(()(()))"], expected: "()()()()(())" },
    ],
    hiddenTests: [
      { input: [""], expected: "" },
      { input: ["()"], expected: "" },
      { input: ["((()))"], expected: "(())" },
      { input: ["(())()((()())())"], expected: "()(()())()" },
      { input: ["()(())()"], expected: "()" },
      { input: ["((())(()))"], expected: "(())(())" },
    ],
  },
  {
    id: "tray-stack-audit",
    number: 477,
    title: "Tray Stack Audit",
    difficulty: "Medium",
    topic: "Stack",
    statement:
      "A cafeteria has one stack of trays. Trays with distinct numbers are placed on top of the stack one at a time in the order given by `pushed`. At any moment between placements (and after the last one), a worker may take the top tray off the stack.\n\n`popped` lists the same tray numbers in the order a camera says they were taken off. Return `True` if that order is possible for some timing of the removals, and `False` otherwise. Both lists have the same length, and `popped` is a rearrangement of `pushed`. Two empty lists return `True`.\n\nFor example, with `pushed = [1, 2, 3, 4, 5]`, the order `[4, 5, 3, 2, 1]` is possible (place 1-4, take 4, place 5, take 5, 3, 2, 1), but `[4, 3, 5, 1, 2]` is not: tray 1 is underneath tray 2 and cannot leave first.",
    explanation:
      "There is no need to search over timings: just replay the day with a real stack and be greedy.\n\n1. Keep a pointer `j` to the next tray the camera expects to leave.\n2. For each tray in `pushed`, put it on the stack. Then, while the stack is non-empty and its top equals `popped[j]`, pop it and advance `j`.\n3. At the end the order was possible exactly when the stack is empty.\n\nWhy greedy is safe: tray numbers are distinct, so when the top equals the next expected tray, it must be removed before anything else is placed on it (afterwards it would be buried and the expected tray could not come out next). When the top is not the expected tray, the only legal move is to place another tray.\n\nEach tray is pushed once and popped at most once: O(n) time, O(n) space. Checking only that `popped` is the reverse of `pushed` misses all the orders where removals are interleaved with placements.",
    functionName: "is_valid_pop_order",
    functionSignature: "def is_valid_pop_order(pushed: list[int], popped: list[int]) -> bool:",
    starter:
      STARTER_HEADER + "def is_valid_pop_order(pushed: list[int], popped: list[int]) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 4, 5], [4, 5, 3, 2, 1]], expected: true },
      { input: [[1, 2, 3, 4, 5], [4, 3, 5, 1, 2]], expected: false },
    ],
    hiddenTests: [
      { input: [[], []], expected: true },
      { input: [[1, 2, 3], [1, 2, 3]], expected: true },
      { input: [[1, 2, 3], [3, 1, 2]], expected: false },
      { input: [[2, 1, 0], [1, 2, 0]], expected: true },
      { input: [[7, 3, 9, 5, 1], [9, 3, 5, 7, 1]], expected: true },
      { input: [[4, 6, 8, 2], [8, 4, 6, 2]], expected: false },
    ],
  },
  {
    id: "mirror-the-bracketed-parts",
    number: 478,
    title: "Mirror The Bracketed Parts",
    difficulty: "Medium",
    topic: "Stack",
    statement:
      "A string `s` contains lowercase letters and balanced round brackets. Each bracket pair marks a section that must be reversed. Work from the innermost pairs outwards: reverse the letters inside a pair, remove that pair of brackets, and carry on until no brackets are left.\n\nReturn the final string, which contains letters only. Letters outside every bracket keep their places. An empty string returns an empty string, and an empty pair `\"()\"` simply disappears.\n\nFor example, `\"(u(love)i)\"` first becomes `\"(uevoli)\"` and then `\"iloveu\"`. In `\"ab(cd)ef\"` only the middle is reversed, giving `\"abdcef\"`.",
    explanation:
      "Nested brackets mean the text of an inner section must be finished before the outer section can be reversed, which is last-in-first-out behaviour.\n\nKeep a stack of partial strings (lists of characters work well), starting with one empty list for the top level:\n- letter: append it to the list on top of the stack;\n- `'('`: push a new empty list for the section that is starting;\n- `')'`: pop the finished section, reverse it, and append its characters to the list that is now on top.\n\nWhen the scan ends, the single remaining list is the answer.\n\nA letter nested `d` levels deep gets reversed `d` times, so this is O(n²) in the worst case for deeply nested input, which is fine for interview-sized strings (an O(n) version jumps between matching brackets instead). Reversing only the innermost sections and then deleting every bracket is wrong: outer sections must also reverse the already-reversed inner text.",
    functionName: "reverse_bracketed",
    functionSignature: "def reverse_bracketed(s: str) -> str:",
    starter:
      STARTER_HEADER + "def reverse_bracketed(s: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["(abcd)"], expected: "dcba" },
      { input: ["(u(love)i)"], expected: "iloveu" },
      { input: ["ab(cd)ef"], expected: "abdcef" },
    ],
    hiddenTests: [
      { input: [""], expected: "" },
      { input: ["(ed(et(oc))el)"], expected: "leetcode" },
      { input: ["a(bc(de)f)g(hi)"], expected: "afdecbgih" },
      { input: ["((ab))"], expected: "ab" },
      { input: ["()"], expected: "" },
      { input: ["(a(b(c(d))))"], expected: "bdca" },
    ],
  },
  {
    id: "profiler-self-time",
    number: 479,
    title: "Profiler Self Time",
    difficulty: "Medium",
    topic: "Stack",
    statement:
      "A single-threaded program runs `n` functions with ids `0` to `n - 1`. A profiler produced `logs`, a list of entries `[function_id, kind, timestamp]` in the order they happened, where `kind` is `\"start\"` or `\"end\"`.\n\n- A `\"start\"` entry means the function began at the **beginning** of time unit `timestamp`.\n- An `\"end\"` entry means the function finished at the **end** of time unit `timestamp`.\n\nSo a function that starts at 2 and ends at 5 was on the call stack for 4 time units (2, 3, 4 and 5). Functions can call other functions, including themselves; while a callee runs, the caller is paused. The logs are well formed: every `\"end\"` matches the most recent unfinished `\"start\"`.\n\nReturn a list of length `n` where entry `i` is the total *self time* of function `i`: the number of time units it was the function actually running, not counting time spent in functions it called. A function that never appears in the logs has self time `0`.\n\nFor example, with `n = 2` and logs `[[0, \"start\", 0], [1, \"start\", 2], [1, \"end\", 5], [0, \"end\", 6]]`, function 0 runs during units 0, 1 and 6 and function 1 during units 2 to 5, so the answer is `[3, 4]`.",
    explanation:
      "The log is a trace of a call stack, so replay it with a stack of function ids. The trick is to charge time in slices between consecutive log entries, always to whichever function is on top of the stack during that slice.\n\nKeep `prev`, the first time unit that has not been charged to anyone yet.\n\n- `\"start\"` at time `t`: if a function is on the stack, it ran during units `prev .. t - 1`, so add `t - prev` to it. Push the new id and set `prev = t`.\n- `\"end\"` at time `t`: the function on top ran during units `prev .. t` inclusive, so add `t - prev + 1` to it, pop it, and set `prev = t + 1`.\n\nThe asymmetric `+ 1` comes straight from the definition: a start marks the beginning of a unit and an end marks the end of one. Dropping it, or computing `end - start + 1` for the whole call without removing the time spent in callees, are the two classic mistakes.\n\nOne pass over the logs: O(len(logs)) time, and the stack is as deep as the deepest call chain.",
    functionName: "exclusive_times",
    functionSignature: "def exclusive_times(n: int, logs: list[list]) -> list[int]:",
    starter:
      STARTER_HEADER + "def exclusive_times(n: int, logs: list[list]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [2, [[0, "start", 0], [1, "start", 2], [1, "end", 5], [0, "end", 6]]], expected: [3, 4] },
      { input: [1, [[0, "start", 0], [0, "start", 2], [0, "end", 5], [0, "start", 6], [0, "end", 6], [0, "end", 7]]], expected: [8] },
    ],
    hiddenTests: [
      { input: [1, [[0, "start", 3], [0, "end", 3]]], expected: [1] },
      { input: [3, [[0, "start", 0], [0, "end", 4], [1, "start", 5], [1, "end", 5]]], expected: [5, 1, 0] },
      { input: [3, [[2, "start", 1], [0, "start", 2], [1, "start", 4], [1, "end", 4], [0, "end", 7], [2, "end", 10]]], expected: [5, 1, 4] },
      { input: [2, [[0, "start", 0], [1, "start", 0], [1, "end", 0], [1, "start", 1], [1, "end", 3], [0, "end", 3]]], expected: [0, 4] },
      { input: [2, [[1, "start", 10], [1, "start", 12], [1, "start", 15], [1, "end", 20], [1, "end", 21], [1, "end", 30]]], expected: [0, 21] },
      { input: [4, []], expected: [0, 0, 0, 0] },
    ],
  },
  {
    id: "molecule-atom-tally",
    number: 480,
    title: "Molecule Atom Tally",
    difficulty: "Hard",
    topic: "Stack",
    statement:
      "A chemical formula is given as a non-empty string `formula` built from these pieces:\n\n- An **element** is one uppercase letter followed by zero or more lowercase letters, such as `H`, `Mg` or `Uue`.\n- An element may be followed by a **count**, a whole number of 2 or more that may have several digits (`H2`, `C12`). With no number the count is 1.\n- A **group** is a formula wrapped in round brackets, optionally followed by a count that multiplies everything inside it: `(OH)2` is two O and two H. Groups can be nested.\n- Pieces written one after another are simply added together.\n\nReturn a dictionary mapping each element name to the total number of its atoms in the formula. The dictionary's key order is not checked. The formula is always well formed.\n\nFor example, `\"Mg(OH)2\"` gives `{\"Mg\": 1, \"O\": 2, \"H\": 2}`, and `\"K4(ON(SO3)2)2\"` gives `{\"K\": 4, \"O\": 14, \"N\": 2, \"S\": 4}`.",
    explanation:
      "The difficulty is that a multiplier appears after its group, and groups nest, so you cannot know an atom's final count when you first read it. A stack of tallies solves this: one dictionary per currently open bracket, plus one for the top level.\n\nScan with an index `i`:\n- `'('`: push a new empty tally.\n- `')'`: read the digits that follow (default 1). Pop the finished tally, multiply each of its counts by that number, and add them into the tally now on top.\n- uppercase letter: read the following lowercase letters to complete the element name, then read the digits that follow (default 1), and add that count to the tally on top.\n\nAt the end the bottom tally is the answer.\n\nA small helper that reads an optional run of digits starting at `i` and returns `(number, new_i)` keeps the parsing tidy and handles multi-digit counts. Each closing bracket re-walks the tally of its group, so the cost is O(n * d * e) in the worst case for depth `d` and `e` distinct elements, effectively linear for real formulas; space is the same stack of tallies.\n\nThings that go wrong: treating every letter as its own element (`Mg` is one element), reading only one digit of a count, and forgetting that a group with no number still has to be merged into its parent.",
    functionName: "count_atoms",
    functionSignature: "def count_atoms(formula: str) -> dict[str, int]:",
    starter:
      STARTER_HEADER + "def count_atoms(formula: str) -> dict[str, int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["H2O"], expected: {"H": 2, "O": 1} },
      { input: ["Mg(OH)2"], expected: {"Mg": 1, "O": 2, "H": 2} },
      { input: ["K4(ON(SO3)2)2"], expected: {"K": 4, "O": 14, "N": 2, "S": 4} },
    ],
    hiddenTests: [
      { input: ["Fe"], expected: {"Fe": 1} },
      { input: ["Be32"], expected: {"Be": 32} },
      { input: ["H2O2He3Mg4"], expected: {"H": 2, "O": 2, "He": 3, "Mg": 4} },
      { input: ["Na(Cl)Na"], expected: {"Na": 2, "Cl": 1} },
      { input: ["Co3(Fe(CN)6)2"], expected: {"Co": 3, "Fe": 2, "C": 12, "N": 12} },
      { input: ["(B2O3)12Mg"], expected: {"B": 24, "O": 36, "Mg": 1} },
    ],
  },
  {
    id: "flip-across-the-diagonal",
    number: 481,
    title: "Flip Across The Diagonal",
    difficulty: "Easy",
    topic: "Matrix",
    statement:
      "You're given a rectangular grid of integers with `m` rows and `n` columns (`m` and `n` are at least 1 and need not be equal). Flip it across its main diagonal: the value at row `r`, column `c` moves to row `c`, column `r`.\n\nReturn the flipped grid as a new list of `n` rows, each with `m` values. In other words, the first row of the input becomes the first column of the output, the second row becomes the second column, and so on.\n\nFor example, `[[1, 2, 3], [4, 5, 6]]` becomes `[[1, 4], [2, 5], [3, 6]]`.",
    explanation:
      "This is the transpose of a matrix. The output has swapped dimensions, so for a non-square grid it cannot be done by swapping cells inside the original lists; build a new grid.\n\nCreate `n` rows; row `c` of the output is column `c` of the input: `[grid[r][c] for r in range(m)]`. Do that for every `c` from `0` to `n - 1`.\n\nIn Python, `[list(col) for col in zip(*grid)]` does the same thing, but be able to write the index version: the outer loop runs over the input's columns, the inner loop over its rows.\n\nEvery cell is read once and written once: O(m * n) time and O(m * n) space for the result. The in-place trick of swapping `grid[r][c]` with `grid[c][r]` for `c > r` works only when the grid is square.",
    functionName: "flip_across_diagonal",
    functionSignature: "def flip_across_diagonal(grid: list[list[int]]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def flip_across_diagonal(grid: list[list[int]]) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
      { input: [[[1, 2], [3, 4]]], expected: [[1, 3], [2, 4]] },
    ],
    hiddenTests: [
      { input: [[[7]]], expected: [[7]] },
      { input: [[[1, 2, 3]]], expected: [[1], [2], [3]] },
      { input: [[[1], [2], [3]]], expected: [[1, 2, 3]] },
      { input: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expected: [[1, 3, 5, 7], [2, 4, 6, 8]] },
      { input: [[[0, -1, 2], [3, 0, -4], [5, 6, 0]]], expected: [[0, 3, 5], [-1, 0, 6], [2, -4, 0]] },
    ],
  },
  {
    id: "fence-around-the-fields",
    number: 482,
    title: "Fence Around The Fields",
    difficulty: "Easy",
    topic: "Matrix",
    statement:
      "A farm is drawn as a grid with at least one row and one column, where `1` is a field cell and `0` is open ground. Every cell is a square with sides of length 1.\n\nA fence panel is needed on each side of a field cell that does not touch another field cell: that is, a side that faces open ground or faces the outside of the grid. Diagonal contact does not count as touching. Open ground completely enclosed by fields still needs fencing around it, and the fields may form several separate patches.\n\nReturn the total number of fence panels needed. If there are no field cells, return `0`.\n\nFor example, in `[[1, 0], [0, 1]]` the two fields only touch at a corner, so each needs all 4 sides fenced and the answer is `8`.",
    explanation:
      "No flood fill or search is needed, because the answer is a sum of purely local facts: each side of each field cell either needs a panel or does not.\n\nFor every cell that is `1`, look at its four neighbours (up, down, left, right). Add 1 for every neighbour that is outside the grid or is `0`.\n\nAn equivalent counting trick: start with `4` per field cell and subtract `2` for every pair of side-by-side field cells (check only the right and down neighbours so each pair is counted once). Subtracting for horizontal pairs only, or forgetting the grid border, are the usual slips.\n\nBoth versions look at each cell a constant number of times: O(m * n) time and O(1) extra space.",
    functionName: "shoreline_length",
    functionSignature: "def shoreline_length(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def shoreline_length(grid: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]], expected: 16 },
      { input: [[[1]]], expected: 4 },
      { input: [[[1, 0], [0, 1]]], expected: 8 },
    ],
    hiddenTests: [
      { input: [[[0]]], expected: 0 },
      { input: [[[1, 1], [1, 1]]], expected: 8 },
      { input: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: 16 },
      { input: [[[0, 0, 0], [0, 0, 0]]], expected: 0 },
      { input: [[[1, 0, 1, 1], [1, 1, 0, 1], [0, 1, 1, 1]]], expected: 20 },
      { input: [[[1], [1], [1]]], expected: 8 },
    ],
  },
  {
    id: "saddle-cells",
    number: 483,
    title: "Saddle Cells",
    difficulty: "Easy",
    topic: "Matrix",
    statement:
      "You're given a rectangular grid of integers with at least one row and one column. A cell is a *saddle cell* if its value is the minimum of its row **and** the maximum of its column. Ties are allowed: the value only has to be less than or equal to everything in its row and greater than or equal to everything in its column.\n\nReturn the positions of all saddle cells as a list of `[row, column]` pairs, listed row by row from top to bottom, and left to right within a row. If there are none, return an empty list.\n\nFor example, in `[[3, 7, 8], [9, 11, 13], [15, 16, 17]]` the value 15 is the smallest in its row and the largest in its column, so the answer is `[[2, 0]]`. In `[[5, 5], [4, 5]]` both cells of the top row qualify, giving `[[0, 0], [0, 1]]`.",
    explanation:
      "Checking each cell against its whole row and column costs O(m * n * (m + n)). Precompute instead:\n\n1. `row_min[r]` = the minimum of row `r`, for every row.\n2. `col_max[c]` = the maximum of column `c`, for every column (`zip(*grid)` walks the columns).\n3. Scan the cells in reading order and keep `[r, c]` whenever `grid[r][c] == row_min[r]` and `grid[r][c] == col_max[c]`.\n\nScanning in reading order produces the required output order for free.\n\nBecause ties are allowed, compare by value rather than remembering a single position of each row's minimum: a row can contain its minimum several times, and each copy has to be tested against its own column. Time is O(m * n) and extra space is O(m + n).",
    functionName: "saddle_cells",
    functionSignature: "def saddle_cells(grid: list[list[int]]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def saddle_cells(grid: list[list[int]]) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[3, 7, 8], [9, 11, 13], [15, 16, 17]]], expected: [[2, 0]] },
      { input: [[[1, 2], [2, 1]]], expected: [] },
      { input: [[[5, 5], [4, 5]]], expected: [[0, 0], [0, 1]] },
    ],
    hiddenTests: [
      { input: [[[7]]], expected: [[0, 0]] },
      { input: [[[1, 1], [1, 1]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]] },
      { input: [[[1, 10, 4, 2], [9, 3, 8, 7], [15, 16, 17, 12]]], expected: [[2, 3]] },
      { input: [[[2], [3], [1]]], expected: [[1, 0]] },
      { input: [[[4, 4, 9], [4, 4, 1], [0, 4, 4]]], expected: [[0, 0], [0, 1]] },
      { input: [[[6, 2, 2], [8, 1, 2], [3, 2, 2]]], expected: [[0, 1], [0, 2], [2, 1], [2, 2]] },
    ],
  },
  {
    id: "zigzag-diagonal-sweep",
    number: 484,
    title: "Zigzag Diagonal Sweep",
    difficulty: "Medium",
    topic: "Matrix",
    statement:
      "Read every value of a rectangular grid (at least one row and one column) along its anti-diagonals, the lines of cells whose row index plus column index is the same number `d`. Visit the diagonals in the order `d = 0, 1, 2, ...`, and alternate direction:\n\n- when `d` is even, travel **up and to the right** (start at the cell with the largest row index on that diagonal);\n- when `d` is odd, travel **down and to the left** (start at the cell with the smallest row index on that diagonal).\n\nReturn all the values in the order visited, as one flat list.\n\nFor example, `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` is read as `[1, 2, 4, 7, 5, 3, 6, 8, 9]`: first `1`, then `2, 4` going down-left, then `7, 5, 3` going up-right, then `6, 8`, then `9`.",
    explanation:
      "You can simulate a walker that bounces off the edges, but the corner cases (which wall did it hit, and what if it hit two at once) are easy to get wrong. It is simpler to produce each diagonal on its own.\n\nFor a grid with `m` rows and `n` columns there are `m + n - 1` diagonals. On diagonal `d` the cells are `(r, d - r)`, and `r` is limited by both dimensions: `max(0, d - n + 1) <= r <= min(d, m - 1)`.\n\n1. For each `d`, collect the values with `r` increasing. That is the down-left direction.\n2. If `d` is even, reverse the collected values to get the up-right direction.\n3. Append them to the output.\n\nEvery cell is touched once, so the time is O(m * n); the extra space beyond the output is one diagonal. Test with a single row and a single column: each diagonal then has one cell and the output is just the values in order.",
    functionName: "zigzag_diagonals",
    functionSignature: "def zigzag_diagonals(grid: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def zigzag_diagonals(grid: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 4, 7, 5, 3, 6, 8, 9] },
      { input: [[[1, 2], [3, 4], [5, 6]]], expected: [1, 2, 3, 5, 4, 6] },
    ],
    hiddenTests: [
      { input: [[[1]]], expected: [1] },
      { input: [[[1, 2, 3, 4]]], expected: [1, 2, 3, 4] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [1, 2, 4, 5, 3, 6] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]], expected: [1, 2, 5, 9, 6, 3, 4, 7, 10, 13, 14, 11, 8, 12, 15, 16] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 5, 9, 6, 3, 4, 7, 10, 11, 8, 12] },
    ],
  },
  {
    id: "turning-the-rings",
    number: 485,
    title: "Turning The Rings",
    difficulty: "Medium",
    topic: "Matrix",
    statement:
      "A grid of integers has `m` rows and `n` columns, where `m` and `n` are both even and at least 2. Think of it as a set of nested rectangular rings: ring 0 is the outer border, ring 1 is the border of what remains once ring 0 is removed, and so on. Because both dimensions are even, every cell belongs to exactly one ring.\n\nTurn every ring `k` steps clockwise (`k >= 0`, and `k` may be larger than the number of cells in a ring). One clockwise step moves each value to the next cell along its own ring in clockwise direction: values on the ring's top edge move right, on its right edge move down, on its bottom edge move left, and on its left edge move up, turning at the corners.\n\nReturn the resulting grid.\n\nFor example, `[[1, 2], [3, 4]]` with `k = 1` becomes `[[3, 1], [4, 2]]`: the 1 moves right, the 2 moves down, the 4 moves left and the 3 moves up.",
    explanation:
      "Moving values one step at a time, `k` times, costs O(k * m * n) and is hopeless when `k` is huge. The cleaner view is that each ring is just a circular list that happens to be bent around a rectangle.\n\nFor each ring `r` from `0` to `min(m, n) / 2 - 1`, with `top = left = r`, `bottom = m - 1 - r`, `right = n - 1 - r`:\n1. List the ring's cells in clockwise order: along the top edge left to right (stopping before the corner), down the right edge, back along the bottom edge right to left, and up the left edge. Stopping each edge one cell short keeps every corner from being listed twice.\n2. Let `size` be the number of cells. The value at position `i` of that list moves to position `(i + k) % size`.\n3. Write the values into a copy of the grid, so that values not yet moved are not overwritten.\n\nThe modulo is what handles a large `k`, and it must use each ring's own size, since inner rings are shorter. Every cell is read and written once: O(m * n) time and O(m * n) space.",
    functionName: "rotate_rings",
    functionSignature: "def rotate_rings(grid: list[list[int]], k: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def rotate_rings(grid: list[list[int]], k: int) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 2], [3, 4]], 1], expected: [[3, 1], [4, 2]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 2], expected: [[9, 5, 1, 2], [13, 11, 10, 3], [14, 7, 6, 4], [15, 16, 12, 8]] },
    ],
    hiddenTests: [
      { input: [[[1, 2], [3, 4]], 0], expected: [[1, 2], [3, 4]] },
      { input: [[[1, 2], [3, 4]], 7], expected: [[2, 4], [1, 3]] },
      { input: [[[1, 2], [3, 4], [5, 6], [7, 8]], 1], expected: [[3, 1], [5, 2], [7, 4], [8, 6]] },
      { input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], 13], expected: [[5, 1, 2, 3], [9, 10, 6, 4], [13, 11, 7, 8], [14, 15, 16, 12]] },
      { input: [[[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24]], 5], expected: [[21, 20, 19, 13, 7, 1], [22, 11, 17, 16, 15, 2], [23, 10, 9, 8, 14, 3], [24, 18, 12, 6, 5, 4]] },
      { input: [[[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30], [31, 32, 33, 34, 35, 36]], 20], expected: [[1, 2, 3, 4, 5, 6], [7, 17, 23, 29, 28, 12], [13, 11, 15, 16, 27, 18], [19, 10, 21, 22, 26, 24], [25, 9, 8, 14, 20, 30], [31, 32, 33, 34, 35, 36]] },
    ],
  },
  {
    id: "longest-uphill-trail",
    number: 486,
    title: "Longest Uphill Trail",
    difficulty: "Hard",
    topic: "Matrix",
    statement:
      "A rectangular map (at least one row and one column) gives the elevation of every cell as an integer. A hiker may start on any cell and repeatedly step to a neighbouring cell directly up, down, left or right (no diagonals, no leaving the map), but only if the new cell is **strictly higher** than the current one.\n\nReturn the largest number of cells a single hike can visit, counting the starting cell. A hike that never moves visits `1` cell.\n\nFor example, in `[[9, 9, 4], [6, 6, 8], [2, 1, 1]]` the best hike is `1 -> 2 -> 6 -> 9` (starting in the bottom row and climbing the left column), so the answer is `4`.",
    explanation:
      "Trying every path by plain DFS is exponential, and greedy choices (always step to the lowest or the highest neighbour) fail because a modest step now can open a much longer trail later.\n\nThe saving observation: because every step must go strictly higher, a hike can never return to a cell. So `best(r, c)`, the longest hike starting at cell `(r, c)`, depends only on the cell and not on how you arrived. That makes it a memoised recursion:\n\n`best(r, c) = 1 + max(best(neighbour) for each strictly higher neighbour)`, or `1` if there is none.\n\n1. Write a DFS that computes `best(r, c)` and caches it (a 2D table or `lru_cache`).\n2. Call it for every cell and return the maximum.\n\nNo visited set is needed, since strict increase rules out cycles. Each cell is solved once and looks at four neighbours: O(m * n) time and O(m * n) space. An iterative alternative sorts the cells by elevation and fills the table from highest to lowest, or peels the grid like a topological sort.",
    functionName: "longest_uphill_trail",
    functionSignature: "def longest_uphill_trail(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def longest_uphill_trail(grid: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], expected: 4 },
      { input: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], expected: 4 },
      { input: [[[1]]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[[7, 7], [7, 7]]], expected: 1 },
      { input: [[[1, 2, 3], [6, 5, 4], [7, 8, 9]]], expected: 9 },
      { input: [[[1, 6, 7], [2, 5, 8], [3, 4, 9]]], expected: 9 },
      { input: [[[0, -1], [-2, -3]]], expected: 3 },
      { input: [[[1, 2, 10], [9, 3, 4], [8, 7, 5]]], expected: 8 },
      { input: [[[8, 9], [7, 4], [9, 6]]], expected: 4 },
    ],
  },
  {
    id: "halve-the-biggest-pile",
    number: 487,
    title: "Halve The Biggest Pile",
    difficulty: "Easy",
    topic: "Heap",
    statement:
      "You have a non-empty list `piles` of positive integers; `piles[i]` is the number of gravel bags in pile `i`. A truck makes exactly `k` trips (`k >= 0`). On each trip it goes to the pile that is currently the largest and hauls away `floor(x / 2)` bags, where `x` is that pile's current size, so the pile is left with `x - floor(x / 2)` bags. If several piles tie for largest, it does not matter which one is chosen. The same pile may be visited on several trips.\n\nReturn the total number of bags left across all piles after the `k` trips.\n\nFor example, with `piles = [5, 4, 9]` and `k = 2`: the first trip turns 9 into 5, the second turns a 5 into 3, leaving `[3, 4, 5]` (in some arrangement) for a total of `12`.",
    explanation:
      "The process is fully determined, so this is a simulation; the only question is how to find the current largest pile quickly. Rescanning the list on every trip is O(n * k). Sorting once is not enough either, because a halved pile can still be larger than the others and need to be picked again.\n\nA max-heap gives the largest pile in O(log n) per trip. Python's `heapq` is a min-heap, so store negated sizes:\n\n1. Build a heap of `-p` for every pile (`heapify` is O(n)).\n2. Repeat `k` times: pop the largest `x`, push back `x - x // 2`.\n3. Return the sum of what is left.\n\nWatch the rounding: the truck removes the rounded-down half, so an odd pile keeps the larger part (9 becomes 5, not 4), and a pile of 1 stays at 1.\n\nTotal cost is O(n + k log n) time and O(n) space.",
    functionName: "remaining_after_halvings",
    functionSignature: "def remaining_after_halvings(piles: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER + "def remaining_after_halvings(piles: list[int], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[5, 4, 9], 2], expected: 12 },
      { input: [[4, 3, 6, 7], 3], expected: 12 },
    ],
    hiddenTests: [
      { input: [[1], 5], expected: 1 },
      { input: [[8, 8], 2], expected: 8 },
      { input: [[9, 2], 2], expected: 5 },
      { input: [[7, 7, 7], 0], expected: 21 },
      { input: [[100, 1, 1], 4], expected: 9 },
      { input: [[3, 5, 2, 8, 6], 5], expected: 12 },
    ],
  },
  {
    id: "cheapest-combo-totals",
    number: 488,
    title: "Cheapest Combo Totals",
    difficulty: "Medium",
    topic: "Heap",
    statement:
      "A diner sells combos made of one main and one side. `a` lists the prices of the mains and `b` the prices of the sides; both lists are sorted in non-decreasing order and may contain repeated prices. Every (main, side) choice of positions is a different combo, so there are `len(a) * len(b)` combos in total, and two combos can have the same total price.\n\nReturn the total prices of the `k` cheapest combos (`k >= 1`), sorted from cheapest to most expensive. Equal totals from different combos each appear in the result. If there are fewer than `k` combos, return all of their totals; if either list is empty, return an empty list.\n\nFor example, with `a = [1, 1, 2]`, `b = [1, 2, 3]` and `k = 4` the cheapest totals are `[2, 2, 3, 3]`.",
    explanation:
      "Building all `len(a) * len(b)` totals and sorting them works, but wastes time and memory when `k` is small compared with the number of combos.\n\nThink of a grid where cell `(i, j)` holds `a[i] + b[j]`. Each row is sorted because `b` is sorted. So the task is to merge `len(a)` sorted rows and stop after `k` items, which is what a min-heap is for:\n\n1. Push `(a[i] + b[0], i, 0)` for each row `i`. Only the first `k` rows can matter, so push at most `k` of them.\n2. Pop the smallest entry `(total, i, j)` and append `total` to the answer.\n3. If row `i` has a next cell, push `(a[i] + b[j + 1], i, j + 1)`.\n4. Stop after `k` pops or when the heap runs dry.\n\nEvery cell is pushed at most once, so duplicates are counted exactly as often as they occur. Pairing `a[i]` only with `b[i]`, or collecting totals in a set, both lose combos.\n\nThe heap never holds more than `min(len(a), k)` entries: O(k log min(len(a), k)) time and O(min(len(a), k)) extra space.",
    functionName: "k_smallest_pair_sums",
    functionSignature: "def k_smallest_pair_sums(a: list[int], b: list[int], k: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def k_smallest_pair_sums(a: list[int], b: list[int], k: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 7, 11], [2, 4, 6], 3], expected: [3, 5, 7] },
      { input: [[1, 1, 2], [1, 2, 3], 4], expected: [2, 2, 3, 3] },
      { input: [[1, 2], [3], 5], expected: [4, 5] },
    ],
    hiddenTests: [
      { input: [[], [1, 2], 3], expected: [] },
      { input: [[1, 2, 3], [1, 2, 3], 9], expected: [2, 3, 3, 4, 4, 4, 5, 5, 6] },
      { input: [[-5, 0, 4], [-2, -2, 10], 5], expected: [-7, -7, -2, -2, 2] },
      { input: [[1, 4, 4, 9], [1, 2], 6], expected: [2, 3, 5, 5, 6, 6] },
      { input: [[1, 10, 100], [1, 2, 3], 4], expected: [2, 3, 4, 11] },
      { input: [[2, 2], [2, 2], 3], expected: [4, 4, 4] },
    ],
  },
  {
    id: "hiring-from-both-ends",
    number: 489,
    title: "Hiring From Both Ends",
    difficulty: "Medium",
    topic: "Heap",
    statement:
      "Candidates wait in a line; `costs[i]` is the cost of hiring the candidate at position `i`. You will hire exactly `k` of them (`1 <= k <= len(costs)`), one per round, and `window >= 1`.\n\nIn each round only the candidates near the two ends of the remaining line are considered: the first `window` remaining candidates and the last `window` remaining candidates. If fewer than `2 * window` candidates remain, those two groups overlap or cover everyone, and every remaining candidate is considered (once). Among the considered candidates you hire the one with the lowest cost; if several share the lowest cost, you hire the one with the smallest original position. The hired candidate leaves the line and the others keep their order.\n\nReturn the total cost of the `k` hires.\n\nFor example, with `costs = [10, 1, 1, 10, 10]`, `k = 2` and `window = 1`: round 1 considers positions 0 and 4 (both cost 10) and hires position 0; round 2 considers positions 1 and 4 and hires position 1 for 1. The total is `11`, even though cheaper candidates were sitting in the middle.",
    explanation:
      "Simulating with list slicing rescans up to `2 * window` candidates every round and pays for deleting from a list, which is O(k * (window + n)). Two min-heaps do the same job faster.\n\nKeep two pointers `lo` and `hi` marking the stretch of candidates not yet placed in either group, a heap `front` for the left group and a heap `back` for the right group, each storing `(cost, position)`.\n\nEach round:\n1. Top up `front` from `lo` until it holds `window` entries or `lo > hi`.\n2. Top up `back` from `hi` until it holds `window` entries or `lo > hi`.\n3. Compare the two heap tops as `(cost, position)` tuples and pop the smaller one; add its cost.\n\nThe `lo <= hi` check is what stops a candidate from being put in both heaps when the groups would overlap. Comparing the tuples handles the tie-break: on equal cost, the smaller position wins, and everything in `front` has a smaller position than everything in `back`.\n\nNote that simply adding up the `k` smallest costs is wrong, because cheap candidates in the middle are not available until the ends have been used up.\n\nEach candidate enters and leaves a heap at most once: O((n + k) log window) time and O(window) extra space.",
    functionName: "total_hiring_cost",
    functionSignature: "def total_hiring_cost(costs: list[int], k: int, window: int) -> int:",
    starter:
      STARTER_HEADER + "def total_hiring_cost(costs: list[int], k: int, window: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[17, 12, 10, 2, 7, 2, 11, 20, 8], 3, 4], expected: 11 },
      { input: [[10, 1, 1, 10, 10], 2, 1], expected: 11 },
      { input: [[1, 2, 4, 1], 3, 3], expected: 4 },
    ],
    hiddenTests: [
      { input: [[3, 3, 3, 3], 4, 1], expected: 12 },
      { input: [[7, 7, 1, 7, 7], 1, 1], expected: 7 },
      { input: [[31, 25, 72, 79, 74, 65, 84, 91, 18, 59, 27, 9, 81, 33, 17, 58], 11, 2], expected: 423 },
      { input: [[5, 9, 9, 9, 1, 9, 9, 3], 4, 2], expected: 26 },
      { input: [[5, 3, 4, 5], 2, 1], expected: 8 },
      { input: [[2, 5], 2, 4], expected: 7 },
    ],
  },
  {
    id: "lowest-free-chair",
    number: 490,
    title: "Lowest Free Chair",
    difficulty: "Medium",
    topic: "Heap",
    statement:
      "A party has an endless row of chairs numbered `0, 1, 2, ...`. Guest `i` arrives at time `times[i][0]` and leaves at time `times[i][1]` (always later than the arrival). All arrival times are distinct; the guests are not listed in arrival order.\n\nWhen a guest arrives, they sit on the **lowest-numbered chair that is free** at that moment. A chair becomes free at the exact moment its guest leaves, so a guest arriving at that same moment may take it.\n\nReturn the number of the chair that guest `target` (an index into `times`) sits on.\n\nFor example, with `times = [[1, 4], [2, 3], [4, 6]]` and `target = 2`: guest 0 takes chair 0, guest 1 takes chair 1 and leaves at time 3, and guest 0 leaves at time 4 just as guest 2 arrives. Chairs 0 and 1 are both free, so guest 2 sits on chair `0`.",
    explanation:
      "Process guests in order of arrival (sort indices by arrival time, remembering which one is the target). The naive approach scans all chairs to find the lowest free one for each arrival, which is O(n²). Two min-heaps make every step logarithmic:\n\n- `busy`: `(leave_time, chair)` for seated guests, so the next departure is on top;\n- `free`: numbers of chairs that have been used and released, so the lowest is on top;\n- `next_new`: the lowest chair number never used so far.\n\nFor each arriving guest:\n1. While the top of `busy` has `leave_time <= arrival`, pop it and push its chair onto `free`.\n2. If `free` is non-empty take its smallest chair; otherwise take `next_new` and increase it.\n3. If this is the target guest, return the chair. Otherwise push `(leave, chair)` onto `busy`.\n\nChairs in `free` are always lower than `next_new`, so step 2 really does pick the lowest free chair. Use `<=` in step 1: a chair released at the same instant counts as free. Counting the guests currently seated and using that as the chair number is wrong, because a low chair can be free while higher ones are occupied.\n\nSorting plus heap operations cost O(n log n) time and O(n) space.",
    functionName: "chair_of_guest",
    functionSignature: "def chair_of_guest(times: list[list[int]], target: int) -> int:",
    starter:
      STARTER_HEADER + "def chair_of_guest(times: list[list[int]], target: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 4], [2, 3], [4, 6]], 1], expected: 1 },
      { input: [[[3, 10], [1, 5], [2, 6]], 0], expected: 2 },
      { input: [[[1, 4], [2, 3], [4, 6]], 2], expected: 0 },
    ],
    hiddenTests: [
      { input: [[[5, 9]], 0], expected: 0 },
      { input: [[[1, 5], [2, 6], [3, 7], [5, 8], [6, 9], [7, 10]], 5], expected: 2 },
      { input: [[[4, 5], [12, 13], [5, 6], [1, 2], [8, 9], [9, 10], [6, 7], [3, 4], [7, 8], [13, 14], [15, 16], [14, 15], [10, 11], [11, 12], [2, 3], [16, 17]], 15], expected: 0 },
      { input: [[[1, 100], [2, 50], [3, 4], [5, 60], [51, 52], [61, 62]], 5], expected: 1 },
      { input: [[[1, 9], [2, 4], [3, 9], [5, 9], [6, 9]], 4], expected: 3 },
      { input: [[[10, 20], [1, 12], [2, 11], [11, 30], [12, 13]], 4], expected: 0 },
    ],
  },
  {
    id: "bootstrapped-ventures",
    number: 491,
    title: "Bootstrapped Ventures",
    difficulty: "Hard",
    topic: "Heap",
    statement:
      "You start with `capital` units of money and may complete **at most** `k` projects, one after another, each project at most once. Project `i` can be started only if your current money is at least `required[i]`. Starting a project does not use up the money; when it finishes, `profits[i]` is added to what you have. All numbers are non-negative integers, and `profits` and `required` have the same length (possibly zero).\n\nReturn the largest amount of money you can have after completing at most `k` projects. If no project can ever be started, the answer is the starting `capital`.\n\nFor example, with `k = 2`, `capital = 0`, `profits = [1, 2, 3]` and `required = [0, 1, 1]`: only project 0 can be started at first, raising your money to 1. Now projects 1 and 2 are both open; taking project 2 gives a final total of `4`.",
    explanation:
      "Trying every ordered choice of `k` projects is hopeless. A greedy rule works: at each step, among the projects you can currently afford, do the one with the largest profit.\n\nWhy it is safe: starting a project costs nothing and profits are never negative, so your money only grows and the set of affordable projects only grows. Taking the most profitable affordable project leaves you with at least as much money as any other choice, and therefore at least as many options next time; the project you skipped is still there later.\n\nMaking it fast needs two orderings at once: by requirement (to know what has become affordable) and by profit (to pick the best). Sort for the first and use a max-heap for the second:\n\n1. Sort the projects by `required`.\n2. Repeat up to `k` times: move every project whose requirement is at most the current money from the sorted list into a max-heap of profits (negate the values for `heapq`); if the heap is empty, stop early; otherwise pop the largest profit and add it to your money.\n\nA single pass that sorts by profit and takes whatever is affordable fails, because finishing a small project can unlock a big one that was skipped earlier in the pass.\n\nSorting is O(n log n) and each project is pushed and popped at most once, so the total is O(n log n + k log n) time and O(n) space.",
    functionName: "max_capital_after_projects",
    functionSignature: "def max_capital_after_projects(k: int, capital: int, profits: list[int], required: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def max_capital_after_projects(k: int, capital: int, profits: list[int], required: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [2, 0, [1, 2, 3], [0, 1, 1]], expected: 4 },
      { input: [3, 0, [1, 2, 3], [0, 1, 2]], expected: 6 },
      { input: [1, 2, [5, 9], [3, 4]], expected: 2 },
    ],
    hiddenTests: [
      { input: [0, 5, [1], [0]], expected: 5 },
      { input: [5, 1, [2], [1]], expected: 3 },
      { input: [3, 1, [1, 1, 9, 2], [1, 2, 3, 1]], expected: 13 },
      { input: [4, 0, [1, 1, 1, 50], [0, 1, 2, 3]], expected: 53 },
      { input: [3, 7, [], []], expected: 7 },
      { input: [2, 0, [8, 1, 4, 3], [4, 0, 1, 0]], expected: 7 },
    ],
  },
  {
    id: "brick-pyramid-row",
    number: 492,
    title: "Brick Pyramid Row",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    statement:
      "A pyramid of numbered bricks is built row by row. Row `0` is a single brick with the number `1`. Each following row has one more brick than the row above it: its first and last bricks are `1`, and every other brick is the sum of the two bricks resting above it (the bricks at positions `i - 1` and `i` of the previous row).\n\nThe first rows are `[1]`, `[1, 1]`, `[1, 2, 1]`, `[1, 3, 3, 1]`.\n\nGiven `n >= 0`, return row `n` as a list of `n + 1` integers.\n\nFor example, `n = 4` gives `[1, 4, 6, 4, 1]`.",
    explanation:
      "This is Pascal's triangle, and it is the gentlest example of dynamic programming: each row is computed entirely from the row before it, so you only need to keep one row at a time.\n\n1. Start with `row = [1]`.\n2. Repeat `n` times: the new row is `1`, then `row[i] + row[i + 1]` for each adjacent pair, then `1`.\n3. Return the row.\n\nIf you prefer to update a single list in place, append a `1` and then update the inner positions from right to left, so each sum still reads values from the previous row rather than ones you have just overwritten.\n\nA recursive definition without memoisation recomputes the same bricks exponentially often. The bottom-up version does 1 + 2 + ... + n additions: O(n²) time and O(n) space. Mind the indexing: row `n` has `n + 1` entries, and row `0` is `[1]`.",
    functionName: "pyramid_row",
    functionSignature: "def pyramid_row(n: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def pyramid_row(n: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [0], expected: [1] },
      { input: [4], expected: [1, 4, 6, 4, 1] },
      { input: [1], expected: [1, 1] },
    ],
    hiddenTests: [
      { input: [2], expected: [1, 2, 1] },
      { input: [3], expected: [1, 3, 3, 1] },
      { input: [6], expected: [1, 6, 15, 20, 15, 6, 1] },
      { input: [10], expected: [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1] },
      { input: [15], expected: [1, 15, 105, 455, 1365, 3003, 5005, 6435, 6435, 5005, 3003, 1365, 455, 105, 15, 1] },
    ],
  },
  {
    id: "longest-mirror-subsequence",
    number: 493,
    title: "Longest Mirror Subsequence",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement:
      "A *subsequence* of a string is what remains after deleting any number of characters (possibly none) without reordering the rest; the kept characters do not have to be next to each other. A string is a *mirror* if it reads the same forwards and backwards.\n\nGiven a string `s` of lowercase letters, return the length of the longest subsequence of `s` that is a mirror. An empty string returns `0`.\n\nFor example, for `\"character\"` the answer is `5` (keep `c, a, r, a, c`), and for `\"cbbd\"` it is `2` (keep `b, b`).",
    explanation:
      "There are 2^n subsequences, so enumeration is out. And this is not the same as the longest palindromic *substring*: the kept characters may be far apart.\n\nDefine `dp[i][j]` as the answer for the slice `s[i..j]` (inclusive). Look at the two end characters:\n- if `s[i] == s[j]`, they can wrap around the best mirror of the inside: `dp[i][j] = dp[i + 1][j - 1] + 2`;\n- otherwise at least one of them is not used: `dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])`.\n\nBase cases: `dp[i][i] = 1`, and an empty range (when `i > j`) counts as `0`.\n\nFill order matters because `dp[i][j]` needs row `i + 1`: loop `i` from `n - 1` down to `0` and `j` from `i + 1` up to `n - 1`. The answer is `dp[0][n - 1]`.\n\nThis is O(n²) time and O(n²) space (two rows are enough if you want O(n)). An equivalent formulation is the longest common subsequence of `s` and its reverse.",
    functionName: "longest_mirror_subsequence",
    functionSignature: "def longest_mirror_subsequence(s: str) -> int:",
    starter:
      STARTER_HEADER + "def longest_mirror_subsequence(s: str) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["bbbab"], expected: 4 },
      { input: ["cbbd"], expected: 2 },
      { input: ["character"], expected: 5 },
    ],
    hiddenTests: [
      { input: [""], expected: 0 },
      { input: ["a"], expected: 1 },
      { input: ["aaaa"], expected: 4 },
      { input: ["agbdba"], expected: 5 },
      { input: ["turboventilator"], expected: 7 },
      { input: ["abacdfgdcaba"], expected: 11 },
    ],
  },
  {
    id: "prototype-drop-test",
    number: 494,
    title: "Prototype Drop Test",
    difficulty: "Hard",
    topic: "Dynamic Programming",
    statement:
      "A lab has `phones` identical prototype phones (`phones >= 1`) and a building with floors numbered `1` to `floors` (`floors >= 0`). There is an unknown threshold `t` with `0 <= t <= floors`: a phone dropped from any floor above `t` breaks, and a phone dropped from floor `t` or below survives undamaged and can be dropped again. A broken phone cannot be reused.\n\nYou want a testing plan that is guaranteed to pin down the exact value of `t` whatever it turns out to be. Return the minimum number of drops such a plan needs in the worst case. With `0` floors there is nothing to test, so the answer is `0`.\n\nFor example, with `phones = 1` and `floors = 5` you must go up one floor at a time, which can take `5` drops. With `phones = 2` and `floors = 10`, `4` drops are enough: drop the first phone from floors 4, 7, 9 and 10 in turn, and when it breaks use the second phone to walk up through the floors in the gap just below (the total never exceeds 4).",
    explanation:
      "Binary search is only optimal when you have plenty of phones: with one phone a single bad drop ends the experiment, so you are forced to climb floor by floor.\n\nThe direct DP is `best(p, f) = 1 + min over x of max(best(p - 1, x - 1), best(p, f - x))`: drop from floor `x`; if it breaks, `x - 1` floors remain below with one phone fewer; if not, `f - x` floors remain above. That is O(phones * floors²), which is fine for small inputs but slow.\n\nA much better DP turns the question around. Let `reach(d, p)` be the largest number of floors that can be fully resolved with `d` drops and `p` phones. Make the first drop: if the phone breaks you can still resolve `reach(d - 1, p - 1)` floors below, if it survives you can resolve `reach(d - 1, p)` floors above, and the floor you dropped from is resolved too:\n\n`reach(d, p) = reach(d - 1, p - 1) + reach(d - 1, p) + 1`, with `reach(0, p) = 0` and `reach(d, 0) = 0`.\n\nIncrease `d` from 0 until `reach(d, phones) >= floors`; that `d` is the answer. A single array indexed by `p`, updated from high `p` to low `p`, is enough.\n\nThe answer is never more than `floors`, and each value of `d` costs O(phones) work, so the total is O(phones * answer) time and O(phones) space.",
    functionName: "min_drop_trials",
    functionSignature: "def min_drop_trials(phones: int, floors: int) -> int:",
    starter:
      STARTER_HEADER + "def min_drop_trials(phones: int, floors: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [1, 5], expected: 5 },
      { input: [2, 10], expected: 4 },
      { input: [3, 14], expected: 4 },
    ],
    hiddenTests: [
      { input: [1, 0], expected: 0 },
      { input: [1, 1], expected: 1 },
      { input: [2, 100], expected: 14 },
      { input: [10, 100], expected: 7 },
      { input: [2, 7], expected: 4 },
      { input: [4, 200], expected: 9 },
    ],
  },
];
