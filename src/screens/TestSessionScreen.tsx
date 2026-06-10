import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography } from '../theme';
import { TestStackParamList } from '../navigation';
import { AlgorithmProblemView } from './ProblemScreen';
import { BugFixProblemView } from './BugFixScreen';
import { SystemDesignProblemView } from './SystemDesignScreen';
import { useTestStore } from '../store/useTestStore';
import {
  BUILT_IN_TEMPLATES,
  TestItem,
  ItemOutcome,
  SECTION_META,
  buildSession,
  formatClock,
  itemTitle,
  getProblem,
  getSystemDesignProblem,
  getBugFixProblem,
  getBehavioralQuestion,
  BehavioralQuestion,
} from '../data/testMode';

type Nav = NativeStackNavigationProp<TestStackParamList>;
type RouteP = RouteProp<TestStackParamList, 'TestSession'>;

interface RunTally {
  passed: number;
  total: number;
}

export default function TestSessionScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteP>();

  const template = useMemo(
    () =>
      BUILT_IN_TEMPLATES.find((t) => t.id === params.templateId) ??
      useTestStore.getState().getTemplate(params.templateId),
    [params.templateId],
  );
  // Sampled once on mount; replaying the same template re-samples fresh.
  const [items] = useState<TestItem[]>(() =>
    template ? buildSession(template) : [],
  );

  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(items[0]?.secondsBudget ?? 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Refs mirror state the 1s timer callback needs without stale closures.
  const secondsLeftRef = useRef(secondsLeft);
  const resultsRef = useRef<Record<string, RunTally>>({});
  const answersRef = useRef<Record<string, string>>({});
  const outcomesRef = useRef<ItemOutcome[]>([]);
  const finishedRef = useRef(false);
  const advanceRef = useRef<(timedOut: boolean) => void>(() => {});

  const item = items[index];
  const isLast = index === items.length - 1;

  const finalizeItem = (
    target: TestItem,
    timedOut: boolean,
    spentOverride?: number,
  ): ItemOutcome => {
    const base = {
      uid: target.uid,
      kind: target.kind,
      problemId: target.problemId,
      title: itemTitle(target.kind, target.problemId),
      secondsBudget: target.secondsBudget,
      secondsSpent:
        spentOverride ??
        Math.max(0, target.secondsBudget - Math.max(0, secondsLeftRef.current)),
      timedOut,
    };
    if (target.kind === 'behavioral') {
      const answered = !!answersRef.current[target.uid]?.trim();
      return {
        ...base,
        status: answered ? 'answered' : 'unanswered',
        score: answered ? 1 : 0,
        detail: answered ? 'Answered' : 'No answer',
      };
    }
    const tally = resultsRef.current[target.uid];
    if (!tally) {
      return { ...base, status: 'skipped', score: 0, detail: 'No attempt' };
    }
    if (tally.total === 0) {
      return { ...base, status: 'failed', score: 0, detail: "Code didn't run" };
    }
    const score = tally.passed / tally.total;
    const noun = target.kind === 'system-design' ? 'requirements' : 'tests';
    return {
      ...base,
      status: score >= 1 ? 'passed' : score > 0 ? 'partial' : 'failed',
      score,
      detail: `${tally.passed} / ${tally.total} ${noun}`,
    };
  };

  const goToResults = () => {
    navigation.replace('TestResults', {
      outcomes: outcomesRef.current,
      templateName: template?.name ?? 'Mock interview',
    });
  };

  const advance = (timedOut: boolean) => {
    if (finishedRef.current || !item) return;
    outcomesRef.current.push(finalizeItem(item, timedOut));
    if (isLast) {
      finishedRef.current = true;
      goToResults();
    } else {
      setIndex(index + 1);
    }
  };
  advanceRef.current = advance;

  // Per-question countdown. Restarts whenever the question changes.
  useEffect(() => {
    if (!items[index]) return;
    secondsLeftRef.current = items[index].secondsBudget;
    setSecondsLeft(items[index].secondsBudget);
    const timer = setInterval(() => {
      secondsLeftRef.current -= 1;
      setSecondsLeft(secondsLeftRef.current);
      if (secondsLeftRef.current <= 0) {
        clearInterval(timer);
        advanceRef.current(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [index]);

  const recordResult = (uid: string, r: RunTally) => {
    const prev = resultsRef.current[uid];
    const prevScore = prev && prev.total > 0 ? prev.passed / prev.total : 0;
    const nextScore = r.total > 0 ? r.passed / r.total : 0;
    if (!prev || nextScore >= prevScore) {
      resultsRef.current[uid] = r;
    }
  };

  const handleNext = () => {
    if (!item) return;
    const attempted =
      item.kind === 'behavioral'
        ? !!answersRef.current[item.uid]?.trim()
        : !!resultsRef.current[item.uid];
    if (!attempted) {
      Alert.alert(
        'Skip this question?',
        item.kind === 'behavioral'
          ? "You haven't written an answer yet."
          : "You haven't submitted a result yet — it will count as skipped.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Skip', style: 'destructive', onPress: () => advance(false) },
        ],
      );
      return;
    }
    advance(false);
  };

  const endAndScore = () => {
    if (finishedRef.current || !item) return;
    finishedRef.current = true;
    outcomesRef.current.push(finalizeItem(item, false));
    for (let i = index + 1; i < items.length; i++) {
      outcomesRef.current.push(finalizeItem(items[i], false, 0));
    }
    goToResults();
  };

  const confirmExit = () => {
    Alert.alert(
      'Leave interview?',
      'End now to score what you have, or discard this attempt.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End & score', onPress: endAndScore },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  if (!template || items.length === 0 || !item) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.inkLighter} />
          <Text style={styles.emptyText}>
            Couldn't build this interview. The template may have been deleted.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const meta = SECTION_META[item.kind];
  const lowTime = secondsLeft <= 60;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Session chrome */}
      <View style={styles.sessionHeader}>
        <TouchableOpacity onPress={confirmExit} style={styles.exitBtn} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.progressText}>
            Question {index + 1} of {items.length}
          </Text>
          <View style={styles.kindRow}>
            <Ionicons name={meta.icon as any} size={12} color={meta.color} />
            <Text style={[styles.kindText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        <View style={[styles.timerChip, lowTime && styles.timerChipLow]}>
          <Ionicons
            name="time-outline"
            size={14}
            color={lowTime ? colors.error : colors.ink}
          />
          <Text style={[styles.timerText, lowTime && styles.timerTextLow]}>
            {formatClock(secondsLeft)}
          </Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} activeOpacity={0.85} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{isLast ? 'Finish' : 'Next'}</Text>
          <Ionicons
            name={isLast ? 'flag' : 'arrow-forward'}
            size={13}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / items.length) * 100}%`, backgroundColor: meta.color },
          ]}
        />
      </View>

      {/* Current question — keyed by uid so each question mounts fresh */}
      <View style={{ flex: 1 }}>
        <SessionItem
          key={item.uid}
          item={item}
          answer={answers[item.uid] ?? ''}
          onAnswerChange={(text) => {
            answersRef.current[item.uid] = text;
            setAnswers((prev) => ({ ...prev, [item.uid]: text }));
          }}
          onResult={(r) => recordResult(item.uid, r)}
        />
      </View>
    </SafeAreaView>
  );
}

function SessionItem({
  item,
  answer,
  onAnswerChange,
  onResult,
}: {
  item: TestItem;
  answer: string;
  onAnswerChange: (text: string) => void;
  onResult: (r: RunTally) => void;
}) {
  switch (item.kind) {
    case 'algorithms': {
      const problem = getProblem(item.problemId);
      if (!problem) return <MissingProblem />;
      return <AlgorithmProblemView problem={problem} embedded onResult={onResult} />;
    }
    case 'bug-fix': {
      const problem = getBugFixProblem(item.problemId);
      if (!problem) return <MissingProblem />;
      return <BugFixProblemView problem={problem} embedded onResult={onResult} />;
    }
    case 'system-design': {
      const problem = getSystemDesignProblem(item.problemId);
      if (!problem) return <MissingProblem />;
      return <SystemDesignProblemView problem={problem} embedded onResult={onResult} />;
    }
    case 'behavioral': {
      const question = getBehavioralQuestion(item.problemId);
      if (!question) return <MissingProblem />;
      return (
        <BehavioralAnswerView
          question={question}
          value={answer}
          onChange={onAnswerChange}
        />
      );
    }
  }
}

function BehavioralAnswerView({
  question,
  value,
  onChange,
}: {
  question: BehavioralQuestion;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.behavioralContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.behavioralLabel}>QUESTION</Text>
        <Text style={styles.behavioralPrompt}>{question.prompt}</Text>

        {question.hint && (
          <View style={styles.hintCard}>
            <Text style={styles.hintLabel}>WHAT INTERVIEWERS LISTEN FOR</Text>
            <Text style={styles.hintText}>{question.hint}</Text>
          </View>
        )}

        <Text style={styles.behavioralLabel}>YOUR ANSWER</Text>
        <TextInput
          style={styles.answerInput}
          multiline
          value={value}
          onChangeText={onChange}
          placeholder="Answer out loud like a real interview, then capture the key beats of your STAR story here…"
          placeholderTextColor={colors.inkLighter}
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MissingProblem() {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="help-circle-outline" size={32} color={colors.inkLighter} />
      <Text style={styles.emptyText}>
        This problem is unavailable. Use Next to skip it.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  exitBtn: { padding: 2 },
  headerCenter: { flex: 1 },
  progressText: { ...typography.labelLarge, color: colors.ink },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  kindText: { ...typography.labelSmall, fontWeight: '700' },

  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 72,
    justifyContent: 'center',
  },
  timerChipLow: {
    backgroundColor: `${colors.error}14`,
    borderColor: colors.error,
  },
  timerText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  timerTextLow: { color: colors.error },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  nextBtnText: { ...typography.labelMedium, color: colors.white },

  progressBar: {
    height: 3,
    backgroundColor: colors.border,
  },
  progressFill: { height: 3 },

  behavioralContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  behavioralLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  behavioralPrompt: {
    ...typography.headlineMedium,
    color: colors.ink,
    lineHeight: 26,
  },
  hintCard: {
    backgroundColor: `${colors.secondary}12`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  hintLabel: {
    ...typography.labelSmall,
    color: colors.secondary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  hintText: { ...typography.bodyMedium, color: colors.ink, lineHeight: 20 },
  answerInput: {
    ...typography.bodyMedium,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 220,
    color: colors.ink,
    lineHeight: 22,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
  },
  emptyBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
  },
  emptyBtnText: { ...typography.labelLarge, color: colors.white },
});
