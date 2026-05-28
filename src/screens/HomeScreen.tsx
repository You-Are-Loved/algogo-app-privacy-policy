import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Share,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';

import { colors, spacing, borderRadius, typography, categoryColors } from '../theme';
import { getCategoriesByType, contentTypeInfo, ContentType } from '../data/allCategories';
import { useStore } from '../store/useStore';
import { TabStackParamList } from '../navigation';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import UpgradeModal from '../components/UpgradeModal';
import RatingPromptModal from '../components/RatingPromptModal';
import { Category } from '../types';

const { width, height } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

type NavigationProp = NativeStackNavigationProp<TabStackParamList>;
type HomeRouteProp = RouteProp<TabStackParamList, 'Home'>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressModalProps {
  visible: boolean;
  onClose: () => void;
  progress: number;
  categories: typeof import('../data/categories').categories;
  getCategoryProgress: (id: string) => any;
}

function ProgressModal({ visible, onClose, progress, categories, getCategoryProgress }: ProgressModalProps) {
  const animatedProgress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      animatedProgress.value = withTiming(progress, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      animatedProgress.value = 0;
      scale.value = 0.8;
      opacity.value = 0;
    }
  }, [visible, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const circleSize = 200;
  const strokeWidth = 16;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const completedCategories = categories.filter(cat => {
    const catProgress = getCategoryProgress(cat.id);

    const viewedSections = catProgress.viewedLearnSectionIds?.length || 0;
    const totalSections = cat.learnContent.length;
    const learnProgress = totalSections > 0 ? (viewedSections / totalSections) * 100 : 0;

    const reviewedCount = catProgress.reviewedCardIds?.length || 0;
    const totalCards = cat.flashcards.length;
    const cardsProgress = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0;

    const quizProgress = catProgress.quizHighScore || 0;

    const progressPercent = Math.round((learnProgress + cardsProgress + quizProgress) / 3);
    return progressPercent === 100;
  }).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <BlurView intensity={24} tint="light" style={styles.progressModalOverlay}>
        <TouchableOpacity style={styles.progressModalOverlay} activeOpacity={1} onPress={onClose}>
          <Animated.View style={[styles.progressModalContent, containerStyle]}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.progressModalInner}>
                <Text style={styles.progressModalTitle}>Your Progress</Text>

                <View style={styles.circleContainer}>
                  <Svg width={circleSize} height={circleSize}>
                    {/* Background circle */}
                    <Circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke={colors.border}
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    {/* Progress circle */}
                    <AnimatedCircle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      stroke={colors.primary}
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress / 100)}
                      rotation="-90"
                      origin={`${circleSize / 2}, ${circleSize / 2}`}
                    />
                  </Svg>
                  <View style={styles.circleTextContainer}>
                    <Text style={styles.circlePercentage}>{progress}%</Text>
                    <Text style={styles.circleLabel}>Complete</Text>
                  </View>
                </View>

                <View style={styles.progressStats}>
                  <View style={styles.progressStatItem}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    <Text style={styles.progressStatValue}>{completedCategories}</Text>
                    <Text style={styles.progressStatLabel}>Mastered</Text>
                  </View>
                  <View style={styles.progressStatDivider} />
                  <View style={styles.progressStatItem}>
                    <Ionicons name="layers" size={24} color={colors.secondary} />
                    <Text style={styles.progressStatValue}>{categories.length}</Text>
                    <Text style={styles.progressStatLabel}>Total Topics</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.progressCloseButton} onPress={onClose}>
                  <Text style={styles.progressCloseText}>Got it</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Layers': 'layers-outline',
  'GitCompare': 'git-compare-outline',
  'Rabbit': 'flash-outline',
  'GitMerge': 'git-merge-outline',
  'RefreshCw': 'refresh-outline',
  'Undo2': 'arrow-undo-outline',
  'Network': 'git-network-outline',
  'TreeDeciduous': 'leaf-outline',
  'Triangle': 'triangle-outline',
  'Boxes': 'cube-outline',
  'Search': 'search-outline',
  'Trophy': 'trophy-outline',
  'Combine': 'git-pull-request-outline',
  'GitGraph': 'git-branch-outline',
  'Server': 'server-outline',
  'Globe': 'globe-outline',
  'Smartphone': 'phone-portrait-outline',
  'TabletSmartphone': 'tablet-portrait-outline',
  'Code-slash': 'code-slash-outline',
  'GitBranch': 'git-branch-outline',
  'Archive': 'archive-outline',
  'BarChart': 'bar-chart-outline',
  // System Design icons
  'Database': 'server-outline',
  'Zap': 'flash-outline',
  'Mail': 'mail-outline',
  'Briefcase': 'briefcase-outline',
  // Direct Ionicons mappings for new categories
  'logo-apple': 'phone-portrait-outline',
  'logo-android': 'tablet-portrait-outline',
  'layers-outline': 'layers-outline',
  'color-wand-outline': 'color-wand-outline',
  'git-branch-outline': 'git-branch-outline',
  'construct-outline': 'construct-outline',
  'cloud-download-outline': 'cloud-download-outline',
  'refresh-outline': 'refresh-outline',
  'code-slash-outline': 'code-slash-outline',
  'speedometer-outline': 'speedometer-outline',
  'server-outline': 'server-outline',
  'hardware-chip-outline': 'hardware-chip-outline',
  'flash-outline': 'flash-outline',
  'swap-horizontal-outline': 'swap-horizontal-outline',
  'chatbubbles-outline': 'chatbubbles-outline',
  'shield-checkmark-outline': 'shield-checkmark-outline',
  // Web Development icons
  'globe-outline': 'globe-outline',
  'logo-javascript': 'code-outline',
  'logo-react': 'infinite-outline',
  'code-outline': 'code-outline',
  'infinite-outline': 'infinite-outline',
  // iOS icons
  'phone-portrait-outline': 'phone-portrait-outline',
  'git-network-outline': 'git-network-outline',
  // Backend Development icons
  'cloud-outline': 'cloud-outline',
  'key-outline': 'key-outline',
  'apps-outline': 'apps-outline',
  'mail-outline': 'mail-outline',
};

