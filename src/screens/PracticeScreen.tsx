import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { blind75, Difficulty } from '../data/blind75';
import { behavioralQuestions } from '../data/behavioral';
import { systemDesignProblems } from '../data/systemDesign';
import { bugFixProblems, BugFixLanguage } from '../data/bugFixes';
import { PracticeStackParamList } from '../navigation';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import UpgradeModal from '../components/UpgradeModal';
import BehavioralCard from '../components/BehavioralCard';
import { TAB_BAR_CLEARANCE } from '../components/AnimatedTabBar';
import AnchoredMenu, { AnchoredMenuItem, DropdownChevron, useAnchor } from '../components/AnchoredMenu';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList>;

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

const LANG_COLORS: Record<BugFixLanguage, string> = {
  python: '#3776AB',
  javascript: '#F7DF1E',
  java: '#ED8B00',
};
const LANG_LABELS: Record<BugFixLanguage, string> = {
  python: 'Py',
  javascript: 'JS',
  java: 'Java',
};

type Category = 'algorithms' | 'system-design' | 'behavioral' | 'bug-fix';
type LangFilter = 'all' | BugFixLanguage;

// First N of each category are free; the rest gate behind Pro.
const FREE_LIMIT = 2;
const CATEGORIES: {
  key: Category;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { key: 'algorithms', label: 'Algorithms', icon: 'code-slash-outline', color: '#8B5CF6' },
  { key: 'system-design', label: 'System Design', icon: 'server-outline', color: '#636E72' },
  { key: 'behavioral', label: 'Behavioral', icon: 'chatbubbles-outline', color: '#EC4899' },
  { key: 'bug-fix', label: 'Bug Fix', icon: 'bug-outline', color: '#EF4444' },
];

const CATEGORY_MENU: AnchoredMenuItem[] = CATEGORIES.map((c) => ({
  key: c.key,
  title: c.label,
  icon: c.icon,
  color: c.color,
  subtitle:
    c.key === 'algorithms'
      ? `${blind75.length} problems · real Python runtime`
      : c.key === 'system-design'
        ? `${systemDesignProblems.length} problems · self-grading canvas`
        : c.key === 'behavioral'
          ? `${behavioralQuestions.length} prompts · notes that save`
          : `${bugFixProblems.length} snippets · Python, JS & Java`,
}));

const LANG_FILTERS: { key: LangFilter; label: string }[] = [
  { key: 'all', label: 'All langs' },
  { key: 'python', label: 'Python' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'java', label: 'Java' },
];

const LANG_MENU: AnchoredMenuItem[] = LANG_FILTERS.map((l) => {
  const count =
    l.key === 'all'
      ? bugFixProblems.length
      : bugFixProblems.filter((p) => p.language === l.key).length;
  return {
    key: l.key,
    title: l.label,
    subtitle: `${count} snippets`,
    dotColor: l.key === 'all' ? colors.inkLighter : LANG_COLORS[l.key],
    color: l.key === 'all' ? colors.ink : LANG_COLORS[l.key],
  };
});

export default function PracticeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isSubscribed } = useSubscriptionContext();
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [category, setCategory] = useState<Category>('algorithms');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [langPickerVisible, setLangPickerVisible] = useState(false);
  const categoryAnchor = useAnchor();
  const langAnchor = useAnchor();

  const activeCategory = CATEGORIES.find((c) => c.key === category)!;
  const activeLang = LANG_FILTERS.find((l) => l.key === langFilter)!;
  const problems = useMemo(
    () => (category === 'algorithms' ? blind75 : []),
    [category],
  );
  const visibleBugFixes = useMemo(
    () =>
      langFilter === 'all'
        ? bugFixProblems
        : bugFixProblems.filter((p) => p.language === langFilter),
    [langFilter],
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice</Text>
        <View style={styles.dropdownRow}>
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
          {category === 'bug-fix' && (
            <Pressable
              ref={langAnchor.ref}
              style={({ pressed }) => [styles.dropdown, pressed && styles.dropdownPressed]}
              onPress={() => langAnchor.measure(() => setLangPickerVisible(true))}
              accessibilityRole="button"
              accessibilityLabel={`Language: ${activeLang.label}. Change language`}
            >
              {activeLang.key !== 'all' && (
                <View
                  style={[
                    styles.langDot,
                    { backgroundColor: LANG_COLORS[activeLang.key as BugFixLanguage] },
                  ]}
                />
              )}
              <Text style={styles.dropdownLabel}>{activeLang.label}</Text>
              <DropdownChevron open={langPickerVisible} color={colors.inkLight} />
            </Pressable>
          )}
        </View>
      </View>

      {category === 'algorithms' ? (
        <FlatList
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
                  <View style={styles.numberWrap}>
                    <Text style={styles.numberText}>
                      {String(item.number).padStart(2, '0')}
                    </Text>
                  </View>
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
                <View style={styles.numberWrap}>
                  <Text style={styles.numberText}>
                    {String(item.number).padStart(2, '0')}
                  </Text>
                </View>
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
      ) : category === 'bug-fix' ? (
        <FlatList
          data={visibleBugFixes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const locked = !isSubscribed && item.number > FREE_LIMIT;
            const langColor = LANG_COLORS[item.language];
            return (
              <TouchableOpacity
                style={[styles.problemRow, { borderBottomColor: DIFF_COLORS[item.difficulty] }]}
                activeOpacity={0.7}
                onPress={() => handleBugFixPress(item.id, item.number)}
              >
                <View
                  style={[
                    styles.langIconWrap,
                    { backgroundColor: `${langColor}22` },
                  ]}
                >
                  <Ionicons name="bug-outline" size={18} color={langColor} />
                </View>
                <View style={styles.titleCol}>
                  <Text style={styles.problemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.problemTopic}>{item.topic}</Text>
                </View>
                <View
                  style={[
                    styles.langBadge,
                    { backgroundColor: `${langColor}22` },
                  ]}
                >
                  <Text style={[styles.langBadgeText, { color: langColor }]}>
                    {LANG_LABELS[item.language]}
                  </Text>
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
        minWidth={280}
      />

      <AnchoredMenu
        visible={langPickerVisible}
        anchor={langAnchor.anchor}
        items={LANG_MENU}
        selectedKey={langFilter}
        onSelect={(key) => setLangFilter(key as LangFilter)}
        onClose={() => setLangPickerVisible(false)}
        align="right"
        minWidth={220}
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
  headerTitle: { ...typography.displaySmall, color: colors.ink },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
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
