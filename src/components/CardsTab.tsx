import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '../theme';
import { Category } from '../types';
import { useStore } from '../store/useStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;
const CARD_HEIGHT = 350;

interface CardsTabProps {
  category: Category;
  catColors: { color: string; dark: string };
}

export default function CardsTab({ category, catColors }: CardsTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { reviewCard, getCategoryProgress } = useStore();

  const flipProgress = useSharedValue(0);
  const currentCard = category.flashcards[currentIndex];
  const progress = getCategoryProgress(category.id);
  const reviewedCardIds = progress.reviewedCardIds || [];

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    flipProgress.value = withTiming(newFlipped ? 1 : 0, { duration: 500 });

    if (newFlipped) {
      reviewCard(category.id, currentCard.id);
    }
  };

  const handleNext = () => {
    if (currentIndex < category.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      flipProgress.value = 0;
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      flipProgress.value = 0;
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    flipProgress.value = 0;
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const progressPercent = ((currentIndex + 1) / category.flashcards.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Card {currentIndex + 1} of {category.flashcards.length}
          </Text>
          <Text style={styles.reviewedText}>{reviewedCardIds.length} reviewed</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: catColors.color }]} />
        </View>
      </View>

      {/* Flashcard */}
      <TouchableOpacity activeOpacity={0.95} onPress={handleFlip} style={styles.cardContainer}>
        {/* Front */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <View style={[styles.cardBadge, { backgroundColor: catColors.color }]}>
            <Text style={styles.cardBadgeText}>Question</Text>
          </View>
          <Text style={styles.cardTitle}>{currentCard.front}</Text>
          {currentCard.hint && (
            <Text style={styles.cardHint}>Hint: {currentCard.hint}</Text>
          )}
          <View style={styles.cardFooter}>
            <Ionicons name="eye-outline" size={18} color={colors.inkLight} />
            <Text style={styles.cardFooterText}>Tap to reveal</Text>
          </View>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            { backgroundColor: catColors.color },
          ]}
        >
          <View style={[styles.cardBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.cardBadgeText}>Answer</Text>
          </View>
          <Text style={styles.cardBackText}>{currentCard.back}</Text>
          <View style={styles.cardFooter}>
            <Ionicons name="eye-off-outline" size={18} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.cardFooterText, { color: 'rgba(255,255,255,0.7)' }]}>
              Tap to hide
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navArrow, currentIndex === 0 && styles.navArrowDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={28} color={currentIndex === 0 ? colors.inkLighter : colors.ink} />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <TouchableOpacity style={styles.flipButton} onPress={handleFlip}>
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.flipButtonText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="reload" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.navArrow,
            { backgroundColor: catColors.color },
            currentIndex === category.flashcards.length - 1 && styles.navArrowDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === category.flashcards.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={28}
            color={currentIndex === category.flashcards.length - 1 ? colors.inkLighter : colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Card Dots */}
      <View style={styles.dots}>
        {category.flashcards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.dot,
              index === currentIndex && { backgroundColor: catColors.color, width: 24 },
              reviewedCardIds.includes(card.id) && index !== currentIndex && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              setCurrentIndex(index);
              setIsFlipped(false);
              flipProgress.value = 0;
            }}
          />
        ))}
      </View>

      {/* Completion Message */}
      {currentIndex === category.flashcards.length - 1 &&
        reviewedCardIds.length === category.flashcards.length && (
          <View style={styles.completionCard}>
            <Ionicons name="sparkles" size={32} color={colors.primary} />
            <Text style={styles.completionTitle}>Great job!</Text>
            <Text style={styles.completionText}>
              You've reviewed all {category.flashcards.length} cards!
            </Text>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  reviewedText: {
    ...typography.labelSmall,
    color: colors.inkLight,
  },
  progressBar: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: spacing.lg,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFront: {
    backgroundColor: colors.card,
  },
  cardBack: {
    borderColor: 'transparent',
  },
  cardBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  cardBadgeText: {
    ...typography.labelSmall,
    color: colors.white,
  },
  cardTitle: {
    ...typography.headlineLarge,
    color: colors.ink,
    textAlign: 'center',
    width: '100%',
  },
  cardHint: {
    ...typography.bodySmall,
    color: colors.inkLight,
    fontStyle: 'italic',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  cardBackText: {
    ...typography.bodyLarge,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 26,
    width: '100%',
  },
  cardFooter: {
    position: 'absolute',
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardFooterText: {
    ...typography.labelSmall,
    color: colors.inkLight,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navArrow: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0.5,
  },
  navCenter: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  flipButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  completionCard: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
    padding: spacing.xl,
    alignItems: 'center',
  },
  completionTitle: {
    ...typography.headlineMedium,
    color: colors.primary,
    marginTop: spacing.md,
  },
  completionText: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    marginTop: spacing.xs,
  },
});
