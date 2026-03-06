import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import { ButtonShape } from '../types';
import { ButtonPattern } from '../components/CrazyButton';
import { BgPattern } from '../components/BackgroundPattern';

interface Customization {
  buttonColor: string;
  buttonShape: ButtonShape;
  buttonPattern: ButtonPattern;
  buttonEmoji: string;
  bgColor: string;
  bgPattern: BgPattern;
}

const DEFAULTS: Customization = {
  buttonColor: COLORS.primary,
  buttonShape: 'circle',
  buttonPattern: 'none',
  buttonEmoji: '🤪',
  bgColor: COLORS.background,
  bgPattern: 'none',
};

const STORAGE_KEY = 'crazy-button-customization';

export function useCustomization() {
  const [customization, setCustomization] = useState<Customization>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setCustomization({ ...DEFAULTS, ...JSON.parse(stored) });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  // Save to storage whenever customization changes
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
    }
  }, [customization, loaded]);

  function update(key: keyof Customization, value: string) {
    setCustomization((prev) => ({ ...prev, [key]: value }));
  }

  return { ...customization, update, loaded };
}
