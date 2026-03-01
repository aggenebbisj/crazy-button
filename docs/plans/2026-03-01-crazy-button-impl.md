# Crazy Button — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React Native (Expo) group messaging app where users can't type — they press a button that sends a random funny message to the group. Messages get likes and there's a scoreboard.

**Architecture:** Expo managed workflow app with Supabase backend. Supabase handles auth (anonymous + email), Postgres database with RLS for security and daily press limits, Realtime subscriptions for live message delivery, and Storage for GIFs. Animations via React Native Reanimated + expo-haptics. See `docs/plans/2026-03-01-crazy-button-design.md` for full design.

**Tech Stack:** Expo SDK 52, React Native, TypeScript, Supabase (auth, database, realtime, storage), React Native Reanimated, expo-haptics, expo-notifications, react-native-qrcode-svg.

---

### Task 1: Scaffold Expo project

**Files:**
- Create: `app.json`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `App.tsx`

**Step 1: Initialize Expo project**

```bash
cd /Users/a3741824/workspace/aggenebbisj/crazy-button
npx create-expo-app@latest . --template blank-typescript
```

Expected: Expo project scaffolded with TypeScript template.

**Step 2: Install core dependencies**

```bash
npx expo install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage
npx expo install expo-haptics expo-notifications expo-crypto
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install react-native-safe-area-context react-native-screens
npx expo install react-native-svg
npm install react-native-qrcode-svg react-native-confetti-cannon
```

**Step 3: Install dev dependencies**

```bash
npm install -D jest @testing-library/react-native @testing-library/jest-native jest-expo @types/jest
```

**Step 4: Verify app starts**

```bash
npx expo start --no-dev --minify
```

Expected: Metro bundler starts, no compilation errors.

**Step 5: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Expo project with dependencies"
```

---

### Task 2: Set up project structure and theme

**Files:**
- Create: `src/constants/theme.ts`
- Create: `src/constants/messages.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/types/index.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/constants src/lib src/types src/components src/screens src/hooks
```

**Step 2: Create type definitions**

`src/types/index.ts`:
```typescript
export interface User {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  is_anonymous: boolean;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  button_color: string;
  button_shape: 'circle' | 'square' | 'star' | 'heart';
  daily_presses_remaining: number;
  joined_at: string;
}

export interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  content_type: 'text' | 'emoji' | 'sound' | 'gif';
  content: string;
  created_at: string;
  sender_name?: string;
  like_count?: number;
  liked_by_me?: boolean;
}

export interface Like {
  message_id: string;
  user_id: string;
  created_at: string;
}

export type ButtonShape = 'circle' | 'square' | 'star' | 'heart';
```

**Step 3: Create theme constants**

`src/constants/theme.ts`:
```typescript
export const COLORS = {
  background: '#1a1a2e',
  surface: '#16213e',
  primary: '#e94560',
  secondary: '#0f3460',
  accent1: '#ff6b6b',
  accent2: '#4ecdc4',
  accent3: '#ffe66d',
  accent4: '#a855f7',
  accent5: '#06d6a0',
  text: '#ffffff',
  textSecondary: '#a0a0b0',
  border: '#2a2a4a',
} as const;

export const BUBBLE_COLORS = [
  '#e94560', '#4ecdc4', '#ffe66d', '#a855f7',
  '#06d6a0', '#ff6b6b', '#3b82f6', '#f97316',
  '#ec4899', '#14b8a6',
] as const;

