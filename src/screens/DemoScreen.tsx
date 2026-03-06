import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, Text, Pressable, ScrollView } from 'react-native';
import { COLORS, BUBBLE_COLORS } from '../constants/theme';
import { getRandomMessageAsync } from '../constants/messages';
import { CrazyButton, ButtonPattern } from '../components/CrazyButton';
import { MessageBubble } from '../components/MessageBubble';
import { ConfettiExplosion, ConfettiRef } from '../components/ConfettiExplosion';
import { FlyingBubble } from '../components/FlyingBubble';
import { Message, ButtonShape } from '../types';

const BUTTON_COLORS = [
  '#e94560', '#4ecdc4', '#ffe66d', '#a855f7',
  '#06d6a0', '#ff6b6b', '#3b82f6', '#f97316',
  '#ec4899', '#14b8a6',
];

const BUTTON_SHAPES: { shape: ButtonShape; label: string }[] = [
  { shape: 'circle', label: '⚫' },
  { shape: 'square', label: '⬛' },
  { shape: 'star', label: '⭐' },
  { shape: 'heart', label: '❤️' },
];

const BUTTON_PATTERNS: { pattern: ButtonPattern; label: string }[] = [
  { pattern: 'none', label: 'Geen' },
  { pattern: 'dots', label: 'Stippen' },
  { pattern: 'stripes', label: 'Strepen' },
  { pattern: 'zigzag', label: 'Zigzag' },
  { pattern: 'stars', label: 'Sterren' },
  { pattern: 'flowers', label: 'Bloemetjes' },
];

const BACKGROUNDS: { color: string; label: string }[] = [
  { color: '#1a1a2e', label: '🌙 Nacht' },
  { color: '#0d1b2a', label: '🌊 Oceaan' },
  { color: '#2d1b69', label: '🔮 Paars' },
  { color: '#1b2d1b', label: '🌲 Bos' },
  { color: '#2b1b2d', label: '🌸 Roze' },
  { color: '#1b1b1b', label: '🖤 Zwart' },
  { color: '#0a2342', label: '💎 Saffier' },
  { color: '#2d1f0e', label: '🍫 Choco' },
];

const BUTTON_EMOJIS = [
  '🤪', '😜', '🤩', '😎', '🥳',
  '👻', '🤖', '👽', '🦄', '🐱',
  '🌸', '🔥', '💀', '🍕', '🎸',
];

