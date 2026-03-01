import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  onJoin: (code: string) => Promise<boolean>;
  onBack: () => void;
}

export function JoinGroupScreen({ onJoin, onBack }: Props) {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    if (!code.trim() || joining) return;
    setJoining(true);
    setError('');
    const success = await onJoin(code.trim());
    if (!success) {
      setError('Groep niet gevonden. Klopt de code?');
    }
    setJoining(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'‹'}</Text>
        <Text style={styles.title}>Join een groep</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Uitnodigingscode</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(text) => { setCode(text); setError(''); }}
          placeholder="Plak de code hier..."
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          autoFocus
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleJoin}
          style={[styles.joinButton, !code.trim() && styles.disabled]}
          disabled={!code.trim() || joining}
        >
          <Text style={styles.joinButtonText}>
            {joining ? 'Joinen...' : 'Join groep 🚀'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    color: COLORS.primary,
    fontSize: 32,
    padding: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: { width: 40 },
  form: {
    padding: 24,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    letterSpacing: 2,
    textAlign: 'center',
  },
  error: {
    color: COLORS.accent1,
    textAlign: 'center',
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: COLORS.accent2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '600',
  },
});
