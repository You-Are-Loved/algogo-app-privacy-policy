// SQL Categories — comprehensive SQL interview prep.
// Mirrors the iosCategories.ts structure: 7 subcategories, each with
// learnContent, visualizations, flashcards, quizQuestions. First two
// subcategories are free; the rest gate behind Pro.

import { Category } from '../types';

export type SQLCategory = Category;

// =============================================================================
// 1. SQL FUNDAMENTALS (free)
// =============================================================================
const sqlFundamentals: SQLCategory = {
  id: 'sql-fundamentals',
  name: 'SQL Fundamentals',
  slug: 'sql-fundamentals',
  description: 'SELECT, WHERE, ORDER BY, NULL handling, and core SQL syntax',
  icon: 'code-slash-outline',
  color: '#336791',
  colorDark: '#1F4D6D',

  learnContent: [
    {
      id: 'sql-fund-1',
      title: 'SELECT and Query Order',
      content: `SQL is declarative — you describe what you want, not how to fetch it. Every query revolves around the **SELECT** statement.

**Logical execution order** (different from the order you write it):
1. \`FROM\` and \`JOIN\` — assemble the source tables
2. \`WHERE\` — filter rows
3. \`GROUP BY\` — bucket rows
4. \`HAVING\` — filter buckets
5. \`SELECT\` — project columns
6. \`DISTINCT\` — remove duplicates
7. \`ORDER BY\` — sort
8. \`LIMIT\` / \`OFFSET\` — paginate

This is why column aliases defined in \`SELECT\` work in \`ORDER BY\` but not in \`WHERE\` — \`WHERE\` runs first.

**Quoting:**
- Single quotes for strings: \`'alice'\`
- Double quotes for identifiers in standard SQL: \`"User Name"\` (MySQL uses backticks)
- Always use single quotes for literals — double quotes will treat the value as a column name in Postgres.`,
      codeExample: `-- Basic projection and filter
SELECT id, name, email
FROM users
WHERE country = 'US'
  AND created_at >= '2026-01-01'
ORDER BY created_at DESC
LIMIT 20;

-- Alias columns and tables
SELECT u.id            AS user_id,
       u.name          AS full_name,
       COUNT(o.id)     AS order_count
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY order_count DESC;

-- LIMIT/OFFSET for pagination (page 3, 20 per page)
SELECT * FROM products
ORDER BY id
LIMIT 20 OFFSET 40;`,
    },
    {
      id: 'sql-fund-2',
      title: 'WHERE, Operators, and Pattern Matching',
      content: `\`WHERE\` filters rows before grouping. Use the right operator for the right job.

**Comparison operators:** \`=\`, \`<>\` (or \`!=\`), \`<\`, \`<=\`, \`>\`, \`>=\`.

**Set membership:** \`IN (...)\` is shorthand for many \`OR\` conditions. \`BETWEEN a AND b\` is inclusive on both ends.

**Pattern matching with LIKE:**
- \`%\` matches zero or more characters
- \`_\` matches exactly one character
- Use \`ILIKE\` in Postgres for case-insensitive matching
- \`LIKE 'foo%'\` can use an index; \`LIKE '%foo'\` cannot

**Boolean composition:**
- \`AND\` binds tighter than \`OR\` — wrap with parentheses when in doubt.
- \`NOT\` negates the next condition.

**Common gotcha — three-valued logic:**
SQL treats NULL as "unknown". \`x = NULL\` is always NULL, never true. Use \`IS NULL\` / \`IS NOT NULL\` instead.`,
      codeExample: `-- Multiple conditions
SELECT * FROM orders
WHERE status IN ('paid', 'shipped')
  AND total BETWEEN 50 AND 500
  AND placed_at >= NOW() - INTERVAL '30 days';

-- Pattern matching
SELECT * FROM users
WHERE email ILIKE '%@gmail.com'   -- case-insensitive
  AND name LIKE 'A_dr%';          -- "A", any char, "dr", anything

-- NULL handling
SELECT * FROM employees
WHERE manager_id IS NULL;          -- correct

-- NOT IN with NULL is a footgun
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM blocked);
-- ↑ if blocked.user_id has any NULL, this returns NO rows.
-- Use NOT EXISTS instead.`,
    },
    {
      id: 'sql-fund-3',
      title: 'NULL Semantics',
      content: `NULL is the trickiest concept in SQL because it represents the absence of a value, not zero or empty string.

**Key rules:**
- Any arithmetic with NULL yields NULL: \`5 + NULL = NULL\`
- Any comparison with NULL yields NULL (treated as false in WHERE)
- Aggregates **skip** NULLs — \`AVG(salary)\` ignores rows where salary is NULL
- \`COUNT(*)\` counts every row; \`COUNT(column)\` skips NULLs in that column

**Coalescing:**
\`COALESCE(a, b, c, ...)\` returns the first non-NULL value. Use it to provide defaults.

**NULLIF:**
\`NULLIF(a, b)\` returns NULL if \`a = b\`, else \`a\`. Handy for converting sentinel values like 0 or '' back to NULL.

**Sorting:** NULL sorts last in ASC and first in DESC by default (Postgres). Use \`NULLS FIRST\` / \`NULLS LAST\` to override.`,
      codeExample: `-- Provide a default
SELECT name, COALESCE(nickname, name) AS display_name
FROM users;

-- Avoid divide-by-zero by nulling out the divisor
SELECT total / NULLIF(quantity, 0) AS unit_price
FROM order_items;

-- Aggregates skip NULL
SELECT
  COUNT(*)            AS total_rows,
  COUNT(phone)        AS rows_with_phone,
  AVG(salary)         AS avg_salary  -- NULL salaries excluded
FROM employees;

-- Explicit NULL ordering
SELECT name, score FROM players
ORDER BY score DESC NULLS LAST;`,
    },
    {
      id: 'sql-fund-4',
      title: 'CASE Expressions and Conditional Logic',
      content: `\`CASE\` is SQL's if/else expression. It evaluates to a single value and can appear anywhere a column reference can — in SELECT, WHERE, ORDER BY, GROUP BY, even inside aggregates.

**Two forms:**
- **Searched CASE** (most common): each WHEN has a full boolean expression.
- **Simple CASE**: matches a single expression against equality.

**Pivoting with CASE + SUM:**
The classic "rows-to-columns" trick. Sum a CASE expression that returns 1 when a condition holds, 0 otherwise — gets you per-bucket counts in a single row.

**Without ELSE**, unmatched rows return NULL.`,
      codeExample: `-- Bucket users by signup recency
SELECT id, name,
  CASE
    WHEN created_at >= NOW() - INTERVAL '7 days'  THEN 'new'
    WHEN created_at >= NOW() - INTERVAL '90 days' THEN 'recent'
    ELSE 'returning'
  END AS cohort
FROM users;

-- Simple CASE
SELECT name,
  CASE department
    WHEN 'eng'  THEN 'Engineering'
    WHEN 'mkt'  THEN 'Marketing'
    ELSE department
  END AS dept_label
FROM employees;

-- Pivot: order counts by status, in one row
SELECT
  SUM(CASE WHEN status = 'paid'      THEN 1 ELSE 0 END) AS paid_count,
  SUM(CASE WHEN status = 'shipped'   THEN 1 ELSE 0 END) AS shipped_count,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
FROM orders
WHERE placed_at >= '2026-01-01';`,
    },
    {
      id: 'sql-fund-5',
      title: 'INSERT, UPDATE, DELETE',
      content: `Data Manipulation Language (DML) is how rows change. Every interviewer expects you to know the safe patterns.

**INSERT:**
- Always list the columns explicitly: \`INSERT INTO t (a, b) VALUES (...)\`.
- Multi-row inserts are faster than one-at-a-time.
- \`INSERT ... RETURNING *\` (Postgres) returns the inserted rows — great for getting auto-generated IDs.

**UPDATE:**
- Always test the \`WHERE\` clause as a \`SELECT\` first.
- \`UPDATE\` without WHERE rewrites every row.
- \`UPDATE ... FROM\` (Postgres) joins to other tables.

**DELETE:**
- \`DELETE FROM t WHERE ...\` removes rows.
- \`TRUNCATE TABLE t\` is faster but skips per-row triggers and bypasses foreign-key cascades in some databases.

**Upsert:** \`INSERT ... ON CONFLICT ... DO UPDATE\` (Postgres) or \`INSERT ... ON DUPLICATE KEY UPDATE\` (MySQL). Atomic insert-or-update.`,
      codeExample: `-- Multi-row insert with returning
INSERT INTO users (name, email)
VALUES
  ('Alice', 'alice@example.com'),
  ('Bob',   'bob@example.com')
RETURNING id, created_at;

-- Update with a join (Postgres)
UPDATE orders o
SET status = 'shipped'
FROM shipments s
WHERE s.order_id = o.id
  AND s.shipped_at IS NOT NULL;

-- Safe delete pattern: SELECT first, then DELETE the same predicate
SELECT * FROM sessions WHERE expires_at < NOW();
DELETE FROM sessions WHERE expires_at < NOW();

-- Upsert (Postgres)
INSERT INTO inventory (sku, qty)
VALUES ('SKU-1', 5)
ON CONFLICT (sku) DO UPDATE
SET qty = inventory.qty + EXCLUDED.qty;`,
    },
    {
      id: 'sql-fund-6',
      title: 'Constraints and Data Integrity',
      content: `Constraints are rules the database enforces on every write so bad data never lands. They are the "C" in ACID — a statement that would violate one is rejected outright.

**The five you must know:**
- **PRIMARY KEY** — unique + NOT NULL, one per table. Identifies a row.
- **FOREIGN KEY** — the value must exist in the referenced table. Choose what happens on parent delete: \`ON DELETE CASCADE\` (delete children), \`SET NULL\`, or \`RESTRICT\` (refuse — the default).
- **UNIQUE** — no two rows share the value. Unlike a primary key, it allows NULLs, and in Postgres several NULLs coexist because NULL <> NULL.
- **CHECK** — an arbitrary boolean per row. A CHECK that evaluates to UNKNOWN (because of NULL) **passes** — it only rejects FALSE.
- **NOT NULL** — the value is required. Combine with \`DEFAULT\` for safe backfills.

**Why constraints beat app-level validation:** every writer — the app, a migration script, an analyst in psql — goes through the same gate. Race conditions that slip past "check then insert" in code are caught by UNIQUE atomically.

**Naming:** always name constraints (\`CONSTRAINT orders_total_positive CHECK (...)\`). Error messages and \`ALTER TABLE ... DROP CONSTRAINT\` become far easier.`,
      codeExample: `CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL
              REFERENCES users (id) ON DELETE CASCADE,
  status      TEXT   NOT NULL DEFAULT 'pending',
  total       NUMERIC(12, 2),
  coupon_code TEXT,

  CONSTRAINT orders_total_positive
    CHECK (total > 0),                     -- NULL total still passes
  CONSTRAINT orders_status_valid
    CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  CONSTRAINT orders_user_coupon_once
    UNIQUE (user_id, coupon_code)          -- many NULL coupons allowed
);

-- Add a constraint later; validate existing rows in the same step
ALTER TABLE orders
  ADD CONSTRAINT orders_total_max CHECK (total <= 1000000);

-- Deleting a user now removes their orders (CASCADE)
DELETE FROM users WHERE id = 42;

-- UNIQUE catches the race two app servers would miss
INSERT INTO users (email) VALUES ('a@x.com');
INSERT INTO users (email) VALUES ('a@x.com');  -- ERROR: duplicate key`,
    },
  ],

  visualizations: [
    {
      title: 'Logical Query Execution Order',
      description: 'The order SQL actually runs, not the order you write',
      nodes: [
        { id: 'from',     label: '1. FROM\n/ JOIN',    x: 60,  y: 40,  type: 'info' },
        { id: 'where',    label: '2. WHERE',           x: 200, y: 40,  type: 'primary' },
        { id: 'group',    label: '3. GROUP\nBY',       x: 60,  y: 120, type: 'secondary' },
        { id: 'having',   label: '4. HAVING',          x: 200, y: 120, type: 'secondary' },
        { id: 'select',   label: '5. SELECT',          x: 60,  y: 200, type: 'success' },
        { id: 'order',    label: '6. ORDER\nBY / LIMIT', x: 200, y: 200, type: 'warning' },
      ],
      edges: [
        { from: 'from',   to: 'where' },
        { from: 'where',  to: 'group' },
        { from: 'group',  to: 'having' },
        { from: 'having', to: 'select' },
        { from: 'select', to: 'order' },
      ],
    },
    {
      title: 'NULL Comparisons',
      description: 'Why x = NULL never returns true',
      nodes: [
        { id: 'val',   label: 'value = 5',       x: 60,  y: 50,  type: 'primary' },
        { id: 'cmp',   label: 'value = NULL?',   x: 220, y: 50,  type: 'warning' },
        { id: 'unk',   label: 'UNKNOWN\n(not true)', x: 220, y: 150, type: 'error' },
        { id: 'fix',   label: 'use IS NULL\nor IS NOT NULL', x: 60, y: 150, type: 'success' },
      ],
      edges: [
        { from: 'val', to: 'cmp' },
        { from: 'cmp', to: 'unk' },
        { from: 'unk', to: 'fix' },
      ],
    },
  ],

  flashcards: [
    { id: 'sf1',  front: 'What is the logical execution order of a SELECT?', back: 'FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. This is why aliases work in ORDER BY but not WHERE.' },
    { id: 'sf2',  front: 'Single quotes vs double quotes in SQL?', back: 'Single quotes for string literals (\'alice\'). Double quotes for identifiers ("User Name"). MySQL uses backticks for identifiers.' },
    { id: 'sf3',  front: 'Difference between WHERE and HAVING?', back: 'WHERE filters individual rows before grouping. HAVING filters groups after GROUP BY. WHERE cannot reference aggregates; HAVING can.' },
    { id: 'sf4',  front: 'What does LIKE \'foo%\' match? What about \'%foo\'?', back: '\'foo%\' matches anything starting with "foo" (can use an index). \'%foo\' matches anything ending in "foo" (cannot use a regular B-tree index).' },
    { id: 'sf5',  front: 'Why is x = NULL always false?', back: 'SQL uses three-valued logic. Any comparison with NULL yields UNKNOWN, which WHERE treats as not-true. Use IS NULL / IS NOT NULL instead.' },
    { id: 'sf6',  front: 'What does COALESCE do?', back: 'Returns the first non-NULL argument. COALESCE(a, b, c) is the SQL equivalent of "a ?? b ?? c".' },
    { id: 'sf7',  front: 'What does NULLIF(a, b) do?', back: 'Returns NULL when a equals b, otherwise returns a. Useful for converting sentinel values (0, \'\') back to NULL — e.g. avoiding divide-by-zero with NULLIF(qty, 0).' },
    { id: 'sf8',  front: 'Difference between COUNT(*) and COUNT(column)?', back: 'COUNT(*) counts every row. COUNT(column) counts rows where column IS NOT NULL.' },
    { id: 'sf9',  front: 'Why is NOT IN with NULL dangerous?', back: 'If the subquery returns any NULL, NOT IN returns no rows (because x <> NULL is UNKNOWN). Use NOT EXISTS instead for null-safety.' },
    { id: 'sf10', front: 'What does CASE return when no WHEN matches and there\'s no ELSE?', back: 'NULL. Always include an ELSE clause unless you intentionally want NULL for unmatched rows.' },
    { id: 'sf11', front: 'How do you sort NULLs last?', back: 'ORDER BY column DESC NULLS LAST (or NULLS FIRST). Default behavior varies by DB — Postgres puts NULLs last in ASC, first in DESC.' },
    { id: 'sf12', front: 'What does INSERT ... RETURNING do?', back: 'Postgres-only. Returns the inserted (or updated/deleted) rows in the same statement, so you can get auto-generated IDs without a second query.' },
    { id: 'sf13', front: 'What is an upsert?', back: 'Insert if the row doesn\'t exist, update if it does — atomically. Postgres: ON CONFLICT ... DO UPDATE. MySQL: ON DUPLICATE KEY UPDATE.' },
    { id: 'sf14', front: 'Difference between DELETE and TRUNCATE?', back: 'DELETE removes rows row-by-row, fires triggers, can be rolled back per-row. TRUNCATE drops all rows in one shot — faster but skips triggers and may bypass foreign-key cascades.' },
    { id: 'sf15', front: 'What\'s the DISTINCT keyword for?', back: 'Removes duplicate rows from the result. DISTINCT applies across all selected columns, not just the first one.' },
    { id: 'sf16', front: 'Is BETWEEN inclusive or exclusive?', back: 'Inclusive on both bounds. BETWEEN 1 AND 10 includes both 1 and 10. The two arguments must be in ascending order — BETWEEN 10 AND 1 returns nothing.' },
    { id: 'sf17', front: 'How does AND vs OR precedence work?', back: 'AND binds tighter than OR. `a OR b AND c` parses as `a OR (b AND c)`. Use parentheses to make intent explicit.' },
    { id: 'sf18', front: 'What does LIMIT 20 OFFSET 40 do?', back: 'Skip the first 40 rows, return the next 20. Standard pagination — equivalent to page 3 at 20 per page. Performance degrades on deep offsets; prefer keyset pagination for large lists.' },
    { id: 'sf19', front: 'Does `WHERE status <> \'paid\'` return rows whose status is NULL?', back: 'No. NULL <> \'paid\' is UNKNOWN, and NOT UNKNOWN is still UNKNOWN, so both `= \'paid\'` and `<> \'paid\'` drop NULL rows. Add `OR status IS NULL` if you want them.' },
    { id: 'sf20', front: 'What does IS DISTINCT FROM do?', back: 'A NULL-safe inequality: `a IS DISTINCT FROM b` is TRUE or FALSE, never UNKNOWN. Two NULLs are "not distinct". Use it (or IS NOT DISTINCT FROM) when comparing nullable columns.' },
    { id: 'sf21', front: 'UNION vs UNION ALL?', back: 'UNION removes duplicate rows (an extra sort/hash step). UNION ALL keeps everything and is faster. Reach for UNION ALL unless you specifically need de-duplication.' },
    { id: 'sf22', front: 'What do INTERSECT and EXCEPT do?', back: 'Set operators over two SELECTs with matching column lists. INTERSECT keeps rows present in both; EXCEPT keeps rows in the first but not the second. Both de-duplicate and treat NULLs as equal.' },
    { id: 'sf23', front: 'Why must a paginated ORDER BY include a unique tiebreaker?', back: 'If many rows share the sort value, their relative order is undefined and can change between queries — rows get skipped or repeated across pages. ORDER BY created_at, id makes the order stable.' },
    { id: 'sf24', front: 'How does DISTINCT treat NULL values?', back: 'All NULLs in the column collapse into a single NULL row — DISTINCT (like GROUP BY) treats NULLs as equal to each other, even though NULL = NULL is UNKNOWN in WHERE.' },
    { id: 'sf25', front: 'DATE_TRUNC vs EXTRACT — when do you use each?', back: 'DATE_TRUNC(\'month\', ts) rounds a timestamp down to the unit, ideal for grouping by month. EXTRACT(dow FROM ts) pulls one numeric field out — ideal for filtering by weekday or hour.' },
    { id: 'sf26', front: 'What does `first_name || \' \' || last_name` return when last_name is NULL?', back: 'NULL — the || operator propagates NULL like arithmetic does. CONCAT(first_name, \' \', last_name) treats NULL as an empty string, or wrap with COALESCE.' },
    { id: 'sf27', front: 'Why does `CASE col WHEN NULL THEN \'missing\' END` never fire?', back: 'A simple CASE compares with =, and col = NULL is UNKNOWN. Use the searched form: CASE WHEN col IS NULL THEN \'missing\' ... END.' },
    { id: 'sf28', front: 'Without ORDER BY, is the row order guaranteed?', back: 'No. The order is whatever the plan happened to produce — it can change after an index is added, a VACUUM runs, or a parallel plan kicks in. Always ORDER BY when order matters.' },
    { id: 'sf29', front: 'What does `SELECT 7 / 2` return in Postgres?', back: '3. Integer divided by integer performs integer division and truncates. Write 7 / 2.0 or 7::numeric / 2 to get 3.5.' },
    { id: 'sf30', front: 'PRIMARY KEY vs UNIQUE constraint?', back: 'Both enforce uniqueness via an index. A PRIMARY KEY also implies NOT NULL and there is only one per table. UNIQUE allows NULLs (multiple NULLs in Postgres) and a table can have many.' },
  ],

  quizQuestions: [
    {
      id: 'sfq1',
      question: 'Which of these clauses runs LAST in logical execution order?',
      options: ['WHERE', 'GROUP BY', 'SELECT', 'ORDER BY'],
      correctAnswer: 3,
      explanation: 'ORDER BY runs after SELECT, which is why you can sort by column aliases. Only LIMIT runs after ORDER BY.',
    },
    {
      id: 'sfq2',
      question: 'What does `WHERE email = NULL` return?',
      options: ['Rows where email is NULL', 'An error', 'No rows', 'All rows'],
      correctAnswer: 2,
      explanation: 'NULL comparisons return UNKNOWN, treated as not-true in WHERE. Use IS NULL to find NULLs.',
    },
    {
      id: 'sfq3',
      question: 'Which expression safely avoids divide-by-zero?',
      options: ['total / qty', 'total / COALESCE(qty, 1)', 'total / NULLIF(qty, 0)', 'CASE WHEN qty THEN total / qty END'],
      correctAnswer: 2,
      explanation: 'NULLIF(qty, 0) returns NULL when qty is 0, and dividing by NULL yields NULL — no error. COALESCE(qty,1) would silently change the math.',
    },
    {
      id: 'sfq4',
      question: 'What does COUNT(column) count?',
      options: ['Every row', 'Rows where column is unique', 'Rows where column IS NOT NULL', 'Rows where column = 1'],
      correctAnswer: 2,
      explanation: 'COUNT(col) skips NULLs in that column. Only COUNT(*) counts every row regardless of NULLs.',
    },
    {
      id: 'sfq5',
      question: 'Which LIKE pattern matches "interview", "internal", and "internet"?',
      options: ['%inter%', 'inter%', '_inter%', 'inter_%'],
      correctAnswer: 1,
      explanation: '`inter%` matches anything starting with "inter". Bonus: leading-anchored LIKE can use a B-tree index; %-prefix patterns cannot.',
    },
    {
      id: 'sfq6',
      question: 'You want page 5 at 25 results per page. What\'s the right LIMIT/OFFSET?',
      options: ['LIMIT 5 OFFSET 25', 'LIMIT 25 OFFSET 100', 'LIMIT 25 OFFSET 125', 'LIMIT 125 OFFSET 25'],
      correctAnswer: 1,
      explanation: 'Skip the first four pages (4×25 = 100), then take 25.',
    },
    {
      id: 'sfq7',
      question: 'What does this return: SELECT COALESCE(NULL, NULL, \'x\', \'y\')?',
      options: ['NULL', '\'x\'', '\'y\'', 'Error'],
      correctAnswer: 1,
      explanation: 'COALESCE returns the first non-NULL argument — \'x\' here. Remaining arguments are ignored.',
    },
    {
      id: 'sfq8',
      question: 'Which is the safest way to find users with no orders?',
      options: ['WHERE id NOT IN (SELECT user_id FROM orders)', 'WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)', 'WHERE id != ANY (SELECT user_id FROM orders)', 'WHERE id <> (SELECT user_id FROM orders)'],
      correctAnswer: 1,
      explanation: 'NOT EXISTS handles NULLs correctly. NOT IN returns zero rows if any user_id in orders is NULL.',
    },
    {
      id: 'sfq9',
      question: 'What does INSERT ... ON CONFLICT DO UPDATE achieve?',
      options: ['Inserts a duplicate row', 'Skips duplicates silently', 'Inserts if new, updates if a conflict exists (upsert)', 'Rolls back the transaction'],
      correctAnswer: 2,
      explanation: 'Postgres upsert syntax. Atomic insert-or-update keyed by a unique constraint.',
    },
    {
      id: 'sfq10',
      question: 'Which statement removes every row of a table fastest, ignoring per-row triggers?',
      options: ['DELETE FROM t', 'DROP TABLE t', 'TRUNCATE TABLE t', 'UPDATE t SET deleted = TRUE'],
      correctAnswer: 2,
      explanation: 'TRUNCATE is essentially a metadata operation — far faster than DELETE on large tables, but it skips triggers and may bypass cascading FK behavior.',
    },
    {
      id: 'sfq11',
      question: 'The `status` column has NULLs. What does `WHERE status <> \'paid\'` do with those rows?',
      options: ['Includes them, since NULL is not \'paid\'', 'Raises an error', 'Excludes them — the comparison is UNKNOWN', 'Includes them only with NOT IN'],
      correctAnswer: 2,
      explanation: 'NULL <> \'paid\' evaluates to UNKNOWN, which WHERE treats as not-true. Neither = nor <> ever matches a NULL; add OR status IS NULL explicitly.',
    },
    {
      id: 'sfq12',
      question: 'Why is UNION ALL usually faster than UNION?',
      options: ['It uses indexes', 'It skips the duplicate-removal step', 'It runs both queries in parallel', 'It returns fewer rows'],
      correctAnswer: 1,
      explanation: 'UNION must sort or hash the combined result to remove duplicates. UNION ALL simply appends the second result to the first.',
    },
    {
      id: 'sfq13',
      question: 'What does `SELECT \'Hello \' || NULL` return?',
      options: ['\'Hello \'', 'NULL', 'An error', '\'Hello NULL\''],
      correctAnswer: 1,
      explanation: 'The || operator propagates NULL — any NULL operand makes the whole result NULL. CONCAT() is the function that treats NULL as an empty string.',
    },
    {
      id: 'sfq14',
      question: 'You paginate with `ORDER BY created_at LIMIT 20 OFFSET 20`. Thousands of rows share the same created_at. What can go wrong?',
      options: ['Rows may be skipped or repeated across pages', 'The query errors on ties', 'OFFSET is ignored', 'Nothing — ORDER BY is deterministic'],
      correctAnswer: 0,
      explanation: 'Order among ties is undefined and can differ between executions. Add a unique tiebreaker: ORDER BY created_at, id.',
    },
    {
      id: 'sfq15',
      question: 'Which expression groups orders into calendar months for a monthly revenue report?',
      options: ['EXTRACT(month FROM placed_at)', 'placed_at::date', 'DATE_TRUNC(\'month\', placed_at)', 'TO_CHAR(placed_at, \'MM\')'],
      correctAnswer: 2,
      explanation: 'DATE_TRUNC keeps the year and rounds down to the first of the month. EXTRACT(month) returns just 1–12, which merges January 2025 with January 2026.',
    },
    {
      id: 'sfq16',
      question: 'A table has `CHECK (qty > 0)`. What happens when you insert a row with qty = NULL?',
      options: ['Rejected — NULL is not greater than 0', 'Rejected — CHECK implies NOT NULL', 'Accepted only with DEFAULT', 'Accepted — the CHECK evaluates to UNKNOWN, which passes'],
      correctAnswer: 3,
      explanation: 'CHECK constraints only reject rows where the expression is FALSE. NULL > 0 is UNKNOWN, so the row is allowed. Add NOT NULL if you need the value present.',
    },
    {
      id: 'sfq17',
      question: 'orders.user_id references users(id) ON DELETE CASCADE. What happens when you delete a user who has orders?',
      options: ['The delete is refused', 'The orders\' user_id is set to NULL', 'The user and all their orders are deleted', 'Only the user is deleted; orders keep a dangling id'],
      correctAnswer: 2,
      explanation: 'CASCADE propagates the delete to referencing rows. RESTRICT (the default) would refuse the delete; SET NULL would null out user_id.',
    },
    {
      id: 'sfq18',
      question: 'What does `SELECT 10 / 4` return in Postgres?',
      options: ['2.5', '3', '2', 'NULL'],
      correctAnswer: 2,
      explanation: 'Both operands are integers, so the division is integer division and truncates toward zero. Cast one side (10 / 4.0) to get 2.5.',
    },
    {
      id: 'sfq19',
      question: 'What does `CASE nickname WHEN NULL THEN \'none\' ELSE nickname END` return for a row where nickname is NULL?',
      options: ['\'none\'', 'NULL', 'An error', '\'NULL\''],
      correctAnswer: 1,
      explanation: 'Simple CASE uses equality, and nickname = NULL is UNKNOWN, so the WHEN never matches and the ELSE branch returns the NULL nickname. Use CASE WHEN nickname IS NULL.',
    },
    {
      id: 'sfq20',
      question: 'What does `SELECT id FROM customers EXCEPT SELECT customer_id FROM orders` return?',
      options: ['Customers who have placed orders', 'Every customer id and every order id', 'Customer ids with no orders, de-duplicated', 'An error — column names differ'],
      correctAnswer: 2,
      explanation: 'EXCEPT keeps rows from the first query that do not appear in the second and removes duplicates. Column names need not match, only the count and types.',
    },
  ],
};