export const FONTS = {
  regular: 'System',
  bold: 'System',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const DAILY_PRESS_LIMIT = 10;
```

**Step 4: Create message bank**

`src/constants/messages.ts`:
```typescript
export const FUNNY_TEXTS = [
  'Ik heb net een eenhoorn gezien op de fiets 🦄🚲',
  'Mijn kat heeft mijn huiswerk opgegeten... ik heb geen kat 🐱',
  'ALARM! Er zit een banaan in mijn oor! 🍌👂',
  'Ik ben vergeten hoe je knippert 👀',
  'Er staat een pinguïn voor de deur. Wat moet ik doen? 🐧',
  'Help! Mijn schoenen zijn te blij! 👟😊',
  'De koelkast praat weer tegen me 🗣️❄️',
  'Ik heb per ongeluk de maan gebeld 🌙📞',
  'Mijn brood is op vakantie 🍞🏖️',
  'SOS! De soep is ontsnapt! 🍜🏃',
  'Waarom is de lucht niet groen? 🤔💚',
  'Mijn sokken zijn het niet eens met elkaar 🧦😤',
  'Er zit een wolk in mijn rugzak ☁️🎒',
  'De tafel heeft weer hoofdpijn 🤕',
  'Ik heb het internet kapot gemaakt 💻💥',
  'Hoeveel pannenkoeken passen in een vliegtuig? 🥞✈️',
  'Mijn haar heeft vakantie nodig 💇',
  'De deur wil niet meer meedoen 🚪😤',
  'Ik spreek vloeiend wafel 🧇',
  'Er zit een regenboog in mijn zak 🌈👖',
];

export const EMOJI_COMBOS = [
  '🐔💨🌈',
  '🦊🎸🔥',
  '🐙🎩✨',
  '🦀💃🌮',
  '🐸🎺🌙',
  '🦄🍕🚀',
  '🐧❄️🎪',
  '🦊🧁🎭',
  '🐻🎨🌪️',
  '🐝🎹🌸',
  '🦁👑🎯',
  '🐨🍩🎠',
  '🦋🎪🌊',
  '🐢🏎️💨',
  '🦊🧲⚡',
];

export const SOUND_MESSAGES = [
  'BOEM! 💥',
  'TOET TOET! 📯',
  'SPLASHHH! 🌊',
  'WHOOOOSH! 💨',
  'BOING BOING! 🏀',
  'KABLAMMO! 🎆',
  'PRRRRT! 💨',
  'KLING KLANG! 🔔',
  'ZOOOOOM! 🚀',
  'PLOP! 🫧',
];

export interface RandomMessage {
  type: 'text' | 'emoji' | 'sound';
  content: string;
}

export function getRandomMessage(): RandomMessage {
  const categories = ['text', 'emoji', 'sound'] as const;
  const category = categories[Math.floor(Math.random() * categories.length)];

  switch (category) {
    case 'text':
      return {
        type: 'text',
        content: FUNNY_TEXTS[Math.floor(Math.random() * FUNNY_TEXTS.length)],
      };
    case 'emoji':
      return {
        type: 'emoji',
        content: EMOJI_COMBOS[Math.floor(Math.random() * EMOJI_COMBOS.length)],
      };
    case 'sound':
      return {
        type: 'sound',
        content: SOUND_MESSAGES[Math.floor(Math.random() * SOUND_MESSAGES.length)],
      };
  }
}
```

**Step 5: Create Supabase client placeholder**

`src/lib/supabase.ts`:
```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**Step 6: Commit**

```bash
git add src/
git commit -m "feat: add project structure, types, theme, and message bank"
```

---

### Task 3: Write tests for message generation

**Files:**
- Create: `src/constants/__tests__/messages.test.ts`

**Step 1: Write the failing test**

`src/constants/__tests__/messages.test.ts`:
```typescript
import { getRandomMessage, FUNNY_TEXTS, EMOJI_COMBOS, SOUND_MESSAGES } from '../messages';

describe('getRandomMessage', () => {
  it('returns a message with type and content', () => {
    const message = getRandomMessage();
    expect(message).toHaveProperty('type');
    expect(message).toHaveProperty('content');
    expect(['text', 'emoji', 'sound']).toContain(message.type);
    expect(message.content.length).toBeGreaterThan(0);
  });

  it('returns text messages from FUNNY_TEXTS', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0) // selects 'text' category
      .mockReturnValueOnce(0); // selects first text
    const message = getRandomMessage();
    expect(message.type).toBe('text');
    expect(FUNNY_TEXTS).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('returns emoji messages from EMOJI_COMBOS', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.34) // selects 'emoji' category
      .mockReturnValueOnce(0); // selects first emoji
    const message = getRandomMessage();
    expect(message.type).toBe('emoji');
    expect(EMOJI_COMBOS).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('returns sound messages from SOUND_MESSAGES', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.67) // selects 'sound' category
      .mockReturnValueOnce(0); // selects first sound
    const message = getRandomMessage();
    expect(message.type).toBe('sound');
    expect(SOUND_MESSAGES).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('has at least 10 messages per category', () => {
    expect(FUNNY_TEXTS.length).toBeGreaterThanOrEqual(10);
    expect(EMOJI_COMBOS.length).toBeGreaterThanOrEqual(10);
    expect(SOUND_MESSAGES.length).toBeGreaterThanOrEqual(5);
  });
});
```

**Step 2: Run tests to verify they pass**

```bash
npx jest src/constants/__tests__/messages.test.ts --verbose
```

Expected: All 5 tests PASS (implementation already exists from Task 2).

**Step 3: Commit**

```bash
git add src/constants/__tests__/
git commit -m "test: add message generation tests"
```

---

### Task 4: Set up Supabase project and database schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `.env.local`

**Step 1: Create Supabase project**

Go to https://supabase.com, create a new project called "crazy-button". Note the URL and anon key.

**Step 2: Create env file**

`.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Add `.env.local` to `.gitignore`.

**Step 3: Create database migration**

`supabase/migrations/001_initial_schema.sql`:
```sql
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
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'emoji', 'sound', 'gif')),
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
  IF v_presses >= 10 THEN
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
```

**Step 4: Run migration in Supabase dashboard**

Copy the SQL into Supabase SQL Editor and execute it.

**Step 5: Commit**

```bash
git add supabase/ .gitignore
git commit -m "feat: add Supabase database schema with RLS policies"
```

---

### Task 5: Auth hook and anonymous sign-in

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/__tests__/useAuth.test.ts`

