// Batch algos-a2: Union Find (379-391), Interval (392-401), Linked List (402-406).
// Expected values were produced by scripts/fixtures/algos-a2.py.
import type { Blind75Problem } from '../blind75';

const STARTER_HEADER = '# Write your solution below. Do not rename the function.\n';

export const problems: Blind75Problem[] = [
  {
    id: 'club-sizes-after-pairings',
    number: 379,
    title: "Club Sizes After Pairings",
    difficulty: 'Easy',
    topic: "Union Find",
    statement:
      "A school has `n` students numbered `0` to `n - 1`. Each entry `pairs[i] = [a, b]` says students `a` and `b` are in the same club. Membership is shared along chains: if `a` is with `b` and `b` is with `c`, all three are in one club. A student who appears in no pair is a club of one.\n\nReturn the sizes of all clubs, sorted from largest to smallest. A pair may be listed more than once. If `n` is `0`, return an empty list.",
    explanation:
      "Each pair is a 'these two belong together' fact, and the question is about the groups those facts add up to. That is exactly what a disjoint-set (union-find) structure tracks.\n\nGive every student a `parent` pointing to itself and a `size` of 1. For each pair, find the two roots; if they differ, hang the smaller tree under the larger and add the sizes. Repeated pairs find the same root twice and do nothing, so nothing is double counted.\n\nAt the end the roots (students whose parent is themselves) each hold one club's size. Collect those and sort descending. Remember that students who never appear in a pair are still roots of size 1.\n\nWith path compression and union by size this is nearly O(n + p) for the unions plus O(n log n) for the final sort, and O(n) space.",
    functionName: 'group_sizes',
    functionSignature: "def group_sizes(n: int, pairs: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def group_sizes(n: int, pairs: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [6,[[0,1],[1,2],[3,4]]], expected: [3,2,1] },
      { input: [4,[]], expected: [1,1,1,1] },
      { input: [5,[[0,1],[2,3],[1,2],[0,3]]], expected: [4,1] },
    ],
    hiddenTests: [
      { input: [0,[]], expected: [] },
      { input: [1,[]], expected: [1] },
      { input: [7,[[0,6],[1,5],[2,4],[6,1],[4,3]]], expected: [4,3] },
      { input: [5,[[0,1],[0,1],[1,0]]], expected: [2,1,1,1] },
      { input: [8,[[0,1],[2,3],[4,5],[6,7],[1,2],[5,6],[3,4]]], expected: [8] },
      { input: [6,[[4,5]]], expected: [2,1,1,1,1] },
    ],
  },
  {
    id: 'same-network-queries',
    number: 380,
    title: "Same Network Queries",
    difficulty: 'Easy',
    topic: "Union Find",
    statement:
      "An office has `n` computers numbered `0` to `n - 1`. Each `links[i] = [a, b]` is a cable joining computers `a` and `b`; data can travel along any chain of cables in either direction.\n\nFor each `queries[j] = [x, y]`, decide whether computer `x` can reach computer `y`. A computer can always reach itself. Return a list of booleans, one per query, in the order the queries were given. If there are no queries, return an empty list.",
    explanation:
      "Running a fresh graph search for every query costs O(n + links) each time. Since all the cables are known up front, it is cheaper to compute the connected groups once and then answer each query with a lookup.\n\nBuild a union-find over the `n` computers and union the two ends of every cable. Two computers can reach each other exactly when `find(x) == find(y)`. A query `[x, x]` is naturally `True` because a node shares a root with itself.\n\nA common mistake is to check only whether a direct cable exists; reachability passes through intermediate machines.\n\nTime is nearly O(n + links + queries); space is O(n).",
    functionName: 'same_network',
    functionSignature: "def same_network(n: int, links: list[list[int]], queries: list[list[int]]) -> list[bool]:",
    starter:
      STARTER_HEADER +
      "def same_network(n: int, links: list[list[int]], queries: list[list[int]]) -> list[bool]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5,[[0,1],[1,2],[3,4]],[[0,2],[0,3],[4,3]]], expected: [true,false,true] },
      { input: [3,[],[[0,0],[0,1]]], expected: [true,false] },
    ],
    hiddenTests: [
      { input: [6,[[0,1],[2,3],[4,5],[1,2]],[[0,3],[3,0],[0,5],[4,5],[2,2]]], expected: [true,true,false,true,true] },
      { input: [4,[[0,1],[1,2],[2,3]],[[0,3],[3,1]]], expected: [true,true] },
      { input: [2,[[0,1]],[]], expected: [] },
      { input: [7,[[5,6],[0,6],[1,2],[2,3]],[[0,5],[1,3],[3,5],[4,4],[4,0]]], expected: [true,true,false,true,false] },
      { input: [5,[[0,4],[4,2],[2,0]],[[1,3],[0,2],[2,4],[3,3]]], expected: [false,true,true,true] },
    ],
  },
  {
    id: 'lowest-id-captains',
    number: 381,
    title: "Lowest Id Captains",
    difficulty: 'Easy',
    topic: "Union Find",
    statement:
      "There are `n` players numbered `0` to `n - 1`. Each `pairs[i] = [a, b]` puts players `a` and `b` on the same team, and teams merge along chains of pairs (if `a` is with `b` and `b` is with `c`, all three are teammates). A player in no pair is a team of one.\n\nEvery team's captain is its member with the lowest id. Return a list `captain` of length `n` where `captain[i]` is the captain of player `i`'s team. If `n` is `0`, return an empty list.",
    explanation:
      "Taking the minimum over each player's direct partners is not enough: a low id can be several pairs away, at the far end of a chain.\n\nUse union-find with one twist. When two different roots are joined, always make the smaller id the parent of the larger. With that rule the root of every tree is the smallest id in the tree (it holds for single nodes, and each union keeps the smaller of two minimums on top). The answer for player `i` is then simply `find(i)`.\n\nThis rule replaces union by size, so keep path compression in `find` to stay fast. Alternatively, union by size and track a separate `lowest[root]` value.\n\nTime is nearly O(n + p), space O(n).",
    functionName: 'group_leaders',
    functionSignature: "def group_leaders(n: int, pairs: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def group_leaders(n: int, pairs: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5,[[3,4],[1,3]]], expected: [0,1,2,1,1] },
      { input: [3,[]], expected: [0,1,2] },
      { input: [6,[[5,4],[4,3],[2,1],[3,2]]], expected: [0,1,1,1,1,1] },
    ],
    hiddenTests: [
      { input: [0,[]], expected: [] },
      { input: [6,[[5,4],[4,3],[3,2],[2,1],[1,0]]], expected: [0,0,0,0,0,0] },
      { input: [7,[[6,5],[3,6],[0,2],[5,4]]], expected: [0,1,0,3,3,3,3] },
      { input: [4,[[2,3],[3,2]]], expected: [0,1,2,2] },
      { input: [8,[[7,3],[3,5],[5,1],[6,2],[4,0],[2,4]]], expected: [0,1,0,1,0,1,0,1] },
      { input: [5,[[1,4],[4,2],[2,3],[3,0]]], expected: [0,0,0,0,0] },
    ],
  },
  {
    id: 'biggest-alliance-tracker',
    number: 382,
    title: "Biggest Alliance Tracker",
    difficulty: 'Medium',
    topic: "Union Find",
    statement:
      "`n` kingdoms numbered `0` to `n - 1` (with `n >= 1`) each start as their own alliance. The treaties in `merges` are signed one after another: `merges[i] = [a, b]` fuses the whole alliance containing `a` with the whole alliance containing `b`. If `a` and `b` are already allies, the treaty changes nothing.\n\nReturn a list with one entry per treaty: the number of kingdoms in the largest alliance right after that treaty is signed. If `merges` is empty, return an empty list.",
    explanation:
      "Recounting the groups after every treaty would cost O(n) per step. Union-find with a `size` stored at each root makes every step nearly constant.\n\nKeep a running `best`, starting at 1. For each treaty, find both roots. If they are the same, the treaty is redundant: do NOT add the sizes again, just record `best`. Otherwise attach the smaller tree to the larger, add the sizes, and raise `best` if the merged size beats it.\n\nTwo details trip people up. First, forgetting the same-root check inflates sizes when a treaty repeats or closes a loop. Second, the answer is the largest alliance overall, which is not always the one that was just merged, so `best` must persist across steps (it can only grow, because alliances never split).\n\nTime is nearly O(n + m), space O(n).",
    functionName: 'largest_group_sizes',
    functionSignature: "def largest_group_sizes(n: int, merges: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def largest_group_sizes(n: int, merges: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5,[[0,1],[2,3],[1,0],[1,2],[3,4]]], expected: [2,2,2,4,5] },
      { input: [3,[]], expected: [] },
      { input: [6,[[0,1],[1,2],[3,4]]], expected: [2,3,3] },
    ],
    hiddenTests: [
      { input: [4,[[0,1],[0,1],[1,0]]], expected: [2,2,2] },
      { input: [6,[[0,1],[2,3],[4,5],[0,2],[1,3],[3,5]]], expected: [2,2,2,4,4,6] },
      { input: [1,[]], expected: [] },
      { input: [2,[[1,0]]], expected: [2] },
      { input: [7,[[5,6],[4,5],[0,1],[1,2],[2,0],[6,4],[3,0],[3,4]]], expected: [2,3,3,3,3,3,4,7] },
      { input: [5,[[0,1],[1,2],[2,0],[0,2],[3,4]]], expected: [2,3,3,3,3] },
    ],
  },
  {
    id: 'house-style-letters',
    number: 383,
    title: "House Style Letters",
    difficulty: 'Medium',
    topic: "Union Find",
    statement:
      "A printer treats some lowercase letters as interchangeable. Two strings of equal length, `s1` and `s2`, define the rule: for every index `i`, the letters `s1[i]` and `s2[i]` are interchangeable. Interchangeability also carries through chains: if `a` swaps with `b` and `b` swaps with `c`, then `a` swaps with `c`.\n\nRewrite `text` in house style by replacing every letter with the alphabetically smallest letter it is interchangeable with (a letter is always interchangeable with itself, so a letter with no partners stays as it is). Return the rewritten string. All three strings contain only lowercase English letters; `s1` and `s2` may be empty, and an empty `text` gives an empty string.",
    explanation:
      "The pairs describe an equivalence relation over the 26 letters, and each letter must map to the smallest member of its class. Looking only at a letter's direct partners misses chains such as `d~c`, `c~b`, `b~a`, where `d` should become `a`.\n\nUse a union-find over 26 slots. For each index, find the roots of `s1[i]` and `s2[i]`; if they differ, make the alphabetically smaller root the parent of the larger. Because the smaller letter always ends up on top, each tree's root is the smallest letter in its class.\n\nThen translate `text` one character at a time with `find`.\n\nThe alphabet is fixed at 26, so the work is O(len(s1) + len(text)) time and O(1) extra space.",
    functionName: 'canonical_spelling',
    functionSignature: "def canonical_spelling(s1: str, s2: str, text: str) -> str:",
    starter:
      STARTER_HEADER +
      "def canonical_spelling(s1: str, s2: str, text: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["abc","bcd","dad"], expected: "aaa" },
      { input: ["hello","world","hold"], expected: "hdld" },
      { input: ["","","xyz"], expected: "xyz" },
    ],
    hiddenTests: [
      { input: ["dcb","cba","dddz"], expected: "aaaz" },
      { input: ["zz","za","buzz"], expected: "buaa" },
      { input: ["mnop","ponm",""], expected: "" },
      { input: ["aceg","bdfh","hgfedcba"], expected: "ggeeccaa" },
      { input: ["leet","code","sourcecode"], expected: "sdurcdcddd" },
      { input: ["qwer","wert","treq"], expected: "eeee" },
    ],
  },
  {
    id: 'interchangeable-phrases',
    number: 384,
    title: "Interchangeable Phrases",
    difficulty: 'Medium',
    topic: "Union Find",
    statement:
      "Two phrases are given as lists of words, `first` and `second`. Each `synonyms[i] = [a, b]` says the words `a` and `b` mean the same thing. Meaning is symmetric and carries through chains: if `a` matches `b` and `b` matches `c`, then `a` matches `c`. Every word matches itself, even if it never appears in `synonyms`.\n\nThe phrases match when they have the same number of words and, at every position, the word in `first` matches the word in `second`. Word order matters: words are compared position by position only. Return `True` if the phrases match, otherwise `False`. Two empty phrases match.",
    explanation:
      "Because meaning carries through chains, checking whether `[a, b]` literally appears in the synonym list is not enough: `great~good` and `good~fine` make `great` and `fine` match without ever being listed together.\n\nStart with the cheap rejection: different lengths can never match. Then build a union-find keyed by word (a dictionary from word to parent, creating entries on demand so unseen words are their own group) and union both words of every synonym pair.\n\nFinally walk the two phrases in step and require `find(first[i]) == find(second[i])` at every position. A word compared with itself passes automatically.\n\nTime is nearly O(s + w) for `s` synonym pairs and `w` words per phrase (ignoring string hashing); space is O(s).",
    functionName: 'phrases_match',
    functionSignature: "def phrases_match(first: list[str], second: list[str], synonyms: list[list[str]]) -> bool:",
    starter:
      STARTER_HEADER +
      "def phrases_match(first: list[str], second: list[str], synonyms: list[list[str]]) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["great","acting","skills"],["fine","drama","talent"],[["great","good"],["fine","good"],["drama","acting"],["skills","talent"]]], expected: true },
      { input: [["great"],["great"],[]], expected: true },
      { input: [["big","dog"],["large"],[["big","large"]]], expected: false },
    ],
    hiddenTests: [
      { input: [["a","b"],["b","a"],[]], expected: false },
      { input: [["hot","tea"],["warm","coffee"],[["hot","warm"],["tea","drink"]]], expected: false },
      { input: [[],[],[["a","b"]]], expected: true },
      { input: [["big","dog"],["large","dog","house"],[["big","large"]]], expected: false },
      { input: [["fast","car","now"],["speedy","auto","now"],[["quick","fast"],["rapid","quick"],["speedy","rapid"],["auto","vehicle"],["vehicle","car"]]], expected: true },
      { input: [["red","sky"],["sky","red"],[["red","crimson"],["sky","heavens"]]], expected: false },
    ],
  },
  {
    id: 'next-free-parking-bay',
    number: 385,
    title: "Next Free Parking Bay",
    difficulty: 'Medium',
    topic: "Union Find",
    statement:
      "A one-way street has `n` parking bays numbered `0` to `n - 1`, all empty at first. Cars arrive one at a time; car `i` drives straight to bay `prefs[i]` (always between `0` and `n - 1`). If that bay is free it parks there. Otherwise it keeps rolling forward and takes the first free bay with a higher number. Cars cannot reverse, so if every bay from `prefs[i]` to `n - 1` is taken, the car leaves without parking.\n\nReturn a list with one entry per car, in arrival order: the bay it parked in, or `-1` if it left. Parked cars never move. If `prefs` is empty, return an empty list.",
    explanation:
      "Scanning forward bay by bay works but degrades to O(n) per car when many cars want the same crowded stretch, O(n * cars) overall.\n\nThe union-find 'next free slot' trick removes the rescanning. Keep `nxt[i]` = a pointer towards the lowest free bay at or after `i`, with one extra sentinel slot `n` meaning 'ran off the end'. Initially `nxt[i] = i`. To park a car, compute `spot = find(prefs[i])`. If `spot == n` the car leaves (`-1`). Otherwise it parks in `spot`, and you set `nxt[spot] = spot + 1` so future searches skip straight past it.\n\nPath compression in `find` collapses long runs of occupied bays, so later cars jump over them in near-constant time.\n\nNote the street does not wrap around: a car that prefers the last bay and finds it taken simply leaves.\n\nTime is nearly O(n + cars), space O(n).",
    functionName: 'assign_parking',
    functionSignature: "def assign_parking(n: int, prefs: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def assign_parking(n: int, prefs: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5,[2,2,2,0,4,3]], expected: [2,3,4,0,-1,-1] },
      { input: [3,[0,0,0,0]], expected: [0,1,2,-1] },
    ],
    hiddenTests: [
      { input: [1,[0,0]], expected: [0,-1] },
      { input: [4,[3,3,1,1,1,0]], expected: [3,-1,1,2,-1,0] },
      { input: [6,[5,4,3,2,1,0]], expected: [5,4,3,2,1,0] },
      { input: [6,[0,0,3,0,0,0,0]], expected: [0,1,3,2,4,5,-1] },
      { input: [4,[]], expected: [] },
      { input: [7,[2,2,6,2,5,5,1,1,1,0,0]], expected: [2,3,6,4,5,-1,1,-1,-1,0,-1] },
    ],
  },
  {
    id: 'gentlest-hiking-route',
    number: 386,
    title: "Gentlest Hiking Route",
    difficulty: 'Medium',
    topic: "Union Find",
    statement:
      "A park has `n` huts numbered `0` to `n - 1`. Each `trails[i] = [a, b, grade]` is a two-way trail between huts `a` and `b` with a difficulty `grade` (a positive integer). There may be more than one trail between the same two huts.\n\nA hiker cares only about the single hardest trail on the route, not the total. Return the smallest possible value of the hardest grade over all routes from `start` to `goal`. If `start == goal`, return `0` (no trail is needed). If `goal` cannot be reached from `start`, return `-1`.",
    explanation:
      "This is a 'minimise the maximum edge' (bottleneck path) problem. Ordinary shortest path by total grade gives wrong answers: a route of many easy trails beats a short route containing one brutal trail, even though its sum is larger.\n\nThe Kruskal-style idea: sort the trails by grade and add them one at a time to a union-find. The moment `start` and `goal` land in the same set, the trail just added has the answer as its grade. Every trail added so far is no harder than it, so a route exists using only grades up to that value; and before it was added no such route existed, so nothing smaller works.\n\nHandle `start == goal` up front (answer 0), and return -1 if the trails run out without connecting the two huts.\n\nSorting dominates: O(t log t) time for `t` trails and O(n) space. A modified Dijkstra that relaxes with `max(dist, grade)` also works.",
    functionName: 'gentlest_route',
    functionSignature: "def gentlest_route(n: int, trails: list[list[int]], start: int, goal: int) -> int:",
    starter:
      STARTER_HEADER +
      "def gentlest_route(n: int, trails: list[list[int]], start: int, goal: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [4,[[0,1,5],[1,3,5],[0,2,1],[2,3,8]],0,3], expected: 5 },
      { input: [3,[[0,1,4]],0,2], expected: -1 },
      { input: [3,[[0,1,4]],1,1], expected: 0 },
    ],
    hiddenTests: [
      { input: [5,[[0,1,3],[1,2,3],[2,3,3],[3,4,3],[0,4,7]],0,4], expected: 3 },
      { input: [2,[[0,1,9],[1,0,2]],0,1], expected: 2 },
      { input: [6,[[0,1,2],[1,2,6],[2,5,2],[0,3,4],[3,4,4],[4,5,4]],0,5], expected: 4 },
      { input: [4,[[0,1,1],[2,3,1]],0,3], expected: -1 },
      { input: [5,[[0,1,10],[1,2,1],[2,3,1]],3,0], expected: 10 },
      { input: [5,[[0,1,2],[1,2,9],[0,3,6],[3,2,7],[2,4,1]],4,0], expected: 7 },
    ],
  },
  {
    id: 'village-fibre-budget',
    number: 387,
    title: "Village Fibre Budget",
    difficulty: 'Medium',
    topic: "Union Find",
    statement:
      "A valley has `n` villages numbered `0` to `n - 1` (with `n >= 1`). A contractor offers to lay fibre on certain routes: `offers[i] = [a, b, cost]` means villages `a` and `b` can be joined directly for `cost` (a positive integer). Several offers may cover the same two villages.\n\nChoose a set of offers so that every village can reach every other village through the laid fibre, and the total cost is as small as possible. Return that minimum total cost, or `-1` if no set of offers connects all the villages. A single village needs no fibre, so the answer for `n = 1` is `0`.",
    explanation:
      "The cheapest way to connect everything is a minimum spanning tree: it uses exactly `n - 1` links and contains no cycle, because any link that closes a cycle could be dropped to save money.\n\nKruskal's algorithm builds it greedily. Sort the offers by cost. Walk through them cheapest first and use a union-find to ask whether the two villages are already connected. If they are, skip the offer (it would only close a loop). If not, accept it, add its cost and union the two sets.\n\nSimply taking the `n - 1` cheapest offers is wrong, since some of them may form a loop and leave a village cut off. Also count the accepted offers: if fewer than `n - 1` were accepted the valley cannot be connected and the answer is `-1`.\n\nTime is O(m log m) for sorting `m` offers; space is O(n).",
    functionName: 'cheapest_cable_plan',
    functionSignature: "def cheapest_cable_plan(n: int, offers: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def cheapest_cable_plan(n: int, offers: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [4,[[0,1,1],[1,2,2],[0,2,3],[2,3,4]]], expected: 7 },
      { input: [3,[[0,1,5]]], expected: -1 },
      { input: [1,[]], expected: 0 },
    ],
    hiddenTests: [
      { input: [4,[[0,1,1],[1,2,1],[0,2,1],[2,3,10]]], expected: 12 },
      { input: [4,[[0,1,1],[2,3,1]]], expected: -1 },
      { input: [5,[[0,1,4],[0,2,4],[1,2,2],[2,3,3],[3,4,3],[1,4,6],[2,4,5]]], expected: 12 },
      { input: [2,[[0,1,7],[0,1,3]]], expected: 3 },
      { input: [6,[[0,1,6],[0,2,1],[0,3,5],[1,2,5],[1,4,3],[2,3,5],[2,4,6],[2,5,4],[3,5,2],[4,5,6]]], expected: 15 },
      { input: [2,[]], expected: -1 },
    ],
  },
  {
    id: 'stranded-pairs',
    number: 388,
    title: "Stranded Pairs",
    difficulty: 'Medium',
    topic: "Union Find",
    statement:
      "An archipelago has `n` islands numbered `0` to `n - 1`. Each `links[i] = [a, b]` is a two-way ferry between islands `a` and `b`; travellers may chain as many ferries as they like. The same ferry may be listed more than once.\n\nCount the pairs of different islands `{x, y}` that are stranded from each other, meaning no chain of ferries leads from `x` to `y`. Each pair is counted once (`{x, y}` and `{y, x}` are the same pair). Return the count.",
    explanation:
      "Testing every pair with a search is O(n^2) searches. Count by groups instead.\n\nUnion the two ends of every ferry so that each connected group has a known size. Two islands are stranded exactly when they sit in different groups. The easiest way to count is by subtraction: there are `n * (n - 1) / 2` pairs in total, and a group of size `s` contains `s * (s - 1) / 2` pairs that CAN reach each other. Subtract that for every group.\n\n(Equivalently, sweep through the groups keeping a running total of islands seen so far and add `size * seen` for each group.)\n\nPitfalls: counting pairs of groups instead of pairs of islands, or counting each pair twice.\n\nTime is nearly O(n + links), space O(n).",
    functionName: 'count_stranded_pairs',
    functionSignature: "def count_stranded_pairs(n: int, links: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def count_stranded_pairs(n: int, links: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5,[[0,1],[2,3]]], expected: 8 },
      { input: [3,[[0,1],[1,2]]], expected: 0 },
      { input: [4,[]], expected: 6 },
    ],
    hiddenTests: [
      { input: [1,[]], expected: 0 },
      { input: [7,[[0,2],[2,4],[5,6],[4,0]]], expected: 17 },
      { input: [6,[[0,1],[1,2],[3,4],[4,5]]], expected: 9 },
      { input: [8,[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]], expected: 7 },
      { input: [6,[[0,1],[0,1],[1,0]]], expected: 14 },
      { input: [9,[[0,1],[2,3],[4,5],[6,7],[1,2],[5,6]]], expected: 24 },
    ],
  },
  {
    id: 'two-team-rumours',
    number: 389,
    title: "Two Team Rumours",
    difficulty: 'Hard',
    topic: "Union Find",
    statement:
      "`n` players numbered `0` to `n - 1` have each been secretly placed on one of exactly two teams. You receive reports one at a time. `reports[i] = [a, b, rel]` (with `a != b`) claims that players `a` and `b` are on the same team when `rel` is `0`, or on different teams when `rel` is `1`.\n\nReturn the index (0-based) of the first report that cannot be true given all the reports before it. If the whole list is consistent, return `-1`.\n\nBecause there are only two teams, claims combine: if `a` and `b` are on different teams and `b` and `c` are on different teams, then `a` and `c` must be on the same team.",
    explanation:
      "Plain union-find can record 'same team', but here 'different team' claims also carry information: two 'different' links in a row make a 'same'. Storing only the direct claims misses these implied facts.\n\nUse a union-find with parity. Alongside `parent[x]` keep `flip[x]`: 0 if `x` is on the same team as its parent, 1 if on the opposite team. `find(x)` returns the root and the parity of `x` relative to that root (XOR of the flips along the path); update `flip` when compressing the path.\n\nFor a report `[a, b, rel]`, find both. If the roots are equal, the relation between `a` and `b` is already forced to be `pa XOR pb`; if that differs from `rel`, this report is the first contradiction. If the roots differ, the report is new information: attach root `ra` under `rb` with `flip[ra] = pa XOR pb XOR rel`, which makes the stored parities agree with the claim.\n\nAn equivalent trick doubles the nodes (`x` and `x + n` meaning 'opposite of x') and uses an ordinary union-find.\n\nTime is nearly O(n + r), space O(n).",
    functionName: 'first_contradiction',
    functionSignature: "def first_contradiction(n: int, reports: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def first_contradiction(n: int, reports: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [3,[[0,1,1],[1,2,1],[0,2,1]]], expected: 2 },
      { input: [3,[[0,1,1],[1,2,1],[0,2,0]]], expected: -1 },
      { input: [4,[[0,1,0],[2,3,0],[1,2,1],[3,0,0]]], expected: 3 },
    ],
    hiddenTests: [
      { input: [2,[[0,1,0],[1,0,1]]], expected: 1 },
      { input: [4,[[0,1,1],[2,3,1],[1,2,0],[0,3,0],[0,2,1],[1,3,0]]], expected: 5 },
      { input: [1,[]], expected: -1 },
      { input: [5,[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,0,1]]], expected: 4 },
      { input: [6,[[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1],[0,2,0],[1,4,1],[0,3,0]]], expected: 8 },
      { input: [5,[[0,1,0],[3,4,0],[1,3,0],[2,4,1],[0,2,0],[0,4,1]]], expected: 4 },
    ],
  },
  {
    id: 'server-shutdown-drill',
    number: 390,
    title: "Server Shutdown Drill",
    difficulty: 'Hard',
    topic: "Union Find",
    statement:
      "A data centre has `n` servers numbered `0` to `n - 1`. Each `links[i] = [a, b]` is a cable between servers `a` and `b`. During a drill the servers listed in `order` (all different) are switched off one at a time, in that order. A switched-off server and all of its cables stop working, and it stays off.\n\nThe servers still running form groups: two running servers are in the same group when a chain of cables through running servers joins them. Return a list with one entry per shutdown: the number of groups among the running servers right after that shutdown. Switched-off servers are not counted as groups, so the count is `0` once every server is off. If `order` is empty, return an empty list.",
    explanation:
      "Union-find can merge sets but cannot split them, so processing the shutdowns forwards would force a full recount (O(n + links)) after each one.\n\nReverse time instead. Viewed backwards, a shutdown is a server being switched ON, which only ever merges groups: exactly what union-find handles.\n\n1. Mark every server in `order` as off. Union the cables whose two ends are both still on. The number of groups is (running servers) minus (successful unions). This is the state after the LAST shutdown.\n2. Walk `order` from last to first. Record the current count as the answer for that shutdown, then switch the server back on: add one group for the server itself, and for each neighbour that is on, union the two and subtract one for every union that actually joined two different sets.\n\nBe careful with the order of 'record, then restore' (recording after restoring shifts every answer by one step), and do not count switched-off servers as groups.\n\nTime is nearly O(n + links), space O(n + links) for the adjacency lists.",
    functionName: 'groups_after_shutdowns',
    functionSignature: "def groups_after_shutdowns(n: int, links: list[list[int]], order: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def groups_after_shutdowns(n: int, links: list[list[int]], order: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5,[[0,1],[0,2],[0,3],[0,4]],[0,1,2]], expected: [4,3,2] },
      { input: [4,[[0,1],[1,2],[2,3],[3,0]],[0,2,1,3]], expected: [1,2,1,0] },
      { input: [3,[],[]], expected: [] },
    ],
    hiddenTests: [
      { input: [5,[[0,1],[1,2],[2,3],[3,4]],[2,0,4]], expected: [2,2,2] },
      { input: [6,[[0,1],[1,2],[3,4]],[5]], expected: [2] },
      { input: [1,[],[0]], expected: [0] },
      { input: [7,[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]],[3,6,1,0]], expected: [1,2,3,2] },
      { input: [6,[[0,1],[0,2],[1,2],[2,3],[3,4],[3,5]],[2,3,0,1,4,5]], expected: [2,3,3,2,1,0] },
      { input: [4,[[0,1],[2,3]],[1,2]], expected: [2,2] },
    ],
  },
  {
    id: 'weight-limited-crossings',
    number: 391,
    title: "Weight Limited Crossings",
    difficulty: 'Hard',
    topic: "Union Find",
    statement:
      "A river delta has `n` islands numbered `0` to `n - 1`. Each `bridges[i] = [a, b, toll]` is a two-way bridge between islands `a` and `b` charging `toll` per crossing. Several bridges may join the same two islands.\n\nEach `queries[j] = [x, y, limit]` asks: can a traveller get from island `x` to island `y` using only bridges whose toll is strictly less than `limit`? A traveller who is already there (`x == y`) needs no bridge, so the answer is `True`.\n\nReturn a list of booleans, one per query, in the order the queries were given. If there are no queries, return an empty list.",
    explanation:
      "Answering each query with its own filtered graph search costs O(n + bridges) per query. The trick is that queries do not have to be answered in the order given.\n\nSort the bridges by toll and sort the query indices by `limit`. Sweep through the queries from the smallest limit upward, keeping one union-find. Before answering a query, add every not-yet-added bridge whose toll is strictly less than its limit. Because limits only increase, bridges are added once and never removed. The query's answer is then `find(x) == find(y)`, written into the result slot of its ORIGINAL index.\n\nWatch the strict inequality: a bridge whose toll equals the limit is not allowed.\n\nThis offline technique costs O(b log b + q log q) for the sorts plus nearly linear union-find work, with O(n + q) space.",
    functionName: 'can_cross_under',
    functionSignature: "def can_cross_under(n: int, bridges: list[list[int]], queries: list[list[int]]) -> list[bool]:",
    starter:
      STARTER_HEADER +
      "def can_cross_under(n: int, bridges: list[list[int]], queries: list[list[int]]) -> list[bool]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [3,[[0,1,2],[1,2,4],[2,0,8],[1,0,16]],[[0,1,2],[0,2,5]]], expected: [false,true] },
      { input: [4,[[0,1,10],[1,2,5],[2,3,9]],[[0,3,11],[0,3,10],[1,2,6],[3,3,1]]], expected: [true,false,true,true] },
    ],
    hiddenTests: [
      { input: [5,[[0,1,3],[1,2,3],[2,3,7],[3,4,1]],[[0,4,8],[0,2,3],[0,2,4],[3,4,1],[3,4,2],[4,0,7]]], expected: [true,false,true,false,true,false] },
      { input: [2,[],[[0,1,100],[1,1,1]]], expected: [false,true] },
      { input: [3,[[0,1,5]],[]], expected: [] },
      { input: [6,[[0,1,4],[1,2,6],[0,2,9],[3,4,2],[4,5,2],[2,3,8]],[[0,5,9],[0,2,7],[0,5,8],[3,5,3],[0,2,6],[3,5,2],[1,4,10]]], expected: [true,true,false,true,false,false,true] },
      { input: [4,[[0,1,5],[0,1,2],[1,2,5],[2,3,5]],[[0,1,3],[0,3,5],[0,3,6],[0,2,3]]], expected: [true,false,true,false] },
    ],
  },
  {
    id: 'longest-quiet-spell',
    number: 392,
    title: "Longest Quiet Spell",
    difficulty: 'Easy',
    topic: "Interval",
    statement:
      "A lighthouse log records when ships were in view. Each `intervals[i] = [start, end]` with `start < end` is one sighting; the list is not sorted and sightings may overlap or sit inside one another.\n\nA quiet spell is a stretch of time, after the earliest sighting begins and before the latest sighting ends, during which no ship is in view. Its length is the time between the end of the coverage before it and the start of the next sighting. Return the length of the longest quiet spell. Return `0` if there is none, which includes an empty list and sightings that only touch (one ending exactly when the next starts).",
    explanation:
      "Sort the sightings by start time and sweep left to right while tracking `reach`, the furthest end time seen so far. When the next sighting starts after `reach`, the gap `start - reach` is a quiet spell; keep the largest. Then update `reach = max(reach, end)`.\n\nThe key detail is that `reach` must be the maximum end so far, not the end of the previous sighting. A long sighting such as `[1, 20]` followed by `[2, 3]` and `[10, 12]` has no quiet spell at all, but comparing neighbours only would report the gap between 3 and 10.\n\nSorting costs O(n log n); the sweep is O(n) with O(1) extra space.",
    functionName: 'widest_idle_gap',
    functionSignature: "def widest_idle_gap(intervals: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def widest_idle_gap(intervals: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1,3],[6,9],[4,5]]], expected: 1 },
      { input: [[[1,20],[2,3],[10,12]]], expected: 0 },
      { input: [[[5,8],[8,10]]], expected: 0 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[[4,6]]], expected: 0 },
      { input: [[[10,12],[1,2],[30,31],[13,29]]], expected: 8 },
      { input: [[[1,10],[2,3],[5,6],[14,15],[12,13]]], expected: 2 },
      { input: [[[-10,-5],[0,3],[-4,-3]]], expected: 3 },
      { input: [[[1,5],[2,3],[9,11],[4,6]]], expected: 3 },
    ],
  },
  {
    id: 'gapless-guard-duty',
    number: 393,
    title: "Gapless Guard Duty",
    difficulty: 'Easy',
    topic: "Interval",
    statement:
      "A museum must have a guard on duty for the whole time window from `start` to `end` (with `start < end`). Each `shifts[i] = [s, e]` (with `s < e`) is a guard on duty continuously from time `s` to time `e`. The list is not sorted, and shifts may overlap or extend outside the window.\n\nTime is continuous, so a shift ending at `5` followed by one starting at `5` leaves no gap, but a shift ending at `5` followed by one starting at `6` leaves the stretch between `5` and `6` unguarded.\n\nReturn `True` if every moment of the window is covered by at least one shift, otherwise `False`. With no shifts the answer is `False`.",
    explanation:
      "Sort the shifts by start time and track `reach`, the time up to which the window is known to be covered. Start with `reach = start`.\n\nFor each shift in order: if it starts after `reach`, there is a hole that no later shift can fill (they start even later), so stop. Otherwise extend `reach = max(reach, e)`. At the end the window is covered exactly when `reach >= end`.\n\nA tempting shortcut is to tick off the integer times `start..end` and check each is inside some shift. That fails on continuous time: shifts `[1, 2]` and `[3, 4]` contain every integer from 1 to 4 yet leave the stretch between 2 and 3 empty.\n\nSorting costs O(n log n); the sweep is O(n).",
    functionName: 'is_window_covered',
    functionSignature: "def is_window_covered(shifts: list[list[int]], start: int, end: int) -> bool:",
    starter:
      STARTER_HEADER +
      "def is_window_covered(shifts: list[list[int]], start: int, end: int) -> bool:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1,5],[5,9]],2,8], expected: true },
      { input: [[[1,5],[6,9]],2,8], expected: false },
      { input: [[[4,10],[0,3],[2,6]],1,9], expected: true },
    ],
    hiddenTests: [
      { input: [[],0,1], expected: false },
      { input: [[[1,2],[3,4]],1,4], expected: false },
      { input: [[[5,9],[1,3]],5,9], expected: true },
      { input: [[[2,4],[4,7],[7,9]],1,9], expected: false },
      { input: [[[0,3],[2,5],[5,8]],0,9], expected: false },
      { input: [[[6,10],[0,2],[1,7]],0,10], expected: true },
    ],
  },
  {
    id: 'studio-booking-desk',
    number: 394,
    title: "Studio Booking Desk",
    difficulty: 'Easy',
    topic: "Interval",
    statement:
      "A recording studio handles booking requests in the order they arrive. Each `requests[i] = [start, end]` (with `start < end`) asks for the studio from `start` up to but not including `end`, so a booking that ends at `10` does not clash with one that starts at `10`.\n\nA request is accepted if it does not clash with any request accepted earlier; otherwise it is rejected. Rejected requests take up no time, so they never block later requests.\n\nReturn a list of booleans, one per request in order: `True` if accepted, `False` if rejected. If there are no requests, return an empty list.",
    explanation:
      "Keep a list of the bookings accepted so far. For each new request `[s, e)`, compare it against every accepted booking `[ks, ke)`. Two half-open ranges clash exactly when `s < ke and ks < e`; put the other way, they are compatible when one ends at or before the other starts.\n\nIf nothing clashes, accept the request and add it to the list. If something clashes, reject it and, importantly, do NOT store it: a rejected request must not block later ones.\n\nThe simple version is O(n^2) time in the worst case, which is fine for small inputs. Keeping the accepted bookings in a sorted list and using binary search to look only at the neighbours on either side brings each check down to O(log n) (plus the insertion cost).",
    functionName: 'accepted_bookings',
    functionSignature: "def accepted_bookings(requests: list[list[int]]) -> list[bool]:",
    starter:
      STARTER_HEADER +
      "def accepted_bookings(requests: list[list[int]]) -> list[bool]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[10,20],[15,25],[20,30]]], expected: [true,false,true] },
      { input: [[[1,5],[3,8],[6,9],[5,6]]], expected: [true,false,true,true] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[[5,10],[1,5],[10,12],[4,6],[0,1],[9,11]]], expected: [true,true,true,false,true,false] },
      { input: [[[1,10],[2,3],[4,5],[10,11],[0,20]]], expected: [true,false,false,true,false] },
      { input: [[[3,4],[3,4],[2,5],[4,6],[1,3]]], expected: [true,false,false,true,true] },
      { input: [[[1,3],[2,6],[5,8],[7,9],[3,5]]], expected: [true,false,true,false,true] },
    ],
  },
  {
    id: 'outermost-intervals',
    number: 395,
    title: "Outermost Intervals",
    difficulty: 'Medium',
    topic: "Interval",
    statement:
      "You are given a list of `[start, end]` intervals with `start < end`, in no particular order. Interval `[a, b]` is swallowed by interval `[c, d]` when `c <= a` and `b <= d`, that is, when it lies entirely inside the other (sharing an endpoint still counts as inside).\n\nFirst treat identical intervals as a single interval. Then discard every interval that is swallowed by a different interval. Return how many intervals are left. An empty list gives `0`.",
    explanation:
      "Comparing every pair is O(n^2). Sorting makes one pass enough.\n\nSort by start ascending and, for equal starts, by end DESCENDING. In that order, any interval that could swallow the current one comes earlier: it must start no later, and among equal starts the longer one is first. So sweep while tracking `reach`, the largest end seen so far. If the current end is `<= reach`, some earlier interval starts at or before it and ends at or after it, so it is swallowed. Otherwise it survives: count it and update `reach`.\n\nThe tie-break matters. With `[1, 4]` before `[1, 9]` (ends ascending) the sweep would wrongly keep both. Identical intervals are handled by removing duplicates first (or equivalently by the `<=` test, which lets only the first copy through).\n\nTime is O(n log n) for the sort, space O(n) for the de-duplicated copy.",
    functionName: 'count_outer_intervals',
    functionSignature: "def count_outer_intervals(intervals: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def count_outer_intervals(intervals: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1,4],[3,6],[2,8]]], expected: 2 },
      { input: [[[1,4],[1,9],[2,3]]], expected: 1 },
      { input: [[[5,7],[5,7],[1,2]]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[[1,2],[2,3],[3,4]]], expected: 3 },
      { input: [[[3,9],[1,9],[2,9],[1,10]]], expected: 1 },
      { input: [[[1,5],[1,5],[1,5]]], expected: 1 },
      { input: [[[2,6],[1,4],[5,8],[2,4],[6,8],[1,8]]], expected: 1 },
      { input: [[[4,7],[1,3],[2,3],[4,5],[5,7],[8,9]]], expected: 3 },
    ],
  },
  {
    id: 'road-closure-cutout',
    number: 396,
    title: "Road Closure Cutout",
    difficulty: 'Medium',
    topic: "Interval",
    statement:
      "A highway's open stretches are listed as `intervals`, where each `[start, end]` (with `start < end`) covers the kilometres from `start` up to but not including `end`. The stretches are sorted by `start` and do not overlap.\n\nRoadworks close the stretch `cut = [from, to]` (with `from < to`), also from `from` up to but not including `to`. Return the stretches that remain open, sorted by `start`, each as a `[start, end]` pair. A stretch that is only partly closed is trimmed, one closed in the middle splits into two pieces, and a stretch that is entirely closed disappears. Never return an empty piece (one whose `start` equals its `end`). If nothing remains open, return an empty list.",
    explanation:
      "Because the input is already sorted and disjoint, each stretch can be handled on its own and the output stays sorted.\n\nFor a stretch `[s, e)` and closure `[from, to)`:\n- If `e <= from` or `s >= to` they do not overlap; keep the stretch unchanged.\n- Otherwise there is an overlap. Whatever sticks out on the left survives: if `s < from`, emit `[s, from]`. Whatever sticks out on the right survives: if `e > to`, emit `[to, e]`.\n\nA stretch that sticks out on both sides emits two pieces, and one fully inside the closure emits none. The strict comparisons are what prevent zero-length pieces such as `[5, 5]` when a stretch begins exactly where the closure begins.\n\nOne pass: O(n) time, O(1) extra space besides the output.",
    functionName: 'carve_out',
    functionSignature: "def carve_out(intervals: list[list[int]], cut: list[int]) -> list[list[int]]:",
    starter:
      STARTER_HEADER +
      "def carve_out(intervals: list[list[int]], cut: list[int]) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[0,2],[3,4],[5,7]],[1,6]], expected: [[0,1],[6,7]] },
      { input: [[[0,10]],[4,6]], expected: [[0,4],[6,10]] },
      { input: [[[1,3],[5,8]],[3,5]], expected: [[1,3],[5,8]] },
    ],
    hiddenTests: [
      { input: [[],[1,2]], expected: [] },
      { input: [[[2,5]],[2,5]], expected: [] },
      { input: [[[0,4],[4,8],[10,12]],[4,11]], expected: [[0,4],[11,12]] },
      { input: [[[1,4],[6,9],[12,15]],[2,3]], expected: [[1,2],[3,4],[6,9],[12,15]] },
      { input: [[[1,4],[6,9]],[6,7]], expected: [[1,4],[7,9]] },
      { input: [[[1,4],[6,9]],[8,9]], expected: [[1,4],[6,8]] },
    ],
  },
  {
    id: 'fewest-patrol-drones',
    number: 397,
    title: "Fewest Patrol Drones",
    difficulty: 'Medium',
    topic: "Interval",
    statement:
      "A pipeline runs from kilometre `0` to kilometre `length` (with `length >= 1`). Each `clips[i] = [start, end]` (with `0 <= start < end`) is a drone that can watch the continuous stretch from `start` to `end`; the list is not sorted, and a drone's stretch may run past `length`.\n\nChoose as few drones as possible so that every point of the pipeline from `0` to `length` is watched. Stretches may overlap, and two stretches that merely touch (one ends at `5`, the next starts at `5`) leave no gap. Return the smallest number of drones needed, or `-1` if the whole pipeline cannot be watched.",
    explanation:
      "This is a greedy covering problem. Suppose the pipeline is covered up to `reach`. The next drone must start at or before `reach` (otherwise there is a gap), and among all such drones the best one is the one that extends furthest: it can do everything any other candidate could do.\n\nSort the drones by start. Loop while `reach < length`: scan forward through all drones whose start is `<= reach`, remembering the furthest end `far`. If `far` did not get past `reach`, nothing can extend the coverage, so return -1. Otherwise set `reach = far` and count one drone.\n\nBecause the scan pointer only moves forward, the loop after sorting is O(n). Picking the first drone that fits, or the longest drone overall, are tempting but wrong greedy rules.\n\nTime O(n log n), space O(1) beyond the sort.",
    functionName: 'fewest_clips',
    functionSignature: "def fewest_clips(clips: list[list[int]], length: int) -> int:",
    starter:
      STARTER_HEADER +
      "def fewest_clips(clips: list[list[int]], length: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[0,4],[2,6],[4,9],[6,10]],10], expected: 3 },
      { input: [[[0,3],[4,8]],8], expected: -1 },
      { input: [[[2,5],[0,2],[1,9]],9], expected: 2 },
    ],
    hiddenTests: [
      { input: [[],5], expected: -1 },
      { input: [[[1,5]],5], expected: -1 },
      { input: [[[0,1],[0,2],[0,3],[3,4],[2,6],[5,7],[6,7]],7], expected: 3 },
      { input: [[[0,2],[1,5],[2,3],[3,9],[5,6],[5,12]],10], expected: 3 },
      { input: [[[0,4],[4,7],[7,9]],10], expected: -1 },
      { input: [[[1,5],[4,7],[0,4],[5,7]],7], expected: 2 },
    ],
  },
  {
    id: 'next-slot-lookup',
    number: 398,
    title: "Next Slot Lookup",
    difficulty: 'Medium',
    topic: "Interval",
    statement:
      "A relay race is planned from a list of time slots, `intervals[i] = [start, end]` with `start < end`. For slot `i`, a follow-on slot is any slot whose `start` is greater than or equal to slot `i`'s `end`.\n\nFor every slot `i`, find the follow-on slot with the smallest `start`. If several follow-on slots share that smallest `start`, pick the one with the lowest index. Return a list `result` where `result[i]` is the index of the chosen slot, or `-1` if slot `i` has no follow-on slot. If `intervals` is empty, return an empty list.",
    explanation:
      "For each slot we need the smallest start that is `>= end`. Scanning all slots for each one is O(n^2); sorting the starts once lets binary search do it.\n\nBuild a list of `(start, index)` pairs and sort it. Sorting by start and then by index means that among equal starts the lowest index comes first, which is exactly the tie-break required. For each slot, binary search (`bisect_left`) the sorted starts for the first position whose start is `>= end`. If the position is past the end of the list there is no follow-on slot, so the answer is -1; otherwise the answer is the original index stored at that position.\n\nUse `bisect_left`, not `bisect_right`: a slot that starts exactly when another ends does qualify.\n\nTime is O(n log n), space O(n).",
    functionName: 'next_interval_index',
    functionSignature: "def next_interval_index(intervals: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def next_interval_index(intervals: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1,4],[4,6],[2,3],[6,9]]], expected: [1,3,1,-1] },
      { input: [[[5,8],[1,2]]], expected: [-1,0] },
      { input: [[[1,2],[3,5],[3,4],[2,3]]], expected: [3,-1,-1,1] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[[1,2]]], expected: [-1] },
      { input: [[[4,5],[2,4],[1,2],[7,8],[5,7],[4,6]]], expected: [4,0,1,-1,3,3] },
      { input: [[[1,10],[2,3],[3,4],[10,11],[10,12]]], expected: [3,2,3,-1,-1] },
      { input: [[[-5,-1],[-1,0],[-3,-2],[-2,5]]], expected: [1,-1,3,-1] },
      { input: [[[6,7],[6,9],[1,6],[2,5]]], expected: [-1,-1,0,0] },
    ],
  },
  {
    id: 'bookable-gaps',
    number: 399,
    title: "Bookable Gaps",
    difficulty: 'Medium',
    topic: "Interval",
    statement:
      "A clinic is open from `open_time` to `close_time` (with `open_time < close_time`). `busy` lists the doctor's existing commitments as `[start, end]` pairs with `start < end`; they are not sorted, may overlap each other, and may begin before opening or finish after closing.\n\nA free gap is a stretch inside opening hours with no commitment, made as long as possible (it runs from opening time or the end of a commitment up to the start of the next commitment or closing time). Return every free gap whose length is at least `min_len` (with `min_len >= 1`), as `[start, end]` pairs sorted by `start`. If there are none, return an empty list.",
    explanation:
      "Sort the commitments by start and sweep with a cursor `cur`, the earliest time not yet known to be busy. Start at `cur = open_time`.\n\nFor each commitment `[s, e]`: if `s > cur`, the stretch from `cur` to `min(s, close_time)` is free; keep it if it is at least `min_len` long. Then move the cursor with `cur = max(cur, e)`. Using `max` is essential: a short commitment nested inside a long one must not pull the cursor backwards and invent a gap in the middle of the long one. Stop early once `cur >= close_time`.\n\nAfter the loop, the tail from `cur` to `close_time` is one more candidate gap.\n\nCommitments that end before opening are harmless: they never open a gap (their start is before `cur`) and `max` keeps the cursor at opening time.\n\nTime O(n log n) for the sort, O(1) extra space besides the output.",
    functionName: 'free_slots',
    functionSignature: "def free_slots(busy: list[list[int]], open_time: int, close_time: int, min_len: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER +
      "def free_slots(busy: list[list[int]], open_time: int, close_time: int, min_len: int) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[10,12],[14,15]],9,17,1], expected: [[9,10],[12,14],[15,17]] },
      { input: [[[10,12],[14,15]],9,17,2], expected: [[12,14],[15,17]] },
      { input: [[[9,16],[10,11],[13,14]],8,18,1], expected: [[8,9],[16,18]] },
    ],
    hiddenTests: [
      { input: [[],9,17,3], expected: [[9,17]] },
      { input: [[[5,10],[16,30]],9,17,1], expected: [[10,16]] },
      { input: [[[1,3],[12,14],[2,6],[20,25],[13,15]],4,18,2], expected: [[6,12],[15,18]] },
      { input: [[[11,12],[9,10],[10,11],[15,17]],9,17,3], expected: [[12,15]] },
      { input: [[[1,2],[30,40],[12,13]],9,17,3], expected: [[9,12],[13,17]] },
      { input: [[[9,11],[11,13],[14,17]],9,17,1], expected: [[13,14]] },
    ],
  },
  {
    id: 'tightest-fit-range',
    number: 400,
    title: "Tightest Fit Range",
    difficulty: 'Hard',
    topic: "Interval",
    statement:
      "A warehouse has shelving units; unit `i` holds the box numbers from `intervals[i][0]` to `intervals[i][1]` inclusive (with `start <= end`), so its size is `end - start + 1`. Units are in no particular order and their ranges may overlap.\n\nFor each box number in `queries`, find the smallest unit whose range contains it (a range contains its two end values). Return a list with one entry per query, in the order given: the size of that smallest unit, or `-1` if no unit contains the box. If `queries` is empty, return an empty list.",
    explanation:
      "Checking every unit for every query is O(n * q). Answering the queries offline, in sorted order, turns the problem into a sweep.\n\nSort the units by start, and visit the query indices in increasing order of query value. Keep a min-heap of `(size, end)` for units that have already started. For a query `q`:\n1. Push every unit whose start is `<= q` (a pointer walks the sorted units once).\n2. Pop from the top while the top unit's end is `< q`: it has already finished, and since later queries are even larger it can never matter again.\n3. If the heap is non-empty, its top is the smallest unit that started at or before `q` and ends at or after `q`; record its size. Otherwise record -1.\n\nStale units deeper in the heap are harmless; they are removed lazily when they surface. Write each answer into the slot of the query's original position.\n\nRemember the size is `end - start + 1` because both ends are included.\n\nTime O((n + q) log (n + q)), space O(n + q).",
    functionName: 'tightest_interval_sizes',
    functionSignature: "def tightest_interval_sizes(intervals: list[list[int]], queries: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER +
      "def tightest_interval_sizes(intervals: list[list[int]], queries: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1,4],[2,4],[3,6],[4,4]],[2,3,4,5]], expected: [3,3,1,4] },
      { input: [[[5,10]],[4,5,10,11]], expected: [-1,6,6,-1] },
    ],
    hiddenTests: [
      { input: [[],[1,2]], expected: [-1,-1] },
      { input: [[[1,3]],[]], expected: [] },
      { input: [[[1,10],[2,3],[5,6],[4,9]],[10,1,3,7,5,4,11,0]], expected: [10,10,2,6,2,6,-1,-1] },
      { input: [[[2,3],[2,5],[1,8],[20,25]],[2,19,22,5,5,8,9]], expected: [2,-1,6,4,4,8,-1] },
      { input: [[[3,3],[1,9],[4,6],[5,5]],[3,5,6,2,4]], expected: [1,1,3,9,3] },
      { input: [[[1,2],[1,2],[10,12],[2,10]],[2,1,10,6,13]], expected: [2,2,3,9,-1] },
    ],
  },
  {
    id: 'double-witness-checkpoints',
    number: 401,
    title: "Double Witness Checkpoints",
    difficulty: 'Hard',
    topic: "Interval",
    statement:
      "Inspectors walk stretches of a numbered street: stretch `i` covers every house number from `intervals[i][0]` to `intervals[i][1]` inclusive, with `start < end` (so each stretch has at least two houses). Stretches are in no particular order and may overlap.\n\nYou may install a checkpoint at any house number (at most one per house). Every stretch must contain at least two checkpoints. One checkpoint can serve any number of stretches. Return the smallest number of checkpoints needed. An empty list needs `0`.",
    explanation:
      "Greedy by right endpoint works, but the details are delicate.\n\nSort the stretches by end ascending and, for equal ends, by start DESCENDING (shortest first). Keep the two largest checkpoints placed so far, `p1 < p2`. For each stretch `[s, e]`:\n- If `s <= p1`, both checkpoints are already inside it (they are at most the current end, because of the sort order). Nothing to add.\n- Else if `s <= p2`, only `p2` is inside. Add one checkpoint at `e`, the position most useful to later stretches, so now `p1, p2 = p2, e`.\n- Otherwise neither is inside. Add two checkpoints at `e - 1` and `e`.\n\nPlacing checkpoints as far right as possible is safe because every later stretch ends at or after `e`; a point further right can only help more of them. The descending-start tie-break ensures the tightest stretch with a given end is handled first, so the middle case never tries to put a second checkpoint on a house that already has one.\n\nSimply doubling the answer of the classic 'one point per interval' problem overcounts: stretches `[1, 4]` and `[3, 6]` need one point each in that problem, but two shared checkpoints at 3 and 4 serve both here.\n\nTime O(n log n), space O(1) beyond the sort.",
    functionName: 'min_checkpoints',
    functionSignature: "def min_checkpoints(intervals: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER +
      "def min_checkpoints(intervals: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1,4],[3,6]]], expected: 2 },
      { input: [[[1,3],[4,6]]], expected: 4 },
      { input: [[[1,3],[3,7],[5,7],[7,8]]], expected: 5 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[[1,3],[1,4],[2,5],[3,5]]], expected: 3 },
      { input: [[[1,2],[2,3],[2,4],[4,5]]], expected: 5 },
      { input: [[[2,10],[3,7],[3,15],[4,11],[6,12],[6,16],[7,8],[7,11],[7,15],[11,12]]], expected: 5 },
      { input: [[[1,10],[4,5],[8,9],[2,3]]], expected: 6 },
      { input: [[[1,5],[4,5],[3,5]]], expected: 2 },
    ],
  },
  {
    id: 'bit-chain-value',
    number: 402,
    title: "Bit Chain Value",
    difficulty: 'Easy',
    topic: "Linked List",
    statement:
      "A binary number is stored in a singly linked list, one bit per node (each value is `0` or `1`), with the most significant bit at the `head`. Leading zeros are allowed. Return the number as an ordinary integer. An empty list represents `0`.\n\nExamples show each list as its values in order.",
    explanation:
      "You can't index into a linked list or know its length up front, but you don't need to. Read the bits the same way you read a number digit by digit: keep a running `value`, and for every node do `value = value * 2 + node.val`. Doubling shifts everything seen so far one place to the left, making room for the new lowest bit.\n\nThis handles leading zeros naturally (doubling 0 stays 0) and the empty list (the loop never runs, leaving 0).\n\nA common slip is to treat the head as the LEAST significant bit and add `val * 2**i`, which reverses the number.\n\nOne pass: O(n) time, O(1) space.",
    functionName: 'binary_list_value',
    functionSignature: "def binary_list_value(head: Optional[ListNode]) -> int:",
    starter:
      STARTER_HEADER +
      "# ListNode has .val, .next. Make one with ListNode(val). Empty list is None.\ndef binary_list_value(head: Optional[ListNode]) -> int:\n    # Your code here\n    pass\n",
    structs: { args: ['list'] },
    examples: [
      { input: [[1,0,1]], expected: 5 },
      { input: [[1,1,0,0]], expected: 12 },
      { input: [[0,0,1,1]], expected: 3 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[0]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[1,0,0,0,0,0,0,0,0,0]], expected: 512 },
      { input: [[1,1,1,0,1,0,1,1]], expected: 235 },
      { input: [[0,1,0]], expected: 2 },
    ],
  },
  {
    id: 'keep-some-skip-some',
    number: 403,
    title: "Keep Some Skip Some",
    difficulty: 'Easy',
    topic: "Linked List",
    statement:
      "Given the `head` of a singly linked list and two positive integers `keep` and `skip`, thin the list out by repeating this pattern from the head until the list runs out: keep the next `keep` nodes, then remove the next `skip` nodes. If the list ends partway through a keep or a skip step, just stop there.\n\nReturn the head of the thinned list. An empty list stays empty.\n\nExamples show each list as its values in order.",
    explanation:
      "Because the pattern starts with a keep step and `keep >= 1`, the head always survives, so no dummy node is needed.\n\nWalk with a pointer `node` sitting on the first node of a keep block. Advance it `keep - 1` times so it rests on the LAST kept node of the block (stop if the list ends). Then run a second pointer forward from `node.next` over up to `skip` nodes. Link `node.next` to wherever that pointer stopped, which cuts the skipped nodes out in one assignment, and continue from there.\n\nThe off-by-one to watch is advancing `keep` times instead of `keep - 1`: you need to stand on the last kept node, not past it, in order to rewire its `next`.\n\nEvery node is visited once: O(n) time, O(1) space.",
    functionName: 'keep_and_skip',
    functionSignature: "def keep_and_skip(head: Optional[ListNode], keep: int, skip: int) -> Optional[ListNode]:",
    starter:
      STARTER_HEADER +
      "# ListNode has .val, .next. Make one with ListNode(val). Empty list is None.\ndef keep_and_skip(head: Optional[ListNode], keep: int, skip: int) -> Optional[ListNode]:\n    # Your code here\n    pass\n",
    structs: { args: ['list', null, null], returns: 'list' },
    examples: [
      { input: [[1,2,3,4,5,6,7,8],2,1], expected: [1,2,4,5,7,8] },
      { input: [[1,2,3,4,5],1,3], expected: [1,5] },
      { input: [[1,2,3],5,2], expected: [1,2,3] },
    ],
    hiddenTests: [
      { input: [[],1,1], expected: [] },
      { input: [[7],1,1], expected: [7] },
      { input: [[1,2,3,4,5,6,7,8,9,10],3,2], expected: [1,2,3,6,7,8] },
      { input: [[1,2,3,4,5,6],1,1], expected: [1,3,5] },
      { input: [[4,4,4,5,5,5,6],2,4], expected: [4,4,6] },
      { input: [[1,2,3,4,5,6,7],3,1], expected: [1,2,3,5,6,7] },
    ],
  },
  {
    id: 'zero-separated-totals',
    number: 404,
    title: "Zero Separated Totals",
    difficulty: 'Medium',
    topic: "Linked List",
    statement:
      "A till roll is stored as a singly linked list of non-negative integers. A node holding `0` is a separator; every other node is a sale amount. A receipt is a maximal run of consecutive non-zero nodes (it ends at a separator or at the end of the list).\n\nReturn the head of a list with one node per receipt, in order, holding that receipt's total. Separators themselves produce nothing: several separators in a row, or separators at the very start or end of the list, do not create empty receipts. If the list has no sale amounts at all (including an empty list), return an empty list.\n\nExamples show each list as its values in order.",
    explanation:
      "Sweep the list once with a running `total` and a flag saying whether a receipt is currently open.\n\n- On a non-zero node: add it to `total` and mark the receipt open.\n- On a zero: if a receipt is open, append a node with `total` to the output, then reset `total` and close the receipt. If no receipt is open (leading zero, or a second zero in a row), do nothing.\n- After the loop: if a receipt is still open, the list ended without a final separator, so append the last total too.\n\nBuild the output behind a dummy head with a `tail` pointer so appending is O(1). You could also reuse the first node of each run in place to avoid allocating.\n\nThe usual bugs are emitting a `0` node for back-to-back separators and dropping the final receipt when the list doesn't end with a separator. The explicit open flag (rather than testing `total > 0`) keeps the logic obviously right.\n\nO(n) time, O(1) extra space besides the output.",
    functionName: 'segment_totals',
    functionSignature: "def segment_totals(head: Optional[ListNode]) -> Optional[ListNode]:",
    starter:
      STARTER_HEADER +
      "# ListNode has .val, .next. Make one with ListNode(val). Empty list is None.\ndef segment_totals(head: Optional[ListNode]) -> Optional[ListNode]:\n    # Your code here\n    pass\n",
    structs: { args: ['list'], returns: 'list' },
    examples: [
      { input: [[0,3,1,0,4,5,2,0]], expected: [4,11] },
      { input: [[2,3,0,0,7]], expected: [5,7] },
      { input: [[0,0,0]], expected: [] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[5]], expected: [5] },
      { input: [[0,1,0,3,0,2,2,0]], expected: [1,3,4] },
      { input: [[4,0,0,0,6,1]], expected: [4,7] },
      { input: [[0,0,9,9,0,0,1,0,0]], expected: [18,1] },
      { input: [[1,2,3,4]], expected: [10] },
    ],
  },
  {
    id: 'no-taller-behind',
    number: 405,
    title: "No Taller Behind",
    difficulty: 'Medium',
    topic: "Linked List",
    statement:
      "People queue in a singly linked list, each node holding a height, with the `head` at the front. Remove every person who has someone strictly taller standing anywhere behind them (later in the list). People of equal height do not remove each other.\n\nReturn the head of the remaining list, keeping the survivors in their original order. An empty list stays empty.\n\nExamples show each list as its values in order.",
    explanation:
      "Comparing each node only with the node right after it is not enough: in `5 -> 2 -> 13`, the 5 must go because of the 13 two places back, even though its direct neighbour is smaller.\n\nThe survivors, read front to back, never increase, which suggests a monotonic stack. Walk the list; before pushing a node, pop every node on the stack whose value is strictly smaller (those people now have someone taller behind them). Then push the node. Equal values are not popped. At the end the stack holds exactly the survivors in order; relink them and return the bottom of the stack.\n\nAlternatives with O(1) extra space: reverse the list, keep each node that is at least the running maximum, and reverse back; or recurse to the end and filter on the way out.\n\nEach node is pushed and popped at most once: O(n) time, O(n) space for the stack.",
    functionName: 'drop_overshadowed',
    functionSignature: "def drop_overshadowed(head: Optional[ListNode]) -> Optional[ListNode]:",
    starter:
      STARTER_HEADER +
      "# ListNode has .val, .next. Make one with ListNode(val). Empty list is None.\ndef drop_overshadowed(head: Optional[ListNode]) -> Optional[ListNode]:\n    # Your code here\n    pass\n",
    structs: { args: ['list'], returns: 'list' },
    examples: [
      { input: [[5,2,13,3,8]], expected: [13,8] },
      { input: [[4,4,4]], expected: [4,4,4] },
      { input: [[9,7,8,1]], expected: [9,8,1] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1,2,3,4]], expected: [4] },
      { input: [[5,4,3,2,1]], expected: [5,4,3,2,1] },
      { input: [[3,7,7,2,7,1,1]], expected: [7,7,7,1,1] },
      { input: [[10,1,9,2,8,3,8]], expected: [10,9,8,8] },
      { input: [[2,9,2]], expected: [9,2] },
    ],
  },
  {
    id: 'flip-even-length-blocks',
    number: 406,
    title: "Flip Even Length Blocks",
    difficulty: 'Medium',
    topic: "Linked List",
    statement:
      "Split a singly linked list into consecutive blocks: the first block has 1 node, the second has 2 nodes, the third has 3, and so on. The final block takes whatever nodes are left, so it may be shorter than planned.\n\nReverse the nodes inside every block whose actual length is even, and leave blocks of odd length untouched. Blocks stay in their original order. Return the head of the resulting list. An empty list stays empty.\n\nNote that the last block is judged by how many nodes it really has: a block planned for 4 nodes that only gets 3 is odd and is not reversed, while a block planned for 3 that only gets 2 is reversed.\n\nExamples show each list as its values in order.",
    explanation:
      "The first block is always a single node, so the head never changes. Keep `prev`, the last node of the block before the one you're about to process, and the planned `size` (starting at 2).\n\nFor each block:\n1. Measure it. Walk from `prev.next` up to `size` steps, counting how many nodes actually exist, and remember the node just after the block.\n2. If the count is even, reverse exactly those `count` nodes with the standard pointer-reversal loop, starting the 'reversed so far' pointer at the node after the block so the tail is already linked. Reconnect `prev.next` to the new first node; the block's old first node is now its last and becomes the new `prev`.\n3. If the count is odd, simply advance `prev` by `count` nodes.\n4. Increase `size` by one.\n\nThe classic mistake is deciding by the planned size instead of the measured count, which goes wrong only on the final, short block.\n\nEvery node is touched a constant number of times: O(n) time, O(1) space.",
    functionName: 'flip_even_groups',
    functionSignature: "def flip_even_groups(head: Optional[ListNode]) -> Optional[ListNode]:",
    starter:
      STARTER_HEADER +
      "# ListNode has .val, .next. Make one with ListNode(val). Empty list is None.\ndef flip_even_groups(head: Optional[ListNode]) -> Optional[ListNode]:\n    # Your code here\n    pass\n",
    structs: { args: ['list'], returns: 'list' },
    examples: [
      { input: [[1,2,3,4,5,6,7,8,9,10]], expected: [1,3,2,4,5,6,10,9,8,7] },
      { input: [[1,2,3,4,5,6,7,8,9]], expected: [1,3,2,4,5,6,7,8,9] },
      { input: [[1,2,3,4,5]], expected: [1,3,2,5,4] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[1,2]], expected: [1,2] },
      { input: [[5,2,6,3,9,1,7,3,8,4]], expected: [5,6,2,3,9,1,4,8,3,7] },
      { input: [[1,2,3,4,5,6,7,8]], expected: [1,3,2,4,5,6,8,7] },
      { input: [[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]], expected: [1,3,2,4,5,6,10,9,8,7,11,12,13,14,15,17,16] },
      { input: [[4,3,2,1]], expected: [4,2,3,1] },
    ],
  },
];
