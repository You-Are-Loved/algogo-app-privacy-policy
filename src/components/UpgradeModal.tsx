import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { colors, spacing, borderRadius, typography } from '../theme';
import { useSubscriptionContext } from '../context/SubscriptionContext';

const { width } = Dimensions.get('window');

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://you-are-loved.github.io/algogo-app-privacy-policy/privacy-policy.html';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  categoryName?: string;
}

export default function UpgradeModal({ visible, onClose, categoryName }: UpgradeModalProps) {
  const { purchase, restore, product, isLoading } = useSubscriptionContext();

  const handlePurchase = async () => {
    const result = await purchase();
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

  const features = [
    { icon: 'code-slash-outline', text: '19 Algorithm Patterns' },
    { icon: 'server-outline', text: 'System Design Fundamentals' },
    { icon: 'globe-outline', text: 'Web Development Topics' },
    { icon: 'phone-portrait-outline', text: 'iOS & Android Development' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.inkLight} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open" size={32} color={colors.white} />
            </View>
            <Text style={styles.title}>Unlock All Content</Text>
            {categoryName && (
              <Text style={styles.subtitle}>
                "{categoryName}" is a premium topic
              </Text>
            )}
          </View>

          {/* Features */}
          <View style={styles.features}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon as any}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product?.price || '$0.99'}</Text>
            <Text style={styles.priceLabel}>per month</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
              disabled={isLoading}
            >
              <Ionicons name="sparkles" size={20} color={colors.white} />
              <Text style={styles.purchaseButtonText}>
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isLoading}
            >
              <Text style={styles.restoreButtonText}>Restore Purchase</Text>
            </TouchableOpacity>
          </View>

          {/* Subscription Info */}
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTitle}>Algogo Pro - Monthly</Text>
            <Text style={styles.terms}>
              Payment will be charged to your Apple ID account. Subscription automatically renews monthly unless cancelled at least 24 hours before the end of the current period.
            </Text>
          </View>

          {/* Terms and Privacy Links */}
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={styles.legalLink}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width - spacing.xl * 2,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
  },
  features: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xl,
  },
  price: {
    ...typography.displayMedium,
    color: colors.primary,
  },
  priceLabel: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    marginLeft: spacing.xs,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  purchaseButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  restoreButtonText: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  subscriptionInfo: {
    width: '100%',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  subscriptionTitle: {
    ...typography.labelMedium,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  terms: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legalLink: {
    ...typography.labelSmall,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    ...typography.labelSmall,
    color: colors.inkLighter,
  },
});
