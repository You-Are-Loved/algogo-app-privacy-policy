import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Path lengths in the 1024×1024 coordinate space (slightly padded so the
// strokes fully hide at full dashoffset).
const LEG = 430; // each diagonal leg ≈423
const BAR = 220; // crossbar = 214
const NODE_R = 80;

const EASE = Easing.inOut(Easing.cubic);
// Spring tuned for a ~1.15 overshoot then settle (0 → 1.15 → 1.0).
const NODE_SPRING = { damping: 9, stiffness: 170, mass: 0.6 } as const;

const LOGO_SIZE = 220;

/**
 * One-shot "logo forming" splash. Plays the draw-in sequence (~1.7s) over a
 * white field, then fades out and calls onDone. Render it as an absolute
 * overlay above the app root; the caller decides whether to show it at all
 * (we only play it before onboarding is done).
 */
export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const leftOff = useSharedValue(LEG);
  const rightOff = useSharedValue(LEG);
  const barOff = useSharedValue(BAR);
  const topR = useSharedValue(0);
  const blR = useSharedValue(0);
  const brR = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Strokes draw in (dashoffset length → 0).
    leftOff.value = withDelay(100, withTiming(0, { duration: 550, easing: EASE }));
    rightOff.value = withDelay(300, withTiming(0, { duration: 550, easing: EASE }));
    barOff.value = withDelay(600, withTiming(0, { duration: 400, easing: EASE }));
    // Nodes pop in (radius 0 → 80 with overshoot).
    blR.value = withDelay(650, withSpring(NODE_R, NODE_SPRING));
    brR.value = withDelay(800, withSpring(NODE_R, NODE_SPRING));
    topR.value = withDelay(950, withSpring(NODE_R, NODE_SPRING));
    // Hold, then fade the whole splash out into the app root.
    opacity.value = withDelay(
      1400,
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leftProps = useAnimatedProps(() => ({ strokeDashoffset: leftOff.value }));
  const rightProps = useAnimatedProps(() => ({ strokeDashoffset: rightOff.value }));
  const barProps = useAnimatedProps(() => ({ strokeDashoffset: barOff.value }));
  const topProps = useAnimatedProps(() => ({ r: topR.value }));
  const blProps = useAnimatedProps(() => ({ r: blR.value }));
  const brProps = useAnimatedProps(() => ({ r: brR.value }));
  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
      <Svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 1024 1024">
        <AnimatedLine
          x1={512} y1={310} x2={348} y2={700}
          stroke="#CDD0E0" strokeWidth={28} strokeLinecap="round"
          strokeDasharray={LEG} animatedProps={leftProps}
        />
        <AnimatedLine
          x1={512} y1={310} x2={676} y2={700}
          stroke="#CDD0E0" strokeWidth={28} strokeLinecap="round"
          strokeDasharray={LEG} animatedProps={rightProps}
        />
        <AnimatedLine
          x1={405} y1={565} x2={619} y2={565}
          stroke="#CDD0E0" strokeWidth={28} strokeLinecap="round"
          strokeDasharray={BAR} animatedProps={barProps}
        />
        <AnimatedCircle cx={348} cy={700} r={0} fill="#8E97EC" animatedProps={blProps} />
        <AnimatedCircle cx={676} cy={700} r={0} fill="#5EC97D" animatedProps={brProps} />
        <AnimatedCircle cx={512} cy={310} r={0} fill="#EF7A63" animatedProps={topProps} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
