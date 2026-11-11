# Reference solutions for src/data/more/algos-a7.ts (numbers 523-550).
import re
from collections import Counter, deque


# ---------------------------------------------------------------- String

def is_long_pressed(name, typed):
    i = 0
    for j, ch in enumerate(typed):
        if i < len(name) and name[i] == ch:
            i += 1
        elif j == 0 or typed[j - 1] != ch:
            return False
    return i == len(name)


def is_rotation_of(s, t):
    return len(s) == len(t) and t in s + s


def merge_with_overlap(a, b):
    for k in range(min(len(a), len(b)), 0, -1):
        if a[len(a) - k:] == b[:k]:
            return a + b[k:]
    return a + b


def matches_abbreviation(word, abbr):
    i = 0
    j = 0
    while j < len(abbr):
        ch = abbr[j]
        if ch.isdigit():
            if ch == '0':
                return False
            num = 0
            while j < len(abbr) and abbr[j].isdigit():
                num = num * 10 + int(abbr[j])
                j += 1
            i += num
            if i > len(word):
                return False
        else:
            if i >= len(word) or word[i] != ch:
                return False
            i += 1
            j += 1
    return i == len(word)


def rail_fence_encode(s, rails):
    if rails == 1:
        return s
    rows = [[] for _ in range(rails)]
    row = 0
    step = 1
    for ch in s:
        rows[row].append(ch)
        if row == 0:
            step = 1
        elif row == rails - 1:
            step = -1
        row += step
    return ''.join(''.join(r) for r in rows)


