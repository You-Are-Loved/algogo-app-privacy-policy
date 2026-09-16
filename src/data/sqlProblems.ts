// SQL practice problems — write a query against a small schema and get graded
// by running it in an in-app SQLite engine (sql.js, bundled offline).
//
// Grading model (see src/practice/sqlHtml.ts):
//   - For every dataset, a fresh in-memory database is built from `schema`
//     + that dataset's seed rows.
//   - The reference `solution` is run to produce the expected rows; the
//     user's query is run and compared row-by-row.
//   - datasets[0] is the visible example (its expected output is shown in the
//     problem sheet); the rest are hidden so answers can't be hard-coded.
//   - Row comparison ignores column NAMES but not column order or count.
//     Numbers compare within 1e-6; NULLs must match. When `ordered` is true
//     the row order must match too (the statement must say what to order by);
//     otherwise rows are compared as a multiset.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SqlProblem {
  id: string;
  number: number; // 1-50
  title: string;
  difficulty: Difficulty;
  topic: string;
  /** Markdown-light task description. Must pin down columns + their order. */
  statement: string;
  /** CREATE TABLE statements shared by every dataset. */
  schema: string;
  /** INSERT statements. [0] is the visible example; the rest are hidden. */
  datasets: string[];
  /** Reference query the user's result is compared against. */
  solution: string;
  /** True when the statement dictates row order (compare in order). */
  ordered?: boolean;
  hint?: string;
  explanation: string;
}

export const SQL_STARTER = '-- Write your query below\n\n';

export const sqlProblems: SqlProblem[] = [
  // ===== Basics =====
  {
    id: 'sql-customers-in-country',
    number: 1,
    title: 'Customers in Canada',
    difficulty: 'Easy',
    topic: 'Basics',
    statement:
      "You have a `customers` table with `id`, `name`, `city` and `country`.\n\nReturn the `id` and `name` (in that order) of every customer whose `country` is exactly `'Canada'`. Rows can be in any order.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Alice Chen', 'Toronto', 'Canada'),
  (2, 'Bob Ruiz', 'Austin', 'USA'),
  (3, 'Chloe Park', 'Vancouver', 'Canada'),
  (4, 'Dev Patel', 'London', 'UK'),
  (5, 'Emma Novak', 'Montreal', 'Canada'),
  (6, 'Finn Walsh', 'Dublin', 'Ireland');`,
      `INSERT INTO customers VALUES
  (1, 'Ana Souza', 'Lisbon', 'Portugal'),
  (2, 'Ben Ito', 'Osaka', 'Japan'),
  (3, 'Cara Lund', 'Calgary', 'Canada'),
  (4, 'Dan Cole', 'Boston', 'USA'),
  (5, 'Eli Marsh', NULL, 'Canada');`,
      `INSERT INTO customers VALUES
  (1, 'Gus Hale', 'Perth', 'Australia'),
  (2, 'Hana Lee', 'Seoul', 'South Korea'),
  (3, 'Ivan Petrov', 'Sofia', 'Bulgaria');`,
      `INSERT INTO customers VALUES
  (10, 'Jo Barr', 'Halifax', 'Canada'),
  (11, 'Kai Wong', 'Ottawa', 'Canada'),
  (12, 'Lia Roy', 'Quebec City', 'Canada'),
  (13, 'Max Dorn', 'Berlin', 'Germany');`,
    ],
    solution: `SELECT id, name
FROM customers
WHERE country = 'Canada';`,
    hint: 'A WHERE clause filters rows; the SELECT list decides which columns (and in what order) come back.',
    explanation:
      "This is the most basic shape of a query: pick columns in the SELECT list, pick rows with WHERE. String comparison with `=` is case-sensitive in most engines, so `'canada'` would match nothing.\n\nOnly return the columns asked for — `SELECT *` gives back four columns, which is a different result.",
  },
  {
    id: 'sql-distinct-cities',
    number: 2,
    title: 'Distinct Customer Cities',
    difficulty: 'Easy',
    topic: 'Basics',
    statement:
      "The `customers` table has `id`, `name`, `city` and `country`. Several customers can live in the same city, and some have no city on file (`city` is NULL).\n\nReturn one column, `city`, listing every distinct city that appears at least once. Skip NULL cities. Rows can be in any order.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Alice Chen', 'Toronto', 'Canada'),
  (2, 'Bob Ruiz', 'Austin', 'USA'),
  (3, 'Chloe Park', 'Toronto', 'Canada'),
  (4, 'Dev Patel', 'London', 'UK'),
  (5, 'Emma Novak', NULL, 'Canada'),
  (6, 'Finn Walsh', 'Austin', 'USA');`,
      `INSERT INTO customers VALUES
  (1, 'Ana Souza', 'Lisbon', 'Portugal'),
  (2, 'Ben Ito', 'Osaka', 'Japan'),
  (3, 'Cara Lund', NULL, 'Canada'),
  (4, 'Dan Cole', NULL, 'USA'),
  (5, 'Eli Marsh', 'Boston', 'USA');`,
      `INSERT INTO customers VALUES
  (1, 'Gus Hale', 'Berlin', 'Germany'),
  (2, 'Hana Lee', 'Berlin', 'Germany'),
  (3, 'Ivan Petrov', 'Berlin', 'Germany'),
  (4, 'Jo Barr', 'Berlin', 'Germany'),
  (5, 'Kai Wong', NULL, 'Germany');`,
    ],
    solution: `SELECT DISTINCT city
FROM customers
WHERE city IS NOT NULL;`,
    hint: 'DISTINCT collapses duplicates — but NULL is a value too, so filter it out explicitly.',
    explanation:
      "`SELECT DISTINCT city` returns each city once. DISTINCT treats NULL as one more distinct value, so without the `WHERE city IS NOT NULL` you'd get a NULL row in the output.\n\nRemember that `city != NULL` never evaluates to true — you must use `IS NOT NULL` to test for missing values.",
  },
  {
    id: 'sql-top-three-priciest',
    number: 3,
    title: 'Three Most Expensive Products',
    difficulty: 'Easy',
    topic: 'Basics',
    statement:
      "A `products` table has `id`, `name`, `category` and `price`.\n\nReturn the `name` and `price` of the three most expensive products, ordered by `price` descending, then by `name` ascending as a tiebreak. If there are fewer than three products, return what there is.",
    schema: `CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO products VALUES
  (1, 'Desk Lamp', 'Home', 45.00),
  (2, 'Standing Desk', 'Furniture', 399.00),
  (3, 'Notebook', 'Stationery', 4.50),
  (4, 'Office Chair', 'Furniture', 249.99),
  (5, 'Monitor', 'Electronics', 189.00),
  (6, 'Pen Set', 'Stationery', 12.00);`,
      `INSERT INTO products VALUES
  (1, 'Zeta Lamp', 'Home', 80.00),
  (2, 'Mid Lamp', 'Home', 80.00),
  (3, 'Alpha Lamp', 'Home', 80.00),
  (4, 'Cheap Lamp', 'Home', 15.00),
  (5, 'Bulb', 'Home', 3.00);`,
      `INSERT INTO products VALUES
  (1, 'Router', 'Electronics', 120.00),
  (2, 'Cable', 'Electronics', 9.99);`,
      `INSERT INTO products VALUES
  (1, 'Tent', 'Outdoor', 150.00),
  (2, 'Stove', 'Outdoor', 150.00),
  (3, 'Backpack', 'Outdoor', 95.00),
  (4, 'Lantern', 'Outdoor', 95.00),
  (5, 'Mug', 'Outdoor', 8.00);`,
    ],
    ordered: true,
    solution: `SELECT name, price
FROM products
ORDER BY price DESC, name ASC
LIMIT 3;`,
    hint: 'ORDER BY sorts, LIMIT cuts. Think about what happens when two products share a price.',
    explanation:
      "Sort by `price DESC` so the priciest products come first, then `LIMIT 3` keeps the top of that list. The `name ASC` tiebreak matters: when several products share a price, the engine would otherwise return them in an arbitrary order, and a top-3 cut could even pick a different subset.\n\nLIMIT is applied after ORDER BY, which is why this pattern works.",
  },
  {
    id: 'sql-emails-at-domain',
    number: 4,
    title: 'Employees With a Company Email',
    difficulty: 'Easy',
    topic: 'Basics',
    statement:
      "An `employees` table has `id`, `name` and `email` (which may be NULL). All emails are stored in lower case.\n\nReturn the `id` and `email` of employees whose email ends with exactly `@example.org`. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Maya Ortiz', 'maya@example.org'),
  (2, 'Noah Kim', 'noah@example.com'),
  (3, 'Olive Brand', 'olive@example.org'),
  (4, 'Pat Reyes', NULL),
  (5, 'Quinn Doyle', 'quinn@example.org'),
  (6, 'Rosa Vidal', 'rosa@mail.net');`,
      `INSERT INTO employees VALUES
  (1, 'Nia Bell', 'nia@notexample.org'),
  (2, 'Omar Aziz', 'omar@example.org.uk'),
  (3, 'Pia Falk', 'pia@example.org'),
  (4, 'Raj Nair', 'raj@example.org');`,
      `INSERT INTO employees VALUES
  (1, 'Sam Cole', 'sam@gmail.com'),
  (2, 'Tess Ward', NULL),
  (3, 'Uma Rao', 'uma@example.net');`,
    ],
    solution: `SELECT id, email
FROM employees
WHERE email LIKE '%@example.org';`,
    hint: "LIKE with a leading `%` matches any prefix. Make sure the `@` is part of the pattern.",
    explanation:
      "`LIKE '%@example.org'` matches any string that ends with `@example.org`. Including the `@` in the pattern is what keeps out look-alikes such as `nia@notexample.org`; and having no trailing `%` keeps out `omar@example.org.uk`.\n\nNULL emails never match a LIKE pattern, so they drop out automatically.",
  },
  {
    id: 'sql-hired-in-2020',
    number: 5,
    title: 'Sales and Marketing Hires of 2020',
    difficulty: 'Easy',
    topic: 'Basics',
    statement:
      "An `employees` table has `id`, `name`, `department` and `hire_date` (an ISO date string like `'2020-03-15'`, possibly NULL).\n\nReturn the `id` and `name` of employees in the `'Sales'` or `'Marketing'` department who were hired between `'2020-01-01'` and `'2020-12-31'` inclusive. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  hire_date TEXT
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ava Lind', 'Sales', '2020-03-15'),
  (2, 'Ben Osei', 'Engineering', '2020-06-01'),
  (3, 'Cal Ruiz', 'Marketing', '2020-11-30'),
  (4, 'Dee Park', 'Sales', '2019-08-20'),
  (5, 'Eve Shaw', 'Marketing', '2021-01-04'),
  (6, 'Fay Tran', 'Sales', '2020-07-07'),
  (7, 'Gil Moss', 'Support', '2020-02-02');`,
      `INSERT INTO employees VALUES
  (1, 'Hal Boyd', 'Sales', '2020-01-01'),
  (2, 'Ida Wolf', 'Marketing', '2020-12-31'),
  (3, 'Jon Pike', 'Sales', '2019-12-31'),
  (4, 'Kay Lowe', 'Marketing', '2021-01-01'),
  (5, 'Lev Adam', 'Engineering', '2020-01-01');`,
      `INSERT INTO employees VALUES
  (1, 'Mo Gray', 'Sales', NULL),
  (2, 'Nel Ford', 'Marketing', '2018-05-05'),
  (3, 'Oz Kane', 'Engineering', '2020-05-05'),
  (4, 'Pam Holt', 'Marketing', '2020-05-05');`,
    ],
    solution: `SELECT id, name
FROM employees
WHERE department IN ('Sales', 'Marketing')
  AND hire_date BETWEEN '2020-01-01' AND '2020-12-31';`,
    hint: 'IN handles the list of departments; BETWEEN is inclusive on both ends. Watch operator precedence if you use OR.',
    explanation:
      "`IN ('Sales', 'Marketing')` is shorthand for two equality checks joined by OR, and `BETWEEN` includes both endpoints, so hires on Jan 1 and Dec 31 count. ISO dates sort correctly as plain strings, which is why the text comparison works.\n\nA classic slip is writing `a = 'Sales' OR a = 'Marketing' AND date ...` — AND binds tighter than OR, so the date filter only applies to Marketing. Use IN or parentheses.",
  },
  {
    id: 'sql-movies-of-the-2000s',
    number: 6,
    title: 'Best-Rated Movies of the 2000s',
    difficulty: 'Medium',
    topic: 'Basics',
    statement:
      "A `movies` table has `id`, `title`, `year` and `rating` (a REAL from 0 to 10, or NULL if the movie hasn't been rated).\n\nReturn `title`, `year` and `rating` for rated movies released from 2000 through 2010 inclusive. Order the rows by `rating` descending, then `year` ascending, then `title` ascending.",
    schema: `CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating REAL
);`,
    datasets: [
      `INSERT INTO movies VALUES
  (1, 'Memento', 2000, 8.4),
  (2, 'Inception', 2010, 8.8),
  (3, 'Amelie', 2001, 8.3),
  (4, 'The Matrix', 1999, 8.7),
  (5, 'Drive', 2011, 7.8),
  (6, 'Lost Tapes', 2004, NULL),
  (7, 'Zodiac', 2007, 7.7);`,
      `INSERT INTO movies VALUES
  (1, 'Apple', 2005, 8.0),
  (2, 'Zebra', 2002, 8.0),
  (3, 'Mango', 2002, 8.0),
  (4, 'Kiwi', 2008, 6.5),
  (5, 'Quiet', 2003, NULL);`,
      `INSERT INTO movies VALUES
  (1, 'Edge', 2000, 7.0),
  (2, 'Last', 2010, 7.5),
  (3, 'Before', 1999, 9.0),
  (4, 'After', 2011, 9.1);`,
    ],
    ordered: true,
    solution: `SELECT title, year, rating
FROM movies
WHERE year BETWEEN 2000 AND 2010
  AND rating IS NOT NULL
ORDER BY rating DESC, year ASC, title ASC;`,
    hint: 'Filter first, then sort on three keys. Ordering by rating alone leaves ties undefined.',
    explanation:
      "The WHERE clause keeps 2000–2010 releases with a real rating, then ORDER BY sorts on three keys in turn: highest rating first, then earliest year, then alphabetical title. Each extra key only kicks in when the previous ones tie.\n\nNULL ratings would sort to one end depending on the engine — excluding them explicitly keeps the result well-defined.",
  },

  // ===== Aggregation =====
  {
    id: 'sql-orders-per-customer-id',
    number: 7,
    title: 'Orders Per Customer',
    difficulty: 'Easy',
    topic: 'Aggregation',
    statement:
      "An `orders` table has `id`, `customer_id`, `order_date` and `amount` (`amount` is NULL for orders that haven't been invoiced yet).\n\nFor every customer that has at least one order, return `customer_id` and `order_count` — the number of orders they placed. Rows can be in any order.",
    schema: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  amount REAL
);`,
    datasets: [
      `INSERT INTO orders VALUES
  (101, 1, '2024-01-05', 49.90),
  (102, 2, '2024-01-06', 15.00),
  (103, 1, '2024-01-09', 120.00),
  (104, 3, '2024-01-10', 8.75),
  (105, 1, '2024-02-01', 33.30),
  (106, 2, '2024-02-03', 60.00),
  (107, 3, '2024-02-14', 22.10);`,
      `INSERT INTO orders VALUES
  (201, 7, '2024-03-01', 10.00),
  (202, 7, '2024-03-01', NULL),
  (203, 7, '2024-03-01', 12.50),
  (204, 8, '2024-03-02', NULL),
  (205, 9, '2024-03-05', 99.00);`,
      `INSERT INTO orders VALUES
  (301, 4, '2024-04-01', 5.00),
  (302, 4, '2024-04-02', 6.00),
  (303, 4, '2024-04-03', 7.00),
  (304, 4, '2024-04-04', 8.00);`,
    ],
    solution: `SELECT customer_id, COUNT(*) AS order_count
FROM orders
GROUP BY customer_id;`,
    hint: 'GROUP BY customer_id collapses each customer into one row; COUNT(*) counts rows in each group.',
    explanation:
      "`GROUP BY customer_id` partitions the table into one bucket per customer, and `COUNT(*)` counts the rows in each bucket. `COUNT(*)` counts every row, including ones where `amount` is NULL — `COUNT(amount)` would silently skip un-invoiced orders.\n\nWithout the GROUP BY, an aggregate collapses the whole table into a single row.",
  },
  {
    id: 'sql-departments-with-three-plus',
    number: 8,
    title: 'Departments With at Least Three Employees',
    difficulty: 'Medium',
    topic: 'Aggregation',
    statement:
      "An `employees` table has `id`, `name`, `department_id` and `salary`. Some employees aren't assigned to a department yet (`department_id` is NULL).\n\nReturn `department_id` and `headcount` for every department with **at least 3** employees. Ignore unassigned employees. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ana', 10, 70000),
  (2, 'Bo', 10, 65000),
  (3, 'Cy', 10, 80000),
  (4, 'Di', 20, 90000),
  (5, 'Ed', 20, 72000),
  (6, 'Flo', 30, 50000),
  (7, 'Gus', 30, 52000),
  (8, 'Hal', 30, 58000),
  (9, 'Ivy', 30, 61000),
  (10, 'Jax', NULL, 45000);`,
      `INSERT INTO employees VALUES
  (1, 'Kim', NULL, 40000),
  (2, 'Lou', NULL, 41000),
  (3, 'Mel', NULL, 42000),
  (4, 'Ned', 10, 60000),
  (5, 'Ora', 10, 61000),
  (6, 'Pax', 10, 62000),
  (7, 'Ria', 20, 70000);`,
      `INSERT INTO employees VALUES
  (1, 'Sal', 10, 50000),
  (2, 'Tia', 10, 51000),
  (3, 'Uli', 20, 52000),
  (4, 'Val', 30, 53000);`,
    ],
    solution: `SELECT department_id, COUNT(*) AS headcount
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id
HAVING COUNT(*) >= 3;`,
    hint: 'WHERE filters rows before grouping; HAVING filters groups after. You need both here.',
    explanation:
      "WHERE runs before the grouping, so `WHERE department_id IS NOT NULL` throws out unassigned people before they can form a NULL group. HAVING runs after, which is the only place you can test an aggregate like `COUNT(*) >= 3`.\n\nPutting the aggregate condition in WHERE is an error, and forgetting the NULL filter can produce a phantom department.",
  },
  {
    id: 'sql-count-star-vs-count-column',
    number: 9,
    title: 'Headcount and Phone Coverage',
    difficulty: 'Medium',
    topic: 'Aggregation',
    statement:
      "An `employees` table has `id`, `name`, `department` and `phone` (NULL when we don't have a number on file). Two employees may share a phone.\n\nFor each department return `department`, `total` — the number of employees — and `with_phone` — how many of them have a non-NULL phone. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ana Reed', 'Sales', '555-0101'),
  (2, 'Ben Cruz', 'Sales', NULL),
  (3, 'Cara Diaz', 'Sales', '555-0103'),
  (4, 'Dan Ember', 'Engineering', NULL),
  (5, 'Eva Frost', 'Engineering', NULL),
  (6, 'Fred Gale', 'HR', '555-0106');`,
      `INSERT INTO employees VALUES
  (1, 'Gia Hart', 'Sales', '555-0200'),
  (2, 'Hugo Ives', 'Sales', '555-0200'),
  (3, 'Ines Jain', 'Sales', NULL),
  (4, 'Jude Kerr', 'Support', '555-0204'),
  (5, 'Kate Lam', 'Support', '555-0204'),
  (6, 'Liam Moss', 'Support', '555-0206');`,
      `INSERT INTO employees VALUES
  (1, 'Mia Nash', 'Ops', '555-0301'),
  (2, 'Nate Orr', 'Ops', '555-0302'),
  (3, 'Opal Pace', 'Legal', '555-0303');`,
    ],
    solution: `SELECT department, COUNT(*) AS total, COUNT(phone) AS with_phone
FROM employees
GROUP BY department;`,
    hint: 'COUNT(*) counts rows. COUNT(column) counts rows where that column is not NULL.',
    explanation:
      "The whole question is the difference between `COUNT(*)` and `COUNT(phone)`: the first counts every row in the group, the second skips rows where `phone` is NULL. Put them side by side and you get coverage per department.\n\n`COUNT(DISTINCT phone)` is a third thing entirely — it would undercount when two colleagues share a desk phone.",
  },
  {
    id: 'sql-salary-stats-by-department',
    number: 10,
    title: 'Salary Range Per Department',
    difficulty: 'Easy',
    topic: 'Aggregation',
    statement:
      "An `employees` table has `id`, `name`, `department` and `salary` (an integer, or NULL if not yet set).\n\nFor each department return `department`, `min_salary`, `max_salary` and `avg_salary` — the average of the known salaries, rounded to 2 decimal places. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ana', 'Engineering', 100000),
  (2, 'Bo', 'Engineering', 85000),
  (3, 'Cy', 'Engineering', 90000),
  (4, 'Di', 'Sales', 50000),
  (5, 'Ed', 'Sales', 60000),
  (6, 'Flo', 'Support', 42000);`,
      `INSERT INTO employees VALUES
  (1, 'Gus', 'Sales', 50000),
  (2, 'Hal', 'Sales', NULL),
  (3, 'Ivy', 'Sales', 70000),
  (4, 'Jax', 'Legal', 120000),
  (5, 'Kim', 'Legal', 95000),
  (6, 'Lou', 'Legal', 100001);`,
      `INSERT INTO employees VALUES
  (1, 'Mel', 'Ops', 48000),
  (2, 'Ned', 'Design', 77000),
  (3, 'Ora', 'Ops', 48000);`,
    ],
    solution: `SELECT department,
       MIN(salary) AS min_salary,
       MAX(salary) AS max_salary,
       ROUND(AVG(salary), 2) AS avg_salary
FROM employees
GROUP BY department;`,
    hint: 'MIN, MAX and AVG all skip NULLs. Wrap the average in ROUND(…, 2).',
    explanation:
      "Aggregate functions ignore NULL inputs, so `AVG(salary)` averages only the known salaries — exactly what the statement asks. Computing `SUM(salary) / COUNT(*)` instead would divide by people with no salary, and with integer columns it would also truncate the decimals.\n\n`ROUND(x, 2)` gives the two-decimal result the grader expects.",
  },
  {
    id: 'sql-revenue-by-year-and-category',
    number: 11,
    title: 'Revenue by Year and Category',
    difficulty: 'Medium',
    topic: 'Aggregation',
    statement:
      "A `sales` table has `id`, `year`, `category` and `amount`.\n\nReturn `year`, `category` and `revenue` — the total `amount` for that year-and-category combination. One row per combination that actually has sales. Rows can be in any order.",
    schema: `CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO sales VALUES
  (1, 2022, 'Books', 120.50),
  (2, 2022, 'Toys', 80.00),
  (3, 2023, 'Books', 200.00),
  (4, 2023, 'Toys', 45.25),
  (5, 2022, 'Books', 30.00),
  (6, 2023, 'Games', 99.99),
  (7, 2023, 'Toys', 10.00);`,
      `INSERT INTO sales VALUES
  (1, 2021, 'Books', 10.00),
  (2, 2021, 'Books', 20.00),
  (3, 2021, 'Games', 5.00),
  (4, 2021, 'Toys', 7.50);`,
      `INSERT INTO sales VALUES
  (1, 2020, 'Books', 100.00),
  (2, 2021, 'Books', 150.00),
  (3, 2022, 'Books', 125.00),
  (4, 2022, 'Books', 25.00);`,
    ],
    solution: `SELECT year, category, SUM(amount) AS revenue
FROM sales
GROUP BY year, category;`,
    hint: 'You can GROUP BY more than one column — each distinct pair becomes a group.',
    explanation:
      "Listing two columns in GROUP BY makes one group per distinct `(year, category)` pair, and `SUM(amount)` totals each pair. Grouping by only one of them would merge categories across years (or years across categories) and return the wrong number of rows.\n\nEvery non-aggregated column in the SELECT list should appear in the GROUP BY.",
  },
  {
    id: 'sql-directors-avg-rating-since-2015',
    number: 12,
    title: 'Consistent Directors Since 2015',
    difficulty: 'Medium',
    topic: 'Aggregation',
    statement:
      "A `movies` table has `id`, `title`, `director`, `year` and `rating` (REAL, NULL when unrated).\n\nConsidering only **rated** movies released in 2015 or later, return `director` and `avg_rating` (rounded to 2 decimals) for each director with **at least 2** such movies. Rows can be in any order.",
    schema: `CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  director TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating REAL
);`,
    datasets: [
      `INSERT INTO movies VALUES
  (1, 'Dunkirk', 'Nolan', 2017, 8.5),
  (2, 'Tenet', 'Nolan', 2020, 7.4),
  (3, 'Inception', 'Nolan', 2010, 8.8),
  (4, 'Lady Bird', 'Gerwig', 2017, 7.9),
  (5, 'Little Women', 'Gerwig', 2019, 7.8),
  (6, 'Arrival', 'Villeneuve', 2016, 7.9),
  (7, 'Dune', 'Villeneuve', 2021, NULL);`,
      `INSERT INTO movies VALUES
  (1, 'Alpha', 'Reed', 2015, 7.0),
  (2, 'Beta', 'Reed', 2016, 8.0),
  (3, 'Gamma', 'Reed', 2018, 7.0),
  (4, 'Delta', 'Shaw', 2014, 9.0),
  (5, 'Epsilon', 'Shaw', 2014, 9.5),
  (6, 'Zeta', 'Shaw', 2019, 6.0);`,
      `INSERT INTO movies VALUES
  (1, 'One', 'Park', 2022, 6.0),
  (2, 'Two', 'Park', 2023, NULL),
  (3, 'Three', 'Park', 2024, NULL),
  (4, 'Four', 'Ling', 2022, 8.1),
  (5, 'Five', 'Ling', 2023, 8.2);`,
    ],
    solution: `SELECT director, ROUND(AVG(rating), 2) AS avg_rating
FROM movies
WHERE year >= 2015 AND rating IS NOT NULL
GROUP BY director
HAVING COUNT(*) >= 2;`,
    hint: 'Row-level conditions (year, rating) go in WHERE; the "at least 2 movies" condition goes in HAVING.',
    explanation:
      "The two filters live in different places. `year >= 2015 AND rating IS NOT NULL` describes individual rows, so it belongs in WHERE and runs before grouping. \"At least 2 movies\" describes a group, so it must be in HAVING.\n\nIf you skip the rating filter, `COUNT(*)` counts unrated movies too, and a director with one rated and one unrated film sneaks through.",
  },
  {
    id: 'sql-product-revenue-after-discount',
    number: 13,
    title: 'Product Revenue After Discounts',
    difficulty: 'Hard',
    topic: 'Aggregation',
    statement:
      "An `order_items` table has `id`, `product`, `quantity`, `unit_price` and `discount` — a fraction such as `0.25` for 25% off, or NULL when no discount applied.\n\nAn item's revenue is `quantity * unit_price * (1 - discount)`, treating a NULL discount as 0. Return `product` and `revenue` — the product's total revenue rounded to 2 decimals — for every product whose total is **at least 100**. Order the rows by `revenue` descending, then `product` ascending.",
    schema: `CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  discount REAL
);`,
    datasets: [
      `INSERT INTO order_items VALUES
  (1, 'Widget', 3, 20.00, NULL),
  (2, 'Widget', 2, 20.00, 0.5),
  (3, 'Gadget', 5, 30.00, NULL),
  (4, 'Gadget', 1, 30.00, 0.1),
  (5, 'Gizmo', 10, 10.00, NULL),
  (6, 'Doohickey', 4, 25.00, 0.25),
  (7, 'Doohickey', 2, 25.00, NULL);`,
      `INSERT INTO order_items VALUES
  (1, 'Bolt', 20, 5.00, NULL),
  (2, 'Anchor', 4, 50.00, 0.5),
  (3, 'Chain', 1, 99.99, NULL),
  (4, 'Rope', 10, 12.00, 0.2),
  (5, 'Rope', 1, 4.00, NULL);`,
      `INSERT INTO order_items VALUES
  (1, 'Lamp', 2, 40.00, 0.1),
  (2, 'Lamp', 1, 40.00, 0.1),
  (3, 'Rug', 1, 500.00, 0.9),
  (4, 'Vase', 3, 30.00, NULL);`,
    ],
    ordered: true,
    solution: `SELECT product,
       ROUND(SUM(quantity * unit_price * (1 - COALESCE(discount, 0))), 2) AS revenue
FROM order_items
GROUP BY product
HAVING SUM(quantity * unit_price * (1 - COALESCE(discount, 0))) >= 100
ORDER BY revenue DESC, product ASC;`,
    hint: 'Anything multiplied by NULL is NULL, and SUM skips NULLs — so a NULL discount would silently erase that line.',
    explanation:
      "The trap is NULL arithmetic: `1 - NULL` is NULL, so an undiscounted line would contribute nothing to the SUM unless you `COALESCE(discount, 0)` first. The per-product total is an aggregate, so the \"at least 100\" test has to go in HAVING, not WHERE — a WHERE would filter individual lines instead of products.\n\nThe ORDER BY with a `product` tiebreak keeps equal revenues in a defined order.",
  },

  // ===== Joins =====
  {
    id: 'sql-orders-with-customer-name',
    number: 14,
    title: 'Orders With Customer Names',
    difficulty: 'Easy',
    topic: 'Joins',
    statement:
      "You have `customers` (`id`, `name`) and `orders` (`id`, `customer_id`, `amount`). An order's `customer_id` might reference a customer that no longer exists, or be NULL.\n\nReturn `order_id`, `customer_name` and `amount` for every order that has a matching customer. Rows can be in any order.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ava Stone'), (2, 'Ben Reyes'), (3, 'Cleo Diaz'), (4, 'Dov Katz');
INSERT INTO orders VALUES
  (101, 1, 25.00),
  (102, 2, 40.50),
  (103, 2, 12.00),
  (104, 3, 99.99),
  (105, 1, 7.25);`,
      `INSERT INTO customers VALUES
  (1, 'Eli Ford'), (2, 'Fay Wu');
INSERT INTO orders VALUES
  (201, 1, 10.00),
  (202, 9, 20.00),
  (203, NULL, 30.00),
  (204, 2, 40.00);`,
      `INSERT INTO customers VALUES
  (5, 'Gia Roth'), (6, 'Hal Mora'), (7, 'Ivo Nash');
INSERT INTO orders VALUES
  (5, 6, 15.00),
  (6, 5, 16.00),
  (7, 6, 17.00);`,
    ],
    solution: `SELECT o.id AS order_id, c.name AS customer_name, o.amount
FROM orders o
JOIN customers c ON c.id = o.customer_id;`,
    hint: 'An INNER JOIN keeps only rows that match on both sides — which is exactly what "has a matching customer" means.',
    explanation:
      "`JOIN customers c ON c.id = o.customer_id` pairs each order with its customer and drops orders whose `customer_id` is NULL or points nowhere. That's the defining behaviour of an inner join.\n\nA LEFT JOIN would keep the orphan orders with a NULL name, and listing both tables without a join condition produces every order × every customer.",
  },
  {
    id: 'sql-products-with-category-name',
    number: 15,
    title: 'Products With Category (or Uncategorized)',
    difficulty: 'Medium',
    topic: 'Joins',
    statement:
      "You have `products` (`id`, `name`, `category_id`) and `categories` (`id`, `name`). A product's `category_id` may be NULL or may point to a category that doesn't exist.\n\nReturn `product` (the product's name) and `category` (the category's name) for **every** product. When a product has no matching category, show `'Uncategorized'` instead. Rows can be in any order.",
    schema: `CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER
);`,
    datasets: [
      `INSERT INTO categories VALUES (1, 'Tools'), (2, 'Toys'), (3, 'Books');
