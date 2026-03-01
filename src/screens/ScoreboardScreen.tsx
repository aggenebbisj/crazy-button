import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, BUBBLE_COLORS } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface ScoreEntry {
  sender_id: string;
  sender_name: string;
  total_likes: number;
  best_message: string;
}

interface Props {
  groupId: string;
  onBack: () => void;
}

export function ScoreboardScreen({ groupId, onBack }: Props) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [groupId]);

  async function fetchScores() {
    setLoading(true);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        sender_id,
        content,
        profiles:sender_id(display_name),
        likes(count)
      `)
      .eq('group_id', groupId)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const scoreMap = new Map<string, ScoreEntry>();
    for (const msg of data as any[]) {
      const senderId = msg.sender_id;
      const likeCount = msg.likes?.[0]?.count ?? 0;
      const existing = scoreMap.get(senderId);

      if (existing) {
        existing.total_likes += likeCount;
        if (likeCount > 0) {
          existing.best_message = msg.content;
        }
      } else {
        scoreMap.set(senderId, {
          sender_id: senderId,
          sender_name: msg.profiles?.display_name ?? 'Anoniem',
          total_likes: likeCount,
          best_message: msg.content,
        });
      }
    }

    const sorted = Array.from(scoreMap.values())
      .sort((a, b) => b.total_likes - a.total_likes);

    setScores(sorted);
    setLoading(false);
  }

  const renderScore = ({ item, index }: { item: ScoreEntry; index: number }) => {
    const color = BUBBLE_COLORS[index % BUBBLE_COLORS.length];
    const crown = index === 0 && item.total_likes > 0;

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100).springify()}
        style={[styles.scoreCard, { borderColor: color }]}
      >
        <Text style={styles.rank}>
          {crown ? '👑' : `#${index + 1}`}
        </Text>
        <View style={styles.scoreInfo}>
          <Text style={styles.name}>{item.sender_name}</Text>
          <Text style={styles.bestMessage} numberOfLines={1}>
            {item.best_message}
          </Text>
        </View>
        <Text style={styles.likes}>❤️ {item.total_likes}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'‹'}</Text>
        <Text style={styles.title}>Scorebord 🏆</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={scores}
        renderItem={renderScore}
        keyExtractor={(item) => item.sender_id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Laden...' : 'Nog geen likes deze week!'}
          </Text>
        }
      />
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
  list: {
    padding: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  rank: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  scoreInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  bestMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  likes: {
    fontSize: 18,
    marginLeft: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