**Step 1: Write the auth hook**

`src/hooks/useAuth.ts`:
```typescript
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        signInAnonymously();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInAnonymously() {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) console.error('Auth error:', error.message);
  }

  async function updateDisplayName(name: string) {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', user.id);
    if (error) console.error('Update name error:', error.message);
  }

  return { user, session, loading, updateDisplayName };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: add auth hook with anonymous sign-in"
```

---

### Task 6: Group management hooks

**Files:**
- Create: `src/hooks/useGroups.ts`
- Create: `src/hooks/useGroupMessages.ts`

**Step 1: Create groups hook**

`src/hooks/useGroups.ts`:
```typescript
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
    const { data, error } = await supabase
      .from('groups')
      .insert({ name, is_anonymous: isAnonymous, created_by: userId })
      .select()
      .single();

    if (error) {
      console.error('Create group error:', error.message);
      return null;
    }

    // Auto-join the creator
    await supabase
      .from('group_members')
      .insert({ group_id: data.id, user_id: userId });

    await fetchGroups();
    return data;
  }

  async function joinGroup(inviteCode: string): Promise<boolean> {
    if (!userId) return false;

    const { data: group, error: findError } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (findError || !group) {
      console.error('Group not found:', findError?.message);
      return false;
    }

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId });

    if (joinError) {
      console.error('Join error:', joinError.message);
      return false;
    }

    await fetchGroups();
    return true;
  }

  return { groups, loading, createGroup, joinGroup, refresh: fetchGroups };
}
```

**Step 2: Create messages hook with realtime**

`src/hooks/useGroupMessages.ts`:
```typescript
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

export function useGroupMessages(groupId: string | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pressesRemaining, setPressesRemaining] = useState(10);
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
      setPressesRemaining(10 - used);
    }
  }, [groupId, userId]);

  useEffect(() => {
    fetchMessages();
    fetchPressesRemaining();
  }, [fetchMessages, fetchPressesRemaining]);

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
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchMessages]);

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
```

**Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add group management and message hooks with realtime"
```

---

### Task 7: Crazy Button component with animations

**Files:**
- Create: `src/components/CrazyButton.tsx`
- Create: `src/components/MessageBubble.tsx`
- Create: `src/components/ConfettiExplosion.tsx`

**Step 1: Create the Crazy Button component**

`src/components/CrazyButton.tsx`:
```typescript
import React, { useRef } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';
import { ButtonShape } from '../types';

interface Props {
  color: string;
  shape: ButtonShape;
  pressesRemaining: number;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CrazyButton({ color, shape, pressesRemaining, onPress, disabled }: Props) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Pulsating idle animation
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  function handlePress() {
    if (disabled || pressesRemaining <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Explosion animation
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.3, { damping: 3, stiffness: 200 }),
      withSpring(1, { damping: 8 }),
    );
    rotation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );

    onPress();
  }

  const borderRadius = shape === 'circle' ? 60 : shape === 'square' ? 16 : 60;

  return (
    <View style={styles.container}>
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.button,
          animatedStyle,
          {
            backgroundColor: disabled ? COLORS.textSecondary : color,
            borderRadius,
          },
        ]}
      >
        <Text style={styles.buttonText}>
          {pressesRemaining > 0 ? '🤪' : '😴'}
        </Text>
      </AnimatedPressable>
      <Text style={styles.counter}>
        Nog {pressesRemaining} drukken vandaag
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  button: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 48,
  },
  counter: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
```

**Step 2: Create message bubble component**

`src/components/MessageBubble.tsx`:
```typescript
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, BUBBLE_COLORS } from '../constants/theme';
import { Message } from '../types';

interface Props {
  message: Message;
  isAnonymous: boolean;
  onLike: (messageId: string) => void;
  index: number;
}

export function MessageBubble({ message, isAnonymous, onLike, index }: Props) {
  const bubbleColor = BUBBLE_COLORS[index % BUBBLE_COLORS.length];

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).springify()}
      style={[styles.bubble, { backgroundColor: bubbleColor + '20', borderColor: bubbleColor }]}
    >
      <Text style={styles.content}>{message.content}</Text>
      <View style={styles.footer}>
        <Text style={styles.sender}>
          {isAnonymous ? '???' : (message.sender_name ?? 'Anoniem')}
        </Text>
        <Pressable onPress={() => onLike(message.id)} style={styles.likeButton}>
          <Text style={styles.likeText}>
            {message.liked_by_me ? '❤️' : '🤍'} {message.like_count ?? 0}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  content: {
    color: COLORS.text,
    fontSize: 18,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sender: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  likeButton: {
    padding: 4,
  },
  likeText: {
    fontSize: 14,
  },
});
```

**Step 3: Create confetti component**

`src/components/ConfettiExplosion.tsx`:
```typescript
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export interface ConfettiRef {
  fire: () => void;
}

export const ConfettiExplosion = forwardRef<ConfettiRef>((_props, ref) => {
  const confettiRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    fire: () => {
      confettiRef.current?.start();
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={80}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        explosionSpeed={350}
        fallSpeed={3000}
        colors={['#e94560', '#4ecdc4', '#ffe66d', '#a855f7', '#06d6a0', '#ff6b6b', '#3b82f6']}
      />
    </View>
  );
});
```

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add CrazyButton, MessageBubble, and ConfettiExplosion components"
```

---

### Task 8: Group screen

**Files:**
- Create: `src/screens/GroupScreen.tsx`

**Step 1: Create group screen**

