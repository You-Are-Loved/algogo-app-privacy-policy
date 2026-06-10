import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { TestStackParamList } from '../navigation';
import { useTestStore } from '../store/useTestStore';
import {
  TestTemplate,
  SectionConfig,
  SectionKind,
  SECTION_META,
  ALL_DIFFICULTIES,
  ALL_LANGUAGES,
  LANGUAGE_LABELS,
  TIME_CHOICES,
  MAX_PER_SECTION,
  BUILT_IN_TEMPLATES,
  createBlankTemplate,
  genId,
  poolForSection,
  estimateQuestions,
  estimateSeconds,
  formatMinutesLabel,
  isRunnable,
  topicsForKind,
  Difficulty,
  BugFixLanguage,
} from '../data/testMode';

type Nav = NativeStackNavigationProp<TestStackParamList>;
type RouteP = RouteProp<TestStackParamList, 'TestBuilder'>;

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: colors.primary,
  Medium: colors.accent,
  Hard: colors.error,
};

function cloneAsNew(src: TestTemplate): TestTemplate {
  const now = Date.now();
  return {
    ...src,
    id: genId(),
    name: src.builtIn ? src.name : `${src.name} (copy)`,
    builtIn: false,
    createdAt: now,
    updatedAt: now,
    sections: src.sections.map((s) => ({
      ...s,
      difficulties: [...s.difficulties],
      topics: [...s.topics],
      languages: [...s.languages],
    })),
  };
}

/** Toggle a value in a multi-select, refusing to empty the list below `min`. */
function toggleIn<T>(list: T[], value: T, min = 1): T[] {
  if (list.includes(value)) {
    if (list.length <= min) return list;
    return list.filter((x) => x !== value);
  }
  return [...list, value];
}

