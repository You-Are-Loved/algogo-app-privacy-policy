import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';

import { colors, spacing, borderRadius, typography } from '../theme';
import { Category } from '../types';

const { width } = Dimensions.get('window');
const CELL_SIZE = 44;
const CELL_GAP = 6;

interface VisualizeTabProps {
  category: Category;
  catColors: { color: string; dark: string };
}

// Array Cell Component
const ArrayCell = ({
  value,
  index,
  isHighlighted,
  highlightColor,
  isPointer,
  pointerLabel,
  delay = 0,
}: {
  value: number | string;
  index: number;
  isHighlighted?: boolean;
  highlightColor?: string;
  isPointer?: boolean;
  pointerLabel?: string;
  delay?: number;
}) => {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);

  useEffect(() => {
    if (isHighlighted) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 150 }),
        withSpring(1)
      );
      backgroundColor.value = withTiming(1, { duration: 200 });
    } else {
      backgroundColor.value = withTiming(0, { duration: 200 });
    }
  }, [isHighlighted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      backgroundColor.value,
      [0, 1],
      [colors.card, highlightColor || colors.primary]
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      backgroundColor.value,
      [0, 1],
      [colors.ink, colors.white]
    ),
  }));

  return (
    <View style={styles.cellContainer}>
      {isPointer && (
        <Animated.View style={styles.pointerContainer}>
          <Ionicons name="caret-down" size={16} color={highlightColor || colors.primary} />
          <Text style={[styles.pointerLabel, { color: highlightColor }]}>{pointerLabel}</Text>
        </Animated.View>
      )}
      <Animated.View style={[styles.cell, animatedStyle]}>
        <Animated.Text style={[styles.cellText, textStyle]}>{value}</Animated.Text>
      </Animated.View>
      <Text style={styles.indexText}>{index}</Text>
    </View>
  );
};

// Sliding Window Visualization
const SlidingWindowViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const array = [2, 1, 5, 1, 3, 2];
  const k = 3;
  const maxSteps = array.length - k + 1;

  const windowLeft = useSharedValue(0);

  useEffect(() => {
    windowLeft.value = withTiming(step * (CELL_SIZE + CELL_GAP), { duration: 400 });
  }, [step]);

  useEffect(() => {
    if (isPlaying && step < maxSteps - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 1000);
      return () => clearTimeout(timer);
    } else if (step >= maxSteps - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, step]);

  const windowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: windowLeft.value }],
  }));

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const windowSum = array.slice(step, step + k).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Sliding Window (k={k})</Text>
      <Text style={styles.vizSubtitle}>Find maximum sum subarray of size k</Text>

      <View style={styles.arrayContainer}>
        <Animated.View style={[styles.window, { width: k * CELL_SIZE + (k - 1) * CELL_GAP + 8 }, windowStyle]}>
          <View style={[styles.windowBorder, { borderColor: catColors.color }]} />
        </Animated.View>
        {array.map((val, idx) => (
          <ArrayCell
            key={idx}
            value={val}
            index={idx}
            isHighlighted={idx >= step && idx < step + k}
            highlightColor={catColors.color}
          />
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Window Sum</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>{windowSum}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Position</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>{step} → {step + k - 1}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => step < maxSteps - 1 && setStep(s => s + 1)}
        >
          <Ionicons name="play-skip-forward" size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Window slides right, adding new element and removing leftmost. O(n) time!
        </Text>
      </View>
    </View>
  );
};

// Two Pointers Visualization
const TwoPointersViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const array = [1, 2, 3, 4, 6, 8, 9];
  const target = 10;

  const steps = [
    { left: 0, right: 6, sum: 10, found: true },
  ];

  const simulateSteps = [
    { left: 0, right: 6 }, // 1+9=10, found!
  ];

  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(array.length - 1);
  const [foundPair, setFoundPair] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const sum = array[left] + array[right];
      if (sum === target) {
        setFoundPair(true);
        setIsPlaying(false);
      } else if (sum < target) {
        const timer = setTimeout(() => setLeft(l => l + 1), 800);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setRight(r => r - 1), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, left, right]);

  const reset = () => {
    setLeft(0);
    setRight(array.length - 1);
    setFoundPair(false);
    setIsPlaying(false);
  };

  const currentSum = array[left] + array[right];

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Two Pointers</Text>
      <Text style={styles.vizSubtitle}>Find pair with sum = {target}</Text>

      <View style={styles.arrayContainer}>
        {array.map((val, idx) => (
          <ArrayCell
            key={idx}
            value={val}
            index={idx}
            isHighlighted={idx === left || idx === right}
            highlightColor={idx === left ? catColors.color : colors.secondary}
            isPointer={idx === left || idx === right}
            pointerLabel={idx === left ? 'L' : idx === right ? 'R' : undefined}
          />
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Current Sum</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>
            {array[left]} + {array[right]} = {currentSum}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: foundPair ? `${colors.primary}15` : `${colors.inkLighter}15` }]}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: foundPair ? colors.primary : colors.inkLight }]}>
            {foundPair ? 'Found!' : currentSum < target ? 'Move L →' : 'Move R ←'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => !foundPair && setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Sum too small? Move left pointer right. Sum too big? Move right pointer left.
        </Text>
      </View>
    </View>
  );
};

