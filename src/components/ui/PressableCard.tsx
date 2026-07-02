import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Selected state paints the border/lip/tint with `selectedColor`. */
  selected?: boolean;
  selectedColor?: string;
  /** Colored bottom lip for the resting state. */
  liftColor?: string;
  lift?: number;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A tactile card: rests on a colored lip and pushes down into it when pressed.
 * Supports a selected state for option tiles / selectable lists.
 */
export default function PressableCard({
  children,
  onPress,
  disabled,
  selected,
  selectedColor = colors.primary,
  liftColor,
  lift = 4,
  padded,
  style,
}: PressableCardProps) {
  const restingLip = selected ? selectedColor : liftColor ?? colors.borderDark;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.card,
        padded && styles.padded,
        { borderBottomWidth: lift, borderBottomColor: restingLip },
        selected && { borderColor: selectedColor, backgroundColor: `${selectedColor}0F` },
        style,
        pressed && !disabled && { transform: [{ translateY: 2 }], borderBottomWidth: Math.max(lift - 2, 1) },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  padded: {
    padding: spacing.lg,
  },
});
