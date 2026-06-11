import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { PracticeStackParamList } from '../navigation';
import {
  getBugFixProblem,
  BugFixProblem,
  Difficulty,
} from '../data/bugFixes';
import { buildPracticeHtml } from '../practice/practiceHtml';
import { buildBugFixHtml } from '../practice/bugFixHtml';
import { ensurePracticeRuntime } from '../practice/stageAssets';
import {
  ExecResult,
  ConsoleOutput,
  ResultBreakdown,
  RuleResultBreakdown,
} from '../practice/ResultViews';
import { gradeJava } from '../practice/gradeJava';

type RouteP = RouteProp<PracticeStackParamList, 'BugFix'>;

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

const LANG_LABEL = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
} as const;

const LANG_COLOR = {
  python: '#3776AB',
  javascript: '#F7DF1E',
  java: '#ED8B00',
} as const;

// Same shortcut bar as ProblemScreen — the symbols are useful across all three
// languages. Pythonic words like `def` are skipped here because the bug-fix
// editor handles JS and Java too.
const KEY_SHORTCUTS: { label: string; insert: string; cursorOffset?: number }[] = [
  { label: 'Tab', insert: '    ' },
  { label: ';', insert: ';' },
  { label: '( )', insert: '()', cursorOffset: 1 },
  { label: '[ ]', insert: '[]', cursorOffset: 1 },
  { label: '{ }', insert: '{}', cursorOffset: 1 },
  { label: '"', insert: '""', cursorOffset: 1 },
  { label: "'", insert: "''", cursorOffset: 1 },
  { label: '=', insert: '=' },
  { label: '==', insert: '==' },
  { label: '===', insert: '===' },
  { label: '!=', insert: '!=' },
  { label: '<', insert: '<' },
  { label: '>', insert: '>' },
  { label: '<=', insert: '<=' },
  { label: '>=', insert: '>=' },
  { label: '&&', insert: '&&' },
  { label: '||', insert: '||' },
  { label: '->', insert: '->' },
  { label: ',', insert: ', ' },
  { label: '.', insert: '.' },
  { label: 'return', insert: 'return ' },
  { label: 'if', insert: 'if ' },
  { label: 'else', insert: 'else ' },
  { label: 'for', insert: 'for ' },
  { label: 'while', insert: 'while ' },
  { label: 'break', insert: 'break;' },
];

interface BugFixProblemViewProps {
  problem: BugFixProblem;
  /** When true, hides the back button + bug explanation (used inside a test). */
  embedded?: boolean;
  /** Fired whenever a run/check completes, with the latest pass tally. */
  onResult?: (r: { passed: number; total: number }) => void;
  onBack?: () => void;
  /**
   * Distance from the top of the window to this view. Required when embedded
   * under other chrome (e.g. the test-session header) — KeyboardAvoidingView
   * measures relative to its parent, so without this the keyboard toolbar
   * hides behind the keyboard.
   */
  keyboardVerticalOffset?: number;
}

