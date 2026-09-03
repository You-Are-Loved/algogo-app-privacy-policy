// CS Fundamentals - Complexity Analysis
// Big-O, amortized cost, recurrences, and how to reason about performance in an interview

import { Category } from '../../types';

export const complexity: Category = {
  id: 'cs-complexity',
  name: 'Complexity Analysis',
  slug: 'cs-complexity',
  description: 'Big-O, amortized cost, recurrences, and how to reason about performance in an interview',
  icon: 'speedometer-outline',
  color: '#F59E0B',
  colorDark: '#D97706',

  learnContent: [
    {
      id: 'cs-cx-1',
      title: 'Big-O, Big-Omega, Big-Theta, and the Common Classes',
      content: `Asymptotic notation describes how a function grows as its input grows, ignoring constant factors and lower-order terms. Interviewers use it as shorthand, but they also check that you know exactly what it claims.

**The Three Bounds:**
- **O(g(n))** - upper bound: f grows no faster than g (times a constant) for large n
- **Ω(g(n))** - lower bound: f grows at least as fast as g
- **Θ(g(n))** - tight bound: f is both O(g) and Ω(g)

**A Common Misconception:**
Big-O is not "worst case" and Big-Ω is not "best case". They bound functions; worst/average/best case describe which input you are measuring. Binary search has worst-case cost Θ(log n) and best-case cost Θ(1). Saying "binary search is O(n)" is technically true but useless; interviewers expect the tight bound.

**Simplification Rules:**
- Drop constants: 3n + 40 → O(n)
- Drop lower-order terms: n² + n log n → O(n²)
- Sequential steps add: O(n) + O(n²) → O(n²)
- Nested steps multiply: an O(n) loop doing O(log n) work → O(n log n)
- Log bases do not matter: log₂ n and log₁₀ n differ by a constant
- Keep separate variables separate: O(V + E), O(n·m), O(n log k)

**The Ladder, With Intuition at n = 1,000,000:**
- O(1): constant - array index, hash lookup, arithmetic
- O(log n): ~20 - binary search, balanced tree ops, halving each step
- O(√n): ~1,000 - trial division, some decomposition tricks
- O(n): 10⁶ - one pass; scanning input at all costs this much
- O(n log n): ~2 × 10⁷ - comparison sorting, divide and conquer with linear merge
- O(n²): 10¹² - nested loops over the same input; infeasible past ~10⁴-10⁵
- O(2ⁿ): all subsets; feasible to about n ≈ 25
- O(n!): all permutations; feasible to about n ≈ 11

**Lower Bounds You Should Know:**
- Comparison sorting: Ω(n log n) (decision tree with n! leaves needs log₂(n!) ≈ n log n depth)
- Reading all input: Ω(n) - you cannot answer "is x present?" in an unsorted array faster than n
- Searching a sorted array with comparisons: Ω(log n)`,
      codeExample: `import bisect

def first(xs):                 # O(1): fixed work regardless of n
    return xs[0]

def contains(xs, target):      # O(n): worst case scans everything
    for x in xs:
        if x == target:
            return True
    return False

def sorted_contains(xs, t):    # O(log n): halves the range each step
    i = bisect.bisect_left(xs, t)
    return i < len(xs) and xs[i] == t

def has_duplicate(xs):         # O(n^2): nested loops over the same input
    for i in range(len(xs)):
        for j in range(i + 1, len(xs)):
            if xs[i] == xs[j]:
                return True
    return False

def has_duplicate_fast(xs):    # O(n) time, O(n) extra space
    return len(set(xs)) != len(xs)

def merge_all(lists):          # O(N log k): N total items, k lists
    import heapq
    return list(heapq.merge(*lists))

def subsets(xs):               # O(2^n * n): 2^n subsets, each copied
    out = [[]]
    for x in xs:
        out += [s + [x] for s in out]
    return out

# Dropping terms: 3n^2 + 50n + 7 is Theta(n^2).
# Two loops in sequence: O(n) + O(m) = O(n + m), NOT O(n*m).
# Two loops nested: O(n) * O(m) = O(n*m).`
    },
    {
      id: 'cs-cx-2',
      title: 'Analyzing Loops, Library Calls, and Recursion',
      content: `Most complexity mistakes in interviews come from mis-counting iterations or forgetting the cost hidden inside a library call.

**Loop Patterns:**
- Counter goes 0 to n by +1: n iterations, O(n)
- Counter doubles (i *= 2) or halves each time: O(log n) iterations
- Counter goes while i × i < n: O(√n) iterations
- Nested loop where the inner runs \`i\` times: 0 + 1 + ... + (n-1) = n(n-1)/2 → O(n²). The triangle does not save you from quadratic.
- Nested loop with an inner O(log n) step (binary search per element): O(n log n)
- Two independent inputs: an n-loop inside an m-loop is O(n·m), never O(n²) unless n = m

**Hidden Costs:**
- \`x in list\` is O(n); \`x in set\` is expected O(1)
- String concatenation in a loop (\`s += c\`) copies the whole string each time: O(n²) total. Collect pieces and join once.
- \`list.insert(0, x)\`, \`list.pop(0)\`, \`del list[i]\`: O(n)
- Slicing \`a[i:j]\` copies: O(j - i). A recursive function that slices its input on every call often has an extra factor of n.
- \`sorted()\`, \`.sort()\`: O(n log n). Calling sort inside a loop is a classic accidental O(n² log n).
- \`min\`/\`max\`/\`sum\` over a collection: O(n) each

**Recursion: Count Calls × Work per Call:**
- Naive Fibonacci: two calls per level, depth n → about φⁿ ≈ 1.6ⁿ calls, O(2ⁿ) as an upper bound
- Memoized Fibonacci: each of n states computed once, O(1) work each → O(n)
- Generating all subsets: 2ⁿ leaves; if each leaf copies a list of length up to n, O(2ⁿ · n)
- Generating all permutations: n! leaves, O(n) to copy each → O(n · n!)
- General backtracking: branching factor^depth, times the per-node work
- Tree traversal: each node visited once, O(1) work → O(n) regardless of shape

**Early Termination and Average Case:**
A loop that may \`return\` early has a best case, but state the worst case unless the interviewer asks for expected cost. If you claim an average case, say what distribution you are assuming.`,
      codeExample: `def doubling(n):                # O(log n): i takes values 1,2,4,...,n
    i, steps = 1, 0
    while i < n:
        i *= 2
        steps += 1
    return steps

def triangle(n):                # O(n^2): 0+1+2+...+(n-1) = n(n-1)/2
    count = 0
    for i in range(n):
        for j in range(i):
            count += 1
    return count

def sqrt_loop(n):               # O(sqrt n): stops when i*i >= n
    i = 0
    while i * i < n:
        i += 1
    return i

def build_string_slow(chars):   # O(n^2): each += copies the prefix
    s = ""
    for c in chars:
        s += c
    return s

def build_string_fast(chars):   # O(n): one allocation at the end
    return "".join(chars)

def fib_naive(n):               # O(phi^n) calls, depth n
    return n if n < 2 else fib_naive(n - 1) + fib_naive(n - 2)

def fib_memo(n, memo={}):       # O(n): each state solved once
    if n < 2:
        return n
    if n not in memo:
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

def permutations(xs):           # O(n * n!): n! outputs, O(n) copy each
    if len(xs) <= 1:
        return [list(xs)]
    out = []
    for i, x in enumerate(xs):
        for rest in permutations(xs[:i] + xs[i + 1:]):
            out.append([x] + rest)
    return out

def sum_of_sorted_windows(xs, k):   # accidental O(n * k log k)
    total = 0
    for i in range(len(xs) - k + 1):
        window = sorted(xs[i:i + k])   # sort inside a loop!
        total += window[0]
    return total`
    },
    {
      id: 'cs-cx-3',
      title: 'Recurrences and the Master Theorem',
      content: `A recursive algorithm's cost is described by a recurrence: T(n) in terms of T(smaller). Solving it tells you the complexity. Interviewers expect the common ones from memory and the method for new ones.

**Write the Recurrence:**
- Count the subproblems (a), their size (n/b or n-1), and the non-recursive work per call (f(n))
- Merge sort: two halves plus a linear merge → T(n) = 2T(n/2) + n
- Binary search: one half plus constant work → T(n) = T(n/2) + 1

**The Recursion Tree Method:**
- Draw levels: level i has aⁱ nodes, each of size n/bⁱ, doing f(n/bⁱ) work
- Sum the work per level, then sum over the log_b n levels
- For merge sort every level totals n, there are log₂ n levels → Θ(n log n)

**Master Theorem for T(n) = a·T(n/b) + f(n):**
Compare f(n) with n^(log_b a), the total work at the leaves.
- **Case 1 - leaves dominate:** f(n) grows polynomially slower than n^(log_b a) → T(n) = Θ(n^(log_b a)). Example: T(n) = 2T(n/2) + 1 → Θ(n) (tree traversal, tournament)
- **Case 2 - balanced:** f(n) = Θ(n^(log_b a)) → T(n) = Θ(n^(log_b a) · log n). Example: merge sort, T(n) = 2T(n/2) + n → Θ(n log n)
- **Case 3 - root dominates:** f(n) grows polynomially faster than n^(log_b a) → T(n) = Θ(f(n)). Example: T(n) = 2T(n/2) + n² → Θ(n²)

**The Intuition:**
a = how many children, b = how much smaller. n^(log_b a) is the number of leaves. If splitting is cheap relative to the number of leaves, leaves dominate; if the root's own work already beats all the leaves combined, the root dominates; if they tie at every level, you pay one extra log factor.

**Recurrences to Know Cold:**
- T(n) = T(n/2) + 1 → Θ(log n) - binary search
- T(n) = T(n/2) + n → Θ(n) - quickselect (expected), the halves shrink geometrically
- T(n) = 2T(n/2) + n → Θ(n log n) - merge sort, quicksort on average
- T(n) = 2T(n/2) + 1 → Θ(n) - visit every node
- T(n) = 3T(n/2) + n → Θ(n^1.585) - Karatsuba multiplication
- T(n) = 7T(n/2) + n² → Θ(n^2.807) - Strassen matrix multiply
- T(n) = T(n-1) + n → Θ(n²) - quicksort worst case, selection sort
- T(n) = T(n-1) + 1 → Θ(n) - linear recursion
- T(n) = 2T(n-1) + 1 → Θ(2ⁿ) - Towers of Hanoi, brute-force subsets
- T(n) = T(n-1) + T(n-2) + 1 → Θ(φⁿ) - naive Fibonacci

**When the Master Theorem Doesn't Apply:**
Subtractive recurrences (n-1), unequal splits (T(n/3) + T(2n/3)), or f(n) that is not polynomially separated (n log n vs n). Fall back to the recursion tree or substitution. T(n) = T(n/3) + T(2n/3) + n still gives Θ(n log n): every level sums to n and the deepest path has log_{3/2} n levels.`,
      codeExample: `import math

def recursion_tree_total(a, b, f, n):
    """Sum work level by level for T(n) = a*T(n/b) + f(n), T(1) = 1.
    Useful to sanity-check a master-theorem answer numerically."""
    total, level, size, nodes = 0.0, 0, n, 1
    while size >= 1:
        total += nodes * f(size)     # nodes at this level x work each
        nodes *= a
        size /= b
        level += 1
    return total

n = 1 << 16                          # 65536

# Case 2 (merge sort): every level does n work, log n levels
print(recursion_tree_total(2, 2, lambda m: m, n) / (n * math.log2(n)))
# -> about 1.0: matches Theta(n log n)

# Case 1 (visit every node): leaves dominate
print(recursion_tree_total(2, 2, lambda m: 1, n) / n)
# -> about 2.0: Theta(n)

# Case 3 (quadratic work at the root): root dominates
print(recursion_tree_total(2, 2, lambda m: m * m, n) / (n * n))
# -> about 2.0: Theta(n^2)

# Karatsuba: 3 subproblems of half size, linear combine
print(math.log2(3))                  # 1.585 -> Theta(n^1.585)


def merge_sort(xs):                  # T(n) = 2T(n/2) + O(n)
    if len(xs) <= 1:
        return xs
    mid = len(xs) // 2
    left, right = merge_sort(xs[:mid]), merge_sort(xs[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):     # O(n) merge
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]


def hanoi(n, src="A", dst="C", via="B"):   # T(n) = 2T(n-1) + 1
    if n == 0:
        return 0
    moves = hanoi(n - 1, src, via, dst)
    moves += 1                           # move the largest disk
    moves += hanoi(n - 1, via, dst, src)
    return moves                         # 2^n - 1`
    },
    {
      id: 'cs-cx-4',
      title: 'Amortized Analysis',
      content: `Amortized analysis bounds the total cost of a sequence of operations, then divides by the number of operations. It lets an occasional expensive operation be "paid for" by many cheap ones.

**Amortized Is Not Average-Case:**
- Average-case assumes a probability distribution over inputs
- Amortized is a **worst-case** guarantee over any sequence of operations; no randomness involved
- A dynamic array append is amortized O(1) even for an adversary choosing the operations

**Three Methods (same answer, different bookkeeping):**
- **Aggregate:** compute the total cost of n operations directly and divide by n. For n appends to a doubling array: n writes plus 1 + 2 + 4 + ... + n < 2n copies → O(3n) / n = O(1)
- **Accounting:** charge each operation a fixed amortized price and bank the surplus as credit on the data. Charge 3 per append: 1 to write the element, 1 saved to copy itself at the next resize, 1 saved to copy one older element that has already spent its credit. The bank never goes negative, so 3 covers everything.
- **Potential:** define Φ(state) ≥ 0, with Φ(initial) = 0. Amortized cost = actual cost + ΔΦ. For the doubling array Φ = 2·size − capacity: a normal append costs 1 + 2 = 3; a resize from n to 2n costs n + 1 actual work but drops Φ by n − 2, so it also comes to about 3.

**Classic Amortized Structures:**
- **Dynamic array / hash table resizing:** O(1) amortized insert
- **Binary counter increment:** a single increment can flip O(log n) bits, but over n increments bit 0 flips n times, bit 1 n/2 times, ... total < 2n → O(1) amortized
- **Two-stack queue:** each element moves from in-stack to out-stack at most once → O(1) amortized dequeue
- **Union-find:** union by rank alone gives O(log n) per operation worst case. Add path compression and any sequence of m operations costs O(m · α(n)), where α is the inverse Ackermann function - at most 4 for any n that fits in the universe, so effectively O(1) amortized
- **Splay trees:** O(log n) amortized per operation with no balance information stored, though a single access can be O(n)

**When Amortized Bounds Are Not Good Enough:**
A latency-sensitive system (game frame, trading engine, real-time control) cares about the single O(n) spike, not the average. Solutions: pre-size the container, or **de-amortize** by doing a little of the expensive work on every operation (incremental rehashing, as Redis and Go maps do).

**Interview Framing:**
When you say "amortized", be ready to name which operation is expensive, how often it can occur, and why the cheap operations pay for it.`,
      codeExample: `class UnionFind:
    """Union by rank + path compression: O(alpha(n)) amortized per op."""

    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:       # path compression: every
            self.parent[x], x = root, self.parent[x]   # node -> root
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:   # attach shorter under taller
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True


def increment(bits):
    """Binary counter as a list of bits, LSB first. A single call may
    flip len(bits) bits, but n calls flip fewer than 2n bits total."""
    flips = 0
    i = 0
    while i < len(bits) and bits[i] == 1:
        bits[i] = 0                          # carry
        flips += 1
        i += 1
    if i < len(bits):
        bits[i] = 1
        flips += 1
    return flips


bits = [0] * 8
total = sum(increment(bits) for _ in range(200))
print(total / 200)        # ~2.0 flips per increment, not log n


# Aggregate view of a doubling array: copies during n appends
def total_copies(n):
    copies, cap = 0, 1
    for size in range(1, n + 1):
        if size > cap:
            copies += cap                    # copy everything once
            cap *= 2
    return copies

print(total_copies(1_000_000) / 1_000_000)   # ~1.0 -> O(1) amortized`
    },
    {
      id: 'cs-cx-5',
      title: 'Space Complexity and the Recursion Stack',
      content: `Space complexity counts memory in addition to the input, as a function of n. Interviewers ask about it as often as time, and recursion is where candidates most often get it wrong.

**Auxiliary vs Total Space:**
- Total space includes the input; auxiliary (extra) space excludes it
- "In place" usually means O(1) auxiliary space, though O(log n) for a recursion stack is commonly accepted
- When asked for space complexity, say which one you mean

**The Recursion Stack Counts:**
- Every active call holds a stack frame (arguments, locals, return address). Maximum depth of the call tree = stack space.
- Naive Fibonacci makes φⁿ calls but at most n are active at once → O(n) stack, not O(2ⁿ)
- Merge sort: O(n) for the merge buffer plus O(log n) stack → O(n) total auxiliary
- Quicksort: O(log n) stack on average, but O(n) on already-sorted input with a bad pivot. Fix: recurse on the smaller partition and loop on the larger one, which bounds the stack to O(log n) even in the worst case
- Recursive DFS on a path-shaped graph or a degenerate tree: depth O(V). Use an explicit stack to move that memory to the heap, or BFS, which needs O(width) instead
- Memoized recursion: space = number of distinct states stored, plus the stack

**Stack Limits Are Real:**
- Stacks are fixed-size: commonly 1-8 MB per thread. Python's interpreter also caps recursion at 1,000 frames by default
- Deep recursion on large inputs (100,000-element linked list, DFS on a big grid) crashes with a stack overflow even though the algorithm is "correct"
- Tail-call optimization would fix this, but Python, Java, and JavaScript engines do not guarantee it. C/C++ compilers do it at -O2 only when the call is genuinely in tail position. Convert to a loop when depth can be large.

**Reducing Space:**
- Rolling arrays in DP: if row i depends only on row i-1, keep two rows → O(m) instead of O(n·m)
- Reconstructing the answer often needs the full table; state the tradeoff
- Iterators and generators process streams in O(1) space instead of materializing lists
- Bit sets, packed booleans, and integer encodings for visited sets

**Time-Space Tradeoffs Interviewers Expect You to Offer:**
- Hash set for O(1) lookups at O(n) space (two-sum) vs sort-and-scan at O(1) extra space and O(n log n) time
- Prefix sums: O(n) precompute and space for O(1) range-sum queries
- Memoization: trade O(states) memory for exponential time savings`,
      codeExample: `import sys

def quicksort(xs, lo=0, hi=None):
    """Recurse on the smaller side, loop on the larger: O(log n) stack
    even when the pivot is terrible."""
    hi = len(xs) - 1 if hi is None else hi
    while lo < hi:
        p = partition(xs, lo, hi)
        if p - lo < hi - p:                  # left side is smaller
            quicksort(xs, lo, p - 1)         # recurse into it...
            lo = p + 1                       # ...and iterate the rest
        else:
            quicksort(xs, p + 1, hi)
            hi = p - 1

def partition(xs, lo, hi):
    pivot = xs[hi]
    i = lo
    for j in range(lo, hi):
        if xs[j] < pivot:
            xs[i], xs[j] = xs[j], xs[i]
            i += 1
    xs[i], xs[hi] = xs[hi], xs[i]
    return i


def dfs_recursive(graph, u, seen):           # stack depth up to O(V)
    seen.add(u)
    for v in graph[u]:
        if v not in seen:
            dfs_recursive(graph, v, seen)

def dfs_iterative(graph, start):             # explicit stack on the heap
    seen, stack = set(), [start]
    while stack:
        u = stack.pop()
        if u in seen:
            continue
        seen.add(u)
        stack.extend(v for v in graph[u] if v not in seen)
    return seen


# Path graph of 50,000 nodes: recursive DFS overflows the default
# Python limit (1000); the iterative version is fine.
path = {i: [i + 1] for i in range(50_000)}
path[50_000] = []
print(len(dfs_iterative(path, 0)))           # 50001
print(sys.getrecursionlimit())               # 1000


def edit_distance(a, b):
    """Rolling rows: O(min(n, m)) space instead of O(n * m)."""
    if len(a) < len(b):
        a, b = b, a
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1,
                           prev[j - 1] + (ca != cb)))
        prev = cur                           # only two rows live
    return prev[-1]

print(edit_distance("kitten", "sitting"))    # 3`
    },
    {
      id: 'cs-cx-6',
      title: 'Constant Factors, Caches, and Talking About Tradeoffs',
      content: `Big-O predicts how cost scales, not how fast code runs. Senior interviewers want to hear when the asymptotic answer is the wrong one to optimize for.

**Big-O Hides Constants, and Constants Matter:**
- log₂ n is at most ~40 for any input that fits in memory. O(n log n) vs O(n) is at most a 40× gap; a 40× constant-factor difference can erase it.
- Insertion sort beats merge sort and quicksort below ~16-32 elements, which is why every production sort switches to it for small partitions
- A linear scan of a small array beats a hash table lookup: no hashing, no pointer chase
- Fibonacci heaps give Dijkstra a better bound (O(E + V log V)) than binary heaps (O(E log V)) but lose in practice because of enormous constants and poor locality
- Some asymptotically superior algorithms (fast matrix multiplication below n^2.4) are never used: the crossover point exceeds any realistic input

**Memory Hierarchy Dominates:**
- L1 cache ~1 ns, L2 ~4 ns, L3 ~10-20 ns, RAM ~100 ns. One cache miss costs as much as hundreds of arithmetic operations.
- Sequential access wins: the hardware prefetcher streams contiguous data ahead of you. Random access over a large array, or chasing pointers through a linked structure, pays a miss per element.
- Row-major arrays: iterate rows in the outer loop and columns in the inner loop. Swapping the loop order for a large matrix can be 5-10× slower with identical Big-O.
- Structure of arrays (SoA) vs array of structures (AoS): if a loop touches one field, keep that field contiguous
- The same O(n) algorithm can be 10× faster on a vector of ints than on a list of boxed objects

**Branch Prediction:**
- Modern CPUs guess which way an \`if\` goes and speculate ahead; a mispredict costs ~15-20 cycles
- Summing elements greater than a threshold is far faster on a sorted array than an unsorted one: the branch becomes predictable
- Branchless formulations (arithmetic on booleans, conditional moves) and SIMD remove the problem entirely for hot loops

**Other Hidden Costs:**
- Allocation: every \`new\` or list append may hit the allocator; reuse buffers in hot paths
- Hashing long strings is O(length); the "O(1)" in hash map lookup assumes short keys
- System calls, locks, and I/O are thousands of cycles each; algorithmic cost may be irrelevant next to them

**How to Talk About Tradeoffs in an Interview:**
- State assumptions first: input size, whether data fits in memory, read-heavy vs write-heavy, whether preprocessing is allowed
- Give worst case and, if different, expected case; say which one matters for this use
- Name the bottleneck (CPU, memory, I/O, network) before optimizing
- Offer the classic trades: time for space (hashing, caching, precomputation), preprocessing for query speed (sorting, indexing), exactness for speed (approximation, sampling, Bloom filters)
- Finish with "and I would measure" - profiling beats intuition once constants are involved`,
      codeExample: `import time
import random

# 1. Loop order and cache locality: identical O(n^2), very different speed
N = 2000
matrix = [[1] * N for _ in range(N)]

t = time.perf_counter()
total = 0
for i in range(N):                # row-major: inner loop walks one row
    row = matrix[i]
    for j in range(N):
        total += row[j]
row_major = time.perf_counter() - t

t = time.perf_counter()
total = 0
for j in range(N):                # column-major: jumps between rows
    for i in range(N):
        total += matrix[i][j]
col_major = time.perf_counter() - t
print(f"row-major {row_major:.2f}s, column-major {col_major:.2f}s")


# 2. Branch prediction: same code, sorted input is faster in C/Java/JS.
#    (Python's interpreter overhead hides most of it, but the effect
#    is 2-5x in compiled code.)
data = [random.randint(0, 255) for _ in range(1_000_000)]

def count_big(xs):
    c = 0
    for x in xs:
        if x >= 128:               # unpredictable on random data
            c += 1
    return c

count_big(data)                    # random order: many mispredicts
count_big(sorted(data))            # predictable: false...false, true...true


# 3. Small n: linear scan beats hashing
small = list(range(8))
small_set = set(small)
# "7 in small" does 8 int compares with no hashing; "7 in small_set"
# hashes 7, probes, and compares. For n < ~10 the list often wins.


# 4. Branchless alternative: no jump for the CPU to mispredict
def count_big_branchless(xs):
    return sum(x >> 7 for x in xs)   # x >= 128 <=> bit 7 set (x < 256)`
    }
  ],

  visualizations: [
    {
      title: 'Growth Rate Ladder',
      description: 'Operations at n = 1,000,000 for each complexity class - one rung is a different world',
      nodes: [
        { id: 'c1', label: 'O(1)\n1 op', x: 60, y: 40, type: 'success' },
        { id: 'clog', label: 'O(log n)\n~20 ops', x: 190, y: 40, type: 'success' },
        { id: 'cn', label: 'O(n)\n10^6 ops', x: 320, y: 40, type: 'info' },
        { id: 'cnlog', label: 'O(n log n)\n~2 x 10^7', x: 320, y: 150, type: 'info' },
        { id: 'cn2', label: 'O(n^2)\n10^12: minutes', x: 190, y: 150, type: 'warning' },
        { id: 'c2n', label: 'O(2^n)\nfeasible n <= ~25', x: 60, y: 150, type: 'error' },
        { id: 'cfact', label: 'O(n!)\nfeasible n <= ~11', x: 60, y: 260, type: 'error' }
      ],
      edges: [
        { from: 'c1', to: 'clog', label: 'halving' },
        { from: 'clog', to: 'cn', label: 'one pass' },
        { from: 'cn', to: 'cnlog', label: 'sort' },
        { from: 'cnlog', to: 'cn2', label: 'nested loops' },
        { from: 'cn2', to: 'c2n', label: 'all subsets' },
        { from: 'c2n', to: 'cfact', label: 'all orderings' }
      ]
    },
    {
      title: 'Recursion Tree for T(n)=2T(n/2)+n',
      description: 'Every level does n total work; there are log n levels, so the sum is n log n',
      nodes: [
        { id: 'root', label: 'n\nlevel 0: n', x: 190, y: 40, type: 'primary' },
        { id: 'l1a', label: 'n/2', x: 100, y: 120, type: 'secondary' },
        { id: 'l1b', label: 'n/2\nlevel 1: n', x: 280, y: 120, type: 'secondary' },
        { id: 'l2a', label: 'n/4  n/4', x: 100, y: 200, type: 'secondary' },
        { id: 'l2b', label: 'n/4  n/4\nlevel 2: n', x: 280, y: 200, type: 'secondary' },
        { id: 'leaves', label: 'n leaves of size 1\nlevel log n: n', x: 100, y: 280, type: 'info' },
        { id: 'sum', label: 'log n levels x n\n= Theta(n log n)', x: 280, y: 280, type: 'success' }
      ],
      edges: [
        { from: 'root', to: 'l1a' },
        { from: 'root', to: 'l1b' },
        { from: 'l1a', to: 'l2a' },
        { from: 'l1b', to: 'l2b' },
        { from: 'l2a', to: 'leaves', label: '...' },
        { from: 'leaves', to: 'sum' }
      ]
    }
  ],

  flashcards: [
    { id: 'cs-cx-c1', front: 'What is the difference between Big-O, Big-Omega, and Big-Theta?', back: 'Big-O is an upper bound on growth, Big-Omega a lower bound, and Big-Theta a tight bound (both at once). They bound functions, not "cases": binary search\'s worst case is Theta(log n) and its best case is Theta(1).' },
    { id: 'cs-cx-c2', front: 'Is it correct to say "binary search is O(n)"? Why do interviewers dislike it?', back: 'Technically correct, because O is only an upper bound, but it is uselessly loose. Interviewers expect the tight bound Theta(log n); giving a loose one suggests you do not know the real cost.' },
    { id: 'cs-cx-c3', front: 'Why does the base of the logarithm not matter in Big-O?', back: 'Logs of different bases differ by a constant factor (log_a n = log_b n / log_b a), and constants are dropped. O(log2 n) and O(log10 n) are the same class.' },
    { id: 'cs-cx-c4', front: 'A function runs an O(n) loop followed by an O(m) loop over a different input. What is its complexity?', back: 'O(n + m). Sequential steps add; you cannot collapse them to O(n) or O(m) unless you know one dominates. Nested loops over the two inputs would be O(n * m).' },
    { id: 'cs-cx-c5', front: 'Why is comparison-based sorting Omega(n log n)?', back: 'A comparison sort must distinguish all n! input orderings. A decision tree with n! leaves has depth at least log2(n!), which is about n log n by Stirling\'s approximation. Non-comparison sorts (counting, radix) escape this by exploiting key structure.' },
    { id: 'cs-cx-c6', front: 'A loop runs while i < n and does i *= 2 each iteration. How many iterations?', back: 'About log2 n. The counter doubles each time, so it reaches n after log2 n steps. The same holds for halving loops and for binary search.' },
    { id: 'cs-cx-c7', front: 'Why is a nested loop where the inner loop runs i times (for i from 0 to n) still O(n²)?', back: 'The total is 0 + 1 + ... + (n-1) = n(n-1)/2, which is about n²/2. The constant 1/2 is dropped, leaving O(n²). Halving the work does not change the class.' },
    { id: 'cs-cx-c8', front: 'Why is building a string with s += c inside a loop O(n²)?', back: 'Strings are immutable in most languages, so each += allocates a new string and copies the existing prefix. Copy sizes 1 + 2 + ... + n sum to O(n²). Collect pieces and join once for O(n).' },
    { id: 'cs-cx-c9', front: 'What is the time complexity of naive recursive Fibonacci, and why?', back: 'Exponential: about phi^n ≈ 1.618^n calls, commonly stated as O(2^n). Each call spawns two more with only slightly smaller arguments, so the same subproblems are recomputed an exponential number of times.' },
    { id: 'cs-cx-c10', front: 'What is the complexity of generating all permutations of n elements?', back: 'O(n * n!): there are n! permutations and each one takes O(n) to build or copy. Any algorithm that outputs them all is at least Omega(n!) just for the output size.' },
    { id: 'cs-cx-c11', front: 'How do you analyze the complexity of a recursive backtracking search?', back: 'Multiply the number of nodes in the call tree (roughly branching factor ^ depth) by the work per node. Then look for pruning, memoization, or duplicate states that shrink the tree.' },
    { id: 'cs-cx-c12', front: 'What recurrence describes merge sort and what does it solve to?', back: 'T(n) = 2T(n/2) + n: two half-size subproblems plus a linear merge. Each level of the recursion tree does n work and there are log2 n levels, so T(n) = Theta(n log n).' },
    { id: 'cs-cx-c13', front: 'In the master theorem, what does n^(log_b a) represent?', back: 'The number of leaves in the recursion tree, i.e. the total work at the bottom level when each leaf does constant work. The theorem compares f(n), the work at the root, against this quantity to decide which dominates.' },
    { id: 'cs-cx-c14', front: 'Solve T(n) = 2T(n/2) + 1.', back: 'Theta(n). n^(log2 2) = n dominates the constant f(n) (master theorem case 1). This is the cost of visiting every node of a balanced tree: the leaves do all the work.' },
    { id: 'cs-cx-c15', front: 'Solve T(n) = T(n/2) + n.', back: 'Theta(n). The work at each level halves (n + n/2 + n/4 + ...), a geometric series bounded by 2n. This is quickselect\'s expected cost and master theorem case 3.' },
    { id: 'cs-cx-c16', front: 'Solve T(n) = T(n-1) + n.', back: 'Theta(n²). Unrolling gives n + (n-1) + ... + 1 = n(n+1)/2. This is quicksort on already-sorted input with a bad pivot, or selection sort. The master theorem does not apply to subtractive recurrences.' },
    { id: 'cs-cx-c17', front: 'Solve T(n) = 2T(n-1) + 1.', back: 'Theta(2^n). Each level doubles the number of calls and the depth is n, giving 2^n - 1 total work. This is Towers of Hanoi and brute-force subset enumeration.' },
    { id: 'cs-cx-c18', front: 'What does Karatsuba\'s recurrence T(n) = 3T(n/2) + n solve to, and why is it better than schoolbook multiplication?', back: 'Theta(n^(log2 3)) ≈ Theta(n^1.585). Replacing 4 half-size multiplications with 3 lowers the exponent below 2, so for large numbers it beats the O(n²) schoolbook algorithm.' },
    { id: 'cs-cx-c19', front: 'How does amortized analysis differ from average-case analysis?', back: 'Average-case assumes a probability distribution over inputs. Amortized is a worst-case bound on the total cost of any sequence of operations, divided by the number of operations; no randomness is involved and an adversary cannot break it.' },
    { id: 'cs-cx-c20', front: 'Explain the accounting method for dynamic array appends.', back: 'Charge each append 3 units: 1 to write the element, 1 banked to copy itself at the next resize, and 1 banked to copy one older element whose credit was already spent. The bank never goes negative, so the amortized cost per append is 3 = O(1).' },
    { id: 'cs-cx-c21', front: 'What is a potential function, and how is amortized cost defined with it?', back: 'A function Phi(state) >= 0 with Phi(initial) = 0 that measures "stored energy" in the data structure. Amortized cost of an operation = actual cost + (Phi after - Phi before). Cheap operations raise Phi; the expensive one spends it.' },
    { id: 'cs-cx-c22', front: 'Why is incrementing a binary counter O(1) amortized even though one increment can flip O(log n) bits?', back: 'Bit 0 flips on every increment, bit 1 on every second, bit k on every 2^k-th. Over n increments the total flips are n + n/2 + n/4 + ... < 2n, so the amortized cost is under 2 flips per increment.' },
    { id: 'cs-cx-c23', front: 'What is the amortized cost of union-find operations with union by rank and path compression?', back: 'O(alpha(n)) per operation, where alpha is the inverse Ackermann function, at most 4 for any practical n - effectively constant. Union by rank alone gives O(log n) worst case per operation; path compression alone gives O(log n) amortized.' },
    { id: 'cs-cx-c24', front: 'When is an amortized O(1) bound not acceptable, and what can you do about it?', back: 'In latency-sensitive systems (real-time, game frames, trading), a single O(n) spike such as a hash table resize is a problem. De-amortize by spreading the work (incremental rehashing), or pre-size the structure so resizes never happen.' },
    { id: 'cs-cx-c25', front: 'What is the space complexity of naive recursive Fibonacci?', back: 'O(n). Although it makes exponentially many calls, only one root-to-leaf path is active at any time, and that path has depth n. Stack space is bounded by the maximum recursion depth, not the total number of calls.' },
    { id: 'cs-cx-c26', front: 'What is quicksort\'s worst-case stack depth, and how do you bound it to O(log n)?', back: 'O(n) when partitions are maximally unbalanced (sorted input with a first/last pivot). Recurse into the smaller partition and loop on the larger one; the recursive side is at most half the range, so depth is at most log2 n.' },
    { id: 'cs-cx-c27', front: 'Why can a correct recursive DFS crash on a large input, and what is the fix?', back: 'Recursion depth equals the longest path explored; on a path-shaped graph that is O(V) frames, which overflows a fixed-size stack (Python also caps at 1000 frames). Use an explicit stack on the heap or BFS.' },
    { id: 'cs-cx-c28', front: 'Can you rely on tail-call optimization to make deep recursion safe?', back: 'Not in Python, Java, or JavaScript engines, which do not guarantee it. C/C++ compilers and some functional languages perform it only when the call is genuinely in tail position. When depth can be large, rewrite the recursion as a loop.' },
    { id: 'cs-cx-c29', front: 'Why does iterating a large matrix column by column run much slower than row by row, with the same Big-O?', back: 'Row-major storage puts each row contiguously. Walking a row uses every element of each cache line and lets the prefetcher stream ahead. Walking a column touches one element per line and jumps by a full row stride, causing a cache miss per element.' },
    { id: 'cs-cx-c30', front: 'Why is summing elements above a threshold faster on a sorted array than an unsorted one in compiled code?', back: 'The CPU predicts branches from recent history. On sorted data the comparison is false for a long run then true for a long run, so predictions are almost always right. On random data about half the predictions fail, each costing ~15-20 cycles of discarded speculative work.' }
  ],

  quizQuestions: [
    {
      id: 'cs-cx-q1',
      question: 'An algorithm runs in 3n² + 200n log n + 5000 steps. What is its tight bound?',
      options: ['Theta(n log n)', 'Theta(n²)', 'Theta(n² log n)', 'Theta(n³)'],
      correctAnswer: 1,
      explanation: 'For large n the n² term dominates n log n and the constant. Drop the coefficient 3 and the lower-order terms: Theta(n²). The 200 and 5000 only matter for small n.'
    },
    {
      id: 'cs-cx-q2',
      question: 'Which statement about Big-O notation is correct?',
      options: ['O(g) means the algorithm\'s worst case is exactly g', 'If f is O(n²), then f cannot also be O(n³)', 'O(g) is an upper bound; a function that is Theta(n) is also O(n²)', 'Big-O applies only to worst-case inputs'],
      correctAnswer: 2,
      explanation: 'O is an upper bound on growth, so any function bounded by n is also bounded by n² (loosely). It says nothing about which input case you are measuring; you can give O bounds for best, average, or worst case. Theta is the tight bound.'
    },
    {
      id: 'cs-cx-q3',
      question: 'What is the complexity of this function?\n\nfor i in range(n):\n    j = 1\n    while j < n:\n        j *= 2',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      correctAnswer: 1,
      explanation: 'The outer loop runs n times. The inner loop doubles j until it reaches n, which takes log2 n iterations. Nested work multiplies: O(n log n).'
    },
    {
      id: 'cs-cx-q4',
      question: 'What is the complexity of this function?\n\nfor i in range(n):\n    for j in range(i, n):\n        for k in range(m):\n            work()',
      options: ['O(n·m)', 'O(n²)', 'O(n²·m)', 'O(n·m²)'],
      correctAnswer: 2,
      explanation: 'The two outer loops form a triangle of about n²/2 (i, j) pairs; the innermost loop runs m times for each. Multiply: O(n²·m). The 1/2 constant is dropped, and m stays separate because it is an independent input.'
    },
    {
      id: 'cs-cx-q5',
      question: 'A Python function loops over a list of n strings and checks "if s in seen" where seen is a list. What is the total complexity?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 2,
      explanation: '"in" on a list is a linear scan, so each check is O(n) in the worst case, and there are n checks: O(n²). Making seen a set drops the membership test to expected O(1) and the whole loop to O(n).'
    },
    {
      id: 'cs-cx-q6',
      question: 'A recursive function processes a list by calling itself on arr[1:] until the list is empty. What is its complexity, assuming O(1) work per call besides the slice?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
      correctAnswer: 2,
      explanation: 'Slicing arr[1:] copies n-1 elements, then n-2, and so on: the copies sum to O(n²). The recursion itself is linear, but the hidden cost of slicing adds a factor of n. Pass an index instead of slicing.'
    },
    {
      id: 'cs-cx-q7',
      question: 'Which recurrence solves to Theta(n log n)?',
      options: ['T(n) = T(n/2) + 1', 'T(n) = 2T(n/2) + 1', 'T(n) = 2T(n/2) + n', 'T(n) = T(n-1) + n'],
      correctAnswer: 2,
      explanation: 'Two half-size subproblems plus linear work is master theorem case 2: n^(log2 2) = n matches f(n) = n, giving n log n. T(n/2)+1 is log n, 2T(n/2)+1 is n, and T(n-1)+n is n².'
    },
    {
      id: 'cs-cx-q8',
      question: 'Solve T(n) = 4T(n/2) + n.',
      options: ['Theta(n)', 'Theta(n log n)', 'Theta(n²)', 'Theta(n² log n)'],
      correctAnswer: 2,
      explanation: 'n^(log2 4) = n², which grows polynomially faster than f(n) = n, so the leaves dominate (case 1) and T(n) = Theta(n²). This is the recurrence for the naive divide-and-conquer integer multiplication before Karatsuba\'s trick.'
    },
    {
      id: 'cs-cx-q9',
      question: 'Solve T(n) = 2T(n/2) + n².',
      options: ['Theta(n log n)', 'Theta(n²)', 'Theta(n² log n)', 'Theta(n³)'],
      correctAnswer: 1,
      explanation: 'n^(log2 2) = n, and f(n) = n² is polynomially larger, so the root dominates (case 3): T(n) = Theta(n²). Intuitively, the work per level halves (n², n²/2, n²/4, ...), a geometric series bounded by 2n².'
    },
    {
      id: 'cs-cx-q10',
      question: 'What is the complexity of a function that calls itself twice with argument n-1 and does O(1) other work, with T(0) = 1?',
      options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(2ⁿ)'],
      correctAnswer: 3,
      explanation: 'T(n) = 2T(n-1) + 1 doubles the number of calls at every level for n levels: 2ⁿ - 1 total. Subtracting 1 rather than halving is what makes this exponential instead of linear (compare with 2T(n/2) + 1 = Theta(n)).'
    },
    {
      id: 'cs-cx-q11',
      question: 'A dynamic array has capacity 1024 and 1024 elements. You append 1024 more elements. Roughly how many element copies occur in total during those appends, and what is the amortized cost per append?',
      options: ['1024 copies; O(1) amortized', '2048 copies; O(log n) amortized', '1024 × 1024 copies; O(n) amortized', '0 copies; O(1) amortized'],
      correctAnswer: 0,
      explanation: 'The first extra append triggers one resize that copies the 1024 existing elements into a block of 2048; the remaining 1023 appends fit without resizing. About 1024 copies over 1024 appends is one copy per append: O(1) amortized.'
    },
    {
      id: 'cs-cx-q12',
      question: 'Which claim about amortized analysis is correct?',
      options: ['It assumes inputs are uniformly random', 'It bounds the average cost of any sequence of operations, so no single operation can exceed the amortized bound', 'It gives a worst-case bound on the total cost of any sequence, though individual operations may be much more expensive', 'It only applies to data structures that resize'],
      correctAnswer: 2,
      explanation: 'Amortized bounds are worst-case over sequences with no probabilistic assumptions, which distinguishes them from average-case analysis. An individual operation (a resize, a splay) can still be O(n); the guarantee is that such operations are rare enough that the total stays bounded.'
    },
    {
      id: 'cs-cx-q13',
      question: 'Using the potential method with Phi = 2·size - capacity for a doubling dynamic array, what is the amortized cost of an append that triggers a resize from n to 2n elements of capacity?',
      options: ['O(n), because the copy is charged in full', 'About 3, because the drop in potential pays for the copy', 'About 1, because potential is unaffected', 'Negative, because potential decreases'],
      correctAnswer: 1,
      explanation: 'Before: size = n, capacity = n, Phi = n. After copying and inserting: size = n+1, capacity = 2n, Phi = 2(n+1) - 2n = 2. Actual cost is n copies + 1 insert. Amortized = (n + 1) + (2 - n) = 3. The banked potential absorbs the copy.'
    },
    {
      id: 'cs-cx-q14',
      question: 'Union-find uses path compression but NOT union by rank. What is the amortized cost per operation?',
      options: ['O(1)', 'O(alpha(n))', 'O(log n)', 'O(n)'],
      correctAnswer: 2,
      explanation: 'Path compression alone yields O(log n) amortized per operation. Adding union by rank (or size) brings it down to O(alpha(n)), effectively constant. Union by rank alone gives O(log n) worst case per operation with no amortization needed.'
    },
    {
      id: 'cs-cx-q15',
      question: 'What is the auxiliary space complexity of a standard top-down merge sort on an array of n elements?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 2,
      explanation: 'The merge step needs a temporary buffer of size n (a single reusable buffer suffices), plus O(log n) for the recursion stack. O(n) + O(log n) = O(n). It is not n log n: buffers are not kept for every level at once.'
    },
    {
      id: 'cs-cx-q16',
      question: 'Naive recursive Fibonacci makes roughly 1.6ⁿ calls. What is its space complexity?',
      options: ['O(1)', 'O(n)', 'O(n²)', 'O(1.6ⁿ)'],
      correctAnswer: 1,
      explanation: 'Stack space depends on the maximum number of simultaneously active frames, which is the depth of the recursion: fib(n) → fib(n-1) → ... → fib(0), n frames. Calls that have returned free their frames, so the total call count is irrelevant.'
    },
    {
      id: 'cs-cx-q17',
      question: 'Quicksort recurses on the smaller partition and loops on the larger one. What does this guarantee?',
      options: ['O(n log n) worst-case time', 'O(log n) worst-case stack depth', 'O(1) auxiliary space', 'Stable sorting'],
      correctAnswer: 1,
      explanation: 'The recursive call always handles at most half the current range, so depth is bounded by log2 n regardless of pivot quality. Time remains O(n²) in the worst case; this trick only fixes the stack. Quicksort is still unstable.'
    },
    {
      id: 'cs-cx-q18',
      question: 'A DP table for edit distance between strings of lengths n and m uses O(n·m) space. Which observation lets you reduce it to O(min(n, m))?',
      options: ['Rows can be recomputed from scratch when needed', 'Each cell depends only on the previous row and the current row, so two rows suffice', 'The table is symmetric so half can be dropped', 'Edit distance can be computed greedily without a table'],
      correctAnswer: 1,
      explanation: 'dp[i][j] reads dp[i-1][j], dp[i][j-1], and dp[i-1][j-1]: only the previous and current rows. Keeping two rows (of the shorter string\'s length) gives the final distance. Reconstructing the actual edits, however, needs the full table or extra tricks.'
    },
    {
      id: 'cs-cx-q19',
      question: 'Two implementations sort the same 20-element arrays millions of times: one is O(n log n) merge sort, the other O(n²) insertion sort. Which is likely faster and why?',
      options: ['Merge sort, because n log n < n² for all n > 1', 'Insertion sort, because its constant factor is tiny and 20 elements fit in a cache line or two', 'They are equal, because Big-O is exact for small n', 'Merge sort, because it uses less memory'],
      correctAnswer: 1,
      explanation: 'At n = 20, n² = 400 and n log n ≈ 86, but insertion sort does simple in-place compares and swaps with no allocation or recursion. Production sorts (introsort, Timsort) switch to insertion sort below ~16-32 elements for exactly this reason. Merge sort also allocates a buffer, so it uses more memory.'
    },
    {
      id: 'cs-cx-q20',
      question: 'An interviewer asks whether to use a hash map (expected O(1) lookup) or a balanced BST (O(log n) lookup) for 10 million keys. What is the strongest answer?',
      options: ['Hash map, because O(1) always beats O(log n)', 'BST, because hash maps have O(n) worst case', 'Ask about the access pattern: hash map for point lookups, BST if you need ordered iteration, range queries, or predictable worst-case latency; and mention that log2(10⁷) is only about 23', 'Neither; use a sorted array with binary search'],
      correctAnswer: 2,
      explanation: 'The best answer states the assumptions and tradeoffs. Both are fast; the choice hinges on whether ordering is needed, whether resize spikes are tolerable, and memory. Noting that log n is a small constant shows you understand that Big-O alone does not decide the question.'
    }
  ]
};
