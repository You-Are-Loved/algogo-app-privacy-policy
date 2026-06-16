import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';

// The bar shows only on the landing screen of each stack; any pushed detail
// screen (a topic, a practice/system-design/bug-fix question, the test
// builder, a running session, results) is treated as immersive content and
// hides the bar.
const ROOT_ROUTES = new Set(['Home', 'PracticeList', 'TestHome']);

const TAB_META: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  StudyTab: { label: 'Study', icon: 'book-outline' },
  PracticeTab: { label: 'Practice', icon: 'code-slash-outline' },
  TestTab: { label: 'Interview', icon: 'stopwatch-outline' },
};

const BAR_HEIGHT = 60;
const BAR_SIDE_MARGIN = spacing.lg;
const PILL_GAP = spacing.xs;

// Bottom padding that scrollable landing screens should reserve so their last
// items clear the floating bar. Sized for the tallest home-indicator inset;
// devices without one simply get a little extra breathing room.
export const TAB_BAR_CLEARANCE = BAR_HEIGHT + 34 + spacing.lg;

export default function AnimatedTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [rowWidth, setRowWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  const tabCount = state.routes.length;
  const segmentWidth = rowWidth > 0 ? rowWidth / tabCount : 0;

  const nestedName = getFocusedRouteNameFromRoute(state.routes[state.index]);
  const hidden = !!nestedName && !ROOT_ROUTES.has(nestedName);

  // Slide-out animation. The bar is always absolutely positioned, so toggling
  // it never reflows the scene underneath — the content is full-height the
  // whole time and the bar just glides away over it.
  const shown = useSharedValue(hidden ? 0 : 1);

  useEffect(() => {
    shown.value = withTiming(hidden ? 0 : 1, {
      duration: hidden ? 200 : 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [hidden, shown]);

  useEffect(() => {
    indicatorX.value = withSpring(state.index * segmentWidth, {
      damping: 20,
      stiffness: 200,
      mass: 0.7,
    });
  }, [state.index, segmentWidth, indicatorX]);

  const bottomOffset = insets.bottom > 0 ? insets.bottom : spacing.md;

  const containerStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * (BAR_HEIGHT + bottomOffset + 24) }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'auto'}
      style={[styles.bar, { bottom: bottomOffset }, containerStyle]}
    >
      <View
        style={styles.row}
        onLayout={(e: LayoutChangeEvent) => setRowWidth(e.nativeEvent.layout.width)}
      >
        {segmentWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              { width: segmentWidth - PILL_GAP * 2 },
              indicatorStyle,
            ]}
          />
        )}
        {state.routes.map((route, index) => {
          const meta =
            TAB_META[route.name] ?? {
              label: route.name,
              icon: 'ellipse-outline' as const,
            };
          const focused = state.index === index;
          const tint = focused ? colors.primary : colors.inkLight;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <Ionicons name={meta.icon} size={23} color={tint} />
              <Text style={[styles.label, { color: tint }]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: BAR_SIDE_MARGIN,
    right: BAR_SIDE_MARGIN,
    height: BAR_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
    ...shadows.lg,
  },
  row: {
    flexDirection: 'row',
    height: BAR_HEIGHT - spacing.sm * 2,
  },
  indicator: {
    position: 'absolute',
    left: PILL_GAP,
    top: 0,
    bottom: 0,
    backgroundColor: `${colors.primary}1A`,
    borderRadius: borderRadius.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    ...typography.labelSmall,
    fontSize: 11,
  },
});
