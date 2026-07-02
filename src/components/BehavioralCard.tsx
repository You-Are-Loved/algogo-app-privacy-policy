import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { BehavioralQuestion } from '../data/behavioral';

const STORAGE_PREFIX = '@algogo_behavioral_';
const AUTOSAVE_MS = 600;

interface Props {
  question: BehavioralQuestion;
  locked?: boolean;
  onLockTap?: () => void;
}

export default function BehavioralCard({ question, locked, onLockTap }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [answer, setAnswer] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted answer.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_PREFIX + question.id);
        if (!cancelled && v != null) setAnswer(v);
      } catch {}
      if (!cancelled) setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [question.id]);

  const onChange = (raw: string) => {
    // Pressing return on the soft keyboard dismisses it (and we strip the
    // newline so we don't bake stray \n's into the saved answer).
    let next = raw;
    if (raw.endsWith('\n') && raw.length > answer.length) {
      next = raw.slice(0, -1);
      Keyboard.dismiss();
    }
    setAnswer(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_PREFIX + question.id, next).catch(() => {});
      setSavedAt(Date.now());
    }, AUTOSAVE_MS);
  };

  const onBlur = () => {
    // Flush any pending debounced save immediately.
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    AsyncStorage.setItem(STORAGE_PREFIX + question.id, answer).catch(() => {});
    setSavedAt(Date.now());
  };

  const hasAnswer = loaded && answer.trim().length > 0;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        activeOpacity={0.7}
        onPress={() => {
          if (locked) {
            onLockTap?.();
            return;
          }
          setExpanded((v) => !v);
        }}
      >
        <View style={styles.numberWrap}>
          <Text style={styles.numberText}>
            {String(question.number).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.prompt}>{question.prompt}</Text>
          <Text style={styles.meta}>
            {locked
              ? 'Pro question'
              : hasAnswer
              ? `${wordCount} word${wordCount === 1 ? '' : 's'} saved`
              : 'No answer yet'}
          </Text>
        </View>
        {locked ? (
          <Ionicons name="lock-closed" size={16} color={colors.inkLighter} />
        ) : (
          <>
            {hasAnswer && (
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            )}
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.inkLighter}
            />
          </>
        )}
      </TouchableOpacity>

      {!locked && expanded && (
        <Animated.View entering={FadeInDown.duration(180)} style={styles.body}>
          {question.hint && (
            <View style={styles.hintRow}>
              <Ionicons name="bulb-outline" size={14} color={colors.inkLight} />
              <Text style={styles.hintText}>{question.hint}</Text>
            </View>
          )}
          <TextInput
            value={answer}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Draft your answer here…"
            placeholderTextColor={colors.inkLighter}
            multiline
            textAlignVertical="top"
            style={styles.input}
            scrollEnabled={false}
          />
          <View style={styles.footerRow}>
            <Text style={styles.footerHint}>Saves as you type</Text>
            {savedAt && (
              <Animated.View entering={FadeIn.duration(150)}>
                <Text style={styles.footerSaved}>Saved</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
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
  prompt: { ...typography.labelLarge, color: colors.ink },
  meta: { ...typography.labelSmall, color: colors.inkLight, marginTop: 2 },
  body: {
    marginTop: spacing.md,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  hintText: {
    ...typography.labelSmall,
    color: colors.inkLight,
    flex: 1,
    lineHeight: 18,
  },
  input: {
    minHeight: 140,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontFamily: 'System',
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  footerHint: {
    ...typography.labelSmall,
    color: colors.inkLighter,
  },
  footerSaved: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
