import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import Svg, { Line } from 'react-native-svg';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useStore } from '../store/useStore';
import { getProblem } from '../data/blind75';
import { contentStats, roundedPlus } from '../data/stats';
import UpgradeModal from '../components/UpgradeModal';
import { buildPracticeHtml } from '../practice/practiceHtml';
import { ensurePracticeRuntime } from '../practice/stageAssets';
import {
  ExecResult,
  ConsoleOutput,
  ResultBreakdown,
} from '../practice/ResultViews';
import { behavioralQuestions } from '../data/behavioral';
import BehavioralCard from '../components/BehavioralCard';
import {
  systemDesignProblems,
  componentCatalog,
  ComponentType,
} from '../data/systemDesign';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_HEIGHT < 750; // iPhone SE territory
const SD_CANVAS_HEIGHT = IS_SMALL_SCREEN ? 160 : 190;

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
const TOTAL_STEPS = 10;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((step + 1) as Step);
    } else {
      // Last informational slide → open the full-screen paywall.
      setPaywallVisible(true);
    }
  };

  const goBack = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  const closePaywall = () => {
    setPaywallVisible(false);
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top bar: progress + back */}
      <View style={styles.topBar}>
        {step > 0 ? (
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
        {step === 4 && <PracticeStep />}
        {step === 5 && <BugFixStep />}
        {step === 6 && <SystemDesignTeaserStep />}
        {step === 7 && <BehavioralStep />}
        {step === 8 && <OfflineStep />}
        {step === 9 && <MockInterviewStep />}
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.continueBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <UpgradeModal
        visible={paywallVisible}
        onClose={closePaywall}
        showSkip
      />
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
      <View style={styles.heroIconWrap}>
        <Animated.View
          entering={ZoomIn.delay(80).springify().damping(14).mass(0.6)}
          style={styles.heroIcon}
        >
          <Ionicons name="rocket-outline" size={42} color={colors.primary} />
        </Animated.View>
      </View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Master your tech interviews
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        {roundedPlus(contentStats.categories, 10)} topics across {contentStats.tracks} engineering tracks — no fluff
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
        <Stat value={roundedPlus(contentStats.categories, 10)} label="Categories" />
        <View style={styles.statDivider} />
        <Stat value={roundedPlus(contentStats.flashcards, 100)} label="Flashcards" />
        <View style={styles.statDivider} />
        <Stat value={roundedPlus(contentStats.quizQuestions, 50)} label="Quiz qs" />
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
            Stacks use Last-In-First-Out — items pushed last are popped first.
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
        <Text style={styles.featureLineText}>{contentStats.algorithmPatterns} algorithms with live visualizations</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// STEP 4 — Works offline
// ============================================================================
function OfflineStep() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <View style={styles.heroIconWrap}>
        <Animated.View
          entering={ZoomIn.delay(80).springify().damping(14).mass(0.6)}
          style={styles.heroIcon}
        >
          <Ionicons name="airplane-outline" size={42} color={colors.accent} />
        </Animated.View>
      </View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Your library, anywhere
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        The whole app works fully offline. No internet, no problem.
      </Animated.Text>

      <View style={styles.offlinePerks}>
        <PerkRow icon="cloud-offline-outline" text="Study on the subway, on a flight, in the woods" />
        <PerkRow icon="code-slash-outline" text="Run Python solutions to algorithm problems with no wifi" />
        <PerkRow icon="git-network-outline" text="Sketch and test system-design diagrams offline" />
        <PerkRow icon="chatbubbles-outline" text="Write and edit behavioral answers anywhere" />
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

// Shared code-symbol shortcuts for the onboarding mini-editor. Mirrors the
// set in ProblemScreen so muscle memory carries between the two.
const ONBOARD_KEY_SHORTCUTS: { label: string; insert: string; cursorOffset?: number }[] = [
  { label: 'Tab', insert: '    ' },
  { label: ':', insert: ':' },
  { label: '( )', insert: '()', cursorOffset: 1 },
  { label: '[ ]', insert: '[]', cursorOffset: 1 },
  { label: '{ }', insert: '{}', cursorOffset: 1 },
  { label: '"', insert: '""', cursorOffset: 1 },
  { label: '=', insert: '=' },
  { label: '==', insert: '==' },
  { label: '->', insert: '->' },
  { label: ',', insert: ', ' },
  { label: 'def', insert: 'def ' },
  { label: 'return', insert: 'return ' },
  { label: 'for', insert: 'for ' },
  { label: 'in', insert: ' in ' },
  { label: 'if', insert: 'if ' },
  { label: 'len()', insert: 'len()', cursorOffset: 4 },
  { label: 'range()', insert: 'range()', cursorOffset: 6 },
];

// ============================================================================
// STEP 5 — Practice (live Pyodide editor with Two Sum)
// ============================================================================
function PracticeStep() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <View style={styles.heroIconWrap}>
        <Animated.View
          entering={ZoomIn.delay(80).springify().damping(14).mass(0.6)}
          style={styles.heroIcon}
        >
          <Ionicons name="terminal-outline" size={40} color={colors.secondary} />
        </Animated.View>
      </View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Code, run, repeat
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        {contentStats.algorithmProblems} algorithm problems with a real Python runtime. Every solve
        happens right on your device.
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

        <View style={styles.practiceMockEditor}>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>1</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>def </Text>
              <Text style={styles.practiceMockFn}>two_sum</Text>
              <Text style={styles.practiceMockPlain}>(nums, target):</Text>
            </Text>
          </View>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>2</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockPlain}>    seen = {'{}'}</Text>
            </Text>
          </View>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>3</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>    for </Text>
              <Text style={styles.practiceMockPlain}>i, n </Text>
              <Text style={styles.practiceMockKeyword}>in </Text>
              <Text style={styles.practiceMockPlain}>enumerate(nums):</Text>
            </Text>
          </View>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>4</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>        if </Text>
              <Text style={styles.practiceMockPlain}>target - n </Text>
              <Text style={styles.practiceMockKeyword}>in </Text>
              <Text style={styles.practiceMockPlain}>seen:</Text>
            </Text>
          </View>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>5</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>            return </Text>
              <Text style={styles.practiceMockPlain}>[seen[target - n], i]</Text>
            </Text>
          </View>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>6</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockPlain}>        seen[n] = i</Text>
            </Text>
          </View>
        </View>

        <View style={styles.practiceMockResult}>
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          <Text style={styles.practiceMockResultText}>
            All 6 tests passed · 4 ms
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// STEP 6 — Bug Fix (mock editor with a marked bug + diff-style fix)
// ============================================================================
const BUGFIX_LANG_PILLS: { label: string; color: string }[] = [
  { label: 'Python', color: '#3776AB' },
  { label: 'JavaScript', color: '#F7DF1E' },
  { label: 'Java', color: '#ED8B00' },
];

