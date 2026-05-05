'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';

/**
 * Hook to check if current user has a specific permission
 * @param permission - Permission string to check (e.g., 'recipe:create')
 * @returns boolean - true if user has permission, false otherwise
 */
export function usePermission(permission: string): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  
  if (!user) return false;
  
  // Admin bypass: if user has 'admin:manage' or 'admin' role
  const isAdmin = user.permissions?.includes('admin:manage') || 
                  user.roles?.some(r => r.role.name === 'admin');
                  
  if (isAdmin) return true;
  
  return user.permissions?.includes(permission) ?? false;
}

/**
 * Hook to check if user has ANY of the specified permissions
 * @param permissions - Array of permission strings
 * @returns boolean - true if user has at least one permission
 */
export function useAnyPermission(permissions: string[]): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  
  if (!user) return false;

  const isAdmin = user.permissions?.includes('admin:manage') || 
                  user.roles?.some(r => r.role.name === 'admin');
                  
  if (isAdmin) return true;
  
  return permissions.some(p => user.permissions?.includes(p));
}

/**
 * Hook to check if user has ALL of the specified permissions
 * @param permissions - Array of permission strings
 * @returns boolean - true if user has all permissions
 */
export function useAllPermissions(permissions: string[]): boolean {
  const user = useSelector((state: RootState) => state.auth.user);
  
  if (!user) return false;

  const isAdmin = user.permissions?.includes('admin:manage') || 
                  user.roles?.some(r => r.role.name === 'admin');
                  
  if (isAdmin) return true;
  
  return permissions.every(p => user.permissions?.includes(p));
}
