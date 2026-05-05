'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '@/store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  redirectTo = '/dashboard'
}) => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && requiredPermission) {
      const hasPermission = user?.permissions?.includes(requiredPermission) || 
                            user?.roles?.some(r => r.role.name === 'admin'); // Admins bypass or implicitly have it
                            
      if (!hasPermission) {
        router.push(redirectTo);
      }
    }
  }, [loading, isAuthenticated, user, requiredPermission, router, redirectTo]);

  if (loading || (!isAuthenticated && pathname !== '/login' && pathname !== '/register')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // If a specific permission is required, double check before rendering children
  if (requiredPermission) {
    const hasPermission = user?.permissions?.includes(requiredPermission) || 
                          user?.roles?.some(r => r.role.name === 'admin');
    if (!hasPermission) return null;
  }

  return <>{children}</>;
};
