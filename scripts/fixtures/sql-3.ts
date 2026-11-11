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
    `WITH d AS (SELECT courier, minutes, ROW_NUMBER() OVER (PARTITION BY courier ORDER BY minutes) AS rn, COUNT(*) OVER (PARTITION BY courier) AS n FROM deliveries)
     SELECT courier, COUNT(minutes) FILTER (WHERE 1) + 0 * MAX(n) + (SELECT COUNT(x.minutes) FROM deliveries x WHERE x.courier = d.courier) - COUNT(minutes), AVG(minutes)
     FROM d WHERE rn IN ((n + 1) / 2, (n + 2) / 2) GROUP BY courier HAVING (SELECT COUNT(x.minutes) FROM deliveries x WHERE x.courier = d.courier) > 0 ORDER BY courier`,
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
};
