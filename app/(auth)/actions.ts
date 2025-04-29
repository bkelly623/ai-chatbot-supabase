'use server';

import { z } from 'zod';

import { getUser } from '@/db/cached-queries';
import { createClient } from '@/lib/supabase/server';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2).max(50), // Added validation for first name
  lastName: z.string().min(2).max(50),  // Added validation for last name
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.pick({ email: true, password: true }).parse({ // Only validate email and password for login
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

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),  // Get first name from form
      lastName: formData.get('lastName'),    // Get last name from form
    });

    const supabase = await createClient();

    // Check if user exists
    const existingUser = await getUser(validatedData.email);
    if (existingUser) {
      return { status: 'user_exists' };
    }

    // Sign up new user
    const { error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {  // Store first and last name in user_metadata
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
        },
      },
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
