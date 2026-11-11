# Reference solutions for src/data/more/algos-a5.ts (problems 466-494).
import heapq
from collections import Counter
from functools import lru_cache


# ---------------------------------------------------------------- Monotonic Stack
def nearest_smaller_left(nums):
    out = []
    stack = []  # indices, values strictly increasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] >= x:
            stack.pop()
        out.append(stack[-1] if stack else -1)
        stack.append(i)
    return out


def nearest_taller_distance(heights):
    n = len(heights)
    best = [0] * n
    stack = []
    for i in range(n):
        while stack and heights[stack[-1]] <= heights[i]:
            stack.pop()
        if stack:
            best[i] = i - stack[-1]
        stack.append(i)
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and heights[stack[-1]] <= heights[i]:
            stack.pop()
        if stack:
            d = stack[-1] - i
            if best[i] == 0 or d < best[i]:
                best[i] = d
        stack.append(i)
    return best


def max_mountain_total(limits):
    n = len(limits)
    if n == 0:
        return 0

    def sweep(vals):
        # best[i] = largest total for vals[0..i] when heights never decrease and tower i is at its limit
        best = [0] * len(vals)
        stack = []
        for i, x in enumerate(vals):
            while stack and vals[stack[-1]] > x:
                stack.pop()
            j = stack[-1] if stack else -1
            best[i] = (best[j] if j >= 0 else 0) + x * (i - j)
            stack.append(i)
        return best

    left = sweep(limits)
    right = sweep(limits[::-1])[::-1]
    return max(left[i] + right[i] - limits[i] for i in range(n))


def count_floor_stretches(prices):
    n = len(prices)
    total = 0
    stack = []  # indices still waiting for a strictly lower price
    for i, x in enumerate(prices):
        while stack and prices[stack[-1]] > x:
            j = stack.pop()
            total += i - j
        stack.append(i)
    for j in stack:
        total += n - j
    return total


def min_fusion_cost(sizes):
    stack = [float('inf')]
    cost = 0
    for x in sizes:
        while stack[-1] <= x:
            mid = stack.pop()
            cost += mid * min(stack[-1], x)
        stack.append(x)
    while len(stack) > 2:
        top = stack.pop()
        cost += top * stack[-1]
    return cost


def rounds_until_sorted(nums):
    stack = []  # (value, round in which it is removed; 0 = never)
    best = 0
    for x in nums:
        t = 0
        while stack and stack[-1][0] <= x:
            t = max(t, stack.pop()[1])
        t = t + 1 if stack else 0
        best = max(best, t)
        stack.append((x, t))
    return best


def best_minimum_per_window(nums):
    n = len(nums)
    if n == 0:
        return []
    left = [-1] * n   # previous strictly smaller
    right = [n] * n   # next smaller or equal
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] >= x:
            right[stack.pop()] = i
        left[i] = stack[-1] if stack else -1
        stack.append(i)
    res = [None] * (n + 1)
    for i, x in enumerate(nums):
        span = right[i] - left[i] - 1
        if res[span] is None or x > res[span]:
            res[span] = x
    for k in range(n - 1, 0, -1):
        if res[k] is None or (res[k + 1] is not None and res[k + 1] > res[k]):
            res[k] = res[k + 1]
    return res[1:]


def is_bst_preorder(order):
    low = None
    stack = []
    for x in order:
        if low is not None and x < low:
            return False
        while stack and stack[-1] < x:
            low = stack.pop()
        stack.append(x)
    return True


# ---------------------------------------------------------------- Stack
def scoreboard_total(entries):
    rec = []
    for e in entries:
        if e == 'undo':
            rec.pop()
        elif e == 'double':
            rec.append(2 * rec[-1])
        elif e == 'sum':
            rec.append(rec[-1] + rec[-2])
        else:
            rec.append(int(e))
    return sum(rec)


def min_bracket_insertions(s):
    open_needed = 0
    depth = 0
    for ch in s:
        if ch == '(':
            depth += 1
        elif depth:
            depth -= 1
        else:
            open_needed += 1
    return open_needed + depth


def strip_outer_layers(s):
    out = []
    depth = 0
    for ch in s:
        if ch == '(':
            if depth > 0:
                out.append(ch)
            depth += 1
        else:
            depth -= 1
            if depth > 0:
                out.append(ch)
    return ''.join(out)


def is_valid_pop_order(pushed, popped):
    stack = []
    j = 0
    for x in pushed:
        stack.append(x)
        while stack and j < len(popped) and stack[-1] == popped[j]:
            stack.pop()
            j += 1
    return not stack


def reverse_bracketed(s):
    stack = [[]]
    for ch in s:
        if ch == '(':
            stack.append([])
        elif ch == ')':
            inner = stack.pop()
            inner.reverse()
            stack[-1].extend(inner)
        else:
            stack[-1].append(ch)
    return ''.join(stack[0])


def exclusive_times(n, logs):
    out = [0] * n
    stack = []
    prev = 0
    for fid, kind, t in logs:
        if kind == 'start':
            if stack:
                out[stack[-1]] += t - prev
            stack.append(fid)
            prev = t
        else:
            out[stack.pop()] += t - prev + 1
            prev = t + 1
    return out


