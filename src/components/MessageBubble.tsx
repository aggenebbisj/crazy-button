import React from 'react';
import { StyleSheet, View, Text, Pressable, Image, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, BUBBLE_COLORS } from '../constants/theme';
import { Message } from '../types';

interface Props {
  message: Message;
  isAnonymous: boolean;
  onLike: (messageId: string) => void;
  index: number;
}

function MessageContent({ message }: { message: Message }) {
  if (message.content_type === 'sticker') {
    return <Text style={styles.sticker}>{message.content}</Text>;
  }

  if (message.content_type === 'gif') {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.gifContainer}>
          <img
            src={message.content}
            style={{ width: '100%', height: 200, objectFit: 'contain', borderRadius: 12 }}
            alt="GIF"
          />
        </View>
      );
    }
    return (
      <View style={styles.gifContainer}>
        <Image
          source={{ uri: message.content }}
          style={styles.gif}
          resizeMode="contain"
        />
      </View>
    );
  }

  return <Text style={styles.content}>{message.content}</Text>;
}

export function MessageBubble({ message, isAnonymous, onLike, index }: Props) {
  const bubbleColor = BUBBLE_COLORS[index % BUBBLE_COLORS.length];

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).springify()}
      style={[styles.bubble, { backgroundColor: bubbleColor + '20', borderColor: bubbleColor }]}
    >
      <MessageContent message={message} />
      <View style={styles.footer}>
        <Text style={styles.sender}>
          {isAnonymous ? '???' : (message.sender_name ?? 'Anoniem')}
        </Text>
        <Pressable onPress={() => onLike(message.id)} style={styles.likeButton}>
          <Text style={styles.likeText}>
            {message.liked_by_me ? '❤️' : '🤍'} {message.like_count ?? 0}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  content: {
    color: COLORS.text,
    fontSize: 18,
    textAlign: 'center',
  },
  sticker: {
    fontSize: 72,
    textAlign: 'center',
    lineHeight: 90,
  },
  gifContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  gif: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sender: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  likeButton: {
    padding: 4,
  },
  likeText: {
    fontSize: 14,
  },
});
