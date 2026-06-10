// Bug-fix practice problems — given a broken snippet, fix it.
//
// 100 problems total, split across Python (34), JavaScript (34), Java (32),
// with at least one Easy / Medium / Hard per language and a roughly even
// difficulty spread overall.
//
// `number` is per-language (1..N within that language) so the first two
// problems of each language stay free regardless of which language filter
// the user has active.
//
// Three execution backends:
//   - python:     code runs inside the Pyodide WebView, same harness as Blind75
//   - javascript: code runs natively inside the WebView via `new Function`
//   - java:       no execution; graded by a rules engine in src/practice/gradeJava.ts
//                 (mustContain / mustNotContain substrings or regexes, plus
//                 optional accepted-fix string matches)

export type BugFixLanguage = 'python' | 'javascript' | 'java';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface BugFixTestCase {
  input: any[];
  expected: any;
}

export type BugFixRuleType = 'mustContain' | 'mustNotContain' | 'acceptedFix';

export interface BugFixRule {
  /** Human-readable description shown in the results modal. */
  label: string;
  type: BugFixRuleType;
  /**
   * For mustContain / mustNotContain: a substring or regex source.
   * For acceptedFix: a full code snippet — whitespace-normalized equality.
   */
  pattern: string;
  /** Treat `pattern` as a regex (mustContain / mustNotContain only). */
  regex?: boolean;
}

export interface BugFixProblem {
  id: string;
  /** Per-language 1-based ordering. First two of each language are free. */
  number: number;
  language: BugFixLanguage;
  title: string;
  difficulty: Difficulty;
  topic: string;
  /** What the code is supposed to do. */
  statement: string;
  /** The broken starter shown in the editor. User edits in place to fix it. */
  buggyCode: string;
  /** For JS / Python — the function name to call. */
  functionName?: string;
  /** Signature line displayed above the editor. */
  functionSignature?: string;
  /** Visible test cases (JS / Python). */
  examples?: BugFixTestCase[];
  /** Hidden test cases (JS / Python). */
  hiddenTests?: BugFixTestCase[];
  /** Rule list for Java grading. */
  rules?: BugFixRule[];
  /** Optional nudge shown before reveal. */
  hint?: string;
  /** What the bug actually was — shown after a user opens the lightbulb modal. */
  explanation: string;
}

