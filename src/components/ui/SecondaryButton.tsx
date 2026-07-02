import React from 'react';
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Accent color for text/lip/icon. Defaults to neutral ink. */
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The quieter sibling of PrimaryButton: a light chunky button with a neutral
 * (or tinted) lip. Same tactile press-down feel.
 */
export default function SecondaryButton({
  label,
  onPress,
  icon,
  color = colors.ink,
  disabled,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        style,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  pressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.labelLarge,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
