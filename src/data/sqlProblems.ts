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
];

export const getSqlProblem = (id: string): SqlProblem | undefined =>
  sqlProblems.find((p) => p.id === id);
