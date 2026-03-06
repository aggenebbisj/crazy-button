import React, { useRef, useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { COLORS } from '../constants/theme';
import { getRandomMessageAsync } from '../constants/messages';
import { useGroupMessages } from '../hooks/useGroupMessages';
import { CrazyButton, ButtonPattern } from '../components/CrazyButton';
import { MessageBubble } from '../components/MessageBubble';
import { ConfettiExplosion, ConfettiRef } from '../components/ConfettiExplosion';
import { FlyingBubble } from '../components/FlyingBubble';
import { BackgroundPattern, BgPattern } from '../components/BackgroundPattern';
import { useCustomization } from '../hooks/useCustomization';
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

const BUTTON_EMOJIS = [
  '🤪', '😜', '🤩', '😎', '🥳',
  '👻', '🤖', '👽', '🦄', '🐱',
  '🌸', '🔥', '💀', '🍕', '🎸',
];

const BACKGROUNDS: { color: string; label: string }[] = [
  { color: '#1a1a2e', label: '🌙 Nacht' },
  { color: '#4a00e0', label: '🔮 Magie' },
  { color: '#0066ff', label: '🌊 Oceaan' },
  { color: '#cc00ff', label: '🦄 Unicorn' },
  { color: '#ff0055', label: '🌹 Roos' },
  { color: '#00cc44', label: '🌴 Jungle' },
  { color: '#ff3300', label: '🔥 Lava' },
  { color: '#ff6600', label: '🌅 Zonsondergang' },
  { color: '#0099ff', label: '💎 Saffier' },
  { color: '#ff00aa', label: '💖 Neon Roze' },
  { color: '#00ffcc', label: '💚 Neon Groen' },
  { color: '#ffff00', label: '💛 Neon Geel' },
];

const BG_PATTERNS: { pattern: BgPattern; label: string }[] = [
  { pattern: 'none', label: 'Geen' },
  { pattern: 'galaxy', label: '🌌 Galaxy' },
  { pattern: 'sparkles', label: '✨ Sparkles' },
  { pattern: 'confetti', label: '🎊 Confetti' },
  { pattern: 'waves', label: '🌊 Golven' },
  { pattern: 'bubbles', label: '🫧 Bubbels' },
  { pattern: 'hearts', label: '💕 Hartjes' },
  { pattern: 'stars', label: '⭐ Sterren' },
];

interface Props {
  groupId: string;
  groupName: string;
  isAnonymous: boolean;
  userId: string;
  onBack: () => void;
  onScoreboard: () => void;
  onInvite: () => void;
}

export function GroupScreen({
  groupId,
  groupName,
  isAnonymous,
  userId,
  onBack,
  onScoreboard,
  onInvite,
}: Props) {
  const { messages, pressesRemaining, sendPress, toggleLike } = useGroupMessages(groupId, userId);
  const confettiRef = useRef<ConfettiRef>(null);
  const [flyingMessage, setFlyingMessage] = useState<string | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const { width, height } = useWindowDimensions();

  const c = useCustomization();

  const handlePress = useCallback(async () => {
    const randomMessage = await getRandomMessageAsync();
    const success = await sendPress(randomMessage.type, randomMessage.content);
    if (success) {
      confettiRef.current?.fire();
      setFlyingMessage(randomMessage.type === 'gif' ? '🎬 GIF!' : randomMessage.content);
      setTimeout(() => setFlyingMessage(null), 1200);
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
    <View style={[styles.container, { backgroundColor: c.bgColor }]}>
      <BackgroundPattern pattern={c.bgPattern} width={width} height={height} />
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

      {showCustomizer && (
        <ScrollView style={styles.customizer} showsVerticalScrollIndicator={true}>
          <Text style={styles.customizerTitle}>Knop kleur:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BUTTON_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => c.update('buttonColor', color)}
                style={[styles.colorOption, { backgroundColor: color }, c.buttonColor === color && styles.colorSelected]}
              />
            ))}
          </ScrollView>

          <Text style={[styles.customizerTitle, { marginTop: 10 }]}>Knop vorm:</Text>
          <View style={styles.shapeRow}>
            {BUTTON_SHAPES.map(({ shape, label }) => (
              <Pressable key={shape} onPress={() => c.update('buttonShape', shape)} style={[styles.shapeOption, c.buttonShape === shape && styles.shapeSelected]}>
                <Text style={styles.shapeLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.customizerTitle, { marginTop: 10 }]}>Smiley:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BUTTON_EMOJIS.map((emoji) => (
              <Pressable key={emoji} onPress={() => c.update('buttonEmoji', emoji)} style={[styles.emojiOption, c.buttonEmoji === emoji && styles.emojiSelected]}>
                <Text style={styles.emojiLabel}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.customizerTitle, { marginTop: 10 }]}>Knop patroon:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BUTTON_PATTERNS.map(({ pattern, label }) => (
              <Pressable key={pattern} onPress={() => c.update('buttonPattern', pattern)} style={[styles.patternOption, c.buttonPattern === pattern && styles.patternSelected]}>
                <Text style={styles.patternLabel}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.customizerTitle, { marginTop: 10 }]}>Achtergrond kleur:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BACKGROUNDS.map(({ color, label }) => (
              <Pressable key={color} onPress={() => c.update('bgColor', color)} style={[styles.bgOption, { backgroundColor: color }, c.bgColor === color && styles.bgSelected]}>
                <Text style={styles.bgLabel}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.customizerTitle, { marginTop: 10 }]}>Achtergrond patroon:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {BG_PATTERNS.map(({ pattern, label }) => (
              <Pressable key={pattern} onPress={() => c.update('bgPattern', pattern)} style={[styles.patternOption, c.bgPattern === pattern && styles.patternSelected]}>
                <Text style={styles.patternLabel}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </ScrollView>
      )}

      <Pressable onPress={() => setShowCustomizer(!showCustomizer)} style={styles.customizeToggle}>
        <Text style={styles.customizeToggleText}>
          {showCustomizer ? 'Klaar ✓' : '🎨 Verander je knop'}
        </Text>
      </Pressable>

      <CrazyButton
        color={c.buttonColor}
        shape={c.buttonShape}
        pattern={c.buttonPattern}
        emoji={c.buttonEmoji}
        pressesRemaining={pressesRemaining}
        onPress={handlePress}
      />

      {flyingMessage && (
        <FlyingBubble message={flyingMessage} onDone={() => setFlyingMessage(null)} />
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
  customizer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: 300,
  },
  customizerTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: COLORS.text,
    borderWidth: 3,
  },
  shapeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shapeOption: {
    width: 40,
    height: 40,
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
    fontSize: 20,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: COLORS.accent3,
    backgroundColor: COLORS.background,
  },
  emojiLabel: {
    fontSize: 24,
  },
  patternOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    marginRight: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternSelected: {
    borderColor: COLORS.accent3,
  },
  patternLabel: {
    color: COLORS.text,
    fontSize: 12,
  },
  bgOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bgSelected: {
    borderColor: COLORS.accent3,
  },
  bgLabel: {
    color: COLORS.text,
    fontSize: 11,
  },
  customizeToggle: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  customizeToggleText: {
    color: COLORS.accent2,
    fontSize: 14,
  },
});