INSERT INTO products VALUES
  (1, 'Hammer', 1),
  (2, 'Drill', 1),
  (3, 'Yo-yo', 2),
  (4, 'Mystery Box', NULL),
  (5, 'Kite', 2);`,
      `INSERT INTO categories VALUES (1, 'Garden'), (2, 'Kitchen');
INSERT INTO products VALUES
  (1, 'Trowel', 1),
  (2, 'Whisk', 99),
  (3, 'Spatula', NULL),
  (4, 'Rake', 1);`,
      `INSERT INTO categories VALUES (1, 'Audio'), (2, 'Video'), (3, 'Empty');
INSERT INTO products VALUES
  (1, 'Speaker', 1),
  (2, 'Headphones', 1),
  (3, 'Projector', 2);`,
    ],
    solution: `SELECT p.name AS product, COALESCE(c.name, 'Uncategorized') AS category
FROM products p
LEFT JOIN categories c ON c.id = p.category_id;`,
    hint: 'LEFT JOIN keeps every product; COALESCE fills in the NULL the join leaves behind.',
    explanation:
      "A LEFT JOIN keeps every row from the left table (`products`) and fills the right side with NULLs when nothing matches. `COALESCE(c.name, 'Uncategorized')` turns that NULL into the label we want.\n\nAn inner join would drop uncategorized products, and putting `categories` on the left instead would keep empty categories while losing uncategorized products.",
  },
  {
    id: 'sql-customers-without-orders',
    number: 16,
    title: 'Customers Who Never Ordered',
    difficulty: 'Medium',
    topic: 'Joins',
    statement:
      "You have `customers` (`id`, `name`, `email`) and `orders` (`id`, `customer_id`, `order_date`). Some orders were placed as guests, so their `customer_id` is NULL.\n\nReturn the `id` and `name` of every customer who has placed no orders. Rows can be in any order.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ana Lima', 'ana@x.io'),
  (2, 'Ben Oduya', 'ben@x.io'),
  (3, 'Cara Voss', NULL),
  (4, 'Dax Meyer', 'dax@x.io'),
  (5, 'Elle Park', 'elle@x.io');
INSERT INTO orders VALUES
  (101, 1, '2024-01-02'),
  (102, 3, '2024-01-03'),
  (103, 3, '2024-01-09'),
  (104, 4, '2024-02-11');`,
      `INSERT INTO customers VALUES
  (1, 'Finn Ross', 'finn@x.io'),
  (2, 'Gwen Tate', 'gwen@x.io'),
  (3, 'Hiro Sato', 'hiro@x.io');
INSERT INTO orders VALUES
  (201, 1, '2024-03-01'),
  (202, NULL, '2024-03-02'),
  (203, NULL, '2024-03-03');`,
      `INSERT INTO customers VALUES
  (1, 'Ines Bloom', 'ines@x.io'),
  (2, 'Jack Hale', 'jack@x.io');
INSERT INTO orders VALUES
  (301, 1, '2024-04-01'),
  (302, 2, '2024-04-02');`,
      `INSERT INTO customers VALUES
  (1, 'Kim Yoon', 'kim@x.io'),
  (2, 'Lars Berg', NULL),
  (3, 'Mo Adebayo', 'mo@x.io');`,
    ],
    solution: `SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
    hint: 'LEFT JOIN, then keep only the rows where the right side came back empty. Beware NOT IN with NULLs.',
    explanation:
      "This is the anti-join pattern: LEFT JOIN `orders` so every customer survives, then `WHERE o.id IS NULL` keeps only the customers for whom the join found nothing.\n\nThe tempting alternative `id NOT IN (SELECT customer_id FROM orders)` breaks as soon as one `customer_id` is NULL — `x NOT IN (…, NULL)` is never true, so the query returns no rows at all.",
  },
  {
    id: 'sql-earn-more-than-manager',
    number: 17,
    title: 'Employees Earning More Than Their Manager',
    difficulty: 'Medium',
    topic: 'Joins',
    statement:
      "An `employees` table has `id`, `name`, `salary` and `manager_id` — the `id` of the employee's manager, or NULL for the top of the org.\n\nReturn `employee` — the name of each employee whose salary is **strictly greater** than their manager's salary. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary INTEGER NOT NULL,
  manager_id INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Grace Ito', 150000, NULL),
  (2, 'Henry Cole', 120000, 1),
  (3, 'Iris Vance', 160000, 1),
  (4, 'Jack Ruiz', 90000, 2),
  (5, 'Kim Osei', 125000, 2),
  (6, 'Leo Marsh', 95000, 3);`,
      `INSERT INTO employees VALUES
  (1, 'Mira Sol', 100000, NULL),
  (2, 'Nate Fox', 100000, 1),
  (3, 'Ola Bex', 100001, 1),
  (4, 'Pip Lane', 99999, 3);`,
      `INSERT INTO employees VALUES
  (1, 'Quinn Ash', 200000, NULL),
  (2, 'Rae Dunn', 150000, 1),
  (3, 'Sid Ng', 100000, 2),
  (4, 'Tam Ho', 80000, 42);`,
    ],
    solution: `SELECT e.name AS employee
FROM employees e
JOIN employees m ON m.id = e.manager_id
WHERE e.salary > m.salary;`,
    hint: 'Join the table to itself: one alias plays the employee, the other plays the manager.',
    explanation:
      "A self join treats one copy of `employees` as the report (`e`) and another as the manager (`m`), linked by `m.id = e.manager_id`. Once each row holds both salaries, `WHERE e.salary > m.salary` does the comparison.\n\nEmployees with no manager (or a dangling `manager_id`) drop out of the inner join, which is what we want.",
  },
  {
    id: 'sql-enrollment-roster',
    number: 18,
    title: 'Roster for Three-Credit Courses',
    difficulty: 'Medium',
    topic: 'Joins',
    statement:
      "Three tables: `students` (`id`, `name`), `courses` (`id`, `title`, `credits`) and `enrollments` (`id`, `student_id`, `course_id`, `grade` — NULL while the course is in progress).\n\nReturn `student`, `course` and `grade` for every enrollment in a course worth **3 or more** credits. Rows can be in any order.",
    schema: `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL
);
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT
);`,
    datasets: [
      `INSERT INTO students VALUES (1, 'Mia Torres'), (2, 'Noah Berg'), (3, 'Olive Sung');
INSERT INTO courses VALUES
  (1, 'Calculus I', 4),
  (2, 'Art History', 2),
  (3, 'Databases', 3),
  (4, 'Yoga', 1);
INSERT INTO enrollments VALUES
  (1, 1, 1, 'A'),
  (2, 1, 2, 'B'),
  (3, 2, 3, 'A-'),
  (4, 3, 1, 'B+'),
  (5, 3, 4, 'A'),
  (6, 2, 2, 'C');`,
      `INSERT INTO students VALUES (1, 'Pia Nowak'), (2, 'Ravi Menon');
INSERT INTO courses VALUES
  (1, 'Statistics', 3),
  (2, 'Drawing', 2),
  (3, 'Algorithms', 4);
INSERT INTO enrollments VALUES
  (1, 1, 1, NULL),
  (2, 1, 3, 'B'),
  (3, 2, 2, 'A'),
  (4, 2, 1, 'B-');`,
      `INSERT INTO students VALUES (1, 'Sara Kim'), (2, 'Tom Ali'), (3, 'Uma Das');
INSERT INTO courses VALUES
  (1, 'Pottery', 1),
  (2, 'Physics', 5);
INSERT INTO enrollments VALUES
  (1, 1, 1, 'A'),
  (2, 2, 1, 'A'),
  (3, 3, 2, NULL);`,
    ],
    solution: `SELECT s.name AS student, c.title AS course, e.grade
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE c.credits >= 3;`,
    hint: 'Start from the junction table (enrollments) and join outward to both students and courses.',
    explanation:
      "`enrollments` is the link table between students and courses, so it's the natural starting point: join it to `students` on `student_id` and to `courses` on `course_id`. Each join adds the columns you need, and the WHERE on `credits` filters the combined rows.\n\nThe most common mistake is joining on the wrong key — SQL won't complain, it'll just pair up the wrong rows.",
  },
  {
    id: 'sql-order-count-including-zero',
    number: 19,
    title: 'Order Count Per Customer, Including Zero',
    difficulty: 'Medium',
    topic: 'Joins',
    statement:
      "You have `customers` (`id`, `name`) and `orders` (`id`, `customer_id`, `order_date`). Two different customers can share a name.\n\nReturn `name` and `order_count` for **every** customer — customers with no orders should show `0`. Rows can be in any order.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ana Ruiz'), (2, 'Bo Chen'), (3, 'Cy Adler'), (4, 'Di Moss');
INSERT INTO orders VALUES
  (101, 1, '2024-01-01'),
  (102, 1, '2024-01-15'),
  (103, 2, '2024-02-01'),
  (104, 3, '2024-02-02'),
  (105, 3, '2024-02-03'),
  (106, 3, '2024-02-04');`,
      `INSERT INTO customers VALUES
  (1, 'Sam Lee'), (2, 'Sam Lee'), (3, 'Tia Wren');
INSERT INTO orders VALUES
  (201, 1, '2024-03-01'),
  (202, 3, '2024-03-02'),
  (203, 3, '2024-03-03'),
  (204, NULL, '2024-03-04');`,
      `INSERT INTO customers VALUES
  (1, 'Uri Katz'), (2, 'Val Ortiz');`,
    ],
    solution: `SELECT c.name, COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;`,
    hint: 'LEFT JOIN so nobody disappears, then COUNT a column from the orders side — not COUNT(*).',
    explanation:
      "The LEFT JOIN keeps customers with no orders, but those customers still get one row with NULLs on the order side. `COUNT(o.id)` skips that NULL and yields 0, whereas `COUNT(*)` would count the row and report 1.\n\nGroup by the customer's `id`, not just the name — two different customers named Sam Lee would otherwise be merged into one row.",
  },
  {
    id: 'sql-customer-order-stats',
    number: 20,
    title: 'Orders and Total Spend Per Customer',
    difficulty: 'Hard',
    topic: 'Joins',
    statement:
      "Three tables: `customers` (`id`, `name`), `orders` (`id`, `customer_id`) and `order_items` (`id`, `order_id`, `quantity`, `unit_price`). An order may have several items — or none, if it was cancelled before anything was added.\n\nFor **every** customer return `name`, `order_count` — the number of orders they placed — and `total_spent` — the sum of `quantity * unit_price` across all their items, rounded to 2 decimals, or `0` if they have none. Rows can be in any order.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES (1, 'Ana Cruz'), (2, 'Bo Lind'), (3, 'Cy Park');
INSERT INTO orders VALUES (1, 1), (2, 1), (3, 2);
INSERT INTO order_items VALUES
  (1, 1, 2, 10.00),
  (2, 1, 1, 5.50),
  (3, 2, 3, 2.00),
  (4, 3, 1, 99.99);`,
      `INSERT INTO customers VALUES (1, 'Dee Ola'), (2, 'Eli Wren');
INSERT INTO orders VALUES (10, 1), (11, 2), (12, 2);
INSERT INTO order_items VALUES
  (1, 10, 1, 20.00),
  (2, 11, 4, 2.50),
  (3, 11, 1, 1.25);`,
      `INSERT INTO customers VALUES (1, 'Fay Sato'), (2, 'Gus Reid');
INSERT INTO orders VALUES (20, 1), (21, 2), (22, 2), (23, 2);
INSERT INTO order_items VALUES
  (1, 21, 2, 3.00),
  (2, 22, 2, 3.00),
  (3, 23, 1, 3.00);`,
    ],
    solution: `SELECT c.name,
       COUNT(DISTINCT o.id) AS order_count,
       ROUND(COALESCE(SUM(i.quantity * i.unit_price), 0), 2) AS total_spent
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN order_items i ON i.order_id = o.id
GROUP BY c.id, c.name;`,
    hint: 'Joining to items multiplies the order rows. COUNT(DISTINCT o.id) undoes that; COALESCE handles customers with nothing.',
    explanation:
      "Chaining two LEFT JOINs gives one row per item, so an order with three items appears three times — `COUNT(o.id)` would report 3 orders. `COUNT(DISTINCT o.id)` counts each order once no matter how many items it has (and 0 for a customer with no orders).\n\nSUM over no items is NULL, not 0, so `COALESCE(SUM(...), 0)` provides the zero. This \"fan-out\" is one of the most common bugs in reporting queries.",
  },

  // ===== NULL & CASE =====
  {
    id: 'sql-contact-fallback',
    number: 21,
    title: 'Best Available Contact',
    difficulty: 'Easy',
    topic: 'NULL & CASE',
    statement:
      "A `customers` table has `id`, `name`, `email` and `phone`; either contact field may be NULL.\n\nReturn `name` and `contact`, where `contact` is the email if present, otherwise the phone, otherwise the text `'none'`. Rows can be in any order.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ana Bright', 'ana@x.io', '555-0001'),
  (2, 'Ben Clark', 'ben@x.io', NULL),
  (3, 'Cara Dunn', NULL, '555-0003'),
  (4, 'Dev Ember', NULL, NULL),
  (5, 'Eve Frost', 'eve@x.io', '555-0005');`,
      `INSERT INTO customers VALUES
  (1, 'Finn Gale', NULL, NULL),
  (2, 'Gia Holt', NULL, NULL),
  (3, 'Hugo Isa', NULL, '555-0103');`,
      `INSERT INTO customers VALUES
  (1, 'Ivy Jones', 'ivy@x.io', '555-0201'),
  (2, 'Jon Kerr', 'jon@x.io', '555-0202');`,
    ],
    solution: `SELECT name, COALESCE(email, phone, 'none') AS contact
FROM customers;`,
    hint: 'COALESCE takes any number of arguments and returns the first one that is not NULL.',
    explanation:
      "`COALESCE(email, phone, 'none')` walks its arguments left to right and returns the first non-NULL one, which is exactly the fallback chain the statement describes. The order of the arguments is the priority order.\n\nThe literal `'none'` at the end guarantees the result is never NULL.",
  },
  {
    id: 'sql-employees-without-manager',
    number: 22,
    title: 'Employees With No Manager',
    difficulty: 'Easy',
    topic: 'NULL & CASE',
    statement:
      "An `employees` table has `id`, `name` and `manager_id`, which is NULL for anyone who doesn't report to someone.\n\nReturn the `id` and `name` of every employee with no manager. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Grace Hill', NULL),
  (2, 'Hank Ibarra', 1),
  (3, 'Ines Joly', 1),
  (4, 'Jude Kahn', 2),
  (5, 'Kira Lund', 2),
  (6, 'Luis Mora', 3);`,
      `INSERT INTO employees VALUES
  (1, 'Mona Nix', NULL),
  (2, 'Nils Oak', NULL),
  (3, 'Orla Pym', 1),
  (4, 'Pete Quon', 2);`,
      `INSERT INTO employees VALUES
  (1, 'Rhea Sun', NULL),
  (2, 'Seth Tan', NULL),
  (3, 'Tova Ulf', NULL);`,
    ],
    solution: `SELECT id, name
FROM employees
WHERE manager_id IS NULL;`,
    hint: "NULL isn't equal to anything, not even NULL. There's a dedicated operator for this.",
    explanation:
      "NULL means \"unknown\", and comparing anything to unknown with `=` yields unknown — so `WHERE manager_id = NULL` filters out every row. `IS NULL` is the operator that actually tests for a missing value.\n\nThis is the single most common NULL mistake in SQL interviews.",
  },
  {
    id: 'sql-salary-bands',
    number: 23,
    title: 'Headcount by Salary Band',
    difficulty: 'Medium',
    topic: 'NULL & CASE',
    statement:
      "An `employees` table has `id`, `name` and `salary` (NULL if not yet set).\n\nBucket employees into a `band`: `'low'` for salary below 50,000; `'mid'` for 50,000 up to and including 99,999; `'high'` for 100,000 and above; and `'unknown'` when salary is NULL. Return `band` and `headcount` for every band that has at least one employee. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ana', 45000),
  (2, 'Bo', 50000),
  (3, 'Cy', 75000),
  (4, 'Di', 99999),
  (5, 'Ed', 100000),
  (6, 'Flo', NULL),
  (7, 'Gus', 120000);`,
      `INSERT INTO employees VALUES
  (1, 'Hal', 30000),
  (2, 'Ivy', 31000),
  (3, 'Jax', 80000),
  (4, 'Kim', 150000);`,
      `INSERT INTO employees VALUES
  (1, 'Lou', NULL),
  (2, 'Mel', NULL),
  (3, 'Ned', 100000);`,
    ],
    solution: `SELECT CASE
         WHEN salary IS NULL THEN 'unknown'
         WHEN salary < 50000 THEN 'low'
         WHEN salary < 100000 THEN 'mid'
         ELSE 'high'
       END AS band,
       COUNT(*) AS headcount
FROM employees
GROUP BY band;`,
    hint: 'CASE conditions are checked top to bottom; test for NULL first, before any comparison.',
    explanation:
      "A CASE expression evaluates its WHEN branches in order and returns the first match, so `salary < 50000` followed by `salary < 100000` naturally builds the bands. The NULL test must come first: `NULL < 50000` is not true, so without it a NULL salary would fall through every comparison into the ELSE branch and be counted as `'high'`.\n\nGrouping by the CASE result (via its alias) gives one row per band.",
  },
  {
    id: 'sql-ticket-status-counts',
    number: 24,
    title: 'Open and Closed Tickets Per Assignee',
    difficulty: 'Medium',
    topic: 'NULL & CASE',
    statement:
      "A `tickets` table has `id`, `assignee` (NULL for unassigned tickets) and `status`, which is one of `'open'`, `'in_progress'` or `'closed'`.\n\nFor each assignee return `assignee`, `open_count` and `closed_count` — the number of their tickets with status `'open'` and `'closed'` respectively (a count of 0 must appear as `0`, not NULL). Ignore unassigned tickets. Rows can be in any order.",
    schema: `CREATE TABLE tickets (
  id INTEGER PRIMARY KEY,
  assignee TEXT,
  status TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO tickets VALUES
  (1, 'Priya', 'open'),
  (2, 'Priya', 'open'),
  (3, 'Priya', 'closed'),
  (4, 'Quinn', 'closed'),
  (5, 'Quinn', 'in_progress'),
  (6, NULL, 'open'),
  (7, 'Ravi', 'in_progress');`,
      `INSERT INTO tickets VALUES
  (1, 'Sana', 'open'),
  (2, 'Sana', 'open'),
  (3, 'Theo', 'open');`,
      `INSERT INTO tickets VALUES
  (1, 'Uma', 'closed'),
  (2, 'Uma', 'closed'),
  (3, 'Vik', 'in_progress'),
  (4, 'Vik', 'open'),
  (5, 'Vik', 'closed'),
  (6, NULL, 'closed');`,
    ],
    solution: `SELECT assignee,
       SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_count,
       SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_count
FROM tickets
WHERE assignee IS NOT NULL
GROUP BY assignee;`,
    hint: 'A conditional count is SUM of a CASE that yields 1 or 0 — pivoting a column into several counts in one pass.',
    explanation:
      "`SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END)` adds 1 for matching rows and 0 otherwise, which is a count under a condition — and you can have as many of these as you like in one query. The explicit `ELSE 0` matters: with no ELSE the CASE yields NULL, and a group with no matches sums to NULL instead of 0.\n\n`COUNT(CASE ... ELSE 0 END)` is a related trap — COUNT counts non-NULLs, and 0 is not NULL, so it counts everything.",
  },
  {
    id: 'sql-inventory-mismatches',
    number: 25,
    title: 'Inventory Count Mismatches',
    difficulty: 'Hard',
    topic: 'NULL & CASE',
    statement:
      "An `inventory` table has `id`, `product`, `expected_qty` (from the system) and `counted_qty` (from a physical stock count). Either quantity can be NULL when nobody recorded it.\n\nReturn `id` and `product` for every row where the two quantities **differ** — where a NULL on one side and a number on the other counts as a difference, but NULL on both sides counts as a match. Rows can be in any order.",
    schema: `CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  product TEXT NOT NULL,
  expected_qty INTEGER,
  counted_qty INTEGER
);`,
    datasets: [
      `INSERT INTO inventory VALUES
  (1, 'Bolts', 100, 100),
  (2, 'Nuts', 50, 48),
  (3, 'Screws', NULL, 20),
  (4, 'Washers', 30, NULL),
  (5, 'Pins', NULL, NULL),
  (6, 'Nails', 10, 10);`,
      `INSERT INTO inventory VALUES
  (1, 'Cable', 5, 5),
  (2, 'Plug', NULL, NULL),
  (3, 'Fuse', 0, 0);`,
      `INSERT INTO inventory VALUES
  (1, 'Tape', 12, 11),
  (2, 'Glue', NULL, 3),
  (3, 'Clip', 7, NULL),
  (4, 'Band', 0, NULL);`,
    ],
    solution: `SELECT id, product
FROM inventory
WHERE counted_qty IS NOT expected_qty;`,
    hint: "`<>` says 'unknown' whenever a NULL is involved. Look for the NULL-safe comparison operator.",
    explanation:
      "Ordinary `<>` returns NULL (treated as false) when either side is NULL, so it silently drops every row with a missing quantity. `IS NOT` is SQLite's NULL-safe inequality: it treats NULL as a value, so `20 IS NOT NULL` is true and `NULL IS NOT NULL` is false — exactly the semantics the statement asks for.\n\nOther dialects spell this `IS DISTINCT FROM` (Postgres) or `<=>` negated (MySQL); the idea is the same.",
  },
  // ===== Subqueries & CTEs =====
  {
    id: 'sql-above-company-average',
    number: 26,
    title: 'Paid Above the Company Average',
    difficulty: 'Easy',
    topic: 'Subqueries & CTEs',
    statement:
      "The `employees` table has `id`, `name`, `department` and `salary` (which can be NULL for contractors whose pay isn't recorded).\n\nReturn the `name` and `salary` of every employee who earns strictly more than the average salary across the whole company. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 120000),
  (2, 'Ben', 'Engineering', 95000),
  (3, 'Cleo', 'Sales', 70000),
  (4, 'Dev', 'Sales', 82000),
  (5, 'Eli', 'Support', 55000),
  (6, 'Fay', 'Support', 61000);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 90000),
  (2, 'Ben', 'Engineering', 90000),
  (3, 'Cleo', 'Sales', 90000),
  (4, 'Dev', 'Sales', 90000);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 100000),
  (2, 'Ben', 'Engineering', 80000),
  (3, 'Cleo', 'Sales', NULL),
  (4, 'Dev', 'Sales', 90000),
  (5, 'Eli', 'Support', 60000),
  (6, 'Fay', NULL, 82500);`,
    ],
    solution: `SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);`,
    hint: 'A subquery in parentheses that returns a single value can be used anywhere a number can — including on the right side of a comparison in WHERE.',
    explanation:
      "`(SELECT AVG(salary) FROM employees)` is a scalar subquery: it runs once, yields one number, and the outer WHERE compares each row against it. You can't write `WHERE salary > AVG(salary)` directly — aggregates aren't allowed in WHERE because WHERE filters rows before any grouping happens. AVG ignores NULL salaries, and a NULL salary never satisfies `>`, so contractors drop out naturally.",
  },
  {
    id: 'sql-above-department-average',
    number: 27,
    title: 'Paid Above Their Department Average',
    difficulty: 'Medium',
    topic: 'Subqueries & CTEs',
    statement:
      "The `employees` table has `id`, `name`, `department` and `salary` (NULL when unknown).\n\nReturn `name`, `department` and `salary` for every employee whose salary is strictly greater than the average salary of *their own department*. Rows can be in any order.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 120000),
  (2, 'Ben', 'Engineering', 95000),
  (3, 'Cal', 'Engineering', 100000),
  (4, 'Dev', 'Sales', 82000),
  (5, 'Eli', 'Sales', 70000),
  (6, 'Fay', 'Support', 61000),
  (7, 'Gus', 'Support', 55000);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 90000),
  (2, 'Ben', 'Engineering', 90000),
  (3, 'Cal', 'Sales', 200000),
  (4, 'Dev', 'Support', 40000),
  (5, 'Eli', 'Support', 50000);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 100000),
  (2, 'Ben', 'Engineering', NULL),
  (3, 'Cal', 'Engineering', 80000),
  (4, 'Dev', 'Sales', 30000),
  (5, 'Eli', 'Sales', 30000),
  (6, 'Fay', 'Sales', 30001);`,
    ],
    solution: `SELECT e.name, e.department, e.salary
FROM employees e
WHERE e.salary > (
  SELECT AVG(salary) FROM employees d WHERE d.department = e.department
);`,
    hint: 'The inner query needs to see which row the outer query is currently on — reference the outer alias inside the subquery.',
    explanation:
      "This is a correlated subquery: the inner SELECT mentions `e.department`, so it is re-evaluated for each outer row and averages only that row's department. An uncorrelated `(SELECT AVG(salary) FROM employees)` compares everyone to the company-wide average, which is a different question — a well-paid person in a highly paid team could be below their own team's average. A department with a single employee never has anyone above its average.",
  },
  {
    id: 'sql-products-never-ordered',
    number: 28,
    title: 'Products That Have Never Sold',
    difficulty: 'Easy',
    topic: 'Subqueries & CTEs',
    statement:
      "`products` has `id`, `name` and `price`. `order_items` has `id`, `product_id` and `quantity`. A line item's `product_id` can be NULL when it refers to a custom, one-off item.\n\nReturn the `id` and `name` of every product that appears in no order item at all. Rows can be in any order.",
    schema: `CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  quantity INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO products VALUES
  (1, 'Desk Lamp', 39.99),
  (2, 'Notebook', 4.50),
  (3, 'Monitor Arm', 89.00),
  (4, 'USB Hub', 24.00),
  (5, 'Standing Mat', 59.00);
INSERT INTO order_items VALUES
  (1, 1, 2),
  (2, 2, 10),
  (3, 1, 1),
  (4, 4, 3);`,
      `INSERT INTO products VALUES
  (1, 'Desk Lamp', 39.99),
  (2, 'Notebook', 4.50),
  (3, 'Monitor Arm', 89.00),
  (4, 'USB Hub', 24.00);
INSERT INTO order_items VALUES
  (1, 1, 2),
  (2, NULL, 1),
  (3, 4, 3);`,
      `INSERT INTO products VALUES
  (1, 'Desk Lamp', 39.99),
  (2, 'Notebook', 4.50),
  (3, 'Monitor Arm', 89.00);
