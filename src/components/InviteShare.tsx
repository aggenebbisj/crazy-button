import React from 'react';
import { StyleSheet, View, Text, Pressable, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/theme';

interface Props {
  inviteCode: string;
  groupName: string;
}

export function InviteShare({ inviteCode, groupName }: Props) {
  async function handleShare() {
    await Share.share({
      message: `Join mijn Crazy Button groep "${groupName}"! 🤪\n\nGebruik deze code: ${inviteCode}`,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nodig vrienden uit!</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={inviteCode}
          size={160}
          backgroundColor={COLORS.surface}
          color={COLORS.text}
        />
      </View>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Code:</Text>
        <Text style={styles.code}>{inviteCode}</Text>
      </View>

      <Pressable onPress={handleShare} style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Deel uitnodiging 📤</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginRight: 8,
  },
  code: {
    color: COLORS.accent3,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  shareButton: {
    backgroundColor: COLORS.accent2,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  shareButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
