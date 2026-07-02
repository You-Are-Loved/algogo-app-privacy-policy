import React from 'react';
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  /** Optional trailing icon. */
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The app's signature chunky green CTA. A solid offset "lip" (primaryDark)
 * gives it the 3D look, and pressing pushes the face down into the lip.
 */
export default function PrimaryButton({ label, onPress, icon, disabled, style }: PrimaryButtonProps) {
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
      <Text style={styles.label}>{label}</Text>
      {icon ? <Ionicons name={icon} size={20} color={colors.white} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button(colors.primaryDark),
  },
  // Push the face down into its lip on press for a tactile feel.
  pressed: {
    transform: [{ translateY: 4 }],
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  disabled: {
    backgroundColor: colors.borderDark,
    ...shadows.button(colors.border),
  },
  label: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