INSERT INTO order_items VALUES
  (1, 1, 1),
  (2, 2, 1),
  (3, 3, 1);`,
    ],
    solution: `SELECT p.id, p.name
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);`,
    hint: "`NOT IN` behaves badly when the subquery returns a NULL — think about what `1 NOT IN (2, NULL)` evaluates to.",
    explanation:
      "`NOT EXISTS` asks 'is there any matching line item?' per product and is immune to NULLs. `NOT IN (SELECT product_id ...)` is the classic trap: if the list contains a NULL, `x NOT IN (…, NULL)` is never true (it's NULL, not false), so the query silently returns zero rows. A `LEFT JOIN … WHERE oi.id IS NULL` is another correct pattern.",
  },
  {
    id: 'sql-stores-in-gold-cities',
    number: 29,
    title: 'Stores in Cities With a Gold Customer',
    difficulty: 'Easy',
    topic: 'Subqueries & CTEs',
    statement:
      "`stores` has `id`, `name` and `city`. `customers` has `id`, `name`, `city` and `tier` ('Gold', 'Silver' or 'Bronze').\n\nReturn the `name` of every store located in a city where at least one Gold-tier customer lives. Each store should appear exactly once. Rows can be in any order.",
    schema: `CREATE TABLE stores (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  tier TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO stores VALUES
  (1, 'Downtown', 'Austin'),
  (2, 'Riverside', 'Austin'),
  (3, 'Harbor', 'Seattle'),
  (4, 'Old Town', 'Denver');
INSERT INTO customers VALUES
  (1, 'Ana', 'Austin', 'Gold'),
  (2, 'Bo', 'Austin', 'Gold'),
  (3, 'Cy', 'Seattle', 'Silver'),
  (4, 'Di', 'Denver', 'Bronze'),
  (5, 'Ed', 'Denver', 'Gold');`,
      `INSERT INTO stores VALUES
  (1, 'Downtown', 'Austin'),
  (2, 'Harbor', 'Seattle'),
  (3, 'Old Town', 'Denver');
INSERT INTO customers VALUES
  (1, 'Ana', 'Austin', 'Silver'),
  (2, 'Bo', 'Boston', 'Gold'),
  (3, 'Cy', 'Seattle', 'Gold'),
  (4, 'Di', 'Seattle', 'Gold'),
  (5, 'Ed', 'Seattle', 'Gold');`,
      `INSERT INTO stores VALUES
  (1, 'Downtown', 'Austin'),
  (2, 'Harbor', 'Seattle');
INSERT INTO customers VALUES
  (1, 'Ana', 'Austin', 'Silver'),
  (2, 'Bo', 'Seattle', 'Bronze');`,
    ],
    solution: `SELECT name
FROM stores
WHERE city IN (SELECT city FROM customers WHERE tier = 'Gold');`,
    hint: 'Build the set of qualifying cities first, then check membership with IN.',
    explanation:
      "The subquery produces the set of cities that have a Gold customer; `IN` keeps stores whose city is in that set, and each store is naturally listed once. Joining `stores` to `customers` on city instead duplicates a store once per Gold customer in its city unless you add DISTINCT — set membership is the cleaner tool when you only need a yes/no from the other table.",
  },
  {
    id: 'sql-customer-spend-tiers',
    number: 30,
    title: 'Customer Spend Tiers',
    difficulty: 'Medium',
    topic: 'Subqueries & CTEs',
    statement:
      "`customers` has `id` and `name`. `orders` has `id`, `customer_id` and `amount`.\n\nAssign each customer a tier from their lifetime spend (sum of their order amounts; a customer with no orders has spend 0): `'Gold'` for 500 or more, `'Silver'` for 100 or more, otherwise `'Bronze'`. Then count the customers in each tier.\n\nReturn `tier` and `customer_count`, only for tiers that have at least one customer, ordered by `tier` alphabetically.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ana'), (2, 'Bo'), (3, 'Cy'), (4, 'Di'), (5, 'Ed');
INSERT INTO orders VALUES
  (1, 1, 300.00),
  (2, 1, 250.00),
  (3, 2, 80.00),
  (4, 2, 40.00),
  (5, 3, 20.00),
  (6, 4, 600.00);`,
      `INSERT INTO customers VALUES
  (1, 'Ana'), (2, 'Bo'), (3, 'Cy'), (4, 'Di');
INSERT INTO orders VALUES
  (1, 1, 500.00),
  (2, 2, 99.99),
  (3, 3, 100.00);`,
      `INSERT INTO customers VALUES
  (1, 'Ana'), (2, 'Bo'), (3, 'Cy');
INSERT INTO orders VALUES
  (1, 1, 10.00),
  (2, 1, 15.00);`,
    ],
    ordered: true,
    solution: `WITH spend AS (
  SELECT c.id, COALESCE(SUM(o.amount), 0) AS total
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
),
tiered AS (
  SELECT id,
         CASE WHEN total >= 500 THEN 'Gold'
              WHEN total >= 100 THEN 'Silver'
              ELSE 'Bronze' END AS tier
  FROM spend
)
SELECT tier, COUNT(*) AS customer_count
FROM tiered
GROUP BY tier
ORDER BY tier;`,
    hint: 'Break it into steps with CTEs: spend per customer, then tier per customer, then count per tier. Customers with no orders still need a row in step one.',
    explanation:
      "Chained CTEs let each step read like a sentence: `spend` aggregates orders per customer (a LEFT JOIN plus COALESCE keeps zero-order customers at 0), `tiered` maps totals to labels with CASE, and the final SELECT counts per label. Using an INNER JOIN in the first step silently drops customers with no orders, so the Bronze count comes out too low. Watch the boundaries: exactly 500 is Gold and exactly 100 is Silver.",
  },
  {
    id: 'sql-third-highest-salary',
    number: 31,
    title: 'Third Highest Distinct Salary',
    difficulty: 'Medium',
    topic: 'Subqueries & CTEs',
    statement:
      "The `employees` table has `id`, `name` and `salary` (NULL when unknown).\n\nReturn the third highest *distinct* salary as a single column `third_highest`. If there are fewer than three distinct salaries, return one row containing NULL. Always return exactly one row (a single row, so it's in any order).",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ava', 120000),
  (2, 'Ben', 95000),
  (3, 'Cal', 110000),
  (4, 'Dev', 82000),
  (5, 'Eli', 70000);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 100000),
  (2, 'Ben', 100000),
  (3, 'Cal', 90000),
  (4, 'Dev', 90000),
  (5, 'Eli', 80000),
  (6, 'Fay', NULL);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 100000),
  (2, 'Ben', 100000),
  (3, 'Cal', 90000);`,
    ],
    solution: `SELECT (
  SELECT DISTINCT salary
  FROM employees
  WHERE salary IS NOT NULL
  ORDER BY salary DESC
  LIMIT 1 OFFSET 2
) AS third_highest;`,
    hint: 'Sort distinct salaries descending and skip two. Wrapping that in an outer SELECT turns "no rows" into a single NULL.',
    explanation:
      "`ORDER BY salary DESC LIMIT 1 OFFSET 2` picks the third row of the sorted distinct salaries — OFFSET is zero-based, so `OFFSET 3` would return the fourth. Without DISTINCT, two people on the top salary would make the 'third highest' equal to the highest. Wrapping the query as a scalar subquery is what makes it NULL-safe: a subquery that returns no rows evaluates to NULL, so you still get exactly one row instead of an empty result.",
  },
  {
    id: 'sql-org-chart-levels',
    number: 32,
    title: 'Org Chart Levels',
    difficulty: 'Hard',
    topic: 'Subqueries & CTEs',
    statement:
      "The `employees` table has `id`, `name` and `manager_id` (NULL for anyone at the top with no manager). The hierarchy can be arbitrarily deep.\n\nReturn `id`, `name` and `level`, where a top-level employee is level 1, their direct reports are level 2, and so on. Rows ordered by `level` ascending, then `id` ascending.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ava', NULL),
  (2, 'Ben', 1),
  (3, 'Cal', 1),
  (4, 'Dev', 2),
  (5, 'Eli', 2),
  (6, 'Fay', 3),
  (7, 'Gus', 4);`,
      `INSERT INTO employees VALUES
  (10, 'Ava', NULL),
  (11, 'Ben', 10),
  (12, 'Cal', 11),
  (13, 'Dev', 12),
  (14, 'Eli', 13),
  (15, 'Fay', 14);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', NULL),
  (2, 'Ben', NULL),
  (3, 'Cal', 1),
  (4, 'Dev', 2),
  (5, 'Eli', 2);`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE chain AS (
  SELECT id, name, 1 AS level
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, c.level + 1
  FROM employees e
  JOIN chain c ON e.manager_id = c.id
)
SELECT id, name, level
FROM chain
ORDER BY level, id;`,
    hint: 'A recursive CTE has an anchor (the people with no manager) and a recursive part that joins employees to the rows found so far, adding one to the level each time.',
    explanation:
      "The anchor seeds the CTE with level-1 employees; the recursive member then repeatedly joins `employees` to the rows produced in the previous step, incrementing `level`, until no new rows appear. A fixed self-join can only reach a fixed number of levels — a two-table join labels everyone as either level 1 or 2 and is wrong as soon as the chart is three deep. Remember the anchor starts at 1, not 0.",
  },

  // ===== Window Functions =====
  {
    id: 'sql-leaderboard-dense-rank',
    number: 33,
    title: 'Leaderboard With Shared Ranks',
    difficulty: 'Easy',
    topic: 'Window Functions',
    statement:
      "The `players` table has `id`, `name` (unique) and `score`.\n\nReturn `name`, `score` and `rank`, where the highest score is rank 1. Players with the same score share the same rank, and the next distinct score gets the next consecutive rank (no gaps — scores 90, 90, 80 are ranks 1, 1, 2). Rows ordered by `rank` ascending, then `name` ascending.",
    schema: `CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO players VALUES
  (1, 'Ana', 90),
  (2, 'Bo', 85),
  (3, 'Cy', 90),
  (4, 'Di', 70),
  (5, 'Ed', 85),
  (6, 'Flo', 60);`,
      `INSERT INTO players VALUES
  (1, 'Ana', 50),
  (2, 'Bo', 50),
  (3, 'Cy', 50);`,
      `INSERT INTO players VALUES
  (1, 'Ana', 10),
  (2, 'Bo', 40),
  (3, 'Cy', 30),
  (4, 'Di', 40),
  (5, 'Ed', 40),
  (6, 'Flo', 20),
  (7, 'Gil', 30);`,
    ],
    ordered: true,
    solution: `SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) AS rank
