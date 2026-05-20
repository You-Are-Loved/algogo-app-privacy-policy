import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
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
import { PracticeStackParamList } from '../navigation';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import UpgradeModal from '../components/UpgradeModal';
import BehavioralCard from '../components/BehavioralCard';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList>;

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

type Category = 'algorithms' | 'system-design' | 'behavioral';

// First N of each category are free; the rest gate behind Pro.
const FREE_LIMIT = 2;
const CATEGORIES: { key: Category; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'algorithms', label: 'Algorithms', icon: 'code-slash-outline' },
  { key: 'system-design', label: 'System Design', icon: 'server-outline' },
  { key: 'behavioral', label: 'Behavioral', icon: 'chatbubbles-outline' },
];

export default function PracticeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isSubscribed } = useSubscriptionContext();
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [category, setCategory] = useState<Category>('algorithms');
  const [pickerVisible, setPickerVisible] = useState(false);

  const activeCategory = CATEGORIES.find((c) => c.key === category)!;
  const problems = useMemo(
    () => (category === 'algorithms' ? blind75 : []),
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name={activeCategory.icon} size={16} color={colors.inkLight} />
          <Text style={styles.dropdownLabel}>{activeCategory.label}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.inkLight} />
        </TouchableOpacity>
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
                  style={styles.problemRow}
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

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setPickerVisible(false)}
        >
          <Pressable style={styles.pickerSheet} onPress={() => {}}>
            <View style={styles.pickerGrabber} />
            <Text style={styles.pickerTitle}>Category</Text>
            {CATEGORIES.map((c) => {
              const active = c.key === category;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.pickerRow, active && styles.pickerRowActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCategory(c.key);
                    setPickerVisible(false);
                  }}
                >
                  <Ionicons
                    name={c.icon}
                    size={20}
                    color={active ? colors.primary : colors.inkLight}
                  />
                  <Text
                    style={[styles.pickerRowText, active && styles.pickerRowTextActive]}
                  >
                    {c.label}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
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
  dropdownLabel: {
    ...typography.labelMedium,
    color: colors.ink,
    fontWeight: '600',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 25, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    ...shadows.lg,
  },
  pickerGrabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  pickerTitle: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  pickerRowActive: {
    backgroundColor: `${colors.primary}10`,
  },
  pickerRowText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
  },
  pickerRowTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  problemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  titleCol: { flex: 1 },
  problemTitle: { ...typography.labelLarge, color: colors.ink },
  problemTopic: { ...typography.labelSmall, color: colors.inkLight, marginTop: 1 },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  diffBadgeText: { ...typography.labelSmall, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    marginTop: spacing.sm,
  },
});
