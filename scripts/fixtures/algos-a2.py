# Reference solutions for src/data/more/algos-a2.ts (problems 379-406).
import bisect
import heapq


class _DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True


# ---------------------------------------------------------------- Union Find

def group_sizes(n, pairs):
    d = _DSU(n)
    for a, b in pairs:
        d.union(a, b)
    return sorted((d.size[i] for i in range(n) if d.find(i) == i), reverse=True)


def same_network(n, links, queries):
    d = _DSU(n)
    for a, b in links:
        d.union(a, b)
    return [d.find(a) == d.find(b) for a, b in queries]


def group_leaders(n, pairs):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in pairs:
        ra, rb = find(a), find(b)
        if ra != rb:
            # the smaller id always stays the root
            if ra < rb:
                parent[rb] = ra
            else:
                parent[ra] = rb
    return [find(i) for i in range(n)]


def largest_group_sizes(n, merges):
    d = _DSU(n)
    best = 1
    out = []
    for a, b in merges:
        if d.union(a, b):
            best = max(best, d.size[d.find(a)])
        out.append(best)
    return out


def canonical_spelling(s1, s2, text):
    parent = list(range(26))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in zip(s1, s2):
        ra, rb = find(ord(a) - 97), find(ord(b) - 97)
        if ra < rb:
            parent[rb] = ra
        elif rb < ra:
            parent[ra] = rb
    return ''.join(chr(find(ord(c) - 97) + 97) for c in text)


def phrases_match(first, second, synonyms):
    if len(first) != len(second):
        return False
    parent = {}

    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in synonyms:
        parent[find(a)] = find(b)
    return all(find(a) == find(b) for a, b in zip(first, second))


def assign_parking(n, prefs):
    # nxt[i] = lowest free spot at or after i (n = none left)
    nxt = list(range(n + 1))

    def find(x):
        while nxt[x] != x:
            nxt[x] = nxt[nxt[x]]
            x = nxt[x]
        return x

    out = []
    for p in prefs:
        spot = find(p)
        if spot == n:
            out.append(-1)
        else:
            out.append(spot)
            nxt[spot] = spot + 1
    return out


def gentlest_route(n, trails, start, goal):
    if start == goal:
        return 0
    d = _DSU(n)
    for a, b, w in sorted(trails, key=lambda t: t[2]):
        d.union(a, b)
        if d.find(start) == d.find(goal):
            return w
    return -1


def cheapest_cable_plan(n, offers):
    d = _DSU(n)
    total = 0
    used = 0
    for a, b, cost in sorted(offers, key=lambda t: t[2]):
        if d.union(a, b):
            total += cost
            used += 1
    return total if used == n - 1 else -1


def count_stranded_pairs(n, links):
    d = _DSU(n)
    for a, b in links:
        d.union(a, b)
    total = n * (n - 1) // 2
    for i in range(n):
        if d.find(i) == i:
            s = d.size[i]
            total -= s * (s - 1) // 2
    return total


def first_contradiction(n, reports):
    parent = list(range(n))
    flip = [0] * n  # parity of the path from a node to its parent

    def find(x):
        if parent[x] == x:
            return x, 0
        root, p = find(parent[x])
        p ^= flip[x]
        parent[x] = root
        flip[x] = p
        return root, p

    for i, (a, b, rel) in enumerate(reports):
        ra, pa = find(a)
        rb, pb = find(b)
        if ra == rb:
            if pa ^ pb != rel:
                return i
        else:
            parent[ra] = rb
            flip[ra] = pa ^ pb ^ rel
    return -1


def groups_after_shutdowns(n, links, order):
    alive = [True] * n
    for s in order:
        alive[s] = False
    adj = [[] for _ in range(n)]
    for a, b in links:
        adj[a].append(b)
        adj[b].append(a)
    d = _DSU(n)
    count = sum(alive)
    for a, b in links:
        if alive[a] and alive[b] and d.union(a, b):
            count -= 1
    out = [0] * len(order)
    for i in range(len(order) - 1, -1, -1):
        out[i] = count
        s = order[i]
        alive[s] = True
        count += 1
        for nb in adj[s]:
            if alive[nb] and d.union(s, nb):
                count -= 1
    return out


def can_cross_under(n, bridges, queries):
    d = _DSU(n)
    edges = sorted(bridges, key=lambda t: t[2])
    out = [False] * len(queries)
    j = 0
    for qi in sorted(range(len(queries)), key=lambda i: queries[i][2]):
        a, b, limit = queries[qi]
        while j < len(edges) and edges[j][2] < limit:
            d.union(edges[j][0], edges[j][1])
            j += 1
        out[qi] = d.find(a) == d.find(b)
    return out


# ------------------------------------------------------------------ Interval

