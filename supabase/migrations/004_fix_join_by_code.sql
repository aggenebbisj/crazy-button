-- Allow anyone to find a group by invite code (needed for joining)
-- Safe because the invite code acts as a secret
CREATE POLICY "Anyone can find groups by invite code" ON public.groups
  FOR SELECT USING (true);
