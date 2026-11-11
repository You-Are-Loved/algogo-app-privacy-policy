# Reference solutions for src/data/more/algos-a3.ts (problems 407-436).
# Checked by scripts/verify-algos.ts.


# ----------------------------------------------------------------- Trie

def _trie_insert(root, word):
    node = root
    for ch in word:
        node = node.setdefault(ch, {})
    return node


# 407
def count_prefix_words(words, text):
    root = {}
    for w in words:
        end = _trie_insert(root, w)
        end['#'] = end.get('#', 0) + 1
    total = 0
    node = root
    for ch in text:
        if ch not in node:
            break
        node = node[ch]
        total += node.get('#', 0)
    return total


# 408
def is_prefix_free(codes):
    root = {}
    for code in codes:
        node = root
        for ch in code:
            if '#' in node:
                return False  # an earlier code is a prefix of this one
            node = node.setdefault(ch, {})
        if node:
            return False  # this code is a prefix of (or equal to) an earlier one
        node['#'] = True
    return True


# 409
def count_trie_nodes(words):
    root = {}
    count = 0
    for w in words:
        node = root
        for ch in w:
            if ch not in node:
                node[ch] = {}
                count += 1
            node = node[ch]
    return count


# 410
def shortest_unique_prefixes(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {'#': 0})
            node['#'] += 1
    out = []
    for w in words:
        node = root
        answer = w
        for i, ch in enumerate(w):
            node = node[ch]
            if node['#'] == 1:
                answer = w[:i + 1]
                break
        out.append(answer)
    return out


# 411
def prefix_score_sums(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {'#': 0})
            node['#'] += 1
    out = []
    for w in words:
        node = root
        total = 0
        for ch in w:
            node = node[ch]
            total += node['#']
        out.append(total)
    return out


# 412
def longest_shared_prefix(words):
    root = {}
    best = 0
    for w in words:
        node = root
        depth = 0
        matching = True
        for ch in w:
            if matching and ch in node:
                depth += 1
            else:
                matching = False
            node = node.setdefault(ch, {})
        best = max(best, depth)
    return best


# 413
def remove_nested_folders(paths):
    root = {}
    for p in paths:
        node = root
        for part in p.split('/')[1:]:
            node = node.setdefault(part, {})
        node['#'] = True
    out = []
    for p in paths:
        node = root
        parts = p.split('/')[1:]
        nested = False
        for part in parts[:-1]:
            node = node[part]
            if '#' in node:
                nested = True
                break
        if not nested:
            out.append(p)
    return out


# 414
def one_letter_off(dictionary, queries):
    root = {}
    for w in dictionary:
        _trie_insert(root, w)['#'] = True

    def search(node, word, i, changed):
        if i == len(word):
            return changed and '#' in node
        for ch, child in node.items():
            if ch == '#':
                continue
            if ch == word[i]:
                if search(child, word, i + 1, changed):
                    return True
            elif not changed:
                if search(child, word, i + 1, True):
                    return True
        return False

    return [search(root, q, 0, False) for q in queries]


# 415
def compound_words(words):
    root = {}
    for w in words:
        _trie_insert(root, w)['#'] = True

    def can_build(word):
        n = len(word)
        # reach[i]: word[:i] can be written as one or more list words
        reach = [False] * (n + 1)
        reach[0] = True
        for i in range(n):
            if not reach[i]:
                continue
            node = root
            for j in range(i, n):
                if word[j] not in node:
                    break
                node = node[word[j]]
                if '#' in node and not (i == 0 and j == n - 1):
                    reach[j + 1] = True
        return reach[n]

    return [w for w in words if can_build(w)]


# 416
def prefix_suffix_lookup(words, queries):
    # Trie over "suffix{word" keys: every suffix of the word, a separator, then the word.
    root = {}
    for idx, w in enumerate(words):
        for s in range(len(w)):
            node = root
            for ch in w[s:] + '{' + w:
                node = node.setdefault(ch, {})
                node['#'] = idx
    out = []
    for prefix, suffix in queries:
        node = root
        for ch in suffix + '{' + prefix:
            node = node.get(ch)
            if node is None:
                break
        out.append(-1 if node is None else node['#'])
    return out


# --------------------------------------------------------- Backtracking

