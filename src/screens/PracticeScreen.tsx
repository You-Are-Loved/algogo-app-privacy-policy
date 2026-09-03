import React, { useMemo, useState } from 'react';
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
import { bugFixProblems, BugFixLanguage } from '../data/bugFixes';
import { sqlProblems } from '../data/sqlProblems';
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

type Category =
  | 'algorithms'
  | 'system-design'
  | 'python'
  | 'javascript'
  | 'java'
  | 'sql'
  | 'behavioral';

const SQL_COLOR = '#336791';

// First N of each category are free; the rest gate behind Pro.
const FREE_LIMIT = 2;
const CATEGORIES: {
  key: Category;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle: string;
}[] = [
  {
    key: 'algorithms',
    label: 'Algorithms',
    icon: 'code-slash-outline',
    color: '#8B5CF6',
    subtitle: `${blind75.length} problems · real Python runtime`,
  },
  {
    key: 'system-design',
    label: 'System Design',
    icon: 'server-outline',
    color: '#636E72',
    subtitle: `${systemDesignProblems.length} problems · self-grading canvas`,
  },
  {
    key: 'python',
    label: 'Python',
    icon: 'logo-python',
    color: LANG_COLORS.python,
    subtitle: `${bugFixProblems.filter((p) => p.language === 'python').length} debugging challenges`,
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    icon: 'logo-javascript',
    color: '#C9A800',
    subtitle: `${bugFixProblems.filter((p) => p.language === 'javascript').length} debugging challenges`,
  },
  {
    key: 'java',
    label: 'Java',
    icon: 'cafe-outline',
    color: LANG_COLORS.java,
    subtitle: `${bugFixProblems.filter((p) => p.language === 'java').length} debugging challenges`,
  },
  {
    key: 'sql',
    label: 'SQL',
    icon: 'grid-outline',
    color: SQL_COLOR,
    subtitle: `${sqlProblems.length} queries · live SQLite grading`,
  },
  {
    key: 'behavioral',
    label: 'Behavioral',
    icon: 'chatbubbles-outline',
    color: '#EC4899',
    subtitle: `${behavioralQuestions.length} prompts · notes that save`,
  },
];

const CATEGORY_MENU: AnchoredMenuItem[] = CATEGORIES.map((c) => ({
  key: c.key,
  title: c.label,
  icon: c.icon,
  color: c.color,
  subtitle: c.subtitle,
}));

const isDebugCategory = (c: Category): c is BugFixLanguage =>
  c === 'python' || c === 'javascript' || c === 'java';

export default function PracticeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isSubscribed } = useSubscriptionContext();
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [category, setCategory] = useState<Category>('algorithms');
  const [pickerVisible, setPickerVisible] = useState(false);
  const categoryAnchor = useAnchor();

  const activeCategory = CATEGORIES.find((c) => c.key === category)!;
  const problems = useMemo(
    () => (category === 'algorithms' ? blind75 : []),
    [category],
  );
  const visibleBugFixes = useMemo(
    () => (isDebugCategory(category) ? bugFixProblems.filter((p) => p.language === category) : []),
    [category],
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

  const handleSqlPress = (problemId: string, number: number) => {
    if (!isSubscribed && number > FREE_LIMIT) {
      setUpgradeVisible(true);
      return;
    }
    navigation.navigate('SqlProblem', { problemId });
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
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : isDebugCategory(category) ? (
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
                  <Ionicons name={activeCategory.icon} size={18} color={langColor} />
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
