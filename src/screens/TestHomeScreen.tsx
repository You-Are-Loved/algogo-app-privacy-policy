import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { TestStackParamList } from '../navigation';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import UpgradeModal from '../components/UpgradeModal';
import { useTestStore } from '../store/useTestStore';
import {
  BUILT_IN_TEMPLATES,
  TestTemplate,
  SECTION_META,
  plannedCount,
  estimateQuestions,
  estimateSeconds,
  formatMinutesLabel,
  isRunnable,
} from '../data/testMode';

type Nav = NativeStackNavigationProp<TestStackParamList>;

export default function TestHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { isSubscribed, toggleDevSubscription } = useSubscriptionContext();
  const templates = useTestStore((s) => s.templates);
  const deleteTemplate = useTestStore((s) => s.deleteTemplate);
  const [upgradeVisible, setUpgradeVisible] = useState(false);

  // All entry points gate behind Pro — mock interviews are a Pro feature.
  const gated = (fn: () => void) => () => {
    if (!isSubscribed) {
      setUpgradeVisible(true);
      return;
    }
    fn();
  };

  const handleRun = (template: TestTemplate) =>
    gated(() => {
      if (!isRunnable(template)) {
        Alert.alert(
          'Nothing to run',
          'This template has no questions. Edit it and enable at least one section.',
        );
        return;
      }
      navigation.navigate('TestSession', { templateId: template.id });
    })();

  const handleDelete = (template: TestTemplate) => {
    Alert.alert('Delete template?', `"${template.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTemplate(template.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — long-press the title in dev builds to toggle the Pro flag */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.headerTitle}
              onLongPress={__DEV__ ? toggleDevSubscription : undefined}
            >
              Mock Interview
            </Text>
            <Text style={styles.headerSub}>
              Timed, multi-round interview simulations
            </Text>
          </View>
          {isSubscribed && (
            <View style={styles.proBadge}>
              <Ionicons name="star" size={10} color={colors.white} />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {!isSubscribed && (
          <TouchableOpacity
            style={styles.lockBanner}
            activeOpacity={0.85}
            onPress={() => setUpgradeVisible(true)}
          >
            <Ionicons name="lock-closed" size={18} color={colors.accent} />
            <Text style={styles.lockBannerText}>
              Mock interviews are part of Algogo Pro. Tap to unlock.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </TouchableOpacity>
        )}

        {/* Build your own */}
        <TouchableOpacity
          style={styles.createCard}
          activeOpacity={0.85}
          onPress={gated(() => navigation.navigate('TestBuilder', {}))}
        >
          <View style={styles.createIcon}>
            <Ionicons name="add" size={24} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.createTitle}>Build your own</Text>
            <Text style={styles.createSub}>
              Pick sections, difficulty, topics and timing
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkLighter} />
        </TouchableOpacity>

        {/* User templates */}
        {templates.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>MY TEMPLATES</Text>
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onRun={() => handleRun(t)}
                onEdit={gated(() =>
                  navigation.navigate('TestBuilder', { templateId: t.id }),
                )}
                onDelete={() => handleDelete(t)}
              />
            ))}
          </>
        )}

        {/* Built-in presets */}
        <Text style={styles.sectionLabel}>STARTER PRESETS</Text>
        {BUILT_IN_TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onRun={() => handleRun(t)}
            onDuplicate={gated(() =>
              navigation.navigate('TestBuilder', { duplicateFrom: t.id }),
            )}
          />
        ))}
      </ScrollView>

      <UpgradeModal
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        categoryName="Mock Interview"
      />
    </SafeAreaView>
  );
}

function TemplateCard({
  template,
  onRun,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: TestTemplate;
  onRun: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}) {
  const questions = estimateQuestions(template);
  const duration = formatMinutesLabel(estimateSeconds(template));
  const activeSections = template.sections.filter((s) => plannedCount(s) > 0);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {template.name}
          </Text>
          <Text style={styles.cardMeta}>
            {questions} {questions === 1 ? 'question' : 'questions'} · {duration}
          </Text>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="pencil-outline" size={18} color={colors.inkLight} />
          </TouchableOpacity>
        )}
        {onDuplicate && (
          <TouchableOpacity
            onPress={onDuplicate}
            style={styles.iconBtn}
            hitSlop={8}
            accessibilityLabel="Customize a copy"
          >
            <Ionicons name="copy-outline" size={18} color={colors.inkLight} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chipRow}>
        {activeSections.map((s) => {
          const meta = SECTION_META[s.kind];
          return (
            <View
              key={s.kind}
              style={[styles.kindChip, { backgroundColor: `${meta.color}18` }]}
            >
              <Ionicons name={meta.icon as any} size={12} color={meta.color} />
              <Text style={[styles.kindChipText, { color: meta.color }]}>
                {meta.short} ×{plannedCount(s)}
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.runBtn} activeOpacity={0.85} onPress={onRun}>
        <Ionicons name="play" size={15} color={colors.white} />
        <Text style={styles.runBtnText}>Start interview</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerTitle: { ...typography.displaySmall, color: colors.ink },
  headerSub: {
    ...typography.bodySmall,
    color: colors.inkLight,
    marginTop: 2,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.purpleDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  proBadgeText: { ...typography.labelSmall, color: colors.white },

  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.accent}14`,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  lockBannerText: { ...typography.labelMedium, color: colors.ink, flex: 1 },

  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTitle: { ...typography.headlineSmall, color: colors.ink },
  createSub: { ...typography.bodySmall, color: colors.inkLight, marginTop: 1 },

  sectionLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardTitle: { ...typography.headlineSmall, color: colors.ink },
  cardMeta: { ...typography.labelSmall, color: colors.inkLight, marginTop: 2 },
  iconBtn: { padding: spacing.xs },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  kindChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  kindChipText: { ...typography.labelSmall, fontWeight: '700' },

  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
  },
  runBtnText: { ...typography.labelLarge, color: colors.white },
});
