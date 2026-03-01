import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { BUBBLE_COLORS } from '../constants/theme';

interface Props {
  message: string;
  onDone: () => void;
}

export function FlyingBubble({ message, onDone }: Props) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

  useEffect(() => {
    // Pop in
    scale.value = withSequence(
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 100 }),
    );

    // Fly up after a short pause
    translateY.value = withDelay(
      400,
      withTiming(-500, { duration: 800, easing: Easing.in(Easing.quad) }),
    );

    // Fade out at the end
    opacity.value = withDelay(
      900,
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onDone)();
        }
      }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.bubble, animatedStyle, { backgroundColor: color + '30', borderColor: color }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: 180,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    maxWidth: '80%',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
});
