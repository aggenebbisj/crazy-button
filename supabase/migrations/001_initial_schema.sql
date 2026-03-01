-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anoniem',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group members
CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  button_color TEXT NOT NULL DEFAULT '#e94560',
  button_shape TEXT NOT NULL DEFAULT 'circle' CHECK (button_shape IN ('circle', 'square', 'star', 'heart')),
  daily_presses_used INTEGER NOT NULL DEFAULT 0,
  last_press_date DATE NOT NULL DEFAULT CURRENT_DATE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'emoji', 'sound', 'gif', 'sticker')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Likes
CREATE TABLE public.likes (
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

-- Indexes
CREATE INDEX idx_messages_group_id ON public.messages(group_id, created_at DESC);
CREATE INDEX idx_likes_message_id ON public.likes(message_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_groups_invite_code ON public.groups(invite_code);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: profiles
CREATE POLICY "Users can read all profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies: groups
CREATE POLICY "Members can read their groups" ON public.groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Authenticated users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies: group_members
CREATE POLICY "Members can read group members" ON public.group_members
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own membership" ON public.group_members
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: messages
CREATE POLICY "Members can read group messages" ON public.messages
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Members can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

-- RLS Policies: likes
CREATE POLICY "Members can read likes" ON public.likes
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      JOIN public.group_members gm ON gm.group_id = m.group_id
      WHERE gm.user_id = auth.uid()
    )
  );
CREATE POLICY "Members can insert likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Function: check and increment daily press count
CREATE OR REPLACE FUNCTION public.check_daily_press(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_presses INTEGER;
  v_last_date DATE;
BEGIN
  SELECT daily_presses_used, last_press_date
  INTO v_presses, v_last_date
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = auth.uid();

  -- Reset if new day
  IF v_last_date < CURRENT_DATE THEN
    UPDATE public.group_members
    SET daily_presses_used = 1, last_press_date = CURRENT_DATE
    WHERE group_id = p_group_id AND user_id = auth.uid();
    RETURN true;
  END IF;

  -- Check limit
  IF v_presses >= 20 THEN
    RETURN false;
  END IF;

  -- Increment
  UPDATE public.group_members
  SET daily_presses_used = v_presses + 1
  WHERE group_id = p_group_id AND user_id = auth.uid();
  RETURN true;
END;
$$;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anoniem'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
