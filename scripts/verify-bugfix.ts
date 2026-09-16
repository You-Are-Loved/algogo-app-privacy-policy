// Verifies code problems (debug + build): the starter must FAIL grading and
// the reference fix/solution must PASS, using the same rules as the app.
//
//   node_modules/.bin/sucrase-node scripts/verify-bugfix.ts <fragment.ts> [--skip-existing]
//
// <fragment.ts> must export `problems: BugFixProblem[]` and
// `fixes: Record<problemId, code>` (for build problems this is the solution;
// when the problem carries `solution`, that is used automatically).
//   python     -> run via scripts/py-harness.py (same equality as Pyodide grader)
//   javascript -> run in node with the WebView grader's deepEqual (async ok)
//   java       -> rules engine + javac smoke compile
//   swift      -> rules engine + swiftc -typecheck against the iOS simulator SDK
//   kotlin     -> rules engine + kotlinc compile (skipped with a warning if absent)
// Numbers must be contiguous per (track, kind) after the shipped catalog.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import type { BugFixProblem, BugFixRule } from '../src/data/bugFixes';

const [, , fragPath, ...flags] = process.argv;
if (!fragPath) {
  console.error('usage: verify-bugfix.ts <fragment.ts>');
  process.exit(2);
}
const skipExisting = flags.includes('--skip-existing');
const mod = require(path.resolve(fragPath));
const problems: BugFixProblem[] = mod.problems;
const fixes: Record<string, string> = mod.fixes || {};
if (!Array.isArray(problems)) {
  console.error('fragment must export `problems`');
  process.exit(2);
}

const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);

const RULE_GRADED = new Set(['java', 'swift', 'kotlin']);
const trackOf = (p: BugFixProblem) => p.track ?? p.language;
const kindOf = (p: BugFixProblem) => p.kind ?? 'debug';
const fixFor = (p: BugFixProblem) => fixes[p.id] ?? p.solution;

// ---------------------------------------------------------------- structure
const existing: BugFixProblem[] = skipExisting ? [] : require('../src/data/bugFixes').codeProblems;
const existingIds = new Set(existing.map((p) => p.id));
const existingTitles = new Set(existing.map((p) => `${trackOf(p)}:${p.title.toLowerCase()}`));
const maxNum: Record<string, number> = {};
for (const p of existing) {
  const k = `${trackOf(p)}/${kindOf(p)}`;
  maxNum[k] = Math.max(maxNum[k] ?? 0, p.number);
}
const fragIds = new Set<string>();
const fragNums: Record<string, number[]> = {};

for (const p of problems) {
  const tag = `[${p.id}]`;
  if (existingIds.has(p.id) || fragIds.has(p.id)) err(`${tag} duplicate id`);
  fragIds.add(p.id);
  if (existingTitles.has(`${trackOf(p)}:${p.title.toLowerCase()}`)) err(`${tag} title already exists: ${p.title}`);
  if (!['python', 'javascript', 'java', 'swift', 'kotlin'].includes(p.language)) err(`${tag} bad language`);
  if (p.track && !['python', 'javascript', 'java', 'node', 'swift', 'kotlin'].includes(p.track)) err(`${tag} bad track`);
  if (p.track === 'node' && p.language !== 'javascript') err(`${tag} node problems must be language 'javascript'`);
  if (p.kind && !['debug', 'build'].includes(p.kind)) err(`${tag} bad kind`);
  if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) err(`${tag} bad difficulty`);
  for (const k of ['title', 'topic', 'statement', 'buggyCode', 'explanation'] as const) {
    if (!p[k]?.trim()) err(`${tag} missing ${k}`);
  }
  if (!p.hint?.trim()) err(`${tag} missing hint`);
  if (kindOf(p) === 'build' && !p.solution?.trim()) err(`${tag} build problems must carry \`solution\``);
  const key = `${trackOf(p)}/${kindOf(p)}`;
  (fragNums[key] = fragNums[key] || []).push(p.number);
  const fix = fixFor(p);
  if (!fix) err(`${tag} no reference fix/solution supplied`);
  else if (fix.trim() === p.buggyCode.trim()) err(`${tag} fix is identical to the starter`);
  if (RULE_GRADED.has(p.language)) {
    if (!p.rules || p.rules.length < 2) err(`${tag} rule-graded problems need >=2 rules`);
    if (!p.functionSignature) err(`${tag} rule-graded problems need functionSignature`);
    if (p.rules && !p.rules.some((r) => r.type === 'mustContain')) err(`${tag} needs at least one mustContain rule`);
  } else {
    if (!p.functionName) err(`${tag} needs functionName`);
    if (!p.examples || p.examples.length < 2) err(`${tag} needs >=2 examples`);
    if (!p.hiddenTests || p.hiddenTests.length < 2) err(`${tag} needs >=2 hiddenTests`);
    const re = p.language === 'python' ? new RegExp(`def\\s+${p.functionName}\\s*\\(`) : new RegExp(`function\\s+${p.functionName}\\s*\\(|(const|let|var)\\s+${p.functionName}\\s*=|async\\s+function\\s+${p.functionName}\\s*\\(`);
    if (p.functionName && !re.test(p.buggyCode)) err(`${tag} starter does not define ${p.functionName}`);
    if (p.functionName && fix && !re.test(fix)) err(`${tag} fix does not define ${p.functionName}`);
  }
}
if (!skipExisting) {
  for (const [key, nums] of Object.entries(fragNums)) {
    const sorted = [...nums].sort((a, b) => a - b);
    const start = (maxNum[key] ?? 0) + 1;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== start + i) {
        err(`${key} numbers must be contiguous from ${start}; got ${sorted.join(',')}`);
        break;
      }
    }
  }
}

