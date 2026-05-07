import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Line, Defs, Marker, Path } from 'react-native-svg';

import { colors, spacing, borderRadius, typography } from '../theme';
import { Visualization } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIAGRAM_PADDING = spacing.md;
const DIAGRAM_WIDTH = SCREEN_WIDTH - spacing.lg * 2 - DIAGRAM_PADDING * 2;
const MAX_DIAGRAM_HEIGHT = 200; // Fixed max height so navigation is always visible
const NODE_WIDTH = 100;
const NODE_HEIGHT = 44;
const MIN_NODE_SPACING = 50; // Minimum pixels between node centers

interface DiagramVisualizationProps {
  visualizations: Visualization[];
  catColors: { color: string; dark: string };
}

// Get node color based on type
const getNodeColors = (type: string | undefined, catColors: { color: string; dark: string }) => {
  switch (type) {
    case 'primary':
      return { bg: catColors.color, text: colors.white, border: catColors.dark };
    case 'secondary':
      return { bg: `${catColors.color}20`, text: catColors.color, border: catColors.color };
    case 'warning':
      return { bg: '#FEF3C7', text: '#D97706', border: '#F59E0B' };
    case 'error':
      return { bg: '#FEE2E2', text: '#DC2626', border: '#EF4444' };
    case 'info':
      return { bg: '#DBEAFE', text: '#2563EB', border: '#3B82F6' };
    case 'success':
      return { bg: '#D1FAE5', text: '#059669', border: '#10B981' };
    default:
      return { bg: colors.card, text: colors.ink, border: colors.border };
  }
};