def widest_idle_gap(intervals):
    best = 0
    reach = None
    for s, e in sorted(intervals):
        if reach is not None and s > reach:
            best = max(best, s - reach)
        reach = e if reach is None else max(reach, e)
    return best


def is_window_covered(shifts, start, end):
    reach = start
    for s, e in sorted(shifts):
        if s > reach:
            break
        reach = max(reach, e)
    return reach >= end


def accepted_bookings(requests):
    kept = []
    out = []
    for s, e in requests:
        ok = all(e <= ks or ke <= s for ks, ke in kept)
        if ok:
            kept.append((s, e))
        out.append(ok)
    return out


def count_outer_intervals(intervals):
    count = 0
    reach = None
    for s, e in sorted(set(map(tuple, intervals)), key=lambda t: (t[0], -t[1])):
        if reach is None or e > reach:
            count += 1
            reach = e
    return count


def carve_out(intervals, cut):
    c0, c1 = cut
    out = []
    for s, e in intervals:
        if e <= c0 or s >= c1:
            out.append([s, e])
        else:
            if s < c0:
                out.append([s, c0])
            if e > c1:
                out.append([c1, e])
    return out


def fewest_clips(clips, length):
    clips = sorted(clips)
    count = 0
    reach = 0
    far = 0
    i = 0
    while reach < length:
        while i < len(clips) and clips[i][0] <= reach:
            far = max(far, clips[i][1])
            i += 1
        if far == reach:
            return -1
        reach = far
        count += 1
    return count


def next_interval_index(intervals):
    order = sorted((s, i) for i, (s, _) in enumerate(intervals))
    starts = [s for s, _ in order]
    out = []
    for _, e in intervals:
        k = bisect.bisect_left(starts, e)
        out.append(order[k][1] if k < len(order) else -1)
    return out


def free_slots(busy, open_time, close_time, min_len):
    out = []
    cur = open_time
    for s, e in sorted(busy):
        if cur >= close_time:
            break
        if s > cur:
            stop = min(s, close_time)
            if stop - cur >= min_len:
                out.append([cur, stop])
        cur = max(cur, e)
    if close_time - cur >= min_len:
        out.append([cur, close_time])
    return out


def tightest_interval_sizes(intervals, queries):
    ivs = sorted(intervals)
    out = [-1] * len(queries)
    heap = []
    j = 0
    for qi in sorted(range(len(queries)), key=lambda i: queries[i]):
        q = queries[qi]
        while j < len(ivs) and ivs[j][0] <= q:
            heapq.heappush(heap, (ivs[j][1] - ivs[j][0] + 1, ivs[j][1]))
            j += 1
        while heap and heap[0][1] < q:
            heapq.heappop(heap)
        if heap:
            out[qi] = heap[0][0]
    return out


def min_checkpoints(intervals):
    count = 0
    p1 = p2 = float('-inf')  # the two largest chosen points, p1 < p2
    for s, e in sorted(intervals, key=lambda t: (t[1], -t[0])):
        if s <= p1:
            continue
        if s <= p2:
            count += 1
            p1, p2 = p2, e
        else:
            count += 2
            p1, p2 = e - 1, e
    return count


# --------------------------------------------------------------- Linked List

def binary_list_value(head):
    value = 0
    while head:
        value = value * 2 + head.val
        head = head.next
    return value


def keep_and_skip(head, keep, skip):
    node = head
    while node:
        for _ in range(keep - 1):
            if node is None:
                break
            node = node.next
        if node is None:
            break
        nxt = node.next
        for _ in range(skip):
            if nxt is None:
                break
            nxt = nxt.next
        node.next = nxt
        node = nxt
    return head


def segment_totals(head):
    dummy = ListNode(0)
    tail = dummy
    total = 0
    open_run = False
    while head:
        if head.val == 0:
            if open_run:
                tail.next = ListNode(total)
                tail = tail.next
            total = 0
            open_run = False
        else:
            total += head.val
            open_run = True
        head = head.next
    if open_run:
        tail.next = ListNode(total)
    return dummy.next


def drop_overshadowed(head):
    stack = []
    node = head
    while node:
        while stack and stack[-1].val < node.val:
            stack.pop()
        stack.append(node)
        node = node.next
    for a, b in zip(stack, stack[1:]):
        a.next = b
    return stack[0] if stack else None


def flip_even_groups(head):
    prev = head
    size = 2
    while prev and prev.next:
        # measure the real length of the next group
        count = 0
        node = prev.next
        while node and count < size:
            node = node.next
            count += 1
        if count % 2 == 0:
            cur = prev.next
            rev = node
            for _ in range(count):
                nxt = cur.next
                cur.next = rev
                rev = cur
                cur = nxt
            first = prev.next
            prev.next = rev
            prev = first
        else:
            for _ in range(count):
                prev = prev.next
        size += 1
    return head
