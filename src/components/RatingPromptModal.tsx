// "Enjoying Algogo?" pre-prompt. It only asks whether the user is up for
// rating; the stars themselves are collected by the system rating sheet
// (SKStoreReviewController on iOS, the Play in-app review flow on Android) via
// expo-store-review, so the user never leaves the app and we never collect a
// rating of our own.

import React, { useCallback } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import Animated, { Easing, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheetModal from './BottomSheetModal';
import PrimaryButton from './PrimaryButton';
import AlgogoLogo from './AlgogoLogo';
import { colors, spacing, typography } from '../theme';

const APP_STORE_FALLBACK_URL =
  'https://apps.apple.com/app/id6756475892?action=write-review';
const FEEDBACK_URL = 'mailto:ceo@raidea.dev?subject=Algogo%20feedback';
const STAR_GOLD = '#FFC800';

// The system sheet presents over the app window, so our own sheet (an RN
// Modal) has to be fully dismissed first or iOS can drop the request.
const SHEET_DISMISS_MS = 450;

const ease = <T extends { easing: (e: any) => T }>(a: T) => a.easing(Easing.out(Easing.cubic));

async function requestNativeReview() {
  try {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      return;
    }
    // No in-app flow on this device/build: fall back to the store listing.
    const url = (await StoreReview.storeUrl()) || APP_STORE_FALLBACK_URL;
    await Linking.openURL(url);
  } catch {
    Linking.openURL(APP_STORE_FALLBACK_URL).catch(() => {});
  }
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RatingPromptModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const handleRate = useCallback(() => {
    onClose();
    setTimeout(requestNativeReview, SHEET_DISMISS_MS);
  }, [onClose]);

  const handleFeedback = useCallback(() => {
    onClose();
    Linking.openURL(FEEDBACK_URL).catch(() => {});
  }, [onClose]);

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      sheetStyle={{ paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }}
    >
      <View style={styles.body}>
        <Animated.View entering={ease(FadeInDown.delay(80).duration(380))} style={styles.logoTile}>
          <AlgogoLogo size={92} />
        </Animated.View>

        {/* Decorative, but tapping them goes to the real rating sheet too. */}
        <Pressable
          onPress={handleRate}
          style={styles.starRow}
          accessibilityRole="button"
          accessibilityLabel="Rate Algogo"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Animated.View key={i} entering={ZoomIn.delay(220 + i * 70).duration(260)}>
              <Ionicons name="star" size={30} color={STAR_GOLD} />
            </Animated.View>
          ))}
        </Pressable>

        <Animated.Text entering={ease(FadeInDown.delay(160).duration(380))} style={styles.title}>
          Enjoying Algogo?
        </Animated.Text>
        <Animated.Text entering={ease(FadeInDown.delay(220).duration(380))} style={styles.subtitle}>
          A quick rating helps other engineers find the app. It takes a few seconds and you
          never leave Algogo.
        </Animated.Text>

        <Animated.View entering={ease(FadeInDown.delay(300).duration(380))} style={styles.actions}>
          <PrimaryButton label="Rate Algogo" icon="star" onPress={handleRate} />
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={({ pressed }) => [styles.laterBtn, pressed && styles.dim]}
            accessibilityRole="button"
          >
            <Text style={styles.laterText}>Not now</Text>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={handleFeedback}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.dim}
          accessibilityRole="link"
        >
          <Text style={styles.feedbackText}>
            Something not working? <Text style={styles.feedbackLink}>Tell us</Text>
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  // Same chunky card treatment as the rest of the app: thin border, heavy lip.
  logoTile: {
    width: 92,
    height: 92,
    borderRadius: 26,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    borderColor: colors.border,
    borderBottomColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.screenTitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.inkLight,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: spacing.xl,
  },
  actions: {
    alignSelf: 'stretch',
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  laterText: {
    ...typography.labelLarge,
    fontSize: 15,
    color: colors.inkLight,
  },
  feedbackText: {
    ...typography.caption,
    color: colors.inkLighter,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  feedbackLink: {
    color: colors.inkLight,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  dim: { opacity: 0.6 },
});