FROM players
ORDER BY rank, name;`,
    hint: 'There are three ranking functions. Which one gives ties the same number *and* never skips a number?',
    explanation:
      "`ROW_NUMBER` numbers rows 1, 2, 3 regardless of ties; `RANK` gives ties the same number but then skips (90, 90, 80 becomes 1, 1, 3); `DENSE_RANK` gives ties the same number with no gaps (1, 1, 2), which is what the statement asks for. The ORDER BY inside `OVER (…)` decides the ranking direction — `score DESC` so the top score is rank 1.",
  },
  {
    id: 'sql-top-two-per-category',
    number: 34,
    title: 'Top Two Products per Category',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "The `products` table has `id`, `name` (unique), `category` and `revenue`.\n\nFor each category return its two highest-revenue products — or just one if the category only has one product. When two products in a category have equal revenue, the one with the lower `id` wins the spot.\n\nReturn `category`, `name` and `revenue`, ordered by `category` ascending, then `revenue` descending, then `name` ascending.",
    schema: `CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  revenue REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO products VALUES
  (1, 'Trail Runner', 'Shoes', 5400),
  (2, 'Court Classic', 'Shoes', 6100),
  (3, 'City Walker', 'Shoes', 3200),
  (4, 'Rain Shell', 'Jackets', 4800),
  (5, 'Down Puffer', 'Jackets', 7300),
  (6, 'Wind Breaker', 'Jackets', 2900),
  (7, 'Wool Beanie', 'Hats', 900);`,
      `INSERT INTO products VALUES
  (1, 'Trail Runner', 'Shoes', 5000),
  (2, 'Court Classic', 'Shoes', 5000),
  (3, 'City Walker', 'Shoes', 5000),
  (4, 'Rain Shell', 'Jackets', 4800),
  (5, 'Down Puffer', 'Jackets', 4800);`,
      `INSERT INTO products VALUES
  (1, 'Trail Runner', 'Shoes', 1000),
  (2, 'Court Classic', 'Shoes', 2000),
  (3, 'City Walker', 'Shoes', 3000),
  (4, 'Rain Shell', 'Jackets', 2000),
  (5, 'Down Puffer', 'Jackets', 2000),
  (6, 'Wind Breaker', 'Jackets', 2000),
  (7, 'Wool Beanie', 'Hats', 900),
  (8, 'Sun Cap', 'Hats', 950);`,
    ],
    ordered: true,
    solution: `WITH ranked AS (
  SELECT category, name, revenue, id,
         ROW_NUMBER() OVER (
           PARTITION BY category ORDER BY revenue DESC, id
         ) AS rn
  FROM products
)
SELECT category, name, revenue
FROM ranked
WHERE rn <= 2
ORDER BY category, revenue DESC, name;`,
    hint: 'Number the products within each category, then keep numbers 1 and 2. Which numbering function guarantees exactly two per group?',
    explanation:
      "`ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC, id)` restarts the count in every category and, thanks to the `id` tiebreak, produces a strict 1, 2, 3 even when revenues tie — so `rn <= 2` is exactly two rows (or one). `RANK` would hand three tied products the same rank 1 and let all three through. Dropping `PARTITION BY` ranks across the whole table and returns only the global top two.",
  },
  {
    id: 'sql-running-account-balance',
    number: 35,
    title: 'Running Account Balance',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "The `transactions` table has `id`, `account_id`, `txn_date` and `amount` (positive for deposits, negative for withdrawals). An account can have several transactions on the same day; process them in `id` order.\n\nReturn `account_id`, `txn_date`, `amount` and `balance` — the running sum of that account's amounts up to and including this transaction. Rows ordered by `account_id` ascending, then `txn_date` ascending, then `id` ascending.",
    schema: `CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  txn_date TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO transactions VALUES
  (1, 101, '2024-03-01', 500.00),
  (2, 101, '2024-03-03', -120.00),
  (3, 102, '2024-03-02', 1000.00),
  (4, 101, '2024-03-05', 75.00),
  (5, 102, '2024-03-04', -300.00),
  (6, 102, '2024-03-04', 50.00);`,
      `INSERT INTO transactions VALUES
  (1, 7, '2024-01-31', 200.00),
  (2, 7, '2024-02-01', -50.00),
  (3, 7, '2024-02-01', -25.00),
  (4, 7, '2024-02-01', 10.00);`,
      `INSERT INTO transactions VALUES
  (1, 1, '2024-05-10', 40.00),
  (2, 2, '2024-05-10', 40.00),
  (3, 3, '2024-05-09', -40.00),
  (4, 1, '2024-05-09', 15.50);`,
    ],
    ordered: true,
    solution: `SELECT account_id, txn_date, amount,
       SUM(amount) OVER (
         PARTITION BY account_id
         ORDER BY txn_date, id
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS balance
FROM transactions
ORDER BY account_id, txn_date, id;`,
    hint: 'A SUM with an ORDER BY inside OVER becomes a running total. Make sure the ordering is unique and the total restarts per account.',
    explanation:
      "`SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_date, id ROWS …)` accumulates each account separately in transaction order. Two things bite here: without `PARTITION BY` the balance carries across accounts, and ordering by `txn_date` alone uses the default RANGE frame, which treats same-day rows as peers and gives them all the day's final total instead of a step-by-step balance. Adding `id` to the ORDER BY (or an explicit ROWS frame) fixes that.",
  },
  {
    id: 'sql-three-day-moving-average',
    number: 36,
    title: 'Three-Day Moving Average',
    difficulty: 'Hard',
    topic: 'Window Functions',
    statement:
      "The `daily_sales` table has one row per recorded day: `sale_date` and `amount`. Some calendar days may be missing — treat the *previous two recorded rows* as the window, not the previous two calendar days.\n\nReturn `sale_date` and `moving_avg`: the average of this row's amount and the two rows before it (rounded to 2 decimals). The first row averages just itself, the second averages two rows. Rows ordered by `sale_date` ascending.",
    schema: `CREATE TABLE daily_sales (
  sale_date TEXT PRIMARY KEY,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO daily_sales VALUES
  ('2024-06-01', 100),
  ('2024-06-02', 200),
  ('2024-06-03', 300),
  ('2024-06-04', 400),
  ('2024-06-05', 500),
  ('2024-06-06', 100),
  ('2024-06-07', 700);`,
      `INSERT INTO daily_sales VALUES
  ('2024-06-01', 10),
  ('2024-06-02', 20),
  ('2024-06-05', 25),
  ('2024-06-06', 40),
  ('2024-06-09', 100);`,
      `INSERT INTO daily_sales VALUES
  ('2024-12-31', 42.5);`,
    ],
    ordered: true,
    solution: `SELECT sale_date,
       ROUND(AVG(amount) OVER (
         ORDER BY sale_date
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ), 2) AS moving_avg
FROM daily_sales
ORDER BY sale_date;`,
    hint: "Window frames: `ROWS BETWEEN n PRECEDING AND CURRENT ROW`. Count carefully — how many rows does a three-row window need to look back?",
    explanation:
      "`AVG(amount) OVER (ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` averages the current row plus two before it — three rows, so `2 PRECEDING`, not 3. Leaving the frame out entirely gives the default running average from the first row. At the start of the table the frame simply contains fewer rows, which is exactly the behaviour the statement asks for. Round in the query so 10 / 3 style averages compare cleanly.",
  },
  {
    id: 'sql-day-over-day-price-change',
    number: 37,
    title: 'Day-over-Day Price Change',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "The `stock_prices` table has `ticker`, `price_date` and `close`, one row per ticker per trading day.\n\nReturn `ticker`, `price_date`, `close` and `change` — the difference between this close and the *same ticker's* previous recorded close, rounded to 2 decimals. The first row for each ticker has a NULL `change`. Rows ordered by `ticker` ascending, then `price_date` ascending.",
    schema: `CREATE TABLE stock_prices (
  ticker TEXT NOT NULL,
  price_date TEXT NOT NULL,
  close REAL NOT NULL,
  PRIMARY KEY (ticker, price_date)
);`,
    datasets: [
      `INSERT INTO stock_prices VALUES
  ('ACME', '2024-04-01', 100.00),
  ('ACME', '2024-04-02', 102.50),
  ('ACME', '2024-04-03', 101.25),
  ('ZED', '2024-04-01', 50.00),
  ('ZED', '2024-04-02', 49.10),
  ('ZED', '2024-04-03', 52.00);`,
      `INSERT INTO stock_prices VALUES
  ('ACME', '2024-04-01', 10.00),
  ('ACME', '2024-04-04', 10.00),
  ('ACME', '2024-04-05', 9.99),
  ('SOLO', '2024-04-02', 300.00);`,
      `INSERT INTO stock_prices VALUES
  ('BBB', '2024-01-02', 1.10),
  ('BBB', '2024-01-03', 1.35),
  ('AAA', '2024-01-02', 5.00),
  ('AAA', '2024-01-03', 4.60),
  ('AAA', '2024-01-04', 4.60);`,
    ],
    ordered: true,
    solution: `SELECT ticker, price_date, close,
       ROUND(close - LAG(close) OVER (
         PARTITION BY ticker ORDER BY price_date
       ), 2) AS change
FROM stock_prices
ORDER BY ticker, price_date;`,
    hint: 'LAG reaches back to the previous row in the window — define which rows count as "previous" with PARTITION BY and ORDER BY.',
    explanation:
      "`LAG(close) OVER (PARTITION BY ticker ORDER BY price_date)` returns the prior close for the same ticker, or NULL when there isn't one, so `close - LAG(...)` is the change and the first row per ticker is naturally NULL. Without `PARTITION BY ticker`, the first day of ZED would be compared with the last day of ACME. `LEAD` looks forward instead, which shifts every change by a day and puts the NULL at the end.",
  },
  {
    id: 'sql-department-payroll-share',
    number: 38,
    title: 'Department Share of Payroll',
    difficulty: 'Medium',
    topic: 'Window Functions',
    statement:
      "The `employees` table has `id`, `name`, `department` and `salary` (NULL when unknown; ignore NULL salaries in every sum).\n\nReturn one row per department with `department`, `total_salary` and `pct` — the department's total as a percentage of the company-wide total, rounded to 2 decimals (e.g. 37.5). Rows ordered by `pct` descending, then `department` ascending.",
    schema: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary INTEGER
);`,
    datasets: [
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 120000),
  (2, 'Ben', 'Engineering', 80000),
  (3, 'Cal', 'Sales', 60000),
  (4, 'Dev', 'Sales', 40000),
  (5, 'Eli', 'Support', 50000),
  (6, 'Fay', 'Support', 50000);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Engineering', 100000),
  (2, 'Ben', 'Sales', 100000),
  (3, 'Cal', 'Support', 100000),
  (4, 'Dev', 'Support', NULL);`,
      `INSERT INTO employees VALUES
  (1, 'Ava', 'Ops', 33333),
  (2, 'Ben', 'Ops', 33333),
  (3, 'Cal', 'Research', 33334);`,
    ],
    ordered: true,
    solution: `WITH dept AS (
  SELECT department, SUM(salary) AS total_salary
  FROM employees
  GROUP BY department
)
SELECT department, total_salary,
       ROUND(100.0 * total_salary / SUM(total_salary) OVER (), 2) AS pct
FROM dept
ORDER BY pct DESC, department;`,
    hint: 'Aggregate per department first, then use an empty `OVER ()` to see the grand total on every row.',
    explanation:
      "After grouping to one row per department, `SUM(total_salary) OVER ()` — an empty window — is the grand total repeated on every row, so dividing gives each department's share. Multiply by `100.0`, not `100`: both totals are integers, and integer division would truncate every share to 0 or 1 before rounding. Partitioning that window by department would compare each department to itself and print 100 for everyone.",
  },
  {
    id: 'sql-first-last-order-amounts',
    number: 39,
    title: 'First and Last Order Amount per Customer',
    difficulty: 'Hard',
    topic: 'Window Functions',
    statement:
      "The `orders` table has `id`, `customer_id`, `order_date` and `amount`. If a customer places two orders on the same day, the lower `id` counts as earlier.\n\nReturn one row per customer with `customer_id`, `first_amount` (the amount of their earliest order) and `last_amount` (the amount of their latest order). A customer with a single order has the same value in both columns. Rows ordered by `customer_id` ascending.",
    schema: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO orders VALUES
  (1, 1, '2024-01-05', 25.00),
  (2, 2, '2024-01-06', 80.00),
  (3, 1, '2024-02-10', 40.00),
  (4, 1, '2024-03-15', 12.50),
  (5, 2, '2024-03-01', 95.00),
  (6, 3, '2024-03-20', 300.00);`,
      `INSERT INTO orders VALUES
  (1, 5, '2024-01-05', 10.00),
  (2, 5, '2024-01-05', 20.00),
  (3, 5, '2024-01-05', 30.00),
  (4, 6, '2024-01-01', 99.00);`,
      `INSERT INTO orders VALUES
  (1, 1, '2024-06-01', 50.00),
  (2, 1, '2024-05-01', 70.00),
  (3, 2, '2024-06-01', 5.00),
  (4, 2, '2024-06-02', 5.00),
  (5, 2, '2024-06-03', 9.00);`,
    ],
    ordered: true,
    solution: `SELECT DISTINCT customer_id,
       FIRST_VALUE(amount) OVER w AS first_amount,
       LAST_VALUE(amount) OVER w AS last_amount
FROM orders
WINDOW w AS (
  PARTITION BY customer_id
  ORDER BY order_date, id
  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
)
ORDER BY customer_id;`,
    hint: "`LAST_VALUE` looks at the window *frame*, and the default frame ends at the current row. Widen it.",
    explanation:
      "`FIRST_VALUE` and `LAST_VALUE` read the edges of the window frame. With an ORDER BY the default frame runs from the partition start to the current row, so `LAST_VALUE` just returns the current row's amount — you must set `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` to see the true last order. Because the values are then identical on every row of a partition, `DISTINCT` collapses each customer to one row. `MIN`/`MAX` of amount are a different thing entirely: the earliest order is not the cheapest.",
  },
  {
    id: 'sql-longest-login-streak',
    number: 40,
    title: 'Longest Daily Login Streak',
    difficulty: 'Hard',
    topic: 'Window Functions',
    statement:
      "The `logins` table has `user_id` and `login_date`. A user can log in several times in one day, producing duplicate rows.\n\nFor every user, find the length of their longest run of *consecutive calendar days* with at least one login. Return `user_id` and `longest_streak`, ordered by `user_id` ascending.",
    schema: `CREATE TABLE logins (
  user_id INTEGER NOT NULL,
  login_date TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO logins VALUES
  (1, '2024-03-01'),
  (1, '2024-03-02'),
  (1, '2024-03-03'),
  (1, '2024-03-07'),
  (1, '2024-03-08'),
  (2, '2024-03-01'),
  (2, '2024-03-05'),
  (2, '2024-03-06');`,
      `INSERT INTO logins VALUES
  (7, '2024-02-27'),
  (7, '2024-02-28'),
  (7, '2024-02-28'),
  (7, '2024-02-29'),
  (7, '2024-03-01'),
  (7, '2024-03-01'),
  (8, '2024-05-20');`,
      `INSERT INTO logins VALUES
  (3, '2024-01-01'),
  (3, '2024-01-01'),
  (3, '2024-01-01'),
  (3, '2024-01-03'),
  (4, '2024-01-01'),
  (4, '2024-01-02'),
  (4, '2024-01-04'),
  (4, '2024-01-05'),
  (4, '2024-01-06');`,
    ],
    ordered: true,
    solution: `WITH days AS (
  SELECT DISTINCT user_id, login_date FROM logins
),
grouped AS (
  SELECT user_id, login_date,
         date(login_date, '-' || ROW_NUMBER() OVER (
           PARTITION BY user_id ORDER BY login_date
         ) || ' days') AS anchor
  FROM days
),
streaks AS (
  SELECT user_id, anchor, COUNT(*) AS streak_len
  FROM grouped
  GROUP BY user_id, anchor
)
SELECT user_id, MAX(streak_len) AS longest_streak
FROM streaks
GROUP BY user_id
ORDER BY user_id;`,
    hint: 'Classic trick: subtract each row\'s row number (in date order) from its date. Consecutive days all land on the same "anchor" date. Dedupe days first.',
    explanation:
      "For a run of consecutive dates, `date - row_number` is constant (day 1 minus 1, day 2 minus 2, …), so grouping by that anchor collects each streak; COUNT gives its length and MAX picks the longest per user. Duplicated days must be removed first — a second row for the same date bumps the row number without moving the date, splitting a real streak in two. And use `date(login_date, '-N days')` — subtracting a number from a text date coerces the string to `2024` and gives nonsense.",
  },

  // ===== Strings & Dates =====
  {
    id: 'sql-formatted-customer-names',
    number: 41,
    title: 'Formatted Names and Initials',
    difficulty: 'Medium',
    topic: 'Strings & Dates',
    statement:
      "The `customers` table has `id`, `first_name`, `last_name` (NULL when not provided) and `email`. Names are stored in whatever case the customer typed.\n\nReturn `id`, `full_name`, `initials` and `name_length`, ordered by `id` ascending:\n- `full_name` is `first_name`, a single space, then `last_name` — or just `first_name` if the last name is NULL (keep the stored casing).\n- `initials` is the first letter of each name part, upper-cased and joined with no separator (e.g. `AR`, or `A` if there's no last name).\n- `name_length` is the number of characters in `full_name`.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ana', 'Ruiz', 'ana@example.com'),
  (2, 'ben', 'okafor', 'ben@example.com'),
  (3, 'Cleo', NULL, 'cleo@example.com'),
  (4, 'Dmitri', 'Volkov', 'dv@example.com'),
  (5, 'Eve', 'de la Cruz', 'eve@example.com');`,
      `INSERT INTO customers VALUES
  (1, 'sam', NULL, 'sam@example.com'),
  (2, 'Sam', 'Lee', 'sam.lee@example.com'),
  (3, 'MAYA', 'ng', 'maya@example.com');`,
      `INSERT INTO customers VALUES
  (10, 'Olu', 'Adeyemi', 'olu@example.com'),
  (11, 'Priya', 'Natarajan', 'priya@example.com'),
  (12, 'quinn', NULL, 'q@example.com'),
  (13, 'Ro', 'Xu', 'ro@example.com');`,
    ],
    ordered: true,
    solution: `SELECT id,
       first_name || COALESCE(' ' || last_name, '') AS full_name,
       UPPER(SUBSTR(first_name, 1, 1) || COALESCE(SUBSTR(last_name, 1, 1), '')) AS initials,
       LENGTH(first_name || COALESCE(' ' || last_name, '')) AS name_length
FROM customers
ORDER BY id;`,
    hint: "Concatenating with `||` turns the whole string NULL if any part is NULL. COALESCE the optional piece (space included) to ''.",
    explanation:
      "`||` propagates NULL, so `first_name || ' ' || last_name` is NULL for anyone without a last name. Wrapping the optional part — `COALESCE(' ' || last_name, '')` — keeps the space and surname together when present and adds nothing when absent. `SUBSTR(x, 1, 1)` takes the first character, and `UPPER` normalises initials regardless of how the name was typed; `LENGTH` counts characters of the finished string.",
  },
  {
    id: 'sql-email-domain-leaderboard',
    number: 42,
    title: 'Most Common Email Domains',
    difficulty: 'Medium',
    topic: 'Strings & Dates',
    statement:
      "The `users` table has `id` and `email`. Domains are case-insensitive, and some emails were entered with capital letters.\n\nReturn `domain` (everything after the `@`, lower-cased) and `user_count` (how many users have that domain), ordered by `user_count` descending, then `domain` ascending.",
    schema: `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO users VALUES
  (1, 'ana@gmail.com'),
  (2, 'bo@Gmail.com'),
  (3, 'cy@outlook.com'),
  (4, 'di@acme.io'),
  (5, 'ed@ACME.io'),
  (6, 'flo@acme.io'),
  (7, 'gil@outlook.com');`,
      `INSERT INTO users VALUES
  (1, 'ana@example.org'),
  (2, 'bo@EXAMPLE.ORG'),
  (3, 'cy@Example.Org');`,
      `INSERT INTO users VALUES
  (1, 'a@zeta.dev'),
  (2, 'b@alpha.dev'),
  (3, 'c@mid.co'),
  (4, 'd@mid.co'),
  (5, 'e@Alpha.dev');`,
    ],
    ordered: true,
    solution: `SELECT LOWER(SUBSTR(email, INSTR(email, '@') + 1)) AS domain,
       COUNT(*) AS user_count
FROM users
GROUP BY domain
ORDER BY user_count DESC, domain;`,
    hint: '`INSTR(email, \'@\')` gives the position of the @; `SUBSTR` from one past that position is the domain. Normalise case before grouping.',
    explanation:
      "`INSTR` returns the 1-based position of `@`, so `SUBSTR(email, INSTR(email, '@') + 1)` starts one character later and runs to the end — without the `+ 1` the domain keeps its leading `@`. Lower-casing must happen *before* GROUP BY; otherwise `gmail.com` and `Gmail.com` are counted as two different domains. SQLite lets you group by the output alias, which keeps the query tidy.",
  },
  {
    id: 'sql-overdue-library-returns',
    number: 43,
    title: 'Overdue Library Returns',
    difficulty: 'Medium',
    topic: 'Strings & Dates',
    statement:
      "The `loans` table has `id`, `book_title`, `due_date` and `returned_date` (all dates as `YYYY-MM-DD` text; `returned_date` is NULL while the book is still out).\n\nReturn `id`, `book_title` and `days_late` (an integer number of days between the due date and the return date) for every loan that was returned *after* its due date. Books returned on time or still out are excluded. Rows ordered by `days_late` descending, then `id` ascending.",
    schema: `CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  returned_date TEXT
);`,
    datasets: [
      `INSERT INTO loans VALUES
  (1, 'Dune', '2024-03-01', '2024-03-05'),
  (2, 'Emma', '2024-03-10', '2024-03-10'),
  (3, 'Ulysses', '2024-02-20', '2024-03-15'),
  (4, 'Beloved', '2024-03-12', NULL),
  (5, 'Persuasion', '2024-03-08', '2024-03-07'),
  (6, 'Hamlet', '2024-03-01', '2024-03-05');`,
      `INSERT INTO loans VALUES
  (1, 'Dune', '2023-12-30', '2024-01-02'),
  (2, 'Emma', '2024-02-27', '2024-03-01'),
  (3, 'Ulysses', '2024-01-15', NULL);`,
      `INSERT INTO loans VALUES
  (1, 'Dune', '2024-05-01', '2024-05-01'),
  (2, 'Emma', '2024-05-01', '2024-04-30'),
  (3, 'Ulysses', '2024-05-01', '2024-05-02');`,
    ],
    ordered: true,
    solution: `SELECT id, book_title,
       CAST(julianday(returned_date) - julianday(due_date) AS INTEGER) AS days_late
FROM loans
WHERE returned_date > due_date
ORDER BY days_late DESC, id;`,
    hint: "Dates are text — subtracting two text dates doesn't do what you'd hope. Convert with `julianday()` first.",
    explanation:
      "`julianday(d)` turns an ISO date into a day count, so the difference of two of them is the number of days between them; CAST makes it an integer. Subtracting the raw strings is the trap: SQLite coerces `'2024-03-05' - '2024-03-01'` to `2024 - 2024 = 0`. ISO dates compare correctly as text, so `returned_date > due_date` is safe, and a NULL return date fails that comparison, excluding books still out.",
  },
  {
    id: 'sql-monthly-revenue-report',
    number: 44,
    title: 'Monthly Revenue Report',
    difficulty: 'Easy',
    topic: 'Strings & Dates',
    statement:
      "The `orders` table has `id`, `order_date` (`YYYY-MM-DD` text) and `amount`.\n\nReturn one row per calendar month that has at least one order: `month` in `YYYY-MM` format and `revenue`, the total amount for that month rounded to 2 decimals. Rows ordered by `month` ascending.",
    schema: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  order_date TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO orders VALUES
  (1, '2024-01-03', 120.50),
  (2, '2024-01-28', 80.25),
  (3, '2024-02-14', 45.00),
  (4, '2024-02-29', 300.10),
  (5, '2024-03-01', 15.15),
  (6, '2024-03-31', 60.00);`,
      `INSERT INTO orders VALUES
  (1, '2023-12-31', 500.00),
  (2, '2024-01-01', 10.00),
  (3, '2024-12-15', 20.00),
  (4, '2023-12-01', 1.99);`,
      `INSERT INTO orders VALUES
  (1, '2024-07-10', 9.99),
  (2, '2024-07-11', 9.99),
  (3, '2024-07-12', 9.99);`,
    ],
    ordered: true,
    solution: `SELECT strftime('%Y-%m', order_date) AS month,
       ROUND(SUM(amount), 2) AS revenue
FROM orders
GROUP BY month
ORDER BY month;`,
    hint: "`strftime('%Y-%m', date)` gives a sortable year-month key you can both group and order by.",
    explanation:
      "`strftime('%Y-%m', order_date)` collapses every date to its month, and because the format is zero-padded year-then-month, ordering by it as text is also chronological. Grouping by `'%m'` alone would merge December 2023 with December 2024 into one bucket. Round the SUM in the query so floating-point noise from adding cents doesn't leak into the result.",
  },

  // ===== Advanced =====
  {
    id: 'sql-mailing-list-appearances',
    number: 45,
    title: 'Mailing List Appearance Counts',
    difficulty: 'Medium',
    topic: 'Advanced',
    statement:
      "Two tables hold email addresses collected from different sources: `newsletter_signups(email)` and `webinar_attendees(email)`. The same address can appear more than once in a table (people sign up twice) and in both tables.\n\nReturn every distinct `email` with `appearances`, the total number of rows it occupies across *both* tables. Rows ordered by `appearances` descending, then `email` ascending.",
    schema: `CREATE TABLE newsletter_signups (
  email TEXT NOT NULL
);
CREATE TABLE webinar_attendees (
  email TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO newsletter_signups VALUES
  ('ana@example.com'),
  ('bo@example.com'),
  ('ana@example.com'),
  ('cy@example.com');
INSERT INTO webinar_attendees VALUES
  ('ana@example.com'),
  ('di@example.com'),
  ('bo@example.com');`,
      `INSERT INTO newsletter_signups VALUES
  ('solo@example.com'),
  ('solo@example.com'),
  ('solo@example.com');
INSERT INTO webinar_attendees VALUES
  ('other@example.com');`,
      `INSERT INTO newsletter_signups VALUES
  ('x@example.com'),
  ('y@example.com');
INSERT INTO webinar_attendees VALUES
  ('y@example.com'),
  ('y@example.com'),
  ('z@example.com'),
  ('z@example.com');`,
    ],
    ordered: true,
    solution: `SELECT email, COUNT(*) AS appearances
FROM (
  SELECT email FROM newsletter_signups
  UNION ALL
  SELECT email FROM webinar_attendees
)
GROUP BY email
ORDER BY appearances DESC, email;`,
    hint: 'One of UNION / UNION ALL throws away duplicates. Which one do you need if you intend to count them?',
    explanation:
      "`UNION ALL` stacks the two lists keeping every row, so grouping the result counts real appearances. Plain `UNION` deduplicates first, which would report 1 for everyone and defeat the whole exercise. A JOIN is the wrong shape here too — it only produces rows for emails present in both tables and multiplies duplicates.",
  },
  {
    id: 'sql-single-warehouse-skus',
    number: 46,
    title: 'SKUs Stocked in Only One Warehouse',
    difficulty: 'Hard',
    topic: 'Advanced',
    statement:
      "`warehouse_east(sku, qty)` and `warehouse_west(sku, qty)` list stock per location. A SKU can appear on several rows within one warehouse (separate bins).\n\nReturn `sku` and `location` (`'East'` or `'West'`) for every SKU that is stocked in exactly one of the two warehouses — each such SKU once. Rows ordered by `sku` ascending.",
    schema: `CREATE TABLE warehouse_east (
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL
);
CREATE TABLE warehouse_west (
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO warehouse_east VALUES
  ('A100', 5), ('B200', 2), ('C300', 9), ('B200', 4);
INSERT INTO warehouse_west VALUES
  ('B200', 1), ('D400', 7), ('E500', 3), ('E500', 8);`,
      `INSERT INTO warehouse_east VALUES
  ('A100', 5), ('A100', 1);
INSERT INTO warehouse_west VALUES
  ('A100', 2);`,
      `INSERT INTO warehouse_east VALUES
  ('K1', 1), ('K2', 1), ('K3', 1);
INSERT INTO warehouse_west VALUES
  ('K3', 1), ('K4', 1), ('K4', 2);`,
    ],
    ordered: true,
    solution: `SELECT sku, 'East' AS location
FROM (SELECT sku FROM warehouse_east EXCEPT SELECT sku FROM warehouse_west)
UNION ALL
SELECT sku, 'West' AS location
FROM (SELECT sku FROM warehouse_west EXCEPT SELECT sku FROM warehouse_east)
ORDER BY sku;`,
    hint: 'EXCEPT gives you "in A but not B". You need that in both directions, labelled, and stacked together.',
    explanation:
      "`A EXCEPT B` returns the distinct SKUs in A that are absent from B, so running it both ways and stacking with `UNION ALL` yields the symmetric difference, with the label attached in each half. Set operators de-duplicate, which handles the multiple-bin rows for free. `INTERSECT` is the opposite question (stocked in both), and doing only one EXCEPT misses the SKUs unique to the other warehouse.",
  },
  {
    id: 'sql-consecutive-ticket-ranges',
    number: 47,
    title: 'Consecutive Ticket Number Ranges',
    difficulty: 'Hard',
    topic: 'Advanced',
    statement:
      "The `tickets` table has `batch` and `ticket_no`. Numbers within a batch have gaps, and the same ticket may have been scanned twice (duplicate rows).\n\nCollapse each batch's ticket numbers into runs of consecutive integers. Return `batch`, `range_start` and `range_end` for every run (a lone number is a run where start = end). Rows ordered by `batch` ascending, then `range_start` ascending.",
    schema: `CREATE TABLE tickets (
  batch TEXT NOT NULL,
  ticket_no INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO tickets VALUES
  ('A', 1), ('A', 2), ('A', 3), ('A', 7), ('A', 8),
  ('B', 10), ('B', 12), ('B', 13), ('B', 14);`,
      `INSERT INTO tickets VALUES
  ('X', 5), ('X', 5), ('X', 6), ('X', 6), ('X', 7),
  ('X', 20);`,
      `INSERT INTO tickets VALUES
  ('P', 1), ('P', 3), ('P', 5),
  ('Q', 4), ('Q', 5), ('Q', 6), ('Q', 6);`,
    ],
    ordered: true,
    solution: `WITH nums AS (
  SELECT DISTINCT batch, ticket_no FROM tickets
),
grouped AS (
  SELECT batch, ticket_no,
         ticket_no - ROW_NUMBER() OVER (
           PARTITION BY batch ORDER BY ticket_no
         ) AS grp
  FROM nums
)
SELECT batch, MIN(ticket_no) AS range_start, MAX(ticket_no) AS range_end
FROM grouped
GROUP BY batch, grp
ORDER BY batch, range_start;`,
    hint: 'Gaps and islands: within each batch, `ticket_no - ROW_NUMBER()` is constant across a run of consecutive numbers.',
    explanation:
      "Number the distinct tickets within each batch in order; along a run of consecutive values both the ticket number and the row number step by 1, so their difference is constant and identifies the island. Group on `(batch, difference)` and take MIN/MAX for the range. Duplicates must be removed first or the row number advances while the ticket number doesn't, splitting a run. The numbering must ascend with the ticket numbers — a descending ROW_NUMBER makes the difference change on every row, so no islands form.",
  },
  {
    id: 'sql-dedupe-contacts-lowest-id',
    number: 48,
    title: 'Deduplicate Contacts Keeping the Lowest Id',
    difficulty: 'Medium',
    topic: 'Advanced',
    statement:
      "The `contacts` table has `id`, `email` and `name`. The same email was imported several times with different ids.\n\nReturn the rows that should *survive* a cleanup that keeps only the row with the smallest `id` for each email: `id` and `email`, ordered by `id` ascending.",
    schema: `CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO contacts VALUES
  (1, 'ana@example.com', 'Ana'),
  (2, 'bo@example.com', 'Bo'),
  (3, 'ana@example.com', 'Ana R.'),
  (4, 'cy@example.com', 'Cy'),
  (5, 'bo@example.com', 'Bo K.'),
  (6, 'ana@example.com', 'A. Ruiz');`,
      `INSERT INTO contacts VALUES
  (9, 'solo@example.com', 'Solo'),
  (4, 'dup@example.com', 'Dup 4'),
  (2, 'dup@example.com', 'Dup 2'),
  (7, 'dup@example.com', 'Dup 7');`,
      `INSERT INTO contacts VALUES
  (1, 'a@example.com', 'A'),
  (2, 'b@example.com', 'B'),
  (3, 'c@example.com', 'C');`,
    ],
    ordered: true,
    solution: `SELECT id, email
FROM contacts
WHERE id IN (SELECT MIN(id) FROM contacts GROUP BY email)
ORDER BY id;`,
    hint: 'Find the winning id per email with GROUP BY, then filter the table to those ids.',
    explanation:
      "`SELECT MIN(id) … GROUP BY email` is the set of survivors' ids; filtering with `IN` keeps exactly those rows. `MAX(id)` keeps the newest import instead of the original. `SELECT DISTINCT id, email` is a common miss — the ids differ, so nothing is removed. The same idea written as `DELETE … WHERE id NOT IN (SELECT MIN(id) …)` is the cleanup itself.",
  },
  {
    id: 'sql-quarterly-sales-pivot',
    number: 49,
    title: 'Quarterly Sales Pivot',
    difficulty: 'Medium',
    topic: 'Advanced',
    statement:
      "The `sales` table has `id`, `region`, `quarter` (`'Q1'`–`'Q4'`) and `amount`.\n\nPivot it into one row per region: `region`, `q1`, `q2`, `q3`, `q4`, where each quarter column holds the total amount for that quarter, or 0 when the region had no sales that quarter. Rows ordered by `region` ascending.",
    schema: `CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  region TEXT NOT NULL,
  quarter TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO sales VALUES
  (1, 'North', 'Q1', 100),
  (2, 'North', 'Q1', 50),
  (3, 'North', 'Q2', 200),
  (4, 'North', 'Q4', 75),
  (5, 'South', 'Q1', 30),
  (6, 'South', 'Q3', 90),
  (7, 'South', 'Q3', 10);`,
      `INSERT INTO sales VALUES
  (1, 'East', 'Q4', 1000),
  (2, 'West', 'Q2', 250.5),
  (3, 'West', 'Q2', 249.5);`,
      `INSERT INTO sales VALUES
  (1, 'Central', 'Q1', 1),
  (2, 'Central', 'Q2', 2),
  (3, 'Central', 'Q3', 3),
  (4, 'Central', 'Q4', 4),
  (5, 'Central', 'Q4', 4);`,
    ],
    ordered: true,
    solution: `SELECT region,
       SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END) AS q1,
       SUM(CASE WHEN quarter = 'Q2' THEN amount ELSE 0 END) AS q2,
       SUM(CASE WHEN quarter = 'Q3' THEN amount ELSE 0 END) AS q3,
       SUM(CASE WHEN quarter = 'Q4' THEN amount ELSE 0 END) AS q4
FROM sales
GROUP BY region
ORDER BY region;`,
    hint: 'One SUM per output column, each wrapped in a CASE that zeroes out rows from other quarters.',
    explanation:
      "Conditional aggregation is how you pivot without a PIVOT keyword: `SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END)` adds only Q1 rows into the `q1` column, and GROUP BY region collapses to one row each. The `ELSE 0` matters — without it a quarter with no rows sums only NULLs and comes back NULL rather than 0. Using COUNT instead of SUM would give the number of sales, not their value.",
  },
  {
    id: 'sql-bought-espresso-never-decaf',
    number: 50,
    title: 'Bought Espresso but Never Decaf',
    difficulty: 'Hard',
    topic: 'Advanced',
    statement:
      "`customers` has `id` and `name` (unique). `purchases` has `id`, `customer_id` and `product`.\n\nReturn the `name` of every customer who has bought `'Espresso'` at least once and has *never* bought `'Decaf'`. Rows ordered by `name` ascending.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE purchases (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  product TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ana'), (2, 'Bo'), (3, 'Cy'), (4, 'Di'), (5, 'Ed');
INSERT INTO purchases VALUES
  (1, 1, 'Espresso'),
  (2, 1, 'Latte'),
  (3, 2, 'Espresso'),
  (4, 2, 'Decaf'),
  (5, 3, 'Latte'),
  (6, 4, 'Espresso'),
  (7, 4, 'Espresso'),
  (8, 5, 'Decaf');`,
      `INSERT INTO customers VALUES
  (1, 'Ana'), (2, 'Bo'), (3, 'Cy');
INSERT INTO purchases VALUES
  (1, 1, 'Decaf'),
  (2, 1, 'Espresso'),
  (3, 2, 'Latte'),
  (4, 2, 'Mocha');`,
      `INSERT INTO customers VALUES
  (1, 'Zed'), (2, 'Yara'), (3, 'Xin');
INSERT INTO purchases VALUES
  (1, 1, 'Espresso'),
  (2, 2, 'Espresso'),
  (3, 2, 'Latte'),
  (4, 3, 'Latte'),
  (5, 3, 'Decaf');`,
    ],
    ordered: true,
    solution: `SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM purchases p
  WHERE p.customer_id = c.id AND p.product = 'Espresso'
)
AND NOT EXISTS (
  SELECT 1 FROM purchases p
  WHERE p.customer_id = c.id AND p.product = 'Decaf'
)
ORDER BY c.name;`,
    hint: '"Never bought X" is a condition on *all* of a customer\'s rows, not on a single row. EXISTS / NOT EXISTS express both halves cleanly.',
    explanation:
      "Two correlated subqueries: `EXISTS` checks that at least one Espresso purchase belongs to the customer, `NOT EXISTS` checks that no Decaf purchase does. The per-row filter `WHERE product = 'Espresso' AND product <> 'Decaf'` is the trap — every Espresso row trivially satisfies it, so customers who *also* bought Decaf on another row slip through. Conditional aggregation (`HAVING SUM(product = 'Espresso') > 0 AND SUM(product = 'Decaf') = 0`) is an equally valid approach.",
  },
  // ===== Analytics =====
  {
    id: 'sql-daily-and-trailing-week-listeners',
    number: 51,
    title: 'Daily and Trailing-Week Listeners',
    difficulty: 'Medium',
    topic: 'Analytics',
    statement:
      "A podcast app logs every episode play in `plays` with `id`, `listener_id` and `played_at` (a `'YYYY-MM-DD HH:MM:SS'` timestamp).\n\nFor every calendar day that has at least one play, return `day` (as `YYYY-MM-DD`), `dau` — the number of distinct listeners who played something that day — and `wau` — the number of distinct listeners who played something in the 7-day window ending on that day (the day itself plus the 6 days before it). Rows ordered by `day` ascending.",
    schema: `CREATE TABLE plays (
  id INTEGER PRIMARY KEY,
  listener_id INTEGER NOT NULL,
  played_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO plays VALUES
  (1, 1, '2024-03-01 08:00:00'),
  (2, 2, '2024-03-01 09:30:00'),
  (3, 1, '2024-03-01 20:00:00'),
  (4, 3, '2024-03-02 07:15:00'),
  (5, 1, '2024-03-03 12:00:00'),
  (6, 2, '2024-03-03 12:05:00');`,
      `INSERT INTO plays VALUES
  (1, 10, '2024-03-01 10:00:00'),
  (2, 11, '2024-03-01 11:00:00'),
  (3, 10, '2024-03-04 10:00:00'),
  (4, 12, '2024-03-08 10:00:00'),
  (5, 12, '2024-03-08 22:00:00'),
  (6, 13, '2024-03-12 09:00:00'),
  (7, 10, '2024-03-12 09:30:00');`,
      `INSERT INTO plays VALUES
  (1, 7, '2024-05-01 00:00:00'),
  (2, 7, '2024-05-01 23:59:59'),
  (3, 7, '2024-05-09 06:00:00');`,
    ],
    ordered: true,
    solution: `WITH days AS (
  SELECT DISTINCT date(played_at) AS day FROM plays
)
SELECT d.day,
       (SELECT COUNT(DISTINCT p.listener_id) FROM plays p
         WHERE date(p.played_at) = d.day) AS dau,
       (SELECT COUNT(DISTINCT p.listener_id) FROM plays p
         WHERE date(p.played_at) BETWEEN date(d.day, '-6 days') AND d.day) AS wau
FROM days d
ORDER BY d.day;`,
    hint: 'A trailing-window distinct count cannot be expressed as a window function — correlate a subquery per day instead, and count DISTINCT listeners, not plays.',
    explanation:
      "Build the list of days first, then for each day run two correlated counts: listeners active that day, and listeners active in the range `day - 6 .. day`. `COUNT(DISTINCT listener_id)` matters because one listener can play many episodes. A 7-day window ending today starts six days ago, not seven — `'-7 days'` would quietly count an eighth day. `SUM(...) OVER (... ROWS 6 PRECEDING)` can't replace this: window functions can't do DISTINCT across frames, and rows-based frames ignore calendar gaps.",
  },
  {
    id: 'sql-second-week-return-rate',
    number: 52,
    title: 'Second-Week Return Rate by Join Cohort',
    difficulty: 'Hard',
    topic: 'Analytics',
    statement:
      "A gym stores `members` (`id`, `joined_on` as `YYYY-MM-DD`) and `visits` (`id`, `member_id`, `visited_on`).\n\nGroup members into weekly cohorts: `cohort_week` is the Monday on or before their `joined_on`. A member *returned* if they have at least one visit between 7 and 13 days after `joined_on`, inclusive (their second week).\n\nReturn `cohort_week`, `members` (cohort size), `returned` (members who returned) and `rate` — `returned` as a percentage of `members`, `ROUND`ed to 2 decimals. Include cohorts where nobody returned. Rows ordered by `cohort_week` ascending.",
    schema: `CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  joined_on TEXT NOT NULL
);
CREATE TABLE visits (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL,
  visited_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO members VALUES
  (1, '2024-04-01'), (2, '2024-04-03'), (3, '2024-04-08');
INSERT INTO visits VALUES
  (1, 1, '2024-04-09'), (2, 1, '2024-04-12'),
  (3, 2, '2024-04-05'),
  (4, 3, '2024-04-20');`,
      `INSERT INTO members VALUES
  (1, '2024-04-07'), (2, '2024-04-02'), (3, '2024-04-14'), (4, '2024-04-16');
INSERT INTO visits VALUES
  (1, 1, '2024-04-14'),
  (2, 2, '2024-04-16'),
  (3, 3, '2024-04-27'),
  (4, 4, '2024-04-16'), (5, 4, '2024-04-30');`,
      `INSERT INTO members VALUES
  (1, '2024-06-03'), (2, '2024-06-05'), (3, '2024-06-06');
INSERT INTO visits VALUES
  (1, 1, '2024-06-04'), (2, 2, '2024-06-20');`,
    ],
    ordered: true,
    solution: `WITH flagged AS (
  SELECT date(m.joined_on, 'weekday 0', '-6 days') AS cohort_week,
         EXISTS (
           SELECT 1 FROM visits v
           WHERE v.member_id = m.id
             AND v.visited_on BETWEEN date(m.joined_on, '+7 days')
                                  AND date(m.joined_on, '+13 days')
         ) AS came_back
  FROM members m
)
SELECT cohort_week,
       COUNT(*) AS members,
       SUM(came_back) AS returned,
       ROUND(SUM(came_back) * 100.0 / COUNT(*), 2) AS rate
FROM flagged
GROUP BY cohort_week
ORDER BY cohort_week;`,
    hint: "Decide per member (not per visit) whether they came back — EXISTS gives you a clean 0/1 — then aggregate. `date(x, 'weekday 0', '-6 days')` lands on the Monday on or before x.",
    explanation:
      "The trick is to flag each member once with `EXISTS`, so a member who visited three times in their second week still counts as one return; joining `visits` directly and counting rows inflates the numerator. The cohort key uses SQLite's `'weekday 0'` modifier (advance to Sunday, or stay if already Sunday) followed by `'-6 days'`, which yields the Monday on or before the date — `'weekday 1'` would snap Sunday joiners forward into the next cohort. The return window is `+7 .. +13`; `+14` is the start of week three.",
  },
  {
    id: 'sql-checkout-funnel-dropoff',
    number: 53,
    title: 'Where Shoppers Leave the Checkout',
    difficulty: 'Hard',
    topic: 'Analytics',
    statement:
      "`funnel_steps` lists the checkout in order: `step_no` (1, 2, 3 …) and `step` (its name). `events` logs `id`, `visitor_id`, `step` and `occurred_at` — any step, any number of times, in any order.\n\nA visitor counts as having *reached* a step only if they logged that step **and every earlier step** at least once (timing doesn't matter). For every row of `funnel_steps` return `step_no`, `step`, `visitors` (distinct visitors who reached it, 0 if none) and `dropped` — the previous step's `visitors` minus this step's, or 0 for the first step. Rows ordered by `step_no` ascending.",
    schema: `CREATE TABLE funnel_steps (
  step_no INTEGER PRIMARY KEY,
  step TEXT NOT NULL UNIQUE
);
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  visitor_id INTEGER NOT NULL,
  step TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO funnel_steps VALUES (1, 'view'), (2, 'cart'), (3, 'pay'), (4, 'done');
INSERT INTO events VALUES
  (1, 1, 'view', '2024-01-01 10:00:00'), (2, 1, 'cart', '2024-01-01 10:01:00'),
  (3, 1, 'pay', '2024-01-01 10:02:00'),  (4, 1, 'done', '2024-01-01 10:03:00'),
  (5, 2, 'view', '2024-01-01 11:00:00'), (6, 2, 'cart', '2024-01-01 11:05:00'),
  (7, 3, 'view', '2024-01-01 12:00:00'),
  (8, 4, 'view', '2024-01-01 13:00:00'), (9, 4, 'cart', '2024-01-01 13:01:00'),
  (10, 4, 'pay', '2024-01-01 13:02:00');`,
      `INSERT INTO funnel_steps VALUES (1, 'view'), (2, 'cart'), (3, 'pay'), (4, 'done');
INSERT INTO events VALUES
  (1, 1, 'view', '2024-02-01 09:00:00'), (2, 1, 'cart', '2024-02-01 09:01:00'),
  (3, 2, 'view', '2024-02-01 09:30:00'),
  (4, 3, 'cart', '2024-02-01 10:00:00'), (5, 3, 'pay', '2024-02-01 10:01:00'),
  (6, 4, 'view', '2024-02-01 11:00:00'), (7, 4, 'view', '2024-02-01 11:00:30'),
  (8, 4, 'cart', '2024-02-01 11:01:00'), (9, 4, 'pay', '2024-02-01 11:02:00'),
  (10, 4, 'done', '2024-02-01 11:03:00');`,
      `INSERT INTO funnel_steps VALUES (1, 'land'), (2, 'signup'), (3, 'verify');
INSERT INTO events VALUES
  (1, 1, 'land', '2024-03-01 09:00:00'),
  (2, 2, 'land', '2024-03-01 09:10:00'), (3, 2, 'signup', '2024-03-01 09:12:00'),
  (4, 3, 'verify', '2024-03-01 09:20:00');`,
    ],
    ordered: true,
    solution: `WITH reached AS (
  SELECT DISTINCT e.visitor_id, s.step_no
  FROM events e
  JOIN funnel_steps s ON s.step = e.step
),
qualified AS (
  SELECT r.visitor_id, r.step_no
  FROM reached r
  WHERE (SELECT COUNT(*) FROM reached r2
          WHERE r2.visitor_id = r.visitor_id AND r2.step_no <= r.step_no) = r.step_no
),
counts AS (
  SELECT s.step_no, s.step, COUNT(q.visitor_id) AS visitors
  FROM funnel_steps s
  LEFT JOIN qualified q ON q.step_no = s.step_no
  GROUP BY s.step_no, s.step
)
SELECT step_no, step, visitors,
       COALESCE(LAG(visitors) OVER (ORDER BY step_no) - visitors, 0) AS dropped
FROM counts
ORDER BY step_no;`,
    hint: 'Reduce events to distinct (visitor, step_no) pairs; a visitor has reached step k when they hold exactly k distinct pairs with step_no <= k. Drive the final counts from funnel_steps so empty steps still appear.',
    explanation:
      "Collapse the noisy event log to distinct `(visitor, step_no)` pairs, then apply the prerequisite rule: a visitor qualifies for step k when the number of their pairs with `step_no <= k` equals k — which forces every earlier step to be present. Counting distinct visitors per step without that rule over-counts anyone who skipped a step (a visitor who logged `cart` and `pay` but never `view`). Steps nobody reached must still show 0, so the count is driven from `funnel_steps` with a LEFT JOIN; `LAG` then gives the previous step's count and `COALESCE` turns the first step's NULL into 0.",
  },
  {
    id: 'sql-trailing-seven-day-orders',
    number: 54,
    title: 'Trailing Seven-Day Order Volume',
    difficulty: 'Medium',
    topic: 'Analytics',
    statement:
      "`daily_orders` has one row per day with orders: `day` (`YYYY-MM-DD`, unique) and `orders`. Days with no orders have **no row**.\n\nFor every row return `day` and `trailing_7` — the total `orders` for that day and the six calendar days before it (absent days contribute 0). Rows ordered by `day` ascending.",
    schema: `CREATE TABLE daily_orders (
  day TEXT PRIMARY KEY,
  orders INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO daily_orders VALUES
  ('2024-01-01', 5), ('2024-01-02', 3), ('2024-01-03', 4), ('2024-01-04', 6),
  ('2024-01-05', 2), ('2024-01-06', 8), ('2024-01-07', 1), ('2024-01-08', 7);`,
      `INSERT INTO daily_orders VALUES
  ('2024-02-01', 10), ('2024-02-03', 5), ('2024-02-09', 2), ('2024-02-10', 4), ('2024-02-20', 1);`,
      `INSERT INTO daily_orders VALUES
  ('2024-03-28', 3), ('2024-03-31', 2), ('2024-04-02', 6), ('2024-04-05', 1);`,
    ],
    ordered: true,
    solution: `SELECT day,
       SUM(orders) OVER (
         ORDER BY CAST(julianday(day) AS INTEGER)
         RANGE BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS trailing_7
FROM daily_orders
ORDER BY day;`,
    hint: 'ROWS BETWEEN 6 PRECEDING counts rows, not days. Order the window by a numeric day number (julianday) and use a RANGE frame so the frame is measured in days.',
    explanation:
      "A `ROWS` frame looks back six *rows*, which is only right when the table has a row for every day; with gaps it reaches too far back. Ordering the window by the integer Julian day and using `RANGE BETWEEN 6 PRECEDING AND CURRENT ROW` makes the frame a span of values — days — so missing days are simply absent from the sum. Seven days ending today means `6 PRECEDING`; `7 PRECEDING` is an eight-day window.",
  },
  {
    id: 'sql-month-over-month-collections',
    number: 55,
    title: 'Month-over-Month Collections Growth',
    difficulty: 'Medium',
    topic: 'Analytics',
    statement:
      "A clinic's `payments` table has `id`, `paid_on` (`YYYY-MM-DD`) and `amount`.\n\nReturn one row per calendar month that has payments: `month` (`YYYY-MM`), `collected` (total `amount`) and `growth_pct` — the percentage change from the previous row of this report (the previous month that has payments), `ROUND`ed to 2 decimals, or NULL for the first month. Rows ordered by `month` ascending.",
    schema: `CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  paid_on TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO payments VALUES
  (1, '2024-01-05', 100), (2, '2024-01-20', 50),
  (3, '2024-02-02', 180),
  (4, '2024-03-15', 90);`,
      `INSERT INTO payments VALUES
  (1, '2024-05-01', 200),
  (2, '2024-07-10', 250), (3, '2024-07-11', 50),
  (4, '2024-08-01', 300);`,
      `INSERT INTO payments VALUES
  (1, '2024-09-09', 10.5), (2, '2024-09-10', 20.25);`,
    ],
    ordered: true,
    solution: `WITH monthly AS (
  SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount) AS collected
  FROM payments
  GROUP BY month
)
SELECT month, collected,
       ROUND((collected - LAG(collected) OVER (ORDER BY month)) * 100.0
             / LAG(collected) OVER (ORDER BY month), 2) AS growth_pct
FROM monthly
ORDER BY month;`,
    hint: 'Aggregate to one row per month first (a CTE), then apply LAG over the monthly rows — LAG over the raw payments compares individual payments, not months.',
    explanation:
      "Window functions run after `GROUP BY`, but only within the same query level; putting `LAG` next to `SUM(amount)` in the raw table compares payments, not months, so aggregate in a CTE and window over that. Growth is `(current - previous) / previous`; dividing by the current month is a common slip that understates rises. The first month has no predecessor, so `LAG` returns NULL and the arithmetic propagates it — exactly what the report wants.",
  },
  {
    id: 'sql-carrier-share-of-freight',
    number: 56,
    title: 'Carrier Share of Freight Spend',
    difficulty: 'Easy',
    topic: 'Analytics',
    statement:
      "`shipments` has `id`, `carrier` and `cost`.\n\nReturn one row per carrier with `carrier`, `spend` (total `cost`) and `share_pct` — the carrier's spend as a percentage of all spend, `ROUND`ed to 2 decimals. Rows ordered by `spend` descending, then `carrier` ascending.",
    schema: `CREATE TABLE shipments (
  id INTEGER PRIMARY KEY,
  carrier TEXT NOT NULL,
  cost REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO shipments VALUES
  (1, 'Northwind Freight', 120), (2, 'Blue Crate', 80),
  (3, 'Northwind Freight', 200), (4, 'Skyhaul', 100);`,
      `INSERT INTO shipments VALUES
  (1, 'Skyhaul', 33.5), (2, 'Skyhaul', 33.5), (3, 'Blue Crate', 33);`,
      `INSERT INTO shipments VALUES
  (1, 'Blue Crate', 10), (2, 'Blue Crate', 15);`,
      `INSERT INTO shipments VALUES
  (1, 'Arrow', 1), (2, 'Bolt', 1), (3, 'Comet', 1);`,
    ],
    ordered: true,
    solution: `SELECT carrier,
       SUM(cost) AS spend,
       ROUND(SUM(cost) * 100.0 / SUM(SUM(cost)) OVER (), 2) AS share_pct
FROM shipments
GROUP BY carrier
ORDER BY spend DESC, carrier;`,
    hint: 'The grand total is a window over the grouped rows: SUM(SUM(cost)) OVER () — or a scalar subquery against the whole table.',
    explanation:
      "After `GROUP BY carrier`, `SUM(cost)` is one carrier's spend; wrapping it in a window, `SUM(SUM(cost)) OVER ()`, sums those group totals across every row, giving the grand total without a second scan. Dividing a group's `SUM(cost)` by itself always yields 100 — the denominator must be the total, not the group. Multiply by `100.0` before dividing so nothing is truncated when the columns happen to be integers.",
  },
  {
    id: 'sql-first-touch-channel-wins',
    number: 57,
    title: 'First-Touch Channel Behind Each Won Deal',
    difficulty: 'Medium',
    topic: 'Analytics',
    statement:
      "`touches` records marketing contacts: `id`, `lead_id`, `channel` and `touched_at` (timestamps are unique within a lead). `deals` has one row per lead that reached sales: `lead_id` and `won` (1 or 0).\n\nCredit each won deal to the channel of the lead's **earliest** touch. Return every distinct `channel` that appears in `touches` with `wins` — the number of won leads credited to it (0 if none). Rows ordered by `wins` descending, then `channel` ascending.",
    schema: `CREATE TABLE touches (
  id INTEGER PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  channel TEXT NOT NULL,
  touched_at TEXT NOT NULL
);
CREATE TABLE deals (
  lead_id INTEGER PRIMARY KEY,
  won INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO touches VALUES
  (1, 101, 'search', '2024-01-01 10:00:00'), (2, 101, 'email', '2024-01-02 10:00:00'),
  (3, 102, 'social', '2024-01-01 11:00:00'),
  (4, 103, 'email', '2024-01-03 09:00:00'),  (5, 103, 'search', '2024-01-04 09:00:00');
INSERT INTO deals VALUES (101, 1), (102, 0), (103, 1);`,
      `INSERT INTO touches VALUES
  (1, 201, 'ads', '2024-02-01 08:00:00'), (2, 201, 'search', '2024-02-01 09:00:00'),
  (3, 201, 'ads', '2024-02-02 08:00:00'),
  (4, 202, 'search', '2024-02-03 08:00:00'), (5, 202, 'ads', '2024-02-05 08:00:00'),
  (6, 203, 'referral', '2024-02-06 08:00:00');
INSERT INTO deals VALUES (201, 1), (202, 1), (203, 0), (204, 1);`,
      `INSERT INTO touches VALUES
  (1, 301, 'email', '2024-03-01 08:00:00'), (2, 302, 'email', '2024-03-02 08:00:00');
INSERT INTO deals VALUES (301, 0);`,
    ],
    ordered: true,
    solution: `WITH first_touch AS (
  SELECT lead_id, channel,
         ROW_NUMBER() OVER (PARTITION BY lead_id ORDER BY touched_at) AS rn
  FROM touches
),
channels AS (
  SELECT DISTINCT channel FROM touches
)
SELECT c.channel, COUNT(d.lead_id) AS wins
FROM channels c
LEFT JOIN first_touch f ON f.channel = c.channel AND f.rn = 1
LEFT JOIN deals d ON d.lead_id = f.lead_id AND d.won = 1
GROUP BY c.channel
ORDER BY wins DESC, c.channel;`,
    hint: 'Pick one touch per lead with ROW_NUMBER() ordered by touched_at, keep rn = 1, then count won deals per channel — starting from the list of channels so zeros survive.',
    explanation:
      "Attribution is a latest/earliest-per-entity problem: `ROW_NUMBER() OVER (PARTITION BY lead_id ORDER BY touched_at)` marks each lead's first touch, and only `rn = 1` rows carry credit. Joining `touches` to `deals` without that filter credits every channel a won lead ever passed through, and ordering `DESC` gives last-touch attribution — a different model. Channels with no wins must still appear, so the query starts from the distinct channel list and LEFT JOINs outward, with the `won = 1` condition in the ON clause so it doesn't turn the outer join into an inner one.",
  },
  {
    id: 'sql-diners-who-went-quiet',
    number: 58,
    title: 'Diners Who Went Quiet Last Month',
    difficulty: 'Medium',
    topic: 'Analytics',
    statement:
      "A meal-delivery service keeps `orders` with `id`, `diner_id` and `ordered_on` (`YYYY-MM-DD`).\n\nCall the calendar month of the latest `ordered_on` in the table the *current month*, and the calendar month immediately before it the *previous month* (even if it has no orders). A diner *churned* if they placed at least one order in the previous month and none in the current month.\n\nReturn `diner_id` for every churned diner, once each, ordered by `diner_id` ascending.",
    schema: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  diner_id INTEGER NOT NULL,
  ordered_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO orders VALUES
  (1, 1, '2024-05-03'), (2, 2, '2024-05-10'), (3, 3, '2024-05-20'),
  (4, 1, '2024-06-02'), (5, 3, '2024-06-15'), (6, 3, '2024-06-16'), (7, 4, '2024-06-20');`,
      `INSERT INTO orders VALUES
  (1, 1, '2024-01-05'), (2, 2, '2024-01-06'),
  (3, 3, '2024-02-01'), (6, 5, '2024-02-03'),
  (4, 3, '2024-04-01'), (5, 4, '2024-04-02');`,
      `INSERT INTO orders VALUES
  (1, 9, '2024-08-30'), (2, 9, '2024-08-31'), (3, 8, '2024-08-31'),
  (4, 7, '2024-09-01'), (5, 8, '2024-09-30');`,
    ],
    ordered: true,
    solution: `WITH bounds AS (
  SELECT strftime('%Y-%m', MAX(ordered_on)) AS cur,
         strftime('%Y-%m', date(MAX(ordered_on), 'start of month', '-1 month')) AS prev
  FROM orders
)
SELECT DISTINCT o.diner_id
FROM orders o
CROSS JOIN bounds b
WHERE strftime('%Y-%m', o.ordered_on) = b.prev
  AND o.diner_id NOT IN (
    SELECT o2.diner_id FROM orders o2
    WHERE strftime('%Y-%m', o2.ordered_on) = b.cur
  )
ORDER BY o.diner_id;`,
    hint: "Derive both month keys from MAX(ordered_on): the current month with strftime('%Y-%m'), the previous with date(..., 'start of month', '-1 month'). Then it's an anti-join between the two sets of diners.",
    explanation:
      "Compute the two month labels once in a CTE so nothing is hard-coded, then select diners active in the previous month and exclude those active in the current one with `NOT IN`. The previous month is the calendar month before the current one — when that month has no orders the churn list is empty, whereas picking \"the last month that had orders\" would silently widen the comparison. `DISTINCT` is required because a diner with several previous-month orders would otherwise appear several times, and comparing against \"any earlier month\" instead of just the previous one flags long-gone diners as newly churned.",
  },

  // ===== Data Quality =====
  {
    id: 'sql-reviews-with-missing-listings',
    number: 59,
    title: 'Reviews Pointing at Missing Listings',
    difficulty: 'Easy',
    topic: 'Data Quality',
    statement:
      "A rentals site has `listings` (`id`, `title`) and `reviews` (`id`, `listing_id`, `rating`). Listings get hard-deleted, and some old reviews were imported with no `listing_id` at all (NULL).\n\nReturn `id` and `listing_id` (in that order) of every review whose `listing_id` is NULL or does not match any listing. Rows can be in any order.",
    schema: `CREATE TABLE listings (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  listing_id INTEGER,
  rating INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO listings VALUES (1, 'Loft on Elm'), (2, 'Harbor Studio'), (3, 'Garden Flat');
INSERT INTO reviews VALUES (10, 1, 5), (11, 2, 4), (12, 7, 3), (13, NULL, 2), (14, 3, 5);`,
      `INSERT INTO listings VALUES (1, 'Cabin 4');
INSERT INTO reviews VALUES (1, 1, 4), (2, 1, 5);`,
      `INSERT INTO listings VALUES (5, 'Attic Room'), (6, 'Barn Suite');
INSERT INTO reviews VALUES (1, 5, 3), (2, 6, 1), (3, 9, 2), (4, NULL, 4), (5, NULL, 5), (6, 8, 4);`,
    ],
    solution: `SELECT r.id, r.listing_id
FROM reviews r
LEFT JOIN listings l ON l.id = r.listing_id
WHERE l.id IS NULL;`,
    hint: 'LEFT JOIN to the parent and keep rows where the parent side came back NULL — that catches both dangling ids and NULL foreign keys in one pass.',
    explanation:
      "An orphan check is a LEFT JOIN with `WHERE parent.id IS NULL`: rows with no matching listing get NULLs on the listing side, and a NULL `listing_id` never matches anything so it is caught too. `WHERE listing_id NOT IN (SELECT id FROM listings)` misses the NULL reviews — `NULL NOT IN (...)` is unknown, never true — and an inner join can't return unmatched rows at all.",
  },
  {
    id: 'sql-stale-device-registrations',
    number: 60,
    title: 'Stale Device Registrations to Purge',
    difficulty: 'Medium',
    topic: 'Data Quality',
    statement:
      "`devices` has `id`, `serial_no` and `registered_at`. Re-registering a device inserted a new row instead of updating the old one, so a serial can appear several times.\n\nFor each `serial_no` keep only its newest row — the latest `registered_at`, and on an exact tie the higher `id`. Return the `id` of every row that should be **deleted**, ordered by `id` ascending.",
    schema: `CREATE TABLE devices (
  id INTEGER PRIMARY KEY,
  serial_no TEXT NOT NULL,
  registered_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO devices VALUES
  (1, 'SN-100', '2024-01-01 09:00:00'),
  (2, 'SN-100', '2024-02-01 09:00:00'),
  (3, 'SN-200', '2024-01-15 09:00:00'),
  (4, 'SN-300', '2024-01-20 09:00:00'),
  (5, 'SN-300', '2024-01-10 09:00:00');`,
      `INSERT INTO devices VALUES
  (1, 'X1', '2024-03-01 00:00:00'),
  (2, 'X1', '2024-03-01 00:00:00'),
  (3, 'X1', '2024-02-01 00:00:00');`,
      `INSERT INTO devices VALUES
  (7, 'A', '2024-01-01 00:00:00'),
  (8, 'B', '2024-01-02 00:00:00');`,
    ],
    ordered: true,
    solution: `WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY serial_no ORDER BY registered_at DESC, id DESC
         ) AS rn
  FROM devices
)
SELECT id
FROM ranked
WHERE rn > 1
ORDER BY id;`,
    hint: 'Number the rows within each serial, newest first (registered_at DESC, id DESC as the tiebreak); everything numbered 2 or higher goes.',
    explanation:
      "`ROW_NUMBER() OVER (PARTITION BY serial_no ORDER BY registered_at DESC, id DESC)` puts the survivor at 1 in every group, so `rn > 1` is exactly the delete list. The natural key is `serial_no`, not `id`, and \"newest\" is a timestamp — the row with the highest id isn't necessarily the latest registration (row 5 in the example is older than row 4). The explicit `id DESC` tiebreak makes the result deterministic when two registrations share a timestamp; `GROUP BY serial_no HAVING COUNT(*) > 1` only tells you which serials are duplicated, not which rows to remove.",
  },
  {
    id: 'sql-sensor-reading-audit',
    number: 61,
    title: 'Sensor Reading Audit',
    difficulty: 'Easy',
    topic: 'Data Quality',
    statement:
      "`readings` stores temperature samples: `id`, `sensor`, `value` (NULL when the probe failed) and `taken_at`. Valid readings lie between -40 and 125 inclusive.\n\nReturn one row per sensor with `sensor`, `total` (all rows), `missing` (rows whose `value` is NULL) and `out_of_range` (non-NULL values below -40 or above 125). Rows ordered by `sensor` ascending.",
    schema: `CREATE TABLE readings (
  id INTEGER PRIMARY KEY,
  sensor TEXT NOT NULL,
  value REAL,
  taken_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO readings VALUES
  (1, 'roof', 22.5, '2024-01-01 00:00:00'),
  (2, 'roof', NULL, '2024-01-01 01:00:00'),
  (3, 'roof', 130, '2024-01-01 02:00:00'),
  (4, 'cellar', -45, '2024-01-01 00:00:00'),
  (5, 'cellar', 10, '2024-01-01 01:00:00');`,
      `INSERT INTO readings VALUES
  (1, 'dock', 125, '2024-02-01 00:00:00'),
  (2, 'dock', -40, '2024-02-01 01:00:00'),
  (3, 'dock', 125.1, '2024-02-01 02:00:00'),
  (4, 'dock', NULL, '2024-02-01 03:00:00'),
  (5, 'dock', NULL, '2024-02-01 04:00:00');`,
      `INSERT INTO readings VALUES
  (1, 'lab', 20, '2024-03-01 00:00:00'),
  (2, 'lab', 21, '2024-03-01 01:00:00'),
  (3, 'yard', 30, '2024-03-01 00:00:00');`,
    ],
    ordered: true,
    solution: `SELECT sensor,
       COUNT(*) AS total,
       COUNT(*) - COUNT(value) AS missing,
       SUM(CASE WHEN value < -40 OR value > 125 THEN 1 ELSE 0 END) AS out_of_range
FROM readings
GROUP BY sensor
ORDER BY sensor;`,
    hint: 'Never filter with WHERE in an audit — every row must stay so `total` is right. Count categories with COUNT(*) − COUNT(col) and SUM(CASE …).',
    explanation:
      "An audit query keeps every row and classifies inside the aggregates: `COUNT(*)` counts rows, `COUNT(value)` skips NULLs, so their difference is the missing count, and `SUM(CASE WHEN … THEN 1 ELSE 0 END)` counts the out-of-range rows. The range is inclusive, so the tests are strict `<` and `>` — `<= 125` would flag a valid boundary reading. Filtering with `WHERE value IS NOT NULL` would make `total` and `missing` wrong for every sensor.",
  },
  {
    id: 'sql-shipment-warehouse-mismatches',
    number: 62,
    title: 'Shipments Leaving the Wrong Warehouse',
    difficulty: 'Easy',
    topic: 'Data Quality',
    statement:
      "`orders` has `id` and `warehouse_id` (never NULL) — the warehouse that should fulfil the order. `shipments` has `id`, `order_id` (always a real order) and `warehouse_id`, which is NULL when the scan was skipped.\n\nReturn `id` (the shipment), `order_id`, `expected` (the order's warehouse) and `actual` (the shipment's warehouse) for every shipment whose warehouse differs from the order's. A NULL shipment warehouse counts as a mismatch. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  warehouse_id INTEGER NOT NULL
);
CREATE TABLE shipments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  warehouse_id INTEGER
);`,
    datasets: [
      `INSERT INTO orders VALUES (1, 10), (2, 20), (3, 10);
INSERT INTO shipments VALUES (100, 1, 10), (101, 2, 10), (102, 3, NULL), (103, 1, 10);`,
      `INSERT INTO orders VALUES (1, 5);
INSERT INTO shipments VALUES (1, 1, 5), (2, 1, 5);`,
      `INSERT INTO orders VALUES (7, 1), (8, 2);
INSERT INTO shipments VALUES (50, 7, 2), (51, 8, NULL), (52, 8, 2);`,
    ],
    ordered: true,
    solution: `SELECT s.id, s.order_id, o.warehouse_id AS expected, s.warehouse_id AS actual
FROM shipments s
JOIN orders o ON o.id = s.order_id
WHERE s.warehouse_id IS NOT o.warehouse_id
ORDER BY s.id;`,
    hint: "`<>` is unknown when one side is NULL, so those rows vanish. SQLite's `IS NOT` compares NULL-safely.",
    explanation:
      "Join each shipment to its order and compare the two warehouse columns with a NULL-safe operator: in SQLite `IS NOT` treats NULL as a value, so a missing scan compares as different from any real warehouse. With plain `<>` the comparison yields NULL for those rows and the WHERE clause drops them — the very rows the report exists to find. The alternative is spelling it out: `s.warehouse_id <> o.warehouse_id OR s.warehouse_id IS NULL`.",
  },
  {
    id: 'sql-double-booked-rooms',
    number: 63,
    title: 'Double-Booked Rooms',
    difficulty: 'Hard',
    topic: 'Data Quality',
    statement:
      "`bookings` has `id`, `room`, `starts_at` and `ends_at` (timestamps; a booking occupies `[starts_at, ends_at)` — the end instant is free, so a booking that starts exactly when another ends does **not** clash).\n\nFind every pair of bookings in the same room whose time spans overlap. Return `first_id`, `second_id` and `room`, where `first_id < second_id` (report each pair once). Rows ordered by `first_id` ascending, then `second_id` ascending.",
    schema: `CREATE TABLE bookings (
  id INTEGER PRIMARY KEY,
  room TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO bookings VALUES
  (1, 'Aspen', '2024-05-01 09:00:00', '2024-05-01 10:00:00'),
  (2, 'Aspen', '2024-05-01 09:30:00', '2024-05-01 11:00:00'),
  (3, 'Aspen', '2024-05-01 11:00:00', '2024-05-01 12:00:00'),
  (4, 'Birch', '2024-05-01 09:00:00', '2024-05-01 10:00:00');`,
      `INSERT INTO bookings VALUES
  (1, 'Cedar', '2024-06-03 08:00:00', '2024-06-03 17:00:00'),
  (2, 'Cedar', '2024-06-03 09:00:00', '2024-06-03 10:00:00'),
  (3, 'Cedar', '2024-06-03 12:00:00', '2024-06-03 13:00:00'),
  (5, 'Cedar', '2024-06-04 08:00:00', '2024-06-04 09:00:00');`,
      `INSERT INTO bookings VALUES
  (1, 'Dune', '2024-07-01 08:00:00', '2024-07-01 09:00:00'),
  (2, 'Dune', '2024-07-01 09:00:00', '2024-07-01 10:00:00'),
  (3, 'Elm', '2024-07-01 08:30:00', '2024-07-01 09:30:00'),
  (9, 'Fern', '2024-07-02 08:00:00', '2024-07-02 10:00:00'),
  (4, 'Fern', '2024-07-02 09:00:00', '2024-07-02 11:00:00');`,
    ],
    ordered: true,
    solution: `SELECT a.id AS first_id, b.id AS second_id, a.room
FROM bookings a
JOIN bookings b
  ON b.room = a.room
 AND b.id > a.id
 AND a.starts_at < b.ends_at
 AND b.starts_at < a.ends_at
ORDER BY first_id, second_id;`,
    hint: 'Two half-open intervals overlap exactly when each one starts before the other ends. Self-join on room with a.id < b.id so every pair shows up once.',
    explanation:
      "Two intervals overlap when `a.start < b.end AND b.start < a.end` — the standard test that also handles one booking fully inside another. Because the ranges are half-open, both comparisons are strict; using `<=` would report back-to-back bookings as clashes. The self-join needs `b.id > a.id` rather than `<>` so each pair is emitted once, and the `room` equality is part of the join, otherwise every concurrent booking in the building looks like a conflict.",
  },

  // ===== Operational Reports =====
  {
    id: 'sql-missed-first-reply-window',
    number: 64,
    title: 'Tickets That Blew Their First-Reply Window',
    difficulty: 'Medium',
    topic: 'Operational Reports',
    statement:
      "`sla` maps each `priority` to the `minutes` allowed before a first reply. `tickets` has `id`, `priority`, `opened_at` and `first_reply_at` (timestamps to the minute; NULL when nobody has replied yet).\n\nA ticket breached its SLA if it was never replied to, or its first reply came **more than** the allowed minutes after opening. Return `id`, `priority` and `minutes_late` — whole minutes from `opened_at` to `first_reply_at` minus the allowed minutes, or NULL when there was no reply. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE sla (
  priority TEXT PRIMARY KEY,
  minutes INTEGER NOT NULL
);
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY,
  priority TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  first_reply_at TEXT
);`,
    datasets: [
      `INSERT INTO sla VALUES ('urgent', 30), ('normal', 240);
