# Reference solutions for src/data/more/algos-a1.ts (problems 351-378).
from collections import deque, Counter
import re


# ---------------------------------------------------------------- Simulation
def elevator_floors_travelled(start, trips):
    total = 0
    cur = start
    for pickup, dropoff in trips:
        total += abs(cur - pickup) + abs(pickup - dropoff)
        cur = dropoff
    return total


def battery_after_events(charge, events):
    shutdowns = 0
    for e in events:
        if e > 0:
            charge = min(100, charge + e)
        elif charge > 0:
            charge = max(0, charge + e)
            if charge == 0:
                shutdowns += 1
    return [charge, shutdowns]


def counting_out_order(n, k):
    circle = list(range(1, n + 1))
    idx = 0
    out = []
    while circle:
        idx = (idx + k - 1) % len(circle)
        out.append(circle.pop(idx))
    return out


def board_race_winner(target, jumps, rolls):
    jump = {a: b for a, b in jumps}
    pos = [0, 0]
    for i, roll in enumerate(rolls):
        p = i % 2
        new = pos[p] + roll
        if new > target:
            continue
        new = jump.get(new, new)
        pos[p] = new
        if new == target:
            return [p + 1, i + 1]
    return [0, len(rolls)]


def type_with_cursor(keys):
    left = []   # characters before the cursor
    right = []  # characters after the cursor, nearest one last
    for ch in keys:
        if ch == '<':
            if left:
                right.append(left.pop())
        elif ch == '>':
            if right:
                left.append(right.pop())
        elif ch == '#':
            if left:
                left.pop()
        elif ch == '^':
            while left:
                right.append(left.pop())
        elif ch == '$':
            while right:
                left.append(right.pop())
        else:
            left.append(ch)
    return ''.join(left) + ''.join(reversed(right))


def settle_sand(grid):
    if not grid:
        return []
    rows, cols = len(grid), len(grid[0])
    g = [list(r) for r in grid]
    for c in range(cols):
        floor = rows - 1  # lowest free cell in the current section
        for r in range(rows - 1, -1, -1):
            if g[r][c] == '#':
                floor = r - 1
            elif g[r][c] == 'o':
                g[r][c] = '.'
                g[floor][c] = 'o'
                floor -= 1
    return [''.join(r) for r in g]


def conveyor_exit_steps(grid, row, col):
    rows, cols = len(grid), len(grid[0])
    delta = {'^': (-1, 0), 'v': (1, 0), '<': (0, -1), '>': (0, 1)}
    r, c, d = row, col, None
    seen = set()
    steps = 0
    while True:
        if grid[r][c] != '.':
            d = grid[r][c]
        if (r, c, d) in seen:
            return -1
        seen.add((r, c, d))
        r += delta[d][0]
        c += delta[d][1]
        steps += 1
        if not (0 <= r < rows and 0 <= c < cols):
            return steps


def checkout_assignments(arrivals, durations, lanes):
    free = [0] * lanes
    out = []
    for t, d in zip(arrivals, durations):
        lane = -1
        for i in range(lanes):
            if free[i] <= t:
                lane = i
                break
        if lane == -1:
            lane = min(range(lanes), key=lambda i: (free[i], i))
        finish = max(t, free[lane]) + d
        free[lane] = finish
        out.append([lane, finish])
    return out


def run_register_program(program):
    reg = {'a': 0, 'b': 0, 'c': 0, 'd': 0}

    def val(tok):
        return reg[tok] if tok in reg else int(tok)

    ip = 0
    while 0 <= ip < len(program):
        op, x, y = program[ip].split()
        if op == 'set':
            reg[x] = val(y)
        elif op == 'add':
            reg[x] += val(y)
        elif op == 'jnz':
            if val(x) != 0:
                ip += int(y)
                continue
        ip += 1
    return [reg['a'], reg['b'], reg['c'], reg['d']]


def card_duel_result(deck_a, deck_b, max_rounds):
    a, b = deque(deck_a), deque(deck_b)
    rounds = 0
    while a and b and rounds < max_rounds:
        x, y = a.popleft(), b.popleft()
        rounds += 1
        if x > y:
            a.append(x)
            a.append(y)
        elif y > x:
            b.append(y)
            b.append(x)
    if a and not b:
        return [1, rounds]
    if b and not a:
        return [2, rounds]
    return [0, rounds]


def gem_cascade(grid):
    if not grid:
        return []
    g = [row[:] for row in grid]
    rows, cols = len(g), len(g[0])
    while True:
        kill = set()
        for r in range(rows):
            for c in range(cols):
                v = g[r][c]
                if v == 0:
                    continue
                if c + 2 < cols and g[r][c + 1] == v and g[r][c + 2] == v:
                    kill.update([(r, c), (r, c + 1), (r, c + 2)])
                if r + 2 < rows and g[r + 1][c] == v and g[r + 2][c] == v:
                    kill.update([(r, c), (r + 1, c), (r + 2, c)])
        if not kill:
            return g
        for r, c in kill:
            g[r][c] = 0
        for c in range(cols):
            col = [g[r][c] for r in range(rows) if g[r][c] != 0]
            col = [0] * (rows - len(col)) + col
            for r in range(rows):
                g[r][c] = col[r]


def snake_run(width, height, food, moves):
    delta = {'U': (-1, 0), 'D': (1, 0), 'L': (0, -1), 'R': (0, 1)}
    body = deque([(0, 0)])  # head at the left
    occupied = {(0, 0)}
    fi = 0
    for i, m in enumerate(moves):
        hr, hc = body[0]
        nr, nc = hr + delta[m][0], hc + delta[m][1]
        if not (0 <= nr < height and 0 <= nc < width):
            return [i, len(body)]
        if fi < len(food) and food[fi][0] == nr and food[fi][1] == nc:
            fi += 1
        else:
            tail = body[-1]
            if (nr, nc) in occupied and (nr, nc) != tail:
                return [i, len(body)]
            body.pop()
            occupied.discard(tail)
        body.appendleft((nr, nc))
        occupied.add((nr, nc))
    return [len(moves), len(body)]