def count_atoms(formula):
    stack = [Counter()]
    i = 0
    n = len(formula)

    def read_count(i):
        j = i
        while j < n and formula[j].isdigit():
            j += 1
        return (int(formula[i:j]) if j > i else 1), j

    while i < n:
        ch = formula[i]
        if ch == '(':
            stack.append(Counter())
            i += 1
        elif ch == ')':
            mult, i = read_count(i + 1)
            group = stack.pop()
            for k, v in group.items():
                stack[-1][k] += v * mult
        else:
            j = i + 1
            while j < n and formula[j].islower():
                j += 1
            name = formula[i:j]
            cnt, i = read_count(j)
            stack[-1][name] += cnt
    return dict(stack[0])


# ---------------------------------------------------------------- Matrix
def flip_across_diagonal(grid):
    return [[grid[r][c] for r in range(len(grid))] for c in range(len(grid[0]))]


def shoreline_length(grid):
    m, n = len(grid), len(grid[0])
    total = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    rr, cc = r + dr, c + dc
                    if not (0 <= rr < m and 0 <= cc < n) or grid[rr][cc] == 0:
                        total += 1
    return total


def saddle_cells(grid):
    row_min = [min(row) for row in grid]
    col_max = [max(col) for col in zip(*grid)]
    out = []
    for r, row in enumerate(grid):
        for c, v in enumerate(row):
            if v == row_min[r] and v == col_max[c]:
                out.append([r, c])
    return out


def zigzag_diagonals(grid):
    m, n = len(grid), len(grid[0])
    out = []
    for d in range(m + n - 1):
        cells = [grid[r][d - r] for r in range(max(0, d - n + 1), min(d, m - 1) + 1)]
        if d % 2 == 0:
            cells.reverse()
        out.extend(cells)
    return out


def rotate_rings(grid, k):
    m, n = len(grid), len(grid[0])
    out = [row[:] for row in grid]
    for ring in range(min(m, n) // 2):
        top, left, bottom, right = ring, ring, m - 1 - ring, n - 1 - ring
        cells = [(top, c) for c in range(left, right)]
        cells += [(r, right) for r in range(top, bottom)]
        cells += [(bottom, c) for c in range(right, left, -1)]
        cells += [(r, left) for r in range(bottom, top, -1)]
        size = len(cells)
        for idx, (r, c) in enumerate(cells):
            rr, cc = cells[(idx + k) % size]
            out[rr][cc] = grid[r][c]
    return out


def longest_uphill_trail(grid):
    m, n = len(grid), len(grid[0])

    @lru_cache(maxsize=None)
    def go(r, c):
        best = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            rr, cc = r + dr, c + dc
            if 0 <= rr < m and 0 <= cc < n and grid[rr][cc] > grid[r][c]:
                best = max(best, 1 + go(rr, cc))
        return best

    return max(go(r, c) for r in range(m) for c in range(n))


# ---------------------------------------------------------------- Heap
def remaining_after_halvings(piles, k):
    heap = [-p for p in piles]
    heapq.heapify(heap)
    for _ in range(k):
        top = -heap[0]
        heapq.heapreplace(heap, -(top - top // 2))
    return -sum(heap)


def k_smallest_pair_sums(a, b, k):
    if not a or not b:
        return []
    heap = [(a[i] + b[0], i, 0) for i in range(min(len(a), k))]
    heapq.heapify(heap)
    out = []
    while heap and len(out) < k:
        s, i, j = heapq.heappop(heap)
        out.append(s)
        if j + 1 < len(b):
            heapq.heappush(heap, (a[i] + b[j + 1], i, j + 1))
    return out


def total_hiring_cost(costs, k, window):
    n = len(costs)
    lo, hi = 0, n - 1
    front, back = [], []
    total = 0
    for _ in range(k):
        while len(front) < window and lo <= hi:
            heapq.heappush(front, (costs[lo], lo))
            lo += 1
        while len(back) < window and lo <= hi:
            heapq.heappush(back, (costs[hi], hi))
            hi -= 1
        if front and (not back or front[0] <= back[0]):
            total += heapq.heappop(front)[0]
        else:
            total += heapq.heappop(back)[0]
    return total


def chair_of_guest(times, target):
    order = sorted(range(len(times)), key=lambda i: times[i][0])
    free = []        # chair numbers that were used and released
    busy = []        # (leave time, chair)
    next_new = 0
    for i in order:
        arrive, leave = times[i]
        while busy and busy[0][0] <= arrive:
            heapq.heappush(free, heapq.heappop(busy)[1])
        if free:
            chair = heapq.heappop(free)
        else:
            chair = next_new
            next_new += 1
        if i == target:
            return chair
        heapq.heappush(busy, (leave, chair))
    return -1


def max_capital_after_projects(k, capital, profits, required):
    jobs = sorted(zip(required, profits))
    heap = []
    i = 0
    for _ in range(k):
        while i < len(jobs) and jobs[i][0] <= capital:
            heapq.heappush(heap, -jobs[i][1])
            i += 1
        if not heap:
            break
        capital += -heapq.heappop(heap)
    return capital


# ---------------------------------------------------------------- Dynamic Programming
def pyramid_row(n):
    row = [1]
    for _ in range(n):
        row = [1] + [row[i] + row[i + 1] for i in range(len(row) - 1)] + [1]
    return row


def longest_mirror_subsequence(s):
    n = len(s)
    if n == 0:
        return 0
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]


def min_drop_trials(phones, floors):
    # reach[p] = how many floors can be fully resolved with the drops used so far and p phones
    reach = [0] * (phones + 1)
    drops = 0
    while reach[phones] < floors:
        drops += 1
        for p in range(phones, 0, -1):
            reach[p] = reach[p] + reach[p - 1] + 1
    return drops
