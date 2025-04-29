'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface UpdateUserWithTokenOptions {
    token: string;
    password?: string;
}

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');
        setToken(token);

        // Initialize Supabase client only on the client-side
        if (typeof window !== 'undefined') {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (supabaseUrl && supabaseKey) {
                setSupabaseClient(createClient(supabaseUrl, supabaseKey));
            } else {
                console.error('Supabase URL or Key is missing!');
                setError('Supabase configuration error.');
            }
        }
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError(null);

        if (!supabaseClient || !token) {
            console.warn('Supabase client not initialized or token missing.');
            setError('Unable to reset password at this time.');
            setIsLoading(false);
            return;
        }

        try {
            const { error: supabaseError } = await supabaseClient.auth.updateUser(
                { password },
                { token } as UpdateUserWithTokenOptions // Ensure correct type for options
            );

            if (supabaseError) {
                setError(supabaseError.message || 'Could not reset password.');
            } else {
                setSuccess(true);
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
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
