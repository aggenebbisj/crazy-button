-- Fix infinite recursion in RLS policies
-- The problem: group_members SELECT policy queries group_members, causing a loop
-- The fix: use a SECURITY DEFINER function that bypasses RLS

CREATE OR REPLACE FUNCTION public.get_my_group_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$;

-- Drop old policies that cause recursion
DROP POLICY IF EXISTS "Members can read their groups" ON public.groups;
DROP POLICY IF EXISTS "Members can read group members" ON public.group_members;
DROP POLICY IF EXISTS "Members can read group messages" ON public.messages;
DROP POLICY IF EXISTS "Members can read likes" ON public.likes;

-- Recreate with the function instead of subquery
CREATE POLICY "Members can read their groups" ON public.groups
  FOR SELECT USING (id IN (SELECT public.get_my_group_ids()));

CREATE POLICY "Members can read group members" ON public.group_members
  FOR SELECT USING (group_id IN (SELECT public.get_my_group_ids()));

CREATE POLICY "Members can read group messages" ON public.messages
  FOR SELECT USING (group_id IN (SELECT public.get_my_group_ids()));

CREATE POLICY "Members can read likes" ON public.likes
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      WHERE m.group_id IN (SELECT public.get_my_group_ids())
    )
  );

-- Also fix the message insert policy
DROP POLICY IF EXISTS "Members can insert messages" ON public.messages;
CREATE POLICY "Members can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND group_id IN (SELECT public.get_my_group_ids())
  );