def bar_stack_heights(width, drops):
    rows = []  # rows[0] is the floor row; each row is a list of bools
    for left, length in drops:
        cols = range(left, left + length)
        rest = 0
        for c in cols:
            for i in range(len(rows) - 1, -1, -1):
                if rows[i][c]:
                    rest = max(rest, i + 1)
                    break
        while len(rows) <= rest:
            rows.append([False] * width)
        for c in cols:
            rows[rest][c] = True
        if all(rows[rest]):
            del rows[rest]
    heights = [0] * width
    for i, row in enumerate(rows):
        for c in range(width):
            if row[c]:
                heights[c] = i + 1
    return heights


def patrol_position(grid, row, col, k):
    rows, cols = len(grid), len(grid[0])
    dirs = [(-1, 0), (0, 1), (1, 0), (0, -1)]
    state = (row, col, 0)
    seen = {state: 0}
    history = [state]
    t = 0
    while t < k:
        r, c, d = state
        nr, nc = r + dirs[d][0], c + dirs[d][1]
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != '#':
            state = (nr, nc, d)
        else:
            state = (r, c, (d + 1) % 4)
        t += 1
        if state in seen:
            start = seen[state]
            cycle = t - start
            state = history[start + (k - start) % cycle]
            break
        seen[state] = t
        history.append(state)
    return [state[0], state[1]]


# ------------------------------------------------------------------- Sorting
def leaderboard_order(names, scores, penalties):
    order = sorted(range(len(names)), key=lambda i: (-scores[i], penalties[i], names[i]))
    return [names[i] for i in order]


def stable_length_sort(sentence):
    return ' '.join(sorted(sentence.split(), key=len))


def sort_by_digit_sum(nums):
    return sorted(nums, key=lambda x: (sum(int(ch) for ch in str(abs(x))), x))


def competition_ranks(scores):
    ordered = sorted(scores, reverse=True)
    rank = {}
    for i, s in enumerate(ordered):
        if s not in rank:
            rank[s] = i + 1
    return [rank[s] for s in scores]


def high_low_shuffle(nums):
    s = sorted(nums)
    lo, hi = 0, len(s) - 1
    out = []
    while lo <= hi:
        out.append(s[hi])
        hi -= 1
        if lo <= hi:
            out.append(s[lo])
            lo += 1
    return out


def frequency_sort_text(s):
    count = Counter(s)
    return ''.join(ch * n for ch, n in sorted(count.items(), key=lambda kv: (-kv[1], kv[0])))


def natural_sort(names):
    def key(name):
        parts = re.findall(r'\d+|[a-z]+', name)
        return [(0, int(p), '') if p.isdigit() else (1, 0, p) for p in parts]
    return sorted(names, key=key)


def sort_diagonals(grid):
    if not grid:
        return []
    rows, cols = len(grid), len(grid[0])
    groups = {}
    for r in range(rows):
        for c in range(cols):
            groups.setdefault(r - c, []).append(grid[r][c])
    for k in groups:
        groups[k].sort(reverse=True)  # pop() then yields ascending values
    return [[groups[r - c].pop() for c in range(cols)] for r in range(rows)]


def min_swaps_to_sort(nums):
    order = sorted(range(len(nums)), key=lambda i: nums[i])
    seen = [False] * len(nums)
    swaps = 0
    for i in range(len(nums)):
        j = i
        size = 0
        while not seen[j]:
            seen[j] = True
            j = order[j]
            size += 1
        if size > 1:
            swaps += size - 1
    return swaps


def unsorted_window_length(nums):
    s = sorted(nums)
    lo = 0
    while lo < len(nums) and nums[lo] == s[lo]:
        lo += 1
    if lo == len(nums):
        return 0
    hi = len(nums) - 1
    while nums[hi] == s[hi]:
        hi -= 1
    return hi - lo + 1


def creator_tier(views):
    s = sorted(views, reverse=True)
    t = 0
    while t < len(s) and s[t] >= t + 1:
        t += 1
    return t


def count_pairs_in_range(nums, low, high):
    s = sorted(nums)

    def at_most(limit):
        lo, hi = 0, len(s) - 1
        total = 0
        while lo < hi:
            if s[lo] + s[hi] <= limit:
                total += hi - lo
                lo += 1
            else:
                hi -= 1
        return total

    if low > high:
        return 0
    return at_most(high) - at_most(low - 1)


def adjacent_swaps_to_match(source, target):
    if sorted(source) != sorted(target):
        return -1
    slots = {}
    for i, v in enumerate(target):
        slots.setdefault(v, deque()).append(i)
    perm = [slots[v].popleft() for v in source]

    def count(arr):
        if len(arr) <= 1:
            return arr, 0
        mid = len(arr) // 2
        left, a = count(arr[:mid])
        right, b = count(arr[mid:])
        merged = []
        inv = a + b
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
                inv += len(left) - i
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, inv

    return count(perm)[1]


def kth_pair_distance(nums, k):
    s = sorted(nums)

    def pairs_within(d):
        total = 0
        lo = 0
        for hi in range(len(s)):
            while s[hi] - s[lo] > d:
                lo += 1
            total += hi - lo
        return total

    lo, hi = 0, s[-1] - s[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if pairs_within(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo
