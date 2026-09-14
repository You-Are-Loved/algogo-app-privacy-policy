// Verifies React build problems by running the in-app harness (the exact
// source that grades inside the sandboxed iframe) in jsdom.
//
//   node_modules/.bin/sucrase-node scripts/verify-react.ts <fragment.ts> [--skip-existing]
//
// <fragment.ts> must export `problems: ReactProblem[]` and
// `traps: Record<problemId, string>` — a plausible WRONG implementation per
// problem. Checks:
//   - ids / numbers / titles unique vs the shipped catalog, numbers contiguous
//   - >= 3 tests, each with a name; componentName defined by starter/solution
//   - solution passes every test; starter fails at least one; trap fails at
//     least one; previewProps is JSON-serializable
//
// Needs the offline assets (node scripts/build-practice-assets.js --only=react)
// and jsdom (cd scripts/react-verify-env && npm install).

import fs from 'fs';
import path from 'path';
import type { ReactProblem } from '../src/data/reactProblems';
import { REACT_HARNESS_SOURCE } from '../src/practice/reactHarness';

const [, , fragPath, ...flags] = process.argv;
if (!fragPath) {
  console.error('usage: verify-react.ts <fragment.ts>');
  process.exit(2);
}
const skipExisting = flags.includes('--skip-existing');
const mod = require(path.resolve(fragPath));
const problems: ReactProblem[] = mod.problems;
const traps: Record<string, string> = mod.traps || {};
if (!Array.isArray(problems)) {
  console.error('fragment must export `problems`');
  process.exit(2);
}

const errors: string[] = [];
const err = (m: string) => errors.push(m);

// --- structure
const existing: ReactProblem[] = skipExisting ? [] : require('../src/data/reactProblems').reactProblems;
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
  for (const k of ['title', 'topic', 'statement', 'componentName', 'starter', 'solution', 'explanation'] as const) {
    if (!p[k]?.trim()) err(`${tag} missing ${k}`);
  }
  if (!p.hint?.trim()) err(`${tag} missing hint`);
  if (!Array.isArray(p.tests) || p.tests.length < 3) err(`${tag} needs >= 3 tests`);
  (p.tests || []).forEach((t, i) => {
    if (!t.name?.trim()) err(`${tag} test ${i} has no name`);
    if (!t.code?.trim()) err(`${tag} test ${i} has no code`);
  });
  const nameRe = new RegExp(`\\b${p.componentName}\\b`);
  if (!nameRe.test(p.starter)) err(`${tag} starter does not mention ${p.componentName}`);
  if (!nameRe.test(p.solution)) err(`${tag} solution does not mention ${p.componentName}`);
  if (p.starter.trim() === p.solution.trim()) err(`${tag} starter is identical to the solution`);
  if (!traps[p.id]) err(`${tag} no trap implementation supplied`);
  try {
    JSON.stringify(p.previewProps ?? {});
  } catch {
    err(`${tag} previewProps is not JSON-serializable`);
  }
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

// --- runtime (jsdom + the real harness)
type TestResult = { name: string; pass: boolean; error?: string; runtimeMs: number };

async function main() {
  const { JSDOM } = require(path.join(__dirname, 'react-verify-env', 'node_modules', 'jsdom'));
  const assetsDir = path.join(__dirname, '..', 'assets', 'practice');
  const libs = ['react.development.js.bin', 'react-dom.development.js.bin', 'babel.min.js.bin'].map((f) => {
    const p = path.join(assetsDir, f);
    if (!fs.existsSync(p)) {
      console.error(`missing ${p} — run: node scripts/build-practice-assets.js --only=react`);
      process.exit(2);
    }
    return fs.readFileSync(p, 'utf8');
  });

  function freshWindow() {
    const dom = new JSDOM('<!doctype html><html><body><div id="preview"></div></body></html>', {
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      url: 'https://sandbox.invalid/',
    });
    const w = dom.window as any;
    // Silence React's console noise from expected failures.
    w.console = { ...console, error: () => {}, warn: () => {} };
    for (const src of libs) w.eval(src);
    w.eval(REACT_HARNESS_SOURCE);
    return w;
  }

  let verified = 0;
  for (const p of problems) {
    const tag = `[${p.id}]`;
    if (!Array.isArray(p.tests) || !p.solution) continue;
    const run = async (code: string): Promise<TestResult[]> => {
      const w = freshWindow();
      try {
        return await w.__harness.runTests(code, p.componentName, p.tests, p.previewProps ?? {}, p.previewSetup ?? '');
      } finally {
        w.close();
      }
    };
    let ok = true;
    const sol = await run(p.solution);
    const solFails = sol.filter((r) => !r.pass);
    if (solFails.length) {
      ok = false;
      err(`${tag} solution fails ${solFails.length}/${sol.length} tests:\n` + solFails.map((r) => `    - ${r.name}: ${r.error}`).join('\n'));
    }
    const st = await run(p.starter);
    if (st.every((r) => r.pass)) {
      ok = false;
      err(`${tag} the starter already passes every test — tests don't check the work`);
    }
    if (traps[p.id]) {
      const tr = await run(traps[p.id]);
      if (tr.every((r) => r.pass)) {
        ok = false;
        err(`${tag} the trap implementation passes every test — add a test that catches it`);
      }
    }
    // Preview must render the solution without throwing.
    const w = freshWindow();
    try {
      const pr = w.__harness.preview(p.solution, p.componentName, p.previewProps ?? {}, p.previewSetup ?? '');
      if (!pr.ok) {
        ok = false;
        err(`${tag} preview of the solution failed: ${pr.error}`);
      }
    } finally {
      w.close();
    }
    if (ok) verified++;
  }

  console.log(`${problems.length} problems, ${verified} verified`);
  for (const e of errors) console.log('ERROR', e);
  console.log(`\n${errors.length} errors`);
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
