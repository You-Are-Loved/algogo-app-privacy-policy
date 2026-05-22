import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '../theme';
import {
  Plan,
  ProductInfo,
  computeAnnualDiscount,
  formatMonthlyEquivalent,
} from '../hooks/useSubscription';

const ANIM_DURATION = 240;
const ANIM_EASING = Easing.bezier(0.22, 1, 0.36, 1); // Smooth out-quint feel.

interface PlanSelectorProps {
  monthly: ProductInfo | null;
  annual: ProductInfo | null;
  selected: Plan;
  onSelect: (plan: Plan) => void;
  fallbackMonthly?: string;
  fallbackAnnual?: string;
}

export default function PlanSelector({
  monthly,
  annual,
  selected,
  onSelect,
  fallbackMonthly = '$2.99',
  fallbackAnnual = '$24.99',
}: PlanSelectorProps) {
  const discount = computeAnnualDiscount(monthly?.amount, annual?.amount);
  const monthlyEquivalent = formatMonthlyEquivalent(annual);
  const annualBadge = discount !== null ? `SAVE ${discount}%` : 'BEST VALUE';

  return (
    <View style={styles.container}>
      <PlanCard
        active={selected === 'monthly'}
        onPress={() => onSelect('monthly')}
        accent={colors.secondary}
        title="Monthly"
        price={monthly?.display ?? fallbackMonthly}
        priceSuffix="/ month"
        sub="Billed monthly · cancel anytime"
      />
      <PlanCard
        active={selected === 'annual'}
        onPress={() => onSelect('annual')}
        accent={colors.primary}
        badge={annualBadge}
        title="Annual"
        price={annual?.display ?? fallbackAnnual}
        priceSuffix="/ year"
        sub={
          monthlyEquivalent
            ? `${monthlyEquivalent}/mo · billed yearly`
            : 'Billed yearly'
        }
      />
    </View>
  );
}

function PlanCard({
  active,
  onPress,
  accent,
  badge,
  title,
  price,
  priceSuffix,
  sub,
}: {
  active: boolean;
  onPress: () => void;
  accent: string;
  badge?: string;
  title: string;
  price: string;
  priceSuffix: string;
  sub: string;
}) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: ANIM_DURATION,
      easing: ANIM_EASING,
    });
  }, [active, progress]);

  // Card shell — border + soft accent fill + a tiny lift on activation.
  const cardAnim = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, accent],
    ),
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.card, `${accent}14`],
    ),
    transform: [{ scale: 0.985 + progress.value * 0.015 }],
  }));

  const radioOuterAnim = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.borderDark, accent],
    ),
  }));

  const radioInnerAnim = useAnimatedStyle(() => ({
    backgroundColor: accent,
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  const priceAnim = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.ink, accent]),
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.card, cardAnim]}>
        <View style={styles.radio}>
          <Animated.View style={[styles.radioOuter, radioOuterAnim]}>
            <Animated.View style={[styles.radioInner, radioInnerAnim]} />
          </Animated.View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.priceRow}>
            <Animated.Text style={[styles.price, priceAnim]}>{price}</Animated.Text>
            <Text style={styles.priceSuffix}>{priceSuffix}</Text>
          </View>
          <Text style={styles.sub}>{sub}</Text>
        </View>

        {badge ? (
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Ionicons name="sparkles" size={13} color={colors.white} />
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  radio: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.labelLarge,
    color: colors.ink,
    fontSize: 15,
    marginBottom: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.white,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  price: {
    ...typography.headlineMedium,
    fontSize: 20,
  },
  priceSuffix: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  sub: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginTop: 2,
  },
});
