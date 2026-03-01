-- Fix 1: Allow creators to see their own groups (needed for INSERT flow)
CREATE POLICY "Creators can read own groups" ON public.groups
  FOR SELECT USING (auth.uid() = created_by);

-- Fix 2: Allow anyone to find a group by invite code (needed for JOIN flow)
-- This is safe because it only exposes groups if you know the code
CREATE OR REPLACE FUNCTION public.get_group_by_invite_code(code TEXT)
RETURNS TABLE (id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT g.id FROM public.groups g WHERE g.invite_code = code LIMIT 1;
$$;
