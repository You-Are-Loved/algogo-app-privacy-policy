import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import Svg, { Line } from 'react-native-svg';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { getProblem } from '../data/blind75';
import { buildPracticeHtml } from '../practice/practiceHtml';
import { ensurePracticeRuntime } from '../practice/stageAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://you-are-loved.github.io/algogo-app-privacy-policy/privacy-policy.html';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
const TOTAL_STEPS = 9;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const { purchase, restore, product, isLoading: subLoading } = useSubscriptionContext();

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((step + 1) as Step);
    } else {
      completeOnboarding();
    }
  };

  const goBack = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  const handleStartTrial = async () => {
    const result = await purchase();
    if (result.success) {
      completeOnboarding();
    }
  };

  const handleSkipTrial = () => {
    completeOnboarding();
  };

  const handleRestore = async () => {
    const result = await restore();
    if (result.success && result.isSubscribed) {
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top bar: progress + back */}
      <View style={styles.topBar}>
        {step > 0 && step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity onPress={goBack} style={styles.topBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.inkLight} />
          </TouchableOpacity>
        ) : (
          <View style={styles.topBtn} />
        )}
        <View style={styles.progressDots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step && styles.dotActive,
                i < step && styles.dotPast,
              ]}
            />
          ))}
        </View>
        <View style={styles.topBtn} />
      </View>

      {/* Step content */}
      <View style={styles.content}>
        {step === 0 && <ScopeStep />}
        {step === 1 && <FlashcardStep />}
        {step === 2 && <QuizStep />}
        {step === 3 && <VisualizationStep />}
        {step === 4 && <OfflineStep />}
        {step === 5 && <PracticeStep />}
        {step === 6 && <SystemDesignTeaserStep />}
        {step === 7 && <BehavioralStep />}
        {step === 8 && (
          <PaywallStep
            product={product}
            isLoading={subLoading}
            onStartTrial={handleStartTrial}
            onSkip={handleSkipTrial}
            onRestore={handleRestore}
          />
        )}
      </View>

      {/* Bottom CTA (hidden on paywall — paywall has its own buttons) */}
      {step < TOTAL_STEPS - 1 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.continueBtn} onPress={goNext} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// STEP 0 — Scope / breadth
// ============================================================================
const TRACKS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}[] = [
  { icon: 'code-slash-outline', label: 'Algorithms', color: colors.primary },
  { icon: 'server-outline', label: 'System Design', color: colors.secondary },
  { icon: 'phone-portrait-outline', label: 'iOS', color: colors.accent },
  { icon: 'tablet-portrait-outline', label: 'Android', color: colors.purple },
  { icon: 'globe-outline', label: 'Web', color: colors.pink },
  { icon: 'hardware-chip-outline', label: 'Backend', color: colors.errorLight },
];

