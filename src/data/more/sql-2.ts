import type { SqlProblem } from '../sqlProblems';

// SQL practice problems 101-125: filtering, NULL semantics, grouping, joins,
// set operations, string cleanup, data quality, ledgers and operational reports.

export const problems: SqlProblem[] = [
  // ===== Basics =====
  {
    id: 'sql-work-queue-undated-last',
    number: 101,
    title: 'Work Queue With Undated Tasks Last',
    difficulty: 'Easy',
    topic: 'Basics',
    statement:
      "`tasks` has `id`, `title`, `due_on` (`YYYY-MM-DD`, or NULL when nobody set a deadline), `priority` (an integer; a higher number is more urgent) and `done` (1 when finished, otherwise 0).\n\nBuild the team's work queue: return `id`, `title` and `due_on` of every task that is **not** done, ordered by `due_on` ascending with the undated tasks (NULL `due_on`) placed **after** all the dated ones. Tasks with the same `due_on` (or both undated) go by `priority` descending, then `id` ascending.",
    schema: `CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  due_on TEXT,
  priority INTEGER NOT NULL,
  done INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO tasks VALUES
  (1, 'Renew domain', '2024-05-10', 2, 0),
  (2, 'Archive old logs', NULL, 1, 0),
  (3, 'Patch login server', '2024-05-03', 3, 0),
  (4, 'Send invoices', '2024-05-10', 5, 0),
  (5, 'Order laptops', '2024-05-01', 1, 1),
  (6, 'Tidy the wiki', NULL, 4, 0),
  (7, 'Rotate API keys', '2024-05-10', 5, 0);`,
      `INSERT INTO tasks VALUES
  (1, 'Call supplier', NULL, 1, 0),
  (2, 'Draft roadmap', NULL, 3, 0),
  (3, 'Review budget', NULL, 3, 0),
  (4, 'Clean inbox', NULL, 2, 1);`,
      `INSERT INTO tasks VALUES
  (10, 'Ship beta', '2024-01-02', 1, 0),
  (11, 'Write changelog', '2024-01-01', 1, 0),
  (12, 'Fix checkout bug', '2024-01-02', 2, 0),
  (13, 'Update licence', '2024-01-01', 1, 0);`,
    ],
    ordered: true,
    solution: `SELECT id, title, due_on
FROM tasks
WHERE done = 0
ORDER BY due_on IS NULL, due_on, priority DESC, id;`,
    hint: 'SQLite sorts NULL before every value in ascending order. Sort first on an expression that is 0 for dated rows and 1 for undated ones.',
    explanation:
      "Where NULL lands in a sort is engine-specific: SQLite and MySQL put it first in ascending order, PostgreSQL and Oracle put it last, so a plain `ORDER BY due_on` shows the tasks nobody scheduled at the top of the queue. Make the placement explicit with a leading sort key: `due_on IS NULL` evaluates to 0 for dated rows and 1 for undated ones, so dated rows come first and the real `due_on` key orders them. (`ORDER BY due_on NULLS LAST` does the same in engines that support it.) The remaining keys are ordinary tie-breaks, each with its own direction: `priority DESC`, then `id`. The sort is one pass over the open tasks, O(n log n).",
  },
  {
    id: 'sql-flats-two-cities-in-budget',
    number: 102,
    title: 'Flats in Two Cities Within Budget',
    difficulty: 'Easy',
    topic: 'Basics',
    statement:
      "`flats` has `id`, `city`, `rent` (monthly, whole pounds) and `bedrooms`.\n\nA renter will live in either `'Leeds'` or `'York'` and can pay between 900 and 1400 a month, **both limits included**. Return `id`, `city` and `rent` of every flat that fits, ordered by `rent` ascending, then `id` ascending.",
    schema: `CREATE TABLE flats (
  id INTEGER PRIMARY KEY,
  city TEXT NOT NULL,
  rent INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO flats VALUES
  (1, 'Leeds', 850, 1),
  (2, 'Leeds', 900, 1),
  (3, 'York', 1400, 2),
  (4, 'York', 1450, 2),
  (5, 'Hull', 1000, 2),
  (6, 'Leeds', 1200, 2),
  (7, 'Leeds', 1900, 3),
  (8, 'York', 1200, 1);`,
      `INSERT INTO flats VALUES
  (1, 'York', 899, 1),
  (2, 'York', 1401, 1),
  (3, 'Leeds', 1000, 1),
  (4, 'Bath', 1000, 1);`,
      `INSERT INTO flats VALUES
  (1, 'Hull', 950, 1),
  (2, 'Leeds', 2000, 4),
  (3, 'York', 1100, 2),
  (4, 'York', 1100, 3),
  (5, 'Leeds', 1400, 2);`,
    ],
    ordered: true,
    solution: `SELECT id, city, rent
FROM flats
WHERE city IN ('Leeds', 'York')
  AND rent BETWEEN 900 AND 1400
ORDER BY rent, id;`,
    hint: 'AND binds tighter than OR. Either wrap the two city tests in parentheses or use IN.',
    explanation:
      "The filter is (city is Leeds or York) AND (rent in range). Written without parentheses, `city = 'Leeds' OR city = 'York' AND rent BETWEEN 900 AND 1400` is parsed as `city = 'Leeds' OR (city = 'York' AND ...)` because AND has higher precedence than OR, so every Leeds flat slips through regardless of rent. `IN ('Leeds', 'York')` avoids the problem entirely and reads better. `BETWEEN` is inclusive at both ends, which is exactly what the budget asks for; `rent > 900 AND rent < 1400` would drop the flats priced right on a limit. The second sort key `id` makes the order of equal rents deterministic.",
  },

  // ===== NULL & CASE =====
  {
    id: 'sql-parcels-not-on-customs-hold',
    number: 103,
    title: 'Parcels Not Held at Customs',
    difficulty: 'Easy',
    topic: 'NULL & CASE',
    statement:
      "`parcels` has `id`, `destination` and `hold_code`. `hold_code` is NULL when nothing is holding the parcel; otherwise it is a reason such as `'CUSTOMS'`, `'ADDRESS'` or `'PAYMENT'`.\n\nReturn `id`, `destination` and `hold_code` of every parcel that is **not** on a `'CUSTOMS'` hold. Parcels with no hold at all are not on a customs hold, so they must be included. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE parcels (
  id INTEGER PRIMARY KEY,
  destination TEXT NOT NULL,
  hold_code TEXT
);`,
    datasets: [
      `INSERT INTO parcels VALUES
  (1, 'Oslo', NULL),
  (2, 'Lima', 'CUSTOMS'),
  (3, 'Kyiv', 'ADDRESS'),
  (4, 'Doha', NULL),
  (5, 'Perth', 'CUSTOMS'),
  (6, 'Quito', 'PAYMENT');`,
      `INSERT INTO parcels VALUES
  (1, 'Riga', 'CUSTOMS'),
  (2, 'Baku', NULL);`,
      `INSERT INTO parcels VALUES
  (1, 'Turin', 'PAYMENT'),
  (2, 'Porto', 'ADDRESS'),
  (3, 'Cusco', 'CUSTOMS');`,
    ],
    ordered: true,
    solution: `SELECT id, destination, hold_code
FROM parcels
WHERE hold_code <> 'CUSTOMS' OR hold_code IS NULL
ORDER BY id;`,
    hint: "What does NULL <> 'CUSTOMS' evaluate to? WHERE keeps a row only when its condition is true.",
    explanation:
      "Comparisons with NULL are neither true nor false but *unknown*, and `WHERE` keeps only rows whose condition is true. So `hold_code <> 'CUSTOMS'` silently drops every parcel with no hold: `NULL <> 'CUSTOMS'` is unknown, and wrapping it in `NOT` does not help because NOT unknown is still unknown. Add the missing case explicitly with `OR hold_code IS NULL`. SQLite and PostgreSQL also offer a NULL-safe inequality (`hold_code IS NOT 'CUSTOMS'` / `IS DISTINCT FROM`) that treats NULL as an ordinary value. This is the single most common way a \"not equal\" filter loses rows in production.",
  },
  {
    id: 'sql-motion-vote-outcomes',
    number: 104,
    title: 'Outcome of Each Council Motion',
    difficulty: 'Medium',
    topic: 'NULL & CASE',
    statement:
      "`motions` has `id` and `title`. `votes` has `id`, `motion_id`, `member` and `choice`, which is `'yes'`, `'no'` or `'abstain'`. A member votes at most once per motion.\n\nReturn one row per motion with `id`, `yes`, `no`, `abstain` (the number of votes of each kind) and `outcome`:\n\n- `'no quorum'` when fewer than 3 yes-or-no votes were cast in total (abstentions do not count towards the quorum);\n- otherwise `'passed'` when there are more yes votes than no votes;\n- otherwise `'failed'` (a tie fails).\n\nEvery motion must appear, including one nobody has voted on yet (all three counts are 0). Rows ordered by `id` ascending.",
    schema: `CREATE TABLE motions (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);
