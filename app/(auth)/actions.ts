'use server';

import { z } from 'zod';

import { getUser } from '@/db/cached-queries';
import { createClient } from '@/lib/supabase/server';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.pick({ email: true, password: true }).parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return { status: 'failed' };
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  try {
    const supabase = await createClient();

    // Check if user exists
    const existingUser = await getUser(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Sign up new user
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          firstName: firstName,
          lastName: lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    });

    // We no longer call supabase.auth.signUp directly here
    await signUp(validatedData.email, validatedData.password, validatedData.firstName, validatedData.lastName);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    } else if (error instanceof Error && error.message === 'User already exists') {
      return { status: 'user_exists' };
    } else {
      return { status: 'failed' };
    }
  }
};