function ScopeStep() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroIconWrap}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroIcon}
        >
          <Ionicons name="rocket" size={48} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Master your tech interviews
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        50+ topics across six engineering tracks — no fluff
      </Animated.Text>

      <View style={styles.tracksGrid}>
        {TRACKS.map((track, i) => (
          <Animated.View
            key={track.label}
            entering={FadeInDown.delay(400 + i * 60).duration(400)}
            style={styles.trackCard}
          >
            <View style={[styles.trackIconWrap, { backgroundColor: `${track.color}20` }]}>
              <Ionicons name={track.icon} size={28} color={track.color} />
            </View>
            <Text style={styles.trackLabel}>{track.label}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInUp.delay(900).duration(500)} style={styles.statsRow}>
        <Stat value="50+" label="Categories" />
        <View style={styles.statDivider} />
        <Stat value="1,500+" label="Flashcards" />
        <View style={styles.statDivider} />
        <Stat value="500+" label="Quiz qs" />
      </Animated.View>
    </Animated.View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ============================================================================
// STEP 1 — Try a flashcard
// ============================================================================
function FlashcardStep() {
  const flip = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);

  const onTap = () => {
    flip.value = withTiming(flipped ? 0 : 1, { duration: 500 });
    setFlipped(!flipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: interpolate(flip.value, [0, 0.5, 0.5001, 1], [1, 1, 0, 0]),
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
    ],
    opacity: interpolate(flip.value, [0, 0.4999, 0.5, 1], [0, 0, 1, 1]),
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.modeHeader}>
        <View style={[styles.modeBadge, { backgroundColor: `${colors.secondary}20` }]}>
          <Ionicons name="copy-outline" size={16} color={colors.secondary} />
          <Text style={[styles.modeBadgeText, { color: colors.secondary }]}>Cards mode</Text>
        </View>
        <Text style={styles.title}>Try a flashcard</Text>
        <Text style={styles.subtitle}>Tap the card to flip it</Text>
      </Animated.View>

      <TouchableOpacity activeOpacity={0.9} onPress={onTap} style={styles.flipCardWrap}>
        <Animated.View style={[styles.flipCard, styles.flipCardFront, frontStyle]}>
          <Ionicons name="help-circle-outline" size={32} color={colors.secondary} />
          <Text style={styles.flipCardLabel}>QUESTION</Text>
          <Text style={styles.flipCardText}>What is the Sliding Window pattern?</Text>
          <View style={styles.flipHint}>
            <Ionicons name="finger-print" size={16} color={colors.inkLighter} />
            <Text style={styles.flipHintText}>Tap to reveal answer</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.flipCard, styles.flipCardBack, backStyle]}
          pointerEvents={flipped ? 'auto' : 'none'}
        >
          <Ionicons name="bulb" size={32} color={colors.accent} />
          <Text style={styles.flipCardLabel}>ANSWER</Text>
          <Text style={styles.flipCardBody}>
            An algorithmic technique that maintains a "window" of elements and slides it across an
            array. Reduces O(n²) brute force to O(n) by reusing work between adjacent windows.
          </Text>
          <View style={styles.flipHint}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={[styles.flipHintText, { color: colors.primary }]}>Got it!</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.featureLine}>
        <Ionicons name="layers-outline" size={16} color={colors.inkLight} />
        <Text style={styles.featureLineText}>Spaced repetition built in</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// STEP 2 — Try a quiz
// ============================================================================
const QUIZ_OPTIONS = ['Stack', 'Queue', 'Heap', 'Linked List'];
const QUIZ_CORRECT = 0;

