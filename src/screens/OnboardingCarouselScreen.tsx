// Fullscreen swipe onboarding. Each page: a headline whose words scatter
// and drop back in as you slide, a phone mockup showing the real screen
// for that feature, pill page dots, and a light haptic tick per page. Ends in
// the same paywall as the original flow. Gated by FLAGS.newOnboarding.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  SharedValue,
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '../theme';
import { useStore } from '../store/useStore';
import { contentStats, roundedPlus } from '../data/stats';
import UpgradeModal from '../components/UpgradeModal';

const { width: W, height: H } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

interface Page {
  key: string;
  title: string;
  body: string;
  accent: string;
  /** Screen recording (GIF) or screenshot shown inside the phone frame… */
  image?: number;
  /** …or a code-drawn illustration for screens that don't screenshot well. */
  mock?: 'design';
}

const s = contentStats;

const PAGES: Page[] = [
  {
    key: 'study',
    title: 'Study like the\ninterview is tomorrow',
    body: `${roundedPlus(s.categories, 10)} topics across ${s.tracks} tracks — algorithms, system design, iOS, Android, web, backend, SQL, C++ and CS fundamentals.`,
    accent: '#8B5CF6',
    image: require('../../assets/onboarding/study.gif'),
  },
  {
    key: 'cards',
    title: 'Cards and quizzes\nthat actually stick',
    body: `${roundedPlus(s.flashcards, 100)} flashcards and ${roundedPlus(s.quizQuestions, 100)} quiz questions with explanations, plus live visualizations of every algorithm pattern.`,
    accent: '#F59E0B',
    image: require('../../assets/onboarding/cards.gif'),
  },
  {
    key: 'algorithms',
    title: 'Run real Python.\nNo wifi needed',
    body: `${s.algorithmProblems} algorithm problems with a full Python runtime on your phone — hidden tests, runtime, and a hint when you're stuck.`,
    accent: '#3776AB',
    image: require('../../assets/onboarding/algorithms.gif'),
  },
  {
    key: 'languages',
    title: 'Code in the language\nyou interview in',
    body: `${s.codingProblems} build-and-debug challenges across ${s.codingLanguages.length} languages, from React components with a live preview to SQL graded by SQLite.`,
    accent: '#0EA5E9',
    image: require('../../assets/onboarding/languages.gif'),
  },
  {
    key: 'design',
    title: 'Design systems\non a real canvas',
    body: `${s.systemDesignProblems} system-design problems. Drag components, wire them up, and get graded on the architecture — not a quiz.`,
    accent: '#636E72',
    mock: 'design',
  },
  {
    key: 'interview',
    title: 'Rehearse the\nwhole loop',
    body: `Build timed mock interviews from any mix of sections, answer ${s.behavioralPrompts} behavioral prompts, and get a scored breakdown at the end.`,
    accent: '#10B981',
    image: require('../../assets/onboarding/interview.gif'),
  },
  {
    key: 'offline',
    title: 'Everything works\noffline',
    body: 'Runtimes, content, and progress all live on your phone. Study on the train, in the air, or ten minutes before the call.',
    accent: '#EC4899',
    image: require('../../assets/onboarding/offline.gif'),
  },
];

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

// The stage takes whatever height is left between the headline and the body
// copy; the phone is drawn at full aspect but clipped by the stage and faded
// out along its bottom edge, so the text always has room.
const PHONE_W = Math.min(W * 0.76, 300);
const PHONE_H = PHONE_W * (2622 / 1206);
const PHONE_RADIUS = PHONE_W * 0.16;
const BEZEL = 6;
const FADE_H = 64;
const MOCK_CANVAS_H = Math.round(PHONE_W * 1.05);

export default function OnboardingCarouselScreen() {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useStore((st) => st.completeOnboarding);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const tick = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
  }, []);

  // Haptic tick + index bookkeeping when the centred page changes.
  useAnimatedReaction(
    () => Math.round(scrollX.value / W),
    (page, prev) => {
      if (prev !== null && page !== prev) {
        runOnJS(setIndex)(page);
        runOnJS(tick)();
      }
    },
  );

  const isLast = index === PAGES.length - 1;

  const goNext = () => {
    if (isLast) {
      setPaywallVisible(true);
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * W, animated: true });
  };

  const closePaywall = () => {
    setPaywallVisible(false);
    completeOnboarding();
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / W);
    if (page !== index) setIndex(page);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFFFFF', '#F7F8FC', '#FFFFFF']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Pages */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumEnd}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {PAGES.map((page, i) => (
            <PageView key={page.key} page={page} index={i} scrollX={scrollX} />
          ))}
        </Animated.ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {PAGES.map((p, i) => (
            <Dot key={p.key} index={i} scrollX={scrollX} accent={p.accent} />
          ))}
        </View>

        {/* CTA */}
        <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <TouchableOpacity style={styles.cta} activeOpacity={0.9} onPress={goNext}>
            <Text style={styles.ctaText}>{isLast ? 'Get started' : 'Continue'}</Text>
            <Ionicons name={isLast ? 'sparkles' : 'arrow-forward'} size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <UpgradeModal visible={paywallVisible} onClose={closePaywall} showSkip />
    </View>
  );
}

