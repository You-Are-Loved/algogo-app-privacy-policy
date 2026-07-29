import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Category } from '../types';
import { useStore } from '../store/useStore';

interface LearnTabProps {
  category: Category;
  catColors: { color: string; dark: string };
}

// Helper to parse content with bullet points
const parseContent = (content: string) => {
  const lines = content.split('\n');
  const result: { type: 'text' | 'bullet'; content: string }[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      result.push({ type: 'bullet', content: trimmed.replace(/^[•\-*]\s*/, '') });
    } else if (trimmed) {
      result.push({ type: 'text', content: trimmed });
    }
  });

  return result;
};

// Helper to get section ID (fallback to index-based ID if not present)
const getSectionId = (section: any, index: number, categoryId: string): string => {
  return section.id || `${categoryId}-section-${index}`;
};

// Language-agnostic detection of comment lines (//, #, --, /* */, <!-- -->)
// so explanatory comments read like they do in an editor. Preprocessor
// directives (#include etc.) are code, not comments.
const FULL_LINE_COMMENT =
  /^\s*(\/\/|\/\*|\*|--\s|#(?!include|pragma|define|ifdef|ifndef|if\s|else|elif|endif|undef|!)|<!--)/;

// Split an inline trailing comment off a code line, or null if none.
const splitInlineComment = (line: string): [string, string] | null => {
  const slashes = line.indexOf('//');
  if (slashes > 0 && /\s/.test(line[slashes - 1])) {
    return [line.slice(0, slashes), line.slice(slashes)];
  }
  for (const marker of [' # ', ' -- ']) {
    const idx = line.indexOf(marker);
    if (idx > 0) return [line.slice(0, idx), line.slice(idx)];
  }
  return null;
};

// Code text with comments tinted editor-green.
function CodeText({ code, style }: { code: string; style?: object }) {
  const lines = code.split('\n');
  return (
    <Text style={[styles.codeText, style]}>
      {lines.map((line, i) => {
        const tail = i < lines.length - 1 ? '\n' : '';
        if (FULL_LINE_COMMENT.test(line)) {
          return (
            <Text key={i} style={styles.codeComment}>
              {line + tail}
            </Text>
          );
        }
        const split = splitInlineComment(line);
        if (split) {
          return (
            <Text key={i}>
              {split[0]}
              <Text style={styles.codeComment}>{split[1]}</Text>
              {tail}
            </Text>
          );
        }
        return line + tail;
      })}
    </Text>
  );
}

export default function LearnTab({ category, catColors }: LearnTabProps) {
  const firstSectionId = getSectionId(category.learnContent[0], 0, category.id);
  const { viewLearnSection, getCategoryProgress } = useStore();
  const progress = getCategoryProgress(category.id);
  const insets = useSafeAreaInsets();
  const [fullscreenCode, setFullscreenCode] = useState<{ title: string; code: string } | null>(null);

  // Get viewed sections from store, default to first section
  const viewedSectionIds = progress.viewedLearnSectionIds || [];
  const viewedSections = new Set(viewedSectionIds.length > 0 ? viewedSectionIds : [firstSectionId]);

  // Initialize first section as viewed if no sections viewed yet
  React.useEffect(() => {
    if (viewedSectionIds.length === 0 && firstSectionId) {
      viewLearnSection(category.id, firstSectionId);
    }
  }, []);

  const [expandedSections, setExpandedSections] = useState<string[]>([firstSectionId]);

  const completedSections = viewedSections.size;
  const totalSections = category.learnContent.length;

  const toggleSection = (sectionId: string) => {
    const isCurrentlyExpanded = expandedSections.includes(sectionId);

    if (!isCurrentlyExpanded) {
      // Mark as viewed when expanding (persists to store)
      viewLearnSection(category.id, sectionId);
    }

    setExpandedSections(prev =>
      isCurrentlyExpanded
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Progress Header */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <Text style={[styles.progressCount, { color: catColors.color }]}>
            {completedSections}/{totalSections} sections viewed
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${(completedSections / totalSections) * 100}%`,
                  backgroundColor: catColors.color
                }
              ]}
            />
          </View>
        </View>
      </Animated.View>

      {/* Sections */}
      {category.learnContent.map((section, index) => {
        const sectionId = getSectionId(section, index, category.id);
        const isExpanded = expandedSections.includes(sectionId);
        const isViewed = viewedSections.has(sectionId);
        const parsedContent = parseContent(section.content);

        return (
          <Animated.View
            key={sectionId}
            entering={FadeInDown.delay(150 + index * 50)}
            layout={Layout.springify()}
            style={styles.sectionWrapper}
          >
            <TouchableOpacity
              style={[
                styles.sectionHeader,
                isExpanded && styles.sectionHeaderExpanded,
                isExpanded && { backgroundColor: `${catColors.color}08` },
              ]}
              onPress={() => toggleSection(sectionId)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.sectionNumber,
                { backgroundColor: isExpanded ? catColors.color : isViewed ? `${catColors.color}30` : `${catColors.color}15` }
              ]}>
                {isViewed && !isExpanded ? (
                  <Ionicons name="checkmark" size={18} color={catColors.color} />
                ) : (
                  <Text style={[
                    styles.sectionNumberText,
                    { color: isExpanded ? colors.white : catColors.color }
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={[
                  styles.sectionTitle,
                  isExpanded && { color: catColors.color }
                ]}>
                  {section.title}
                </Text>
                {!isExpanded && (
                  <Text style={styles.sectionPreview} numberOfLines={1}>
                    Tap to expand
                  </Text>
                )}
              </View>
              <View style={[
                styles.chevronContainer,
                isExpanded && { backgroundColor: `${catColors.color}15` }
              ]}>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={isExpanded ? catColors.color : colors.inkLight}
                />
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={styles.sectionContent}
              >
                {parsedContent.map((item, i) => (
                  item.type === 'bullet' ? (
                    <View key={i} style={styles.bulletItem}>
                      <View style={[styles.bulletDot, { backgroundColor: catColors.color }]} />
                      <Text style={styles.bulletText}>{item.content}</Text>
                    </View>
                  ) : (
                    <Text key={i} style={styles.contentText}>{item.content}</Text>
                  )
                ))}

                {section.codeExample && (
                  <View style={styles.codeBlock}>
                    <View style={[styles.codeHeader, { backgroundColor: catColors.dark }]}>
                      <View style={styles.codeHeaderDots}>
                        <View style={[styles.codeDot, { backgroundColor: '#FF5F56' }]} />
                        <View style={[styles.codeDot, { backgroundColor: '#FFBD2E' }]} />
                        <View style={[styles.codeDot, { backgroundColor: '#27CA40' }]} />
                      </View>
                      <Text style={styles.codeHeaderText}>Example Code</Text>
                      <TouchableOpacity
                        style={styles.codeExpandButton}
                        onPress={() =>
                          setFullscreenCode({ title: section.title, code: section.codeExample! })
                        }
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="expand-outline" size={14} color="rgba(255,255,255,0.85)" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.codeScrollView}
                    >
                      <CodeText code={section.codeExample} />
                    </ScrollView>
                  </View>
                )}
              </Animated.View>
            )}
          </Animated.View>
        );
      })}

      <View style={{ height: spacing['3xl'] }} />

      {/* Fullscreen code viewer */}
      <Modal
        visible={fullscreenCode !== null}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFullscreenCode(null)}
      >
        <View style={[styles.fullscreenContainer, { paddingTop: insets.top }]}>
          <View style={[styles.fullscreenHeader, { backgroundColor: catColors.dark }]}>
            <View style={styles.codeHeaderDots}>
              <View style={[styles.codeDot, { backgroundColor: '#FF5F56' }]} />
              <View style={[styles.codeDot, { backgroundColor: '#FFBD2E' }]} />
              <View style={[styles.codeDot, { backgroundColor: '#27CA40' }]} />
            </View>
            <Text style={styles.fullscreenTitle} numberOfLines={1}>
              {fullscreenCode?.title}
            </Text>
            <TouchableOpacity
              style={styles.fullscreenClose}
              onPress={() => setFullscreenCode(null)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="contract-outline" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.fullscreenScroll}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing['2xl'] }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fullscreenCodeContainer}
            >
              {fullscreenCode && (
                <CodeText code={fullscreenCode.code} style={styles.fullscreenCodeText} />
              )}
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Account for tab bar
  },
  progressHeader: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    ...shadows.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  progressCount: {
    ...typography.labelLarge,
  },
  progressBarContainer: {
    height: 8,
  },
  progressBarBg: {
    height: '100%',
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  sectionWrapper: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  sectionHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  sectionNumber: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    ...typography.labelLarge,
    fontWeight: '700',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  sectionPreview: {
    ...typography.bodySmall,
    color: colors.inkLighter,
    marginTop: 2,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderDark,
    padding: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.sm,
  },
  contentText: {
    ...typography.bodyMedium,
    color: colors.ink,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: spacing.md,
  },
  bulletText: {
    ...typography.bodyMedium,
    color: colors.ink,
    flex: 1,
    lineHeight: 22,
  },
  codeBlock: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
    backgroundColor: '#1E1E1E',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  codeHeaderDots: {
    flexDirection: 'row',
    gap: 6,
    marginRight: spacing.md,
  },
  codeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  codeHeaderText: {
    ...typography.labelSmall,
    color: 'rgba(255,255,255,0.6)',
  },
  codeScrollView: {
    padding: spacing.md,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#E0E0E0',
    fontSize: 13,
    lineHeight: 20,
  },
  codeComment: {
    color: '#7CB472',
    fontStyle: 'italic',
  },
  codeExpandButton: {
    marginLeft: 'auto',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  fullscreenTitle: {
    ...typography.labelMedium,
    color: colors.white,
    flex: 1,
  },
  fullscreenClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenScroll: {
    flex: 1,
  },
  fullscreenCodeContainer: {
    padding: spacing.lg,
  },
  fullscreenCodeText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
