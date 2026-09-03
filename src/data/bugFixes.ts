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
// PYTHON (100)
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
  {
    id: 'py-running-max',
    number: 35,
    language: 'python',
    title: "Running Maximum",
    difficulty: 'Easy',
    topic: "Accumulation",
    statement:
      "Return a list where each element is the maximum of the input list seen so far (a running/prefix maximum). For input [1, 3, 2, 5, 4] the result is [1, 3, 3, 5, 5].",
    functionName: 'running_max',
    functionSignature: "def running_max(nums: list[int]) -> list[int]:",
    buggyCode:
      "def running_max(nums):\n    result = []\n    best = 0\n    for x in nums:\n        if x > best:\n            best = x\n        result.append(best)\n    return result\n",
    hint: "What if every number is negative? What does the running max start at?",
    explanation:
      "The accumulator `best` was seeded with 0, so any list of negative numbers reported 0 instead of the real running max. Seed with None and take the first element on the first iteration: `best = None` then `if best is None or x > best:`. (Or seed with `nums[0]` after guarding the empty case.)",
    examples: [
      { input: [[1,3,2,5,4]], expected: [1,3,3,5,5] },
      { input: [[-5,-2,-8]], expected: [-5,-2,-2] },
      { input: [[3]], expected: [3] },
    ],
    hiddenTests: [
      { input: [[-1,-1,-1]], expected: [-1,-1,-1] },
      { input: [[0,-3,2]], expected: [0,0,2] },
    ],
  },
  {
    id: 'py-reverse-segment',
    number: 36,
    language: 'python',
    title: "Reverse a Segment",
    difficulty: 'Medium',
    topic: "Two Pointers",
    statement:
      "Return a NEW list equal to arr but with the elements between indices i and j (inclusive) reversed in place. Do not mutate the input. For arr=[1,2,3,4,5], i=1, j=3 the result is [1,4,3,2,5].",
    functionName: 'reverse_segment',
    functionSignature: "def reverse_segment(arr: list[int], i: int, j: int) -> list[int]:",
    buggyCode:
      "def reverse_segment(arr, i, j):\n    arr = list(arr)\n    while i < j:\n        arr[i], arr[j] = arr[j], arr[i]\n        i += 1\n    return arr\n",
    hint: "You move one pointer inward each step — but there are two pointers.",
    explanation:
      "The loop advanced `i` toward `j` but never moved `j` inward, so after the first swap the two pointers just marched past each other and the middle never got reversed correctly. Add `j -= 1` inside the loop so both pointers converge.",
    examples: [
      { input: [[1,2,3,4,5],1,3], expected: [1,4,3,2,5] },
      { input: [[1,2,3],0,2], expected: [3,2,1] },
      { input: [[5],0,0], expected: [5] },
    ],
    hiddenTests: [
      { input: [[9,8,7,6],0,3], expected: [6,7,8,9] },
      { input: [[1,2,3,4,5,6],2,4], expected: [1,2,5,4,3,6] },
    ],
  },
  {
    id: 'py-count-pairs',
    number: 37,
    language: 'python',
    title: "Count Pairs That Sum to Target",
    difficulty: 'Medium',
    topic: "Loops",
    statement:
      "Return the number of unordered index pairs (i, j) with i < j such that nums[i] + nums[j] equals target. Each pair is counted once and an element is never paired with itself.",
    functionName: 'count_pairs',
    functionSignature: "def count_pairs(nums: list[int], target: int) -> int:",
    buggyCode:
      "def count_pairs(nums, target):\n    count = 0\n    n = len(nums)\n    for i in range(n):\n        for j in range(i, n):\n            if nums[i] + nums[j] == target:\n                count += 1\n    return count\n",
    hint: "When i equals j you are pairing an element with itself.",
    explanation:
      "The inner loop started at `range(i, n)`, which includes j == i — pairing each element with itself (and counting nums[i]+nums[i]). Start the inner loop at `i + 1` so only distinct pairs with i < j are counted.",
    examples: [
      { input: [[1,2,3,4],5], expected: 2 },
      { input: [[2,2,2],4], expected: 3 },
      { input: [[3],6], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1,1,1],2], expected: 3 },
      { input: [[0,0,0,0],0], expected: 6 },
    ],
  },
  {
    id: 'py-window-sums',
    number: 38,
    language: 'python',
    title: "Sliding Window Sums",
    difficulty: 'Hard',
    topic: "Sliding Window",
    statement:
      "Return the sum of every contiguous window of size k, in order. Maintain a running window total: add the entering element and subtract the leaving one. For nums=[1,2,3,4,5], k=3 the result is [6,9,12].",
    functionName: 'window_sums',
    functionSignature: "def window_sums(nums: list[int], k: int) -> list[int]:",
    buggyCode:
      "def window_sums(nums, k):\n    result = []\n    window = 0\n    for i in range(len(nums)):\n        window += nums[i]\n        if i >= k - 1:\n            result.append(window)\n            window -= nums[i - k]\n    return result\n",
    hint: "At index i the window covers i-k+1 .. i. Which element actually leaves next?",
    explanation:
      "When the window is full at index i it spans indices i-k+1 through i. The element that should leave to slide forward is at i-k+1, not i-k (which is one position too far back, an off-by-one). Change the subtraction to `window -= nums[i - k + 1]`.",
    examples: [
      { input: [[1,2,3,4,5],3], expected: [6,9,12] },
      { input: [[4,2,1,7],2], expected: [6,3,8] },
      { input: [[5],1], expected: [5] },
    ],
    hiddenTests: [
      { input: [[1,1,1,1],4], expected: [4] },
      { input: [[2,4,6,8,10],2], expected: [6,10,14,18] },
    ],
  },
  {
    id: 'py-factorial-loop',
    number: 39,
    language: 'python',
    title: "Factorial by Loop",
    difficulty: 'Easy',
    topic: "Ranges",
    statement:
      "Return n! (n factorial), the product of every integer from 1 through n. By definition 0! is 1.",
    functionName: 'factorial',
    functionSignature: "def factorial(n: int) -> int:",
    buggyCode:
      "def factorial(n):\n    result = 1\n    for i in range(1, n):\n        result *= i\n    return result\n",
    hint: "range(1, n) stops before n. Does n itself get multiplied in?",
    explanation:
      "`range(1, n)` yields 1..n-1, so the final factor n was never multiplied in (an off-by-one on the upper bound). Use `range(1, n + 1)` to include n.",
    examples: [
      { input: [5], expected: 120 },
      { input: [0], expected: 1 },
      { input: [1], expected: 1 },
    ],
    hiddenTests: [
      { input: [6], expected: 720 },
      { input: [4], expected: 24 },
    ],
  },
  {
    id: 'py-chunk-list',
    number: 40,
    language: 'python',
    title: "Chunk a List",
    difficulty: 'Medium',
    topic: "Ranges",
    statement:
      "Split a list into consecutive chunks of size k and return the list of chunks. The final chunk may be shorter if the list does not divide evenly. For [1,2,3,4,5], k=2 the result is [[1,2],[3,4],[5]].",
    functionName: 'chunk',
    functionSignature: "def chunk(lst: list, k: int) -> list:",
    buggyCode:
      "def chunk(lst, k):\n    result = []\n    for i in range(0, len(lst)):\n        result.append(lst[i:i + k])\n    return result\n",
    hint: "The loop advances one index at a time, so the slices overlap. What step should range use?",
    explanation:
      "The loop stepped by 1, producing overlapping slices at every start index. Chunking needs the loop to jump k elements each iteration: `range(0, len(lst), k)`.",
    examples: [
      { input: [[1,2,3,4,5],2], expected: [[1,2],[3,4],[5]] },
      { input: [[1,2,3,4],2], expected: [[1,2],[3,4]] },
      { input: [[1,2,3],1], expected: [[1],[2],[3]] },
    ],
    hiddenTests: [
      { input: [[],3], expected: [] },
      { input: [[1,2,3,4,5,6,7],3], expected: [[1,2,3],[4,5,6],[7]] },
    ],
  },
  {
    id: 'py-max-subarray',
    number: 41,
    language: 'python',
    title: "Maximum Subarray Sum",
    difficulty: 'Hard',
    topic: "Accumulation",
    statement:
      "Return the largest sum obtainable from any contiguous non-empty subarray (Kadane's algorithm). The array has at least one element and may be entirely negative.",
    functionName: 'max_subarray',
    functionSignature: "def max_subarray(nums: list[int]) -> int:",
    buggyCode:
      "def max_subarray(nums):\n    best = 0\n    current = 0\n    for x in nums:\n        current = max(x, current + x)\n        best = max(best, current)\n    return best\n",
    hint: "The subarray must be non-empty. What does best return for an all-negative array?",
    explanation:
      "Seeding `best = 0` implicitly allows the 'empty' subarray with sum 0, so an all-negative array returns 0 instead of its largest (least negative) element. Seed both accumulators from the first element — `best = current = nums[0]` — and iterate over the rest (`nums[1:]`).",
    examples: [
      { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { input: [[-3,-1,-2]], expected: -1 },
      { input: [[5,4,-1,7,8]], expected: 23 },
    ],
    hiddenTests: [
      { input: [[-1]], expected: -1 },
      { input: [[-2,-3,-1,-5]], expected: -1 },
    ],
  },
  {
    id: 'py-capitalize-each-word',
    number: 42,
    language: 'python',
    title: "Capitalize Each Word",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "Return the string with the first letter of every space-separated word capitalized and the rest lowercased, words rejoined with single spaces. Right now nothing gets capitalized and the output looks broken.",
    functionName: 'capitalize_words',
    functionSignature: "def capitalize_words(s: str) -> str:",
    buggyCode:
      "def capitalize_words(s: str) -> str:\n    words = s.split(\" \")\n    result = []\n    for w in words:\n        result.append(w.capitalize)\n    return \" \".join(result)\n",
    hint: "Look at what you actually appended to the result list.",
    explanation:
      "The bug is w.capitalize (a reference to the method object) instead of w.capitalize() (a call). Appending the method object means join() gets method objects, not strings — and it never capitalizes anything. Add the parentheses to call it.",
    examples: [
      { input: ["hello world"], expected: "Hello World" },
      { input: ["the QUICK brown"], expected: "The Quick Brown" },
    ],
    hiddenTests: [
      { input: ["a"], expected: "A" },
      { input: [""], expected: "" },
    ],
  },
  {
    id: 'py-reverse-string-step',
    number: 43,
    language: 'python',
    title: "Reverse a String",
    difficulty: 'Easy',
    topic: "Slicing",
    statement:
      "Return the input string reversed. The function keeps handing back the string unchanged.",
    functionName: 'reverse_string',
    functionSignature: "def reverse_string(s: str) -> str:",
    buggyCode:
      "def reverse_string(s: str) -> str:\n    return s[::1]\n",
    hint: "Check the sign of the slice step.",
    explanation:
      "The slice step is +1, which walks the string forward and just copies it. A step of -1 (s[::-1]) walks from the end to the start, producing the reversed string.",
    examples: [
      { input: ["abc"], expected: "cba" },
      { input: ["hello"], expected: "olleh" },
    ],
    hiddenTests: [
      { input: ["racecar"], expected: "racecar" },
      { input: [""], expected: "" },
    ],
  },
  {
    id: 'py-count-vowels-membership',
    number: 44,
    language: 'python',
    title: "Count the Vowels",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "Count how many characters in the string are vowels (a, e, i, o, u), case-insensitive. The count is always way too high.",
    functionName: 'count_vowels',
    functionSignature: "def count_vowels(s: str) -> int:",
    buggyCode:
      "def count_vowels(s: str) -> int:\n    count = 0\n    for ch in s.lower():\n        if ch == \"a\" or \"e\" or \"i\" or \"o\" or \"u\":\n            count += 1\n    return count\n",
    hint: "Each part of an 'or' chain is evaluated on its own — is a bare string truthy?",
    explanation:
      "The condition ch == \"a\" or \"e\" or \"i\" or ... does not compare ch to each vowel. Python evaluates it as (ch == \"a\") or (\"e\") or ..., and non-empty strings like \"e\" are always truthy, so the whole condition is always true and every character is counted. Use a single membership test: if ch in \"aeiou\".",
    examples: [
      { input: ["hello"], expected: 2 },
      { input: ["xyz"], expected: 0 },
    ],
    hiddenTests: [
      { input: ["AEIOU"], expected: 5 },
      { input: ["Programming"], expected: 3 },
    ],
  },
  {
    id: 'py-replace-char-immutable',
    number: 45,
    language: 'python',
    title: "Strings Can't Be Item-Assigned",
    difficulty: 'Medium',
    topic: "Immutability",
    statement:
      "Return a copy of the string with the character at the given index replaced by ch. The current code crashes.",
    functionName: 'replace_char',
    functionSignature: "def replace_char(s: str, index: int, ch: str) -> str:",
    buggyCode:
      "def replace_char(s: str, index: int, ch: str) -> str:\n    s[index] = ch\n    return s\n",
    hint: "Strings are immutable — you can't assign to one of their positions.",
    explanation:
      "s[index] = ch raises TypeError because strings do not support item assignment. Build a new string instead by slicing around the target index: s[:index] + ch + s[index + 1:].",
    examples: [
      { input: ["cat",0,"b"], expected: "bat" },
      { input: ["hello",4,"p"], expected: "hellp" },
    ],
    hiddenTests: [
      { input: ["a",0,"z"], expected: "z" },
    ],
  },
  {
    id: 'py-truncate-ellipsis',
    number: 46,
    language: 'python',
    title: "Truncate With Ellipsis",
    difficulty: 'Medium',
    topic: "Slicing",
    statement:
      "If the string fits within width characters, return it unchanged. Otherwise, shorten it so the result (including a trailing '...') is exactly width characters long. The truncated results are coming out too long.",
    functionName: 'truncate',
    functionSignature: "def truncate(s: str, width: int) -> str:",
    buggyCode:
      "def truncate(s: str, width: int) -> str:\n    if len(s) <= width:\n        return s\n    return s[:width] + \"...\"\n",
    hint: "The '...' adds three characters on top of the slice.",
    explanation:
      "s[:width] already produces width characters, and appending '...' makes the result width + 3 long. Leave room for the ellipsis by slicing to width - 3: s[:width - 3] + \"...\".",
    examples: [
      { input: ["hello world",8], expected: "hello..." },
      { input: ["hi",5], expected: "hi" },
    ],
    hiddenTests: [
      { input: ["abcdef",6], expected: "abcdef" },
      { input: ["abcdefg",6], expected: "abc..." },
    ],
  },
  {
    id: 'py-run-length-encode',
    number: 47,
    language: 'python',
    title: "Run-Length Encode",
    difficulty: 'Hard',
    topic: "Strings",
    statement:
      "Encode a string by replacing each run of identical characters with the character followed by its count, e.g. 'aaabb' -> 'a3b2'. An empty string returns ''. The last run keeps going missing from the output.",
    functionName: 'rle_encode',
    functionSignature: "def rle_encode(s: str) -> str:",
    buggyCode:
      "def rle_encode(s: str) -> str:\n    if not s:\n        return \"\"\n    result = \"\"\n    count = 1\n    for i in range(1, len(s)):\n        if s[i] == s[i - 1]:\n            count += 1\n        else:\n            result += s[i - 1] + str(count)\n            count = 1\n    return result\n",
    hint: "A run is only written out when a different character appears — what about the final run?",
    explanation:
      "The loop only flushes a run when it sees a change of character, so the final run (which has no character after it to trigger the else branch) is never appended. After the loop, append the last character and its count: result += s[-1] + str(count).",
    examples: [
      { input: ["aaabb"], expected: "a3b2" },
      { input: ["abc"], expected: "a1b1c1" },
    ],
    hiddenTests: [
      { input: ["a"], expected: "a1" },
      { input: [""], expected: "" },
    ],
  },
  {
    id: 'py-interleave-strings',
    number: 48,
    language: 'python',
    title: "Interleave Two Strings",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "Interleave two strings character by character (a[0], b[0], a[1], b[1], ...). When one string is longer, append its remaining characters at the end. The leftover tail keeps getting dropped.",
    functionName: 'interleave',
    functionSignature: "def interleave(a: str, b: str) -> str:",
    buggyCode:
      "def interleave(a: str, b: str) -> str:\n    result = \"\"\n    n = min(len(a), len(b))\n    for i in range(n):\n        result += a[i] + b[i]\n    return result\n",
    hint: "The loop stops at the shorter length — where do the extra characters go?",
    explanation:
      "The loop only runs up to the shorter string's length, so any tail from the longer string is never added. After the loop, append the leftovers with slicing: result += a[n:] + b[n:] (only one of these is non-empty).",
    examples: [
      { input: ["abc","xyz"], expected: "axbycz" },
      { input: ["ab","wxyz"], expected: "awbxyz" },
    ],
    hiddenTests: [
      { input: ["abcd","xy"], expected: "axbycd" },
      { input: ["","hi"], expected: "hi" },
    ],
  },
  {
    id: 'py-mutable-default-parity',
    number: 49,
    language: 'python',
    title: "Parity Groups Leak Between Calls",
    difficulty: 'Medium',
    topic: "Mutable Default Arguments",
    statement:
      "Split a list of integers into their even and odd members, returning {'even': [...], 'odd': [...]} in original order. Calling it a second time is wrong: results from earlier calls keep showing up.",
    functionName: 'group_by_parity',
    functionSignature: "def group_by_parity(nums: list[int], groups: dict = None) -> dict:",
    buggyCode:
      "def group_by_parity(nums, groups={'even': [], 'odd': []}):\n    for n in nums:\n        if n % 2 == 0:\n            groups['even'].append(n)\n        else:\n            groups['odd'].append(n)\n    return groups\n",
    hint: "A default argument is created once, when the function is defined — not on each call.",
    explanation:
      "The default dict (and its inner lists) is a single object shared across every call, so appended values accumulate between invocations. Use groups=None and build a fresh {'even': [], 'odd': []} inside the function when none is passed.",
    examples: [
      { input: [[1,2,3,4]], expected: {"even":[2,4],"odd":[1,3]} },
      { input: [[5,6]], expected: {"even":[6],"odd":[5]} },
    ],
    hiddenTests: [
      { input: [[]], expected: {"even":[],"odd":[]} },
      { input: [[2,4,6]], expected: {"even":[2,4,6],"odd":[]} },
    ],
  },
  {
    id: 'py-word-count-keyerror',
    number: 50,
    language: 'python',
    title: "Counting Without a Default",
    difficulty: 'Easy',
    topic: "Dictionaries",
    statement:
      "Given a list of words, return a dict mapping each word to how many times it appears. It crashes the moment it sees a new word.",
    functionName: 'word_count',
    functionSignature: "def word_count(words: list[str]) -> dict:",
    buggyCode:
      "def word_count(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts[w] + 1\n    return counts\n",
    hint: "The first time you see a word, it isn't in the dict yet.",
    explanation:
      "counts[w] raises KeyError for any word not already present. Read the current tally with counts.get(w, 0) so a missing word starts at 0 before you add one.",
    examples: [
      { input: [["a","b","a"]], expected: {"a":2,"b":1} },
      { input: [["x"]], expected: {"x":1} },
    ],
    hiddenTests: [
      { input: [[]], expected: {} },
      { input: [["z","z","z"]], expected: {"z":3} },
    ],
  },
  {
    id: 'py-common-items-dedupe',
    number: 51,
    language: 'python',
    title: "Intersection Keeps Duplicates",
    difficulty: 'Medium',
    topic: "Sets",
    statement:
      "Return the values that appear in both lists, each listed once, in the order they first appear in the first list. Repeated matches are being emitted more than once.",
    functionName: 'common_items',
    functionSignature: "def common_items(a: list[int], b: list[int]) -> list[int]:",
    buggyCode:
      "def common_items(a, b):\n    result = []\n    for x in a:\n        if x in b:\n            result.append(x)\n    return result\n",
    hint: "What happens when the same value appears twice in the first list?",
    explanation:
      "Iterating over `a` appends a value every time it recurs, so duplicates in `a` produce duplicate output. Track values already added in a set (and check membership against set(b) for speed) so each common value is appended only once.",
    examples: [
      { input: [[1,2,2,3],[2,3,4]], expected: [2,3] },
      { input: [[1,1,1],[1]], expected: [1] },
    ],
    hiddenTests: [
      { input: [[1,2],[3,4]], expected: [] },
      { input: [[5,6,5,7],[5,7]], expected: [5,7] },
    ],
  },
  {
    id: 'py-squares-of-evens',
    number: 52,
    language: 'python',
    title: "Comprehension Filters the Wrong Half",
    difficulty: 'Easy',
    topic: "Comprehensions",
    statement:
      "Return the squares of only the even numbers in the input list, preserving order. It is squaring the odd numbers instead.",
    functionName: 'squares_of_evens',
    functionSignature: "def squares_of_evens(nums: list[int]) -> list[int]:",
    buggyCode:
      "def squares_of_evens(nums):\n    return [n * n for n in nums if n % 2]\n",
    hint: "What is the truthiness of n % 2 for an even number?",
    explanation:
      "`if n % 2` keeps values where n % 2 is truthy (non-zero) — i.e. odd numbers. Even numbers give n % 2 == 0, which is falsy. Change the filter to `if n % 2 == 0`.",
    examples: [
      { input: [[1,2,3,4]], expected: [4,16] },
      { input: [[2,4]], expected: [4,16] },
    ],
    hiddenTests: [
      { input: [[1,3,5]], expected: [] },
      { input: [[0,6]], expected: [0,36] },
    ],
  },
  {
    id: 'py-transpose-aliased-rows',
    number: 53,
    language: 'python',
    title: "Transpose With Aliased Rows",
    difficulty: 'Hard',
    topic: "Aliasing",
    statement:
      "Transpose a rectangular matrix: element [i][j] of the input should become [j][i] of the output. Every output row ends up identical to the last.",
    functionName: 'transpose',
    functionSignature: "def transpose(matrix: list[list[int]]) -> list[list[int]]:",
    buggyCode:
      "def transpose(matrix):\n    rows = len(matrix)\n    cols = len(matrix[0])\n    result = [[0] * rows] * cols\n    for i in range(rows):\n        for j in range(cols):\n            result[j][i] = matrix[i][j]\n    return result\n",
    hint: "[[0] * rows] * cols makes 'cols' references to the SAME inner list.",
    explanation:
      "`[[0] * rows] * cols` replicates one inner list object `cols` times, so writing to result[j] writes to every row at once. Build independent rows with a comprehension: `[[0] * rows for _ in range(cols)]`.",
    examples: [
      { input: [[[1,2,3],[4,5,6]]], expected: [[1,4],[2,5],[3,6]] },
      { input: [[[1,2],[3,4]]], expected: [[1,3],[2,4]] },
    ],
    hiddenTests: [
      { input: [[[7]]], expected: [[7]] },
      { input: [[[1,2],[3,4],[5,6]]], expected: [[1,3,5],[2,4,6]] },
    ],
  },
  {
    id: 'py-group-by-first-letter',
    number: 54,
    language: 'python',
    title: "Grouping Overwrites Instead of Collecting",
    difficulty: 'Medium',
    topic: "Dictionaries",
    statement:
      "Group words by their first letter, returning a dict mapping each first letter to the list of words that start with it (in input order). Only the last word for each letter survives.",
    functionName: 'group_by_first_letter',
    functionSignature: "def group_by_first_letter(words: list[str]) -> dict:",
    buggyCode:
      "def group_by_first_letter(words):\n    groups = {}\n    for w in words:\n        key = w[0]\n        groups[key] = w\n    return groups\n",
    hint: "Each key should hold a list you append to, not a single value you overwrite.",
    explanation:
      "`groups[key] = w` replaces whatever was stored under that letter, keeping only the last word. Use `groups.setdefault(key, []).append(w)` to accumulate all words per letter.",
    examples: [
      { input: [["apple","ant","bee"]], expected: {"a":["apple","ant"],"b":["bee"]} },
      { input: [["cat"]], expected: {"c":["cat"]} },
    ],
    hiddenTests: [
      { input: [[]], expected: {} },
      { input: [["dog","deer","eel"]], expected: {"d":["dog","deer"],"e":["eel"]} },
    ],
  },
  {
    id: 'py-running-max-zero-seed',
    number: 55,
    language: 'python',
    title: "Running Maximum Seeded at Zero",
    difficulty: 'Medium',
    topic: "Lists",
    statement:
      "Return a list where each position holds the maximum of the input list up to and including that index. With all-negative inputs the answers come out as 0.",
    functionName: 'running_max',
    functionSignature: "def running_max(nums: list[int]) -> list[int]:",
    buggyCode:
      "def running_max(nums):\n    result = []\n    best = 0\n    for n in nums:\n        if n > best:\n            best = n\n        result.append(best)\n    return result\n",
    hint: "0 is not a safe starting maximum when values can be negative.",
    explanation:
      "Seeding `best = 0` assumes every value is at least 0, so negative inputs never exceed it and the max stays 0. Start with `best = None` and set it on the first element (`if best is None or n > best`).",
    examples: [
      { input: [[-3,-1,-5]], expected: [-3,-1,-1] },
      { input: [[1,3,2,5]], expected: [1,3,3,5] },
    ],
    hiddenTests: [
      { input: [[-1,-2]], expected: [-1,-1] },
      { input: [[4]], expected: [4] },
    ],
  },
  {
    id: 'py-flatten-depth',
    number: 56,
    language: 'python',
    title: "Recursion Without Collecting",
    difficulty: 'Medium',
    topic: "Recursion",
    statement:
      "Flatten an arbitrarily nested list of integers into a single flat list, preserving order.",
    functionName: 'flatten',
    functionSignature: "def flatten(nested: list) -> list:",
    buggyCode:
      "def flatten(nested: list) -> list:\n    result = []\n    for item in nested:\n        if isinstance(item, list):\n            flatten(item)\n        else:\n            result.append(item)\n    return result\n",
    hint: "The recursive call returns a flattened sublist. Are you doing anything with what it returns?",
    explanation:
      "The recursive call `flatten(item)` computes the flattened sublist but its return value is thrown away, so nested elements never make it into `result`. Fix it by collecting the result: `result.extend(flatten(item))`.",
    examples: [
      { input: [[1,[2,3],4]], expected: [1,2,3,4] },
      { input: [[[1],[2,[3,4]]]], expected: [1,2,3,4] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1,2,3]], expected: [1,2,3] },
      { input: [[[[[5]]]]], expected: [5] },
    ],
  },
  {
    id: 'py-sort-by-length-then-alpha',
    number: 57,
    language: 'python',
    title: "Length First, Then Alphabetical",
    difficulty: 'Easy',
    topic: "Sort Keys",
    statement:
      "Sort words by ascending length, and break ties alphabetically (ascending). Return a new list.",
    functionName: 'sort_words',
    functionSignature: "def sort_words(words: list) -> list:",
    buggyCode:
      "def sort_words(words: list) -> list:\n    return sorted(words, key=lambda w: len(w))\n",
    hint: "Words of equal length aren't ordered. What secondary key would break the tie?",
    explanation:
      "Sorting only by `len(w)` leaves words of the same length in their original (input) order rather than alphabetical order. A tuple key sorts by length first, then by the word itself: `key=lambda w: (len(w), w)`.",
    examples: [
      { input: [["banana","apple","kiwi","fig"]], expected: ["fig","kiwi","apple","banana"] },
      { input: [["bb","aa","c"]], expected: ["c","aa","bb"] },
    ],
    hiddenTests: [
      { input: [["dog","cat","ant"]], expected: ["ant","cat","dog"] },
      { input: [[]], expected: [] },
      { input: [["ba","ab","z"]], expected: ["z","ab","ba"] },
    ],
  },
  {
    id: 'py-first-truthy',
    number: 58,
    language: 'python',
    title: "First Value That Was Set",
    difficulty: 'Medium',
    topic: "Truthiness / None",
    statement:
      "Return the first value in the list that is not None (i.e. the first value that was actually provided). If every value is None, return `default`. Note that 0, False and \"\" are all valid provided values.",
    functionName: 'first_truthy',
    functionSignature: "def first_truthy(values: list, default=None):",
    buggyCode:
      "def first_truthy(values: list, default=None):\n    for v in values:\n        if v:\n            return v\n    return default\n",
    hint: "0, False and \"\" are falsy but they are still values. What distinguishes 'not provided'?",
    explanation:
      "`if v:` skips any falsy value (0, False, \"\", empty containers), but those are legitimate provided values — only None means 'not provided'. Test explicitly with `if v is not None:` so the first real value is returned.",
    examples: [
      { input: [[null,0,5]], expected: 0 },
      { input: [[null,null,"hi"]], expected: "hi" },
    ],
    hiddenTests: [
      { input: [[null,false,3]], expected: false },
      { input: [[null,null],"x"], expected: "x" },
      { input: [[""]], expected: "" },
    ],
  },
  {
    id: 'py-count-leaves',
    number: 59,
    language: 'python',
    title: "Adding Up Recursive Counts",
    difficulty: 'Medium',
    topic: "Recursion",
    statement:
      "Count the leaf nodes of a tree. Each node is a dict; a node with no `children` (missing or empty) is a leaf and counts as 1. Sum the leaf counts of all children otherwise.",
    functionName: 'count_leaves',
    functionSignature: "def count_leaves(tree: dict) -> int:",
    buggyCode:
      "def count_leaves(tree: dict) -> int:\n    if not tree.get(\"children\"):\n        return 1\n    total = 0\n    for child in tree[\"children\"]:\n        total = count_leaves(child)\n    return total\n",
    hint: "Look at how `total` is updated inside the loop — is it accumulating or overwriting?",
    explanation:
      "`total = count_leaves(child)` overwrites `total` each iteration, so only the last child's count survives. Accumulate instead with `total += count_leaves(child)`.",
    examples: [
      { input: [{"children":[{"children":[]},{"children":[]}]}], expected: 2 },
      { input: [{"children":[]}], expected: 1 },
    ],
    hiddenTests: [
      { input: [{"children":[{"children":[{"children":[]},{"children":[]}]},{"children":[]}]}], expected: 3 },
      { input: [{}], expected: 1 },
      { input: [{"children":[{"children":[]},{"children":[]},{"children":[]}]}], expected: 3 },
    ],
  },
  {
    id: 'py-max-by-abs',
    number: 60,
    language: 'python',
    title: "Largest by Magnitude",
    difficulty: 'Easy',
    topic: "Comparison",
    statement:
      "Return the element with the largest absolute value (keeping its original sign). On ties keep the first such element. Return None for an empty list.",
    functionName: 'max_by_abs',
    functionSignature: "def max_by_abs(nums: list) -> int:",
    buggyCode:
      "def max_by_abs(nums: list) -> int:\n    if not nums:\n        return None\n    best = nums[0]\n    for n in nums:\n        if abs(n) > abs(best):\n            best = abs(n)\n    return best\n",
    hint: "You compare by magnitude — but what do you store as the new best?",
    explanation:
      "When a larger magnitude is found the code stores `abs(n)` instead of `n`, stripping the sign. Store the original value: `best = n`. The comparison already uses `abs` on both sides.",
    examples: [
      { input: [[1,-5,3]], expected: -5 },
      { input: [[2,-2,1]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[-10,4,7]], expected: -10 },
      { input: [[]], expected: null },
      { input: [[-3,-8,-1]], expected: -8 },
    ],
  },
  {
    id: 'py-count-provided',
    number: 61,
    language: 'python',
    title: "Count the Non-None Values",
    difficulty: 'Easy',
    topic: "Truthiness / None",
    statement:
      "Count how many values in the list are not None. Values like 0, False and \"\" ARE counted — only None is excluded.",
    functionName: 'count_provided',
    functionSignature: "def count_provided(values: list) -> int:",
    buggyCode:
      "def count_provided(values: list) -> int:\n    count = 0\n    for v in values:\n        if v:\n            count += 1\n    return count\n",
    hint: "`if v:` treats 0, False and \"\" the same as None. Only None should be skipped.",
    explanation:
      "`if v:` is a truthiness test, so falsy-but-present values (0, False, \"\", empty strings) are wrongly skipped. Count anything that isn't None with `if v is not None:`.",
    examples: [
      { input: [[1,0,null,3]], expected: 3 },
      { input: [["a","",null]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[0,0,0]], expected: 3 },
      { input: [[null,null]], expected: 0 },
      { input: [[false,true,null]], expected: 2 },
    ],
  },
  {
    id: 'py-power-recursive',
    number: 62,
    language: 'python',
    title: "Power's Missing Base Case",
    difficulty: 'Hard',
    topic: "Recursion",
    statement:
      "Compute base raised to a non-negative integer exponent recursively. By definition base**0 == 1.",
    functionName: 'power',
    functionSignature: "def power(base: int, exp: int) -> int:",
    buggyCode:
      "def power(base: int, exp: int) -> int:\n    if exp == 1:\n        return base\n    return base * power(base, exp - 1)\n",
    hint: "What should power(base, 0) return? Trace the recursion down from exp=1.",
    explanation:
      "The base case triggers at exp == 1, so exp == 0 is never handled correctly — power(base, 0) recurses into negative exponents (infinite recursion / RecursionError) instead of returning 1. Anchor the recursion at zero: `if exp == 0: return 1`.",
    examples: [
      { input: [2,3], expected: 8 },
      { input: [5,0], expected: 1 },
    ],
    hiddenTests: [
      { input: [3,2], expected: 9 },
      { input: [7,1], expected: 7 },
      { input: [2,10], expected: 1024 },
      { input: [10,0], expected: 1 },
    ],
  },
  {
    id: 'py-percent-change-zero-base',
    number: 63,
    language: 'python',
    title: "Percent Change From Zero",
    difficulty: 'Easy',
    topic: "Numbers",
    statement:
      "Return the percent change from old to new, computed as (new - old) / old * 100. When the old value is 0, treat the percent change as 0.0 instead of dividing by zero.",
    functionName: 'percent_change',
    functionSignature: "def percent_change(old: float, new: float) -> float:",
    buggyCode:
      "def percent_change(old: float, new: float) -> float:\n    return (new - old) / old * 100\n",
    hint: "What happens to the formula when old is 0?",
    explanation:
      "Dividing by old raises ZeroDivisionError (or produces a wrong result) whenever old is 0. The fix guards the zero case up front and returns 0.0 before doing the division.",
    examples: [
      { input: [100,150], expected: 50 },
      { input: [200,100], expected: -50 },
      { input: [0,5], expected: 0 },
    ],
    hiddenTests: [
      { input: [50,50], expected: 0 },
      { input: [0,0], expected: 0 },
    ],
  },
  {
    id: 'py-average-evens-int-div',
    number: 64,
    language: 'python',
    title: "Average of the Evens",
    difficulty: 'Easy',
    topic: "Numbers",
    statement:
      "Return the average (a float) of the even numbers in the list. If there are no even numbers, return 0.0.",
    functionName: 'average_evens',
    functionSignature: "def average_evens(nums: list) -> float:",
    buggyCode:
      "def average_evens(nums: list) -> float:\n    evens = [n for n in nums if n % 2 == 0]\n    if not evens:\n        return 0.0\n    return sum(evens) // len(evens)\n",
    hint: "Which division operator throws away the fractional part?",
    explanation:
      "The // operator does floor (integer) division, so a true average like 4.666... comes back as 4. Using / performs true division and returns the correct float.",
    examples: [
      { input: [[2,6,5]], expected: 4 },
      { input: [[2,4,6]], expected: 4 },
      { input: [[1,3,5]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[2,3]], expected: 2 },
      { input: [[1,2,4,8]], expected: 4.666666666666667 },
    ],
  },
  {
    id: 'py-clamp-upper-bound',
    number: 65,
    language: 'python',
    title: "Clamp to a Range",
    difficulty: 'Easy',
    topic: "Conditionals",
    statement:
      "Clamp x into the inclusive range [low, high]: return low if x is below low, high if x is above high, otherwise x itself.",
    functionName: 'clamp',
    functionSignature: "def clamp(x: int, low: int, high: int) -> int:",
    buggyCode:
      "def clamp(x: int, low: int, high: int) -> int:\n    if x < low:\n        return low\n    if x > high:\n        return low\n    return x\n",
    hint: "Look closely at what the too-high branch returns.",
    explanation:
      "When x exceeds high the function mistakenly returns low instead of high, so large values got snapped to the bottom of the range. The over-the-top branch should return high.",
    examples: [
      { input: [5,0,10], expected: 5 },
      { input: [-3,0,10], expected: 0 },
      { input: [15,0,10], expected: 10 },
    ],
    hiddenTests: [
      { input: [10,0,10], expected: 10 },
      { input: [0,0,10], expected: 0 },
    ],
  },
  {
    id: 'py-safe-divide-wrong-except',
    number: 66,
    language: 'python',
    title: "Catch the Right Error",
    difficulty: 'Medium',
    topic: "Exceptions",
    statement:
      "Return a / b as a float. If b is 0, catch the error and return None instead of crashing.",
    functionName: 'safe_divide',
    functionSignature: "def safe_divide(a: float, b: float):",
    buggyCode:
      "def safe_divide(a: float, b: float):\n    try:\n        return a / b\n    except ValueError:\n        return None\n",
    hint: "What exception type does dividing by zero actually raise?",
    explanation:
      "Dividing by zero raises ZeroDivisionError, not ValueError, so the except clause never matched and the error propagated. Catching ZeroDivisionError makes the guard work.",
    examples: [
      { input: [10,2], expected: 5 },
      { input: [7,0], expected: null },
      { input: [0,5], expected: 0 },
    ],
    hiddenTests: [
      { input: [9,3], expected: 3 },
    ],
  },
  {
    id: 'py-factorial-range-off-by-one',
    number: 67,
    language: 'python',
    title: "Factorial Off By One",
    difficulty: 'Medium',
    topic: "Loops",
    statement:
      "Return n! (the product of all integers from 1 to n). By convention 0! is 1.",
    functionName: 'factorial',
    functionSignature: "def factorial(n: int) -> int:",
    buggyCode:
      "def factorial(n: int) -> int:\n    result = 1\n    for i in range(1, n):\n        result *= i\n    return result\n",
    hint: "Does range(1, n) ever include n itself?",
    explanation:
      "range(1, n) stops at n-1, so the final factor n is never multiplied in and the answer is n! / n. Using range(1, n + 1) includes n and produces the correct product.",
    examples: [
      { input: [5], expected: 120 },
      { input: [0], expected: 1 },
      { input: [1], expected: 1 },
    ],
    hiddenTests: [
      { input: [4], expected: 24 },
      { input: [6], expected: 720 },
    ],
  },
  {
    id: 'py-leap-year-full-rule',
    number: 68,
    language: 'python',
    title: "Leap Year Rules",
    difficulty: 'Hard',
    topic: "Conditionals",
    statement:
      "Return True if year is a leap year. A year is a leap year if it is divisible by 4, except centuries (divisible by 100), which are leap years only when also divisible by 400.",
    functionName: 'is_leap_year',
    functionSignature: "def is_leap_year(year: int) -> bool:",
    buggyCode:
      "def is_leap_year(year: int) -> bool:\n    return year % 4 == 0\n",
    hint: "1900 is divisible by 4 but is not a leap year — why?",
    explanation:
      "Testing only divisibility by 4 wrongly treats non-400 centuries like 1900 and 2100 as leap years. The full rule also requires that if the year is divisible by 100 it must be divisible by 400.",
    examples: [
      { input: [2024], expected: true },
      { input: [1900], expected: false },
      { input: [2000], expected: true },
    ],
    hiddenTests: [
      { input: [2023], expected: false },
      { input: [2100], expected: false },
    ],
  },
  {
    id: 'py-join-needs-strings',
    number: 69,
    language: 'python',
    title: 'Join Needs Strings',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      "Return the numbers joined into one string separated by ', ' (for example [1, 2, 3] becomes '1, 2, 3'). An empty list should return ''. The code crashes with a TypeError on every non-empty input.",
    functionName: 'join_numbers',
    functionSignature: 'def join_numbers(nums: list[int]) -> str:',
    buggyCode:
      "def join_numbers(nums: list[int]) -> str:\n    return ', '.join(nums)\n",
    hint: 'str.join only accepts an iterable of strings — what type are the items here?',
    explanation:
      "str.join raises TypeError when any element is not a str; it never converts for you. Convert each number first: ', '.join(str(n) for n in nums).",
    examples: [
      { input: [[1, 2, 3]], expected: '1, 2, 3' },
      { input: [[42]], expected: '42' },
    ],
    hiddenTests: [
      { input: [[]], expected: '' },
      { input: [[-1, 0, 7]], expected: '-1, 0, 7' },
    ],
  },
  {
    id: 'py-sort-numeric-strings',
    number: 70,
    language: 'python',
    title: 'Sorting Numbers as Strings',
    difficulty: 'Easy',
    topic: 'Sorting',
    statement:
      "Given a list of integers stored as strings (e.g. from a CSV), return them sorted in ascending numeric order, still as strings. Right now '100' sorts before '9'.",
    functionName: 'sort_numeric_strings',
    functionSignature: 'def sort_numeric_strings(values: list[str]) -> list[str]:',
    buggyCode:
      'def sort_numeric_strings(values: list[str]) -> list[str]:\n    return sorted(values)\n',
    hint: "Strings compare character by character: '1' < '9', so '100' < '9'. Sort by the numeric value instead.",
    explanation:
      "sorted() on strings orders them lexicographically, so '10' lands before '9'. Pass a key that converts each item to a number: sorted(values, key=int). The items themselves stay strings.",
    examples: [
      { input: [['10', '9', '100']], expected: ['9', '10', '100'] },
      { input: [['3', '1', '2']], expected: ['1', '2', '3'] },
    ],
    hiddenTests: [
      { input: [['-5', '20', '7']], expected: ['-5', '7', '20'] },
      { input: [[]], expected: [] },
      { input: [['25', '3', '250', '4']], expected: ['3', '4', '25', '250'] },
    ],
  },
  {
    id: 'py-attribute-never-stored',
    number: 71,
    language: 'python',
    title: 'Attribute Never Stored',
    difficulty: 'Easy',
    topic: 'Classes',
    statement:
      "Create an Account with a starting balance, apply every deposit, and return the final balance. Calling deposit raises AttributeError: 'Account' object has no attribute 'balance'.",
    functionName: 'final_balance',
    functionSignature: 'def final_balance(start: int, deposits: list[int]) -> int:',
    buggyCode:
      "class Account:\n    def __init__(self, balance):\n        balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n\ndef final_balance(start: int, deposits: list[int]) -> int:\n    acct = Account(start)\n    for d in deposits:\n        acct.deposit(d)\n    return acct.balance\n",
    hint: 'Look at __init__. Where does the starting balance actually go?',
    explanation:
      "Inside __init__, `balance = balance` just rebinds a local name to itself; nothing is attached to the instance. Attributes must be set through self: `self.balance = balance`. Without it, deposit's `self.balance += amount` has nothing to read.",
    examples: [
      { input: [100, [50, 25]], expected: 175 },
      { input: [0, [10]], expected: 10 },
    ],
    hiddenTests: [
      { input: [5, []], expected: 5 },
      { input: [20, [-5, -15]], expected: 0 },
    ],
  },
  {
    id: 'py-shadowed-builtin-sum',
    number: 72,
    language: 'python',
    title: 'Shadowed Built-in',
    difficulty: 'Easy',
    topic: 'Scope',
    statement:
      "Return a dict with the sum of the numbers and the sum of their squares, e.g. [1, 2] -> {'sum': 3, 'sum_squares': 5}. The code crashes with TypeError: 'int' object is not callable.",
    functionName: 'summarize',
    functionSignature: 'def summarize(nums: list[int]) -> dict:',
    buggyCode:
      "def summarize(nums: list[int]) -> dict:\n    sum = 0\n    for n in nums:\n        sum += n\n    squares = [n * n for n in nums]\n    return {'sum': sum, 'sum_squares': sum(squares)}\n",
    hint: 'By the time sum(squares) runs, what does the name `sum` refer to in this function?',
    explanation:
      "Assigning `sum = 0` shadows the built-in sum() for the whole function, so the later call sum(squares) tries to call an int. Rename the local (e.g. `total`) so the built-in stays available — or just use the built-in for both: sum(nums) and sum(squares).",
    examples: [
      { input: [[1, 2]], expected: { sum: 3, sum_squares: 5 } },
      { input: [[3, 4]], expected: { sum: 7, sum_squares: 25 } },
    ],
    hiddenTests: [
      { input: [[]], expected: { sum: 0, sum_squares: 0 } },
      { input: [[-2, 2]], expected: { sum: 0, sum_squares: 8 } },
    ],
  },
  {
    id: 'py-empty-split-count',
    number: 73,
    language: 'python',
    title: 'Empty String Splits Into One',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      "Given a comma-separated tag string like 'a,b,c', return how many tags it holds. An empty or whitespace-only string has zero tags, but the code reports 1.",
    functionName: 'count_tags',
    functionSignature: 'def count_tags(csv: str) -> int:',
    buggyCode:
      "def count_tags(csv: str) -> int:\n    return len(csv.split(','))\n",
    hint: "Try ''.split(',') in a REPL. How many items come back?",
    explanation:
      "Splitting on an explicit separator never returns an empty list: ''.split(',') is [''], so the count is 1. Guard the empty case first: `if not csv.strip(): return 0`, then count the split.",
    examples: [
      { input: ['a,b,c'], expected: 3 },
      { input: [''], expected: 0 },
    ],
    hiddenTests: [
      { input: ['solo'], expected: 1 },
      { input: ['   '], expected: 0 },
      { input: ['x,y'], expected: 2 },
    ],
  },
  {
    id: 'py-all-on-empty',
    number: 74,
    language: 'python',
    title: 'Vacuous Truth',
    difficulty: 'Medium',
    topic: 'Built-ins',
    statement:
      "A team is ready when every member has confirmed. A team with no members is NOT ready. Each member is a dict like {'name': 'ana', 'confirmed': True}. The code returns True for an empty team.",
    functionName: 'team_ready',
    functionSignature: 'def team_ready(members: list[dict]) -> bool:',
    buggyCode:
      "def team_ready(members: list[dict]) -> bool:\n    return all(m['confirmed'] for m in members)\n",
    hint: 'What does all() return when the iterable produces nothing at all?',
    explanation:
      "all() over an empty iterable is True (vacuous truth): there is no counterexample, so it reports success. The spec needs at least one member, so check that first: `return bool(members) and all(m['confirmed'] for m in members)`.",
    examples: [
      { input: [[{ name: 'ana', confirmed: true }, { name: 'bo', confirmed: true }]], expected: true },
      { input: [[]], expected: false },
    ],
    hiddenTests: [
      { input: [[{ name: 'ana', confirmed: true }, { name: 'bo', confirmed: false }]], expected: false },
      { input: [[{ name: 'solo', confirmed: true }]], expected: true },
    ],
  },
  {
    id: 'py-nonlocal-counter',
    number: 75,
    language: 'python',
    title: "Inner Function Can't Rebind",
    difficulty: 'Medium',
    topic: 'Scope',
    statement:
      'Count how many words start with the given prefix, using a small helper that visits each word. The code raises UnboundLocalError: local variable \'count\' referenced before assignment.',
    functionName: 'count_with_prefix',
    functionSignature: 'def count_with_prefix(words: list[str], prefix: str) -> int:',
    buggyCode:
      'def count_with_prefix(words: list[str], prefix: str) -> int:\n    count = 0\n\n    def visit(word):\n        if word.startswith(prefix):\n            count += 1\n\n    for w in words:\n        visit(w)\n    return count\n',
    hint: 'Assigning to a name inside a nested function makes it local to that function. How do you tell Python you mean the enclosing one?',
    explanation:
      "`count += 1` is an assignment, so Python treats `count` as a local of visit — and it has no value yet when read. Declare `nonlocal count` at the top of visit so the increment targets the enclosing function's variable. (Reading an outer variable is fine; only rebinding needs nonlocal.)",
    examples: [
      { input: [['apple', 'apricot', 'banana'], 'ap'], expected: 2 },
      { input: [['dog', 'door', 'cat'], 'do'], expected: 2 },
    ],
    hiddenTests: [
      { input: [['aa', 'ab', 'ba'], 'a'], expected: 2 },
      { input: [[], 'x'], expected: 0 },
      { input: [['hello'], 'hello'], expected: 1 },
    ],
  },
  {
    id: 'py-last-n-negative-zero',
    number: 76,
    language: 'python',
    title: 'Last N Items',
    difficulty: 'Medium',
    topic: 'Slicing',
    statement:
      'Return the last n items of a list (all of them if n exceeds the length). For n = 0 the result must be an empty list, but the code returns the whole list instead.',
    functionName: 'last_n',
    functionSignature: 'def last_n(nums: list[int], n: int) -> list[int]:',
    buggyCode:
      'def last_n(nums: list[int], n: int) -> list[int]:\n    return nums[-n:]\n',
    hint: 'What is -0? What does nums[0:] give you?',
    explanation:
      "-0 is just 0, so nums[-0:] is nums[0:] — the entire list. Handle zero explicitly (`if n == 0: return []`) or slice from a computed start: `nums[max(len(nums) - n, 0):]`.",
    examples: [
      { input: [[1, 2, 3, 4], 2], expected: [3, 4] },
      { input: [[1, 2, 3], 0], expected: [] },
    ],
    hiddenTests: [
      { input: [[1, 2], 5], expected: [1, 2] },
      { input: [[], 0], expected: [] },
      { input: [[9, 8, 7], 3], expected: [9, 8, 7] },
    ],
  },
  {
    id: 'py-counted-before-checked',
    number: 77,
    language: 'python',
    title: 'Counted Before It Was Checked',
    difficulty: 'Medium',
    topic: 'Exceptions',
    statement:
      "Return the average of the values that parse as numbers, ignoring anything that does not (return 0.0 if none parse). ['1', '2', 'x'] should give 1.5, but the code returns 1.0.",
    functionName: 'average_valid',
    functionSignature: 'def average_valid(values: list[str]) -> float:',
    buggyCode:
      'def average_valid(values: list[str]) -> float:\n    total = 0.0\n    count = 0\n    for v in values:\n        try:\n            count += 1\n            total += float(v)\n        except ValueError:\n            continue\n    return total / count if count else 0.0\n',
    hint: 'Which statements inside the try have already run by the time float(v) raises?',
    explanation:
      "Everything in the try body before the failing line still executes, so count is incremented even for values that then fail to parse. Only mutate state after the risky operation succeeds: parse into a temporary first, then update total and count.",
    examples: [
      { input: [['1', '2', 'x']], expected: 1.5 },
      { input: [['4']], expected: 4.0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0.0 },
      { input: [['1.5', '2.5', 'oops', '4']], expected: 2.6666666666666665 },
      { input: [['a', 'b']], expected: 0.0 },
    ],
  },
  {
    id: 'py-json-keys-are-strings',
    number: 78,
    language: 'python',
    title: 'Keys Are Strings',
    difficulty: 'Medium',
    topic: 'Type Coercion',
    statement:
      "A word table loaded from JSON maps digit strings to words, e.g. {'1': 'one', '2': 'two'}. Given a list of int digits, return the matching words in order. Every lookup raises KeyError.",
    functionName: 'digits_to_words',
    functionSignature: 'def digits_to_words(digits: list[int], words: dict) -> list[str]:',
    buggyCode:
      'def digits_to_words(digits: list[int], words: dict) -> list[str]:\n    return [words[d] for d in digits]\n',
    hint: "Is 1 the same dict key as '1'?",
    explanation:
      "JSON object keys are always strings, so the table's keys are '1', '2', ... while the digits are ints. 1 == '1' is False and they hash differently, so words[1] misses. Convert at lookup time: words[str(d)].",
    examples: [
      { input: [[1, 2], { '1': 'one', '2': 'two' }], expected: ['one', 'two'] },
      { input: [[3, 3, 1], { '1': 'one', '3': 'three' }], expected: ['three', 'three', 'one'] },
    ],
    hiddenTests: [
      { input: [[], { '1': 'one' }], expected: [] },
      { input: [[0, 9], { '0': 'zero', '9': 'nine' }], expected: ['zero', 'nine'] },
    ],
  },
  {
    id: 'py-dollars-to-cents-truncation',
    number: 79,
    language: 'python',
    title: 'Dollars to Cents',
    difficulty: 'Medium',
    topic: 'Floats',
    statement:
      'Convert a price in dollars (at most two decimal places) to an integer number of cents. 19.99 should become 1999, but the code returns 1998.',
    functionName: 'to_cents',
    functionSignature: 'def to_cents(price: float) -> int:',
    buggyCode:
      'def to_cents(price: float) -> int:\n    return int(price * 100)\n',
    hint: 'Evaluate 19.99 * 100 in a REPL. Then remember that int() truncates toward zero.',
    explanation:
      '19.99 cannot be represented exactly in binary floating point, so 19.99 * 100 is 1998.9999999999998, and int() chops it to 1998. Round to the nearest integer instead: round(price * 100). (For real money code, use the decimal module.)',
    examples: [
      { input: [19.99], expected: 1999 },
      { input: [2.0], expected: 200 },
    ],
    hiddenTests: [
      { input: [0.29], expected: 29 },
      { input: [1.15], expected: 115 },
      { input: [10.5], expected: 1050 },
    ],
  },
  {
    id: 'py-isdigit-rejects-sign',
    number: 80,
    language: 'python',
    title: 'Digits Only Misses the Sign',
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      "Sum every token that is a valid integer (negatives included) and skip the rest. ['5', '-3', 'x'] should give 2, but the code returns 5.",
    functionName: 'sum_integers',
    functionSignature: 'def sum_integers(tokens: list[str]) -> int:',
    buggyCode:
      'def sum_integers(tokens: list[str]) -> int:\n    total = 0\n    for t in tokens:\n        if t.isdigit():\n            total += int(t)\n    return total\n',
    hint: "What does '-3'.isdigit() return?",
    explanation:
      "str.isdigit() only says whether every character is a digit, so a leading minus sign makes it False and negatives are silently skipped. Either strip the sign before checking (t.lstrip('-').isdigit()) or, more robustly, attempt int(t) and catch ValueError.",
    examples: [
      { input: [['5', '-3', 'x']], expected: 2 },
      { input: [['1', '2', '3']], expected: 6 },
    ],
    hiddenTests: [
      { input: [['-10', 'abc', '4']], expected: -6 },
      { input: [[]], expected: 0 },
      { input: [['3.5', '7', '-1']], expected: 6 },
    ],
  },
  {
    id: 'py-yield-makes-generator',
    number: 81,
    language: 'python',
    title: 'Yield Makes a Generator',
    difficulty: 'Medium',
    topic: 'Generators',
    statement:
      "Return a list of the words that start with the given letter, in order. Callers complain they get a '<generator object ...>' instead of a list — even for an empty input, where the early `return []` should have fired.",
    functionName: 'find_matches',
    functionSignature: 'def find_matches(words: list[str], letter: str) -> list[str]:',
    buggyCode:
      'def find_matches(words: list[str], letter: str) -> list[str]:\n    if not words:\n        return []\n    for w in words:\n        if w.startswith(letter):\n            yield w\n',
    hint: 'A single yield anywhere in the body changes what calling the function does — before a single line runs.',
    explanation:
      'Because the body contains yield, the whole function is a generator function: calling it returns a generator object immediately and runs nothing, so `return []` is never reached and no list is ever produced. Build and return a list instead (append in the loop, or a list comprehension).',
    examples: [
      { input: [['apple', 'avocado', 'berry'], 'a'], expected: ['apple', 'avocado'] },
      { input: [[], 'a'], expected: [] },
    ],
    hiddenTests: [
      { input: [['x', 'y'], 'z'], expected: [] },
      { input: [['bob', 'bill', 'ann', 'ben'], 'b'], expected: ['bob', 'bill', 'ben'] },
    ],
  },
  {
    id: 'py-eq-without-hash',
    number: 82,
    language: 'python',
    title: 'Unhashable Points',
    difficulty: 'Hard',
    topic: 'Classes',
    statement:
      'Count the distinct points in a list of [x, y] pairs by building Point objects and putting them in a set. Point defines equality, yet the code crashes with TypeError: unhashable type: \'Point\'.',
    functionName: 'count_unique_points',
    functionSignature: 'def count_unique_points(coords: list[list[int]]) -> int:',
    buggyCode:
      'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __eq__(self, other):\n        return isinstance(other, Point) and self.x == other.x and self.y == other.y\n\n\ndef count_unique_points(coords: list[list[int]]) -> int:\n    points = {Point(x, y) for x, y in coords}\n    return len(points)\n',
    hint: 'What happens to __hash__ when a class defines __eq__ but not __hash__?',
    explanation:
      "Defining __eq__ without __hash__ sets __hash__ to None, so instances can no longer go in sets or be dict keys — Python refuses because equal objects must hash equally and it can't guarantee that for you. Add a consistent hash: `def __hash__(self): return hash((self.x, self.y))`.",
    examples: [
      { input: [[[0, 0], [1, 1], [0, 0]]], expected: 2 },
      { input: [[[1, 2]]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[[3, 4], [4, 3], [3, 4], [3, 4]]], expected: 2 },
      { input: [[]], expected: 0 },
      { input: [[[5, 5], [5, 5], [5, 5]]], expected: 1 },
    ],
  },
  {
    id: 'py-version-string-compare',
    number: 83,
    language: 'python',
    title: 'Newest Version',
    difficulty: 'Hard',
    topic: 'Sorting',
    statement:
      "Given dotted version strings like '1.10.0', return the newest one, comparing each numeric component. ['1.9.0', '1.10.0'] should give '1.10.0', but the code picks '1.9.0'.",
    functionName: 'newest_version',
    functionSignature: 'def newest_version(versions: list[str]) -> str:',
    buggyCode:
      'def newest_version(versions: list[str]) -> str:\n    return max(versions)\n',
    hint: "Compare '1.10' and '1.9' as strings: which character decides it?",
    explanation:
      "max() compares the strings character by character, and '1' < '9' makes '1.10.0' look smaller than '1.9.0'. Compare tuples of ints instead: max(versions, key=lambda v: tuple(int(p) for p in v.split('.'))). Tuples compare component by component, and a shorter prefix sorts before a longer one.",
    examples: [
      { input: [['1.9.0', '1.10.0', '1.2.3']], expected: '1.10.0' },
      { input: [['2.0.0', '1.99.99']], expected: '2.0.0' },
    ],
    hiddenTests: [
      { input: [['0.9', '0.10']], expected: '0.10' },
      { input: [['3.1.4']], expected: '3.1.4' },
      { input: [['1.2', '1.2.1', '1.12']], expected: '1.12' },
    ],
  },
  {
    id: 'py-reverse-flips-tiebreak',
    number: 84,
    language: 'python',
    title: 'Descending Score, Ascending Name',
    difficulty: 'Hard',
    topic: 'Sort Keys',
    statement:
      "Each player is a [name, score] pair. Return the names ordered by score from highest to lowest; players with equal scores should appear alphabetically. Ties currently come out in reverse alphabetical order.",
    functionName: 'rank_players',
    functionSignature: 'def rank_players(players: list[list]) -> list[str]:',
    buggyCode:
      'def rank_players(players: list[list]) -> list[str]:\n    ordered = sorted(players, key=lambda p: (p[1], p[0]), reverse=True)\n    return [p[0] for p in ordered]\n',
    hint: 'reverse=True reverses the entire key, not just its first component.',
    explanation:
      'reverse=True flips every part of the comparison, so names are sorted Z to A as well. To mix directions, negate the numeric component and keep the natural order: sorted(players, key=lambda p: (-p[1], p[0])) with no reverse flag. (Strings cannot be negated, so the numeric field is the one to invert.)',
    examples: [
      { input: [[['bob', 10], ['alice', 10], ['carol', 20]]], expected: ['carol', 'alice', 'bob'] },
      { input: [[['dan', 5], ['ann', 5], ['cat', 5]]], expected: ['ann', 'cat', 'dan'] },
    ],
    hiddenTests: [
      { input: [[['zed', 3], ['amy', 7]]], expected: ['amy', 'zed'] },
      { input: [[['x', 1]]], expected: ['x'] },
      { input: [[['mia', 8], ['leo', 9], ['kai', 8], ['ivy', 9]]], expected: ['ivy', 'leo', 'kai', 'mia'] },
    ],
  },
  {
    id: 'py-memo-leaks-between-grids',
    number: 85,
    language: 'python',
    title: 'Memo Leaks Between Grids',
    difficulty: 'Hard',
    topic: 'Memoization',
    statement:
      'Count the paths from the top-left to the bottom-right of a grid moving only right or down, where 1 marks a blocked cell. Results are memoized by (row, col). The first call is right, but later calls with different grids return stale counts.',
    functionName: 'count_paths',
    functionSignature: 'def count_paths(grid: list[list[int]]) -> int:',
    buggyCode:
      'def count_paths(grid: list[list[int]], memo={}) -> int:\n    rows, cols = len(grid), len(grid[0])\n\n    def walk(r, c):\n        if r >= rows or c >= cols or grid[r][c] == 1:\n            return 0\n        if r == rows - 1 and c == cols - 1:\n            return 1\n        if (r, c) in memo:\n            return memo[(r, c)]\n        memo[(r, c)] = walk(r + 1, c) + walk(r, c + 1)\n        return memo[(r, c)]\n\n    return walk(0, 0)\n',
    hint: 'The memo is keyed only by position. Which grid did those cached positions come from?',
    explanation:
      'The default `memo={}` is created once and shared by every call, so a (row, col) entry cached for one grid is reused for a completely different grid. Create the cache per call: default to None and set `memo = {}` inside the function (or simply build the dict locally and drop the parameter).',
    examples: [
      { input: [[[0, 0], [0, 0]]], expected: 2 },
      { input: [[[0, 0, 0], [0, 0, 0]]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[[0, 1], [0, 0]]], expected: 1 },
      { input: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: 6 },
      { input: [[[0, 0], [1, 0]]], expected: 1 },
    ],
  },
  {
    id: 'py-set-update-splits-string',
    number: 86,
    language: 'python',
    title: 'Tag Explodes Into Letters',
    difficulty: 'Easy',
    topic: 'Sets',
    statement:
      'Add a tag to a collection of tags (no duplicates) and return the tags as a sorted list. Adding "new" to ["a", "b"] should give ["a", "b", "new"], but the code returns ["a", "b", "e", "n", "w"].',
    functionName: 'add_tag',
    functionSignature: 'def add_tag(tags: list[str], tag: str) -> list[str]:',
    buggyCode:
      'def add_tag(tags: list[str], tag: str) -> list[str]:\n    seen = set(tags)\n    seen.update(tag)\n    return sorted(seen)\n',
    hint: 'set.update() takes an iterable and adds each element of it. What are the elements of a string?',
    explanation:
      'set.update(tag) iterates over the string and adds every character as its own element, so "new" becomes {"n", "e", "w"}. Use set.add(tag) to insert the whole string as a single element (update is for merging another collection).',
    examples: [
      { input: [['a', 'b'], 'new'], expected: ['a', 'b', 'new'] },
      { input: [[], 'python'], expected: ['python'] },
    ],
    hiddenTests: [
      { input: [['red', 'blue'], 'green'], expected: ['blue', 'green', 'red'] },
      { input: [['x'], 'x'], expected: ['x'] },
      { input: [['go', 'rust'], 'go'], expected: ['go', 'rust'] },
    ],
  },
  {
    id: 'py-replace-all-not-first',
    number: 87,
    language: 'python',
    title: 'Replace Only the First',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      'Replace only the first occurrence of `old` with `new` in `text` and leave any later occurrences alone. For "a-b-c" with "-" -> "+" the result should be "a+b-c", but the code returns "a+b+c".',
    functionName: 'replace_first',
    functionSignature: 'def replace_first(text: str, old: str, new: str) -> str:',
    buggyCode:
      'def replace_first(text: str, old: str, new: str) -> str:\n    return text.replace(old, new)\n',
    hint: 'str.replace has an optional third argument.',
    explanation:
      'str.replace(old, new) replaces every occurrence by default. Its optional count argument caps the number of replacements: text.replace(old, new, 1) swaps only the first match.',
    examples: [
      { input: ['a-b-c', '-', '+'], expected: 'a+b-c' },
      { input: ['hello', 'l', 'L'], expected: 'heLlo' },
    ],
    hiddenTests: [
      { input: ['no match', 'z', 'q'], expected: 'no match' },
      { input: ['aaa', 'a', 'b'], expected: 'baa' },
      { input: ['one two two', 'two', '2'], expected: 'one 2 two' },
    ],
  },
  {
    id: 'py-re-match-only-at-start',
    number: 88,
    language: 'python',
    title: 'Match Only Looks at the Start',
    difficulty: 'Easy',
    topic: 'Regex',
    statement:
      'Return True if the text contains at least one digit anywhere, otherwise False. "order 42 shipped" should be True, but the code says False; it only says True when the text begins with a digit.',
    functionName: 'contains_number',
    functionSignature: 'def contains_number(text: str) -> bool:',
    buggyCode:
      'import re\n\ndef contains_number(text: str) -> bool:\n    return re.match(r"\\d+", text) is not None\n',
    hint: 're.match is anchored at position 0. Which re function scans the whole string?',
    explanation:
      're.match only tries to match at the very beginning of the string, so digits later in the text are never found. re.search scans the entire string for the first place the pattern matches: re.search(r"\\d+", text) is not None.',
    examples: [
      { input: ['order 42 shipped'], expected: true },
      { input: ['no digits here'], expected: false },
    ],
    hiddenTests: [
      { input: ['123 main st'], expected: true },
      { input: ['room A7'], expected: true },
      { input: [''], expected: false },
    ],
  },
  {
    id: 'py-bool-of-string-false',
    number: 89,
    language: 'python',
    title: "The String 'false' Is Truthy",
    difficulty: 'Easy',
    topic: 'Type Coercion',
    statement:
      'Config values arrive as strings. Return True when the value (ignoring surrounding whitespace and case) is one of "true", "1", "yes" or "on", and False for anything else. The code returns True for "false" and "0".',
    functionName: 'parse_flag',
    functionSignature: 'def parse_flag(value: str) -> bool:',
    buggyCode:
      'def parse_flag(value: str) -> bool:\n    return bool(value.strip())\n',
    hint: 'bool("false") is True. bool() on a string only checks whether it is empty.',
    explanation:
      'bool(s) is False only for the empty string; any non-empty string, including "false" and "0", is truthy. The text has to be compared against the accepted spellings: value.strip().lower() in ("true", "1", "yes", "on").',
    examples: [
      { input: ['true'], expected: true },
      { input: ['false'], expected: false },
    ],
    hiddenTests: [
      { input: ['0'], expected: false },
      { input: ['YES'], expected: true },
      { input: [' on '], expected: true },
      { input: [''], expected: false },
    ],
  },
  {
    id: 'py-dict-changed-during-iteration',
    number: 90,
    language: 'python',
    title: 'Dictionary Changed Size During Iteration',
    difficulty: 'Medium',
    topic: 'Dictionaries',
    statement:
      'Remove every item whose quantity is 0 or less from the inventory dict and return the dict. For {"apple": 3, "pear": 0} the result should be {"apple": 3}, but the code crashes with RuntimeError: dictionary changed size during iteration.',
    functionName: 'drop_out_of_stock',
    functionSignature: 'def drop_out_of_stock(inventory: dict) -> dict:',
    buggyCode:
      'def drop_out_of_stock(inventory: dict) -> dict:\n    for item, qty in inventory.items():\n        if qty <= 0:\n            del inventory[item]\n    return inventory\n',
    hint: 'Deleting keys from a dict while looping over its live view is not allowed. Take a snapshot to loop over.',
    explanation:
      'inventory.items() is a live view; deleting a key while iterating it raises RuntimeError on the next step. Iterate over a snapshot instead, for item, qty in list(inventory.items()):, so the deletions target the real dict while the loop walks a frozen copy. (Building a new dict with a comprehension also works.)',
    examples: [
      { input: [{ apple: 3, pear: 0, fig: -1 }], expected: { apple: 3 } },
      { input: [{ x: 0 }], expected: {} },
    ],
    hiddenTests: [
      { input: [{ a: 0, b: 5, c: 0 }], expected: { b: 5 } },
      { input: [{ a: 1, b: 2 }], expected: { a: 1, b: 2 } },
      { input: [{}], expected: {} },
    ],
  },
  {
    id: 'py-list-index-raises-on-miss',
    number: 91,
    language: 'python',
    title: 'Index Raises on a Miss',
    difficulty: 'Medium',
    topic: 'Lists',
    statement:
      'Return the position of the first occurrence of `target` in `items`, or -1 if it is absent. Lookups that hit work fine, but a missing target crashes with ValueError instead of returning -1.',
    functionName: 'find_position',
    functionSignature: 'def find_position(items: list[str], target: str) -> int:',
    buggyCode:
      'def find_position(items: list[str], target: str) -> int:\n    pos = items.index(target)\n    if pos < 0:\n        return -1\n    return pos\n',
    hint: 'Unlike indexOf in other languages, list.index never returns -1.',
    explanation:
      'list.index raises ValueError when the value is not present; it never returns a negative number, so the `pos < 0` check is dead code. Guard the lookup first (if target not in items: return -1) or catch the ValueError and return -1.',
    examples: [
      { input: [['a', 'b', 'c'], 'b'], expected: 1 },
      { input: [['a', 'b'], 'z'], expected: -1 },
    ],
    hiddenTests: [
      { input: [[], 'a'], expected: -1 },
      { input: [['x', 'y', 'x'], 'x'], expected: 0 },
      { input: [['q'], 'q'], expected: 0 },
    ],
  },
  {
    id: 'py-negative-floor-division',
    number: 92,
    language: 'python',
    title: 'Floor Division Goes the Wrong Way',
    difficulty: 'Medium',
    topic: 'Arithmetic',
    statement:
      'Split a signed offset in seconds into [minutes, seconds], truncating toward zero so both parts carry the sign of the input: 90 -> [1, 30] and -90 -> [-1, -30]. Positive inputs work, but -90 comes back as [-2, 30].',
    functionName: 'split_offset',
    functionSignature: 'def split_offset(seconds: int) -> list[int]:',
    buggyCode:
      'def split_offset(seconds: int) -> list[int]:\n    minutes = seconds // 60\n    rest = seconds % 60\n    return [minutes, rest]\n',
    hint: 'In Python, // rounds toward negative infinity and % takes the sign of the divisor. -90 // 60 is -2.',
    explanation:
      "Python's // is floor division, so -90 // 60 is -2 (not -1), and % always matches the divisor's sign, so -90 % 60 is 30. To truncate toward zero, work on the absolute value and reapply the sign: sign = -1 if seconds < 0 else 1; minutes, rest = divmod(abs(seconds), 60); return [sign * minutes, sign * rest].",
    examples: [
      { input: [90], expected: [1, 30] },
      { input: [-90], expected: [-1, -30] },
    ],
    hiddenTests: [
      { input: [0], expected: [0, 0] },
      { input: [-59], expected: [0, -59] },
      { input: [-120], expected: [-2, 0] },
      { input: [3661], expected: [61, 1] },
    ],
  },
  {
    id: 'py-most-common-tie-order',
    number: 93,
    language: 'python',
    title: 'Most Common, Ties Alphabetical',
    difficulty: 'Medium',
    topic: 'Counting',
    statement:
      'Return the word that appears most often; when several words tie for the top count, return the alphabetically smallest of them. For ["pear", "apple", "pear", "apple"] the answer should be "apple", but the code returns "pear".',
    functionName: 'top_word',
    functionSignature: 'def top_word(words: list[str]) -> str:',
    buggyCode:
      'from collections import Counter\n\ndef top_word(words: list[str]) -> str:\n    counts = Counter(words)\n    return counts.most_common(1)[0][0]\n',
    hint: 'most_common breaks ties by first insertion order, not alphabetically.',
    explanation:
      'Counter.most_common orders equal counts by the order the keys were first seen, so the tie goes to whichever word appeared first in the input. Pick the winner with an explicit key that ranks by count descending and then by word: min(counts, key=lambda w: (-counts[w], w)).',
    examples: [
      { input: [['pear', 'apple', 'pear', 'apple']], expected: 'apple' },
      { input: [['b', 'a', 'b']], expected: 'b' },
    ],
    hiddenTests: [
      { input: [['zed', 'amy']], expected: 'amy' },
      { input: [['c', 'c', 'a', 'a', 'b']], expected: 'a' },
      { input: [['x']], expected: 'x' },
    ],
  },
  {
    id: 'py-groupby-unsorted-input',
    number: 94,
    language: 'python',
    title: 'Groupby Needs Sorted Input',
    difficulty: 'Medium',
    topic: 'Grouping',
    statement:
      'Given [category, name] pairs, return a dict mapping each category to the list of its names in input order. For [["fruit","apple"],["veg","kale"],["fruit","pear"]] the result should be {"fruit": ["apple", "pear"], "veg": ["kale"]}, but the code returns {"fruit": ["pear"], "veg": ["kale"]}.',
    functionName: 'group_by_category',
    functionSignature: 'def group_by_category(items: list[list[str]]) -> dict:',
    buggyCode:
      'from itertools import groupby\n\ndef group_by_category(items: list[list[str]]) -> dict:\n    groups = {}\n    for category, members in groupby(items, key=lambda it: it[0]):\n        groups[category] = [name for _, name in members]\n    return groups\n',
    hint: 'itertools.groupby only groups consecutive runs of equal keys.',
    explanation:
      'itertools.groupby yields a new group every time the key changes, so a category that reappears later produces a second group that overwrites the first one in the dict. Sort by the same key first: groupby(sorted(items, key=lambda it: it[0]), key=lambda it: it[0]). The sort is stable, so names stay in input order within each category.',
    examples: [
      { input: [[['fruit', 'apple'], ['veg', 'kale'], ['fruit', 'pear']]], expected: { fruit: ['apple', 'pear'], veg: ['kale'] } },
      { input: [[['a', '1'], ['a', '2']]], expected: { a: ['1', '2'] } },
    ],
    hiddenTests: [
      { input: [[['x', 'p'], ['y', 'q'], ['x', 'r'], ['y', 's']]], expected: { x: ['p', 'r'], y: ['q', 's'] } },
      { input: [[['b', '1'], ['a', '2'], ['b', '3']]], expected: { b: ['1', '3'], a: ['2'] } },
      { input: [[]], expected: {} },
    ],
  },
  {
    id: 'py-findall-returns-group-only',
    number: 95,
    language: 'python',
    title: 'Findall Returns Only the Group',
    difficulty: 'Medium',
    topic: 'Regex',
    statement:
      'Return every whole word that ends in "ing", in order. For "running and jumping" the result should be ["running", "jumping"], but the code returns ["runn", "jump"].',
    functionName: 'ing_words',
    functionSignature: 'def ing_words(text: str) -> list[str]:',
    buggyCode:
      'import re\n\ndef ing_words(text: str) -> list[str]:\n    return re.findall(r"\\b(\\w+)ing\\b", text)\n',
    hint: 'When a pattern contains a capturing group, findall returns just the group, not the full match.',
    explanation:
      're.findall returns the captured groups when the pattern has any, so only the part inside (\\w+) comes back and the "ing" is dropped. Remove the parentheses (r"\\b\\w+ing\\b") or make the group non-capturing with (?:...) so findall returns the whole match.',
    examples: [
      { input: ['running and jumping'], expected: ['running', 'jumping'] },
      { input: ['nothing here'], expected: ['nothing'] },
    ],
    hiddenTests: [
      { input: ['sing a song'], expected: ['sing'] },
      { input: ['ring king'], expected: ['ring', 'king'] },
      { input: ['no words'], expected: [] },
    ],
  },
  {
    id: 'py-split-needs-maxsplit',
    number: 96,
    language: 'python',
    title: 'Value Contains the Separator',
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      'Parse a "key = value" settings line into [key, value] with surrounding whitespace trimmed. Split at the first "=" only, so the value may itself contain "=". "url=https://x.com/?a=1" should give ["url", "https://x.com/?a=1"], but the code crashes with ValueError: too many values to unpack.',
    functionName: 'parse_setting',
    functionSignature: 'def parse_setting(line: str) -> list[str]:',
    buggyCode:
      'def parse_setting(line: str) -> list[str]:\n    key, value = line.split("=")\n    return [key.strip(), value.strip()]\n',
    hint: 'str.split takes a maxsplit argument.',
    explanation:
      'line.split("=") splits at every "=", so a value containing the separator yields three or more pieces and the two-name unpack fails. Limit it to one split: line.split("=", 1) always produces exactly two parts, with everything after the first "=" kept in the value. (str.partition("=") works too.)',
    examples: [
      { input: ['name = alice'], expected: ['name', 'alice'] },
      { input: ['url=https://x.com/?a=1'], expected: ['url', 'https://x.com/?a=1'] },
    ],
    hiddenTests: [
      { input: ['eq = a=b=c'], expected: ['eq', 'a=b=c'] },
      { input: ['empty='], expected: ['empty', ''] },
      { input: ['  spaced  =  out  '], expected: ['spaced', 'out'] },
    ],
  },
  {
    id: 'py-fromkeys-shared-list',
    number: 97,
    language: 'python',
    title: 'fromkeys Shares One List',
    difficulty: 'Hard',
    topic: 'Dictionaries',
    statement:
      'Bucket words by their first letter, but only for the letters given; return a dict with one list per letter (empty if no word starts with it). For words ["apple", "bob", "avocado"] and letters ["a", "b"] the result should be {"a": ["apple", "avocado"], "b": ["bob"]}, but the code puts all three words under every letter.',
    functionName: 'bucket_by_initial',
    functionSignature: 'def bucket_by_initial(words: list[str], letters: list[str]) -> dict:',
    buggyCode:
      'def bucket_by_initial(words: list[str], letters: list[str]) -> dict:\n    buckets = dict.fromkeys(letters, [])\n    for w in words:\n        first = w[0]\n        if first in buckets:\n            buckets[first].append(w)\n    return buckets\n',
    hint: 'dict.fromkeys evaluates its value argument once. How many list objects does that create?',
    explanation:
      'dict.fromkeys(letters, []) builds the empty list once and stores that same object under every key, so appending through one key shows up under all of them. Create a fresh list per key with a comprehension: buckets = {letter: [] for letter in letters}.',
    examples: [
      { input: [['apple', 'bob', 'avocado'], ['a', 'b']], expected: { a: ['apple', 'avocado'], b: ['bob'] } },
      { input: [['ant', 'bee', 'cow'], ['a', 'b', 'c']], expected: { a: ['ant'], b: ['bee'], c: ['cow'] } },
    ],
    hiddenTests: [
      { input: [['cat'], ['a']], expected: { a: [] } },
      { input: [['dog', 'deer'], ['d', 'e']], expected: { d: ['dog', 'deer'], e: [] } },
      { input: [[], ['z']], expected: { z: [] } },
    ],
  },
  {
    id: 'py-reverse-slice-flips-ties',
    number: 98,
    language: 'python',
    title: 'Descending Without Flipping Ties',
    difficulty: 'Hard',
    topic: 'Sorting',
    statement:
      'Given [name, score] pairs in registration order, return the names ranked by score from highest to lowest; players with equal scores keep their registration order. For [["ann", 10], ["bob", 10], ["cy", 5]] the answer should be ["ann", "bob", "cy"], but the code returns ["bob", "ann", "cy"].',
    functionName: 'rank_players',
    functionSignature: 'def rank_players(players: list[list]) -> list[str]:',
    buggyCode:
      'def rank_players(players: list[list]) -> list[str]:\n    ordered = sorted(players, key=lambda p: p[1])[::-1]\n    return [name for name, _ in ordered]\n',
    hint: 'Sorting ascending and then reversing the whole list also reverses the order of equal elements.',
    explanation:
      "The ascending sort is stable, so tied players stay in input order; but the [::-1] slice then reverses that run of ties too, putting later registrations first. sorted(..., reverse=True) keeps Python's stability guarantee (ties stay in original order) while ordering keys descending: sorted(players, key=lambda p: p[1], reverse=True).",
    examples: [
      { input: [[['ann', 10], ['bob', 10], ['cy', 5]]], expected: ['ann', 'bob', 'cy'] },
      { input: [[['a', 1], ['b', 2]]], expected: ['b', 'a'] },
    ],
    hiddenTests: [
      { input: [[['x', 3], ['y', 3], ['z', 3]]], expected: ['x', 'y', 'z'] },
      { input: [[['p', 7], ['q', 9], ['r', 7]]], expected: ['q', 'p', 'r'] },
      { input: [[]], expected: [] },
    ],
  },
  {
    id: 'py-naive-vs-aware-datetime',
    number: 99,
    language: 'python',
    title: 'Naive Meets Aware',
    difficulty: 'Hard',
    topic: 'Dates',
    statement:
      'Decide whether a token has expired. `expires_at` is an ISO-8601 timestamp that includes a UTC offset (e.g. "2024-05-01T10:00:00+00:00"); `now` is an ISO-8601 timestamp with no offset that is already in UTC (e.g. "2024-05-01T12:00:00"). Return True when now is at or after the expiry. The code crashes with TypeError: can\'t compare offset-naive and offset-aware datetimes.',
    functionName: 'is_expired',
    functionSignature: 'def is_expired(expires_at: str, now: str) -> bool:',
    buggyCode:
      'from datetime import datetime, timezone\n\ndef is_expired(expires_at: str, now: str) -> bool:\n    expiry = datetime.fromisoformat(expires_at)\n    current = datetime.fromisoformat(now)\n    return current >= expiry\n',
    hint: 'One datetime carries a tzinfo and the other does not. Attach UTC to the naive one before comparing.',
    explanation:
      'datetime.fromisoformat keeps the offset when the string has one (aware) and leaves it out when it does not (naive), and Python refuses to compare the two. Since `now` is known to be UTC, make it aware: current = datetime.fromisoformat(now).replace(tzinfo=timezone.utc). Aware datetimes with different offsets then compare correctly as instants.',
    examples: [
      { input: ['2024-05-01T10:00:00+00:00', '2024-05-01T12:00:00'], expected: true },
      { input: ['2024-05-01T10:00:00+00:00', '2024-05-01T09:59:59'], expected: false },
    ],
    hiddenTests: [
      { input: ['2024-05-01T10:00:00+02:00', '2024-05-01T08:30:00'], expected: true },
      { input: ['2024-05-01T10:00:00-05:00', '2024-05-01T14:00:00'], expected: false },
      { input: ['2024-05-01T10:00:00+00:00', '2024-05-01T10:00:00'], expected: true },
    ],
  },
  {
    id: 'py-any-consumes-generator',
    number: 100,
    language: 'python',
    title: 'any() Ate the First Match',
    difficulty: 'Hard',
    topic: 'Generators',
    statement:
      'Return every cost that exceeds the limit, in order, or an empty list if none do. For [5, 20, 30] with limit 10 the answer should be [20, 30], but the code returns [30]; for [50] with limit 10 it returns [] instead of [50].',
    functionName: 'over_budget',
    functionSignature: 'def over_budget(costs: list[int], limit: int) -> list[int]:',
    buggyCode:
      'def over_budget(costs: list[int], limit: int) -> list[int]:\n    big = (c for c in costs if c > limit)\n    if any(big):\n        return list(big)\n    return []\n',
    hint: 'any() pulls items from the generator until it finds a truthy one. Those items are gone by the time list() runs.',
    explanation:
      'A generator can only be walked once. any(big) advances it up to and including the first matching cost and stops, so the later list(big) resumes from the next item and the first match is lost (and a single match leaves nothing at all). Materialize once: big = [c for c in costs if c > limit] and return big (an empty list is already falsy, so the any() check is unnecessary).',
    examples: [
      { input: [[5, 20, 30], 10], expected: [20, 30] },
      { input: [[50], 10], expected: [50] },
    ],
    hiddenTests: [
      { input: [[12, 3, 15, 9], 10], expected: [12, 15] },
      { input: [[1, 2], 10], expected: [] },
      { input: [[], 0], expected: [] },
    ],
  },
];

