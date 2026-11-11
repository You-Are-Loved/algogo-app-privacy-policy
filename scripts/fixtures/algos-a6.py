# Reference solutions for src/data/more/algos-a6.ts (numbers 495-522).
from collections import Counter, defaultdict
from bisect import bisect_left, bisect_right
import heapq


# ---------------------------------------------------------------- Hash Table
def count_equal_pairs(nums):
    seen = {}
    total = 0
    for x in nums:
        total += seen.get(x, 0)
        seen[x] = seen.get(x, 0) + 1
    return total


def largest_self_count_value(nums):
    best = -1
    for value, count in Counter(nums).items():
        if value == count and value > best:
            best = value
    return best


def has_repeat_within(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False


def smallest_axis_rectangle(points):
    have = {(x, y) for x, y in points}
    best = 0
    n = len(points)
    for i in range(n):
        x1, y1 = points[i]
        for j in range(i + 1, n):
            x2, y2 = points[j]
            if x1 == x2 or y1 == y2:
                continue
            if (x1, y2) in have and (x2, y1) in have:
                area = abs(x1 - x2) * abs(y1 - y2)
                if best == 0 or area < best:
                    best = area
    return best


def fewest_bricks_cut(wall):
    joints = Counter()
    for row in wall:
        edge = 0
        for width in row[:-1]:
            edge += width
            joints[edge] += 1
    return len(wall) - max(joints.values(), default=0)


def count_pairs_divisible_sum(nums, k):
    seen = Counter()
    total = 0
    for x in nums:
        r = x % k
        total += seen[(k - r) % k]
        seen[r] += 1
    return total


def count_equal_row_column(grid):
    rows = Counter(tuple(row) for row in grid)
    return sum(rows[tuple(col)] for col in zip(*grid))


def count_boomerangs(points):
    total = 0
    for ax, ay in points:
        dist = Counter()
        for bx, by in points:
            dist[(ax - bx) ** 2 + (ay - by) ** 2] += 1
        for d, c in dist.items():
            if d != 0:
                total += c * (c - 1)
    return total


def count_near_even_substrings(s):
    seen = Counter()
    seen[0] = 1
    mask = 0
    total = 0
    for ch in s:
        mask ^= 1 << (ord(ch) - 97)
        total += seen[mask]
        for b in range(26):
            total += seen[mask ^ (1 << b)]
        seen[mask] += 1
    return total


def find_concatenation_starts(s, words):
    size = len(words[0])
    count = len(words)
    need = Counter(words)
    out = []
    for offset in range(size):
        left = offset
        have = Counter()
        used = 0
        for right in range(offset, len(s) - size + 1, size):
            word = s[right:right + size]
            if word not in need:
                have.clear()
                used = 0
                left = right + size
                continue
            have[word] += 1
            used += 1
            while have[word] > need[word]:
                have[s[left:left + size]] -= 1
                used -= 1
                left += size
            if used == count:
                out.append(left)
    return sorted(out)


# ------------------------------------------------------------- Binary Search
def first_failing_build(broken):
    lo, hi = 0, len(broken)
    while lo < hi:
        mid = (lo + hi) // 2
        if broken[mid]:
            hi = mid
        else:
            lo = mid + 1
    return lo if lo < len(broken) else -1


def full_staircase_rows(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * (mid + 1) // 2 <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo


def next_letter_after(letters, target):
    lo, hi = 0, len(letters)
    while lo < hi:
        mid = (lo + hi) // 2
        if letters[mid] > target:
            hi = mid
        else:
            lo = mid + 1
    return letters[lo] if lo < len(letters) else letters[0]


def lone_in_sorted_pairs(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid % 2 == 1:
            mid -= 1
        if nums[mid] == nums[mid + 1]:
            lo = mid + 2
        else:
            hi = mid
    return nums[lo]


def kth_missing_positive(nums, k):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] - (mid + 1) < k:
            lo = mid + 1
        else:
            hi = mid
    return lo + k


def k_nearest_values(nums, k, x):
    lo, hi = 0, len(nums) - k
    while lo < hi:
        mid = (lo + hi) // 2
        if x - nums[mid] > nums[mid + k] - x:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo:lo + k]


def min_heater_radius(houses, heaters):
    heaters = sorted(heaters)
    radius = 0
    for h in houses:
        i = bisect_left(heaters, h)
        best = None
        if i < len(heaters):
            best = heaters[i] - h
        if i > 0 and (best is None or h - heaters[i - 1] < best):
            best = h - heaters[i - 1]
        radius = max(radius, best)
    return radius


def kth_in_times_table(m, n, k):
    lo, hi = 1, m * n
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(min(mid // row, n) for row in range(1, m + 1)) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo


def max_shared_runtime(n, batteries):
    lo, hi = 0, sum(batteries) // n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if sum(min(b, mid) for b in batteries) >= n * mid:
            lo = mid
        else:
            hi = mid - 1
    return lo


# ------------------------------------------------------------ Sliding Window
def count_windows_meeting_average(nums, k, threshold):
    if k > len(nums):
        return 0
    need = k * threshold
    window = sum(nums[:k])
    total = 1 if window >= need else 0
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        if window >= need:
            total += 1
    return total


def count_distinct_windows(s, k):
    counts = {}
    repeated = 0
    total = 0
    for i, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        if counts[ch] == 2:
            repeated += 1
        if i >= k:
            old = s[i - k]
            counts[old] -= 1
            if counts[old] == 1:
                repeated -= 1
        if i >= k - 1 and repeated == 0:
            total += 1
    return total


def circular_window_sums(nums, k):
    n = len(nums)
    if k == 0:
        return [0] * n
    size = abs(k)
    # window for index 0 starts at offset 1 (k > 0) or at offset -size (k < 0)
    start = 1 if k > 0 else n - size
    window = sum(nums[(start + j) % n] for j in range(size))
    out = []
    for i in range(n):
        out.append(window)
        window += nums[(start + i + size) % n] - nums[(start + i) % n]
    return out


def best_ends_total(cards, k):
    n = len(cards)
    current = sum(cards[:k])
    best = current
    for taken_right in range(1, k + 1):
        current += cards[n - taken_right] - cards[k - taken_right]
        best = max(best, current)
    return best


def max_satisfied_customers(customers, grumpy, minutes):
    base = sum(c for c, g in zip(customers, grumpy) if g == 0)
    window = 0
    best = 0
    for i, c in enumerate(customers):
        if grumpy[i] == 1:
            window += c
        if i >= minutes and grumpy[i - minutes] == 1:
            window -= customers[i - minutes]
        best = max(best, window)
    return base + best


def longest_steady_stretch(nums, limit):
    from collections import deque
    highs, lows = deque(), deque()
    left = 0
    best = 0
    for right, x in enumerate(nums):
        while highs and nums[highs[-1]] <= x:
            highs.pop()
        highs.append(right)
        while lows and nums[lows[-1]] >= x:
            lows.pop()
        lows.append(right)
        while nums[highs[0]] - nums[lows[0]] > limit:
            left += 1
            if highs[0] < left:
                highs.popleft()
            if lows[0] < left:
                lows.popleft()
        best = max(best, right - left + 1)
    return best


def max_frequency_after_bumps(nums, k):
    nums = sorted(nums)
    left = 0
    window = 0
    best = 0
    for right, x in enumerate(nums):
        window += x
        while x * (right - left + 1) - window > k:
            window -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best


def smallest_covering_range(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists)]
    heapq.heapify(heap)
    high = max(lst[0] for lst in lists)
    best = [heap[0][0], high]
    while True:
        low, i, j = heapq.heappop(heap)
        if high - low < best[1] - best[0]:
            best = [low, high]
        if j + 1 == len(lists[i]):
            return best
        nxt = lists[i][j + 1]
        high = max(high, nxt)
        heapq.heappush(heap, (nxt, i, j + 1))


def min_k_bit_flips(bits, k):
    n = len(bits)
    ends = [0] * (n + 1)
    active = 0
    moves = 0
    for i in range(n):
        active -= ends[i]
        if (bits[i] + active) % 2 == 0:
            if i + k > n:
                return -1
            moves += 1
            active += 1
            ends[i + k] += 1
    return moves