INSERT INTO tickets VALUES
  (1, 'urgent', '2024-01-01 09:00:00', '2024-01-01 09:20:00'),
  (2, 'urgent', '2024-01-01 09:00:00', '2024-01-01 09:45:00'),
  (3, 'normal', '2024-01-01 09:00:00', NULL),
  (4, 'normal', '2024-01-01 09:00:00', '2024-01-01 13:00:00'),
  (5, 'normal', '2024-01-01 23:00:00', '2024-01-02 03:01:00');`,
      `INSERT INTO sla VALUES ('p1', 15), ('p2', 60);
INSERT INTO tickets VALUES
  (1, 'p1', '2024-02-01 00:00:00', '2024-02-01 00:15:00'),
  (2, 'p2', '2024-02-01 00:00:00', '2024-02-01 02:00:00'),
  (3, 'p1', '2024-02-01 10:00:00', NULL);`,
      `INSERT INTO sla VALUES ('low', 1440);
INSERT INTO tickets VALUES
  (1, 'low', '2024-03-01 00:00:00', '2024-03-01 12:00:00'),
  (2, 'low', '2024-03-01 00:00:00', '2024-03-02 00:00:00');`,
    ],
    ordered: true,
    solution: `SELECT t.id, t.priority,
       CASE WHEN t.first_reply_at IS NULL THEN NULL
            ELSE CAST(ROUND((julianday(t.first_reply_at) - julianday(t.opened_at)) * 1440) AS INTEGER)
                 - s.minutes
       END AS minutes_late
FROM tickets t
JOIN sla s ON s.priority = t.priority
WHERE t.first_reply_at IS NULL
   OR t.first_reply_at > datetime(t.opened_at, '+' || s.minutes || ' minutes')
