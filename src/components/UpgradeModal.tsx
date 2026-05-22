import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import {
  Plan,
  computeAnnualDiscount,
  formatIntroDuration,
} from '../hooks/useSubscription';
import PlanSelector from './PlanSelector';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://you-are-loved.github.io/algogo-app-privacy-policy/privacy-policy.html';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  categoryName?: string;
  /** Show "Continue with preview" — true when used as the onboarding finale. */
  showSkip?: boolean;
}

export default function UpgradeModal({
  visible,
  onClose,
  categoryName,
  showSkip = false,
}: UpgradeModalProps) {
  const { purchase, restore, products, isLoading } = useSubscriptionContext();
  const [plan, setPlan] = useState<Plan>('monthly');

  // Reset to the default plan whenever the modal is reopened.
  useEffect(() => {
    if (visible) setPlan('monthly');
  }, [visible]);

  const handlePurchase = async () => {
    const result = await purchase(plan);
    if (result.success) {
      onClose();
    }
  };

  const handleRestore = async () => {
    const result = await restore();
    if (result.success && result.isSubscribed) {
      onClose();
    }
  };

  const discount = computeAnnualDiscount(
    products.monthly?.amount,
    products.annual?.amount,
  );
  const isAnnual = plan === 'annual';
  const activeProduct = isAnnual ? products.annual : products.monthly;
  const activePrice = activeProduct?.display ?? (isAnnual ? '$24.99' : '$2.99');
  const period = isAnnual ? 'year' : 'month';
  const trial =
    activeProduct?.introOffer?.mode === 'free-trial' ? activeProduct.introOffer : null;

  const ctaLabel = trial
    ? `Start ${formatIntroDuration(trial)} free trial`
    : isAnnual && discount
      ? `Continue — Save ${discount}%`
      : 'Continue';

  const termsLine = trial
    ? `${formatIntroDuration(trial)} free, then ${activePrice}/${period} · auto-renews, cancel anytime in Settings.`
    : isAnnual && discount
      ? `${activePrice}/${period} · ${discount}% off vs monthly · auto-renews, cancel anytime in Settings.`
      : `${activePrice}/${period} · auto-renews, cancel anytime in Settings.`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Hero */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo-final.png')}
              style={styles.iconContainer}
              resizeMode="cover"
            />
            <Text style={styles.title}>Unlock Algogo Pro</Text>
            {categoryName ? (
              <Text style={styles.subtitle}>
                "{categoryName}" is a Pro topic
              </Text>
            ) : (
              <Text style={styles.subtitle}>
                Every track, every problem, fully offline
              </Text>
            )}
          </View>

          {/* Plan picker */}
          <PlanSelector
            monthly={products.monthly}
            annual={products.annual}
            selected={plan}
            onSelect={setPlan}
          />
        </ScrollView>

        {/* Footer with CTAs */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.purchaseButton, isLoading && { opacity: 0.6 }]}
            onPress={handlePurchase}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={colors.white} />
                <Animated.Text
                  key={ctaLabel}
                  entering={FadeIn.duration(180)}
                  style={styles.purchaseButtonText}
                >
                  {ctaLabel}
                </Animated.Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.skipText}>
              {showSkip ? 'Preview the app' : 'Cancel'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>{termsLine}</Text>

          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={handleRestore} disabled={isLoading}>
              <Text style={styles.legalLink}>Restore</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={styles.legalLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.legalLink}>Privacy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  title: {
    ...typography.displaySmall,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 20,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  purchaseButtonText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 17,
  },
  skipText: {
    ...typography.labelLarge,
    color: colors.inkLight,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    fontSize: 14,
  },
  terms: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  legalLink: {
    ...typography.labelMedium,
    color: colors.inkLight,
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  legalDivider: {
    ...typography.labelMedium,
    color: colors.inkLighter,
    fontSize: 12,
  },
});
