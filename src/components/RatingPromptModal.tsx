import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';

const APP_STORE_FALLBACK_URL =
  'https://apps.apple.com/app/id6756475892?action=write-review';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RatingPromptModal({ visible, onClose }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [stage, setStage] = useState<'rate' | 'review' | 'thanks-low'>('rate');

  const reset = () => {
    setRating(null);
    setStage('rate');
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleStar = (n: number) => {
    setRating(n);
    // Brief pause so the user sees their selection before the modal swaps content.
    setTimeout(() => {
      if (n >= 4) setStage('review');
      else setStage('thanks-low');
    }, 350);
  };

  const handleReviewYes = async () => {
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
      } else {
        const url = (await StoreReview.storeUrl()) || APP_STORE_FALLBACK_URL;
        await Linking.openURL(url);
      }
    } catch {
      Linking.openURL(APP_STORE_FALLBACK_URL).catch(() => {});
    }
    close();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={close}
    >
      <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Animated.View
          entering={FadeInDown.springify().damping(18)}
          style={styles.card}
        >
          <Pressable onPress={() => {}} style={styles.cardInner}>
            <TouchableOpacity
              onPress={close}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={colors.inkLight} />
            </TouchableOpacity>

            {stage === 'rate' && (
              <Animated.View entering={FadeIn.duration(200)}>
                <View style={styles.emojiCircle}>
                  <Text style={styles.emoji}>👋</Text>
                </View>
                <Text style={styles.title}>Enjoying Algogo?</Text>
                <Text style={styles.subtitle}>
                  You've been with us for a few days — how's the app treating you?
                </Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = rating !== null && n <= rating;
                    return (
                      <TouchableOpacity
                        key={n}
                        onPress={() => handleStar(n)}
                        activeOpacity={0.7}
                        style={styles.starBtn}
                      >
                        <Ionicons
                          name={active ? 'star' : 'star-outline'}
                          size={40}
                          color={active ? '#F5B400' : colors.inkLighter}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.hint}>Tap a star</Text>
              </Animated.View>
            )}

            {stage === 'review' && (
              <Animated.View entering={FadeIn.duration(220)}>
                <View style={[styles.emojiCircle, { backgroundColor: '#FFF6D6' }]}>
                  <Text style={styles.emoji}>⭐️</Text>
                </View>
                <Text style={styles.title}>That means a lot</Text>
                <Text style={styles.subtitle}>
                  Would you mind leaving us a review?
                </Text>
                <TouchableOpacity
                  onPress={handleReviewYes}
                  activeOpacity={0.85}
                  style={[styles.primaryBtn, shadows.button(colors.primaryDark)]}
                >
                  <Ionicons name="logo-apple" size={18} color={colors.white} />
                  <Text style={styles.primaryBtnText}>Leave a review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={close}
                  activeOpacity={0.8}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>Maybe later</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {stage === 'thanks-low' && (
              <Animated.View entering={FadeIn.duration(220)}>
                <View style={[styles.emojiCircle, { backgroundColor: '#E9F4FF' }]}>
                  <Text style={styles.emoji}>🙏</Text>
                </View>
                <Text style={styles.title}>Thanks for the feedback</Text>
                <Text style={styles.subtitle}>
                  We're a tiny team and we read everything. If something's off,
                  email us at ceo@raidea.dev — we want to fix it.
                </Text>
                <TouchableOpacity
                  onPress={close}
                  activeOpacity={0.85}
                  style={[styles.primaryBtn, shadows.button(colors.primaryDark)]}
                >
                  <Text style={styles.primaryBtnText}>Got it</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 25, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    borderColor: colors.border,
    borderBottomColor: colors.borderDark,
    ...shadows.lg,
  },
  cardInner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
  emojiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEED9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 32 },
  title: {
    ...typography.headlineSmall,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  starBtn: { padding: 4 },
  hint: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignSelf: 'stretch',
  },
  primaryBtnText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  secondaryBtnText: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
});
