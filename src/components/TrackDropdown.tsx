// Track switcher for the Study tab: a full-width trigger showing the active
// track that opens the shared AnchoredMenu right underneath it.

import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { contentTypeInfo, ContentType, getCategoriesByType } from '../data/allCategories';
import AnchoredMenu, { AnchoredMenuItem, DropdownChevron, useAnchor } from './AnchoredMenu';

const TRACKS: ContentType[] = [
  'algorithms',
  'system-design',
  'cs',
  'ios',
  'android',
  'web',
  'backend',
  'sql',
  'cpp',
];

interface Props {
  value: ContentType;
  onChange: (track: ContentType) => void;
}

export default function TrackDropdown({ value, onChange }: Props) {
  const { ref, anchor, measure } = useAnchor();
  const [open, setOpen] = useState(false);
  const pressScale = useSharedValue(1);
  const info = contentTypeInfo[value];

  const items = useMemo<AnchoredMenuItem[]>(
    () =>
      TRACKS.map((track) => {
        const t = contentTypeInfo[track];
        return {
          key: track,
          title: t.title,
          subtitle: `${getCategoriesByType(track).length} topics · ${t.subtitle}`,
          icon: t.icon as keyof typeof Ionicons.glyphMap,
          color: t.color,
        };
      }),
    [],
  );

  const triggerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <>
      <Animated.View style={[styles.triggerWrap, triggerStyle]}>
        <Pressable
          ref={ref}
          onPress={() => measure(() => setOpen(true))}
          onPressIn={() => {
            pressScale.value = withTiming(0.97, { duration: 90 });
          }}
          onPressOut={() => {
            pressScale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
          }}
          accessibilityRole="button"
          accessibilityLabel={`Track: ${info.title}. Change track`}
          style={[styles.trigger, { borderColor: `${info.color}55` }]}
        >
          <View style={[styles.triggerIcon, { backgroundColor: info.color }]}>
            <Ionicons name={info.icon as any} size={18} color={colors.white} />
          </View>
          <View style={styles.triggerText}>
            <Text style={styles.triggerTitle} numberOfLines={1}>
              {info.title}
            </Text>
            <Text style={styles.triggerSubtitle} numberOfLines={1}>
              {info.subtitle}
            </Text>
          </View>
          <View style={styles.chevron}>
            <DropdownChevron open={open} color={info.color} size={18} />
          </View>
        </Pressable>
      </Animated.View>

      <AnchoredMenu
        visible={open}
        anchor={anchor}
        items={items}
        selectedKey={value}
        onSelect={(key) => onChange(key as ContentType)}
        onClose={() => setOpen(false)}
        align="stretch"
      />
    </>
  );
}

const styles = StyleSheet.create({
  triggerWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    ...shadows.sm,
  },
  triggerIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    flex: 1,
  },
  triggerTitle: {
    ...typography.headlineSmall,
    color: colors.ink,
  },
  triggerSubtitle: {
    ...typography.caption,
    color: colors.inkLight,
    marginTop: 1,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