# 417
def no_adjacent_ones(n):
    out = []

    def go(cur):
        if len(cur) == n:
            out.append(''.join(cur))
            return
        cur.append('0')
        go(cur)
        cur.pop()
        if not cur or cur[-1] != '1':
            cur.append('1')
            go(cur)
            cur.pop()

    go([])
    return out


# 418
def letter_case_variants(s):
    out = []

    def go(i, cur):
        if i == len(s):
            out.append(''.join(cur))
            return
        if s[i].isalpha():
            for ch in (s[i].lower(), s[i].upper()):
                cur.append(ch)
                go(i + 1, cur)
                cur.pop()
        else:
            cur.append(s[i])
            go(i + 1, cur)
            cur.pop()

    go(0, [])
    return out


# 419
def step_sequences(n):
    out = []

    def go(left, cur):
        if left == 0:
            out.append(cur[:])
            return
        for step in (1, 2):
            if step <= left:
                cur.append(step)
                go(left - step, cur)
                cur.pop()

    go(n, [])
    return out


# 420
def distinct_subsets(nums):
    nums = sorted(nums)
    out = []

    def go(start, cur):
        out.append(cur[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            cur.append(nums[i])
            go(i + 1, cur)
            cur.pop()

    go(0, [])
    return out


# 421
def single_use_combinations(candidates, target):
    nums = sorted(candidates)
    out = []

    def go(start, left, cur):
        if left == 0:
            out.append(cur[:])
            return
        for i in range(start, len(nums)):
            if nums[i] > left:
                break
            if i > start and nums[i] == nums[i - 1]:
                continue
            cur.append(nums[i])
            go(i + 1, left - nums[i], cur)
            cur.pop()

    go(0, target, [])
    return out


# 422
def digit_combos(k, total):
    out = []

    def go(start, left, cur):
        if len(cur) == k:
            if left == 0:
                out.append(cur[:])
            return
        for d in range(start, 10):
            if d > left:
                break
            cur.append(d)
            go(d + 1, left - d, cur)
            cur.pop()

    go(1, total, [])
    return out


# 423
def max_distinct_pieces(s):
    best = 0
    used = set()

    def go(i):
        nonlocal best
        if len(used) + (len(s) - i) <= best:
            return
        if i == len(s):
            best = len(used)
            return
        for j in range(i + 1, len(s) + 1):
            piece = s[i:j]
            if piece not in used:
                used.add(piece)
                go(j)
                used.remove(piece)

    go(0)
    return best


# 424
def max_gem_haul(grid):
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    best = 0

    def go(r, c, total):
        nonlocal best
        value = grid[r][c]
        total += value
        best = max(best, total)
        grid[r][c] = 0
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] > 0:
                go(nr, nc, total)
        grid[r][c] = value

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] > 0:
                go(r, c, 0)
    return best


# 425
def operator_expressions(digits, target):
    out = []
    n = len(digits)

    def go(i, expr, value, last):
        if i == n:
            if value == target:
                out.append(expr)
            return
        for j in range(i + 1, n + 1):
            piece = digits[i:j]
            if len(piece) > 1 and piece[0] == '0':
                break
            num = int(piece)
            if i == 0:
                go(j, piece, num, num)
            else:
                go(j, expr + '+' + piece, value + num, num)
                go(j, expr + '-' + piece, value - num, -num)
                go(j, expr + '*' + piece, value - last + last * num, last * num)

    go(0, '', 0, 0)
    return out


# 426
def matches_pattern(pattern, s):
    mapping = {}
    used = set()

    def go(i, j):
        if i == len(pattern):
            return j == len(s)
        ch = pattern[i]
        if ch in mapping:
            piece = mapping[ch]
            if s.startswith(piece, j):
                return go(i + 1, j + len(piece))
            return False
        # leave at least one character for every remaining pattern letter
        for end in range(j + 1, len(s) - (len(pattern) - i - 1) + 1):
            piece = s[j:end]
            if piece in used:
                continue
            mapping[ch] = piece
            used.add(piece)
            if go(i + 1, end):
                return True
            del mapping[ch]
            used.remove(piece)
        return False

    return go(0, 0)


# ----------------------------------------------------------- Prefix Sum

# 427
def vowel_range_counts(s, queries):
    pre = [0]
    for ch in s:
        pre.append(pre[-1] + (ch in 'aeiou'))
    return [pre[r + 1] - pre[l] for l, r in queries]


