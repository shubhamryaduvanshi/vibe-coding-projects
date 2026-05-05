'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { Loader2, User as UserIcon, Calendar, Mail, Camera } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateUser } from '@/store/slices/authSlice';

const profileSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, and apostrophes are allowed'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    if (open && user) {
      form.reset({
        fullName: user.fullName || '',
      });
    }
  }, [open, user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await userService.updateProfile(values);
      if (res.success) {
        toast.success('Profile updated successfully');
        dispatch(updateUser(res.data));
        onOpenChange(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-zinc-100 p-0 overflow-hidden">
        <div className="bg-emerald-600 h-32 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-[2rem]">
             <div className="h-24 w-24 bg-emerald-50 rounded-[1.8rem] flex items-center justify-center border-4 border-white overflow-hidden group relative">
                {user?.fullName ? (
                  <span className="text-3xl font-black text-emerald-700">
                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                ) : (
                  <UserIcon className="h-12 w-12 text-emerald-200" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white mb-1" />
                  <span className="text-[8px] text-white font-bold uppercase tracking-tighter text-center px-2">Image upload coming soon</span>
                </div>
             </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-emerald-900">User Profile</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Manage your personal information and preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-3 w-3 text-zinc-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email</span>
                </div>
                <p className="text-sm font-bold text-emerald-900 truncate">{user?.email}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Joined</span>
                </div>
                <p className="text-sm font-bold text-emerald-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. John Doe" 
                          className="rounded-xl border-zinc-200 h-12 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4 gap-3 sm:gap-0">
                   <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl h-12 font-bold text-zinc-500"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !isDirty}
                    className="flex-grow sm:flex-none sm:min-w-[140px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-12 font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>

        {/* TODO: Implement profile image upload functionality */}
      </DialogContent>
    </Dialog>
  );
}