// =============================================================================
// PYTHON (34)
// =============================================================================
const pythonProblems: BugFixProblem[] = [
  {
    id: 'py-off-by-one-sum',
    number: 1,
    language: 'python',
    title: 'Sum 1 to N (Inclusive)',
    difficulty: 'Easy',
    topic: 'Loops',
    statement:
      'Return the sum of every integer from 1 through N, inclusive. The code below misses both endpoints.',
    functionName: 'sum_to',
    functionSignature: 'def sum_to(n: int) -> int:',
    buggyCode:
      'def sum_to(n: int) -> int:\n    total = 0\n    for i in range(n):\n        total += i\n    return total\n',
    hint: 'range(n) yields 0, 1, ..., n-1.',
    explanation:
      'range(n) produces 0..n-1. To cover 1..n inclusive, use range(1, n + 1).',
    examples: [
      { input: [5], expected: 15 },
      { input: [1], expected: 1 },
    ],
    hiddenTests: [
      { input: [10], expected: 55 },
      { input: [100], expected: 5050 },
      { input: [0], expected: 0 },
    ],
  },
  {
    id: 'py-empty-max',
    number: 2,
    language: 'python',
    title: 'Safe Maximum',
    difficulty: 'Easy',
    topic: 'Built-ins',
    statement:
      'Return the largest number in a list. If the list is empty, return None instead of crashing.',
    functionName: 'safe_max',
    functionSignature: 'def safe_max(nums: list[int]):',
    buggyCode:
      'def safe_max(nums: list[int]):\n    return max(nums)\n',
    hint: 'max() on an empty iterable raises ValueError. Guard the empty case first.',
    explanation:
      'Add an early return: `if not nums: return None`. Alternatively, `max(nums, default=None)`.',
    examples: [
      { input: [[1, 5, 3]], expected: 5 },
      { input: [[]], expected: null },
    ],
    hiddenTests: [
      { input: [[-1, -2, -3]], expected: -1 },
      { input: [[7]], expected: 7 },
      { input: [[2, 2, 2]], expected: 2 },
    ],
  },
  {
    id: 'py-integer-division',
    number: 3,
    language: 'python',
    title: 'Average of a List',
    difficulty: 'Easy',
    topic: 'Arithmetic',
    statement:
      'Return the arithmetic mean of a list of integers. For an empty list, return 0.0.',
    functionName: 'average',
    functionSignature: 'def average(nums: list[int]) -> float:',
    buggyCode:
      'def average(nums: list[int]) -> float:\n    if not nums:\n        return 0.0\n    return sum(nums) // len(nums)\n',
    hint: 'Look at the division operator.',
    explanation:
      '`//` is floor division and returns an int. Average of [1, 2] becomes 1, not 1.5. Use `/` for float division.',
    examples: [
      { input: [[1, 2]], expected: 1.5 },
      { input: [[10, 20, 30]], expected: 20.0 },
    ],
    hiddenTests: [
      { input: [[5]], expected: 5.0 },
      { input: [[]], expected: 0.0 },
      { input: [[1, 2, 3, 4]], expected: 2.5 },
    ],
  },
  {
    id: 'py-mutable-default',
    number: 4,
    language: 'python',
    title: 'Mutable Default Argument',
    difficulty: 'Medium',
    topic: 'Functions',
    statement:
      'append_item should return a brand-new list containing only the passed-in item on each call. But repeated calls accumulate values across invocations.',
    functionName: 'append_item',
    functionSignature: 'def append_item(item, lst=[]) -> list:',
    buggyCode:
      'def append_item(item, lst=[]) -> list:\n    lst.append(item)\n    return lst\n',
    hint: 'Python evaluates default arguments once, at definition time.',
    explanation:
      'The default `[]` is created once and reused across every call. Use `lst=None` as the sentinel: `if lst is None: lst = []`. Or, since this function should return a fresh list, just `return [item]`.',
    examples: [
      { input: [1], expected: [1] },
      { input: [2], expected: [2] },
    ],
    hiddenTests: [
      { input: ['a'], expected: ['a'] },
      { input: [42], expected: [42] },
      { input: [null], expected: [null] },
    ],
  },
  {
    id: 'py-is-vs-equals',
    number: 5,
    language: 'python',
    title: 'Is vs Equals',
    difficulty: 'Easy',
    topic: 'Operators',
    statement:
      'Return True when the input string equals "yes". The current code uses `is` instead of `==`, so it fails for strings built at runtime.',
    functionName: 'is_yes',
    functionSignature: 'def is_yes(s: str) -> bool:',
    buggyCode:
      'def is_yes(s: str) -> bool:\n    return s is "yes"\n',
    hint: '`is` checks object identity. `==` checks value.',
    explanation:
      'Short string literals are sometimes interned, so `"yes" is "yes"` may appear to work — but anything built at runtime (input(), concatenation, slicing) lives in a fresh object. Use `==` for value comparison.',
    examples: [
      { input: ['yes'], expected: true },
      { input: ['no'], expected: false },
    ],
    hiddenTests: [
      { input: ['ye' + 's'], expected: true },
      { input: [''], expected: false },
      { input: ['YES'], expected: false },
    ],
  },
  {
    id: 'py-dict-keyerror',
    number: 6,
    language: 'python',
    title: 'Safe Dict Lookup',
    difficulty: 'Easy',
    topic: 'Dictionaries',
    statement:
      'Return the count for `key` from the dict `d`. If the key is missing, return 0 instead of raising KeyError.',
    functionName: 'get_count',
    functionSignature: 'def get_count(d: dict, key) -> int:',
    buggyCode:
      'def get_count(d: dict, key) -> int:\n    return d[key]\n',
    hint: 'd[missing_key] raises. There is a method that takes a default.',
    explanation:
      '`d.get(key, 0)` returns the value if present, otherwise the default. No exception, no need to check membership first.',
    examples: [
      { input: [{ apples: 3 }, 'apples'], expected: 3 },
      { input: [{ apples: 3 }, 'pears'], expected: 0 },
    ],
    hiddenTests: [
      { input: [{}, 'x'], expected: 0 },
      { input: [{ a: 1, b: 2 }, 'b'], expected: 2 },
      { input: [{ a: 0 }, 'a'], expected: 0 },
    ],
  },
  {
    id: 'py-string-no-mutate',
    number: 7,
    language: 'python',
    title: 'Strings Are Immutable',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      'Return the lowercase version of `s`. The current code calls `s.lower()` but then returns the original string.',
    functionName: 'lower_str',
    functionSignature: 'def lower_str(s: str) -> str:',
    buggyCode:
      'def lower_str(s: str) -> str:\n    s.lower()\n    return s\n',
    hint: 'Python strings are immutable. .lower() returns a new string, it doesn\'t modify `s` in place.',
    explanation:
      'Reassign or return the result directly: `return s.lower()`. The original `s` is never modified — `.lower()` builds a new string and the buggy code throws it away.',
    examples: [
      { input: ['HELLO'], expected: 'hello' },
      { input: ['Mixed'], expected: 'mixed' },
    ],
    hiddenTests: [
      { input: [''], expected: '' },
      { input: ['ALREADY'], expected: 'already' },
      { input: ['lower'], expected: 'lower' },
    ],
  },
  {
    id: 'py-trailing-separator',
    number: 8,
    language: 'python',
    title: 'Trailing Separator',
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      'Join the strings in `parts` with commas. The current implementation leaves a trailing comma.',
    functionName: 'comma_join',
    functionSignature: 'def comma_join(parts: list[str]) -> str:',
    buggyCode:
      'def comma_join(parts: list[str]) -> str:\n    result = ""\n    for p in parts:\n        result += p + ","\n    return result\n',
    hint: 'Python has a built-in for this exact job.',
    explanation:
      'Use `",".join(parts)` — it inserts the separator between elements only, never before the first or after the last. Manually building a string with `+` is slower and easy to get wrong on edge cases (empty list, last separator).',
    examples: [
      { input: [['a', 'b', 'c']], expected: 'a,b,c' },
      { input: [['hello']], expected: 'hello' },
    ],
    hiddenTests: [
      { input: [[]], expected: '' },
      { input: [['x', 'y']], expected: 'x,y' },
      { input: [['one', 'two', 'three', 'four']], expected: 'one,two,three,four' },
    ],
  },
  {
    id: 'py-modify-while-iter',
    number: 9,
    language: 'python',
    title: 'Modify While Iterating',
    difficulty: 'Medium',
    topic: 'Lists',
    statement:
      'Return a new list containing only the odd numbers from `nums`. The current code skips elements because it modifies the list during iteration.',
    functionName: 'odds_only',
    functionSignature: 'def odds_only(nums: list[int]) -> list[int]:',
    buggyCode:
      'def odds_only(nums: list[int]) -> list[int]:\n    for n in nums:\n        if n % 2 == 0:\n            nums.remove(n)\n    return nums\n',
    hint: 'Removing items while looping over the same list shifts indices and the iterator skips ahead.',
    explanation:
      'Build a new list with a comprehension: `return [n for n in nums if n % 2 != 0]`. Mutating the list you\'re iterating over causes the iterator to skip the element after each removal.',
    examples: [
      { input: [[1, 2, 3, 4, 5]], expected: [1, 3, 5] },
      { input: [[2, 4, 6]], expected: [] },
    ],
    hiddenTests: [
      { input: [[2, 2, 4, 4, 6, 6]], expected: [] },
      { input: [[1, 3, 5]], expected: [1, 3, 5] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: 'py-float-comparison',
    number: 10,
    language: 'python',
    title: 'Float Equality',
    difficulty: 'Medium',
    topic: 'Arithmetic',
    statement:
      'Return True if `x` is approximately equal to 1.0 (within 1e-9). The current implementation uses `==`, which fails because 0.1 + 0.9 isn\'t exactly 1.0 in floating point.',
    functionName: 'is_one',
    functionSignature: 'def is_one(x: float) -> bool:',
    buggyCode:
      'def is_one(x: float) -> bool:\n    return x == 1.0\n',
    hint: 'Float arithmetic accumulates tiny errors. Compare with a tolerance.',
    explanation:
      'Use `abs(x - 1.0) < 1e-9`. Direct equality on floats fails for results of arithmetic — 0.1 + 0.9 is 0.9999999999999999, not 1.0. The standard library also has `math.isclose()`.',
    examples: [
      { input: [1.0], expected: true },
      { input: [0.1 + 0.9], expected: true },
      { input: [1.5], expected: false },
    ],
    hiddenTests: [
      { input: [0.999999999999], expected: true },
      { input: [2.0], expected: false },
      { input: [0.0], expected: false },
    ],
  },
  {
    id: 'py-dict-merge',
    number: 11,
    language: 'python',
    title: 'Dict Merge Priority',
    difficulty: 'Medium',
    topic: 'Dictionaries',
    statement:
      'Merge two dicts. When the same key exists in both, the value from `overrides` should win. The current code gets the priority backwards.',
    functionName: 'merge_prefs',
    functionSignature: 'def merge_prefs(defaults: dict, overrides: dict) -> dict:',
    buggyCode:
      'def merge_prefs(defaults: dict, overrides: dict) -> dict:\n    result = overrides.copy()\n    result.update(defaults)\n    return result\n',
    hint: '`dict.update(other)` lets the keys in `other` win.',
    explanation:
      'Start with defaults, then update with overrides: `result = defaults.copy(); result.update(overrides)`. Even cleaner in 3.9+: `return {**defaults, **overrides}` — later keys take precedence.',
    examples: [
      { input: [{ a: 1, b: 2 }, { b: 99 }], expected: { a: 1, b: 99 } },
      { input: [{ x: 1 }, { y: 2 }], expected: { x: 1, y: 2 } },
    ],
    hiddenTests: [
      { input: [{}, { a: 1 }], expected: { a: 1 } },
      { input: [{ a: 1 }, {}], expected: { a: 1 } },
      { input: [{ a: 1, b: 2, c: 3 }, { a: 10, b: 20 }], expected: { a: 10, b: 20, c: 3 } },
    ],
  },
  {
    id: 'py-shallow-copy',
    number: 12,
    language: 'python',
    title: 'Shallow Copy Trap',
    difficulty: 'Medium',
    topic: 'Lists',
    statement:
      '`isolated_append` should return a new list with `x` appended, without modifying the input `items`. It currently mutates the input. The function returns `[len(returned), len(items)]` so you can see both.',
    functionName: 'isolated_append',
    functionSignature: 'def isolated_append(items: list, x) -> list[int]:',
    buggyCode:
      'def isolated_append(items: list, x) -> list[int]:\n    copy = items\n    copy.append(x)\n    return [len(copy), len(items)]\n',
    hint: '`copy = items` doesn\'t copy. Both names refer to the same list.',
    explanation:
      'Assignment binds a name to the same object — it doesn\'t duplicate. Use `copy = list(items)` (or `items[:]` or `items.copy()`) to make an independent list. Then mutating `copy` leaves `items` alone.',
    examples: [
      { input: [[1, 2, 3], 99], expected: [4, 3] },
      { input: [[], 1], expected: [1, 0] },
    ],
    hiddenTests: [
      { input: [[5], 5], expected: [2, 1] },
      { input: [[1, 2], 0], expected: [3, 2] },
      { input: [[10, 20, 30, 40], 50], expected: [5, 4] },
    ],
  },
  {
    id: 'py-recursive-fib',
    number: 13,
    language: 'python',
    title: 'Fibonacci Base Case',
    difficulty: 'Hard',
    topic: 'Recursion',
    statement:
      'Return the n-th Fibonacci number (0-indexed: fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2). The current base case is too eager.',
    functionName: 'fib',
    functionSignature: 'def fib(n: int) -> int:',
    buggyCode:
      'def fib(n: int) -> int:\n    if n <= 1:\n        return 0\n    return fib(n - 1) + fib(n - 2)\n',
    hint: 'What should fib(1) return? The base case lumps it in with fib(0).',
    explanation:
      'fib(0) = 0 and fib(1) = 1. The buggy base case returns 0 for both, so every result collapses to 0. Fix with `if n < 2: return n` — returns 0 for n=0 and 1 for n=1.',
    examples: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [5], expected: 5 },
    ],
    hiddenTests: [
      { input: [2], expected: 1 },
      { input: [3], expected: 2 },
      { input: [10], expected: 55 },
      { input: [15], expected: 610 },
    ],
  },
  {
    id: 'py-grid-shallow',
    number: 14,
    language: 'python',
    title: 'Aliased Grid Rows',
    difficulty: 'Hard',
    topic: 'Lists',
    statement:
      'Build a `rows × cols` grid of zeros, set the top-left cell to 99, then return the value at row 1, column 0. The current grid construction makes every row share storage, so setting [0][0] visibly updates [1][0].',
    functionName: 'grid_check',
    functionSignature: 'def grid_check(rows: int, cols: int) -> int:',
    buggyCode:
      'def grid_check(rows: int, cols: int) -> int:\n    grid = [[0] * cols] * rows\n    grid[0][0] = 99\n    return grid[1][0]\n',
    hint: '`[x] * n` repeats the reference n times. The inner list is the same object across all rows.',
    explanation:
      '`[[0] * cols] * rows` creates one row list and aliases it `rows` times — modifying any row modifies all of them. Build each row independently: `[[0] * cols for _ in range(rows)]`.',
    examples: [
      { input: [3, 3], expected: 0 },
      { input: [2, 2], expected: 0 },
    ],
    hiddenTests: [
      { input: [5, 4], expected: 0 },
      { input: [10, 1], expected: 0 },
      { input: [2, 5], expected: 0 },
    ],
  },
  {
    id: 'py-class-shared-list',
    number: 15,
    language: 'python',
    title: 'Class Attribute Shared',
    difficulty: 'Hard',
    topic: 'Classes',
    statement:
      '`Bag` should give each instance its own list. The test adds `n` items to one bag and returns the count of an unrelated bag — which should be 0, but currently equals `n`.',
    functionName: 'isolation_test',
    functionSignature: 'def isolation_test(n: int) -> int:',
    buggyCode:
      'class Bag:\n    items = []\n    def add(self, x):\n        self.items.append(x)\n    def count(self):\n        return len(self.items)\n\ndef isolation_test(n: int) -> int:\n    a = Bag()\n    for i in range(n):\n        a.add(i)\n    b = Bag()\n    return b.count()\n',
    hint: '`items = []` at the class level is shared across every instance.',
    explanation:
      'Class-level mutable attributes are a classic Python footgun — every instance reads and writes the same list. Move the initialization into `__init__`: `def __init__(self): self.items = []`. Each Bag now gets its own list.',
    examples: [
      { input: [3], expected: 0 },
      { input: [0], expected: 0 },
    ],
    hiddenTests: [
      { input: [10], expected: 0 },
      { input: [1], expected: 0 },
      { input: [100], expected: 0 },
    ],
  },
  {
    id: 'py-recursive-accumulate',
    number: 16,
    language: 'python',
    title: 'Lost Recursive Result',
    difficulty: 'Hard',
    topic: 'Recursion',
    statement:
      'Flatten a nested list (which may contain ints and nested lists) into a single list of ints. The current code recurses on inner lists but throws the result away.',
    functionName: 'flatten',
    functionSignature: 'def flatten(tree: list) -> list[int]:',
    buggyCode:
      'def flatten(tree: list) -> list[int]:\n    result = []\n    for item in tree:\n        if isinstance(item, list):\n            flatten(item)\n        else:\n            result.append(item)\n    return result\n',
    hint: 'The recursive call computes a list but no one captures it.',
    explanation:
      '`flatten(item)` returns the flattened sub-list — but the buggy code never uses that return value. Replace with `result.extend(flatten(item))` so the recursive contribution flows back up.',
    examples: [
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[1, [2, 3], 4]], expected: [1, 2, 3, 4] },
    ],
    hiddenTests: [
      { input: [[[1, 2], [3, [4, 5]]]], expected: [1, 2, 3, 4, 5] },
      { input: [[]], expected: [] },
      { input: [[1, [2, [3, [4, [5]]]]]], expected: [1, 2, 3, 4, 5] },
    ],
  },
  {
    id: 'py-isinstance-bool',
    number: 17,
    language: 'python',
    title: 'Booleans Are Ints',
    difficulty: 'Hard',
    topic: 'Types',
    statement:
      'Return True only when `x` is an integer that is NOT a boolean. The current check accepts `True` and `False` because `bool` is a subclass of `int` in Python.',
    functionName: 'is_pure_int',
    functionSignature: 'def is_pure_int(x) -> bool:',
    buggyCode:
      'def is_pure_int(x) -> bool:\n    return isinstance(x, int)\n',
    hint: '`isinstance(True, int)` is True. You need to exclude bool explicitly.',
    explanation:
      'In Python, `bool` inherits from `int` — `True == 1` and `isinstance(True, int)` is True. Exclude bool with `isinstance(x, int) and not isinstance(x, bool)`.',
    examples: [
      { input: [5], expected: true },
      { input: [true], expected: false },
      { input: [false], expected: false },
    ],
    hiddenTests: [
      { input: [0], expected: true },
      { input: [-3], expected: true },
      { input: ['5'], expected: false },
      { input: [3.14], expected: false },
    ],
  },
  {
    id: "py-sort-returns-none",
    number: 18,
    language: 'python',
    title: "Sort Returns None",
    difficulty: 'Easy',
    topic: "Sorting",
    statement:
      "Return a sorted copy of the list of numbers in ascending order. The function keeps returning nothing useful.",
    functionName: "sorted_copy",
    functionSignature: "def sorted_copy(nums: list[int]) -> list[int]:",
    buggyCode:
      "def sorted_copy(nums: list[int]) -> list[int]:\n    return nums.sort()\n",
    hint: "Check what list.sort() actually returns.",
    explanation:
      "list.sort() sorts in place and returns None, so the function returned None instead of the list. Use sorted(nums), which returns a new sorted list.",
    examples: [
      { input: [[3, 1, 2]], expected: [1, 2, 3] },
    ],
    hiddenTests: [
      { input: [[5]], expected: [5] },
      { input: [[]], expected: [] },
      { input: [[2, 2, 1]], expected: [1, 2, 2] },
    ],
  },
  {
    id: "py-pair-up-to-longest",
    number: 19,
    language: 'python',
    title: "Pair Up to the Longest",
    difficulty: 'Medium',
    topic: "Loops",
    statement:
      "Pair up elements from two lists into [a, b] pairs, padding the shorter list with None so nothing is dropped. Some pairs are going missing.",
    functionName: "pair_up",
    functionSignature: "def pair_up(a: list, b: list) -> list:",
    buggyCode:
      "def pair_up(a: list, b: list) -> list:\n    return [[x, y] for x, y in zip(a, b)]\n",
    hint: "zip() stops as soon as the shorter iterable runs out.",
    explanation:
      "zip() truncates to the shortest input, so extra elements from the longer list were silently dropped. itertools.zip_longest keeps going and pads the missing side with None.",
    examples: [
      { input: [[1, 2, 3], ["a", "b"]], expected: [[1, "a"], [2, "b"], [3, null]] },
    ],
    hiddenTests: [
      { input: [[1], [9, 8, 7]], expected: [[1, 9], [null, 8], [null, 7]] },
      { input: [[1, 2], ["x", "y"]], expected: [[1, "x"], [2, "y"]] },
      { input: [[], [4]], expected: [[null, 4]] },
    ],
  },
  {
    id: "py-numbered-lines",
    number: 20,
    language: 'python',
    title: "Numbered Lines",
    difficulty: 'Easy',
    topic: "Loops",
    statement:
      "Return each item formatted as 'N. item' with numbering starting at 1. The numbers come out shifted.",
    functionName: "number_lines",
    functionSignature: "def number_lines(items: list[str]) -> list[str]:",
    buggyCode:
      "def number_lines(items: list[str]) -> list[str]:\n    return [f\"{i}. {item}\" for i, item in enumerate(items)]\n",
    hint: "enumerate takes an optional second argument.",
    explanation:
      "enumerate() starts counting at 0 by default, so every line was numbered one too low. Pass start=1 to begin numbering at 1.",
    examples: [
      { input: [["alpha", "beta"]], expected: ["1. alpha", "2. beta"] },
    ],
    hiddenTests: [
      { input: [["solo"]], expected: ["1. solo"] },
      { input: [["a", "b", "c"]], expected: ["1. a", "2. b", "3. c"] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: "py-word-count-spaces",
    number: 21,
    language: 'python',
    title: "Counting on Whitespace",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "Count the words in a sentence, where words are separated by any amount of whitespace. Extra spaces are inflating the count.",
    functionName: "word_count",
    functionSignature: "def word_count(text: str) -> int:",
    buggyCode:
      "def word_count(text: str) -> int:\n    return len(text.split(\" \"))\n",
    hint: "Compare text.split(' ') with text.split() on doubled spaces.",
    explanation:
      "split(' ') produces empty strings between consecutive spaces (and even for an empty input), inflating the count. Calling split() with no argument splits on runs of whitespace and ignores leading/trailing space.",
    examples: [
      { input: ["hello   world"], expected: 2 },
    ],
    hiddenTests: [
      { input: [""], expected: 0 },
      { input: ["one two three"], expected: 3 },
      { input: [" padded "], expected: 1 },
    ],
  },
  {
    id: "py-longest-word",
    number: 22,
    language: 'python',
    title: "Longest Word",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "Return the longest word in the list (the tests have no ties). The function keeps picking words that are not the longest.",
    functionName: "longest_word",
    functionSignature: "def longest_word(words: list[str]) -> str:",
    buggyCode:
      "def longest_word(words: list[str]) -> str:\n    return max(words)\n",
    hint: "What does max compare strings by when you don't tell it otherwise?",
    explanation:
      "max(words) compares strings alphabetically, not by length, so 'tiny' beats 'extraordinarily'. Pass key=len so max compares word lengths instead.",
    examples: [
      { input: [["short", "tiny", "extraordinarily"]], expected: "extraordinarily" },
    ],
    hiddenTests: [
      { input: [["pear", "fig", "banana"]], expected: "banana" },
      { input: [["a"]], expected: "a" },
      { input: [["zip", "alphabet"]], expected: "alphabet" },
    ],
  },
  {
    id: "py-or-doesnt-distribute",
    number: 23,
    language: 'python',
    title: "Or Doesn't Distribute",
    difficulty: 'Medium',
    topic: "Logic",
    statement:
      "Return True if the day is Saturday or Sunday, otherwise False. Somehow every day looks like a weekend.",
    functionName: "is_weekend",
    functionSignature: "def is_weekend(day: str) -> bool:",
    buggyCode:
      "def is_weekend(day: str) -> bool:\n    return day == \"Saturday\" or \"Sunday\"\n",
    hint: "How does Python group the expression day == 'Saturday' or 'Sunday'?",
    explanation:
      "The expression parses as (day == 'Saturday') or ('Sunday'), and a non-empty string is truthy, so the function returned the string 'Sunday' for every non-Saturday input. Compare against each value explicitly, or use day in ('Saturday', 'Sunday').",
    examples: [
      { input: ["Monday"], expected: false },
      { input: ["Saturday"], expected: true },
    ],
    hiddenTests: [
      { input: ["Sunday"], expected: true },
      { input: ["Friday"], expected: false },
      { input: ["Wednesday"], expected: false },
    ],
  },
  {
    id: "py-late-binding-lambdas",
    number: 24,
    language: 'python',
    title: "Late Binding Lambdas",
    difficulty: 'Hard',
    topic: "Closures",
    statement:
      "Build one multiplier function per factor, then apply each to x and return the results. Every result is using the same factor.",
    functionName: "scale_all",
    functionSignature: "def scale_all(factors: list[int], x: int) -> list[int]:",
    buggyCode:
      "def scale_all(factors: list[int], x: int) -> list[int]:\n    funcs = []\n    for f in factors:\n        funcs.append(lambda v: v * f)\n    return [fn(x) for fn in funcs]\n",
    hint: "When does each lambda look up f: when it is created, or when it is called?",
    explanation:
      "Closures capture the variable f, not its current value, so by the time the lambdas run, f holds the last factor and every lambda multiplies by it. Bind the value at creation time with a default argument: lambda v, f=f: v * f.",
    examples: [
      { input: [[1, 2, 3], 10], expected: [10, 20, 30] },
    ],
    hiddenTests: [
      { input: [[5, 0], 4], expected: [20, 0] },
      { input: [[2], 7], expected: [14] },
      { input: [[1, 1, 10], 3], expected: [3, 3, 30] },
    ],
  },
  {
    id: "py-round-half-up",
    number: 25,
    language: 'python',
    title: "Round Half Up",
    difficulty: 'Medium',
    topic: "Numbers",
    statement:
      "Round a positive number to the nearest integer, with halves always rounding up (so 2.5 becomes 3). Some halves are rounding the wrong way.",
    functionName: "round_half_up",
    functionSignature: "def round_half_up(x: float) -> int:",
    buggyCode:
      "def round_half_up(x: float) -> int:\n    return round(x)\n",
    hint: "Python's round() does something surprising on exact .5 values.",
    explanation:
      "round() uses banker's rounding: ties go to the nearest even integer, so round(2.5) is 2 and round(4.5) is 4. Adding 0.5 and taking math.floor always rounds halves up.",
    examples: [
      { input: [2.5], expected: 3 },
    ],
    hiddenTests: [
      { input: [0.5], expected: 1 },
      { input: [4.5], expected: 5 },
      { input: [2.4], expected: 2 },
      { input: [3.6], expected: 4 },
    ],
  },
  {
    id: "py-one-shot-generator",
    number: 26,
    language: 'python',
    title: "One-Shot Generator",
    difficulty: 'Hard',
    topic: "Generators",
    statement:
      "Return [sum, max] of the squares of the numbers. The function blows up when it goes back for the max.",
    functionName: "square_stats",
    functionSignature: "def square_stats(nums: list[int]) -> list[int]:",
    buggyCode:
      "def square_stats(nums: list[int]) -> list[int]:\n    squares = (n * n for n in nums)\n    total = sum(squares)\n    biggest = max(squares)\n    return [total, biggest]\n",
    hint: "How many times can you iterate over a generator expression?",
    explanation:
      "A generator can only be consumed once: sum() exhausts it, so max() sees an empty iterator and raises ValueError. Build a list of squares instead so it can be traversed twice.",
    examples: [
      { input: [[1, 2, 3]], expected: [14, 9] },
    ],
    hiddenTests: [
      { input: [[4]], expected: [16, 16] },
      { input: [[2, 5]], expected: [29, 25] },
      { input: [[1, 1, 1]], expected: [3, 1] },
    ],
  },
  {
    id: "py-needle-in-the-values",
    number: 27,
    language: 'python',
    title: "Needle in the Values",
    difficulty: 'Easy',
    topic: "Dictionaries",
    statement:
      "Return True if target appears among the dictionary's values. It never seems to find anything.",
    functionName: "has_value",
    functionSignature: "def has_value(d: dict, target: int) -> bool:",
    buggyCode:
      "def has_value(d: dict, target: int) -> bool:\n    return target in d\n",
    hint: "What does the in operator check on a dict by default?",
    explanation:
      "target in d checks the dictionary's keys, not its values, so value lookups always failed. Use target in d.values().",
    examples: [
      { input: [{"a": 1, "b": 2}, 2], expected: true },
    ],
    hiddenTests: [
      { input: [{"x": 5}, 5], expected: true },
      { input: [{"a": 1}, 7], expected: false },
      { input: [{}, 1], expected: false },
    ],
  },
  {
    id: "py-append-then-return",
    number: 28,
    language: 'python',
    title: "Append Then Return",
    difficulty: 'Easy',
    topic: "Lists",
    statement:
      "Append x to the list and return the updated list. Callers keep receiving nothing.",
    functionName: "add_item",
    functionSignature: "def add_item(items: list, x: int) -> list:",
    buggyCode:
      "def add_item(items: list, x: int) -> list:\n    return items.append(x)\n",
    hint: "What value does list.append() give back?",
    explanation:
      "list.append() mutates the list in place and returns None, so the function returned None. Append first, then return the list on its own line.",
    examples: [
      { input: [[1, 2], 3], expected: [1, 2, 3] },
    ],
    hiddenTests: [
      { input: [[], 9], expected: [9] },
      { input: [[7, 7], 7], expected: [7, 7, 7] },
    ],
  },
  {
    id: "py-countdown-range",
    number: 29,
    language: 'python',
    title: "Countdown",
    difficulty: 'Easy',
    topic: "Loops",
    statement:
      "Return the numbers from n down to 1. The list keeps coming back empty.",
    functionName: "countdown",
    functionSignature: "def countdown(n: int) -> list[int]:",
    buggyCode:
      "def countdown(n: int) -> list[int]:\n    return list(range(n, 0))\n",
    hint: "range needs to be told which direction to walk.",
    explanation:
      "range(n, 0) uses the default step of +1, and since n is already above 0 the range is empty. Use range(n, 0, -1) to count downward.",
    examples: [
      { input: [3], expected: [3, 2, 1] },
    ],
    hiddenTests: [
      { input: [1], expected: [1] },
      { input: [5], expected: [5, 4, 3, 2, 1] },
      { input: [0], expected: [] },
    ],
  },
  {
    id: "py-inclusive-slice",
    number: 30,
    language: 'python',
    title: "Inclusive Slice",
    difficulty: 'Easy',
    topic: "Slicing",
    statement:
      "Return the elements from index i through index j, including both endpoints. The last element keeps getting cut off.",
    functionName: "take_between",
    functionSignature: "def take_between(items: list, i: int, j: int) -> list:",
    buggyCode:
      "def take_between(items: list, i: int, j: int) -> list:\n    return items[i:j]\n",
    hint: "Slices stop just before their end index.",
    explanation:
      "Slicing is end-exclusive: items[i:j] stops at index j - 1, so the element at j was dropped. Use items[i:j + 1] to include both endpoints.",
    examples: [
      { input: [[10, 20, 30, 40, 50], 1, 3], expected: [20, 30, 40] },
    ],
    hiddenTests: [
      { input: [[1, 2, 3], 0, 2], expected: [1, 2, 3] },
      { input: [[7], 0, 0], expected: [7] },
      { input: [["a", "b", "c", "d"], 2, 3], expected: ["c", "d"] },
    ],
  },
  {
    id: "py-strip-is-not-removeprefix",
    number: 31,
    language: 'python',
    title: "Strip Is Not Remove Prefix",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "Remove prefix from the start of s if it is there, leaving everything else untouched. Letters are vanishing from the wrong places.",
    functionName: "drop_prefix",
    functionSignature: "def drop_prefix(s: str, prefix: str) -> str:",
    buggyCode:
      "def drop_prefix(s: str, prefix: str) -> str:\n    return s.strip(prefix)\n",
    hint: "strip() treats its argument as a set of characters, not a substring.",
    explanation:
      "s.strip(prefix) removes any of the prefix's characters from both ends, so 'tomato'.strip('tom') also eats the trailing 'to'. Check startswith and slice off len(prefix) characters (or use str.removeprefix).",
    examples: [
      { input: ["tomato", "tom"], expected: "ato" },
    ],
    hiddenTests: [
      { input: ["statement", "st"], expected: "atement" },
      { input: ["noon", "no"], expected: "on" },
      { input: ["raw", "tom"], expected: "raw" },
    ],
  },
  {
    id: "py-price-tag-format",
    number: 32,
    language: 'python',
    title: "Price Tag",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "Format the amount as a price with a dollar sign and exactly two decimal places. The output has far too many digits.",
    functionName: "price_tag",
    functionSignature: "def price_tag(amount: float) -> str:",
    buggyCode:
      "def price_tag(amount: float) -> str:\n    return f\"${amount:2f}\"\n",
    hint: "Look closely at the format spec; something tiny is missing.",
    explanation:
      "The format spec '2f' means minimum width 2 with the default six decimal places; the dot is missing. Use '.2f' to request exactly two digits after the decimal point.",
    examples: [
      { input: [3.5], expected: "$3.50" },
    ],
    hiddenTests: [
      { input: [10], expected: "$10.00" },
      { input: [0.25], expected: "$0.25" },
      { input: [99], expected: "$99.00" },
    ],
  },
  {
    id: "py-dedupe-keep-order",
    number: 33,
    language: 'python',
    title: "Dedupe, Keep Order",
    difficulty: 'Medium',
    topic: "Sets",
    statement:
      "Remove duplicate numbers while keeping the first occurrence of each in its original position. The order keeps getting scrambled.",
    functionName: "dedupe",
    functionSignature: "def dedupe(nums: list[int]) -> list[int]:",
    buggyCode:
      "def dedupe(nums: list[int]) -> list[int]:\n    return list(set(nums))\n",
    hint: "Sets don't remember the order things arrived in.",
    explanation:
      "Converting to a set discards insertion order, so the result comes back in hash order instead of input order. dict.fromkeys(nums) deduplicates while preserving first-seen order.",
    examples: [
      { input: [[3, 1, 2, 1, 3]], expected: [3, 1, 2] },
    ],
    hiddenTests: [
      { input: [[5, 4, 5]], expected: [5, 4] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[10, 10]], expected: [10] },
    ],
  },
  {
    id: "py-top-scores",
    number: 34,
    language: 'python',
    title: "Top Scores",
    difficulty: 'Easy',
    topic: "Sorting",
    statement:
      "Return the k largest numbers in descending order. The function is handing back the smallest ones instead.",
    functionName: "top_k",
    functionSignature: "def top_k(nums: list[int], k: int) -> list[int]:",
    buggyCode:
      "def top_k(nums: list[int], k: int) -> list[int]:\n    return sorted(nums)[:k]\n",
    hint: "Which end of the sorted list are you taking from?",
    explanation:
      "sorted() sorts ascending, so the slice [:k] grabs the k smallest values. Sort with reverse=True (or slice from the other end) to get the largest first.",
    examples: [
      { input: [[5, 1, 9, 3], 2], expected: [9, 5] },
    ],
    hiddenTests: [
      { input: [[1, 2, 3], 1], expected: [3] },
      { input: [[10, 20], 2], expected: [20, 10] },
      { input: [[4, 8, 6, 2], 3], expected: [8, 6, 4] },
    ],
  },
];

