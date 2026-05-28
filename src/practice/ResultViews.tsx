import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography } from '../theme';
import { Blind75Problem } from '../data/blind75';

// Shape emitted by the grading WebView (matches the runtime payload).
export type ExecResult = {
  passed: number;
  total: number;
  cases: {
    hidden: boolean;
    pass: boolean;
    runtimeMs: number;
    error?: string;
    expected?: any;
    actual?: any;
    stdout?: string;
    /** Used by rule-based grading (Java bug-fix) to label what was checked. */
    label?: string;
  }[];
  totalRuntimeMs: number;
};

// Renders any `print()` output collected from visible test cases.
export function ConsoleOutput({ result }: { result: ExecResult }) {
  const visible = result.cases.filter((c) => !c.hidden);
  const chunks = visible
    .map((c, i) => {
      const out = (c.stdout || '').replace(/\n+$/, '');
      return out ? { i, out } : null;
    })
    .filter((x): x is { i: number; out: string } => x !== null);
  if (chunks.length === 0) return null;
  return (
    <View style={styles.consoleBlock}>
      <Text style={styles.consoleHeader}>CONSOLE</Text>
      {chunks.map(({ i, out }) => (
        <View key={i} style={styles.consoleChunk}>
          <Text style={styles.consoleCaseLabel}>Example {i + 1}</Text>
          <Text style={styles.consoleMono}>{out}</Text>
        </View>
      ))}
    </View>
  );
}

// Per-test breakdown: input, expected, got (on fail). Hidden tests collapse
// into a single summary row.
export function ResultBreakdown({
  result,
  problem,
}: {
  result: ExecResult;
  problem: Blind75Problem;
}) {
  if (result.cases.length === 1 && result.cases[0].error) {
    return (
      <View style={styles.errorBlock}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMono}>{result.cases[0].error}</Text>
      </View>
    );
  }

  const visible = result.cases.filter((c) => !c.hidden);
  const hidden = result.cases.filter((c) => c.hidden);
  const hiddenPassed = hidden.filter((c) => c.pass).length;

  return (
    <View>
      {visible.map((c, i) => {
        const ex = problem.examples[i];
        const inputStr = ex
          ? `${problem.functionName}(${ex.input.map((a) => JSON.stringify(a)).join(', ')})`
          : null;
        return (
          <View key={i} style={styles.caseBlock}>
            <View style={styles.caseRow}>
              <Ionicons
                name={c.pass ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={c.pass ? colors.primary : colors.error}
              />
              <Text style={styles.caseLabel}>Example {i + 1}</Text>
              <Text style={styles.caseRuntime}>{c.runtimeMs} ms</Text>
            </View>
            {inputStr && (
              <View style={styles.caseDetail}>
                <Text style={styles.diffRow}>
                  <Text style={styles.diffLabel}>Input:    </Text>
                  <Text style={styles.diffMono}>{inputStr}</Text>
                </Text>
                <Text style={styles.diffRow}>
                  <Text style={styles.diffLabel}>Expected: </Text>
                  <Text style={styles.diffMono}>{JSON.stringify(c.expected ?? ex.expected)}</Text>
                </Text>
                {!c.pass &&
                  (c.error ? (
                    <Text style={styles.errorMono}>{c.error}</Text>
                  ) : (
                    <Text style={styles.diffRow}>
                      <Text style={styles.diffLabel}>Got:      </Text>
                      <Text style={styles.diffMono}>{JSON.stringify(c.actual)}</Text>
                    </Text>
                  ))}
              </View>
            )}
          </View>
        );
      })}
      {hidden.length > 0 && (
        <View style={styles.caseRow}>
          <Ionicons
            name={hiddenPassed === hidden.length ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={hiddenPassed === hidden.length ? colors.primary : colors.accent}
          />
          <Text style={styles.caseLabel}>
            Hidden tests · {hiddenPassed} / {hidden.length} passed
          </Text>
        </View>
      )}
    </View>
  );
}

// Rule-based result rendering for bug-fix problems (Java today; any language
// later if we want to grade by static rules rather than execution).
export function RuleResultBreakdown({ result }: { result: ExecResult }) {
  if (result.cases.length === 1 && result.cases[0].error && !result.cases[0].label) {
    return (
      <View style={styles.errorBlock}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMono}>{result.cases[0].error}</Text>
      </View>
    );
  }
  return (
    <View>
      {result.cases.map((c, i) => (
        <View key={i} style={styles.caseRow}>
          <Ionicons
            name={c.pass ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={c.pass ? colors.primary : colors.error}
          />
          <Text style={styles.caseLabel}>
            {c.label || `Rule ${i + 1}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  caseLabel: { ...typography.bodyMedium, color: colors.ink, flex: 1 },
  caseRuntime: { ...typography.labelSmall, color: colors.inkLight },
  caseBlock: { marginBottom: spacing.xs },
  caseDetail: {
    marginLeft: 26,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },

  errorBlock: {
    backgroundColor: '#1e1e2e',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  errorTitle: {
    ...typography.labelMedium,
    color: colors.errorLight,
    marginBottom: 4,
  },
  errorMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#f7c9c9',
    lineHeight: 18,
  },

  diffRow: { marginVertical: 2 },
  diffLabel: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkLight,
  },
  diffMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: colors.ink,
  },

  consoleBlock: {
    marginTop: spacing.md,
    backgroundColor: '#1e1e2e',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  consoleHeader: {
    ...typography.labelSmall,
    color: '#9aa1ad',
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  consoleChunk: { marginBottom: spacing.sm },
  consoleCaseLabel: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '700',
    color: '#7c8499',
    marginBottom: 2,
  },
  consoleMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#e6e6f0',
    lineHeight: 18,
  },
});
