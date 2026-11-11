import type { Blind75Problem } from '../blind75';

const STARTER_HEADER = '# Write your solution below. Do not rename the function.\n';

export const problems: Blind75Problem[] = [
  {
    id: "sticky-keyboard-check",
    number: 523,
    title: "Sticky Keyboard Check",
    difficulty: "Easy",
    topic: "String",
    statement:
      "Your friend typed their `name` on a keyboard whose keys sometimes stick: when a key is pressed, its character may be entered one or more times in a row instead of exactly once. Keys are never skipped, never pressed in a different order, and no other keys are hit.\n\nGiven the intended `name` and the text `typed` that actually appeared, return `True` if `typed` could have been produced by typing `name` on that keyboard, otherwise `False`.\n\nBoth strings are non-empty and contain only lowercase letters.",
    explanation:
      "Walk both strings with two pointers: `i` in `name` and `j` in `typed`.\n\nFor each typed character there are only two legal explanations. Either it is the next character of the name (`typed[j] == name[i]`, advance both), or it is a stuck repeat of the key just pressed (`typed[j] == typed[j-1]`, advance only `j`). Anything else is a stray character, so answer `False`. At the end every character of `name` must have been consumed.\n\nCheck 'next character of the name' first; when both explanations fit, consuming the name character is never worse because later repeats can still be absorbed.\n\nComparing the sets of letters, or the strings with repeats collapsed, is not enough: `name = 'aab'` needs at least two `a`s, so `'ab'` must be rejected.\n\nTime O(len(name) + len(typed)), space O(1).",
    functionName: "is_long_pressed",
    functionSignature: "def is_long_pressed(name: str, typed: str) -> bool:",
    starter:
      STARTER_HEADER +
      "def is_long_pressed(name: str, typed: str) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["alex", "aaleex"], expected: true },
      { input: ["saeed", "ssaaedd"], expected: false },
      { input: ["leelee", "lleeelee"], expected: true },
    ],
    hiddenTests: [
      { input: ["aab", "ab"], expected: false },
      { input: ["ab", "abb"], expected: true },
      { input: ["abc", "abcd"], expected: false },
      { input: ["abc", "aabb"], expected: false },
      { input: ["a", "b"], expected: false },
      { input: ["pop", "ppoopp"], expected: true },
    ],
  },
  {
    id: "rotated-spelling",
    number: 524,
    title: "Rotated Spelling",
    difficulty: "Easy",
    topic: "String",
    statement:
      "A **rotation** of a string is made by taking some number of characters (possibly zero) off its front and putting them, in the same order, on its end. For example the rotations of `'abc'` are `'abc'`, `'bca'` and `'cab'`.\n\nGiven two strings `s` and `t`, return `True` if `t` is a rotation of `s`, otherwise `False`. Two empty strings are rotations of each other.",
    explanation:
      "Every rotation of `s` appears as a block inside `s + s`: cutting `s` at position `k` gives `s[k:] + s[:k]`, and that is exactly the slice of the doubled string starting at `k`.\n\nSo the whole test is: the lengths are equal **and** `t` occurs inside `s + s`. The length check matters; without it `'a'` would count as a rotation of `'aa'`.\n\nThe naive alternative builds each of the `n` rotations and compares, which is O(n^2) and more code. Comparing sorted letters is wrong: `'abdc'` has the same letters as `'abcd'` but is not a rotation.\n\nTime is O(n) with a linear substring search (Python's `in` is fast enough in practice), space O(n) for the doubled string.",
    functionName: "is_rotation_of",
    functionSignature: "def is_rotation_of(s: str, t: str) -> bool:",
    starter:
      STARTER_HEADER +
      "def is_rotation_of(s: str, t: str) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["waterbottle", "erbottlewat"], expected: true },
      { input: ["abcd", "abdc"], expected: false },
      { input: ["aab", "aba"], expected: true },
    ],
    hiddenTests: [
      { input: ["", ""], expected: true },
      { input: ["aa", "a"], expected: false },
      { input: ["abc", "abc"], expected: true },
      { input: ["abab", "baba"], expected: true },
      { input: ["a", "aa"], expected: false },
      { input: ["abcde", "edcba"], expected: false },
    ],
  },
  {
    id: "stitch-log-fragments",
    number: 525,
    title: "Stitch Log Fragments",
    difficulty: "Easy",
    topic: "String",
    statement:
      "Two pieces of a log line were captured separately, and the end of the first piece `a` may repeat the beginning of the second piece `b`.\n\nFind the **longest** string that is both a suffix of `a` and a prefix of `b` (it may be empty, and it may be all of `a` or all of `b`). Return `a` followed by the part of `b` that comes after that overlap.\n\nEither string may be empty; then the result is simply the other one.",
    explanation:
      "Try overlap lengths from the largest possible, `min(len(a), len(b))`, down to 1. For a length `k`, the overlap exists when the last `k` characters of `a` equal the first `k` characters of `b`. The first `k` that works is the longest, so return `a + b[k:]`. If none works, return `a + b`.\n\nSearching from the longest matters. With `a = 'aaa'` and `b = 'aa'` a one-character overlap also matches, but stopping there would give `'aaaa'` instead of `'aaa'`.\n\nThis simple scan costs O(m^2) character comparisons in the worst case for an overlap window of size m, which is fine for short strings. For long inputs the same answer comes from the KMP prefix function of `b + '#' + a` in linear time.\n\nSpace is O(len(a) + len(b)) for the result.",
    functionName: "merge_with_overlap",
    functionSignature: "def merge_with_overlap(a: str, b: str) -> str:",
    starter:
      STARTER_HEADER +
      "def merge_with_overlap(a: str, b: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["hello wor", "world"], expected: "hello world" },
      { input: ["abc", "def"], expected: "abcdef" },
      { input: ["aaa", "aa"], expected: "aaa" },
    ],
    hiddenTests: [
      { input: ["abab", "abab"], expected: "abab" },
      { input: ["xyz", "yzyz"], expected: "xyzyz" },
      { input: ["", "abc"], expected: "abc" },
      { input: ["abc", ""], expected: "abc" },
      { input: ["ab", "bab"], expected: "abab" },
      { input: ["abcab", "abx"], expected: "abcabx" },
    ],
  },
  {
    id: "shorthand-matches-word",
    number: 526,
    title: "Shorthand Matches Word",
    difficulty: "Medium",
    topic: "String",
    statement:
      "A word can be written in shorthand by replacing stretches of letters with the number of letters left out. For example `'internationalization'` can be written `'i18n'` (keep `i`, skip 18 letters, keep `n`).\n\nGiven a lowercase `word` and a shorthand `abbr` made of lowercase letters and digits, return `True` if `abbr` describes `word` exactly, otherwise `False`.\n\nRules:\n- A letter in `abbr` must equal the letter at the current position of `word`.\n- A run of consecutive digits is read as ONE decimal number and skips that many letters of `word`.\n- A number may not start with `0`, so `'0'` and `'03'` make the shorthand invalid (return `False`).\n- The shorthand must use up the word exactly: no letters left over, and no skipping past the end.\n\nBoth strings are non-empty.",
    explanation:
      "Keep an index `i` into `word` and scan `abbr` left to right.\n\n- On a letter: it must match `word[i]` (and `i` must still be inside the word); then advance `i` by one.\n- On a digit: if it is `0` the number has a leading zero, so fail. Otherwise read the whole run of digits as one number and add it to `i`.\n\nAt the end the answer is `i == len(word)`. That single comparison also rejects skipping past the end.\n\nTypical mistakes: handling digits one at a time (`'s10n'` must skip ten letters, not one and then zero), forgetting the leading-zero rule, and returning `True` as soon as the shorthand ends even though letters of the word remain.\n\nTime O(len(abbr)), space O(1).",
    functionName: "matches_abbreviation",
    functionSignature: "def matches_abbreviation(word: str, abbr: str) -> bool:",
    starter:
      STARTER_HEADER +
      "def matches_abbreviation(word: str, abbr: str) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["internationalization", "i12iz4n"], expected: true },
      { input: ["apple", "a2e"], expected: false },
      { input: ["substitution", "s10n"], expected: true },
    ],
    hiddenTests: [
      { input: ["apple", "a3e"], expected: true },
      { input: ["apple", "5"], expected: true },
      { input: ["apple", "6"], expected: false },
      { input: ["apple", "a03e"], expected: false },
      { input: ["apple", "ap0ple"], expected: false },
      { input: ["word", "1o1d"], expected: true },
    ],
  },
  {
    id: "rail-fence-scramble",
    number: 527,
    title: "Rail Fence Scramble",
    difficulty: "Medium",
    topic: "String",
    statement:
      "A rail fence scramble writes a message in a zigzag across `rails` rows. The first character goes on row 0, each following character goes one row lower until the bottom row is reached, then one row higher until the top row is reached, and so on. The scrambled message is every row read left to right, top row first, joined together.\n\nWith 3 rails, `'ABCDEFG'` is written as\n\n```\nA . . . E . .\n. B . D . F .\n. . C . . . G\n```\n\nand reads `'AE' + 'BDF' + 'CG' = 'AEBDFCG'`.\n\nGiven the message `s` and `rails >= 1`, return the scrambled message. With one rail, or with at least as many rails as characters, the message is unchanged. An empty message gives an empty string.",
    explanation:
      "Simulate the pen. Keep one bucket (list of characters) per rail, a current row and a direction. Append each character to the current row's bucket, flip the direction when the row is the top or the bottom rail, then move one row in that direction. Finally join the buckets in order.\n\nHandle `rails == 1` first: with a single rail the top is also the bottom and the 'bounce' logic would step outside the rows.\n\nA common wrong shortcut is `row = i % rails`, which fills the rows in a sawtooth (0,1,2,0,1,2) rather than a zigzag (0,1,2,1,0,1,2). The true period is `2 * (rails - 1)`; you can also compute the row directly as `p = i % period; row = p if p < rails else period - p`.\n\nTime O(n), space O(n).",
    functionName: "rail_fence_encode",
    functionSignature: "def rail_fence_encode(s: str, rails: int) -> str:",
    starter:
      STARTER_HEADER +
      "def rail_fence_encode(s: str, rails: int) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["ABCDEFG", 3], expected: "AEBDFCG" },
      { input: ["WEAREDISCOVERED", 3], expected: "WECRERDSOEEAIVD" },
      { input: ["HELLO", 1], expected: "HELLO" },
    ],
    hiddenTests: [
      { input: ["HELLO", 2], expected: "HLOEL" },
      { input: ["AB", 5], expected: "AB" },
      { input: ["", 3], expected: "" },
      { input: ["ABCDEFGHIJ", 4], expected: "AGBFHCEIDJ" },
      { input: ["abcdef", 6], expected: "abcdef" },
      { input: ["abcdefgh", 5], expected: "abhcgdfe" },
    ],
  },
  {
    id: "smallest-repeating-block",
    number: 528,
    title: "Smallest Repeating Block",
    difficulty: "Medium",
    topic: "String",
    statement:
      "A wallpaper pattern is described by a non-empty string `s`. Return the **shortest** string `u` such that `s` is exactly `u` written a whole number of times (one or more) back to back.\n\nIf `s` is not made of a smaller repeated block, the answer is `s` itself. A block that only partly fits at the end does not count: `'ababa'` is not `'ab'` repeated.",
    explanation:
      "The block length must divide `len(s)`. Try each length `size` from 1 upward; skip sizes that do not divide `n`; for the others check whether `s[:size]` repeated `n // size` times rebuilds `s`. The first size that works is the shortest, and `size = n` always works, so the loop always answers.\n\nTwo tempting shortcuts fail. Cutting at the second appearance of the first character gives `'ab'` for `'abaaba'` (the real block is `'aba'`). Forgetting the divisibility test gives `'ab'` for `'ababa'`.\n\nA number has few divisors, so this is close to linear in practice (worst case O(n * d(n)) where d(n) is the number of divisors). The linear-time alternative uses the KMP failure function: with `p` the longest proper prefix that is also a suffix, the candidate length is `n - p`, valid only if it divides `n`.\n\nSpace O(n).",
    functionName: "smallest_repeating_unit",
    functionSignature: "def smallest_repeating_unit(s: str) -> str:",
    starter:
      STARTER_HEADER +
      "def smallest_repeating_unit(s: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["abcabcabc"], expected: "abc" },
      { input: ["abcd"], expected: "abcd" },
      { input: ["abaaba"], expected: "aba" },
    ],
    hiddenTests: [
      { input: ["aaaa"], expected: "a" },
      { input: ["ababa"], expected: "ababa" },
      { input: ["a"], expected: "a" },
      { input: ["abcabcab"], expected: "abcabcab" },
      { input: ["aabaabaa"], expected: "aabaabaa" },
      { input: ["abaabaabaabaabaaba"], expected: "aba" },
    ],
  },
  {
    id: "fill-in-the-template",
    number: 529,
    title: "Fill In the Template",
    difficulty: "Medium",
    topic: "String",
    statement:
      "A message template contains placeholders. A **placeholder** is an opening brace `{`, then one or more characters that are each a lowercase letter `a`-`z` or an underscore `_`, then a closing brace `}`, with nothing else in between. Examples: `{name}`, `{first_name}`. These are NOT placeholders: `{}`, `{Name}`, `{a b}`, `{a`.\n\nReturn the template with every placeholder whose name is a key of `values` replaced by the matching value. Everything else is copied unchanged, including placeholders whose name is not in `values` and braces that are not part of a placeholder.\n\nThe template is scanned once from left to right. Inserted text is never scanned again, so a value that itself looks like a placeholder stays as it is. An empty template gives an empty string.",
    explanation:
      "Scan the template with an index. At a `{`, look ahead over the run of name characters (lowercase letters and underscores). If the run is non-empty and is immediately followed by `}`, you have a placeholder: output the value if the name is known, otherwise output the placeholder text unchanged, and jump past the `}`. In every other case output the single character and move on by one. Moving on by just one character matters for input like `'{a{b}'`, where the first brace is plain text but `{b}` is still a placeholder.\n\nIn Python this is exactly `re.sub(r'\\{([a-z_]+)\\}', replace_fn, template)` with a function that looks the name up.\n\nThe naive approach, calling `template.replace('{' + key + '}', value)` once per key, is wrong: text inserted for one key gets rescanned by later keys, so the result depends on the dictionary order.\n\nTime O(n + total length of inserted values), space the same for the output.",
    functionName: "fill_template",
    functionSignature: "def fill_template(template: str, values: dict[str, str]) -> str:",
    starter:
      STARTER_HEADER +
      "def fill_template(template: str, values: dict[str, str]) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["Hi {name}, your order {order_id} has shipped!", {"name": "Ada", "order_id": "A17"}], expected: "Hi Ada, your order A17 has shipped!" },
      { input: ["{greeting} {who}", {"greeting": "Hello"}], expected: "Hello {who}" },
      { input: ["{a}{b}", {"a": "{b}", "b": "y"}], expected: "{b}y" },
    ],
    hiddenTests: [
      { input: ["{a}{b}{a}", {"b": "{a}", "a": "x"}], expected: "x{a}x" },
      { input: ["{} and {Name} and {a b}", {"a": "1", "name": "2"}], expected: "{} and {Name} and {a b}" },
      { input: ["{{a}}", {"a": "z"}], expected: "{z}" },
      { input: ["{a{b}", {"a": "1", "b": "2"}], expected: "{a2" },
      { input: ["", {"a": "1"}], expected: "" },
      { input: ["a}{b and {a", {"a": "1", "b": "2"}], expected: "a}{b and {a" },
    ],
  },
  {
    id: "spell-out-the-amount",
    number: 530,
    title: "Spell Out the Amount",
    difficulty: "Hard",
    topic: "String",
    statement:
      "A cheque printer must write an amount in English words. Given an integer `n` with `0 <= n <= 999,999,999,999`, return it spelled out.\n\nFormat rules:\n- Every word starts with a capital letter and words are separated by exactly one space, with no leading or trailing space.\n- No hyphens and no `And`: 123 is `'One Hundred Twenty Three'`.\n- Use the scale words `Thousand`, `Million` and `Billion` (1,000,000,000). A three-digit group that is zero is skipped completely: 1,000,005 is `'One Million Five'`.\n- 0 is `'Zero'`.\n\nSpellings to use: One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen, Twenty Thirty Forty Fifty Sixty Seventy Eighty Ninety, Hundred.",
    explanation:
      "English names numbers in groups of three digits, and every group is read the same way, so solve the problem for 0..999 once and reuse it.\n\n**Helper for a group below 1000:** if it is 100 or more, emit the hundreds digit and `Hundred`, then continue with the remainder. A remainder of 20 or more emits a tens word and then the ones word if the last digit is not zero. A remainder of 1..19 is a single lookup, because the teens are irregular.\n\n**Main loop:** take the billions, millions, thousands and units groups in that order (`n // scale % 1000`). For each group that is not zero, emit the helper's words followed by the scale word. Collect words in a list and join with single spaces at the end, which avoids every spacing bug.\n\nThe difficulty is all in the edge cases: 0 itself, zero groups in the middle (1,000,000 must not say `Thousand`), teens, exact tens such as 20 and 100, and stray double spaces when gluing strings by hand.\n\nTime and space are O(number of digits), effectively constant.",
    functionName: "number_to_words",
    functionSignature: "def number_to_words(n: int) -> str:",
    starter:
      STARTER_HEADER +
      "def number_to_words(n: int) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: [123], expected: "One Hundred Twenty Three" },
      { input: [12345], expected: "Twelve Thousand Three Hundred Forty Five" },
      { input: [1000005], expected: "One Million Five" },
    ],
    hiddenTests: [
      { input: [0], expected: "Zero" },
      { input: [1000000], expected: "One Million" },
      { input: [1234567891], expected: "One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven Thousand Eight Hundred Ninety One" },
      { input: [999999999999], expected: "Nine Hundred Ninety Nine Billion Nine Hundred Ninety Nine Million Nine Hundred Ninety Nine Thousand Nine Hundred Ninety Nine" },
      { input: [700014010], expected: "Seven Hundred Million Fourteen Thousand Ten" },
      { input: [90020], expected: "Ninety Thousand Twenty" },
    ],
  },
  {
    id: "skyline-leaders",
    number: 531,
    title: "Skyline Leaders",
    difficulty: "Easy",
    topic: "Array",
    statement:
      "Buildings stand in a row and `nums` lists their heights from left to right. A building has a sea view if it is **strictly taller** than every building to its right. The last building always has a sea view.\n\nReturn the heights of the buildings with a sea view, in their original left-to-right order. An empty list gives an empty list.",
    explanation:
      "Checking each building against everything to its right is O(n^2). Scan from the right instead and remember the tallest height seen so far: a building has a view exactly when it is strictly taller than that running maximum.\n\nSteps: walk `nums` backwards; when the value beats the running maximum (or it is the first value visited), record it and update the maximum. The recorded values come out right-to-left, so reverse them before returning.\n\nUse a strict comparison: in `[5, 5, 3]` the first 5 is blocked by the second 5. Start the running maximum as 'nothing yet' rather than 0 so that negative values still work.\n\nTime O(n), space O(n) for the answer.",
    functionName: "right_side_leaders",
    functionSignature: "def right_side_leaders(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def right_side_leaders(nums: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[16, 17, 4, 3, 5, 2]], expected: [17, 5, 2] },
      { input: [[5, 5, 3]], expected: [5, 3] },
      { input: [[1, 2, 3]], expected: [3] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[7]], expected: [7] },
      { input: [[3, 2, 1]], expected: [3, 2, 1] },
      { input: [[-1, -5, -2, -9]], expected: [-1, -2, -9] },
      { input: [[4, 4, 4]], expected: [4] },
      { input: [[2, 9, 9, 1, 0, 0]], expected: [9, 1, 0] },
    ],
  },
  {
    id: "longest-rising-run",
    number: 532,
    title: "Longest Rising Run",
    difficulty: "Easy",
    topic: "Array",
    statement:
      "A hiker logs the altitude at every checkpoint in `nums`. A **climb** is a stretch of consecutive checkpoints in which every altitude is strictly higher than the one before it. A single checkpoint is a climb of length 1.\n\nReturn the number of checkpoints in the longest climb. Return 0 for an empty log.",
    explanation:
      "One pass with a counter. Keep `run`, the length of the climb ending at the current checkpoint. If the current altitude is strictly greater than the previous one, `run += 1`; otherwise the climb restarts and `run = 1`. Track the largest `run` seen.\n\nUpdate the best value on every step, not only when a climb breaks, or a climb that lasts until the end of the list is missed. Equal neighbours break the climb because the rise must be strict.\n\nThe brute force that tries every start and extends as far as possible is O(n^2); the single pass is O(n) time and O(1) space.",
    functionName: "longest_rising_run",
    functionSignature: "def longest_rising_run(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def longest_rising_run(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 3, 5, 4, 7]], expected: 3 },
      { input: [[2, 2, 2]], expected: 1 },
      { input: [[1, 2, 2, 3, 4, 5]], expected: 4 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[5]], expected: 1 },
      { input: [[1, 2, 3, 4]], expected: 4 },
      { input: [[5, 4, 3]], expected: 1 },
      { input: [[-3, -2, -1, -1, 0]], expected: 3 },
      { input: [[4, 5, 1, 2, 3, 0]], expected: 3 },
    ],
  },
  {
    id: "gaps-in-the-ticket-roll",
    number: 533,
    title: "Gaps in the Ticket Roll",
    difficulty: "Medium",
    topic: "Array",
    statement:
      "Tickets are numbered from `lo` to `hi` inclusive (`lo <= hi`). The list `nums` holds the ticket numbers that were sold: it is sorted in ascending order, has no repeats, and every value lies between `lo` and `hi`.\n\nDescribe the unsold tickets as a list of ranges in ascending order. Each maximal run of consecutive unsold numbers becomes one string: just the number, such as `'7'`, when the run has a single ticket, or `'first->last'`, such as `'4->9'`, when it has two or more.\n\nIf every ticket was sold return an empty list. If `nums` is empty the whole roll `lo..hi` is one run. Numbers may be negative; write them with their minus sign, for example `'-3->-1'`.",
    explanation:
      "Think of the gaps between neighbouring sold numbers, plus the gap before the first one and after the last one.\n\nKeep `prev`, the last number accounted for, starting at `lo - 1`. For each sold `x`, the unsold run is `prev + 1 .. x - 1`; emit it if it is non-empty, then set `prev = x`. After the loop handle the tail `prev + 1 .. hi` the same way. Starting `prev` at `lo - 1` and finishing with `hi` means the two ends need no special code, and an empty `nums` falls out naturally.\n\nA small helper `emit(a, b)` keeps the formatting in one place: nothing if `a > b`, the single number if `a == b`, otherwise `'a->b'`.\n\nLooping over every integer from `lo` to `hi` also works but takes time proportional to the size of the range, which can be enormous even when `nums` is tiny. The gap walk is O(len(nums)) time.",
    functionName: "missing_ranges",
    functionSignature: "def missing_ranges(nums: list[int], lo: int, hi: int) -> list[str]:",
    starter:
      STARTER_HEADER +
      "def missing_ranges(nums: list[int], lo: int, hi: int) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[0, 1, 3, 50, 75], 0, 99], expected: ["2", "4->49", "51->74", "76->99"] },
      { input: [[3, 4, 5], 1, 9], expected: ["1->2", "6->9"] },
      { input: [[], 1, 1], expected: ["1"] },
    ],
    hiddenTests: [
      { input: [[], -3, 2], expected: ["-3->2"] },
      { input: [[5], 5, 5], expected: [] },
      { input: [[-2, 0], -2, 0], expected: ["-1"] },
      { input: [[1, 3], 0, 3], expected: ["0", "2"] },
      { input: [[10], 0, 10], expected: ["0->9"] },
      { input: [[-5, -1, 2], -6, 2], expected: ["-6", "-4->-2", "0->1"] },
    ],
  },
  {
    id: "quietest-desk",
    number: 534,
    title: "Quietest Desk",
    difficulty: "Medium",
    topic: "Array",
    statement:
      "A library has one long row of desks. `desks[i]` is `1` if desk `i` is taken and `0` if it is free. At least one desk is taken and at least one is free.\n\nYou want a free desk as far as possible from other people. The distance between desks `i` and `j` is `|i - j|`, and what matters for a desk is the distance to the **nearest** taken desk.\n\nReturn the largest nearest-neighbour distance you can get by choosing the best free desk.",
    explanation:
      "Look at the runs of free desks. There are two kinds.\n\n- A run of `g` free desks with a taken desk on BOTH sides: the best spot is the middle, at distance `(g + 1) // 2` from the closer neighbour.\n- A run of `g` free desks touching the START or END of the row: sit at the very end of the row, at distance `g` from the only neighbour.\n\nOne pass does it. Remember the index `last` of the most recent taken desk (none yet at the start). At each taken desk `i`: if there was no earlier taken desk, the leading run gives `i`; otherwise the gap gives `(i - last) // 2`. After the loop the trailing run gives `n - 1 - last`. Return the maximum of all of these.\n\nThe usual bugs are halving the runs at the two ends as if they had neighbours on both sides, and rounding the middle distance the wrong way (three free desks between two people allow distance 2, not 1).\n\nThe brute force measures, for every free desk, the distance to every taken desk: O(n^2). The scan is O(n) time and O(1) space.",
    functionName: "quietest_desk_distance",
    functionSignature: "def quietest_desk_distance(desks: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def quietest_desk_distance(desks: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 0, 0, 0, 1, 0, 1]], expected: 2 },
      { input: [[1, 0, 0, 0]], expected: 3 },
      { input: [[0, 1]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[0, 0, 1, 0, 0, 0, 0, 1]], expected: 2 },
      { input: [[1, 0, 0, 1]], expected: 1 },
      { input: [[0, 0, 0, 1]], expected: 3 },
      { input: [[1, 0, 1, 0, 0, 0, 0, 0, 1]], expected: 3 },
      { input: [[1, 0, 0, 0, 0, 1, 0, 0, 0]], expected: 3 },
      { input: [[0, 1, 1, 1, 0]], expected: 1 },
    ],
  },
  {
    id: "scenic-stop-pair",
    number: 535,
    title: "Scenic Stop Pair",
    difficulty: "Medium",
    topic: "Array",
    statement:
      "A road has scenic stops one kilometre apart; `ratings[i]` is the rating of stop `i`. A day trip visits two different stops `i < j`, and its score is `ratings[i] + ratings[j] - (j - i)`: the two ratings minus the distance driven between them.\n\nReturn the highest score of any pair. The list has at least two stops, ratings are non-negative, and the answer can be negative.",
    explanation:
      "Trying all pairs is O(n^2). Split the score by index: `(ratings[i] + i) + (ratings[j] - j)`. The left part depends only on `i` and the right part only on `j`.\n\nSweep `j` from left to right while keeping `left`, the largest `ratings[i] + i` over all stops before `j`. The best pair ending at `j` is `left + ratings[j] - j`. After using stop `j` as a right end, offer it as a left end: `left = max(left, ratings[j] + j)`. The order of those two steps guarantees `i < j`.\n\nSimply picking the two highest ratings ignores the distance penalty, and picking adjacent stops ignores that two great stops far apart can still win. Start the best score from the first real pair, not from 0, because scores can be negative (for example `[0, 0]` scores -1).\n\nTime O(n), space O(1).",
    functionName: "best_viewpoint_pair",
    functionSignature: "def best_viewpoint_pair(ratings: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def best_viewpoint_pair(ratings: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[8, 1, 5, 2, 6]], expected: 11 },
      { input: [[1, 2]], expected: 2 },
      { input: [[10, 1, 1, 1, 10]], expected: 16 },
    ],
    hiddenTests: [
      { input: [[0, 0]], expected: -1 },
      { input: [[5, 1, 1, 1, 1, 1, 9]], expected: 9 },
      { input: [[4, 4]], expected: 7 },
      { input: [[1, 3, 5]], expected: 7 },
      { input: [[9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 3, 3]], expected: 11 },
      { input: [[2, 2, 2, 7, 1, 6]], expected: 11 },
    ],
  },
  {
    id: "three-rising-readings",
    number: 536,
    title: "Three Rising Readings",
    difficulty: "Medium",
    topic: "Array",
    statement:
      "A sensor produced the readings `nums` in order. Return `True` if there are three positions `i < j < k` (not necessarily next to each other) with `nums[i] < nums[j] < nums[k]`, otherwise `False`.\n\nLists with fewer than three readings give `False`.",
    explanation:
      "Testing every triple is O(n^3), and even 'for each middle element, is there something smaller on the left and larger on the right' needs extra arrays. A greedy pass does it with two variables.\n\nKeep `first`, the smallest value seen so far, and `second`, the smallest value that has some smaller value before it. For each `x`:\n- if `x <= first`, it becomes the new `first`;\n- else if `x <= second`, it becomes the new `second` (it has a smaller value before it);\n- otherwise `x` is larger than `second`, which already has a smaller value before it, so a rising triple exists.\n\nThe subtle point: `first` may move to a position after `second`. That is fine, because `second` only records that some smaller value came before it; the triple it proves still exists.\n\nUse `<=` in both tests so equal values never count as rising. The elements need not be adjacent, so checking only neighbouring triples is wrong.\n\nTime O(n), space O(1).",
    functionName: "has_rising_triple",
    functionSignature: "def has_rising_triple(nums: list[int]) -> bool:",
    starter:
      STARTER_HEADER +
      "def has_rising_triple(nums: list[int]) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[2, 1, 5, 0, 4, 6]], expected: true },
      { input: [[5, 4, 3, 2, 1]], expected: false },
      { input: [[20, 100, 10, 12, 5, 13]], expected: true },
    ],
    hiddenTests: [
      { input: [[1, 2, 2]], expected: false },
      { input: [[]], expected: false },
      { input: [[1, 1, 1, 1]], expected: false },
      { input: [[6, 7, 1, 2]], expected: false },
      { input: [[5, 1, 5, 5, 2, 5, 4]], expected: true },
      { input: [[1, 5, 0, 4, 1, 3]], expected: true },
    ],
  },
  {
    id: "most-sortable-chunks",
    number: 537,
    title: "Most Sortable Chunks",
    difficulty: "Hard",
    topic: "Array",
    statement:
      "You want to sort `nums` in ascending order with as much parallel work as possible. You cut the list into consecutive chunks (every element belongs to exactly one chunk, order unchanged), sort each chunk on its own, and glue the chunks back together in their original order. The cut is **valid** if the glued result is the fully sorted list.\n\nReturn the largest number of chunks a valid cut can have. The list may contain repeated and negative values. An empty list gives 0.",
    explanation:
      "A cut between two positions is allowed exactly when everything on its left is less than or equal to everything on its right, that is `max(left part) <= min(right part)`. The allowed cut positions are independent of each other, so the answer is (number of allowed cuts) + 1.\n\n**Prefix max / suffix min.** Compute `suffix_min[i]` for every position, then sweep left to right with a running maximum and count the positions `i` where `running_max <= suffix_min[i + 1]`.\n\n**Monotonic stack (one pass).** Keep a stack holding the maximum of each chunk built so far. For a new value `x`, if it is smaller than the top chunk's maximum it cannot start a new chunk: pop every chunk whose maximum is greater than `x`, merging them, and push back the largest maximum popped. Otherwise push `x` as a new chunk. The stack size at the end is the answer.\n\nPitfalls: comparing the running maximum only with the next element instead of the minimum of the whole remainder (`[2, 3, 1]` must be one chunk), and using the trick `max(prefix) == index`, which only works when the values are exactly `0..n-1`. With duplicates the comparison must be `<=`, so `[1, 1]` splits into two chunks.\n\nTime O(n), space O(n).",
    functionName: "max_sortable_chunks",
    functionSignature: "def max_sortable_chunks(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def max_sortable_chunks(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[2, 1, 3, 4, 4]], expected: 4 },
      { input: [[5, 4, 3, 2, 1]], expected: 1 },
      { input: [[1, 1, 0, 0, 1]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[7]], expected: 1 },
      { input: [[2, 3, 1]], expected: 1 },
      { input: [[1, 0, 1, 3, 2]], expected: 3 },
      { input: [[4, 2, 2, 1, 1]], expected: 1 },
      { input: [[-1, -3, 0, 5, 4, 4, 9]], expected: 4 },
    ],
  },
  {
    id: "nobody-upstream",
    number: 538,
    title: "Nobody Upstream",
    difficulty: "Easy",
    topic: "Graph",
    statement:
      "A data pipeline has `n` stages numbered `0` to `n - 1`. Each pair `[a, b]` in `edges` means stage `a` sends its output to stage `b` (a one-way link, with `a != b`). The same pair may be listed more than once.\n\nReturn, in ascending order, every stage that receives no input from any other stage. A stage that appears in no pair at all receives no input, so it is included.",
    explanation:
      "A stage receives input exactly when it appears as the second element of some pair, so no traversal is needed, only counting.\n\nMake a boolean list `has_incoming` of length `n`. For every `[a, b]` set `has_incoming[b] = True`. Then collect the indices that are still `False`; iterating `0..n-1` produces them already sorted.\n\nMistakes to avoid: only looking at stages that appear in `edges` (isolated stages would be missed), and mixing up the direction (stages with no outgoing links are sinks, not sources). Repeated pairs are harmless because a flag is set, not counted.\n\nThese 'in-degree zero' nodes are the starting points of a topological sort, and in a graph without cycles every stage can be reached from at least one of them.\n\nTime O(n + len(edges)), space O(n).",
    functionName: "find_source_nodes",
    functionSignature: "def find_source_nodes(n: int, edges: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def find_source_nodes(n: int, edges: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [6, [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]], expected: [0, 3] },
      { input: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { input: [4, [[0, 1], [0, 1], [2, 1]]], expected: [0, 2, 3] },
    ],
    hiddenTests: [
      { input: [3, []], expected: [0, 1, 2] },
      { input: [1, []], expected: [0] },
      { input: [5, [[4, 3], [3, 2], [2, 1], [1, 0]]], expected: [4] },
      { input: [4, [[3, 0], [3, 1], [3, 2]]], expected: [3] },
      { input: [5, [[1, 2], [2, 1], [0, 4]]], expected: [0, 3] },
    ],
  },
  {
    id: "walks-that-always-end",
    number: 539,
    title: "Walks That Always End",
    difficulty: "Medium",
    topic: "Graph",
    statement:
      "A choose-your-own-adventure book has pages `0` to `n - 1`. `graph[i]` lists the pages a reader on page `i` may turn to next (one-way; a page may even point to itself). A page with an empty list is an ending.\n\nA page is **safe** if a reader who starts there is guaranteed to reach an ending no matter which choices they make, in other words no sequence of choices from it can go on forever.\n\nReturn all safe pages in ascending order.",
    explanation:
      "A reader can go on forever exactly when they can reach a cycle. So a page is unsafe if it lies on a cycle or can reach one, and safe if every path from it dies out at an ending.\n\n**DFS with three states.** Mark each page unvisited, in-progress or safe. To evaluate a page, mark it in-progress and evaluate every page it points to. If any of them is in-progress (we looped back onto the current path) or is found unsafe, this page is unsafe; leave it marked in-progress, which now doubles as 'unsafe'. If all of them are safe, mark this page safe. Each page is evaluated once thanks to the marks.\n\n**Alternative: reverse topological peel.** Endings are safe. Reverse all links, and repeatedly declare safe any page whose every outgoing link leads to a safe page (track remaining out-degree in a queue).\n\nThe classic mistake is to call a page safe when it CAN reach an ending. It must be unable to avoid one: a page with one link to an ending and another into a loop is unsafe.\n\nTime O(n + number of links), space O(n).",
    functionName: "safe_nodes",
    functionSignature: "def safe_nodes(graph: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def safe_nodes(graph: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 2], [2, 3], [5], [0], [5], [], []]], expected: [2, 4, 5, 6] },
      { input: [[[1, 2], [], [3], [2]]], expected: [1] },
      { input: [[[1], [2], []]], expected: [0, 1, 2] },
    ],
    hiddenTests: [
      { input: [[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]], expected: [4] },
      { input: [[[]]], expected: [0] },
      { input: [[[0]]], expected: [] },
      { input: [[[1], [0], [3], []]], expected: [2, 3] },
      { input: [[[1, 3], [2], [3], [], [0, 5], [5]]], expected: [0, 1, 2, 3] },
      { input: [[[2], [2], [3, 4], [], [1]]], expected: [3] },
    ],
  },
  {
    id: "knight-around-the-pawns",
    number: 540,
    title: "Knight Around the Pawns",
    difficulty: "Medium",
    topic: "Graph",
    statement:
      "A chess knight stands on a `size` x `size` board. Squares are written `[row, col]` with both numbers from `0` to `size - 1`. A knight move goes two squares in one direction (up, down, left or right) and one square sideways to that, giving up to 8 possible moves. The knight jumps, so squares it passes over do not matter, but it must land on the board and may never land on a square listed in `blocked`.\n\nReturn the smallest number of moves needed to get from `start` to `target`, or `-1` if it cannot be done. If `start` equals `target` the answer is 0. Neither `start` nor `target` is blocked.",
    explanation:
      "Every move costs the same, so this is a shortest path in an unweighted graph whose nodes are squares: breadth-first search.\n\nPut the blocked squares in a set for O(1) lookups. Start a queue with `start` at distance 0. Repeatedly pop a square; if it is the target, return its distance. Otherwise try the 8 offsets `(+-1, +-2)` and `(+-2, +-1)`; for each landing square that is on the board, not blocked and not seen before, record `distance + 1` and push it. If the queue empties, the target is unreachable: return -1.\n\nBFS reaches squares in order of distance, so the first time the target is popped its distance is minimal. Mark squares as seen when they are pushed, not when popped, to avoid queueing the same square many times.\n\nA greedy rule such as 'always jump to the square nearest the target' fails: knights often have to move away first, and blocked squares can force long detours. Remember to check the lower bounds too, since a negative index in Python silently wraps around.\n\nTime and space O(size^2).",
    functionName: "knight_min_moves",
    functionSignature: "def knight_min_moves(size: int, start: list[int], target: list[int], blocked: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def knight_min_moves(size: int, start: list[int], target: list[int], blocked: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [8, [0, 0], [7, 7], []], expected: 6 },
      { input: [4, [2, 3], [0, 3], [[1, 1], [3, 3]]], expected: 4 },
      { input: [3, [0, 0], [1, 1], []], expected: -1 },
    ],
    hiddenTests: [
      { input: [5, [2, 2], [2, 2], [[0, 0]]], expected: 0 },
      { input: [4, [0, 0], [3, 3], []], expected: 2 },
      { input: [1, [0, 0], [0, 0], []], expected: 0 },
      { input: [6, [0, 0], [0, 1], []], expected: 3 },
      { input: [4, [0, 0], [2, 0], [[1, 2], [3, 2]]], expected: 4 },
      { input: [5, [0, 0], [2, 4], [[1, 2], [2, 1], [0, 3]]], expected: -1 },
    ],
  },
  {
    id: "count-the-shortest-routes",
    number: 541,
    title: "Count the Shortest Routes",
    difficulty: "Medium",
    topic: "Graph",
    statement:
      "A subway map has `n` stations numbered `0` to `n - 1`. Each `[a, b]` in `edges` is a two-way track between two different stations, and no track is listed twice. Every track takes one hop to ride.\n\nReturn how many different routes from `src` to `dst` use the fewest possible hops. Two routes are different if their sequences of stations differ. If `dst` cannot be reached return 0. If `src` equals `dst` return 1 (the route that stays put).",
    explanation:
      "Breadth-first search already finds the fewest hops to every station. Extend it to carry a count: `ways[v]` = number of shortest routes from `src` to `v`.\n\nStart with `dist[src] = 0` and `ways[src] = 1`. When popping `u` and looking at a neighbour `v`:\n- if `v` is unseen, set `dist[v] = dist[u] + 1` and push it;\n- then, if `dist[v] == dist[u] + 1`, the track `u-v` is the last hop of some shortest routes to `v`, so `ways[v] += ways[u]`.\n\nThis is correct because BFS pops stations in order of distance: by the time any station at distance `d + 1` is popped, every station at distance `d` has been popped and has added its full count. The answer is `ways[dst]` (0 if never reached).\n\nCounting ALL simple paths with DFS overcounts (longer routes are not wanted) and is exponential. Recording only the first way BFS reaches a station undercounts.\n\nTime O(n + len(edges)), space O(n + len(edges)).",
    functionName: "count_shortest_routes",
    functionSignature: "def count_shortest_routes(n: int, edges: list[list[int]], src: int, dst: int) -> int:",
    starter:
      STARTER_HEADER +
      "def count_shortest_routes(n: int, edges: list[list[int]], src: int, dst: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 3], expected: 2 },
      { input: [4, [[0, 1], [0, 2], [1, 3], [2, 3], [1, 2]], 0, 3], expected: 2 },
      { input: [3, [[0, 1]], 0, 2], expected: 0 },
    ],
    hiddenTests: [
      { input: [1, [], 0, 0], expected: 1 },
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]], 0, 3], expected: 1 },
      { input: [9, [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]], 0, 8], expected: 6 },
      { input: [6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5]], 0, 5], expected: 2 },
      { input: [7, [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [4, 6], [5, 6]], 6, 0], expected: 3 },
      { input: [4, [[0, 1], [2, 3]], 2, 2], expected: 1 },
    ],
  },
  {
    id: "tightest-loop",
    number: 542,
    title: "Tightest Loop",
    difficulty: "Medium",
    topic: "Graph",
    statement:
      "A park has `n` junctions numbered `0` to `n - 1` joined by two-way paths. Each `[a, b]` in `edges` is a path between two different junctions, and no pair of junctions is joined by more than one path.\n\nA **loop** is a walk that starts and ends at the same junction, uses at least three paths, and never repeats a junction or a path in between. Return the number of paths in the shortest loop, or `-1` if the park has no loop.",
    explanation:
      "Run a breadth-first search from every junction. During the BFS from `root`, record each junction's distance and its BFS parent. Whenever the search looks along a path `u - v` where `v` was already reached and `v` is not `u`'s parent, that path closes a walk `root .. u - v .. root` of length `dist[u] + dist[v] + 1`. Keep the minimum over all roots and all such paths.\n\nWhy this is right: a candidate may not be a simple loop through `root` (the two tree branches can share their first few junctions), but then it CONTAINS a shorter loop, so candidates never undercut the true answer. And when `root` lies on a shortest loop, the BFS from it produces exactly that loop's length. Taking the minimum over every root therefore gives the answer.\n\nWhy simpler ideas fail: a single BFS or DFS only examines one component and one spanning tree. A DFS that measures loops by depth difference along back edges can report a long loop and miss a shorter one made from a different combination of edges.\n\nSkipping the parent is what stops the search from treating a single path walked back and forth as a loop of length 2.\n\nTime O(n * (n + len(edges))), space O(n + len(edges)).",
    functionName: "shortest_cycle_length",
    functionSignature: "def shortest_cycle_length(n: int, edges: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def shortest_cycle_length(n: int, edges: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [7, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 6], [6, 3]]], expected: 3 },
      { input: [4, [[0, 1], [0, 2], [2, 3]]], expected: -1 },
      { input: [6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]]], expected: 4 },
    ],
    hiddenTests: [
      { input: [5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]], expected: 5 },
      { input: [5, [[0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [3, 4]]], expected: 3 },
      { input: [6, [[0, 1], [1, 2], [3, 4], [4, 5], [5, 3]]], expected: 3 },
      { input: [8, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 4], [2, 6]]], expected: 5 },
      { input: [7, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [1, 5], [2, 4]]], expected: 3 },
      { input: [3, []], expected: -1 },
    ],
  },
  {
    id: "mutual-reach-districts",
    number: 543,
    title: "Mutual Reach Districts",
    difficulty: "Hard",
    topic: "Graph",
    statement:
      "A city has `n` intersections numbered `0` to `n - 1` and only one-way streets: `[a, b]` in `links` means you can drive from `a` to `b` (with `a != b`).\n\nTwo intersections belong to the same **district** when you can drive from each one to the other (possibly through other intersections). Every intersection is in exactly one district; an intersection with no such partner forms a district by itself.\n\nReturn the number of districts.",
    explanation:
      "Districts are the strongly connected components of a directed graph. Treating streets as two-way (union-find or plain flood fill) is wrong: a one-way chain `0 -> 1 -> 2` is three districts, not one.\n\n**Kosaraju's two passes.**\n1. Run DFS over the whole graph and append each intersection to a list when its DFS call finishes (post-order).\n2. Reverse every street. Take intersections in reverse finishing order; each time you meet one that is not yet assigned, flood-fill from it in the reversed graph. Everything that fill reaches is exactly one district, so count one.\n\nWhy it works: the intersection that finishes last lies in a district with no streets coming in from other districts. In the reversed graph its fill therefore cannot leak out of its own district. Remove that district and the argument repeats.\n\nTarjan's algorithm finds the same components in a single DFS using low-link values. For small inputs you can also compute reachability from every node and group nodes that reach each other, at O(n * (n + m)).\n\nKosaraju runs in O(n + len(links)) time and space. Use an explicit stack if the graph can be deep, to stay clear of the recursion limit.",
    functionName: "count_mutual_groups",
    functionSignature: "def count_mutual_groups(n: int, links: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def count_mutual_groups(n: int, links: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5, [[0, 1], [1, 2], [2, 0], [3, 4]]], expected: 3 },
      { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: 4 },
      { input: [6, [[0, 1], [1, 0], [1, 2], [2, 3], [3, 2], [4, 5]]], expected: 4 },
    ],
    hiddenTests: [
      { input: [1, []], expected: 1 },
      { input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 1 },
      { input: [3, []], expected: 3 },
      { input: [5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 3]]], expected: 2 },
      { input: [6, [[5, 4], [4, 3], [3, 5], [3, 2], [2, 1], [1, 0], [0, 2]]], expected: 2 },
      { input: [7, [[0, 1], [1, 2], [2, 3], [3, 1], [3, 4], [4, 5], [5, 6], [6, 4], [0, 6]]], expected: 3 },
    ],
  },
  {
    id: "wrecking-ball-shortcut",
    number: 544,
    title: "Wrecking Ball Shortcut",
    difficulty: "Hard",
    topic: "Graph",
    statement:
      "A robot crosses a warehouse given as a grid of `0` (free floor) and `1` (crate). It starts in the top-left cell and must reach the bottom-right cell; both are free. Each step moves one cell up, down, left or right, staying inside the grid.\n\nThe robot may step into a crate cell by smashing the crate, but it can smash at most `k` crates on its whole trip (`k >= 0`).\n\nReturn the fewest steps needed, or `-1` if the trip is impossible. A 1 x 1 grid needs 0 steps.",
    explanation:
      "Plain BFS over cells is not enough, because how useful it is to stand on a cell depends on how many smashes are left. Arriving early with no smashes left can be a dead end, while arriving a little later with one in hand succeeds. Marking a cell 'visited' the first time it is reached throws that second option away.\n\nMake the smash budget part of the state: search over `(row, col, smashes_left)`. From a state, each of the four neighbours inside the grid leads to `(nr, nc, left - grid[nr][nc])`; skip it if that goes below zero or the state was seen before. Every move costs one step, so BFS over these states finds the fewest steps; return the step count the first time the bottom-right cell is popped, with any budget.\n\nOptimisations: if `k >= rows + cols - 3` the robot can walk a straight Manhattan path, so the answer is `rows + cols - 2` immediately. You can also store, per cell, the best budget seen so far and skip arrivals with a smaller or equal budget, since BFS guarantees they are not earlier.\n\nTime and space O(rows * cols * (k + 1)).",
    functionName: "min_steps_with_demolition",
    functionSignature: "def min_steps_with_demolition(grid: list[list[int]], k: int) -> int:",
    starter:
      STARTER_HEADER +
      "def min_steps_with_demolition(grid: list[list[int]], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], 1], expected: 6 },
      { input: [[[0, 1, 1], [1, 1, 1], [1, 0, 0]], 1], expected: -1 },
      { input: [[[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], 0], expected: 10 },
    ],
    hiddenTests: [
      { input: [[[0]], 0], expected: 0 },
      { input: [[[0, 1, 1], [1, 1, 1], [1, 0, 0]], 2], expected: 4 },
      { input: [[[0, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 1, 0]], 1], expected: 8 },
      { input: [[[0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0], [0, 0, 0, 1, 0, 1, 0]], 1], expected: 12 },
      { input: [[[0, 1, 0, 0, 0, 1, 0], [0, 1, 0, 1, 0, 1, 0], [0, 0, 0, 1, 0, 1, 0]], 0], expected: -1 },
      { input: [[[0, 1, 0]], 5], expected: 2 },
    ],
  },
  {
    id: "load-the-delivery-van",
    number: 545,
    title: "Load the Delivery Van",
    difficulty: "Easy",
    topic: "Greedy",
    statement:
      "A warehouse stocks several kinds of boxes. Each entry of `boxes` is `[count, units]`: there are `count` boxes of that kind and every one of them holds `units` items. All boxes are the same size, and the van can carry at most `capacity` boxes in total. You may take any number of boxes of each kind, up to its `count`.\n\nReturn the largest total number of items the van can carry. Counts, units and capacity are non-negative; an empty `boxes` list or a capacity of 0 gives 0.",
    explanation:
      "Every box takes the same room in the van, so a box holding more items is always at least as good as one holding fewer. Greedy choice: fill the van with the fullest boxes first.\n\nSort the kinds by `units` from high to low. For each kind take `min(count, remaining capacity)` boxes, add `taken * units` to the total, and reduce the remaining capacity. Stop when the van is full.\n\nWhy greedy is safe (exchange argument): if a loading leaves out a box with more items while carrying one with fewer, swapping the two never lowers the total. Repeating swaps turns any best loading into the greedy one.\n\nCommon slips: sorting by `count` instead of `units`, or insisting on taking a kind entirely or not at all, when a partial number of boxes of a kind is allowed.\n\nTime O(m log m) for m kinds, space O(m) for the sorted copy.",
    functionName: "max_truck_units",
    functionSignature: "def max_truck_units(boxes: list[list[int]], capacity: int) -> int:",
    starter:
      STARTER_HEADER +
      "def max_truck_units(boxes: list[list[int]], capacity: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 3], [2, 2], [3, 1]], 4], expected: 8 },
      { input: [[[5, 10], [2, 5], [4, 7], [3, 9]], 10], expected: 91 },
      { input: [[[2, 5]], 10], expected: 10 },
    ],
    hiddenTests: [
      { input: [[], 5], expected: 0 },
      { input: [[[3, 4]], 0], expected: 0 },
      { input: [[[10, 1], [1, 9], [2, 2]], 4], expected: 14 },
      { input: [[[4, 6], [4, 6], [1, 7]], 6], expected: 37 },
      { input: [[[3, 2], [100, 1], [1, 50]], 3], expected: 54 },
      { input: [[[2, 0], [1, 3]], 3], expected: 3 },
    ],
  },
  {
    id: "longest-zigzag-pick",
    number: 546,
    title: "Longest Zigzag Pick",
    difficulty: "Medium",
    topic: "Greedy",
    statement:
      "From a list of daily prices `nums` you may cross out any entries you like and keep the rest in their original order. The kept sequence is a **zigzag** if the changes between neighbouring kept values strictly alternate between rises and falls (up, down, up, ... or down, up, down, ...). Two equal neighbours are not allowed.\n\nA single value is a zigzag of length 1, and two different values are a zigzag of length 2. Return the length of the longest zigzag you can keep. An empty list gives 0.",
    explanation:
      "A dynamic programme over all pairs works in O(n^2), but the greedy view is simpler: only the turning points of the price chart matter. Inside a rising stretch you keep just its last (highest) value, inside a falling stretch just its lowest. Every change of direction adds one to the answer.\n\nKeep two counters: `up`, the longest zigzag so far whose last move was a rise, and `down`, the same for a fall. Both start at 1. For each neighbouring pair:\n- price rose: `up = down + 1` (extend a zigzag that last fell);\n- price fell: `down = up + 1`;\n- equal: change nothing.\n\nThe answer is `max(up, down)`. Using two counters handles flat stretches automatically: in `[1, 2, 2, 2, 1]` the plateau is ignored and the answer is 3. Solutions that compare each difference only with the immediately previous difference (which may be zero) get plateaus wrong.\n\nThe kept values need not be adjacent in the input, so a sliding-window scan over contiguous elements undercounts.\n\nTime O(n), space O(1).",
    functionName: "longest_zigzag_length",
    functionSignature: "def longest_zigzag_length(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER +
      "def longest_zigzag_length(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 7, 4, 9, 2, 5]], expected: 6 },
      { input: [[1, 17, 5, 10, 13, 15, 10, 5, 16, 8]], expected: 7 },
      { input: [[1, 2, 3, 4, 5]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[3, 3, 3]], expected: 1 },
      { input: [[1, 2, 2, 2, 1]], expected: 3 },
      { input: [[5, 5, 4, 4, 5, 5]], expected: 3 },
      { input: [[3, 3, 3, 2, 5]], expected: 3 },
      { input: [[1, 5, 6, 7, 2, 3, 4, 1]], expected: 5 },
    ],
  },
  {
    id: "one-of-a-kind-letter-counts",
    number: 547,
    title: "One of a Kind Letter Counts",
    difficulty: "Medium",
    topic: "Greedy",
    statement:
      "A string of lowercase letters is **tidy** when no two different letters that appear in it appear the same number of times. For example `'aab'` is tidy (a twice, b once) but `'aabb'` is not.\n\nYou may delete characters from `s`. A letter deleted completely no longer appears, so it no longer clashes with anything. Return the smallest number of deletions that makes `s` tidy. An empty string is already tidy.",
    explanation:
      "Only the letter counts matter, not their positions. Count each letter, then decide a final count for every letter so that all non-zero finals are different and the total reduction is as small as possible.\n\nGreedy: process the counts from largest to smallest and keep a set of counts already taken. For each count, lower it one at a time while it is positive and already taken; each step is one deletion. If it ends above zero, mark it as taken.\n\nWhy this is optimal: counts can only go down, so when two letters clash one of them must drop, and dropping it to the nearest free value below is the cheapest fix that also leaves the most room for the smaller counts still to come. Processing in descending order means a letter never needs to be revisited.\n\nA wrong shortcut is to count how many letters share a frequency and delete one character from each: `'aabbcc'` has counts 2, 2, 2 and needs 3 deletions (2, 1, 0), not 2, because lowering one letter can create a new clash.\n\nTime O(n + A^2) in the worst case for an alphabet of A = 26 letters, space O(A).",
    functionName: "min_deletions_unique_counts",
    functionSignature: "def min_deletions_unique_counts(s: str) -> int:",
    starter:
      STARTER_HEADER +
      "def min_deletions_unique_counts(s: str) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["aab"], expected: 0 },
      { input: ["aaabbbcc"], expected: 2 },
      { input: ["aabbcc"], expected: 3 },
    ],
    hiddenTests: [
      { input: [""], expected: 0 },
      { input: ["abc"], expected: 2 },
      { input: ["ceabaacb"], expected: 2 },
      { input: ["bbcebab"], expected: 2 },
      { input: ["aaaabbbbccdd"], expected: 2 },
      { input: ["abcdabcdabcd"], expected: 6 },
    ],
  },
  {
    id: "fill-the-coin-gaps",
    number: 548,
    title: "Fill the Coin Gaps",
    difficulty: "Hard",
    topic: "Greedy",
    statement:
      "Your wallet holds the coins listed in `coins` (positive integers in ascending order, repeats allowed). Each coin can be used at most once per payment. You want to be able to pay **every** whole amount from 1 to `target` exactly, with no change given.\n\nYou may add new coins of any positive values you choose (each added coin is also a single coin). Return the smallest number of coins you must add. `target >= 1`, and `coins` may be empty.",
    explanation:
      "Track `reach`: the largest number such that every amount `1..reach` can already be paid. Initially `reach = 0`.\n\nLook at the smallest amount you cannot pay yet, `reach + 1`.\n- If the next unused wallet coin `c` satisfies `c <= reach + 1`, take it. Every amount up to `reach` was payable, so now every amount up to `reach + c` is: `reach += c`.\n- Otherwise no wallet coin can help pay `reach + 1` (the remaining ones are all too big), so a coin must be added. The best coin to add is exactly `reach + 1`: any larger coin leaves `reach + 1` unpayable, and any smaller coin extends the range by less. Adding it gives `reach = 2 * reach + 1`. Count one added coin.\n\nRepeat until `reach >= target`. Wallet coins larger than what is needed are simply never used.\n\nBecause `reach` at least doubles on every added coin, the loop is short: O(len(coins) + log target) time and O(1) space. Trying subsets of coins, or building a full subset-sum table, is far slower and does not tell you which coin to add. Counting 'missing powers of two' is also wrong: with coins `[1, 3]` and target 6 only one coin (a 2) is needed.",
    functionName: "min_coin_patches",
    functionSignature: "def min_coin_patches(coins: list[int], target: int) -> int:",
    starter:
      STARTER_HEADER +
      "def min_coin_patches(coins: list[int], target: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 3], 6], expected: 1 },
      { input: [[1, 5, 10], 20], expected: 2 },
      { input: [[1, 2, 2], 5], expected: 0 },
    ],
    hiddenTests: [
      { input: [[], 7], expected: 3 },
      { input: [[2], 1], expected: 1 },
      { input: [[5, 10], 5], expected: 3 },
      { input: [[1, 2, 31, 33], 50], expected: 3 },
      { input: [[1, 2, 4, 13, 43], 100], expected: 2 },
      { input: [[3], 3], expected: 2 },
    ],
  },
  {
    id: "left-leaf-total",
    number: 549,
    title: "Left Leaf Total",
    difficulty: "Easy",
    topic: "Tree",
    statement:
      "Given the `root` of a binary tree, return the sum of the values of all **left leaves**. A left leaf is a node that has no children and is the left child of its parent.\n\nThe root is nobody's child, so a tree with a single node has no left leaves. Return 0 when there are no left leaves, including for an empty tree.\n\nExamples show each tree in level order, with `null` for a missing child.",
    explanation:
      "Whether a node counts depends on two facts: it is a leaf (which the node itself knows) and it is a left child (which only its parent knows). So pass that second fact down during the traversal.\n\nRecursive version: `walk(node, is_left)` returns 0 for `None`; returns `node.val` if the node is a leaf and `is_left` is true, 0 if it is a leaf and not a left child; otherwise returns `walk(node.left, True) + walk(node.right, False)`. Start with `walk(root, False)`.\n\nEquivalently, from each parent peek at the left child: if it exists and has no children, add its value.\n\nTypical mistakes: adding every left child (inner nodes must not count), adding every leaf (right leaves must not count), and counting a lone root.\n\nTime O(n), space O(h) for the recursion or explicit stack, where h is the height of the tree.",
    functionName: "sum_left_leaves",
    functionSignature: "def sum_left_leaves(root: Optional[TreeNode]) -> int:",
    starter:
      STARTER_HEADER +
      "# TreeNode has .val, .left, .right. Make one with TreeNode(val). Empty tree is None.\ndef sum_left_leaves(root: Optional[TreeNode]) -> int:\n    # Your code here\n    pass\n",
    structs: {"args": ["tree"]},
    examples: [
      { input: [[3, 9, 20, null, null, 15, 7]], expected: 24 },
      { input: [[1, 2, 3, 4, 5]], expected: 4 },
      { input: [[1]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1, 2]], expected: 2 },
      { input: [[1, null, 2]], expected: 0 },
      { input: [[1, 2, 3, null, 4, 5]], expected: 5 },
      { input: [[-1, -2, null, -3]], expected: -3 },
      { input: [[5, 1, 8, 7, null, 6, 9, null, null, 2]], expected: 9 },
    ],
  },
  {
    id: "prune-matching-leaves",
    number: 550,
    title: "Prune Matching Leaves",
    difficulty: "Medium",
    topic: "Tree",
    statement:
      "Given the `root` of a binary tree and an integer `target`, delete every leaf whose value equals `target`. Deleting a leaf can turn its parent into a leaf; if that parent's value also equals `target` it must be deleted too, and so on until no leaf with value `target` remains.\n\nReturn the root of the resulting tree, or `None` if every node was deleted. Nodes whose value is not `target`, and nodes that still have a child, always stay.\n\nExamples show each tree in level order, with `null` for a missing child.",
    explanation:
      "A node's fate depends on what happens to its children first, which is the signature of a post-order traversal.\n\n`prune(node)`:\n1. If `node` is `None`, return `None`.\n2. Replace `node.left` with `prune(node.left)` and `node.right` with `prune(node.right)`.\n3. Now, if the node has no children and its value is `target`, return `None` (it is deleted). Otherwise return the node.\n\nBecause the children are settled before the node is examined, the chain reaction happens by itself: a parent whose target-valued leaves were just removed is tested as a leaf on the way back up.\n\nChecking the node BEFORE recursing (pre-order) handles only the original leaves and misses parents that become leaves. Repeating a whole-tree pass until nothing changes is correct but can cost O(n * h).\n\nTime O(n), space O(h) for the recursion.",
    functionName: "remove_target_leaves",
    functionSignature: "def remove_target_leaves(root: Optional[TreeNode], target: int) -> Optional[TreeNode]:",
    starter:
      STARTER_HEADER +
      "# TreeNode has .val, .left, .right. Make one with TreeNode(val). Empty tree is None.\ndef remove_target_leaves(root: Optional[TreeNode], target: int) -> Optional[TreeNode]:\n    # Your code here\n    pass\n",
    structs: {"args": ["tree", null], "returns": "tree"},
    examples: [
      { input: [[1, 2, 3, 2, null, 2, 4], 2], expected: [1, null, 3, null, 4] },
      { input: [[1, 3, 3, 3, 2], 3], expected: [1, 3, null, null, 2] },
      { input: [[1, 2, null, 2, null, 2], 2], expected: [1] },
    ],
    hiddenTests: [
      { input: [[1, 1, 1], 1], expected: [] },
      { input: [[], 5], expected: [] },
      { input: [[3, null, 3, null, 3, 1], 3], expected: [3, null, 3, null, 3, 1] },
      { input: [[4], 5], expected: [4] },
      { input: [[2, 2, 2, null, 5], 2], expected: [2, 2, null, null, 5] },
      { input: [[7, 7, 3, 7, null, 7, 7], 7], expected: [7, null, 3] },
    ],
  },
];
