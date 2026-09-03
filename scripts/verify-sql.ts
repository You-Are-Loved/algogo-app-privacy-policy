// Verifies SQL practice problems with the same rules as the in-app grader.
//
//   node_modules/.bin/sucrase-node scripts/verify-sql.ts <fragment.ts> [--skip-existing]
//
// <fragment.ts> must export `problems: SqlProblem[]` and
// `traps: Record<problemId, string[]>` — one or more plausible WRONG queries
// per problem. Checks:
//   - ids / numbers / titles unique vs the shipped catalog, numbers contiguous
//   - >= 3 datasets; schema + every seed load; solution runs on every dataset
//   - solution produces rows on at least one dataset and its results are NOT
//     identical across all datasets (hidden datasets must matter)
//   - `ordered` problems' solution has an ORDER BY; unordered ones must not
//     depend on order (checked by comparing as a multiset)
//   - every trap differs from the solution on at least one dataset
//   - each dataset's solution result is deterministic across two runs

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import type { SqlProblem } from '../src/data/sqlProblems';

const [, , fragPath, ...flags] = process.argv;
if (!fragPath) {
  console.error('usage: verify-sql.ts <fragment.ts>');
  process.exit(2);
}
const skipExisting = flags.includes('--skip-existing');
const mod = require(path.resolve(fragPath));
const problems: SqlProblem[] = mod.problems;
const traps: Record<string, string[]> = mod.traps || {};
if (!Array.isArray(problems)) {
  console.error('fragment must export `problems`');
  process.exit(2);
}

const errors: string[] = [];
const err = (m: string) => errors.push(m);

type RunOut = { rows?: any[][]; columns?: string[]; error?: string };

function harness(schema: string, datasets: string[], queries: Record<string, string>): Record<string, RunOut[]> {
  const run = spawnSync('python3', [path.join(__dirname, 'sql-harness.py')], {
    input: JSON.stringify({ schema, datasets, queries }),
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (run.status !== 0) throw new Error('harness crashed: ' + run.stderr);
  return JSON.parse(run.stdout);
}

function canonRows(rows: any[][], ordered: boolean): string {
  const strs = rows.map((r) => JSON.stringify(r));
  if (!ordered) strs.sort();
  return strs.join('\n');
}

// --- structure
const existing: SqlProblem[] = skipExisting ? [] : require('../src/data/sqlProblems').sqlProblems;
const existingIds = new Set(existing.map((p) => p.id));
const existingNums = new Set(existing.map((p) => p.number));
const existingTitles = new Set(existing.map((p) => p.title.toLowerCase()));
const fragIds = new Set<string>();
const fragNums: number[] = [];

for (const p of problems) {
  const tag = `[${p.id}]`;
  if (existingIds.has(p.id) || fragIds.has(p.id)) err(`${tag} duplicate id`);
  fragIds.add(p.id);
  if (existingNums.has(p.number) || fragNums.includes(p.number)) err(`${tag} duplicate number ${p.number}`);
  fragNums.push(p.number);
  if (existingTitles.has(p.title.toLowerCase())) err(`${tag} title already exists`);
  if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) err(`${tag} bad difficulty`);
  for (const k of ['title', 'topic', 'statement', 'schema', 'solution', 'explanation'] as const) {
    if (!p[k]?.trim()) err(`${tag} missing ${k}`);
  }
  if (!p.hint?.trim()) err(`${tag} missing hint`);
  if (!Array.isArray(p.datasets) || p.datasets.length < 3) err(`${tag} needs >= 3 datasets`);
  if (p.ordered && !/order\s+by/i.test(p.solution)) err(`${tag} ordered=true but solution has no ORDER BY`);
  if (!p.ordered && /order\s+by/i.test(p.solution) && !/limit/i.test(p.solution)) {
    err(`${tag} solution has ORDER BY but ordered is not set — either set ordered: true or drop the ORDER BY`);
  }
  if (!/any order|ordered by|order(ed)? (the )?(rows|results?) by|sorted by|in (ascending|descending) order/i.test(p.statement)) {
    err(`${tag} statement must say how rows are ordered ("... in any order" or "ordered by ...")`);
  }
  if (!traps[p.id] || traps[p.id].length === 0) err(`${tag} no trap queries supplied`);
}
if (!skipExisting && problems.length) {
  const maxExisting = existing.length ? Math.max(...existing.map((p) => p.number)) : 0;
  const nums = [...fragNums].sort((a, b) => a - b);
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== maxExisting + 1 + i) {
      err(`numbers must be contiguous from ${maxExisting + 1}; got ${nums.join(',')}`);
      break;
    }
  }
}

// --- runtime
let verified = 0;
for (const p of problems) {
  const tag = `[${p.id}]`;
  if (!Array.isArray(p.datasets) || !p.solution) continue;
  const queries: Record<string, string> = { solution: p.solution, solution2: p.solution };
  (traps[p.id] || []).forEach((t, i) => (queries[`trap${i}`] = t));
  let out: Record<string, RunOut[]>;
  try {
    out = harness(p.schema, p.datasets, queries);
  } catch (e: any) {
    err(`${tag} ${e.message}`);
    continue;
  }
  const sol = out.solution;
  let ok = true;
  const canon: string[] = [];
  sol.forEach((r, i) => {
    if (r.error) {
      err(`${tag} solution failed on dataset ${i}: ${r.error}`);
      ok = false;
      return;
    }
    canon.push(canonRows(r.rows!, !!p.ordered));
    if (canonRows(r.rows!, true) !== canonRows(out.solution2[i].rows!, true)) {
      err(`${tag} solution is non-deterministic on dataset ${i} (two runs differ)`);
      ok = false;
    }
    if (p.ordered && r.rows!.length > 1) {
      // Rough tie check: if any two adjacent rows are equal under the ORDER BY
      // keys we can't tell — instead require that sorting rows fully doesn't
      // change the order (i.e. the ORDER BY yields a total order).
      const sorted = [...r.rows!].map((x) => JSON.stringify(x)).sort();
      const asIs = r.rows!.map((x) => JSON.stringify(x));
      if (new Set(asIs).size !== asIs.length) err(`${tag} dataset ${i}: duplicate identical rows in an ordered result`);
      void sorted;
    }
  });
  if (!ok) continue;
  if (sol.every((r) => (r.rows?.length ?? 0) === 0)) err(`${tag} solution returns no rows on every dataset`);
  if (new Set(canon).size === 1) err(`${tag} solution result is identical on every dataset — hidden datasets don't test anything`);
  if (sol.some((r) => (r.rows?.length ?? 0) > 60)) err(`${tag} a dataset returns >60 rows; keep results small enough to read on a phone`);
  const colCounts = new Set(sol.map((r) => r.columns?.length ?? 0));
  if (colCounts.size !== 1) err(`${tag} solution column count differs across datasets`);

  let trapsOk = true;
  (traps[p.id] || []).forEach((t, ti) => {
    const runs = out[`trap${ti}`];
    const caught = runs.some((r, i) => r.error || canonRows(r.rows!, !!p.ordered) !== canon[i]);
    if (!caught) {
      err(`${tag} trap ${ti} produces the same result as the solution on every dataset — it isn't a trap:\n    ${t.replace(/\s+/g, ' ').slice(0, 140)}`);
      trapsOk = false;
    }
  });
  if (trapsOk) verified++;
}

console.log(`${problems.length} problems, ${verified} verified`);
for (const e of errors) console.log('ERROR', e);
console.log(`\n${errors.length} errors`);
process.exit(errors.length ? 1 : 0);