`src/screens/GroupScreen.tsx`:
```typescript
import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { COLORS } from '../constants/theme';
import { getRandomMessage } from '../constants/messages';
import { useGroupMessages } from '../hooks/useGroupMessages';
import { CrazyButton } from '../components/CrazyButton';
import { MessageBubble } from '../components/MessageBubble';
import { ConfettiExplosion, ConfettiRef } from '../components/ConfettiExplosion';
import { Message } from '../types';

interface Props {
  groupId: string;
  groupName: string;
  isAnonymous: boolean;
  userId: string;
  buttonColor: string;
  buttonShape: 'circle' | 'square' | 'star' | 'heart';
  onBack: () => void;
}

export function GroupScreen({
  groupId,
  groupName,
  isAnonymous,
  userId,
  buttonColor,
  buttonShape,
  onBack,
}: Props) {
  const { messages, pressesRemaining, sendPress, toggleLike } = useGroupMessages(groupId, userId);
  const confettiRef = useRef<ConfettiRef>(null);

  const handlePress = useCallback(async () => {
    const randomMessage = getRandomMessage();
    const success = await sendPress(randomMessage.type, randomMessage.content);
    if (success) {
      confettiRef.current?.fire();
    }
  }, [sendPress]);

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => (
    <MessageBubble
      message={item}
      isAnonymous={isAnonymous}
      onLike={toggleLike}
      index={index}
    />
  ), [isAnonymous, toggleLike]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'<'}</Text>
        <Text style={styles.title}>{groupName}</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nog geen berichten! Druk op de knop! 🤪
          </Text>
        }
      />

      <CrazyButton
        color={buttonColor}
        shape={buttonShape}
        pressesRemaining={pressesRemaining}
        onPress={handlePress}
      />

      <ConfettiExplosion ref={confettiRef} />
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
    fontSize: 24,
    padding: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
```

**Step 2: Commit**

```bash
git add src/screens/GroupScreen.tsx
git commit -m "feat: add GroupScreen with message feed and crazy button"
```

---

### Task 9: Groups list screen

**Files:**
- Create: `src/screens/GroupsListScreen.tsx`
- Create: `src/screens/CreateGroupScreen.tsx`
- Create: `src/screens/JoinGroupScreen.tsx`

**Step 1: Create groups list screen**

`src/screens/GroupsListScreen.tsx`:
```typescript
import React from 'react';
import { StyleSheet, View, FlatList, Text, Pressable } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { COLORS, BUBBLE_COLORS } from '../constants/theme';
import { Group } from '../types';

interface Props {
  groups: Group[];
  loading: boolean;
  onSelectGroup: (group: Group) => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

export function GroupsListScreen({ groups, loading, onSelectGroup, onCreateGroup, onJoinGroup }: Props) {
  const renderGroup = ({ item, index }: { item: Group; index: number }) => {
    const color = BUBBLE_COLORS[index % BUBBLE_COLORS.length];
    return (
      <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
        <Pressable
          onPress={() => onSelectGroup(item)}
          style={[styles.groupCard, { borderColor: color }]}
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
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
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
```

**Step 2: Create group creation screen**

`src/screens/CreateGroupScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Switch } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  onCreate: (name: string, isAnonymous: boolean) => Promise<void>;
  onBack: () => void;
}

export function CreateGroupScreen({ onCreate, onBack }: Props) {
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim() || creating) return;
    setCreating(true);
    await onCreate(name.trim(), isAnonymous);
    setCreating(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'<'}</Text>
        <Text style={styles.title}>Nieuwe groep</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Groepsnaam</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="bv. Familie, Klas 6B..."
          placeholderTextColor={COLORS.textSecondary}
          autoFocus
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Anonieme berichten</Text>
            <Text style={styles.hint}>Niemand ziet wie op de knop drukte</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        <Pressable
          onPress={handleCreate}
          style={[styles.createButton, !name.trim() && styles.disabled]}
          disabled={!name.trim() || creating}
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Aanmaken...' : 'Groep aanmaken 🎉'}
          </Text>
        </Pressable>
      </View>
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
    fontSize: 24,
    padding: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: { width: 40 },
  form: {
    padding: 24,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
```

**Step 3: Create join group screen**

