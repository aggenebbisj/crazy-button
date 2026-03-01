import React from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';
import { ButtonShape } from '../types';

export type ButtonPattern = 'none' | 'dots' | 'stripes' | 'zigzag' | 'stars' | 'flowers';

interface Props {
  color: string;
  shape: ButtonShape;
  pattern?: ButtonPattern;
  emoji?: string;
  pressesRemaining: number;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ShapeSvg({ shape, color, size }: { shape: ButtonShape; color: string; size: number }) {
  if (shape === 'heart') {
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path
          d="M60 100 C60 100, 10 70, 10 40 C10 20, 30 10, 45 10 C52 10, 57 14, 60 20 C63 14, 68 10, 75 10 C90 10, 110 20, 110 40 C110 70, 60 100, 60 100Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (shape === 'star') {
    const cx = 60, cy = 60, outerR = 55, innerR = 22;
    const points: string[] = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI / 2) + (2 * Math.PI * i / 5);
      const innerAngle = outerAngle + Math.PI / 5;
      points.push(`${cx + outerR * Math.cos(outerAngle)},${cy - outerR * Math.sin(outerAngle)}`);
      points.push(`${cx + innerR * Math.cos(innerAngle)},${cy - innerR * Math.sin(innerAngle)}`);
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path d={`M${points.join('L')}Z`} fill={color} />
      </Svg>
    );
  }

  return null;
}

function PatternOverlay({ pattern, size }: { pattern: ButtonPattern; size: number }) {
  if (pattern === 'none') return null;

  const patternColor = 'rgba(255,255,255,0.25)';

  if (pattern === 'dots') {
    const dots = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        dots.push(
          <Circle
            key={`${row}-${col}`}
            cx={15 + col * 24}
            cy={15 + row * 24}
            r={4}
            fill={patternColor}
          />,
        );
      }
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        {dots}
      </Svg>
    );
  }

  if (pattern === 'stripes') {
    const lines = [];
    for (let i = -120; i < 240; i += 16) {
      lines.push(
        <Line
          key={i}
          x1={i}
          y1={0}
          x2={i - 60}
          y2={120}
          stroke={patternColor}
          strokeWidth={6}
        />,
      );
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        {lines}
      </Svg>
    );
  }

  if (pattern === 'zigzag') {
    let d = '';
    for (let y = 10; y < 120; y += 20) {
      for (let x = 0; x < 120; x += 20) {
        d += `${d ? 'L' : 'M'}${x},${y} L${x + 10},${y - 8} L${x + 20},${y} `;
      }
      d += `M0,${y + 20} `;
    }
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Path d={d} stroke={patternColor} strokeWidth={2.5} fill="none" />
      </Svg>
    );
  }

  if (pattern === 'flowers') {
    const flowerPositions = [
      { x: 25, y: 20 }, { x: 70, y: 15 }, { x: 100, y: 35 },
      { x: 15, y: 60 }, { x: 55, y: 55 }, { x: 90, y: 70 },
      { x: 30, y: 95 }, { x: 75, y: 100 },
    ];
    const petalColors = [
      'rgba(255,182,193,0.4)', 'rgba(255,218,185,0.4)', 'rgba(221,160,221,0.4)',
      'rgba(173,216,230,0.4)', 'rgba(255,255,200,0.4)', 'rgba(200,255,200,0.4)',
      'rgba(255,182,193,0.4)', 'rgba(221,160,221,0.4)',
    ];
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        {flowerPositions.map((pos, i) => {
          const r = 6;
          const petals = [];
          for (let p = 0; p < 5; p++) {
            const angle = (p * 2 * Math.PI) / 5;
            petals.push(
              <Circle
                key={`${i}-p${p}`}
                cx={pos.x + Math.cos(angle) * r}
                cy={pos.y + Math.sin(angle) * r}
                r={5}
                fill={petalColors[i]}
              />,
            );
          }
          petals.push(
            <Circle key={`${i}-c`} cx={pos.x} cy={pos.y} r={3} fill="rgba(255,255,100,0.5)" />,
          );
          return petals;
        })}
      </Svg>
    );
  }

  if (pattern === 'stars') {
    const miniStars = [
      { x: 20, y: 20 }, { x: 60, y: 15 }, { x: 100, y: 25 },
      { x: 35, y: 55 }, { x: 85, y: 50 },
      { x: 20, y: 90 }, { x: 60, y: 95 }, { x: 100, y: 85 },
    ];
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        {miniStars.map((pos, i) => {
          const s = 7;
          const d = `M${pos.x},${pos.y - s} L${pos.x + s * 0.3},${pos.y - s * 0.3} L${pos.x + s},${pos.y} L${pos.x + s * 0.3},${pos.y + s * 0.3} L${pos.x},${pos.y + s} L${pos.x - s * 0.3},${pos.y + s * 0.3} L${pos.x - s},${pos.y} L${pos.x - s * 0.3},${pos.y - s * 0.3}Z`;
          return <Path key={i} d={d} fill={patternColor} />;
        })}
      </Svg>
    );
  }

  return null;
}

export function CrazyButton({ color, shape, pattern = 'none', emoji = '🤪', pressesRemaining, onPress, disabled }: Props) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const actualColor = disabled ? COLORS.textSecondary : color;

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  function handlePress() {
    if (disabled || pressesRemaining <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.3, { damping: 3, stiffness: 200 }),
      withSpring(1, { damping: 8 }),
    );
    rotation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );

    onPress();
  }

  const useSvgShape = shape === 'heart' || shape === 'star';
  const borderRadius = shape === 'circle' ? 60 : shape === 'square' ? 16 : 60;

  return (
    <View style={styles.container}>
      <AnimatedPressable onPress={handlePress} style={[styles.buttonWrap, animatedStyle]}>
        {useSvgShape ? (
          <View style={styles.svgButton}>
            <ShapeSvg shape={shape} color={actualColor} size={120} />
            <View style={styles.svgOverlay}>
              <PatternOverlay pattern={pattern} size={120} />
            </View>
            <View style={styles.svgEmoji}>
              <Text style={styles.buttonText}>
                {pressesRemaining > 0 ? emoji : '😴'}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.button,
              {
                backgroundColor: actualColor,
                borderRadius,
                overflow: 'hidden',
              },
            ]}
          >
            <PatternOverlay pattern={pattern} size={120} />
            <Text style={styles.buttonText}>
              {pressesRemaining > 0 ? emoji : '😴'}
            </Text>
          </View>
        )}
      </AnimatedPressable>
      <Text style={styles.counter}>
        Nog {pressesRemaining} drukken vandaag
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonWrap: {
    width: 120,
    height: 120,
  },
  svgButton: {
    width: 120,
    height: 120,
  },
  svgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  svgEmoji: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 48,
  },
  counter: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
