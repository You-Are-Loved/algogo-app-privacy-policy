// Full-screen search over every practice problem. Slides in over the
// Practice list; results are grouped by track and open the right screen.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows, difficultyColors } from '../theme';
import {
  PracticeItem,
  PracticeCategoryKey,
  categoryMeta,
  searchPractice,
} from '../data/practiceIndex';
import { TAB_BAR_CLEARANCE } from './AnimatedTabBar';
import CompletionMark from './CompletionMark';
import { useDemoAction } from '../dev/demo';

type Row =
  | { type: 'header'; key: string; category: PracticeCategoryKey; count: number }
  | { type: 'item'; key: string; item: PracticeItem };

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpen: (item: PracticeItem) => void;
  isLocked: (item: PracticeItem) => boolean;
  completed: Record<string, string>;
  onToggleComplete: (key: string) => void;
}

const DURATION = 260;

export default function PracticeSearch({
  visible,
  onClose,
  onOpen,
  isLocked,
  completed,
  onToggleComplete,
}: Props) {
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(visible);
  const inputRef = useRef<TextInput>(null);
  const progress = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) });
      // Let the overlay paint before the keyboard animates up.
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    Keyboard.dismiss();
    progress.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }, (done) => {
      if (done) runOnJS(setMounted)(false);
    });
  }, [visible, progress]);

  useEffect(() => {
    if (!mounted) setQuery('');
  }, [mounted]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const barStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: (1 - progress.value) * 48 },
      { scale: 0.92 + progress.value * 0.08 },
    ],
  }));

  useDemoAction('search.type', setQuery);

  const results = useMemo(() => searchPractice(query), [query]);
  const rows = useMemo<Row[]>(() => {
    const byCat = new Map<PracticeCategoryKey, PracticeItem[]>();
    results.forEach((r) => {
      const list = byCat.get(r.category) ?? [];
      list.push(r);
      byCat.set(r.category, list);
    });
    const out: Row[] = [];
    byCat.forEach((items, category) => {
      out.push({ type: 'header', key: `h-${category}`, category, count: items.length });
      items.forEach((item) => out.push({ type: 'item', key: item.key, item }));
    });
    return out;
  }, [results]);


  if (!mounted) return null;

  const trimmed = query.trim();

  return (
    <Animated.View
      style={[styles.overlay, { paddingTop: insets.top }, overlayStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.header}>
        <Animated.View style={[styles.bar, barStyle]}>
          <Ionicons name="search" size={18} color={colors.inkLight} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search problems, topics, tracks"
            placeholderTextColor={colors.inkLighter}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
            accessibilityLabel="Search practice problems"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.inkLighter} />
            </Pressable>
          )}
        </Animated.View>
        <Pressable onPress={onClose} hitSlop={8} style={styles.cancel} accessibilityRole="button">
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {trimmed.length === 0 ? null : rows.length === 0 ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.hint}>
          <View style={styles.hintIcon}>
            <Ionicons name="search-outline" size={22} color={colors.inkLight} />
          </View>
          <Text style={styles.hintTitle}>No matches</Text>
          <Text style={styles.hintBody}>Try a topic like “binary search”, “joins” or “debounce”.</Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(180)} style={{ flex: 1 }}>
        <FlatList
          data={rows}
          keyExtractor={(r) => r.key}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: row }) => {
            if (row.type === 'header') {
              const meta = categoryMeta(row.category);
              return (
                <View style={styles.sectionHeader}>
                  <Ionicons name={meta.icon} size={14} color={meta.color} />
                  <Text style={[styles.sectionTitle, { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.sectionCount}>{row.count}</Text>
                </View>
              );
            }
            const { item } = row;
            const meta = categoryMeta(item.category);
            const locked = isLocked(item);
            const done = !!completed[item.key];
            const diffColor = item.difficulty ? difficultyColors[item.difficulty] : colors.borderDark;
            return (
              <View>
                <TouchableOpacity
                  style={[styles.row, { borderBottomColor: diffColor }]}
                  activeOpacity={0.7}
                  onPress={() => onOpen(item)}
                >
                  <CompletionMark complete={done} onToggle={() => onToggleComplete(item.key)}>
                    <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
                      <Ionicons name={meta.icon} size={17} color={meta.color} />
                    </View>
                  </CompletionMark>
                  <View style={styles.titleCol}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.topic} numberOfLines={1}>
                      {item.topic}
                    </Text>
                  </View>
                  {item.difficulty && (
                    <View style={[styles.diffBadge, { backgroundColor: `${diffColor}22` }]}>
                      <Text style={[styles.diffText, { color: diffColor }]}>{item.difficulty}</Text>
                    </View>
                  )}
                  {locked ? (
                    <Ionicons name="lock-closed" size={16} color={colors.inkLighter} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.inkLighter} />
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    lineHeight: undefined, // let the TextInput size its own glyph box; a fixed lineHeight clips descenders on iOS
    color: colors.ink,
    height: 44,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  cancel: { paddingVertical: spacing.sm, paddingLeft: spacing.xs },
  cancelText: { ...typography.labelLarge, color: colors.purpleDark, fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: TAB_BAR_CLEARANCE },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  sectionTitle: { ...typography.labelSmall, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionCount: { ...typography.labelSmall, color: colors.inkLighter, marginLeft: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    ...shadows.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: { flex: 1 },
  title: { ...typography.labelLarge, color: colors.ink },
  topic: { ...typography.labelSmall, color: colors.inkLight, marginTop: 1 },
  diffBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  diffText: { ...typography.labelSmall, fontWeight: '700' },
  hint: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
    gap: spacing.sm,
  },
  hintIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${colors.inkLighter}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  hintTitle: { ...typography.headlineSmall, color: colors.ink },
  hintBody: { ...typography.bodyMedium, color: colors.inkLight, textAlign: 'center' },
});
