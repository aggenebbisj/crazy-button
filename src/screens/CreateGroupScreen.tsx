import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Switch } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  onCreate: (name: string, isAnonymous: boolean) => Promise<void>;
  onBack: () => void;
}

export function CreateGroupScreen({ onCreate, onBack }: Props) {
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);
    await onCreate(name.trim(), isAnonymous);
    setCreating(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'‹'}</Text>
        <Text style={styles.title}>Nieuwe groep</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Groepsnaam</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="bv. Familie, Klas 6B..."
          placeholderTextColor={COLORS.textSecondary}
          autoFocus
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Anonieme berichten</Text>
            <Text style={styles.hint}>Niemand ziet wie op de knop drukte</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        <Pressable
          onPress={handleCreate}
          style={[styles.createButton, !name.trim() && styles.disabled]}
          disabled={!name.trim() || creating}
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Aanmaken...' : 'Groep aanmaken 🎉'}
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
  hint: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
