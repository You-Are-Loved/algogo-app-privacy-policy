// Pure-TS grader for Java bug-fix problems.
//
// We can't ship a Java compiler on-device (TeaVM/CheerpJ are 50–100MB+ and
// brittle on mobile), so each Java problem ships with a small set of rules:
//   - mustContain:    a substring or regex that must appear in the user's code
//   - mustNotContain: a substring or regex that must NOT appear
//   - acceptedFix:    a full snippet to match against (whitespace-normalized)
//
// The result is shaped to match the WebView grader's ExecResult so the same
// modal can render bug-fix results regardless of language.

import { BugFixRule } from '../data/bugFixes';
import { ExecResult } from './ResultViews';

/** Collapse runs of whitespace and strip empty lines so formatting differences
 *  don't matter for accepted-fix comparisons. */
function normalize(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
    .replace(/[ \t]+/g, ' ');
}

function ruleMatches(rule: BugFixRule, code: string): boolean {
  if (rule.type === 'acceptedFix') {
    return normalize(code) === normalize(rule.pattern);
  }
  let present: boolean;
  if (rule.regex) {
    try {
      const re = new RegExp(rule.pattern);
      present = re.test(code);
    } catch {
      // A malformed regex is treated as a non-match — fail loudly via the label.
      present = false;
    }
  } else {
    present = code.includes(rule.pattern);
  }
  return rule.type === 'mustContain' ? present : !present;
}

export function gradeJava(code: string, rules: BugFixRule[]): ExecResult {
  // If any acceptedFix rule matches exactly, treat the whole submission as
  // passing — accepted fixes are full-solution shortcuts.
  const accepted = rules.find(
    (r) => r.type === 'acceptedFix' && normalize(code) === normalize(r.pattern),
  );

  const cases = rules.map((rule) => {
    const ok = accepted ? true : ruleMatches(rule, code);
    return {
      hidden: false,
      pass: ok,
      runtimeMs: 0,
      // Reuse the `error` field for the human-readable rule label so the
      // results modal can show what was checked.
      error: ok ? undefined : rule.label,
      label: rule.label,
    };
  });

  const passed = cases.filter((c) => c.pass).length;
  return {
    passed,
    total: rules.length,
    cases,
    totalRuntimeMs: 0,
  };
}
