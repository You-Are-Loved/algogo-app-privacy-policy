import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { TestStackParamList } from '../navigation';
import {
  ItemOutcome,
  ItemStatus,
  SECTION_META,
  scoreSession,
  formatClock,
} from '../data/testMode';

type Nav = NativeStackNavigationProp<TestStackParamList>;
type RouteP = RouteProp<TestStackParamList, 'TestResults'>;

const STATUS_UI: Record<ItemStatus, { icon: string; color: string; label: string }> = {
  passed: { icon: 'checkmark-circle', color: colors.primary, label: 'Passed' },
  partial: { icon: 'remove-circle', color: colors.accent, label: 'Partial' },
  failed: { icon: 'close-circle', color: colors.error, label: 'Failed' },
  skipped: { icon: 'play-skip-forward-circle', color: colors.inkLighter, label: 'Skipped' },
  answered: { icon: 'chatbubble-ellipses', color: colors.secondary, label: 'Answered' },
  unanswered: { icon: 'chatbubble-outline', color: colors.inkLighter, label: 'No answer' },
};

function gradeColor(percent: number): string {
  if (percent >= 75) return colors.primary;
  if (percent >= 45) return colors.accent;
  return colors.error;
}

function gradeLine(percent: number): string {
  if (percent >= 90) return 'Outstanding — you’re interview ready.';
  if (percent >= 75) return 'Strong performance. Polish the misses and go again.';
  if (percent >= 45) return 'Solid base — drill the sections that slipped.';
  return 'Rough round. Review the breakdown and rematch.';
}

export default function TestResultsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteP>();
  const { outcomes, templateName } = params;

  const score = useMemo(() => scoreSession(outcomes), [outcomes]);
  const ringColor = gradeColor(score.percent);
  const hasBehavioral = score.answered + score.unanswered > 0;

  const stats: { label: string; value: number; color: string }[] = [
    { label: 'Passed', value: score.passed, color: colors.primary },
    { label: 'Partial', value: score.partial, color: colors.accent },
    { label: 'Failed', value: score.failed, color: colors.error },
    { label: 'Skipped', value: score.skipped, color: colors.inkLighter },
    ...(hasBehavioral
      ? [
          { label: 'Answered', value: score.answered, color: colors.secondary },
          { label: 'No answer', value: score.unanswered, color: colors.inkLighter },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Interview complete</Text>
        <Text style={styles.headerSub}>{templateName}</Text>

        {/* Score ring */}
        <View style={styles.ringWrap}>
          <View style={[styles.ring, { borderColor: ringColor }]}>
            <Text style={[styles.ringPercent, { color: ringColor }]}>
              {score.percent}%
            </Text>
            <Text style={styles.ringCaption}>overall</Text>
          </View>
          <Text style={styles.gradeLine}>{gradeLine(score.percent)}</Text>
          {hasBehavioral && score.objectiveItems > 0 && (
            <Text style={styles.objectiveLine}>
              {score.objectivePercent}% on the {score.objectiveItems} coding & design{' '}
              {score.objectiveItems === 1 ? 'question' : 'questions'}
            </Text>
          )}
        </View>

        {/* Tally */}
        <View style={styles.statsRow}>
          {stats
            .filter((s) => s.value > 0)
            .map((s) => (
              <View key={s.label} style={styles.statChip}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
        </View>

        {/* Per-question breakdown */}
        <Text style={styles.sectionLabel}>BREAKDOWN</Text>
        {outcomes.map((o, i) => (
          <OutcomeRow key={o.uid} outcome={o} index={i} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.85}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function OutcomeRow({ outcome, index }: { outcome: ItemOutcome; index: number }) {
  const status = STATUS_UI[outcome.status];
  const meta = SECTION_META[outcome.kind];

  return (
    <View style={styles.outcomeRow}>
      <Ionicons name={status.icon as any} size={22} color={status.color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.outcomeTitle} numberOfLines={2}>
          {index + 1}. {outcome.title}
        </Text>
        <Text style={styles.outcomeMeta}>
          {meta.short} · {outcome.detail} · {formatClock(outcome.secondsSpent)} spent
          {outcome.timedOut ? ' · timed out' : ''}
        </Text>
      </View>
      <Text style={[styles.outcomeStatus, { color: status.color }]}>
        {status.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.displaySmall,
    color: colors.ink,
    marginTop: spacing.md,
  },
  headerSub: { ...typography.bodyMedium, color: colors.inkLight, marginTop: 2 },

  ringWrap: { alignItems: 'center', marginTop: spacing.xl },
  ring: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  ringPercent: { ...typography.displayLarge, fontSize: 38, lineHeight: 44 },
  ringCaption: { ...typography.labelSmall, color: colors.inkLight },
  gradeLine: {
    ...typography.bodyMedium,
    color: colors.ink,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  objectiveLine: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statChip: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 72,
  },
  statValue: { ...typography.headlineMedium },
  statLabel: { ...typography.labelSmall, color: colors.inkLight, marginTop: 1 },

  sectionLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  outcomeTitle: { ...typography.labelLarge, color: colors.ink },
  outcomeMeta: { ...typography.labelSmall, color: colors.inkLight, marginTop: 2 },
  outcomeStatus: { ...typography.labelSmall, fontWeight: '700' },

  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  doneBtnText: { ...typography.labelLarge, color: colors.white, fontSize: 16 },
});