CREATE TABLE votes (
  id INTEGER PRIMARY KEY,
  motion_id INTEGER NOT NULL,
  member TEXT NOT NULL,
  choice TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO motions VALUES
  (1, 'Protected bike lanes'),
  (2, 'Longer library hours'),
  (3, 'Night bus pilot'),
  (4, 'Fenced dog park');
INSERT INTO votes VALUES
  (1, 1, 'Abara', 'yes'),
  (2, 1, 'Brandt', 'yes'),
  (3, 1, 'Chowdhury', 'no'),
  (4, 1, 'Diaz', 'yes'),
  (5, 2, 'Abara', 'yes'),
  (6, 2, 'Brandt', 'no'),
  (7, 2, 'Chowdhury', 'no'),
  (8, 2, 'Diaz', 'yes'),
  (9, 2, 'Egan', 'abstain'),
  (10, 3, 'Abara', 'yes'),
  (11, 3, 'Brandt', 'abstain'),
  (12, 3, 'Chowdhury', 'abstain'),
  (13, 3, 'Diaz', 'yes'),
  (14, 3, 'Egan', 'abstain');`,
      `INSERT INTO motions VALUES
  (1, 'Raise parking fees'),
  (2, 'Rename the square');
INSERT INTO votes VALUES
  (1, 1, 'Ito', 'no'),
  (2, 1, 'Jansen', 'yes'),
  (3, 1, 'Kaya', 'no'),
  (4, 2, 'Ito', 'abstain'),
  (5, 2, 'Jansen', 'abstain'),
  (6, 2, 'Kaya', 'abstain');`,
      `INSERT INTO motions VALUES
  (5, 'Plant street trees'),
  (6, 'Close the old pool'),
  (7, 'Fund a skate park');
INSERT INTO votes VALUES
  (1, 5, 'Lund', 'yes'),
  (2, 5, 'Mbeki', 'no'),
  (3, 5, 'Novak', 'yes'),
  (4, 7, 'Lund', 'yes'),
  (5, 7, 'Mbeki', 'no'),
  (6, 7, 'Novak', 'abstain');`,
    ],
    ordered: true,
    solution: `WITH tally AS (
  SELECT m.id,
         COUNT(CASE WHEN v.choice = 'yes' THEN 1 END) AS yes,
         COUNT(CASE WHEN v.choice = 'no' THEN 1 END) AS no,
         COUNT(CASE WHEN v.choice = 'abstain' THEN 1 END) AS abstain
  FROM motions m
  LEFT JOIN votes v ON v.motion_id = m.id
  GROUP BY m.id
)
SELECT id, yes, no, abstain,
       CASE
         WHEN yes + no < 3 THEN 'no quorum'
         WHEN yes > no THEN 'passed'
         ELSE 'failed'
       END AS outcome
FROM tally
ORDER BY id;`,
    hint: 'Count each kind of vote with COUNT(CASE WHEN ... THEN 1 END) over a LEFT JOIN from motions, then decide the outcome from those three numbers in a second step.',
    explanation:
      "This is conditional aggregation followed by a CASE over the aggregates. `COUNT(CASE WHEN v.choice = 'yes' THEN 1 END)` counts only the rows where the CASE produced a value, because COUNT skips NULL; three of them pivot the vote kinds into columns in one pass. Start from `motions` with a `LEFT JOIN` so a motion without votes still gets a row: its single NULL-padded row makes every conditional count 0, where an inner join would lose the motion. Computing the tallies in a CTE lets the outer `CASE` refer to `yes` and `no` by name; branch order matters because the first true WHEN wins, so the quorum test comes first. The usual slips are testing the quorum with `COUNT(v.id)` (which includes abstentions) and writing `yes >= no`, which lets a tie pass.",
  },
  {
    id: 'sql-unit-free-after-last-lease',
    number: 105,
    title: 'When Each Rental Unit Frees Up',
    difficulty: 'Medium',
    topic: 'NULL & CASE',
    statement:
      "`leases` has `id`, `unit`, `starts_on` and `ends_on` (`YYYY-MM-DD`). `ends_on` is NULL for an open-ended lease, one with no agreed end date.\n\nFor each unit return `unit`, `leases` (how many leases it has on file) and `free_after`: the latest `ends_on` among the unit's leases, but NULL if **any** of its leases is open-ended, because then nobody knows when the unit frees up. Rows ordered by `unit` ascending.",
    schema: `CREATE TABLE leases (
  id INTEGER PRIMARY KEY,
  unit TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT
);`,
    datasets: [
      `INSERT INTO leases VALUES
  (1, 'A1', '2023-01-01', '2023-12-31'),
  (2, 'A1', '2024-01-01', '2024-12-31'),
  (3, 'B2', '2022-06-01', '2023-05-31'),
  (4, 'B2', '2023-06-01', NULL),
  (5, 'C3', '2024-03-01', NULL),
  (6, 'D4', '2021-01-01', '2021-06-30');`,
      `INSERT INTO leases VALUES
  (1, 'U1', '2024-01-01', '2024-03-31'),
  (2, 'U1', '2023-01-01', '2023-12-31'),
  (3, 'U2', '2024-02-01', '2024-02-29');`,
      `INSERT INTO leases VALUES
  (1, 'P', '2024-01-01', NULL),
  (2, 'P', '2020-01-01', '2020-12-31'),
  (3, 'P', '2021-01-01', '2021-12-31'),
  (4, 'Q', '2022-01-01', '2022-12-31'),
  (5, 'Q', '2023-01-01', '2023-12-31');`,
    ],
    ordered: true,
    solution: `SELECT unit,
       COUNT(*) AS leases,
       CASE WHEN COUNT(*) = COUNT(ends_on) THEN MAX(ends_on) END AS free_after
FROM leases
GROUP BY unit
ORDER BY unit;`,
    hint: 'MAX skips NULLs, so it cannot tell you that one was there. Compare COUNT(*) with COUNT(ends_on) to find out.',
    explanation:
      "Aggregates ignore NULL, which is usually convenient and here is exactly wrong: `MAX(ends_on)` for a unit with one finished lease and one open-ended lease returns the finished lease's date, as if the open-ended one did not exist. In this table NULL means \"later than any date\", so the query has to detect it itself. `COUNT(*)` counts rows while `COUNT(ends_on)` counts non-NULL values; the two are equal only when no lease is open-ended, and only then is `MAX(ends_on)` the answer. A CASE with no ELSE yields NULL otherwise. The same count comparison answers any \"all values present?\" question inside a GROUP BY without a second query.",
  },

  // ===== Aggregation =====
  {
    id: 'sql-spotless-inspection-records',
    number: 106,
    title: 'Kitchens With a Spotless Inspection Record',
    difficulty: 'Medium',
    topic: 'Aggregation',
    statement:
      "`inspections` has `id`, `kitchen`, `inspected_on` and `score` (0 to 100, or NULL while the result is still pending).\n\nA kitchen has a spotless record when it has **at least 2 inspections**, **every** one of them has a score, and **every** score is 80 or higher. One low or pending inspection disqualifies the kitchen.\n\nReturn `kitchen`, `inspections` (how many it has had) and `lowest_score` for each spotless kitchen, ordered by `lowest_score` descending, then `kitchen` ascending.",
    schema: `CREATE TABLE inspections (
  id INTEGER PRIMARY KEY,
  kitchen TEXT NOT NULL,
  inspected_on TEXT NOT NULL,
  score INTEGER
);`,
    datasets: [
      `INSERT INTO inspections VALUES
  (1, 'Basil & Co', '2024-01-10', 92),
  (2, 'Basil & Co', '2024-04-12', 88),
  (3, 'Noodle Bar', '2024-01-15', 95),
  (4, 'Noodle Bar', '2024-03-02', 79),
  (5, 'Noodle Bar', '2024-05-20', 90),
  (6, 'Harbour Grill', '2024-02-01', 85),
  (7, 'Harbour Grill', '2024-06-01', NULL),
  (8, 'Tiny Taco', '2024-02-11', 99),
  (9, 'Green Fork', '2024-01-05', 88),
  (10, 'Green Fork', '2024-03-05', 91),
  (11, 'Green Fork', '2024-05-05', 96),
  (12, 'Olive Tree', '2024-02-20', 97),
  (13, 'Olive Tree', '2024-05-21', 93);`,
      `INSERT INTO inspections VALUES
  (1, 'Kiln', '2024-01-01', 80),
  (2, 'Kiln', '2024-02-01', 80),
  (3, 'Larder', '2024-01-01', NULL),
  (4, 'Larder', '2024-02-01', NULL),
  (5, 'Mezze', '2024-01-01', 79),
  (6, 'Mezze', '2024-02-01', 100);`,
      `INSERT INTO inspections VALUES
  (1, 'Anchor', '2024-01-01', 90),
  (2, 'Anchor', '2024-02-01', NULL),
  (3, 'Anchor', '2024-03-01', 95),
  (4, 'Brine', '2024-01-01', 100),
  (5, 'Cinder', '2024-01-01', 81),
  (6, 'Cinder', '2024-02-01', 82),
  (7, 'Cinder', '2024-03-01', 83),
  (8, 'Dill', '2024-01-01', 90),
  (9, 'Dill', '2024-02-01', 91);`,
    ],
    ordered: true,
    solution: `SELECT kitchen,
       COUNT(*) AS inspections,
       MIN(score) AS lowest_score
FROM inspections
GROUP BY kitchen
HAVING COUNT(*) >= 2
   AND COUNT(score) = COUNT(*)
   AND MIN(score) >= 80
ORDER BY lowest_score DESC, kitchen;`,
    hint: '"Every row in the group satisfies X" is a statement about the group, so it belongs in HAVING. If the smallest score is at least 80, they all are. Then think about what MIN does with a pending score.',
    explanation:
      "`WHERE` filters rows before grouping, `HAVING` filters groups after it. A condition on *all* rows of a group therefore cannot go in WHERE: `WHERE score >= 80` just deletes the bad inspections and leaves the kitchen looking perfect. Phrase the universal condition as an aggregate instead: every score is at least 80 exactly when `MIN(score) >= 80`. `MIN` ignores NULL, so pending results need their own test, `COUNT(score) = COUNT(*)`, which holds only when no score is missing. With `COUNT(*) >= 2` for the minimum history, all three tests run in the single grouped pass, with no subquery.",
  },

  // ===== Joins =====
  {
    id: 'sql-speakers-sharing-a-slot',
    number: 107,
    title: 'Speakers Booked Into the Same Room and Slot',
    difficulty: 'Easy',
    topic: 'Joins',
    statement:
      "A conference schedule is stored in `talks` with `id`, `speaker` (each speaker gives exactly one talk, and names are unique), `room` and `slot` (a start time such as `'09:00'`).\n\nTwo talks clash when they are in the same `room` **and** the same `slot`. Return every clashing pair exactly once as `first_speaker`, `second_speaker`, `room`, `slot`, where `first_speaker` is the name that sorts first alphabetically. Three talks in one room and slot produce three pairs.\n\nRows ordered by `slot`, then `room`, then `first_speaker`, then `second_speaker`, all ascending.",
    schema: `CREATE TABLE talks (
  id INTEGER PRIMARY KEY,
  speaker TEXT NOT NULL,
  room TEXT NOT NULL,
  slot TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO talks VALUES
  (1, 'Priya', 'Hall A', '09:00'),
  (2, 'Marek', 'Hall A', '09:00'),
  (3, 'Aiko', 'Hall B', '09:00'),
  (4, 'Jonas', 'Hall A', '10:00'),
  (5, 'Bea', 'Hall B', '10:00'),
  (6, 'Zane', 'Hall B', '10:00'),
  (7, 'Carla', 'Hall B', '10:00');`,
      `INSERT INTO talks VALUES
  (1, 'Amit', 'Room 1', '11:00'),
  (2, 'Bora', 'Room 2', '11:00'),
  (3, 'Cleo', 'Room 1', '12:00');`,
      `INSERT INTO talks VALUES
  (1, 'Wu', 'Lab', '14:00'),
  (2, 'Ito', 'Lab', '14:00'),
  (3, 'Ade', 'Lab', '15:00'),
  (4, 'Eli', 'Lab', '15:00'),
  (5, 'Kai', 'Den', '14:00');`,
    ],
    ordered: true,
    solution: `SELECT a.speaker AS first_speaker,
       b.speaker AS second_speaker,
       a.room,
       a.slot
FROM talks a
JOIN talks b
  ON b.room = a.room
 AND b.slot = a.slot
 AND a.speaker < b.speaker
ORDER BY a.slot, a.room, a.speaker, b.speaker;`,
    hint: 'Join the table to itself on room and slot. Which comparison between the two copies keeps each pair once, with the alphabetically earlier name on the left?',
    explanation:
      "Finding pairs inside one table is a self-join: give the table two aliases and join them on what the pair must share, here both `room` and `slot`. The equalities alone match every talk with itself and list each real pair twice, as (Marek, Priya) and (Priya, Marek). An asymmetric condition fixes both: `a.speaker < b.speaker` removes the self-pairs and keeps one orientation, and because it compares names it also guarantees the alphabetically earlier speaker is on the left. `a.speaker <> b.speaker` only removes the self-pairs, and `a.id < b.id` keeps one row per pair but orders it by insertion, not by name. Forgetting `room` in the join reports talks that merely run at the same time in different rooms.",
  },
  {
    id: 'sql-frequent-session-partners',
    number: 108,
    title: 'Musicians Who Keep Recording Together',
    difficulty: 'Medium',
    topic: 'Joins',
    statement:
      "`musicians` has `id` and `name` (unique). `session_players` links musicians to recording sessions with `session_id` and `musician_id`; each (session, musician) pair appears at most once.\n\nReturn every pair of musicians who played on **at least 2** of the same sessions: `name_a`, `name_b` and `shared_sessions`. Each pair appears once, with `name_a` the name that sorts first alphabetically. Rows ordered by `shared_sessions` descending, then `name_a`, then `name_b` ascending.",
    schema: `CREATE TABLE musicians (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE session_players (
  session_id INTEGER NOT NULL,
  musician_id INTEGER NOT NULL,
  PRIMARY KEY (session_id, musician_id)
);`,
    datasets: [
      `INSERT INTO musicians VALUES
  (1, 'Nina'),
  (2, 'Otis'),
  (3, 'Miles'),
  (4, 'Etta'),
  (5, 'Chet');
INSERT INTO session_players VALUES
  (10, 1), (10, 2), (10, 3),
  (11, 1), (11, 2),
  (12, 2), (12, 3), (12, 4),
  (13, 1), (13, 2), (13, 3),
  (14, 4), (14, 5);`,
      `INSERT INTO musicians VALUES
  (1, 'Ana'),
  (2, 'Bo'),
  (3, 'Cy');
INSERT INTO session_players VALUES
  (1, 1), (1, 2),
  (2, 2), (2, 3),
  (3, 1), (3, 3);`,
      `INSERT INTO musicians VALUES
  (1, 'Zed'),
  (2, 'Amy'),
  (3, 'Bob');
INSERT INTO session_players VALUES
  (1, 1), (1, 2), (1, 3),
  (2, 1), (2, 2), (2, 3),
  (3, 1), (3, 2);`,
    ],
    ordered: true,
    solution: `SELECT ma.name AS name_a,
       mb.name AS name_b,
       COUNT(*) AS shared_sessions
FROM session_players pa
JOIN session_players pb ON pb.session_id = pa.session_id
JOIN musicians ma ON ma.id = pa.musician_id
JOIN musicians mb ON mb.id = pb.musician_id
WHERE ma.name < mb.name
GROUP BY ma.name, mb.name
HAVING COUNT(*) >= 2
ORDER BY shared_sessions DESC, name_a, name_b;`,
    hint: 'Self-join the junction table on session_id: each joined row is "these two musicians were on this session". Then group by the pair and count.',
    explanation:
      "A junction table joined to itself on the shared side turns a many-to-many link into co-occurrence pairs: `pa` and `pb` on the same `session_id` give one row per (musician, musician, session). Grouping by the pair and counting rows gives the number of shared sessions, which is a plain `COUNT(*)` only because the junction table's primary key rules out duplicate links. Keep one orientation of each pair with `ma.name < mb.name`; comparing names (not ids) also puts the alphabetically earlier name in `name_a`. Then `HAVING COUNT(*) >= 2` keeps the repeat collaborations. The join is quadratic in the size of a session, which is fine for sessions of a few players and worth knowing for much larger groups.",
  },
  {
    id: 'sql-project-hours-and-expenses',
    number: 109,
    title: 'Project Hours and Expenses Side by Side',
    difficulty: 'Medium',
    topic: 'Joins',
    statement:
      "`projects` has `id` and `name` (unique). Two child tables hang off it: `timesheets` (`id`, `project_id`, `hours`) and `expenses` (`id`, `project_id`, `amount_cents`). A project can have any number of rows in either, including none.\n\nReturn one row per project: `name`, `total_hours` and `total_expense_cents`, using 0 where a project has no rows of that kind. Every project must appear. Rows ordered by `name` ascending.",
    schema: `CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE timesheets (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  hours INTEGER NOT NULL
);
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO projects VALUES
  (1, 'Atlas'),
  (2, 'Beacon'),
  (3, 'Comet'),
  (4, 'Drift');
INSERT INTO timesheets VALUES
  (1, 1, 8),
  (2, 1, 8),
  (3, 1, 4),
  (4, 2, 6),
  (5, 4, 5),
  (6, 4, 5);
INSERT INTO expenses VALUES
  (1, 1, 12000),
  (2, 1, 3000),
  (3, 3, 45000),
  (4, 4, 700),
  (5, 4, 700);`,
      `INSERT INTO projects VALUES
  (1, 'Solo'),
  (2, 'Empty');
INSERT INTO timesheets VALUES
  (1, 1, 3);
INSERT INTO expenses VALUES
  (1, 1, 500);`,
      `INSERT INTO projects VALUES
  (1, 'North'),
  (2, 'South');
INSERT INTO timesheets VALUES
  (1, 1, 2),
  (2, 1, 3),
  (3, 2, 7);
INSERT INTO expenses VALUES
  (1, 1, 100),
  (2, 1, 200),
  (3, 1, 300),
  (4, 2, 50),
  (5, 2, 50);`,
    ],
    ordered: true,
    solution: `SELECT p.name,
       COALESCE(t.total_hours, 0) AS total_hours,
       COALESCE(e.total_cents, 0) AS total_expense_cents
FROM projects p
LEFT JOIN (
  SELECT project_id, SUM(hours) AS total_hours
  FROM timesheets
  GROUP BY project_id
) t ON t.project_id = p.id
LEFT JOIN (
  SELECT project_id, SUM(amount_cents) AS total_cents
  FROM expenses
  GROUP BY project_id
) e ON e.project_id = p.id
ORDER BY p.name;`,
    hint: 'If a project has 3 timesheet rows and 2 expense rows, how many rows does joining both tables to it produce? Aggregate each child table to one row per project before joining.',
    explanation:
      "Joining a parent to two independent child tables in one query multiplies them: a project with 3 timesheets and 2 expenses becomes 3 x 2 = 6 rows, so `SUM(hours)` is doubled and `SUM(amount_cents)` tripled. This is join fan-out, and it is dangerous because the query runs and the numbers look plausible. `SUM(DISTINCT ...)` is not a fix, because two genuine 8-hour entries collapse into one. The reliable pattern is to aggregate each child to one row per `project_id` first, then join those one-row-per-project results to `projects`, where nothing can multiply. `LEFT JOIN` keeps projects with no rows on one side and `COALESCE(..., 0)` turns the resulting NULL into 0. Correlated scalar subqueries in the SELECT list are an equally correct alternative.",
  },

  // ===== Subqueries & CTEs =====
  {
    id: 'sql-effective-permissions',
    number: 110,
    title: 'Effective Permissions After Revocations',
    difficulty: 'Medium',
    topic: 'Subqueries & CTEs',
    statement:
      "An access-control system stores four tables:\n\n- `user_roles` (`username`, `role`): the roles each user holds;\n- `role_grants` (`role`, `perm`): the permissions each role gives;\n- `direct_grants` (`username`, `perm`): permissions handed to a user personally;\n- `revocations` (`username`, `perm`): permissions explicitly taken away from a user.\n\nA user's effective permissions are everything granted through any of their roles, plus their direct grants, minus anything revoked for **that user**. A revocation wins no matter how the permission was granted, and a revocation of something the user never had changes nothing.\n\nReturn `username` and `perm`, one row per distinct effective pair (the same permission can arrive by several routes), ordered by `username` ascending, then `perm` ascending.",
    schema: `CREATE TABLE user_roles (
  username TEXT NOT NULL,
  role TEXT NOT NULL
);
CREATE TABLE role_grants (
  role TEXT NOT NULL,
  perm TEXT NOT NULL
);
CREATE TABLE direct_grants (
  username TEXT NOT NULL,
  perm TEXT NOT NULL
);
CREATE TABLE revocations (
  username TEXT NOT NULL,
  perm TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO user_roles VALUES
  ('ana', 'editor'),
  ('ana', 'reviewer'),
  ('ben', 'viewer'),
  ('cy', 'editor');
INSERT INTO role_grants VALUES
  ('viewer', 'read'),
  ('editor', 'read'),
  ('editor', 'write'),
  ('reviewer', 'read'),
  ('reviewer', 'approve');
INSERT INTO direct_grants VALUES
  ('ben', 'export'),
  ('ana', 'write'),
  ('dov', 'read');
INSERT INTO revocations VALUES
  ('cy', 'write'),
  ('ben', 'export'),
  ('ana', 'delete'),
  ('dov', 'approve');`,
      `INSERT INTO user_roles VALUES
  ('eli', 'admin');
INSERT INTO role_grants VALUES
  ('admin', 'read'),
  ('admin', 'write');
INSERT INTO direct_grants VALUES
  ('eli', 'read');`,
      `INSERT INTO user_roles VALUES
  ('fay', 'ops'),
  ('gus', 'ops'),
  ('gus', 'ghost');
INSERT INTO role_grants VALUES
  ('ops', 'deploy'),
  ('ops', 'restart');
INSERT INTO direct_grants VALUES
  ('fay', 'deploy'),
  ('hal', 'audit');
INSERT INTO revocations VALUES
  ('fay', 'deploy'),
  ('fay', 'restart'),
  ('hal', 'audit');`,
    ],
    ordered: true,
    solution: `SELECT ur.username, rg.perm
FROM user_roles ur
JOIN role_grants rg ON rg.role = ur.role
UNION
SELECT username, perm FROM direct_grants
EXCEPT
SELECT username, perm FROM revocations
ORDER BY username, perm;`,
    hint: 'The statement is already set algebra: (role permissions UNION direct grants) EXCEPT revocations. Check which of UNION and UNION ALL removes duplicates.',
    explanation:
      "Set operators combine whole result sets row by row. `UNION` merges the role-derived pairs with the direct grants and removes duplicates, so a permission that arrives through two roles, or through a role and a direct grant, appears once; `UNION ALL` would keep every copy. `EXCEPT` then removes each (username, perm) row that also appears in `revocations`. It compares entire rows, so a revocation only affects the user it names. SQLite evaluates compound operators left to right, so this reads as (roles UNION direct) EXCEPT revocations; in engines where precedence differs, or whenever the order matters, add parentheses or a CTE. Applying the revocations to the direct grants alone leaves a revoked role permission in place, and matching revocations on `perm` alone strips the permission from every user.",
  },
  {
    id: 'sql-winning-bid-per-auction',
    number: 111,
    title: 'Winning Bid of Every Auction',
    difficulty: 'Hard',
    topic: 'Subqueries & CTEs',
    statement:
      "`auctions` has `id`, `item` and `reserve_cents` (the lowest price the seller accepts). `bids` has `id`, `auction_id`, `bidder`, `amount_cents` and `placed_at` (`YYYY-MM-DD HH:MM:SS`).\n\nOnly bids of at least the reserve can win. Among those, the winner is the highest `amount_cents`; if several bids share that amount the **earliest** `placed_at` wins, and if they were also placed at the same moment the lowest bid `id` wins.\n\nReturn one row per auction: `id`, `item`, `winner` (the winning bidder) and `winning_cents`. An auction with no bid reaching its reserve still appears, with NULL in both of those columns. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE auctions (
  id INTEGER PRIMARY KEY,
  item TEXT NOT NULL,
  reserve_cents INTEGER NOT NULL
);
CREATE TABLE bids (
  id INTEGER PRIMARY KEY,
  auction_id INTEGER NOT NULL,
  bidder TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  placed_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO auctions VALUES
  (1, 'Oak desk', 5000),
  (2, 'Film camera', 12000),
  (3, 'Road bike', 30000),
  (4, 'Brass lamp', 1000);
INSERT INTO bids VALUES
  (1, 1, 'kim', 4000, '2024-04-01 10:00:00'),
  (2, 1, 'lou', 6500, '2024-04-01 10:05:00'),
  (3, 1, 'max', 6500, '2024-04-01 10:02:00'),
  (4, 1, 'kim', 6000, '2024-04-01 10:09:00'),
  (5, 2, 'ned', 9000, '2024-04-01 11:00:00'),
  (6, 2, 'ola', 11999, '2024-04-01 11:30:00'),
  (7, 3, 'pia', 30000, '2024-04-02 09:00:00'),
  (8, 3, 'quin', 30000, '2024-04-02 09:00:00');`,
      `INSERT INTO auctions VALUES
  (1, 'Glass vase', 100);
INSERT INTO bids VALUES
  (3, 1, 'ava', 100, '2024-01-01 12:00:00'),
  (2, 1, 'bix', 100, '2024-01-01 12:00:00'),
  (1, 1, 'cal', 100, '2024-01-01 12:30:00');`,
      `INSERT INTO auctions VALUES
  (7, 'Wool rug', 2000),
  (8, 'Wall clock', 0);
INSERT INTO bids VALUES
  (1, 7, 'xan', 1999, '2024-02-01 08:00:00'),
  (2, 8, 'yui', 1, '2024-02-01 08:00:00'),
  (3, 8, 'zoe', 5, '2024-02-01 08:01:00'),
  (4, 7, 'wes', 2500, '2024-02-01 08:02:00'),
  (5, 7, 'xan', 2400, '2024-02-01 08:03:00');`,
    ],
    ordered: true,
    solution: `SELECT a.id, a.item, b.bidder AS winner, b.amount_cents AS winning_cents
FROM auctions a
LEFT JOIN bids b
  ON b.auction_id = a.id
 AND b.amount_cents >= a.reserve_cents
 AND NOT EXISTS (
       SELECT 1
       FROM bids x
       WHERE x.auction_id = b.auction_id
         AND (x.amount_cents > b.amount_cents
              OR (x.amount_cents = b.amount_cents AND x.placed_at < b.placed_at)
              OR (x.amount_cents = b.amount_cents AND x.placed_at = b.placed_at AND x.id < b.id))
     )
ORDER BY a.id;`,
    hint: 'A bid wins when no other bid in the same auction beats it. Spell "beats" out as higher amount, or equal amount and earlier, or equal amount and time with a lower id, and keep the whole test in the ON clause so auctions without a winner survive.',
    explanation:
      "\"The best row per group\" can be stated without ranking: a row is the best when no row in its group beats it. `NOT EXISTS` with a correlated subquery expresses that directly, and the multi-level tie-break becomes a chain of ORs, one per level, each requiring equality on all the earlier levels. Because the chain ends on the unique `id`, exactly one bid per auction survives. The simpler idea of joining back on `MAX(amount_cents)` returns two winners when the top amount is tied. Two more details matter. Every condition on `bids`, including the reserve test, sits in the `ON` clause of a `LEFT JOIN`; in `WHERE` it would discard the auctions that have no qualifying bid. And the subquery does not need its own reserve test, since any bid that beats a qualifying bid on amount is at least as high. `ROW_NUMBER() OVER (PARTITION BY auction_id ORDER BY amount_cents DESC, placed_at, id)` is the window-function equivalent.",
  },

  // ===== Strings & Dates =====
  {
    id: 'sql-codes-with-literal-underscore',
    number: 112,
    title: 'Promo Codes With the VIP_ Prefix',
    difficulty: 'Easy',
    topic: 'Strings & Dates',
    statement:
      "`promo_codes` has `id`, `code` and `percent_off`. Codes consist of upper-case letters, digits and underscores.\n\nMarketing wants the codes that begin with the four characters `VIP_`, with a real underscore in fourth place. `VIP_SPRING` and `VIP_` itself qualify; `VIPX10`, `VIP10` and `NOVIP_5` do not.\n\nReturn `id` and `code`, ordered by `id` ascending.",
    schema: `CREATE TABLE promo_codes (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL,
  percent_off INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO promo_codes VALUES
  (1, 'VIP_SPRING', 20),
  (2, 'VIPX10', 10),
  (3, 'VIP10', 10),
  (4, 'NOVIP_5', 5),
  (5, 'VIP_', 15),
  (6, 'WELCOME_VIP_', 5),
  (7, 'VIP__GOLD', 30);`,
      `INSERT INTO promo_codes VALUES
  (1, 'VIPA', 1),
  (2, 'VIP', 2),
  (3, 'AVIP_B', 3);`,
      `INSERT INTO promo_codes VALUES
  (10, 'VIP_1', 5),
  (11, 'VIP_2', 5),
  (12, 'V_IP_3', 5),
  (13, 'VIP-4', 5);`,
    ],
    ordered: true,
    solution: `SELECT id, code
FROM promo_codes
WHERE code LIKE 'VIP!_%' ESCAPE '!'
ORDER BY id;`,
    hint: "In a LIKE pattern the underscore is itself a wildcard: it matches any single character. Look up the ESCAPE clause, or compare the first four characters with SUBSTR.",
    explanation:
      "`LIKE` has two wildcards: `%` matches any run of characters (including none) and `_` matches exactly one character. So `LIKE 'VIP_%'` means VIP followed by any one character and then anything, which happily matches `VIPX10` and `VIP10`. To match a wildcard character literally, declare an escape character and put it in front: `LIKE 'VIP!_%' ESCAPE '!'` reads as VIP, a real underscore, then anything. Any character can serve as the escape; a backslash is common but needs care inside string literals in application code. `SUBSTR(code, 1, 4) = 'VIP_'` avoids pattern matching altogether. The same trap applies to a literal percent sign, for instance when searching for the text 50%.",
  },
  {
    id: 'sql-recipes-with-exact-tag',
    number: 113,
    title: 'Recipes Carrying an Exact Tag',
    difficulty: 'Medium',
    topic: 'Strings & Dates',
    statement:
      "`recipes` has `id`, `name` and `tags`: a comma-separated list of lower-case tags with no spaces, such as `'vegan,nut,quick'`. `tags` is NULL or an empty string for a recipe with no tags.\n\nThe allergy filter needs every recipe that carries the tag `nut` **as a whole tag**. Tags that merely contain those letters, such as `nut-free`, `peanut`, `coconut` or `nutmeg`, do not count.\n\nReturn `id` and `name`, ordered by `id` ascending.",
    schema: `CREATE TABLE recipes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  tags TEXT
);`,
    datasets: [
      `INSERT INTO recipes VALUES
  (1, 'Satay noodles', 'vegan,nut,quick'),
  (2, 'Granola bars', 'nut-free,snack'),
  (3, 'Pesto pasta', 'nut'),
  (4, 'Peanut brittle', 'peanut,dessert'),
  (5, 'Baklava', 'dessert,nut'),
  (6, 'Plain rice', NULL),
  (7, 'Coconut curry', 'coconut,vegan'),
  (8, 'Trail mix', 'nut,snack'),
  (9, 'Buttered toast', '');`,
      `INSERT INTO recipes VALUES
  (1, 'Oat cookies', 'nut-free'),
  (2, 'Spiced donuts', 'donut,nutmeg'),
  (3, 'Walnut spread', 'walnut,nut-butter');`,
      `INSERT INTO recipes VALUES
  (1, 'Energy balls', 'quick,nut,nut-free'),
  (2, 'Eggnog', 'nutmeg,nut'),
  (3, 'Carrot cake', 'nut,nutmeg'),
  (4, 'Squash soup', 'butternut');`,
    ],
    ordered: true,
    solution: `SELECT id, name
FROM recipes
WHERE ',' || tags || ',' LIKE '%,nut,%'
ORDER BY id;`,
    hint: 'A whole tag has a comma on both sides, except the first and last tags. What could you add to the string so that every tag has one on both sides?',
    explanation:
      "Substring search does not respect item boundaries: `tags LIKE '%nut%'` also finds `peanut`, `nutmeg` and, worst of all for an allergy filter, `nut-free`. A whole tag is delimited by commas, but the first tag has none before it and the last has none after it, which would need four separate patterns (alone, first, middle, last). Wrapping the list in delimiters removes the special cases: `',' || tags || ','` turns `nut,snack` into `,nut,snack,`, and then `LIKE '%,nut,%'` matches the tag wherever it sits. A NULL list stays NULL through the concatenation and is filtered out, and an empty one becomes `,,`, which does not match. The real fix is a junction table of (recipe, tag), because this pattern can never use an index, but the wrapped-delimiter idiom is the standard way to query the lists you inherit.",
  },
  {
    id: 'sql-split-last-comma-first',
    number: 114,
    title: 'Split Last, First Into Two Columns',
    difficulty: 'Medium',
    topic: 'Strings & Dates',
    statement:
      "`authors` has `id` and `raw_name`, typed by hand in one of two shapes:\n\n- `Last, First` with exactly one comma, and possibly stray spaces at either end or around the comma;\n- a single name with no comma at all (a pen name or an organisation).\n\nReturn `id`, `last_name` and `first_name`:\n\n- with a comma, `last_name` is the text before it and `first_name` the text after it, each with leading and trailing spaces removed (spaces *inside* a name stay);\n- if nothing but spaces follows the comma, `first_name` is NULL;\n- with no comma, `last_name` is the whole value with leading and trailing spaces removed, and `first_name` is NULL.\n\nRows ordered by `id` ascending.",
    schema: `CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  raw_name TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO authors VALUES
  (1, 'Okafor, Chidi'),
  (2, '  Lindqvist ,Maja  '),
  (3, 'Voltaire'),
  (4, 'de la Cruz, Ana Lucia'),
  (5, 'Tanaka,'),
  (6, ' Cher ');`,
      `INSERT INTO authors VALUES
  (1, 'Ng,  Wei'),
  (2, 'Open Data Institute'),
  (3, 'Sato,   ');`,
      `INSERT INTO authors VALUES
  (1, 'Abel , Zoe'),
  (2, 'Prince'),
  (3, 'Li,Na');`,
    ],
    ordered: true,
    solution: `SELECT id,
       TRIM(CASE
              WHEN INSTR(raw_name, ',') > 0
                THEN SUBSTR(raw_name, 1, INSTR(raw_name, ',') - 1)
              ELSE raw_name
            END) AS last_name,
       CASE
         WHEN INSTR(raw_name, ',') > 0
           THEN NULLIF(TRIM(SUBSTR(raw_name, INSTR(raw_name, ',') + 1)), '')
       END AS first_name
FROM authors
ORDER BY id;`,
    hint: 'INSTR(raw_name, \',\') gives the position of the comma, or 0 when there is none. SUBSTR cuts on either side of it, TRIM tidies each piece, and NULLIF(x, \'\') turns an empty piece into NULL.',
    explanation:
      "Splitting on a delimiter in SQLite is done with three small functions. `INSTR(s, ',')` returns the 1-based position of the first comma, or 0 if there is none; `SUBSTR(s, 1, pos - 1)` is the text before it and `SUBSTR(s, pos + 1)` everything after it; `TRIM` removes the stray spaces from each piece. The no-comma case must be handled on purpose: with a position of 0 the same arithmetic produces an empty last name and puts the whole string in the first name, so a `CASE` on `INSTR(...) > 0` chooses between the two shapes. Finally, the statement wants a missing first name to be NULL, not an empty string, and `NULLIF(TRIM(...), '')` converts one into the other. Other engines spell these `POSITION`/`CHARINDEX` and `SUBSTRING`, or provide `SPLIT_PART`, but the approach is the same.",
  },

  // ===== Data Quality =====
  {
    id: 'sql-seats-held-twice',
    number: 115,
    title: 'Seats Held More Than Once',
    difficulty: 'Easy',
    topic: 'Data Quality',
    statement:
      "A ticketing system records seat holds in `seat_holds` with `id`, `show_id`, `seat` and `held_by`. A seat in a given show should be held at most once, but nothing enforces that. The same seat label in a *different* show is a different seat, and two holds on one seat are a problem even when the same person placed both.\n\nReturn `show_id`, `seat`, `holds` (how many holds that seat has) and `first_hold_id` (the lowest `id`, the hold that will be honoured) for every seat held more than once. Rows ordered by `show_id` ascending, then `seat` ascending.",
    schema: `CREATE TABLE seat_holds (
  id INTEGER PRIMARY KEY,
  show_id INTEGER NOT NULL,
  seat TEXT NOT NULL,
  held_by TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO seat_holds VALUES
  (1, 10, 'A1', 'ines'),
  (2, 10, 'A2', 'joel'),
  (3, 10, 'A1', 'kofi'),
  (4, 11, 'A1', 'ines'),
  (5, 10, 'B7', 'lena'),
  (6, 10, 'B7', 'lena'),
  (7, 10, 'A1', 'mona'),
  (8, 11, 'A2', 'joel');`,
      `INSERT INTO seat_holds VALUES
  (1, 1, 'C1', 'ravi'),
  (2, 1, 'C2', 'ravi'),
  (3, 2, 'C1', 'ravi');`,
      `INSERT INTO seat_holds VALUES
  (5, 3, 'D4', 'sami'),
  (2, 3, 'D4', 'tove'),
  (9, 4, 'D4', 'sami'),
  (1, 4, 'D4', 'sami');`,
    ],
    ordered: true,
    solution: `SELECT show_id, seat, COUNT(*) AS holds, MIN(id) AS first_hold_id
FROM seat_holds
GROUP BY show_id, seat
HAVING COUNT(*) > 1
ORDER BY show_id, seat;`,
    hint: 'Group by the columns that are supposed to be unique together and keep the groups that have more than one row.',
    explanation:
      "Checking a uniqueness rule that the schema does not enforce is a GROUP BY on the would-be key plus `HAVING COUNT(*) > 1`. The key here is the pair (`show_id`, `seat`): grouping by `seat` alone merges seat A1 of two different shows into one false duplicate. Count rows, not people: `COUNT(DISTINCT held_by) > 1` misses a seat that the same customer managed to hold twice, which is still two rows where one is allowed. `MIN(id)` picks the surviving row in the same pass. This is the query to run before adding a `UNIQUE (show_id, seat)` constraint, which fails for as long as it returns anything.",
  },
  {
    id: 'sql-primary-address-violations',
    number: 116,
    title: 'Customers Without Exactly One Primary Address',
    difficulty: 'Medium',
    topic: 'Data Quality',
    statement:
      "`customers` has `id` and `name`. `addresses` has `id`, `customer_id`, `city` and `is_primary` (1 or 0). The business rule is that every customer has **exactly one** primary address.\n\nReturn the customers who break the rule: `id`, `name`, `primaries` (how many primary addresses they have) and `issue`, which is `'none'` when they have no primary address (this includes customers with no address at all) and `'multiple'` when they have more than one. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE addresses (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  city TEXT NOT NULL,
  is_primary INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ada'),
  (2, 'Bram'),
  (3, 'Chloe'),
  (4, 'Dmitri'),
  (5, 'Esme');
INSERT INTO addresses VALUES
  (1, 1, 'Lyon', 1),
  (2, 1, 'Nice', 0),
  (3, 2, 'Bonn', 0),
  (4, 2, 'Kiel', 0),
  (5, 3, 'Graz', 1),
  (6, 3, 'Linz', 1),
  (7, 3, 'Wien', 0),
  (8, 5, 'Gent', 1);`,
      `INSERT INTO customers VALUES
  (1, 'Farid'),
  (2, 'Greta');
INSERT INTO addresses VALUES
  (1, 1, 'Faro', 1),
  (2, 2, 'Lagos', 0),
  (3, 2, 'Porto', 1);`,
      `INSERT INTO customers VALUES
  (1, 'Hana'),
  (2, 'Ivo'),
  (3, 'Juno');
INSERT INTO addresses VALUES
  (1, 2, 'Brno', 1),
  (2, 2, 'Plzen', 1),
  (3, 2, 'Zlin', 1);`,
    ],
    ordered: true,
    solution: `SELECT c.id,
       c.name,
       COALESCE(SUM(a.is_primary), 0) AS primaries,
       CASE WHEN COALESCE(SUM(a.is_primary), 0) = 0 THEN 'none' ELSE 'multiple' END AS issue
FROM customers c
LEFT JOIN addresses a ON a.customer_id = c.id
GROUP BY c.id, c.name
HAVING COALESCE(SUM(a.is_primary), 0) <> 1
ORDER BY c.id;`,
    hint: 'Count primary addresses per customer starting from customers, so that people with no addresses are still counted (as zero). Then keep the counts that are not 1.',
    explanation:
      "An \"exactly one\" rule has two ways to fail, zero and several, and the zero case is the one queries tend to lose. Start from `customers` with a `LEFT JOIN`: an inner join only ever sees customers who have at least one address. Summing the 0/1 flag counts the primaries, but for a customer with no addresses the group's only row is NULL-padded and `SUM` returns NULL, not 0. Then `NULL <> 1` is unknown and HAVING drops precisely the customers you are looking for, hence the `COALESCE(..., 0)`. Moving the flag into the join (`AND a.is_primary = 1`) and using `COUNT(*)` has the mirror-image bug: the padded row is counted as one primary, so the customer looks fine. `COUNT(a.id)` with that join, or the COALESCE'd sum, are both safe.",
  },

  // ===== Dedup & Cleanup =====
  {
    id: 'sql-keep-fullest-vendor-record',
    number: 117,
    title: 'Keep the Fullest Vendor Record',
    difficulty: 'Hard',
    topic: 'Dedup & Cleanup',
    statement:
      "`vendors` has `id`, `tax_id`, `name` and three optional contact columns: `phone`, `email` and `website` (NULL when unknown; there are no empty strings). The same vendor was imported several times, so a `tax_id` can appear on many rows.\n\nFor each `tax_id` keep the row with the **most contact columns filled in** (non-NULL, out of the three). If several rows tie on that count, keep the one with the **highest** `id` (the most recent import).\n\nReturn one row per `tax_id`: `tax_id`, `keep_id` (the `id` of the row to keep), `filled` (how many contact columns that row has filled in) and `duplicates` (how many *other* rows share the `tax_id` and will be deleted). Rows ordered by `tax_id` ascending.",
    schema: `CREATE TABLE vendors (
  id INTEGER PRIMARY KEY,
  tax_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT
);`,
    datasets: [
      `INSERT INTO vendors VALUES
  (1, 'T-100', 'Acme Ltd', '555-0101', NULL, NULL),
  (2, 'T-100', 'ACME Limited', '555-0101', 'ap@acme.test', NULL),
  (3, 'T-100', 'Acme', NULL, NULL, 'acme.test'),
  (4, 'T-200', 'Birch Co', NULL, 'hi@birch.test', NULL),
  (5, 'T-200', 'Birch Company', '555-0202', NULL, NULL),
  (6, 'T-300', 'Cobalt', NULL, NULL, NULL),
  (7, 'T-400', 'Dune Supply', '555-0404', 'a@dune.test', 'dune.test'),
  (8, 'T-400', 'Dune', NULL, NULL, NULL);`,
      `INSERT INTO vendors VALUES
  (10, 'X-1', 'Elm Works', NULL, NULL, NULL),
  (11, 'X-1', 'Elm Works Inc', NULL, NULL, NULL),
  (12, 'Y-2', 'Fjord AS', '555-0909', 'post@fjord.test', 'fjord.test');`,
      `INSERT INTO vendors VALUES
  (3, 'K-9', 'Gale', '555-0303', 'g@gale.test', NULL),
  (1, 'K-9', 'Gale Ltd', '555-0303', NULL, 'gale.test'),
  (2, 'K-9', 'Gale Group', NULL, 'g@gale.test', 'gale.test'),
  (4, 'K-9', 'Gale & Sons', '555-0303', NULL, NULL);`,
    ],
    ordered: true,
    solution: `WITH scored AS (
  SELECT id, tax_id,
         (phone IS NOT NULL) + (email IS NOT NULL) + (website IS NOT NULL) AS filled
  FROM vendors
)
SELECT s.tax_id,
       s.id AS keep_id,
       s.filled,
       (SELECT COUNT(*) FROM vendors v WHERE v.tax_id = s.tax_id) - 1 AS duplicates
FROM scored s
WHERE NOT EXISTS (
  SELECT 1
  FROM scored o
  WHERE o.tax_id = s.tax_id
    AND (o.filled > s.filled OR (o.filled = s.filled AND o.id > s.id))
)
ORDER BY s.tax_id;`,
    hint: 'First give every row a completeness score: each "column IS NOT NULL" test is worth 1. The row to keep is then the one that no other row with the same tax_id beats on (score, id).',
    explanation:
      "Deduplicating by a quality rule has two steps: score every row, then keep the best row per key. In SQLite a comparison evaluates to 1 or 0, so `(phone IS NOT NULL) + (email IS NOT NULL) + (website IS NOT NULL)` is the number of filled-in columns; in other engines write three `CASE WHEN ... THEN 1 ELSE 0 END` terms. Put the score in a CTE so it can be used twice. The survivor is the row for which no other row with the same `tax_id` has a higher score, or the same score and a higher `id`; since ids are unique this leaves exactly one row per group, including groups of one. `MAX(id)` per `tax_id` is the tempting shortcut and keeps the newest row even when it is the emptiest. Note that `MAX(filled)` and `MAX(id)` taken separately may describe two different rows. `ROW_NUMBER() OVER (PARTITION BY tax_id ORDER BY filled DESC, id DESC)` is the window-function way to write the same choice.",
  },

  // ===== Joins & Modelling =====
  {
    id: 'sql-passed-every-mandatory-module',
    number: 118,
    title: 'Trainees Who Passed Every Mandatory Module',
    difficulty: 'Hard',
    topic: 'Joins & Modelling',
    statement:
      "`trainees` has `id` and `name`. `modules` has `id`, `title` and `mandatory` (1 or 0). `attempts` has `id`, `trainee_id`, `module_id` and `passed` (1 or 0); a trainee may attempt a module any number of times, and has passed it once **any** of those attempts has `passed = 1`.\n\nReturn `id` and `name` of every trainee who has passed **all** the mandatory modules. Optional modules are irrelevant. If no module is mandatory, every trainee qualifies. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE trainees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE modules (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  mandatory INTEGER NOT NULL
);
CREATE TABLE attempts (
  id INTEGER PRIMARY KEY,
  trainee_id INTEGER NOT NULL,
  module_id INTEGER NOT NULL,
  passed INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO trainees VALUES
  (1, 'Rosa'),
  (2, 'Tariq'),
  (3, 'Uma'),
  (4, 'Viktor'),
  (5, 'Wren');
INSERT INTO modules VALUES
  (1, 'Fire safety', 1),
  (2, 'Data privacy', 1),
  (3, 'First aid', 1),
  (4, 'Public speaking', 0);
INSERT INTO attempts VALUES
  (1, 1, 1, 1),
  (2, 1, 2, 0),
  (3, 1, 2, 1),
  (4, 1, 3, 1),
  (5, 2, 1, 1),
  (6, 2, 1, 1),
  (7, 2, 2, 1),
  (8, 2, 4, 1),
  (9, 3, 1, 1),
  (10, 3, 2, 1),
  (11, 3, 3, 0),
  (12, 5, 1, 1),
  (13, 5, 2, 1),
  (14, 5, 3, 1),
  (15, 5, 4, 1);`,
      `INSERT INTO trainees VALUES
  (1, 'Anouk'),
  (2, 'Bashir');
INSERT INTO modules VALUES
  (1, 'Team lunch etiquette', 0);
INSERT INTO attempts VALUES
  (1, 1, 1, 1);`,
      `INSERT INTO trainees VALUES
  (1, 'Cato'),
  (2, 'Dara'),
  (3, 'Emeka');
INSERT INTO modules VALUES
  (7, 'Core induction', 1),
  (8, 'Extra credit', 0);
INSERT INTO attempts VALUES
  (1, 1, 8, 1),
  (2, 2, 7, 0),
  (3, 2, 7, 0),
  (4, 3, 7, 0),
  (5, 3, 7, 1);`,
    ],
    ordered: true,
    solution: `SELECT t.id, t.name
FROM trainees t
WHERE NOT EXISTS (
  SELECT 1
  FROM modules m
  WHERE m.mandatory = 1
    AND NOT EXISTS (
      SELECT 1
      FROM attempts a
      WHERE a.trainee_id = t.id
        AND a.module_id = m.id
        AND a.passed = 1
    )
)
ORDER BY t.id;`,
    hint: 'Turn "passed every mandatory module" around: there is no mandatory module that this trainee has not passed. That is one NOT EXISTS inside another.',
    explanation:
      "SQL has no \"for all\" operator, so \"passed every mandatory module\" is written as its double negative: there is **no** mandatory module for which there is **no** passing attempt by this trainee. The outer `NOT EXISTS` walks the mandatory modules and the inner one looks for a passing attempt. This form is immune to the things that break counting: retakes cannot be counted twice, failed attempts and optional modules never match, and when no module is mandatory the outer subquery is empty, so every trainee qualifies, as logic says they should. The counting alternative compares `COUNT(DISTINCT module_id)` over passed mandatory attempts with the number of mandatory modules. It needs the DISTINCT (two passes of one module must not make up for a missing one), the filters on both `passed` and `mandatory`, and a LEFT JOIN from `trainees` so that 0 = 0 still holds in the empty case; an inner-join version returns nobody there.",
  },
  {
    id: 'sql-kits-with-identical-contents',
    number: 119,
    title: 'Repair Kits With Identical Contents',
    difficulty: 'Hard',
    topic: 'Joins & Modelling',
    statement:
      "`kit_parts` lists what each repair kit contains, one row per (`kit`, `part`); a part appears at most once in a kit, and every kit has at least one part.\n\nFind the kits that are really the same product under two names: pairs of kits containing **exactly the same set of parts**, nothing missing and nothing extra on either side. Return `kit_a`, `kit_b` and `parts` (the number of parts they share, which is the size of both kits), with `kit_a` < `kit_b` so each pair appears once. Rows ordered by `kit_a` ascending, then `kit_b` ascending.",
    schema: `CREATE TABLE kit_parts (
  kit TEXT NOT NULL,
  part TEXT NOT NULL,
  PRIMARY KEY (kit, part)
);`,
    datasets: [
      `INSERT INTO kit_parts VALUES
  ('K1', 'bolt'), ('K1', 'nut'), ('K1', 'washer'),
  ('K2', 'bolt'), ('K2', 'nut'),
  ('K3', 'washer'), ('K3', 'nut'), ('K3', 'bolt'),
  ('K4', 'bolt'), ('K4', 'nut'), ('K4', 'gasket'),
  ('K5', 'nut'), ('K5', 'bolt'),
  ('K6', 'seal');`,
      `INSERT INTO kit_parts VALUES
  ('A', 'fuse'),
  ('B', 'clip'),
  ('C', 'fuse'), ('C', 'clip');`,
      `INSERT INTO kit_parts VALUES
  ('P', 'tube'), ('P', 'patch'),
  ('Q', 'tube'), ('Q', 'patch'),
  ('R', 'patch'), ('R', 'tube'),
  ('S', 'tube');`,
    ],
    ordered: true,
    solution: `WITH sizes AS (
  SELECT kit, COUNT(*) AS n
  FROM kit_parts
  GROUP BY kit
)
SELECT a.kit AS kit_a, b.kit AS kit_b, COUNT(*) AS parts
FROM kit_parts a
JOIN kit_parts b ON b.part = a.part AND a.kit < b.kit
JOIN sizes sa ON sa.kit = a.kit
JOIN sizes sb ON sb.kit = b.kit
GROUP BY a.kit, b.kit, sa.n, sb.n
HAVING COUNT(*) = sa.n AND COUNT(*) = sb.n
ORDER BY kit_a, kit_b;`,
    hint: 'Self-join on part to count how many parts two kits have in common. Two sets are equal when that overlap is as large as the first kit and as large as the second.',
    explanation:
      "Set equality can be reduced to three numbers. Joining `kit_parts` to itself on `part` yields one row per part that two kits share, so `COUNT(*)` per pair is the size of their overlap. If the overlap equals the size of kit A, everything in A is also in B; if it equals the size of B as well, nothing in B is missing from A, and the sets are identical. Checking only one side accepts a kit that is a subset of a bigger one, and comparing just the two sizes accepts any kits that happen to have the same number of parts. The counts are trustworthy because the primary key forbids duplicate (kit, part) rows. The alternative is two `NOT EXISTS` tests (no part of A missing from B, and the reverse), which reads closer to the definition but compares every pair of kits; the join only looks at pairs that share at least one part.",
  },

  // ===== Billing & Ledgers =====
  {
    id: 'sql-normal-side-account-balances',
    number: 120,
    title: 'Account Balances on Their Normal Side',
    difficulty: 'Medium',
    topic: 'Billing & Ledgers',
    statement:
      "A small general ledger has `accounts` (`id`, `name`, `kind`) and `postings` (`id`, `account_id`, `debit_cents`, `credit_cents`; one of the two amounts is 0 on each posting). `kind` is one of `'asset'`, `'expense'`, `'liability'`, `'equity'` or `'income'`.\n\nAsset and expense accounts normally carry a debit balance, so their balance is total debits minus total credits. For liability, equity and income accounts it is the other way round: total credits minus total debits.\n\nReturn `id`, `name`, `kind` and `balance_cents` for **every** account, with 0 for an account that has no postings. A balance on the wrong side shows up as a negative number. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL
);
CREATE TABLE postings (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  debit_cents INTEGER NOT NULL,
  credit_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO accounts VALUES
  (1, 'Cash', 'asset'),
  (2, 'Loans payable', 'liability'),
  (3, 'Sales', 'income'),
  (4, 'Rent', 'expense'),
  (5, 'Owner capital', 'equity'),
  (6, 'Equipment', 'asset');
INSERT INTO postings VALUES
  (1, 1, 500000, 0),
  (2, 5, 0, 500000),
  (3, 1, 0, 120000),
  (4, 4, 120000, 0),
  (5, 1, 80000, 0),
  (6, 3, 0, 80000),
  (7, 1, 200000, 0),
  (8, 2, 0, 200000),
  (9, 2, 50000, 0),
  (10, 1, 0, 50000);`,
      `INSERT INTO accounts VALUES
  (1, 'Bank', 'asset'),
  (2, 'Service revenue', 'income');
INSERT INTO postings VALUES
  (1, 2, 3000, 0),
  (2, 1, 0, 3000);`,
      `INSERT INTO accounts VALUES
  (1, 'Supplies', 'expense'),
  (2, 'Accounts payable', 'liability'),
  (3, 'Reserves', 'equity');
INSERT INTO postings VALUES
  (1, 1, 700, 0),
  (2, 2, 0, 700),
  (3, 1, 300, 0),
  (4, 2, 0, 300),
  (5, 2, 1000, 0);`,
    ],
    ordered: true,
    solution: `SELECT a.id,
       a.name,
       a.kind,
       COALESCE(SUM(
         CASE
           WHEN a.kind IN ('asset', 'expense') THEN p.debit_cents - p.credit_cents
           ELSE p.credit_cents - p.debit_cents
         END
       ), 0) AS balance_cents
FROM accounts a
LEFT JOIN postings p ON p.account_id = a.id
GROUP BY a.id, a.name, a.kind
ORDER BY a.id;`,
    hint: 'Give each posting a sign that depends on the kind of its account (a CASE inside the SUM), and start from accounts so that the ones without postings are kept.',
    explanation:
      "In double-entry bookkeeping the meaning of a debit depends on the account: it increases assets and expenses and decreases liabilities, equity and income. A balance report therefore signs each posting according to its account's kind, which is a `CASE` inside the `SUM`: debit minus credit for the debit-normal kinds, credit minus debit for the others. Using debit minus credit everywhere shows every liability and all income as negative numbers. The second requirement is completeness. An account with no postings must still be listed, so `accounts` drives a `LEFT JOIN`, and because the SUM over its single NULL-padded row is NULL, `COALESCE(..., 0)` supplies the zero. Amounts are whole cents in integer columns, so there are no rounding issues to worry about.",
  },
  {
    id: 'sql-bank-vs-ledger-reconciliation',
    number: 121,
    title: 'Reconcile the Bank Feed Against the Ledger',
    difficulty: 'Hard',
    topic: 'Billing & Ledgers',
    statement:
      "`bank_lines` (`id`, `ref`, `amount_cents`) is what the bank says happened; `ledger_entries` (`id`, `ref`, `amount_cents`) is what the books say. Rows are matched on `ref`. A ref can appear on several rows on either side (a payment that arrived in two parts, an entry that was split), so compare the **total** per ref on each side. Amounts can be negative.\n\nReturn only the refs that do not reconcile: `ref`, `bank_cents` (the bank total, or NULL if the ref has no bank rows at all), `ledger_cents` (likewise for the ledger) and `status`:\n\n- `'missing in ledger'` when the ref has bank rows but no ledger rows;\n- `'missing in bank'` when it has ledger rows but no bank rows;\n- `'amount mismatch'` when it is on both sides and the totals differ.\n\nA ref whose rows on one side net to 0 is still present on that side. Refs whose totals agree are left out. Rows ordered by `ref` ascending.",
    schema: `CREATE TABLE bank_lines (
  id INTEGER PRIMARY KEY,
  ref TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);
CREATE TABLE ledger_entries (
  id INTEGER PRIMARY KEY,
  ref TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO bank_lines VALUES
  (1, 'INV-101', 25000),
  (2, 'INV-102', 6000),
  (3, 'INV-102', 4000),
  (4, 'INV-103', 9900),
  (5, 'FEE-07', -1500),
  (6, 'INV-105', 7000);
INSERT INTO ledger_entries VALUES
  (1, 'INV-101', 25000),
  (2, 'INV-102', 10000),
  (3, 'INV-103', 9000),
  (4, 'INV-104', 3000),
  (5, 'INV-105', 3500),
  (6, 'INV-105', 3500);`,
      `INSERT INTO bank_lines VALUES
  (1, 'A', 50),
  (2, 'A', 50),
  (3, 'B', 10);
INSERT INTO ledger_entries VALUES
  (1, 'A', 100),
  (2, 'B', 5),
  (3, 'B', 5);`,
      `INSERT INTO bank_lines VALUES
  (1, 'R1', 500),
  (2, 'R1', -500),
  (3, 'R2', 40);
INSERT INTO ledger_entries VALUES
  (1, 'R3', 0),
  (2, 'R2', 40),
  (3, 'R2', 1);`,
    ],
    ordered: true,
    solution: `WITH bank AS (
  SELECT ref, SUM(amount_cents) AS cents
  FROM bank_lines
  GROUP BY ref
),
ledger AS (
  SELECT ref, SUM(amount_cents) AS cents
  FROM ledger_entries
  GROUP BY ref
),
refs AS (
  SELECT ref FROM bank
  UNION
  SELECT ref FROM ledger
)
SELECT r.ref,
       b.cents AS bank_cents,
       l.cents AS ledger_cents,
       CASE
         WHEN l.ref IS NULL THEN 'missing in ledger'
         WHEN b.ref IS NULL THEN 'missing in bank'
         ELSE 'amount mismatch'
       END AS status
FROM refs r
LEFT JOIN bank b ON b.ref = r.ref
LEFT JOIN ledger l ON l.ref = r.ref
WHERE b.ref IS NULL OR l.ref IS NULL OR b.cents <> l.cents
ORDER BY r.ref;`,
    hint: 'Total each side per ref first. Then you need every ref from either side: build that list with UNION and LEFT JOIN both totals onto it.',
    explanation:
      "A reconciliation is a full outer join between two summaries. Step one is to summarise: each side is grouped to one row per `ref`, because comparing raw rows flags a 6000 + 4000 bank pair against a single 10000 ledger entry even though they agree. Step two is to keep refs from both sides. A LEFT JOIN from the bank can never report something the bank has not seen, so build the spine yourself: `UNION` the refs of both summaries and LEFT JOIN each summary onto it (a `FULL OUTER JOIN` does this in one step where it is available). Step three is the three-way classification, and it has to test for presence with `IS NULL` on the join key, not on the total: `b.cents <> l.cents` is unknown when one side is missing, and a side that nets to 0 is present, not missing. Treating a missing side as 0 with COALESCE hides exactly that case. The work is two grouped scans plus a join on the distinct refs.",
  },

  // ===== Operational Reports =====
  {
    id: 'sql-max-buildable-units',
    number: 122,
    title: 'How Many Units Can Be Assembled',
    difficulty: 'Medium',
    topic: 'Operational Reports',
    statement:
      "`bom` is a bill of materials: `product`, `part` and `qty_per_unit` (how many of that part one unit of the product needs, always at least 1; one row per product and part). `stock` has `part` (unique) and `on_hand` (0 or more). A part that has never been stocked has **no row** in `stock`, which means none on hand.\n\nFor each product return `product` and `buildable`: the largest number of complete units that could be assembled from current stock, looking at each product on its own (products do not compete for parts). Whole units only.\n\nRows ordered by `buildable` descending, then `product` ascending.",
    schema: `CREATE TABLE bom (
  product TEXT NOT NULL,
  part TEXT NOT NULL,
  qty_per_unit INTEGER NOT NULL,
  PRIMARY KEY (product, part)
);
CREATE TABLE stock (
  part TEXT PRIMARY KEY,
  on_hand INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO bom VALUES
  ('Bookshelf', 'plank', 5),
  ('Bookshelf', 'screw', 20),
  ('Bookshelf', 'bracket', 4),
  ('Stool', 'leg', 3),
  ('Stool', 'seat', 1),
  ('Stool', 'screw', 6),
  ('Planter', 'plank', 2),
  ('Planter', 'liner', 1),
  ('Coat rack', 'hook', 5),
  ('Coat rack', 'plank', 1);
INSERT INTO stock VALUES
  ('plank', 23),
  ('screw', 100),
  ('bracket', 18),
  ('leg', 14),
  ('seat', 9),
  ('hook', 4);`,
      `INSERT INTO bom VALUES
  ('Kite', 'spar', 2),
  ('Kite', 'sail', 1);
INSERT INTO stock VALUES
  ('rope', 10);`,
      `INSERT INTO bom VALUES
  ('Amp', 'valve', 1),
  ('Boombox', 'valve', 3),
  ('Boombox', 'speaker', 2),
  ('Cabinet', 'speaker', 7);
INSERT INTO stock VALUES
  ('valve', 9),
  ('speaker', 6),
  ('grille', 0);`,
    ],
    ordered: true,
    solution: `SELECT b.product,
       MIN(COALESCE(s.on_hand, 0) / b.qty_per_unit) AS buildable
FROM bom b
LEFT JOIN stock s ON s.part = b.part
GROUP BY b.product
ORDER BY buildable DESC, b.product;`,
    hint: 'Each part on its own allows on_hand / qty_per_unit whole units. The product is limited by its scarcest part, and a part with no stock row allows zero.',
    explanation:
      "The number of units you can build is set by the bottleneck part. Each part alone supports `on_hand / qty_per_unit` units, and with two integers SQLite's `/` already truncates to whole units; the product can be built as many times as its *worst* part allows, so take the `MIN` across its parts. The trap is the part that is not in `stock` at all. An inner join drops that BOM line, and so does a LEFT JOIN without COALESCE, because `MIN` ignores the NULL: either way the missing part stops limiting anything and the report promises units that cannot be built. `COALESCE(s.on_hand, 0)` makes the absent part count as zero, which correctly drags the minimum to 0. Dividing the summed stock by the summed requirement is not a shortcut, since a surplus of screws cannot stand in for a missing plank.",
  },
  {
    id: 'sql-stock-on-hand-from-movements',
    number: 123,
    title: 'Stock on Hand From the Movement Log',
    difficulty: 'Medium',
    topic: 'Operational Reports',
    statement:
      "A warehouse system keeps no stock table, only a log. `movements` has `id`, `sku`, `from_wh`, `to_wh` and `qty` (always positive):\n\n- `from_wh` NULL: goods received from a supplier into `to_wh`;\n- `to_wh` NULL: goods shipped out of `from_wh` to a customer;\n- both set: a transfer, which leaves `from_wh` and arrives in `to_wh`.\n\nReturn the current stock as `warehouse`, `sku`, `on_hand` for every warehouse-and-SKU combination whose `on_hand` is not 0. Combinations that net to exactly 0 are left out; a negative figure (more left than ever arrived) is a data problem and must be shown. Rows ordered by `warehouse` ascending, then `sku` ascending.",
    schema: `CREATE TABLE movements (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL,
  from_wh TEXT,
  to_wh TEXT,
  qty INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO movements VALUES
  (1, 'TEA-01', NULL, 'North', 100),
  (2, 'TEA-01', 'North', 'South', 30),
  (3, 'TEA-01', 'North', NULL, 20),
  (4, 'MUG-07', NULL, 'South', 12),
  (5, 'MUG-07', 'South', NULL, 12),
  (6, 'TEA-01', 'South', NULL, 5),
  (7, 'JAR-03', NULL, 'North', 40),
  (8, 'JAR-03', 'North', 'South', 40),
  (9, 'TEA-01', 'North', NULL, 20);`,
      `INSERT INTO movements VALUES
  (1, 'X', NULL, 'W1', 5),
  (2, 'X', 'W1', NULL, 8),
  (3, 'Y', 'W2', 'W1', 3);`,
      `INSERT INTO movements VALUES
  (1, 'A', NULL, 'East', 10),
  (2, 'A', NULL, 'East', 10),
  (3, 'A', 'East', 'West', 10),
  (4, 'A', 'East', 'West', 10),
  (5, 'B', NULL, 'West', 1);`,
    ],
    ordered: true,
    solution: `WITH legs AS (
  SELECT to_wh AS warehouse, sku, qty
  FROM movements
  WHERE to_wh IS NOT NULL
  UNION ALL
  SELECT from_wh, sku, -qty
  FROM movements
  WHERE from_wh IS NOT NULL
)
SELECT warehouse, sku, SUM(qty) AS on_hand
FROM legs
GROUP BY warehouse, sku
HAVING SUM(qty) <> 0
ORDER BY warehouse, sku;`,
    hint: 'One movement can touch two warehouses. Turn every movement into an "in" row for to_wh and an "out" row (negative quantity) for from_wh, stack the two sets, then sum.',
    explanation:
      "Each movement row has up to two effects, +qty at the destination and -qty at the source, and a GROUP BY can only bucket a row under one key. So unpivot first: one SELECT emits the inbound leg for every row with a `to_wh`, another emits the outbound leg with a negated quantity for every row with a `from_wh`, and `UNION ALL` stacks them. A transfer contributes to both, a receipt or shipment to one. After that the stock level is a plain `SUM` per (warehouse, sku), and `HAVING SUM(qty) <> 0` removes the combinations that have netted out. It must be `UNION ALL`: plain `UNION` removes duplicate rows, and two separate shipments of 20 of the same SKU from the same warehouse are identical as legs, so one would silently vanish. Counting only inbound legs gives total receipts, not stock.",
  },

  // ===== Query Rewrites =====
  {
    id: 'sql-surgery-count-zeros-kept',
    number: 124,
    title: 'Surgery Count per Vet, Zeros Kept',
    difficulty: 'Medium',
    topic: 'Query Rewrites',
    statement:
      "`vets` has `id` and `name` (unique). `appointments` has `id`, `vet_id`, `kind` (`'surgery'`, `'checkup'`, `'vaccination'`, ...) and `day`.\n\nThe rota report is meant to list every vet with their number of surgeries, but this query loses vets:\n\n```\nSELECT v.name, COUNT(a.id) AS surgeries\nFROM vets v\nLEFT JOIN appointments a ON a.vet_id = v.id\nWHERE a.kind = 'surgery'\nGROUP BY v.id, v.name\n```\n\nFix it. Return `name` and `surgeries` for **every** vet, with 0 for a vet who has no surgery appointments (whether they have other appointments or none at all). Rows ordered by `surgeries` descending, then `name` ascending.",
    schema: `CREATE TABLE vets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY,
  vet_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  day TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO vets VALUES
  (1, 'Dr. Amara'),
  (2, 'Dr. Bose'),
  (3, 'Dr. Castillo'),
  (4, 'Dr. Duval');
INSERT INTO appointments VALUES
  (1, 1, 'surgery', '2024-06-03'),
  (2, 1, 'checkup', '2024-06-03'),
  (3, 1, 'surgery', '2024-06-04'),
  (4, 2, 'checkup', '2024-06-04'),
  (5, 2, 'vaccination', '2024-06-05'),
  (6, 3, 'surgery', '2024-06-05'),
  (7, 1, 'surgery', '2024-06-06');`,
      `INSERT INTO vets VALUES
  (1, 'Dr. Xu'),
  (2, 'Dr. Yilmaz');`,
      `INSERT INTO vets VALUES
  (5, 'Dr. Zhou'),
  (6, 'Dr. Abara');
INSERT INTO appointments VALUES
  (1, 5, 'surgery', '2024-07-01'),
  (2, 6, 'surgery', '2024-07-01'),
  (3, 6, 'checkup', '2024-07-02');`,
    ],
    ordered: true,
    solution: `SELECT v.name, COUNT(a.id) AS surgeries
FROM vets v
LEFT JOIN appointments a
  ON a.vet_id = v.id
 AND a.kind = 'surgery'
GROUP BY v.id, v.name
ORDER BY surgeries DESC, v.name;`,
    hint: 'WHERE runs after the join. What is a.kind on the row of a vet who matched nothing? Decide whether the filter restricts which appointments are joined, or which result rows are kept.',
    explanation:
      "A `LEFT JOIN` keeps unmatched left rows by filling the right side with NULLs, and `WHERE` runs after that. For a vet with no appointments `a.kind` is NULL, `NULL = 'surgery'` is not true, and the row the LEFT JOIN preserved is thrown away again: a filter on the right table in WHERE quietly turns the outer join into an inner join. A condition that describes *which right rows may match* belongs in `ON`; then a vet with no matching surgery keeps a NULL-padded row and `COUNT(a.id)` counts it as 0. Patching the WHERE with `OR a.kind IS NULL` only rescues vets with no appointments at all, since a vet who has only check-ups has real rows that still fail the filter. And once the condition is in ON, `COUNT(*)` would be wrong, because it counts the padded row as a surgery. `SUM(CASE WHEN a.kind = 'surgery' THEN 1 ELSE 0 END)` over the unfiltered join is an equivalent fix.",
  },
  {
    id: 'sql-march-events-half-open',
    number: 125,
    title: 'All of March, Including the Last Evening',
    difficulty: 'Easy',
    topic: 'Query Rewrites',
    statement:
      "`events` has `id`, `kind` and `created_at`, a timestamp stored as text in the form `YYYY-MM-DD HH:MM:SS`.\n\nThe monthly export uses\n\n```\nSELECT id, kind, created_at FROM events\nWHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'\n```\n\nand finance noticed that nothing from 31 March ever shows up. Rewrite the filter so the query returns `id`, `kind` and `created_at` of **every** event in March 2024, from the first second of 1 March to the last second of 31 March, and nothing from any other month. Rows ordered by `created_at` ascending, then `id` ascending.",
    schema: `CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL,
  created_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO events VALUES
  (1, 'signup', '2024-02-29 23:59:59'),
  (2, 'signup', '2024-03-01 00:00:00'),
  (3, 'purchase', '2024-03-15 12:30:00'),
  (4, 'purchase', '2024-03-31 00:00:00'),
  (5, 'refund', '2024-03-31 18:20:00'),
  (6, 'signup', '2024-03-31 23:59:30'),
  (7, 'signup', '2024-04-01 00:00:00'),
  (8, 'purchase', '2023-03-10 09:00:00'),
  (9, 'refund', '2024-03-15 12:30:00');`,
      `INSERT INTO events VALUES
  (1, 'login', '2024-03-31 23:59:59'),
  (3, 'logout', '2024-03-31 23:59:59'),
  (2, 'login', '2024-03-01 00:00:01');`,
      `INSERT INTO events VALUES
  (1, 'signup', '2024-04-01 00:00:00'),
  (2, 'purchase', '2024-04-02 10:00:00'),
  (3, 'refund', '2024-03-02 10:00:00'),
  (4, 'signup', '2025-03-05 08:00:00');`,
    ],
    ordered: true,
    solution: `SELECT id, kind, created_at
FROM events
WHERE created_at >= '2024-03-01'
  AND created_at < '2024-04-01'
ORDER BY created_at, id;`,
    hint: "The timestamps are compared as text. Is '2024-03-31 18:20:00' less than or equal to '2024-03-31'? Try an upper bound that is excluded instead of included.",
    explanation:
      "The upper bound `'2024-03-31'` is a date being compared with timestamps. As text, `'2024-03-31 18:20:00'` is longer than `'2024-03-31'` and therefore sorts after it, so every event on the 31st falls outside the BETWEEN; engines with a real timestamp type have the same bug, because the bare date is read as midnight at the start of the day. Stretching the bound to 23:59:59 works until sub-second precision arrives, and `BETWEEN ... AND '2024-04-01 00:00:00'` lets in an event at exactly midnight on 1 April, because BETWEEN includes both ends. The robust form is a half-open range: at or after the first instant of the month and strictly before the first instant of the next. It needs no knowledge of how long the month is or how precise the timestamps are, consecutive ranges never overlap or leave gaps, and unlike wrapping the column in `strftime` or `substr` it can still use an index on `created_at`.",
  },
];
