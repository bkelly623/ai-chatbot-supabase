import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import {
  getChatByIdQuery,
  getUserQuery,
  getChatsByUserIdQuery,
  getMessagesByChatIdQuery,
  getVotesByChatIdQuery,
  getDocumentByIdQuery,
  getDocumentsByIdQuery,
  getSuggestionsByDocumentIdQuery,
  getSessionQuery,
  getUserByIdQuery,
  getChatWithMessagesQuery,
  getChatsByProjectIdQuery,
  getProjectByIdQuery,
} from '@/db/queries';

const getSupabase = cache(() => createClient());

export const getSession = async () => {
  const supabase = await getSupabase();
  return unstable_cache(
    () => getSessionQuery(supabase),
    ['session'],
    {
      tags: ['session'],
      revalidate: 5,
    }
  )();
};

export const getUser = async (email: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getUserQuery, ['user', email], {
    tags: ['user'],
    revalidate: 60,
  })(supabase, email);
};

export const getUserById = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getUserByIdQuery, ['user_by_id', id], {
    tags: ['user_by_id'],
    revalidate: 60,
  })(supabase, id);
};

export const getChatById = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getChatByIdQuery, ['chat', id], {
    tags: ['chat'],
    revalidate: 5,
  })(supabase, { id });
};

export const getChatWithMessages = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getChatWithMessagesQuery, ['chat_with_messages', id], {
    tags: ['chat', 'messages'],
    revalidate: 5,
  })(supabase, { id });
};

export const getMessagesByChatId = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getMessagesByChatIdQuery, ['messages', id], {
    tags: ['messages'],
    revalidate: 5,
  })(supabase, { id });
};

export const getChatsByUserId = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getChatsByUserIdQuery, ['chats', id], {
    tags: ['chats'],
    revalidate: 5,
  })(supabase, { id });
};

export const getVotesByChatId = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getVotesByChatIdQuery, ['votes', id], {
    tags: ['votes'],
    revalidate: 5,
  })(supabase, { id });
};

export const getDocumentById = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getDocumentByIdQuery, ['document', id], {
    tags: ['document'],
    revalidate: 5,
  })(supabase, { id });
};

export const getDocumentsById = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(getDocumentsByIdQuery, ['documents', id], {
    tags: ['documents'],
    revalidate: 5,
  })(supabase, { id });
};

export const getSuggestionsByDocumentId = async (documentId: string) => {
  const supabase = await getSupabase();
  return unstable_cache(
    getSuggestionsByDocumentIdQuery,
    ['suggestions', documentId],
    {
      tags: ['suggestions'],
      revalidate: 5,
    }
  )(supabase, { documentId });
};

export const getChatsByProjectId = async (projectId: string) => {
  const supabase = await getSupabase();

  return unstable_cache(
    async () => {
      return getChatsByProjectIdQuery(supabase, { projectId });
    },
    ['chats_by_project', projectId],
    {
      tags: [`project_${projectId}_chats`],
      revalidate: 10, // Cache for 10 seconds
    }
  )();
};

export const getProjectById = async (id: string) => {
  const supabase = await getSupabase();
  return unstable_cache(
    async () => {
      return getProjectByIdQuery(supabase, { id });
    },
    ['project', id],
    {
      tags: ['project'],
      revalidate: 5,
    }
  )();
};
