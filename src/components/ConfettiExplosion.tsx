import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export interface ConfettiRef {
  fire: () => void;
}

export const ConfettiExplosion = forwardRef<ConfettiRef>((_props, ref) => {
  const confettiRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    fire: () => {
      confettiRef.current?.start();
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={80}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        explosionSpeed={350}
        fallSpeed={3000}
        colors={['#e94560', '#4ecdc4', '#ffe66d', '#a855f7', '#06d6a0', '#ff6b6b', '#3b82f6']}
      />
    </View>
  );
});
