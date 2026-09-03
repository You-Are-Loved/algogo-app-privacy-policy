import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { PracticeStackParamList } from '../navigation';
import { getSqlProblem, SqlProblem, Difficulty, SQL_STARTER } from '../data/sqlProblems';
import { buildSqlHtml } from '../practice/sqlHtml';
import { ensurePracticeRuntime } from '../practice/stageAssets';
import { ExecResult } from '../practice/ResultViews';
import BottomSheetModal from '../components/BottomSheetModal';

type RouteP = RouteProp<PracticeStackParamList, 'SqlProblem'>;

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

export const SQL_COLOR = '#336791';

/** Result-set table as posted by the SQL WebView. */
export interface SqlTable {
  columns: string[];
  rows: (string | number | null)[][];
  error?: string;
}

interface SqlPreview {
  tables: (SqlTable & { name: string })[];
  expected: SqlTable;
}

const KEY_SHORTCUTS: { label: string; insert: string; cursorOffset?: number }[] = [
  { label: 'SELECT', insert: 'SELECT ' },
  { label: 'FROM', insert: 'FROM ' },
  { label: 'WHERE', insert: 'WHERE ' },
  { label: 'JOIN', insert: 'JOIN ' },
  { label: 'LEFT JOIN', insert: 'LEFT JOIN ' },
  { label: 'ON', insert: 'ON ' },
  { label: 'GROUP BY', insert: 'GROUP BY ' },
  { label: 'HAVING', insert: 'HAVING ' },
  { label: 'ORDER BY', insert: 'ORDER BY ' },
  { label: 'LIMIT', insert: 'LIMIT ' },
  { label: 'AS', insert: 'AS ' },
  { label: 'DISTINCT', insert: 'DISTINCT ' },
  { label: 'COUNT()', insert: 'COUNT()', cursorOffset: 6 },
  { label: 'SUM()', insert: 'SUM()', cursorOffset: 4 },
  { label: 'AVG()', insert: 'AVG()', cursorOffset: 4 },
  { label: 'CASE', insert: 'CASE WHEN  THEN  ELSE  END', cursorOffset: 10 },
  { label: '*', insert: '*' },
  { label: ',', insert: ', ' },
  { label: '( )', insert: '()', cursorOffset: 1 },
  { label: '=', insert: '= ' },
  { label: '<', insert: '< ' },
  { label: '>', insert: '> ' },
  { label: "'", insert: "''", cursorOffset: 1 },
  { label: ';', insert: ';' },
  { label: 'NULL', insert: 'NULL' },
  { label: 'IS NULL', insert: 'IS NULL' },
  { label: 'NOT', insert: 'NOT ' },
  { label: 'AND', insert: 'AND ' },
  { label: 'OR', insert: 'OR ' },
  { label: 'DESC', insert: 'DESC' },
];

interface SqlProblemViewProps {
  problem: SqlProblem;
  /** When true, hides the back button + explanation (used inside a test). */
  embedded?: boolean;
  onResult?: (r: { passed: number; total: number }) => void;
  onBack?: () => void;
  keyboardVerticalOffset?: number;
}