`src/screens/JoinGroupScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  onJoin: (code: string) => Promise<boolean>;
  onBack: () => void;
}

export function JoinGroupScreen({ onJoin, onBack }: Props) {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    if (!code.trim() || joining) return;
    setJoining(true);
    setError('');
    const success = await onJoin(code.trim());
    if (!success) {
      setError('Groep niet gevonden. Klopt de code?');
    }
    setJoining(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={onBack} style={styles.backButton}>{'<'}</Text>
        <Text style={styles.title}>Join een groep</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Uitnodigingscode</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(text) => { setCode(text); setError(''); }}
          placeholder="Plak de code hier..."
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          autoFocus
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleJoin}
          style={[styles.joinButton, !code.trim() && styles.disabled]}
          disabled={!code.trim() || joining}
        >
          <Text style={styles.joinButtonText}>
            {joining ? 'Joinen...' : 'Join groep 🚀'}
          </Text>
        </Pressable>
      </View>
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
    fontSize: 24,
    padding: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: { width: 40 },
  form: {
    padding: 24,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    letterSpacing: 2,
    textAlign: 'center',
  },
  error: {
    color: COLORS.accent1,
    textAlign: 'center',
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: COLORS.accent2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '600',
  },
});
```

**Step 4: Commit**

```bash
git add src/screens/
git commit -m "feat: add GroupsList, CreateGroup, and JoinGroup screens"
```

---

### Task 10: App entry point — wire screens together

**Files:**
- Modify: `App.tsx`

**Step 1: Create main App with navigation state**

`App.tsx`:
```typescript
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './src/hooks/useAuth';
import { useGroups } from './src/hooks/useGroups';
import { GroupsListScreen } from './src/screens/GroupsListScreen';
import { GroupScreen } from './src/screens/GroupScreen';
import { CreateGroupScreen } from './src/screens/CreateGroupScreen';
import { JoinGroupScreen } from './src/screens/JoinGroupScreen';
import { Group } from './src/types';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from './src/constants/theme';

type Screen = 'groups' | 'group' | 'create' | 'join';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { groups, loading: groupsLoading, createGroup, joinGroup } = useGroups(user?.id);
  const [currentScreen, setCurrentScreen] = useState<Screen>('groups');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Crazy Button laden... 🤪</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  switch (currentScreen) {
    case 'groups':
      return (
        <>
          <GroupsListScreen
            groups={groups}
            loading={groupsLoading}
            onSelectGroup={(group) => {
              setSelectedGroup(group);
              setCurrentScreen('group');
            }}
            onCreateGroup={() => setCurrentScreen('create')}
            onJoinGroup={() => setCurrentScreen('join')}
          />
          <StatusBar style="light" />
        </>
      );

    case 'group':
      if (!selectedGroup || !user) return null;
      return (
        <>
          <GroupScreen
            groupId={selectedGroup.id}
            groupName={selectedGroup.name}
            isAnonymous={selectedGroup.is_anonymous}
            userId={user.id}
            buttonColor={COLORS.primary}
            buttonShape="circle"
            onBack={() => setCurrentScreen('groups')}
          />
          <StatusBar style="light" />
        </>
      );

    case 'create':
      return (
        <>
          <CreateGroupScreen
            onCreate={async (name, isAnonymous) => {
              const group = await createGroup(name, isAnonymous);
              if (group) {
                setSelectedGroup(group);
                setCurrentScreen('group');
              }
            }}
            onBack={() => setCurrentScreen('groups')}
          />
          <StatusBar style="light" />
        </>
      );

    case 'join':
      return (
        <>
          <JoinGroupScreen
            onJoin={async (code) => {
              const success = await joinGroup(code);
              if (success) setCurrentScreen('groups');
              return success;
            }}
            onBack={() => setCurrentScreen('groups')}
          />
          <StatusBar style="light" />
        </>
      );
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 16,
    fontSize: 18,
  },
});
```

**Step 2: Verify app compiles**