def smallest_repeating_unit(s):
    n = len(s)
    for size in range(1, n + 1):
        if n % size == 0 and s[:size] * (n // size) == s:
            return s[:size]
    return s


def fill_template(template, values):
    def swap(match):
        key = match.group(1)
        return values[key] if key in values else match.group(0)
    return re.sub(r'\{([a-z_]+)\}', swap, template)


def number_to_words(n):
    if n == 0:
        return 'Zero'
    ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
            'Eighteen', 'Nineteen']
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    def below_thousand(x):
        words = []
        if x >= 100:
            words += [ones[x // 100], 'Hundred']
            x %= 100
        if x >= 20:
            words.append(tens[x // 10])
            x %= 10
        if x:
            words.append(ones[x])
        return words

    out = []
    for size, label in ((10 ** 9, 'Billion'), (10 ** 6, 'Million'), (10 ** 3, 'Thousand'), (1, '')):
        group = n // size % 1000
        if group:
            out += below_thousand(group)
            if label:
                out.append(label)
    return ' '.join(out)


# ---------------------------------------------------------------- Array

def right_side_leaders(nums):
    out = []
    best = None
    for x in reversed(nums):
        if best is None or x > best:
            out.append(x)
            best = x
    return out[::-1]


def longest_rising_run(nums):
    best = 0
    run = 0
    for i, x in enumerate(nums):
        run = run + 1 if i > 0 and x > nums[i - 1] else 1
        best = max(best, run)
    return best


def missing_ranges(nums, lo, hi):
    out = []

    def add(a, b):
        if a == b:
            out.append(str(a))
        elif a < b:
            out.append('%d->%d' % (a, b))

    prev = lo - 1
    for x in nums:
        add(prev + 1, x - 1)
        prev = x
    add(prev + 1, hi)
    return out


def quietest_desk_distance(desks):
    best = 0
    last = -1
    for i, taken in enumerate(desks):
        if taken:
            best = max(best, i if last == -1 else (i - last) // 2)
            last = i
    return max(best, len(desks) - 1 - last)


def best_viewpoint_pair(ratings):
    best = None
    left = ratings[0]  # best value of ratings[i] + i seen so far
    for j in range(1, len(ratings)):
        cand = left + ratings[j] - j
        if best is None or cand > best:
            best = cand
        left = max(left, ratings[j] + j)
    return best


def has_rising_triple(nums):
    first = second = None
    for x in nums:
        if first is None or x <= first:
            first = x
        elif second is None or x <= second:
            second = x
        else:
            return True
    return False


def max_sortable_chunks(nums):
    stack = []  # the maximum of each chunk
    for x in nums:
        top = x
        while stack and stack[-1] > x:
            top = max(top, stack.pop())
        stack.append(top)
    return len(stack)


# ---------------------------------------------------------------- Graph

def find_source_nodes(n, edges):
    has_incoming = [False] * n
    for a, b in edges:
        has_incoming[b] = True
    return [v for v in range(n) if not has_incoming[v]]


def safe_nodes(graph):
    n = len(graph)
    state = [0] * n  # 0 unseen, 1 on the current path / unsafe, 2 safe

    def safe(v):
        if state[v]:
            return state[v] == 2
        state[v] = 1
        for w in graph[v]:
            if not safe(w):
                return False
        state[v] = 2
        return True

    return [v for v in range(n) if safe(v)]


def knight_min_moves(size, start, target, blocked):
    bad = {(r, c) for r, c in blocked}
    goal = (target[0], target[1])
    begin = (start[0], start[1])
    dist = {begin: 0}
    queue = deque([begin])
    jumps = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]
    while queue:
        cur = queue.popleft()
        if cur == goal:
            return dist[cur]
        for dr, dc in jumps:
            nxt = (cur[0] + dr, cur[1] + dc)
            if 0 <= nxt[0] < size and 0 <= nxt[1] < size and nxt not in bad and nxt not in dist:
                dist[nxt] = dist[cur] + 1
                queue.append(nxt)
    return -1


def count_shortest_routes(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    dist = [-1] * n
    ways = [0] * n
    dist[src] = 0
    ways[src] = 1
    queue = deque([src])
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
            if dist[v] == dist[u] + 1:
                ways[v] += ways[u]
    return ways[dst]


def shortest_cycle_length(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    best = -1
    for root in range(n):
        dist = [-1] * n
        parent = [-1] * n
        dist[root] = 0
        queue = deque([root])
        while queue:
            u = queue.popleft()
            for v in adj[u]:
                if dist[v] == -1:
                    dist[v] = dist[u] + 1
                    parent[v] = u
                    queue.append(v)
                elif v != parent[u]:
                    length = dist[u] + dist[v] + 1
                    if best == -1 or length < best:
                        best = length
    return best


def count_mutual_groups(n, links):
    adj = [[] for _ in range(n)]
    radj = [[] for _ in range(n)]
    for a, b in links:
        adj[a].append(b)
        radj[b].append(a)
    seen = [False] * n
    order = []
    for s in range(n):
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, 0)]
        while stack:
            v, i = stack.pop()
            if i < len(adj[v]):
                stack.append((v, i + 1))
                w = adj[v][i]
                if not seen[w]:
                    seen[w] = True
                    stack.append((w, 0))
            else:
                order.append(v)
    seen = [False] * n
    groups = 0
    for s in reversed(order):
        if seen[s]:
            continue
        groups += 1
        seen[s] = True
        stack = [s]
        while stack:
            v = stack.pop()
            for w in radj[v]:
                if not seen[w]:
                    seen[w] = True
                    stack.append(w)
    return groups


def min_steps_with_demolition(grid, k):
    rows, cols = len(grid), len(grid[0])
    start = (0, 0, k)
    seen = {start}
    queue = deque([(0, 0, k, 0)])
    while queue:
        r, c, left, steps = queue.popleft()
        if r == rows - 1 and c == cols - 1:
            return steps
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                nleft = left - grid[nr][nc]
                if nleft >= 0 and (nr, nc, nleft) not in seen:
                    seen.add((nr, nc, nleft))
                    queue.append((nr, nc, nleft, steps + 1))
    return -1


# ---------------------------------------------------------------- Greedy

def max_truck_units(boxes, capacity):
    total = 0
    for count, units in sorted(boxes, key=lambda b: -b[1]):
        take = min(count, capacity)
        total += take * units
        capacity -= take
        if capacity == 0:
            break
    return total


def longest_zigzag_length(nums):
    if not nums:
        return 0
    up = down = 1
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            up = down + 1
        elif nums[i] < nums[i - 1]:
            down = up + 1
    return max(up, down)


def min_deletions_unique_counts(s):
    used = set()
    deletions = 0
    for count in sorted(Counter(s).values(), reverse=True):
        while count > 0 and count in used:
            count -= 1
            deletions += 1
        if count:
            used.add(count)
    return deletions


def min_coin_patches(coins, target):
    reach = 0  # every amount 1..reach can already be paid
    added = 0
    i = 0
    while reach < target:
        if i < len(coins) and coins[i] <= reach + 1:
            reach += coins[i]
            i += 1
        else:
            reach += reach + 1
            added += 1
    return added


# ---------------------------------------------------------------- Tree

def sum_left_leaves(root):
    total = 0
    stack = [(root, False)]
    while stack:
        node, is_left = stack.pop()
        if node is None:
            continue
        if node.left is None and node.right is None:
            if is_left:
                total += node.val
            continue
        stack.append((node.left, True))
        stack.append((node.right, False))
    return total


def remove_target_leaves(root, target):
    if root is None:
        return None
    root.left = remove_target_leaves(root.left, target)
    root.right = remove_target_leaves(root.right, target)
    if root.left is None and root.right is None and root.val == target:
        return None
    return root
