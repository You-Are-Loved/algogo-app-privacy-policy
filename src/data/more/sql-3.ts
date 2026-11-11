import type { SqlProblem } from '../sqlProblems';

// SQL practice problems 126-150: ranking with tie rules, LAG/LEAD, running
// aggregates with explicit frames, medians, fill-forward, date bucketing,
// year-over-year, cohorts, recursive generators, islands and graph walks.

export const problems: SqlProblem[] = [
  // ===== Window Functions =====
  {
    id: 'sql-race-places-with-gaps',
    number: 126,
    title: 'Finishing Places With Skipped Ranks',
    difficulty: 'Easy',
    topic: 'Window Functions',
    statement:
      "`runners` has `id`, `name` (unique) and `finish_seconds` — the runner's time, or NULL when they did not finish.\n\nGive every finisher a `place` the way race results do: the fastest time is place 1, runners with the same time share a place, and the places after a tie are **skipped** (two runners tied for 1st are followed by 3rd, not 2nd). Runners who did not finish get a NULL `place`.\n\nReturn `name`, `finish_seconds` and `place`. Rows ordered by `finish_seconds` ascending with the non-finishers after every finisher, then by `name` ascending.",
    schema: `CREATE TABLE runners (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  finish_seconds INTEGER
);`,
    datasets: [
      `INSERT INTO runners VALUES
  (1, 'Asha', 1805),
  (2, 'Bruno', 1790),
  (3, 'Chidi', 1790),
  (4, 'Dara', NULL),
  (5, 'Emil', 1832),
  (6, 'Farah', 1805),
  (7, 'Gus', 1900);`,
      `INSERT INTO runners VALUES
  (1, 'Ivo', 2400),
  (2, 'Jun', 2400),
  (3, 'Kofi', 2400),
  (4, 'Lena', 2410),
  (5, 'Mara', 2395);`,
      `INSERT INTO runners VALUES
  (1, 'Nia', NULL),
  (2, 'Omar', 3100),
  (3, 'Pia', NULL),
  (4, 'Quinn', 3050),
  (5, 'Rui', 3075);`,
    ],
    ordered: true,
    solution: `SELECT name,
       finish_seconds,
       CASE WHEN finish_seconds IS NOT NULL
            THEN RANK() OVER (ORDER BY finish_seconds IS NULL, finish_seconds)
       END AS place
FROM runners
ORDER BY finish_seconds IS NULL, finish_seconds, name;`,
    hint: 'Three ranking functions differ only in how they treat ties. One of them leaves a hole after a tie. Also check where SQLite sorts NULL in ascending order.',
    explanation:
      "`ROW_NUMBER` never repeats, `DENSE_RANK` repeats and continues with the next integer (1, 1, 2), and `RANK` repeats and then skips (1, 1, 3) — a runner's `RANK` is one more than the number of runners strictly ahead of them, which is exactly how race places work. The second trap is NULL: SQLite sorts NULL *first* in ascending order, so a plain `RANK() OVER (ORDER BY finish_seconds)` hands place 1 to the non-finishers and pushes every real finisher down. Put `finish_seconds IS NULL` (0 for finishers, 1 for the rest) in front of the window's sort key so the finishers are ranked first, and wrap the rank in a `CASE` so non-finishers show NULL instead of a number. The same leading key in the final `ORDER BY` puts them at the bottom of the list. One sort, O(n log n).",
  },
  {
    id: 'sql-second-stay-per-guest',
    number: 127,
    title: "Each Guest's Second Stay",
    difficulty: 'Easy',
    topic: 'Window Functions',
    statement:
      "`stays` has `id`, `guest_id`, `hotel` and `check_in` (`YYYY-MM-DD`). Ids are **not** assigned in date order (old paper records were typed in later).\n\nA loyalty team wants to know where each guest went the second time. Put each guest's stays in order of `check_in`; when a guest has two stays with the same `check_in`, the lower `id` comes first. Return `guest_id`, `hotel` and `check_in` of each guest's **second** stay. Guests with only one stay do not appear. Rows ordered by `guest_id` ascending.",
    schema: `CREATE TABLE stays (
  id INTEGER PRIMARY KEY,
  guest_id INTEGER NOT NULL,
  hotel TEXT NOT NULL,
  check_in TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO stays VALUES
  (1, 10, 'Harbour Inn', '2024-03-02'),
  (2, 11, 'Pine Lodge', '2024-03-05'),
  (3, 10, 'Pine Lodge', '2024-01-20'),
  (4, 10, 'Old Mill', '2024-04-11'),
  (5, 12, 'Old Mill', '2024-02-14'),
  (6, 12, 'Harbour Inn', '2024-02-14'),
  (7, 12, 'Pine Lodge', '2024-02-01');`,
      `INSERT INTO stays VALUES
  (1, 5, 'Seaview', '2023-07-01'),
  (2, 5, 'Grand Arcade', '2023-07-01'),
  (3, 5, 'Seaview', '2023-08-01'),
  (4, 6, 'Seaview', '2023-07-04'),
  (5, 7, 'Station Hotel', '2023-09-09'),
  (6, 7, 'Grand Arcade', '2023-05-09'),
  (7, 7, 'Seaview', '2023-03-09'),
  (8, 7, 'Station Hotel', '2023-01-09');`,
      `INSERT INTO stays VALUES
  (1, 3, 'Lakehouse', '2024-06-01'),
  (2, 1, 'Lakehouse', '2024-06-03'),
  (3, 2, 'The Priory', '2024-06-02'),
  (4, 1, 'The Priory', '2024-05-30'),
  (5, 2, 'Lakehouse', '2024-06-02');`,
    ],
    ordered: true,
    solution: `SELECT guest_id, hotel, check_in
FROM (
  SELECT guest_id, hotel, check_in,
         ROW_NUMBER() OVER (PARTITION BY guest_id ORDER BY check_in, id) AS stay_no
  FROM stays
)
WHERE stay_no = 2
ORDER BY guest_id;`,
    hint: 'Number the stays inside each guest. You need a numbering that never gives two rows the same number, and a sort key that settles same-day stays.',
    explanation:
      "Picking the n-th row of every group is a numbering problem. `ROW_NUMBER() OVER (PARTITION BY guest_id ORDER BY check_in, id)` restarts at 1 for each guest and counts 1, 2, 3 … with no repeats, so filtering on `stay_no = 2` returns at most one row per guest and nothing for guests with a single stay. Two details decide correctness. First, the window's `ORDER BY` must be a total order: with `check_in` alone, two same-day stays are peers and the engine may number them either way, so add `id` as the stated tie-break. Second, `RANK` is the wrong tool here: two stays on the same first day both get rank 1 and the next gets 3, so no row has rank 2 and the guest silently vanishes. A window function cannot be used in `WHERE` directly (it is evaluated after filtering), which is why the numbering lives in a subquery. Cost is one sort per guest, O(n log n).",
  },
  {
    id: 'sql-gap-to-stage-winner',
    number: 128,
    title: 'Time Behind the Stage Winner',
    difficulty: 'Easy',
    topic: 'Window Functions',
    statement:
      "`stage_results` has one row per rider per stage of a cycling tour: `stage` (1, 2, 3 …), `rider` and `seconds` (the rider's time on that stage).\n\nReturn `stage`, `rider`, `seconds` and `gap` — how many seconds the rider finished behind the fastest time **of that stage** (0 for the stage winner, and for anyone tied with them). Rows ordered by `stage` ascending, then `gap` ascending, then `rider` ascending.",
    schema: `CREATE TABLE stage_results (
  stage INTEGER NOT NULL,
  rider TEXT NOT NULL,
  seconds INTEGER NOT NULL,
  PRIMARY KEY (stage, rider)
);`,
    datasets: [
      `INSERT INTO stage_results VALUES
  (1, 'Anouk', 3605),
  (1, 'Bram', 3590),
  (1, 'Cato', 3590),
  (1, 'Dries', 3700),
  (2, 'Anouk', 4100),
  (2, 'Bram', 4180),
  (2, 'Dries', 4125);`,
      `INSERT INTO stage_results VALUES
  (1, 'Zeno', 900),
  (2, 'Yara', 1210),
  (2, 'Zeno', 1200),
  (2, 'Wim', 1260),
  (3, 'Wim', 800),
  (3, 'Yara', 845),
  (3, 'Zeno', 830);`,
      `INSERT INTO stage_results VALUES
  (4, 'Lotte', 5000),
  (4, 'Mees', 5000),
  (4, 'Noor', 5000),
  (7, 'Lotte', 6100),
  (7, 'Mees', 6040),
  (7, 'Noor', 6075),
  (7, 'Abel', 6090);`,
    ],
    ordered: true,
    solution: `SELECT stage,
       rider,
       seconds,
       seconds - MIN(seconds) OVER (PARTITION BY stage) AS gap
FROM stage_results
ORDER BY stage, gap, rider;`,
    hint: 'You need the stage minimum next to every row without collapsing the rows. An aggregate can be used as a window function.',
    explanation:
      "`GROUP BY stage` would give the fastest time but throw the riders away; you would have to join it back. Adding `OVER (PARTITION BY stage)` to `MIN` keeps every row and attaches the minimum of its partition, so the gap is a simple subtraction. Note what is *not* in the window: an `ORDER BY`. As soon as a window has an `ORDER BY`, the default frame becomes 'from the start of the partition up to the current row', and `MIN` turns into a running minimum — the first rider alphabetically would always show a gap of 0. Leave the ordering out and the frame is the whole partition. Forgetting `PARTITION BY` is the other classic slip: the gap would be measured against the fastest time of the whole tour. One pass per stage, O(n log n) for the final sort.",
  },
  {
    id: 'sql-next-checkup-date',
    number: 129,
    title: 'When Each Pet Came Back',
    difficulty: 'Easy',
    topic: 'Window Functions',
    statement:
      "A vet clinic keeps `checkups` with `id`, `pet_id` and `visit_on` (`YYYY-MM-DD`). A pet has at most one checkup per day, and ids are not in date order.\n\nFor every checkup return `pet_id`, `visit_on`, `next_visit_on` — the date of the same pet's next checkup after this one — and `days_until`, the whole number of days between the two dates. Both are NULL for a pet's latest checkup. Rows ordered by `pet_id` ascending, then `visit_on` ascending.",
    schema: `CREATE TABLE checkups (
  id INTEGER PRIMARY KEY,
  pet_id INTEGER NOT NULL,
  visit_on TEXT NOT NULL,
  UNIQUE (pet_id, visit_on)
);`,
    datasets: [
      `INSERT INTO checkups VALUES
  (1, 31, '2024-02-20'),
  (2, 32, '2024-02-25'),
  (3, 31, '2024-03-05'),
  (4, 31, '2023-12-28'),
  (5, 33, '2024-01-10'),
  (6, 32, '2024-08-25');`,
      `INSERT INTO checkups VALUES
  (1, 8, '2023-03-01'),
  (2, 8, '2023-02-01'),
  (3, 8, '2023-01-01'),
  (4, 9, '2023-02-15'),
  (5, 9, '2023-01-15');`,
      `INSERT INTO checkups VALUES
  (1, 4, '2024-12-31'),
  (2, 4, '2025-01-01'),
  (3, 5, '2024-12-31'),
  (4, 4, '2025-12-31'),
  (5, 6, '2025-06-06');`,
    ],
    ordered: true,
    solution: `SELECT pet_id,
       visit_on,
       LEAD(visit_on) OVER w AS next_visit_on,
       CAST(julianday(LEAD(visit_on) OVER w) - julianday(visit_on) AS INTEGER) AS days_until
FROM checkups
WINDOW w AS (PARTITION BY pet_id ORDER BY visit_on)
ORDER BY pet_id, visit_on;`,
    hint: 'LAG looks at the previous row of the window; its mirror image looks at the following one. Subtracting two ISO date strings does not give days.',
    explanation:
      "`LEAD(visit_on) OVER (PARTITION BY pet_id ORDER BY visit_on)` reads the value from the following row of the same pet, and returns NULL when there is no following row, which is exactly the required behaviour for the latest checkup. Order the window by the date, not by `id`: ids here are not chronological. For the day count, dates stored as text cannot be subtracted (SQLite would subtract the leading years, `2024 - 2024 = 0`); convert each with `julianday()`, which returns a day number, and subtract those — it handles month lengths, leap days and year changes for you. NULL flows through the arithmetic, so `days_until` is NULL wherever `next_visit_on` is. A named `WINDOW` clause avoids repeating the window definition. The alternative is a correlated subquery, `SELECT MIN(visit_on) … WHERE visit_on > this one`, which rescans the pet's rows for every row; the window does it in one sorted pass.",
  },
  {
    id: 'sql-keep-only-status-changes',
    number: 130,
    title: 'Keep Only the Status Changes',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "A courier's feed re-sends an order's current status every few hours, so `order_status_log` (`id`, `order_id`, `status`, `logged_at` as `YYYY-MM-DD HH:MM:SS`) is full of repeats. Within an order, put the rows in order of `logged_at`, breaking ties by `id` ascending. Ids are not guaranteed to follow time order.\n\nKeep a row only when it is the order's first row or its `status` differs from the status on the order's previous row. An order can return to a status it had before (`placed` → `on_hold` → `placed`); that second `placed` is a real change and must be kept.\n\nReturn `id`, `order_id`, `status` and `logged_at` of the kept rows, ordered by `order_id` ascending, then `logged_at` ascending, then `id` ascending.",
    schema: `CREATE TABLE order_status_log (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  logged_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO order_status_log VALUES
  (1, 500, 'placed', '2024-06-01 09:00:00'),
  (2, 500, 'placed', '2024-06-01 09:05:00'),
  (3, 500, 'packed', '2024-06-01 11:00:00'),
  (4, 501, 'placed', '2024-06-01 11:30:00'),
  (5, 500, 'packed', '2024-06-01 12:00:00'),
  (6, 500, 'shipped', '2024-06-02 08:00:00'),
  (7, 501, 'on_hold', '2024-06-02 09:00:00'),
  (8, 501, 'placed', '2024-06-02 15:00:00'),
  (9, 501, 'placed', '2024-06-02 15:00:00'),
  (10, 500, 'shipped', '2024-06-02 16:00:00');`,
      `INSERT INTO order_status_log VALUES
  (1, 7, 'paid', '2024-01-05 09:00:00'),
  (2, 7, 'refunded', '2024-01-05 11:00:00'),
  (3, 7, 'new', '2024-01-05 08:00:00'),
  (4, 7, 'paid', '2024-01-05 10:00:00'),
  (5, 8, 'new', '2024-01-06 12:00:00'),
  (6, 8, 'paid', '2024-01-06 12:00:00'),
  (7, 8, 'paid', '2024-01-06 12:00:00');`,
      `INSERT INTO order_status_log VALUES
  (1, 90, 'placed', '2024-03-01 10:00:00'),
  (2, 91, 'placed', '2024-03-01 10:00:00'),
  (3, 91, 'placed', '2024-03-01 13:00:00'),
  (4, 91, 'placed', '2024-03-02 13:00:00'),
  (5, 92, 'placed', '2024-03-01 09:00:00'),
  (6, 92, 'cancelled', '2024-03-01 09:30:00'),
  (7, 92, 'placed', '2024-03-01 09:45:00'),
  (8, 92, 'cancelled', '2024-03-01 09:50:00');`,
    ],
    ordered: true,
    solution: `WITH seq AS (
  SELECT id, order_id, status, logged_at,
         LAG(status) OVER (PARTITION BY order_id ORDER BY logged_at, id) AS prev_status
  FROM order_status_log
)
SELECT id, order_id, status, logged_at
FROM seq
WHERE prev_status IS NULL OR status <> prev_status
ORDER BY order_id, logged_at, id;`,
    hint: "Compare each row with the row just before it for the same order. DISTINCT or GROUP BY on (order, status) cannot work, because a status may legitimately come back later.",
    explanation:
      "The tempting shortcut is `GROUP BY order_id, status` with `MIN(logged_at)`: it keeps the first sighting of every status. But that treats `placed` → `on_hold` → `placed` as two changes instead of three, because it has no notion of *adjacent*. Change detection is a comparison between neighbours, which is what `LAG` gives you: `LAG(status) OVER (PARTITION BY order_id ORDER BY logged_at, id)` puts the previous row's status beside the current one. Keep the row when that value is NULL (no previous row: the order's first log line) or different. Write the NULL case explicitly: `status <> NULL` is NULL, not true, so without it every order's first row would be filtered out. The partition matters (rows of other orders are interleaved in time) and so does the tie-break in the window's `ORDER BY`: two rows can share a timestamp and `id` decides which one is 'previous'. One sorted pass, O(n log n).",
  },
  {
    id: 'sql-days-that-set-a-record',
    number: 131,
    title: 'Days That Set a New Record',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "`river_levels` has one row per station per day: `station`, `measured_on` (`YYYY-MM-DD`) and `level_cm`.\n\nA reading is a *record* when it is **strictly higher** than every earlier reading at the same station. A station's first reading is always a record; a reading that merely equals the standing record is not.\n\nReturn `station`, `measured_on` and `level_cm` of every record reading, ordered by `station` ascending, then `measured_on` ascending.",
    schema: `CREATE TABLE river_levels (
  station TEXT NOT NULL,
  measured_on TEXT NOT NULL,
  level_cm INTEGER NOT NULL,
  PRIMARY KEY (station, measured_on)
);`,
    datasets: [
      `INSERT INTO river_levels VALUES
  ('Ford', '2024-06-01', 120),
  ('Ford', '2024-06-02', 118),
  ('Ford', '2024-06-03', 125),
  ('Ford', '2024-06-04', 125),
  ('Ford', '2024-06-05', 131),
  ('Ford', '2024-06-06', 90),
  ('Ford', '2024-06-07', 100),
  ('Weir', '2024-06-01', 300),
  ('Weir', '2024-06-02', 300),
  ('Weir', '2024-06-03', 299),
  ('Weir', '2024-06-04', 305);`,
      `INSERT INTO river_levels VALUES
  ('Mill', '2024-01-10', 50),
  ('Mill', '2024-01-11', 40),
  ('Mill', '2024-01-12', 45),
  ('Mill', '2024-01-13', 60),
  ('Quay', '2024-01-10', 70),
  ('Quay', '2024-01-11', 60),
  ('Quay', '2024-01-12', 50);`,
      `INSERT INTO river_levels VALUES
  ('Lock', '2024-02-03', 10),
  ('Lock', '2024-02-01', 30),
  ('Lock', '2024-02-02', 20),
  ('Lock', '2024-02-04', 31),
  ('Dam', '2024-02-01', 5),
  ('Dam', '2024-02-02', 6),
  ('Dam', '2024-02-03', 7),
  ('Dam', '2024-02-04', 7);`,
    ],
    ordered: true,
    solution: `WITH t AS (
  SELECT station, measured_on, level_cm,
         MAX(level_cm) OVER (
           PARTITION BY station ORDER BY measured_on
           ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
         ) AS best_before
  FROM river_levels
)
SELECT station, measured_on, level_cm
FROM t
WHERE best_before IS NULL OR level_cm > best_before
ORDER BY station, measured_on;`,
    hint: 'Compare each reading with the highest reading seen strictly before it. The default window frame includes the current row; you need one that stops a row earlier.',
    explanation:
      "Comparing with yesterday (`LAG`) is not enough: after a drop, a small rise beats the previous day without beating the record. What you need beside each row is the running maximum of all *earlier* rows. With `ORDER BY` in a window the default frame runs from the start of the partition through the current row, which would include the reading itself — then `level_cm = MAX(...)` is also true for a reading that only ties the record. Spell the frame out: `ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING` ends one row before the current one. For the first row of a station that frame is empty, `MAX` over nothing is NULL, and the `best_before IS NULL` branch makes the first reading a record. The strict `>` then rejects ties. The equivalent without windows is `NOT EXISTS (an earlier reading with level >= this one)`, which is O(n²) per station; the window is a single sorted pass.",
  },
  {
    id: 'sql-purchase-that-broke-budget',
    number: 132,
    title: 'The Purchase That Broke the Budget',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "`budgets` has `team` (unique) and `limit_cents`. `purchases` has `id`, `team`, `bought_on` (`YYYY-MM-DD`) and `amount_cents` (always positive); every purchase's team has a budget. Ids are not in date order.\n\nAdd up each team's purchases in order of `bought_on`, breaking ties by `id` ascending. For every team whose running total at some point goes **over** its limit (strictly greater; landing exactly on the limit is fine), return `team`, `purchase_id` — the purchase that first pushed the running total over — and `total_after`, the running total including that purchase. Teams that never go over do not appear. Rows ordered by `team` ascending.",
    schema: `CREATE TABLE budgets (
  team TEXT PRIMARY KEY,
  limit_cents INTEGER NOT NULL
);
CREATE TABLE purchases (
  id INTEGER PRIMARY KEY,
  team TEXT NOT NULL,
  bought_on TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO budgets VALUES ('design', 50000), ('infra', 120000), ('legal', 30000);
INSERT INTO purchases VALUES
  (1, 'design', '2024-04-02', 20000),
  (2, 'design', '2024-04-09', 30000),
  (3, 'design', '2024-04-20', 1500),
  (4, 'infra', '2024-04-03', 70000),
  (5, 'infra', '2024-04-03', 60000),
  (6, 'infra', '2024-04-10', 10000),
  (7, 'legal', '2024-04-05', 12000),
  (8, 'design', '2024-04-25', 9000);`,
      `INSERT INTO budgets VALUES ('ops', 1000), ('lab', 500), ('events', 800), ('idle', 100);
INSERT INTO purchases VALUES
  (1, 'ops', '2024-02-10', 600),
  (2, 'ops', '2024-02-01', 500),
  (3, 'ops', '2024-02-05', 300),
  (4, 'lab', '2024-02-02', 900),
  (5, 'lab', '2024-02-03', 100),
  (6, 'events', '2024-02-07', 400),
  (7, 'events', '2024-02-07', 400),
  (8, 'events', '2024-02-07', 1);`,
      `INSERT INTO budgets VALUES ('north', 3000), ('south', 3000);
INSERT INTO purchases VALUES
  (1, 'north', '2024-09-01', 1000),
  (2, 'north', '2024-09-02', 1000),
  (3, 'north', '2024-09-03', 1000),
  (4, 'south', '2024-09-03', 2500),
  (5, 'south', '2024-09-01', 400),
  (6, 'south', '2024-09-02', 200);`,
    ],
    ordered: true,
    solution: `WITH run AS (
  SELECT id, team, bought_on,
         SUM(amount_cents) OVER (
           PARTITION BY team ORDER BY bought_on, id
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         ) AS total_after
  FROM purchases
),
over_limit AS (
  SELECT r.team, r.id, r.total_after,
         ROW_NUMBER() OVER (PARTITION BY r.team ORDER BY r.bought_on, r.id) AS rn
  FROM run r
  JOIN budgets b ON b.team = r.team
  WHERE r.total_after > b.limit_cents
)
SELECT team, id AS purchase_id, total_after
FROM over_limit
WHERE rn = 1
ORDER BY team;`,
    hint: 'Build a running total per team first, then find the earliest row where it is above the limit. Think about what happens to a running SUM when two purchases share a date.',
    explanation:
      "Two steps. First a running total: `SUM(amount_cents) OVER (PARTITION BY team ORDER BY bought_on, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`. The frame is the subtle part. If you order by `bought_on` alone and leave the frame at its default (`RANGE`), all rows with the same date are *peers* and each of them receives the total up to and including the last of them — two same-day purchases would both show the combined amount, and the wrong one could be blamed. A unique sort key (`bought_on, id`) plus an explicit `ROWS` frame gives a true row-by-row total. Second, among the rows whose total is strictly above the team's limit, take the earliest: because amounts are positive the total only grows, so that is the purchase that crossed the line. `ROW_NUMBER` over the same order and `rn = 1` picks it; teams with no qualifying rows simply produce nothing. One sort per team, O(n log n).",
  },
  {
    id: 'sql-exam-score-percentile',
    number: 133,
    title: 'Percentile Standing of Every Exam Score',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "`results` has one row per student per exam: `exam`, `student` and `score` (an integer).\n\nA result's `percentile` is the percentage of results **in the same exam** whose score is less than or equal to it (the result itself counts), rounded to 1 decimal place. So the top score of every exam is at 100.0, and students with equal scores get equal percentiles.\n\nReturn `exam`, `student`, `score` and `percentile`, ordered by `exam` ascending, then `score` descending, then `student` ascending.",
    schema: `CREATE TABLE results (
  exam TEXT NOT NULL,
  student TEXT NOT NULL,
  score INTEGER NOT NULL,
  PRIMARY KEY (exam, student)
);`,
    datasets: [
      `INSERT INTO results VALUES
  ('algebra', 'Bea', 78),
  ('algebra', 'Cal', 91),
  ('algebra', 'Dov', 78),
  ('algebra', 'Esme', 64),
  ('algebra', 'Finn', 55),
  ('biology', 'Bea', 70),
  ('biology', 'Cal', 70),
  ('biology', 'Dov', 88),
  ('biology', 'Esme', 40);`,
      `INSERT INTO results VALUES
  ('chem', 'Ola', 51),
  ('drama', 'Ola', 80),
  ('drama', 'Pip', 60),
  ('drama', 'Raj', 70),
  ('ethics', 'Ola', 10),
  ('ethics', 'Pip', 20),
  ('ethics', 'Raj', 20),
  ('ethics', 'Sam', 30),
  ('ethics', 'Tess', 30),
  ('ethics', 'Uma', 30);`,
      `INSERT INTO results VALUES
  ('french', 'Ana', 66),
  ('french', 'Bo', 66),
  ('french', 'Cy', 66),
  ('greek', 'Ana', 1),
  ('greek', 'Bo', 2),
  ('greek', 'Cy', 3),
  ('greek', 'Di', 4),
  ('greek', 'Ed', 5),
  ('greek', 'Flo', 6),
  ('greek', 'Gil', 7);`,
    ],
    ordered: true,
    solution: `SELECT exam,
       student,
       score,
       ROUND(100.0 * COUNT(*) OVER (
               PARTITION BY exam ORDER BY score
               RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
             ) / COUNT(*) OVER (PARTITION BY exam), 1) AS percentile
FROM results
ORDER BY exam, score DESC, student;`,
    hint: 'For each row you need two counts from its exam: how many scores are at or below it, and how many there are in total. A RANGE frame treats equal scores as one block.',
    explanation:
      "The definition is a ratio of two counts per exam. The denominator is `COUNT(*) OVER (PARTITION BY exam)`. The numerator is a running count in score order — and here `RANGE` versus `ROWS` matters. With `ROWS … CURRENT ROW` the count stops at the physical row, so two students on 78 would get different numbers depending on an arbitrary order. With `RANGE … CURRENT ROW` the frame extends to the last *peer* of the current row (every row with the same score), which is exactly 'less than or equal'. That ratio is what the built-in `CUME_DIST()` returns, so `ROUND(100.0 * CUME_DIST() OVER (PARTITION BY exam ORDER BY score), 1)` is the short form. Do not confuse it with `PERCENT_RANK()`, which is (rank − 1) / (rows − 1): it puts the lowest score at 0 and counts only strictly lower scores. Multiply by `100.0`, not `100`, to stay out of integer division. One sort per exam.",
  },
  {
    id: 'sql-current-win-streak',
    number: 134,
    title: 'Current Winning Streak',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "`matches` has `id`, `team`, `played_on` (`YYYY-MM-DD`) and `result` — `'W'` (win), `'D'` (draw) or `'L'` (loss). A team plays at most one match per day; ids are not in date order.\n\nA team's *current streak* is the number of wins in a row counting back from its most recent match: it stops at the first match that is not a win, so a draw ends a streak just like a loss, and a team whose latest match was not a win has a streak of 0.\n\nReturn `team` and `streak` for every team, ordered by `streak` descending, then `team` ascending.",
    schema: `CREATE TABLE matches (
  id INTEGER PRIMARY KEY,
  team TEXT NOT NULL,
  played_on TEXT NOT NULL,
  result TEXT NOT NULL,
  UNIQUE (team, played_on)
);`,
    datasets: [
      `INSERT INTO matches VALUES
  (1, 'Otters', '2024-03-02', 'W'),
  (2, 'Otters', '2024-03-09', 'L'),
  (3, 'Otters', '2024-03-16', 'W'),
  (4, 'Otters', '2024-03-23', 'W'),
  (5, 'Otters', '2024-03-30', 'W'),
  (6, 'Herons', '2024-03-02', 'W'),
  (7, 'Herons', '2024-03-09', 'W'),
  (8, 'Herons', '2024-03-16', 'W'),
  (9, 'Herons', '2024-03-23', 'W'),
  (10, 'Herons', '2024-03-30', 'L'),
  (11, 'Larks', '2024-03-02', 'L'),
  (12, 'Larks', '2024-03-09', 'W'),
  (13, 'Larks', '2024-03-16', 'D'),
  (14, 'Larks', '2024-03-23', 'W'),
  (15, 'Swifts', '2024-03-09', 'W'),
  (16, 'Swifts', '2024-03-16', 'W');`,
      `INSERT INTO matches VALUES
  (1, 'Ravens', '2024-05-20', 'W'),
  (2, 'Ravens', '2024-05-06', 'W'),
  (3, 'Ravens', '2024-05-13', 'L'),
  (4, 'Wrens', '2024-05-06', 'L'),
  (5, 'Wrens', '2024-05-20', 'W'),
  (6, 'Wrens', '2024-05-13', 'W'),
  (7, 'Cranes', '2024-05-06', 'D');`,
      `INSERT INTO matches VALUES
  (1, 'Finches', '2023-12-30', 'W'),
  (2, 'Finches', '2024-01-06', 'W'),
  (3, 'Finches', '2024-01-13', 'D'),
  (4, 'Finches', '2024-01-20', 'W'),
  (5, 'Finches', '2024-01-27', 'W'),
  (6, 'Terns', '2023-12-30', 'D'),
  (7, 'Terns', '2024-01-06', 'W'),
  (8, 'Terns', '2024-01-13', 'W'),
  (9, 'Gulls', '2024-01-06', 'L'),
  (10, 'Gulls', '2024-01-13', 'L');`,
    ],
    ordered: true,
    solution: `WITH flagged AS (
  SELECT team,
         SUM(CASE WHEN result <> 'W' THEN 1 ELSE 0 END) OVER (
           PARTITION BY team ORDER BY played_on DESC
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         ) AS non_wins_so_far
  FROM matches
)
SELECT team,
       SUM(CASE WHEN non_wins_so_far = 0 THEN 1 ELSE 0 END) AS streak
FROM flagged
GROUP BY team
ORDER BY streak DESC, team;`,
    hint: "Walk each team's matches from newest to oldest and keep a running count of matches that were not wins. Which rows belong to the current streak?",
    explanation:
      "This is not the *longest* streak and not the total number of wins — only the run that touches the most recent match counts. Walk backwards: order each team's matches newest first and keep a running count of non-wins. While that count is still 0, every match seen so far has been a win, so the row belongs to the current streak; the first draw or loss lifts the count to 1 and it never returns to 0. Counting the rows with `non_wins_so_far = 0` gives the streak, and it is naturally 0 when the latest match itself was not a win. Using a conditional `SUM` in the outer query (rather than `WHERE non_wins_so_far = 0` and `COUNT(*)`) keeps teams with a streak of 0 in the output. An equivalent non-window formulation: find each team's latest non-win date and count the wins after it, treating 'no such date' as 'count them all'. One sort per team, O(n log n).",
  },
  {
    id: 'sql-median-delivery-minutes',
    number: 135,
    title: 'Median Delivery Time per Courier',
    difficulty: 'Hard',
    topic: 'Window Functions',
    statement:
      "`deliveries` has `id`, `courier` and `minutes` — how long the delivery took, or NULL while the parcel is still on the road. SQLite has no `MEDIAN` function.\n\nFor each courier compute the median of their **completed** deliveries (non-NULL `minutes`): sort the values; with an odd count the median is the middle value, with an even count it is the average of the two middle values (so it may end in .5 — do not round).\n\nReturn `courier`, `completed` (how many completed deliveries) and `median_minutes`. Couriers with no completed delivery do not appear. Rows ordered by `courier` ascending.",
    schema: `CREATE TABLE deliveries (
  id INTEGER PRIMARY KEY,
  courier TEXT NOT NULL,
  minutes INTEGER
);`,
    datasets: [
      `INSERT INTO deliveries VALUES
  (1, 'Ines', 45),
  (2, 'Ines', 20),
  (3, 'Ines', NULL),
  (4, 'Ines', 30),
  (5, 'Ines', 25),
  (6, 'Joss', 18),
  (7, 'Joss', 40),
  (8, 'Joss', 22),
  (9, 'Kit', NULL),
  (10, 'Lior', 35),
  (11, 'Lior', 35),
  (12, 'Moss', 12),
  (13, 'Moss', 14),
  (14, 'Moss', 90),
  (15, 'Moss', 15),
  (16, 'Moss', 13);`,
      `INSERT INTO deliveries VALUES
  (1, 'Ari', 50),
  (2, 'Bex', 10),
  (3, 'Bex', 20),
  (4, 'Bex', 20),
  (5, 'Bex', 90),
  (6, 'Cruz', 7),
  (7, 'Cruz', 9),
  (8, 'Cruz', 4),
  (9, 'Cruz', 30),
  (10, 'Cruz', 11),
  (11, 'Cruz', 12),
  (12, 'Dee', NULL),
  (13, 'Dee', NULL),
  (14, 'Dee', 61),
  (15, 'Dee', 60);`,
      `INSERT INTO deliveries VALUES
  (1, 'Uri', NULL),
  (2, 'Vee', 0),
  (3, 'Vee', 0),
  (4, 'Vee', 1),
  (5, 'Vee', NULL),
  (6, 'Vee', NULL),
  (7, 'Wyn', 100),
  (8, 'Wyn', 1),
  (9, 'Wyn', 1),
  (10, 'Wyn', 1),
  (11, 'Wyn', 2),
  (12, 'Wyn', 3),
  (13, 'Wyn', 100);`,
    ],
    ordered: true,
    solution: `WITH done AS (
  SELECT courier, minutes,
         ROW_NUMBER() OVER (PARTITION BY courier ORDER BY minutes) AS rn,
         COUNT(*) OVER (PARTITION BY courier) AS n
  FROM deliveries
  WHERE minutes IS NOT NULL
)
SELECT courier,
       MAX(n) AS completed,
       AVG(minutes) AS median_minutes
FROM done
WHERE rn IN ((n + 1) / 2, (n + 2) / 2)
GROUP BY courier
ORDER BY courier;`,
    hint: 'Number the non-NULL values of each courier in sorted order and count them. Which row numbers are "the middle" when the count is odd, and when it is even? Integer division helps.',
    explanation:
      "A median is a position, so number the rows: `ROW_NUMBER() OVER (PARTITION BY courier ORDER BY minutes)` gives each completed delivery its place in sorted order and `COUNT(*) OVER (PARTITION BY courier)` puts the group size `n` beside it. The middle positions come from integer division: `(n + 1) / 2` and `(n + 2) / 2`. For odd `n` both are the same row (n = 5 → 3 and 3); for even `n` they are the two central rows (n = 4 → 2 and 3). Keep just those rows and take `AVG`, which is the value itself for one row and the midpoint for two. Filter the NULLs out *before* numbering: SQLite sorts NULL first, so unfinished deliveries would occupy the low positions and shift the middle. Use `ROW_NUMBER`, not `RANK`: equal values must still occupy distinct positions. `AVG` would be the wrong statistic altogether — one 90-minute outlier drags a mean but not a median. One sort per courier, O(n log n).",
  },
  {
    id: 'sql-carry-last-reading-forward',
    number: 136,
    title: 'Carry the Last Known Reading Forward',
    difficulty: 'Hard',
    topic: 'Window Functions',
    statement:
      "`tank_levels` has one row per tank per reading time: `tank`, `read_at` (`YYYY-MM-DD HH:MM`) and `litres`, which is NULL when the sensor failed to report. Several failures can occur in a row, and levels go down as well as up.\n\nFill the holes for a chart: return `tank`, `read_at` and `litres`, where a NULL reading is replaced by the most recent earlier non-NULL reading **of the same tank**. If the tank has no earlier non-NULL reading, leave it NULL. Rows ordered by `tank` ascending, then `read_at` ascending.",
    schema: `CREATE TABLE tank_levels (
  tank TEXT NOT NULL,
  read_at TEXT NOT NULL,
  litres INTEGER,
  PRIMARY KEY (tank, read_at)
);`,
    datasets: [
      `INSERT INTO tank_levels VALUES
  ('T1', '2024-08-01 08:00', 500),
  ('T1', '2024-08-01 09:00', NULL),
  ('T1', '2024-08-01 10:00', NULL),
  ('T1', '2024-08-01 11:00', 470),
  ('T1', '2024-08-01 12:00', NULL),
  ('T1', '2024-08-01 13:00', 455),
  ('T2', '2024-08-01 08:00', NULL),
  ('T2', '2024-08-01 09:00', 900),
  ('T2', '2024-08-01 10:00', NULL);`,
      `INSERT INTO tank_levels VALUES
  ('A', '2024-02-10 06:00', 10),
  ('A', '2024-02-10 07:00', 80),
  ('A', '2024-02-10 08:00', NULL),
  ('A', '2024-02-10 09:00', 30),
  ('A', '2024-02-10 10:00', NULL),
  ('A', '2024-02-10 11:00', NULL),
  ('A', '2024-02-10 12:00', NULL),
  ('B', '2024-02-10 06:30', NULL),
  ('B', '2024-02-10 07:30', NULL),
  ('B', '2024-02-10 08:30', 0),
  ('B', '2024-02-10 09:30', NULL);`,
      `INSERT INTO tank_levels VALUES
  ('N', '2024-05-05 00:00', NULL),
  ('N', '2024-05-05 01:00', NULL),
  ('P', '2024-05-05 01:00', 7),
  ('P', '2024-05-05 00:00', 9),
  ('P', '2024-05-05 02:00', NULL),
  ('Q', '2024-05-05 00:30', 42);`,
    ],
    ordered: true,
    solution: `WITH grouped AS (
  SELECT tank, read_at, litres,
         COUNT(litres) OVER (PARTITION BY tank ORDER BY read_at) AS grp
  FROM tank_levels
)
SELECT tank,
       read_at,
       MAX(litres) OVER (PARTITION BY tank, grp) AS litres
FROM grouped
ORDER BY tank, read_at;`,
    hint: 'LAG only reaches back a fixed number of rows. Try a running COUNT of the non-NULL readings: what do a real reading and the failed readings right after it have in common?',
    explanation:
      "`COALESCE(litres, LAG(litres) OVER …)` fixes a single missing reading but not two in a row, because the previous row is itself NULL; SQLite has no `IGNORE NULLS` option to skip them. The standard trick is to turn the problem into grouping. `COUNT(litres)` counts only non-NULL values, so as a running count ordered by time it increases by one at every real reading and stays flat across the failures that follow it. Each real reading and its trailing run of NULLs therefore share one `grp` number, and the group contains exactly one non-NULL value. `MAX(litres) OVER (PARTITION BY tank, grp)` spreads that value across the group (`MAX` here is only a way to pick the single non-NULL value; `MIN` would do the same). Leading failures fall in group 0, which has no value at all, so they stay NULL as required. A running `MAX` over all earlier rows would be wrong because levels fall as well as rise. Two window passes, O(n log n); the correlated-subquery alternative (`ORDER BY read_at DESC LIMIT 1` per row) is O(n²) without an index.",
  },

  // ===== Strings & Dates =====
  {
    id: 'sql-takings-by-weekday',
    number: 137,
    title: 'Takings by Day of the Week',
    difficulty: 'Easy',
    topic: 'Strings & Dates',
    statement:
      "A market stall records `sales` with `id`, `sold_on` (`YYYY-MM-DD`) and `amount_cents`. The table covers many weeks.\n\nSummarise trade by day of the week: return `weekday` (the full English name: `Monday`, `Tuesday`, … `Sunday`), `sales` (number of sales made on that weekday, over all weeks) and `total_cents`. Weekdays with no sales do not appear. Rows ordered by weekday with **Monday first and Sunday last**.",
    schema: `CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  sold_on TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO sales VALUES
  (1, '2024-07-01', 1200),
  (2, '2024-07-01', 800),
  (3, '2024-07-03', 450),
  (4, '2024-07-06', 3000),
  (5, '2024-07-07', 2500),
  (6, '2024-07-08', 700),
  (7, '2024-07-14', 1500),
  (8, '2024-07-13', 900);`,
      `INSERT INTO sales VALUES
  (1, '2024-07-07', 100),
  (2, '2024-07-13', 200),
  (3, '2024-07-09', 300),
  (4, '2024-07-16', 400);`,
      `INSERT INTO sales VALUES
  (1, '2024-12-30', 10),
  (2, '2024-12-31', 20),
  (3, '2025-01-01', 30),
  (4, '2025-01-02', 40),
  (5, '2025-01-03', 50),
  (6, '2025-01-04', 60),
  (7, '2025-01-05', 70),
  (8, '2025-01-06', 80),
  (9, '2024-02-29', 90);`,
    ],
    ordered: true,
    solution: `WITH d AS (
  SELECT CAST(strftime('%w', sold_on) AS INTEGER) AS w, amount_cents
  FROM sales
)
SELECT CASE w
         WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday'
         WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday'
         ELSE 'Saturday'
       END AS weekday,
       COUNT(*) AS sales,
       SUM(amount_cents) AS total_cents
FROM d
GROUP BY w
ORDER BY (w + 6) % 7;`,
    hint: "strftime('%w', date) returns the day of the week as a digit, and its numbering starts on Sunday. Group by that, then sort by a shifted version of it.",
    explanation:
      "SQLite has no day-name function, but `strftime('%w', sold_on)` returns the weekday as `'0'` (Sunday) through `'6'` (Saturday). Group by that number — not by the date, which would give one row per calendar day instead of one per weekday — and translate it to a name with `CASE`. Two details are easy to miss. `strftime` returns *text*, so compare against `'0'`, `'1'` … or cast it once to an integer as here. And the requested order is neither the natural one (`%w` puts Sunday first) nor alphabetical (Friday, Monday, Saturday …): shift the number with `(w + 6) % 7`, which maps Monday to 0 and Sunday to 6, and sort by that. In PostgreSQL the same job is `EXTRACT(ISODOW FROM d)` (Monday = 1) and `to_char(d, 'FMDay')`. One pass plus a sort of at most seven groups.",
  },
  {
    id: 'sql-days-left-in-signup-month',
    number: 138,
    title: 'Days Left in the Signup Month',
    difficulty: 'Easy',
    topic: 'Strings & Dates',
    statement:
      "A gym bills the first partial month by the day. `memberships` has `id` and `started_on` (`YYYY-MM-DD`).\n\nReturn `id`, `started_on`, `month_end` — the last calendar day of the month the membership started in, as `YYYY-MM-DD` — and `days_left`, the number of days from `started_on` to `month_end` **counting both** (a membership that starts on the last day of a month has 1 day left). Months have their real lengths, leap years included. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE memberships (
  id INTEGER PRIMARY KEY,
  started_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO memberships VALUES
  (1, '2024-01-15'),
  (2, '2024-02-10'),
  (3, '2023-02-10'),
  (4, '2024-04-30'),
  (5, '2024-12-01');`,
      `INSERT INTO memberships VALUES
  (1, '2024-01-31'),
  (2, '2023-12-31'),
  (3, '2024-06-01'),
  (4, '2024-08-30'),
  (5, '2024-03-31');`,
      `INSERT INTO memberships VALUES
  (1, '2024-02-29'),
  (2, '2025-02-01'),
  (3, '2024-09-18'),
  (4, '2024-11-30'),
  (5, '2024-10-29');`,
    ],
    ordered: true,
    solution: `SELECT id,
       started_on,
       date(started_on, 'start of month', '+1 month', '-1 day') AS month_end,
       CAST(julianday(date(started_on, 'start of month', '+1 month', '-1 day'))
            - julianday(started_on) AS INTEGER) + 1 AS days_left
FROM memberships
ORDER BY id;`,
    hint: "Date modifiers are applied left to right. Get to the first day of the month, then to the first day of the next month, then step back one day.",
    explanation:
      "Month lengths are irregular, so never hard-code 30 or 31. The reliable recipe is: go to the first of the month, add one month, subtract one day. In SQLite that is `date(started_on, 'start of month', '+1 month', '-1 day')`; the modifiers run left to right. The order matters: adding a month *first* breaks on long months, because `'2024-01-31' + 1 month` is the non-existent 31 February, which SQLite normalises to 2 March. Starting from day 1 avoids that, and leap years come for free. For the day count, convert both dates with `julianday()` and subtract; the difference between the 15th and the 31st is 16, but both ends are billed, so add 1. In PostgreSQL the same idea is `date_trunc('month', d) + interval '1 month' - interval '1 day'`. A single pass over the table.",
  },
  {
    id: 'sql-tickets-per-monday-week',
    number: 139,
    title: 'Support Tickets per Week, Monday Start',
    difficulty: 'Medium',
    topic: 'Strings & Dates',
    statement:
      "`tickets` has `id` and `opened_on` (`YYYY-MM-DD`). The support team plans in weeks that run **Monday to Sunday**.\n\nReturn `week_start` — the date of the Monday on or before `opened_on`, as `YYYY-MM-DD` — and `tickets`, the number of tickets opened in that week. A week that spans two months or two years is still one week. Weeks with no tickets do not appear. Rows ordered by `week_start` ascending.",
    schema: `CREATE TABLE tickets (
  id INTEGER PRIMARY KEY,
  opened_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO tickets VALUES
  (1, '2024-09-02'),
  (2, '2024-09-03'),
  (3, '2024-09-08'),
  (4, '2024-09-09'),
  (5, '2024-09-14'),
  (6, '2024-09-15'),
  (7, '2024-09-23');`,
      `INSERT INTO tickets VALUES
  (1, '2024-12-29'),
  (2, '2024-12-30'),
  (3, '2025-01-01'),
  (4, '2025-01-05'),
  (5, '2025-01-06'),
  (6, '2024-12-23');`,
      `INSERT INTO tickets VALUES
  (1, '2024-02-26'),
  (2, '2024-02-27'),
  (3, '2024-02-28'),
  (4, '2024-02-29'),
  (5, '2024-03-01'),
  (6, '2024-03-02'),
  (7, '2024-03-03'),
  (8, '2024-03-04');`,
    ],
    ordered: true,
    solution: `SELECT date(opened_on, '-' || ((strftime('%w', opened_on) + 6) % 7) || ' days') AS week_start,
       COUNT(*) AS tickets
FROM tickets
GROUP BY week_start
ORDER BY week_start;`,
    hint: "How many days must you step back from a date to land on its Monday? strftime('%w') says 0 for Sunday and 1 for Monday, so Sunday needs special thought.",
    explanation:
      "Bucketing by week means mapping every date to one representative day, here its Monday, and grouping by that. `strftime('%w', d)` gives 0 for Sunday through 6 for Saturday. The distance back to Monday is 0 for Monday, 1 for Tuesday … and 6 for Sunday, which is `(w + 6) % 7`. Subtract that many days: `date(d, '-N days')`. Using `w` itself would step back to Sunday (a Sunday-to-Saturday week) and put every Sunday in the wrong bucket. The `'weekday 1'` modifier is another trap: it moves *forward* to the next Monday (and leaves a Monday unchanged), so `date(d, 'weekday 1', '-7 days')` is right for six days of the week and a week early for Mondays; `date(d, 'weekday 0', '-6 days')` (forward to Sunday, back six) does work. Grouping on the real Monday date, rather than on a week number such as `strftime('%W')`, also keeps a week that straddles New Year in one piece. Other engines: `date_trunc('week', d)` in PostgreSQL. One pass, O(n log n) for the grouping.",
  },

  // ===== Analytics =====
  {
    id: 'sql-same-month-last-year',
    number: 140,
    title: 'Revenue Against the Same Month Last Year',
    difficulty: 'Medium',
    topic: 'Analytics',
    statement:
      "`monthly_revenue` has one row per month that had revenue: `month` (`YYYY-MM`, unique) and `revenue_cents` (always positive). A month without revenue has **no row**, so the months are not contiguous.\n\nFor every month of the **latest year present in the table**, return `month`, `revenue_cents`, `last_year_cents` — the revenue of the same calendar month one year earlier, or NULL when that month has no row — and `yoy_pct`, the percentage change from last year to this year rounded to 1 decimal place (NULL when `last_year_cents` is NULL). Rows ordered by `month` ascending.",
    schema: `CREATE TABLE monthly_revenue (
  month TEXT PRIMARY KEY,
  revenue_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO monthly_revenue VALUES
  ('2022-06', 40000),
  ('2023-01', 100000),
  ('2023-02', 80000),
  ('2023-03', 120000),
  ('2023-05', 50000),
  ('2023-06', 90000),
  ('2024-01', 110000),
  ('2024-02', 60000),
  ('2024-03', 120000),
  ('2024-04', 70000),
  ('2024-06', 99000);`,
      `INSERT INTO monthly_revenue VALUES
  ('2024-03', 5000),
  ('2024-07', 7000);`,
      `INSERT INTO monthly_revenue VALUES
  ('2023-10', 10000),
  ('2023-11', 10000),
  ('2024-01', 30000),
  ('2024-11', 40000),
  ('2024-12', 64000),
  ('2025-01', 33000),
  ('2025-10', 30000),
  ('2025-11', 46000),
  ('2025-12', 56000);`,
    ],
    ordered: true,
    solution: `SELECT cur.month,
       cur.revenue_cents,
       prev.revenue_cents AS last_year_cents,
       ROUND(100.0 * (cur.revenue_cents - prev.revenue_cents) / prev.revenue_cents, 1) AS yoy_pct
FROM monthly_revenue cur
LEFT JOIN monthly_revenue prev
  ON prev.month = (CAST(substr(cur.month, 1, 4) AS INTEGER) - 1) || substr(cur.month, 5)
WHERE substr(cur.month, 1, 4) = (SELECT substr(MAX(month), 1, 4) FROM monthly_revenue)
ORDER BY cur.month;`,
    hint: "LAG(revenue, 12) means 'twelve rows back', which is only 'twelve months back' when no month is missing. Match on the month's label instead.",
    explanation:
      "The reflex is `LAG(revenue_cents, 12) OVER (ORDER BY month)`. That counts *rows*, and this table skips months, so twelve rows back can be fourteen or twenty months back. Whenever the series has gaps, compare by key, not by position: self-join the table to itself on 'the same month label with the year reduced by one'. Here the label is built by string surgery — `substr(month, 1, 4)` is the year, `substr(month, 5)` is `-MM` — but `strftime('%Y-%m', month || '-01', '-1 year')` works equally well. Use a `LEFT JOIN` so a month with no counterpart keeps its row with NULLs; an inner join would quietly drop it. The percentage needs no special NULL handling, because arithmetic with NULL yields NULL, and `100.0` forces real division. The latest year comes from `MAX(month)`: ISO-style text sorts chronologically. With the primary key on `month` each lookup is O(log n).",
  },
  {
    id: 'sql-products-behind-80-percent',
    number: 141,
    title: 'Products Behind the First 80% of Revenue',
    difficulty: 'Medium',
    topic: 'Analytics',
    statement:
      "`sales` has `id`, `product` and `amount_cents` (always positive); a product has many sales.\n\nRank the products by total revenue, highest first, breaking ties by `product` ascending. Walk down that list adding up revenue and stop as soon as the products taken so far account for **at least 80%** of all revenue; the product that carries the running share to 80% or past it is the last one included.\n\nReturn `product`, `revenue` (the product's total) and `cumulative_pct` — the share of all revenue held by this product and every product ranked above it, as a percentage rounded to 1 decimal place. Rows ordered by `revenue` descending, then `product` ascending.",
    schema: `CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO sales VALUES
  (1, 'Anvil', 25000),
  (2, 'Bellows', 25000),
  (3, 'Anvil', 15000),
  (4, 'Chisel', 10000),
  (5, 'Clamp', 6000),
  (6, 'Clamp', 4000),
  (7, 'Drill', 8000),
  (8, 'Epoxy', 7000);`,
      `INSERT INTO sales VALUES
  (1, 'Kettle', 300),
  (2, 'Mug', 500),
  (3, 'Spoon', 200);`,
      `INSERT INTO sales VALUES
  (1, 'Tent', 9000),
  (2, 'Peg', 400),
  (3, 'Rope', 600);`,
      `INSERT INTO sales VALUES
  (1, 'Solo', 617),
  (2, 'Solo', 617);`,
      `INSERT INTO sales VALUES
  (1, 'Oak', 1000),
  (2, 'Ash', 1000),
  (3, 'Elm', 500),
  (4, 'Elm', 500),
  (5, 'Fir', 1),
  (6, 'Yew', 1);`,
    ],
    ordered: true,
    solution: `WITH totals AS (
  SELECT product, SUM(amount_cents) AS revenue
  FROM sales
  GROUP BY product
),
ranked AS (
  SELECT product, revenue,
         SUM(revenue) OVER (
           ORDER BY revenue DESC, product
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         ) AS running,
         SUM(revenue) OVER () AS grand
  FROM totals
)
SELECT product,
       revenue,
       ROUND(100.0 * running / grand, 1) AS cumulative_pct
FROM ranked
WHERE (running - revenue) * 5 < grand * 4
ORDER BY revenue DESC, product;`,
    hint: 'Aggregate per product first, then take a running total over the ranked products. A product is included when the products *before* it have not yet reached 80%.',
    explanation:
      "This is a Pareto (ABC) analysis and it stacks three ideas. (1) Collapse the sales to one row per product. (2) Over those rows compute a running total in rank order and the grand total — `SUM(revenue) OVER ()` with an empty window is the sum of everything. The running total needs a unique sort key and a `ROWS` frame: with `ORDER BY revenue DESC` alone, two products with equal revenue are peers and both would show the total that includes the pair. (3) Decide the cut-off. Filtering on `cumulative <= 80%` is the common mistake: it drops the very product that crosses the line, leaving you short of 80%. The product belongs in the list when the running total *before* it, `running - revenue`, is still below 80%. That comparison is done in integers (`x * 5 < grand * 4` is `x / grand < 0.8`) so that an exact 80% is not at the mercy of floating-point rounding; only the displayed percentage is rounded. Cost: one aggregation and one sort, O(n log n).",
  },
  {
    id: 'sql-monthly-retention-triangle',
    number: 142,
    title: 'Monthly Retention Triangle',
    difficulty: 'Hard',
    topic: 'Analytics',
    statement:
      "`purchases` has `id`, `buyer_id` and `bought_on` (`YYYY-MM-DD`). A buyer's *cohort* is the calendar month of their first purchase, written `YYYY-MM`.\n\nBuild the retention triangle: for each cohort and each `months_since` — the number of **calendar months** between the cohort month and the month of a purchase (0 for the cohort month itself; a first purchase on 31 December and another on 1 January are 1 month apart; December to the next December is 12) — count the distinct buyers of that cohort who bought in that month.\n\nReturn `cohort_month`, `months_since` and `buyers`. Combinations in which nobody bought do not appear. Rows ordered by `cohort_month` ascending, then `months_since` ascending.",
    schema: `CREATE TABLE purchases (
  id INTEGER PRIMARY KEY,
  buyer_id INTEGER NOT NULL,
  bought_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO purchases VALUES
  (1, 1, '2023-11-05'),
  (2, 1, '2023-11-20'),
  (3, 1, '2023-12-01'),
  (4, 1, '2024-01-15'),
  (5, 2, '2023-11-30'),
  (6, 2, '2024-01-02'),
  (7, 3, '2023-12-10'),
  (8, 3, '2023-12-11'),
  (9, 3, '2024-02-01'),
  (10, 4, '2023-12-31'),
  (11, 4, '2024-01-01'),
  (12, 5, '2024-01-20');`,
      `INSERT INTO purchases VALUES
  (1, 1, '2025-01-10'),
  (2, 1, '2024-01-01'),
  (3, 1, '2023-12-31'),
  (4, 2, '2023-12-01'),
  (5, 2, '2023-12-15'),
  (6, 3, '2024-03-31'),
  (7, 3, '2024-02-29'),
  (8, 3, '2024-03-01');`,
      `INSERT INTO purchases VALUES
  (1, 7, '2024-05-02'),
  (2, 8, '2024-05-30'),
  (3, 9, '2024-05-15'),
  (4, 7, '2024-06-01'),
  (5, 8, '2024-06-29'),
  (6, 7, '2024-06-30'),
  (7, 9, '2024-08-15'),
  (8, 8, '2024-08-01'),
  (9, 7, '2024-08-31'),
  (10, 10, '2024-08-09');`,
    ],
    ordered: true,
    solution: `WITH firsts AS (
  SELECT buyer_id, MIN(bought_on) AS first_on
  FROM purchases
  GROUP BY buyer_id
)
SELECT strftime('%Y-%m', f.first_on) AS cohort_month,
       (CAST(strftime('%Y', p.bought_on) AS INTEGER) - CAST(strftime('%Y', f.first_on) AS INTEGER)) * 12
         + CAST(strftime('%m', p.bought_on) AS INTEGER) - CAST(strftime('%m', f.first_on) AS INTEGER) AS months_since,
       COUNT(DISTINCT p.buyer_id) AS buyers
FROM purchases p
JOIN firsts f ON f.buyer_id = p.buyer_id
GROUP BY cohort_month, months_since
ORDER BY cohort_month, months_since;`,
    hint: "Find each buyer's first purchase date, join it back to all of their purchases, and turn the two dates into a month distance: years apart times 12, plus months apart.",
    explanation:
      "Cohort analysis is always the same three moves. (1) Define the cohort: `MIN(bought_on)` per buyer, truncated to the month. (2) Attach it to every activity row by joining purchases back to that per-buyer result. (3) Measure how far each activity is from the cohort start, group by (cohort, distance) and count people. The distance must be in calendar months: `(year difference) * 12 + (month difference)`. Subtracting only the month numbers breaks at New Year (January minus November is −10), and dividing a day count by 30 is wrong at both ends — 31 December to 1 January is one day yet one month apart, while the 1st and the 31st of a month are 30 days apart yet zero months. Finally, count `DISTINCT buyer_id`: a buyer with three purchases in a month is one retained buyer, and `COUNT(*)` would count purchases. The row for `months_since = 0` is the cohort size, the base you would divide by to turn counts into retention rates. One aggregation, one join, one grouping: O(n log n).",
  },

  // ===== Subqueries & CTEs (recursive) =====
  {
    id: 'sql-loan-repayment-schedule',
    number: 143,
    title: 'Repayment Schedule for Every Loan',
    difficulty: 'Medium',
    topic: 'Subqueries & CTEs',
    statement:
      "`loans` has `id`, `principal_cents`, `instalments` (how many monthly payments, at least 1) and `first_due_on` (`YYYY-MM-DD`; the day of the month is never above 28).\n\nGenerate one row per instalment. Instalment 1 is due on `first_due_on` and each later one exactly one calendar month after the previous (same day of the month). Every instalment is `principal_cents` divided by `instalments`, **rounded down** to a whole cent, except the last one, which is whatever is left so that the instalments add up to the principal exactly.\n\nReturn `loan_id`, `instalment_no` (1, 2, 3 …), `due_on` and `amount_cents`, ordered by `loan_id` ascending, then `instalment_no` ascending.",
    schema: `CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  principal_cents INTEGER NOT NULL,
  instalments INTEGER NOT NULL,
  first_due_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO loans VALUES
  (1, 100000, 3, '2024-11-15'),
  (2, 50000, 1, '2024-03-01'),
  (3, 90000, 4, '2024-01-28');`,
      `INSERT INTO loans VALUES
  (1, 1000, 7, '2024-10-05'),
  (2, 999, 2, '2024-12-28');`,
      `INSERT INTO loans VALUES
  (5, 120000, 12, '2024-02-01'),
  (6, 100, 3, '2023-01-28'),
  (7, 5, 1, '2024-06-20'),
  (8, 2, 3, '2024-06-20');`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE sched(loan_id, n, instalments, principal_cents, first_due_on) AS (
  SELECT id, 1, instalments, principal_cents, first_due_on
  FROM loans
  UNION ALL
  SELECT loan_id, n + 1, instalments, principal_cents, first_due_on
  FROM sched
  WHERE n < instalments
)
SELECT loan_id,
       n AS instalment_no,
       date(first_due_on, '+' || (n - 1) || ' months') AS due_on,
       CASE WHEN n < instalments
            THEN principal_cents / instalments
            ELSE principal_cents - (principal_cents / instalments) * (instalments - 1)
       END AS amount_cents
FROM sched
ORDER BY loan_id, n;`,
    hint: 'A recursive CTE can produce rows that do not exist yet: start with instalment 1 of every loan and keep adding the next one while the number is below the loan\'s count.',
    explanation:
      "The table has one row per loan but the answer needs one row per payment, so rows have to be *generated*. A recursive CTE does it: the anchor emits instalment 1 for every loan, and the recursive member re-reads the rows produced so far and emits `n + 1` while `n < instalments`, carrying the loan's columns along so no later join is needed. Each loan stops at its own count. The amounts are the classic penny-allocation problem: integer division (`principal_cents / instalments` on two integers truncates in SQLite) gives the regular payment, and the last payment is the principal minus the regular payments already scheduled, so the total is exact. Rounding each payment independently, or dividing as a real number, loses or invents cents. Dates use `'+N months'` computed from the *first* due date rather than `'+30 days'`, which drifts off the day of the month immediately; the day-of-month cap of 28 guarantees every month has that day. The CTE produces exactly one row per output row: O(total instalments).",
  },
  {
    id: 'sql-beds-occupied-each-night',
    number: 144,
    title: 'Beds Occupied Each Night',
    difficulty: 'Medium',
    topic: 'Subqueries & CTEs',
    statement:
      "A ward keeps `stays` with `id`, `admitted_on` and `discharged_on` (`YYYY-MM-DD`; `discharged_on` is NULL while the patient is still on the ward, otherwise it is on or after `admitted_on`). A patient occupies a bed on the night of every date from `admitted_on` up to but **not including** `discharged_on`; a patient admitted and discharged on the same day occupies no night, and one who is still on the ward occupies every night from admission onwards.\n\n`report_range` has exactly one row with `first_night` and `last_night` (`first_night` <= `last_night`).\n\nReturn `night` and `occupied` (the number of occupied beds) for **every** date from `first_night` to `last_night` inclusive, including nights with 0. Rows ordered by `night` ascending.",
    schema: `CREATE TABLE stays (
  id INTEGER PRIMARY KEY,
  admitted_on TEXT NOT NULL,
  discharged_on TEXT
);
CREATE TABLE report_range (
  first_night TEXT NOT NULL,
  last_night TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO report_range VALUES ('2024-03-01', '2024-03-07');
INSERT INTO stays VALUES
  (1, '2024-02-27', '2024-03-02'),
  (2, '2024-03-01', '2024-03-01'),
  (3, '2024-03-02', '2024-03-05'),
  (4, '2024-03-06', NULL),
  (5, '2024-03-08', '2024-03-10'),
  (6, '2024-03-02', '2024-03-04');`,
      `INSERT INTO report_range VALUES ('2024-02-27', '2024-03-02');
INSERT INTO stays VALUES
  (1, '2024-02-20', '2024-02-28'),
  (2, '2024-02-28', '2024-03-01'),
  (3, '2024-02-29', NULL),
  (4, '2024-02-29', '2024-02-29'),
  (5, '2024-03-02', '2024-03-09');`,
      `INSERT INTO report_range VALUES ('2024-07-04', '2024-07-04');
INSERT INTO stays VALUES
  (1, '2024-07-04', '2024-07-04'),
  (2, '2024-07-05', NULL),
  (3, '2024-06-30', '2024-07-04');`,
      `INSERT INTO report_range VALUES ('2024-12-30', '2025-01-02');
INSERT INTO stays VALUES
  (1, '2024-12-01', NULL),
  (2, '2024-12-31', '2025-01-01'),
  (3, '2024-12-31', '2025-01-02'),
  (4, '2025-01-02', '2025-01-03');`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE nights(night) AS (
  SELECT first_night FROM report_range
  UNION ALL
  SELECT date(night, '+1 day')
  FROM nights
  WHERE night < (SELECT last_night FROM report_range)
)
SELECT n.night,
       COUNT(s.id) AS occupied
FROM nights n
LEFT JOIN stays s
  ON s.admitted_on <= n.night
 AND (s.discharged_on IS NULL OR s.discharged_on > n.night)
GROUP BY n.night
ORDER BY n.night;`,
    hint: 'First build the list of nights with a recursive CTE, then LEFT JOIN the stays that cover each night. Write the "covers" test carefully for the discharge day and for NULL.',
    explanation:
      "The output has a row for every night, including nights no stay mentions, so the dates cannot come from `stays`: generate them. The recursive CTE starts at `first_night` and adds a day while it is before `last_night`. Then join each night to the stays that cover it. Three decisions make or break the count. The interval is half-open — `admitted_on <= night` and `night < discharged_on` — so the discharge day is free for the next patient and a same-day discharge covers nothing; `>=` on the discharge side double-counts every handover. An open stay has NULL `discharged_on`, and `NULL > night` is NULL, never true, so it must be allowed explicitly with `IS NULL OR`. And the join must be a `LEFT JOIN` with `COUNT(s.id)`: an inner join deletes the empty nights, while `COUNT(*)` would report 1 for them because it counts the NULL-extended row. This is a calendar-times-intervals join, O(nights × stays), which is fine for a report range; for long ranges a +1/−1 event sweep with a running sum does the same in O(n log n).",
  },

  // ===== Sessions & Events =====
  {
    id: 'sql-pair-badge-in-with-out',
    number: 145,
    title: 'Match Each Badge-In With Its Badge-Out',
    difficulty: 'Medium',
    topic: 'Sessions & Events',
    statement:
      "A door reader logs `badge_events` with `id`, `worker_id`, `kind` (`'in'` or `'out'`) and `scanned_at` (`YYYY-MM-DD HH:MM:SS`, always on a whole minute; unique per worker). People forget to badge, so the log is messy.\n\nLook at each worker's events in time order. A badge-in is *closed* only when that worker's **very next event** is an `'out'`; if the next event is another `'in'`, or there is no next event, that badge-in stays open. An `'out'` that does not directly follow an `'in'` is ignored.\n\nReturn one row per badge-in: `worker_id`, `in_at`, `out_at` and `minutes` (whole minutes between the two). `out_at` and `minutes` are NULL for an open badge-in. Rows ordered by `worker_id` ascending, then `in_at` ascending.",
    schema: `CREATE TABLE badge_events (
  id INTEGER PRIMARY KEY,
  worker_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  scanned_at TEXT NOT NULL,
  UNIQUE (worker_id, scanned_at)
);`,
    datasets: [
      `INSERT INTO badge_events VALUES
  (1, 1, 'in', '2024-10-07 08:00:00'),
  (2, 2, 'out', '2024-10-07 07:00:00'),
  (3, 2, 'in', '2024-10-07 09:00:00'),
  (4, 2, 'out', '2024-10-07 09:30:00'),
  (5, 2, 'out', '2024-10-07 09:45:00'),
  (6, 2, 'in', '2024-10-07 10:00:00'),
  (7, 1, 'out', '2024-10-07 12:00:00'),
  (8, 1, 'in', '2024-10-07 13:00:00'),
  (9, 1, 'in', '2024-10-07 13:05:00'),
  (10, 1, 'out', '2024-10-07 17:00:00');`,
      `INSERT INTO badge_events VALUES
  (1, 5, 'out', '2024-10-09 06:00:00'),
  (2, 5, 'in', '2024-10-08 22:00:00'),
  (3, 6, 'in', '2024-10-08 08:00:00'),
  (4, 6, 'in', '2024-10-08 08:30:00'),
  (5, 6, 'in', '2024-10-08 09:00:00'),
  (6, 6, 'out', '2024-10-08 09:10:00'),
  (7, 7, 'out', '2024-10-08 12:00:00');`,
      `INSERT INTO badge_events VALUES
  (1, 1, 'in', '2024-02-28 23:30:00'),
  (2, 1, 'out', '2024-03-01 00:30:00'),
  (3, 1, 'in', '2024-03-01 09:00:00'),
  (4, 1, 'out', '2024-03-01 09:01:00'),
  (5, 2, 'in', '2024-03-01 09:00:00'),
  (6, 2, 'out', '2024-03-01 09:01:00'),
  (7, 2, 'out', '2024-03-01 09:02:00');`,
    ],
    ordered: true,
    solution: `WITH seq AS (
  SELECT worker_id, kind, scanned_at,
         LEAD(kind) OVER w AS next_kind,
         LEAD(scanned_at) OVER w AS next_at
  FROM badge_events
  WINDOW w AS (PARTITION BY worker_id ORDER BY scanned_at)
)
SELECT worker_id,
       scanned_at AS in_at,
       CASE WHEN next_kind = 'out' THEN next_at END AS out_at,
       CASE WHEN next_kind = 'out'
            THEN (strftime('%s', next_at) - strftime('%s', scanned_at)) / 60
       END AS minutes
FROM seq
WHERE kind = 'in'
ORDER BY worker_id, scanned_at;`,
    hint: 'Put the next event of the same worker beside each row — both its kind and its time — before you throw the out rows away.',
    explanation:
      "Pairing start and end events is a neighbour problem. `LEAD(kind)` and `LEAD(scanned_at)` over `(PARTITION BY worker_id ORDER BY scanned_at)` attach the following event to every row; then keep the `'in'` rows and accept the neighbour only when it is an `'out'`. The order of operations matters: compute `LEAD` over *all* events and filter afterwards. If you filter to the ins first, the outs are gone before the window sees them. The popular alternative — a correlated subquery for the earliest `'out'` after each `'in'` — gives wrong pairs on messy data: when someone badges in twice, the first in gets paired with an out that belongs to the second, producing overlapping shifts. Taking `LEAD(scanned_at)` without checking its kind is wrong the other way round: it reports the next badge-in as the badge-out. Durations come from `strftime('%s', …)`, seconds since 1970, so shifts that cross midnight or a month end need no special handling. `next_kind = 'out'` is NULL at the end of the log and `CASE` then yields NULL, exactly the open-shift behaviour required. One sorted pass.",
  },
  {
    id: 'sql-outage-windows',
    number: 146,
    title: 'Outage Windows From Health Checks',
    difficulty: 'Hard',
    topic: 'Sessions & Events',
    statement:
      "A monitor writes `health_checks` with `id`, `service`, `checked_at` (`YYYY-MM-DD HH:MM`; unique per service) and `status` (`'up'` or `'down'`). Ids are not in time order.\n\nAn *outage* is a maximal run of consecutive `'down'` checks of one service in time order — consecutive meaning no `'up'` check of that service lies between them. For every outage return `service`, `first_down_at`, `last_down_at` (the times of the first and last `'down'` check of the run), `checks` (how many `'down'` checks are in the run) and `recovered_at` — the time of the `'up'` check that ended the run, or NULL when the service is still down at its last check.\n\nRows ordered by `service` ascending, then `first_down_at` ascending.",
    schema: `CREATE TABLE health_checks (
  id INTEGER PRIMARY KEY,
  service TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  status TEXT NOT NULL,
  UNIQUE (service, checked_at)
);`,
    datasets: [
      `INSERT INTO health_checks VALUES
  (1, 'api', '2024-11-01 10:00', 'up'),
  (2, 'api', '2024-11-01 10:05', 'down'),
  (3, 'api', '2024-11-01 10:10', 'down'),
  (4, 'api', '2024-11-01 10:15', 'up'),
  (5, 'api', '2024-11-01 10:20', 'down'),
  (6, 'api', '2024-11-01 10:25', 'up'),
  (7, 'api', '2024-11-01 10:30', 'up'),
  (8, 'db', '2024-11-01 10:00', 'down'),
  (9, 'db', '2024-11-01 10:05', 'down'),
  (10, 'db', '2024-11-01 10:10', 'up'),
  (11, 'db', '2024-11-01 10:15', 'down'),
  (12, 'db', '2024-11-01 10:20', 'down'),
  (13, 'db', '2024-11-01 10:25', 'down');`,
      `INSERT INTO health_checks VALUES
  (5, 'mail', '2024-11-02 00:00', 'down'),
  (1, 'mail', '2024-11-02 00:10', 'up'),
  (4, 'mail', '2024-11-02 00:20', 'down'),
  (2, 'mail', '2024-11-02 00:30', 'down'),
  (3, 'mail', '2024-11-02 00:40', 'up'),
  (6, 'cdn', '2024-11-02 00:00', 'up'),
  (7, 'cdn', '2024-11-02 00:10', 'up'),
  (8, 'auth', '2024-11-02 00:05', 'down'),
  (9, 'auth', '2024-11-02 00:15', 'down'),
  (10, 'auth', '2024-11-02 00:25', 'down');`,
      `INSERT INTO health_checks VALUES
  (1, 'a', '2024-12-31 23:50', 'down'),
  (2, 'b', '2024-12-31 23:55', 'up'),
  (3, 'a', '2025-01-01 00:00', 'down'),
  (4, 'b', '2025-01-01 00:05', 'down'),
  (5, 'a', '2025-01-01 00:10', 'up'),
  (6, 'b', '2025-01-01 00:15', 'up'),
  (7, 'a', '2025-01-01 00:20', 'down'),
  (8, 'c', '2025-01-01 00:20', 'down');`,
    ],
    ordered: true,
    solution: `WITH marked AS (
  SELECT service, checked_at, status,
         SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) OVER (
           PARTITION BY service ORDER BY checked_at
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         ) AS ups_so_far,
         LEAD(status) OVER (PARTITION BY service ORDER BY checked_at) AS next_status,
         LEAD(checked_at) OVER (PARTITION BY service ORDER BY checked_at) AS next_at
  FROM health_checks
)
SELECT service,
       MIN(checked_at) AS first_down_at,
       MAX(checked_at) AS last_down_at,
       COUNT(*) AS checks,
       MAX(CASE WHEN next_status = 'up' THEN next_at END) AS recovered_at
FROM marked
WHERE status = 'down'
GROUP BY service, ups_so_far
ORDER BY service, first_down_at;`,
    hint: "Give every row a running count of the 'up' checks seen so far for its service. What do all the 'down' rows of one outage have in common?",
    explanation:
      "This is gaps-and-islands on a status column: the islands are runs of `'down'`, and the task is to find a value that is constant inside a run and different between runs, then `GROUP BY` it. A running count of the `'up'` checks does that — it does not move while the service stays down and it increases by one at every `'up'`, so two outages separated by any `'up'` get different numbers. (The other standard key is the difference of two `ROW_NUMBER`s, one over all checks and one over the down checks only.) After keeping the `'down'` rows and grouping by `(service, ups_so_far)`, `MIN`, `MAX` and `COUNT` describe the run. The recovery time is read from the row that follows: `LEAD` is computed before the filter, so the last down row of a run sees the `'up'` after it, and `MAX(CASE WHEN next_status = 'up' …)` picks it out — or stays NULL if the log ends while the service is down. Everything is partitioned by service, because checks of different services are interleaved in time, and ordered by the timestamp, since ids are not chronological. One sort per service, O(n log n).",
  },

  // ===== Advanced =====
  {
    id: 'sql-live-settings-after-deletes',
    number: 147,
    title: 'Live Settings After Deletes',
    difficulty: 'Medium',
    topic: 'Advanced',
    statement:
      "A config service is append-only: `setting_log` has `id`, `name`, `op` (`'set'` or `'delete'`), `value` (NULL for a delete) and `changed_at` (`YYYY-MM-DD HH:MM:SS`). Rows were back-filled, so ids do not follow time order.\n\nThe entry that counts for a setting is its latest one by `changed_at`; when several entries of a setting share that latest timestamp, the one with the **highest** `id` wins. A setting is *live* when the entry that counts is a `'set'`.\n\nReturn `name` and `value` for every live setting, ordered by `name` ascending.",
    schema: `CREATE TABLE setting_log (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  op TEXT NOT NULL,
  value TEXT,
  changed_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO setting_log VALUES
  (1, 'theme', 'set', 'dark', '2024-05-01 10:00:00'),
  (2, 'theme', 'set', 'light', '2024-05-02 10:00:00'),
  (3, 'locale', 'set', 'en-GB', '2024-05-01 11:00:00'),
  (4, 'locale', 'delete', NULL, '2024-05-03 09:00:00'),
  (5, 'beta', 'delete', NULL, '2024-05-01 08:00:00'),
  (6, 'beta', 'set', 'on', '2024-05-04 08:00:00'),
  (7, 'font', 'set', 'serif', '2024-05-05 12:00:00'),
  (8, 'font', 'set', 'mono', '2024-05-05 12:00:00'),
  (9, 'tz', 'set', 'UTC', '2024-05-06 12:00:00'),
  (10, 'tz', 'delete', NULL, '2024-05-06 12:00:00');`,
      `INSERT INTO setting_log VALUES
  (1, 'quota', 'set', '50', '2024-09-10 10:00:00'),
  (2, 'quota', 'set', '20', '2024-09-01 10:00:00'),
  (3, 'region', 'delete', NULL, '2024-09-05 10:00:00'),
  (4, 'region', 'set', 'eu', '2024-09-02 10:00:00'),
  (5, 'mode', 'set', 'fast', '2024-09-03 08:00:00'),
  (6, 'mode', 'set', 'safe', '2024-09-03 08:00:00'),
  (7, 'pager', 'delete', NULL, '2024-09-04 08:00:00'),
  (8, 'pager', 'set', 'on', '2024-09-04 08:00:00');`,
      `INSERT INTO setting_log VALUES
  (1, 'a', 'set', 'x', '2024-01-01 00:00:00'),
  (2, 'a', 'delete', NULL, '2024-01-02 00:00:00'),
  (3, 'a', 'set', 'x', '2024-01-03 00:00:00'),
  (4, 'b', 'delete', NULL, '2024-01-01 00:00:00'),
  (5, 'c', 'set', 'y', '2024-01-05 00:00:00'),
  (6, 'c', 'set', 'z', '2024-01-04 00:00:00'),
  (7, 'c', 'delete', NULL, '2024-01-03 00:00:00');`,
    ],
    ordered: true,
    solution: `WITH ranked AS (
  SELECT name, op, value,
         ROW_NUMBER() OVER (PARTITION BY name ORDER BY changed_at DESC, id DESC) AS rn
  FROM setting_log
)
SELECT name, value
FROM ranked
WHERE rn = 1 AND op = 'set'
ORDER BY name;`,
    hint: 'Pick the single latest entry per setting first, tie-break included, and only then ask whether it is a set or a delete. Doing those two steps in the other order gives a different answer.',
    explanation:
      "Replaying an append-only log means 'latest row per key wins', with one twist: a delete (a *tombstone*) is also a row, and if it is the latest it must hide every earlier value. So the order of the two filters is the whole problem. Rank all entries of a setting newest first — `ROW_NUMBER() OVER (PARTITION BY name ORDER BY changed_at DESC, id DESC)` — keep `rn = 1`, and *then* require `op = 'set'`. If you filter to the sets first and take the latest of those, deleted settings come back to life with their old value. The tie-break belongs inside the window's `ORDER BY`: joining on `MAX(changed_at)` returns two rows when two entries share the top timestamp, and a set and a delete in the same second would both survive. The `id` is only the tie-break, never the primary sort key, because back-filled rows have high ids and old timestamps. Without window functions the same logic is `NOT EXISTS (a later entry for the same name)`, with 'later' meaning a greater `(changed_at, id)` pair. One sort per setting, O(n log n).",
  },

  // ===== Hierarchies & Graphs =====
  {
    id: 'sql-raw-parts-per-assembly',
    number: 148,
    title: 'Raw Parts Needed to Build One Unit',
    difficulty: 'Hard',
    topic: 'Hierarchies & Graphs',
    statement:
      "A bill of materials is stored in `bom` with `parent`, `child` and `qty`: building one `parent` takes `qty` units of `child`. A child can itself be a parent (a sub-assembly), to any depth, and the same item can be used in several places. There are no cycles.\n\nA *finished product* is an item that appears as a parent but never as a child. A *raw part* appears as a child but never as a parent.\n\nFor every finished product return `product`, `part` and `total_qty` — how many units of that raw part are needed in total to build **one** unit of the product, multiplying quantities down each path and adding up all the paths that reach the part. Rows ordered by `product` ascending, then `part` ascending.",
    schema: `CREATE TABLE bom (
  parent TEXT NOT NULL,
  child TEXT NOT NULL,
  qty INTEGER NOT NULL,
  PRIMARY KEY (parent, child)
);`,
    datasets: [
      `INSERT INTO bom VALUES
  ('bike', 'frame', 1),
  ('bike', 'wheel', 2),
  ('bike', 'bolt', 4),
  ('frame', 'tube', 3),
  ('frame', 'bolt', 4),
  ('wheel', 'rim', 1),
  ('wheel', 'spoke', 32),
  ('wheel', 'bolt', 2),
  ('trike', 'wheel', 3),
  ('trike', 'seat', 1);`,
      `INSERT INTO bom VALUES
  ('drone', 'arm', 4),
  ('drone', 'body', 1),
  ('arm', 'motor', 1),
  ('arm', 'prop', 2),
  ('arm', 'screw', 3),
  ('motor', 'coil', 3),
  ('motor', 'magnet', 12),
  ('motor', 'screw', 2),
  ('body', 'board', 1),
  ('body', 'screw', 8);`,
      `INSERT INTO bom VALUES
  ('lamp', 'bulb', 1),
  ('lamp', 'shade', 1),
  ('lamp', 'foot', 3),
  ('desk', 'leg', 4),
  ('desk', 'top', 1),
  ('leg', 'foot', 1),
  ('leg', 'rod', 2);`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE walk(product, item, qty) AS (
  SELECT parent, child, qty
  FROM bom
  WHERE parent NOT IN (SELECT child FROM bom)
  UNION ALL
  SELECT w.product, b.child, w.qty * b.qty
  FROM walk w
  JOIN bom b ON b.parent = w.item
)
SELECT product,
       item AS part,
       SUM(qty) AS total_qty
FROM walk
WHERE item NOT IN (SELECT parent FROM bom)
GROUP BY product, item
ORDER BY product, item;`,
    hint: 'Walk down from each finished product with a recursive CTE, carrying the product name and the quantity multiplied so far. Should the recursion use UNION or UNION ALL?',
    explanation:
      "A bill-of-materials *explosion* is a recursive walk that carries two things down every path: where it started (the finished product) and the product of the quantities so far. The anchor is the first level under each finished product; the recursive member joins the current item to its children and multiplies, `w.qty * b.qty` — two wheels of thirty-two spokes each is sixty-four, not thirty-four. When the walk is done there is one row per *path*, so the final step keeps the rows whose item is a raw part and sums them per product and part. Two mistakes are worth knowing. Using `UNION` instead of `UNION ALL` in the recursion removes duplicate rows, and two different paths can legitimately produce the same (product, item, quantity) triple — four bolts directly on the bike and four via the frame — so `UNION` silently loses parts. And filtering to raw parts must happen *after* the recursion; sub-assemblies have to stay in the working set so the walk can pass through them. Cost is proportional to the number of root-to-leaf paths, fine for a real BOM, and termination is guaranteed because the structure has no cycles.",
  },
  {
    id: 'sql-fewest-flights-from-hub',
    number: 149,
    title: 'Fewest Flights From the Hub',
    difficulty: 'Hard',
    topic: 'Hierarchies & Graphs',
    statement:
      "`airports` has `code` (unique), `city` and `is_hub` (1 for exactly one airport, otherwise 0). `routes` has `origin` and `destination`: a direct flight **from** `origin` **to** `destination` only — the return flight exists only if it has its own row. Routes can form loops.\n\nFor every airport return `code` and `flights` — the smallest number of flights needed to get there starting at the hub. The hub itself is 0. An airport that cannot be reached from the hub gets NULL.\n\nRows ordered by `flights` ascending with the unreachable airports (NULL) last, then by `code` ascending.",
    schema: `CREATE TABLE airports (
  code TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  is_hub INTEGER NOT NULL
);
CREATE TABLE routes (
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  PRIMARY KEY (origin, destination)
);`,
    datasets: [
      `INSERT INTO airports VALUES
  ('LIS', 'Lisbon', 1),
  ('MAD', 'Madrid', 0),
  ('OPO', 'Porto', 0),
  ('PAR', 'Paris', 0),
  ('ROM', 'Rome', 0),
  ('BER', 'Berlin', 0),
  ('DUB', 'Dublin', 0),
  ('OSL', 'Oslo', 0),
  ('HEL', 'Helsinki', 0);
INSERT INTO routes VALUES
  ('LIS', 'MAD'),
  ('LIS', 'OPO'),
  ('LIS', 'DUB'),
  ('MAD', 'PAR'),
  ('MAD', 'ROM'),
  ('OPO', 'ROM'),
  ('PAR', 'BER'),
  ('PAR', 'DUB'),
  ('PAR', 'LIS'),
  ('ROM', 'BER'),
  ('OSL', 'LIS');`,
      `INSERT INTO airports VALUES
  ('NRT', 'Tokyo', 1),
  ('KIX', 'Osaka', 0),
  ('FUK', 'Fukuoka', 0),
  ('OKA', 'Naha', 0),
  ('CTS', 'Sapporo', 0),
  ('HND', 'Tokyo Haneda', 0);
INSERT INTO routes VALUES
  ('NRT', 'KIX'),
  ('KIX', 'FUK'),
  ('FUK', 'OKA'),
  ('OKA', 'CTS'),
  ('FUK', 'KIX'),
  ('CTS', 'NRT'),
  ('HND', 'CTS');`,
      `INSERT INTO airports VALUES
  ('GVA', 'Geneva', 0),
  ('ZRH', 'Zurich', 1),
  ('BSL', 'Basel', 0);
INSERT INTO routes VALUES
  ('GVA', 'ZRH'),
  ('GVA', 'BSL');`,
      `INSERT INTO airports VALUES
  ('A', 'Alpha', 0),
  ('B', 'Bravo', 0),
  ('C', 'Charlie', 1),
  ('D', 'Delta', 0),
  ('E', 'Echo', 0);
INSERT INTO routes VALUES
  ('C', 'A'),
  ('A', 'B'),
  ('B', 'D'),
  ('C', 'D'),
  ('D', 'C'),
  ('D', 'A'),
  ('E', 'E');`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE reach(code, hops) AS (
  SELECT code, 0 FROM airports WHERE is_hub = 1
  UNION
  SELECT r.destination, reach.hops + 1
  FROM reach
  JOIN routes r ON r.origin = reach.code
  WHERE reach.hops < (SELECT COUNT(*) FROM airports)
),
best AS (
  SELECT code, MIN(hops) AS flights
  FROM reach
  GROUP BY code
)
SELECT a.code, b.flights
FROM airports a
LEFT JOIN best b ON b.code = a.code
ORDER BY b.flights IS NULL, b.flights, a.code;`,
    hint: 'Expand outwards from the hub one flight at a time with a recursive CTE, recording the hop count. Loops mean the recursion needs something that makes it stop, and an airport may be reached at several different hop counts.',
    explanation:
      "Shortest hop count is breadth-first search, and a recursive CTE expands exactly one level per iteration: start with the hub at 0 hops, and repeatedly follow `routes` from the airports found so far, adding 1. On a tree that is all; on a graph with loops it never ends, because a loop keeps producing the same airports with ever larger hop counts. Two guards fix that. `UNION` (not `UNION ALL`) discards rows already produced, and a depth cap stops the growth: a shortest route never needs more flights than there are airports, so `hops < COUNT(*)` loses nothing. The CTE now holds each reachable airport once per hop count at which it can be reached; `MIN(hops)` per airport is the answer. Follow the edges in their stored direction only — joining on either endpoint treats one-way routes as two-way. Finally, `LEFT JOIN` from `airports` so unreachable ones appear with NULL, and sort with a leading `flights IS NULL` key, because SQLite would otherwise list the NULLs first. Work is bounded by (airports × routes) rows.",
  },
  {
    id: 'sql-closest-shared-manager',
    number: 150,
    title: 'Closest Shared Manager of Two Colleagues',
    difficulty: 'Hard',
    topic: 'Hierarchies & Graphs',
    statement:
      "`staff` has `id`, `name` and `manager_id` (NULL at the top; the company has several separate reporting trees). `pairs` has `id`, `a_id` and `b_id` — two different staff members who need someone to settle a dispute.\n\nA person's *chain* is the person themself, their manager, that manager's manager, and so on to the top. The arbiter for a pair is the person **lowest in the hierarchy who is in both chains**. So if one of the two is (directly or indirectly) the other's manager, that manager is the arbiter. If the two chains share nobody, there is no arbiter.\n\nReturn `pair_id` and `arbiter` (the arbiter's `name`, or NULL when there is none) for every pair, ordered by `pair_id` ascending.",
    schema: `CREATE TABLE staff (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER
);
CREATE TABLE pairs (
  id INTEGER PRIMARY KEY,
  a_id INTEGER NOT NULL,
  b_id INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO staff VALUES
  (1, 'Ada', NULL),
  (2, 'Ben', 1),
  (3, 'Cy', 1),
  (4, 'Dee', 2),
  (5, 'Eli', 2),
  (6, 'Fay', 4),
  (7, 'Gil', 3),
  (8, 'Hana', NULL),
  (9, 'Ian', 8);
INSERT INTO pairs VALUES
  (1, 6, 5),
  (2, 6, 7),
  (3, 4, 6),
  (4, 7, 9),
  (5, 5, 4),
  (6, 2, 3);`,
      `INSERT INTO staff VALUES
  (1, 'Root', NULL),
  (2, 'Two', 1),
  (3, 'Three', 2),
  (4, 'Four', 3),
  (5, 'Five', 4),
  (6, 'Six', 1);
INSERT INTO pairs VALUES
  (1, 5, 3),
  (2, 5, 6),
  (3, 1, 5),
  (4, 4, 5),
  (5, 6, 2);`,
      `INSERT INTO staff VALUES
  (10, 'Mona', NULL),
  (11, 'Nils', NULL),
  (12, 'Odile', 10),
  (13, 'Pavel', 11),
  (14, 'Quin', 12),
  (15, 'Rosa', 12);
INSERT INTO pairs VALUES
  (1, 14, 15),
  (2, 14, 13),
  (3, 10, 11),
  (4, 12, 14),
  (5, 15, 10);`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE chain(person, ancestor, dist) AS (
  SELECT id, id, 0 FROM staff
  UNION ALL
  SELECT c.person, s.manager_id, c.dist + 1
  FROM chain c
  JOIN staff s ON s.id = c.ancestor
  WHERE s.manager_id IS NOT NULL
),
shared AS (
  SELECT p.id AS pair_id, ca.ancestor,
         ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY ca.dist) AS rn
  FROM pairs p
  JOIN chain ca ON ca.person = p.a_id
  JOIN chain cb ON cb.person = p.b_id AND cb.ancestor = ca.ancestor
)
SELECT p.id AS pair_id,
       s.name AS arbiter
FROM pairs p
LEFT JOIN shared sh ON sh.pair_id = p.id AND sh.rn = 1
LEFT JOIN staff s ON s.id = sh.ancestor
ORDER BY p.id;`,
    hint: "Build every person's full chain with a recursive CTE, remembering how many steps up each entry is. The arbiter is in both chains; among the shared people, which one is nearest?",
    explanation:
      "This is the lowest-common-ancestor problem, and in SQL it is easiest to solve by materialising chains. The recursive CTE starts each person with themself at distance 0 and climbs one manager per step, producing a `(person, ancestor, dist)` row for every link — the *transitive closure* of the reporting lines. Joining A's chain to B's chain on the same `ancestor` leaves exactly the people in both chains. They all lie on one line from the arbiter up to the root, so the arbiter is the one nearest to A: order by `dist` and take the first. Three details: the chain must include the person at distance 0, otherwise a pair where one manages the other is pushed a level too high; ordering the wrong way round returns the head of the tree, who is shared by everybody and settles nothing; and the final query must `LEFT JOIN` from `pairs`, because two people in different trees share nobody and still need their row with NULL. The closure has one row per person per level above them — O(n × depth) — which is why real systems often store it as a closure table.",
  },
];
