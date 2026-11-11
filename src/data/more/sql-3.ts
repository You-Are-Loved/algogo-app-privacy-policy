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
];
