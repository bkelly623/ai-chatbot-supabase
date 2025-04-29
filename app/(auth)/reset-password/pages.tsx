'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

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
      const supabase = createClient();

      // Try to sign in with the token (this might set the user's session)
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '', // Refresh token is not usually needed here
      });

      if (sessionError) {
        setError(sessionError.message || 'Invalid reset link.');
        return;
      }

      // If session is set (or if the above isn't the correct method, try updateUser directly)
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || 'Could not reset password.');
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
      <div className="flex ...">
        <div className="...">
          <div className="...">
            <h1 className="...">Password Reset Successful</h1>
            <p className="...">Your password has been reset. You can now login.</p>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex ...">
      <div className="...">
        <div className="...">
          <h1 className="...">Reset Password</h1>
          <p className="...">Enter your new password</p>
        </div>
        <form className="..." onSubmit={handleSubmit}>
          {error && <div className="...">{error}</div>}
          <div className="...">
            <Label htmlFor="password">New Password</Label>
            <Input ... />
          </div>
          <div className="...">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input ... />
          </div>
          <Button className="..." disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
