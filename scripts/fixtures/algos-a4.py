# Reference solutions for src/data/more/algos-a4.ts (problems 437-465).
import math


# ---------------------------------------------------------------- Binary
def bit_flip_distance(a, b):
    return bin(a ^ b).count('1')


def has_alternating_bits(n):
    x = n ^ (n >> 1)
    return x & (x + 1) == 0


def widest_one_gap(n):
    best = 0
    last = -1
    pos = 0
    while n:
        if n & 1:
            if last >= 0:
                best = max(best, pos - last)
            last = pos
        n >>= 1
        pos += 1
    return best


def range_and_all(lo, hi):
    shift = 0
    while lo != hi:
        lo >>= 1
        hi >>= 1
        shift += 1
    return lo << shift


def subset_xor_total(nums):
    if not nums:
        return 0
    seen = 0
    for v in nums:
        seen |= v
    return seen << (len(nums) - 1)


def min_flips_for_or(a, b, c):
    flips = 0
    while a or b or c:
        x, y, z = a & 1, b & 1, c & 1
        if z:
            if not (x or y):
                flips += 1
        else:
            flips += x + y
        a >>= 1
        b >>= 1
        c >>= 1
    return flips


def next_same_weight(n):
    low = n & -n
    ripple = n + low
    ones = ((n ^ ripple) >> 2) // low
    return ripple | ones


def total_ones_upto(n):
    total = 0
    bit = 1
    while bit <= n:
        cycle = bit * 2
        total += (n + 1) // cycle * bit + max(0, (n + 1) % cycle - bit)
        bit = cycle
    return total


def max_subset_xor(nums):
    basis = []
    for v in nums:
        for b in basis:
            v = min(v, v ^ b)
        if v:
            basis.append(v)
            basis.sort(reverse=True)
    best = 0
    for b in basis:
        best = max(best, best ^ b)
    return best


# ------------------------------------------------------------------ Math
def reduce_fraction(numerator, denominator):
    g = math.gcd(numerator, denominator)
    n, d = numerator // g, denominator // g
    if d < 0:
        n, d = -n, -d
    return [n, d]


def divisor_count(n):
    count = 0
    d = 1
    while d * d <= n:
        if n % d == 0:
            count += 1 if d * d == n else 2
        d += 1
    return count


def to_base_string(n, base):
    if n == 0:
        return '0'
    digits = '0123456789abcdefghijklmnopqrstuvwxyz'
    neg = n < 0
    n = abs(n)
    out = []
    while n:
        out.append(digits[n % base])
        n //= base
    if neg:
        out.append('-')
    return ''.join(reversed(out))


def prime_factor_pairs(n):
    out = []
    p = 2
    while p * p <= n:
        if n % p == 0:
            e = 0
            while n % p == 0:
                n //= p
                e += 1
            out.append([p, e])
        p += 1
    if n > 1:
        out.append([n, 1])
    return out


def nth_sequence_digit(n):
    length = 1
    count = 9
    start = 1
    while n > length * count:
        n -= length * count
        length += 1
        count *= 10
        start *= 10
    num = start + (n - 1) // length
    return int(str(num)[(n - 1) % length])


def mod_inverse(a, m):
    old_r, r = a % m, m
    old_x, x = 1, 0
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_x, x = x, old_x - q * x
    if old_r != 1:
        return -1
    return old_x % m


