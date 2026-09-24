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
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://you-are-loved.github.io/algogo-app-privacy-policy/privacy-policy.html';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  categoryName?: string;
  /** Show "Continue with free version" — true when used as the onboarding finale. */
  showSkip?: boolean;
}

const ease = <T extends { easing: (e: any) => T }>(a: T) => a.easing(Easing.out(Easing.cubic));

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
  const heroTopPadding = insets.top + spacing.sm;

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
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#F7F8FC', '#FFFFFF']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: heroTopPadding }]}
          bounces={false}
        >
          <Animated.View entering={ease(FadeInDown.delay(60).duration(420))} style={styles.proPill}>
            <Ionicons name="sparkles" size={13} color={colors.purpleDark} />
            <Text style={styles.proPillText}>ALGOGO PRO</Text>
          </Animated.View>

          <Animated.Text entering={ease(FadeInDown.delay(140).duration(420))} style={styles.title}>
            {isFreeTrial ? 'Everything.\nFree for 7 days' : 'Unlock\neverything'}
          </Animated.Text>
          <Animated.Text entering={ease(FadeInDown.delay(220).duration(420))} style={styles.subtitle}>
            {categoryName ? `"${categoryName}" is a Pro topic. ${subtitleLine}` : subtitleLine}
          </Animated.Text>

          <Animated.View entering={ease(FadeInDown.delay(300).duration(420))} style={styles.featureCard}>
            {features.map((f, i) => (
              <PaywallFeatureRow key={i} icon={f.icon} text={f.text} last={i === features.length - 1} />
            ))}
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={ease(FadeInUp.delay(380).duration(420))}
          style={styles.bottomBar}
        >
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0)', '#FFFFFF']}
            style={styles.bottomFade}
          />
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
                <Animated.Text
                  key={ctaLabel}
                  entering={FadeIn.duration(180)}
                  style={styles.primaryCtaText}
                >
                  {ctaLabel}
                </Animated.Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
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
      </View>
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
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.planTop}>
        <Text style={[styles.planPillTitle, selected && styles.planPillTitleSelected]}>{title}</Text>
        <View style={[styles.planRadio, selected && styles.planRadioSelected]}>
          {selected ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
        </View>
      </View>
      <Text style={styles.planPillPrice}>{price}</Text>
      <View style={styles.planFoot}>
        {sub ? <Text style={styles.planPillSub}>{sub}</Text> : <Text style={styles.planPillSub}> </Text>}
        {badge ? (
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function PaywallFeatureRow({
  icon,
  text,
  last,
}: {
  icon: PaywallFeature['icon'];
  text: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.paywallFeatureRow, !last && styles.paywallFeatureRowDivider]}>
      <View style={styles.paywallFeatureIcon}>
        <Ionicons name={icon} size={15} color="#0B1020" />
      </View>
      <Text style={styles.paywallFeatureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    // paddingTop is set inline from useSafeAreaInsets() so it tracks the
    // device's real top inset (notch / Dynamic Island) plus a small gap.
    paddingBottom: spacing.sm,
  },

  // Hero
  proPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.purpleDark}14`,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  proPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.purpleDark,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: '#111827',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  // Feature list
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    shadowColor: '#0B1020',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 7,
  },
  paywallFeatureRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  paywallFeatureIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paywallFeatureText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
    fontSize: 13.5,
    lineHeight: 18,
  },

  // Bottom CTA bar
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -28,
    height: 28,
  },

  // Plan toggle
  planRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  planPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  planPillSelected: {
    borderColor: '#0B1020',
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioSelected: {
    backgroundColor: '#0B1020',
    borderColor: '#0B1020',
  },
  planFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: `${colors.primary}22`,
    borderRadius: borderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  planBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: colors.primaryDark,
  },
  planPillTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  planPillTitleSelected: {
    color: '#111827',
  },
  planPillPrice: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#111827',
    marginTop: 6,
  },
  planPillSub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkLight,
  },
  primaryCta: {
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
  primaryCtaText: { ...typography.labelLarge, fontSize: 17, color: '#FFFFFF' },
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
    gap: spacing.xs,
  },
  legalLink: {
    ...typography.labelMedium,
    color: colors.inkLighter,
    fontSize: 12,
  },
  legalDot: {
    ...typography.labelMedium,
    color: colors.inkLighter,
    fontSize: 12,
  },
});
