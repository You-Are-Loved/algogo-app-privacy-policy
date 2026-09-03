// Shared floating menu used by every dropdown in the app (Study's track
// switcher, Practice's category + language pickers). Opens anchored under a
// trigger with a blurred backdrop, an eased scale/slide-in on the panel and a
// staggered cascade on the rows — pure timing, no spring overshoot. Selecting
// a row plays the panel out before reporting the choice so whatever swaps
// behind it never fights the close animation.

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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';

export interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnchoredMenuItem {
  key: string;
  title: string;
  subtitle?: string;
  /** Ionicons glyph shown in a tinted square. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Small colored dot instead of an icon (e.g. language swatches). */
  dotColor?: string;
  /** Accent used for the icon tint, active highlight and check badge. */
  color?: string;
}

interface Props {
  visible: boolean;
  anchor: Anchor | null;
  items: AnchoredMenuItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  /**
   * stretch: panel matches the anchor width (full-width triggers).
   * right/left: panel is at least `minWidth` wide and hugs that edge of the
   * anchor (compact pill triggers).
   */
  align?: 'stretch' | 'left' | 'right';
  minWidth?: number;
}

const PANEL_GAP = 8;
const ROW_STAGGER_MS = 28;
const OPEN_MS = 220;
const CLOSE_MS = 140;
const EDGE_INSET = spacing.md;

/** Measures a trigger in window coordinates so the menu can anchor to it. */
export function useAnchor() {
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const measure = useCallback((then: () => void) => {
    ref.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      then();
    });
  }, []);
  return { ref, anchor, measure };
}

/** Chevron that rotates 180° while `open` is true. */
export function DropdownChevron({
  open,
  color,
  size = 16,
}: {
  open: boolean;
  color: string;
  size?: number;
}) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withTiming(open ? 180 : 0, {
      duration: OPEN_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [open, rotation]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <Animated.View style={style}>
      <Ionicons name="chevron-down" size={size} color={color} />
    </Animated.View>
  );
}

export default function AnchoredMenu({
  visible,
  anchor,
  items,
  selectedKey,
  onSelect,
  onClose,
  align = 'stretch',
  minWidth = 260,
}: Props) {
  // 0 = closed, 1 = fully open.
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) });
    }
  }, [visible, progress]);

  const finish = useCallback(
    (key?: string) => {
      onClose();
      if (key !== undefined && key !== selectedKey) onSelect(key);
    },
    [onClose, onSelect, selectedKey],
  );

  const close = useCallback(
    (key?: string) => {
      progress.value = withTiming(
        0,
        { duration: CLOSE_MS, easing: Easing.in(Easing.quad) },
        (done) => {
          if (done) runOnJS(finish)(key);
        },
      );
    },
    [finish, progress],
  );

  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * -10 },
      { scale: 0.94 + progress.value * 0.06 },
    ],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  let top = 0;
  let left = 0;
  let width = 0;
  if (anchor) {
    top = anchor.y + anchor.height + PANEL_GAP;
    if (align === 'stretch') {
      left = anchor.x;
      width = anchor.width;
    } else {
      width = Math.min(Math.max(anchor.width, minWidth), windowWidth - EDGE_INSET * 2);
      left = align === 'right' ? anchor.x + anchor.width - width : anchor.x;
      left = Math.min(Math.max(left, EDGE_INSET), windowWidth - width - EDGE_INSET);
    }
  }
  const maxHeight = Math.max(200, windowHeight - top - spacing.xl * 2);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={() => close()}
    >
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backdrop} onPress={() => close()} />
      </Animated.View>

      {anchor && (
        <Animated.View style={[styles.panel, panelStyle, { top, left, width, maxHeight }]}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {items.map((item, index) => {
              const active = item.key === selectedKey;
              const accent = item.color ?? colors.primary;
              return (
                <Animated.View
                  key={item.key}
                  entering={FadeInDown.delay(index * ROW_STAGGER_MS)
                    .duration(200)
                    .easing(Easing.out(Easing.cubic))}
                >
                  <Pressable
                    onPress={() => close(item.key)}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.row,
                      active && { backgroundColor: `${accent}14` },
                      pressed && !active && styles.rowPressed,
                    ]}
                  >
                    {item.icon ? (
                      <View
                        style={[
                          styles.rowIcon,
                          { backgroundColor: active ? accent : `${accent}1A` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={active ? colors.white : accent}
                        />
                      </View>
                    ) : (
                      <View style={styles.rowIcon}>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: item.dotColor ?? colors.inkLighter },
                          ]}
                        />
                      </View>
                    )}
                    <View style={styles.rowText}>
                      <Text
                        style={[styles.rowTitle, active && { color: accent }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {item.subtitle ? (
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {active ? (
                      <View style={[styles.check, { backgroundColor: accent }]}>
                        <Ionicons name="checkmark" size={14} color={colors.white} />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={colors.inkLighter} />
                    )}
                  </Pressable>
                  {index < items.length - 1 && <View style={styles.divider} />}
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