def count_consecutive_runs(n):
    count = 0
    length = 1
    while length * (length - 1) // 2 < n:
        if (n - length * (length - 1) // 2) % length == 0:
            count += 1
        length += 1
    return count


def kth_arrangement(n, k):
    pool = list(range(1, n + 1))
    k -= 1
    out = []
    for i in range(n, 0, -1):
        block = math.factorial(i - 1)
        idx, k = divmod(k, block)
        out.append(pool.pop(idx))
    return out


# ---------------------------------------------------------- Two Pointers
def is_scattered_within(pattern, text):
    i = 0
    for ch in text:
        if i < len(pattern) and pattern[i] == ch:
            i += 1
    return i == len(pattern)


def reverse_vowels_only(s):
    vowels = set('aeiouAEIOU')
    chars = list(s)
    i, j = 0, len(chars) - 1
    while i < j:
        if chars[i] not in vowels:
            i += 1
        elif chars[j] not in vowels:
            j -= 1
        else:
            chars[i], chars[j] = chars[j], chars[i]
            i += 1
            j -= 1
    return ''.join(chars)


def sorted_common_values(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            out.append(a[i])
            i += 1
            j += 1
        elif a[i] < b[j]:
            i += 1
        else:
            j += 1
    return out


def near_palindrome(s):
    def is_pal(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True

    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return is_pal(i + 1, j) or is_pal(i, j - 1)
        i += 1
        j -= 1
    return True


def count_pairs_with_gap(nums, k):
    n = len(nums)
    total = 0
    lo = hi = 0  # nums[lo:hi] == nums[j] - k
    for j in range(n):
        want = nums[j] - k
        while lo < n and nums[lo] < want:
            lo += 1
        if hi < lo:
            hi = lo
        while hi < n and nums[hi] <= want:
            hi += 1
        total += hi - lo
    return total


def shortest_unsorted_span(nums):
    n = len(nums)
    end = -1
    highest = nums[0]
    for i in range(n):
        if nums[i] < highest:
            end = i
        else:
            highest = nums[i]
    start = 0
    lowest = nums[-1]
    for i in range(n - 1, -1, -1):
        if nums[i] > lowest:
            start = i
        else:
            lowest = nums[i]
    return 0 if end == -1 else end - start + 1


def count_triangles(sides):
    s = sorted(sides)
    total = 0
    for k in range(len(s) - 1, 1, -1):
        i, j = 0, k - 1
        while i < j:
            if s[i] + s[j] > s[k]:
                total += j - i
                j -= 1
            else:
                i += 1
    return total


def longest_word_by_deleting(s, words):
    best = ''
    for w in words:
        i = 0
        for ch in s:
            if i < len(w) and w[i] == ch:
                i += 1
        if i == len(w):
            if len(w) > len(best) or (len(w) == len(best) and w < best):
                best = w
    return best


def can_slide_into(start, goal):
    n = len(start)
    i = j = 0
    while True:
        while i < n and start[i] == '.':
            i += 1
        while j < n and goal[j] == '.':
            j += 1
        if i == n or j == n:
            return i == n and j == n
        if start[i] != goal[j]:
            return False
        if start[i] == 'L' and j > i:
            return False
        if start[i] == 'R' and j < i:
            return False
        i += 1
        j += 1


def longest_peak_span(heights):
    n = len(heights)
    best = 0
    i = 0
    while i + 1 < n:
        j = i
        while j + 1 < n and heights[j] < heights[j + 1]:
            j += 1
        peak = j
        while j + 1 < n and heights[j] > heights[j + 1]:
            j += 1
        if peak > i and j > peak:
            best = max(best, j - i + 1)
        i = j if j > i else i + 1
    return best


def shortest_window_subsequence(text, pattern):
    n, m = len(text), len(pattern)
    best = ''
    i = 0
    j = 0
    while i < n:
        if text[i] == pattern[j]:
            j += 1
            if j == m:
                end = i
                j -= 1
                while True:
                    if text[i] == pattern[j]:
                        j -= 1
                        if j < 0:
                            break
                    i -= 1
                if not best or end - i + 1 < len(best):
                    best = text[i:end + 1]
                j = 0
        i += 1
    return best


def min_swaps_to_palindrome(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    if sum(v % 2 for v in counts.values()) > 1:
        return -1
    chars = list(s)
    swaps = 0
    i, j = 0, len(chars) - 1
    while i < j:
        k = j
        while chars[k] != chars[i]:
            k -= 1
        if k == i:
            chars[i], chars[i + 1] = chars[i + 1], chars[i]
            swaps += 1
            continue
        while k < j:
            chars[k], chars[k + 1] = chars[k + 1], chars[k]
            k += 1
            swaps += 1
        i += 1
        j -= 1
    return swaps