```bash
npx expo start --no-dev --minify
```

Expected: No TypeScript or bundling errors.

**Step 3: Commit**

```bash
git add App.tsx
git commit -m "feat: wire up App with screen navigation"
```

---

### Task 11: Invite sharing (link + QR code)

**Files:**
- Create: `src/components/InviteShare.tsx`

**Step 1: Create invite sharing component**

`src/components/InviteShare.tsx`:
```typescript
import React from 'react';
import { StyleSheet, View, Text, Pressable, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/theme';

interface Props {
  inviteCode: string;
  groupName: string;
}

export function InviteShare({ inviteCode, groupName }: Props) {
  async function handleShare() {
    await Share.share({
      message: `Join mijn Crazy Button groep "${groupName}"! 🤪\n\nGebruik deze code: ${inviteCode}`,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nodig vrienden uit!</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={inviteCode}
          size={160}
          backgroundColor={COLORS.surface}
          color={COLORS.text}
        />
      </View>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Code:</Text>
        <Text style={styles.code}>{inviteCode}</Text>
      </View>

      <Pressable onPress={handleShare} style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Deel uitnodiging 📤</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginRight: 8,
  },
  code: {
    color: COLORS.accent3,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  shareButton: {
    backgroundColor: COLORS.accent2,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  shareButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/InviteShare.tsx
git commit -m "feat: add InviteShare component with QR code and share sheet"
```

---

### Task 12: Scoreboard screen

**Files:**
- Create: `src/screens/ScoreboardScreen.tsx`

**Step 1: Create scoreboard**

`src/screens/ScoreboardScreen.tsx`:
```typescript
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

    // Get messages from last 7 days with their likes
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

    // Aggregate by sender
    const scoreMap = new Map<string, ScoreEntry>();
    for (const msg of data as any[]) {
      const senderId = msg.sender_id;
      const likeCount = msg.likes?.[0]?.count ?? 0;
      const existing = scoreMap.get(senderId);

      if (existing) {
        existing.total_likes += likeCount;
        if (likeCount > 0 && (!existing.best_message || likeCount > 0)) {
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
        <Text onPress={onBack} style={styles.backButton}>{'<'}</Text>
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
    fontSize: 24,
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
```

**Step 2: Commit**

```bash
git add src/screens/ScoreboardScreen.tsx
git commit -m "feat: add Scoreboard screen with weekly rankings"
```

---

### Task 13: Integration test — full user flow

**Step 1: Start the app on a device/simulator**

```bash
npx expo start
```

**Step 2: Manual test checklist**

- [ ] App starts and shows loading screen
- [ ] Anonymous auth happens automatically
- [ ] Groups list screen appears (empty)
- [ ] Create a group "Test Groep"
- [ ] Group appears in list
- [ ] Open group — see empty message feed with button
- [ ] Press the Crazy Button — confetti explodes, bubble appears
- [ ] Message appears in feed
- [ ] Like a message — heart toggles
- [ ] Press button 10 times — counter reaches 0, button disabled
- [ ] Share invite code from group
- [ ] Open on second device, join with code
- [ ] Send message from device 2 — appears realtime on device 1

**Step 3: Fix any issues found during testing**

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration test fixes"
```

---

## Summary

| Task | What | Estimated Complexity |
|------|------|---------------------|
| 1 | Scaffold Expo project | Setup |
| 2 | Project structure, types, theme, messages | Foundation |
| 3 | Message generation tests | Tests |
| 4 | Supabase database schema | Backend |
| 5 | Auth hook | Auth |
| 6 | Group & message hooks | Core logic |
| 7 | CrazyButton, MessageBubble, Confetti | UI components |
| 8 | Group screen | Screen |
| 9 | Groups list, Create, Join screens | Screens |
| 10 | Wire up App navigation | Integration |
| 11 | Invite sharing (QR + link) | Feature |
| 12 | Scoreboard | Feature |
| 13 | Integration test | Verification |