// ---------------------------------------------------------------- python
function runPython(code: string, p: BugFixProblem) {
  const tests = [...(p.examples || []), ...(p.hiddenTests || [])].map((t, i) => ({
    id: `${p.id}#${i}`,
    fn: p.functionName!,
    input: t.input,
    expected: t.expected,
    compare: 'exact',
  }));
  const run = spawnSync('python3', [path.join(__dirname, 'py-harness.py')], {
    input: JSON.stringify({ code, tests }),
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (run.status !== 0) return { passed: 0, total: tests.length, detail: 'harness crashed: ' + run.stderr };
  const res: { id: string; pass: boolean; got: any; error: string | null }[] = JSON.parse(run.stdout);
  const fails = res.filter((r) => !r.pass);
  return {
    passed: res.length - fails.length,
    total: res.length,
    detail: fails.map((f) => `${f.id} got=${JSON.stringify(f.got)}${f.error ? ' error=' + f.error : ''}`).join('; '),
  };
}

// ---------------------------------------------------------------- javascript (sync or async)
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) < 1e-9;
  }
  if (typeof a === 'object') {
    if (Array.isArray(b)) return false;
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.length !== kb.length) return false;
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return false;
      if (!deepEqual(a[ka[i]], b[kb[i]])) return false;
    }
    return true;
  }
  return false;
}

async function runJs(code: string, p: BugFixProblem) {
  const tests = [...(p.examples || []), ...(p.hiddenTests || [])];
  let fn: any;
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function(code + '\n; return typeof ' + p.functionName + ' !== "undefined" ? ' + p.functionName + ' : undefined;');
    fn = factory();
  } catch (e: any) {
    return { passed: 0, total: tests.length, detail: 'load error: ' + (e?.message || e) };
  }
  if (typeof fn !== 'function') return { passed: 0, total: tests.length, detail: `${p.functionName} is not a function` };
  const fails: string[] = [];
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    try {
      let got = fn(...JSON.parse(JSON.stringify(t.input)));
      if (got && typeof got.then === 'function') {
        got = await Promise.race([
          got,
          new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 3000 ms')), 3000)),
        ]);
      }
      if (!deepEqual(got, t.expected)) fails.push(`#${i} got=${JSON.stringify(got)}`);
    } catch (e: any) {
      fails.push(`#${i} error=${e?.message || e}`);
    }
  }
  return { passed: tests.length - fails.length, total: tests.length, detail: fails.join('; ') };
}

// ---------------------------------------------------------------- rules
function normalizeCode(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
    .replace(/[ \t]+/g, ' ');
}
function ruleMatches(rule: BugFixRule, code: string): boolean {
  if (rule.type === 'acceptedFix') return normalizeCode(code) === normalizeCode(rule.pattern);
  let present: boolean;
  if (rule.regex) {
    try {
      present = new RegExp(rule.pattern).test(code);
    } catch {
      present = false;
    }
  } else present = code.includes(rule.pattern);
  return rule.type === 'mustContain' ? present : !present;
}
function gradeRules(code: string, rules: BugFixRule[]) {
  const accepted = rules.find((r) => r.type === 'acceptedFix' && normalizeCode(code) === normalizeCode(r.pattern));
  const fails = rules.filter((r) => !(accepted || ruleMatches(r, code))).map((r) => r.label);
  return { passed: rules.length - fails.length, total: rules.length, detail: fails.join('; ') };
}

// ---------------------------------------------------------------- compilers
function javacSmoke(code: string): string | null {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'algogo-java-'));
  const imports = 'import java.util.*;\nimport java.util.function.*;\nimport java.util.stream.*;\nimport java.util.concurrent.*;\nimport java.util.concurrent.atomic.*;\nimport java.util.regex.*;\nimport java.io.*;\nimport java.nio.file.*;\nimport java.time.*;\nimport java.math.*;\n';
  const hasTopLevelType = /^\s*(public\s+|abstract\s+|final\s+|static\s+)*(class|interface|enum|record)\s+\w+/m.test(code);
  const src = hasTopLevelType
    ? imports + code.replace(/^(\s*)public\s+(abstract\s+|final\s+)?(class|interface|enum|record)\s+/gm, '$1$2$3 ')
    : imports + 'public class Snippet {\n' + code + '\n}\n';
  fs.writeFileSync(path.join(dir, 'Snippet.java'), src);
  const candidates = [process.env.JAVAC, '/opt/homebrew/opt/openjdk/bin/javac', '/usr/local/opt/openjdk/bin/javac', 'javac'].filter(Boolean) as string[];
  const javac = candidates.find((c) => c === 'javac' || fs.existsSync(c)) || 'javac';
  const run = spawnSync(javac, ['-Xlint:none', '-d', dir, path.join(dir, 'Snippet.java')], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  if (run.status !== 0) return run.stderr.split('\n').slice(0, 6).join('\n');
  return null;
}

