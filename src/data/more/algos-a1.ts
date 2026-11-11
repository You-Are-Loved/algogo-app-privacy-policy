// Algorithm practice problems 351-378 (batch algos-a1): Simulation and Sorting.
// Expected values are produced by scripts/fixtures/algos-a1.py.
import type { Blind75Problem } from '../blind75';

const STARTER_HEADER = '# Write your solution below. Do not rename the function.\n';

export const problems: Blind75Problem[] = [
  {
    id: "elevator-trip-log",
    number: 351,
    title: "Elevator Trip Log",
    difficulty: "Easy",
    topic: "Simulation",
    statement:
      "An elevator is parked at floor `start`. It then serves a list of `trips` strictly in the order given. Each trip is a pair `[pickup, dropoff]`: the elevator first travels from wherever it currently is to floor `pickup`, then carries the passenger to floor `dropoff`, and stays there until the next trip.\n\nMoving between two neighbouring floors counts as travelling `1` floor. Floors can be negative (basement levels), and a trip may have `pickup == dropoff`.\n\nReturn the total number of floors the elevator travels while serving every trip. If `trips` is empty, return `0`.",
    explanation:
      "This is a direct simulation with one piece of state: the floor the elevator is on right now.\n\nFor each trip, add `abs(current - pickup)` for the empty ride to the passenger, then `abs(pickup - dropoff)` for the ride itself, and set `current = dropoff`. The common mistake is to sum only the passenger rides and forget the empty repositioning leg, or to forget that the elevator does **not** return to `start` between trips.\n\nUse `abs` so that rides going down (and basement floors) count the same as rides going up. One pass over the trips: O(n) time, O(1) extra space.",
    functionName: "elevator_floors_travelled",
    functionSignature: "def elevator_floors_travelled(start: int, trips: list[list[int]]) -> int:",
    starter:
      STARTER_HEADER + "def elevator_floors_travelled(start: int, trips: list[list[int]]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [0, [[3, 5], [5, 1]]], expected: 9 },
      { input: [2, [[2, 6]]], expected: 4 },
      { input: [4, [[1, 1], [6, 0]]], expected: 14 },
    ],
    hiddenTests: [
      { input: [4, []], expected: 0 },
      { input: [1, [[1, 1]]], expected: 0 },
      { input: [-2, [[3, -1], [0, 4]]], expected: 14 },
      { input: [10, [[0, 10], [0, 10], [0, 10]]], expected: 60 },
      { input: [5, [[7, 7], [2, 9]]], expected: 14 },
      { input: [0, [[-3, -3], [-3, 2], [2, -3]]], expected: 13 },
    ],
  },
  {
    id: "battery-event-log",
    number: 352,
    title: "Battery Event Log",
    difficulty: "Easy",
    topic: "Simulation",
    statement:
      "A phone battery starts at `charge` percent (an integer from `1` to `100`). You are given a list of non-zero integers `events`, processed in order:\n\n- A **positive** value plugs the phone in and adds that many percent, but the level can never go above `100`.\n- A **negative** value drains that many percent, but the level can never go below `0`.\n\nA **shutdown** happens each time a drain takes the level from above `0` down to exactly `0`. A drain that arrives while the level is already `0` changes nothing and is not another shutdown. A later positive event revives the phone as usual.\n\nReturn `[final_level, shutdowns]`.",
    explanation:
      "Keep two variables, the current level and a shutdown counter, and apply the events one at a time.\n\nFor a positive event use `level = min(100, level + e)`. For a negative event, first check whether the level is already `0`; if it is, skip the event. Otherwise use `level = max(0, level + e)` and, if the result is `0`, count one shutdown.\n\nThe two traps are the clamps and the counting rule. Without the `100` cap, a later drain leaves too much charge. Without the \"already at 0\" check, a run of drains on a dead phone is counted as several shutdowns. You cannot shortcut this by summing the events, because clamping makes the order matter.\n\nO(n) time, O(1) space.",
    functionName: "battery_after_events",
    functionSignature: "def battery_after_events(charge: int, events: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def battery_after_events(charge: int, events: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [50, [30, -90, 20]], expected: [20, 1] },
      { input: [90, [25, -10]], expected: [90, 0] },
      { input: [10, [-10, -5, -5, 60, -70]], expected: [0, 2] },
    ],
    hiddenTests: [
      { input: [100, []], expected: [100, 0] },
      { input: [1, [-1]], expected: [0, 1] },
      { input: [40, [-100, 100, -100, 100, 100]], expected: [100, 2] },
      { input: [5, [-3, -3, -3, 1, -1]], expected: [0, 2] },
      { input: [70, [50, -99, -1, -1]], expected: [0, 1] },
      { input: [30, [-29, -1, 5]], expected: [5, 1] },
    ],
  },
  {
    id: "counting-out-circle",
    number: 353,
    title: "Counting-Out Circle",
    difficulty: "Easy",
    topic: "Simulation",
    statement:
      "`n` children numbered `1` to `n` stand in a circle in clockwise order (child `n` is next to child `1`). They play a counting-out game:\n\n1. Counting starts at child `1`.\n2. Count `k` children clockwise, where the child the count starts on is counted as number `1`. The child who receives count `k` leaves the circle.\n3. The next count starts on the child immediately clockwise of the one who just left.\n4. Repeat until nobody is left.\n\n`k` may be larger than the number of children still in the circle; the count simply keeps going around. Both `n` and `k` are at least `1`.\n\nReturn the list of children in the order they leave (it always has `n` entries; the last entry is the final child standing).",
    explanation:
      "Keep the remaining children in a list and an index `i` pointing at the child where the next count starts (initially `0`).\n\nCounting `k` children starting with the one at `i` lands on index `(i + k - 1) % len(circle)`; the modulo handles going around the circle any number of times, so there is no need to step one child at a time. Remove that child and append it to the answer. After the removal, the child who was next clockwise has slid into the same index, so `i` stays where it is (the modulo on the next round also covers the case where the removed child was at the end of the list).\n\nThe usual bug is an off-by-one: the starting child is count `1`, so you advance `k - 1` positions, not `k`.\n\nEach removal from a Python list costs O(n), giving O(n^2) overall, which is fine for the small circles here. O(n) space.",
    functionName: "counting_out_order",
    functionSignature: "def counting_out_order(n: int, k: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def counting_out_order(n: int, k: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [5, 2], expected: [2, 4, 1, 5, 3] },
      { input: [4, 1], expected: [1, 2, 3, 4] },
      { input: [3, 5], expected: [2, 3, 1] },
    ],
    hiddenTests: [
      { input: [1, 1], expected: [1] },
      { input: [1, 7], expected: [1] },
      { input: [7, 3], expected: [3, 6, 2, 7, 5, 1, 4] },
      { input: [6, 6], expected: [6, 1, 3, 2, 5, 4] },
      { input: [2, 2], expected: [2, 1] },
      { input: [8, 10], expected: [2, 5, 1, 8, 4, 6, 3, 7] },
    ],
  },
  {
    id: "board-race-replay",
    number: 354,
    title: "Board Race Replay",
    difficulty: "Easy",
    topic: "Simulation",
    statement:
      "Two players race along a board whose squares are numbered `0` to `target`. Both start on square `0`. The dice rolls are already recorded in `rolls` (each from `1` to `6`): player 1 uses `rolls[0]`, player 2 uses `rolls[1]`, player 1 uses `rolls[2]`, and so on, alternating.\n\nOn a turn, a player on square `p` with roll `r`:\n\n- If `p + r` is greater than `target`, the player stays on `p` and the turn is wasted.\n- Otherwise the player moves to `p + r`. If that square is the first value of a pair `[a, b]` in `jumps`, the player is immediately moved to square `b` (which may be ahead or behind). Only **one** jump is taken per turn: if `b` is itself the start of another jump, that second jump is ignored. A jump never starts on square `0` or on `target`, no two jumps start on the same square, and a jump may end on `target`.\n\nThe first player whose turn ends on `target` wins at once and any remaining rolls are ignored.\n\nReturn `[winner, rolls_used]`, where `winner` is `1` or `2` and `rolls_used` counts every roll up to and including the winning one. If the rolls run out before anyone wins, return `[0, len(rolls)]`.",
    explanation:
      "Store the jumps in a dictionary from start square to end square, keep the two positions in a small list, and replay the rolls with `player = i % 2`.\n\nFor each roll compute `new = pos + roll`. If `new > target`, do nothing. Otherwise apply the jump lookup **once** (`new = jump.get(new, new)`), store the position, and check for a win.\n\nThings that go wrong: clamping an overshoot to `target` (the rule is that the player does not move at all), following jumps in a loop (only one jump per turn), and reporting the zero-based index of the winning roll instead of the count of rolls used.\n\nO(len(rolls) + len(jumps)) time, O(len(jumps)) space.",
    functionName: "board_race_winner",
    functionSignature: "def board_race_winner(target: int, jumps: list[list[int]], rolls: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def board_race_winner(target: int, jumps: list[list[int]], rolls: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [10, [[3, 8], [9, 2]], [3, 4, 2, 6, 6]], expected: [1, 3] },
      { input: [6, [], [4, 5, 3, 1, 2]], expected: [2, 4] },
      { input: [12, [[2, 5], [5, 9]], [2, 1, 3, 1, 4]], expected: [1, 5] },
    ],
    hiddenTests: [
      { input: [20, [[2, 5]], [2, 2, 1]], expected: [0, 3] },
      { input: [5, [], []], expected: [0, 0] },
      { input: [8, [[4, 8]], [1, 4, 6]], expected: [2, 2] },
      { input: [9, [[6, 1]], [6, 5, 6, 4, 2]], expected: [2, 4] },
      { input: [7, [[3, 6]], [6, 3, 2, 2, 1, 1]], expected: [1, 5] },
      { input: [4, [[1, 3], [3, 1]], [1, 3, 1, 2, 3]], expected: [1, 3] },
    ],
  },
  {
    id: "cursor-keystrokes",
    number: 355,
    title: "Cursor Keystrokes",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "A tiny text editor starts with empty text and its cursor at position `0`. You are given the string `keys`, one character per key press, processed left to right:\n\n- a lowercase letter is inserted at the cursor, and the cursor ends up just after the new letter;\n- `<` moves the cursor one position left (nothing happens if it is already at the start);\n- `>` moves the cursor one position right (nothing happens if it is already at the end);\n- `#` deletes the character immediately to the left of the cursor (nothing happens at the start);\n- `^` moves the cursor to the start of the text;\n- `$` moves the cursor to the end of the text.\n\nReturn the text after every key has been processed. An empty `keys` gives an empty string.",
    explanation:
      "A plain stack handles backspace, but not a cursor that moves. The neat model is **two stacks**: `left` holds the characters before the cursor and `right` holds the characters after it, with the character nearest the cursor on top of each.\n\n- letter: push onto `left`.\n- `<`: pop from `left` and push onto `right` (if `left` is not empty).\n- `>`: pop from `right` and push onto `left` (if `right` is not empty).\n- `#`: pop from `left` (if not empty).\n- `^`: move everything from `left` to `right` one at a time; `$` does the opposite.\n\nAt the end the text is `left` followed by `right` reversed.\n\nInserting into the middle of a Python list or rebuilding a string on every key costs O(n) per key; the two-stack version makes letters, arrows and deletes O(1) each, with only `^` and `$` costing O(n). O(n) space.",
    functionName: "type_with_cursor",
    functionSignature: "def type_with_cursor(keys: str) -> str:",
    starter:
      STARTER_HEADER + "def type_with_cursor(keys: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["abc<<x"], expected: "axbc" },
      { input: ["ab#c<#>d"], expected: "cd" },
      { input: ["hello^y$z<<#"], expected: "yheloz" },
    ],
    hiddenTests: [
      { input: [""], expected: "" },
      { input: ["ab>>>#<c"], expected: "ca" },
      { input: ["abc<<<<<x>y"], expected: "xaybc" },
      { input: ["abcd<<##e$f"], expected: "ecdf" },
      { input: ["a^b^c$d"], expected: "cbad" },
      { input: ["xyz###>#q<<p"], expected: "pq" },
    ],
  },
  {
    id: "settling-sand",
    number: 356,
    title: "Settling Sand",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "A side view of a tank is given as `grid`, a list of equal-length strings where the first string is the top row. Each character is:\n\n- `'.'` empty space,\n- `'o'` a grain of sand,\n- `'#'` a fixed rock.\n\nGravity pulls every grain straight down within its column. A grain keeps falling until the cell below it is a rock, another grain that has already come to rest, or the bottom of the tank. Rocks never move, and grains never move sideways.\n\nReturn the grid (same format) after all the sand has settled. If `grid` is an empty list, return `[]`.",
    explanation:
      "Columns are independent, so handle them one at a time, and within a column scan from the **bottom up** while tracking `floor`, the lowest cell that the next grain can occupy.\n\n- Start with `floor` at the last row.\n- On a rock at row `r`, nothing above it can pass, so set `floor = r - 1`.\n- On a grain, clear its cell, place it at `floor`, and decrement `floor`.\n\nScanning bottom-up guarantees every grain below the current one is already at rest. The tempting shortcut of pushing all of a column's sand to the bottom ignores the rocks: sand resting on a rock must stay above it.\n\nEvery cell is visited once: O(rows x cols) time and space (for the mutable copy of the grid).",
    functionName: "settle_sand",
    functionSignature: "def settle_sand(grid: list[str]) -> list[str]:",
    starter:
      STARTER_HEADER + "def settle_sand(grid: list[str]) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["o.o", ".#.", "..."]], expected: ["...", ".#.", "o.o"] },
      { input: [["oo", "#.", ".."]], expected: ["o.", "#.", ".o"] },
      { input: [["o", "o", ".", "#", "o", "."]], expected: [".", "o", "o", "#", ".", "o"] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [["o#o"]], expected: ["o#o"] },
      { input: [["o.#", "oo.", "#.o", "..."]], expected: ["o.#", "o..", "#..", ".oo"] },
      { input: [["ooo", "ooo"]], expected: ["ooo", "ooo"] },
      { input: [["o.o.", ".o#.", "o...", ".#.o", "...."]], expected: ["..o.", "..#.", ".o..", "o#..", "o..o"] },
      { input: [[".", "o", "#", ".", "o", ".", "#", "o"]], expected: [".", "o", "#", ".", ".", "o", "#", "o"] },
    ],
  },
  {
    id: "conveyor-floor-exit",
    number: 357,
    title: "Conveyor Floor Exit",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "A warehouse floor is a grid given as a list of equal-length strings. Each cell is one of:\n\n- `'^'`, `'v'`, `'<'`, `'>'`: a conveyor that sends a parcel up, down, left or right;\n- `'.'`: smooth floor, where a parcel keeps sliding in the direction it was already moving.\n\nA parcel is placed on cell `(row, col)` (row `0` is the top row, column `0` is the left column), which always holds a conveyor. Then it moves one cell per step: if its current cell is a conveyor it moves in that conveyor's direction, otherwise it moves in the same direction as its previous step.\n\nReturn the number of steps the parcel takes until it leaves the grid (the step that carries it off the edge counts). If it never leaves, return `-1`.",
    explanation:
      "Simulate one step at a time, keeping the position and the current direction. On a conveyor cell the direction is overwritten; on a `'.'` cell it is kept. Move, count the step, and stop when the position falls outside the grid.\n\nThe only real question is how to know the parcel is stuck forever. Its future is completely determined by the pair **(cell, direction)**, so if that pair ever repeats, the parcel is in a loop: return `-1`. Record each pair in a set before moving.\n\nTracking visited **cells** alone is wrong: a parcel may legally cross the same floor cell twice, once sliding horizontally and once vertically, and still escape. A fixed step limit works only if it is at least `4 x rows x cols`, the number of distinct states.\n\nThere are at most `4 x rows x cols` states, so time and space are O(rows x cols).",
    functionName: "conveyor_exit_steps",
    functionSignature: "def conveyor_exit_steps(grid: list[str], row: int, col: int) -> int:",
    starter:
      STARTER_HEADER + "def conveyor_exit_steps(grid: list[str], row: int, col: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[">>v", "..v", "<<<"], 0, 0], expected: 7 },
      { input: [[">v", "^<"], 0, 0], expected: -1 },
      { input: [[".v<", ">.^", "..."], 1, 0], expected: 7 },
    ],
    hiddenTests: [
      { input: [["^"], 0, 0], expected: 1 },
      { input: [[">.v", "...", "^.<"], 0, 0], expected: -1 },
      { input: [[">>v.", ".^<.", "...."], 0, 0], expected: -1 },
      { input: [["v...", ">..v", ".^.<", "...."], 0, 0], expected: 10 },
      { input: [[">.vv", "^..<"], 0, 3], expected: 9 },
      { input: [["....>", "....."], 0, 4], expected: 1 },
    ],
  },
  {
    id: "checkout-lane-picker",
    number: 358,
    title: "Checkout Lane Picker",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "A shop has `lanes` checkout lanes numbered `0` to `lanes - 1`, all empty at time `0`. Customer `i` reaches the checkouts at time `arrivals[i]` (the list is in non-decreasing order) and needs `durations[i]` minutes of service. Customers are handled in list order, and each one commits to a lane at the moment of arrival and never switches:\n\n- A lane is **idle** at time `t` if every customer already assigned to it has finished by time `t` (finishing exactly at `t` counts as idle). If at least one lane is idle, the customer takes the **lowest-numbered idle lane** and starts service immediately.\n- If no lane is idle, the customer joins the lane whose already-assigned customers will all be finished the earliest; if several lanes tie, the lowest-numbered of them. Service starts the moment that lane becomes free.\n\nA customer's finish time is their service start time plus their duration.\n\nReturn a list with one `[lane, finish_time]` pair per customer, in the same order as the input. Return `[]` when there are no customers. `lanes` is at least `1`.",
    explanation:
      "Each lane is fully described by one number: the time it becomes free (`free[lane]`, initially `0`). Because every customer commits on arrival, a lane's queue never needs to be stored.\n\nFor each customer arriving at `t`:\n\n1. Scan the lanes in increasing number; the first with `free[lane] <= t` is the lowest-numbered idle lane.\n2. If there is none, pick the lane with the smallest `(free[lane], lane)`.\n3. `finish = max(t, free[lane]) + duration`; store it in `free[lane]` and record `[lane, finish]`.\n\nThe subtle part is that there are two different rules. Always choosing the lane with the smallest free time is wrong when several lanes are idle: an idle lane that emptied long ago has a smaller free time than a lower-numbered lane that emptied recently, but the customer should take the lower-numbered one.\n\nWith a linear scan this is O(n x lanes) time and O(lanes) space; two heaps (idle lanes by number, busy lanes by free time) bring it to O(n log lanes).",
    functionName: "checkout_assignments",
    functionSignature: "def checkout_assignments(arrivals: list[int], durations: list[int], lanes: int) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def checkout_assignments(arrivals: list[int], durations: list[int], lanes: int) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[0, 1, 2], [5, 5, 1], 2], expected: [[0, 5], [1, 6], [0, 6]] },
      { input: [[0, 0, 10], [5, 3, 2], 2], expected: [[0, 5], [1, 3], [0, 12]] },
      { input: [[0, 0, 1], [4, 4, 1], 2], expected: [[0, 4], [1, 4], [0, 5]] },
    ],
    hiddenTests: [
      { input: [[], [], 3], expected: [] },
      { input: [[2, 2, 2, 9], [3, 1, 4, 1], 1], expected: [[0, 5], [0, 6], [0, 10], [0, 11]] },
      { input: [[0, 0, 5], [5, 3, 1], 2], expected: [[0, 5], [1, 3], [0, 6]] },
      { input: [[1, 4], [2, 2], 5], expected: [[0, 3], [0, 6]] },
      { input: [[0, 0, 0, 1, 1, 2, 20], [7, 3, 5, 4, 1, 6, 2], 3], expected: [[0, 7], [1, 3], [2, 5], [1, 7], [2, 6], [2, 12], [0, 22]] },
      { input: [[0, 1, 2, 3, 4, 5], [10, 1, 1, 9, 1, 1], 2], expected: [[0, 10], [1, 2], [1, 3], [1, 12], [0, 11], [0, 12]] },
    ],
  },
  {
    id: "four-register-machine",
    number: 359,
    title: "Four-Register Machine",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "A toy processor has four registers `a`, `b`, `c` and `d`, all starting at `0`. A `program` is a list of instructions, each a string of three space-separated tokens:\n\n- `\"set X V\"`: store the value of `V` in register `X`;\n- `\"add X V\"`: add the value of `V` to register `X`;\n- `\"jnz V K\"`: if the value of `V` is **not zero**, jump `K` instructions relative to this one (so `K = -2` goes back two instructions and `K = 3` skips ahead three); if the value is zero, continue with the next instruction.\n\n`X` is always a register name. `V` is either a register name (use its current value) or an integer literal such as `7` or `-3`. `K` is always an integer literal.\n\nExecution starts at instruction `0`. After a `set` or `add` it moves to the next instruction. The program stops as soon as the instruction position is outside the program (before the first instruction or past the last one). Every test program stops.\n\nReturn `[a, b, c, d]`, the final register values. An empty program returns `[0, 0, 0, 0]`.",
    explanation:
      "Keep a dictionary of the four registers and an instruction pointer `ip`. Loop while `0 <= ip < len(program)`: split the instruction into its three tokens, act on it, and update `ip`.\n\nA small helper removes most of the bugs: `value(tok)` returns the register's content if `tok` is one of `a b c d`, otherwise `int(tok)`. Use it for the second operand of `set`/`add` and for the **first** operand of `jnz` (which can be a literal, e.g. `jnz 1 2` is an unconditional jump).\n\nFor `jnz`, when the tested value is non-zero do `ip += K` and skip the usual `ip += 1`; jumping relative to the *next* instruction is the classic off-by-one. Note the loop condition must also stop on a negative `ip`: in Python a negative index would silently wrap around to the end of the list.\n\nTime is proportional to the number of instructions executed; space is O(1) beyond the program.",
    functionName: "run_register_program",
    functionSignature: "def run_register_program(program: list[str]) -> list[int]:",
    starter:
      STARTER_HEADER + "def run_register_program(program: list[str]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["set a 5", "add b a", "add a -1", "jnz a -2"]], expected: [0, 15, 0, 0] },
      { input: [["set a 3", "jnz 1 2", "set a 99", "add c a"]], expected: [3, 0, 3, 0] },
      { input: [["set d 7", "jnz d -5", "set d 0"]], expected: [0, 0, 0, 7] },
    ],
    hiddenTests: [
      { input: [[]], expected: [0, 0, 0, 0] },
      { input: [["jnz a 2", "set b 1", "set c 2"]], expected: [0, 1, 2, 0] },
      { input: [["jnz -1 2", "set a 1", "set b 1"]], expected: [0, 1, 0, 0] },
      { input: [["set a 3", "set b 4", "add c 1", "add b -1", "jnz b -2", "add a -1", "set b 4", "jnz a -5"]], expected: [0, 4, 12, 0] },
      { input: [["jnz 5 100", "set a 1"]], expected: [0, 0, 0, 0] },
      { input: [["set b 6", "set a b", "add a a", "set d a", "add d -2", "jnz 0 -3", "set c d"]], expected: [12, 6, 10, 10] },
    ],
  },
  {
    id: "top-card-duel",
    number: 360,
    title: "Top Card Duel",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "Players A and B each hold a deck of numbered cards, given as lists with the **top card first**. They play rounds while **both** decks are non-empty and fewer than `max_rounds` rounds have been played. In a round:\n\n1. Each player removes the top card of their own deck and reveals it.\n2. If the two cards are equal, both cards are thrown away.\n3. Otherwise the player with the higher card puts both cards on the **bottom** of their own deck: first their own card, then the captured card underneath it.\n\nWhen play stops, the result is `1` if A still has cards and B has none, `2` if B still has cards and A has none, and `0` in every other case (both decks are empty, or the round limit was reached while both still hold cards).\n\nReturn `[result, rounds_played]`.",
    explanation:
      "Each deck is a queue: cards leave from the front and return at the back. Use `collections.deque` so both operations are O(1) (`list.pop(0)` is O(n)).\n\nLoop while both deques are non-empty and `rounds < max_rounds`: pop one card from each, count the round, and compare. On a tie, drop both. Otherwise append to the winner's deque **the winner's card first, then the loser's card**. That order matters, because it decides which cards meet in later rounds; swapping it changes the outcome of longer games.\n\nAfter the loop, decide the result from which deques are empty. Do this after the loop rather than inside it so that the three stopping reasons (A empty, B empty, limit reached) share one code path, including the case where either deck was empty before any round was played (`0` rounds).\n\nThere is no formula that predicts the winner, so simulation is the intended approach: O(rounds) time, O(n) space.",
    functionName: "card_duel_result",
    functionSignature: "def card_duel_result(deck_a: list[int], deck_b: list[int], max_rounds: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def card_duel_result(deck_a: list[int], deck_b: list[int], max_rounds: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[5, 2], [3, 4], 10], expected: [1, 4] },
      { input: [[7, 1], [7, 9], 10], expected: [2, 2] },
      { input: [[1, 3], [2, 1], 3], expected: [0, 3] },
    ],
    hiddenTests: [
      { input: [[4], [4], 5], expected: [0, 1] },
      { input: [[], [1], 3], expected: [2, 0] },
      { input: [[], [], 3], expected: [0, 0] },
      { input: [[3, 2], [1, 1], 0], expected: [0, 0] },
      { input: [[2, 1, 9], [4, 7, 3], 30], expected: [1, 7] },
      { input: [[4, 6, 8, 1], [3, 2, 5, 9], 40], expected: [2, 12] },
    ],
  },
  {
    id: "gem-cascade",
    number: 361,
    title: "Gem Cascade",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "A match-three board is given as `grid`, a list of equal-length rows with the top row first. `0` is an empty cell and a positive integer is a gem of that colour. The starting board is already settled: no gem has an empty cell below it.\n\nThe board resolves itself by repeating these steps:\n\n1. **Find matches.** Look for every run of **three or more** equal gems that are next to each other in one row or in one column. Empty cells never form a run.\n2. If there are no such runs, stop.\n3. **Clear.** Remove every gem that belongs to at least one run, all at the same moment (a gem shared by a horizontal and a vertical run counts for both).\n4. **Drop.** In each column, gems fall straight down to fill the gaps, keeping their order.\n5. Go back to step 1.\n\nReturn the final board in the same format. If `grid` is an empty list, return `[]`.",
    explanation:
      "The process is a loop of three phases, and the correctness hinges on keeping them separate.\n\n**Mark, then clear.** Scan every cell; if it and the next two cells to the right hold the same non-zero value, add all three positions to a set, and do the same going down. Checking windows of three from every cell automatically covers longer runs. Only after the whole board has been scanned do you zero the marked cells. Clearing a run the moment you find it breaks T and L shapes, where a horizontal and a vertical run share a gem: the second run would be left with only two gems.\n\n**Drop.** For each column collect the non-zero values from top to bottom, then write them back at the bottom with zeros above.\n\n**Repeat** until a scan marks nothing, since falling gems can line up into new runs.\n\nEach pass costs O(rows x cols) and each pass that continues removes at least three gems, so the total is at most O((rows x cols)^2), tiny for these boards. O(rows x cols) space.",
    functionName: "gem_cascade",
    functionSignature: "def gem_cascade(grid: list[list[int]]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def gem_cascade(grid: list[list[int]]) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[1, 2, 3], [2, 2, 2], [1, 3, 1]]], expected: [[0, 0, 0], [1, 2, 3], [1, 3, 1]] },
      { input: [[[1, 1, 1], [2, 1, 3], [3, 1, 2]]], expected: [[0, 0, 0], [2, 0, 3], [3, 0, 2]] },
      { input: [[[3, 0, 0], [1, 1, 1], [3, 2, 2], [3, 4, 5]]], expected: [[0, 0, 0], [0, 0, 0], [0, 2, 2], [0, 4, 5]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[[0, 0, 0], [1, 2, 1]]], expected: [[0, 0, 0], [1, 2, 1]] },
      { input: [[[1, 1, 1, 2]]], expected: [[0, 0, 0, 2]] },
      { input: [[[4, 1, 2], [4, 3, 3], [1, 1, 1], [4, 2, 2], [2, 3, 3]]], expected: [[0, 0, 0], [0, 1, 2], [0, 3, 3], [0, 2, 2], [2, 3, 3]] },
      { input: [[[0, 2, 0, 0], [3, 3, 0, 3], [1, 1, 2, 1], [2, 2, 1, 2], [4, 4, 1, 4], [5, 6, 1, 7]]], expected: [[0, 2, 0, 0], [3, 3, 0, 3], [1, 1, 0, 1], [2, 2, 0, 2], [4, 4, 0, 4], [5, 6, 2, 7]] },
      { input: [[[6, 0, 0], [7, 7, 0], [6, 6, 0], [8, 8, 8], [6, 7, 7]]], expected: [[0, 0, 0], [6, 0, 0], [7, 7, 0], [6, 6, 0], [6, 7, 7]] },
    ],
  },
  {
    id: "snake-replay",
    number: 362,
    title: "Snake Replay",
    difficulty: "Medium",
    topic: "Simulation",
    statement:
      "Replay a game of Snake on a board with `height` rows and `width` columns. Note the argument order: `width` (columns) comes before `height` (rows). Row `0` is the top row and column `0` is the left column. The snake starts as a single segment on cell `(0, 0)`.\n\n`food` lists the food cells as `[row, col]` pairs. Only one piece is on the board at a time: `food[0]` first, and each later piece appears only when the previous one has been eaten. Once the list is used up, no more food appears. The tests guarantee that a piece never appears on a cell the snake is covering at that moment.\n\n`moves` is a string of `U`, `D`, `L`, `R` (up, down, left, right). For each move the head advances one cell in that direction:\n\n- If the new cell is outside the board, the game ends.\n- If the new cell holds the current piece of food, the snake eats it and grows by one: the head moves there and the tail stays where it is.\n- Otherwise the snake keeps its length: the tail segment leaves its cell and the head enters the new cell. If the new cell is covered by any segment **other than that departing tail**, the snake has bitten itself and the game ends. Moving the head into the cell the tail is leaving on this very move is allowed.\n\nReturn `[moves_completed, length]`: how many moves were carried out successfully (the fatal move is not counted and nothing after it is processed) and how many segments the snake has when the replay stops.",
    explanation:
      "Store the body in a `deque` with the head at one end and the tail at the other, plus a set of occupied cells for O(1) collision checks, and an index into `food`.\n\nFor each move compute the new head cell, then:\n\n1. Outside the board: stop.\n2. Equal to the current food: advance the food index and do **not** remove the tail.\n3. Otherwise remove the tail from the deque and the set **first**, then test whether the new cell is still in the set. If it is, stop.\n4. Push the new head.\n\nThe order in step 3 is the heart of the problem. If you test for a collision before releasing the tail, a snake chasing its own tail around a loop is wrongly reported as dead. If you never test at all, the snake can pass straight through its own body.\n\nWhen the game ends on a fatal move, report the length from before that move. Each move is O(1), so the replay is O(len(moves)) time and O(snake length) space.",
    functionName: "snake_run",
    functionSignature: "def snake_run(width: int, height: int, food: list[list[int]], moves: str) -> list[int]:",
    starter:
      STARTER_HEADER + "def snake_run(width: int, height: int, food: list[list[int]], moves: str) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [3, 2, [[0, 1], [1, 1]], "RDL"], expected: [3, 3] },
      { input: [2, 2, [[0, 1], [1, 1], [1, 0]], "RDLURDL"], expected: [7, 4] },
      { input: [3, 3, [[0, 1], [0, 2], [1, 2], [1, 1]], "RRDLUL"], expected: [4, 5] },
    ],
    hiddenTests: [
      { input: [4, 4, [[1, 0]], ""], expected: [0, 1] },
      { input: [2, 2, [], "RR"], expected: [1, 1] },
      { input: [3, 1, [[0, 1], [0, 2]], "RRL"], expected: [2, 3] },
      { input: [3, 3, [[0, 1], [0, 2], [1, 2], [1, 1], [1, 0]], "RRDLLURR"], expected: [8, 6] },
      { input: [4, 3, [[0, 2], [2, 2], [2, 0]], "RRDDLLUURRDDR"], expected: [13, 4] },
      { input: [3, 3, [[0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [1, 1]], "RRDDLURDD"], expected: [6, 7] },
    ],
  },
  {
    id: "bar-drop-well",
    number: 363,
    title: "Bar Drop Well",
    difficulty: "Hard",
    topic: "Simulation",
    statement:
      "A well is `width` columns wide (columns `0` to `width - 1`) and has no ceiling. Its rows are numbered from the floor upward, starting at row `0`. Flat bars, each exactly one cell tall, are dropped into it one after another.\n\nEach entry of `drops` is `[left, length]`: a bar covering columns `left` through `left + length - 1` (it always fits inside the well). The bar falls straight down from above and stops in the lowest row where it is still above every filled cell in the columns it covers; in other words, it rests directly on top of the highest filled cell under it, or on the floor if those columns are empty. A bar can never slide sideways into a gap underneath an overhang.\n\nAfter a bar comes to rest, check the row it landed in. If **every** cell of that row is now filled, the whole row is removed and every filled cell above it moves down by exactly one row. Cells moved this way do not fall any further, even if there is empty space below them.\n\nAfter all drops, return a list with the height of each column: the row number of its highest filled cell plus one, or `0` if the column is empty.",
    explanation:
      "Tracking only one height per column is not enough, because bars create overhangs: a column can have a filled cell with empty cells beneath it, and when a row is removed the column's new height depends on what is hidden under the top cell.\n\nSo keep the actual cells: a list `rows`, where `rows[r]` is a list of `width` booleans and `rows[0]` is the floor row.\n\nFor each bar:\n\n1. For every column it covers, find the highest filled cell by scanning `rows` from the top; the bar rests at `rest = max(that row + 1)` over its columns (0 if all are empty).\n2. Append empty rows until `rows[rest]` exists, then fill the bar's cells.\n3. If `all(rows[rest])`, delete `rows[rest]`. Deleting from the list shifts every higher row down by one, exactly as the rules require. Only the landing row can have become full, so no other row needs checking.\n\nAt the end, a column's height is one more than the highest index whose row has that column filled.\n\nA common wrong shortcut is to subtract one from every column height when a row clears. That fails when the cleared row was the top of a column that has a gap below it: its height falls by more than one.\n\nWith `n` drops the stack has at most `n` rows, so the cost is O(n x width x n) in the worst case, which is fine for small inputs; O(n x width) space.",
    functionName: "bar_stack_heights",
    functionSignature: "def bar_stack_heights(width: int, drops: list[list[int]]) -> list[int]:",
    starter:
      STARTER_HEADER + "def bar_stack_heights(width: int, drops: list[list[int]]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [4, [[0, 2], [1, 2], [3, 1]]], expected: [1, 2, 2, 1] },
      { input: [3, [[0, 2], [2, 1], [1, 1]]], expected: [0, 1, 0] },
      { input: [3, [[0, 1], [0, 2], [2, 1], [2, 1]]], expected: [1, 0, 1] },
    ],
    hiddenTests: [
      { input: [5, []], expected: [0, 0, 0, 0, 0] },
      { input: [2, [[0, 2], [0, 2], [0, 2]]], expected: [0, 0] },
      { input: [3, [[2, 1], [2, 1], [2, 1], [0, 2]]], expected: [0, 0, 2] },
      { input: [4, [[0, 1], [0, 3], [1, 1], [3, 1], [3, 1], [2, 1]]], expected: [1, 2, 1, 1] },
      { input: [4, [[1, 2], [0, 2], [2, 2], [0, 1], [3, 1], [1, 2], [0, 4]]], expected: [0, 1, 1, 0] },
      { input: [3, [[0, 1], [0, 2], [1, 1], [2, 1], [2, 1]]], expected: [1, 2, 1] },
    ],
  },
  {
    id: "night-guard-patrol",
    number: 364,
    title: "Night Guard Patrol",
    difficulty: "Hard",
    topic: "Simulation",
    statement:
      "A night guard patrols a warehouse drawn as `grid`, a list of equal-length strings where `'.'` is open floor and `'#'` is a crate. Row `0` is the top row and column `0` is the left column. The guard starts on the open cell `(row, col)` facing **up** (towards row `0`).\n\nEvery tick the guard does exactly one thing:\n\n- if the next cell in the facing direction is inside the grid and is open floor, the guard steps onto it;\n- otherwise the guard stays on the same cell and turns 90 degrees clockwise (up, then right, then down, then left, then up again).\n\nReturn `[row, col]`, the guard's cell after exactly `k` ticks. `k` can be as large as `10**15`, far too many ticks to replay one by one.",
    explanation:
      "The grid never changes, so the guard's whole future depends only on the **state** `(row, col, direction)`. There are at most `4 x rows x cols` states, which means that within that many ticks some state must repeat, and from then on the walk cycles forever.\n\nSimulate tick by tick while recording, for every state, the tick at which it first occurred (a dictionary) and the ordered list of states (a history list). As soon as a tick produces a state already in the dictionary:\n\n- `start` = the tick at which that state was first seen,\n- `cycle = current_tick - start`,\n- the state after `k` ticks is `history[start + (k - start) % cycle]`.\n\nIf `k` ticks finish before any repeat, just return the current position.\n\nDetails that matter: the direction must be part of the state (the guard passes through the same cell in different directions without being in a loop); a turn costs a full tick; and the cycle does not necessarily begin at tick `0`, because the guard may walk a lead-in path before entering the loop, hence the `start` offset. A guard walled in on all four sides simply spins in place.\n\nO(rows x cols) time and space, independent of `k`.",
    functionName: "patrol_position",
    functionSignature: "def patrol_position(grid: list[str], row: int, col: int, k: int) -> list[int]:",
    starter:
      STARTER_HEADER + "def patrol_position(grid: list[str], row: int, col: int, k: int) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["...", "...", "..."], 2, 0, 5], expected: [0, 2] },
      { input: [[".#.", "...", "#.."], 1, 0, 4], expected: [1, 0] },
      { input: [["...", "...", "..."], 2, 0, 1000000000000], expected: [0, 1] },
    ],
    hiddenTests: [
      { input: [["..", ".."], 1, 1, 0], expected: [1, 1] },
      { input: [["."], 0, 0, 7], expected: [0, 0] },
      { input: [["#.#", "...", ".#."], 1, 1, 1000000000000000], expected: [1, 2] },
      { input: [["....", ".##.", "...."], 2, 0, 999999999999999], expected: [0, 2] },
      { input: [["..#..", ".....", ".#...", "....#"], 3, 0, 123456789012345], expected: [1, 0] },
      { input: [[".....", "####.", "....."], 2, 0, 1000000007], expected: [2, 0] },
    ],
  },
  {
    id: "tournament-leaderboard",
    number: 365,
    title: "Tournament Leaderboard",
    difficulty: "Easy",
    topic: "Sorting",
    statement:
      "A tournament has finished. Player `i` is called `names[i]` (distinct lowercase names), earned `scores[i]` points and collected `penalties[i]` penalty minutes. The three lists have the same length.\n\nProduce the final standings using these rules, in priority order:\n\n1. more points ranks higher;\n2. among equal points, **fewer** penalty minutes ranks higher;\n3. if both are equal, the name that comes first alphabetically ranks higher.\n\nReturn the list of names from first place to last. Return `[]` if there are no players.",
    explanation:
      "This is a multi-key sort where the keys point in different directions: points descending, penalties ascending, names ascending.\n\nThe cleanest way in Python is a single tuple key with the descending numeric field negated: sort the indices by `(-scores[i], penalties[i], names[i])` and map them back to names. Tuples compare left to right, so later fields are only consulted on ties.\n\nWhat does not work is sorting by `(score, penalty, name)` with `reverse=True`: that flips **all three** fields, so ties come out with more penalties first and names in reverse alphabetical order. An alternative that does work is to use the stability of Python's sort: sort by name, then stably by penalties, then stably by points descending (least significant key first).\n\nO(n log n) time, O(n) space.",
    functionName: "leaderboard_order",
    functionSignature: "def leaderboard_order(names: list[str], scores: list[int], penalties: list[int]) -> list[str]:",
    starter:
      STARTER_HEADER + "def leaderboard_order(names: list[str], scores: list[int], penalties: list[int]) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["ana", "bo", "cy"], [10, 30, 30], [0, 2, 1]], expected: ["cy", "bo", "ana"] },
      { input: [["zed", "amy", "kim"], [5, 5, 5], [1, 1, 1]], expected: ["amy", "kim", "zed"] },
      { input: [["pat", "lee", "max", "ivy"], [7, 9, 7, 9], [3, 4, 3, 0]], expected: ["ivy", "lee", "max", "pat"] },
    ],
    hiddenTests: [
      { input: [[], [], []], expected: [] },
      { input: [["solo"], [0], [0]], expected: ["solo"] },
      { input: [["a", "b", "c", "d"], [-1, -5, -1, 0], [2, 0, 1, 9]], expected: ["d", "c", "a", "b"] },
      { input: [["dd", "cc", "bb", "aa"], [3, 3, 3, 3], [2, 1, 2, 1]], expected: ["aa", "cc", "bb", "dd"] },
      { input: [["x", "y", "z"], [1, 2, 3], [0, 0, 0]], expected: ["z", "y", "x"] },
      { input: [["bob", "al", "cat", "abe", "dan"], [50, 50, 40, 50, 40], [5, 0, 1, 5, 1]], expected: ["al", "abe", "bob", "cat", "dan"] },
    ],
  },
  {
    id: "shortest-words-first",
    number: 366,
    title: "Shortest Words First",
    difficulty: "Easy",
    topic: "Sorting",
    statement:
      "You are given `sentence`, a string of words separated by single spaces (no leading or trailing spaces). Rearrange the words so that shorter words come before longer ones. Words of the **same length must stay in the same relative order** they had in the original sentence.\n\nReturn the rearranged words joined by single spaces. An empty string returns an empty string.",
    explanation:
      "The requirement that equal-length words keep their original order is the definition of a **stable** sort. Python's `sorted` and `list.sort` are guaranteed stable, so sorting the words with `key=len` and nothing else is exactly right: `' '.join(sorted(sentence.split(), key=len))`.\n\nThe mistake to avoid is adding a tie-breaker you were not asked for, such as `key=lambda w: (len(w), w)`, which reorders equal-length words alphabetically. In a language whose built-in sort is not stable you would sort by `(length, original_index)` instead.\n\nSince word lengths are small integers you could also bucket the words by length and read the buckets in order, which is a stable counting sort in O(n + max_length). The comparison sort is O(n log n) time, O(n) space.",
    functionName: "stable_length_sort",
    functionSignature: "def stable_length_sort(sentence: str) -> str:",
    starter:
      STARTER_HEADER + "def stable_length_sort(sentence: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["the quick brown fox jumps"], expected: "the fox quick brown jumps" },
      { input: ["to be or not to be"], expected: "to be or to be not" },
      { input: ["pear fig apple kiwi date"], expected: "fig pear kiwi date apple" },
    ],
    hiddenTests: [
      { input: [""], expected: "" },
      { input: ["word"], expected: "word" },
      { input: ["ccc bb a"], expected: "a bb ccc" },
      { input: ["bb aa"], expected: "bb aa" },
      { input: ["zeta beta alfa gamma"], expected: "zeta beta alfa gamma" },
      { input: ["i am no one at all a b"], expected: "i a b am no at one all" },
    ],
  },
  {
    id: "digit-sum-order",
    number: 367,
    title: "Digit Sum Order",
    difficulty: "Easy",
    topic: "Sorting",
    statement:
      "Sort the integers in `nums` by their **digit sum**: the sum of the decimal digits of the number's absolute value (so `-12` and `21` both have digit sum `3`, and `0` has digit sum `0`).\n\nNumbers with a smaller digit sum come first. Numbers with the same digit sum are ordered by their actual value, smallest first.\n\nReturn the sorted list. Duplicates are kept. An empty list returns `[]`.",
    explanation:
      "Sort with a two-part key: `(digit_sum(x), x)`. Python compares tuples left to right, so the value is only used to break ties between equal digit sums.\n\nCompute the digit sum from `abs(x)`, either with `sum(int(ch) for ch in str(abs(x)))` or by repeatedly taking `% 10` and `// 10`. Forgetting `abs` either crashes on the minus sign or, with the arithmetic version, loops incorrectly on negative numbers because of how Python floors division.\n\nLeaving out the second key relies on stability and gives the original order for ties, which is not what is asked. O(n log n) comparisons, each key costing O(digits) to build; O(n) space.",
    functionName: "sort_by_digit_sum",
    functionSignature: "def sort_by_digit_sum(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def sort_by_digit_sum(nums: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[21, 3, 12, 100, 19]], expected: [100, 3, 12, 21, 19] },
      { input: [[-12, 5, 30, -5]], expected: [-12, 30, -5, 5] },
      { input: [[40, 13, 4, 22, 31]], expected: [4, 13, 22, 31, 40] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[9, 18, 27, 90, 81]], expected: [9, 18, 27, 81, 90] },
      { input: [[-1, 1, -10, 10]], expected: [-10, -1, 1, 10] },
      { input: [[1000, 99, 1, 10]], expected: [1, 10, 1000, 99] },
      { input: [[7, 7, 16, -7, 61]], expected: [-7, 7, 7, 16, 61] },
      { input: [[111, 3, 30, 21, 12, 102, 201]], expected: [3, 12, 21, 30, 102, 111, 201] },
    ],
  },
  {
    id: "podium-ranks",
    number: 368,
    title: "Podium Ranks",
    difficulty: "Easy",
    topic: "Sorting",
    statement:
      "`scores[i]` is the score of contestant `i`. A contestant's **rank** is `1` plus the number of contestants with a strictly higher score. Tied contestants therefore share a rank, and the ranks after a tie are skipped: scores `[90, 80, 80, 70]` get ranks `[1, 2, 2, 4]`.\n\nReturn a list where element `i` is the rank of contestant `i` (the output is in the original contestant order, not sorted). An empty list returns `[]`.",
    explanation:
      "Counting, for each contestant, how many others scored higher is O(n^2). Sorting gives the same information for everyone at once.\n\nSort a copy of the scores in descending order. In that sorted list, the **first** position where a score appears (0-based) is exactly the number of strictly higher scores, so its rank is that position plus one. Walk the sorted list once and record `rank[score] = position + 1` only the first time each score is seen, then build the answer by looking up each original score in the dictionary.\n\nThe trap is dense ranking (1, 2, 2, 3): incrementing a counter each time the score changes gives the number of *distinct* higher scores, not the number of higher-scoring contestants.\n\nO(n log n) time for the sort, O(n) space.",
    functionName: "competition_ranks",
    functionSignature: "def competition_ranks(scores: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def competition_ranks(scores: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[50, 80, 80, 30]], expected: [3, 1, 1, 4] },
      { input: [[7]], expected: [1] },
      { input: [[10, 20, 10, 20, 5]], expected: [3, 1, 3, 1, 5] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[5, 5, 5]], expected: [1, 1, 1] },
      { input: [[1, 2, 3]], expected: [3, 2, 1] },
      { input: [[3, 2, 1]], expected: [1, 2, 3] },
      { input: [[-1, -1, 0]], expected: [2, 2, 1] },
      { input: [[100, 90, 90, 90, 80, 80, 70]], expected: [1, 2, 2, 2, 5, 5, 7] },
    ],
  },
  {
    id: "high-low-lineup",
    number: 369,
    title: "High-Low Lineup",
    difficulty: "Easy",
    topic: "Sorting",
    statement:
      "Rearrange the integers in `nums` into a \"high-low\" lineup: first the largest value, then the smallest, then the second largest, then the second smallest, and so on, alternating until every element has been used exactly once. Duplicates are treated as separate elements.\n\nIf the list has an odd length, the middle value of the sorted order ends up last. Return the new list; an empty list returns `[]`.",
    explanation:
      "Repeatedly searching for the current maximum and minimum is O(n^2). Sort once instead, then read the sorted list from both ends with two pointers.\n\nSort ascending, set `lo = 0` and `hi = n - 1`. While `lo <= hi`: append `s[hi]` and move `hi` left; then, if `lo <= hi` still holds, append `s[lo]` and move `lo` right. The second check is what stops the middle element of an odd-length list from being added twice.\n\nWatch the starting side: the lineup begins with the **largest** value. O(n log n) time for the sort, O(n) space for the output.",
    functionName: "high_low_shuffle",
    functionSignature: "def high_low_shuffle(nums: list[int]) -> list[int]:",
    starter:
      STARTER_HEADER + "def high_low_shuffle(nums: list[int]) -> list[int]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 1, 4, 2, 3] },
      { input: [[7, 7, 1, 9]], expected: [9, 1, 7, 7] },
      { input: [[10, -4, 6]], expected: [10, -4, 6] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[4]], expected: [4] },
      { input: [[2, 1]], expected: [2, 1] },
      { input: [[3, 3, 3]], expected: [3, 3, 3] },
      { input: [[-5, 10, 0, -2, 8, 8]], expected: [10, -5, 8, -2, 8, 0] },
      { input: [[6, 1, 5, 2, 4, 3]], expected: [6, 1, 5, 2, 4, 3] },
    ],
  },
  {
    id: "frequency-sorted-text",
    number: 370,
    title: "Frequency Sorted Text",
    difficulty: "Medium",
    topic: "Sorting",
    statement:
      "Rebuild the string `s` so that its characters are grouped and ordered by how often they occur:\n\n- every copy of a character is placed together in one block;\n- a character that occurs more often comes before one that occurs less often;\n- characters that occur the same number of times are ordered by character code, smallest first (so digits come before uppercase letters, which come before lowercase letters).\n\n`s` contains only letters and digits, and upper and lower case are different characters. Return the rebuilt string; an empty string returns an empty string.",
    explanation:
      "Count the characters with a dictionary (or `Counter`), then sort the **distinct** characters, not the whole string, with the key `(-count, character)`. Negating the count gives descending frequency while leaving the character tie-break ascending. Finally emit each character repeated `count` times.\n\nRelying on `Counter.most_common()` alone is a bug here: it breaks ties by first appearance in the string, not by character code.\n\nBecause a count can never exceed `len(s)`, a bucket sort also works: put each character in bucket `count`, then read buckets from the largest count down, sorting the characters inside each bucket. With an alphabet of at most 62 symbols the sort of distinct characters is effectively constant, so the whole thing is O(n) time and O(n) space for the output.",
    functionName: "frequency_sort_text",
    functionSignature: "def frequency_sort_text(s: str) -> str:",
    starter:
      STARTER_HEADER + "def frequency_sort_text(s: str) -> str:\n    # Your code here\n    pass\n",
    examples: [
      { input: ["tree"], expected: "eert" },
      { input: ["Aabb"], expected: "bbAa" },
      { input: ["a1a1b"], expected: "11aab" },
    ],
    hiddenTests: [
      { input: [""], expected: "" },
      { input: ["cccaaa"], expected: "aaaccc" },
      { input: ["mississippi"], expected: "iiiissssppm" },
      { input: ["bBaA"], expected: "ABab" },
      { input: ["zzyyxx9"], expected: "xxyyzz9" },
      { input: ["2a2b1c1"], expected: "1122abc" },
    ],
  },
  {
    id: "natural-name-order",
    number: 371,
    title: "Natural Name Order",
    difficulty: "Medium",
    topic: "Sorting",
    statement:
      "Plain string sorting puts `\"img12\"` before `\"img2\"`. Sort the file names in `names` in **natural order** instead.\n\nEach name is a non-empty string of lowercase letters and digits. Split it into chunks: every maximal run of digits is a **number chunk** and every maximal run of letters is a **text chunk** (`\"a10b2\"` becomes `a`, `10`, `b`, `2`). No number chunk has a leading zero. Two names are compared chunk by chunk from the left, and the first difference decides:\n\n- two number chunks compare by numeric value (smaller first);\n- two text chunks compare in ordinary dictionary (string) order;\n- a number chunk comes before a text chunk.\n\nIf one name runs out of chunks while everything so far is equal, the name with fewer chunks comes first.\n\nReturn the names sorted in ascending natural order (duplicates are kept). An empty list returns `[]`.",
    explanation:
      "The trick is to turn each name into a **key** whose ordinary comparison follows the rules, rather than writing a pairwise comparator.\n\nSplit the name with a regular expression such as `re.findall(r'\\d+|[a-z]+', name)` (or a manual scan). Map each chunk to a tuple:\n\n- number chunk -> `(0, int(chunk), '')`\n- text chunk -> `(1, 0, chunk)`\n\nThe leading `0` / `1` makes every number chunk sort before every text chunk and, just as importantly, stops Python from ever comparing an `int` with a `str`. The key for a name is the list of these tuples; Python compares lists element by element and treats a proper prefix as smaller, which matches the \"fewer chunks first\" rule.\n\nConverting digits with `int` is what fixes `img2` versus `img12`. Handling only one trailing number is not enough: names such as `a10b2` and `a10b10` need every chunk compared.\n\nBuilding keys costs O(total characters); the sort is O(n log n) key comparisons. O(total characters) space.",
    functionName: "natural_sort",
    functionSignature: "def natural_sort(names: list[str]) -> list[str]:",
    starter:
      STARTER_HEADER + "def natural_sort(names: list[str]) -> list[str]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [["img12", "img2", "img1"]], expected: ["img1", "img2", "img12"] },
      { input: [["a10b2", "a10b10", "a9z"]], expected: ["a9z", "a10b2", "a10b10"] },
      { input: [["7up", "up7", "u", "77"]], expected: ["7up", "77", "u", "up7"] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [["v2", "v10", "v1", "v2a", "v2b10", "v2b9"]], expected: ["v1", "v2", "v2a", "v2b9", "v2b10", "v10"] },
      { input: [["file1", "file", "fil9"]], expected: ["fil9", "file", "file1"] },
      { input: [["abc", "abd", "ab100", "ab99"]], expected: ["ab99", "ab100", "abc", "abd"] },
      { input: [["n123456789012345678901", "n99", "n1000"]], expected: ["n99", "n1000", "n123456789012345678901"] },
      { input: [["x1y", "x1", "x", "x1y2", "x10", "x2"]], expected: ["x", "x1", "x1y", "x1y2", "x2", "x10"] },
    ],
  },
  {
    id: "sorted-diagonals",
    number: 372,
    title: "Sorted Diagonals",
    difficulty: "Medium",
    topic: "Sorting",
    statement:
      "You are given `grid`, a rectangular matrix of integers (a list of equal-length rows). A **diagonal** is a line of cells that starts on the top row or the left column and runs down and to the right until it leaves the matrix. Every cell lies on exactly one diagonal.\n\nSort each diagonal independently so that its values are in non-decreasing order when read from its top-left end to its bottom-right end. Values never move to a different diagonal.\n\nReturn the resulting matrix. The matrix need not be square. If `grid` is an empty list, return `[]`.",
    explanation:
      "Two cells `(r, c)` and `(r2, c2)` are on the same down-right diagonal exactly when `r - c == r2 - c2`. That difference is a ready-made bucket id.\n\n1. Walk the matrix in row order and append each value to `groups[r - c]`.\n2. Sort each group.\n3. Walk the matrix in the same row order again and hand each cell the next smallest unused value of its group. Because cells of one diagonal are visited from top-left to bottom-right, this lays the sorted values along the diagonal. Sorting each group in descending order and using `pop()` gives the smallest remaining value in O(1).\n\nIndexing only by `r - c` handles rectangular matrices with no special cases; solutions that iterate diagonals by start cell often forget the diagonals that start on the left column (or the top row) when the matrix is not square.\n\nEach value is sorted within its diagonal of length at most `min(rows, cols)`: O(rows x cols x log(min(rows, cols))) time, O(rows x cols) space.",
    functionName: "sort_diagonals",
    functionSignature: "def sort_diagonals(grid: list[list[int]]) -> list[list[int]]:",
    starter:
      STARTER_HEADER + "def sort_diagonals(grid: list[list[int]]) -> list[list[int]]:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[[3, 3, 1, 1], [2, 2, 1, 2], [1, 1, 1, 2]]], expected: [[1, 1, 1, 1], [1, 2, 2, 2], [1, 2, 3, 3]] },
      { input: [[[5, 4], [3, 1]]], expected: [[1, 4], [3, 5]] },
      { input: [[[9, 1], [8, 2], [7, 3], [6, 0]]], expected: [[2, 1], [3, 9], [0, 8], [6, 7]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[[3, 1, 2]]], expected: [[3, 1, 2]] },
      { input: [[[3], [1], [2]]], expected: [[3], [1], [2]] },
      { input: [[[4, 8, 2, 6], [1, 3, 7, 0]]], expected: [[3, 7, 0, 6], [1, 4, 8, 2]] },
      { input: [[[5, -1, 0], [2, -3, -1], [9, 2, -4]]], expected: [[-4, -1, 0], [2, -3, -1], [9, 2, 5]] },
      { input: [[[6, 5, 4], [3, 2, 1], [0, 9, 8], [7, 6, 5], [4, 3, 2]]], expected: [[2, 1, 4], [3, 6, 5], [0, 5, 8], [3, 2, 9], [4, 7, 6]] },
    ],
  },
  {
    id: "fewest-swaps-to-sort",
    number: 373,
    title: "Fewest Swaps to Sort",
    difficulty: "Medium",
    topic: "Sorting",
    statement:
      "`nums` is a list of **distinct** integers. In one move you may pick any two positions (they do not have to be adjacent) and swap their values.\n\nReturn the minimum number of swaps needed to put the list in ascending order. A list that is already sorted, including an empty list, needs `0`.",
    explanation:
      "Sorting tells you where every element has to go, and that defines a permutation: \"the element now at position `i` belongs at position `p[i]`\". Any permutation splits into disjoint **cycles**. A cycle of length `L` (elements that need to rotate among `L` positions) can be fixed with exactly `L - 1` swaps, since each swap can put at most one more element of the cycle into its final place and the last swap fixes two. Swaps inside one cycle never help another, so the answer is the sum of `L - 1` over all cycles, equivalently `n - (number of cycles)`.\n\nSteps: build `order`, the indices sorted by value (`order[j]` is the current index of the element that belongs at position `j`). Walk each unvisited index around its cycle via `order`, counting its length.\n\nCounting misplaced elements is not the answer: `[2, 3, 1]` has three misplaced elements but needs 2 swaps, while `[2, 1, 4, 3]` has four misplaced and also needs 2. Simulating a bubble or insertion sort counts adjacent swaps, which is a different (larger) number.\n\nO(n log n) for the sort plus O(n) for the cycle walk; O(n) space.",
    functionName: "min_swaps_to_sort",
    functionSignature: "def min_swaps_to_sort(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def min_swaps_to_sort(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[4, 3, 2, 1]], expected: 2 },
      { input: [[2, 3, 1]], expected: 2 },
      { input: [[1, 5, 4, 3, 2]], expected: 2 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[2, 1]], expected: 1 },
      { input: [[7, 1, 3, 2, 4, 5, 6]], expected: 5 },
      { input: [[10, -3, 5, 0]], expected: 2 },
      { input: [[3, 1, 2, 6, 4, 5]], expected: 4 },
      { input: [[2, 1, 4, 3]], expected: 2 },
    ],
  },
  {
    id: "window-to-re-sort",
    number: 374,
    title: "Window to Re-Sort",
    difficulty: "Medium",
    topic: "Sorting",
    statement:
      "Given an integer list `nums` (duplicates allowed), find the **shortest** contiguous block of positions such that sorting only that block into non-decreasing order leaves the entire list in non-decreasing order.\n\nReturn the length of that block. If the list is already in non-decreasing order (including an empty or one-element list), return `0`.",
    explanation:
      "Compare the list with a sorted copy of itself. Every position before the first mismatch already holds its final value, and so does every position after the last mismatch. The first and last mismatching positions must both be inside the block (their values have to change), and sorting everything between them clearly works, so the answer is `last - first + 1`, or `0` if there is no mismatch.\n\nIt is tempting to look only for places where `nums[i] > nums[i + 1]` and take the span from the first such drop to the last. That is too short: in `[1, 3, 2, 2, 2]` the only drop is between `3` and `2`, but the `3` has to travel to the end, so the block has length 4. The block must stretch left to cover everything greater than the minimum of the disordered part and right to cover everything smaller than its maximum.\n\nThe sorted-copy method is O(n log n) time and O(n) space. An O(n) alternative scans left to right tracking the running maximum (the last index whose value is below it is the right edge) and right to left tracking the running minimum (for the left edge).",
    functionName: "unsorted_window_length",
    functionSignature: "def unsorted_window_length(nums: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def unsorted_window_length(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[2, 6, 4, 8, 10, 9, 15]], expected: 5 },
      { input: [[1, 2, 3]], expected: 0 },
      { input: [[1, 3, 2, 2, 2]], expected: 4 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[1, 2, 4, 5, 3]], expected: 3 },
      { input: [[5, 1, 2, 3, 4]], expected: 5 },
      { input: [[1, 3, 5, 4, 2, 6]], expected: 4 },
      { input: [[1, 2, 3, 3, 3, 2]], expected: 4 },
      { input: [[1, 1, 0, 1, 1]], expected: 3 },
    ],
  },
  {
    id: "creator-tier",
    number: 375,
    title: "Creator Tier",
    difficulty: "Medium",
    topic: "Sorting",
    statement:
      "A video platform awards creators a **tier**. `views[i]` is the number of views (a non-negative integer) of the creator's `i`-th video. The creator's tier is the largest integer `t` such that at least `t` of their videos have **at least** `t` views each.\n\nReturn the tier. A creator with no videos has tier `0`.",
    explanation:
      "Sort the view counts in **descending** order. Now the question \"do at least `t` videos have at least `t` views?\" is simply \"is the `t`-th largest count (1-based) at least `t`?\", because the top `t` videos are the best candidates.\n\nWalk the sorted list with a 0-based index `i`: while `s[i] >= i + 1`, the tier can be at least `i + 1`. The first index where the test fails ends the walk, and the number of successful steps is the answer. The condition can only switch from true to false once, since `s[i]` is non-increasing while `i + 1` grows.\n\nOff-by-one errors are the whole difficulty: comparing `s[i] > i + 1` or `s[i] >= i` gives answers one too small or too large on inputs like `[1]` or `[2, 2]`. The tier is also capped by the number of videos: `[10, 10]` has tier 2.\n\nO(n log n) time. Since the tier never exceeds `n`, a counting-sort version (bucket counts capped at `n`, then accumulate from the top) runs in O(n). O(n) space.",
    functionName: "creator_tier",
    functionSignature: "def creator_tier(views: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def creator_tier(views: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[3, 0, 6, 1, 5]], expected: 3 },
      { input: [[10, 10]], expected: 2 },
      { input: [[1, 1, 1]], expected: 1 },
    ],
    hiddenTests: [
      { input: [[]], expected: 0 },
      { input: [[0]], expected: 0 },
      { input: [[1]], expected: 1 },
      { input: [[9, 7, 6, 2, 1]], expected: 3 },
      { input: [[5, 5, 5, 5]], expected: 4 },
      { input: [[2, 2]], expected: 2 },
    ],
  },
  {
    id: "pair-sums-in-range",
    number: 376,
    title: "Pair Sums in Range",
    difficulty: "Medium",
    topic: "Sorting",
    statement:
      "Given an integer list `nums` and two integers `low` and `high`, count the pairs of **positions** `(i, j)` with `i < j` whose values satisfy `low <= nums[i] + nums[j] <= high` (both bounds inclusive).\n\nPairs are counted by position, so equal values at different positions form different pairs. If `low > high`, or the list has fewer than two elements, the answer is `0`.",
    explanation:
      "Checking every pair is O(n^2). The key observation is that the condition only involves the two values, never their positions, so you are free to **sort** the list: the number of unordered pairs with a sum in range does not change.\n\nCounting a two-sided range directly is awkward, so count one-sided and subtract: `answer = pairs_with_sum_at_most(high) - pairs_with_sum_at_most(low - 1)`.\n\n`pairs_with_sum_at_most(limit)` on the sorted list uses two pointers, `lo` at the start and `hi` at the end. If `s[lo] + s[hi] <= limit`, then `s[lo]` also pairs with everything between `lo` and `hi` (those values are no larger than `s[hi]`), so add `hi - lo` and advance `lo`. Otherwise `s[hi]` is too large for every remaining partner, so decrease `hi`.\n\nMistakes to avoid: using `low` instead of `low - 1` in the subtraction (which drops sums equal to `low`), and de-duplicating values (pairs are positional).\n\nO(n log n) for the sort plus O(n) for the two scans; O(n) space for the sorted copy.",
    functionName: "count_pairs_in_range",
    functionSignature: "def count_pairs_in_range(nums: list[int], low: int, high: int) -> int:",
    starter:
      STARTER_HEADER + "def count_pairs_in_range(nums: list[int], low: int, high: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 3, 5, 7], 6, 10], expected: 4 },
      { input: [[2, 2, 2], 4, 4], expected: 3 },
      { input: [[-1, 4, 0, -3], -4, 0], expected: 3 },
    ],
    hiddenTests: [
      { input: [[], 0, 10], expected: 0 },
      { input: [[1, 2, 3], 5, 4], expected: 0 },
      { input: [[1, 2, 3, 4, 5], -100, 100], expected: 10 },
      { input: [[0, 1, 7, 4, 4, 5], 3, 6], expected: 6 },
      { input: [[6, 1, 1, 6, 3, 3], 7, 7], expected: 4 },
      { input: [[-5, -2, -2, 9, 4], -4, 2], expected: 4 },
    ],
  },
  {
    id: "adjacent-swaps-to-match",
    number: 377,
    title: "Adjacent Swaps to Match",
    difficulty: "Hard",
    topic: "Sorting",
    statement:
      "You are given two integer lists, `source` and `target`. In one move you may swap two **adjacent** elements of `source`.\n\nReturn the minimum number of moves needed to make `source` identical to `target`. If it cannot be done (the lists do not contain exactly the same values with the same multiplicities, which includes having different lengths), return `-1`. The lists may contain duplicates. Two empty lists need `0` moves.",
    explanation:
      "First check feasibility: adjacent swaps can produce any rearrangement, so the answer exists exactly when the two lists are equal as multisets (compare sorted copies or `Counter`s).\n\nNext, decide where each element of `source` ends up. With distinct values that is forced. With duplicates, the cheapest choice is to keep equal values in their original relative order: the first `x` in `source` goes to the first `x` slot in `target`, the second to the second, and so on. Crossing two equal elements would cost swaps and achieve nothing. Build, for each value, a queue of its positions in `target`, and replace every element of `source` by the next position from its value's queue. This gives a permutation `perm` of `0..n-1` that must be sorted.\n\nThe minimum number of adjacent swaps to sort a permutation is its number of **inversions** (pairs `i < j` with `perm[i] > perm[j]`): every adjacent swap changes the inversion count by exactly one, and a list with zero inversions is sorted.\n\nCount inversions with merge sort: while merging two sorted halves, whenever an element from the right half is placed before the remaining `m` elements of the left half, add `m`. That is O(n log n), versus O(n^2) for comparing all pairs or for simulating bubble sort.\n\nCounting positions where the lists differ is not related to the answer, and matching duplicates in the wrong order (for example always to the last free slot) overcounts.\n\nO(n log n) time, O(n) space.",
    functionName: "adjacent_swaps_to_match",
    functionSignature: "def adjacent_swaps_to_match(source: list[int], target: list[int]) -> int:",
    starter:
      STARTER_HEADER + "def adjacent_swaps_to_match(source: list[int], target: list[int]) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 2, 3], [3, 1, 2]], expected: 2 },
      { input: [[1, 1, 2], [2, 1, 1]], expected: 2 },
      { input: [[1, 2], [1, 3]], expected: -1 },
    ],
    hiddenTests: [
      { input: [[], []], expected: 0 },
      { input: [[1, 2, 3], [1, 2]], expected: -1 },
      { input: [[3, 1, 2, 1, 3], [1, 3, 3, 2, 1]], expected: 3 },
      { input: [[1, 1, 2], [1, 2, 2]], expected: -1 },
      { input: [[7, 7, 7, 0, 7], [0, 7, 7, 7, 7]], expected: 3 },
      { input: [[2, 1, 2, 1, 2, 1], [1, 1, 1, 2, 2, 2]], expected: 6 },
    ],
  },
  {
    id: "kth-closest-pair-gap",
    number: 378,
    title: "Kth Closest Pair Gap",
    difficulty: "Hard",
    topic: "Sorting",
    statement:
      "For an integer list `nums` with at least two elements, every pair of positions `i < j` has a **gap** `abs(nums[i] - nums[j])`. A list of length `n` therefore has `n * (n - 1) / 2` gaps, and equal gaps coming from different pairs are all counted separately.\n\nReturn the `k`-th smallest gap, where `k = 1` asks for the smallest and `k` never exceeds the number of pairs.",
    explanation:
      "Listing all gaps and sorting them is O(n^2 log n) time and O(n^2) memory. The faster route is to **binary search on the answer**, made possible by sorting the numbers first.\n\nDefine `count(d)` = the number of pairs whose gap is at most `d`. This grows as `d` grows, and the k-th smallest gap is the smallest `d` with `count(d) >= k`. Binary search `d` between `0` and `max(nums) - min(nums)`.\n\nTo compute `count(d)` quickly, sort `nums`. For each right end `hi`, slide a left pointer `lo` forward until `s[hi] - s[lo] <= d`; every index from `lo` to `hi - 1` then pairs with `hi`, contributing `hi - lo`. Because `lo` never moves backward as `hi` advances, one evaluation is O(n).\n\nDetails: the search must return the smallest `d` that reaches `k` (use `hi = mid` when `count(mid) >= k`, otherwise `lo = mid + 1`), and that `d` is always a real gap, since `count` only changes at real gap values. Repeated gaps count separately, so de-duplicating distances is wrong, and so is looking only at neighbours in sorted order (the k-th gap may come from elements that are not adjacent).\n\nO(n log n + n log W) time, where `W` is the value range; O(n) space.",
    functionName: "kth_pair_distance",
    functionSignature: "def kth_pair_distance(nums: list[int], k: int) -> int:",
    starter:
      STARTER_HEADER + "def kth_pair_distance(nums: list[int], k: int) -> int:\n    # Your code here\n    pass\n",
    examples: [
      { input: [[1, 3, 1], 1], expected: 0 },
      { input: [[1, 6, 1], 3], expected: 5 },
      { input: [[4, 1, 9, 7], 4], expected: 5 },
    ],
    hiddenTests: [
      { input: [[5, 5, 5, 5], 6], expected: 0 },
      { input: [[1, 2], 1], expected: 1 },
      { input: [[10, 1, 4, 8, 2], 1], expected: 1 },
      { input: [[10, 1, 4, 8, 2], 10], expected: 9 },
      { input: [[-3, 3, 0, -3], 4], expected: 3 },
      { input: [[0, 100, 1, 101], 3], expected: 99 },
    ],
  },
];
