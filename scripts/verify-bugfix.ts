// Verifies bug-fix problems: the buggy snippet must FAIL grading and the
// reference fix must PASS, using the same rules as the app.
//
//   node_modules/.bin/sucrase-node scripts/verify-bugfix.ts <fragment.ts> [--skip-existing]
//
// <fragment.ts> must export `problems: BugFixProblem[]` and
// `fixes: Record<problemId, fixedCode>`.
//   python     -> run via scripts/py-harness.py (same equality as Pyodide grader)
//   javascript -> run in node with the WebView grader's deepEqual
//   java       -> rules engine (src/practice/gradeJava.ts) + javac smoke compile

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
const err = (m: string) => errors.push(m);

// ---------------------------------------------------------------- structure
const existing: BugFixProblem[] = skipExisting ? [] : require('../src/data/bugFixes').bugFixProblems;
const existingIds = new Set(existing.map((p) => p.id));
const existingTitles = new Set(existing.map((p) => `${p.language}:${p.title.toLowerCase()}`));
const maxNum: Record<string, number> = {};
for (const p of existing) maxNum[p.language] = Math.max(maxNum[p.language] ?? 0, p.number);
const fragIds = new Set<string>();
const fragNums: Record<string, number[]> = {};

for (const p of problems) {
  const tag = `[${p.id}]`;
  if (existingIds.has(p.id) || fragIds.has(p.id)) err(`${tag} duplicate id`);
  fragIds.add(p.id);
  if (existingTitles.has(`${p.language}:${p.title.toLowerCase()}`)) err(`${tag} title already exists: ${p.title}`);
  if (!['python', 'javascript', 'java'].includes(p.language)) err(`${tag} bad language`);
  if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) err(`${tag} bad difficulty`);
  for (const k of ['title', 'topic', 'statement', 'buggyCode', 'explanation'] as const) {
    if (!p[k]?.trim()) err(`${tag} missing ${k}`);
  }
  if (!p.hint?.trim()) err(`${tag} missing hint`);
  (fragNums[p.language] = fragNums[p.language] || []).push(p.number);
  if (!fixes[p.id]) err(`${tag} no reference fix supplied`);
  else if (fixes[p.id].trim() === p.buggyCode.trim()) err(`${tag} fix is identical to buggy code`);
  if (p.language === 'java') {
    if (!p.rules || p.rules.length < 2) err(`${tag} java problems need >=2 rules`);
    if (!p.functionSignature) err(`${tag} java problems need functionSignature`);
  } else {
    if (!p.functionName) err(`${tag} needs functionName`);
    if (!p.examples || p.examples.length < 2) err(`${tag} needs >=2 examples`);
    if (!p.hiddenTests || p.hiddenTests.length < 2) err(`${tag} needs >=2 hiddenTests`);
    const re = p.language === 'python' ? new RegExp(`def\\s+${p.functionName}\\s*\\(`) : new RegExp(`function\\s+${p.functionName}\\s*\\(|(const|let|var)\\s+${p.functionName}\\s*=`);
    if (p.functionName && !re.test(p.buggyCode)) err(`${tag} buggyCode does not define ${p.functionName}`);
    if (p.functionName && fixes[p.id] && !re.test(fixes[p.id])) err(`${tag} fix does not define ${p.functionName}`);
  }
}
if (!skipExisting) {
  for (const [lang, nums] of Object.entries(fragNums)) {
    const sorted = [...nums].sort((a, b) => a - b);
    const start = (maxNum[lang] ?? 0) + 1;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== start + i) {
        err(`${lang} numbers must be contiguous from ${start}; got ${sorted.join(',')}`);
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

// ---------------------------------------------------------------- javascript
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

function runJs(code: string, p: BugFixProblem) {
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
  tests.forEach((t, i) => {
    try {
      const got = fn(...JSON.parse(JSON.stringify(t.input)));
      if (!deepEqual(got, t.expected)) fails.push(`#${i} got=${JSON.stringify(got)}`);
    } catch (e: any) {
      fails.push(`#${i} error=${e?.message || e}`);
    }
  });
  return { passed: tests.length - fails.length, total: tests.length, detail: fails.join('; ') };
}

// ---------------------------------------------------------------- java
function normalizeJava(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
    .replace(/[ \t]+/g, ' ');
}
function ruleMatches(rule: BugFixRule, code: string): boolean {
  if (rule.type === 'acceptedFix') return normalizeJava(code) === normalizeJava(rule.pattern);
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
function gradeJavaRules(code: string, rules: BugFixRule[]) {
  const accepted = rules.find((r) => r.type === 'acceptedFix' && normalizeJava(code) === normalizeJava(r.pattern));
  const fails = rules.filter((r) => !(accepted || ruleMatches(r, code))).map((r) => r.label);
  return { passed: rules.length - fails.length, total: rules.length, detail: fails.join('; ') };
}
function javacSmoke(code: string, id: string): string | null {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'algogo-java-'));
  const imports = 'import java.util.*;\nimport java.util.function.*;\nimport java.util.stream.*;\nimport java.util.concurrent.*;\nimport java.util.concurrent.atomic.*;\nimport java.util.regex.*;\nimport java.io.*;\nimport java.nio.file.*;\nimport java.time.*;\nimport java.math.*;\n';
  const hasTopLevelType = /^\s*(public\s+|abstract\s+|final\s+|static\s+)*(class|interface|enum|record)\s+\w+/m.test(code);
  let src: string;
  if (hasTopLevelType) {
    src = imports + code.replace(/^(\s*)public\s+(abstract\s+|final\s+)?(class|interface|enum|record)\s+/gm, '$1$2$3 ');
  } else {
    src = imports + 'public class Snippet {\n' + code + '\n}\n';
  }
  fs.writeFileSync(path.join(dir, 'Snippet.java'), src);
  const candidates = [process.env.JAVAC, '/opt/homebrew/opt/openjdk/bin/javac', '/usr/local/opt/openjdk/bin/javac', 'javac'].filter(Boolean) as string[];
  const javac = candidates.find((c) => c === 'javac' || fs.existsSync(c)) || 'javac';
  const run = spawnSync(javac, ['-Xlint:none', '-d', dir, path.join(dir, 'Snippet.java')], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  if (run.status !== 0) return run.stderr.split('\n').slice(0, 6).join('\n');
  return null;
}

// ---------------------------------------------------------------- run
let verified = 0;
for (const p of problems) {
  const fix = fixes[p.id];
  if (!fix) continue;
  const tag = `[${p.id}]`;
  if (p.language === 'python' || p.language === 'javascript') {
    const runner = p.language === 'python' ? runPython : runJs;
    const buggy = runner(p.buggyCode, p);
    if (buggy.passed === buggy.total) err(`${tag} buggy code passes all ${buggy.total} tests — the bug is not caught`);
    const fixed = runner(fix, p);
    if (fixed.passed !== fixed.total) err(`${tag} fix fails ${fixed.total - fixed.passed}/${fixed.total}: ${fixed.detail}`);
    else verified++;
  } else {
    const rules = p.rules || [];
    const buggy = gradeJavaRules(p.buggyCode, rules);
    if (buggy.passed === buggy.total) err(`${tag} buggy java passes all rules — the bug is not caught`);
    const fixed = gradeJavaRules(fix, rules);
    if (fixed.passed !== fixed.total) err(`${tag} fix fails rules: ${fixed.detail}`);
    const compileErr = javacSmoke(fix, p.id);
    if (compileErr) err(`${tag} fix does not compile:\n${compileErr}`);
    if (fixed.passed === fixed.total && !compileErr) verified++;
  }
}
console.log(`${problems.length} problems, ${verified} verified`);
for (const e of errors) console.log('ERROR', e);
console.log(`\n${errors.length} errors`);
process.exit(errors.length ? 1 : 0);