let sdkPath: string | null = null;
function swiftTypecheck(code: string): string | null {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'algogo-swift-'));
  const src = (/^\s*import\s+/m.test(code) ? '' : 'import Foundation\n') + code + '\n';
  const file = path.join(dir, 'Snippet.swift');
  fs.writeFileSync(file, src);
  if (sdkPath === null) {
    const r = spawnSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-path'], { encoding: 'utf8' });
    sdkPath = r.status === 0 ? r.stdout.trim() : '';
  }
  const args = ['swiftc', '-typecheck', '-parse-as-library'];
  if (sdkPath) args.push('-sdk', sdkPath, '-target', 'arm64-apple-ios17.0-simulator');
  args.push(file);
  const run = spawnSync('xcrun', args, { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  if (run.status !== 0) return run.stderr.split('\n').filter((l) => /error:/.test(l)).slice(0, 6).join('\n') || run.stderr.slice(0, 600);
  return null;
}

let kotlincPath: string | null | undefined;
function kotlinCompile(code: string): string | null | 'skipped' {
  if (kotlincPath === undefined) {
    const candidates = [process.env.KOTLINC, '/opt/homebrew/bin/kotlinc', '/usr/local/bin/kotlinc'].filter(Boolean) as string[];
    kotlincPath = candidates.find((c) => fs.existsSync(c)) ?? null;
  }
  if (!kotlincPath) return 'skipped';
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'algogo-kotlin-'));
  const file = path.join(dir, 'Snippet.kt');
  fs.writeFileSync(file, code + '\n');
  // kotlinx.coroutines (and any other jars dropped in scripts/kotlin-libs) are
  // on the classpath so mobile-style suspend/Flow problems compile.
  const libDir = path.join(__dirname, 'kotlin-libs');
  const jars = fs.existsSync(libDir) ? fs.readdirSync(libDir).filter((f) => f.endsWith('.jar')).map((f) => path.join(libDir, f)) : [];
  const args = [file, '-d', dir, '-nowarn'];
  if (jars.length) args.push('-classpath', jars.join(':'));
  const run = spawnSync(kotlincPath, args, { encoding: 'utf8', timeout: 180000 });
  fs.rmSync(dir, { recursive: true, force: true });
  if (run.status !== 0) return (run.stderr || run.stdout).split('\n').filter((l) => /error:/.test(l)).slice(0, 6).join('\n') || (run.stderr || '').slice(0, 600);
  return null;
}

// ---------------------------------------------------------------- run
async function main() {
  let verified = 0;
  let kotlinSkipped = 0;
  for (const p of problems) {
    const fix = fixFor(p);
    if (!fix) continue;
    const tag = `[${p.id}]`;
    const starterWord = kindOf(p) === 'build' ? 'starter' : 'buggy code';
    if (p.language === 'python' || p.language === 'javascript') {
      const runner = p.language === 'python' ? runPython : runJs;
      const buggy = await runner(p.buggyCode, p);
      if (buggy.passed === buggy.total) err(`${tag} ${starterWord} passes all ${buggy.total} tests — nothing is being checked`);
      const fixed = await runner(fix, p);
      if (fixed.passed !== fixed.total) err(`${tag} fix fails ${fixed.total - fixed.passed}/${fixed.total}: ${fixed.detail}`);
      else verified++;
    } else {
      const rules = p.rules || [];
      const buggy = gradeRules(p.buggyCode, rules);
      if (buggy.passed === buggy.total) err(`${tag} ${starterWord} passes all rules — nothing is being checked`);
      const fixed = gradeRules(fix, rules);
      if (fixed.passed !== fixed.total) err(`${tag} fix fails rules: ${fixed.detail}`);
      let compileErr: string | null | 'skipped' = null;
      if (p.language === 'java') compileErr = javacSmoke(fix);
      else if (p.language === 'swift') compileErr = swiftTypecheck(fix);
      else if (p.language === 'kotlin') compileErr = kotlinCompile(fix);
      if (compileErr === 'skipped') {
        kotlinSkipped++;
        compileErr = null;
      } else if (compileErr) err(`${tag} fix does not compile:\n${compileErr}`);
      if (fixed.passed === fixed.total && !compileErr) verified++;
    }
  }
  if (kotlinSkipped) warn(`kotlinc not found — ${kotlinSkipped} Kotlin fixes were NOT compile-checked (brew install kotlin)`);
  console.log(`${problems.length} problems, ${verified} verified`);
  for (const w of warnings) console.log('WARN', w);
  for (const e of errors) console.log('ERROR', e);
  console.log(`\n${errors.length} errors`);
  process.exit(errors.length ? 1 : 0);
}

main();