export function SqlProblemView({
  problem,
  embedded,
  onResult,
  onBack,
  keyboardVerticalOffset = 0,
}: SqlProblemViewProps) {
  const webRef = useRef<WebView>(null);

  const [runtimeReady, setRuntimeReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [problemVisible, setProblemVisible] = useState(false);
  const [preview, setPreview] = useState<SqlPreview | null>(null);
  const [pageUri, setPageUri] = useState<string | null>(null);
  const [stagedDir, setStagedDir] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [kbHeight, setKbHeight] = useState(0);

  const html = useMemo(() => buildSqlHtml({ starter: SQL_STARTER }), []);

  useEffect(() => {
    let cancelled = false;
    setPageUri(null);
    setStagedDir(null);
    setStageError(null);
    setRuntimeReady(false);
    setPreview(null);
    (async () => {
      try {
        const dir = await ensurePracticeRuntime();
        const file = dir + `sql-${problem.id}.html`;
        await FileSystem.writeAsStringAsync(file, html);
        if (!cancelled) {
          setStagedDir(dir);
          setPageUri(file);
        }
      } catch (e: any) {
        if (!cancelled) setStageError(e?.message || String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [problem.id, html]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: any) => setKbHeight(e?.endCoordinates?.height || 0);
    const onHide = () => setKbHeight(0);
    const s = Keyboard.addListener(showEvt, onShow);
    const h = Keyboard.addListener(hideEvt, onHide);
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  // Slide the brief up shortly after entry rather than popping it instantly.
  useEffect(() => {
    const t = setTimeout(() => setProblemVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const post = (msg: object) => webRef.current?.postMessage(JSON.stringify(msg));

  const insertSnippet = (text: string, cursorOffset?: number) =>
    post({ type: 'insert', text, cursorOffset });

  const blurEditor = () => {
    webRef.current?.injectJavaScript(
      'document.activeElement && document.activeElement.blur(); true;',
    );
    Keyboard.dismiss();
  };

  const handleRun = () => {
    if (!runtimeReady || running) return;
    setRunning(true);
    setResult(null);
    post({
      type: 'run',
      schema: problem.schema,
      datasets: problem.datasets,
      solution: problem.solution,
      ordered: !!problem.ordered,
    });
  };

  const handleReset = () => {
    post({ type: 'reset', code: SQL_STARTER });
    setResult(null);
  };

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'log') {
        console.log('[wv-sql]', msg.level, msg.message);
        return;
      }
      if (msg.type === 'ready') {
        setRuntimeReady(true);
        post({
          type: 'preview',
          schema: problem.schema,
          seed: problem.datasets[0],
          solution: problem.solution,
        });
      } else if (msg.type === 'preview') {
        setPreview({ tables: msg.tables, expected: msg.expected });
      } else if (msg.type === 'result') {
        setResult(msg.payload);
        setRunning(false);
        setResultsVisible(true);
        onResult?.({ passed: msg.payload.passed, total: msg.payload.total });
      } else if (msg.type === 'error') {
        setResult({
          passed: 0,
          total: 0,
          cases: [{ hidden: false, pass: false, runtimeMs: 0, error: msg.error }],
          totalRuntimeMs: 0,
        });
        setRunning(false);
        setResultsVisible(true);
        onResult?.({ passed: 0, total: 0 });
      }
    } catch {}
  };

  const diffColor = DIFF_COLORS[problem.difficulty];

  const metaRow = (
    <View style={styles.headerMetaRow}>
      <View style={[styles.diffBadge, { backgroundColor: `${diffColor}22` }]}>
        <Text style={[styles.diffBadgeText, { color: diffColor }]}>{problem.difficulty}</Text>
      </View>
      <View style={[styles.langBadge, { backgroundColor: `${SQL_COLOR}22` }]}>
        <Text style={[styles.langBadgeText, { color: SQL_COLOR }]}>SQL</Text>
      </View>
      <Text style={styles.topicText}>{problem.topic}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.ink} />
            </TouchableOpacity>
          )}
          <View style={styles.headerCenter}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {problem.title}
            </Text>
            {metaRow}
          </View>
          <TouchableOpacity
            onPress={() => setProblemVisible(true)}
            style={styles.headerBtn}
            hitSlop={8}
            accessibilityLabel="Show problem"
          >
            <Ionicons name="document-text-outline" size={20} color={colors.inkLight} />
          </TouchableOpacity>
          {!embedded && (
            <TouchableOpacity
              onPress={() => setExplanationVisible(true)}
              style={styles.headerBtn}
              hitSlop={8}
              accessibilityLabel="Show explanation"
            >
              <Ionicons name="bulb-outline" size={20} color={colors.inkLight} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleReset} style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="refresh-outline" size={20} color={colors.inkLight} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRun}
            disabled={!runtimeReady || running}
            style={[styles.runIconBtn, (!runtimeReady || running) && styles.runIconBtnDisabled]}
            hitSlop={8}
            accessibilityLabel={runtimeReady ? 'Run query' : 'Loading SQL runtime'}
          >
            {running ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="play" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Editor */}
        <View style={styles.body}>
          <View style={styles.editorWrapFill}>
            {stageError ? (
              <View style={[styles.webviewFill, styles.editorErrorBox]}>
                <Text style={styles.editorErrorText}>Couldn't prepare the editor: {stageError}</Text>
              </View>
            ) : pageUri && stagedDir ? (
              <WebView
                ref={webRef}
                originWhitelist={['file://*']}
                source={{ uri: pageUri }}
                allowingReadAccessToURL={stagedDir}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                onMessage={onMessage}
                javaScriptEnabled
                domStorageEnabled
                allowsBackForwardNavigationGestures={false}
                scrollEnabled={false}
                hideKeyboardAccessoryView
                automaticallyAdjustContentInsets={false}
                contentInsetAdjustmentBehavior="never"
                injectedJavaScriptBeforeContentLoaded="window.isReactNativeWebView = true; true;"
                style={styles.webviewFill}
              />
            ) : (
              <View style={[styles.webviewFill, styles.editorLoadingBox]}>
                <ActivityIndicator color={colors.secondary} />
                <Text style={styles.editorLoadingText}>Preparing editor…</Text>
              </View>
            )}
          </View>
        </View>

        {/* SQL keyword toolbar */}
        {kbHeight > 0 && (
          <View style={styles.kbBar}>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="always"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kbBarInner}
            >
              <TouchableOpacity
                style={styles.kbKey}
                activeOpacity={0.7}
                onPress={blurEditor}
                accessibilityLabel="Hide keyboard"
              >
                <Ionicons name="chevron-down" size={16} color="#d4d4f0" />
              </TouchableOpacity>
              {KEY_SHORTCUTS.map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={styles.kbKey}
                  activeOpacity={0.7}
                  onPress={() => insertSnippet(s.insert, s.cursorOffset)}
                >
                  <Text style={styles.kbKeyText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Results */}
      <BottomSheetModal
        visible={resultsVisible && result !== null}
        onClose={() => setResultsVisible(false)}
        header={
          <View style={styles.modalHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Results</Text>
              {result && (
                <Text style={styles.modalSubtitle}>
                  {result.passed} / {result.total} datasets passed
                  {result.totalRuntimeMs > 0 ? ` · ${result.totalRuntimeMs} ms` : ''}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setResultsVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.inkLight} />
            </TouchableOpacity>
          </View>
        }
      >
        <ScrollView
          style={{ maxHeight: 520 }}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {result && <ResultSummary result={result} />}
          {result && <SqlResultBreakdown result={result} />}
        </ScrollView>
      </BottomSheetModal>

      {/* Explanation */}
      <BottomSheetModal
        visible={explanationVisible}
        onClose={() => setExplanationVisible(false)}
        header={
          <View style={styles.modalHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>How to solve it</Text>
              <Text style={styles.modalSubtitle}>{problem.title}</Text>
            </View>
            <TouchableOpacity onPress={() => setExplanationVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.inkLight} />
            </TouchableOpacity>
          </View>
        }
      >
        <ScrollView
          style={{ maxHeight: 480 }}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          {problem.hint && (
            <View style={styles.hintCard}>
              <Text style={styles.hintLabel}>HINT</Text>
              <Text style={styles.hintText}>{problem.hint}</Text>
            </View>
          )}
          <Text style={styles.modalBody}>{problem.explanation}</Text>
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>REFERENCE QUERY</Text>
          <View style={styles.codeCard}>
            <Text style={styles.codeText}>{problem.solution.trim()}</Text>
          </View>
        </ScrollView>
      </BottomSheetModal>

      {/* Problem brief */}
      <BottomSheetModal
        visible={problemVisible}
        onClose={() => setProblemVisible(false)}
        header={
          <View style={styles.modalHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{problem.title}</Text>
              {metaRow}
            </View>
            <TouchableOpacity onPress={() => setProblemVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.inkLight} />
            </TouchableOpacity>
          </View>
        }
      >
        <ScrollView
          style={{ maxHeight: 460 }}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>WRITE THE QUERY</Text>
          <Text style={styles.statement}>{problem.statement}</Text>

          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>SCHEMA</Text>
          <View style={styles.codeCard}>
            <Text style={styles.codeText}>{problem.schema.trim()}</Text>
          </View>

          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>SAMPLE DATA</Text>
          {preview ? (
            preview.tables.map((t) => (
              <View key={t.name} style={styles.tableCard}>
                <Text style={styles.tableName}>{t.name}</Text>
                <MiniTable table={t} />
              </View>
            ))
          ) : (
            <View style={styles.previewLoading}>
              <ActivityIndicator size="small" color={colors.inkLighter} />
              <Text style={styles.previewLoadingText}>Loading sample rows…</Text>
            </View>
          )}

          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            EXPECTED OUTPUT · {problem.ordered ? 'IN THIS ORDER' : 'ANY ORDER'}
          </Text>
          {preview ? (
            <View style={styles.tableCard}>
              <MiniTable table={preview.expected} highlight />
            </View>
          ) : (
            <View style={styles.previewLoading}>
              <ActivityIndicator size="small" color={colors.inkLighter} />
            </View>
          )}
          <Text style={styles.footnote}>
            {problem.datasets.length - 1} hidden datasets check the same query against different data.
          </Text>
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}

export default function SqlProblemScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteP>();
  const problem = getSqlProblem(params.problemId);
  const insets = useSafeAreaInsets();

  if (!problem) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFoundText}>Problem not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeTop} edges={['top']}>
      <SqlProblemView
        problem={problem}
        onBack={() => navigation.goBack()}
        keyboardVerticalOffset={insets.top}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Result rendering
// ---------------------------------------------------------------------------

function fmtCell(v: string | number | null): string {
  if (v === null || v === undefined) return 'NULL';
  return String(v);
}

const MAX_TABLE_ROWS = 12;

export function MiniTable({ table, highlight }: { table: SqlTable; highlight?: boolean }) {
  if (table.error) {
    return <Text style={styles.tableError}>{table.error}</Text>;
  }
  if (table.columns.length === 0 && table.rows.length === 0) {
    return <Text style={styles.tableEmpty}>(no rows)</Text>;
  }
  const rows = table.rows.slice(0, MAX_TABLE_ROWS);
  const extra = table.rows.length - rows.length;
  const cols = table.columns.length || (table.rows[0]?.length ?? 0);
  const widths: number[] = [];
  for (let c = 0; c < cols; c++) {
    let w = (table.columns[c] || '').length;
    for (const r of rows) w = Math.max(w, fmtCell(r[c]).length);
    widths.push(Math.min(Math.max(w, 3), 22));
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={[styles.tr, styles.trHead]}>
          {Array.from({ length: cols }).map((_, c) => (
            <Text
              key={c}
              style={[styles.td, styles.th, { width: widths[c] * 8 + 16 }]}
              numberOfLines={1}
            >
              {table.columns[c] ?? `col${c + 1}`}
            </Text>
          ))}
        </View>
        {rows.map((r, i) => (
          <View key={i} style={[styles.tr, highlight && i % 2 === 1 && styles.trAlt]}>
            {Array.from({ length: cols }).map((_, c) => (
              <Text
                key={c}
                style={[
                  styles.td,
                  { width: widths[c] * 8 + 16 },
                  r[c] === null && styles.tdNull,
                ]}
                numberOfLines={1}
              >
                {fmtCell(r[c])}
              </Text>
            ))}
          </View>
        ))}
        {extra > 0 && <Text style={styles.tableMore}>+{extra} more rows</Text>}
        {rows.length === 0 && <Text style={styles.tableEmpty}>(no rows)</Text>}
      </View>
    </ScrollView>
  );
}

function SqlResultBreakdown({ result }: { result: ExecResult }) {
  if (result.cases.length === 1 && result.cases[0].error && result.total === 0) {
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
  const hiddenError = hidden.find((c) => !c.pass && c.error)?.error;

  return (
    <View>
      {visible.map((c, i) => (
        <View key={i} style={styles.caseBlock}>
          <View style={styles.caseRow}>
            <Ionicons
              name={c.pass ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={c.pass ? colors.primary : colors.error}
            />
            <Text style={styles.caseLabel}>Sample dataset</Text>
            <Text style={styles.caseRuntime}>{c.runtimeMs} ms</Text>
          </View>
          {c.error ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorTitle}>Query failed</Text>
              <Text style={styles.errorMono}>{c.error}</Text>
            </View>
          ) : (
            !c.pass && (
              <View style={styles.caseDetail}>
                <Text style={styles.caseSub}>Expected</Text>
                <View style={styles.tableCard}>
                  <MiniTable table={c.expected as SqlTable} />
                </View>
                <Text style={styles.caseSub}>Your result</Text>
                <View style={styles.tableCard}>
                  <MiniTable table={c.actual as SqlTable} />
                </View>
              </View>
            )
          )}
        </View>
      ))}
      {hidden.length > 0 && (
        <View style={styles.caseBlock}>
          <View style={styles.caseRow}>
            <Ionicons
              name={hiddenPassed === hidden.length ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={hiddenPassed === hidden.length ? colors.primary : colors.accent}
            />
            <Text style={styles.caseLabel}>
              Hidden datasets · {hiddenPassed} / {hidden.length} passed
            </Text>
          </View>
          {hiddenError && hiddenPassed < hidden.length && (
            <View style={styles.errorBlock}>
              <Text style={styles.errorMono}>{hiddenError}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function ResultSummary({ result }: { result: ExecResult }) {
  const allPass = result.passed === result.total && result.total > 0;
  const fatal = result.cases.length === 1 && result.cases[0].error && result.total === 0;
  if (fatal) {
    return (
      <View style={[styles.summary, styles.summaryFail]}>
        <Ionicons name="close-circle" size={22} color={colors.error} />
        <Text style={styles.summaryText}>Your query didn't run</Text>
      </View>
    );
  }
  if (allPass) {
    return (
      <View style={[styles.summary, styles.summaryPass]}>
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        <Text style={styles.summaryText}>Correct on every dataset</Text>
      </View>
    );
  }
  return (
    <View style={[styles.summary, styles.summaryPartial]}>
      <Ionicons name="alert-circle" size={22} color={colors.accent} />
      <Text style={styles.summaryText}>
        {result.passed} / {result.total} datasets passed
      </Text>
    </View>
  );
}

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeTop: { flex: 1, backgroundColor: colors.card },
  body: { flex: 1 },
  editorWrapFill: { flex: 1, backgroundColor: '#1e1e2e' },
  webviewFill: { flex: 1, backgroundColor: '#1e1e2e' },
  runIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    ...shadows.button(colors.primaryDark),
  },
  runIconBtnDisabled: { backgroundColor: colors.borderDark },
  notFoundText: {
    ...typography.bodyLarge,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { ...typography.headlineMedium, lineHeight: undefined, color: colors.ink },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  headerBtn: { padding: 6 },
  diffBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  diffBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  langBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  langBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  topicText: { ...typography.labelSmall, color: colors.inkLight },

  sectionLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  statement: { ...typography.bodyMedium, color: colors.ink, lineHeight: 22 },
  footnote: { ...typography.caption, color: colors.inkLighter, marginTop: spacing.sm },

  codeCard: { backgroundColor: '#1e1e2e', padding: spacing.md, borderRadius: borderRadius.md },
  codeText: { fontFamily: MONO, fontSize: 12.5, color: '#d4d4f0', lineHeight: 19 },

  tableCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    ...shadows.sm,
  },
  tableName: { ...typography.labelMedium, color: colors.ink, marginBottom: 4, marginLeft: 4 },
  tr: { flexDirection: 'row' },
  trHead: { borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 2 },
  trAlt: { backgroundColor: colors.background },
  td: { fontFamily: MONO, fontSize: 12, color: colors.ink, paddingHorizontal: 6, paddingVertical: 3 },
  tdNull: { color: colors.inkLighter, fontStyle: 'italic' },
  th: { color: colors.inkLight, fontWeight: '700' },
  tableMore: { ...typography.caption, color: colors.inkLighter, padding: 6 },
  tableEmpty: { ...typography.caption, color: colors.inkLighter, padding: 6 },
  tableError: { fontFamily: MONO, fontSize: 12, color: colors.error, padding: 6 },
  previewLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  previewLoadingText: { ...typography.caption, color: colors.inkLighter },

  editorLoadingBox: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  editorLoadingText: { ...typography.labelMedium, color: colors.inkLighter },
  editorErrorBox: { padding: spacing.md, justifyContent: 'center' },
  editorErrorText: { ...typography.labelMedium, color: colors.errorLight },

  kbBar: {
    backgroundColor: '#1e1e2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    paddingVertical: 6,
  },
  kbBarInner: { paddingHorizontal: spacing.sm, gap: spacing.xs },
  kbKey: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  kbKeyText: { fontFamily: MONO, fontSize: 13, color: '#d4d4f0', fontWeight: '600' },

  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { ...typography.headlineLarge, color: colors.ink },
  modalSubtitle: { ...typography.labelMedium, color: colors.inkLight, marginTop: 2 },
  modalBody: { ...typography.bodyMedium, color: colors.ink, lineHeight: 22 },
  hintCard: {
    backgroundColor: `${colors.accent}14`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hintLabel: { ...typography.labelSmall, color: colors.accent, letterSpacing: 1.4, marginBottom: 4 },
  hintText: { ...typography.bodyMedium, color: colors.ink, lineHeight: 22 },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  summaryPass: { backgroundColor: `${colors.primary}14` },
  summaryFail: { backgroundColor: `${colors.error}14` },
  summaryPartial: { backgroundColor: `${colors.accent}14` },
  summaryText: { ...typography.labelLarge, color: colors.ink },

  caseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  caseLabel: { ...typography.bodyMedium, color: colors.ink, flex: 1 },
  caseRuntime: { ...typography.labelSmall, color: colors.inkLight },
  caseBlock: { marginBottom: spacing.xs },
  caseDetail: { marginLeft: 26, marginBottom: spacing.sm },
  caseSub: { ...typography.labelSmall, color: colors.inkLight, marginBottom: 4, marginTop: 4 },
  errorBlock: {
    backgroundColor: '#1e1e2e',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    marginLeft: 26,
  },
  errorTitle: { ...typography.labelMedium, color: colors.errorLight, marginBottom: 4 },
  errorMono: { fontFamily: MONO, fontSize: 12, color: '#f7c9c9', lineHeight: 18 },
});
