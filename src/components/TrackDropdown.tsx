// Animated track switcher for the Study tab. A full-width trigger shows the
// active track; tapping it drops a floating menu anchored right under the
// trigger with a blurred backdrop, an eased scale/slide-in on the panel and
// a staggered cascade on the rows (no spring overshoot anywhere). Selecting a row plays the panel out before
// handing the new track back so the grid swap never fights the menu.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { contentTypeInfo, ContentType, getCategoriesByType } from '../data/allCategories';

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

const PANEL_GAP = 8;
const ROW_STAGGER_MS = 28;
const OPEN_MS = 220;
const CLOSE_MS = 140;

interface Props {
  value: ContentType;
  onChange: (track: ContentType) => void;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function TrackDropdown({ value, onChange }: Props) {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [open, setOpen] = useState(false);

  // 0 = closed, 1 = fully open. Drives the panel and the chevron together.
  const progress = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const info = contentTypeInfo[value];

  const openMenu = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }, []);

  useEffect(() => {
    if (open) {
      progress.value = withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) });
    }
  }, [open, progress]);

  const finishClose = useCallback(
    (next?: ContentType) => {
      setOpen(false);
      if (next && next !== value) onChange(next);
    },
    [onChange, value],
  );

  const closeMenu = useCallback(
    (next?: ContentType) => {
      progress.value = withTiming(
        0,
        { duration: CLOSE_MS, easing: Easing.in(Easing.quad) },
        (done) => {
          if (done) runOnJS(finishClose)(next);
        },
      );
    },
    [finishClose, progress],
  );

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const triggerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * -10 },
      { scale: 0.94 + progress.value * 0.06 },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const { height: windowHeight } = Dimensions.get('window');
  const panelTop = anchor ? anchor.y + anchor.height + PANEL_GAP : 0;
  const panelMaxHeight = Math.max(200, windowHeight - panelTop - spacing.xl * 2);

  return (
    <>
      <Animated.View style={[styles.triggerWrap, triggerStyle]}>
        <Pressable
          ref={triggerRef}
          onPress={openMenu}
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
          <Animated.View style={[styles.chevron, chevronStyle]}>
            <Ionicons name="chevron-down" size={18} color={info.color} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      <Modal
        visible={open}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
          <Pressable style={styles.backdrop} onPress={() => closeMenu()} />
        </Animated.View>

        {anchor && (
          <Animated.View
            style={[
              styles.panel,
              panelStyle,
              { top: panelTop, left: anchor.x, width: anchor.width, maxHeight: panelMaxHeight },
            ]}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {TRACKS.map((track, index) => {
                const item = contentTypeInfo[track];
                const active = track === value;
                const count = getCategoriesByType(track).length;
                return (
                  <Animated.View
                    key={track}
                    entering={FadeInDown.delay(index * ROW_STAGGER_MS)
                      .duration(200)
                      .easing(Easing.out(Easing.cubic))}
                    exiting={FadeOut.duration(80)}
                  >
                    <Pressable
                      onPress={() => closeMenu(track)}
                      accessibilityRole="menuitem"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.row,
                        active && { backgroundColor: `${item.color}14` },
                        pressed && !active && styles.rowPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.rowIcon,
                          { backgroundColor: active ? item.color : `${item.color}1A` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={active ? colors.white : item.color}
                        />
                      </View>
                      <View style={styles.rowText}>
                        <Text
                          style={[styles.rowTitle, active && { color: item.color }]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {count} topics · {item.subtitle}
                        </Text>
                      </View>
                      {active ? (
                        <View style={[styles.check, { backgroundColor: item.color }]}>
                          <Ionicons name="checkmark" size={14} color={colors.white} />
                        </View>
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color={colors.inkLighter} />
                      )}
                    </Pressable>
                    {index < TRACKS.length - 1 && <View style={styles.divider} />}
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </Modal>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 25, 0.28)',
  },
  panel: {
    position: 'absolute',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
    ...shadows.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
  },
  rowPressed: {
    backgroundColor: colors.background,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.inkLight,
    marginTop: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 36 + spacing.md + spacing.xs,
    marginRight: spacing.md,
    opacity: 0.7,
  },
});
