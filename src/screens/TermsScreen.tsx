import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '../theme';
import { useStore } from '../store/useStore';

export default function TermsScreen() {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const { acceptTerms } = useStore();

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom) {
      setHasScrolledToEnd(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={40} color={colors.white} />
        </View>
        <Text style={styles.title}>Terms & Privacy</Text>
        <Text style={styles.subtitle}>Please review before continuing</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.bodyText}>
            By downloading, installing, or using Algogo ("the App"), you agree to be bound by these Terms of Service and Privacy Policy. If you do not agree to these terms, please do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.bodyText}>
            Algogo is an educational application designed to help users learn algorithm patterns and prepare for technical interviews through flashcards, quizzes, and interactive visualizations. The App provides study materials, progress tracking, and gamification features to enhance learning.
          </Text>

          <Text style={styles.sectionTitle}>3. Educational Content Disclaimer</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>IMPORTANT:</Text> The educational content provided in this App is for informational and learning purposes only. While we strive to provide accurate and up-to-date information:
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} We make no guarantees regarding the accuracy, completeness, or currentness of any content
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} The information may contain errors, omissions, or outdated material
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Content should not be considered as professional advice or authoritative reference material
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Users should verify information independently before relying on it
          </Text>

          <Text style={styles.sectionTitle}>4. No Guarantee of Interview Success</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>DISCLAIMER:</Text> Using this App does not guarantee success in any job interview, technical assessment, or hiring process. Interview outcomes depend on numerous factors beyond the scope of this App, including but not limited to:
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Individual preparation and effort
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Interviewer preferences and evaluation criteria
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Job market conditions and competition
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Company-specific requirements and culture fit
          </Text>
          <Text style={styles.bodyText}>
            We expressly disclaim any liability for interview outcomes, job offers, or career decisions made based on use of this App.
          </Text>

          <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
          <Text style={styles.bodyText}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} The App is provided "AS IS" and "AS AVAILABLE" without warranties of any kind
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} We shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Our total liability shall not exceed the amount you paid for the App (if any)
          </Text>

          <Text style={styles.sectionTitle}>6. Data Collection & Privacy</Text>
          <Text style={styles.bodyText}>
            We respect your privacy. The App collects and stores the following data locally on your device:
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Learning progress and quiz scores
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Badges and achievements earned
          </Text>
          <Text style={styles.bulletPoint}>
            {'\u2022'} Study streak information
          </Text>
          <Text style={styles.bodyText}>
            This data is stored locally on your device and is not transmitted to our servers.
          </Text>

          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.bodyText}>
            All content, design, and functionality of the App are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
          </Text>

          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.bodyText}>
            We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the modified terms.
          </Text>

          <Text style={styles.sectionTitle}>9. Contact</Text>
          <Text style={styles.bodyText}>
            If you have questions about these Terms or the App, please contact us through the App Store listing.
          </Text>

          <View style={styles.scrollPadding} />
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={styles.footer}>
        {!hasScrolledToEnd && (
          <Text style={styles.scrollHint}>
            <Ionicons name="chevron-down" size={14} color={colors.inkLight} /> Scroll to read all terms
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.acceptButton,
            !hasScrolledToEnd && styles.acceptButtonDisabled,
          ]}
          onPress={acceptTerms}
          disabled={!hasScrolledToEnd}
        >
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={hasScrolledToEnd ? colors.white : colors.inkLighter}
          />
          <Text
            style={[
              styles.acceptButtonText,
              !hasScrolledToEnd && styles.acceptButtonTextDisabled,
            ]}
          >
            I Accept the Terms & Privacy Policy
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.displaySmall,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.inkLight,
  },
  content: {
    flex: 1,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  lastUpdated: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bodyText: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bold: {
    fontWeight: '700',
    color: colors.ink,
  },
  bulletPoint: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    lineHeight: 22,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  scrollPadding: {
    height: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  scrollHint: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginBottom: spacing.md,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  acceptButtonDisabled: {
    backgroundColor: colors.border,
  },
  acceptButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  acceptButtonTextDisabled: {
    color: colors.inkLighter,
  },
});