// =============================================================================
// JAVASCRIPT (34)
// =============================================================================
const javascriptProblems: BugFixProblem[] = [
  {
    id: 'js-loose-equality',
    number: 1,
    language: 'javascript',
    title: 'Strict Equality',
    difficulty: 'Easy',
    topic: 'Operators',
    statement:
      'Return true only when the input is the number 0. Right now it also returns true for the string "0", false, and other coerced-to-zero values.',
    functionName: 'isExactlyZero',
    functionSignature: 'function isExactlyZero(x): boolean',
    buggyCode:
      'function isExactlyZero(x) {\n  return x == 0;\n}\n',
    hint: 'The loose equality operator does type coercion before comparing.',
    explanation:
      '`==` coerces both sides to the same type, so `"0" == 0`, `false == 0`, `[] == 0`, and `null == 0` are all considered equal. Use `===` for strict equality.',
    examples: [
      { input: [0], expected: true },
      { input: ['0'], expected: false },
      { input: [false], expected: false },
    ],
    hiddenTests: [
      { input: [null], expected: false },
      { input: [undefined], expected: false },
      { input: [1], expected: false },
      { input: [[]], expected: false },
    ],
  },
  {
    id: 'js-array-off-by-one',
    number: 2,
    language: 'javascript',
    title: 'Array Off-By-One',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement:
      'Return the sum of every element in the input array. The current loop reads one past the end, producing NaN.',
    functionName: 'sumArray',
    functionSignature: 'function sumArray(arr: number[]): number',
    buggyCode:
      'function sumArray(arr) {\n  let total = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}\n',
    hint: 'arr.length is the number of elements, not the last valid index.',
    explanation:
      'Valid indices are 0..arr.length - 1. Use `i < arr.length`. `arr[arr.length]` is undefined; adding undefined to a number yields NaN.',
    examples: [
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[10]], expected: 10 },
      { input: [[-5, 5]], expected: 0 },
      { input: [[1, 2, 3, 4, 5]], expected: 15 },
    ],
  },
  {
    id: 'js-parseint-no-radix',
    number: 3,
    language: 'javascript',
    title: 'parseInt Without Radix',
    difficulty: 'Easy',
    topic: 'Numbers',
    statement:
      'Parse a string as a base-10 integer. Strings that look like hex ("0x..") should not be parsed as hex — return NaN-equivalent (or a sane base-10 result of 0).',
    functionName: 'parseDecimal',
    functionSignature: 'function parseDecimal(s: string): number',
    buggyCode:
      'function parseDecimal(s) {\n  return parseInt(s);\n}\n',
    hint: 'parseInt has an optional second argument — the radix.',
    explanation:
      'Without a radix, `parseInt("0x10")` parses as hexadecimal (16). Always pass an explicit base: `parseInt(s, 10)`. Modern code often prefers `Number(s)` which is stricter about junk suffixes.',
    examples: [
      { input: ['10'], expected: 10 },
      { input: ['0x10'], expected: 0 },
      { input: ['42abc'], expected: 42 },
    ],
    hiddenTests: [
      { input: ['100'], expected: 100 },
      { input: ['0'], expected: 0 },
      { input: ['007'], expected: 7 },
    ],
  },
  {
    id: 'js-string-coercion',
    number: 4,
    language: 'javascript',
    title: 'String Plus Number',
    difficulty: 'Easy',
    topic: 'Operators',
    statement:
      'Return the numeric sum of `a` and `b`. Either argument might arrive as a string (e.g. from JSON parsing), so the function must coerce both to numbers before adding.',
    functionName: 'add',
    functionSignature: 'function add(a, b): number',
    buggyCode:
      'function add(a, b) {\n  return a + b;\n}\n',
    hint: 'The `+` operator concatenates if either operand is a string.',
    explanation:
      '`"1" + 2` is `"12"`, but `"1" - 2` is `-1` — `+` is the only arithmetic operator that does string concatenation. Coerce explicitly: `return Number(a) + Number(b)`.',
    examples: [
      { input: [1, 2], expected: 3 },
      { input: ['1', '2'], expected: 3 },
      { input: ['5', 7], expected: 12 },
    ],
    hiddenTests: [
      { input: [0, 0], expected: 0 },
      { input: ['10', '20'], expected: 30 },
      { input: [3, '4'], expected: 7 },
    ],
  },
  {
    id: 'js-foreach-vs-map',
    number: 5,
    language: 'javascript',
    title: 'forEach vs map',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement:
      'Return a new array with each element doubled. The current code returns undefined.',
    functionName: 'doubleAll',
    functionSignature: 'function doubleAll(arr: number[]): number[]',
    buggyCode:
      'function doubleAll(arr) {\n  return arr.forEach(x => x * 2);\n}\n',
    hint: '`forEach` runs the callback for side effects and returns undefined.',
    explanation:
      '`forEach` returns undefined; it can\'t be used to transform an array. Use `map`: `return arr.map(x => x * 2);`.',
    examples: [
      { input: [[1, 2, 3]], expected: [2, 4, 6] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[5]], expected: [10] },
      { input: [[-1, -2]], expected: [-2, -4] },
      { input: [[10, 20, 30]], expected: [20, 40, 60] },
    ],
  },
  {
    id: 'js-array-reference-eq',
    number: 6,
    language: 'javascript',
    title: 'Array Reference Equality',
    difficulty: 'Easy',
    topic: 'Equality',
    statement:
      '`hasArray` should return true when `haystack` contains an array whose contents match `needle`. The current `===` comparison only matches identical references, not equal contents.',
    functionName: 'hasArray',
    functionSignature: 'function hasArray(haystack: any[][], needle: any[]): boolean',
    buggyCode:
      'function hasArray(haystack, needle) {\n  for (let i = 0; i < haystack.length; i++) {\n    if (haystack[i] === needle) return true;\n  }\n  return false;\n}\n',
    hint: 'Two different array objects with the same contents are not `===`.',
    explanation:
      'Arrays compared with `===` are equal only when they\'re the same object in memory. Compare contents with `JSON.stringify(haystack[i]) === JSON.stringify(needle)` or element-by-element. (For complex data, use a real deep-equal helper.)',
    examples: [
      { input: [[[1, 2], [3, 4]], [1, 2]], expected: true },
      { input: [[[1, 2], [3, 4]], [5, 6]], expected: false },
    ],
    hiddenTests: [
      { input: [[], [1]], expected: false },
      { input: [[[1]], [1]], expected: true },
      { input: [[[1, 2, 3]], [1, 2, 3]], expected: true },
    ],
  },
  {
    id: 'js-typeof-null',
    number: 7,
    language: 'javascript',
    title: 'Real Object?',
    difficulty: 'Medium',
    topic: 'Types',
    statement:
      'Return true for plain object literals like `{ a: 1 }`, false for everything else (null, arrays, primitives). The current code returns true for null and arrays.',
    functionName: 'isPlainObject',
    functionSignature: 'function isPlainObject(x): boolean',
    buggyCode:
      'function isPlainObject(x) {\n  return typeof x === \'object\';\n}\n',
    hint: 'typeof null is a famous JavaScript wart. Also, arrays are objects.',
    explanation:
      '`typeof null` is the string `"object"` (a historical bug). And `Array.isArray([])` is also `typeof "object"`. Guard explicitly: `x !== null && typeof x === "object" && !Array.isArray(x)`.',
    examples: [
      { input: [{ a: 1 }], expected: true },
      { input: [null], expected: false },
      { input: [[1, 2, 3]], expected: false },
    ],
    hiddenTests: [
      { input: [{}], expected: true },
      { input: ['hello'], expected: false },
      { input: [42], expected: false },
      { input: [undefined], expected: false },
    ],
  },
  {
    id: 'js-missing-return',
    number: 8,
    language: 'javascript',
    title: 'Missing Return in Arrow',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      'Triple each number in the input array. The current code returns an array of undefined values.',
    functionName: 'tripleAll',
    functionSignature: 'function tripleAll(arr: number[]): number[]',
    buggyCode:
      'function tripleAll(arr) {\n  return arr.map((x) => {\n    x * 3;\n  });\n}\n',
    hint: 'Arrow functions with a block body need an explicit return.',
    explanation:
      'A block-body arrow (`{ ... }`) does not implicitly return its last expression. Either add `return x * 3;` or drop the braces entirely: `(x) => x * 3`.',
    examples: [
      { input: [[1, 2, 3]], expected: [3, 6, 9] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[0]], expected: [0] },
      { input: [[-1, -2]], expected: [-3, -6] },
      { input: [[10, 20, 30]], expected: [30, 60, 90] },
    ],
  },
  {
    id: 'js-floating-point',
    number: 9,
    language: 'javascript',
    title: 'Float Equality',
    difficulty: 'Medium',
    topic: 'Numbers',
    statement:
      'Return true if `x` is approximately equal to 1 (within 1e-9). Direct `===` fails because 0.1 + 0.9 isn\'t exactly 1 in IEEE-754.',
    functionName: 'isCloseToOne',
    functionSignature: 'function isCloseToOne(x: number): boolean',
    buggyCode:
      'function isCloseToOne(x) {\n  return x === 1;\n}\n',
    hint: 'Float arithmetic accumulates tiny errors. Use a tolerance.',
    explanation:
      'Compare with a tolerance: `Math.abs(x - 1) < 1e-9`. Float math is inexact — `0.1 + 0.2` is `0.30000000000000004`. Strict equality on derived floats is almost always wrong.',
    examples: [
      { input: [1], expected: true },
      { input: [0.1 + 0.9], expected: true },
      { input: [1.5], expected: false },
    ],
    hiddenTests: [
      { input: [0.999999999999], expected: true },
      { input: [2], expected: false },
      { input: [0], expected: false },
    ],
  },
  {
    id: 'js-default-sort',
    number: 10,
    language: 'javascript',
    title: 'Default Sort is Lexicographic',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      'Sort an array of numbers in ascending order. The current implementation sorts them as strings, so `[10, 2, 30]` becomes `[10, 2, 30]` (because "10" < "2" < "30" lexicographically).',
    functionName: 'sortAscending',
    functionSignature: 'function sortAscending(nums: number[]): number[]',
    buggyCode:
      'function sortAscending(nums) {\n  return nums.sort();\n}\n',
    hint: '.sort() with no comparator converts values to strings.',
    explanation:
      'Array.prototype.sort defaults to lexicographic order on string-converted values. Pass a numeric comparator: `nums.sort((a, b) => a - b)`. For descending order, swap to `b - a`.',
    examples: [
      { input: [[10, 2, 30]], expected: [2, 10, 30] },
      { input: [[3, 1, 2]], expected: [1, 2, 3] },
    ],
    hiddenTests: [
      { input: [[100, 5, 25]], expected: [5, 25, 100] },
      { input: [[]], expected: [] },
      { input: [[7]], expected: [7] },
      { input: [[-1, -10, 0, 5]], expected: [-10, -1, 0, 5] },
    ],
  },
  {
    id: 'js-truthy-bug',
    number: 11,
    language: 'javascript',
    title: 'Truthy Is Not Boolean',
    difficulty: 'Medium',
    topic: 'Types',
    statement:
      '`isPositive` should return a boolean: true only for positive numbers, false otherwise. The current implementation returns the input itself, which fails the strict equality tests.',
    functionName: 'isPositive',
    functionSignature: 'function isPositive(x): boolean',
    buggyCode:
      'function isPositive(x) {\n  return x;\n}\n',
    hint: 'Returning a truthy value is not the same as returning `true`.',
    explanation:
      '`return x;` returns whatever was passed in — 5 is truthy but it\'s not `=== true`. Be explicit: `return typeof x === "number" && x > 0;`. The function contract is a boolean; honor it.',
    examples: [
      { input: [5], expected: true },
      { input: [-1], expected: false },
      { input: [0], expected: false },
    ],
    hiddenTests: [
      { input: [100], expected: true },
      { input: ['5'], expected: false },
      { input: [null], expected: false },
      { input: [0.1], expected: true },
    ],
  },
  {
    id: 'js-array-includes',
    number: 12,
    language: 'javascript',
    title: 'indexOf Returns a Number',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      '`contains` should return a boolean. The current implementation returns the result of `indexOf`, which is `-1` (truthy!) for missing elements and the index (could be 0, falsy) for the first element.',
    functionName: 'contains',
    functionSignature: 'function contains(arr: any[], x: any): boolean',
    buggyCode:
      'function contains(arr, x) {\n  return arr.indexOf(x);\n}\n',
    hint: 'indexOf returns -1 when not found, which is truthy. And 0 (the first index) is falsy.',
    explanation:
      'Use `arr.indexOf(x) !== -1` or, better, `arr.includes(x)` — which returns a true boolean and also handles NaN correctly.',
    examples: [
      { input: [[1, 2, 3], 2], expected: true },
      { input: [[1, 2, 3], 5], expected: false },
      { input: [[1, 2, 3], 1], expected: true },
    ],
    hiddenTests: [
      { input: [[], 1], expected: false },
      { input: [['a', 'b'], 'a'], expected: true },
      { input: [[0, 1], 0], expected: true },
      { input: [[0, 1], 9], expected: false },
    ],
  },
  {
    id: 'js-closure-var-loop',
    number: 13,
    language: 'javascript',
    title: 'var in a Loop',
    difficulty: 'Hard',
    topic: 'Closures',
    statement:
      '`applyIncrementer` builds N closures inside a loop where closure i should add i to the input. Then it calls the closure at `index` with `x`. Because of `var`, every closure captures the same variable.',
    functionName: 'applyIncrementer',
    functionSignature: 'function applyIncrementer(n: number, index: number, x: number): number',
    buggyCode:
      'function applyIncrementer(n, index, x) {\n  const fns = [];\n  for (var i = 0; i < n; i++) {\n    fns.push(function (y) { return y + i; });\n  }\n  return fns[index](x);\n}\n',
    hint: '`var` is function-scoped. Every closure sees the same `i` — its final value after the loop.',
    explanation:
      '`var` hoists to function scope, so all the pushed functions share one `i`. After the loop, that `i` equals `n`. Switch to `let i`, which is block-scoped and gives each iteration its own binding.',
    examples: [
      { input: [3, 0, 10], expected: 10 },
      { input: [3, 1, 10], expected: 11 },
      { input: [3, 2, 10], expected: 12 },
    ],
    hiddenTests: [
      { input: [5, 4, 0], expected: 4 },
      { input: [1, 0, 7], expected: 7 },
      { input: [10, 5, 100], expected: 105 },
    ],
  },
  {
    id: 'js-deep-equal-object',
    number: 14,
    language: 'javascript',
    title: 'Object Reference Equality',
    difficulty: 'Hard',
    topic: 'Equality',
    statement:
      '`equalsObj` should return true when `a` and `b` have the same keys and the same primitive values for each key. The current `==` comparison only matches references.',
    functionName: 'equalsObj',
    functionSignature: 'function equalsObj(a: object, b: object): boolean',
    buggyCode:
      'function equalsObj(a, b) {\n  return a == b;\n}\n',
    hint: 'Two different object literals are never `==` or `===`, no matter what they contain.',
    explanation:
      'Compare keys and values explicitly: get both sets of keys, check lengths match, then verify each key has the same value. For a one-level-deep check: iterate `Object.keys(a)`, ensure every key exists in `b` and the values match.',
    examples: [
      { input: [{ a: 1 }, { a: 1 }], expected: true },
      { input: [{ a: 1 }, { a: 2 }], expected: false },
      { input: [{ a: 1, b: 2 }, { a: 1 }], expected: false },
    ],
    hiddenTests: [
      { input: [{}, {}], expected: true },
      { input: [{ a: 1, b: 2 }, { b: 2, a: 1 }], expected: true },
      { input: [{ a: 1 }, { b: 1 }], expected: false },
      { input: [{ a: 'x' }, { a: 'x' }], expected: true },
    ],
  },
  {
    id: 'js-array-flat-depth',
    number: 15,
    language: 'javascript',
    title: 'Flatten Any Depth',
    difficulty: 'Hard',
    topic: 'Arrays',
    statement:
      'Flatten a nested array to a single level — regardless of nesting depth. The current code only removes one level.',
    functionName: 'flatten',
    functionSignature: 'function flatten(arr: any[]): any[]',
    buggyCode:
      'function flatten(arr) {\n  return arr.flat();\n}\n',
    hint: '.flat() takes a depth argument. The default is 1.',
    explanation:
      '`Array.prototype.flat()` defaults to depth 1. Pass `Infinity` to flatten any depth: `arr.flat(Infinity)`. Alternative: recursive `reduce` with a check for arrays.',
    examples: [
      { input: [[1, [2, 3]]], expected: [1, 2, 3] },
      { input: [[1, [2, [3, 4]]]], expected: [1, 2, 3, 4] },
    ],
    hiddenTests: [
      { input: [[[[[1]]]]], expected: [1] },
      { input: [[]], expected: [] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[[1, [2, [3, [4, [5]]]]]]], expected: [1, 2, 3, 4, 5] },
    ],
  },
  {
    id: 'js-reduce-no-initial',
    number: 16,
    language: 'javascript',
    title: 'Reduce Without Initial Value',
    difficulty: 'Hard',
    topic: 'Arrays',
    statement:
      'Sum an array of numbers. Empty arrays should return 0. The current code throws TypeError on an empty array.',
    functionName: 'sum',
    functionSignature: 'function sum(arr: number[]): number',
    buggyCode:
      'function sum(arr) {\n  return arr.reduce((a, b) => a + b);\n}\n',
    hint: 'reduce without an initial value throws on an empty array.',
    explanation:
      'Always pass an initial value to `reduce` unless you\'re certain the array is non-empty. `arr.reduce((a, b) => a + b, 0)` returns 0 for empty input and behaves identically otherwise.',
    examples: [
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[]], expected: 0 },
      { input: [[5]], expected: 5 },
    ],
    hiddenTests: [
      { input: [[-1, 1]], expected: 0 },
      { input: [[10, 20, 30, 40]], expected: 100 },
      { input: [[0]], expected: 0 },
    ],
  },
  {
    id: 'js-grid-shared-row',
    number: 17,
    language: 'javascript',
    title: 'Array.fill Shares References',
    difficulty: 'Hard',
    topic: 'Arrays',
    statement:
      'Build a `rows × cols` grid of zeros, set `[0][0]` to 99, then return `[1][0]`. The current construction makes every row reference the same inner array, so updating any cell updates the same column in every row.',
    functionName: 'gridCheck',
    functionSignature: 'function gridCheck(rows: number, cols: number): number',
    buggyCode:
      'function gridCheck(rows, cols) {\n  const grid = Array(rows).fill(Array(cols).fill(0));\n  grid[0][0] = 99;\n  return grid[1][0];\n}\n',
    hint: '.fill(x) puts the same x in every slot. If x is an object, every slot is the same object.',
    explanation:
      '`Array(rows).fill(innerArray)` puts the same inner array reference in every slot. Build each row independently with `Array.from({ length: rows }, () => Array(cols).fill(0))`.',
    examples: [
      { input: [3, 3], expected: 0 },
      { input: [2, 2], expected: 0 },
    ],
    hiddenTests: [
      { input: [5, 4], expected: 0 },
      { input: [10, 1], expected: 0 },
      { input: [2, 5], expected: 0 },
    ],
  },
  {
    id: "js-splice-is-not-slice",
    number: 18,
    language: 'javascript',
    title: "Splice Is Not Slice",
    difficulty: 'Easy',
    topic: "Arrays",
    statement:
      "Return a copy of the array without its first element. You keep getting back the element you wanted to drop.",
    functionName: "dropFirst",
    functionSignature: "function dropFirst(arr)",
    buggyCode:
      "function dropFirst(arr) {\n  return arr.splice(0, 1);\n}\n",
    hint: "splice returns the removed elements, not the remainder.",
    explanation:
      "arr.splice(0, 1) removes the first element and returns an array containing it (mutating the input too). arr.slice(1) returns everything after the first element without touching the original.",
    examples: [
      { input: [[1, 2, 3]], expected: [2, 3] },
    ],
    hiddenTests: [
      { input: [["a", "b"]], expected: ["b"] },
      { input: [[7]], expected: [] },
      { input: [[5, 5, 5]], expected: [5, 5] },
    ],
  },
  {
    id: "js-zero-is-a-value",
    number: 19,
    language: 'javascript',
    title: "Zero Is a Value",
    difficulty: 'Easy',
    topic: "Logic",
    statement:
      "Return value, falling back to fallback only when value is null or undefined. Legitimate values like 0 and '' are being replaced.",
    functionName: "withDefault",
    functionSignature: "function withDefault(value, fallback)",
    buggyCode:
      "function withDefault(value, fallback) {\n  return value || fallback;\n}\n",
    hint: "|| falls back on every falsy value, not just missing ones.",
    explanation:
      "The || operator treats 0, '' and false as missing and substitutes the fallback. The nullish coalescing operator ?? only falls back for null and undefined.",
    examples: [
      { input: [0, 10], expected: 0 },
      { input: [null, 10], expected: 10 },
    ],
    hiddenTests: [
      { input: ["", "guest"], expected: "" },
      { input: [false, true], expected: false },
      { input: [7, 1], expected: 7 },
    ],
  },
  {
    id: "js-catching-nan",
    number: 20,
    language: 'javascript',
    title: "Catching NaN",
    difficulty: 'Easy',
    topic: "Numbers",
    statement:
      "Count how many strings do not parse to a valid number. The count is always zero.",
    functionName: "countInvalid",
    functionSignature: "function countInvalid(strs)",
    buggyCode:
      "function countInvalid(strs) {\n  let count = 0;\n  for (const s of strs) {\n    if (Number(s) === NaN) count++;\n  }\n  return count;\n}\n",
    hint: "NaN is the only value that is not equal to itself.",
    explanation:
      "NaN === NaN is always false, so the comparison never matches anything. Use Number.isNaN(Number(s)) to detect a failed parse.",
    examples: [
      { input: [["1", "x", "2"]], expected: 1 },
    ],
    hiddenTests: [
      { input: [["a", "b"]], expected: 2 },
      { input: [["3", "4"]], expected: 0 },
      { input: [["1", "x", "y", "2"]], expected: 2 },
    ],
  },
  {
    id: "js-for-in-gives-keys",
    number: 21,
    language: 'javascript',
    title: "for...in Gives Keys",
    difficulty: 'Easy',
    topic: "Loops",
    statement:
      "Sum all the numbers in the array. The result comes out as a strange string.",
    functionName: "total",
    functionSignature: "function total(nums)",
    buggyCode:
      "function total(nums) {\n  let sum = 0;\n  for (const n in nums) {\n    sum += n;\n  }\n  return sum;\n}\n",
    hint: "What exactly does for...in hand you when looping over an array?",
    explanation:
      "for...in iterates over the array's indices as strings, so the code concatenated '0', '1', ... onto the sum. Use for...of to iterate over the values themselves.",
    examples: [
      { input: [[10, 20, 30]], expected: 60 },
    ],
    hiddenTests: [
      { input: [[5]], expected: 5 },
      { input: [[]], expected: 0 },
      { input: [[1, 2, 3, 4]], expected: 10 },
    ],
  },
  {
    id: "js-holes-dont-map",
    number: 22,
    language: 'javascript',
    title: "Holes Don't Map",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "Return the first n squares: [0, 1, 4, ...]. The array has the right length but nothing in it.",
    functionName: "firstSquares",
    functionSignature: "function firstSquares(n)",
    buggyCode:
      "function firstSquares(n) {\n  return Array(n).map((_, i) => i * i);\n}\n",
    hint: "Array(n) creates empty slots, and map skips holes.",
    explanation:
      "Array(n) creates a sparse array of holes, and .map() skips holes entirely, so the callback never runs. Array.from({ length: n }, (_, i) => i * i) creates real elements.",
    examples: [
      { input: [3], expected: [0, 1, 4] },
    ],
    hiddenTests: [
      { input: [5], expected: [0, 1, 4, 9, 16] },
      { input: [1], expected: [0] },
      { input: [0], expected: [] },
    ],
  },
  {
    id: "js-push-returns-length",
    number: 23,
    language: 'javascript',
    title: "Push Returns Length",
    difficulty: 'Easy',
    topic: "Arrays",
    statement:
      "Add the task to the list and return the updated list. Callers are getting a number back instead.",
    functionName: "addTask",
    functionSignature: "function addTask(tasks, task)",
    buggyCode:
      "function addTask(tasks, task) {\n  return tasks.push(task);\n}\n",
    hint: "Check the return value of Array.prototype.push.",
    explanation:
      "push() returns the array's new length, not the array, so the function returned a number. Push first, then return the array on its own line.",
    examples: [
      { input: [["a"], "b"], expected: ["a", "b"] },
    ],
    hiddenTests: [
      { input: [[], "x"], expected: ["x"] },
      { input: [[1, 2], 3], expected: [1, 2, 3] },
    ],
  },
  {
    id: "js-max-of-nothing",
    number: 24,
    language: 'javascript',
    title: "Max of Nothing",
    difficulty: 'Easy',
    topic: "Math",
    statement:
      "Return the highest score, or 0 when there are no scores. Empty input produces a bizarre value.",
    functionName: "highestOrZero",
    functionSignature: "function highestOrZero(scores)",
    buggyCode:
      "function highestOrZero(scores) {\n  return Math.max(...scores);\n}\n",
    hint: "Try calling Math.max() with no arguments at all.",
    explanation:
      "Math.max() with no arguments returns -Infinity, which is exactly what spreading an empty array produces. Guard for the empty case and return 0 explicitly.",
    examples: [
      { input: [[3, 7, 2]], expected: 7 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[10, 4, 8]], expected: 10 },
      { input: [[5]], expected: 5 },
      { input: [[]], expected: 0 },
    ],
  },
  {
    id: "js-negative-substring",
    number: 25,
    language: 'javascript',
    title: "Negative Substring",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "Return the last n characters of the string. You keep getting the whole string back.",
    functionName: "lastChars",
    functionSignature: "function lastChars(s, n)",
    buggyCode:
      "function lastChars(s, n) {\n  return s.substring(-n);\n}\n",
    hint: "substring and slice treat negative arguments very differently.",
    explanation:
      "substring() clamps negative arguments to 0, so s.substring(-n) returns the entire string. slice() counts negative indices from the end: s.slice(-n) gives the last n characters.",
    examples: [
      { input: ["hello", 3], expected: "llo" },
    ],
    hiddenTests: [
      { input: ["javascript", 6], expected: "script" },
      { input: ["typescript", 4], expected: "ript" },
      { input: ["abc", 3], expected: "abc" },
    ],
  },
  {
    id: "js-delete-leaves-a-hole",
    number: 26,
    language: 'javascript',
    title: "Delete Leaves a Hole",
    difficulty: 'Easy',
    topic: "Arrays",
    statement:
      "Remove the element at index i and return the array. The array still has the same length, with a gap in it.",
    functionName: "removeAt",
    functionSignature: "function removeAt(arr, i)",
    buggyCode:
      "function removeAt(arr, i) {\n  delete arr[i];\n  return arr;\n}\n",
    hint: "delete removes the value but not the slot.",
    explanation:
      "delete arr[i] leaves a hole: the length doesn't change and the index just becomes empty. arr.splice(i, 1) actually removes the element and closes the gap.",
    examples: [
      { input: [[1, 2, 3], 1], expected: [1, 3] },
    ],
    hiddenTests: [
      { input: [["a", "b", "c"], 0], expected: ["b", "c"] },
      { input: [[1, 2], 1], expected: [1] },
    ],
  },
  {
    id: "js-tofixed-is-a-string",
    number: 27,
    language: 'javascript',
    title: "toFixed Returns a String",
    difficulty: 'Easy',
    topic: "Numbers",
    statement:
      "Apply the percentage discount and return the price as a number rounded to two decimals. The result looks right but fails every comparison.",
    functionName: "finalPrice",
    functionSignature: "function finalPrice(price, percentOff)",
    buggyCode:
      "function finalPrice(price, percentOff) {\n  return (price * (100 - percentOff) / 100).toFixed(2);\n}\n",
    hint: "What type does toFixed() return?",
    explanation:
      "Number.prototype.toFixed returns a string like '150.00', not a number, so strict comparisons fail. Wrap the result in Number(...) to convert it back.",
    examples: [
      { input: [200, 25], expected: 150 },
    ],
    hiddenTests: [
      { input: [199, 50], expected: 99.5 },
      { input: [80, 0], expected: 80 },
      { input: [40, 75], expected: 10 },
    ],
  },
  {
    id: "js-rounding-negatives",
    number: 28,
    language: 'javascript',
    title: "Rounding Negatives",
    difficulty: 'Medium',
    topic: "Math",
    statement:
      "Round halves away from zero, so 2.5 becomes 3 and -2.5 becomes -3. Negative halves are going the wrong way.",
    functionName: "roundHalfAway",
    functionSignature: "function roundHalfAway(x)",
    buggyCode:
      "function roundHalfAway(x) {\n  return Math.round(x);\n}\n",
    hint: "Math.round(-2.5) does not do what most people expect.",
    explanation:
      "Math.round rounds halves toward positive infinity, so -2.5 becomes -2. Round the absolute value and reapply the sign: Math.sign(x) * Math.round(Math.abs(x)).",
    examples: [
      { input: [-2.5], expected: -3 },
      { input: [2.5], expected: 3 },
    ],
    hiddenTests: [
      { input: [-3.5], expected: -4 },
      { input: [4.5], expected: 5 },
      { input: [-1], expected: -1 },
    ],
  },
  {
    id: "js-counting-emoji",
    number: 29,
    language: 'javascript',
    title: "Counting Emoji",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "Count the characters in a string, where an emoji counts as one character. Emoji are being counted twice.",
    functionName: "charCount",
    functionSignature: "function charCount(s)",
    buggyCode:
      "function charCount(s) {\n  return s.length;\n}\n",
    hint: ".length counts UTF-16 code units, not characters.",
    explanation:
      "Emoji outside the Basic Multilingual Plane occupy two UTF-16 code units, so .length counts them twice. Spreading the string ([...s]) iterates by code point and gives the real character count.",
    examples: [
      { input: ["hi👋"], expected: 3 },
    ],
    hiddenTests: [
      { input: ["👍"], expected: 1 },
      { input: ["hello"], expected: 5 },
      { input: ["a🚀b"], expected: 3 },
    ],
  },
  {
    id: "js-append-not-nest",
    number: 30,
    language: 'javascript',
    title: "Append, Not Nest",
    difficulty: 'Easy',
    topic: "Arrays",
    statement:
      "Append every element of b onto the end of a and return a. The second array is ending up nested inside the first.",
    functionName: "appendAll",
    functionSignature: "function appendAll(a, b)",
    buggyCode:
      "function appendAll(a, b) {\n  a.push(b);\n  return a;\n}\n",
    hint: "push(b) pushes exactly one thing.",
    explanation:
      "a.push(b) inserts the whole array as a single nested element. Spread it instead, a.push(...b), or use concat to append the individual elements.",
    examples: [
      { input: [[1, 2], [3, 4]], expected: [1, 2, 3, 4] },
    ],
    hiddenTests: [
      { input: [[], [1]], expected: [1] },
      { input: [["x"], ["y", "z"]], expected: ["x", "y", "z"] },
    ],
  },
  {
    id: "js-parsing-12px",
    number: 31,
    language: 'javascript',
    title: "Parsing '12px'",
    difficulty: 'Easy',
    topic: "Type Coercion",
    statement:
      "Extract the leading integer from a CSS length like '12px'. Every input comes back as NaN.",
    functionName: "pixels",
    functionSignature: "function pixels(value)",
    buggyCode:
      "function pixels(value) {\n  return Number(value);\n}\n",
    hint: "Number() insists on parsing the entire string.",
    explanation:
      "Number('12px') is NaN because the whole string must be numeric. parseInt(value, 10) reads the leading digits and stops at the first non-digit.",
    examples: [
      { input: ["12px"], expected: 12 },
    ],
    hiddenTests: [
      { input: ["100px"], expected: 100 },
      { input: ["7em"], expected: 7 },
      { input: ["0px"], expected: 0 },
    ],
  },
  {
    id: "js-map-parseint-trap",
    number: 32,
    language: 'javascript',
    title: "The map(parseInt) Trap",
    difficulty: 'Hard',
    topic: "Arrays",
    statement:
      "Convert an array of numeric strings to numbers. Some entries inexplicably come back wrong or NaN.",
    functionName: "toNumbers",
    functionSignature: "function toNumbers(strs)",
    buggyCode:
      "function toNumbers(strs) {\n  return strs.map(parseInt);\n}\n",
    hint: "map passes more than one argument to its callback.",
    explanation:
      "map calls its callback with (value, index, array), so parseInt receives each index as its radix: parseInt('10', 2) is 2, and radix 1 yields NaN. Wrap it: strs.map(s => parseInt(s, 10)).",
    examples: [
      { input: [["10", "10", "10"]], expected: [10, 10, 10] },
    ],
    hiddenTests: [
      { input: [["1", "2", "3"]], expected: [1, 2, 3] },
      { input: [["5", "5"]], expected: [5, 5] },
      { input: [["42"]], expected: [42] },
    ],
  },
  {
    id: "js-replace-replaces-once",
    number: 33,
    language: 'javascript',
    title: "Replace Replaces Once",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "Replace every occurrence of word in the text with '***'. Only the first one is being censored.",
    functionName: "censor",
    functionSignature: "function censor(text, word)",
    buggyCode:
      "function censor(text, word) {\n  return text.replace(word, \"***\");\n}\n",
    hint: "How many matches does String.prototype.replace handle when given a plain string?",
    explanation:
      "replace() with a string pattern only replaces the first match. Use split(word).join('***') or replaceAll to replace every occurrence.",
    examples: [
      { input: ["bad bad day", "bad"], expected: "*** *** day" },
    ],
    hiddenTests: [
      { input: ["go go go", "go"], expected: "*** *** ***" },
      { input: ["no match here", "xyz"], expected: "no match here" },
      { input: ["aaa", "a"], expected: "*********" },
    ],
  },
  {
    id: "js-a-newline-too-far",
    number: 34,
    language: 'javascript',
    title: "A Newline Too Far",
    difficulty: 'Hard',
    topic: "Functions",
    statement:
      "Wrap the value in an object shaped like { value }. The function somehow returns undefined.",
    functionName: "makeBox",
    functionSignature: "function makeBox(value)",
    buggyCode:
      "function makeBox(value) {\n  return\n  {\n    value: value\n  };\n}\n",
    hint: "Look at exactly where the line ends after return.",
    explanation:
      "Automatic semicolon insertion turns a bare return followed by a newline into return;, so the object below is never returned. Put the opening brace on the same line as return.",
    examples: [
      { input: [5], expected: {"value": 5} },
    ],
    hiddenTests: [
      { input: ["x"], expected: {"value": "x"} },
      { input: [0], expected: {"value": 0} },
    ],
  },
];

