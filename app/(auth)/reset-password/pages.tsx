'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createClient, User, Session } from '@supabase/supabase-js';

interface UpdateUserWithTokenOptions {
    token: string;
    email?: string;
    password?: string;
    data?: object;
    email_confirm?: boolean;
    phone?: string;
    phone_confirm?: boolean;
}

const getSupabaseClient = () => {
    if (typeof window !== 'undefined') {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
            return createClient(supabaseUrl, supabaseKey);
        } else {
            console.error("Supabase URL or Key is missing!");
            return null;
        }
    }
    return null;
};

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    const supabaseClient = useRef<ReturnType<typeof getSupabaseClient>>(null); // Explicit type for useRef

    useEffect(() => {
        supabaseClient.current = getSupabaseClient();
    }, []);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setToken(token);
        }
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (supabaseClient.current) {
                const { data, error } = await (supabaseClient.current as ReturnType<typeof getSupabaseClient>).auth.updateUser( // Type assertion here
                    { password: password },
                    { token: token } as UpdateUserWithTokenOptions
                );
                if (error) {
                    setError(error.message || 'Could not reset password.');
                } else {
                    setSuccess(true);
                }
            } else {
                console.warn("Supabase client is not initialized.");
                setError("Could not connect to the server.");
            }


        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold">Password Reset Successful</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Your password has been reset. You can now login.
                        </p>
                        <Button onClick={() => router.push('/login')}>Go to Login</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Reset Password</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Enter your new password
                    </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500">{error}</div>}
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <Button className="w-full" disabled={isLoading}>
                        {isLoading ?
                            'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