export function BugFixProblemView({
  problem,
  embedded,
  onResult,
  onBack,
  keyboardVerticalOffset = 0,
}: BugFixProblemViewProps) {
  const webRef = useRef<WebView>(null);

  const [runtimeReady, setRuntimeReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [pageUri, setPageUri] = useState<string | null>(null);
  const [stagedDir, setStagedDir] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [kbHeight, setKbHeight] = useState(0);

  // Python uses the Pyodide page; JS/Java use the lightweight host.
  const html = useMemo(() => {
    if (problem.language === 'python') {
      return buildPracticeHtml({
        starter: problem.buggyCode,
        fnName: problem.functionName || '',
      });
    }
    return buildBugFixHtml({
      starter: problem.buggyCode,
      language: problem.language,
    });
  }, [problem.id]);

  useEffect(() => {
    let cancelled = false;
    setPageUri(null);
    setStagedDir(null);
    setStageError(null);
    setRuntimeReady(false);
    (async () => {
      try {
        const dir = await ensurePracticeRuntime();
        const file = dir + `bugfix-${problem.id}.html`;
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

  const insertSnippet = (text: string, cursorOffset?: number) => {
    webRef.current?.postMessage(
      JSON.stringify({ type: 'insert', text, cursorOffset }),
    );
  };

  // The keyboard belongs to the WebView's editor, so Keyboard.dismiss() alone
  // won't hide it — blur the focused element inside the page.
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
    if (problem.language === 'java') {
      // Ask the WebView for the current code, then grade in TS.
      webRef.current?.postMessage(JSON.stringify({ type: 'run' }));
      return;
    }
    const examples = problem.examples || [];
    const hidden = problem.hiddenTests || [];
    const allTests = [
      ...examples.map((t) => ({ ...t, hidden: false })),
      ...hidden.map((t) => ({ ...t, hidden: true })),
    ];
    webRef.current?.postMessage(
      JSON.stringify({
        type: 'run',
        fnName: problem.functionName,
        tests: allTests,
      }),
    );
  };

  const handleReset = () => {
    webRef.current?.postMessage(
      JSON.stringify({ type: 'reset', code: problem.buggyCode }),
    );
    setResult(null);
  };

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'log') {
        console.log('[wv]', msg.level, msg.message);
        return;
      }
      if (msg.type === 'ready') {
        setRuntimeReady(true);
      } else if (msg.type === 'result') {
        setResult(msg.payload);
        setRunning(false);
        setResultsVisible(true);
        onResult?.({ passed: msg.payload.passed, total: msg.payload.total });
      } else if (msg.type === 'submit') {
        // Java path — grade in TS.
        if (problem.language === 'java' && problem.rules) {
          const graded = gradeJava(msg.code || '', problem.rules);
          setResult(graded);
          setRunning(false);
          setResultsVisible(true);
          onResult?.({ passed: graded.passed, total: graded.total });
        }
      } else if (msg.type === 'error') {
        setResult({
          passed: 0,
          total: 0,
          cases: [
            { hidden: false, pass: false, runtimeMs: 0, error: msg.error },
          ],
          totalRuntimeMs: 0,
        });
        setRunning(false);
        setResultsVisible(true);
        onResult?.({ passed: 0, total: 0 });
      }
    } catch {}
  };

  const diffColor = DIFF_COLORS[problem.difficulty];
  const langColor = LANG_COLOR[problem.language];
  const loadingLabel =
    problem.language === 'python' ? 'Loading Python…' : 'Loading editor…';

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
            <Text style={styles.headerTitle} numberOfLines={1}>
              {problem.title}
            </Text>
            <View style={styles.headerMetaRow}>
              <View
                style={[
                  styles.diffBadge,
                  { backgroundColor: `${diffColor}22` },
                ]}
              >
                <Text style={[styles.diffBadgeText, { color: diffColor }]}>
                  {problem.difficulty}
                </Text>
              </View>
              <View
                style={[
                  styles.langBadge,
                  { backgroundColor: `${langColor}22` },
                ]}
              >
                <Text style={[styles.langBadgeText, { color: langColor }]}>
                  {LANG_LABEL[problem.language]}
                </Text>
              </View>
              <Text style={styles.topicText}>{problem.topic}</Text>
            </View>
          </View>
          {!embedded && (
            <TouchableOpacity
              onPress={() => setExplanationVisible(true)}
              style={styles.headerBtn}
              hitSlop={8}
            >
              <Ionicons name="bulb-outline" size={20} color={colors.inkLight} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleReset}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.inkLight} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <TouchableWithoutFeedback onPress={blurEditor} accessible={false}>
          <View>
          {/* Statement */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FIX THE BUG</Text>
            <Text style={styles.statement}>{problem.statement}</Text>
          </View>

          {/* Examples (JS / Python only) */}
          {problem.examples && problem.examples.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>EXAMPLES</Text>
              {problem.examples.map((ex, i) => (
                <View key={i} style={styles.exampleCard}>
                  <Text style={styles.exampleHeader}>Example {i + 1}</Text>
                  <Text style={styles.exampleLine}>
                    <Text style={styles.exampleKey}>Input:  </Text>
                    <Text style={styles.exampleMono}>
                      {problem.functionName}(
                      {ex.input.map((a) => JSON.stringify(a)).join(', ')})
                    </Text>
                  </Text>
                  <Text style={styles.exampleLine}>
                    <Text style={styles.exampleKey}>Output: </Text>
                    <Text style={styles.exampleMono}>
                      {JSON.stringify(ex.expected)}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Requirements (Java rules) */}
          {problem.language === 'java' && problem.rules && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>WHAT WE CHECK</Text>
              {problem.rules.map((rule, i) => (
                <View key={i} style={styles.ruleRow}>
                  <Ionicons
                    name="ellipse"
                    size={6}
                    color={colors.inkLighter}
                    style={{ marginTop: 7 }}
                  />
                  <Text style={styles.ruleText}>{rule.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Signature */}
          {problem.functionSignature && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SIGNATURE</Text>
              <View style={styles.signatureCard}>
                <Text style={styles.signatureText}>
                  {problem.functionSignature}
                </Text>
              </View>
            </View>
          )}
          </View>
          </TouchableWithoutFeedback>

          {/* Editor — outside the dismiss wrapper so taps can focus it */}
          <View style={styles.editorSection}>
            <View style={styles.editorHeader}>
              <Text style={styles.sectionLabel}>YOUR FIX</Text>
              {!runtimeReady && (
                <View style={styles.loadingTag}>
                  <ActivityIndicator size="small" color={colors.secondary} />
                  <Text style={styles.loadingTagText}>{loadingLabel}</Text>
                </View>
              )}
            </View>
            <View style={styles.editorWrap}>
              {stageError ? (
                <View style={[styles.webview, styles.editorErrorBox]}>
                  <Text style={styles.editorErrorText}>
                    Couldn't prepare the editor: {stageError}
                  </Text>
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
                  style={styles.webview}
                />
              ) : (
                <View style={[styles.webview, styles.editorLoadingBox]}>
                  <ActivityIndicator color={colors.secondary} />
                  <Text style={styles.editorLoadingText}>
                    Preparing editor…
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Code-symbol toolbar */}
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

        {/* Run button */}
        <View style={styles.runBar}>
          <TouchableOpacity
            style={[
              styles.runBtn,
              (!runtimeReady || running) && styles.runBtnDisabled,
            ]}
            onPress={handleRun}
            disabled={!runtimeReady || running}
            activeOpacity={0.85}
          >
            {running ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="play" size={20} color={colors.white} />
                <Text style={styles.runBtnText}>
                  {runtimeReady
                    ? problem.language === 'java'
                      ? 'Check fix'
                      : 'Run tests'
                    : 'Loading…'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Results modal */}
      <Modal
        visible={resultsVisible && result !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setResultsVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setResultsVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Results</Text>
                {result && (
                  <Text style={styles.modalSubtitle}>
                    {result.passed} / {result.total}{' '}
                    {problem.language === 'java' ? 'checks' : 'tests'} passed
                    {result.totalRuntimeMs > 0
                      ? ` · ${result.totalRuntimeMs} ms`
                      : ''}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setResultsVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={colors.inkLight} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ maxHeight: 520 }}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
              showsVerticalScrollIndicator={false}
            >
              {result && <ResultSummary result={result} />}
              {result && problem.language === 'java' && (
                <RuleResultBreakdown result={result} />
              )}
              {result &&
                problem.language !== 'java' &&
                problem.examples && (
                  <BugFixExecBreakdown
                    result={result}
                    examples={problem.examples}
                    functionName={problem.functionName || ''}
                  />
                )}
              {result && problem.language !== 'java' && (
                <ConsoleOutput result={result} />
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Explanation modal */}
      <Modal
        visible={explanationVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setExplanationVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setExplanationVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>What was the bug</Text>
                <Text style={styles.modalSubtitle}>{problem.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setExplanationVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={colors.inkLight} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ maxHeight: 480 }}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
            >
              {problem.hint && (
                <View style={styles.hintCard}>
                  <Text style={styles.hintLabel}>HINT</Text>
                  <Text style={styles.hintText}>{problem.hint}</Text>
                </View>
              )}
              <Text style={styles.modalBody}>{problem.explanation}</Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function BugFixScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteP>();
  const problem = getBugFixProblem(params.problemId);

  if (!problem) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFoundText}>Problem not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BugFixProblemView problem={problem} onBack={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

// Slimmer breakdown for bug-fix JS/Python — Blind75's ResultBreakdown expects
// a full Blind75Problem, but bug-fix problems only have examples + functionName.
function BugFixExecBreakdown({
  result,
  examples,
  functionName,
}: {
  result: ExecResult;
  examples: { input: any[]; expected: any }[];
  functionName: string;
}) {
  if (result.cases.length === 1 && result.cases[0].error && result.total === 0) {
    return (
      <View style={execStyles.errorBlock}>
        <Text style={execStyles.errorTitle}>Error</Text>
        <Text style={execStyles.errorMono}>{result.cases[0].error}</Text>
      </View>
    );
  }
  const visible = result.cases.filter((c) => !c.hidden);
  const hidden = result.cases.filter((c) => c.hidden);
  const hiddenPassed = hidden.filter((c) => c.pass).length;

  return (
    <View>
      {visible.map((c, i) => {
        const ex = examples[i];
        const inputStr = ex
          ? `${functionName}(${ex.input.map((a) => JSON.stringify(a)).join(', ')})`
          : null;
        return (
          <View key={i} style={execStyles.caseBlock}>
            <View style={execStyles.caseRow}>
              <Ionicons
                name={c.pass ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={c.pass ? colors.primary : colors.error}
              />
              <Text style={execStyles.caseLabel}>Example {i + 1}</Text>
              <Text style={execStyles.caseRuntime}>{c.runtimeMs} ms</Text>
            </View>
            {inputStr && (
              <View style={execStyles.caseDetail}>
                <Text style={execStyles.diffRow}>
                  <Text style={execStyles.diffLabel}>Input:    </Text>
                  <Text style={execStyles.diffMono}>{inputStr}</Text>
                </Text>
                <Text style={execStyles.diffRow}>
                  <Text style={execStyles.diffLabel}>Expected: </Text>
                  <Text style={execStyles.diffMono}>
                    {JSON.stringify(c.expected ?? ex.expected)}
                  </Text>
                </Text>
                {!c.pass &&
                  (c.error ? (
                    <Text style={execStyles.errorMono}>{c.error}</Text>
                  ) : (
                    <Text style={execStyles.diffRow}>
                      <Text style={execStyles.diffLabel}>Got:      </Text>
                      <Text style={execStyles.diffMono}>
                        {JSON.stringify(c.actual)}
                      </Text>
                    </Text>
                  ))}
              </View>
            )}
          </View>
        );
      })}
      {hidden.length > 0 && (
        <View style={execStyles.caseRow}>
          <Ionicons
            name={
              hiddenPassed === hidden.length
                ? 'checkmark-circle'
                : 'alert-circle'
            }
            size={18}
            color={
              hiddenPassed === hidden.length ? colors.primary : colors.accent
            }
          />
          <Text style={execStyles.caseLabel}>
            Hidden tests · {hiddenPassed} / {hidden.length} passed
          </Text>
        </View>
      )}
    </View>
  );
}

function ResultSummary({ result }: { result: ExecResult }) {
  const allPass = result.passed === result.total && result.total > 0;
  const someFail = result.passed < result.total;
  const fatal =
    result.cases.length === 1 && result.cases[0].error && result.total === 0;

  if (fatal) {
    return (
      <View style={[styles.summary, styles.summaryFail]}>
        <Ionicons name="close-circle" size={22} color={colors.error} />
        <Text style={styles.summaryText}>Your code didn't run</Text>
      </View>
    );
  }
  if (allPass) {
    return (
      <View style={[styles.summary, styles.summaryPass]}>
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        <Text style={styles.summaryText}>Bug fixed — nice catch</Text>
      </View>
    );
  }
  if (someFail) {
    return (
      <View style={[styles.summary, styles.summaryPartial]}>
        <Ionicons name="alert-circle" size={22} color={colors.accent} />
        <Text style={styles.summaryText}>
          {result.passed} / {result.total} passed
        </Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerTitle: { ...typography.headlineMedium, color: colors.ink },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  headerBtn: { padding: 6 },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  diffBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  langBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  langBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  topicText: { ...typography.labelSmall, color: colors.inkLight },

  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  statement: { ...typography.bodyMedium, color: colors.ink, lineHeight: 22 },

  exampleCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleHeader: {
    ...typography.labelLarge,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  exampleLine: { marginVertical: 2 },
  exampleKey: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkLight,
  },
  exampleMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: colors.ink,
  },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  ruleText: { ...typography.bodyMedium, color: colors.ink, flex: 1 },

  signatureCard: {
    backgroundColor: '#1e1e2e',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  signatureText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#d4d4f0',
  },

  editorSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  loadingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: `${colors.secondary}18`,
    borderRadius: borderRadius.full,
  },
  loadingTagText: { ...typography.labelSmall, color: colors.secondary },
  editorWrap: {
    height: 320,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#1e1e2e',
    ...shadows.sm,
  },
  webview: { backgroundColor: '#1e1e2e' },
  editorLoadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  editorLoadingText: {
    ...typography.labelMedium,
    color: colors.inkLighter,
  },
  editorErrorBox: {
    padding: spacing.md,
    justifyContent: 'center',
  },
  editorErrorText: {
    ...typography.labelMedium,
    color: colors.errorLight,
  },

  kbBar: {
    backgroundColor: '#1e1e2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    paddingVertical: 6,
  },
  kbBarInner: {
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  kbKey: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  kbKeyText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#d4d4f0',
    fontWeight: '600',
  },

  runBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  runBtnDisabled: {
    backgroundColor: colors.inkLighter,
  },
  runBtnText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 16,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 25, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  modalGrabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.headlineLarge, color: colors.ink },
  modalSubtitle: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginTop: 2,
  },
  modalBody: {
    ...typography.bodyMedium,
    color: colors.ink,
    lineHeight: 22,
  },
  hintCard: {
    backgroundColor: `${colors.accent}14`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hintLabel: {
    ...typography.labelSmall,
    color: colors.accent,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
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
});

const execStyles = StyleSheet.create({
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
});

// Suppress unused import warning — ResultBreakdown is intentionally available
// for callers but BugFixScreen uses its own narrower variant.
void ResultBreakdown;