const TRACKS: ContentType[] = ['algorithms', 'system-design', 'ios', 'android', 'web', 'backend', 'sql'];

const TRACK_PILL_LABEL: Record<ContentType, string> = {
  'algorithms': 'Algorithms',
  'system-design': 'System',
  'ios': 'iOS',
  'android': 'Android',
  'web': 'Web',
  'backend': 'Backend',
  'sql': 'SQL',
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HomeRouteProp>();
  const { user, initGuestUser, getCategoryProgress } = useStore();
  const { isSubscribed, purchase, restore, isLoading: subLoading } = useSubscriptionContext();

  // Tiny "dance" on the streak flame when tapped — wiggle + a small lift.
  const flameWiggle = useSharedValue(0);
  const flameDanceStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${flameWiggle.value}deg` },
      { scale: 1 + Math.abs(flameWiggle.value) / 90 },
    ],
  }));
  const danceFlame = useCallback(() => {
    flameWiggle.value = withSequence(
      withTiming(-14, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(14, { duration: 110, easing: Easing.inOut(Easing.quad) }),
      withTiming(-9, { duration: 90, easing: Easing.inOut(Easing.quad) }),
      withTiming(6, { duration: 90, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 110, easing: Easing.out(Easing.quad) }),
    );
  }, [flameWiggle]);

  const handleEmailCEO = useCallback(async () => {
    const url = 'mailto:ceo@raidea.dev?subject=Algogo%20feedback';
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) throw new Error('No mail client');
      await Linking.openURL(url);
    } catch {
      Alert.alert('Mail not available', 'Send feedback to ceo@raidea.dev');
    }
  }, []);
  const [activeTrack, setActiveTrack] = useState<ContentType>(
    route.params?.contentType || 'algorithms'
  );
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [ratingPromptVisible, setRatingPromptVisible] = useState(false);

  // Track if initial animation has played to prevent re-animation on tab switch
  const hasAnimated = useRef(false);
  useEffect(() => {
    hasAnimated.current = true;
  }, []);

  // Show the rating prompt once, after the user has been subscribed for 3+
  // days and we haven't already asked.
  useEffect(() => {
    if (!isSubscribed) return;
    let cancelled = false;
    (async () => {
      try {
        const asked = await AsyncStorage.getItem('@algogo_rating_asked');
        if (asked === 'true') return;
        const startStr = await AsyncStorage.getItem('@algogo_subscription_start');
        if (!startStr) return;
        const startedAt = parseInt(startStr, 10);
        if (!Number.isFinite(startedAt)) return;
        const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
        if (Date.now() - startedAt < THREE_DAYS) return;
        if (cancelled) return;
        // Defer slightly so it doesn't fight with the page-enter animations.
        setTimeout(() => {
          if (!cancelled) setRatingPromptVisible(true);
        }, 800);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [isSubscribed]);

  const handleShareApp = useCallback(async () => {
    try {
      await Share.share({
        message:
          "I've been using Algogo to brush up on coding interview patterns — give it a try: https://apps.apple.com/app/id6756475892",
        url: 'https://apps.apple.com/app/id6756475892',
      });
    } catch {}
  }, []);

  const handleRatingClose = useCallback(() => {
    setRatingPromptVisible(false);
    AsyncStorage.setItem('@algogo_rating_asked', 'true').catch(() => {});
  }, []);

  // Get categories for the actively selected track
  const categories = getCategoriesByType(activeTrack);
  const typeInfo = contentTypeInfo[activeTrack];

  useEffect(() => {
    if (!user) {
      initGuestUser();
    }
  }, []);

  const handleCategoryPress = (category: Category) => {
    if (category.premium && !isSubscribed) {
      setSelectedCategory(category);
      setUpgradeModalVisible(true);
    } else {
      navigation.navigate('Category', { slug: category.slug });
    }
  };

  const totalProgress = categories.reduce((sum, cat) => {
    const progress = getCategoryProgress(cat.id);

    // Learn progress (viewed sections)
    const viewedSections = progress.viewedLearnSectionIds?.length || 0;
    const totalSections = cat.learnContent.length;
    const learnProgress = totalSections > 0 ? (viewedSections / totalSections) * 100 : 0;

    // Cards progress (reviewed cards)
    const reviewedCount = progress.reviewedCardIds?.length || 0;
    const totalCards = cat.flashcards.length;
    const cardsProgress = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0;

    // Quiz progress (high score)
    const quizProgress = progress.quizHighScore || 0;

    // Overall category progress: equal weight for all three
    const catProgress = (learnProgress + cardsProgress + quizProgress) / 3;
    return sum + catProgress;
  }, 0);
  const overallProgress = Math.round(totalProgress / categories.length);

  const renderCategoryCard = (category: typeof categories[0], index: number) => {
    const catColors = categoryColors[category.id] || { color: colors.primary, dark: colors.primaryDark };
    const progress = getCategoryProgress(category.id);

    // Calculate consistent progress across all three areas
    const viewedSections = progress.viewedLearnSectionIds?.length || 0;
    const totalSections = category.learnContent.length;
    const learnProgress = totalSections > 0 ? (viewedSections / totalSections) * 100 : 0;

    const reviewedCount = progress.reviewedCardIds?.length || 0;
    const totalCards = category.flashcards.length;
    const cardsProgress = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 0;

    const quizProgress = progress.quizHighScore || 0;

    const progressPercent = Math.round((learnProgress + cardsProgress + quizProgress) / 3);
    const isLocked = category.premium && !isSubscribed;

    return (
      <Animated.View
        key={category.id}
        entering={hasAnimated.current ? undefined : FadeInRight.delay(index * 50).springify()}
      >
        <TouchableOpacity
          style={[
            styles.categoryCard,
            progressPercent === 100 && !isLocked && { borderColor: catColors.color, borderWidth: 3 },
            isLocked && styles.categoryCardLocked,
          ]}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.8}
        >
          {isLocked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.white} />
            </View>
          )}
          <View style={[styles.categoryIcon, { backgroundColor: `${catColors.color}20` }]}>
            <Ionicons
              name={iconMap[category.icon] || 'help-outline'}
              size={24}
              color={isLocked ? colors.inkLighter : catColors.color}
            />
          </View>
          <Text style={[styles.categoryName, isLocked && styles.categoryNameLocked]} numberOfLines={2} ellipsizeMode="tail">
            {category.name}
          </Text>
          <Text style={styles.categoryCards}>{category.flashcards.length} cards</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: isLocked ? colors.inkLighter : catColors.color },
              ]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={hasAnimated.current ? undefined : FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.userName}>Welcome back!</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.streakBadge}
              onPress={danceFlame}
              activeOpacity={0.85}
              accessibilityLabel="Streak counter"
            >
              <Animated.View style={flameDanceStyle}>
                <Ionicons name="flame" size={20} color={colors.accent} />
              </Animated.View>
              <Text style={styles.streakText}>{user?.streak || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paperIconBtn}
              onPress={handleEmailCEO}
              activeOpacity={0.8}
              hitSlop={6}
              accessibilityLabel="Email the team"
            >
              <Ionicons name="mail-outline" size={20} color={colors.inkLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paperIconBtn}
              onPress={handleShareApp}
              activeOpacity={0.8}
              hitSlop={6}
              accessibilityLabel="Share Algogo"
            >
              <Ionicons name="share-outline" size={20} color={colors.inkLight} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Track switcher pill */}
        <Animated.View entering={hasAnimated.current ? undefined : FadeInDown.delay(200)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trackPillRow}
          >
            {TRACKS.map((track) => {
              const info = contentTypeInfo[track];
              const active = track === activeTrack;
              return (
                <TouchableOpacity
                  key={track}
                  onPress={() => setActiveTrack(track)}
                  activeOpacity={0.8}
                  style={[
                    styles.trackPill,
                    active && { backgroundColor: info.color, borderColor: info.color },
                  ]}
                >
                  <Ionicons
                    name={info.icon as any}
                    size={16}
                    color={active ? colors.white : info.color}
                  />
                  <Text
                    style={[
                      styles.trackPillText,
                      active && { color: colors.white },
                    ]}
                  >
                    {TRACK_PILL_LABEL[track]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Categories Section */}
        <Animated.View
          key={activeTrack}
          entering={FadeInDown.duration(280)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: typeInfo.color }]}>
              <Ionicons name={typeInfo.icon as any} size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>{typeInfo.title}</Text>
              <Text style={styles.sectionSubtitle}>{typeInfo.subtitle}</Text>
            </View>
          </View>
          <View style={styles.categoryGrid}>
            {categories.map((cat, index) => renderCategoryCard(cat, index))}
          </View>
        </Animated.View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={() => {
          setUpgradeModalVisible(false);
          setSelectedCategory(null);
        }}
        categoryName={selectedCategory?.name}
      />

      {/* Progress Modal */}
      <ProgressModal
        visible={progressModalVisible}
        onClose={() => setProgressModalVisible(false)}
        progress={overallProgress}
        categories={categories}
        getCategoryProgress={getCategoryProgress}
      />

      {/* Rating prompt — fires once, ~3 days after first subscription */}
      <RatingPromptModal
        visible={ratingPromptVisible}
        onClose={handleRatingClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    ...typography.displaySmall,
    color: colors.ink,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: `${colors.accent}30`,
    gap: spacing.xs,
  },
  paperIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  progressCardText: {
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.headlineLarge,
    color: colors.ink,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.inkLight,
  },
  trackPillRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  trackPillText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.headlineMedium,
    color: colors.ink,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: cardWidth,
    height: 160,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
  },
  categoryCardLocked: {
    opacity: 0.85,
  },
  lockBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.inkLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  categoryNameLocked: {
    color: colors.inkLight,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    ...typography.labelLarge,
    color: colors.ink,
    marginBottom: spacing.xs,
    height: 40,
  },
  categoryCards: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  promoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    ...typography.headlineMedium,
    color: colors.white,
  },
  promoSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  promoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promoButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  promoButtonText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  restoreButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreButtonText: {
    ...typography.labelMedium,
    color: 'rgba(255,255,255,0.8)',
  },
  // Progress Modal styles
  progressModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 60, 0.18)',
  },
  progressModalContent: {
    width: width - spacing.xl * 2,
    maxWidth: 340,
  },
  progressModalInner: {
    backgroundColor: colors.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  progressModalTitle: {
    ...typography.displaySmall,
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  circleTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePercentage: {
    ...typography.displayLarge,
    color: colors.ink,
  },
  circleLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  progressStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressStatDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
  },
  progressStatValue: {
    ...typography.headlineMedium,
    color: colors.ink,
  },
  progressStatLabel: {
    ...typography.labelSmall,
    color: colors.inkLight,
  },
  progressCloseButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  progressCloseText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  // Streak Modal styles
  streakFlameContainer: {
    marginBottom: spacing.md,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.accent,
    lineHeight: 72,
  },
  streakDaysLabel: {
    ...typography.headlineMedium,
    color: colors.inkLight,
    marginBottom: spacing.lg,
  },
  streakMessage: {
    ...typography.bodyMedium,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  streakStatusContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  streakStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  streakStatusText: {
    ...typography.labelMedium,
  },
});