// =============================================================================
// 2. JOINS (free)
// =============================================================================
const sqlJoins: SQLCategory = {
  id: 'sql-joins',
  name: 'Joins',
  slug: 'sql-joins',
  description: 'INNER, LEFT, RIGHT, FULL, CROSS, and SELF joins — and when each is right',
  icon: 'git-merge-outline',
  color: '#0F766E',
  colorDark: '#0B564E',

  learnContent: [
    {
      id: 'sql-join-1',
      title: 'INNER JOIN',
      content: `\`INNER JOIN\` returns rows where the join condition is true in **both** tables. Rows with no match on either side are dropped.

**Syntax:**
\`\`\`
FROM a INNER JOIN b ON a.key = b.key
\`\`\`
\`INNER\` is optional — bare \`JOIN\` means \`INNER JOIN\`.

**Mental model:**
Think of two sets. INNER JOIN is the intersection: rows that exist in both.

**\`ON\` vs \`USING\`:**
- \`ON a.id = b.user_id\` — explicit, works with different column names.
- \`USING (user_id)\` — shorthand when both columns have the same name. The joined column appears once in the result, not twice.

**Multi-table joins** chain naturally — each join is evaluated left-to-right:`,
      codeExample: `-- Standard inner join
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON o.user_id = u.id;

-- USING shorthand (same column name)
SELECT u.name, o.total
FROM users u
INNER JOIN orders o USING (user_id);

-- Three-table join
SELECT
  u.name,
  o.id    AS order_id,
  p.name  AS product
FROM users u
JOIN orders   o ON o.user_id  = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE u.country = 'US'
  AND o.placed_at >= '2026-01-01';`,
    },
    {
      id: 'sql-join-2',
      title: 'LEFT, RIGHT, and FULL OUTER JOIN',
      content: `Outer joins keep rows from one or both sides even when no match exists, filling missing columns with NULL.

**LEFT JOIN** keeps every row from the left table. Right-side columns are NULL where there's no match.

**RIGHT JOIN** is the mirror image — rare in practice; just flip the table order and use LEFT JOIN.

**FULL OUTER JOIN** keeps unmatched rows from both sides.

**Anti-join pattern:** the classic "find rows in A with no row in B" — \`LEFT JOIN b ON ... WHERE b.id IS NULL\`. Equivalent to \`NOT EXISTS\` but sometimes plans differently.

**Common bug:** putting filters on the right table in the \`WHERE\` clause defeats the LEFT JOIN — those rows that should be NULL get filtered out. Put the predicate in the \`ON\` clause instead.`,
      codeExample: `-- Every user, even ones with no orders
SELECT u.id, u.name, o.id AS order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- Anti-join: users who have NEVER ordered
SELECT u.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- WRONG: this becomes an inner join in disguise
SELECT u.id, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'paid';   -- nukes rows with no order

-- RIGHT: filter inside the ON clause
SELECT u.id, o.id
FROM users u
LEFT JOIN orders o
       ON o.user_id = u.id
      AND o.status = 'paid';`,
    },
    {
      id: 'sql-join-3',
      title: 'CROSS JOIN and SELF JOIN',
      content: `**CROSS JOIN** produces the Cartesian product — every row in A paired with every row in B. Result size is \`|A| × |B|\`. Use it intentionally for things like generating date ranges or building combination tables; never by accident.

\`\`\`
SELECT * FROM a CROSS JOIN b;
-- Equivalent
SELECT * FROM a, b;
\`\`\`

**SELF JOIN** joins a table to itself. The same table appears twice in the FROM, each with a different alias. Common use cases:
- Find pairs of rows that relate (employees and their managers)
- Compare each row to its previous row (before window functions)
- Adjacency lists (parent → child)

**Tip:** always alias both sides — without aliases, SQL can't tell which copy of a column you mean.`,
      codeExample: `-- CROSS JOIN: generate every (size, color) pairing
SELECT s.label AS size, c.label AS color
FROM sizes s
CROSS JOIN colors c
ORDER BY s.label, c.label;

-- SELF JOIN: employees with their manager's name
SELECT
  e.name        AS employee,
  m.name        AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;

-- SELF JOIN: pairs of users from the same city
SELECT
  u1.name AS user_a,
  u2.name AS user_b,
  u1.city
FROM users u1
JOIN users u2
  ON u2.city = u1.city
 AND u2.id   > u1.id;   -- avoid duplicates and self-pairs`,
    },
    {
      id: 'sql-join-4',
      title: 'Join Order, Performance, and NULL Behavior',
      content: `**Logical order vs physical execution:** SQL is declarative. The optimizer is free to reorder INNER joins. OUTER joins constrain order more because the side that gets preserved matters.

**Cardinality matters:**
- Join the most selective filter first (smaller intermediate result = faster).
- The optimizer uses table statistics to estimate cardinality. Stale stats lead to bad plans — run \`ANALYZE\` after large data changes.

**Indexes on join keys:** any column used in an \`ON\` clause should be indexed on at least one side. Without an index, the DB falls back to a hash or nested-loop scan over a sorted relation.

**NULLs in join keys never match.** \`NULL = NULL\` is UNKNOWN. If you have to treat NULLs as equal, use \`IS NOT DISTINCT FROM\` (Postgres) or wrap in \`COALESCE(col, sentinel)\`.

**The "exploding join" anti-pattern:** joining two one-to-many tables to the same parent multiplies rows. Fix with subqueries or LATERAL joins.`,
      codeExample: `-- Treat NULLs as equal in a join (Postgres)
SELECT a.id, b.id
FROM a
JOIN b ON a.key IS NOT DISTINCT FROM b.key;

-- Exploding join (WRONG): each user × N orders × M comments
SELECT u.id, o.id, c.id
FROM users u
JOIN orders   o ON o.user_id = u.id
JOIN comments c ON c.user_id = u.id;

-- Fix: aggregate one side before joining
SELECT u.id, o.id, cm.comment_count
FROM users u
JOIN orders o ON o.user_id = u.id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS comment_count
  FROM comments
  GROUP BY user_id
) cm ON cm.user_id = u.id;

-- Check the plan (always)
EXPLAIN ANALYZE
SELECT ... ;`,
    },
    {
      id: 'sql-join-5',
      title: 'Semi-Joins, Anti-Joins, and Row Multiplication',
      content: `Interviewers love "which users have (or don't have) X?" questions because a naive JOIN gets the row count wrong.

**Semi-join** — "rows in A that have at least one match in B", each A row **once**. Written with \`EXISTS\` or \`IN\`. A plain JOIN would repeat the user once per matching order, and slapping \`DISTINCT\` on top means the DB builds all those rows and then throws them away. EXISTS stops probing at the first match.

**Anti-join** — "rows in A with no match in B". Three spellings:
- \`NOT EXISTS (...)\` — NULL-safe, clearest intent. **Default choice.**
- \`LEFT JOIN b ... WHERE b.id IS NULL\` — NULL-safe, sometimes plans differently.
- \`NOT IN (subquery)\` — **broken** if the subquery can return NULL: the whole predicate becomes UNKNOWN and you get zero rows.

**Symmetric difference** — rows that exist on exactly one side. \`FULL OUTER JOIN ... WHERE a.id IS NULL OR b.id IS NULL\`. Ideal for reconciling two data sources.

**Row multiplication after a LEFT JOIN:** a user with three orders becomes three rows. \`COUNT(*)\` then counts the NULL-padded row for users with zero orders as 1. Count the right-side key — \`COUNT(o.id)\` — to get 0.`,
      codeExample: `-- Semi-join: users with at least one paid order, each listed once
SELECT u.id, u.name
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.id AND o.status = 'paid'
);

-- Anti-join, preferred spelling
SELECT u.id, u.name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- Symmetric difference: ids present in only one of two feeds
SELECT COALESCE(a.id, b.id) AS id,
       CASE WHEN a.id IS NULL THEN 'only_in_b' ELSE 'only_in_a' END AS side
FROM feed_a a
FULL OUTER JOIN feed_b b ON b.id = a.id
WHERE a.id IS NULL OR b.id IS NULL;

-- Counting after LEFT JOIN: COUNT(*) is 1 for users with no orders
SELECT u.id,
       COUNT(*)    AS wrong_count,   -- never 0
       COUNT(o.id) AS order_count    -- 0 when no orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;`,
    },
    {
      id: 'sql-join-6',
      title: 'LATERAL and Non-Equi Joins',
      content: `**LATERAL** lets a subquery in FROM reference columns from tables to its left — a correlated subquery you can return multiple rows and columns from. It is the cleanest way to write **top-N per group**: for each parent row, run a small ordered LIMIT query.

- \`CROSS JOIN LATERAL (...)\` — drops parents whose subquery returns no rows.
- \`LEFT JOIN LATERAL (...) ON TRUE\` — keeps them with NULLs.

SQL Server calls the same thing \`CROSS APPLY\` / \`OUTER APPLY\`.

**Non-equi joins** use a condition other than equality — ranges, inequalities, BETWEEN. Classic uses: tax brackets, price tiers, date-range lookups (which rate was active when the order was placed). The planner cannot use a hash join for these, so expect nested loops; an index on the range columns matters.

**NATURAL JOIN** joins on **every** same-named column automatically. It looks tidy but silently breaks when someone adds a \`created_at\` column to both tables. Prefer explicit ON or USING.`,
      codeExample: `-- Top 3 most recent orders per user (LATERAL)
SELECT u.name, recent.id AS order_id, recent.placed_at
FROM users u
CROSS JOIN LATERAL (
  SELECT o.id, o.placed_at
  FROM orders o
  WHERE o.user_id = u.id
  ORDER BY o.placed_at DESC
  LIMIT 3
) AS recent;

-- Same, but keep users with no orders
SELECT u.name, recent.id AS order_id
FROM users u
LEFT JOIN LATERAL (
  SELECT o.id FROM orders o
  WHERE o.user_id = u.id
  ORDER BY o.placed_at DESC
  LIMIT 3
) AS recent ON TRUE;

-- Non-equi join: assign each order to its tax bracket
SELECT o.id, o.total, b.rate
FROM orders o
JOIN tax_brackets b
  ON o.total >= b.min_total
 AND o.total <  b.max_total;

-- Non-equi join on a date range: the price in effect at order time
SELECT o.id, p.price
FROM orders o
JOIN price_history p
  ON p.product_id = o.product_id
 AND o.placed_at >= p.valid_from
 AND o.placed_at <  p.valid_to;`,
    },
  ],

  visualizations: [
    {
      title: 'Join Types as Venn Diagrams',
      description: 'Which rows survive each kind of join',
      nodes: [
        { id: 'inner', label: 'INNER\nA ∩ B',          x: 60,  y: 50,  type: 'success' },
        { id: 'left',  label: 'LEFT\nA + match',       x: 220, y: 50,  type: 'primary' },
        { id: 'right', label: 'RIGHT\nB + match',      x: 60,  y: 150, type: 'secondary' },
        { id: 'full',  label: 'FULL\nA ∪ B',           x: 220, y: 150, type: 'warning' },
        { id: 'cross', label: 'CROSS\nA × B',          x: 140, y: 240, type: 'error' },
      ],
      edges: [],
    },
    {
      title: 'Anti-Join with LEFT JOIN',
      description: 'Find users with no orders by checking for NULL after a LEFT JOIN',
      nodes: [
        { id: 'users',  label: 'users',                    x: 60,  y: 50,  type: 'primary' },
        { id: 'orders', label: 'orders',                   x: 220, y: 50,  type: 'secondary' },
        { id: 'left',   label: 'LEFT JOIN\non user_id',    x: 140, y: 130, type: 'info' },
        { id: 'filter', label: 'WHERE orders.id IS NULL',  x: 140, y: 210, type: 'success' },
      ],
      edges: [
        { from: 'users',  to: 'left' },
        { from: 'orders', to: 'left' },
        { from: 'left',   to: 'filter' },
      ],
    },
  ],

  flashcards: [
    { id: 'jn1',  front: 'What does INNER JOIN return?', back: 'Only rows where the join condition is true in both tables. Rows with no match on either side are excluded.' },
    { id: 'jn2',  front: 'Difference between ON and USING?', back: 'ON takes an arbitrary boolean (a.x = b.y). USING(col) is shorthand for same-named columns and produces only one merged column in the result.' },
    { id: 'jn3',  front: 'What does LEFT JOIN do?', back: 'Keeps every row from the left table. Right-side columns are NULL where the join condition didn\'t match.' },
    { id: 'jn4',  front: 'When is RIGHT JOIN useful?', back: 'Rarely — convention is to flip table order and use LEFT JOIN. RIGHT JOIN exists for symmetry but harder to read.' },
    { id: 'jn5',  front: 'What does FULL OUTER JOIN keep?', back: 'Every row from both sides. Matched rows merge; unmatched rows get NULL on the opposite side.' },
    { id: 'jn6',  front: 'What is the anti-join pattern?', back: '`LEFT JOIN ... WHERE other.id IS NULL` — finds rows in A with no matching row in B. Equivalent to NOT EXISTS, sometimes faster.' },
    { id: 'jn7',  front: 'Why does WHERE on the right table break a LEFT JOIN?', back: 'The unmatched rows have NULL in the right-side columns, so any equality filter on them returns UNKNOWN and drops the row — turning the LEFT JOIN into an INNER JOIN. Move the filter into the ON clause.' },
    { id: 'jn8',  front: 'What does CROSS JOIN return?', back: 'The Cartesian product — every row in A paired with every row in B. Result size is |A| × |B|. Useful for generating combinations.' },
    { id: 'jn9',  front: 'What is a SELF JOIN?', back: 'Joining a table to itself with different aliases. Used for hierarchies (manager_id), pairs from the same group, or comparing rows to other rows in the same table.' },
    { id: 'jn10', front: 'Why must SELF JOINs use aliases?', back: 'Two copies of the same table have identical column names. The DB can\'t tell which copy you mean without aliases like `e` and `m`.' },
    { id: 'jn11', front: 'Why do NULL keys never join?', back: 'NULL = NULL evaluates to UNKNOWN, not true. To treat NULLs as equal, use `IS NOT DISTINCT FROM` (Postgres) or wrap with COALESCE.' },
    { id: 'jn12', front: 'What is an "exploding" join?', back: 'Joining a parent table to two one-to-many children multiplies rows together (N × M per parent). Fix by aggregating one side first or using a LATERAL/subquery join.' },
    { id: 'jn13', front: 'Can the optimizer reorder INNER joins?', back: 'Yes — INNER joins are commutative and associative, so the planner picks the cheapest order based on stats. OUTER joins are constrained by which side is preserved.' },
    { id: 'jn14', front: 'What index helps a join?', back: 'An index on the join column of at least one side. Often both — composite indexes that cover the join key plus filter columns can enable index-only scans.' },
    { id: 'jn15', front: 'What does `JOIN ... USING (id)` produce in the SELECT list?', back: 'A single merged `id` column, not two. SELECT * shows only one. Useful for cleaner output when both tables use the same name.' },
    { id: 'jn16', front: 'What\'s a LATERAL join?', back: 'A subquery in the FROM clause that can reference columns from preceding tables — like a correlated subquery you can SELECT from. Great for "top-N per group" queries.' },
    { id: 'jn17', front: 'Why is `FROM a, b` discouraged?', back: 'It\'s an implicit CROSS JOIN. Forgetting the WHERE clause produces a Cartesian product. Explicit JOIN syntax makes intent clearer and harder to break.' },
    { id: 'jn18', front: 'Difference between hash join and nested-loop join?', back: 'Nested-loop iterates one table and probes the other (good for small/indexed sides). Hash join builds a hash on one side then streams the other (good for big unindexed joins). The planner picks based on size and indexes.' },
    { id: 'jn19', front: 'What is a semi-join?', back: 'Returns each row of A that has at least one match in B — once, without B\'s columns. Written with EXISTS or IN. Unlike a JOIN, it never multiplies rows.' },
    { id: 'jn20', front: 'Why is JOIN + DISTINCT worse than EXISTS for "users with orders"?', back: 'The JOIN builds one row per matching order and DISTINCT then discards the extras. EXISTS stops at the first match per user and never produces the extra rows.' },
    { id: 'jn21', front: 'Why avoid NATURAL JOIN?', back: 'It joins on every column that shares a name in both tables. Adding a column like created_at or name to either table silently changes the join condition and the results.' },
    { id: 'jn22', front: 'What is a non-equi join?', back: 'A join whose condition is not simple equality — ranges, BETWEEN, <, >. Used for tax brackets, price tiers, and "which rate was active at this timestamp". Hash joins can\'t be used, so expect nested loops.' },
    { id: 'jn23', front: 'How do you find rows that exist in exactly one of two tables?', back: 'FULL OUTER JOIN on the key, then WHERE a.id IS NULL OR b.id IS NULL. That is the symmetric difference — perfect for reconciling two data feeds.' },
    { id: 'jn24', front: 'Does it matter whether a filter goes in ON or WHERE for an INNER JOIN?', back: 'No — for INNER joins the result is identical and the planner treats them the same. The placement only changes results for OUTER joins, where ON filters before padding with NULLs and WHERE filters after.' },
    { id: 'jn25', front: 'What is a merge join?', back: 'Both inputs are sorted on the join key and walked in step like a zipper. Cheap when the inputs are already sorted (an index or prior sort) and both sides are large. The third join algorithm next to nested-loop and hash.' },
    { id: 'jn26', front: 'What happens to row count when a LEFT JOIN\'s right side has multiple matches?', back: 'The left row is repeated once per match — a user with 3 orders becomes 3 rows. Aggregates over the left table (SUM of user balance) inflate accordingly; pre-aggregate or count the child key.' },
    { id: 'jn27', front: 'How do you write top-3 orders per user with LATERAL?', back: 'FROM users u CROSS JOIN LATERAL (SELECT ... FROM orders o WHERE o.user_id = u.id ORDER BY placed_at DESC LIMIT 3) r. The subquery runs per user and can reference u.' },
    { id: 'jn28', front: 'CROSS JOIN LATERAL vs LEFT JOIN LATERAL ... ON TRUE?', back: 'CROSS JOIN LATERAL drops parent rows whose subquery returns nothing. LEFT JOIN LATERAL ... ON TRUE keeps them, padding the subquery columns with NULL.' },
    { id: 'jn29', front: 'Why is an OR in a join condition slow?', back: 'ON a.x = b.x OR a.y = b.y can\'t be hashed or merged on a single key, so the planner falls back to a nested loop over both tables. Rewrite as a UNION of two equi-joins.' },
    { id: 'jn30', front: 'After a LEFT JOIN, why does COUNT(*) never return 0 for a parent with no children?', back: 'The parent still produces one NULL-padded row, and COUNT(*) counts rows. COUNT(child.id) skips the NULL and returns 0.' },
  ],

  quizQuestions: [
    {
      id: 'jnq1',
      question: 'Which join returns only matching rows from both tables?',
      options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN'],
      correctAnswer: 2,
      explanation: 'INNER JOIN keeps only the intersection — rows with a match on both sides.',
    },
    {
      id: 'jnq2',
      question: 'You want every user, plus their order count (0 if none). What join do you use?',
      options: ['INNER JOIN orders', 'LEFT JOIN orders', 'RIGHT JOIN orders', 'CROSS JOIN orders'],
      correctAnswer: 1,
      explanation: 'LEFT JOIN keeps every user; non-matching orders become NULL. COUNT(orders.id) on a NULL row returns 0.',
    },
    {
      id: 'jnq3',
      question: 'Why is `LEFT JOIN orders o ON o.user_id = u.id WHERE o.status = \'paid\'` a bug?',
      options: ['Syntax error', 'It turns into an INNER JOIN because NULL rows fail the WHERE', 'It returns duplicates', 'It can\'t use indexes'],
      correctAnswer: 1,
      explanation: 'Unmatched rows have o.status = NULL, which fails the WHERE check. Move the condition into the ON clause.',
    },
    {
      id: 'jnq4',
      question: 'What size is the result of a CROSS JOIN between two 100-row tables?',
      options: ['100 rows', '200 rows', '10,000 rows', 'Depends on the ON clause'],
      correctAnswer: 2,
      explanation: 'Cartesian product: 100 × 100 = 10,000 rows. CROSS JOIN has no ON clause.',
    },
    {
      id: 'jnq5',
      question: 'You want every (employee, manager) pair. The manager is in the same table. What do you use?',
      options: ['CROSS JOIN', 'SELF JOIN', 'FULL OUTER JOIN', 'NATURAL JOIN'],
      correctAnswer: 1,
      explanation: 'Join the employees table to itself with two aliases, matching on `e.manager_id = m.id`.',
    },
    {
      id: 'jnq6',
      question: 'Two tables have a NULL in the join key. Will they match?',
      options: ['Yes — NULL equals NULL', 'No — NULL = NULL is UNKNOWN', 'Only with INNER JOIN', 'Only with LEFT JOIN'],
      correctAnswer: 1,
      explanation: 'NULLs never match in a standard join. Use IS NOT DISTINCT FROM (Postgres) or COALESCE to a sentinel value.',
    },
    {
      id: 'jnq7',
      question: 'Which is equivalent to `LEFT JOIN b ON a.id = b.a_id WHERE b.id IS NULL`?',
      options: ['SELECT a.* FROM a INNER JOIN b ON a.id = b.a_id', 'SELECT a.* FROM a WHERE NOT EXISTS (SELECT 1 FROM b WHERE b.a_id = a.id)', 'SELECT a.* FROM a CROSS JOIN b', 'SELECT a.* FROM a FULL JOIN b ON a.id = b.a_id'],
      correctAnswer: 1,
      explanation: 'Anti-join — both forms return rows in A with no matching row in B. NOT EXISTS is often preferred for clarity and NULL safety.',
    },
    {
      id: 'jnq8',
      question: 'A query joins three tables to a parent — one is one-to-many, the other is also one-to-many. What\'s the risk?',
      options: ['Slow planner', 'Exploding join multiplies rows', 'No indexes possible', 'Type mismatch'],
      correctAnswer: 1,
      explanation: 'Each parent row gets N × M rows in the output. Aggregate one or both children in a subquery first.',
    },
    {
      id: 'jnq9',
      question: 'Why is `USING (user_id)` sometimes cleaner than `ON a.user_id = b.user_id`?',
      options: ['It\'s faster', 'It produces one merged column instead of two', 'It allows NULL matching', 'It avoids deadlocks'],
      correctAnswer: 1,
      explanation: 'USING merges the matched column into one in the result set. The column appears once in SELECT *.',
    },
    {
      id: 'jnq10',
      question: 'Which JOIN does the optimizer have the most freedom to reorder?',
      options: ['LEFT JOIN', 'INNER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
      correctAnswer: 1,
      explanation: 'INNER JOINs are commutative and associative. OUTER joins must respect which side is preserved, limiting reordering.',
    },
    {
      id: 'jnq11',
      question: 'users has 3 rows; each user has exactly 2 orders. How many rows does `SELECT * FROM users u LEFT JOIN orders o ON o.user_id = u.id` return?',
      options: ['3', '5', '6', '9'],
      correctAnswer: 2,
      explanation: 'Each user row is repeated once per matching order: 3 × 2 = 6. A join multiplies rows by the number of matches.',
    },
    {
      id: 'jnq12',
      question: 'After `LEFT JOIN orders o ... GROUP BY u.id`, what does COUNT(*) return for a user with no orders?',
      options: ['0', 'NULL', '1', 'An error'],
      correctAnswer: 2,
      explanation: 'The user still appears as one NULL-padded row, and COUNT(*) counts rows. Use COUNT(o.id), which skips the NULL and returns 0.',
    },
    {
      id: 'jnq13',
      question: 'You need ids that appear in feed_a OR feed_b but not both. Which query?',
      options: ['INNER JOIN on id', 'FULL OUTER JOIN on id WHERE a.id IS NULL OR b.id IS NULL', 'LEFT JOIN on id WHERE b.id IS NULL', 'CROSS JOIN with a filter'],
      correctAnswer: 1,
      explanation: 'A FULL OUTER JOIN keeps unmatched rows from both sides; filtering for a NULL on either side leaves exactly the rows present in only one feed. LEFT JOIN alone only finds rows missing from b.',
    },
    {
      id: 'jnq14',
      question: 'Which is the most efficient way to list each user who has at least one order, exactly once?',
      options: ['SELECT DISTINCT u.* FROM users u JOIN orders o ON o.user_id = u.id', 'SELECT u.* FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)', 'SELECT u.* FROM users u CROSS JOIN orders o', 'SELECT u.* FROM users u LEFT JOIN orders o ON o.user_id = u.id'],
      correctAnswer: 1,
      explanation: 'EXISTS is a semi-join: it stops at the first matching order per user and never builds duplicate rows. JOIN + DISTINCT constructs every match and then de-duplicates.',
    },
    {
      id: 'jnq15',
      question: 'Both users and orders have columns id and created_at. What does `users NATURAL JOIN orders` join on?',
      options: ['Nothing — it errors', 'The foreign key user_id', 'All same-named columns: id AND created_at', 'The primary key only'],
      correctAnswer: 2,
      explanation: 'NATURAL JOIN matches every column name shared by both tables, which here is nonsense (users.id = orders.id AND equal timestamps). This is why explicit ON / USING is preferred.',
    },
    {
      id: 'jnq16',
      question: 'Which join assigns each order to the tax bracket whose range contains its total?',
      options: ['JOIN brackets b ON b.min_total = o.total', 'JOIN brackets b USING (total)', 'CROSS JOIN brackets b', 'JOIN brackets b ON o.total >= b.min_total AND o.total < b.max_total'],
      correctAnswer: 3,
      explanation: 'A range condition is a non-equi join. Equality on min_total would only match orders exactly at the boundary, and CROSS JOIN pairs every order with every bracket.',
    },
    {
      id: 'jnq17',
      question: 'You want the 3 latest orders per user, and users with no orders should still appear. Which form?',
      options: ['CROSS JOIN LATERAL (...)', 'LEFT JOIN LATERAL (...) ON TRUE', 'INNER JOIN with LIMIT 3', 'FULL OUTER JOIN LATERAL (...)'],
      correctAnswer: 1,
      explanation: 'LEFT JOIN LATERAL ... ON TRUE keeps parents whose subquery returns zero rows. CROSS JOIN LATERAL drops them. LIMIT on a plain join applies to the whole result, not per user.',
    },
    {
      id: 'jnq18',
      question: 'For `users u INNER JOIN orders o ON o.user_id = u.id`, what changes if you move `AND o.status = \'paid\'` from ON to WHERE?',
      options: ['Nothing — the result is identical', 'Users with no paid orders are now kept', 'It becomes a CROSS JOIN', 'The index on status can no longer be used'],
      correctAnswer: 0,
      explanation: 'For an INNER join, filtering before or after matching yields the same rows and the planner treats both placements the same. Only OUTER joins are sensitive to ON vs WHERE.',
    },
    {
      id: 'jnq19',
      question: 'Which join algorithm requires both inputs to be sorted on the join key?',
      options: ['Nested loop', 'Hash join', 'Merge join', 'Bitmap join'],
      correctAnswer: 2,
      explanation: 'A merge join zips two sorted streams together in one pass. It shines when an index or earlier sort already provides the order; hash and nested-loop joins do not need sorted input.',
    },
    {
      id: 'jnq20',
      question: 'In `FROM users u1 JOIN users u2 ON u2.city = u1.city AND u2.id > u1.id`, why `>` rather than `<>`?',
      options: ['> uses the index, <> does not', 'With <> each pair appears twice, as (A,B) and (B,A)', '<> would include NULL cities', '<> is not allowed in ON clauses'],
      correctAnswer: 1,
      explanation: 'Both operators exclude self-pairs, but <> returns every unordered pair in both directions. Requiring u2.id > u1.id keeps exactly one ordering of each pair.',
    },
  ],
};

// =============================================================================
// 3. AGGREGATIONS & GROUPING (premium)
// =============================================================================
const sqlAggregations: SQLCategory = {
  id: 'sql-aggregations',
  name: 'Aggregations & Grouping',
  slug: 'sql-aggregations',
  description: 'GROUP BY, HAVING, aggregate functions, and pivoting patterns',
  icon: 'bar-chart-outline',
  color: '#7C3AED',
  colorDark: '#5B21B6',
  premium: true,

  learnContent: [
    {
      id: 'sql-agg-1',
      title: 'Aggregate Functions and GROUP BY',
      content: `Aggregate functions collapse many rows into one value: \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`. \`GROUP BY\` says **how** to bucket rows before aggregating.

**Rule of thumb:** every column in the SELECT must either be in the GROUP BY clause or wrapped in an aggregate. This is enforced by standard SQL and most modern databases.

**Common aggregates:**
- \`COUNT(*)\` — count rows.
- \`COUNT(col)\` — count non-NULL values in col.
- \`COUNT(DISTINCT col)\` — count distinct non-NULL values.
- \`SUM(col)\` — sum, ignoring NULLs.
- \`AVG(col)\` — mean of non-NULL values.
- \`MIN\` / \`MAX\` — work on numbers, strings, dates.

**String aggregation:** \`STRING_AGG(col, ',')\` (Postgres) / \`GROUP_CONCAT(col)\` (MySQL) joins values from a group into a delimited string.

**Array aggregation** (Postgres): \`ARRAY_AGG(col)\` collects values into an array.`,
      codeExample: `-- Per-country signup counts
SELECT country, COUNT(*) AS users
FROM users
GROUP BY country
ORDER BY users DESC;

-- Multiple grouping columns + multiple aggregates
SELECT
  country,
  plan,
  COUNT(*)                AS users,
  COUNT(DISTINCT email)   AS unique_emails,
  AVG(monthly_spend)      AS avg_spend,
  MAX(created_at)         AS most_recent_signup
FROM users
GROUP BY country, plan;

-- Concatenate tags per post
SELECT
  post_id,
  STRING_AGG(tag, ', ' ORDER BY tag) AS tags
FROM post_tags
GROUP BY post_id;`,
    },
    {
      id: 'sql-agg-2',
      title: 'HAVING vs WHERE',
      content: `\`WHERE\` filters rows **before** grouping. \`HAVING\` filters groups **after** aggregation.

**Test:** "does the filter reference an aggregate?"
- No → use WHERE (more selective, smaller intermediate, faster).
- Yes → use HAVING.

You can use BOTH in a single query. WHERE narrows the rows that flow into the aggregation; HAVING discards groups whose aggregate values don't meet your criteria.

**Note:** HAVING runs after GROUP BY but before SELECT in the logical order. Some databases let you reference column aliases from SELECT in HAVING (MySQL), others don't (strict Postgres).`,
      codeExample: `-- WHERE: filter rows before grouping (only paid orders)
-- HAVING: filter groups after aggregating (customers spending > $1000)
SELECT
  customer_id,
  SUM(total) AS total_spent
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING SUM(total) > 1000
ORDER BY total_spent DESC;

-- WRONG: trying to filter the aggregate in WHERE
SELECT customer_id, SUM(total) AS total_spent
FROM orders
WHERE SUM(total) > 1000   -- ERROR: aggregates not allowed in WHERE
GROUP BY customer_id;

-- Counting groups that have more than 3 distinct items
SELECT category_id, COUNT(DISTINCT product_id) AS variety
FROM order_items
GROUP BY category_id
HAVING COUNT(DISTINCT product_id) >= 3;`,
    },
    {
      id: 'sql-agg-3',
      title: 'Filtered Aggregates and Conditional Sums',
      content: `Often you need an aggregate over a subset of rows. Two ways:

**1. CASE inside the aggregate** — works everywhere:
\`\`\`
SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END)
\`\`\`

**2. The \`FILTER\` clause** (Postgres, SQL Standard) — cleaner:
\`\`\`
SUM(total) FILTER (WHERE status = 'paid')
\`\`\`

This pattern unlocks "report-style" queries that compute multiple per-bucket counts in one pass:
- paid vs cancelled totals side-by-side
- this-month vs last-month revenue
- conversion rates as a ratio of two filtered counts

**ROLLUP and CUBE** add subtotal rows automatically. \`GROUP BY ROLLUP(a, b)\` yields per-(a,b), per-a, and grand-total rows. \`CUBE\` adds every combination.`,
      codeExample: `-- Side-by-side metrics per customer
SELECT
  customer_id,
  COUNT(*) FILTER (WHERE status = 'paid')      AS paid_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
  SUM(total) FILTER (WHERE status = 'paid')    AS revenue
FROM orders
GROUP BY customer_id;

-- Same query, CASE form (works on MySQL too)
SELECT
  customer_id,
  SUM(CASE WHEN status = 'paid'      THEN 1 ELSE 0 END)     AS paid_orders,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)     AS cancelled_orders,
  SUM(CASE WHEN status = 'paid'      THEN total ELSE 0 END) AS revenue
FROM orders
GROUP BY customer_id;

-- ROLLUP: per-(country, plan), per-country, grand total
SELECT country, plan, COUNT(*) AS users
FROM users
GROUP BY ROLLUP(country, plan)
ORDER BY country, plan;`,
    },
    {
      id: 'sql-agg-4',
      title: 'DISTINCT, GROUP BY, and the Top-N-Per-Group Trap',
      content: `**DISTINCT vs GROUP BY:**
\`SELECT DISTINCT a, b\` and \`SELECT a, b GROUP BY a, b\` return the same rows. GROUP BY is more flexible because it composes with aggregates; DISTINCT is shorter for de-dup-only.

**The "top N per group" problem** is a classic interview question:
*Give me the most recent order for each customer.*

GROUP BY alone can't do it cleanly — you can find MAX(placed_at) per customer, but joining back to get the rest of the row is awkward. Three idiomatic solutions:

1. **Window functions** (next module): \`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY placed_at DESC)\`, then keep rows where rn = 1.
2. **DISTINCT ON** (Postgres only): \`SELECT DISTINCT ON (customer_id) ... ORDER BY customer_id, placed_at DESC\`.
3. **Correlated subquery**: \`WHERE placed_at = (SELECT MAX(placed_at) FROM orders WHERE customer_id = o.customer_id)\` — concise but often slower.`,
      codeExample: `-- Top-1 per group with DISTINCT ON (Postgres)
SELECT DISTINCT ON (customer_id)
  customer_id, id AS order_id, placed_at, total
FROM orders
ORDER BY customer_id, placed_at DESC;

-- Same with a window function (any DB)
SELECT customer_id, order_id, placed_at, total
FROM (
  SELECT
    o.*,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY placed_at DESC) AS rn
  FROM orders o
) ranked
WHERE rn = 1;

-- DISTINCT vs GROUP BY (identical result here)
SELECT DISTINCT country, plan FROM users;
SELECT country, plan FROM users GROUP BY country, plan;`,
    },
    {
      id: 'sql-agg-5',
      title: 'GROUPING SETS, GROUPING(), and NULL Groups',
      content: `**GROUPING SETS** is the general form behind ROLLUP and CUBE: you list exactly which combinations of columns to aggregate by, and the DB computes them all in one pass over the data.

\`\`\`
GROUP BY GROUPING SETS ((country, plan), (country), ())
-- identical to GROUP BY ROLLUP(country, plan)
\`\`\`

Use it when you want *some* subtotals but not the full hierarchy — e.g. totals per country and totals per plan, but not every (country, plan) pair.

**Telling subtotals apart from real NULLs.** Subtotal rows show NULL in the rolled-up column, but so do rows whose data is genuinely NULL. \`GROUPING(col)\` returns 1 when the column was rolled up for that row and 0 otherwise — use it to label totals correctly.

**NULL in GROUP BY:** all rows with a NULL grouping value land in **one** group. GROUP BY (like DISTINCT) treats NULLs as equal to each other, even though \`NULL = NULL\` is UNKNOWN in WHERE.

**Aggregates over empty input:** \`COUNT\` returns 0, but \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\` return NULL when no rows (or only NULLs) are aggregated. Wrap with \`COALESCE(SUM(x), 0)\` for reports.`,
      codeExample: `-- Per-country and per-plan totals, but not the full cross-tab
SELECT
  country,
  plan,
  COUNT(*) AS users
FROM users
GROUP BY GROUPING SETS ((country), (plan))
ORDER BY country NULLS LAST, plan NULLS LAST;

-- Label subtotal rows so they aren't confused with NULL data
SELECT
  CASE WHEN GROUPING(country) = 1 THEN 'ALL' ELSE country END AS country,
  CASE WHEN GROUPING(plan)    = 1 THEN 'ALL' ELSE plan    END AS plan,
  SUM(monthly_spend) AS revenue
FROM users
GROUP BY ROLLUP (country, plan);

-- NULL countries collapse into a single group
SELECT country, COUNT(*)
FROM users
GROUP BY country;    -- one row has country = NULL

-- Empty input: SUM is NULL, COUNT is 0
SELECT COUNT(*) AS n, SUM(total) AS revenue, COALESCE(SUM(total), 0) AS safe_revenue
FROM orders
WHERE placed_at > NOW();   -- no rows match`,
    },
    {
      id: 'sql-agg-6',
      title: 'Classic Aggregation Interview Problems',
      content: `A handful of aggregation patterns come up in nearly every SQL interview. Know them cold.

**1. Find duplicates.** Group by the columns that should be unique and keep groups with more than one row: \`GROUP BY email HAVING COUNT(*) > 1\`.

**2. Zero-filled time series.** \`GROUP BY day\` silently omits days with no rows. Generate the full calendar first (\`generate_series\` in Postgres, or a calendar table), LEFT JOIN the facts, and count the fact key so empty days show 0.

**3. Median / percentiles.** There is no standard MEDIAN(). Use the ordered-set aggregate \`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x)\` (Postgres, Oracle, SQL Server). \`PERCENTILE_DISC\` returns an actual value from the set instead of interpolating.

**4. Full row with the group max ("join back").** \`SELECT department, MAX(salary)\` can't tell you *who* earns it. Aggregate in a subquery, then join back on both the key and the value. Beware: ties return more than one row per group.

**5. HAVING without GROUP BY.** Legal — the whole table is one group, so the query returns either one row or none. Handy for "alert if total errors today > N".`,
      codeExample: `-- 1. Duplicate emails, with how many times each appears
SELECT email, COUNT(*) AS copies
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. Orders per day, including days with zero orders
SELECT d::date AS day, COUNT(o.id) AS orders
FROM generate_series('2026-01-01', '2026-01-31', INTERVAL '1 day') AS d
LEFT JOIN orders o ON o.placed_at::date = d::date
GROUP BY d
ORDER BY d;

-- 3. Median order value per country
SELECT country,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total) AS median_total
FROM orders
GROUP BY country;

-- 4. Highest-paid employee(s) in each department, full row
SELECT e.department, e.name, e.salary
FROM employees e
JOIN (
  SELECT department, MAX(salary) AS max_salary
  FROM employees
  GROUP BY department
) m ON m.department = e.department
   AND m.max_salary = e.salary;

-- 5. One-row alert query: returns a row only if the threshold is crossed
SELECT COUNT(*) AS errors_today
FROM logs
WHERE level = 'error' AND logged_at >= CURRENT_DATE
HAVING COUNT(*) > 100;`,
    },
  ],

  visualizations: [
    {
      title: 'WHERE vs HAVING',
      description: 'Where each filter sits in the pipeline',
      nodes: [
        { id: 'rows',   label: 'rows',          x: 60,  y: 50,  type: 'info' },
        { id: 'where',  label: 'WHERE\n(per row)',    x: 220, y: 50,  type: 'primary' },
        { id: 'group',  label: 'GROUP BY',       x: 60,  y: 150, type: 'secondary' },
        { id: 'having', label: 'HAVING\n(per group)', x: 220, y: 150, type: 'warning' },
        { id: 'out',    label: 'output',        x: 140, y: 240, type: 'success' },
      ],
      edges: [
        { from: 'rows',  to: 'where' },
        { from: 'where', to: 'group' },
        { from: 'group', to: 'having' },
        { from: 'having', to: 'out' },
      ],
    },
    {
      title: 'Top-N per Group',
      description: 'Three idiomatic solutions to "latest row per key"',
      nodes: [
        { id: 'goal',  label: 'latest order\nper customer', x: 140, y: 40,  type: 'primary' },
        { id: 'win',   label: 'ROW_NUMBER\n() OVER ...',    x: 30,  y: 140, type: 'success' },
        { id: 'don',   label: 'DISTINCT ON\n(pg only)',     x: 140, y: 140, type: 'success' },
        { id: 'corr',  label: 'correlated\nMAX subquery',   x: 250, y: 140, type: 'warning' },
      ],
      edges: [
        { from: 'goal', to: 'win' },
        { from: 'goal', to: 'don' },
        { from: 'goal', to: 'corr' },
      ],
    },
  ],

  flashcards: [
    { id: 'ag1',  front: 'What\'s the rule for SELECT columns when using GROUP BY?', back: 'Every non-aggregate column in SELECT must appear in GROUP BY. Strict SQL mode enforces this; MySQL is sometimes lax.' },
    { id: 'ag2',  front: 'Difference between COUNT(*) and COUNT(col)?', back: 'COUNT(*) counts every row. COUNT(col) skips rows where col IS NULL.' },
    { id: 'ag3',  front: 'What does COUNT(DISTINCT col) do?', back: 'Counts distinct non-NULL values in the column. Expensive on large data because it must dedupe.' },
    { id: 'ag4',  front: 'When do you use WHERE vs HAVING?', back: 'WHERE filters rows before aggregation. HAVING filters groups after. If the filter references an aggregate, it must be HAVING.' },
    { id: 'ag5',  front: 'Why can\'t WHERE reference an aggregate?', back: 'WHERE runs before GROUP BY in the logical order — the aggregate doesn\'t exist yet at that stage.' },
    { id: 'ag6',  front: 'How do you sum only matching rows in one column?', back: 'Two ways: SUM(CASE WHEN cond THEN x ELSE 0 END), or SUM(x) FILTER (WHERE cond) on Postgres.' },
    { id: 'ag7',  front: 'What does GROUP BY ROLLUP(a, b) produce?', back: 'Groups for (a,b), then subtotals per a, plus a grand total row. NULL appears in the rolled-up dimension columns.' },
    { id: 'ag8',  front: 'Is SELECT DISTINCT a, b the same as SELECT a, b GROUP BY a, b?', back: 'In result rows, yes. GROUP BY is more flexible — it composes with aggregates. Use DISTINCT only when you literally just want unique rows.' },
    { id: 'ag9',  front: 'What is STRING_AGG?', back: 'Postgres aggregate that concatenates values with a separator. SELECT STRING_AGG(tag, \',\' ORDER BY tag). MySQL equivalent is GROUP_CONCAT.' },
    { id: 'ag10', front: 'Do aggregates count NULL values?', back: 'No. SUM, AVG, MIN, MAX, COUNT(col) all skip NULLs. Only COUNT(*) ignores nulls because it counts rows, not values.' },
    { id: 'ag11', front: 'What\'s DISTINCT ON in Postgres?', back: 'A non-standard shortcut: SELECT DISTINCT ON (key) ... ORDER BY key, sort_col returns the first row per key. Common for "latest per group" queries.' },
    { id: 'ag12', front: 'Why is AVG sometimes surprising with integers?', back: 'In some DBs, integer / integer = integer (truncation). Cast at least one side to numeric: AVG(col::numeric) or AVG(col * 1.0).' },
    { id: 'ag13', front: 'How would you compute a conversion rate per day in one query?', back: 'COUNT(*) FILTER (WHERE converted) * 100.0 / COUNT(*) — uses a filtered aggregate over the same group.' },
    { id: 'ag14', front: 'What\'s the difference between ROLLUP and CUBE?', back: 'ROLLUP adds subtotals for prefixes of the grouping columns (hierarchical). CUBE adds subtotals for every combination of grouping columns (cross-tab style).' },
    { id: 'ag15', front: 'Can you ORDER BY an aggregate alias?', back: 'Yes — ORDER BY runs after SELECT in logical order, so aliases defined in SELECT are visible. ORDER BY total_spent DESC works even though "total_spent" is computed.' },
    { id: 'ag16', front: 'How do you find groups with no matching child rows?', back: 'LEFT JOIN the child, GROUP BY parent, and HAVING COUNT(child.id) = 0. Anti-join via aggregate.' },
    { id: 'ag17', front: 'Why is GROUP BY 1, 2 sometimes valid?', back: 'Some dialects let you group by the column positions in the SELECT list. Concise but fragile — adding a column shifts the indices. Prefer named columns.' },
    { id: 'ag18', front: 'How do you bucket a continuous value (e.g. age) into ranges before aggregating?', back: 'GROUP BY a CASE expression or a width_bucket() function. SELECT CASE WHEN age < 18 ... END AS bucket, COUNT(*) GROUP BY bucket.' },
    { id: 'ag19', front: 'What does SUM(total) return when no rows match?', back: 'NULL, not 0 — SUM, AVG, MIN, and MAX of an empty set are NULL. Only COUNT returns 0. Wrap with COALESCE(SUM(total), 0) for reports.' },
    { id: 'ag20', front: 'How does GROUP BY treat NULL in the grouping column?', back: 'Every row with a NULL value lands in one shared group. GROUP BY (and DISTINCT) treat NULLs as equal to each other, unlike = in WHERE.' },
    { id: 'ag21', front: 'What is GROUPING SETS?', back: 'The general form of ROLLUP/CUBE: you list exactly which column combinations to aggregate by, e.g. GROUPING SETS ((country), (plan)). The DB computes all of them in one pass.' },
    { id: 'ag22', front: 'How do you tell a ROLLUP subtotal NULL from a real NULL value?', back: 'GROUPING(col) returns 1 for rows where col was rolled up (a subtotal) and 0 for ordinary rows — even when the ordinary row\'s value is NULL.' },
    { id: 'ag23', front: 'Why doesn\'t `SELECT department, name, MAX(salary) FROM employees GROUP BY department` give the top earner?', back: 'name is neither grouped nor aggregated — the DB has no rule for which name to show and strict mode rejects it. Join back to a MAX subquery or use a window function instead.' },
    { id: 'ag24', front: 'How do you find duplicate rows by email?', back: 'SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1. Group on the columns that should be unique and keep groups larger than one.' },
    { id: 'ag25', front: 'Can you write HAVING without GROUP BY?', back: 'Yes. The entire result is treated as one group, so the query returns either one row or zero rows — useful for threshold alerts like HAVING COUNT(*) > 100.' },
    { id: 'ag26', front: 'How do you compute a median in SQL?', back: 'There is no standard MEDIAN(). Use the ordered-set aggregate PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x). PERCENTILE_DISC returns an actual observed value rather than interpolating.' },
    { id: 'ag27', front: 'What does SUM(DISTINCT amount) do, and why is it usually a bug?', back: 'It sums each distinct value once, so amounts 10, 10, 20 give 30 instead of 40. Nearly always wrong for revenue; it\'s only right when you truly mean unique values.' },
    { id: 'ag28', front: 'How do you report a count for every day, including days with zero rows?', back: 'GROUP BY alone drops empty days. Generate the calendar (generate_series or a dates table), LEFT JOIN the facts onto it, and COUNT the fact key so missing days show 0.' },
    { id: 'ag29', front: 'What is the "join back" pattern for max-per-group?', back: 'Aggregate MAX(value) per key in a subquery, then JOIN the original table on both key AND value to recover the full row. Ties return multiple rows per group.' },
    { id: 'ag30', front: 'Can GROUP BY reference a column alias from SELECT?', back: 'Not in standard SQL — GROUP BY runs before SELECT. Postgres and MySQL accept output-column aliases as an extension, but HAVING in Postgres cannot use them. Repeating the expression is the portable choice.' },
  ],

  quizQuestions: [
    {
      id: 'agq1',
      question: 'What does COUNT(*) return?',
      options: ['Count of non-NULL values in the first column', 'Count of all rows', 'Count of distinct rows', 'Count of NULL rows'],
      correctAnswer: 1,
      explanation: 'COUNT(*) counts every row regardless of NULL values. COUNT(col) skips NULLs in that column.',
    },
    {
      id: 'agq2',
      question: 'Which filter belongs in HAVING (not WHERE)?',
      options: ['status = \'paid\'', 'created_at >= \'2026-01-01\'', 'SUM(total) > 1000', 'country IN (\'US\', \'CA\')'],
      correctAnswer: 2,
      explanation: 'Aggregates can only appear in HAVING (or SELECT / ORDER BY). The other three are per-row filters.',
    },
    {
      id: 'agq3',
      question: 'Which is the Postgres way to count only paid orders inline with a total count?',
      options: ['COUNT(*) WHERE status = \'paid\'', 'COUNT(*) FILTER (WHERE status = \'paid\')', 'COUNT(status = \'paid\')', 'COUNT(IF(status = \'paid\'))'],
      correctAnswer: 1,
      explanation: 'FILTER (WHERE ...) is the SQL standard form, supported by Postgres. CASE-inside-aggregate is the portable alternative.',
    },
    {
      id: 'agq4',
      question: 'What rule must every non-aggregate column in SELECT obey when GROUP BY is used?',
      options: ['It must be indexed', 'It must appear in GROUP BY', 'It must be a string', 'It must be NULLable'],
      correctAnswer: 1,
      explanation: 'Otherwise the DB can\'t pick which value to return per group. Strict SQL mode enforces this.',
    },
    {
      id: 'agq5',
      question: 'What does GROUP BY ROLLUP(country, plan) add to the result?',
      options: ['Nothing — same as GROUP BY', 'A row per country with plan = NULL, plus a grand total row', 'Sorted output', 'A distinct row per country'],
      correctAnswer: 1,
      explanation: 'ROLLUP adds subtotal rows: per-(country,plan), per-country (plan=NULL), and one grand total (both NULL).',
    },
    {
      id: 'agq6',
      question: 'Which query gets the latest order per customer using a Postgres-specific shortcut?',
      options: ['MAX(placed_at) GROUP BY customer_id', 'SELECT DISTINCT ON (customer_id) ... ORDER BY customer_id, placed_at DESC', 'SELECT DISTINCT customer_id', 'SELECT TOP 1 ... per customer'],
      correctAnswer: 1,
      explanation: 'DISTINCT ON keeps the first row per key based on the ORDER BY — Postgres-only but extremely concise.',
    },
    {
      id: 'agq7',
      question: 'How do aggregates handle NULL?',
      options: ['They throw an error', 'They treat NULL as zero', 'They skip NULLs (except COUNT(*))', 'They return NULL if any input is NULL'],
      correctAnswer: 2,
      explanation: 'SUM/AVG/MIN/MAX/COUNT(col) skip NULLs. COUNT(*) counts every row. If all inputs are NULL, the aggregate itself returns NULL (except COUNT, which returns 0).',
    },
    {
      id: 'agq8',
      question: 'You want categories with at least 5 distinct products. Which clause?',
      options: ['WHERE COUNT(DISTINCT product_id) >= 5', 'HAVING COUNT(DISTINCT product_id) >= 5', 'GROUP BY 5', 'ORDER BY COUNT(*) >= 5'],
      correctAnswer: 1,
      explanation: 'Aggregate condition over a group → HAVING.',
    },
    {
      id: 'agq9',
      question: 'Why might AVG(price) on integer prices be wrong?',
      options: ['It rounds randomly', 'Integer division truncates the result', 'It excludes the max value', 'It includes NULLs as zero'],
      correctAnswer: 1,
      explanation: 'Some DBs use integer arithmetic when all inputs are integers — AVG could truncate. Cast to numeric/float to be safe.',
    },
    {
      id: 'agq10',
      question: 'Which two queries are guaranteed to return the same rows?',
      options: ['SELECT DISTINCT a vs SELECT a GROUP BY b', 'SELECT DISTINCT a, b vs SELECT a, b GROUP BY a, b', 'SELECT COUNT(*) vs COUNT(DISTINCT id)', 'WHERE vs HAVING with the same predicate'],
      correctAnswer: 1,
      explanation: 'DISTINCT on a set of columns is equivalent to GROUP BY on those same columns when there are no aggregates.',
    },
    {
      id: 'agq11',
      question: 'No orders were placed today. What does `SELECT SUM(total) FROM orders WHERE placed_at::date = CURRENT_DATE` return?',
      options: ['0', 'No rows', 'NULL', 'An error'],
      correctAnswer: 2,
      explanation: 'An aggregate over zero rows still returns one row, and SUM of nothing is NULL. COUNT would return 0. Use COALESCE(SUM(total), 0) to get a numeric zero.',
    },
    {
      id: 'agq12',
      question: 'Which query lists email addresses that appear more than once in users?',
      options: ['SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1', 'SELECT DISTINCT email FROM users WHERE COUNT(*) > 1', 'SELECT email, COUNT(*) FROM users WHERE COUNT(email) > 1', 'SELECT email FROM users ORDER BY COUNT(*) DESC LIMIT 1'],
      correctAnswer: 0,
      explanation: 'Group on the column that should be unique and filter groups with HAVING. Aggregates are not allowed in WHERE, so the other forms are invalid or wrong.',
    },
    {
      id: 'agq13',
      question: '100 users have country = NULL. How do they appear in `SELECT country, COUNT(*) FROM users GROUP BY country`?',
      options: ['They are excluded', '100 separate rows with country NULL', 'They are merged into the largest group', 'One row with country NULL and count 100'],
      correctAnswer: 3,
      explanation: 'GROUP BY treats NULLs as equal, so all NULL countries form a single group. Rows are never silently dropped by GROUP BY.',
    },
    {
      id: 'agq14',
      question: 'In a ROLLUP query, a row has GROUPING(plan) = 1. What does that mean?',
      options: ['The plan value for that row is genuinely NULL', 'The row is a subtotal where plan was rolled up', 'The row belongs to plan number 1', 'The plan column was excluded from SELECT'],
      correctAnswer: 1,
      explanation: 'GROUPING(col) is 1 exactly when col was aggregated away for that row. It is the reliable way to distinguish subtotal rows from real NULL data.',
    },
    {
      id: 'agq15',
      question: 'What can `SELECT COUNT(*) FROM logs WHERE level = \'error\' HAVING COUNT(*) > 100` return?',
      options: ['Always exactly one row', 'One row per level', 'Either one row or zero rows', 'A syntax error — HAVING needs GROUP BY'],
      correctAnswer: 2,
      explanation: 'Without GROUP BY the whole table is a single group. HAVING then keeps or discards that one group, so the result is one row or none.',
    },
    {
      id: 'agq16',
      question: 'Which expression computes the median of `total` in Postgres?',
      options: ['PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total)', 'MEDIAN(total)', 'AVG(total) FILTER (WHERE rank = 0.5)', 'NTILE(2) OVER (ORDER BY total)'],
      correctAnswer: 0,
      explanation: 'PERCENTILE_CONT is the standard ordered-set aggregate for percentiles. There is no MEDIAN() in Postgres, and NTILE assigns bucket numbers rather than computing a value.',
    },
    {
      id: 'agq17',
      question: 'Your daily orders report skips days with no orders. What is the fix?',
      options: ['Use COUNT(*) instead of COUNT(id)', 'LEFT JOIN orders onto a generated calendar of days and COUNT(o.id)', 'Add HAVING COUNT(*) >= 0', 'Replace GROUP BY with DISTINCT'],
      correctAnswer: 1,
      explanation: 'Rows that do not exist cannot be grouped. Generate every day first, LEFT JOIN the facts, and count the fact key so empty days become 0.',
    },
    {
      id: 'agq18',
      question: 'In strict SQL mode, what happens with `SELECT department, name, MAX(salary) FROM employees GROUP BY department`?',
      options: ['Returns the highest earner per department', 'Returns an arbitrary name per department', 'Returns one row per employee', 'Error — name is neither grouped nor aggregated'],
      correctAnswer: 3,
      explanation: 'Every non-aggregated column must be in GROUP BY. Even where MySQL allows it in lax mode, the name returned is arbitrary and not the top earner. Join back or use a window function.',
    },
    {
      id: 'agq19',
      question: 'amounts are 10, 10, 20. What does SUM(DISTINCT amount) return?',
      options: ['40', '30', '20', '3'],
      correctAnswer: 1,
      explanation: 'DISTINCT inside the aggregate removes the duplicate 10 before summing: 10 + 20 = 30. Plain SUM would give 40.',
    },
    {
      id: 'agq20',
      question: 'What does `GROUP BY GROUPING SETS ((country), (plan))` produce?',
      options: ['One row per (country, plan) pair', 'Per-country rows, per-plan rows, and a grand total', 'Per-country totals and per-plan totals only', 'The same as CUBE(country, plan)'],
      correctAnswer: 2,
      explanation: 'GROUPING SETS computes exactly the listed groupings. There is no (country, plan) set and no empty set (), so neither the cross-tab nor the grand total is included.',
    },
  ],
};

// =============================================================================
// 4. SUBQUERIES & CTEs (premium)
// =============================================================================
const sqlSubqueriesCTEs: SQLCategory = {
  id: 'sql-subqueries-ctes',
  name: 'Subqueries & CTEs',
  slug: 'sql-subqueries-ctes',
  description: 'Scalar, correlated, EXISTS, CTEs, and recursive WITH queries',
  icon: 'layers-outline',
  color: '#0EA5E9',
  colorDark: '#0369A1',
  premium: true,

  learnContent: [
    {
      id: 'sql-sub-1',
      title: 'Scalar, Row, and Table Subqueries',
      content: `A subquery is a SELECT wrapped in parentheses, used in three shapes:

**1. Scalar subquery** — returns exactly one row, one column. Usable like a value:
\`\`\`
WHERE price > (SELECT AVG(price) FROM products)
\`\`\`

**2. Row subquery** — returns one row, multiple columns. Compared as a tuple.

**3. Table subquery** — returns many rows. Used in \`FROM\`, \`IN\`, \`EXISTS\`. Often called a "derived table" when in FROM.

**Where they live:**
- In \`SELECT\` (scalar only): \`SELECT name, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS orders FROM users u\`
- In \`FROM\` (must be aliased): \`FROM (SELECT ... ) AS x\`
- In \`WHERE\`: with \`IN\`, \`EXISTS\`, \`= (...)\`, \`> ANY (...)\`, \`< ALL (...)\`.

**Don't over-use scalar-in-SELECT** — it often runs the subquery once per outer row. A JOIN or window function is usually faster.`,
      codeExample: `-- Scalar subquery: every product priced above the average
SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- Derived table in FROM
SELECT region, total_orders
FROM (
  SELECT region, COUNT(*) AS total_orders
  FROM orders
  GROUP BY region
) AS regional
WHERE total_orders > 100;

-- IN with a list subquery
SELECT *
FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 500);

-- Row subquery comparison
SELECT *
FROM employees
WHERE (department, level) = (
  SELECT department, MAX(level) FROM employees WHERE department = 'eng'
);`,
    },
    {
      id: 'sql-sub-2',
      title: 'Correlated Subqueries and EXISTS',
      content: `A **correlated subquery** references columns from the outer query — it conceptually runs once per outer row.

\`\`\`
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
)
\`\`\`

Here \`u.id\` comes from the outer \`users u\`. The inner query is re-evaluated for each user.

**EXISTS vs IN:**
- \`EXISTS (subquery)\` — true if the subquery returns at least one row.
- \`IN (subquery)\` — true if the value equals any returned value.
- **Critical difference**: EXISTS handles NULL correctly. NOT IN with NULLs in the subquery returns no rows. Prefer NOT EXISTS for anti-joins.

**ANY / ALL:**
- \`> ANY (subq)\` → true if greater than at least one returned value (same as MIN).
- \`> ALL (subq)\` → true only if greater than every returned value (same as MAX).

**Performance:** modern optimizers often unnest correlated subqueries into joins. Still, simpler joins are usually easier to read and reason about.`,
      codeExample: `-- Users who placed at least one order (EXISTS)
SELECT *
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- Users with NO orders (the NULL-safe anti-join)
SELECT *
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- Each order with the customer's lifetime average for context
SELECT
  o.id,
  o.total,
  (SELECT AVG(total) FROM orders WHERE customer_id = o.customer_id) AS lifetime_avg
FROM orders o;

-- > ANY vs > ALL
SELECT * FROM products
WHERE price > ANY (SELECT price FROM products WHERE brand = 'A');  -- > MIN

SELECT * FROM products
WHERE price > ALL (SELECT price FROM products WHERE brand = 'A');  -- > MAX`,
    },
    {
      id: 'sql-sub-3',
      title: 'Common Table Expressions (CTEs)',
      content: `A CTE — declared with \`WITH\` — is a named subquery that comes before the main \`SELECT\`. Think of it as a temporary view, scoped to one statement.

**Why use them:**
- **Readability** — break a complex query into named steps.
- **Reuse** — reference the same CTE multiple times.
- **Recursion** — CTEs are the only way to express recursive SQL.

**Syntax:**
\`\`\`
WITH active_users AS (
  SELECT id FROM users WHERE last_login > NOW() - INTERVAL '30 days'
),
recent_orders AS (
  SELECT * FROM orders WHERE placed_at > NOW() - INTERVAL '7 days'
)
SELECT a.id, COUNT(r.id)
FROM active_users a
LEFT JOIN recent_orders r ON r.user_id = a.id
GROUP BY a.id;
\`\`\`

**Materialization:** historically, Postgres materialized CTEs (computed them once into a temp result). Since Postgres 12, simple CTEs are inlined like subqueries. You can force materialization with \`WITH cte AS MATERIALIZED (...)\` or prevent it with \`NOT MATERIALIZED\`.`,
      codeExample: `-- Multi-step CTE pipeline
WITH paid_orders AS (
  -- Step 1: keep only completed orders
  SELECT user_id, total
  FROM orders
  WHERE status = 'paid'
),
user_totals AS (
  -- Step 2: total spend per user, built on step 1
  SELECT user_id, SUM(total) AS spent
  FROM paid_orders
  GROUP BY user_id
)
-- Final query reads the last CTE like a table
SELECT u.name, ut.spent
FROM users u
JOIN user_totals ut ON ut.user_id = u.id
WHERE ut.spent > 500
ORDER BY ut.spent DESC;

-- CTE that wraps a write (Postgres)
WITH inserted AS (
  -- Copy year-old posts to archive, capture their ids
  INSERT INTO archive (id, body)
  SELECT id, body FROM posts WHERE created_at < NOW() - INTERVAL '1 year'
  RETURNING id
)
-- Delete exactly what was archived, in one atomic statement
DELETE FROM posts WHERE id IN (SELECT id FROM inserted);`,
    },
    {
      id: 'sql-sub-4',
      title: 'Recursive CTEs',
      content: `Recursive CTEs let you walk hierarchies, graphs, sequences — anywhere you need to repeatedly extend a result set.

**Structure:**
\`\`\`
WITH RECURSIVE cte_name (cols) AS (
  -- anchor: starting rows (no self-reference)
  SELECT ...
  UNION ALL
  -- recursive part: extend by referencing cte_name
  SELECT ... FROM cte_name JOIN ... WHERE ...
)
SELECT * FROM cte_name;
\`\`\`

**Execution:** the anchor runs first; the recursive part runs repeatedly against the previously produced rows until it produces zero new rows.

**Use cases:**
- Organizational hierarchy (manager → reports → their reports)
- Folder/category trees
- Graph traversal (friend-of-friend within N hops)
- Generating sequences (numbers, dates) without a numbers table

**Termination:** always make sure the recursive query *eventually* returns no new rows. Add a depth limit or a visited-set guard for cyclic graphs.`,
      codeExample: `-- Org chart: every descendant of employee 1
WITH RECURSIVE reports AS (
  -- Anchor: the root employee we start from
  SELECT id, name, manager_id, 1 AS depth
  FROM employees
  WHERE id = 1

  UNION ALL

  -- Recursive step: add direct reports of rows found so far
  SELECT e.id, e.name, e.manager_id, r.depth + 1
  FROM employees e
  JOIN reports r ON e.manager_id = r.id
)
SELECT id, name, depth
FROM reports
ORDER BY depth, name;

-- Generate a date series (no numbers table needed)
WITH RECURSIVE days(d) AS (
  -- Anchor is the first date; each pass adds one more day
  SELECT DATE '2026-01-01'
  UNION ALL
  SELECT d + INTERVAL '1 day' FROM days
  WHERE d < DATE '2026-01-31'
)
SELECT d FROM days;

-- Cycle-safe friend traversal with depth limit
WITH RECURSIVE walk AS (
  -- Anchor: direct friends (hop 1)
  SELECT user_id, friend_id, 1 AS hop
  FROM friendships
  WHERE user_id = 42

  UNION ALL

  SELECT w.user_id, f.friend_id, w.hop + 1
  FROM walk w
  JOIN friendships f ON f.user_id = w.friend_id
  WHERE w.hop < 3            -- cap depth so it always terminates
)
SELECT DISTINCT friend_id FROM walk;`,
    },
    {
      id: 'sql-sub-5',
      title: 'Classic Subquery Interview Problems',
      content: `These four problems show up constantly. Each one hinges on a correlated subquery — the inner query references the outer row.

**1. Rows above their group's average.** "Employees earning more than their department's average." The subquery recomputes the average for the outer row's department.

**2. Nth highest value.** Two idioms:
- \`SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET n-1\` — simple, returns NULL-free empty result if fewer than n distinct values.
- Correlated count: keep salaries with exactly \`n-1\` distinct salaries above them. Works everywhere, including databases without LIMIT/OFFSET.

**3. Latest row per key without window functions.** Compare each row's timestamp to the MAX for the same key.

**4. Scalar subquery pitfalls:**
- If it returns **more than one row**, the query fails at runtime ("more than one row returned by a subquery used as an expression"). Aggregate, add LIMIT 1, or switch to IN.
- If it returns **zero rows**, it yields NULL — silently. A comparison against it becomes UNKNOWN and drops the row.
- The SELECT list of an EXISTS subquery is ignored: \`SELECT 1\` and \`SELECT *\` behave identically.`,
      codeExample: `-- 1. Employees above their department average
SELECT e.name, e.department, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(e2.salary)
  FROM employees e2
  WHERE e2.department = e.department
);

-- 2a. Third-highest distinct salary
SELECT DISTINCT salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 2;

-- 2b. Same, with a correlated count (portable)
SELECT DISTINCT e.salary
FROM employees e
WHERE 2 = (
  SELECT COUNT(DISTINCT e2.salary)
  FROM employees e2
  WHERE e2.salary > e.salary
);

-- 3. Latest order per customer via correlated MAX
SELECT o.*
FROM orders o
WHERE o.placed_at = (
  SELECT MAX(o2.placed_at)
  FROM orders o2
  WHERE o2.customer_id = o.customer_id
);

-- 4. Scalar subquery that can return many rows: runtime error
SELECT * FROM users
WHERE id = (SELECT user_id FROM orders WHERE total > 100);  -- fails if >1 row
-- Fix
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 100);`,
    },
    {
      id: 'sql-sub-6',
      title: 'Set Operations: UNION, INTERSECT, EXCEPT',
      content: `Set operations stack the results of two SELECTs vertically. Each side must return the **same number of columns** with compatible types; column names come from the first query.

- **UNION** — rows from either side, duplicates removed.
- **UNION ALL** — rows from either side, duplicates kept. Faster: no sort/hash for de-duplication.
- **INTERSECT** — rows present in both sides.
- **EXCEPT** (MINUS in Oracle) — rows in the first side that are not in the second.

**NULL handling differs from WHERE.** Set operations compare rows the way DISTINCT does: two NULLs count as equal. So \`EXCEPT\` is a NULL-safe way to express "in A but not in B" — unlike \`NOT IN\`.

**De-duplication is the default** for UNION, INTERSECT, and EXCEPT. Add \`ALL\` to keep duplicates (\`INTERSECT ALL\`, \`EXCEPT ALL\`) — bag semantics rather than set semantics.

**ORDER BY applies to the whole combined result**, and must come last. To sort each side independently, wrap it in a subquery — but the final order still needs an outer ORDER BY.

**Typical uses:** merging two similar tables into one feed (UNION ALL), reconciling data between systems (EXCEPT both ways), and splitting an OR across two indexable queries (UNION).`,
      codeExample: `-- One activity feed from two tables (keep every row)
SELECT id, created_at, 'post'    AS kind FROM posts
UNION ALL
SELECT id, created_at, 'comment' AS kind FROM comments
ORDER BY created_at DESC
LIMIT 50;

-- Reconciliation: rows that differ between staging and production
(SELECT id, email FROM users_staging
 EXCEPT
 SELECT id, email FROM users_prod)
UNION ALL
(SELECT id, email FROM users_prod
 EXCEPT
 SELECT id, email FROM users_staging);

-- Customers who bought in BOTH years
SELECT customer_id FROM orders WHERE placed_at >= '2025-01-01' AND placed_at < '2026-01-01'
INTERSECT
SELECT customer_id FROM orders WHERE placed_at >= '2026-01-01' AND placed_at < '2027-01-01';

-- EXCEPT treats NULLs as equal, NOT IN does not
SELECT region FROM warehouses
EXCEPT
SELECT region FROM stores;   -- a NULL region in both sides cancels out`,
    },
  ],

  visualizations: [
    {
      title: 'EXISTS vs IN',
      description: 'Both check membership, but only EXISTS is NULL-safe for NOT',
      nodes: [
        { id: 'in',     label: 'x IN (...)',           x: 60,  y: 50,  type: 'primary' },
        { id: 'exists', label: 'EXISTS (...)',         x: 220, y: 50,  type: 'success' },
        { id: 'notin',  label: 'NOT IN\n+ NULL = no rows', x: 60,  y: 150, type: 'error' },
        { id: 'notex',  label: 'NOT EXISTS\nworks with NULL', x: 220, y: 150, type: 'success' },
      ],
      edges: [
        { from: 'in',    to: 'notin' },
        { from: 'exists',to: 'notex' },
      ],
    },
    {
      title: 'Recursive CTE Flow',
      description: 'Anchor runs once, recursive part repeats until empty',
      nodes: [
        { id: 'anchor', label: 'Anchor\nseed rows',       x: 140, y: 40,  type: 'primary' },
        { id: 'rec',    label: 'Recursive step\nextend',  x: 140, y: 130, type: 'secondary' },
        { id: 'check',  label: 'New rows?',               x: 140, y: 210, type: 'warning' },
        { id: 'out',    label: 'Done',                    x: 140, y: 290, type: 'success' },
      ],
      edges: [
        { from: 'anchor', to: 'rec' },
        { from: 'rec',    to: 'check' },
        { from: 'check',  to: 'rec', label: 'yes' },
        { from: 'check',  to: 'out', label: 'no'  },
      ],
    },
  ],

  flashcards: [
    { id: 'sq1',  front: 'What is a scalar subquery?', back: 'A subquery that returns exactly one row and one column — usable anywhere a single value would go (SELECT, WHERE, etc.).' },
    { id: 'sq2',  front: 'What is a correlated subquery?', back: 'A subquery that references a column from the outer query, so it conceptually runs once per outer row. Often unnested by the optimizer into a join.' },
    { id: 'sq3',  front: 'EXISTS vs IN — when do they differ?', back: 'With NULL. NOT IN returns no rows if the subquery has any NULL. NOT EXISTS works correctly. EXISTS / IN behave the same on clean data but EXISTS often plans better.' },
    { id: 'sq4',  front: 'What does > ANY (subquery) mean?', back: 'True if the value is greater than at least one returned value. Equivalent to > MIN(subquery).' },
    { id: 'sq5',  front: 'What does > ALL (subquery) mean?', back: 'True only if greater than every returned value. Equivalent to > MAX(subquery).' },
    { id: 'sq6',  front: 'Where do subqueries live in a query?', back: 'In SELECT (scalar), FROM (derived table — must have alias), WHERE (IN/EXISTS/comparison), and HAVING.' },
    { id: 'sq7',  front: 'What is a CTE?', back: 'A "Common Table Expression" — a named subquery declared with WITH, scoped to one statement. Improves readability and enables recursion.' },
    { id: 'sq8',  front: 'Can a single WITH have multiple CTEs?', back: 'Yes. Comma-separate them: WITH a AS (...), b AS (...). Later CTEs can reference earlier ones.' },
    { id: 'sq9',  front: 'Are CTEs always materialized in Postgres?', back: 'Not since Postgres 12. Simple CTEs are inlined like subqueries. You can force with `AS MATERIALIZED` or prevent with `AS NOT MATERIALIZED`.' },
    { id: 'sq10', front: 'How does a recursive CTE work?', back: 'An anchor query runs once, producing seed rows. The recursive query then references the CTE itself, repeatedly extending the result until it produces zero new rows.' },
    { id: 'sq11', front: 'What keyword starts a recursive CTE?', back: 'WITH RECURSIVE (Postgres, SQLite, MySQL 8+). SQL Server uses just WITH; the recursion is detected automatically.' },
    { id: 'sq12', front: 'How do you stop a recursive CTE on a cyclic graph?', back: 'Add a depth counter and WHERE depth < N, or carry a visited-set array and exclude already-seen IDs.' },
    { id: 'sq13', front: 'When is a scalar subquery in SELECT a smell?', back: 'When it runs per outer row over a large table. A JOIN, GROUP BY, or window function is usually faster.' },
    { id: 'sq14', front: 'Does a derived table need an alias?', back: 'Yes — SQL requires every table in FROM (including subqueries) to be named.' },
    { id: 'sq15', front: 'What\'s the difference between a CTE and a temp table?', back: 'A CTE is scoped to one query and has no storage. A temp table persists for the session, can be indexed, and lets multiple queries share intermediate results.' },
    { id: 'sq16', front: 'Can CTEs write data?', back: 'In Postgres, yes — INSERT/UPDATE/DELETE with RETURNING can sit inside a WITH. The main query sees the affected rows. Other DBs vary.' },
    { id: 'sq17', front: 'What is UNION ALL vs UNION inside a recursive CTE?', back: 'UNION ALL keeps duplicates and is required for recursive CTEs. UNION (which dedupes) usually breaks recursion in standard SQL.' },
    { id: 'sq18', front: 'When is a subquery faster than a JOIN?', back: 'For semi-joins (EXISTS) on selective filters — the planner can stop scanning after the first match. JOINs sometimes do redundant work.' },
    { id: 'sq19', front: 'What happens if a scalar subquery returns more than one row?', back: 'A runtime error: "more than one row returned by a subquery used as an expression". Aggregate the subquery, add LIMIT 1, or use IN / EXISTS instead of =.' },
    { id: 'sq20', front: 'What does a scalar subquery yield when it matches zero rows?', back: 'NULL, with no error. Any comparison against it becomes UNKNOWN, so the outer row is silently filtered out — a common source of "missing rows" bugs.' },
    { id: 'sq21', front: 'CTE vs derived table in FROM — what\'s the real difference?', back: 'Same results and, since Postgres 12, usually the same plan. A CTE is named once and can be referenced repeatedly or recursively; a derived table is inline and single-use. Choose by readability.' },
    { id: 'sq22', front: 'Can a CTE reference another CTE defined later in the same WITH?', back: 'No. CTEs are visible only to CTEs that come after them (and to the main query). Only a recursive CTE may reference itself.' },
    { id: 'sq23', front: 'How do you track depth and path in a recursive CTE?', back: 'Carry extra columns: `1 AS depth` and `ARRAY[id] AS path` in the anchor, then `r.depth + 1` and `r.path || e.id` in the recursive step. The path doubles as a cycle guard: WHERE NOT e.id = ANY(r.path).' },
    { id: 'sq24', front: 'IN (subquery) vs = (subquery)?', back: '= requires the subquery to return at most one row (scalar) and errors otherwise. IN accepts any number of rows and is true if the value matches any of them.' },
    { id: 'sq25', front: 'How do you find employees earning more than their department\'s average?', back: 'Correlated subquery: WHERE e.salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.department = e.department). The inner query is re-evaluated for each outer department.' },
    { id: 'sq26', front: 'How do you get the nth highest distinct salary?', back: 'SELECT DISTINCT salary ORDER BY salary DESC LIMIT 1 OFFSET n-1, or a correlated count: WHERE n-1 = (SELECT COUNT(DISTINCT salary) FROM employees e2 WHERE e2.salary > e.salary).' },
    { id: 'sq27', front: 'When is `AS MATERIALIZED` a win, and when does it hurt?', back: 'Win: an expensive CTE referenced several times — compute once, reuse. Hurt: a CTE referenced once with a selective outer WHERE — materializing blocks the planner from pushing that predicate down, so it scans everything.' },
    { id: 'sq28', front: 'Why does a recursive CTE fail with "column has type X in non-recursive term but type Y overall"?', back: 'UNION ALL requires matching column types, and the anchor fixes them. If the anchor yields an int but the recursive step produces bigint or text, cast the anchor column explicitly (e.g. 1::bigint AS depth).' },
    { id: 'sq29', front: 'Does the SELECT list inside EXISTS matter?', back: 'No. EXISTS only checks whether any row comes back; SELECT 1, SELECT *, and SELECT NULL are equivalent and the planner ignores the projection.' },
    { id: 'sq30', front: 'How does EXCEPT handle NULLs compared with NOT IN?', back: 'EXCEPT compares rows like DISTINCT — two NULLs are equal — so it is NULL-safe. NOT IN uses = and returns no rows if the subquery contains a NULL. EXCEPT also de-duplicates and needs matching column lists.' },
  ],

  quizQuestions: [
    {
      id: 'sqq1',
      question: 'A subquery that returns one row and one column is called?',
      options: ['Correlated', 'Scalar', 'Recursive', 'Derived'],
      correctAnswer: 1,
      explanation: 'Scalar subqueries return a single value and can be used wherever a value is expected.',
    },
    {
      id: 'sqq2',
      question: 'Which is safer for an anti-join when NULLs might be present?',
      options: ['NOT IN (subquery)', 'NOT EXISTS (subquery)', 'EXCEPT', '!= ANY (subquery)'],
      correctAnswer: 1,
      explanation: 'NOT EXISTS is NULL-safe. NOT IN returns no rows if the subquery has any NULL.',
    },
    {
      id: 'sqq3',
      question: 'What does `> ALL (subquery)` mean?',
      options: ['Greater than at least one value', 'Greater than every value (greater than MAX)', 'Greater than the average', 'Equal to all values'],
      correctAnswer: 1,
      explanation: '`> ALL` requires the comparison to be true against every returned value — equivalent to > MAX.',
    },
    {
      id: 'sqq4',
      question: 'What keyword starts a CTE?',
      options: ['DECLARE', 'WITH', 'LET', 'USE'],
      correctAnswer: 1,
      explanation: 'WITH cte_name AS (SELECT ...).',
    },
    {
      id: 'sqq5',
      question: 'What\'s required for a recursive CTE?',
      options: ['Just WITH', 'WITH RECURSIVE plus UNION ALL between anchor and recursive parts', 'A WHILE loop', 'An OUT parameter'],
      correctAnswer: 1,
      explanation: 'Standard form: WITH RECURSIVE name AS (anchor UNION ALL recursive). The recursive arm references the CTE itself.',
    },
    {
      id: 'sqq6',
      question: 'A correlated subquery references which scope?',
      options: ['Only itself', 'A column from the outer query', 'The database catalog', 'A different schema'],
      correctAnswer: 1,
      explanation: 'It depends on a value from the outer query, conceptually re-evaluated per outer row.',
    },
    {
      id: 'sqq7',
      question: 'A derived table (subquery in FROM) requires what?',
      options: ['An index', 'An alias', 'A LIMIT', 'A primary key'],
      correctAnswer: 1,
      explanation: 'SQL requires every relation in FROM to be named — including subqueries.',
    },
    {
      id: 'sqq8',
      question: 'When does Postgres NOT inline a CTE?',
      options: ['Always', 'When you write `AS MATERIALIZED`', 'Never since v12', 'For SELECT-only CTEs'],
      correctAnswer: 1,
      explanation: 'Postgres 12+ inlines CTEs by default. `AS MATERIALIZED` forces it to compute the CTE once and reuse the result.',
    },
    {
      id: 'sqq9',
      question: 'How do you guarantee a recursive CTE terminates on a cyclic graph?',
      options: ['Use UNION instead of UNION ALL', 'Add a depth limit or track visited nodes', 'Use FOR loop', 'Use COMMIT'],
      correctAnswer: 1,
      explanation: 'A WHERE clause on a hop counter or a visited-set array prevents infinite recursion.',
    },
    {
      id: 'sqq10',
      question: 'Which is usually faster: a scalar subquery in SELECT or a JOIN?',
      options: ['Scalar subquery', 'JOIN', 'They\'re identical', 'Depends — but JOIN often wins on large data'],
      correctAnswer: 3,
      explanation: 'Per-row scalar subqueries can re-execute often. JOINs / window functions typically process the data in one pass.',
    },
    {
      id: 'sqq11',
      question: '`WHERE price > (SELECT price FROM products WHERE brand = \'A\')` — brand A has 3 products. What happens?',
      options: ['Compares against the highest price', 'Compares against the first price found', 'Runtime error: subquery returned more than one row', 'Returns no rows'],
      correctAnswer: 2,
      explanation: 'A subquery used with a comparison operator must be scalar. With three rows it fails at execution time. Use > ALL, > ANY, or an aggregate like MAX.',
    },
    {
      id: 'sqq12',
      question: 'A scalar subquery in WHERE matches zero rows. What is the effect on the outer query?',
      options: ['The subquery yields NULL, the comparison is UNKNOWN, and the row is dropped', 'A runtime error', 'The comparison is treated as TRUE', 'The outer query returns zero rows'],
      correctAnswer: 0,
      explanation: 'An empty scalar subquery quietly evaluates to NULL. Only rows compared against it are affected; the rest of the outer query is unaffected.',
    },
    {
      id: 'sqq13',
      question: 'Which query returns employees earning more than the average of their own department?',
      options: ['WHERE salary > (SELECT AVG(salary) FROM employees)', 'WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.department = e.department)', 'WHERE salary > AVG(salary) GROUP BY department', 'HAVING salary > AVG(salary)'],
      correctAnswer: 1,
      explanation: 'The subquery must be correlated on department so each employee is compared to their own group. Option A compares to the company-wide average; C and D are invalid uses of an aggregate.',
    },
    {
      id: 'sqq14',
      question: 'Which query returns the third-highest distinct salary?',
      options: ['SELECT MAX(salary) FROM employees LIMIT 3', 'SELECT salary FROM employees ORDER BY salary DESC LIMIT 3', 'SELECT DISTINCT salary FROM employees ORDER BY salary LIMIT 1 OFFSET 2', 'SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2'],
      correctAnswer: 3,
      explanation: 'Sort distinct salaries descending, skip two, take one. Option C sorts ascending (third-lowest), and B returns three rows that may include duplicates.',
    },
    {
      id: 'sqq15',
      question: 'What happens with `WITH a AS (...), b AS (SELECT * FROM c), c AS (...) SELECT * FROM b`?',
      options: ['Works — CTEs are resolved lazily', 'Error — c is not yet defined when b is declared', 'b returns an empty result', 'Only a and c are executed'],
      correctAnswer: 1,
      explanation: 'A CTE can only reference CTEs declared before it in the WITH list. Reorder so c comes before b.',
    },
    {
      id: 'sqq16',
      question: 'In a recursive CTE, the anchor selects `ARRAY[id] AS path` and the recursive step adds `WHERE NOT e.id = ANY(r.path)`. What does that condition do?',
      options: ['Prevents revisiting a node, so cycles terminate', 'Limits recursion depth to the array length', 'Removes duplicate rows from the output', 'Forces breadth-first order'],
      correctAnswer: 0,
      explanation: 'Each row carries the ids already on its path. Refusing to extend into an id already on the path means a cycle can never loop forever.',
    },
    {
      id: 'sqq17',
      question: 'Which is true of `EXISTS (SELECT * FROM orders o WHERE o.user_id = u.id)` vs `EXISTS (SELECT 1 ...)`?',
      options: ['SELECT * is slower because it reads every column', 'SELECT 1 can return wrong results', 'They are equivalent — the SELECT list is ignored', 'SELECT * requires a GROUP BY'],
      correctAnswer: 2,
      explanation: 'EXISTS only tests whether any row is produced. The planner discards the projection, so the two forms plan and perform identically.',
    },
    {
      id: 'sqq18',
      question: 'What does `WITH big AS NOT MATERIALIZED (SELECT ... FROM events)` allow that MATERIALIZED does not?',
      options: ['Referencing big more than once', 'Pushing the outer query\'s WHERE predicates down into the CTE', 'Using RECURSIVE', 'Writing data inside the CTE'],
      correctAnswer: 1,
      explanation: 'An inlined CTE is treated like a subquery, so a selective outer filter can be applied inside it and use indexes. A materialized CTE is computed in full first.',
    },
    {
      id: 'sqq19',
      question: 'Table a has values {1, NULL}; table b has {NULL}. What does `SELECT x FROM a EXCEPT SELECT x FROM b` return?',
      options: ['{1, NULL}', 'No rows', 'NULL only', '{1}'],
      correctAnswer: 3,
      explanation: 'Set operations compare rows with DISTINCT semantics, where two NULLs are considered equal. The NULL in a is cancelled by the NULL in b, leaving 1.',
    },
    {
      id: 'sqq20',
      question: 'Users has a correlated subquery in the SELECT list: `(SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id)`. What is the equivalent set-based rewrite?',
      options: ['CROSS JOIN orders then COUNT(*)', 'LEFT JOIN orders o ... GROUP BY u.id with COUNT(o.id)', 'INNER JOIN orders o ... GROUP BY u.id with COUNT(*)', 'WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)'],
      correctAnswer: 1,
      explanation: 'A LEFT JOIN plus COUNT(o.id) reproduces the per-user count including zeros in a single pass. INNER JOIN drops users with no orders and EXISTS only yields a boolean.',
    },
  ],
};

// =============================================================================
// 5. WINDOW FUNCTIONS (premium)
// =============================================================================
const sqlWindowFunctions: SQLCategory = {
  id: 'sql-window-functions',
  name: 'Window Functions',
  slug: 'sql-window-functions',
  description: 'PARTITION BY, ranking, running totals, LEAD/LAG, and frames',
  icon: 'analytics-outline',
  color: '#DB2777',
  colorDark: '#9D174D',
  premium: true,

  learnContent: [
    {
      id: 'sql-win-1',
      title: 'What is a Window Function?',
      content: `A window function computes a value across a set of rows **related** to the current row, **without collapsing** the result. Unlike GROUP BY, the original row count is preserved.

**Syntax:**
\`\`\`
function() OVER (
  PARTITION BY ...    -- optional: split rows into groups
  ORDER BY ...        -- optional: order within each group
  ROWS / RANGE ...    -- optional: frame within the partition
)
\`\`\`

**Two big families:**
1. **Ranking** — \`ROW_NUMBER\`, \`RANK\`, \`DENSE_RANK\`, \`NTILE\`.
2. **Aggregate-as-window** — \`SUM\`, \`AVG\`, \`COUNT\`, \`MIN\`, \`MAX\` used \`OVER\`.

**Difference from GROUP BY:**
- \`GROUP BY country\` returns 1 row per country.
- \`AVG(price) OVER (PARTITION BY country)\` returns every original row, each annotated with its country's average. Like a JOIN to a per-group aggregate, but in one pass.`,
      codeExample: `-- Each employee with their dept's average salary (no group collapse)
SELECT
  name,
  department,
  salary,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg,
  salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg
FROM employees;

-- Compare to GROUP BY (loses individual rows)
SELECT department, AVG(salary) AS dept_avg
FROM employees
GROUP BY department;

-- Same aggregate, no PARTITION BY = window over the whole table
SELECT name, salary, AVG(salary) OVER () AS overall_avg
FROM employees;`,
    },
    {
      id: 'sql-win-2',
      title: 'Ranking: ROW_NUMBER, RANK, DENSE_RANK',
      content: `Three ranking functions, three behaviors when ties happen.

**ROW_NUMBER():** assigns 1, 2, 3, ... regardless of ties. Two equal values get different numbers.

**RANK():** assigns the same rank to ties, then **skips** numbers. 1, 2, 2, 4.

**DENSE_RANK():** ties share a rank but the next rank is consecutive. 1, 2, 2, 3.

**NTILE(n):** divides rows into n roughly equal buckets — useful for percentiles or quartiles.

**Top-N per group:** the canonical pattern. Use \`ROW_NUMBER() OVER (PARTITION BY group_key ORDER BY sort_key DESC)\` in a subquery, then filter where the number ≤ N in the outer query.

**Tie-breaking:** make the \`ORDER BY\` deterministic by adding a tiebreaker like \`id\` to avoid non-deterministic results on equal sort keys.`,
      codeExample: `-- Compare ranking functions on tied scores
SELECT
  name,
  score,
  ROW_NUMBER() OVER (ORDER BY score DESC)  AS row_num,
  RANK()       OVER (ORDER BY score DESC)  AS rank,
  DENSE_RANK() OVER (ORDER BY score DESC)  AS dense_rank
FROM players;
/*
 name  | score | row_num | rank | dense_rank
-------+-------+---------+------+-----------
 Ada   |   95  |    1    |   1  |    1
 Bo    |   90  |    2    |   2  |    2
 Cas   |   90  |    3    |   2  |    2
 Dee   |   80  |    4    |   4  |    3
*/

-- Top 3 highest-paid per department
SELECT department, name, salary
FROM (
  SELECT
    department, name, salary,
    ROW_NUMBER() OVER (
      PARTITION BY department
      ORDER BY salary DESC, id   -- id as tiebreaker
    ) AS rn
  FROM employees
) ranked
WHERE rn <= 3;`,
    },
    {
      id: 'sql-win-3',
      title: 'LEAD, LAG, and Frames',
      content: `**LAG(col, n)** returns the value n rows before the current row (within the partition).
**LEAD(col, n)** returns the value n rows after.
Both take an optional default for rows where no neighbor exists.

Great for:
- Day-over-day deltas
- Time between events
- Detecting changes (compare current vs previous status)

**Window frames** define which rows are "in scope" for the window. Default for aggregates with ORDER BY is \`RANGE UNBOUNDED PRECEDING\` — every row from the start of the partition up to the current row.

**Frame syntax:**
\`\`\`
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW          -- running total
ROWS BETWEEN 6 PRECEDING AND CURRENT ROW                  -- 7-day moving sum
ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING  -- full partition
\`\`\`

\`ROWS\` counts physical rows; \`RANGE\` compares values (useful for time-based frames like "last 7 days").

**FIRST_VALUE / LAST_VALUE / NTH_VALUE** pick a specific row in the frame.`,
      codeExample: `-- Day-over-day change in active users
SELECT
  day,
  active_users,
  -- LAG pulls the previous row's value (NULL on the first row)
  LAG(active_users)   OVER (ORDER BY day) AS yesterday,
  active_users - LAG(active_users) OVER (ORDER BY day) AS delta
FROM daily_metrics;

-- Running total of revenue per customer over time
SELECT
  customer_id,
  placed_at,
  total,
  -- Frame grows one row at a time = cumulative sum
  SUM(total) OVER (
    PARTITION BY customer_id
    ORDER BY placed_at
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM orders;

-- 7-day moving average of signups
SELECT
  day,
  -- Frame: this row plus the 6 before it (7-day window)
  AVG(signups) OVER (
    ORDER BY day
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d
FROM daily_signups;

-- First and last order amount for each customer
SELECT DISTINCT
  customer_id,
  FIRST_VALUE(total) OVER w AS first_order,
  LAST_VALUE(total)  OVER w AS last_order
FROM orders
-- Full-partition frame so LAST_VALUE can see the final row
WINDOW w AS (
  PARTITION BY customer_id
  ORDER BY placed_at
  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
);`,
    },
    {
      id: 'sql-win-4',
      title: 'Common Patterns: Gaps, Islands, and Sessionization',
      content: `**Sessionization** — grouping consecutive events that are "close enough" in time. Classic algorithm:

1. \`LAG\` over events to get the previous event's timestamp per user.
2. Mark a row as a new session if the gap exceeds your threshold.
3. \`SUM\` the new-session flag as a window function to build a session id.

**Gaps and islands** — finding runs of consecutive values:
- Number the rows globally with \`ROW_NUMBER()\`.
- Subtract from the value (or date).
- Equal differences → same island.

**Percent of total** — divide each row's value by the partition sum:
\`\`\`
SUM(x) OVER (PARTITION BY group_key) -- denominator
\`\`\`

**Cumulative distribution / percentile:**
\`PERCENT_RANK()\`, \`CUME_DIST()\`, \`NTILE(100)\`.

**WINDOW clause for reuse:** if multiple window functions share the same OVER, define it once:
\`\`\`
WINDOW w AS (PARTITION BY ... ORDER BY ...)
... SUM(x) OVER w, AVG(x) OVER w ...
\`\`\``,
      codeExample: `-- Sessionize page views with a 30-minute idle gap
WITH events AS (
  -- Step 1: seconds since the same user's previous view
  SELECT
    user_id,
    viewed_at,
    EXTRACT(EPOCH FROM (
      viewed_at - LAG(viewed_at) OVER (PARTITION BY user_id ORDER BY viewed_at)
    )) AS gap_seconds
  FROM page_views
),
flagged AS (
  -- Step 2: first view or a 30+ minute gap starts a session
  SELECT
    *,
    CASE WHEN gap_seconds IS NULL OR gap_seconds > 1800 THEN 1 ELSE 0 END AS new_session
  FROM events
)
-- Step 3: running sum of the flags numbers each session
SELECT
  user_id,
  viewed_at,
  SUM(new_session) OVER (
    PARTITION BY user_id ORDER BY viewed_at
  ) AS session_id
FROM flagged;

-- Percent of total: each product's share of category revenue
SELECT
  product_id,
  category_id,
  revenue,
  revenue * 100.0 / SUM(revenue) OVER (PARTITION BY category_id) AS pct_of_category
FROM product_sales;

-- WINDOW clause to avoid repetition
SELECT
  date,
  signups,
  AVG(signups) OVER w AS moving_avg,
  SUM(signups) OVER w AS moving_sum
FROM daily_signups
WINDOW w AS (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW);`,
    },
    {
      id: 'sql-win-5',
      title: 'Frames in Depth: ROWS vs RANGE and Tied Rows',
      content: `The frame is the sub-range of the partition a window aggregate actually sees. Getting it wrong produces numbers that look plausible and are quietly incorrect.

**The default frame surprise.** When you write \`SUM(x) OVER (ORDER BY d)\` with no explicit frame, you get \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`. RANGE is defined by **value**, so "current row" means "all rows with the same ORDER BY value" — the *peers*. Every tied row gets the same cumulative sum, which is not a row-by-row running total.

**ROWS** is defined by **position**. \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` gives a true running total, advancing one physical row at a time — but the order among ties is whatever the sort produced, so add a tiebreaker to ORDER BY for determinism.

**RANGE with an offset** needs a numeric or interval ORDER BY column and works on the *values*: \`RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW\` means "everything dated within the last week", even if some days are missing. \`ROWS BETWEEN 6 PRECEDING\` would silently span more than a week whenever days are missing.

**Ranking functions ignore frames** — ROW_NUMBER, RANK, LAG, LEAD always work over the whole ordered partition. Frames only affect aggregate-style functions and FIRST_VALUE / LAST_VALUE / NTH_VALUE.`,
      codeExample: `-- Sales on Jan 1 (10 and 20) and Jan 2 (5)
-- Default RANGE frame: peers share a sum -> 30, 30, 35
SELECT day, amount,
  SUM(amount) OVER (ORDER BY day) AS range_sum
FROM sales;

-- ROWS frame: true running total -> 10, 30, 35
SELECT day, amount,
  SUM(amount) OVER (
    ORDER BY day, id            -- tiebreaker keeps it deterministic
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM sales;

-- Time-based window that tolerates missing days
SELECT day, signups,
  SUM(signups) OVER (
    ORDER BY day
    RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW
  ) AS trailing_7d
FROM daily_signups;

-- Trailing average of the previous 3 rows, excluding today
SELECT day, price,
  AVG(price) OVER (
    ORDER BY day
    ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING
  ) AS prev_3_avg
FROM prices;`,
    },
    {
      id: 'sql-win-6',
      title: 'Gaps and Islands, Dedup, and Windows over GROUP BY',
      content: `**Gaps and islands** — "find runs of consecutive days a user was active" — is the most common hard window question.

The trick: number the rows with \`ROW_NUMBER()\` and subtract that from the value. Inside a consecutive run, both increase by one per row, so the difference is **constant**; when the run breaks, the difference jumps. GROUP BY the difference to get one row per island.

**Finding the gaps** themselves is easier with \`LEAD\`: look at the next value and report where \`next - current > 1\`.

**De-duplication with ROW_NUMBER.** Partition by the columns that define a duplicate, order by whichever copy you want to keep, and delete every row whose number is greater than 1. This is the standard "remove duplicate rows but keep one" answer.

**Windows on top of GROUP BY.** Window functions run *after* GROUP BY and HAVING, so they see the aggregated rows. \`SUM(SUM(total)) OVER (ORDER BY month)\` is legal and means "running total of monthly totals". \`COUNT(*) OVER ()\` in a paginated query returns the total row count on every row, saving a second query.

**Top-N with ties.** \`ROW_NUMBER() <= 3\` gives exactly three rows. \`RANK() <= 3\` includes tied rows but may skip values. \`DENSE_RANK() <= 3\` gives all rows with the three highest *distinct* values — usually what "top 3 salaries" means.`,
      codeExample: `-- Islands: streaks of consecutive active days per user
WITH numbered AS (
  SELECT user_id, active_day,
    active_day - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY active_day))::int AS grp
  FROM user_activity
)
SELECT user_id,
       MIN(active_day) AS streak_start,
       MAX(active_day) AS streak_end,
       COUNT(*)        AS streak_len
FROM numbered
GROUP BY user_id, grp
ORDER BY user_id, streak_start;

-- Gaps: missing id ranges in a sequence
SELECT id + 1 AS gap_start, next_id - 1 AS gap_end
FROM (
  SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id
  FROM tickets
) t
WHERE next_id - id > 1;

-- Dedupe: keep the oldest row per email, delete the rest
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
  FROM users
)
DELETE FROM users
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Running total over aggregated rows + total count for pagination
SELECT
  DATE_TRUNC('month', placed_at) AS month,
  SUM(total)                     AS monthly,
  SUM(SUM(total)) OVER (ORDER BY DATE_TRUNC('month', placed_at)) AS cumulative,
  COUNT(*) OVER ()               AS total_months
FROM orders
GROUP BY 1
ORDER BY 1;`,
    },
  ],

  visualizations: [
    {
      title: 'ROW_NUMBER vs RANK vs DENSE_RANK',
      description: 'How ties affect numbering',
      nodes: [
        { id: 'rn',  label: 'ROW_NUMBER\n1, 2, 3, 4',     x: 60,  y: 50,  type: 'primary' },
        { id: 'rk',  label: 'RANK\n1, 2, 2, 4 (skip)',    x: 220, y: 50,  type: 'warning' },
        { id: 'dr',  label: 'DENSE_RANK\n1, 2, 2, 3',     x: 140, y: 150, type: 'success' },
      ],
      edges: [],
    },
    {
      title: 'Running Total Frame',
      description: 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
      nodes: [
        { id: 'r1',  label: 'row 1\nsum: 10',  x: 60,  y: 40,  type: 'primary' },
        { id: 'r2',  label: 'row 2\nsum: 25',  x: 60,  y: 110, type: 'primary' },
        { id: 'r3',  label: 'row 3\nsum: 40',  x: 60,  y: 180, type: 'primary' },
        { id: 'r4',  label: 'row 4\nsum: 55',  x: 60,  y: 250, type: 'success' },
        { id: 'note', label: 'each row\nsums itself\n+ all prior', x: 220, y: 140, type: 'info' },
      ],
      edges: [
        { from: 'r1', to: 'r2' },
        { from: 'r2', to: 'r3' },
        { from: 'r3', to: 'r4' },
      ],
    },
  ],

  flashcards: [
    { id: 'wn1',  front: 'How is a window function different from GROUP BY?', back: 'Window functions compute across related rows but preserve the original row count. GROUP BY collapses each group into one row.' },
    { id: 'wn2',  front: 'What does PARTITION BY do in a window?', back: 'Splits rows into independent groups; the window function restarts for each partition.' },
    { id: 'wn3',  front: 'Difference between ROW_NUMBER and RANK?', back: 'ROW_NUMBER gives sequential numbers ignoring ties. RANK gives equal numbers to ties and skips the next value (1,2,2,4).' },
    { id: 'wn4',  front: 'Difference between RANK and DENSE_RANK?', back: 'RANK skips numbers after ties (1,2,2,4). DENSE_RANK doesn\'t (1,2,2,3).' },
    { id: 'wn5',  front: 'What does NTILE(4) do?', back: 'Divides rows into 4 buckets of roughly equal size, labeled 1–4. Useful for quartiles.' },
    { id: 'wn6',  front: 'What does LAG(x, 1) return?', back: 'The value of column x from the row one position earlier in the partition (or NULL if there\'s no previous row).' },
    { id: 'wn7',  front: 'What\'s the default window frame for aggregates with ORDER BY?', back: 'RANGE UNBOUNDED PRECEDING — from the partition start through the current row (and any ties at the current position).' },
    { id: 'wn8',  front: 'Difference between ROWS and RANGE in a frame?', back: 'ROWS counts physical rows. RANGE compares values — `RANGE BETWEEN INTERVAL \'7 days\' PRECEDING AND CURRENT ROW` works on time even with gaps.' },
    { id: 'wn9',  front: 'How do you compute a running total?', back: 'SUM(x) OVER (ORDER BY t ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).' },
    { id: 'wn10', front: 'How do you compute a 7-day moving average?', back: 'AVG(x) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW).' },
    { id: 'wn11', front: 'How do you get the latest row per group with window functions?', back: 'Inner SELECT: ROW_NUMBER() OVER (PARTITION BY group ORDER BY sort_col DESC) AS rn. Outer: WHERE rn = 1.' },
    { id: 'wn12', front: 'What does FIRST_VALUE return?', back: 'The value of the specified column from the first row of the window frame.' },
    { id: 'wn13', front: 'Why is LAST_VALUE often wrong with the default frame?', back: 'The default frame ends at the current row, so LAST_VALUE = current row. Extend the frame to UNBOUNDED FOLLOWING to get the partition\'s actual last value.' },
    { id: 'wn14', front: 'Can you use window functions in WHERE?', back: 'No — windows run after WHERE in the logical order. Wrap in a subquery / CTE and filter in the outer query.' },
    { id: 'wn15', front: 'How does WINDOW w AS (...) help?', back: 'Lets you name a window definition once and reuse it across multiple OVER w clauses — DRY when several aggregates share the same partition/order.' },
    { id: 'wn16', front: 'How do you compute percent-of-total per row?', back: 'value * 100.0 / SUM(value) OVER (PARTITION BY group_key) — current row divided by the partition\'s sum.' },
    { id: 'wn17', front: 'What\'s a sessionization?', back: 'Grouping consecutive events that are within a time threshold. LAG to find gaps, flag new sessions, then SUM the flag in a window to assign session IDs.' },
    { id: 'wn18', front: 'What does PERCENT_RANK return?', back: 'Relative rank between 0 and 1: (rank - 1) / (total_rows - 1). Useful for percentile-style sorting.' },
    { id: 'wn19', front: 'Why does SUM(x) OVER (ORDER BY day) give equal totals to rows with the same day?', back: 'The default frame is RANGE, which is value-based: "current row" includes all peers with the same ORDER BY value. Use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW (plus a tiebreaker) for a true row-by-row running total.' },
    { id: 'wn20', front: 'What does the third argument of LAG(x, 1, 0) do?', back: 'It is the default returned when there is no previous row — here 0 instead of NULL. Handy so the first row\'s delta is x - 0 rather than NULL.' },
    { id: 'wn21', front: 'How does the gaps-and-islands trick identify consecutive runs?', back: 'Subtract ROW_NUMBER() from the value (or date). Within a consecutive run both rise by one per row, so the difference stays constant; it jumps at each break. GROUP BY that difference to get one row per island.' },
    { id: 'wn22', front: 'How do you find missing values in a sequence with LEAD?', back: 'SELECT id + 1 AS gap_start, LEAD(id) OVER (ORDER BY id) - 1 AS gap_end, then keep rows where the next id minus the current is greater than 1.' },
    { id: 'wn23', front: 'What is COUNT(*) OVER () useful for?', back: 'It returns the total row count on every row without collapsing them — the standard way to return a paginated page plus the total number of results in one query.' },
    { id: 'wn24', front: 'What does adding ORDER BY inside OVER do to an aggregate like SUM?', back: 'It switches the aggregate from whole-partition to cumulative: an implicit frame from the partition start to the current row appears. Without ORDER BY, every row gets the partition total.' },
    { id: 'wn25', front: 'How do you delete duplicate rows but keep one copy?', back: 'ROW_NUMBER() OVER (PARTITION BY dup_columns ORDER BY id) in a CTE, then DELETE rows whose number is greater than 1. The ORDER BY decides which copy survives.' },
    { id: 'wn26', front: 'Can you nest a window function inside another window or an aggregate?', back: 'No — SUM(ROW_NUMBER() OVER ...) or AVG(x) OVER (...) OVER (...) are errors. Compute the first window in a CTE or subquery, then apply the next layer on top.' },
    { id: 'wn27', front: 'Which ranking function gives "top 3 salaries" including everyone tied at those values?', back: 'DENSE_RANK() <= 3 — it returns every row holding one of the three highest distinct values. ROW_NUMBER cuts ties arbitrarily; RANK can skip values after a tie.' },
    { id: 'wn28', front: 'What does CUME_DIST return?', back: 'The fraction of rows in the partition whose ORDER BY value is less than or equal to the current row\'s: rows_at_or_below / total_rows, in (0, 1]. PERCENT_RANK is (rank - 1) / (total - 1) and starts at 0.' },
    { id: 'wn29', front: 'Can you combine window functions with GROUP BY in the same query?', back: 'Yes — windows run after GROUP BY, so they operate on the grouped rows. SUM(SUM(total)) OVER (ORDER BY month) is a running total of monthly totals.' },
    { id: 'wn30', front: 'What is the main performance cost of window functions?', back: 'Each distinct PARTITION BY / ORDER BY combination needs its own sort of the input. Share specs via a WINDOW clause, and an index on (partition_cols, order_cols) can supply the order and skip the sort.' },
  ],

  quizQuestions: [
    {
      id: 'wnq1',
      question: 'How is a window function different from GROUP BY?',
      options: ['Faster execution', 'Returns the same number of rows as the input', 'Requires DISTINCT', 'Can\'t use ORDER BY'],
      correctAnswer: 1,
      explanation: 'Windows annotate each row with a computed value over related rows. GROUP BY collapses each group to one row.',
    },
    {
      id: 'wnq2',
      question: 'For scores [95, 90, 90, 80], what does RANK() return?',
      options: ['1, 2, 3, 4', '1, 2, 2, 3', '1, 2, 2, 4', '1, 1, 1, 2'],
      correctAnswer: 2,
      explanation: 'RANK gives ties the same number, then skips. ROW_NUMBER would be 1,2,3,4; DENSE_RANK would be 1,2,2,3.',
    },
    {
      id: 'wnq3',
      question: 'How do you get the top-3 highest-paid employees per department?',
      options: ['MAX(salary) GROUP BY department', 'ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) ≤ 3', 'LIMIT 3', 'DISTINCT department'],
      correctAnswer: 1,
      explanation: 'Standard "top-N per group" pattern with a window function.',
    },
    {
      id: 'wnq4',
      question: 'What does LAG(price, 1) return?',
      options: ['The next row\'s price', 'The previous row\'s price', 'The minimum price', 'The total price'],
      correctAnswer: 1,
      explanation: 'LAG looks backward. LEAD looks forward.',
    },
    {
      id: 'wnq5',
      question: 'Which frame computes a true running total?',
      options: ['ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING', 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING', 'No frame needed'],
      correctAnswer: 1,
      explanation: 'A running total sums everything from the start of the partition up through the current row.',
    },
    {
      id: 'wnq6',
      question: 'Why is LAST_VALUE often surprising?',
      options: ['It\'s buggy', 'The default frame ends at the current row, so it returns the current value', 'It only works on numbers', 'It needs PARTITION BY'],
      correctAnswer: 1,
      explanation: 'Default frame is "current row and prior". Use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.',
    },
    {
      id: 'wnq7',
      question: 'Can you use a window function in WHERE?',
      options: ['Yes, always', 'No — windows run after WHERE; wrap in a subquery', 'Only with PARTITION BY', 'Only on numeric columns'],
      correctAnswer: 1,
      explanation: 'Windows run after WHERE in the logical order, so filter in an outer query.',
    },
    {
      id: 'wnq8',
      question: 'Which window expression computes a 7-day moving average?',
      options: ['AVG(x) OVER (ORDER BY day)', 'AVG(x) OVER (PARTITION BY day)', 'AVG(x) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)', 'AVG(x) GROUP BY day'],
      correctAnswer: 2,
      explanation: 'Six rows before plus the current row = 7-row window.',
    },
    {
      id: 'wnq9',
      question: 'What does AVG(x) OVER () (no partition or order) return?',
      options: ['NULL', 'The average of the whole result set, repeated on every row', 'An error', 'The current row\'s value'],
      correctAnswer: 1,
      explanation: 'Empty OVER means "the entire result set" — perfect for "current value vs overall average" comparisons.',
    },
    {
      id: 'wnq10',
      question: 'Why use WINDOW w AS (...) at the end of the query?',
      options: ['Performance', 'To name and reuse the same window definition across multiple functions', 'It\'s required', 'To avoid GROUP BY'],
      correctAnswer: 1,
      explanation: 'Lets you write SUM(x) OVER w, AVG(x) OVER w without repeating the PARTITION/ORDER spec.',
    },
    {
      id: 'wnq11',
      question: 'sales rows: (Jan 1, 10), (Jan 1, 20), (Jan 2, 5). What does `SUM(amount) OVER (ORDER BY day)` return, in that order?',
      options: ['10, 30, 35', '30, 30, 35', '10, 20, 5', '35, 35, 35'],
      correctAnswer: 1,
      explanation: 'The default frame is RANGE ... CURRENT ROW, and RANGE includes all peers with the same day. Both Jan 1 rows see 10 + 20 = 30. A ROWS frame would give 10, 30, 35.',
    },
    {
      id: 'wnq12',
      question: 'What does `LAG(sales, 1, 0) OVER (ORDER BY day)` return on the first row?',
      options: ['NULL', 'The first row\'s own value', '0', 'An error'],
      correctAnswer: 2,
      explanation: 'The third argument is the default used when no preceding row exists. Without it, LAG would return NULL on the first row.',
    },
    {
      id: 'wnq13',
      question: 'A user was active on days 1, 2, 3, 5, 6. With `day - ROW_NUMBER() OVER (ORDER BY day)`, what values do you get?',
      options: ['1, 2, 3, 5, 6', '0, 0, 0, 1, 1', '1, 1, 1, 2, 2', '0, 1, 2, 3, 4'],
      correctAnswer: 1,
      explanation: 'Row numbers are 1..5, so 1-1, 2-2, 3-3 = 0 and 5-4, 6-5 = 1. Two distinct differences mean two islands: days 1–3 and days 5–6.',
    },
    {
      id: 'wnq14',
      question: 'Which query removes duplicate emails while keeping the row with the lowest id?',
      options: ['DELETE FROM users WHERE email IN (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1)', 'DELETE FROM users WHERE id NOT IN (SELECT MIN(id) FROM users)', 'DELETE FROM users WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) rn FROM users) t WHERE rn > 1)', 'DELETE FROM users USING users u2 WHERE users.email = u2.email'],
      correctAnswer: 2,
      explanation: 'Numbering within each email group and deleting rn > 1 keeps exactly one row per email, the lowest id. Option A deletes every copy including the one to keep, and B keeps only one row in the whole table.',
    },
    {
      id: 'wnq15',
      question: 'You need everyone earning one of the three highest distinct salaries, including ties. Which filter?',
      options: ['ROW_NUMBER() OVER (ORDER BY salary DESC) <= 3', 'RANK() OVER (ORDER BY salary DESC) <= 3', 'NTILE(3) OVER (ORDER BY salary DESC) = 1', 'DENSE_RANK() OVER (ORDER BY salary DESC) <= 3'],
      correctAnswer: 3,
      explanation: 'DENSE_RANK numbers distinct values consecutively, so <= 3 captures all rows at the three highest salaries. RANK skips after ties (two people at rank 1 push the next to 3, dropping the third value), and ROW_NUMBER cuts ties arbitrarily.',
    },
    {
      id: 'wnq16',
      question: 'In a query with `GROUP BY month`, what does `SUM(SUM(total)) OVER (ORDER BY month)` compute?',
      options: ['A syntax error — aggregates cannot nest', 'The grand total on every row', 'A running total of the monthly totals', 'Each month\'s total counted twice'],
      correctAnswer: 2,
      explanation: 'The inner SUM is the GROUP BY aggregate; the outer SUM is a window over those grouped rows. Windows run after GROUP BY, so this is a cumulative sum of monthly sums.',
    },
    {
      id: 'wnq17',
      question: 'You return page 3 of search results and also need the total number of matches, in one query. What do you add?',
      options: ['COUNT(*) GROUP BY page', 'COUNT(*) OVER ()', 'ROW_NUMBER() OVER ()', 'A second query with COUNT(*)'],
      correctAnswer: 1,
      explanation: 'COUNT(*) OVER () annotates every row with the total count of the filtered result before LIMIT is applied, so a separate count query is unnecessary.',
    },
    {
      id: 'wnq18',
      question: 'ticket ids are 1, 2, 5, 6. For the row with id = 2, what does `LEAD(id) OVER (ORDER BY id) - id` return?',
      options: ['1', '2', '3', 'NULL'],
      correctAnswer: 2,
      explanation: 'LEAD(id) for id = 2 is 5, and 5 - 2 = 3. A difference greater than 1 flags a gap covering ids 3 and 4.',
    },
    {
      id: 'wnq19',
      question: 'Which of these is NOT allowed?',
      options: ['SUM(total) OVER (PARTITION BY customer_id)', 'AVG(SUM(total)) OVER () after GROUP BY customer_id', 'AVG(ROW_NUMBER() OVER (ORDER BY id))', 'ROW_NUMBER() OVER (ORDER BY SUM(total) DESC) after GROUP BY customer_id'],
      correctAnswer: 2,
      explanation: 'A window function cannot be an input to an aggregate (or another window) in the same SELECT. Options B and D are fine because the aggregate is computed by GROUP BY first and the window runs on top.',
    },
    {
      id: 'wnq20',
      question: '`NTILE(4) OVER (ORDER BY score)` over 10 rows — what are the bucket sizes?',
      options: ['3, 3, 2, 2', '2, 2, 3, 3', '4, 4, 2, 0', '2, 3, 2, 3'],
      correctAnswer: 0,
      explanation: '10 / 4 leaves a remainder of 2, and NTILE gives the extra rows to the earliest buckets, so the first two buckets get 3 rows and the last two get 2.',
    },
  ],
};

// =============================================================================
// 6. INDEXES & PERFORMANCE (premium)
// =============================================================================
const sqlIndexesPerformance: SQLCategory = {
  id: 'sql-indexes-performance',
  name: 'Indexes & Performance',
  slug: 'sql-indexes-performance',
  description: 'B-tree, composite, covering indexes, EXPLAIN, and query tuning',
  icon: 'speedometer-outline',
  color: '#D97706',
  colorDark: '#92400E',
  premium: true,

  learnContent: [
    {
      id: 'sql-perf-1',
      title: 'How Indexes Work',
      content: `An index is a separate data structure that maps column values to row locations, so the database can find rows without scanning the whole table.

**B-tree** is the default and most common index. Sorted, balanced, supports:
- Equality (\`=\`)
- Ranges (\`<\`, \`<=\`, \`>\`, \`>=\`, \`BETWEEN\`)
- Prefix \`LIKE\` (\`'foo%'\`)
- \`ORDER BY\` on the indexed column (avoids a sort)

**Hash index** (Postgres has them, but rarely used) only supports equality — slightly faster point lookups but no range queries.

**GIN / GiST** indexes for arrays, full-text search, JSON containment.

**Trade-offs:**
- Indexes speed up reads but slow down writes — every insert/update must maintain the index.
- Indexes take disk space.
- More indexes ≠ better. Index only what your queries actually filter, join, or sort on.`,
      codeExample: `-- Create a basic B-tree index
CREATE INDEX idx_users_email ON users (email);

-- Unique index (also enforces uniqueness)
CREATE UNIQUE INDEX idx_users_email_uniq ON users (email);

-- Index on an expression
CREATE INDEX idx_users_lower_email ON users (LOWER(email));
-- Now this query can use the index:
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- Partial index — only index rows you care about
CREATE INDEX idx_orders_pending ON orders (placed_at)
WHERE status = 'pending';

-- See which indexes exist
\\d+ users          -- Postgres psql
SHOW INDEX FROM users;  -- MySQL`,
    },
    {
      id: 'sql-perf-2',
      title: 'Composite and Covering Indexes',
      content: `**Composite (multi-column) indexes** are sorted left-to-right by their columns. The order matters.

\`\`\`
CREATE INDEX idx_o ON orders (user_id, placed_at);
\`\`\`

This index can serve:
- \`WHERE user_id = 5\`
- \`WHERE user_id = 5 AND placed_at >= '2026-01-01'\`
- \`WHERE user_id = 5 ORDER BY placed_at\`

But **not**:
- \`WHERE placed_at >= '2026-01-01'\` alone (the leading column is missing)

**Rule of thumb:** put the columns used in equality filters first, then range/order columns.

**Covering index** = an index that contains all the columns the query needs, so the database can answer from the index alone without touching the table (an "index-only scan"). Add columns with \`INCLUDE\`:
\`\`\`
CREATE INDEX idx_o ON orders (user_id, placed_at) INCLUDE (total);
\`\`\`

**INCLUDE** columns don't affect the sort order but get stored in the leaf pages so the planner can skip the table lookup.`,
      codeExample: `-- Composite index — order matters
CREATE INDEX idx_orders_user_date
  ON orders (user_id, placed_at DESC);

-- Uses index: leading column is filtered
SELECT * FROM orders WHERE user_id = 42;

-- Uses index: both columns
SELECT * FROM orders WHERE user_id = 42 AND placed_at > '2026-01-01';

-- CANNOT use the user_id index alone — leading col missing
SELECT * FROM orders WHERE placed_at > '2026-01-01';

-- Covering index for a common query
CREATE INDEX idx_orders_cover
  ON orders (user_id, placed_at)
  INCLUDE (total, status);

-- This query can be served entirely from the index (no table fetch)
SELECT placed_at, total, status
FROM orders
WHERE user_id = 42
ORDER BY placed_at;`,
    },
    {
      id: 'sql-perf-3',
      title: 'EXPLAIN and Reading Query Plans',
      content: `\`EXPLAIN\` shows the planner's chosen strategy. \`EXPLAIN ANALYZE\` actually runs the query and reports real timings.

**Common plan nodes (Postgres):**
- **Seq Scan** — full table scan. Fine for small tables, alarming on large ones if a filter exists.
- **Index Scan** — uses an index to find rows, then fetches from the table.
- **Index Only Scan** — answers entirely from a covering index, never touching the heap.
- **Bitmap Heap Scan** — combines multiple indexes via a bitmap.
- **Nested Loop / Hash Join / Merge Join** — different join algorithms.

**What to look for:**
- Row count estimates vs actual (huge mismatches → stale statistics, run \`ANALYZE\`).
- Filter applied after a Seq Scan when an index could be helping.
- "Rows Removed by Filter" — the planner read way more than it returned.
- Big "Buffers: shared read=..." numbers in EXPLAIN (ANALYZE, BUFFERS).

**Cost vs time:** the \`cost\` is the planner's *estimate*. \`actual time\` from ANALYZE is what really matters.`,
      codeExample: `-- Plan-only (no execution)
EXPLAIN SELECT * FROM orders WHERE user_id = 42;

-- Run + show actuals + buffer counts
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.name
ORDER BY COUNT(o.id) DESC
LIMIT 10;

-- Update statistics so the planner has fresh numbers
ANALYZE orders;
VACUUM ANALYZE;`,
    },
    {
      id: 'sql-perf-4',
      title: 'Anti-Patterns and Optimization Wins',
      content: `**Functions on indexed columns kill the index:**
\`WHERE LOWER(email) = 'x'\` doesn't use \`idx_users_email\` — the value is transformed before comparison. Solutions: index the expression (\`CREATE INDEX ... ON users (LOWER(email))\`) or store a normalized column.

**Implicit type casting:**
\`WHERE phone_number = 1234567890\` (int) when the column is text. Cast forces a value transformation on every row. Match types.

**Leading wildcard LIKE:**
\`WHERE email LIKE '%@gmail.com'\` can't use a B-tree. Solutions: trigram index (\`pg_trgm\`), full-text search, or store the reversed string.

**SELECT * for analytics:**
Reading every column blows up I/O and prevents index-only scans. Project only what you need.

**OR across two columns:** the planner often can't combine two indexes for an OR. Try \`UNION\` of two separate queries.

**Deep OFFSET:** \`LIMIT 20 OFFSET 100000\` scans 100,020 rows. Use **keyset pagination**: \`WHERE id > last_seen_id ORDER BY id LIMIT 20\`.

**N+1 queries:** firing one query per row from app code. The fix is one bigger query (JOIN or IN list), not more roundtrips.`,
      codeExample: `-- BAD: function on indexed column
SELECT * FROM users WHERE LOWER(email) = 'a@x.com';
-- FIX: index the expression
CREATE INDEX idx_users_lower_email ON users (LOWER(email));

-- BAD: leading wildcard
SELECT * FROM users WHERE email LIKE '%@gmail.com';
-- FIX (Postgres): trigram index
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_users_email_trgm ON users USING gin (email gin_trgm_ops);

-- BAD: deep offset
SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 100000;
-- FIX: keyset pagination
SELECT * FROM posts
WHERE id > 100000
ORDER BY id
LIMIT 20;

-- BAD: OR across two columns — single index can't serve both sides
SELECT * FROM users WHERE email = 'a@x' OR phone = '555-1212';
-- FIX: UNION two index-friendly queries
SELECT * FROM users WHERE email = 'a@x'
UNION
SELECT * FROM users WHERE phone = '555-1212';`,
    },
    {
      id: 'sql-perf-5',
      title: 'Selectivity, Clustered Indexes, and the Cost of Writes',
      content: `**Selectivity** is the fraction of rows a predicate matches. An index pays off when it narrows the search to a small slice — an email column (one row per value) is highly selective; a boolean \`is_active\` (half the table per value) is not. The planner estimates selectivity from statistics and chooses a Seq Scan when the slice is too big, because random index lookups cost more than streaming the table.

**Range on the leading column stops the walk.** For index \`(a, b)\`, \`WHERE a = 1 AND b > 5\` seeks straight to the matching leaf pages. \`WHERE a > 1 AND b = 5\` can only use \`a\` to pick a range, then must check \`b\` on every entry in it. Equality columns go first.

**Clustered vs non-clustered.** A *clustered* index stores the table rows physically in index order — InnoDB's primary key and SQL Server's clustered index work this way; every secondary index then points at the primary key. Postgres tables are heaps: all indexes are separate structures with pointers to row locations, and \`CLUSTER\` only reorders once.

**Random primary keys hurt clustered tables.** Inserting random UUIDs into an InnoDB table scatters writes across the whole B-tree, causing page splits and cache misses. Sequential ids or time-ordered UUIDs (v7) append at the end.

**Every index is a write tax.** Each INSERT adds an entry to every index; each UPDATE of an indexed column rewrites the entry (and in Postgres defeats cheap HOT updates). Foreign-key columns deserve an index anyway: without one, deleting a parent row scans the entire child table.`,
      codeExample: `-- Selectivity: how many distinct values per column?
SELECT attname, n_distinct, null_frac
FROM pg_stats
WHERE tablename = 'users';
-- n_distinct -1 = unique (great candidate); 2 = boolean (useless alone)

-- Equality first, then the range
CREATE INDEX idx_events_type_time ON events (event_type, occurred_at);
SELECT * FROM events
WHERE event_type = 'click' AND occurred_at > NOW() - INTERVAL '1 hour';

-- Low-selectivity column becomes useful as a partial index
CREATE INDEX idx_users_inactive ON users (last_login)
WHERE is_active = FALSE;   -- only the rare rows

-- Index foreign keys: parent deletes and joins both need it
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Find indexes that never get used (drop candidates)
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;`,
    },
    {
      id: 'sql-perf-6',
      title: 'Views and Materialized Views',
      content: `A **view** is a saved query with a name. It stores no data — each time you SELECT from it, the database inlines the definition and plans the combined query. Use views to:
- Hide complexity (a 5-table join becomes \`FROM customer_summary\`).
- Restrict access (expose only some columns/rows; grant on the view, not the table).
- Provide a stable interface while the underlying tables change.

Because a view is just SQL, it is always **fresh** and costs exactly what its query costs. It cannot be indexed directly, though the indexes on underlying tables still apply.

A **materialized view** runs the query once and **stores the result** like a table. Reads are instant and you can index the stored rows. The price is staleness: data only changes when you \`REFRESH MATERIALIZED VIEW\`, which re-runs the whole query. \`REFRESH ... CONCURRENTLY\` (Postgres) swaps in the new rows without blocking readers but needs a unique index on the view.

**Choosing:**
- Query is cheap or data must be current → plain view.
- Query is expensive (heavy aggregation, many joins) and minutes-old data is fine → materialized view refreshed on a schedule.
- Need incremental, always-current pre-aggregation → summary table maintained by triggers or the application.

**Updatable views:** simple single-table views without aggregates can accept INSERT/UPDATE/DELETE; add \`WITH CHECK OPTION\` to prevent writes that would fall outside the view's WHERE.`,
      codeExample: `-- Plain view: always current, no storage
CREATE VIEW active_customers AS
SELECT u.id, u.name, u.email
FROM users u
WHERE u.status = 'active';

-- Restrict access: grant the view, not the table
GRANT SELECT ON active_customers TO support_role;

-- Materialized view: expensive aggregation, refreshed hourly
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT
  placed_at::date AS day,
  country,
  SUM(total)      AS revenue,
  COUNT(*)        AS orders
FROM orders
WHERE status = 'paid'
GROUP BY placed_at::date, country;

-- Index the stored result like any table
CREATE UNIQUE INDEX idx_daily_revenue ON daily_revenue (day, country);

-- Refresh without blocking readers (requires the unique index)
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;

-- Updatable view that refuses out-of-scope writes
CREATE VIEW us_users AS
SELECT * FROM users WHERE country = 'US'
WITH CHECK OPTION;
UPDATE us_users SET country = 'CA' WHERE id = 1;  -- ERROR: violates check option`,
    },
  ],

  visualizations: [
    {
      title: 'B-tree Index Lookup',
      description: 'Sorted tree narrows search to a small set of pages',
      nodes: [
        { id: 'root',  label: 'Root',                  x: 140, y: 30,  type: 'primary' },
        { id: 'b1',   label: 'Branch < 50',           x: 60,  y: 110, type: 'secondary' },
        { id: 'b2',   label: 'Branch ≥ 50',           x: 220, y: 110, type: 'secondary' },
        { id: 'l1',   label: 'Leaf [1..20]',          x: 30,  y: 200, type: 'success' },
        { id: 'l2',   label: 'Leaf [20..50]',         x: 130, y: 200, type: 'success' },
        { id: 'l3',   label: 'Leaf [50..80]',         x: 230, y: 200, type: 'success' },
      ],
      edges: [
        { from: 'root', to: 'b1' },
        { from: 'root', to: 'b2' },
        { from: 'b1',   to: 'l1' },
        { from: 'b1',   to: 'l2' },
        { from: 'b2',   to: 'l3' },
      ],
    },
    {
      title: 'Composite Index Column Order',
      description: 'Leftmost-prefix rule: query must use leading columns',
      nodes: [
        { id: 'idx',  label: 'INDEX\n(a, b, c)',         x: 140, y: 40,  type: 'primary' },
        { id: 'ok1',  label: 'WHERE a = ?\nUSES',         x: 30,  y: 130, type: 'success' },
        { id: 'ok2',  label: 'WHERE a = ?\nAND b = ?\nUSES', x: 140, y: 130, type: 'success' },
        { id: 'no',   label: 'WHERE b = ?\nSKIPS',        x: 250, y: 130, type: 'error' },
      ],
      edges: [
        { from: 'idx', to: 'ok1' },
        { from: 'idx', to: 'ok2' },
        { from: 'idx', to: 'no'  },
      ],
    },
  ],

  flashcards: [
    { id: 'pf1',  front: 'What is a B-tree index used for?', back: 'Sorted lookups: equality, ranges, ORDER BY, and prefix LIKE. The default index type for almost all relational DBs.' },
    { id: 'pf2',  front: 'Why does WHERE LOWER(email) = \'x\' skip the index on email?', back: 'The value is transformed before comparison, so the index\'s sorted order doesn\'t help. Index the expression: CREATE INDEX ... ON t (LOWER(email)).' },
    { id: 'pf3',  front: 'What\'s a composite index\'s "leftmost prefix" rule?', back: 'A multi-column index (a, b, c) can serve queries that filter on (a), (a, b), or (a, b, c) — but not on (b) or (b, c) alone.' },
    { id: 'pf4',  front: 'How do you pick column order in a composite index?', back: 'Equality filters first, then range/sort columns. Most selective column first if all are equality.' },
    { id: 'pf5',  front: 'What is a covering index?', back: 'An index that contains all columns the query needs (filter + select), so the DB answers entirely from the index without a table lookup. Use INCLUDE to add non-key columns.' },
    { id: 'pf6',  front: 'What does EXPLAIN ANALYZE do?', back: 'Runs the query and prints the plan plus actual timings, row counts, and buffer reads. Compare estimated vs actual row counts to spot stats issues.' },
    { id: 'pf7',  front: 'What\'s a Seq Scan?', back: 'A full table scan. Fine on small tables, often a problem on large ones if there\'s a filterable predicate.' },
    { id: 'pf8',  front: 'When should you NOT add an index?', back: 'Tables that are mostly written, columns rarely used in WHERE/JOIN/ORDER, or columns with very low selectivity (e.g. boolean with 50/50 split).' },
    { id: 'pf9',  front: 'What is a partial index?', back: 'An index that only includes rows matching a predicate: CREATE INDEX ... WHERE status = \'pending\'. Smaller and cheaper to maintain than a full index when most rows don\'t match.' },
    { id: 'pf10', front: 'Why does LIKE \'%foo\' miss the index?', back: 'A B-tree is sorted left-to-right. Without a leading literal, it can\'t narrow down to a range. Use a trigram or full-text index.' },
    { id: 'pf11', front: 'What is keyset pagination?', back: 'Pagination by remembering the last seen sort key: WHERE id > $last_id ORDER BY id LIMIT N. Constant-time regardless of page depth, unlike OFFSET.' },
    { id: 'pf12', front: 'Why is OFFSET 100000 slow?', back: 'The DB still has to read and discard 100,000 rows before returning the next batch. Cost grows linearly with offset.' },
    { id: 'pf13', front: 'What does ANALYZE do?', back: 'Updates the planner\'s statistics about a table — row counts, value distributions, NULL fraction. Stale stats produce bad plans.' },
    { id: 'pf14', front: 'What is the N+1 problem?', back: 'App code fires one query to fetch parents, then one query per parent to fetch children. Fix with a single JOIN or batch IN-list query.' },
    { id: 'pf15', front: 'When is SELECT * a performance problem?', back: 'Always when you don\'t need every column. Reads extra I/O, prevents index-only scans, and breaks if schema changes add columns.' },
    { id: 'pf16', front: 'What\'s an index-only scan?', back: 'A query answered entirely by reading the index without touching the table. Requires the index to cover every column the query needs.' },
    { id: 'pf17', front: 'Why might the planner pick a Seq Scan over an Index Scan?', back: 'When the filter matches a large fraction of the table (say >5–10%), sequential I/O is cheaper than random index lookups followed by heap fetches.' },
    { id: 'pf18', front: 'How do you make an OR across two columns indexable?', back: 'Rewrite as UNION of two queries, each able to use its own index. The planner often can\'t merge two indexes for a single OR.' },
    { id: 'pf19', front: 'What is index selectivity and why does it matter?', back: 'The fraction of rows a predicate matches. Highly selective columns (few rows per value, like email) make great indexes; low-selectivity ones (booleans, status with 3 values) rarely beat a Seq Scan on their own.' },
    { id: 'pf20', front: 'For index (a, b), why is `WHERE a > 5 AND b = 3` slower than `WHERE a = 5 AND b > 3`?', back: 'A range on the leading column only narrows a to an interval; every entry in it must then be checked for b. An equality on the leading column jumps straight to the b range. Put equality columns before range columns.' },
    { id: 'pf21', front: 'What is a Bitmap Heap Scan?', back: 'The index is scanned first to build a bitmap of matching heap pages, then those pages are read in physical order. Chosen for mid-selectivity predicates and for combining multiple indexes (AND/OR) in one scan.' },
    { id: 'pf22', front: 'Clustered vs non-clustered index?', back: 'A clustered index stores the table rows physically in index order (InnoDB primary key, SQL Server). A non-clustered index is a separate structure pointing to row locations. Postgres tables are heaps — all indexes are non-clustered.' },
    { id: 'pf23', front: 'Why are random UUID primary keys bad for InnoDB insert performance?', back: 'The primary key is the clustered index, so random keys scatter inserts across the B-tree, causing page splits and cache misses. Sequential ids or time-ordered UUIDs (v7) append to the rightmost page.' },
    { id: 'pf24', front: 'Why can a Postgres index-only scan still fetch from the heap?', back: 'Row visibility (MVCC) is stored in the heap, not the index. The scan skips the heap only for pages marked all-visible in the visibility map, which VACUUM maintains. High "Heap Fetches" means the table needs vacuuming.' },
    { id: 'pf25', front: 'How does an index help ORDER BY ... LIMIT N?', back: 'If the index order matches the ORDER BY, the DB walks the index (forward or backward) and stops after N rows — no sort, no full scan. Without it, every matching row must be read and sorted first.' },
    { id: 'pf26', front: 'Can index (a ASC, b ASC) serve ORDER BY a DESC, b DESC? What about a ASC, b DESC?', back: 'Yes to the first — a B-tree can be scanned backward. No to mixed directions; you need an index declared as (a ASC, b DESC) to avoid a sort.' },
    { id: 'pf27', front: 'Why should foreign-key columns be indexed?', back: 'Joins from parent to child use them, and deleting or updating a parent row makes the DB check the child table for references — without an index that is a full scan per parent row, and it holds locks longer.' },
    { id: 'pf28', front: 'Why does `WHERE id::text = \'42\'` skip the index on id, but `WHERE id = \'42\'::int` uses it?', back: 'Casting the column changes the value being compared, so the index\'s sort order no longer applies. Casting the parameter leaves the column untouched. Always convert the literal, never the column.' },
    { id: 'pf29', front: 'What does an index cost on a frequently updated column?', back: 'Every update must rewrite the index entry, and in Postgres updating an indexed column disables the cheap HOT (heap-only tuple) path, so all indexes on the table get new entries — more write I/O and bloat.' },
    { id: 'pf30', front: 'View vs materialized view?', back: 'A view stores nothing and re-runs its query on every read — always current. A materialized view stores the result, can be indexed, and reads instantly, but is stale until REFRESH MATERIALIZED VIEW re-runs the query.' },
  ],

  quizQuestions: [
    {
      id: 'pfq1',
      question: 'Which query CAN use the index ON orders (user_id, placed_at)?',
      options: ['WHERE placed_at > \'2026-01-01\'', 'WHERE user_id = 5 AND placed_at > \'2026-01-01\'', 'WHERE total > 100', 'WHERE EXTRACT(year FROM placed_at) = 2026'],
      correctAnswer: 1,
      explanation: 'Leftmost-prefix rule — the leading column (user_id) must appear in the filter.',
    },
    {
      id: 'pfq2',
      question: 'Why does WHERE LOWER(email) = \'x\' often skip an index on email?',
      options: ['Indexes only work on integers', 'The function transforms the value, defeating the sort order', 'LOWER is too slow', 'It\'s case-sensitive'],
      correctAnswer: 1,
      explanation: 'Index on raw email is sorted by raw email. The fix is to index the expression: CREATE INDEX ... ON users (LOWER(email)).',
    },
    {
      id: 'pfq3',
      question: 'What is a "covering index"?',
      options: ['An index over multiple tables', 'An index that contains every column the query needs', 'An index larger than the table', 'A backup index'],
      correctAnswer: 1,
      explanation: 'Lets the DB answer entirely from the index (index-only scan), skipping the table fetch.',
    },
    {
      id: 'pfq4',
      question: 'What does EXPLAIN ANALYZE show beyond EXPLAIN?',
      options: ['Only the estimated plan', 'Actual execution time and row counts (and runs the query)', 'A diagram', 'A list of indexes'],
      correctAnswer: 1,
      explanation: 'ANALYZE actually runs the query and reports real timings. Use BUFFERS to also see I/O.',
    },
    {
      id: 'pfq5',
      question: 'A query has Seq Scan with "Rows Removed by Filter: 9,800,000". What\'s the most likely fix?',
      options: ['Add LIMIT', 'Add an index on the filter column', 'Use SELECT *', 'Run VACUUM'],
      correctAnswer: 1,
      explanation: 'The DB read 10M rows to return a handful. An index on the filter column lets it skip most of the table.',
    },
    {
      id: 'pfq6',
      question: 'Why is LIMIT 20 OFFSET 100000 slow?',
      options: ['It loads the whole table into memory', 'It must scan and discard 100,000 rows first', 'It locks the table', 'OFFSET is deprecated'],
      correctAnswer: 1,
      explanation: 'Cost is linear in the offset. Use keyset pagination (WHERE id > last_id) for constant cost.',
    },
    {
      id: 'pfq7',
      question: 'Which is the best index for `WHERE status = \'pending\' ORDER BY placed_at`?',
      options: ['(status)', '(placed_at)', '(status, placed_at)', '(placed_at, status)'],
      correctAnswer: 2,
      explanation: 'Equality column first lets the DB jump to the status block; ordering on placed_at within it returns rows already sorted.',
    },
    {
      id: 'pfq8',
      question: 'Why is `email LIKE \'%@gmail.com\'` un-indexable on a regular B-tree?',
      options: ['Email isn\'t a key', 'The leading wildcard means there\'s no prefix to seek to', '% is a reserved char', 'B-trees don\'t support text'],
      correctAnswer: 1,
      explanation: 'B-trees seek by sorted prefix. No literal prefix → no narrowing possible. Use a trigram index for substring search.',
    },
    {
      id: 'pfq9',
      question: 'Adding an index always helps reads. What\'s the cost?',
      options: ['Nothing', 'Slower writes and more disk space', 'Slower reads on other tables', 'No cost in modern DBs'],
      correctAnswer: 1,
      explanation: 'Every insert/update/delete must maintain the index. More indexes = more write amplification and bigger backups.',
    },
    {
      id: 'pfq10',
      question: 'You see "estimated rows: 100, actual rows: 1,000,000". What command fixes this?',
      options: ['REINDEX', 'ANALYZE (or VACUUM ANALYZE)', 'EXPLAIN', 'DROP INDEX'],
      correctAnswer: 1,
      explanation: 'The planner is working from stale stats. ANALYZE recomputes the distributions so the optimizer makes better choices.',
    },
    {
      id: 'pfq11',
      question: 'Which column is the best candidate for a standalone B-tree index based on selectivity?',
      options: ['is_active (boolean)', 'country (about 50 values over 10M rows)', 'email (unique)', 'gender'],
      correctAnswer: 2,
      explanation: 'An equality lookup on a unique column narrows to one row. Booleans and low-cardinality columns match huge slices, so the planner usually prefers a Seq Scan.',
    },
    {
      id: 'pfq12',
      question: 'Query: `WHERE status = \'pending\' AND created_at > NOW() - INTERVAL \'1 day\'`. Which composite index is better?',
      options: ['(created_at, status)', '(status, created_at)', 'Two separate single-column indexes', 'Either order — the planner reorders columns'],
      correctAnswer: 1,
      explanation: 'Equality on the leading column jumps to the status block, then the range on created_at is a contiguous walk. With (created_at, status) the range comes first, and status must be checked on every entry.',
    },
    {
      id: 'pfq13',
      question: 'id is an indexed integer. Why does `WHERE id::text = \'42\'` do a Seq Scan?',
      options: ['The column is cast, so the index on the raw integer cannot be used', 'Text comparisons never use indexes', 'The planner cannot parse the cast', 'The string literal must be quoted differently'],
      correctAnswer: 0,
      explanation: 'Applying a function or cast to the indexed column defeats the index, just like LOWER(email). Compare against a properly typed literal (WHERE id = 42) instead.',
    },
    {
      id: 'pfq14',
      question: 'created_at has a B-tree index. How does the planner handle `ORDER BY created_at DESC LIMIT 10`?',
      options: ['Seq Scan then a full sort', 'Reads all rows, sorts, keeps 10', 'Uses the index only if declared DESC', 'Walks the index backward and stops after 10 rows'],
      correctAnswer: 3,
      explanation: 'B-trees can be scanned in either direction. The index supplies the order, so the query touches only 10 index entries and their rows.',
    },
    {
      id: 'pfq15',
      question: 'Deleting a single row from `users` takes seconds. orders.user_id references users(id). Most likely cause?',
      options: ['Too many indexes on users', 'orders.user_id has no index, so the FK check scans the whole orders table', 'The users table needs REINDEX', 'The primary key is a UUID'],
      correctAnswer: 1,
      explanation: 'The DB must verify no child rows reference the deleted parent (or cascade to them). Without an index on the FK column, that is a full scan of orders for every delete.',
    },
    {
      id: 'pfq16',
      question: 'Why is a random UUID a poor primary key for an InnoDB (MySQL) table with heavy inserts?',
      options: ['UUIDs cannot be indexed', 'UUIDs are not unique enough', 'The clustered index gets random inserts, causing page splits and cache misses', 'InnoDB requires integer keys'],
      correctAnswer: 2,
      explanation: 'InnoDB stores rows in primary-key order. Random keys land anywhere in the tree instead of appending at the end, so pages split and the working set no longer fits in cache.',
    },
    {
      id: 'pfq17',
      question: 'EXPLAIN shows "Bitmap Heap Scan on orders" with "Bitmap Index Scan" beneath it. What is happening?',
      options: ['The index identifies matching pages, which are then read from the table in physical order', 'The whole table is scanned into a bitmap', 'Two tables are joined via bitmaps', 'The index is corrupt and being rebuilt'],
      correctAnswer: 0,
      explanation: 'A bitmap scan is the middle ground between an Index Scan and a Seq Scan: it collects matching row locations first and fetches heap pages sequentially. It also lets the planner AND/OR several indexes.',
    },
    {
      id: 'pfq18',
      question: 'Which statement about materialized views is true?',
      options: ['They re-run the query on every read', 'They store the result and must be refreshed to see new data', 'They cannot be indexed', 'They are automatically updated on every insert'],
      correctAnswer: 1,
      explanation: 'A materialized view is a snapshot. It reads fast and can be indexed, but it is stale until REFRESH MATERIALIZED VIEW. A plain view is the one that re-runs its query each time.',
    },
    {
      id: 'pfq19',
      question: 'An Index Only Scan reports "Heap Fetches: 500000". What is the likely fix?',
      options: ['Add INCLUDE columns', 'Drop the index', 'Run VACUUM so the visibility map marks pages all-visible', 'Switch to a hash index'],
      correctAnswer: 2,
      explanation: 'Index-only scans must check the heap for row visibility unless the page is flagged all-visible. VACUUM updates that map; after it runs, heap fetches drop toward zero.',
    },
    {
      id: 'pfq20',
      question: 'users has a plain B-tree index on email. Which predicate can use it?',
      options: ['WHERE LOWER(email) = $1', 'WHERE email LIKE \'%\' || $1', 'WHERE email::text ILIKE $1', 'WHERE email = LOWER($1)'],
      correctAnswer: 3,
      explanation: 'Transforming the parameter is free — the column is compared as stored. Transforming the column (LOWER, cast) or using a leading wildcard prevents the B-tree from seeking.',
    },
  ],
};

// =============================================================================
// 7. TRANSACTIONS & CONCURRENCY (premium)
// =============================================================================
const sqlTransactions: SQLCategory = {
  id: 'sql-transactions',
  name: 'Transactions & Concurrency',
  slug: 'sql-transactions',
  description: 'ACID, isolation levels, locking, MVCC, and deadlock avoidance',
  icon: 'shield-checkmark-outline',
  color: '#DC2626',
  colorDark: '#991B1B',
  premium: true,

  learnContent: [
    {
      id: 'sql-tx-1',
      title: 'Transactions and ACID',
      content: `A transaction groups one or more statements so they either all succeed or all roll back. The contract is **ACID**:

- **Atomicity** — all-or-nothing. A crash mid-transaction rolls back.
- **Consistency** — constraints (FK, UNIQUE, CHECK) hold at commit. The DB never moves from one invalid state to another.
- **Isolation** — concurrent transactions don't see each other's intermediate state (level depends on isolation setting).
- **Durability** — once \`COMMIT\` returns, the change survives a crash. Usually backed by a write-ahead log.

**Syntax:**
\`\`\`
BEGIN;            -- or START TRANSACTION
... statements ...
COMMIT;           -- save
-- or
ROLLBACK;         -- discard
\`\`\`

**Savepoints** let you partially roll back inside a transaction:
\`\`\`
SAVEPOINT sp1;
... risky stuff ...
ROLLBACK TO sp1;   -- undo since sp1, transaction still alive
\`\`\`

Autocommit is on by default for single statements. Wrap multi-statement work in explicit BEGIN/COMMIT to get atomicity.`,
      codeExample: `-- Classic transfer
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- Savepoint pattern
BEGIN;
INSERT INTO orders (...) VALUES (...);

SAVEPOINT before_inventory;
UPDATE inventory SET qty = qty - 1 WHERE sku = 'X';
-- Oh no, qty went negative
ROLLBACK TO before_inventory;

-- Try again differently
INSERT INTO backorders (...) VALUES (...);
COMMIT;

-- Constraint failures inside a transaction abort the whole thing (Postgres)
BEGIN;
INSERT INTO users (id, email) VALUES (1, 'a@x.com');
INSERT INTO users (id, email) VALUES (1, 'b@x.com');  -- unique violation
-- ↑ rest of the transaction now fails until ROLLBACK
ROLLBACK;`,
    },
    {
      id: 'sql-tx-2',
      title: 'Isolation Levels and Read Phenomena',
      content: `Isolation says **how much** concurrent transactions can see of each other. The SQL standard defines four levels, ordered from least to most strict:

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED   | no       | possible | possible |
| REPEATABLE READ  | no       | no       | possible (in standard) |
| SERIALIZABLE     | no       | no       | no |

**Read phenomena:**
- **Dirty read** — see a value another transaction wrote but didn't commit.
- **Non-repeatable read** — same row, read twice, different value (someone committed an update between reads).
- **Phantom read** — same query, run twice, different *set* of rows (someone inserted/deleted matching rows).

**Real-world defaults:**
- Postgres / Oracle: \`READ COMMITTED\`.
- MySQL InnoDB: \`REPEATABLE READ\` (and InnoDB's REPEATABLE READ blocks phantoms via next-key locking).
- SQL Server: \`READ COMMITTED\`.

\`SERIALIZABLE\` gives you the strongest guarantee but at the cost of more aborts under contention (in MVCC databases, via serialization failures).`,
      codeExample: `-- Set per-transaction isolation
BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT SUM(balance) FROM accounts;
-- Run a heavy report, get a consistent snapshot
SELECT * FROM transactions WHERE day = '2026-05-27';
COMMIT;

-- Postgres SERIALIZABLE may abort with serialization failure
BEGIN ISOLATION LEVEL SERIALIZABLE;
UPDATE counters SET value = value + 1 WHERE id = 1;
COMMIT;  -- if another tx interfered: ERROR: could not serialize access...

-- App code retry pattern (pseudocode)
-- while retries > 0:
--   try: run_serializable_transaction()
--   except SerializationFailure: retries -= 1
`,
    },
    {
      id: 'sql-tx-3',
      title: 'Locks, MVCC, and FOR UPDATE',
      content: `**Two models** of concurrency control:

**1. Locking** — readers and writers block each other. Most DBs hold row locks for writes; some (older MySQL MyISAM) lock the whole table.

**2. MVCC** (Multi-Version Concurrency Control) — readers don't block writers and vice versa, because each transaction reads from a consistent **snapshot** of the database. Used by Postgres, Oracle, MySQL InnoDB.

Under MVCC:
- An UPDATE writes a new row version, doesn't overwrite in place.
- Readers see the version visible at their transaction's start.
- Periodic cleanup (Postgres \`VACUUM\`) reclaims dead row versions.

**Explicit row locks:**
- \`SELECT ... FOR UPDATE\` — acquires a write lock on the rows so other transactions can't modify them until you commit.
- \`SELECT ... FOR SHARE\` — read lock; multiple readers OK, but no concurrent writes.
- \`SKIP LOCKED\` — skip rows that are already locked (great for work-queue patterns).
- \`NOWAIT\` — fail immediately if any row is locked.

**Optimistic vs pessimistic:**
- **Pessimistic:** lock upfront with FOR UPDATE.
- **Optimistic:** use a \`version\` column; bump it on update; if the row changed under you, retry.`,
      codeExample: `-- Pessimistic lock: hold the row while we decide what to do
BEGIN;
SELECT qty FROM inventory WHERE sku = 'X' FOR UPDATE;
-- Other transactions trying to UPDATE this row now block
UPDATE inventory SET qty = qty - 1 WHERE sku = 'X';
COMMIT;

-- Work-queue: pick up jobs without two workers grabbing the same one
BEGIN;
SELECT id, payload
FROM jobs
WHERE status = 'queued'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;
-- Mark and commit
UPDATE jobs SET status = 'running' WHERE id = $1;
COMMIT;

-- Optimistic concurrency with a version column
UPDATE posts
SET title = 'new', version = version + 1
WHERE id = 42 AND version = 7;
-- If 0 rows affected: someone else updated it — refetch and retry`,
    },
    {
      id: 'sql-tx-4',
      title: 'Deadlocks and How to Avoid Them',
      content: `A **deadlock** happens when two transactions each hold a lock the other needs. Most DBs detect this automatically and abort one of them with a "deadlock detected" error.

**Canonical deadlock:**
\`\`\`
T1: UPDATE accounts WHERE id = 1;  -- locks row 1
T2: UPDATE accounts WHERE id = 2;  -- locks row 2
T1: UPDATE accounts WHERE id = 2;  -- waits for T2
T2: UPDATE accounts WHERE id = 1;  -- waits for T1 → deadlock
\`\`\`

**Prevention strategies:**
1. **Order locks consistently** — always acquire locks on multiple rows in the same order (e.g. ascending by id).
2. **Keep transactions short** — fewer chances to collide. Don't open a transaction and then go fetch from an HTTP API.
3. **Use the lowest isolation level you can tolerate.** Higher isolation = more locks = more contention.
4. **Retry on deadlock** — abort and retry the loser. Most apps assume deadlocks happen and have retry middleware.
5. **Use SELECT FOR UPDATE early** — grabbing the lock at the start avoids upgrade-from-shared-to-exclusive races.

**Lock granularity gotchas:**
- Some DBs escalate row locks to table locks under heavy contention.
- INSERTs can block due to gap locks (MySQL) or unique-constraint waits.`,
      codeExample: `-- Bad: arbitrary order, can deadlock with another transaction
-- doing the same transfer in reverse
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = $from;
UPDATE accounts SET balance = balance + 100 WHERE id = $to;
COMMIT;

-- Better: always lock the lower id first
BEGIN;
SELECT * FROM accounts
WHERE id IN ($from, $to)
ORDER BY id
FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = $from;
UPDATE accounts SET balance = balance + 100 WHERE id = $to;
COMMIT;

-- Retry on deadlock (Postgres error code 40P01)
-- Pseudocode in your app:
--   for attempt in range(3):
--     try:
--       run_transaction()
--       break
--     except DeadlockDetected:
--       sleep(random_jitter)`,
    },
    {
      id: 'sql-tx-5',
      title: 'Lost Updates, Write Skew, and Snapshot Isolation',
      content: `The three standard read phenomena are not the whole story. Two **write** anomalies come up constantly in interviews because they bite real systems.

**Lost update.** Two transactions read the same row, compute a new value in application code, and both write it back. The second write silently overwrites the first — one increment vanishes. Fixes, from simplest to strongest:
1. Do the math in SQL: \`UPDATE ... SET balance = balance - 30\`. One atomic statement, row-locked by the database.
2. \`SELECT ... FOR UPDATE\` before reading, so the second reader blocks.
3. Optimistic version column.
4. REPEATABLE READ or SERIALIZABLE in Postgres, which abort the second writer with a serialization failure.

**Write skew.** Two transactions read overlapping data, each decides its own write is safe, and write *different* rows — together violating an invariant. Classic: two on-call doctors both check "at least one other doctor is on call" and both go off duty. No row was written twice, so row locks and REPEATABLE READ do not catch it. Only \`SERIALIZABLE\` (or an explicit lock on the rows you *read*) prevents it.

**Snapshot isolation in practice.** Postgres REPEATABLE READ takes one snapshot at the first statement and keeps it for the whole transaction, so phantoms cannot appear either — stricter than the standard. Under READ COMMITTED each **statement** gets a fresh snapshot, so two identical SELECTs in one transaction can legitimately differ.

**Postgres SERIALIZABLE** uses Serializable Snapshot Isolation: no extra blocking, but it tracks read/write dependencies and aborts a transaction whose result could not have occurred in some serial order. Always retry on SQLSTATE 40001.`,
      codeExample: `-- Lost update: both sessions read 100, both write 70. One decrement is lost.
-- Session A                        -- Session B
BEGIN;                              BEGIN;
SELECT balance FROM accounts        SELECT balance FROM accounts
WHERE id = 1;    -- 100             WHERE id = 1;    -- 100
UPDATE accounts SET balance = 70    UPDATE accounts SET balance = 70
WHERE id = 1;                       WHERE id = 1;    -- waits for A
COMMIT;                             COMMIT;          -- balance = 70, not 40

-- Fix 1: let the database do the arithmetic
UPDATE accounts SET balance = balance - 30 WHERE id = 1;

-- Fix 2: lock the row on read
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = 70 WHERE id = 1;
COMMIT;

-- Write skew: each doctor checks the invariant, then breaks it together
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT COUNT(*) FROM doctors WHERE on_call = TRUE;   -- both see 2
UPDATE doctors SET on_call = FALSE WHERE id = $me;
COMMIT;   -- under SERIALIZABLE, the second commit fails with 40001

-- Snapshot per statement vs per transaction
BEGIN;                                    -- READ COMMITTED (default)
SELECT COUNT(*) FROM orders;              -- 100
-- another session inserts and commits
SELECT COUNT(*) FROM orders;              -- 101: fresh snapshot per statement
COMMIT;`,
    },
    {
      id: 'sql-tx-6',
      title: 'UPSERT and MERGE: Atomic Insert-or-Update',
      content: `"Insert if missing, otherwise update" written as two statements has a race: two clients both SELECT, both see nothing, both INSERT, and one fails on the unique constraint (or, without a constraint, you get duplicates). The database offers atomic forms.

**INSERT ... ON CONFLICT (Postgres, SQLite).** Requires a unique index or constraint to detect the conflict. \`DO UPDATE\` lets you reference the row that would have been inserted through \`EXCLUDED\`; \`DO NOTHING\` makes the insert idempotent. Under the hood Postgres uses speculative insertion, so concurrent upserts never produce duplicate-key errors.

**INSERT ... ON DUPLICATE KEY UPDATE (MySQL)** is the equivalent; \`VALUES(col)\` (older) or a row alias refers to the proposed values.

**MERGE (SQL standard; Postgres 15+, SQL Server, Oracle).** Joins a source to a target and specifies actions per branch: \`WHEN MATCHED THEN UPDATE\` / \`DELETE\`, \`WHEN NOT MATCHED THEN INSERT\`. More expressive — conditional branches, deletes, bulk sync from a staging table — but in Postgres it does not take the speculative-insert path, so two concurrent MERGEs inserting the same key can still hit a unique violation. Use ON CONFLICT for hot single-row upserts and MERGE for batch synchronization.

**Idempotency tip:** combine \`ON CONFLICT DO NOTHING\` with a request id column to make retried API calls safe.`,
      codeExample: `-- Racy two-step version (do not do this)
-- SELECT 1 FROM inventory WHERE sku = 'X';
-- if none: INSERT ...  else: UPDATE ...

-- Atomic upsert (Postgres)
INSERT INTO inventory (sku, qty, updated_at)
VALUES ('X', 5, NOW())
ON CONFLICT (sku) DO UPDATE
SET qty        = inventory.qty + EXCLUDED.qty,
    updated_at = EXCLUDED.updated_at
WHERE inventory.qty + EXCLUDED.qty >= 0;   -- optional guard

-- Idempotent insert: retrying the same request is harmless
INSERT INTO payments (request_id, amount)
VALUES ('req-123', 49.99)
ON CONFLICT (request_id) DO NOTHING;

-- MySQL equivalent
INSERT INTO inventory (sku, qty)
VALUES ('X', 5)
ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty);

-- MERGE: sync a staging table into products (Postgres 15+ / SQL Server)
MERGE INTO products p
USING staged_products s ON s.sku = p.sku
WHEN MATCHED AND s.discontinued THEN
  DELETE
WHEN MATCHED THEN
  UPDATE SET price = s.price, name = s.name
WHEN NOT MATCHED THEN
  INSERT (sku, name, price) VALUES (s.sku, s.name, s.price);`,
    },
  ],

  visualizations: [
    {
      title: 'Read Phenomena by Isolation Level',
      description: 'What each level prevents',
      nodes: [
        { id: 'ru',  label: 'READ\nUNCOMMITTED\nallows all',    x: 60,  y: 50,  type: 'error' },
        { id: 'rc',  label: 'READ\nCOMMITTED\nno dirty reads',  x: 220, y: 50,  type: 'warning' },
        { id: 'rr',  label: 'REPEATABLE\nREAD\nno non-rep',     x: 60,  y: 160, type: 'secondary' },
        { id: 'sr',  label: 'SERIALIZABLE\nno phantoms',        x: 220, y: 160, type: 'success' },
      ],
      edges: [
        { from: 'ru', to: 'rc' },
        { from: 'rc', to: 'rr' },
        { from: 'rr', to: 'sr' },
      ],
    },
    {
      title: 'Deadlock Cycle',
      description: 'Two transactions each waiting on the other',
      nodes: [
        { id: 't1',   label: 'T1\nholds row A',  x: 60,  y: 50,  type: 'primary' },
        { id: 't2',   label: 'T2\nholds row B',  x: 220, y: 50,  type: 'primary' },
        { id: 'wait1',label: 'T1 waits\nfor row B', x: 220, y: 160, type: 'warning' },
        { id: 'wait2',label: 'T2 waits\nfor row A', x: 60,  y: 160, type: 'warning' },
        { id: 'kill', label: 'DB aborts\none tx',   x: 140, y: 260, type: 'error' },
      ],
      edges: [
        { from: 't1',   to: 'wait1' },
        { from: 't2',   to: 'wait2' },
        { from: 'wait1',to: 'kill' },
        { from: 'wait2',to: 'kill' },
      ],
    },
  ],

  flashcards: [
    { id: 'tx1',  front: 'What does ACID stand for?', back: 'Atomicity, Consistency, Isolation, Durability. The four guarantees a transactional database makes.' },
    { id: 'tx2',  front: 'What does atomicity guarantee?', back: 'All statements in a transaction commit together or none do — no partial application on crash or rollback.' },
    { id: 'tx3',  front: 'What does durability guarantee?', back: 'Once COMMIT returns successfully, the change survives a crash or power loss. Typically backed by a write-ahead log (WAL).' },
    { id: 'tx4',  front: 'What is a dirty read?', back: 'Reading uncommitted data from another transaction. Only possible at READ UNCOMMITTED.' },
    { id: 'tx5',  front: 'What is a non-repeatable read?', back: 'Reading the same row twice in one transaction and getting different values because another transaction committed an UPDATE in between.' },
    { id: 'tx6',  front: 'What is a phantom read?', back: 'Re-running the same query and seeing different rows because another transaction committed an INSERT or DELETE matching the predicate.' },
    { id: 'tx7',  front: 'Which isolation level prevents all three phenomena?', back: 'SERIALIZABLE. Comes at the cost of more aborts under contention.' },
    { id: 'tx8',  front: 'What\'s Postgres\'s default isolation level?', back: 'READ COMMITTED. MySQL InnoDB defaults to REPEATABLE READ.' },
    { id: 'tx9',  front: 'What is MVCC?', back: 'Multi-Version Concurrency Control — readers see a snapshot consistent with their transaction\'s start; writers create new row versions instead of overwriting. Readers and writers don\'t block each other.' },
    { id: 'tx10', front: 'What does SELECT ... FOR UPDATE do?', back: 'Acquires a row-level write lock. Other transactions trying to update those rows block until you commit. Prevents lost-update races.' },
    { id: 'tx11', front: 'What does FOR UPDATE SKIP LOCKED do?', back: 'Skips rows that are already locked instead of waiting. The standard pattern for "claim one job from a queue without two workers grabbing the same row".' },
    { id: 'tx12', front: 'What\'s optimistic concurrency control?', back: 'Don\'t lock. Add a version column, increment on update, and require WHERE version = $old. If 0 rows match, someone beat you to it — refetch and retry.' },
    { id: 'tx13', front: 'What is a deadlock?', back: 'Two transactions each hold a lock the other needs, neither can progress. The DB detects this and aborts one with a deadlock error.' },
    { id: 'tx14', front: 'How do you prevent most deadlocks?', back: 'Acquire locks in a consistent order across all code paths (e.g. always lock rows by ascending id), keep transactions short, and retry on deadlock errors.' },
    { id: 'tx15', front: 'What is a savepoint?', back: 'A named mid-transaction marker. ROLLBACK TO sp1 undoes everything since the savepoint without ending the transaction.' },
    { id: 'tx16', front: 'What is autocommit?', back: 'Each statement runs in its own implicit transaction and commits immediately. On by default in most clients — disable or use explicit BEGIN/COMMIT for multi-statement atomicity.' },
    { id: 'tx17', front: 'Why does Postgres need VACUUM?', back: 'MVCC leaves dead row versions when UPDATEs and DELETEs happen. VACUUM (autovacuum runs automatically) reclaims that space and updates statistics.' },
    { id: 'tx18', front: 'What\'s the trade-off of higher isolation?', back: 'Stronger consistency for readers but more locking or more serialization failures, leading to lower throughput under contention.' },
    { id: 'tx19', front: 'What is a lost update?', back: 'Two transactions read the same row, compute a new value in app code, and both write it back — the second write silently overwrites the first. Fix with an atomic UPDATE (SET x = x - 1), SELECT FOR UPDATE, a version column, or REPEATABLE READ/SERIALIZABLE.' },
    { id: 'tx20', front: 'Why is `UPDATE accounts SET balance = balance - 30` safer than reading the balance and writing 70?', back: 'The subtraction happens inside one statement under the row lock, so concurrent decrements serialize correctly. Read-then-write in app code leaves a window where another writer\'s change is lost.' },
    { id: 'tx21', front: 'What is write skew?', back: 'Two transactions read overlapping data, each writes a different row, and together they break an invariant (both on-call doctors go off duty). No row is written twice, so row locks miss it — only SERIALIZABLE or locking the rows you read prevents it.' },
    { id: 'tx22', front: 'How does Postgres REPEATABLE READ differ from the SQL standard?', back: 'It is snapshot isolation: one snapshot for the entire transaction, so phantom reads are impossible too. But write skew is still possible, and updating a row another transaction changed since the snapshot raises a serialization error.' },
    { id: 'tx23', front: 'Under READ COMMITTED, can two identical SELECTs in one transaction return different results?', back: 'Yes. Each statement takes a fresh snapshot of committed data at its start, so anything committed between the two statements is visible to the second. That is the non-repeatable read the level permits.' },
    { id: 'tx24', front: 'What happens when T2 runs SELECT ... FOR UPDATE on a row T1 already locked?', back: 'T2 blocks until T1 commits or rolls back. Under READ COMMITTED it then re-reads the row and sees T1\'s committed changes; under REPEATABLE READ it aborts with a serialization error if the row changed.' },
    { id: 'tx25', front: 'What is two-phase commit (2PC)?', back: 'A protocol for atomic commits across multiple databases: a coordinator asks every participant to PREPARE (make the transaction durable but uncommitted), and only if all vote yes sends COMMIT. Slow and the coordinator is a single point of failure — sagas are the common alternative.' },
    { id: 'tx26', front: 'Why is SELECT-then-INSERT racy, and how does ON CONFLICT fix it?', back: 'Two clients can both see "no row" and both insert; one gets a unique-violation error, or you get duplicates without a constraint. INSERT ... ON CONFLICT resolves the collision atomically inside the database in a single statement.' },
    { id: 'tx27', front: 'What does the MERGE statement do?', back: 'Joins a source to a target and applies per-branch actions: WHEN MATCHED THEN UPDATE or DELETE, WHEN NOT MATCHED THEN INSERT. Standard SQL (Postgres 15+, SQL Server, Oracle), ideal for syncing a staging table into a live one.' },
    { id: 'tx28', front: 'How does the write-ahead log (WAL) provide durability?', back: 'Every change is appended to the log and fsynced to disk before COMMIT returns; the actual data pages are written later. After a crash, the DB replays the WAL to redo committed changes that never reached the data files.' },
    { id: 'tx29', front: 'Why are long-running or idle-in-transaction sessions harmful under MVCC?', back: 'Their snapshot pins old row versions, so VACUUM cannot reclaim dead tuples and tables bloat. They also hold any locks they acquired, blocking DDL and writers for the whole duration.' },
    { id: 'tx30', front: 'Lock wait vs deadlock — what\'s the difference?', back: 'A lock wait is one transaction blocking until another releases a lock; it resolves on its own. A deadlock is a cycle of waits that can never resolve, so the DB aborts one participant. lock_timeout bounds waits; deadlock detection handles cycles.' },
  ],

  quizQuestions: [
    {
      id: 'txq1',
      question: 'Which property guarantees a transaction is all-or-nothing?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctAnswer: 0,
      explanation: 'Atomicity = nothing partial. Either every statement commits or none do.',
    },
    {
      id: 'txq2',
      question: 'You read row X, another transaction updates and commits it, you read X again and get a different value. What phenomenon?',
      options: ['Dirty read', 'Non-repeatable read', 'Phantom read', 'Deadlock'],
      correctAnswer: 1,
      explanation: 'Non-repeatable read. Prevented at REPEATABLE READ and above.',
    },
    {
      id: 'txq3',
      question: 'Which isolation level forbids ALL three read phenomena?',
      options: ['READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE', 'READ UNCOMMITTED'],
      correctAnswer: 2,
      explanation: 'SERIALIZABLE is the strictest. Trades throughput for correctness.',
    },
    {
      id: 'txq4',
      question: 'What does SELECT ... FOR UPDATE do?',
      options: ['Updates the row', 'Locks the row for write so other transactions can\'t modify it', 'Marks rows for deletion', 'Updates in parallel'],
      correctAnswer: 1,
      explanation: 'Acquires a row-level write lock. Used to read-then-modify safely.',
    },
    {
      id: 'txq5',
      question: 'You want a worker queue where each row is claimed by exactly one worker. What clause?',
      options: ['FOR SHARE', 'FOR UPDATE NOWAIT', 'FOR UPDATE SKIP LOCKED', 'LIMIT 1'],
      correctAnswer: 2,
      explanation: 'SKIP LOCKED lets parallel workers each claim a different unlocked row in one query.',
    },
    {
      id: 'txq6',
      question: 'What is MVCC?',
      options: ['A transaction log format', 'Multi-Version Concurrency Control — readers see a consistent snapshot, writers create new versions', 'A lock escalation policy', 'A retry library'],
      correctAnswer: 1,
      explanation: 'MVCC means readers and writers don\'t block each other; each tx reads from a consistent snapshot.',
    },
    {
      id: 'txq7',
      question: 'Two transactions update the same two rows in opposite order. What happens?',
      options: ['Both succeed', 'The DB merges them', 'Deadlock — one is aborted', 'Both fail'],
      correctAnswer: 2,
      explanation: 'Classic deadlock cycle. The DB picks one to abort with a deadlock error; retrying typically succeeds.',
    },
    {
      id: 'txq8',
      question: 'What\'s the simplest way to prevent most deadlocks?',
      options: ['Use a single transaction for everything', 'Lock rows in a consistent order across all code paths', 'Disable isolation', 'Use NOWAIT everywhere'],
      correctAnswer: 1,
      explanation: 'If every transaction touches rows in the same order, the cycle that causes deadlock can\'t form.',
    },
    {
      id: 'txq9',
      question: 'What does ROLLBACK TO savepoint do?',
      options: ['Ends the transaction', 'Undoes work since the savepoint, transaction stays alive', 'Commits the savepoint', 'Creates a backup'],
      correctAnswer: 1,
      explanation: 'Savepoints let you partially roll back without losing the whole transaction.',
    },
    {
      id: 'txq10',
      question: 'Optimistic concurrency control typically uses what?',
      options: ['FOR UPDATE locks', 'A version column checked on UPDATE', 'Deadlock detection', 'SERIALIZABLE isolation'],
      correctAnswer: 1,
      explanation: 'No locks held during the read. On write, WHERE version = $old fails if someone else changed the row, and the app retries.',
    },
    {
      id: 'txq11',
      question: 'Two sessions each read balance = 100, then each runs `UPDATE accounts SET balance = 70 WHERE id = 1` and commits. What is the final balance?',
      options: ['40', '70', '100', 'Deadlock error'],
      correctAnswer: 1,
      explanation: 'This is a lost update: the second write overwrites the first with the same stale computation. No deadlock occurs because both touch only one row in the same order.',
    },
    {
      id: 'txq12',
      question: 'Which single statement avoids the lost-update race for a decrement of 30?',
      options: ['SELECT balance; then UPDATE SET balance = 70', 'UPDATE accounts SET balance = 70 WHERE id = 1 AND balance = 100', 'UPDATE accounts SET balance = balance - 30 WHERE id = 1', 'BEGIN; UPDATE ...; COMMIT with autocommit off'],
      correctAnswer: 2,
      explanation: 'Computing the new value inside the UPDATE runs under the row lock, so concurrent decrements serialize. Option B is a valid optimistic check but fails one of the writers rather than applying both.',
    },
    {
      id: 'txq13',
      question: 'Two on-call doctors each check that another doctor is on call, then each sets themselves off duty. Both transactions commit and nobody is on call. Which isolation level would have prevented this?',
      options: ['READ COMMITTED', 'REPEATABLE READ', 'READ UNCOMMITTED', 'SERIALIZABLE'],
      correctAnswer: 3,
      explanation: 'This is write skew: different rows are written, so row locks and snapshot isolation do not conflict. SERIALIZABLE detects the read/write dependency and aborts one transaction.',
    },
    {
      id: 'txq14',
      question: 'Under Postgres\'s default isolation level, you run the same SELECT COUNT(*) twice in one transaction and get 100 then 101. Is this a bug?',
      options: ['No — READ COMMITTED takes a new snapshot per statement', 'Yes — a transaction always sees one snapshot', 'Yes — it indicates a dirty read', 'No — COUNT(*) is never transactional'],
      correctAnswer: 0,
      explanation: 'READ COMMITTED sees everything committed before each statement starts. Use REPEATABLE READ to hold one snapshot for the whole transaction.',
    },
    {
      id: 'txq15',
      question: 'T1 holds `SELECT ... FOR UPDATE` on row 5. T2 issues the same statement. What happens to T2?',
      options: ['It gets the row immediately with stale data', 'It fails with a deadlock error', 'It blocks until T1 commits or rolls back', 'It is skipped'],
      correctAnswer: 2,
      explanation: 'FOR UPDATE is an exclusive row lock. T2 waits; once T1 finishes, T2 proceeds (and under READ COMMITTED sees T1\'s committed version). SKIP LOCKED or NOWAIT would change this behavior.',
    },
    {
      id: 'txq16',
      question: 'Two API servers simultaneously try to create the same user by first SELECTing, then INSERTing. What is the robust fix?',
      options: ['Add a retry loop around the SELECT', 'Use INSERT ... ON CONFLICT (email) DO NOTHING (or DO UPDATE)', 'Lower the isolation level', 'Run the SELECT with LIMIT 1'],
      correctAnswer: 1,
      explanation: 'The check-then-insert gap is the race. ON CONFLICT resolves the collision atomically in one statement against the unique constraint, so neither server errors or duplicates.',
    },
    {
      id: 'txq17',
      question: 'In a MERGE statement, which clause updates rows that already exist in the target?',
      options: ['WHEN MATCHED THEN UPDATE', 'WHEN NOT MATCHED THEN UPDATE', 'ON CONFLICT DO UPDATE', 'WHEN EXISTS THEN UPDATE'],
      correctAnswer: 0,
      explanation: 'MATCHED means the source row joined to a target row. NOT MATCHED branches handle inserts. ON CONFLICT belongs to INSERT, not MERGE.',
    },
    {
      id: 'txq18',
      question: 'What must be safely on disk before COMMIT returns to guarantee durability?',
      options: ['All modified data pages', 'The table\'s indexes', 'The WAL records for the transaction', 'A full checkpoint'],
      correctAnswer: 2,
      explanation: 'The write-ahead log is fsynced at commit; data pages can be flushed later because crash recovery replays the WAL. Waiting for data pages would make every commit far slower.',
    },
    {
      id: 'txq19',
      question: 'A Postgres session has been "idle in transaction" for six hours. What is the main damage?',
      options: ['Its queries run slower', 'VACUUM cannot remove dead rows newer than its snapshot, and its locks block others', 'The transaction is auto-committed', 'The WAL is truncated'],
      correctAnswer: 1,
      explanation: 'The open snapshot pins old row versions, so tables bloat, and any locks the session took stay held. Set idle_in_transaction_session_timeout to kill such sessions.',
    },
    {
      id: 'txq20',
      question: 'In Postgres REPEATABLE READ, T1 reads row 5. T2 updates row 5 and commits. T1 then tries to UPDATE row 5. What happens?',
      options: ['T1\'s update succeeds and overwrites T2\'s', 'T1 sees T2\'s value and updates on top of it', 'T1 blocks forever', 'T1 fails with "could not serialize access due to concurrent update"'],
      correctAnswer: 3,
      explanation: 'Snapshot isolation refuses to let a transaction modify a row that changed after its snapshot was taken. The client should retry the transaction from the start.',
    },
  ],
};

// =============================================================================
// EXPORT
// =============================================================================
export const sqlCategories: SQLCategory[] = [
  sqlFundamentals,
  sqlJoins,
  sqlAggregations,
  sqlSubqueriesCTEs,
  sqlWindowFunctions,
  sqlIndexesPerformance,
  sqlTransactions,
];