export default function TestBuilderScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteP>();
  const saveTemplate = useTestStore((s) => s.saveTemplate);

  const [template, setTemplate] = useState<TestTemplate>(() => {
    if (params?.templateId) {
      const existing = useTestStore.getState().getTemplate(params.templateId);
      // Deep copy so edits don't mutate the persisted object until Save.
      if (existing) return JSON.parse(JSON.stringify(existing));
    }
    if (params?.duplicateFrom) {
      const src =
        BUILT_IN_TEMPLATES.find((t) => t.id === params.duplicateFrom) ??
        useTestStore.getState().getTemplate(params.duplicateFrom);
      if (src) return cloneAsNew(src);
    }
    return createBlankTemplate();
  });
  const [topicPickerKind, setTopicPickerKind] = useState<SectionKind | null>(null);

  const isEditing = !!params?.templateId;

  const updateSection = (kind: SectionKind, patch: Partial<SectionConfig>) => {
    setTemplate((t) => ({
      ...t,
      sections: t.sections.map((s) => (s.kind === kind ? { ...s, ...patch } : s)),
    }));
  };

  const totalQuestions = estimateQuestions(template);
  const totalTime = formatMinutesLabel(estimateSeconds(template));

  const handleSave = (thenRun: boolean) => {
    const finalTemplate = {
      ...template,
      name: template.name.trim() || 'My mock interview',
    };
    if (!isRunnable(finalTemplate)) {
      Alert.alert(
        'Nothing to run',
        'Enable at least one section, and make sure its filters match at least one problem.',
      );
      return;
    }
    saveTemplate(finalTemplate);
    if (thenRun) {
      navigation.replace('TestSession', { templateId: finalTemplate.id });
    } else {
      navigation.goBack();
    }
  };

  const pickerSection = topicPickerKind
    ? template.sections.find((s) => s.kind === topicPickerKind)
    : null;
  const pickerTopics = topicPickerKind ? topicsForKind(topicPickerKind) : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit interview' : 'New interview'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Text style={styles.fieldLabel}>NAME</Text>
        <TextInput
          style={styles.nameInput}
          value={template.name}
          onChangeText={(name) => setTemplate((t) => ({ ...t, name }))}
          placeholder="My mock interview"
          placeholderTextColor={colors.inkLighter}
          returnKeyType="done"
        />

        <Text style={styles.fieldLabel}>SECTIONS</Text>
        {template.sections.map((cfg) => (
          <SectionEditor
            key={cfg.kind}
            cfg={cfg}
            onChange={(patch) => updateSection(cfg.kind, patch)}
            onOpenTopics={() => setTopicPickerKind(cfg.kind)}
          />
        ))}
      </ScrollView>

      {/* Summary + save */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Ionicons name="list-outline" size={14} color={colors.inkLight} />
          <Text style={styles.summaryText}>
            {totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'}
          </Text>
          <Ionicons name="time-outline" size={14} color={colors.inkLight} />
          <Text style={styles.summaryText}>{totalTime}</Text>
        </View>
        <View style={styles.footerBtns}>
          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.85}
            onPress={() => handleSave(false)}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveRunBtn}
            activeOpacity={0.85}
            onPress={() => handleSave(true)}
          >
            <Ionicons name="play" size={15} color={colors.white} />
            <Text style={styles.saveRunBtnText}>Save & start</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Topic picker */}
      <Modal
        visible={topicPickerKind !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setTopicPickerKind(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTopicPickerKind(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Topics</Text>
              <TouchableOpacity onPress={() => setTopicPickerKind(null)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.inkLight} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.topicRow}
                onPress={() =>
                  topicPickerKind && updateSection(topicPickerKind, { topics: [] })
                }
              >
                <Ionicons
                  name={
                    pickerSection && pickerSection.topics.length === 0
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={20}
                  color={
                    pickerSection && pickerSection.topics.length === 0
                      ? colors.primary
                      : colors.inkLighter
                  }
                />
                <Text style={styles.topicRowText}>All topics</Text>
              </TouchableOpacity>
              {pickerTopics.map((topic) => {
                const selected = pickerSection?.topics.includes(topic) ?? false;
                return (
                  <TouchableOpacity
                    key={topic}
                    style={styles.topicRow}
                    onPress={() => {
                      if (!topicPickerKind || !pickerSection) return;
                      // Unchecking the last topic falls back to "all".
                      const next = selected
                        ? pickerSection.topics.filter((t) => t !== topic)
                        : [...pickerSection.topics, topic];
                      updateSection(topicPickerKind, { topics: next });
                    }}
                  >
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={selected ? colors.primary : colors.inkLighter}
                    />
                    <Text style={styles.topicRowText}>{topic}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SectionEditor({
  cfg,
  onChange,
  onOpenTopics,
}: {
  cfg: SectionConfig;
  onChange: (patch: Partial<SectionConfig>) => void;
  onOpenTopics: () => void;
}) {
  const meta = SECTION_META[cfg.kind];
  const pool = poolForSection(cfg);
  const maxCount = Math.max(1, Math.min(MAX_PER_SECTION, pool.length));

  return (
    <View style={[styles.sectionCard, !cfg.enabled && styles.sectionCardOff]}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIcon, { backgroundColor: `${meta.color}18` }]}>
          <Ionicons name={meta.icon as any} size={18} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{meta.label}</Text>
          <Text style={styles.sectionPool}>
            {cfg.enabled
              ? `${pool.length} of ${meta.poolTotal} problems match`
              : 'Off'}
          </Text>
        </View>
        <Switch
          value={cfg.enabled}
          onValueChange={(enabled) => onChange({ enabled })}
          trackColor={{ true: meta.color }}
        />
      </View>

      {cfg.enabled && (
        <>
          {/* Count stepper */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Questions</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepBtn, cfg.count <= 1 && styles.stepBtnOff]}
                disabled={cfg.count <= 1}
                onPress={() => onChange({ count: cfg.count - 1 })}
              >
                <Ionicons name="remove" size={18} color={colors.ink} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{Math.min(cfg.count, maxCount)}</Text>
              <TouchableOpacity
                style={[styles.stepBtn, cfg.count >= maxCount && styles.stepBtnOff]}
                disabled={cfg.count >= maxCount}
                onPress={() => onChange({ count: Math.min(cfg.count + 1, maxCount) })}
              >
                <Ionicons name="add" size={18} color={colors.ink} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Time per question */}
          <Text style={styles.controlLabel}>Time per question</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            {TIME_CHOICES.map((seconds) => {
              const active = cfg.secondsPerQuestion === seconds;
              return (
                <TouchableOpacity
                  key={seconds}
                  style={[styles.chip, active && { backgroundColor: meta.color, borderColor: meta.color }]}
                  onPress={() => onChange({ secondsPerQuestion: seconds })}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {formatMinutesLabel(seconds)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Difficulty */}
          {meta.hasDifficulty && (
            <>
              <Text style={styles.controlLabel}>Difficulty</Text>
              <View style={styles.chipWrap}>
                {ALL_DIFFICULTIES.map((d) => {
                  const active = cfg.difficulties.includes(d);
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.chip,
                        active && {
                          backgroundColor: `${DIFF_COLORS[d]}18`,
                          borderColor: DIFF_COLORS[d],
                        },
                      ]}
                      onPress={() =>
                        onChange({ difficulties: toggleIn(cfg.difficulties, d) })
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && { color: DIFF_COLORS[d], fontWeight: '700' },
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Languages (bug fix) */}
          {meta.hasLanguages && (
            <>
              <Text style={styles.controlLabel}>Languages</Text>
              <View style={styles.chipWrap}>
                {ALL_LANGUAGES.map((lang: BugFixLanguage) => {
                  const active = cfg.languages.includes(lang);
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.chip,
                        active && {
                          backgroundColor: `${meta.color}18`,
                          borderColor: meta.color,
                        },
                      ]}
                      onPress={() =>
                        onChange({ languages: toggleIn(cfg.languages, lang) })
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && { color: meta.color, fontWeight: '700' },
                        ]}
                      >
                        {LANGUAGE_LABELS[lang]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Topics */}
          {meta.hasTopics && (
            <TouchableOpacity style={styles.topicBtn} onPress={onOpenTopics}>
              <Ionicons name="pricetags-outline" size={15} color={colors.inkLight} />
              <Text style={styles.topicBtnText}>
                {cfg.topics.length === 0
                  ? 'All topics'
                  : `${cfg.topics.length} ${cfg.topics.length === 1 ? 'topic' : 'topics'}`}
              </Text>
              <Ionicons name="chevron-forward" size={15} color={colors.inkLighter} />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...typography.headlineLarge, color: colors.ink },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    letterSpacing: 1.4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  nameInput: {
    ...typography.bodyLarge,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.ink,
  },

  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionCardOff: { opacity: 0.75 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { ...typography.headlineSmall, color: colors.ink },
  sectionPool: { ...typography.labelSmall, color: colors.inkLight, marginTop: 1 },

  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  controlLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnOff: { opacity: 0.4 },
  stepValue: {
    ...typography.headlineMedium,
    color: colors.ink,
    minWidth: 24,
    textAlign: 'center',
  },

  chipScroll: { gap: spacing.xs, paddingVertical: 2 },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipText: { ...typography.labelMedium, color: colors.inkLight },
  chipTextActive: { color: colors.white, fontWeight: '700' },

  topicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  topicBtnText: { ...typography.labelMedium, color: colors.ink },

  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginRight: spacing.md,
  },
  footerBtns: { flexDirection: 'row', gap: spacing.sm },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: colors.white,
  },
  saveBtnText: { ...typography.labelLarge, color: colors.ink },
  saveRunBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  saveRunBtnText: { ...typography.labelLarge, color: colors.white },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 25, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  modalGrabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.headlineSmall, color: colors.ink },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topicRowText: { ...typography.bodyMedium, color: colors.ink },
});
