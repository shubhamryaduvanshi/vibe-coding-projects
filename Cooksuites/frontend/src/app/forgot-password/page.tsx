'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl p-8 border border-zinc-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-black text-emerald-900 mb-2">Forgot Password?</h1>
          <p className="text-zinc-500 text-sm">
            No worries! Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-100">
              If an account exists for {email}, a password reset link has been sent. Please check your inbox.
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-zinc-700 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="pl-11 h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
