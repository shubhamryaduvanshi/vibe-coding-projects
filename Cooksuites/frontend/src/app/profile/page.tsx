'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { User, Mail, Calendar, Loader2, Save, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/store/api/api';

export default function ProfilePage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setEmail(res.data.data.email);
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setFetching(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const res = await api.put('/users/me', { email });
      
      // Update local storage and redux
      if (user && token) {
        dispatch(setCredentials({
          user: { ...user, email: res.data.data.email },
          token
        }));
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight">Your Profile</h1>
            <p className="text-zinc-500 mt-2">Manage your personal information and account settings.</p>
          </div>

          <Card className="border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden">
            <CardHeader className="bg-emerald-50/50 border-b border-zinc-100 p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-emerald-900">Account Details</CardTitle>
                  <p className="text-sm text-zinc-500">Update your email address</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdate} className="space-y-6">
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
                      required
                      className="pl-11 h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || email === user?.email}
                    className="h-12 px-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-200 transition-all"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden border-orange-100">
            <CardHeader className="bg-orange-50/50 border-b border-orange-100 p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <ShieldAlert className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-orange-900">Security & Roles</CardTitle>
                  <p className="text-sm text-orange-700/70">Your assigned permissions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-700 mb-2">Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.roles?.map((r, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-bold capitalize">
                        {r.role.name}
                      </span>
                    )) || <span className="text-sm text-zinc-500">No roles assigned</span>}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-zinc-700 mb-2 mt-6">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.permissions?.map((p, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
                        {p}
                      </span>
                    )) || <span className="text-sm text-zinc-500">No permissions</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
