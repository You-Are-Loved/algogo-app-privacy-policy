import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
import { categories } from '../data/categories';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../navigation';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import UpgradeModal from '../components/UpgradeModal';
import { Category } from '../types';

const { width, height } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={30} style={styles.progressModalOverlay}>
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

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
  streak: number;
  lastStudyDate: string | null;
}

function StreakModal({ visible, onClose, streak, lastStudyDate }: StreakModalProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const flameScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      // Pulsing flame animation
      flameScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 }),
        withTiming(1.15, { duration: 250 }),
        withTiming(1, { duration: 250 })
      );
    } else {
      scale.value = 0.8;
      opacity.value = 0;
      flameScale.value = 1;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const getStreakMessage = () => {
    if (streak === 0) return "Start learning to build your streak!";
    if (streak === 1) return "Great start! Keep it going tomorrow!";
    if (streak < 7) return "You're building momentum!";
    if (streak < 30) return "Impressive dedication!";
    if (streak < 100) return "You're on fire!";
    return "Legendary learner!";
  };

  const today = new Date().toDateString();
  const lastStudy = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
  const studiedToday = lastStudy === today;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={30} style={styles.progressModalOverlay}>
        <TouchableOpacity style={styles.progressModalOverlay} activeOpacity={1} onPress={onClose}>
          <Animated.View style={[styles.progressModalContent, containerStyle]}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.progressModalInner}>
                <Text style={styles.progressModalTitle}>Your Streak</Text>

                <Animated.View style={[styles.streakFlameContainer, flameStyle]}>
                  <Ionicons name="flame" size={80} color={colors.accent} />
                </Animated.View>

                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.streakDaysLabel}>
                  {streak === 1 ? 'day' : 'days'} in a row
                </Text>

                <Text style={styles.streakMessage}>{getStreakMessage()}</Text>

                <View style={styles.streakStatusContainer}>
                  <View style={[
                    styles.streakStatusBadge,
                    { backgroundColor: studiedToday ? `${colors.primary}15` : `${colors.accent}15` }
                  ]}>
                    <Ionicons
                      name={studiedToday ? 'checkmark-circle' : 'time-outline'}
                      size={20}
                      color={studiedToday ? colors.primary : colors.accent}
                    />
                    <Text style={[
                      styles.streakStatusText,
                      { color: studiedToday ? colors.primary : colors.accent }
                    ]}>
                      {studiedToday ? "You've studied today!" : "Study today to keep your streak!"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.progressCloseButton} onPress={onClose}>
                  <Text style={styles.progressCloseText}>Keep Going</Text>
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
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, initGuestUser, getCategoryProgress } = useStore();
  const { isSubscribed, purchase, restore, product, isLoading: subLoading } = useSubscriptionContext();
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);

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

  const algorithmPatterns = categories.slice(0, 19);
  const otherCategories = categories.slice(19);

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
        entering={FadeInRight.delay(index * 50).springify()}
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
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.userName}>Welcome back!</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.streakBadge}
              onPress={() => setStreakModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="flame" size={20} color={colors.accent} />
              <Text style={styles.streakText}>{user?.streak || 0}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Progress Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.progressCard}
            onPress={() => setProgressModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="trending-up" size={24} color={colors.primary} />
            </View>
            <View style={styles.progressCardText}>
              <Text style={styles.statValue}>{overallProgress}%</Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.inkLight} />
          </TouchableOpacity>
        </Animated.View>

        {/* Unlock Premium Card */}
        {!isSubscribed && (
          <Animated.View entering={FadeInDown.delay(250)} style={styles.promoCard}>
            <View style={styles.promoContent}>
              <View style={styles.promoIcon}>
                <Ionicons name="lock-open" size={24} color={colors.white} />
              </View>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>Unlock All Content</Text>
                <Text style={styles.promoSubtitle}>
                  {product?.price || '$0.99'}/month • All topics included
                </Text>
              </View>
            </View>
            <View style={styles.promoButtons}>
              <TouchableOpacity
                style={styles.promoButton}
                onPress={() => setUpgradeModalVisible(true)}
                disabled={subLoading}
              >
                <Text style={styles.promoButtonText}>
                  {subLoading ? 'Loading...' : 'Upgrade'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={restore}
                disabled={subLoading}
              >
                <Text style={styles.restoreButtonText}>Restore</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Algorithm Patterns Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="code-slash" size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Algorithm Patterns</Text>
              <Text style={styles.sectionSubtitle}>Master 19 essential patterns</Text>
            </View>
          </View>
          <View style={styles.categoryGrid}>
            {algorithmPatterns.map((cat, index) => renderCategoryCard(cat, index))}
          </View>
        </Animated.View>

        {/* Interview Topics Section */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.accent }]}>
              <Ionicons name="briefcase" size={20} color={colors.white} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Interview Topics</Text>
              <Text style={styles.sectionSubtitle}>System design & platform prep</Text>
            </View>
          </View>
          <View style={styles.categoryGrid}>
            {otherCategories.map((cat, index) => renderCategoryCard(cat, index + 14))}
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

      {/* Streak Modal */}
      <StreakModal
        visible={streakModalVisible}
        onClose={() => setStreakModalVisible(false)}
        streak={user?.streak || 0}
        lastStudyDate={user?.lastStudyDate || null}
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
  headerRight: {},
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  progressModalContent: {
    width: width - spacing.xl * 2,
    maxWidth: 340,
  },
  progressModalInner: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
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
