import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/theme';
import { InviteShare } from '../components/InviteShare';

interface Props {
  inviteCode: string;
  groupName: string;
  onBack: () => void;
}

export function InviteScreen({ inviteCode, groupName, onBack }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'‹'}</Text>
        <Text style={styles.title}>Uitnodigen</Text>
        <View style={styles.placeholder} />
      </View>

      <InviteShare inviteCode={inviteCode} groupName={groupName} />
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
});
