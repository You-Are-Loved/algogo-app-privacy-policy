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

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
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
          <Text style={styles.lastUpdated}>Last Updated: May 2026</Text>

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

          <Text style={styles.sectionTitle}>4. Code Execution & Practice Sandbox</Text>
          <Text style={styles.bodyText}>
            <Text style={styles.bold}>IMPORTANT:</Text> The Practice feature lets you write, edit, and run Python code on your own device using an embedded WebAssembly runtime. By using this feature you acknowledge and agree that:
          </Text>
          <Text style={styles.bulletPoint}>
            {'•'} You are solely responsible for any code you type, paste, or execute inside the App, and for any consequences thereof
          </Text>
          <Text style={styles.bulletPoint}>
            {'•'} Code runs in a sandboxed WebView. We deliberately block standard network access from user code (fetch, XMLHttpRequest, WebSocket, etc.) but make no representation that the sandbox is impenetrable
          </Text>
          <Text style={styles.bulletPoint}>
            {'•'} We do not store, transmit, or analyze the code you write. Your draft solutions and any saved behavioral notes are kept on your device only
          </Text>
          <Text style={styles.bulletPoint}>
            {'•'} The results, timing, and output produced by your code are advisory; we make no warranty that grading is correct in every edge case
          </Text>
          <Text style={styles.bulletPoint}>
            {'•'} You will not use the Practice feature to write or run code that is unlawful, infringes the rights of others, harms your device, or attempts to escape the sandbox
          </Text>
          <Text style={styles.bodyText}>
            We expressly disclaim any liability arising from code you write, run, or share through the App, including any direct or indirect consequences on your device, accounts, or data.
          </Text>

          <Text style={styles.sectionTitle}>5. No Guarantee of Interview Success</Text>
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

          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
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

          <Text style={styles.sectionTitle}>7. Data Collection & Privacy</Text>
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

          <Text style={styles.sectionTitle}>8. Third-Party Software & Attributions</Text>
          <Text style={styles.bodyText}>
            The Practice feature is built on top of open-source software that we are required (and grateful) to attribute. The components below are not authored by us; they are used under their respective licenses and remain the property of their authors:
          </Text>
          <Text style={styles.bulletPoint}>
            {'•'} <Text style={styles.bold}>Pyodide</Text> (a CPython distribution compiled to WebAssembly), used as the Python runtime. Licensed under the Mozilla Public License 2.0. Source: https://github.com/pyodide/pyodide. License: https://www.mozilla.org/MPL/2.0/.
          </Text>
          <Text style={styles.bulletPoint}>
            {'•'} <Text style={styles.bold}>CodeMirror 6</Text> (text editor framework), used to render the in-app Python editor. Licensed under the MIT License. Source: https://github.com/codemirror/dev. Copyright (c) by Marijn Haverbeke and contributors.
          </Text>
          <Text style={styles.bodyText}>
            We do not claim ownership of these components and we do not modify them in ways that would affect those licenses. If you redistribute or build upon the App's source, you must continue to honor the upstream license terms.
          </Text>

          <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
          <Text style={styles.bodyText}>
            Subject to Section 8, all original content, design, and functionality of the App are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.bodyText}>
            We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the modified terms.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact</Text>
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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderBottomColor: colors.borderDark,
    overflow: 'hidden',
    ...shadows.sm,
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
    ...shadows.button(colors.primaryDark),
  },
  acceptButtonDisabled: {
    backgroundColor: colors.border,
    ...shadows.button(colors.borderDark),
  },
  acceptButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  acceptButtonTextDisabled: {
    color: colors.inkLighter,
  },
});