function BugFixStep() {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <View style={styles.heroIconWrap}>
        <Animated.View
          entering={ZoomIn.delay(80).springify().damping(14).mass(0.6)}
          style={[styles.heroIcon, { backgroundColor: `${colors.error}18` }]}
        >
          <Ionicons name="bug-outline" size={40} color={colors.error} />
        </Animated.View>
      </View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Spot the bug, fix the line
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        {contentStats.bugFixProblems} broken snippets across Python, JavaScript, and Java.
        Tap, fix, run the tests — all on-device.
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(400).duration(500)}
        style={styles.practiceCard}
      >
        <View style={styles.bugFixPillRow}>
          {BUGFIX_LANG_PILLS.map((p) => (
            <View
              key={p.label}
              style={[styles.bugFixPill, { backgroundColor: `${p.color}22` }]}
            >
              <View style={[styles.bugFixPillDot, { backgroundColor: p.color }]} />
              <Text style={[styles.bugFixPillText, { color: p.color }]}>{p.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.bugFixSectionLabel}>BUGGY</Text>
        <View style={styles.practiceMockEditor}>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>1</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>def </Text>
              <Text style={styles.practiceMockFn}>average</Text>
              <Text style={styles.practiceMockPlain}>(nums):</Text>
            </Text>
          </View>
          <View style={styles.practiceMockLine}>
            <Text style={styles.practiceMockLineNo}>2</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>    if not </Text>
              <Text style={styles.practiceMockPlain}>nums: </Text>
              <Text style={styles.practiceMockKeyword}>return </Text>
              <Text style={styles.practiceMockPlain}>0.0</Text>
            </Text>
          </View>
          <View style={[styles.practiceMockLine, styles.bugFixBuggyLine]}>
            <Text style={[styles.practiceMockLineNo, styles.bugFixBuggyLineNo]}>3</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>    return </Text>
              <Text style={styles.practiceMockPlain}>sum(nums) </Text>
              <Text style={styles.bugFixBadToken}>//</Text>
              <Text style={styles.practiceMockPlain}> len(nums)</Text>
            </Text>
          </View>
        </View>

        <View style={styles.bugFixDiffRow}>
          <View style={styles.bugFixDiffBadge}>
            <Ionicons name="arrow-down" size={12} color={colors.primary} />
            <Text style={styles.bugFixDiffBadgeText}>YOUR FIX</Text>
          </View>
        </View>
        <View style={[styles.practiceMockEditor, styles.bugFixFixedEditor]}>
          <View style={[styles.practiceMockLine, styles.bugFixFixedLine]}>
            <Text style={[styles.practiceMockLineNo, styles.bugFixFixedLineNo]}>3</Text>
            <Text style={styles.practiceMockCode}>
              <Text style={styles.practiceMockKeyword}>    return </Text>
              <Text style={styles.practiceMockPlain}>sum(nums) </Text>
              <Text style={styles.bugFixGoodToken}>/</Text>
              <Text style={styles.practiceMockPlain}> len(nums)</Text>
            </Text>
          </View>
        </View>

        <View style={styles.practiceMockResult}>
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          <Text style={styles.practiceMockResultText}>
            All 5 tests passed · 1 ms
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// STEP 7 — System Design (interactive mini editor)
// ============================================================================
type DemoNodeState = { id: string; type: ComponentType; x: number; y: number };
type DemoEdgeState = { from: string; to: string };

const DEMO_NODE_W = 76;
const DEMO_NODE_H = 56;
const DEMO_PALETTE: ComponentType[] = ['cache', 'database', 'load_balancer', 'message_queue'];

function SystemDesignTeaserStep() {
  const [nodes, setNodes] = useState<DemoNodeState[]>([
    { id: 'n1', type: 'client', x: 20, y: 80 },
    { id: 'n2', type: 'web_server', x: 150, y: 80 },
  ]);
  const [edges, setEdges] = useState<DemoEdgeState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: SD_CANVAS_HEIGHT });
  const nextIdRef = React.useRef(3);

  const moveNode = React.useCallback(
    (id: string, dx: number, dy: number) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                x: Math.max(0, Math.min(n.x + dx, canvasSize.w - DEMO_NODE_W)),
                y: Math.max(0, Math.min(n.y + dy, canvasSize.h - DEMO_NODE_H)),
              }
            : n,
        ),
      );
    },
    [canvasSize.w, canvasSize.h],
  );

  const tapNode = React.useCallback((id: string) => {
    setSelectedId((prev) => {
      if (prev === null) return id;
      if (prev === id) return null;
      setEdges((existing) => {
        const dup = existing.some(
          (e) => (e.from === prev && e.to === id) || (e.from === id && e.to === prev),
        );
        if (dup) return existing;
        return [...existing, { from: prev, to: id }];
      });
      return null;
    });
  }, []);

  const addNode = (type: ComponentType) => {
    const id = `n${nextIdRef.current++}`;
    const offset = nodes.length * 20;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type,
        x: Math.max(10, Math.min(canvasSize.w / 2 - DEMO_NODE_W / 2 + (offset % 60), canvasSize.w - DEMO_NODE_W - 10)),
        y: Math.max(10, Math.min(40 + (offset % 80), canvasSize.h - DEMO_NODE_H - 10)),
      },
    ]);
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <View style={styles.heroIconWrap}>
        <Animated.View
          entering={ZoomIn.delay(80).springify().damping(14).mass(0.6)}
          style={styles.heroIcon}
        >
          <Ionicons name="git-network-outline" size={40} color={colors.primary} />
        </Animated.View>
      </View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
        Sketch system design
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
        Drag nodes, tap two to wire them. A Test button grades your design.
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(400).duration(500)}
        style={[styles.sdCanvas, { height: SD_CANVAS_HEIGHT, width: SCREEN_WIDTH - spacing.lg * 2, alignSelf: 'center' }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setCanvasSize({ w: width, h: height });
        }}
      >
        {canvasSize.w > 0 && (
          <Svg
            width={canvasSize.w}
            height={canvasSize.h}
            style={StyleSheet.absoluteFill as any}
            pointerEvents="none"
          >
            {edges.map((e, i) => {
              const f = nodes.find((n) => n.id === e.from);
              const t = nodes.find((n) => n.id === e.to);
              if (!f || !t) return null;
              return (
                <Line
                  key={i}
                  x1={f.x + DEMO_NODE_W / 2}
                  y1={f.y + DEMO_NODE_H / 2}
                  x2={t.x + DEMO_NODE_W / 2}
                  y2={t.y + DEMO_NODE_H / 2}
                  stroke={colors.inkLight}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>
        )}
        {nodes.map((n) => (
          <DemoDraggableNode
            key={n.id}
            node={n}
            selected={selectedId === n.id}
            onTap={tapNode}
            onMove={moveNode}
          />
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={styles.sdDemoPalette}
      >
        {DEMO_PALETTE.map((type) => {
          const spec = componentCatalog[type];
          return (
            <TouchableOpacity
              key={type}
              style={[styles.sdDemoPaletteBtn, { borderColor: spec.color }]}
              activeOpacity={0.85}
              onPress={() => addNode(type)}
            >
              <Ionicons name={spec.icon as any} size={16} color={spec.color} />
              <Text style={styles.sdDemoPaletteLabel}>{spec.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

function DemoDraggableNode({
  node,
  selected,
  onTap,
  onMove,
}: {
  node: DemoNodeState;
  selected: boolean;
  onTap: (id: string) => void;
  onMove: (id: string, dx: number, dy: number) => void;
}) {
  const spec = componentCatalog[node.type];
  const pan = Gesture.Pan()
    .minDistance(6)
    .onChange((e) => {
      'worklet';
      runOnJS(onMove)(node.id, e.changeX, e.changeY);
    });
  const tap = Gesture.Tap()
    .maxDistance(5)
    .onEnd(() => {
      'worklet';
      runOnJS(onTap)(node.id);
    });
  const gesture = Gesture.Race(pan, tap);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.sdNode,
          {
            width: DEMO_NODE_W,
            height: DEMO_NODE_H,
            left: node.x,
            top: node.y,
            borderColor: selected ? colors.secondary : spec.color,
            backgroundColor: `${spec.color}1A`,
            borderWidth: selected ? 3 : 2,
          },
        ]}
      >
        <Ionicons name={spec.icon as any} size={16} color={spec.color} />
        <Text style={styles.sdNodeLabel} numberOfLines={1}>{spec.label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

// ============================================================================
// STEP 7 — Behavioral practice
// ============================================================================
function BehavioralStep() {
  const firstQuestion = behavioralQuestions[0];

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      {/* Tap-outside-input dismisses the keyboard. The TextInput inside
          BehavioralCard captures its own taps so this only fires on chrome. */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing.md }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroIconWrap}>
            <Animated.View
              entering={ZoomIn.delay(80).springify().damping(14).mass(0.6)}
              style={styles.heroIcon}
            >
              <Ionicons name="chatbubbles-outline" size={40} color={colors.accent} />
            </Animated.View>
          </View>

          <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
            Polish your stories
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
            Tap the prompt, start drafting. Your answer saves as you type.
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.behavioralStack}
          >
            <BehavioralCard question={firstQuestion} />
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

// ============================================================================
// STEP 9 — Mock Interview (advertising slide, not interactive)
// ============================================================================
// The faux session cycles through one round of each section kind so the card
// "plays" a whole interview on loop.
const MI_STAGES: {
  q: number;
  kind: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tag: string;
  tagColor: string;
  seconds: number;
  body: 'code' | 'diagram' | 'bugfix' | 'behavioral';
  result: string;
}[] = [
  {
    q: 2,
    kind: 'LeetCode',
    color: '#8B5CF6',
    icon: 'code-slash-outline',
    title: 'Two Sum',
    tag: 'Medium',
    tagColor: colors.accentDark,
    seconds: 11 * 60 + 42,
    body: 'code',
    result: 'All 6 tests passed',
  },
  {
    q: 3,
    kind: 'System Design',
    color: '#636E72',
    icon: 'git-network-outline',
    title: 'Design a URL Shortener',
    tag: 'Diagram',
    tagColor: colors.secondaryDark,
    seconds: 24 * 60 + 58,
    body: 'diagram',
    result: 'All components connected',
  },
  {
    q: 4,
    kind: 'Bug Fix',
    color: '#EF4444',
    icon: 'bug-outline',
    title: 'Fix: Average of a List',
    tag: 'Python',
    tagColor: '#3776AB',
    seconds: 9 * 60 + 51,
    body: 'bugfix',
    result: 'Bug fixed — 5 / 5 tests',
  },
  {
    q: 5,
    kind: 'Behavioral',
    color: '#1CB0F6',
    icon: 'chatbubbles-outline',
    title: 'A challenge you overcame',
    tag: 'STAR',
    tagColor: colors.secondaryDark,
    seconds: 4 * 60 + 43,
    body: 'behavioral',
    result: 'Answer saved',
  },
];

const MI_STAGE_MS = 3600;

function MockInterviewStep() {
  const [stageIdx, setStageIdx] = useState(0);
  const stage = MI_STAGES[stageIdx];

  // Cycle through the interview rounds.
  useEffect(() => {
    const t = setInterval(
      () => setStageIdx((i) => (i + 1) % MI_STAGES.length),
      MI_STAGE_MS,
    );
    return () => clearInterval(t);
  }, []);

  // Per-question countdown — resets to the new budget on every round.
  const [secondsLeft, setSecondsLeft] = useState(MI_STAGES[0].seconds);
  useEffect(() => {
    setSecondsLeft(MI_STAGES[stageIdx].seconds);
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stageIdx]);
  const mm = Math.floor(secondsLeft / 60);
  const ss = (secondsLeft % 60).toString().padStart(2, '0');

  // Session progress bar eases forward as the rounds advance — no spring,
  // a bouncy progress bar reads as glitchy.
  const fill = useSharedValue(MI_STAGES[0].q / 6);
  useEffect(() => {
    fill.value = withTiming(MI_STAGES[stageIdx].q / 6, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [stageIdx]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.modeHeader}>
        <View style={[styles.modeBadge, { backgroundColor: `${colors.purple}20` }]}>
          <Ionicons name="stopwatch-outline" size={16} color={colors.purpleDark} />
          <Text style={[styles.modeBadgeText, { color: colors.purpleDark }]}>
            Mock Interview
          </Text>
        </View>
        <Text style={styles.title}>Rehearse the real thing</Text>
        <Text style={styles.subtitle}>
          Mix coding, system design, bug fixes, and behavioral from our massive
          question bank — build a custom interview or pick a preset.
        </Text>
      </Animated.View>

      {/* Faux session card — plays one round per section kind on loop */}
      <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.miCard}>
        <View style={styles.miHeader}>
          <Animated.Text
            key={`q-${stageIdx}`}
            entering={FadeIn.duration(300)}
            style={styles.miProgressText}
          >
            Question {stage.q} of 6
          </Animated.Text>
          <View style={[styles.miTimerChip, { backgroundColor: `${stage.color}1C` }]}>
            <Ionicons name="time-outline" size={13} color={stage.color} />
            <Text style={[styles.miTimerText, { color: stage.color }]}>
              {mm}:{ss}
            </Text>
          </View>
          <View style={styles.miNextPill}>
            <Text style={styles.miNextPillText}>Next</Text>
            <Ionicons name="arrow-forward" size={11} color={colors.white} />
          </View>
        </View>
        <View style={styles.miBarTrack}>
          <Animated.View
            style={[styles.miBarFill, { backgroundColor: stage.color }, fillStyle]}
          />
        </View>

        <Animated.View key={`stage-${stageIdx}`} entering={FadeIn.duration(350)}>
          <View style={styles.miProblemRow}>
            <View style={[styles.miKindChip, { backgroundColor: `${stage.color}16` }]}>
              <Ionicons name={stage.icon} size={12} color={stage.color} />
              <Text style={[styles.miKindChipText, { color: stage.color }]}>
                {stage.kind}
              </Text>
            </View>
            <View style={[styles.bugFixPill, { backgroundColor: `${stage.tagColor}1E` }]}>
              <Text style={[styles.bugFixPillText, { color: stage.tagColor }]}>
                {stage.tag}
              </Text>
            </View>
          </View>
          <Text style={styles.miProblemTitle} numberOfLines={1}>
            {stage.title}
          </Text>

          {stage.body === 'code' && <MiCodeBody />}
          {stage.body === 'diagram' && <MiDiagramBody />}
          {stage.body === 'bugfix' && <MiBugFixBody />}
          {stage.body === 'behavioral' && <MiBehavioralBody />}

          {/* Fixed-height slot so the toast doesn't shift the layout */}
          <View style={styles.miResultSlot}>
            <Animated.View
              entering={FadeInUp.delay(1300).duration(400)}
              style={styles.practiceMockResult}
            >
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.practiceMockResultText}>{stage.result}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>

    </Animated.View>
  );
}

function MiCodeBody() {
  return (
    <View style={[styles.practiceMockEditor, styles.miBody]}>
      <View style={styles.practiceMockLine}>
        <Text style={styles.practiceMockLineNo}>1</Text>
        <Text style={styles.practiceMockCode}>
          <Text style={styles.practiceMockKeyword}>def </Text>
          <Text style={styles.practiceMockFn}>two_sum</Text>
          <Text style={styles.practiceMockPlain}>(nums, target):</Text>
        </Text>
      </View>
      <View style={styles.practiceMockLine}>
        <Text style={styles.practiceMockLineNo}>2</Text>
        <Text style={styles.practiceMockCode}>
          <Text style={styles.practiceMockPlain}>    seen = {'{}'}</Text>
        </Text>
      </View>
      <View style={styles.practiceMockLine}>
        <Text style={styles.practiceMockLineNo}>3</Text>
        <Text style={styles.practiceMockCode}>
          <Text style={styles.practiceMockKeyword}>    for </Text>
          <Text style={styles.practiceMockPlain}>i, n </Text>
          <Text style={styles.practiceMockKeyword}>in </Text>
          <Text style={styles.practiceMockPlain}>enumerate(nums):</Text>
        </Text>
      </View>
    </View>
  );
}

function MiDiagramBody() {
  const nodes: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
    { icon: 'phone-portrait-outline', label: 'Client', color: '#0984E3' },
    { icon: 'git-network-outline', label: 'Load Bal.', color: '#5A67D8' },
    { icon: 'server-outline', label: 'Database', color: '#00B894' },
  ];
  return (
    <View style={[styles.miCanvas, styles.miBody]}>
      {nodes.map((n, i) => (
        <React.Fragment key={n.label}>
          {i > 0 && (
            <Ionicons name="arrow-forward" size={14} color={colors.inkLighter} />
          )}
          <View
            style={[
              styles.miNode,
              { borderColor: n.color, backgroundColor: `${n.color}14` },
            ]}
          >
            <Ionicons name={n.icon} size={14} color={n.color} />
            <Text style={styles.miNodeLabel}>{n.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function MiBugFixBody() {
  return (
    <View style={[styles.practiceMockEditor, styles.miBody]}>
      <View style={styles.practiceMockLine}>
        <Text style={styles.practiceMockLineNo}>1</Text>
        <Text style={styles.practiceMockCode}>
          <Text style={styles.practiceMockKeyword}>def </Text>
          <Text style={styles.practiceMockFn}>average</Text>
          <Text style={styles.practiceMockPlain}>(nums):</Text>
        </Text>
      </View>
      <View style={[styles.practiceMockLine, styles.bugFixBuggyLine]}>
        <Text style={[styles.practiceMockLineNo, styles.bugFixBuggyLineNo]}>2</Text>
        <Text style={styles.practiceMockCode}>
          <Text style={styles.practiceMockKeyword}>    return </Text>
          <Text style={styles.practiceMockPlain}>sum(nums) </Text>
          <Text style={styles.bugFixBadToken}>//</Text>
          <Text style={styles.practiceMockPlain}> len(nums)</Text>
        </Text>
      </View>
    </View>
  );
}

function MiBehavioralBody() {
  return (
    <View style={[styles.miCanvas, styles.miBody, { flexDirection: 'column', gap: spacing.sm }]}>
      <Text style={styles.miQuotePrompt}>
        "Tell me about a challenging technical problem you solved."
      </Text>
      <View style={styles.miQuoteTyping}>
        <Ionicons name="create-outline" size={13} color={colors.secondary} />
        <Text style={styles.miQuoteTypingText}>Drafting STAR answer…</Text>
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
    marginTop: IS_SMALL_SCREEN ? spacing.sm : spacing.xl,
    marginBottom: IS_SMALL_SCREEN ? spacing.sm : spacing.lg,
  },
  heroIcon: {
    width: IS_SMALL_SCREEN ? 72 : 96,
    height: IS_SMALL_SCREEN ? 72 : 96,
    borderRadius: IS_SMALL_SCREEN ? 36 : 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    ...shadows.sm,
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
    marginBottom: IS_SMALL_SCREEN ? spacing.md : spacing.xl,
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
    marginBottom: IS_SMALL_SCREEN ? spacing.sm : spacing.lg,
    marginTop: IS_SMALL_SCREEN ? spacing.xs : spacing.md,
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
    marginTop: spacing.md,
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
    padding: IS_SMALL_SCREEN ? spacing.md : spacing.lg,
    marginBottom: IS_SMALL_SCREEN ? spacing.sm : spacing.lg,
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
    gap: IS_SMALL_SCREEN ? spacing.xs : spacing.sm,
    marginBottom: IS_SMALL_SCREEN ? spacing.xs : spacing.md,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: IS_SMALL_SCREEN ? spacing.sm : spacing.md,
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
  paywallContent: {
    flex: 1,
  },
  paywallContentInner: {
    paddingBottom: spacing.xs,
  },
  paywallHeroWrap: {
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  paywallHeroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  paywallTitle: {
    ...typography.displaySmall,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  paywallSubtitle: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
    marginTop: spacing.md,
  },
  primaryCta: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
    marginBottom: spacing.sm,
  },
  primaryCtaText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 17,
  },
  secondaryCtaText: {
    ...typography.labelLarge,
    color: colors.inkLight,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    fontSize: 14,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  legalLink: {
    ...typography.labelMedium,
    color: colors.inkLight,
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  legalDot: {
    ...typography.labelMedium,
    color: colors.inkLighter,
    paddingHorizontal: 2,
    fontSize: 12,
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
  practiceResultsBlock: {
    marginTop: spacing.sm,
  },
  practiceResultsScroll: {
    maxHeight: 280,
    marginTop: spacing.sm,
  },
  practiceResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  practiceResultText: {
    ...typography.labelMedium,
    color: colors.ink,
    flex: 1,
  },
  practiceMockEditor: {
    backgroundColor: '#1e1e2e',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  practiceMockLine: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  practiceMockLineNo: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: '#6e7383',
    width: 20,
    textAlign: 'right',
    lineHeight: 18,
  },
  practiceMockCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#e6e6f0',
    flex: 1,
  },
  practiceMockKeyword: { color: '#c084fc' },
  practiceMockFn: { color: '#60a5fa' },
  practiceMockPlain: { color: '#e6e6f0' },
  practiceMockResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  practiceMockResultText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  // Step 6: bug-fix slide
  bugFixPillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  bugFixPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  bugFixPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bugFixPillText: {
    ...typography.labelSmall,
    fontWeight: '700',
    fontSize: 11,
  },
  bugFixSectionLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  bugFixBuggyLine: {
    backgroundColor: `${colors.error}22`,
    borderRadius: 4,
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  bugFixBuggyLineNo: {
    color: colors.errorLight,
    fontWeight: '700',
  },
  bugFixBadToken: {
    color: '#ff8a8a',
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  bugFixDiffRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  bugFixDiffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: `${colors.primary}18`,
    borderRadius: borderRadius.full,
  },
  bugFixDiffBadgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
  },
  bugFixFixedEditor: {
    marginTop: 0,
    paddingVertical: spacing.xs,
  },
  bugFixFixedLine: {
    backgroundColor: `${colors.primary}1F`,
    borderRadius: 4,
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  bugFixFixedLineNo: {
    color: colors.primary,
    fontWeight: '700',
  },
  bugFixGoodToken: {
    color: '#a8f0b0',
    fontWeight: '700',
  },
  onboardKbBar: {
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  onboardKbBarFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: 0,
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: colors.card,
    zIndex: 10,
    elevation: 10,
  },
  onboardKbBarInner: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    flexDirection: 'row',
  },
  onboardKbKey: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardKbKeyText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
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
  sdDemoPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sdDemoPaletteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  sdDemoPaletteLabel: {
    ...typography.labelSmall,
    color: colors.ink,
    fontWeight: '700',
    fontSize: 12,
  },
  // Step 9: mock interview ad
  miCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  miHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  miProgressText: {
    ...typography.labelLarge,
    color: colors.ink,
    flex: 1,
  },
  miTimerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.purple}1E`,
  },
  miTimerText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: colors.purpleDark,
  },
  miNextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
  },
  miNextPillText: {
    ...typography.labelSmall,
    color: colors.white,
    fontSize: 11,
  },
  miBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  miBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.purpleDark,
  },
  miProblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  miProblemTitle: {
    ...typography.headlineSmall,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  miKindChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  miKindChipText: {
    ...typography.labelSmall,
    fontWeight: '700',
    fontSize: 11,
  },
  miBody: {
    minHeight: 86,
    justifyContent: 'center',
  },
  miResultSlot: {
    height: 44,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  miCanvas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  miNode: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  miNodeLabel: {
    ...typography.labelSmall,
    color: colors.ink,
    fontSize: 10,
    fontWeight: '700',
  },
  miQuotePrompt: {
    ...typography.bodyMedium,
    color: colors.ink,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  miQuoteTyping: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miQuoteTypingText: {
    ...typography.labelSmall,
    color: colors.secondary,
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
