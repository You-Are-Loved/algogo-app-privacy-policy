import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { PracticeStackParamList } from '../navigation';
import {
  getSystemDesignProblem,
  componentCatalog,
  ComponentType,
  SystemDesignProblem,
} from '../data/systemDesign';

type RouteP = RouteProp<PracticeStackParamList, 'SystemDesign'>;

const NODE_W = 88;
const NODE_H = 64;

interface NodeState {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
}

interface EdgeState {
  from: string;
  to: string;
}

interface TestResult {
  pass: boolean;
  missingComponents: ComponentType[];
  missingConnections: [ComponentType, ComponentType][];
}

export default function SystemDesignScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteP>();
  const problem = getSystemDesignProblem(params.problemId);

  if (!problem) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Problem not found</Text>
      </SafeAreaView>
    );
  }

  return <SystemDesignEditor problem={problem} onBack={() => navigation.goBack()} />;
}

function SystemDesignEditor({
  problem,
  onBack,
}: {
  problem: SystemDesignProblem;
  onBack: () => void;
}) {
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [edges, setEdges] = useState<EdgeState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const nextIdRef = useRef(0);

  const addNode = useCallback(
    (type: ComponentType) => {
      const id = `n${nextIdRef.current++}`;
      // Drop near the center but staggered so they don't pile up.
      const offset = nodes.length * 22;
      const cx = Math.max(60, canvasSize.w / 2 - NODE_W / 2);
      const cy = Math.max(60, canvasSize.h / 2 - NODE_H / 2);
      setNodes((prev) => [
        ...prev,
        { id, type, x: cx + (offset % 80) - 40, y: cy + (offset % 60) - 30 },
      ]);
    },
    [nodes.length, canvasSize.w, canvasSize.h],
  );

  const moveNode = useCallback((id: string, dx: number, dy: number) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              x: Math.max(0, Math.min(n.x + dx, canvasSize.w - NODE_W)),
              y: Math.max(0, Math.min(n.y + dy, canvasSize.h - NODE_H)),
            }
          : n,
      ),
    );
  }, [canvasSize.w, canvasSize.h]);

  const tapNode = useCallback(
    (id: string) => {
      setSelectedId((prev) => {
        if (prev === null) return id;
        if (prev === id) return null;
        // Create edge between prev and id if not present and not self.
        setEdges((existing) => {
          if (prev === id) return existing;
          const dup = existing.some(
            (e) => (e.from === prev && e.to === id) || (e.from === id && e.to === prev),
          );
          if (dup) return existing;
          return [...existing, { from: prev, to: id }];
        });
        return null;
      });
    },
    [],
  );

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const runTest = () => {
    const presentTypes = new Set(nodes.map((n) => n.type));
    const missingComponents = problem.requiredComponents.filter(
      (c) => !presentTypes.has(c),
    );
    const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const missingConnections = problem.requiredConnections.filter(([a, b]) => {
      return !edges.some((e) => {
        const f = nodeById[e.from];
        const t = nodeById[e.to];
        if (!f || !t) return false;
        return (
          (f.type === a && t.type === b) || (f.type === b && t.type === a)
        );
      });
    });
    setTestResult({
      pass: missingComponents.length === 0 && missingConnections.length === 0,
      missingComponents,
      missingConnections,
    });
  };

  const handleHint = () => {
    setHintLevel((l) => Math.min(3, l + 1));
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {problem.title}
            </Text>
            <Text style={styles.headerTopic}>{problem.topic}</Text>
          </View>
          <TouchableOpacity
            onPress={handleHint}
            style={styles.headerBtn}
            hitSlop={8}
            accessibilityLabel="Hint"
          >
            <Ionicons name="bulb-outline" size={20} color={colors.inkLight} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSolutionOpen(true)}
            style={styles.headerBtn}
            hitSlop={8}
            accessibilityLabel="Solution"
          >
            <Ionicons name="book-outline" size={20} color={colors.inkLight} />
          </TouchableOpacity>
        </View>

        {/* Prompt strip */}
        <View style={styles.promptStrip}>
          <Text style={styles.promptText}>{problem.prompt}</Text>
        </View>

        {/* Selection helper */}
        {selectedId && (
          <View style={styles.helpBanner}>
            <Ionicons name="git-network-outline" size={14} color={colors.secondary} />
            <Text style={styles.helpBannerText}>
              Tap another node to connect, or tap this one again to cancel.
            </Text>
          </View>
        )}

        {/* Canvas */}
        <View
          style={styles.canvas}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setCanvasSize({ w: width, h: height });
          }}
        >
          {/* Edges */}
          {canvasSize.w > 0 && (
            <Svg
              style={StyleSheet.absoluteFill as any}
              width={canvasSize.w}
              height={canvasSize.h}
              pointerEvents="none"
            >
              {edges.map((e, i) => {
                const f = nodes.find((n) => n.id === e.from);
                const t = nodes.find((n) => n.id === e.to);
                if (!f || !t) return null;
                return (
                  <Line
                    key={i}
                    x1={f.x + NODE_W / 2}
                    y1={f.y + NODE_H / 2}
                    x2={t.x + NODE_W / 2}
                    y2={t.y + NODE_H / 2}
                    stroke={colors.inkLight}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>
          )}

          {/* Nodes */}
          {nodes.map((n) => (
            <DraggableNode
              key={n.id}
              node={n}
              selected={selectedId === n.id}
              onTap={tapNode}
              onMove={moveNode}
              onLongPress={deleteNode}
            />
          ))}

          {/* Empty state */}
          {nodes.length === 0 && (
            <View pointerEvents="none" style={styles.emptyCanvas}>
              <Ionicons name="git-network-outline" size={36} color={colors.inkLighter} />
              <Text style={styles.emptyCanvasText}>
                Tap a component below to drop it on the canvas.
              </Text>
            </View>
          )}
        </View>

        {/* Palette */}
        <View style={styles.paletteWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.palette}
          >
            {problem.palette.map((type) => {
              const spec = componentCatalog[type];
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.paletteBtn, { borderColor: spec.color }]}
                  activeOpacity={0.85}
                  onPress={() => addNode(type)}
                >
                  <Ionicons name={spec.icon as any} size={18} color={spec.color} />
                  <Text style={styles.paletteLabel}>{spec.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Test button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={runTest}
            disabled={nodes.length === 0}
            activeOpacity={0.85}
            style={[
              styles.testBtn,
              nodes.length === 0 && styles.testBtnDisabled,
              shadows.md,
            ]}
          >
            <Ionicons name="checkmark-done-outline" size={18} color={colors.white} />
            <Text style={styles.testBtnText}>Test diagram</Text>
          </TouchableOpacity>
        </View>

        {/* Test result modal */}
        <ResultModal
          visible={testResult !== null}
          result={testResult}
          onClose={() => setTestResult(null)}
        />

        {/* Hint chips (in-canvas overlay would be busy, render as a small stack above palette when active) */}
        <HintModal
          visible={hintLevel > 0}
          hints={problem.hints}
          shown={hintLevel}
          onMore={() => setHintLevel((l) => Math.min(3, l + 1))}
          onClose={() => setHintLevel(0)}
        />

        {/* Solution overlay */}
        <SolutionModal
          visible={solutionOpen}
          problem={problem}
          onClose={() => setSolutionOpen(false)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function DraggableNode({
  node,
  selected,
  onTap,
  onMove,
  onLongPress,
}: {
  node: NodeState;
  selected: boolean;
  onTap: (id: string) => void;
  onMove: (id: string, dx: number, dy: number) => void;
  onLongPress: (id: string) => void;
}) {
  const spec = componentCatalog[node.type];

  const pan = Gesture.Pan()
    .minDistance(6)
    .onChange((e) => {
      'worklet';
      runOnJS(onMove)(node.id, e.changeX, e.changeY);
    });
  const tap = Gesture.Tap()
    .maxDistance(5)
    .onEnd(() => {
      'worklet';
      runOnJS(onTap)(node.id);
    });
  const long = Gesture.LongPress()
    .minDuration(450)
    .onStart(() => {
      'worklet';
      runOnJS(onLongPress)(node.id);
    });
  const gesture = Gesture.Race(long, pan, tap);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.node,
          {
            left: node.x,
            top: node.y,
            borderColor: selected ? colors.secondary : spec.color,
            backgroundColor: `${spec.color}1A`,
          },
          selected && styles.nodeSelected,
        ]}
      >
        <Ionicons name={spec.icon as any} size={18} color={spec.color} />
        <Text style={styles.nodeLabel} numberOfLines={1}>
          {spec.label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

function ResultModal({
  visible,
  result,
  onClose,
}: {
  visible: boolean;
  result: TestResult | null;
  onClose: () => void;
}) {
  if (!result) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} />
    );
  }
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalGrabber} />
          <View style={styles.modalHeaderRow}>
            <Ionicons
              name={result.pass ? 'checkmark-circle' : 'alert-circle'}
              size={28}
              color={result.pass ? colors.primary : colors.accent}
            />
            <Text style={styles.modalTitle}>
              {result.pass ? 'Looks good' : 'Almost there'}
            </Text>
          </View>
          <ScrollView style={{ maxHeight: 360 }}>
            {result.pass ? (
              <Text style={styles.modalBody}>
                All required components are placed and the key connections are in
                place. Tap the book icon for the worked solution and compare your
                reasoning.
              </Text>
            ) : (
              <>
                {result.missingComponents.length > 0 && (
                  <View style={styles.modalBlock}>
                    <Text style={styles.modalSubhead}>Missing components</Text>
                    {result.missingComponents.map((c) => (
                      <View key={c} style={styles.modalListRow}>
                        <Ionicons
                          name={componentCatalog[c].icon as any}
                          size={16}
                          color={componentCatalog[c].color}
                        />
                        <Text style={styles.modalListText}>
                          {componentCatalog[c].label}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {result.missingConnections.length > 0 && (
                  <View style={styles.modalBlock}>
                    <Text style={styles.modalSubhead}>Missing connections</Text>
                    {result.missingConnections.map(([a, b], i) => (
                      <View key={i} style={styles.modalListRow}>
                        <Text style={styles.modalListText}>
                          {componentCatalog[a].label}{' '}
                          <Text style={{ color: colors.inkLighter }}>↔</Text>{' '}
                          {componentCatalog[b].label}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[
              styles.modalPrimary,
              shadows.button(result.pass ? colors.primary : colors.accent),
              { backgroundColor: result.pass ? colors.primary : colors.accent },
            ]}
          >
            <Text style={styles.modalPrimaryText}>
              {result.pass ? 'Nice' : 'Keep going'}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function HintModal({
  visible,
  hints,
  shown,
  onMore,
  onClose,
}: {
  visible: boolean;
  hints: [string, string, string];
  shown: number;
  onMore: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalGrabber} />
          <View style={styles.modalHeaderRow}>
            <Ionicons name="bulb" size={26} color="#F5B400" />
            <Text style={styles.modalTitle}>Hints</Text>
          </View>
          <ScrollView style={{ maxHeight: 340 }}>
            {hints.slice(0, shown).map((h, i) => (
              <View key={i} style={styles.hintCard}>
                <Text style={styles.hintIndex}>Hint {i + 1}</Text>
                <Text style={styles.hintText}>{h}</Text>
              </View>
            ))}
          </ScrollView>
          {shown < 3 ? (
            <TouchableOpacity
              onPress={onMore}
              activeOpacity={0.85}
              style={[styles.modalPrimary, { backgroundColor: colors.secondary }]}
            >
              <Text style={styles.modalPrimaryText}>Reveal another hint</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={[styles.modalPrimary, { backgroundColor: colors.secondary }]}
            >
              <Text style={styles.modalPrimaryText}>Got it</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SolutionModal({
  visible,
  problem,
  onClose,
}: {
  visible: boolean;
  problem: SystemDesignProblem;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalGrabber} />
          <View style={styles.modalHeaderRow}>
            <Ionicons name="book" size={26} color={colors.primary} />
            <Text style={styles.modalTitle}>Worked solution</Text>
          </View>
          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ paddingBottom: spacing.md }}>
            <Text style={styles.modalBody}>{problem.solution}</Text>
            <View style={styles.solutionList}>
              <Text style={styles.modalSubhead}>Required components</Text>
              {problem.requiredComponents.map((c) => (
                <View key={c} style={styles.modalListRow}>
                  <Ionicons
                    name={componentCatalog[c].icon as any}
                    size={16}
                    color={componentCatalog[c].color}
                  />
                  <Text style={styles.modalListText}>
                    {componentCatalog[c].label}
                  </Text>
                </View>
              ))}
              <Text style={[styles.modalSubhead, { marginTop: spacing.md }]}>
                Required connections
              </Text>
              {problem.requiredConnections.map(([a, b], i) => (
                <View key={i} style={styles.modalListRow}>
                  <Text style={styles.modalListText}>
                    {componentCatalog[a].label}{' '}
                    <Text style={{ color: colors.inkLighter }}>↔</Text>{' '}
                    {componentCatalog[b].label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[
              styles.modalPrimary,
              shadows.button(colors.primary),
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.modalPrimaryText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: {
    ...typography.bodyLarge,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerBtn: { padding: spacing.xs },
  headerCenter: { flex: 1 },
  headerTitle: { ...typography.headlineSmall, color: colors.ink },
  headerTopic: { ...typography.labelSmall, color: colors.inkLight, marginTop: 2 },

  promptStrip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  promptText: {
    ...typography.bodyMedium,
    color: colors.ink,
    lineHeight: 20,
  },

  helpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  helpBannerText: {
    ...typography.labelSmall,
    color: colors.ink,
    flex: 1,
  },

  canvas: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyCanvas: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyCanvasText: {
    ...typography.bodyMedium,
    color: colors.inkLighter,
    textAlign: 'center',
  },

  node: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    gap: 2,
  },
  nodeSelected: {
    borderWidth: 3,
    ...shadows.sm,
  },
  nodeLabel: {
    ...typography.labelSmall,
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  paletteWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  palette: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  paletteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  paletteLabel: {
    ...typography.labelMedium,
    color: colors.ink,
    fontSize: 13,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  testBtnDisabled: { opacity: 0.5 },
  testBtnText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 15,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 25, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    ...shadows.lg,
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.headlineSmall, color: colors.ink },
  modalBody: {
    ...typography.bodyMedium,
    color: colors.ink,
    lineHeight: 22,
  },
  modalBlock: { marginBottom: spacing.md },
  modalSubhead: {
    ...typography.labelSmall,
    color: colors.inkLight,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  modalListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  modalListText: {
    ...typography.bodyMedium,
    color: colors.ink,
  },
  modalPrimary: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalPrimaryText: {
    ...typography.labelLarge,
    color: colors.white,
    fontSize: 15,
  },

  hintCard: {
    backgroundColor: '#FFF6D6',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  hintIndex: {
    ...typography.labelSmall,
    color: '#9A6F00',
    fontWeight: '700',
    marginBottom: 4,
  },
  hintText: {
    ...typography.bodyMedium,
    color: '#2D2400',
    lineHeight: 22,
  },

  solutionList: {
    marginTop: spacing.md,
  },
});
