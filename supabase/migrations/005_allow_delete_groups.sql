-- Allow group creators to delete their groups
-- CASCADE on foreign keys will clean up members, messages, and likes automatically
CREATE POLICY "Creators can delete own groups" ON public.groups
  FOR DELETE USING (auth.uid() = created_by);
