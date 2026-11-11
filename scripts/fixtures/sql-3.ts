export { problems } from '../../src/data/more/sql-3';

// Plausible wrong queries: each must differ from the reference on at least one dataset.
export const traps: Record<string, string[]> = {
  'sql-race-places-with-gaps': [
    // DENSE_RANK does not skip places after a tie
    `SELECT name, finish_seconds,
            CASE WHEN finish_seconds IS NOT NULL THEN DENSE_RANK() OVER (ORDER BY finish_seconds IS NULL, finish_seconds) END
     FROM runners ORDER BY finish_seconds IS NULL, finish_seconds, name`,
    // NULLs sort first in SQLite, so non-finishers take place 1
    `SELECT name, finish_seconds,
            CASE WHEN finish_seconds IS NOT NULL THEN RANK() OVER (ORDER BY finish_seconds) END
     FROM runners ORDER BY finish_seconds IS NULL, finish_seconds, name`,
    // ROW_NUMBER splits ties
    `SELECT name, finish_seconds,
            CASE WHEN finish_seconds IS NOT NULL THEN ROW_NUMBER() OVER (ORDER BY finish_seconds IS NULL, finish_seconds, name) END
     FROM runners ORDER BY finish_seconds IS NULL, finish_seconds, name`,
  ],
  'sql-second-stay-per-guest': [
    // RANK: same-day stays share a rank
    `SELECT guest_id, hotel, check_in FROM (
       SELECT guest_id, hotel, check_in, RANK() OVER (PARTITION BY guest_id ORDER BY check_in) AS r FROM stays)
     WHERE r = 2 ORDER BY guest_id`,
    // ids are not chronological
    `SELECT guest_id, hotel, check_in FROM (
       SELECT guest_id, hotel, check_in, ROW_NUMBER() OVER (PARTITION BY guest_id ORDER BY id) AS r FROM stays)
     WHERE r = 2 ORDER BY guest_id`,
    // wrong tie-break direction
    `SELECT guest_id, hotel, check_in FROM (
       SELECT guest_id, hotel, check_in, ROW_NUMBER() OVER (PARTITION BY guest_id ORDER BY check_in, id DESC) AS r FROM stays)
     WHERE r = 2 ORDER BY guest_id`,
  ],
  'sql-gap-to-stage-winner': [
    // no PARTITION BY: gap to the fastest time of the whole tour
    `SELECT stage, rider, seconds, seconds - MIN(seconds) OVER () AS gap FROM stage_results ORDER BY stage, gap, rider`,
    // ORDER BY inside the window turns MIN into a running minimum
    `SELECT stage, rider, seconds, seconds - MIN(seconds) OVER (PARTITION BY stage ORDER BY rider) AS gap FROM stage_results ORDER BY stage, gap, rider`,
    // gap to the rider just ahead instead of to the winner
    `SELECT stage, rider, seconds,
            COALESCE(seconds - LAG(seconds) OVER (PARTITION BY stage ORDER BY seconds, rider), 0) AS gap
     FROM stage_results ORDER BY stage, gap, rider`,
  ],
  'sql-next-checkup-date': [
    // LAG looks backwards
    `SELECT pet_id, visit_on, LAG(visit_on) OVER w, CAST(julianday(visit_on) - julianday(LAG(visit_on) OVER w) AS INTEGER)
     FROM checkups WINDOW w AS (PARTITION BY pet_id ORDER BY visit_on) ORDER BY pet_id, visit_on`,
    // no PARTITION BY: the next visit of any pet
    `SELECT pet_id, visit_on, LEAD(visit_on) OVER w, CAST(julianday(LEAD(visit_on) OVER w) - julianday(visit_on) AS INTEGER)
     FROM checkups WINDOW w AS (ORDER BY visit_on, pet_id) ORDER BY pet_id, visit_on`,
    // window ordered by id
    `SELECT pet_id, visit_on, LEAD(visit_on) OVER w, CAST(julianday(LEAD(visit_on) OVER w) - julianday(visit_on) AS INTEGER)
     FROM checkups WINDOW w AS (PARTITION BY pet_id ORDER BY id) ORDER BY pet_id, visit_on`,
    // subtracting the text dates
    `SELECT pet_id, visit_on, LEAD(visit_on) OVER w, LEAD(visit_on) OVER w - visit_on
     FROM checkups WINDOW w AS (PARTITION BY pet_id ORDER BY visit_on) ORDER BY pet_id, visit_on`,
  ],
  'sql-keep-only-status-changes': [
    // first sighting of each status: loses a status that comes back
    `SELECT l.id, l.order_id, l.status, l.logged_at FROM order_status_log l
     WHERE NOT EXISTS (SELECT 1 FROM order_status_log e WHERE e.order_id = l.order_id AND e.status = l.status
                       AND (e.logged_at < l.logged_at OR (e.logged_at = l.logged_at AND e.id < l.id)))
     ORDER BY l.order_id, l.logged_at, l.id`,
    // no PARTITION BY
    `WITH s AS (SELECT *, LAG(status) OVER (ORDER BY logged_at, id) AS p FROM order_status_log)
     SELECT id, order_id, status, logged_at FROM s WHERE p IS NULL OR status <> p ORDER BY order_id, logged_at, id`,
    // window ordered by id only
    `WITH s AS (SELECT *, LAG(status) OVER (PARTITION BY order_id ORDER BY id) AS p FROM order_status_log)
     SELECT id, order_id, status, logged_at FROM s WHERE p IS NULL OR status <> p ORDER BY order_id, logged_at, id`,
    // forgets the NULL case: drops every order's first row
    `WITH s AS (SELECT *, LAG(status) OVER (PARTITION BY order_id ORDER BY logged_at, id) AS p FROM order_status_log)
     SELECT id, order_id, status, logged_at FROM s WHERE status <> p ORDER BY order_id, logged_at, id`,
  ],
  'sql-days-that-set-a-record': [
    // default frame includes the current row: ties with the record slip through
    `WITH t AS (SELECT *, MAX(level_cm) OVER (PARTITION BY station ORDER BY measured_on) AS m FROM river_levels)
     SELECT station, measured_on, level_cm FROM t WHERE level_cm = m ORDER BY station, measured_on`,
    // higher than yesterday is not a record
    `WITH t AS (SELECT *, LAG(level_cm) OVER (PARTITION BY station ORDER BY measured_on) AS p FROM river_levels)
     SELECT station, measured_on, level_cm FROM t WHERE p IS NULL OR level_cm > p ORDER BY station, measured_on`,
    // no PARTITION BY
    `WITH t AS (SELECT *, MAX(level_cm) OVER (ORDER BY measured_on, station ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS m FROM river_levels)
     SELECT station, measured_on, level_cm FROM t WHERE m IS NULL OR level_cm > m ORDER BY station, measured_on`,
  ],
  'sql-purchase-that-broke-budget': [
    // >= treats landing exactly on the limit as over
    `WITH run AS (SELECT id, team, bought_on, SUM(amount_cents) OVER (PARTITION BY team ORDER BY bought_on, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS t FROM purchases),
     o AS (SELECT r.*, ROW_NUMBER() OVER (PARTITION BY r.team ORDER BY r.bought_on, r.id) AS rn FROM run r JOIN budgets b ON b.team = r.team WHERE r.t >= b.limit_cents)
     SELECT team, id, t FROM o WHERE rn = 1 ORDER BY team`,
    // default RANGE frame: same-day purchases are peers
    `WITH run AS (SELECT id, team, bought_on, SUM(amount_cents) OVER (PARTITION BY team ORDER BY bought_on) AS t FROM purchases),
     o AS (SELECT r.*, ROW_NUMBER() OVER (PARTITION BY r.team ORDER BY r.bought_on, r.id) AS rn FROM run r JOIN budgets b ON b.team = r.team WHERE r.t > b.limit_cents)
     SELECT team, id, t FROM o WHERE rn = 1 ORDER BY team`,
    // running total in id order
    `WITH run AS (SELECT id, team, bought_on, SUM(amount_cents) OVER (PARTITION BY team ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS t FROM purchases),
     o AS (SELECT r.*, ROW_NUMBER() OVER (PARTITION BY r.team ORDER BY r.id) AS rn FROM run r JOIN budgets b ON b.team = r.team WHERE r.t > b.limit_cents)
     SELECT team, id, t FROM o WHERE rn = 1 ORDER BY team`,
  ],
  'sql-exam-score-percentile': [
    // PERCENT_RANK is (rank - 1) / (n - 1)
    `SELECT exam, student, score, ROUND(100.0 * PERCENT_RANK() OVER (PARTITION BY exam ORDER BY score), 1)
     FROM results ORDER BY exam, score DESC, student`,
    // strictly lower scores only
    `SELECT exam, student, score, ROUND(100.0 * (RANK() OVER (PARTITION BY exam ORDER BY score) - 1) / COUNT(*) OVER (PARTITION BY exam), 1)
     FROM results ORDER BY exam, score DESC, student`,
    // ROWS frame splits tied scores
    `SELECT exam, student, score, ROUND(100.0 * ROW_NUMBER() OVER (PARTITION BY exam ORDER BY score, student) / COUNT(*) OVER (PARTITION BY exam), 1)
     FROM results ORDER BY exam, score DESC, student`,
    // no PARTITION BY
    `SELECT exam, student, score, ROUND(100.0 * CUME_DIST() OVER (ORDER BY score), 1) FROM results ORDER BY exam, score DESC, student`,
    // integer division
    `SELECT exam, student, score, ROUND(100 * COUNT(*) OVER (PARTITION BY exam ORDER BY score) / COUNT(*) OVER (PARTITION BY exam), 1)
     FROM results ORDER BY exam, score DESC, student`,
  ],
  'sql-current-win-streak': [
    // longest streak ever
    `WITH g AS (SELECT team, result, SUM(result <> 'W') OVER (PARTITION BY team ORDER BY played_on ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS grp FROM matches),
     r AS (SELECT team, grp, SUM(result = 'W') AS n FROM g GROUP BY team, grp)
     SELECT team, MAX(n) AS streak FROM r GROUP BY team ORDER BY streak DESC, team`,
    // total wins
    `SELECT team, SUM(result = 'W') AS streak FROM matches GROUP BY team ORDER BY streak DESC, team`,
    // only a loss ends the streak
    `WITH f AS (SELECT team, result, SUM(result = 'L') OVER (PARTITION BY team ORDER BY played_on DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS b FROM matches)
     SELECT team, SUM(b = 0 AND result = 'W') AS streak FROM f GROUP BY team ORDER BY streak DESC, team`,
    // walks in id order
    `WITH f AS (SELECT team, SUM(result <> 'W') OVER (PARTITION BY team ORDER BY id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS b FROM matches)
     SELECT team, SUM(b = 0) AS streak FROM f GROUP BY team ORDER BY streak DESC, team`,
    // WHERE drops the teams with a streak of 0
    `WITH f AS (SELECT team, SUM(result <> 'W') OVER (PARTITION BY team ORDER BY played_on DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS b FROM matches)
     SELECT team, COUNT(*) AS streak FROM f WHERE b = 0 GROUP BY team ORDER BY streak DESC, team`,
  ],
  'sql-median-delivery-minutes': [
    // mean, not median
    `SELECT courier, COUNT(minutes), AVG(minutes) FROM deliveries WHERE minutes IS NOT NULL GROUP BY courier ORDER BY courier`,
    // NULLs numbered along with the rest
    `WITH d AS (SELECT courier, minutes, ROW_NUMBER() OVER (PARTITION BY courier ORDER BY minutes) AS rn, COUNT(minutes) OVER (PARTITION BY courier) AS n FROM deliveries)
     SELECT courier, MAX(n), AVG(minutes) FROM d WHERE n > 0 AND rn IN ((n + 1) / 2, (n + 2) / 2) GROUP BY courier ORDER BY courier`,
    // lower middle only for an even count
    `WITH d AS (SELECT courier, minutes, ROW_NUMBER() OVER (PARTITION BY courier ORDER BY minutes) AS rn, COUNT(*) OVER (PARTITION BY courier) AS n FROM deliveries WHERE minutes IS NOT NULL)
     SELECT courier, MAX(n), AVG(minutes) FROM d WHERE rn = (n + 1) / 2 GROUP BY courier ORDER BY courier`,
    // RANK: tied values share a position
    `WITH d AS (SELECT courier, minutes, RANK() OVER (PARTITION BY courier ORDER BY minutes) AS rn, COUNT(*) OVER (PARTITION BY courier) AS n FROM deliveries WHERE minutes IS NOT NULL)
     SELECT courier, MAX(n), AVG(minutes) FROM d WHERE rn IN ((n + 1) / 2, (n + 2) / 2) GROUP BY courier ORDER BY courier`,
  ],
  'sql-carry-last-reading-forward': [
    // LAG reaches back one row only
    `SELECT tank, read_at, COALESCE(litres, LAG(litres) OVER (PARTITION BY tank ORDER BY read_at)) FROM tank_levels ORDER BY tank, read_at`,
    // running MAX is not "most recent"
    `SELECT tank, read_at, COALESCE(litres, MAX(litres) OVER (PARTITION BY tank ORDER BY read_at)) FROM tank_levels ORDER BY tank, read_at`,
    // no PARTITION BY: borrows a value from another tank
    `WITH g AS (SELECT tank, read_at, litres, COUNT(litres) OVER (ORDER BY tank, read_at) AS grp FROM tank_levels)
     SELECT tank, read_at, MAX(litres) OVER (PARTITION BY grp) FROM g ORDER BY tank, read_at`,
  ],
  'sql-takings-by-weekday': [
    // %w order puts Sunday first
    `WITH d AS (SELECT CAST(strftime('%w', sold_on) AS INTEGER) AS w, amount_cents FROM sales)
     SELECT CASE w WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday' WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday' ELSE 'Saturday' END,
            COUNT(*), SUM(amount_cents) FROM d GROUP BY w ORDER BY w`,
    // alphabetical order of the names
    `WITH d AS (SELECT CAST(strftime('%w', sold_on) AS INTEGER) AS w, amount_cents FROM sales)
     SELECT CASE w WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday' WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday' ELSE 'Saturday' END AS weekday,
            COUNT(*), SUM(amount_cents) FROM d GROUP BY w ORDER BY weekday`,
    // grouped per calendar date instead of per weekday
    `SELECT CASE strftime('%w', sold_on) WHEN '0' THEN 'Sunday' WHEN '1' THEN 'Monday' WHEN '2' THEN 'Tuesday' WHEN '3' THEN 'Wednesday' WHEN '4' THEN 'Thursday' WHEN '5' THEN 'Friday' ELSE 'Saturday' END,
            COUNT(*), SUM(amount_cents) FROM sales GROUP BY sold_on ORDER BY (strftime('%w', sold_on) + 6) % 7, sold_on`,
    // compares the text result of strftime with integers: everything falls into ELSE
    `SELECT CASE strftime('%w', sold_on) WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday' WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday' ELSE 'Saturday' END,
            COUNT(*), SUM(amount_cents) FROM sales GROUP BY strftime('%w', sold_on) ORDER BY (strftime('%w', sold_on) + 6) % 7`,
  ],
  'sql-days-left-in-signup-month': [
    // adds the month before snapping to the 1st: overflows on long months
    `SELECT id, started_on, date(started_on, '+1 month', 'start of month', '-1 day'),
            CAST(julianday(date(started_on, '+1 month', 'start of month', '-1 day')) - julianday(started_on) AS INTEGER) + 1
     FROM memberships ORDER BY id`,
    // forgets to count both ends
    `SELECT id, started_on, date(started_on, 'start of month', '+1 month', '-1 day'),
            CAST(julianday(date(started_on, 'start of month', '+1 month', '-1 day')) - julianday(started_on) AS INTEGER)
     FROM memberships ORDER BY id`,
    // assumes every month has 31 days
    `SELECT id, started_on, date(started_on, 'start of month', '+30 days'),
            CAST(julianday(date(started_on, 'start of month', '+30 days')) - julianday(started_on) AS INTEGER) + 1
     FROM memberships ORDER BY id`,
    // one month after the start date, minus a day
    `SELECT id, started_on, date(started_on, '+1 month', '-1 day'),
            CAST(julianday(date(started_on, '+1 month', '-1 day')) - julianday(started_on) AS INTEGER) + 1
     FROM memberships ORDER BY id`,
  ],
  'sql-tickets-per-monday-week': [
    // Sunday-start weeks
    `SELECT date(opened_on, '-' || strftime('%w', opened_on) || ' days') AS week_start, COUNT(*) FROM tickets GROUP BY week_start ORDER BY week_start`,
    // 'weekday 1' moves forward to the next Monday
    `SELECT date(opened_on, 'weekday 1') AS week_start, COUNT(*) FROM tickets GROUP BY week_start ORDER BY week_start`,
    // right for six days, a week early for Mondays
    `SELECT date(opened_on, 'weekday 1', '-7 days') AS week_start, COUNT(*) FROM tickets GROUP BY week_start ORDER BY week_start`,
    // groups by week number: splits the week that straddles New Year
    `SELECT MIN(date(opened_on, '-' || ((strftime('%w', opened_on) + 6) % 7) || ' days')) AS week_start, COUNT(*)
     FROM tickets GROUP BY strftime('%Y-%W', opened_on) ORDER BY week_start`,
  ],
  'sql-same-month-last-year': [
    // twelve rows back is not twelve months back when months are missing
    `WITH t AS (SELECT month, revenue_cents, LAG(revenue_cents, 12) OVER (ORDER BY month) AS p FROM monthly_revenue)
     SELECT month, revenue_cents, p, ROUND(100.0 * (revenue_cents - p) / p, 1) FROM t
     WHERE substr(month, 1, 4) = (SELECT substr(MAX(month), 1, 4) FROM monthly_revenue) ORDER BY month`,
    // INNER JOIN drops months with no counterpart
    `SELECT c.month, c.revenue_cents, p.revenue_cents, ROUND(100.0 * (c.revenue_cents - p.revenue_cents) / p.revenue_cents, 1)
     FROM monthly_revenue c JOIN monthly_revenue p ON p.month = (CAST(substr(c.month, 1, 4) AS INTEGER) - 1) || substr(c.month, 5)
     WHERE substr(c.month, 1, 4) = (SELECT substr(MAX(month), 1, 4) FROM monthly_revenue) ORDER BY c.month`,
    // every year, not only the latest
    `SELECT c.month, c.revenue_cents, p.revenue_cents, ROUND(100.0 * (c.revenue_cents - p.revenue_cents) / p.revenue_cents, 1)
     FROM monthly_revenue c LEFT JOIN monthly_revenue p ON p.month = (CAST(substr(c.month, 1, 4) AS INTEGER) - 1) || substr(c.month, 5)
     ORDER BY c.month`,
    // integer division
    `SELECT c.month, c.revenue_cents, p.revenue_cents, ROUND(100 * (c.revenue_cents - p.revenue_cents) / p.revenue_cents, 1)
     FROM monthly_revenue c LEFT JOIN monthly_revenue p ON p.month = (CAST(substr(c.month, 1, 4) AS INTEGER) - 1) || substr(c.month, 5)
     WHERE substr(c.month, 1, 4) = (SELECT substr(MAX(month), 1, 4) FROM monthly_revenue) ORDER BY c.month`,
    // previous row (month over month)
    `WITH t AS (SELECT month, revenue_cents, LAG(revenue_cents) OVER (ORDER BY month) AS p FROM monthly_revenue)
     SELECT month, revenue_cents, p, ROUND(100.0 * (revenue_cents - p) / p, 1) FROM t
     WHERE substr(month, 1, 4) = (SELECT substr(MAX(month), 1, 4) FROM monthly_revenue) ORDER BY month`,
  ],
  'sql-products-behind-80-percent': [
    // cumulative <= 80% drops the product that crosses the line
    `WITH t AS (SELECT product, SUM(amount_cents) AS revenue FROM sales GROUP BY product),
     r AS (SELECT product, revenue, SUM(revenue) OVER (ORDER BY revenue DESC, product ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running, SUM(revenue) OVER () AS grand FROM t)
     SELECT product, revenue, ROUND(100.0 * running / grand, 1) FROM r WHERE running * 5 <= grand * 4 ORDER BY revenue DESC, product`,
    // default RANGE frame: tied products share one running total
    `WITH t AS (SELECT product, SUM(amount_cents) AS revenue FROM sales GROUP BY product),
     r AS (SELECT product, revenue, SUM(revenue) OVER (ORDER BY revenue DESC) AS running, SUM(revenue) OVER () AS grand FROM t)
     SELECT product, revenue, ROUND(100.0 * running / grand, 1) FROM r WHERE (running - revenue) * 5 < grand * 4 ORDER BY revenue DESC, product`,
    // keeps going after exactly 80% has been reached
    `WITH t AS (SELECT product, SUM(amount_cents) AS revenue FROM sales GROUP BY product),
     r AS (SELECT product, revenue, SUM(revenue) OVER (ORDER BY revenue DESC, product ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running, SUM(revenue) OVER () AS grand FROM t)
     SELECT product, revenue, ROUND(100.0 * running / grand, 1) FROM r WHERE (running - revenue) * 5 <= grand * 4 ORDER BY revenue DESC, product`,
    // running total over raw sales rows instead of per-product totals
    `WITH r AS (SELECT product, amount_cents AS revenue, SUM(amount_cents) OVER (ORDER BY amount_cents DESC, product, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running, SUM(amount_cents) OVER () AS grand FROM sales)
     SELECT product, revenue, ROUND(100.0 * running / grand, 1) FROM r WHERE (running - revenue) * 5 < grand * 4 ORDER BY revenue DESC, product`,
  ],
  'sql-monthly-retention-triangle': [
    // counts purchases, not buyers
    `WITH f AS (SELECT buyer_id, MIN(bought_on) AS first_on FROM purchases GROUP BY buyer_id)
     SELECT strftime('%Y-%m', f.first_on) AS c,
            (strftime('%Y', p.bought_on) - strftime('%Y', f.first_on)) * 12 + strftime('%m', p.bought_on) - strftime('%m', f.first_on) AS m, COUNT(*)
     FROM purchases p JOIN f ON f.buyer_id = p.buyer_id GROUP BY c, m ORDER BY c, m`,
    // month numbers only: breaks across New Year
    `WITH f AS (SELECT buyer_id, MIN(bought_on) AS first_on FROM purchases GROUP BY buyer_id)
     SELECT strftime('%Y-%m', f.first_on) AS c, strftime('%m', p.bought_on) - strftime('%m', f.first_on) AS m, COUNT(DISTINCT p.buyer_id)
     FROM purchases p JOIN f ON f.buyer_id = p.buyer_id GROUP BY c, m ORDER BY c, m`,
    // 30-day periods instead of calendar months
    `WITH f AS (SELECT buyer_id, MIN(bought_on) AS first_on FROM purchases GROUP BY buyer_id)
     SELECT strftime('%Y-%m', f.first_on) AS c, CAST((julianday(p.bought_on) - julianday(f.first_on)) / 30 AS INTEGER) AS m, COUNT(DISTINCT p.buyer_id)
     FROM purchases p JOIN f ON f.buyer_id = p.buyer_id GROUP BY c, m ORDER BY c, m`,
    // 30-day periods measured from the first of the cohort month
    `WITH f AS (SELECT buyer_id, MIN(bought_on) AS first_on FROM purchases GROUP BY buyer_id)
     SELECT strftime('%Y-%m', f.first_on) AS c, CAST((julianday(p.bought_on) - julianday(date(f.first_on, 'start of month'))) / 30 AS INTEGER) AS m, COUNT(DISTINCT p.buyer_id)
     FROM purchases p JOIN f ON f.buyer_id = p.buyer_id GROUP BY c, m ORDER BY c, m`,
  ],
  'sql-loan-repayment-schedule': [
    // every instalment equal: the leftover cents are lost
    `WITH RECURSIVE s(loan_id, n, k, p, d) AS (SELECT id, 1, instalments, principal_cents, first_due_on FROM loans UNION ALL SELECT loan_id, n + 1, k, p, d FROM s WHERE n < k)
     SELECT loan_id, n, date(d, '+' || (n - 1) || ' months'), p / k FROM s ORDER BY loan_id, n`,
    // 30 days is not a month
    `WITH RECURSIVE s(loan_id, n, k, p, d) AS (SELECT id, 1, instalments, principal_cents, first_due_on FROM loans UNION ALL SELECT loan_id, n + 1, k, p, d FROM s WHERE n < k)
     SELECT loan_id, n, date(d, '+' || ((n - 1) * 30) || ' days'), CASE WHEN n < k THEN p / k ELSE p - (p / k) * (k - 1) END FROM s ORDER BY loan_id, n`,
    // remainder put on the first instalment
    `WITH RECURSIVE s(loan_id, n, k, p, d) AS (SELECT id, 1, instalments, principal_cents, first_due_on FROM loans UNION ALL SELECT loan_id, n + 1, k, p, d FROM s WHERE n < k)
     SELECT loan_id, n, date(d, '+' || (n - 1) || ' months'), CASE WHEN n > 1 THEN p / k ELSE p - (p / k) * (k - 1) END FROM s ORDER BY loan_id, n`,
    // off by one: generates an extra instalment
    `WITH RECURSIVE s(loan_id, n, k, p, d) AS (SELECT id, 1, instalments, principal_cents, first_due_on FROM loans UNION ALL SELECT loan_id, n + 1, k, p, d FROM s WHERE n <= k)
     SELECT loan_id, n, date(d, '+' || (n - 1) || ' months'), CASE WHEN n < k THEN p / k ELSE p - (p / k) * (k - 1) END FROM s ORDER BY loan_id, n`,
  ],
  'sql-beds-occupied-each-night': [
    // counts the discharge day as occupied
    `WITH RECURSIVE n(night) AS (SELECT first_night FROM report_range UNION ALL SELECT date(night, '+1 day') FROM n WHERE night < (SELECT last_night FROM report_range))
     SELECT n.night, COUNT(s.id) FROM n LEFT JOIN stays s ON s.admitted_on <= n.night AND (s.discharged_on IS NULL OR s.discharged_on >= n.night) GROUP BY n.night ORDER BY n.night`,
    // NULL discharge never matches
    `WITH RECURSIVE n(night) AS (SELECT first_night FROM report_range UNION ALL SELECT date(night, '+1 day') FROM n WHERE night < (SELECT last_night FROM report_range))
     SELECT n.night, COUNT(s.id) FROM n LEFT JOIN stays s ON s.admitted_on <= n.night AND s.discharged_on > n.night GROUP BY n.night ORDER BY n.night`,
    // INNER JOIN loses the empty nights
    `WITH RECURSIVE n(night) AS (SELECT first_night FROM report_range UNION ALL SELECT date(night, '+1 day') FROM n WHERE night < (SELECT last_night FROM report_range))
     SELECT n.night, COUNT(s.id) FROM n JOIN stays s ON s.admitted_on <= n.night AND (s.discharged_on IS NULL OR s.discharged_on > n.night) GROUP BY n.night ORDER BY n.night`,
    // COUNT(*) counts the NULL-extended row
    `WITH RECURSIVE n(night) AS (SELECT first_night FROM report_range UNION ALL SELECT date(night, '+1 day') FROM n WHERE night < (SELECT last_night FROM report_range))
     SELECT n.night, COUNT(*) FROM n LEFT JOIN stays s ON s.admitted_on <= n.night AND (s.discharged_on IS NULL OR s.discharged_on > n.night) GROUP BY n.night ORDER BY n.night`,
  ],
  'sql-pair-badge-in-with-out': [
    // earliest later 'out', even if another 'in' lies in between
    `SELECT i.worker_id, i.scanned_at,
            (SELECT MIN(o.scanned_at) FROM badge_events o WHERE o.worker_id = i.worker_id AND o.kind = 'out' AND o.scanned_at > i.scanned_at) AS out_at,
            (strftime('%s', (SELECT MIN(o.scanned_at) FROM badge_events o WHERE o.worker_id = i.worker_id AND o.kind = 'out' AND o.scanned_at > i.scanned_at)) - strftime('%s', i.scanned_at)) / 60
     FROM badge_events i WHERE i.kind = 'in' ORDER BY i.worker_id, i.scanned_at`,
    // next event taken as the badge-out whatever its kind
    `WITH s AS (SELECT worker_id, kind, scanned_at, LEAD(scanned_at) OVER (PARTITION BY worker_id ORDER BY scanned_at) AS nx FROM badge_events)
     SELECT worker_id, scanned_at, nx, (strftime('%s', nx) - strftime('%s', scanned_at)) / 60 FROM s WHERE kind = 'in' ORDER BY worker_id, scanned_at`,
    // no PARTITION BY
    `WITH s AS (SELECT worker_id, kind, scanned_at, LEAD(kind) OVER (ORDER BY scanned_at, id) AS nk, LEAD(scanned_at) OVER (ORDER BY scanned_at, id) AS nx FROM badge_events)
     SELECT worker_id, scanned_at, CASE WHEN nk = 'out' THEN nx END, CASE WHEN nk = 'out' THEN (strftime('%s', nx) - strftime('%s', scanned_at)) / 60 END
     FROM s WHERE kind = 'in' ORDER BY worker_id, scanned_at`,
    // open badge-ins dropped
    `WITH s AS (SELECT worker_id, kind, scanned_at, LEAD(kind) OVER w AS nk, LEAD(scanned_at) OVER w AS nx FROM badge_events WINDOW w AS (PARTITION BY worker_id ORDER BY scanned_at))
     SELECT worker_id, scanned_at, nx, (strftime('%s', nx) - strftime('%s', scanned_at)) / 60 FROM s WHERE kind = 'in' AND nk = 'out' ORDER BY worker_id, scanned_at`,
  ],
  'sql-outage-windows': [
    // one row per service: all its down checks lumped together
    `SELECT service, MIN(checked_at) AS f, MAX(checked_at), COUNT(*),
            (SELECT MIN(u.checked_at) FROM health_checks u WHERE u.service = h.service AND u.status = 'up' AND u.checked_at > MAX(h.checked_at))
     FROM health_checks h WHERE status = 'down' GROUP BY service ORDER BY service, f`,
    // no PARTITION BY service
    `WITH m AS (SELECT service, checked_at, status,
                       SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) OVER (ORDER BY checked_at, service ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS g,
                       LEAD(status) OVER (PARTITION BY service ORDER BY checked_at) AS ns, LEAD(checked_at) OVER (PARTITION BY service ORDER BY checked_at) AS na
                FROM health_checks)
     SELECT service, MIN(checked_at) AS f, MAX(checked_at), COUNT(*), MAX(CASE WHEN ns = 'up' THEN na END) FROM m WHERE status = 'down' GROUP BY service, g ORDER BY service, f`,
    // recovered_at taken as the latest "next" time: wrong when still down
    `WITH m AS (SELECT service, checked_at, status,
                       SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) OVER (PARTITION BY service ORDER BY checked_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS g,
                       LEAD(checked_at) OVER (PARTITION BY service ORDER BY checked_at) AS na
                FROM health_checks)
     SELECT service, MIN(checked_at) AS f, MAX(checked_at), COUNT(*), MAX(na) FROM m WHERE status = 'down' GROUP BY service, g ORDER BY service, f`,
    // ordered by id
    `WITH m AS (SELECT service, checked_at, status,
                       SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) OVER (PARTITION BY service ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS g,
                       LEAD(status) OVER (PARTITION BY service ORDER BY id) AS ns, LEAD(checked_at) OVER (PARTITION BY service ORDER BY id) AS na
                FROM health_checks)
     SELECT service, MIN(checked_at) AS f, MAX(checked_at), COUNT(*), MAX(CASE WHEN ns = 'up' THEN na END) FROM m WHERE status = 'down' GROUP BY service, g ORDER BY service, f`,
    // LEAD computed after filtering to the down rows: never sees the 'up'
    `WITH m AS (SELECT service, checked_at, status,
                       SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) OVER (PARTITION BY service ORDER BY checked_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS g
                FROM health_checks),
     d AS (SELECT *, LEAD(checked_at) OVER (PARTITION BY service ORDER BY checked_at) AS na FROM m WHERE status = 'down')
     SELECT service, MIN(checked_at) AS f, MAX(checked_at), COUNT(*), MAX(na) FROM d GROUP BY service, g ORDER BY service, f`,
  ],
  'sql-live-settings-after-deletes': [
    // latest 'set' wins, deletes ignored
    `WITH r AS (SELECT name, value, ROW_NUMBER() OVER (PARTITION BY name ORDER BY changed_at DESC, id DESC) AS rn FROM setting_log WHERE op = 'set')
     SELECT name, value FROM r WHERE rn = 1 ORDER BY name`,
    // tie broken by the lowest id
    `WITH r AS (SELECT name, op, value, ROW_NUMBER() OVER (PARTITION BY name ORDER BY changed_at DESC, id) AS rn FROM setting_log)
     SELECT name, value FROM r WHERE rn = 1 AND op = 'set' ORDER BY name`,
    // highest id taken as latest
    `WITH r AS (SELECT name, op, value, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id DESC) AS rn FROM setting_log)
     SELECT name, value FROM r WHERE rn = 1 AND op = 'set' ORDER BY name`,
    // join on MAX(changed_at) with no tie-break
    `SELECT l.name, l.value FROM setting_log l
     JOIN (SELECT name, MAX(changed_at) AS m FROM setting_log GROUP BY name) x ON x.name = l.name AND x.m = l.changed_at
     WHERE l.op = 'set' ORDER BY l.name, l.value`,
  ],
  'sql-raw-parts-per-assembly': [
    // UNION removes identical rows that came from different paths
    `WITH RECURSIVE w(product, item, qty) AS (
       SELECT parent, child, qty FROM bom WHERE parent NOT IN (SELECT child FROM bom)
       UNION
       SELECT w.product, b.child, w.qty * b.qty FROM w JOIN bom b ON b.parent = w.item)
     SELECT product, item, SUM(qty) FROM w WHERE item NOT IN (SELECT parent FROM bom) GROUP BY product, item ORDER BY product, item`,
    // quantities added, not multiplied down the path
    `WITH RECURSIVE w(product, item, qty) AS (
       SELECT parent, child, qty FROM bom WHERE parent NOT IN (SELECT child FROM bom)
       UNION ALL
       SELECT w.product, b.child, b.qty FROM w JOIN bom b ON b.parent = w.item)
     SELECT product, item, SUM(qty) FROM w WHERE item NOT IN (SELECT parent FROM bom) GROUP BY product, item ORDER BY product, item`,
    // direct children only
    `SELECT parent, child, qty FROM bom
     WHERE parent NOT IN (SELECT child FROM bom) AND child NOT IN (SELECT parent FROM bom) ORDER BY parent, child`,
    // starts from every parent, sub-assemblies included
    `WITH RECURSIVE w(product, item, qty) AS (
       SELECT parent, child, qty FROM bom
       UNION ALL
       SELECT w.product, b.child, w.qty * b.qty FROM w JOIN bom b ON b.parent = w.item)
     SELECT product, item, SUM(qty) FROM w WHERE item NOT IN (SELECT parent FROM bom) GROUP BY product, item ORDER BY product, item`,
  ],
  'sql-fewest-flights-from-hub': [
    // routes treated as two-way
    `WITH RECURSIVE reach(code, hops) AS (
       SELECT code, 0 FROM airports WHERE is_hub = 1
       UNION
       SELECT CASE WHEN r.origin = reach.code THEN r.destination ELSE r.origin END, reach.hops + 1
       FROM reach JOIN routes r ON r.origin = reach.code OR r.destination = reach.code
       WHERE reach.hops < (SELECT COUNT(*) FROM airports))
     SELECT a.code, b.f FROM airports a LEFT JOIN (SELECT code, MIN(hops) AS f FROM reach GROUP BY code) b ON b.code = a.code
     ORDER BY b.f IS NULL, b.f, a.code`,
    // INNER JOIN: unreachable airports missing
    `WITH RECURSIVE reach(code, hops) AS (
       SELECT code, 0 FROM airports WHERE is_hub = 1
       UNION
       SELECT r.destination, reach.hops + 1 FROM reach JOIN routes r ON r.origin = reach.code
       WHERE reach.hops < (SELECT COUNT(*) FROM airports))
     SELECT code, MIN(hops) AS f FROM reach GROUP BY code ORDER BY f, code`,
    // NULLs sort first
    `WITH RECURSIVE reach(code, hops) AS (
       SELECT code, 0 FROM airports WHERE is_hub = 1
       UNION
       SELECT r.destination, reach.hops + 1 FROM reach JOIN routes r ON r.origin = reach.code
       WHERE reach.hops < (SELECT COUNT(*) FROM airports))
     SELECT a.code, b.f FROM airports a LEFT JOIN (SELECT code, MIN(hops) AS f FROM reach GROUP BY code) b ON b.code = a.code
     ORDER BY b.f, a.code`,
    // only looks two flights out
    `WITH RECURSIVE reach(code, hops) AS (
       SELECT code, 0 FROM airports WHERE is_hub = 1
       UNION
       SELECT r.destination, reach.hops + 1 FROM reach JOIN routes r ON r.origin = reach.code WHERE reach.hops < 2)
     SELECT a.code, b.f FROM airports a LEFT JOIN (SELECT code, MIN(hops) AS f FROM reach GROUP BY code) b ON b.code = a.code
     ORDER BY b.f IS NULL, b.f, a.code`,
    // longest loop-free walk instead of the shortest
    `WITH RECURSIVE reach(code, hops) AS (
       SELECT code, 0 FROM airports WHERE is_hub = 1
       UNION
       SELECT r.destination, reach.hops + 1 FROM reach JOIN routes r ON r.origin = reach.code
       WHERE reach.hops < (SELECT COUNT(*) FROM airports))
     SELECT a.code, b.f FROM airports a LEFT JOIN (SELECT code, MAX(hops) AS f FROM reach GROUP BY code) b ON b.code = a.code
     ORDER BY b.f IS NULL, b.f, a.code`,
  ],
  'sql-closest-shared-manager': [
    // chains exclude the person: a manager is never their own report's arbiter
    `WITH RECURSIVE chain(person, ancestor, dist) AS (
       SELECT id, manager_id, 1 FROM staff WHERE manager_id IS NOT NULL
       UNION ALL
       SELECT c.person, s.manager_id, c.dist + 1 FROM chain c JOIN staff s ON s.id = c.ancestor WHERE s.manager_id IS NOT NULL),
     sh AS (SELECT p.id AS pid, ca.ancestor, ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY ca.dist) AS rn
            FROM pairs p JOIN chain ca ON ca.person = p.a_id JOIN chain cb ON cb.person = p.b_id AND cb.ancestor = ca.ancestor)
     SELECT p.id, s.name FROM pairs p LEFT JOIN sh ON sh.pid = p.id AND sh.rn = 1 LEFT JOIN staff s ON s.id = sh.ancestor ORDER BY p.id`,
    // farthest shared person: the head of the tree
    `WITH RECURSIVE chain(person, ancestor, dist) AS (
       SELECT id, id, 0 FROM staff
       UNION ALL
       SELECT c.person, s.manager_id, c.dist + 1 FROM chain c JOIN staff s ON s.id = c.ancestor WHERE s.manager_id IS NOT NULL),
     sh AS (SELECT p.id AS pid, ca.ancestor, ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY ca.dist DESC) AS rn
            FROM pairs p JOIN chain ca ON ca.person = p.a_id JOIN chain cb ON cb.person = p.b_id AND cb.ancestor = ca.ancestor)
     SELECT p.id, s.name FROM pairs p LEFT JOIN sh ON sh.pid = p.id AND sh.rn = 1 LEFT JOIN staff s ON s.id = sh.ancestor ORDER BY p.id`,
    // INNER JOIN: pairs with nobody in common disappear
    `WITH RECURSIVE chain(person, ancestor, dist) AS (
       SELECT id, id, 0 FROM staff
       UNION ALL
       SELECT c.person, s.manager_id, c.dist + 1 FROM chain c JOIN staff s ON s.id = c.ancestor WHERE s.manager_id IS NOT NULL),
     sh AS (SELECT p.id AS pid, ca.ancestor, ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY ca.dist) AS rn
            FROM pairs p JOIN chain ca ON ca.person = p.a_id JOIN chain cb ON cb.person = p.b_id AND cb.ancestor = ca.ancestor)
     SELECT sh.pid, s.name FROM sh JOIN staff s ON s.id = sh.ancestor WHERE sh.rn = 1 ORDER BY sh.pid`,
    // only checks whether the two have the same direct manager
    `SELECT p.id, CASE WHEN a.manager_id = b.manager_id THEN m.name END
     FROM pairs p JOIN staff a ON a.id = p.a_id JOIN staff b ON b.id = p.b_id LEFT JOIN staff m ON m.id = a.manager_id ORDER BY p.id`,
  ],
};
