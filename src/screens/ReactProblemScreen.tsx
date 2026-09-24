import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { PracticeStackParamList } from '../navigation';
import { getReactProblem, ReactProblem, Difficulty } from '../data/reactProblems';
import { buildReactHtml } from '../practice/reactHtml';
import { ensurePracticeRuntime } from '../practice/stageAssets';
import { ExecResult } from '../practice/ResultViews';
import BottomSheetModal from '../components/BottomSheetModal';
import { useDemoAction } from '../dev/demo';
import { useStore } from '../store/useStore';
import { problemKey } from '../data/practiceIndex';

type RouteP = RouteProp<PracticeStackParamList, 'ReactProblem'>;

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

export const REACT_COLOR = '#0EA5E9';

type Mode = 'code' | 'preview';

const KEY_SHORTCUTS: { label: string; insert: string; cursorOffset?: number }[] = [
  { label: 'Tab', insert: '  ' },
  { label: '< >', insert: '<>', cursorOffset: 1 },
  { label: '</', insert: '</' },
  { label: '/>', insert: ' />' },
  { label: '{ }', insert: '{}', cursorOffset: 1 },
  { label: '( )', insert: '()', cursorOffset: 1 },
  { label: '[ ]', insert: '[]', cursorOffset: 1 },
  { label: '=>', insert: ' => ' },
  { label: '"', insert: '""', cursorOffset: 1 },
  { label: "'", insert: "''", cursorOffset: 1 },
  { label: '`', insert: '``', cursorOffset: 1 },
  { label: '${}', insert: '${}', cursorOffset: 2 },
  { label: 'useState', insert: 'const [, set] = useState();', cursorOffset: 7 },
  { label: 'useEffect', insert: 'useEffect(() => {\n  \n}, []);', cursorOffset: 20 },
  { label: 'onClick', insert: 'onClick={() => }', cursorOffset: 15 },
  { label: 'onChange', insert: 'onChange={(e) => }', cursorOffset: 17 },
  { label: 'map', insert: '.map((item) => (\n  \n))', cursorOffset: 19 },
  { label: 'return', insert: 'return ' },
  { label: 'const', insert: 'const ' },
  { label: '=', insert: '=' },
  { label: '===', insert: ' === ' },
  { label: '&&', insert: ' && ' },
  { label: '?', insert: ' ? ' },
  { label: ':', insert: ' : ' },
  { label: ';', insert: ';' },
  { label: ',', insert: ', ' },
  { label: '.', insert: '.' },
];

interface ReactProblemViewProps {
  problem: ReactProblem;
  /** When true, hides the back button + explanation (used inside a test). */
  embedded?: boolean;
  onResult?: (r: { passed: number; total: number }) => void;
  onBack?: () => void;
  keyboardVerticalOffset?: number;
}