// =============================================================================
// JAVA (32)
// =============================================================================
const javaProblems: BugFixProblem[] = [
  {
    id: 'java-string-equals',
    number: 1,
    language: 'java',
    title: 'String Equality',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`isHello` should return true when the argument is the string "hello". The current code uses `==`, which compares references and fails for strings built at runtime.',
    functionSignature: 'public static boolean isHello(String s)',
    buggyCode:
      'public static boolean isHello(String s) {\n    return s == "hello";\n}\n',
    hint: '== compares references. For string contents, use .equals().',
    explanation:
      'String literals are sometimes interned (so `==` appears to work), but any string built at runtime lives in a fresh object. Use `.equals()`. Defensive form: `"hello".equals(s)` is null-safe.',
    rules: [
      { label: 'Uses .equals() for the comparison', type: 'mustContain', pattern: '.equals(' },
      { label: 'No longer compares with == on the string', type: 'mustNotContain', pattern: '== "hello"' },
    ],
  },
  {
    id: 'java-loop-off-by-one',
    number: 2,
    language: 'java',
    title: 'Array Loop Off-By-One',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement:
      'Return the sum of every element in the int array. The loop currently runs one iteration too many and crashes with ArrayIndexOutOfBoundsException.',
    functionSignature: 'public static int sumArray(int[] arr)',
    buggyCode:
      'public static int sumArray(int[] arr) {\n    int total = 0;\n    for (int i = 0; i <= arr.length; i++) {\n        total += arr[i];\n    }\n    return total;\n}\n',
    hint: 'arr.length is the element count. The last valid index is arr.length - 1.',
    explanation:
      'The loop bound should be `i < arr.length`. With `i <= arr.length`, the last iteration reads `arr[arr.length]` — past the end — and throws ArrayIndexOutOfBoundsException.',
    rules: [
      { label: 'Loop bound uses < instead of <=', type: 'mustContain', pattern: 'i < arr.length' },
      { label: 'The off-by-one condition is gone', type: 'mustNotContain', pattern: 'i <= arr.length' },
    ],
  },
  {
    id: 'java-integer-division',
    number: 3,
    language: 'java',
    title: 'Integer Division',
    difficulty: 'Easy',
    topic: 'Arithmetic',
    statement:
      '`average` should return the arithmetic mean of the array as a double. Right now `[1, 2]` returns `1.0` because the division happens in int.',
    functionSignature: 'public static double average(int[] arr)',
    buggyCode:
      'public static double average(int[] arr) {\n    int total = 0;\n    for (int x : arr) total += x;\n    return total / arr.length;\n}\n',
    hint: 'int / int = int. You need at least one floating-point operand.',
    explanation:
      'Promote one operand to double: `return (double) total / arr.length;`. Without the cast, the division is integer division and the fractional part is lost before the result becomes a double.',
    rules: [
      { label: 'Casts at least one side to double', type: 'mustContain', pattern: '(double)' },
      { label: 'No longer divides two ints', type: 'mustNotContain', pattern: 'return total / arr.length' },
    ],
  },
  {
    id: 'java-char-vs-string',
    number: 4,
    language: 'java',
    title: 'Char vs String Literal',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`startsWithA` should return true when `s` is non-empty and its first character is `a`. The current code compares a `char` to a `String` literal, which doesn\'t compile.',
    functionSignature: 'public static boolean startsWithA(String s)',
    buggyCode:
      'public static boolean startsWithA(String s) {\n    if (s.length() == 0) return false;\n    return s.charAt(0) == "a";\n}\n',
    hint: 'Single quotes for char, double quotes for String.',
    explanation:
      '`s.charAt(0)` returns a `char`. To compare it to a literal `a`, use the char literal `\'a\'` (single quotes). `"a"` is a String — Java does not implicitly compare a char to a String.',
    rules: [
      { label: 'Compares against the char literal \'a\'', type: 'mustContain', pattern: "'a'" },
      { label: 'No longer compares charAt to a String literal', type: 'mustNotContain', pattern: '== "a"' },
    ],
  },
  {
    id: 'java-long-literal',
    number: 5,
    language: 'java',
    title: 'Long Literal Suffix',
    difficulty: 'Easy',
    topic: 'Numbers',
    statement:
      '`bigNumber` should return ten billion (10,000,000,000) as a long. The current literal exceeds int range and won\'t compile.',
    functionSignature: 'public static long bigNumber()',
    buggyCode:
      'public static long bigNumber() {\n    return 10000000000;\n}\n',
    hint: 'Integer literals default to int. Add the L suffix.',
    explanation:
      'Numeric literals are int by default. 10,000,000,000 overflows int (max ~2.1 billion). Suffix with `L` to make it a long literal: `return 10000000000L;`.',
    rules: [
      { label: 'Uses the long literal suffix L', type: 'mustContain', pattern: '10000000000L' },
      { label: 'No longer returns a bare int literal that overflows', type: 'mustNotContain', pattern: 'return 10000000000;' },
    ],
  },
  {
    id: 'java-switch-fallthrough',
    number: 6,
    language: 'java',
    title: 'Switch Fall-Through',
    difficulty: 'Medium',
    topic: 'Control flow',
    statement:
      '`classify` should return "small" for 1, "medium" for 2, "large" for 3, and "unknown" otherwise. Right now every input returns "unknown" because each case falls through to the next.',
    functionSignature: 'public static String classify(int n)',
    buggyCode:
      'public static String classify(int n) {\n    String result;\n    switch (n) {\n        case 1: result = "small";\n        case 2: result = "medium";\n        case 3: result = "large";\n        default: result = "unknown";\n    }\n    return result;\n}\n',
    hint: 'A Java switch falls through to the next case unless you exit explicitly.',
    explanation:
      'Without `break` (or arrow-form switch expressions), control flows from one matched case through every following case. Every input ends up at `default` and `result` becomes `"unknown"`. Add `break;` after each case, or rewrite as an arrow switch: `result = switch (n) { case 1 -> "small"; ... default -> "unknown"; };`.',
    rules: [
      { label: 'Each case exits the switch (break or arrow form)', type: 'mustContain', pattern: 'break|->', regex: true },
      { label: 'No bare fall-through into default from case 1', type: 'mustNotContain', pattern: 'case 1: result = "small";\n        case 2' },
    ],
  },
  {
    id: 'java-string-concat-loop',
    number: 7,
    language: 'java',
    title: 'Trailing Separator',
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      '`joinDash` should join the elements with "-" between them — no trailing dash. The current implementation appends "-" after every element.',
    functionSignature: 'public static String joinDash(String[] parts)',
    buggyCode:
      'public static String joinDash(String[] parts) {\n    String result = "";\n    for (int i = 0; i < parts.length; i++) {\n        result += parts[i] + "-";\n    }\n    return result;\n}\n',
    hint: 'Java\'s standard library has a one-liner for this.',
    explanation:
      'Use `String.join("-", parts)` — it inserts the separator between elements and never at the ends. For loop-based code, use a StringBuilder and only append the separator when `i > 0` (or after every element except the last).',
    rules: [
      { label: 'Uses String.join or guards the separator', type: 'mustContain', pattern: 'String.join|if \\(i > 0\\)|i == parts\\.length - 1|StringBuilder', regex: true },
      { label: 'No longer appends separator unconditionally on every element', type: 'mustNotContain', pattern: 'result += parts[i] + "-";' },
    ],
  },
  {
    id: 'java-arraylist-concurrent-mod',
    number: 8,
    language: 'java',
    title: 'Modify While Iterating',
    difficulty: 'Medium',
    topic: 'Collections',
    statement:
      '`removeEvens` should remove every even number from the list and return it. The enhanced for-loop currently throws ConcurrentModificationException when the list is modified during iteration.',
    functionSignature: 'public static List<Integer> removeEvens(List<Integer> nums)',
    buggyCode:
      'public static List<Integer> removeEvens(List<Integer> nums) {\n    for (Integer n : nums) {\n        if (n % 2 == 0) nums.remove(n);\n    }\n    return nums;\n}\n',
    hint: 'Use an Iterator and call .remove(), or use the removeIf method.',
    explanation:
      'Java\'s collections check for structural modifications during iteration and throw ConcurrentModificationException. Two safe fixes: (1) `nums.removeIf(n -> n % 2 == 0);` — concise and idiomatic; (2) an explicit `Iterator` with `it.remove()` inside the loop.',
    rules: [
      { label: 'Uses removeIf or Iterator.remove()', type: 'mustContain', pattern: 'removeIf|Iterator', regex: true },
      { label: 'No longer calls list.remove inside an enhanced for-loop', type: 'mustNotContain', pattern: 'for (Integer n : nums) {\n        if (n % 2 == 0) nums.remove(n);' },
    ],
  },
  {
    id: 'java-integer-cache-eq',
    number: 9,
    language: 'java',
    title: 'Integer Cache Equality',
    difficulty: 'Medium',
    topic: 'Numbers',
    statement:
      '`sameValue` should return true when two `Integer` objects represent the same number. The current code uses `==`, which works for values cached by the JDK (-128..127) and fails outside that range.',
    functionSignature: 'public static boolean sameValue(Integer a, Integer b)',
    buggyCode:
      'public static boolean sameValue(Integer a, Integer b) {\n    return a == b;\n}\n',
    hint: '== on boxed Integer compares references. .equals() compares values.',
    explanation:
      'The Integer cache means `Integer.valueOf(100) == Integer.valueOf(100)` is true, but `Integer.valueOf(200) == Integer.valueOf(200)` is false. Use `.equals()` for value comparison: `return a.equals(b);` (or `Objects.equals(a, b)` for null-safety).',
    rules: [
      { label: 'Uses .equals() for the comparison', type: 'mustContain', pattern: '.equals(' },
      { label: 'No longer uses == on the boxed Integer', type: 'mustNotContain', pattern: 'return a == b;' },
    ],
  },
  {
    id: 'java-null-check-order',
    number: 10,
    language: 'java',
    title: 'NPE in Null Check',
    difficulty: 'Medium',
    topic: 'Null Safety',
    statement:
      '`isEmpty` should return true when `s` is null or has zero length. The current code crashes with NullPointerException on null input.',
    functionSignature: 'public static boolean isEmpty(String s)',
    buggyCode:
      'public static boolean isEmpty(String s) {\n    return s.length() == 0;\n}\n',
    hint: 'Check null before calling a method on the reference.',
    explanation:
      'Use `||` with short-circuit evaluation, putting the null check first: `return s == null || s.length() == 0;`. The `||` short-circuits if `s == null` is true, so the second clause is never evaluated.',
    rules: [
      { label: 'Checks for null', type: 'mustContain', pattern: '== null|null ==', regex: true },
      { label: 'Uses short-circuit OR', type: 'mustContain', pattern: '||' },
    ],
  },
  {
    id: 'java-arraylist-remove-overload',
    number: 11,
    language: 'java',
    title: 'List.remove Overload Ambiguity',
    difficulty: 'Medium',
    topic: 'Collections',
    statement:
      '`removeFirstOccurrence` should remove the first occurrence of `value` from the list and return the list. The current code calls `remove(int index)` by accident, removing the element AT index `value` instead.',
    functionSignature: 'public static List<Integer> removeFirstOccurrence(List<Integer> nums, int value)',
    buggyCode:
      'public static List<Integer> removeFirstOccurrence(List<Integer> nums, int value) {\n    nums.remove(value);\n    return nums;\n}\n',
    hint: 'List<Integer> has two .remove() overloads: remove(int index) and remove(Object o).',
    explanation:
      'For `List<Integer>.remove(int)` vs `.remove(Object)`, the primitive `int` matches the index overload — even though `Integer` would also work. Box explicitly: `nums.remove(Integer.valueOf(value));` to disambiguate.',
    rules: [
      { label: 'Boxes the value to call remove(Object)', type: 'mustContain', pattern: 'Integer.valueOf(' },
      { label: 'No longer calls remove(int) by accident', type: 'mustNotContain', pattern: 'nums.remove(value);' },
    ],
  },
  {
    id: 'java-integer-overflow',
    number: 12,
    language: 'java',
    title: 'Integer Overflow',
    difficulty: 'Hard',
    topic: 'Numbers',
    statement:
      '`safeAbs` should return the absolute value of an int, capped at `Integer.MAX_VALUE` so it never returns a negative number. The current code returns `Integer.MIN_VALUE` when called with `Integer.MIN_VALUE`.',
    functionSignature: 'public static int safeAbs(int x)',
    buggyCode:
      'public static int safeAbs(int x) {\n    return Math.abs(x);\n}\n',
    hint: 'Math.abs(Integer.MIN_VALUE) is the canonical Java overflow gotcha.',
    explanation:
      '`Integer.MIN_VALUE` is `-2^31`. Its absolute value (`2^31`) cannot fit in an int (max is `2^31 - 1`), so `Math.abs` returns `Integer.MIN_VALUE` unchanged. Guard explicitly: `if (x == Integer.MIN_VALUE) return Integer.MAX_VALUE; return Math.abs(x);`.',
    rules: [
      { label: 'Guards against Integer.MIN_VALUE', type: 'mustContain', pattern: 'Integer.MIN_VALUE' },
      { label: 'Returns Integer.MAX_VALUE for the overflow case', type: 'mustContain', pattern: 'Integer.MAX_VALUE' },
    ],
  },
  {
    id: 'java-class-static-shared',
    number: 13,
    language: 'java',
    title: 'Static Field Shared',
    difficulty: 'Hard',
    topic: 'Classes',
    statement:
      'Each `Bag` instance should hold its own list of items. Right now `items` is declared `static`, so every Bag shares the same list — adding to one is visible in all of them.',
    functionSignature: 'class Bag { ... }',
    buggyCode:
      'public class Bag {\n    private static List<Integer> items = new ArrayList<>();\n\n    public void add(int x) {\n        items.add(x);\n    }\n\n    public int count() {\n        return items.size();\n    }\n}\n',
    hint: 'A `static` field belongs to the class, not the instance.',
    explanation:
      'Drop the `static` so each Bag gets its own `items`. The cleanest fix is also to make the field `final` and initialize at declaration: `private final List<Integer> items = new ArrayList<>();`.',
    rules: [
      { label: 'items is now an instance field (not static)', type: 'mustContain', pattern: 'private List<Integer> items' },
      { label: 'No longer declares items static', type: 'mustNotContain', pattern: 'private static List<Integer> items' },
    ],
  },
  {
    id: 'java-double-precision',
    number: 14,
    language: 'java',
    title: 'Double Equality',
    difficulty: 'Hard',
    topic: 'Numbers',
    statement:
      '`isCloseTo` should return true when two doubles are within `1e-9` of each other. The current code uses `==` and fails for values produced by arithmetic.',
    functionSignature: 'public static boolean isCloseTo(double a, double b)',
    buggyCode:
      'public static boolean isCloseTo(double a, double b) {\n    return a == b;\n}\n',
    hint: 'Float math is inexact. Compare with a tolerance.',
    explanation:
      'Use `Math.abs(a - b) < 1e-9` for a small absolute tolerance. For values that span many magnitudes, use a relative tolerance: `Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b))`.',
    rules: [
      { label: 'Uses Math.abs for the difference', type: 'mustContain', pattern: 'Math.abs(' },
      { label: 'No longer compares doubles with ==', type: 'mustNotContain', pattern: 'return a == b;' },
    ],
  },
  {
    id: 'java-mutable-leak',
    number: 15,
    language: 'java',
    title: 'Internal List Leak',
    difficulty: 'Hard',
    topic: 'Encapsulation',
    statement:
      '`getEvents` should expose the recorded events without letting the caller mutate the History\'s internal list. Right now it returns the internal `events` field directly — any caller can `.add()` to it.',
    functionSignature: 'class History { ... }',
    buggyCode:
      'public class History {\n    private final List<String> events = new ArrayList<>();\n\n    public void record(String e) {\n        events.add(e);\n    }\n\n    public List<String> getEvents() {\n        return events;\n    }\n}\n',
    hint: 'Return a defensive copy, or an unmodifiable view.',
    explanation:
      'Return a defensive copy: `return new ArrayList<>(events);`. Or expose an unmodifiable view: `return Collections.unmodifiableList(events);` — cheaper but throws on attempted mutation. Both prevent outside code from corrupting your invariants.',
    rules: [
      { label: 'Returns a defensive copy or unmodifiable view', type: 'mustContain', pattern: 'new ArrayList<>\\(events\\)|unmodifiableList\\(events\\)', regex: true },
      { label: 'No longer returns the internal field directly', type: 'mustNotContain', pattern: 'return events;' },
    ],
  },
  {
    id: 'java-array-mutate-return',
    number: 16,
    language: 'java',
    title: 'Returns Mutated Input',
    difficulty: 'Hard',
    topic: 'Arrays',
    statement:
      '`doubled` should return a NEW array where each element is twice the input — without modifying the caller\'s array. Right now it overwrites the input in place.',
    functionSignature: 'public static int[] doubled(int[] arr)',
    buggyCode:
      'public static int[] doubled(int[] arr) {\n    for (int i = 0; i < arr.length; i++) {\n        arr[i] *= 2;\n    }\n    return arr;\n}\n',
    hint: 'Allocate a new array first, then fill it in.',
    explanation:
      'Create a fresh `int[arr.length]`, fill it with doubled values, and return that. The caller\'s array is left untouched. Equivalent functional style: `Arrays.stream(arr).map(x -> x * 2).toArray();`.',
    rules: [
      { label: 'Allocates a new array', type: 'mustContain', pattern: 'new int\\[|Arrays\\.stream', regex: true },
      { label: 'No longer mutates the input in place', type: 'mustNotContain', pattern: 'arr[i] *= 2;' },
    ],
  },
  {
    id: "java-substring-end-index",
    number: 17,
    language: 'java',
    title: "Substring End Index",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "firstN should return the first n characters of s, but it always drops the last character of the prefix.",
    functionSignature: "public static String firstN(String s, int n)",
    buggyCode:
      "public static String firstN(String s, int n) {\n    return s.substring(0, n - 1);\n}",
    hint: "substring(begin, end) excludes the character at end — the end index is already one past the last character you keep.",
    explanation:
      "String.substring uses an exclusive end index, so substring(0, n) already returns exactly n characters. Passing n - 1 chops off the last character of the prefix. The fix is to pass n directly as the end index.",
    rules: [
      { label: "Uses substring(0, n) so the end index is one past the last wanted character", type: 'mustContain', pattern: "substring\\s*\\(\\s*0\\s*,\\s*n\\s*\\)", regex: true },
      { label: "No off-by-one n - 1 end index", type: 'mustNotContain', pattern: "n\\s*-\\s*1", regex: true },
      { label: "Still returns a substring of s", type: 'mustContain', pattern: "s.substring" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static String firstN(String s, int n) {\n    return s.substring(0, n);\n}" },
    ],
  },
  {
    id: "java-missing-instanceof-check",
    number: 18,
    language: 'java',
    title: "Missing instanceof Check",
    difficulty: 'Easy',
    topic: "Casting",
    statement:
      "lengthOf should return the length when value is a String and 0 for anything else, but it crashes with a ClassCastException on non-String inputs.",
    functionSignature: "public static int lengthOf(Object value)",
    buggyCode:
      "public static int lengthOf(Object value) {\n    String s = (String) value;\n    return s.length();\n}",
    hint: "Guard the cast with an instanceof check and fall back to 0 otherwise.",
    explanation:
      "Casting an arbitrary Object to String throws ClassCastException whenever the runtime type is not String. Guarding the cast with instanceof makes the cast safe and lets the method return the documented 0 fallback for other types.",
    rules: [
      { label: "Checks value instanceof String before casting", type: 'mustContain', pattern: "instanceof\\s+String", regex: true },
      { label: "Returns 0 for non-String values", type: 'mustContain', pattern: "return\\s+0\\s*;", regex: true },
      { label: "Still returns the string length", type: 'mustContain', pattern: ".length()" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static int lengthOf(Object value) {\n    if (value instanceof String) {\n        return ((String) value).length();\n    }\n    return 0;\n}" },
    ],
  },
  {
    id: "java-map-get-unboxing-npe",
    number: 19,
    language: 'java',
    title: "Map.get Unboxing NPE",
    difficulty: 'Easy',
    topic: "Maps",
    statement:
      "countFor should return the stored count for key, or 0 when the key is absent, but it throws a NullPointerException for missing keys.",
    functionSignature: "public static int countFor(Map<String, Integer> counts, String key)",
    buggyCode:
      "public static int countFor(Map<String, Integer> counts, String key) {\n    int value = counts.get(key);\n    return value;\n}",
    hint: "Map.get returns null for a missing key, and unboxing null into an int explodes — getOrDefault avoids both.",
    explanation:
      "For an absent key, Map.get returns null, and assigning that Integer to an int auto-unboxes null, throwing NullPointerException. getOrDefault(key, 0) returns the fallback before any unboxing happens, so missing keys safely yield 0.",
    rules: [
      { label: "Uses getOrDefault(key, 0) for absent keys", type: 'mustContain', pattern: "getOrDefault\\s*\\(\\s*key\\s*,\\s*0\\s*\\)", regex: true },
      { label: "No bare counts.get(...) that can return null", type: 'mustNotContain', pattern: "counts\\.get\\s*\\(", regex: true },
      { label: "Keeps the int-returning signature", type: 'mustContain', pattern: "public static int countFor" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static int countFor(Map<String, Integer> counts, String key) {\n    return counts.getOrDefault(key, 0);\n}" },
    ],
  },
  {
    id: "java-optional-get-empty",
    number: 20,
    language: 'java',
    title: "Optional.get on Empty",
    difficulty: 'Easy',
    topic: "Optional",
    statement:
      "displayName should return the nickname when present and fall back to \"Guest\" otherwise, but it throws NoSuchElementException for empty optionals.",
    functionSignature: "public static String displayName(Optional<String> nickname)",
    buggyCode:
      "public static String displayName(Optional<String> nickname) {\n    return nickname.get();\n}",
    hint: "Calling get() on an empty Optional throws — orElse supplies the fallback in one call.",
    explanation:
      "Optional.get throws NoSuchElementException when the optional is empty, so the method can never produce the documented fallback. orElse(\"Guest\") returns the contained value when present and the default otherwise, which is exactly the required behavior.",
    rules: [
      { label: "Falls back with orElse(\"Guest\")", type: 'mustContain', pattern: "orElse\\s*\\(\\s*\"Guest\"\\s*\\)", regex: true },
      { label: "No unconditional nickname.get()", type: 'mustNotContain', pattern: "nickname\\.get\\s*\\(\\s*\\)", regex: true },
      { label: "Keeps the Optional parameter", type: 'mustContain', pattern: "Optional<String> nickname" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static String displayName(Optional<String> nickname) {\n    return nickname.orElse(\"Guest\");\n}" },
    ],
  },
  {
    id: "java-char-digit-value",
    number: 21,
    language: 'java',
    title: "Char Digit Value",
    difficulty: 'Easy',
    topic: "Casting",
    statement:
      "digitValue should convert a digit character like '7' into the int 7, but it returns the character's ASCII code instead.",
    functionSignature: "public static int digitValue(char c)",
    buggyCode:
      "public static int digitValue(char c) {\n    return (int) c;\n}",
    hint: "Casting a char to int yields its code point ('7' becomes 55); subtract '0' to get the numeric digit.",
    explanation:
      "A char-to-int cast produces the UTF-16 code unit, so '7' becomes 55 rather than 7. Because digit characters are contiguous, subtracting '0' maps '0'..'9' onto 0..9, which is the standard idiom for digit conversion.",
    rules: [
      { label: "Subtracts '0' (or uses Character.getNumericValue) to get the digit", type: 'mustContain', pattern: "(c\\s*-\\s*'0'|Character\\.getNumericValue\\s*\\(\\s*c\\s*\\))", regex: true },
      { label: "No raw (int) cast of the character", type: 'mustNotContain', pattern: "return\\s+\\(int\\)\\s*c\\s*;", regex: true },
      { label: "Keeps the char parameter", type: 'mustContain', pattern: "digitValue(char c)" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static int digitValue(char c) {\n    return c - '0';\n}" },
    ],
  },
  {
    id: "java-case-sensitive-switch",
    number: 22,
    language: 'java',
    title: "Case-Sensitive Switch",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "statusCode should map \"high\"/\"medium\" to 3/2 regardless of letter case, but inputs like \"HIGH\" silently fall into the default branch.",
    functionSignature: "public static int statusCode(String level)",
    buggyCode:
      "public static int statusCode(String level) {\n    switch (level) {\n        case \"high\": return 3;\n        case \"medium\": return 2;\n        default: return 1;\n    }\n}",
    hint: "String switch comparison is exact — normalize the input case before the switch.",
    explanation:
      "Switch on a String uses String.equals, which is case-sensitive, so \"HIGH\" matches no case label and lands in default. Lower-casing the input once with level.toLowerCase() makes every casing of the keywords hit the intended branch.",
    rules: [
      { label: "Normalizes the input with level.toLowerCase() before switching", type: 'mustContain', pattern: "switch\\s*\\(\\s*level\\.toLowerCase\\(\\)\\s*\\)", regex: true },
      { label: "No switch on the raw, case-sensitive string", type: 'mustNotContain', pattern: "switch\\s*\\(\\s*level\\s*\\)", regex: true },
      { label: "Keeps the lowercase case labels", type: 'mustContain', pattern: "case \"high\"" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static int statusCode(String level) {\n    switch (level.toLowerCase()) {\n        case \"high\": return 3;\n        case \"medium\": return 2;\n        default: return 1;\n    }\n}" },
    ],
  },
  {
    id: "java-arrays-aslist-fixed-size",
    number: 23,
    language: 'java',
    title: "Fixed-Size Arrays.asList",
    difficulty: 'Medium',
    topic: "Collections",
    statement:
      "buildTags should return a modifiable list seeded with default tags plus the extra one, but it throws UnsupportedOperationException on add.",
    functionSignature: "public static List<String> buildTags(String extra)",
    buggyCode:
      "public static List<String> buildTags(String extra) {\n    List<String> tags = Arrays.asList(\"new\", \"featured\");\n    tags.add(extra);\n    return tags;\n}",
    hint: "Arrays.asList returns a fixed-size view backed by an array — copy it into a real ArrayList before adding.",
    explanation:
      "Arrays.asList returns a fixed-size list backed by the given array, so structural changes like add throw UnsupportedOperationException. Wrapping it in new ArrayList<>(...) copies the elements into a resizable list that supports add.",
    rules: [
      { label: "Copies the seed into a modifiable ArrayList", type: 'mustContain', pattern: "new\\s+ArrayList<", regex: true },
      { label: "Does not assign the fixed-size Arrays.asList view directly", type: 'mustNotContain', pattern: "=\\s*Arrays\\.asList", regex: true },
      { label: "Still adds the extra tag", type: 'mustContain', pattern: "tags.add(extra)" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static List<String> buildTags(String extra) {\n    List<String> tags = new ArrayList<>(Arrays.asList(\"new\", \"featured\"));\n    tags.add(extra);\n    return tags;\n}" },
    ],
  },
  {
    id: "java-return-in-finally",
    number: 24,
    language: 'java',
    title: "Return Inside Finally",
    difficulty: 'Medium',
    topic: "Exceptions",
    statement:
      "readCount should parse s as an int and return -1 only when parsing fails, but it returns -1 for every input, even valid numbers.",
    functionSignature: "public static int readCount(String s)",
    buggyCode:
      "public static int readCount(String s) {\n    try {\n        return Integer.parseInt(s);\n    } finally {\n        return -1;\n    }\n}",
    hint: "A return in finally always wins, discarding the try block’s return — use a catch block for the failure path instead.",
    explanation:
      "A finally block runs after the try completes, and a return there overrides the value already returned from try (and even swallows exceptions), so every call yields -1. Replacing finally with catch (NumberFormatException e) returns -1 only on the parse-failure path.",
    rules: [
      { label: "Handles bad input with catch (NumberFormatException ...)", type: 'mustContain', pattern: "catch\\s*\\(\\s*NumberFormatException", regex: true },
      { label: "No return inside a finally block", type: 'mustNotContain', pattern: "finally\\s*\\{[\\s\\S]*return", regex: true },
      { label: "Still parses with Integer.parseInt(s)", type: 'mustContain', pattern: "Integer.parseInt(s)" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static int readCount(String s) {\n    try {\n        return Integer.parseInt(s);\n    } catch (NumberFormatException e) {\n        return -1;\n    }\n}" },
    ],
  },
  {
    id: "java-array-covariance",
    number: 25,
    language: 'java',
    title: "Array Covariance Trap",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "makeBuffer should build an Object[] holding a header string and a numeric slot, but it crashes at runtime with an ArrayStoreException.",
    functionSignature: "public static Object[] makeBuffer()",
    buggyCode:
      "public static Object[] makeBuffer() {\n    Object[] items = new String[4];\n    items[0] = \"header\";\n    items[1] = Integer.valueOf(42);\n    return items;\n}",
    hint: "Arrays are covariant: a String[] is assignable to Object[], but the runtime still rejects non-String stores.",
    explanation:
      "Java arrays are covariant, so new String[4] can be assigned to an Object[] variable, but every store is checked against the actual array type at runtime. Writing an Integer into what is really a String[] throws ArrayStoreException; allocating new Object[4] makes the array genuinely able to hold any element.",
    rules: [
      { label: "Allocates a real Object[] for mixed element types", type: 'mustContain', pattern: "new\\s+Object\\[4\\]", regex: true },
      { label: "No String[] hiding behind an Object[] reference", type: 'mustNotContain', pattern: "Object\\[\\]\\s+items\\s*=\\s*new\\s+String\\[", regex: true },
      { label: "Still stores the Integer element", type: 'mustContain', pattern: "items[1] = Integer.valueOf(42)" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static Object[] makeBuffer() {\n    Object[] items = new Object[4];\n    items[0] = \"header\";\n    items[1] = Integer.valueOf(42);\n    return items;\n}" },
    ],
  },
  {
    id: "java-split-on-dot",
    number: 26,
    language: 'java',
    title: "Split on a Dot",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "fileExtension should return the text after the last dot in a filename like \"report.final.pdf\", but split produces an empty array and the method throws ArrayIndexOutOfBoundsException.",
    functionSignature: "public static String fileExtension(String filename)",
    buggyCode:
      "public static String fileExtension(String filename) {\n    String[] parts = filename.split(\".\");\n    return parts[parts.length - 1];\n}",
    hint: "String.split takes a regex, and an unescaped \".\" matches every character.",
    explanation:
      "split takes a regular expression, and \".\" matches any character, so every position splits and the trailing empty strings are trimmed away, leaving a zero-length array. Escaping it as \"\\\\.\" (the regex \\.) splits on literal dots and yields the real extension.",
    rules: [
      { label: "Escapes the dot so split treats it literally", type: 'mustContain', pattern: "split(\"\\\\.\")" },
      { label: "No split(\".\") on the unescaped regex dot", type: 'mustNotContain', pattern: "split(\".\")" },
      { label: "Still returns the last segment", type: 'mustContain', pattern: "parts[parts.length - 1]" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static String fileExtension(String filename) {\n    String[] parts = filename.split(\"\\\\.\");\n    return parts[parts.length - 1];\n}" },
    ],
  },
  {
    id: "java-enum-equals-npe",
    number: 27,
    language: 'java',
    title: "Enum Equals NPE",
    difficulty: 'Medium',
    topic: "Equality",
    statement:
      "isActive should return true only for Status.ACTIVE and false for anything else, including null, but it throws a NullPointerException when status is null.",
    functionSignature: "public static boolean isActive(Status status)",
    buggyCode:
      "enum Status { ACTIVE, INACTIVE }\n\npublic static boolean isActive(Status status) {\n    return status.equals(Status.ACTIVE);\n}",
    hint: "Enum constants are singletons, so == is both correct and null-safe, unlike calling equals on the variable.",
    explanation:
      "Calling status.equals(...) dereferences status, so a null value throws NullPointerException. Because each enum constant is a singleton, status == Status.ACTIVE is the idiomatic comparison: it is exact and simply evaluates to false when status is null.",
    rules: [
      { label: "Compares with == against Status.ACTIVE", type: 'mustContain', pattern: "status\\s*==\\s*Status\\.ACTIVE", regex: true },
      { label: "No equals call on a possibly-null status", type: 'mustNotContain', pattern: "status\\.equals\\s*\\(", regex: true },
      { label: "Still references the ACTIVE constant", type: 'mustContain', pattern: "Status.ACTIVE" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "enum Status { ACTIVE, INACTIVE }\n\npublic static boolean isActive(Status status) {\n    return status == Status.ACTIVE;\n}" },
    ],
  },
  {
    id: "java-stream-reused-twice",
    number: 28,
    language: 'java',
    title: "Stream Reused Twice",
    difficulty: 'Medium',
    topic: "Streams",
    statement:
      "summarize should return \"<count>: <comma-joined names>\", but it throws IllegalStateException because the same stream is consumed by two terminal operations.",
    functionSignature: "public static String summarize(List<String> names)",
    buggyCode:
      "public static String summarize(List<String> names) {\n    Stream<String> stream = names.stream();\n    long count = stream.count();\n    String joined = stream.collect(Collectors.joining(\", \"));\n    return count + \": \" + joined;\n}",
    hint: "A stream supports exactly one terminal operation — create a new stream from the list for each computation.",
    explanation:
      "Streams are single-use: count() is a terminal operation that closes the stream, so the later collect call throws IllegalStateException (\"stream has already been operated upon or closed\"). Calling names.stream() separately for the count and the join gives each terminal operation its own stream.",
    rules: [
      { label: "Counts on a fresh names.stream()", type: 'mustContain', pattern: "names\\.stream\\(\\)\\.count\\(\\)", regex: true },
      { label: "Joins on a second fresh names.stream()", type: 'mustContain', pattern: "names\\.stream\\(\\)\\.collect", regex: true },
      { label: "No stored Stream variable reused across terminal operations", type: 'mustNotContain', pattern: "Stream<String>\\s+stream\\s*=", regex: true },
      { label: "Still builds the \"count: joined\" result", type: 'mustContain', pattern: "count + \": \" + joined" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static String summarize(List<String> names) {\n    long count = names.stream().count();\n    String joined = names.stream().collect(Collectors.joining(\", \"));\n    return count + \": \" + joined;\n}" },
    ],
  },
  {
    id: "java-non-atomic-counter",
    number: 29,
    language: 'java',
    title: "Non-Atomic Counter",
    difficulty: 'Medium',
    topic: "Concurrency basics",
    statement:
      "HitCounter is incremented from multiple threads, but count++ is not atomic, so concurrent hits are lost and total() undercounts.",
    functionSignature: "class HitCounter",
    buggyCode:
      "class HitCounter {\n    private int count = 0;\n\n    public void hit() { count++; }\n\n    public int total() { return count; }\n}",
    hint: "count++ is three separate steps (read, add, write) — use AtomicInteger so the increment is a single atomic operation.",
    explanation:
      "count++ compiles to a read-modify-write sequence, so two threads can read the same value and one increment is lost; the plain int field also lacks visibility guarantees. AtomicInteger.incrementAndGet performs the update as one atomic, thread-visible operation, and get() reads the current value safely.",
    rules: [
      { label: "Stores the count in an AtomicInteger", type: 'mustContain', pattern: "AtomicInteger" },
      { label: "Increments atomically with incrementAndGet()", type: 'mustContain', pattern: "count\\.incrementAndGet\\(\\)", regex: true },
      { label: "No non-atomic count++ read-modify-write", type: 'mustNotContain', pattern: "count\\+\\+", regex: true },
      { label: "Reads the value with count.get()", type: 'mustContain', pattern: "count\\.get\\(\\)", regex: true },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "class HitCounter {\n    private final AtomicInteger count = new AtomicInteger();\n\n    public void hit() { count.incrementAndGet(); }\n\n    public int total() { return count.get(); }\n}" },
    ],
  },
  {
    id: "java-missing-hashcode",
    number: 30,
    language: 'java',
    title: "Missing hashCode Override",
    difficulty: 'Hard',
    topic: "Maps",
    statement:
      "CacheKey is used as a HashMap key and overrides equals, but lookups with an equal key still miss because hashCode was never overridden.",
    functionSignature: "class CacheKey",
    buggyCode:
      "class CacheKey {\n    final String id;\n\n    CacheKey(String id) { this.id = id; }\n\n    @Override\n    public boolean equals(Object o) {\n        return o instanceof CacheKey && ((CacheKey) o).id.equals(id);\n    }\n}",
    hint: "HashMap finds the bucket via hashCode before it ever calls equals — both must agree on the same fields.",
    explanation:
      "HashMap locates entries by hashCode first, and without an override two equal CacheKeys inherit distinct identity hash codes, so lookups search the wrong bucket and miss. Overriding hashCode to return id.hashCode() restores the equals/hashCode contract: equal objects now produce equal hashes.",
    rules: [
      { label: "Overrides public int hashCode()", type: 'mustContain', pattern: "public\\s+int\\s+hashCode\\s*\\(\\s*\\)", regex: true },
      { label: "hashCode is derived from the same id field equals uses", type: 'mustContain', pattern: "(id\\.hashCode\\(\\)|Objects\\.hash)", regex: true },
      { label: "Keeps the equals(Object) override", type: 'mustContain', pattern: "equals(Object o)" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "class CacheKey {\n    final String id;\n\n    CacheKey(String id) { this.id = id; }\n\n    @Override\n    public boolean equals(Object o) {\n        return o instanceof CacheKey && ((CacheKey) o).id.equals(id);\n    }\n\n    @Override\n    public int hashCode() {\n        return id.hashCode();\n    }\n}" },
    ],
  },
  {
    id: "java-comparator-subtraction-overflow",
    number: 31,
    language: 'java',
    title: "Comparator Subtraction Overflow",
    difficulty: 'Hard',
    topic: "Numbers",
    statement:
      "compare should order two ints like a comparator (negative, zero, positive), but the subtraction trick overflows for large opposite-sign values and reports the wrong order.",
    functionSignature: "public static int compare(int a, int b)",
    buggyCode:
      "public static int compare(int a, int b) {\n    return a - b;\n}",
    hint: "a - b can wrap around int range — Integer.compare never overflows.",
    explanation:
      "When a and b are far apart with opposite signs (for example a = -2_000_000_000, b = 2_000_000_000), a - b overflows and flips sign, so the comparator reports the wrong ordering and can corrupt sorts. Integer.compare(a, b) compares without arithmetic and is always correct.",
    rules: [
      { label: "Uses overflow-safe Integer.compare(a, b)", type: 'mustContain', pattern: "Integer\\.compare\\s*\\(\\s*a\\s*,\\s*b\\s*\\)", regex: true },
      { label: "No a - b subtraction trick", type: 'mustNotContain', pattern: "return\\s+a\\s*-\\s*b", regex: true },
      { label: "Keeps the comparator signature", type: 'mustContain', pattern: "public static int compare(int a, int b)" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static int compare(int a, int b) {\n    return Integer.compare(a, b);\n}" },
    ],
  },
  {
    id: "java-ternary-autoboxing-npe",
    number: 32,
    language: 'java',
    title: "Ternary Autoboxing NPE",
    difficulty: 'Hard',
    topic: "Autoboxing",
    statement:
      "pickScore should return 0 when useDefault is set, otherwise pass the stored score through unchanged (including null), but the ternary throws a NullPointerException when stored is null.",
    functionSignature: "public static Integer pickScore(boolean useDefault, Integer stored)",
    buggyCode:
      "public static Integer pickScore(boolean useDefault, Integer stored) {\n    return useDefault ? 0 : stored;\n}",
    hint: "Mixing int and Integer in a ternary makes its type int, which unboxes stored — keep both branches Integer.",
    explanation:
      "Because one branch is the int literal 0, the whole conditional expression has type int, so when the else branch is taken, stored is auto-unboxed and a null value throws NullPointerException. Using Integer.valueOf(0) keeps both branches as Integer, so null flows through untouched.",
    rules: [
      { label: "Boxes the default explicitly with Integer.valueOf(0)", type: 'mustContain', pattern: "Integer\\.valueOf\\(0\\)", regex: true },
      { label: "No bare int 0 mixed into the ternary", type: 'mustNotContain', pattern: "\\?\\s*0\\s*:", regex: true },
      { label: "Still passes stored through as the else branch", type: 'mustContain', pattern: ":\\s*stored", regex: true },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static Integer pickScore(boolean useDefault, Integer stored) {\n    return useDefault ? Integer.valueOf(0) : stored;\n}" },
    ],
  },
];

// Combined catalog used by the practice list.
export const bugFixProblems: BugFixProblem[] = [
  ...pythonProblems,
  ...javascriptProblems,
  ...javaProblems,
];

export function getBugFixProblem(id: string): BugFixProblem | undefined {
  return bugFixProblems.find((p) => p.id === id);
}
