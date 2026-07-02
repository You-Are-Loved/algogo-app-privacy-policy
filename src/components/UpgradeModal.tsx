import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { formatIntroDuration, formatIntroPeriod } from '../hooks/useSubscription';
import { getPaywallFeatures, PaywallFeature } from '../data/stats';
import AlgogoLogo from './AlgogoLogo';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://you-are-loved.github.io/algogo-app-privacy-policy/privacy-policy.html';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  categoryName?: string;
  /** Show "Continue with free version" — true when used as the onboarding finale. */
  showSkip?: boolean;
}

export default function UpgradeModal({
  visible,
  onClose,
  categoryName,
  showSkip = false,
}: UpgradeModalProps) {
  const { purchase, restore, products, isLoading } = useSubscriptionContext();
  const [purchasing, setPurchasing] = useState(false);
  const insets = useSafeAreaInsets();
  // iPhone Pro Dynamic Island extends below the standard safe-area top inset
  // a touch, so we pad an extra ~16pt on top of insets.top for clearance.
  const heroTopPadding = insets.top + spacing.lg;

  // Monthly-only paywall — the annual SKU still exists in expo-iap for
  // grandfathered subscribers + Restore, just not exposed in the UI.
  const product = products.monthly;
  const priceLabel = product?.display ?? '$2.99';
  // Any configured intro offer — App Store Connect surfaces these as
  // free-trial, pay-up-front (one charge covering the intro period), or
  // pay-as-you-go (a reduced per-period charge). We promote all three.
  const offer = product?.introOffer ?? null;
  const isFreeTrial = offer?.mode === 'free-trial';
  const trialDuration = isFreeTrial ? formatIntroDuration(offer) : null;
  const offerPeriod = offer ? formatIntroPeriod(offer) : null;

  const features = React.useMemo(() => getPaywallFeatures(), []);

  const handlePurchase = async () => {
    setPurchasing(true);
    const result = await purchase('monthly');
    setPurchasing(false);
    if (result.success) onClose();
  };

  const handleRestore = async () => {
    const result = await restore();
    if (result.success && result.isSubscribed) onClose();
  };

  const ctaLabel = !offer
    ? `Subscribe · ${priceLabel}/mo`
    : isFreeTrial
      ? `Start ${trialDuration} free trial`
      : offer.mode === 'pay-as-you-go'
        ? `Subscribe · ${offer.display}/mo first ${offerPeriod}`
        : `Subscribe · ${offer.display} first ${offerPeriod}`;

  const subtitleLine = !offer
    ? `${priceLabel}/month. Cancel anytime.`
    : isFreeTrial
      ? `${trialDuration === '7-day' ? '7 days' : trialDuration} free, then ${priceLabel}/month. Cancel anytime.`
      : offer.mode === 'pay-as-you-go'
        ? `${offer.display}/month for your first ${offerPeriod}, then ${priceLabel}/month. Cancel anytime.`
        : `${offer.display} for your first ${offerPeriod}, then ${priceLabel}/month. Cancel anytime.`;

  const busy = isLoading || purchasing;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: heroTopPadding }]}
          bounces={false}
        >
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.heroIconWrap}
          >
            <View style={styles.heroIcon}>
              <AlgogoLogo size={62} />
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.title}
          >
            {isFreeTrial ? 'Try Algogo Pro free' : 'Unlock Algogo Pro'}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.subtitle}
          >
            {categoryName ? `"${categoryName}" is a Pro topic · ${subtitleLine}` : subtitleLine}
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.paywallFeatures}
          >
            {features.map((f, i) => (
              <PaywallFeatureRow key={i} icon={f.icon} text={f.text} />
            ))}
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={styles.bottomBar}
        >
          <TouchableOpacity
            style={[styles.primaryCta, busy && { opacity: 0.6 }]}
            onPress={handlePurchase}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={colors.white} />
                <Animated.Text
                  key={ctaLabel}
                  entering={FadeIn.duration(180)}
                  style={styles.primaryCtaText}
                >
                  {ctaLabel}
                </Animated.Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.secondaryCtaText}>
              {showSkip ? 'Continue with free version' : 'Not now'}
            </Text>
          </TouchableOpacity>

          <View style={styles.legalRow}>
            <TouchableOpacity onPress={handleRestore} disabled={busy}>
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
      </SafeAreaView>
    </Modal>
  );
}

function PaywallFeatureRow({
  icon,
  text,
}: {
  icon: PaywallFeature['icon'];
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    // paddingTop is set inline from useSafeAreaInsets() so it tracks the
    // device's real top inset (notch / Dynamic Island) plus a small gap.
    paddingBottom: spacing.md,
  },

  // Hero
  heroIconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.card,
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
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },

  // Feature list
  paywallFeatures: {
    gap: spacing.sm,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
  },
  paywallFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paywallFeatureText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
    fontSize: 14,
  },

  // Bottom CTA bar
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  primaryCtaText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 16,
  },
  secondaryCtaText: {
    ...typography.labelLarge,
    color: colors.inkLight,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    fontSize: 14,
  },
  legalRow: {
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
  legalDot: {
    ...typography.labelMedium,
    color: colors.inkLighter,
    fontSize: 12,
  },
});
