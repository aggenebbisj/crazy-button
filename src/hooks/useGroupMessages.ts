import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

function requestNotificationPermission() {
  if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showNotification(title: string, body: string) {
  if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '🤪' });
  }
}

export function useGroupMessages(groupId: string | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pressesRemaining, setPressesRemaining] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id(display_name),
        likes(user_id)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Fetch messages error:', error.message);
    } else {
      const mapped = (data ?? []).map((m: any) => ({
        ...m,
        sender_name: m.profiles?.display_name ?? 'Anoniem',
        like_count: m.likes?.length ?? 0,
        liked_by_me: m.likes?.some((l: any) => l.user_id === userId) ?? false,
      }));
      setMessages(mapped);
    }
    setLoading(false);
  }, [groupId, userId]);

  const fetchPressesRemaining = useCallback(async () => {
    if (!groupId || !userId) return;
    const { data } = await supabase
      .from('group_members')
      .select('daily_presses_used, last_press_date')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (data) {
      const today = new Date().toISOString().split('T')[0];
      const used = data.last_press_date === today ? data.daily_presses_used : 0;
      setPressesRemaining(20 - used);
    }
  }, [groupId, userId]);

  useEffect(() => {
    fetchMessages();
    fetchPressesRemaining();
  }, [fetchMessages, fetchPressesRemaining]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`messages:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`,
      }, (payload: any) => {
        // Show notification if it's from someone else
        if (payload.new?.sender_id !== userId) {
          const content = payload.new?.content ?? '🤪';
          showNotification('Crazy Button 🤪', content);
        }
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, userId, fetchMessages]);

  async function sendPress(contentType: string, content: string): Promise<boolean> {
    if (!groupId || !userId) return false;

    // Check daily limit server-side
    const { data: canPress } = await supabase
      .rpc('check_daily_press', { p_group_id: groupId });

    if (!canPress) return false;

    const { error } = await supabase
      .from('messages')
      .insert({
        group_id: groupId,
        sender_id: userId,
        content_type: contentType,
        content,
      });

    if (error) {
      console.error('Send press error:', error.message);
      return false;
    }

    await fetchPressesRemaining();
    return true;
  }

  async function toggleLike(messageId: string): Promise<void> {
    if (!userId) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    if (message.liked_by_me) {
      await supabase
        .from('likes')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('likes')
        .insert({ message_id: messageId, user_id: userId });
    }

    await fetchMessages();
  }

  return { messages, pressesRemaining, loading, sendPress, toggleLike, refresh: fetchMessages };
}