// =============================================================================
// JAVASCRIPT (100)
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
  {
    id: 'js-loose-zero-check',
    number: 35,
    language: 'javascript',
    title: "Loose Zero Check",
    difficulty: 'Easy',
    topic: "Equality / Coercion",
    statement:
      "Return true only when x is the number 0 exactly. Values like '', false, '0', [] and null must return false.",
    functionName: 'isExactlyZero',
    functionSignature: "function isExactlyZero(x): boolean",
    buggyCode:
      "function isExactlyZero(x) {\n  return x == 0;\n}\n",
    hint: "== coerces its operands before comparing.",
    explanation:
      "The loose == operator coerces the other side to a number, so '', false, '0' and [] all equal 0 under ==. Use strict === so only the actual number 0 matches.",
    examples: [
      { input: [0], expected: true },
      { input: [""], expected: false },
      { input: [false], expected: false },
    ],
    hiddenTests: [
      { input: ["0"], expected: false },
      { input: [[]], expected: false },
      { input: [null], expected: false },
      { input: [1], expected: false },
    ],
  },
  {
    id: 'js-typeof-null-object',
    number: 36,
    language: 'javascript',
    title: "typeof null Trap",
    difficulty: 'Easy',
    topic: "typeof",
    statement:
      "Return a type label for x: 'null' for null, 'object' for objects/arrays, and 'number' / 'string' / 'boolean' for those primitives.",
    functionName: 'typeName',
    functionSignature: "function typeName(x): string",
    buggyCode:
      "function typeName(x) {\n  if (x === null) return \"object\";\n  if (typeof x === \"object\") return \"object\";\n  if (typeof x === \"number\") return \"number\";\n  if (typeof x === \"string\") return \"string\";\n  if (typeof x === \"boolean\") return \"boolean\";\n  return \"other\";\n}\n",
    hint: "What should the null branch actually return?",
    explanation:
      "typeof null is the historical quirk 'object', which is why the code even checks for null first — but the branch mistakenly returns 'object' instead of 'null'. The null case must return the string 'null'.",
    examples: [
      { input: [null], expected: "null" },
      { input: [{}], expected: "object" },
      { input: [5], expected: "number" },
    ],
    hiddenTests: [
      { input: ["hi"], expected: "string" },
      { input: [true], expected: "boolean" },
      { input: [[1,2]], expected: "object" },
    ],
  },
  {
    id: 'js-has-key-nullish',
    number: 37,
    language: 'javascript',
    title: "Does the Key Exist?",
    difficulty: 'Medium',
    topic: "Equality / Truthiness",
    statement:
      "Return true if obj has its own property named key, regardless of the stored value. A key holding 0, '' or null still counts as present; a missing key returns false.",
    functionName: 'hasKey',
    functionSignature: "function hasKey(obj, key): boolean",
    buggyCode:
      "function hasKey(obj, key) {\n  return obj[key] != null;\n}\n",
    hint: "You are testing the value, not whether the property exists.",
    explanation:
      "obj[key] != null returns false whenever the stored value is null (or undefined), even though the key genuinely exists. Presence must be tested with Object.prototype.hasOwnProperty.call(obj, key), which ignores the value entirely.",
    examples: [
      { input: [{"a":0},"a"], expected: true },
      { input: [{"a":null},"a"], expected: true },
      { input: [{"a":1},"b"], expected: false },
    ],
    hiddenTests: [
      { input: [{"a":""},"a"], expected: true },
      { input: [{},"x"], expected: false },
    ],
  },
  {
    id: 'js-count-truthy',
    number: 38,
    language: 'javascript',
    title: "Count the Truthy Values",
    difficulty: 'Easy',
    topic: "Truthiness",
    statement:
      "Count how many elements of arr are truthy (anything that is not 0, '', null, false, or NaN).",
    functionName: 'countTruthy',
    functionSignature: "function countTruthy(arr): number",
    buggyCode:
      "function countTruthy(arr) {\n  let count = 0;\n  for (const v of arr) {\n    if (v === true) count++;\n  }\n  return count;\n}\n",
    hint: "Truthy is broader than being the literal boolean true.",
    explanation:
      "v === true only matches the exact boolean true, so truthy values like 1, 'a', [] and {} are never counted. Test the value's truthiness directly with if (v).",
    examples: [
      { input: [[1,0,"a","",true,null]], expected: 3 },
      { input: [[0,"",null,false]], expected: 0 },
    ],
    hiddenTests: [
      { input: [["x",5,[],{}]], expected: 4 },
      { input: [[]], expected: 0 },
    ],
  },
  {
    id: 'js-parses-to-number',
    number: 39,
    language: 'javascript',
    title: "Does It Parse to a Number?",
    difficulty: 'Medium',
    topic: "NaN checks",
    statement:
      "Return true if the string s converts to a valid number via Number(s), false if it produces NaN. Note that Number('') is 0, so an empty string counts as valid.",
    functionName: 'parsesToNumber',
    functionSignature: "function parsesToNumber(s): boolean",
    buggyCode:
      "function parsesToNumber(s) {\n  const n = Number(s);\n  return n != NaN;\n}\n",
    hint: "NaN is never equal (or unequal in a useful way) to anything via ==/!=.",
    explanation:
      "NaN is not equal to itself, so n != NaN is always true even when n is NaN — the check never rejects anything. Detect a failed parse with !Number.isNaN(n).",
    examples: [
      { input: ["42"], expected: true },
      { input: ["abc"], expected: false },
      { input: ["3.14"], expected: true },
    ],
    hiddenTests: [
      { input: ["12px"], expected: false },
      { input: [""], expected: true },
    ],
  },
  {
    id: 'js-safe-divide-finite',
    number: 40,
    language: 'javascript',
    title: "Safe Divide",
    difficulty: 'Medium',
    topic: "NaN checks",
    statement:
      "Return a / b, but return null when the result is not a finite number (i.e. division by zero produces Infinity, -Infinity, or NaN).",
    functionName: 'safeDivide',
    functionSignature: "function safeDivide(a, b): number | null",
    buggyCode:
      "function safeDivide(a, b) {\n  const result = a / b;\n  if (result === NaN) return null;\n  if (result === Infinity || result === -Infinity) return null;\n  return result;\n}\n",
    hint: "result === NaN can never be true, and there is a single check that covers all three bad cases.",
    explanation:
      "result === NaN is always false (NaN is never === to anything), so 0/0 slips through and returns NaN instead of null. Replacing the whole guard with !Number.isFinite(result) correctly rejects NaN, Infinity and -Infinity at once.",
    examples: [
      { input: [6,2], expected: 3 },
      { input: [6,0], expected: null },
      { input: [0,0], expected: null },
    ],
    hiddenTests: [
      { input: [-6,0], expected: null },
      { input: [7,2], expected: 3.5 },
    ],
  },
  {
    id: 'js-normalize-flags',
    number: 41,
    language: 'javascript',
    title: "Normalize to Booleans",
    difficulty: 'Hard',
    topic: "Equality / Coercion",
    statement:
      "Map every element of arr to its truthiness as a real boolean: truthy values become true, falsy values (0, '', null, false) become false. Note that empty arrays and empty objects are truthy.",
    functionName: 'normalizeFlags',
    functionSignature: "function normalizeFlags(arr): boolean[]",
    buggyCode:
      "function normalizeFlags(arr) {\n  return arr.map(function (v) {\n    return v == true;\n  });\n}\n",
    hint: "v == true is not the same as 'v is truthy'.",
    explanation:
      "v == true coerces true to the number 1 and then coerces v to a number, so 'x' becomes NaN (not equal to 1) and [] becomes 0 — both wrongly yield false, and 2 == true is also false. Truthiness must be taken with Boolean(v) (or !!v) instead.",
    examples: [
      { input: [[1,0,2,"","x"]], expected: [true,false,true,false,true] },
      { input: [[true,false,null]], expected: [true,false,false] },
    ],
    hiddenTests: [
      { input: [[[],{},0]], expected: [true,true,false] },
    ],
  },
  {
    id: 'js-second-largest-unique',
    number: 42,
    language: 'javascript',
    title: "Second Largest Ignores Duplicates",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "Return the second largest DISTINCT value in the array. For example, in [5, 5, 4] the largest is 5 and the second largest distinct value is 4. The current code just sorts and grabs the second-to-last element, so duplicates of the maximum fool it.",
    functionName: 'secondLargest',
    functionSignature: "function secondLargest(arr: number[]): number",
    buggyCode:
      "function secondLargest(arr) {\n  const sorted = arr.sort((a, b) => a - b);\n  return sorted[sorted.length - 2];\n}\n",
    hint: "Sorting keeps duplicates, so the two largest slots can hold the same number.",
    explanation:
      "The bug: after sorting ascending, `sorted[length - 2]` is simply the second-to-last element, which equals the max whenever the max is duplicated (e.g. [4,5,5] -> 5). The fix is to remove duplicates first: `const uniq = [...new Set(arr)].sort((a, b) => a - b); return uniq[uniq.length - 2];`",
    examples: [
      { input: [[3,1,2]], expected: 2 },
      { input: [[5,5,4]], expected: 4 },
      { input: [[10,20,20,30]], expected: 20 },
    ],
    hiddenTests: [
      { input: [[1,1,1,2]], expected: 1 },
      { input: [[7,8]], expected: 7 },
    ],
  },
  {
    id: 'js-chunk-slice-end',
    number: 43,
    language: 'javascript',
    title: "Chunk Passes the Wrong slice End",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "Split an array into consecutive chunks of the given `size`. The final chunk may be shorter. For example chunk([1,2,3,4,5], 2) -> [[1,2],[3,4],[5]]. The current code produces empty chunks after the first one.",
    functionName: 'chunk',
    functionSignature: "function chunk(arr: any[], size: number): any[][]",
    buggyCode:
      "function chunk(arr, size) {\n  const out = [];\n  for (let i = 0; i < arr.length; i += size) {\n    out.push(arr.slice(i, size));\n  }\n  return out;\n}\n",
    hint: "slice's second argument is an absolute end index, not a length.",
    explanation:
      "The bug: `arr.slice(i, size)` uses `size` as the END index every iteration, so once `i >= size` the slice is empty. `slice(start, end)` takes an absolute end index. The fix is `arr.slice(i, i + size)` so each chunk spans from `i` to `i + size`.",
    examples: [
      { input: [[1,2,3,4,5],2], expected: [[1,2],[3,4],[5]] },
      { input: [[1,2,3,4],2], expected: [[1,2],[3,4]] },
      { input: [[1,2,3],1], expected: [[1],[2],[3]] },
    ],
    hiddenTests: [
      { input: [[1,2,3,4,5,6],3], expected: [[1,2,3],[4,5,6]] },
      { input: [[],2], expected: [] },
    ],
  },
  {
    id: 'js-reduce-count-even',
    number: 44,
    language: 'javascript',
    title: "Reduce Callback Forgets the Accumulator",
    difficulty: 'Easy',
    topic: "Arrays",
    statement:
      "Count how many numbers in the array are even, using reduce. The current code returns a boolean instead of a count because the reduce callback ignores the running accumulator.",
    functionName: 'countEven',
    functionSignature: "function countEven(arr: number[]): number",
    buggyCode:
      "function countEven(arr) {\n  return arr.reduce((count, n) => n % 2 === 0, 0);\n}\n",
    hint: "A reduce callback must build on and return the accumulator, not throw it away.",
    explanation:
      "The bug: the callback returns `n % 2 === 0` (a boolean for the current element) and never uses `count`, so the final result is just whether the LAST element was even. The fix accumulates: `arr.reduce((count, n) => count + (n % 2 === 0 ? 1 : 0), 0)`.",
    examples: [
      { input: [[1,2,3,4]], expected: 2 },
      { input: [[2,4,6]], expected: 3 },
      { input: [[1,3,5]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[0,1,2]], expected: 2 },
    ],
  },
  {
    id: 'js-last-element-slice',
    number: 45,
    language: 'javascript',
    title: "slice(-1) Returns an Array",
    difficulty: 'Easy',
    topic: "Arrays",
    statement:
      "Return the last element of a non-empty array (the value itself, not wrapped in an array). The current code returns a one-element array instead of the element.",
    functionName: 'lastElement',
    functionSignature: "function lastElement(arr: any[]): any",
    buggyCode:
      "function lastElement(arr) {\n  return arr.slice(-1);\n}\n",
    hint: "slice always returns an array, even when it selects a single element.",
    explanation:
      "The bug: `arr.slice(-1)` returns a new array containing the last element (e.g. `[3]`), not the element `3`. Index directly instead: `arr[arr.length - 1]` (or `arr.at(-1)`).",
    examples: [
      { input: [[1,2,3]], expected: 3 },
      { input: [["a","b"]], expected: "b" },
      { input: [[42]], expected: 42 },
    ],
    hiddenTests: [
      { input: [[7,8,9,10]], expected: 10 },
    ],
  },
  {
    id: 'js-sum-first-n-offbyone',
    number: 46,
    language: 'javascript',
    title: "Sum First N Runs One Too Far",
    difficulty: 'Easy',
    topic: "Off-by-one",
    statement:
      "Return the sum of the FIRST n elements of the array. For example sumFirstN([10,20,30,40], 2) -> 30. The current loop condition includes index n, so it adds one extra element (or NaN when n equals the length).",
    functionName: 'sumFirstN',
    functionSignature: "function sumFirstN(arr: number[], n: number): number",
    buggyCode:
      "function sumFirstN(arr, n) {\n  let total = 0;\n  for (let i = 0; i <= n; i++) {\n    total += arr[i];\n  }\n  return total;\n}\n",
    hint: "To touch the first n elements you want indices 0 through n-1.",
    explanation:
      "The bug: `i <= n` loops from index 0 to n inclusive, which is n+1 elements. When n equals the length, `arr[n]` is `undefined` and the total becomes NaN. Use a strict `<`: `for (let i = 0; i < n; i++)`.",
    examples: [
      { input: [[10,20,30,40],2], expected: 30 },
      { input: [[1,2,3],3], expected: 6 },
      { input: [[5,5,5,5],1], expected: 5 },
    ],
    hiddenTests: [
      { input: [[100,200],0], expected: 0 },
    ],
  },
  {
    id: 'js-running-max-offbyone',
    number: 47,
    language: 'javascript',
    title: "Running Max Excludes the Current Element",
    difficulty: 'Medium',
    topic: "Off-by-one",
    statement:
      "Return an array where each position holds the maximum of the input up to AND INCLUDING that position (a running maximum). For example runningMax([3,1,4,1,5]) -> [3,3,4,4,5]. The current code slices up to but not including the current index, so it is shifted and the first entry is -Infinity.",
    functionName: 'runningMax',
    functionSignature: "function runningMax(arr: number[]): number[]",
    buggyCode:
      "function runningMax(arr) {\n  return arr.map((_, i) => Math.max(...arr.slice(0, i)));\n}\n",
    hint: "slice(0, i) stops before index i, so the current element is left out.",
    explanation:
      "The bug: `arr.slice(0, i)` excludes index `i`, so position 0 gets `Math.max()` of an empty list (-Infinity) and every entry lags one element behind. Include the current element with `arr.slice(0, i + 1)`.",
    examples: [
      { input: [[3,1,4,1,5]], expected: [3,3,4,4,5] },
      { input: [[1,2,3]], expected: [1,2,3] },
      { input: [[5,4,3]], expected: [5,5,5] },
    ],
    hiddenTests: [
      { input: [[7]], expected: [7] },
    ],
  },
  {
    id: 'js-rotate-right-slice',
    number: 48,
    language: 'javascript',
    title: "Rotate Right Rotated Left",
    difficulty: 'Hard',
    topic: "Arrays",
    statement:
      "Rotate the array to the RIGHT by k positions. For example rotateRight([1,2,3,4,5], 2) -> [4,5,1,2,3] (the last two elements move to the front). The current code rotates in the wrong direction.",
    functionName: 'rotateRight',
    functionSignature: "function rotateRight(arr: any[], k: number): any[]",
    buggyCode:
      "function rotateRight(arr, k) {\n  const n = arr.length;\n  const shift = k % n;\n  return arr.slice(shift).concat(arr.slice(0, shift));\n}\n",
    hint: "Cutting off the FIRST k elements rotates left; a right rotation splits at length - k.",
    explanation:
      "The bug: `arr.slice(shift)` drops the first `shift` elements and moves them to the end, which is a LEFT rotation. For a right rotation the last `shift` elements should come to the front: split at `n - shift`, i.e. `arr.slice(n - shift).concat(arr.slice(0, n - shift))`.",
    examples: [
      { input: [[1,2,3,4,5],2], expected: [4,5,1,2,3] },
      { input: [[1,2,3],1], expected: [3,1,2] },
      { input: [[1,2,3,4],4], expected: [1,2,3,4] },
    ],
    hiddenTests: [
      { input: [[10,20,30],2], expected: [20,30,10] },
    ],
  },
  {
    id: 'js-closure-running-totals',
    number: 49,
    language: 'javascript',
    title: "Redeclared Closure Variable",
    difficulty: 'Easy',
    topic: "Closures",
    statement:
      "`runningTotals` should take an array of numbers and return an array of running totals, where each element is the sum of all elements up to and including that index. It uses a closure `add` that keeps a private `sum` across calls.",
    functionName: 'runningTotals',
    functionSignature: "function runningTotals(nums: number[]): number[]",
    buggyCode:
      "function runningTotals(nums) {\n  function makeAdder() {\n    let sum = 0;\n    return function (n) { let sum = sum + n; return sum; };\n  }\n  const add = makeAdder();\n  return nums.map(add);\n}\n",
    hint: "Look at the inner function: does it update the closed-over `sum`, or create a brand-new one?",
    explanation:
      "The inner function wrote `let sum = sum + n`, which declares a NEW block-scoped `sum` that shadows the closure's `sum`. Reading it in its own initializer hits the temporal dead zone and throws. Drop the `let` so it assigns to the outer `sum`: `sum = sum + n`.",
    examples: [
      { input: [[1,2,3]], expected: [1,3,6] },
      { input: [[5,5,5]], expected: [5,10,15] },
      { input: [[]], expected: [] },
    ],
    hiddenTests: [
      { input: [[10]], expected: [10] },
      { input: [[-1,1,-1,1]], expected: [-1,0,-1,0] },
    ],
  },
  {
    id: 'js-closure-var-multipliers',
    number: 50,
    language: 'javascript',
    title: "Loop Closures Share var",
    difficulty: 'Hard',
    topic: "Closures",
    statement:
      "`buildMultipliers` builds `n` functions in a loop, where function `i` should multiply its argument by `i`. It then calls the function at `index` with `x` and returns the result. Because of `var`, all the closures capture the same variable.",
    functionName: 'buildMultipliers',
    functionSignature: "function buildMultipliers(n: number, index: number, x: number): number",
    buggyCode:
      "function buildMultipliers(n, index, x) {\n  var fns = [];\n  for (var i = 0; i < n; i++) {\n    fns.push(function (y) { return y * i; });\n  }\n  return fns[index](x);\n}\n",
    hint: "`var i` is function-scoped — every closure reads the SAME `i`, whose value after the loop is `n`.",
    explanation:
      "`var` hoists `i` to function scope, so all pushed functions share one `i`. After the loop it equals `n`, so every closure multiplies by `n`. Change `var i` to `let i`, which is block-scoped and gives each iteration its own binding.",
    examples: [
      { input: [3,0,5], expected: 0 },
      { input: [3,1,5], expected: 5 },
      { input: [3,2,5], expected: 10 },
    ],
    hiddenTests: [
      { input: [4,3,2], expected: 6 },
      { input: [5,4,10], expected: 40 },
    ],
  },
  {
    id: 'js-hoisting-return-before-decl',
    number: 51,
    language: 'javascript',
    title: "Return Before the var",
    difficulty: 'Medium',
    topic: "Hoisting",
    statement:
      "`computeDoubled` should return `x * 2`. The `var result` declaration is written after the `return` statement, but the author expected hoisting to make it work anyway.",
    functionName: 'computeDoubled',
    functionSignature: "function computeDoubled(x: number): number",
    buggyCode:
      "function computeDoubled(x) {\n  return result;\n  var result = x * 2;\n}\n",
    hint: "`var` hoists the DECLARATION, not the ASSIGNMENT — what is `result` worth on the line that returns it?",
    explanation:
      "Hoisting moves the `var result` declaration to the top but leaves the assignment where it is. So on the `return` line `result` is still `undefined`, and the assignment after `return` is dead code. Move the assignment above the return: `var result = x * 2; return result;`.",
    examples: [
      { input: [3], expected: 6 },
      { input: [0], expected: 0 },
      { input: [-4], expected: -8 },
    ],
    hiddenTests: [
      { input: [100], expected: 200 },
      { input: [7], expected: 14 },
    ],
  },
  {
    id: 'js-scope-shadowed-cache',
    number: 52,
    language: 'javascript',
    title: "Shadowed Cache in Callback",
    difficulty: 'Medium',
    topic: "Scope",
    statement:
      "`countFirstSeen` should return how many values in the array are being seen for the FIRST time (i.e. the number of distinct values). It keeps a `seen` object outside the loop to remember which values already appeared.",
    functionName: 'countFirstSeen',
    functionSignature: "function countFirstSeen(values: any[]): number",
    buggyCode:
      "function countFirstSeen(values) {\n  let count = 0;\n  const seen = {};\n  values.forEach(function (v) {\n    var seen = {};\n    if (!seen[v]) {\n      seen[v] = true;\n      count++;\n    }\n  });\n  return count;\n}\n",
    hint: "There are two variables named `seen` — which one does the callback actually use?",
    explanation:
      "The callback redeclared `var seen = {}` inside itself, shadowing the outer `seen` and resetting it to empty on every iteration. So every value looks unseen and `count` becomes the array length. Remove the inner `var seen = {}` line so the callback uses the outer `seen`.",
    examples: [
      { input: [[1,1,2,2,3]], expected: 3 },
      { input: [[5,5,5]], expected: 1 },
      { input: [[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[1,2,3,4]], expected: 4 },
      { input: [["a","a","b"]], expected: 2 },
    ],
  },
  {
    id: 'js-closure-iife-capture',
    number: 53,
    language: 'javascript',
    title: "IIFE That Forgot Its Argument",
    difficulty: 'Hard',
    topic: "Closures",
    statement:
      "`sumOfAdders` builds `n` adder functions in a loop; adder `i` should add `i` to its argument. It uses an IIFE to try to capture each `i`, then calls every adder with `x` and returns the total. The IIFE does not actually receive `i`, so the capture fails.",
    functionName: 'sumOfAdders',
    functionSignature: "function sumOfAdders(n: number, x: number): number",
    buggyCode:
      "function sumOfAdders(n, x) {\n  var adders = [];\n  for (var i = 0; i < n; i++) {\n    adders.push((function () {\n      return function (y) { return y + i; };\n    })());\n  }\n  var total = 0;\n  for (var j = 0; j < adders.length; j++) {\n    total += adders[j](x);\n  }\n  return total;\n}\n",
    hint: "The IIFE is meant to snapshot `i`, but it takes no parameter — so the inner function still closes over the shared `var i`.",
    explanation:
      "The IIFE `(function () { ... })()` was called with no argument, so its inner function still references the loop's shared `var i` (which ends at `n`). Give the IIFE a parameter and pass `i` in: `(function (i) { return function (y) { return y + i; }; })(i)` — now each adder captures its own copy.",
    examples: [
      { input: [3,10], expected: 33 },
      { input: [4,0], expected: 6 },
      { input: [1,5], expected: 5 },
    ],
    hiddenTests: [
      { input: [5,1], expected: 15 },
      { input: [2,100], expected: 201 },
    ],
  },
  {
    id: 'js-block-scope-classify',
    number: 54,
    language: 'javascript',
    title: "let Trapped in the if Block",
    difficulty: 'Easy',
    topic: "Scope",
    statement:
      "`classify` should return \"positive\" when `n > 0`, \"negative\" when `n < 0`, and \"zero\" otherwise. It declares `label` before the branches and tries to update it inside each branch.",
    functionName: 'classify',
    functionSignature: "function classify(n: number): string",
    buggyCode:
      "function classify(n) {\n  let label = \"zero\";\n  if (n > 0) {\n    let label = \"positive\";\n  } else if (n < 0) {\n    let label = \"negative\";\n  }\n  return label;\n}\n",
    hint: "Inside the branches, `let label = ...` creates a NEW block-scoped variable instead of updating the outer one.",
    explanation:
      "Each branch redeclared `label` with `let`, creating a fresh variable scoped to that block. The outer `label` was never changed, so the function always returned \"zero\". Remove the `let` inside the branches so they assign to the outer variable: `label = \"positive\"` / `label = \"negative\"`.",
    examples: [
      { input: [5], expected: "positive" },
      { input: [-3], expected: "negative" },
      { input: [0], expected: "zero" },
    ],
    hiddenTests: [
      { input: [100], expected: "positive" },
      { input: [-1], expected: "negative" },
    ],
  },
  {
    id: 'js-closure-shadowed-balance',
    number: 55,
    language: 'javascript',
    title: "Account Closure Shadows Its State",
    difficulty: 'Medium',
    topic: "Closures",
    statement:
      "`finalBalance` starts with `start` and applies each delta in `deltas` in order, returning the final balance. It builds an `apply` closure via `makeAccount(start)` that keeps the running `balance` privately.",
    functionName: 'finalBalance',
    functionSignature: "function finalBalance(start: number, deltas: number[]): number",
    buggyCode:
      "function finalBalance(start, deltas) {\n  function makeAccount(balance) {\n    return function (amount) {\n      var balance = balance + amount;\n      return balance;\n    };\n  }\n  const apply = makeAccount(start);\n  let result = start;\n  for (const d of deltas) {\n    result = apply(d);\n  }\n  return result;\n}\n",
    hint: "The inner `var balance` shadows the parameter `balance` — so what value is on the right-hand side of that assignment?",
    explanation:
      "Inside the returned function, `var balance` is hoisted and shadows the enclosing `balance` parameter. On the right-hand side, `balance` refers to that hoisted-but-not-yet-assigned local (`undefined`), so every result is `NaN` (and the state never persists). Remove the `var` so it updates the closed-over parameter: `balance = balance + amount`.",
    examples: [
      { input: [100,[10,-20,5]], expected: 95 },
      { input: [0,[1,2,3]], expected: 6 },
      { input: [50,[]], expected: 50 },
    ],
    hiddenTests: [
      { input: [10,[-10]], expected: 0 },
      { input: [1,[1,1,1,1]], expected: 5 },
    ],
  },
  {
    id: 'js-pad-id-padstart',
    number: 56,
    language: 'javascript',
    title: "Zero-Pad an ID",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "Given an id number and a target width, return the id as a string left-padded with '0' to at least that width. Longer ids are returned unchanged. The zeros are ending up on the wrong side.",
    functionName: 'padId',
    functionSignature: "function padId(id, width)",
    buggyCode:
      "function padId(id, width) {\n  return String(id).padEnd(width, \"0\");\n}\n",
    hint: "padEnd adds padding to the right; you want it on the left.",
    explanation:
      "padEnd pads on the right, producing '700' instead of '007'. Use padStart(width, '0') to pad on the left so the number keeps its value.",
    examples: [
      { input: [7,3], expected: "007" },
      { input: [42,5], expected: "00042" },
      { input: [123,3], expected: "123" },
    ],
    hiddenTests: [
      { input: [0,4], expected: "0000" },
      { input: [99,2], expected: "99" },
    ],
  },
  {
    id: 'js-tohex-radix',
    number: 57,
    language: 'javascript',
    title: "Number to Hex",
    difficulty: 'Easy',
    topic: "Numbers",
    statement:
      "Return the lowercase hexadecimal string representation of a non-negative integer. It keeps coming back in base 10.",
    functionName: 'toHex',
    functionSignature: "function toHex(n)",
    buggyCode:
      "function toHex(n) {\n  return n.toString();\n}\n",
    hint: "toString takes an optional radix argument.",
    explanation:
      "Number.prototype.toString() defaults to radix 10. Pass the radix explicitly: n.toString(16) to get hexadecimal digits.",
    examples: [
      { input: [255], expected: "ff" },
      { input: [16], expected: "10" },
      { input: [0], expected: "0" },
    ],
    hiddenTests: [
      { input: [4095], expected: "fff" },
    ],
  },
  {
    id: 'js-round-to-cents-number',
    number: 58,
    language: 'javascript',
    title: "Round to Cents",
    difficulty: 'Medium',
    topic: "Numbers",
    statement:
      "Round a dollar amount to two decimal places and return it as a number. The caller does arithmetic on the result but it's misbehaving because a string is coming back.",
    functionName: 'roundToCents',
    functionSignature: "function roundToCents(amount)",
    buggyCode:
      "function roundToCents(amount) {\n  return Math.round(amount * 100) / 100 + \"\";\n}\n",
    hint: "What does concatenating an empty string do to the return type?",
    explanation:
      "The `+ \"\"` coerces the rounded number into a string, so callers get '2.35' instead of 2.35 and arithmetic breaks. Drop the concatenation and return the number directly: Math.round(amount * 100) / 100.",
    examples: [
      { input: [2.345], expected: 2.35 },
      { input: [10], expected: 10 },
      { input: [0.1], expected: 0.1 },
    ],
    hiddenTests: [
      { input: [1.005], expected: 1 },
    ],
  },
  {
    id: 'js-count-words-whitespace',
    number: 59,
    language: 'javascript',
    title: "Counting Words",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "Count the words in a string, where words are separated by any run of whitespace. Empty or whitespace-only strings have zero words. Extra spaces are inflating the count.",
    functionName: 'countWords',
    functionSignature: "function countWords(text)",
    buggyCode:
      "function countWords(text) {\n  return text.split(\" \").length;\n}\n",
    hint: "split(' ') creates empty entries for consecutive or leading/trailing spaces.",
    explanation:
      "Splitting on a single space turns runs of whitespace into empty strings that still get counted, and an empty input yields [''] (length 1). Trim first, return 0 for empty, then split on /\\s+/ to collapse whitespace runs.",
    examples: [
      { input: ["hello world"], expected: 2 },
      { input: ["  spaced   out  words "], expected: 3 },
      { input: [""], expected: 0 },
    ],
    hiddenTests: [
      { input: ["one"], expected: 1 },
      { input: ["a\tb\nc"], expected: 3 },
    ],
  },
  {
    id: 'js-parse-binary-radix',
    number: 60,
    language: 'javascript',
    title: "Parsing Binary",
    difficulty: 'Easy',
    topic: "Numbers",
    statement:
      "Parse a string of binary digits into its decimal integer value. It's being read as a base-10 number instead.",
    functionName: 'parseBinary',
    functionSignature: "function parseBinary(bits)",
    buggyCode:
      "function parseBinary(bits) {\n  return parseInt(bits);\n}\n",
    hint: "parseInt defaults to base 10 for strings without a 0x prefix.",
    explanation:
      "Without a radix, parseInt('101') reads it as one hundred one, not binary. Supply the radix: parseInt(bits, 2) to interpret the digits in base 2.",
    examples: [
      { input: ["101"], expected: 5 },
      { input: ["1111"], expected: 15 },
      { input: ["0"], expected: 0 },
    ],
    hiddenTests: [
      { input: ["10000"], expected: 16 },
    ],
  },
  {
    id: 'js-capitalize-slice-offset',
    number: 61,
    language: 'javascript',
    title: "Capitalize First Letter",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "Return the word with its first letter uppercased and the rest unchanged. The empty string returns unchanged. Right now the first letter is being duplicated.",
    functionName: 'capitalize',
    functionSignature: "function capitalize(word)",
    buggyCode:
      "function capitalize(word) {\n  return word.charAt(0).toUpperCase() + word.slice(0);\n}\n",
    hint: "slice(0) keeps the whole string, including the letter you already uppercased.",
    explanation:
      "slice(0) returns the entire string, so 'hello' becomes 'H' + 'hello' = 'Hhello'. Use slice(1) to skip the first character, and guard the empty string so charAt(0) doesn't produce a stray uppercase.",
    examples: [
      { input: ["hello"], expected: "Hello" },
      { input: ["a"], expected: "A" },
      { input: [""], expected: "" },
    ],
    hiddenTests: [
      { input: ["world"], expected: "World" },
    ],
  },
  {
    id: 'js-average-int-truncate',
    number: 62,
    language: 'javascript',
    title: "Integer Average",
    difficulty: 'Medium',
    topic: "Numbers",
    statement:
      "Return the integer average of a non-empty array of integers, truncating any fractional part toward zero. It's returning a fractional number instead of a whole one.",
    functionName: 'averageInt',
    functionSignature: "function averageInt(nums)",
    buggyCode:
      "function averageInt(nums) {\n  let sum = 0;\n  for (const n of nums) sum += n;\n  return sum / nums.length;\n}\n",
    hint: "JavaScript's / always produces a float; you need to drop the fraction.",
    explanation:
      "Division in JavaScript never floors, so 10/4 is 2.5, not 2. Wrap the result in Math.trunc (toward zero) to get the integer average.",
    examples: [
      { input: [[1,2,3,4]], expected: 2 },
      { input: [[10,20,30]], expected: 20 },
      { input: [[5]], expected: 5 },
    ],
    hiddenTests: [
      { input: [[1,2]], expected: 1 },
    ],
  },
  {
    id: 'js-merge-defaults-spread',
    number: 63,
    language: 'javascript',
    title: "Overrides Should Win",
    difficulty: 'Easy',
    topic: "Objects",
    statement:
      "`mergeDefaults(defaults, overrides)` should return a NEW object that starts from `defaults` and then applies `overrides`, so that keys in `overrides` take precedence. The current spread order is backwards, so `defaults` clobber the overrides.",
    functionName: 'mergeDefaults',
    functionSignature: "function mergeDefaults(defaults: object, overrides: object): object",
    buggyCode:
      "function mergeDefaults(defaults, overrides) {\n  return { ...overrides, ...defaults };\n}\n",
    hint: "When two spreads share a key, the LAST one written wins.",
    explanation:
      "In object spread, properties from later spreads overwrite earlier ones. `{ ...overrides, ...defaults }` lets `defaults` win, which is the opposite of what we want. Swap the order to `{ ...defaults, ...overrides }` so overrides are applied last and take precedence. Spreading into a fresh literal also keeps the result immutable (neither input is mutated).",
    examples: [
      { input: [{"color":"red","size":1},{"size":2}], expected: {"color":"red","size":2} },
      { input: [{"a":1},{}], expected: {"a":1} },
      { input: [{},{"x":5}], expected: {"x":5} },
    ],
    hiddenTests: [
      { input: [{"a":1,"b":2},{"b":9,"c":3}], expected: {"a":1,"b":9,"c":3} },
      { input: [{"k":"old"},{"k":"new"}], expected: {"k":"new"} },
    ],
  },
  {
    id: 'js-pluck-computed-key',
    number: 64,
    language: 'javascript',
    title: "Pluck by Dynamic Key",
    difficulty: 'Easy',
    topic: "Objects",
    statement:
      "`pluck(arr, key)` should return an array of the value at property `key` for every object in `arr`. The current code reads a literal property named \"key\" instead of the property whose name is held in the `key` variable.",
    functionName: 'pluck',
    functionSignature: "function pluck(arr: object[], key: string): any[]",
    buggyCode:
      "function pluck(arr, key) {\n  return arr.map(o => o.key);\n}\n",
    hint: "`o.key` is not the same as `o[key]`.",
    explanation:
      "`o.key` accesses a property literally named `key`, ignoring the `key` argument entirely — so it returns `undefined` for objects that lack such a property. To look up a property by a dynamic name held in a variable, use bracket notation: `o[key]`.",
    examples: [
      { input: [[{"id":1},{"id":2}],"id"], expected: [1,2] },
      { input: [[{"name":"a"},{"name":"b"}],"name"], expected: ["a","b"] },
      { input: [[],"id"], expected: [] },
    ],
    hiddenTests: [
      { input: [[{"x":10,"y":20}],"y"], expected: [20] },
      { input: [[{"a":1,"b":2},{"a":3,"b":4}],"b"], expected: [2,4] },
    ],
  },
  {
    id: 'js-maxof-rest-spread',
    number: 65,
    language: 'javascript',
    title: "Max of the Rest",
    difficulty: 'Medium',
    topic: "Spread/Rest",
    statement:
      "`maxOf(...nums)` should return the largest of the numbers passed as individual arguments, and return 0 when called with no arguments. The current code passes the whole rest array to `Math.max`, which does not accept an array.",
    functionName: 'maxOf',
    functionSignature: "function maxOf(...nums: number[]): number",
    buggyCode:
      "function maxOf(...nums) {\n  return Math.max(nums);\n}\n",
    hint: "`Math.max` takes separate arguments, not one array — and think about the empty case.",
    explanation:
      "`Math.max(nums)` passes a single array; `Math.max` then coerces it to a number, which is `NaN` for arrays of length !== 1, so the result is wrong. Spread the array into separate arguments with `Math.max(...nums)`. Also guard the empty case: `Math.max()` returns `-Infinity`, so return 0 first when `nums.length === 0`.",
    examples: [
      { input: [1,2,3], expected: 3 },
      { input: [5], expected: 5 },
      { input: [], expected: 0 },
    ],
    hiddenTests: [
      { input: [-1,-5,-2], expected: -1 },
      { input: [10,3,8,22,7], expected: 22 },
      { input: [0,0,0], expected: 0 },
    ],
  },
  {
    id: 'js-repeat-default-param',
    number: 66,
    language: 'javascript',
    title: "Repeat Zero Times",
    difficulty: 'Medium',
    topic: "Default Params",
    statement:
      "`repeatStr(s, times)` should repeat string `s` `times` times, defaulting to 2 when `times` is not supplied. It must still honor an explicit `times` of 0 (returning the empty string). The current `times || 2` fallback wrongly turns 0 into 2.",
    functionName: 'repeatStr',
    functionSignature: "function repeatStr(s: string, times?: number): string",
    buggyCode:
      "function repeatStr(s, times) {\n  times = times || 2;\n  return s.repeat(times);\n}\n",
    hint: "`0 || 2` is 2 — `||` can't tell 'omitted' from 'falsy-but-valid'.",
    explanation:
      "`times || 2` falls back to 2 whenever `times` is falsy — including the valid value 0 — so `repeatStr('hi', 0)` incorrectly returns 'hihi'. A real default parameter (`times = 2`) only kicks in when the argument is genuinely omitted (`undefined`), leaving an explicit 0 intact.",
    examples: [
      { input: ["ab"], expected: "abab" },
      { input: ["x",3], expected: "xxx" },
      { input: ["hi",0], expected: "" },
    ],
    hiddenTests: [
      { input: ["z",1], expected: "z" },
      { input: ["na",4], expected: "nananana" },
    ],
  },
  {
    id: 'js-omit-key-immutable',
    number: 67,
    language: 'javascript',
    title: "Omit a Key",
    difficulty: 'Medium',
    topic: "Immutability",
    statement:
      "`omitKey(obj, key)` should return a NEW object that is a copy of `obj` with `key` removed. If `key` is absent, return a copy unchanged. The current code copies the object but forgets to remove the key.",
    functionName: 'omitKey',
    functionSignature: "function omitKey(obj: object, key: string): object",
    buggyCode:
      "function omitKey(obj, key) {\n  const copy = { ...obj };\n  return copy;\n}\n",
    hint: "You spread a fresh copy — good — but never actually removed anything from it.",
    explanation:
      "Spreading into `{ ...obj }` produces a correct shallow copy (so the input is never mutated), but the function returns it as-is without dropping the target property. Add `delete copy[key];` before returning so the copy actually omits the key. Deleting from the copy (not the original) keeps the operation immutable.",
    examples: [
      { input: [{"a":1,"b":2},"a"], expected: {"b":2} },
      { input: [{"x":5},"x"], expected: {} },
      { input: [{"a":1},"nope"], expected: {"a":1} },
    ],
    hiddenTests: [
      { input: [{"a":1,"b":2,"c":3},"b"], expected: {"a":1,"c":3} },
      { input: [{"only":true},"only"], expected: {} },
    ],
  },
  {
    id: 'js-countby-uninit-increment',
    number: 68,
    language: 'javascript',
    title: "Tally Into an Object",
    difficulty: 'Easy',
    topic: "Objects",
    statement:
      "`countBy(arr)` should return an object mapping each element to how many times it appears in `arr`. The current code increments a property that starts out `undefined`, producing `NaN` counts.",
    functionName: 'countBy',
    functionSignature: "function countBy(arr: string[]): object",
    buggyCode:
      "function countBy(arr) {\n  const counts = {};\n  for (const x of arr) {\n    counts[x]++;\n  }\n  return counts;\n}\n",
    hint: "`undefined + 1` is `NaN` — the first time you see a key it has no value yet.",
    explanation:
      "The first time a key is encountered, `counts[x]` is `undefined`, and `undefined++` yields `NaN`, which then stays `NaN` forever. Initialize missing keys before incrementing: `counts[x] = (counts[x] || 0) + 1;`. The `|| 0` supplies 0 for the first occurrence.",
    examples: [
      { input: [["a","b","a"]], expected: {"a":2,"b":1} },
      { input: [[]], expected: {} },
      { input: [["x"]], expected: {"x":1} },
    ],
    hiddenTests: [
      { input: [["a","a","a","b","b"]], expected: {"a":3,"b":2} },
      { input: [["z","y","z","y","z"]], expected: {"z":3,"y":2} },
    ],
  },
  {
    id: 'js-array-constructor-length',
    number: 69,
    language: 'javascript',
    title: "Array Constructor Surprise",
    difficulty: 'Easy',
    topic: "Arrays",
    statement:
      "`wrap(x)` should return a one-element array containing `x`, whatever `x` is. It works for strings, but for numbers it returns an array of the wrong length full of holes, and it throws for negative numbers.",
    functionName: 'wrap',
    functionSignature: "function wrap(x: any): any[]",
    buggyCode:
      "function wrap(x) {\n  return new Array(x);\n}\n",
    hint: "`new Array(3)` and `new Array('3')` build very different arrays.",
    explanation:
      "When `Array` is called with a single numeric argument it treats it as a LENGTH, so `new Array(3)` is a three-slot empty array (and `new Array(-1)` throws a RangeError). Only non-number arguments become elements. Use an array literal — `return [x];` — or `Array.of(x)`, both of which always wrap the value.",
    examples: [
      { input: [3], expected: [3] },
      { input: ["a"], expected: ["a"] },
      { input: [0], expected: [0] },
    ],
    hiddenTests: [
      { input: [true], expected: [true] },
      { input: [[1, 2]], expected: [[1, 2]] },
      { input: [-1], expected: [-1] },
    ],
  },
  {
    id: 'js-number-empty-string-zero',
    number: 70,
    language: 'javascript',
    title: "Empty String Is Zero",
    difficulty: 'Easy',
    topic: "Type Coercion",
    statement:
      "`toNumberOrNull(s)` should convert a form-field string to a number, returning `null` when the field is blank or not numeric. Blank fields (`''` or only whitespace) currently come back as `0` instead of `null`.",
    functionName: 'toNumberOrNull',
    functionSignature: "function toNumberOrNull(s: string): number | null",
    buggyCode:
      "function toNumberOrNull(s) {\n  const n = Number(s);\n  return Number.isNaN(n) ? null : n;\n}\n",
    hint: "What does `Number('')` evaluate to? It is not NaN.",
    explanation:
      "`Number('')` and `Number('   ')` both return `0`, not `NaN`, so the NaN check never fires for blank input. Guard for emptiness first: `if (s.trim() === '') return null;` and only then convert with `Number(s)`.",
    examples: [
      { input: ["42"], expected: 42 },
      { input: [""], expected: null },
      { input: ["abc"], expected: null },
    ],
    hiddenTests: [
      { input: ["3.5"], expected: 3.5 },
      { input: ["   "], expected: null },
      { input: ["-7"], expected: -7 },
    ],
  },
  {
    id: 'js-split-empty-string',
    number: 71,
    language: 'javascript',
    title: "Splitting an Empty String",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "`parseTags(s)` takes a comma-separated string and returns an array of trimmed tags. An empty (or whitespace-only) input should produce an empty array, but currently produces an array holding one empty string.",
    functionName: 'parseTags',
    functionSignature: "function parseTags(s: string): string[]",
    buggyCode:
      "function parseTags(s) {\n  return s.split(',').map(t => t.trim());\n}\n",
    hint: "`''.split(',')` does not return `[]`.",
    explanation:
      "Splitting an empty string returns `['']` — a one-element array containing the empty string — because split always yields at least one piece. Either return early (`if (s.trim() === '') return [];`) or drop empty pieces after splitting with `.filter(t => t.length > 0)`.",
    examples: [
      { input: ["a, b"], expected: ["a", "b"] },
      { input: [""], expected: [] },
      { input: ["solo"], expected: ["solo"] },
    ],
    hiddenTests: [
      { input: ["x,y,z"], expected: ["x", "y", "z"] },
      { input: ["   "], expected: [] },
      { input: ["one, two "], expected: ["one", "two"] },
    ],
  },
  {
    id: 'js-string-index-assign',
    number: 72,
    language: 'javascript',
    title: "Strings Are Immutable",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "`censorAt(s, i)` should return `s` with the character at index `i` replaced by `*`. The current code assigns into the string and returns it unchanged.",
    functionName: 'censorAt',
    functionSignature: "function censorAt(s: string, i: number): string",
    buggyCode:
      "function censorAt(s, i) {\n  s[i] = '*';\n  return s;\n}\n",
    hint: "You can read `s[i]`, but writing to it does nothing.",
    explanation:
      "JavaScript strings are immutable: `s[i] = '*'` is silently ignored (and throws in strict mode). Build a new string from the pieces instead: `return s.slice(0, i) + '*' + s.slice(i + 1);`.",
    examples: [
      { input: ["hello", 1], expected: "h*llo" },
      { input: ["a", 0], expected: "*" },
    ],
    hiddenTests: [
      { input: ["abc", 2], expected: "ab*" },
      { input: ["password", 0], expected: "*assword" },
      { input: ["12345", 4], expected: "1234*" },
    ],
  },
  {
    id: 'js-switch-missing-break',
    number: 73,
    language: 'javascript',
    title: "Falling Through the switch",
    difficulty: 'Easy',
    topic: "Control Flow",
    statement:
      "`shippingCost(zone)` should return 5 for `'local'`, 10 for `'national'`, 25 for `'international'`, and 0 for anything else. Right now `'local'` and `'national'` both return 25.",
    functionName: 'shippingCost',
    functionSignature: "function shippingCost(zone: string): number",
    buggyCode:
      "function shippingCost(zone) {\n  let cost;\n  switch (zone) {\n    case 'local':\n      cost = 5;\n    case 'national':\n      cost = 10;\n    case 'international':\n      cost = 25;\n      break;\n    default:\n      cost = 0;\n  }\n  return cost;\n}\n",
    hint: "After a `case` matches, execution keeps going into the next `case` unless something stops it.",
    explanation:
      "A `switch` falls through: once `case 'local'` matches, execution continues into `'national'` and `'international'`, overwriting `cost` each time until it hits the first `break`. Add a `break;` after each assignment (or `return` directly from each case).",
    examples: [
      { input: ["local"], expected: 5 },
      { input: ["national"], expected: 10 },
      { input: ["international"], expected: 25 },
    ],
    hiddenTests: [
      { input: ["unknown"], expected: 0 },
      { input: [""], expected: 0 },
      { input: ["local"], expected: 5 },
    ],
  },
  {
    id: 'js-sort-mutates-input',
    number: 74,
    language: 'javascript',
    title: "Sort Mutates in Place",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "`firstAndMedian(arr)` should return `{ first, median }` where `first` is the ORIGINAL first element of `arr` and `median` is the median of its values. The median is right, but `first` always comes back as the smallest element.",
    functionName: 'firstAndMedian',
    functionSignature: "function firstAndMedian(arr: number[]): { first: number, median: number }",
    buggyCode:
      "function firstAndMedian(arr) {\n  const sorted = arr.sort((a, b) => a - b);\n  const mid = Math.floor(sorted.length / 2);\n  const median = sorted.length % 2 === 0\n    ? (sorted[mid - 1] + sorted[mid]) / 2\n    : sorted[mid];\n  return { first: arr[0], median };\n}\n",
    hint: "`sort` returns the array — but which array?",
    explanation:
      "`Array.prototype.sort` sorts IN PLACE and returns the same array, so `sorted` and `arr` are the same object and `arr[0]` is now the minimum. Sort a copy instead: `const sorted = [...arr].sort((a, b) => a - b);` (or `arr.slice().sort(...)`).",
    examples: [
      { input: [[5, 1, 3]], expected: { first: 5, median: 3 } },
      { input: [[2, 4, 1, 3]], expected: { first: 2, median: 2.5 } },
      { input: [[7]], expected: { first: 7, median: 7 } },
    ],
    hiddenTests: [
      { input: [[10, 20, 5]], expected: { first: 10, median: 10 } },
      { input: [[9, 8, 7, 6]], expected: { first: 9, median: 7.5 } },
    ],
  },
  {
    id: 'js-set-of-objects',
    number: 75,
    language: 'javascript',
    title: "Set Can't See Inside Objects",
    difficulty: 'Medium',
    topic: "Sets",
    statement:
      "`countUniquePoints(points)` receives an array of `{ x, y }` objects and should return how many DISTINCT coordinates it contains. Currently every point counts as unique, even exact duplicates.",
    functionName: 'countUniquePoints',
    functionSignature: "function countUniquePoints(points: { x: number, y: number }[]): number",
    buggyCode:
      "function countUniquePoints(points) {\n  return new Set(points).size;\n}\n",
    hint: "A Set compares objects by reference, not by their contents.",
    explanation:
      "`Set` uses SameValueZero equality, so two different object literals with identical fields are two different entries. Convert each point to a primitive key first: `new Set(points.map(p => `${p.x},${p.y}`)).size` (or `JSON.stringify(p)`).",
    examples: [
      { input: [[{ x: 1, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 4 }]], expected: 2 },
      { input: [[]], expected: 0 },
      { input: [[{ x: 0, y: 0 }]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }]], expected: 1 },
      { input: [[{ x: 1, y: 2 }, { x: 2, y: 1 }]], expected: 2 },
    ],
  },
  {
    id: 'js-splice-while-iterating',
    number: 76,
    language: 'javascript',
    title: "Splice While Iterating",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "`removeNegatives(arr)` should return a new array with every negative number removed. When two negatives sit next to each other, the second one survives.",
    functionName: 'removeNegatives',
    functionSignature: "function removeNegatives(arr: number[]): number[]",
    buggyCode:
      "function removeNegatives(arr) {\n  const out = arr.slice();\n  for (let i = 0; i < out.length; i++) {\n    if (out[i] < 0) out.splice(i, 1);\n  }\n  return out;\n}\n",
    hint: "After splicing index `i` out, what now lives at index `i`? And where does the loop look next?",
    explanation:
      "Removing element `i` shifts everything after it one slot left, so the next element moves INTO index `i` — but the loop then increments to `i + 1` and skips it. Either step back after a removal (`out.splice(i, 1); i--;`), iterate from the end, or avoid mutation entirely: `return arr.filter(x => x >= 0);`.",
    examples: [
      { input: [[1, -1, -2, 3]], expected: [1, 3] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[-1, -1, -1]], expected: [] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[-5, 4, -3, -2, 1]], expected: [4, 1] },
      { input: [[0, -1]], expected: [0] },
    ],
  },
  {
    id: 'js-optional-chain-stops-short',
    number: 77,
    language: 'javascript',
    title: "Optional Chain Stops Short",
    difficulty: 'Medium',
    topic: "Optional Chaining",
    statement:
      "`getZip(user)` should return `user.address.zip`, or `null` when the user, the address, or the zip is missing. It handles a missing user fine, but throws a TypeError when the user exists and has no address.",
    functionName: 'getZip',
    functionSignature: "function getZip(user: object | null): string | null",
    buggyCode:
      "function getZip(user) {\n  return user?.address.zip ?? null;\n}\n",
    hint: "`?.` only guards the link it is attached to.",
    explanation:
      "`user?.address.zip` short-circuits only when `user` itself is nullish. If `user` exists but `address` is `undefined`, the plain `.zip` access runs on `undefined` and throws. Guard every nullable hop: `return user?.address?.zip ?? null;`.",
    examples: [
      { input: [{ name: "Ada", address: { zip: "90210" } }], expected: "90210" },
      { input: [{ name: "Ada" }], expected: null },
      { input: [null], expected: null },
    ],
    hiddenTests: [
      { input: [{ name: "Bob", address: null }], expected: null },
      { input: [{ name: "Cy", address: { zip: "10001" }, age: 3 }], expected: "10001" },
      { input: [{ address: {} }], expected: null },
    ],
  },
  {
    id: 'js-modulo-negative-sign',
    number: 78,
    language: 'javascript',
    title: "Modulo Keeps the Sign",
    difficulty: 'Medium',
    topic: "Math",
    statement:
      "`wrapIndex(i, n)` should map any integer `i` into the range `0..n-1` so it can be used as a circular array index (e.g. `-1` wraps to `n - 1`). Positive inputs work; negative inputs come back negative.",
    functionName: 'wrapIndex',
    functionSignature: "function wrapIndex(i: number, n: number): number",
    buggyCode:
      "function wrapIndex(i, n) {\n  return i % n;\n}\n",
    hint: "`-1 % 5` is `-1` in JavaScript — `%` is a remainder, not a true modulo.",
    explanation:
      "JavaScript's `%` is a remainder operator whose result takes the sign of the DIVIDEND, so `-1 % 5 === -1`. To get a non-negative modulo, add `n` and reduce again: `return ((i % n) + n) % n;`.",
    examples: [
      { input: [7, 5], expected: 2 },
      { input: [-1, 5], expected: 4 },
      { input: [0, 3], expected: 0 },
    ],
    hiddenTests: [
      { input: [-6, 4], expected: 2 },
      { input: [5, 5], expected: 0 },
      { input: [-10, 3], expected: 2 },
    ],
  },
  {
    id: 'js-date-object-equality',
    number: 79,
    language: 'javascript',
    title: "Dates Are Objects",
    difficulty: 'Medium',
    topic: "Dates",
    statement:
      "`isSameDay(a, b)` receives two `YYYY-MM-DD` strings and should return true when they represent the same calendar day. It currently returns false for every pair, even identical ones.",
    functionName: 'isSameDay',
    functionSignature: "function isSameDay(a: string, b: string): boolean",
    buggyCode:
      "function isSameDay(a, b) {\n  return new Date(a) === new Date(b);\n}\n",
    hint: "Two `Date` instances are two separate objects, even if they hold the same instant.",
    explanation:
      "`===` on objects compares references, and `new Date(...)` creates a fresh object each time, so the comparison is never true. Compare the underlying timestamps instead: `return new Date(a).getTime() === new Date(b).getTime();` (for plain date strings, comparing `a === b` after normalizing also works).",
    examples: [
      { input: ["2024-03-01", "2024-03-01"], expected: true },
      { input: ["2024-03-01", "2024-03-02"], expected: false },
    ],
    hiddenTests: [
      { input: ["2000-01-01", "2000-01-01"], expected: true },
      { input: ["2024-12-31", "2025-01-01"], expected: false },
      { input: ["1999-07-04", "1999-07-04"], expected: true },
    ],
  },
  {
    id: 'js-in-operator-indices',
    number: 80,
    language: 'javascript',
    title: "in Checks Indices",
    difficulty: 'Medium',
    topic: "Operators",
    statement:
      "`contains(arr, x)` should return true when `x` is one of the VALUES in `arr`. Currently `contains([10, 20], 10)` is false while `contains([10, 20], 1)` is true.",
    functionName: 'contains',
    functionSignature: "function contains(arr: any[], x: any): boolean",
    buggyCode:
      "function contains(arr, x) {\n  return x in arr;\n}\n",
    hint: "On an array, `in` asks whether a PROPERTY (index) exists, not whether a value does.",
    explanation:
      "The `in` operator tests for a property key. Arrays' keys are their indices, so `1 in [10, 20]` is true (index 1 exists) and `10 in [10, 20]` is false (there is no index 10). Test membership with `arr.includes(x)` (or `arr.indexOf(x) !== -1`).",
    examples: [
      { input: [[10, 20, 30], 20], expected: true },
      { input: [[10, 20, 30], 1], expected: false },
      { input: [[5], 0], expected: false },
    ],
    hiddenTests: [
      { input: [[], 0], expected: false },
      { input: [[1, 2, 3], 3], expected: true },
      { input: [["a", "b"], "a"], expected: true },
    ],
  },
  {
    id: 'js-zero-based-months',
    number: 81,
    language: 'javascript',
    title: "Zero-Based Months",
    difficulty: 'Medium',
    topic: "Dates",
    statement:
      "`daysInMonth(year, month)` takes a 1-based month (1 = January) and should return how many days that month has, accounting for leap years. It returns the length of the PREVIOUS month instead — `daysInMonth(2024, 4)` gives 31.",
    functionName: 'daysInMonth',
    functionSignature: "function daysInMonth(year: number, month: number): number",
    buggyCode:
      "function daysInMonth(year, month) {\n  return new Date(year, month - 1, 0).getDate();\n}\n",
    hint: "Day 0 of a month is the last day of the month BEFORE it. Which month index do you want to be 'before'?",
    explanation:
      "`Date` months are zero-based, and the day-0 trick — `new Date(y, m, 0)` — yields the last day of month index `m - 1`. Passing `month - 1` (the 0-based index of the target month) therefore lands on the month before it. Pass the 1-based value as-is so day 0 of the NEXT month index is used: `new Date(year, month, 0).getDate()`.",
    examples: [
      { input: [2024, 2], expected: 29 },
      { input: [2023, 2], expected: 28 },
      { input: [2024, 4], expected: 30 },
    ],
    hiddenTests: [
      { input: [2023, 12], expected: 31 },
      { input: [2100, 2], expected: 28 },
      { input: [2024, 9], expected: 30 },
      { input: [2024, 1], expected: 31 },
    ],
  },
  {
    id: 'js-this-lost-in-callback',
    number: 82,
    language: 'javascript',
    title: "this Lost in the Callback",
    difficulty: 'Hard',
    topic: "this Binding",
    statement:
      "`scaleAll(factor, arr)` builds a small `scaler` object that multiplies every element of `arr` by its `factor` property. It should return the scaled array, but every element comes back `NaN`.",
    functionName: 'scaleAll',
    functionSignature: "function scaleAll(factor: number, arr: number[]): number[]",
    buggyCode:
      "function scaleAll(factor, arr) {\n  const scaler = {\n    factor: factor,\n    apply: function (values) {\n      return values.map(function (v) {\n        return v * this.factor;\n      });\n    },\n  };\n  return scaler.apply(arr);\n}\n",
    hint: "Inside the `map` callback, what is `this`? It is not `scaler`.",
    explanation:
      "A `function` expression gets its own `this`, decided by HOW it is called. `map` invokes the callback as a plain function, so `this` is the global object (or `undefined` in strict mode) and `this.factor` is `undefined`, giving `NaN`. Use an arrow function, which inherits `this` from `apply`: `values.map(v => v * this.factor)`. (Passing `this` as `map`'s second argument, or capturing `const self = this`, also works.)",
    examples: [
      { input: [2, [1, 2, 3]], expected: [2, 4, 6] },
      { input: [0.5, [10]], expected: [5] },
      { input: [3, []], expected: [] },
    ],
    hiddenTests: [
      { input: [-1, [1, -1]], expected: [-1, 1] },
      { input: [10, [0, 1]], expected: [0, 10] },
    ],
  },
  {
    id: 'js-regex-global-lastindex',
    number: 83,
    language: 'javascript',
    title: "Sticky lastIndex",
    difficulty: 'Hard',
    topic: "Regex",
    statement:
      "`filterLowercase(words)` should keep only the words made entirely of lowercase letters. With input `['abc', 'def', 'ghi']` it returns `['abc', 'ghi']` — every other valid word is mysteriously dropped.",
    functionName: 'filterLowercase',
    functionSignature: "function filterLowercase(words: string[]): string[]",
    buggyCode:
      "function filterLowercase(words) {\n  const re = /^[a-z]+$/g;\n  return words.filter(w => re.test(w));\n}\n",
    hint: "Look at the regex flags. Does `test` keep any state between calls?",
    explanation:
      "With the `g` flag, `RegExp.prototype.test` is stateful: after a successful match it stores `lastIndex` and the NEXT call starts searching from that position. Reusing one global regex across many strings therefore fails on every other input. Drop the `g` flag (`/^[a-z]+$/`) — it is only meaningful for repeated matching within a single string — or reset `re.lastIndex = 0` before each test.",
    examples: [
      { input: [["abc", "def", "ghi"]], expected: ["abc", "def", "ghi"] },
      { input: [["hi", "yo"]], expected: ["hi", "yo"] },
      { input: [["Hello", "world"]], expected: ["world"] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [["a", "b", "c"]], expected: ["a", "b", "c"] },
      { input: [["ok", "NO", "fine", "x1"]], expected: ["ok", "fine"] },
    ],
  },
  {
    id: 'js-numeric-keys-reorder',
    number: 84,
    language: 'javascript',
    title: "Numeric Keys Reorder Themselves",
    difficulty: 'Hard',
    topic: "Objects",
    statement:
      "`dedupeInOrder(ids)` should remove duplicate numeric ids while preserving the order in which each id FIRST appeared. Duplicates are removed correctly, but the result always comes back sorted ascending regardless of input order.",
    functionName: 'dedupeInOrder',
    functionSignature: "function dedupeInOrder(ids: number[]): number[]",
    buggyCode:
      "function dedupeInOrder(ids) {\n  const seen = {};\n  for (const id of ids) {\n    if (!(id in seen)) seen[id] = true;\n  }\n  return Object.keys(seen).map(Number);\n}\n",
    hint: "Plain objects do not remember insertion order for every kind of key.",
    explanation:
      "Object property order is insertion order ONLY for string keys; integer-like keys are always enumerated first, in ascending numeric order. So `Object.keys` throws away the order you inserted. Track order separately: push into an array when an id is first seen (`const seen = new Set(); const out = []; for (const id of ids) if (!seen.has(id)) { seen.add(id); out.push(id); } return out;`), or use a `Map`/`Set`, which do preserve insertion order for all keys.",
    examples: [
      { input: [[3, 1, 2, 3]], expected: [3, 1, 2] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
      { input: [[5, 5, 5]], expected: [5] },
    ],
    hiddenTests: [
      { input: [[10, 2, 10, 7]], expected: [10, 2, 7] },
      { input: [[]], expected: [] },
      { input: [[2, 1]], expected: [2, 1] },
    ],
  },
  {
    id: 'js-spread-shallow-nested',
    number: 85,
    language: 'javascript',
    title: "Spread Copies One Level Deep",
    difficulty: 'Hard',
    topic: "Objects",
    statement:
      "`relocate(user, city)` should build an updated copy of `user` living in `city` and return `{ before, after }` — the city on the ORIGINAL user and the city on the updated copy. Instead `before` always equals `after`: the original user has been moved too.",
    functionName: 'relocate',
    functionSignature: "function relocate(user: { address: { city: string } }, city: string): { before: string, after: string }",
    buggyCode:
      "function relocate(user, city) {\n  const updated = { ...user };\n  updated.address.city = city;\n  return { before: user.address.city, after: updated.address.city };\n}\n",
    hint: "`{ ...user }` copies the top-level properties — what does `updated.address` point at?",
    explanation:
      "Object spread makes a SHALLOW copy: `updated.address` is the very same object as `user.address`, so writing `updated.address.city` mutates the original user as well. Copy the nested object too before changing it: `const updated = { ...user, address: { ...user.address, city } };`. For deeper structures use `structuredClone` or a recursive clone.",
    examples: [
      { input: [{ name: "Ada", address: { city: "London" } }, "Paris"], expected: { before: "London", after: "Paris" } },
      { input: [{ name: "Bob", address: { city: "Rome", zip: "00100" } }, "Oslo"], expected: { before: "Rome", after: "Oslo" } },
    ],
    hiddenTests: [
      { input: [{ address: { city: "Tokyo" } }, "Kyoto"], expected: { before: "Tokyo", after: "Kyoto" } },
      { input: [{ address: { city: "Lima" } }, "Lima"], expected: { before: "Lima", after: "Lima" } },
      { input: [{ id: 7, address: { city: "Cairo" } }, "Giza"], expected: { before: "Cairo", after: "Giza" } },
    ],
  },
  // ---------------------------------------------------------------- 86 Easy
  {
    id: 'js-join-default-comma',
    number: 86,
    language: 'javascript',
    title: 'join Defaults to Commas',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement:
      'Turn an array of words into a single space-separated sentence. Right now the words come back glued together with commas.',
    functionName: 'toSentence',
    functionSignature: 'function toSentence(words: string[]): string',
    buggyCode:
      'function toSentence(words) {\n  return words.join();\n}\n',
    hint: 'What separator does `join` use when you do not pass one?',
    explanation:
      '`Array.prototype.join()` with no argument uses `","` as the separator, so `["a", "b"].join()` is `"a,b"`. Pass the separator you actually want: `words.join(" ")`.',
    examples: [
      { input: [['hello', 'world']], expected: 'hello world' },
      { input: [['one', 'two', 'three']], expected: 'one two three' },
    ],
    hiddenTests: [
      { input: [['solo']], expected: 'solo' },
      { input: [[]], expected: '' },
      { input: [['a', 'b', 'c', 'd']], expected: 'a b c d' },
    ],
  },
  // ---------------------------------------------------------------- 87 Easy
  {
    id: 'js-concat-returns-new',
    number: 87,
    language: 'javascript',
    title: 'concat Returns a New Array',
    difficulty: 'Easy',
    topic: 'Arrays',
    statement:
      'Return the elements of `a` followed by the elements of `b`. The function currently returns `a` unchanged, as if nothing was appended.',
    functionName: 'appendAll',
    functionSignature: 'function appendAll(a: any[], b: any[]): any[]',
    buggyCode:
      'function appendAll(a, b) {\n  a.concat(b);\n  return a;\n}\n',
    hint: 'Does `concat` change the array it is called on, or hand you back something new?',
    explanation:
      'Unlike `push`, `concat` never mutates its receiver — it builds and returns a brand-new array. Calling it and throwing away the result is a no-op. Return the result: `return a.concat(b);` (or `[...a, ...b]`).',
    examples: [
      { input: [[1, 2], [3, 4]], expected: [1, 2, 3, 4] },
      { input: [[], ['x']], expected: ['x'] },
    ],
    hiddenTests: [
      { input: [['a'], []], expected: ['a'] },
      { input: [[1], [2], [3]], expected: [1, 2] },
      { input: [[], []], expected: [] },
    ],
  },
  // ---------------------------------------------------------------- 88 Easy
  {
    id: 'js-charat-negative-index',
    number: 88,
    language: 'javascript',
    title: "charAt Doesn't Go Negative",
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      'Return the last character of a string, or an empty string when the input is empty. The function currently returns an empty string for every input.',
    functionName: 'lastChar',
    functionSignature: 'function lastChar(s: string): string',
    buggyCode:
      'function lastChar(s) {\n  return s.charAt(-1);\n}\n',
    hint: '`slice(-1)` counts from the end. Does `charAt` do the same?',
    explanation:
      '`charAt` does not understand negative indices — any index outside `0..length-1` yields `""`, so `charAt(-1)` is always empty. Index from the end explicitly: `s.charAt(s.length - 1)`. (`s.slice(-1)` also works; `s.at(-1)` returns `undefined` for empty strings, so it needs a fallback.)',
    examples: [
      { input: ['hello'], expected: 'o' },
      { input: ['a'], expected: 'a' },
    ],
    hiddenTests: [
      { input: [''], expected: '' },
      { input: ['xyz!'], expected: '!' },
      { input: ['  '], expected: ' ' },
    ],
  },
  // ---------------------------------------------------------------- 89 Easy
  {
    id: 'js-regex-missing-i-flag',
    number: 89,
    language: 'javascript',
    title: 'Missing the i Flag',
    difficulty: 'Easy',
    topic: 'Regex',
    statement:
      'Return true when the input is a valid 6-digit hex colour like "#ff8800" or "#FF8800" — hex digits may be in either case. Uppercase colours are currently rejected.',
    functionName: 'isHexColor',
    functionSignature: 'function isHexColor(s: string): boolean',
    buggyCode:
      'function isHexColor(s) {\n  return /^#[0-9a-f]{6}$/.test(s);\n}\n',
    hint: 'A character class of `a-f` only matches lowercase letters. Which flag makes the match case-insensitive?',
    explanation:
      'Regex character classes are case-sensitive by default, so `[0-9a-f]` rejects `A`–`F`. Add the `i` flag — `/^#[0-9a-f]{6}$/i` — or widen the class to `[0-9a-fA-F]`.',
    examples: [
      { input: ['#ff8800'], expected: true },
      { input: ['#FF8800'], expected: true },
      { input: ['ff8800'], expected: false },
    ],
    hiddenTests: [
      { input: ['#AbCdEf'], expected: true },
      { input: ['#12345'], expected: false },
      { input: ['#GGGGGG'], expected: false },
      { input: ['#1234567'], expected: false },
    ],
  },
  // ---------------------------------------------------------------- 90 Medium
  {
    id: 'js-getday-vs-getdate',
    number: 90,
    language: 'javascript',
    title: 'Day of Week vs Day of Month',
    difficulty: 'Medium',
    topic: 'Dates',
    statement:
      'Given an ISO date string "YYYY-MM-DD", return true if it falls on a Saturday or Sunday. The function currently reports the wrong days as weekends.',
    functionName: 'isWeekend',
    functionSignature: 'function isWeekend(iso: string): boolean',
    buggyCode:
      'function isWeekend(iso) {\n  const [y, m, d] = iso.split("-").map(Number);\n  const date = new Date(y, m - 1, d);\n  const day = date.getDate();\n  return day === 0 || day === 6;\n}\n',
    hint: 'One getter returns 1–31, the other returns 0–6. Which is which?',
    explanation:
      '`getDate()` returns the day of the *month* (1–31); `getDay()` returns the day of the *week* (0 = Sunday … 6 = Saturday). The check for 0 or 6 needs `getDay()`.',
    examples: [
      { input: ['2024-06-08'], expected: true },
      { input: ['2024-06-06'], expected: false },
    ],
    hiddenTests: [
      { input: ['2024-06-09'], expected: true },
      { input: ['2024-06-10'], expected: false },
      { input: ['2024-03-16'], expected: true },
      { input: ['2024-01-01'], expected: false },
    ],
  },
  // ---------------------------------------------------------------- 91 Medium
  {
    id: 'js-sort-comparator-boolean',
    number: 91,
    language: 'javascript',
    title: 'Comparator Returns a Boolean',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      'Return a new array with the numbers sorted in ascending order. The comparator looks right but the output comes back unsorted.',
    functionName: 'sortAscending',
    functionSignature: 'function sortAscending(nums: number[]): number[]',
    buggyCode:
      'function sortAscending(nums) {\n  return [...nums].sort((a, b) => a > b);\n}\n',
    hint: 'A comparator must be able to say "a comes first" — that is a negative number, not `false`.',
    explanation:
      'A sort comparator must return a negative number, zero, or a positive number. A boolean coerces to `1` (true) or `0` (false) — it can never say "a comes before b", so the engine treats every pair as equal-or-swap and the result is unreliable. Return the difference: `(a, b) => a - b`.',
    examples: [
      { input: [[3, 1, 2]], expected: [1, 2, 3] },
      { input: [[10, 1, 7, 3, 9, 2, 8]], expected: [1, 2, 3, 7, 8, 9, 10] },
    ],
    hiddenTests: [
      { input: [[2, 1]], expected: [1, 2] },
      { input: [[5, -1, 0, 5, 3]], expected: [-1, 0, 3, 5, 5] },
      { input: [[]], expected: [] },
    ],
  },
  // ---------------------------------------------------------------- 92 Medium
  {
    id: 'js-substr-takes-length',
    number: 92,
    language: 'javascript',
    title: 'substr Takes a Length',
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      'Return the part of a string between index `start` (inclusive) and index `end` (exclusive). The current code returns too many characters when `start` is not zero.',
    functionName: 'excerpt',
    functionSignature: 'function excerpt(s: string, start: number, end: number): string',
    buggyCode:
      'function excerpt(s, start, end) {\n  return s.substr(start, end);\n}\n',
    hint: 'Read the second argument of `substr` carefully — it is not an index.',
    explanation:
      '`substr(start, length)` takes a *length* as its second argument, whereas `substring(start, end)` and `slice(start, end)` take an *end index*. Passing `end` as a length over-reads whenever `start > 0`. Use `s.slice(start, end)`; `substr` is deprecated anyway.',
    examples: [
      { input: ['hello world', 2, 5], expected: 'llo' },
      { input: ['hello world', 0, 5], expected: 'hello' },
    ],
    hiddenTests: [
      { input: ['abcdef', 3, 4], expected: 'd' },
      { input: ['abcdef', 1, 6], expected: 'bcdef' },
      { input: ['abcdef', 4, 4], expected: '' },
    ],
  },
  // ---------------------------------------------------------------- 93 Medium
  {
    id: 'js-split-limit-truncates',
    number: 93,
    language: 'javascript',
    title: "split's Limit Drops the Rest",
    difficulty: 'Medium',
    topic: 'Strings',
    statement:
      'Parse a "key=value" assignment into `{ key, value }`. The value may itself contain "=" characters (for example a base64 blob), and everything after the first "=" belongs to the value. Currently such values get cut short.',
    functionName: 'parseAssignment',
    functionSignature: 'function parseAssignment(s: string): { key: string; value: string }',
    buggyCode:
      'function parseAssignment(s) {\n  const [key, value] = s.split("=", 2);\n  return { key, value };\n}\n',
    hint: 'The second argument to `split` is not "split at most this many times".',
    explanation:
      '`split(sep, limit)` splits the *whole* string and then keeps only the first `limit` pieces — the remainder is discarded, not folded into the last piece. To split on the first occurrence only, find its index: `const i = s.indexOf("="); return { key: s.slice(0, i), value: s.slice(i + 1) };`.',
    examples: [
      { input: ['name=alice'], expected: { key: 'name', value: 'alice' } },
      { input: ['token=abc=='], expected: { key: 'token', value: 'abc==' } },
    ],
    hiddenTests: [
      { input: ['a=b=c=d'], expected: { key: 'a', value: 'b=c=d' } },
      { input: ['empty='], expected: { key: 'empty', value: '' } },
      { input: ['x=1'], expected: { key: 'x', value: '1' } },
    ],
  },
  // ---------------------------------------------------------------- 94 Medium
  {
    id: 'js-every-vacuous-truth',
    number: 94,
    language: 'javascript',
    title: 'every Is Vacuously True',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      'An order can ship only if it contains at least one line item and every line item has a positive quantity. Orders with no items are currently marked as shippable.',
    functionName: 'canShip',
    functionSignature: 'function canShip(items: { qty: number }[]): boolean',
    buggyCode:
      'function canShip(items) {\n  return items.every((item) => item.qty > 0);\n}\n',
    hint: 'What does `[].every(...)` return when there is nothing to check?',
    explanation:
      '`every` returns `true` for an empty array — there is no element that fails the predicate, so the claim is vacuously true. The "at least one item" rule has to be checked separately: `items.length > 0 && items.every(...)`.',
    examples: [
      { input: [[{ qty: 2 }, { qty: 1 }]], expected: true },
      { input: [[]], expected: false },
    ],
    hiddenTests: [
      { input: [[{ qty: 0 }]], expected: false },
      { input: [[{ qty: 3 }, { qty: -1 }]], expected: false },
      { input: [[{ qty: 1 }]], expected: true },
    ],
  },
  // ---------------------------------------------------------------- 95 Medium
  {
    id: 'js-object-entries-on-map',
    number: 95,
    language: 'javascript',
    title: "Object.entries Can't Read a Map",
    difficulty: 'Medium',
    topic: 'Maps',
    statement:
      'Given a list of `{ player, score }` records, return each player once with their highest score, in the order players first appear. The function currently returns an empty array.',
    functionName: 'bestScores',
    functionSignature: 'function bestScores(records: { player: string; score: number }[]): { player: string; score: number }[]',
    buggyCode:
      'function bestScores(records) {\n  const best = new Map();\n  for (const r of records) {\n    if (!best.has(r.player) || r.score > best.get(r.player)) {\n      best.set(r.player, r.score);\n    }\n  }\n  return Object.entries(best).map(([player, score]) => ({ player, score }));\n}\n',
    hint: 'A Map stores its data internally, not as own enumerable properties.',
    explanation:
      '`Object.entries` reads an object\'s own enumerable string-keyed properties. A `Map` keeps its entries in internal slots, so `Object.entries(map)` is always `[]`. Iterate the Map itself: `[...best].map(...)`, `Array.from(best, ...)`, or `[...best.entries()]`.',
    examples: [
      {
        input: [[{ player: 'ann', score: 10 }, { player: 'bob', score: 7 }, { player: 'ann', score: 12 }]],
        expected: [{ player: 'ann', score: 12 }, { player: 'bob', score: 7 }],
      },
      { input: [[{ player: 'zed', score: 1 }]], expected: [{ player: 'zed', score: 1 }] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      {
        input: [[{ player: 'a', score: 5 }, { player: 'a', score: 3 }, { player: 'b', score: 9 }, { player: 'b', score: 9 }]],
        expected: [{ player: 'a', score: 5 }, { player: 'b', score: 9 }],
      },
    ],
  },
  // ---------------------------------------------------------------- 96 Medium
  {
    id: 'js-default-param-skips-null',
    number: 96,
    language: 'javascript',
    title: 'Defaults Skip null',
    difficulty: 'Medium',
    topic: 'Default Params',
    statement:
      'Return a greeting like "Hello, Ada!". When no usable name is given — `undefined` or `null` — fall back to "Guest". Right now `null` produces "Hello, null!".',
    functionName: 'greet',
    functionSignature: 'function greet(name?: string | null): string',
    buggyCode:
      'function greet(name = "Guest") {\n  return `Hello, ${name}!`;\n}\n',
    hint: 'Default parameters only kick in for one specific value — and it is not `null`.',
    explanation:
      'A default parameter is applied only when the argument is `undefined`. `null` is a real value, so it is passed through and stringified as "null". Handle both nullish cases explicitly: `const who = name ?? "Guest";`.',
    examples: [
      { input: ['Ada'], expected: 'Hello, Ada!' },
      { input: [null], expected: 'Hello, Guest!' },
    ],
    hiddenTests: [
      { input: [], expected: 'Hello, Guest!' },
      { input: ['Grace'], expected: 'Hello, Grace!' },
      { input: [''], expected: 'Hello, !' },
    ],
  },
  // ---------------------------------------------------------------- 97 Hard
  {
    id: 'js-past-safe-integer',
    number: 97,
    language: 'javascript',
    title: 'Past the Safe Integer',
    difficulty: 'Hard',
    topic: 'Numbers',
    statement:
      'IDs are decimal strings that can exceed 2^53. Return the next ID (current + 1) as a string. Small IDs work, but large ones come back unchanged or off by one.',
    functionName: 'nextId',
    functionSignature: 'function nextId(id: string): string',
    buggyCode:
      'function nextId(id) {\n  return String(Number(id) + 1);\n}\n',
    hint: 'Look at `Number.MAX_SAFE_INTEGER`. What can represent integers beyond it exactly?',
    explanation:
      'A JavaScript `Number` is an IEEE-754 double: integers above 2^53 − 1 (`Number.MAX_SAFE_INTEGER`) can no longer be represented exactly, so `Number("9007199254740993")` already rounds to 9007199254740992 and adding 1 rounds again. Use `BigInt` for arbitrary-precision integers: `(BigInt(id) + 1n).toString()`.',
    examples: [
      { input: ['41'], expected: '42' },
      { input: ['9007199254740993'], expected: '9007199254740994' },
    ],
    hiddenTests: [
      { input: ['0'], expected: '1' },
      { input: ['18446744073709551615'], expected: '18446744073709551616' },
      { input: ['9007199254740991'], expected: '9007199254740992' },
      { input: ['99999999999999999999'], expected: '100000000000000000000' },
    ],
  },
  // ---------------------------------------------------------------- 98 Hard
  {
    id: 'js-finally-overrides-return',
    number: 98,
    language: 'javascript',
    title: 'finally Overrides the Return',
    difficulty: 'Hard',
    topic: 'Control Flow',
    statement:
      'Divide `a` by `b` and return `{ ok: true, value }`, or `{ ok: false, error }` when `b` is zero. The `finally` block was added as a "last-resort fallback" — but now every call returns the fallback.',
    functionName: 'tryDivide',
    functionSignature: 'function tryDivide(a: number, b: number): { ok: boolean; value?: number; error?: string }',
    buggyCode:
      'function tryDivide(a, b) {\n  try {\n    if (b === 0) throw new Error("division by zero");\n    return { ok: true, value: a / b };\n  } catch (e) {\n    return { ok: false, error: e.message };\n  } finally {\n    return { ok: false, error: "unknown" };\n  }\n}\n',
    hint: 'When does `finally` run relative to the `return` statements in `try` and `catch`?',
    explanation:
      '`finally` runs after `try`/`catch` complete — including after a `return` has been evaluated. If the `finally` block itself returns (or throws), that completion *replaces* the pending one, so both the success and error results are thrown away. Never `return` from `finally`; use it only for cleanup, or drop it entirely here.',
    examples: [
      { input: [10, 2], expected: { ok: true, value: 5 } },
      { input: [1, 0], expected: { ok: false, error: 'division by zero' } },
    ],
    hiddenTests: [
      { input: [7, 7], expected: { ok: true, value: 1 } },
      { input: [-9, 3], expected: { ok: true, value: -3 } },
      { input: [0, 0], expected: { ok: false, error: 'division by zero' } },
    ],
  },
  // ---------------------------------------------------------------- 99 Hard
  {
    id: 'js-arrow-no-arguments',
    number: 99,
    language: 'javascript',
    title: 'Arrows Have No arguments',
    difficulty: 'Hard',
    topic: 'Functions',
    statement:
      'Return the sum of every number passed as a separate argument, e.g. `sumAll(1, 2, 3)` is 6. The function currently returns 0 no matter what you pass.',
    functionName: 'sumAll',
    functionSignature: 'function sumAll(...nums: number[]): number',
    buggyCode:
      'const sumAll = () => {\n  let total = 0;\n  for (let i = 0; i < arguments.length; i++) {\n    total += arguments[i];\n  }\n  return total;\n};\n',
    hint: 'Arrow functions do not get their own `arguments` object — whose `arguments` is this reading?',
    explanation:
      'Arrow functions have no `arguments` binding of their own; the identifier resolves lexically to the *enclosing* function\'s `arguments` (or throws a ReferenceError at module top level). Here it sees the outer scope\'s empty argument list, so the loop never runs. Collect the arguments with a rest parameter instead: `const sumAll = (...nums) => nums.reduce((t, n) => t + n, 0);`.',
    examples: [
      { input: [1, 2, 3], expected: 6 },
      { input: [5], expected: 5 },
    ],
    hiddenTests: [
      { input: [], expected: 0 },
      { input: [-1, 1, 10], expected: 10 },
      { input: [0.5, 0.25], expected: 0.75 },
    ],
  },
  // ---------------------------------------------------------------- 100 Hard
  {
    id: 'js-bitwise-32bit-truncation',
    number: 100,
    language: 'javascript',
    title: 'Bitwise Truncation Is 32-Bit',
    difficulty: 'Hard',
    topic: 'Numbers',
    statement:
      'Truncate a number toward zero (drop the fractional part). The `| 0` trick works for small values but produces garbage for numbers around a few billion.',
    functionName: 'truncate',
    functionSignature: 'function truncate(x: number): number',
    buggyCode:
      'function truncate(x) {\n  return x | 0;\n}\n',
    hint: 'Bitwise operators convert their operands to a fixed-width integer first. How wide?',
    explanation:
      'Every bitwise operator (`|`, `&`, `~`, `<<`…) first converts its operands to a signed *32-bit* integer, wrapping anything outside −2^31 … 2^31 − 1. So `2147483648 | 0` is `-2147483648` and `3e9 | 0` is `-1294967296`. Use `Math.trunc(x)`, which truncates toward zero across the full double range.',
    examples: [
      { input: [3.7], expected: 3 },
      { input: [-3.7], expected: -3 },
      { input: [3000000000.5], expected: 3000000000 },
    ],
    hiddenTests: [
      { input: [2147483648.9], expected: 2147483648 },
      { input: [0.2], expected: 0 },
      { input: [-2147483649.5], expected: -2147483649 },
      { input: [10000000000], expected: 10000000000 },
    ],
  },
];

// =============================================================================
// JAVA (100)
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
  {
    id: 'java-equalsignorecase',
    number: 33,
    language: 'java',
    title: "Case-Insensitive Word Match",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "`sameWord` should return true when the two strings are equal ignoring case, so \"Hello\" and \"hello\" match. The current code lowercases both sides but compares them with `==`, which tests reference identity and fails for strings built at runtime.",
    functionSignature: "public static boolean sameWord(String a, String b)",
    buggyCode:
      "public static boolean sameWord(String a, String b) {\n    return a.toLowerCase() == b.toLowerCase();\n}\n",
    hint: "There is a single String method that compares contents ignoring case.",
    explanation:
      "`a.toLowerCase()` and `b.toLowerCase()` each produce fresh String objects, so `==` compares two different references and returns false even when the text matches. Use `a.equalsIgnoreCase(b)`, which compares contents case-insensitively in one call.",
    rules: [
      { label: "Uses equalsIgnoreCase for content comparison", type: 'mustContain', pattern: "equalsIgnoreCase(" },
      { label: "No longer compares strings with ==", type: 'mustNotContain', pattern: "== b.toLowerCase()" },
    ],
  },
  {
    id: 'java-sb-tostring',
    number: 34,
    language: 'java',
    title: "StringBuilder Is Not a String",
    difficulty: 'Easy',
    topic: "Strings",
    statement:
      "`repeat` should return `s` concatenated `n` times as a String. The method builds the result in a StringBuilder correctly but returns the builder itself, so it does not compile as a String return.",
    functionSignature: "public static String repeat(String s, int n)",
    buggyCode:
      "public static String repeat(String s, int n) {\n    StringBuilder sb = new StringBuilder();\n    for (int i = 0; i < n; i++) {\n        sb.append(s);\n    }\n    return sb;\n}\n",
    hint: "A StringBuilder is not a String. Convert it before returning.",
    explanation:
      "`sb` is a `StringBuilder`, not a `String`, so `return sb;` fails to compile against a `String` return type. Call `sb.toString()` to materialize the accumulated characters into an actual String.",
    rules: [
      { label: "Converts the StringBuilder to a String", type: 'mustContain', pattern: "sb.toString()" },
      { label: "No longer returns the StringBuilder directly", type: 'mustNotContain', pattern: "return sb;" },
      { label: "Reference fix", type: 'acceptedFix', pattern: "public static String repeat(String s, int n) {\n    StringBuilder sb = new StringBuilder();\n    for (int i = 0; i < n; i++) {\n        sb.append(s);\n    }\n    return sb.toString();\n}\n" },
    ],
  },
  {
    id: 'java-char-to-int-arith',
    number: 35,
    language: 'java',
    title: "Char Digit Arithmetic",
    difficulty: 'Easy',
    topic: "Char arithmetic",
    statement:
      "`digitValue` should convert a digit character like '7' into its numeric value 7. The current code subtracts the int literal 0, which does nothing useful since a char promotes to its ASCII code (e.g. '7' is 55).",
    functionSignature: "public static int digitValue(char c)",
    buggyCode:
      "public static int digitValue(char c) {\n    return c - 0;\n}\n",
    hint: "The character '0' has an ASCII code. Subtract the char, not the number.",
    explanation:
      "A `char` in arithmetic promotes to its Unicode/ASCII code: '7' is 55, not 7. Subtracting the int literal `0` leaves 55. Subtract the char literal `'0'` (code 48) instead: `c - '0'` gives 55 - 48 = 7.",
    rules: [
      { label: "Subtracts the char literal '0'", type: 'mustContain', pattern: "c - '0'" },
      { label: "No longer subtracts the int literal 0", type: 'mustNotContain', pattern: "c - 0" },
    ],
  },
  {
    id: 'java-uppercase-char',
    number: 36,
    language: 'java',
    title: "Shift Lowercase to Uppercase",
    difficulty: 'Medium',
    topic: "Char arithmetic",
    statement:
      "`toUpper` should return the uppercase version of a lowercase letter (and leave other characters unchanged) using char arithmetic. The offset direction is wrong: it adds 32 instead of subtracting it, pushing letters further past 'z'.",
    functionSignature: "public static char toUpper(char c)",
    buggyCode:
      "public static char toUpper(char c) {\n    if (c >= 'a' && c <= 'z') {\n        return (char) (c + 32);\n    }\n    return c;\n}\n",
    hint: "'a' is 97 and 'A' is 65. Which direction is that?",
    explanation:
      "In ASCII a lowercase letter is 32 greater than its uppercase counterpart ('a'=97, 'A'=65). To go lowercase to uppercase you must subtract 32, not add it. Adding 32 moves the character beyond the alphabet entirely.",
    rules: [
      { label: "Subtracts 32 to shift lowercase to uppercase", type: 'mustContain', pattern: "c - 32" },
      { label: "No longer adds 32", type: 'mustNotContain', pattern: "c + 32" },
    ],
  },
  {
    id: 'java-reverse-sb',
    number: 37,
    language: 'java',
    title: "Reverse and Return",
    difficulty: 'Medium',
    topic: "Strings",
    statement:
      "`reverse` should return the input string reversed. It creates a StringBuilder and calls `reverse()`, but then returns the original `s` instead of the reversed builder, so the output never changes.",
    functionSignature: "public static String reverse(String s)",
    buggyCode:
      "public static String reverse(String s) {\n    StringBuilder sb = new StringBuilder(s);\n    sb.reverse();\n    return s;\n}\n",
    hint: "The reversal happens on sb, not on s. What are you returning?",
    explanation:
      "`sb.reverse()` mutates the StringBuilder in place; it does not touch the immutable original String `s`. Returning `s` gives back the unchanged input. Return `sb.toString()` to yield the reversed contents.",
    rules: [
      { label: "Returns the reversed StringBuilder contents", type: 'mustContain', pattern: "sb.toString()" },
      { label: "No longer returns the original string", type: 'mustNotContain', pattern: "return s;" },
    ],
  },
  {
    id: 'java-count-vowels-equals',
    number: 38,
    language: 'java',
    title: "Assignment in a Condition",
    difficulty: 'Hard',
    topic: "Char arithmetic",
    statement:
      "`countVowels` should count the vowels (a, e, i, o, u, case-insensitive) in `s`. The final comparison in the `if` uses a single `=`, which is assignment rather than comparison and does not compile for char operands.",
    functionSignature: "public static int countVowels(String s)",
    buggyCode:
      "public static int countVowels(String s) {\n    int count = 0;\n    for (int i = 0; i < s.length(); i++) {\n        char c = Character.toLowerCase(s.charAt(i));\n        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c = 'u') {\n            count++;\n        }\n    }\n    return count;\n}\n",
    hint: "Look closely at the last operand: is that comparison or assignment?",
    explanation:
      "The last term `c = 'u'` uses a single `=`, which is assignment, not the equality operator. In an `if` condition Java requires a boolean, and an assignment of a char is not boolean, so it fails to compile. Use `==`: `c == 'u'`.",
    rules: [
      { label: "Compares against 'u' with ==", type: 'mustContain', pattern: "c == 'u'" },
      { label: "No longer assigns with a single =", type: 'mustNotContain', pattern: "c = 'u'" },
    ],
  },
  {
    id: 'java-palindrome-equals',
    number: 39,
    language: 'java',
    title: "Palindrome String Compare",
    difficulty: 'Hard',
    topic: "Strings",
    statement:
      "`isPalindrome` should return true when `s` reads the same forwards and backwards. It builds the reversed string correctly but compares it to `s` with `==`, comparing references instead of contents, so it returns false even for real palindromes.",
    functionSignature: "public static boolean isPalindrome(String s)",
    buggyCode:
      "public static boolean isPalindrome(String s) {\n    String reversed = new StringBuilder(s).reverse().toString();\n    return s == reversed;\n}\n",
    hint: "reversed is a freshly built String object. == won't compare its characters.",
    explanation:
      "`reversed` comes from `toString()` on a StringBuilder, so it is a distinct object from `s`. `s == reversed` compares references and is false even when the characters match. Use `s.equals(reversed)` to compare contents.",
    rules: [
      { label: "Uses .equals() to compare contents", type: 'mustContain', pattern: "s.equals(reversed)" },
      { label: "No longer compares with ==", type: 'mustNotContain', pattern: "s == reversed" },
    ],
  },
  {
    id: 'java-reverse-array-inplace',
    number: 40,
    language: 'java',
    title: "Reverse an Array In Place",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "`reverse` should reverse the int array in place by swapping the element at index `i` with its mirror. The loop currently runs across the whole array, so every swap is undone and the array comes back unchanged.",
    functionSignature: "public static void reverse(int[] arr)",
    buggyCode:
      "public static void reverse(int[] arr) {\n    for (int i = 0; i <= arr.length - 1; i++) {\n        int tmp = arr[i];\n        arr[i] = arr[arr.length - 1 - i];\n        arr[arr.length - 1 - i] = tmp;\n    }\n}\n",
    hint: "If you swap every pair twice, you end up where you started. Only walk to the midpoint.",
    explanation:
      "Each iteration swaps arr[i] with its mirror arr[length-1-i]. Running the loop over the entire array swaps every pair a second time in the back half, restoring the original order. The loop must stop at the midpoint: `i < arr.length / 2`.",
    rules: [
      { label: "Loop stops at the midpoint", type: 'mustContain', pattern: "i < arr.length / 2" },
      { label: "No longer walks the whole array", type: 'mustNotContain', pattern: "i <= arr.length - 1" },
    ],
  },
  {
    id: 'java-last-index-of',
    number: 41,
    language: 'java',
    title: "Last Index Of",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "`lastIndexOf` should return the index of the LAST occurrence of `target` in the array, or -1 if it is absent. The current code scans forward and returns the FIRST match instead.",
    functionSignature: "public static int lastIndexOf(int[] arr, int target)",
    buggyCode:
      "public static int lastIndexOf(int[] arr, int target) {\n    for (int i = 0; i < arr.length; i++) {\n        if (arr[i] == target) return i;\n    }\n    return -1;\n}\n",
    hint: "To find the last match, start from the end and walk backward.",
    explanation:
      "Returning on the first match found while scanning left-to-right yields the first occurrence, not the last. Iterate from `arr.length - 1` down to 0 so the first match you hit is the rightmost one.",
    rules: [
      { label: "Iterates from the end downward", type: 'mustContain', pattern: "i = arr.length - 1; i >= 0; i--" },
      { label: "No longer scans forward from 0", type: 'mustNotContain', pattern: "i = 0; i < arr.length; i++" },
    ],
  },
  {
    id: 'java-count-in-range',
    number: 42,
    language: 'java',
    title: "Count In Range (Inclusive)",
    difficulty: 'Easy',
    topic: "Loops",
    statement:
      "`countInRange` should count how many array elements fall within `[lo, hi]` INCLUSIVE. The current comparison uses strict `>` and `<`, so values exactly equal to `lo` or `hi` are wrongly skipped.",
    functionSignature: "public static int countInRange(int[] arr, int lo, int hi)",
    buggyCode:
      "public static int countInRange(int[] arr, int lo, int hi) {\n    int count = 0;\n    for (int x : arr) {\n        if (x > lo && x < hi) count++;\n    }\n    return count;\n}\n",
    hint: "Inclusive means the endpoints count too. Use >= and <=.",
    explanation:
      "`x > lo && x < hi` is an exclusive range and drops values equal to lo or hi. For an inclusive range use `x >= lo && x <= hi`.",
    rules: [
      { label: "Lower bound is inclusive", type: 'mustContain', pattern: "x >= lo" },
      { label: "Upper bound is inclusive", type: 'mustContain', pattern: "x <= hi" },
      { label: "No longer excludes the endpoints", type: 'mustNotContain', pattern: "x > lo && x < hi" },
    ],
  },
  {
    id: 'java-copy-first-n',
    number: 43,
    language: 'java',
    title: "Copy First N Elements",
    difficulty: 'Easy',
    topic: "Bounds",
    statement:
      "`firstN` should return a new array containing the first `n` elements of `arr`. The loop runs one iteration too many and throws ArrayIndexOutOfBoundsException writing to `out[n]`.",
    functionSignature: "public static int[] firstN(int[] arr, int n)",
    buggyCode:
      "public static int[] firstN(int[] arr, int n) {\n    int[] out = new int[n];\n    for (int i = 0; i <= n; i++) {\n        out[i] = arr[i];\n    }\n    return out;\n}\n",
    hint: "An array of size n has valid indices 0..n-1. The loop should stop before n.",
    explanation:
      "`out` has length n, so the last valid index is n-1. `i <= n` writes to out[n] on the final iteration, going out of bounds. Use `i < n`.",
    rules: [
      { label: "Loop bound uses < n", type: 'mustContain', pattern: "i < n" },
      { label: "The off-by-one <= n is gone", type: 'mustNotContain', pattern: "i <= n" },
    ],
  },
  {
    id: 'java-running-max',
    number: 44,
    language: 'java',
    title: "Running Maximum Seed",
    difficulty: 'Medium',
    topic: "Arrays",
    statement:
      "`maxValue` should return the largest element of a non-empty int array. It seeds the running max with 0, so for an all-negative array like `[-5, -2, -9]` it wrongly returns 0.",
    functionSignature: "public static int maxValue(int[] arr)",
    buggyCode:
      "public static int maxValue(int[] arr) {\n    int max = 0;\n    for (int i = 0; i < arr.length; i++) {\n        if (arr[i] > max) max = arr[i];\n    }\n    return max;\n}\n",
    hint: "0 is not a real element. Seed with an actual value from the array.",
    explanation:
      "Initializing max to 0 assumes the answer is non-negative. If every element is negative, no element beats 0 and the function returns 0 — a value not in the array. Seed with `arr[0]` and start the loop at index 1.",
    rules: [
      { label: "Seeds max with the first element", type: 'mustContain', pattern: "int max = arr[0]" },
      { label: "No longer seeds max with 0", type: 'mustNotContain', pattern: "int max = 0" },
    ],
  },
  {
    id: 'java-pair-sum-exists',
    number: 45,
    language: 'java',
    title: "Adjacent Pair Sum",
    difficulty: 'Medium',
    topic: "Bounds",
    statement:
      "`hasAdjacentSum` should return true if any two neighboring elements add up to `target`. The loop reads `arr[i + 1]` even on the last index, throwing ArrayIndexOutOfBoundsException.",
    functionSignature: "public static boolean hasAdjacentSum(int[] arr, int target)",
    buggyCode:
      "public static boolean hasAdjacentSum(int[] arr, int target) {\n    for (int i = 0; i < arr.length; i++) {\n        if (arr[i] + arr[i + 1] == target) return true;\n    }\n    return false;\n}\n",
    hint: "When you access arr[i + 1] inside the loop, the last valid i is length - 2.",
    explanation:
      "Because the body reads arr[i + 1], the loop must stop one element early. With `i < arr.length`, the final iteration accesses arr[arr.length] and throws. Use `i < arr.length - 1`.",
    rules: [
      { label: "Stops one before the end so i+1 is valid", type: 'mustContain', pattern: "i < arr.length - 1" },
      { label: "No longer runs to the last index", type: 'mustNotContain', pattern: "i < arr.length;" },
    ],
  },
  {
    id: 'java-rotate-left-one',
    number: 46,
    language: 'java',
    title: "Rotate Left by One",
    difficulty: 'Hard',
    topic: "Arrays",
    statement:
      "`rotateLeft` should shift every element one position to the left and move the first element to the end (e.g. `[1,2,3]` becomes `[2,3,1]`). The shift loop reads `arr[i + 1]` past the end and throws ArrayIndexOutOfBoundsException.",
    functionSignature: "public static void rotateLeft(int[] arr)",
    buggyCode:
      "public static void rotateLeft(int[] arr) {\n    if (arr.length == 0) return;\n    int first = arr[0];\n    for (int i = 0; i < arr.length; i++) {\n        arr[i] = arr[i + 1];\n    }\n    arr[arr.length - 1] = first;\n}\n",
    hint: "The last slot is filled separately from `first`. The shift loop should stop before touching arr[i + 1] out of bounds.",
    explanation:
      "The loop copies arr[i + 1] into arr[i]. On the last iteration i = arr.length - 1, so arr[i + 1] is arr[arr.length], which is out of bounds. The final slot is set afterward from `first`, so the shift loop should stop at `i < arr.length - 1`.",
    rules: [
      { label: "Shift loop stops one before the end", type: 'mustContain', pattern: "i < arr.length - 1" },
      { label: "No longer reads past the end via arr[i+1]", type: 'mustNotContain', pattern: "i < arr.length;" },
    ],
  },
  {
    id: 'java-percentage-int-div',
    number: 47,
    language: 'java',
    title: "Percentage Loses the Fraction",
    difficulty: 'Easy',
    topic: "Arithmetic",
    statement:
      "`percentage` should return what fraction of `whole` the value `part` represents, as a percent (a double). Right now `percentage(1, 4)` returns `0.0` instead of `25.0` because `part / whole` is computed in int first.",
    functionSignature: "public static double percentage(int part, int whole)",
    buggyCode:
      "public static double percentage(int part, int whole) {\n    return (part / whole) * 100.0;\n}\n",
    hint: "The parentheses force int / int before the multiply. Promote one operand to double.",
    explanation:
      "`part / whole` is evaluated as integer division and truncates to 0 for any part < whole, *before* it is multiplied by 100.0. Cast `part` (or `whole`) to double first: `return ((double) part / whole) * 100.0;` so the division is floating-point.",
    rules: [
      { label: "Casts part to double before dividing", type: 'mustContain', pattern: "(double) part" },
      { label: "No longer does int division in parentheses", type: 'mustNotContain', pattern: "(part / whole)" },
    ],
  },
  {
    id: 'java-midpoint-overflow',
    number: 48,
    language: 'java',
    title: "Midpoint Overflows",
    difficulty: 'Medium',
    topic: "Numbers",
    statement:
      "`midpoint` returns the average of two indices for a binary search. For large values like `low = 1_000_000_000, high = 2_000_000_000`, `(low + high)` overflows int and the result goes negative. Compute the midpoint without overflowing.",
    functionSignature: "public static int midpoint(int low, int high)",
    buggyCode:
      "public static int midpoint(int low, int high) {\n    return (low + high) / 2;\n}\n",
    hint: "The sum can exceed Integer.MAX_VALUE even when both inputs are valid ints. Rewrite so you never add the two directly.",
    explanation:
      "`low + high` can exceed `Integer.MAX_VALUE` and wrap to a negative number before the divide. The classic overflow-safe form is `low + (high - low) / 2`, which only ever computes a difference that fits in int.",
    rules: [
      { label: "Uses the overflow-safe midpoint form", type: 'mustContain', pattern: "low + (high - low) / 2" },
      { label: "No longer adds low and high directly", type: 'mustNotContain', pattern: "(low + high) / 2" },
    ],
  },
  {
    id: 'java-sum-int-overflow-long',
    number: 49,
    language: 'java',
    title: "Accumulator Overflows",
    difficulty: 'Medium',
    topic: "Overflow",
    statement:
      "`sumFirst` should return the sum 1 + 2 + ... + n as a long. For n = 100000 the true sum is 5000050000, but the method returns a wrong (negative) value because the running total is an int that overflows mid-loop.",
    functionSignature: "public static long sumFirst(int n)",
    buggyCode:
      "public static long sumFirst(int n) {\n    int total = 0;\n    for (int i = 1; i <= n; i++) total += i;\n    return total;\n}\n",
    hint: "The return type is long, but the accumulator is int. Widening only happens at the return — too late.",
    explanation:
      "`total` is an `int`, so every `total += i` is int arithmetic that overflows around 2.1 billion. The final widening to long at `return total;` happens after the damage is done. Declare the accumulator as `long total = 0;` so the additions are performed in 64-bit.",
    rules: [
      { label: "Accumulator is declared long", type: 'mustContain', pattern: "long total" },
      { label: "No longer uses an int accumulator", type: 'mustNotContain', pattern: "int total = 0" },
      { label: "Reference fix", type: 'acceptedFix', pattern: "public static long sumFirst(int n) {\n    long total = 0;\n    for (int i = 1; i <= n; i++) total += i;\n    return total;\n}\n" },
    ],
  },
  {
    id: 'java-double-to-int-round',
    number: 50,
    language: 'java',
    title: "Cast Truncates, Doesn't Round",
    difficulty: 'Easy',
    topic: "Casting",
    statement:
      "`roundToInt` should return `d` rounded to the nearest int (so `2.7` becomes `3`). Currently it returns `2` because casting a double to int truncates toward zero instead of rounding.",
    functionSignature: "public static int roundToInt(double d)",
    buggyCode:
      "public static int roundToInt(double d) {\n    return (int) d;\n}\n",
    hint: "`(int) 2.7` is 2, not 3. There is a library method that rounds.",
    explanation:
      "Casting a `double` to `int` in Java truncates the fractional part (rounds toward zero), so `2.7` -> `2` and `-2.7` -> `-2`. Use `Math.round`, which rounds to nearest: `return (int) Math.round(d);` (`Math.round(double)` returns a long, so the cast to int is still needed).",
    rules: [
      { label: "Uses Math.round to round to nearest", type: 'mustContain', pattern: "Math.round(d)" },
      { label: "No longer just truncates with a cast", type: 'mustNotContain', pattern: "return (int) d;" },
    ],
  },
  {
    id: 'java-autobox-sum-npe',
    number: 51,
    language: 'java',
    title: "Unboxing a Missing Key",
    difficulty: 'Hard',
    topic: "Autoboxing",
    statement:
      "`totalScore` adds a base of 10 to a player's score from the map. When `name` is not a key, `scores.get(name)` returns `null`, and adding it to the int `base` throws a NullPointerException. Missing players should count as 0.",
    functionSignature: "public static int totalScore(Map<String, Integer> scores, String name)",
    buggyCode:
      "public static int totalScore(Map<String, Integer> scores, String name) {\n    int base = 10;\n    return base + scores.get(name);\n}\n",
    hint: "`Map.get` returns null for a missing key. Auto-unboxing that null in `base + ...` throws an NPE.",
    explanation:
      "`scores.get(name)` returns an `Integer`, which is `null` for an absent key. The expression `base + scores.get(name)` auto-unboxes that `Integer` to an `int`, and unboxing null throws a `NullPointerException`. Read it into a variable and default null to 0, e.g. `Integer val = scores.get(name); return base + (val == null ? 0 : val);`.",
    rules: [
      { label: "Handles the null (missing key) case", type: 'mustContain', pattern: "null" },
      { label: "No longer unboxes get(name) directly in the sum", type: 'mustNotContain', pattern: "return base + scores.get(name);" },
    ],
  },
  {
    id: 'java-integer-cache-equals',
    number: 52,
    language: 'java',
    title: "Comparing Integers with ==",
    difficulty: 'Medium',
    topic: "Autoboxing",
    statement:
      "`sameValue` should return true when two `Integer` objects hold the same numeric value. It works for small values but returns false for `sameValue(1000, 1000)` because `==` compares references, not values.",
    functionSignature: "public static boolean sameValue(Integer a, Integer b)",
    buggyCode:
      "public static boolean sameValue(Integer a, Integer b) {\n    return a == b;\n}\n",
    hint: "For boxed Integers, == compares object identity. The Integer cache only covers -128..127, so it accidentally 'works' for small numbers.",
    explanation:
      "`==` on two `Integer` objects compares references. Java caches boxed Integers in the range -128..127, so `==` happens to be true for small equal values but false for larger ones like 1000. Compare values with `.equals`: `return a.equals(b);`.",
    rules: [
      { label: "Compares values with equals", type: 'mustContain', pattern: "a.equals(b)" },
      { label: "No longer compares Integers with ==", type: 'mustNotContain', pattern: "return a == b;" },
    ],
  },
  {
    id: 'java-getordefault-count',
    number: 53,
    language: 'java',
    title: "Counting With a Missing Key",
    difficulty: 'Easy',
    topic: "Maps",
    statement:
      "wordCounts should return a map from each word to how many times it appears. It crashes with a NullPointerException the first time it sees a new word, because Map.get returns null for absent keys and null + 1 unboxes null.",
    functionSignature: "public static Map<String, Integer> wordCounts(List<String> words)",
    buggyCode:
      "public static Map<String, Integer> wordCounts(List<String> words) {\n    Map<String, Integer> counts = new HashMap<>();\n    for (String w : words) {\n        counts.put(w, counts.get(w) + 1);\n    }\n    return counts;\n}",
    hint: "The first time a word is seen, counts.get(w) is null. Supply a fallback of 0.",
    explanation:
      "counts.get(w) returns null for a key that isn't in the map yet, and unboxing null to do null + 1 throws NullPointerException. counts.getOrDefault(w, 0) returns 0 for absent keys, so the increment starts each new word at 1.",
    rules: [
      { label: "Uses getOrDefault(w, 0) as the fallback", type: 'mustContain', pattern: "getOrDefault\\(w,\\s*0\\)", regex: true },
      { label: "No longer calls counts.get(w) + 1", type: 'mustNotContain', pattern: "counts.get(w) + 1" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static Map<String, Integer> wordCounts(List<String> words) {\n    Map<String, Integer> counts = new HashMap<>();\n    for (String w : words) {\n        counts.put(w, counts.getOrDefault(w, 0) + 1);\n    }\n    return counts;\n}" },
    ],
  },
  {
    id: 'java-contains-set-membership',
    number: 54,
    language: 'java',
    title: "Dedupe With list.contains",
    difficulty: 'Medium',
    topic: "Collections",
    statement:
      "distinct should return the unique values from nums in first-seen order. It works but uses list.contains inside the loop, which is O(n) per element and makes the whole method O(n^2). Track membership with a HashSet so each check is O(1).",
    functionSignature: "public static List<Integer> distinct(int[] nums)",
    buggyCode:
      "public static List<Integer> distinct(int[] nums) {\n    List<Integer> out = new ArrayList<>();\n    for (int n : nums) {\n        if (!out.contains(n)) {\n            out.add(n);\n        }\n    }\n    return out;\n}",
    hint: "A HashSet.add returns false when the element was already present, giving you an O(1) membership test.",
    explanation:
      "out.contains(n) scans the whole list each time, so building the result is quadratic. Maintaining a HashSet and using seen.add(n) — which returns true only the first time a value is inserted — keeps the order of first appearance while making membership checks O(1).",
    rules: [
      { label: "Introduces a HashSet to track seen values", type: 'mustContain', pattern: "new HashSet<>()" },
      { label: "Uses seen.add(n) for the O(1) membership check", type: 'mustContain', pattern: "seen.add(n)" },
      { label: "No longer scans the list with out.contains(n)", type: 'mustNotContain', pattern: "out.contains(n)" },
    ],
  },
  {
    id: 'java-comparator-reversed',
    number: 55,
    language: 'java',
    title: "Sorting the Wrong Way",
    difficulty: 'Easy',
    topic: "Comparators",
    statement:
      "sortDesc should sort the list in descending order (largest first), in place. It currently sorts ascending because it uses the natural-order comparator.",
    functionSignature: "public static void sortDesc(List<Integer> nums)",
    buggyCode:
      "public static void sortDesc(List<Integer> nums) {\n    nums.sort(Comparator.naturalOrder());\n}",
    hint: "There is a built-in comparator that is the reverse of natural order.",
    explanation:
      "Comparator.naturalOrder() sorts ascending, which is the opposite of what sortDesc promises. Comparator.reverseOrder() orders elements from largest to smallest, giving the intended descending sort.",
    rules: [
      { label: "Uses Comparator.reverseOrder()", type: 'mustContain', pattern: "Comparator.reverseOrder()" },
      { label: "No longer uses Comparator.naturalOrder()", type: 'mustNotContain', pattern: "Comparator.naturalOrder()" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static void sortDesc(List<Integer> nums) {\n    nums.sort(Comparator.reverseOrder());\n}" },
    ],
  },
  {
    id: 'java-entryset-iteration',
    number: 56,
    language: 'java',
    title: "Look Up While You Iterate",
    difficulty: 'Medium',
    topic: "Maps",
    statement:
      "sumValues should add up every value in the map. It iterates the key set and then re-looks-up each key after uppercasing it, so it either misses entries or throws when the uppercased key isn't present. Iterate the entry set instead and read the value directly.",
    functionSignature: "public static int sumValues(Map<String, Integer> map)",
    buggyCode:
      "public static int sumValues(Map<String, Integer> map) {\n    int total = 0;\n    for (String key : map.keySet()) {\n        total += map.get(key.toUpperCase());\n    }\n    return total;\n}",
    hint: "map.entrySet() gives you each key/value pair together — no second lookup, no key mangling.",
    explanation:
      "Uppercasing the key before map.get produces a key that generally isn't in the map, so map.get returns null and unboxing it throws (or silently skips real entries). Iterating map.entrySet() and calling e.getValue() reads each stored value directly, with no redundant lookup and no key transformation.",
    rules: [
      { label: "Iterates map.entrySet()", type: 'mustContain', pattern: "map.entrySet()" },
      { label: "Reads the value with e.getValue()", type: 'mustContain', pattern: "e.getValue()" },
      { label: "No longer uppercases the key for lookup", type: 'mustNotContain', pattern: "key.toUpperCase()" },
    ],
  },
  {
    id: 'java-iterator-remove',
    number: 57,
    language: 'java',
    title: "Remove While Iterating",
    difficulty: 'Hard',
    topic: "Iteration",
    statement:
      "removeNegatives should delete every negative number from the list in place. The current for-each loop calls nums.remove(n) during iteration, which throws ConcurrentModificationException (and the Integer overload can even remove the wrong element). Use an explicit Iterator and its remove().",
    functionSignature: "public static void removeNegatives(List<Integer> nums)",
    buggyCode:
      "public static void removeNegatives(List<Integer> nums) {\n    for (Integer n : nums) {\n        if (n < 0) {\n            nums.remove(n);\n        }\n    }\n}",
    hint: "The only safe way to delete during iteration is Iterator.remove() on the iterator you're looping with.",
    explanation:
      "A for-each loop uses a hidden iterator; mutating the list through nums.remove during that loop trips the modCount check and throws ConcurrentModificationException. Driving the loop with an explicit Iterator and calling it.remove() deletes the current element safely and keeps the iterator's state consistent.",
    rules: [
      { label: "Obtains an explicit iterator()", type: 'mustContain', pattern: "iterator()" },
      { label: "Deletes via it.remove()", type: 'mustContain', pattern: "it.remove()" },
      { label: "No longer uses a for-each loop over nums", type: 'mustNotContain', pattern: "for (Integer n : nums)" },
    ],
  },
  {
    id: 'java-comparing-thencomparing',
    number: 58,
    language: 'java',
    title: "Sorting Numbers as Text",
    difficulty: 'Medium',
    topic: "Comparators",
    statement:
      "sortPeople should sort a list of {name, ageAsString} pairs by age ascending. It compares p[1] as a String, so ages sort lexicographically ('10' before '9'). Parse the age to an int in the comparator.",
    functionSignature: "public static void sortPeople(List<String[]> people)",
    buggyCode:
      "public static void sortPeople(List<String[]> people) {\n    // each String[] is {name, ageAsString}; sort by age ascending\n    people.sort(Comparator.comparing(p -> p[1]));\n}",
    hint: "Comparator.comparingInt with Integer.parseInt orders by numeric value instead of string order.",
    explanation:
      "Comparator.comparing(p -> p[1]) compares the age strings, so '10' sorts before '9' because '1' < '9' character-wise. Comparator.comparingInt(p -> Integer.parseInt(p[1])) converts each age to an int first, producing a correct numeric ascending order.",
    rules: [
      { label: "Parses the age with Integer.parseInt(p[1])", type: 'mustContain', pattern: "Integer.parseInt(p[1])" },
      { label: "No longer compares the raw string p[1]", type: 'mustNotContain', pattern: "Comparator.comparing(p -> p[1])" },
      { label: "Matches the reference fix exactly", type: 'acceptedFix', pattern: "public static void sortPeople(List<String[]> people) {\n    // each String[] is {name, ageAsString}; sort by age ascending\n    people.sort(Comparator.comparingInt(p -> Integer.parseInt(p[1])));\n}" },
    ],
  },
  {
    id: 'java-equals-symmetry-getclass',
    number: 59,
    language: 'java',
    title: "equals Skips the Type Check",
    difficulty: 'Medium',
    topic: "OOP",
    statement:
      "`Point.equals` should return false when compared with null or with an object of a different type, but it casts `o` to `Point` without any type check — so `point.equals(\"hi\")` throws ClassCastException and `point.equals(null)` throws NullPointerException.",
    functionSignature: "class Point",
    buggyCode:
      "class Point {\n    final int x, y;\n\n    Point(int x, int y) { this.x = x; this.y = y; }\n\n    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true;\n        Point p = (Point) o;\n        return x == p.x && y == p.y;\n    }\n\n    @Override\n    public int hashCode() {\n        return Objects.hash(x, y);\n    }\n}",
    hint: "Before casting, reject null and objects whose runtime class differs — `o == null || getClass() != o.getClass()`.",
    explanation:
      "A correct equals must handle null (return false, never throw) and must reject foreign types instead of blindly casting. Adding `if (o == null || getClass() != o.getClass()) return false;` before the cast makes equals total and keeps it symmetric and reflexive. Using getClass() (rather than instanceof) also prevents asymmetry with subclasses.",
    rules: [
      { label: "Rejects a different runtime class before casting", type: 'mustContain', pattern: "getClass\\(\\)\\s*!=\\s*o\\.getClass\\(\\)", regex: true },
      { label: "Handles a null argument", type: 'mustContain', pattern: "o\\s*==\\s*null", regex: true },
      { label: "No unguarded cast right after the identity check", type: 'mustNotContain', pattern: "if (this == o) return true;\n        Point p = (Point) o;" },
    ],
  },
  {
    id: 'java-static-counter-instance-id',
    number: 60,
    language: 'java',
    title: "Every Instance Shares One id",
    difficulty: 'Medium',
    topic: "OOP",
    statement:
      "`Widget` should assign each new instance a unique, permanent id from a shared counter. `nextId` is correctly static (shared), but `id` was also declared static, so all widgets report whatever id was assigned last instead of their own.",
    functionSignature: "class Widget",
    buggyCode:
      "class Widget {\n    static int nextId = 0;\n    static int id;\n\n    Widget() {\n        id = nextId;\n        nextId++;\n    }\n\n    int getId() {\n        return id;\n    }\n}",
    hint: "The counter is per-class; the assigned id is per-instance. Only `nextId` should be static.",
    explanation:
      "`nextId` is genuinely class-wide state, but `id` is the identity of one particular Widget and must be an instance field. As written, `id = nextId` overwrites the single shared `id` slot on every construction, so `getId()` returns the same value for all widgets. Dropping `static` from `id` gives each instance its own copy.",
    rules: [
      { label: "id is now an instance field", type: 'mustContain', pattern: "(^|\\n)\\s*int\\s+id\\s*;", regex: true },
      { label: "id is no longer static", type: 'mustNotContain', pattern: "static int id;" },
      { label: "The counter stays static (class-wide)", type: 'mustContain', pattern: "static int nextId" },
    ],
  },
  {
    id: 'java-generic-method-bounded-max',
    number: 61,
    language: 'java',
    title: "Generic Without a Bound",
    difficulty: 'Medium',
    topic: "Generics",
    statement:
      "`max` should return the largest element of a list by calling `compareTo`, but the type parameter `<T>` is unbounded, so `item.compareTo(best)` does not compile — an arbitrary `T` has no compareTo method.",
    functionSignature: "public static <T extends Comparable<T>> T max(List<T> items)",
    buggyCode:
      "public static <T> T max(List<T> items) {\n    T best = items.get(0);\n    for (T item : items) {\n        if (item.compareTo(best) > 0) {\n            best = item;\n        }\n    }\n    return best;\n}",
    hint: "If you call compareTo on a T, the compiler must know every T is Comparable. Add a type bound.",
    explanation:
      "An unbounded `T` is treated as `Object`, which has no `compareTo`, so the method fails to compile. Bounding the type parameter with `<T extends Comparable<T>>` tells the compiler that every `T` supports `compareTo`, making the comparison legal while still keeping the method generic.",
    rules: [
      { label: "Bounds T with Comparable", type: 'mustContain', pattern: "<\\s*T\\s+extends\\s+Comparable\\s*<\\s*T\\s*>\\s*>", regex: true },
      { label: "No longer declares an unbounded <T> T max", type: 'mustNotContain', pattern: "public static <T> T max" },
      { label: "Still compares via compareTo", type: 'mustContain', pattern: "item.compareTo(best)" },
    ],
  },
  {
    id: 'java-generic-pecs-addall',
    number: 62,
    language: 'java',
    title: "Wildcards for Producer and Consumer",
    difficulty: 'Hard',
    topic: "Generics",
    statement:
      "`copyAll` should copy every element from a source list into a destination list. Callers want it to work for related types too — e.g. read from a `List<Integer>` and write into a `List<Object>` — but the rigid `List<Number>` parameters reject those calls. Apply the PECS rule so the source can be any subtype and the destination any supertype of `Number`.",
    functionSignature: "public static void copyAll(List<? super Number> dest, List<? extends Number> src)",
    buggyCode:
      "public static void copyAll(List<Number> dest, List<Number> src) {\n    for (Number n : src) {\n        dest.add(n);\n    }\n}",
    hint: "Producer Extends, Consumer Super: the source produces (`? extends Number`), the destination consumes (`? super Number`).",
    explanation:
      "Generics are invariant, so `List<Number>` will not accept a `List<Integer>` or `List<Object>` argument even though the body is type-safe. By PECS, the source only produces Numbers so it should be `List<? extends Number>`, and the destination only consumes Numbers so it should be `List<? super Number>`. This widens the set of acceptable arguments while keeping `dest.add(n)` and the read loop legal.",
    rules: [
      { label: "Destination is a super-bounded wildcard (consumer)", type: 'mustContain', pattern: "List<\\?\\s*super\\s+Number>\\s+dest", regex: true },
      { label: "Source is an extends-bounded wildcard (producer)", type: 'mustContain', pattern: "List<\\?\\s*extends\\s+Number>\\s+src", regex: true },
      { label: "No longer takes an invariant List<Number> source", type: 'mustNotContain', pattern: "List<Number> src" },
    ],
  },
  {
    id: 'java-equals-signature-override',
    number: 63,
    language: 'java',
    title: "equals That Doesn't Override",
    difficulty: 'Hard',
    topic: "OOP",
    statement:
      "`Money` overrides `hashCode` and appears to override `equals`, but its equals takes a `Money` parameter instead of `Object`. That is an overload, not an override, so collections like `HashSet` and `List.contains` — which call `equals(Object)` — never see it and treat equal Money values as distinct.",
    functionSignature: "class Money",
    buggyCode:
      "class Money {\n    final long cents;\n\n    Money(long cents) { this.cents = cents; }\n\n    public boolean equals(Money other) {\n        return other != null && this.cents == other.cents;\n    }\n\n    @Override\n    public int hashCode() {\n        return Long.hashCode(cents);\n    }\n}",
    hint: "Object.equals takes an Object. A method taking Money is a separate overload the JDK never calls — change the parameter and check the type inside.",
    explanation:
      "Collections invoke `equals(Object)` polymorphically; a method with signature `equals(Money)` is an unrelated overload that the runtime ignores, so the inherited identity-based `equals(Object)` is used instead and equal Money objects compare unequal. Changing the parameter to `Object` (with an `instanceof Money` check and a cast) makes it a true override that honors the equals/hashCode contract.",
    rules: [
      { label: "equals takes an Object parameter (real override)", type: 'mustContain', pattern: "public\\s+boolean\\s+equals\\s*\\(\\s*Object\\s+other\\s*\\)", regex: true },
      { label: "No equals overload that takes Money", type: 'mustNotContain', pattern: "public boolean equals(Money other)" },
      { label: "Checks the type with instanceof", type: 'mustContain', pattern: "instanceof\\s+Money", regex: true },
    ],
  },
  {
    id: 'java-static-method-hiding-override',
    number: 64,
    language: 'java',
    title: "static Breaks the Override",
    difficulty: 'Easy',
    topic: "OOP",
    statement:
      "`Circle` is meant to override `Shape.name()` so a `Shape` reference pointing at a `Circle` returns \"Circle\". But `Circle.name()` is declared `static`, which hides rather than overrides — polymorphic calls through a `Shape` variable still return \"Shape\".",
    functionSignature: "class Circle extends Shape",
    buggyCode:
      "class Shape {\n    String name() { return \"Shape\"; }\n}\n\nclass Circle extends Shape {\n    static String name() { return \"Circle\"; }\n}",
    hint: "Static methods are not polymorphic — they are resolved by the reference type, not the object. Remove `static` and mark it `@Override`.",
    explanation:
      "Only instance methods participate in dynamic dispatch. A `static` method in the subclass hides the superclass method rather than overriding it, so `Shape s = new Circle(); s.name();` binds statically to `Shape.name()`. Removing `static` (and adding `@Override` so the compiler verifies the override) restores polymorphic behavior.",
    rules: [
      { label: "name() is an @Override instance method", type: 'mustContain', pattern: "@Override\\s+String\\s+name\\s*\\(\\s*\\)", regex: true },
      { label: "name() is no longer static", type: 'mustNotContain', pattern: "static String name()" },
      { label: "Still returns the Circle name", type: 'mustContain', pattern: "return \"Circle\";" },
    ],
  },
  {
    id: 'java-replaceall-regex-dot',
    number: 65,
    language: 'java',
    title: 'replaceAll Eats Everything',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`stripDots` should remove every dot from a version string, so `"1.2.3"` becomes `"123"`. Instead it returns an empty string for every input.',
    functionSignature: 'public static String stripDots(String version)',
    buggyCode:
      'public static String stripDots(String version) {\n    return version.replaceAll(".", "");\n}\n',
    hint: 'replaceAll takes a regex, and in a regex `.` matches any character. Use the literal `replace`, or escape the dot.',
    explanation:
      '`String.replaceAll` interprets its first argument as a regular expression, and `.` is the regex wildcard that matches every character — so every character is replaced with nothing. `String.replace(".", "")` treats the argument as a literal CharSequence and does exactly what was intended. (Escaping the dot with `"\\\\."` or using `Pattern.quote(".")` also works.)',
    rules: [
      { label: 'Uses a literal replace or an escaped dot', type: 'mustContain', pattern: 'replace\\(\\s*"\\."\\s*,|replaceAll\\(\\s*"(\\\\\\\\\\.|\\[\\.\\])"\\s*,|Pattern\\.quote\\(', regex: true },
      { label: 'No longer passes a bare "." as a regex', type: 'mustNotContain', pattern: 'replaceAll\\(\\s*"\\."\\s*,', regex: true },
    ],
  },
  {
    id: 'java-thread-run-not-start',
    number: 66,
    language: 'java',
    title: 'Worker Runs on the Caller Thread',
    difficulty: 'Easy',
    topic: 'Concurrency basics',
    statement:
      '`runInBackground` should hand the task to a new thread and return immediately. In practice the caller blocks until the task finishes, and `Thread.currentThread()` inside the task reports the caller, not the worker.',
    functionSignature: 'public static void runInBackground(Runnable task)',
    buggyCode:
      'public static void runInBackground(Runnable task) {\n    Thread worker = new Thread(task);\n    worker.run();\n}\n',
    hint: 'Calling run() is just a normal method call on the current thread. A different method actually spawns the thread.',
    explanation:
      '`Thread.run()` is an ordinary method: it invokes the Runnable synchronously on whichever thread called it, so no new thread ever exists. `Thread.start()` is what asks the JVM to create the OS thread and schedule `run()` on it. Change `worker.run()` to `worker.start()`.',
    rules: [
      { label: 'Starts the thread with start()', type: 'mustContain', pattern: 'worker\\.start\\(\\)', regex: true },
      { label: 'No longer calls run() directly on the thread', type: 'mustNotContain', pattern: 'worker\\.run\\(\\)', regex: true },
    ],
  },
  {
    id: 'java-bigdecimal-from-double',
    number: 67,
    language: 'java',
    title: 'BigDecimal Built From a Double',
    difficulty: 'Easy',
    topic: 'Numbers',
    statement:
      '`addAmounts` should add two currency amounts exactly, so `addAmounts(0.1, 0.2)` prints `0.3`. Instead it prints `0.3000000000000000166533453693773481063544750213623046875`.',
    functionSignature: 'public static BigDecimal addAmounts(double a, double b)',
    buggyCode:
      'public static BigDecimal addAmounts(double a, double b) {\n    return new BigDecimal(a).add(new BigDecimal(b));\n}\n',
    hint: 'new BigDecimal(double) copies the binary value bit for bit — including the floating-point error. There is a factory that goes through the decimal string instead.',
    explanation:
      'The `BigDecimal(double)` constructor converts the exact binary representation of the double, so `0.1` becomes the long decimal expansion of the nearest representable float. `BigDecimal.valueOf(double)` uses `Double.toString` first, giving the short canonical decimal `0.1` that the programmer meant. (Passing a String such as `new BigDecimal("0.1")` is the other safe route.)',
    rules: [
      { label: 'Constructs via BigDecimal.valueOf or a String', type: 'mustContain', pattern: 'BigDecimal\\.valueOf\\(|new BigDecimal\\(\\s*(String\\.valueOf|Double\\.toString)\\(', regex: true },
      { label: 'No longer calls new BigDecimal(a)', type: 'mustNotContain', pattern: 'new BigDecimal\\(\\s*a\\s*\\)', regex: true },
      { label: 'No longer calls new BigDecimal(b)', type: 'mustNotContain', pattern: 'new BigDecimal\\(\\s*b\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-array-equals-identity',
    number: 68,
    language: 'java',
    title: 'Arrays Compared With equals',
    difficulty: 'Easy',
    topic: 'Equality',
    statement:
      '`sameDigits` should return true when two int arrays hold the same values in the same order. Currently `sameDigits(new int[]{1, 2}, new int[]{1, 2})` returns false.',
    functionSignature: 'public static boolean sameDigits(int[] a, int[] b)',
    buggyCode:
      'public static boolean sameDigits(int[] a, int[] b) {\n    return a.equals(b);\n}\n',
    hint: 'Arrays never override equals — it is the identity check from Object. The java.util.Arrays helper compares contents.',
    explanation:
      'Array types inherit `Object.equals`, which is reference identity, so two distinct arrays are never equal no matter their contents. Use `Arrays.equals(a, b)` for a one-dimensional element-wise comparison (`Arrays.deepEquals` for nested arrays).',
    rules: [
      { label: 'Compares contents with Arrays.equals', type: 'mustContain', pattern: 'Arrays\\.(deep)?[eE]quals\\(\\s*a\\s*,\\s*b\\s*\\)', regex: true },
      { label: 'No longer calls equals directly on the array', type: 'mustNotContain', pattern: '\\ba\\.equals\\(', regex: true },
    ],
  },
  {
    id: 'java-char-plus-int-concat',
    number: 69,
    language: 'java',
    title: 'Column Letter Prints a Number',
    difficulty: 'Easy',
    topic: 'Char arithmetic',
    statement:
      '`columnLabel` should turn an index into a spreadsheet-style label: `columnLabel(0)` is `"Column A"`, `columnLabel(2)` is `"Column C"`. Instead `columnLabel(2)` returns `"Column 67"`.',
    functionSignature: 'public static String columnLabel(int index)',
    buggyCode:
      'public static String columnLabel(int index) {\n    return "Column " + (\'A\' + index);\n}\n',
    hint: "'A' + index is an int (65 + index). Cast it back to char before concatenating.",
    explanation:
      "Adding an int to a char promotes the expression to int, so `('A' + 2)` is the number 67 and string concatenation prints it as digits. Casting the sum back — `(char) ('A' + index)` — yields the character 'C', which concatenates as a letter.",
    rules: [
      { label: 'Casts the sum back to char (or Character.toString)', type: 'mustContain', pattern: "\\(\\s*char\\s*\\)\\s*\\(?\\s*'A'\\s*\\+\\s*index|Character\\.toString\\(", regex: true },
      { label: 'No longer concatenates the raw int sum', type: 'mustNotContain', pattern: "\"\\s*\\+\\s*\\(\\s*'A'\\s*\\+\\s*index\\s*\\)", regex: true },
    ],
  },
  {
    id: 'java-interrupt-flag-swallowed',
    number: 70,
    language: 'java',
    title: 'Swallowed Interrupt',
    difficulty: 'Medium',
    topic: 'Concurrency basics',
    statement:
      '`pause` sleeps for the given number of milliseconds. When the owning thread is interrupted (for example during executor shutdown) the sleep ends early — but the thread then keeps running its loop forever, because `Thread.currentThread().isInterrupted()` is false afterwards.',
    functionSignature: 'public static void pause(long millis)',
    buggyCode:
      'public static void pause(long millis) {\n    try {\n        Thread.sleep(millis);\n    } catch (InterruptedException e) {\n        // ignore\n    }\n}\n',
    hint: 'Throwing InterruptedException clears the interrupt flag. If you catch it and cannot rethrow, set the flag back so callers still see the interrupt.',
    explanation:
      'When `Thread.sleep` throws `InterruptedException`, the JVM clears the thread\'s interrupted status. Catching the exception and doing nothing erases the request, so higher-level code that polls `isInterrupted()` never learns it should stop. The standard fix when you cannot propagate the exception is to restore the flag with `Thread.currentThread().interrupt();` inside the catch block.',
    rules: [
      { label: 'Restores the interrupt flag', type: 'mustContain', pattern: 'Thread\\.currentThread\\(\\)\\.interrupt\\(\\)', regex: true },
      { label: 'Still catches InterruptedException', type: 'mustContain', pattern: 'catch\\s*\\(\\s*InterruptedException', regex: true },
      { label: 'Still sleeps for the requested time', type: 'mustContain', pattern: 'Thread\\.sleep\\(\\s*millis\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-synchronized-string-literal',
    number: 71,
    language: 'java',
    title: 'Locking on a String Literal',
    difficulty: 'Medium',
    topic: 'Concurrency basics',
    statement:
      '`Ledger` guards its balance with `synchronized` blocks. It works alone, but once a second class elsewhere in the app also synchronizes on the literal `"ledger-lock"`, the two unrelated classes block each other and occasionally deadlock.',
    functionSignature: 'class Ledger',
    buggyCode:
      'class Ledger {\n    private long balance;\n\n    void deposit(long amount) {\n        synchronized ("ledger-lock") {\n            balance += amount;\n        }\n    }\n\n    long balance() {\n        synchronized ("ledger-lock") {\n            return balance;\n        }\n    }\n}\n',
    hint: 'String literals are interned, so every "ledger-lock" in the whole JVM is one object. Lock on something private to this class instead.',
    explanation:
      'The compiler interns string literals, so `"ledger-lock"` is a single shared object visible to any code that spells the same literal — including libraries and unrelated classes. That makes the lock global and invites contention or deadlock. Use a dedicated `private final Object lock = new Object();` (or `synchronized (this)` / synchronized methods) so the monitor belongs to this instance alone.',
    rules: [
      { label: 'Uses a private lock object or this', type: 'mustContain', pattern: 'private\\s+(static\\s+)?final\\s+Object\\s+\\w+\\s*=\\s*new\\s+Object\\(\\)|synchronized\\s*\\(\\s*this\\s*\\)|synchronized\\s+(long|void)\\s', regex: true },
      { label: 'No longer synchronizes on a string literal', type: 'mustNotContain', pattern: 'synchronized\\s*\\(\\s*"', regex: true },
    ],
  },
  {
    id: 'java-hashmap-mutable-key',
    number: 72,
    language: 'java',
    title: 'Key Mutated After Insertion',
    difficulty: 'Medium',
    topic: 'Maps',
    statement:
      '`Coord` is used as a `HashMap` key. `equals` and `hashCode` are both overridden correctly, yet after `map.put(c, "home"); c.moveTo(5, 5);` the call `map.get(c)` returns null and the entry can never be retrieved or removed again.',
    functionSignature: 'class Coord',
    buggyCode:
      'class Coord {\n    int x, y;\n\n    Coord(int x, int y) { this.x = x; this.y = y; }\n\n    void moveTo(int x, int y) { this.x = x; this.y = y; }\n\n    @Override\n    public boolean equals(Object o) {\n        if (!(o instanceof Coord)) return false;\n        Coord other = (Coord) o;\n        return x == other.x && y == other.y;\n    }\n\n    @Override\n    public int hashCode() {\n        return 31 * x + y;\n    }\n}\n',
    hint: 'A HashMap stores each entry in the bucket for its hash at insertion time. If the key\'s fields change, its hash changes, and the map looks in the wrong bucket. Make the key immutable.',
    explanation:
      '`HashMap` computes the bucket from `hashCode()` when the key is inserted. Mutating `x` or `y` afterwards changes the hash, so lookups probe a different bucket and never find the original entry — it is effectively lost. Hash keys must be immutable: make the fields `final` and drop the mutator (return a new `Coord` if you need a moved copy).',
    rules: [
      { label: 'Fields are final (immutable key)', type: 'mustContain', pattern: 'final\\s+int\\s+x\\b', regex: true },
      { label: 'No in-place mutator remains', type: 'mustNotContain', pattern: 'void\\s+moveTo\\s*\\(', regex: true },
      { label: 'Still overrides hashCode', type: 'mustContain', pattern: 'public\\s+int\\s+hashCode\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-math-abs-min-value',
    number: 73,
    language: 'java',
    title: 'abs Returns a Negative',
    difficulty: 'Medium',
    topic: 'Overflow',
    statement:
      '`distanceFromZero` should return the absolute value of an int as a long, so it can never be negative. `distanceFromZero(Integer.MIN_VALUE)` returns `-2147483648`.',
    functionSignature: 'public static long distanceFromZero(int value)',
    buggyCode:
      'public static long distanceFromZero(int value) {\n    return Math.abs(value);\n}\n',
    hint: 'Math.abs(int) returns an int, and +2147483648 does not fit in an int. Widen before taking the absolute value.',
    explanation:
      'There is no positive int counterpart to `Integer.MIN_VALUE`, so `Math.abs(int)` overflows and returns `MIN_VALUE` itself — still negative — before the result is widened to long. Widen first: `Math.abs((long) value)` computes in 64 bits where 2147483648 fits.',
    rules: [
      { label: 'Widens to long before taking the absolute value', type: 'mustContain', pattern: '\\(\\s*long\\s*\\)\\s*value|value\\s*<\\s*0', regex: true },
      { label: 'No longer calls Math.abs on the raw int', type: 'mustNotContain', pattern: 'Math\\.abs\\(\\s*value\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-tomap-duplicate-key',
    number: 74,
    language: 'java',
    title: 'toMap Chokes on Duplicates',
    difficulty: 'Medium',
    topic: 'Streams',
    statement:
      '`wordCounts` should map each word to how many times it appears. It works on a list of distinct words, but `wordCounts(List.of("a", "b", "a"))` throws `IllegalStateException: Duplicate key a`.',
    functionSignature: 'public static Map<String, Integer> wordCounts(List<String> words)',
    buggyCode:
      'public static Map<String, Integer> wordCounts(List<String> words) {\n    return words.stream()\n        .collect(Collectors.toMap(w -> w, w -> 1));\n}\n',
    hint: 'The two-argument toMap refuses duplicate keys. The three-argument overload takes a merge function that combines the two values.',
    explanation:
      '`Collectors.toMap(keyMapper, valueMapper)` throws as soon as two elements map to the same key. Supply a merge function as the third argument — `Collectors.toMap(w -> w, w -> 1, Integer::sum)` — so duplicate keys add their counts together. (`Collectors.groupingBy(w -> w, Collectors.counting())` is the idiomatic alternative, yielding Long counts.)',
    rules: [
      { label: 'Merges duplicate keys (merge function or groupingBy)', type: 'mustContain', pattern: 'Integer::sum|\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*->\\s*\\w+\\s*\\+\\s*\\w+|groupingBy\\(', regex: true },
      { label: 'No longer uses the two-argument toMap', type: 'mustNotContain', pattern: 'toMap\\(\\s*w\\s*->\\s*w\\s*,\\s*w\\s*->\\s*1\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-stream-no-terminal-op',
    number: 75,
    language: 'java',
    title: 'Pipeline That Never Runs',
    difficulty: 'Medium',
    topic: 'Streams',
    statement:
      '`longNames` should return every name longer than five characters. It always returns an empty list, even though the filter and `peek` look correct.',
    functionSignature: 'public static List<String> longNames(List<String> names)',
    buggyCode:
      'public static List<String> longNames(List<String> names) {\n    List<String> out = new ArrayList<>();\n    names.stream()\n        .filter(n -> n.length() > 5)\n        .peek(out::add);\n    return out;\n}\n',
    hint: 'filter and peek are lazy intermediate operations. Nothing flows through the pipeline until a terminal operation such as forEach or collect is called.',
    explanation:
      'Streams are lazy: intermediate operations like `filter` and `peek` only describe the pipeline, and no element is processed until a terminal operation pulls them through. With no terminal operation the `peek` side effect never fires. End the pipeline with `forEach(out::add)`, or better, return `names.stream().filter(...).collect(Collectors.toList())` directly.',
    rules: [
      { label: 'Ends the pipeline with a terminal operation', type: 'mustContain', pattern: '\\.forEach\\(|\\.collect\\(|\\.toList\\(\\)', regex: true },
      { label: 'No longer relies on peek as the last step', type: 'mustNotContain', pattern: '\\.peek\\(\\s*out::add\\s*\\)\\s*;', regex: true },
    ],
  },
  {
    id: 'java-random-seeded-per-call',
    number: 76,
    language: 'java',
    title: 'Dice That Always Roll the Same',
    difficulty: 'Medium',
    topic: 'Randomness',
    statement:
      '`rollDie` should return a random number from 1 to 6 on each call. Calling it ten times in a row returns the same value ten times.',
    functionSignature: 'public static int rollDie()',
    buggyCode:
      'public static int rollDie() {\n    Random random = new Random(42);\n    return random.nextInt(6) + 1;\n}\n',
    hint: 'A Random built with a fixed seed produces the same sequence every time. Creating a fresh one per call means you always take the first number of that identical sequence.',
    explanation:
      '`new Random(42)` is deterministic: it always yields the same sequence, and because the method builds a brand-new instance every call, it always reads the first value of that sequence. Reuse one generator across calls — a `private static final Random RANDOM = new Random();` field — or use `ThreadLocalRandom.current().nextInt(1, 7)`. A fixed seed belongs only in tests.',
    rules: [
      { label: 'Uses an unseeded or shared generator', type: 'mustContain', pattern: 'new\\s+Random\\(\\s*\\)|ThreadLocalRandom\\.current\\(\\)|SecureRandom', regex: true },
      { label: 'No longer seeds a new Random(42) inside the method', type: 'mustNotContain', pattern: 'new\\s+Random\\(\\s*42\\s*\\)', regex: true },
      { label: 'Still returns a value from nextInt', type: 'mustContain', pattern: 'nextInt\\(', regex: true },
    ],
  },
  {
    id: 'java-double-checked-locking-volatile',
    number: 77,
    language: 'java',
    title: 'Double-Checked Locking Without volatile',
    difficulty: 'Hard',
    topic: 'Concurrency basics',
    statement:
      '`Config.get()` lazily creates a singleton using double-checked locking. Under load a second thread occasionally receives a `Config` whose fields are still at their default values — it observed the reference before the constructor\'s writes became visible.',
    functionSignature: 'class Config',
    buggyCode:
      'class Config {\n    private static Config instance;\n\n    private Config() {}\n\n    static Config get() {\n        if (instance == null) {\n            synchronized (Config.class) {\n                if (instance == null) {\n                    instance = new Config();\n                }\n            }\n        }\n        return instance;\n    }\n}\n',
    hint: 'The first null check reads the field without a lock. Without volatile, the JVM may publish the reference before the object is fully constructed.',
    explanation:
      'Without `volatile`, the write `instance = new Config()` can be reordered so the reference is stored before the constructor finishes, and the unsynchronized outer `if` can observe that half-built object. Declaring the field `private static volatile Config instance;` establishes a happens-before edge: a thread that sees the non-null reference also sees every write made before it. (An eagerly initialized `static final` field or the initialization-on-demand holder idiom avoids the problem entirely.)',
    rules: [
      { label: 'Field is volatile (or eagerly final)', type: 'mustContain', pattern: 'static\\s+volatile\\s+Config\\s+\\w+|static\\s+final\\s+Config\\s+\\w+\\s*=\\s*new\\s+Config\\(\\)', regex: true },
      { label: 'No longer declares a plain non-volatile static instance', type: 'mustNotContain', pattern: 'private\\s+static\\s+Config\\s+instance\\s*;', regex: true },
      { label: 'Still exposes get()', type: 'mustContain', pattern: 'static\\s+Config\\s+get\\s*\\(\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-wait-without-loop',
    number: 78,
    language: 'java',
    title: 'wait() Guarded by an if',
    difficulty: 'Hard',
    topic: 'Concurrency basics',
    statement:
      '`MessageBox.take()` should block until a message is available and then return it. With a single consumer it works; with two consumers, one of them sometimes throws `NoSuchElementException` from `removeFirst()` right after waking up.',
    functionSignature: 'class MessageBox',
    buggyCode:
      'class MessageBox {\n    private final Deque<String> queue = new ArrayDeque<>();\n\n    synchronized void put(String msg) {\n        queue.addLast(msg);\n        notifyAll();\n    }\n\n    synchronized String take() throws InterruptedException {\n        if (queue.isEmpty()) {\n            wait();\n        }\n        return queue.removeFirst();\n    }\n}\n',
    hint: 'Waking from wait() does not guarantee the condition is now true — another thread may have taken the item first, and spurious wakeups exist. Re-check in a loop.',
    explanation:
      '`notifyAll` wakes every waiting consumer, but only one of them will find a message; the others re-acquire the monitor after the queue is empty again. Spurious wakeups can also return from `wait()` with no notify at all. The condition must be re-tested every time the thread wakes: `while (queue.isEmpty()) wait();`. This is the canonical guarded-wait idiom.',
    rules: [
      { label: 'Re-checks the condition in a while loop around wait()', type: 'mustContain', pattern: 'while\\s*\\(\\s*queue\\.isEmpty\\(\\)\\s*\\)', regex: true },
      { label: 'No longer guards wait() with a single if', type: 'mustNotContain', pattern: 'if\\s*\\(\\s*queue\\.isEmpty\\(\\)\\s*\\)', regex: true },
      { label: 'Still waits on the monitor', type: 'mustContain', pattern: '\\bwait\\(\\)', regex: true },
    ],
  },
  {
    id: 'java-default-method-diamond',
    number: 79,
    language: 'java',
    title: 'Two Defaults, One Class',
    difficulty: 'Hard',
    topic: 'OOP',
    statement:
      '`Robot` implements both `Speaker` and `Greeter`, each of which provides a default `greet()`. The class fails to compile: "class Robot inherits unrelated defaults for greet() from types Speaker and Greeter". `Robot.greet()` should use the Speaker greeting.',
    functionSignature: 'class Robot implements Speaker, Greeter',
    buggyCode:
      'interface Speaker {\n    default String greet() { return "Hello from Speaker"; }\n}\n\ninterface Greeter {\n    default String greet() { return "Hello from Greeter"; }\n}\n\nclass Robot implements Speaker, Greeter {\n}\n',
    hint: 'When two interfaces supply the same default, the class must override the method itself. Inside that override you can delegate with InterfaceName.super.method().',
    explanation:
      'Java refuses to guess which inherited default wins, so a class that inherits two unrelated defaults with the same signature must override the method explicitly. The override can pick one implementation with the `Interface.super.method()` syntax — `return Speaker.super.greet();` — or supply its own body. Adding that override to `Robot` resolves the diamond.',
    rules: [
      { label: 'Robot overrides greet()', type: 'mustContain', pattern: 'class\\s+Robot\\s+implements[\\s\\S]*?String\\s+greet\\s*\\(\\s*\\)\\s*\\{', regex: true },
      { label: 'Delegates to the chosen default via Interface.super', type: 'mustContain', pattern: 'Speaker\\.super\\.greet\\(\\)', regex: true },
      { label: 'Robot no longer has an empty body', type: 'mustNotContain', pattern: 'implements\\s+Speaker\\s*,\\s*Greeter\\s*\\{\\s*\\}', regex: true },
    ],
  },
  {
    id: 'java-reader-not-closed-on-error',
    number: 80,
    language: 'java',
    title: 'Reader Leaks on Exception',
    difficulty: 'Hard',
    topic: 'Resources',
    statement:
      '`firstLine` opens a file, returns its first line, and closes the reader. On the happy path it is fine, but whenever `readLine` throws an `IOException` the reader is never closed. After enough failures the process dies with "Too many open files".',
    functionSignature: 'public static String firstLine(String path) throws IOException',
    buggyCode:
      'public static String firstLine(String path) throws IOException {\n    BufferedReader reader = new BufferedReader(new FileReader(path));\n    String line = reader.readLine();\n    reader.close();\n    return line;\n}\n',
    hint: 'A close() that only runs when nothing throws is not a guarantee. Let try-with-resources close it for you on every exit path.',
    explanation:
      'If `readLine()` throws, control leaves the method before `reader.close()` runs and the file handle leaks. `BufferedReader` is `AutoCloseable`, so declare it in a try-with-resources header: `try (BufferedReader reader = new BufferedReader(new FileReader(path))) { return reader.readLine(); }`. The compiler inserts a close in every path — normal return or exception — and even chains suppressed exceptions correctly. (A `finally { reader.close(); }` block is the pre-Java-7 equivalent.)',
    rules: [
      { label: 'Closes the reader on every path (try-with-resources or finally)', type: 'mustContain', pattern: 'try\\s*\\(\\s*(final\\s+)?(var|BufferedReader)\\s+\\w+\\s*=|finally\\s*\\{[\\s\\S]*?\\.close\\(\\)', regex: true },
      { label: 'No longer closes only after a successful readLine', type: 'mustNotContain', pattern: 'readLine\\(\\)\\s*;\\s*reader\\.close\\(\\)\\s*;', regex: true },
      { label: 'Still reads the first line', type: 'mustContain', pattern: 'readLine\\(\\)', regex: true },
    ],
  },
  {
    id: 'java-matches-full-match',
    number: 81,
    language: 'java',
    title: 'matches Wants the Whole String',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`containsDigit` should return true when the string has at least one digit anywhere in it. `containsDigit("abc1")` currently returns false, and only the single-character string "7" returns true.',
    functionSignature: 'public static boolean containsDigit(String s)',
    buggyCode:
      'public static boolean containsDigit(String s) {\n    return s.matches("\\\\d");\n}\n',
    hint: 'String.matches() succeeds only if the regex matches the ENTIRE string. Either anchor the pattern with .* on both sides or use a Matcher and find().',
    explanation:
      '`String.matches(regex)` is a full-match test — the whole input must be consumed by the pattern, so `"\\\\d"` only matches a one-character string that is a digit. To test for a digit anywhere, wrap the pattern: `s.matches(".*\\\\d.*")`, or use `Pattern.compile("\\\\d").matcher(s).find()`, or skip regex entirely with `s.chars().anyMatch(Character::isDigit)`.',
    rules: [
      { label: 'Searches anywhere in the string (.* anchors, find(), or anyMatch)', type: 'mustContain', pattern: 'matches\\("\\.\\*|\\.find\\(\\)|anyMatch\\(', regex: true },
      { label: 'No longer full-matches a single digit', type: 'mustNotContain', pattern: 's.matches("\\\\d")' },
    ],
  },
  {
    id: 'java-parseint-whitespace',
    number: 82,
    language: 'java',
    title: 'parseInt Trips on Whitespace',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`parseAge` converts a value read from a form field into an int. Users often leave a space around the number, and `parseAge(" 42 ")` throws `NumberFormatException: For input string: " 42 "` even though the digits are fine.',
    functionSignature: 'public static int parseAge(String raw)',
    buggyCode:
      'public static int parseAge(String raw) {\n    return Integer.parseInt(raw);\n}\n',
    hint: 'Integer.parseInt does not skip surrounding whitespace. Strip it before parsing.',
    explanation:
      'Unlike some languages, `Integer.parseInt` is strict: any character that is not a digit (or a leading sign) makes it throw, including spaces. Trim the input first — `Integer.parseInt(raw.trim())` — or use `strip()` on Java 11+, which also handles Unicode whitespace.',
    rules: [
      { label: 'Trims or strips the input before parsing', type: 'mustContain', pattern: '\\.(trim|strip)\\(\\)', regex: true },
      { label: 'No longer parses the raw string directly', type: 'mustNotContain', pattern: 'parseInt\\(\\s*raw\\s*\\)', regex: true },
      { label: 'Still uses Integer.parseInt', type: 'mustContain', pattern: 'Integer.parseInt(' },
    ],
  },
  {
    id: 'java-isletter-vs-isletterordigit',
    number: 83,
    language: 'java',
    title: 'Digits Rejected as Letters',
    difficulty: 'Easy',
    topic: 'Strings',
    statement:
      '`isValidUsername` should accept a non-empty string made only of letters and digits. `isValidUsername("user42")` returns false because the check rejects every digit.',
    functionSignature: 'public static boolean isValidUsername(String name)',
    buggyCode:
      'public static boolean isValidUsername(String name) {\n    if (name.isEmpty()) return false;\n    for (char c : name.toCharArray()) {\n        if (!Character.isLetter(c)) return false;\n    }\n    return true;\n}\n',
    hint: 'Character.isLetter is only letters. There is a sibling method that also accepts digits.',
    explanation:
      '`Character.isLetter(c)` returns false for `\'0\'`–`\'9\'`, so any username with a digit fails. `Character.isLetterOrDigit(c)` is the check the spec describes. (Combining `isLetter(c) || isDigit(c)` is equivalent.)',
    rules: [
      { label: 'Accepts digits as well as letters', type: 'mustContain', pattern: 'isLetterOrDigit|isLetter\\(\\s*c\\s*\\)\\s*\\|\\|\\s*Character\\.isDigit', regex: true },
      { label: 'No longer rejects on isLetter alone', type: 'mustNotContain', pattern: '!\\s*Character\\.isLetter\\(\\s*c\\s*\\)\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-list-of-immutable',
    number: 84,
    language: 'java',
    title: "List.of Can't Grow",
    difficulty: 'Easy',
    topic: 'Collections',
    statement:
      '`withHeader` should return a new list containing "HEADER" followed by every element of `rows`. It throws `UnsupportedOperationException` on the `addAll` line.',
    functionSignature: 'public static List<String> withHeader(List<String> rows)',
    buggyCode:
      'public static List<String> withHeader(List<String> rows) {\n    List<String> out = List.of("HEADER");\n    out.addAll(rows);\n    return out;\n}\n',
    hint: 'List.of(...) builds an immutable list. Start from a mutable ArrayList instead.',
    explanation:
      'The lists returned by `List.of` (and `List.copyOf`, `Map.of`, …) are unmodifiable: every mutator throws `UnsupportedOperationException`. Build a mutable list — `new ArrayList<>(List.of("HEADER"))` or `new ArrayList<>()` plus `out.add("HEADER")` — and then `addAll` works.',
    rules: [
      { label: 'Builds a mutable list (new ArrayList / LinkedList)', type: 'mustContain', pattern: 'new\\s+(ArrayList|LinkedList)', regex: true },
      { label: 'No longer assigns an immutable List.of to out', type: 'mustNotContain', pattern: '=\\s*List\\.of\\("HEADER"\\)\\s*;', regex: true },
      { label: 'Still appends every row', type: 'mustContain', pattern: 'addAll\\(\\s*rows\\s*\\)|for\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-stringbuilder-equals',
    number: 85,
    language: 'java',
    title: 'StringBuilder equals Is Identity',
    difficulty: 'Easy',
    topic: 'Equality',
    statement:
      '`sameText` should return true when two StringBuilders hold the same characters. It returns false for two separately built "abc" builders and only true when both arguments are the very same object.',
    functionSignature: 'public static boolean sameText(StringBuilder a, StringBuilder b)',
    buggyCode:
      'public static boolean sameText(StringBuilder a, StringBuilder b) {\n    return a.equals(b);\n}\n',
    hint: 'StringBuilder never overrides equals — it is Object.equals, i.e. reference identity. Compare the text.',
    explanation:
      '`StringBuilder` does not override `equals`/`hashCode`, so `a.equals(b)` is `a == b`. Compare contents instead: `a.toString().equals(b.toString())`, or `a.toString().contentEquals(b)`, or on Java 11+ `a.compareTo(b) == 0`.',
    rules: [
      { label: 'Compares the character contents', type: 'mustContain', pattern: 'toString\\(\\)\\.equals\\(|contentEquals\\(|compareTo\\(\\s*b\\s*\\)\\s*==\\s*0', regex: true },
      { label: 'No longer calls equals on the builder itself', type: 'mustNotContain', pattern: '\\ba\\.equals\\(\\s*b\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-iterator-next-empty',
    number: 86,
    language: 'java',
    title: 'next() Without hasNext()',
    difficulty: 'Easy',
    topic: 'Iteration',
    statement:
      '`firstOrNull` should return the first element of the collection, or null when it is empty. Passing an empty collection currently throws `NoSuchElementException`.',
    functionSignature: 'public static String firstOrNull(Collection<String> items)',
    buggyCode:
      'public static String firstOrNull(Collection<String> items) {\n    Iterator<String> it = items.iterator();\n    return it.next();\n}\n',
    hint: 'next() throws when nothing is left. Ask hasNext() first.',
    explanation:
      '`Iterator.next()` throws `NoSuchElementException` when the iteration is exhausted — which is immediately, for an empty collection. Guard it: `return it.hasNext() ? it.next() : null;`. Checking `items.isEmpty()` up front works too.',
    rules: [
      { label: 'Checks for an element before calling next()', type: 'mustContain', pattern: 'hasNext\\(\\)|isEmpty\\(\\)', regex: true },
      { label: 'No longer calls next() blindly right after iterator()', type: 'mustNotContain', pattern: 'iterator\\(\\)\\s*;\\s*return\\s+it\\.next\\(\\)', regex: true },
    ],
  },
  {
    id: 'java-round-two-decimals-int-div',
    number: 87,
    language: 'java',
    title: 'Rounding Drops the Decimals',
    difficulty: 'Medium',
    topic: 'Arithmetic',
    statement:
      '`roundTo2` should round a double to two decimal places: `roundTo2(3.14159)` should be `3.14`. It returns `3.0`, and `roundTo2(0.99)` returns `0.0`.',
    functionSignature: 'public static double roundTo2(double x)',
    buggyCode:
      'public static double roundTo2(double x) {\n    return Math.round(x * 100) / 100;\n}\n',
    hint: 'Math.round(double) returns a long. What happens when a long is divided by the int literal 100?',
    explanation:
      '`Math.round(x * 100)` returns a `long` (314). Dividing a long by the int literal `100` is integer division, giving `3`, which is only widened to `3.0` at the return. Divide by a floating-point value instead: `Math.round(x * 100) / 100.0`.',
    rules: [
      { label: 'Divides by a floating-point value (100.0 or a double cast)', type: 'mustContain', pattern: '/\\s*100(\\.0+|[dD])\\b|\\(double\\)', regex: true },
      { label: 'No longer does integer division by 100', type: 'mustNotContain', pattern: 'round\\([^;]*\\)\\s*/\\s*100\\s*;', regex: true },
      { label: 'Still rounds with Math.round', type: 'mustContain', pattern: 'Math.round(' },
    ],
  },
  {
    id: 'java-hashset-of-arrays',
    number: 88,
    language: 'java',
    title: 'Set of Arrays Never Dedupes',
    difficulty: 'Medium',
    topic: 'Collections',
    statement:
      '`countDistinctPairs` receives an array of two-element `int[]` pairs and should return how many distinct pairs there are. `{{1,2},{1,2},{3,4}}` should give 2, but the function returns 3 — every pair is treated as unique.',
    functionSignature: 'public static int countDistinctPairs(int[][] pairs)',
    buggyCode:
      'public static int countDistinctPairs(int[][] pairs) {\n    Set<int[]> seen = new HashSet<>();\n    for (int[] p : pairs) {\n        seen.add(p);\n    }\n    return seen.size();\n}\n',
    hint: 'Arrays use identity equals/hashCode, so a HashSet<int[]> compares references. Store something with value semantics — a List<Integer> or a String key.',
    explanation:
      'Java arrays inherit `Object.equals` and `Object.hashCode`, so two `int[]` with identical contents are different keys in a `HashSet`. Convert each pair to a value type before inserting: `Set<List<Integer>>` with `List.of(p[0], p[1])`, or `Set<String>` with `Arrays.toString(p)`. Both compare by content.',
    rules: [
      { label: 'No longer keys the set on raw int[] arrays', type: 'mustNotContain', pattern: 'Set\\s*<\\s*int\\s*\\[\\s*\\]\\s*>', regex: true },
      { label: 'Keys the set on a value type (List<Integer> or String)', type: 'mustContain', pattern: 'Set\\s*<\\s*(List\\s*<\\s*Integer\\s*>|String)\\s*>', regex: true },
      { label: 'Still returns the set size', type: 'mustContain', pattern: 'seen.size()' },
    ],
  },
  {
    id: 'java-aslist-primitive-array',
    number: 89,
    language: 'java',
    title: 'asList Wraps the Whole Array',
    difficulty: 'Medium',
    topic: 'Collections',
    statement:
      '`containsValue` should report whether `target` appears in the int array. `containsValue(new int[]{1, 5, 9}, 5)` returns false — in fact it returns false for every input.',
    functionSignature: 'public static boolean containsValue(int[] nums, int target)',
    buggyCode:
      'public static boolean containsValue(int[] nums, int target) {\n    return Arrays.asList(nums).contains(target);\n}\n',
    hint: 'Generics cannot hold primitives. Arrays.asList(int[]) produces a List<int[]> with ONE element: the array itself.',
    explanation:
      '`Arrays.asList(T... a)` needs reference types. Given an `int[]`, `T` becomes `int[]`, so the result is a single-element `List<int[]>` — and `contains(5)` compares an `Integer` against the array, never matching. Use `Arrays.stream(nums).anyMatch(n -> n == target)` or a plain loop. (An `Integer[]` would have worked with asList.)',
    rules: [
      { label: 'No longer calls Arrays.asList on the primitive array', type: 'mustNotContain', pattern: 'Arrays\\.asList\\(\\s*nums\\s*\\)', regex: true },
      { label: 'Searches the elements (stream anyMatch, loop, or Integer[])', type: 'mustContain', pattern: 'anyMatch\\(|for\\s*\\(|Integer\\[\\]|IntStream', regex: true },
    ],
  },
  {
    id: 'java-optional-orelse-eager',
    number: 90,
    language: 'java',
    title: 'orElse Runs the Fallback Every Time',
    difficulty: 'Medium',
    topic: 'Optional',
    statement:
      '`Config.get` returns the stored value for a key, falling back to `loadDefault` (an expensive call that also bumps `fallbackLoads`) only when the key is missing. Tests show `fallbackLoads` increments even when the key IS present.',
    functionSignature: 'class Config',
    buggyCode:
      'class Config {\n    private final Map<String, String> values = new HashMap<>();\n    private int fallbackLoads = 0;\n\n    void set(String key, String value) { values.put(key, value); }\n\n    String get(String key) {\n        return Optional.ofNullable(values.get(key)).orElse(loadDefault(key));\n    }\n\n    private String loadDefault(String key) {\n        fallbackLoads++;\n        return "default-" + key;\n    }\n\n    int fallbackLoads() { return fallbackLoads; }\n}\n',
    hint: 'orElse takes a VALUE, so its argument is evaluated before orElse is even called. orElseGet takes a Supplier.',
    explanation:
      'Java evaluates method arguments eagerly: `loadDefault(key)` runs to produce the argument for `orElse`, whether or not the Optional is empty. `orElseGet(() -> loadDefault(key))` (or `orElseGet(this::loadDefault)` with a bound key) passes a Supplier that is only invoked when the value is absent.',
    rules: [
      { label: 'Uses orElseGet with a lazy supplier', type: 'mustContain', pattern: 'orElseGet\\s*\\(', regex: true },
      { label: 'No longer passes loadDefault(...) eagerly to orElse', type: 'mustNotContain', pattern: 'orElse\\s*\\(\\s*loadDefault', regex: true },
      { label: 'Still falls back to loadDefault', type: 'mustContain', pattern: 'loadDefault\\s*\\(\\s*key\\s*\\)|::loadDefault', regex: true },
    ],
  },
  {
    id: 'java-groupingby-null-key',
    number: 91,
    language: 'java',
    title: 'groupingBy Chokes on null',
    difficulty: 'Medium',
    topic: 'Streams',
    statement:
      '`Catalog.byCategory` groups items by their category. Items without a category (`category == null`) should land in an "uncategorized" bucket, but as soon as one appears the method throws `NullPointerException: element cannot be mapped to a null key`.',
    functionSignature: 'static Map<String, List<Item>> byCategory(List<Item> items)',
    buggyCode:
      'class Item {\n    final String name;\n    final String category;\n\n    Item(String name, String category) {\n        this.name = name;\n        this.category = category;\n    }\n}\n\nclass Catalog {\n    static Map<String, List<Item>> byCategory(List<Item> items) {\n        return items.stream()\n            .collect(Collectors.groupingBy(i -> i.category));\n    }\n}\n',
    hint: 'groupingBy forbids null keys. Map a null category to a placeholder string inside the classifier.',
    explanation:
      '`Collectors.groupingBy` calls `Objects.requireNonNull` on every classifier result, so a null category is fatal. Substitute a real key in the classifier: `i -> i.category == null ? "uncategorized" : i.category`, or `Objects.requireNonNullElse(i.category, "uncategorized")`. Filtering nulls out would silently lose items, which the spec forbids.',
    rules: [
      { label: 'Handles a null category in the classifier', type: 'mustContain', pattern: '==\\s*null|!=\\s*null|requireNonNullElse|ofNullable|Objects\\.isNull|Objects\\.nonNull', regex: true },
      { label: 'Maps missing categories to "uncategorized"', type: 'mustContain', pattern: '"uncategorized"' },
      { label: 'No longer classifies on the raw (possibly null) category', type: 'mustNotContain', pattern: 'groupingBy\\(\\s*\\w+\\s*->\\s*\\w+\\.category\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-map-get-put-race',
    number: 92,
    language: 'java',
    title: 'Get-Then-Put Loses Counts',
    difficulty: 'Medium',
    topic: 'Concurrency basics',
    statement:
      '`WordCounter.record` is called from many threads. The map is a `ConcurrentHashMap`, yet after 10 threads each record "hello" 1,000 times, `count("hello")` comes back well under 10,000.',
    functionSignature: 'class WordCounter',
    buggyCode:
      'class WordCounter {\n    private final ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();\n\n    void record(String word) {\n        Integer current = counts.get(word);\n        counts.put(word, current == null ? 1 : current + 1);\n    }\n\n    int count(String word) {\n        return counts.getOrDefault(word, 0);\n    }\n}\n',
    hint: 'Each individual get and put is thread-safe, but the pair is not atomic. ConcurrentHashMap has atomic compound operations.',
    explanation:
      'Two threads can both `get` the same current value, both compute `current + 1`, and both `put` it — one increment is lost. A thread-safe map only makes each call atomic, not a read-modify-write sequence. Use the atomic compound method: `counts.merge(word, 1, Integer::sum)` (or `compute`, or store `AtomicInteger`/`LongAdder` values via `computeIfAbsent`).',
    rules: [
      { label: 'Uses an atomic compound update (merge / compute / computeIfAbsent / AtomicInteger)', type: 'mustContain', pattern: '\\.merge\\s*\\(|\\.compute\\s*\\(|\\.computeIfAbsent\\s*\\(|AtomicInteger|LongAdder', regex: true },
      { label: 'No longer puts a value computed from a separate get', type: 'mustNotContain', pattern: 'counts\\.put\\s*\\(\\s*word\\s*,\\s*current', regex: true },
      { label: 'Still uses a ConcurrentHashMap', type: 'mustContain', pattern: 'ConcurrentHashMap' },
    ],
  },
  {
    id: 'java-remove-by-index-shift',
    number: 93,
    language: 'java',
    title: 'Removing by Index Skips a Neighbor',
    difficulty: 'Medium',
    topic: 'Iteration',
    statement:
      '`dropNegatives` removes every negative number from the list in place. It does not throw, but `[-1, -2, 3]` ends up as `[-2, 3]` — whenever two negatives are adjacent, the second one survives.',
    functionSignature: 'public static void dropNegatives(List<Integer> nums)',
    buggyCode:
      'public static void dropNegatives(List<Integer> nums) {\n    for (int i = 0; i < nums.size(); i++) {\n        if (nums.get(i) < 0) {\n            nums.remove(i);\n        }\n    }\n}\n',
    hint: 'After remove(i), the element that was at i+1 slides down to i — and then i++ jumps over it.',
    explanation:
      'Removing index `i` shifts every later element left by one, so the next candidate now sits at index `i`, but the loop increments to `i + 1` and never examines it. Fixes: `nums.removeIf(n -> n < 0)`, decrement `i--` after a removal, or iterate from the end backwards. (Iterator.remove() also works.)',
    rules: [
      { label: 'Compensates for the shift (removeIf, i--, backwards loop, or Iterator)', type: 'mustContain', pattern: 'removeIf\\s*\\(|i--|i\\s*-=\\s*1|i\\s*>=\\s*0|Iterator', regex: true },
      { label: 'No longer removes at i and then steps straight to i+1', type: 'mustNotContain', pattern: 'i\\+\\+\\s*\\)[\\s\\S]*?nums\\.remove\\(\\s*i\\s*\\)\\s*;\\s*\\}', regex: true },
    ],
  },
  {
    id: 'java-rethrow-loses-cause',
    number: 94,
    language: 'java',
    title: 'Rethrow Loses the Cause',
    difficulty: 'Medium',
    topic: 'Exceptions',
    statement:
      '`readConfig` wraps any I/O failure in an `IllegalStateException` so callers get an unchecked error. When it fires in production, the stack trace says only "Could not read config" — no `IOException`, no message about permissions or a missing file, nothing to debug with.',
    functionSignature: 'public static String readConfig(Path path)',
    buggyCode:
      'public static String readConfig(Path path) {\n    try {\n        return Files.readString(path);\n    } catch (IOException e) {\n        throw new IllegalStateException("Could not read config: " + path);\n    }\n}\n',
    hint: 'Exceptions can carry a cause. Pass the original exception into the new one so its stack trace is chained.',
    explanation:
      'Constructing a new exception without the original throws away the underlying `IOException` and its stack trace. Pass it as the cause — `new IllegalStateException("Could not read config: " + path, e)` — and the trace prints "Caused by: java.io.IOException …", which is what makes the failure diagnosable.',
    rules: [
      { label: 'Chains the original exception as the cause', type: 'mustContain', pattern: 'new\\s+\\w*Exception\\s*\\([^;]*,\\s*e\\s*\\)|initCause\\s*\\(\\s*e\\s*\\)|new\\s+\\w*Exception\\s*\\(\\s*e\\s*\\)', regex: true },
      { label: 'No longer throws with just the message', type: 'mustNotContain', pattern: '\\+\\s*path\\s*\\)\\s*;', regex: true },
      { label: 'Still catches IOException', type: 'mustContain', pattern: 'catch\\s*\\(\\s*IOException\\s+e\\s*\\)', regex: true },
    ],
  },
  {
    id: 'java-2d-array-shallow-clone',
    number: 95,
    language: 'java',
    title: 'clone Shares the Rows',
    difficulty: 'Medium',
    topic: 'Arrays',
    statement:
      '`copyGrid` should return an independent copy of a 2D int array. After `int[][] copy = copyGrid(grid); copy[0][0] = 99;` the original `grid[0][0]` is also 99.',
    functionSignature: 'public static int[][] copyGrid(int[][] grid)',
    buggyCode:
      'public static int[][] copyGrid(int[][] grid) {\n    return grid.clone();\n}\n',
    hint: 'clone() on an array is shallow: you get a new outer array whose slots point at the SAME row arrays.',
    explanation:
      'A 2D array is an array of row references. `grid.clone()` copies only the outer array, so both copies share every row. Copy each row too: allocate `new int[grid.length][]` and set `copy[i] = grid[i].clone()` (or `Arrays.copyOf(grid[i], grid[i].length)`) in a loop.',
    rules: [
      { label: 'Copies each row individually', type: 'mustContain', pattern: 'grid\\[i\\]\\.clone\\(\\)|Arrays\\.copyOf\\(\\s*grid\\[i\\]|\\[i\\]\\[j\\]|Arrays\\.stream\\(\\s*grid\\s*\\)', regex: true },
      { label: 'No longer returns a shallow clone of the outer array', type: 'mustNotContain', pattern: 'return\\s+grid\\.clone\\(\\)\\s*;', regex: true },
      { label: 'Iterates over the rows', type: 'mustContain', pattern: 'for\\s*\\(|\\.map\\s*\\(', regex: true },
    ],
  },
  {
    id: 'java-lru-no-remove-eldest',
    number: 96,
    language: 'java',
    title: 'LRU Cache That Never Evicts',
    difficulty: 'Hard',
    topic: 'Maps',
    statement:
      '`LruCache` is meant to hold at most `capacity` entries, evicting the least-recently-used one when a new key is added. The map is already in access order, but after inserting 1,000 distinct keys into a capacity-3 cache, `size()` reports 1,000.',
    functionSignature: 'class LruCache<K, V>',
    buggyCode:
      'class LruCache<K, V> {\n    private final int capacity;\n    private final Map<K, V> map;\n\n    LruCache(int capacity) {\n        this.capacity = capacity;\n        this.map = new LinkedHashMap<>(16, 0.75f, true);\n    }\n\n    V get(K key) { return map.get(key); }\n\n    void put(K key, V value) { map.put(key, value); }\n\n    int size() { return map.size(); }\n}\n',
    hint: 'Access order only controls iteration order. Eviction is opt-in: LinkedHashMap has a protected hook you override to say when the eldest entry should go.',
    explanation:
      'The `accessOrder = true` constructor makes `LinkedHashMap` move touched entries to the tail, but nothing is ever removed. Eviction is provided by the `removeEldestEntry(Map.Entry)` hook, which is called after every insertion and defaults to `false`. Subclass anonymously and return `size() > capacity` from it — the map then drops its head (the least recently used entry) automatically.',
    rules: [
      { label: 'Overrides removeEldestEntry (or trims manually after put)', type: 'mustContain', pattern: 'removeEldestEntry\\s*\\(|size\\(\\)\\s*>\\s*capacity', regex: true },
      { label: 'Evicts once the size exceeds capacity', type: 'mustContain', pattern: '>\\s*capacity', regex: true },
      { label: 'Keeps the map in access order', type: 'mustContain', pattern: '0\\.75f\\s*,\\s*true', regex: true },
    ],
  },
  {
    id: 'java-compareto-drops-equal-keys',
    number: 97,
    language: 'java',
    title: 'TreeSet Drops Same-Age People',
    difficulty: 'Hard',
    topic: 'Comparators',
    statement:
      '`Person` implements `Comparable` so people can be kept sorted by age in a `TreeSet`. Adding `new Person("Ann", 30)` and `new Person("Bob", 30)` leaves the set with size 1 — Bob vanishes — even though `equals` says they are different.',
    functionSignature: 'class Person implements Comparable<Person>',
    buggyCode:
      'class Person implements Comparable<Person> {\n    final String name;\n    final int age;\n\n    Person(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n\n    @Override\n    public int compareTo(Person other) {\n        return Integer.compare(age, other.age);\n    }\n\n    @Override\n    public boolean equals(Object o) {\n        if (!(o instanceof Person)) return false;\n        Person p = (Person) o;\n        return age == p.age && name.equals(p.name);\n    }\n\n    @Override\n    public int hashCode() { return Objects.hash(name, age); }\n}\n',
    hint: 'TreeSet uses compareTo, not equals, to decide whether two elements are "the same". Break ties on the remaining field.',
    explanation:
      'Sorted collections never call `equals`; they treat `compareTo(...) == 0` as "duplicate". Because `compareTo` looks only at age, two different 30-year-olds are indistinguishable and the second is rejected. Make the ordering consistent with `equals` by tie-breaking on name: `int c = Integer.compare(age, other.age); return c != 0 ? c : name.compareTo(other.name);`.',
    rules: [
      { label: 'Tie-breaks on name when ages are equal', type: 'mustContain', pattern: 'name\\.compareTo\\(|thenComparing', regex: true },
      { label: 'No longer returns the age comparison alone', type: 'mustNotContain', pattern: 'return\\s+Integer\\.compare\\(\\s*age\\s*,\\s*other\\.age\\s*\\)\\s*;', regex: true },
      { label: 'Still compares by age first', type: 'mustContain', pattern: 'Integer\\.compare\\(\\s*age|comparingInt', regex: true },
    ],
  },
  {
    id: 'java-sublist-parent-modified',
    number: 98,
    language: 'java',
    title: 'subList View Goes Stale',
    difficulty: 'Hard',
    topic: 'Collections',
    statement:
      '`RecentLog.markBatch()` remembers the last three entries so `lastBatch()` can return them later. It works until another `add()` happens after `markBatch()`; then `lastBatch()` throws `ConcurrentModificationException`.',
    functionSignature: 'class RecentLog',
    buggyCode:
      'class RecentLog {\n    private final List<String> entries = new ArrayList<>();\n    private List<String> lastBatch = new ArrayList<>();\n\n    void add(String entry) {\n        entries.add(entry);\n    }\n\n    void markBatch() {\n        lastBatch = entries.subList(Math.max(0, entries.size() - 3), entries.size());\n    }\n\n    List<String> lastBatch() {\n        return new ArrayList<>(lastBatch);\n    }\n}\n',
    hint: 'subList returns a live VIEW backed by the parent list. Structurally modifying the parent invalidates the view. Copy it if you need to keep it.',
    explanation:
      '`List.subList` does not copy: it is a window onto the same backing list, and any structural change to the parent (like `add`) makes the view throw `ConcurrentModificationException` on its next use. When the range must survive later modifications, snapshot it: `lastBatch = new ArrayList<>(entries.subList(...))` (or `List.copyOf(...)`).',
    rules: [
      { label: 'Copies the sub-range into an independent list', type: 'mustContain', pattern: '(new\\s+ArrayList<[^>]*>|List\\.copyOf)\\s*\\(\\s*entries\\.subList|\\.collect\\s*\\(', regex: true },
      { label: 'No longer stores the live subList view', type: 'mustNotContain', pattern: 'lastBatch\\s*=\\s*entries\\.subList', regex: true },
      { label: 'Still takes the last three entries', type: 'mustContain', pattern: 'entries\\.size\\(\\)\\s*-\\s*3', regex: true },
    ],
  },
  {
    id: 'java-parallel-foreach-external-list',
    number: 99,
    language: 'java',
    title: 'Parallel forEach Into a Shared List',
    difficulty: 'Hard',
    topic: 'Streams',
    statement:
      '`squares` should return the squares of the input in the same order. On large inputs it sometimes returns fewer elements than it was given, occasionally throws `ArrayIndexOutOfBoundsException` from inside `ArrayList.add`, and the order is scrambled.',
    functionSignature: 'public static List<Integer> squares(List<Integer> nums)',
    buggyCode:
      'public static List<Integer> squares(List<Integer> nums) {\n    List<Integer> out = new ArrayList<>();\n    nums.parallelStream().forEach(n -> out.add(n * n));\n    return out;\n}\n',
    hint: 'forEach with a side effect on an unsynchronized list is a data race under a parallel stream. Let the stream build the result with map + collect.',
    explanation:
      'A parallel stream runs the `forEach` action on several threads at once, and `ArrayList.add` is not thread-safe — concurrent adds corrupt the internal size/array (lost elements, AIOOBE) and arrive in nondeterministic order. Streams are meant to be side-effect free: `nums.stream().map(n -> n * n).collect(Collectors.toList())` is correct, ordered, and safe even with `parallelStream()`.',
    rules: [
      { label: 'Builds the result with collect / toList', type: 'mustContain', pattern: '\\.collect\\s*\\(|\\.toList\\(\\)', regex: true },
      { label: 'Transforms with map', type: 'mustContain', pattern: '\\.map\\s*\\(', regex: true },
      { label: 'No longer adds to an external list from forEach', type: 'mustNotContain', pattern: 'forEach\\s*\\(\\s*\\w+\\s*->\\s*out\\.add', regex: true },
    ],
  },
  {
    id: 'java-constructor-calls-overridable',
    number: 100,
    language: 'java',
    title: 'Overridden Method Runs Before the Subclass Exists',
    difficulty: 'Hard',
    topic: 'OOP',
    statement:
      '`Widget` calls `init()` from its constructor so subclasses can hook in. `Button` overrides `init()` to register a listener, but `new Button()` throws `NullPointerException` at `listeners.add("click")` — even though `listeners` is initialised inline.',
    functionSignature: 'class Button extends Widget',
    buggyCode:
      'class Widget {\n    Widget() {\n        init();\n    }\n\n    void init() {}\n}\n\nclass Button extends Widget {\n    private final List<String> listeners = new ArrayList<>();\n\n    @Override\n    void init() {\n        listeners.add("click");\n    }\n\n    int listenerCount() { return listeners.size(); }\n}\n',
    hint: 'Field initialisers of a subclass run AFTER the superclass constructor returns. A virtual call from that constructor lands in the subclass before its fields exist.',
    explanation:
      'Construction order is: `Widget()` body first, then `Button`\'s field initialisers, then `Button()`\'s body. Because `init()` is virtual, `Widget()` dispatches to `Button.init()` while `listeners` is still null. Never call overridable methods from a constructor: drop the call from `Widget()` and have `Button()` call `init()` itself once its fields are ready (or make `init` final / private).',
    rules: [
      { label: 'Widget constructor no longer calls the overridable init()', type: 'mustNotContain', pattern: 'Widget\\s*\\(\\s*\\)\\s*\\{\\s*init\\s*\\(\\s*\\)\\s*;', regex: true },
      { label: 'Button registers its listener from its own constructor', type: 'mustContain', pattern: 'Button\\s*\\(\\s*\\)\\s*\\{[^}]*?(init\\s*\\(\\s*\\)|listeners\\.add)', regex: true },
      { label: 'Still registers the "click" listener', type: 'mustContain', pattern: 'listeners.add("click")' },
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
