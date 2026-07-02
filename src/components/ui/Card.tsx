import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  /** Colored bottom "lip" for playful depth. Defaults to a neutral dark edge. */
  liftColor?: string;
  /** Thickness of the lip. */
  lift?: number;
  /** Apply default internal padding. */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The base raised surface of the depth system: white face, hairline border,
 * a solid colored bottom lip, and a soft shadow. Static (non-interactive).
 */
export default function Card({ children, liftColor, lift = 4, padded, style }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        { borderBottomWidth: lift, borderBottomColor: liftColor ?? colors.borderDark },
        style,
      ]}
    >
      {children}
    </View>
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
