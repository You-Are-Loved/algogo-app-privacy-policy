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
  Modal,
  Pressable,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { getProblem, Difficulty, TestCase, Blind75Problem } from '../data/blind75';
import { PracticeStackParamList } from '../navigation';
import { buildPracticeHtml } from '../practice/practiceHtml';
import { ensurePracticeRuntime } from '../practice/stageAssets';
import {
  ExecResult,
  ConsoleOutput,
  ResultBreakdown,
} from '../practice/ResultViews';

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

// Code-symbol shortcuts that float above the keyboard while the user is
// typing in the editor. `cursorOffset` (relative to the start of the inserted
// string) is used to drop the caret inside paired delimiters.
const KEY_SHORTCUTS: { label: string; insert: string; cursorOffset?: number }[] = [
  { label: 'Tab', insert: '    ' },
  { label: ':', insert: ':' },
  { label: '( )', insert: '()', cursorOffset: 1 },
  { label: '[ ]', insert: '[]', cursorOffset: 1 },
  { label: '{ }', insert: '{}', cursorOffset: 1 },
  { label: '"', insert: '""', cursorOffset: 1 },
  { label: "'", insert: "''", cursorOffset: 1 },
  { label: '=', insert: '=' },
  { label: '==', insert: '==' },
  { label: '!=', insert: '!=' },
  { label: '->', insert: '->' },
  { label: ',', insert: ', ' },
  { label: '#', insert: '# ' },
  { label: 'def', insert: 'def ' },
  { label: 'return', insert: 'return ' },
  { label: 'if', insert: 'if ' },
  { label: 'elif', insert: 'elif ' },
  { label: 'else:', insert: 'else:' },
  { label: 'for', insert: 'for ' },
  { label: 'while', insert: 'while ' },
  { label: 'in', insert: ' in ' },
  { label: 'not', insert: 'not ' },
  { label: 'and', insert: ' and ' },
  { label: 'or', insert: ' or ' },
  { label: 'None', insert: 'None' },
  { label: 'True', insert: 'True' },
  { label: 'False', insert: 'False' },
  { label: 'len()', insert: 'len()', cursorOffset: 4 },
  { label: 'range()', insert: 'range()', cursorOffset: 6 },
];

type RouteP = RouteProp<PracticeStackParamList, 'Problem'>;


