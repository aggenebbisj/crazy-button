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
  content_type: 'text' | 'emoji' | 'sound' | 'gif' | 'sticker';
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
