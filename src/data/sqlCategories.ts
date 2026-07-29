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
