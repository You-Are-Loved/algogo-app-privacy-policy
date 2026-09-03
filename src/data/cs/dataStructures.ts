// CS Fundamentals - Data Structures
// How arrays, hash tables, trees, heaps, and graphs really work under the hood

import { Category } from '../../types';

export const dataStructures: Category = {
  id: 'cs-data-structures',
  name: 'Data Structures',
  slug: 'cs-data-structures',
  description: 'How arrays, hash tables, trees, heaps, and graphs really work under the hood',
  icon: 'layers-outline',
  color: '#0EA5E9',
  colorDark: '#0284C7',

  learnContent: [
    {
      id: 'cs-ds-1',
      title: 'Dynamic Arrays and Amortized Growth',
      content: `A dynamic array (Python \`list\`, Java \`ArrayList\`, C++ \`std::vector\`, JavaScript arrays in practice) is a fixed-size block of contiguous memory plus a length. When the block is full, the structure allocates a bigger block, copies everything over, and frees the old one.

**Why Geometric Growth:**
- Growing by a constant amount (say +10 slots) means n appends cost 10 + 20 + 30 + ... = O(n²) total copying
- Growing by a constant factor (×2, or ×1.5) means the copies form a geometric series: n + n/2 + n/4 + ... < 2n, so n appends cost O(n) total
- That is **amortized O(1)** per append: any single append may be O(n), but averaged over the sequence each one is constant

**The Growth Factor Tradeoff:**
- ×2 wastes up to 50% of the allocated block; ×1.5 wastes less and lets freed blocks be reused for later growth (this is why many libraries use 1.5 or ~1.125)
- Python over-allocates by roughly 12.5%; Java ArrayList grows by 1.5; most C++ vectors use 2 or 1.5

**Other Costs Interviewers Probe:**
- Insert or delete at the front or middle is O(n): every later element shifts (a \`memmove\`)
- Reads by index are O(1): address = base + index × element size
- Capacity vs length: \`len\` is what you see; capacity is what was allocated. \`reserve\` avoids repeated regrowth when you know the final size
- Shrinking: shrink only when the array is a quarter full, not half full, or alternating push/pop at the boundary triggers a resize every operation

**Pointer Invalidation:**
In C++ a regrowth moves every element, so references and iterators into a vector are invalidated by \`push_back\`. Languages with references to objects (Java, Python) avoid this because the array holds references, not the objects themselves.`,
      codeExample: `class DynamicArray:
    """Minimal vector with geometric growth (Python-style API)."""

    def __init__(self):
        self._capacity = 4
        self._size = 0
        self._data = [None] * self._capacity

    def __len__(self):
        return self._size

    def __getitem__(self, i):
        if not 0 <= i < self._size:
            raise IndexError(i)
        return self._data[i]            # O(1): base + i * slot

    def append(self, value):
        if self._size == self._capacity:
            self._grow(self._capacity * 2)   # rare O(n) copy
        self._data[self._size] = value       # usual O(1) write
        self._size += 1

    def pop(self):
        if self._size == 0:
            raise IndexError("pop from empty array")
        self._size -= 1
        value = self._data[self._size]
        self._data[self._size] = None        # drop the reference
        # Shrink at 1/4 full, not 1/2, so push/pop at the boundary
        # doesn't resize on every call.
        if self._capacity > 4 and self._size <= self._capacity // 4:
            self._grow(self._capacity // 2)
        return value

    def insert(self, i, value):
        if self._size == self._capacity:
            self._grow(self._capacity * 2)
        for j in range(self._size, i, -1):   # shift right: O(n)
            self._data[j] = self._data[j - 1]
        self._data[i] = value
        self._size += 1

    def _grow(self, new_capacity):
        new_data = [None] * new_capacity
        for i in range(self._size):          # copy everything once
            new_data[i] = self._data[i]
        self._data = new_data
        self._capacity = new_capacity


# Cost of 1,000,000 appends: about 2,000,000 element copies total,
# so ~2 copies per append on average -> amortized O(1).`
    },
    {
      id: 'cs-ds-2',
      title: 'Hash Tables: Hashing, Collisions, and Resizing',
      content: `A hash table gives expected O(1) insert, lookup, and delete by turning a key into an array index. Every part of that sentence has a caveat that interviewers love.

**The Pipeline:**
- \`hash(key)\` produces an integer (Python \`__hash__\`, Java \`hashCode\`)
- Index = \`hash mod capacity\` (or \`hash & (capacity - 1)\` when capacity is a power of two)
- Two different keys landing on the same index is a **collision** - unavoidable, since there are more possible keys than slots

**Resolving Collisions:**
- **Separate chaining:** each slot holds a linked list (or small array/tree) of entries. Simple, tolerates load factor > 1, extra pointer per entry. Java's HashMap converts long chains to red-black trees.
- **Open addressing:** all entries live in the array itself. On collision, probe other slots: linear probing (i, i+1, i+2...), quadratic probing, or double hashing. Cache-friendly, but deletion needs **tombstones** so later probe sequences aren't broken, and performance collapses as the table fills. Python's dict and Rust's HashMap use open addressing.

**Load Factor and Resizing:**
- Load factor α = entries / slots. Expected cost of a lookup grows with α (roughly 1 + α for chaining)
- When α crosses a threshold (0.75 in Java, ~0.67 in CPython), allocate a table about twice as large and **rehash every entry** into it - the index depends on capacity, so nothing can be copied in place
- Resizing is O(n) but happens after Θ(n) inserts, so inserts stay amortized O(1)

**Requirements on Keys:**
- Equal keys must hash equally (the hash/equals contract). Breaking it makes lookups silently fail.
- Keys should be immutable while in the table: mutating a key changes its hash, and it is now in the wrong bucket.

**Worst Case:**
If every key collides, lookups degrade to O(n). Adversaries can craft such inputs (hash flooding), which is why languages randomize string hash seeds per process.

**Ordering:**
Iteration order is an implementation detail: it follows the bucket layout, not insertion or sorted order (CPython dicts keep insertion order since 3.7 because they store entries in a separate dense array). Need sorted keys? Use a balanced tree.`,
      codeExample: `class HashMap:
    """Separate-chaining hash map with load-factor-driven resizing."""

    MAX_LOAD = 0.75

    def __init__(self, capacity=8):
        self._buckets = [[] for _ in range(capacity)]
        self._size = 0

    def _index(self, key):
        # capacity is always a power of two, so & is equivalent to mod
        return hash(key) & (len(self._buckets) - 1)

    def get(self, key, default=None):
        for k, v in self._buckets[self._index(key)]:  # walk the chain
            if k == key:              # hash equal is not enough: compare keys
                return v
        return default

    def put(self, key, value):
        bucket = self._buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)   # overwrite existing key
                return
        bucket.append((key, value))
        self._size += 1
        if self._size / len(self._buckets) > self.MAX_LOAD:
            self._resize()

    def remove(self, key):
        bucket = self._buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self._size -= 1
                return True
        return False

    def _resize(self):
        old = self._buckets
        self._buckets = [[] for _ in range(len(old) * 2)]
        for bucket in old:               # every entry gets a new index
            for k, v in bucket:
                self._buckets[self._index(k)].append((k, v))


m = HashMap()
for word in "the quick brown fox jumps over the lazy dog".split():
    m.put(word, m.get(word, 0) + 1)
print(m.get("the"))   # 2

# Open addressing sketch (linear probing): probe until an empty slot
# i = index(key); while table[i] is not None and table[i].key != key:
#     i = (i + 1) % capacity`
    },
    {
      id: 'cs-ds-3',
      title: 'Linked Lists vs Arrays: Cache Locality',
      content: `Textbooks say linked lists give O(1) insertion and deletion; arrays give O(1) random access. On real hardware the story is more lopsided, and a good interview answer explains why.

**What the Big-O Hides:**
- Linked list insert is O(1) **only if you already hold the node**. Finding the position is O(n), and that walk is slow.
- Each node lives wherever the allocator put it. Following \`next\` is a **pointer chase**: the CPU cannot fetch the next node until the current one arrives from memory, so nothing overlaps.
- Arrays are contiguous. One 64-byte cache line holds sixteen 4-byte ints, and the hardware prefetcher notices the sequential pattern and pulls the next lines before you ask.

**Numbers That Matter:**
- L1 cache hit: ~1 ns. Main memory: ~100 ns. A linked-list traversal of scattered nodes can take one memory miss per element.
- Each list node also costs 8-16 bytes of pointers plus allocator overhead, so a list of ints can use 3-5× the memory of a vector.
- In practice a vector often beats a linked list even for inserting in the middle, up to fairly large sizes, because shifting contiguous memory is a fast \`memmove\`.

**When Linked Lists Win:**
- You hold a reference to the node and need O(1) unlink or splice - the classic case is an **LRU cache**: hash map from key to node, plus a doubly linked list ordering nodes by recency
- Stable addresses: nodes never move on insert, so pointers to them stay valid
- Intrusive lists inside other structures (kernel run queues, allocator free lists)
- Persistent or functional structures where sharing tails is the point

**Singly vs Doubly Linked:**
- Singly: one pointer per node; removal needs the predecessor
- Doubly: O(1) removal given only the node, at the cost of a second pointer and more bookkeeping

**Interview Framing:**
Default to an array or dynamic array. Reach for a linked list when you can name the O(1) node operation you need and why arrays cannot give it to you.`,
      codeExample: `class Node:
    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None


class LRUCache:
    """O(1) get/put: dict for lookup + doubly linked list for recency order.
    Most recently used sits right after the head sentinel; the tail
    sentinel's predecessor is the eviction candidate."""

    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()   # sentinels: no None checks
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):            # O(1) because we hold the node
        node.prev.next = node.next
        node.next.prev = node.prev

    def _push_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return -1
        self._unlink(node)               # move to front = mark as used
        self._push_front(node)
        return node.value

    def put(self, key, value):
        if key in self.map:
            node = self.map[key]
            node.value = value
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.map) == self.capacity:
            victim = self.tail.prev      # least recently used
            self._unlink(victim)
            del self.map[victim.key]
        node = Node(key, value)
        self.map[key] = node
        self._push_front(node)


cache = LRUCache(2)
cache.put(1, "a"); cache.put(2, "b")
cache.get(1)            # 1 is now most recent
cache.put(3, "c")       # evicts 2
print(cache.get(2))     # -1`
    },
    {
      id: 'cs-ds-4',
      title: 'Stacks, Queues, Deques, and Ring Buffers',
      content: `Stacks and queues are restrictions on access, not storage formats. The interview question is usually "how would you implement it efficiently?"

**Stack (LIFO):**
- Push and pop at the same end of a dynamic array: both amortized O(1)
- Function calls use a stack: each call pushes a frame (return address, locals); return pops it
- Uses: expression evaluation, matching brackets, undo, DFS, monotonic stack problems (next greater element)

**Queue (FIFO) - the Naive Mistake:**
Using an array and removing from the front (\`list.pop(0)\` in Python, \`shift()\` in JavaScript) shifts every element: O(n) per dequeue.

**Ring (Circular) Buffer:**
- Fixed array plus \`head\` and \`tail\` indices that wrap with modulo
- Enqueue writes at \`tail\`, dequeue reads at \`head\`; both O(1), no shifting, no allocation
- The classic ambiguity: when \`head == tail\`, is it full or empty? Solutions: track a \`count\`, leave one slot unused, or use ever-increasing indices and mask with a power-of-two capacity
- Used everywhere latency matters: audio, network drivers, logging, producer-consumer between threads

**Two-Stack Queue:**
An in-stack and an out-stack. Enqueue pushes onto in; dequeue pops from out, refilling it by draining in when empty. Each element moves at most twice, so amortized O(1).

**Deque (Double-Ended Queue):**
- O(1) push/pop at both ends
- Implemented as a growable ring buffer, or as a list of fixed-size blocks with an index map (C++ \`std::deque\`, Python \`collections.deque\` uses 64-item blocks)
- Block-based deques keep element addresses stable when growing at the ends
- Uses: sliding-window maximum (monotonic deque), BFS frontier, work-stealing schedulers

**Priority Queue:**
Not FIFO - dequeues the smallest (or largest) key. Implemented with a heap, covered in the heaps section.`,
      codeExample: `class RingBuffer:
    """Bounded FIFO queue backed by a fixed array. O(1) enqueue/dequeue."""

    def __init__(self, capacity):
        self._buf = [None] * capacity
        self._head = 0          # index of the oldest element
        self._count = 0         # tracking count resolves full-vs-empty

    def is_empty(self):
        return self._count == 0

    def is_full(self):
        return self._count == len(self._buf)

    def enqueue(self, item):
        if self.is_full():
            raise OverflowError("ring buffer full")
        tail = (self._head + self._count) % len(self._buf)
        self._buf[tail] = item
        self._count += 1

    def dequeue(self):
        if self.is_empty():
            raise IndexError("ring buffer empty")
        item = self._buf[self._head]
        self._buf[self._head] = None
        self._head = (self._head + 1) % len(self._buf)   # wrap around
        self._count -= 1
        return item


class TwoStackQueue:
    """Unbounded FIFO from two LIFO stacks; amortized O(1) per op."""

    def __init__(self):
        self._in, self._out = [], []

    def enqueue(self, item):
        self._in.append(item)

    def dequeue(self):
        if not self._out:
            while self._in:                  # each element moves once
                self._out.append(self._in.pop())
        if not self._out:
            raise IndexError("queue empty")
        return self._out.pop()


rb = RingBuffer(3)
for x in (1, 2, 3):
    rb.enqueue(x)
rb.dequeue()          # 1
rb.enqueue(4)         # wraps into slot 0
print([rb.dequeue() for _ in range(3)])   # [2, 3, 4]`
    },
    {
      id: 'cs-ds-5',
      title: 'Trees: BSTs, Balanced Trees, and B-Trees',
      content: `A binary search tree keeps keys in order so that search, insert, and delete cost O(height). Everything after that is about controlling the height.

**Binary Search Tree Invariant:**
- Every key in the left subtree < node key < every key in the right subtree
- In-order traversal yields keys in sorted order
- Delete has three cases: leaf (remove), one child (splice), two children (replace with in-order successor, then delete the successor)

**The Degenerate Case:**
Insert keys in sorted order and a plain BST becomes a linked list: height n, all operations O(n). Randomized input gives expected height O(log n), but interviews and adversaries do not give random input.

**Self-Balancing Trees:**
- **AVL:** for every node, subtree heights differ by at most 1. Strict balance means height ≤ ~1.44 log n and the fastest lookups, but more rotations on insert/delete.
- **Red-black:** looser invariant (no two adjacent red nodes, equal black height on every root-to-leaf path). Height ≤ 2 log(n+1). Fewer rotations (at most 2 on insert, 3 on delete), so it wins for write-heavy workloads. Used by C++ \`std::map\`, Java \`TreeMap\`, and the Linux CFS scheduler.
- Both rebalance with **rotations**: O(1) pointer rewiring that preserves in-order sequence while shifting height between siblings.

**What Balanced Trees Give You That Hash Tables Don't:**
- Sorted iteration, min/max, floor/ceiling, and range queries in O(log n + k)
- Predictable O(log n) worst case with no resize spikes
- Cost: a constant factor slower for point lookups and more memory per node

**B-Trees: Why Databases and File Systems Use Them:**
- A binary node holds one key; fetching it from disk costs a full block read (typically 4-16 KB). That wastes almost the whole block.
- A B-tree node is sized to one block and holds hundreds of keys, so **fanout is huge and height is tiny**: a billion keys fit in a tree of height 3-4
- Each level is one disk (or SSD) read; that is why an indexed database lookup takes a handful of I/Os
- **B+ tree** variant: all values live in leaves, leaves are linked in order, so range scans stream sequentially without revisiting internal nodes. This is what MySQL/InnoDB, PostgreSQL, and SQLite indexes use.
- Nodes stay at least half full; insert splits a full node, delete merges or borrows from a sibling

**Tries:**
A tree keyed by characters: lookup is O(length of key) regardless of how many keys are stored. Used for autocomplete, IP routing, and spell checking.`,
      codeExample: `class BSTNode:
    __slots__ = ("key", "left", "right")

    def __init__(self, key):
        self.key, self.left, self.right = key, None, None


def insert(root, key):
    if root is None:
        return BSTNode(key)
    if key < root.key:
        root.left = insert(root.left, key)
    elif key > root.key:
        root.right = insert(root.right, key)
    return root                       # duplicates ignored


def search(root, key):
    while root is not None and root.key != key:   # O(height)
        root = root.left if key < root.key else root.right
    return root


def inorder(root):
    if root is not None:
        yield from inorder(root.left)
        yield root.key
        yield from inorder(root.right)


def delete(root, key):
    if root is None:
        return None
    if key < root.key:
        root.left = delete(root.left, key)
    elif key > root.key:
        root.right = delete(root.right, key)
    elif root.left is None:           # zero or one child: splice out
        return root.right
    elif root.right is None:
        return root.left
    else:                             # two children: swap in successor
        succ = root.right
        while succ.left is not None:
            succ = succ.left
        root.key = succ.key
        root.right = delete(root.right, succ.key)
    return root


# A single right rotation: the primitive every balanced tree uses.
# Preserves in-order sequence, moves height from left to right.
def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    return x                          # new subtree root


root = None
for k in (50, 30, 70, 20, 40, 60, 80):
    root = insert(root, k)
print(list(inorder(root)))            # [20, 30, 40, 50, 60, 70, 80]

# Sorted input => degenerate chain: height n instead of log n
chain = None
for k in range(1, 8):
    chain = insert(chain, k)`
    },
    {
      id: 'cs-ds-6',
      title: 'Heaps, Priority Queues, and Graph Representations',
      content: `A binary heap is the standard priority queue: O(log n) insert and remove-min, O(1) peek, and it lives in a plain array with no pointers at all.

**Heap Property:**
- Min-heap: every parent ≤ its children. The root is the minimum.
- It is a **complete** binary tree: every level full except possibly the last, filled left to right. That is what makes the array layout work.
- A heap is not sorted: siblings have no order, and you cannot binary-search it.

**Array Layout (0-indexed):**
- Children of index i: \`2i + 1\` and \`2i + 2\`
- Parent of index i: \`(i - 1) // 2\`
- No child pointers, contiguous memory, and the "last node" is simply the last array slot

**Operations:**
- **Push:** append at the end, then **sift up** (swap with parent while smaller): O(log n)
- **Pop:** save the root, move the last element to the root, then **sift down** (swap with the smaller child while larger): O(log n)
- **Heapify** an arbitrary array: sift down every non-leaf from the last one back to the root. This is **O(n)**, not O(n log n): most nodes are near the bottom and sift only a step or two. The sum Σ (n / 2^h) × h converges to O(n).
- Building by n pushes is O(n log n) - a common interview distinction.

**Where Heaps Show Up:**
- Dijkstra and Prim (extract-min), event simulation, OS schedulers, timers
- Top-k / k-th largest: keep a min-heap of size k, O(n log k)
- Merging k sorted lists: heap of k heads, O(N log k)
- Heap sort: heapify then pop n times, O(n log n) in place
- Decrease-key: most library heaps lack it; push a fresh entry and skip stale ones on pop (lazy deletion) instead
- Max-heap from a min-heap library: push negated keys

**Graph Representations:**
- **Adjacency list:** array (or map) of neighbor lists. Space O(V + E). Iterating neighbors is O(degree). The default for sparse graphs, which is nearly all real graphs.
- **Adjacency matrix:** V × V grid. Space O(V²) regardless of edge count. "Is there an edge u-v?" is O(1); iterating neighbors is O(V). Good for dense graphs or when you need fast edge tests and V is small.
- **Edge list:** flat list of (u, v, w). Best for Kruskal's algorithm (sort edges) and for streaming input.
- Weighted graphs store the weight alongside the neighbor; directed graphs store only out-edges (or both directions if you need in-degree)`,
      codeExample: `def sift_up(heap, i):
    while i > 0:
        parent = (i - 1) // 2
        if heap[parent] <= heap[i]:
            break
        heap[parent], heap[i] = heap[i], heap[parent]
        i = parent


def sift_down(heap, i, n=None):
    n = len(heap) if n is None else n
    while True:
        left, right, smallest = 2 * i + 1, 2 * i + 2, i
        if left < n and heap[left] < heap[smallest]:
            smallest = left
        if right < n and heap[right] < heap[smallest]:
            smallest = right
        if smallest == i:
            return
        heap[i], heap[smallest] = heap[smallest], heap[i]
        i = smallest


def push(heap, item):
    heap.append(item)                   # O(1) amortized
    sift_up(heap, len(heap) - 1)        # O(log n)


def pop(heap):
    top = heap[0]
    last = heap.pop()
    if heap:
        heap[0] = last
        sift_down(heap, 0)              # O(log n)
    return top


def heapify(arr):
    # Last non-leaf is parent of the last index; leaves need no work.
    for i in range((len(arr) - 2) // 2, -1, -1):
        sift_down(arr, i)               # O(n) total, not O(n log n)


data = [9, 4, 7, 1, 8, 2]
heapify(data)
print([pop(data) for _ in range(len(data))])   # [1, 2, 4, 7, 8, 9]

# Top-k largest with a min-heap of size k: O(n log k)
def top_k(nums, k):
    heap = []
    for x in nums:
        push(heap, x)
        if len(heap) > k:
            pop(heap)                   # drop the smallest
    return heap

# Graph representations
adj_list = {0: [1, 2], 1: [2], 2: [0]}          # O(V + E) space
adj_matrix = [[0, 1, 1],
              [0, 0, 1],
              [1, 0, 0]]                          # O(V^2) space
print(adj_matrix[1][2] == 1)                      # O(1) edge test
print([v for v in adj_list[0]])                   # O(degree) neighbors`
    }
  ],

  visualizations: [
    {
      title: 'Hash Table Lookup',
      description: 'From key to value: hash, index, then resolve the collision',
      nodes: [
        { id: 'key', label: 'key\n"apple"', x: 60, y: 50, type: 'primary' },
        { id: 'hash', label: 'hash(key)\n= 91742', x: 190, y: 50, type: 'secondary' },
        { id: 'idx', label: 'hash mod 8\n= bucket 6', x: 320, y: 50, type: 'secondary' },
        { id: 'bucket', label: 'bucket 6\nchain head', x: 320, y: 150, type: 'info' },
        { id: 'entry1', label: '"pear" -> 3\n(collision)', x: 190, y: 150, type: 'warning' },
        { id: 'entry2', label: '"apple" -> 7\nkeys equal', x: 60, y: 150, type: 'success' },
        { id: 'resize', label: 'load > 0.75?\nrehash into 16', x: 190, y: 250, type: 'error' }
      ],
      edges: [
        { from: 'key', to: 'hash' },
        { from: 'hash', to: 'idx' },
        { from: 'idx', to: 'bucket' },
        { from: 'bucket', to: 'entry1', label: 'compare' },
        { from: 'entry1', to: 'entry2', label: 'next' },
        { from: 'bucket', to: 'resize', label: 'after insert' }
      ]
    },
    {
      title: 'Binary Heap as an Array',
      description: 'Complete tree stored in [1, 3, 2, 7, 5, 4]: children of i live at 2i+1 and 2i+2',
      nodes: [
        { id: 'n0', label: 'a[0] = 1\nroot (min)', x: 190, y: 40, type: 'primary' },
        { id: 'n1', label: 'a[1] = 3', x: 100, y: 130, type: 'secondary' },
        { id: 'n2', label: 'a[2] = 2', x: 280, y: 130, type: 'secondary' },
        { id: 'n3', label: 'a[3] = 7', x: 50, y: 220, type: 'info' },
        { id: 'n4', label: 'a[4] = 5', x: 150, y: 220, type: 'info' },
        { id: 'n5', label: 'a[5] = 4\nlast leaf', x: 280, y: 220, type: 'info' },
        { id: 'push', label: 'push 0: append\nat a[6], sift up', x: 190, y: 290, type: 'success' }
      ],
      edges: [
        { from: 'n0', to: 'n1', label: '2*0+1' },
        { from: 'n0', to: 'n2', label: '2*0+2' },
        { from: 'n1', to: 'n3', label: '2*1+1' },
        { from: 'n1', to: 'n4', label: '2*1+2' },
        { from: 'n2', to: 'n5', label: '2*2+1' },
        { from: 'push', to: 'n2', label: 'parent (6-1)//2' }
      ]
    }
  ],

  flashcards: [
    { id: 'cs-ds-c1', front: 'Why do dynamic arrays grow by a constant factor instead of a constant amount?', back: 'Constant-amount growth makes n appends cost O(n²) in copying. Geometric growth (×1.5 or ×2) makes the total copying a geometric series bounded by O(n), so each append is amortized O(1).' },
    { id: 'cs-ds-c2', front: 'What does "amortized O(1)" mean for a dynamic array append?', back: 'Any single append may cost O(n) when the array regrows, but over any sequence of n appends the total work is O(n), so the average per operation is constant. It is a worst-case guarantee over the sequence, not a probabilistic one.' },
    { id: 'cs-ds-c3', front: 'Why should a dynamic array shrink at 1/4 full rather than 1/2 full?', back: 'If it shrinks at 1/2, a push/pop pair right at the boundary triggers a grow and then a shrink every time, making each operation O(n). Shrinking at 1/4 leaves a gap so resizes stay rare.' },
    { id: 'cs-ds-c4', front: 'What is the cost of inserting at the front of a dynamic array, and why?', back: 'O(n): every existing element must shift one slot to the right (a memmove) to make room. Appending at the end is amortized O(1).' },
    { id: 'cs-ds-c5', front: 'Why does push_back on a C++ vector invalidate existing references and iterators?', back: 'When capacity is exhausted the vector allocates a new block and moves every element into it, freeing the old block. Anything pointing into the old block now dangles. Languages storing object references (Java, Python) do not have this problem.' },
    { id: 'cs-ds-c6', front: 'How does a hash table turn a key into an array slot?', back: 'Compute an integer hash of the key, then reduce it to a valid index with hash mod capacity (or hash & (capacity - 1) when capacity is a power of two).' },
    { id: 'cs-ds-c7', front: 'What is the load factor of a hash table and why does it matter?', back: 'Load factor α = entries / slots. Expected lookup cost grows with α (about 1 + α for chaining; much worse near 1.0 for open addressing). Tables resize when α crosses a threshold such as 0.75.' },
    { id: 'cs-ds-c8', front: 'Separate chaining vs open addressing: what is the core difference?', back: 'Chaining stores colliding entries in a per-bucket list outside the array; open addressing stores every entry in the array itself and probes other slots on collision. Open addressing is more cache-friendly but needs tombstones for deletion and degrades sharply as the table fills.' },
    { id: 'cs-ds-c9', front: 'Why does deletion in an open-addressing hash table need tombstones?', back: 'A lookup probes until it hits an empty slot. If a deleted entry were simply emptied, any key that probed past it would become unreachable. A tombstone marks "deleted but keep probing".' },
    { id: 'cs-ds-c10', front: 'Why must a hash table rehash every entry when it resizes?', back: 'Each entry\'s index is hash mod capacity. Changing the capacity changes the index for most keys, so the entries must be re-inserted into the new array; they cannot simply be copied to the same positions.' },
    { id: 'cs-ds-c11', front: 'What is the hash/equals contract?', back: 'If two keys are equal, they must produce the same hash. Violating it puts equal keys in different buckets, so lookups fail. The converse is not required: unequal keys may share a hash (a collision).' },
    { id: 'cs-ds-c12', front: 'What happens if you mutate an object while it is a key in a hash table?', back: 'Its hash changes but it stays in the bucket chosen by the old hash, so lookups by the new value miss and lookups by the old value find the wrong contents. Keys must be effectively immutable.' },
    { id: 'cs-ds-c13', front: 'What is the worst-case lookup time in a hash table, and when does it happen?', back: 'O(n), when all keys collide into one bucket. Adversarial inputs can force this (hash flooding), which is why languages randomize string hash seeds and Java converts long chains to red-black trees.' },
    { id: 'cs-ds-c14', front: 'Why is a linked-list traversal so much slower than an array traversal of the same length?', back: 'Each node is a pointer chase to a scattered address, so the CPU must wait for one memory access (~100 ns) before it can start the next. Array elements are contiguous, so one cache line serves many elements and the prefetcher loads upcoming lines in advance.' },
    { id: 'cs-ds-c15', front: 'When is a linked list genuinely the right choice over an array?', back: 'When you already hold a reference to the node and need O(1) unlink or splice (LRU caches, allocator free lists, intrusive kernel lists), or when element addresses must stay stable across insertions.' },
    { id: 'cs-ds-c16', front: 'Why does an LRU cache combine a hash map with a doubly linked list?', back: 'The map gives O(1) key lookup to the node; the doubly linked list gives O(1) move-to-front and O(1) eviction from the tail. Either structure alone would make one of get or put O(n).' },
    { id: 'cs-ds-c17', front: 'Why is removing the front element of a plain array-backed list O(n)?', back: 'Every remaining element shifts one position left to close the gap. A queue should instead use a ring buffer or a deque, which advance a head index in O(1).' },
    { id: 'cs-ds-c18', front: 'How does a ring buffer distinguish "full" from "empty" when head == tail?', back: 'Keep an explicit count, leave one slot permanently unused (full means (tail + 1) mod cap == head), or use monotonically increasing indices masked by a power-of-two capacity so full is tail - head == capacity.' },
    { id: 'cs-ds-c19', front: 'How do you build a FIFO queue from two stacks with amortized O(1) operations?', back: 'Enqueue pushes onto an "in" stack. Dequeue pops from an "out" stack; when out is empty, pop everything from in and push onto out. Each element is moved at most once, so total work is O(n) over n operations.' },
    { id: 'cs-ds-c20', front: 'What does in-order traversal of a binary search tree produce?', back: 'The keys in sorted ascending order, because the BST invariant places all smaller keys in the left subtree and all larger keys in the right subtree of every node.' },
    { id: 'cs-ds-c21', front: 'How do you delete a node with two children from a BST?', back: 'Replace its key with its in-order successor (the minimum of the right subtree, which has at most one child), then delete that successor node from the right subtree.' },
    { id: 'cs-ds-c22', front: 'AVL tree vs red-black tree: how do their balance guarantees differ, and which should you prefer?', back: 'AVL keeps sibling heights within 1 (height ≤ ~1.44 log n) for the fastest lookups but more rotations. Red-black allows height up to 2 log(n+1) with at most a constant number of rotations per update, so it wins for write-heavy workloads. Most standard libraries pick red-black.' },
    { id: 'cs-ds-c23', front: 'What does a tree rotation do, and what does it preserve?', back: 'It rewires a node and one child in O(1) so the child becomes the parent, shifting one unit of height between the two subtrees. The in-order sequence of keys is unchanged, so the BST invariant still holds.' },
    { id: 'cs-ds-c24', front: 'Why do databases use B-trees rather than binary search trees for indexes?', back: 'Disk and SSD I/O happens in blocks of several kilobytes. A B-tree node fills a whole block with hundreds of keys, so fanout is huge and height is only 3-4 even for billions of keys, meaning a lookup needs only a few block reads.' },
    { id: 'cs-ds-c25', front: 'What does a B+ tree add over a B-tree, and why do storage engines prefer it?', back: 'All values live in the leaves and the leaves are linked in key order. Internal nodes hold only keys, so more fit per block, and range scans stream through the leaf chain sequentially without revisiting internal nodes.' },
    { id: 'cs-ds-c26', front: 'What can a balanced BST do that a hash table cannot?', back: 'Ordered operations: sorted iteration, min/max, predecessor/successor (floor/ceiling), and range queries in O(log n + k). It also has a predictable O(log n) worst case with no resize spikes.' },
    { id: 'cs-ds-c27', front: 'How are parent and children located in an array-backed binary heap (0-indexed)?', back: 'Children of index i are at 2i + 1 and 2i + 2; the parent of index i is at (i - 1) // 2. Completeness of the tree guarantees no gaps in the array.' },
    { id: 'cs-ds-c28', front: 'Why is bottom-up heapify O(n) rather than O(n log n)?', back: 'Sift-down cost is proportional to a node\'s height, and most nodes are near the bottom: half the nodes are leaves (cost 0), a quarter have height 1, and so on. The sum Σ (n / 2^h) × h converges to O(n). Building by n separate pushes is O(n log n).' },
    { id: 'cs-ds-c29', front: 'How do you find the k largest elements of a stream in O(n log k) space-efficiently?', back: 'Keep a min-heap of size k. Push each element; if the heap exceeds k, pop the minimum. The heap always holds the k largest seen so far, and each operation costs O(log k).' },
    { id: 'cs-ds-c30', front: 'Adjacency list vs adjacency matrix: when do you choose each?', back: 'Adjacency list uses O(V + E) space and iterates neighbors in O(degree): the default for sparse graphs. Adjacency matrix uses O(V²) space but answers "is there an edge u-v?" in O(1): choose it for dense graphs or small V with frequent edge tests.' }
  ],

  quizQuestions: [
    {
      id: 'cs-ds-q1',
      question: 'A dynamic array grows by adding exactly 100 slots each time it fills. What is the total copying cost of n appends?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(100n)'],
      correctAnswer: 2,
      explanation: 'With additive growth the array resizes n/100 times and each resize copies the whole current contents, giving 100 + 200 + ... + n = O(n²). Geometric growth bounds the copies by a geometric series and gives O(n).'
    },
    {
      id: 'cs-ds-q2',
      question: 'A vector with capacity 8 and 8 elements receives one more push_back. Which statement is true?',
      options: ['Only the new element is written; cost O(1)', 'All 8 elements are moved to a new block; existing pointers into the vector now dangle', 'The vector refuses the insert until reserve is called', 'The 8 elements are shifted right by one slot'],
      correctAnswer: 1,
      explanation: 'Capacity is exhausted, so the vector allocates a larger block, moves every element, and frees the old block. References and iterators into the old block are invalidated. This one operation is O(n); appends remain amortized O(1).'
    },
    {
      id: 'cs-ds-q3',
      question: 'Two different keys produce the same value from hash(key) mod capacity. What is this called and what does the table do?',
      options: ['A hash/equals violation; the insert is rejected', 'A collision; the table resolves it by chaining or probing', 'A rehash; the table doubles immediately', 'A tombstone; the old key is marked deleted'],
      correctAnswer: 1,
      explanation: 'Collisions are normal and unavoidable. The table stores both entries, either in a per-bucket chain or by probing to another slot in open addressing. A resize is triggered by load factor, not by a single collision.'
    },
    {
      id: 'cs-ds-q4',
      question: 'An open-addressing hash table with linear probing simply sets a slot to empty when a key is deleted. What can go wrong?',
      options: ['Nothing; deletion in open addressing is always safe', 'Later inserts fail because the slot is permanently reserved', 'Keys that were inserted by probing past that slot become unreachable', 'The load factor becomes negative'],
      correctAnswer: 2,
      explanation: 'Lookups stop probing when they hit an empty slot. A key that originally probed through the now-empty slot will never be reached. Tombstones mark the slot as "deleted, keep probing" to avoid this.'
    },
    {
      id: 'cs-ds-q5',
      question: 'A class overrides equals so two objects with the same id are equal, but does not override hashCode. What happens when they are used as HashMap keys?',
      options: ['The map treats them as one key as expected', 'Both are stored, and a lookup with an equal object may miss', 'A runtime exception is thrown on insert', 'The map falls back to a linear scan'],
      correctAnswer: 1,
      explanation: 'Without a matching hashCode, equal objects usually hash to different buckets. The map never compares them with equals, so it stores both and get() with a fresh equal object looks in the wrong bucket. Equal keys must hash equally.'
    },
    {
      id: 'cs-ds-q6',
      question: 'Why do CPython and Java randomize string hashing per process?',
      options: ['To spread keys more evenly across buckets for better average performance', 'To prevent attackers from crafting many keys that collide and forcing O(n) lookups', 'To make iteration order unpredictable for security', 'Because hash values must differ between processes for IPC'],
      correctAnswer: 1,
      explanation: 'With a fixed hash function an attacker can precompute thousands of colliding keys (hash flooding), turning each insert into O(n) and stalling a server. A per-process random seed makes such collisions unpredictable.'
    },
    {
      id: 'cs-ds-q7',
      question: 'You need to insert an element in the middle of a sequence of 10,000 ints, and you already have an iterator to the position. Which is likely faster in practice?',
      options: ['A doubly linked list, because insertion is O(1)', 'A dynamic array, because the memmove of contiguous ints is faster than the allocation and pointer writes', 'They are identical because both are O(1) at the known position', 'A singly linked list, because it stores fewer pointers'],
      correctAnswer: 1,
      explanation: 'The linked-list insert allocates a node and writes pointers to scattered memory; the vector shifts a contiguous block with a highly optimized memmove that the cache and prefetcher love. For small elements the vector wins up to surprisingly large sizes. The Big-O advantage of the list only pays off for large elements or huge n.'
    },
    {
      id: 'cs-ds-q8',
      question: 'In an LRU cache built from a hash map and a doubly linked list, why must the list be doubly linked rather than singly linked?',
      options: ['Singly linked lists cannot store key-value pairs', 'Moving a node to the front requires unlinking it in O(1), which needs access to its predecessor', 'Doubly linked lists use less memory', 'The hash map can only store pointers to doubly linked nodes'],
      correctAnswer: 1,
      explanation: 'On get(key) the map returns the node directly, and it must be unlinked from its current position. With a singly linked list you would have to walk from the head to find the predecessor: O(n). The prev pointer makes unlink O(1).'
    },
    {
      id: 'cs-ds-q9',
      question: 'A ring buffer of capacity 4 has head = 3 and holds 2 elements. After one enqueue, where does the new element go?',
      options: ['Index 4', 'Index 1', 'Index 0', 'Index 3'],
      correctAnswer: 1,
      explanation: 'With head = 3 and count = 2, the elements occupy indices 3 and 0 (wrapping). The next tail is (head + count) mod 4 = 5 mod 4 = 1. Wraparound is the whole point of a ring buffer: no shifting, no growth.'
    },
    {
      id: 'cs-ds-q10',
      question: 'In Python, which operation on a list of one million elements is O(n)?',
      options: ['lst.append(x)', 'lst.pop()', 'lst.pop(0)', 'lst[500000]'],
      correctAnswer: 2,
      explanation: 'pop(0) removes the first element and shifts the remaining 999,999 left. append and pop at the end are amortized O(1), and indexing is O(1). Use collections.deque for O(1) pops from the front.'
    },
    {
      id: 'cs-ds-q11',
      question: 'Keys 1, 2, 3, ..., 1000 are inserted in order into a plain (unbalanced) BST. What is the cost of then searching for 1000?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswer: 2,
      explanation: 'Each key is larger than all previous ones, so every node has only a right child and the tree is a chain of height 1000. Searching for the last key walks all 1000 nodes. Balanced trees exist precisely to prevent this.'
    },
    {
      id: 'cs-ds-q12',
      question: 'You need a map with fast lookups and frequent inserts and deletes, plus occasional sorted iteration. Which structure best fits?',
      options: ['Hash table', 'AVL tree', 'Red-black tree', 'Sorted dynamic array'],
      correctAnswer: 2,
      explanation: 'Sorted iteration rules out the hash table. A sorted array has O(n) inserts. Between the balanced trees, red-black does fewer rotations per update than AVL, which favors write-heavy workloads while still giving O(log n) lookups and in-order traversal.'
    },
    {
      id: 'cs-ds-q13',
      question: 'A B+ tree index has fanout 500 and holds 125 million keys. Roughly how many block reads does a point lookup need?',
      options: ['About 3-4', 'About 27', 'About 500', 'About 125 million / 500'],
      correctAnswer: 0,
      explanation: 'Height is about log base 500 of 125 million, which is a little over 3, so a lookup touches 3-4 nodes, each one block read. A binary tree would need about 27 levels (log base 2), each potentially a separate disk read.'
    },
    {
      id: 'cs-ds-q14',
      question: 'Why do B+ trees link their leaf nodes together in key order?',
      options: ['To make the tree height smaller', 'So range scans can walk sequentially through leaves without revisiting internal nodes', 'To allow duplicate keys', 'So that deletes never require merging nodes'],
      correctAnswer: 1,
      explanation: 'A query like "all rows with id between 100 and 5000" finds the first leaf with one descent and then follows leaf links, reading blocks sequentially. Without the links each successor would require another descent from the root.'
    },
    {
      id: 'cs-ds-q15',
      question: 'Which sequence of node values, read as a 0-indexed array, is a valid min-heap?',
      options: ['[1, 5, 3, 4, 2]', '[2, 1, 3, 4, 5]', '[1, 3, 2, 7, 5, 4]', '[1, 2, 3, 0, 4]'],
      correctAnswer: 2,
      explanation: 'Check every parent against children at 2i+1 and 2i+2. In [1, 3, 2, 7, 5, 4]: 1 ≤ 3, 2; 3 ≤ 7, 5; 2 ≤ 4. The first option fails at index 1 (5 > child 2 at index 4); the second fails at the root (2 > 1); the last fails at index 1 (2 > child 0 at index 3).'
    },
    {
      id: 'cs-ds-q16',
      question: 'What is the time complexity of building a heap from n unordered elements using bottom-up heapify, compared with pushing them one at a time?',
      options: ['Both are O(n log n)', 'Heapify is O(n); n pushes is O(n log n)', 'Heapify is O(n log n); n pushes is O(n)', 'Both are O(n)'],
      correctAnswer: 1,
      explanation: 'Bottom-up heapify sifts down each non-leaf; most nodes are near the bottom and sift only a little, so the total is O(n). Each push sifts up to O(log n) levels, giving O(n log n) for n pushes. This is a standard follow-up question.'
    },
    {
      id: 'cs-ds-q17',
      question: 'After pop() removes the root of a binary heap, how is the heap repaired?',
      options: ['The smaller child is promoted repeatedly up to the root', 'The last array element is moved to the root and sifted down', 'The array is re-sorted', 'The root\'s left child becomes the new root and the right subtree is re-inserted'],
      correctAnswer: 1,
      explanation: 'Moving the last element to the root keeps the tree complete (no gaps in the array). Sifting it down, swapping with the smaller child until the heap property holds, costs O(log n). Re-sorting would be O(n log n).'
    },
    {
      id: 'cs-ds-q18',
      question: 'Dijkstra\'s algorithm with a library heap that lacks decrease-key: how do you handle a node whose distance improves after it has already been pushed?',
      options: ['Search the heap for the old entry and update it in place', 'Push a new entry with the better distance and skip stale entries when they are popped', 'Rebuild the heap from scratch', 'It cannot be done; a Fibonacci heap is required'],
      correctAnswer: 1,
      explanation: 'Lazy deletion: push (new_dist, node) and, on pop, discard any entry whose distance is larger than the best known for that node. The heap may hold duplicates, giving O(E log E) instead of O(E log V), but that is the same order for simple graphs.'
    },
    {
      id: 'cs-ds-q19',
      question: 'A social graph has 1 billion users and about 100 billion friendships. Which representation is feasible?',
      options: ['Adjacency matrix, because edge lookups are O(1)', 'Adjacency list, because space is O(V + E) rather than O(V²)', 'Adjacency matrix stored as bits to save space', 'Neither; graphs this size require a tree'],
      correctAnswer: 1,
      explanation: 'An adjacency matrix needs V² = 10^18 cells, even as bits far beyond feasible. An adjacency list stores roughly 100 billion neighbor entries, which is large but proportional to the actual data. Real graphs are sparse, so lists are the default.'
    },
    {
      id: 'cs-ds-q20',
      question: 'You must answer many queries of the form "does an edge exist between u and v?" on a dense graph with 2,000 vertices. Which representation gives the fastest queries?',
      options: ['Adjacency list with unsorted neighbor arrays', 'Edge list sorted by source', 'Adjacency matrix', 'Adjacency list with linked-list neighbors'],
      correctAnswer: 2,
      explanation: 'A 2000 × 2000 matrix is 4 million cells, trivial in memory, and answers each edge query with one O(1) array access. An adjacency list needs O(degree) per query (or a hash set per vertex), and a sorted edge list needs a binary search.'
    }
  ]
};
