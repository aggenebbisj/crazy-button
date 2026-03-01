import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Group } from '../types';

export function useGroups(userId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch groups error:', error.message);
    } else {
      setGroups(data ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  async function createGroup(name: string, isAnonymous: boolean): Promise<Group | null> {
    if (!userId) return null;

    // Step 1: Insert group without RETURNING (RLS blocks RETURNING before membership exists)
    const { error } = await supabase
      .from('groups')
      .insert({ name, is_anonymous: isAnonymous, created_by: userId });

    if (error) {
      console.error('Create group error:', error.message);
      return null;
    }

    // Step 2: Fetch the group we just created (works because of "Creators can read own groups" policy)
    const { data: group, error: fetchError } = await supabase
      .from('groups')
      .select('*')
      .eq('name', name)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !group) {
      console.error('Fetch created group error:', fetchError?.message);
      return null;
    }

    // Step 3: Auto-join the creator
    await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId });

    await fetchGroups();
    return group;
  }

  async function joinGroup(inviteCode: string): Promise<boolean> {
    if (!userId) return false;

    // Use SECURITY DEFINER function to find group (user isn't a member yet)
    const { data, error: findError } = await supabase
      .rpc('get_group_by_invite_code', { code: inviteCode });

    const groupId = data?.[0]?.id;
    if (findError || !groupId) {
      console.error('Group not found:', findError?.message);
      return false;
    }

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId });

    if (joinError) {
      console.error('Join error:', joinError.message);
      return false;
    }

    await fetchGroups();
    return true;
  }

  return { groups, loading, createGroup, joinGroup, refresh: fetchGroups };
}