function QuizStep() {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected === QUIZ_CORRECT;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.modeHeader}>
        <View style={[styles.modeBadge, { backgroundColor: `${colors.purple}20` }]}>
          <Ionicons name="bulb-outline" size={16} color={colors.purpleDark} />
          <Text style={[styles.modeBadgeText, { color: colors.purpleDark }]}>Quiz mode</Text>
        </View>
        <Text style={styles.title}>Test yourself</Text>
        <Text style={styles.subtitle}>Tap an answer below</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quizQuestionCard}>
        <Text style={styles.quizQuestionText}>
          Which data structure uses LIFO ordering (last in, first out)?
        </Text>
      </Animated.View>

      <View style={styles.quizOptions}>
        {QUIZ_OPTIONS.map((opt, i) => {
          const isSel = selected === i;
          const isThisCorrect = i === QUIZ_CORRECT;
          let bg = colors.card;
          let borderColor = colors.border;
          let iconName: keyof typeof Ionicons.glyphMap | null = null;
          let iconColor = colors.inkLight;

          if (selected !== null) {
            if (isThisCorrect) {
              bg = `${colors.primary}15`;
              borderColor = colors.primary;
              iconName = 'checkmark-circle';
              iconColor = colors.primary;
            } else if (isSel) {
              bg = `${colors.error}15`;
              borderColor = colors.error;
              iconName = 'close-circle';
              iconColor = colors.error;
            }
          }

          return (
            <Animated.View
              key={opt}
              entering={FadeInDown.delay(300 + i * 80).duration(400)}
            >
              <TouchableOpacity
                style={[styles.quizOption, { backgroundColor: bg, borderColor }]}
                onPress={() => selected === null && setSelected(i)}
                activeOpacity={selected === null ? 0.7 : 1}
                disabled={selected !== null}
              >
                <View style={styles.quizOptionLetter}>
                  <Text style={styles.quizOptionLetterText}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={styles.quizOptionText}>{opt}</Text>
                {iconName && <Ionicons name={iconName} size={22} color={iconColor} />}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {selected !== null && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.quizExplanation}>
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : 'information-circle'}
            size={20}
            color={isCorrect ? colors.primary : colors.secondary}
          />
          <Text style={styles.quizExplanationText}>
            <Text style={{ fontWeight: '700' }}>{isCorrect ? 'Correct! ' : 'Stack is the answer. '}</Text>
            Stacks use Last-In-First-Out — items pushed last are popped first. Used in undo, function
            calls, and expression evaluation.
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ============================================================================
// STEP 3 — Sample visualization (sliding window animation)
// ============================================================================
const VIZ_ARRAY = [4, 2, 1, 7, 3, 6, 5, 8];
const WINDOW_SIZE = 3;

function VisualizationStep() {
  const [windowStart, setWindowStart] = useState(0);
  const maxStart = VIZ_ARRAY.length - WINDOW_SIZE;

  useEffect(() => {
    const t = setInterval(() => {
      setWindowStart((s) => (s >= maxStart ? 0 : s + 1));
    }, 1100);
    return () => clearInterval(t);
  }, [maxStart]);

  const sum = VIZ_ARRAY.slice(windowStart, windowStart + WINDOW_SIZE).reduce((a, b) => a + b, 0);

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.modeHeader}>
        <View style={[styles.modeBadge, { backgroundColor: `${colors.accent}20` }]}>
          <Ionicons name="analytics-outline" size={16} color={colors.accentDark} />
          <Text style={[styles.modeBadgeText, { color: colors.accentDark }]}>Visualize mode</Text>
        </View>
        <Text style={styles.title}>Watch algorithms run</Text>
        <Text style={styles.subtitle}>The sliding window in motion</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.vizContainer}>
        <View style={styles.vizArray}>
          {VIZ_ARRAY.map((n, i) => {
            const inWindow = i >= windowStart && i < windowStart + WINDOW_SIZE;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.vizCell,
                  inWindow && styles.vizCellActive,
                ]}
              >
                <Text style={[styles.vizCellText, inWindow && styles.vizCellTextActive]}>{n}</Text>
              </Animated.View>
            );
          })}
        </View>
        <View style={styles.vizMeta}>
          <View style={styles.vizMetaCol}>
            <Text style={styles.vizMetaLabel}>Window size</Text>
            <Text style={styles.vizMetaValue}>{WINDOW_SIZE}</Text>
          </View>
          <View style={styles.vizMetaDivider} />
          <View style={styles.vizMetaCol}>
            <Text style={styles.vizMetaLabel}>Window sum</Text>
            <Animated.Text
              key={`sum-${windowStart}`}
              entering={FadeIn.duration(300)}
              style={[styles.vizMetaValue, { color: colors.accent }]}
            >
              {sum}
            </Animated.Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.featureLine}>
        <Ionicons name="play-circle-outline" size={16} color={colors.inkLight} />
        <Text style={styles.featureLineText}>20+ algorithms with live visualizations</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// STEP 4 — Works offline
// ============================================================================
function OfflineStep() {
  const planeX = useSharedValue(-80);

  useEffect(() => {
    planeX.value = withRepeat(
      withTiming(SCREEN_WIDTH + 80, { duration: 4500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const planeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: planeX.value }, { rotate: '-15deg' }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroIconWrap}>
        <LinearGradient
          colors={[colors.accent, colors.accentLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroIcon}
        >
          <Ionicons name="airplane" size={48} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Your library, anywhere
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        The whole app works fully offline. No internet, no problem.
      </Animated.Text>

      <View style={styles.offlineSky}>
        <Animated.View style={[styles.offlinePlane, planeStyle]}>
          <Ionicons name="airplane" size={40} color={colors.accent} />
        </Animated.View>
      </View>

      <View style={styles.offlinePerks}>
        <PerkRow icon="cloud-offline-outline" text="Study on the subway, on a flight, in the woods" />
        <PerkRow icon="flash-outline" text="Instant load — no waiting on the network" />
        <PerkRow icon="lock-closed-outline" text="Your progress stays on your device" />
      </View>
    </Animated.View>
  );
}

function PerkRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.perkRow}>
      <View style={styles.perkIconWrap}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.perkText}>{text}</Text>
    </View>
  );
}

