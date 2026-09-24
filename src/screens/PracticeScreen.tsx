import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { blind75, Difficulty } from '../data/blind75';
import { behavioralQuestions } from '../data/behavioral';
import { systemDesignProblems } from '../data/systemDesign';
import { bugFixProblems, codeProblemsForTrack, kindOf, CodeTrack } from '../data/bugFixes';
import { sqlProblems } from '../data/sqlProblems';
import { reactProblems } from '../data/reactProblems';
import { PracticeStackParamList } from '../navigation';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import UpgradeModal from '../components/UpgradeModal';
import BehavioralCard from '../components/BehavioralCard';
import { TAB_BAR_CLEARANCE } from '../components/AnimatedTabBar';
import AnchoredMenu, { AnchoredMenuItem, DropdownChevron, useAnchor } from '../components/AnchoredMenu';
import { useDemoAction } from '../dev/demo';
import { useStore } from '../store/useStore';
import { problemKey, PracticeItem } from '../data/practiceIndex';
import CompletionMark from '../components/CompletionMark';
import PracticeSearch from '../components/PracticeSearch';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList>;

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

const LANG_COLORS: Record<string, string> = {
  python: '#3776AB',
  javascript: '#F7DF1E',
  java: '#ED8B00',
};

type Category =
  | 'algorithms'
  | 'system-design'
  | 'react'
  | 'javascript'
  | 'swift'
  | 'kotlin'
  | 'node'
  | 'python'
  | 'java'
  | 'sql'
  | 'behavioral';

type KindFilter = 'all' | 'build' | 'debug';

const SQL_COLOR = '#336791';

// First N of each category are free; the rest gate behind Pro.
const FREE_LIMIT = 2;
const CATEGORIES: {
  key: Category;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    key: 'algorithms',
    label: 'Algorithms',
    icon: 'code-slash-outline',
    color: '#8B5CF6',
  },
  {
    key: 'system-design',
    label: 'System Design',
    icon: 'server-outline',
    color: '#636E72',
  },
  {
    key: 'python',
    label: 'Python',
    icon: 'logo-python',
    color: LANG_COLORS.python,
  },
  {
    key: 'react',
    label: 'React',
    icon: 'logo-react',
    color: '#0EA5E9',
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    icon: 'logo-javascript',
    color: '#C9A800',
  },
  {
    key: 'swift',
    label: 'Swift',
    icon: 'phone-portrait-outline',
    color: '#F05138',
  },
  {
    key: 'kotlin',
    label: 'Kotlin',
    icon: 'tablet-portrait-outline',
    color: '#7F52FF',
  },
  {
    key: 'node',
    label: 'Node.js',
    icon: 'logo-nodejs',
    color: '#3C873A',
  },
  {
    key: 'java',
    label: 'Java',
    icon: 'cafe-outline',
    color: LANG_COLORS.java,
  },
  {
    key: 'sql',
    label: 'SQL',
    icon: 'grid-outline',
    color: SQL_COLOR,
  },
  {
    key: 'behavioral',
    label: 'Behavioral',
    icon: 'chatbubbles-outline',
    color: '#EC4899',
  },
];

const menuItem = (key: Category): AnchoredMenuItem => {
  const c = CATEGORIES.find((x) => x.key === key)!;
  return { key: c.key, title: c.label, icon: c.icon, color: c.color };
};

// Frontend and Backend are groups that expand to their languages.
const CATEGORY_MENU: AnchoredMenuItem[] = [
  menuItem('algorithms'),
  menuItem('system-design'),
  {
    key: 'group-frontend',
    title: 'Frontend',
    icon: 'browsers-outline',
    color: '#0EA5E9',
    children: [menuItem('react'), menuItem('javascript'), menuItem('swift'), menuItem('kotlin')],
  },
  {
    key: 'group-backend',
    title: 'Backend',
    icon: 'server-outline',
    color: '#2196F3',
    children: [menuItem('node'), menuItem('python'), menuItem('java'), menuItem('sql')],
  },
  menuItem('behavioral'),
];

const CODE_TRACKS: Category[] = ['javascript', 'swift', 'kotlin', 'node', 'python', 'java'];
const isCodeCategory = (c: Category): c is Category & CodeTrack => CODE_TRACKS.includes(c);

