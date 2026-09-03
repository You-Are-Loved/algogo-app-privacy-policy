// Shared bottom sheet used for every "slides up from the bottom" surface in
// the app (problem briefs, results, explanations, topic pickers, the paywall).
//
// Why not RN Modal's animationType="slide"? That slides the *whole* modal —
// backdrop included — so the dim layer visibly flies up with the sheet. Here
// the backdrop is a blur that fades in place while only the sheet translates,
// with pure timing curves (no spring). Dragging the header down dismisses.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { colors, spacing } from '../theme';

const OPEN_MS = 300;
const CLOSE_MS = 200;

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Drag handle region rendered under the grabber (title row etc.). */
  header?: React.ReactNode;
  /** Sheet body. Put long content in a ScrollView with a maxHeight. */
  children: React.ReactNode;
  /** Set false for sheets that shouldn't close on backdrop tap. */
  dismissOnBackdrop?: boolean;
  /** Extra styles for the sheet container (e.g. padding overrides). */
  sheetStyle?: ViewStyle;
  /** Blur strength for the backdrop. */
  blurIntensity?: number;
}

export default function BottomSheetModal({
  visible,
  onClose,
  header,
  children,
  dismissOnBackdrop = true,
  sheetStyle,
  blurIntensity = 18,
}: Props) {
  // Stay mounted through the close animation, then unmount.
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0); // 0 closed .. 1 open
  const dragY = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const sheetHeight = useSharedValue(Dimensions.get('window').height);
  const closingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      setMounted(true);
      dragY.value = 0;
      progress.value = withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      progress.value = withTiming(
        0,
        { duration: CLOSE_MS, easing: Easing.in(Easing.quad) },
        (done) => {
          if (done) runOnJS(setMounted)(false);
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    onClose();
  }, [onClose]);

  const pan = Gesture.Pan()
    .onStart(() => {
      dragStartY.value = dragY.value;
    })
    .onUpdate((e) => {
      dragY.value = Math.max(0, dragStartY.value + e.translationY);
    })
    .onEnd((e) => {
      if (dragY.value > 120 || e.velocityY > 900) {
        runOnJS(requestClose)();
      } else {
        dragY.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetHeight.value + dragY.value }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={requestClose}
    >
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <BlurView intensity={blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable
          style={styles.backdrop}
          onPress={dismissOnBackdrop ? requestClose : undefined}
          accessibilityLabel="Close"
        />
      </Animated.View>

      <View style={styles.sheetHost} pointerEvents="box-none">
        <Animated.View
          style={[styles.sheet, sheetStyle, sheetAnimStyle]}
          onLayout={(e) => {
            sheetHeight.value = e.nativeEvent.layout.height;
          }}
        >
          <GestureDetector gesture={pan}>
            <View>
              <View style={styles.grabber} />
              {header}
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 25, 0.28)',
  },
  sheetHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
});
