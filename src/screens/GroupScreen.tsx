import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { COLORS } from '../constants/theme';
import { getRandomMessageAsync } from '../constants/messages';
import { useGroupMessages } from '../hooks/useGroupMessages';
import { CrazyButton } from '../components/CrazyButton';
import { MessageBubble } from '../components/MessageBubble';
import { ConfettiExplosion, ConfettiRef } from '../components/ConfettiExplosion';
import { Message } from '../types';

interface Props {
  groupId: string;
  groupName: string;
  isAnonymous: boolean;
  userId: string;
  buttonColor: string;
  buttonShape: 'circle' | 'square' | 'star' | 'heart';
  onBack: () => void;
  onScoreboard: () => void;
  onInvite: () => void;
}

export function GroupScreen({
  groupId,
  groupName,
  isAnonymous,
  userId,
  buttonColor,
  buttonShape,
  onBack,
  onScoreboard,
  onInvite,
}: Props) {
  const { messages, pressesRemaining, sendPress, toggleLike } = useGroupMessages(groupId, userId);
  const confettiRef = useRef<ConfettiRef>(null);

  const handlePress = useCallback(async () => {
    const randomMessage = await getRandomMessageAsync();
    const success = await sendPress(randomMessage.type, randomMessage.content);
    if (success) {
      confettiRef.current?.fire();
    }
  }, [sendPress]);

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => (
    <MessageBubble
      message={item}
      isAnonymous={isAnonymous}
      onLike={toggleLike}
      index={index}
    />
  ), [isAnonymous, toggleLike]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'‹'}</Text>
        <Text style={styles.title}>{groupName}</Text>
        <View style={styles.headerActions}>
          <Text onPress={onInvite} style={styles.headerButton}>📤</Text>
          <Text onPress={onScoreboard} style={styles.headerButton}>🏆</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nog geen berichten!{'\n'}Druk op de knop! 🤪
          </Text>
        }
      />

      <CrazyButton
        color={buttonColor}
        shape={buttonShape}
        pressesRemaining={pressesRemaining}
        onPress={handlePress}
      />

      <ConfettiExplosion ref={confettiRef} />
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    fontSize: 22,
    padding: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    lineHeight: 24,
  },
});