interface AlgorithmProblemViewProps {
  problem: Blind75Problem;
  /** When true, hides the back button + solution hint (used inside a test). */
  embedded?: boolean;
  /** Fired whenever a run completes, with the latest test-case tally. */
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

export function AlgorithmProblemView({
  problem,
  embedded,
  onResult,
  onBack,
  keyboardVerticalOffset = 0,
}: AlgorithmProblemViewProps) {
  const webRef = useRef<WebView>(null);

  const [runtimeReady, setRuntimeReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState(false);
  // Statement + examples live in a sheet that slides up just after the
  // screen-entry transition settles (mounting it already-open pops with no
  // animation, which feels jarring) and reopens from the header.
  const [problemVisible, setProblemVisible] = useState(false);
  const [pageUri, setPageUri] = useState<string | null>(null);
  const [stagedDir, setStagedDir] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [kbHeight, setKbHeight] = useState(0);

  const html = useMemo(
    () => buildPracticeHtml({ starter: problem.starter, fnName: problem.functionName }),
    [problem.id]
  );

  useEffect(() => {
    let cancelled = false;
    setPageUri(null);
    setStagedDir(null);
    setStageError(null);
    (async () => {
      try {
        const dir = await ensurePracticeRuntime();
        const file = dir + `problem-${problem.id}.html`;
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

  // Track keyboard height so we can float a code-symbol toolbar just above it.
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
    const allTests: (TestCase & { hidden: boolean })[] = [
      ...problem.examples.map((t) => ({ ...t, hidden: false })),
      ...problem.hiddenTests.map((t) => ({ ...t, hidden: true })),
    ];
    webRef.current?.postMessage(
      JSON.stringify({ type: 'run', fnName: problem.functionName, tests: allTests })
    );
  };

  const handleReset = () => {
    webRef.current?.postMessage(JSON.stringify({ type: 'reset', code: problem.starter }));
    setResult(null);
  };

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'log') {
        console.log('[wv]', msg.level, msg.message);
        return;
      }
      if (msg.type === 'ready') setRuntimeReady(true);
      else if (msg.type === 'result') {
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

  // Drag-to-dismiss for the problem sheet. The drag handle is the
  // grabber + header; the examples list scrolls independently below it.
  const sheetY = useSharedValue(0);
  const sheetStartY = useSharedValue(0);

  // Slide the sheet up shortly after entry rather than popping it instantly.
  useEffect(() => {
    const t = setTimeout(() => setProblemVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (problemVisible) sheetY.value = 0;
  }, [problemVisible, sheetY]);

  const problemPan = Gesture.Pan()
    .onStart(() => {
      sheetStartY.value = sheetY.value;
    })
    .onUpdate((e) => {
      sheetY.value = Math.max(0, sheetStartY.value + e.translationY);
    })
    .onEnd((e) => {
      if (sheetY.value > 140 || e.velocityY > 800) {
        runOnJS(setProblemVisible)(false);
      } else {
        sheetY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const problemSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

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
            <View style={styles.headerMetaRow}>
              <View style={[styles.diffBadge, { backgroundColor: `${diffColor}22` }]}>
                <Text style={[styles.diffBadgeText, { color: diffColor }]}>
                  {problem.difficulty}
                </Text>
              </View>
              <Text style={styles.topicText}>{problem.topic}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setProblemVisible(true)}
            style={styles.headerBtn}
            hitSlop={8}
            accessibilityLabel="Show problem"
          >
            <Ionicons name="document-text-outline" size={20} color={colors.inkLight} />
          </TouchableOpacity>
          {!embedded && problem.explanation && (
            <TouchableOpacity
              onPress={() => setExplanationVisible(true)}
              style={styles.headerBtn}
              hitSlop={8}
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
            style={[
              styles.runIconBtn,
              (!runtimeReady || running) && styles.runIconBtnDisabled,
            ]}
            hitSlop={8}
            accessibilityLabel={runtimeReady ? 'Run code' : 'Loading runtime'}
          >
            {running ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="play" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Body: full-height editor. Statement & examples live in the
            reopenable problem sheet, and the function signature is already
            in the starter code, so the editor gets all the vertical space. */}
        <View style={styles.body}>
          {/* Editor — fills the whole area below the header, edge to edge */}
          <View style={styles.editorWrapFill}>
              {stageError ? (
                <View style={[styles.webviewFill, styles.editorErrorBox]}>
                  <Text style={styles.editorErrorText}>
                    Couldn't prepare the Python runtime: {stageError}
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

        {/* Code-symbol toolbar — sits just above the keyboard when typing */}
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
                <Ionicons name="chevron-down" size={16} color={colors.ink} />
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
                    {result.passed} / {result.total} passed
                    {result.totalRuntimeMs > 0 ? ` · ${result.totalRuntimeMs} ms` : ''}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setResultsVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.inkLight} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ maxHeight: 520 }}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
              showsVerticalScrollIndicator={false}
            >
              {result && <ResultSummary result={result} />}
              {result && <ResultBreakdown result={result} problem={problem} />}
              {result && <ConsoleOutput result={result} />}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
                <Text style={styles.modalTitle}>How to approach it</Text>
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
              <Text style={styles.modalBody}>{problem.explanation}</Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={problemVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProblemVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setProblemVisible(false)}
          />
          <Animated.View style={[styles.modalSheet, problemSheetStyle]}>
            <GestureDetector gesture={problemPan}>
              <View>
                <View style={styles.modalGrabber} />
                <View style={styles.modalHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{problem.title}</Text>
                    <View style={styles.headerMetaRow}>
                      <View style={[styles.diffBadge, { backgroundColor: `${diffColor}22` }]}>
                        <Text style={[styles.diffBadgeText, { color: diffColor }]}>
                          {problem.difficulty}
                        </Text>
                      </View>
                      <Text style={styles.topicText}>{problem.topic}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setProblemVisible(false)} hitSlop={8}>
                    <Ionicons name="close" size={24} color={colors.inkLight} />
                  </TouchableOpacity>
                </View>
              </View>
            </GestureDetector>
            <ScrollView
              style={{ maxHeight: 460 }}
              contentContainerStyle={{ paddingBottom: spacing.md }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionLabel}>PROBLEM</Text>
              <Text style={styles.statement}>{problem.statement}</Text>

              <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
                EXAMPLES
              </Text>
              {problem.examples.map((ex, i) => (
                <View key={i} style={styles.exampleCard}>
                  <Text style={styles.exampleHeader}>Example {i + 1}</Text>
                  <Text style={styles.exampleLine}>
                    <Text style={styles.exampleKey}>Input:  </Text>
                    <Text style={styles.exampleMono}>
                      {problem.functionName}({ex.input.map((a) => JSON.stringify(a)).join(', ')})
                    </Text>
                  </Text>
                  <Text style={styles.exampleLine}>
                    <Text style={styles.exampleKey}>Output: </Text>
                    <Text style={styles.exampleMono}>{JSON.stringify(ex.expected)}</Text>
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

export default function ProblemScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteP>();
  const problem = getProblem(params.problemId);
  const insets = useSafeAreaInsets();

  if (!problem) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFoundText}>Problem not found</Text>
      </SafeAreaView>
    );
  }

  return (
    // White top inset so the status-bar area flows into the white header.
    <SafeAreaView style={styles.safeTop} edges={['top']}>
      <AlgorithmProblemView
        problem={problem}
        onBack={() => navigation.goBack()}
        // The top SafeAreaView inset pushes this view down from the window
        // top; without matching offset the keyboard toolbar hides behind
        // the keyboard (KeyboardAvoidingView measures relative to parent).
        keyboardVerticalOffset={insets.top}
      />
    </SafeAreaView>
  );
}

function ResultSummary({ result }: { result: ExecResult }) {
  const allPass = result.passed === result.total && result.total > 0;
  const someFail = result.passed < result.total;
  const fatal = result.cases.length === 1 && result.cases[0].error && result.total === 0;

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
        <Text style={styles.summaryText}>
          All {result.total} tests passed
        </Text>
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
  safeTop: { flex: 1, backgroundColor: colors.card },
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
  // lineHeight is cleared so adjustsFontSizeToFit can shrink long titles.
  headerTitle: { ...typography.headlineMedium, lineHeight: undefined, color: colors.ink },
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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    ...shadows.sm,
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
  body: { flex: 1 },
  editorSectionFill: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  editorWrapFill: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
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
  runIconBtnDisabled: {
    backgroundColor: colors.borderDark,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  editorErrorText: {
    ...typography.bodyMedium,
    color: '#f7c9c9',
    textAlign: 'center',
  },

  resultsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  runtimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: `${colors.secondary}18`,
    borderRadius: borderRadius.full,
  },
  runtimeTagText: { ...typography.labelSmall, color: colors.secondary, fontWeight: '700' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  summaryPass: { backgroundColor: `${colors.primary}15` },
  summaryPartial: { backgroundColor: `${colors.accent}15` },
  summaryFail: { backgroundColor: `${colors.error}15` },
  summaryText: { ...typography.bodyMedium, color: colors.ink, fontWeight: '700' },
  caseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  caseLabel: { ...typography.bodyMedium, color: colors.ink, flex: 1 },
  caseRuntime: { ...typography.labelSmall, color: colors.inkLight },
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
  diffBlock: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    ...shadows.sm,
  },
  diffHeader: {
    ...typography.labelMedium,
    color: colors.ink,
    marginBottom: spacing.xs,
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

  runBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.button(colors.primaryDark),
  },
  runBtnDisabled: { opacity: 0.6 },
  runBtnText: { ...typography.labelLarge, color: colors.white, fontSize: 16 },

  kbBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  kbBarInner: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flexDirection: 'row',
  },
  kbKey: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kbKeyText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
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
  modalTitle: {
    ...typography.headlineSmall,
    color: colors.ink,
  },
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
});
