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
import {
  Plan,
  computeAnnualDiscount,
  formatIntroDuration,
  formatIntroPeriod,
  formatMonthlyEquivalent,
} from '../hooks/useSubscription';
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
  const [plan, setPlan] = useState<Plan>('monthly');
  const insets = useSafeAreaInsets();
  // iPhone Pro Dynamic Island extends below the standard safe-area top inset
  // a touch, so we pad an extra ~16pt on top of insets.top for clearance.
  const heroTopPadding = insets.top + spacing.lg;

  const monthlyProduct = products.monthly;
  const annualProduct = products.annual;
  const monthlyPrice = monthlyProduct?.display ?? '$1.99';
  const annualPrice = annualProduct?.display ?? '$9.99';
  // Until StoreKit answers there's no annual price, so the toggle would show
  // an empty pill — fall back to the monthly-only layout in the meantime.
  const showPlans = annualProduct != null;
  const selectedPlan: Plan = showPlans ? plan : 'monthly';

  // Savings vs paying monthly ×12, and the annual price restated per month
  // ("$9.99/yr" reads as "$0.83/mo"). Both derive from live StoreKit prices,
  // so they track price changes and locale currency automatically.
  const discountPct = computeAnnualDiscount(monthlyProduct?.amount, annualProduct?.amount);
  const monthlyEquivalent = formatMonthlyEquivalent(annualProduct);

  // Any configured intro offer — App Store Connect surfaces these as
  // free-trial, pay-up-front (one charge covering the intro period), or
  // pay-as-you-go (a reduced per-period charge). We promote all three.
  // Offers are configured per SKU, so each plan carries its own.
  const selectedProduct = selectedPlan === 'annual' ? annualProduct : monthlyProduct;
  const offer = selectedProduct?.introOffer ?? null;
  const isFreeTrial = offer?.mode === 'free-trial';
  const trialDuration = isFreeTrial ? formatIntroDuration(offer) : null;
  const offerPeriod = offer ? formatIntroPeriod(offer) : null;

  const features = React.useMemo(() => getPaywallFeatures(), []);

  const handlePurchase = async () => {
    setPurchasing(true);
    const result = await purchase(selectedPlan);
    setPurchasing(false);
    if (result.success) onClose();
  };

  const handleRestore = async () => {
    const result = await restore();
    if (result.success && result.isSubscribed) onClose();
  };

  const priceUnit = selectedPlan === 'annual' ? 'yr' : 'mo';
  const selectedPrice = selectedPlan === 'annual' ? annualPrice : monthlyPrice;
  // Renewal price in words, with the annual price restated per month.
  const renewalPhrase = selectedPlan === 'annual'
    ? `${annualPrice}/year${monthlyEquivalent ? ` — just ${monthlyEquivalent}/month` : ''}`
    : `${monthlyPrice}/month`;

  const ctaLabel = !offer
    ? `Subscribe · ${selectedPrice}/${priceUnit}`
    : isFreeTrial
      ? `Start ${trialDuration} free trial`
      : offer.mode === 'pay-as-you-go'
        ? `Subscribe · ${offer.display}/${priceUnit} first ${offerPeriod}`
        : `Subscribe · ${offer.display} first ${offerPeriod}`;

  const subtitleLine = !offer
    ? `${renewalPhrase}. Cancel anytime.`
    : isFreeTrial
      ? `${trialDuration === '7-day' ? '7 days' : trialDuration} free, then ${renewalPhrase}. Cancel anytime.`
      : offer.mode === 'pay-as-you-go'
        ? `${offer.display} for your first ${offerPeriod}, then ${renewalPhrase}. Cancel anytime.`
        : `${offer.display} for your first ${offerPeriod}, then ${renewalPhrase}. Cancel anytime.`;

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
          {showPlans ? (
            <View style={styles.planRow}>
              <PlanPill
                title="Monthly"
                price={`${monthlyPrice}/mo`}
                selected={selectedPlan === 'monthly'}
                disabled={busy}
                onPress={() => setPlan('monthly')}
              />
              <PlanPill
                title="Annual"
                price={`${annualPrice}/yr`}
                sub={monthlyEquivalent ? `just ${monthlyEquivalent}/mo` : undefined}
                badge={discountPct ? `SAVE ${discountPct}%` : undefined}
                selected={selectedPlan === 'annual'}
                disabled={busy}
                onPress={() => setPlan('annual')}
              />
            </View>
          ) : null}

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

function PlanPill({
  title,
  price,
  sub,
  badge,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  price: string;
  sub?: string;
  badge?: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.planPill, selected && styles.planPillSelected]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {badge ? (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={[styles.planPillTitle, selected && styles.planPillTitleSelected]}>
        {title}
      </Text>
      <Text style={styles.planPillPrice}>{price}</Text>
      {sub ? <Text style={styles.planPillSub}>{sub}</Text> : null}
    </TouchableOpacity>
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
        <Ionicons name={icon} size={16} color={colors.primary} />
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
    gap: spacing.xs,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 3,
  },
  paywallFeatureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
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

  // Plan toggle
  planRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    // Room for the SAVE badge overlapping the annual pill's top edge.
    marginTop: spacing.xs + 4,
    marginBottom: spacing.md,
  },
  planPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  planPillSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  planBadgeText: {
    ...typography.labelMedium,
    color: colors.white,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  planPillTitle: {
    ...typography.labelMedium,
    color: colors.inkLight,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  planPillTitleSelected: {
    color: colors.primaryDark,
  },
  planPillPrice: {
    ...typography.labelLarge,
    color: colors.ink,
    fontSize: 16,
    marginTop: 2,
  },
  planPillSub: {
    ...typography.labelMedium,
    color: colors.inkLight,
    fontSize: 11,
    marginTop: 1,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.button(colors.primaryDark),
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
