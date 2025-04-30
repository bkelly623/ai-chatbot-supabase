import { SupabaseClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type MessageRole = 'system' | 'user' | 'assistant';

export type Message = {
  id: string;
  created_at: string;
  content: string;
  role: MessageRole;
  chat_id: string;
};

export type Document = {
  id: string;
  created_at: string;
  content: string;
  chat_id: string;
};

export type Suggestion = {
  id: string;
  created_at: string;
  content: string;
  document_id: string;
};

export type Vote = {
  id: string;
  created_at: string;
  suggestion_id: string;
  is_upvote: boolean;
};

export type Client = SupabaseClient<Database>;

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string;
          id: string;
          messages: Message[];
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          messages: Message[];
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          messages?: Message[];
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chats_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Document>;
        Relationships: [];
      };
      suggestions: {
        Row: Suggestion;
        Insert: Omit<Suggestion, 'id' | 'created_at'>;
        Update: Partial<Suggestion>;
        Relationships: [];
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, 'id' | 'created_at'>;
        Update: Partial<Vote>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
        };
        Update: {
          user_id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