// ============================================================================
// STEP 5 — Practice (live Pyodide editor with Two Sum)
// ============================================================================
function PracticeStep() {
  const problem = getProblem('two-sum');
  const webRef = React.useRef<WebView>(null);
  const [pageUri, setPageUri] = useState<string | null>(null);
  const [stagedDir, setStagedDir] = useState<string | null>(null);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultPass, setResultPass] = useState<boolean | null>(null);

  const html = React.useMemo(
    () =>
      problem
        ? buildPracticeHtml({ starter: problem.starter, fnName: problem.functionName })
        : '',
    [problem?.id]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dir = await ensurePracticeRuntime();
        const file = dir + 'onboarding.html';
        await FileSystem.writeAsStringAsync(file, html);
        if (!cancelled) {
          setStagedDir(dir);
          setPageUri(file);
        }
      } catch {
        // Onboarding shouldn't block on this; the next button still works.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [html]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') {
        setRuntimeReady(true);
      } else if (msg.type === 'result') {
        const p = msg.payload;
        const pass = p.passed === p.total && p.total > 0;
        setResultPass(pass);
        setResultText(
          pass
            ? `All ${p.total} tests passed in ${p.totalRuntimeMs} ms`
            : `${p.passed} / ${p.total} tests passed`
        );
        setRunning(false);
      } else if (msg.type === 'error') {
        setResultPass(false);
        setResultText('Something went wrong running your code.');
        setRunning(false);
      }
    } catch {}
  };

  const handleRun = () => {
    if (!problem || !runtimeReady || running) return;
    setRunning(true);
    setResultText(null);
    setResultPass(null);
    const tests = [
      ...problem.examples.map((t) => ({ ...t, hidden: false })),
      ...problem.hiddenTests.map((t) => ({ ...t, hidden: true })),
    ];
    webRef.current?.postMessage(
      JSON.stringify({ type: 'run', fnName: problem.functionName, tests })
    );
  };

  if (!problem) return null;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroIconWrap}>
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroIcon}
        >
          <Ionicons name="terminal-outline" size={44} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Code, run, repeat
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        Try Two Sum right now — the Python runs on your device.
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(400).duration(500)}
        style={styles.practiceCard}
      >
        <View style={styles.practiceExampleRow}>
          <Text style={styles.practiceExampleLabel}>Input</Text>
          <Text style={styles.practiceExampleMono}>two_sum([2,7,11,15], 9)</Text>
        </View>
        <View style={styles.practiceExampleRow}>
          <Text style={styles.practiceExampleLabel}>Output</Text>
          <Text style={styles.practiceExampleMono}>[0, 1]</Text>
        </View>

        <View style={styles.practiceEditorWrap}>
          {pageUri && stagedDir ? (
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
              style={styles.practiceWebview}
            />
          ) : (
            <View style={styles.practiceEditorLoading}>
              <ActivityIndicator color={colors.secondary} />
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleRun}
          disabled={!runtimeReady || running}
          activeOpacity={0.85}
          style={[
            styles.practiceRunBtn,
            (!runtimeReady || running) && styles.practiceRunBtnDisabled,
          ]}
        >
          {running ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="play" size={18} color={colors.white} />
              <Text style={styles.practiceRunText}>
                {runtimeReady ? 'Run code' : 'Loading Python…'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {resultText && (
          <Animated.View
            entering={FadeIn.duration(220)}
            style={[
              styles.practiceResult,
              resultPass ? styles.practiceResultPass : styles.practiceResultFail,
            ]}
          >
            <Ionicons
              name={resultPass ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color={resultPass ? colors.primary : colors.accent}
            />
            <Text style={styles.practiceResultText}>{resultText}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// STEP 6 — System Design teaser
// ============================================================================
function SystemDesignTeaserStep() {
  // Static mockup of a small architecture diagram.
  // Positions are in the local coordinate space of the canvas below.
  const W = SCREEN_WIDTH - spacing.lg * 4;
  const H = 200;
  const nodes = [
    { x: 28, y: 78, label: 'Client', icon: 'phone-portrait-outline', color: '#8B5CF6' },
    { x: 0.5, y: 78, label: 'API', icon: 'server-outline', color: '#10B981' },
    { x: 1.0, y: 22, label: 'Cache', icon: 'flash-outline', color: '#F43F5E' },
    { x: 1.0, y: 134, label: 'Database', icon: 'cube-outline', color: '#2563EB' },
  ];
  const NODE_SIZE = 70;
  const place = (n: { x: number; y: number }) => {
    const x = n.x <= 1 ? n.x * (W - NODE_SIZE) : n.x;
    const y = n.y;
    return { left: x, top: y, cx: x + NODE_SIZE / 2, cy: y + NODE_SIZE / 2 };
  };
  const positions = nodes.map(place);
  const lines: [number, number][] = [
    [0, 1],
    [1, 2],
    [1, 3],
  ];

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroIconWrap}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroIcon}
        >
          <Ionicons name="git-network-outline" size={44} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Sketch your way through system design
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        Drag in components, draw connections, and let us check the wiring.
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(400).duration(500)}
        style={[styles.sdCanvas, { width: W, height: H }]}
      >
        <Svg
          width={W}
          height={H}
          style={StyleSheet.absoluteFill as any}
          pointerEvents="none"
        >
          {lines.map(([a, b], i) => (
            <Line
              key={i}
              x1={positions[a].cx}
              y1={positions[a].cy}
              x2={positions[b].cx}
              y2={positions[b].cy}
              stroke={colors.inkLighter}
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </Svg>
        {nodes.map((n, i) => (
          <View
            key={i}
            style={[
              styles.sdNode,
              {
                left: positions[i].left,
                top: positions[i].top,
                borderColor: n.color,
                backgroundColor: `${n.color}1A`,
              },
            ]}
          >
            <Ionicons name={n.icon as any} size={18} color={n.color} />
            <Text style={styles.sdNodeLabel}>{n.label}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={styles.offlinePerks}>
        <PerkRow icon="hand-left-outline" text="Tap a palette, drop nodes on the canvas" />
        <PerkRow icon="checkmark-done-outline" text="Test diagram tells you exactly what's missing" />
        <PerkRow icon="book-outline" text="Hints and a worked solution when you're stuck" />
      </View>
    </Animated.View>
  );
}

// ============================================================================
// STEP 7 — Behavioral practice
// ============================================================================
function BehavioralStep() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroIconWrap}>
        <LinearGradient
          colors={[colors.accent, colors.accentLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroIcon}
        >
          <Ionicons name="chatbubbles-outline" size={44} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Polish the stories you'll actually tell
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        Ten classic behavioral prompts with a notes field per question. Edit
        in the app — answers save as you type.
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(400).duration(500)}
        style={styles.behavioralStack}
      >
        <BehavioralPreviewCard
          number={1}
          prompt="Tell me about a challenging technical problem you solved recently."
          meta="84 words saved"
          checked
          expanded
          previewLines={[
            'Last quarter our checkout latency spiked at peak hours…',
            'I traced it to a missing index on the orders table…',
            'Result: p95 dropped from 3.1s to 280ms.',
          ]}
        />
        <BehavioralPreviewCard
          number={2}
          prompt="Describe a time you disagreed with a teammate."
          meta="42 words saved"
          checked
        />
        <BehavioralPreviewCard
          number={3}
          prompt="What's a project you're most proud of?"
          meta="No answer yet"
        />
      </Animated.View>
    </Animated.View>
  );
}

function BehavioralPreviewCard({
  number,
  prompt,
  meta,
  checked,
  expanded,
  previewLines,
}: {
  number: number;
  prompt: string;
  meta: string;
  checked?: boolean;
  expanded?: boolean;
  previewLines?: string[];
}) {
  return (
    <View style={styles.behavioralCard}>
      <View style={styles.behavioralRow}>
        <View style={styles.behavioralNumber}>
          <Text style={styles.behavioralNumberText}>
            {String(number).padStart(2, '0')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.behavioralPrompt} numberOfLines={2}>
            {prompt}
          </Text>
          <Text style={styles.behavioralMeta}>{meta}</Text>
        </View>
        {checked && (
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
        )}
      </View>
      {expanded && previewLines && (
        <View style={styles.behavioralPreviewBody}>
          {previewLines.map((l, i) => (
            <Text key={i} style={styles.behavioralPreviewText}>
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STEP 8 — Trial paywall
// ============================================================================
function PaywallStep({
  product,
  isLoading,
  onStartTrial,
  onSkip,
  onRestore,
}: {
  product: any;
  isLoading: boolean;
  onStartTrial: () => void;
  onSkip: () => void;
  onRestore: () => void;
}) {
  const price = product?.price || '$0.99';

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroIconWrap}>
        <LinearGradient
          colors={[colors.purple, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroIcon}
        >
          <Ionicons name="sparkles" size={44} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Try Algogo Pro free
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        7 days free, then {price}/month. Cancel anytime.
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.paywallFeatures}>
        <PaywallFeature icon="lock-open-outline" text="Unlock all 50+ categories" />
        <PaywallFeature icon="copy-outline" text="1,500+ flashcards across 6 tracks" />
        <PaywallFeature icon="analytics-outline" text="Live algorithm visualizations" />
        <PaywallFeature icon="cloud-offline-outline" text="Works fully offline" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.timeline}>
        <TimelineRow
          icon="lock-open-outline"
          color={colors.primary}
          title="Today"
          subtitle="Get full access — try everything free"
        />
        <View style={styles.timelineLine} />
        <TimelineRow
          icon="notifications-outline"
          color={colors.secondary}
          title="Day 6"
          subtitle="We'll remind you the trial is ending"
        />
        <View style={styles.timelineLine} />
        <TimelineRow
          icon="card-outline"
          color={colors.accent}
          title="Day 7"
          subtitle={`${price}/mo charged unless you cancel`}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.paywallCtas}>
        <TouchableOpacity
          style={[styles.primaryCta, isLoading && { opacity: 0.6 }]}
          onPress={onStartTrial}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color={colors.white} />
              <Text style={styles.primaryCtaText}>Start 7-day free trial</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.secondaryCtaText}>Continue with free version</Text>
        </TouchableOpacity>

        <View style={styles.legalRow}>
          <TouchableOpacity onPress={onRestore} disabled={isLoading}>
            <Text style={styles.legalLink}>Restore Purchase</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={styles.legalLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.legalLink}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function PaywallFeature({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.paywallFeatureRow}>
      <View style={styles.paywallFeatureIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.paywallFeatureText}>{text}</Text>
    </View>
  );
}

function TimelineRow({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.timelineCol}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotPast: {
    backgroundColor: colors.primaryLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepContainer: {
    flex: 1,
  },
  heroIconWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  title: {
    ...typography.displaySmall,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  // Bottom CTA
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  continueBtnText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 16,
  },
  // Step 0: tracks grid
  tracksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginBottom: spacing.xl,
  },
  trackCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  trackIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  trackLabel: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.headlineMedium,
    color: colors.primary,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  // Mode header (cards / quiz / viz)
  modeHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modeBadgeText: {
    ...typography.labelMedium,
  },
  // Step 1: flashcard
  flipCardWrap: {
    height: 300,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  flipCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    backfaceVisibility: 'hidden',
  },
  flipCardFront: {
    borderColor: colors.secondary,
  },
  flipCardBack: {
    borderColor: colors.accent,
  },
  flipCardLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.5,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  flipCardText: {
    ...typography.headlineMedium,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  flipCardBody: {
    ...typography.bodyMedium,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
  },
  flipHintText: {
    ...typography.labelSmall,
    color: colors.inkLighter,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  featureLineText: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  // Step 2: quiz
  quizQuestionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  quizQuestionText: {
    ...typography.bodyLarge,
    color: colors.ink,
    lineHeight: 24,
  },
  quizOptions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    gap: spacing.md,
  },
  quizOptionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizOptionLetterText: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  quizOptionText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
  },
  quizExplanation: {
    flexDirection: 'row',
    backgroundColor: colors.paperDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quizExplanationText: {
    ...typography.bodySmall,
    color: colors.ink,
    flex: 1,
    lineHeight: 18,
  },
  // Step 3: visualization
  vizContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  vizArray: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  vizCell: {
    width: 36,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vizCellActive: {
    backgroundColor: `${colors.accent}20`,
    borderColor: colors.accent,
    transform: [{ scale: 1.08 }],
  },
  vizCellText: {
    ...typography.labelLarge,
    color: colors.inkLight,
  },
  vizCellTextActive: {
    color: colors.accentDark,
  },
  vizMeta: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vizMetaCol: {
    flex: 1,
    alignItems: 'center',
  },
  vizMetaDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  vizMetaLabel: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginBottom: 2,
  },
  vizMetaValue: {
    ...typography.headlineMedium,
    color: colors.ink,
  },
  // Step 4: offline
  offlineSky: {
    height: 80,
    overflow: 'hidden',
    marginVertical: spacing.lg,
  },
  offlinePlane: {
    position: 'absolute',
    top: 20,
    left: 0,
  },
  offlinePerks: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  perkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
  },
  // Step 5: paywall
  paywallFeatures: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paywallFeatureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paywallFeatureText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
  },
  timeline: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCol: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  timelineSubtitle: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginTop: 1,
  },
  timelineLine: {
    width: 2,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 17,
  },
  paywallCtas: {
    marginTop: 'auto',
  },
  primaryCta: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
    marginBottom: spacing.md,
  },
  primaryCtaText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 16,
  },
  secondaryCtaText: {
    ...typography.labelMedium,
    color: colors.inkLight,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  legalLink: {
    ...typography.labelSmall,
    color: colors.inkLight,
    textDecorationLine: 'underline',
  },
  legalDot: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    paddingHorizontal: 2,
  },
  // Step 5: practice
  practiceCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  practiceExampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  practiceExampleLabel: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkLight,
    width: 56,
  },
  practiceExampleMono: {
    fontFamily: 'Menlo',
    fontSize: 13,
    color: colors.ink,
    flex: 1,
  },
  practiceEditorWrap: {
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#1e1e2e',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  practiceWebview: { backgroundColor: '#1e1e2e', flex: 1 },
  practiceEditorLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceRunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.button(colors.primary),
  },
  practiceRunBtnDisabled: { opacity: 0.6 },
  practiceRunText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 15,
  },
  practiceResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  practiceResultPass: { backgroundColor: `${colors.primary}15` },
  practiceResultFail: { backgroundColor: `${colors.accent}15` },
  practiceResultText: {
    ...typography.labelMedium,
    color: colors.ink,
    flex: 1,
  },
  // Step 6: system design teaser
  sdCanvas: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sdNode: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sdNodeLabel: {
    ...typography.labelSmall,
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  // Step 7: behavioral preview
  behavioralStack: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  behavioralCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  behavioralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  behavioralNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  behavioralNumberText: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  behavioralPrompt: {
    ...typography.labelLarge,
    color: colors.ink,
    fontSize: 14,
  },
  behavioralMeta: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginTop: 2,
  },
  behavioralPreviewBody: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  behavioralPreviewText: {
    ...typography.labelSmall,
    color: colors.inkLight,
    fontSize: 12,
    lineHeight: 18,
  },
});
