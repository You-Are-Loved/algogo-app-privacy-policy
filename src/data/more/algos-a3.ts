import type { Blind75Problem } from '../blind75';

const STARTER_HEADER = '# Write your solution below. Do not rename the function.\n';

export const problems: Blind75Problem[] = [
  {
    id: "prefix-words-of-text",
    number: 407,
    title: "Prefix Words of a Text",
    difficulty: 'Easy',
    topic: "Trie",
    statement:
      "You are given a list of non-empty lowercase strings `words` and a lowercase string `text`. Count how many entries of `words` are a **prefix** of `text`, meaning `text` starts with that entry.\n\n- An entry equal to the whole of `text` counts.\n- An entry longer than `text` never counts.\n- An entry that only appears in the middle or at the end of `text` does not count.\n- If the same string appears several times in `words`, every occurrence is counted.\n\nReturn the count. If `words` is empty, return `0`.\n\nExample: with `words = [\"a\", \"ab\", \"abc\", \"b\", \"abd\"]` and `text = \"abcde\"`, the entries `\"a\"`, `\"ab\"` and `\"abc\"` are prefixes, so the answer is `3`.",
    explanation:
      "Checking each word with `text.startswith(word)` works, but it re-reads the start of `text` once per word. A trie turns the whole list into one structure that `text` is walked through a single time.\n\nSteps:\n1. Insert every word into a trie. At the node where a word ends, keep a counter of how many words end there (a counter, not a flag, because the list may contain repeats).\n2. Start at the root and follow the characters of `text` one by one. Each time you arrive at a node, add its end-counter to the answer: every word ending there is exactly the prefix of `text` you have read so far.\n3. Stop as soon as the next character has no child node, or when `text` runs out.\n\nCommon slips: using a substring test (`word in text`) instead of a prefix test, and storing a boolean end marker so duplicates are counted once.\n\nBuilding the trie costs O(total characters in `words`); the walk costs O(len(text)). Space is O(total characters).",
    functionName: "count_prefix_words",
    functionSignature: "def count_prefix_words(words: list[str], text: str) -> int:",
    starter:
      STARTER_HEADER + "def count_prefix_words(words: list[str], text: str) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["a", "ab", "abc", "b", "abd"], "abcde"], expected: 3 },
      { input: [["go", "gone", "g", "on"], "gone"], expected: 3 },
    ],
    hiddenTests: [
      { input: [["bc", "c", "abc"], "abc"], expected: 1 },
      { input: [["a", "a", "aa", "aaa"], "aa"], expected: 3 },
      { input: [["abcd", "abcde"], "abc"], expected: 0 },
      { input: [[], "abc"], expected: 0 },
      { input: [["x", "xy", "z", "yz"], "xyz"], expected: 2 },
    ],
  },
  {
    id: "prefix-free-codes",
    number: 408,
    title: "Prefix-Free Codes",
    difficulty: 'Easy',
    topic: "Trie",
    statement:
      "A set of dial codes is only usable if no code is the beginning of another one, otherwise the shorter code would \"fire\" before the longer one could be finished.\n\nYou are given a list `codes` of non-empty strings of digits and lowercase letters. Return `True` if **no** code is a prefix of a code at a different position in the list, and `False` otherwise.\n\n- The two codes may appear in either order in the list: `[\"abc\", \"ab\"]` is just as bad as `[\"ab\", \"abc\"]`.\n- Two equal codes at different positions count as a prefix of each other, so a list with a repeated code returns `False`.\n- An empty list or a list with a single code returns `True`.\n\nExample: `[\"911\", \"97625999\", \"91125426\"]` returns `False` because `\"911\"` is a prefix of `\"91125426\"`.",
    explanation:
      "Comparing every pair with `startswith` is O(n^2) pairs. A trie finds a clash while the codes are being inserted.\n\nInsert the codes one at a time. While walking down for the current code:\n- if you pass through a node marked as the end of an earlier code *before* using up the current code, that earlier code is a prefix of this one;\n- if, after the last character, the node you stand on already has children (or is already marked as an end), then this code is a prefix of, or equal to, an earlier one.\n\nEither case means the answer is `False`. If every code is inserted without a clash, return `True`.\n\nBoth checks are needed: the first catches \"short code first, long code later\", the second catches \"long code first, short code later\" and exact repeats. Checking only neighbouring list entries is also wrong, because the two clashing codes can be far apart.\n\n(Sorting the codes and comparing neighbours in sorted order is a valid alternative in O(n log n) comparisons.)\n\nTime O(total characters), space O(total characters).",
    functionName: "is_prefix_free",
    functionSignature: "def is_prefix_free(codes: list[str]) -> bool:",
    starter:
      STARTER_HEADER + "def is_prefix_free(codes: list[str]) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["911", "97625999", "91125426"]], expected: false },
      { input: [["113", "12340", "123440", "12345", "98346"]], expected: true },
      { input: [["0", "10", "110", "111"]], expected: true },
    ],
    hiddenTests: [
      { input: [["abc", "ab"]], expected: false },
      { input: [["ab", "cd", "ab"]], expected: false },
      { input: [[]], expected: true },
      { input: [["bc", "abc", "cab"]], expected: true },
      { input: [["ab", "cd", "abcde", "ef"]], expected: false },
      { input: [["12345", "98", "123"]], expected: false },
    ],
  },
  {
    id: "trie-node-count",
    number: 409,
    title: "Trie Node Count",
    difficulty: 'Easy',
    topic: "Trie",
    statement:
      "Before building a prefix tree for a list of words you want to know how much memory it will need.\n\nGiven a list `words` of non-empty lowercase strings, return the number of nodes the trie holding all of them would have, **not counting the root**. Each node stands for one distinct non-empty prefix of at least one word, so words that share a beginning share nodes, and a word that appears twice adds nothing the second time.\n\nIf `words` is empty, return `0`.\n\nExample: `[\"cat\", \"car\", \"dog\"]` needs nodes for `c`, `ca`, `cat`, `car`, `d`, `do`, `dog`, so the answer is `7`.",
    explanation:
      "The answer is the number of distinct non-empty prefixes over all words. You could put every prefix into a set, but that copies O(L^2) characters for a word of length L. Building the trie itself counts the same thing with one step per character.\n\nSteps:\n1. Start with an empty root (a dict of children) and a counter at 0.\n2. For each word, walk from the root. For each character, if the current node has no child for it, create the child and add 1 to the counter. Move to the child.\n3. Return the counter.\n\nA node is created only the first time a prefix is seen, so shared prefixes and repeated words are never counted twice. Adding up the word lengths instead over-counts whenever two words share a beginning.\n\nTime O(total characters), space O(number of nodes).",
    functionName: "count_trie_nodes",
    functionSignature: "def count_trie_nodes(words: list[str]) -> int:",
    starter:
      STARTER_HEADER + "def count_trie_nodes(words: list[str]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["cat", "car", "dog"]], expected: 7 },
      { input: [["a", "ab", "abc"]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [["same", "same"]], expected: 4 },
      { input: [["tree", "trie", "try", "to"]], expected: 8 },
      { input: [["ab", "ba"]], expected: 4 },
      { input: [["x"]], expected: 1 },
      { input: [["abc", "abd", "ab", "b"]], expected: 5 },
    ],
  },
  {
    id: "shortest-unique-prefixes",
    number: 410,
    title: "Shortest Unique Prefixes",
    difficulty: 'Medium',
    topic: "Trie",
    statement:
      "A command-line tool lets users type just enough of a command name to identify it.\n\nYou are given a list `words` of **distinct**, non-empty lowercase strings (at least one). For each word, find its shortest non-empty prefix that is **not** a prefix of any other word in the list.\n\nIf no such prefix exists, which happens exactly when the whole word is itself a prefix of another word (like `\"app\"` next to `\"apple\"`), use the whole word as its answer.\n\nReturn the answers as a list in the same order as `words`.\n\nExample: `[\"zebra\", \"dog\", \"duck\", \"dove\"]` gives `[\"z\", \"dog\", \"du\", \"dov\"]`. `\"d\"` and `\"do\"` are shared with other words, so `\"dog\"` needs all three letters, while `\"duck\"` is identified by `\"du\"`.",
    explanation:
      "Comparing each word against every other word, prefix by prefix, costs O(n^2 * L). A trie with pass-through counts answers each word in one walk.\n\nSteps:\n1. Insert every word. On each node you step onto, increment a counter: it records how many words pass through that node, in other words how many words start with that prefix.\n2. For each word, walk down again. The first node whose counter is 1 belongs to this word alone, so the prefix ending there is the shortest unique one.\n3. If you reach the end of the word and every counter was above 1, the word is a prefix of some other word; return the whole word.\n\nThings that go wrong: comparing a word only with its neighbours in the input (the word sharing the longest prefix can be anywhere), and forgetting the fallback in step 3.\n\nTime O(total characters) to build and O(total characters) to query; space O(total characters).",
    functionName: "shortest_unique_prefixes",
    functionSignature: "def shortest_unique_prefixes(words: list[str]) -> list[str]:",
    starter:
      STARTER_HEADER + "def shortest_unique_prefixes(words: list[str]) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["zebra", "dog", "duck", "dove"]], expected: ["z", "dog", "du", "dov"] },
      { input: [["app", "apple", "bat"]], expected: ["app", "appl", "b"] },
    ],
    hiddenTests: [
      { input: [["solo"]], expected: ["s"] },
      { input: [["ab", "abc", "abcd"]], expected: ["ab", "abc", "abcd"] },
      { input: [["cart", "care", "card", "cat", "dart"]], expected: ["cart", "care", "card", "cat", "d"] },
      { input: [["a", "b", "c"]], expected: ["a", "b", "c"] },
      { input: [["dove", "zebra", "dog"]], expected: ["dov", "z", "dog"] },
      { input: [["mango", "man", "mane", "melon"]], expected: ["mang", "man", "mane", "me"] },
    ],
  },
  {
    id: "prefix-score-sums",
    number: 411,
    title: "Prefix Score Sums",
    difficulty: 'Medium',
    topic: "Trie",
    statement:
      "You are given a list `words` of non-empty lowercase strings (at least one; the same string may appear more than once).\n\nThe **score** of a string `p` is the number of entries in `words` that start with `p`. Every entry counts separately, including repeats, and a word starts with itself.\n\nFor each word, add up the scores of all of its non-empty prefixes (the whole word is one of its prefixes). Return these totals as a list in the same order as `words`.\n\nExample: for `[\"abc\", \"ab\", \"bc\", \"b\"]`:\n- `\"abc\"` has prefixes `\"a\"` (score 2), `\"ab\"` (score 2), `\"abc\"` (score 1), total `5`.\n- `\"ab\"`: 2 + 2 = `4`.\n- `\"bc\"`: `\"b\"` (score 2) + `\"bc\"` (score 1) = `3`.\n- `\"b\"`: `2`.\n\nSo the answer is `[5, 4, 3, 2]`.",
    explanation:
      "Computing each prefix's score by scanning the whole list is O(n) per prefix and far too slow when there are many long words. A trie stores every score once.\n\nSteps:\n1. Insert each word (each occurrence, not each distinct word). Every node you step onto gets its counter incremented, so a node's counter is exactly the score of the prefix that leads to it.\n2. For each word, walk down the trie again and add up the counters of the nodes on its path. That sum is the word's answer.\n\nBecause both passes handle each character once, the total time is O(total characters) and the space is O(total characters).\n\nThe usual mistake is to deduplicate the words first: a repeated word must raise the scores of its prefixes each time it appears.",
    functionName: "prefix_score_sums",
    functionSignature: "def prefix_score_sums(words: list[str]) -> list[int]:",
    starter:
      STARTER_HEADER + "def prefix_score_sums(words: list[str]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["abc", "ab", "bc", "b"]], expected: [5, 4, 3, 2] },
      { input: [["abcd"]], expected: [4] },
    ],
    hiddenTests: [
      { input: [["a", "a", "a"]], expected: [3, 3, 3] },
      { input: [["ab", "ab", "abc"]], expected: [6, 6, 7] },
      { input: [["x", "y", "z"]], expected: [1, 1, 1] },
      { input: [["aa", "aaa", "a", "b"]], expected: [5, 6, 3, 1] },
      { input: [["top", "tops", "to", "top"]], expected: [11, 12, 8, 11] },
    ],
  },
  {
    id: "longest-shared-prefix-pair",
    number: 412,
    title: "Longest Shared Prefix of Any Pair",
    difficulty: 'Medium',
    topic: "Trie",
    statement:
      "Given a list `words` of non-empty lowercase strings, look at every pair of entries at two **different positions** in the list and at the common prefix of the two (the letters they share from the start before they first differ, or before the shorter one ends).\n\nReturn the length of the longest common prefix found over all pairs.\n\n- If the best any pair can do is share nothing, return `0`.\n- If the list has fewer than two entries, return `0`.\n- Two equal strings at different positions share their full length.\n\nNote that this is about the best *pair*, not about a prefix shared by the whole list.\n\nExample: for `[\"flower\", \"flow\", \"flight\", \"dog\"]` the best pair is `\"flower\"` and `\"flow\"`, which share `\"flow\"`, so the answer is `4`.",
    explanation:
      "Testing all pairs costs O(n^2 * L). A trie lets each word find its best partner among the words inserted before it in a single walk.\n\nSteps:\n1. Keep an empty trie and `best = 0`.\n2. For each word, walk down from the root while inserting it. As long as the child for the next character already exists, you are still on a path created by an earlier word, so count one more matched character. The first time a child has to be created, the match is over (keep inserting the rest of the word, but stop counting).\n3. Update `best` with the number of matched characters.\n\nEvery pair is covered, because for any pair the later word is compared against a trie that already contains the earlier one. Comparing only neighbours in the input order, or only against the first word, misses pairs.\n\n(Alternative: sort the list; the best pair is always adjacent in sorted order.)\n\nTime O(total characters), space O(total characters).",
    functionName: "longest_shared_prefix",
    functionSignature: "def longest_shared_prefix(words: list[str]) -> int:",
    starter:
      STARTER_HEADER + "def longest_shared_prefix(words: list[str]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["flower", "flow", "flight", "dog"]], expected: 4 },
      { input: [["a", "b", "c"]], expected: 0 },
      { input: [["interview", "internet", "interval", "into"]], expected: 6 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [["solo"]], expected: 0 },
      { input: [["same", "same"]], expected: 4 },
      { input: [["car", "dog", "cart"]], expected: 3 },
      { input: [["dog", "cat", "cab", "dig"]], expected: 2 },
      { input: [["aab", "aba", "baa"]], expected: 1 },
    ],
  },
  {
    id: "remove-nested-folders",
    number: 413,
    title: "Remove Nested Folders",
    difficulty: 'Medium',
    topic: "Trie",
    statement:
      "A backup tool is given a list of folders to copy. Copying a folder copies everything inside it, so listing a folder that sits inside another listed folder is redundant.\n\nYou are given a list `paths` of **distinct** folder paths (at least one). Each path is one or more parts, each written as `/` followed by a name of lowercase letters, for example `\"/a\"` or `\"/projects/app/src\"`. There is no trailing slash.\n\nA path is **nested** if some other path in the list is one of its ancestors: `\"/a/b/c\"` is nested under `\"/a\"` and under `\"/a/b\"`. Names must match as whole parts, so `\"/a/bc\"` is **not** inside `\"/a/b\"`.\n\nReturn the paths that are not nested, in the same relative order as they appear in `paths`.\n\nExample: `[\"/a\", \"/a/b\", \"/c/d\", \"/c/d/e\", \"/c/f\"]` returns `[\"/a\", \"/c/d\", \"/c/f\"]`.",
    explanation:
      "Checking each path against every other path is O(n^2). A trie keyed by folder *names* (not single characters) does it in one pass over the parts.\n\nSteps:\n1. Split each path on `/` and insert its list of names into a trie; mark the last node as \"a listed folder ends here\".\n2. For each path, walk its names again but stop before the last one. If any node on the way is marked, an ancestor is listed and the path is nested. Otherwise keep it.\n3. Output the kept paths in input order.\n\nTwo traps:\n- A plain string prefix test says `\"/a/bc\"` starts with `\"/a/b\"`. Working with whole names (or testing for `ancestor + \"/\"`) avoids that.\n- The ancestor may come *after* its descendant in the input, so you cannot decide while inserting; build the whole trie first (or sort first).\n\nTime O(total characters), space O(total characters).",
    functionName: "remove_nested_folders",
    functionSignature: "def remove_nested_folders(paths: list[str]) -> list[str]:",
    starter:
      STARTER_HEADER + "def remove_nested_folders(paths: list[str]) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["/a", "/a/b", "/c/d", "/c/d/e", "/c/f"]], expected: ["/a", "/c/d", "/c/f"] },
      { input: [["/a/b", "/a/bc", "/a/b/c"]], expected: ["/a/b", "/a/bc"] },
    ],
    hiddenTests: [
      { input: [["/x/y/z", "/x", "/q"]], expected: ["/x", "/q"] },
      { input: [["/home"]], expected: ["/home"] },
      { input: [["/a/b/c", "/a/b/d", "/a/c"]], expected: ["/a/b/c", "/a/b/d", "/a/c"] },
      { input: [["/ab", "/a", "/abc/d", "/a/b"]], expected: ["/ab", "/a", "/abc/d"] },
      { input: [["/a/b/c/d", "/a/b", "/a"]], expected: ["/a"] },
      { input: [["/data/logs/app", "/data/log", "/data/logs", "/dat"]], expected: ["/data/log", "/data/logs", "/dat"] },
    ],
  },
  {
    id: "one-letter-off",
    number: 414,
    title: "One Letter Off",
    difficulty: 'Medium',
    topic: "Trie",
    statement:
      "A spell checker knows the words in `dictionary` (distinct, non-empty lowercase strings; the list may be empty). For each string in `queries` (non-empty, lowercase) decide whether it is exactly **one substitution** away from a dictionary word.\n\nA query matches if you can pick exactly one position in it, replace the letter there with a *different* letter, and obtain a word in `dictionary`. Letters cannot be inserted or removed, so the query and the word have the same length and differ in exactly one position.\n\nA query that is itself in the dictionary does not match on that basis: zero changes is not one change. It still matches if some *other* dictionary word differs from it in exactly one position.\n\nReturn a list of booleans, one per query, in the same order.\n\nExample: with `dictionary = [\"stone\", \"plane\"]` and `queries = [\"store\", \"stone\", \"plain\", \"plans\"]` the answer is `[True, False, False, True]`: `\"store\"` becomes `\"stone\"` by changing one letter, `\"stone\"` would need zero changes, `\"plain\"` differs from `\"plane\"` in two positions, and `\"plans\"` differs in one.",
    explanation:
      "For each query you could compare against every dictionary word of the same length, O(n * L) per query. A trie prunes that: branches that have already used up their one allowed mismatch die as soon as a second letter disagrees.\n\nSteps:\n1. Insert the dictionary into a trie with end-of-word markers.\n2. For a query, run a depth-first search with the state (node, position, changed?):\n   - at the end of the query, succeed only if the node is the end of a word **and** `changed` is true;\n   - otherwise try each child: if its letter equals the query letter, continue with the same `changed`; if it differs and nothing has been changed yet, continue with `changed = True`; if it differs and a change was already used, skip that child.\n\nRequiring `changed` to be true at the end is what separates \"exactly one\" from \"at most one\", and it is the detail most often missed.\n\nEach query visits at most O(26 * L) nodes on the unchanged path plus the single-mismatch branches; in practice it is close to O(L) per branch. Space is O(total dictionary characters).",
    functionName: "one_letter_off",
    functionSignature: "def one_letter_off(dictionary: list[str], queries: list[str]) -> list[bool]:",
    starter:
      STARTER_HEADER + "def one_letter_off(dictionary: list[str], queries: list[str]) -> list[bool]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["stone", "plane"], ["store", "stone", "plain", "plans"]], expected: [true, false, false, true] },
      { input: [["cat", "cot"], ["cat", "cut", "dog", "ca"]], expected: [true, true, false, false] },
    ],
    hiddenTests: [
      { input: [["a"], ["a", "b"]], expected: [false, true] },
      { input: [[], ["abc"]], expected: [false] },
      { input: [["abc", "abd", "xbc"], ["abc", "abd", "xbd", "abcd", "xyc"]], expected: [true, true, true, false, true] },
      { input: [["ab"], ["ba", "aa", "bb", "abc", "a"]], expected: [false, true, true, false, false] },
      { input: [["hello", "hallo", "jelly"], ["hello", "hxllo", "hexlo", "jello", "jelly"]], expected: [true, true, true, true, false] },
    ],
  },
  {
    id: "compound-words",
    number: 415,
    title: "Compound Words",
    difficulty: 'Hard',
    topic: "Trie",
    statement:
      "You are given a list `words` of **distinct**, non-empty lowercase strings (at least one).\n\nA word is a **compound** if it can be written as two or more words from the list placed end to end with nothing left over. The pieces must come from the same list, the same piece may be used more than once, and there is no limit on the number of pieces. A word is never a compound of just itself.\n\nReturn every compound word, in the same relative order as in `words`. If there are none, return an empty list.\n\nExample: for `[\"cat\", \"cats\", \"catsdogcats\", \"dog\", \"dogcatsdog\", \"rat\", \"ratcatdogcat\"]` the answer is `[\"catsdogcats\", \"dogcatsdog\", \"ratcatdogcat\"]`, because `\"catsdogcats\"` = `cats + dog + cats`, `\"dogcatsdog\"` = `dog + cats + dog` and `\"ratcatdogcat\"` = `rat + cat + dog + cat`.",
    explanation:
      "Two shortcuts fail here. Trying only splits into two pieces misses words made of three or more. Greedily cutting off the longest (or the shortest) matching piece fails too: with `[\"ab\", \"abc\", \"cd\", \"abcd\"]`, taking `\"abc\"` first leaves `\"d\"`, although `ab + cd` works. Every cut point has to be considered, and that is a reachability search over positions.\n\nSteps:\n1. Insert all words into a trie with end markers.\n2. For each word of length `n`, keep `reach[i]` = \"the first `i` characters can be written as a sequence of list words\". `reach[0]` is true.\n3. For every reachable position `i`, walk the trie from the root along `word[i:]`. Each end marker met after reading up to position `j` means a list word matches `word[i..j]`, so set `reach[j + 1]`. Skip the single case `i == 0` and `j == n - 1`: that is the word matching itself as one piece.\n4. The word is a compound when `reach[n]` is true.\n\nSince the words are distinct, excluding the whole-word piece guarantees at least two pieces. The trie walk stops the moment no word continues the current path, which is what makes it faster than testing every substring against a set.\n\nTime is O(L^2) per word of length L in the worst case, O(total characters) space.",
    functionName: "compound_words",
    functionSignature: "def compound_words(words: list[str]) -> list[str]:",
    starter:
      STARTER_HEADER + "def compound_words(words: list[str]) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["cat", "cats", "catsdogcats", "dog", "dogcatsdog", "rat", "ratcatdogcat"]], expected: ["catsdogcats", "dogcatsdog", "ratcatdogcat"] },
      { input: [["a", "b", "ab", "abc"]], expected: ["ab"] },
    ],
    hiddenTests: [
      { input: [["ab", "abc", "cd", "abcd"]], expected: ["abcd"] },
      { input: [["a", "ab", "c", "abc"]], expected: ["abc"] },
      { input: [["a", "aa", "aaa"]], expected: ["aa", "aaa"] },
      { input: [["one", "two"]], expected: [] },
      { input: [["no", "on", "noon", "onno", "nono", "n", "noo"]], expected: ["noon", "onno", "nono"] },
      { input: [["in", "to", "out", "intoout", "outinto", "input", "outoutout"]], expected: ["intoout", "outinto", "outoutout"] },
    ],
  },
  {
    id: "prefix-and-suffix-lookup",
    number: 416,
    title: "Prefix and Suffix Lookup",
    difficulty: 'Hard',
    topic: "Trie",
    statement:
      "You are given a list `words` of non-empty lowercase strings (at least one; repeats are allowed) and a list `queries`. Each query is a pair `[prefix, suffix]` of non-empty lowercase strings.\n\nFor each query, find the **largest index** `i` such that `words[i]` starts with `prefix` **and** ends with `suffix`. If no word qualifies, the answer for that query is `-1`.\n\nThe prefix and the suffix are checked independently, so they are allowed to overlap inside the word: the word `\"a\"` starts with `\"a\"` and ends with `\"a\"`, and `\"aba\"` matches the query `[\"ab\", \"ba\"]`.\n\nReturn the answers as a list, one per query, in order.\n\nExample: with `words = [\"apple\", \"ample\", \"angle\"]` and `queries = [[\"a\", \"e\"], [\"ap\", \"le\"], [\"am\", \"ple\"], [\"b\", \"e\"]]` the answer is `[2, 0, 1, -1]`. All three words match the first query, and index `2` is the largest.",
    explanation:
      "Scanning all words for every query is O(n * L) per query. A trie handles prefixes well, but a second, separate trie for suffixes would leave you intersecting two sets of indices. The trick is to fold both conditions into one key.\n\nFor a word `w`, build the keys `s + \"{\" + w` for every suffix `s` of `w` (`\"{\"` is just a separator that is not a lowercase letter). For `\"apple\"` these are `\"apple{apple\"`, `\"pple{apple\"`, `\"ple{apple\"`, `\"le{apple\"`, `\"e{apple\"`. A word starts with `prefix` and ends with `suffix` exactly when one of its keys starts with `suffix + \"{\" + prefix`.\n\nSteps:\n1. Insert every key of every word into a trie, in index order. On each node you pass, store the current word index, overwriting what was there. Later words overwrite earlier ones, so each node ends up holding the largest index among words whose key passes through it.\n2. For a query, walk the trie along `suffix + \"{\" + prefix`. If the walk falls off, answer `-1`; otherwise answer the index stored on the final node.\n\nOverlap needs no special handling, because the suffix part and the prefix part are matched against separate copies of the word.\n\nBuilding costs O(L^2) per word of length L (L keys of length up to 2L + 1); each query costs O(len(prefix) + len(suffix)). Space is O(sum of L^2).",
    functionName: "prefix_suffix_lookup",
    functionSignature: "def prefix_suffix_lookup(words: list[str], queries: list[list[str]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def prefix_suffix_lookup(words: list[str], queries: list[list[str]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["apple", "ample", "angle"], [["a", "e"], ["ap", "le"], ["am", "ple"], ["b", "e"]]], expected: [2, 0, 1, -1] },
      { input: [["a", "aba", "a"], [["a", "a"], ["ab", "ba"], ["aba", "aba"], ["abab", "a"]]], expected: [2, 1, 1, -1] },
    ],
    hiddenTests: [
      { input: [["test", "toast", "tent", "test"], [["t", "t"], ["te", "st"], ["to", "st"], ["te", "nt"], ["test", "test"], ["tes", "ast"]]], expected: [3, 3, 1, 2, 3, -1] },
      { input: [["abc"], [["abc", "abc"], ["abc", "c"], ["abcd", "c"], ["a", "bcd"], ["b", "c"]]], expected: [0, 0, -1, -1, -1] },
      { input: [["x", "xx", "xxx"], [["x", "x"], ["xx", "xx"], ["xxx", "x"], ["xxxx", "x"]]], expected: [2, 2, 2, -1] },
      { input: [["banana", "bandana", "band"], [["ban", "a"], ["band", "d"], ["b", "na"], ["band", "ana"], ["an", "a"]]], expected: [1, 2, 1, 1, -1] },
      { input: [["aba", "ab", "b"], [["a", "a"], ["a", "b"], ["b", "b"], ["ab", "ab"], ["ba", "a"]]], expected: [0, 1, 2, 1, -1] },
    ],
  },
  {
    id: "no-adjacent-ones",
    number: 417,
    title: "Bit Strings Without Adjacent Ones",
    difficulty: 'Easy',
    topic: "Backtracking",
    statement:
      "Given an integer `n` (`1 <= n <= 10`), return every string of length `n` made of the characters `'0'` and `'1'` that never has two `'1'`s next to each other.\n\nReturn the strings in ascending lexicographic order, where `'0'` comes before `'1'` (this is the same as ascending order of the binary numbers they spell).\n\nExample: for `n = 3` the answer is `[\"000\", \"001\", \"010\", \"100\", \"101\"]`. The strings `\"011\"`, `\"110\"` and `\"111\"` are left out because they contain `\"11\"`.",
    explanation:
      "Generating all `2^n` strings and filtering works for small `n` but wastes effort on strings that were already doomed after two characters. Backtracking builds only the valid ones.\n\nSteps:\n1. Keep the string built so far.\n2. If it has length `n`, record it.\n3. Otherwise first try appending `'0'` (always allowed) and recurse; then, only if the string is empty or its last character is `'0'`, try appending `'1'` and recurse. Undo each choice after returning.\n\nTrying `'0'` before `'1'` at every position makes the results come out already sorted, so no final sort is needed.\n\nThe number of valid strings follows the Fibonacci sequence (2, 3, 5, 8, ...), so the output size, and the running time, is O(n * F(n)), far below O(n * 2^n). Extra space is O(n) for the recursion.",
    functionName: "no_adjacent_ones",
    functionSignature: "def no_adjacent_ones(n: int) -> list[str]:",
    starter:
      STARTER_HEADER + "def no_adjacent_ones(n: int) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [1], expected: ["0", "1"] },
      { input: [3], expected: ["000", "001", "010", "100", "101"] },
    ],
    hiddenTests: [
      { input: [2], expected: ["00", "01", "10"] },
      { input: [4], expected: ["0000", "0001", "0010", "0100", "0101", "1000", "1001", "1010"] },
      { input: [5], expected: ["00000", "00001", "00010", "00100", "00101", "01000", "01001", "01010", "10000", "10001", "10010", "10100", "10101"] },
      { input: [6], expected: ["000000", "000001", "000010", "000100", "000101", "001000", "001001", "001010", "010000", "010001", "010010", "010100", "010101", "100000", "100001", "100010", "100100", "100101", "101000", "101001", "101010"] },
    ],
  },
  {
    id: "letter-case-variants",
    number: 418,
    title: "Letter Case Variants",
    difficulty: 'Easy',
    topic: "Backtracking",
    statement:
      "You are given a string `s` of at most 8 characters made of English letters (either case) and digits. Each letter can be written in lowercase or uppercase; digits stay as they are and every character keeps its position.\n\nReturn every different string that can be produced this way. The list may be in any order, but it must contain each variant exactly once.\n\n- A string with no letters has exactly one variant, itself. In particular `\"\"` returns `[\"\"]`.\n- The case of the letters in the input does not matter: `\"aB\"` and `\"Ab\"` produce the same four variants.\n\nExample: `\"a1b\"` returns `[\"a1b\", \"a1B\", \"A1b\", \"A1B\"]` (in any order).",
    explanation:
      "Each letter is an independent two-way choice, so a string with `k` letters has `2^k` variants. Backtracking walks the string once per branch and makes that choice at every letter.\n\nSteps:\n1. Recurse on the position `i` with the characters chosen so far.\n2. When `i` reaches the end, join and record the string.\n3. If `s[i]` is a letter, branch twice: append its lowercase form and recurse, undo, then append its uppercase form and recurse, undo.\n4. If `s[i]` is a digit, append it and recurse (one branch only).\n\nTypical mistakes: branching on digits too (which produces duplicates), or only flipping one letter at a time, which yields `k + 1` strings instead of `2^k`.\n\nTime and output size are O(n * 2^k); recursion depth is O(n).",
    functionName: "letter_case_variants",
    functionSignature: "def letter_case_variants(s: str) -> list[str]:",
    starter:
      STARTER_HEADER + "def letter_case_variants(s: str) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["a1b"], expected: ["a1b", "a1B", "A1b", "A1B"] },
      { input: ["42"], expected: ["42"] },
    ],
    hiddenTests: [
      { input: [""], expected: [""] },
      { input: ["Z"], expected: ["z", "Z"] },
      { input: ["aB"], expected: ["ab", "aB", "Ab", "AB"] },
      { input: ["c3po"], expected: ["c3po", "c3pO", "c3Po", "c3PO", "C3po", "C3pO", "C3Po", "C3PO"] },
      { input: ["7x7y"], expected: ["7x7y", "7x7Y", "7X7y", "7X7Y"] },
    ],
    compare: 'unordered',
  },
  {
    id: "step-sequences",
    number: 419,
    title: "Staircase Step Sequences",
    difficulty: 'Easy',
    topic: "Backtracking",
    statement:
      "You climb a staircase of `n` steps (`1 <= n <= 12`), taking either `1` or `2` steps at a time. Instead of counting the ways, list them.\n\nReturn every sequence of moves (each move is `1` or `2`) whose total is exactly `n`. The order of the moves matters, so `[1, 2]` and `[2, 1]` are different sequences.\n\nReturn the sequences in ascending lexicographic order: compare two sequences move by move from the start, and at the first move where they differ the one with the `1` comes first.\n\nExample: for `n = 3` the answer is `[[1, 1, 1], [1, 2], [2, 1]]`.",
    explanation:
      "Counting the ways is a simple recurrence, but listing them means actually walking every path, which is what backtracking does.\n\nSteps:\n1. Keep the list of moves made so far and the number of steps still to climb.\n2. If nothing is left, record a copy of the moves.\n3. Otherwise try a move of `1`, recurse, undo; then, if at least 2 steps remain, try a move of `2`, recurse, undo.\n\nAlways trying `1` before `2` produces the sequences in lexicographic order directly. Remember to store a *copy* of the current list; storing the list itself leaves you with many references to one list that ends up empty.\n\nThe number of sequences is the Fibonacci number F(n + 1), so time and output size are O(n * F(n)); the recursion uses O(n) extra space.",
    functionName: "step_sequences",
    functionSignature: "def step_sequences(n: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def step_sequences(n: int) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [3], expected: [[1, 1, 1], [1, 2], [2, 1]] },
      { input: [1], expected: [[1]] },
      { input: [4], expected: [[1, 1, 1, 1], [1, 1, 2], [1, 2, 1], [2, 1, 1], [2, 2]] },
    ],
    hiddenTests: [
      { input: [2], expected: [[1, 1], [2]] },
      { input: [5], expected: [[1, 1, 1, 1, 1], [1, 1, 1, 2], [1, 1, 2, 1], [1, 2, 1, 1], [1, 2, 2], [2, 1, 1, 1], [2, 1, 2], [2, 2, 1]] },
      { input: [6], expected: [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 2], [1, 1, 1, 2, 1], [1, 1, 2, 1, 1], [1, 1, 2, 2], [1, 2, 1, 1, 1], [1, 2, 1, 2], [1, 2, 2, 1], [2, 1, 1, 1, 1], [2, 1, 1, 2], [2, 1, 2, 1], [2, 2, 1, 1], [2, 2, 2]] },
      { input: [7], expected: [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 2, 1], [1, 1, 1, 2, 1, 1], [1, 1, 1, 2, 2], [1, 1, 2, 1, 1, 1], [1, 1, 2, 1, 2], [1, 1, 2, 2, 1], [1, 2, 1, 1, 1, 1], [1, 2, 1, 1, 2], [1, 2, 1, 2, 1], [1, 2, 2, 1, 1], [1, 2, 2, 2], [2, 1, 1, 1, 1, 1], [2, 1, 1, 1, 2], [2, 1, 1, 2, 1], [2, 1, 2, 1, 1], [2, 1, 2, 2], [2, 2, 1, 1, 1], [2, 2, 1, 2], [2, 2, 2, 1]] },
    ],
  },
  {
    id: "distinct-subsets",
    number: 420,
    title: "Distinct Subsets With Repeats",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "You are given a list `nums` of up to 10 integers that **may contain repeated values**. Return every distinct collection of values that can be formed by choosing some of the elements (possibly none, possibly all).\n\nTwo choices that end up with the same values the same number of times are the same collection and must be reported only once. For `[1, 2, 2]`, picking the first `2` or the second `2` both give `[1, 2]`, which appears once in the answer, while `[2, 2]` is a different collection.\n\nWrite each collection with its values in ascending order. The collections themselves may be returned in any order. The empty collection `[]` is always part of the answer, so an empty `nums` returns `[[]]`.\n\nExample: `[1, 2, 2]` returns `[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]` (in any order).",
    explanation:
      "Plain subset generation treats equal values at different positions as different and reports duplicates. Generating everything and deduplicating afterwards works but does exponentially more work when there are many repeats. Sorting first lets the search skip duplicate branches as it goes.\n\nSteps:\n1. Sort `nums`, so equal values are adjacent and every collection is built in ascending order.\n2. Recurse with a `start` index and the current collection. Record a copy of the current collection on entry (every node of the search tree is an answer).\n3. Loop `i` from `start` to the end. If `i > start` and `nums[i] == nums[i - 1]`, skip it: at this depth that value has already been tried as the next element. Otherwise append `nums[i]`, recurse with `i + 1`, and pop.\n\nThe condition is `i > start`, not `i > 0`: the same value may be used again deeper in the recursion (that is how `[2, 2]` is produced), it just must not be tried twice as the choice for the same slot.\n\nReducing `nums` to its set of values is wrong, since it loses collections such as `[2, 2]`.\n\nTime O(n * 2^n) in the worst case (all values distinct), space O(n) besides the output.",
    functionName: "distinct_subsets",
    functionSignature: "def distinct_subsets(nums: list[int]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def distinct_subsets(nums: list[int]) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 2]], expected: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
      { input: [[0]], expected: [[], [0]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [[]] },
      { input: [[2, 2, 2]], expected: [[], [2], [2, 2], [2, 2, 2]] },
      { input: [[3, 1, 3]], expected: [[], [1], [1, 3], [1, 3, 3], [3], [3, 3]] },
      { input: [[1, 2, 3]], expected: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
      { input: [[4, 4, 1, 1]], expected: [[], [1], [1, 1], [1, 1, 4], [1, 1, 4, 4], [1, 4], [1, 4, 4], [4], [4, 4]] },
      { input: [[-1, -1, 2]], expected: [[], [-1], [-1, -1], [-1, -1, 2], [-1, 2], [2]] },
    ],
    compare: 'unordered',
  },
  {
    id: "single-use-combinations",
    number: 421,
    title: "Single-Use Combination Sum",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "You have a handful of coins with the values listed in `candidates` (positive integers, at most 12 of them, values may repeat) and want to pay exactly `target` (a positive integer).\n\nEach coin can be used **at most once**. If the list contains the value `1` twice you may use two `1`s, but not three.\n\nReturn every distinct combination of coin values that adds up to exactly `target`. Two combinations are the same if they use the same values the same number of times, no matter which physical coins were picked, and each must be reported only once.\n\nWrite each combination with its values in ascending order. The combinations may be returned in any order. If no combination works, return an empty list.\n\nExample: `candidates = [10, 1, 2, 7, 6, 1, 5]`, `target = 8` returns `[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]` (in any order).",
    explanation:
      "This differs from the classic \"unlimited reuse\" combination sum in two ways: an index can be used only once, and equal values in the input must not create duplicate answers.\n\nSteps:\n1. Sort `candidates`.\n2. Recurse with a `start` index, the remaining amount and the current combination. When the remaining amount is 0, record a copy.\n3. Loop `i` from `start`:\n   - if `candidates[i]` is larger than the remaining amount, stop the loop (everything after it is larger too);\n   - if `i > start` and `candidates[i] == candidates[i - 1]`, skip it, because this value was already tried for this slot;\n   - otherwise choose it and recurse with `i + 1` (not `i`, since each coin is single-use), then undo.\n\nRecursing with `i` instead of `i + 1` silently turns this into the reuse version, and dropping the duplicate skip reports `[1, 7]` twice in the example.\n\nWorst case O(2^n) combinations are explored, each copied in O(n); the pruning in step 3 cuts most of that in practice. Extra space is O(n).",
    functionName: "single_use_combinations",
    functionSignature: "def single_use_combinations(candidates: list[int], target: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def single_use_combinations(candidates: list[int], target: int) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[10, 1, 2, 7, 6, 1, 5], 8], expected: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] },
      { input: [[2, 5, 2, 1, 2], 5], expected: [[1, 2, 2], [5]] },
    ],
    hiddenTests: [
      { input: [[3, 3], 3], expected: [[3]] },
      { input: [[2, 4], 3], expected: [] },
      { input: [[1, 1, 1, 1], 2], expected: [[1, 1]] },
      { input: [[5, 3, 2, 8, 1], 8], expected: [[1, 2, 5], [3, 5], [8]] },
      { input: [[3, 5], 6], expected: [] },
      { input: [[2, 2, 2], 4], expected: [[2, 2]] },
    ],
    compare: 'unordered',
  },
  {
    id: "digit-combos-for-total",
    number: 422,
    title: "Digit Combos for a Total",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "A combination lock uses the digits `1` to `9` (there is no `0`). Find every way to pick exactly `k` **different** digits whose sum is exactly `total`.\n\nGiven `k` (`1 <= k <= 9`) and `total` (`1 <= total <= 60`), return all such picks. Write each pick with its digits in ascending order, and return the picks in ascending lexicographic order (compare the first digits, then the second digits, and so on).\n\nIf no pick works, return an empty list.\n\nExample: `k = 3`, `total = 9` returns `[[1, 2, 6], [1, 3, 5], [2, 3, 4]]`.",
    explanation:
      "There are only 512 subsets of nine digits, so brute force would pass, but backtracking with pruning shows the general technique and produces the required order for free.\n\nSteps:\n1. Recurse with the smallest digit still allowed (`start`), the amount still needed, and the digits picked so far.\n2. If `k` digits have been picked, record a copy when the needed amount is exactly 0, and return either way.\n3. Otherwise loop `d` from `start` to 9. If `d` is larger than what is still needed, stop the loop. Otherwise pick `d`, recurse with `start = d + 1` and the reduced amount, then undo.\n\nAlways moving `start` past the digit just chosen keeps the digits distinct and ascending, and trying digits in increasing order emits the picks in lexicographic order.\n\nMistakes to avoid: recursing with `start = d` (allows a digit twice), starting from 0, and recording a pick as soon as the sum is reached without checking that exactly `k` digits were used.\n\nAt most C(9, k) picks are visited, so time is O(C(9, k) * k); extra space is O(k).",
    functionName: "digit_combos",
    functionSignature: "def digit_combos(k: int, total: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def digit_combos(k: int, total: int) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [3, 7], expected: [[1, 2, 4]] },
      { input: [3, 9], expected: [[1, 2, 6], [1, 3, 5], [2, 3, 4]] },
      { input: [2, 18], expected: [] },
    ],
    hiddenTests: [
      { input: [2, 10], expected: [[1, 9], [2, 8], [3, 7], [4, 6]] },
      { input: [9, 45], expected: [[1, 2, 3, 4, 5, 6, 7, 8, 9]] },
      { input: [4, 30], expected: [[6, 7, 8, 9]] },
      { input: [2, 17], expected: [[8, 9]] },
      { input: [4, 12], expected: [[1, 2, 3, 6], [1, 2, 4, 5]] },
      { input: [1, 10], expected: [] },
    ],
  },
  {
    id: "most-distinct-pieces",
    number: 423,
    title: "Most Distinct Pieces",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "You are given a non-empty lowercase string `s` of at most 12 characters. Cut it into contiguous, non-empty pieces so that the pieces, read in order, spell `s` again and **no two pieces are equal**.\n\nReturn the largest number of pieces such a cut can have. Leaving `s` uncut is always allowed and counts as 1 piece.\n\nExample: `\"ababccc\"` can be cut into `\"a\"`, `\"b\"`, `\"ab\"`, `\"c\"`, `\"cc\"`, which is 5 pieces, and no valid cut has more, so the answer is `5`. A cut like `\"a\"`, `\"b\"`, `\"a\"`, ... is not allowed because `\"a\"` would appear twice.\n\nExample: `\"aa\"` returns `1`, since the only 2-piece cut repeats `\"a\"`.",
    explanation:
      "A greedy rule (\"always cut off the shortest piece not used yet\") looks right but is not: taking a short piece now can use up exactly the string a later position needed. The choices interact, so every cut has to be explored, with the set of used pieces carried along.\n\nSteps:\n1. Recurse on the position `i` where the next piece starts, with a set of the pieces used so far.\n2. If `i` is the end of the string, the number of used pieces is a candidate answer.\n3. Otherwise, for every end `j > i`, take `piece = s[i:j]`. If it is not in the set, add it, recurse from `j`, and remove it again.\n\nPruning: even if every remaining character became its own piece, you could reach at most `len(used) + (len(s) - i)` pieces. If that is not more than the best found so far, abandon the branch.\n\nThere are `2^(n-1)` ways to cut a string of length `n`, so the worst case is O(n * 2^n), which is fine for `n <= 12`. Extra space is O(n).",
    functionName: "max_distinct_pieces",
    functionSignature: "def max_distinct_pieces(s: str) -> int:",
    starter:
      STARTER_HEADER + "def max_distinct_pieces(s: str) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["ababccc"], expected: 5 },
      { input: ["aba"], expected: 2 },
      { input: ["aa"], expected: 1 },
    ],
    hiddenTests: [
      { input: ["a"], expected: 1 },
      { input: ["aaaa"], expected: 2 },
      { input: ["aabaa"], expected: 3 },
      { input: ["wwwzfvedwfvh"], expected: 9 },
      { input: ["aaaaaaaaaaaa"], expected: 4 },
      { input: ["aaba"], expected: 3 },
    ],
  },
  {
    id: "gem-mine-haul",
    number: 424,
    title: "Gem Mine Haul",
    difficulty: 'Medium',
    topic: "Backtracking",
    statement:
      "A mine is a rectangular `grid` (at least one cell) where `grid[r][c]` is the number of gems in that chamber; `0` means the chamber is solid rock.\n\nA miner picks any chamber with gems as the starting point, collects everything there, and then repeatedly moves one cell up, down, left or right. The miner may never enter a rock cell (`0`), never leave the grid, and never enter the same chamber twice. The trip can stop at any time.\n\nReturn the largest total number of gems one trip can collect. If every cell is `0`, return `0`.\n\nThe grid has at most 5 rows and 5 columns and at most 12 chambers with gems.\n\nExample: for\n\n`[[0, 6, 0], [5, 8, 7], [0, 9, 0]]`\n\nthe best trip is `9 -> 8 -> 7`, collecting `24`.",
    explanation:
      "The \"never enter a chamber twice\" rule means the best continuation from a cell depends on which cells were already used, so there is no simple DP over cells, and a greedy walk (start at the richest chamber, always step to the richest neighbour) can strand the miner away from a long rich path. With few gem cells, try every path.\n\nSteps:\n1. For every cell with gems, start a depth-first search there.\n2. In the search, add the cell's gems to the running total and update the best answer.\n3. Mark the cell as visited (setting it to 0 temporarily is the easiest way), recurse into each of the four neighbours that is inside the grid and non-zero, then restore the cell's value so other paths can use it.\n\nRestoring on the way back is the backtracking step; forgetting it makes later searches see a damaged grid.\n\nEach path can branch at most 3 ways after the first move, so the cost is roughly O(k * 3^k) for `k` gem cells in the worst case, small for the limits here. Extra space is O(k) for the recursion.",
    functionName: "max_gem_haul",
    functionSignature: "def max_gem_haul(grid: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def max_gem_haul(grid: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[0, 6, 0], [5, 8, 7], [0, 9, 0]]], expected: 24 },
      { input: [[[1, 0, 7], [2, 0, 6], [3, 4, 5], [0, 3, 0], [9, 0, 20]]], expected: 28 },
    ],
    hiddenTests: [
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[2, 10, 3], [0, 0, 3], [0, 0, 3]]], expected: 21 },
      { input: [[[10, 0, 1], [0, 0, 0], [1, 0, 2]]], expected: 10 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 45 },
      { input: [[[0, 1, 7], [4, 9, 4], [1, 0, 9]]], expected: 35 },
      { input: [[[4, 4, 6], [0, 2, 0], [7, 8, 4]]], expected: 27 },
    ],
  },
  {
    id: "operator-expressions",
    number: 425,
    title: "Operators Between Digits",
    difficulty: 'Hard',
    topic: "Backtracking",
    statement:
      "You are given a string `digits` of 1 to 8 decimal digits and an integer `target`. Between each pair of neighbouring digits you may insert `+`, `-`, `*`, or nothing at all (which glues the digits into one longer number). The digits stay in their original order and nothing may be placed before the first digit.\n\nReturn every expression built this way whose value equals `target`.\n\n- `*` is applied before `+` and `-`, as in normal arithmetic: `2+3*2` is `8`.\n- A number in the expression may not have a leading zero, so `\"05\"` is not allowed as a number, but a single `\"0\"` is fine.\n- Inserting nothing anywhere is allowed: the expression is then just `digits` itself (when it has no leading zero).\n- Expressions are written without spaces.\n\nThe expressions may be returned in any order. If there are none, return an empty list.\n\nExample: `digits = \"105\"`, `target = 5` returns `[\"1*0+5\", \"10-5\"]` (in any order). `\"1*05\"` is not allowed because of the leading zero.",
    explanation:
      "There are 4 choices in each of the `n - 1` gaps, so up to `4^(n-1)` expressions. Building each one as a string and then evaluating it works but is slow and clumsy; the neat part of this problem is evaluating *while* building, despite operator precedence.\n\nCarry two numbers through the recursion: `value`, the value of the expression so far, and `last`, the last additive term in it (the product chain at the end, with its sign).\n\nSteps:\n1. At position `i`, try every number `digits[i:j]`. Stop extending as soon as the piece would be longer than one digit and starts with `'0'`.\n2. For the very first number there is no operator: `value = last = num`.\n3. Otherwise branch three ways:\n   - `+num`: `value + num`, `last = num`\n   - `-num`: `value - num`, `last = -num`\n   - `*num`: the multiplication binds to the previous term, so take that term back out and put the product in: `value - last + last * num`, `last = last * num`\n4. When all digits are consumed, record the expression if `value == target`.\n\nEvaluating strictly left to right (treating `1+2*3` as 9) and allowing numbers like `05` are the two classic bugs.\n\nTime O(n * 4^n) in the worst case, recursion depth O(n).",
    functionName: "operator_expressions",
    functionSignature: "def operator_expressions(digits: str, target: int) -> list[str]:",
    starter:
      STARTER_HEADER + "def operator_expressions(digits: str, target: int) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["123", 6], expected: ["1+2+3", "1*2*3"] },
      { input: ["105", 5], expected: ["1*0+5", "10-5"] },
      { input: ["232", 8], expected: ["2+3*2", "2*3+2"] },
    ],
    hiddenTests: [
      { input: ["00", 0], expected: ["0+0", "0-0", "0*0"] },
      { input: ["5", 5], expected: ["5"] },
      { input: ["12", -1], expected: ["1-2"] },
      { input: ["2345", 26], expected: ["2*3+4*5"] },
      { input: ["1005", 5], expected: ["1*0+0+5", "1*0-0+5", "1*0*0+5", "10+0-5", "10-0-5", "10*0+5"] },
      { input: ["12345", 15], expected: ["1+2+3+4+5", "1-2*3+4*5", "1*2*3+4+5", "1+23-4-5"] },
    ],
    compare: 'unordered',
  },
  {
    id: "letter-to-chunk-pattern",
    number: 426,
    title: "Letter to Chunk Pattern",
    difficulty: 'Hard',
    topic: "Backtracking",
    statement:
      "You are given a `pattern` of 1 to 8 lowercase letters and a lowercase string `s` of 1 to 16 characters. There are no separators in `s`.\n\nDecide whether each distinct letter of the pattern can be assigned a **non-empty** string so that:\n\n1. replacing every letter of `pattern` by its string and joining the results gives exactly `s`, and\n2. different letters are assigned **different** strings (the same letter always stands for the same string).\n\nReturn `True` if such an assignment exists, otherwise `False`.\n\nExample: `pattern = \"abab\"`, `s = \"redblueredblue\"` returns `True` (for instance `a = \"red\"`, `b = \"blue\"`).\n\nExample: `pattern = \"ab\"`, `s = \"aa\"` returns `False`: the only way to cut `\"aa\"` into two non-empty parts is `\"a\"` and `\"a\"`, and two different letters may not share a string.",
    explanation:
      "When the string comes with separators this is a simple two-map check. Without them, you do not know where each letter's chunk ends, so you have to guess the chunk lengths, and a wrong guess for an early letter is only discovered later. That is a backtracking search.\n\nSteps:\n1. Recurse on `(i, j)`: position `i` in the pattern and position `j` in `s`. Keep a dict `letter -> chunk` and a set of chunks already in use.\n2. If the pattern is exhausted, succeed only if `s` is exhausted too.\n3. If `pattern[i]` already has a chunk, `s` must continue with exactly that chunk at `j`; if so move on to `(i + 1, j + len(chunk))`, otherwise fail.\n4. If the letter is new, try every non-empty chunk `s[j:end]`. Skip chunks that are already assigned to another letter (this enforces rule 2). Assign, recurse, and on failure remove the assignment again.\n\nPruning: a new chunk only needs to be tried while at least one character is left for each remaining pattern letter.\n\nForgetting the \"different letters, different strings\" rule is the usual bug; it makes `(\"ab\", \"aa\")` come out `True`.\n\nThe worst case is exponential in the number of distinct letters (roughly O(n^k) chunk choices for `k` letters over a string of length `n`), fine for these limits. Extra space is O(n).",
    functionName: "matches_pattern",
    functionSignature: "def matches_pattern(pattern: str, s: str) -> bool:",
    starter:
      STARTER_HEADER + "def matches_pattern(pattern: str, s: str) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["abab", "redblueredblue"], expected: true },
      { input: ["aabb", "xyzabcxzyabc"], expected: false },
      { input: ["ab", "aa"], expected: false },
    ],
    hiddenTests: [
      { input: ["a", "anything"], expected: true },
      { input: ["aba", "catdogdog"], expected: false },
      { input: ["abc", "xy"], expected: false },
      { input: ["abba", "dogcatcatdog"], expected: true },
      { input: ["abcabc", "xyxzxyxz"], expected: true },
      { input: ["abab", "xxxx"], expected: false },
    ],
  },
  {
    id: "vowel-range-counts",
    number: 427,
    title: "Vowel Range Counts",
    difficulty: 'Easy',
    topic: "Prefix Sum",
    statement:
      "You are given a non-empty lowercase string `s` and a list of `queries`. Each query is a pair `[l, r]` with `0 <= l <= r < len(s)` and asks: how many vowels (`a`, `e`, `i`, `o`, `u`) are there in `s[l..r]`, with **both ends included**?\n\nReturn the answers as a list, one per query, in order. If `queries` is empty, return an empty list.\n\nExample: `s = \"interview\"`, `queries = [[0, 8], [0, 1], [2, 4], [5, 5]]` returns `[4, 1, 1, 0]`. The vowels sit at indices 0 (`i`), 3 (`e`), 6 (`i`) and 7 (`e`).",
    explanation:
      "Counting the vowels of each range directly costs O(length of the range) per query, which adds up to O(n * q). Precompute once and each query becomes a subtraction.\n\nSteps:\n1. Build `pre` of length `n + 1` where `pre[i]` is the number of vowels among the first `i` characters: `pre[0] = 0` and `pre[i + 1] = pre[i] + (1 if s[i] is a vowel else 0)`.\n2. The number of vowels in `s[l..r]` is `pre[r + 1] - pre[l]`: everything up to and including `r`, minus everything strictly before `l`.\n\nThe extra leading zero is what keeps the formula free of special cases when `l` is 0. The off-by-one to watch for is using `pre[r] - pre[l]`, which drops the character at `r`.\n\nTime O(n + q), space O(n).",
    functionName: "vowel_range_counts",
    functionSignature: "def vowel_range_counts(s: str, queries: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def vowel_range_counts(s: str, queries: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["interview", [[0, 8], [0, 1], [2, 4], [5, 5]]], expected: [4, 1, 1, 0] },
      { input: ["rhythm", [[0, 5], [1, 3]]], expected: [0, 0] },
    ],
    hiddenTests: [
      { input: ["a", [[0, 0]]], expected: [1] },
      { input: ["aeiou", [[0, 4], [1, 3], [4, 4], [0, 0]]], expected: [5, 3, 1, 1] },
      { input: ["programming", [[0, 10], [2, 2], [2, 5], [8, 10], [0, 1]]], expected: [3, 1, 2, 1, 0] },
      { input: ["queueing", [[0, 7], [1, 4], [3, 3], [5, 7]]], expected: [5, 4, 1, 1] },
      { input: ["xyz", []], expected: [] },
      { input: ["banana", [[1, 1], [0, 1], [1, 5], [2, 4]]], expected: [1, 1, 3, 1] },
    ],
  },
  {
    id: "savings-goal-day",
    number: 428,
    title: "Savings Goal Day",
    difficulty: 'Easy',
    topic: "Prefix Sum",
    statement:
      "A savings account starts at `0`. `deposits[i]` is the amount added on day `i + 1` (days are numbered from 1); a negative amount is a withdrawal, so the balance can go down as well as up.\n\nGiven `deposits` and a positive integer `goal`, return the number of the **first day** at the end of which the balance is at least `goal`. If the balance never reaches `goal`, return `-1` (this includes an empty `deposits`).\n\nOnly the first time matters: it makes no difference if the balance later falls back below the goal.\n\nExample: `deposits = [40, -30, 25, 20, 10]`, `goal = 50`. The balances after each day are `40, 10, 35, 55, 65`, so the answer is `4`.",
    explanation:
      "The balance after day `d` is the prefix sum of the first `d` amounts. The question is simply: which is the first prefix sum that is at least `goal`?\n\nSteps:\n1. Keep a running total starting at 0.\n2. Go through the amounts with a day counter starting at 1. Add the amount, and if the total is now at least `goal`, return the day.\n3. If the loop ends, return `-1`.\n\nBecause withdrawals are allowed, the prefix sums are not increasing, so shortcuts break: checking only the final total misses a goal that was reached and then lost, and a binary search over prefix sums is not valid. Also note the answer is a day number (1-based), not an index.\n\nTime O(n), extra space O(1).",
    functionName: "savings_goal_day",
    functionSignature: "def savings_goal_day(deposits: list[int], goal: int) -> int:",
    starter:
      STARTER_HEADER + "def savings_goal_day(deposits: list[int], goal: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[10, 20, 30], 50], expected: 3 },
      { input: [[40, -30, 25, 20, 10], 50], expected: 4 },
      { input: [[5, 5, 5], 100], expected: -1 },
    ],
    hiddenTests: [
      { input: [[], 10], expected: -1 },
      { input: [[10], 10], expected: 1 },
      { input: [[60, -50, -20], 50], expected: 1 },
      { input: [[3, -1, 3, -1, 3, -1, 3], 7], expected: 5 },
      { input: [[-5, -5, 20], 5], expected: 3 },
      { input: [[9, -1, 1], 10], expected: -1 },
    ],
  },
  {
    id: "range-xor-queries",
    number: 429,
    title: "Range XOR Queries",
    difficulty: 'Easy',
    topic: "Prefix Sum",
    statement:
      "You are given a non-empty list `nums` of non-negative integers and a list of `queries`. Each query is a pair `[l, r]` with `0 <= l <= r < len(nums)` and asks for the bitwise XOR of all the values from index `l` to index `r`, both ends included:\n\n`nums[l] ^ nums[l + 1] ^ ... ^ nums[r]`\n\nReturn the answers as a list, one per query, in order. If `queries` is empty, return an empty list.\n\nExample: `nums = [5, 3, 6, 1]`, `queries = [[0, 3], [1, 2], [2, 2]]` returns `[1, 5, 6]`, because `5 ^ 3 ^ 6 ^ 1 = 1`, `3 ^ 6 = 5`, and a single element is its own XOR.",
    explanation:
      "The prefix-sum trick works for any operation that can be undone, not only addition. XOR undoes itself: `x ^ x = 0`, so XOR-ing a prefix in a second time removes it.\n\nSteps:\n1. Build `pre` with `pre[0] = 0` and `pre[i + 1] = pre[i] ^ nums[i]`, so `pre[i]` is the XOR of the first `i` values.\n2. For a query `[l, r]`, answer `pre[r + 1] ^ pre[l]`. The values before index `l` appear in both terms and cancel, leaving exactly `nums[l..r]`.\n\nRecomputing each range from scratch is O(n) per query; with the prefix array each query is O(1).\n\nWatch the indices: `pre[r] ^ pre[l]` leaves out `nums[r]`, and `pre[r + 1] ^ pre[l + 1]` leaves out `nums[l]`.\n\nTime O(n + q), space O(n).",
    functionName: "range_xor_queries",
    functionSignature: "def range_xor_queries(nums: list[int], queries: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def range_xor_queries(nums: list[int], queries: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[5, 3, 6, 1], [[0, 3], [1, 2], [2, 2]]], expected: [1, 5, 6] },
      { input: [[7, 7, 7], [[0, 1], [0, 2]]], expected: [0, 7] },
    ],
    hiddenTests: [
      { input: [[0], [[0, 0]]], expected: [0] },
      { input: [[1, 2, 4, 8, 16], [[0, 4], [1, 3], [4, 4], [0, 0]]], expected: [31, 14, 16, 1] },
      { input: [[9, 9], [[0, 1], [1, 1]]], expected: [0, 9] },
      { input: [[12, 5, 12, 5, 3], [[0, 3], [1, 4], [2, 3]]], expected: [0, 15, 9] },
      { input: [[6, 2, 7], []], expected: [] },
    ],
  },
  {
    id: "odd-sum-subarrays",
    number: 430,
    title: "Odd-Sum Subarrays",
    difficulty: 'Medium',
    topic: "Prefix Sum",
    statement:
      "Given a list of integers `nums` (values may be negative or zero), count the contiguous, non-empty subarrays whose sum is **odd**.\n\nSubarrays at different positions are counted separately even if they hold the same values. If `nums` is empty, return `0`.\n\nExample: `[1, 3, 5]` returns `4`. The subarrays with an odd sum are `[1]`, `[3]`, `[5]` and `[1, 3, 5]`; `[1, 3]` and `[3, 5]` have even sums.",
    explanation:
      "There are O(n^2) subarrays, so summing each one is too slow for long lists. Use the fact that a subarray sum is a difference of two prefix sums: `sum(nums[i..j]) = pre[j + 1] - pre[i]`. A difference is odd exactly when the two prefix sums have different parity.\n\nSteps:\n1. Keep two counters: how many prefix sums seen so far are even and how many are odd. Start with `even = 1`, because the empty prefix has sum 0.\n2. Go through the list keeping only the parity of the running sum.\n3. At each element, every earlier prefix of the *opposite* parity gives one odd-sum subarray ending here: add that counter to the answer. Then count the current prefix in its own bucket.\n\nForgetting to count the empty prefix loses every subarray that starts at index 0. In Python, `x % 2` is 0 or 1 for negative numbers too, so negatives need no special care.\n\nTime O(n), extra space O(1).",
    functionName: "count_odd_sum_subarrays",
    functionSignature: "def count_odd_sum_subarrays(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def count_odd_sum_subarrays(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 3, 5]], expected: 4 },
      { input: [[2, 4, 6]], expected: 0 },
      { input: [[1, 2, 3, 4, 5, 6, 7]], expected: 16 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[-1, 2, -3]], expected: 4 },
      { input: [[0, 0, 1, 0]], expected: 6 },
      { input: [[1, 1, 1, 1]], expected: 6 },
      { input: [[7, -7, 2, 5, -4]], expected: 9 },
    ],
  },
  {
    id: "three-way-equal-splits",
    number: 431,
    title: "Three-Way Equal Splits",
    difficulty: 'Medium',
    topic: "Prefix Sum",
    statement:
      "You want to cut a list of integers `nums` (values may be negative or zero) into **three contiguous, non-empty parts** that all have the same sum.\n\nA cut is described by two indices `i` and `j` with `0 < i < j < len(nums)`: the parts are `nums[:i]`, `nums[i:j]` and `nums[j:]`. Count the pairs `(i, j)` for which the three parts have equal sums.\n\nIf `nums` has fewer than 3 elements, return `0`.\n\nExample: `[1, 2, 3, 0, 3]` returns `2`. The cuts are `[1, 2] | [3] | [0, 3]` and `[1, 2] | [3, 0] | [3]`.\n\nExample: `[0, 0, 0, 0]` returns `3`: any two cut positions out of the three gaps work.",
    explanation:
      "Trying every pair `(i, j)` is O(n^2) even with prefix sums. One pass is enough once you notice what the two cuts must look like.\n\nIf the total is `T`, each part must sum to `T / 3`, so `T` must be divisible by 3. Then:\n- the first cut `i` must have prefix sum `T / 3`;\n- the second cut `j` must have prefix sum `2T / 3` (which leaves `T / 3` for the last part);\n- and `i` must come before `j`.\n\nSteps:\n1. Compute `T`. If the list is shorter than 3 or `T % 3 != 0`, return 0.\n2. Walk `j` from 1 to `n - 1` keeping the running sum of `nums[:j]` and a counter `firsts` of earlier positions whose prefix sum was `T / 3`.\n3. At each `j`: if `j >= 2` and the running sum is `2T / 3`, add `firsts` to the answer. *After* that, if the running sum is `T / 3`, increment `firsts` (so position `j` is only available as a first cut for later second cuts).\n\nThe order in step 3 matters when `T = 0`, because then `T / 3` and `2T / 3` are the same value and a position could otherwise be paired with itself. Multiplying \"number of first cuts\" by \"number of second cuts\" is wrong for the same reason: it ignores the `i < j` requirement.\n\nTime O(n), extra space O(1).",
    functionName: "count_three_way_splits",
    functionSignature: "def count_three_way_splits(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def count_three_way_splits(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 0, 3]], expected: 2 },
      { input: [[0, 0, 0, 0]], expected: 3 },
      { input: [[1, 1, 1]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[1, 2]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[0, 0, 0, 0, 0, 0]], expected: 10 },
      { input: [[5, 0, 5, 0, 5]], expected: 4 },
      { input: [[0, 1, -1, 0]], expected: 1 },
      { input: [[1, -1, 1, -1, 1, -1, 1, -1]], expected: 3 },
    ],
  },
  {
    id: "paint-rectangles",
    number: 432,
    title: "Stacked Rectangle Updates",
    difficulty: 'Medium',
    topic: "Prefix Sum",
    statement:
      "A heat map has `rows` rows and `cols` columns (both at least 1) and starts with every cell at `0`.\n\nYou are given a list of `updates`. Each update is `[r1, c1, r2, c2, v]` with `0 <= r1 <= r2 < rows` and `0 <= c1 <= c2 < cols`, and adds the integer `v` (which may be negative) to every cell in the rectangle whose top-left corner is `(r1, c1)` and whose bottom-right corner is `(r2, c2)`, **corners and edges included**.\n\nReturn the grid after all updates have been applied, as a list of `rows` lists of `cols` integers. With no updates, return the all-zero grid.\n\nExample: `rows = 3`, `cols = 4`, `updates = [[0, 0, 1, 1, 5], [1, 1, 2, 3, 2]]` returns\n\n`[[5, 5, 0, 0], [5, 7, 2, 2], [0, 2, 2, 2]]`\n\nThe cell at row 1, column 1 lies in both rectangles and gets `5 + 2 = 7`.",
    explanation:
      "Applying each update cell by cell costs O(rows * cols) per update. A 2D *difference array* records each rectangle with four numbers and rebuilds the grid once at the end.\n\nSteps:\n1. Create `diff` with one extra row and one extra column, all zeros.\n2. For an update `[r1, c1, r2, c2, v]`:\n   - `diff[r1][c1] += v`\n   - `diff[r1][c2 + 1] -= v`\n   - `diff[r2 + 1][c1] -= v`\n   - `diff[r2 + 1][c2 + 1] += v`\n3. Take the 2D prefix sum of `diff`: `grid[r][c] = diff[r][c] + grid[r-1][c] + grid[r][c-1] - grid[r-1][c-1]` (treating out-of-range terms as 0). The result, cut back to `rows x cols`, is the answer.\n\nWhy it works: the prefix sum at `(r, c)` adds up every marker above and to the left. The `+v` at the top-left switches the value on for everything below and to the right; the two `-v` markers switch it off past the right edge and past the bottom edge; the final `+v` repairs the corner region that was switched off twice.\n\nThe classic mistake is placing the \"off\" markers at `c2` and `r2` instead of `c2 + 1` and `r2 + 1`, which cuts the last column and row off every rectangle.\n\nTime O(rows * cols + number of updates), space O(rows * cols).",
    functionName: "paint_rectangles",
    functionSignature: "def paint_rectangles(rows: int, cols: int, updates: list[list[int]]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def paint_rectangles(rows: int, cols: int, updates: list[list[int]]) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [3, 4, [[0, 0, 1, 1, 5], [1, 1, 2, 3, 2]]], expected: [[5, 5, 0, 0], [5, 7, 2, 2], [0, 2, 2, 2]] },
      { input: [2, 2, []], expected: [[0, 0], [0, 0]] },
    ],
    hiddenTests: [
      { input: [1, 1, [[0, 0, 0, 0, 7]]], expected: [[7]] },
      { input: [2, 3, [[0, 0, 1, 2, 1], [0, 0, 1, 2, -1]]], expected: [[0, 0, 0], [0, 0, 0]] },
      { input: [4, 4, [[0, 0, 3, 3, 1], [1, 1, 2, 2, 10], [3, 0, 3, 3, -4], [0, 3, 3, 3, 2]]], expected: [[1, 1, 1, 3], [1, 11, 11, 3], [1, 11, 11, 3], [-3, -3, -3, -1]] },
      { input: [3, 3, [[2, 2, 2, 2, 9], [0, 0, 0, 2, 3], [0, 0, 2, 0, 4]]], expected: [[7, 3, 3], [4, 0, 0], [4, 0, 9]] },
      { input: [1, 5, [[0, 1, 0, 3, 2], [0, 3, 0, 4, 5]]], expected: [[0, 2, 2, 7, 5]] },
      { input: [3, 2, [[1, 0, 1, 1, 6], [0, 1, 2, 1, -2]]], expected: [[0, -2], [6, 4], [0, -2]] },
    ],
  },
  {
    id: "best-two-windows",
    number: 433,
    title: "Best Two Separate Windows",
    difficulty: 'Medium',
    topic: "Prefix Sum",
    statement:
      "You are given a list of integers `nums` (values may be negative) and two positive window lengths `a` and `b` with `a + b <= len(nums)`.\n\nChoose one contiguous window of exactly `a` elements and one contiguous window of exactly `b` elements so that the two windows **do not overlap** (they share no index; touching is fine). The `a`-window may lie to the left or to the right of the `b`-window.\n\nReturn the largest possible value of the two window sums added together.\n\nExample: `nums = [0, 6, 5, 2, 2, 5, 1, 9, 4]`, `a = 1`, `b = 2` returns `20`: take `[9]` and `[6, 5]`.\n\nExample: `nums = [1, 5, 5, 1, 0, 0]`, `a = 2`, `b = 2` returns `12`: take `[1, 5]` and `[5, 1]`. Grabbing the single best window `[5, 5]` first would leave at most `1` for the other window.",
    explanation:
      "Trying every pair of window positions is O(n^2). Picking the best window first and then the best remaining one is fast but wrong, as the second example shows. The reliable approach fixes the order of the two windows and sweeps once.\n\nBuild a prefix-sum array so any window sum is one subtraction: `sum(nums[i:i+len]) = pre[i + len] - pre[i]`.\n\nTo handle \"a window of length `first` somewhere to the left of a window of length `second`\":\n1. Slide the start `p` of the second window from `first` to `n - second`.\n2. As `p` moves right by one, exactly one more `first`-window fits entirely to its left (the one ending at `p`). Fold it into `best_first`, the best such window so far.\n3. A candidate answer is `best_first + (sum of the second window starting at p)`.\n\nRun this twice, once with `(first, second) = (a, b)` and once with `(b, a)`, and return the larger result.\n\nInitialise the running maxima from real window sums (or `None`), not from 0: with negative numbers the best answer can be negative.\n\nTime O(n), space O(n) for the prefix sums.",
    functionName: "best_two_windows",
    functionSignature: "def best_two_windows(nums: list[int], a: int, b: int) -> int:",
    starter:
      STARTER_HEADER + "def best_two_windows(nums: list[int], a: int, b: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[0, 6, 5, 2, 2, 5, 1, 9, 4], 1, 2], expected: 20 },
      { input: [[1, 5, 5, 1, 0, 0], 2, 2], expected: 12 },
      { input: [[3, 8, 1, 3, 2, 1, 8, 9, 0], 3, 2], expected: 29 },
    ],
    hiddenTests: [
      { input: [[-5, -2, -9, -1], 1, 1], expected: -3 },
      { input: [[2, 1, 5, 6, 0, 9, 5, 0, 3, 8], 4, 3], expected: 31 },
      { input: [[9, 1, 1, 9, 9, 1], 2, 1], expected: 27 },
      { input: [[4, 5, 14, 16, 16, 20, 7, 13, 8, 15], 3, 5], expected: 109 },
      { input: [[10, -20, 10, 10, -20, 10], 2, 2], expected: 10 },
      { input: [[8, 9, 9, 1, 1, 1, 1], 3, 1], expected: 27 },
    ],
  },
  {
    id: "books-between-bookends",
    number: 434,
    title: "Books Between Bookends",
    difficulty: 'Medium',
    topic: "Prefix Sum",
    statement:
      "A shelf is described by a non-empty string `shelf` in which `'|'` is a bookend and `'*'` is a book.\n\nEach query is a pair `[l, r]` with `0 <= l <= r < len(shelf)` and looks only at the section `shelf[l..r]` (both ends included). A book in that section is **held** if, within the section, there is at least one bookend somewhere to its left and at least one bookend somewhere to its right. Bookends outside the section do not help.\n\nFor each query return the number of held books. Return the answers as a list in query order; if `queries` is empty, return an empty list.\n\nExample: `shelf = \"**|**|***|\"`, `queries = [[2, 5], [5, 9], [0, 9], [0, 2]]` returns `[2, 3, 5, 0]`.\n- `[2, 5]` is `\"|**|\"`: both books are held.\n- `[0, 9]` is the whole shelf: the two leading books have no bookend to their left, the other five are held.\n- `[0, 2]` is `\"**|\"`: there is no bookend on the left, so nothing is held.",
    explanation:
      "Scanning the section for every query is O(n) per query. Two precomputations make each query O(1).\n\nObservation: the held books of a section are exactly the books lying between the section's leftmost bookend and its rightmost bookend.\n\nPrecompute:\n1. `pre[i]` = number of books among the first `i` characters (a prefix count).\n2. `next_end[i]` = index of the nearest bookend at or to the right of `i` (or -1), filled by a right-to-left pass.\n3. `prev_end[i]` = index of the nearest bookend at or to the left of `i` (or -1), filled by a left-to-right pass.\n\nFor a query `[l, r]`:\n- `a = next_end[l]` is the leftmost bookend of the section and `b = prev_end[r]` the rightmost.\n- If either is missing or `a >= b` (no bookend, or only one, inside the section), the answer is 0.\n- Otherwise the answer is `pre[b] - pre[a]`, the books strictly between them (positions `a` and `b` are bookends, so including or excluding them changes nothing).\n\nReturning the plain count of books in `[l, r]` is the common wrong answer: books outside the outermost bookends of the section are not held.\n\nTime O(n + q), space O(n).",
    functionName: "books_between_bookends",
    functionSignature: "def books_between_bookends(shelf: str, queries: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def books_between_bookends(shelf: str, queries: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["**|**|***|", [[2, 5], [5, 9], [0, 9], [0, 2]]], expected: [2, 3, 5, 0] },
      { input: ["***", [[0, 2]]], expected: [0] },
    ],
    hiddenTests: [
      { input: ["|", [[0, 0]]], expected: [0] },
      { input: ["|*|", [[0, 2], [0, 1], [1, 2], [1, 1]]], expected: [1, 0, 0, 0] },
      { input: ["||**||**|*", [[3, 8], [0, 9], [4, 5], [2, 3], [6, 9], [1, 4]]], expected: [2, 4, 0, 0, 0, 2] },
      { input: ["*|*|*|*", [[0, 6], [1, 5], [2, 4], [0, 3], [3, 6], [2, 2]]], expected: [2, 2, 0, 1, 1, 0] },
      { input: ["|**|", []], expected: [] },
      { input: ["*|***", [[0, 4], [1, 4]]], expected: [0, 0] },
    ],
  },
  {
    id: "best-three-windows",
    number: 435,
    title: "Best Three Separate Windows",
    difficulty: 'Hard',
    topic: "Prefix Sum",
    statement:
      "You are given a list of integers `nums` (values may be negative) and a window length `k >= 1` with `3 * k <= len(nums)`.\n\nChoose three contiguous windows of exactly `k` elements each that do not overlap (they share no index; touching is fine) so that the sum of all the chosen elements is as large as possible.\n\nReturn the starting indices of the three windows as a list in ascending order.\n\nIf several choices reach the maximum sum, return the lexicographically smallest list of starting indices: the one with the smallest first index, then, among those, the smallest second index, then the smallest third index.\n\nExample: `nums = [1, 2, 1, 2, 6, 7, 5, 1]`, `k = 2` returns `[0, 3, 5]`: the windows `[1, 2]`, `[2, 6]` and `[7, 5]` add up to 23. The start list `[1, 3, 5]` uses `[2, 1]`, which has the same sum as `[1, 2]`, and also reaches 23, but `[0, 3, 5]` is lexicographically smaller.",
    explanation:
      "Greedily taking the best window three times fails (the best single window may straddle two windows that are better together), and trying all triples of starts is O(n^3). The key is to fix the **middle** window: once it is fixed, the left and right windows are independent of each other, and the best choice for each can be precomputed.\n\nSteps:\n1. With prefix sums, compute `win[i]`, the sum of the window starting at `i`, for every valid start.\n2. `left[i]` = the start of the best window among starts `0..i`. Sweep left to right and replace the current best only when a window is **strictly** larger, so ties keep the earliest start.\n3. `right[i]` = the start of the best window among starts `i..end`. Sweep right to left and replace when a window is **greater than or equal**, so ties again end up at the earliest start.\n4. For each middle start `m` from `k` to `len(win) - k - 1`, the candidate is `left[m - k]`, `m`, `right[m + k]`. Keep the candidate with the largest total, replacing only on a strictly larger total.\n\nWhy the tie-breaks give the lexicographically smallest answer: `left[...]` never moves backwards as `m` grows, so the first `m` that reaches the best total also has the smallest possible first index; among equal totals the smallest `m` is kept; and `right` picks the earliest third start.\n\nGetting `>` and `>=` the wrong way round in steps 2 to 4 still finds the maximum sum but returns the wrong indices on ties.\n\nTime O(n), space O(n).",
    functionName: "best_three_windows",
    functionSignature: "def best_three_windows(nums: list[int], k: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def best_three_windows(nums: list[int], k: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 1, 2, 6, 7, 5, 1], 2], expected: [0, 3, 5] },
      { input: [[1, 2, 1, 2, 1, 2, 1, 2, 1], 2], expected: [0, 2, 4] },
      { input: [[4, 3, 2, 1], 1], expected: [0, 1, 2] },
    ],
    hiddenTests: [
      { input: [[7, 13, 20, 19, 19, 2, 10, 1, 1, 19], 3], expected: [1, 4, 7] },
      { input: [[3, 9, 9, 3, 1, 1, 1, 1], 2], expected: [0, 2, 4] },
      { input: [[-1, -2, -3, -4, -5, -6, -7], 2], expected: [0, 2, 4] },
      { input: [[2, 1, 2, 1, 2, 1, 2, 1, 2], 1], expected: [0, 2, 4] },
      { input: [[9, 9, 1, 1, 9, 9, 1, 9, 9, 9], 2], expected: [0, 4, 7] },
      { input: [[1, 1, 5, 1, 1, 5, 1, 1, 5, 5], 3], expected: [0, 3, 7] },
    ],
  },
  {
    id: "count-target-submatrices",
    number: 436,
    title: "Count Target Submatrices",
    difficulty: 'Hard',
    topic: "Prefix Sum",
    statement:
      "You are given a rectangular integer `matrix` (at least one row and one column, at most 8 rows and 8 columns; values may be negative or zero) and an integer `target`.\n\nA **submatrix** is any non-empty rectangular block of cells: choose a contiguous range of rows and a contiguous range of columns and take every cell in both ranges. Blocks at different positions are different submatrices even if they contain the same numbers.\n\nReturn the number of submatrices whose cells add up to exactly `target`.\n\nExample: `matrix = [[0, 1, 0], [1, 1, 1], [0, 1, 0]]`, `target = 0` returns `4`: only the four single corner cells sum to 0.\n\nExample: `matrix = [[1, -1], [-1, 1]]`, `target = 0` returns `5`: the two rows, the two columns, and the whole matrix.",
    explanation:
      "A 2D prefix sum makes any block sum O(1), but there are O(R^2 * C^2) blocks. Reducing the problem to the one-dimensional \"count subarrays with a given sum\" removes one factor.\n\nSteps:\n1. Fix a top row. Keep an array `col_sum` of length C, initially zero.\n2. Extend the bottom row downward one row at a time, adding that row into `col_sum`. Now `col_sum[c]` is the sum of column `c` between the top and bottom rows, so every block with these two row limits corresponds to a contiguous range of `col_sum`.\n3. Count the ranges of `col_sum` that add up to `target` with the hash-map technique: scan left to right keeping a running sum, and a dictionary of how many times each running sum has occurred (start it with `{0: 1}` for the empty prefix). At each column add `seen[running - target]` to the answer, then record `running`.\n\nThe dictionary must be created fresh for each (top, bottom) pair; reusing it mixes prefixes from different row bands. Because values can be negative, a sliding window cannot replace the dictionary.\n\nTime O(R^2 * C), space O(C). If the matrix is much wider than tall this is the right way round; otherwise fix column pairs instead.",
    functionName: "count_target_submatrices",
    functionSignature: "def count_target_submatrices(matrix: list[list[int]], target: int) -> int:",
    starter:
      STARTER_HEADER + "def count_target_submatrices(matrix: list[list[int]], target: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[0, 1, 0], [1, 1, 1], [0, 1, 0]], 0], expected: 4 },
      { input: [[[1, -1], [-1, 1]], 0], expected: 5 },
      { input: [[[5]], 5], expected: 1 },
    ],
    hiddenTests: [
      { input: [[[0, 0], [0, 0]], 0], expected: 9 },
      { input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 12], expected: 2 },
      { input: [[[2, -2, 2, -2]], 0], expected: 4 },
      { input: [[[1], [1], [1]], 2], expected: 2 },
      { input: [[[3, -1, 2], [0, 4, -4], [1, 1, 1]], 3], expected: 6 },
      { input: [[[1, 1, 1], [1, 1, 1]], 2], expected: 7 },
    ],
  },
];
