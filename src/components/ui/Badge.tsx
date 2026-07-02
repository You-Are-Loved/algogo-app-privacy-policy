import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface BadgeProps {
  label: string;
  /** Accent color; the pill uses a soft tint of it with matching text. */
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Solid filled variant (white text on the color) instead of soft tint. */
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A compact rounded label for difficulty, modes, tags, and counts. */
export default function Badge({ label, color = colors.inkLight, icon, solid, style }: BadgeProps) {
  const fg = solid ? colors.white : color;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: solid ? color : `${color}1F` },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.labelSmall,
    fontSize: 12,
    fontWeight: '700',
  },
});
