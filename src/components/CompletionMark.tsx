// Tappable "done" badge for practice rows. Wraps the row's leading circle
// (number or language icon) and pins a small check to its corner; tapping
// toggles completion with a pop + haptic.
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

interface Props {
  complete: boolean;
  onToggle: () => void;
  /** Accent for the completed state. Defaults to the theme's success green. */
  color?: string;
  children: React.ReactNode;
}

export default function CompletionMark({ complete, onToggle, color = colors.primary, children }: Props) {
  const pop = useSharedValue(complete ? 1 : 0);
  const first = React.useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      pop.value = complete ? 1 : 0;
      return;
    }
    if (complete) {
      pop.value = withSequence(
        withTiming(1.25, { duration: 160, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 140, easing: Easing.inOut(Easing.quad) }),
      );
    } else {
      pop.value = withTiming(0, { duration: 140, easing: Easing.in(Easing.quad) });
    }
  }, [complete, pop]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value),
    transform: [{ scale: pop.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, pop.value),
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onToggle();
      }}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: complete }}
      accessibilityLabel={complete ? 'Completed. Tap to mark incomplete' : 'Not completed. Tap to mark complete'}
      style={({ pressed }) => [styles.wrap, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      <View style={[styles.circle, complete && { backgroundColor: `${color}1A` }]}>{children}</View>
      {/* faint "ghost" check hints the badge is tappable */}
      <Animated.View style={[styles.corner, styles.ghost, ringStyle]}>
        <Ionicons name="checkmark" size={13} color={colors.inkLighter} />
      </Animated.View>
      <Animated.View style={[styles.corner, styles.badge, { backgroundColor: color }, badgeStyle]}>
        <Ionicons name="checkmark" size={13} color={colors.white} />
      </Animated.View>
    </Pressable>
  );
}

const SIZE = 36;
const CORNER = 20;

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    right: -6,
    bottom: -5,
    width: CORNER,
    height: CORNER,
    borderRadius: CORNER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  ghost: {
    backgroundColor: colors.background,
    opacity: 0.9,
  },
  badge: {
    shadowColor: '#0B1020',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
});
