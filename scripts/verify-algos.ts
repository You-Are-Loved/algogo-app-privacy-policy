// Verifies algorithm practice problems against reference solutions using the
// same equality rules as the in-app grader.
//
//   node_modules/.bin/sucrase-node scripts/verify-algos.ts <fragment.ts> <solutions.py> [--skip-existing]
//
// <fragment.ts> must export an array of Blind75Problem (any export name).
// <solutions.py> must define one function per problem with the problem's
// `functionName`. Every example + hidden test must pass. Also checks ids and
// numbers against the shipped catalog so a fragment can be spliced in safely.

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import type { Blind75Problem } from '../src/data/blind75';

const [, , fragPath, solPath, ...flags] = process.argv;
if (!fragPath || !solPath) {
  console.error('usage: verify-algos.ts <fragment.ts> <solutions.py>');
  process.exit(2);
}
const skipExisting = flags.includes('--skip-existing');

const mod = require(path.resolve(fragPath));
const problems = Object.values(mod).find((v) => Array.isArray(v)) as Blind75Problem[];
const code = fs.readFileSync(solPath, 'utf8');

const errors: string[] = [];
const err = (m: string) => errors.push(m);

// --- structural checks
const existing: Blind75Problem[] = skipExisting ? [] : require('../src/data/blind75').blind75;
const existingIds = new Set(existing.map((p) => p.id));
const existingNums = new Set(existing.map((p) => p.number));
const existingFns = new Set(existing.map((p) => p.functionName));
const existingTitles = new Set(existing.map((p) => p.title.toLowerCase()));
const fragIds = new Set<string>();
const fragNums = new Set<number>();
const fragFns = new Set<string>();

for (const p of problems) {
  const tag = `[${p.id}]`;
  if (existingIds.has(p.id) || fragIds.has(p.id)) err(`${tag} duplicate id`);
  fragIds.add(p.id);
  if (existingNums.has(p.number) || fragNums.has(p.number)) err(`${tag} duplicate number ${p.number}`);
  fragNums.add(p.number);
  if (existingFns.has(p.functionName) || fragFns.has(p.functionName)) err(`${tag} duplicate functionName ${p.functionName}`);
  fragFns.add(p.functionName);
  if (existingTitles.has(p.title.toLowerCase())) err(`${tag} title already exists in catalog: ${p.title}`);
  if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) err(`${tag} bad difficulty`);
  if (!p.topic?.trim() || !p.statement?.trim() || !p.title?.trim()) err(`${tag} missing text`);
  if (!p.starter.includes(`def ${p.functionName}(`)) err(`${tag} starter does not define ${p.functionName}`);
  if (!p.functionSignature.startsWith(`def ${p.functionName}(`)) err(`${tag} functionSignature does not match functionName`);
  const sigLine = p.starter.split('\n').find((l) => l.startsWith('def '));
  if (sigLine !== p.functionSignature) err(`${tag} functionSignature "${p.functionSignature}" != starter def line "${sigLine}"`);
  if (!Array.isArray(p.examples) || p.examples.length < 2) err(`${tag} needs >=2 examples`);
  if (!Array.isArray(p.hiddenTests) || p.hiddenTests.length < 2) err(`${tag} needs >=2 hiddenTests`);
  if (/any order|in any order|order (does not|doesn't) matter/i.test(p.statement) && p.compare !== 'unordered') {
    err(`${tag} statement allows any order but compare is not 'unordered'`);
  }
  if (p.compare === 'unordered') {
    for (const t of [...p.examples, ...p.hiddenTests]) {
      if (!Array.isArray(t.expected)) err(`${tag} compare=unordered but an expected value is not a list`);
    }
  }
  const sigs = [...p.examples, ...p.hiddenTests].map((t) => JSON.stringify(t.input));
  if (new Set(sigs).size !== sigs.length) err(`${tag} duplicate test inputs`);
}
if (!skipExisting && problems.length) {
  const maxExisting = Math.max(...existing.map((p) => p.number));
  const nums = [...fragNums].sort((a, b) => a - b);
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== maxExisting + 1 + i) {
      err(`numbers must be contiguous from ${maxExisting + 1}; got ${nums.join(',')}`);
      break;
    }
  }
}

// --- runtime checks
const tests = problems.flatMap((p) =>
  [...p.examples.map((t, i) => ({ ...t, id: `${p.id}#ex${i}` })), ...p.hiddenTests.map((t, i) => ({ ...t, id: `${p.id}#hid${i}` }))].map((t) => ({
    id: t.id,
    fn: p.functionName,
    input: t.input,
    expected: t.expected,
    compare: p.compare ?? 'exact',
  })),
);
const run = spawnSync('python3', [path.join(__dirname, 'py-harness.py')], {
  input: JSON.stringify({ code, tests }),
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
if (run.status !== 0) {
  console.error(run.stderr);
  err('python harness crashed');
} else {
  const results: { id: string; pass: boolean; got: any; error: string | null }[] = JSON.parse(run.stdout);
  let pass = 0;
  for (const r of results) {
    if (r.pass) pass++;
    else {
      const t = tests.find((x) => x.id === r.id)!;
      err(`${r.id} FAILED input=${JSON.stringify(t.input)} expected=${JSON.stringify(t.expected)} got=${JSON.stringify(r.got)}${r.error ? ' error=' + r.error : ''}`);
    }
  }
  console.log(`${problems.length} problems, ${pass}/${results.length} tests passed`);
}

for (const e of errors) console.log('ERROR', e);
console.log(`\n${errors.length} errors`);
process.exit(errors.length ? 1 : 0);
