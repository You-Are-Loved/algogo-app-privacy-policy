export { problems } from '../../src/data/more/sql-2';

// Plausible wrong queries: each must differ from the reference on at least one dataset.
export const traps: Record<string, string[]> = {
  'sql-work-queue-undated-last': [
    // NULLs sort first in SQLite
    `SELECT id, title, due_on FROM tasks WHERE done = 0 ORDER BY due_on, priority DESC, id;`,
    // priority tie-break in the wrong direction
    `SELECT id, title, due_on FROM tasks WHERE done = 0 ORDER BY due_on IS NULL, due_on, priority, id;`,
    // forgot to exclude finished tasks
    `SELECT id, title, due_on FROM tasks ORDER BY due_on IS NULL, due_on, priority DESC, id;`,
  ],
  'sql-flats-two-cities-in-budget': [
    // AND binds tighter than OR
    `SELECT id, city, rent FROM flats WHERE city = 'Leeds' OR city = 'York' AND rent BETWEEN 900 AND 1400 ORDER BY rent, id;`,
    // exclusive limits
    `SELECT id, city, rent FROM flats WHERE city IN ('Leeds', 'York') AND rent > 900 AND rent < 1400 ORDER BY rent, id;`,
  ],
  'sql-parcels-not-on-customs-hold': [
    `SELECT id, destination, hold_code FROM parcels WHERE hold_code <> 'CUSTOMS' ORDER BY id;`,
    `SELECT id, destination, hold_code FROM parcels WHERE NOT (hold_code = 'CUSTOMS') ORDER BY id;`,
    `SELECT id, destination, hold_code FROM parcels WHERE hold_code IS NULL ORDER BY id;`,
  ],
  'sql-motion-vote-outcomes': [
    // inner join drops motions without votes
    `SELECT m.id,
       COUNT(CASE WHEN v.choice = 'yes' THEN 1 END) AS yes,
       COUNT(CASE WHEN v.choice = 'no' THEN 1 END) AS no,
       COUNT(CASE WHEN v.choice = 'abstain' THEN 1 END) AS abstain,
       CASE WHEN COUNT(CASE WHEN v.choice IN ('yes', 'no') THEN 1 END) < 3 THEN 'no quorum'
            WHEN COUNT(CASE WHEN v.choice = 'yes' THEN 1 END) > COUNT(CASE WHEN v.choice = 'no' THEN 1 END) THEN 'passed'
            ELSE 'failed' END AS outcome
FROM motions m JOIN votes v ON v.motion_id = m.id
GROUP BY m.id ORDER BY m.id;`,
    // quorum counts abstentions
    `SELECT m.id,
       COUNT(CASE WHEN v.choice = 'yes' THEN 1 END) AS yes,
       COUNT(CASE WHEN v.choice = 'no' THEN 1 END) AS no,
       COUNT(CASE WHEN v.choice = 'abstain' THEN 1 END) AS abstain,
       CASE WHEN COUNT(v.id) < 3 THEN 'no quorum'
            WHEN COUNT(CASE WHEN v.choice = 'yes' THEN 1 END) > COUNT(CASE WHEN v.choice = 'no' THEN 1 END) THEN 'passed'
            ELSE 'failed' END AS outcome
FROM motions m LEFT JOIN votes v ON v.motion_id = m.id
GROUP BY m.id ORDER BY m.id;`,
    // a tie passes
    `SELECT m.id,
       COUNT(CASE WHEN v.choice = 'yes' THEN 1 END) AS yes,
       COUNT(CASE WHEN v.choice = 'no' THEN 1 END) AS no,
       COUNT(CASE WHEN v.choice = 'abstain' THEN 1 END) AS abstain,
       CASE WHEN COUNT(CASE WHEN v.choice IN ('yes', 'no') THEN 1 END) < 3 THEN 'no quorum'
            WHEN COUNT(CASE WHEN v.choice = 'yes' THEN 1 END) >= COUNT(CASE WHEN v.choice = 'no' THEN 1 END) THEN 'passed'
            ELSE 'failed' END AS outcome
FROM motions m LEFT JOIN votes v ON v.motion_id = m.id
GROUP BY m.id ORDER BY m.id;`,
  ],
  'sql-unit-free-after-last-lease': [
    // MAX ignores the open-ended lease
    `SELECT unit, COUNT(*) AS leases, MAX(ends_on) AS free_after FROM leases GROUP BY unit ORDER BY unit;`,
    // counts only leases that have an end date
    `SELECT unit, COUNT(ends_on) AS leases,
       CASE WHEN COUNT(*) = COUNT(ends_on) THEN MAX(ends_on) END AS free_after
FROM leases GROUP BY unit ORDER BY unit;`,
    // drops units whose only leases are open-ended, and ignores open ones elsewhere
    `SELECT unit, COUNT(*) AS leases, MAX(ends_on) AS free_after FROM leases WHERE ends_on IS NOT NULL GROUP BY unit ORDER BY unit;`,
  ],
  'sql-spotless-inspection-records': [
    // WHERE removes the bad inspections instead of disqualifying the kitchen
    `SELECT kitchen, COUNT(*) AS inspections, MIN(score) AS lowest_score
FROM inspections WHERE score >= 80
GROUP BY kitchen HAVING COUNT(*) >= 2
ORDER BY lowest_score DESC, kitchen;`,
    // pending (NULL) scores are ignored by MIN
    `SELECT kitchen, COUNT(*) AS inspections, MIN(score) AS lowest_score
FROM inspections
GROUP BY kitchen HAVING COUNT(*) >= 2 AND MIN(score) >= 80
ORDER BY lowest_score DESC, kitchen;`,
    // forgot the two-inspection minimum
    `SELECT kitchen, COUNT(*) AS inspections, MIN(score) AS lowest_score
FROM inspections
GROUP BY kitchen HAVING COUNT(score) = COUNT(*) AND MIN(score) >= 80
ORDER BY lowest_score DESC, kitchen;`,
  ],
  'sql-speakers-sharing-a-slot': [
    // both orientations of every pair
    `SELECT a.speaker, b.speaker, a.room, a.slot FROM talks a
JOIN talks b ON b.room = a.room AND b.slot = a.slot AND a.speaker <> b.speaker
ORDER BY a.slot, a.room, a.speaker, b.speaker;`,
    // same slot but any room
    `SELECT a.speaker, b.speaker, a.room, a.slot FROM talks a
JOIN talks b ON b.slot = a.slot AND a.speaker < b.speaker
ORDER BY a.slot, a.room, a.speaker, b.speaker;`,
    // pair oriented by id, not by name
    `SELECT a.speaker, b.speaker, a.room, a.slot FROM talks a
JOIN talks b ON b.room = a.room AND b.slot = a.slot AND a.id < b.id
ORDER BY a.slot, a.room, a.speaker, b.speaker;`,
  ],
  'sql-frequent-session-partners': [
    // both orientations
    `SELECT ma.name, mb.name, COUNT(*) AS shared_sessions
FROM session_players pa
JOIN session_players pb ON pb.session_id = pa.session_id
JOIN musicians ma ON ma.id = pa.musician_id
JOIN musicians mb ON mb.id = pb.musician_id
WHERE ma.name <> mb.name
GROUP BY ma.name, mb.name HAVING COUNT(*) >= 2
ORDER BY shared_sessions DESC, ma.name, mb.name;`,
    // pair oriented by id, not by name
    `SELECT ma.name, mb.name, COUNT(*) AS shared_sessions
FROM session_players pa
JOIN session_players pb ON pb.session_id = pa.session_id AND pa.musician_id < pb.musician_id
JOIN musicians ma ON ma.id = pa.musician_id
JOIN musicians mb ON mb.id = pb.musician_id
GROUP BY ma.name, mb.name HAVING COUNT(*) >= 2
ORDER BY shared_sessions DESC, ma.name, mb.name;`,
    // more than 2 instead of at least 2
    `SELECT ma.name, mb.name, COUNT(*) AS shared_sessions
FROM session_players pa
JOIN session_players pb ON pb.session_id = pa.session_id
JOIN musicians ma ON ma.id = pa.musician_id
JOIN musicians mb ON mb.id = pb.musician_id
WHERE ma.name < mb.name
GROUP BY ma.name, mb.name HAVING COUNT(*) > 2
ORDER BY shared_sessions DESC, ma.name, mb.name;`,
  ],
  'sql-project-hours-and-expenses': [
    // join fan-out: timesheets x expenses
    `SELECT p.name, COALESCE(SUM(t.hours), 0), COALESCE(SUM(e.amount_cents), 0)
FROM projects p
LEFT JOIN timesheets t ON t.project_id = p.id
LEFT JOIN expenses e ON e.project_id = p.id
GROUP BY p.id, p.name ORDER BY p.name;`,
    // SUM(DISTINCT) "fix" collapses equal values
    `SELECT p.name, COALESCE(SUM(DISTINCT t.hours), 0), COALESCE(SUM(DISTINCT e.amount_cents), 0)
FROM projects p
LEFT JOIN timesheets t ON t.project_id = p.id
LEFT JOIN expenses e ON e.project_id = p.id
GROUP BY p.id, p.name ORDER BY p.name;`,
    // pre-aggregated but inner-joined: projects missing one side vanish
    `SELECT p.name, t.total_hours, e.total_cents
FROM projects p
JOIN (SELECT project_id, SUM(hours) AS total_hours FROM timesheets GROUP BY project_id) t ON t.project_id = p.id
JOIN (SELECT project_id, SUM(amount_cents) AS total_cents FROM expenses GROUP BY project_id) e ON e.project_id = p.id
ORDER BY p.name;`,
  ],
  'sql-effective-permissions': [
    // UNION ALL keeps duplicates
    `SELECT g.username, g.perm FROM (
  SELECT ur.username, rg.perm FROM user_roles ur JOIN role_grants rg ON rg.role = ur.role
  UNION ALL
  SELECT username, perm FROM direct_grants
) g
WHERE NOT EXISTS (SELECT 1 FROM revocations r WHERE r.username = g.username AND r.perm = g.perm)
ORDER BY g.username, g.perm;`,
    // revocations applied to direct grants only
    `SELECT ur.username, rg.perm FROM user_roles ur JOIN role_grants rg ON rg.role = ur.role
UNION
SELECT d.username, d.perm FROM direct_grants d
WHERE NOT EXISTS (SELECT 1 FROM revocations r WHERE r.username = d.username AND r.perm = d.perm)
ORDER BY username, perm;`,
    // revocation matched on perm only
    `SELECT DISTINCT g.username, g.perm FROM (
  SELECT ur.username, rg.perm FROM user_roles ur JOIN role_grants rg ON rg.role = ur.role
  UNION
  SELECT username, perm FROM direct_grants
) g
WHERE g.perm NOT IN (SELECT perm FROM revocations)
ORDER BY g.username, g.perm;`,
  ],
  'sql-winning-bid-per-auction': [
    // join back on MAX(amount): ties give two winners
    `SELECT a.id, a.item, b.bidder, b.amount_cents
FROM auctions a
LEFT JOIN bids b ON b.auction_id = a.id AND b.amount_cents >= a.reserve_cents
 AND b.amount_cents = (SELECT MAX(x.amount_cents) FROM bids x WHERE x.auction_id = a.id)
ORDER BY a.id;`,
    // conditions in WHERE: auctions with no qualifying bid vanish
    `SELECT a.id, a.item, b.bidder, b.amount_cents
FROM auctions a
LEFT JOIN bids b ON b.auction_id = a.id
WHERE b.amount_cents >= a.reserve_cents
  AND NOT EXISTS (
    SELECT 1 FROM bids x WHERE x.auction_id = b.auction_id
      AND (x.amount_cents > b.amount_cents
           OR (x.amount_cents = b.amount_cents AND x.placed_at < b.placed_at)
           OR (x.amount_cents = b.amount_cents AND x.placed_at = b.placed_at AND x.id < b.id)))
ORDER BY a.id;`,
    // tie goes to the latest bid
    `SELECT id, item, bidder, amount_cents FROM (
  SELECT a.id, a.item, b.bidder, b.amount_cents,
         ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY b.amount_cents DESC, b.placed_at DESC, b.id) AS rn
  FROM auctions a
  LEFT JOIN bids b ON b.auction_id = a.id AND b.amount_cents >= a.reserve_cents
) WHERE rn = 1 ORDER BY id;`,
    // reserve ignored
    `SELECT id, item, bidder, amount_cents FROM (
  SELECT a.id, a.item, b.bidder, b.amount_cents,
         ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY b.amount_cents DESC, b.placed_at, b.id) AS rn
  FROM auctions a
  LEFT JOIN bids b ON b.auction_id = a.id
) WHERE rn = 1 ORDER BY id;`,
    // tie broken by id alone, skipping placed_at
    `SELECT id, item, bidder, amount_cents FROM (
  SELECT a.id, a.item, b.bidder, b.amount_cents,
         ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY b.amount_cents DESC, b.id) AS rn
  FROM auctions a
  LEFT JOIN bids b ON b.auction_id = a.id AND b.amount_cents >= a.reserve_cents
) WHERE rn = 1 ORDER BY id;`,
  ],
  'sql-codes-with-literal-underscore': [
    // underscore is a single-character wildcard
    `SELECT id, code FROM promo_codes WHERE code LIKE 'VIP_%' ORDER BY id;`,
    // matches VIP_ anywhere, not just at the start
    `SELECT id, code FROM promo_codes WHERE code LIKE '%VIP!_%' ESCAPE '!' ORDER BY id;`,
    // demands at least one character after the underscore
    `SELECT id, code FROM promo_codes WHERE code LIKE 'VIP!__%' ESCAPE '!' ORDER BY id;`,
  ],
  'sql-recipes-with-exact-tag': [
    `SELECT id, name FROM recipes WHERE tags LIKE '%nut%' ORDER BY id;`,
    // handles alone / first / last but not the middle of the list
    `SELECT id, name FROM recipes WHERE tags = 'nut' OR tags LIKE 'nut,%' OR tags LIKE '%,nut' ORDER BY id;`,
    // only finds the tag in the middle
    `SELECT id, name FROM recipes WHERE tags LIKE '%,nut,%' ORDER BY id;`,
    // prefix test on each tag still matches nut-free and nutmeg
    `SELECT id, name FROM recipes WHERE ',' || tags LIKE '%,nut%' ORDER BY id;`,
  ],
  'sql-split-last-comma-first': [
    // no TRIM
    `SELECT id,
       CASE WHEN INSTR(raw_name, ',') > 0 THEN SUBSTR(raw_name, 1, INSTR(raw_name, ',') - 1) ELSE raw_name END,
       CASE WHEN INSTR(raw_name, ',') > 0 THEN NULLIF(SUBSTR(raw_name, INSTR(raw_name, ',') + 1), '') END
FROM authors ORDER BY id;`,
    // no-comma case not handled
    `SELECT id,
       TRIM(SUBSTR(raw_name, 1, INSTR(raw_name, ',') - 1)),
       NULLIF(TRIM(SUBSTR(raw_name, INSTR(raw_name, ',') + 1)), '')
FROM authors ORDER BY id;`,
    // empty string instead of NULL for a missing first name
    `SELECT id,
       TRIM(CASE WHEN INSTR(raw_name, ',') > 0 THEN SUBSTR(raw_name, 1, INSTR(raw_name, ',') - 1) ELSE raw_name END),
       CASE WHEN INSTR(raw_name, ',') > 0 THEN TRIM(SUBSTR(raw_name, INSTR(raw_name, ',') + 1)) END
FROM authors ORDER BY id;`,
  ],
  'sql-seats-held-twice': [
    // seat label alone is not the key
    `SELECT MIN(show_id), seat, COUNT(*), MIN(id) FROM seat_holds GROUP BY seat HAVING COUNT(*) > 1 ORDER BY 1, seat;`,
    // misses a seat held twice by the same person
    `SELECT show_id, seat, COUNT(*), MIN(id) FROM seat_holds GROUP BY show_id, seat HAVING COUNT(DISTINCT held_by) > 1 ORDER BY show_id, seat;`,
    // no HAVING: lists every seat
    `SELECT show_id, seat, COUNT(*), MIN(id) FROM seat_holds GROUP BY show_id, seat ORDER BY show_id, seat;`,
  ],
  'sql-primary-address-violations': [
    // inner join: customers with no addresses are never seen
    `SELECT c.id, c.name, SUM(a.is_primary),
       CASE WHEN SUM(a.is_primary) = 0 THEN 'none' ELSE 'multiple' END
FROM customers c JOIN addresses a ON a.customer_id = c.id
GROUP BY c.id, c.name HAVING SUM(a.is_primary) <> 1 ORDER BY c.id;`,
    // SUM is NULL for customers with no addresses; NULL <> 1 is not true
    `SELECT c.id, c.name, COALESCE(SUM(a.is_primary), 0),
       CASE WHEN COALESCE(SUM(a.is_primary), 0) = 0 THEN 'none' ELSE 'multiple' END
FROM customers c LEFT JOIN addresses a ON a.customer_id = c.id
GROUP BY c.id, c.name HAVING SUM(a.is_primary) <> 1 ORDER BY c.id;`,
    // COUNT(*) counts the NULL-padded row as one primary
    `SELECT c.id, c.name, COUNT(*),
       CASE WHEN COUNT(*) = 0 THEN 'none' ELSE 'multiple' END
FROM customers c LEFT JOIN addresses a ON a.customer_id = c.id AND a.is_primary = 1
GROUP BY c.id, c.name HAVING COUNT(*) <> 1 ORDER BY c.id;`,
  ],
  'sql-keep-fullest-vendor-record': [
    // newest row regardless of completeness
    `SELECT v.tax_id, v.id, (v.phone IS NOT NULL) + (v.email IS NOT NULL) + (v.website IS NOT NULL),
       (SELECT COUNT(*) FROM vendors x WHERE x.tax_id = v.tax_id) - 1
FROM vendors v
WHERE v.id = (SELECT MAX(x.id) FROM vendors x WHERE x.tax_id = v.tax_id)
ORDER BY v.tax_id;`,
    // tie goes to the lowest id
    `SELECT tax_id, id, filled, n - 1 FROM (
  SELECT id, tax_id,
         (phone IS NOT NULL) + (email IS NOT NULL) + (website IS NOT NULL) AS filled,
         COUNT(*) OVER (PARTITION BY tax_id) AS n,
         ROW_NUMBER() OVER (PARTITION BY tax_id
           ORDER BY (phone IS NOT NULL) + (email IS NOT NULL) + (website IS NOT NULL) DESC, id) AS rn
  FROM vendors
) WHERE rn = 1 ORDER BY tax_id;`,
    // MAX(id) and MAX(filled) taken independently
    `SELECT tax_id, MAX(id),
       MAX((phone IS NOT NULL) + (email IS NOT NULL) + (website IS NOT NULL)),
       COUNT(*) - 1
FROM vendors GROUP BY tax_id ORDER BY tax_id;`,
    // duplicates counts the kept row too
    `SELECT tax_id, id, filled, n FROM (
  SELECT id, tax_id,
         (phone IS NOT NULL) + (email IS NOT NULL) + (website IS NOT NULL) AS filled,
         COUNT(*) OVER (PARTITION BY tax_id) AS n,
         ROW_NUMBER() OVER (PARTITION BY tax_id
           ORDER BY (phone IS NOT NULL) + (email IS NOT NULL) + (website IS NOT NULL) DESC, id DESC) AS rn
  FROM vendors
) WHERE rn = 1 ORDER BY tax_id;`,
  ],
  'sql-passed-every-mandatory-module': [
    // counts passing attempts, so a retake makes up for a missing module
    `SELECT t.id, t.name FROM trainees t
JOIN attempts a ON a.trainee_id = t.id AND a.passed = 1
JOIN modules m ON m.id = a.module_id AND m.mandatory = 1
GROUP BY t.id, t.name
HAVING COUNT(*) = (SELECT COUNT(*) FROM modules WHERE mandatory = 1)
ORDER BY t.id;`,
    // counts optional modules towards the total
    `SELECT t.id, t.name FROM trainees t
LEFT JOIN attempts a ON a.trainee_id = t.id AND a.passed = 1
GROUP BY t.id, t.name
HAVING COUNT(DISTINCT a.module_id) >= (SELECT COUNT(*) FROM modules WHERE mandatory = 1)
ORDER BY t.id;`,
    // ignores the passed flag
    `SELECT t.id, t.name FROM trainees t
WHERE NOT EXISTS (
  SELECT 1 FROM modules m WHERE m.mandatory = 1
    AND NOT EXISTS (SELECT 1 FROM attempts a WHERE a.trainee_id = t.id AND a.module_id = m.id))
ORDER BY t.id;`,
    // inner-join count: correct except when no module is mandatory (returns nobody)
    `SELECT t.id, t.name FROM trainees t
JOIN attempts a ON a.trainee_id = t.id AND a.passed = 1
JOIN modules m ON m.id = a.module_id AND m.mandatory = 1
GROUP BY t.id, t.name
HAVING COUNT(DISTINCT m.id) = (SELECT COUNT(*) FROM modules WHERE mandatory = 1)
ORDER BY t.id;`,
  ],
  'sql-kits-with-identical-contents': [
    // same number of parts is not the same parts
    `WITH sizes AS (SELECT kit, COUNT(*) AS n FROM kit_parts GROUP BY kit)
SELECT a.kit, b.kit, a.n FROM sizes a JOIN sizes b ON a.n = b.n AND a.kit < b.kit
ORDER BY a.kit, b.kit;`,
    // one-sided check accepts a subset
    `WITH sizes AS (SELECT kit, COUNT(*) AS n FROM kit_parts GROUP BY kit)
SELECT a.kit, b.kit, COUNT(*) FROM kit_parts a
JOIN kit_parts b ON b.part = a.part AND a.kit < b.kit
JOIN sizes sa ON sa.kit = a.kit
GROUP BY a.kit, b.kit, sa.n HAVING COUNT(*) = sa.n
ORDER BY a.kit, b.kit;`,
    // only checks that A's parts are all in B
    `SELECT a.kit, b.kit, (SELECT COUNT(*) FROM kit_parts p WHERE p.kit = a.kit)
FROM (SELECT DISTINCT kit FROM kit_parts) a
JOIN (SELECT DISTINCT kit FROM kit_parts) b ON a.kit < b.kit
WHERE NOT EXISTS (SELECT 1 FROM kit_parts p WHERE p.kit = a.kit
                  AND NOT EXISTS (SELECT 1 FROM kit_parts q WHERE q.kit = b.kit AND q.part = p.part))
ORDER BY a.kit, b.kit;`,
  ],
  'sql-normal-side-account-balances': [
    // debit minus credit for every kind
    `SELECT a.id, a.name, a.kind, COALESCE(SUM(p.debit_cents - p.credit_cents), 0)
FROM accounts a LEFT JOIN postings p ON p.account_id = a.id
GROUP BY a.id, a.name, a.kind ORDER BY a.id;`,
    // inner join loses accounts without postings
    `SELECT a.id, a.name, a.kind,
       SUM(CASE WHEN a.kind IN ('asset', 'expense') THEN p.debit_cents - p.credit_cents ELSE p.credit_cents - p.debit_cents END)
FROM accounts a JOIN postings p ON p.account_id = a.id
GROUP BY a.id, a.name, a.kind ORDER BY a.id;`,
    // NULL instead of 0 for accounts without postings
    `SELECT a.id, a.name, a.kind,
       SUM(CASE WHEN a.kind IN ('asset', 'expense') THEN p.debit_cents - p.credit_cents ELSE p.credit_cents - p.debit_cents END)
FROM accounts a LEFT JOIN postings p ON p.account_id = a.id
GROUP BY a.id, a.name, a.kind ORDER BY a.id;`,
  ],
  'sql-bank-vs-ledger-reconciliation': [
    // only looks from the bank side: never reports "missing in bank"
    `WITH bank AS (SELECT ref, SUM(amount_cents) AS cents FROM bank_lines GROUP BY ref),
     ledger AS (SELECT ref, SUM(amount_cents) AS cents FROM ledger_entries GROUP BY ref)
SELECT b.ref, b.cents, l.cents,
       CASE WHEN l.ref IS NULL THEN 'missing in ledger' ELSE 'amount mismatch' END
FROM bank b LEFT JOIN ledger l ON l.ref = b.ref
WHERE l.ref IS NULL OR b.cents <> l.cents
ORDER BY b.ref;`,
    // missing side treated as 0: a side that nets to 0 looks reconciled
    `WITH bank AS (SELECT ref, SUM(amount_cents) AS cents FROM bank_lines GROUP BY ref),
     ledger AS (SELECT ref, SUM(amount_cents) AS cents FROM ledger_entries GROUP BY ref),
     refs AS (SELECT ref FROM bank UNION SELECT ref FROM ledger)
SELECT r.ref, b.cents, l.cents,
       CASE WHEN l.ref IS NULL THEN 'missing in ledger' WHEN b.ref IS NULL THEN 'missing in bank' ELSE 'amount mismatch' END
FROM refs r LEFT JOIN bank b ON b.ref = r.ref LEFT JOIN ledger l ON l.ref = r.ref
WHERE COALESCE(b.cents, 0) <> COALESCE(l.cents, 0)
ORDER BY r.ref;`,
    // NULL comparison drops the one-sided refs
    `WITH bank AS (SELECT ref, SUM(amount_cents) AS cents FROM bank_lines GROUP BY ref),
     ledger AS (SELECT ref, SUM(amount_cents) AS cents FROM ledger_entries GROUP BY ref),
     refs AS (SELECT ref FROM bank UNION SELECT ref FROM ledger)
SELECT r.ref, b.cents, l.cents,
       CASE WHEN l.ref IS NULL THEN 'missing in ledger' WHEN b.ref IS NULL THEN 'missing in bank' ELSE 'amount mismatch' END
FROM refs r LEFT JOIN bank b ON b.ref = r.ref LEFT JOIN ledger l ON l.ref = r.ref
WHERE b.cents <> l.cents
ORDER BY r.ref;`,
    // row-by-row comparison without totalling split payments
    `SELECT DISTINCT b.ref, b.amount_cents, l.amount_cents,
       CASE WHEN l.ref IS NULL THEN 'missing in ledger' ELSE 'amount mismatch' END
FROM bank_lines b LEFT JOIN ledger_entries l ON l.ref = b.ref
WHERE l.ref IS NULL OR b.amount_cents <> l.amount_cents
UNION ALL
SELECT l.ref, NULL, SUM(l.amount_cents), 'missing in bank'
FROM ledger_entries l WHERE NOT EXISTS (SELECT 1 FROM bank_lines b WHERE b.ref = l.ref)
GROUP BY l.ref
ORDER BY 1;`,
  ],
  'sql-max-buildable-units': [
    // inner join: a part missing from stock stops limiting the product
    `SELECT b.product, MIN(s.on_hand / b.qty_per_unit) AS buildable
FROM bom b JOIN stock s ON s.part = b.part
GROUP BY b.product ORDER BY buildable DESC, b.product;`,
    // LEFT JOIN but MIN ignores the NULL
    `SELECT b.product, COALESCE(MIN(s.on_hand / b.qty_per_unit), 0) AS buildable
FROM bom b LEFT JOIN stock s ON s.part = b.part
GROUP BY b.product ORDER BY buildable DESC, b.product;`,
    // total stock over total requirement
    `SELECT b.product, SUM(COALESCE(s.on_hand, 0)) / SUM(b.qty_per_unit) AS buildable
FROM bom b LEFT JOIN stock s ON s.part = b.part
GROUP BY b.product ORDER BY buildable DESC, b.product;`,
    // rounds instead of truncating to whole units
    `SELECT b.product, CAST(ROUND(MIN(COALESCE(s.on_hand, 0) * 1.0 / b.qty_per_unit)) AS INTEGER) AS buildable
FROM bom b LEFT JOIN stock s ON s.part = b.part
GROUP BY b.product ORDER BY buildable DESC, b.product;`,
  ],
  'sql-stock-on-hand-from-movements': [
    // UNION collapses identical legs
    `WITH legs AS (
  SELECT to_wh AS warehouse, sku, qty FROM movements WHERE to_wh IS NOT NULL
  UNION
  SELECT from_wh, sku, -qty FROM movements WHERE from_wh IS NOT NULL
)
SELECT warehouse, sku, SUM(qty) FROM legs GROUP BY warehouse, sku HAVING SUM(qty) <> 0 ORDER BY warehouse, sku;`,
    // inbound only
    `SELECT to_wh, sku, SUM(qty) FROM movements WHERE to_wh IS NOT NULL
GROUP BY to_wh, sku HAVING SUM(qty) <> 0 ORDER BY to_wh, sku;`,
    // zero rows not removed
    `WITH legs AS (
  SELECT to_wh AS warehouse, sku, qty FROM movements WHERE to_wh IS NOT NULL
  UNION ALL
  SELECT from_wh, sku, -qty FROM movements WHERE from_wh IS NOT NULL
)
SELECT warehouse, sku, SUM(qty) FROM legs GROUP BY warehouse, sku ORDER BY warehouse, sku;`,
    // hides negative stock
    `WITH legs AS (
  SELECT to_wh AS warehouse, sku, qty FROM movements WHERE to_wh IS NOT NULL
  UNION ALL
  SELECT from_wh, sku, -qty FROM movements WHERE from_wh IS NOT NULL
)
SELECT warehouse, sku, SUM(qty) FROM legs GROUP BY warehouse, sku HAVING SUM(qty) > 0 ORDER BY warehouse, sku;`,
  ],
  'sql-surgery-count-zeros-kept': [
    // the legacy query with an ORDER BY
    `SELECT v.name, COUNT(a.id) AS surgeries FROM vets v
LEFT JOIN appointments a ON a.vet_id = v.id
WHERE a.kind = 'surgery'
GROUP BY v.id, v.name ORDER BY surgeries DESC, v.name;`,
    // OR IS NULL only rescues vets with no appointments at all
    `SELECT v.name, COUNT(a.id) AS surgeries FROM vets v
LEFT JOIN appointments a ON a.vet_id = v.id
WHERE a.kind = 'surgery' OR a.kind IS NULL
GROUP BY v.id, v.name ORDER BY surgeries DESC, v.name;`,
    // COUNT(*) counts the NULL-padded row
    `SELECT v.name, COUNT(*) AS surgeries FROM vets v
LEFT JOIN appointments a ON a.vet_id = v.id AND a.kind = 'surgery'
GROUP BY v.id, v.name ORDER BY surgeries DESC, v.name;`,
  ],
  'sql-march-events-half-open': [
    // the legacy filter
    `SELECT id, kind, created_at FROM events WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31' ORDER BY created_at, id;`,
    // inclusive upper bound lets in midnight on 1 April
    `SELECT id, kind, created_at FROM events WHERE created_at BETWEEN '2024-03-01 00:00:00' AND '2024-04-01 00:00:00' ORDER BY created_at, id;`,
    // month matched in any year
    `SELECT id, kind, created_at FROM events WHERE strftime('%m', created_at) = '03' ORDER BY created_at, id;`,
    // minute-precision end bound
    `SELECT id, kind, created_at FROM events WHERE created_at >= '2024-03-01' AND created_at <= '2024-03-31 23:59' ORDER BY created_at, id;`,
  ],
};