# 428
def savings_goal_day(deposits, goal):
    total = 0
    for day, amount in enumerate(deposits, 1):
        total += amount
        if total >= goal:
            return day
    return -1


# 429
def range_xor_queries(nums, queries):
    pre = [0]
    for x in nums:
        pre.append(pre[-1] ^ x)
    return [pre[r + 1] ^ pre[l] for l, r in queries]


# 430
def count_odd_sum_subarrays(nums):
    seen = [1, 0]  # prefixes with even / odd sum so far (the empty prefix is even)
    parity = 0
    count = 0
    for x in nums:
        parity = (parity + x) % 2
        count += seen[1 - parity]
        seen[parity] += 1
    return count


# 431
def count_three_way_splits(nums):
    n = len(nums)
    total = sum(nums)
    if n < 3 or total % 3 != 0:
        return 0
    third = total // 3
    count = 0
    firsts = 0  # first cuts seen so far whose left part sums to `third`
    running = 0
    for j in range(1, n):
        # the second cut sits just before index j; first cuts must be before it
        running += nums[j - 1]
        if j >= 2 and running == 2 * third:
            count += firsts
        if running == third:
            firsts += 1
    return count


# 432
def paint_rectangles(rows, cols, updates):
    diff = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r1, c1, r2, c2, v in updates:
        diff[r1][c1] += v
        diff[r1][c2 + 1] -= v
        diff[r2 + 1][c1] -= v
        diff[r2 + 1][c2 + 1] += v
    grid = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            value = diff[r][c]
            if r:
                value += grid[r - 1][c]
            if c:
                value += grid[r][c - 1]
            if r and c:
                value -= grid[r - 1][c - 1]
            grid[r][c] = value
    return grid


# 433
def best_two_windows(nums, a, b):
    n = len(nums)
    pre = [0]
    for x in nums:
        pre.append(pre[-1] + x)

    def solve(first, second):
        # a window of length `first` entirely before a window of length `second`
        best = None
        best_first = None
        for start in range(first, n - second + 1):
            left = pre[start] - pre[start - first]
            if best_first is None or left > best_first:
                best_first = left
            cand = best_first + pre[start + second] - pre[start]
            if best is None or cand > best:
                best = cand
        return best

    return max(solve(a, b), solve(b, a))


# 434
def books_between_bookends(shelf, queries):
    n = len(shelf)
    pre = [0]
    for ch in shelf:
        pre.append(pre[-1] + (ch == '*'))
    left = [-1] * n   # nearest bookend at or before i
    right = [-1] * n  # nearest bookend at or after i
    last = -1
    for i in range(n):
        if shelf[i] == '|':
            last = i
        left[i] = last
    last = -1
    for i in range(n - 1, -1, -1):
        if shelf[i] == '|':
            last = i
        right[i] = last
    out = []
    for l, r in queries:
        a, b = right[l], left[r]
        if a == -1 or b == -1 or a >= b:
            out.append(0)
        else:
            out.append(pre[b] - pre[a])
    return out


# 435
def best_three_windows(nums, k):
    n = len(nums)
    pre = [0]
    for x in nums:
        pre.append(pre[-1] + x)
    m = n - k + 1
    win = [pre[i + k] - pre[i] for i in range(m)]
    # left[i]: start of the best window among starts 0..i (earliest on ties)
    left = [0] * m
    for i in range(1, m):
        left[i] = i if win[i] > win[left[i - 1]] else left[i - 1]
    # right[i]: start of the best window among starts i..m-1 (earliest on ties)
    right = [m - 1] * m
    for i in range(m - 2, -1, -1):
        right[i] = i if win[i] >= win[right[i + 1]] else right[i + 1]
    best = None
    answer = None
    for mid in range(k, m - k):
        a, c = left[mid - k], right[mid + k]
        total = win[a] + win[mid] + win[c]
        if best is None or total > best:
            best = total
            answer = [a, mid, c]
    return answer


# 436
def count_target_submatrices(matrix, target):
    rows = len(matrix)
    cols = len(matrix[0]) if rows else 0
    count = 0
    for top in range(rows):
        col_sum = [0] * cols
        for bottom in range(top, rows):
            for c in range(cols):
                col_sum[c] += matrix[bottom][c]
            seen = {0: 1}
            running = 0
            for c in range(cols):
                running += col_sum[c]
                count += seen.get(running - target, 0)
                seen[running] = seen.get(running, 0) + 1
    return count