export function ReactProblemView({
  problem,
  embedded,
  onResult,
  onBack,
  keyboardVerticalOffset = 0,
}: ReactProblemViewProps) {
  const webRef = useRef<WebView>(null);

  const [runtimeReady, setRuntimeReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<Mode>('code');
  const [previewState, setPreviewState] = useState<'idle' | 'rendering' | 'ok' | 'error'>('idle');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [result, setResult] = useState<ExecResult | null>(null);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [problemVisible, setProblemVisible] = useState(false);
  useDemoAction('problem.openBrief', useCallback(() => setProblemVisible(true), []));
  useDemoAction('problem.closeBrief', useCallback(() => setProblemVisible(false), []));
  const [pageUri, setPageUri] = useState<string | null>(null);
  const [stagedDir, setStagedDir] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [kbHeight, setKbHeight] = useState(0);

  const html = useMemo(() => buildReactHtml({ starter: problem.starter }), [problem.id]);

  useEffect(() => {
    let cancelled = false;
    setPageUri(null);
    setStagedDir(null);
    setStageError(null);
    setRuntimeReady(false);
    setMode('code');
    setPreviewState('idle');
    (async () => {
      try {
        const dir = await ensurePracticeRuntime();
        const file = dir + `react-${problem.id}.html`;
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

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    post({ type: 'mode', mode: next });
    if (next === 'preview') {
      blurEditor();
      setPreviewState('rendering');
      setPreviewError(null);
      post({
        type: 'preview',
        name: problem.componentName,
        props: problem.previewProps ?? {},
        setup: problem.previewSetup ?? '',
      });
    }
  };

  useDemoAction('react.mode', useCallback((m: Mode) => switchMode(m), [switchMode]));
  useDemoAction('react.loadSolution', useCallback(() => post({ type: 'reset', code: problem.solution }), [problem.solution]));

  const refreshPreview = () => {
    if (!runtimeReady) return;
    setPreviewState('rendering');
    setPreviewError(null);
    post({
      type: 'preview',
      name: problem.componentName,
      props: problem.previewProps ?? {},
      setup: problem.previewSetup ?? '',
    });
  };

  const handleRun = () => {
    if (!runtimeReady || running) return;
    setRunning(true);
    setResult(null);
    post({
      type: 'run',
      name: problem.componentName,
      tests: problem.tests,
      props: problem.previewProps ?? {},
      setup: problem.previewSetup ?? '',
    });
  };

  const handleReset = () => {
    post({ type: 'reset', code: problem.starter });
    setResult(null);
    if (mode === 'preview') refreshPreview();
  };

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'log') {
        console.log('[wv-react]', msg.level, msg.message);
        return;
      }
      if (msg.type === 'ready') {
        setRuntimeReady(true);
      } else if (msg.type === 'previewResult') {
        setPreviewState(msg.ok ? 'ok' : 'error');
        setPreviewError(msg.ok ? null : String(msg.error || 'Render failed'));
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
      <View style={[styles.langBadge, { backgroundColor: `${REACT_COLOR}22` }]}>
        <Text style={[styles.langBadgeText, { color: REACT_COLOR }]}>React</Text>
      </View>
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
            accessibilityLabel={runtimeReady ? 'Run tests' : 'Loading React runtime'}
          >
            {running ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="play" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Code / Preview switch */}
        <View style={styles.modeBar}>
          <ModeSwitch mode={mode} onChange={switchMode} disabled={!runtimeReady} />
          <View style={styles.modeStatus}>
            {mode === 'preview' ? (
              <>
                {previewState === 'rendering' && (
                  <ActivityIndicator size="small" color={colors.inkLighter} />
                )}
                {previewState === 'ok' && (
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                )}
                {previewState === 'error' && (
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                )}
                <Text style={styles.modeStatusText} numberOfLines={1}>
                  {previewState === 'rendering'
                    ? 'Rendering…'
                    : previewState === 'error'
                      ? 'Render error'
                      : 'Live preview · sandboxed'}
                </Text>
                <TouchableOpacity onPress={refreshPreview} hitSlop={8} accessibilityLabel="Re-render preview">
                  <Ionicons name="reload-outline" size={16} color={colors.inkLight} />
                </TouchableOpacity>
              </>
            ) : (
              !runtimeReady && (
                <Text style={styles.modeStatusText} numberOfLines={1}>
                  Loading React…
                </Text>
              )
            )}
          </View>
        </View>

        {/* Editor + sandbox (both live in the WebView; the page toggles them) */}
        <View style={styles.body}>
          <View style={[styles.editorWrapFill, mode === 'preview' && styles.previewWrapFill]}>
            {stageError ? (
              <View style={[styles.webviewFill, styles.editorErrorBox]}>
                <Text style={styles.editorErrorText}>Couldn't prepare the editor: {stageError}</Text>
              </View>
            ) : pageUri && stagedDir ? (
              <WebView
                ref={webRef}
                // The sandbox iframe loads as about:srcdoc; the whitelist is
                // applied to subframe navigations too, so allow about:/blob:
                // (still no http/https — the runtime is fully offline).
                originWhitelist={['file://*', 'about:*', 'blob:*']}
                source={{ uri: pageUri }}
                allowingReadAccessToURL={stagedDir}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                onMessage={onMessage}
                javaScriptEnabled
                domStorageEnabled={false}
                allowsBackForwardNavigationGestures={false}
                scrollEnabled={false}
                hideKeyboardAccessoryView
                automaticallyAdjustContentInsets={false}
                contentInsetAdjustmentBehavior="never"
                injectedJavaScriptBeforeContentLoaded="window.isReactNativeWebView = true; true;"
                style={[styles.webviewFill, mode === 'preview' && styles.previewWrapFill]}
              />
            ) : (
              <View style={[styles.webviewFill, styles.editorLoadingBox]}>
                <ActivityIndicator color={colors.secondary} />
                <Text style={styles.editorLoadingText}>Preparing editor…</Text>
              </View>
            )}
            {mode === 'preview' && previewState === 'error' && previewError && (
              <View style={styles.previewErrorCard}>
                <Text style={styles.previewErrorTitle}>Couldn't render</Text>
                <Text style={styles.previewErrorMono}>{previewError}</Text>
              </View>
            )}
          </View>
        </View>

        {/* JSX toolbar */}
        {kbHeight > 0 && mode === 'code' && (
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
                  {result.passed} / {result.total} checks passed
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
          {result && <TestBreakdown result={result} />}
        </ScrollView>
      </BottomSheetModal>

      {/* Explanation */}
      <BottomSheetModal
        visible={explanationVisible}
        onClose={() => setExplanationVisible(false)}
        header={
          <View style={styles.modalHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>How to build it</Text>
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
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>REFERENCE SOLUTION</Text>
          <View style={styles.codeCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.codeText}>{problem.solution.trim()}</Text>
            </ScrollView>
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
          <Text style={styles.sectionLabel}>BUILD THE COMPONENT</Text>
          <Text style={styles.statement}>{problem.statement}</Text>

          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>WHAT WE CHECK</Text>
          {problem.tests.map((t, i) => (
            <View key={i} style={styles.ruleRow}>
              <Ionicons name="ellipse" size={6} color={colors.inkLighter} style={{ marginTop: 7 }} />
              <Text style={styles.ruleText}>{t.name}</Text>
            </View>
          ))}

          {problem.previewProps && Object.keys(problem.previewProps).length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>PREVIEW PROPS</Text>
              <View style={styles.codeCard}>
                <Text style={styles.codeText}>
                  {`<${problem.componentName} ${Object.entries(problem.previewProps)
                    .map(([k, v]) => `${k}={${JSON.stringify(v)}}`)
                    .join(' ')} />`}
                </Text>
              </View>
            </>
          )}

          <Text style={styles.footnote}>
            Hooks are available as globals (useState, useEffect, …). Your component runs in a
            sandbox with no network access. Flip to Preview to see it render.
          </Text>
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}

export default function ReactProblemScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteP>();
  const problem = getReactProblem(params.problemId);
  const markProblemComplete = useStore((st) => st.markProblemComplete);
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
      <ReactProblemView
        problem={problem}
        onBack={() => navigation.goBack()}
        onResult={({ passed, total }) => {
          if (total > 0 && passed === total) markProblemComplete(problemKey('ReactProblem', problem.id));
        }}
        keyboardVerticalOffset={insets.top}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Code / Preview segmented switch with a sliding thumb (eased, no spring)
// ---------------------------------------------------------------------------

function ModeSwitch({
  mode,
  onChange,
  disabled,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withTiming(mode === 'preview' ? width / 2 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [mode, width, x]);
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={[styles.switch, disabled && { opacity: 0.5 }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 4)}
    >
      {width > 0 && <Animated.View style={[styles.switchThumb, { width: width / 2 }, thumbStyle]} />}
      {(['code', 'preview'] as Mode[]).map((m) => {
        const active = m === mode;
        return (
          <Pressable
            key={m}
            style={styles.switchSeg}
            onPress={() => !disabled && onChange(m)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Ionicons
              name={m === 'code' ? 'code-slash-outline' : 'eye-outline'}
              size={14}
              color={active ? colors.ink : colors.inkLight}
            />
            <Text style={[styles.switchText, active && styles.switchTextActive]}>
              {m === 'code' ? 'Code' : 'Preview'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

function TestBreakdown({ result }: { result: ExecResult }) {
  if (result.cases.length === 1 && result.cases[0].error && result.total === 0) {
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
        <View key={i} style={styles.caseBlock}>
          <View style={styles.caseRow}>
            <Ionicons
              name={c.pass ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={c.pass ? colors.primary : colors.error}
            />
            <Text style={styles.caseLabel}>{c.label}</Text>
            <Text style={styles.caseRuntime}>{c.runtimeMs} ms</Text>
          </View>
          {!c.pass && c.error && (
            <View style={styles.errorBlock}>
              <Text style={styles.errorMono}>{c.error}</Text>
            </View>
          )}
        </View>
      ))}
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
        <Text style={styles.summaryText}>Your component didn't run</Text>
      </View>
    );
  }
  if (allPass) {
    return (
      <View style={[styles.summary, styles.summaryPass]}>
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        <Text style={styles.summaryText}>All checks pass — ship it</Text>
      </View>
    );
  }
  return (
    <View style={[styles.summary, styles.summaryPartial]}>
      <Ionicons name="alert-circle" size={22} color={colors.accent} />
      <Text style={styles.summaryText}>
        {result.passed} / {result.total} checks passed
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
  previewWrapFill: { backgroundColor: '#F6F7FB' },
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
    backgroundColor: colors.card,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { ...typography.headlineMedium, lineHeight: undefined, color: colors.ink },
  headerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  headerBtn: { padding: 6 },
  diffBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  diffBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  langBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  langBadgeText: { ...typography.labelSmall, fontWeight: '700' },

  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeStatus: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  modeStatusText: { ...typography.labelSmall, color: colors.inkLight, flex: 1 },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
    width: 176,
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  switchSeg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
  },
  switchText: { ...typography.labelMedium, color: colors.inkLight },
  switchTextActive: { color: colors.ink, fontWeight: '700' },

  previewErrorCard: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  previewErrorTitle: { ...typography.labelMedium, color: colors.error, marginBottom: 4 },
  previewErrorMono: { fontFamily: MONO, fontSize: 12, color: '#7F1D1D', lineHeight: 17 },

  sectionLabel: { ...typography.labelSmall, color: colors.inkLighter, letterSpacing: 1.4, marginBottom: spacing.sm },
  statement: { ...typography.bodyMedium, color: colors.ink, lineHeight: 22 },
  footnote: { ...typography.caption, color: colors.inkLighter, marginTop: spacing.lg, lineHeight: 17 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 4 },
  ruleText: { ...typography.bodyMedium, color: colors.ink, flex: 1 },
  codeCard: { backgroundColor: '#1e1e2e', padding: spacing.md, borderRadius: borderRadius.md },
  codeText: { fontFamily: MONO, fontSize: 12.5, color: '#d4d4f0', lineHeight: 19 },

  editorLoadingBox: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  editorLoadingText: { ...typography.labelMedium, color: colors.inkLighter },
  editorErrorBox: { padding: spacing.md, justifyContent: 'center' },
  editorErrorText: { ...typography.labelMedium, color: colors.errorLight },

  kbBar: { backgroundColor: '#1e1e2e', borderTopWidth: 1, borderTopColor: '#2a2a3e', paddingVertical: 6 },
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
  hintCard: { backgroundColor: `${colors.accent}14`, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
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
