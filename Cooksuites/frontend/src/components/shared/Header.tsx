'use client';

import React from 'react';
import { Menu as MenuIcon, Bell as BellIcon, LogOut as LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { ProfileDialog } from './ProfileDialog';
import { User as UserIcon, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export function Header({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <header className="md:ml-64 bg-white border-b border-zinc-200 h-16 fixed top-0 right-0 left-0 z-40 flex justify-between items-center px-6 md:px-12">
      <div className="flex items-center gap-4 flex-grow max-w-2xl">
        <MenuIcon className="md:hidden h-6 w-6 text-zinc-500 cursor-pointer" />
        {children}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-zinc-500 hover:bg-zinc-50 p-2 rounded-full transition-colors active:opacity-80 cursor-pointer">
          <BellIcon className="h-6 w-6" />
        </button>
        <button
          onClick={() => setIsProfileOpen(true)}
          className="text-zinc-500 hover:bg-zinc-50 p-2 rounded-full transition-colors active:opacity-80 cursor-pointer text-sm font-medium flex items-center gap-1"
          title="Profile Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button onClick={handleLogout} className="text-zinc-500 hover:bg-zinc-50 p-2 rounded-full transition-colors active:opacity-80 cursor-pointer text-sm font-medium flex items-center gap-1" title="Logout">
          <LogOutIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsProfileOpen(true)}
          className="h-10 w-10 rounded-2xl overflow-hidden border-2 border-emerald-100 bg-emerald-50 flex items-center justify-center hover:border-emerald-300 transition-all active:scale-95 cursor-pointer"
        >
          {user?.fullName ? (
            <span className="text-xs font-black text-emerald-700">
              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          ) : (
            <UserIcon className="h-5 w-5 text-emerald-300" />
          )}
        </button>
      </div>

      <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </header>
  );
}