// Fast & Slow Pointers (Cycle Detection) Visualization
const FastSlowViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [slow, setSlow] = useState(0);
  const [fast, setFast] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cycleFound, setCycleFound] = useState(false);

  // Linked list with cycle: 0->1->2->3->4->5->2 (cycle back to index 2)
  const nodes = [0, 1, 2, 3, 4, 5];
  const cycleStart = 2;

  const getNext = (idx: number) => {
    if (idx === nodes.length - 1) return cycleStart; // Cycle back
    return idx + 1;
  };

  useEffect(() => {
    if (isPlaying && !cycleFound) {
      const timer = setTimeout(() => {
        const newSlow = getNext(slow);
        const newFast = getNext(getNext(fast));

        if (newSlow === newFast) {
          setCycleFound(true);
          setIsPlaying(false);
        }

        setSlow(newSlow);
        setFast(newFast);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, slow, fast, cycleFound]);

  const reset = () => {
    setSlow(0);
    setFast(0);
    setCycleFound(false);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Fast & Slow Pointers</Text>
      <Text style={styles.vizSubtitle}>Cycle detection in linked list</Text>

      <View style={styles.linkedListContainer}>
        {nodes.map((val, idx) => (
          <View key={idx} style={styles.nodeWrapper}>
            <View style={[
              styles.node,
              slow === idx && { borderColor: catColors.color, borderWidth: 3 },
              fast === idx && { borderColor: colors.secondary, borderWidth: 3 },
              slow === idx && fast === idx && { borderColor: colors.accent, borderWidth: 3 },
              idx === cycleStart && styles.cycleNode,
            ]}>
              <Text style={styles.nodeText}>{val}</Text>
            </View>
            {idx < nodes.length - 1 && (
              <Ionicons name="arrow-forward" size={16} color={colors.inkLighter} />
            )}
            {idx === nodes.length - 1 && (
              <View style={styles.cycleArrow}>
                <Ionicons name="return-down-back" size={20} color={colors.accent} />
              </View>
            )}
            {slow === idx && (
              <View style={[styles.pointerTag, { backgroundColor: catColors.color }]}>
                <Text style={styles.pointerTagText}>S</Text>
              </View>
            )}
            {fast === idx && slow !== idx && (
              <View style={[styles.pointerTag, { backgroundColor: colors.secondary }]}>
                <Text style={styles.pointerTagText}>F</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Slow Position</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>{slow}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: `${colors.secondary}15` }]}>
          <Text style={styles.statLabel}>Fast Position</Text>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{fast}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: cycleFound ? `${colors.accent}15` : `${colors.inkLighter}15` }]}>
          <Text style={styles.statLabel}>Cycle</Text>
          <Text style={[styles.statValue, { color: cycleFound ? colors.accent : colors.inkLight }]}>
            {cycleFound ? 'Found!' : 'Searching...'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => !cycleFound && setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Slow moves 1 step, fast moves 2 steps. If there's a cycle, they will meet!
        </Text>
      </View>
    </View>
  );
};

// Merge Intervals Visualization
const MergeIntervalsViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const intervals = [[1, 3], [2, 6], [8, 10], [15, 18]];
  const merged = [[1, 6], [8, 10], [15, 18]];

  const maxSteps = 3;

  useEffect(() => {
    if (isPlaying && step < maxSteps) {
      const timer = setTimeout(() => setStep(s => s + 1), 1200);
      return () => clearTimeout(timer);
    } else if (step >= maxSteps) {
      setIsPlaying(false);
    }
  }, [isPlaying, step]);

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const scale = 15;

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Merge Intervals</Text>
      <Text style={styles.vizSubtitle}>Combine overlapping intervals</Text>

      <View style={styles.intervalsContainer}>
        <Text style={styles.intervalLabel}>Input:</Text>
        <View style={styles.intervalRow}>
          {intervals.map((interval, idx) => (
            <View
              key={idx}
              style={[
                styles.interval,
                {
                  left: interval[0] * scale,
                  width: (interval[1] - interval[0]) * scale,
                  backgroundColor: step > 0 && idx <= 1 ? catColors.color : colors.secondary,
                  opacity: step > 0 && idx <= 1 ? 1 : 0.6,
                },
              ]}
            >
              <Text style={styles.intervalText}>[{interval[0]},{interval[1]}]</Text>
            </View>
          ))}
        </View>

        {step >= 2 && (
          <>
            <Text style={[styles.intervalLabel, { marginTop: spacing.lg }]}>Merged:</Text>
            <View style={styles.intervalRow}>
              {merged.map((interval, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.interval,
                    {
                      left: interval[0] * scale,
                      width: (interval[1] - interval[0]) * scale,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.intervalText}>[{interval[0]},{interval[1]}]</Text>
                </Animated.View>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.stepIndicator}>
        {step === 0 && <Text style={styles.stepText}>Step 1: Sort by start time</Text>}
        {step === 1 && <Text style={styles.stepText}>Step 2: Check [1,3] and [2,6] overlap (3 ≥ 2)</Text>}
        {step === 2 && <Text style={styles.stepText}>Step 3: Merge to [1,6]. Continue...</Text>}
        {step === 3 && <Text style={styles.stepText}>Result: [[1,6], [8,10], [15,18]]</Text>}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => step < maxSteps && setStep(s => s + 1)}
        >
          <Ionicons name="play-skip-forward" size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Sort first, then merge if current.start ≤ prev.end
        </Text>
      </View>
    </View>
  );
};

// Binary Search Visualization
const BinarySearchViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const array = [1, 3, 5, 7, 9, 11, 13, 15];
  const target = 9;

  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(array.length - 1);
  const [mid, setMid] = useState(Math.floor((0 + array.length - 1) / 2));
  const [found, setFound] = useState(false);

  useEffect(() => {
    if (isPlaying && !found && left <= right) {
      const timer = setTimeout(() => {
        const newMid = Math.floor((left + right) / 2);
        setMid(newMid);

        if (array[newMid] === target) {
          setFound(true);
          setIsPlaying(false);
        } else if (array[newMid] < target) {
          setLeft(newMid + 1);
        } else {
          setRight(newMid - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, left, right, found]);

  const reset = () => {
    setLeft(0);
    setRight(array.length - 1);
    setMid(Math.floor((0 + array.length - 1) / 2));
    setFound(false);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Binary Search</Text>
      <Text style={styles.vizSubtitle}>Find target = {target}</Text>

      <View style={styles.arrayContainer}>
        {array.map((val, idx) => (
          <ArrayCell
            key={idx}
            value={val}
            index={idx}
            isHighlighted={idx === mid || (found && idx === mid)}
            highlightColor={found && idx === mid ? colors.primary : catColors.color}
            isPointer={idx === left || idx === right || idx === mid}
            pointerLabel={idx === mid ? 'M' : idx === left ? 'L' : idx === right ? 'R' : undefined}
          />
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Comparing</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>
            {array[mid]} {found ? '=' : array[mid] < target ? '<' : '>'} {target}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: found ? `${colors.primary}15` : `${colors.inkLighter}15` }]}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: found ? colors.primary : colors.inkLight }]}>
            {found ? 'Found at index ' + mid : 'Searching...'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => !found && setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Each step eliminates half the search space. O(log n) time!
        </Text>
      </View>
    </View>
  );
};

// Tree BFS Visualization
const TreeBFSViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const tree = [
    [1],
    [2, 3],
    [4, 5, 6, 7],
  ];

  useEffect(() => {
    if (isPlaying && currentLevel < tree.length - 1) {
      const timer = setTimeout(() => setCurrentLevel(l => l + 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentLevel >= tree.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentLevel]);

  const reset = () => {
    setCurrentLevel(-1);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Tree BFS (Level Order)</Text>
      <Text style={styles.vizSubtitle}>Visit nodes level by level</Text>

      <View style={styles.treeContainer}>
        {tree.map((level, levelIdx) => (
          <View key={levelIdx} style={styles.treeLevel}>
            {level.map((node, nodeIdx) => (
              <View
                key={nodeIdx}
                style={[
                  styles.treeNode,
                  levelIdx <= currentLevel && {
                    backgroundColor: catColors.color,
                    borderColor: catColors.color,
                  },
                ]}
              >
                <Text style={[
                  styles.treeNodeText,
                  levelIdx <= currentLevel && { color: colors.white },
                ]}>
                  {node}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.queueContainer}>
        <Text style={styles.queueLabel}>Queue:</Text>
        <View style={styles.queue}>
          {currentLevel >= 0 && currentLevel < tree.length && tree[currentLevel].map((node, idx) => (
            <View key={idx} style={[styles.queueItem, { backgroundColor: catColors.color }]}>
              <Text style={styles.queueItemText}>{node}</Text>
            </View>
          ))}
          {currentLevel === -1 && (
            <Text style={styles.emptyQueue}>Empty</Text>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => currentLevel < tree.length - 1 && setCurrentLevel(l => l + 1)}
        >
          <Ionicons name="play-skip-forward" size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Use a queue: process all nodes at current level before moving to next
        </Text>
      </View>
    </View>
  );
};

// Two Heaps Visualization
const TwoHeapsViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [maxHeap, setMaxHeap] = useState<number[]>([]);
  const [minHeap, setMinHeap] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const stream = [5, 2, 8, 1, 9, 3, 7];

  const addToHeaps = (num: number, maxH: number[], minH: number[]) => {
    const newMaxHeap = [...maxH];
    const newMinHeap = [...minH];

    // Add to max heap first
    if (newMaxHeap.length === 0 || num <= Math.max(...newMaxHeap)) {
      newMaxHeap.push(num);
      newMaxHeap.sort((a, b) => b - a);
    } else {
      newMinHeap.push(num);
      newMinHeap.sort((a, b) => a - b);
    }

    // Rebalance
    if (newMaxHeap.length > newMinHeap.length + 1) {
      newMinHeap.unshift(newMaxHeap.shift()!);
      newMinHeap.sort((a, b) => a - b);
    } else if (newMinHeap.length > newMaxHeap.length) {
      newMaxHeap.unshift(newMinHeap.shift()!);
      newMaxHeap.sort((a, b) => b - a);
    }

    return { maxHeap: newMaxHeap, minHeap: newMinHeap };
  };

  useEffect(() => {
    if (isPlaying && currentIdx < stream.length) {
      const timer = setTimeout(() => {
        const num = stream[currentIdx];
        setNumbers(prev => [...prev, num]);
        const result = addToHeaps(num, maxHeap, minHeap);
        setMaxHeap(result.maxHeap);
        setMinHeap(result.minHeap);
        setCurrentIdx(idx => idx + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (currentIdx >= stream.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIdx]);

  const reset = () => {
    setNumbers([]);
    setMaxHeap([]);
    setMinHeap([]);
    setCurrentIdx(0);
    setIsPlaying(false);
  };

  const getMedian = () => {
    if (maxHeap.length === 0) return '-';
    if (maxHeap.length > minHeap.length) {
      return maxHeap[0];
    }
    return ((maxHeap[0] + minHeap[0]) / 2).toFixed(1);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Two Heaps</Text>
      <Text style={styles.vizSubtitle}>Find running median of stream</Text>

      <View style={styles.streamContainer}>
        <Text style={styles.streamLabel}>Stream: [{stream.join(', ')}]</Text>
        <Text style={styles.streamLabel}>Added: [{numbers.join(', ')}]</Text>
      </View>

      <View style={styles.heapsContainer}>
        <View style={styles.heapBox}>
          <Text style={[styles.heapTitle, { color: catColors.color }]}>Max Heap</Text>
          <Text style={styles.heapSubtitle}>(lower half)</Text>
          <View style={styles.heapValues}>
            {maxHeap.length > 0 ? maxHeap.map((n, i) => (
              <View key={i} style={[styles.heapValue, i === 0 && { backgroundColor: catColors.color }]}>
                <Text style={[styles.heapValueText, i === 0 && { color: colors.white }]}>{n}</Text>
              </View>
            )) : <Text style={styles.emptyHeap}>Empty</Text>}
          </View>
        </View>
        <View style={styles.heapBox}>
          <Text style={[styles.heapTitle, { color: colors.secondary }]}>Min Heap</Text>
          <Text style={styles.heapSubtitle}>(upper half)</Text>
          <View style={styles.heapValues}>
            {minHeap.length > 0 ? minHeap.map((n, i) => (
              <View key={i} style={[styles.heapValue, i === 0 && { backgroundColor: colors.secondary }]}>
                <Text style={[styles.heapValueText, i === 0 && { color: colors.white }]}>{n}</Text>
              </View>
            )) : <Text style={styles.emptyHeap}>Empty</Text>}
          </View>
        </View>
      </View>

      <View style={[styles.medianBox, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
        <Text style={styles.medianLabel}>Current Median</Text>
        <Text style={[styles.medianValue, { color: colors.primary }]}>{getMedian()}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Max heap stores smaller half, min heap stores larger half. Median is top(s)!
        </Text>
      </View>
    </View>
  );
};

// Cyclic Sort Visualization
const CyclicSortViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [array, setArray] = useState([3, 1, 5, 4, 2]);
  const [i, setI] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [swapping, setSwapping] = useState<number | null>(null);

  useEffect(() => {
    if (isPlaying && !sorted) {
      const timer = setTimeout(() => {
        const newArray = [...array];
        if (i < newArray.length) {
          const correctIdx = newArray[i] - 1;
          if (newArray[i] !== newArray[correctIdx]) {
            setSwapping(correctIdx);
            [newArray[i], newArray[correctIdx]] = [newArray[correctIdx], newArray[i]];
            setArray(newArray);
          } else {
            setSwapping(null);
            setI(i + 1);
          }
        } else {
          setSorted(true);
          setIsPlaying(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, i, array, sorted]);

  const reset = () => {
    setArray([3, 1, 5, 4, 2]);
    setI(0);
    setSorted(false);
    setSwapping(null);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Cyclic Sort</Text>
      <Text style={styles.vizSubtitle}>Sort array with values 1 to n</Text>

      <View style={styles.arrayContainer}>
        {array.map((val, idx) => (
          <ArrayCell
            key={idx}
            value={val}
            index={idx}
            isHighlighted={idx === i || idx === swapping}
            highlightColor={idx === i ? catColors.color : colors.accent}
            isPointer={idx === i}
            pointerLabel="i"
          />
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>
            arr[{i}] = {array[i] || '-'}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: sorted ? `${colors.primary}15` : `${colors.inkLighter}15` }]}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: sorted ? colors.primary : colors.inkLight }]}>
            {sorted ? 'Sorted!' : swapping !== null ? `Swap with idx ${swapping}` : 'Checking...'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => !sorted && setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Each number n should be at index n-1. Swap until correct, then move on.
        </Text>
      </View>
    </View>
  );
};

// Linked List Reversal Visualization
const LinkedListReversalViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [nodes] = useState([1, 2, 3, 4, 5]);
  const [prev, setPrev] = useState(-1);
  const [curr, setCurr] = useState(0);
  const [reversed, setReversed] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isPlaying && !done) {
      const timer = setTimeout(() => {
        if (curr < nodes.length) {
          setReversed(prev => [nodes[curr], ...prev]);
          setPrev(curr);
          setCurr(curr + 1);
        } else {
          setDone(true);
          setIsPlaying(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, curr, done]);

  const reset = () => {
    setPrev(-1);
    setCurr(0);
    setReversed([]);
    setDone(false);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Linked List Reversal</Text>
      <Text style={styles.vizSubtitle}>Reverse pointers in-place</Text>

      <View style={styles.listSection}>
        <Text style={styles.listLabel}>Original:</Text>
        <View style={styles.linkedListContainer}>
          {nodes.map((val, idx) => (
            <View key={idx} style={styles.nodeWrapper}>
              <View style={[
                styles.node,
                idx === curr && { borderColor: catColors.color, borderWidth: 3 },
                idx === prev && { borderColor: colors.secondary, borderWidth: 3 },
              ]}>
                <Text style={styles.nodeText}>{val}</Text>
              </View>
              {idx < nodes.length - 1 && (
                <Ionicons name="arrow-forward" size={16} color={colors.inkLighter} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listLabel}>Reversed:</Text>
        <View style={styles.linkedListContainer}>
          {reversed.length > 0 ? reversed.map((val, idx) => (
            <View key={idx} style={styles.nodeWrapper}>
              <View style={[styles.node, { backgroundColor: `${catColors.color}20`, borderColor: catColors.color }]}>
                <Text style={styles.nodeText}>{val}</Text>
              </View>
              {idx < reversed.length - 1 && (
                <Ionicons name="arrow-forward" size={16} color={catColors.color} />
              )}
            </View>
          )) : <Text style={styles.emptyHeap}>Building...</Text>}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => !done && setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Save next, point current.next to prev, move prev and current forward.
        </Text>
      </View>
    </View>
  );
};

// Tree DFS Visualization
const TreeDFSViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [visited, setVisited] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'preorder' | 'inorder' | 'postorder'>('preorder');

  const tree = { val: 1, left: { val: 2, left: { val: 4 }, right: { val: 5 } }, right: { val: 3, left: { val: 6 }, right: { val: 7 } } };

  const orders = {
    preorder: [1, 2, 4, 5, 3, 6, 7],
    inorder: [4, 2, 5, 1, 6, 3, 7],
    postorder: [4, 5, 2, 6, 7, 3, 1],
  };

  const treeLayout = [
    [1],
    [2, 3],
    [4, 5, 6, 7],
  ];

  useEffect(() => {
    if (isPlaying && visited.length < orders[mode].length) {
      const timer = setTimeout(() => {
        setVisited(prev => [...prev, orders[mode][prev.length]]);
      }, 700);
      return () => clearTimeout(timer);
    } else if (visited.length >= orders[mode].length) {
      setIsPlaying(false);
    }
  }, [isPlaying, visited, mode]);

  const reset = () => {
    setVisited([]);
    setIsPlaying(false);
  };

  const changeMode = (newMode: typeof mode) => {
    setMode(newMode);
    setVisited([]);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Tree DFS</Text>
      <Text style={styles.vizSubtitle}>Depth-first traversal orders</Text>

      <View style={styles.modeSelector}>
        {(['preorder', 'inorder', 'postorder'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && { backgroundColor: catColors.color }]}
            onPress={() => changeMode(m)}
          >
            <Text style={[styles.modeBtnText, mode === m && { color: colors.white }]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.treeContainer}>
        {treeLayout.map((level, levelIdx) => (
          <View key={levelIdx} style={styles.treeLevel}>
            {level.map((node, nodeIdx) => (
              <View
                key={nodeIdx}
                style={[
                  styles.treeNode,
                  visited.includes(node) && {
                    backgroundColor: catColors.color,
                    borderColor: catColors.color,
                  },
                ]}
              >
                <Text style={[styles.treeNodeText, visited.includes(node) && { color: colors.white }]}>
                  {node}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.visitOrder}>
        <Text style={styles.visitLabel}>Visit order: </Text>
        <Text style={[styles.visitValues, { color: catColors.color }]}>
          [{visited.join(' → ')}]
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          {mode === 'preorder' && 'Root → Left → Right (process before children)'}
          {mode === 'inorder' && 'Left → Root → Right (gives sorted order in BST)'}
          {mode === 'postorder' && 'Left → Right → Root (process after children)'}
        </Text>
      </View>
    </View>
  );
};

// Subsets/Backtracking Visualization
const SubsetsViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [subsets, setSubsets] = useState<number[][]>([[]]);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nums = [1, 2, 3];
  const allSubsets = [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]];

  useEffect(() => {
    if (isPlaying && step < allSubsets.length - 1) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
        setSubsets(allSubsets.slice(0, step + 2));
      }, 600);
      return () => clearTimeout(timer);
    } else if (step >= allSubsets.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, step]);

  const reset = () => {
    setSubsets([[]]);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Subsets (Backtracking)</Text>
      <Text style={styles.vizSubtitle}>Generate all subsets of [{nums.join(', ')}]</Text>

      <View style={styles.subsetsGrid}>
        {subsets.map((subset, idx) => (
          <View
            key={idx}
            style={[
              styles.subsetBox,
              idx === subsets.length - 1 && { backgroundColor: `${catColors.color}20`, borderColor: catColors.color },
            ]}
          >
            <Text style={[styles.subsetText, idx === subsets.length - 1 && { color: catColors.color }]}>
              {subset.length === 0 ? '∅' : `{${subset.join(', ')}}`}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.statBox, { backgroundColor: `${catColors.color}15`, marginBottom: spacing.lg }]}>
        <Text style={styles.statLabel}>Total Subsets</Text>
        <Text style={[styles.statValue, { color: catColors.color }]}>
          {subsets.length} / {allSubsets.length} (2^n = 2^3 = 8)
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          For each element, choose to include or exclude. Total: 2^n subsets.
        </Text>
      </View>
    </View>
  );
};

// Top K Elements Visualization
const TopKViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [heap, setHeap] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nums = [3, 1, 5, 12, 2, 11, 8];
  const k = 3;

  useEffect(() => {
    if (isPlaying && idx < nums.length) {
      const timer = setTimeout(() => {
        const num = nums[idx];
        let newHeap = [...heap];

        if (newHeap.length < k) {
          newHeap.push(num);
          newHeap.sort((a, b) => a - b);
        } else if (num > newHeap[0]) {
          newHeap[0] = num;
          newHeap.sort((a, b) => a - b);
        }

        setHeap(newHeap);
        setIdx(idx + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (idx >= nums.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, idx]);

  const reset = () => {
    setHeap([]);
    setIdx(0);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Top K Elements</Text>
      <Text style={styles.vizSubtitle}>Find {k} largest numbers</Text>

      <View style={styles.streamContainer}>
        <Text style={styles.streamLabel}>Array: [{nums.map((n, i) => i < idx ? <Text key={i} style={{ color: colors.inkLighter }}>{n}, </Text> : <Text key={i} style={{ fontWeight: i === idx ? 'bold' : 'normal' }}>{n}{i < nums.length - 1 ? ', ' : ''}</Text>)}]</Text>
        {idx < nums.length && <Text style={styles.streamLabel}>Processing: {nums[idx]}</Text>}
      </View>

      <View style={styles.heapBox}>
        <Text style={[styles.heapTitle, { color: catColors.color }]}>Min Heap (size k={k})</Text>
        <View style={styles.heapValues}>
          {heap.length > 0 ? heap.map((n, i) => (
            <View key={i} style={[styles.heapValue, i === 0 && { backgroundColor: colors.accent }]}>
              <Text style={[styles.heapValueText, i === 0 && { color: colors.white }]}>{n}</Text>
            </View>
          )) : <Text style={styles.emptyHeap}>Empty</Text>}
        </View>
        <Text style={styles.heapSubtitle}>Heap top (min) = {heap[0] || '-'}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Keep min-heap of size k. If new element &gt; heap top, replace top. O(n log k)!
        </Text>
      </View>
    </View>
  );
};

// K-Way Merge Visualization
const KWayMergeViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [lists] = useState([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
  const [pointers, setPointers] = useState([0, 0, 0]);
  const [merged, setMerged] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const allDone = pointers.every((p, i) => p >= lists[i].length);

  useEffect(() => {
    if (isPlaying && !allDone) {
      const timer = setTimeout(() => {
        // Find minimum among current pointers
        let minVal = Infinity;
        let minList = -1;

        pointers.forEach((p, i) => {
          if (p < lists[i].length && lists[i][p] < minVal) {
            minVal = lists[i][p];
            minList = i;
          }
        });

        if (minList !== -1) {
          setMerged(prev => [...prev, minVal]);
          setPointers(prev => {
            const newP = [...prev];
            newP[minList]++;
            return newP;
          });
        }
      }, 600);
      return () => clearTimeout(timer);
    } else if (allDone) {
      setIsPlaying(false);
    }
  }, [isPlaying, pointers, allDone]);

  const reset = () => {
    setPointers([0, 0, 0]);
    setMerged([]);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>K-Way Merge</Text>
      <Text style={styles.vizSubtitle}>Merge K sorted lists</Text>

      <View style={styles.kListsContainer}>
        {lists.map((list, listIdx) => (
          <View key={listIdx} style={styles.kList}>
            <Text style={styles.kListLabel}>List {listIdx + 1}:</Text>
            <View style={styles.kListValues}>
              {list.map((val, valIdx) => (
                <View
                  key={valIdx}
                  style={[
                    styles.kListItem,
                    valIdx < pointers[listIdx] && { opacity: 0.3 },
                    valIdx === pointers[listIdx] && { backgroundColor: catColors.color },
                  ]}
                >
                  <Text style={[styles.kListItemText, valIdx === pointers[listIdx] && { color: colors.white }]}>
                    {val}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.mergedContainer}>
        <Text style={styles.mergedLabel}>Merged:</Text>
        <View style={styles.mergedValues}>
          {merged.map((val, idx) => (
            <View key={idx} style={[styles.mergedItem, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.mergedItemText, { color: colors.primary }]}>{val}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => !allDone && setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Use min-heap to track smallest element from each list. Pop min, add next from that list.
        </Text>
      </View>
    </View>
  );
};

// Island (Matrix Traversal) Visualization
const IslandMatrixViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [grid, setGrid] = useState([
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1],
  ]);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState<string | null>(null);
  const [islandCount, setIslandCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<[number, number][]>([]);

  const reset = () => {
    setVisited(new Set());
    setCurrent(null);
    setIslandCount(0);
    setQueue([]);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      // Find next unvisited land cell
      if (queue.length === 0) {
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[0].length; c++) {
            const key = `${r},${c}`;
            if (grid[r][c] === 1 && !visited.has(key)) {
              setIslandCount(prev => prev + 1);
              setQueue([[r, c]]);
              setVisited(prev => new Set(prev).add(key));
              setCurrent(key);
              return;
            }
          }
        }
        setIsPlaying(false);
        setCurrent(null);
        return;
      }

      // BFS step
      const [r, c] = queue[0];
      const newQueue = queue.slice(1);
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const newVisited = new Set(visited);

      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        const key = `${nr},${nc}`;
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc] === 1 && !newVisited.has(key)) {
          newVisited.add(key);
          newQueue.push([nr, nc]);
        }
      }

      setVisited(newVisited);
      setQueue(newQueue);
      setCurrent(newQueue.length > 0 ? `${newQueue[0][0]},${newQueue[0][1]}` : null);
    }, 400);

    return () => clearTimeout(timer);
  }, [isPlaying, queue, visited]);

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Island (Matrix Traversal)</Text>
      <Text style={styles.vizSubtitle}>Count islands using BFS</Text>

      <View style={styles.gridContainer}>
        {grid.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((cell, c) => {
              const key = `${r},${c}`;
              const isVisited = visited.has(key);
              const isCurrent = current === key;
              return (
                <View
                  key={c}
                  style={[
                    styles.gridCell,
                    cell === 1 && styles.landCell,
                    isVisited && { backgroundColor: catColors.color },
                    isCurrent && { borderColor: colors.accent, borderWidth: 3 },
                  ]}
                >
                  <Text style={[styles.gridCellText, (isVisited || cell === 1) && { color: colors.white }]}>
                    {cell}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Islands Found</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>{islandCount}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: `${colors.secondary}15` }]}>
          <Text style={styles.statLabel}>Queue Size</Text>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{queue.length}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          BFS explores all connected land cells. Each new BFS = new island. O(m×n) time.
        </Text>
      </View>
    </View>
  );
};

// Bitwise XOR Visualization
const BitwiseXorViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [nums] = useState([4, 1, 2, 1, 2]);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying && step < nums.length) {
      const timer = setTimeout(() => {
        setResult(prev => prev ^ nums[step]);
        setStep(s => s + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step >= nums.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, step]);

  const reset = () => {
    setStep(0);
    setResult(0);
    setIsPlaying(false);
  };

  const toBinary = (n: number) => n.toString(2).padStart(4, '0');

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Bitwise XOR</Text>
      <Text style={styles.vizSubtitle}>Find single number (others appear twice)</Text>

      <View style={styles.arrayContainer}>
        {nums.map((val, idx) => (
          <ArrayCell
            key={idx}
            value={val}
            index={idx}
            isHighlighted={idx === step}
            highlightColor={catColors.color}
          />
        ))}
      </View>

      <View style={styles.xorContainer}>
        <View style={styles.xorRow}>
          <Text style={styles.xorLabel}>Result:</Text>
          <Text style={[styles.xorBinary, { color: catColors.color }]}>{toBinary(result)}</Text>
          <Text style={styles.xorDecimal}>= {result}</Text>
        </View>
        {step > 0 && step <= nums.length && (
          <View style={styles.xorRow}>
            <Text style={styles.xorLabel}>XOR {nums[step - 1]}:</Text>
            <Text style={styles.xorBinary}>{toBinary(nums[step - 1])}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Operation</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>
            {step === 0 ? 'Start: 0' : step < nums.length ? `${result ^ nums[step]} ^ ${nums[step]}` : 'Done!'}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: step >= nums.length ? `${colors.primary}15` : `${colors.inkLighter}15` }]}>
          <Text style={styles.statLabel}>Single Number</Text>
          <Text style={[styles.statValue, { color: step >= nums.length ? colors.primary : colors.inkLight }]}>
            {step >= nums.length ? result : '?'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          a ^ a = 0 and a ^ 0 = a. Pairs cancel out, leaving the single number!
        </Text>
      </View>
    </View>
  );
};

// Backtracking Visualization
const BacktrackingViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [path, setPath] = useState<string[]>([]);
  const [results, setResults] = useState<string[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const allPaths = [
    ['('],
    ['(', '('],
    ['(', '(', ')'],
    ['(', '(', ')', '('],
    ['(', '(', ')', '(', ')'],
    ['(', '(', ')', '(', ')', ')'], // "(()())" - result 1
    ['(', '(', ')', ')'],
    ['(', '(', ')', ')', '('],
    ['(', '(', ')', ')', '(', ')'], // "(())()" - result 2
    ['(', '(', ')'],
    ['(', '(', ')', ')'],
    ['(', ')'],
    ['(', ')', '('],
    ['(', ')', '(', '('],
    ['(', ')', '(', '(', ')'],
    ['(', ')', '(', '(', ')', ')'], // "()(())" - result 3
    ['(', ')', '(', ')'],
    ['(', ')', '(', ')', '('],
    ['(', ')', '(', ')', '(', ')'], // "()()()" - result 4
  ];

  const resultSteps = [5, 8, 15, 18];

  useEffect(() => {
    if (isPlaying && step < allPaths.length) {
      const timer = setTimeout(() => {
        setPath(allPaths[step]);
        if (resultSteps.includes(step)) {
          setResults(prev => [...prev, allPaths[step]]);
        }
        setStep(s => s + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else if (step >= allPaths.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, step]);

  const reset = () => {
    setPath([]);
    setResults([]);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Backtracking</Text>
      <Text style={styles.vizSubtitle}>Generate valid parentheses (n=3)</Text>

      <View style={styles.pathContainer}>
        <Text style={styles.pathLabel}>Current path:</Text>
        <View style={styles.pathDisplay}>
          {path.map((char, idx) => (
            <View key={idx} style={[styles.pathChar, { backgroundColor: char === '(' ? catColors.color : colors.secondary }]}>
              <Text style={styles.pathCharText}>{char}</Text>
            </View>
          ))}
          {path.length === 0 && <Text style={styles.emptyPath}>Start</Text>}
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsLabel}>Valid combinations found:</Text>
        <View style={styles.resultsList}>
          {results.map((result, idx) => (
            <View key={idx} style={[styles.resultItem, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.resultText, { color: colors.primary }]}>{result.join('')}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Open Count</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>{path.filter(c => c === '(').length}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: `${colors.secondary}15` }]}>
          <Text style={styles.statLabel}>Close Count</Text>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{path.filter(c => c === ')').length}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Add '(' if open {'<'} n. Add ')' if close {'<'} open. Backtrack when path complete.
        </Text>
      </View>
    </View>
  );
};

// 0/1 Knapsack Visualization
const KnapsackViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const weights = [1, 2, 3];
  const values = [6, 10, 12];
  const capacity = 5;

  const [dp, setDp] = useState<number[][]>([]);
  const [currentCell, setCurrentCell] = useState<[number, number] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const initDp = () => {
    const newDp: number[][] = [];
    for (let i = 0; i <= weights.length; i++) {
      newDp.push(new Array(capacity + 1).fill(0));
    }
    return newDp;
  };

  useEffect(() => {
    if (dp.length === 0) {
      setDp(initDp());
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const totalCells = weights.length * (capacity + 1);
    if (step >= totalCells) {
      setIsPlaying(false);
      setCurrentCell(null);
      return;
    }

    const timer = setTimeout(() => {
      const i = Math.floor(step / (capacity + 1)) + 1;
      const w = step % (capacity + 1);

      setCurrentCell([i, w]);
      setDp(prev => {
        const newDp = prev.map(row => [...row]);
        if (weights[i - 1] <= w) {
          newDp[i][w] = Math.max(
            newDp[i - 1][w],
            newDp[i - 1][w - weights[i - 1]] + values[i - 1]
          );
        } else {
          newDp[i][w] = newDp[i - 1][w];
        }
        return newDp;
      });
      setStep(s => s + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const reset = () => {
    setDp(initDp());
    setCurrentCell(null);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>0/1 Knapsack</Text>
      <Text style={styles.vizSubtitle}>Capacity={capacity}, Items: w=[{weights.join(',')}], v=[{values.join(',')}]</Text>

      <View style={styles.dpTableContainer}>
        <View style={styles.dpRow}>
          <View style={styles.dpHeaderCell}><Text style={styles.dpHeaderText}>w→</Text></View>
          {Array.from({ length: capacity + 1 }, (_, i) => (
            <View key={i} style={styles.dpHeaderCell}>
              <Text style={styles.dpHeaderText}>{i}</Text>
            </View>
          ))}
        </View>
        {dp.map((row, i) => (
          <View key={i} style={styles.dpRow}>
            <View style={styles.dpHeaderCell}>
              <Text style={styles.dpHeaderText}>{i === 0 ? '0' : `i${i}`}</Text>
            </View>
            {row.map((val, w) => (
              <View
                key={w}
                style={[
                  styles.dpCell,
                  currentCell && currentCell[0] === i && currentCell[1] === w && { backgroundColor: catColors.color },
                  i > 0 && val > 0 && !(currentCell && currentCell[0] === i && currentCell[1] === w) && { backgroundColor: `${catColors.color}30` },
                ]}
              >
                <Text style={[
                  styles.dpCellText,
                  currentCell && currentCell[0] === i && currentCell[1] === w && { color: colors.white },
                ]}>
                  {val}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: `${catColors.color}15` }]}>
          <Text style={styles.statLabel}>Max Value</Text>
          <Text style={[styles.statValue, { color: catColors.color }]}>
            {dp.length > 0 ? dp[weights.length][capacity] : 0}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          dp[i][w] = max(skip item, take item if fits). O(n×W) time.
        </Text>
      </View>
    </View>
  );
};

// Monotonic Stack Visualization
const MonotonicStackViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [nums] = useState([2, 1, 2, 4, 3]);
  const [stack, setStack] = useState<number[]>([]);
  const [result, setResult] = useState<number[]>(new Array(5).fill(-1));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || currentIdx >= nums.length) {
      if (currentIdx >= nums.length) setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const newStack = [...stack];
      const newResult = [...result];

      // Pop smaller elements
      while (newStack.length > 0 && nums[currentIdx] > nums[newStack[newStack.length - 1]]) {
        const idx = newStack.pop()!;
        newResult[idx] = nums[currentIdx];
      }
      newStack.push(currentIdx);

      setStack(newStack);
      setResult(newResult);
      setCurrentIdx(idx => idx + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIdx]);

  const reset = () => {
    setStack([]);
    setResult(new Array(5).fill(-1));
    setCurrentIdx(0);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Monotonic Stack</Text>
      <Text style={styles.vizSubtitle}>Find next greater element</Text>

      <View style={styles.arrayContainer}>
        {nums.map((val, idx) => (
          <ArrayCell
            key={idx}
            value={val}
            index={idx}
            isHighlighted={idx === currentIdx || stack.includes(idx)}
            highlightColor={idx === currentIdx ? colors.accent : catColors.color}
            isPointer={idx === currentIdx}
            pointerLabel="i"
          />
        ))}
      </View>

      <View style={styles.stackContainer}>
        <Text style={styles.stackLabel}>Stack (indices):</Text>
        <View style={styles.stackDisplay}>
          {stack.length > 0 ? stack.map((idx, i) => (
            <View key={i} style={[styles.stackItem, { backgroundColor: catColors.color }]}>
              <Text style={styles.stackItemText}>{idx}</Text>
            </View>
          )) : <Text style={styles.emptyStack}>Empty</Text>}
        </View>
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>NGE Result:</Text>
        <View style={styles.resultDisplay}>
          {result.map((val, idx) => (
            <View key={idx} style={[styles.resultCell, val !== -1 && { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.resultCellText, val !== -1 && { color: colors.primary }]}>{val}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Maintain decreasing stack. When larger element found, it's NGE for popped elements.
        </Text>
      </View>
    </View>
  );
};

// Topological Sort Visualization
const TopologicalSortViz = ({ catColors }: { catColors: { color: string; dark: string } }) => {
  const [visited, setVisited] = useState<number[]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Graph: 5→0, 5→2, 4→0, 4→1, 2→3, 3→1
  const order = [5, 4, 2, 3, 1, 0];
  const nodes = [0, 1, 2, 3, 4, 5];

  useEffect(() => {
    if (isPlaying && visited.length < order.length) {
      const timer = setTimeout(() => {
        const nextNode = order[visited.length];
        setVisited(prev => [...prev, nextNode]);
        setResult(prev => [...prev, nextNode]);
      }, 800);
      return () => clearTimeout(timer);
    } else if (visited.length >= order.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, visited]);

  const reset = () => {
    setVisited([]);
    setResult([]);
    setIsPlaying(false);
  };

  return (
    <View style={styles.vizContainer}>
      <Text style={styles.vizTitle}>Topological Sort</Text>
      <Text style={styles.vizSubtitle}>Order tasks by dependencies</Text>

      <View style={styles.graphContainer}>
        <View style={styles.graphRow}>
          {[5, 4].map(node => (
            <View
              key={node}
              style={[
                styles.graphNode,
                visited.includes(node) && { backgroundColor: catColors.color, borderColor: catColors.color },
              ]}
            >
              <Text style={[styles.graphNodeText, visited.includes(node) && { color: colors.white }]}>
                {node}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.graphRow}>
          {[2, 0, 1].map(node => (
            <View
              key={node}
              style={[
                styles.graphNode,
                visited.includes(node) && { backgroundColor: catColors.color, borderColor: catColors.color },
              ]}
            >
              <Text style={[styles.graphNodeText, visited.includes(node) && { color: colors.white }]}>
                {node}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.graphRow}>
          {[3].map(node => (
            <View
              key={node}
              style={[
                styles.graphNode,
                visited.includes(node) && { backgroundColor: catColors.color, borderColor: catColors.color },
              ]}
            >
              <Text style={[styles.graphNodeText, visited.includes(node) && { color: colors.white }]}>
                {node}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.visitOrder}>
        <Text style={styles.visitLabel}>Topological Order: </Text>
        <Text style={[styles.visitValues, { color: catColors.color }]}>
          [{result.join(' → ')}]
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={reset}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.playBtn, { backgroundColor: catColors.color }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Ionicons name="bulb-outline" size={18} color={catColors.color} />
        <Text style={styles.explanationText}>
          Process nodes with no incoming edges first (indegree = 0). Use BFS with queue.
        </Text>
      </View>
    </View>
  );
};

// Main Component
export default function VisualizeTab({ category, catColors }: VisualizeTabProps) {
  const renderVisualization = () => {
    switch (category.id) {
      case 'sliding-window':
        return <SlidingWindowViz catColors={catColors} />;
      case 'two-pointers':
        return <TwoPointersViz catColors={catColors} />;
      case 'fast-slow-pointers':
        return <FastSlowViz catColors={catColors} />;
      case 'merge-intervals':
        return <MergeIntervalsViz catColors={catColors} />;
      case 'binary-search':
        return <BinarySearchViz catColors={catColors} />;
      case 'tree-bfs':
        return <TreeBFSViz catColors={catColors} />;
      case 'cyclic-sort':
        return <CyclicSortViz catColors={catColors} />;
      case 'linked-list-reversal':
        return <LinkedListReversalViz catColors={catColors} />;
      case 'tree-dfs':
        return <TreeDFSViz catColors={catColors} />;
      case 'two-heaps':
        return <TwoHeapsViz catColors={catColors} />;
      case 'subsets':
        return <SubsetsViz catColors={catColors} />;
      case 'top-k-elements':
        return <TopKViz catColors={catColors} />;
      case 'k-way-merge':
        return <KWayMergeViz catColors={catColors} />;
      case 'topological-sort':
        return <TopologicalSortViz catColors={catColors} />;
      case 'island-matrix':
        return <IslandMatrixViz catColors={catColors} />;
      case 'bitwise-xor':
        return <BitwiseXorViz catColors={catColors} />;
      case 'backtracking':
        return <BacktrackingViz catColors={catColors} />;
      case 'knapsack-dp':
        return <KnapsackViz catColors={catColors} />;
      case 'monotonic-stack':
        return <MonotonicStackViz catColors={catColors} />;
      default:
        return (
          <View style={styles.noViz}>
            <Ionicons name="analytics-outline" size={48} color={colors.inkLighter} />
            <Text style={styles.noVizText}>
              Visualizations are available for algorithm patterns
            </Text>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: `${catColors.color}20` }]}>
          <Ionicons name="analytics" size={24} color={catColors.color} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Interactive Visualization</Text>
          <Text style={styles.headerSubtitle}>See the algorithm in action</Text>
        </View>
      </View>

      {renderVisualization()}

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: colors.ink,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.inkLight,
  },
  vizContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  vizTitle: {
    ...typography.headlineMedium,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  vizSubtitle: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  arrayContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
    position: 'relative',
    paddingTop: 30,
  },
  cellContainer: {
    alignItems: 'center',
    marginHorizontal: CELL_GAP / 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    ...typography.labelLarge,
  },
  indexText: {
    ...typography.labelSmall,
    color: colors.inkLighter,
    marginTop: spacing.xs,
  },
  pointerContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
  },
  pointerLabel: {
    ...typography.labelSmall,
    fontWeight: 'bold',
  },
  window: {
    position: 'absolute',
    height: CELL_SIZE + 16,
    top: 22,
    left: 0,
    zIndex: -1,
  },
  windowBorder: {
    flex: 1,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.labelLarge,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  explanation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  explanationText: {
    ...typography.bodySmall,
    color: colors.inkLight,
    flex: 1,
  },
  linkedListContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  nodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  node: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleNode: {
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  nodeText: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  cycleArrow: {
    position: 'absolute',
    right: -20,
    top: -10,
  },
  pointerTag: {
    position: 'absolute',
    top: -20,
    left: 14,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerTagText: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  intervalsContainer: {
    marginBottom: spacing.lg,
  },
  intervalLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  intervalRow: {
    height: 40,
    position: 'relative',
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  interval: {
    position: 'absolute',
    height: 32,
    top: 4,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  intervalText: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: 'bold',
  },
  stepIndicator: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  stepText: {
    ...typography.bodyMedium,
    color: colors.ink,
    textAlign: 'center',
  },
  treeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  treeLevel: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  treeNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeNodeText: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  queueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  queueLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  queue: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
  },
  queueItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  queueItemText: {
    ...typography.labelMedium,
    color: colors.white,
  },
  emptyQueue: {
    ...typography.bodySmall,
    color: colors.inkLighter,
    fontStyle: 'italic',
  },
  noViz: {
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  noVizText: {
    ...typography.bodyMedium,
    color: colors.inkLight,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  // Two Heaps styles
  streamContainer: {
    marginBottom: spacing.lg,
  },
  streamLabel: {
    ...typography.bodyMedium,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  heapsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  heapBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  heapTitle: {
    ...typography.labelLarge,
    marginBottom: spacing.xs,
  },
  heapSubtitle: {
    ...typography.labelSmall,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  heapValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 40,
  },
  heapValue: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heapValueText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  emptyHeap: {
    ...typography.bodySmall,
    color: colors.inkLighter,
    fontStyle: 'italic',
  },
  medianBox: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  medianLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  medianValue: {
    ...typography.displaySmall,
    fontWeight: 'bold',
  },
  // List section styles
  listSection: {
    marginBottom: spacing.lg,
  },
  listLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  // DFS mode selector
  modeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    justifyContent: 'center',
  },
  modeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  modeBtnText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  visitOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  visitLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  visitValues: {
    ...typography.labelMedium,
    flex: 1,
  },
  // Subsets styles
  subsetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  subsetBox: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  subsetText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  // K-Way Merge styles
  kListsContainer: {
    marginBottom: spacing.lg,
  },
  kList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kListLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    width: 60,
  },
  kListValues: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  kListItem: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kListItemText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  mergedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mergedLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    width: 70,
  },
  mergedValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  mergedItem: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  mergedItemText: {
    ...typography.labelMedium,
  },
  // Topological Sort styles
  graphContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  graphRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  graphNode: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphNodeText: {
    ...typography.labelLarge,
    color: colors.ink,
  },
  // Island Matrix styles
  gridContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  gridCell: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  landCell: {
    backgroundColor: colors.inkLight,
  },
  gridCellText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  // XOR styles
  xorContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  xorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  xorLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    width: 80,
  },
  xorBinary: {
    ...typography.labelLarge,
    fontFamily: 'monospace',
  },
  xorDecimal: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  // Backtracking styles
  pathContainer: {
    marginBottom: spacing.lg,
  },
  pathLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  pathDisplay: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
    alignItems: 'center',
  },
  pathChar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathCharText: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyPath: {
    ...typography.bodySmall,
    color: colors.inkLighter,
    fontStyle: 'italic',
  },
  resultsContainer: {
    marginBottom: spacing.lg,
  },
  resultsLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  resultsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  resultItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resultText: {
    ...typography.labelMedium,
    fontFamily: 'monospace',
  },
  // DP Table styles
  dpTableContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dpRow: {
    flexDirection: 'row',
  },
  dpHeaderCell: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpHeaderText: {
    ...typography.labelSmall,
    color: colors.inkLight,
  },
  dpCell: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  dpCellText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
  // Monotonic Stack styles
  stackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stackLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  stackDisplay: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  stackItem: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackItemText: {
    ...typography.labelMedium,
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyStack: {
    ...typography.bodySmall,
    color: colors.inkLighter,
    fontStyle: 'italic',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  resultLabel: {
    ...typography.labelMedium,
    color: colors.inkLight,
  },
  resultDisplay: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  resultCell: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCellText: {
    ...typography.labelMedium,
    color: colors.ink,
  },
});
