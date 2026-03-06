import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Text, Pressable, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { COLORS, BUBBLE_COLORS } from '../constants/theme';
import { BackgroundPattern } from '../components/BackgroundPattern';
import { useCustomization } from '../hooks/useCustomization';
import { Group } from '../types';

interface Props {
  groups: Group[];
  loading: boolean;
  onSelectGroup: (group: Group) => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onLeaveGroup: (groupId: string) => void;
}

export function GroupsListScreen({ groups, loading, onSelectGroup, onCreateGroup, onJoinGroup, onLeaveGroup }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const c = useCustomization();
  const { width, height } = useWindowDimensions();

  const renderGroup = ({ item, index }: { item: Group; index: number }) => {
    const color = BUBBLE_COLORS[index % BUBBLE_COLORS.length];
    const isConfirming = confirmDelete === item.id;

    return (
      <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
        {isConfirming ? (
          <View style={[styles.groupCard, { borderColor: '#ff0055' }]}>
            <Text style={styles.confirmText}>"{item.name}" verlaten?</Text>
            <Pressable onPress={() => { onLeaveGroup(item.id); setConfirmDelete(null); }} style={styles.confirmYes}>
              <Text style={styles.confirmYesText}>Ja</Text>
            </Pressable>
            <Pressable onPress={() => setConfirmDelete(null)} style={styles.confirmNo}>
              <Text style={styles.confirmNoText}>Nee</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.groupCard, { borderColor: color }]}>
            <Pressable
              onPress={() => onSelectGroup(item)}
              style={styles.groupCardInner}
            >
              <View style={[styles.groupIcon, { backgroundColor: color }]}>
                <Text style={styles.groupIconText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupMeta}>
                  {item.is_anonymous ? '🎭 Anoniem' : '👤 Met naam'}
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setConfirmDelete(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>👋</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bgColor }]}>
      <BackgroundPattern pattern={c.bgPattern} width={width} height={height} />
      <Text style={styles.title}>Crazy Button 🤪</Text>

      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Laden...' : 'Nog geen groepen!\nMaak er een of join met een code.'}
          </Text>
        }
      />

      <View style={styles.actions}>
        <Pressable onPress={onCreateGroup} style={[styles.actionButton, styles.createButton]}>
          <Text style={styles.actionText}>+ Nieuwe groep</Text>
        </Pressable>
        <Pressable onPress={onJoinGroup} style={[styles.actionButton, styles.joinButton]}>
          <Text style={styles.actionText}>🔗 Join met code</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  groupCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  confirmText: {
    color: COLORS.text,
    fontSize: 15,
    flex: 1,
  },
  confirmYes: {
    backgroundColor: '#ff0055',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmYesText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  confirmNo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 4,
  },
  confirmNoText: {
    color: COLORS.textSecondary,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIconText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupInfo: {
    marginLeft: 16,
    flex: 1,
  },
  groupName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  groupMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 18,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.accent2,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