export default function PracticeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isSubscribed } = useSubscriptionContext();
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [category, setCategory] = useState<Category>('algorithms');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const completed = useStore((s) => s.completedProblems);
  const toggleComplete = useStore((s) => s.toggleProblemComplete);
  const categoryAnchor = useAnchor();
  const listRef = useRef<FlatList<(typeof problems)[number]>>(null);
  useDemoAction('practice.openMenu', useCallback(() => categoryAnchor.measure(() => setPickerVisible(true)), [categoryAnchor]));
  useDemoAction('practice.openSearch', useCallback(() => setSearchOpen(true), []));
  useDemoAction('practice.closeSearch', useCallback(() => setSearchOpen(false), []));
  useDemoAction('practice.toggleComplete', useCallback((key: string) => toggleComplete(key), [toggleComplete]));
  useDemoAction('practice.setCategory', useCallback((c: Category) => setCategory(c), []));
  useDemoAction('practice.scroll', useCallback((y: number) => listRef.current?.scrollToOffset({ offset: y, animated: true }), []));

  const activeCategory = CATEGORIES.find((c) => c.key === category)!;
  const problems = useMemo(
    () => (category === 'algorithms' ? blind75 : []),
    [category],
  );
  const trackProblems = useMemo(
    () => (isCodeCategory(category) ? codeProblemsForTrack(category) : []),
    [category],
  );
  const hasBothKinds =
    trackProblems.some((p) => kindOf(p) === 'build') && trackProblems.some((p) => kindOf(p) === 'debug');
  const visibleBugFixes = useMemo(
    () => (kindFilter === 'all' || !hasBothKinds ? trackProblems : trackProblems.filter((p) => kindOf(p) === kindFilter)),
    [trackProblems, kindFilter, hasBothKinds],
  );

  const handleProblemPress = (problemId: string, number: number) => {
    if (!isSubscribed && number > FREE_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
    navigation.navigate('Problem', { problemId });
  };

  const handleSystemDesignPress = (problemId: string, number: number) => {
    if (!isSubscribed && number > FREE_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
    navigation.navigate('SystemDesign', { problemId });
  };

  const handleBugFixPress = (problemId: string, number: number) => {
    if (!isSubscribed && number > FREE_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
    navigation.navigate('BugFix', { problemId });
  };

  const handleReactPress = (problemId: string, number: number) => {
    if (!isSubscribed && number > FREE_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
    navigation.navigate('ReactProblem', { problemId });
  };

  const handleSqlPress = (problemId: string, number: number) => {
    if (!isSubscribed && number > FREE_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
    navigation.navigate('SqlProblem', { problemId });
  };

  const handleSearchOpen = (item: PracticeItem) => {
    if (!isSubscribed && item.number > FREE_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
    setSearchOpen(false);
    navigation.navigate(item.route, { problemId: item.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice</Text>
        <View style={styles.dropdownRow}>
          <Pressable
            onPress={() => setSearchOpen(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.searchBtn, pressed && styles.dropdownPressed]}
            accessibilityRole="button"
            accessibilityLabel="Search problems"
          >
            <Ionicons name="search" size={17} color={colors.ink} />
          </Pressable>
          <Pressable
            ref={categoryAnchor.ref}
            style={({ pressed }) => [styles.dropdown, pressed && styles.dropdownPressed]}
            onPress={() => categoryAnchor.measure(() => setPickerVisible(true))}
            accessibilityRole="button"
            accessibilityLabel={`Category: ${activeCategory.label}. Change category`}
          >
            <Ionicons name={activeCategory.icon} size={16} color={activeCategory.color} />
            <Text style={styles.dropdownLabel}>{activeCategory.label}</Text>
            <DropdownChevron open={pickerVisible} color={colors.inkLight} />
          </Pressable>
        </View>
      </View>

      <Animated.View
        key={category}
        entering={FadeInDown.duration(240)
          .easing(Easing.out(Easing.cubic))
          .withInitialValues({ transform: [{ translateY: 14 }] })}
        style={{ flex: 1 }}
      >
      {category === 'algorithms' ? (
        <FlatList
          ref={listRef}
          data={problems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const locked = !isSubscribed && item.number > FREE_LIMIT;
            return (
              <View>
                <TouchableOpacity
                  style={[styles.problemRow, { borderBottomColor: DIFF_COLORS[item.difficulty] }]}
                  activeOpacity={0.7}
                  onPress={() => handleProblemPress(item.id, item.number)}
                >
                  <CompletionMark
                    complete={!!completed[problemKey('Problem', item.id)]}
                    onToggle={() => toggleComplete(problemKey('Problem', item.id))}
                  >
                    <View style={styles.numberWrap}>
                      <Text style={styles.numberText}>
                        {String(item.number).padStart(2, '0')}
                      </Text>
                    </View>
                  </CompletionMark>
                  <View style={styles.titleCol}>
                    <Text style={styles.problemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.problemTopic}>{item.topic}</Text>
                  </View>
                  <View
                    style={[
                      styles.diffBadge,
                      { backgroundColor: `${DIFF_COLORS[item.difficulty]}22` },
                    ]}
                  >
                    <Text
                      style={[styles.diffBadgeText, { color: DIFF_COLORS[item.difficulty] }]}
                    >
                      {item.difficulty}
                    </Text>
                  </View>
                  {locked ? (
                    <Ionicons name="lock-closed" size={16} color={colors.inkLighter} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.inkLighter} />
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : category === 'behavioral' ? (
        <FlatList
          data={behavioralQuestions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const locked = !isSubscribed && item.number > FREE_LIMIT;
            return (
              <BehavioralCard
                question={item}
                locked={locked}
                onLockTap={() => setUpgradeVisible(true)}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
        />
      ) : category === 'system-design' ? (
        <FlatList
          data={systemDesignProblems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const locked = !isSubscribed && item.number > FREE_LIMIT;
            return (
              <TouchableOpacity
                style={styles.problemRow}
                activeOpacity={0.7}
                onPress={() => handleSystemDesignPress(item.id, item.number)}
              >
                <CompletionMark
                  complete={!!completed[problemKey('SystemDesign', item.id)]}
                  onToggle={() => toggleComplete(problemKey('SystemDesign', item.id))}
                >
                  <View style={styles.numberWrap}>
                    <Text style={styles.numberText}>
                      {String(item.number).padStart(2, '0')}
                    </Text>
                  </View>
                </CompletionMark>
                <View style={styles.titleCol}>
                  <Text style={styles.problemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.problemTopic}>{item.topic}</Text>
                </View>
                {locked ? (
                  <Ionicons name="lock-closed" size={16} color={colors.inkLighter} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.inkLighter} />
                )}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : category === 'sql' ? (
        <FlatList
          data={sqlProblems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const locked = !isSubscribed && item.number > FREE_LIMIT;
            return (
              <TouchableOpacity
                style={[styles.problemRow, { borderBottomColor: DIFF_COLORS[item.difficulty] }]}
                activeOpacity={0.7}
                onPress={() => handleSqlPress(item.id, item.number)}
              >
                <CompletionMark
                  complete={!!completed[problemKey('SqlProblem', item.id)]}
                  onToggle={() => toggleComplete(problemKey('SqlProblem', item.id))}
                >
                  <View style={styles.numberWrap}>
                    <Text style={styles.numberText}>
                      {String(item.number).padStart(2, '0')}
                    </Text>
                  </View>
                </CompletionMark>
                <View style={styles.titleCol}>
                  <Text style={styles.problemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.problemTopic}>{item.topic}</Text>
                </View>
                <View
                  style={[
                    styles.diffBadge,
                    { backgroundColor: `${DIFF_COLORS[item.difficulty]}22` },
                  ]}
                >
                  <Text
                    style={[styles.diffBadgeText, { color: DIFF_COLORS[item.difficulty] }]}
                  >
                    {item.difficulty}
                  </Text>
                </View>
                {locked ? (
                  <Ionicons name="lock-closed" size={16} color={colors.inkLighter} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.inkLighter} />
                )}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : category === 'react' ? (
        <FlatList
          data={reactProblems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const locked = !isSubscribed && item.number > FREE_LIMIT;
            return (
              <TouchableOpacity
                style={[styles.problemRow, { borderBottomColor: DIFF_COLORS[item.difficulty] }]}
                activeOpacity={0.7}
                onPress={() => handleReactPress(item.id, item.number)}
              >
                <CompletionMark
                  complete={!!completed[problemKey('ReactProblem', item.id)]}
                  onToggle={() => toggleComplete(problemKey('ReactProblem', item.id))}
                >
                  <View style={[styles.langIconWrap, { backgroundColor: '#0EA5E922' }]}>
                    <Ionicons name="logo-react" size={18} color="#0EA5E9" />
                  </View>
                </CompletionMark>
                <View style={styles.titleCol}>
                  <Text style={styles.problemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.problemTopic}>{item.topic}</Text>
                </View>
                <View
                  style={[
                    styles.diffBadge,
                    { backgroundColor: `${DIFF_COLORS[item.difficulty]}22` },
                  ]}
                >
                  <Text
                    style={[styles.diffBadgeText, { color: DIFF_COLORS[item.difficulty] }]}
                  >
                    {item.difficulty}
                  </Text>
                </View>
                {locked ? (
                  <Ionicons name="lock-closed" size={16} color={colors.inkLighter} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.inkLighter} />
                )}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : isCodeCategory(category) ? (
        <FlatList
          data={visibleBugFixes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            hasBothKinds ? (
              <View style={styles.kindFilterRow}>
                {(['all', 'build', 'debug'] as KindFilter[]).map((k) => {
                  const active = kindFilter === k;
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setKindFilter(k)}
                      style={[
                        styles.kindChip,
                        active && { backgroundColor: activeCategory.color, borderColor: activeCategory.color },
                      ]}
                    >
                      <Text style={[styles.kindChipText, active && styles.kindChipTextActive]}>
                        {k === 'all' ? 'All' : k === 'build' ? 'Build' : 'Debug'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const locked = !isSubscribed && item.number > FREE_LIMIT;
            const langColor = activeCategory.color;
            const isBuild = kindOf(item) === 'build';
            return (
              <TouchableOpacity
                style={[styles.problemRow, { borderBottomColor: DIFF_COLORS[item.difficulty] }]}
                activeOpacity={0.7}
                onPress={() => handleBugFixPress(item.id, item.number)}
              >
                <CompletionMark
                  complete={!!completed[problemKey('BugFix', item.id)]}
                  onToggle={() => toggleComplete(problemKey('BugFix', item.id))}
                >
                  <View style={[styles.langIconWrap, { backgroundColor: `${langColor}22` }]}>
                    <Ionicons
                      name={isBuild ? 'hammer-outline' : 'bug-outline'}
                      size={18}
                      color={langColor}
                    />
                  </View>
                </CompletionMark>
                <View style={styles.titleCol}>
                  <Text style={styles.problemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.problemTopic}>{item.topic}</Text>
                </View>
                <View
                  style={[
                    styles.diffBadge,
                    { backgroundColor: `${DIFF_COLORS[item.difficulty]}22` },
                  ]}
                >
                  <Text
                    style={[
                      styles.diffBadgeText,
                      { color: DIFF_COLORS[item.difficulty] },
                    ]}
                  >
                    {item.difficulty}
                  </Text>
                </View>
                {locked ? (
                  <Ionicons name="lock-closed" size={16} color={colors.inkLighter} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.inkLighter} />
                )}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="construct-outline" size={32} color={colors.inkLighter} />
          <Text style={styles.emptyText}>Coming soon</Text>
        </View>
      )}

      </Animated.View>

      <PracticeSearch
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpen={handleSearchOpen}
        isLocked={(item) => !isSubscribed && item.number > FREE_LIMIT}
        completed={completed}
        onToggleComplete={toggleComplete}
      />

      <UpgradeModal
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        categoryName="Practice"
      />

      <AnchoredMenu
        visible={pickerVisible}
        anchor={categoryAnchor.anchor}
        items={CATEGORY_MENU}
        selectedKey={category}
        onSelect={(key) => setCategory(key as Category)}
        onClose={() => setPickerVisible(false)}
        align="right"
        minWidth={300}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.screenTitle },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dropdownPressed: {
    backgroundColor: colors.background,
  },
  dropdownLabel: {
    ...typography.labelMedium,
    color: colors.ink,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  problemRow: {
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
    borderBottomColor: colors.borderDark,
    ...shadows.sm,
  },
  separator: { height: spacing.sm },
  kindFilterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  kindChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  kindChipText: { ...typography.labelMedium, color: colors.inkLight },
  kindChipTextActive: { color: colors.white, fontWeight: '700' },
  numberWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { ...typography.labelMedium, color: colors.inkLight },
  langIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: { flex: 1 },
  problemTitle: { ...typography.labelLarge, color: colors.ink },
  problemTopic: { ...typography.labelSmall, color: colors.inkLight, marginTop: 1 },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  diffBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  langBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  langBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    marginTop: spacing.sm,
  },
});