ORDER BY t.id;`,
    hint: "Compare timestamps by adding the allowance to opened_at with datetime(x, '+N minutes'); julianday differences × 1440 give minutes. Don't forget the unanswered tickets — a NULL reply fails every comparison.",
    explanation:
      "The deadline is `datetime(opened_at, '+N minutes')`, built from the joined SLA row, and a breach is a reply strictly after it — a reply landing exactly on the deadline is on time, so `>=` over-reports. Unanswered tickets have a NULL `first_reply_at`; any comparison with NULL is unknown, so they must be admitted explicitly with `IS NULL` or they vanish from the report. Minutes elapsed come from the difference of Julian days times 1440, rounded to dodge floating-point noise.",
  },
  {
    id: 'sql-pager-coverage-gaps',
    number: 65,
    title: 'Holes in the Pager Rotation',
    difficulty: 'Hard',
    topic: 'Operational Reports',
    statement:
      "`shifts` has `id`, `engineer`, `starts_at` and `ends_at` (timestamps, `starts_at < ends_at`). Shifts may overlap or be nested inside each other.\n\nThe pager is uncovered whenever a shift begins after every earlier-starting shift has ended. For each such moment return `gap_start` (when coverage ran out — the latest `ends_at` among all shifts that started before this one) and `gap_end` (this shift's `starts_at`). A shift that begins exactly when coverage ends is not a gap, and the time before the very first shift is ignored. Rows ordered by `gap_start` ascending.",
    schema: `CREATE TABLE shifts (
  id INTEGER PRIMARY KEY,
  engineer TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO shifts VALUES
  (1, 'ana', '2024-01-01 00:00:00', '2024-01-01 08:00:00'),
  (2, 'bo',  '2024-01-01 08:00:00', '2024-01-01 16:00:00'),
  (3, 'cy',  '2024-01-01 18:00:00', '2024-01-02 00:00:00');`,
      `INSERT INTO shifts VALUES
  (1, 'ana', '2024-02-01 00:00:00', '2024-02-01 12:00:00'),
  (2, 'bo',  '2024-02-01 04:00:00', '2024-02-01 06:00:00'),
  (3, 'cy',  '2024-02-01 14:00:00', '2024-02-01 20:00:00'),
  (4, 'di',  '2024-02-01 16:00:00', '2024-02-01 18:00:00'),
  (5, 'ed',  '2024-02-01 22:00:00', '2024-02-02 06:00:00');`,
      `INSERT INTO shifts VALUES
  (1, 'ana', '2024-03-01 00:00:00', '2024-03-01 10:00:00'),
  (2, 'bo',  '2024-03-01 10:00:00', '2024-03-01 20:00:00'),
  (3, 'cy',  '2024-03-01 15:00:00', '2024-03-02 00:00:00');`,
    ],
    ordered: true,
    solution: `WITH covered AS (
  SELECT starts_at,
         MAX(ends_at) OVER (
           ORDER BY starts_at, id
           ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
         ) AS covered_until
  FROM shifts
)
SELECT covered_until AS gap_start, starts_at AS gap_end
FROM covered
WHERE covered_until < starts_at
ORDER BY gap_start, gap_end;`,
    hint: 'The previous shift alone is not enough when shifts nest — you need the running maximum of ends_at over every earlier-starting shift: MAX(ends_at) OVER (ORDER BY starts_at ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING).',
    explanation:
      "Sort shifts by start and, for each one, compute the latest end among all shifts before it with a running `MAX(ends_at)` window whose frame stops at `1 PRECEDING`; a gap exists when that value is earlier than the current start. `LAG(ends_at)` looks only at the immediately preceding shift, so a short shift nested inside a long one makes it report a gap that the long shift actually covers. The first shift's frame is empty, giving NULL, which the `<` comparison quietly excludes; strict `<` also keeps back-to-back shifts from being reported as zero-length gaps.",
  },
  {
    id: 'sql-parts-to-reorder',
    number: 66,
    title: 'Parts Short Even After Open Purchase Orders',
    difficulty: 'Medium',
    topic: 'Operational Reports',
    statement:
      "`parts` has `sku`, `on_hand` and `reorder_level`. `purchase_orders` has `id`, `sku`, `qty` and `status` — one of `'open'`, `'received'` or `'cancelled'`; only `'open'` orders are still inbound.\n\nA part needs reordering when `on_hand` plus its inbound quantity is **less than** `reorder_level`. Return `sku`, `on_hand`, `inbound` (total open qty, 0 when there is none) and `shortfall` (`reorder_level - on_hand - inbound`) for every such part, ordered by `shortfall` descending, then `sku` ascending.",
    schema: `CREATE TABLE parts (
  sku TEXT PRIMARY KEY,
  on_hand INTEGER NOT NULL,
  reorder_level INTEGER NOT NULL
);
CREATE TABLE purchase_orders (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL,
  status TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO parts VALUES
  ('BOLT-8', 5, 20), ('NUT-8', 40, 20), ('WASHER-8', 0, 10), ('GASKET-2', 3, 5);
INSERT INTO purchase_orders VALUES
  (1, 'BOLT-8', 10, 'open'), (2, 'BOLT-8', 10, 'received'),
  (3, 'WASHER-8', 10, 'cancelled'), (4, 'GASKET-2', 2, 'open');`,
      `INSERT INTO parts VALUES ('A', 1, 10), ('B', 2, 3);
INSERT INTO purchase_orders VALUES
  (1, 'B', 5, 'open'), (2, 'A', 1, 'open'), (3, 'A', 1, 'open');`,
      `INSERT INTO parts VALUES ('X', 0, 4);`,
    ],
    ordered: true,
    solution: `WITH inbound AS (
  SELECT sku, SUM(qty) AS qty
  FROM purchase_orders
  WHERE status = 'open'
  GROUP BY sku
)
SELECT p.sku, p.on_hand,
       COALESCE(i.qty, 0) AS inbound,
       p.reorder_level - p.on_hand - COALESCE(i.qty, 0) AS shortfall
FROM parts p
LEFT JOIN inbound i ON i.sku = p.sku
WHERE p.on_hand + COALESCE(i.qty, 0) < p.reorder_level
ORDER BY shortfall DESC, p.sku;`,
    hint: "Pre-aggregate the open orders per sku in a CTE, LEFT JOIN it to parts and COALESCE the missing sum to 0 — a part with no purchase orders at all is the most urgent one.",
    explanation:
      "Sum only the `'open'` orders per sku first, then LEFT JOIN that summary to `parts` and treat a missing row as 0 with `COALESCE`. An inner join silently drops parts that have no purchase orders — usually the ones most in need of one — and summing every status counts stock that already arrived or never will. The threshold is strict: a part whose on-hand plus inbound exactly meets the level is fine.",
  },
  {
    id: 'sql-busiest-branches-per-territory',
    number: 67,
    title: 'Three Busiest Branches per Territory, Ties Included',
    difficulty: 'Medium',
    topic: 'Operational Reports',
    statement:
      "`branches` has `id`, `name` (unique), `territory` and `visits`.\n\nFor each territory list its three busiest branches by `visits`. Ties share a position and are all included: if two branches tie for third, both appear; if two tie for first, the next branch is third. Return `territory`, `name`, `visits` and `rank_no` (1 for the busiest), ordered by `territory` ascending, `visits` descending, then `name` ascending.",
    schema: `CREATE TABLE branches (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  territory TEXT NOT NULL,
  visits INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO branches VALUES
  (1, 'Harbor', 'East', 500), (2, 'Mill', 'East', 450), (3, 'Ridge', 'East', 450),
  (4, 'Cove', 'East', 300), (5, 'Pine', 'East', 100),
  (6, 'Dell', 'West', 200), (7, 'Fork', 'West', 200);`,
      `INSERT INTO branches VALUES
  (1, 'Arbor', 'North', 10), (2, 'Brook', 'North', 9), (3, 'Cliff', 'North', 8),
  (4, 'Dale', 'North', 8), (5, 'Ember', 'North', 7);`,
      `INSERT INTO branches VALUES
  (1, 'Peak', 'South', 5), (2, 'Quarry', 'South', 5), (3, 'Reef', 'South', 4),
  (4, 'Trail', 'South', 3), (5, 'Upland', 'South', 2);`,
    ],
    ordered: true,
    solution: `WITH ranked AS (
  SELECT territory, name, visits,
         RANK() OVER (PARTITION BY territory ORDER BY visits DESC) AS rank_no
  FROM branches
)
SELECT territory, name, visits, rank_no
FROM ranked
WHERE rank_no <= 3
ORDER BY territory, visits DESC, name;`,
    hint: 'Three ranking functions, three different tie behaviours. Which one gives tied rows the same number and then skips ahead?',
    explanation:
      "`RANK()` is the function that matches the stated rule: tied branches share a position and the following branch's rank jumps past them, so a tie for third lets both through and a tie for first leaves room for exactly one more. `ROW_NUMBER()` breaks ties arbitrarily and would drop one of the tied-third branches; `DENSE_RANK()` doesn't skip, so a tie for first would let a fourth branch in. The partition is essential — without it the ranks run across all territories.",
  },
  {
    id: 'sql-work-order-age-buckets',
    number: 68,
    title: 'Open Work Orders by Age',
    difficulty: 'Medium',
    topic: 'Operational Reports',
    statement:
      "`work_orders` has `id`, `opened_on` (`YYYY-MM-DD`, never later than the report date) and `closed_on` (NULL while open).\n\nReport the backlog as of `'2024-06-30'`. An open order's age is the number of days from `opened_on` to the report date. Group open orders into four buckets — `'0-7 days'` (age 0–7), `'8-30 days'`, `'31-90 days'` and `'over 90 days'` — and return `bucket` and `open_orders` for **all four** buckets, with 0 where none fall in. Rows ordered by bucket age ascending — youngest bucket first, `'over 90 days'` last.",
    schema: `CREATE TABLE work_orders (
  id INTEGER PRIMARY KEY,
  opened_on TEXT NOT NULL,
  closed_on TEXT
);`,
    datasets: [
      `INSERT INTO work_orders VALUES
  (1, '2024-06-28', NULL), (2, '2024-06-01', NULL), (3, '2024-04-15', NULL),
  (4, '2024-01-10', NULL), (5, '2024-06-29', '2024-06-30'), (6, '2024-06-23', NULL);`,
      `INSERT INTO work_orders VALUES
  (1, '2024-06-22', NULL), (2, '2024-06-30', NULL), (3, '2024-05-31', NULL),
  (4, '2024-04-01', '2024-05-01');`,
      `INSERT INTO work_orders VALUES
  (1, '2024-03-31', NULL), (2, '2024-04-01', NULL);`,
    ],
    ordered: true,
    solution: `WITH buckets(sort_no, bucket, lo, hi) AS (
  VALUES (1, '0-7 days', 0, 7),
         (2, '8-30 days', 8, 30),
         (3, '31-90 days', 31, 90),
         (4, 'over 90 days', 91, 1000000)
),
aged AS (
  SELECT CAST(julianday('2024-06-30') - julianday(opened_on) AS INTEGER) AS age
  FROM work_orders
  WHERE closed_on IS NULL
)
SELECT b.bucket, COUNT(a.age) AS open_orders
FROM buckets b
LEFT JOIN aged a ON a.age BETWEEN b.lo AND b.hi
GROUP BY b.sort_no, b.bucket
ORDER BY b.sort_no;`,
    hint: 'A CASE expression only labels rows that exist — to always show four buckets, define them as rows (a VALUES CTE with a sort key and bounds) and LEFT JOIN the aged orders onto them.',
    explanation:
      "Grouping by a `CASE` label only produces buckets that have at least one order, so an empty bucket disappears and the report changes shape from run to run. Defining the buckets as a small `VALUES` table with a numeric `sort_no` and inclusive `lo`/`hi` bounds fixes both problems: a LEFT JOIN keeps empty buckets at `COUNT(a.age) = 0`, and ordering by `sort_no` avoids the alphabetical trap where `'31-90 days'` sorts before `'8-30 days'`. Watch the boundaries — an order opened 7 days ago belongs to the first bucket.",
  },
  {
    id: 'sql-hourly-failure-rate',
    number: 69,
    title: 'Hourly Failure Rate per Service',
    difficulty: 'Easy',
    topic: 'Operational Reports',
    statement:
      "`requests` logs API calls: `id`, `service`, `requested_at` (timestamp) and `status` (HTTP status code). A request *failed* when `status` is 500 or higher.\n\nReturn `service`, `hour` (formatted `YYYY-MM-DD HH`), `total`, `failed` and `error_pct` — failed as a percentage of total, `ROUND`ed to 2 decimals — for every service and hour with at least one request. Rows ordered by `service` ascending, then `hour` ascending.",
    schema: `CREATE TABLE requests (
  id INTEGER PRIMARY KEY,
  service TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  status INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO requests VALUES
  (1, 'auth', '2024-01-01 10:05:00', 200), (2, 'auth', '2024-01-01 10:50:00', 503),
  (3, 'auth', '2024-01-01 11:00:00', 200),
  (4, 'cart', '2024-01-01 10:00:00', 404), (5, 'cart', '2024-01-01 10:30:00', 500);`,
      `INSERT INTO requests VALUES
  (1, 'api', '2024-02-01 09:00:00', 200),
  (2, 'api', '2024-02-02 09:00:00', 502), (3, 'api', '2024-02-02 09:30:00', 200),
  (4, 'api', '2024-02-02 09:45:00', 200);`,
      `INSERT INTO requests VALUES
  (1, 'img', '2024-03-05 23:59:00', 500), (2, 'img', '2024-03-06 00:00:00', 200),
  (3, 'img', '2024-03-06 00:01:00', 500);`,
    ],
    ordered: true,
    solution: `SELECT service,
       strftime('%Y-%m-%d %H', requested_at) AS hour,
       COUNT(*) AS total,
       SUM(CASE WHEN status >= 500 THEN 1 ELSE 0 END) AS failed,
       ROUND(SUM(CASE WHEN status >= 500 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS error_pct
FROM requests
GROUP BY service, hour
ORDER BY service, hour;`,
    hint: "Truncate the timestamp to the hour with strftime('%Y-%m-%d %H', …) and group on that — keep the date in the key or the same hour on different days merges.",
    explanation:
      "The bucket key is the timestamp truncated to the hour; `strftime('%Y-%m-%d %H', …)` keeps the date so 09:00 on two different days stays separate, while `%H` alone would fold them together. Failures are counted with a conditional `SUM`, and the rate needs `100.0` so the division is done in floating point — `failed * 100 / total` truncates 33.33 to 33. Only 5xx codes are server failures here; a 404 is the client's problem.",
  },

  // ===== Joins & Modelling =====
  {
    id: 'sql-fully-certified-contractors',
    number: 70,
    title: 'Contractors Cleared for Every Requirement of a Job',
    difficulty: 'Hard',
    topic: 'Joins & Modelling',
    statement:
      "`contractors` (`id`, `name`) and `jobs` (`id`, `title`) are linked through two bridge tables: `contractor_certs` (`contractor_id`, `cert`) lists what each contractor holds, and `job_certs` (`job_id`, `cert`) lists what each job requires.\n\nA contractor is cleared for a job when they hold **every** cert the job requires; a job with no requirements clears everyone. Return `job_id` and `contractor_id` for every cleared pairing, ordered by `job_id` ascending, then `contractor_id` ascending.",
    schema: `CREATE TABLE contractors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);
CREATE TABLE contractor_certs (
  contractor_id INTEGER NOT NULL,
  cert TEXT NOT NULL,
  PRIMARY KEY (contractor_id, cert)
);
CREATE TABLE job_certs (
  job_id INTEGER NOT NULL,
  cert TEXT NOT NULL,
  PRIMARY KEY (job_id, cert)
);`,
    datasets: [
      `INSERT INTO contractors VALUES (1, 'Ola'), (2, 'Ben'), (3, 'Cy');
INSERT INTO jobs VALUES (10, 'Rooftop HVAC'), (11, 'Basement wiring');
INSERT INTO job_certs VALUES (10, 'heights'), (10, 'refrigerant'), (11, 'electrical');
INSERT INTO contractor_certs VALUES
  (1, 'heights'), (1, 'refrigerant'), (1, 'electrical'), (2, 'heights'), (3, 'electrical');`,
      `INSERT INTO contractors VALUES (1, 'Ada'), (2, 'Bix');
INSERT INTO jobs VALUES (20, 'Paint'), (21, 'Lift');
INSERT INTO job_certs VALUES (21, 'crane');
INSERT INTO contractor_certs VALUES (2, 'crane'), (2, 'heights');`,
      `INSERT INTO contractors VALUES (1, 'Xo'), (2, 'Yu');
INSERT INTO jobs VALUES (1, 'Weld');
INSERT INTO job_certs VALUES (1, 'welding'), (1, 'confined');
INSERT INTO contractor_certs VALUES (1, 'welding'), (2, 'confined');`,
    ],
    ordered: true,
    solution: `SELECT j.id AS job_id, c.id AS contractor_id
FROM jobs j
CROSS JOIN contractors c
WHERE NOT EXISTS (
  SELECT 1
  FROM job_certs jc
  WHERE jc.job_id = j.id
    AND NOT EXISTS (
      SELECT 1 FROM contractor_certs cc
      WHERE cc.contractor_id = c.id AND cc.cert = jc.cert
    )
)
ORDER BY job_id, contractor_id;`,
    hint: '"Holds every required cert" is the same as "there is no required cert they lack". Pair every job with every contractor, then exclude pairs where such a missing cert exists.',
    explanation:
      "This is relational division: start from every (job, contractor) pair and keep those for which no required cert is missing — a double `NOT EXISTS`. Joining the bridges on `cert` and keeping any match clears a contractor who holds just one of several requirements. The count-matching alternative (`COUNT(matched) = COUNT(required)`) works when it's driven correctly, but it cannot produce rows for a job with zero requirements, which the double-negative handles for free.",
  },
  {
    id: 'sql-expense-signoff-chain',
    number: 71,
    title: 'Expense Sign-off Chain',
    difficulty: 'Medium',
    topic: 'Joins & Modelling',
    statement:
      "`staff` has `id`, `name` and `manager_id` (NULL at the top). An expense claim is signed off by the claimant's manager, then that person's manager, then theirs — up to three levels.\n\nFor every staff member return `id`, `name`, `approver_1`, `approver_2` and `approver_3` — the *names* of the manager, the manager's manager and the next one up, with NULL wherever the chain runs out. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE staff (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER
);`,
    datasets: [
      `INSERT INTO staff VALUES
  (1, 'Rae', NULL), (2, 'Sam', 1), (3, 'Tia', 2), (4, 'Ugo', 3), (5, 'Vic', 4);`,
      `INSERT INTO staff VALUES
  (1, 'Kim', NULL), (2, 'Lee', NULL), (3, 'Mo', 2);`,
      `INSERT INTO staff VALUES
  (7, 'Zed', 9), (9, 'Yan', NULL), (8, 'Xu', 7);`,
    ],
    ordered: true,
    solution: `SELECT s.id, s.name,
       m1.name AS approver_1,
       m2.name AS approver_2,
       m3.name AS approver_3
FROM staff s
LEFT JOIN staff m1 ON m1.id = s.manager_id
LEFT JOIN staff m2 ON m2.id = m1.manager_id
LEFT JOIN staff m3 ON m3.id = m2.manager_id
ORDER BY s.id;`,
    hint: 'Alias the same table once per level and chain the joins: each level joins on the previous alias’s manager_id, and every join must be LEFT so short chains keep their row.',
    explanation:
      "A fixed-depth hierarchy is a chain of self-joins: `m1` is the claimant's manager, `m2` joins on `m1.manager_id`, `m3` on `m2.manager_id`. Each join must be a LEFT JOIN, otherwise anyone without three levels above them — including the top of the tree — disappears. A common slip is joining every level back to `s.manager_id`, which just repeats the first approver in all three columns.",
  },
  {
    id: 'sql-latest-parcel-scan',
    number: 72,
    title: 'Where Each Parcel Was Last Seen',
    difficulty: 'Easy',
    topic: 'Joins & Modelling',
    statement:
      "`scans` records parcel events: `id`, `parcel`, `status` and `scanned_at`. Two scans of the same parcel can share a timestamp; when they do, the one with the higher `id` is the later event.\n\nReturn `parcel`, `status` and `scanned_at` of each parcel's most recent scan — one row per parcel — ordered by `parcel` ascending.",
    schema: `CREATE TABLE scans (
  id INTEGER PRIMARY KEY,
  parcel TEXT NOT NULL,
  status TEXT NOT NULL,
  scanned_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO scans VALUES
  (1, 'PK-1', 'received', '2024-01-01 08:00:00'),
  (2, 'PK-1', 'in transit', '2024-01-01 12:00:00'),
  (3, 'PK-2', 'received', '2024-01-02 08:00:00'),
  (4, 'PK-1', 'delivered', '2024-01-02 09:00:00');`,
      `INSERT INTO scans VALUES
  (1, 'A', 'received', '2024-02-01 08:00:00'),
  (2, 'A', 'sorted', '2024-02-01 08:00:00'),
  (3, 'B', 'lost', '2024-02-01 08:00:00');`,
      `INSERT INTO scans VALUES
  (5, 'Z', 'out for delivery', '2024-03-03 07:00:00'),
  (6, 'Z', 'received', '2024-03-01 07:00:00');`,
    ],
    ordered: true,
    solution: `WITH ranked AS (
  SELECT parcel, status, scanned_at,
         ROW_NUMBER() OVER (
           PARTITION BY parcel ORDER BY scanned_at DESC, id DESC
         ) AS rn
  FROM scans
)
SELECT parcel, status, scanned_at
FROM ranked
WHERE rn = 1
ORDER BY parcel;`,
    hint: 'Number the scans within each parcel from newest to oldest (with id as the tiebreak) and keep number 1.',
    explanation:
      "`ROW_NUMBER() OVER (PARTITION BY parcel ORDER BY scanned_at DESC, id DESC)` assigns 1 to exactly one row per parcel, so `rn = 1` is the latest scan even when timestamps tie — the `id DESC` tiebreak decides. Joining back on `MAX(scanned_at)` returns both rows of a tie, and ordering the window ascending picks the *first* scan instead of the last. This latest-per-entity shape is the everyday way to get a current-state view out of an event log.",
  },
  {
    id: 'sql-missing-invoice-numbers',
    number: 73,
    title: 'First Missing Number After Each Invoice Run',
    difficulty: 'Medium',
    topic: 'Joins & Modelling',
    statement:
      "`invoices` has `no` (a unique integer that should increase without gaps) and `issued_on`. Some numbers were skipped.\n\nReturn `gap_start` — for every invoice number `n` where `n + 1` does not exist and `n` is not the largest number in the table, the value `n + 1`. Rows ordered by `gap_start` ascending.",
    schema: `CREATE TABLE invoices (
  no INTEGER PRIMARY KEY,
  issued_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO invoices VALUES
  (1, '2024-01-02'), (2, '2024-01-03'), (3, '2024-01-04'),
  (5, '2024-01-06'), (6, '2024-01-07'), (9, '2024-01-10');`,
      `INSERT INTO invoices VALUES
  (10, '2024-02-01'), (11, '2024-02-02'), (12, '2024-02-03');`,
      `INSERT INTO invoices VALUES
  (100, '2024-03-01'), (103, '2024-03-04'), (104, '2024-03-05'), (110, '2024-03-11');`,
    ],
    ordered: true,
    solution: `SELECT a.no + 1 AS gap_start
FROM invoices a
LEFT JOIN invoices b ON b.no = a.no + 1
WHERE b.no IS NULL
  AND a.no < (SELECT MAX(no) FROM invoices)
ORDER BY gap_start;`,
    hint: 'Self-join each number to its successor (b.no = a.no + 1); where the successor is missing you have found the start of a gap — but exclude the very last number, which has no successor by design.',
    explanation:
      "An anti-join answers \"which rows have no neighbour\": LEFT JOIN the table to itself on `b.no = a.no + 1` and keep the rows where the right side is NULL. The largest number always fails that test, so it must be excluded with a `MAX` filter or the report invents a gap after the final invoice. The value reported is `n + 1`, the first *missing* number, not the last present one.",
  },
  {
    id: 'sql-handset-attribute-pivot',
    number: 74,
    title: 'Flatten Handset Attributes',
    difficulty: 'Medium',
    topic: 'Joins & Modelling',
    statement:
      "`handsets` has `id` and `model`. `attributes` stores one row per (handset, key): `handset_id`, `key` and `value`, where `key` is one of `'color'`, `'storage_gb'` or `'carrier'` — a handset may have any subset of them.\n\nReturn one row per handset with `id`, `model`, `color`, `storage_gb` and `carrier` (the matching `value`, or NULL when the key is absent), ordered by `id` ascending.",
    schema: `CREATE TABLE handsets (
  id INTEGER PRIMARY KEY,
  model TEXT NOT NULL
);
CREATE TABLE attributes (
  handset_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (handset_id, key)
);`,
    datasets: [
      `INSERT INTO handsets VALUES (1, 'Nova 12'), (2, 'Slab X'), (3, 'Pebble Mini');
INSERT INTO attributes VALUES
  (1, 'color', 'Blue'), (1, 'storage_gb', '128'), (1, 'carrier', 'Vantel'),
  (2, 'color', 'Black'), (2, 'storage_gb', '256'),
  (3, 'carrier', 'Orbit');`,
      `INSERT INTO handsets VALUES (1, 'Zephyr'), (2, 'Wren');
INSERT INTO attributes VALUES (2, 'color', 'Red');`,
      `INSERT INTO handsets VALUES (4, 'Quill');
INSERT INTO attributes VALUES
  (4, 'storage_gb', '64'), (4, 'carrier', 'Vantel'), (4, 'color', 'Green');`,
    ],
    ordered: true,
    solution: `SELECT h.id, h.model,
       MAX(CASE WHEN a.key = 'color' THEN a.value END) AS color,
       MAX(CASE WHEN a.key = 'storage_gb' THEN a.value END) AS storage_gb,
       MAX(CASE WHEN a.key = 'carrier' THEN a.value END) AS carrier
FROM handsets h
LEFT JOIN attributes a ON a.handset_id = h.id
GROUP BY h.id, h.model
ORDER BY h.id;`,
    hint: 'Pivot with conditional aggregation: one MAX(CASE WHEN key = … THEN value END) per output column, grouped by handset. LEFT JOIN so handsets with no attributes still get a row.',
    explanation:
      "An entity–attribute–value table is turned back into columns with conditional aggregation: after joining, each handset's attribute rows collapse under `GROUP BY`, and `MAX(CASE WHEN key = 'color' THEN value END)` plucks the one value per key (the others are NULL and ignored by `MAX`). The join must be LEFT so a handset with no attributes still yields a row of NULLs. `SUM` is the wrong aggregate for text — it coerces `'Blue'` to 0 — and three separate inner joins on the attribute table would require every key to be present.",
  },
  {
    id: 'sql-price-in-effect-on-order-date',
    number: 75,
    title: 'Price in Effect When Each Order Was Placed',
    difficulty: 'Hard',
    topic: 'Joins & Modelling',
    statement:
      "`price_list` holds effective-dated prices: `sku`, `effective_from` (`YYYY-MM-DD`) and `price`; a price applies from its `effective_from` (inclusive) until the sku's next later `effective_from`. `orders` has `id`, `sku` and `ordered_on`.\n\nFor every order return `id` and `price` — the sku's price in effect on `ordered_on`, or NULL when no price row for that sku starts on or before that date. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE price_list (
  sku TEXT NOT NULL,
  effective_from TEXT NOT NULL,
  price REAL NOT NULL,
  PRIMARY KEY (sku, effective_from)
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL,
  ordered_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO price_list VALUES
  ('MUG', '2024-01-01', 8.0), ('MUG', '2024-03-01', 9.5), ('CAP', '2024-02-15', 15.0);
INSERT INTO orders VALUES
  (1, 'MUG', '2024-02-10'), (2, 'MUG', '2024-03-01'), (3, 'CAP', '2024-02-01'), (4, 'CAP', '2024-05-05');`,
      `INSERT INTO price_list VALUES
  ('PEN', '2023-12-31', 1.0), ('PEN', '2024-01-31', 1.2), ('PEN', '2024-06-30', 1.5),
  ('INK', '2024-01-01', 5.0);
INSERT INTO orders VALUES
  (1, 'PEN', '2024-01-30'), (2, 'PEN', '2024-12-01'), (3, 'INK', '2024-01-01');`,
      `INSERT INTO price_list VALUES ('TAPE', '2024-01-01', 2.0);
INSERT INTO orders VALUES (1, 'GLUE', '2024-02-01'), (2, 'TAPE', '2024-01-01');`,
    ],
    ordered: true,
    solution: `SELECT o.id,
       (SELECT p.price
          FROM price_list p
         WHERE p.sku = o.sku
           AND p.effective_from <= o.ordered_on
         ORDER BY p.effective_from DESC
         LIMIT 1) AS price
FROM orders o
ORDER BY o.id;`,
    hint: 'For each order you want the single price row for that sku with the latest effective_from that is <= ordered_on — a correlated subquery with ORDER BY … DESC LIMIT 1 says exactly that.',
    explanation:
      "An effective-dated lookup is \"the newest version that had already started\": correlate on `sku`, keep versions with `effective_from <= ordered_on`, sort newest first and take one. Joining on the `<=` condition alone returns every older version too, duplicating orders; using `<` instead of `<=` misses a price that took effect on the order date itself. The `MAX(effective_from)` must be computed per sku — a global maximum picks up other products' dates — and an order with no qualifying version simply gets NULL from the empty subquery.",
  },
  // ===== Billing & Ledgers =====
  {
    id: 'sql-wallet-balance-after-entry',
    number: 76,
    title: 'Wallet Balance After Each Entry',
    difficulty: 'Medium',
    topic: 'Billing & Ledgers',
    statement:
      "A prepaid wallet keeps its history in `wallet_entries` with `id`, `wallet_id`, `posted_at`, `kind` (`'credit'` adds money, `'debit'` takes it out) and `amount_cents`, which is always positive.\n\nReturn `wallet_id`, `id`, `kind`, `amount_cents` and `balance_cents` — the wallet's balance immediately after this entry, counting credits as positive and debits as negative. Several entries can share a `posted_at`; apply them in `id` order. Rows ordered by `wallet_id` ascending, then `posted_at` ascending, then `id` ascending.",
    schema: `CREATE TABLE wallet_entries (
  id INTEGER PRIMARY KEY,
  wallet_id INTEGER NOT NULL,
  posted_at TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO wallet_entries VALUES
  (1, 10, '2024-04-01 09:00:00', 'credit', 5000),
  (2, 10, '2024-04-02 12:30:00', 'debit', 1250),
  (3, 11, '2024-04-02 12:30:00', 'credit', 2000),
  (4, 10, '2024-04-02 12:30:00', 'debit', 700),
  (5, 11, '2024-04-03 08:00:00', 'debit', 2000),
  (6, 10, '2024-04-05 18:45:00', 'credit', 300);`,
      `INSERT INTO wallet_entries VALUES
  (1, 3, '2024-01-10 10:00:00', 'credit', 1000),
  (2, 3, '2024-01-11 10:00:00', 'debit', 1500),
  (3, 3, '2024-01-12 10:00:00', 'debit', 200),
  (4, 3, '2024-01-13 10:00:00', 'credit', 900);`,
      `INSERT INTO wallet_entries VALUES
  (9, 1, '2024-06-01 00:00:00', 'credit', 100),
  (2, 1, '2024-05-30 00:00:00', 'credit', 250),
  (5, 2, '2024-05-30 00:00:00', 'credit', 250),
  (7, 2, '2024-05-31 00:00:00', 'debit', 50),
  (8, 3, '2024-05-31 00:00:00', 'debit', 50);`,
    ],
    ordered: true,
    solution: `SELECT wallet_id, id, kind, amount_cents,
       SUM(CASE WHEN kind = 'credit' THEN amount_cents ELSE -amount_cents END) OVER (
         PARTITION BY wallet_id
         ORDER BY posted_at, id
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS balance_cents
FROM wallet_entries
ORDER BY wallet_id, posted_at, id;`,
    hint: 'Turn each row into a signed amount with CASE first, then take a running SUM partitioned by wallet and ordered by (posted_at, id).',
    explanation:
      "Ledgers store unsigned amounts plus a direction, so the first step is `CASE WHEN kind = 'credit' THEN amount ELSE -amount END`; the running `SUM(...) OVER (PARTITION BY wallet_id ORDER BY posted_at, id ROWS ...)` then produces the balance after every line. Ordering the window by `posted_at` alone uses the default RANGE frame, so same-timestamp entries become peers and all show the end-of-instant balance — adding `id` (or an explicit ROWS frame) restores a step-by-step balance. Forgetting `PARTITION BY` quietly bleeds one wallet's balance into the next.",
  },
  {
    id: 'sql-invoices-carrying-balance',
    number: 77,
    title: 'Invoices Still Carrying a Balance',
    difficulty: 'Medium',
    topic: 'Billing & Ledgers',
    statement:
      "`invoices` has `id`, `customer_id` and `total_cents`. `payments` has `id`, `invoice_id` and `amount_cents`; an invoice can be paid in several instalments or not at all.\n\nReturn `id`, `total_cents`, `paid_cents` (sum of payments, 0 if none) and `outstanding_cents` (`total_cents - paid_cents`) for every invoice whose outstanding amount is greater than zero. Rows ordered by `outstanding_cents` descending, then `id` ascending.",
    schema: `CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total_cents INTEGER NOT NULL
);
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO invoices VALUES
  (101, 1, 12000),
  (102, 1, 4500),
  (103, 2, 8000),
  (104, 3, 2500),
  (105, 3, 9900);
INSERT INTO payments VALUES
  (1, 101, 5000),
  (2, 101, 3000),
  (3, 102, 4500),
  (4, 103, 8000),
  (5, 105, 100);`,
      `INSERT INTO invoices VALUES
  (1, 7, 1000),
  (2, 7, 2000),
  (3, 8, 3000);
INSERT INTO payments VALUES
  (1, 1, 1000),
  (2, 2, 2000),
  (3, 3, 3000);`,
      `INSERT INTO invoices VALUES
  (20, 4, 6000),
  (21, 4, 6000),
  (22, 5, 6000);
INSERT INTO payments VALUES
  (1, 20, 1000),
  (2, 20, 1000),
  (3, 20, 1000),
  (4, 21, 6500);`,
    ],
    ordered: true,
    solution: `SELECT i.id,
       i.total_cents,
       COALESCE(SUM(p.amount_cents), 0) AS paid_cents,
       i.total_cents - COALESCE(SUM(p.amount_cents), 0) AS outstanding_cents
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
GROUP BY i.id, i.total_cents
HAVING i.total_cents - COALESCE(SUM(p.amount_cents), 0) > 0
ORDER BY outstanding_cents DESC, i.id;`,
    hint: 'An invoice with zero payments has no matching payment row — a LEFT JOIN keeps it, and COALESCE turns its NULL sum into 0.',
    explanation:
      "The invoices that most need chasing are the ones with no payment at all, and an inner join throws exactly those away. `LEFT JOIN` keeps them, but `SUM` over a group of NULLs is NULL, so `total - NULL > 0` is unknown and the row is still filtered out — `COALESCE(SUM(...), 0)` is what actually makes it appear. Overpaid invoices produce a negative outstanding amount and are correctly excluded by the `> 0` test.",
  },
  {
    id: 'sql-prorated-seat-charge',
    number: 78,
    title: 'Prorated Charge for a Mid-Cycle Seat',
    difficulty: 'Hard',
    topic: 'Billing & Ledgers',
    statement:
      "`seat_terms` records a per-seat licence within one billing cycle: `id`, `account_id`, `cycle_price_cents` (price for the whole cycle), `cycle_start`, `cycle_end` (exclusive), `active_from` and `active_to` (exclusive; NULL means the seat is still active). Dates are `YYYY-MM-DD` strings.\n\nA seat is billed only for the days it was active *inside* the cycle: from the later of `active_from` and `cycle_start` up to (not including) the earlier of `active_to` and `cycle_end`. If that range is empty or negative the seat gets 0 days.\n\nReturn `id`, `active_days` and `charge_cents` = `cycle_price_cents * active_days / cycle_days` rounded to the nearest whole cent (`cycle_days` is the number of days in the cycle). Include every row. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE seat_terms (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  cycle_price_cents INTEGER NOT NULL,
  cycle_start TEXT NOT NULL,
  cycle_end TEXT NOT NULL,
  active_from TEXT NOT NULL,
  active_to TEXT
);`,
    datasets: [
      `INSERT INTO seat_terms VALUES
  (1, 50, 3000, '2024-04-01', '2024-05-01', '2024-04-01', NULL),
  (2, 50, 3000, '2024-04-01', '2024-05-01', '2024-04-11', NULL),
  (3, 50, 3000, '2024-04-01', '2024-05-01', '2024-03-15', '2024-04-21'),
  (4, 51, 3000, '2024-04-01', '2024-05-01', '2024-04-10', '2024-04-17'),
  (5, 51, 3000, '2024-04-01', '2024-05-01', '2024-05-03', NULL);`,
      `INSERT INTO seat_terms VALUES
  (1, 9, 9999, '2024-02-01', '2024-03-01', '2024-01-01', NULL),
  (2, 9, 9999, '2024-02-01', '2024-03-01', '2024-02-15', '2024-02-16'),
  (3, 9, 9999, '2024-02-01', '2024-03-01', '2024-02-20', '2024-03-15'),
  (4, 9, 9999, '2024-02-01', '2024-03-01', '2024-01-05', '2024-01-30');`,
      `INSERT INTO seat_terms VALUES
  (7, 2, 700, '2024-07-01', '2024-07-08', '2024-07-03', '2024-07-06'),
  (8, 2, 700, '2024-07-01', '2024-07-08', '2024-06-30', '2024-07-08'),
  (9, 3, 700, '2024-07-01', '2024-07-08', '2024-07-07', NULL);`,
    ],
    ordered: true,
    solution: `SELECT id,
       active_days,
       CAST(ROUND(cycle_price_cents * 1.0 * active_days / cycle_days) AS INTEGER) AS charge_cents
FROM (
  SELECT id,
         cycle_price_cents,
         CAST(julianday(cycle_end) - julianday(cycle_start) AS INTEGER) AS cycle_days,
         MAX(0, CAST(julianday(MIN(COALESCE(active_to, cycle_end), cycle_end))
                   - julianday(MAX(active_from, cycle_start)) AS INTEGER)) AS active_days
  FROM seat_terms
)
ORDER BY id;`,
    hint: 'Clamp both ends to the cycle with the two-argument MAX/MIN functions, take the julianday difference, and floor negatives to zero before multiplying.',
    explanation:
      "Proration is clamp-then-count: the billable window is `[MAX(active_from, cycle_start), MIN(COALESCE(active_to, cycle_end), cycle_end))`, and `julianday` turns the two endpoints into a day count. Two classic mistakes are forgetting to clamp the start (a seat that existed before the cycle gets charged for days outside it) and treating `active_to` as inclusive, which bills an extra day. Multiply by `1.0` before dividing — integer division truncates instead of rounding, and half-cent errors become customer tickets.",
  },
  {
    id: 'sql-charges-net-of-refunds',
    number: 79,
    title: 'Charges Net of Refunds per Customer',
    difficulty: 'Medium',
    topic: 'Billing & Ledgers',
    statement:
      "`charges` has `id`, `customer_id` and `amount_cents`. `refunds` has `id`, `charge_id` and `amount_cents`; one charge can be refunded in several pieces, and most charges are never refunded.\n\nReturn one row per customer who has at least one charge: `customer_id`, `gross_cents` (sum of charges), `refunded_cents` (sum of refunds against those charges, 0 if none) and `net_cents` (`gross_cents - refunded_cents`). Rows can be in any order.",
    schema: `CREATE TABLE charges (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL
);
CREATE TABLE refunds (
  id INTEGER PRIMARY KEY,
  charge_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO charges VALUES
  (1, 100, 5000),
  (2, 100, 2000),
  (3, 200, 8000),
  (4, 300, 1500);
INSERT INTO refunds VALUES
  (1, 1, 1000),
  (2, 1, 1500),
  (3, 3, 8000);`,
      `INSERT INTO charges VALUES
  (1, 1, 999),
  (2, 2, 4999),
  (3, 2, 4999);
INSERT INTO refunds VALUES
  (1, 2, 4999),
  (2, 3, 4999);`,
      `INSERT INTO charges VALUES
  (10, 5, 1200),
  (11, 5, 1200),
  (12, 6, 3300);`,
    ],
    solution: `SELECT c.customer_id,
       SUM(c.amount_cents) AS gross_cents,
       SUM(COALESCE(r.refunded_cents, 0)) AS refunded_cents,
       SUM(c.amount_cents) - SUM(COALESCE(r.refunded_cents, 0)) AS net_cents
FROM charges c
LEFT JOIN (
  SELECT charge_id, SUM(amount_cents) AS refunded_cents
  FROM refunds
  GROUP BY charge_id
) r ON r.charge_id = c.id
GROUP BY c.customer_id;`,
    hint: 'Aggregate refunds down to one row per charge before joining, otherwise a charge with two refunds is counted twice in the gross.',
    explanation:
      "Joining `charges` straight to `refunds` fans out: a charge with two partial refunds appears twice, so its amount is double-counted in `gross_cents`. Pre-aggregating refunds to one row per charge keeps the join one-to-one, and a `LEFT JOIN` plus `COALESCE` keeps customers who were never refunded with a 0 instead of dropping them or producing a NULL net. This shape — aggregate the many side first, then join — is the standard fix for any two-fact-table report.",
  },
  {
    id: 'sql-journal-entries-out-of-balance',
    number: 80,
    title: "Journal Entries That Don't Balance",
    difficulty: 'Easy',
    topic: 'Billing & Ledgers',
    statement:
      "A double-entry ledger stores each line in `journal_lines` with `id`, `entry_id`, `side` (`'debit'` or `'credit'`) and `amount_cents` (always positive). Every entry must have equal total debits and total credits.\n\nReturn `entry_id`, `debit_cents` and `credit_cents` for every entry where the two totals differ (an entry with lines on only one side counts as 0 on the other). Rows ordered by `entry_id` ascending.",
    schema: `CREATE TABLE journal_lines (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL,
  side TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO journal_lines VALUES
  (1, 1001, 'debit', 5000),
  (2, 1001, 'credit', 5000),
  (3, 1002, 'debit', 3000),
  (4, 1002, 'credit', 2000),
  (5, 1002, 'credit', 1000),
  (6, 1003, 'debit', 750),
  (7, 1003, 'credit', 700),
  (8, 1004, 'credit', 120);`,
      `INSERT INTO journal_lines VALUES
  (1, 1, 'debit', 100),
  (2, 1, 'credit', 100),
  (3, 2, 'debit', 40),
  (4, 2, 'debit', 60),
  (5, 2, 'credit', 100);`,
      `INSERT INTO journal_lines VALUES
  (1, 50, 'debit', 900),
  (2, 51, 'debit', 10),
  (3, 51, 'credit', 20),
  (4, 51, 'credit', 30),
  (5, 51, 'debit', 40),
  (6, 52, 'credit', 5),
  (7, 52, 'debit', 5);`,
    ],
    ordered: true,
    solution: `SELECT entry_id,
       SUM(CASE WHEN side = 'debit' THEN amount_cents ELSE 0 END) AS debit_cents,
       SUM(CASE WHEN side = 'credit' THEN amount_cents ELSE 0 END) AS credit_cents
FROM journal_lines
GROUP BY entry_id
HAVING debit_cents <> credit_cents
ORDER BY entry_id;`,
    hint: 'Conditional sums — SUM(CASE WHEN side = ... THEN amount ELSE 0 END) — give both totals in one pass over the group.',
    explanation:
      "Two conditional sums in a single `GROUP BY` produce the debit and credit totals side by side, and `HAVING` compares them. Because amounts are stored unsigned, `SUM(amount_cents) <> 0` flags every entry, and counting lines (`COUNT(*) <> 2`) misses an unbalanced pair while wrongly flagging a balanced three-line split. The `ELSE 0` matters: it guarantees a one-sided entry shows 0 rather than NULL, so the inequality still evaluates to true.",
  },
  {
    id: 'sql-dunning-email-candidates',
    number: 81,
    title: 'Who Gets the Dunning Email Today',
    difficulty: 'Medium',
    topic: 'Billing & Ledgers',
    statement:
      "Today is `2024-06-30`. `invoices` has `id`, `account_id`, `due_on` and `total_cents`; `payments` has `id`, `invoice_id`, `amount_cents`; `reminders` has `id`, `invoice_id`, `sent_on`.\n\nAn invoice gets a dunning email when all three hold: it still has an outstanding amount (`total_cents` minus payments, greater than 0); it was due at least 3 days ago (`due_on` is `2024-06-27` or earlier); and no reminder for it was sent in the last 7 days (no `sent_on` of `2024-06-23` or later). Older reminders don't block a new one.\n\nReturn `invoice_id`, `account_id` and `outstanding_cents`. Rows ordered by `invoice_id` ascending.",
    schema: `CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  due_on TEXT NOT NULL,
  total_cents INTEGER NOT NULL
);
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL
);
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  sent_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO invoices VALUES
  (1, 10, '2024-06-27', 4000),
  (2, 10, '2024-06-28', 4000),
  (3, 11, '2024-06-01', 9000),
  (4, 12, '2024-06-10', 2500),
  (5, 12, '2024-05-20', 6000),
  (6, 13, '2024-06-15', 1000);
INSERT INTO payments VALUES
  (1, 3, 9000),
  (2, 4, 1000),
  (3, 6, 400);
INSERT INTO reminders VALUES
  (1, 5, '2024-06-22'),
  (2, 6, '2024-06-23');`,
      `INSERT INTO invoices VALUES
  (1, 1, '2024-06-20', 500),
  (2, 2, '2024-06-20', 500),
  (3, 3, '2024-06-20', 500);
INSERT INTO payments VALUES
  (1, 1, 200),
  (2, 1, 300);
INSERT INTO reminders VALUES
  (1, 2, '2024-06-01'),
  (2, 2, '2024-06-29'),
  (3, 3, '2024-06-10');`,
      `INSERT INTO invoices VALUES
  (40, 7, '2024-06-26', 12000),
  (41, 7, '2024-06-30', 12000),
  (42, 8, '2024-04-01', 300);
INSERT INTO payments VALUES
  (1, 40, 12000);
INSERT INTO reminders VALUES
  (1, 42, '2024-06-16');`,
    ],
    ordered: true,
    solution: `SELECT i.id AS invoice_id,
       i.account_id,
       i.total_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0) AS outstanding_cents
FROM invoices i
WHERE i.due_on <= date('2024-06-30', '-3 days')
  AND i.total_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0) > 0
  AND NOT EXISTS (
    SELECT 1 FROM reminders r
    WHERE r.invoice_id = i.id
      AND r.sent_on >= date('2024-06-30', '-7 days')
  )
ORDER BY i.id;`,
    hint: 'Three independent conditions: a scalar subquery for the paid total, a date comparison for overdue, and NOT EXISTS restricted to recent reminders.',
    explanation:
      "Dunning logic is a chain of filters, and each one has a trap. The outstanding amount needs `COALESCE` because an invoice with no payments has a NULL sum; the overdue test is a plain date comparison but the cutoff must be *at least* 3 days, not just `due_on < today`; and the reminder check must be scoped to the last 7 days — `NOT IN (SELECT invoice_id FROM reminders)` suppresses every invoice that was ever reminded, so overdue accounts never hear from you again.",
  },
  {
    id: 'sql-revenue-recognized-by-month',
    number: 82,
    title: 'Revenue Recognized Each Month',
    difficulty: 'Hard',
    topic: 'Billing & Ledgers',
    statement:
      "Customers prepay for a term. `prepaid_plans` has `id`, `amount_cents` (paid up front), `term_months` and `starts_on` (always the first day of a month). Revenue is recognized evenly: each of the `term_months` months starting at `starts_on` recognizes `amount_cents / term_months` (always a whole number).\n\nReturn `month` as `'YYYY-MM'` and `recognized_cents` — the total recognized across all plans in that month. Only months where something is recognized appear. Rows ordered by `month` ascending.",
    schema: `CREATE TABLE prepaid_plans (
  id INTEGER PRIMARY KEY,
  amount_cents INTEGER NOT NULL,
  term_months INTEGER NOT NULL,
  starts_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO prepaid_plans VALUES
  (1, 12000, 12, '2024-01-01'),
  (2, 3000, 3, '2024-02-01'),
  (3, 500, 1, '2024-03-01'),
  (4, 6000, 6, '2024-11-01');`,
      `INSERT INTO prepaid_plans VALUES
  (1, 2400, 2, '2023-12-01'),
  (2, 2400, 2, '2023-12-01'),
  (3, 100, 1, '2024-02-01');`,
      `INSERT INTO prepaid_plans VALUES
  (7, 36000, 24, '2024-06-01'),
  (8, 900, 3, '2024-10-01');`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE sched(id, month_start, n, per_month) AS (
  SELECT id, starts_on, 1, amount_cents / term_months
  FROM prepaid_plans
  UNION ALL
  SELECT s.id, date(s.month_start, '+1 month'), s.n + 1, s.per_month
  FROM sched s
  JOIN prepaid_plans p ON p.id = s.id
  WHERE s.n < p.term_months
)
SELECT strftime('%Y-%m', month_start) AS month,
       SUM(per_month) AS recognized_cents
FROM sched
GROUP BY month
ORDER BY month;`,
    hint: 'Expand each plan into one row per month with a recursive CTE (stop when the month counter reaches term_months), then GROUP BY the month.',
    explanation:
      "Recognizing prepaid revenue means spreading one payment across future months, which a recursive CTE does naturally: the anchor emits month 1 for every plan, and the recursive member adds `+1 month` while the counter is below `term_months`. Using `<=` instead of `<` recognizes one month too many per plan, and grouping the whole `amount_cents` under the start month is the cash-basis number, not the recognized one. This is the core of a deferred-revenue report that finance teams reconcile every close.",
  },

  // ===== Hierarchies & Graphs =====
  {
    id: 'sql-team-depth-and-root',
    number: 83,
    title: 'Team Depth and Top-Level Owner',
    difficulty: 'Medium',
    topic: 'Hierarchies & Graphs',
    statement:
      "`teams` has `id`, `name` and `parent_id` (NULL for a top-level team). The tree can be any depth and there may be several top-level teams.\n\nReturn `id`, `name`, `depth` (0 for a top-level team, 1 for its children, and so on) and `root_name` — the name of the top-level team this team ultimately belongs to (a top-level team is its own root). Rows ordered by `depth` ascending, then `id` ascending.",
    schema: `CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER
);`,
    datasets: [
      `INSERT INTO teams VALUES
  (1, 'Engineering', NULL),
  (2, 'Platform', 1),
  (3, 'Mobile', 1),
  (4, 'iOS', 3),
  (5, 'Android', 3),
  (6, 'Sales', NULL),
  (7, 'EMEA', 6),
  (8, 'Build Tools', 2);`,
      `INSERT INTO teams VALUES
  (10, 'Ops', NULL),
  (11, 'SRE', 10),
  (12, 'On-call', 11),
  (13, 'Pager Rotation', 12),
  (14, 'Runbooks', 13);`,
      `INSERT INTO teams VALUES
  (1, 'Design', NULL),
  (2, 'Research', NULL),
  (3, 'Support', NULL),
  (4, 'Tier 1', 3);`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE tree(id, name, depth, root_name) AS (
  SELECT id, name, 0, name
  FROM teams
  WHERE parent_id IS NULL
  UNION ALL
  SELECT t.id, t.name, tree.depth + 1, tree.root_name
  FROM teams t
  JOIN tree ON t.parent_id = tree.id
)
SELECT id, name, depth, root_name
FROM tree
ORDER BY depth, id;`,
    hint: 'Carry the root name along as a column of the recursive CTE — the anchor sets it to the team\'s own name and the recursive step just copies it down.',
    explanation:
      "The anchor seeds every top-level team with depth 0 and `root_name = name`; each recursive step joins children to the rows found so far, adding one to the depth and copying `root_name` unchanged. Passing values *down* the recursion like this is how you tag every node with an attribute of its ancestor — a self-join to the parent only gives you the immediate parent's name, which is wrong for anything deeper than one level. Depth conventions vary, so read the statement: here the roots are 0.",
  },
  {
    id: 'sql-category-breadcrumbs',
    number: 84,
    title: 'Breadcrumb Path for Every Category',
    difficulty: 'Medium',
    topic: 'Hierarchies & Graphs',
    statement:
      "A storefront's `categories` table has `id`, `name` and `parent_id` (NULL for a root category).\n\nReturn `id` and `path`, where `path` is the names from the root down to this category joined with `' > '` (a space, a greater-than sign, a space), e.g. `Home > Garden > Tools`. A root category's path is just its own name. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER
);`,
    datasets: [
      `INSERT INTO categories VALUES
  (1, 'Home', NULL),
  (2, 'Garden', 1),
  (3, 'Tools', 2),
  (4, 'Kitchen', 1),
  (5, 'Electronics', NULL),
  (6, 'Audio', 5),
  (7, 'Headphones', 6);`,
      `INSERT INTO categories VALUES
  (3, 'Books', NULL),
  (1, 'Fiction', 3),
  (2, 'Sci-Fi', 1),
  (4, 'Space Opera', 2);`,
      `INSERT INTO categories VALUES
  (1, 'Toys', NULL),
  (2, 'Sports', NULL),
  (3, 'Pets', NULL);`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE crumbs(id, path) AS (
  SELECT id, name
  FROM categories
  WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, crumbs.path || ' > ' || c.name
  FROM categories c
  JOIN crumbs ON c.parent_id = crumbs.id
)
SELECT id, path
FROM crumbs
ORDER BY id;`,
    hint: 'Start the recursion at the roots with path = name, and append " > " plus the child\'s name at every step downward.',
    explanation:
      "Walking top-down from the roots lets the path grow by simple concatenation: `parent_path || ' > ' || child_name`. Concatenating in the other order (`child || ' > ' || parent_path`) produces reversed breadcrumbs, and a one-level self-join to the parent stops at `Parent > Child` no matter how deep the tree really is. Materialising paths like this is how category filters and breadcrumb bars are usually served without a recursive query per request.",
  },
  {
    id: 'sql-follow-loops',
    number: 85,
    title: 'Users Caught in a Follow Loop',
    difficulty: 'Hard',
    topic: 'Hierarchies & Graphs',
    statement:
      "`follows` has `follower_id` and `followee_id` — a directed edge meaning the follower sees the followee's posts. A *loop* exists when a user can reach themselves by following edges: `A → B → A`, `A → B → C → A`, or a user who follows themselves.\n\nReturn one column, `user_id`, listing every user who is part of at least one loop. Each user appears once. Rows ordered by `user_id` ascending.",
    schema: `CREATE TABLE follows (
  follower_id INTEGER NOT NULL,
  followee_id INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO follows VALUES
  (1, 2),
  (2, 3),
  (3, 1),
  (4, 1),
  (3, 5),
  (5, 6),
  (7, 8),
  (8, 7);`,
      `INSERT INTO follows VALUES
  (10, 11),
  (11, 12),
  (12, 13),
  (13, 14),
  (14, 11),
  (15, 15),
  (16, 10);`,
      `INSERT INTO follows VALUES
  (1, 2),
  (2, 3),
  (3, 4),
  (4, 5);`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE reach(start_id, node_id) AS (
  SELECT follower_id, followee_id FROM follows
  UNION
  SELECT r.start_id, f.followee_id
  FROM reach r
  JOIN follows f ON f.follower_id = r.node_id
)
SELECT DISTINCT start_id AS user_id
FROM reach
WHERE node_id = start_id
ORDER BY user_id;`,
    hint: 'Compute every (start, reachable) pair with a recursive CTE that uses UNION (not UNION ALL) so revisiting a node adds nothing new — then keep the starts that reach themselves.',
    explanation:
      "On a graph with cycles a `UNION ALL` recursion never terminates, because the same pair keeps being rediscovered. `UNION` de-duplicates the working set, so once `(start, node)` has been seen it is not re-queued and the recursion converges on the full reachability relation; the users in a loop are exactly the starts that reach themselves. Checking only mutual follows misses three-node loops, and \"has both incoming and outgoing edges\" is not the same thing — a user on a chain that merely *feeds into* a loop is not part of it.",
  },
  {
    id: 'sql-referrals-within-two-hops',
    number: 86,
    title: 'Referred Within Two Introductions',
    difficulty: 'Medium',
    topic: 'Hierarchies & Graphs',
    statement:
      "A referral program stores `referrals` with `referrer_id` and `referred_id` (the referrer invited the referred member). Member `1` is running a promotion for their network.\n\nReturn `member_id` and `hops` for every member reachable from member 1 in one hop (invited directly by 1) or two hops (invited by someone 1 invited). `hops` is the *smallest* number of hops, so a member reachable both ways shows `1`. Each member appears once, and member 1 is never listed even if a referral chain leads back to them. Rows ordered by `hops` ascending, then `member_id` ascending.",
    schema: `CREATE TABLE referrals (
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO referrals VALUES
  (1, 2),
  (1, 3),
  (2, 4),
  (3, 4),
  (3, 5),
  (5, 6),
  (2, 3),
  (4, 1);`,
      `INSERT INTO referrals VALUES
  (1, 9),
  (9, 1),
  (9, 10),
  (10, 11);`,
      `INSERT INTO referrals VALUES
  (2, 1),
  (3, 1),
  (1, 7),
  (7, 8),
  (7, 9),
  (8, 2);`,
    ],
    ordered: true,
    solution: `WITH one AS (
  SELECT referred_id AS member_id FROM referrals WHERE referrer_id = 1
),
two AS (
  SELECT r.referred_id AS member_id
  FROM referrals r
  JOIN one ON r.referrer_id = one.member_id
)
SELECT member_id, MIN(hops) AS hops
FROM (
  SELECT member_id, 1 AS hops FROM one
  UNION ALL
  SELECT member_id, 2 AS hops FROM two
)
WHERE member_id <> 1
GROUP BY member_id
ORDER BY hops, member_id;`,
    hint: 'Build the one-hop set, join it to referrals for the two-hop set, union them with a hop label, then GROUP BY member taking MIN(hops).',
    explanation:
      "A fixed hop limit doesn't need recursion: the one-hop set is a filter, the two-hop set is that set joined back to the edges. The two subtleties are taking `MIN(hops)` per member (someone reachable both directly and through a friend is at distance 1) and excluding the seed, because a chain like `1 → 4 → 1` otherwise reports member 1 as two hops from themselves. Direction matters too — `referrer → referred` is the edge, and reading it backwards returns the people who invited member 1.",
  },
  {
    id: 'sql-cost-centre-rollup',
    number: 87,
    title: 'Spend Rolled Up the Cost-Centre Tree',
    difficulty: 'Hard',
    topic: 'Hierarchies & Graphs',
    statement:
      "`cost_centres` has `id`, `name` and `parent_id` (NULL for a top-level centre). `expenses` has `id`, `cost_centre_id` and `amount_cents`, each booked against exactly one centre, which may be at any level of the tree.\n\nReturn `id`, `name` and `total_cents` — the centre's own expenses plus the expenses of every centre below it, at any depth (0 if there are none). Include every cost centre. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE cost_centres (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER
);
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY,
  cost_centre_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO cost_centres VALUES
  (1, 'Company', NULL),
  (2, 'R&D', 1),
  (3, 'Go-to-market', 1),
  (4, 'Firmware', 2),
  (5, 'Cloud', 2),
  (6, 'Field Sales', 3);
INSERT INTO expenses VALUES
  (1, 1, 1000),
  (2, 4, 2500),
  (3, 4, 500),
  (4, 5, 7000),
  (5, 6, 300),
  (6, 2, 100);`,
      `INSERT INTO cost_centres VALUES
  (10, 'Root', NULL),
  (11, 'L1', 10),
  (12, 'L2', 11),
  (13, 'L3', 12);
INSERT INTO expenses VALUES
  (1, 13, 40),
  (2, 13, 60);`,
      `INSERT INTO cost_centres VALUES
  (1, 'North', NULL),
  (2, 'South', NULL),
  (3, 'South-East', 2);
INSERT INTO expenses VALUES
  (1, 1, 900),
  (2, 2, 100);`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE below(ancestor_id, node_id) AS (
  SELECT id, id FROM cost_centres
  UNION ALL
  SELECT b.ancestor_id, c.id
  FROM below b
  JOIN cost_centres c ON c.parent_id = b.node_id
)
SELECT cc.id,
       cc.name,
       COALESCE(SUM(e.amount_cents), 0) AS total_cents
FROM cost_centres cc
JOIN below b ON b.ancestor_id = cc.id
LEFT JOIN expenses e ON e.cost_centre_id = b.node_id
GROUP BY cc.id, cc.name
ORDER BY cc.id;`,
    hint: 'Generate every (ancestor, descendant) pair — seeding the recursion with (id, id) so each centre counts itself — then join expenses on the descendant and group by the ancestor.',
    explanation:
      "Rolling totals *up* a tree is easiest as a closure table: a recursive CTE that emits `(ancestor, descendant)` for every pair, seeded with `(id, id)` so a centre's own spend is included. Joining expenses on the descendant side and grouping by the ancestor then sums each subtree in one pass. Summing only direct children stops one level down, and forgetting the self pair drops each centre's own bookings; the `LEFT JOIN` + `COALESCE` keeps empty centres at 0.",
  },

  // ===== Sessions & Events =====
  {
    id: 'sql-thirty-minute-session-numbers',
    number: 88,
    title: 'Stamp Each Tap With a Session Number',
    difficulty: 'Hard',
    topic: 'Sessions & Events',
    statement:
      "`taps` records app interactions: `id`, `user_id` and `tapped_at` (`YYYY-MM-DD HH:MM:SS`). Taps are grouped into sessions per user: a tap starts a new session when *more than* 30 minutes (strictly greater than 1800 seconds) have passed since that user's previous tap. A gap of exactly 30 minutes stays in the same session. A user's first tap starts session 1.\n\nReturn `id`, `user_id` and `session_no` (1, 2, 3 … per user in time order). Order taps by `tapped_at` then `id`. Rows ordered by `user_id` ascending, then `tapped_at` ascending, then `id` ascending.",
    schema: `CREATE TABLE taps (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  tapped_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO taps VALUES
  (1, 7, '2024-05-01 09:00:00'),
  (2, 7, '2024-05-01 09:10:00'),
  (3, 7, '2024-05-01 09:40:00'),
  (4, 7, '2024-05-01 10:10:01'),
  (5, 7, '2024-05-01 10:15:00'),
  (6, 8, '2024-05-01 09:05:00'),
  (7, 8, '2024-05-01 13:00:00'),
  (8, 8, '2024-05-01 13:20:00');`,
      `INSERT INTO taps VALUES
  (1, 1, '2024-02-10 22:00:00'),
  (2, 2, '2024-02-10 22:05:00'),
  (3, 1, '2024-02-10 22:29:00'),
  (4, 2, '2024-02-10 23:30:00'),
  (5, 1, '2024-02-11 00:15:00'),
  (6, 1, '2024-02-11 00:15:00');`,
      `INSERT INTO taps VALUES
  (3, 4, '2024-03-03 08:00:00'),
  (1, 4, '2024-03-03 08:25:00'),
  (2, 4, '2024-03-03 08:50:00'),
  (4, 4, '2024-03-03 09:15:00'),
  (5, 4, '2024-03-03 09:40:00'),
  (6, 4, '2024-03-03 12:00:00');`,
    ],
    ordered: true,
    solution: `WITH gaps AS (
  SELECT id, user_id, tapped_at,
         strftime('%s', tapped_at)
           - strftime('%s', LAG(tapped_at) OVER (PARTITION BY user_id ORDER BY tapped_at, id)) AS gap_s
  FROM taps
),
starts AS (
  SELECT id, user_id, tapped_at,
         CASE WHEN gap_s IS NULL OR gap_s > 1800 THEN 1 ELSE 0 END AS is_start
  FROM gaps
)
SELECT id, user_id,
       SUM(is_start) OVER (
         PARTITION BY user_id
         ORDER BY tapped_at, id
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS session_no
FROM starts
ORDER BY user_id, tapped_at, id;`,
    hint: 'Two window passes: LAG gives the gap to the previous tap, a CASE turns big gaps into a 1/0 "session starts here" flag, and a running SUM of that flag is the session number.',
    explanation:
      "Sessionization is the flag-and-accumulate pattern: `LAG` exposes the previous timestamp, a CASE marks rows where the gap exceeds the threshold (the first row, with a NULL gap, is a start too), and a running `SUM` over the flags numbers the sessions. The gap must be measured from the *previous* tap, not the session's first tap — otherwise a long, steady session gets chopped every 30 minutes. Comparing epoch seconds (`strftime('%s', ...)`) keeps the \"exactly 30 minutes stays together\" rule exact instead of relying on floating-point day fractions.",
  },
  {
    id: 'sql-session-first-last-screen',
    number: 89,
    title: 'First and Last Screen of Each Session',
    difficulty: 'Medium',
    topic: 'Sessions & Events',
    statement:
      "`screen_views` has `id`, `session_id`, `screen` and `viewed_at` (`YYYY-MM-DD HH:MM:SS`). Within a session, order views by `viewed_at` and break ties with the lower `id` first.\n\nReturn `session_id`, `first_screen` (the screen of the earliest view), `last_screen` (the screen of the latest view) and `duration_seconds` (seconds between the earliest and latest `viewed_at`; 0 for a single-view session). Rows ordered by `session_id` ascending.",
    schema: `CREATE TABLE screen_views (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL,
  screen TEXT NOT NULL,
  viewed_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO screen_views VALUES
  (1, 100, 'home', '2024-03-01 10:00:00'),
  (2, 100, 'search', '2024-03-01 10:00:30'),
  (3, 100, 'product', '2024-03-01 10:02:10'),
  (4, 101, 'deeplink', '2024-03-01 11:00:00'),
  (5, 102, 'home', '2024-03-01 12:00:00'),
  (6, 102, 'cart', '2024-03-01 12:00:00'),
  (7, 102, 'account', '2024-03-01 12:05:00');`,
      `INSERT INTO screen_views VALUES
  (9, 5, 'zulu', '2024-04-04 08:00:00'),
  (8, 5, 'alpha', '2024-04-04 08:00:00'),
  (7, 5, 'mike', '2024-04-04 08:00:00');`,
      `INSERT INTO screen_views VALUES
  (1, 1, 'settings', '2024-01-01 00:00:00'),
  (2, 1, 'home', '2024-01-01 00:00:59'),
  (3, 2, 'home', '2024-01-01 00:01:00'),
  (4, 2, 'settings', '2024-01-01 00:00:10');`,
    ],
    ordered: true,
    solution: `WITH ranked AS (
  SELECT session_id, screen, viewed_at,
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY viewed_at, id) AS rn_first,
         ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY viewed_at DESC, id DESC) AS rn_last
  FROM screen_views
)
SELECT session_id,
       MAX(CASE WHEN rn_first = 1 THEN screen END) AS first_screen,
       MAX(CASE WHEN rn_last = 1 THEN screen END) AS last_screen,
       strftime('%s', MAX(viewed_at)) - strftime('%s', MIN(viewed_at)) AS duration_seconds
FROM ranked
GROUP BY session_id
ORDER BY session_id;`,
    hint: 'Rank each view twice — ascending and descending by (viewed_at, id) — then pick the screen where each rank equals 1 with a conditional MAX.',
    explanation:
      "`MIN(screen)` / `MAX(screen)` return the alphabetically first and last names, which has nothing to do with time; you need the screen *from the row* with the earliest and latest timestamp. Two `ROW_NUMBER` windows with opposite orderings (and `id` as tiebreak so ties are deterministic) mark those rows, and a conditional aggregate lifts them into one line per session. Reaching for `FIRST_VALUE` / `LAST_VALUE` is tempting, but `LAST_VALUE` with the default frame returns the current row, and the query then needs a DISTINCT that still produces several rows per session.",
  },
  {
    id: 'sql-in-session-checkout-funnel',
    number: 90,
    title: 'Checkout Funnel Within One Session',
    difficulty: 'Medium',
    topic: 'Sessions & Events',
    statement:
      "`events` has `id`, `session_id`, `name` and `occurred_at` (`YYYY-MM-DD HH:MM:SS`). The checkout funnel is `view_item` → `add_to_cart` → `purchase`, and the order within the session matters: a session *carted* only if it has an `add_to_cart` strictly after its first `view_item`, and it *purchased* only if it has a `purchase` strictly after that first qualifying `add_to_cart`.\n\nReturn a single row with `viewed` (sessions with at least one `view_item`), `carted` and `purchased` — each a count of sessions, not events. The result is one row, so return it in any order.",
    schema: `CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO events VALUES
  (1, 1, 'view_item', '2024-05-05 10:00:00'),
  (2, 1, 'add_to_cart', '2024-05-05 10:01:00'),
  (3, 1, 'purchase', '2024-05-05 10:03:00'),
  (4, 2, 'view_item', '2024-05-05 11:00:00'),
  (5, 2, 'view_item', '2024-05-05 11:00:30'),
  (6, 2, 'add_to_cart', '2024-05-05 11:02:00'),
  (7, 3, 'purchase', '2024-05-05 12:00:00'),
  (8, 3, 'view_item', '2024-05-05 12:01:00'),
  (9, 3, 'add_to_cart', '2024-05-05 12:02:00'),
  (10, 4, 'add_to_cart', '2024-05-05 13:00:00'),
  (11, 4, 'view_item', '2024-05-05 13:01:00'),
  (12, 4, 'purchase', '2024-05-05 13:02:00'),
  (13, 5, 'home', '2024-05-05 14:00:00');`,
      `INSERT INTO events VALUES
  (1, 10, 'view_item', '2024-06-01 09:00:00'),
  (2, 10, 'add_to_cart', '2024-06-01 09:00:00'),
  (3, 10, 'add_to_cart', '2024-06-01 09:00:05'),
  (4, 10, 'purchase', '2024-06-01 09:00:03'),
  (5, 11, 'view_item', '2024-06-01 09:10:00'),
  (6, 11, 'add_to_cart', '2024-06-01 09:11:00'),
  (7, 11, 'purchase', '2024-06-01 09:12:00'),
  (8, 11, 'purchase', '2024-06-01 09:13:00');`,
      `INSERT INTO events VALUES
  (1, 1, 'view_item', '2024-07-01 08:00:00'),
  (2, 2, 'view_item', '2024-07-01 08:00:00'),
  (3, 3, 'add_to_cart', '2024-07-01 08:00:00'),
  (4, 3, 'purchase', '2024-07-01 08:00:01');`,
    ],
    solution: `WITH viewed AS (
  SELECT session_id, MIN(occurred_at) AS at
  FROM events
  WHERE name = 'view_item'
  GROUP BY session_id
),
carted AS (
  SELECT e.session_id, MIN(e.occurred_at) AS at
  FROM events e
  JOIN viewed v ON v.session_id = e.session_id AND e.occurred_at > v.at
  WHERE e.name = 'add_to_cart'
  GROUP BY e.session_id
),
purchased AS (
  SELECT DISTINCT e.session_id
  FROM events e
  JOIN carted c ON c.session_id = e.session_id AND e.occurred_at > c.at
  WHERE e.name = 'purchase'
)
SELECT (SELECT COUNT(*) FROM viewed) AS viewed,
       (SELECT COUNT(*) FROM carted) AS carted,
       (SELECT COUNT(*) FROM purchased) AS purchased;`,
    hint: 'Build the funnel one CTE at a time: each step keeps the sessions from the previous step and the earliest timestamp of the *qualifying* event, so the next step can require "after".',
    explanation:
      "An in-session funnel is a chain of \"did X happen *after* Y\" checks, so each stage carries the timestamp of the earliest qualifying event forward: the first `view_item`, then the first `add_to_cart` after it, then any `purchase` after that. Checking for mere existence of the three event names counts sessions that bought before viewing, and counting events instead of sessions inflates every stage as soon as a session repeats a step. The `DISTINCT` / `GROUP BY` at each stage is what keeps the counts per session.",
  },
  {
    id: 'sql-seconds-since-previous-ping',
    number: 91,
    title: 'Seconds Since the Previous Ping',
    difficulty: 'Easy',
    topic: 'Sessions & Events',
    statement:
      "IoT devices check in to `pings` with `id`, `device_id` and `pinged_at` (`YYYY-MM-DD HH:MM:SS`). Ids are not guaranteed to be in time order.\n\nReturn `id`, `device_id` and `seconds_since_prev` — the number of seconds since the same device's previous ping in time order (break timestamp ties by `id`), or NULL for the device's first ping. Rows ordered by `device_id` ascending, then `pinged_at` ascending, then `id` ascending.",
    schema: `CREATE TABLE pings (
  id INTEGER PRIMARY KEY,
  device_id INTEGER NOT NULL,
  pinged_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO pings VALUES
  (1, 'A1', '2024-02-01 00:00:00'),
  (2, 'A1', '2024-02-01 00:00:45'),
  (3, 'B2', '2024-02-01 00:00:10'),
  (4, 'A1', '2024-02-01 00:03:00'),
  (5, 'B2', '2024-02-01 01:00:10'),
  (6, 'C3', '2024-02-01 05:00:00');`,
      `INSERT INTO pings VALUES
  (5, 'X', '2024-09-09 12:00:00'),
  (2, 'X', '2024-09-09 12:00:30'),
  (9, 'X', '2024-09-09 11:59:00'),
  (3, 'Y', '2024-09-09 12:00:00');`,
      `INSERT INTO pings VALUES
  (1, 'Q', '2024-01-01 00:00:00'),
  (2, 'Q', '2024-01-01 00:00:00'),
  (3, 'Q', '2024-01-02 00:00:00');`,
    ],
    ordered: true,
    solution: `SELECT id, device_id,
       strftime('%s', pinged_at)
         - strftime('%s', LAG(pinged_at) OVER (PARTITION BY device_id ORDER BY pinged_at, id)) AS seconds_since_prev
FROM pings
ORDER BY device_id, pinged_at, id;`,
    hint: 'LAG(pinged_at) OVER (PARTITION BY device_id ORDER BY pinged_at, id) is the previous ping; convert both timestamps to epoch seconds and subtract.',
    explanation:
      "`LAG` reads the previous row inside a window, and partitioning by device restarts it per device, so the first ping of each device naturally gets NULL. Ordering the window by `id` instead of `pinged_at` gives wrong gaps as soon as ids arrive out of time order — which they do whenever devices batch-upload. `strftime('%s', ...)` yields epoch seconds, so the subtraction is an exact integer rather than a fraction of a day.",
  },
  {
    id: 'sql-peak-simultaneous-streams',
    number: 92,
    title: 'Peak Simultaneous Streams',
    difficulty: 'Hard',
    topic: 'Sessions & Events',
    statement:
      "`streams` has `id`, `started_at` and `ended_at` (`YYYY-MM-DD HH:MM:SS`). A stream is live from `started_at` up to but *not including* `ended_at`, so a stream that ends at 10:00:00 and one that starts at 10:00:00 never overlap.\n\nReturn a single row with `peak_count` — the largest number of streams live at the same instant — and `peak_at`, the earliest timestamp at which that many streams were live. The result is one row, so return it in any order.",
    schema: `CREATE TABLE streams (
  id INTEGER PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO streams VALUES
  (1, '2024-05-01 09:00:00', '2024-05-01 10:00:00'),
  (2, '2024-05-01 09:30:00', '2024-05-01 11:00:00'),
  (3, '2024-05-01 10:00:00', '2024-05-01 10:30:00'),
  (4, '2024-05-01 09:45:00', '2024-05-01 09:50:00'),
  (5, '2024-05-01 12:00:00', '2024-05-01 12:10:00');`,
      `INSERT INTO streams VALUES
  (1, '2024-01-01 00:00:00', '2024-01-01 01:00:00'),
  (2, '2024-01-01 01:00:00', '2024-01-01 02:00:00'),
  (3, '2024-01-01 02:00:00', '2024-01-01 03:00:00');`,
      `INSERT INTO streams VALUES
  (1, '2024-03-03 20:00:00', '2024-03-03 22:00:00'),
  (2, '2024-03-03 20:00:00', '2024-03-03 21:00:00'),
  (3, '2024-03-03 20:30:00', '2024-03-03 20:45:00'),
  (4, '2024-03-03 21:00:00', '2024-03-03 21:30:00'),
  (5, '2024-03-03 21:00:00', '2024-03-03 21:10:00'),
  (6, '2024-03-03 21:00:00', '2024-03-03 21:05:00');`,
    ],
    ordered: true,
    solution: `WITH edges AS (
  SELECT started_at AS ts, 1 AS delta FROM streams
  UNION ALL
  SELECT ended_at AS ts, -1 AS delta FROM streams
),
live AS (
  SELECT ts,
         SUM(delta) OVER (ORDER BY ts, delta ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS n
  FROM edges
)
SELECT MAX(n) AS peak_count,
       MIN(CASE WHEN n = (SELECT MAX(n) FROM live) THEN ts END) AS peak_at
FROM live;`,
    hint: 'Turn every stream into a +1 event at its start and a -1 event at its end, sort the events, and take a running sum — processing the -1 before the +1 at equal timestamps.',
    explanation:
      "This is the sweep-line trick: interval starts become `+1`, ends become `-1`, and a running `SUM` over the sorted events is the live count at every change point, so its maximum is the peak. Sorting by `(ts, delta)` puts the `-1` first when a stream ends at the same instant another begins, which is exactly the half-open semantics the statement asks for; sorting starts first would overcount that handover as an overlap. The self-join alternative (count streams covering each start) works too, but only if the end comparison is strict.",
  },
  {
    id: 'sql-api-hammering-clients',
    number: 93,
    title: 'Clients That Hammer the API',
    difficulty: 'Medium',
    topic: 'Sessions & Events',
    statement:
      "`requests` has `id`, `client_id` and `requested_at` (`YYYY-MM-DD HH:MM:SS`). A client is a suspected scraper if at some point it made **6 or more** requests within a sliding 60-second window — that is, for some request at time `t`, at least 6 of that client's requests (including that one) have a `requested_at` between `t` and `t + 59` seconds inclusive.\n\nReturn one column, `client_id`, listing each suspected client once. Rows ordered by `client_id` ascending.",
    schema: `CREATE TABLE requests (
  id INTEGER PRIMARY KEY,
  client_id TEXT NOT NULL,
  requested_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO requests VALUES
  (1, 'crawler', '2024-05-01 10:00:40'),
  (2, 'crawler', '2024-05-01 10:00:50'),
  (3, 'crawler', '2024-05-01 10:00:58'),
  (4, 'crawler', '2024-05-01 10:01:05'),
  (5, 'crawler', '2024-05-01 10:01:20'),
  (6, 'crawler', '2024-05-01 10:01:39'),
  (7, 'steady', '2024-05-01 08:00:00'),
  (8, 'steady', '2024-05-01 09:00:00'),
  (9, 'steady', '2024-05-01 10:00:00'),
  (10, 'steady', '2024-05-01 11:00:00'),
  (11, 'steady', '2024-05-01 12:00:00'),
  (12, 'steady', '2024-05-01 13:00:00'),
  (13, 'steady', '2024-05-01 14:00:00'),
  (14, 'mobile', '2024-05-01 10:00:00'),
  (15, 'mobile', '2024-05-01 10:00:20'),
  (16, 'mobile', '2024-05-01 10:00:40'),
  (17, 'mobile', '2024-05-01 10:01:00'),
  (18, 'mobile', '2024-05-01 10:01:20');`,
      `INSERT INTO requests VALUES
  (1, 'edge', '2024-06-01 00:00:00'),
  (2, 'edge', '2024-06-01 00:00:00'),
  (3, 'edge', '2024-06-01 00:00:00'),
  (4, 'edge', '2024-06-01 00:00:59'),
  (5, 'edge', '2024-06-01 00:00:59'),
  (6, 'edge', '2024-06-01 00:00:59'),
  (7, 'almost', '2024-06-01 00:00:00'),
  (8, 'almost', '2024-06-01 00:00:10'),
  (9, 'almost', '2024-06-01 00:00:20'),
  (10, 'almost', '2024-06-01 00:00:30'),
  (11, 'almost', '2024-06-01 00:00:40'),
  (12, 'almost', '2024-06-01 00:01:00');`,
      `INSERT INTO requests VALUES
  (1, 'bulk', '2024-07-07 15:30:01'),
  (2, 'bulk', '2024-07-07 15:30:02'),
  (3, 'bulk', '2024-07-07 15:30:03'),
  (4, 'bulk', '2024-07-07 15:30:04'),
  (5, 'bulk', '2024-07-07 15:30:05'),
  (6, 'bulk', '2024-07-07 15:30:06'),
  (7, 'bulk', '2024-07-07 15:30:07'),
  (8, 'solo', '2024-07-07 15:30:07');`,
    ],
    ordered: true,
    solution: `WITH windowed AS (
  SELECT client_id,
         COUNT(*) OVER (
           PARTITION BY client_id
           ORDER BY CAST(strftime('%s', requested_at) AS INTEGER)
           RANGE BETWEEN CURRENT ROW AND 59 FOLLOWING
         ) AS in_window
  FROM requests
)
SELECT DISTINCT client_id
FROM windowed
WHERE in_window >= 6
ORDER BY client_id;`,
    hint: 'A RANGE frame over epoch seconds — BETWEEN CURRENT ROW AND 59 FOLLOWING — counts the requests in the 60 seconds starting at each request.',
    explanation:
      "Sliding windows need a `RANGE` frame keyed on a numeric timestamp: ordering by epoch seconds and framing `CURRENT ROW AND 59 FOLLOWING` counts every request in the minute starting at the current one, per client. Bucketing by calendar minute (`strftime('%Y-%m-%d %H:%M')`) is the common shortcut and it misses bursts that straddle a minute boundary, which is precisely what a polite-looking scraper produces. A daily total is even weaker — a steady client with one request an hour is not abusive.",
  },

  // ===== Dedup & Cleanup =====
  {
    id: 'sql-one-lead-per-phone',
    number: 94,
    title: 'One Lead per Phone Number',
    difficulty: 'Medium',
    topic: 'Dedup & Cleanup',
    statement:
      "Sales reps typed phone numbers by hand, so `leads` (`id`, `name`, `phone`, `created_at`) contains the same number as `555-0100`, `(555) 0100` and `555.0100`. Two leads are duplicates when their phones match after removing spaces, dashes, dots and parentheses.\n\nReturn `phone_key` (the cleaned number), `canonical_id` (the id of the lead with the latest `created_at`; if tied, the higher `id`) and `copies` (how many leads share that key, including the canonical one). One row per key, including keys with a single lead. Rows ordered by `phone_key` ascending.",
    schema: `CREATE TABLE leads (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO leads VALUES
  (1, 'Ana', '555-0100', '2024-01-05'),
  (2, 'Ana R', '(555) 0100', '2024-02-10'),
  (3, 'A. Ruiz', '555.0100', '2024-02-10'),
  (4, 'Bo', '555 0199', '2024-01-01'),
  (5, 'Cy', '+1 555-0142', '2024-03-01'),
  (6, 'Cy K', '+15550142', '2024-01-15');`,
      `INSERT INTO leads VALUES
  (9, 'Dee', '020-7946-0958', '2024-05-01'),
  (2, 'Dee L', '020 7946 0958', '2024-05-09'),
  (5, 'Dee Lo', '(020) 7946.0958', '2024-05-09');`,
      `INSERT INTO leads VALUES
  (1, 'Eve', '311', '2024-06-01'),
  (2, 'Fay', '411', '2024-06-01'),
  (3, 'Gus', '511', '2024-06-01');`,
    ],
    ordered: true,
    solution: `WITH keyed AS (
  SELECT id, created_at,
         REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', ''), '(', ''), ')', '') AS phone_key
  FROM leads
),
ranked AS (
  SELECT phone_key, id,
         ROW_NUMBER() OVER (PARTITION BY phone_key ORDER BY created_at DESC, id DESC) AS rn,
         COUNT(*) OVER (PARTITION BY phone_key) AS copies
  FROM keyed
)
SELECT phone_key, id AS canonical_id, copies
FROM ranked
WHERE rn = 1
ORDER BY phone_key;`,
    hint: 'Nest REPLACE calls to strip the noise characters into a key column, then ROW_NUMBER over that key (newest first, higher id first) and keep rank 1.',
    explanation:
      "Fuzzy dedup starts with a normalisation step — here a stack of `REPLACE`s that strips formatting so the key is just the digits and a leading `+` — and everything else is a standard \"pick one row per key\" with `ROW_NUMBER`. Grouping on the raw `phone` finds no duplicates at all, and `MAX(id)` is not the same as \"most recently created\" once ids are assigned out of order by an import. A `COUNT(*) OVER` on the same partition gives the copy count without a second grouped query.",
  },
  {
    id: 'sql-fold-duplicate-accounts',
    number: 95,
    title: 'Fold Duplicate Accounts Into the Oldest',
    difficulty: 'Hard',
    topic: 'Dedup & Cleanup',
    statement:
      "Users signed up more than once with the same email in different capitalisation. `accounts` has `id`, `email` and `created_at`; `orders` has `id`, `account_id` and `total_cents`.\n\nAccounts whose emails match case-insensitively are one person. The *survivor* is the account with the earliest `created_at` (ties: lowest `id`). Return one row per person: `survivor_id`, `email` (lower-cased), `merged_accounts` (number of accounts folded in, including the survivor), `order_count` and `total_cents` — orders and revenue summed across *all* of that person's accounts (0 if none). Include people with a single account. Rows ordered by `survivor_id` ascending.",
    schema: `CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  total_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO accounts VALUES
  (1, 'Ana@Example.com', '2023-06-01'),
  (2, 'bo@example.com', '2023-07-01'),
  (3, 'ana@example.com', '2023-01-15'),
  (4, 'BO@EXAMPLE.COM', '2023-07-01'),
  (5, 'cy@example.com', '2024-01-01');
INSERT INTO orders VALUES
  (1, 1, 2500),
  (2, 3, 1000),
  (3, 3, 700),
  (4, 4, 4000);`,
      `INSERT INTO accounts VALUES
  (7, 'dee@example.com', '2024-02-02'),
  (8, 'Dee@example.com', '2024-02-01'),
  (9, 'dee@example.com', '2024-02-03');
INSERT INTO orders VALUES
  (1, 7, 100),
  (2, 9, 200),
  (3, 9, 300);`,
      `INSERT INTO accounts VALUES
  (1, 'eve@example.com', '2024-01-01'),
  (2, 'fay@example.com', '2024-01-01');
INSERT INTO orders VALUES
  (1, 2, 999);`,
    ],
    ordered: true,
    solution: `WITH normalised AS (
  SELECT id, LOWER(email) AS email, created_at,
         ROW_NUMBER() OVER (PARTITION BY LOWER(email) ORDER BY created_at, id) AS rn
  FROM accounts
),
survivors AS (
  SELECT id AS survivor_id, email FROM normalised WHERE rn = 1
),
per_person AS (
  SELECT n.email,
         COUNT(DISTINCT n.id) AS merged_accounts,
         COUNT(o.id) AS order_count,
         COALESCE(SUM(o.total_cents), 0) AS total_cents
  FROM normalised n
  LEFT JOIN orders o ON o.account_id = n.id
  GROUP BY n.email
)
SELECT s.survivor_id, s.email, p.merged_accounts, p.order_count, p.total_cents
FROM survivors s
JOIN per_person p ON p.email = s.email
ORDER BY s.survivor_id;`,
    hint: 'Normalise the email first, rank accounts within each email by (created_at, id) to find the survivor, and aggregate orders by the normalised email — not by the survivor id.',
    explanation:
      "Merging duplicates has two separate questions: *which* row survives, and *what* gets attached to it. The survivor is a `ROW_NUMBER` over the normalised key ordered by `created_at, id` — `MIN(id)` is a different rule and picks the wrong account whenever an older signup got a higher id. The totals must be aggregated over the whole group (every account sharing the email), so join orders to all accounts and group by the key, then attach the survivor; `COUNT(DISTINCT n.id)` keeps the account count correct even after the order join fans rows out.",
  },
  {
    id: 'sql-survey-answers-long-format',
    number: 96,
    title: 'Survey Answers, One per Row',
    difficulty: 'Easy',
    topic: 'Dedup & Cleanup',
    statement:
      "A form tool exported answers in a wide table `survey_responses` with `id`, `respondent` (unique) and three answer columns `q1`, `q2`, `q3`. Unanswered questions are NULL; an empty string `''` is a real (blank) answer and must be kept.\n\nReshape it to long format: return `respondent`, `question` (the literal text `'q1'`, `'q2'` or `'q3'`) and `answer`, one row per answered question. Rows ordered by `respondent` ascending, then `question` ascending.",
    schema: `CREATE TABLE survey_responses (
  id INTEGER PRIMARY KEY,
  respondent TEXT NOT NULL,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT
);`,
    datasets: [
      `INSERT INTO survey_responses VALUES
  (1, 'ana', 'yes', 'weekly', NULL),
  (2, 'bo', NULL, NULL, 'more docs'),
  (3, 'cy', 'no', '', 'faster sync');`,
      `INSERT INTO survey_responses VALUES
  (1, 'zed', NULL, NULL, NULL),
  (2, 'yara', 'a', 'b', 'c');`,
      `INSERT INTO survey_responses VALUES
  (5, 'kim', '', '', '');`,
    ],
    ordered: true,
    solution: `SELECT respondent, 'q1' AS question, q1 AS answer FROM survey_responses WHERE q1 IS NOT NULL
UNION ALL
SELECT respondent, 'q2', q2 FROM survey_responses WHERE q2 IS NOT NULL
UNION ALL
SELECT respondent, 'q3', q3 FROM survey_responses WHERE q3 IS NOT NULL
ORDER BY respondent, question;`,
    hint: 'One SELECT per wide column, each tagging its rows with the column name as a literal, glued together with UNION ALL.',
    explanation:
      "Without a native UNPIVOT, long format is a `UNION ALL` of one SELECT per column, each contributing a literal label for `question`. Use `UNION ALL`, not `UNION`, so two respondents giving identical answers aren't collapsed; filter with `IS NOT NULL` rather than `<> ''`, because `NULL <> ''` is NULL (so it *also* drops the NULLs) but it wrongly removes the blank-but-answered rows too. Forgetting a column in the union is the silent version of this bug.",
  },
  {
    id: 'sql-signups-per-day-gaps-filled',
    number: 97,
    title: 'Signups per Day, Gaps Included',
    difficulty: 'Medium',
    topic: 'Dedup & Cleanup',
    statement:
      "`signups` has `id` and `signed_up_on` (`YYYY-MM-DD`). A GROUP BY report skips days with no signups, which makes the chart look wrong.\n\nReturn `day` and `signups` for **every** calendar day from the earliest `signed_up_on` to the latest one inclusive, with `0` on days that had none. Generate the calendar in the query with a recursive CTE. Rows ordered by `day` ascending.",
    schema: `CREATE TABLE signups (
  id INTEGER PRIMARY KEY,
  signed_up_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO signups VALUES
  (1, '2024-03-01'),
  (2, '2024-03-01'),
  (3, '2024-03-02'),
  (4, '2024-03-05'),
  (5, '2024-03-05'),
  (6, '2024-03-05'),
  (7, '2024-03-08');`,
      `INSERT INTO signups VALUES
  (1, '2024-02-27'),
  (2, '2024-03-02');`,
      `INSERT INTO signups VALUES
  (10, '2024-12-30'),
  (11, '2025-01-02'),
  (12, '2025-01-02'),
  (13, '2024-12-31');`,
    ],
    ordered: true,
    solution: `WITH RECURSIVE calendar(day) AS (
  SELECT MIN(signed_up_on) FROM signups
  UNION ALL
  SELECT date(day, '+1 day')
  FROM calendar
  WHERE day < (SELECT MAX(signed_up_on) FROM signups)
)
SELECT c.day, COUNT(s.id) AS signups
FROM calendar c
LEFT JOIN signups s ON s.signed_up_on = c.day
GROUP BY c.day
ORDER BY c.day;`,
    hint: 'Seed the recursive CTE with MIN(signed_up_on), add one day per step while day < MAX(signed_up_on), then LEFT JOIN signups onto the calendar and COUNT the joined ids.',
    explanation:
      "The calendar is the driving table: a recursive CTE that starts at the earliest date and appends `date(day, '+1 day')` until it reaches the latest, so the range adapts to the data. Joining `signups` *onto* the calendar with a `LEFT JOIN` keeps empty days, and `COUNT(s.id)` (not `COUNT(*)`) makes those days 0 instead of 1, because the unmatched calendar row still counts as a row. Stopping the recursion one step early — a `<` test on the *next* day — silently loses the last date.",
  },

  // ===== Query Rewrites =====
  {
    id: 'sql-customer-lookup-as-join',
    number: 98,
    title: 'Customer Name Lookup Without the Subquery',
    difficulty: 'Easy',
    topic: 'Query Rewrites',
    statement:
      "A report runs this query, one scalar subquery per order row:\n\n```\nSELECT o.id, o.total_cents,\n       (SELECT c.name FROM customers c WHERE c.id = o.customer_id) AS customer_name\nFROM orders o\n```\n\n`orders` has `id`, `customer_id`, `total_cents`; `customers` has `id`, `name`. Some orders reference a customer id that no longer exists — the subquery returns NULL for those, and that behaviour must be preserved.\n\nRewrite it as a JOIN that returns exactly the same rows: `id`, `total_cents`, `customer_name` (NULL when the customer is missing). Rows ordered by `id` ascending.",
    schema: `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total_cents INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO customers VALUES
  (1, 'Ana'),
  (2, 'Bo'),
  (3, 'Cy');
INSERT INTO orders VALUES
  (100, 1, 2500),
  (101, 2, 800),
  (102, 9, 1200),
  (103, 1, 300);`,
      `INSERT INTO customers VALUES
  (5, 'Dee');
INSERT INTO orders VALUES
  (1, 5, 10),
  (2, 5, 20),
  (3, 6, 30);`,
      `INSERT INTO customers VALUES
  (1, 'Eve'),
  (2, 'Fay');
INSERT INTO orders VALUES
  (2, 1, 999),
  (1, 2, 111);`,
    ],
    ordered: true,
    solution: `SELECT o.id, o.total_cents, c.name AS customer_name
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`,
    hint: 'A scalar subquery that can find nothing behaves like a LEFT JOIN, not an inner join.',
    explanation:
      "A correlated scalar subquery is evaluated for every outer row and yields NULL when nothing matches; the equivalent join is therefore a `LEFT JOIN` on the same predicate, which the planner can turn into a single hash or merge join instead of N lookups. An inner join changes the result — orphaned orders vanish — so the rewrite is only safe when the outer-preserving semantics are kept. Watch the join key as well: `c.id = o.id` will happily run and return the wrong names.",
  },
  {
    id: 'sql-venues-never-booked',
    number: 99,
    title: 'Venues With No Booking on File',
    difficulty: 'Easy',
    topic: 'Query Rewrites',
    statement:
      "`venues` has `id` and `name`. `bookings` has `id`, `venue_id` and `booked_on`, and `venue_id` is NULL for bookings that haven't been assigned a room yet.\n\nSomeone wrote `SELECT id, name FROM venues WHERE id NOT IN (SELECT venue_id FROM bookings)` and it started returning nothing once the first unassigned booking appeared. Rewrite it as an anti-join with `NOT EXISTS` that returns `id` and `name` of every venue that no booking references. Rows ordered by `id` ascending.",
    schema: `CREATE TABLE venues (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY,
  venue_id INTEGER,
  booked_on TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO venues VALUES
  (1, 'Boardroom'),
  (2, 'Atrium'),
  (3, 'Studio B'),
  (4, 'Rooftop');
INSERT INTO bookings VALUES
  (1, 1, '2024-05-01'),
  (2, 3, '2024-05-02'),
  (3, NULL, '2024-05-03'),
  (4, 1, '2024-05-04');`,
      `INSERT INTO venues VALUES
  (1, 'Hall'),
  (2, 'Annex');
INSERT INTO bookings VALUES
  (1, 1, '2024-01-01'),
  (2, 2, '2024-01-02');`,
      `INSERT INTO venues VALUES
  (7, 'Loft'),
  (8, 'Garage'),
  (9, 'Lab');
INSERT INTO bookings VALUES
  (1, NULL, '2024-02-02'),
  (2, NULL, '2024-02-03');`,
    ],
    ordered: true,
    solution: `SELECT v.id, v.name
FROM venues v
WHERE NOT EXISTS (
  SELECT 1 FROM bookings b WHERE b.venue_id = v.id
)
ORDER BY v.id;`,
    hint: 'NOT EXISTS with a correlated subquery only asks "is there a booking for this venue?" — a NULL venue_id elsewhere can\'t poison the answer.',
    explanation:
      "`x NOT IN (list)` is really `x <> a AND x <> b AND ...`; as soon as the list contains a NULL one of those comparisons is unknown, the whole predicate is unknown, and every row is filtered out. `NOT EXISTS` evaluates a per-row correlated check that simply finds no match, so NULL bookings are irrelevant. The subquery must actually be correlated — `NOT EXISTS (SELECT 1 FROM bookings)` is false whenever the table has any rows at all.",
  },
  {
    id: 'sql-meter-deltas-with-lag',
    number: 100,
    title: 'Meter Deltas Without the Self-Join',
    difficulty: 'Medium',
    topic: 'Query Rewrites',
    statement:
      "Utility `readings` has `id`, `meter_id`, `read_on` (`YYYY-MM-DD`, one reading per meter per day) and `value`. A legacy query computes consumption by self-joining each reading to the previous one for the same meter — and silently drops the first reading of every meter because it has nothing to join to.\n\nRewrite it with a window function. Return `meter_id`, `read_on`, `value` and `delta` — `value` minus the previous reading of the same meter by `read_on`, or NULL for the meter's first reading. Include every reading. Rows ordered by `meter_id` ascending, then `read_on` ascending.",
    schema: `CREATE TABLE readings (
  id INTEGER PRIMARY KEY,
  meter_id TEXT NOT NULL,
  read_on TEXT NOT NULL,
  value INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO readings VALUES
  (1, 'M-1', '2024-01-01', 1000),
  (2, 'M-1', '2024-02-01', 1120),
  (3, 'M-1', '2024-03-01', 1300),
  (4, 'M-2', '2024-01-01', 500),
  (5, 'M-2', '2024-03-01', 560),
  (6, 'M-3', '2024-02-15', 42);`,
      `INSERT INTO readings VALUES
  (3, 'A', '2024-06-03', 30),
  (1, 'A', '2024-06-01', 10),
  (2, 'A', '2024-06-02', 25),
  (4, 'B', '2024-06-02', 5);`,
      `INSERT INTO readings VALUES
  (1, 'X', '2024-09-01', 900),
  (2, 'X', '2024-09-02', 880),
  (3, 'Y', '2024-09-02', 100),
  (4, 'Y', '2024-09-01', 90);`,
    ],
    ordered: true,
    solution: `SELECT meter_id, read_on, value,
       value - LAG(value) OVER (PARTITION BY meter_id ORDER BY read_on) AS delta
FROM readings
ORDER BY meter_id, read_on;`,
    hint: 'LAG(value) OVER (PARTITION BY meter_id ORDER BY read_on) is the previous reading; subtracting NULL for the first row gives the NULL delta for free.',
    explanation:
      "`LAG` replaces the \"find the latest earlier row\" self-join with one ordered pass per meter, and because the first row's `LAG` is NULL the subtraction naturally yields a NULL delta instead of dropping the row. It is also far cheaper: the self-join needs a nested `MAX(read_on)` lookup per row. Partition by the meter or the first reading of each meter is differenced against the previous meter's last one, and pick `LAG` not `LEAD` — the latter looks forward and shifts every delta by one row.",
  },
];

export const getSqlProblem = (id: string): SqlProblem | undefined =>
  sqlProblems.find((p) => p.id === id);