export function DemoScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pressesRemaining, setPressesRemaining] = useState(20);
  const [buttonColor, setButtonColor] = useState<string>(COLORS.primary);
  const [buttonShape, setButtonShape] = useState<ButtonShape>('circle');
  const [buttonPattern, setButtonPattern] = useState<ButtonPattern>('none');
  const [bgColor, setBgColor] = useState<string>(COLORS.background);
  const [buttonEmoji, setButtonEmoji] = useState('🤪');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [flyingMessage, setFlyingMessage] = useState<string | null>(null);
  const confettiRef = useRef<ConfettiRef>(null);

  const handlePress = useCallback(async () => {
    if (pressesRemaining <= 0) return;

    const randomMsg = await getRandomMessageAsync();

    const newMessage: Message = {
      id: Date.now().toString(),
      group_id: 'demo',
      sender_id: 'demo-user',
      content_type: randomMsg.type,
      content: randomMsg.content,
      created_at: new Date().toISOString(),
      sender_name: 'Jij! 🤪',
      like_count: 0,
      liked_by_me: false,
    };

    setPressesRemaining((prev) => prev - 1);
    confettiRef.current?.fire();
    setFlyingMessage(randomMsg.type === 'gif' ? '🎬 GIF!' : randomMsg.content);

    // Add to chat after the bubble flies up
    setTimeout(() => {
      setMessages((prev) => [newMessage, ...prev]);
    }, 900);
  }, [pressesRemaining]);

  const handleLike = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              liked_by_me: !m.liked_by_me,
              like_count: m.liked_by_me ? (m.like_count ?? 1) - 1 : (m.like_count ?? 0) + 1,
            }
          : m,
      ),
    );
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageBubble message={item} isAnonymous={false} onLike={handleLike} index={index} />
    ),
    [handleLike],
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Crazy Button 🤪</Text>
        <Text style={styles.subtitle}>Demo modus — druk op de knop!</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.arrow}>👇</Text>
            <Text style={styles.emptyText}>Druk op de knop hieronder!</Text>
          </View>
        }
      />

      {showCustomizer && (
        <View style={styles.customizer}>
          <Text style={styles.customizerTitle}>Kies je kleur:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
            {BUTTON_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setButtonColor(color)}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  buttonColor === color && styles.colorSelected,
                ]}
              />
            ))}
          </ScrollView>

          <Text style={styles.customizerTitle}>Kies je vorm:</Text>
          <View style={styles.shapeRow}>
            {BUTTON_SHAPES.map(({ shape, label }) => (
              <Pressable
                key={shape}
                onPress={() => setButtonShape(shape)}
                style={[
                  styles.shapeOption,
                  buttonShape === shape && styles.shapeSelected,
                ]}
              >
                <Text style={styles.shapeLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.customizerTitle, { marginTop: 12 }]}>Kies je smiley:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
            {BUTTON_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => setButtonEmoji(emoji)}
                style={[
                  styles.emojiOption,
                  buttonEmoji === emoji && styles.emojiSelected,
                ]}
              >
                <Text style={styles.emojiLabel}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.customizerTitle, { marginTop: 12 }]}>Kies je patroon:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patternRow}>
            {BUTTON_PATTERNS.map(({ pattern, label }) => (
              <Pressable
                key={pattern}
                onPress={() => setButtonPattern(pattern)}
                style={[
                  styles.patternOption,
                  buttonPattern === pattern && styles.patternSelected,
                ]}
              >
                <Text style={styles.patternLabel}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.customizerTitle, { marginTop: 12 }]}>Kies je achtergrond:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bgRow}>
            {BACKGROUNDS.map(({ color, label }) => (
              <Pressable
                key={color}
                onPress={() => setBgColor(color)}
                style={[
                  styles.bgOption,
                  { backgroundColor: color },
                  bgColor === color && styles.bgSelected,
                ]}
              >
                <Text style={styles.bgLabel}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <Pressable onPress={() => setShowCustomizer(!showCustomizer)} style={styles.customizeToggle}>
        <Text style={styles.customizeToggleText}>
          {showCustomizer ? 'Klaar ✓' : '🎨 Verander je knop'}
        </Text>
      </Pressable>

      <CrazyButton
        color={buttonColor}
        shape={buttonShape}
        pattern={buttonPattern}
        emoji={buttonEmoji}
        pressesRemaining={pressesRemaining}
        onPress={handlePress}
      />

      {flyingMessage && (
        <FlyingBubble
          message={flyingMessage}
          onDone={() => setFlyingMessage(null)}
        />
      )}

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
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.accent3,
    fontSize: 14,
    marginTop: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  arrow: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
  customizer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  customizerTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: COLORS.text,
    borderWidth: 3,
  },
  shapeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shapeOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  shapeSelected: {
    borderColor: COLORS.accent3,
  },
  shapeLabel: {
    fontSize: 22,
  },
  emojiRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: COLORS.accent3,
    backgroundColor: COLORS.background,
  },
  emojiLabel: {
    fontSize: 26,
  },
  patternRow: {
    flexDirection: 'row',
  },
  patternOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternSelected: {
    borderColor: COLORS.accent3,
  },
  patternLabel: {
    color: COLORS.text,
    fontSize: 13,
  },
  bgRow: {
    flexDirection: 'row',
  },
  bgOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bgSelected: {
    borderColor: COLORS.accent3,
  },
  bgLabel: {
    color: COLORS.text,
    fontSize: 12,
  },
  customizeToggle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  customizeToggleText: {
    color: COLORS.accent2,
    fontSize: 14,
  },
});
