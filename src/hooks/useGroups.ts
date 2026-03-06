import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Group } from '../types';

export function useGroups(userId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // Only fetch groups where user is a member
    const { data: memberships, error: memError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (memError || !memberships?.length) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = memberships.map(m => m.group_id);
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
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
    if (!userId) {
      console.error('Join failed: not logged in');
      return false;
    }

    // Find group by invite code
    const { data: group, error: findError } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (findError || !group) {
      console.error('Group not found:', findError?.message);
      return false;
    }

    const groupId = group.id;

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

  async function leaveGroup(groupId: string): Promise<boolean> {
    if (!userId) return false;

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      console.error('Leave group error:', error.message);
      return false;
    }

    await fetchGroups();
    return true;
  }

  return { groups, loading, createGroup, joinGroup, leaveGroup, refresh: fetchGroups };
}