// ---------------------------------------------------------------------------
// One page: headline words + phone mockup, all driven by scroll position
// ---------------------------------------------------------------------------

function PageView({
  page,
  index,
  scrollX,
}: {
  page: Page;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const lines = useMemo(() => page.title.split('\n'), [page.title]);
  // Word index runs across lines so the stagger keeps flowing.
  let wordCounter = 0;

  const phoneStyle = useAnimatedStyle(() => {
    const p = (scrollX.value - index * W) / W;
    return {
      opacity: interpolate(Math.abs(p), [0, 1], [1, 0.35], Extrapolation.CLAMP),
      transform: [
        { translateX: -p * W * 0.18 },
        { translateY: interpolate(Math.abs(p), [0, 1], [0, 24], Extrapolation.CLAMP) },
        { scale: interpolate(Math.abs(p), [0, 1], [1, 0.9], Extrapolation.CLAMP) },
        { rotateY: `${p * -8}deg` },
      ],
    };
  });

  const bodyStyle = useAnimatedStyle(() => {
    const p = (scrollX.value - index * W) / W;
    return {
      opacity: interpolate(Math.abs(p), [0, 0.6], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(Math.abs(p), [0, 1], [0, 12], Extrapolation.CLAMP) }],
    };
  });

  return (
    <View style={styles.page}>
      {/* Headline */}
      <View style={styles.headline}>
        {lines.map((line, li) => (
          <View key={li} style={styles.headlineLine}>
            {line.split(' ').map((word, wi) => {
              const w = wordCounter++;
              return (
                <Word key={`${li}-${wi}`} text={word} order={w} index={index} scrollX={scrollX} />
              );
            })}
          </View>
        ))}
      </View>

      {/* Phone mockup */}
      <View style={styles.stage}>
        <Animated.View style={[styles.phoneClip, phoneStyle]}>
          <View style={styles.phone}>
            <View style={styles.phoneScreen}>
              {page.image ? (
                <Image
                  source={page.image}
                  style={styles.phoneImage}
                  contentFit="cover"
                  contentPosition="top"
                  autoplay
                  cachePolicy="memory"
                />
              ) : (
                <DesignMock accent={page.accent} />
              )}
            </View>
            <View style={styles.island} />
          </View>
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', '#FFFFFF']}
            locations={[0, 0.6, 1]}
            style={styles.phoneFade}
          />
        </Animated.View>
      </View>

      {/* Body copy */}
      <Animated.Text style={[styles.body, bodyStyle]}>{page.body}</Animated.Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Code-drawn system-design canvas (client → LB → API → cache/DB) that mirrors
// the real SystemDesignScreen's look without needing a screenshot.
// ---------------------------------------------------------------------------

const MOCK_NODES: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; x: number; y: number }[] = [
  { id: 'client', label: 'Client', icon: 'phone-portrait-outline', color: '#8B5CF6', x: 0.5, y: 0.16 },
  { id: 'lb', label: 'Balancer', icon: 'shuffle-outline', color: '#F59E0B', x: 0.5, y: 0.4 },
  { id: 'api', label: 'API', icon: 'server-outline', color: '#10B981', x: 0.5, y: 0.64 },
  { id: 'cache', label: 'Cache', icon: 'flash-outline', color: '#F43F5E', x: 0.25, y: 0.88 },
  { id: 'db', label: 'Database', icon: 'cube-outline', color: '#2563EB', x: 0.75, y: 0.88 },
];
const MOCK_EDGES: [string, string][] = [
  ['client', 'lb'],
  ['lb', 'api'],
  ['api', 'cache'],
  ['api', 'db'],
];

function DesignMock({ accent }: { accent: string }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const NODE_W = 88;
  const NODE_H = 36;
  const pos = (id: string) => {
    const n = MOCK_NODES.find((m) => m.id === id)!;
    return { x: n.x * size.w, y: n.y * size.h };
  };
  return (
    <View
      style={styles.mockRoot}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {/* faux header */}
      <View style={styles.mockHeader}>
        <View style={styles.mockBack} />
        <View style={{ flex: 1 }}>
          <View style={[styles.mockTitle, { width: '58%' }]} />
          <View style={[styles.mockTitle, { width: '34%', height: 6, marginTop: 5, opacity: 0.5 }]} />
        </View>
        <View style={[styles.mockRun, { backgroundColor: colors.primary }]} />
      </View>
      {/* dotted canvas */}
      <View style={styles.mockCanvas}>
        {size.w > 0 &&
          MOCK_EDGES.map(([a, b]) => {
            const p1 = pos(a);
            const p2 = pos(b);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            return (
              <View
                key={`${a}-${b}`}
                style={[
                  styles.mockEdge,
                  {
                    width: len,
                    left: p1.x,
                    top: p1.y,
                    transform: [{ translateX: -len / 2 }, { rotate: `${angle}deg` }, { translateX: len / 2 }],
                  },
                ]}
              />
            );
          })}
        {size.w > 0 &&
          MOCK_NODES.map((n) => {
            const p = pos(n.id);
            return (
              <View
                key={n.id}
                style={[
                  styles.mockNode,
                  { left: p.x - NODE_W / 2, top: p.y - NODE_H / 2, width: NODE_W, height: NODE_H, borderColor: `${n.color}55` },
                ]}
              >
                <View style={[styles.mockNodeIcon, { backgroundColor: `${n.color}22` }]}>
                  <Ionicons name={n.icon} size={12} color={n.color} />
                </View>
                <Text style={styles.mockNodeLabel} numberOfLines={1}>
                  {n.label}
                </Text>
              </View>
            );
          })}
        <View style={[styles.mockCheck, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={11} color="#fff" />
          <Text style={styles.mockCheckText}>4 / 4</Text>
        </View>
      </View>
      {/* palette */}
      <View style={styles.mockPalette}>
        {['#06B6D4', '#F97316', '#65A30D', '#7C3AED', accent].map((c, i) => (
          <View key={i} style={[styles.mockPaletteChip, { backgroundColor: `${c}22`, borderColor: `${c}55` }]} />
        ))}
      </View>
    </View>
  );
}

/** One headline word. Scatters sideways, drops, blurs and fades as its page
 *  leaves centre; every word moves a little differently so the line breaks
 *  apart and reassembles rather than sliding as a block. */
function Word({
  text,
  order,
  index,
  scrollX,
}: {
  text: string;
  order: number;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const p = (scrollX.value - index * W) / W; // -1 .. 1 (0 = centred)
    const a = Math.min(1, Math.abs(p));
    const dir = p < 0 ? 1 : -1;
    const drift = 26 + (order % 4) * 14;
    return {
      opacity: interpolate(a, [0, 0.55, 1], [1, 0.25, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: p * drift * dir * -1 },
        { translateY: a * (8 + (order % 3) * 9) },
        { scale: interpolate(a, [0, 1], [1, 0.92], Extrapolation.CLAMP) },
      ],
    };
  });
  return <Animated.Text style={[styles.word, style]}>{text}</Animated.Text>;
}

function Dot({
  index,
  scrollX,
  accent,
}: {
  index: number;
  scrollX: SharedValue<number>;
  accent: string;
}) {
  const style = useAnimatedStyle(() => {
    const p = (scrollX.value - index * W) / W;
    const a = Math.min(1, Math.abs(p));
    return {
      width: interpolate(a, [0, 1], [24, 8], Extrapolation.CLAMP),
      opacity: interpolate(a, [0, 1], [1, 0.35], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(a, [0, 1], [accent, '#9CA3AF']),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  mockRoot: { flex: 1, backgroundColor: colors.background },
  mockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 34,
    paddingBottom: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mockBack: { width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: colors.ink, transform: [{ rotate: '45deg' }], marginRight: 4 },
  mockTitle: { height: 9, borderRadius: 4, backgroundColor: colors.ink, opacity: 0.85 },
  mockRun: { width: 22, height: 22, borderRadius: 11 },
  // Sized to the part of the phone that stays visible above the fade.
  mockCanvas: { height: MOCK_CANVAS_H, margin: 10, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  mockEdge: { position: 'absolute', height: 2, backgroundColor: colors.borderDark, borderRadius: 1 },
  mockNode: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  mockNodeIcon: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  mockNodeLabel: { fontSize: 9, fontWeight: '700', color: colors.ink, flex: 1 },
  mockCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  mockCheckText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  mockPalette: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 14 },
  mockPaletteChip: { flex: 1, height: 34, borderRadius: 10, borderWidth: 1 },
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },

  page: {
    width: W,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  headline: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing['2xl'],
  },
  headlineLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 8,
  },
  word: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: '#111827',
  },

  stage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: spacing.lg,
    minHeight: 180,
  },
  phoneClip: {
    width: PHONE_W + 40,
    height: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: 10,
  },
  phone: {
    width: PHONE_W,
    height: PHONE_H,
    borderRadius: PHONE_RADIUS,
    backgroundColor: '#0f1115',
    padding: BEZEL,
  },
  phoneFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_H,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: PHONE_RADIUS - BEZEL,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  phoneImage: { width: '100%', height: '100%' },
  island: {
    position: 'absolute',
    top: BEZEL + 10,
    alignSelf: 'center',
    width: PHONE_W * 0.3,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0f1115',
  },

  body: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    maxWidth: 340,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  dot: { height: 8, borderRadius: 4 },

  ctaWrap: { paddingHorizontal: spacing.xl, alignItems: 'center', gap: spacing.sm },
  cta: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B1020',
    paddingVertical: 16,
    borderRadius: borderRadius.full,
    shadowColor: '#0B1020',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  ctaText: { ...typography.labelLarge, fontSize: 17, color: '#FFFFFF' },
});