// Animated Node Component
const DiagramNode = ({
  node,
  index,
  catColors,
  scaledX,
  scaledY,
}: {
  node: { id: string; label: string; x?: number; y?: number; type?: string };
  index: number;
  catColors: { color: string; dark: string };
  scaledX: number;
  scaledY: number;
}) => {
  const nodeColors = getNodeColors(node.type, catColors);
  const animScale = useSharedValue(0);
  const animOpacity = useSharedValue(0);

  useEffect(() => {
    animScale.value = withDelay(
      index * 80,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    animOpacity.value = withDelay(index * 80, withTiming(1, { duration: 250 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animScale.value }],
    opacity: animOpacity.value,
  }));

  // Parse label for multiline - limit to 2 lines
  const labelLines = node.label.split('\n').slice(0, 2);

  return (
    <Animated.View
      style={[
        styles.node,
        {
          left: scaledX - NODE_WIDTH / 2,
          top: scaledY - NODE_HEIGHT / 2,
          backgroundColor: nodeColors.bg,
          borderColor: nodeColors.border,
        },
        animatedStyle,
      ]}
    >
      {labelLines.map((line, i) => (
        <Text
          key={i}
          style={[
            styles.nodeText,
            { color: nodeColors.text },
            i === 0 && labelLines.length > 1 && styles.nodeTextBold,
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {line}
        </Text>
      ))}
    </Animated.View>
  );
};

// Edge/Connection Component - NO LABELS on edges to avoid overlap
const DiagramEdge = ({
  fromX,
  fromY,
  toX,
  toY,
  catColors,
  index,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  catColors: { color: string; dark: string };
  index: number;
}) => {
  const animOpacity = useSharedValue(0);

  useEffect(() => {
    animOpacity.value = withDelay(index * 40 + 200, withTiming(1, { duration: 300 }));
  }, []);

  // Shorten line to not overlap with nodes
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Offset from node center
  const nodeOffset = 30;
  const offsetRatio = dist > 0 ? nodeOffset / dist : 0;

  const startX = fromX + dx * offsetRatio;
  const startY = fromY + dy * offsetRatio;
  const endX = toX - dx * offsetRatio;
  const endY = toY - dy * offsetRatio;

  return (
    <Animated.View style={[styles.edgeContainer, { opacity: animOpacity }]}>
      <Svg style={styles.edgeSvg}>
        <Defs>
          <Marker
            id={`arrow-${index}`}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <Path d="M0,0 L0,6 L8,3 z" fill={catColors.color} />
          </Marker>
        </Defs>
        <Line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={catColors.color}
          strokeWidth={2}
          markerEnd={`url(#arrow-${index})`}
        />
      </Svg>
    </Animated.View>
  );
};

// Single Diagram View
const SingleDiagram = ({
  visualization,
  catColors,
}: {
  visualization: Visualization;
  catColors: { color: string; dark: string };
}) => {
  // Get nodes and edges from either top-level or data property
  const allNodes = visualization.nodes || visualization.data?.nodes || [];
  const allEdges = visualization.edges || visualization.data?.edges || [];

  type NodeType = { id: string; label: string; x?: number; y?: number; type?: string };

  // Limit nodes to max 5 to prevent overcrowding
  const MAX_NODES = 5;
  const nodes = allNodes.slice(0, MAX_NODES) as NodeType[];
  const nodeIds = new Set(nodes.map((n: NodeType) => n.id));

  // Filter edges to only include those connecting visible nodes
  const edges = allEdges.filter((e: { from: string; to: string }) =>
    nodeIds.has(e.from) && nodeIds.has(e.to)
  );

  // Find bounds of the diagram
  const xValues = nodes.map((n: NodeType) => n.x || 0);
  const yValues = nodes.map((n: NodeType) => n.y || 0);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  // Calculate scale to fit diagram in available space with padding
  const dataWidth = maxX - minX || 1;
  const dataHeight = maxY - minY || 1;
  const paddingX = 45;
  const paddingY = 25;
  const availableWidth = DIAGRAM_WIDTH - paddingX * 2;
  const availableHeight = MAX_DIAGRAM_HEIGHT - paddingY * 2;

  const scaleX = availableWidth / dataWidth;
  const scaleY = availableHeight / dataHeight;

  // Ensure minimum spacing between nodes
  const minScaleForSpacing = MIN_NODE_SPACING / Math.min(
    ...nodes.slice(1).map((n: NodeType, i: number) => {
      const prev = nodes[i];
      const dx = (n.x || 0) - (prev.x || 0);
      const dy = (n.y || 0) - (prev.y || 0);
      return Math.sqrt(dx * dx + dy * dy) || 100;
    }),
    100
  );

  const scale = Math.min(scaleX, scaleY, 1, 1 / minScaleForSpacing);

  // Function to transform coordinates
  const transformX = (x: number) => {
    const centered = x - minX - dataWidth / 2;
    return DIAGRAM_WIDTH / 2 + centered * scale;
  };

  const transformY = (y: number) => {
    const centered = y - minY - dataHeight / 2;
    return MAX_DIAGRAM_HEIGHT / 2 + centered * scale;
  };

  // Create a map for quick node lookup with transformed coordinates
  const nodeMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n: NodeType) => {
    nodeMap.set(n.id, {
      x: transformX(n.x || 0),
      y: transformY(n.y || 0),
    });
  });

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.diagramContainer}>
      <View style={styles.diagramHeader}>
        <Text style={styles.diagramTitle}>{visualization.title}</Text>
        {visualization.description && (
          <Text style={styles.diagramDescription}>{visualization.description}</Text>
        )}
      </View>

      <View style={[styles.diagramCanvas, { height: MAX_DIAGRAM_HEIGHT }]}>
        {/* Render edges first (behind nodes) */}
        {edges.map((edge: { from: string; to: string; label?: string }, index: number) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          return (
            <DiagramEdge
              key={`edge-${index}`}
              fromX={from.x}
              fromY={from.y}
              toX={to.x}
              toY={to.y}
              catColors={catColors}
              index={index}
            />
          );
        })}

        {/* Render nodes */}
        {nodes.map((node: NodeType, index: number) => {
          const pos = nodeMap.get(node.id);
          if (!pos) return null;
          return (
            <DiagramNode
              key={node.id}
              node={node}
              index={index}
              catColors={catColors}
              scaledX={pos.x}
              scaledY={pos.y}
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

// Main Component with Carousel
export default function DiagramVisualization({
  visualizations,
  catColors,
}: DiagramVisualizationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visualizations || visualizations.length === 0) {
    return (
      <View style={styles.noViz}>
        <Ionicons name="git-network-outline" size={48} color={colors.inkLighter} />
        <Text style={styles.noVizText}>No diagrams available</Text>
      </View>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % visualizations.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + visualizations.length) % visualizations.length);
  };

  return (
    <View style={styles.container}>
      {/* Diagram */}
      <SingleDiagram
        key={currentIndex}
        visualization={visualizations[currentIndex]}
        catColors={catColors}
      />

      {/* Navigation - Always visible below diagram */}
      {visualizations.length > 1 && (
        <Animated.View entering={FadeInUp.delay(300)} style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: `${catColors.color}15` }]}
            onPress={goToPrev}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={catColors.color} />
          </TouchableOpacity>

          <View style={styles.paginationContainer}>
            <View style={styles.pagination}>
              {visualizations.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentIndex(index)}
                >
                  <View
                    style={[
                      styles.paginationDot,
                      {
                        backgroundColor:
                          index === currentIndex ? catColors.color : colors.border,
                        width: index === currentIndex ? 20 : 8,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.countText}>
              {currentIndex + 1} / {visualizations.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: `${catColors.color}15` }]}
            onPress={goToNext}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={24} color={catColors.color} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  diagramContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  diagramHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  diagramTitle: {
    ...typography.headlineSmall,
    color: colors.ink,
    marginBottom: 2,
  },
  diagramDescription: {
    ...typography.caption,
    color: colors.inkLight,
  },
  diagramCanvas: {
    position: 'relative',
    margin: DIAGRAM_PADDING,
  },
  node: {
    position: 'absolute',
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    paddingHorizontal: 2,
  },
  nodeText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 11,
  },
  nodeTextBold: {
    fontWeight: '700',
  },
  edgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  edgeSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DIAGRAM_WIDTH,
    height: MAX_DIAGRAM_HEIGHT,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  countText: {
    ...typography.caption,
    color: colors.inkLight,
  },
  noViz: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  noVizText: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
